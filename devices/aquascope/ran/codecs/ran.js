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
                data.conf_system=v;
                break;
              case 0x02:
                data.conf_heartbeat=v;
                break;
              case 0x03:
                data.conf_heavyrain=v;
                break;
              case 0x04:
                data.conf_interval=v;
                break;
              default:
                if (p > 16) data.error = "config parameter? "+bytes[i];
                else {
                  data.conf_parameter = p;
                  data.conf_value = v;
                }
              }
            break;
            case 0x06:
              sensor = bytes[++i];
                sensorvalue = (bytes[++i] << 8)+  bytes[++i];
                switch(sensor) {
                case 0x01:
                    if (sensorvalue < 0x4000)
                      data.temperature_C = sensorvalue/10.0;
                    else
                      data.temperature_C = (sensorvalue - 0xffff)/10.0;
                    break;
                case 0x02:
                      data.humidity = sensorvalue;
                    break;
                case 0x03:
                    data.uptime = sensorvalue;
                    break;
                case 0x08:
                    if (sensorvalue < 0x4000)
                      data.airtemperature_C = sensorvalue/10.0;
                    else
                      data.airtemperature_C = (sensorvalue - 0xffff)/10.0;
                    break;
                case 0x11:
                    data.consumption = sensorvalue;
                    break;
                case 0x12:
                    data.flow = sensorvalue;
                    break;
                case 0x81:
                    data.rainlevel = sensorvalue * 0.5 ; // 1 == 500 ml
                    break;
                  default:
                      data.error = "sensor type? "+bytes[i];
                }
            break;
          case 0x07:
              data.motorposition = bytes[++i];
              break;
          case 0x0a:
              data.fw_version = (bytes[++i] << 24) +(bytes[++i] << 16) + (bytes[++i] << 8) + bytes[++i];
              break;
          case 0x0b:
              data.a_status = bytes[++i];
              data.a_type = bytes[++i];
              data.a_value = (bytes[++i] << 8)+  bytes[++i];
              var val;
              switch (data.a_type) {
                case 0x01:
                  data.alarm = "Flood";
                  val = " ";
                  break;
                case 0x02:
                  data.alarm = "Temperature Low";
                    if (data.a_value > 0x4000)
                      data.a_value = (data.a_value - 0xffff)/10.0;
                  val = " with " + data.a_value + " C";
                  break;
                case 0x03:
                  data.alarm = "Heavyrain";
                  val = " with " + data.a_value + " l/m3";
                  break;
                case 0x04:
                  data.alarm = "Humidity";
                  val = " with " + data.a_value + " %";
                  break;
                case 0x05:
                  data.alarm = "Vibration";
                  val = " device";
                  break;
                case 0x06:
                  data.alarm = "Temperature High";
                    if (data.a_value > 0x4000)
                      data.a_value = (data.a_value - 0xffff)/10.0;
                  val = " with " + data.a_value + " C";
                  break;
                case 0x07:
                  data.alarm = "Air Temperature Low";
                    if (data.a_value > 0x4000)
                      data.a_value = (data.a_value - 0xffff)/10.0;
                  val = " with " + data.a_value + " C";
                  break;
                case 0x0c:
                  data.alarm = "Battery";
                  val = " with " + data.a_value +  " mAh";
                  break;
                default:
                  data.error = "Alarm? "+data.a_type;
                  break;
              }
              if (data.a_status) data.alarm += " on" + val; else data.alarm += " off" + val;
              break;
          case 0x12:
              data.bat_volt = (bytes[++i])/10.0;
              data.bat_mAh = (bytes[++i] << 8) + bytes[++i];
              break;
          case 0x33:
              data.duration = (bytes[++i] << 8)+  bytes[++i];
              data.diff = (bytes[++i] << 8)+  bytes[++i];
                break;
          default:
              data.error = "command? "+bytes[i];
          }
        }
      return { data: data};
    default:
      return {errors: ['invalid FPort']};
    }
}

function encodeDownlink(input) {
  cmd = input.data.cmd;
  switch (String(cmd)) {
    case "config_set":
      return {
        fPort: 10,
        bytes: [0x04, input.data.parameter, (input.data.value>>8) & 0xff, input.data.value & 0xff],
      };
    case "get_hw":
      return {
        fPort: 10,
        bytes: [0x03],
      };
    case "get_fw":
      return {
        fPort: 10,
        bytes: [0x1a],
      };
    case "config_get":
      return {
        fPort: 10,
        bytes: [0x14, input.data.parameter],
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
    case 0x04:
      data.cmd = "config_set";
      data.parameter = bytes[1];
      data.value =  (bytes[2] << 8)+  bytes[3];
      break;
    case 0x03:
      data.cmd = "get_hw";
      break;
    case 0x0a:
      data.cmd = "get_fw";
      break;
    case 0x04:
      data.cmd = "config_get";
      data.parameter = bytes[1];
      break;
  }
  return {data:data}
}
