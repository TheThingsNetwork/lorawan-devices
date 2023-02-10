function getCfgCmd(cfgcmd){
  var cfgcmdlist = {
    1:   "ConfigReportReq",
    129: "ConfigReportRsp",
    2:   "ReadConfigReportReq",
    130: "ReadConfigReportRsp",
	3:   "SetIRDisableTimeReq",
	131: "SetIRDisableTimeRsp",
	4:   "GetIRDisableTimeReq",
	132: "GetIRDisableTimeRsp"
  };
  return cfgcmdlist[cfgcmd];
}

function getDeviceName(dev){
  var deviceName = {
	3: "RB11E"
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
  else if (cmdtype == "SetIRDisableTimeReq")
	  return 3;
  else if (cmdtype == "SetIRDisableTimeRsp")
	  return 131;
  else if (cmdtype == "GetIRDisableTimeReq")
	  return 4;
  else if (cmdtype == "GetIRDisableTimeRsp")
	  return 132;
}

function getDeviceID(devName){
  if (devName == "RB11E")
	  return 3;
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

		if (input.bytes[4] & 0x80)
		{
			var tmpval = (input.bytes[4]<<8 | input.bytes[5]);
			data.Temp = (0x10000 - tmpval)/100 * -1;
		}
		else
			data.Temp = (input.bytes[4]<<8 | input.bytes[5])/100;
		
		data.Illuminance = (input.bytes[6]<<8 | input.bytes[7]);
		data.Occupy = input.bytes[8];
		data.DisassembledAlarm = input.bytes[9];
		
		break;
		
	case 7:
		data.Cmd = getCfgCmd(input.bytes[0]);
		data.Device = getDeviceName(input.bytes[1]);
		if (input.bytes[0] === getCmdToID("ConfigReportRsp"))
		{
			data.Status = (input.bytes[2] === 0x00) ? 'Success' : 'Failure';
		}
		else if (input.bytes[0] === getCmdToID("ReadConfigReportRsp"))
		{
			data.MinTime = (input.bytes[2]<<8 | input.bytes[3]);
			data.MaxTime = (input.bytes[4]<<8 | input.bytes[5]);
			data.BatteryChange = input.bytes[6]/10;
			data.TempChange = (input.bytes[7]<<8 | input.bytes[8])/100;
			data.IlluminanceChange = (input.bytes[9]<<8 | input.bytes[10]);
		}
		else if (input.bytes[0] === getCmdToID("SetIRDisableTimeRsp"))
		{
			data.Status = (input.bytes[2] === 0x00) ? 'Success' : 'Failure';
		}
		else if (input.bytes[0] === getCmdToID("GetIRDisableTimeRsp"))
		{
			data.IRDisableTime = (input.bytes[2]<<8 | input.bytes[3]);
			data.IRDetectionTime = (input.bytes[4]<<8 | input.bytes[5]);
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
	  var tempChg = input.data.TempChange * 100;
	  var luxChg = input.data.IlluminanceChange;
	  
	  ret = ret.concat(getCmdID, devid, (mint >> 8), (mint & 0xFF), (maxt >> 8), (maxt & 0xFF), batteryChg, (tempChg >> 8), (tempChg & 0xFF), (luxChg >> 8), (luxChg & 0xFF));
  }
  else if ((input.data.Cmd == "ReadConfigReportReq") || (input.data.Cmd == "GetIRDisableTimeReq"))
  {
	  ret = ret.concat(getCmdID, devid, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
  }  
  else if (input.data.Cmd == "SetIRDisableTimeReq")
  {
	  var irdisable = input.data.IRDisableTime;
	  var irdetect = input.data.IRDetectionTime;
	  
	  ret = ret.concat(getCmdID, devid, (irdisable >> 8), (irdisable & 0xFF), (irdetect >> 8), (irdetect & 0xFF), 0x00, 0x00, 0x00, 0x00, 0x00);
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
			data.TempChange = (input.bytes[7]<<8 | input.bytes[8])/100;
			data.IlluminanceChange = (input.bytes[9]<<8 | input.bytes[10]);
		}
		else if (input.bytes[0] === getCmdToID("SetIRDisableTimeReq"))
		{
			data.IRDisableTime = (input.bytes[2]<<8 | input.bytes[3]);
			data.IRDetectionTime = (input.bytes[4]<<8 | input.bytes[5]);
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
