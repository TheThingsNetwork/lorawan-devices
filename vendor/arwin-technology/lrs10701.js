var lrs10701_events = ['heartbeat/button', 'rsvd', 'T/H', 'CO2', 'EC1', 'EC2', 'TVOC', 'PMx'];
var sensor_list = ['T/H', 'TVOC', 'CO2', 'PMx', 'Gas1', 'Gas2'];
var gas_sensor_type = ['None', 'NH3', 'H2S', 'NO2', 'CO', 'HCHO', 'Custom'];

function hex2dec(hex) {
  var dec = hex&0xffff;
  if (dec & 0x8000)
    dec = -(0x10000-dec);
  return dec;
}

function decodeUplink(input) {
  switch (input.fPort) {
    case 10: // sensor data
      var evt="";
      for (let i=0; i<8; i++) {
        if ((0x01<<i)&input.bytes[0]) 
          if (evt==="")
            evt=lrs10701_events[i];
          else
            evt=evt+","+lrs10701_events[i];
      }
      var aqi_co2_t = input.bytes[1]<<24|input.bytes[2]<<16|input.bytes[3]<<8|input.bytes[4];
      return {
        data: {
              event: evt,
              aqi: (aqi_co2_t>>23)&0x1ff,
              co2: (aqi_co2_t>>10&0x1fff),
              temperature: (hex2dec(aqi_co2_t&0x3ff)-300)/10,
              humidity: input.bytes[5]*0.5,
              gas1: (input.bytes[6]<<8|input.bytes[7])/1000,
              gas2: (input.bytes[8]<<8|input.bytes[9])/1000,
              battery: input.bytes[10],
            },
        };
    case 11: // sensor data
      return {
        data: {
          tvoc: (input.bytes[0]<<8|input.bytes[1]),
          "pm1.0": (input.bytes[2]<<16|input.bytes[3]<<8|input.bytes[4])/1000,
          "pm2.5": (input.bytes[5]<<16|input.bytes[6]<<8|input.bytes[7])/1000,
          "pm10": (input.bytes[8]<<16|input.bytes[9]<<8|input.bytes[10])/1000,
        }
      };
    case 8: // version
      var ver = input.bytes[0]+"."+("00"+input.bytes[1]).slice(-2)+"."+("000"+(input.bytes[2]<<8|input.bytes[3])).slice(-3);    
      return {
        data: {
          firmwareVersion: ver,
        }
      };
    case 12: // device settings
      var sensor_ok="";
      for (let i=0; i<8; i++) {
        if ((0x01<<i)&input.bytes[3]) 
          if (sensor_ok==="")
            sensor_type=sensor_list[i];
          else
            sensor_type=sensor_type+","+sensor_list[i];
        if ((0x01<<i)&input.bytes[4]) 
          if (sensor_ok==="")
            sensor_ok=sensor_list[i];
          else
            sensor_ok=sensor_ok+","+sensor_list[i];
      }
      return {
        data: {
          dataUploadInterval: hex2dec(input.bytes[0]<<8|input.bytes[1]),
          statusLED: input.bytes[2] === 1 ? "on" : "off",
          sensorType: sensor_type,
          sensorStatus: sensor_ok,
          gas1Type: gas_sensor_type[input.bytes[5]],
          gas2Type: gas_sensor_type[input.bytes[6]],
        }
      };
    case 13: // threshold settings
      switch (input.bytes[0]) {
        case 0:
          return {
            data: {
              highTemperatureThreshold: hex2dec(input.bytes[1]<<8|input.bytes[2]),
              lowTemperatureThreshold: hex2dec(input.bytes[3]<<8|input.bytes[4]),
              highHumidityThreshold: (input.bytes[5]),
              lowHumidityThreshold: (input.bytes[6]),
            }
          };
        case 1:
          return {
            data: {
              co2Threshold: (input.bytes[1]<<8|input.bytes[2]),
              tvocThreshold: (input.bytes[3]<<8|input.bytes[4]),
              gas1Threshold: (input.bytes[5]<<8|input.bytes[6])/1000,
              gas2Threshold: (input.bytes[7]<<8|input.bytes[8])/1000,
            }
          };
        case 2:
          return {
            data: {
              'pm1.0 Threshold': (input.bytes[1]<<16|input.bytes[2]<<8|input.bytes[3]),
              'pm2.5 Threshold': (input.bytes[4]<<16|input.bytes[5]<<8|input.bytes[6]),
              'pm10 Threshold': (input.bytes[7]<<16|input.bytes[8]<<8|input.bytes[9]),
            }
          };
        default:
          return {
            errors: ['unknown packet type']
          };
      }
      break;
    default:
      return {
        errors: ['unknown FPort'],
      };
  }
}

function encodeDownlink(input) {
  var payload = [];

  if (input.data.cmd === 'getFirmwareVersion') {
    return {
      fPort: 20,
      bytes: [0]
    };
  }
  else if (input.data.cmd === 'getDeviceSettings') {
    return {
      fPort: 21,
      bytes: [0]
    };
  }
  else if (input.data.cmd === 'getThresholdSettings') {
    return {
      fPort: 21,
      bytes: [1]
    } ;   
  }
  else if (input.data.cmd === 'setDeviceSettings') {
    var ult = input.data.dataUploadInterval;
    var led = input.data.statusLED === 'on'?1:0;
    var dack = 1;
    return {
      fPort: 22,
      bytes: payload.concat(ult>>8,ult&0xff,led,dack)
    };
  }
  else if (input.data.cmd === 'setTHThresholds') {
    var htth = (input.data.highTemperatureThreshold&0xffff);
    var ltth = (input.data.lowTemperatureThreshold&0xffff);
    var hhth = input.data.highHumidityThreshold;
    var lhth = input.data.lowHumidityThreshold;
    return {
      fPort: 23,
      bytes: payload.concat(0,htth>>8,htth&0xff,ltth>>8,ltth&0xff,hhth,lhth)
    };
  }
  else if (input.data.cmd === 'setGasesThresholds') {
    var co2th = input.data.co2Threshold;
    var tvocth = input.data.tvocThreshold;
    var g1th = input.data.gas1Threshold*1000;
    var g2th = input.data.gas2Threshold*1000;
    return {
      fPort: 23,
      bytes: payload.concat(1,co2th>>8,co2th&0xff,tvocth>>8,tvocth&0xff,g1th>>8,g1th&0xff,g2th>>8,g2th&0xff)
    };   
  }
  else if (input.data.cmd === 'setPMThresholds') {
    var pm1p0th = input.data['pm1.0 Threshold'];
    var pm2p5th = input.data['pm2.5 Threshold'];
    var pm10th = input.data['pm10 Threshold'];
    return {
      fPort: 23,
      bytes: payload.concat(2,pm1p0th>>16,(pm1p0th>>8)&0xff,pm1p0th&0xff,pm2p5th>>16,(pm2p5th>>8)&0xff,pm2p5th&0xff,pm10th>>16,(pm10th>>8)&0xff,pm10th&0xff)
    };
  }
}
