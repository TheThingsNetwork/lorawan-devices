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
          empty: Boolean(input.bytes[11] >> 4),
          battery: Boolean(input.bytes[12] & 0x0f),
          temperature: input.bytes[8] + units[0],
          frame_counter: (input.bytes[13] << 8) + input.bytes[14],
        },
      };
    case 25:
      var data_type = input.bytes[3];
      if (data_type === 0x03) {
        return {
          // Decoded parameter
          data: {
            periodic_upload_interval: input.bytes[7] > 60 ? input.bytes[7] - 60 + units[1] : input.bytes[7] + units[2],
            empty_alarm_threshold: input.bytes[9] + units[5],
          },
        };
      } else {
        return {
          // Decoded data
          data: {
            level: (input.bytes[5] << 8) + input.bytes[6] + units[3],
            longitude: hex2float((input.bytes[11] << 24) + (input.bytes[10] << 16) + (input.bytes[9] << 8) + input.bytes[8]).toFixed(6),
            latitude: hex2float((input.bytes[15] << 24) + (input.bytes[14] << 16) + (input.bytes[13] << 8) + input.bytes[12]).toFixed(6),
            empty: Boolean(input.bytes[19] >> 4),
            battery: Boolean(input.bytes[20] & 0x0f),
            temperature: input.bytes[16] + units[0],
            frame_counter: (input.bytes[21] << 8) + input.bytes[22],
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
  if (input.data.periodic_upload_interval != null && !isNaN(input.data.periodic_upload_interval)) {
    var periodic_interval = input.data.periodic_upload_interval;
    var periodic_interval_high = periodic_interval.toString(16).padStart(2, '0').toUpperCase()[0].charCodeAt(0);
    var periodic_interval_low = periodic_interval.toString(16).padStart(2, '0').toUpperCase()[1].charCodeAt(0);
    if (periodic_interval > 84 || periodic_interval < 1) {
      return {
        errors: ['periodic upload interval range 1-84. 1-60: 1-60 minutes, 61-84:1-24 hours.'],
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

  if (input.data.empty_alarm_threshold != null && !isNaN(input.data.empty_alarm_threshold)) {
    var empty_alarm_threshold = input.data.empty_alarm_threshold;
    var empty_alarm_threshold_high = empty_alarm_threshold.toString(16).padStart(2, '0').toUpperCase()[0].charCodeAt(0);
    var empty_alarm_threshold_low = empty_alarm_threshold.toString(16).padStart(2, '0').toUpperCase()[1].charCodeAt(0);
    if (empty_alarm_threshold > 255 || empty_alarm_threshold < 15) {
      return {
        errors: ['empty alarm threshold range 15-255 cm.'],
      };
    } else {
      return {
        // LoRaWAN FPort used for the downlink message
        fPort: 3,
        // Encoded bytes
        bytes: [0x38, 0x30, 0x30, 0x32, 0x39, 0x39, 0x39, 0x39, 0x30, 0x32, empty_alarm_threshold_high, empty_alarm_threshold_low, 0x38, 0x31],
      };
    }
  }

  if (input.data.gps_enable != null && input.data.gps_enable === !!input.data.gps_enable) {
    var gps_enable = input.data.gps_enable;
    if (gps_enable === true) {
      return {
        // LoRaWAN FPort used for the downlink message
        fPort: 3,
        // Encoded bytes
        bytes: [0x38, 0x30, 0x30, 0x32, 0x39, 0x39, 0x39, 0x39, 0x30, 0x39, 0x30, 0x31, 0x38, 0x31],
      };
    } else {
      return {
        // LoRaWAN FPort used for the downlink message
        fPort: 3,
        // Encoded bytes
        bytes: [0x38, 0x30, 0x30, 0x32, 0x39, 0x39, 0x39, 0x39, 0x30, 0x39, 0x30, 0x30, 0x38, 0x31],
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
          periodic_upload_interval: value,
        },
      };
    case 2:
      return {
        data: {
          empty_alarm_threshold: value,
        },
      };

    case 9:
      switch (value) {
        case 0x00:
          return {
            data: {
              gps_enable: false,
            },
          };
        case 0x01:
          return {
            data: {
              gps_enable: true,
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
