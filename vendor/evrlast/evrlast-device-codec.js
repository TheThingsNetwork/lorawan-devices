// Evrlast uplink codec.
//
// The uplink payload is a length-delimited Protobuf message. Every entry of the repeated field 1
// is a measurement with the fields identifier (1), value (2) and port (3), all encoded as int32 varints.
// The device sends every value multiplied by 100 and decodeUplink returns the values unchanged, the
// Evrlast Cloud divides them by 100. normalizeUplink returns the values in their physical unit.
// The identifier is the sensor type, see https://docs.evrlast.com/lorawan/decoder/decoder/ for the
// list of identifiers.
//
// Protobuf omits fields that have their default value 0, so a missing field is read as 0.

var VALUE_SCALE = 100;

// Reads a varint and returns its lowest 32 bits as unsigned number. A negative int32 is sent as
// 10 bytes (sign extended to 64 bits), the bytes after the 5th one carry no further information.
// Plain arithmetic is used because the bitwise operators of JavaScript only work on 32 bits.
function readVarint(state) {
  var low = 0;
  var factor = 1;
  for (var i = 0; i < 10; i++) {
    if (state.pos >= state.end) {
      throw new Error('payload ends inside of a varint');
    }
    var byte = state.bytes[state.pos++];
    if (i < 5) {
      low += (byte & 0x7f) * factor;
      factor *= 128;
    }
    if ((byte & 0x80) === 0) {
      return low % 4294967296;
    }
  }
  throw new Error('varint is longer than 10 bytes');
}

function toInt32(unsigned) {
  return unsigned >= 2147483648 ? unsigned - 4294967296 : unsigned;
}

// Reads the length of a length-delimited field and returns the position after the field.
function readLengthEnd(state) {
  var length = readVarint(state);
  var end = state.pos + length;
  if (end > state.end) {
    throw new Error('field of ' + length + ' bytes exceeds the payload');
  }
  return end;
}

// Skips the value of a field with an unexpected field number or wire type.
function skipField(state, wireType) {
  switch (wireType) {
    case 0:
      readVarint(state);
      return;
    case 1:
      state.pos += 8;
      break;
    case 2:
      state.pos = readLengthEnd(state);
      return;
    case 5:
      state.pos += 4;
      break;
    default:
      throw new Error('unsupported wire type ' + wireType);
  }
  if (state.pos > state.end) {
    throw new Error('payload ends inside of a field');
  }
}

function decodeMeasurement(bytes, start, end, warnings) {
  var state = { bytes: bytes, pos: start, end: end };
  // The port is optional and only present when the sensor is attached to a numbered port
  var measurement = { identifier: 0, value: 0 };
  var names = { 1: 'identifier', 2: 'value', 3: 'port' };

  while (state.pos < state.end) {
    var tag = readVarint(state);
    var fieldNumber = Math.floor(tag / 8);
    var wireType = tag % 8;
    var name = names[fieldNumber];

    if (name !== undefined && wireType === 0) {
      var raw = toInt32(readVarint(state));
      measurement[name] = raw;
    } else {
      warnings.push('ignored unknown field ' + fieldNumber + ' (wire type ' + wireType + ') of a measurement');
      skipField(state, wireType);
    }
  }
  return measurement;
}

function decodeUplink(input) {
  var bytes = input.bytes;
  var warnings = [];
  var measurements = [];

  if (!bytes || bytes.length === 0) {
    return { data: {}, errors: ['payload is empty'] };
  }

  var data = {};
  var classes = ['A', 'B', 'C'];

  try {
    var state = { bytes: bytes, pos: 0, end: bytes.length };

    // The payload consists of one or more length-delimited Measurement messages
    while (state.pos < bytes.length) {
      state.end = bytes.length;
      var messageLength = readVarint(state);
      if (state.pos + messageLength > bytes.length) {
        warnings.push('declared message length ' + messageLength + ' exceeds the payload, decoding the available bytes');
      } else {
        state.end = state.pos + messageLength;
      }
      var messageEnd = state.end;

      while (state.pos < messageEnd) {
        var tag = readVarint(state);
        var fieldNumber = Math.floor(tag / 8);
        var wireType = tag % 8;

        if (fieldNumber === 1 && wireType === 2) {
          var end = readLengthEnd(state);
          measurements.push(decodeMeasurement(bytes, state.pos, end, warnings));
          state.pos = end;
        } else if (fieldNumber === 2 && wireType === 0) {
          var deviceClass = classes[readVarint(state)];
          if (deviceClass !== undefined) {
            data.switchToClass = deviceClass;
          }
        } else if (fieldNumber === 3 && wireType === 0) {
          data.batchNr = readVarint(state);
        } else {
          warnings.push('ignored unknown field ' + fieldNumber + ' (wire type ' + wireType + ')');
          skipField(state, wireType);
        }
      }
      state.pos = messageEnd;
    }
  } catch (e) {
    return { data: {}, errors: [e.message] };
  }

  data.measurementValues = measurements;
  var result = { data: data };
  if (warnings.length > 0) {
    result.warnings = warnings;
  }
  return result;
}

// Maps the sensor identifiers that have an equivalent in the normalized payload.
function normalizeUplink(input) {
  var values = (input.data && input.data.measurementValues) || [];
  var warnings = [];
  var air = {};
  var soil = {};
  var device = {};

  function set(target, key, value, measurement) {
    if (target[key] === undefined) {
      target[key] = value;
    } else {
      warnings.push('ignored additional value for ' + key + ' of sensor identifier ' + measurement.identifier +
        (measurement.port !== undefined ? ' on port ' + measurement.port : ''));
    }
  }

  values.forEach(function (m) {
    var value = m.value / VALUE_SCALE;
    switch (m.identifier) {
      case 3: // battery voltage in V
        set(device, 'battery', value, m);
        break;
      case 0: // temperature in °C
        set(air, 'temperature', value, m);
        break;
      case 4: // relative humidity in %
        set(air, 'relativeHumidity', value, m);
        break;
      case 5: // air pressure, the device sends Pa and the normalized payload uses hPa
        set(air, 'pressure', value / 100, m);
        break;
      case 11: // soil moisture in %
        set(soil, 'moisture', value, m);
        break;
      case 17: // external temperature, the soil temperature probe in °C
        set(soil, 'temperature', value, m);
        break;
      default:
        break;
    }
  });

  var data = [];
  if (Object.keys(air).length > 0) {
    data.push({ air: air });
  }
  if (Object.keys(soil).length > 0) {
    data.push({ soil: soil });
  }
  if (device.battery !== undefined) {
    data.push({ battery: device.battery });
  }

  var result = { data: data };
  if (warnings.length > 0) {
    result.warnings = warnings;
  }
  return result;
}
