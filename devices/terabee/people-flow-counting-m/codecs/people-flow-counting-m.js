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
  var flags = new Object();

  if (isKthBitSet(flagByte, 0))
    flags.TPC_STOPPED = 1;

  if (isKthBitSet(flagByte, 1))
    flags.TPC_STUCK = 1;

  if (isKthBitSet(flagByte, 2))
    flags.NETWORK_ON = 1;

  return flags;
}

function parseCounts(payload){
  const data = {
    count_in: uint32(payload.slice(0, 4)),
    count_out: uint32(payload.slice(4, 8))
  };
  return data;
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

function parseCountDirection(payload){
  const data = {
    direction: (payload.slice(0) == 1 ? "IN" : "OUT")
  };
  return data;
}

function parseCablePosition(payload){
  const data = {
    cable_position: (payload.slice(0) == 1 ? "LEFT" : "RIGHT")
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








/* The Things Network Payload Decoder
  Converts raw bytes to ouptut object

 * input object
 *   {
 *     "bytes": [1, 2, 3], // FRMPayload as byte array
 *     "fPort": 1 // LoRaWAN FPort
 *   }
 *  output object
 *    {
 *      "data": { ... }, // JSON object
 *      "warnings": ["warning 1", "warning 2"], // Optional warnings
 *      "errors": ["error 1", "error 2"] // Optional errors
 *    }
 *
*/

/* HANDLERS BY FPORT

*
*
*

*/

/* UPLINKS WITH CUSTOM FRAME STRUCTURE */
const COUNTING_DATA_UPLINK = 82;
/* UPLINKS WITH CUSTOM FRAME STRUCTURE END */


const F_PORT_COUNTS = 2;
/* HANDLER GROUP COUNTS COMMANDS */
registerCommand(commands, F_PORT_COUNTS, "CMD_CNT_RST", 1);
registerCommand(commands, F_PORT_COUNTS, "CMD_CNT_GET", 2,
  parseCounts
);
registerCommand(commands, F_PORT_COUNTS, "CMD_CNT_SET", 130);
/* HANDLER GROUP COUNTS END */

const F_PORT_REBOOT = 3;
/* HANDLER GROUP REBOOT COMMANDS */
registerCommand(commands, F_PORT_REBOOT, "CMD_DEVICE_REBOOT", 1);
registerCommand(commands, F_PORT_REBOOT, "CMD_TPC_RST", 2);
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

const F_PORT_COUNTING_PARAM = 100;
/* HANDLER GROUP COUNTING PARAMETERS COMMANDS */
registerCommand(commands, F_PORT_COUNTING_PARAM, "CMD_SET_HEIGHT", 129);
registerCommand(commands, F_PORT_COUNTING_PARAM, "CMD_GET_HEIGHT", 1,
  parseMountingHeight
);

registerCommand(commands, F_PORT_COUNTING_PARAM, "CMD_SET_COUNTING_DIRECTION", 130);
registerCommand(commands, F_PORT_COUNTING_PARAM, "CMD_GET_COUNTING_DIRECTION", 2,
  parseCountDirection
);
registerCommand(commands, F_PORT_COUNTING_PARAM, "CMD_SET_PUSH_PERIOD", 131);
registerCommand(commands, F_PORT_COUNTING_PARAM, "CMD_GET_PUSH_PERIOD", 3,
  parsePushPeriod
);
registerCommand(commands, F_PORT_COUNTING_PARAM, "CMD_SET_CABLE_CONNECTION", 132);
registerCommand(commands, F_PORT_COUNTING_PARAM, "CMD_GET_CABLE_CONNECTION", 4,
  parseCablePosition
);
/* HANDLER GROUP COUNTING PARAMETERS END */

function decodeUplink(input) {

  const data = new Object();
  const fport = input.fPort;

  if (fport === COUNTING_DATA_UPLINK){
    data.count_in = uint32(input.bytes.slice(0, 4));
    data.count_out = uint32(input.bytes.slice(4, 8));
    data.flags = decodeFlags(input.bytes[8]);

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
      errors: [e.message]
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

