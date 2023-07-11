function getCmdId(inputcmd){
  var cmdIDs = {
    0x01: "ConfigReportReq",
    0x81: "ConfigReportRsp",
    0x02: "ReadConfigReportReq",
    0x82: "ReadConfigReportRsp",
    0x03: "CalibrateCO2Req",
    0x83: "CalibrateCO2Rsp",
    0x04: "SetShockSensorSensitivityReq",
    0x84: "SetShockSensorSensitivityRsp",
    0x05: "GetShockSensorSensitivityReq",
    0x85: "GetShockSensorSensitivityRsp"
  };
  return cmdIDs[inputcmd];
}

function getDeviceName(dev){
  var deviceName = {
	0xBB: "R718UB Seriers"
  };
  return deviceName[dev];
}

function getDeviceType(devName){
  if (devName == "R718UB Seriers")
	  return 0xBB;
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
		
		if (input.bytes[2] === 0x01)
		{
			if (input.bytes[4] & 0x80)
			{
				var tmpval = (input.bytes[4]<<8 | input.bytes[5]);
				data.Temp = (0x10000 - tmpval)/100 * -1;
			}
			else
				data.Temp = (input.bytes[4]<<8 | input.bytes[5])/100;
			
			data.Humi = (input.bytes[6]<<8 | input.bytes[7])/100;
			data.CO2 = (input.bytes[8]<<8 | input.bytes[9]);
			data.ShockEvent = input.bytes[10];
		}
		else if (input.bytes[2] === 0x02)
		{
			data.AirPressure = ((input.bytes[4]<<24) | (input.bytes[5]<<16) | (input.bytes[6]<<8) | input.bytes[7])/100;
			data.Illuminance = ((input.bytes[8]<<16) | (input.bytes[9]<<8) | input.bytes[10]);
		}
		else if (input.bytes[2] === 0x03)
		{
			data.PM2_5 = (input.bytes[4]<<8 | input.bytes[5]);
			data.PM10 = (input.bytes[6]<<8 | input.bytes[7]);
			data.TVOC = (input.bytes[8]<<8 | input.bytes[9]);
		}

		break;
		
	case 7:
		data.Device = getDeviceName(input.bytes[1]);
		if (input.bytes[0] === 0x81 || input.bytes[0] === 0x83 || input.bytes[0] === 0x84)
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
		else if (input.bytes[0] === 0x85)
		{
			data.Cmd = getCmdId(input.bytes[0]);
			data.ShockSensorSensitivity = input.bytes[2];
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
  	  var type = input.data.CalibrateType;
  	  var cal_point = input.data.CalibratePoint;
  	  
	  ret = ret.concat(0x03, devid, type, (cal_point>>8), (cal_point & 0xFF), 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
  } 
  else if (input.data.Cmd == getCmdId(0x04))
  {
  	  var sen = input.data.ShockSensorSensitivity;

	  ret = ret.concat(0x04, devid, sen, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
  } 
  else if (input.data.Cmd == getCmdId(0x05))
  {
	  ret = ret.concat(0x05, devid, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
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
		else if (input.bytes[0] === 0x02 || input.bytes[0] === 0x05)
		{
			data.Cmd = getCmdId(input.bytes[0]);
		}
		else if (input.bytes[0] === 0x03)
		{
			data.Cmd = getCmdId(input.bytes[0]);
			data.CalibrateType = input.bytes[2];
			data.CalibratePoint = (input.bytes[3]<<8 | input.bytes[4]);
		}
		else if (input.bytes[0] === 0x04)
		{
			data.Cmd = getCmdId(input.bytes[0]);
			data.ShockSensorSensitivity = input.bytes[2];
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
