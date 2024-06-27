function isKthBitSet(byte, k) {
  return byte & (1 << k);
}

function bytesToBitsString(bytes) {
  let bits_string = "";
  bytes.forEach(byte => {
    bits_string += byte.toString(2).padStart(8, "0");
  });
  return bits_string;
}

X_PACK_SIZE = 7;
Y_PACK_SIZE = 6;

function Coordinate(x, y) {
  this.x = x;
  this.y = y;
}

function bitsStringToXYpoints(bit_string) {
  let points = new Array();
  let padding_length = bit_string.length % (X_PACK_SIZE + Y_PACK_SIZE);
  bit_string = bit_string.slice(padding_length);
  let nb_of_points = Math.floor(bit_string.length / (X_PACK_SIZE + Y_PACK_SIZE));

  for (let i = 0; i < nb_of_points; i++) {
    let x = bit_string.slice(
      (X_PACK_SIZE + Y_PACK_SIZE) * i,
      (X_PACK_SIZE + Y_PACK_SIZE) * i + X_PACK_SIZE
    );
    let y = bit_string.slice(
      (X_PACK_SIZE + Y_PACK_SIZE) * i + X_PACK_SIZE,
      (X_PACK_SIZE + Y_PACK_SIZE) * (i + 1)
    );
    points.push(new Coordinate(parseInt(x, 2), parseInt(y, 2)));
  }
  return points;
}

function uint32(bytes) {
  if (bytes.length !== uint32.BYTES) {
    throw new Error('uint32 must have exactly 4 bytes');
  }
  let integer = 0;
  for (let x = 0; x < bytes.length; x++) {
    integer = (integer << 8) + bytes[x];
  }
  return integer;
}
uint32.BYTES = 4;

function uint16(bytes) {
  if (bytes.length !== uint16.BYTES) {
    throw new Error('uint16 must have exactly 2 bytes');
  }
  let integer = 0;
  for (let x = 0; x < bytes.length; x++) {
    integer = (integer << 8) + bytes[x];
  }
  return integer;
}
uint16.BYTES = 2;

function decodeFlags(flagByte) {
  return {
    TPC_STOPPED: isKthBitSet(flagByte, 0) ? 1 : 0,
    TPC_STUCK: isKthBitSet(flagByte, 1) ? 1 : 0,
    MULTI_DEV_ISSUE: isKthBitSet(flagByte, 2) ? 1 : 0,
    WIFI_AP_ENABLED: isKthBitSet(flagByte, 3) ? 1 : 0
  };
}

function parseHeader(bytes) {
  let header = {};
  if (bytes[0] === 255) {
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

const commands = new Map();

function registerCommand(registred_commands_map, fport, command_name, cmd_id, parsePayload = undefined) {
  if (fport < 1 || fport > 255) throw "fport must be between 1 and 255";
  if (cmd_id < 0 || cmd_id > 254) throw "cmd_id must be between 0 and 254";
  
  let fport_hex = fport.toString(16).padStart(2, '0');
  let cmd_id_hex = cmd_id.toString(16).padStart(2, '0');
  let key = fport_hex + cmd_id_hex;
  
  registred_commands_map.set(key, {
    command_name: command_name,
    parsePayload: parsePayload
  });
}

function getCommand(registred_commands_map, fport, cmd_id) {
  let fport_hex = fport.toString(16).padStart(2, '0');
  let cmd_id_hex = cmd_id.toString(16).padStart(2, '0');
  let key = fport_hex + cmd_id_hex;
  let command = registred_commands_map.get(key);
  if (!command) throw "command not registered";
  return command;
}

function parseCounts(payload) {
  let data = {
    count_in: uint32(payload.slice(0, 4)),
    count_out: uint32(payload.slice(4, 8))
  };
  return data;
}

function parseCountDirection(payload) {
  let data = {
    direction: (payload[0] === 1 ? "reversed" : "normal")
  };
  return data;
}

function parseAccessPointState(payload) {
  let data = {
    state: (payload[0] === 1 ? "enabled" : "disabled")
  };
  return data;
}

function parseMountingHeight(payload) {
  let data = {
    mounting_height: uint16(payload.slice(0, 2))
  };
  return data;
}

function parsePushPeriod(payload) {
  let data = {
    push_period_min: uint16(payload.slice(0, 2))
  };
  return data;
}

function parseSoftwareVersion(payload) {
  let data = {
    software_version: `${payload[0]}.${payload[1]}.${payload[2]}`
  };
  return data;
}

function parseCountAreaPoints(payload) {
  let nb_of_points = payload[0];
  let points_bytes = payload.slice(1);
  let points_bit_string = bytesToBitsString(points_bytes);

  let point_size = X_PACK_SIZE + Y_PACK_SIZE;
  let expected_bytes_count = Math.ceil((nb_of_points * point_size) / 8);

  if (points_bytes.length != expected_bytes_count) {
    throw "Couldn't decode area payload: Inconsistent number of points";
  }

  let data = {
    nb_of_points: nb_of_points,
    points: bitsStringToXYpoints(points_bit_string)
  };
  return data;
}

const COUNTING_DATA_UPLINK = 1;
const F_PORT_GET_AREA = 101;

const F_PORT_COUNTS = 2;
registerCommand(commands, F_PORT_COUNTS, "CMD_CNT_RST", 1);
registerCommand(commands, F_PORT_COUNTS, "CMD_CNT_GET", 2, parseCounts);
registerCommand(commands, F_PORT_COUNTS, "CMD_CNT_SET", 130);

const F_PORT_REBOOT = 3;
registerCommand(commands, F_PORT_REBOOT, "CMD_DEV_RBT", 1);
registerCommand(commands, F_PORT_REBOOT, "CMD_TPC_RST", 2);

const F_PORT_GET_SOFTWARE_VERSION = 4;
registerCommand(commands, F_PORT_GET_SOFTWARE_VERSION, "CMD_GET_VER_PEOPLE_COUNTING", 1, parseSoftwareVersion);
registerCommand(commands, F_PORT_GET_SOFTWARE_VERSION, "CMD_GET_VER_WEB_GUI", 2, parseSoftwareVersion);
registerCommand(commands, F_PORT_GET_SOFTWARE_VERSION, "CMD_GET_VER_LORA_AGENT", 3, parseSoftwareVersion);
registerCommand(commands, F_PORT_GET_SOFTWARE_VERSION, "CMD_GET_VER_ACCESS_POINT", 4, parseSoftwareVersion);
registerCommand(commands, F_PORT_GET_SOFTWARE_VERSION, "CMD_GET_VER_UPDATER_WEB_GUI", 5, parseSoftwareVersion);
registerCommand(commands, F_PORT_GET_SOFTWARE_VERSION, "CMD_GET_VER_FAN_SERVICE", 6, parseSoftwareVersion);

const F_PORT_ACCESS_POINT = 5;
registerCommand(commands, F_PORT_ACCESS_POINT, "CMD_GET_AP_STATE", 1, parseAccessPointState);
registerCommand(commands, F_PORT_ACCESS_POINT, "CMD_SET_AP_STATE", 129);

const F_PORT_REJOIN = 6;
registerCommand(commands, F_PORT_REJOIN, "CMD_FORCE_REJOIN", 1);

const F_PORT_TIME_SYNC = 7;
registerCommand(commands, F_PORT_TIME_SYNC, "CMD_FORCE_TIME_SYNC", 1);

const F_PORT_COUNTING_PARAM = 100;
registerCommand(commands, F_PORT_COUNTING_PARAM, "CMD_GET_HEIGHT", 1, parseMountingHeight);
registerCommand(commands, F_PORT_COUNTING_PARAM, "CMD_SET_HEIGHT", 129);
registerCommand(commands, F_PORT_COUNTING_PARAM, "CMD_GET_REVERSE", 2, parseCountDirection);
registerCommand(commands, F_PORT_COUNTING_PARAM, "CMD_SET_REVERSE", 130);
registerCommand(commands, F_PORT_COUNTING_PARAM, "CMD_GET_PERIOD", 3, parsePushPeriod);
registerCommand(commands, F_PORT_COUNTING_PARAM, "CMD_SET_PERIOD", 131);

registerCommand(commands, F_PORT_GET_AREA, "CMD_GET_AREA_PTS", 1, parseCountAreaPoints);

function decodeUplink(input) {
  let data = {};
  let fport = input.fPort;

  if (fport === 24 || fport === 25) {
    try {
      let flags = input.bytes[8];
      let counts = parseCounts(input.bytes.slice(0, 8));
      counts.flags = decodeFlags(flags);
      return { data: counts };
    } catch (error) {
      return {
        errors: ["Unable to decode: " + error]
      };
    }
  }

  if (fport === F_PORT_GET_AREA) {
    try {
      let payload = input.bytes;
      data.cmd = {
        name: "CMD_GET_AREA_PTS",
        id: undefined,
        success: true,
        value: parseCountAreaPoints(payload)
      };
      return { data };
    } catch (error) {
      return {
        errors: ["Unable to decode: " + error]
      };
    }
  }

  try {
    let payload = input.bytes.slice(1);
    let header = parseHeader(input.bytes);
    let command = getCommand(commands, fport, header.cmd_id);
    data.cmd = {
      name: command.command_name,
      id: header.cmd_id,
      success: header.ack,
      value: (command.parsePayload ? command.parsePayload(payload) : undefined)
    };
    return { data };
  } catch (error) {
    return {
      errors: ["Unable to decode: " + error]
    };
  }
}
