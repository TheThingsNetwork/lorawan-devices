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
var INFO_PORT = 101; //INFO port

var TYPE_TEMP_HUM_EVENT   = 0x03; //temp 2 bytes -327.68°C -->327.67°C & hum 1 byte 0% --> 100%
var TYPE_TEMP_HUM_HISTORY = 0x04; //temp 2 bytes -327.68°C -->327.67°C & hum 1 byte 0% --> 100% (8 times)

var INVALID_HUM = 250;  //250 for INVALID
var INVALID_TEMP = 250; //250 for INVALID

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
function DecodeCM4DataPayload(data){
	var obj = {};
	
	if (data[0] == PAYLOAD_VERSION){
	
		//BATTERY
		obj.batLevel = (data[3])/2;
		
		for(i=4;i<data.length;i++){
			//console.log(data[i]);
			switch(data[i]){
				case TYPE_TEMP_HUM_EVENT: //Temp/Hum event
					var tempNOW = (data[i+1]<<8)|(data[i+2]);
					tempNOW = bin16dec(tempNOW)/100;
					var humNOW = data[i+3];
					if (tempNOW == INVALID_TEMP){
						tempNOW = 'INVALID'
					} 
					if (humNOW == INVALID_HUM){
						humNOW = 'INVALID';
					} 
					obj.tempNOW = [tempNOW];
					obj.humNOW = [humNOW];
					i += 3;
				break;
				
				case TYPE_TEMP_HUM_HISTORY: //Temp/Hum history
					var tempNOW_0 = (data[i+1]<<8)|(data[i+2]);
					tempNOW_0 = bin16dec(tempNOW_0)/100;
					var humNOW_0 = data[i+3];
					if (tempNOW_0 == INVALID_TEMP){
						tempNOW_0 = 'INVALID';
					}
					if (humNOW_0 == INVALID_HUM){
						humNOW_0 = 'INVALID';
					}
					var tempNOW_1 = (data[i+4]<<8)|(data[i+5]);
					tempNOW_1 = bin16dec(tempNOW_1)/100;
					var humNOW_1 = data[i+6];
					if (tempNOW_1 == INVALID_TEMP){
						tempNOW_1 = 'INVALID';
					}
					if (humNOW_1 == INVALID_HUM){
						humNOW_1 = 'INVALID';
					}
					var tempNOW_2 = (data[i+7]<<8)|(data[i+8]);
					tempNOW_2 = bin16dec(tempNOW_2)/100;
					var humNOW_2 = data[i+9];		
					if (tempNOW_2 == INVALID_TEMP){
						tempNOW_2 = 'INVALID';
					}
					if (humNOW_2 == INVALID_HUM){
						humNOW_2 = 'INVALID';
					}			
					var tempNOW_3 = (data[i+10]<<8)|(data[i+11]);
					tempNOW_3 = bin16dec(tempNOW_3)/100;
					var humNOW_3 = data[i+12];		
					if (tempNOW_3 == INVALID_TEMP){
						tempNOW_3 = 'INVALID';
					}
					if (humNOW_3 == INVALID_HUM){
						humNOW_3 = 'INVALID';
					}			
					var tempNOW_4 = (data[i+13]<<8)|(data[i+14]);
					tempNOW_4 = bin16dec(tempNOW_4)/100;
					var humNOW_4 = data[i+15];		
					if (tempNOW_4 == INVALID_TEMP){
						tempNOW_4 = 'INVALID';
					}
					if (humNOW_4 == INVALID_HUM){
						humNOW_4 = 'INVALID';
					}			
					var tempNOW_5 = (data[i+16]<<8)|(data[i+17]);
					tempNOW_5 = bin16dec(tempNOW_5)/100;
					var humNOW_5 = data[i+18];		
					if (tempNOW_5 == INVALID_TEMP){
						tempNOW_5 = 'INVALID';
					}
					if (humNOW_5 == INVALID_HUM){
						humNOW_5 = 'INVALID';
					}			
					var tempNOW_6 = (data[i+19]<<8)|(data[i+20]);
					tempNOW_6 = bin16dec(tempNOW_6)/100;
					var humNOW_6 = data[i+21];		
					if (tempNOW_6 == INVALID_TEMP){
						tempNOW_6 = 'INVALID';
					}
					if (humNOW_6 == INVALID_HUM){
						humNOW_6 = 'INVALID';
					}			
					var tempNOW_7 = (data[i+22]<<8)|(data[i+23]);					
					tempNOW_7 = bin16dec(tempNOW_7)/100;
					var humNOW_7 = data[i+24];			
					if (tempNOW_7 == INVALID_TEMP){
						tempNOW_7 = 'INVALID';
					}
					if (humNOW_7 == INVALID_HUM){
						humNOW_7 = 'INVALID';
					}		
					obj.tempNOW =  [tempNOW_0, tempNOW_1, tempNOW_2, tempNOW_3,
					                tempNOW_4, tempNOW_5, tempNOW_6, tempNOW_7];
					obj.humNOW= [humNOW_0, humNOW_1, humNOW_2, humNOW_3,
					             humNOW_4, humNOW_5, humNOW_6, humNOW_7];
					i += 24;
				break;
				
				default: //somthing is wrong with data
					i=data.length;
				break;
			}
		}
	} else {
		return { errors: ['Invalid payload version'] };
	}
	
	return obj;
}

function DecodeCM4ConfigPayload(data){
	var obj = {};
	
	if (data[0] == PAYLOAD_VERSION){
		//BATTERY
		obj.batLevel = (data[3])/2;
		//MEAS RATE
		obj.measRate = (data[4]<<8)|(data[5]);
		//HISTORY TRIGGER
		obj.historyTrigger = data[6];
		//TEMP OFFSET
		obj.tempOffset = bin16dec((data[7]<<8)|(data[8]))/100;
		//TEMP MAX
		obj.tempMax = bin8dec(data[9]);
		//TEMP MIN
		obj.tempMin = bin8dec(data[10]);	
		//HUM OFFSET
		obj.humOffset = bin8dec(data[11]);
		//HUM MAX
		obj.humMax = data[12];
		//HUM MIN
		obj.humMin = data[13];			
	} else {
		return { errors: ['Invalid payload version'] };
	}
	
	return obj;
}

function DecodeCM4InfoPayload(data){
	var obj = {};
	
	if (data[0] == PAYLOAD_VERSION){	
		//BATTERY
		obj.batLevel = (data[3])/2;
		//APP MAIN VERSION
		obj.appMainVers = data[4];
        //APP MINOR VERSION
		obj.appMinorVers = data[5];
	} else {
		return { errors: ['Invalid payload version'] };
	}
	
	return obj;
}

//MAIN UPLINK DECODER CALL
function decodeUplink(input) {
	if (input.fPort == DATA_PORT){
		var ret = DecodeCM4DataPayload(input.bytes);
		if (ret.errors) {
			return { errors: [ret.errors] };
		}
		return { data: ret };
	} else if (input.fPort == CONFIG_PORT){
	  	var ret = DecodeCM4ConfigPayload(input.bytes);
		if (ret.errors) {
			return { errors: [ret.errors] };
		}
		return { data: ret };
	} else if (input.fPort == INFO_PORT){
	  	var ret = DecodeCM4InfoPayload(input.bytes);
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
	if (input.fPort == CONFIG_PORT) {
		if (input.bytes.length == 10) {
			var measRate_m = (input.bytes[0] << 8) | (input.bytes[1]);
			var historyTrigger_count = input.bytes[2];
			var tempOffset_raw = bin16dec((input.bytes[3] << 8) | (input.bytes[4]));
			var tempMax_raw = bin8dec(input.bytes[5]);
			var tempMin_raw = bin8dec(input.bytes[6]);
			var humOffset_raw = bin8dec(input.bytes[8]);
			var humMax_raw = input.bytes[8];
			var humMin_raw = input.bytes[9];
			if (measRate_m > 50000){
				return { errors: ['Invalid measurement rate value'] };
			}	
			if (historyTrigger_count > 8){
				return { errors: ['Invalid history trigger value'] };
			}
			if ((tempOffset_raw < -5000) || (tempOffset_raw > 5000)) {
				return { errors: ['Invalid temperature offset value'] };
			}
			if (tempMax_raw == 127){
				tempMax_raw = 'OFF';
			} else if ((tempMax_raw < -25) || (tempMax_raw > 80)) {
				return { errors: ['Invalid max temperature threshold value'] };
			}
			if (tempMin_raw == 127){
				tempMin_raw = 'OFF';
			} else if ((tempMin_raw < -25) || (tempMin_raw > 80)) {
				return { errors: ['Invalid min temperature threshold value'] };
			}
			if ((humOffset_raw < -99) || (humOffset_raw > 99)) {
				return { errors: ['Invalid humidity offset value'] };
			}
			if (humMax_raw == 255){
				humMax_raw = 'OFF';
			} else if ((humMax_raw < 1) || (humMax_raw > 99)) {
				return { errors: ['Invalid max humidity threshold value'] };
			}
			if (humMin_raw == 255){
				humMin_raw = 'OFF';
			} else if ((humMin_raw < 1) || (humMin_raw > 99)) {
				return { errors: ['Invalid min humidity threshold value'] };
			}
			return {
				data: {
					fPort: input.fPort,
					measRate: measRate_m,
					historyTrigger: historyTrigger_count,
					tempOffset: tempOffset_raw,
					tempMax: tempMax_raw,
					tempMin: tempMin_raw,
					humOffset: humOffset_raw,
					humMax: humMax_raw,
					humMin: humMin_raw,				
				}
			};
		} else {
			return { errors: ['Invalid payload size'] };
		}
	} else if (input.fPort == INFO_PORT) {
		if (input.bytes.length == 1) {
			if (input.bytes[0]){
				return {
					data: {
						fPort: input.fPort,
						infoGet: true,
					}
				};
			} else {
				return {
					data: {
						fPort: input.fPort,
						infoSet: false,
					}
				};				
			}
		} else {
			return { errors: ['Invalid payload size'] };			
		}		
	} else {
		return { errors: ['Invalid FPort'] };
	}
}

//DOWNLINK ENCODER CALL
function encodeDownlink(input) {
	if (input.data.fPort == CONFIG_PORT) {
		if ((typeof input.data.measRate !== 'undefined') && 
			(typeof input.data.historyTrigger !== 'undefined') &&
			(typeof input.data.tempOffset !== 'undefined') &&
			(typeof input.data.tempMax !== 'undefined') &&
			(typeof input.data.tempMin !== 'undefined') && 
			(typeof input.data.humOffset !== 'undefined') &&
			(typeof input.data.humMax !== 'undefined') &&
			(typeof input.data.humMin !== 'undefined')){
			var tempMax_raw = 127;	
			var tempMin_raw = 127;	
			var humMax_raw = 255;
			var humMin_raw = 255;		

			if ((input.data.measRate < 0) || (input.data.measRate > 50000)) {
				return { errors: ['Invalid ping interval value'] };
			}
			if ((input.data.historyTrigger < 0) || (input.data.historyTrigger > 8)) {
				return { errors: ['Invalid history trigger value'] };
			}
			if ((input.data.tempOffset < -5000) || (input.data.tempOffset > 5000)) {
				return { errors: ['Invalid temperature offset value'] };
			}
			if (input.data.tempMax == 'OFF'){
				tempMax_raw = 127;
			} else if ((input.data.tempMax >= -25) && (input.data.tempMax <= 80)) {
				tempMax_raw = input.data.tempMax;
			} else {
				return { errors: ['Invalid max temperature threshold value'] }; 
			}
			if (input.data.tempMin == 'OFF'){
				tempMin_raw = 127;
			} else if ((input.data.tempMin >= -25) && (input.data.tempMin <= 80)) {
				tempMin_raw = input.data.tempMin;
			} else {
				return { errors: ['Invalid min temperature threshold value'] }; 
			}
			if ((input.data.humOffset < -99) || (input.data.humOffset > 99)) {
				return { errors: ['Invalid humidity offset value'] };
			}
			if (input.data.humMax == 'OFF'){
				humMax_raw = 255;
			} else if ((input.data.humMax >= 1) && (input.data.tempMax <= 99)) {
				humMax_raw = input.data.humMax;
			} else {
				return { errors: ['Invalid max humidity threshold value'] }; 
			}
			if (input.data.humMin == 'OFF'){
				humMin_raw = 255;
			} else if ((input.data.humMin >= 1) && (input.data.tempMin <= 99)) {
				humMin_raw = input.data.humMin;
			} else {
				return { errors: ['Invalid min humidity threshold value'] }; 
			}
			return {
				fPort: CONFIG_PORT,
				bytes: [((input.data.measRate >> 8) & 0xFF), (input.data.measRate & 0xFF), input.data.historyTrigger,
				((input.data.tempOffset >> 8) & 0xFF), (input.data.tempOffset & 0xFF), tempMax_raw, tempMin_raw,
				input.data.humOffset, humMax_raw, humMin_raw],
			};
		} else {
			return { errors: ['Invalid input params defined'] };
		}	
	} else if (input.data.fPort == INFO_PORT) {
		if (typeof input.data.infoSet !== 'undefined'){
			var infoSetByte = 0;
			if (input.data.infoSet){
				infoSetByte = 1;
			}
			return {
				fPort: INFO_PORT,
				bytes: [infoSetByte],
			};
		} else {
			return { errors: ['Invalid input params defined'] };
		}	
	} else {
		return { errors: ['Invalid FPort'] };
	}
}	