function getCfgCmd(cfgcmd){
  var cfgcmdlist = {
    1:   "ConfigReportReq",
    129: "ConfigReportRsp",
    2:   "ReadConfigReportReq",
    130: "ReadConfigReportRsp",
	3:   "SetShockSensorSensitivityReq",
    131: "SetShockSensorSensitivityRsp",
    4:   "GetShockSensorSensitivityReq",
    132: "GetShockSensorSensitivityRsp",
	5:   "SetSoilTypeReq",
    133: "SetSoilTypeRsp",
    6:   "GetSoilTypeReq",
    134: "GetSoilTypeRsp",

	7:   "ConfigDryContactPointOutReq",
    135: "ConfigDryContactPointOutRsp",
	8:   "ReadConfigDryContactPointOutReq",
    136: "ReadConfigDryContactPointOutRsp",
    9:   "TriggerDryContactPointOutReq",
    137: "TriggerDryContactPointOutRsp",

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
  else if (cmdtype == "SetShockSensorSensitivityReq")
	  return 3;
  else if (cmdtype == "SetShockSensorSensitivityRsp")
	  return 131;
  else if (cmdtype == "GetShockSensorSensitivityReq")
	  return 4;
  else if (cmdtype == "GetShockSensorSensitivityRsp")
	  return 132;
  else if (cmdtype == "SetSoilTypeReq")
	  return 5;
  else if (cmdtype == "SetSoilTypeRsp")
	  return 133;
  else if (cmdtype == "GetSoilTypeReq")
	  return 6;
  else if (cmdtype == "GetSoilTypeRsp")
	  return 134;
  else if (cmdtype == "ConfigDryContactPointOutReq")
	  return 7;
  else if (cmdtype == "ConfigDryContactPointOutRsp")
	  return 135;
  else if (cmdtype == "ReadConfigDryContactPointOutReq")
	  return 8;
  else if (cmdtype == "ReadConfigDryContactPointOutRsp")
	  return 136;
  else if (cmdtype == "TriggerDryContactPointOutReq")
	  return 9;
  else if (cmdtype == "TriggerDryContactPointOutRsp")
	  return 137;
}

function getDeviceName(dev){
  var deviceName = {
	263: "R900PB02",
	271: "R900PB02O1",
  };
  return deviceName[dev];
}

function getDeviceID(devName){
  var deviceName = {
	"R900PB02": 263,
	"R900PB02O1": 271,
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
    case 22:
		if (input.bytes[3] === 0x00)
		{
			data.Device = getDeviceName((input.bytes[1]<<8 | input.bytes[2]));
			data.SWver =  input.bytes[4]/10;
			data.HWver =  input.bytes[5];
			data.Datecode = padLeft(input.bytes[6].toString(16), 2) + padLeft(input.bytes[7].toString(16), 2) + padLeft(input.bytes[8].toString(16), 2) + padLeft(input.bytes[9].toString(16), 2);
			
			return {
				data: data,
			};
		}
		
		data.Device = getDeviceName((input.bytes[1]<<8 | input.bytes[2]));
		if (input.bytes[4] & 0x80)
		{
			var tmp_v = input.bytes[4] & 0x7F;
			data.Volt = (tmp_v / 10).toString() + '(low battery)';
		}
		else
			data.Volt = input.bytes[4]/10;

		data.Soil_VWC = (input.bytes[5]<<8 | input.bytes[6])/100+"%";

		if (input.bytes[7] & 0x80)
		{
			var tmpval = (input.bytes[7]<<8 | input.bytes[8]);
			data.Soil_Temperature = (0x10000 - tmpval)/100 * -1+"℃";
		}
		else
			data.Soil_Temperature = (input.bytes[7]<<8 | input.bytes[8])/100+"℃";

		data.Soil_EC = (input.bytes[9]<<8 | input.bytes[10])/1000+"ds/m";
		
		data.LowSoil_VWCAlarm = input.bytes[11] & 1;
		data.HighSoil_VWCAlarm = input.bytes[11]>>1 & 1;
		data.LowSoil_TemperatureAlarm = input.bytes[11]>>2 & 1;
		data.HighSoil_TemperatureAlarm = input.bytes[11]>>3 & 1;
		data.LowSoil_ECAlarm = input.bytes[11]>>4 & 1;
		data.HighSoil_ECAlarm = input.bytes[11]>>5 & 1;
		if(input.bytes[12] === 0x00){
			data.ShockTamperAlarm = 'NoAlarm';
		}else if(input.bytes[12] === 0x01){
			data.ShockTamperAlarm = 'Alarm';
		}

		break;
		
	case 23:
		data.Cmd = getCfgCmd(input.bytes[0]);
		data.Device = getDeviceName((input.bytes[1]<<8 | input.bytes[2]));
		if (input.bytes[0] === getCmdToID("ConfigReportRsp")
		|| input.bytes[0] === getCmdToID("SetShockSensorSensitivityRsp")
		|| input.bytes[0] === getCmdToID("SetSoilTypeRsp"))
		{
			data.Status = (input.bytes[3] === 0x00) ? 'Success' : 'Failure';
		}
		else if (input.bytes[0] === getCmdToID("ReadConfigReportRsp") )
		{
			data.MinTime = (input.bytes[3]<<8 | input.bytes[4]);
			data.MaxTime = (input.bytes[5]<<8 | input.bytes[6]);
			data.Soil_VWCChange = (input.bytes[7]<<8 | input.bytes[8])/100+"%";
			data.Soil_TemperatureChange = (input.bytes[9]<<8 | input.bytes[10])/100+"℃";
			data.Soil_ECChange = (input.bytes[11]<<8 | input.bytes[12])/1000+"ds/m";
		}
		else if (input.bytes[0] === getCmdToID("GetShockSensorSensitivityRsp") )
		{
			data.ShockSensorSensitivity = input.bytes[3];
		}
		else if (input.bytes[0] === getCmdToID("GetSoilTypeRsp") )
		{
			if(input.bytes[3]===0x00){
				data.SoilType = "Mineral Soil";
			}else if(input.bytes[3]===0x01){
				data.SoilType = "SandySoil";
			}else if(input.bytes[3]===0x02){
				data.SoilType = "Clay";
			}else if(input.bytes[3]===0x03){
				data.SoilType = "Organic soil";
			}
		}
		if(data.Device === "R900PB02O1" && (
			(input.bytes[0] === getCmdToID("ConfigDryContactPointOutRsp"))
		|| (input.bytes[0] === getCmdToID("TriggerDryContactPointOutRsp"))
		)){
			data.Status = (input.bytes[3] === 0x00) ? 'Success' : 'Failure';
		}
		else if(data.Device === "R900PB02O1" && 
		(input.bytes[0] === getCmdToID("ReadConfigDryContactPointOutRsp"))){
			if(input.bytes[3] === 0x00){
				data.DryContactPointOutType = 'NormallyLowLevel';
			}else if(input.bytes[3] === 0x01){
				data.DryContactPointOutType = 'NormallyHighLevel';
			}
			data.OutPluseTime = input.bytes[4]+ 's';

			data.LowSoil_VWCAlarm = input.bytes[5] & 1;
			data.HighSoil_VWCAlarm = input.bytes[5]>>1 & 1;
			data.LowSoil_TemperatureAlarm = input.bytes[5]>>2 & 1;
			data.HighSoil_TemperatureAlarm = input.bytes[5]>>3 & 1;
			data.LowSoil_ECAlarm = input.bytes[5]>>4 & 1;
			data.HighSoil_ECAlarm = input.bytes[5]>>5 & 1;
			if(input.bytes[6] === 0x00){
				data.Channel = 'Channel1';
			}else if(input.bytes[6] === 0x01){
				data.Channel = 'Channel2';
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
  var getCmdID;
	  
  getCmdID = getCmdToID(input.data.Cmd);
  devid = getDeviceID(input.data.Device);

  if (input.data.Cmd == "ConfigReportReq" )
  {
	  var mint = input.data.MinTime;
	  var maxt = input.data.MaxTime;
	  var sVWC = input.data.Soil_VWCChange*100;
	  var sTemp = input.data.Soil_TemperatureChange*100;
	  var sEC = input.data.Soil_ECChange*1000;
	  
	  ret = ret.concat(getCmdID, (devid>>8), (devid & 0xFF), (mint >> 8), (mint & 0xFF), (maxt >> 8), (maxt & 0xFF), 
	   (sVWC >> 8), (sVWC & 0xFF),  (sTemp >> 8), (sTemp & 0xFF),  (sEC >> 8), (sEC & 0xFF));
  }
  else if (input.data.Cmd == "ReadConfigReportReq" 
  	|| input.data.Cmd == "GetShockSensorSensitivityReq" 
	|| input.data.Cmd == "GetSoilTypeReq")
  {
	  ret = ret.concat(getCmdID, (devid>>8), (devid & 0xFF));
  }
  else if (input.data.Cmd == "SetShockSensorSensitivityReq")
  {
	  var sSensor = input.data.ShockSensorSensitivity;
	  ret = ret.concat(getCmdID, (devid>>8), (devid & 0xFF),sSensor);
  }  
  else if (input.data.Cmd == "SetSoilTypeReq")
  {
	  var sSensor = input.data.SoilType;
	  var value;
	  if(sSensor==="Mineral Soil"){
		value = 0x00;
	  }else if(sSensor==="SandySoil"){
		value = 0x01;
	  }else if(sSensor==="Clay"){
		value = 0x02;
	  }else if(sSensor==="Organic soil"){
		value = 0x03;
	}
	  ret = ret.concat(getCmdID, (devid>>8), (devid & 0xFF),value);
  }  
  if(devid===271 && input.data.Cmd == "ConfigDryContactPointOutReq"){
	 var dryCont = input.data.DryContactPointOutType;
	 var dryContValue;
	 if(dryCont==="NormallyLowLevel"){
		dryContValue = 0x00;
	  }else if(dryCont==="NormallyHighLevel"){
		dryContValue = 0x01;
	  }
	  var outpluse = input.data.OutPluseTime;
	  var lowSVWC = input.data.LowSoil_VWCAlarm;
	  var highSVWC = input.data.HighSoil_VWCAlarm;
	  var lowSTemp = input.data.LowSoil_TemperatureAlarm;
	  var highSTemp = input.data.HighSoil_TemperatureAlarm;
	  var lowSEC = input.data.LowSoil_ECAlarm;
	  var highSEC = input.data.HighSoil_ECAlarm;
	  var bindAS = lowSVWC | highSVWC<<1 | lowSTemp<<2 | highSTemp<<3 | lowSEC<<4 | highSEC<<5
	  var channel = input.data.Channel;
	  var channelValue;
	  if(channel==="Channel1"){
		channelValue = 0x00;
	   }else if(channel==="Channel2"){
		channelValue = 0x01;
	   }
	  ret = ret.concat(getCmdID, (devid>>8), (devid & 0xFF),dryContValue,outpluse,bindAS,channelValue);
  }
  if(devid===271 && input.data.Cmd == "ReadConfigDryContactPointOutReq"){
	 var channel = input.data.Channel;
	 var channelValue;
	 if(channel==="Channel1"){
	   channelValue = 0x00;
	  }else if(channel==="Channel2"){
	   channelValue = 0x01;
	  }
	 ret = ret.concat(getCmdID, (devid>>8), (devid & 0xFF),channelValue);
 }
 if(devid===271 && input.data.Cmd == "TriggerDryContactPointOutReq"){
	var outpluse = input.data.OutPluseTime;
	var channel = input.data.Channel;
	var channelValue;
	if(channel==="Channel1"){
	  channelValue = 0x00;
	 }else if(channel==="Channel2"){
	  channelValue = 0x01;
	 }
	ret = ret.concat(getCmdID, (devid>>8), (devid & 0xFF),outpluse,channelValue);
}
  return {
    fPort: 23,
    bytes: ret
  };
}  
  
function decodeDownlink(input) {
  var data = {};
  switch (input.fPort) {
    case 23:
		data.Cmd = getCfgCmd(input.bytes[0]);
		data.Device = getDeviceName((input.bytes[1]<<8 | input.bytes[2]));
		if (input.bytes[0] === getCmdToID("ConfigReportReq"))
		{
			data.MinTime = (input.bytes[3]<<8 | input.bytes[4]);
			data.MaxTime = (input.bytes[5]<<8 | input.bytes[6]);
			data.Soil_VWCChange = (input.bytes[7]<<8 | input.bytes[8])/100+"%";
			data.Soil_TemperatureChange = (input.bytes[9]<<8 | input.bytes[10])/100+"℃";
			data.Soil_ECChange = (input.bytes[11]<<8 | input.bytes[12])/1000+"ds/m";
		}
		else if (input.bytes[0] === getCmdToID("SetShockSensorSensitivityReq"))
		{
			data.ShockSensorSensitivity = input.bytes[3];
		}else if(input.bytes[0] === getCmdToID("SetSoilTypeReq")){
			if(input.bytes[3]===0x00){
				data.SoilType = "Mineral Soil";
			}else if(input.bytes[3]===0x01){
				data.SoilType = "SandySoil";
			}else if(input.bytes[3]===0x02){
				data.SoilType = "Clay";
			}else if(input.bytes[3]===0x03){
				data.SoilType = "Organic soil";
			}
		}

		if (data.Device=="R900PB02O1" && input.bytes[0] === getCmdToID("ConfigDryContactPointOutReq"))
		{
			if(input.bytes[3] === 0x00){
				data.DryContactPointOutType = 'NormallyLowLevel';
			}else if(input.bytes[3] === 0x01){
				data.DryContactPointOutType = 'NormallyHighLevel';
			}
			data.OutPluseTime = input.bytes[4]+ 's';

			data.LowSoil_VWCAlarm = input.bytes[5] & 1;
			data.HighSoil_VWCAlarm = input.bytes[5]>>1 & 1;
			data.LowSoil_TemperatureAlarm = input.bytes[5]>>2 & 1;
			data.HighSoil_TemperatureAlarm = input.bytes[5]>>3 & 1;
			data.LowSoil_ECAlarm = input.bytes[5]>>4 & 1;
			data.HighSoil_ECAlarm = input.bytes[5]>>5 & 1;
			if(input.bytes[6] === 0x00){
				data.Channel = 'Channel1';
			}else if(input.bytes[6] === 0x01){
				data.Channel = 'Channel2';
			}
		}
		else if(data.Device=="R900PB02O1" && input.bytes[0] === getCmdToID("ReadConfigDryContactPointOutReq")){
			if(input.bytes[3] === 0x00){
				data.Channel = 'Channel1';
			}else if(input.bytes[3] === 0x01){
				data.Channel = 'Channel2';
			}
		}
		else if(data.Device=="R900PB02O1" && input.bytes[0] === getCmdToID("TriggerDryContactPointOutReq")){
			data.OutPluseTime = input.bytes[3]
			if(input.bytes[4] === 0x00){
				data.Channel = 'Channel1';
			}else if(input.bytes[4] === 0x01){
				data.Channel = 'Channel2';
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
