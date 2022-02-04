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
                        data.c_system=v;
                        break;
                    case 0x02:
                        data.c_algo=v;
                        break;
                    case 0x03:
                        data.c_lora=v;
                        break;
                    case 0x04:
                        data.c_valveaction=v;
                        break;
                    case 0x05:
                        data.c_normpressure=v;
                        break;
                    case 0x06:
                        data.c_overpressure_th=v;
                        break;
                    case 0x07:
                        data.c_underpressure_th=v;
                        break;
                    case 0x09:
                        data.c_jamming=v;
                        break;
                    case 0x0a:
                        data.c_flow_th=v;
                        break;
                    case 0x0b:
                        data.c_frost_th=v;
                        break;
                    case 0x0d:
                        data.c_pc_duration=v;
                        break;
                    case 0x0e:
                        data.c_pc_abort_th=v;
                        break;
                    case 0x0f:
                        data.c_pc_alarm_th_th=v;
                        break;
                    case 19:
                        data.c_alarm=v;
                        break;
                    case 29:
                        data.c_report_interval=v;
                        break;
                    case 30:
                        data.c_heartbeat_interval=v;
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
                      case 0x03:
                          data.uptime = sensorvalue;
                          break;
                      case 0x10:
                          data.pressure = sensorvalue;
                          break;
                      case 0x11:
                          data.consumption = sensorvalue;
                          break;
                      case 0x13:
                          data.batterylevel = sensorvalue;
                          break;
                     default:
                      data.error = "sensor type? "+bytes[i];
                  }
                break;
              case 0x07:
                state = bytes[++i];
                if(state == 0) data.valve=0;
                else if (state == 1) {
                  data.flow=0;
                  data.conumption_time = (bytes[++i] << 8)+  bytes[++i];
                  data.conumption_liter = (bytes[++i] << 8)+  bytes[++i];
                }
                else if (state == 2) data.pc = "ok";
                else if (state == 3) {
                  data.pc = "alarm";
                  data.diff = (bytes[++i] << 8)+  bytes[++i] ;
                  data.elevation = (bytes[++i] << 8)+  bytes[++i];
                }
                else if (state == 4 || state==7) data.pc = "abort/flow";
                else if (state == 5) data.pc = "abort/heat";
                else if (state == 6) data.pc = "abort/valve";
                else if (state == 8) data.pc = "pending";
                else if (state == 0x0f) data.flow = 1;
                else data.valve = 255;
                break;
              case 0x08:
                data.loglevel = bytes[++i];
                data.log = bytes;
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
    case "reset":
      return {
        fPort: 10,
        bytes: [0x01, 0x01],
      };
    case "factory default":
      return {
        fPort: 10,
        bytes: [0x01, 0x02],
      };
    case "pipecheck start":
      return {
        fPort: 10,
        bytes: [0x01, 0x03],
      };
    case "get sensor":
      return {
        fPort: 10,
        bytes: [0x06, input.data.sensor],
      };
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
    case 0x01:
      if (bytes[1]==0x01)  data.cmd ="reset";
      else if (bytes[1]==0x02) data.cmd ="factory default";
      else if (bytes[1]==0x03) data.cmd ="pipecheck start";
      break;
    case 0x06:
      data.cmd = "get sensor";
      data.sensor = bytes[1];
      break;
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

