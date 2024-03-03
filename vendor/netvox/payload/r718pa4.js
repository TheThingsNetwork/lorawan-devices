function getCfgCmd(cfgcmd){
	var cfgcmdlist = {
	  0x01:   "ConfigReportReq",
	  0x81: "ConfigReportRsp",
	  0x02:   "ReadConfigReportReq",
	  0x82: "ReadConfigReportRsp"
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
}


function getDeviceName(dev){
	var deviceName = {
	  0x57: "R718PA4"
	};
	return deviceName[dev];
}
  
function getDeviceID(devName){
	var deviceName = {
	  "R718PA4": 0x57
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
			if(input.bytes[2] === 0x06){
				data.NO2 = (input.bytes[4]<<8 | input.bytes[5])*0.1;
				data.SO2 = (input.bytes[6]<<8 | input.bytes[7]);
				data.H2S = (input.bytes[8]<<8 | input.bytes[9])*0.1;	
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
		ret = ret.concat(getCmdID, devid, (mint >> 8), (mint & 0xFF), (maxt >> 8), (maxt & 0xFF), 0x00, 0x00, 0x00, 0x00,0x00);
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
			}else if(input.bytes[0] === getCmdToID("ReadConfigReportReq")){

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
  
