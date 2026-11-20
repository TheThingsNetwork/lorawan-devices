// Sensocon DataSling Series WS / WM payload codec
// Source: Sensocon document SD-0178, "LoRaWAN Payload Decoder for Series WS/WM Wireless Sensors".
//
// Uplink: 1 header byte (0xAA), then up to 10 blocks of 5 bytes:
// 1 type byte + 1 IEEE 754 float32 value (little-endian).
// Each uplink always carries the full data set of the model.
// Temperatures are sent natively in degrees Fahrenheit. The decoder outputs
// degrees Celsius as the primary field and keeps the original Fahrenheit value.
// All values are rounded to 2 decimals.
//
// Downlink: CMD (1 byte) + length (1 byte, 0x02) + data (2 bytes, big-endian).
// Offsets are sent in thousandths (1/1000) of the base unit. Send one command
// per downlink. The sensor is LoRaWAN Class A.

var HEADER = 0xaa;

// SD-0178 type byte -> data key.
// Types 5 and 9 to 18 are in the SD-0178 type map, but no unit is specified
// and no current WS/WM model reports them. They are reported as warnings.
var TYPES = {
  0: 'pressure', // differential pressure, in. WC
  1: 'humidityTemperature', // room / RH-sensor temperature, degrees F
  2: 'humidity', // relative humidity, %
  3: 'batteryVoltage', // V
  4: 'contact', // 1 = closed, 0 = open
  6: 'voltage', // 0-10 V input, V DC
  7: 'current', // 4-20 mA input, mA
  8: 'probeTemperature', // thermistor probe temperature, degrees F
  19: 'gaugeDiffPressure', // gauge or wet/wet differential pressure, PSI
};

// Output key order (kept stable).
var OUTPUT_KEYS = [
  'pressure',
  'gaugeDiffPressure',
  'humidity',
  'temperature',
  'temperatureF',
  'probeTemperature',
  'probeTemperatureF',
  'voltage',
  'current',
  'contact',
  'batteryVoltage',
  'payloadVersion',
];

// Downlink commands. multiplier converts the value to the transmitted integer.
var COMMANDS = [
  { field: 'setInterval', cmd: 0x00, multiplier: 1 }, // seconds
  { field: 'pressureOffset', cmd: 0x02, multiplier: 1000 }, // in. WC
  { field: 'temperatureOffset', cmd: 0x04, multiplier: 1000 }, // degrees F (probe)
  { field: 'humidityOffset', cmd: 0x06, multiplier: 1000 }, // %
  { field: 'voltageOffset', cmd: 0x08, multiplier: 1000 }, // V DC
  { field: 'currentOffset', cmd: 0x0a, multiplier: 1000 }, // A DC (as in SD-0178)
  { field: 'humidityTempOffset', cmd: 0x0c, multiplier: 1000 }, // degrees F (RH sensor)
  { field: 'gaugeDiffPressureOffset', cmd: 0x10, multiplier: 1000 }, // PSI
];

// Minimum interval from the WS/WM user manual: 10 minutes.
var MIN_INTERVAL = 600;
var MAX_INTERVAL = 65535;

function round(value) {
  return Math.round(value * 100) / 100;
}

function toCelsius(fahrenheit) {
  return round(((fahrenheit - 32) * 5) / 9);
}

function float32LE(bytes, offset) {
  var view = new DataView(new ArrayBuffer(4));
  for (var i = 0; i < 4; i++) {
    view.setUint8(i, bytes[offset + i]);
  }
  return view.getFloat32(0, true);
}

function decodeUplink(input) {
  var bytes = input.bytes || [];
  var warnings = [];

  if (bytes.length < 6) {
    return { errors: ['payload too short: expected header byte and at least one 5-byte block'] };
  }
  if (bytes[0] !== HEADER) {
    warnings.push('unexpected header byte 0x' + bytes[0].toString(16) + ' (expected 0xaa)');
  }
  if ((bytes.length - 1) % 5 !== 0) {
    warnings.push('payload length is not header + n x 5 bytes; trailing bytes ignored');
  }

  var values = {};
  var end = Math.min(bytes.length, 1 + 10 * 5);
  for (var index = 1; index + 5 <= end; index += 5) {
    var typeByte = bytes[index];
    var type = TYPES[typeByte];
    var value = float32LE(bytes, index + 1);
    if (type === undefined) {
      warnings.push('unknown sensor type ' + typeByte + ' ignored');
      continue;
    }
    if (!isFinite(value)) {
      warnings.push('invalid value for ' + type + ' ignored');
      continue;
    }

    if (type === 'contact') {
      values.contact = round(value) === 0 ? 'OPEN' : 'CLOSED';
    } else if (type === 'humidityTemperature') {
      values.temperatureF = round(value);
      values.temperature = toCelsius(values.temperatureF);
    } else if (type === 'probeTemperature') {
      values.probeTemperatureF = round(value);
      values.probeTemperature = toCelsius(values.probeTemperatureF);
    } else {
      values[type] = round(value);
    }
  }
  values.payloadVersion = bytes[0];

  var data = {};
  for (var k = 0; k < OUTPUT_KEYS.length; k++) {
    var key = OUTPUT_KEYS[k];
    if (values[key] !== undefined) {
      data[key] = values[key];
    }
  }

  var result = { data: data };
  if (warnings.length > 0) {
    result.warnings = warnings;
  }
  return result;
}

function encodeDownlink(input) {
  var data = input.data || {};
  var command;
  for (var i = 0; i < COMMANDS.length; i++) {
    if (data[COMMANDS[i].field] !== undefined && data[COMMANDS[i].field] !== null) {
      command = COMMANDS[i];
      break;
    }
  }
  if (command === undefined) {
    return {
      errors: [
        'provide one of: ' +
          COMMANDS.map(function (c) {
            return c.field;
          }).join(', '),
      ],
    };
  }

  var raw = Math.round(Number(data[command.field]) * command.multiplier);
  if (command.field === 'setInterval') {
    if (!(raw >= MIN_INTERVAL && raw <= MAX_INTERVAL)) {
      return { errors: ['setInterval must be between ' + MIN_INTERVAL + ' and ' + MAX_INTERVAL + ' seconds'] };
    }
  } else if (!(raw >= -32768 && raw <= 32767)) {
    return { errors: [command.field + ' is out of range'] };
  }
  raw &= 0xffff; // negative offsets: 16-bit two's complement

  return {
    bytes: [command.cmd, 0x02, (raw >> 8) & 0xff, raw & 0xff],
    fPort: 1,
  };
}

function decodeDownlink(input) {
  var bytes = input.bytes || [];
  if (bytes.length !== 4 || bytes[1] !== 0x02) {
    return { errors: ['downlink must be 4 bytes: command, length 0x02, 2 data bytes'] };
  }
  var command;
  for (var i = 0; i < COMMANDS.length; i++) {
    if (COMMANDS[i].cmd === bytes[0]) {
      command = COMMANDS[i];
      break;
    }
  }
  if (command === undefined) {
    return { errors: ['unknown command 0x' + bytes[0].toString(16)] };
  }
  var raw = (bytes[2] << 8) | bytes[3];
  if (command.field !== 'setInterval' && raw > 0x7fff) {
    raw -= 0x10000;
  }
  var data = {};
  data[command.field] = raw / command.multiplier;
  return { data: data };
}
