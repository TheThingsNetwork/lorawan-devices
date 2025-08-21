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

	5:   "ConfigDryContactPointOutReq",
    133: "ConfigDryContactPointOutRsp",
    6:   "ReadConfigDryContactPointOutReq",
    134: "ReadConfigDryContactPointOutRsp",
	7:   "TriggerDryContactPointOutReq",
    135: "TriggerDryContactPointOutRsp",

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
  else if (cmdtype == "ConfigDryContactPointOutReq")
	  return 5;
  else if (cmdtype == "ConfigDryContactPointOutRsp")
	  return 133;
  else if (cmdtype == "ReadConfigDryContactPointOutReq")
	  return 6;
  else if (cmdtype == "ReadConfigDryContactPointOutRsp")
	  return 134;
  else if (cmdtype == "TriggerDryContactPointOutReq")
	  return 7;
  else if (cmdtype == "TriggerDryContactPointOutRsp")
	  return 135;
}

function getDeviceName(dev){
  var deviceName = {
	262: "R900PD01",
	270: "R900PD01O1",
  };
  return deviceName[dev];
}

function getDeviceID(devName){
  var deviceName = {
	"R900PD01": 262,
	"R900PD01O1": 270,
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
		data.PH = (input.bytes[4]<<8 | input.bytes[5])/100+"pH";

		if (input.bytes[6] & 0x80)
		{
			var tmpval = (input.bytes[6]<<8 | input.bytes[7]);
			data.TemperaturewithPH = (0x10000 - tmpval)/100 * -1+"℃";
		}
		else
			data.TemperaturewithPH = (input.bytes[6]<<8 | input.bytes[7])/100+"℃";

		data.NTU = (input.bytes[8]<<8 | input.bytes[9])/10+"ntu";
		if (input.bytes[10] & 0x80)
		{
			var tmpval = (input.bytes[10]<<8 | input.bytes[11]);
			data.TemperaturewithNTU = (0x10000 - tmpval)/100 * -1+"℃";
		}
		else
			data.TemperaturewithNTU = (input.bytes[10]<<8 | input.bytes[11])/100+"℃";
		data.Residual = (input.bytes[12]<<8 | input.bytes[13])/100+"mg/L";

		data.LowPHAlarm = (input.bytes[14] | input.bytes[15])& 1;
		data.HighPHAlarm = (input.bytes[14]| input.bytes[15])>>1 & 1;
		data.LowNTUAlarm = (input.bytes[14]| input.bytes[15])>>2 & 1;
		data.HighNTUAlarm = (input.bytes[14]| input.bytes[15])>>3 & 1;
		data.LowResidualChlorineAlarm = (input.bytes[14]| input.bytes[15])>>4 & 1;
		data.HighResidualChlorineAlarm = (input.bytes[14]| input.bytes[15])>>5 & 1;
		data.LowTempWithPHAlarm = (input.bytes[14]| input.bytes[15])>>6 & 1;
		data.HighTempWithPHAlarm = (input.bytes[14]| input.bytes[15])>>7 & 1;
		data.LowTempWithNTUAlarm = (input.bytes[14]| input.bytes[15])>>8 & 1;
		data.HighTempWithNTUAlarm = (input.bytes[14]| input.bytes[15])>>9 & 1;
		if(input.bytes[16] === 0x00){
			data.ShockTamperAlarm = 'NoAlarm';
		}else if(input.bytes[16] === 0x01){
			data.ShockTamperAlarm = 'Alarm';
		}

		break;
		
	case 23:
		data.Cmd = getCfgCmd(input.bytes[0]);
		data.Device = getDeviceName((input.bytes[1]<<8 | input.bytes[2]));
		if (input.bytes[0] === getCmdToID("ConfigReportRsp")
		|| input.bytes[0] === getCmdToID("SetShockSensorSensitivityRsp"))
		{
			data.Status = (input.bytes[3] === 0x00) ? 'Success' : 'Failure';
		}
		else if (input.bytes[0] === getCmdToID("ReadConfigReportRsp") )
		{
			data.MinTime = (input.bytes[3]<<8 | input.bytes[4]);
			data.MaxTime = (input.bytes[5]<<8 | input.bytes[6]);
			data.PHChange = (input.bytes[7]<<8 | input.bytes[8])/100+"pH";
			data.NTUChange = (input.bytes[9]<<8 | input.bytes[10])/10+"ntu";
			data.ResidualChlorineChange = (input.bytes[11]<<8 | input.bytes[12])/100+"mg/L";
			data.TemperatureChange = (input.bytes[13]<<8 | input.bytes[14])/100+"℃";
		}
		else if (input.bytes[0] === getCmdToID("GetShockSensorSensitivityRsp") )
		{
			data.ShockSensorSensitivity = input.bytes[3];
		}
		
		if(data.Device === "R900PD01O1" && (
			(input.bytes[0] === getCmdToID("ConfigDryContactPointOutRsp"))
		|| (input.bytes[0] === getCmdToID("TriggerDryContactPointOutRsp"))
		)){
			data.Status = (input.bytes[3] === 0x00) ? 'Success' : 'Failure';
		}
		else if(data.Device === "R900PD01O1" && 
		(input.bytes[0] === getCmdToID("ReadConfigDryContactPointOutRsp"))){
			if(input.bytes[3] === 0x00){
				data.DryContactPointOutType = 'NormallyLowLevel';
			}else if(input.bytes[3] === 0x01){
				data.DryContactPointOutType = 'NormallyHighLevel';
			}
			data.OutPluseTime = input.bytes[4]+ 's';

			data.LowPHAlarm = (input.bytes[5]| input.bytes[6]) & 1;
			data.HighPHAlarm = (input.bytes[5]| input.bytes[6])>>1 & 1;
			data.LowNTUAlarm = (input.bytes[5]| input.bytes[6])>>2 & 1;
			data.HighNTUAlarm = (input.bytes[5]| input.bytes[6])>>3 & 1;
			data.LowResidualChlorineAlarm = (input.bytes[5]| input.bytes[6])>>4 & 1;
			data.HighResidualChlorineAlarm = (input.bytes[5]| input.bytes[6])>>5 & 1;
			data.LowTempWithPHAlarm = (input.bytes[5]| input.bytes[6])>>6 & 1;
			data.HighTempWithPHAlarm = (input.bytes[5]| input.bytes[6])>>7 & 1;
			data.LowTempWithNTUAlarm = (input.bytes[5]| input.bytes[6])>>8 & 1;
			data.HighTempWithNTUAlarm = (input.bytes[5]| input.bytes[6])>>9 & 1;

			if(input.bytes[7] === 0x00){
				data.Channel = 'Channel1';
			}else if(input.bytes[8] === 0x01){
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
	  var ph = input.data.PHChange*100;
	  var ntu = input.data.NTUChange*10;
	  var residual = input.data.ResidualChlorineChange*100;
	  var temperature = input.data.TemperatureChange*100;

	  ret = ret.concat(getCmdID, (devid>>8), (devid & 0xFF), (mint >> 8), (mint & 0xFF), (maxt >> 8), (maxt & 0xFF), 
	   (ph >> 8), (ph & 0xFF),  (ntu >> 8), (ntu & 0xFF), 
	   (residual >> 8), (residual & 0xFF), (temperature >> 8), (temperature & 0xFF));
  }
  else if (input.data.Cmd == "ReadConfigReportReq" 
  	|| input.data.Cmd == "GetShockSensorSensitivityReq" )
  {
	  ret = ret.concat(getCmdID, (devid>>8), (devid & 0xFF));
  }
  else if (input.data.Cmd == "SetShockSensorSensitivityReq")
  {
	  var sSensor = input.data.ShockSensorSensitivity;
	  ret = ret.concat(getCmdID, (devid>>8), (devid & 0xFF),sSensor);
  }  
  if(devid===270 && input.data.Cmd == "ConfigDryContactPointOutReq"){
	 var dryCont = input.data.DryContactPointOutType;
	 var dryContValue;
	 if(dryCont==="NormallyLowLevel"){
		dryContValue = 0x00;
	  }else if(dryCont==="NormallyHighLevel"){
		dryContValue = 0x01;
	  }
	  var outpluse = input.data.OutPluseTime;

	  var lowph = input.data.LowPHAlarm;
	  var highph = input.data.HighPHAlarm;
	  var lowntu = input.data.LowNTUAlarm;
	  var highntu = input.data.HighNTUAlarm;
	  var lowres = input.data.LowResidualChlorineAlarm;
	  var highres = input.data.HighResidualChlorineAlarm;
	  var lowtempph = input.data.LowTempWithPHAlarm;
	  var hightempph = input.data.HighTempWithPHAlarm;
	  var lowtempntu = input.data.LowTempWithNTUAlarm;
	  var hightempntu = input.data.HighTempWithNTUAlarm;
	  var bindAS = lowph | highph<<1 | lowntu<<2 | highntu<<3 | lowres<<4 | highres<<5 
	  | lowtempph<<6 | hightempph<<7 | lowtempntu<<8 | hightempntu<<9
	
	  var channel = input.data.Channel;
	  var channelValue;
	  if(channel==="Channel1"){
		channelValue = 0x00;
	   }else if(channel==="Channel2"){
		channelValue = 0x01;
	   }
	  ret = ret.concat(getCmdID, (devid>>8), (devid & 0xFF),dryContValue,outpluse,(bindAS>>8), (bindAS & 0xFF),channelValue);
  }
  if(devid===270 && input.data.Cmd == "ReadConfigDryContactPointOutReq"){
	 var channel = input.data.Channel;
	 var channelValue;
	 if(channel==="Channel1"){
	   channelValue = 0x00;
	  }else if(channel==="Channel2"){
	   channelValue = 0x01;
	  }
	 ret = ret.concat(getCmdID, (devid>>8), (devid & 0xFF),channelValue);
 }
 if(devid===270 && input.data.Cmd == "TriggerDryContactPointOutReq"){
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
			data.PHChange = (input.bytes[7]<<8 | input.bytes[8])/100+"pH";
			data.NTUChange = (input.bytes[9]<<8 | input.bytes[10])/10+"ntu";
			data.ResidualChlorineChange = (input.bytes[11]<<8 | input.bytes[12])/100+"mg/L";
			data.TemperatureChange = (input.bytes[13]<<8 | input.bytes[14])/100+"℃";
		}
		else if (input.bytes[0] === getCmdToID("SetShockSensorSensitivityReq"))
		{
			data.ShockSensorSensitivity = input.bytes[3];
		}

		if (data.Device=="R900PD01O1" && input.bytes[0] === getCmdToID("ConfigDryContactPointOutReq"))
		{
			if(input.bytes[3] === 0x00){
				data.DryContactPointOutType = 'NormallyLowLevel';
			}else if(input.bytes[3] === 0x01){
				data.DryContactPointOutType = 'NormallyHighLevel';
			}
			data.OutPluseTime = input.bytes[4]+ 's';

			data.LowPHAlarm = (input.bytes[5]| input.bytes[6]) & 1;
			data.HighPHAlarm = (input.bytes[5]| input.bytes[6])>>1 & 1;
			data.LowNTUAlarm = (input.bytes[5]| input.bytes[6])>>2 & 1;
			data.HighNTUAlarm = (input.bytes[5]| input.bytes[6])>>3 & 1;
			data.LowResidualChlorineAlarm = (input.bytes[5]| input.bytes[6])>>4 & 1;
			data.HighResidualChlorineAlarm = (input.bytes[5]| input.bytes[6])>>5 & 1;
			data.LowTempWithPHAlarm = (input.bytes[5]| input.bytes[6])>>6 & 1;
			data.HighTempWithPHAlarm = (input.bytes[5]| input.bytes[6])>>7 & 1;
			data.LowTempWithNTUAlarm = (input.bytes[5]| input.bytes[6])>>8 & 1;
			data.HighTempWithNTUAlarm = (input.bytes[5]| input.bytes[6])>>9 & 1;


			if(input.bytes[7] === 0x00){
				data.Channel = 'Channel1';
			}else if(input.bytes[7] === 0x01){
				data.Channel = 'Channel2';
			}
		}
		else if(data.Device=="R900PD01O1" && input.bytes[0] === getCmdToID("ReadConfigDryContactPointOutReq")){
			if(input.bytes[3] === 0x00){
				data.Channel = 'Channel1';
			}else if(input.bytes[3] === 0x01){
				data.Channel = 'Channel2';
			}
		}
		else if(data.Device=="R900PD01O1" && input.bytes[0] === getCmdToID("TriggerDryContactPointOutReq")){
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
