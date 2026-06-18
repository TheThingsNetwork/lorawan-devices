function getCfgCmd(cfgcmd){
	var cfgcmdlist = {
	  0x01:   "ConfigReportReq",
	  0x81: "ConfigReportRsp",
	  0x02:   "ReadConfigReportReq",
	  0x82: "ReadConfigReportRsp",
	  0x03:   "SetMeasureTypeReq",
	  0x83: "SetMeasureTypeRsp",
	  0x04:   "GetMeasureTypeReq",
	  0x84: "GetMeasureTypeRsp"
	};
	return cfgcmdlist[cfgcmd];
}
  
function getCmdToID(cmdtype){
	if (cmdtype == "ConfigReportReq")
		return 0x01;
	else if (cmdtype == "ConfigReportRsp")
		return 0x81;
	else if (cmdtype == "ReadConfigReportReq")
		return 0x02;
	else if (cmdtype == "ReadConfigReportRsp")
		return 0x82;
	else if (cmdtype == "SetMeasureTypeReq")
		return 0x03;
	else if (cmdtype == "SetMeasureTypeRsp")
		return 0x83;
	else if (cmdtype == "GetMeasureTypeReq")
		return 0x04;
	else if (cmdtype == "GetMeasureTypeRsp")
		return 0x84;
}

function getMeasureType(type){
	var typelist = {
	  1:   "Water",
	  2:   "Gasoline",
	  3:   "Diesel oil"
	};
	return typelist[type];
}

function getTypeID(id){
	var type = {
	  "Water": 		1,
	  "Gasoline": 	2,
	  "Diesel oil": 3
	};
	return type[id];
}

function getDeviceName(dev){
	var deviceName = {
	  0x9B: "R718PA22",
	  0xAE: "R726A22"
	};
	return deviceName[dev];
}
  
function getDeviceID(devName){
	var deviceName = {
	  "R718PA22": 0x9B,
	  "R726A22": 0xAE
	};
	return deviceName[devName];
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

			data.Depth = (input.bytes[4]<<8 | input.bytes[5]);
			if (input.bytes[6] & 0x80)
			{
				var tmpval = (input.bytes[6]<<8 | input.bytes[7]);
				data.Temp = (0x10000 - tmpval) * -1;
			}
			else
				data.Temp = (input.bytes[6]<<8 | input.bytes[7]);

			data.InstallStatus = (input.bytes[8] === 0x00) ? 'Success' : 'Failure';	

		 	break;
		  
		case 7:
			data.Cmd = getCfgCmd(input.bytes[0]);
			data.Device = getDeviceName(input.bytes[1]);
			if ((input.bytes[0] === getCmdToID("ConfigReportRsp")) || (input.bytes[0] === getCmdToID("SetMeasureTypeRsp")))
			{
				data.Status = (input.bytes[2] === 0x00) ? 'Success' : 'Failure';
			}
			else if (input.bytes[0] === getCmdToID("ReadConfigReportRsp"))
			{
				data.MinTime = (input.bytes[2]<<8 | input.bytes[3]);
				data.MaxTime = (input.bytes[4]<<8 | input.bytes[5]);
				data.BatteryChange = input.bytes[6]/10;
				data.DepthChange = (input.bytes[7]<<8 | input.bytes[8]);
				data.TempChange = input.bytes[9];
			}
			else if (input.bytes[0] === getCmdToID("GetMeasureTypeRsp"))
			{
				data.MeasureType = getMeasureType(input.bytes[2]);
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
		var depthChg = input.data.DepthChange;
		var tempChg = input.data.TempChange;
		
		ret = ret.concat(getCmdID, devid, (mint >> 8), (mint & 0xFF), (maxt >> 8), (maxt & 0xFF), batteryChg, (depthChg >> 8), (depthChg & 0xFF), tempChg, 0x00);
	}
	else if ((input.data.Cmd == "ReadConfigReportReq") || (input.data.Cmd == "GetMeasureTypeReq"))
	{
		ret = ret.concat(getCmdID, devid, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
	}  
	else if (input.data.Cmd == "SetMeasureTypeReq")
	{
		var type = getTypeID(input.data.MeasureType);
		
		ret = ret.concat(getCmdID, devid, type, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
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
				data.DepthChange = (input.bytes[7]<<8 | input.bytes[8]);
				data.TempChange = input.bytes[9];
			}
			else if (input.bytes[0] === getCmdToID("SetMeasureTypeReq"))
			{
				data.MeasureType = getMeasureType(input.bytes[2]);
			}

			break;
			
		default:
			return {
				rrors: ['invalid FPort'],
			};
	}
	
	return {
		data: data,
	};
}
  
