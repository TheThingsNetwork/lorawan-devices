// Please read here on how to implement the proper codec: https://www.thethingsindustries.com/docs/integrations/payload-formatters/javascript/

// Cubicmeter 1.1 uplink decoder

function decodeUplink(input) {
  var decoded = {};

  switch (input.fPort) {
    case 1: // Status report
      decoded = statusReportDecoder(input.bytes);
      break;
  }

  return {
    data: {
      fport: input.fPort,
      length: input.bytes.length,
      hexBytes: toHexString(input.bytes),
      type: getPacketType(input.fPort),
      decoded: decoded,
    },
  };
}
var LSB = true;

var statusReportDecoder = function (bytes) {
  const buffer = new ArrayBuffer(bytes.length);
  const data = new DataView(buffer);
  if (bytes.length < 28) {
    throw new Error('payload too short');
  }
  for (const index in bytes) {
    data.setUint8(index, bytes[index]);
  }

  return {
    errorCode: data.getUint16(4, LSB), // current error code
    totalVolume: data.getUint32(6, LSB), // All-time aggregated water usage in litres
    leakStatus: data.getUint8(22), // current water leakage state
    batteryActive: decodeBatteryLevel(data.getUint8(23)), // battery mV active
    batteryRecovered: decodeBatteryLevel(data.getUint8(24)), // battery mV recovered
    waterTemperatureMin: decodeTemperature(data.getUint8(25)), // min water temperature since last statusReport
    waterTemperatureMax: decodeTemperature(data.getUint8(26)), // max water temperature since last statusReport
    ambientTemperature: decodeTemperature(data.getUint8(27)), // current ambient temperature
  };
};

function decodeBatteryLevel(input) {
  return 1800 + (input << 3); // convert to milliVolt
}

function parseBatteryStatus(input) {
  if (input <= 3100) {
    return 'Low battery';
  }

  return '';
}

function decodeTemperature(input) {
  return input * 0.5 - 20.0; // to °C
}

// More packet types only available when using Quandify platform API
var getPacketType = function (type) {
  switch (type) {
    case 0:
      return 'ping'; // empty ping message
    case 1:
      return 'statusReport'; // status message
  }

  return 'Unknown';
};

/* Smaller water leakages only availble when using Quandify platform API
as it requires cloud analytics */
var parseLeakState = function (input) {
  switch (input) {
    case 3:
      return 'Medium';
    case 4:
      return 'Large';
    default:
      return '';
  }
};

function toHexString(byteArray) {
  return Array.from(byteArray, function (byte) {
    return ('0' + (byte & 0xff).toString(16)).slice(-2).toUpperCase();
  }).join('');
}

function parseErrorCode(errorCode) {
  switch (errorCode) {
    case 0:
      return '';
    case 384:
      return 'Reverse flow';
    case 419:
    case 421:
    case 32768:
      return 'No sensing';
    default:
      return 'Contact support';
  }
}

function normalizeUplink(input) {
  return {
    data: {
      air: {
        temperature: input.data.decoded.ambientTemperature, // °C
      },
      water: {
        temperature: {
          min: input.data.decoded.waterTemperatureMin, // °C
          max: input.data.decoded.waterTemperatureMax, // °C
        },
        leak: input.data.decoded.leak_state > 2, // Boolean
        volume: {
          total: input.data.decoded.totalVolume, // L
        },
      },
      battery: input.data.decoded.batteryRecovered / 1000, // V
    },
    warnings: [parseBatteryStatus(input.data.decoded.batteryRecovered), parseLeakState(input.data.decoded.leak_state)].filter((item) => item),
    errors: [parseErrorCode(input.data.decoded.errorCode)].filter((item) => item),
  };
}
