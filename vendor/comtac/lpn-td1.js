/*
  comtac AG
  LPN TD-1 payload decoder (TTN). 
  www.comtac.ch
  andres.ramirez@comtac.ch
*/

//DEFINES
var PAYLOAD_VERSION   = 0x01; //PL version 1

var DATA_PORT         = 3; //DATA port
var CONFIG_PORT       = 100; //CONFIG port

var TYPE_GPS_DATA     = 0x01; //9 bytes, 4 bytes Latitude, 4 bytes Longitude, 1 byte extra
var TYPE_WIFI_DATA    = 0x02; //8 to 29 bytes -> 1 byte nr WIFI detected, 6 bytes MAC1, 1 byte RSSI1, 6 bytes MACX, 1 byte RSSIX

var ERROR_BAT_VOLTAGE = 255; //255 for ERROR
var ERROR_TEMP        = 127; //127 for ERROR

var POS_STATUS = [0: 'NONE', 1: 'GPS OK', 2: 'GPS NOK', 
                  3: 'WIFI OK', 4: 'WIFI NOK', 5: 'GPS, WIFI OK',
				  6: 'GPS, WIFI NOK'];				   
				  
var PING_TYPE =  [0: 'NORMAL', 1: 'MIDRANGE',  
                  2: 'LONGRANGE', 3: 'EVENT'];					  

//HELPING FUNCTIONS
function bin32dec(bin) {
    var num = bin & 0xFFFFFFFF;
    if (0x80000000 & num)
        num = -(0x0100000000 - num);
    return num;
}

function bin16dec(bin) {
    var num=bin&0xFFFF;
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

function bin8string (bin) {
	var num = bin & 0xFF;
	var str = '';
	str = num.toString(16);
	str = (str.length === 1 ? ('0'+str) : str);
	return str;
}  

//DECODING FUNCTIONS
function DecodeTD1DataPayload(data){
	var obj = {};
	
	if (data[0] == PAYLOAD_VERSION){
        //POS STATUS
        var posStatus = (data[1] >> 5) & 0x07;
		obj.posStatus = POS_STATUS[posStatus];	
		//PING TYPE
		var pingType = (data[1] >> 2) & 0x07;
		obj.pingType = PING_TYPE[pingType];
		//BAT FULL
		var batFull = data[1] & 0x02;
		if (batFull){
		    obj.batFull = "TRUE";
		}
		//CONNECTION TEST
		var connTest = data[1] & 0x01;
		if (connTest){
		    obj.connectionTest = "TRUE";
		}		
		//BATTERY
		if (data[2] == ERROR_BAT_VOLTAGE){
            obj.batVoltage = "ERROR";                
        } else {
            obj.batVoltage = (data[2] * 5 + 3000)/1000;
        }
        //TEMP
        if (bin8dec(data[3]) == ERROR_TEMP){
            obj.temp = "ERROR";
        } else {
		    obj.temp = bin8dec(data[3]);
		}
		//IDs
		for(i=4;i<data.length;i++){
			switch(data[i]){
				case TYPE_GPS_DATA: 
				    //GPS DATA
					var gpsLong = (data[i+1] << 24)|(data[i+2] << 16)|(data[i+3] << 8)|(data[i+4]);
					gpsLong = bin32dec(gpsLong)/1000000;
					var gpsLat = (data[i+5] << 24)|(data[i+6] << 16)|(data[i+7] << 8)|(data[i+8]);
					gpsLat = bin32dec(gpsLat)/1000000;
					var gpsEPE = (data[i+9] >> 4) & 0x0F;
					var gpsSAT = (data[i+9]) & 0x0F;
					obj.gpsLong = gpsLong;
					obj.gpsLat = gpsLat;
					if (gpsEPE < 0x0F){
					    obj.gpsEPE = ((gpsEPE) * 10).toString(10)+"-"+((gpsEPE+1) * 10).toString(10)+" meters";
					} else {
					    obj.gpsEPE = "> 150 meters";
					} 
					obj.gpsSAT = gpsSAT;
					i += 9;
				break;
				
				case TYPE_WIFI_DATA: 
				    //WIFI DATA
				    var nrAPs = (data[i+1]) & 0x0F;
                    switch (nrAPs)
                    {
                        case 4:
                            var MAC1  =  bin8string(data[i+2])+ ':'+bin8string(data[i+3])+':'+bin8string(data[i+4])+':'+bin8string(data[i+5])+':'+bin8string(data[i+6])+':'+bin8string(data[i+7]);
							var RSSI1 = data[i+8] * -1;
							var MAC2  =  bin8string(data[i+9])+ ':'+bin8string(data[i+10])+':'+bin8string(data[i+11])+':'+bin8string(data[i+12])+':'+bin8string(data[i+13])+':'+bin8string(data[i+14]);
							var RSSI2 = data[i+15] * -1;
							var MAC3  =  bin8string(data[i+16])+ ':'+bin8string(data[i+17])+':'+bin8string(data[i+18])+':'+bin8string(data[i+19])+':'+bin8string(data[i+20])+':'+bin8string(data[i+21]);
							var RSSI3 = data[i+22] * -1;
							var MAC4  =  bin8string(data[i+23])+ ':'+bin8string(data[i+24])+':'+bin8string(data[i+25])+':'+bin8string(data[i+26])+':'+bin8string(data[i+27])+':'+bin8string(data[i+28]);
							var RSSI4 = data[i+29] * -1;
                            obj.MAC1 = MAC1;
							obj.RSSI1 = RSSI1;
                            obj.MAC2 = MAC2;
							obj.RSSI2 = RSSI2;
                            obj.MAC3 = MAC3;
							obj.RSSI3 = RSSI3;
                            obj.MAC4 = MAC4;
							obj.RSSI4 = RSSI4;							
                            i+=29;
                        break;
                        case 3:
                            var MAC1  =  bin8string(data[i+2])+ ':'+bin8string(data[i+3])+':'+bin8string(data[i+4])+':'+bin8string(data[i+5])+':'+bin8string(data[i+6])+':'+bin8string(data[i+7]);
							var RSSI1 = data[i+8] * -1;
							var MAC2  =  bin8string(data[i+9])+ ':'+bin8string(data[i+10])+':'+bin8string(data[i+11])+':'+bin8string(data[i+12])+':'+bin8string(data[i+13])+':'+bin8string(data[i+14]);
							var RSSI2 = data[i+15] * -1;
							var MAC3  =  bin8string(data[i+16])+ ':'+bin8string(data[i+17])+':'+bin8string(data[i+18])+':'+bin8string(data[i+19])+':'+bin8string(data[i+20])+':'+bin8string(data[i+21]);
							var RSSI3 = data[i+22] * -1;
                            obj.MAC1 = MAC1;
							obj.RSSI1 = RSSI1;
                            obj.MAC2 = MAC2;
							obj.RSSI2 = RSSI2;
                            obj.MAC3 = MAC3;
							obj.RSSI3 = RSSI3;					
                            i+=22;
                        break;			
                        case 2:
                            var MAC1  =  bin8string(data[i+2])+ ':'+bin8string(data[i+3])+':'+bin8string(data[i+4])+':'+bin8string(data[i+5])+':'+bin8string(data[i+6])+':'+bin8string(data[i+7]);
							var RSSI1 = data[i+8] * -1;
							var MAC2  =  bin8string(data[i+9])+ ':'+bin8string(data[i+10])+':'+bin8string(data[i+11])+':'+bin8string(data[i+12])+':'+bin8string(data[i+13])+':'+bin8string(data[i+14]);
							var RSSI2 = data[i+15] * -1;
                            obj.MAC1 = MAC1;
							obj.RSSI1 = RSSI1;
                            obj.MAC2 = MAC2;
							obj.RSSI2 = RSSI2;				
                            i+=15;
                        break;							
                        case 1:
                            var MAC1  =  bin8string(data[i+2])+ ':'+bin8string(data[i+3])+':'+bin8string(data[i+4])+':'+bin8string(data[i+5])+':'+bin8string(data[i+6])+':'+bin8string(data[i+7]);
							var RSSI1 = data[i+8] * -1;
                            obj.MAC1 = MAC1;
							obj.RSSI1 = RSSI1;			
                            i+=8;
                        break;
				        default: 
				            //somthing is wrong with data
					        i=data.length;
				        break;
			        }
				break;
				
				default: 
				    //somthing is wrong with data
					i=data.length;
				break;
			}
		}
	} else {
	  return {errors: ['invalid payload version']};	
	}
	
	return obj;
}

function DecodeTD1ConfigPayload(data){
	var obj = {};
	
	if (data[0] == PAYLOAD_VERSION){
	    //STATUS
		obj.cfgStatus = "";
        if (data[1] & 0x01){
            obj.cfgStatus +="/CFG INIT";
		} 
        if (data[1] & 0x02){
            obj.cfgStatus +="/CFG GET";
		} 
        if (data[1] & 0x04){
            obj.cfgStatus +="/CFG SET";
		}  		
        //BATTERY
		if (data[2] == ERROR_BAT_VOLTAGE){
            obj.batVoltage = "ERROR";                
        } else {
            obj.batVoltage = (data[2] * 5 + 3000)/1000;
        }
        //TEMP
        if (bin8dec(data[3]) == ERROR_TEMP){
            obj.temp = "ERROR";
        } else {
		    obj.temp = bin8dec(data[3]);
		}
		//APP MAIN
		obj.appMainVers = data[4];
		//APP MINOR
		obj.appMinorVers = data[5];
		//PING INTERVAL
		obj.pingInterval = (data[6]<<8)|(data[7]);
		//LONG RANGE TRIGGER
		obj.longRangeTrigger = data[8];
        //MID RANGE TRIGGER
		obj.midRangeTrigger = data[9];
		//REJOIN TRIGGER
		obj.rejoinTrigger = (data[10]<<8)|(data[11]);		
		//GPS TRIES
		obj.gpsTries = data[12];
		//MIN WIFI DETECTS
		obj.minWIFIDetects = data[13];		
	} else {
	  return {errors: ['invalid payload version']};	
	}
	
	return obj;
}

//MAIN UPLINK DECODER CALL
function decodeUplink(input) {
	if (input.fPort == DATA_PORT){
		return DecodeTD1DataPayload(input.bytes);
	} else if (input.fPort == CONFIG_PORT){
		return DecodeTD1ConfigPayload(input.bytes);
	} else {
		return {errors: ['invalid fport']};
	}	
}