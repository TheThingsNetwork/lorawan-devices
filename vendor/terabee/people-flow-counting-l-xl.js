function isKthBitSet(byte, k) {
  return byte & (1 << k);
}

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

  let bits_string = ""

  bytes.forEach(byte => {
    bits_string += byte.toString(2).padStart(8, "0")
  })
  return bits_string
}

X_PACK_SIZE = 7
Y_PACK_SIZE = 6

function Coordinate(x, y) {
  this.x = x;
  this.y = y;
}

/**
 * Converts a bit string to list of X, Y
 * coordinates
 *
 * @param bit_string - A string of bits
 * @returns points - Array [ Coordinate (x, y) ]
 *
 * @example "00000000000001010000111100" => Array [
 *            Coordinate (x: 0,  y: 0),
 *            Coordinate (x: 80, y: 60)
 *          ]
 */
function bitsStringToXYpoints(bit_string){

  points = new Array();

  padding_length = bit_string.length % (X_PACK_SIZE + Y_PACK_SIZE)
  bit_string = bit_string.slice(padding_length)

  nb_of_points = Math.floor(bit_string.length / (X_PACK_SIZE + Y_PACK_SIZE))

  for (let i = 0; i < nb_of_points; i++) {
    x = bit_string.slice(
      (X_PACK_SIZE + Y_PACK_SIZE)*i,
      (X_PACK_SIZE + Y_PACK_SIZE)*i + X_PACK_SIZE
    )
    y = bit_string.slice(
      (X_PACK_SIZE + Y_PACK_SIZE)*i + X_PACK_SIZE,
      (X_PACK_SIZE + Y_PACK_SIZE)*( i + 1 )
    )

    points.push(new Coordinate(parseInt(x, 2), parseInt(y, 2)))
  }
  return points
}

function uint32(bytes) {
  if (bytes.length !== uint32.BYTES) {
    throw new Error('uint32 must have exactly 4 bytes');
  }

  var integer = 0;
  for (var x = 0; x < bytes.length; x++) {
    integer += integer*255 + bytes[x]
  }
  return integer;
};
uint32.BYTES = 4;

function uint16(bytes) {
  if (bytes.length !== uint16.BYTES) {
    throw new Error('uint16 must have exactly 2 bytes');
  }

  var integer = 0;
  for (var x = 0; x < bytes.length; x++) {
    integer += integer*255 + bytes[x]
  }
  return integer;
};
uint16.BYTES = 2;

function decodeFlags(flagByte) {
  var flags = new Object()

  if (isKthBitSet(flagByte, 0))
    flags.TPC_STOPPED = 1
  
  if (isKthBitSet(flagByte, 1))
    flags.TPC_STUCK = 1
  
  if (isKthBitSet(flagByte, 2))
    flags.MULTI_DEV_ISSUE = 1
  
  if (isKthBitSet(flagByte, 3))
    flags.WIFI_AP_ENABLED = 1
  
  return flags
}

function parseHeader(bytes) {
  header = {}

  if (bytes[0] === 255){
    header.cmd_id = bytes[1]
    header.ack = (bytes[2] === 255 ? false : true)
    header.type = "acknowledge"
  } else {
    header.cmd_id = bytes[0]
    header.ack = true
    header.type = "response"
  }

  return header
}

const commands = new Map()

function registerCommand(
  registred_commands_map,
  fport, command_name, cmd_id,
  parsePayload = undefined
) {

  if (fport < 1 || fport > 255){
    throw "fport must be between 1 and 255"
  }

  if (cmd_id < 0 || cmd_id > 254){
    throw "cmd_id must be between 0 and 254"
  }

  fport_hex = fport.toString(16).padStart(2, '0');
  cmd_id_hex = cmd_id.toString(16).padStart(2, '0');

  key = fport_hex + cmd_id_hex

  registred_commands_map.set(key, {
    command_name: command_name,
    parsePayload: parsePayload
  })
}

function getCommand(
  registred_commands_map, fport, cmd_id
) {
  fport_hex = fport.toString(16).padStart(2, '0');
  cmd_id_hex = cmd_id.toString(16).padStart(2, '0');

  key = fport_hex + cmd_id_hex
  command = registred_commands_map.get(key)

  if (!command){
    throw "command not registered"
  }

  return command
}

function parseCounts(payload){
  data = {
    count_in: uint32(payload.slice(0, 4)),
    count_out: uint32(payload.slice(4, 8))
  }
  return data
}

function parseCountDirection(payload){
  data = {
    direction: (payload.slice(0) == 1 ? "reversed" : "normal")
  }
  return data
}

function parseAccessPointState(payload){
  data = {
    state: (payload.slice(0) == 1 ? "enabled" : "disabled")
  }
  return data
}

function parseMountingHeight(payload){
  data = {
    mounting_height: uint16(payload.slice(0, 2))
  }
  return data
}

function parsePushPeriod(payload){
  data = {
    push_period_min: uint16(payload.slice(0, 2))
  }
  return data
}

function parseSoftwareVersion(payload){
  data = {
    software_version: `${payload[0]}.${payload[1]}.${payload[2]}`
  }
  return data
}

function parseCountAreaPoints(payload){

  nb_of_points = payload[0]
  points_bytes = payload.slice(1)
  points_bit_string = bytesToBitsString(points_bytes)

  point_size = X_PACK_SIZE + Y_PACK_SIZE
  expected_bytes_count = Math.ceil((nb_of_points * point_size) / 8)

  if (points_bytes.length != expected_bytes_count){
    throw "Couldn't decode area payload: Inconsistent number of points"
  }

  data = {
    nb_of_points: nb_of_points,
    points: bitsStringToXYpoints(points_bit_string)
  }
  return data
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
COUNTING_DATA_UPLINK = 1
F_PORT_GET_AREA = 101
/* UPLINKS WITH CUSTOM FRAME STRUCTURE END */


F_PORT_COUNTS = 2
/* HANDLER GROUP COUNTS COMMANDS */
registerCommand(commands, F_PORT_COUNTS, "CMD_CNT_RST", 1)
registerCommand(commands, F_PORT_COUNTS, "CMD_CNT_GET", 2,
  parsePayload = parseCounts
)
registerCommand(commands, F_PORT_COUNTS, "CMD_CNT_SET", 130)
/* HANDLER GROUP COUNTS END */

F_PORT_REBOOT = 3
/* HANDLER GROUP REBOOT COMMANDS */
registerCommand(commands, F_PORT_REBOOT, "CMD_DEV_RBT", 1)
registerCommand(commands, F_PORT_REBOOT, "CMD_TPC_RST", 2)
/* HANDLER GROUP REBOOT END */

F_PORT_GET_SOFTWARE_VERSION = 4
/* HANDLER GROUP GET SOFTWARE VERSION COMMANDS */
registerCommand(commands, F_PORT_GET_SOFTWARE_VERSION,
  "CMD_GET_VER_PEOPLE_COUNTING", 1, parsePayload = parseSoftwareVersion
)
registerCommand(commands, F_PORT_GET_SOFTWARE_VERSION,
  "CMD_GET_VER_WEB_GUI", 2, parsePayload = parseSoftwareVersion
)
registerCommand(commands, F_PORT_GET_SOFTWARE_VERSION,
  "CMD_GET_VER_LORA_AGENT", 3, parsePayload = parseSoftwareVersion
)
registerCommand(commands, F_PORT_GET_SOFTWARE_VERSION,
  "CMD_GET_VER_ACCESS_POINT", 4, parsePayload = parseSoftwareVersion
)
registerCommand(commands, F_PORT_GET_SOFTWARE_VERSION,
  "CMD_GET_VER_UPDATER_WEB_GUI", 5, parsePayload = parseSoftwareVersion
)
registerCommand(commands, F_PORT_GET_SOFTWARE_VERSION,
  "CMD_GET_VER_FAN_SERVICE", 6, parsePayload = parseSoftwareVersion
)
/* HANDLER GROUP GET SOFTWARE VERSION END */

F_PORT_ACCESS_POINT = 5
/* HANDLER GROUP ACCESS POINT COMMANDS */
registerCommand(commands, F_PORT_ACCESS_POINT, "CMD_GET_AP_STATE", 1,
  parsePayload = parseAccessPointState
)
registerCommand(commands, F_PORT_ACCESS_POINT, "CMD_SET_AP_STATE", 129)
/* HANDLER GROUP ACCESS POINT END */

F_PORT_REJOIN = 6
/* HANDLER GROUP REJOIN COMMANDS */
registerCommand(commands, F_PORT_REJOIN, "CMD_FORCE_REJOIN", 1)
/* HANDLER GROUP REJOIN END */

F_PORT_TIME_SYNC = 7
/* HANDLER GROUP TIME SYNC COMMANDS */
registerCommand(commands, F_PORT_TIME_SYNC, "CMD_FORCE_TIME_SYNC", 1)
/* HANDLER GROUP TIME SYNC END */

F_PORT_COUNTING_PARAM = 100
/* HANDLER GROUP COUNTING PARAMETERS COMMANDS */
registerCommand(commands, F_PORT_COUNTING_PARAM, "CMD_GET_HEIGHT", 1,
  parsePayload = parseMountingHeight
)
registerCommand(commands, F_PORT_COUNTING_PARAM, "CMD_SET_HEIGHT", 129)
registerCommand(commands, F_PORT_COUNTING_PARAM, "CMD_GET_REVERSE", 2,
  parsePayload = parseCountDirection
)
registerCommand(commands, F_PORT_COUNTING_PARAM, "CMD_SET_REVERSE", 130)
registerCommand(commands, F_PORT_COUNTING_PARAM, "CMD_GET_PUSH_PERIOD", 3,
  parsePayload = parsePushPeriod
)
registerCommand(commands, F_PORT_COUNTING_PARAM, "CMD_SET_PUSH_PERIOD", 131)
/* HANDLER GROUP COUNTING PARAMETERS END */

F_PORT_SET_AREA = 102
/* HANDLER GROUP SET AREA COMMANDS */
registerCommand(commands, F_PORT_SET_AREA, "CMD_SET_AREA_PTS", 0)
// /* HANDLER GROUP SET AREA END */


function decodeUplink(input) {

  var data = new Object()

  var fport = input.fPort

  if (fport === COUNTING_DATA_UPLINK){
    data.count_in = uint32(input.bytes.slice(0, 4))
    data.count_out = uint32(input.bytes.slice(4, 8))
    data.flags = decodeFlags(input.bytes[8])

    return {
      data
    };
  }

  if (fport === F_PORT_GET_AREA){

    try {
      points = parseCountAreaPoints(input.bytes)
    } catch (e) {
      return {
        errors: [e]
      }
    }

    data.cmd = {
      name: "CMD_GET_AREA_PTS",
      id: undefined,
      success: true,
      value: points
    }

    return {
      data
    };
  }

  var header = parseHeader(input.bytes)

  var command
  try {
    command = getCommand(commands, fport, header.cmd_id)
  } catch (e) {
    return {
      errors: ["unknown command"]
    }
  }

  data.cmd = {
      name: command.command_name,
      id: header.cmd_id,
      success: header.ack
  }

  if (header.type === "response") {
    payload = input.bytes.slice(1)

    // TODO catch if parse function has been provided
    data.cmd.value = command.parsePayload(payload)
  }

  return {
    data
  };
}
