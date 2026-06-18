function decodeUplink(input) {
  switch (input.fPort) {
      case 10:
        bytes = input.bytes;
        var data = {};
        for (i=0 ; i<bytes.length; i++) {
            switch (bytes[i]) {
              case 0x03:
                data.hw_version = bytes[++i];
                data.capabilities = (bytes[++i] << 8)+  bytes[++i];
                break;
              case 0x04:
                p = bytes[++i];
                v = (bytes[++i] << 8)+  bytes[++i];
                switch (p) {
                    case 0x01:
                        data.c_interval=v;
                        break;
                    case 0x02:
                        data.c_messagetype=v;
                        break;
                    case 0x03:
                        data.c_tempscale=v;
                        break;
                    case 0x04:
                        data.c_alarmrepeat=v;
                        break;
                    case 0x05:
                        data.c_valvetraining=v;
                        break;
                    case 0x06:
                        data.c_localui=v;
                        break;
                     case 0x07:
                        data.c_tempthreshold=v;
                        break;
                 default:
                    data.error = "config parameter? "+bytes[i];
                }
                break;
              case 0x06:
                  sensor = bytes[++i];
                  sensorvalue = (bytes[++i] << 8)+  bytes[++i];
                  switch(sensor) {
                      case 0x01:
                          data.temperature = sensorvalue;
                          break;
                     default:
                      data.error = "sensor type? "+bytes[i];
                  }
                break;
              case 0x07:
                data.state = bytes[++i];
                break;
              case 0x0a:
                data.fw_version = (bytes[++i] << 24) +(bytes[++i] << 16) + (bytes[++i] << 8) + bytes[++i];
                break;
              case 0x0b:
                data.alarm_status = bytes[++i];
                data.alarm_type = bytes[++i];
                data.alarm_value = (bytes[++i] << 8)+  bytes[++i];
                break;
              default:
                data.error = "command? "+bytes[i];
            }
          }
        return {data:data}
      default:
        return {
          errors: ['invalid FPort'],
        };
      }
  }


function encodeDownlink(input) {
  cmd = input.data.cmd;
  switch (String(cmd)) {
    case "set valve on":
      return {
        fPort: 10,
        bytes: [0x07, 0xff],
      };
    case "set valve off":
      return {
        fPort: 10,
        bytes: [0x07, 0x00],
      };
    case "clear alarm":
      return {
        fPort: 10,
        bytes: [0x0b, 0x00],
      };
    case "get valve":
      return {
        fPort: 10,
        bytes: [0x17],
      };
    case "get hw":
      return {
        fPort: 10,
        bytes: [0x03],
      };
    case "get fw":
      return {
        fPort: 10,
        bytes: [0x1a],
      };
    case "get config":
      return {
        fPort: 10,
        bytes: [0x14, input.data.parameter],
      };
    case "set config":
      return {
        fPort: 10,
        bytes: [0x04, input.data.parameter, (input.data.value>>8) & 0xff, input.data.value & 0xff],
      };
  }
}

function decodeDownlink(input) {
  bytes = input.bytes;
  data = {};
  if (input.fPort != 10)
    return {
        errors: ['invalid FPort'],
    };

  switch (bytes[0]) {
    case 0x03:
      data.cmd = "get hw";
      break;
    case 0x1a:
      data.cmd = "get fw";
      break;
    case 0x17:
      data.cmd = "get valve";
      break;
    case 0x07:
      if (bytes[1]==0xff) data.cmd = "set valve on";
      else data.cmd = "set valve off";
      break;
    case 0x0b:
      if (bytes[1]== 0x00) data.cmd = "clear alarm";
      break;
    case 0x17:
      data.cmd = "get valve";
      break;
    case 0x14:
      data.cmd = "get config";
      data.parameter = bytes[1];
      break;
    case 0x04:
      data.cmd = "set config";
      data.parameter = bytes[1];
      data.value =  (bytes[2] << 8)+  bytes[3];
      break;
  }
  return {data:data}
}

