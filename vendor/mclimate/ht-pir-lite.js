function decodeUplink(input) {
  try {
    var bytes = input.bytes;
    var data = {};

    function handleKeepalive(bytes, data) {
      // Byte 1, bit 2: occupied flag
      data.occupied = ((bytes[1] & 0x04) >> 2) === 1;

      // Byte 1 (bits 1:0) and byte 2: internal temperature, t[C] = (T[9:0] - 400) / 10
      var tempValue = ((bytes[1] & 0x03) << 8) | bytes[2];
      data.sensorTemperature = Number(((tempValue - 400) / 10).toFixed(2));

      // Byte 3: relative humidity, RH[%] = (XX * 100) / 256
      data.relativeHumidity = Number(((bytes[3] * 100) / 256).toFixed(2));

      // Byte 4: battery voltage, [mV] = ((XX * 2200) / 255) + 1600
      data.batteryVoltage = Number((((bytes[4] * 2200) / 255 + 1600) / 1000).toFixed(2));

      // Byte 5: PIR trigger count
      data.pirTriggerCount = bytes[5];

      return data;
    }

    function handleResponse(bytes, data) {
      var commands = bytes.map(function (byte) {
        return ('0' + byte.toString(16)).substr(-2);
      });
      // the last 6 bytes are the appended keepalive
      commands = commands.slice(0, -6);
      var command_len = 0;

      commands.map(function (command, i) {
        switch (command) {
          case '04':
            {
              command_len = 2;
              data.deviceVersions = { hardware: Number(commands[i + 1]), software: Number(commands[i + 2]) };
            }
            break;
          case '12':
            {
              command_len = 1;
              data.keepAliveTime = parseInt(commands[i + 1], 16);
            }
            break;
          case '19':
            {
              command_len = 1;
              data.joinRetryPeriod = (parseInt(commands[i + 1], 16) * 5) / 60;
            }
            break;
          case '1b':
            {
              command_len = 1;
              data.uplinkType = parseInt(commands[i + 1], 16);
            }
            break;
          case '1d':
            {
              command_len = 2;
              var wdpC = commands[i + 1] == '00' ? false : parseInt(commands[i + 1], 16);
              var wdpUc = commands[i + 2] == '00' ? false : parseInt(commands[i + 2], 16);
              data.watchDogParams = { wdpC: wdpC, wdpUc: wdpUc };
            }
            break;
          case '2f':
            {
              command_len = 1;
              data.uplinkSendingOnButtonPress = parseInt(commands[i + 1], 16);
            }
            break;
          case '37':
            {
              command_len = 1;
              data.pirSensorState = parseInt(commands[i + 1], 16);
            }
            break;
          case '39':
            {
              command_len = 2;
              data.occupancyTimeout = (parseInt(commands[i + 1], 16) << 8) | parseInt(commands[i + 2], 16);
            }
            break;
          case '3d':
            {
              command_len = 1;
              data.pirSensorStatus = parseInt(commands[i + 1], 16);
            }
            break;
          case '3f':
            {
              command_len = 1;
              data.pirSensorSensitivity = parseInt(commands[i + 1], 16);
            }
            break;
          case '49':
            {
              command_len = 1;
              data.pirMeasurementPeriod = parseInt(commands[i + 1], 16);
            }
            break;
          case '4b':
            {
              command_len = 1;
              data.pirCheckPeriod = parseInt(commands[i + 1], 16);
            }
            break;
          case '4d':
            {
              command_len = 1;
              data.pirBlindPeriod = parseInt(commands[i + 1], 16);
            }
            break;
          case 'a4':
            {
              command_len = 1;
              data.region = parseInt(commands[i + 1], 16);
            }
            break;
          case 'a6':
            {
              command_len = 1;
              data.crystalOscillatorError = true;
            }
            break;
          default:
            break;
        }
        commands.splice(i, command_len);
      });
      return data;
    }

    if (bytes[0] === 0x81) {
      // keepalive message
      data = handleKeepalive(bytes, data);
    } else {
      // command response, with the keepalive appended after the responses
      data = handleResponse(bytes, data);
      if (bytes.length >= 6) {
        bytes = bytes.slice(-6);
        data = handleKeepalive(bytes, data);
      }
    }

    return { data: data };
  } catch (e) {
    throw new Error('Unhandled data');
  }
}

function normalizeUplink(input) {
  return {
    data: {
      air: {
        temperature: input.data.sensorTemperature,
        relativeHumidity: input.data.relativeHumidity,
      },
      battery: input.data.batteryVoltage,
      action: {
        motion: {
          detected: input.data.occupied,
          count: input.data.pirTriggerCount,
        },
      },
    },
  };
}
