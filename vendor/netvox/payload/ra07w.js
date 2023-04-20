function getCmdId(inputcmd){
  var cmdIDs = {
    1:   "ConfigReportReq",
    129: "ConfigReportRsp",
    2:   "ReadConfigReportReq",
    130: "ReadConfigReportRsp",
    3:	 "SetSensorParaReq",
    131: "SetSensorParaRsp",
    4:   "GetSensorParaReq",
    132: "GetSensorParaRsp"
  };
  return cmdIDs[inputcmd];
}

function getDeviceName(dev){
  var deviceName = {
	12: "RA07W",
	143: "R718WE"
  };
  return deviceName[dev];
}

function getDeviceType(devName){
  if (devName == "RA07W")
	  return 12;
  else if (devName == "R718WE")
  	  return 143;
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

		if (input.bytes[3] & 0x80)
		{
			var tmp_v = input.bytes[3] & 0x7F;
			data.Volt = (tmp_v / 10).toString() + '(low battery)';
		}
		else
			data.Volt = input.bytes[3]/10;

		data.Device = getDeviceName(input.bytes[1]);
		data.WaterLeakLocation = (input.bytes[4]<<8 | input.bytes[5]) * 10;

		break;
		
	case 7:
		data.Device = getDeviceName(input.bytes[1]);
		if ((input.bytes[0] === 0x81) || (input.bytes[0] === 0x83))
		{
			data.Cmd = getCmdId(input.bytes[0]);
			data.Status = (input.bytes[2] === 0x00) ? 'Success' : 'Failure';
		}
		else if (input.bytes[0] === 0x82)
		{
			data.Cmd = getCmdId(input.bytes[0]);
			data.MinTime = (input.bytes[2]<<8 | input.bytes[3]);
			data.MaxTime = (input.bytes[4]<<8 | input.bytes[5]);
		}
		else if (input.bytes[0] === 0x84)
		{
			data.Cmd = getCmdId(input.bytes[0]);
			data.LineLength = (input.bytes[2]<<8 | input.bytes[3]) * 10;
			if (input.bytes[4] === 0x00)
				data.Sensitivity = 'High';
			else if (input.bytes[4] === 0x01)
				data.Sensitivity = 'Mid';
			else if (input.bytes[4] === 0x02)
				data.Sensitivity = 'Low';
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
 
  devid = getDeviceType(input.data.Device);

  if (input.data.Cmd == getCmdId(0x01))
  {
	  var mint = input.data.MinTime;
	  var maxt = input.data.MaxTime;

	  ret = ret.concat(0x01, devid, (mint >> 8), (mint & 0xFF), (maxt >> 8), (maxt & 0xFF), 0x00, 0x00, 0x00, 0x00, 0x00);
  }
  else if (input.data.Cmd == getCmdId(0x02))
  {
	  ret = ret.concat(0x02, devid, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
  }
  else if (input.data.Cmd == getCmdId(0x03))
  {
  	  var len = input.data.LineLength / 10;
  	  var sens = input.data.Sensitivity
  	  
	  ret = ret.concat(0x03, devid, (len >> 8), (len & 0xFF), sens, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
  }   
  else if (input.data.Cmd == getCmdId(0x04))
  {
	  ret = ret.concat(0x04, devid, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
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
		data.Device = getDeviceName(input.bytes[1]);
		if (input.bytes[0] === 0x01)
		{
			data.Cmd = getCmdId(input.bytes[0]);
			data.MinTime = (input.bytes[2]<<8 | input.bytes[3]);
			data.MaxTime = (input.bytes[4]<<8 | input.bytes[5]);
		}
		else if (input.bytes[0] === 0x02)
		{
			data.Cmd = getCmdId(input.bytes[0]);
		}
		else if (input.bytes[0] === 0x03)
		{
			data.Cmd = getCmdId(input.bytes[0]);
			data.LineLength = (input.bytes[2]<<8 | input.bytes[3]) * 10;
			data.Sensitivity = input.bytes[4];
		}
		else if (input.bytes[0] === 0x04)
		{
			data.Cmd = getCmdId(input.bytes[0]);
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
