function getCmdId(inputcmd){
  var cmdIDs = {
    0x01: "ConfigReportReq",
    0x81: "ConfigReportRsp",
    0x02: "ReadConfigReportReq",
    0x82: "ReadConfigReportRsp",
    0x03: "SetPIREnableReq",
    0x83: "SetPIREnableRsp",
    0x04: "GetPIREnableReq",
    0x84: "GetPIREnableRsp",
    0x05: "SetShockSensorSensitivityReq",
    0x85: "SetShockSensorSensitivityRsp",
    0x06: "GetShockSensorSensitivityReq",
    0x86: "GetShockSensorSensitivityRsp",
    0x07: "SetIRDisableTimeReq",
    0x87: "SetIRDisableTimeRsp",
    0x08: "GetIRDisableTimeReq",
    0x88: "GetIRDisableTimeRsp",
    0x09: "SetAlarmOnTimeReq",
    0x89: "SetAlarmOnTimeRsp",
    0x0A: "GetAlarmOnTimeReq",
    0x8A: "GetAlarmOnTimeRsp",
    0x0B: "SetDryContactPointOutTypeReq",
    0x8B: "SetDryContactPointOutTypeRsp",
    0x0C: "GetDryContactPointOutTypeReq",
    0x8C: "GetDryContactPointOutTypeRsp",
    0x0D: "SetRestoreReportReq",
    0x8D: "SetRestoreReportRsp",
    0x0E: "GetRestoreReportReq",
    0x8E: "GetRestoreReportRsp"
  };
  return cmdIDs[inputcmd];
}

function getDeviceName(dev){
  var deviceName = {
	0xD2: "R315"
  };
  return deviceName[dev];
}

function getDeviceType(devName){
  if (devName == "R315")
	  return 0xD2;
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
		if (input.bytes[2] == 0x01)
		{
			data.FunctionEnable = (input.bytes[4]<<8 | input.bytes[5]).toString(2);
			data.BinarySensorReport = (input.bytes[6]<<8 | input.bytes[7]).toString(2);
			
			if ((input.bytes[5] & 0x01) == 0x00)
			{
				data.Temp = "0xFFFF";
				data.Humi = "0xFF";
			}
			else 
			{
				if (input.bytes[8] & 0x80)
				{
					var tmpval = (input.bytes[8]<<8 | input.bytes[9]);
					data.Temp = (0x10000 - tmpval)/100 * -1;
				}
				else
					data.Temp = (input.bytes[8]<<8 | input.bytes[9])/100;
					
				data.Humi = input.bytes[10]*0.5;
			}
		}
		else if (input.bytes[2] == 0x02){
			data.Illuminance = (input.bytes[4]<<8 | input.bytes[5])+"Lux";
			data.LowTemperatureAlarm = input.bytes[6] & 1;
			data.HighTemperatureAlarm = input.bytes[6]>>1 & 1;
			data.LowHumidityAlarm = input.bytes[6]>>2 & 1;
			data.HighHumidityAlarm = input.bytes[6]>>3 & 1;
			data.LowIlluminanceAlarm = input.bytes[6]>>4 & 1;
			data.HighIlluminanceAlarm = input.bytes[6]>>5 & 1;
		}
		else if(input.bytes[2] == 0x011){
			let FunctionEnable = (input.bytes[5]<<8 |input.bytes[6]);
			data.THSensor = FunctionEnable & 1;
			data.LightSensor = FunctionEnable>>1 & 1;
			data.PIRSensor = FunctionEnable>>2 & 1;
			data.EmergenceButton = FunctionEnable>>3 & 1;
			data.TiltSensor = FunctionEnable>>4 & 1;
			data.InternalContactSwitch = FunctionEnable>>5 & 1;
			data.ExternalContactSwitch1 = FunctionEnable>>6 & 1;
			data.ExternalContactSwitch2 = FunctionEnable>>7 & 1;
			data.InternalShockSensor = FunctionEnable>>8 & 1;
			data.ExternalShockSensor = FunctionEnable>>9 & 1;
			data.ExternalDryContactPointIN = FunctionEnable>>10 & 1;
			data.DryContactPointOut = FunctionEnable>>11 & 1;
			data.ExternalWaterLeakSenor1 = FunctionEnable>>12 & 1;
			data.ExternalWaterLeakSenor2 = FunctionEnable>>13 & 1;
			data.ExternalSeatSensor = FunctionEnable>>14 & 1;
			data.ExternalGlassSensor1 = FunctionEnable>>15 & 1;
			data.ExternalGlassSensor2 = input.bytes[4]& 1;

			let BinarySensorReport = (input.bytes[7]<<8 | input.bytes[8]);
			data.PIRSensorState = BinarySensorReport & 1;
			data.EmergenceButtonaLAlarmState = BinarySensorReport>>1 & 1;
			data.TiltSensorState = BinarySensorReport>>2 & 1;
			data.InternalContactSwitchSensorState = BinarySensorReport>>3 & 1;
			data.ExternalContactSwitch1SensorState = BinarySensorReport>>4 & 1;
			data.ExternalContactSwitch2SensorState = BinarySensorReport>>5 & 1;
			data.InternalShockSensorState = BinarySensorReport>>6 & 1;
			data.ExternalShockSensorState = BinarySensorReport>>7 & 1;
			data.ExternalDryContactPointINState = BinarySensorReport>>8 & 1;
			data.ExternalWaterLeak1SenorState = BinarySensorReport>>9 & 1;
			data.ExternalWaterLeak2SenorState = BinarySensorReport>>10 & 1;
			data.ExternalSeatSenorState = BinarySensorReport>>11 & 1;
			data.ExternalGlassSenor1State = BinarySensorReport>>12 & 1;
			data.ExternalGlassSenor2State = BinarySensorReport>>13 & 1;
		}
		else if(input.bytes[2] == 0x12){
			if (input.bytes[4] & 0x80){
					var tmpval = (input.bytes[4]<<8 | input.bytes[5]);
					data.Temp = (0x10000 - tmpval)/100 * -1;
			}else{
				data.Temp = (input.bytes[4]<<8 | input.bytes[5])/100;
			}
			data.Humidity = (input.bytes[6]<<8 | input.bytes[7])*0.01 +"%";
			data.Illuminance = (input.bytes[8]<<8 | input.bytes[9])+"Lux";
			data.LowTemperatureAlarm = input.bytes[10] & 1;
			data.HighTemperatureAlarm = input.bytes[10]>>1 & 1;
			data.LowHumidityAlarm = input.bytes[10]>>2 & 1;
			data.HighHumidityAlarm = input.bytes[10]>>3 & 1;
			data.LowIlluminanceAlarm = input.bytes[10]>>4 & 1;
			data.HighIlluminanceAlarm = input.bytes[10]>>5 & 1;		
		}	
		break;
		
	case 7:
		data.Device = getDeviceName(input.bytes[1]);
		if (input.bytes[0] & 0x80 && input.bytes[0] & 0x01)
		{
			data.Cmd = getCmdId(input.bytes[0]);
			data.Status = (input.bytes[2] === 0x00) ? 'Success' : 'Failure';
		}
		else if (input.bytes[0] == 0x82)
		{
			data.Cmd = getCmdId(input.bytes[0]);
			data.MinTime = (input.bytes[2]<<8 | input.bytes[3]);
			data.MaxTime = (input.bytes[4]<<8 | input.bytes[5]);
			data.BatteryChange = input.bytes[6]/10;
			data.TempChange = (input.bytes[7]<<8 | input.bytes[8])/100;
			data.HumiChange = input.bytes[9]*0.5;
			data.IllumChange = input.bytes[10];
		}
		else if (input.bytes[0] == 0x84)
		{
			data.Cmd = getCmdId(input.bytes[0]);
			data.PIREnable = input.bytes[2];
		}
		else if (input.bytes[0] == 0x86)
		{
			data.Cmd = getCmdId(input.bytes[0]);
			data.InternalShockSensoerSensitivity = input.bytes[2];
			data.ExternalShockSensoerSensitivity = input.bytes[3];
		}
		else if (input.bytes[0] == 0x88)
		{
			data.Cmd = getCmdId(input.bytes[0]);
			data.IRSDisableTime = (input.bytes[2]<<8 | input.bytes[3]);
			data.IRSDetectionTime = (input.bytes[4]<<8 | input.bytes[5]);
		}
		else if (input.bytes[0] == 0x8A)
		{
			data.Cmd = getCmdId(input.bytes[0]);
			data.AlarmOnTime = (input.bytes[2]<<8 | input.bytes[3]);
		}
		else if (input.bytes[0] == 0x8C)
		{
			data.Cmd = getCmdId(input.bytes[0]);
			data.DryContactPointOutType = input.bytes[2];
		}
		else if (input.bytes[0] == 0x8E)
		{
			data.Cmd = getCmdId(input.bytes[0]);
			data.RestoreReportSet = input.bytes[2];
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
	  var humiChg = input.data.HumiChange * 2;
	  var illumChg = input.data.IllumChange;

	  ret = ret.concat(0x01, devid, (mint >> 8), (mint & 0xFF), (maxt >> 8), (maxt & 0xFF), batteryChg, (tempChg >> 8), (tempChg & 0xFF), humiChg, illumChg);
  }
  else if (input.data.Cmd == getCmdId(0x02))
  {
	  ret = ret.concat(0x02, devid, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
  }  
  else if (input.data.Cmd == getCmdId(0x03))
  {
  	  var pir = input.data.PIREnable;
  	  
	  ret = ret.concat(0x03, devid, pir, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
  }
  else if (input.data.Cmd == getCmdId(0x04))
  {
	  ret = ret.concat(0x04, devid, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
  }
  else if (input.data.Cmd == getCmdId(0x05))
  {
  	  var v1 = input.data.InternalShockSensoerSensitivity;
	  var v2 = input.data.ExternalShockSensoerSensitivity;
	  
	  ret = ret.concat(0x05, devid, v1, v2, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
  }
  else if (input.data.Cmd == getCmdId(0x06))
  {
	  ret = ret.concat(0x06, devid, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
  }
  else if (input.data.Cmd == getCmdId(0x07))
  {
  	  var d1 = input.data.IRSDisableTime;
	  var d2 = input.data.IRSDetectionTime;
	  var t = input.data.SensorType;
  
	  ret = ret.concat(0x07, devid, (d1 >> 8), (d1 & 0xFF), (d2 >> 8), (d2 & 0xFF), t, 0x00, 0x00, 0x00, 0x00);
  }
  else if (input.data.Cmd == getCmdId(0x08))
  {  	  
	  ret = ret.concat(0x08, devid, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
  }
  else if (input.data.Cmd == getCmdId(0x09))
  {
  	  var a = input.data.AlarmOnTime;
  	  
	  ret = ret.concat(0x09, devid, (a >> 8), (a & 0xFF), 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
  }
  else if (input.data.Cmd == getCmdId(0x0A))
  {
	  ret = ret.concat(0x0A, devid, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
  }
  else if (input.data.Cmd == getCmdId(0x0B))
  {
  	  var t = input.data.DryContactPointOutType;
  	  
	  ret = ret.concat(0x0B, devid, t, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
  }
  else if (input.data.Cmd == getCmdId(0x0C))
  {
	  ret = ret.concat(0x0C, devid, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
  }
  else if (input.data.Cmd == getCmdId(0x0D))
  {
  	  var val = input.data.RestoreReportSet;
  	  
	  ret = ret.concat(0x0D, devid, val, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
  }
  else if (input.data.Cmd == getCmdId(0x0E))
  {
	  ret = ret.concat(0x0E, devid, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
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
		
		if ((input.bytes[0] & 0x01) == 0x00)
		{
			data.Cmd = getCmdId(input.bytes[0]);
		}
		else if (input.bytes[0] === 0x01)
		{
			data.Cmd = getCmdId(input.bytes[0]);
			data.MinTime = (input.bytes[2]<<8 | input.bytes[3]);
			data.MaxTime = (input.bytes[4]<<8 | input.bytes[5]);
			data.BatteryChange = input.bytes[6]/10;
			data.TempChange = (input.bytes[7]<<8 | input.bytes[8])/100;
			data.HumiChange = input.bytes[9]*0.5;
			data.IllumChange = input.bytes[10];
		}
		else if (input.bytes[0] === 0x03)
		{
			data.Cmd = getCmdId(input.bytes[0]);
			data.PIREnable = input.bytes[2];
		}
		else if (input.bytes[0] == 0x05)
		{
			data.Cmd = getCmdId(input.bytes[0]);
			data.InternalShockSensoerSensitivity = input.bytes[2];
			data.ExternalShockSensoerSensitivity = input.bytes[3];
		}
		else if (input.bytes[0] == 0x07)
		{
			data.Cmd = getCmdId(input.bytes[0]);
			data.IRSDisableTime = (input.bytes[2]<<8 | input.bytes[3]);
			data.IRSDetectionTime = (input.bytes[4]<<8 | input.bytes[5]);
			data.SensorType = input.bytes[6];
		}
		else if (input.bytes[0] == 0x09)
		{
			data.Cmd = getCmdId(input.bytes[0]);
			data.AlarmOnTime = (input.bytes[2]<<8 | input.bytes[3]);
		}
		else if (input.bytes[0] == 0x0B)
		{
			data.Cmd = getCmdId(input.bytes[0]);
			data.DryContactPointOutType = input.bytes[2];
		}
		else if (input.bytes[0] == 0x0D)
		{
			data.Cmd = getCmdId(input.bytes[0]);
			data.RestoreReportSet = input.bytes[2];
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
