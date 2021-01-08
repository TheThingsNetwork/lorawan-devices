/*
  comtac AG
  LPN TD-1 payload decoder (TTN). 
  www.comtac.ch
  andres.ramirez@comtac.ch
*/

//DEFINES
var PAYLOAD_VERSION = 0x01; //PL version 1

var DATA_PORT = 3; //DATA port
var CONFIG_PORT = 100; //CONFIG port
var REJOIN_PORT = 102; //REJOIN port

var TYPE_GPS_DATA = 0x01; //9 bytes, 4 bytes Latitude, 4 bytes Longitude, 1 byte extra
var TYPE_WIFI_DATA = 0x02; //8 to 29 bytes -> 1 byte nr WIFI detected, 6 bytes MAC1, 1 byte RSSI1, 6 bytes MACX, 1 byte RSSIX

var ERROR_BAT_VOLTAGE = 255; //255 for ERROR
var ERROR_TEMP = 127; //127 for ERROR

var POS_STATUS = ['NONE', 'GPS OK', 'GPS NOK',
	'WIFI OK', 'WIFI NOK', 'GPS AND WIFI OK',
	'GPS AND WIFI NOK'];

var PING_TYPE = ['NORMAL', 'MIDRANGE',
	'LONGRANGE', 'EVENT'];

var POS_REQUESTS = ['INVALID', 'GPS ONLY', 'WIFI ONLY',
	'GPS OR WIFI', 'WIFI OR GPS', 'GPS AND WIFI'];

//HELPING FUNCTIONS
function bin32dec(bin) {
	var num = bin & 0xFFFFFFFF;
	if (0x80000000 & num)
		num = -(0x0100000000 - num);
	return num;
}

function bin16dec(bin) {
	var num = bin & 0xFFFF;
	if (0x8000 & num)
		num = - (0x010000 - num);
	return num;
}

function bin8dec(bin) {
	var num = bin & 0xFF;
	if (0x80 & num)
		num = -(0x0100 - num);
	return num;
}

function bin8string(bin) {
	var num = bin & 0xFF;
	var str = '';
	str = num.toString(16);
	str = (str.length === 1 ? ('0' + str) : str);
	return str;
}

//DECODING FUNCTIONS
function DecodeTD1DataPayload(data) {
	var obj = {};

	if (data[0] == PAYLOAD_VERSION) {
		//POS STATUS
		var posStatus = (data[1] >> 5) & 0x07;
		obj.posStatus = POS_STATUS[posStatus];
		//PING TYPE
		var pingType = (data[1] >> 2) & 0x07;
		obj.pingType = PING_TYPE[pingType];
		//BAT FULL
		var batFull = data[1] & 0x02;
		if (batFull) {
			obj.batFull = true;
		}
		//CONNECTION TEST
		var connTest = data[1] & 0x01;
		if (connTest) {
			obj.connectionTest = true;
		}
		//BATTERY
		if (data[2] == ERROR_BAT_VOLTAGE) {
			obj.batVoltage = 'ERROR';
		} else {
			obj.batVoltage = (data[2] * 5 + 3000) / 1000;
		}
		//TEMP
		if (bin8dec(data[3]) == ERROR_TEMP) {
			obj.temp = 'ERROR';
		} else {
			obj.temp = bin8dec(data[3]);
		}
		//IDs
		for (i = 4; i < data.length; i++) {
			switch (data[i]) {
				case TYPE_GPS_DATA:
					//GPS DATA
					var gpsLong = (data[i + 1] << 24) | (data[i + 2] << 16) | (data[i + 3] << 8) | (data[i + 4]);
					gpsLong = bin32dec(gpsLong) / 1000000;
					var gpsLat = (data[i + 5] << 24) | (data[i + 6] << 16) | (data[i + 7] << 8) | (data[i + 8]);
					gpsLat = bin32dec(gpsLat) / 1000000;
					var gpsEPE = (data[i + 9] >> 4) & 0x0F;
					var gpsSAT = (data[i + 9]) & 0x0F;
					obj.gpsLong = gpsLong;
					obj.gpsLat = gpsLat;
					if (gpsEPE < 0x0F) {
						obj.gpsEPE = ((gpsEPE) * 10).toString(10) + '-' + ((gpsEPE + 1) * 10).toString(10) + ' meters';
					} else {
						obj.gpsEPE = '> 150 meters';
					}
					obj.gpsSAT = gpsSAT;
					i += 9;
					break;

				case TYPE_WIFI_DATA:
					//WIFI DATA
					var nrAPs = (data[i + 1]) & 0x0F;
					switch (nrAPs) {
						case 4:
							var MAC1 = bin8string(data[i + 2]) + ':' + bin8string(data[i + 3]) + ':' + bin8string(data[i + 4]) + ':' + bin8string(data[i + 5]) + ':' + bin8string(data[i + 6]) + ':' + bin8string(data[i + 7]);
							var RSSI1 = data[i + 8] * -1;
							var MAC2 = bin8string(data[i + 9]) + ':' + bin8string(data[i + 10]) + ':' + bin8string(data[i + 11]) + ':' + bin8string(data[i + 12]) + ':' + bin8string(data[i + 13]) + ':' + bin8string(data[i + 14]);
							var RSSI2 = data[i + 15] * -1;
							var MAC3 = bin8string(data[i + 16]) + ':' + bin8string(data[i + 17]) + ':' + bin8string(data[i + 18]) + ':' + bin8string(data[i + 19]) + ':' + bin8string(data[i + 20]) + ':' + bin8string(data[i + 21]);
							var RSSI3 = data[i + 22] * -1;
							var MAC4 = bin8string(data[i + 23]) + ':' + bin8string(data[i + 24]) + ':' + bin8string(data[i + 25]) + ':' + bin8string(data[i + 26]) + ':' + bin8string(data[i + 27]) + ':' + bin8string(data[i + 28]);
							var RSSI4 = data[i + 29] * -1;
							obj.MAC1 = MAC1;
							obj.RSSI1 = RSSI1;
							obj.MAC2 = MAC2;
							obj.RSSI2 = RSSI2;
							obj.MAC3 = MAC3;
							obj.RSSI3 = RSSI3;
							obj.MAC4 = MAC4;
							obj.RSSI4 = RSSI4;
							i += 29;
							break;
						case 3:
							var MAC1 = bin8string(data[i + 2]) + ':' + bin8string(data[i + 3]) + ':' + bin8string(data[i + 4]) + ':' + bin8string(data[i + 5]) + ':' + bin8string(data[i + 6]) + ':' + bin8string(data[i + 7]);
							var RSSI1 = data[i + 8] * -1;
							var MAC2 = bin8string(data[i + 9]) + ':' + bin8string(data[i + 10]) + ':' + bin8string(data[i + 11]) + ':' + bin8string(data[i + 12]) + ':' + bin8string(data[i + 13]) + ':' + bin8string(data[i + 14]);
							var RSSI2 = data[i + 15] * -1;
							var MAC3 = bin8string(data[i + 16]) + ':' + bin8string(data[i + 17]) + ':' + bin8string(data[i + 18]) + ':' + bin8string(data[i + 19]) + ':' + bin8string(data[i + 20]) + ':' + bin8string(data[i + 21]);
							var RSSI3 = data[i + 22] * -1;
							obj.MAC1 = MAC1;
							obj.RSSI1 = RSSI1;
							obj.MAC2 = MAC2;
							obj.RSSI2 = RSSI2;
							obj.MAC3 = MAC3;
							obj.RSSI3 = RSSI3;
							i += 22;
							break;
						case 2:
							var MAC1 = bin8string(data[i + 2]) + ':' + bin8string(data[i + 3]) + ':' + bin8string(data[i + 4]) + ':' + bin8string(data[i + 5]) + ':' + bin8string(data[i + 6]) + ':' + bin8string(data[i + 7]);
							var RSSI1 = data[i + 8] * -1;
							var MAC2 = bin8string(data[i + 9]) + ':' + bin8string(data[i + 10]) + ':' + bin8string(data[i + 11]) + ':' + bin8string(data[i + 12]) + ':' + bin8string(data[i + 13]) + ':' + bin8string(data[i + 14]);
							var RSSI2 = data[i + 15] * -1;
							obj.MAC1 = MAC1;
							obj.RSSI1 = RSSI1;
							obj.MAC2 = MAC2;
							obj.RSSI2 = RSSI2;
							i += 15;
							break;
						case 1:
							var MAC1 = bin8string(data[i + 2]) + ':' + bin8string(data[i + 3]) + ':' + bin8string(data[i + 4]) + ':' + bin8string(data[i + 5]) + ':' + bin8string(data[i + 6]) + ':' + bin8string(data[i + 7]);
							var RSSI1 = data[i + 8] * -1;
							obj.MAC1 = MAC1;
							obj.RSSI1 = RSSI1;
							i += 8;
							break;
						default:
							//something is wrong with data, return error
							i = data.length;
							return { errors: ['Received data corrupted'] };
					}
					break;

				default:
					//something is wrong with data, return error
					i = data.length;
					return { errors: ['Received data corrupted'] };
			}
		}
	} else {
		return { errors: ['Invalid payload version'] };
	}

	return obj;
}

function DecodeTD1ConfigPayload(data) {
	var obj = {};

	if (data[0] == PAYLOAD_VERSION) {
		//STATUS
		obj.cfgStatus = '';
		if (data[1] & 0x01) {
			obj.cfgStatus += '/CFG INIT';
		}
		if (data[1] & 0x02) {
			obj.cfgStatus += '/CFG GET';
		}
		if (data[1] & 0x04) {
			obj.cfgStatus += '/CFG SET';
		}
		//BATTERY
		if (data[2] == ERROR_BAT_VOLTAGE) {
			obj.batVoltage = 'ERROR';
		} else {
			obj.batVoltage = (data[2] * 5 + 3000) / 1000;
		}
		//TEMP
		if (bin8dec(data[3]) == ERROR_TEMP) {
			obj.temp = 'ERROR';
		} else {
			obj.temp = bin8dec(data[3]);
		}
		//APP MAIN
		obj.appMainVers = data[4];
		//APP MINOR
		obj.appMinorVers = data[5];
		//PING INTERVAL
		obj.pingInterval = (data[6] << 8) | (data[7]);
		//LONG RANGE TRIGGER
		obj.longRangeTrigger = data[8];
		//MID RANGE TRIGGER
		obj.midRangeTrigger = data[9];
		//REJOIN TRIGGER
		obj.rejoinTrigger = (data[10] << 8) | (data[11]);
		//GPS FIXES
		obj.gpsFixes = data[12];
		//MIN WIFI DETECTS
		obj.minWIFIDetects = data[13];
	} else {
		return { errors: ['Invalid payload version'] };
	}

	return obj;
}

//MAIN UPLINK DECODER CALL
function decodeUplink(input) {
	if (input.fPort == DATA_PORT) {
		var ret = DecodeTD1DataPayload(input.bytes);
		if (ret.errors) {
			return { errors: [ret.errors] };
		}
		return { data: ret };
	} else if (input.fPort == CONFIG_PORT) {
		var ret = DecodeTD1ConfigPayload(input.bytes);
		if (ret.errors) {
			return { errors: [ret.errors] };
		}
		return { data: ret };
	} else {
		return { errors: ['Invalid FPort'] };
	}
}

//DOWNLINK DECODER CALL
function decodeDownlink(input) {
	if (input.fPort == DATA_PORT) {
		if (input.bytes.length == 1) {
			if (POS_REQUESTS[input.bytes[0]] == 'INVALID') {
				return { errors: ['Invalid positioning request value'] };
			} else {
				return {
					data: {
						fPort: input.fPort,
						posRequest: POS_REQUESTS[input.bytes[0]],
					}
				};
			}
		} else {
			return { errors: ['Invalid payload size'] };
		}
	} else if (input.fPort == CONFIG_PORT) {
		if (input.bytes.length == 8) {
			var pingInterval_m = (input.bytes[0] << 8) | (input.bytes[1]);
			var rejoinTrigger_count = (input.bytes[4] << 8) | (input.bytes[5]);
			var gpsFixes_count = input.bytes[6];
			var minWIFIDetects_count = input.bytes[7];
			if ((pingInterval_m < 15) || (pingInterval_m > 50000)) {
				return { errors: ['Invalid ping interval value'] };
			}
			if (rejoinTrigger_count > 50000) {
				return { errors: ['Invalid rejoin trigger value'] };
			}
			if ((gpsFixes_count < 5) || (gpsFixes_count > 20)) {
				return { errors: ['Invalid GPS fixes value'] };
			}
			if ((minWIFIDetects_count < 1) || (minWIFIDetects_count > 4)) {
				return { errors: ['Invalid minimum WIFI detections value'] };
			}
			return {
				data: {
					fPort: input.fPort,
					pingInterval: pingInterval_m,
					longRangeTrigger: input.bytes[2],
					midRangeTrigger: input.bytes[3],
					rejoinTrigger: rejoinTrigger_count,
					gpsFixes: gpsFixes_count,
					minWIFIDetects: minWIFIDetects_count,
				}
			};
		} else if (input.bytes.length == 1) {
			if (input.bytes[0]){
				return {
					data: {
						fPort: input.fPort,
						configGet: true,
					}
				};
			} else {
				return {
					data: {
						fPort: input.fPort,
						configGet: false,
					}
				};				
			}
		} else {
			return { errors: ['Invalid payload size'] };
		}
	} else if (input.fPort == REJOIN_PORT) {
		if (input.bytes.length == 1) {
			if (input.bytes[0]){
				return {
					data: {
						fPort: input.fPort,
						rejoinSet: true,
					}
				};
			} else {
				return {
					data: {
						fPort: input.fPort,
						rejoinSet: false,
					}
				};				
			}
		} else {
			return { errors: ['Invalid payload size'] };			
		}		
	} else {
		return { errors: ['Invalid fport'] };
	}
}

//DOWNLINK ENCODER CALL
function encodeDownlink(input) {
	if (input.fPort == DATA_PORT) {
		var posReqByte = POS_REQUESTS.indexOf(input.data.posRequest);
		if ((posReqByte < 1) || (posRequest > 5)) {
			return { errors: ['Invalid positioning request value'] };
		}
		return {
			fPort: DATA_PORT,
			bytes: [posReqByte],
		};
	} else if (input.fPort == CONFIG_PORT) {
		if (typeof input.data.configGet !== 'undefined'){
			var cfgGetByte = 0;
			if (input.data.configGet){
				cfgGetByte = 1;
			}
			return {
				fPort: CONFIG_PORT,
				bytes: [cfgGetByte],
			};
		} else if ((typeof input.data.pingInterval !== 'undefined') && 
					(typeof input.data.longRangeTrigger !== 'undefined') &&
					(typeof input.data.midRangeTrigger !== 'undefined') &&
					(typeof input.data.rejoinTrigger !== 'undefined') &&
					(typeof input.data.gpsFixes !== 'undefined') && 
					(typeof input.data.minWIFIDetects !== 'undefined')){
			if ((input.data.pingInterval < 15) || (input.data.pingInterval < 15)) {
				return { errors: ['Invalid ping interval value'] };
			}
			if (input.data.longRangeTrigger > 255) {
				return { errors: ['Invalid long range trigger value'] };
			}
			if (input.data.midRangeTrigger > 255) {
				return { errors: ['Invalid mid range trigger value'] };
			}
			if (input.data.rejoinTrigger > 50000) {
				return { errors: ['Invalid rejoin trigger value'] };
			}
			if ((input.data.gpsFixes < 5) || (input.data.gpsFixes > 20)) {
				return { errors: ['Invalid GPS fixes value'] };
			}
			if ((input.data.minWIFIDetects < 1) || (input.data.minWIFIDetects > 4)) {
				return { errors: ['Invalid minimum WIFI detections value'] };
			}
			return {
				fPort: CONFIG_PORT,
				bytes: [((input.data.pingInterval >> 8) & 0xFF), (input.data.pingInterval & 0xFF), input.data.longRangeTrigger,
				input.data.midRangeTrigger, ((input.data.rejoinTrigger >> 8) & 0xFF), (input.data.rejoinTrigger & 0xFF),
				input.data.gpsFixes, input.data.minWIFIDetects],
			};
		} else {
			return { errors: ['Invalid input params defined'] };
		}	
	} else if (input.fPort == REJOIN_PORT) {
		if (typeof input.data.rejoinSet !== 'undefined'){
			var rejoinSetByte = 0;
			if (input.data.rejoinSet){
				rejoinSetByte = 1;
			}
			return {
				fPort: REJOIN_PORT,
				bytes: [rejoinSetByte],
			};
		} else {
			return { errors: ['Invalid input params defined'] };
		}	
	} else {
		return { errors: ['Invalid fport'] };
	}
}	