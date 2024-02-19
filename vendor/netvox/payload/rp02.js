function getCfgCmd(cfgcmd){
	var cfgcmdlist = {
	  0x90: "Off",
	  0x91: "On",
	  0x92: "Off(Cant manually On After Off)",
	  0x93: "ClearEnergy",
	  0x94: "ResetToFactory",
	  0x95: "LeakageCurrentSeftTest",
	  0x96: "ClearError/AlarmLog",
	  0x01: "ConfigReportReq",
	  0x81: "ConfigReportRsp",
	  0x02:   "ReadConfigReportReq",
	  0x82: "ReadConfigReportRsp",
	  0x03:   "SetPassThroughModeReq",
	  0x83: "SetPassThroughModeRsq",
	  0x04:   "GetPassThroughModeReq",
	  0x84: "GetPassThroughModeRsq",
	  0x05:   "SetProtectionRep",
	  0x85: "SetProtectionRsp",
	  0x06:   "GetTripCntReq",
	  0x86: "GetTripCntRsq",
	  0x07:   "GetAlarmInfoReq(For 1P)",
	  0x87: "GetAlarmInfoRsq(For 1P)",
	  0x08:   "GetAlarmInfoRep(For 3P)",
	  0x88: "GetAlarmInfoRsp1(For 3P)",
	  0x89: "GetAlarmInfoRsp2(For 3P)",
	  0x8A: "GetAlarmInfoRsp3(For 3P)",
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
	else if (cmdtype == "SetPassThroughModeReq")
		return 0x03;
	else if (cmdtype == "SetPassThroughModeRsq")
		return 0x83;
	else if (cmdtype == "GetPassThroughModeReq")
		return 0x04;
	else if (cmdtype == "GetPassThroughModeRsq")
		return 0x84;
	else if (cmdtype == "SetProtectionRep")
		return 0x05;
	else if (cmdtype == "SetProtectionRsp")
		return 0x85;
	else if (cmdtype == "GetTripCntReq")
		return 0x06;
	else if (cmdtype == "GetTripCntRsq")
		return 0x86;
	else if (cmdtype == "GetAlarmInfoReq(For 1P)")
		return 0x07;
	else if (cmdtype == "GetAlarmInfoRsq(For 1P)")
		return 0x87;
	else if (cmdtype == "GetAlarmInfoRep(For 3P)")
		return 0x08;
	else if (cmdtype == "GetAlarmInfoRsp1(For 3P)")
		return 0x88;
	else if (cmdtype == "GetAlarmInfoRsp2(For 3P)")
		return 0x89;
	else if (cmdtype == "GetAlarmInfoRsp3(For 3P)")
		return 0x8A;
	else if (cmdtype == "Off")
		return 0x90;
	else if (cmdtype == "On")
		return 0x91;
	else if (cmdtype == "Off(Cant manually On After Off)")
		return 0x92;
	else if (cmdtype == "ClearEnergy")
		return 0x93;
	else if (cmdtype == "ResetToFactory")
		return 0x94;
	else if (cmdtype == "LeakageCurrentSeftTest")
		return 0x95;
	else if (cmdtype == "ClearError/AlarmLog")
		return 0x96;
}


function getDeviceName(dev){
	var deviceName = {
	  0x9C: "RP02"
	};
	return deviceName[dev];
}
  
function getDeviceID(devName){
	var deviceName = {
	  "RP02": 0x9C
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
			data.BreakerRS485Addr = input.bytes[3];
			if(input.bytes[2] === 0x01){
				data.BreakerType = input.bytes[4];
				data.BreakerProtectStatusBits_1P = input.bytes[5];
				data.AlarmStatusBits_1P = input.bytes[6];
				data.Pre_TripStatusBits_1P = input.bytes[7];
				data.TripStatusBits_1P = input.bytes[8];
				data.HandOrAutoControlAndSelfTestStatus = input.bytes[9];
			}else if(input.bytes[2] === 0x02){
				data.Current = (input.bytes[4]<<8 | input.bytes[5]);
				data.Voltage = (input.bytes[6]<<8 | input.bytes[7]);
				data.Power = (input.bytes[8]<<8 | input.bytes[9]);
				data.Temperature = input.bytes[10];
			}else if(input.bytes[2] === 0x03){
				data.Energy = (input.bytes[4]<<24 | input.bytes[5]<<16 | input.bytes[6]<<8 |input.bytes[7]);
				data.Frequency = input.bytes[8];
				data.PowerFactor =input.bytes[9];
			}else if(input.bytes[2] === 0x04){
				data.LeakageCurrent = (input.bytes[4]<<8 | input.bytes[5]);
				data.OnOffTotalCount = (input.bytes[6]<<24 | input.bytes[7]<<16 | input.bytes[8]<<8 |input.bytes[9]);
			}else if(input.bytes[2] === 0x11){
				data.BreakerTYpe = input.bytes[4];
				data.BreakerProtectStatusBits = (input.bytes[5]<<8 | input.bytes[6]);
				data.AlarmStatusBits = (input.bytes[7]<<8 | input.bytes[8]);
				data.PreTripStatusBits = (input.bytes[9]<<8 | input.bytes[10]);
			}else if(input.bytes[2] === 0x12){
				data.TripStatusBits = (input.bytes[4]<<8 | input.bytes[5]);
				data.APhaseCurrent = (input.bytes[6]<<8 | input.bytes[7])*10;
				data.BphaseCurrent = (input.bytes[8]<<8 | input.bytes[9])*10;
			}else if(input.bytes[2] === 0x13){
				data.CPhaseCurrent = (input.bytes[4]<<8 | input.bytes[5])*10;
				data.AphaseVoltage = (input.bytes[6]<<8 | input.bytes[7]);
				data.BPhaseVoltage = (input.bytes[8]<<8 | input.bytes[9]);
				data.Temperature = input.bytes[10];
			}else if(input.bytes[2] === 0x014){
				data.CPhaseVoltage = (input.bytes[4]<<8 | input.bytes[5]);
				data.APhasePower = (input.bytes[6]<<8 | input.bytes[7]);
				data.BPhasePower = (input.bytes[8]<<8 | input.bytes[9]);
				data.Frequency = input.bytes[10];
			}else if(input.bytes[2] === 0x15){
				data.CPhasePower = (input.bytes[4]<<8 | input.bytes[5]);
				data.APhaseEnergy = (input.bytes[6]<<24 | input.bytes[7]<<16 |input.bytes[8]<<8 | input.bytes[9]);
			}else if(input.bytes[2] === 0x16){
				data.BPhaseEnergy = (input.bytes[4]<<24 | input.bytes[5]<<16 | input.bytes[6]<<8 | input.bytes[7]);
				data.APhasePowerFactor = input.bytes[8];
				data.CPhasePowerFactor = input.bytes[9];
				data.BPhasePowerFactor = input.bytes[10];
			}else if(input.bytes[2] === 0x17){
				data.CPhaseEnergy = (input.bytes[4]<<24 | input.bytes[5]<<16| input.bytes[6]<<8 | input.bytes[7]);
				data.HandOrAutoControlStatus = input.bytes[8];
				if(input.bytes[9]===0x00){
					data.OnOffStatus = "Off";
				}else if(input.bytes[9]===0x01){
					data.OnOffStatus = "On";
				}else{
					data.OnOffStatus = input.bytes[9];
				}
			}else if(input.bytes[2] === 0x18){
				data.LeakageCurrent = (input.bytes[4]<<8 | input.bytes[5]);
				data.OnOffTotalCount = (input.bytes[6]<<24 | input.bytes[7]<<16 |input.bytes[8]<<8 | input.bytes[9]);
			}
		 	break;
		  
		case 7:
			data.Cmd = getCfgCmd(input.bytes[0]);
			data.Device = getDeviceName(input.bytes[1]);
			if (input.bytes[0] === getCmdToID("ReadConfigReportRsp") )
			{
				data.MinTime = (input.bytes[2]<<8 | input.bytes[3]);
				data.MaxTime = (input.bytes[4]<<8 | input.bytes[5]);
			}
			else if (input.bytes[0] === getCmdToID("ConfigReportRsp") 
			|| input.bytes[0] === getCmdToID("SetPassThroughModeRsq")
			|| input.bytes[0] === getCmdToID("SetProtectionRsp"))
			{
				data.Status = (input.bytes[2] === 0x00) ? 'Success' : 'Failure';
			}else if(input.bytes[0] === getCmdToID("GetPassThroughModeRsq")){
				data.PassThroughModeOn = input.bytes[2];
			}else if(input.bytes[0] === getCmdToID("GetTripCntRsq")){
				data.OverLoadTripCnt = input.bytes[2];
				data.ShortCircuitTripCnt = input.bytes[3];
				data.LeakageCurrentTripCnt = input.bytes[4];
				data.UnderVoltagetTripCnt = input.bytes[5];
				data.OverVoltagetTripCnt = input.bytes[6];
				data.TemperaturetTripCnt = input.bytes[7];
				data.RemoteSelfTesttTripCnt = input.bytes[8];
				data.LeakingPhaseTripCnt = input.bytes[9];
			}else if(input.bytes[0] === getCmdToID("GetAlarmInfoRsq(For 1P)")){
				data.AlarmCurrent = (input.bytes[2]<<8 | input.bytes[3]);
				data.AlarmLeakageCurrent = (input.bytes[4]<<8 | input.bytes[5]);
				data.AlarmVoltage = (input.bytes[6]<<8 | input.bytes[7]);
				data.AlarmTemperature = input.bytes[8];
			}else if(input.bytes[0] === getCmdToID("GetAlarmInfoRsp1(For 3P)")){
				data.AlarmAPhaseCurrent = (input.bytes[2]<<8 | input.bytes[3]);
				data.AlarmBPhaseCurrent = (input.bytes[4]<<8 | input.bytes[5]);
				data.AlarmCPhaseCurrent = (input.bytes[6]<<8 | input.bytes[7]);
				data.AlarmHPhaseCurrent = (input.bytes[8]<<8 | input.bytes[9]);
			}else if(input.bytes[0] === getCmdToID("GetAlarmInfoRsp2(For 3P)")){
				data.AlarmLeakageCurrent = (input.bytes[2]<<8 | input.bytes[3]);
				data.AlarmAPhaseVoltage = (input.bytes[4]<<8 | input.bytes[5]);
				data.AlarmBPhaseVoltage = (input.bytes[6]<<8 | input.bytes[7]);
				data.AlarmCPhaseVoltage = (input.bytes[8]<<8 | input.bytes[9]);
			}else if(input.bytes[0] === getCmdToID("GetAlarmInfoRsp3(For 3P)")){
				data.AlarmTemperature = input.bytes[2];
			}else if(input.bytes[0] === getCmdToID("Off")
			|| input.bytes[0] === getCmdToID("On")
			|| input.bytes[0] === getCmdToID("Off(Cant manually On After Off)")
			|| input.bytes[0] === getCmdToID("ClearEnergy")
			|| input.bytes[0] === getCmdToID("ResetToFactory")
			|| input.bytes[0] === getCmdToID("LeakageCurrentSeftTest")
			|| input.bytes[0] === getCmdToID("ClearError/AlarmLog")){
				data.BreakerRS485Addr = input.bytes[2];
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
	||input.data.Cmd == "GetPassThroughModeReq"
	)
	{
		ret = ret.concat(getCmdID, devid, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
	}else if (input.data.Cmd == "SetPassThroughModeReq"
	||input.data.Cmd == "GetTripCntReq"
	||input.data.Cmd == "GetAlarmInfoReq(For 1P)"
	||input.data.Cmd == "GetAlarmInfoRep(For 3P)")
	{
		var PassThroughModeOn = input.data.PassThroughModeOn;
		ret = ret.concat(getCmdID, devid, PassThroughModeOn, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
	}else if (input.data.Cmd == "SetProtectionRep")
	{
		var BreakerRS485Addr = input.data.BreakerRS485Addr;
		var ProtectionType = input.data.ProtectionType;
		var ProtectionAction = input.data.ProtectionAction;
		ret = ret.concat(getCmdID, devid, BreakerRS485Addr, ProtectionType, ProtectionAction, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
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
			||input.bytes[0] === getCmdToID("GetPassThroughModeReq")
			||input.bytes[0] === getCmdToID("GetTripCntReq")
			||input.bytes[0] === getCmdToID("GetAlarmInfoReq(For 1P)"))
			{
			
			}else if (input.bytes[0] === getCmdToID("SetPassThroughModeReq"))
			{
				data.PassThroughModeOn = input.bytes[2];
			}else if (input.bytes[0] === getCmdToID("SetProtectionRep"))
			{
				data.BreakerRS485Addr = input.bytes[2];
				data.ProtectionType = input.bytes[3];
				data.ProtectionAction = input.bytes[4];
			}else if (input.bytes[0] === getCmdToID("GetAlarmInfoRep(For 3P)"))
			{
				data.BreakerRS485Addr = input.bytes[2];
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
  
