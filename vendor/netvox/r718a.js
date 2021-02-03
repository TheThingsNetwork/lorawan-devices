function getCmdId(inputcmd){
  var cmdIDs = {
    1:   "ConfigReportReq",
    129: "ConfigReportRsp",
    2:   "ReadConfigReportReq",
    130: "ReadConfigReportRsp"
  };
  return cmdIDs[inputcmd];
}

function getDeviceName(dev){
  var deviceName = {
    11: "R718A"
  };
  return deviceName[dev];
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
			data.HWver =  input.bytes[4]/10;
			data.Datecode = padLeft(input.bytes[5].toString(16), 2) + padLeft(input.bytes[6].toString(16), 2) + padLeft(input.bytes[7].toString(16), 2) + padLeft(input.bytes[8].toString(16), 2);
			
			return {
				data: data,
			};
		}
		else
			data.Volt = input.bytes[3]/10;
		
		if (input.bytes[1] === 0x0B)
		{
			data.Device = getDeviceName(input.bytes[1]);
			data.Temp = (input.bytes[4]*16*16 + input.bytes[5])/100;
			data.Humi = (input.bytes[6]*16*16 + input.bytes[7])/100;
		}
		break;
		
	case 7:
		if (input.bytes[1] === 0x0B)
		{
			data.Device = getDeviceName(input.bytes[1]);
			if (input.bytes[0] === 0x81)
			{
				data.Cmd = getCmdId(input.bytes[0]);
				data.Status = (input.bytes[2] === 0x00) ? 'Success' : 'Failure';
			}
			else if (input.bytes[0] === 0x82)
			{
				data.Cmd = getCmdId(input.bytes[0]);
				data.MinTime = (input.bytes[2]*16*16 + input.bytes[3]);
				data.MaxTime = (input.bytes[4]*16*16 + input.bytes[5]);
				data.BatteryChange = input.bytes[6]/10;
				data.TempChange = (input.bytes[7]*16*16 + input.bytes[8])/100;
				data.HumiChange = (input.bytes[9]*16*16 + input.bytes[10])/100;
			}
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
  
  if (input.data.Device == "R718A")
	devid = 0x0B;
  
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
		if (input.bytes[1] === 0x0B)
		{
			data.Device = getDeviceName(input.bytes[1]);
			if (input.bytes[0] === 0x01)
			{
				data.Cmd = getCmdId(input.bytes[0]);
				data.MinTime = (input.bytes[2]*16*16 + input.bytes[3]);
				data.MaxTime = (input.bytes[4]*16*16 + input.bytes[5]);
				data.BatteryChange = input.bytes[6]/10;
				data.TempChange = (input.bytes[7]*16*16 + input.bytes[8])/100;
				data.HumiChange = (input.bytes[9]*16*16 + input.bytes[10])/100;
			}
			else if (input.bytes[0] === 0x02)
			{
				data.Cmd = getCmdId(input.bytes[0]);
			}
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
