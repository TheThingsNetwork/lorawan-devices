function isKthBitSet(byte, k) {
  return byte & (1 << k);
}

uint16.BYTES = 2;
uint32.BYTES = 4;

function uint16(bytes) {
  if (bytes.length !== uint16.BYTES) {
    throw new Error('uint16 must have exactly 2 bytes');
  }

  let integer = 0;
  for (let x = 0; x < bytes.length; x++) {
    integer += integer*255 + bytes[x];
  }
  return integer;
};

function uint32(bytes) {
  if (bytes.length !== uint32.BYTES) {
    throw new Error('uint32 must have exactly 4 bytes');
  }

  let integer = 0;
  for (let x = 0; x < bytes.length; x++) {
    integer += integer*255 + bytes[x];
  }
  return integer;
};

/**
 * Converts a list of bytes to combined string
 * representation
 *
 * @param bytes - A list of bytes
 * @returns bit_string - combined bits string
 *
 * @example [0, 1, 255] => "000000000000000111111111"
 */
function bytesToBitsString(bytes) {

  let bits_string = "";

  bytes.forEach(byte => {
    bits_string += byte.toString(2).padStart(8, "0");
  });
  return bits_string;
}

const commands = new Map();

function registerCommand(
  registred_commands_map,
  fport, command_name, cmd_id,
  parsePayload = undefined
) {

  if (fport < 1 || fport > 255){
    throw "fport must be between 1 and 255";
  }

  if (cmd_id < 0 || cmd_id > 254){
    throw "cmd_id must be between 0 and 254";
  }

  const fport_hex = fport.toString(16).padStart(2, '0');
  const cmd_id_hex = cmd_id.toString(16).padStart(2, '0');

  const key = fport_hex + cmd_id_hex;

  registred_commands_map.set(key, {
    command_name: command_name,
    parsePayload: parsePayload
  });
}

function getCommand(
  registred_commands_map, fport, cmd_id
) {
  const fport_hex = fport.toString(16).padStart(2, '0');
  const cmd_id_hex = cmd_id.toString(16).padStart(2, '0');

  const key = fport_hex + cmd_id_hex;
  const command = registred_commands_map.get(key);

  if (!command){
    throw new Error("command not registered");
  }

  return command;
}

function parseHeader(bytes) {
  const header = {};

  if (bytes[0] === 255){
    header.cmd_id = bytes[1];
    header.ack = (bytes[2] === 255 ? false : true);
    header.type = "acknowledge";
  } else {
    header.cmd_id = bytes[0];
    header.ack = true;
    header.type = "response";
  }

  return header;
}

function decodeFlags(flagByte) {
  const flags = {};

  if (isKthBitSet(flagByte, 0)) flags.STOPPED = 1;
  if (isKthBitSet(flagByte, 1)) flags.STUCK = 1;
  if (isKthBitSet(flagByte, 2)) flags.WIFI_ACCESS_POINT_ON = 1;
  if (isKthBitSet(flagByte, 3)) flags.WARMUP = 1;

  return flags;
}

function decodeZoneOccupancy(byte) {
  return byte === 255 ? "not set" : byte;
}

function parseMountingHeight(payload) {
  return { mounting_height: uint16(payload.slice(0, 2)) };
}

function parsePushPeriod(payload) {
  return { push_period_s: uint32(payload.slice(0, 4)) };
}

function parseAnalogOutput(payload){
  const data = {
    state: (payload.slice(0, 1) == 1 ? "ENABLED" : "DISABLED"),
    max_occupancy: uint16(payload.slice(1, 3))
  };
  return data;
}

function parseDeviceUseCase(payload){

  const use_case = payload.slice(0, 1)[0];

  let device_use_case;

  switch (use_case){
    case 0:
      device_use_case = "open space";
      break;
    case 1:
      device_use_case = "installation mode";
      break;
    case 2:
      device_use_case = "meeting room";
      break;
    case 3:
      device_use_case = "waiting lounge";
      break;
    case 4:
      device_use_case = "work office";
      break;
    case 5:
      device_use_case = "point of sale";
      break;
    default:
      device_use_case = "not recognized";
  }

  const data = {
    device_use_case: device_use_case
  };
  return data;
}

function parseSoftwareVersion(payload){
  const data = {
    software_version: String.fromCharCode(...payload.slice(1, 11)).slice(0, -1)
  };
  return data;
}

function parseLoRaModuleVersion(payload){

  let lora_module_version = String.fromCharCode(...payload.slice(0, 10));

  if (payload[0] === 255 && payload[1] === 255 && payload[2] === 255){
    lora_module_version = "failure to retrieve";
  }

  const data = {
    lora_module_version: lora_module_version
  };

  return data;
}

function parseDeviceType(payload){

  let device_type = String.fromCharCode(...payload.slice(0, 3));

  if (device_type === "XXX"){
    device_type = "not recognized";
  }

  const data = {
    device_type: device_type
  };

  return data;
}

function parseAccessPointState(payload){
  const data = {
    state: (payload.slice(0) == 1 ? "ENABLED" : "DISABLED")
  };
  return data;
}

function parseActiveZones(payload){
  const data = {
    "zone_0": false,
    "zone_1": false,
    "zone_2": false,
    "zone_3": false,
    "zone_4": false,
    "zone_5": false,
    "zone_6": false,
    "zone_7": false
  };

  for (let zone in payload){
    data["zone_"+zone] = true;
  }

  return data;
}

function getZoneType(map, zone_type){
  if (map.has(zone_type)){
    return map.get(zone_type);
  } else {
    return false;
  }
}

function parseZoneCoordinates(payload){

  const zone_types = new Map([
    [2, 'rectangle']
  ]);

  let bit_string = bytesToBitsString(payload.slice(0, 6));

  const zone_type = getZoneType(
    zone_types,
    parseInt(bit_string.substring(0, 4), 2)
  );

  const zone_id = parseInt(bit_string.substring(4, 7), 2);

  let data;

  if (!zone_type){
    data = {
      type: "not supported",
      zone_id: zone_id
    };

    return data;
  }

  data = {
    type: zone_type,
    zone_id: zone_id,
    point_1: [
      parseInt(bit_string.substring(7, 17), 2),
      parseInt(bit_string.substring(17, 27), 2)
    ],
    point_2: [
      parseInt(bit_string.substring(27, 37), 2),
      parseInt(bit_string.substring(37, 47), 2)
    ]
  };

  return data;
}


/* UPLINKS WITH CUSTOM FRAME STRUCTURE */
const COUNTING_DATA_UPLINK = 83;
/* UPLINKS WITH CUSTOM FRAME STRUCTURE END */

const F_PORT_OCCUPANCY_MANAGEMENT = 101;
/* HANDLER GROUP OCCUPANCY MANAGEMENT COMMANDS */
registerCommand(commands, F_PORT_OCCUPANCY_MANAGEMENT, "CMD_SET_OCCUPANCY_ZONE", 129);
registerCommand(commands, F_PORT_OCCUPANCY_MANAGEMENT, "CMD_SET_EXCLUDING_ZONE", 130);
registerCommand(commands, F_PORT_OCCUPANCY_MANAGEMENT, "CMD_DELETE_OCCUPANCY_ZONE", 131);
registerCommand(commands, F_PORT_OCCUPANCY_MANAGEMENT, "CMD_GET_ACTIVE_ZONES", 1,
  parseActiveZones
);
registerCommand(commands, F_PORT_OCCUPANCY_MANAGEMENT, "CMD_GET_OCCUPANCY_ZONE_COORDINATES", 2,
  parseZoneCoordinates
);
registerCommand(commands, F_PORT_OCCUPANCY_MANAGEMENT, "CMD_GET_EXCLUDING_ZONE_COORDINATES", 3,
  parseZoneCoordinates
);
/* HANDLER GROUP OCCUPANCY MANAGEMENT END */

const F_PORT_DEVICE_PARAM = 100;
/* HANDLER GROUP DEVICE PARAMETERS COMMANDS */
registerCommand(commands, F_PORT_DEVICE_PARAM, "CMD_GET_HEIGHT", 1,
  parseMountingHeight
);
registerCommand(commands, F_PORT_DEVICE_PARAM, "CMD_SET_HEIGHT", 129);

registerCommand(commands, F_PORT_DEVICE_PARAM, "CMD_SET_DEVICE_USE_CASE", 133);
registerCommand(commands, F_PORT_DEVICE_PARAM, "CMD_GET_DEVICE_USE_CASE", 5,
  parseDeviceUseCase
);

registerCommand(commands, F_PORT_DEVICE_PARAM, "CMD_GET_PUSH_PERIOD", 3,
  parsePushPeriod
);
registerCommand(commands, F_PORT_DEVICE_PARAM, "CMD_SET_PUSH_PERIOD", 131);
/* HANDLER GROUP DEVICE PARAMETERS END */

const F_PORT_REBOOT = 3;
/* HANDLER GROUP REBOOT COMMANDS */
registerCommand(commands, F_PORT_REBOOT, "CMD_DEVICE_REBOOT", 1);
/* HANDLER GROUP REBOOT END */

const F_PORT_GET_SOFTWARE_VERSION = 4;
/* HANDLER GROUP GET SOFTWARE VERSION COMMANDS */
registerCommand(commands, F_PORT_GET_SOFTWARE_VERSION, "CMD_GET_SW_VER", 138,
  parseSoftwareVersion
);
registerCommand(commands, F_PORT_GET_SOFTWARE_VERSION, "CMD_GET_DEVICE_TYPE", 128,
  parseDeviceType
);
registerCommand(commands, F_PORT_GET_SOFTWARE_VERSION, "CMD_GET_LORA_MODULE_VERSION", 139,
  parseLoRaModuleVersion
);
/* HANDLER GROUP GET SOFTWARE VERSION END */

const F_PORT_ACCESS_POINT = 5;
/* HANDLER GROUP ACCESS POINT COMMANDS */
registerCommand(commands, F_PORT_ACCESS_POINT, "CMD_GET_ACCESS_POINT_STATE", 1,
  parseAccessPointState
);
registerCommand(commands, F_PORT_ACCESS_POINT, "CMD_SET_ACCESS_POINT_STATE", 129);
/* HANDLER GROUP ACCESS POINT END */

const F_PORT_REJOIN = 6;
/* HANDLER GROUP REJOIN COMMANDS */
registerCommand(commands, F_PORT_REJOIN, "CMD_FORCE_REJOIN", 1);
/* HANDLER GROUP REJOIN END */

const F_PORT_ANALOG_OUTPUT = 8;
/* HANDLER GROUP ANALOG OUTPUT COMMANDS */
registerCommand(commands, F_PORT_ANALOG_OUTPUT, "CMD_GET_ANALOG_OUTPUT", 1,
  parseAnalogOutput
);
registerCommand(commands, F_PORT_ANALOG_OUTPUT, "CMD_SET_ANALOG_OUTPUT", 129);
/* HANLDER GROUP ANALOG OUTPUT END */

function decodeUplink(input) {

  const data = new Object();
  const fport = input.fPort;

  if (fport === COUNTING_DATA_UPLINK) {
    data.flags = decodeFlags(input.bytes[0]);
    data.zone_global = input.bytes[1];
    data.zone_0 = decodeZoneOccupancy(input.bytes[2]);
    data.zone_1 = decodeZoneOccupancy(input.bytes[3]);
    data.zone_2 = decodeZoneOccupancy(input.bytes[4]);
    data.zone_3 = decodeZoneOccupancy(input.bytes[5]);
    data.zone_4 = decodeZoneOccupancy(input.bytes[6]);
    data.zone_5 = decodeZoneOccupancy(input.bytes[7]);
    data.zone_6 = decodeZoneOccupancy(input.bytes[8]);
    data.zone_7 = decodeZoneOccupancy(input.bytes[9]);

    return {
      data
    };
  }

  const header = parseHeader(input.bytes);

  let command;
  try {
    command = getCommand(commands, fport, header.cmd_id);
  } catch (e) {
    return {
      errors: [e]
    };
  }

  data.cmd = {
      name: command.command_name,
      id: header.cmd_id,
      success: header.ack
  };

  if (header.type === "response") {
    const payload = input.bytes.slice(1);
    data.cmd.value = command.parsePayload(payload);
  }

  return {
    data
  };

}
