/**
 * Filename          : decoder_vb_doc-E_rev-4.js
 * Latest commit     : 8d3d992e
 * Protocol document : E
 *
 * Release History
 *
 * 2021-04-14 revision 0
 * - initial version
 *
 * 2021-03-05 revision 1
 * - using scientific notation for sensor data scale
 *
 * 2021-05-14 revision 2
 * - made it compatible with v1 and v2 (merged in protocol v1)
 * - added DecodeHexString to directly decode from HEX string
 *
 * 2021-07-15 revision 3
 * - Verify message length with expected_length before parsing
 *
 * 2021-10-27 revision 4
 * - Fixed range check of start_frequency
 *
 * YYYY-MM-DD revision X
 * -
 */

if (typeof module !== 'undefined') {
  // Only needed for nodejs
  module.exports = {
    Decode: Decode,
    Decoder: Decoder,
    DecodeHexString: DecodeHexString,
    DecodeRebootInfo: DecodeRebootInfo,
    decode_float: decode_float,
    decode_uint32: decode_uint32,
    decode_int32: decode_int32,
    decode_uint16: decode_uint16,
    decode_int16: decode_int16,
    decode_uint8: decode_uint8,
    decode_int8: decode_int8,
    decode_device_id: decode_device_id,
    decode_reboot_info: decode_reboot_info,
    decode_sensor_data_config: decode_sensor_data_config,
    from_hex_string: from_hex_string
  };
}

/**
 * Decoder for Chirpstack (loraserver) network server
 *
 * Decode an uplink message from a buffer
 * (array) of bytes to an object of fields.
 */
function Decode(fPort, bytes) { // Used for ChirpStack (aka LoRa Network Server)
  var decoded = {};
  decoded.header = {};
  decoded.header.protocol_version = bytes[0] >> 4;
  message_type = bytes[0] & 0x0F;

  var PROTOCOL_VERSION_V1 = 1;
  var PROTOCOL_VERSION_V2 = 2;

  var MSGID_BOOT = 0;
  var MSGID_ACTIVATED = 1;
  var MSGID_DEACTIVATED = 2;
  var MSGID_SENSOR_EVENT = 3;
  var MSGID_DEVICE_STATUS = 4;
  var MSGID_SENSOR_DATA = 8;

  switch (decoded.header.protocol_version) {
    case PROTOCOL_VERSION_V1:
    case PROTOCOL_VERSION_V2:
      {
        decoded.header.message_type = message_type_lookup(message_type);

        var cursor = {};   // keeping track of which byte to process.
        cursor.value = 1;  // skip header that has been checked

        switch (message_type) {
          case MSGID_BOOT: {
            decoded.boot = decode_boot_msg(bytes, cursor);
            break;
          }

          case MSGID_ACTIVATED: {
            decoded.activated = decode_activated_msg(bytes, cursor);
            break;
          }

          case MSGID_DEACTIVATED: {
            decoded.deactivated = decode_deactivated_msg(bytes, cursor);
            break;
          }

          case MSGID_SENSOR_EVENT: {
            decoded.sensor_event = decode_sensor_event_msg(bytes, cursor);
            break;
          }

          case MSGID_DEVICE_STATUS: {
            decoded.device_status = decode_device_status_msg(bytes, cursor);
            break;
          }

          case MSGID_SENSOR_DATA: {
            decoded.sensor_data = decode_sensor_data_msg(bytes, cursor, decoded.header.protocol_version);
            break;
          }

          default:
            throw "Invalid message type!";
        }
        break;
      }
    default:
      throw "Unsupported protocol version!";
  }

  return decoded;
}


/**
 * Decoder for reboot payload
 *
 */
function DecodeRebootInfo(reboot_type, bytes) {
  var cursor = {};   // keeping track of which byte to process.
  cursor.value = 0;  // skip header that has been checked

  return decode_reboot_info(reboot_type, bytes, cursor);
}

/**
 * Decoder for The Things Network network server
 */
function Decoder(obj, fPort) {
  return Decode(fPort, obj);
}

/** 
 * New Decoder for The Things Stack
 */
function decodeUplink(input) {
  try {
    obj = Decode(input.fPort, input.bytes);
    return {
      data: obj
    }
  }
  catch (e) {
    return {
      errors: [e.toString()]
    };

  }
}

/**
 * Decoder for plain HEX string
 */
function DecodeHexString(hex_string) {
  return Decode(15, from_hex_string(hex_string));
}

/******************
 * Helper functions
 */

// helper function to convert a ASCII HEX string to a byte string
function from_hex_string(hex_string) {
  if (typeof hex_string != "string") throw new Error("hex_string must be a string");
  if (!hex_string.match(/^[0-9A-F]*$/gi)) throw new Error("hex_string contain only 0-9, A-F characters");
  if (hex_string.length & 0x01 > 0) throw new Error("hex_string length must be a multiple of two");

  var byte_string = [];
  for (i = 0; i < hex_string.length; i += 2) {
    var hex = hex_string.slice(i, i + 2);
    byte_string.push(parseInt(hex, 16));
  }
  return byte_string;
}

// pad zeros on decimal number
function pad(num, size) {
  num = num.toString();
  while (num.length < size) num = "0" + num;
  return num;
}

// helper function to parse an 32 bit float
function decode_float(bytes, cursor) {
  // JavaScript bitwise operators yield a 32 bits integer, not a float.
  // Assume LSB (least significant byte first).
  var bits = decode_int32(bytes, cursor);
  var sign = (bits >>> 31 === 0) ? 1.0 : -1.0;
  var e = bits >>> 23 & 0xff;
  if (e == 0xFF) {
    if (bits & 0x7fffff) {
      return NaN;
    } else {
      return sign * Infinity;
    }
  }
  var m = (e === 0) ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
  var f = sign * m * Math.pow(2, e - 150);
  return f;
}

// helper function to parse an unsigned uint32
function decode_uint32(bytes, cursor) {
  var result = 0;
  var i = cursor.value + 3;
  result = bytes[i--];
  result = result * 256 + bytes[i--];
  result = result * 256 + bytes[i--];
  result = result * 256 + bytes[i--];
  cursor.value += 4;

  return result;
}

// helper function to parse an unsigned int32
function decode_int32(bytes, cursor) {
  var result = 0;
  var i = cursor.value + 3;
  result = (result << 8) | bytes[i--];
  result = (result << 8) | bytes[i--];
  result = (result << 8) | bytes[i--];
  result = (result << 8) | bytes[i--];
  cursor.value += 4;

  return result;
}

// helper function to parse an unsigned uint16
function decode_uint16(bytes, cursor) {
  var result = 0;
  var i = cursor.value + 1;
  result = bytes[i--];
  result = result * 256 + bytes[i--];
  cursor.value += 2;

  return result;
}

// helper function to parse a signed int16
function decode_int16(bytes, cursor) {
  var result = 0;
  var i = cursor.value + 1;
  if (bytes[i] & 0x80) {
    result = 0xFFFF;
  }
  result = (result << 8) | bytes[i--];
  result = (result << 8) | bytes[i--];
  cursor.value += 2;

  return result;
}

// helper function to parse an unsigned int8
function decode_uint8(bytes, cursor) {
  var result = bytes[cursor.value];
  cursor.value += 1;

  return result;
}

// helper function to parse an unsigned int8
function decode_int8(bytes, cursor) {
  var result = 0;
  var i = cursor.value;
  if (bytes[i] & 0x80) {
    result = 0xFFFFFF;
  }
  result = (result << 8) | bytes[i--];
  cursor.value += 1;

  return result;
}

// helper function to parse device_id
function decode_device_id(bytes, cursor) {
  // bytes[0]
  var prefix = decode_uint8(bytes, cursor).toString();

  // bytes[1..5]
  var serial = pad(decode_uint32(bytes, cursor), 10);

  var device_id = prefix + "-" + serial;

  return device_id;
}

// helper function to parse fft config in sensor_data
function decode_sensor_data_config(bytes, cursor, protocol_version) {
  config = decode_uint32(bytes, cursor);
  var result = {};

  // bits[0..7]
  result.frame_number = config & 0xFF;

  // bits[8..9]
  result.sequence_number = (config >> 8) & 0x03;

  // bits[10..11]
  result.axis = "";
  switch ((config >> 10) & 0x3) {
    case 0:
      result.axis = "x";
      break;
    case 1:
      result.axis = "y";
      break;
    case 2:
      result.axis = "z";
      break;
    default:
      throw "Invalid axis value in sensor data config!";
  }

  // bits[12]
  switch ((config >> 12) & 0x1) {
    case 0:
      result.unit = "velocity";
      break;
    case 1:
    default:
      result.unit = "acceleration";
      break;
  }

  switch (protocol_version) {
    case 1:
      // bits[13..18]
      result.scale = ((config >> 13) & 0x3F) * 4;
      if (result.scale == 0) {
        throw "Invalid config.scale value!"
      }
      break;

    case 2:
      // bits[13..16]
      var scale_coefficient = ((config >> 13) & 0x0F);
      if (scale_coefficient < 1 || scale_coefficient > 15) {
        throw "Invalid config.scale coefficient value!"
      }
      // bits[17..18]
      var scale_power = ((config >> 17) & 0x03) - 2;
      result.scale = scale_coefficient * Math.pow(10, scale_power);
      break;

    default:
      throw "Unsupported protocol version!";
  }

  // bits[19..31]
  result.start_frequency = config >>> 19;
  if (result.start_frequency < 0 || result.start_frequency > 8191) {
    throw "Invalid start_frequency value in sensor data config!";
  }

  // bytes[5]
  result.spectral_line_frequency = decode_uint8(bytes, cursor);
  if (result.spectral_line_frequency == 0) {
    throw "Invalid spectral_line_frequency value in sensor data config!";
  }


  return result;
}

// helper function to parse reboot_info
function decode_reboot_info(reboot_type, bytes, cursor) {
  var result;

  var reboot_payload = [0, 0, 0, 0, 0, 0, 0, 0];
  reboot_payload[0] += decode_uint8(bytes, cursor);
  reboot_payload[1] += decode_uint8(bytes, cursor);
  reboot_payload[2] += decode_uint8(bytes, cursor);
  reboot_payload[3] += decode_uint8(bytes, cursor);
  reboot_payload[4] += decode_uint8(bytes, cursor);
  reboot_payload[5] += decode_uint8(bytes, cursor);
  reboot_payload[6] += decode_uint8(bytes, cursor);
  reboot_payload[7] += decode_uint8(bytes, cursor);

  switch (reboot_type) {
    case 0: // REBOOT_INFO_TYPE_NONE
      result = 'none';
      break;

    case 1: // REBOOT_INFO_TYPE_POWER_CYCLE
      result = 'power cycle';
      break;

    case 2: // REBOOT_INFO_TYPE_WDOG
      result = 'swdog (' + String.fromCharCode(
        reboot_payload[0],
        reboot_payload[1],
        reboot_payload[2],
        reboot_payload[3]).replace(/[^\x20-\x7E]/g, '') + ')';

      break;

    case 3: // REBOOT_INFO_TYPE_ASSERT
      var payloadCursor = {}; // keeping track of which byte to process.
      payloadCursor.value = 4; // skip caller address
      actualValue = decode_int32(reboot_payload, payloadCursor);
      result = 'assert (' +
        'caller: 0x' +
        uint8_to_hex(reboot_payload[3]) +
        uint8_to_hex(reboot_payload[2]) +
        uint8_to_hex(reboot_payload[1]) +
        uint8_to_hex(reboot_payload[0]) +
        '; value: ' + actualValue.toString() + ')';
      break;

    case 4: // REBOOT_INFO_TYPE_APPLICATION_REASON
      result = 'application (0x' +
        uint8_to_hex(reboot_payload[3]) +
        uint8_to_hex(reboot_payload[2]) +
        uint8_to_hex(reboot_payload[1]) +
        uint8_to_hex(reboot_payload[0]) + ')';
      break;

    case 5: // REBOOT_INFO_TYPE_SYSTEM_ERROR
      result = 'system (error: 0x' +
        uint8_to_hex(reboot_payload[3]) +
        uint8_to_hex(reboot_payload[2]) +
        uint8_to_hex(reboot_payload[1]) +
        uint8_to_hex(reboot_payload[0]) +
        '; caller: 0x' +
        uint8_to_hex(reboot_payload[7]) +
        uint8_to_hex(reboot_payload[6]) +
        uint8_to_hex(reboot_payload[5]) +
        uint8_to_hex(reboot_payload[4]) + ')';
      break;

    default:
      result = 'unknown (' +
        '0x' + uint8_to_hex(reboot_payload[0]) + ', ' +
        '0x' + uint8_to_hex(reboot_payload[1]) + ', ' +
        '0x' + uint8_to_hex(reboot_payload[2]) + ', ' +
        '0x' + uint8_to_hex(reboot_payload[3]) + ', ' +
        '0x' + uint8_to_hex(reboot_payload[4]) + ', ' +
        '0x' + uint8_to_hex(reboot_payload[5]) + ', ' +
        '0x' + uint8_to_hex(reboot_payload[6]) + ', ' +
        '0x' + uint8_to_hex(reboot_payload[7]) + ')';
      break;
  }

  return result;
}

function uint8_to_hex(d) {
  return ('0' + (Number(d).toString(16).toUpperCase())).slice(-2);
}

function uint16_to_hex(d) {
  return ('000' + (Number(d).toString(16).toUpperCase())).slice(-4);
}

function uint32_to_hex(d) {
  return ('0000000' + (Number(d).toString(16).toUpperCase())).slice(-8);
}

function message_type_lookup(type_id) {
  type_names = ["boot",
    "activated",
    "deactivated",
    "sensor_event",
    "device_status",
    "base_configuration",
    "sensor_configuration",
    "sensor_data_configuration",
    "sensor_data"];
  if (type_id < type_names.length) {
    return type_names[type_id];
  } else {
    return "unknown";
  }
}

function device_types_lookup(type_id) {
  type_names = ["", // reserved
    "ts",
    "vs-qt",
    "vs-mt",
    "tt",
    "ld",
    "vb"];
  if (type_id < type_names.length) {
    return type_names[type_id];
  } else {
    return "unknown";
  }
}

function trigger_lookup(trigger_id) {
  switch (trigger_id) {
    case 0:
      return "timer";
    case 1:
      return "button";
    case 2:
      return "condition_0";
    case 3:
      return "condition_1";
    case 4:
      return "condition_2";
    case 5:
      return "condition_3";
    case 6:
      return "condition_4";
    case 7:
      return "condition_5";
    default:
      return "unknown";
  }
}

function deactivation_reason_lookup(deactivation_id) {
  switch (deactivation_id) {
    case 0:
      return "user_triggered";
    case 1:
      return "activation_user_timeout";
    case 2:
      return "activation_sensor_comm_fail";
    case 3:
      return "activation_sensor_meas_fail";  // VB does not have it
    default:
      return "unknown";
  }
}

Object.prototype.in = function () {
  for (var i = 0; i < arguments.length; i++)
    if (arguments[i] == this) return true;
  return false;
}

/***************************
 * Message decoder functions
 */

function decode_boot_msg(bytes, cursor) {
  var boot = {};

  var expected_length = 46;
  if (bytes.length != expected_length) {
    throw "Invalid boot message length " + bytes.length + " instead of " + expected_length
  }

  boot.base = {};
  // byte[1]
  var device_type = decode_uint8(bytes, cursor);
  boot.base.device_type = device_types_lookup(device_type);

  // byte[2..5]
  var version_hash = decode_uint32(bytes, cursor);
  boot.base.version_hash = '0x' + uint32_to_hex(version_hash);

  // byte[6..7]
  var config_crc = decode_uint16(bytes, cursor);
  boot.base.config_crc = '0x' + uint16_to_hex(config_crc);

  // byte[8]
  var reset_flags = decode_uint8(bytes, cursor);
  boot.base.reset_flags = '0x' + uint8_to_hex(reset_flags);

  // byte[9]
  boot.base.reboot_counter = decode_uint8(bytes, cursor);

  // byte[10]
  base_reboot_type = decode_uint8(bytes, cursor);

  // byte[11..18]
  boot.base.reboot_info = decode_reboot_info(base_reboot_type, bytes, cursor);

  // byte[19]
  var bist = decode_uint8(bytes, cursor);
  boot.base.bist = '0x' + uint8_to_hex(bist);

  boot.sensor = {};
  // byte[20]
  var device_type = decode_uint8(bytes, cursor);
  boot.sensor.device_type = device_types_lookup(device_type);

  // byte[21..25]
  boot.sensor.device_id = decode_device_id(bytes, cursor);

  // byte[26..29]
  var version_hash = decode_uint32(bytes, cursor);
  boot.sensor.version_hash = '0x' + uint32_to_hex(version_hash);

  // byte[30..31]
  var config_crc = decode_uint16(bytes, cursor);
  boot.sensor.config_crc = '0x' + uint16_to_hex(config_crc);

  // byte[32..33]
  var data_config_crc = decode_uint16(bytes, cursor);
  boot.sensor.data_config_crc = '0x' + uint16_to_hex(data_config_crc);

  // byte[34]
  var reset_flags = decode_uint8(bytes, cursor);
  boot.sensor.reset_flags = '0x' + uint8_to_hex(reset_flags);

  // byte[35]
  boot.sensor.reboot_counter = decode_uint8(bytes, cursor);

  // byte[36]
  sensor_reboot_type = decode_uint8(bytes, cursor);

  // byte[37..44]
  boot.sensor.reboot_info = decode_reboot_info(sensor_reboot_type, bytes, cursor);

  // byte[45]
  var bist = decode_uint8(bytes, cursor);
  boot.sensor.bist = '0x' + uint8_to_hex(bist);

  return boot;
}

function decode_activated_msg(bytes, cursor) {
  var activated = {};

  var expected_length = 7;
  if (bytes.length != expected_length) {
    throw "Invalid activated message length " + bytes.length + " instead of " + expected_length
  }

  activated.sensor = {};

  // byte[1]
  var device_type = decode_uint8(bytes, cursor);
  activated.sensor.device_type = device_types_lookup(device_type);

  // byte[2..6]
  activated.sensor.device_id = decode_device_id(bytes, cursor);

  return activated;
}

function decode_deactivated_msg(bytes, cursor) {
  var deactivated = {};

  var expected_length = 3;
  if (bytes.length != expected_length) {
    throw "Invalid deactivated message length " + bytes.length + " instead of " + expected_length
  }

  // byte[1]
  var reason = decode_uint8(bytes, cursor);
  deactivated.reason = deactivation_reason_lookup(reason);

  // byte[2]
  var reason_length = decode_uint8(bytes, cursor);

  if (reason_length != 0) {
    throw "Unsupported deactivated reason length"
  }

  return deactivated;
}

function decode_sensor_event_msg(bytes, cursor) {
  var sensor_event = {};

  var expected_length = 45;
  if (bytes.length != expected_length) {
    throw "Invalid sensor_event message length " + bytes.length + " instead of " + expected_length
  }

  // byte[1]
  trigger = decode_uint8(bytes, cursor);
  sensor_event.trigger = trigger_lookup(trigger);

  sensor_event.rms_velocity = {};

  // byte[2..7]
  sensor_event.rms_velocity.x = {};
  sensor_event.rms_velocity.x.min = decode_uint16(bytes, cursor) / 100;
  sensor_event.rms_velocity.x.max = decode_uint16(bytes, cursor) / 100;
  sensor_event.rms_velocity.x.avg = decode_uint16(bytes, cursor) / 100;

  // byte[8..13]
  sensor_event.rms_velocity.y = {};
  sensor_event.rms_velocity.y.min = decode_uint16(bytes, cursor) / 100;
  sensor_event.rms_velocity.y.max = decode_uint16(bytes, cursor) / 100;
  sensor_event.rms_velocity.y.avg = decode_uint16(bytes, cursor) / 100;

  // byte[14..19]
  sensor_event.rms_velocity.z = {};
  sensor_event.rms_velocity.z.min = decode_uint16(bytes, cursor) / 100;
  sensor_event.rms_velocity.z.max = decode_uint16(bytes, cursor) / 100;
  sensor_event.rms_velocity.z.avg = decode_uint16(bytes, cursor) / 100;

  sensor_event.acceleration = {};

  // byte[20..25]
  sensor_event.acceleration.x = {};
  sensor_event.acceleration.x.min = decode_int16(bytes, cursor) / 100;
  sensor_event.acceleration.x.max = decode_int16(bytes, cursor) / 100;
  sensor_event.acceleration.x.avg = decode_int16(bytes, cursor) / 100;

  // byte[26..31]
  sensor_event.acceleration.y = {};
  sensor_event.acceleration.y.min = decode_int16(bytes, cursor) / 100;
  sensor_event.acceleration.y.max = decode_int16(bytes, cursor) / 100;
  sensor_event.acceleration.y.avg = decode_int16(bytes, cursor) / 100;

  // byte[32..37]
  sensor_event.acceleration.z = {};
  sensor_event.acceleration.z.min = decode_int16(bytes, cursor) / 100;
  sensor_event.acceleration.z.max = decode_int16(bytes, cursor) / 100;
  sensor_event.acceleration.z.avg = decode_int16(bytes, cursor) / 100;

  // byte[38..43]
  sensor_event.temperature = {};
  sensor_event.temperature.min = decode_int16(bytes, cursor) / 100;
  sensor_event.temperature.max = decode_int16(bytes, cursor) / 100;
  sensor_event.temperature.avg = decode_int16(bytes, cursor) / 100;

  // byte[44]
  var conditions = decode_uint8(bytes, cursor);
  sensor_event.condition_0 = (conditions & 1);
  sensor_event.condition_1 = ((conditions >> 1) & 1);
  sensor_event.condition_2 = ((conditions >> 2) & 1);
  sensor_event.condition_3 = ((conditions >> 3) & 1);
  sensor_event.condition_4 = ((conditions >> 4) & 1);
  sensor_event.condition_5 = ((conditions >> 5) & 1);

  return sensor_event;
}

function decode_device_status_msg(bytes, cursor) {
  var device_status = {};

  var expected_length = 24;
  if (bytes.length != expected_length) {
    throw "Invalid device_status message length " + bytes.length + " instead of " + expected_length
  }

  device_status.base = {};
  device_status.sensor = {};

  // byte[1..2]
  var config_crc = decode_uint16(bytes, cursor);
  device_status.base.config_crc = '0x' + uint16_to_hex(config_crc);

  // byte[3..8]
  device_status.base.battery_voltage = {}
  device_status.base.battery_voltage.low = decode_uint16(bytes, cursor) / 1000.0;
  device_status.base.battery_voltage.high = decode_uint16(bytes, cursor) / 1000.0;
  device_status.base.battery_voltage.settle = decode_uint16(bytes, cursor) / 1000.0;

  // byte[9..11]
  device_status.base.temperature = {}
  device_status.base.temperature.min = decode_int8(bytes, cursor);
  device_status.base.temperature.max = decode_int8(bytes, cursor);
  device_status.base.temperature.avg = decode_int8(bytes, cursor);

  // byte[12]
  device_status.base.lvds_error_counter = decode_uint8(bytes, cursor);

  // byte[13..15]
  device_status.base.lora_tx_counter = decode_uint8(bytes, cursor);
  device_status.base.avg_rssi = -decode_uint8(bytes, cursor);
  device_status.base.avg_snr = decode_int8(bytes, cursor);

  // byte[16]
  var bist = decode_uint8(bytes, cursor);
  device_status.base.bist = '0x' + uint8_to_hex(bist);

  // byte[17]
  var device_type = decode_uint8(bytes, cursor);
  device_status.sensor.device_type = device_types_lookup(device_type);

  // byte[18..19]
  var config_crc = decode_uint16(bytes, cursor);
  device_status.sensor.config_crc = '0x' + uint16_to_hex(config_crc);

  // byte[20..21]
  var data_config_crc = decode_uint16(bytes, cursor);
  device_status.sensor.data_config_crc = '0x' + uint16_to_hex(data_config_crc);

  // byte[22]
  device_status.sensor.event_counter = decode_uint8(bytes, cursor);

  // byte[23]
  var bist = decode_uint8(bytes, cursor);
  device_status.sensor.bist = '0x' + uint8_to_hex(bist);

  return device_status;
}

function decode_sensor_data_msg(bytes, cursor, protocol_version) {
  var sensor_data = {};

  var expected_length = 46;
  if (bytes.length != expected_length) {
    throw "Invalid sensor_data message length " + bytes.length + " instead of " + expected_length
  }

  // byte[1..5]
  sensor_data.config = decode_sensor_data_config(bytes, cursor, protocol_version);

  // byte[6..45]
  sensor_data.raw = [];
  while (cursor.value < bytes.length) {
    sensor_data.raw[cursor.value - 6] = bytes[cursor.value];

    cursor.value += 1;
  }

  // Process raw data
  sensor_data.frequency = [];
  sensor_data.magnitude = [];

  // convert from bin to Hz
  var binToHzFactor = 1.62762;
  for (i = 0; i < 40; i++) {
    sensor_data.frequency[i] = sensor_data.config.start_frequency * binToHzFactor +
      (sensor_data.config.frame_number * 40 * sensor_data.config.spectral_line_frequency * binToHzFactor) +
      (i * sensor_data.config.spectral_line_frequency * binToHzFactor);
    sensor_data.magnitude[i] = sensor_data.raw[i] * sensor_data.config.scale / 255;
    sensor_data.frequency[i] = sensor_data.frequency[i];
  }

  return sensor_data;
}