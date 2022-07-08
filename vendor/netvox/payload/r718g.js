function getCfgCmd(cfgcmd){
  var cfgcmdlist = {
    1:   "ConfigReportReq",
    129: "ConfigReportRsp",
    2:   "ReadConfigReportReq",
    130: "ReadConfigReportRsp",
    3:	 "SetSunlightSampleRangeReq",
    131: "SetSunlightSampleRangeRsp",
    4:	 "GetSunlightSampleRangeReq",
    132: "GetSunlightSampleRangeRsp",
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
  else if (cmdtype == "SetSunlightSampleRangeReq")
	  return 3;
  else if (cmdtype == "SetSunlightSampleRangeRsp")
	  return 131;
  else if (cmdtype == "GetSunlightSampleRangeReq")
	  return 4;
  else if (cmdtype == "GetSunlightSampleRangeRsp")
	  return 132;
}

function getDeviceName(dev){
  var deviceName = {
	30: "R718G"
  };
  return deviceName[dev];
}

function getDeviceID(devName){
  if (devName == "R718G")
	  return 30;
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

		data.Illuminance = (input.bytes[4]<<24 | input.bytes[5]<<16 | input.bytes[6]<<8 | input.bytes[7]);
		
		break;
		
	case 7:
		data.Cmd = getCfgCmd(input.bytes[0]);
		data.Device = getDeviceName(input.bytes[1]);
		if ((input.bytes[0] === getCmdToID("ConfigReportRsp")) || (input.bytes[0] === getCmdToID("SetSunlightSampleRangeRsp")))
		{
			data.Status = (input.bytes[2] === 0x00) ? 'Success' : 'Failure';
		}
		else if (input.bytes[0] === getCmdToID("ReadConfigReportRsp"))
		{
			data.MinTime = (input.bytes[2]<<8 | input.bytes[3]);
			data.MaxTime = (input.bytes[4]<<8 | input.bytes[5]);
			data.BatteryChange = input.bytes[6]/10;
			data.IlluminanceChange = (input.bytes[7]<<24 | input.bytes[8]<<16 | input.bytes[9]<<8 | input.bytes[10]);	
		}
		else if (input.bytes[0] === getCmdToID("GetSunlightSampleRangeRsp"))
		{
			data.RangeSetting = input.bytes[2];
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
	  var illChg = input.data.IlluminanceChange;
	  
	  ret = ret.concat(getCmdID, devid, (mint >> 8), (mint & 0xFF), (maxt >> 8), (maxt & 0xFF), batteryChg, (illChg >> 24), (illChg >> 16), (illChg >> 8), (illChg & 0xFF));
  }
  else if ((input.data.Cmd == "ReadConfigReportReq") || (input.data.Cmd == "GetSunlightSampleRangeReq")) 
  {
	  ret = ret.concat(getCmdID, devid, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
  }  
  else if (input.data.Cmd == "SetSunlightSampleRangeReq")
  {
	  var setting_val = input.data.RangeSetting;
	  ret = ret.concat(getCmdID, devid, setting_val, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
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
			data.IlluminanceChange = (input.bytes[7]<<24 | input.bytes[8]<<16 | input.bytes[9]<<8 | input.bytes[10]);
		}
		else if (input.bytes[0] === getCmdToID("SetSunlightSampleRangeReq"))
		{
			data.RangeSetting = input.bytes[2];
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
