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
    case 17:
      return {
        // Decoded data
        data: {
          level: (input.bytes[5] << 8) + input.bytes[6] + units[3],
          full: Boolean(input.bytes[11] >> 4),
          fire: Boolean(input.bytes[11] & 0x0f),
          tilt: Boolean(input.bytes[12] >> 4),
          battery: Boolean(input.bytes[12] & 0x0f),
          angle: (input.bytes[9] & (0x0f === 0x00) ? input.bytes[10] : 0 - input.bytes[10]) + units[4],
          temperature: input.bytes[8] + units[0],
        },
      };
    case 25:
      //(input.bytes[11]<<24)+(input.bytes[10]<<16)+(input.bytes[9]<<8)+input.bytes[8];
      //var gps_long = float(0x42E903CD);
      //console.log(gps_long);
      var data_type = input.bytes[3];
      if (data_type === 0x03) {
        return {
          // Decoded parameter
          data: {
            periodic_interval: input.bytes[7] + units[1],
            detection_interval: input.bytes[8] + units[2],
            full_alarm_threshold: input.bytes[9] + units[5],
            fire_alarm_threshold: input.bytes[10] + units[0],
            tilt_alarm_threshold: input.bytes[11] + units[4],
            tilt_enable: Boolean(input.bytes[12]),
            ultrasonic_range: (input.bytes[13] === 0x00 ? 2000 : 5000) + units[3],
          },
        };
      } else {
        return {
          // Decoded data
          data: {
            level: (input.bytes[5] << 8) + input.bytes[6] + units[3],
            longitude: hex2float((input.bytes[11] << 24) + (input.bytes[10] << 16) + (input.bytes[9] << 8) + input.bytes[8]).toFixed(6),
            latitude: hex2float((input.bytes[15] << 24) + (input.bytes[14] << 16) + (input.bytes[13] << 8) + input.bytes[12]).toFixed(6),
            full: Boolean(input.bytes[19] >> 4),
            fire: Boolean(input.bytes[19] & 0x0f),
            tilt: Boolean(input.bytes[20] >> 4),
            battery: Boolean(input.bytes[20] & 0x0f),
            angle: (input.bytes[17] & (0x0f === 0x00) ? input.bytes[18] : 0 - input.bytes[18]) + units[4],
            temperature: input.bytes[16] + units[0],
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
  if (input.data.periodic_interval != null && !isNaN(input.data.periodic_interval)) {
    var periodic_interval = input.data.periodic_interval;
    var periodic_interval_high = periodic_interval.toString(16).padStart(2, '0').toUpperCase()[0].charCodeAt(0);
    var periodic_interval_low = periodic_interval.toString(16).padStart(2, '0').toUpperCase()[1].charCodeAt(0);
    if (periodic_interval > 168 || periodic_interval < 1) {
      return {
        errors: ['periodic interval range 1-168 hours.'],
      };
    } else {
      return {
        // LoRaWAN FPort used for the downlink message
        fPort: 3,
        // Encoded bytes
        bytes: [0x38, 0x30, 0x30, 0x32, 0x39, 0x39, 0x39, 0x39, 0x30, 0x31, periodic_interval_high, periodic_interval_low, 0x38, 0x31],
      };
    }
  }
  if (input.data.detection_interval != null && !isNaN(input.data.detection_interval)) {
    var detection_interval = input.data.detection_interval;
    var detection_interval_high = detection_interval.toString(16).padStart(2, '0').toUpperCase()[0].charCodeAt(0);
    var detection_interval_low = detection_interval.toString(16).padStart(2, '0').toUpperCase()[1].charCodeAt(0);
    if (detection_interval > 60 || detection_interval < 1) {
      return {
        errors: ['detection interval range 1-60 minutes.'],
      };
    } else {
      return {
        // LoRaWAN FPort used for the downlink message
        fPort: 3,
        // Encoded bytes
        bytes: [0x38, 0x30, 0x30, 0x32, 0x39, 0x39, 0x39, 0x39, 0x30, 0x38, detection_interval_high, detection_interval_low, 0x38, 0x31],
      };
    }
  }
  if (input.data.full_alarm_threshold != null && !isNaN(input.data.full_alarm_threshold)) {
    var full_alarm_threshold = input.data.full_alarm_threshold;
    var full_alarm_threshold_high = full_alarm_threshold.toString(16).padStart(2, '0').toUpperCase()[0].charCodeAt(0);
    var full_alarm_threshold_low = full_alarm_threshold.toString(16).padStart(2, '0').toUpperCase()[1].charCodeAt(0);
    if (full_alarm_threshold > 255 || full_alarm_threshold < 15) {
      return {
        errors: ['full alarm threshold range 15-255 cm.'],
      };
    } else {
      return {
        // LoRaWAN FPort used for the downlink message
        fPort: 3,
        // Encoded bytes
        bytes: [0x38, 0x30, 0x30, 0x32, 0x39, 0x39, 0x39, 0x39, 0x30, 0x32, full_alarm_threshold_high, full_alarm_threshold_low, 0x38, 0x31],
      };
    }
  }
  if (input.data.fire_alarm_threshold != null && !isNaN(input.data.fire_alarm_threshold)) {
    var fire_alarm_threshold = input.data.fire_alarm_threshold;
    var fire_alarm_threshold_high = fire_alarm_threshold.toString(16).padStart(2, '0').toUpperCase()[0].charCodeAt(0);
    var fire_alarm_threshold_low = fire_alarm_threshold.toString(16).padStart(2, '0').toUpperCase()[1].charCodeAt(0);
    if (fire_alarm_threshold > 255 || fire_alarm_threshold < 0) {
      return {
        errors: ['fire alarm threshold range 0-255 ℃.'],
      };
    } else {
      return {
        // LoRaWAN FPort used for the downlink message
        fPort: 3,
        // Encoded bytes
        bytes: [0x38, 0x30, 0x30, 0x32, 0x39, 0x39, 0x39, 0x39, 0x30, 0x33, fire_alarm_threshold_high, fire_alarm_threshold_low, 0x38, 0x31],
      };
    }
  }
  if (input.data.tilt_alarm_threshold != null && !isNaN(input.data.tilt_alarm_threshold)) {
    var tilt_alarm_threshold = input.data.tilt_alarm_threshold;
    var tilt_alarm_threshold_high = tilt_alarm_threshold.toString(16).padStart(2, '0').toUpperCase()[0].charCodeAt(0);
    var tilt_alarm_threshold_low = tilt_alarm_threshold.toString(16).padStart(2, '0').toUpperCase()[1].charCodeAt(0);
    if (tilt_alarm_threshold > 90 || tilt_alarm_threshold < 15) {
      return {
        errors: ['tilt alarm threshold range 15-90 °.'],
      };
    } else {
      return {
        // LoRaWAN FPort used for the downlink message
        fPort: 3,
        // Encoded bytes
        bytes: [0x38, 0x30, 0x30, 0x32, 0x39, 0x39, 0x39, 0x39, 0x30, 0x34, tilt_alarm_threshold_high, tilt_alarm_threshold_low, 0x38, 0x31],
      };
    }
  }
  if (input.data.tilt_enable != null && input.data.tilt_enable === !!input.data.tilt_enable) {
    var tilt_enable = input.data.tilt_enable;
    if (tilt_enable === true) {
      return {
        // LoRaWAN FPort used for the downlink message
        fPort: 3,
        // Encoded bytes
        bytes: [0x38, 0x30, 0x30, 0x32, 0x39, 0x39, 0x39, 0x39, 0x30, 0x39, 0x30, 0x41, 0x38, 0x31],
      };
    } else {
      return {
        // LoRaWAN FPort used for the downlink message
        fPort: 3,
        // Encoded bytes
        bytes: [0x38, 0x30, 0x30, 0x32, 0x39, 0x39, 0x39, 0x39, 0x30, 0x39, 0x30, 0x39, 0x38, 0x31],
      };
    }
  }
  if (input.data.ultrasonic_range != null && !isNaN(input.data.ultrasonic_range)) {
    var ultrasonic_range = input.data.ultrasonic_range;
    if (ultrasonic_range === 2 || ultrasonic_range === 5) {
      return {
        // LoRaWAN FPort used for the downlink message
        fPort: 3,
        // Encoded bytes
        bytes: [0x38, 0x30, 0x30, 0x32, 0x39, 0x39, 0x39, 0x39, 0x30, 0x39, ultrasonic_range === 2 ? 0x30 : 0x31, ultrasonic_range === 2 ? 0x37 : 0x33, 0x38, 0x31],
      };
    } else {
      return {
        errors: ['ultrasonic range 2 or 5 meters.'],
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
    input.bytes[4] != 0x39 ||
    input.bytes[5] != 0x39 ||
    input.bytes[6] != 0x39 ||
    input.bytes[7] != 0x39 ||
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
          periodic_interval: value,
        },
      };
    case 8:
      return {
        data: {
          detection_interval: value,
        },
      };
    case 2:
      return {
        data: {
          full_alarm_threshold: value,
        },
      };
    case 3:
      return {
        data: {
          fire_alarm_threshold: value,
        },
      };
    case 4:
      return {
        data: {
          tilt_alarm_threshold: value,
        },
      };
    case 9:
      switch (value) {
        case 0x07:
          return {
            data: {
              ultrasonic_range: 2,
            },
          };
        case 0x13:
          return {
            data: {
              ultrasonic_range: 5,
            },
          };
        case 0x09:
          return {
            data: {
              tilt_enable: false,
            },
          };
        case 0x0a:
          return {
            data: {
              tilt_enable: true,
            },
          };
        default:
          return {
            errors: ['invalid parameter value.'],
          };
      }
    default:
      return {
        errors: ['invalid parameter key.'],
      };
  }
}
