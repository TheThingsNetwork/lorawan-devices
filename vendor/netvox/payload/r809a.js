function getCfgCmd(cfgcmd){
  var cfgcmdlist = {
    1:   "ConfigReportReq",
    129: "ConfigReportRsp",
    2:   "ReadConfigReportReq",
    130: "ReadConfigReportRsp",
	144: "Off",
	145: "On",
	146: "Toggle",
	147: "ClearEnergy",
	148: "ReadCurrentStatus"
  };
  return cfgcmdlist[cfgcmd];
}

function getDeviceName(dev){
  var deviceName = {
	14: "R809A",
	115: "R816B"
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
  else if (cmdtype == "Off")
	  return 144;
  else if (cmdtype == "On")
	  return 145;
  else if (cmdtype == "Toggle")
	  return 146;
  else if (cmdtype == "ClearEnergy")
	  return 147;
  else if (cmdtype == "ReadCurrentStatus")
	  return 148;
}

function getDeviceID(devName){
  if (devName == "R809A")
	  return 14;
  else if (devName == "R816B")
	  return 115;
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
		if (input.bytes[2] === 0x01)
		{
			data.OnOff = (input.bytes[3] === 0x00) ? 'OFF' : 'ON';
			data.Energy = (input.bytes[4]<<24 | input.bytes[5]<<16 | input.bytes[6]<<8 | input.bytes[7]);
			data.OverCurrentAlarm = (input.bytes[8] === 0x00) ? 'No alarm' : 'Alarm';
			data.DashCurrentAlarm = (input.bytes[9] === 0x00) ? 'No alarm' : 'Alarm';
			data.PowerOffAlarm = (input.bytes[10] === 0x00) ? 'No alarm' : 'Alarm';
		}
		else
		{
			data.Vol = (input.bytes[3]<<8 | input.bytes[4]);
			data.Current = (input.bytes[5]<<8 | input.bytes[6]);
			data.Power = (input.bytes[7]<<8 | input.bytes[8]);
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
			data.CurrentChange = (input.bytes[6]<<8 | input.bytes[7]);
			data.PowerChange = (input.bytes[8]<<8 | input.bytes[9]);
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
	  var curChg = input.data.CurrentChange;
	  var powChg = input.data.PowerChange;
	  
	  ret = ret.concat(getCmdID, devid, (mint >> 8), (mint & 0xFF), (maxt >> 8), (maxt & 0xFF), (curChg >> 8), (curChg & 0xFF), (powChg >> 8), (powChg & 0xFF), 0x00);
  }
  else if ((input.data.Cmd == "ReadConfigReportReq") || (input.data.Cmd == "On") || (input.data.Cmd == "Off") || (input.data.Cmd == "Toggle")  || (input.data.Cmd == "ClearEnergy") || (input.data.Cmd == "ReadCurrentStatus"))
  {
	  ret = ret.concat(getCmdID, devid, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
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
			data.CurrentChange = (input.bytes[6]<<8 | input.bytes[7]);
			data.PowerChange = (input.bytes[8]<<8 | input.bytes[9]);
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
