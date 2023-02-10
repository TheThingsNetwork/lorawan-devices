function getCfgCmd(cfgcmd){
  var cfgcmdlist = {
    1:   "ConfigReportReq",
    129: "ConfigReportRsp",
    2:   "ReadConfigReportReq",
    130: "ReadConfigReportRsp",
	3:	 "SetAlarmThresholdReq",
	131: "SetAlarmThresholdRsp",
	4:	 "GetAlarmThresholdReq",
	132: "GetAlarmThresholdRsp"
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
  else if (cmdtype == "SetAlarmThresholdReq")
	  return 3;
  else if (cmdtype == "SetAlarmThresholdRsp")
	  return 131;
  else if (cmdtype == "GetAlarmThresholdReq")
	  return 4;
  else if (cmdtype == "GetAlarmThresholdRsp")
	  return 132;
}

function getDeviceName(dev){
  var deviceName = {
	10: "RA02A",
	17: "RA02C"
  };
  return deviceName[dev];
}

function getDeviceID(devName){
  var deviceName = {
	"RA02A": 10,
	"RA02C": 17
  };

  return deviceName[devName];
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
		
		if (input.bytes[1] === 0x0A)
		{	
			data.FireAlarm = (input.bytes[4] == 0x00) ? 'No Alarm' : 'Alarm';
			data.HighTempAlarm = (input.bytes[5] == 0x00) ? 'No Alarm' : 'Alarm';
			if (input.bytes[6] & 0x80)
			{
				var tmpval = (input.bytes[6]<<8 | input.bytes[7]);
				data.Temp = (0x10000 - tmpval)/10 * -1;
			}
			else
				data.Temp = (input.bytes[6]<<8 | input.bytes[7])/10;
		}
		else if (input.bytes[1] === 0x11)
		{	
			data.COAlarm = (input.bytes[4] == 0x00) ? 'No Alarm' : 'Alarm';
			data.HighTempAlarm = (input.bytes[5] == 0x00) ? 'No Alarm' : 'Alarm';
		}
		break;
		
	case 7:
		data.Cmd = getCfgCmd(input.bytes[0]);
		data.Device = getDeviceName(input.bytes[1]);
		if ((input.bytes[0] === getCmdToID("ConfigReportRsp")) || (input.bytes[0] === getCmdToID("SetAlarmThresholdRsp")))
		{
			data.Status = (input.bytes[2] === 0x00) ? 'Success' : 'Failure';
		}
		else if (input.bytes[0] === getCmdToID("ReadConfigReportRsp"))
		{
			data.MinTime = (input.bytes[2]<<8 | input.bytes[3]);
			data.MaxTime = (input.bytes[4]<<8 | input.bytes[5]);
			data.BatteryChange = input.bytes[6]/10;
		}
		else if (input.bytes[0] === getCmdToID("GetAlarmThresholdRsp"))
		{
			data.AlarmThreshold = input.bytes[2];
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
	  var batteryChg = input.data.BatteryChange * 10;
	  
	  ret = ret.concat(getCmdID, devid, (mint >> 8), (mint & 0xFF), (maxt >> 8), (maxt & 0xFF), batteryChg, 0x00, 0x00, 0x00, 0x00);
  }
  else if ((input.data.Cmd == "ReadConfigReportReq") || (input.data.Cmd == "GetAlarmThresholdReq"))
  {
	  ret = ret.concat(getCmdID, devid, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
  }  
  else if (input.data.Cmd == "SetAlarmThresholdReq")
  {
	  var threshold = input.data.AlarmThreshold;
	  ret = ret.concat(getCmdID, devid, threshold, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
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
			data.BatteryChange = input.bytes[6]/10;
		}
		else if (input.bytes[0] === getCmdToID("SetAlarmThresholdReq"))
		{
			data.AlarmThreshold = input.bytes[2];
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
