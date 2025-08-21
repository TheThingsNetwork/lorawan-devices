function getCfgCmd(cfgcmd){
  var cfgcmdlist = {
    1:   "ConfigReportReq",
    129: "ConfigReportRsp",
    2:   "ReadConfigReportReq",
    130: "ReadConfigReportRsp",
	3:   "SetShockSensorSensitivityReq",
    131: "SetShockSensorSensitivityRsp",
    4:   "GetShockSensorSensitivityReq",
    132: "GetShockSensorSensitivityRsp",
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
  else if (cmdtype == "SetShockSensorSensitivityReq")
	  return 3;
  else if (cmdtype == "SetShockSensorSensitivityRsp")
	  return 131;
  else if (cmdtype == "GetShockSensorSensitivityReq")
	  return 4;
  else if (cmdtype == "GetShockSensorSensitivityRsp")
	  return 132;
}

function getDeviceName(dev){
  var deviceName = {
	258: "R900NAC6",
  };
  return deviceName[dev];
}

function getDeviceID(devName){
  var deviceName = {
	"R900NAC6": 258,
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
    case 22:
		if (input.bytes[3] === 0x00)
		{
			data.Device = getDeviceName((input.bytes[1]<<8 | input.bytes[2]));
			data.SWver =  input.bytes[4]/10;
			data.HWver =  input.bytes[5];
			data.Datecode = padLeft(input.bytes[6].toString(16), 2) + padLeft(input.bytes[7].toString(16), 2) + padLeft(input.bytes[8].toString(16), 2) + padLeft(input.bytes[9].toString(16), 2);
			
			return {
				data: data,
			};
		}
		
		data.Device = getDeviceName((input.bytes[1]<<8 | input.bytes[2]));
		if (input.bytes[4] & 0x80)
		{
			var tmp_v = input.bytes[4] & 0x7F;
			data.Volt = (tmp_v / 10).toString() + '(low battery)';
		}
		else
			data.Volt = input.bytes[4]/10;

		data.Current1 = (input.bytes[5]<<16 | input.bytes[6]<<8 | input.bytes[7])+'mA';
		data.Current2 = (input.bytes[8]<<16 | input.bytes[9]<<8 | input.bytes[10])+'mA';
		data.Current3 = (input.bytes[11]<<16 | input.bytes[12]<<8 | input.bytes[13])+'mA';

		data.Current4 = (input.bytes[14]<<16 | input.bytes[15]<<8 | input.bytes[16])+'mA';
		data.Current5 = (input.bytes[17]<<16 | input.bytes[18]<<8 | input.bytes[19])+'mA';
		data.Current6 = (input.bytes[20]<<16 | input.bytes[21]<<8 | input.bytes[22])+'mA';
		
		data.LowCurrent1Alarm = (input.bytes[23]<<8 | input.bytes[24]) & 1;
		data.HighCurrent1Alarm = (input.bytes[23]<<8 | input.bytes[24])>>1 & 1;
		data.LowCurrent2Alarm = (input.bytes[23]<<8 | input.bytes[24])>>2 & 1;
		data.HighCurrent2Alarm = (input.bytes[23]<<8 | input.bytes[24])>>3 & 1;
		data.LowCurrent3Alarm = (input.bytes[23]<<8 | input.bytes[24])>>4 & 1;
		data.HighCurrent3Alarm = (input.bytes[23]<<8 | input.bytes[24])>>5 & 1;
		data.LowCurrent4Alarm = (input.bytes[23]<<8 | input.bytes[24])>>6 & 1;
		data.HighCurrent4Alarm = (input.bytes[23]<<8 | input.bytes[24])>>7 & 1;
		data.LowCurrent5Alarm = (input.bytes[23]<<8 | input.bytes[24])>>8 & 1;
		data.HighCurrent5Alarm = (input.bytes[23]<<8 | input.bytes[24])>>9 & 1;
		data.LowCurrent6Alarm = (input.bytes[23]<<8 | input.bytes[24])>>10 & 1;
		data.HighCurrent6Alarm = (input.bytes[23]<<8 | input.bytes[24])>>11 & 1;
	
		if(input.bytes[25] === 0x00){
			data.ShockTamperAlarm = 'NoAlarm';
		}else if(input.bytes[25] === 0x01){
			data.ShockTamperAlarm = 'Alarm';
		}

		break;
		
	case 23:
		data.Cmd = getCfgCmd(input.bytes[0]);
		data.Device = getDeviceName((input.bytes[1]<<8 | input.bytes[2]));
		if (input.bytes[0] === getCmdToID("ConfigReportRsp")
		|| input.bytes[0] === getCmdToID("SetShockSensorSensitivityRsp"))
		{
			data.Status = (input.bytes[3] === 0x00) ? 'Success' : 'Failure';
		}
		else if (input.bytes[0] === getCmdToID("ReadConfigReportRsp") )
		{
			data.MinTime = (input.bytes[3]<<8 | input.bytes[4]);
			data.MaxTime = (input.bytes[5]<<8 | input.bytes[6]);
			data.CurrentChange = (input.bytes[7]<<8 | input.bytes[8])+"mA";
		}
		else if (input.bytes[0] === getCmdToID("GetShockSensorSensitivityRsp") )
		{
			data.ShockSensorSensitivity = input.bytes[3];
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

  if (input.data.Cmd == "ConfigReportReq" )
  {
	  var mint = input.data.MinTime;
	  var maxt = input.data.MaxTime;
	  var currentChange = input.data.CurrentChange;

	  ret = ret.concat(getCmdID, (devid>>8), (devid & 0xFF), (mint >> 8), (mint & 0xFF), (maxt >> 8), (maxt & 0xFF), 
	   (currentChange >> 8), (currentChange & 0xFF));
  }
  else if (input.data.Cmd == "ReadConfigReportReq" 
  	|| input.data.Cmd == "GetShockSensorSensitivityReq" )
  {
	  ret = ret.concat(getCmdID, (devid>>8), (devid & 0xFF));
  }
  else if (input.data.Cmd == "SetShockSensorSensitivityReq")
  {
	  var sSensor = input.data.ShockSensorSensitivity;
	  ret = ret.concat(getCmdID, (devid>>8), (devid & 0xFF),sSensor);
  }  
  
  return {
    fPort: 23,
    bytes: ret
  };
}  
  
function decodeDownlink(input) {
  var data = {};
  switch (input.fPort) {
    case 23:
		data.Cmd = getCfgCmd(input.bytes[0]);
		data.Device = getDeviceName((input.bytes[1]<<8 | input.bytes[2]));
		if (input.bytes[0] === getCmdToID("ConfigReportReq"))
		{
			data.MinTime = (input.bytes[3]<<8 | input.bytes[4]);
			data.MaxTime = (input.bytes[5]<<8 | input.bytes[6]);
			data.CurrentChange = (input.bytes[7]<<8 | input.bytes[8])+"mA";
		
		}
		else if (input.bytes[0] === getCmdToID("SetShockSensorSensitivityReq"))
		{
			data.ShockSensorSensitivity = input.bytes[3];
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
