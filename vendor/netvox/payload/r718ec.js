
function getCfgCmd(cfgcmd){
  var cfgcmdlist = {
    1:   "ConfigReportReq",
    129: "ConfigReportRsp",
    2:   "ReadConfigReportReq",
    130: "ReadConfigReportRsp",
	3:   "SetActiveThresholdReq",
	131: "SetActiveThresholdRsp",
	4:   "GetActiveThresholdReq",
	132: "GetActiveThresholdRsp",
	7:   "SetRestoreReportReq",
	135: "SetRestoreReportRsp",
	8:   "GetRestoreReportReq",
	136: "GetRestoreReportRsp"
  };
  return cfgcmdlist[cfgcmd];
}

function getDeviceName(dev){
  var deviceName = {
	28: "R718EC"
  };
  return deviceName[dev];
}

const CmdNameIDMap = {
	'ConfigReportReq':0x01,
	'ConfigReportRsp':0x81,
	'ReadConfigReportReq':0x02,
	'ReadConfigReportRsp':0x82,
	'SetActiveThresholdReq':0x03,
	'SetActiveThresholdRsp':0x83, 
	'GetActiveThresholdReq':0x04,
	'GetActiveThresholdRsp':0x84,
	'SetFilterVelocityThresholdReq':0x05,
	'GetFilterVelocityThresholdReq':0x06,
	'SetRestoreReportReq':0x07,
	'SetRestoreReportRsp':0x87,
	'GetRestoreReportReq':0x08,
	'GetRestoreReportRsp':0x88
  };

function getDeviceID(devName){
  if (devName == "R718EC")
	  return 28;
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

    // 优化1：处理 ±0（原逻辑已覆盖，但显式标注更清晰）
    if (exp === 0 && fraction === 0) {
        return sign ? -0 : 0;
    }
    // 非规格化数
    if (exp === 0) {
        return (sign ? -1 : 1) * Math.pow(2, -14) * (fraction / Math.pow(2, 10));
    }
    // 无穷大/NaN
    if (exp === 0x1F) {
        return fraction ? NaN : (sign ? -Infinity : Infinity);
    }
    // 规格化数
    return (sign ? -1 : 1) * Math.pow(2, exp - 15) * (1 + (fraction / Math.pow(2, 10)));
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
		if (input.bytes[2] === 0x01)
		{
			if (input.bytes[3] & 0x80)
			{
				var tmp_v = input.bytes[3] & 0x7F;
				data.Volt = (tmp_v / 10).toString() + '(low battery)';
			}
			else
				data.Volt = input.bytes[3]/10;

			data.AccelerationX = parseFloat(float32Process(input.bytes[5]<<8 | input.bytes[4]).toFixed(6));
			data.AccelerationY = parseFloat(float32Process(input.bytes[7]<<8 | input.bytes[6]).toFixed(6));
			data.AccelerationZ = parseFloat(float32Process(input.bytes[9]<<8 | input.bytes[8]).toFixed(6));
			data.ActiveStatus = input.bytes[10];
		}
		else if (input.bytes[2] === 0x02)
		{
			data.VelocityX = parseFloat(float32Process(input.bytes[4]<<8 | input.bytes[3]).toFixed(6));
			data.VelocityY = parseFloat(float32Process(input.bytes[6]<<8 | input.bytes[5]).toFixed(6));
			data.VelocityZ = parseFloat(float32Process(input.bytes[8]<<8 | input.bytes[7]).toFixed(6));
			if (input.bytes[9] & 0x80)
			{
				var tmpval = (input.bytes[9]<<8 | input.bytes[10]);
				data.TemperaturewithNTC = (0x10000 - tmpval)/10 * -1;
			}
			else
			{
				data.TemperaturewithNTC = (input.bytes[9]<<8 | input.bytes[10])/10;
			} 
		}
		else if (input.bytes[2] === 0x03)
		{
			if (input.bytes[3] & 0x80)
			{
				var tmp_v = input.bytes[3] & 0x7F;
				data.Volt = (tmp_v / 10).toString() + '(low battery)';
			}
			else
				data.Volt = input.bytes[3]/10;
			var unsigned = input.bytes[4]<<8 | input.bytes[5];
			var signed16Int = unsigned > 0x7FFF ? unsigned - 0x10000 : unsigned;
			data.AngleX = signed16Int * 0.005;
			unsigned = input.bytes[6]<<8 | input.bytes[7];
			signed16Int = unsigned > 0x7FFF ? unsigned - 0x10000 : unsigned;
			data.AngleY = signed16Int * 0.005;
			unsigned = input.bytes[8]<<8 | input.bytes[9];
			signed16Int = unsigned > 0x7FFF ? unsigned - 0x10000 : unsigned;
			data.AngleZ = signed16Int * 0.005;
			data.LowAngleXAlarm =  input.bytes[10] & 1;
			data.HighAngleXAlarm = input.bytes[10] >> 1 & 1;
			data.LowAngleYAlarm =  input.bytes[10] >> 2 & 1;
			data.HighAngleYAlarm = input.bytes[10] >> 3 & 1;
			data.LowAngleZAlarm =  input.bytes[10] >> 4 & 1;
			data.HighAngleZAlarm = input.bytes[10] >> 5 & 1;
		}
		else if (input.bytes[2] === 0x04)
		{
			if (input.bytes[3] & 0x80)
			{
				var tmp_v = input.bytes[3] & 0x7F;
				data.Volt = (tmp_v / 10).toString() + '(low battery)';
			}
			else
				data.Volt = input.bytes[3]/10;
				
			data.LowAccelerationXAlarm  = input.bytes[4] & 1;
			data.HighAccelerationXAlarm = input.bytes[4] >> 1 & 1;
			data.LowAccelerationYAlarm  = input.bytes[4] >> 2 & 1;
			data.HighAccelerationYAlarm = input.bytes[4] >> 3 & 1;
			data.LowAccelerationZAlarm  = input.bytes[4] >> 4 & 1;
			data.HighAccelerationZAlarm  = input.bytes[4] >> 5 & 1;

			data.LowVelocityXAlarm  = input.bytes[5] & 1;
			data.HighVelocityXAlarm = input.bytes[5] >> 1 & 1;
			data.LowVelocityYAlarm  = input.bytes[5] >> 2 & 1;
			data.HighVelocityYAlarm = input.bytes[5] >> 3 & 1;
			data.LowVelocityZAlarm  = input.bytes[5] >> 4 & 1;
			data.HighVelocityZAlarm  = input.bytes[5] >> 5 & 1;

			data.LowTemperaturewithAlarm  = input.bytes[6] & 1;
			data.HighTemperaturewithAlarm = input.bytes[6] >> 1 & 1;

		}
		
		break;
		
	case 7:
		data.Cmd = getCfgCmd(input.bytes[0]);
		data.Device = getDeviceName(input.bytes[1]);
		if (input.bytes[0] === CmdNameIDMap["ConfigReportRsp"])
		{
			data.Status = (input.bytes[2] === 0x00) ? 'Success' : 'Failure';
		}
		else if (input.bytes[0] === CmdNameIDMap["ReadConfigReportRsp"])
		{
			data.MinTime = (input.bytes[2]<<8 | input.bytes[3]);
			data.MaxTime = (input.bytes[4]<<8 | input.bytes[5]);
			data.BatteryChange = input.bytes[6]/10;
			data.AccelerationChange = (input.bytes[7]<<8 | input.bytes[8]);
		}
		else if (input.bytes[0] === CmdNameIDMap["SetActiveThresholdRsp"])
		{
			data.Status = (input.bytes[2] === 0x00) ? 'Success' : 'Failure';
		}
		else if (input.bytes[0] === CmdNameIDMap["GetActiveThresholdRsp"])
		{
			data.ActiveThreshold = (input.bytes[2]<<8 | input.bytes[3]);
			data.InActiveThreshold = (input.bytes[4]<<8 | input.bytes[5]);
		}
		else if (input.bytes[0] === CmdNameIDMap["SetRestoreReportRsp"])
		{
			data.Status = (input.bytes[2] === 0x00) ? 'Success' : 'Failure';
		}
		else if (input.bytes[0] === CmdNameIDMap["GetRestoreReportRsp"])
		{
			data.RestoreReportSet = input.bytes[2];
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
	  
  getCmdID = CmdNameIDMap[input.data.Cmd];
  devid = getDeviceID(input.data.Device);

  if (input.data.Cmd == "ConfigReportReq")
  {
	  var mint = input.data.MinTime;
	  var maxt = input.data.MaxTime;
	  var batteryChg = input.data.BatteryChange * 10;
	  var accChg = input.data.AccelerationChange;
	  
	  ret = ret.concat(getCmdID, devid, (mint >> 8), (mint & 0xFF), (maxt >> 8), (maxt & 0xFF), batteryChg, (accChg >> 8), (accChg & 0xFF), 0x00, 0x00);
  }
  else if ((input.data.Cmd == "ReadConfigReportReq") || (input.data.Cmd == "GetActiveThresholdReq") || (input.data.Cmd == "GetRestoreReportReq"))
  {
	  ret = ret.concat(getCmdID, devid, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
  }  
  else if (input.data.Cmd == "SetActiveThresholdReq")
  {
	  var actThl = input.data.ActiveThreshold;
	  var inactThl = input.data.InActiveThreshold;
	  
	  ret = ret.concat(getCmdID, devid, (actThl >> 8), (actThl & 0xFF), (inactThl >> 8), (inactThl & 0xFF), 0x00, 0x00, 0x00, 0x00, 0x00);
  }
  else if (input.data.Cmd == "SetRestoreReportReq")
  {
	  ret = ret.concat(getCmdID, devid, input.data.RestoreReportSet, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
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
		if (input.bytes[0] === CmdNameIDMap["ConfigReportReq"])
		{
			data.MinTime = (input.bytes[2]<<8 | input.bytes[3]);
			data.MaxTime = (input.bytes[4]<<8 | input.bytes[5]);
			data.BatteryChange = input.bytes[6]/10;
			data.AccelerationChange = (input.bytes[7]<<8 | input.bytes[8]);
		}
		else if (input.bytes[0] === CmdNameIDMap["SetActiveThresholdReq"])
		{
			data.ActiveThreshold = (input.bytes[2]<<8 | input.bytes[3]);
			data.InActiveThreshold = (input.bytes[4]<<8 | input.bytes[5]);
		}
		else if (input.bytes[0] === CmdNameIDMap["SetRestoreReportReq"])
		{
			data.RestoreReportSet = input.bytes[2];
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
