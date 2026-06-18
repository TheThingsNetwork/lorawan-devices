var lrs2m001_meter_events = ['heartbeat/button', 'bakcup power', 'ph_C_under_V', 'ph_C_over_V', 'ph_B_under_V', 'ph_B_over_V', 'ph_A_under_V', 'ph_A_over_V', 'backup_batt_low'];
var lrs2m001_phase_events = ['over_current','heartbeat/button'];
var decoded;

function hex2dec(hex) {
  var dec = hex&0x3fffff;
  if (dec & 0x200000)
    dec = -(0x400000-dec);
  return dec;
}

function decodePhaseData(input, channel, phase) {
  var evt_amp = input.bytes[1]<<8|input.bytes[2];
  var pow_pf = input.bytes[3]<<24|input.bytes[4]<<16|input.bytes[5]<<8|input.bytes[6];
  var evt="";
  for (let i=0; i<2; i++) {
    if ((0x01<<i)&(evt_amp>>14)) 
      if (evt==="")
        evt=lrs2m001_phase_events[i];
      else
        evt=evt+","+lrs2m001_phase_events[i];
  }
  if (input.bytes[0] === 0x0a) { 
    return {
      data: {
        channel: channel,
        phase: phase,
        event: evt,
        current: (evt_amp&0x3fff)/10,
        active_pow: hex2dec(pow_pf>>10)/10,
        power_factor: (pow_pf&0x03ff)/1000,
        active_energy: (input.bytes[7]<<24|input.bytes[8]<<16|input.bytes[9]<<8|input.bytes[10])/10
      }
    }
  }
  else {
    return {
      error: ['unknown packet type']
    };
  }
}

function decodeUplink(input) {
  switch (input.fPort) {
    case 10: // meter data
      var freq_evt = input.bytes[7]<<16|input.bytes[8]<<8|input.bytes[9];      
      var evt="";
      for (let i=0; i<10; i++) {
        if ((0x01<<i)&freq_evt) 
          if (evt==="")
            evt=lrs2m001_meter_events[i];
          else
            evt=evt+","+lrs2m001_meter_events[i];
      }
      return {
        data: {
              event: evt,
              phase_A_V: (input.bytes[1]<<8|input.bytes[2])/10,
              phase_B_V: (input.bytes[3]<<8|input.bytes[4])/10,
              phase_C_V: (input.bytes[5]<<8|input.bytes[6])/10,
              freq: freq_evt>>10,
              backup_batt: input.bytes[10],
            },
        };
    case 50:
      decoded = decodePhaseData(input, 1, 'A');
      return decoded;
    case 51:
      decoded = decodePhaseData(input, 1, 'B');
      return decoded;
    case 52:
      decoded = decodePhaseData(input, 1, 'C');
      return decoded;
    case 53:
      decoded = decodePhaseData(input, 2, 'A');
      return decoded;
    case 54:
      decoded = decodePhaseData(input, 2, 'B');
      return decoded;
    case 55:
      decoded = decodePhaseData(input, 2, 'C');
      return decoded;
    case 56:
      decoded = decodePhaseData(input, 3, 'A');
      return decoded;
    case 57:
      decoded = decodePhaseData(input, 3, 'B');
      return decoded;
    case 58:
      decoded = decodePhaseData(input, 3, 'C');
      return decoded;
    case 59:
      decoded = decodePhaseData(input, 4, 'A');
      return decoded;
    case 60:
      decoded = decodePhaseData(input, 4, 'B');
      return decoded;
    case 61:
      decoded = decodePhaseData(input, 4, 'C');
      return decoded;
    case 8: // version
      var ver = input.bytes[0]+"."+("00"+input.bytes[1]).slice(-2)+"."+("000"+(input.bytes[2]<<8|input.bytes[3])).slice(-3);    
      return {
        data: {
          firmwareVersion: ver,
        }
      };
    case 16: // device settings
      if (input.bytes[0] === 0x0a) {    
        return {
          data: {
            dataUploadInterval: input.bytes[1]<<8|input.bytes[2],
            underVoltageLimit: input.bytes[3]<<8|input.bytes[4],
            overVoltageLimit: input.bytes[5]<<8|input.bytes[6],
            overCurrentLimit: input.bytes[7]<<8|input.bytes[8],
          }
        };  
      }
      else {
        return {
          error: ['unknown packet type']
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
  else if (input.data.cmd === 'setDeviceSettings') {
    var ult = input.data.dataUploadInterval;
    var uvl = input.data.underVoltageLimit;
    var ovl = input.data.overVoltageLimit;
    var ocl = input.data.overCurrentLimit;
    var dack = 1;
    return {
      fPort: 22,
      bytes: payload.concat(ult>>8,ult&0xff,uvl>>8,uvl&0xff,ovl>>8,ovl&0xff,ocl>>8,ocl&0xff,dack)
    };
  }
}
