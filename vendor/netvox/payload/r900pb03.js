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
	5:   "SetOnDistanceThresholdRreq",
    133: "SetOnDistanceThresholdRrsp",
    6:   "GetOnDistanceThresholdRreq",
    134: "GetOnDistanceThresholdRrsp",
	7:   "SetFillMaxDistanceReq",
    135: "SetFillMaxDistanceRsp",
	8:   "GetFillMaxDistanceReq",
    136: "GetFillMaxDistanceRsp",
    9:   "SetDeadZoneDistanceReq",
    137: "SetDeadZoneDistanceRsp",
	10:  "GetDeadZoneDistanceReq",
    138: "GetDeadZoneDistanceRsp",

	11:  "ConfigDryContactPointOutReq",
    139: "ConfigDryContactPointOutRsp",
	12:  "ReadConfigDryContactPointOutReq",
    140: "ReadConfigDryContactPointOutRsp",
    13:  "TriggerDryContactPointOutReq",
    141: "TriggerDryContactPointOutRsp",
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
  else if (cmdtype == "SetOnDistanceThresholdRreq")
	  return 5;
  else if (cmdtype == "SetOnDistanceThresholdRrsp")
	  return 133;
  else if (cmdtype == "GetOnDistanceThresholdRreq")
	  return 6;
  else if (cmdtype == "GetOnDistanceThresholdRrsp")
	  return 134;
  else if (cmdtype == "SetFillMaxDistanceReq")
	  return 7;
  else if (cmdtype == "SetFillMaxDistanceRsp")
	  return 135;
  else if (cmdtype == "GetFillMaxDistanceReq")
	  return 8;
  else if (cmdtype == "GetFillMaxDistanceRsp")
	  return 136;
  else if (cmdtype == "SetDeadZoneDistanceReq")
	  return 9;
  else if (cmdtype == "SetDeadZoneDistanceRsp")
	  return 137;
 else if (cmdtype == "GetDeadZoneDistanceReq")
	  return 10;
  else if (cmdtype == "GetDeadZoneDistanceRsp")
	  return 138;
  else if (cmdtype == "ConfigDryContactPointOutReq")
	  return 11;
  else if (cmdtype == "ConfigDryContactPointOutRsp")
	  return 139;
  else if (cmdtype == "ReadConfigDryContactPointOutReq")
	  return 12;
  else if (cmdtype == "ReadConfigDryContactPointOutRsp")
	  return 140;
  else if (cmdtype == "TriggerDryContactPointOutReq")
	  return 13;
  else if (cmdtype == "TriggerDryContactPointOutRsp")
	  return 141;
}

function getDeviceName(dev){
  var deviceName = {
	264: "R900PB03",
	272: "R900PB03O1",
  };
  return deviceName[dev];
}

function getDeviceID(devName){
  var deviceName = {
	"R900PB03": 264,
	"R900PB03O1": 272,
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

		if(input.bytes[5] === 0x00){
			data.Status = 'Off';
		}else if(input.bytes[5] === 0x01){
			data.Status = 'On';
		}
		data.Distance = (input.bytes[6]<<8 | input.bytes[7])+"mm";
		data.FillLevel = input.bytes[8]+"%";
		
		data.LowDistanceAlarm = input.bytes[9] & 1;
		data.HighDistanceAlarm = input.bytes[9]>>1 & 1;
		data.LowFillLevelAlarm = input.bytes[9]>>2 & 1;
		data.HighFillLevelAlarm = input.bytes[9]>>3 & 1;
		if(input.bytes[10] === 0x00){
			data.ShockTamperAlarm = 'NoAlarm';
		}else if(input.bytes[10] === 0x01){
			data.ShockTamperAlarm = 'Alarm';
		}

		break;
		
	case 23:
		data.Cmd = getCfgCmd(input.bytes[0]);
		data.Device = getDeviceName((input.bytes[1]<<8 | input.bytes[2]));
		if (input.bytes[0] === getCmdToID("ConfigReportRsp")
		|| input.bytes[0] === getCmdToID("SetShockSensorSensitivityRsp")
		|| input.bytes[0] === getCmdToID("SetOnDistanceThresholdRrsp")
		|| input.bytes[0] === getCmdToID("SetFillMaxDistanceRsp")
		|| input.bytes[0] === getCmdToID("SetDeadZoneDistanceRsp"))
		{
			data.Status = (input.bytes[3] === 0x00) ? 'Success' : 'Failure';
		}
		else if (input.bytes[0] === getCmdToID("ReadConfigReportRsp") )
		{
			data.MinTime = (input.bytes[3]<<8 | input.bytes[4]);
			data.MaxTime = (input.bytes[5]<<8 | input.bytes[6]);
			data.DistanceChange = (input.bytes[7]<<8 | input.bytes[8])+"mm";
			
		}
		else if (input.bytes[0] === getCmdToID("GetShockSensorSensitivityRsp") )
		{
			data.ShockSensorSensitivity = input.bytes[3];
		}
		else if (input.bytes[0] === getCmdToID("GetOnDistanceThresholdRrsp") )
		{
			data.OnDistanceThreshold = (input.bytes[3]<<8 | input.bytes[4])+"mm";
		}
		else if (input.bytes[0] === getCmdToID("GetFillMaxDistanceRsp") )
		{
			data.FillMaxDistance = (input.bytes[3]<<8 | input.bytes[4])+"mm";
		}
		else if (input.bytes[0] === getCmdToID("GetDeadZoneDistanceRsp") )
		{
			data.DeadZoneDistance = (input.bytes[3]<<8 | input.bytes[4])+"mm";
		}


		if(data.Device === "R900PB03O1" && (
			(input.bytes[0] === getCmdToID("ConfigDryContactPointOutRsp"))
		|| (input.bytes[0] === getCmdToID("TriggerDryContactPointOutRsp"))
		)){
			data.Status = (input.bytes[3] === 0x00) ? 'Success' : 'Failure';
		}
		else if(data.Device === "R900PB03O1" && 
		(input.bytes[0] === getCmdToID("ReadConfigDryContactPointOutRsp"))){
			if(input.bytes[3] === 0x00){
				data.DryContactPointOutType = 'NormallyLowLevel';
			}else if(input.bytes[3] === 0x01){
				data.DryContactPointOutType = 'NormallyHighLevel';
			}
			data.OutPluseTime = input.bytes[4]+ 's';

			data.LowDistanceAlarm = input.bytes[5] & 1;
			data.HighDistanceAlarm = input.bytes[5]>>1 & 1;
			data.LowFillLevelAlarm = input.bytes[5]>>2 & 1;
			data.HighFillLevelAlarm = input.bytes[5]>>3 & 1;
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
	  var distance = input.data.DistanceChange;
	 
	  ret = ret.concat(getCmdID, (devid>>8), (devid & 0xFF), (mint >> 8), (mint & 0xFF), (maxt >> 8), (maxt & 0xFF), (distance >> 8), (distance & 0xFF));
  }
  else if (input.data.Cmd == "ReadConfigReportReq" 
  	|| input.data.Cmd == "GetShockSensorSensitivityReq" 
	|| input.data.Cmd == "GetOnDistanceThresholdRreq"
	|| input.data.Cmd == "GetFillMaxDistanceReq"
	|| input.data.Cmd == "GetDeadZoneDistanceReq")
  {
	  ret = ret.concat(getCmdID, (devid>>8), (devid & 0xFF));
  }
  else if (input.data.Cmd == "SetShockSensorSensitivityReq")
  {
	  var sSensor = input.data.ShockSensorSensitivity;
	  ret = ret.concat(getCmdID, (devid>>8), (devid & 0xFF),sSensor);
  }  
  else if (input.data.Cmd == "SetOnDistanceThresholdRreq")
  {
	  var distance = input.data.OnDistanceThreshold;
	  ret = ret.concat(getCmdID, (devid>>8), (devid & 0xFF),(distance>>8), (distance & 0xFF));
  }
  else if (input.data.Cmd == "SetFillMaxDistanceReq")
  {
	  var distance = input.data.FillMaxDistance;
	  ret = ret.concat(getCmdID, (devid>>8), (devid & 0xFF),(distance>>8), (distance & 0xFF));
  }
  else if (input.data.Cmd == "SetDeadZoneDistanceReq")
  {
	  var distance = input.data.DeadZoneDistance;
	  ret = ret.concat(getCmdID, (devid>>8), (devid & 0xFF),(distance>>8), (distance & 0xFF));
  }

  if(devid===272 && input.data.Cmd == "ConfigDryContactPointOutReq"){
	 var dryCont = input.data.DryContactPointOutType;
	 var dryContValue;
	 if(dryCont==="NormallyLowLevel"){
		dryContValue = 0x00;
	  }else if(dryCont==="NormallyHighLevel"){
		dryContValue = 0x01;
	  }
	  var outpluse = input.data.OutPluseTime;
	  var lowdistance = input.data.LowDistanceAlarm;
	  var highdistance = input.data.HighDistanceAlarm;
	  var lowfill = input.data.LowFillLevelAlarm;
	  var highfill = input.data.HighFillLevelAlarm;

	  var bindAS = lowdistance | highdistance<<1 | lowfill<<2 | highfill<<3
	  var channel = input.data.Channel;
	  var channelValue;
	  if(channel==="Channel1"){
		channelValue = 0x00;
	   }else if(channel==="Channel2"){
		channelValue = 0x01;
	   }
	  ret = ret.concat(getCmdID, (devid>>8), (devid & 0xFF),dryContValue,outpluse,bindAS,channelValue);
  }
  if(devid===272 && input.data.Cmd == "ReadConfigDryContactPointOutReq"){
	 var channel = input.data.Channel;
	 var channelValue;
	 if(channel==="Channel1"){
	   channelValue = 0x00;
	  }else if(channel==="Channel2"){
	   channelValue = 0x01;
	  }
	 ret = ret.concat(getCmdID, (devid>>8), (devid & 0xFF),channelValue);
 }
 if(devid===272 && input.data.Cmd == "TriggerDryContactPointOutReq"){
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
			data.DistanceChange = (input.bytes[7]<<8 | input.bytes[8])+"mm";
		}
		else if (input.bytes[0] === getCmdToID("SetShockSensorSensitivityReq"))
		{
			data.ShockSensorSensitivity = input.bytes[3];
		}
		else if(input.bytes[0] === getCmdToID("SetOnDistanceThresholdRreq")){
			data.OnDistanceThreshold = (input.bytes[3]<<8 | input.bytes[4]) +"mm";
		}
		else if(input.bytes[0] === getCmdToID("SetFillMaxDistanceReq")){
			data.FillMaxDistance = (input.bytes[3]<<8 | input.bytes[4]) +"mm";
		}
		else if(input.bytes[0] === getCmdToID("SetDeadZoneDistanceReq")){
			data.DeadZoneDistance = (input.bytes[3]<<8 | input.bytes[4]) +"mm";
		}



		if (data.Device=="R900PB03O1" && input.bytes[0] === getCmdToID("ConfigDryContactPointOutReq"))
		{
			if(input.bytes[3] === 0x00){
				data.DryContactPointOutType = 'NormallyLowLevel';
			}else if(input.bytes[3] === 0x01){
				data.DryContactPointOutType = 'NormallyHighLevel';
			}
			data.OutPluseTime = input.bytes[4]+ 's';
			data.LowDistanceAlarm = input.bytes[5] & 1;
			data.HighDistanceAlarm = input.bytes[5]>>1 & 1;
			data.LowFillLevelAlarm = input.bytes[5]>>2 & 1;
			data.HighFillLevelAlarm = input.bytes[5]>>3 & 1;
			if(input.bytes[6] === 0x00){
				data.Channel = 'Channel1';
			}else if(input.bytes[6] === 0x01){
				data.Channel = 'Channel2';
			}
		}else if(data.Device=="R900PB03O1" && input.bytes[0] === getCmdToID("ReadConfigDryContactPointOutReq")){
			if(input.bytes[3] === 0x00){
				data.Channel = 'Channel1';
			}else if(input.bytes[3] === 0x01){
				data.Channel = 'Channel2';
			}
		}
		else if(data.Device=="R900PB03O1" && input.bytes[0] === getCmdToID("TriggerDryContactPointOutReq")){
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
