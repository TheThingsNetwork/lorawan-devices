(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 25:
/***/ ((module) => {

module.exports = Object.freeze({
    ACTIVITY_COUNTER: "ACTIVITY_COUNTER",
    DEVICE_CONFIGURATION: "DEVICE_CONFIGURATION",
    SHOCK_DETECTION: "SHOCK_DETECTION",
    PERIODIC_ACTIVITY: "PERIODIC_ACTIVITY",
    BLE_MAC: "BLE_MAC"
});

/***/ }),

/***/ 32:
/***/ ((module) => {

function AngleDetectionFlags (transition, triggerType, notificationIdentifier){
        this.transition = transition;
        this.triggerType = triggerType;
        this.notificationIdentifier = notificationIdentifier;

}

module.exports = {
  AngleDetectionFlags: AngleDetectionFlags,
  
  Transition:{
			LEARNING_TO_NORMAL: "LEARNING_TO_NORMAL",
			NORMAL_TO_LEARNING: "NORMAL_TO_LEARNING",
			NORMAL_TO_CRITICAL: "NORMAL_TO_CRITICAL",
			CRITICAL_TO_NORMAL: "CRITICAL_TO_NORMAL",
			CRITICAL_TO_LEARNING: "CRITICAL_TO_LEARNING"
		}, 
 TriggerType:
			{
			 CRITICAL_ANGLE_REPORTING: "CRITICAL_ANGLE_REPORTING",
			 ANGLE_DEVIATION_REPORTING: "ANGLE_DEVIATION_REPORTING",
			 SHOCK_TRIGGER: "SHOCK_TRIGGER",
			 RFU: "RFU"
				 
			}
	
}


/***/ }),

/***/ 44:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

let abeewayUplinkPayloadClass = __webpack_require__(760);
let abeewayDownlinkPayloadClass = __webpack_require__(111);
let bssidInfoClass = __webpack_require__(644);
let beaconIdInfoClass = __webpack_require__(420);
let healthStatusClass = __webpack_require__(45);
let measuredTemperatureClass = __webpack_require__(107);
let scanCollectionClass = __webpack_require__(412);
let proximityNotificationClass = __webpack_require__(231);
let proximityDailyReportClass = __webpack_require__(465);
let proximityDailyResponseClass = __webpack_require__(384);
let proximityWhiteListingClass = __webpack_require__(119);
let proximityMessageClass = __webpack_require__(841);
let angleDetectionFlagsClass = __webpack_require__(32);
let angleDetectionClass = __webpack_require__(751);
let geofencingNotificationClass = __webpack_require__(991);
let startupModesClass = __webpack_require__(186);
let smsClass = __webpack_require__(432);
let jsonProfiles = __webpack_require__(185);
let jsonParameters = __webpack_require__(635);
let jsonParametersTable = jsonParametersByIdAndByDriverName()
let jsonParametersById = jsonParametersTable[0]
let jsonParametersByDriverName = jsonParametersTable[1]
const MessageType = __webpack_require__(918);
const MiscDataTag = __webpack_require__(25);
const Mode = __webpack_require__(838);
const DynamicMotionState = __webpack_require__(781);
const BatteryStatus = __webpack_require__(666);
const RawPositionType = __webpack_require__(336);
const TimeoutCause = __webpack_require__(787);
const BleBeaconFailure = __webpack_require__(51);
const DebugCommandTag = __webpack_require__(281);
const ShutdownCause = __webpack_require__(768);
const EventType = __webpack_require__(821);
const DownMessageType = __webpack_require__(678);
const DebugCommandType = __webpack_require__(889);
const OptionalCommand = __webpack_require__(508);
const ResetAction = __webpack_require__(200);
const MelodyId = __webpack_require__(408);
const ErrorCode = __webpack_require__(766);
const AngleDetectionControl = __webpack_require__(698);
const GpsFixStatus = __webpack_require__(552);
const pointExtractions = __webpack_require__(415);

function convertToByteArray(payload){
    var bytes = [];
    var length = payload.length/2;
    for(var i = 0; i < payload.length; i+=2){
        bytes[i/2] = parseInt(payload.substring(i, i+2),16)&0xFF;
    }
    
    return bytes;
}

const removeEmpty = (obj) => {
    Object.keys(obj).forEach(k =>
      (obj[k] && typeof obj[k] === 'object') && removeEmpty(obj[k]) ||
      (!obj[k] && (obj[k] === null || obj[k] === undefined)) && delete obj[k] 
    );
    return obj;
  };

function determineParamIdNames(parameterIds) {
	let paramNames = [];
	for (let parameterId of parameterIds){
	     let paramName = null;
		 if ((jsonParametersById[parameterId].driverParameterName)== "gpsEHPE"){
			 paramName = "GPS_EHPE"
		 }
		 else if ((jsonParametersById[parameterId].driverParameterName)== "mode"){
			 paramName = "GET_MODE"
		 }
		 else if ((jsonParametersById[parameterId].driverParameterName)== "firmwareVersion"){
			 paramName = "FW_VERSION"
		 }
		 else if ((jsonParametersById[parameterId].driverParameterName)== "bleFirmwareVersion"){
			 paramName = "BLE_VERSION"
		 }
		 else {
			 paramName = camelToSnake(jsonParametersById[parameterId].driverParameterName);
		 }
		
		 paramNames.push(convertByteToString(parameterId).toUpperCase() + ":" + paramName);
	
	}
    return paramNames;

}

function camelToSnake(string) {
       return string.replace(/[\w]([A-Z1-9])/g, function(m) {
           return m[0] + "_" + m[1];
       }).toUpperCase();
   }

function determinDownlinkAckToken(payload){
    if (payload.length < 2)
        throw new Error("The payload is not valid to determine Ack Token");
    return payload[1] & 0x0F;
}

function determineMessageType(payload){
    if (payload.length < 1)
        throw new Error("The payload is not valid to determine Message Type");
    var messageType = payload[0];

    switch (messageType){
        case 0:
            return MessageType.FRAME_PENDING;
        case 3:
            return MessageType.POSITION_MESSAGE;
        case 4:
            if ((payload[4] & 0x0F) ==0)
                return MessageType.ENERGY_STATUS;
            if ((payload[4] & 0x0F) ==1)
                return MessageType.HEALTH_STATUS;
        case 5:
            return MessageType.HEARTBEAT;
        case 7:
            var miscDataTag = determineMiscDataTag(payload);
            switch(miscDataTag){
                case MiscDataTag.ACTIVITY_COUNTER:
                    return MessageType.ACTIVITY_STATUS;
                case MiscDataTag.DEVICE_CONFIGURATION:
                    return MessageType.CONFIGURATION;
                case MiscDataTag.SHOCK_DETECTION:
                    return MessageType.SHOCK_DETECTION;
                case MiscDataTag.PERIODIC_ACTIVITY:
                    return MessageType.ACTIVITY_STATUS;
                case MiscDataTag.BLE_MAC:
                    return MessageType.BLE_MAC;
            }
        case 9:
            return MessageType.SHUTDOWN;
        case 10:
            return MessageType.EVENT;
        case 11:
            return MessageType.DATA_SCAN_COLLECTION;
        case 12:
            return MessageType.PROXIMITY_DETECTION;
        case 13:
            return MessageType.SMS;
        case 14:
            return MessageType.EXTENDED_POSITION_MESSAGE;
        case 15:
            return MessageType.DEBUG;
        default:
            return MessageType.UNKNOWN;
    }
}

function determineMiscDataTag(payload){
    if (payload.length < 6)
        throw new Error("The payload is not valid to determine Misc Data Tag");
    var miscDataTag = payload[5] & 0x07;
    switch (miscDataTag){
        case 1:
            return MiscDataTag.ACTIVITY_COUNTER;
        case 2:
            return MiscDataTag.DEVICE_CONFIGURATION;
        case 3:
            return MiscDataTag.SHOCK_DETECTION;
        case 4:
            return MiscDataTag.PERIODIC_ACTIVITY;
        case 5:
            return MiscDataTag.BLE_MAC;
        default:
            throw new Error("The Misc Data Tag is unknown");
    }
}

function determineTrackingMode(payload){
    if (payload.length < 2)
        throw new Error("The payload is not valid to determine Tracking mode");
    var trackingMode = (payload[1] >> 5) & 0x07;
    switch (trackingMode){
        case 0:
            return Mode.STAND_BY;
        case 1:
            return Mode.MOTION_TRACKING;
        case 2:
            return Mode.PERMANENT_TRACKING;
        case 3:
            return Mode.MOTION_START_END_TRACKING;
        case 4:
            return Mode.ACTIVITY_TRACKING;
        case 5:
            return Mode.OFF;
        default:
            throw new Error("The Mode is unknown");
    }
}

function determineUserAction(payload){
    if (payload.length < 2)
        throw new Error("The payload is not valid to determine User Action");
    return (payload[1] >> 4) & 0x01;
}

function determineAppState(payload){
    if (payload.length < 2)
        throw new Error("The payload is not valid to determine App State");
    return (payload[1] >> 3) & 0x01;
}

function determineMoving(payload){
    if (payload.length < 2)
        throw new Error("The payload is not valid to determine Moving");
    var moving = (payload[1] >> 2) & 0x01;
    switch (moving){
        case 0:
            return DynamicMotionState.STATIC;
        case 1:
            return DynamicMotionState.MOVING;
        default:
            throw new Error("The Dynamic Motion State is unknown");
    }
}

function determineBatteryLevel(payload){
    if (payload.length < 3)
        throw new Error("The payload is not valid to determine Battery Level");
    var value = payload[2];
    if (value == 0 || value == 255)
        return null;
    return value;
}

function determineBatteryStatus(payload){
    if (payload.length < 3)
        throw new Error("The payload is not valid to determine Battery Status");
    var value = payload[2];
    if (value == 0)
        return BatteryStatus.CHARGING;
    else if (value == 255)
        return BatteryStatus.UNKNOWN;
    else 
        return BatteryStatus.OPERATING;
}

function determineBatteryVoltage(payload){
    if (payload.length < 3)
        throw new Error("The payload is not valid to determine Battery Voltage");
    if (payload[2] == 0) {
        return 0;
    }
    var decodedValue = decodeCondensed(payload[2], 2.8, 4.2, 8, 2);
    return Math.round(decodedValue *100) /100;
}

function determineTemperature(payload){
    if (payload.length < 4)
        throw new Error("The payload is not valid to determine Temperature");
    var decodedValue = decodeCondensed(payload[3], -44, 85, 8, 0);
    return Math.round(decodedValue *10) /10;

}

function determinePeriodicPosition(payload){
    if (payload.length < 2)
        throw new Error("The payload is not valid to determine Periodic Position");
    return ((payload[1] >> 1) & 0x01) == 1;
}

function determineOnDemandPosition(payload){
    if (payload.length < 2)
        throw new Error("The payload is not valid to determine On Demand Position");
    return (payload[1] & 0x01) == 1;
}

function determineAckToken(payload, messageType){
	if (messageType==MessageType.SMS)
	{
	    if (payload.length < 2)
	        throw new Error("The payload is not valid to determine Ack Token");
	    return (payload[1] >> 4) & 0x0F;
	}
    if (payload.length < 5)
        throw new Error("The payload is not valid to determine Ack Token");
    return (payload[4] >> 4) & 0x0F;
}

function determineRawPositionType(payload){
    if (payload.length < 5)
        throw new Error("The payload is not valid to determine Raw Position Type");
    var rawPositionType = payload[4] & 0x0F;
    switch (rawPositionType){
        case 0:
            return RawPositionType.GPS;
        case 1:
            return RawPositionType.GPS_TIMEOUT;
        case 2:
            return RawPositionType.ENCRYPTED_WIFI_BSSIDS;
        case 3:
            return RawPositionType.WIFI_TIMEOUT;
        case 4:
            return RawPositionType.WIFI_FAILURE;
        case 5:
            return RawPositionType.XGPS_DATA;
        case 6:
            return RawPositionType.XGPS_DATA_WITH_GPS_SW_TIME;
        case 7:
            return RawPositionType.BLE_BEACON_SCAN;
        case 8:
            return RawPositionType.BLE_BEACON_FAILURE;
        case 9:
            return RawPositionType.WIFI_BSSIDS_WITH_NO_CYPHER;
        case 10:
            return RawPositionType.BLE_BEACON_SCAN_SHORT_ID;
        case 11:
            return RawPositionType.BLE_BEACON_SCAN_LONG_ID;
        default:
            return RawPositionType.UNKNOWN;
    }
}

function determineAge(payload){
    if (payload.length < 6)
        throw new Error("The payload is not valid to determine age");
    return decodeCondensed(payload[5], 0, 2040, 8, 0);
}

function determineExtendedAge(payload){
    if (payload.length < 7)
        throw new Error("The payload is not valid to determine age");
    return ((payload[5]<<8)+payload[6]);
}

function determineGpsFixStatus(payload){
    if (payload.length < 8)
        throw new Error("The payload is not valid to determine GPS fix status");
    
    switch (payload[7] & 0x1){
	    case 0:
	        return GpsFixStatus.FIX_2D;
	    case 1:
	        return GpsFixStatus.FIX_3D
    }
}

function detemindGpsPayloadType(payload){
    if (payload.length < 8)
        throw new Error("The payload is not valid to determine GPS payload type");
    return payload[7] >>1 & 0x1;
}

function determineGpsPrevious(payload){
	if (payload.length < 26)
		throw new Error("The payload is not valid to determine previous gps");
	let gpsPrevious = {}
	gpsPrevious["age"] = decodeCondensed(payload[23], 0, 2040, 8, 0);
    const previousFix = (payload[24] << 8) + payload[25]
    switch (previousFix >> 15){
	    case 0:
	    	gpsPrevious["dynamicMotionState"] =  DynamicMotionState.STATIC;
	    	break;
	    case 1:
	    	gpsPrevious["dynamicMotionState"] = DynamicMotionState.MOVING;
	    	break
	    default:
	        throw new Error("The dynamic motion state of the previous fix is unknown");
    }
    const previousN= (previousFix >> 12) & 0x7
    const previousLatitudeDelta = (previousFix >> 6) & 0x3F
    const previousLongitudeDelta = previousFix & 0x3F
    gpsPrevious["latitude"] = (parseInt(convertBytesToString(payload.slice(8,12)),16) - (decodeCondensed(previousLatitudeDelta, -32, 31, 6, 0) * (1 << previousN)));
    if (gpsPrevious["latitude"] > 0x7FFFFFFF) {
    	gpsPrevious["latitude"] -= 0x100000000;
    }
    gpsPrevious["latitude"] = gpsPrevious["latitude"] / Math.pow(10, 7);
    gpsPrevious["longitude"] = (parseInt(convertBytesToString(payload.slice(12,16)),16) - (decodeCondensed(previousLongitudeDelta, -32, 31, 6, 0) * (1 << previousN)));
    if (gpsPrevious["longitude"] > 0x7FFFFFFF) {
    	gpsPrevious["longitude"] -= 0x100000000;
    }
    gpsPrevious["longitude"] = gpsPrevious["longitude"] / Math.pow(10, 7);
    return gpsPrevious;
}

function determineLatitude(payload, messageType){
	let lengthCheck;
	let shift;
	var payloadLength = payload.length 
	switch (messageType){
		case MessageType.EXTENDED_POSITION_MESSAGE:
			lengthCheck = 12
			shift =""
			payload = payload.slice(8,12)
			break;
		case MessageType.POSITION_MESSAGE:
			lengthCheck = 9
			shift ="00"
			payload = payload.slice(6,9)
			break;
	}	
    if (payloadLength < lengthCheck)
        throw new Error("The payload is not valid to determine GPS latitude");
    let value = convertBytesToString(payload)+ shift;
    var codedLatitude = parseInt(value,16);
    if (codedLatitude > 0x7FFFFFFF) {
        codedLatitude -= 0x100000000;
    }
    return (codedLatitude / Math.pow(10, 7));
}

function determineLongitude(payload, messageType){
	let lengthCheck;
	let shift;
	var payloadLength = payload.length 
	switch (messageType){
		case MessageType.EXTENDED_POSITION_MESSAGE:
			lengthCheck = 16
			shift =""
			payload = payload.slice(12,16)
			break;
		case MessageType.POSITION_MESSAGE:
			lengthCheck = 12
			shift ="00"
			payload = payload.slice(9,12)
			break;
	}	
	if (payloadLength < lengthCheck)
		throw new Error("The payload is not valid to determine GPS longitude");
	let value = convertBytesToString(payload) + shift;
    var codedLongitude = parseInt(value,16);
    
    if (codedLongitude > 0x7FFFFFFF) {
        codedLongitude -= 0x100000000;
    }
    return (codedLongitude / Math.pow(10, 7));
}

function determineAltitude(payload, payloadType){
    if (payload.length < 18)
        throw new Error("The payload is not valid to determine GPS altitude");
    let rawValue = (payload[16]<<8)+payload[17];
    if(rawValue >= 32768) rawValue -= 65536;
    if (payloadType == 0){
        //the value is encoded in centimeter
        return rawValue / 100
    }
    else if (payloadType == 1){
        //the value is encoded in meter
        return rawValue;
    }
}

function determineCourseOverGround(payload){
    if (payload.length < 21)
        throw new Error("The payload is not valid to determine GPS course over ground");
    // expressed in 1/100 degree
    return ((payload[19]<<8)+payload[20]);
}

function determineSpeedOverGround(payload){
    if (payload.length < 23)
        throw new Error("The payload is not valid to determine GPS speed over ground");
    // expressed in cm/s
    return ((payload[21]<<8)+payload[22]);
}

function determineHorizontalAccuracy(payload, payloadType, messageType){
    let lengthCheck;
    let value;
    switch (messageType){
		case MessageType.EXTENDED_POSITION_MESSAGE:
			lengthCheck = 19
			value = payload[18]
			break;
		case MessageType.POSITION_MESSAGE:
			lengthCheck = 13
			value = payload[12]
			break;
        
    }
    if (payload.length < lengthCheck)
        throw new Error("The payload is not valid to determine horizontal accuracy");
    if (payloadType == 0){
        return Math.round(decodeCondensed(value, 0, 1000, 8, 0) * 100) / 100;
    }
    else if (payloadType == 1){
        let convertedValue = value
        if (value > 250){
            switch (value){
                case 251:
                    convertedValue = "(250,500]"
                    break
                case 252:
                    convertedValue = "(500,1000]"
                    break
                case 253:
                    convertedValue = "(1000,2000]"
                    break;
                case 254:
                    convertedValue = "(2000,4000]"
                    break;
                case 255:
                    convertedValue = "(4000,)"
                    break;
            }
        }
       
        return convertedValue;
    }	
    
}

function determineTimeoutCause(payload, messageType){
	let lengthCheck;
	let timeoutCause;
	switch (messageType){
		case MessageType.EXTENDED_POSITION_MESSAGE:
			lengthCheck = 8
			timeoutCause = payload[7]
			break;
		case MessageType.POSITION_MESSAGE:
			lengthCheck = 6
			timeoutCause = payload[5]
			break;
	}
	if (payload.length < lengthCheck)
        throw new Error("The payload is not valid to determine timeout cause");
    switch (timeoutCause){
	    case 0:
	        return TimeoutCause.USER_TIMEOUT;
	    case 1:
	        return TimeoutCause.T0_TIMEOUT;
	    case 2:
	    	return TimeoutCause.T1_TIMEOUT;
	    default:
	    	throw new Error("The timeout cause is unknown");
    }
}

function determineBestSatellitesCOverN(payload, messageType){
    var bestSatellitesCOverN = [];
    let lengthCheck;
    var payloadLength = payload.length;
    switch (messageType){
		case MessageType.EXTENDED_POSITION_MESSAGE:
			lengthCheck = 12
			payload = payload.slice(8,12)
			break;
		case MessageType.POSITION_MESSAGE:
			lengthCheck = 10
			payload = payload.slice(6,10)
			break;
    }
    if (payloadLength < lengthCheck)
        throw new Error("The payload is not valid to determine Best Satellites C/N");
    bestSatellitesCOverN.push(Math.round(decodeCondensed(payload[0], 0, 50, 8, 0)));
    bestSatellitesCOverN.push(Math.round(decodeCondensed(payload[1], 0, 50, 8, 0)));
    bestSatellitesCOverN.push(Math.round(decodeCondensed(payload[2], 0, 50, 8, 0)));
    bestSatellitesCOverN.push(Math.round(decodeCondensed(payload[3], 0, 50, 8, 0)));
    return bestSatellitesCOverN;
}

function determineBatteryVoltageMeasures(payload, messageType){
    var payloadLength = payload.length;
    let lengthCheck;
    switch (messageType){
		case MessageType.EXTENDED_POSITION_MESSAGE:
			lengthCheck = 13
			payload = payload.slice(7)
			break;
		case MessageType.POSITION_MESSAGE:
			lengthCheck = 11
			payload = payload.slice(5)
			break;
    }
    if (payloadLength < lengthCheck){
    	 throw new Error("The payload is not valid to determine battery voltage measures");
    }
    var measures = [];
    for(var i = 0; i < 6; i++){
        let decodedValue = decodeCondensed(payload[i], 2.8, 4.2, 8, 2);
        measures.push(Math.floor(decodedValue*100)/100);
    }
    return measures;
}

function determineErrorCode(payload, messageType){ 
    var payloadLength = payload.length;
    let lengthCheck;
    switch (messageType){
		case MessageType.EXTENDED_POSITION_MESSAGE:
			lengthCheck = 14
			payload = payload[13]
			break;
		case MessageType.POSITION_MESSAGE:
			lengthCheck = 12
			payload = payload[11]
			break;
    }
    if (payloadLength < lengthCheck){
   	 throw new Error("The payload is not valid to determine error code");
   }
    return payload;
}

function determineBSSIDS(payload, messageType){
    var i = 0;
    var bssids = [];
    let lengthCheck;
    let indexStart;
    switch (messageType){
		case MessageType.EXTENDED_POSITION_MESSAGE:
			lengthCheck = 14
			indexStart = 7
			break;
		case MessageType.POSITION_MESSAGE:
			lengthCheck = 13
			indexStart = 6 
			break;
    }
    while (payload.length >= lengthCheck + 7*i){
        let key = convertByteToString(payload[indexStart + i*7]) + ":" 
                    + convertByteToString(payload[(indexStart+1)+i*7]) + ":"
                    + convertByteToString(payload[(indexStart+2)+i*7]) + ":"
                    + convertByteToString(payload[(indexStart+3)+i*7]) + ":"
                    + convertByteToString(payload[(indexStart+4)+i*7]) + ":"
                    + convertByteToString(payload[(indexStart+5)+i*7]);
        let value = payload[indexStart+6+i*7];
        if (value > 127){
            value -= 256;
        }
        bssids.push(new bssidInfoClass.BssidInfo(key, value));
        i++;
    }
    return bssids;
}

function determineShortBeaconIDs(payload, messageType){
    var i = 0;
    var ids = [];
    let lengthCheck;
    let indexStart;
    switch (messageType){
		case MessageType.EXTENDED_POSITION_MESSAGE:
			lengthCheck = 14
			indexStart = 7
			break;
		case MessageType.POSITION_MESSAGE:
			lengthCheck = 13
			indexStart = 6 
			break;
    }
    while (payload.length >= lengthCheck + 7*i){
        let key = convertByteToString(payload[indexStart + i*7]) + "-" 
                    + convertByteToString(payload[(indexStart+1) + i*7]) + "-"
                    + convertByteToString(payload[(indexStart+2) + i*7]) + "-"
                    + convertByteToString(payload[(indexStart+3) + i*7]) + "-"
                    + convertByteToString(payload[(indexStart+4) + i*7]) + "-"
                    + convertByteToString(payload[(indexStart+5) + i*7]);
        let value = payload[indexStart + 6 + i*7];
        if (value > 127){
            value -= 256;
        }
        //let BeaconIdInfo = beaconIdInfoClass.BeaconIdInfo;
        ids.push(new beaconIdInfoClass.BeaconIdInfo(key, value));
        i++;
    }
    return ids;
}

function determineLongBeaconIDs(payload, messageType){
    var i = 0;
    var ids = [];
    let lengthCheck;
    let indexStart;
    switch (messageType){
		case MessageType.EXTENDED_POSITION_MESSAGE:
			lengthCheck = 24
			indexStart = 7
			break;
		case MessageType.POSITION_MESSAGE:
			lengthCheck = 23
			indexStart = 6 
			break;
    }
    while (payload.length >= lengthCheck + 7*i){
        let key = convertByteToString(payload[indexStart + i*7]) + "-" 
                    + convertByteToString(payload[(indexStart+1) + i*7]) + "-"
                    + convertByteToString(payload[(indexStart+2) + i*7]) + "-"
                    + convertByteToString(payload[(indexStart+3) + i*7]) + "-"
                    + convertByteToString(payload[(indexStart+4) + i*7]) + "-"
                    + convertByteToString(payload[(indexStart+5) + i*7])+ "-" 
                    + convertByteToString(payload[(indexStart+6) + i*7]) + "-"
                    + convertByteToString(payload[(indexStart+7) + i*7]) + "-"
                    + convertByteToString(payload[(indexStart+8) + i*7]) + "-"
                    + convertByteToString(payload[(indexStart+9) + i*7]) + "-" 
                    + convertByteToString(payload[(indexStart+10) + i*7]) + "-"
                    + convertByteToString(payload[(indexStart+11) + i*7]) + "-"
                    + convertByteToString(payload[(indexStart+12) + i*7]) + "-"
                    + convertByteToString(payload[(indexStart+13) + i*7]) + "-" 
                    + convertByteToString(payload[(indexStart+14) + i*7]) + "-"
                    + convertByteToString(payload[(indexStart+15) +i*7]);
        let value = payload[indexStart + 16 + i*7];
        if (value > 127){
            value -= 256;
        }
        ids.push(new beaconIdInfoClass.BeaconIdInfo(key, value));
        i++;
    }
    return ids;
}

function determineBleBeaconFailure(payload, messageType){
    let lengthCheck;
    let index;
    switch (messageType){
		case MessageType.EXTENDED_POSITION_MESSAGE:
			lengthCheck = 8
			index = 7
			break;
		case MessageType.POSITION_MESSAGE:
			lengthCheck = 6
			index = 5 
			break;
	}
    if (payload.length < lengthCheck)
        throw new Error("The payload is not valid to determine Ble Beacon Failure");
    let bleBeaconFailure = payload[index];
    switch (bleBeaconFailure){
        case 0:
            return BleBeaconFailure.BLE_NOT_RESPONDING;
        case 1:
            return BleBeaconFailure.INTERNAL_ERROR;
        case 2:
            return BleBeaconFailure.SHARED_ANTENNA_NOT_AVAILABLE;
        case 3:
            return BleBeaconFailure.SCAN_ALREADY_ON_GOING;
        case 4:
            return BleBeaconFailure.NO_BEACON_DETECTED;
        case 5:
            return BleBeaconFailure.HARDWARE_INCOMPATIBILITY;
        //only for backward compatibility before AT2.3
        case 6: 
            return BleBeaconFailure.HARDWARE_INCOMPATIBILITY;
        //only for backward compatibility before AT2.3
        case 7:
            return BleBeaconFailure.UNKNOWN_BLE_FIRMWARE_VERSION;
        default:
            throw new Error("The Ble Beacon Failure is unknown");
    }
}

function determineResetCause(payload){
    if (payload.length < 6)
        throw new Error("The payload is not valid to determine Reset Cause");
    return payload[5];
}

function determineHeartBeatFirmwareVersion(payload){
    if (payload.length < 9)
        throw new Error("The payload is not valid to determine HeartBeat Firmware Version");
    return payload[6].toString()+"."+payload[7].toString()+"."+payload[8].toString();
}

function determineHeartBeatBleFirmwareVersion(payload){
    if (payload.length < 12)
        throw new Error("The payload is not valid to determine HeartBeat BLE Firmware Version");
    return payload[9].toString()+"."+payload[10].toString()+"."+payload[11].toString();
}

function determineBleMac(payload){
    if (payload.length < 12)
        throw new Error("The payload is not valid to determine BLE MAC");
    return convertByteToString(payload[6]) + ":"
        + convertByteToString(payload[7]) + ":"
        + convertByteToString(payload[8]) + ":"
        + convertByteToString(payload[9]) + ":"
        + convertByteToString(payload[10]) + ":"
        + convertByteToString(payload[11]);
}

function determineGpsOnRuntime(payload){
    if (payload.length < 9)
        throw new Error("The payload is not valid to determine GPS On Runtime");
    return parseInt(convertBytesToString(payload.slice(5,9)),16);
}

function determineGpsStandby(payload){
    if (payload.length < 13)
        throw new Error("The payload is not valid to determine GPS Standby Runtime");
    return parseInt(convertBytesToString(payload.slice(9,13)),16);
}

function determineWifiScanCount(payload){
    if (payload.length < 17)
        throw new Error("The payload is not valid to determine Wifi Scan Count");
    return parseInt(convertBytesToString(payload.slice(13,17)),16);
}

function determinHealthStatus(payload){
    if (payload.length < 19)
        throw new Error("The payload is not valid to determine Health Status");
    let healthStatus = new healthStatusClass.HealthStatus();
    healthStatus.totalConsumption = (payload[5]<<8)+payload[6];
    healthStatus.maxTemperature = Math.round(decodeCondensed(payload[7], -44, 85, 8, 0)*10)/10;
    healthStatus.minTemperature = Math.round(decodeCondensed(payload[8], -44, 85, 8, 0)*10)/10;
    healthStatus.loraPowerConsumption = (payload[9]<<8)+payload[10];
    healthStatus.blePowerConsumption = (payload[11]<<8)+payload[12];
    healthStatus.gpsPowerConsumption = (payload[13]<<8)+payload[14];
    healthStatus.wifiPowerConsumption = (payload[15]<<8)+payload[16];
    healthStatus.batteryVoltage = (payload[17]<<8)+payload[18];
    return healthStatus;
}

function determineActivityCounter(payload){
    if (payload.length < 10)
        throw new Error("The payload is not valid to determine activity counter");
    return parseInt(convertBytesToString(payload.slice(6,10)),16);
}

function determinePeriodicActivity(payload){
    if (payload.length < 18)
        throw new Error("The payload is not valid to determine periodic activity");
    let activities = [];
    for (var i=0; i<6; i++){
        activities.push((payload[6+i*2]<<8)+payload[7+i*2]);
    }
    return activities;
}

function determineActivityCounterPeriodicReport(payload){
    if (payload.length < 22)
        throw new Error("The payload is not valid to determine activity counter in periodic report");
    return parseInt(convertBytesToString(payload.slice(18,22)),16);
}

function determineNbShocks(payload){
    if (payload.length < 7)
        throw new Error("The payload is not valid to determine Nb of shocks");
    return payload[6];
}

function determineAccelerometerShockData(payload){
    let x = determineAxis(payload, 7);
    let y = determineAxis(payload, 9);
    let z = determineAxis(payload, 11);
    return [x,y,z];
}

function determineAxis(payload, byteNumber){
    if (payload.length < (byteNumber + 2)){
        throw new Error("The payload is not valid to determine axis value");
    }
    let value = (payload[byteNumber]<<8)+payload[byteNumber+1];
    value = convertNegativeInt16(value)
    return value
}

function determineDeviceConfiguration(payload){
    let j=0;
    let parameters = {}
    if ((payload.length - 6) % 5 !=0 )
        throw new Error ("The payload is not valid to determine configuration parameters");
    let parametersId = []
    let parametersValue= []
    while (payload.length >= 11+5*j){ 
    	parametersId.push(payload[6+5*j]);
    	parametersValue.push(parseInt(convertBytesToString(payload.slice(7+5*j, 11+5*j)),16));
    	j++;
    }
    determineConfigurations(parameters, parametersId, parametersValue, true, payload)
   
    return parameters;
}

function jsonParametersByIdAndByDriverName() {
	let jsonParametersById = {}
	let jsonParametersByDriverName = {}
	let k=0;
	while ((k< jsonParameters.length))
	{ 

	 for (let parameter = 0; parameter <(jsonParameters[k].firmwareParameters.length); parameter++)
	 {
		 jsonParametersById[(jsonParameters[k].firmwareParameters[parameter].id)] = (jsonParameters[k].firmwareParameters[parameter])
		 jsonParametersByDriverName[(jsonParameters[k].firmwareParameters[parameter].driverParameterName)] = (jsonParameters[k].firmwareParameters[parameter])
	 }
	 k++;
	}
	return [jsonParametersById,jsonParametersByDriverName]
}

function hasNegativeNumber(additionalValues) {
	if (additionalValues == undefined) 
        return false;
	for (let el of additionalValues){
        if (typeof(el)=="number"){
            if (el < 0)
			    return true;
        }
        else if (typeof(el)=="object"){
            if (el.minimum < 0)
                return true;
        }
	}
	return false;
}

function determineConfigurations (parameters, parameterIds, parameterValues, readOnly, payload) {
	for (let id = 0; id < parameterIds.length; id++) 
	{
		let paramValue = parameterValues[id]
		let parameter = (jsonParametersById[parameterIds[id]])
		if (parameter === undefined)
			throw new Error(parameterIds[id]+ " unknown parameter id");
		let paramName = parameter.driverParameterName 
		if (parameter.id == 246){
			if (paramValue == 0)
			{
				parameters[paramName] = "Unknown"
			}
			else
			{
				let result = getNameAndParametersProfileFromJsonByProfileId(jsonProfiles, paramValue)	
				const parametersProfile = result[1]
				const name = result[0]
				
				if ((readOnly) && (paramValue!=0))
				{
						
					for(let parameter of Object.entries(parametersProfile)){
		        		parameters[parameter[0]]= parameter[1]; 
					}
				}
				parameters[paramName]= name
			}
	    } 
		else
			{
				if (((parameter.readOnly != undefined) && (parameter.readOnly) && readOnly) || (parameter.readOnly == undefined) || ((parameter.readOnly != undefined) && (!(parameter.readOnly)))) 
				{  
					
			   		let paramType = parameter.parameterType.type
			   		switch (paramType)
			   		{
			   		case "ParameterTypeNumber":
			   			let range = parameter.parameterType.range
			   			let multiply = parameter.parameterType.multiply
			   			let additionalValues = parameter.parameterType.additionalValues
                        let additionalRanges = parameter.parameterType.additionalRanges
			   			// check negative number
			   			if ((range.minimum < 0 ) || hasNegativeNumber(additionalValues) || hasNegativeNumber(additionalRanges)){
			   				if (paramValue > 0x7FFFFFFF) {
				                paramValue -= 0x100000000;
				            }
			   			}
			   			
			   			if (checkParamValueRange(paramValue, range.minimum, range.maximum, range.exclusiveMinimum, range.exclusiveMaximum, additionalValues, additionalRanges)){
			   				if (multiply != undefined){
			   					paramValue = paramValue * multiply
			   				}
			   				 
			   			}
			   			else {
			   				throw new Error(paramName+ " parameter value "+paramValue+" is out of range");
			   			}
			   			
			   			if (parameter.id == 19)
			   				{ 
			   				
			   				if  (parameters["confirmedUplink"] == undefined)
			   					{
			   					let confirmedUlRetry ={}
			   					confirmedUlRetry[paramName] = paramValue
			   					parameters["confirmedUplink"] = confirmedUlRetry
			   					}
			   				else 
			   					{
			   					let confirmedUplink = parameters["confirmedUplink"]
			   					
			   					confirmedUplink[paramName] =paramValue
			   					parameters["confirmedUplink"] = confirmedUplink
			   					}
			   				}
			   				
			   			else {
			   				parameters[paramName]= paramValue 
			   			}
			   			if (parameter.id == 253 || parameter.id == 254)
			   				{
			   				parameters[paramName] = ((paramValue>>16) & 0xFF).toString() + "."
		                    + ((paramValue>>8) & 0xFF).toString() + "."
		                    + (paramValue & 0xFF).toString(); 
			   				}
			   			break;
			   		case "ParameterTypeString":
			   			if ((parameter.parameterType.firmwareValues).indexOf(paramValue) != -1){
			   				parameters[paramName] = (parameter.parameterType.possibleValues[((parameter.parameterType.firmwareValues).indexOf(paramValue))])
                        }
			   			else {
			   				throw new Error(paramName+ " parameter value is unknown");
			   			}
			   			
			   			break;
			   		case "ParameterTypeBitMap":
			   			let properties = parameter.parameterType.properties
					    let bitMap = parameter.parameterType.bitMap
					    let length = parseInt(1,16)
					    let parameterValue ={}
					    for (let property  of properties) {
					    	let propertyName = property.name
					    	let propertyType = property.type
							let bit = bitMap.find(el => el.valueFor === propertyName)
							switch (propertyType)
							{
							case "PropertyBoolean":
								if ((bit.length)!= undefined ) {
                                    length = lengthToHex(bit.length)
                                }
								var b =  Boolean((paramValue >>bit.bitShift & length ))
								if ((bit.inverted != undefined) && (bit.inverted)){
									b =!b;
								 }
								parameterValue[property.name] = b
								break;
							case "PropertyString":
								if ((bit.length)!= undefined ) {
                                    length = lengthToHex(bit.length)
                                }
								let value = (paramValue >>bit.bitShift & length)
			   				 	let possibleValues = property.possibleValues
                                if (property.firmwareValues.indexOf(value) != -1){
                                    parameterValue[property.name] = possibleValues[(property.firmwareValues.indexOf(value))]
                                }
                                else {
                                    throw new Error(property.name+ " parameter value is not among possible values");
                                }
			   				 	break;
                            case "PropertyNumber":
                                if ((bit.length)!= undefined ) {
                                    length = lengthToHex(bit.length)
                                }
                                parameterValue[property.name] = paramValue >>bit.bitShift & length ;	
                                break;
							case "PropertyObject":{
								let bitValue ={}
								for (let value of bit.values)
									{
									if (value.type == "BitMapValue")
										{	
                                            let length = parseInt(1,16)
											if ((value.length)!= undefined ) {length = (lengthToHex(value.length))}
										  	var b = Boolean(paramValue >>value.bitShift & length)
										  	if ((value.inverted != undefined) && (value.inverted)){
										  		b =!b;
										  	}
										  	bitValue[value.valueFor] = b
									    }
									}
								parameterValue[property.name] = bitValue
                            }break;
							default:
					            throw new Error("Property type is unknown");
								
							}
							}
				    	if (parameter.id == 18)
							{
							parameterValue[paramName] = paramValue
							if (parameters["confirmedUplink"] == undefined)
								{
								parameters["confirmedUplink"] = parameterValue
								}
							else 
								{
								parameters["confirmedUplink"] = Object.assign({}, parameterValue, parameters["confirmedUplink"]);
								}
							
							}
				    	else 
				    		{ parameters[paramName] = parameterValue}
			   			break;
			   		default:
			            throw new Error("Parameter type is unknown");
			   		}
		   		
				}
				else{
					  throw new Error("Parameter is read only, not allowed to be set");
				}
			}
   	}
}

function checkParamValueRange (givenValue, minimum, maximum, exclusiveMinimum, exclusiveMaximum, additionalValues, additionalRanges) {
	if (additionalValues != undefined)
	{
		if (additionalValues.includes(givenValue))
			return true;
	}
    if (additionalRanges != undefined && additionalRanges.length >0)
    {
        for (let additionalRange of additionalRanges)
        {
			if (givenValue>= additionalRange.minimum && givenValue <= additionalRange.maximum)
    			return true;
    	}
    }
	if (((exclusiveMinimum!=undefined && exclusiveMinimum == true && givenValue > minimum) ||
		givenValue>=minimum) &&
		((exclusiveMaximum!=undefined && exclusiveMaximum == true && givenValue < maximum) ||
		givenValue <=maximum))
	    return true;
    return false;
}

function lengthToHex(length){  
    let hex =0;
	for (let i  =0; i<length; i++)
	{
		hex = hex + Math.pow(2,i)
	}
	//return parseInt(hex,16)
    return hex
}

function getNameAndParametersProfileFromJsonByProfileId(jsonProfiles,profileId){
	let p = 0
	let parameters = []
	while (p< jsonProfiles.length)
		{
		  for (let profile = 0; profile <(jsonProfiles[p].profiles.length); profile++)
		 {
	         if ((jsonProfiles[p].profiles[profile].id)==profileId){
	            parameters = jsonProfiles[p].profiles[profile].parameters
	            const name = jsonProfiles[p].profiles[profile].name
	            return [name,parameters];
	         }
	      }
		p ++;
		}
	if ((parameters.length) == 0)
				throw new Error("Dynamic profile value is unknown");

}

function getProfileIdByName(jsonProfiles,name){
	let p = 0
	let profileId = null
    //Support of UPPERCASE
    if (name.toUpperCase()!=name){
        name = camelToSnake(name)
    }
    
	if (name == "UNKNOWN")
		return 0;
	while (p< jsonProfiles.length)
	{
		for (let profile = 0; profile <(jsonProfiles[p].profiles.length); profile++)
		{
	        if (camelToSnake(jsonProfiles[p].profiles[profile].name)== name){
	            profileId = jsonProfiles[p].profiles[profile].id
	            return profileId;
	        }
	      }
		p ++;
	}
	
	if (profileId == null)
				throw new Error("Dynamic profile value is unknown");

}

function determineDebugCommandTag(payload){
    if (payload.length<5){
        throw new Error("The payload is not valid to determine Debug Command Tag");
    }
    let debugcommandtag = payload[4] & 0x0F;
    switch (debugcommandtag){
        case 0:
            return DebugCommandTag.DEBUG_CRASH_INFORMATION;
        case 1:
            return DebugCommandTag.TX_POWER_INDEX_VALUE;
        case 2:
            return DebugCommandTag.UPLINK_LENGTH_ERR;
        case 3:
            return DebugCommandTag.GENERIC_ERROR;
        case 4:
        	return DebugCommandTag.SPECIFIC_FIRMWARE_PARAMETERS;
        default:
            throw new Error("The Debug Command Tag is unknown");
    }
}

function determineDebugErrorCode(payload){
    if (payload.length<6){
        throw new Error("The payload is not valid to determine Debug Error Code");
    }
    return payload[5];
}

function determineDebugCrashInfo(payload){
    if (payload.length<6){
        throw new Error("The payload is not valid to determine Debug Error Info");
    }
    let crashInfo = "";
    for (var i=6; i<payload.length; i++){
        crashInfo += String.fromCharCode(payload[i]);
    }
    return crashInfo;
}

function determineTxIndexPower(payload){
    if (payload.length<6){
        throw new Error("The payload is not valid to determine TxIndex Power");
    }
    return payload[5];
}

function determineUlLengthErrCounter(payload){
    if (payload.length<7){
        throw new Error("The payload is not valid to determine Ul Length Error counter");
    }
    return (payload[5]<<8)+payload[6];
}

function determineGenericErrorCode(payload){
    if (payload.length<6){
        throw new Error("The payload is not valid to determine generic error code");
    }
    switch (payload[5]){
    case 0:
        return ErrorCode.INVALID_GEOLOC_SENSOR;
    case 1:
        return ErrorCode.INVALID_GEOLOC_CONFIG;
    default:
        return payload[5];
    }
}

function hex32(val) {
    val &= 0xFFFFFFFF;
    var hex = val.toString(16).toUpperCase();
    return ("00000000" + hex).slice(-8);
}

function determineSpecificFirmwareParameters(payload){
    if (payload.length<17){
       throw new Error("The payload is not valid to determine specific firmware parameters");
    }
    let specificFwParam0 = hex32(((payload[5] << 24) + (payload[6] << 16) + (payload[7] << 8) + payload[8]));
    let specificFwParam1 = hex32(((payload[9] << 24) + (payload[10] << 16) + (payload[11] << 8) + payload[12]));
    let specificFwParam2 = hex32(((payload[13] << 24) + (payload[14] << 16) + (payload[15] << 8) + payload[16]));
    return [specificFwParam0, specificFwParam1, specificFwParam2];
}

function determineShutDownCause(payload){
    if (payload.length<6){
        throw new Error("The payload is not valid to determine ShutDown Cause");
    }
    switch (payload[5]){
        case 0:
            return ShutdownCause.USER_ACTION;
        case 1:
            return ShutdownCause.LOW_BATTERY;
        case 2:
            return ShutdownCause.DOWNLINK_REQUEST;
        case 3:
            return ShutdownCause.BLE_REQUEST;
        case 4:
            return ShutdownCause.BLE_CONNECTED;
        default:
            throw new Error("The ShutDown Cause is unknown");
    }
}

function determineCurrentAckTokenValue(payload){
    if (payload.length<2){
        throw new Error("The payload is not valid to determine Ack Token value");
    }
    return payload[1];
}

function determineEventType(payload){
    if (payload.length<6){
        throw new Error("The payload is not valid to determine event type");
    }
    switch (payload[5]){
        case 0:
            return EventType.GEOLOC_START;
        case 1:
            return EventType.MOTION_START;
        case 2:
            return EventType.MOTION_END;
        case 3:
            return EventType.BLE_CONNECTED;
        case 4:
            return EventType.BLE_DISCONNECTED;
        case 5:
            return EventType.TEMPERATURE_ALERT;
        case 6:
            return EventType.BLE_BOND_DELETED;
        case 7:
            return EventType.SOS_MODE_START;
        case 8:
            return EventType.SOS_MODE_END;
        case 9:
        	return EventType.ANGLE_DETECTION;
        case 10:
        	return EventType.GEOFENCING;
        default:
            throw new Error("The event type is unknown");
    }
}

function determineTrackerOrientation(payload){
    if (payload.length<12){
        throw new Error("The payload is not valid to determine Tracker Orientation");
    }
    let x = determineAxis(payload, 6);
    let y = determineAxis(payload, 8);
    let z = determineAxis(payload, 10);
    return [x,y,z];
}

function determineVectorDetection(payload , xbyteNumber, ybyteNumber, zbyteNumber){
    let x = determineAxis(payload, xbyteNumber);
    let y = determineAxis(payload, ybyteNumber);
    let z = determineAxis(payload, zbyteNumber);
    return [x,y,z];
}

function determineMeasuredTemperature(payload){
    if (payload.length<13){
        throw new Error("The payload is not valid to determine measured temperature");
    }
    let measuredTemp = new measuredTemperatureClass.MeasuredTemperature();
    switch (payload[6]){
        case 0:
            measuredTemp.state = measuredTemperatureClass.TemperatureState.NORMAL;
            break;
        case 1:
            measuredTemp.state = measuredTemperatureClass.TemperatureState.HIGH;
            break;
        case 2:
            measuredTemp.state = measuredTemperatureClass.TemperatureState.LOW;
            break;
        case 3:
            measuredTemp.state = measuredTemperatureClass.TemperatureState.FEATURE_NOT_ACTIVATED;
        default:
            throw new Error("The Temperature state is unknown");
    }
    measuredTemp.max = Math.round(decodeCondensed(payload[7],-44, 85, 8, 0)*10)/10;
    measuredTemp.min = Math.round(decodeCondensed(payload[8],-44, 85, 8, 0)*10)/10;
    measuredTemp.highCounter = (payload[9]<<8)+payload[10];
    measuredTemp.lowCounter = (payload[11]<<8)+payload[12];
    return measuredTemp;
}

function determineDataScanCollection(payload){
    if (payload.length<8){
        throw new Error("The payload is not valid to determine scan collection");
    }
    let dataScanCollection = new scanCollectionClass.ScanCollection();
    switch (payload[4] & 0x0F){
        case 0:
            dataScanCollection.scanType = scanCollectionClass.ScanType.BLE_BEACONS;
            break;
        case 1: 
            dataScanCollection.scanType = scanCollectionClass.ScanType.WIFI_BSSID;
            break;
        case 2:
        	dataScanCollection.scanType = scanCollectionClass.ScanType.BLE_BEACONS_COLLECTION;
        	break;
        default:
            throw new Error("ScanType is unknown");
    }
    let again = (payload[5]>>7) & 0x01;
    dataScanCollection.again = (again == 1);
    switch ((payload[5]>>6) & 0x01){
        case 0:
            dataScanCollection.dataFormat = scanCollectionClass.DataFormat.BEACON_ID;
            break;
        case 1:
            dataScanCollection.dataFormat = scanCollectionClass.DataFormat.MAC_ADDRESS;
            break;
        default:
            throw new Error("DataFormat is unknown");
    }
    dataScanCollection.fragmentIdentification = (payload[5] & 0x1F);
    dataScanCollection.collectionIdentifier = payload[6];
    dataScanCollection.hash = payload[7];
    switch(dataScanCollection.dataFormat){
        case scanCollectionClass.DataFormat.BEACON_ID:
            if ((payload.length - 8)%4 != 0){
                throw new Error("The payload is not valid to determine 4-byte scan result");
            }
            let i = 0;
            let bleBeacons = [];
            while (payload.length >= 12+4*i){
            	let key = null;
            	if (dataScanCollection.scanType == scanCollectionClass.ScanType.BLE_BEACONS_COLLECTION){
            		key = convertBytesToString(payload.slice(9+4*i,12+4*i));
            	}
            	else {
                    key = convertBytesToString(payload.slice(10+4*i,12+4*i));

            	}
                let value = payload[8+4*i];
                if (value > 127) {
                    value -= 256;
                }
                bleBeacons.push(new beaconIdInfoClass.BeaconIdInfo(key,value));
                i++;
            }
            dataScanCollection.beaconIdData = bleBeacons;
            break;
            
        case scanCollectionClass.DataFormat.MAC_ADDRESS:
            if ((payload.length - 8)%7 != 0){
                throw new Error("The payload is not valid to determine 7-byte scan result");
            }
            let j = 0;
            let bssids = [];
            while (payload.length >= 15+7*j){
                let key = convertByteToString(payload[9+7*j])+":"
                        + convertByteToString(payload[10+7*j])+":"
                        + convertByteToString(payload[11+7*j])+":"
                        + convertByteToString(payload[12+7*j])+":"
                        + convertByteToString(payload[13+7*j])+":"
                        + convertByteToString(payload[14+7*j]);
                let value = payload[8+7*j];
                if (value > 127) {
                    value -= 256;
                }
                bssids.push(new bssidInfoClass.BssidInfo(key,value));
                j++;
            }
            dataScanCollection.macAddressData = bssids;
            break;
    }
    return dataScanCollection;
}

function determineProximityDailyReport(payload){
    if (payload.length<42){
        throw new Error("The payload is not valid to determine proximity daily report");
    }
    let proximityDailyReport = new proximityDailyReportClass.ProximityDailyReport();
    proximityDailyReport.dailyAlertDay0 = parseInt(convertBytesToString(payload.slice(6,10)),16);
    proximityDailyReport.dailyWarningDay0 = parseInt(convertBytesToString(payload.slice(10,14)),16);
    proximityDailyReport.dailyExposureDay0 = parseInt(convertBytesToString(payload.slice(14,18)),16);
    proximityDailyReport.dailyAlertDay1 = parseInt(convertBytesToString(payload.slice(18,22)),16);
    proximityDailyReport.dailyWarningDay1 = parseInt(convertBytesToString(payload.slice(22,26)),16);
    proximityDailyReport.dailyExposureDay1 = parseInt(convertBytesToString(payload.slice(26,30)),16);
    proximityDailyReport.dailyAlertDay2 = parseInt(convertBytesToString(payload.slice(30,34)),16);
    proximityDailyReport.dailyWarningDay2 = parseInt(convertBytesToString(payload.slice(34,38)),16);
    proximityDailyReport.dailyExposureDay2 = parseInt(convertBytesToString(payload.slice(38,42)),16);
    return proximityDailyReport;
}

function determineProximityDailyResponse(payload){
    if (payload.length<19){
        throw new Error("The payload is not valid to determine proximity daily response");
    }
    let proximityDailyResponse = new proximityDailyResponseClass.ProximityDailyResponse();
    proximityDailyResponse.dayIdentifier = payload[6];
    proximityDailyResponse.dailyAlert = parseInt(convertBytesToString(payload.slice(7,11)),16);
    proximityDailyResponse.dailyWarning = parseInt(convertBytesToString(payload.slice(11,15)),16);
    proximityDailyResponse.dailyExposure = parseInt(convertBytesToString(payload.slice(15,19)),16);
    return proximityDailyResponse;
}

function determineProximityNotification(payload, notificationType){
    if (payload.length<38){
        throw new Error("The payload is not valid to determine proximity notification");
    }
    let ProximityNotification = proximityNotificationClass.ProximityNotification;
    let proximityNotification = new ProximityNotification();
    proximityNotification.notificationType = notificationType;
    proximityNotification.encrypted = (((payload[5]>>7) & 0x01) !=0);
    switch ((payload[5]>>5) & 0x03){
        case 0:
            proximityNotification.recordAction = proximityNotificationClass.RecordAction.RECORD_START;
            break;
        case 1:
            proximityNotification.recordAction = proximityNotificationClass.RecordAction.RECORD_UPDATE;
            break;
        case 2:
            proximityNotification.recordAction = proximityNotificationClass.RecordAction.RECORD_STOP;
            break;
        default:
            throw new Error("The proximity notification record action is unknown");
    }
    proximityNotification.rollingProximityIdentifier = convertBytesToString(payload.slice(6,22));
    proximityNotification.closestDistanceRecording = ((payload[22]<<8)+payload[23])/10;
    proximityNotification.distanceAverageRecorded = ((payload[24]<<8)+payload[25])/10;
    proximityNotification.cumulatedExposure = ((payload[26]<<8)+payload[27]);
    proximityNotification.metadata = convertBytesToString(payload.slice(28,32));
    proximityNotification.cumulatedContactDuration = ((payload[5]>>3) & 0x03) * PROXIMITY_CCD_ROLLOVER_VALUE + (payload[32]<<8) + payload[33];
    proximityNotification.currentDailyExposure = parseInt(convertBytesToString(payload.slice(34,38)),16);
    return proximityNotification;
}

function determineProximityWhiteListing(payload, solicited){
    if (payload.length<23){
        throw new Error("The payload is not valid to determine proximity white listing");
    }
    let proximityWhiteListing = new proximityWhiteListingClass.ProximityWhiteListing();
    proximityWhiteListing.solicited = solicited;
    proximityWhiteListing.encrypted = (((payload[5]>>7) & 0x01) !=0);
    proximityWhiteListing.rollingProximityIdentifier = convertBytesToString(payload.slice(6,22));
    switch (payload[22] & 0x07){
        case 0:
            proximityWhiteListing.list = proximityWhiteListingClass.List.PEER_LIST;
            break;
        case 1:
            proximityWhiteListing.list = proximityWhiteListingClass.List.WARNING_LIST;
            break;
        case 2:
            proximityWhiteListing.list = proximityWhiteListingClass.List.ALERT_LIST;
            break;
        default:
            throw new Error("The payload is not valid to determine proximity white listing list");
    }
    switch ((payload[22]>>3) & 0x01){
        case 0:
            proximityWhiteListing.recordStatus = proximityWhiteListingClass.RecordStatus.NOT_WHITE_LISTED;
            break;
        case 1:
            proximityWhiteListing.recordStatus = proximityWhiteListingClass.RecordStatus.WHITE_LISTED;
            break;
    }
    return proximityWhiteListing;
}

function determineDownlinkMessageType(payload){
    if (payload.length<2){
        throw new Error("The payload is not valid to determine downlink message type");
    }
    switch (payload[0]){
        case 1:
            return DownMessageType.POS_ON_DEMAND;
        case 2:
            return DownMessageType.SET_MODE;
        case 3:
            return DownMessageType.REQUEST_CONFIG;
        case 4: 
            return DownMessageType.START_SOS;
        case 5:
            return DownMessageType.STOP_SOS;
        case 6:
            return DownMessageType.REQUEST_TEMPERATURE_STATUS;
        case 7:
            return DownMessageType.PROXIMITY;
        case 8:
        	return DownMessageType.ANGLE_DETECTION;
        case 9:
            return DownMessageType.REQUEST_STATUS;
        case 11:
            return DownMessageType.SET_PARAM;
        case 12:
            return DownMessageType.CLEAR_MOTION_PERCENTAGE;
        case 13:
            return DownMessageType.SMS;
        case 255:
            return DownMessageType.DEBUG_COMMAND;
        default:
            throw new Error("The downlink message type is Unknown");
    }
}

function determineOpMode(payload){
    if (payload.length<3){
        throw new Error("The payload is not valid to determine operational mode");
    }
    switch (payload[2]){
        case 0:
            return Mode.STAND_BY;
        case 1:
            return Mode.MOTION_TRACKING;
        case 2:
            return Mode.PERMANENT_TRACKING;
        case 3:
            return Mode.MOTION_START_END_TRACKING;
        case 4:
            return Mode.ACTIVITY_TRACKING;
        case 5:
            return Mode.OFF;
        default:
            throw new Error("The mode is unknown");
    }
}

function determineParamIds(payload){
	
    let paramIds = [];
    for (var i = 2; i < payload.length; i++){
        paramIds.push(payload[i]);
    }
    return paramIds;
}

function determineAngleDetectionMessage(payload){
    if (payload.length<2){
        throw new Error("The payload is not valid to determine the control of the angle detection");
    } 
    switch (payload[2]){
            case 0:
                return AngleDetectionControl.STOP_ANGLE_DETECTION;
            case 1:
                return AngleDetectionControl.START_ANGLE_DETECTION;  
            default:
                throw new Error("The control angle detection is unknown");
        }
 }

function determineStatusRequestType(payload){
    switch (payload[2]){
        case 0:
            return MessageType.ENERGY_STATUS;
        case 1:
            return MessageType.HEALTH_STATUS;  
        default:
            throw new Error("The status type is unknown");
    }
}

function determineProximityMessage(payload){
    if (payload.length<3){
        throw new Error("The payload is not valid to determine proximity message");
    }
    let proximityMessage = new proximityMessageClass.ProximityMessage();
    switch (payload[2]){
        case 0:
            proximityMessage.type = proximityMessageClass.Type.GET_RECORD_STATUS
            break;
        case 1:
            proximityMessage.type = proximityMessageClass.Type.SET_WHITE_LIST_STATUS;
            break;
        case 2:
            proximityMessage.type = proximityMessageClass.Type.GET_DAILY_INFORMATION;
            break;
        case 3:
            proximityMessage.type = proximityMessageClass.Type.CLEAR_DAILY_INFORMATION;
            break;
        default:
            throw new Error("The proximity message type is Unknown");
    }
    if (proximityMessage.type == proximityMessageClass.Type.GET_RECORD_STATUS || proximityMessage.type == proximityMessageClass.Type.SET_WHITE_LIST_STATUS){
        if (payload.length<19){
            throw new Error("The payload is not valid to determine rolling proximity identifier");
        }
        proximityMessage.rollingProximityIdentifier = convertBytesToString(payload.slice(3,19));
    }
    if (proximityMessage.type == proximityMessageClass.Type.SET_WHITE_LIST_STATUS){
        if (payload.length<20){
            throw new Error("The payload is not valid to determine record status");
        }
        switch (payload[19]){
            case 0:
                proximityMessage.recordStatus = proximityMessageClass.SetRecordStatus.RESET_WHITE_LISTING;
                break;
            case 1:
                proximityMessage.recordStatus = proximityMessageClass.SetRecordStatus.SET_WHITE_LISTING;
                break;
            default:
                throw new Error("The record status is unknown");
        }
    }
    if (proximityMessage.type == proximityMessageClass.Type.GET_DAILY_INFORMATION || proximityMessage.type == proximityMessageClass.Type.CLEAR_DAILY_INFORMATION){
        if (payload.length<4){
            throw new Error("The payload is not valid to determine day identifier");
        }
        proximityMessage.dayIdentifier = payload[3];
    }

    return proximityMessage;
}

function determineSetParameters(payload){
    if (payload.length<7 || payload.length>27){
        throw new Error("The payload is not valid to determine Parameter IDs");
    }
    let parameterIds = []
    let parameterValues= []
    let paramsToSet = {}
    let paramNum = (payload.length -2)/5;
    for (var i = 0; i < paramNum; i++){
    	parameterIds.push(payload[2+5*i]);
    	parameterValues.push(parseInt(convertBytesToString(payload.slice(3+5*i, 7+5*i)),16));
    }

    determineConfigurations(paramsToSet, parameterIds, parameterValues, false, payload);
    return paramsToSet;

}

function determinOptionalCommand(payload){
    switch (payload[2]){
        case 1:
            return OptionalCommand.RESET_COUNTERS;
        case 2:
            return OptionalCommand.RESET_TEMPERATURES;
        case 3:
            return OptionalCommand.RESET_COUNTER;
        default:
            throw new Error("The optional command is unknown");
    }
}

function determineDebugCommand(payload){
    if (payload.length<3){
        throw new Error("The payload is not valid to determine Debug command");
    }
    switch (payload[2]){
        case 1:
            return DebugCommandType.RESET;
        case 2:
            return DebugCommandType.RESET_BLE_PAIRING;
        case 3:
            return DebugCommandType.MAKE_TRACKER_RING;
        case 4:
            return DebugCommandType.READ_CURRENT_ERROR_AND_SEND_IT;
        case 5:
            return DebugCommandType.TRIGGER_HEARTBEAT_MESSAGE;
        case 6:
            return DebugCommandType.READ_TX_POWER_INDEX;
        case 7:
            return DebugCommandType.WRITE_TX_POWER_INDEX;
        case 8:
            return DebugCommandType.TRIGGER_BLE_BOOTLOADER;
        case 9:
        	return DebugCommandType.SPECIFIC_FIRMWARE_PARAMETERS_REQUEST;
        case 10:
        	return DebugCommandType.CONFIGURE_STARTUP_MODES;
        case 11:
        	return DebugCommandType.START_AND_STOP_BLE_ADVERTISEMENT;
        case 241:
            return DebugCommandType.TRIGGER_AN_ERROR;
        default:
            throw new Error("The debug command is unknown");
    }
}

function determineResetAction(payload){
    if (payload.length == 4){
        switch (payload[3]){
            case 0:
                return ResetAction.RESET_DEVICE;
            case 1:
                return ResetAction.DELETE_CONFIG_RESET;
            case 2:
                return ResetAction.DELETE_CONFIG_BLE_BOND_RESET;
            default:
                throw new Error("The ResetAction is unknown");
        }
    }
}

function determineBuzzerMelodyId(payload){
    if (payload.length > 3){
        switch (payload[3]){
            case 0:
                return MelodyId.SWITCH_ON;
            case 1:
                return MelodyId.SWITCH_OFF;
            case 2:
                return MelodyId.FLAT_BATTERY;
            case 3:
                return MelodyId.ALERT;
            case 4:
                return MelodyId.SOS_MODE;
            case 5:
                return MelodyId.SOS_MODE_CLEAR;
            case 6:
                return MelodyId.RESET;
            case 7:
                return MelodyId.BLE_ADVERTISING;
            case 8:
                return MelodyId.BLE_BONDED;
            case 9:
                return MelodyId.BLE_DEBONDED;
            case 10:
                return MelodyId.BLE_LINK_LOSS;
            case 11:
                return MelodyId.PROX_WARNING;
            case 12:
                return MelodyId.PROX_WARNING_REMINDER;
            case 13:
                return MelodyId.PROX_ALARM;
            case 14:
                return MelodyId.PROX_ALARM_REMINDER;
            default:
                throw new Error("The melody ID is unknown");
        }
    } 
}

function determineWriteTxIndex(payload){
    if (payload.length<4){
        throw new Error("The payload is not valid to determine Tx Index Power");
    }
    return payload[3];
}

function determineBuzzerDuration(payload){
    if (payload.length>4){
        return payload[4];
    }
}

function determineBleAdvertisementDuration(payload){
	  if (payload.length<4){
	        throw new Error("The payload is not valid to determine duration of BLE advertisement");
	  }
	  
	  return ((payload[3]<<8) + payload[4]);
}

function determineStartupModes(payload){
      let statupModes = new startupModesClass.StartupModes(((payload[3] & 0x01) == 1),
                                                              (((payload[3] >> 1) & 0x01) == 1));
      return statupModes;
}

function determineUplinkSms(payload){
	  if (payload.length<5){
	        throw new Error("The payload is not valid to determine SMS message");
	  }
	  var message = '';
    
	  for (var i = 5; i < payload.length; i ++)
      	message += String.fromCharCode(payload[i]);
    
      let sms = new smsClass.Sms((payload[2] << 16) + (payload[3] << 8) + payload[4], undefined, message);
      return sms;
}

function determineDownlinkSms(payload){
	  if (payload.length<5){
	        throw new Error("The payload is not valid to determine SMS message");
	  }
	  var message = '';
    
	  for (var i = 5; i < payload.length; i ++)
      	message += String.fromCharCode(payload[i]);
    
      let sms = new smsClass.Sms(undefined, (payload[2] << 16) + (payload[3] << 8) + payload[4], message);
      return sms;
}

function encodeGetPosition(payload){
    let encData = [];
    encData[0] = 0x01;
    encData[1] = payload.ackToken & 0x0F;
    return encData;
}

function encodeChangeTrackerMode(payload){
    let encData = [];
    encData[0] = 0x02;
    encData[1] = payload.ackToken & 0x0F;
    if (payload.modeValue == null){
        throw new Error("No mode value");
    }
    switch (payload.modeValue){
        case Mode.STAND_BY:
            encData[2] = 0x00;
            break;
        case Mode.MOTION_TRACKING:
            encData[2] = 0x01;
            break;
        case Mode.PERMANENT_TRACKING:
            encData[2] = 0x02;
            break;
        case Mode.MOTION_START_END_TRACKING:
            encData[2] = 0x03;
            break;
        case Mode.ACTIVITY_TRACKING:
            encData[2] = 0x04;
            break;
        case Mode.OFF:
            encData[2] = 0x05;
            break;
        default:
            break;
    } 
    return encData;
}

function encodeGetDeviceConfig(payload){
    let encData = [];
    encData[0] = 0x03;
    encData[1] = payload.ackToken & 0x0F;
    let size = 0;
    if (payload.listParameterID != null){
        size = payload.listParameterID.length;
    }
    for (var i =0; i< size; i++){
        encData[2+i] = payload.listParameterID[i];
    }
    return encData;
}

function encodeStartSOSMode(payload){
    let encData = [];
    encData[0] = 0x04;
    encData[1] = payload.ackToken & 0x0F;
    return encData;
}

function encodeStopSOSMode(payload){
    let encData = [];
    encData[0] = 0x05;
    encData[1] = payload.ackToken & 0x0F;
    return encData;
}

function encodeGetTemperatureStatus(payload){
    let encData = [];
    encData[0] = 0x06;
    encData[1] = payload.ackToken & 0x0F;
    if (payload.optionalCommand != null){
        switch (payload.optionalCommand){
            case OptionalCommand.RESET_COUNTERS:
                encData[2] = 0x01;
                break;
            case OptionalCommand.RESET_TEMPERATURES:
                encData[2] = 0x02;
                break;
            case OptionalCommand.RESET_COUNTER:
                encData[2] = 0x03;
                break;
            default:
                throw new Error("The optional command is unknown");
        }
        
    }
    return encData;
}

function encodeProximityMessage(payload){
    let encData = [];
    encData[0] = 0x07;
    encData[1] = payload.ackToken & 0x0F;
    if (payload.proximityMessage == null){
        throw new Error("No Proximity Message");
    }
    switch (payload.proximityMessage.type){
        case proximityMessageClass.Type.GET_RECORD_STATUS:
            encData[2] = 0;
            if (payload.proximityMessage.rollingProximityIdentifier == null)
                throw new Error("Missing rolling proximity identifier");
            encData = encData.concat(convertToByteArray(payload.proximityMessage.rollingProximityIdentifier));
            break;
        case proximityMessageClass.Type.SET_WHITE_LIST_STATUS:
            encData[2] = 1;
            if (payload.proximityMessage.rollingProximityIdentifier == null)
                throw new Error("Missing rolling proximity identifier");
            encData = encData.concat(convertToByteArray(payload.proximityMessage.rollingProximityIdentifier));
            if (payload.proximityMessage.recordStatus== null)
                throw new Error("Missing record status");
        	switch (payload.proximityMessage.recordStatus){
                case proximityMessageClass.SetRecordStatus.RESET_WHITE_LISTING:
                    encData[19]=0x0;
                    break;
                case proximityMessageClass.SetRecordStatus.SET_WHITE_LISTING:
                    encData[19]=0x1;
                    break;
        	}
            break;
        case proximityMessageClass.Type.GET_DAILY_INFORMATION:
            encData[2] = 2;
            if (payload.proximityMessage.dayIdentifier == null)
                throw new Error("Missing day identifier");
            encData[3] = payload.proximityMessage.dayIdentifier & 0xFF;
            break;
        case proximityMessageClass.Type.CLEAR_DAILY_INFORMATION:
            if (payload.proximityMessage.dayIdentifier == null)
                throw new Error("Missing day identifier");
            encData[3] = payload.proximityMessage.dayIdentifier & 0xFF;
            encData[2] = 3;
            break;
        default:
            encData[2] = 3;
            break;
    }
    return encData;
}

function encodeAngleDetectionMessage(payload){
    let encData = [];
    encData[0] = 0x08;
    encData[1] = payload.ackToken & 0x0F;
    if (payload.angleDetectionControl == null){
        throw new Error("No angle detection control");
    }
    
    switch (payload.angleDetectionControl){
        case AngleDetectionControl.STOP_ANGLE_DETECTION:
            encData[2] = 0x00;
            break;
        case AngleDetectionControl.START_ANGLE_DETECTION:
            encData[2] = 0x01;
            break;
        default:
        	throw new Error("The angle detection control is unknown");
      
    } 
    return encData;
}

function encodeStatusRequestMessage(payload){
    let encData = [];
    encData[0] = 0x09;
    encData[1] = payload.ackToken & 0x0F;
    if (payload.statusType != null){
        switch (payload.statusType){
            case MessageType.ENERGY_STATUS:
                encData[2] = 0x00;
                break;
            case MessageType.HEALTH_STATUS:
                encData[2] = 0x01;
                break;
            default:
                throw new Error("The Status Message Type is unknown");
        }
    }
    return encData;
}

function encodeSetParameter(payload){
    let setParameters = payload.setParameters 
    if (Object.keys(setParameters).length > 5){
    	   throw new Error("Too many parameters for one downlink message");
    }
    let encData = [];
    encData[0] = 0x0b;
    encData[1] = payload.ackToken & 0x0F;
    let i = 0;
    
    for (let setParameter of Object.entries( setParameters )) {
    	let parameter =(jsonParametersByDriverName[setParameter[0]])
    	if (parameter == undefined && setParameter[0] != "confirmedUplink" )
    		throw new Error(setParameter[0]+ " unknown parameter name");
    	if (setParameter[0] == "confirmedUplink")
        {
            let confirmedUplinkObject = setParameter[1]
            
            if ("confirmedUlBitmap" in confirmedUplinkObject){
                let confirmedUlBitmapValue = confirmedUplinkObject["confirmedUlBitmap"]
                encData[2+i*5] = ((jsonParametersByDriverName["confirmedUlBitmap"]).id)
                encData[3+i*5] = (confirmedUlBitmapValue >> 24) & 0xFF;
                encData[4+i*5] = (confirmedUlBitmapValue  >> 16) & 0xFF;
                encData[5+i*5] = (confirmedUlBitmapValue  >> 8) & 0xFF;
                encData[6+i*5] = confirmedUlBitmapValue  & 0xFF;
                i++;
            }
            else{
                let bitMap = jsonParametersByDriverName["confirmedUlBitmap"].parameterType.bitMap
                let flags = 0
                
                for (let bit of bitMap){
                    let flag = bit.valueFor
                    let flagValue = confirmedUplinkObject[flag]
                    if (flagValue == undefined){
                        throw new Error("Bit "+ flag +" is missing");
                    }
                    flags |= Number(flagValue) << bit.bitShift
                }
                encData[2+i*5] = ((jsonParametersByDriverName["confirmedUlBitmap"]).id)
                encData[3+i*5] = (flags >> 24) & 0xFF;
                encData[4+i*5] = (flags  >> 16) & 0xFF;
                encData[5+i*5] = (flags  >> 8) & 0xFF;
                encData[6+i*5] = flags  & 0xFF;
                i++;        
            }
            if ("confirmedUlRetry" in confirmedUplinkObject){
                let confirmedUlRetryValue = confirmedUplinkObject["confirmedUlRetry"]
                encData[2+i*5] = ((jsonParametersByDriverName["confirmedUlRetry"]).id)
                encData[3+i*5] = (confirmedUlRetryValue >> 24) & 0xFF;
                encData[4+i*5] = (confirmedUlRetryValue  >> 16) & 0xFF;
                encData[5+i*5] = (confirmedUlRetryValue  >> 8) & 0xFF;
                encData[6+i*5] = confirmedUlRetryValue  & 0xFF;
                i++;
            }
        
        }
    	else if (setParameter[0] == "dynamicProfile")
    	{     	
    		encData[2+i*5] = parameter.id & 0xFF
    		encData[3+i*5] = 0;
   	        encData[4+i*5] = 0;
   	        encData[5+i*5] = 0;
   	        encData[6+i*5]  = getProfileIdByName(jsonProfiles,setParameter[1]);
			i++;
    	}
    	else 
    	{
			let paramValue = setParameter[1]
			let id = parameter.id
	   		let paramType = parameter.parameterType.type
	   		encData[2+i*5] = id & 0xFF
	   		switch (paramType)
	   		{ case "ParameterTypeNumber":{
	   			let range = parameter.parameterType.range
	   			let multiply = parameter.parameterType.multiply
	   			let additionalValues = parameter.parameterType.additionalValues
	   			let additionalRanges = parameter.parameterType.additionalRanges
	   			// negative number
	   		
	   			if (checkParamValueRange(paramValue, range.minimum, range.maximum, range.exclusiveMinimum, range.exclusiveMaximum, additionalValues, additionalRanges)){
	   				if (multiply != undefined){
	   					paramValue = paramValue/multiply
	   				}
	   				if (paramValue < 0) {
	   	                paramValue += 0x100000000;
		            }
	   				encData[3+i*5] = (paramValue >> 24) & 0xFF;
	   	            encData[4+i*5] = (paramValue >> 16) & 0xFF;
	   	            encData[5+i*5] = (paramValue >> 8) & 0xFF;
	   	            encData[6+i*5] = paramValue & 0xFF;
	   	            i++;
	   			}
	   			else{
	   	
		   				throw new Error(setParameter[0]+" parameter value is out of range");
	   			}
            }break;
	   		case "ParameterTypeString":
	   			if (((parameter.parameterType.possibleValues).indexOf(paramValue)) != -1)
	   				{
		   				encData[3+i*5] = 0;
			   	        encData[4+i*5] = 0;
			   	        encData[5+i*5] = 0;
			   	        encData[6+i*5]  = (parameter.parameterType.firmwareValues[((parameter.parameterType.possibleValues).indexOf(paramValue))])
						i++;
	   				}
	   			else{
	   			   	
	   				throw new Error(setParameter[0]+" parameter value is unknown");
	   			}
		   	        
	   	        break;
	   		case "ParameterTypeBitMap":{
	   			let flags =0 
	   			let properties = parameter.parameterType.properties
	   			let bitMap = parameter.parameterType.bitMap
                for (let bit of bitMap){
                    let flagName = bit.valueFor
                    let flagValue = setParameter[1][flagName]
                    if (flagValue == undefined){
                        throw new Error("Bit "+ flagName +" is missing");
                    }
                    let  property = (properties.find(el => el.name === flagName))
                    let propertyType = property.type
					switch (propertyType)
					{
                        case "PropertyBoolean":
                            if ((bit.inverted != undefined) && (bit.inverted)){
                                flagValue =! flagValue;
                            } 
                            flags |= Number(flagValue) << bit.bitShift
                            break;
                        case "PropertyString":
                            if (property.possibleValues.indexOf(flagValue) != -1){
                                flags |= (property.firmwareValues[property.possibleValues.indexOf(flagValue)]) << bit.bitShift
                            }
                            else {
                                throw new Error(property.name+ " parameter value is not among possible values");
                            }
                            
                            break;
                        case "PropertyNumber":
                            if (checkParamValueRange(flagValue, property.range.minimum, property.range.maximum, property.range.exclusiveMinimum, property.range.exclusiveMaximum, property.additionalValues, property.additionalRanges)){
                                flags |= flagValue << bit.bitShift
                            }
                            else 
                                throw new Error("Value out of range for "+ setParameter[0]+"."+flagName);
                            break;
                        case "PropertyObject":{
                            let bitValues = Object.entries(flagValue)
                            for (let b of bit.values){
                                let fValue = flagValue[b.valueFor]
                                if (fValue == undefined){
                                    throw new Error("Bit "+ flagName +"."+ b.valueFor+" is missing");
                                }
                                if ((b.inverted != undefined) && (b.inverted)){
                                    fValue =! fValue;
                                }
                                flags |= Number(fValue) <<  b.bitShift 

                            }
                        }break;
                        default:
                            throw new Error("Property type is unknown");
					}
                }
	   			
	   			encData[3+i*5] = (flags >> 24) & 0xFF;
	   	        encData[4+i*5] = (flags >> 16) & 0xFF;
	   	        encData[5+i*5] = (flags >> 8) & 0xFF;
	   	        encData[6+i*5] = flags & 0xFF;
	   	        i++;
		
            }break;
	   		default:
	   			throw new Error("Parameter type is unknown");
	   			
	   		}
   		
   		}
    }
    return encData;
}

function encodeClearMotionPercentage(payload) {
    let encData = [];
    encData[0] = 0x0C;
    encData[1] = payload.ackToken & 0x0F;
	return encData;
}

function encodeSms(payload) {
    let encData = [];
    encData[0] = 0x0D;
    encData[1] = payload.ackToken & 0x0F;
    if (payload.sms == null){
        throw new Error("No SMS");
    }
    if (payload.sms.destinationId != undefined || 
    	payload.sms.senderId == undefined || 
    	payload.sms.message == undefined){
        throw new Error("Downlink SMS should include only senderId and message");
    }
	encData[2] = payload.sms.senderId >> 16;
	encData[3] = (payload.sms.senderId >> 8) & 0xFF;
	encData[4] = payload.sms.senderId & 0xFF;
	for (let i = 0; i < payload.sms.message.length; i++)
		encData[i + 5] = payload.sms.message.charCodeAt(i) & 0xFF;
	return encData;
}

function encodeDebugCommand(payload){
    let encData = [];
    encData[0] = 0xFF;
    encData[1] = payload.ackToken & 0x0F;
    if (payload.debugCommandType == null){
        throw new Error("No debug command type");
    }
    else{
        switch (payload.debugCommandType){
            case DebugCommandType.RESET:
                encData[2] = 0x01;
                if (payload.resetAction != null){
                    switch (payload.resetAction){
                        case ResetAction.RESET_DEVICE:
                            encData[3] = 0x00;
                            break;
                        case ResetAction.DELETE_CONFIG_RESET:
                            encData[3] = 0x01;
                            break;
                        case ResetAction.DELETE_CONFIG_BLE_BOND_RESET:
                            encData[3] = 0x02;
                            break;
                        default:
                            throw new Error("Invalid Reset Action Value");
                    }
                }
                return encData;
            case DebugCommandType.MAKE_TRACKER_RING:
                encData[2] = 0x03;
                if (payload.melodyId != null){
                    switch (payload.melodyId){
                        case MelodyId.SWITCH_ON:
                            encData[3] = 0x00;
                            break;
                        case MelodyId.SWITCH_OFF:
                            encData[3] = 0x01;
                            break;
                        case MelodyId.FLAT_BATTERY:
                            encData[3] = 0x02;
                            break;
                        case MelodyId.ALERT:
                            encData[3] = 0x03;
                            break;
                        case MelodyId.SOS_MODE:
                            encData[3] = 0x04;
                            break;
                        case MelodyId.SOS_MODE_CLEAR:
                            encData[3] = 0x05;
                            break;
                        case MelodyId.RESET:
                            encData[3] = 0x06;
                            break;
                        case MelodyId.BLE_ADVERTISING:
                            encData[3] = 0x07;
                            break;
                        case MelodyId.BLE_BONDED:
                            encData[3] = 0x08;
                            break;
                        case MelodyId.BLE_DEBONDED:
                            encData[3] = 0x09;
                            break;
                        case MelodyId.BLE_LINK_LOSS:
                            encData[3] = 0x0a;
                            break;
                        case MelodyId.PROX_WARNING:
                            encData[3] = 0x0b;
                            break;
                        case MelodyId.PROX_WARNING_REMINDER:
                            encData[3] = 0x0c;
                            break;
                        case MelodyId.PROX_ALARM:
                            encData[3] = 0x0d;
                            break;
                        case MelodyId.PROX_ALARM_REMINDER:
                            encData[3] = 0x0e;
                            break;
                        default:
                            throw new Error("Invalid Melody Id Value");
                    }
                    if (payload.buzzerDuration != null){
                        if(payload.buzzerDuration >= 0 && payload.buzzerDuration <= 255)
                            encData[4] = payload.buzzerDuration;
                        else
                            throw new Error("buzzerDuration parameter value "+ payload.buzzerDuration +" is out of range");
                    }
                }
                return encData;
            case DebugCommandType.READ_CURRENT_ERROR_AND_SEND_IT:
                encData[2] = 0x04;
                return encData;
            case DebugCommandType.TRIGGER_AN_ERROR:
                encData[2] = 0xf1;
                return encData;
            case DebugCommandType.RESET_BLE_PAIRING:
                encData[2] = 0x02;
                return encData;
            case DebugCommandType.TRIGGER_HEARTBEAT_MESSAGE:
                encData[2] = 0x05;
                return encData;
            case DebugCommandType.READ_TX_POWER_INDEX:
                encData[2] = 0x06;
                return encData;
            case DebugCommandType.WRITE_TX_POWER_INDEX:
                encData[2] = 0x07;
                encData[3] = payload.txPowerIndex;
                return encData;
            case DebugCommandType.TRIGGER_BLE_BOOTLOADER:
            	encData[2] = 0x08;
            	return encData;
            case DebugCommandType.SPECIFIC_FIRMWARE_PARAMETERS_REQUEST:
                encData[2] = 0x09;
                return encData;
            case DebugCommandType.CONFIGURE_STARTUP_MODES:{
                encData[2] = 0x0a;
                encData[3] = 0;
                let startupModes = Object.assign(new startupModesClass.StartupModes(), payload.startupModes);
                if (startupModes.manufacturing){
                    encData[3] += 0X01;
                }
                if (startupModes.shipping){
                    encData[3] += 0X02;
                }}
                return encData;
            case DebugCommandType.START_AND_STOP_BLE_ADVERTISEMENT:
                encData[2] = 0x0b;
                encData[3] = ((payload.bleAdvertisementDuration)>>8)&0xFF;
                encData[4] = payload.bleAdvertisementDuration & 0xFF;
                return encData;
        }
    }
}

function convertBytesToString(bytes){
    var payload = "";
    var hex;
    for(var i = 0; i < bytes.length; i++){
        hex = convertByteToString(bytes[i]);
        payload += hex;
    }
    return payload;
}

function convertByteToString(byte){
    let hex = byte.toString(16);
    if (hex.length < 2){
        hex = "0" + hex;
    }
    return hex;
}

function decodeCondensed(value, lo, hi, nbits, nresv) {
    return ((value - nresv / 2) / ( (((1 << nbits) - 1) - nresv) / (hi - lo)) + lo);
}

function convertNegativeInt16(value) {	if (value > 0x7FFF) {
    value -= 0x10000;
	}
	return value;
}

function determineAngleDetection(payload) {
	 if (payload.length<13){
        throw new Error("The payload is not valid to determine angle detection");
    }
    let angleDetection = new angleDetectionClass.AngleDetection(); 
    let flags = new angleDetectionFlagsClass.AngleDetectionFlags(); 
    switch (payload[6]>>5){	
    	case 0:
    		flags.transition = angleDetectionFlagsClass.Transition.LEARNING_TO_NORMAL;
    		break;
    	case 1:
    		flags.transition = angleDetectionFlagsClass.Transition.NORMAL_TO_LEARNING;
    		break;
     	case 2:
    		flags.transition = angleDetectionFlagsClass.Transition.NORMAL_TO_CRITICAL;
    		break;
     	case 3:
    		flags.transition = angleDetectionFlagsClass.Transition.CRITICAL_TO_NORMAL;
    		break;
     	case 4:
    		flags.transition = angleDetectionFlagsClass.Transition.CRITICAL_TO_LEARNING;
    		break;
     	 default:
             throw new Error("The transition flag of angle detection is unknown");
    }
    switch ((payload[6]>>3) & 0X3){	
		case 0:
			flags.triggerType = angleDetectionFlagsClass.TriggerType.CRITICAL_ANGLE_REPORTING;
			break;
		case 1:
			flags.triggerType = angleDetectionFlagsClass.TriggerType.ANGLE_DEVIATION_REPORTING;
			break;
	 	case 2:
	 		flags.triggerType = angleDetectionFlagsClass.TriggerType.SHOCK_TRIGGER;
			break;
	 	case 3:
	 		flags.triggerType = angleDetectionFlagsClass.TriggerType.RFU;
			break;	 	
	 	 default:
	         throw new Error("The trigger type flag of angle detection is unknown");
    }
    flags.notificationIdentifier = (payload[6] & 0x7);
    angleDetection.flags = flags;
    angleDetection.age = (payload[7]<<8) + payload[8];
    angleDetection.referenceVector=determineVectorDetection(payload,9,11,13);
    angleDetection.criticalVector=determineVectorDetection(payload,15,17,19);
    angleDetection.angle = convertNegativeInt16(payload[21]);
    return angleDetection
}

function determineGeofencingNotification(payload) {
	let geofencingNotification = new geofencingNotificationClass.GeofencingNotification();
	geofencingNotification.geofencingFormat = (payload[6] >>4) & 0x0F;
	switch (payload[6] & 0x0F){ 
	    case 0:
	    	geofencingNotification.geofencingType = geofencingNotificationClass.GeofencingType.SAFE_AREA;
	        break;
	    case 1:
	    	geofencingNotification.geofencingType = geofencingNotificationClass.GeofencingType.ENTRY;
	        break;
	    case 2:
	    	geofencingNotification.geofencingType = geofencingNotificationClass.GeofencingType.EXIT;
	        break;
	    case 3:
	        geofencingNotification.geofencingType = geofencingNotificationClass.GeofencingType.HAZARD;
	        break;
	    default:
	        throw new Error("The geofencing type is unknown"); 
	     }
	if (geofencingNotification.geofencingFormat == 0)
		{
		    let number = (payload[7] << 16) + (payload[8] << 8) + payload[9];
            geofencingNotification.id = "0x"+number.toString(16).padStart(6, '0');
		}
	return geofencingNotification
}

function determineMotionDutyCycle(payload){
    if (payload.length == 13){
        return payload[12];
    }
}

function determineGaddIndex(payload){
    if (payload.length == 17){
        return  (payload[13] << 24) + (payload[14] << 16) + (payload[15] << 8) + payload[16];
    }
}

const ASSET_TRACKER_2_0_PORT_NUMBER = 18;
const PROXIMITY_CCD_ROLLOVER_VALUE = 65535;
const DOWNLINK_PORT_NUMBER = 2;

function decodeUplink(input) {
    let result = {
        data: {},
        errors: [],
        warnings: []
    }
    try{
        var decodedData = new abeewayUplinkPayloadClass.AbeewayUplinkPayload();
        var payload = input.bytes;

        decodedData.messageType = determineMessageType(payload);

        if (decodedData.messageType != MessageType.FRAME_PENDING &&
            decodedData.messageType != MessageType.SMS)
        {
            decodedData.trackingMode = determineTrackingMode(payload);
            decodedData.deviceConfiguration = {};
            decodedData.deviceConfiguration.mode = decodedData.trackingMode;
            decodedData.sosFlag = determineUserAction(payload);
            decodedData.appState = determineAppState(payload);
            decodedData.dynamicMotionState = determineMoving(payload);
            if (input.fPort == ASSET_TRACKER_2_0_PORT_NUMBER)
            {
                decodedData.batteryLevel = determineBatteryLevel(payload);
                decodedData.batteryStatus = determineBatteryStatus(payload);
            }
            else
                decodedData.batteryVoltage = determineBatteryVoltage(payload);
            decodedData.temperatureMeasure = determineTemperature(payload);
            decodedData.periodicPosition = determinePeriodicPosition(payload);
            decodedData.onDemand = determineOnDemandPosition(payload);
        }
        if (decodedData.messageType != MessageType.FRAME_PENDING)
            decodedData.ackToken = determineAckToken(payload, decodedData.messageType);

        decodedData.payload = convertBytesToString(payload);

        switch (decodedData.messageType){
            case MessageType.POSITION_MESSAGE:
                decodedData.rawPositionType = determineRawPositionType(payload);
                switch (decodedData.rawPositionType){
                    case RawPositionType.GPS:
                        decodedData.age = determineAge(payload);
                        decodedData.gpsLatitude = determineLatitude(payload, MessageType.POSITION_MESSAGE);
                        decodedData.gpsLongitude = determineLongitude(payload, MessageType.POSITION_MESSAGE);
                        decodedData.horizontalAccuracy = determineHorizontalAccuracy(payload, 0, MessageType.POSITION_MESSAGE);
                        break;
                    case RawPositionType.GPS_TIMEOUT:
                        decodedData.timeoutCause = determineTimeoutCause(payload, MessageType.POSITION_MESSAGE);
                        decodedData.bestSatellitesCOverN = determineBestSatellitesCOverN(payload, MessageType.POSITION_MESSAGE);
                        break;
                    case RawPositionType.ENCRYPTED_WIFI_BSSIDS:
                        break;
                    case RawPositionType.WIFI_TIMEOUT:
                        decodedData.batteryVoltageMeasures = determineBatteryVoltageMeasures(payload, MessageType.POSITION_MESSAGE);
                        break;
                    case RawPositionType.WIFI_FAILURE:
                        decodedData.batteryVoltageMeasures = determineBatteryVoltageMeasures(payload, MessageType.POSITION_MESSAGE);
                        decodedData.errorCode = determineErrorCode(payload,  MessageType.POSITION_MESSAGE);
                        break;
                    case RawPositionType.XGPS_DATA:
                        break;
                    case RawPositionType.XGPS_DATA_WITH_GPS_SW_TIME:
                        break;
                    case RawPositionType.WIFI_BSSIDS_WITH_NO_CYPHER:
                        decodedData.age = determineAge(payload);
                        if (payload.length >=13)
                        {decodedData.wifiBssids = determineBSSIDS(payload, MessageType.POSITION_MESSAGE);}
                        break;
                    case RawPositionType.BLE_BEACON_SCAN:
                        decodedData.age = determineAge(payload);
                        decodedData.bleBssids = determineBSSIDS(payload, MessageType.POSITION_MESSAGE);
                        break;
                    case RawPositionType.BLE_BEACON_FAILURE:
                        decodedData.bleBeaconFailure = determineBleBeaconFailure(payload, MessageType.POSITION_MESSAGE);
                        break;
                    case RawPositionType.BLE_BEACON_SCAN_SHORT_ID:
                        decodedData.age = determineAge(payload);
                        decodedData.bleBeaconIds = determineShortBeaconIDs(payload, MessageType.POSITION_MESSAGE);
                        break;
                    case RawPositionType.BLE_BEACON_SCAN_LONG_ID:
                        decodedData.age = determineAge(payload);
                        decodedData.bleBeaconIds = determineLongBeaconIDs(payload, MessageType.POSITION_MESSAGE);
                        break;
                    default:
                        throw new Error("The Fix Type is unknown");
                }
                break;
            case MessageType.EXTENDED_POSITION_MESSAGE:
                decodedData.rawPositionType = determineRawPositionType(payload);
                switch (decodedData.rawPositionType){
                    case RawPositionType.GPS:
                        decodedData.gpsFixStatus = determineGpsFixStatus(payload);
                        decodedData.gpsPayloadType = detemindGpsPayloadType(payload);
                        decodedData.age = determineExtendedAge(payload);
                        decodedData.gpsLatitude = determineLatitude(payload, MessageType.EXTENDED_POSITION_MESSAGE);
                        decodedData.gpsLongitude = determineLongitude(payload, MessageType.EXTENDED_POSITION_MESSAGE);
                        decodedData.horizontalAccuracy = determineHorizontalAccuracy(payload, decodedData.gpsPayloadType, MessageType.EXTENDED_POSITION_MESSAGE);
                        decodedData.gpsCourseOverGround = determineCourseOverGround(payload);
                        decodedData.gpsSpeedOverGround = determineSpeedOverGround(payload);
                        decodedData.gpsAltitude = determineAltitude(payload, decodedData.gpsPayloadType);
                        if (payload.length > 24)
                            decodedData.gpsPrevious = determineGpsPrevious(payload);
                        break;
                    case RawPositionType.GPS_TIMEOUT:
                        decodedData.age = determineExtendedAge(payload);
                        decodedData.timeoutCause = determineTimeoutCause(payload, MessageType.EXTENDED_POSITION_MESSAGE);
                        decodedData.bestSatellitesCOverN = determineBestSatellitesCOverN(payload, MessageType.EXTENDED_POSITION_MESSAGE);
                        break;
                    case RawPositionType.ENCRYPTED_WIFI_BSSIDS:
                        break;
                    case RawPositionType.WIFI_TIMEOUT:
                        decodedData.age = determineExtendedAge(payload);
                        decodedData.batteryVoltageMeasures = determineBatteryVoltageMeasures(payload, MessageType.EXTENDED_POSITION_MESSAGE);
                        break;
                    case RawPositionType.WIFI_FAILURE:
                        decodedData.age = determineExtendedAge(payload);
                        decodedData.batteryVoltageMeasures = determineBatteryVoltageMeasures(payload, MessageType.EXTENDED_POSITION_MESSAGE);
                        decodedData.errorCode = determineErrorCode(payload, MessageType.EXTENDED_POSITION_MESSAGE);
                        break;
                    case RawPositionType.XGPS_DATA:
                        break;
                    case RawPositionType.XGPS_DATA_WITH_GPS_SW_TIME:
                        break;
                    case RawPositionType.WIFI_BSSIDS_WITH_NO_CYPHER:
                        decodedData.age = determineExtendedAge(payload);
                        if (payload.length >=14)
                        {decodedData.wifiBssids = determineBSSIDS(payload, MessageType.EXTENDED_POSITION_MESSAGE)};
                        break;
                    case RawPositionType.BLE_BEACON_SCAN:
                        decodedData.age = determineExtendedAge(payload);
                        decodedData.bleBssids = determineBSSIDS(payload, MessageType.EXTENDED_POSITION_MESSAGE);
                        break;
                    case RawPositionType.BLE_BEACON_FAILURE:
                        decodedData.age = determineExtendedAge(payload);
                        decodedData.bleBeaconFailure = determineBleBeaconFailure(payload, MessageType.EXTENDED_POSITION_MESSAGE);
                        break;
                    case RawPositionType.BLE_BEACON_SCAN_SHORT_ID:
                        decodedData.age = determineExtendedAge(payload);
                        decodedData.bleBeaconIds = determineShortBeaconIDs(payload, MessageType.EXTENDED_POSITION_MESSAGE);
                        break;
                    case RawPositionType.BLE_BEACON_SCAN_LONG_ID:
                        decodedData.age = determineExtendedAge(payload);
                        decodedData.bleBeaconIds = determineLongBeaconIDs(payload, MessageType.EXTENDED_POSITION_MESSAGE);
                        break;
                    default:
                        throw new Error("The Fix Type is unknown");
                }
                break;
            case MessageType.HEARTBEAT:
                decodedData.resetCause = determineResetCause(payload);
                if (payload.length > 6){
                    decodedData.firmwareVersion = determineHeartBeatFirmwareVersion(payload);
                }
                if (payload.length > 9){
                    decodedData.bleFirmwareVersion = determineHeartBeatBleFirmwareVersion(payload);
                }
                break;
            case MessageType.HEALTH_STATUS:
                decodedData.healthStatus = determinHealthStatus(payload);
                break;
            case MessageType.ENERGY_STATUS:
                decodedData.gpsOnRuntime = determineGpsOnRuntime(payload);
                decodedData.gpsStandbyRuntime = determineGpsStandby(payload);
                decodedData.wifiScanCount = determineWifiScanCount(payload);
                break;
            case MessageType.ACTIVITY_STATUS:
                decodedData.miscDataTag = determineMiscDataTag(payload);
                switch (decodedData.miscDataTag){
                    case MiscDataTag.ACTIVITY_COUNTER:
                        decodedData.activityCount = determineActivityCounter(payload);
                        break;
                    case MiscDataTag.PERIODIC_ACTIVITY:
                        decodedData.activityReportingWindow = determinePeriodicActivity(payload);
                        decodedData.activityCount = determineActivityCounterPeriodicReport(payload);
                        break;
                    default:
                        break;
                }
                break;
            case MessageType.SHOCK_DETECTION:
                decodedData.miscDataTag = determineMiscDataTag(payload);
                decodedData.nbOfshock = determineNbShocks(payload);
                decodedData.accelerometerShockData = determineAccelerometerShockData(payload);
                decodedData.gaddIndex = determineGaddIndex(payload);
                break;
            case MessageType.CONFIGURATION:
                decodedData.miscDataTag = determineMiscDataTag(payload);
                decodedData.deviceConfiguration = determineDeviceConfiguration(payload);
                if (decodedData.deviceConfiguration.mode == null) {
                    decodedData.deviceConfiguration.mode = decodedData.trackingMode;
                }

                break;
            case MessageType.BLE_MAC:
                decodedData.miscDataTag = determineMiscDataTag(payload);
                decodedData.bleMac = determineBleMac(payload);
                break;
            case MessageType.DEBUG:
                decodedData.debugCommandTag = determineDebugCommandTag(payload);
                switch (decodedData.debugCommandTag){
                    case DebugCommandTag.DEBUG_CRASH_INFORMATION:
                        decodedData.debugErrorCode = determineDebugErrorCode(payload);
                        decodedData.debugCrashInfo = determineDebugCrashInfo(payload);
                        break;
                    case DebugCommandTag.TX_POWER_INDEX_VALUE:
                        decodedData.txPowerIndex = determineTxIndexPower(payload);
                        break;
                    case DebugCommandTag.UPLINK_LENGTH_ERR:
                        decodedData.lengthErrCounter = determineUlLengthErrCounter(payload);
                        break;
                    case DebugCommandTag.GENERIC_ERROR:
                        decodedData.genericErrorCode = determineGenericErrorCode(payload);
                        break;
                    case DebugCommandTag.SPECIFIC_FIRMWARE_PARAMETERS:
                        decodedData.specificFirmwareParameters = determineSpecificFirmwareParameters(payload);
                        break;
                    default:
                        throw new Error("The Debug Command Tag is unknown");
                }
                break;
            case MessageType.SHUTDOWN:
                decodedData.shutdownCause = determineShutDownCause(payload);
                break;
            case MessageType.FRAME_PENDING:
                decodedData.currentAckTokenValue = determineCurrentAckTokenValue(payload);
                break;
            case MessageType.EVENT:
                decodedData.eventType = determineEventType(payload);
                switch (decodedData.eventType){
                    case EventType.MOTION_END:
                        decodedData.trackerOrientation = determineTrackerOrientation(payload);
                        decodedData.motionDutyCycle = determineMotionDutyCycle(payload);
                        break;
                    case EventType.TEMPERATURE_ALERT:
                        decodedData.measuredTemperature = determineMeasuredTemperature(payload);
                        break;
                    case EventType.ANGLE_DETECTION:
                        decodedData.angleDetection = determineAngleDetection(payload);
                        break;
                    case EventType.GEOFENCING:
                        decodedData.geofencingNotification = determineGeofencingNotification(payload);
                        break;
                    default:
                        break;
                }
                break;
            case MessageType.DATA_SCAN_COLLECTION:
                decodedData.dataScanCollection = determineDataScanCollection(payload);
                break;
            case MessageType.PROXIMITY_DETECTION:
                if (payload.length < 6) {
                    throw new Error("The payload is not valid to determine proximity payload Type");
                }
                let notificationType;
                let solicited;
                switch (payload[5]&0x07){
                    case 0:
                        notificationType = proximityNotificationClass.NotificationType.WARNING_MESSAGE;
                        break;
                    case 1:
                        notificationType = proximityNotificationClass.NotificationType.ALERT_MESSAGE;
                        break;
                    case 2:
                        notificationType = proximityNotificationClass.NotificationType.RECORD_MESSAGE;
                        break;
                    case 3:
                        decodedData.proximityDailyReport = determineProximityDailyReport(payload);
                        break;
                    case 4:
                        solicited = false;
                        break;
                    case 5:
                        solicited = true;
                        break;
                    case 6:
                        decodedData.proximityDailyResponse = determineProximityDailyResponse(payload);
                        break;
                    default:
                        throw new Error("The Proximity Notification Type is unknown");
                }
                if (notificationType != null){
                    decodedData.proximityNotification = determineProximityNotification(payload, notificationType);
                }
                if (solicited != null){
                    decodedData.proximityWhiteListing = determineProximityWhiteListing(payload, solicited);
                }
                break;
            case MessageType.SMS:
                decodedData.sms = determineUplinkSms(payload);
                break;
            default:
                throw new Error("The message type is unknown");
        }
        decodedData = removeEmpty(decodedData);
        result.data = decodedData;
    } catch (e){
        result.errors.push(e.message);
        delete result.data;
        return result;
    }
    return result;
}
function decodeDownlink(input) {
    let result = {
        data: {},
        errors: [],
        warnings: []
    }
    try{
        var decodedData = new abeewayDownlinkPayloadClass.AbeewayDownlinkPayload();
        var payload = input.bytes;

        decodedData.payload = convertBytesToString(payload);
        decodedData.ackToken = determinDownlinkAckToken(payload);
        decodedData.downMessageType = determineDownlinkMessageType(payload);

        switch (decodedData.downMessageType){
            case DownMessageType.POS_ON_DEMAND:
                break;
            case DownMessageType.SET_MODE:
                decodedData.modeValue = determineOpMode(payload);
                break;
            case DownMessageType.REQUEST_CONFIG:
                if (payload.length > 2)
                { if (payload.length<3 || payload.length > 22){
                    decodedData.errors.push("The payload is not valid to determine Parameters");
                    return decodedData;
                }
                    decodedData.listParameterID = (determineParamIds(payload));
                    decodedData.listParameterIDNames = (determineParamIdNames(decodedData.listParameterID));
                }
                break;
            case DownMessageType.START_SOS:
                break;
            case DownMessageType.STOP_SOS:
                break;
            case DownMessageType.REQUEST_TEMPERATURE_STATUS:
                if (payload.length == 3){
                    if (payload[2] !=0) {
                        decodedData.optionalCommand = determinOptionalCommand(payload);
                    }
                }
                break;
            case DownMessageType.PROXIMITY:
                decodedData.proximityMessage = determineProximityMessage(payload);
                break;
            case DownMessageType.ANGLE_DETECTION:
                decodedData.angleDetectionControl = determineAngleDetectionMessage(payload);
                break;
            case DownMessageType.REQUEST_STATUS:
                if (payload.length == 3){
                    decodedData.statusType = determineStatusRequestType(payload);
                }
                break;
            case DownMessageType.SET_PARAM:
                decodedData.setParameters = determineSetParameters(payload);
                break;
            case DownMessageType.CLEAR_MOTION_PERCENTAGE:
                break;
            case DownMessageType.SMS:
                decodedData.sms = determineDownlinkSms(payload);
                break;
            case DownMessageType.DEBUG_COMMAND:
                decodedData.debugCommandType = determineDebugCommand(payload);
                switch (decodedData.debugCommandType){
                    case DebugCommandType.RESET:
                        decodedData.resetAction = determineResetAction(payload);
                        break;
                    case DebugCommandType.WRITE_TX_POWER_INDEX:
                        decodedData.txPowerIndex = determineWriteTxIndex(payload);
                        break;
                    case DebugCommandType.MAKE_TRACKER_RING:
                        decodedData.melodyId = determineBuzzerMelodyId(payload);
                        decodedData.buzzerDuration = determineBuzzerDuration(payload);
                        break;
                    case DebugCommandType.START_AND_STOP_BLE_ADVERTISEMENT:
                        decodedData.bleAdvertisementDuration = determineBleAdvertisementDuration(payload);
                        break;
                    case DebugCommandType.CONFIGURE_STARTUP_MODES:
                        decodedData.startupModes = determineStartupModes(payload);
                        break;
                }
                break;
            default:
                throw new Error("The Downlink Message Type is unknown");
        }
        decodedData = removeEmpty(decodedData);
        result.data = decodedData;
    } catch (e){
        result.errors.push(e.message);
        delete result.data;
        return result;
    }
    return result;
}
function encodeDownlink(input) {
    let result = {
        errors: [],
        warnings: []
    };

    try{
        if (input == null) {
            throw new Error("No data to encode");
        }

        let data = input;
        if(input.data != null) {
            data = input.data;
        }

        var bytes = [];

        if(data.downMessageType == null){
            throw new Error("No downlink message type");
        }
        switch (data.downMessageType){
            case DownMessageType.POS_ON_DEMAND:
                bytes = encodeGetPosition(data);
                break;
            case DownMessageType.SET_MODE:
                bytes = encodeChangeTrackerMode(data);
                break;
            case DownMessageType.REQUEST_CONFIG:
                bytes = encodeGetDeviceConfig(data);
                break;
            case DownMessageType.START_SOS:
                bytes = encodeStartSOSMode(data);
                break;
            case DownMessageType.STOP_SOS:
                bytes = encodeStopSOSMode(data);
                break;
            case DownMessageType.REQUEST_TEMPERATURE_STATUS:
                bytes = encodeGetTemperatureStatus(data);
                break;
            case DownMessageType.PROXIMITY:
                bytes = encodeProximityMessage(data);
                break;
            case DownMessageType.ANGLE_DETECTION:
                bytes = encodeAngleDetectionMessage(data);
                break;
            case DownMessageType.REQUEST_STATUS:
                bytes = encodeStatusRequestMessage(data);
                break;
            case DownMessageType.SET_PARAM:
                bytes = encodeSetParameter(data);
                break;
            case DownMessageType.CLEAR_MOTION_PERCENTAGE:
                bytes = encodeClearMotionPercentage(data);
                break;
            case DownMessageType.SMS:
                bytes = encodeSms(data);
                break;
            case DownMessageType.DEBUG_COMMAND:
                bytes = encodeDebugCommand(data);
                break;
            default:
                throw new Error("Invalid downlink message type");
        }

        result.bytes = bytes;
        result.fPort = DOWNLINK_PORT_NUMBER;
    } catch (e){
        result.errors.push(e.message);
        delete result.bytes;
        delete result.fPort;
        return result;
    }
    return result;
}

function extractPoints(input) {
    return pointExtractions.extractPoints(input);
}

module.exports = {
    decodeUplink: decodeUplink,
    decodeDownlink: decodeDownlink,
    encodeDownlink: encodeDownlink,
    extractPoints: extractPoints
}

/***/ }),

/***/ 45:
/***/ ((module) => {

function HealthStatus (totalConsumption,
    maxTemperature,
    minTemperature,
    loraPowerConsumption,
    blePowerConsumption,
    gpsPowerConsumption,
    wifiPowerConsumption,
    batteryVoltage){
        this.totalConsumption = totalConsumption;
        this.maxTemperature = maxTemperature;
        this.minTemperature = minTemperature;
        this.loraPowerConsumption = loraPowerConsumption;
        this.blePowerConsumption = blePowerConsumption;
        this.gpsPowerConsumption = gpsPowerConsumption;
        this.wifiPowerConsumption = wifiPowerConsumption;
        this.batteryVoltage = batteryVoltage;
}

module.exports = {
    HealthStatus: HealthStatus
}

/***/ }),

/***/ 51:
/***/ ((module) => {

module.exports = Object.freeze({
    BLE_NOT_RESPONDING: "BLE_NOT_RESPONDING",
    INTERNAL_ERROR: "INTERNAL_ERROR",
    SHARED_ANTENNA_NOT_AVAILABLE: "SHARED_ANTENNA_NOT_AVAILABLE",
    SCAN_ALREADY_ON_GOING: "SCAN_ALREADY_ON_GOING",
    NO_BEACON_DETECTED: "NO_BEACON_DETECTED",
    HARDWARE_INCOMPATIBILITY: "HARDWARE_INCOMPATIBILITY",
    UNKNOWN_BLE_FIRMWARE_VERSION: "UNKNOWN_BLE_FIRMWARE_VERSION"
});

/***/ }),

/***/ 107:
/***/ ((module) => {

function MeasuredTemperature(state, max, min, highCounter, lowCounter){
        this.state = state;
        this.max = max;
        this.min = min;
        this.highCounter = highCounter;
        this.lowCounter = lowCounter;
}

module.exports = {
    MeasuredTemperature: MeasuredTemperature,
    TemperatureState: {
        NORMAL: "NORMAL",
        HIGH: "HIGH",
        LOW: "LOW",
        FEATURE_NOT_ACTIVATED: "FEATURE_NOT_ACTIVATED"
    }
}

/***/ }),

/***/ 111:
/***/ ((module) => {

function AbeewayDownlinkPayload(downMessageType, 
        ackToken,
        modeValue,
        debugCommandType,
        listParameterID,
        listParameterIDNames,
        statusType,
        setParameters,
        resetAction,
        optionalCommand,
        txPowerIndex,
        melodyId,
        buzzerDuration,
        proximityMessage,
        angleDetectionControl,
        bleAdvertisementDuration,
        startupModes,
        sms,
        payload) {
        this.downMessageType = downMessageType;
        this.ackToken = ackToken;
        this.modeValue = modeValue;
        this.debugCommandType = debugCommandType;
        this.listParameterID = listParameterID;
        this.listParameterIDNames = listParameterIDNames;
        this.statusType = statusType;
        this.setParameters = setParameters;
        this.resetAction = resetAction;
        this.optionalCommand = optionalCommand;
        this.txPowerIndex = txPowerIndex;
        this.melodyId = melodyId;
        this.buzzerDuration = buzzerDuration;
        this.proximityMessage = proximityMessage;
        this.angleDetectionControl = angleDetectionControl;
        this.bleAdvertisementDuration = bleAdvertisementDuration;
        this.startupModes = startupModes;
        this.sms = sms;
        this.payload = payload;
}

module.exports = {
    AbeewayDownlinkPayload: AbeewayDownlinkPayload
}

/***/ }),

/***/ 119:
/***/ ((module) => {

function ProximityWhiteListing (encrypted,
        rollingProximityIdentifier,
        list,
        recordStatus,
        solicited){
            this.encrypted = encrypted;
            this.rollingProximityIdentifier = rollingProximityIdentifier;
            this.list = list;
            this.recordStatus = recordStatus;
            this.solicited = solicited;
}

module.exports = {
    ProximityWhiteListing: ProximityWhiteListing,
    List: {
        PEER_LIST: "PEER_LIST",
        WARNING_LIST: "WARNING_LIST",
        ALERT_LIST: "ALERT_LIST"
    },
    RecordStatus: {
        NOT_WHITE_LISTED: "NOT_WHITE_LISTED",
        WHITE_LISTED: "WHITE_LISTED"
    }
}

/***/ }),

/***/ 185:
/***/ ((module) => {

"use strict";
module.exports = /*#__PURE__*/JSON.parse('[{"firmwareVersion":"2.2","profiles":[{"id":3,"name":"Intensive","namespace":"TPL_B2Capp","description":"Position every minute.","translations":[{"language":"FR","name":"Intensif","description":"Une position chaque minute."}],"parameters":{"mode":"MOTION_TRACKING","trackingUlPeriod":60,"periodicPositionInterval":1800}},{"id":2,"name":"Eco","namespace":"TPL_B2Capp","description":"Position every 20 minutes.","translations":[{"language":"FR","name":"Eco","description":"Position chaque 20 minutes."}],"parameters":{"mode":"MOTION_TRACKING","trackingUlPeriod":1200,"periodicPositionInterval":3600}},{"id":1,"name":"Sleep","namespace":"TPL_B2Capp","description":"No tracking, only a periodic position sent every hour","translations":[{"language":"FR","name":"Veille","description":"Pas de suivi, seulement des positions périodiques chaque heure."}],"parameters":{"mode":"STAND_BY","periodicPositionInterval":3600}}]}]');

/***/ }),

/***/ 186:
/***/ ((module) => {

function StartupModes(manufacturing,
        shipping){
            this.manufacturing = manufacturing;
            this.shipping = shipping;
}

module.exports = {
		StartupModes: StartupModes
	}


/***/ }),

/***/ 200:
/***/ ((module) => {

module.exports = Object.freeze({
    RESET_DEVICE: "RESET_DEVICE",
    DELETE_CONFIG_RESET: "DELETE_CONFIG_RESET",
    DELETE_CONFIG_BLE_BOND_RESET: "DELETE_CONFIG_BLE_BOND_RESET"
});

/***/ }),

/***/ 231:
/***/ ((module) => {

/*export default class ProximityNotification{
    constructor(notificationType,
        encrypted,
        recordAction,
        rollingProximityIdentifier,
        closestDistanceRecording,
        distanceAverageRecorded,
        cumulatedExposure,
        metadata,
        cumulatedContactDuration,
        currentDailyExposure){
            this.notificationType = notificationType;
            this.encrypted = encrypted;
            this.recordAction = recordAction;
            this.rollingProximityIdentifier = rollingProximityIdentifier;
            this.closestDistanceRecording = closestDistanceRecording;
            this.distanceAverageRecorded = distanceAverageRecorded;
            this.cumulatedExposure = cumulatedExposure;
            this.metadata = metadata;
            this.cumulatedContactDuration = cumulatedContactDuration;
            this.currentDailyExposure = currentDailyExposure;
    }
}

export const NotificationType = {
    WARNING_MESSAGE: "WARNING_MESSAGE",
    ALERT_MESSAGE: "ALERT_MESSAGE",
    RECORD_MESSAGE: "RECORD_MESSAGE"
};

export const RecordAction = {
    RECORD_START: "RECORD_START",
    RECORD_UPDATE: "RECORD_UPDATE",
    RECORD_STOP: "RECORD_STOP"
};*/
// constructor function for the ProximityNotification class
function ProximityNotification(notificationType,
    encrypted,
    recordAction,
    rollingProximityIdentifier,
    closestDistanceRecording,
    distanceAverageRecorded,
    cumulatedExposure,
    metadata,
    cumulatedContactDuration,
    currentDailyExposure){
        this.notificationType = notificationType;
        this.encrypted = encrypted;
        this.recordAction = recordAction;
        this.rollingProximityIdentifier = rollingProximityIdentifier;
        this.closestDistanceRecording = closestDistanceRecording;
        this.distanceAverageRecorded = distanceAverageRecorded;
        this.cumulatedExposure = cumulatedExposure;
        this.metadata = metadata;
        this.cumulatedContactDuration = cumulatedContactDuration;
        this.currentDailyExposure = currentDailyExposure;
}

module.exports = {
    ProximityNotification: ProximityNotification,
    NotificationType: {
        WARNING_MESSAGE: "WARNING_MESSAGE",
        ALERT_MESSAGE: "ALERT_MESSAGE",
        RECORD_MESSAGE: "RECORD_MESSAGE"
    },
    RecordAction: {
        RECORD_START: "RECORD_START",
        RECORD_UPDATE: "RECORD_UPDATE",
        RECORD_STOP: "RECORD_STOP"
    }
}

/***/ }),

/***/ 281:
/***/ ((module) => {

module.exports = Object.freeze({
    DEBUG_CRASH_INFORMATION: "DEBUG_CRASH_INFORMATION",
    TX_POWER_INDEX_VALUE: "TX_POWER_INDEX_VALUE",
    UPLINK_LENGTH_ERR: "UPLINK_LENGTH_ERR",
    GENERIC_ERROR: "GENERIC_ERROR",
    SPECIFIC_FIRMWARE_PARAMETERS: "SPECIFIC_FIRMWARE_PARAMETERS",
    UNKNOWN: "UNKNOWN"
});

/***/ }),

/***/ 336:
/***/ ((module) => {

module.exports = Object.freeze({
    GPS: "GPS",
    GPS_TIMEOUT: "GPS_TIMEOUT",
    ENCRYPTED_WIFI_BSSIDS: "ENCRYPTED_WIFI_BSSIDS",
    WIFI_TIMEOUT: "WIFI_TIMEOUT",
    WIFI_FAILURE: "WIFI_FAILURE",
    XGPS_DATA: "XGPS_DATA",
    XGPS_DATA_WITH_GPS_SW_TIME: "XGPS_DATA_WITH_GPS_SW_TIME",
    BLE_BEACON_SCAN: "BLE_BEACON_SCAN",
    BLE_BEACON_FAILURE: "BLE_BEACON_FAILURE",
    WIFI_BSSIDS_WITH_NO_CYPHER: "WIFI_BSSIDS_WITH_NO_CYPHER",
    BLE_BEACON_SCAN_SHORT_ID: "BLE_BEACON_SCAN_SHORT_ID",
    BLE_BEACON_SCAN_LONG_ID: "BLE_BEACON_SCAN_LONG_ID",
    UNKNOWN: "UNKNOWN"
});

/***/ }),

/***/ 384:
/***/ ((module) => {

function ProximityDailyResponse(dayIdentifier,
        dailyAlert,
        dailyWarning,
        dailyExposure){
            this.dayIdentifier = dayIdentifier;
            this.dailyAlert = dailyAlert;
            this.dailyWarning = dailyWarning;
            this.dailyExposure = dailyExposure;
}

module.exports = {
    ProximityDailyResponse: ProximityDailyResponse
}

/***/ }),

/***/ 408:
/***/ ((module) => {

module.exports = Object.freeze({
    SWITCH_ON: "SWITCH_ON",
    SWITCH_OFF: "SWITCH_OFF",
    FLAT_BATTERY: "FLAT_BATTERY",
    ALERT: "ALERT",
    SOS_MODE: "SOS_MODE",
    SOS_MODE_CLEAR: "SOS_MODE_CLEAR",
    RESET: "RESET",
    BLE_ADVERTISING: "BLE_ADVERTISING",
    BLE_BONDED: "BLE_BONDED",
    BLE_DEBONDED: "BLE_DEBONDED",
    BLE_LINK_LOSS: "BLE_LINK_LOSS",
    PROX_WARNING: "PROX_WARNING",
    PROX_WARNING_REMINDER: "PROX_WARNING_REMINDER",
    PROX_ALARM: "PROX_ALARM",
    PROX_ALARM_REMINDER: "PROX_ALARM_REMINDER"
});

/***/ }),

/***/ 412:
/***/ ((module) => {

function ScanCollection(scanType,
        again,
        dataFormat,
        fragmentIdentification,
        collectionIdentifier,
        hash,
        beaconIdData,
        macAddressData){
            this.scanType = scanType;
            this.again = again;
            this.dataFormat = dataFormat;
            this.fragmentIdentification = fragmentIdentification;
            this.collectionIdentifier = collectionIdentifier;
            this.hash = hash;
            this.beaconIdData = beaconIdData;
            this.macAddressData = macAddressData;
}

module.exports = {
    ScanCollection: ScanCollection,
    ScanType: {
        BLE_BEACONS: "BLE_BEACONS",
        WIFI_BSSID: "WIFI_BSSID",
        BLE_BEACONS_COLLECTION: "BLE_BEACONS_COLLECTION"
    },
    DataFormat: {
        BEACON_ID: "BEACON_ID",
        MAC_ADDRESS: "MAC_ADDRESS"
    }
}

/***/ }),

/***/ 415:
/***/ ((__unused_webpack_module, exports) => {

function extractPoints(input) {
    let points = {};

    if(input.message == null){
        return points;
    }

    if (input.message.batteryLevel != null) {
        points.batteryLevel = {unitId: "%", record: input.message.batteryLevel};
    }
    if (input.message.temperatureMeasure != null) {
        points.temperature = {unitId: "Cel", record: input.message.temperatureMeasure};
    }
    if (input.message.batteryVoltage != null) {
        points.batteryVoltage = {unitId: "V", record: input.message.batteryVoltage};
    }
    if (input.message.angleDetection != null && input.message.angleDetection.angle != null) {
        points.angle = {unitId: "deg", record: input.message.angleDetection.angle};
    }
    if (input.message.gpsLatitude != null && input.message.gpsLongitude) {
        points.location = {unitId: "GPS", record: [input.message.gpsLongitude,input.message.gpsLatitude]};
    }
    if (input.message.gpsAltitude != null) {
        points.altitude = {unitId: "m", record: input.message.gpsAltitude};
    }
    if (input.message.horizontalAccuracy != null) {
        points.accuracy = {unitId: "m", record: input.message.horizontalAccuracy};
    }
    if (input.message.age != null) {
        points.age = {unitId: "s", record: input.message.age};
    }
    if (input.message.gpsSpeedOverGround != null) {
        points.speed = {unitId: "m/s", record: Number((input.message.gpsSpeedOverGround / 100).toFixed(2))};
    }

    return points;
}

exports.extractPoints = extractPoints;

/***/ }),

/***/ 420:
/***/ ((module) => {

function BeaconIdInfo(beaconId,rssi){
    this.beaconId = beaconId;
    this.rssi = rssi;
}

module.exports = {
    BeaconIdInfo: BeaconIdInfo
}

/***/ }),

/***/ 432:
/***/ ((module) => {

function Sms(destinationId,
		senderId,
        message){
            this.destinationId = destinationId;
            this.senderId = senderId;
            this.message = message;
}

module.exports = {
    Sms: Sms
}

/***/ }),

/***/ 465:
/***/ ((module) => {

function ProximityDailyReport(dailyAlertDay0,
        dailyWarningDay0,
        dailyExposureDay0,
        dailyAlertDay1,
        dailyWarningDay1,
        dailyExposureDay1,
        dailyAlertDay2,
        dailyWarningDay2,
        dailyExposureDay2){
            this.dailyAlertDay0 = dailyAlertDay0;
            this.dailyWarningDay0 = dailyWarningDay0;
            this.dailyExposureDay0 = dailyExposureDay0;
            this.dailyAlertDay1 = dailyAlertDay1;
            this.dailyWarningDay1 = dailyWarningDay1;
            this.dailyExposureDay1 = dailyExposureDay1;
            this.dailyAlertDay2 = dailyAlertDay2;
            this.dailyWarningDay2 = dailyWarningDay2;
            this.dailyExposureDay2 = dailyExposureDay2;
}

module.exports = {
    ProximityDailyReport: ProximityDailyReport
}

/***/ }),

/***/ 508:
/***/ ((module) => {

module.exports = Object.freeze({
    RESET_COUNTERS: "RESET_COUNTERS",
    RESET_TEMPERATURES: "RESET_TEMPERATURES",
    RESET_COUNTERS_AND_TEMPERATURES: "RESET_COUNTERS_AND_TEMPERATURES"
});

/***/ }),

/***/ 552:
/***/ ((module) => {

module.exports = Object.freeze({
    FIX_2D: "FIX_2D",
    FIX_3D: "FIX_3D",
});

/***/ }),

/***/ 635:
/***/ ((module) => {

"use strict";
module.exports = /*#__PURE__*/JSON.parse('[{"firmwareVersion":"2.0","uplinkPort":18,"firmwareParameters":[{"driverParameterName":"trackingUlPeriod","firmwareConfigurationFileParameterName":"ul_period","bleId":0,"id":0,"defaultValue":120,"description":"Period of position or activity messages in motion, start/end, activity or permanent operating mode.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":60,"maximum":86400}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"loralivePeriod","firmwareConfigurationFileParameterName":"lora_period","bleId":1,"id":1,"defaultValue":600,"description":"Period of LoRa heartbeat messages.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":300,"maximum":86400}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"energyStatusPeriod","firmwareConfigurationFileParameterName":"pw_stat_period","bleId":2,"id":2,"description":"Period of energy status messages.","defaultValue":86400,"parameterType":{"type":"ParameterTypeNumber","range":{"minimum":300,"maximum":604800},"additionalValues":[0]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"periodicPositionInterval","firmwareConfigurationFileParameterName":"periodic_pos_period","bleId":3,"id":3,"defaultValue":0,"description":"Period of the periodic position report.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":900,"maximum":604800},"additionalValues":[0]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"gpsScanMode","firmwareConfigurationFileParameterName":"","bleId":4,"id":4,"defaultValue":0,"description":"GPS scan profile for the geoloc engine. Feature not implemented yet","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":0}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"geolocSensorProfile","firmwareConfigurationFileParameterName":"geoloc_sensor","bleId":5,"id":5,"defaultValue":2,"description":"Geolocation sensor profile used in main operating mode and SOS mode.","parameterType":{"type":"ParameterTypeString","possibleValues":["WIFI_ONLY","GPS_ONLY","XGPS_ONLY","WIFI_FALLBACK_XGPS","SELF_GOVERNING_HISTORY","SELF_GOVERNING_TIMEOUT","WGPS_ONLY","WXGPS_ONLY","WGPS_WXGPS_FAILURE","WGPS_WXGPS_TIMEOUT","BLE","BGPS_ONLY"],"firmwareValues":[0,1,2,3,4,5,6,7,8,9,10,11]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"oneshotGeolocMethod","firmwareConfigurationFileParameterName":"geoloc_method","bleId":6,"id":6,"defaultValue":2,"description":"Geolocation policy used for the side operating modes.","parameterType":{"type":"ParameterTypeString","possibleValues":["WIFI","GPS","XGPS","WGPS","WXGPS","BLE","BGPS"],"firmwareValues":[0,1,2,3,4,5,6]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"extAntennaProfile","firmwareConfigurationFileParameterName":"antenna","bleId":7,"id":7,"defaultValue":0,"description":"Configuration of GPS antenna.","parameterType":{"type":"ParameterTypeString","possibleValues":["PRINTED","CERAMIC","DYNAMIC"],"firmwareValues":[0,1,2]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"motionStartEndNbTx","firmwareConfigurationFileParameterName":"motion_nb_pos","bleId":8,"id":8,"defaultValue":3,"description":"Number of positions to report during motion events (motion start/end mode only).","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":1,"maximum":60}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"gpsTimeout","firmwareConfigurationFileParameterName":"gps_timeout","bleId":9,"id":9,"defaultValue":120,"description":"Timeout for GPS scans before sending a GPS timeout message.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":30,"maximum":300}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"xgpsTimeout","firmwareConfigurationFileParameterName":"agps_timeout","bleId":10,"id":10,"defaultValue":55,"description":"Timeout for LPGPS scans before sending the timeout message.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":30,"maximum":250}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"gpsEHPE","firmwareConfigurationFileParameterName":"gps_ehpe","bleId":11,"id":11,"defaultValue":20,"description":"Acceptable GPS horizontal error for GPS geolocation.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":100}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"gpsConvergence","firmwareConfigurationFileParameterName":"gps_convergence","bleId":12,"id":12,"defaultValue":30,"description":"Time let to the GPS module to refine the calculated position.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":300}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"configFlags","firmwareConfigurationFileParameterName":"config_flags","bleId":13,"id":13,"defaultValue":95,"description":"Configuration flags.","parameterType":{"type":"ParameterTypeBitMap","properties":[{"name":"framePendingMechanism","type":"PropertyBoolean","description":"false: Frame pending mechanism is disabled. true: Frame pending mechanism is enabled. "},{"name":"buttonPressToTurnOFF","type":"PropertyBoolean","description":"false: Cannot turn OFF device with a button press.true: Can turn OFF device with a button press. "},{"name":"doubleClickIsSosModeOrAlert","type":"PropertyBoolean","description":"false: Double button click triggers an Alert. true: Double button click starts SOS mode, another double click stops it."},{"name":"downlinkSetParameterConfirmation","type":"PropertyBoolean","description":"false: Confirmation uplink mechanism is disabled. true: Confirmation uplink mechanism is enabled. Factory default value"},{"name":"wifiPayloadWithNoCypher","type":"PropertyBoolean","description":" false: Wifi payload is cyphered.  true: Wifi payload is not cyphered."},{"name":"bleAdvertisingAtStart","type":"PropertyBoolean","description":"false: BLE advertising is disabled. Factory default value.  true: BLE advertising is enabled."},{"name":"selectWifiScanOrGeolocStartMessage","type":"PropertyBoolean","description":"false: Enable geoloc start event message when starting a geoloc sequence. true: Enable Wifi scan when starting a geoloc sequence."},{"name":"ledBlinkWithGpsFix","type":"PropertyBoolean","description":"false: No blink when a GPS fix is received. Factory default value.true: LED Blink when a GPS fix is received."},{"name":"startMotionEventUplink","type":"PropertyBoolean","description":" false: Start Motion event payload is disabled. Factory default value.true: Start Motion event payload is enabled."},{"name":"endMotionEventUplink","type":"PropertyBoolean","description":" false: End Motion event payload is disabled. Factory default value. true: End Motion event payload is enabled."},{"name":"otaJoinWhenLeavingModeOff","type":"PropertyBoolean","description":"false: Disable OTA join when leaving mode OFF. Factory default value.true: Enable OTA join when leaving mode OFF."},{"name":"rejectAsymmetricPairing","type":"PropertyBoolean","description":"false: Accept asymmetric BLE pairing. Factory default value.  true: Reject asymmetric BLE pairing."},{"name":"enableLongWifiPayload","type":"PropertyBoolean","description":"false: Long wifi payload is disabled. Factory default value. true: Long wifi payload is enabled."},{"name":"collectionLongReport","type":"PropertyBoolean","description":"false: The usual payload size is used (36 bytes). true: The number of entries carried in the uplink is larger and use a payload size of 91 bytes."},{"name":"autoStart","type":"PropertyBoolean","description":"false: Once LoRa join succeeds, the user needs to make another long press to actually start in the configured operating mode.true: Once LoRa join succeeds, the device automatically starts without requiring a long press."},{"name":"forbidModeOff","type":"PropertyBoolean","description":"false: Mode OFF is allowed. Factory default value. true: Mode OFF is forbidden. When Mode OFF is requested, the device goes in Standby mode instead."}],"bitMap":[{"type":"BitMapValue","valueFor":"framePendingMechanism","bitShift":0,"length":1},{"type":"BitMapValue","valueFor":"buttonPressToTurnOFF","bitShift":1,"length":1},{"type":"BitMapValue","valueFor":"doubleClickIsSosModeOrAlert","bitShift":2,"length":1},{"type":"BitMapValue","valueFor":"downlinkSetParameterConfirmation","bitShift":3,"length":1},{"type":"BitMapValue","valueFor":"wifiPayloadWithNoCypher","bitShift":4,"length":1},{"type":"BitMapValue","valueFor":"bleAdvertisingAtStart","bitShift":5,"length":1},{"type":"BitMapValue","valueFor":"selectWifiScanOrGeolocStartMessage","bitShift":6,"length":1},{"type":"BitMapValue","valueFor":"ledBlinkWithGpsFix","bitShift":7,"length":1},{"type":"BitMapValue","valueFor":"startMotionEventUplink","bitShift":8,"length":1},{"type":"BitMapValue","valueFor":"endMotionEventUplink","bitShift":9,"length":1},{"type":"BitMapValue","valueFor":"otaJoinWhenLeavingModeOff","bitShift":10,"length":1},{"type":"BitMapValue","valueFor":"rejectAsymmetricPairing","bitShift":11,"length":1},{"type":"BitMapValue","valueFor":"enableLongWifiPayload","bitShift":12,"length":1},{"type":"BitMapValue","valueFor":"collectionLongReport","bitShift":13,"length":1},{"type":"BitMapValue","valueFor":"autoStart","bitShift":14,"length":1},{"type":"BitMapValue","valueFor":"forbidModeOff","bitShift":15,"length":1}]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"transmitStrat","firmwareConfigurationFileParameterName":"transmit_strat","bleId":14,"id":14,"defaultValue":2,"description":"The transmit strategy for the LoRa network.","parameterType":{"type":"ParameterTypeString","possibleValues":["SINGLE_FIXED","SINGLE_RANDOM","DOUBLE_RANDOM","DOUBLE_FIXED","NETWORK_ADR","CUSTOM_STRATEGY"],"firmwareValues":[0,1,2,3,4,5]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"bleBeaconCount","firmwareConfigurationFileParameterName":"ble_beacon_cnt","bleId":15,"id":15,"defaultValue":4,"description":"This parameter provides the maximum number of BLE beacons to provide in payload.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":4}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"bleBeaconTimeout","firmwareConfigurationFileParameterName":"ble_beacon_timeout","bleId":16,"id":16,"defaultValue":3,"description":"BLE scan duration.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":1,"maximum":5}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"gpsStandbyTimeout","firmwareConfigurationFileParameterName":"gps_standby_timeout","bleId":17,"id":17,"defaultValue":1800,"description":"Duration of the GPS standby mode before going OFF.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":28800}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"confirmedUlBitmap","firmwareConfigurationFileParameterName":"confirmed_ul_bitmap","bleId":18,"id":18,"defaultValue":0,"description":"Bitmap enabling the LoRaWAN confirmation of specific type of uplink message.","parameterType":{"type":"ParameterTypeBitMap","properties":[{"name":"framePending","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of frame pending message. true: Enables the LoRaWAN confirmation of frame pending message"},{"name":"position","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of position message. true: Enables the LoRaWAN confirmation of position message"},{"name":"energyStatus","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of energyStatus message. true: Enables the LoRaWAN confirmation of energyStatus message"},{"name":"heartbeat","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of heartbeat message. true: Enables the LoRaWAN confirmation of heartbeat message"},{"name":"activityStatus","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of activityStatus message. true: Enables the LoRaWAN confirmation of activityStatus message"},{"name":"configuration","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of configuration message. true: Enables the LoRaWAN confirmation of configuration message"},{"name":"shockDetection","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of shockDetection message. true: Enables the LoRaWAN confirmation of shockDetection message"},{"name":"shutdown","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of shutdown message. true: Enables the LoRaWAN confirmation of shutdown message"},{"name":"event","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of event message. true: Enables the LoRaWAN confirmation of event message"},{"name":"scanCollection","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of scanCollection message. true: Enables the LoRaWAN confirmation of scanCollection message"},{"name":"debug","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of debug message. true: Enables the LoRaWAN confirmation of debug message"}],"bitMap":[{"type":"BitMapValue","valueFor":"framePending","bitShift":0,"length":1},{"type":"BitMapValue","valueFor":"position","bitShift":3,"length":1},{"type":"BitMapValue","valueFor":"energyStatus","bitShift":4,"length":1},{"type":"BitMapValue","valueFor":"heartbeat","bitShift":5,"length":1},{"type":"BitMapValue","valueFor":"activityStatus","bitShift":7,"length":1},{"type":"BitMapValue","valueFor":"shockDetection","bitShift":7,"length":1},{"type":"BitMapValue","valueFor":"configuration","bitShift":7,"length":1},{"type":"BitMapValue","valueFor":"shutdown","bitShift":9,"length":1},{"type":"BitMapValue","valueFor":"event","bitShift":10,"length":1},{"type":"BitMapValue","valueFor":"scanCollection","bitShift":11,"length":1},{"type":"BitMapValue","valueFor":"debug","bitShift":15,"length":1}]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"confirmedUlRetry","firmwareConfigurationFileParameterName":"confirmed_ul_retry","bleId":19,"id":19,"defaultValue":3,"description":"The number of retries for each confirmed uplink when the confirmation is not received.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":8}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"motionSensitivity","firmwareConfigurationFileParameterName":"motion_sensitivity","bleId":20,"id":20,"defaultValue":0,"description":"Allows a fine tuning of the acceleration intensity to trigger a motion event.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":300}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"shockDetection","firmwareConfigurationFileParameterName":"shock_detection","bleId":21,"id":21,"defaultValue":0,"description":"This parameter provides the configuration of the sensitivity of the shock detection from 1 to 100%.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":255}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"periodicActivityPeriod","firmwareConfigurationFileParameterName":"periodic_activity_period","bleId":22,"id":22,"defaultValue":0,"description":"Period of the periodic activity report.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":1800,"maximum":86400},"additionalValues":[0]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"motionDuration","firmwareConfigurationFileParameterName":"motion_duration","bleId":23,"id":23,"defaultValue":120,"description":"Defines the delay needed without any motion detection to generate a motion end event.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":60,"maximum":3600}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"geofencingScanPeriod","firmwareConfigurationFileParameterName":"geofencing_scan_period","bleId":24,"id":24,"defaultValue":0,"description":"The geofencing scan period.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":300}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"geofencingUlPeriod","firmwareConfigurationFileParameterName":"geofencing_ul_period","bleId":25,"id":25,"defaultValue":60,"description":"Period for position message reporting while in Geofencing Active state.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":60,"maximum":86400}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"bleRssiFilter","firmwareConfigurationFileParameterName":"ble_rssi_filter","bleId":26,"id":26,"defaultValue":-100,"description":"RSSI value to filter BLE beacons with BLE-GPS geolocation mode.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":-100,"maximum":-40}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"temperatureHigh","firmwareConfigurationFileParameterName":"temperature_high","bleId":27,"id":27,"defaultValue":255,"description":"Configure the high threshold temperature.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":-44,"maximum":85},"additionalValues":[255]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"temperatureLow","firmwareConfigurationFileParameterName":"temperature_low","bleId":28,"id":28,"defaultValue":255,"description":"Configure the low threshold temperature.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":-44,"maximum":85},"additionalValues":[255]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"temperatureAction","firmwareConfigurationFileParameterName":"temperature_action","bleId":29,"id":29,"defaultValue":0,"description":"Configure the action to be done when entering critical state.","parameterType":{"type":"ParameterTypeString","possibleValues":["NO_ACTION","TEMPERATURE_HIGH","TEMPERATURE_LOW","TEMPERATURE_HIGH_TEMPERATURE_LOW"],"firmwareValues":[0,1,2,3]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"transmitStratCustom","firmwareConfigurationFileParameterName":"transmit_strat_custom","bleId":30,"id":30,"defaultValue":0,"description":"Configure the custom transmit strategy.","parameterType":{"type":"ParameterTypeBitMap","properties":[{"name":"ADREnabled","type":"PropertyBoolean","description":"false: ADR is enabled. true: ADR is disabled."},{"name":"transmissionType","type":"PropertyString","description":"defines the transmission type","possibleValues":["SINGLE","DOUBLE"],"firmwareValues":[0,1]},{"name":"firstTransmissionDatarateDistribution","type":"PropertyString","description":"Defines the selection type TX1","possibleValues":["RANDOM","BELL_CURVE","RING"],"firmwareValues":[0,1,2]},{"name":"secondTransmissionDatarateDistribution","type":"PropertyString","description":"Defines the selection type TX2","possibleValues":["RANDOM","BELL_CURVE","RING"],"firmwareValues":[0,1,2]},{"name":"firstTransmissionDatarate","type":"PropertyObject","properties":[{"name":"dr0","type":"PropertyBoolean","description":"false: dr0 is disabled. true: dr0 is enabled."},{"name":"dr1","type":"PropertyBoolean","description":"false: dr1 is disabled. true: dr1 is enabled."},{"name":"dr2","type":"PropertyBoolean","description":"false: dr2 is disabled. true: dr2 is enabled."},{"name":"dr3","type":"PropertyBoolean","description":"false: dr3 is disabled. true: dr3 is enabled."},{"name":"dr4","type":"PropertyBoolean","description":"false: dr4 is disabled. true: dr4 is enabled."},{"name":"dr5","type":"PropertyBoolean","description":"false: dr5 is disabled. true: dr5 is enabled."},{"name":"dr6","type":"PropertyBoolean","description":"false: dr6 is disabled. true: dr6 is enabled."},{"name":"dr7","type":"PropertyBoolean","description":"false: dr7 is disabled. true: dr7 is enabled."}]},{"name":"secondTransmissionDatarate","type":"PropertyObject","properties":[{"name":"dr0","type":"PropertyBoolean","description":"false: dr0 is disabled. true: dr0 is enabled."},{"name":"dr1","type":"PropertyBoolean","description":"false: dr1 is disabled. true: dr1 is enabled."},{"name":"dr2","type":"PropertyBoolean","description":"false: dr2 is disabled. true: dr2 is enabled."},{"name":"dr3","type":"PropertyBoolean","description":"false: dr3 is disabled. true: dr3 is enabled."},{"name":"dr4","type":"PropertyBoolean","description":"false: dr4 is disabled. true: dr4 is enabled."},{"name":"dr5","type":"PropertyBoolean","description":"false: dr5 is disabled. true: dr5 is enabled."},{"name":"dr6","type":"PropertyBoolean","description":"false: dr6 is disabled. true: dr6 is enabled."},{"name":"dr7","type":"PropertyBoolean","description":"false: dr7 is disabled. true: dr7 is enabled."}]}],"bitMap":[{"type":"BitMapValue","valueFor":"ADREnabled","bitShift":0,"inverted":true,"length":1},{"type":"BitMapValue","valueFor":"transmissionType","bitShift":1,"length":1},{"type":"BitMapValue","valueFor":"firstTransmissionDatarateDistribution","bitShift":2,"length":3},{"type":"BitMapValue","valueFor":"secondTransmissionDatarateDistribution","bitShift":5,"length":3},{"valueFor":"firstTransmissionDatarate","type":"BitMapObject","values":[{"type":"BitMapValue","valueFor":"dr0","bitShift":8,"length":1},{"type":"BitMapValue","valueFor":"dr1","bitShift":9,"length":1},{"type":"BitMapValue","valueFor":"dr2","bitShift":10,"length":1},{"type":"BitMapValue","valueFor":"dr3","bitShift":11,"length":1},{"type":"BitMapValue","valueFor":"dr4","bitShift":12,"length":1},{"type":"BitMapValue","valueFor":"dr5","bitShift":13,"length":1},{"type":"BitMapValue","valueFor":"dr6","bitShift":14,"length":1},{"type":"BitMapValue","valueFor":"dr7","bitShift":15,"length":1}]},{"valueFor":"secondTransmissionDatarate","type":"BitMapObject","values":[{"type":"BitMapValue","valueFor":"dr0","bitShift":16,"length":1},{"type":"BitMapValue","valueFor":"dr1","bitShift":17,"length":1},{"type":"BitMapValue","valueFor":"dr2","bitShift":18,"length":1},{"type":"BitMapValue","valueFor":"dr3","bitShift":19,"length":1},{"type":"BitMapValue","valueFor":"dr4","bitShift":20,"length":1},{"type":"BitMapValue","valueFor":"dr5","bitShift":21,"length":1},{"type":"BitMapValue","valueFor":"dr6","bitShift":22,"length":1},{"type":"BitMapValue","valueFor":"dr7","bitShift":23,"length":1}]}]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"networkTimeoutCheck","firmwareConfigurationFileParameterName":"network_timeout_check","bleId":31,"id":31,"defaultValue":432000,"description":"Time without received downlink, before asking a link check request.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":86400,"maximum":5184000},"additionalValues":[0]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"networkTimeoutReset","firmwareConfigurationFileParameterName":"network_timeout_reset","bleId":32,"id":32,"defaultValue":172800,"description":"Time after network_timeout_check without received downlink before the tracker resets.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":21600,"maximum":2592000},"additionalValues":[0]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"collectionScanType","firmwareConfigurationFileParameterName":"collection_scan_type","bleId":33,"id":33,"defaultValue":0,"description":"Collection san type used.","parameterType":{"type":"ParameterTypeString","possibleValues":["NO_COLLECTION_SCAN","BLE_BEACONS","WIFI_BSSID"],"firmwareValues":[0,1,2]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"collectionNbEntry","firmwareConfigurationFileParameterName":"collection_nb_entry","bleId":34,"id":34,"defaultValue":20,"description":"Maximum number of elements to report in collection payloads after a scan.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":1,"maximum":20}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"collectionBleFilterType","firmwareConfigurationFileParameterName":"collection_ble_filter_type","bleId":35,"id":35,"defaultValue":0,"description":"Beacon type to scan and report when collection scan type is BLE.","parameterType":{"type":"ParameterTypeString","possibleValues":["NO_FILTER","EDDYSTONE_UID","EDDYSTONE_URL","ALL_EDDYSTONE","IBEACON_ONLY","ALTBEACON_ONLY"],"firmwareValues":[0,1,2,3,4,5]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"collectionBleFilterMain1","firmwareConfigurationFileParameterName":"collection_ble_filter_main_1","bleId":36,"id":36,"defaultValue":0,"description":"First part of the main BLE filter.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":4294967295}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"collectionBleFilterMain2","firmwareConfigurationFileParameterName":"collection_ble_filter_main_2","bleId":37,"id":37,"defaultValue":0,"description":"Second part of the main BLE filter.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":4294967295}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"collectionBleFilterSecValue","firmwareConfigurationFileParameterName":"collection_ble_filter_sec_value","bleId":38,"id":38,"defaultValue":0,"description":"BLE secondary value.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":4294967295}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"collectionBleFilterSecMask","firmwareConfigurationFileParameterName":"collection_ble_filter_sec_mask","bleId":39,"id":39,"defaultValue":0,"description":"BLE secondary mask.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":4294967295}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"batteryCapacity","firmwareConfigurationFileParameterName":"battery_capacity","bleId":40,"id":40,"defaultValue":-1,"description":"Battery setting.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":65535},"additionalValues":[-1]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"reedSwitchConfiguration","firmwareConfigurationFileParameterName":"reed_switch_configuration","bleId":41,"id":41,"defaultValue":1,"description":"Reed switch setting","parameterType":{"type":"ParameterTypeString","possibleValues":["DISABLE_REED_SWITCH","NORMAL_REED_SWITCH","BUTTON_REED_SWITCH"],"firmwareValues":[0,1,2]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"gnssConstellation","firmwareConfigurationFileParameterName":"gnss_constellation","bleId":42,"id":42,"defaultValue":4,"description":"Configure the GNSS constellations used by the GPS chip to compute a position.","parameterType":{"type":"ParameterTypeString","possibleValues":["GPS_ONLY","GLONASS_ONLY","GPS_GLONASS","GPS_GALILEO","GPS_GLONASS_GALILEO","BEIDOU_ONLY","GPS_BEIDOU"],"firmwareValues":[0,1,2,3,4,5,6]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"powerConsumption","id":247,"defaultValue":0,"description":"Represents the power consumption.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":4294967295}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"bleBond","id":248,"description":"Ble bond","defaultValue":0,"parameterType":{"type":"ParameterTypeString","possibleValues":["NOT_BONDED","BONDED","UNKNOWN"],"firmwareValues":[0,1,2]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"mode","id":249,"defaultValue":0,"description":"Defines the tracker operating mode.","parameterType":{"type":"ParameterTypeString","possibleValues":["STAND_BY","MOTION_TRACKING","PERMANENT_TRACKING","MOTION_START_END_TRACKING","ACTIVITY_TRACKING","OFF"],"firmwareValues":[0,1,2,3,4,5]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"xAccelerometerValue","id":250,"defaultValue":0,"readOnly":true,"description":"Represents the accelerometer X axis value in mg.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":-16000,"maximum":16000}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"yAccelerometerValue","id":251,"readOnly":true,"defaultValue":0,"description":"Represents the accelerometer Y axis value in mg.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":-16000,"maximum":16000}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"zAccelerometerValue","id":252,"readOnly":true,"defaultValue":0,"description":"Represents the accelerometer Z axis value in mg.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":-16000,"maximum":16000}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"bleFirmwareVersion","id":253,"readOnly":true,"defaultValue":0,"description":"Represents the ble firmware version.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":4294967295}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"firmwareVersion","id":254,"readOnly":true,"defaultValue":0,"description":"Represents the MCU firmware version.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":4294967295}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]}]},{"firmwareVersion":"2.1","uplinkPort":18,"firmwareParameters":[{"driverParameterName":"configFlags","firmwareConfigurationFileParameterName":"config_flags","bleId":13,"id":13,"defaultValue":95,"description":"Configuration flags.","parameterType":{"type":"ParameterTypeBitMap","properties":[{"name":"framePendingMechanism","type":"PropertyBoolean","description":"false: Frame pending mechanism is disabled. true: Frame pending mechanism is enabled. "},{"name":"buttonPressToTurnOFF","type":"PropertyBoolean","description":"false: Cannot turn OFF device with a button press.true: Can turn OFF device with a button press. "},{"name":"doubleClickIsSosModeOrAlert","type":"PropertyBoolean","description":"false: Double button click triggers an Alert. true: Double button click starts SOS mode, another double click stops it."},{"name":"downlinkSetParameterConfirmation","type":"PropertyBoolean","description":"false: Confirmation uplink mechanism is disabled. true: Confirmation uplink mechanism is enabled. Factory default value"},{"name":"wifiPayloadWithNoCypher","type":"PropertyBoolean","description":" false: Wifi payload is cyphered.  true: Wifi payload is not cyphered."},{"name":"bleAdvertisingAtStart","type":"PropertyBoolean","description":"false: BLE advertising is disabled. Factory default value.  true: BLE advertising is enabled."},{"name":"selectWifiScanOrGeolocStartMessage","type":"PropertyBoolean","description":"false: Enable geoloc start event message when starting a geoloc sequence. true: Enable Wifi scan when starting a geoloc sequence."},{"name":"ledBlinkWithGpsFix","type":"PropertyBoolean","description":"false: No blink when a GPS fix is received. Factory default value.true: LED Blink when a GPS fix is received."},{"name":"startMotionEventUplink","type":"PropertyBoolean","description":" false: Start Motion event payload is disabled. Factory default value.true: Start Motion event payload is enabled."},{"name":"endMotionEventUplink","type":"PropertyBoolean","description":" false: End Motion event payload is disabled. Factory default value. true: End Motion event payload is enabled."},{"name":"otaJoinWhenLeavingModeOff","type":"PropertyBoolean","description":"false: Disable OTA join when leaving mode OFF. Factory default value.true: Enable OTA join when leaving mode OFF."},{"name":"rejectAsymmetricPairing","type":"PropertyBoolean","description":"false: Accept asymmetric BLE pairing. Factory default value.  true: Reject asymmetric BLE pairing."},{"name":"enableLongWifiPayload","type":"PropertyBoolean","description":"false: Long wifi payload is disabled. Factory default value. true: Long wifi payload is enabled."},{"name":"collectionLongReport","type":"PropertyBoolean","description":"false: The usual payload size is used (36 bytes). true: The number of entries carried in the uplink is larger and use a payload size of 91 bytes."},{"name":"autoStart","type":"PropertyBoolean","description":"false: Once LoRa join succeeds, the user needs to make another long press to actually start in the configured operating mode.true: Once LoRa join succeeds, the device automatically starts without requiring a long press."},{"name":"forbidModeOff","type":"PropertyBoolean","description":"false: Mode OFF is allowed. Factory default value. true: Mode OFF is forbidden. When Mode OFF is requested, the device goes in Standby mode instead."},{"name":"sosModeSound","type":"PropertyBoolean","description":"false: SOS Mode Sound disabled. Factory default value. true: SOS Mode Sound enabled."},{"name":"automaticDatarateSelection","type":"PropertyBoolean","description":"false: Automatic Datarate Selection disabled.true: Automatic Datarate Selection enabled. Factory default value."}],"bitMap":[{"type":"BitMapValue","valueFor":"framePendingMechanism","bitShift":0,"length":1},{"type":"BitMapValue","valueFor":"buttonPressToTurnOFF","bitShift":1,"length":1},{"type":"BitMapValue","valueFor":"doubleClickIsSosModeOrAlert","bitShift":2,"length":1},{"type":"BitMapValue","valueFor":"downlinkSetParameterConfirmation","bitShift":3,"length":1},{"type":"BitMapValue","valueFor":"wifiPayloadWithNoCypher","bitShift":4,"length":1},{"type":"BitMapValue","valueFor":"bleAdvertisingAtStart","bitShift":5,"length":1},{"type":"BitMapValue","valueFor":"selectWifiScanOrGeolocStartMessage","bitShift":6,"length":1},{"type":"BitMapValue","valueFor":"ledBlinkWithGpsFix","bitShift":7,"length":1},{"type":"BitMapValue","valueFor":"startMotionEventUplink","bitShift":8,"length":1},{"type":"BitMapValue","valueFor":"endMotionEventUplink","bitShift":9,"length":1},{"type":"BitMapValue","valueFor":"otaJoinWhenLeavingModeOff","bitShift":10,"length":1},{"type":"BitMapValue","valueFor":"rejectAsymmetricPairing","bitShift":11,"length":1},{"type":"BitMapValue","valueFor":"enableLongWifiPayload","bitShift":12,"length":1},{"type":"BitMapValue","valueFor":"collectionLongReport","bitShift":13,"length":1},{"type":"BitMapValue","valueFor":"autoStart","bitShift":14,"length":1},{"type":"BitMapValue","valueFor":"forbidModeOff","bitShift":15,"length":1},{"type":"BitMapValue","valueFor":"sosModeSound","bitShift":16,"length":1},{"type":"BitMapValue","valueFor":"automaticDatarateSelection","bitShift":17,"length":1}]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"confirmedUlBitmap","firmwareConfigurationFileParameterName":"confirmed_ul_bitmap","bleId":18,"id":18,"defaultValue":0,"description":"Bitmap enabling the LoRaWAN confirmation of specific type of uplink message.","parameterType":{"type":"ParameterTypeBitMap","properties":[{"name":"framePending","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of frame pending message. true: Enables the LoRaWAN confirmation of frame pending message"},{"name":"position","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of position message. true: Enables the LoRaWAN confirmation of position message"},{"name":"energyStatus","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of energyStatus message. true: Enables the LoRaWAN confirmation of energyStatus message"},{"name":"heartbeat","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of heartbeat message. true: Enables the LoRaWAN confirmation of heartbeat message"},{"name":"activityStatus","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of activityStatus message. true: Enables the LoRaWAN confirmation of activityStatus message"},{"name":"configuration","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of configuration message. true: Enables the LoRaWAN confirmation of configuration message"},{"name":"shockDetection","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of shockDetection message. true: Enables the LoRaWAN confirmation of shockDetection message"},{"name":"shutdown","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of shutdown message. true: Enables the LoRaWAN confirmation of shutdown message"},{"name":"event","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of event message. true: Enables the LoRaWAN confirmation of event message"},{"name":"scanCollection","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of scanCollection message. true: Enables the LoRaWAN confirmation of scanCollection message"},{"name":"proximity","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of proximity message. true: Enables the LoRaWAN confirmation of proximity message"},{"name":"debug","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of debug message. true: Enables the LoRaWAN confirmation of debug message"}],"bitMap":[{"type":"BitMapValue","valueFor":"framePending","bitShift":0,"length":1},{"type":"BitMapValue","valueFor":"position","bitShift":3,"length":1},{"type":"BitMapValue","valueFor":"energyStatus","bitShift":4,"length":1},{"type":"BitMapValue","valueFor":"heartbeat","bitShift":5,"length":1},{"type":"BitMapValue","valueFor":"activityStatus","bitShift":7,"length":1},{"type":"BitMapValue","valueFor":"shockDetection","bitShift":7,"length":1},{"type":"BitMapValue","valueFor":"configuration","bitShift":7,"length":1},{"type":"BitMapValue","valueFor":"shutdown","bitShift":9,"length":1},{"type":"BitMapValue","valueFor":"event","bitShift":10,"length":1},{"type":"BitMapValue","valueFor":"scanCollection","bitShift":11,"length":1},{"type":"BitMapValue","valueFor":"proximity","bitShift":12,"length":1},{"type":"BitMapValue","valueFor":"debug","bitShift":15,"length":1}]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"proximityMinimumScanPower","firmwareConfigurationFileParameterName":"prox_scan_pwr_min","bleId":43,"id":43,"defaultValue":-90,"description":"Minimum power (RSSI) of a scan entry to be considered.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":-90,"maximum":10}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"proximityDistanceCoefficient","firmwareConfigurationFileParameterName":"prox_distance_coef","bleId":44,"id":44,"defaultValue":200,"description":"Configure proximity distance coefficient.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":1,"maximum":256}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"proximityScanFrequency","firmwareConfigurationFileParameterName":"prox_scan_frequency","bleId":45,"id":45,"defaultValue":1800,"description":"Number of scans in an hour.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":2,"maximum":3600}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"proximityBacktraceMaximumAge","firmwareConfigurationFileParameterName":"prox_backtrace_max_age","bleId":46,"id":46,"defaultValue":256,"description":"Delay after which an entry is removed from short term buffer, and “record” trigger is evaluated.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":1,"maximum":256}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"proximityDistanceSlidingWindow","firmwareConfigurationFileParameterName":"prox_distance_sliding_window","bleId":47,"id":47,"defaultValue":30,"description":"Duration of sliding window over which distance_average will be evaluated.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":1,"maximum":256}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"proximityExposure50","firmwareConfigurationFileParameterName":"prox_exposure_50","bleId":48,"id":48,"defaultValue":200,"description":"Marginal exposure index for [0,50cm] range during 1 second.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":256}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"proximityExposure100","firmwareConfigurationFileParameterName":"prox_exposure_100","bleId":49,"id":49,"defaultValue":50,"description":"Marginal exposure index for [0,100cm] range during 1 second.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":256}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"proximityExposure150","firmwareConfigurationFileParameterName":"prox_exposure_150","bleId":50,"id":50,"defaultValue":22,"description":"Marginal exposure index for [0,150cm] range during 1 second.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":256}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"proximityExposure200","firmwareConfigurationFileParameterName":"prox_exposure_200","bleId":51,"id":51,"defaultValue":13,"description":"Marginal exposure index for [0,200cm] range during 1 second.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":256}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"proximityExposure250","firmwareConfigurationFileParameterName":"prox_exposure_250","bleId":52,"id":52,"defaultValue":0,"description":"Marginal exposure index for [0,250cm] range during 1 second.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":256}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"proximityExposure300","firmwareConfigurationFileParameterName":"prox_exposure_300","bleId":53,"id":53,"defaultValue":0,"description":"Marginal exposure index for [0,300cm] range during 1 second.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":256}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"proximityExposure400","firmwareConfigurationFileParameterName":"prox_exposure_400","bleId":54,"id":54,"defaultValue":0,"description":"Marginal exposure index for [0,400cm] range during 1 second.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":256}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"proximityImmediateAlarmDistance","firmwareConfigurationFileParameterName":"prox_alarm_dist_immediate","bleId":55,"id":55,"defaultValue":5,"description":"Detection threshold in tenth of meter for immediate alarm state trigger.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":100},"multiply":0.1},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"proximityAlarmExposure","firmwareConfigurationFileParameterName":"prox_alarm_exposure","bleId":56,"id":56,"defaultValue":12000,"description":"Cumulated exposure threshold to trigger alarm state.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":65535}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"proximityImmediateWarningDistance","firmwareConfigurationFileParameterName":"prox_warn_dist_immediate","bleId":57,"id":57,"defaultValue":10,"description":"Detection threshold in tenth of meter for immediate warning state trigger.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":100},"multiply":0.1},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"proximityWarningExposure","firmwareConfigurationFileParameterName":"prox_warn_exposure","bleId":58,"id":58,"defaultValue":6000,"description":"Cumulated exposure threshold to trigger warning state.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":65535}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"proximityImmediateRecordDistance","firmwareConfigurationFileParameterName":"prox_record_dist_immediate","bleId":59,"id":59,"defaultValue":20,"description":"Detection threshold in tenth of meter for contact recording.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":100},"multiply":0.1},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"proximityRecordExposure","firmwareConfigurationFileParameterName":"prox_record_exposure","bleId":60,"id":60,"defaultValue":3700,"description":"Cumulated exposure threshold to trigger record action.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":1,"maximum":65535}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"proximityAlarmBuzzerDuration","firmwareConfigurationFileParameterName":"prox_alarm_buz_duration","bleId":61,"id":61,"defaultValue":5,"description":"Buzzer duration in seconds.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":256}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"proximityWarningBuzzerDuration","firmwareConfigurationFileParameterName":"prox_warn_buz_duration","bleId":62,"id":62,"defaultValue":5,"description":"Buzzer duration in seconds.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":256}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"proximityContactPolicy","firmwareConfigurationFileParameterName":"prox_contact_policy","bleId":63,"id":63,"defaultValue":0,"description":"Contact Policy.","parameterType":{"type":"ParameterTypeBitMap","properties":[{"name":"enable","type":"PropertyBoolean","description":"Enable the proximity feature."},{"name":"store","type":"PropertyBoolean","description":"Store data in memory."},{"name":"uplink","type":"PropertyBoolean","description":"Send data with LoRa uplinks."}],"bitMap":[{"type":"BitMapValue","valueFor":"enable","bitShift":0,"length":1},{"type":"BitMapValue","valueFor":"store","bitShift":1,"length":1},{"type":"BitMapValue","valueFor":"uplink","bitShift":2,"length":1}]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"proximityScanDuration","firmwareConfigurationFileParameterName":"prox_scan_duration","bleId":64,"id":64,"defaultValue":10,"description":"Duration of multichannel scan.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":1,"maximum":600},"multiply":0.1},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"proximityScanWindow","firmwareConfigurationFileParameterName":"prox_scan_window","bleId":65,"id":65,"defaultValue":120,"description":"Duration of scan on each channel.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":10,"maximum":10240}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"proximityScanInterval","firmwareConfigurationFileParameterName":"prox_scan_interval","bleId":66,"id":66,"defaultValue":125,"description":"BLE scan interval.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":15,"maximum":10245}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"proximityAlarmRemanence","firmwareConfigurationFileParameterName":"prox_alarm_remanence","bleId":67,"id":67,"defaultValue":15,"description":"Time in seconds to keep an item in alarm list when not detected anymore.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":256}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"proximityWarningRemanence","firmwareConfigurationFileParameterName":"prox_warn_remanence","bleId":68,"id":68,"defaultValue":15,"description":"Time in seconds to keep an item in warning list when not detected anymore.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":256}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"proximityBeaconRepeat","firmwareConfigurationFileParameterName":"prox_bcn_repeat","bleId":69,"id":69,"defaultValue":100,"description":"Beacon repeats frequency.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":65535}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"proximityBeaconTXPower","firmwareConfigurationFileParameterName":"prox_bcn_tx_power","bleId":70,"id":70,"defaultValue":-41,"description":"Advertised calibrated TX power at 1m.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":-60,"maximum":-20}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"proximityReminderPeriod","firmwareConfigurationFileParameterName":"prox_reminder_period","bleId":71,"id":71,"defaultValue":20,"description":"Periodicity of reminder beep during warning or alarm states.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":256}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"proximityReminderDistance","firmwareConfigurationFileParameterName":"prox_reminder_distance","bleId":72,"id":72,"defaultValue":20,"description":"Distance beyond which the reminder beep is disabled when no tags in alarm or warning state are within this radius.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":256},"multiply":0.1},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"proximityWarningDisableDistance","firmwareConfigurationFileParameterName":"prox_warn_disable_dist","bleId":73,"id":73,"defaultValue":25,"description":"Distance beyond which the warning soft state timer will not be reset.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":1,"maximum":256},"multiply":0.1},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"proximityAlarmDisableDistance","firmwareConfigurationFileParameterName":"prox_alarm_disable_dist","bleId":74,"id":74,"defaultValue":25,"description":"Distance beyond which the alarm soft state timer will not be reset.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":1,"maximum":256},"multiply":0.1},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"proximityMaxSpeedFilter","firmwareConfigurationFileParameterName":"prox_max_speed_filter","bleId":75,"id":75,"defaultValue":15,"description":"Maximum speed of a pedestrian.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":40},"multiply":0.1},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"proximityMaxUpdate","firmwareConfigurationFileParameterName":"prox_max_update","bleId":76,"id":76,"defaultValue":3600,"description":"Max duration in seconds for a record without sending any information.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":300,"maximum":43200}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"bleFilterType","firmwareConfigurationFileParameterName":"position_ble_filter_type","bleId":77,"id":77,"defaultValue":0,"description":"Beacon type to scan and report when position scan type is BLE.","parameterType":{"type":"ParameterTypeString","possibleValues":["NO_FILTER","EDDYSTONE_UID","EDDYSTONE_URL","ALL_EDDYSTONE","IBEACON_ONLY","ALTBEACON_ONLY"],"firmwareValues":[0,1,2,3,4,5]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"bleFilterMain1","firmwareConfigurationFileParameterName":"position_ble_filter_main_1","bleId":78,"id":78,"defaultValue":0,"description":"First part of the main BLE filter.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":4294967295}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"bleFilterMain2","firmwareConfigurationFileParameterName":"position_ble_filter_main_2","bleId":79,"id":79,"defaultValue":0,"description":"Second part of the main BLE filter.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":4294967295}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"bleFilterSecValue","firmwareConfigurationFileParameterName":"position_ble_filter_sec_value","bleId":80,"id":80,"defaultValue":0,"description":"BLE secondary value","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":4294967295}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"bleFilterSecMask","firmwareConfigurationFileParameterName":"position_ble_filter_sec_mask","bleId":81,"id":81,"defaultValue":0,"description":"BLE secondary mask","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":4294967295}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"bleFilterReportType","firmwareConfigurationFileParameterName":"position_ble_report_type","bleId":82,"id":82,"defaultValue":0,"description":"Configure the BLE data to report in payloads.","parameterType":{"type":"ParameterTypeString","possibleValues":["MAC_ADDRESS","SHORT_ID","LONG_ID"],"firmwareValues":[0,1,2]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"buzzerVolume","firmwareConfigurationFileParameterName":"buzzer_volume","bleId":83,"id":83,"defaultValue":0,"description":"Configure the buzzer volume.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":100}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]}]},{"firmwareVersion":"2.2","uplinkPort":18,"firmwareParameters":[{"driverParameterName":"trackingUlPeriod","firmwareConfigurationFileParameterName":"ul_period","bleId":0,"id":0,"defaultValue":300,"description":"Period of position or activity messages in motion, start/end, activity or permanent operating mode.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":15,"maximum":86400}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"energyStatusPeriod","firmwareConfigurationFileParameterName":"pw_stat_period","bleId":2,"id":2,"description":"Period of energy status messages.","defaultValue":0,"parameterType":{"type":"ParameterTypeNumber","range":{"minimum":300,"maximum":604800},"additionalValues":[0]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"gpsStandbyTimeout","firmwareConfigurationFileParameterName":"gps_standby_timeout","bleId":17,"id":17,"defaultValue":1800,"description":"Duration of the GPS standby mode before going OFF.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":43200}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"oneshotGeolocMethod","firmwareConfigurationFileParameterName":"geoloc_method","bleId":6,"id":6,"defaultValue":1,"description":"Geolocation policy used for the side operating modes.","parameterType":{"type":"ParameterTypeString","possibleValues":["WIFI","GPS","XGPS","WGPS","WXGPS","BLE","BGPS","BXGPS"],"firmwareValues":[0,1,2,3,4,5,6,7]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"geolocSensorProfile","firmwareConfigurationFileParameterName":"geoloc_sensor","bleId":5,"id":5,"defaultValue":1,"description":"Geolocation sensor profile used in main operating mode and SOS mode.","parameterType":{"type":"ParameterTypeString","possibleValues":["WIFI_ONLY","GPS_ONLY","XGPS_ONLY","WIFI_FALLBACK_XGPS","SELF_GOVERNING_HISTORY","SELF_GOVERNING_TIMEOUT","WGPS_ONLY","WXGPS_ONLY","WGPS_WXGPS_FAILURE","WGPS_WXGPS_TIMEOUT","BLE","BGPS_ONLY","BXGPS_ONLY"],"firmwareValues":[0,1,2,3,4,5,6,7,8,9,10,11,12]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"motionStartEndNbTx","firmwareConfigurationFileParameterName":"motion_nb_pos","bleId":8,"id":8,"defaultValue":1,"description":"Number of positions to report during motion events (motion start/end mode only).","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":1,"maximum":60}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"xgpsTimeout","firmwareConfigurationFileParameterName":"agps_timeout","bleId":10,"id":10,"defaultValue":45,"description":"Timeout for LPGPS scans before sending the timeout message.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":15,"maximum":250}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"configFlags","firmwareConfigurationFileParameterName":"config_flags","bleId":13,"id":13,"defaultValue":131103,"description":"Configuration flags.","parameterType":{"type":"ParameterTypeBitMap","properties":[{"name":"framePendingMechanism","type":"PropertyBoolean","description":"false: Frame pending mechanism is disabled. true: Frame pending mechanism is enabled. "},{"name":"buttonPressToTurnOFF","type":"PropertyBoolean","description":"false: Cannot turn OFF device with a button press.true: Can turn OFF device with a button press. "},{"name":"doubleClickIsSosModeOrAlert","type":"PropertyBoolean","description":"false: Double button click triggers an Alert. true: Double button click starts SOS mode, another double click stops it."},{"name":"downlinkSetParameterConfirmation","type":"PropertyBoolean","description":"false: Confirmation uplink mechanism is disabled. true: Confirmation uplink mechanism is enabled. Factory default value"},{"name":"wifiPayloadWithNoCypher","type":"PropertyBoolean","description":" false: Wifi payload is cyphered.  true: Wifi payload is not cyphered."},{"name":"bleAdvertisingAtStart","type":"PropertyBoolean","description":"false: BLE advertising is disabled. Factory default value.  true: BLE advertising is enabled."},{"name":"selectWifiScanOrGeolocStartMessage","type":"PropertyBoolean","description":"false: Enable geoloc start event message when starting a geoloc sequence. true: Enable Wifi scan when starting a geoloc sequence."},{"name":"ledBlinkWithGpsFix","type":"PropertyBoolean","description":"false: No blink when a GPS fix is received. Factory default value.true: LED Blink when a GPS fix is received."},{"name":"startMotionEventUplink","type":"PropertyBoolean","description":" false: Start Motion event payload is disabled. Factory default value.true: Start Motion event payload is enabled."},{"name":"endMotionEventUplink","type":"PropertyBoolean","description":" false: End Motion event payload is disabled. Factory default value. true: End Motion event payload is enabled."},{"name":"otaJoinWhenLeavingModeOff","type":"PropertyBoolean","description":"false: Disable OTA join when leaving mode OFF. Factory default value.true: Enable OTA join when leaving mode OFF."},{"name":"rejectAsymmetricPairing","type":"PropertyBoolean","description":"false: Accept asymmetric BLE pairing. Factory default value.  true: Reject asymmetric BLE pairing."},{"name":"enableLongWifiPayload","type":"PropertyBoolean","description":"false: Long wifi payload is disabled. Factory default value. true: Long wifi payload is enabled."},{"name":"collectionLongReport","type":"PropertyBoolean","description":"false: The usual payload size is used (36 bytes). true: The number of entries carried in the uplink is larger and use a payload size of 91 bytes."},{"name":"autoStart","type":"PropertyBoolean","description":"false: Once LoRa join succeeds, the user needs to make another long press to actually start in the configured operating mode.true: Once LoRa join succeeds, the device automatically starts without requiring a long press."},{"name":"forbidModeOff","type":"PropertyBoolean","description":"false: Mode OFF is allowed. Factory default value. true: Mode OFF is forbidden. When Mode OFF is requested, the device goes in Standby mode instead."},{"name":"sosModeSound","type":"PropertyBoolean","description":"false: SOS Mode Sound disabled. Factory default value. true: SOS Mode Sound enabled."},{"name":"automaticDatarateSelection","type":"PropertyBoolean","description":"false: Automatic Datarate Selection disabled.true: Automatic Datarate Selection enabled. Factory default value."}],"bitMap":[{"type":"BitMapValue","valueFor":"framePendingMechanism","bitShift":0,"length":1},{"type":"BitMapValue","valueFor":"buttonPressToTurnOFF","bitShift":1,"length":1},{"type":"BitMapValue","valueFor":"doubleClickIsSosModeOrAlert","bitShift":2,"length":1},{"type":"BitMapValue","valueFor":"downlinkSetParameterConfirmation","bitShift":3,"length":1},{"type":"BitMapValue","valueFor":"wifiPayloadWithNoCypher","bitShift":4,"length":1},{"type":"BitMapValue","valueFor":"bleAdvertisingAtStart","bitShift":5,"length":1},{"type":"BitMapValue","valueFor":"selectWifiScanOrGeolocStartMessage","bitShift":6,"length":1},{"type":"BitMapValue","valueFor":"ledBlinkWithGpsFix","bitShift":7,"length":1},{"type":"BitMapValue","valueFor":"startMotionEventUplink","bitShift":8,"length":1},{"type":"BitMapValue","valueFor":"endMotionEventUplink","bitShift":9,"length":1},{"type":"BitMapValue","valueFor":"otaJoinWhenLeavingModeOff","bitShift":10,"length":1},{"type":"BitMapValue","valueFor":"rejectAsymmetricPairing","bitShift":11,"length":1},{"type":"BitMapValue","valueFor":"enableLongWifiPayload","bitShift":12,"length":1},{"type":"BitMapValue","valueFor":"collectionLongReport","bitShift":13,"length":1},{"type":"BitMapValue","valueFor":"autoStart","bitShift":14,"length":1},{"type":"BitMapValue","valueFor":"forbidModeOff","bitShift":15,"length":1},{"type":"BitMapValue","valueFor":"sosModeSound","bitShift":16,"length":1},{"type":"BitMapValue","valueFor":"automaticDatarateSelection","bitShift":17,"length":1}]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"proximityImmediateAlarmDistance","firmwareConfigurationFileParameterName":"prox_alarm_dist_immediate","bleId":55,"id":55,"defaultValue":1,"description":"Detection threshold in tenth of meter for immediate alarm state trigger.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":100},"multiply":0.1},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"proximityAlarmRemanence","firmwareConfigurationFileParameterName":"prox_alarm_remanence","bleId":67,"id":67,"defaultValue":30,"description":"Time in seconds to keep an item in alarm list when not detected anymore.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":256}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"proximityWarningRemanence","firmwareConfigurationFileParameterName":"prox_warn_remanence","bleId":68,"id":68,"defaultValue":30,"description":"Time in seconds to keep an item in warning list when not detected anymore.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":256}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"buzzerVolume","firmwareConfigurationFileParameterName":"buzzer_volume","bleId":83,"id":83,"defaultValue":10,"description":"Configure the buzzer volume.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":100}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"geofencingCollectPeriod","firmwareConfigurationFileParameterName":"geofencing_collect_period","bleId":25,"id":25,"defaultValue":60,"description":"Period for beacon collection while in geofencing active state.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":15,"maximum":3600},"additionalValues":[0]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"reedSwitchConfiguration","firmwareConfigurationFileParameterName":"reed_switch_configuration","bleId":41,"id":41,"defaultValue":1,"description":"Reed switch setting","parameterType":{"type":"ParameterTypeString","possibleValues":["DISABLE_REED_SWITCH","NORMAL_REED_SWITCH","BUTTON_REED_SWITCH","START_BLE_ADVERTISEMENT_REED_SWITCH"],"firmwareValues":[0,1,2,3]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"angleDetectionMode","firmwareConfigurationFileParameterName":"angle_detect_mode","bleId":84,"id":84,"defaultValue":0,"description":"Defines the operational mode of the angle detection feature.","parameterType":{"type":"ParameterTypeString","possibleValues":["DISABLED","CRITICAL_ANGLE_DETECTION","ANGLE_DEVIATION_DETECTION","SHOCK"],"firmwareValues":[0,1,2,3]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"bleFilterReportType","firmwareConfigurationFileParameterName":"position_ble_report_type","bleId":82,"id":82,"defaultValue":0,"description":"Configure the BLE data to report in payloads.","parameterType":{"type":"ParameterTypeString","possibleValues":["MAC_ADDRESS","SHORT_ID","LONG_ID","SHORT_ID_MAJOR_MINOR_FIELD"],"firmwareValues":[0,1,2,3]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"angleReferenceAcquisition","firmwareConfigurationFileParameterName":"angle_ref_acq","bleId":85,"id":85,"defaultValue":2,"description":"Defines the mode of the reference acquisition.","parameterType":{"type":"ParameterTypeString","possibleValues":["MANUAL","CONFIGURED","AUTOMATIC","ASSISTED"],"firmwareValues":[0,1,2,3]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"angleReferenceAccelerationX","firmwareConfigurationFileParameterName":"angle_ref_acc_x","bleId":86,"id":86,"defaultValue":0,"description":"Acceleration in mG belonging to the X axis. First coordinate of the reference orientation vector.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":-1000,"maximum":1000},"additionalValues":[65535]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"angleReferenceAccelerationY","firmwareConfigurationFileParameterName":"angle_ref_acc_y","bleId":87,"id":87,"defaultValue":0,"description":"Acceleration in mG belonging to the Y axis. Second coordinate of the reference orientation vector.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":-1000,"maximum":1000},"additionalValues":[65535]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"angleReferenceAccelerationZ","firmwareConfigurationFileParameterName":"angle_ref_acc_z","bleId":88,"id":88,"defaultValue":0,"description":"Acceleration in mG belonging to the Z axis. Third coordinate of the reference orientation vector.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":-1000,"maximum":1000},"additionalValues":[65535]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"angleCritical","firmwareConfigurationFileParameterName":"angle_critical","bleId":89,"id":89,"defaultValue":30,"description":"Critical angle in degrees.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":5,"maximum":175}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"angleCriticalHysteresis","firmwareConfigurationFileParameterName":"angle_critical_hyst","bleId":90,"id":90,"defaultValue":5,"description":"Critical angle hysteresis in degrees.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":180}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"angleReportingMode","firmwareConfigurationFileParameterName":"angle_report_mode","bleId":91,"id":91,"defaultValue":1,"description":"Angle detection events to report.","parameterType":{"type":"ParameterTypeBitMap","properties":[{"name":"normalToCritical","type":"PropertyBoolean","description":"Report the transitions normal to critical."},{"name":"criticalToNormal","type":"PropertyBoolean","description":"Report the transitions critical to normal."},{"name":"learningToNormal","type":"PropertyBoolean","description":"Report the transitions learning to normal."},{"name":"normalToLearning","type":"PropertyBoolean","description":"Report the transitions normal to learning."},{"name":"criticalToLearning","type":"PropertyBoolean","description":"Report the transitions critical to learning."}],"bitMap":[{"type":"BitMapValue","valueFor":"normalToCritical","bitShift":0,"length":1},{"type":"BitMapValue","valueFor":"criticalToNormal","bitShift":1,"length":1},{"type":"BitMapValue","valueFor":"learningToNormal","bitShift":2,"length":1},{"type":"BitMapValue","valueFor":"normalToLearning","bitShift":3,"length":1},{"type":"BitMapValue","valueFor":"criticalToLearning","bitShift":4,"length":1}]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"angleReportingPeriod","firmwareConfigurationFileParameterName":"angle_report_period","bleId":92,"id":92,"defaultValue":300,"description":"Angle detection reporting period between repetitions, in seconds.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":30,"maximum":3600},"additionalValues":[0]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"angleReportingRepeat","firmwareConfigurationFileParameterName":"angle_report_repeat","bleId":93,"id":93,"defaultValue":0,"description":"Defines how many times an angle detection report is repeated.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":7}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"angleRisingTime","firmwareConfigurationFileParameterName":"angle_rising_time","bleId":94,"id":94,"defaultValue":5,"description":"Rising time phase duration, in seconds.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":3600}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"angleFallingTime","firmwareConfigurationFileParameterName":"angle_falling_time","bleId":95,"id":95,"defaultValue":5,"description":"Falling time phase duration, in seconds.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":3600}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"angleLearningTime","firmwareConfigurationFileParameterName":"angle_learning_time","bleId":96,"id":96,"defaultValue":5,"description":"Learning time phase duration, in seconds.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":3600}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"angleAccelerationAccuracy","firmwareConfigurationFileParameterName":"angle_acc_accuracy","bleId":97,"id":97,"defaultValue":100,"description":"Accuracy in mg applied to the acceleration measures.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":1000}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"angleDeviationDelta","firmwareConfigurationFileParameterName":"angle_deviation_delta","bleId":98,"id":98,"defaultValue":0,"description":"Angle from previously reported orientation which triggers a new orientation report.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":175}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"angleDeviationMinInterval","firmwareConfigurationFileParameterName":"angle_deviation_min_interval","bleId":99,"id":99,"defaultValue":10,"description":"No report sent before the delay from the previous report, any deviation before this delay will be ignored.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":1800}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"angleDeviationMaxInterval","firmwareConfigurationFileParameterName":"angle_deviation_max_interval","bleId":100,"id":100,"defaultValue":0,"description":"No report sent after this delay from previous report, an update of current gravity vector will be sent regardless of delta value after this time.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":86400}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"defaultProfile","firmwareConfigurationFileParameterName":"default_profile","bleId":101,"id":101,"defaultValue":0,"description":"Defines the initialization value of the profile. It is used when the device is powered on for the first time or resets.","parameterType":{"type":"ParameterTypeString","possibleValues":["UNKNOWN","SLEEP","ECO","INTENSIVE"],"firmwareValues":[0,1,2,3]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"passwordCommandLineInterface","firmwareConfigurationFileParameterName":"password","bleId":102,"id":102,"defaultValue":123,"description":"Password used to configure User CLI access.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":100,"maximum":999999}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"gpsT0Timeout","firmwareConfigurationFileParameterName":"gps_t0_timeout","bleId":103,"id":103,"defaultValue":30,"description":"Time in seconds to abort the GPS geolocation when not enough satellites are in view.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":300}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"gpsFixTimeout","firmwareConfigurationFileParameterName":"gps_fix_timeout","bleId":104,"id":104,"defaultValue":0,"description":"Time in seconds to abort the current GPS geoloc if there is no GPS position at the end of the configured period.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":300}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"geofencingScanDuration","firmwareConfigurationFileParameterName":"geofencing_scan_duration","bleId":105,"id":105,"defaultValue":370,"description":"Time in milliseconds for geofencing BLE scan duration.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":370,"maximum":3000}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"beaconingType","firmwareConfigurationFileParameterName":"beaconing_type","bleId":106,"id":106,"defaultValue":0,"description":"Represents the beaconing advertising type.","parameterType":{"type":"ParameterTypeString","possibleValues":["DISABLED","PROXIMITY","QUUPPA","EDDYSTONE_UID","IBEACON","ALT_BEACON"],"firmwareValues":[0,1,2,3,4,5]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"beaconingTxPower","firmwareConfigurationFileParameterName":"beaconing_tx_power","bleId":107,"id":107,"defaultValue":2,"description":"Beaconing TX power in dBm.","parameterType":{"type":"ParameterTypeString","possibleValues":["PLUS_4_DBM","PLUS_3_DBM","0_DBM","MINUS_4_DBM","MINUS_8_DBM","MINUS_12_DBM","MINUS_16_DBM","MINUS_20_DBM","MINUS_40_DBM"],"firmwareValues":[0,1,2,3,4,5,6,7,8]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"beaconingStaticInterval","firmwareConfigurationFileParameterName":"beaconing_static_interval","bleId":108,"id":108,"defaultValue":10000,"description":"When beaconing is active and the tracker is static, the beaconing static interval represents the time in milliseconds for beacon advertising period.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":100,"maximum":10000},"additionalValues":[0]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"beaconingMotionInterval","firmwareConfigurationFileParameterName":"beaconing_motion_interval","bleId":109,"id":109,"defaultValue":333,"description":"When beaconing is active and the tracker is moving, the beaconing motion interval represents the time in milliseconds for beacon advertising period.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":100,"maximum":10000},"additionalValues":[0]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"beaconingMotionDuration","firmwareConfigurationFileParameterName":"beaconing_motion_duration","bleId":110,"id":110,"defaultValue":20,"description":"When Beaconing is active, time in seconds to be considered in motion when receiving a motion event.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":4,"maximum":255}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"bleConnectivityAdvertisingDuration","firmwareConfigurationFileParameterName":"ble_cnx_adv_duration","bleId":111,"id":111,"defaultValue":120,"description":"Time in seconds for BLE advertisement duration when the device is not bonded.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":30,"maximum":18000}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"dynamicProfile","bleId":246,"id":246,"defaultValue":0,"description":"It must be used to change dynamically the profile. The value is not stored in flash, and the device will restart with Default Profile after an empty battery or a reset.","compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]}]},{"firmwareVersion":"2.3","uplinkPort":18,"firmwareParameters":[{"driverParameterName":"motionStartEndNbTx","firmwareConfigurationFileParameterName":"motion_nb_pos","bleId":8,"id":8,"defaultValue":1,"description":"Number of positions to report during motion events (motion start/end mode only).","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":1,"maximum":60}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"configFlags","firmwareConfigurationFileParameterName":"config_flags","bleId":13,"id":13,"defaultValue":213055,"description":"Configuration flags.","parameterType":{"type":"ParameterTypeBitMap","properties":[{"name":"framePendingMechanism","type":"PropertyBoolean","description":"false: Frame pending mechanism is disabled. true: Frame pending mechanism is enabled. "},{"name":"buttonPressToTurnOFF","type":"PropertyBoolean","description":"false: Cannot turn OFF device with a button press.true: Can turn OFF device with a button press. "},{"name":"doubleClickIsSosModeOrAlert","type":"PropertyBoolean","description":"false: Double button click triggers an Alert. true: Double button click starts SOS mode, another double click stops it."},{"name":"downlinkSetParameterConfirmation","type":"PropertyBoolean","description":"false: Confirmation uplink mechanism is disabled. true: Confirmation uplink mechanism is enabled. Factory default value"},{"name":"wifiPayloadWithNoCypher","type":"PropertyBoolean","description":" false: Wifi payload is cyphered.  true: Wifi payload is not cyphered."},{"name":"bleAdvertisingAtStart","type":"PropertyBoolean","description":"false: BLE advertising is disabled. Factory default value.  true: BLE advertising is enabled."},{"name":"selectWifiScanOrGeolocStartMessage","type":"PropertyBoolean","description":"false: Enable geoloc start event message when starting a geoloc sequence. true: Enable Wifi scan when starting a geoloc sequence."},{"name":"ledBlinkWithGpsFix","type":"PropertyBoolean","description":"false: No blink when a GPS fix is received. Factory default value.true: LED Blink when a GPS fix is received."},{"name":"startMotionEventUplink","type":"PropertyBoolean","description":" false: Start Motion event payload is disabled. Factory default value.true: Start Motion event payload is enabled."},{"name":"endMotionEventUplink","type":"PropertyBoolean","description":" false: End Motion event payload is disabled. Factory default value. true: End Motion event payload is enabled."},{"name":"otaJoinWhenLeavingModeOff","type":"PropertyBoolean","description":"false: Disable OTA join when leaving mode OFF. Factory default value.true: Enable OTA join when leaving mode OFF."},{"name":"rejectAsymmetricPairing","type":"PropertyBoolean","description":"false: Accept asymmetric BLE pairing. Factory default value.  true: Reject asymmetric BLE pairing."},{"name":"enableLongWifiPayload","type":"PropertyBoolean","description":"false: Long wifi payload is disabled. Factory default value. true: Long wifi payload is enabled."},{"name":"collectionLongReport","type":"PropertyBoolean","description":"false: The usual payload size is used (36 bytes). true: The number of entries carried in the uplink is larger and use a payload size of 91 bytes."},{"name":"autoStart","type":"PropertyBoolean","description":"false: Once LoRa join succeeds, the user needs to make another long press to actually start in the configured operating mode.true: Once LoRa join succeeds, the device automatically starts without requiring a long press."},{"name":"forbidModeOff","type":"PropertyBoolean","description":"false: Mode OFF is allowed. Factory default value. true: Mode OFF is forbidden. When Mode OFF is requested, the device goes in Standby mode instead."},{"name":"sosModeSound","type":"PropertyBoolean","description":"false: SOS mode sound disabled. true: SOS mode sound is enabled. "},{"name":"automaticDatarateSelection","type":"PropertyBoolean","description":"false: automatic datarate selection is disabled. true: automatic datarate selection is enabled. "},{"name":"extendedPosition","type":"PropertyBoolean","description":"false: Position messages are using Common Header. true: Position messages are using Extended Common Header and the format of some positions is changed. "},{"name":"bleCli","type":"PropertyBoolean","description":"false: BLE CLI disabled. true: BLE CLI enabled. "}],"bitMap":[{"type":"BitMapValue","valueFor":"framePendingMechanism","bitShift":0,"length":1},{"type":"BitMapValue","valueFor":"buttonPressToTurnOFF","bitShift":1,"length":1},{"type":"BitMapValue","valueFor":"doubleClickIsSosModeOrAlert","bitShift":2,"length":1},{"type":"BitMapValue","valueFor":"downlinkSetParameterConfirmation","bitShift":3,"length":1},{"type":"BitMapValue","valueFor":"wifiPayloadWithNoCypher","bitShift":4,"length":1},{"type":"BitMapValue","valueFor":"bleAdvertisingAtStart","bitShift":5,"length":1},{"type":"BitMapValue","valueFor":"selectWifiScanOrGeolocStartMessage","bitShift":6,"length":1},{"type":"BitMapValue","valueFor":"ledBlinkWithGpsFix","bitShift":7,"length":1},{"type":"BitMapValue","valueFor":"startMotionEventUplink","bitShift":8,"length":1},{"type":"BitMapValue","valueFor":"endMotionEventUplink","bitShift":9,"length":1},{"type":"BitMapValue","valueFor":"otaJoinWhenLeavingModeOff","bitShift":10,"length":1},{"type":"BitMapValue","valueFor":"rejectAsymmetricPairing","bitShift":11,"length":1},{"type":"BitMapValue","valueFor":"enableLongWifiPayload","bitShift":12,"length":1},{"type":"BitMapValue","valueFor":"collectionLongReport","bitShift":13,"length":1},{"type":"BitMapValue","valueFor":"autoStart","bitShift":14,"length":1},{"type":"BitMapValue","valueFor":"forbidModeOff","bitShift":15,"length":1},{"type":"BitMapValue","valueFor":"sosModeSound","bitShift":16,"length":1},{"type":"BitMapValue","valueFor":"automaticDatarateSelection","bitShift":17,"length":1},{"type":"BitMapValue","valueFor":"extendedPosition","bitShift":18,"length":1},{"type":"BitMapValue","valueFor":"bleCli","bitShift":20,"length":1}]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"confirmedUlBitmap","firmwareConfigurationFileParameterName":"confirmed_ul_bitmap","bleId":18,"id":18,"defaultValue":0,"description":"Bitmap enabling the LoRaWAN confirmation of specific type of uplink message.","parameterType":{"type":"ParameterTypeBitMap","properties":[{"name":"framePending","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of frame pending message. true: Enables the LoRaWAN confirmation of frame pending message"},{"name":"position","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of position message. true: Enables the LoRaWAN confirmation of position message"},{"name":"energyStatus","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of energy status message. true: Enables the LoRaWAN confirmation of energy status message"},{"name":"healthStatus","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of health status message. true: Enables the LoRaWAN confirmation of health status message"},{"name":"heartbeat","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of heartbeat message. true: Enables the LoRaWAN confirmation of heartbeat message"},{"name":"activityStatus","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of activityStatus message. true: Enables the LoRaWAN confirmation of activityStatus message"},{"name":"configuration","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of configuration message. true: Enables the LoRaWAN confirmation of configuration message"},{"name":"shockDetection","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of shockDetection message. true: Enables the LoRaWAN confirmation of shockDetection message"},{"name":"shutdown","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of shutdown message. true: Enables the LoRaWAN confirmation of shutdown message"},{"name":"event","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of event message. true: Enables the LoRaWAN confirmation of event message"},{"name":"scanCollection","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of scanCollection message. true: Enables the LoRaWAN confirmation of scanCollection message"},{"name":"proximity","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of proximity message. true: Enables the LoRaWAN confirmation of proximity message"},{"name":"extendedPosition","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of extendedPosition message. true: Enables the LoRaWAN confirmation of extendedPosition message"},{"name":"debug","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of debug message. true: Enables the LoRaWAN confirmation of debug message"}],"bitMap":[{"type":"BitMapValue","valueFor":"framePending","bitShift":0,"length":1},{"type":"BitMapValue","valueFor":"position","bitShift":3,"length":1},{"type":"BitMapValue","valueFor":"energyStatus","bitShift":4,"length":1},{"type":"BitMapValue","valueFor":"healthStatus","bitShift":4,"length":1},{"type":"BitMapValue","valueFor":"heartbeat","bitShift":5,"length":1},{"type":"BitMapValue","valueFor":"activityStatus","bitShift":7,"length":1},{"type":"BitMapValue","valueFor":"shockDetection","bitShift":7,"length":1},{"type":"BitMapValue","valueFor":"configuration","bitShift":7,"length":1},{"type":"BitMapValue","valueFor":"shutdown","bitShift":9,"length":1},{"type":"BitMapValue","valueFor":"event","bitShift":10,"length":1},{"type":"BitMapValue","valueFor":"scanCollection","bitShift":11,"length":1},{"type":"BitMapValue","valueFor":"proximity","bitShift":12,"length":1},{"type":"BitMapValue","valueFor":"extendedPosition","bitShift":14,"length":1},{"type":"BitMapValue","valueFor":"debug","bitShift":15,"length":1}]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"motionSensitivity","firmwareConfigurationFileParameterName":"motion_sensitivity","bleId":20,"id":20,"defaultValue":0,"description":"Allows a fine tuning of the acceleration intensity to trigger a motion event.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":1,"maximum":30},"additionalRanges":[{"minimum":100,"maximum":200}]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"shockDetection","firmwareConfigurationFileParameterName":"shock_detection","bleId":21,"id":21,"defaultValue":0,"description":"This parameter provides the configuration of the sensitivity of the shock detection from 1 to 100%.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":255}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"motionDuration","firmwareConfigurationFileParameterName":"motion_duration","bleId":23,"id":23,"defaultValue":180,"description":"Defines the delay needed without any motion detection to generate a motion end event.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":60,"maximum":3600}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"beaconId0","firmwareConfigurationFileParameterName":"beacon_id_0","bleId":112,"id":112,"defaultValue":0,"description":"Beacon ID advertised in BLE advertisement payload, part 0","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":4294967295}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"beaconId1","firmwareConfigurationFileParameterName":"beacon_id_1","bleId":113,"id":113,"defaultValue":0,"description":"Beacon ID advertised in BLE advertisement payload, part 1","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":4294967295}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"beaconId2","firmwareConfigurationFileParameterName":"beacon_id_2","bleId":114,"id":114,"defaultValue":0,"description":"Beacon ID advertised in BLE advertisement payload, part 2","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":4294967295}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"beaconId3","firmwareConfigurationFileParameterName":"beacon_id_3","bleId":115,"id":115,"defaultValue":0,"description":"Beacon ID advertised in BLE advertisement payload, part 3","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":4294967295}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"beaconId4","firmwareConfigurationFileParameterName":"beacon_id_4","bleId":116,"id":116,"defaultValue":0,"description":"Beacon ID advertised in BLE advertisement payload, part 4","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":4294967295}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"sosPeriod","firmwareConfigurationFileParameterName":"sos_period","bleId":117,"id":117,"defaultValue":120,"description":"SOS period duration, in seconds.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":15,"maximum":300}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"motionDebounce","firmwareConfigurationFileParameterName":"motion_debounce","bleId":118,"id":118,"defaultValue":1,"description":"Minimum duration for a movement to be detected.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":255}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"buttonMapping","firmwareConfigurationFileParameterName":"button_mapping","bleId":119,"id":119,"defaultValue":12410,"description":"Configure button actions according to the bitmap description.","parameterType":{"type":"ParameterTypeBitMap","properties":[{"name":"buttonPress","type":"PropertyString","description":"Action to execute with a button press.","possibleValues":["NO_ACTION","BATTERY_LEVEL_WITH_LED","START_STOP_SOS","START_ALERT","WHITELIST_WITH_PROXIMITY","ANGLE_DETECTION_MANUL_TRIGGER"],"firmwareValues":[0,1,2,3,4,5]},{"name":"oneButtonClick","type":"PropertyString","description":"Action to execute with a button click.","possibleValues":["NO_ACTION","BATTERY_LEVEL_WITH_LED","START_STOP_SOS","START_ALERT","WHITELIST_WITH_PROXIMITY","ANGLE_DETECTION_MANUL_TRIGGER"],"firmwareValues":[0,1,2,3,4,5]},{"name":"twoButtonClick","type":"PropertyString","description":"Action to execute with a button click.","possibleValues":["NO_ACTION","BATTERY_LEVEL_WITH_LED","START_STOP_SOS","START_ALERT","WHITELIST_WITH_PROXIMITY","ANGLE_DETECTION_MANUL_TRIGGER"],"firmwareValues":[0,1,2,3,4,5]},{"name":"threeButtonClick","type":"PropertyString","description":"Action to execute with a button click.","possibleValues":["NO_ACTION","BATTERY_LEVEL_WITH_LED","START_STOP_SOS","START_ALERT","WHITELIST_WITH_PROXIMITY","ANGLE_DETECTION_MANUL_TRIGGER"],"firmwareValues":[0,1,2,3,4,5]},{"name":"buttonPressDuration","type":"PropertyNumber","range":{"minimum":1,"maximum":8}}],"bitMap":[{"type":"BitMapValue","valueFor":"buttonPress","bitShift":0,"length":4},{"type":"BitMapValue","valueFor":"oneButtonClick","bitShift":4,"length":4},{"type":"BitMapValue","valueFor":"twoButtonClick","bitShift":8,"length":4},{"type":"BitMapValue","valueFor":"threeButtonClick","bitShift":12,"length":4},{"type":"BitMapValue","valueFor":"buttonPressDuration","bitShift":16,"length":4}]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"defaultDatarate","firmwareConfigurationFileParameterName":"default_datarate","bleId":120,"id":120,"defaultValue":-1,"description":"Configure Default Datarate","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":7},"additionalValues":[-1]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"bleCliActive","id":245,"defaultValue":0,"description":"activate or deactivate CLI traces over BLE when connected in BLE","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":1}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]}]},{"firmwareVersion":"2.4","uplinkPort":18,"firmwareParameters":[{"driverParameterName":"configFlags","firmwareConfigurationFileParameterName":"config_flags","bleId":13,"id":13,"defaultValue":213055,"description":"Configuration flags.","parameterType":{"type":"ParameterTypeBitMap","properties":[{"name":"framePendingMechanism","type":"PropertyBoolean","description":"false: Frame pending mechanism is disabled. true: Frame pending mechanism is enabled. "},{"name":"buttonPressToTurnOFF","type":"PropertyBoolean","description":"false: Cannot turn OFF device with a button press.true: Can turn OFF device with a button press. "},{"name":"doubleClickIsSosModeOrAlert","type":"PropertyBoolean","description":"false: Double button click triggers an Alert. true: Double button click starts SOS mode, another double click stops it."},{"name":"downlinkSetParameterConfirmation","type":"PropertyBoolean","description":"false: Confirmation uplink mechanism is disabled. true: Confirmation uplink mechanism is enabled. Factory default value"},{"name":"wifiPayloadWithNoCypher","type":"PropertyBoolean","description":" false: Wifi payload is cyphered.  true: Wifi payload is not cyphered."},{"name":"bleAdvertisingAtStart","type":"PropertyBoolean","description":"false: BLE advertising is disabled. Factory default value.  true: BLE advertising is enabled."},{"name":"selectWifiScanOrGeolocStartMessage","type":"PropertyBoolean","description":"false: Enable geoloc start event message when starting a geoloc sequence. true: Enable Wifi scan when starting a geoloc sequence."},{"name":"ledBlinkWithGpsFix","type":"PropertyBoolean","description":"false: No blink when a GPS fix is received. Factory default value.true: LED Blink when a GPS fix is received."},{"name":"startMotionEventUplink","type":"PropertyBoolean","description":" false: Start Motion event payload is disabled. Factory default value.true: Start Motion event payload is enabled."},{"name":"endMotionEventUplink","type":"PropertyBoolean","description":" false: End Motion event payload is disabled. Factory default value. true: End Motion event payload is enabled."},{"name":"otaJoinWhenLeavingModeOff","type":"PropertyBoolean","description":"false: Disable OTA join when leaving mode OFF. Factory default value.true: Enable OTA join when leaving mode OFF."},{"name":"rejectAsymmetricPairing","type":"PropertyBoolean","description":"false: Accept asymmetric BLE pairing. Factory default value.  true: Reject asymmetric BLE pairing."},{"name":"enableLongWifiPayload","type":"PropertyBoolean","description":"false: Long wifi payload is disabled. Factory default value. true: Long wifi payload is enabled."},{"name":"collectionLongReport","type":"PropertyBoolean","description":"false: The usual payload size is used (36 bytes). true: The number of entries carried in the uplink is larger and use a payload size of 91 bytes."},{"name":"autoStart","type":"PropertyBoolean","description":"false: Once LoRa join succeeds, the user needs to make another long press to actually start in the configured operating mode.true: Once LoRa join succeeds, the device automatically starts without requiring a long press."},{"name":"forbidModeOff","type":"PropertyBoolean","description":"false: Mode OFF is allowed. Factory default value. true: Mode OFF is forbidden. When Mode OFF is requested, the device goes in Standby mode instead."},{"name":"sosModeSound","type":"PropertyBoolean","description":"false: SOS mode sound disabled. true: SOS mode sound is enabled. "},{"name":"automaticDatarateSelection","type":"PropertyBoolean","description":"false: automatic datarate selection is disabled. true: automatic datarate selection is enabled. "},{"name":"extendedPosition","type":"PropertyBoolean","description":"false: Position messages are using Common Header. true: Position messages are using Extended Common Header and the format of some positions is changed. "},{"name":"bleCli","type":"PropertyBoolean","description":"false: BLE CLI disabled. true: BLE CLI enabled. "},{"name":"blePasskey","type":"PropertyBoolean","description":"true: the tracker will require the passkey for the bonding procedure. "}],"bitMap":[{"type":"BitMapValue","valueFor":"framePendingMechanism","bitShift":0,"length":1},{"type":"BitMapValue","valueFor":"buttonPressToTurnOFF","bitShift":1,"length":1},{"type":"BitMapValue","valueFor":"doubleClickIsSosModeOrAlert","bitShift":2,"length":1},{"type":"BitMapValue","valueFor":"downlinkSetParameterConfirmation","bitShift":3,"length":1},{"type":"BitMapValue","valueFor":"wifiPayloadWithNoCypher","bitShift":4,"length":1},{"type":"BitMapValue","valueFor":"bleAdvertisingAtStart","bitShift":5,"length":1},{"type":"BitMapValue","valueFor":"selectWifiScanOrGeolocStartMessage","bitShift":6,"length":1},{"type":"BitMapValue","valueFor":"ledBlinkWithGpsFix","bitShift":7,"length":1},{"type":"BitMapValue","valueFor":"startMotionEventUplink","bitShift":8,"length":1},{"type":"BitMapValue","valueFor":"endMotionEventUplink","bitShift":9,"length":1},{"type":"BitMapValue","valueFor":"otaJoinWhenLeavingModeOff","bitShift":10,"length":1},{"type":"BitMapValue","valueFor":"rejectAsymmetricPairing","bitShift":11,"length":1},{"type":"BitMapValue","valueFor":"enableLongWifiPayload","bitShift":12,"length":1},{"type":"BitMapValue","valueFor":"collectionLongReport","bitShift":13,"length":1},{"type":"BitMapValue","valueFor":"autoStart","bitShift":14,"length":1},{"type":"BitMapValue","valueFor":"forbidModeOff","bitShift":15,"length":1},{"type":"BitMapValue","valueFor":"sosModeSound","bitShift":16,"length":1},{"type":"BitMapValue","valueFor":"automaticDatarateSelection","bitShift":17,"length":1},{"type":"BitMapValue","valueFor":"extendedPosition","bitShift":18,"length":1},{"type":"BitMapValue","valueFor":"bleCli","bitShift":20,"length":1},{"type":"BitMapValue","valueFor":"blePasskey","bitShift":21,"length":1}]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"gpsStandbyTimeout","firmwareConfigurationFileParameterName":"gps_standby_timeout","bleId":17,"id":17,"defaultValue":0,"description":"Duration of the GPS standby mode before going OFF.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":2147483647}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"shockDetection","firmwareConfigurationFileParameterName":"shock_detection","bleId":21,"id":21,"defaultValue":0,"description":"This parameter provides the configuration of the sensitivity of the shock detection from 1 to 100%.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":255}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"gpsEHPEMotion","firmwareConfigurationFileParameterName":"gps_ehpe_motion","bleId":121,"id":121,"defaultValue":40,"description":"Acceptable GPS horizontal error for GPS geolocation. Applied when the tracker is in motion.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":100}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"gpsConvergenceMotion","firmwareConfigurationFileParameterName":"gps_convergence_motion","bleId":122,"id":122,"defaultValue":20,"description":"Time let to the GPS module to refine the calculated position. Applied when the tracker is in motion.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":300}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"gpsT0TimeoutMotion","firmwareConfigurationFileParameterName":"gps_t0_timeout_motion","bleId":123,"id":123,"defaultValue":30,"description":"Time in seconds to abort the GPS geolocation when not enough satellites are in view. Applied when the tracker is in motion.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":300}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"motionSensitivity","firmwareConfigurationFileParameterName":"motion_sensitivity","bleId":20,"id":20,"defaultValue":65537,"description":"Allows a fine tuning of the acceleration intensity to trigger a motion event.","parameterType":{"type":"ParameterTypeBitMap","properties":[{"name":"sensitivity","type":"PropertyNumber","description":"mode and sensitivity parameter.","range":{"minimum":1,"maximum":30},"additionalRanges":[{"minimum":100,"maximum":199}]},{"name":"outputDataRate","type":"PropertyString","description":"defines the output data rate","possibleValues":["12_5_HZ","25_HZ","50_HZ","100_HZ","200_HZ"],"firmwareValues":[0,1,2,3,4]},{"name":"fullScale","type":"PropertyString","description":"defines the full-scale","possibleValues":["2_G","4_G","8_G","16_G"],"firmwareValues":[0,1,2,3]}],"bitMap":[{"type":"BitMapValue","valueFor":"sensitivity","bitShift":0,"length":8},{"type":"BitMapValue","valueFor":"outputDataRate","bitShift":8,"length":8},{"type":"BitMapValue","valueFor":"fullScale","bitShift":16,"length":8}]}},{"driverParameterName":"motionDuration","firmwareConfigurationFileParameterName":"motion_duration","bleId":23,"id":23,"defaultValue":180,"description":"Defines the delay needed without any motion detection to generate a motion end event.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":20,"maximum":3600}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]}]},{"firmwareVersion":"2.4.1","uplinkPort":18,"firmwareParameters":[{"driverParameterName":"bleBeaconTimeout","firmwareConfigurationFileParameterName":"ble_beacon_timeout","bleId":16,"id":16,"defaultValue":3,"description":"BLE scan duration.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":1,"maximum":21}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"motionSensitivity","firmwareConfigurationFileParameterName":"motion_sensitivity","bleId":20,"id":20,"defaultValue":131073,"description":"Allows a fine tuning of the acceleration intensity to trigger a motion event.","parameterType":{"type":"ParameterTypeBitMap","properties":[{"name":"sensitivity","type":"PropertyNumber","description":"mode and sensitivity parameter.","range":{"minimum":1,"maximum":200}},{"name":"outputDataRate","type":"PropertyString","description":"defines the output data rate","possibleValues":["12_5_HZ","25_HZ","50_HZ","100_HZ","200_HZ"],"firmwareValues":[0,1,2,3,4]},{"name":"fullScale","type":"PropertyString","description":"defines the full-scale","possibleValues":["2_G","4_G","8_G","16_G"],"firmwareValues":[0,1,2,3]}],"bitMap":[{"type":"BitMapValue","valueFor":"sensitivity","bitShift":0,"length":8},{"type":"BitMapValue","valueFor":"outputDataRate","bitShift":8,"length":8},{"type":"BitMapValue","valueFor":"fullScale","bitShift":16,"length":8}]}}]},{"firmwareVersion":"2.5.0","uplinkPort":18,"firmwareParameters":[{"driverParameterName":"configFlags","firmwareConfigurationFileParameterName":"config_flags","bleId":13,"id":13,"defaultValue":213055,"description":"Configuration flags.","parameterType":{"type":"ParameterTypeBitMap","properties":[{"name":"framePendingMechanism","type":"PropertyBoolean","description":"false: Frame pending mechanism is disabled. true: Frame pending mechanism is enabled. "},{"name":"buttonPressToTurnOFF","type":"PropertyBoolean","description":"false: Cannot turn OFF device with a button press.true: Can turn OFF device with a button press. "},{"name":"doubleClickIsSosModeOrAlert","type":"PropertyBoolean","description":"false: Double button click triggers an Alert. true: Double button click starts SOS mode, another double click stops it."},{"name":"downlinkSetParameterConfirmation","type":"PropertyBoolean","description":"false: Confirmation uplink mechanism is disabled. true: Confirmation uplink mechanism is enabled. Factory default value"},{"name":"wifiPayloadWithNoCypher","type":"PropertyBoolean","description":" false: Wifi payload is cyphered.  true: Wifi payload is not cyphered."},{"name":"bleAdvertisingAtStart","type":"PropertyBoolean","description":"false: BLE advertising is disabled. Factory default value.  true: BLE advertising is enabled."},{"name":"selectWifiScanOrGeolocStartMessage","type":"PropertyBoolean","description":"false: Enable geoloc start event message when starting a geoloc sequence. true: Enable Wifi scan when starting a geoloc sequence."},{"name":"ledBlinkWithGpsFix","type":"PropertyBoolean","description":"false: No blink when a GPS fix is received. Factory default value.true: LED Blink when a GPS fix is received."},{"name":"startMotionEventUplink","type":"PropertyBoolean","description":" false: Start Motion event payload is disabled. Factory default value.true: Start Motion event payload is enabled."},{"name":"endMotionEventUplink","type":"PropertyBoolean","description":" false: End Motion event payload is disabled. Factory default value. true: End Motion event payload is enabled."},{"name":"otaJoinWhenLeavingModeOff","type":"PropertyBoolean","description":"false: Disable OTA join when leaving mode OFF. Factory default value.true: Enable OTA join when leaving mode OFF."},{"name":"rejectAsymmetricPairing","type":"PropertyBoolean","description":"false: Accept asymmetric BLE pairing. Factory default value.  true: Reject asymmetric BLE pairing."},{"name":"enableLongWifiPayload","type":"PropertyBoolean","description":"false: Long wifi payload is disabled. Factory default value. true: Long wifi payload is enabled."},{"name":"collectionLongReport","type":"PropertyBoolean","description":"false: The usual payload size is used (36 bytes). true: The number of entries carried in the uplink is larger and use a payload size of 91 bytes."},{"name":"autoStart","type":"PropertyBoolean","description":"false: Once LoRa join succeeds, the user needs to make another long press to actually start in the configured operating mode.true: Once LoRa join succeeds, the device automatically starts without requiring a long press."},{"name":"forbidModeOff","type":"PropertyBoolean","description":"false: Mode OFF is allowed. Factory default value. true: Mode OFF is forbidden. When Mode OFF is requested, the device goes in Standby mode instead."},{"name":"sosModeSound","type":"PropertyBoolean","description":"false: SOS mode sound disabled. true: SOS mode sound is enabled. "},{"name":"automaticDatarateSelection","type":"PropertyBoolean","description":"false: automatic datarate selection is disabled. true: automatic datarate selection is enabled. "},{"name":"extendedPosition","type":"PropertyBoolean","description":"false: Position messages are using Common Header. true: Position messages are using Extended Common Header and the format of some positions is changed. "},{"name":"bleCli","type":"PropertyBoolean","description":"false: BLE CLI disabled. true: BLE CLI enabled. "},{"name":"blePasskey","type":"PropertyBoolean","description":"true: the tracker will require the passkey for the bonding procedure. "},{"name":"wifiDatabase","type":"PropertyBoolean","description":"true: the tracker will send WIFI and GPS position on motion end. "},{"name":"activeWifiScan","type":"PropertyBoolean","description":"true: active WIFI scan. "}],"bitMap":[{"type":"BitMapValue","valueFor":"framePendingMechanism","bitShift":0,"length":1},{"type":"BitMapValue","valueFor":"buttonPressToTurnOFF","bitShift":1,"length":1},{"type":"BitMapValue","valueFor":"doubleClickIsSosModeOrAlert","bitShift":2,"length":1},{"type":"BitMapValue","valueFor":"downlinkSetParameterConfirmation","bitShift":3,"length":1},{"type":"BitMapValue","valueFor":"wifiPayloadWithNoCypher","bitShift":4,"length":1},{"type":"BitMapValue","valueFor":"bleAdvertisingAtStart","bitShift":5,"length":1},{"type":"BitMapValue","valueFor":"selectWifiScanOrGeolocStartMessage","bitShift":6,"length":1},{"type":"BitMapValue","valueFor":"ledBlinkWithGpsFix","bitShift":7,"length":1},{"type":"BitMapValue","valueFor":"startMotionEventUplink","bitShift":8,"length":1},{"type":"BitMapValue","valueFor":"endMotionEventUplink","bitShift":9,"length":1},{"type":"BitMapValue","valueFor":"otaJoinWhenLeavingModeOff","bitShift":10,"length":1},{"type":"BitMapValue","valueFor":"rejectAsymmetricPairing","bitShift":11,"length":1},{"type":"BitMapValue","valueFor":"enableLongWifiPayload","bitShift":12,"length":1},{"type":"BitMapValue","valueFor":"collectionLongReport","bitShift":13,"length":1},{"type":"BitMapValue","valueFor":"autoStart","bitShift":14,"length":1},{"type":"BitMapValue","valueFor":"forbidModeOff","bitShift":15,"length":1},{"type":"BitMapValue","valueFor":"sosModeSound","bitShift":16,"length":1},{"type":"BitMapValue","valueFor":"automaticDatarateSelection","bitShift":17,"length":1},{"type":"BitMapValue","valueFor":"extendedPosition","bitShift":18,"length":1},{"type":"BitMapValue","valueFor":"bleCli","bitShift":20,"length":1},{"type":"BitMapValue","valueFor":"blePasskey","bitShift":21,"length":1},{"type":"BitMapValue","valueFor":"wifiDatabase","bitShift":22,"length":1},{"type":"BitMapValue","valueFor":"activeWifiScan","bitShift":23,"length":1}]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]},{"driverParameterName":"confirmedUlBitmap","firmwareConfigurationFileParameterName":"confirmed_ul_bitmap","bleId":18,"id":18,"defaultValue":0,"description":"Bitmap enabling the LoRaWAN confirmation of specific type of uplink message.","parameterType":{"type":"ParameterTypeBitMap","properties":[{"name":"framePending","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of frame pending message. true: Enables the LoRaWAN confirmation of frame pending message"},{"name":"position","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of position message. true: Enables the LoRaWAN confirmation of position message"},{"name":"energyStatus","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of energy status message. true: Enables the LoRaWAN confirmation of energy status message"},{"name":"healthStatus","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of health status message. true: Enables the LoRaWAN confirmation of health status message"},{"name":"heartbeat","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of heartbeat message. true: Enables the LoRaWAN confirmation of heartbeat message"},{"name":"activityStatus","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of activityStatus message. true: Enables the LoRaWAN confirmation of activityStatus message"},{"name":"configuration","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of configuration message. true: Enables the LoRaWAN confirmation of configuration message"},{"name":"shockDetection","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of shockDetection message. true: Enables the LoRaWAN confirmation of shockDetection message"},{"name":"shutdown","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of shutdown message. true: Enables the LoRaWAN confirmation of shutdown message"},{"name":"event","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of event message. true: Enables the LoRaWAN confirmation of event message"},{"name":"scanCollection","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of scanCollection message. true: Enables the LoRaWAN confirmation of scanCollection message"},{"name":"proximity","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of proximity message. true: Enables the LoRaWAN confirmation of proximity message"},{"name":"sms","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of SMS message. true: Enables the LoRaWAN confirmation of SMS message"},{"name":"extendedPosition","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of extendedPosition message. true: Enables the LoRaWAN confirmation of extendedPosition message"},{"name":"debug","type":"PropertyBoolean","description":"false: Disables the LoRaWAN confirmation of debug message. true: Enables the LoRaWAN confirmation of debug message"}],"bitMap":[{"type":"BitMapValue","valueFor":"framePending","bitShift":0,"length":1},{"type":"BitMapValue","valueFor":"position","bitShift":3,"length":1},{"type":"BitMapValue","valueFor":"energyStatus","bitShift":4,"length":1},{"type":"BitMapValue","valueFor":"healthStatus","bitShift":4,"length":1},{"type":"BitMapValue","valueFor":"heartbeat","bitShift":5,"length":1},{"type":"BitMapValue","valueFor":"activityStatus","bitShift":7,"length":1},{"type":"BitMapValue","valueFor":"shockDetection","bitShift":7,"length":1},{"type":"BitMapValue","valueFor":"configuration","bitShift":7,"length":1},{"type":"BitMapValue","valueFor":"shutdown","bitShift":9,"length":1},{"type":"BitMapValue","valueFor":"event","bitShift":10,"length":1},{"type":"BitMapValue","valueFor":"scanCollection","bitShift":11,"length":1},{"type":"BitMapValue","valueFor":"proximity","bitShift":12,"length":1},{"type":"BitMapValue","valueFor":"sms","bitShift":13,"length":1},{"type":"BitMapValue","valueFor":"extendedPosition","bitShift":14,"length":1},{"type":"BitMapValue","valueFor":"debug","bitShift":15,"length":1}]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]}]},{"firmwareVersion":"2.6.0","uplinkPort":18,"firmwareParameters":[{"driverParameterName":"configFlags","firmwareConfigurationFileParameterName":"config_flags","bleId":13,"id":13,"defaultValue":213055,"description":"Configuration flags.","parameterType":{"type":"ParameterTypeBitMap","properties":[{"name":"framePendingMechanism","type":"PropertyBoolean","description":"false: Frame pending mechanism is disabled. true: Frame pending mechanism is enabled. "},{"name":"buttonPressToTurnOFF","type":"PropertyBoolean","description":"false: Cannot turn OFF device with a button press.true: Can turn OFF device with a button press. "},{"name":"doubleClickIsSosModeOrAlert","type":"PropertyBoolean","description":"false: Double button click triggers an Alert. true: Double button click starts SOS mode, another double click stops it."},{"name":"downlinkSetParameterConfirmation","type":"PropertyBoolean","description":"false: Confirmation uplink mechanism is disabled. true: Confirmation uplink mechanism is enabled. Factory default value"},{"name":"wifiPayloadWithNoCypher","type":"PropertyBoolean","description":" false: Wifi payload is cyphered.  true: Wifi payload is not cyphered."},{"name":"bleAdvertisingAtStart","type":"PropertyBoolean","description":"false: BLE advertising is disabled. Factory default value.  true: BLE advertising is enabled."},{"name":"selectWifiScanOrGeolocStartMessage","type":"PropertyBoolean","description":"false: Enable geoloc start event message when starting a geoloc sequence. true: Enable Wifi scan when starting a geoloc sequence."},{"name":"ledBlinkWithGpsFix","type":"PropertyBoolean","description":"false: No blink when a GPS fix is received. Factory default value.true: LED Blink when a GPS fix is received."},{"name":"startMotionEventUplink","type":"PropertyBoolean","description":" false: Start Motion event payload is disabled. Factory default value.true: Start Motion event payload is enabled."},{"name":"endMotionEventUplink","type":"PropertyBoolean","description":" false: End Motion event payload is disabled. Factory default value. true: End Motion event payload is enabled."},{"name":"otaJoinWhenLeavingModeOff","type":"PropertyBoolean","description":"false: Disable OTA join when leaving mode OFF. Factory default value.true: Enable OTA join when leaving mode OFF."},{"name":"rejectAsymmetricPairing","type":"PropertyBoolean","description":"false: Accept asymmetric BLE pairing. Factory default value.  true: Reject asymmetric BLE pairing."},{"name":"enableLongWifiPayload","type":"PropertyBoolean","description":"false: Long wifi payload is disabled. Factory default value. true: Long wifi payload is enabled."},{"name":"collectionLongReport","type":"PropertyBoolean","description":"false: The usual payload size is used (36 bytes). true: The number of entries carried in the uplink is larger and use a payload size of 91 bytes."},{"name":"autoStart","type":"PropertyBoolean","description":"false: Once LoRa join succeeds, the user needs to make another long press to actually start in the configured operating mode.true: Once LoRa join succeeds, the device automatically starts without requiring a long press."},{"name":"forbidModeOff","type":"PropertyBoolean","description":"false: Mode OFF is allowed. Factory default value. true: Mode OFF is forbidden. When Mode OFF is requested, the device goes in Standby mode instead."},{"name":"sosModeSound","type":"PropertyBoolean","description":"false: SOS mode sound disabled. true: SOS mode sound is enabled. "},{"name":"automaticDatarateSelection","type":"PropertyBoolean","description":"false: automatic datarate selection is disabled. true: automatic datarate selection is enabled. "},{"name":"extendedPosition","type":"PropertyBoolean","description":"false: Position messages are using Common Header. true: Position messages are using Extended Common Header and the format of some positions is changed. "},{"name":"bleCli","type":"PropertyBoolean","description":"false: BLE CLI disabled. true: BLE CLI enabled. "},{"name":"blePasskey","type":"PropertyBoolean","description":"true: the tracker will require the passkey for the bonding procedure. "},{"name":"wifiDatabase","type":"PropertyBoolean","description":"true: the tracker will send WIFI and GPS position on motion end. "},{"name":"activeWifiScan","type":"PropertyBoolean","description":"true: active WIFI scan. "},{"name":"gnssHoldOnEnable","type":"PropertyBoolean","description":"true: GNSS hold-on mode enabled. "}],"bitMap":[{"type":"BitMapValue","valueFor":"framePendingMechanism","bitShift":0,"length":1},{"type":"BitMapValue","valueFor":"buttonPressToTurnOFF","bitShift":1,"length":1},{"type":"BitMapValue","valueFor":"doubleClickIsSosModeOrAlert","bitShift":2,"length":1},{"type":"BitMapValue","valueFor":"downlinkSetParameterConfirmation","bitShift":3,"length":1},{"type":"BitMapValue","valueFor":"wifiPayloadWithNoCypher","bitShift":4,"length":1},{"type":"BitMapValue","valueFor":"bleAdvertisingAtStart","bitShift":5,"length":1},{"type":"BitMapValue","valueFor":"selectWifiScanOrGeolocStartMessage","bitShift":6,"length":1},{"type":"BitMapValue","valueFor":"ledBlinkWithGpsFix","bitShift":7,"length":1},{"type":"BitMapValue","valueFor":"startMotionEventUplink","bitShift":8,"length":1},{"type":"BitMapValue","valueFor":"endMotionEventUplink","bitShift":9,"length":1},{"type":"BitMapValue","valueFor":"otaJoinWhenLeavingModeOff","bitShift":10,"length":1},{"type":"BitMapValue","valueFor":"rejectAsymmetricPairing","bitShift":11,"length":1},{"type":"BitMapValue","valueFor":"enableLongWifiPayload","bitShift":12,"length":1},{"type":"BitMapValue","valueFor":"collectionLongReport","bitShift":13,"length":1},{"type":"BitMapValue","valueFor":"autoStart","bitShift":14,"length":1},{"type":"BitMapValue","valueFor":"forbidModeOff","bitShift":15,"length":1},{"type":"BitMapValue","valueFor":"sosModeSound","bitShift":16,"length":1},{"type":"BitMapValue","valueFor":"automaticDatarateSelection","bitShift":17,"length":1},{"type":"BitMapValue","valueFor":"extendedPosition","bitShift":18,"length":1},{"type":"BitMapValue","valueFor":"bleCli","bitShift":20,"length":1},{"type":"BitMapValue","valueFor":"blePasskey","bitShift":21,"length":1},{"type":"BitMapValue","valueFor":"wifiDatabase","bitShift":22,"length":1},{"type":"BitMapValue","valueFor":"activeWifiScan","bitShift":23,"length":1},{"type":"BitMapValue","valueFor":"gnssHoldOnEnable","bitShift":24,"length":1}]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"micro-tracker","version":"2"},{"producerId":"abeeway","moduleId":"micro-tracker","version":"3"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"1"},{"producerId":"abeeway","moduleId":"indus-tracker","version":"2"},{"producerId":"abeeway","moduleId":"compact-tracker","version":"1"},{"producerId":"abeeway","moduleId":"smart-badge","version":"1"}]}]}]');

/***/ }),

/***/ 644:
/***/ ((module) => {

function BssidInfo (bssid,rssi){
        this.bssid = bssid;
        this.rssi = rssi;
}

module.exports = {
    BssidInfo: BssidInfo
}

/***/ }),

/***/ 666:
/***/ ((module) => {

module.exports = Object.freeze({
    CHARGING: "CHARGING",
    OPERATING: "OPERATING",
    UNKNOWN: "UNKNOWN"
});

/***/ }),

/***/ 678:
/***/ ((module) => {

module.exports = Object.freeze({
    POS_ON_DEMAND: "POS_ON_DEMAND",
    SET_MODE: "SET_MODE",
    REQUEST_CONFIG: "REQUEST_CONFIG",
    START_SOS: "START_SOS",
    STOP_SOS: "STOP_SOS",
    REQUEST_TEMPERATURE_STATUS: "REQUEST_TEMPERATURE_STATUS",
    PROXIMITY: "PROXIMITY",
    ANGLE_DETECTION :"ANGLE_DETECTION",
    REQUEST_STATUS: "REQUEST_STATUS",
    SET_PARAM: "SET_PARAM",
    CLEAR_MOTION_PERCENTAGE: "CLEAR_MOTION_PERCENTAGE",
    SMS: "SMS",
    DEBUG_COMMAND: "DEBUG_COMMAND"
});

/***/ }),

/***/ 698:
/***/ ((module) => {

module.exports = Object.freeze({
	STOP_ANGLE_DETECTION: "STOP_ANGLE_DETECTION",
	START_ANGLE_DETECTION: "START_ANGLE_DETECTION"

});

/***/ }),

/***/ 751:
/***/ ((module) => {

function AngleDetection (flags, age, referenceGravityVector, criticalGravityVector, angle){
        this.flags = flags;
        this.age = age;
        this.referenceVector = referenceGravityVector;
        this.criticalVector = criticalGravityVector;
        this.angle =angle;
}

module.exports = {
  AngleDetection: AngleDetection
 	
}


/***/ }),

/***/ 760:
/***/ ((module) => {

function AbeewayUplinkPayload(gpsLatitude, 
    gpsLongitude,
    horizontalAccuracy,
    messageType,
    age,
    trackingMode,
    batteryVoltage,
    batteryLevel,
    batteryStatus,
    ackToken,
    firmwareVersion,
    bleFirmwareVersion,
    bleMac,
    resetCause,
    rawPositionType,
    periodicPosition,
    gpsOnRuntime,
    gpsStandbyRuntime,
    wifiScanCount,
    timeoutCause,
    bestSatellitesCOverN,
    temperatureMeasure,
    miscDataTag,
    sosFlag,
    appState,
    dynamicMotionState,
    onDemand,
    batteryVoltageMeasures,
    errorCode,
    debugErrorCode,
    genericErrorCode,
    shutdownCause,
    currentAckTokenValue,
    payload,
    debugCrashInfo,
    activityCount,
    deviceConfiguration,
    wifiBssids,
    bleBssids,
    bleBeaconIds,
    bleBeaconFailure,
    eventType,
    debugCommandTag,
    txPowerIndex,
    nbOfshock,
    accelerometerShockData,
    trackerOrientation,
    activityReportingWindow,
    measuredTemperature,
    lengthErrCounter,
    dataScanCollection,
    proximityNotification,
    proximityDailyReport,
    proximityWhiteListing,
    proximityDailyResponse,
    angleDetection, 
    geofencingNotification,
    specificFirmwareParameters,
    gpsAltitude,
    gpsCourseOverGround,
    gpsSpeedOverGround,
    gpsFixStatus,
    gpsPayloadType,
    gpsPrevious,
    healthStatus,
    motionDutyCycle,
    gaddIndex,
    sms) {
    this.gpsLatitude = gpsLatitude;
    this.gpsLongitude = gpsLongitude;
    this.gpsAltitude = gpsAltitude;
    this.gpsCourseOverGround = gpsCourseOverGround;
    this.gpsSpeedOverGround = gpsSpeedOverGround;
    this.gpsFixStatus = gpsFixStatus;
    this.gpsPayloadType = gpsPayloadType;
    this.horizontalAccuracy = horizontalAccuracy;
    this.gpsPrevious = gpsPrevious;
    this.messageType = messageType;
    this.age = age;
    this.trackingMode = trackingMode;
    this.batteryVoltage = batteryVoltage;
    this.batteryLevel = batteryLevel;
    this.batteryStatus = batteryStatus;
    this.ackToken = ackToken;
    this.firmwareVersion = firmwareVersion;
    this.bleFirmwareVersion = bleFirmwareVersion;
    this.bleMac = bleMac;
    this.resetCause = resetCause;
    this.rawPositionType = rawPositionType;
    this.periodicPosition = periodicPosition;
    this.gpsOnRuntime = gpsOnRuntime;
    this.gpsStandbyRuntime = gpsStandbyRuntime;
    this.wifiScanCount = wifiScanCount;
    this.timeoutCause = timeoutCause;
    this.bestSatellitesCOverN = bestSatellitesCOverN;
    this.temperatureMeasure = temperatureMeasure;
    this.miscDataTag = miscDataTag;
    this.sosFlag = sosFlag;
    this.appState = appState;
    this.dynamicMotionState = dynamicMotionState;
    this.onDemand = onDemand;
    this.batteryVoltageMeasures = batteryVoltageMeasures;
    this.errorCode = errorCode;
    this.debugErrorCode = debugErrorCode;
    this.genericErrorCode = genericErrorCode;
    this.shutdownCause = shutdownCause;
    this.currentAckTokenValue = currentAckTokenValue;
    this.payload = payload;
    this.debugCrashInfo = debugCrashInfo;
    this.activityCount = activityCount;
    this.deviceConfiguration = deviceConfiguration;
    this.wifiBssids = wifiBssids;
    this.bleBssids = bleBssids;
    this.bleBeaconIds = bleBeaconIds;
    this.bleBeaconFailure = bleBeaconFailure;
    this.eventType = eventType;
    this.debugCommandTag = debugCommandTag;
    this.txPowerIndex = txPowerIndex;
    this.nbOfshock = nbOfshock;
    this.accelerometerShockData = accelerometerShockData;
    this.trackerOrientation = trackerOrientation;
    this.activityReportingWindow = activityReportingWindow;
    this.measuredTemperature = measuredTemperature;
    this.lengthErrCounter = lengthErrCounter;
    this.dataScanCollection = dataScanCollection;
    this.proximityNotification = proximityNotification;
    this.proximityDailyReport = proximityDailyReport;
    this.proximityWhiteListing = proximityWhiteListing;
    this.proximityDailyResponse = proximityDailyResponse;
    this.angleDetection =angleDetection;
    this.geofencingNotification = geofencingNotification;
    this.specificFirmwareParameters = specificFirmwareParameters;
    this.healthStatus = healthStatus;
    this.motionDutyCycle = motionDutyCycle;
    this.gaddIndex = gaddIndex;
    this.sms = sms;
}

module.exports = {
    AbeewayUplinkPayload: AbeewayUplinkPayload
}

/***/ }),

/***/ 766:
/***/ ((module) => {

module.exports = Object.freeze({
    INVALID_GEOLOC_SENSOR: "INVALID_GEOLOC_SENSOR",
    INVALID_GEOLOC_CONFIG: "INVALID_GEOLOC_CONFIG"
});

/***/ }),

/***/ 768:
/***/ ((module) => {

module.exports = Object.freeze({
    USER_ACTION: "USER_ACTION",
    LOW_BATTERY: "LOW_BATTERY",
    DOWNLINK_REQUEST: "DOWNLINK_REQUEST",
    BLE_REQUEST: "BLE_REQUEST",
    BLE_CONNECTED: "BLE_CONNECTED"
});

/***/ }),

/***/ 781:
/***/ ((module) => {

module.exports = Object.freeze({
    STATIC: "STATIC",
    MOVING: "MOVING"
});

/***/ }),

/***/ 787:
/***/ ((module) => {

module.exports = Object.freeze({
    USER_TIMEOUT: "USER_TIMEOUT",
    T0_TIMEOUT: "T0_TIMEOUT",
    T1_TIMEOUT: "T1_TIMEOUT",
    UNKNOWN: "UNKNOWN"
});

/***/ }),

/***/ 821:
/***/ ((module) => {

module.exports = Object.freeze({
    GEOLOC_START: "GEOLOC_START",
    MOTION_START: "MOTION_START",
    MOTION_END: "MOTION_END",
    BLE_CONNECTED: "BLE_CONNECTED",
    BLE_DISCONNECTED: "BLE_DISCONNECTED",
    TEMPERATURE_ALERT: "TEMPERATURE_ALERT",
    BLE_BOND_DELETED: "BLE_BOND_DELETED",
    SOS_MODE_START: "SOS_MODE_START",
    SOS_MODE_END: "SOS_MODE_END",
    ANGLE_DETECTION: "ANGLE_DETECTION",
    GEOFENCING: "GEOFENCING"
});

/***/ }),

/***/ 838:
/***/ ((module) => {

module.exports = Object.freeze({
    STAND_BY: "STAND_BY",
    MOTION_TRACKING: "MOTION_TRACKING",
    PERMANENT_TRACKING: "PERMANENT_TRACKING",
    MOTION_START_END_TRACKING: "MOTION_START_END_TRACKING",
    ACTIVITY_TRACKING: "ACTIVITY_TRACKING",
    OFF: "OFF",
    UNKNOWN: "UNKNOWN"
});

/***/ }),

/***/ 841:
/***/ ((module) => {

function ProximityMessage (type,rollingProximityIdentifier,recordStatus,dayIdentifier){
        this.type = type;
        this.rollingProximityIdentifier = rollingProximityIdentifier;
        this.recordStatus = recordStatus;
        this.dayIdentifier = dayIdentifier;
}

module.exports = {
    ProximityMessage: ProximityMessage,
    Type: {
        GET_RECORD_STATUS: "GET_RECORD_STATUS",
        SET_WHITE_LIST_STATUS: "SET_WHITE_LIST_STATUS",
        GET_DAILY_INFORMATION: "GET_DAILY_INFORMATION",
        CLEAR_DAILY_INFORMATION: "CLEAR_DAILY_INFORMATION"
    },
    SetRecordStatus: {
        RESET_WHITE_LISTING: "RESET_WHITE_LISTING",
        SET_WHITE_LISTING: "SET_WHITE_LISTING"
    }
}

/***/ }),

/***/ 889:
/***/ ((module) => {

module.exports = Object.freeze({
    RESET: "RESET",
    READ_CURRENT_ERROR_AND_SEND_IT: "READ_CURRENT_ERROR_AND_SEND_IT",
    MAKE_TRACKER_RING: "MAKE_TRACKER_RING",
    TRIGGER_AN_ERROR: "TRIGGER_AN_ERROR",
    RESET_BLE_PAIRING: "RESET_BLE_PAIRING",
    TRIGGER_HEARTBEAT_MESSAGE: "TRIGGER_HEARTBEAT_MESSAGE",
    READ_TX_POWER_INDEX: "READ_TX_POWER_INDEX",
    WRITE_TX_POWER_INDEX: "WRITE_TX_POWER_INDEX",
    TRIGGER_BLE_BOOTLOADER: "TRIGGER_BLE_BOOTLOADER",
    SPECIFIC_FIRMWARE_PARAMETERS_REQUEST: "SPECIFIC_FIRMWARE_PARAMETERS_REQUEST",
    CONFIGURE_STARTUP_MODES: "CONFIGURE_STARTUP_MODES",
    START_AND_STOP_BLE_ADVERTISEMENT:"START_AND_STOP_BLE_ADVERTISEMENT"
});

/***/ }),

/***/ 918:
/***/ ((module) => {

module.exports = Object.freeze({
    POSITION_MESSAGE: "POSITION_MESSAGE",
    EXTENDED_POSITION_MESSAGE: "EXTENDED_POSITION_MESSAGE",
    HEARTBEAT: "HEARTBEAT",
    ENERGY_STATUS: "ENERGY_STATUS",
    HEALTH_STATUS: "HEALTH_STATUS",
    SHUTDOWN: "SHUTDOWN",
    FRAME_PENDING: "FRAME_PENDING",
    DEBUG: "DEBUG",
    ACTIVITY_STATUS: "ACTIVITY_STATUS",
    CONFIGURATION: "CONFIGURATION",
    SHOCK_DETECTION: "SHOCK_DETECTION",
    BLE_MAC: "BLE_MAC",
    HEARTBEAT: "HEARTBEAT",
    EVENT: "EVENT",
    DATA_SCAN_COLLECTION: "DATA_SCAN_COLLECTION",
    PROXIMITY_DETECTION: "PROXIMITY_DETECTION",
    SMS: "SMS",
    UNKNOWN: "UNKNOWN"
});



/***/ }),

/***/ 991:
/***/ ((module) => {

function GeofencingNotification(geofencingFormat, geofencingType, id)
  {
            this.geofencingFormat = geofencingFormat;
            this.geofencingType = geofencingType;
            this.id = id;
  }

module.exports = {
	GeofencingNotification: GeofencingNotification,
	GeofencingType: {
        SAFE_AREA: "SAFE_AREA",
        ENTRY: "ENTRY",
        EXIT: "EXIT",
        HAZARD: "HAZARD"
    }
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(44);
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});