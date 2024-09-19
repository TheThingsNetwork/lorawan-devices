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
    error_code: data.getUint16(4, LSB), // current error code
    total_volume: data.getUint32(6, LSB), // All-time aggregated water usage in litres
    leak_status: data.getUint8(22), // current water leakage state
    battery_active: decodeBatteryLevel(data.getUint8(23)), // battery mV active
    battery_recovered: decodeBatteryLevel(data.getUint8(24)), // battery mV recovered
    water_temp_min: decodeTemperature_C(data.getUint8(25)), // min water temperature since last statusReport
    water_temp_max: decodeTemperature_C(data.getUint8(26)), // max water temperature since last statusReport
    ambient_temp: decodeTemperature_C(data.getUint8(27)), // current ambient temperature
  };
};

function decodeBatteryLevel(input) {
  return 1800 + (input << 3); // convert to milliVolt
}

function decodeBatteryStatus(input) {
  if (input <= 3100) {
    return 'Low';
  }

  return 'OK';
}

function decodeTemperature_C(input) {
  return input * 0.5 - 20 + '°C'; // to °C
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
var getLeakState = function (input) {
  switch (input) {
    case 3:
      return 'Medium';
    case 4:
      return 'Large';
    default:
      return 'No leak';
  }
};

function toHexString(byteArray) {
  return Array.from(byteArray, function (byte) {
    return ('0' + (byte & 0xff).toString(16)).slice(-2).toUpperCase();
  }).join('');
}

function parseErrorCode(error_code) {
  switch (error_code) {
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
        temperature: input.ambient_temp, // °C
      },
      water: {
        temperature: {
          min: input.water_temp_min, // °C
          max: input.water_temp_max, // °C
        },
        leak: getLeakState(input.leak_state), // String
        totalVolume: input.total_volume, // L
      },
      battery: {
        voltage: input.battery_recovered, // mV
        status: decodeBatteryStatus(input.battery_recovered), // String
      },
    },
    errors: [parseErrorCode(input.error_code)],
  };
}
