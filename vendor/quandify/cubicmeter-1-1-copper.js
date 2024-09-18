// Please read here on how to implement the proper codec: https://www.thethingsindustries.com/docs/integrations/payload-formatters/javascript/

// Cubicmeter 1.1 Copper decoder

function decodeUplink(input) {
  var decoded;
  if (getPacketType(input.fPort) == 'periodicReport' || getPacketType(input.fPort) == 'alarmReport') {
    decoded = periodicReportDecoder(input.bytes);
  }
  return {
    data: {
      type: getPacketType(input.fPort),
      decoded: decoded,
      hexBytes: toHexString(input.bytes),
      fport: input.fPort,
      length: input.bytes.length,
    },
    warnings: [],
    errors: [],
  };
}
var LSB = true;

var periodicReportDecoder = function (bytes) {
  const buffer = new ArrayBuffer(bytes.length);
  const data = new DataView(buffer);
  if (bytes.length < 28) {
    throw new Error('payload too short');
  }
  for (const index in bytes) {
    data.setUint8(index, bytes[index]);
  }

  return {
    error_code: data.getUint16(4, LSB) ? data.getUint16(4, LSB) : 'No Error', // current error code
    total_volume: data.getUint32(6, LSB) + ' L', // All-time aggregated water usage in litres
    leak_status: getLeakState(data.getUint8(22)), // current water leakage state
    battery_status: decodeBatteryStatus(data.getUint8(23), data.getUint8(24)), // current battery state
    water_temp_min: decodeTemperature_C(data.getUint8(25)), // min water temperature since last periodicReport
    water_temp_max: decodeTemperature_C(data.getUint8(26)), // max water temperature since last periodicReport
    ambient_temp: decodeTemperature_C(data.getUint8(27)), // current ambient temperature
  };
};

var decodeBatteryStatus = function (input1, input2) {
  var level = 1800 + (input2 << 3); // convert to status
  if (level <= 3100) return 'LOW_BATTERY';
  else return 'OK';
};

var decodeTemperature_C = function (input) {
  return input * 0.5 - 20 + '°C'; // to °C
};

// More packet types only available when using Quandify platform API
var getPacketType = function (type) {
  if (type == 0) {
    return 'ping'; // empty ping message
  } else if (type == 1) {
    return 'periodicReport'; // periodic message
  } else if (type == 2) {
    return 'alarmReport'; // same as periodic but pushed due to an urgent alarm
  } else return 'Unknown';
};

/* Smaller water leakages only availble when using Quandify platform API
as it requires cloud analytics */
var getLeakState = function (input) {
  if (input <= 2) {
    return 'NoLeak';
  } else if (input == 3) {
    return 'Medium';
  } else if (input == 4) {
    return 'Large';
  } else return 'N/A';
};

function toHexString(byteArray) {
  return Array.from(byteArray, function (byte) {
    return ('0' + (byte & 0xff).toString(16)).slice(-2).toUpperCase();
  }).join('');
}
