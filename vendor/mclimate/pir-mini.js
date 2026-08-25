function decodeUplink(input) {
  try {
    var bytes = input.bytes;
    var data = {};

    function handleKeepalive(bytes, data) {
      // Byte 1 (bits 1:0) and byte 2: internal temperature, t[C] = (T[9:0] - 400) / 10
      var tempValue = ((bytes[1] & 0x03) << 8) | bytes[2];
      data.sensorTemperature = Number(((tempValue - 400) / 10).toFixed(2));

      // Byte 3: relative humidity, RH[%] = (XX * 100) / 256
      data.relativeHumidity = Number(((bytes[3] * 100) / 256).toFixed(2));

      // Bytes 4-5: light sensor data (lux)
      // 0x0000-0xFFFA valid range, 0xFFFF sensor disabled, 0xFFFB-0xFFFE sensor error
      var rawLux = (bytes[4] << 8) | bytes[5];
      if (rawLux <= 0xfffa) {
        data.lux = rawLux;
        data.luxStatus = 'ok';
      } else if (rawLux === 0xffff) {
        data.lux = 0;
        data.luxStatus = 'disabled';
      } else {
        data.lux = 0;
        data.luxStatus = 'sensor_error';
      }

      // Byte 6: battery voltage, [mV] = ((XX * 2200) / 255) + 1600
      data.batteryVoltage = Number((((bytes[6] * 2200) / 255 + 1600) / 1000).toFixed(2));

      // Byte 7, bit 0: occupancy flag
      data.occupied = (bytes[7] & 0x01) === 1;

      // Bytes 8-9: PIR trigger count
      data.pirTriggerCount = (bytes[8] << 8) | bytes[9];

      return data;
    }

    function handleResponse(bytes, data) {
      var commands = bytes.map(function (byte) {
        return ('0' + byte.toString(16)).substr(-2);
      });
      // the last 10 bytes are the appended keepalive
      commands = commands.slice(0, -10);
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
          case '1f':
            {
              command_len = 1;
              data.lightSensorState = parseInt(commands[i + 1], 16);
            }
            break;
          case '22':
            {
              command_len = 1;
              data.ledBrightness = parseInt(commands[i + 1], 16);
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
          case '3a':
            {
              command_len = 0;
              data.event = 'occupied';
            }
            break;
          case '3b':
            {
              command_len = 0;
              data.event = 'unoccupied';
            }
            break;
          case '3d':
            {
              command_len = 1;
              data.pirDemoMode = parseInt(commands[i + 1], 16);
            }
            break;
          case '3f':
            {
              command_len = 1;
              data.pirOperationMode = parseInt(commands[i + 1], 16);
            }
            break;
          case '40':
            {
              command_len = 0;
              data.event = 'pirTrigger';
            }
            break;
          case '42':
            {
              command_len = 2;
              data.pirBlindTime = (parseInt(commands[i + 1], 16) << 8) | parseInt(commands[i + 2], 16);
            }
            break;
          case '44':
            {
              command_len = 1;
              data.pirCounterResetFlag = parseInt(commands[i + 1], 16);
            }
            break;
          case 'a4':
            {
              command_len = 1;
              data.region = parseInt(commands[i + 1], 16);
            }
            break;
          default:
            break;
        }
        commands.splice(i, command_len);
      });
      return data;
    }

    if (bytes[0] === 0x01) {
      // keepalive message
      data = handleKeepalive(bytes, data);
    } else {
      // command response or event, with the keepalive appended at the end
      data = handleResponse(bytes, data);
      if (bytes.length >= 10) {
        bytes = bytes.slice(-10);
        data = handleKeepalive(bytes, data);
      }
    }

    return { data: data };
  } catch (e) {
    throw new Error('Unhandled data');
  }
}

function normalizeUplink(input) {
  var air = {
    temperature: input.data.sensorTemperature,
    relativeHumidity: input.data.relativeHumidity,
  };
  if (input.data.luxStatus === 'ok') {
    air.lightIntensity = input.data.lux;
  }
  return {
    data: {
      air: air,
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
