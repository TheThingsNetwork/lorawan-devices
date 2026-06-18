function getCfgCmd(cfgcmd){
  var cfgcmdlist = {
    1:   "ConfigReportReq",
    129: "ConfigReportRsp",
    2:   "ReadConfigReportReq",
    130: "ReadConfigReportRsp"
  };
  return cfgcmdlist[cfgcmd];
}

function getCaliCmd(calicmd){
  var calicmdlist = {
    1:   "SetGlobalCalibrateReq",
    129: "SetGlobalCalibrateRsp",
    2:   "GetGlobalCalibrateReq",
    130: "GetGlobalCalibrateRsp",
	3:   "ClearGlobalCalibrateReq",
	131: "ClearGlobalCalibrateRsp"
  };
  return calicmdlist[calicmd];
}

function getDeviceName(dev){
  var deviceName = {
	144: "R718CJ",
    145: "R718CK",
	146: "R718CT",
	147: "R718CN",
	148: "R718CE",
	149: "R718B"
  };
  return deviceName[dev];
}

function getCmdToID(cmdtype){
  if (cmdtype == "ConfigReportReq")
	  return 1;
  else if (cmdtype == "ConfigReportRsp")
	  return 129;
  else if (cmdtype == "ReadConfigReportReq")
	  return 2;
  else if (cmdtype == "ReadConfigReportRsp")
	  return 130;
  else if (cmdtype == "SetGlobalCalibrateReq")
	  return 1;
  else if (cmdtype == "SetGlobalCalibrateRsp")
	  return 129;
  else if (cmdtype == "GetGlobalCalibrateReq")
	  return 2;
  else if (cmdtype == "GetGlobalCalibrateRsp")
	  return 130;
  else if (cmdtype == "ClearGlobalCalibrateReq")
	  return 3;
  else if (cmdtype == "ClearGlobalCalibrateRsp")
	  return 131;
}

function getDeviceType(devName){
  if (devName == "R718CJ")
	  return 144;
  else if (devName == "R718CK")
	  return 145;
  else if (devName == "R718CT")
	  return 146;
  else if (devName == "R718CN")
	  return 147;
  else if (devName == "R718CE")
	  return 148;
  else if (devName == "R718B")
	  return 149;
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
			var tmpval = (input.bytes[4]<<8 | input.bytes[5]);
			data.Temp = (0x10000 - tmpval)/10 * -1;
		}
		else
			data.Temp = (input.bytes[4]<<8 | input.bytes[5])/10;
		
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
