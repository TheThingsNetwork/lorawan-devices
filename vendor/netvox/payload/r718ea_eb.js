function getCfgCmd(cfgcmd){
  var cfgcmdlist = {
    1:   "ConfigReportReq",
    129: "ConfigReportRsp",
    2:   "ReadConfigReportReq",
    130: "ReadConfigReportRsp",
	3:   "SetActiveThresholdReq",
	131: "SetActiveThresholdRsp",
	4:   "GetActiveThresholdReq",
	132: "GetActiveThresholdRsp"
  };
  return cfgcmdlist[cfgcmd];
}

function getDeviceName(dev){
  var deviceName = {
	154: "R718EA",
	200: "R718EB"
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
  else if (cmdtype == "SetActiveThresholdReq")
	  return 3;
  else if (cmdtype == "SetActiveThresholdRsp")
	  return 131;
  else if (cmdtype == "GetActiveThresholdReq")
	  return 4;
  else if (cmdtype == "GetActiveThresholdRsp")
	  return 132;
}

function getDeviceID(devName){
  if (devName == "R718EA")
	  return 154;
  else if (devName == "R718EB")
	  return 200;
}

function padLeft(str, len) {
    str = '' + str;
    if (str.length >= len) {
        return str;
    } else {
        return padLeft("0" + str, len);
    }
}

//0x7C00 = infinity
//0xFC00 = −infinity
//0x7C80 = NaN
//0x7BFF = 65504 (max half precision)
function float16Process(h) {
    var sign = (h & 0x8000) >> 15;
    var exp = (h & 0x7C00) >> 10;
    var fraction = h & 0x03FF;

    if(exp == 0) {
        return (sign?-1:1) * Math.pow(2,-14) * (fraction/Math.pow(2, 10));
    } else if (exp == 0x1F) {
        return fraction?NaN:((sign?-1:1)*Infinity);
    }

    return (sign?-1:1) * Math.pow(2, exp-15) * (1+(fraction/Math.pow(2, 10)));
}

function float32Process(h) {
    var sign = (h & 0x8000) >> 15;
    var exp = (h & 0x7F80) >> 7;
    var fraction = (h & 0x007F) << 16;

    if(exp == 0) {
        return (sign?-1:1) * Math.pow(2,-126) * (fraction/Math.pow(2, 23));
    } else if (exp == 0xFF) {
        return fraction?NaN:((sign?-1:1)*Infinity);
    }

    return (sign?-1:1) * Math.pow(2, exp-127) * (1+(fraction/Math.pow(2, 23)));
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
			
		if (input.bytes[1] === 0x9A)
		{
			if (input.bytes[4] & 0x80)
				data.AngleX = (0x100 - input.bytes[4]) * -1;
			else
				data.AngleX = input.bytes[4];

			if (input.bytes[5] & 0x80)
				data.AngleY = (0x100 - input.bytes[5]) * -1;
			else
				data.AngleY = input.bytes[5];
		
			if (input.bytes[6] & 0x80)
				data.AngleZ = (0x100 - input.bytes[6]) * -1;
			else
				data.AngleZ = input.bytes[6];

			if (input.bytes[7] & 0x80)
			{
				var tmpval = (input.bytes[7]<<8 | input.bytes[8]);
				data.Temp = (0x10000 - tmpval)/10 * -1;
			}
			else
				data.Temp = (input.bytes[9]<<8 | input.bytes[10])/10;
		}
		else if (input.bytes[1] === 0xC8)
		{
			if (input.bytes[4] & 0x80)
			{
				var tmpval = (input.bytes[4]<<8 | input.bytes[5]);
				data.AngleX = (0x10000 - tmpval)/10 * -1;
			}
			else
				data.AngleX = (input.bytes[4]<<8 | input.bytes[5])/10;
				
			if (input.bytes[6] & 0x80)
			{
				var tmpval = (input.bytes[6]<<8 | input.bytes[7]);
				data.AngleY = (0x10000 - tmpval)/10 * -1;
			}
			else
				data.AngleY = (input.bytes[6]<<8 | input.bytes[7])/10;
				
			if (input.bytes[8] & 0x80)
			{
				var tmpval = (input.bytes[8]<<8 | input.bytes[9]);
				data.AngleZ = (0x10000 - tmpval)/10 * -1;
			}
			else
				data.AngleZ = (input.bytes[8]<<8 | input.bytes[9])/10;
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
			if (input.bytes[1] === 0x9A)
			{
				data.AngleChange = input.bytes[7];
				data.TempChange = input.bytes[8]/10;
			}
			else if (input.bytes[1] === 0xC8)
				data.AngleChange = (input.bytes[7]<<8 | input.bytes[8])/10;
		}
		else if (input.bytes[0] === getCmdToID("SetActiveThresholdRsp"))
		{
			data.Status = (input.bytes[2] === 0x00) ? 'Success' : 'Failure';
		}
		else if (input.bytes[0] === getCmdToID("GetActiveThresholdRsp"))
		{
			data.Threshold = (input.bytes[2]<<8 | input.bytes[3]);
			data.InActiveTime = input.bytes[4];
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
	  if (devid === 0x9A)
	  {
		  var angleChg = input.data.AngleChange;
		  var tempChg = input.data.TempChange * 10;
		  
		  ret = ret.concat(getCmdID, devid, (mint >> 8), (mint & 0xFF), (maxt >> 8), (maxt & 0xFF), batteryChg, angleChg, tempChg, 0x00, 0x00);
	  }
	  else if (devid === 0xC8)
	  {
	  	  var angleChg = input.data.AngleChange * 10;
		  		  
		  ret = ret.concat(getCmdID, devid, (mint >> 8), (mint & 0xFF), (maxt >> 8), (maxt & 0xFF), batteryChg, (angleChg >> 8), (angleChg & 0xFF), 0x00, 0x00);
	  }
  }
  else if ((input.data.Cmd == "ReadConfigReportReq") || (input.data.Cmd == "GetActiveThresholdReq"))
  {
	  ret = ret.concat(getCmdID, devid, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
  }  
  else if (input.data.Cmd == "SetActiveThresholdReq")
  {
	  var Thl = input.data.Threshold;
	  var inactTime = input.data.InActiveTime;
	  
	  ret = ret.concat(getCmdID, devid, (Thl >> 8), (Thl & 0xFF), inactTime, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
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
			if (input.bytes[1] === 0x9A)
			{
				data.AngleChange = input.bytes[7];
				data.TempChange = input.bytes[8]/10;
			}
			else if (input.bytes[1] === 0xC8)
				data.AngleChange = (input.bytes[7]<<8 | input.bytes[8])/10;
		}
		else if (input.bytes[0] === getCmdToID("SetActiveThresholdReq"))
		{
			data.Threshold = (input.bytes[2]<<8 | input.bytes[3]);
			data.InActiveTime = input.bytes[4];
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
