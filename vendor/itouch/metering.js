/**
 * iTouch metering uplinks: MM8 and DMM.
 *
 * Little-endian unless noted. Byte 0 is the payload type.
 *   3   MM8 live pulse counters
 *   4   DMM live pulse counters (D1 and D2)
 *   19  MM8 Modbus live node readings (IEEE-754 float32, big-endian)
 *   35  MM8 Modbus historical node readings
 *   179 MM8 historical pulse counters
 *   180 DMM historical grouped counters
 *
 * Bytes 1-2 are the supply or battery voltage in millivolts, in the low 15 bits.
 * On MM8, bit 15 means the DC supply has failed.
 * The iTouch platform stores each Modbus float scaled by 1e6. This formatter
 * reports the float itself.
 */
var TYPE_MM8 = 3;
var TYPE_DMM = 4;
var TYPE_MODBUS = 19;
var TYPE_MODBUS_HISTORICAL = 35;
var TYPE_MM8_HISTORICAL = 179;
var TYPE_DMM_HISTORICAL = 180;
var DC_POWER_FAIL_BIT = 0x8000;
var VCC_MASK = 0x7fff;
var PULSE_HEADER = 5;
var ANALOG_START = 37;

function decodeUplink(input) {
  var bytes = input.bytes || [];
  if (bytes.length < 3) {
    return { errors: ['payload too short'] };
  }

  switch (bytes[0] & 0xff) {
    case TYPE_MM8:
      return decodePulses(bytes, 'mm8', 8, true);
    case TYPE_MM8_HISTORICAL:
      return decodeMm8Historical(bytes);
    case TYPE_DMM:
      return decodePulses(bytes, 'dmm', 2, false);
    case TYPE_DMM_HISTORICAL:
      return decodeDmmHistorical(bytes);
    case TYPE_MODBUS:
      return decodeModbus(bytes, false);
    case TYPE_MODBUS_HISTORICAL:
      return decodeModbus(bytes, true);
    default:
      return { errors: ['unknown payload type ' + (bytes[0] & 0xff)] };
  }
}

function u16le(bytes, index) {
  return (bytes[index] & 0xff) + (bytes[index + 1] & 0xff) * 256;
}

function u32le(bytes, index) {
  return (
    (bytes[index] & 0xff) +
    (bytes[index + 1] & 0xff) * 256 +
    (bytes[index + 2] & 0xff) * 65536 +
    (bytes[index + 3] & 0xff) * 16777216
  );
}

function f32be(bytes, index) {
  var sign = (bytes[index] & 0x80) !== 0 ? -1 : 1;
  var exponent = ((bytes[index] & 0x7f) << 1) | ((bytes[index + 1] & 0x80) >> 7);
  var fraction =
    ((bytes[index + 1] & 0x7f) * 65536) + (bytes[index + 2] & 0xff) * 256 + (bytes[index + 3] & 0xff);
  if (exponent === 255) {
    return fraction === 0 ? sign * Infinity : NaN;
  }
  if (exponent === 0) {
    return sign * Math.pow(2, -126) * (fraction / 8388608);
  }
  return sign * Math.pow(2, exponent - 127) * (1 + fraction / 8388608);
}

function withBattery(bytes, reportPowerFail) {
  var raw = u16le(bytes, 1);
  var data = {
    batteryMillivolts: raw & VCC_MASK,
  };
  if (reportPowerFail) {
    data.dcPowerFail = (raw & DC_POWER_FAIL_BIT) !== 0;
  }
  return data;
}

function decodePulses(bytes, device, maxInputs, reportPowerFail) {
  var bodyEnd = bytes.length;
  if (bytes.length > PULSE_HEADER && (bytes[4] & 0x02) !== 0) {
    bodyEnd -= 2;
  }

  var pulses = {};
  var count = 0;
  var input;
  for (input = 0; input < maxInputs; input++) {
    var at = PULSE_HEADER + input * 4;
    if (at + 4 > bodyEnd) {
      break;
    }
    pulses['d' + (input + 1)] = u32le(bytes, at);
    count++;
  }
  if (count === 0) {
    return { errors: ['pulse payload too short'] };
  }

  var data = withBattery(bytes, reportPowerFail);
  data.device = device;
  data.pulses = pulses;

  if (device === 'mm8' && bodyEnd > ANALOG_START) {
    var analog = {};
    var channel;
    for (channel = 0; channel < 4; channel++) {
      var analogAt = ANALOG_START + channel * 2;
      if (analogAt + 2 > bodyEnd) {
        break;
      }
      analog['a' + (channel + 1)] = u16le(bytes, analogAt);
    }
    data.analog = analog;
  }
  return { data: data };
}

function decodeMm8Historical(bytes) {
  if (bytes.length < PULSE_HEADER + 4) {
    return { errors: ['MM8 historical payload too short'] };
  }
  var data = withBattery(bytes, true);
  data.device = 'mm8';
  data.minutesAgo = u16le(bytes, 3);
  data.pulses = {};
  var input;
  for (input = 0; input < 8; input++) {
    var at = PULSE_HEADER + input * 4;
    if (at + 4 > bytes.length) {
      break;
    }
    data.pulses['d' + (input + 1)] = u32le(bytes, at);
  }
  return { data: data };
}

function decodeDmmHistorical(bytes) {
  var rest = bytes.length - 3;
  if (rest < 10 || rest % 10 !== 0) {
    return { errors: ['DMM historical payload length is not a whole number of slots'] };
  }
  var data = withBattery(bytes, false);
  data.device = 'dmm';
  data.slots = [];
  var slots = rest / 10;
  var slot;
  for (slot = 0; slot < slots; slot++) {
    var at = 3 + slot * 10;
    data.slots.push({
      minutesAgo: u16le(bytes, at),
      d2: u32le(bytes, at + 2),
      d1: u32le(bytes, at + 6),
    });
  }
  return { data: data };
}

function decodeModbus(bytes, historical) {
  var header = historical ? 8 : 6;
  if (bytes.length < header + 4) {
    return { errors: ['Modbus payload too short'] };
  }
  var include = bytes[4] & 0xff;
  if (include < 1 || bytes.length < header + include * 4) {
    return { errors: ['Modbus payload shorter than the node count'] };
  }

  var data = withBattery(bytes, true);
  data.device = 'modbus';
  data.startNode = bytes[3] & 0xff;
  if (historical) {
    data.minutesAgo = u16le(bytes, 6);
  } else {
    data.totalNodes = bytes[5] & 0xff;
  }
  data.nodes = [];
  var node;
  for (node = 0; node < include; node++) {
    data.nodes.push({
      node: data.startNode + node,
      reading: f32be(bytes, header + node * 4),
    });
  }
  return { data: data };
}
