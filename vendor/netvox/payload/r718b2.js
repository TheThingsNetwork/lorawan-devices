function getCfgCmd(cfgcmd){
  var cfgcmdlist = {
    0x01: "ConfigReportReq",
    0x81: "ConfigReportRsp",
    0x02: "ReadConfigReportReq",
    0x82: "ReadConfigReportRsp"
  };
  return cfgcmdlist[cfgcmd];
}

function getCaliCmd(calicmd){
  var calicmdlist = {
    0x01: "SetGlobalCalibrateReq",
    0x81: "SetGlobalCalibrateRsp",
    0x02: "GetGlobalCalibrateReq",
    0x82: "GetGlobalCalibrateRsp",
	0x03: "ClearGlobalCalibrateReq",
	0x83: "ClearGlobalCalibrateRsp"
  };
  return calicmdlist[calicmd];
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
  else if (cmdtype == "SetGlobalCalibrateReq")
	  return 0x01;
  else if (cmdtype == "SetGlobalCalibrateRsp")
	  return 0x81;
  else if (cmdtype == "GetGlobalCalibrateReq")
	  return 0x02;
  else if (cmdtype == "GetGlobalCalibrateRsp")
	  return 0x82;
  else if (cmdtype == "ClearGlobalCalibrateReq")
	  return 0x03;
  else if (cmdtype == "ClearGlobalCalibrateRsp")
	  return 0x83;
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

function getSensorType(sensorid){
	var sensorlist = {
	1: "Temperature"
  };
  return sensorlist[sensorid];
}

function getSensorTypeID(sensortype){
	if (sensortype == "Temperature")
		return 1;
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
			data.Temp1 = (0x10000 - tmpval1)/10 * -1;
		}
		else
			data.Temp1 = (input.bytes[4]<<8 | input.bytes[5])/10;

		if (input.bytes[6] & 0x80)
		{
			var tmpval2 = (input.bytes[6]<<8 | input.bytes[7]);
			data.Temp2 = (0x10000 - tmpval2)/10 * -1;
		}
		else
			data.Temp2 = (input.bytes[6]<<8 | input.bytes[7])/10;
			
		break;
		
	case 7:
		data.Device = getDeviceName(input.bytes[1]);
		if (input.bytes[0] === 0x81)
		{
			data.Cmd = getCfgCmd(input.bytes[0]);
			data.Status = (input.bytes[2] === 0x00) ? 'Success' : 'Failure';
		}
		else if (input.bytes[0] === 0x82)
		{
			data.Cmd = getCfgCmd(input.bytes[0]);
			data.MinTime = (input.bytes[2]<<8 | input.bytes[3]);
			data.MaxTime = (input.bytes[4]<<8 | input.bytes[5]);
			data.BatteryChange = input.bytes[6]/10;
			data.TempChange = (input.bytes[7]<<8 | input.bytes[8])/10;
		}
		break;
		
	case 14:
		data.Cmd = getCaliCmd(input.bytes[0]);
		if (input.bytes[0] === 0x81)
		{
			data.SensorType = getSensorType(input.bytes[1]);
			data.Channel = input.bytes[2] + 1;
			data.Status = (input.bytes[3] === 0x00) ? 'Success' : 'Failure';
		}
		else if (input.bytes[0] === 0x82)
		{
			data.SensorType = getSensorType(input.bytes[1]);
			data.Channel = input.bytes[2] + 1;
			data.Multiplier = (input.bytes[3]<<8 | input.bytes[4]);
			data.Divisor = (input.bytes[5]<<8 | input.bytes[6]);
			
			if (input.bytes[7] & 0x80)
			{
				var tmpdelt = (input.bytes[7]<<8 | input.bytes[8]);
				data.DeltValue = (0x10000 - tmpdelt) * -1;
			}
			else
				data.DeltValue = (input.bytes[7]<<8 | input.bytes[8]);	
		}
		else if (input.bytes[0] === 0x83)
			data.Status = (input.bytes[1] === 0x00) ? 'Success' : 'Failure';

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

  if (input.data.Cmd == "ConfigReportReq")
  {
	  var mint = input.data.MinTime;
	  var maxt = input.data.MaxTime;
	  var batteryChg = input.data.BatteryChange * 10;
	  var tempChg = input.data.TempChange * 10;
	  
	  port = 7;
	  ret = ret.concat(getCmdID, devid, (mint >> 8), (mint & 0xFF), (maxt >> 8), (maxt & 0xFF), batteryChg, (tempChg >> 8), (tempChg & 0xFF), 0x00, 0x00);
  }
  else if (input.data.Cmd == "ReadConfigReportReq")
  {
	  port = 7;
	  ret = ret.concat(getCmdID, devid, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
  }  
  else if (input.data.Cmd == "SetGlobalCalibrateReq")
  {
	  var sensor = getSensorTypeID(input.data.SensorType);
	  var chl = input.data.Channel - 1;
	  var multi = input.data.Multiplier;
	  var div = input.data.Divisor;
	  var delt_h;
	  var delt_l;

	  if (input.data.DeltValue < 0)
	  {
		  var tmpval = 0x10000 - (input.data.DeltValue * -1);
		  delt_h = tmpval >> 8;
		  delt_l = tmpval & 0xFF;
	  }
	  else
	  {
		  delt_h = input.data.DeltValue >> 8;
	      delt_l = input.data.DeltValue & 0xFF;
	  }
	  
	  port = 14;
	  ret = ret.concat(getCmdID, sensor, chl, (multi >> 8), (multi & 0xFF), (div >> 8), (div & 0xFF), delt_h, delt_l, 0x00, 0x00);
  }
  else if (input.data.Cmd == "GetGlobalCalibrateReq")
  {
	  var sensor = getSensorTypeID(input.data.SensorType);
	  var chl = input.data.Channel - 1;
	  
	  port = 14;
	  ret = ret.concat(getCmdID, sensor, chl, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
  }
  else if (input.data.Cmd == "ClearGlobalCalibrateReq")
  {
	  port = 14;
	  ret = ret.concat(getCmdID, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
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
		if (input.bytes[0] === getCmdToID("ConfigReportReq"))
		{
			data.Cmd = getCfgCmd(input.bytes[0]);
			data.MinTime = (input.bytes[2]<<8 | input.bytes[3]);
			data.MaxTime = (input.bytes[4]<<8 | input.bytes[5]);
			data.BatteryChange = input.bytes[6]/10;
			data.TempChange = (input.bytes[7]<<8 | input.bytes[8])/10;
		}
		else if (input.bytes[0] === getCmdToID("ReadConfigReportReq"))
		{
			data.Cmd = getCfgCmd(input.bytes[0]);
		}
		break;
		
	case 14:
		if  (input.bytes[0] === getCmdToID("SetGlobalCalibrateReq"))
		{
			data.Cmd = getCaliCmd(input.bytes[0]);
			data.SensorType = getSensorType(input.bytes[1]);
			data.Channel = input.bytes[2] + 1;
			data.Multiplier = (input.bytes[3]<<8 | input.bytes[4]);
			data.Divisor = (input.bytes[5]<<8 | input.bytes[6]);
			
			if (input.bytes[7] & 0x80)
			{
				var tmpdelt = (input.bytes[7]<<8 | input.bytes[8]);
				data.DeltValue = (0x10000 - tmpdelt) * -1;
			}
			else
				data.DeltValue = (input.bytes[7]<<8 | input.bytes[8]);
		}
		else if  (input.bytes[0] === getCmdToID("GetGlobalCalibrateReq"))
		{
			data.Cmd = getCaliCmd(input.bytes[0]);
			data.SensorType = getSensorType(input.bytes[1]);
			data.Channel = input.bytes[2] + 1;
		}
		else if  (input.bytes[0] === getCmdToID("ClearGlobalCalibrateReq"))
		{
			data.Cmd = getCaliCmd(input.bytes[0]);
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
