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

	5:   "ConfigDigitalOutPutReq",
    133: "ConfigDigitalOutPutRsp",
	6:   "ReadConfigDigitalOutPutReq",
    134: "ReadConfigDigitalOutPutRsp",
    7:   "TriggerDigitalOutPutReq",
    135: "TriggerDigitalOutPutRsp",
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
  else if (cmdtype == "ConfigDigitalOutPutReq")
	  return 5;
  else if (cmdtype == "ConfigDigitalOutPutRsp")
	  return 133;
  else if (cmdtype == "ReadConfigDigitalOutPutReq")
	  return 6;
  else if (cmdtype == "ReadConfigDigitalOutPutRsp")
	  return 134;
  else if (cmdtype == "TriggerDigitalOutPutReq")
	  return 7;
  else if (cmdtype == "TriggerDigitalOutPutRsp")
	  return 135;
}

function getDeviceName(dev){
  var deviceName = {
	273: "R900A01O1",
  };
  return deviceName[dev];
}

function getDeviceID(devName){
  var deviceName = {
	"R900A01O1": 273,
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

		if (input.bytes[5] & 0x80)
		{
			var tmpval = (input.bytes[5]<<8 | input.bytes[6]);
			data.Temperature = (0x10000 - tmpval)/100 * -1;
		}
		else
			data.Temperature = (input.bytes[5]<<8 | input.bytes[6])/100+'℃';

		data.Humidity = (input.bytes[7]<<8 | input.bytes[8])/100+'%';
				
		data.LowTemperatureAlarm = input.bytes[9] & 1;
		data.HighTemperatureAlarm = input.bytes[9]>>1 & 1;
		data.LowHumidityAlarm = input.bytes[9]>>2 & 1;
		data.HighHumidityAlarm = input.bytes[9]>>3 & 1;

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
		|| input.bytes[0] === getCmdToID("ConfigDigitalOutPutRsp")
		|| input.bytes[0] === getCmdToID("TriggerDigitalOutPutRsp"))
		{
			data.Status = (input.bytes[3] === 0x00) ? 'Success' : 'Failure';
		}
		else if (input.bytes[0] === getCmdToID("ReadConfigReportRsp") )
		{
			data.MinTime = (input.bytes[3]<<8 | input.bytes[4]);
			data.MaxTime = (input.bytes[5]<<8 | input.bytes[6]);
			data.TemperatureChange = (input.bytes[7]<<8 | input.bytes[8])/100+"℃";
			data.HumidityChange = (input.bytes[9]<<8 | input.bytes[10])/100+"%";
		}
		else if (input.bytes[0] === getCmdToID("GetShockSensorSensitivityRsp") )
		{
			data.ShockSensorSensitivity = input.bytes[3];
		}
		else if (input.bytes[0] === getCmdToID("ReadConfigDigitalOutPutRsp") )
		{
			if(input.bytes[3] === 0x00){
				data.DigitalOutPutType = 'NormallyLowLevel';
			}else if(input.bytes[3] === 0x01){
				data.DigitalOutPutType = 'NormallyHighLevel';
			}
			data.OutPulseTime = input.bytes[4]+"s";
			data.LowTemperatureAlarm = input.bytes[5] & 1;
			data.HighTemperatureAlarm = input.bytes[5]>>1 & 1;
			data.LowHumidityAlarm = input.bytes[5]>>2 & 1;
			data.HighHumidityAlarm = input.bytes[5]>>3 & 1;
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
	  var temperatureChange = input.data.TemperatureChange*100;
	  var humidityChange = input.data.HumidityChange*100;

	  ret = ret.concat(getCmdID, (devid>>8), (devid & 0xFF), (mint >> 8), (mint & 0xFF), (maxt >> 8), (maxt & 0xFF), 
	   (temperatureChange >> 8), (temperatureChange & 0xFF),(humidityChange >> 8), (humidityChange & 0xFF));
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
  else if (input.data.Cmd == "ConfigDigitalOutPutReq")
  {
	  var digitalOutPutType;
	  if(input.data.DigitalOutPutType === 'NormallyLowLevel'){
		digitalOutPutType = 0x00;
	  }else if(input.data.DigitalOutPutType === 'NormallyHighLevel'){
		digitalOutPutType = 0x01;
	  }
	  var outPulseTime = input.data.OutPulseTime;

	  var lowTemperatureAlarm = input.data.LowTemperatureAlarm;
	  var highTemperatureAlarm = input.data.HighTemperatureAlarm;
	  var lowHumidityAlarm = input.data.LowHumidityAlarm;
	  var highHumidityAlarm = input.data.HighHumidityAlarm;

	  var bindAiarm = lowTemperatureAlarm | highTemperatureAlarm<<1 | lowHumidityAlarm<<2 | highHumidityAlarm<<3;

	  var channel;
	  if(input.data.Channel === 'Channel1'){
		channel = 0x00;
	  }else if(input.data.Channel === 'Channel2'){
		channel = 0x01;
	  }
	  ret = ret.concat(getCmdID, (devid>>8), (devid & 0xFF),digitalOutPutType,outPulseTime,bindAiarm,channel);
  } 
  else if (input.data.Cmd == "ReadConfigDigitalOutPutReq")
  {
	  var channel;
	  if(input.data.Channel === 'Channel1'){
	    channel = 0x00;
	  }else if(input.data.Channel === 'Channel2'){
	    channel = 0x01;
	  }
	  ret = ret.concat(getCmdID, (devid>>8), (devid & 0xFF),channel);
  }  
  else if (input.data.Cmd == "TriggerDigitalOutPutReq")
  {
	  var outPulseTime = input.data.OutPulseTime;
	  var channel;
	  if(input.data.Channel === 'Channel1'){
	    channel = 0x00;
	  }else if(input.data.Channel === 'Channel2'){
	    channel = 0x01;
	  }
	  ret = ret.concat(getCmdID, (devid>>8), (devid & 0xFF),outPulseTime,channel);
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
			data.TemperatureChange = (input.bytes[7]<<8 | input.bytes[8])/100+"℃";
			data.HumidityChange = (input.bytes[9]<<8 | input.bytes[10])/100+"%";
		
		}
		else if (input.bytes[0] === getCmdToID("SetShockSensorSensitivityReq"))
		{
			data.ShockSensorSensitivity = input.bytes[3];
		}
		else if (input.bytes[0] === getCmdToID("ConfigDigitalOutPutReq"))
		{
			if(input.bytes[3] === 0x00){
				data.DigitalOutPutType = 'NormallyLowLevel';
			}else if(input.bytes[3] === 0x01){
				data.DigitalOutPutType = 'NormallyHighLevel';
			}
			data.OutPulseTime = input.bytes[4]+"s";
			data.LowTemperatureAlarm = input.bytes[5] & 1;
			data.HighTemperatureAlarm = input.bytes[5]>>1 & 1;
			data.LowHumidityAlarm = input.bytes[5]>>2 & 1;
			data.HighHumidityAlarm = input.bytes[5]>>3 & 1;
			if(input.bytes[6] === 0x00){
				data.Channel = 'Channel1';
			}else if(input.bytes[6] === 0x01){
				data.Channel = 'Channel2';
			}
		}
		else if (input.bytes[0] === getCmdToID("ReadConfigDigitalOutPutReq"))
		{
			if(input.bytes[3] === 0x00){
				data.Channel = 'Channel1';
			}else if(input.bytes[3] === 0x01){
				data.Channel = 'Channel2';
			}
		}
		else if (input.bytes[0] === getCmdToID("TriggerDigitalOutPutReq"))
		{
			data.OutPulseTime = input.bytes[3];
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
