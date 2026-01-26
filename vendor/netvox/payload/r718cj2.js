function getCfgCmd(cfgcmd){
  var cfgcmdlist = {
    0x01: "ConfigReportReq",
    0x81: "ConfigReportRsp",
    0x02: "ReadConfigReportReq",
    0x82: "ReadConfigReportRsp",
    0x03: "SetThermocoupleTypeReq",
    0x83: "SetThermocoupleTypeRsp",
    0x04: "GetThermocoupleTypeReq",
    0x84: "GetThermocoupleTypeRsp"
  };
  return cfgcmdlist[cfgcmd];
}

function getDeviceName(dev){
  var deviceName = {
	0x14: "R718B2",
	0x15: "R718CJ2",
    0x16: "R718CK2",
	0x17: "R718CT2",
	0x18: "R718CN2",
	0x19: "R718CE2",
	0x78: "R730CJ2",
	0x79: "R730CK2",
	0x7A: "R730CT2",
	0x7B: "R730CN2",
	0x7C: "R730CE2"
  };
  return deviceName[dev];
}

function getCmdToID(cmdtype){
  if (cmdtype == "ConfigReportReq")
	  return 0x01;
  else if (cmdtype == "ConfigReportRsp")
	  return 0x81;
  else if (cmdtype == "ReadConfigReportReq")
	  return 0x02;
  else if (cmdtype == "ReadConfigReportRsp")
	  return 0x82;
  else if (cmdtype == "SetThermocoupleTypeReq")
	  return 0x03;
  else if (cmdtype == "SetThermocoupleTypeRsp")
	  return 0x83;
  else if (cmdtype == "GetThermocoupleTypeReq")
	  return 0x04;
  else if (cmdtype == "GetThermocoupleTypeRsp")
	  return 0x84;
}

function getDeviceType(devName){
  if (devName == "R718B2")
	  return 0x14;
  else if (devName == "R718CJ2")
	  return 0x15;
  else if (devName == "R718CK2")
	  return 0x16;
  else if (devName == "R718CT2")
	  return 0x17;
  else if (devName == "R718CN2")
	  return 0x18;
  else if (devName == "R718CE2")
	  return 0x19;
  else if (devName == "R730CJ2")
	  return 0x78;
  else if (devName == "R730CK2")
	  return 0x79;
  else if (devName == "R730CT2")
	  return 0x7A;
  else if (devName == "R730CN2")
	  return 0x7B;
  else if (devName == "R730CE2")
	  return 0x7C;
}

function padLeft(str, len) {
    str = '' + str;
    if (str.length >= len) {
        return str;
    } else {
        return padLeft("0" + str, len);
    }
}

function decodeUplink(input) {
  var data = {};
  switch (input.fPort) {
    case 6:
		if (input.bytes[2] === 0x00)
		{
			data.Device = getDeviceName(input.bytes[1]);
			data.SWver =  input.bytes[3]/10;
			data.HWver =  input.bytes[4];
			data.Datecode = padLeft(input.bytes[5].toString(16), 2) + padLeft(input.bytes[6].toString(16), 2) + padLeft(input.bytes[7].toString(16), 2) + padLeft(input.bytes[8].toString(16), 2);
			
			return {
				data: data,
			};
		}

		if (input.bytes[3] & 0x80)
		{
			var tmp_v = input.bytes[3] & 0x7F;
			data.Volt = (tmp_v / 10).toString() + '(low battery)';
		}
		else
			data.Volt = input.bytes[3]/10;

		data.Device = getDeviceName(input.bytes[1]);
		if (input.bytes[4] & 0x80)
		{
			var tmpval1 = (input.bytes[4]<<8 | input.bytes[5]);
			data.Temperature1 = (0x10000 - tmpval1)/10 * -1;
		}
		else
			data.Temperature1 = (input.bytes[4]<<8 | input.bytes[5])/10;

		if (input.bytes[6] & 0x80)
		{
			var tmpval2 = (input.bytes[6]<<8 | input.bytes[7]);
			data.Temperature2 = (0x10000 - tmpval2)/10 * -1;
		}
		else
			data.Temperature2 = (input.bytes[6]<<8 | input.bytes[7])/10;
		
		// Threshold alarm
		if (input.bytes.length > 8) {
			data.ThresholdAlarm_R718CX2 = input.bytes[8];
		}
			
		break;
		
	case 7:
		data.Device = getDeviceName(input.bytes[1]);
		switch (input.bytes[0]) {
			case 0x81:
				data.Cmd = getCfgCmd(input.bytes[0]);
				data.Status = (input.bytes[2] === 0x00) ? 'Success' : 'Failure';
				break;
			case 0x82:
				data.Cmd = getCfgCmd(input.bytes[0]);
				data.MinTime = (input.bytes[2]<<8 | input.bytes[3]);
				data.MaxTime = (input.bytes[4]<<8 | input.bytes[5]);
				data.BatteryChange = input.bytes[6]/10;
				data.TemperatureChange = (input.bytes[7]<<8 | input.bytes[8])/10;
				break;
			case 0x83:
				data.Cmd = getCfgCmd(input.bytes[0]);
				data.Status = (input.bytes[2] === 0x00) ? 'Success' : 'Failure';
				break;
			case 0x84:
				data.Cmd = getCfgCmd(input.bytes[0]);
				data.ThermocoupleType = input.bytes[2];
				break;
		}
		break;

	default:
      return {
        errors: ['unknown FPort'],
      };
	  
    }
          
	  
	 return {
		data: data,
	};
 }
  
function encodeDownlink(input) {
  var ret = [];
  var devid;
  var port;
  var getCmdID;
	  
  getCmdID = getCmdToID(input.data.Cmd);
  devid = getDeviceType(input.data.Device);
  port = 7;

  switch (input.data.Cmd) {
    case "ConfigReportReq":
      var mint = input.data.MinTime;
      var maxt = input.data.MaxTime;
      var batteryChg = input.data.BatteryChange * 10;
      var tempChg = input.data.TemperatureChange * 10;
      ret = ret.concat(getCmdID, devid, (mint >> 8), (mint & 0xFF), (maxt >> 8), (maxt & 0xFF), batteryChg, (tempChg >> 8), (tempChg & 0xFF), 0x00, 0x00);
      break;
    case "ReadConfigReportReq":
      ret = ret.concat(getCmdID, devid, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
      break;
    case "SetThermocoupleTypeReq":
      var type = input.data.ThermocoupleType;
      ret = ret.concat(getCmdID, devid, type, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
      break;
    case "GetThermocoupleTypeReq":
      ret = ret.concat(getCmdID, devid, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
      break;
  }
  
  return {
    fPort: port,
    bytes: ret
  };
}  
  
function decodeDownlink(input) {
  var data = {};
  switch (input.fPort) {
    case 7:
      data.Device = getDeviceName(input.bytes[1]);
      switch (input.bytes[0]) {
        case 0x01:
          data.Cmd = getCfgCmd(input.bytes[0]);
          data.MinTime = (input.bytes[2]<<8 | input.bytes[3]);
          data.MaxTime = (input.bytes[4]<<8 | input.bytes[5]);
          data.BatteryChange = input.bytes[6]/10;
          data.TemperatureChange = (input.bytes[7]<<8 | input.bytes[8])/10;
          break;
        case 0x02:
          data.Cmd = getCfgCmd(input.bytes[0]);
          break;
        case 0x03:
          data.Cmd = getCfgCmd(input.bytes[0]);
          data.ThermocoupleType = input.bytes[2];
          break;
        case 0x04:
          data.Cmd = getCfgCmd(input.bytes[0]);
          break;
      }
      break;
      
    default:
      return {
        errors: ['invalid FPort'],
      };
  }
  
  return {
		data: data,
	};
}