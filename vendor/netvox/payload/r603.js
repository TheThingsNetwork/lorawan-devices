function getCfgCmd(cfgcmd){
  var cfgcmdlist = {
    1:   "ConfigReportReq",
    129: "ConfigReportRsp",
    2:   "ReadConfigReportReq",
    130: "ReadConfigReportRsp",
	3:	 "StartSirenReq",
	
	4:	 "SetPeriodSirenReq",
	132: "SetPeriodSirenRsp",
	5:   "GetPeriodSirenReq",
    133: "GetPeriodSirenRsp",
    6:   "StopPeriodSirenReq",
    134: "StopPeriodSirenRsp",
	7:	 "SetLEDColorReq",
	135: "SetLEDColorRsp",
	8:	 "GetLEDColorReq",
	136: "GetLEDColorRsp",
	9:   "SetContactSwitchTriggerAlarmReq",
    137: "SetContactSwitchTriggerAlarmRsp",
    10:  "GetContactSwitchTriggerAlarmReq",
    138: "GetContactSwitchTriggerAlarmRsp",
  };
  return cfgcmdlist[cfgcmd];
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
  else if (cmdtype == "StartSirenReq")
	  return 3;
  
  else if (cmdtype == "SetPeriodSirenReq")
	  return 4;
  else if (cmdtype == "SetPeriodSirenRsp")
	  return 132;
  else if (cmdtype == "GetPeriodSirenReq")
	  return 5;
  else if (cmdtype == "GetPeriodSirenRsp")
	  return 133;
  else if (cmdtype == "StopPeriodSirenReq")
	  return 6;
  else if (cmdtype == "StopPeriodSirenRsp")
	  return 134;
  else if (cmdtype == "SetLEDColorReq")
	  return 7;
  else if (cmdtype == "SetLEDColorRsp")
	  return 135;
  else if (cmdtype == "GetLEDColorReq")
	  return 8;
  else if (cmdtype == "GetLEDColorRsp")
	  return 136;
  else if (cmdtype == "SetContactSwitchTriggerAlarmReq")
	  return 9;
  else if (cmdtype == "SetContactSwitchTriggerAlarmRsp")
	  return 137;
  else if (cmdtype == "GetContactSwitchTriggerAlarmReq")
	  return 10;
  else if (cmdtype == "GetContactSwitchTriggerAlarmRsp")
	  return 138;
}

function getDeviceName(dev){
  var deviceName = {
	222: "R603"
  };
  return deviceName[dev];
}

function getDeviceID(devName){
  var deviceName = {
	"R603": 222
  };
  return deviceName[devName];
}
function getSirenNoType(id){
	var type = {
		0X00:"EmergencyMode",
		0X01:"Doorbel",
		0X02:"Burglar",
		0X03:"FireMode",
		0X04:"Help",
		0X05:"No Smoking",
		0X06:"Poor Air Quality",
		0X07:"The temperature is too high",
		0X08:"Thief",
		0X09:"Welcome"
	};
	return type[id];
}
function getSirenNoTypeByName(name){
	var typeList = {
		"EmergencyMode":0X00,
		"Doorbel":0X01,
		"Burglar":0X02,
		"FireMode":0X03,
		"Help":0X04,
		"No Smoking":0X05,
		"Poor Air Quality":0X06,
		"The temperature is too high":0X07,
		"Thief":0X08,
		"Welcome":0X09
	};
	return typeList[name];
}
function getStrobeModeType(id){
	var type = {
		0X00:"NoLedIndication",
		0X01:"LedBlinkMode1 in Parallel to Warning",
		0X02:"LedBlinkMode2 in Parallel to Warning"
	};
	return type[id];
}
function getStrobeModeTypeByName(name){
	var typeList = {
		"NoLedIndication":0X00,
		"LedBlinkMode1 in Parallel to Warning":0X01,
		"LedBlinkMode2 in Parallel to Warning":0X02
	};
	return typeList[name];
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
		
		data.Device = getDeviceName(input.bytes[1]);
		if (input.bytes[3] & 0x80)
		{
			var tmp_v = input.bytes[3] & 0x7F;
			data.Volt = (tmp_v / 10).toString() + '(low battery)';
		}
		else
			data.Volt = input.bytes[3]/10;

		data.WarningStatus = (input.bytes[4] == 0x00) ? 'NoWarnring' : 'Warning';
		data.DCPowerFailureAlarm = (input.bytes[6] == 0x00) ? 'NoWarnring' : 'Warning';
		break;
		
	case 7:
		data.Cmd = getCfgCmd(input.bytes[0]);
		data.Device = getDeviceName(input.bytes[1]);
		
		if ((input.bytes[0] === getCmdToID("ConfigReportRsp")) 
		|| (input.bytes[0] === getCmdToID("SetPeriodSirenRsp"))
		|| (input.bytes[0] === getCmdToID("StopPeriodSirenRsp"))
		|| (input.bytes[0] === getCmdToID("SetLEDColorRsp"))
		|| (input.bytes[0] === getCmdToID("SetContactSwitchTriggerAlarmRsp")))
		{
			data.Status = (input.bytes[2] === 0x00) ? 'Success' : 'Failure';
		}
		else if (input.bytes[0] === getCmdToID("ReadConfigReportRsp"))
		{
			data.MinTime = (input.bytes[2]<<8 | input.bytes[3]);
			data.MaxTime = (input.bytes[4]<<8 | input.bytes[5]);
		}
		else if (input.bytes[0] === getCmdToID("GetPeriodSirenRsp"))
		{
			data.SirenNo = getSirenNoType(input.bytes[2]);
			data.SirenLevel = input.bytes[3];
			data.StrobeMode = getStrobeModeType(input.bytes[4]);
			data.Duration = (input.bytes[5]<<8 | input.bytes[6]);
			data.PeriodTime = (input.bytes[7]<<8 | input.bytes[8]);
		}
		else if (input.bytes[0] === getCmdToID("GetLEDColorRsp"))
		{
			data.Red = input.bytes[2];
			data.Green = input.bytes[3];
			data.Blue = input.bytes[4];
		}
		else if (input.bytes[0] === getCmdToID("GetContactSwitchTriggerAlarmRsp"))
		{
			data.SirenNo = getSirenNoType(input.bytes[2]);
			data.SirenLevel = input.bytes[3];
			data.StrobeMode = getStrobeModeType(input.bytes[4]);
			data.Duration = (input.bytes[5]<<8 | input.bytes[6]);
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
  var getCmdID;
	  
  getCmdID = getCmdToID(input.data.Cmd);
  devid = getDeviceID(input.data.Device);

  if (input.data.Cmd == "ConfigReportReq")
  {
	  var mint = input.data.MinTime;
	  var maxt = input.data.MaxTime;
	  ret = ret.concat(getCmdID, devid, (mint >> 8), (mint & 0xFF), (maxt >> 8), (maxt & 0xFF), 0x00, 0x00, 0x00, 0x00, 0x00);
  }
  else if ((input.data.Cmd == "ReadConfigReportReq") 
  		|| (input.data.Cmd == "GetPeriodSirenReq")
		|| (input.data.Cmd == "StopPeriodSirenReq")
		|| (input.data.Cmd == "GetLEDColorReq"))
  {
	  ret = ret.concat(getCmdID, devid, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
  }  
  else if ((input.data.Cmd == "StartSirenReq")
  || (input.data.Cmd == "SetContactSwitchTriggerAlarmReq") )
  {
	  var sirenNo = getSirenNoTypeByName(input.data.SirenNo);
	  var siren = input.data.SirenLevel;
	  var strobeMode = getStrobeModeTypeByName(input.data.StrobeMode);
	  var duration = input.data.Duration;
	  ret = ret.concat(getCmdID, devid, sirenNo, siren, strobeMode,  (duration >> 8), (duration & 0xFF), 0x00, 0x00, 0x00, 0x00);
  }  
  else if ((input.data.Cmd == "SetPeriodSirenReq") )
  {
	  var sirenNo = getSirenNoTypeByName(input.data.SirenNo);
	  var siren = input.data.SirenLevel;
	  var strobeMode = getStrobeModeTypeByName(input.data.StrobeMode);
	  var duration = input.data.Duration;
	  var periodTime = input.data.PeriodTime;
	  ret = ret.concat(getCmdID, devid, sirenNo, siren, strobeMode,(duration >> 8), (duration & 0xFF), (periodTime >> 8), (periodTime & 0xFF), 0x00, 0x00);
  }
  else if ((input.data.Cmd == "SetLEDColorReq") )
  {
	  var red = input.data.Red;
	  var green = input.data.Green;
	  var blue = input.data.Blue;
	  ret = ret.concat(getCmdID, devid, red, green, blue, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
  }
  
  return {
    fPort: 7,
    bytes: ret
  };
}  
  
function decodeDownlink(input) {
  var data = {};
  switch (input.fPort) {
    case 7:
		data.Cmd = getCfgCmd(input.bytes[0]);
		data.Device = getDeviceName(input.bytes[1]);
		if (input.bytes[0] === getCmdToID("ConfigReportReq"))
		{
			data.MinTime = (input.bytes[2]<<8 | input.bytes[3]);
			data.MaxTime = (input.bytes[4]<<8 | input.bytes[5]);
		}
		else if ((input.bytes[0] === getCmdToID("StartSirenReq"))
		||(input.bytes[0] === getCmdToID("SetContactSwitchTriggerAlarmReq")))
		{
			data.SirenNo= getSirenNoType(input.bytes[2]);
			data.SirenLevel=input.bytes[3];
			data.StrobeMode=getStrobeModeType(input.bytes[4])
			data.Duration=(input.bytes[5]<<8 | input.bytes[6]);
		}
		else if (input.bytes[0] === getCmdToID("SetPeriodSirenReq"))
		{
			data.SirenNo= getSirenNoType(input.bytes[2]);
			data.SirenLevel=input.bytes[3];
			data.StrobeMode=getStrobeModeType(input.bytes[4])
			data.Duration=(input.bytes[5]<<8 | input.bytes[6]);
			data.PeriodTime=(input.bytes[7]<<8 | input.bytes[8]);
		}
		else if (input.bytes[0] === getCmdToID("SetLEDColorReq"))
		{
			data.Red= input.bytes[2];
			data.Green=input.bytes[3];
			data.Blue=input.bytes[4];
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
