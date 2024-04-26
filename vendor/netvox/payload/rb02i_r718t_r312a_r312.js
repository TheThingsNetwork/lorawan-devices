function getCfgCmd(cfgcmd){
  var cfgcmdlist = {
    1:   "ConfigReportReq",
    129: "ConfigReportRsp",
    2:   "ReadConfigReportReq",
    130: "ReadConfigReportRsp"
  };
  return cfgcmdlist[cfgcmd];
}

function getBtnPressTimeCmd(cfgcmd){
  var cfgcmdlist = {
    1:   "SetButtonPressTimeReq",
    129: "SetButtonPressTimeRsp",
    2:   "GetButtonPressTimeReq",
    130: "GetButtonPressTimeRsp"
  };
  return cfgcmdlist[cfgcmd];
}

function getCmdToID(cmdtype){
  if ((cmdtype == "ConfigReportReq") || (cmdtype == "SetButtonPressTimeReq"))
	  return 1;
  else if ((cmdtype == "ConfigReportRsp") || (cmdtype == "SetButtonPressTimeRsp"))
	  return 129;
  else if ((cmdtype == "ReadConfigReportReq") || (cmdtype == "GetButtonPressTimeReq"))
	  return 2;
  else if ((cmdtype == "ReadConfigReportRsp") || (cmdtype == "GetButtonPressTimeRsp"))
	  return 130;
}

function getDeviceName(dev){
  var deviceName = {
	16: "RB02I",
	49: "R718T",
	77: "R312A",
	85: "R312"
  };
  return deviceName[dev];
}

function getDeviceID(devName){
  if (devName == "RB02I")
	  return 16;
  else if (devName == "R718T")
	  return 49;
  else if (devName == "R312A")
	  return 77;
  else if (devName == "R312")
	  return 85;
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

		data.Alarm = input.bytes[4];
		if(input.bytes[5]===0x00){
			data.FunctionKeyTrigger = 'others';
		}else if(input.bytes[5]===0x01){
			data.FunctionKeyTrigger = 'fuctionkey1';
		}else if(input.bytes[5]===0x02){
			data.FunctionKeyTrigger = 'fuctionkey2';
		}
		
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
		}
		
		break;

	case 13:
		data.Cmd = getBtnPressTimeCmd(input.bytes[0]);
		if (input.bytes[0] === getCmdToID("SetButtonPressTimeRsp"))
		{
			data.Status = (input.bytes[1] === 0x00) ? 'Success' : 'Failure';
		}
		else if (input.bytes[0] === getCmdToID("GetButtonPressTimeRsp"))
		{
			data.PressTime = input.bytes[1];
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

  if (input.data.Cmd == "ConfigReportReq")
  {
	  var mint = input.data.MinTime;
	  var maxt = input.data.MaxTime;
	  var batteryChg = input.data.BatteryChange * 10;
	  
	  devid = getDeviceID(input.data.Device);
	  port = 7;
	  ret = ret.concat(getCmdID, devid, (mint >> 8), (mint & 0xFF), (maxt >> 8), (maxt & 0xFF), batteryChg, 0x00, 0x00, 0x00, 0x00);
  }
  else if (input.data.Cmd == "ReadConfigReportReq")
  {
	  devid = getDeviceID(input.data.Device);
	  port = 7;
	  ret = ret.concat(getCmdID, devid, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
  }  
  else if (input.data.Cmd == "SetButtonPressTimeReq")
  {
	  port = 13;
	  ret = ret.concat(getCmdID, input.data.PressTime);
  }
  else if (input.data.Cmd == "GetButtonPressTimeReq")
  {
	  port = 13;
	  ret = ret.concat(getCmdID, 0x00);
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
		data.Cmd = getCfgCmd(input.bytes[0]);
		data.Device = getDeviceName(input.bytes[1]);
		if (input.bytes[0] === getCmdToID("ConfigReportReq"))
		{
			data.MinTime = (input.bytes[2]<<8 | input.bytes[3]);
			data.MaxTime = (input.bytes[4]<<8 | input.bytes[5]);
			data.BatteryChange = input.bytes[6]/10;
		}

		break;

    case 13:
		data.Cmd = getBtnPressTimeCmd(input.bytes[0]);
		if (input.bytes[0] === getCmdToID("SetButtonPressTimeReq"))
		{
			data.PressTime = input.bytes[1];
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
