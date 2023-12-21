function getCfgCmd(cfgcmd){
	var cfgcmdlist = {
	  0x01:   "ConfigReportReq",
	  0x81: "ConfigReportRsp",
	  0x02:   "ReadConfigReportReq",
	  0x82: "ReadConfigReportRsp",
	  0x03:   "SetLDOSettingReq",
	  0x83: "SetLDOSettingRsp",
	  0x04:   "GetLDOSettingReq",
	  0x84: "GetLDOSettingRsp",
	  0x05:   "ORPCalibrateReq",
	  0x85: "ORPCalibrateRsp",
	  0x06:   "PHCalibrateReq",
	  0x86: "PHCalibrateRsp",
	  0x07:   "NTUCalibrateReq",
	  0x87: "NTUCalibrateRsp",
	  0x08:   "SetWireLengthReq",
	  0x88: "SetWireLengthRsp",
	  0x09:   "GetWireLengthReq",
	  0x89: "GetWireLengthRsp",
	  0x0A:   "SetSoilTypeReq",
	  0x8A: "SetSoilTypeRsp",
	  0x0B:   "GetSoilTypeReq",
	  0x8B: "GetSoilTypeRsp",
	  0x0C:   "SoilCalibrateReq",
	  0x8C: "SoilCalibrateRsp",
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
	else if (cmdtype == "SetLDOSettingReq")
		return 0x03;
	else if (cmdtype == "SetLDOSettingRsp")
		return 0x83;
	else if (cmdtype == "GetLDOSettingReq")
		return 0x04;
	else if (cmdtype == "GetLDOSettingRsp")
		return 0x84;
	else if (cmdtype == "ORPCalibrateReq")
		return 0x05;
	else if (cmdtype == "ORPCalibrateRsp")
		return 0x85;
	else if (cmdtype == "PHCalibrateReq")
		return 0x06;
	else if (cmdtype == "PHCalibrateRsp")
		return 0x86;
	else if (cmdtype == "NTUCalibrateReq")
		return 0x07;
	else if (cmdtype == "NTUCalibrateRsp")
		return 0x87;
	else if (cmdtype == "SetWireLengthReq")
		return 0x08;
	else if (cmdtype == "SetWireLengthRsp")
		return 0x88;
	else if (cmdtype == "GetWireLengthReq")
		return 0x09;
	else if (cmdtype == "GetWireLengthRsp")
		return 0x89;
	else if (cmdtype == "SetSoilTypeReq")
		return 0x0A;
	else if (cmdtype == "SetSoilTypeRsp")
		return 0x8A;
	else if (cmdtype == "GetSoilTypeReq")
		return 0x0B;
	else if (cmdtype == "GetSoilTypeRsp")
		return 0x8B;
	else if (cmdtype == "SoilCalibrateReq")
		return 0x0C;
	else if (cmdtype == "SoilCalibrateRsp")
		return 0x8C;
}


function getDeviceName(dev){
	var deviceName = {
	  0x58: "R718PB"
	};
	return deviceName[dev];
}
  
function getDeviceID(devName){
	var deviceName = {
	  "R718PB": 0x58
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
			else{
				data.Volt = input.bytes[3]/10;
			}
			if(input.bytes[2] === 0x01){
				data.PM1_0_CF = (input.bytes[4]<<8 | input.bytes[5]);
				data.PM2_5_CF = (input.bytes[6]<<8 | input.bytes[7]);
				data.PM10_CF = (input.bytes[8]<<8 | input.bytes[9]);
			}else if(input.bytes[2] === 0x02){
				data.PM1_0 = (input.bytes[4]<<8 | input.bytes[5]);
				data.PM2_5 = (input.bytes[6]<<8 | input.bytes[7]);
				data.PM10 = (input.bytes[8]<<8 | input.bytes[9]);
			}else if(input.bytes[2] === 0x03){
				data.PM0_3UM = (input.bytes[4]<<16 | input.bytes[5]<<8 | input.bytes[6]);
				if (data.PM0_3UM & 0x80){
					data.PM0_3UM = data.PM0_3UM & 0x7F;
				}
				data.PM0_5UM = (input.bytes[7]<<8 | input.bytes[8]);
				data.PM1_0UM =(input.bytes[9]<<8 | input.bytes[10]);
			}else if(input.bytes[2] === 0x04){
				data.PM2_5UM = (input.bytes[4]<<8 | input.bytes[5]);
				data.PM5_0UM = (input.bytes[6]<<8 | input.bytes[7]);
				data.PM10UM = (input.bytes[8]<<8 | input.bytes[9]);
			}else if(input.bytes[2] === 0x05){
				data.O3 = (input.bytes[4]<<8 | input.bytes[5])*0.1;
				data.CO = (input.bytes[6]<<8 | input.bytes[7])*0.1;
				data.NO = (input.bytes[8]<<8 | input.bytes[9])*0.1;
			}else if(input.bytes[2] === 0x06){
				data.NO2 = (input.bytes[4]<<8 | input.bytes[5])*0.1;
				data.SO2 = (input.bytes[6]<<8 | input.bytes[7]);
				data.H2S = (input.bytes[8]<<8 | input.bytes[9])*0.1;
			}else if(input.bytes[2] === 0x07){
				data.CO2_0_1 = (input.bytes[4]<<8 | input.bytes[5])*0.1;
				data.NH3 = (input.bytes[6]<<8 | input.bytes[7])*0.1;
				data.Noise = (input.bytes[8]<<8 | input.bytes[9])*0.1;
			}else if(input.bytes[2] === 0x08){
				data.PH = (input.bytes[4]<<8 | input.bytes[5])*0.01;
				data.Tempera = (input.bytes[6]<<8 | input.bytes[7])*0.01;
				data.ORP = (input.bytes[8]<<8 | input.bytes[9]);
				if (data.Tempera & 0x80){
					data.Tempera = data.Tempera & 0x7F;
				}
				if (data.ORP & 0x80){
					data.ORP= data.ORP & 0x7F;
				}
			}else if(input.bytes[2] === 0x09){
				data.NTU = (input.bytes[4]<<8 | input.bytes[5])*0.1;
				data.Tempera = (input.bytes[6]<<8 | input.bytes[7])*0.01;
				data.Soil_VWC = (input.bytes[8]<<8 | input.bytes[9])*0.01;
				if (data.Tempera & 0x80){
					data.Tempera= data.Tempera & 0x7F;
				}
			}else if(input.bytes[2] === 0x0A){
				data.Soil_VWC = (input.bytes[4]<<8 | input.bytes[5])*0.01;
				data.Soil_Temp = (input.bytes[6]<<8 | input.bytes[7])*0.01;
				data.water = (input.bytes[8]<<8 | input.bytes[9]);
				data.Soil_EC = input.bytes[10]*0.1;
			}else if(input.bytes[2] === 0x0B){
				data.Tempera = (input.bytes[4]<<8 | input.bytes[5])*0.01;
				data.LDODO = (input.bytes[6]<<8 | input.bytes[7])*0.01;
				data.LDOSat = (input.bytes[8]<<8 | input.bytes[9])*0.1;
				if (data.Tempera & 0x80){
					data.Tempera= data.Tempera & 0x7F;
				}
			}else if(input.bytes[2] === 0x0C){
				data.Tempera = (input.bytes[4]<<8 | input.bytes[5])*0.01;
				data.Humidity = (input.bytes[6]<<8 | input.bytes[7])*0.01;
				data.WindSpeed = (input.bytes[8]<<8 | input.bytes[9])*0.01;
			}else if(input.bytes[2] === 0x0D){
				data.WindDirection = (input.bytes[4]<<8 | input.bytes[5]);
				data.Atomsphere = ((input.bytes[6]<<24) | (input.bytes[7]<<16) | (input.bytes[8]<<8)| (input.bytes[9]))*0.01;
			}else if(input.bytes[2] === 0x0E){
				data.VOC_0_1 = (input.bytes[4]<<8 | input.bytes[5])*0.1;
			}else if(input.bytes[2] === 0x0F){
				data.Nitrogen = (input.bytes[4]<<8 | input.bytes[5]);
				data.Phosphorus = (input.bytes[6]<<8 | input.bytes[7]);
				data.Potassium = (input.bytes[8]<<8 | input.bytes[9]);
			}else if(input.bytes[2] === 0x10){
				data.Soil_VWC = (input.bytes[4]<<8 | input.bytes[5])*0.01;
				data.Soil_Temperature = (input.bytes[6]<<8 | input.bytes[7])*0.01;
				data.Soli_EC = (input.bytes[8]<<8 | input.bytes[9])*0.001;
			}	

		 	break;
		  
		case 7:
			data.Cmd = getCfgCmd(input.bytes[0]);
			data.Device = getDeviceName(input.bytes[1]);
			if (input.bytes[0] === getCmdToID("ReadConfigReportRsp") 
			|| input.bytes[0] === getCmdToID("ReadConfigReportRsp"))
			{
				data.MinTime = (input.bytes[2]<<8 | input.bytes[3]);
				data.MaxTime = (input.bytes[4]<<8 | input.bytes[5]);
			}
			else if (input.bytes[0] === getCmdToID("ConfigReportRsp") 
			|| input.bytes[0] === getCmdToID("SetLDOSettingRsp")
			|| input.bytes[0] === getCmdToID("ORPCalibrateRsp")
			|| input.bytes[0] === getCmdToID("PHCalibrateRsp")
			|| input.bytes[0] === getCmdToID("NTUCalibrateRsp")
			|| input.bytes[0] === getCmdToID("SetWireLengthRsp")
			|| input.bytes[0] === getCmdToID("SetSoilTypeRsp")
			|| input.bytes[0] === getCmdToID("SoilCalibrateRsp"))
			{
				data.Status = (input.bytes[2] === 0x00) ? 'Success' : 'Failure';
			}else if(input.bytes[0] === getCmdToID("GetLDOSettingRsp")){
				data.LDOsAltiud = input.bytes[2]<<8 |input.bytes[3];
				data.LDOsPSU = input.bytes[4]<<8 |input.bytes[5];
			}else if(input.bytes[0] === getCmdToID("GetWireLengthRsp")){
				
				data.Length = (input.bytes[2]<<8 |input.bytes[3]);
			}else if(input.bytes[0] === getCmdToID("GetSoilTypeRsp")){
				data.SoilType = input.bytes[2];
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
	}else if (input.data.Cmd == "ReadConfigReportReq"
	|| input.data.Cmd == "GetLDOSettingReq"
	|| input.data.Cmd == "GetWireLengthReq"
	|| input.data.Cmd == "GetSoilTypeReq")
	{
		ret = ret.concat(getCmdID, devid, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
	}else if (input.data.Cmd == "SetLDOSettingReq")
	{
		var LDOsAltiud = input.data.LDOsAltiud;
		var LDOsPSU = input.data.LDOsPSU;
		ret = ret.concat(getCmdID, devid, (LDOsAltiud >> 8), (LDOsAltiud & 0xFF), (LDOsPSU >> 8), (LDOsPSU & 0xFF), 0x00, 0x00, 0x00, 0x00, 0x00);
	}else if (input.data.Cmd == "ORPCalibrateReq")
	{
		var StandORP = input.data.StandORP;
		ret = ret.concat(getCmdID, devid, (StandORP >> 8), (StandORP & 0xFF), 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
	}else if (input.data.Cmd == "PHCalibrateReq")
	{
		var StandPH = input.data.StandPH;
		ret = ret.concat(getCmdID, devid, (StandPH >> 8), (StandPH & 0xFF), 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
	}else if (input.data.Cmd == "NTUCalibrateReq")
	{
		var StandNTU = input.data.StandNTU;
		ret = ret.concat(getCmdID, devid, (StandNTU >> 8), (StandNTU & 0xFF), 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
	}else if (input.data.Cmd == "SetWireLengthReq")
	{
		var Length = input.data.Length/10;
		ret = ret.concat(getCmdID, devid, (Length >> 8), (Length & 0xFF), 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
	}else if (input.data.Cmd == "SetSoilTypeReq")
	{
		var SoildType = input.data.SoildType;
		ret = ret.concat(getCmdID, devid, SoildType, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
	}else if (input.data.Cmd == "SoilCalibrateReq")
	{
		var VWCDelt = input.data.VWCDelt;
		ret = ret.concat(getCmdID, devid, VWCDelt, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
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
			}else if (input.bytes[0] === getCmdToID("ReadConfigReportReq")
			||input.bytes[0] === getCmdToID("GetLDOSettingReq")
			|| input.bytes[0]== getCmdToID("GetWireLengthReq")
			|| input.bytes[0] == getCmdToID("GetSoilTypeReq"))
			{
			
			}else if (input.bytes[0] === getCmdToID("SetLDOSettingReq"))
			{
				data.LDOsAltiud = (input.bytes[2]<<8 | input.bytes[3]);
				data.LDOsPSU = (input.bytes[4]<<8 | input.bytes[5]);
			}else if (input.bytes[0]== getCmdToID("ORPCalibrateReq"))
			{
				data.StandORP = (input.bytes[2]<<8 | input.bytes[3]);
			
			}else if (input.bytes[0] == getCmdToID("PHCalibrateReq"))
			{
				data.StandPH = (input.bytes[2]<<8 | input.bytes[3]);
				
			}else if (input.bytes[0]== getCmdToID("NTUCalibrateReq"))
			{
				data.StandNTU = (input.bytes[2]<<8 | input.bytes[3]);
			
			}else if (input.bytes[0]== getCmdToID("SetWireLengthReq"))
			{
				data.Length = (input.bytes[2]<<8 | input.bytes[3])*10;
		
			}else if (input.bytes[0]== getCmdToID("SetSoilTypeReq"))
			{
				data.SoildType = input.bytes[2];
			
			}else if (input.bytes[0]== getCmdToID("SoilCalibrateReq"))
			{
				data.VWCDelt = input.bytes[2]+"%";
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
  
