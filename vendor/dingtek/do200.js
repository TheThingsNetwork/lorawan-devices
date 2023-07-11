var units = [' ℃', ' hours', ' minutes', ' mm', ' °', ' cm'];
//IEEE754 hex to float convert
function hex2float(num) {
  var sign = num & 0x80000000 ? -1 : 1;
  var exponent = ((num >> 23) & 0xff) - 127;
  var mantissa = 1 + (num & 0x7fffff) / 0x7fffff;
  return sign * mantissa * Math.pow(2, exponent);
}

function decodeUplink(input) {
  if (input.fPort != 3) {
    return {
      errors: ['unknown FPort'],
    };
  }

  switch (input.bytes.length) {
    case 21:
      var mag_x = (input.bytes[11] << 8) + input.bytes[12];
      var mag_y = (input.bytes[13] << 8) + input.bytes[14];
      var mag_z = (input.bytes[15] << 8) + input.bytes[16];
      return {
        // Decoded data
        data: {
          level: (input.bytes[5] << 8) + input.bytes[6],
          volt: ((input.bytes[9] << 8) + input.bytes[10]) / 100,
          alarmPark: Boolean(input.bytes[7] >> 4),
          alarmLevel: Boolean(input.bytes[7] & 0x0f),
          alarmMagnet: Boolean(input.bytes[8] >> 4),
          alarmBattery: Boolean(input.bytes[8] & 0x0f),
          xMagnet: mag_x > 32767 ? mag_x - 65536 : mag_x,
          yMagnet: mag_y > 32767 ? mag_y - 65536 : mag_y,
          zMagnet: mag_z > 32767 ? mag_z - 65536 : mag_z,
          Frame_Counter: (input.bytes[17] << 8) + input.bytes[18],
        },
      };

    case 17:
      var data_type = input.bytes[3];
      if (data_type === 0x03) {
        return {
          // Decoded parameter
          data: {
            firmware: input.bytes[5] + '.' + input.bytes[6],
            uploadInterval: input.bytes[7],
            ultraDetectInterval: input.bytes[8],
            magDetectInterval: input.bytes[9],
            magThreshold: (input.bytes[12] << 8) + input.bytes[13],
          },
        };
      }
    default:
      return {
        errors: ['wrong length'],
      };
  }
}

function encodeDownlink(input) {
  if (input.data.uploadInterval != null && !isNaN(input.data.uploadInterval)) {
    var periodic_interval = input.data.uploadInterval;
    var periodic_interval_high = periodic_interval.toString(16).padStart(2, '0').toUpperCase()[0].charCodeAt(0);
    var periodic_interval_low = periodic_interval.toString(16).padStart(2, '0').toUpperCase()[1].charCodeAt(0);
    if (periodic_interval > 168 || periodic_interval < 1) {
      return {
        errors: ['periodic upload interval range 1-168 hours.'],
      };
    } else {
      return {
        // LoRaWAN FPort used for the downlink message
        fPort: 3,
        // Encoded bytes
        bytes: [0x38, 0x30, 0x30, 0x32, 0x38, 0x38, 0x38, 0x38, 0x30, 0x31, periodic_interval_high, periodic_interval_low, 0x38, 0x31],
      };
    }
  }
  if (input.data.ultraDetectionInterval != null && !isNaN(input.data.ultraDetectionInterval)) {
    var detection_interval = input.data.ultraDetectionInterval;
    var detection_interval_high = detection_interval.toString(16).padStart(2, '0').toUpperCase()[0].charCodeAt(0);
    var detection_interval_low = detection_interval.toString(16).padStart(2, '0').toUpperCase()[1].charCodeAt(0);
    if (detection_interval > 60 || detection_interval < 1) {
      return {
        errors: ['ultra detection interval range 1-60 minutes.'],
      };
    } else {
      return {
        // LoRaWAN FPort used for the downlink message
        fPort: 3,
        // Encoded bytes
        bytes: [0x38, 0x30, 0x30, 0x32, 0x38, 0x38, 0x38, 0x38, 0x30, 0x33, detection_interval_high, detection_interval_low, 0x38, 0x31],
      };
    }
  }
  if (input.data.magDetectInterval != null && !isNaN(input.data.magDetectInterval)) {
    var detection_interval = input.data.magDetectInterval;
    var detection_interval_high = detection_interval.toString(16).padStart(2, '0').toUpperCase()[0].charCodeAt(0);
    var detection_interval_low = detection_interval.toString(16).padStart(2, '0').toUpperCase()[1].charCodeAt(0);
    if (detection_interval > 60 || detection_interval < 1) {
      return {
        errors: ['mag detection interval range 1-60 seconds.'],
      };
    } else {
      return {
        // LoRaWAN FPort used for the downlink message
        fPort: 3,
        // Encoded bytes
        bytes: [0x38, 0x30, 0x30, 0x32, 0x38, 0x38, 0x38, 0x38, 0x30, 0x34, detection_interval_high, detection_interval_low, 0x38, 0x31],
      };
    }
  }

  if (input.data.batteryThreshold != null && !isNaN(input.data.batteryThreshold)) {
    var batteryThreshold = input.data.batteryThreshold;
    var batteryThreshold_high = batteryThreshold.toString(16).padStart(2, '0').toUpperCase()[0].charCodeAt(0);
    var batteryThreshold_low = batteryThreshold.toString(16).padStart(2, '0').toUpperCase()[1].charCodeAt(0);
    if (batteryThreshold > 99 || batteryThreshold < 5) {
      return {
        errors: ['battery alarm threshold range 5-99 %.'],
      };
    } else {
      return {
        // LoRaWAN FPort used for the downlink message
        fPort: 3,
        // Encoded bytes
        bytes: [0x38, 0x30, 0x30, 0x32, 0x38, 0x38, 0x38, 0x38, 0x30, 0x35, batteryThreshold_high, batteryThreshold_low, 0x38, 0x31],
      };
    }
  }
  if (input.data.magThreshold != null && !isNaN(input.data.magThreshold)) {
    var magThreshold = input.data.magThreshold;
    var magThreshold_high = magThreshold.toString(16).padStart(2, '0').toUpperCase()[0].charCodeAt(0);
    var magThreshold_low = magThreshold.toString(16).padStart(2, '0').toUpperCase()[1].charCodeAt(0);
    if (magThreshold > 255 || magThreshold < 1) {
      return {
        errors: ['Geomagnet threshold range 1-255 mGs.'],
      };
    } else {
      return {
        // LoRaWAN FPort used for the downlink message
        fPort: 3,
        // Encoded bytes
        bytes: [0x38, 0x30, 0x30, 0x32, 0x38, 0x38, 0x38, 0x38, 0x30, 0x32, magThreshold_high, magThreshold_low, 0x38, 0x31],
      };
    }
  }

  return {
    errors: ['invalid downlink parameter.'],
  };
}

function decodeDownlink(input) {
  var input_length = input.bytes.length;
  if (input.fPort != 3) {
    return {
      errors: ['invalid FPort.'],
    };
  }

  if (
    input_length < 12 ||
    input.bytes[0] != 0x38 ||
    input.bytes[1] != 0x30 ||
    input.bytes[2] != 0x30 ||
    input.bytes[3] != 0x32 ||
    input.bytes[4] != 0x38 ||
    input.bytes[5] != 0x38 ||
    input.bytes[6] != 0x38 ||
    input.bytes[7] != 0x38 ||
    input.bytes[input_length - 2] != 0x38 ||
    input.bytes[input_length - 1] != 0x31
  ) {
    return {
      errors: ['invalid format.'],
    };
  }
  var option = parseInt(String.fromCharCode(input.bytes[8]) + String.fromCharCode(input.bytes[9]), 16);
  var value = parseInt(String.fromCharCode(input.bytes[10]) + String.fromCharCode(input.bytes[11]), 16);
  switch (option) {
    case 1:
      return {
        data: {
          uploadInterval: value,
        },
      };
    case 2:
      return {
        data: {
            magThreshold: value,
        },
      };
    case 3:
      return {
        data: {
          ultraDetectInterval: value,
        },
      };
    case 4:
      return {
        data: {
          magDetectInterval: value,
        },
      };
    case 5:
      return {
        data: {
          batteryThreshold: value,
        },
      };
    default:
      return {
        errors: ['invalid parameter key.'],
      };
  }
}
