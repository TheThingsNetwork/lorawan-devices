function getCfgCmd(cfgcmd){
  var cfgcmdlist = {
    1:   "ConfigReportReq",
    129: "ConfigReportRsp",
    2:   "ReadConfigReportReq",
    130: "ReadConfigReportRsp"
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
}

function getDeviceName(dev){
  var deviceName = {
	5:  "RA07Series",
	9:  "R726Series",
	13: "RA07**YSeries"
  };
  return deviceName[dev];
}

function getDeviceID(devName){
  if ((devName == "RA0715") || (devName == "RA07Series"))
	  return 5;
  else if ((devName == "R726Series") || (devName == "R72615") || (devName == "R72615A"))
	  return 9;
  else if ((devName == "RA0715Y") || (devName == "RA07**YSeries"))
	  return 13;
}

function checkSensorExist(val){
	if ((val == 0xFF) || (val == 0xFFFF) || (val == 0xFFFFFFFF))
		return -1
	else
		return val
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
		
		var retSensorVal1 = checkSensorExist(input.bytes[4]<<8 | input.bytes[5]);
		var retSensorVal2 = checkSensorExist(input.bytes[6]<<8 | input.bytes[7]);
		var retSensorVal3 = checkSensorExist(input.bytes[8]<<8 | input.bytes[9]);
		data.Device = getDeviceName(input.bytes[1]);
		if (input.bytes[3] & 0x80)
		{
			var tmp_v = input.bytes[3] & 0x7F;
			data.Volt = (tmp_v / 10).toString() + '(low battery)';
		}
		else
			data.Volt = input.bytes[3]/10;

		switch (input.bytes[2]){
			case 1:
			case 2:
				data.PM1_0 = (retSensorVal1 == -1) ? 'NoSensor' : retSensorVal1;
				data.PM2_5 = (retSensorVal2 == -1) ? 'NoSensor' : retSensorVal2;
				data.PM10 = (retSensorVal3 == -1) ? 'NoSensor' : retSensorVal3;
			break;
			
			case 3:
				data.um0_3 = (retSensorVal1 == -1) ? 'NoSensor' : retSensorVal1;
				data.um0_5 = (retSensorVal2 == -1) ? 'NoSensor' : retSensorVal2;
				data.um1_0 = (retSensorVal3 == -1) ? 'NoSensor' : retSensorVal3;
			break;
			
			case 4:
				data.um2_5 = (retSensorVal1 == -1) ? 'NoSensor' : retSensorVal1;
				data.um5_0 = (retSensorVal2 == -1) ? 'NoSensor' : retSensorVal2;
				data.um10 = (retSensorVal3 == -1) ? 'NoSensor' : retSensorVal3;
			break;
			
			case 5:
				data.O3 = (retSensorVal1 == -1) ? 'NoSensor' : retSensorVal1/10;
				data.CO = (retSensorVal2 == -1) ? 'NoSensor' : retSensorVal2/10;
				data.NO = (retSensorVal3 == -1) ? 'NoSensor' : retSensorVal3/10;
			break;
			
			case 6:
				data.NO2 = (retSensorVal1 == -1) ? 'NoSensor' : retSensorVal1/10;
				data.SO2 = (retSensorVal2 == -1) ? 'NoSensor' : retSensorVal2/10;
				data.H2S = (retSensorVal3 == -1) ? 'NoSensor' : retSensorVal3/10;
			break;
			
			case 7:
				data.CO2 = (retSensorVal1 == -1) ? 'NoSensor' : retSensorVal1/10;
				data.NH3 = (retSensorVal2 == -1) ? 'NoSensor' : retSensorVal2/10;
				data.Noise = (retSensorVal3 == -1) ? 'NoSensor' : retSensorVal3/10;
			break;
			
			case 8:
				data.PH = (retSensorVal1 == -1) ? 'NoSensor' : retSensorVal1/100;
				data.TempPH = (retSensorVal2 == -1) ? 'NoSensor' : ((input.bytes[6] & 0x80) ? (0x10000 - retSensorVal2)/100 * -1 : (retSensorVal2/100));
				data.ORP = (retSensorVal3 == -1) ? 'NoSensor' : ((input.bytes[8] & 0x80) ? (0x10000 - retSensorVal3) * -1 : (retSensorVal3));
			break;
			
			case 9:
				data.NTU = (retSensorVal1 == -1) ? 'NoSensor' : retSensorVal1/10;
				data.TempNTU = (retSensorVal2 == -1) ? 'NoSensor' : ((input.bytes[6] & 0x80) ? (0x10000 - retSensorVal2)/100 * -1 : (retSensorVal2/100));
				data.EC5SoildHumi = (retSensorVal3 == -1) ? 'NoSensor' : retSensorVal3/100;
			break;
			
			case 10:
				data.SoildHumi5TE = (retSensorVal1 == -1) ? 'NoSensor' : retSensorVal1/100;
				data.SoildTemp5TE = (retSensorVal2 == -1) ? 'NoSensor' : ((input.bytes[6] & 0x80) ? (0x10000 - retSensorVal2)/100 * -1 : (retSensorVal2/100));
				data.WaterLevel = (retSensorVal3 == -1) ? 'NoSensor' : retSensorVal3;
				var retSensorVal = checkSensorExist(input.bytes[10]);
				data.EC5TE = (retSensorVal == -1) ? 'NoSensor' : retSensorVal/10;
			break;
			
			case 11:
				data.TempLDO = (retSensorVal1 == -1) ? 'NoSensor' : ((input.bytes[4] & 0x80) ? (0x10000 - retSensorVal1)/100 * -1 : (retSensorVal1/100));
				data.LDO_DO = (retSensorVal2 == -1) ? 'NoSensor' : retSensorVal2/100;
				data.LDO_Sat = (retSensorVal3 == -1) ? 'NoSensor' : retSensorVal3/10;
			break;
			
			case 12:
				data.Temperature = (retSensorVal1 == -1) ? 'NoSensor' : ((input.bytes[4] & 0x80) ? (0x10000 - retSensorVal1)/100 * -1 : (retSensorVal1/100));
				data.Humidity = (retSensorVal2 == -1) ? 'NoSensor' : retSensorVal2/100;
				data.WindSpeed = (retSensorVal3 == -1) ? 'NoSensor' : retSensorVal3/100;
			break;
			
			case 13:
				data.WindDirection = (retSensorVal1 == -1) ? 'NoSensor' : retSensorVal1;
				var retSensorVal = checkSensorExist((input.bytes[6]<<24) | (input.bytes[7]<<16) | (input.bytes[8]<<8) | input.bytes[9]);
				data.Atomsphere = (retSensorVal == -1) ? 'NoSensor' : retSensorVal/100;
			break;
			
			case 14:
				data.VOC = (retSensorVal1 == -1) ? 'NoSensor' : retSensorVal1/10;
			break;
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
  else if (input.data.Cmd == "ReadConfigReportReq")
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
