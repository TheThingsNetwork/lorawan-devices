function getCfgCmd(cfgcmd){
  var cfgcmdlist = {
    1:   "ConfigReportReq",
    129: "ConfigReportRsp",
    2:   "ReadConfigReportReq",
    130: "ReadConfigReportRsp",
	3:	 "SetSmokeSensitivityReq",
	131: "SetSmokeSensitivityRsp",
	4:	 "GetSmokeSensitivityReq",
	132: "GetSmokeSensitivityRsp",
	5:   "SetShockSensorSensitivityReq",
    133: "SetShockSensorSensitivityRsp",
    6:   "GetShockSensorSensitivityReq",
    134: "GetShockSensorSensitivityRsp",
	7:	 "SetHighSoundAlarmTriggerThresholdTimeReq",
	135: "SetHighSoundAlarmTriggerThresholdTimeRsp",
	8:	 "GetHighSoundAlarmTriggerThresholdTimeReq",
	136: "GetHighSoundAlarmTriggerThresholdTimeRsp",
	9:   "SetBeeperDurationReq",
    137: "SetBeeperDurationRsp",
    10:  "GetBeeperDurationReq",
    138: "GetBeeperDurationRsp",
	11:	 "StopCurrentBeeperAlarmReq",
	139: "StopCurrentBeeperAlarmRsp",
	12:	 "SetSmokeDebounceandResumeCheckTimeReq",
	140: "SetSmokeDebounceandResumeCheckTimeRsp",
	13:	 "GetSmokeDebounceandResumeCheckTimeReq",
	141: "GetSmokeDebounceandResumeCheckTimeRsp"

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
  else if (cmdtype == "SetSmokeSensitivityReq")
	  return 3;
  else if (cmdtype == "SetSmokeSensitivityRsp")
	  return 131;
  else if (cmdtype == "GetSmokeSensitivityReq")
	  return 4;
  else if (cmdtype == "GetSmokeSensitivityRsp")
	  return 132;
  else if (cmdtype == "SetShockSensorSensitivityReq")
	  return 5;
  else if (cmdtype == "SetShockSensorSensitivityRsp")
	  return 133;
  else if (cmdtype == "GetShockSensorSensitivityReq")
	  return 6;
  else if (cmdtype == "GetShockSensorSensitivityRsp")
	  return 134;
  else if (cmdtype == "SetHighSoundAlarmTriggerThresholdTimeReq")
	  return 7;
  else if (cmdtype == "SetHighSoundAlarmTriggerThresholdTimeRsp")
	  return 135;
  else if (cmdtype == "GetHighSoundAlarmTriggerThresholdTimeReq")
	  return 8;
  else if (cmdtype == "GetHighSoundAlarmTriggerThresholdTimeRsp")
	  return 136;
  else if (cmdtype == "SetBeeperDurationReq")
	  return 9;
  else if (cmdtype == "SetBeeperDurationRsp")
	  return 137;
  else if (cmdtype == "GetBeeperDurationReq")
	  return 10;
  else if (cmdtype == "GetBeeperDurationRsp")
	  return 138;
  else if (cmdtype == "StopCurrentBeeperAlarmReq")
	  return 11;
  else if (cmdtype == "StopCurrentBeeperAlarmRsp")
	  return 139;
  else if (cmdtype == "SetSmokeDebounceandResumeCheckTimeReq")
	  return 12;
  else if (cmdtype == "SetSmokeDebounceandResumeCheckTimeRsp")
	  return 140;
  else if (cmdtype == "GetSmokeDebounceandResumeCheckTimeReq")
	  return 13;
  else if (cmdtype == "GetSmokeDebounceandResumeCheckTimeRsp")
	  return 141;
}

function getDeviceName(dev){
  var deviceName = {
	215: "RA02G"
  };
  return deviceName[dev];
}

function getDeviceID(devName){
  var deviceName = {
	"RA02G": 215
  };
  return deviceName[devName];
}

function getSmokesensorSensitivityType(id){
	var type = {
		0X00:"accroding the hardware sensitivity knob",
		0X01:"Level1",
		0X02:"Level2",
		0X03:"Level3",
		0X04:"Level4",
	};
	return type[id];
}
function getTypeByName(name){
	var typeList = {
		"accroding the hardware sensitivity knob":"0X00",
		"Level1":0X01,
		"Level2":0X02,
		"Level3":0X03,
		"Level4":0X04
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
		
		data.IncenseSmokeAlarm = (input.bytes[4] == 0x00) ? 'No Alarm' : 'Alarm';
		data.HighSoundAlarm = (input.bytes[5] == 0x00) ? 'No Alarm' : 'Alarm';
		data.TemShockTamperAlarmp = (input.bytes[6] == 0x00) ? 'No Alarm' : 'Alarm';
		data.PowerOffAlarm = (input.bytes[7] == 0x00) ? 'No Alarm' : 'Alarm';
		break;
		
	case 7:
		data.Cmd = getCfgCmd(input.bytes[0]);
		data.Device = getDeviceName(input.bytes[1]);
		
		if ((input.bytes[0] === getCmdToID("ConfigReportRsp")) 
		|| (input.bytes[0] === getCmdToID("SetSmokeSensitivityRsp"))
		|| (input.bytes[0] === getCmdToID("SetShockSensorSensitivityRsp"))
		|| (input.bytes[0] === getCmdToID("SetHighSoundAlarmTriggerThresholdTimeRsp"))
		|| (input.bytes[0] === getCmdToID("SetBeeperDurationRsp"))
		|| (input.bytes[0] === getCmdToID("StopCurrentBeeperAlarmRsp"))
		|| (input.bytes[0] === getCmdToID("SetSmokeDebounceandResumeCheckTimeRsp")))
		{
			data.Status = (input.bytes[2] === 0x00) ? 'Success' : 'Failure';
		}
		else if (input.bytes[0] === getCmdToID("ReadConfigReportRsp"))
		{
			data.MinTime = (input.bytes[2]<<8 | input.bytes[3]);
			data.MaxTime = (input.bytes[4]<<8 | input.bytes[5]);
		}
		else if (input.bytes[0] === getCmdToID("GetSmokeSensitivityRsp"))
		{
			data.SmokesensorSensitivity = getSmokesensorSensitivityType(input.bytes[2]);
		}else if (input.bytes[0] === getCmdToID("GetShockSensorSensitivityRsp"))
		{
			data.ShockSensorSensitivity = input.bytes[2];
		}else if (input.bytes[0] === getCmdToID("GetHighSoundAlarmTriggerThresholdTimeRsp"))
		{
			data.HighSoundAlarmTriggerThreshold = (input.bytes[2]<<8 | input.bytes[3]);
			data.HighSoundAlarmTriggerDuration = (input.bytes[4]<<8 | input.bytes[5]);
		}else if (input.bytes[0] === getCmdToID("GetBeeperDurationRsp"))
		{
			data.BeeperDuration = (input.bytes[2]<<8 | input.bytes[3]) ==0?"DisableBeeper":(input.bytes[2]<<8 | input.bytes[3]);
			data.AlarmSoundLevel = input.bytes[4];
		}else if (input.bytes[0] === getCmdToID("GetSmokeDebounceandResumeCheckTimeRsp"))
		{
			data.SmokeDebounceTIme = (input.bytes[2]<<8 | input.bytes[3]);
			data.SmokeResumeTime = input.bytes[4];
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
  ||(input.data.Cmd == "GetSmokeSensitivityReq")
  ||(input.data.Cmd == "GetShockSensorSensitivityReq")
  ||(input.data.Cmd == "GetHighSoundAlarmTriggerThresholdTimeReq")
  ||(input.data.Cmd == "GetBeeperDurationReq")
  ||(input.data.Cmd == "StopCurrentBeeperAlarmReq")
  ||(input.data.Cmd == "GetSmokeDebounceandResumeCheckTimeReq"))
  {
	  ret = ret.concat(getCmdID, devid, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
  }  
  else if (input.data.Cmd == "SetSmokeSensitivityReq")
  {
	  var smokesensor = getTypeByName(input.data.SmokesensorSensitivity);
	  ret = ret.concat(getCmdID, devid, smokesensor, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
  } 
  else if (input.data.Cmd == "SetShockSensorSensitivityReq")
  {
	  var shockSensor = input.data.ShockSensorSensitivity;
	  ret = ret.concat(getCmdID, devid, shockSensor, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
  } 
  else if (input.data.Cmd == "SetHighSoundAlarmTriggerThresholdTimeReq")
  {
	  var highSoundAlarmThreshold = input.data.HighSoundAlarmTriggerThreshold;
	  var highSoundAlarmDuration = input.data.HighSoundAlarmTriggerDuration;
	  ret = ret.concat(getCmdID, devid, (highSoundAlarmThreshold >> 8), (highSoundAlarmThreshold & 0xFF),(highSoundAlarmDuration >> 8), (highSoundAlarmDuration & 0xFF), 0x00, 0x00, 0x00, 0x00, 0x00);
  }
  else if (input.data.Cmd == "SetBeeperDurationReq")
  {
	  var beeper = input.data.BeeperDuration=="DisableBeeper"? 0x0000:input.data.BeeperDuration;
	  var alarm = input.data.AlarmSoundLevel;
	  ret = ret.concat(getCmdID, devid, (beeper >> 8), (beeper & 0xFF), alarm, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
  }
  else if (input.data.Cmd == "SetSmokeDebounceandResumeCheckTimeReq")
  {
	  var debounce = input.data.SmokeDebounceTIme;
	  var smokeResume = input.data.SmokeResumeTime;
	  ret = ret.concat(getCmdID, devid, (debounce >> 8), (debounce & 0xFF), smokeResume, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
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
		else if (input.bytes[0] === getCmdToID("SetSmokeSensitivityReq"))
		{
			data.SmokesensorSensitivity= getSmokesensorSensitivityType(input.bytes[2]);
		}
		else if (input.bytes[0] === getCmdToID("SetShockSensorSensitivityReq"))
		{
			data.ShockSensorSensitivity= input.bytes[2];
		}
		else if (input.bytes[0] === getCmdToID("SetHighSoundAlarmTriggerThresholdTimeReq"))
		{
			data.HighSoundAlarmTriggerThreshold= (input.bytes[2]<<8 | input.bytes[3]);
			data.HighSoundAlarmTriggerDuration= (input.bytes[4]<<8 | input.bytes[5]);
		}
		else if (input.bytes[0] === getCmdToID("SetBeeperDurationReq"))
		{
			data.BeeperDuration = (input.bytes[2]<<8 | input.bytes[3]) ==0?"DisableBeeper":(input.bytes[2]<<8 | input.bytes[3]);
			data.AlarmSoundLevel = input.bytes[4];
		}
		else if (input.bytes[0] === getCmdToID("SetSmokeDebounceandResumeCheckTimeReq"))
		{
			data.SmokeDebounceTIme = (input.bytes[2]<<8 | input.bytes[3]);
			data.SmokeResumeTime = input.bytes[4];
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
