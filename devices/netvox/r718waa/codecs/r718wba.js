function getCmdId(inputcmd){
  var cmdIDs = {
    0x01: "ConfigReportReq",
    0x81: "ConfigReportRsp",
    0x02: "ReadConfigReportReq",
    0x82: "ReadConfigReportRsp"
  };
  return cmdIDs[inputcmd];
}

function getDeviceName(dev){
  var deviceName = {
	0x6B: "R718WBA",
    0xBD: "R718FA",
	0xBE: "R718WAA",
	0xBF: "R718DAA",
	0xC0: "R718DBA",
	0xC1: "R718TA",
    0xC2: "R718VAA",
	0xC3: "R718VBA"
  };
  return deviceName[dev];
}

function getDeviceType(devName){
  if (devName == "R718WBA")
	  return 0x6B;
  else if (devName == "R718FA")
	  return 0xBD;
  else if (devName == "R718WAA")
	  return 0xBE;
  else if (devName == "R718DAA")
	  return 0xBF;
  else if (devName == "R718DBA")
	  return 0xC1;
  else if (devName == "R718TA")
	  return 0xC1;
  else if (devName == "R718VAA")
	  return 0xC2;
  else if (devName == "R718VBA")
	  return 0xC3;
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
		if (input.bytes[4] & 0x80)
		{
			var tmpval = (input.bytes[4]<<8 | input.bytes[5]);
			data.Temp = (0x10000 - tmpval)/100 * -1;
		}
		else
			data.Temp = (input.bytes[4]<<8 | input.bytes[5])/100;
		
		data.Humi = (input.bytes[6]<<8 | input.bytes[7])/100;
		data.Status = input.bytes[8] ? 'ON' : 'OFF';

		break;
		
	case 7:
		data.Device = getDeviceName(input.bytes[1]);
		if (input.bytes[0] === 0x81)
		{
			data.Cmd = getCmdId(input.bytes[0]);
			data.Status = (input.bytes[2] === 0x00) ? 'Success' : 'Failure';
		}
		else if (input.bytes[0] === 0x82)
		{
			data.Cmd = getCmdId(input.bytes[0]);
			data.MinTime = (input.bytes[2]<<8 | input.bytes[3]);
			data.MaxTime = (input.bytes[4]<<8 | input.bytes[5]);
			data.BatteryChange = input.bytes[6]/10;
			data.TempChange = (input.bytes[7]<<8 | input.bytes[8])/100;
			data.HumiChange = (input.bytes[9]<<8 | input.bytes[10])/100;
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
	  var batteryChg = input.data.BatteryChange * 10;
	  var tempChg = input.data.TempChange * 100;
	  var humiChg = input.data.HumiChange * 100;

	  ret = ret.concat(0x01, devid, (mint >> 8), (mint & 0xFF), (maxt >> 8), (maxt & 0xFF), batteryChg, (tempChg >> 8), (tempChg & 0xFF), (humiChg >> 8), (humiChg & 0xFF));
  }
  else if (input.data.Cmd == getCmdId(0x02))
  {
	  ret = ret.concat(0x02, devid, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
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
			data.BatteryChange = input.bytes[6]/10;
			data.TempChange = (input.bytes[7]<<8 | input.bytes[8])/100;
			data.HumiChange = (input.bytes[9]<<8 | input.bytes[10])/100;
		}
		else if (input.bytes[0] === 0x02)
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
