
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

/***/ 44:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

let abeewayUplinkPayloadClass = __webpack_require__(962);
let abeewayDownlinkPayloadClass = __webpack_require__(522);
let basicHeadeClass = __webpack_require__(592);
let extendedHeaderClass = __webpack_require__(271);
let notificationClass = __webpack_require__(977);
let positionClass = __webpack_require__(457);
let responseClass = __webpack_require__(289);
let queryClass = __webpack_require__(220);
let util = __webpack_require__(94);
let commandClass = __webpack_require__(851);
let requestClass = __webpack_require__(788);
let telemetryClass = __webpack_require__(560);

const DOWNLINK_PORT_NUMBER = 3;

const removeEmpty = (obj) => {
    Object.keys(obj).forEach(k =>
      (obj[k] && typeof obj[k] === 'object') && removeEmpty(obj[k]) ||
      (!obj[k] && (obj[k] === null || obj[k] === undefined)) && delete obj[k] 
    );
    return obj;
  };



function decodeUplink(input) {
    let result = {
        data: {},
        errors: [],
        warnings: []
    }
    try{
        var decodedData = new abeewayUplinkPayloadClass.AbeewayUplinkPayload();
        var payload = input.bytes;
        var receivedTime = input.recvTime;

        //header decoding
        decodedData.header = basicHeadeClass.determineHeader(payload,receivedTime);

        //if multiframe is true
        var multiFrame = !!(payload[0]>>7 & 0x01);
        if (multiFrame){
            decodedData.extendedHeader = extendedHeaderClass.determineExtendedHeader(payload);
        }
        decodedData.payload = util.convertBytesToString(payload);
        switch (decodedData.header.type){
            case abeewayUplinkPayloadClass.messageType.NOTIFICATION:
                decodedData.notification = notificationClass.determineNotification(payload);
                break;
            case abeewayUplinkPayloadClass.messageType.POSITION:
                decodedData.position = positionClass.determinePosition(payload, multiFrame);
                break;
            case abeewayUplinkPayloadClass.messageType.QUERY:
                decodedData.query = queryClass.determineQuery(payload);
                break;
            case abeewayUplinkPayloadClass.messageType.RESPONSE:
                decodedData.response = responseClass.determineResponse(payload, multiFrame);
                break;
            case abeewayUplinkPayloadClass.messageType.TELEMETRY:
                decodedData.telemetry = telemetryClass.decodeTelemetry(payload);
                break;
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

function decodeDownlink(input){
    let result = {
        data: {},
        errors: [],
        warnings: []
    }
    try{
        var payload = input.bytes;
        var decodedData = new abeewayDownlinkPayloadClass.determineDownlinkHeader(payload);
        decodedData.payload = util.convertBytesToString(payload);
        switch (decodedData.downMessageType){
            case abeewayDownlinkPayloadClass.MessageType.COMMAND:
                decodedData.command = commandClass.decodeCommand(payload.slice(1))
                break;
            case abeewayDownlinkPayloadClass.MessageType.REQUEST:
                decodedData.request = requestClass.decodeRequest(payload)
                break;
            case abeewayDownlinkPayloadClass.MessageType.ANSWER:
                decodedData.response = responseClass.determineResponse(payload, multiFrame);
                break;
        }
        decodedData = removeEmpty(decodedData);
        result.data= decodedData;
    }
    catch (e){
        result.errors.push(e.message);
        delete result.data;
        return result;
    }
    return result;
}

function encodeDownlink(input){
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
            case abeewayDownlinkPayloadClass.MessageType.COMMAND:
                bytes = commandClass.encodeCommand(data);
                break;
            case abeewayDownlinkPayloadClass.MessageType.REQUEST:
                bytes = requestClass.encodeRequest(data);
                break;
            case abeewayDownlinkPayloadClass.MessageType.ANSWER:

                break;
            
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

module.exports = {
    decodeUplink: decodeUplink,
    decodeDownlink: decodeDownlink,
    encodeDownlink: encodeDownlink
}

//console.log(decodeUplink({recvTime: "2025-03-01T13:04:27.000+02:00", bytes: "2864871d80010000003c050091010384003c050ea2010000003c050e", "fPort":3}));

/***/ }),

/***/ 69:
/***/ ((module) => {

function BssidInfo(mac,
    rssi
){
    this.mac = mac;
    this.rssi = rssi;
}

module.exports = {
    BssidInfo: BssidInfo, 	
}

/***/ }),

/***/ 94:
/***/ ((module) => {

function convertToByteArray(payload){
    var bytes = [];
    var length = payload.length/2;
    for(var i = 0; i < payload.length; i+=2){
        bytes[i/2] = parseInt(payload.substring(i, i+2),16)&0xFF;
    }
    
    return bytes;
}
function isValueInRange(value, min, max) {
    return value >= min && value <= max;
}

function camelToSnake(string) {
       return string.replace(/[\w]([A-Z1-9])/g, function(m) {
           return m[0] + "_" + m[1];
       }).toUpperCase();
   }

function twoComplement(num) {
    if (num > 0x7FFFFFFF) {
        num -= 0x100000000;
    }
    return num
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

function convertNegativeInt(value, length) {
    if (value > (0x7F << 8*(length-1))){
        value -= 0x01<< 8*length;
	}
	return value;
}

function hexStringToInt(hexString) {
    if (hexString.startsWith("0x")) {
        hexString = hexString.slice(2);
    }
    return parseInt(hexString, 16);
}
// It allows to check the range validity of the parameter value 
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
    if (maximum== undefined && minimum== undefined){
        return true
    }
    if (((minimum == undefined || (exclusiveMinimum!=undefined && exclusiveMinimum == true && givenValue > minimum) ||
    givenValue>=minimum)) && (maximum == undefined || (exclusiveMaximum!=undefined && exclusiveMaximum == true && givenValue < maximum || (givenValue <=maximum))))
	    return true;
    return false;
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
function lengthToHex(length){  
    let hex =0;
	for (let i  =0; i<length; i++)
	{
		hex = hex + Math.pow(2,i)
	}
	//return parseInt(hex,16)
    return hex
}
module.exports = {
    convertToByteArray: convertToByteArray,
    camelToSnake: camelToSnake,
    convertBytesToString: convertBytesToString,
    convertByteToString: convertByteToString,
    decodeCondensed: decodeCondensed,
    convertNegativeInt: convertNegativeInt,
    twoComplement: twoComplement,
    isValueInRange: isValueInRange,
    hexStringToInt: hexStringToInt,
    checkParamValueRange: checkParamValueRange,
    hasNegativeNumber: hasNegativeNumber,
    lengthToHex: lengthToHex

    
}

/***/ }),

/***/ 142:
/***/ ((module) => {

function Network(activeNetwork, mainNetwork, backupNetwork){
    this.activeNetwork = activeNetwork;
    this.mainNetwork = mainNetwork;
    this.backupNetwork = backupNetwork;
}
const NetworkType = Object.freeze({
    MAIN_UP: "MAIN_UP",
    BACKUP_UP: "BACKUP_UP"
})

const NetworkInfo = Object.freeze({
    NO_NETWORK: "NO_NETWORK",
    LORA_NETWORK: "LORA_NETWORK",
    CELLULAR_NETWORK_IN_LOW_POWER_MODE: "CELLULAR_NETWORK_IN_LOW_POWER_MODE",
    CELLULAR_NETWORK_IN_HIGH_POWER_MODE: "CELLULAR_NETWORK_IN_HIGH_POWER_MODE"

})

function determineNetwork(value){
    switch(value){
        case 0:
            return NetworkInfo.NO_NETWORK;
        case 1:
            return NetworkInfo.LORA_NETWORK;
        case 2:
            return NetworkInfo.CELLULAR_NETWORK_IN_LOW_POWER_MODE;
        case 3:
            return NetworkInfo.CELLULAR_NETWORK_IN_HIGH_POWER_MODE;
        default:
            throw new Error("Unknown Network Information");
    }

}
function determineNetworkInfo(payload){
    let activeNetwork = determineNetwork(payload[5])
    let mainNetwork =  determineNetwork(payload[6])
    let backupNetwork = determineNetwork(payload[7])
    return new Network(activeNetwork, mainNetwork, backupNetwork);
}

module.exports = {
    Network: Network,
    determineNetworkInfo: determineNetworkInfo,
    NetworkType: NetworkType
}

/***/ }),

/***/ 187:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

let util = __webpack_require__(94);

function System(status,
    lowBattery, bleStatus, tamperDetection, heartbeat){
    this.status = status;
    this.lowBattery = lowBattery;
    this.bleStatus = bleStatus;
    this.tamperDetection = tamperDetection;
    this.heartbeat = heartbeat;
}
const SystemType = Object.freeze({
    STATUS: "STATUS",
    LOW_BATTERY: "LOW_BATTERY",
    BLE_STATUS: "BLE_STATUS",
    TAMPER_DETECTION: "TAMPER_DETECTION",
    HEARTBEAT : "HEARTBEAT"
})
const ResetCause = Object.freeze({
    AOS_ERROR_NONE: "AOS_ERROR_NONE",
    AOS_ERROR_HW_NMI: "AOS_ERROR_HW_NMI",
    AOS_ERROR_HW_FAULT: "AOS_ERROR_HW_FAULT",
    AOS_ERROR_HW_MPU: "AOS_ERROR_HW_MPU",
    AOS_ERROR_HW_BUS: "AOS_ERROR_HW_BUS",
    AOS_ERROR_HW_USAGE: "AOS_ERROR_HW_USAGE",
    AOS_ERROR_HW_IRQ: "AOS_ERROR_HW_IRQ",
    AOS_ERROR_HW_WDOG: "AOS_ERROR_HW_WDOG",
    AOS_ERROR_HW_BOR: "AOS_ERROR_HW_BOR",
    AOS_ERROR_SW_ST_HAL_ERROR: "AOS_ERROR_SW_ST_HAL_ERROR",
    AOS_ERROR_SW_FREERTOS_ASSERT: "AOS_ERROR_SW_FREERTOS_ASSERT",
    AOS_ERROR_SW_FREERTOS_TASK_OVF: "AOS_ERROR_SW_FREERTOS_TASK_OVF",
    AOS_ERROR_SW_BLE_ASSERT: "AOS_ERROR_SW_BLE_ASSERT",
    AOS_ERROR_SW_RTC_FAIL: "AOS_ERROR_SW_RTC_FAIL",
    AOS_ERROR_SW_LORA_FAIL: "AOS_ERROR_SW_LORA_FAIL",
    AOS_ERROR_SW_DEBUG: "AOS_ERROR_SW_DEBUG",
    AOS_ERROR_SW_APP_START: "AOS_ERROR_SW_APP_START",
})

function Status(currentTemperature, resetCause, pageId, AT3Version,
    configurationVersion,
    lrHwVersion,
    hwBatchId,
    hwBomId,
    maxTemperature,
    minTemperature,
    motionPercent,
    batteryVoltage,
    totalConsumption,
    cellularConsumption,
    gnssConsumption,
    wifiConsumption,
    lrGnssConsumption,
    bleConsumption,
    mcuConsumption,
    globalCrc,
    lr11xxGpsDate, 
    lr11xxGpsOutdated,
    lr11xxGpsGood,
    lr11xxBeidouDate,
    lr11xxBeidouOutdated,
    lr11xxBeidouGood,
    gnssGpsDate, 
    gnssGpsOutdated,
    gnssGpsGood,
    gnssBeidouDate,
    gnssBeidouOutdated,
    gnssBeidouGood,
    cellVersion,
    ICCID,
    IMSI,
    EUICCID,
    IMEISV
    ){
    this.currentTemperature = currentTemperature;
    this.resetCause = resetCause;
    this.pageId = pageId;
    this.AT3Version = AT3Version;
    this.configurationVersion = configurationVersion;
    this.lrHwVersion = lrHwVersion;
    this.hwBatchId = hwBatchId;
    this.hwBomId = hwBomId;
    this.maxTemperature = maxTemperature;
    this.minTemperature = minTemperature;
    this.motionPercent = motionPercent;
    this.batteryVoltage = batteryVoltage;
    this.totalConsumption = totalConsumption;
    this.cellularConsumption = cellularConsumption;
    this.gnssConsumption = gnssConsumption;
    this.wifiConsumption = wifiConsumption;
    this.lrGnssConsumption = lrGnssConsumption;
    this.bleConsumption = bleConsumption;
    this.mcuConsumption =mcuConsumption;
    this.globalCrc = globalCrc;
    this.lr11xxGpsDate = lr11xxGpsDate;
    this.lr11xxGpsOutdated = lr11xxGpsOutdated;
    this.lr11xxGpsGood = lr11xxGpsGood;
    this.lr11xxBeidouDate = lr11xxBeidouDate;
    this.lr11xxBeidouOutdated = lr11xxBeidouOutdated;
    this.lr11xxBeidouGood = lr11xxBeidouGood;
    this.gnssGpsDate = gnssGpsDate;
    this.gnssGpsOutdated = gnssGpsOutdated;
    this.gnssGpsGood = gnssGpsGood;
    this.gnssBeidouDate = gnssBeidouDate;
    this.gnssBeidouOutdated = gnssBeidouOutdated;
    this.gnssBeidouGood = gnssBeidouGood;   
    this.cellVersion = cellVersion;
    this.ICCID = ICCID;
    this.IMSI = IMSI;
    this.EUICCID = EUICCID;
    this.IMEISV = IMEISV;


}


function LowBattery(consumption, batteryVoltage){
    this.consumption = consumption;
    this.batteryVoltage = batteryVoltage;
}
function BleStatus(state){
    this.state = state
}
function TamperDetection(state){
    this.state = state
}
function Heartbeat(currentTemperature, resetCause, globalCrc){
    this.currentTemperature = currentTemperature;
    this.resetCause = resetCause;
    this.globalCrc = globalCrc;
}

function determineHeartbeat(payload) {
    var currentTemperature = util.convertNegativeInt(payload[5],1);
    var resetCause = determineResetCause(((payload[6]>>3)& 0x1F));
    // Extract the n bytes of the CRC (big-endian)
    const crcBytes = payload.slice(7, 11);
    // Convert each byte to a 2-digit hexadecimal string and concatenate
    const crc = crcBytes.map(b => b.toString(16).padStart(2, "0")).join("");
    return new Heartbeat(currentTemperature, resetCause, crc)
}
function determineLowBattery(payload){
    var consumption = (payload[5] << 8) + payload[6];
    var batteryVoltage = (payload[7] << 8) + payload[8];
    return new LowBattery(consumption, batteryVoltage

    )}

function determineStatus(payload){
    var currentTemperature = util.convertNegativeInt(payload[5],1);
    var resetCause = determineResetCause(((payload[6]>>3)& 0x1F));
    var pageId = payload[6] & 0x07
    var decodedStatus = new Status(currentTemperature, resetCause, pageId)
    switch (pageId){
        case 0:
            determinePage0(payload, decodedStatus)
            break;
        case 1: 
            determinePage1(payload, decodedStatus)
            break;
        case 2:
            determinePage2(payload, decodedStatus)
            break;
        case 3:
            determinePage3(payload, decodedStatus)
            break;
        default:
            throw new Error("Unknown page identifier");
    }
    return decodedStatus
}
function determineBleStatus(payload){
    switch (payload[5] & 0x01){
        case 0:
            return new BleStatus("BLE_DISCONNECTED")
        case 1:
            return new BleStatus("BLE_CONNECTED")

    }
}
function determineTamperDetection(payload){
    switch (payload[5] & 0x01){
        case 0:
            return new TamperDetection("CASING_CLOSED")
        case 1:
            return new TamperDetection("CASING_OPEN")

    }
}
function determinePage0(payload, decodedStatus){
    decodedStatus.AT3Version = payload[7].toString()+"."+payload[8].toString()+"."+payload[9].toString();
    decodedStatus.configurationVersion = payload[10].toString()+"."+payload[11].toString()+"."+payload[12].toString()+"."+payload[13].toString();
    decodedStatus.lrHwVersion = {"hardwareVersion": payload[14].toString(),"hardwareType": payload[15].toString(), "firmwareVersion":payload[16].toString()}
    decodedStatus.hwBatchId = (payload[17] <<8) + payload[18]
    decodedStatus.hwBomId = (payload[19] <<8) + payload[20]
    decodedStatus.maxTemperature = util.convertNegativeInt(payload[21],1);
    decodedStatus.minTemperature = util.convertNegativeInt(payload[22],1);
    decodedStatus.motionPercent = payload[23]
    decodedStatus.batteryVoltage = (payload[24] << 8) + payload[25];
    decodedStatus.totalConsumption = (payload[26] << 8) + payload[27];
    decodedStatus.cellularConsumption = (payload[28] << 8) + payload[29];
    decodedStatus.gnssConsumption = (payload[30] << 8) + payload[31];
    decodedStatus.wifiConsumption = (payload[32] << 8) + payload[33];
    decodedStatus.lrGnssConsumption = (payload[34] << 8) + payload[35];
    decodedStatus.bleConsumption = (payload[36] << 8) + payload[37];
    decodedStatus.mcuConsumption = (payload[38] << 8) + payload[39];
    const crcBytes = payload.slice(40, 44);
    // Convert each byte to a 2-digit hexadecimal string and concatenate
    decodedStatus.globalCrc = crcBytes.map(b => b.toString(16).padStart(2, "0")).join("");
}

function determinePage1(payload, decodedStatus){
    decodedStatus.lr11xxGpsDate = (payload[7] << 8) + payload[8];
    let value = (payload[9] << 24) + (payload[10] << 16) + (payload[11] << 8) + payload[12];
    decodedStatus.lr11xxGpsOutdated = gpsSatelliteField
        .filter(bit => getBit(value, bit.position))
        .map(bit => bit.position+1);
    decodedStatus.lr11xxGpsGood = payload[13]
    decodedStatus.lr11xxBeidouDate = (payload[14] << 8) + payload[15];
    let valueB = payload.slice(16,21)
    decodedStatus.lr11xxBeidouOutdated = beidouSatelliteField
        .filter(bit => getBitFromPayload(valueB, bit.position))
        .map(bit => bit.position+1);
    decodedStatus.lr11xxBeidouGood = payload[21]
    decodedStatus.gnssGpsDate = (payload[22] << 8) + payload[23];
    let valueG = (payload[24] << 24) + (payload[25] << 16) + (payload[26] << 8) + payload[27];
    decodedStatus.gnssGpsOutdated = gpsSatelliteField
        .filter(bit => getBit(valueG, bit.position))
        .map(bit => bit.position+1);
    decodedStatus.gnssGpsGood = payload[28]
    decodedStatus.gnssBeidouDate = (payload[29] << 8) + payload[30];
    let valueGB = payload.slice(31,36);
    decodedStatus.gnssBeidouOutdated = beidouSatelliteField
        .filter(bit => getBitFromPayload(valueGB, bit.position))
        .map(bit => bit.position+1);
    decodedStatus.gnssBeidouGood = payload[36];  
}
function determinePage2(payload, decodedStatus){
    decodedStatus.cellVersion = {"branch": payload[7].toString(),"mode": payload[8].toString(), "image":payload[9].toString(), "delivery": payload[10].toString(), "release": parseInt(util.convertBytesToString(payload.slice(11,13)),16).toString() }
    decodedStatus.ICCID = buildAscciString(payload.slice(13,33))
    decodedStatus.IMSI = buildAscciString(payload.slice(33))
}
function determinePage3(payload, decodedStatus){
    decodedStatus.EUICCID = buildAscciString(payload.slice(7,40))
    decodedStatus.IMEISV = buildAscciString(payload.slice(40))
}

function buildAscciString(value){
    // Find the position of the last non-zero element
    let endIndex = value.length;
    let allZero = true;  // Variable to check if all elements are zero
    for (let i = value.length - 1; i >= 0; i--) {
        if (value[i] !== 0) {
            endIndex = i + 1;
            allZero = false;   // Mark as not all zeros
            break;
        }
    }
    // If all elements are zero, return an empty string
    if (allZero) {
         return "";
    }
    // Create the ASCII string up to the last non-zero element
    var asciiString = ""
    for (var i = 0; i < endIndex; i ++)
        asciiString += String.fromCharCode(value[i]);
    return asciiString
}
function determineResetCause(value){
    switch(value){
        case 0:
            return ResetCause.AOS_ERROR_NONE;
        case 1:
            return ResetCause.AOS_ERROR_HW_NMI;
        case 2:
            return ResetCause.AOS_ERROR_HW_FAULT;
        case 3:
            return ResetCause.AOS_ERROR_HW_MPU;
        case 4:
            return ResetCause.AOS_ERROR_HW_BUS;
        case 5:
            return ResetCause.AOS_ERROR_HW_USAGE;
        case 6:
            return ResetCause.AOS_ERROR_HW_IRQ;
        case 7:
            return ResetCause.AOS_ERROR_HW_WDOG;
        case 8:
            return ResetCause.AOS_ERROR_HW_BOR;
        case 9:
            return ResetCause.AOS_ERROR_SW_ST_HAL_ERROR;
        case 10:
            return ResetCause.AOS_ERROR_SW_FREERTOS_ASSERT;
        case 11:
            return ResetCause.AOS_ERROR_SW_FREERTOS_TASK_OVF;
        case 12:
            return ResetCause.AOS_ERROR_SW_BLE_ASSERT;
        case 13:
            return ResetCause.AOS_ERROR_SW_RTC_FAIL;
        case 14:
            return ResetCause.AOS_ERROR_SW_LORA_FAIL;
        case 15:
            return ResetCause.AOS_ERROR_SW_DEBUG;
        case 16:
            return ResetCause.AOS_ERROR_SW_APP_START;
        default:
            throw new Error("Unknown Reset Cause");
    }
}
    
function getBit(value, position) {
    return (value >> position) & 1;
}
// Define a function to extract the bit value at a specific position from a byte
function getBitFromByte(byte, position) {
    return (byte & (1 << position)) !== 0 ? 1 : 0;
}

// Define a function to extract the bit value at a specific position from the payload
function getBitFromPayload(payload, position) {
    const byteIndex = Math.floor(position / 8);
    const bitIndex = position % 8;
    return getBitFromByte(payload[byteIndex], bitIndex);
}

// Define a bit gps field structure with positions only
let gpsSatelliteField = Array.from({ length: 32 }, (_, i) => ({
    position: i
}));
// Define a bit beidou field structure with positions only
let beidouSatelliteField = Array.from({ length: 40 }, (_, i) => ({
    position: i
}));

module.exports = {
    System: System,
    determineStatus: determineStatus,
    determineLowBattery: determineLowBattery,
    determineBleStatus: determineBleStatus,
    determineTamperDetection: determineTamperDetection,
    determineHeartbeat : determineHeartbeat,
    SystemType: SystemType
}

/***/ }),

/***/ 220:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

let util = __webpack_require__(94);
const QueryType = Object.freeze({
    AIDING_POSITION: "AIDING_POSITION",
    ECHO_REQUEST: "ECHO_REQUEST",
    UPDATE_GPS_ALMANAC: "UPDATE_GPS_ALMANAC",
    UPDATE_BEIDOU_ALMANAC: "UPDATE_BEIDOU_ALMANAC"
})

function Query(queryType,
    gpsSvid, beidouSvid, sequenceNumber){
        this.queryType = queryType;
        this.gpsSvid = gpsSvid;
        this.beidouSvid = beidouSvid;
        this.sequenceNumber = sequenceNumber;
}

function determineQuery(payload){
    let query = new Query();
    let typeValue = payload[4] & 0x1F;
    switch (typeValue){
        case 0:
            query.queryType = QueryType.AIDING_POSITION
            break;
        case 1:
            query.queryType = QueryType.ECHO_REQUEST
            query.sequenceNumber = payload.slice(5)
            break;
        case 2:
            query.queryType = QueryType.UPDATE_GPS_ALMANAC
            query.gpsSvid = determineSvId(payload.slice(5), 0, 31, "GPS")
            break;
        case 3:
            query.queryType = QueryType.UPDATE_BEIDOU_ALMANAC
            query.beidouSvid = determineSvId(payload.slice(5), 0, 34, "BEIDOU")
            break;
        default:
            throw new Error("Query Type Unknown");
    }
    return query;
}

function determineSvId(payload, min, max , constellation){
    let svid = [];
    for (let i = 0; i < payload.length; i++) {
        if (!util.isValueInRange(payload[i], min, max))
            throw new Error("Invalid "+constellation+" SVID Number");
        svid.push(payload[i]);
    }
    return svid
} 
module.exports = {
    Query: Query,
    determineQuery: determineQuery
}

/***/ }),

/***/ 271:
/***/ ((module) => {

function ExtendedHeader(groupId,
    last,
    frameNumber){
    this.groupId = groupId;
    this.last = last;
    this.frameNumber = frameNumber;
}

function determineExtendedHeader(payload){
    if (payload.length < 5)
        throw new Error("The payload is not valid to determine multi frame header");
    let extendedHeader = new ExtendedHeader(payload[4]>>5 & 0x07, 
        payload[4]>>4 & 0x01, 
        payload[4] & 0x07);
    return extendedHeader;
    
}

module.exports = {
    ExtendedHeader: ExtendedHeader,
    determineExtendedHeader: determineExtendedHeader
}

/***/ }),

/***/ 289:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* let requestClass = require("../../downlink/requests/request");
//response type is the same as request type
const responseType = requestClass.RequestType; */

let util = __webpack_require__(94);
let jsonParameters = __webpack_require__(635);
let accelerometer = __webpack_require__(925)

const ResponseType = Object.freeze({
    GENERIC_CONFIGURATION_SET: "GENERIC_CONFIGURATION_SET",
    PARAM_CLASS_CONFIGURATION_SET: "PARAM_CLASS_CONFIGURATION_SET",
    GENERIC_CONFIGURATION_GET: "GENERIC_CONFIGURATION_GET",
    PARAM_CLASS_CONFIGURATION_GET: "PARAM_CLASS_CONFIGURATION_GET",
    BLE_STATUS_CONNECTIVITY: "BLE_STATUS_CONNECTIVITY",
    CRC_CONFIGURATION_REQUEST : "CRC_CONFIGURATION_REQUEST",
    SENSOR_REQUEST: "SENSOR_REQUEST"
   
})
const StatusType = Object.freeze({
   SUCCESS: "SUCCESS",
   NOT_FOUND: "NOT_FOUND",
   BELOW_LOWER_BOUND: "BELOW_LOWER_BOUND",
   ABOVE_HIGHER_BOUND: "ABOVE_HIGHER_BOUND",
   BAD_VALUE: "BAD_VALUE",
   TYPE_MISMATCH: "TYPE_MISMATCH",
   OPERATION_ERROR : "OPERATION_ERROR",
   READ_ONLY: "READ_ONLY"
})

const GroupType = Object.freeze({
    INTERNAL: "INTERNAL",
    SYSTEM_CORE: "SYSTEM_CORE",
    GEOLOC: "GEOLOC",
    GNSS: "GNSS",
    LR11xx: "LR11xx",
    BLE_SCAN1: "BLE_SCAN1",
    BLE_SCAN2: "BLE_SCAN2",
    ACCELEROMETER : "ACCELEROMETER",
    NETWORK: "NETWORK",
    LORAWAN: "LORAWAN",
    CELLULAR: "CELLULAR",
    BLE : "BLE"
 })
const ParameterType = Object.freeze({
    DEPREACTED: "DEPREACTED",
    INTEGER: "INTEGER",
    FLOATING_POINT: "FLOATING_POINT",
    ASCCII_STRING: "ASCCII_STRING",
    BYTE_ARRAY: "BYTE_ARRAY"
})
function Response(responseType,
    genericConfigurationSet,
    parameterClassConfigurationSet,
    genericConfigurationGet,
    parameterClassConfigurationGet,
    bleStatusConnectivity,
    configurationCrcRequest,
    sensorRequest,
    globalCrc,
    localCrc
    ){
        this.responseType = responseType;
        this.genericConfigurationSet = genericConfigurationSet;
        this.parameterClassConfigurationSet = parameterClassConfigurationSet;
        this.genericConfigurationGet = genericConfigurationGet;
        this.parameterClassConfigurationGet = parameterClassConfigurationGet;
        this.bleStatusConnectivity= bleStatusConnectivity;
        this.configurationCrcRequest = configurationCrcRequest;
        this.sensorRequest = sensorRequest;
        this.globalCrc = globalCrc;
        this.localCrc = localCrc;
}
function ParameterClassConfigurationSet(group, parameters){
    this.group = group
    this.parameters = parameters
}

function determineResponse(payload, multiFrame){
    let response = new Response();
    let startingByte = 4;
    if (multiFrame){
        startingByte = 5;
    }
    let typeValue  = payload[startingByte] & 0x1F;
    switch (typeValue){
        case 0:
            response.responseType = ResponseType.GENERIC_CONFIGURATION_SET
            response.globalCrc =  decodeCrc(payload, startingByte+1,4)
            response.genericConfigurationSet = determineResponseGenericConfigurationSet(payload.slice(startingByte+5))
            break;
        case 1:
            response.responseType = ResponseType.PARAM_CLASS_CONFIGURATION_SET
            response.localCrc =  decodeCrc(payload, startingByte+2,3)
            response.parameterClassConfigurationSet = determineResponseParameterClassConfigurationSet(payload.slice(startingByte+1))
            break;
        case 2:
            response.responseType = ResponseType.GENERIC_CONFIGURATION_GET
            response.genericConfigurationGet = determineResponseGenericConfigurationGet(payload.slice(startingByte+1))
            break;
        case 3:
            response.responseType = ResponseType.PARAM_CLASS_CONFIGURATION_GET
            response.parameterClassConfigurationGet = determineResponseParameterClassConfigurationGet(payload.slice(startingByte+1))
            break;
        case 4:
            response.responseType = ResponseType.BLE_STATUS_CONNECTIVITY
            response.bleStatusConnectivity = decodeBLEStatus(payload.slice(startingByte+1))
            break;
        case 5:
            response.responseType = ResponseType.CRC_CONFIGURATION_REQUEST
            response.crc = decodeBitmapAndCRC(payload.slice(startingByte+1,startingByte+3),payload.slice(startingByte+3))
            break;
        case 6:
            response.responseType = ResponseType.SENSOR_REQUEST
            response.sensors = decodeSensorResponse(payload.slice(startingByte+1))
            break;
        default:
            throw new Error("Response Type Unknown");
    }
    return response

}
function decodeSensorResponse(data) {
    let offset = 0;
    const sensors = [];

    while (offset < data.length) {
        // Read the sensor ID (1 byte)
        const sensorId = data[offset];
        offset += 1;

        // Determine the sensor type and decode its value
        switch (sensorId) {
            case 1: // Accelerometer
                if (offset + 6 > data.length) {
                    throw new Error("Incomplete accelerometer data");
                }
                // Pass the correct offsets for X, Y, Z values
                const accelerationVector = accelerometer.determineAccelerationVector(
                    data.slice(offset - 1, offset + 6), // Payload slice
                    1, // X starts at byte 1 (relative to the slice)
                    3, // Y starts at byte 3 (relative to the slice)
                    5  // Z starts at byte 5 (relative to the slice)
                );
                sensors.push({
                    sensorId,
                    type: "ACCELEROMETER",
                    accelerationVector: [
                        accelerationVector[0],
                        accelerationVector[1],
                        accelerationVector[2]
                    ]
                });
                offset += 6; // Move offset by 6 bytes (X, Y, Z values)
                break;

            // Add cases for other sensor types here
            // Example:
            // case 2: // Another sensor type
            //     ...

            case 0: // Do not use
                break;

            default:
                throw new Error(`Unknown sensor ID: ${sensorId}`);
        }
    }

    return sensors;
}

function decodeBitmapAndCRC(bitmap, crcBytes) {
    // Helper function to decode group type
    function decodeGroupType(groupIdentifier) {
        switch (groupIdentifier) {
            case 0: return "INTERNAL";
            case 1: return "SYSTEM_CORE";
            case 2: return "GEOLOC";
            case 3: return "GNSS";
            case 4: return "LR11xx";
            case 5: return "BLE_SCAN1";
            case 6: return "BLE_SCAN2";
            case 7: return "ACCELEROMETER";
            case 8: return "NETWORK";
            case 9: return "LORAWAN";
            case 10: return "CELLULAR";
            case 11: return "BLE";
            default: throw new Error("Unknown group identifier");
        }
    }
    // Check if the bitmap is null or [0, 0]
    const isGlobalCRC = (Array.isArray(bitmap) && bitmap.length === 2 && bitmap[0] === 0 && bitmap[1] === 0);
    if (isGlobalCRC) {
        // Global CRC case (4 bytes)
        if (crcBytes.length !== 4) {
            throw new Error("Invalid global CRC length. Expected 4 bytes.");
        }
        const crcHex = Buffer.from(crcBytes).toString('hex').toUpperCase();
        return [`Global CRC: 0x${crcHex}`];
    } else {
        // Group CRC case (bitmap is not null)
        // Extract requested groups from the bitmap
        const requestedGroups = [];
           // Convert 2-byte array into an integer
        bitmap = (bitmap[0] << 8) | bitmap[1];
        for (let i = 0; i < 32; i++) { // Assuming up to 32 groups
            if (bitmap & (1 << i)) {
                requestedGroups.push(i);
            }
        }
        // Check if the number of CRCs matches the number of requested groups
        if (crcBytes.length !== requestedGroups.length * 3) {
            throw new Error("CRC bytes length does not match the number of requested groups.");
        }

        // Map CRCs to groups
        const result = [];
        for (let i = 0; i < requestedGroups.length; i++) {
            const groupIdentifier = requestedGroups[i];
            const groupName = decodeGroupType(groupIdentifier);
            const crcStartIndex = i * 3;
            const crcHex = Buffer.from(crcBytes.slice(crcStartIndex, crcStartIndex + 3)).toString('hex').toUpperCase();
            result.push(`${groupName}: 0x${crcHex}`);
        }

        return result;
    }
}

function decodeBLEStatus(bleStatusConnectivity) {
    switch (bleStatusConnectivity) {
        case 0:
            return "IDLE";
        case 1:
            return "ADVERTISING";
        case 2:
            return "CONNECTED";
        case 3:
            return "BONDED";
        default:
            return "UNKNOWN";
    }
}
function decodeCrc(payload, startingByte, byteNumber) {
    // Ensure the payload has enough bytes for the CRC
    if (payload.length < startingByte + byteNumber) {
        throw new Error("Payload is too short to contain a valid CRC.");
    }

    // Extract the n bytes of the CRC (big-endian)
    const crcBytes = payload.slice(startingByte, startingByte + byteNumber);
    // Convert each byte to a 2-digit hexadecimal string and concatenate
    const crc = crcBytes.map(b => b.toString(16).padStart(2, "0")).join("");
    return crc;
}

function determineResponseGenericConfigurationSet(payload){

    let i = 0;
    const step = 3;
    let response = []
    while (payload.length >= step * (i + 1)) {
        let groupId = payload[i*step]
        let localId = payload[1+i*step]
        let parameter = getParameterByGroupIdAndLocalId(parametersByGroupIdAndLocalId, groupId, localId)
        let status = determineStatusType(payload[2+i*step])
        let group = determineGroupType(groupId)
        // Find the group in the response object or create a new one if it doesn't exist
        let groupObject = response.find(g => g.group === group);
        if (!groupObject) {
            groupObject = { group: group, parameters: [] };
            response.push(groupObject);
        }

        // Add the parameter to the group's parameters array
        groupObject.parameters.push({
            parameterName: parameter.driverParameterName,
            status: status
        });

    i++;
    }
    return response
}
function determineResponseGenericConfigurationGet(payload){
    let i = 0;
    let response = []
    while (payload.length > i) {
        let groupId = payload[i]
        let localId = payload[1+i]
        let size = payload[2+i]>>3 & 0x1F;
        let dataType = payload[2+i] & 0x07;
        let parameter = getParameterByGroupIdAndLocalId(parametersByGroupIdAndLocalId, groupId, localId)
        switch(dataType){
            case 0: 
                determineDeprecatedResponse(response, parameter,groupId)
                break;
            case 1:
                determineConfiguration(response, parameter,  parseInt(util.convertBytesToString(payload.slice(3+i,3+i+size)),16), groupId, size)
                break;
            case 2:
                //TO BE COMPLTED
                break;
            case 3:
                determineConfiguration(response, parameter,  payload.slice(3+i,3+i+size), groupId, size)
                break;
            case 4:
                determineConfiguration(response, parameter,  payload.slice(3+i,3+i+size), groupId, size)
                break; 
            case 5:
                determineErrorResponse(response, parameter,groupId)
                break;
        }
        i = i + size + 3 
    }
    return response
}
function determineErrorResponse(response, parameter, groupId) {
    let group = determineGroupType(groupId)
    let paramName = parameter.driverParameterName
    // Find the group in the response object or create a new one if it doesn't exist
    let groupObject = response.find(g => g.group === group);
    if (!groupObject) {
        groupObject = { group: group, parameters: [] };
        response.push(groupObject);
    }

    // Add the parameter to the group's parameters array
    groupObject.parameters.push({
        parameterName: paramName,
        parameterValue: "ERROR"
    });
}
function determineDeprecatedResponse(response, parameter, groupId) {
    let group = determineGroupType(groupId)
    let paramName = parameter.driverParameterName
    // Find the group in the response object or create a new one if it doesn't exist
    let groupObject = response.find(g => g.group === group);
    if (!groupObject) {
        groupObject = { group: group, parameters: [] };
        response.push(groupObject);
    }

    // Add the parameter to the group's parameters array
    groupObject.parameters.push({
        parameterName: paramName,
        parameterValue: "DEPRECATED"
    });
}
function determineConfiguration(response, parameter, paramValue, groupId, parameterSize){
    let group = determineGroupType(groupId)
    let groupObject
    let paramName = parameter.driverParameterName
    let paramType = parameter.parameterType.type
    switch (paramType)
    {
    // it can be integer or float
    case "ParameterTypeNumber":{
        let range = parameter.parameterType.range
        let multiply = parameter.parameterType.multiply
        let additionalValues = parameter.parameterType.additionalValues
        let additionalRanges = parameter.parameterType.additionalRanges
        // check negative number
        if ((range.minimum < 0 ) || util.hasNegativeNumber(additionalValues) || util.hasNegativeNumber(additionalRanges)){
            if (paramValue > 0x7FFFFFFF) {
             paramValue -= 0x100000000;
         }
        }
        if (util.checkParamValueRange(paramValue, range.minimum, range.maximum, range.exclusiveMinimum, range.exclusiveMaximum, additionalValues, additionalRanges)){
            if (multiply != undefined){
                paramValue = paramValue * multiply
            }
             
        }
        else {
            throw new Error(paramName+ " parameter value is out of range");
        }
        
        // Find the group in the response object or create a new one if it doesn't exist
        groupObject = response.find(g => g.group === group);
        if (!groupObject) {
            groupObject = { group: group, parameters: [] };
            response.push(groupObject);
        }

        // Add the parameter to the group's parameters array
        groupObject.parameters.push({
            parameterName: paramName,
            parameterValue: paramValue
        });}
        break;
    // A mapping between the firmware values and the possible string values
    case "ParameterTypeString":
        if ((parameter.parameterType.firmwareValues).indexOf(paramValue) != -1){
            // Find the group in the response object or create a new one if it doesn't exist
            groupObject = response.find(g => g.group === group);
            if (!groupObject) {
                groupObject = { group: group, parameters: [] };
                response.push(groupObject);
            }

            // Add the parameter to the group's parameters array
            groupObject.parameters.push({
                parameterName: paramName,
                parameterValue: parameter.parameterType.possibleValues[((parameter.parameterType.firmwareValues).indexOf(paramValue))]
            });
     }
        else {
            throw new Error(paramName+ " parameter value is unknown");
        }
        
        break;
    case "ParameterTypeBitMask":{
        let properties = parameter.parameterType.properties
        let bitMask = parameter.parameterType.bitMask
        let length = parseInt(1,16)
        let parameterValue ={}
        for (let property  of properties) {
            let propertyName = property.name
            let propertyType = property.type
            let bit = bitMask.find(el => el.valueFor === propertyName)
            switch (propertyType)
            {
                case "PropertyBoolean":
                    if ((bit.length)!= undefined ) {
                        length = util.lengthToHex(bit.length)
                    }
                    var b =  Boolean((paramValue >>bit.bitShift & length ))
                    if ((bit.inverted != undefined) && (bit.inverted)){
                        b =!b;
                    }
                    parameterValue[property.name] = b
                    break;
                case "PropertyString":{
                    if ((bit.length)!= undefined ) {
                        length = util.lengthToHex(bit.length)
                    }
                    let value = (paramValue >>bit.bitShift & length)
                        let possibleValues = property.possibleValues
                    if (property.firmwareValues.indexOf(value) != -1){
                        parameterValue[property.name] = possibleValues[(property.firmwareValues.indexOf(value))]
                    }
                    else {
                        throw new Error(property.name+ " parameter value is not among possible values");
                    }       
                }break;
                case "PropertyNumber":
                    if ((bit.length)!= undefined ) {
                        length = util.lengthToHex(bit.length)
                    }
                    parameterValue[property.name] = paramValue >>bit.bitShift & length ;	

                    break;
                case "PropertyObject":{
                    let bitValue ={}
                    for (let value of bit.values)
                        {
                        if (value.type == "BitMaskValue")
                            {	
                                let length = parseInt(1,16)
                                if ((value.length)!= undefined ) {length = (util.lengthToHex(value.length))}
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
 
           // Find the group in the response object or create a new one if it doesn't exist
        groupObject = response.find(g => g.group === group);
        if (!groupObject) {
            groupObject = { group: group, parameters: [] };
            response.push(groupObject);
        }

        // Add the parameter to the group's parameters array
        groupObject.parameters.push({
            parameterName: paramName,
            parameterValue: parameterValue
        });}
        break;
    case "ParameterTypeByteArray":{
        if (parameter.parameterType.size != undefined && parameter.parameterType.size != parameterSize) {
            throw new Error("The value of "+ paramName + " must have "+ parameter.parameterType.size.toString() +" bytes in the array");
        }
        var bytesValue
        if  (parameter.parameterType.properties == undefined){
            // Convert the array values to hexadecimal and store them in a string format
            bytesValue = '{' + paramValue.map(value => {
            // Convert each value to hexadecimal and ensure it has two digits
            return value.toString(16).padStart(2, '0');
            }).join(',') + '}';

        }else{
            let arrayProperties = parameter.parameterType.properties;
            let byteMap = parameter.parameterType.byteMask;
           
            let arrayLength = parseInt(1, 16);
            
            bytesValue = [];
            for (let i = 0; i < parameterSize; i++) {
                let currentParamValue = paramValue[i];
                if (parameter.parameterType.distinctValues !== undefined && parameter.parameterType.distinctValues === true) {
                    // Handling distinct values of byte array
                    let property = arrayProperties[i];
                    let propertyName = property.name;
                    let propertyValues = {}; // Store values for the current property
                    let bitMapping = byteMap.find(el => el.valueFor === propertyName);
                    if (!bitMapping) continue; // Skip if no bit mapping exists for this property
                    for (let subProperty of property.properties) {
                        let subPropertyName = subProperty.name;
                        let subPropertyType = subProperty.type;
                        let bitValueMapping = bitMapping.values.find(val => val.valueFor === subPropertyName);
                        if (!bitValueMapping) continue; // Skip if no bit mapping exists for this sub-property
                        let bitShift = bitValueMapping.bitShift;
                        let lengthMask = (1 << bitValueMapping.length) - 1;
                        let extractedValue = (currentParamValue >> bitShift) & lengthMask;
                        switch (subPropertyType) {
                            case "PropertyBoolean":{
                                let booleanValue = Boolean(extractedValue);
                                if (bitValueMapping.inverted) booleanValue = !booleanValue;
                                propertyValues[subPropertyName] = booleanValue;
                            }break;
                            case "PropertyString":{
                                let strIndex = subProperty.firmwareValues.indexOf(extractedValue);
                                if (strIndex !== -1) {
                                    propertyValues[subPropertyName] = subProperty.possibleValues[strIndex];
                                } else {
                                    throw new Error(`${subPropertyName} value not among possible values`);
                                }
                            }break;
                            case "PropertyNumber":
                                propertyValues[subPropertyName] = extractedValue;
                                break;
                            default:
                                throw new Error("Unknown sub-property type");
                        }
                    }
                    bytesValue.push({ [propertyName]: propertyValues });

                } else {
                    // Handling non-distinct values of byte array
                    let arrayParameterValue = {};
                    for (let py of arrayProperties) {
                        let propertyName = py.name;
                        let propertyType = py.type;
                        let bit = byteMap.find(el => el.valueFor === propertyName);
                        if (!bit) continue; // Skip if no bit mapping exists for this property
                        if (bit.length !== undefined) {
                            arrayLength = util.lengthToHex(bit.length);
                        }
                        switch (propertyType) {
                            case "PropertyBoolean":
                                let booleanValue = Boolean((currentParamValue >> bit.bitShift) & arrayLength);
                                if (bit.inverted) booleanValue = !booleanValue;
                                arrayParameterValue[propertyName] = booleanValue;
                                break;
                            case "PropertyString":{
                                let stringValue = (currentParamValue >> bit.bitShift) & arrayLength;
                                let possibleValues = py.possibleValues;
                                if (py.firmwareValues.indexOf(stringValue) !== -1) {
                                    arrayParameterValue[propertyName] = possibleValues[py.firmwareValues.indexOf(stringValue)];
                                } else {
                                    throw new Error(`${propertyName} value not among possible values`);
                                }
                            }break;
                            case "PropertyNumber":
                                arrayParameterValue[propertyName] = (currentParamValue >> bit.bitShift) & arrayLength;
                                break;
                            case "PropertyObject":{
                                let bitValue = {};
                                for (let value of bit.values) {
                                    if (value.type === "BitMapValue") {
                                        let subArrayLength = parseInt(1, 16);
                                        if (value.length !== undefined) {
                                            subArrayLength = util.lengthToHex(value.length);
                                        }
                                        let subBooleanValue = Boolean((currentParamValue >> value.bitShift) & subArrayLength);
                                        if (value.inverted) subBooleanValue = !subBooleanValue;
                                        bitValue[value.valueFor] = subBooleanValue;
                                    }
                                }
                                arrayParameterValue[propertyName] = bitValue;
                            }break;
                            case "PropertByteArray":{
                                let byteMask = py.bitMask;
                                if (py.size && py.size > 0) {
                                    let  currentParamArrayValue = [];
                                    for (let j = 0; j < py.size; j++) {
                                        if (i + j >= paramValue.length) {
                                            throw new Error("Parameter size exceeds available data");
                                        }
                                        currentParamArrayValue.push(paramValue[i + j]);
                                    }
                                
                                let decodedValues = {};
                                decodedValues = handleArrayProperties(py.properties,byteMask, currentParamArrayValue)
                                arrayParameterValue[propertyName] = decodedValues;
                                i += py.size - 1;
                                } else {
                                    throw new Error(`Invalid size for PropertyByteArray in property ${propertyName}`);
                                }
                            }break;
                            default:
                                throw new Error("Unknown property type");
                        }
                    }
                    bytesValue.push(arrayParameterValue);
                }
            }
        }
        // Find the group in the response object or create a new one if it doesn't exist
    groupObject = response.find(g => g.group === group);
    if (!groupObject) {
        groupObject = { group: group, parameters: [] };
        response.push(groupObject);
    }

    // Add the parameter to the group's parameters array
    groupObject.parameters.push({
        parameterName: paramName,
        parameterValue: bytesValue
    });}break;
    case "ParameterTypeAsciiString":
        var paramAsciiString = "";
    
	    for (var i = 0; i < paramValue.length; i ++)
            paramAsciiString += String.fromCharCode(paramValue[i]);
    
        // Find the group in the response object or create a new one if it doesn't exist
    groupObject = response.find(g => g.group === group);
    if (!groupObject) {
        groupObject = { group: group, parameters: [] };
        response.push(groupObject);
    }

    // Add the parameter to the group's parameters array
    groupObject.parameters.push({
        parameterName: paramName,
        parameterValue: paramAsciiString
    });
    break;
    default:
     throw new Error("Parameter type is unknown");
    }
}
function handleArrayProperties(properties, bitMask, paramValueArray) {
    let parameterValue = {};
    for (let property of properties) {
      let propertyName = property.name;
      let propertyType = property.type;
      let bit = bitMask.find((el) => el.valueFor === propertyName);
  
      if (!bit) {
        continue;
      }
      const mask = (1 << bit.length) - 1; 
  
      // Extract the value by shifting and masking
      let paramValue = extractSingleByte(paramValueArray, bit.bitShift);
      const value = (paramValue >> bit.bitShift % 8) & mask;
  
      switch (propertyType) {
        case "PropertyBoolean":
          let booleanValue = Boolean(value);
          if (bit.inverted) booleanValue = !booleanValue;
          parameterValue[propertyName] = booleanValue;
          break;
  
        case "PropertyString":{
          const possibleValues = property.possibleValues || [];
          const firmwareValues = property.firmwareValues || [];
          const index = firmwareValues.indexOf(value);
          if (index !== -1) {
            parameterValue[propertyName] = possibleValues[index];
          } else {
            throw new Error(
              `${propertyName} value (${value}) is not among possible values`,
            );
          }
        }break;
  
        case "PropertyNumber":
          parameterValue[propertyName] = value; // Directly assign the extracted value
          break;
  
        default:
            throw new Error(
                `Unsupported property type: ${propertyType}`);
      }
    }
    return parameterValue;
  }
  
  function extractSingleByte(paramValueArray, bitLength) {
    let byteIndex = 0;
  
    // Si la longueur des bits est plus grande que 8, il faut extraire le ou les octets nécessaires
    if (bitLength >= 8) {
      // Calculer l'index de l'octet à extraire
      byteIndex = Math.floor(bitLength / 8); // Chaque octet fait 8 bits, donc on choisit l'indice en fonction de la longueur des bits
    }
  
    // Extraire l'octet spécifique
    return paramValueArray[byteIndex];
  } 
function determineResponseParameterClassConfigurationGet(payload){
    let groupId = payload[0]
    let i = 1;
    let response = []
    while (payload.length > i) {
        let localId = payload[i]
        let size = payload[1+i]>>3 & 0x1F;
        let dataType = payload[1+i] & 0x07;
        let parameter = getParameterByGroupIdAndLocalId(parametersByGroupIdAndLocalId, groupId, localId)
        switch(dataType){
            case 0: 
                determineDeprecatedResponse(response, parameter,groupId)
                break;
            case 1:
                determineConfiguration(response, parameter,  parseInt(util.convertBytesToString(payload.slice(2+i,2+i+size)),16), groupId)
                break;
            case 2:
                //TO be complted
                break;
            case 3:
                determineConfiguration(response, parameter,  payload.slice(2+i,2+i+size), groupId, size)
                break; 
            case 4:
                determineConfiguration(response, parameter,  payload.slice(2+i,2+i+size), groupId, size)
                break; 
            case 5:
                determineErrorResponse(response, parameter,groupId)
                break;

        }
        i = i + size + 2
        }
        return response
}
function determineResponseParameterClassConfigurationSet(payload){
    let groupId = payload[0]
    payload = payload.slice(4)
    let i = 0;
    const step = 2;
    let parameters = [];
    while (payload.length >= step * (i + 1)) {
        let parameter = getParameterByGroupIdAndLocalId(parametersByGroupIdAndLocalId, groupId, payload[i*step])
        parameters.push({
            parameterName : parameter.driverParameterName,
            status: determineStatusType(payload[1+i*step])
        })
        i++;
    }
    return new ParameterClassConfigurationSet(determineGroupType(groupId), parameters)
}

function determineStatusType(value){
    switch(value){
        case 0 :
            return StatusType.SUCCESS
        case 1:
            return StatusType.NOT_FOUND
        case 2:
            return StatusType.BELOW_LOWER_BOUND
        case 3:
            return StatusType.ABOVE_HIGHER_BOUND
        case 4:
            return StatusType.BAD_VALUE
        case 5:
            return StatusType.TYPE_MISMATCH
        case 6:
            return StatusType.OPERATION_ERROR
        default:
          throw new Error("Status Type Unknown");
    }
}

function determineGroupType(value)
{  
    switch(value){
        case 0: 
            return GroupType.INTERNAL
        case 1:
            return GroupType.SYSTEM_CORE
        case 2:
            return GroupType.GEOLOC
        case 3:
            return GroupType.GNSS
        case 4:
            return GroupType.LR11xx
        case 5:
            return GroupType.BLE_SCAN1
        case 6: 
            return GroupType.BLE_SCAN2
        case 7:
            return GroupType.ACCELEROMETER
        case 8:
            return GroupType.NETWORK
        case 9:
            return GroupType.LORAWAN
        case 10: 
            return GroupType.CELLULAR
        case 11:
            return GroupType.BLE
        default:
            throw new Error("Unknown group")
    }
}
// Function to create the nested data structure
function jsonParametersByGroupIdAndLocalId() {
    // Initialize an empty object to store parameters grouped by groupId and localId
    let parametersByGroupIdAndLocalId = {};

    // Iterate over each entry in the JSON parameters array
    jsonParameters.forEach(entry => {
        // Iterate over each firmware parameter within the entry
        entry.firmwareParameters.forEach(parameter => {
            // Convert hexadecimal strings to integers for groupId and localId
            let groupId = parseInt(parameter.groupId, 16);
            let localId = parseInt(parameter.localId, 16);

            // Check if the groupId exists in the parametersByGroupIdAndLocalId object
            if (!parametersByGroupIdAndLocalId[groupId]) {
                // If not, create an empty object for the groupId
                parametersByGroupIdAndLocalId[groupId] = {};
            }

            // Check if the localId exists within the groupId object
            if (!parametersByGroupIdAndLocalId[groupId][localId]) {
                // If not, create an empty object for the localId
                parametersByGroupIdAndLocalId[groupId][localId] = {};
            }

            // Store the parameter object within the groupId and localId
            parametersByGroupIdAndLocalId[groupId][localId] = parameter;
        });
    });

    // Return the nested data structure
    return parametersByGroupIdAndLocalId;
}

// Function to get a parameter by groupId and localId
function getParameterByGroupIdAndLocalId(parameters, groupId, localId) {
    // Check if the parameters object contains the groupId
    // and if the groupId object contains the localId
    if (parameters[groupId] && parameters[groupId][localId]) {
        return parameters[groupId][localId];
    } else {
        return null;
    }
}

//create the nested data structure
const parametersByGroupIdAndLocalId = jsonParametersByGroupIdAndLocalId();

module.exports = {
    Response: Response,
    ResponseType : ResponseType,
    determineResponse: determineResponse,
    determineConfiguration: determineConfiguration,
    parametersByGroupIdAndLocalId: parametersByGroupIdAndLocalId,
    getParameterByGroupIdAndLocalId: getParameterByGroupIdAndLocalId,
    determineGroupType:determineGroupType,
    GroupType: GroupType

}


/***/ }),

/***/ 320:
/***/ ((module) => {

function BeaconIdInfo(id,
    rssi
){
    this.id = id;
    this.rssi = rssi;
}
function BeaconMacInfo(mac,
    rssi
){
    this.mac = mac;
    this.rssi = rssi;
}



module.exports = {
    BeaconIdInfo: BeaconIdInfo, 	
    BeaconMacInfo: BeaconMacInfo
}

/***/ }),

/***/ 343:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

let util = __webpack_require__(94);

const TelemetryType = Object.freeze({
    TELEMETRY: "TELEMETRY",
    TELEMETRY_MODE_BATCH: "TELEMETRY_MODE_BATCH"
})
// for more details to telemetry refer to https://github.com/actility/device-catalog/blob/main/template/sample-vendor/drivers/ONTOLOGY.md
const OntologyConstants = Object.freeze({
    RESISTANCE: {
        id: 1,
        ontology: "resistance",
        type: "int16",
        unit: "Ohm"
    },
    TEMPERATURE: {
        id: 2,
        ontology: "temperature",
        type: "float",
        unit: "Cel"
    },
    HUMIDITY: {
        id: 3,
        ontology: "humidity",
        type: "int16",
        unit: "%RH", 
        factor: 10
    }
});

// Construct counters based on OntologyConstants
const counters = Object.keys(OntologyConstants).reduce((acc, key) => {
    const ontology = OntologyConstants[key];
    acc[ontology.ontology] = 0;
    return acc;
}, {});

function floatFromBytes(bytes) {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    for (let i = 0; i < 4; i++) {
        view.setUint8(i, bytes[i]);
    }
    return view.getFloat32(0, false); // true for little-endian
}
function formatFloat(float, decimals = 2) {
    return Number(float.toFixed(decimals));
}

function determineTelemetryMeasurements(data) {
    let index = 0;
    const ontologies = {};
    const dataLength = data.length;
    while (index < dataLength) {
        if (index >= dataLength) {
            throw new Error("Unexpected end of data.");
        }
        let ontology = determineOntology(data[index] & 0x7F);
        let valueSize = (data[index] >> 7) & 0x01;
        let value;
        if (ontology.type === 'float') {
            if (valueSize === 1) {
                if (index + 4 >= dataLength) {
                    throw new Error("Not enough data for a 4-byte float.");
                }
                value = floatFromBytes(data.slice(index + 1, index + 5));
                value = formatFloat(value);
                index += 5; // Move to the next data element
            } else {
                throw new Error("Unexpected value size for float.");
            }
            
        } else {
            if (valueSize === 1) {
                throw new Error("Unexpected value size for int.");
            }
            if (index + 2 >= dataLength) {
                throw new Error("Not enough data for a 2-byte value.");
            }
            value = util.convertNegativeInt((data[index + 1] << 8) + data[index + 2],2);
            index += 3; // Move to the next data element
        }

        const ontologyName = ontology.ontology;
        const unit = ontology.unit;
        const counter = counters[ontologyName];
        const key = `${ontologyName}:${counter}`;

        // Add the telemetry measurement to the result
        ontologies[key] = { unitId: unit, record: value };

        // Update the counter
        counters[ontologyName]++;
    }
    Object.keys(ontologies).forEach(key => {
        const baseKey = key.split(':')[0];
        if (counters[baseKey] === 1) {
            const value = ontologies[key];
            delete ontologies[key];
            ontologies[baseKey] = value;
        }
    });
    return ontologies;
}

function determineOntology(value) {
    const ontology = Object.values(OntologyConstants).find(o => o.id === value);
    if (ontology) {
        return ontology;
    } else {
        throw new Error("Ontology Unknown");
    }
}


module.exports = {
    TelemetryType: TelemetryType,
    determineTelemetryMeasurements: determineTelemetryMeasurements
}


/***/ }),

/***/ 351:
/***/ ((module) => {

const Constellation = Object.freeze({
    GPS: "GPS",
    BEIDOU: "BEIDOU"
})

const CN = Object.freeze({
    0: ">45dB",
    1: "[41..45]dB",
    2: "[37..41]dB",
    3: "<37dB"
})

function SatelliteInfo(constellation,
    id,
    cn,
    pseudoRangeValue
){
    this.constellation = constellation;
    this.id = id;
    this.cn = cn;
    this.pseudoRangeValue = pseudoRangeValue;
}

module.exports = {
    SatelliteInfo: SatelliteInfo, 
    Constellation: Constellation,
    CN: CN	
}

/***/ }),

/***/ 406:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

let util = __webpack_require__(94);

const TempType = Object.freeze({
    TEMP_HIGH: "TEMP_HIGH",
    TEMP_LOW: "TEMP_LOW",
    TEMP_NORMAL: "TEMP_NORMAL"
})


function determineTemperature(payload){
    return util.convertNegativeInt(payload[5],1)
}
module.exports = {
    determineTemperature: determineTemperature,
    TempType: TempType
}

/***/ }),

/***/ 457:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

let TriggerBitMapClass = __webpack_require__(483);
let bleClass = __webpack_require__(504);
let util = __webpack_require__(94);
let SatelliteInfoClass = __webpack_require__(351);
let gnssFixClass = __webpack_require__(792)
let gnssFailureClass = __webpack_require__(541)
let wifiClass = __webpack_require__(508);
const gnssFailure = __webpack_require__(541);
//let bssidInfoClass = require("./wifi/bssidInfo")

const PositionStatus = Object.freeze({
    SUCCESS: "SUCCESS",
    TIMEOUT: "TIMEOUT",
    FAILURE: "FAILURE",
    NOT_SOLVABLE : "NOT_SOLVABLE"
})

const PositionType = Object.freeze({
    LR11xx_A_GNSS: "LR11xx_A_GNSS",
    LR11xx_GNSS_NAV1: "LR11xx_GNSS_NAV1",
    LR11xx_GNSS_NAV2: "LR11xx_GNSS_NAV2",
    WIFI: "WIFI",
    BLE_SCAN1_MAC: "BLE_SCAN1_MAC",
    BLE_SCAN1_SHORT: "BLE_SCAN1_SHORT",
    BLE_SCAN1_LONG: "BLE_SCAN1_LONG",
    BLE_SCAN2_MAC: "BLE_SCAN2_MAC",
    BLE_SCAN2_SHORT: "BLE_SCAN12_SHORT",
    BLE_SCAN2_LONG: "BLE_SCAN2_LONG",
    GNSS: "GNSS",
    AIDED_GNSS: "AIDED_GNSS"
})

function Position(motion, motionCounter,
    status,
    positionType,
    triggers,
    lr11xxAGnss,
    lr11xxGnssNav1, 
    lr11xxGnssNav2, 
    wifiBssids, 
    bleBeaconMacs,
    bleBeaconIds,
    gnssFix,
    gnssFailure,
    aidedGnss,
    coordinates){
        this.motion = motion;
        this.motionCounter = motionCounter;
        this.status = status;
        this.positionType = positionType;
        this.triggers = triggers;
        this.lr11xxAGnss = lr11xxAGnss;
        this.lr11xxGnssNav1 = lr11xxGnssNav1;
        this.lr11xxGnssNav2 = lr11xxGnssNav2;
        this.wifiBssids = wifiBssids;
        this.bleBeaconMacs =bleBeaconMacs;
        this.bleBeaconIds = bleBeaconIds;
        this.gnssFix = gnssFix;
        this.gnssFailure = gnssFailure;
        this.aidedGnss = aidedGnss;
        this.coordinates = coordinates;
}

/************************ Header position decodage *************************/
/********************************************************************/
function determinePositionHeader(payload, startingByte){
    let positionMessage = new Position();
    positionMessage.motion = payload[startingByte]>>7 & 0x01;
    var statusValue = payload[startingByte]>>5 & 0x03;
    switch (statusValue){
        case 0:
            positionMessage.status = PositionStatus.SUCCESS;
            break;
        case 1:
            positionMessage.status = PositionStatus.TIMEOUT;
            break;
        case 2:
            positionMessage.status = PositionStatus.FAILURE;
            break;
        case 3:
            positionMessage.status = PositionStatus.NOT_SOLVABLE;
            break;
    }

    var typeValue = payload[startingByte] & 0x0F;
    switch (typeValue){
        case 0:
            positionMessage.positionType = PositionType.LR11xx_A_GNSS;
            break;
        case 1:
            positionMessage.positionType = PositionType.LR11xx_GNSS_NAV1;
            break;
        case 2:
            positionMessage.positionType = PositionType.LR11xx_GNSS_NAV2;
            break;
        case 3:
            positionMessage.positionType = PositionType.WIFI;
            break;
        case 4:
            positionMessage.positionType = PositionType.BLE_SCAN1_MAC;
            break;
        case 5:
            positionMessage.positionType = PositionType.BLE_SCAN1_SHORT;
            break;
        case 6:
            positionMessage.positionType = PositionType.BLE_SCAN1_LONG;
            break;
        case 7:
            positionMessage.positionType = PositionType.BLE_SCAN2_MAC;
            break;
        case 8:
            positionMessage.positionType = PositionType.BLE_SCAN2_SHORT;
            break;
        case 9:
            positionMessage.positionType = PositionType.BLE_SCAN2_LONG;
            break;
        case 10:
            positionMessage.positionType = PositionType.GNSS;
            break;
        case 11:
            positionMessage.positionType = PositionType.AIDED_GNSS;
            break;
    }
    positionMessage.motionCounter =  payload[startingByte+1]&0x0F;
    positionMessage.triggers = new TriggerBitMapClass.TriggerBitMap(payload[startingByte+3] & 0x01,
        payload[startingByte+3]>>1 & 0x01,
        payload[startingByte+3]>>2 & 0x01,
        payload[startingByte+3]>>3 & 0x01,
        payload[startingByte+3]>>4 & 0x01,
        payload[startingByte+3]>>5 & 0x01,
        payload[startingByte+3]>>6 & 0x01,
        payload[startingByte+3]>>7 & 0x01,
        payload[startingByte+2] & 0x01,
        payload[startingByte+2]>>1 & 0x01
    )
   
    return positionMessage;
}



function determineLR1110GnssPositionMessage(payload){
    let lr1110gnss = {};
    lr1110gnss.time = (payload[0] << 8 + payload[1]) * 16;
    var i = 0;
    let satelliteInfos = [];
    while (payload.length >= 2+4*(i+1)){
        var satelliteInfo = new SatelliteInfoClass.SatelliteInfo();
        var c = payload[2+4*i]>>6 & 0x03;
        switch (c){
            case 0:
                satelliteInfo.constellation = SatelliteInfoClass.Constellation.GPS;
                break;
            case 1:
                satelliteInfo.constellation = SatelliteInfoClass.Constellation.BEIDOU;
                break;
        }
        var id = payload[2+4*i] & 0x3F;
        var cnValue = payload[3+4*i]>>6 & 0x03;
        switch (cnValue){
            case 0:
                satelliteInfo.cn = SatelliteInfoClass.CN[0];
                break;
            case 1:
                satelliteInfo.cn = SatelliteInfoClass.CN[1];
                break;
            case 2:
                satelliteInfo.cn = SatelliteInfoClass.CN[2];
                break;
            case 3:
                satelliteInfo.cn = SatelliteInfoClass.CN[3];
                break;
        }
        satelliteInfo.pseudoRangeValue = (payload[3+4*i] & 0x07) << 16 + payload[4+4*i] << 8 + payload[5+4*i];
        
        satelliteInfos.push(satelliteInfo);
        i++;
    }
    lr1110gnss.satelliteInfos = satelliteInfos;
    return lr1110gnss;
}
/************************ Position decodage *************************/
/********************************************************************/
function determinePosition(payload, multiFrame){

    var startingByte = 4;
    if (multiFrame){
        startingByte = 5;
    }
    let positionMessage = determinePositionHeader(payload, startingByte);
    // position status success
    if (positionMessage.status == PositionStatus.SUCCESS || positionMessage.status == PositionStatus.NOT_SOLVABLE){
        switch (positionMessage.positionType){
            case PositionType.LR11xx_A_GNSS:
                positionMessage.lr11xxAGnss = determineLR1110GnssPositionMessage(payload.slice(startingByte+4));
                break;
            case PositionType.LR11xx_GNSS_NAV1:
                positionMessage.lr11xxGnssNav1 = util.convertBytesToString(payload.slice(startingByte+4));
                break;
            case PositionType.LR11xx_GNSS_NAV2:
                positionMessage.lr11xxGnssNav2 = util.convertBytesToString(payload.slice(startingByte+4));
                break;
            case PositionType.WIFI:
                positionMessage.wifiBssids = wifiClass.determineWifiPositionMessage(payload.slice(startingByte+4));
                break;
            case PositionType.BLE_SCAN1_MAC:
                positionMessage.bleBeaconMacs = bleClass.determineBleMacPositionMessage(payload.slice(startingByte+4));
                break;
            case PositionType.BLE_SCAN1_SHORT:
                positionMessage.bleBeaconIds = bleClass.determineBleIdShortPositionMessage(payload.slice(startingByte+4));
                break;
            case PositionType.BLE_SCAN1_LONG:
                positionMessage.bleBeaconIds = bleClass.determineBleIdLongPositionMessage(payload.slice(startingByte+4));
                break;
            case PositionType.BLE_SCAN2_MAC:
                positionMessage.bleBeaconMacs = bleClass.determineBleMacPositionMessage(payload.slice(startingByte+4));
                break;
            case PositionType.BLE_SCAN2_SHORT:
                positionMessage.bleBeaconIds = bleClass.determineBleIdShortPositionMessage(payload.slice(startingByte+4));
                break;
            case PositionType.BLE_SCAN2_LONG:
                positionMessage.bleBeaconIds = bleClass.determineBleIdLongPositionMessage(payload.slice(startingByte+4));
                break;
            case PositionType.GNSS:
                positionMessage.gnssFix = gnssFixClass.determineGnssFix(payload.slice(startingByte+4));
                positionMessage.coordinates = [positionMessage.gnssFix.longitude, positionMessage.gnssFix.latitude, positionMessage.gnssFix.altitude]
                break;
            case PositionType.AIDED_GNSS:
                break;    
        }       
    }else if ((positionMessage.status == PositionStatus.TIMEOUT)||(positionMessage.status == PositionStatus.FAILURE)){
        //only for GNSS
        if (positionMessage.positionType == PositionType.GNSS){
            positionMessage.gnssFailure = gnssFailureClass.determineGnssFailure(payload.slice(startingByte+4))
        }
    }
    return positionMessage;

}

module.exports = {
    Position: Position,
    determinePosition: determinePosition
 	
}


/***/ }),

/***/ 483:
/***/ ((module) => {

function TriggerBitMap(geoTriggerPod,
    geoTriggerSos,
    geoTriggerMotionStart,
    geoTriggerMotionStop,
    geoTriggerInMotion,
    geoTriggerInStatic,
    geoTriggerShock,
    geoTriggerTempHighThreshold,
    geoTriggerTempLowThreshold,
    geoTriggerGeozoning
){
    this.geoTriggerPod = geoTriggerPod;
    this.geoTriggerSos = geoTriggerSos;
    this.geoTriggerMotionStart = geoTriggerMotionStart;
    this.geoTriggerMotionStop = geoTriggerMotionStop;
    this.geoTriggerInMotion = geoTriggerInMotion;
    this.geoTriggerInStatic = geoTriggerInStatic;
    this.geoTriggerShock = geoTriggerShock;
    this.geoTriggerTempHighThreshold = geoTriggerTempHighThreshold;
    this.geoTriggerTempLowThreshold = geoTriggerTempLowThreshold;
    this.geoTriggerGeozoning = geoTriggerGeozoning;
}

module.exports = {
    TriggerBitMap: TriggerBitMap, 	
}

/***/ }),

/***/ 504:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


let util = __webpack_require__(94);
let BeaconInfoClass = __webpack_require__(320);

function determineBleIdShortPositionMessage(payload) {
    return extractBeaconInfos(payload, 3, (payload, index) => {
        let key = `${util.convertByteToString(payload[index * 3])}-${util.convertByteToString(payload[1 + index * 3])}`;
        let value = util.convertNegativeInt(payload[2 + index * 3], 1);
        return new BeaconInfoClass.BeaconIdInfo(key, value);
    });
}

function determineBleIdLongPositionMessage(payload) {
    return extractBeaconInfos(payload, 17, (payload, index) => {
        let key = Array.from({ length: 16 }, (_, i) => util.convertByteToString(payload[i + index * 17])).join('-');
        let value = util.convertNegativeInt(payload[16 + index * 17], 1);
        return new BeaconInfoClass.BeaconIdInfo(key, value);
    });
}

function determineBleMacPositionMessage(payload) {
    return extractBeaconInfos(payload, 7, (payload, index) => {
        let key = Array.from({ length: 6 }, (_, i) => util.convertByteToString(payload[i + index * 7])).join(':');
        let value = util.convertNegativeInt(payload[6 + index * 7], 1);
        return new BeaconInfoClass.BeaconMacInfo(key, value);
    });
}

function extractBeaconInfos(payload, chunkSize, createBeaconInfo) {
    const beaconInfos = [];
    const count = Math.floor(payload.length / chunkSize);
    for (let i = 0; i < count; i++) {
        beaconInfos.push(createBeaconInfo(payload, i));
    }
    return beaconInfos;
}

module.exports = {
    determineBleMacPositionMessage,
    determineBleIdShortPositionMessage,
    determineBleIdLongPositionMessage
};

/***/ }),

/***/ 508:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

let BssidInfoClass = __webpack_require__(69);
let util = __webpack_require__(94);

function determineWifiPositionMessage(payload){
  
    const wifiBssids = [];
    var i = 0;
    while (payload.length >= 7*(i+1)){
        let key = util.convertByteToString(payload[i*7]) + ":" 
                    + util.convertByteToString(payload[1+i*7]) + ":"
                    + util.convertByteToString(payload[2+i*7]) + ":"
                    + util.convertByteToString(payload[3+i*7]) + ":"
                    + util.convertByteToString(payload[4+i*7]) + ":"
                    + util.convertByteToString(payload[5+i*7]);
        let value = util.convertNegativeInt(payload[6+i*7],1);
        
        wifiBssids.push(new BssidInfoClass.BssidInfo(key, value));
        i++;
    }

    return wifiBssids;
}

module.exports = {
    determineWifiPositionMessage : determineWifiPositionMessage	
}

/***/ }),

/***/ 522:
/***/ ((module) => {

const MessageType = Object.freeze({
    COMMAND: "COMMAND",
    REQUEST: "REQUEST",
    ANSWER: "ANSWER"
});

function AbeewayDownlinkPayload(downMessageType, 
        ackToken,
        command,
        request,
        payload) {
        this.downMessageType = downMessageType;
        this.ackToken = ackToken;
        this.command = command;
        this.request = request;
        this.payload = payload;
}

function determineDownlinkHeader(payload){
    if (payload.length < 1)
        throw new Error("The payload is not valid to determine header");
    var ackToken = payload[0] & 0x07;
    var type = determineMessageType(payload);
    return new AbeewayDownlinkPayload(type, ackToken)
}

function determineMessageType(payload){
    var messageType = payload[0]>>3 & 0x07;
    
    switch (messageType){
        case 1:
            return MessageType.COMMAND;
        case 2:
            return MessageType.REQUEST;
        case 3:
            return MessageType.ANSWER;
    }
}

module.exports = {
    AbeewayDownlinkPayload: AbeewayDownlinkPayload,
    MessageType: MessageType,
    determineDownlinkHeader: determineDownlinkHeader
}

/***/ }),

/***/ 541:
/***/ ((module) => {

function GnssFailure(timeoutCause,
    satelliteSeen){
    this.timeoutCause = timeoutCause;
    this.satellitesSeen = satelliteSeen
}
const timeoutCause = Object.freeze({
    T0_TIMEOUT: "T0_TIMEOUT",
    T1_TIMEOUT: "T1_TIMEOUT",
    ACQUISITION_TIMEOUT: "ACQUISITION_TIMEOUT"
});
const constellation = Object.freeze({
    GPS: "GPS",
    GLONASS: "GLONASS",
    BEIDOU: "BEIDOU",
    GALILEO: "GALILEO"
});
function determineTimeoutCause(timeoutCause){
    switch (timeoutCause){
	    case 0:
	        return timeoutCause.T0_TIMEOUT;
	    case 1:
	        return timeoutCause.T1_TIMEOUT;
	    case 2:
	    	return timeoutCause.ACQUISITION_TIMEOUT;
	    default:
	    	throw new Error("The timeout cause is unknown");
    }
}
function determineConstellation(cons){

    switch (cons){
	    case 0:
	        return constellation.GPS;
        case 1:
            return constellation.GLONASS;
        case 2:
            return constellation.BEIDOU;
        case 3:
            return constellation.GALILEO;
        default:
            throw new Error("The constellation is unknown" )
}}

function determineGnssFailure(payload){
    let timeoutCause = determineTimeoutCause(payload[0]>>5 & 0x07)
    let nbSatSeen = payload[0] & 0x0F
    payload = payload.slice(1)
    let satelliteSeen = []
    for (let i = 0; i < nbSatSeen*2; i += 2) {
        let svId = payload[i]
        let constellation = determineConstellation(payload[i]+1>>6 & 0x03)
        let CN = payload[i+1] & 0x3F
        satelliteSeen.push({svId, constellation, CN})
    } 
   
    return new GnssFailure(timeoutCause, satelliteSeen)
}

module.exports = {
    GnssFailure: GnssFailure,
    determineGnssFailure: determineGnssFailure
}


/***/ }),

/***/ 548:
/***/ ((module) => {


const GeozoningType = Object.freeze({
    ENTRY: "ENTRY",
    EXIT: "EXIT",
    IN_HAZARD: "IN_HAZARD",
    OUT_HAZARD: "OUT_HAZARD",
    MEETING_POINT: "MEETING_POINT"
})

module.exports = {
    GeozoningType: GeozoningType
}

/***/ }),

/***/ 560:
/***/ ((module) => {

let telemetryMetadataStore = {};

const CodingPolicy = Object.freeze({
    NO_COMPRESSION: "NO_COMPRESSION",
    DELTA_COMPRESSION: "DELTA_COMPRESSION",
    HUFFMAN_COMPRESSION: "HUFFMAN_COMPRESSION",
})

const DataTypes = Object.freeze({
    _8_BIT_UNSIGNED: "8_BIT_UNSIGNED",
    _16_BIT_SIGNED: "16_BIT_SIGNED"
})

const RecordingPolicy = Object.freeze({
    INSTANT: "INSTANT",
    MIN: "MIN",
    MAX: "MAX",
    CHANGE_OF_VALUE: "CHANGE_OF_VALUE"
});

function convert3BitToSigned(val) {
    return (val & 0x04) ? val - 8 : val;
}

function decodeMetadataPayload(telemetryPayload) {
    const errors = [];
    let offset = 0;
    while (offset + 8 <= telemetryPayload.length) {
        const block = telemetryPayload.slice(offset, offset + 8);
        const payloadType = (block[0] & 0x80) >> 7;
        if (payloadType !== 1) break;
        const telemetryId = (block[0] >> 4) & 0x07;
        const cyclicVersion = block[0] & 0x07;

        const fixedTimeInterval = (block[1] >> 3) & 0x03;
        const numMeasurements = block[1] & 0x07;

        const telemetryIDMaxInterval = telemetryPayload.readUInt16BE(offset + 2);
        const measurementNMaxInterval = telemetryPayload.readUInt16BE(offset + 4);

        const measurementConfigByte1 = block[6];
        const measurementConfigByte2 = block[7];

        const measurementConfig = decodeMeasurementConfigBytes(measurementConfigByte1, measurementConfigByte2);
        telemetryMetadataStore[telemetryId] = {
            telemetryId,
            cyclicVersion,
            fixedTimeInterval,
            numMeasurements,
            telemetryIDMaxInterval,
            measurementNMaxInterval,
            measurementConfig: measurementConfig,
        };
        offset += 8;
    }

    if(errors.length > 0) return { errors: errors, warnings: [] };
    context.push(telemetryMetadataStore);
    return { context: context, data: telemetryMetadataStore, errors: errors, warnings: [] };
}

function decodeMeasurementConfigBytes(byte1, byte2) {
    const measurementId = (byte1 >> 6) & 0x03;
    let codingPolicy = (byte1 >> 2) & 0x03;
    let dataType = byte1 & 0x03;
    let recordingPolicy = (byte2 >> 5) & 0x07;
    let scalingFactor = (byte2 >> 1) & 0x07;
    scalingFactor =  Math.pow(10, convert3BitToSigned(scalingFactor));
    let sampleCompression = byte2 & 0x01;

    switch (dataType) {
        case 0:
            dataType = DataTypes._8_BIT_UNSIGNED;
            break;
        case 1:
            dataType = DataTypes._16_BIT_SIGNED;
            break;
        default:
            throw new Error(`Unsupported data type "${dataType}"`);
    }

    switch (codingPolicy) {
        case 0:
            codingPolicy = CodingPolicy.NO_COMPRESSION;
            break;
        case 1:
            codingPolicy = CodingPolicy.DELTA_COMPRESSION;
            break;
        case 2:
            codingPolicy = CodingPolicy.HUFFMAN_COMPRESSION;
            break;
        default:
            throw new Error(`Unsupported coding policy "${codingPolicy}"`);
    }

    switch (recordingPolicy) {
        case 0:
            recordingPolicy = RecordingPolicy.INSTANT;
            break;
        case 1:
            recordingPolicy = RecordingPolicy.MIN;
            break;
        case 2:
            recordingPolicy = RecordingPolicy.MAX;
            break;
        default:
            recordingPolicy = RecordingPolicy.CHANGE_OF_VALUE;
    }

    sampleCompression = sampleCompression === 0 ? "LINEAR" : "LOGARITHMIC";

    return {
        measurementId,
        codingPolicy,
        dataType,
        recordingPolicy,
        scalingFactor,
        sampleCompression
    };
}

function decodeTimeseriesPayload(telemetryPayload) {
    const errors = [];

    if (telemetryPayload.length < 4) {
        errors.push("Telemetry payload too short for timeseries decoding");
        return { errors };
    }

    const byte0 = telemetryPayload[0];
    const telemetryId = (byte0 >> 4) & 0x07;
    const alarmTrigger = (byte0 & 0x01) === 1;

    const byte1 = telemetryPayload[1];
    const cyclicVersion = (byte1 >> 4) & 0x0F;
    const cyclicCounter = byte1 & 0x0F;

    const metadataHistory = context.shift();
    let metadata = Object.values(metadataHistory).find(t => t.telemetryId === telemetryId);

    if (!metadata || metadata.cyclicVersion !== cyclicVersion) {
        errors.push(`Missing or mismatched metadata for TelemetryID=${telemetryId}, CyclicVersion=${cyclicVersion}`);
        return { errors };
    }

    const { codingPolicy, dataType, scalingFactor } = metadata.measurementConfig;
    const measurementData = telemetryPayload.slice(2);
    let measurements = [];

        if (codingPolicy === CodingPolicy.DELTA_COMPRESSION && dataType === DataTypes._16_BIT_SIGNED) {
            const buffer = Buffer.from(measurementData);
            let i = buffer.length - 1;
            let result = [];
            let currentValue = 0;

            while (i >= 0) {
                const byte = buffer[i];
                const isDelta = (byte >> 7 & 0x01) !== 0;

                if (!isDelta) {
                    currentValue = buffer[i - 1];
                    result.push(currentValue);
                    i -= 2;
                } else {
                    const signBit = byte >> 6 & 0x11;
                    const num = byte & 0x3F;

                    let delta = (signBit) ? (64 - num) * -1 : num ;
                    currentValue += delta;
                    result.push(currentValue);
                }
                i--
            }
            measurements = result;
        } else {
            errors.push("Unsupported coding policy or data type for delta decoding");
        }

    const scaledMeasurements = measurements.map(m => parseFloat((m * scalingFactor).toFixed(2)));

    if (errors.length > 0) {
        return { errors: errors, warnings: [] };
    }

    return {
        type: "timeseries",
        telemetryId,
        alarmTrigger,
        cyclicVersion,
        cyclicCounter,
        measurements: scaledMeasurements,
        measurementConfig: metadata.measurementConfig,
    };
}

function decodeTelemetry(payload) {
    if (!(payload instanceof Buffer)) {
        try {
            payload = Buffer.from(payload, typeof payload === "string" ? "hex" : undefined);
        } catch (e) {
            return { errors: ["Invalid payload format"], warnings: [] };
        }
    }

    if (payload.length < 5) {
        return { errors: ["Payload too short"], warnings: [] };
    }

    const headerLength = 4;
    const telemetryPayload = payload.slice(headerLength);
    if (telemetryPayload.length < 1) {
        return { errors: ["No telemetry payload"], warnings: [] };
    }

    const payloadTypeByte = telemetryPayload[0];
    const isMetadata = (payloadTypeByte & 0x80) !== 0;
    if (isMetadata) {
        const result = decodeMetadataPayload(telemetryPayload);
        if (result.data === undefined) {
            return {
                errors: result.errors,
                warnings: result.warnings || []
            };
        }
        return {
            type: "metadata",
            TelemetryIDs: [result.data],
            context: result.context
        };
    } else {
        const telemetryResult = decodeTimeseriesPayload(telemetryPayload);
        if (telemetryResult.measurementConfig === undefined) {
            return {
                errors: telemetryResult.errors,
                warnings: telemetryResult.warnings || []
            };
        }
        return telemetryResult
    }
}

module.exports = {
    decodeTelemetry,
};


/***/ }),

/***/ 592:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

let abeewayUplinkPayloadClass = __webpack_require__(962);
const batteryStatus = Object.freeze({
    CHARGING: "CHARGING",
    OPERATING: "OPERATING",
    UNKNOWN: "UNKNOWN"
});

function Header(sos, type, ackToken, multiFrame, batteryLevel, timestamp) {
    this.sos = sos;
    this.type = type;
    this.ackToken = ackToken;
    this.multiFrame = multiFrame;
    this.batteryLevel = batteryLevel;
    this.timestamp = timestamp;
}

function determineHeader(payload, receivedTime) {
    if (payload.length < 3)
        throw new Error("The payload is not valid to determine header");
    var sos = !!(payload[0] >> 6 & 0x01);
    var ackToken = payload[0] & 0x07;
    var type = determineMessageType(payload);
    var multiFrame = !!(payload[0] >> 7 & 0x01);
    var batteryLevel = determineBatteryLevel(payload);
    var timestamp = rebuildTime(receivedTime, ((payload[2] << 8) + payload[3]));
    return new Header(sos, type, ackToken, multiFrame, batteryLevel, timestamp);
}

function rebuildTime(receivedTime, seconds) {
    // Parse the timestamp using native Date object
    const timestamp = new Date(receivedTime);

    // In the case where the tracker hasn't had time yet...
    if (seconds === 65535) {
        return timestamp.toISOString();
    }

    // Create a Date object set to the start of the UTC day
    const utcDate = new Date(Date.UTC(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate(), 0, 0, 0));

    // Calculate the total seconds since the start of the day for the received time
    const referenceTotalSeconds = (timestamp.getUTCHours() * 3600) + (timestamp.getUTCMinutes() * 60) + timestamp.getUTCSeconds();

    // Determine if the reference time is closer to midnight or noon
    let referenceTime;
    if (referenceTotalSeconds < 43200) { // 43200 seconds is 12 hours
        referenceTime = utcDate; // Midnight
    } else {
        referenceTime = new Date(utcDate.getTime() + 43200 * 1000); // Noon
    }

    // Add the given number of seconds to the reference time
    let exactTime = new Date(referenceTime.getTime() + seconds * 1000);

    // Check if the rebuilt time is after the original timestamp (rollover)
    if (exactTime > timestamp) {
        // Rebuilt time is after the received time, so subtract 43200 seconds (12 hours)
        exactTime = new Date(exactTime.getTime() - 43200 * 1000);
    }

    return exactTime.toISOString(); // Return the exact time in ISO 8601 format
}
function determineMessageType(payload){
    if (payload.length < 4)
        throw new Error("The payload is not valid to determine Message Type");
    var messageType = payload[0]>>3 & 0x07
    switch (messageType){
        case 1:
            return abeewayUplinkPayloadClass.messageType.NOTIFICATION;
        case 2:
            return abeewayUplinkPayloadClass.messageType.POSITION;
        case 3:
            return abeewayUplinkPayloadClass.messageType.QUERY;
        case 4:
            return abeewayUplinkPayloadClass.messageType.RESPONSE;
        case 5:
            return abeewayUplinkPayloadClass.messageType.TELEMETRY;
        default:
            return abeewayUplinkPayloadClass.messageType.UNKNOWN;
    }
}

function determineBatteryLevel(payload){
    if (payload.length < 4)
        throw new Error("The payload is not valid to determine Battery Level");
    var value = payload[1] & 0x7F;
    if (value == 0)
        return batteryStatus.CHARGING;
    else if (value == 127)
        return batteryStatus.UNKNOWN; 
    return value;
}

module.exports = {
    Header: Header,
    determineHeader: determineHeader
}

/***/ }),

/***/ 635:
/***/ ((module) => {

"use strict";
module.exports = /*#__PURE__*/JSON.parse('[{"firmwareVersion":"3.0","uplinkPort":"19","firmwareParameters":[{"driverParameterName":"sysHighestTemperature","groupId":"0x00","localId":"0x00","defaultValue":0,"unit":"Cel","description":"Highest temperature reached","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":-100,"maximum":100}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"sysLowestTemperature","groupId":"0x00","localId":"0x01","defaultValue":0,"unit":"Cel","description":"Lowest temperature reached","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":-100,"maximum":100}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"sysPowerConsumption","groupId":"0x00","localId":"0x02","defaultValue":0,"unit":"mAH","description":"Total power consumed","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"coreMonitoringPeriod","groupId":"0x01","localId":"0x00","defaultValue":300,"unit":"s","description":"Device monitoring period","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":15}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"coreStatusPeriod","groupId":"0x01","localId":"0x01","defaultValue":3600,"unit":"s","description":"Status monitoring period","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"coreNotifEnable","groupId":"0x01","localId":"0x02","defaultValue":"{0B,00,00,00,00,00}","description":"Enables core notifications for various events.","parameterType":{"type":"ParameterTypeByteArray","size":6,"distinctValues":true,"properties":[{"name":"systemClass","type":"PropertyObject","properties":[{"name":"status","type":"PropertyBoolean","description":"System status Versions, temperature, reset cause."},{"name":"lowBattery","type":"PropertyBoolean","description":"Low battery alert."},{"name":"bleStatus","type":"PropertyBoolean","description":"Bluetooth Low Energy status"},{"name":"tamperDetection","type":"PropertyBoolean","description":"Tamper detection alert."},{"name":"heartbeat","type":"PropertyBoolean","description":"Heartbeat message."}]},{"name":"sosClass","type":"PropertyObject","properties":[{"name":"sosOn","type":"PropertyBoolean","description":"SOS activated."},{"name":"sosOff","type":"PropertyBoolean","description":"SOS deactivated."}]},{"name":"temperatureClass","type":"PropertyObject","properties":[{"name":"tempHigh","type":"PropertyBoolean","description":"Critical high temperature reached"},{"name":"tempLow","type":"PropertyBoolean","description":"Critical low temperature reached"},{"name":"tempNormal","type":"PropertyBoolean","description":"Temperature back to normal"}]},{"name":"accelerometerClass","type":"PropertyObject","properties":[{"name":"motionStart","type":"PropertyBoolean","description":"Motion start detected."},{"name":"motionEnd","type":"PropertyBoolean","description":"Motion end detected."},{"name":"shock","type":"PropertyBoolean","description":"Shock detected."}]},{"name":"networkingClass","type":"PropertyObject","properties":[{"name":"mainUp","type":"PropertyBoolean","description":"Main network is up."},{"name":"backupUp","type":"PropertyBoolean","description":"Main network down. Backup is up."}]},{"name":"geozoningClass","type":"PropertyObject","properties":[{"name":"geozoningOn","type":"PropertyBoolean","description":"Geozoning is on."}]}],"byteMask":[{"valueFor":"systemClass","type":"BitMaskObject","values":[{"type":"BitMaskValue","valueFor":"status","bitShift":0,"length":1},{"type":"BitMaskValue","valueFor":"lowBattery","bitShift":1,"length":1},{"type":"BitMaskValue","valueFor":"bleStatus","bitShift":2,"length":1},{"type":"BitMaskValue","valueFor":"tamperDetection","bitShift":3,"length":1},{"type":"BitMaskValue","valueFor":"heartbeat","bitShift":4,"length":1}]},{"valueFor":"sosClass","type":"BitMaskObject","values":[{"type":"BitMaskValue","valueFor":"sosOn","bitShift":0,"length":1},{"type":"BitMaskValue","valueFor":"sosOff","bitShift":1,"length":1}]},{"valueFor":"temperatureClass","type":"BitMaskObject","values":[{"type":"BitMaskValue","valueFor":"tempHigh","bitShift":0,"length":1},{"type":"BitMaskValue","valueFor":"tempLow","bitShift":1,"length":1},{"type":"BitMaskValue","valueFor":"tempNormal","bitShift":2,"length":1}]},{"valueFor":"accelerometerClass","type":"BitMaskObject","values":[{"type":"BitMaskValue","valueFor":"motionStart","bitShift":0,"length":1},{"type":"BitMaskValue","valueFor":"motionEnd","bitShift":1,"length":1},{"type":"BitMaskValue","valueFor":"shock","bitShift":2,"length":1}]},{"valueFor":"networkingClass","type":"BitMaskObject","values":[{"type":"BitMaskValue","valueFor":"mainUp","bitShift":0,"length":1},{"type":"BitMaskValue","valueFor":"backupUp","bitShift":1,"length":1}]},{"valueFor":"geozoningClass","type":"BitMaskObject","values":[{"type":"BitMaskValue","valueFor":"geozoningOn","bitShift":0,"length":1}]}]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"coreTempHighThreshold","groupId":"0x01","localId":"0x03","defaultValue":60,"unit":"Cel","description":"Highest temperature detection threshold","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":-100,"maximum":100}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"coreTempLowThreshold","groupId":"0x01","localId":"0x04","defaultValue":0,"unit":"Cel","description":"Lowest temperature detection threshold","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":-100,"maximum":100}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"coreTempHysteresis","groupId":"0x01","localId":"0x05","defaultValue":5,"unit":"Cel","description":"Temperature hysteresis","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":-100,"maximum":100}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"coreButton1Map","groupId":"0x01","localId":"0x06","description":"Button 1 mapping","parameterType":{"type":"ParameterTypeBitMask","properties":[{"name":"buttonPress","type":"PropertyString","description":"Event to execute with a button press.","possibleValues":["NO_ACTION","DISPLAY_BATTERY_LEVEL_ON_THE_LED","START_STOP_SOS","REQUEST_A_POSITION_ON_DEMAND","FORCE_AN_UPLINK_SYSTEM_STATUS_NOTIFICATION_TRANSMISSION","START_DEVICE","STOP_DEVICE","START_ONLY_SOS","START_BLE_ADVERTISING_FOR_CONNECTIVITY"],"firmwareValues":[0,1,2,3,4,5,6,7,8]},{"name":"buttonLongPress","type":"PropertyString","description":"Event generated on a button long press.","possibleValues":["NO_ACTION","DISPLAY_BATTERY_LEVEL_ON_THE_LED","START_STOP_SOS","REQUEST_A_POSITION_ON_DEMAND","FORCE_AN_UPLINK_SYSTEM_STATUS_NOTIFICATION_TRANSMISSION","START_DEVICE","STOP_DEVICE","START_ONLY_SOS","START_BLE_ADVERTISING_FOR_CONNECTIVITY"],"firmwareValues":[0,1,2,3,4,5,6,7,8]},{"name":"buttonSingleClick","type":"PropertyString","description":"Event generated on a button single click.","possibleValues":["NO_ACTION","DISPLAY_BATTERY_LEVEL_ON_THE_LED","START_STOP_SOS","REQUEST_A_POSITION_ON_DEMAND","FORCE_AN_UPLINK_SYSTEM_STATUS_NOTIFICATION_TRANSMISSION","START_DEVICE","STOP_DEVICE","START_ONLY_SOS","START_BLE_ADVERTISING_FOR_CONNECTIVITY"],"firmwareValues":[0,1,2,3,4,5,6,7,8]},{"name":"buttonDoubleClicks","type":"PropertyString","description":"Event generated on a button double clicks.","possibleValues":["NO_ACTION","DISPLAY_BATTERY_LEVEL_ON_THE_LED","START_STOP_SOS","REQUEST_A_POSITION_ON_DEMAND","FORCE_AN_UPLINK_SYSTEM_STATUS_NOTIFICATION_TRANSMISSION","START_DEVICE","STOP_DEVICE","START_ONLY_SOS","START_BLE_ADVERTISING_FOR_CONNECTIVITY"],"firmwareValues":[0,1,2,3,4,5,6,7,8]},{"name":"buttonTripleClicksOrAbove","type":"PropertyString","description":"Event generated on a button triple clicks or above.","possibleValues":["NO_ACTION","DISPLAY_BATTERY_LEVEL_ON_THE_LED","START_STOP_SOS","REQUEST_A_POSITION_ON_DEMAND","FORCE_AN_UPLINK_SYSTEM_STATUS_NOTIFICATION_TRANSMISSION","START_DEVICE","STOP_DEVICE","START_ONLY_SOS","START_BLE_ADVERTISING_FOR_CONNECTIVITY"],"firmwareValues":[0,1,2,3,4,5,6,7,8]},{"name":"buttonSimpleSequence","type":"PropertyString","description":"Event generated on a button simple sequence.","possibleValues":["NO_ACTION","DISPLAY_BATTERY_LEVEL_ON_THE_LED","START_STOP_SOS","REQUEST_A_POSITION_ON_DEMAND","FORCE_AN_UPLINK_SYSTEM_STATUS_NOTIFICATION_TRANSMISSION","START_DEVICE","STOP_DEVICE","START_ONLY_SOS","START_BLE_ADVERTISING_FOR_CONNECTIVITY"],"firmwareValues":[0,1,2,3,4,5,6,7,8]}],"bitMask":[{"type":"BitMaskValue","valueFor":"buttonPress","bitShift":0,"length":4},{"type":"BitMaskValue","valueFor":"buttonLongPress","bitShift":4,"length":4},{"type":"BitMaskValue","valueFor":"buttonSingleClick","bitShift":8,"length":4},{"type":"BitMaskValue","valueFor":"buttonDoubleClicks","bitShift":12,"length":4},{"type":"BitMaskValue","valueFor":"buttonTripleClicksOrAbove","bitShift":16,"length":4},{"type":"BitMaskValue","valueFor":"buttonSimpleSequence","bitShift":20,"length":4}]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"coreButton2Map","groupId":"0x01","localId":"0x07","description":"Button 2 mapping","parameterType":{"type":"ParameterTypeBitMask","properties":[{"name":"buttonPress","type":"PropertyString","description":"Event to execute with a button press.","possibleValues":["NO_ACTION","DISPLAY_BATTERY_LEVEL_ON_THE_LED","START_STOP_SOS","REQUEST_A_POSITION_ON_DEMAND","FORCE_AN_UPLINK_SYSTEM_STATUS_NOTIFICATION_TRANSMISSION","START_DEVICE","STOP_DEVICE","START_ONLY_SOS","START_BLE_ADVERTISING_FOR_CONNECTIVITY"],"firmwareValues":[0,1,2,3,4,5,6,7,8]},{"name":"buttonLongPress","type":"PropertyString","description":"Event generated on a button long press.","possibleValues":["NO_ACTION","DISPLAY_BATTERY_LEVEL_ON_THE_LED","START_STOP_SOS","REQUEST_A_POSITION_ON_DEMAND","FORCE_AN_UPLINK_SYSTEM_STATUS_NOTIFICATION_TRANSMISSION","START_DEVICE","STOP_DEVICE","START_ONLY_SOS","START_BLE_ADVERTISING_FOR_CONNECTIVITY"],"firmwareValues":[0,1,2,3,4,5,6,7,8]},{"name":"buttonSingleClick","type":"PropertyString","description":"Event generated on a button single click.","possibleValues":["NO_ACTION","DISPLAY_BATTERY_LEVEL_ON_THE_LED","START_STOP_SOS","REQUEST_A_POSITION_ON_DEMAND","FORCE_AN_UPLINK_SYSTEM_STATUS_NOTIFICATION_TRANSMISSION","START_DEVICE","STOP_DEVICE","START_ONLY_SOS","START_BLE_ADVERTISING_FOR_CONNECTIVITY"],"firmwareValues":[0,1,2,3,4,5,6,7,8]},{"name":"buttonDoubleClicks","type":"PropertyString","description":"Event generated on a button double clicks.","possibleValues":["NO_ACTION","DISPLAY_BATTERY_LEVEL_ON_THE_LED","START_STOP_SOS","REQUEST_A_POSITION_ON_DEMAND","FORCE_AN_UPLINK_SYSTEM_STATUS_NOTIFICATION_TRANSMISSION","START_DEVICE","STOP_DEVICE","START_ONLY_SOS","START_BLE_ADVERTISING_FOR_CONNECTIVITY"],"firmwareValues":[0,1,2,3,4,5,6,7,8]},{"name":"buttonTripleClicksOrAbove","type":"PropertyString","description":"Event generated on a button triple clicks or above.","possibleValues":["NO_ACTION","DISPLAY_BATTERY_LEVEL_ON_THE_LED","START_STOP_SOS","REQUEST_A_POSITION_ON_DEMAND","FORCE_AN_UPLINK_SYSTEM_STATUS_NOTIFICATION_TRANSMISSION","START_DEVICE","STOP_DEVICE","START_ONLY_SOS","START_BLE_ADVERTISING_FOR_CONNECTIVITY"],"firmwareValues":[0,1,2,3,4,5,6,7,8]},{"name":"buttonSimpleSequence","type":"PropertyString","description":"Event generated on a button simple sequence.","possibleValues":["NO_ACTION","DISPLAY_BATTERY_LEVEL_ON_THE_LED","START_STOP_SOS","REQUEST_A_POSITION_ON_DEMAND","FORCE_AN_UPLINK_SYSTEM_STATUS_NOTIFICATION_TRANSMISSION","START_DEVICE","STOP_DEVICE","START_ONLY_SOS","START_BLE_ADVERTISING_FOR_CONNECTIVITY"],"firmwareValues":[0,1,2,3,4,5,6,7,8]}],"bitMask":[{"type":"BitMaskValue","valueFor":"buttonPress","bitShift":0,"length":4},{"type":"BitMaskValue","valueFor":"buttonLongPress","bitShift":4,"length":4},{"type":"BitMaskValue","valueFor":"buttonSingleClick","bitShift":8,"length":4},{"type":"BitMaskValue","valueFor":"buttonDoubleClicks","bitShift":12,"length":4},{"type":"BitMaskValue","valueFor":"buttonTripleClicksOrAbove","bitShift":16,"length":4},{"type":"BitMaskValue","valueFor":"buttonSimpleSequence","bitShift":20,"length":4}]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"coreButtonsTiming","groupId":"0x01","localId":"0x08","description":"Define the buttons timing parameters.","parameterType":{"type":"ParameterTypeBitMask","properties":[{"name":"durationButtonPress","type":"PropertyNumber","description":"Duration of the button press in seconds."},{"name":"durationButtonLongPress","type":"PropertyNumber","description":"Duration of the button long press in seconds."},{"name":"debounceDurationOnButton1","type":"PropertyNumber","description":"Debounce duration on button 1 in milliseconds."},{"name":"debounceDurationOnButton2","type":"PropertyNumber","description":"Debounce duration on button 2 in milliseconds."}],"bitMask":[{"type":"BitMaskValue","valueFor":"durationButtonPress","bitShift":0,"length":4},{"type":"BitMaskValue","valueFor":"durationButtonLongPress","bitShift":4,"length":4},{"type":"BitMaskValue","valueFor":"debounceDurationOnButton1","bitShift":8,"length":8},{"type":"BitMaskValue","valueFor":"debounceDurationOnButton2","bitShift":16,"length":8}]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"coreLed0Map","groupId":"0x01","localId":"0x09","defaultValue":"{00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00}","description":"Defines LED patterns for system events. Configurable as 10 slices of 3 bytes each.","parameterType":{"type":"ParameterTypeByteArray","size":30,"distinctValues":false,"properties":[{"name":"slice","type":"PropertByteArray","size":3,"distinctValues":true,"properties":[{"name":"systemEventClass","type":"PropertyString","description":"System event class.","possibleValues":["BUTTON1","BUTTON2","BUZZER","ACCELEROMETER","POWER","TEMPERATURE","GEOLOCATION","CONFIGURATION","NETWORK","CORE","BLE_CONNECTIVITY","USER"],"firmwareValues":[0,1,2,3,4,5,6,7,8,9,10,11]},{"name":"patternLoopExtension","type":"PropertyNumber","description":"Pattern loop extension."},{"name":"patternInversion","type":"PropertyBoolean","description":"Indicates whether the pattern is inverted."},{"name":"type","type":"PropertyNumber","description":"System event type."},{"name":"patternIdentifier","type":"PropertyString","description":"Defines the LED behavior.","possibleValues":["NOT_CONFIGURED","LED_OFF","LED_ON","FADE_IN","FADE_OUT","BLINK_SLOW","BLINK_MEDIUM","BLINK_FAST","FLASH_SLOW","FLASH_FAST","HEART_ON"],"firmwareValues":[0,1,2,3,4,5,6,7,8,9,10]},{"name":"patternLoop","type":"PropertyNumber","description":"Number of times the pattern is displayed."}],"bitMask":[{"type":"BitMaskValue","valueFor":"systemEventClass","bitShift":0,"length":5},{"type":"BitMaskValue","valueFor":"patternLoopExtension","bitShift":5,"length":2},{"type":"BitMaskValue","valueFor":"patternInversion","bitShift":7,"length":1},{"type":"BitMaskValue","valueFor":"type","bitShift":8,"length":8},{"type":"BitMaskValue","valueFor":"patternIdentifier","bitShift":16,"length":4},{"type":"BitMaskValue","valueFor":"patternLoop","bitShift":20,"length":4}]}],"byteMask":[{"type":"BitMaskValue","valueFor":"slice","bitShift":0,"length":24}]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"coreLed1Map","groupId":"0x01","localId":"0x0A","defaultValue":"{00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00}","description":"Defines LED patterns for system events. Configurable as 10 slices of 3 bytes each.","parameterType":{"type":"ParameterTypeByteArray","size":30,"distinctValues":false,"properties":[{"name":"slice","type":"PropertByteArray","size":3,"distinctValues":true,"properties":[{"name":"systemEventClass","type":"PropertyString","description":"System event class.","possibleValues":["BUTTON1","BUTTON2","BUZZER","ACCELEROMETER","POWER","TEMPERATURE","GEOLOCATION","CONFIGURATION","NETWORK","CORE","BLE_CONNECTIVITY","USER"],"firmwareValues":[0,1,2,3,4,5,6,7,8,9,10,11]},{"name":"patternLoopExtension","type":"PropertyNumber","description":"Pattern loop extension."},{"name":"patternInversion","type":"PropertyBoolean","description":"Indicates whether the pattern is inverted."},{"name":"type","type":"PropertyNumber","description":"System event type."},{"name":"patternIdentifier","type":"PropertyString","description":"Defines the LED behavior.","possibleValues":["NOT_CONFIGURED","LED_OFF","LED_ON","FADE_IN","FADE_OUT","BLINK_SLOW","BLINK_MEDIUM","BLINK_FAST","FLASH_SLOW","FLASH_FAST","HEART_ON"],"firmwareValues":[0,1,2,3,4,5,6,7,8,9,10]},{"name":"patternLoop","type":"PropertyNumber","description":"Number of times the pattern is displayed."}],"bitMask":[{"type":"BitMaskValue","valueFor":"systemEventClass","bitShift":0,"length":5},{"type":"BitMaskValue","valueFor":"patternLoopExtension","bitShift":5,"length":2},{"type":"BitMaskValue","valueFor":"patternInversion","bitShift":7,"length":1},{"type":"BitMaskValue","valueFor":"type","bitShift":8,"length":8},{"type":"BitMaskValue","valueFor":"patternIdentifier","bitShift":16,"length":4},{"type":"BitMaskValue","valueFor":"patternLoop","bitShift":20,"length":4}]}],"byteMask":[{"type":"BitMaskValue","valueFor":"slice","bitShift":0,"length":24}]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"coreBuzzerMap","groupId":"0x01","localId":"0x0B","defaultValue":"{00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00}","description":"Defines LED patterns for system events. Configurable as 10 slices of 3 bytes each.","parameterType":{"type":"ParameterTypeByteArray","size":30,"distinctValues":false,"properties":[{"name":"slice","type":"PropertByteArray","size":3,"distinctValues":true,"properties":[{"name":"systemEventClass","type":"PropertyString","description":"System event class.","possibleValues":["BUTTON1","BUTTON2","BUZZER","ACCELEROMETER","POWER","TEMPERATURE","GEOLOCATION","CONFIGURATION","NETWORK","CORE","BLE_CONNECTIVITY","USER"],"firmwareValues":[0,1,2,3,4,5,6,7,8,9,10,11]},{"name":"melodyCountExtension","type":"PropertyNumber","description":"Melody count extension"},{"name":"type","type":"PropertyNumber","description":"System event type."},{"name":"melodyIdentifier","type":"PropertyString","description":"Defines the LED behavior.","possibleValues":["NOT_CONFIGURED","OFF","MELODY_1","MELODY_2","MELODY_3"],"firmwareValues":[0,1,2,3,4]},{"name":"melodyCount","type":"PropertyNumber","description":"Number of times the melody is displayed."}],"bitMask":[{"type":"BitMaskValue","valueFor":"systemEventClass","bitShift":0,"length":5},{"type":"BitMaskValue","valueFor":"melodyCountExtension","bitShift":5,"length":3},{"type":"BitMaskValue","valueFor":"type","bitShift":8,"length":8},{"type":"BitMaskValue","valueFor":"melodyIdentifier","bitShift":16,"length":5},{"type":"BitMaskValue","valueFor":"patternLoop","bitShift":21,"length":3}]}],"byteMask":[{"type":"BitMaskValue","valueFor":"slice","bitShift":0,"length":24}]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"coreBuzzerMap","groupId":"0x01","localId":"0x0B","defaultValue":"{00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00}","description":"Defines LED patterns for system events. Configurable as 10 slices of 3 bytes each.","parameterType":{"type":"ParameterTypeByteArray","size":30,"distinctValues":false,"properties":[{"name":"slice","type":"PropertByteArray","size":3,"distinctValues":true,"properties":[{"name":"systemEventClass","type":"PropertyString","description":"System event class.","possibleValues":["BUTTON1","BUTTON2","BUZZER","ACCELEROMETER","POWER","TEMPERATURE","GEOLOCATION","CONFIGURATION","NETWORK","CORE","BLE_CONNECTIVITY","USER"],"firmwareValues":[0,1,2,3,4,5,6,7,8,9,10,11]},{"name":"melodyCountExtension","type":"PropertyNumber","description":"Melody count extension"},{"name":"type","type":"PropertyNumber","description":"System event type."},{"name":"melodyIdentifier","type":"PropertyString","description":"Defines the LED behavior.","possibleValues":["NOT_CONFIGURED","OFF","MELODY_2","MELODY_3","MELODY_4","MELODY_5","MELODY_6","MELODY_7","MELODY_8","MELODY_9","MELODY_10","MELODY_11","MELODY_12","MELODY_13","MELODY_14","MELODY_15","MELODY_16","MELODY_17","MELODY_18","MELODY_19","MELODY_20","MELODY_21"],"firmwareValues":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]},{"name":"melodyCount","type":"PropertyNumber","description":"Number of times the melody is displayed."}],"bitMask":[{"type":"BitMaskValue","valueFor":"systemEventClass","bitShift":0,"length":5},{"type":"BitMaskValue","valueFor":"melodyCountExtension","bitShift":5,"length":3},{"type":"BitMaskValue","valueFor":"type","bitShift":8,"length":8},{"type":"BitMaskValue","valueFor":"melodyIdentifier","bitShift":16,"length":5},{"type":"BitMaskValue","valueFor":"patternLoop","bitShift":21,"length":3}]}],"byteMask":[{"type":"BitMaskValue","valueFor":"slice","bitShift":0,"length":24}]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"coreAlmanacValidity","groupId":"0x01","localId":"0x0C","defaultValue":120,"unit":"days","description":"Number of days for which the GNSS almanac is considered as valid.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":7,"maximum":365}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"coreAlmanacOutdatedRatio","groupId":"0x01","localId":"0x0D","defaultValue":100,"unit":"%","description":"Percentage of outdated GNSS almanac entries which will trigger network update requests. A value of 100% disable the network requests. Applicable for both GNSS devices","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":100}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"coreCliPassword","groupId":"0x01","localId":"0x0E","defaultValue":123,"description":"User cli password","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"geolocMotionPeriod","groupId":"0x02","localId":"0x00","defaultValue":300,"unit":"s","description":"Position acquisition period while in motion","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":10,"maximum":86400}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"geolocStaticPeriod","groupId":"0x02","localId":"0x01","defaultValue":3600,"unit":"s","description":"Position acquisition period while static","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":10,"maximum":86400}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"geolocSosPeriod","groupId":"0x02","localId":"0x02","defaultValue":60,"unit":"s","description":"Position acquisition period while in sos","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":10,"maximum":86400}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"geolocMotionNbStart","groupId":"0x02","localId":"0x03","defaultValue":1,"description":"Number of acquisitions on motion start event","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":10}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"geolocMotionNbStop","groupId":"0x02","localId":"0x04","defaultValue":1,"description":"Number of acquisitions on motion stop event","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":10}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"geolocStartStopPeriod","groupId":"0x02","localId":"0x05","defaultValue":120,"unit":"s","description":"Position acquisition period while acquiring consecutive positions on motion start or stop","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":10,"maximum":86400}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"geolocGnssHoldOnMode","groupId":"0x02","localId":"0x06","description":"Select the GNSS hold on mode. Possible Values are:\\n0: Disabled\\n1: Always. Hold-on mode always set. Only controlled by the timer.\\n2: techno: If the gnss is actually used (meaning GNSS techno not skipped).\\n3: moving: Hold-mode set while moving.\\n4: techno and moving: if the gnss is actually used (meaning GNSS techno not skipped) and tracker is moving.","parameterType":{"type":"ParameterTypeString","possibleValues":["DISABLED","ALWAYS","TECHNO","MOVING","STATIC","TECHNO_AND_MOVING"],"firmwareValues":[0,1,2,3,4,5]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"geolocGnssHoldOnTimeout","groupId":"0x02","localId":"0x07","defaultValue":0,"unit":"s","description":"GNSS hold on mode timeout.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":86400}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"geolocProfile0Triggers","groupId":"0x02","localId":"0x08","description":"Geolocation event triggers 0","parameterType":{"type":"ParameterTypeBitMask","properties":[{"name":"geoTriggerPod","type":"PropertyBoolean","description":"Geoloc triggered on Position-on-demand via downlink or via button."},{"name":"geoTriggerSos","type":"PropertyBoolean","description":"SOS started"},{"name":"geoTriggerMotionStart","type":"PropertyBoolean","description":"Geoloc triggered on motion start event"},{"name":"geoTriggerMotionStop","type":"PropertyBoolean","description":"Geoloc triggered on motion stop event"},{"name":"geoTriggerInMotion","type":"PropertyBoolean","description":"Periodic geoloc while the tracker is in motion"},{"name":"geoTriggerInStatic","type":"PropertyBoolean","description":"Periodic geoloc running while the tracker is static"},{"name":"geoTriggerShock","type":"PropertyBoolean","description":"Geoloc triggered on shock action"},{"name":"geoTriggerTempHighThreshold","type":"PropertyBoolean","description":"Geoloc triggered on temperature high."},{"name":"geoTriggerTempLowThreshold","type":"PropertyBoolean","description":"Geoloc triggered on temperature high."},{"name":"geoTriggerGeozoning","type":"PropertyBoolean","description":"Geoloc triggered on geoTriggerGeozoning"}],"bitMask":[{"type":"BitMaskValue","valueFor":"geoTriggerPod","bitShift":0,"length":1},{"type":"BitMaskValue","valueFor":"geoTriggerSos","bitShift":1,"length":1},{"type":"BitMaskValue","valueFor":"geoTriggerMotionStart","bitShift":2,"length":1},{"type":"BitMaskValue","valueFor":"geoTriggerMotionStop","bitShift":3,"length":1},{"type":"BitMaskValue","valueFor":"geoTriggerInMotion","bitShift":4,"length":1},{"type":"BitMaskValue","valueFor":"geoTriggerInStatic","bitShift":5,"length":1},{"type":"BitMaskValue","valueFor":"geoTriggerShock","bitShift":6,"length":1},{"type":"BitMaskValue","valueFor":"geoTriggerTempHighThreshold","bitShift":7,"length":1},{"type":"BitMaskValue","valueFor":"geoTriggerTempLowThreshold","bitShift":8,"length":1},{"type":"BitMaskValue","valueFor":"geoTriggerGeozoning","bitShift":9,"length":1}]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"geolocProfile1Triggers","groupId":"0x02","localId":"0x09","description":"Geolocation event triggers 1","parameterType":{"type":"ParameterTypeBitMask","properties":[{"name":"geoTriggerPod","type":"PropertyBoolean","description":"Geoloc triggered on Position-on-demand via downlink or via button."},{"name":"geoTriggerSos","type":"PropertyBoolean","description":"SOS started"},{"name":"geoTriggerMotionStart","type":"PropertyBoolean","description":"Geoloc triggered on motion start event"},{"name":"geoTriggerMotionStop","type":"PropertyBoolean","description":"Geoloc triggered on motion stop event"},{"name":"geoTriggerInMotion","type":"PropertyBoolean","description":"Periodic geoloc while the tracker is in motion"},{"name":"geoTriggerInStatic","type":"PropertyBoolean","description":"Periodic geoloc running while the tracker is static"},{"name":"geoTriggerShock","type":"PropertyBoolean","description":"Geoloc triggered on shock action"},{"name":"geoTriggerTempHighThreshold","type":"PropertyBoolean","description":"Geoloc triggered on temperature high."},{"name":"geoTriggerTempLowThreshold","type":"PropertyBoolean","description":"Geoloc triggered on temperature high."},{"name":"geoTriggerGeozoning","type":"PropertyBoolean","description":"Geoloc triggered on temperature low."}],"bitMask":[{"type":"BitMaskValue","valueFor":"geoTriggerPod","bitShift":0,"length":1},{"type":"BitMaskValue","valueFor":"geoTriggerSos","bitShift":1,"length":1},{"type":"BitMaskValue","valueFor":"geoTriggerMotionStart","bitShift":2,"length":1},{"type":"BitMaskValue","valueFor":"geoTriggerMotionStop","bitShift":3,"length":1},{"type":"BitMaskValue","valueFor":"geoTriggerInMotion","bitShift":4,"length":1},{"type":"BitMaskValue","valueFor":"geoTriggerInStatic","bitShift":5,"length":1},{"type":"BitMaskValue","valueFor":"geoTriggerShock","bitShift":6,"length":1},{"type":"BitMaskValue","valueFor":"geoTriggerTempHighThreshold","bitShift":7,"length":1},{"type":"BitMaskValue","valueFor":"geoTriggerTempLowThreshold","bitShift":8,"length":1},{"type":"BitMaskValue","valueFor":"geoTriggerGeozoning","bitShift":9,"length":1}]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"geolocProfile2Triggers","groupId":"0x02","localId":"0x0A","description":"Geolocation event triggers 2","parameterType":{"type":"ParameterTypeBitMask","properties":[{"name":"geoTriggerPod","type":"PropertyBoolean","description":"Geoloc triggered on Position-on-demand via downlink or via button."},{"name":"geoTriggerSos","type":"PropertyBoolean","description":"SOS started"},{"name":"geoTriggerMotionStart","type":"PropertyBoolean","description":"Geoloc triggered on motion start event"},{"name":"geoTriggerMotionStop","type":"PropertyBoolean","description":"Geoloc triggered on motion stop event"},{"name":"geoTriggerInMotion","type":"PropertyBoolean","description":"Periodic geoloc while the tracker is in motion"},{"name":"geoTriggerInStatic","type":"PropertyBoolean","description":"Periodic geoloc running while the tracker is static"},{"name":"geoTriggerShock","type":"PropertyBoolean","description":"Geoloc triggered on shock action"},{"name":"geoTriggerTempHighThreshold","type":"PropertyBoolean","description":"Geoloc triggered on temperature high."},{"name":"geoTriggerTempLowThreshold","type":"PropertyBoolean","description":"Geoloc triggered on temperature high."},{"name":"geoTriggerGeozoning","type":"PropertyBoolean","description":"Geoloc triggered on temperature low."}],"bitMask":[{"type":"BitMaskValue","valueFor":"geoTriggerPod","bitShift":0,"length":1},{"type":"BitMaskValue","valueFor":"geoTriggerSos","bitShift":1,"length":1},{"type":"BitMaskValue","valueFor":"geoTriggerMotionStart","bitShift":2,"length":1},{"type":"BitMaskValue","valueFor":"geoTriggerMotionStop","bitShift":3,"length":1},{"type":"BitMaskValue","valueFor":"geoTriggerInMotion","bitShift":4,"length":1},{"type":"BitMaskValue","valueFor":"geoTriggerInStatic","bitShift":5,"length":1},{"type":"BitMaskValue","valueFor":"geoTriggerShock","bitShift":6,"length":1},{"type":"BitMaskValue","valueFor":"geoTriggerTempHighThreshold","bitShift":7,"length":1},{"type":"BitMaskValue","valueFor":"geoTriggerTempLowThreshold","bitShift":8,"length":1},{"type":"BitMaskValue","valueFor":"geoTriggerGeozoning","bitShift":9,"length":1}]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"geolocGbeProfile0Techno","groupId":"0x02","localId":"0x0B","description":"Technologies to schedule using the basic engine for events in triggers 0","parameterType":{"type":"ParameterTypeByteArray","size":6,"properties":[{"name":"Action","type":"PropertyString","possibleValues":["SKIP_ON_SUCCESS","ALWAYS_DONE"],"firmwareValues":[0,1]},{"name":"Technology","type":"PropertyString","possibleValues":["NONE","LR11xx_A_GNSS","WIFI","BLE_SCAN1","BLE_SCAN2","AIDED_GNSS","GNSS"],"firmwareValues":[0,1,2,3,4,5,6]}],"byteMask":[{"type":"BitMaskValue","valueFor":"Technology","bitShift":0,"length":7},{"type":"BitMaskValue","valueFor":"Action","bitShift":7,"length":1}]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"geolocGbeProfile1Techno","groupId":"0x02","localId":"0x0C","description":"Technologies to schedule using the basic engine for events in triggers 1","parameterType":{"type":"ParameterTypeByteArray","size":6,"properties":[{"name":"Action","type":"PropertyString","possibleValues":["SKIP_ON_SUCCESS","ALWAYS_DONE"],"firmwareValues":[0,1]},{"name":"Technology","type":"PropertyString","possibleValues":["NONE","LR11xx_A_GNSS","WIFI","BLE_SCAN1","BLE_SCAN2","AIDED_GNSS","GNSS"],"firmwareValues":[0,1,2,3,4,5,6]}],"byteMask":[{"type":"BitMaskValue","valueFor":"Technology","bitShift":0,"length":7},{"type":"BitMaskValue","valueFor":"Action","bitShift":7,"length":1}]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"geolocGbeProfile2Techno","groupId":"0x02","localId":"0x0D","description":"Technologies to schedule using the basic engine for events in triggers 2","parameterType":{"type":"ParameterTypeByteArray","size":6,"properties":[{"name":"Action","type":"PropertyString","possibleValues":["SKIP_ON_SUCCESS","ALWAYS_DONE"],"firmwareValues":[0,1]},{"name":"Technology","type":"PropertyString","possibleValues":["NONE","LR11xx_A_GNSS","WIFI","BLE_SCAN1","BLE_SCAN2","AIDED_GNSS","GNSS"],"firmwareValues":[0,1,2,3,4,5,6]}],"byteMask":[{"type":"BitMaskValue","valueFor":"Technology","bitShift":0,"length":7},{"type":"BitMaskValue","valueFor":"Action","bitShift":7,"length":1}]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"gnssConstellation","groupId":"0x03","localId":"0x00","defaultValue":2,"description":"GNSS constellations to be used","parameterType":{"type":"ParameterTypeString","possibleValues":["GPS_ONLY","GLONASS_ONLY","GPS_GLONASS","GPS_GALILEO","GPS_GLONASS_GALILEO","BEIDOU_ONLY","BEIDOU_GPS"],"firmwareValues":[0,1,2,3,4,5,6]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"gnssMaxTime","groupId":"0x03","localId":"0x01","defaultValue":300,"unit":"s","description":"GNSS max acquisition time.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":30,"maximum":300}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"gnssT0TimeoutStatic","groupId":"0x03","localId":"0x02","defaultValue":30,"unit":"s","description":"Max time to acquire at least one satellite when tracker is static","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":300}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"gnssEhpeStatic","groupId":"0x03","localId":"0x03","defaultValue":30,"unit":"m","description":"Expected estimated horizontal position error when the tracker is static","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":100}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"gnssConvergenceStatic","groupId":"0x03","localId":"0x04","defaultValue":20,"unit":"s","description":"Extra-time after a first fix to refine the fix","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":300}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"gnssT0TimeoutMotion","groupId":"0x03","localId":"0x05","defaultValue":30,"unit":"s","description":"Max time to acquire at least one satellite when tracker is moving","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":300}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"gnssEhpeMotion","groupId":"0x03","localId":"0x06","defaultValue":30,"unit":"m","description":"Expected estimated horizontal position error when the tracker is moving","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":100}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"gnssConvergenceMotion","groupId":"0x03","localId":"0x07","defaultValue":20,"unit":"s","description":"Extra-time after a first fix to refine the fix when the tracker is moving","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":300}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"gnssStandby","groupId":"0x03","localId":"0x08","defaultValue":604800,"unit":"s","description":"Max time to let the device in standby mode.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"gnssAgnssMaxTime","groupId":"0x03","localId":"0x09","defaultValue":45,"unit":"s","description":"Aided GNSS max acquisition time.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":15,"maximum":240}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"gnssT1Timeout","groupId":"0x03","localId":"0x0A","defaultValue":0,"unit":"s","description":"Extra time let in Aided GNSS mode to try doing a fix.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":300}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"lrConstellation","groupId":"0x04","localId":"0x00","description":"GNSS constellations to be used","parameterType":{"type":"ParameterTypeString","possibleValues":["GPS_ONLY","BEIDOU_ONLY","BEIDOU_GPS"],"firmwareValues":[0,5,6]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"lrScanMode","groupId":"0x04","localId":"0x01","description":"Scan mode (NAV1 / NAV2)","parameterType":{"type":"ParameterTypeString","possibleValues":["NAV1_SCAN","NAV2_SCAN"],"firmwareValues":[1,2]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"lrNbScans","groupId":"0x04","localId":"0x02","defaultValue":2,"description":"Number of scans for one position acquisition","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":1,"maximum":4}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"lrInterScanTime","groupId":"0x04","localId":"0x03","defaultValue":5,"unit":"s","description":"Time to wait between the scans for a position","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":15}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"lrWifiReportNbBssid","groupId":"0x04","localId":"0x04","defaultValue":4,"description":"Max number of WIFI BSSID per scan","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":1,"maximum":32}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"lrWifiMinNbBssid","groupId":"0x04","localId":"0x05","defaultValue":3,"description":"Minimum number of BSSID to consider the scan as success (solvable)","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":1,"maximum":10}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"lrWifiMinRssi","groupId":"0x04","localId":"0x06","defaultValue":3,"description":"Minimum number of BSSID to consider the scan as success (solvable)","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":-100,"maximum":0}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"lrWifiBssidMacType","groupId":"0x04","localId":"0x07","defaultValue":1,"description":"MAC administration type of the BSSID to report.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":2}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleScanDuration","groupId":"0x05","localId":"0x00","defaultValue":3000,"unit":"ms","description":"Total time for a BLE scan","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":50,"maximum":61440}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleScanWindow","groupId":"0x05","localId":"0x01","defaultValue":120,"unit":"ms","description":"Scan window","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":3,"maximum":10240}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleScanInterval","groupId":"0x05","localId":"0x02","defaultValue":130,"unit":"ms","description":"Scan interval","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":1,"maximum":10240}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleScanType","groupId":"0x05","localId":"0x03","defaultValue":0,"description":"Type of beacons to scan","parameterType":{"type":"ParameterTypeString","possibleValues":["ALL_BEACONS","EDDYSTONE_UUID","EDDYSTONE_URL","ALL_EDDYSTONE","IBEACON_ONLY","ALTBEACON_ONLY","CUSTOM","EXPOSURE_ADVERTISEMENT"],"firmwareValues":[0,1,2,3,4,5,6,7]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleScanMinRssi","groupId":"0x05","localId":"0x04","defaultValue":-80,"unit":"dB","description":"Min RSSI to consider the beacon","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":-120,"maximum":0}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleScanMinNbBeacons","groupId":"0x05","localId":"0x05","defaultValue":1,"description":"Min number of beacons to consider the scan as success (solvable).","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":1,"maximum":20}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleScanFilter1Mask","groupId":"0x05","localId":"0x06","defaultValue":[0],"description":"Mask (10 bytes) to be applied to the ADV frame.","parameterType":{"type":"ParameterTypeByteArray","size":10},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleScanFilter1Value","groupId":"0x05","localId":"0x07","defaultValue":[0],"description":"Comparison value (10 bytes) belonging to filter1","parameterType":{"type":"ParameterTypeByteArray","size":10},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleScanFilter1Offset","groupId":"0x05","localId":"0x08","defaultValue":0,"description":"Offset in the ADV from which we apply the filter1","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":256}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleScanFilter2Mask","groupId":"0x05","localId":"0x09","defaultValue":[0],"description":"Mask (10 bytes) to be applied to the ADV frame.","parameterType":{"type":"ParameterTypeByteArray","size":10},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleScanFilter2Value","groupId":"0x05","localId":"0x0A","defaultValue":[0],"description":"Comparison value (10 bytes) belonging to filter2","parameterType":{"type":"ParameterTypeByteArray","size":10},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleScanFilter2Offset","groupId":"0x05","localId":"0x0B","defaultValue":0,"description":"Offset in the ADV from which we apply the filter2","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":256}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleScanNbBeacons","groupId":"0x05","localId":"0x0C","defaultValue":4,"description":"Number of beacons to report","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":1,"maximum":20}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleScanReportType","groupId":"0x05","localId":"0x0D","defaultValue":0,"description":"Scan report type","parameterType":{"type":"ParameterTypeString","possibleValues":["MAC_ADDRESS","SHORT_IDENTIFIER","LONG_IDENTIFIER"],"firmwareValues":[0,1,2]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleScanReportIdOfs","groupId":"0x05","localId":"0x0E","defaultValue":4,"description":"Offset in ADV to extract the beacon identifier","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":256}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleScanDuration","groupId":"0x06","localId":"0x00","defaultValue":3000,"unit":"ms","description":"Total time for a BLE scan","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":50,"maximum":61440}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleScanWindow","groupId":"0x06","localId":"0x01","defaultValue":120,"unit":"ms","description":"Scan window","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":3,"maximum":10240}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleScanInterval","groupId":"0x06","localId":"0x02","defaultValue":130,"unit":"ms","description":"Scan interval","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":1,"maximum":10240}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleScanType","groupId":"0x06","localId":"0x03","defaultValue":0,"description":"Type of beacons to scan","parameterType":{"type":"ParameterTypeString","possibleValues":["ALL_BEACONS","EDDYSTONE_UUID","EDDYSTONE_URL","ALL_EDDYSTONE","IBEACON_ONLY","ALTBEACON_ONLY","CUSTOM","EXPOSURE_ADVERTISEMENT"],"firmwareValues":[0,1,2,3,4,5,6,7]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleScanMinRssi","groupId":"0x06","localId":"0x04","defaultValue":-100,"unit":"dB","description":"Min RSSI to consider the beacon","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":-120,"maximum":0}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleScanMinNbBeacons","groupId":"0x06","localId":"0x05","defaultValue":1,"description":"Min number of beacons to consider the scan as success (solvable).","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":1,"maximum":20}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleScanFilter1Mask","groupId":"0x06","localId":"0x06","defaultValue":[0],"description":"Mask (10 bytes) to be applied to the ADV frame.","parameterType":{"type":"ParameterTypeByteArray","size":10},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleScanFilter1Value","groupId":"0x06","localId":"0x07","defaultValue":[0],"description":"Comparison value (10 bytes) belonging to filter1","parameterType":{"type":"ParameterTypeByteArray","size":10},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleScanFilter1Offset","groupId":"0x06","localId":"0x08","defaultValue":0,"description":"Offset in the ADV from which we apply the filter1","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":256}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleScanFilter2Mask","groupId":"0x06","localId":"0x09","defaultValue":[0],"description":"Mask (10 bytes) to be applied to the ADV frame.","parameterType":{"type":"ParameterTypeByteArray","size":10},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleScanFilter2Value","groupId":"0x06","localId":"0x0A","defaultValue":[0],"description":"Comparison value (10 bytes) belonging to filter2","parameterType":{"type":"ParameterTypeByteArray","size":10},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleScanFilter2Offset","groupId":"0x06","localId":"0x0B","defaultValue":0,"description":"Offset in the ADV from which we apply the filter2","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":256}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleScanNbBeacons","groupId":"0x06","localId":"0x0C","defaultValue":4,"description":"Number of beacons to report","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":1,"maximum":20}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleScanReportType","groupId":"0x06","localId":"0x0D","defaultValue":0,"description":"Scan report type","parameterType":{"type":"ParameterTypeString","possibleValues":["MAC_ADDRESS","SHORT_IDENTIFIER","LONG_IDENTIFIER"],"firmwareValues":[0,1,2]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleScanReportIdOfs","groupId":"0x06","localId":"0x0E","defaultValue":4,"description":"Offset in ADV to extract the beacon identifier","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":256}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"acceleroMotionSensi","groupId":"0x07","localId":"0x00","defaultValue":1,"unit":"mg","description":"Motion sensitivity. Step 31 mg.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":1,"maximum":96},"multiply":31},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"acceleroMotionDuration","groupId":"0x07","localId":"0x01","defaultValue":120,"unit":"s","description":"Motion duration","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":10,"maximum":3600}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"acceleroFullScale","groupId":"0x07","localId":"0x02","defaultValue":3,"description":"Scale use (2,4,8,16 g).","parameterType":{"type":"ParameterTypeString","possibleValues":["2_G","4_G","8_G","16_G"],"firmwareValues":[0,1,2,3]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"acceleroOutputDataRate","groupId":"0x07","localId":"0x03","defaultValue":0,"description":"Output data rate (12.5, 25, 50, 100, 200 Hz).","parameterType":{"type":"ParameterTypeString","possibleValues":["12_5_HZ","25_HZ","50_HZ","100_HZ","200_HZ"],"firmwareValues":[0,1,2,3,4]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"acceleroShockThreshold","groupId":"0x07","localId":"0x04","defaultValue":0,"description":"Shock threshold. Step 63 mg","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":128},"multiply":63},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"netSelection","groupId":"0x08","localId":"0x00","defaultValue":0,"description":"Define the networking type","parameterType":{"type":"ParameterTypeString","possibleValues":["LORA_ONLY","CELLULAR_ONLY","LORA_FALLBACK_CELLULAR","CELLULAR_FALLBACK_LORA"],"firmwareValues":[0,1,2,3]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"netReconnectionSpacing","groupId":"0x08","localId":"0x01","defaultValue":600,"description":"Time to wait before retrying to connect the main network","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":2147483647}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"netMainProbeTimeout","groupId":"0x08","localId":"0x02","defaultValue":600,"description":"Duration between each attempts reconnect the main network.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":120,"maximum":2147483647}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"lorawanCnxTimeout","groupId":"0x09","localId":"0x00","defaultValue":0,"description":"Max time to wait for joining the network. The value 0 disables the timer.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":2147483647}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"lorawanDlTriggerPeriod","groupId":"0x09","localId":"0x01","defaultValue":3600,"unit":"s","description":"Period at which an empty uplink is sent to trigger a downlink. 0 disable the function.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":2147483647}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"lorawanProbeMaxAttempts","groupId":"0x09","localId":"0x02","defaultValue":4,"description":"Number of link-check sent declaring the network as lost","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":10}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"lorawanProbePeriod","groupId":"0x09","localId":"0x03","defaultValue":43200,"description":"Time between link-check requests","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":120,"maximum":2147483647}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"lorawanConfirmNotifMap","groupId":"0x09","localId":"0x04","defaultValue":"{00}","description":"Map enabling the LoRaWAN confirmed message for notifications.","parameterType":{"type":"ParameterTypeByteArray","size":6,"distinctValues":true,"properties":[{"name":"systemClass","type":"PropertyObject","properties":[{"name":"status","type":"PropertyBoolean","description":"System status Versions, temperature, reset cause."},{"name":"lowBattery","type":"PropertyBoolean","description":"Low battery alert."},{"name":"bleStatus","type":"PropertyBoolean","description":"Bluetooth Low Energy status"},{"name":"tamperDetection","type":"PropertyBoolean","description":"Tamper detection alert."}]},{"name":"sosClass","type":"PropertyObject","properties":[{"name":"sosOn","type":"PropertyBoolean","description":"SOS activated."},{"name":"sosOff","type":"PropertyBoolean","description":"SOS deactivated."}]},{"name":"temperatureClass","type":"PropertyObject","properties":[{"name":"tempHigh","type":"PropertyBoolean","description":"Critical high temperature reached"},{"name":"tempLow","type":"PropertyBoolean","description":"Critical low temperature reached"},{"name":"tempNormal","type":"PropertyBoolean","description":"Temperature back to normal"}]},{"name":"accelerometerClass","type":"PropertyObject","properties":[{"name":"motionStart","type":"PropertyBoolean","description":"Motion start detected."},{"name":"motionEnd","type":"PropertyBoolean","description":"Motion end detected."},{"name":"shock","type":"PropertyBoolean","description":"Shock detected."}]},{"name":"networkingClass","type":"PropertyObject","properties":[{"name":"mainUp","type":"PropertyBoolean","description":"Main network is up."},{"name":"backupUp","type":"PropertyBoolean","description":"Main network down. Backup is up."}]},{"name":"geozoningClass","type":"PropertyObject","properties":[{"name":"geozoningOn","type":"PropertyBoolean","description":"Geozoning is on."}]}],"byteMask":[{"valueFor":"systemClass","type":"BitMaskObject","values":[{"type":"BitMaskValue","valueFor":"status","bitShift":0,"length":1},{"type":"BitMaskValue","valueFor":"lowBattery","bitShift":1,"length":1},{"type":"BitMaskValue","valueFor":"bleStatus","bitShift":2,"length":1},{"type":"BitMaskValue","valueFor":"tamperDetection","bitShift":3,"length":1}]},{"valueFor":"sosClass","type":"BitMaskObject","values":[{"type":"BitMaskValue","valueFor":"sosOn","bitShift":0,"length":1},{"type":"BitMaskValue","valueFor":"sosOff","bitShift":1,"length":1}]},{"valueFor":"temperatureClass","type":"BitMaskObject","values":[{"type":"BitMaskValue","valueFor":"tempHigh","bitShift":0,"length":1},{"type":"BitMaskValue","valueFor":"tempLow","bitShift":1,"length":1},{"type":"BitMaskValue","valueFor":"tempNormal","bitShift":2,"length":1}]},{"valueFor":"accelerometerClass","type":"BitMaskObject","values":[{"type":"BitMaskValue","valueFor":"motionStart","bitShift":0,"length":1},{"type":"BitMaskValue","valueFor":"motionEnd","bitShift":1,"length":1},{"type":"BitMaskValue","valueFor":"shock","bitShift":2,"length":1}]},{"valueFor":"networkingClass","type":"BitMaskObject","values":[{"type":"BitMaskValue","valueFor":"mainUp","bitShift":0,"length":1},{"type":"BitMaskValue","valueFor":"backupUp","bitShift":1,"length":1}]},{"valueFor":"geozoningClass","type":"BitMaskObject","values":[{"type":"BitMaskValue","valueFor":"geozoningOn","bitShift":0,"length":1}]}]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"lorawanConfirmNotifRetry","groupId":"0x09","localId":"0x05","defaultValue":0,"description":"Time between link-check requests","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":15}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"lorawanS1TxStrategy","groupId":"0x09","localId":"0x06","defaultValue":473102,"description":"Socket 1. Transmission strategy","parameterType":{"type":"ParameterTypeBitMask","properties":[{"name":"ADREnabled","type":"PropertyBoolean","description":"true: to enable the LoRa network ADR if the tracker is static. false: to disable the network ADR regardless the motion state of the tracker"},{"name":"dualTransmissionInStaticEnabled","type":"PropertyBoolean","description":"Control the dual transmission when the tracker is static. true: to enable the dual transmission in static state. false: to disable it"},{"name":"dualTransmissionInMotionEnabled","type":"PropertyBoolean","description":"Control the dual transmission when the tracker is in motion. true: to enable the dual transmission in motion state. false: to disable it in motion state."},{"name":"dataRateModification","type":"PropertyBoolean","description":"Control the DR (Datarate) modification for over-sized messages. true: to allow AOS to adapt the DR for messages not fitting the allowed size for a given datarate.false: to prevent sending of over-sized messages"},{"name":"firstTransmissionDatarate","type":"PropertyObject","properties":[{"name":"dr0","type":"PropertyBoolean","description":"false: dr0 is disabled. true: dr0 is enabled."},{"name":"dr1","type":"PropertyBoolean","description":"false: dr1 is disabled. true: dr1 is enabled."},{"name":"dr2","type":"PropertyBoolean","description":"false: dr2 is disabled. true: dr2 is enabled."},{"name":"dr3","type":"PropertyBoolean","description":"false: dr3 is disabled. true: dr3 is enabled."},{"name":"dr4","type":"PropertyBoolean","description":"false: dr4 is disabled. true: dr4 is enabled."},{"name":"dr5","type":"PropertyBoolean","description":"false: dr5 is disabled. true: dr5 is enabled."},{"name":"dr6","type":"PropertyBoolean","description":"false: dr6 is disabled. true: dr6 is enabled."},{"name":"dr7","type":"PropertyBoolean","description":"false: dr7 is disabled. true: dr7 is enabled."}]},{"name":"secondTransmissionDatarate","type":"PropertyObject","properties":[{"name":"dr0","type":"PropertyBoolean","description":"false: dr0 is disabled. true: dr0 is enabled."},{"name":"dr1","type":"PropertyBoolean","description":"false: dr1 is disabled. true: dr1 is enabled."},{"name":"dr2","type":"PropertyBoolean","description":"false: dr2 is disabled. true: dr2 is enabled."},{"name":"dr3","type":"PropertyBoolean","description":"false: dr3 is disabled. true: dr3 is enabled."},{"name":"dr4","type":"PropertyBoolean","description":"false: dr4 is disabled. true: dr4 is enabled."},{"name":"dr5","type":"PropertyBoolean","description":"false: dr5 is disabled. true: dr5 is enabled."},{"name":"dr6","type":"PropertyBoolean","description":"false: dr6 is disabled. true: dr6 is enabled."},{"name":"dr7","type":"PropertyBoolean","description":"false: dr7 is disabled. true: dr7 is enabled."}]}],"bitMask":[{"type":"BitMaskValue","valueFor":"ADREnabled","bitShift":0,"length":1},{"type":"BitMaskValue","valueFor":"dualTransmissionInStaticEnabled","bitShift":1,"length":1},{"type":"BitMaskValue","valueFor":"dualTransmissionInMotionEnabled","bitShift":2,"length":1},{"type":"BitMaskValue","valueFor":"dataRateModification","bitShift":3,"length":1},{"valueFor":"firstTransmissionDatarate","type":"BitMaskObject","values":[{"type":"BitMaskValue","valueFor":"dr0","bitShift":8,"length":1},{"type":"BitMaskValue","valueFor":"dr1","bitShift":9,"length":1},{"type":"BitMaskValue","valueFor":"dr2","bitShift":10,"length":1},{"type":"BitMaskValue","valueFor":"dr3","bitShift":11,"length":1},{"type":"BitMaskValue","valueFor":"dr4","bitShift":12,"length":1},{"type":"BitMaskValue","valueFor":"dr5","bitShift":13,"length":1},{"type":"BitMaskValue","valueFor":"dr6","bitShift":14,"length":1},{"type":"BitMaskValue","valueFor":"dr7","bitShift":15,"length":1}]},{"valueFor":"secondTransmissionDatarate","type":"BitMaskObject","values":[{"type":"BitMaskValue","valueFor":"dr0","bitShift":16,"length":1},{"type":"BitMaskValue","valueFor":"dr1","bitShift":17,"length":1},{"type":"BitMaskValue","valueFor":"dr2","bitShift":18,"length":1},{"type":"BitMaskValue","valueFor":"dr3","bitShift":19,"length":1},{"type":"BitMaskValue","valueFor":"dr4","bitShift":20,"length":1},{"type":"BitMaskValue","valueFor":"dr5","bitShift":21,"length":1},{"type":"BitMaskValue","valueFor":"dr6","bitShift":22,"length":1},{"type":"BitMaskValue","valueFor":"dr7","bitShift":23,"length":1}]}]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"lorawanS1UlPort","groupId":"0x09","localId":"0x07","defaultValue":19,"description":"Socket 1. Uplink port","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":1,"maximum":252}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"lorawanS1DlPort","groupId":"0x09","localId":"0x08","defaultValue":3,"description":"Socket 1. Downlink port","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":1,"maximum":252}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"cellSimInterface","groupId":"0x0A","localId":"0x00","description":"Sim interface.","defaultValue":"","parameterType":{"type":"ParameterTypeString","possibleValues":["SIM0","E_SIM"],"firmwareValues":[0,1]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"cellNetworkType","groupId":"0x0A","localId":"0x01","description":"Network type","defaultValue":"","parameterType":{"type":"ParameterTypeString","possibleValues":["CELLULAR_NOT_USED","LTE_M","NB_IOT"],"firmwareValues":[0,1,2]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"cellSearchBands","groupId":"0x0A","localId":"0x02","defaultValue":"{00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00}","description":"Radio frequency bands scanned to search a cell.","parameterType":{"type":"ParameterTypeByteArray","size":19},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"cellCnxTimeoutStatic","groupId":"0x0A","localId":"0x03","defaultValue":180,"unit":"s","description":"Duration during which the modem searches for a cellular network. Applicable when the tracker is static.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":180,"maximum":900}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"cellCnxTimeoutMotion","groupId":"0x0A","localId":"0x04","defaultValue":300,"unit":"s","description":"Duration during which the modem searches for a cellular network. Applicable when the tracker is motion.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":180,"maximum":900}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"cellCnxNwLostTimeout","groupId":"0x0A","localId":"0x05","defaultValue":60,"unit":"s","description":"Duration let to the modem to automatically recover the network after a network lost.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":900}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"cellCnxMaxAttempts","groupId":"0x0A","localId":"0x06","defaultValue":3,"description":"Number of times the network search is repeated before shutting down the modem.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":1,"maximum":10}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"cellAccessPointName","groupId":"0x0A","localId":"0x07","description":"String providing the service access point name. If not provided, this information is retrieve from the SIM.","defaultValue":"","parameterType":{"type":"ParameterTypeAsciiString","maxSize":32},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"cellOperatorSimSlot0","groupId":"0x0A","localId":"0x08","description":"Cellular operator name when using the SIM0","defaultValue":"","parameterType":{"type":"ParameterTypeAsciiString","maxSize":32},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"cellOperatorSimSlot1","groupId":"0x0A","localId":"0x09","description":"Cellular operator name when using the SIM1 (E.SIM).","defaultValue":"","parameterType":{"type":"ParameterTypeAsciiString","maxSize":32},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"cellLowPowerMode","groupId":"0x0A","localId":"0x0A","description":"Low power mode","defaultValue":"","parameterType":{"type":"ParameterTypeString","possibleValues":["DISABLED","PSM","EDRX","PSM_EDRX"],"firmwareValues":[0,1,2,3]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"cellPsmTauPeriod","groupId":"0x0A","localId":"0x0B","description":"Bit-field giving the requested TAU period.","defaultValue":254,"parameterType":{"type":"ParameterTypeBitMask","properties":[{"name":"timerValue","type":"PropertyNumber"},{"name":"timerValueUnit","type":"PropertyString","possibleValues":["VALUE_IS_INCREMENTED_IN_MULTIPLES_OF_10_MINUTES","VALUE_IS_INCREMENTED_IN_MULTIPLES_OF_1_HOUR","VALUE_IS_INCREMENTED_IN_MULTIPLES_OF_10_HOURS","VALUE_IS_INCREMENTED_IN_MULTIPLES_OF_2_SECONDS","VALUE_IS_INCREMENTED_IN_MULTIPLES_OF_30_SECONDS","VALUE_IS_INCREMENTED_IN_MULTIPLES_OF_1_MINUTE","VALUE_IS_INCREMENTED_IN_MULTIPLES_OF_320_HOURS","THE_TIMER_IS_DEACTIVATED"],"firmwareValues":[0,1,2,3,4,5,6,7]}],"bitMask":[{"type":"BitMaskValue","valueFor":"timerValue","bitShift":0,"length":5},{"type":"BitMaskValue","valueFor":"timerValueUnit","bitShift":5,"length":3}]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"cellPsmActiveTime","groupId":"0x0A","localId":"0x0C","description":"Bit-field giving the requested active time.","defaultValue":2,"parameterType":{"type":"ParameterTypeBitMask","properties":[{"name":"timerValue","type":"PropertyNumber"},{"name":"timerValueUnit","type":"PropertyString","possibleValues":["VALUE_IS_INCREMENTED_IN_MULTIPLES_OF_2_SECONDS","VALUE_IS_INCREMENTED_IN_MULTIPLES_OF_1_MINUTE","VALUE_IS_INCREMENTED_IN_MULTIPLES_OF_DECI_HOURS","THE_TIMER_IS_DEACTIVATED"],"firmwareValues":[0,1,2,7]}],"bitMask":[{"type":"BitMaskValue","valueFor":"timerValue","bitShift":0,"length":5},{"type":"BitMaskValue","valueFor":"timerValueUnit","bitShift":5,"length":3}]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"cellEdrxPcl","groupId":"0x0A","localId":"0x0D","description":"Requested paging cycle length","defaultValue":15,"parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":15}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"cellEdrxPtw","groupId":"0x0A","localId":"0x0E","description":"Requested paging time window","defaultValue":3,"parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":15}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"cellRaiTimeout","groupId":"0x0A","localId":"0x0F","description":"RAI (Release Assistance Indication) timeout. A null value disables the feature. Use only with UDP protocol.","defaultValue":500,"unit":"ms","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":10000}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"cellProbeMaxAttempts","groupId":"0x0A","localId":"0x10","description":"Number of echo-request sent before declaring the network as lost. Set 0 to disable the feature.","defaultValue":0,"parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":10}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"cellProbePeriod","groupId":"0x0A","localId":"0x11","description":"Time between echo-request, or since the last downlink activity.","defaultValue":120,"parameterType":{"type":"ParameterTypeNumber","range":{"minimum":120}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"cellS1TransportProto","groupId":"0x0A","localId":"0x12","description":"Socket 1 transport protocol","defaultValue":1,"parameterType":{"type":"ParameterTypeString","possibleValues":["TCP","UDP"],"firmwareValues":[0,1]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"cellS1IpUrlAddr","groupId":"0x0A","localId":"0x13","description":"Socket 1 remote IP address or URL in string format (max 32 bytes)","defaultValue":"","parameterType":{"type":"ParameterTypeAsciiString","maxSize":32},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"cellS1DstIpPort","groupId":"0x0A","localId":"0x14","description":"Socket 1 destination UDP/TCP port","defaultValue":0,"parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":65535}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"cellS1SrcIpPort","groupId":"0x0A","localId":"0x15","description":"Socket 1 local UDP/TCP port number. Value 0 means that the modem will choose one.","defaultValue":0,"parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":65535}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"cellS1TxAggrTime","groupId":"0x0A","localId":"0x16","description":"Duration in second for which the messages are hold in the socket 1 transmit queue before being transmitted","defaultValue":120,"unit":"s","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":3600}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleCnxTxPower","groupId":"0x0B","localId":"0x00","defaultValue":19,"description":"BLE Tx power level.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":31}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleCnxAdvDuration","groupId":"0x0B","localId":"0x01","defaultValue":60,"description":"Time to wait before stopping advertising or switching to slow advertising","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":30}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleCnxBehavior","groupId":"0x0B","localId":"0x02","defaultValue":1,"description":"The connectivity configuration.","parameterType":{"type":"ParameterTypeString","possibleValues":["DISABLE","ENABLE_NO_PASSKEY","ENABLE_PASSKEY","ENABLE_NO_PASSKEY_NO_SLOW_ADV","ENABLE_PASSKEY_NO_SLOW_ADV"],"firmwareValues":[0,1,2,3,4]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleBeaconTxPower","groupId":"0x0B","localId":"0x03","defaultValue":19,"description":"Time to wait before stopping advertising or switching to slow advertising","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":0,"maximum":31}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleBeaconType","groupId":"0x0B","localId":"0x04","defaultValue":1,"description":"The connectivity configuration.","parameterType":{"type":"ParameterTypeString","possibleValues":["DISABLE","EDDYSTONE_UID","IBEACON","ALTBEACON","QUUPPA","EXPOSURE_ADVERTISEMENT"],"firmwareValues":[0,1,2,3,4,5,6,7]},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleBeaconIdentifier","groupId":"0x0B","localId":"0x05","description":"BLE beaconing ID parameter","parameterType":{"type":"ParameterTypeByteArray"},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleBeaconFastAdvInterval","groupId":"0x0B","localId":"0x06","defaultValue":333,"description":"BLE beacon fast advertising interval.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":20,"maximum":10240}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]},{"driverParameterName":"bleBeaconFastSlowInterval","groupId":"0x0B","localId":"0x07","defaultValue":1000,"description":"BLE beacon slow advertising interval.","parameterType":{"type":"ParameterTypeNumber","range":{"minimum":20,"maximum":10240}},"compatibleTrackerModels":[{"producerId":"abeeway","moduleId":"compact-tracker","version":"2.0"},{"producerId":"abeeway","moduleId":"combo-compact-tracker","version":"1.0"}]}]}]');

/***/ }),

/***/ 788:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

let responseClass = __webpack_require__(289);
let util = __webpack_require__(94);

let RequestType = responseClass.ResponseType
const SENSOR_TYPES = {
   "DO_NOT_USE" :0,
    "ACCELEROMETER": 1
};
function Request(requestType,
    genericConfigurationSet,
    parameterClassConfigurationSet,
    genericConfigurationGet,
    parameterClassConfigurationGet,
    bleStatusConnectivity,
    crc,
    sensorIds
    ){
        this.requestType = requestType;
        this.genericConfigurationSet = genericConfigurationSet;
        this.parameterClassConfigurationSet = parameterClassConfigurationSet;
        this.genericConfigurationGet = genericConfigurationGet;
        this.parameterClassConfigurationGet = parameterClassConfigurationGet;
        this.bleStatusConnectivity = bleStatusConnectivity;
        this.crc = crc;
        this.sensorIds = sensorIds;
}
function ParameterClassConfigurationGet(group, parameters){
    this.group = group
    this.parameters = parameters
}
function encodeRequest(data){
    let encData = [] 
    // encode type and ackToken
    encData[0] = (0x02 <<3) | data.ackToken
    let requestType = encodeRequestType(data.requestType)
    encData[1] = requestType
    switch (requestType){
        case 0:
            encData = encodeRequestGenericConfigurationSet(data.setGenericParameters, encData)
            break;
        case 1:
            encData = encodeRequestParameterClassConfigurationSet(data.setParameterClass, encData)
            break;
        case 2:
            encData = encodeRequestGenericConfigurationGet(data.getGenericParameters, encData)
            break;
        case 3:
            encData = encodeRequestParameterClassConfigurationGet(data.getParameterClass, encData)
            break;
        case 5:
            encData = encodeCrc(data.crc, encData)
            break;
        case 6:
            encData = encodeSensorRequest(data.sensorIds, encData)
            break;
        default:
            throw new Error("Unknown request type")

    }
    return encData
}
function encodeRequestType(value){
    switch (value){
        case "GENERIC_CONFIGURATION_SET":
            return 0;
        case "PARAM_CLASS_CONFIGURATION_SET":
            return 1;
        case "GENERIC_CONFIGURATION_GET":
            return 2;
        case "PARAM_CLASS_CONFIGURATION_GET":
            return 3;
        case "BLE_STATUS_CONNECTIVITY":
            return 4;
        case "CRC_CONFIGURATION_REQUEST":
            return 5;
        case "SENSOR_REQUEST":
            return 6;
        default:
            throw new Error("Unknown request type")

    }
}
function decodeRequest(payload){
    let request = new Request();

    let typeValue  = payload[1]
    switch (typeValue){
        case 0:
            request.requestType = RequestType.GENERIC_CONFIGURATION_SET
            request.genericConfigurationSet = determineRequestGenericConfigurationSet(payload.slice(2))
            break;
        case 1:
            request.requestType = RequestType.PARAM_CLASS_CONFIGURATION_SET
            request.parameterClassConfigurationSet = determineRequestParameterClassConfigurationSet(payload.slice(2))
            break;
        case 2:
            request.requestType = RequestType.GENERIC_CONFIGURATION_GET
            request.genericConfigurationGet = determineRequestGenericConfigurationGet(payload.slice(2))
            break;
        case 3:
            request.requestType = RequestType.PARAM_CLASS_CONFIGURATION_GET
            request.parameterClassConfigurationGet = determineRequestParameterClassConfigurationGet(payload.slice(2))
            break;
        case 4:
            request.requestType = RequestType.BLE_STATUS_CONNECTIVITY
            //TO BE defined
            break;
        case 5:
            request.requestType = RequestType.CRC_CONFIGURATION_REQUEST
            request.crc = decodeCrc(payload.slice(2))
            break;
        case 6:
            request.requestType = RequestType.SENSOR_REQUEST
            request.sensorIds = decodeSensorRequest(payload.slice(2))
           break;
        default:
            throw new Error("Request Type Unknown");
    }
    return request

}

function determineRequestGenericConfigurationSet(payload){
    let i = 0;
    let request = []
    while (payload.length > i) {
        let groupId = payload[i]
        let localId = payload[1+i]
        let size = payload[2+i]>>3 & 0x1F;
        let dataType = payload[2+i] & 0x07;
        let parameter = responseClass.getParameterByGroupIdAndLocalId(responseClass.parametersByGroupIdAndLocalId, groupId, localId)
        switch(dataType){
            case 0: 
                determineDeprecatedRequest(request, parameter,groupId)
                break;
            case 1:
                responseClass.determineConfiguration(request, parameter,  parseInt(util.convertBytesToString(payload.slice(3+i,3+i+size)),16), groupId, size)
                break;
            case 2:
                //we don't have a float parameter now
                break;
            case 3:
                responseClass.determineConfiguration(request, parameter,  payload.slice(3+i,3+i+size), groupId, size)
                break;
            case 4:
                responseClass.determineConfiguration(request, parameter,  payload.slice(3+i,3+i+size), groupId, size)
                break; 
            default:
                throw new Error("Unknown parameter type");
            
        }
        i = i + size + 3 
    }
    return request
}
function encodeCrc(groupNames, encData) {
    // Ensure groupNames is an array and not empty
    if (!Array.isArray(groupNames) || groupNames.length === 0) {
        throw new Error("Group names array is required and cannot be empty");
    }

    let bitmap = 0;

    // Loop through all group names and set the corresponding bit if the group is selected
    groupNames.forEach(group => {
        // Find the index of the group name in the GroupType object
        let index = Object.values(responseClass.GroupType).indexOf(group);
        
        // If the group is valid, set the corresponding bit in the bitmap
        if (index !== -1) {
            bitmap |= (1 << index);
        } else {
            console.warn(`Group name "${group}" not found in GroupType. Skipping.`);
        }
    });

    // Convert the bitmap into a 2-byte array (high byte and low byte)
    // Add the result to encData
    encData.push(bitmap >> 8, bitmap & 0xFF);

    return encData;
}

// Convert bitmap back to group names
function decodeCrc(bitmapArray) {
    // Check if the bitmapArray is [0, 0], meaning all groups are requested
    if (bitmapArray[0] === 0 && bitmapArray[1] === 0) {
        return Object.values(responseClass.GroupType);  // Return all groups if crc is empty
    }
    if (bitmapArray.length < 2) return []; // Avoid out-of-bounds errors

    // Convert 2-byte array into an integer
    let bitmap = (bitmapArray[0] << 8) | bitmapArray[1];

    let result = [];
    Object.keys(responseClass.GroupType).forEach((key, index) => {
        if ((bitmap & (1 << index)) !== 0) {  // Corrected bitwise check
            result.push(responseClass.GroupType[key]);
        }
    });
    return result;
}
function decodeSensorRequest(buffer) {
    return Array.from(buffer).map(id => {
        // Find the type corresponding to the numeric id
        let type = Object.keys(SENSOR_TYPES).find(key => SENSOR_TYPES[key] === id);
        return {
            id,
            type: type || "Unknown"  // If no match, set it to "Unknown"
        };
    });
}

// Encode: Convert sensor objects to binary format and fill encData
function encodeSensorRequest(sensorIds, encData) {

    if (!Array.isArray(sensorIds)) {
        throw new Error("sensorIds must be an array.");
    }
    if (!Array.isArray(encData)) {
        throw new Error("encData must be an array.");
    }

    sensorIds.forEach((sensor, index) => {
        if (!(sensor.type in SENSOR_TYPES)) {
            throw new Error(`Unknown sensor type: ${sensor.type}`);
        }
        let encodedValue = SENSOR_TYPES[sensor.type];
        encData.push(encodedValue);
    });
    return encData;
}


function determineRequestParameterClassConfigurationSet(payload){
    let groupId = payload[0]
    let i = 1;
    let request = []
    while (payload.length > i) {
        let localId = payload[i]
        let size = payload[1+i]>>3 & 0x1F;
        let dataType = payload[1+i] & 0x07;
        let parameter = responseClass.getParameterByGroupIdAndLocalId(responseClass.parametersByGroupIdAndLocalId, groupId, localId)
        if (payload.slice(i).length < size){
            throw new Error(parameter.driverParameterName + " has a wrong type")
        } 
        switch(dataType){
            case 0: 
                determineDeprecatedRequest(request, parameter,groupId)
                break;
            case 1:
                responseClass.determineConfiguration(request, parameter,  parseInt(util.convertBytesToString(payload.slice(2+i,2+i+size)),16), groupId)
                break;
            case 2:
                //TO be complted
                break;
            case 3:
                responseClass.determineConfiguration(request, parameter,  payload.slice(2+i,2+i+size), groupId, size)
                break; 
            case 4:
                responseClass.determineConfiguration(request, parameter,  payload.slice(2+i,2+i+size), groupId, size)
                break; 
            default:
                throw new Error("Unknown parameter type");

        }
        i = i + size + 2
        }
        return request
}

function determineDeprecatedRequest(request, parameter, groupId) {
    let group = responseClass.determineGroupType(groupId)
    let paramName = parameter.driverParameterName
    // Find the group in the request object or create a new one if it doesn't exist
    let groupObject = request.find(g => g.group === group);
    if (!groupObject) {
        groupObject = { group: group, parameters: [] };
        request.push(groupObject);
    }

    // Add the parameter to the group's parameters array
    groupObject.parameters.push({
        parameterName: paramName,
        parameterValue: "DEPRECATED"
    });
}

function determineRequestGenericConfigurationGet(payload){
    let i = 0;
    const step = 2;
    if (payload % 2 === 0){
        throw new Error("Invalid payload")
    }
    let request = []
    while (payload.length >= step * (i + 1)) {
        let groupId = payload[i*step]
        let localId = payload[1+i*step]
        let parameter = responseClass.getParameterByGroupIdAndLocalId(responseClass.parametersByGroupIdAndLocalId, groupId, localId)
        let group = responseClass.determineGroupType(groupId)
        // Find the group in the response object or create a new one if it doesn't exist
        let groupObject = request.find(g => g.group === group);
        if (!groupObject) {
            groupObject = { group: group, parameters: [] };
            request.push(groupObject);
        }

        // Add the parameter to the group's parameters array
        groupObject.parameters.push(
            parameter.driverParameterName
        );

    i++;
    }
    return request
}

function determineRequestParameterClassConfigurationGet(payload){
    if (payload.length < 2){
        throw new Error("The payload must contain at least one local identifier");
    }
    let groupId = payload[0]
    payload = payload.slice(1)
    let i = 0;
    const step = 1;
    let parameters = [];
    while (payload.length >= step * (i + 1)) {
        let parameter = responseClass.getParameterByGroupIdAndLocalId(responseClass.parametersByGroupIdAndLocalId, groupId, payload[i*step])
        parameters.push(parameter.driverParameterName)
        i++;
    }
    return new ParameterClassConfigurationGet(responseClass.determineGroupType(groupId), parameters)
}
function encodeRequestGenericConfigurationSet (setGenericParameters, encData){
    var i = 2
    for (let [index, entry] of setGenericParameters.entries()) {
        let groupId = determineValueFromGroupType(entry.group)
        for (let param of entry.parameters) {
            let parameter = getParametersByGroupIdAndDriverParameterName(responseClass.parametersByGroupIdAndLocalId, groupId, param.parameterName)
            encData[i] = groupId
            encData[i+1] = parseInt(parameter.localId, 16);
            i = encodeSetParameter(parameter, param.parameterValue, encData, i+2)
        }
    }
    return encData
}
function encodeRequestParameterClassConfigurationSet (setParameterClass, encData){
    let groupId = determineValueFromGroupType(setParameterClass.group);
    encData[2] = groupId;
    var i = 3
    for (let param of setParameterClass.parameters) {
        let parameter = getParametersByGroupIdAndDriverParameterName(responseClass.parametersByGroupIdAndLocalId, groupId, param.parameterName);
        encData[i] = parseInt(parameter.localId, 16);
        i = encodeSetParameter(parameter, param.parameterValue, encData, i + 1);
    }
    return encData;
}
function encodeRequestGenericConfigurationGet(getGenericParameters, encData){
    var i = 2
    for (let [index,entry] of getGenericParameters.entries()) {
        let groupId = determineValueFromGroupType(entry.group)
        for (let param of entry.parameters) {
            let parameter = getParametersByGroupIdAndDriverParameterName(responseClass.parametersByGroupIdAndLocalId, groupId, param)
            encData[i] = groupId
            encData[i+1] = parseInt(parameter.localId, 16);
            i = i + 2
        }
    }
    return encData
}
function encodeRequestParameterClassConfigurationGet (getParameterClass, encData){
    let groupId = determineValueFromGroupType(getParameterClass.group);
    encData[2] = groupId;
    var i = 3
    for (let param of getParameterClass.parameters) {
        let parameter = getParametersByGroupIdAndDriverParameterName(responseClass.parametersByGroupIdAndLocalId, groupId, param);
        encData[i] = parseInt(parameter.localId, 16);
        i++
     }
    return encData;
}

/* function encodeSetParameter( parameter, paramValue, encData , i){
    let size
    let paramType = parameter.parameterType.type
    switch (paramType){ 

    case "ParameterTypeNumber":
        size = 4
        encData[i] = encodeSizeAndType(size, 1)
        let range = parameter.parameterType.range
        let multiply = parameter.parameterType.multiply
        let additionalValues = parameter.parameterType.additionalValues
        let additionalRanges = parameter.parameterType.additionalRanges
        // negative number
    
        if (util.checkParamValueRange(paramValue, range.minimum, range.maximum, range.exclusiveMinimum, range.exclusiveMaximum, additionalValues, additionalRanges)){
            if (multiply != undefined){
                paramValue = paramValue/multiply
            }
            if (paramValue < 0) {
                paramValue += 0x100000000;
            }
            encData[i+1] = (paramValue >> 24) & 0xFF;
            encData[i+2] = (paramValue >> 16) & 0xFF;
            encData[i+3] = (paramValue >> 8) & 0xFF;
            encData[i+4] = paramValue & 0xFF;
            return i + size + 1
        }
        else{

                throw new Error(parameter.driverParameterName +" parameter value is out of range");
        }
    case "ParameterTypeString":
        size = 4
        encData[i] = encodeSizeAndType(size, 1)
        if (((parameter.parameterType.possibleValues).indexOf(paramValue)) != -1)
            {
                encData[i+1] = 0;
                encData[i+2] = 0;
                encData[i+3] = 0;
                encData[i+4]  = (parameter.parameterType.firmwareValues[((parameter.parameterType.possibleValues).indexOf(paramValue))])
                return i + size + 1
            }
        else{
            
            throw new Error(parameter.driverParameterName+" parameter value is unknown");
        }
    case "ParameterTypeBitMask":
        size = 4
        encData[i] = encodeSizeAndType(size, 1)
        let flags =0 
        let properties = parameter.parameterType.properties
        let bitMap = parameter.parameterType.bitMask
        for (let bit of bitMap){
            let flagName = bit.valueFor
            let flagValue = paramValue[flagName]
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
                    if (property.range){ 
                        if (util.checkParamValueRange(flagValue, property.range.minimum, property.range.maximum, property.range.exclusiveMinimum, property.range.exclusiveMaximum, property.additionalValues, property.additionalRanges)){
                            flags |= flagValue << bit.bitShift    
                        }
                        else {
                            throw new Error("Value out of range for "+ parameter.driverParameterName+"."+flagName);
                        }
                    }
                    else{
                        flags |= flagValue << bit.bitShift  
                    }
                    break;
                case "PropertyObject":
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
                    break;
                default:
                    throw new Error("Property type is unknown");
            }
        }
        
        encData[i+1] = (flags >> 24) & 0xFF;
        encData[i+2] = (flags >> 16) & 0xFF;
        encData[i+3] = (flags >> 8) & 0xFF;
        encData[i+4] = flags & 0xFF;
        return i + size + 1 ;
        
    case "ParameterTypeAsciiString":
        size = paramValue.length
        encData[i] = encodeSizeAndType(size, 3)
        for (let j = 0; j < paramValue.length; j++)
            encData[i + j + 1] =paramValue.charCodeAt(j) & 0xFF;

        return i + size + 1 ;
    case "ParameterTypeByteArray":
        size = parameter.parameterType.size
        encData[i] = encodeSizeAndType(size, 4)
        if  (parameter.parameterType.properties == undefined){
            let paramValueHex = paramValue.toString().replace(/[{}]/g, '').replace(/,/g, ''); // Remove braces and commas
            for (let j = 0; j < size; j++) {
                encData[i + j + 1] = parseInt(paramValueHex.slice(j * 2, j * 2 + 2), 16);
            }
            return i + size + 1;
        }else{
            let arrayProperties = parameter.parameterType.properties
            let byteMask = parameter.parameterType.byteMask
            for (let j = 0; j < size; j++) {
                let flags =0 

                for (let bit of byteMask){
                    let flagName = bit.valueFor
                    let flagValue = paramValue[j][flagName]
                    if (flagValue == undefined){
                        throw new Error("byte "+ flagName +" is missing");
                    }
                    let  property = (arrayProperties.find(el => el.name === flagName))
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
                            if (property.range){ 
                                if (util.checkParamValueRange(flagValue, property.range.minimum, property.range.maximum, property.range.exclusiveMinimum, property.range.exclusiveMaximum, property.additionalValues, property.additionalRanges)){
                                    flags |= flagValue << bit.bitShift    
                                }
                                else {
                                    throw new Error("Value out of range for "+ parameter.driverParameterName+"."+flagName);
                                }
                            }
                            else{
                                flags |= flagValue << bit.bitShift  
                            }
                            break;
                        case "PropertyObject":
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
                            break;
                        default:
                            throw new Error("Property type is unknown");
                    }
                }
        
                encData[i + j + 1] = flags & 0xFF
        
        }
        return i + size + 1 ;
    }
    case "ParameterTypeByteArray":
        size = parameter.parameterType.size;
        encData[i] = encodeSizeAndType(size, 4);
    
        if (!parameter.parameterType.properties) {
            // Handle raw byte array (no properties)
            encodeRawByteArray(paramValue, size, encData, i);
            return i + size + 1;
        } else {
            // Handle byte array with properties
            encodeByteArrayWithProperties(parameter, paramValue, size, encData, i);
            return i + size + 1;
        }
            
    default:
        throw new Error("Parameter type is unknown");
        
    }
} */
// Function encode size and type for a parameter

function encodeSetParameter(parameter, paramValue, encData, i) {
    const paramType = parameter.parameterType.type;

    switch (paramType) {
        case "ParameterTypeNumber":
            return encodeNumberParameter(parameter, paramValue, encData, i);
        case "ParameterTypeString":
            return encodeStringParameter(parameter, paramValue, encData, i);
        case "ParameterTypeBitMask":
            return encodeBitMaskParameter(parameter, paramValue, encData, i);
        case "ParameterTypeAsciiString":
            return encodeAsciiStringParameter(parameter, paramValue, encData, i);
        case "ParameterTypeByteArray":
            return encodeByteArrayParameter(parameter, paramValue, encData, i);
        default:
            throw new Error("Parameter type is unknown");
    }
}

// Helper Functions

/**
 * Encodes a number parameter.
 */
function encodeNumberParameter(parameter, paramValue, encData, startIndex) {
    const size = 4;
    encData[startIndex] = encodeSizeAndType(size, 1);

    const range = parameter.parameterType.range;
    const multiply = parameter.parameterType.multiply;
    const additionalValues = parameter.parameterType.additionalValues;
    const additionalRanges = parameter.parameterType.additionalRanges;

    if (!util.checkParamValueRange(paramValue, range.minimum, range.maximum, range.exclusiveMinimum, range.exclusiveMaximum, additionalValues, additionalRanges)) {
        throw new Error(`${parameter.driverParameterName} parameter value is out of range`);
    }

    let value = paramValue;
    if (multiply !== undefined) {
        value /= multiply;
    }
    if (value < 0) {
        value += 0x100000000;
    }

    encData[startIndex + 1] = (value >> 24) & 0xFF;
    encData[startIndex + 2] = (value >> 16) & 0xFF;
    encData[startIndex + 3] = (value >> 8) & 0xFF;
    encData[startIndex + 4] = value & 0xFF;

    return startIndex + size + 1;
}

/**
 * Encodes a string parameter.
 */
function encodeStringParameter(parameter, paramValue, encData, startIndex) {
    const size = 4;
    encData[startIndex] = encodeSizeAndType(size, 1);

    const possibleValues = parameter.parameterType.possibleValues;
    const firmwareValues = parameter.parameterType.firmwareValues;

    const index = possibleValues.indexOf(paramValue);
    if (index === -1) {
        throw new Error(`${parameter.driverParameterName} parameter value is unknown`);
    }

    encData[startIndex + 1] = 0;
    encData[startIndex + 2] = 0;
    encData[startIndex + 3] = 0;
    encData[startIndex + 4] = firmwareValues[index];

    return startIndex + size + 1;
}

/**
 * Encodes a bitmask parameter.
 */
function encodeBitMaskParameter(parameter, paramValue, encData, startIndex) {
    const size = 4;
    encData[startIndex] = encodeSizeAndType(size, 1);

    const properties = parameter.parameterType.properties;
    const bitMap = parameter.parameterType.bitMask;

    let flags = 0;
    for (let bit of bitMap) {
        const flagName = bit.valueFor;
        const flagValue = paramValue[flagName];

        if (flagValue === undefined) {
            throw new Error(`Bit ${flagName} is missing`);
        }

        const property = properties.find(el => el.name === flagName);
        if (!property) {
            throw new Error(`Property ${flagName} not found`);
        }

        flags = encodeProperty(property, bit, flagValue, flags);
    }

    encData[startIndex + 1] = (flags >> 24) & 0xFF;
    encData[startIndex + 2] = (flags >> 16) & 0xFF;
    encData[startIndex + 3] = (flags >> 8) & 0xFF;
    encData[startIndex + 4] = flags & 0xFF;

    return startIndex + size + 1;
}

/**
 * Encodes an ASCII string parameter.
 */
function encodeAsciiStringParameter(parameter, paramValue, encData, startIndex) {
    const size = paramValue.length;
    encData[startIndex] = encodeSizeAndType(size, 3);

    for (let j = 0; j < paramValue.length; j++) {
        encData[startIndex + j + 1] = paramValue.charCodeAt(j) & 0xFF;
    }

    return startIndex + size + 1;
}

/**
 * Encodes a byte array parameter.
 */
function encodeByteArrayParameter(parameter, paramValue, encData, startIndex) {
    const size = parameter.parameterType.size;
    encData[startIndex] = encodeSizeAndType(size, 4);

    if (!parameter.parameterType.properties) {
        encodeRawByteArray(paramValue, size, encData, startIndex);
    } else {
        encodeByteArrayWithProperties(parameter, paramValue, size, encData, startIndex);
    }

    return startIndex + size + 1;
}

/**
 * Encodes a raw byte array (no properties).
 */
function encodeRawByteArray(paramValue, size, encData, startIndex) {
    const paramValueHex = paramValue.toString().replace(/[{}]/g, '').replace(/,/g, ''); // Remove braces and commas
    for (let j = 0; j < size; j++) {
        encData[startIndex + j + 1] = parseInt(paramValueHex.slice(j * 2, j * 2 + 2), 16);
    }
}

/**
 * Encodes a byte array with properties.
 */
function encodeByteArrayWithProperties(parameter, paramValue, size, encData, startIndex) {
    const arrayProperties = parameter.parameterType.properties;
    const byteMask = parameter.parameterType.byteMask;

    for (let j = 0; j < size; j++) {
        let flags = 0;
        flags = encodeProperties(arrayProperties, byteMask, paramValue[j], flags);
        encData[startIndex + j + 1] = flags & 0xFF;
    }
}

/**
 * Encodes properties for a single byte in the byte array.
 */
function encodeProperties(arrayProperties, byteMask, paramValue, flags) {
    for (let bit of byteMask) {
        const flagName = bit.valueFor;
        const flagValue = paramValue[flagName];

        if (flagValue === undefined) {
            throw new Error(`Byte ${flagName} is missing`);
        }

        const property = arrayProperties.find(el => el.name === flagName);
        if (!property) {
            throw new Error(`Property ${flagName} not found`);
        }

        flags = encodeProperty(property, bit, flagValue, flags);
    }
    return flags;
}

/**
 * Encodes a single property based on its type.
 */
function encodeProperty(property, bit, flagValue, flags) {
    switch (property.type) {
        case "PropertyBoolean":
            return encodeBooleanProperty(bit, flagValue, flags);
        case "PropertyString":
            return encodeStringProperty(property, bit, flagValue, flags);
        case "PropertyNumber":
            return encodeNumberProperty(property, bit, flagValue, flags);
        case "PropertyObject":
            return encodeObjectProperty(bit, flagValue, flags);
        default:
            throw new Error(`Unknown property type: ${property.type}`);
    }
}

/**
 * Encodes a boolean property.
 */
function encodeBooleanProperty(bit, flagValue, flags) {
    let value = flagValue;
    if (bit.inverted) {
        value = !value;
    }
    return flags | (Number(value) << bit.bitShift);
}

/**
 * Encodes a string property.
 */
function encodeStringProperty(property, bit, flagValue, flags) {
    const index = property.possibleValues.indexOf(flagValue);
    if (index === -1) {
        throw new Error(`${property.name} value is not among possible values`);
    }
    return flags | (property.firmwareValues[index] << bit.bitShift);
}

/**
 * Encodes a number property.
 */
function encodeNumberProperty(property, bit, flagValue, flags) {
    if (property.range) {
        if (!util.checkParamValueRange(flagValue, property.range.minimum, property.range.maximum, property.range.exclusiveMinimum, property.range.exclusiveMaximum, property.additionalValues, property.additionalRanges)) {
            throw new Error(`Value out of range for ${property.name}`);
        }
    }
    return flags | (flagValue << bit.bitShift);
}

/**
 * Encodes an object property.
 */
function encodeObjectProperty(bit, flagValue, flags) {
    for (let b of bit.values) {
        const fValue = flagValue[b.valueFor];
        if (fValue === undefined) {
            throw new Error(`Bit ${bit.valueFor}.${b.valueFor} is missing`);
        }
        let value = fValue;
        if (b.inverted) {
            value = !value;
        }
        flags |= Number(value) << b.bitShift;
    }
    return flags;
}
function encodeSizeAndType(size, type){
    return ((size << 0x03)| type)

}
// Function to get parameters by groupId and driverParameterName
function getParametersByGroupIdAndDriverParameterName(parameters, groupId, driverParameterName) {
    // Check if the parameters object contains the groupId
    if (parameters[groupId]) {
        // Iterate over each localId within the groupId
        for (let localId in parameters[groupId]) {
            // Check if the current parameter's driverParameterName matches the provided name
            if (parameters[groupId][localId].driverParameterName === driverParameterName) {
                return parameters[groupId][localId];
            }
        }
    }

    // Return null if no matching parameter is found
    return null;
}
// give the group as string 
function determineValueFromGroupType(groupType) {
    switch(groupType) {
        case responseClass.GroupType.INTERNAL:
            return 0;
        case responseClass.GroupType.SYSTEM_CORE:
            return 1;
        case responseClass.GroupType.GEOLOC:
            return 2;
        case responseClass.GroupType.GNSS:
            return 3;
        case responseClass.GroupType.LR11xx:
            return 4;
        case responseClass.GroupType.BLE_SCAN1:
            return 5;
        case responseClass.GroupType.BLE_SCAN2:
            return 6;
        case responseClass.GroupType.ACCELEROMETER:
            return 7;
        case responseClass.GroupType.NETWORK:
            return 8;
        case responseClass.GroupType.LORAWAN:
            return 9;
        case responseClass.GroupType.CELLULAR:
            return 10;
        case responseClass.GroupType.BLE:
            return 11;
        default:
            throw new Error("Unknown group type");
    }
}

module.exports = {
    RequestType: RequestType,
    encodeRequest: encodeRequest,
    decodeRequest: decodeRequest
}

/***/ }),

/***/ 792:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


let util = __webpack_require__(94);

function GnssFix(latitude,
    longitude,
    altitude,
    COG,
    SOG,
    EHPE,
    quality){
    this.latitude = latitude;
    this.longitude = longitude;
    this.altitude = altitude;
    this.COG = COG;
    this.SOG = SOG;
    this.EHPE = EHPE;
    this.quality = quality;
}

const fixQuality = Object.freeze({
    INVALID: "INVALID",
    VALID: "VALID",
    FIX_2D: "FIX_2D",
    FIX_3D: "FIX_3D",
});

function QualityInfo(fixQuality,
    numberSatelliteUsed
){
    this.fixQuality = fixQuality;
    this.numberSatelliteUsed = numberSatelliteUsed;
}

/****** decoded MT3333 GPS position *******/
/*****************************************/
function determineGnssFix (payload){
    let mt3333GnssFixInfo = new GnssFix();
    mt3333GnssFixInfo.latitude = util.twoComplement(parseInt(util.convertBytesToString(payload.slice(0,4)),16)) /  Math.pow(10, 7) 
    mt3333GnssFixInfo.longitude = util.twoComplement(parseInt(util.convertBytesToString(payload.slice(4,8)),16)) /  Math.pow(10, 7)
    mt3333GnssFixInfo.altitude = determineAltitude(payload)
    mt3333GnssFixInfo.COG = determineCourseOverGround(payload)
    mt3333GnssFixInfo.SOG = determineSpeedOverGround(payload)
    mt3333GnssFixInfo.EHPE = determineEstimatedHorizontalPositionError(payload)
    mt3333GnssFixInfo.quality = determineFixQuality(payload)
 return mt3333GnssFixInfo

}
function determineAltitude(payload){
    if (payload.length < 10)
        throw new Error("The payload is not valid to determine GPS altitude");
    return (payload[8]<<8)+payload[9];
}
function determineCourseOverGround(payload){
    if (payload.length < 12)
        throw new Error("The payload is not valid to determine GPS course over ground");
    // expressed in 1/100 degree
    return ((payload[10]<<8)+payload[11]);
}

function determineSpeedOverGround(payload){
    if (payload.length < 14)
        throw new Error("The payload is not valid to determine GPS speed over ground");
    // expressed in cm/s
    return ((payload[12]<<8)+payload[13]);
}
function determineEstimatedHorizontalPositionError(payload){
        if (payload.length < 15)
            throw new Error("The payload is not valid to determine horizontal accuracy");
        var ehpeValue = payload[14]
        if (ehpeValue > 250){
            switch (ehpeValue){
                case 251:
                    ehpeValue = "(250,500]"
                    break
                case 252:
                    ehpeValue = "(500,1000]"
                    break
                case 253:
                    ehpeValue = "(1000,2000]"
                    break;
                case 254:
                    ehpeValue = "(2000,4000]"
                    break;
                case 255:
                    ehpeValue = ">4000"
                    break;
            }
        }
       
        return ehpeValue;
    }	
    
function determineFixQuality(payload){
    let quality = payload[15]>>5 & 0x07
    let qualityInfo = new QualityInfo()
    
    switch(quality){
        case 0:
            qualityInfo.fixQuality = fixQuality.INVALID
            break
        case 1:
            qualityInfo.fixQuality = fixQuality.VALID
            break
        case 2:
            qualityInfo.fixQuality = fixQuality.FIX_2D
            break
        case 3:
            qualityInfo.fixQuality = fixQuality.FIX_3D
            break
    }
    qualityInfo.numberSatellitesUsed = payload[15] & 0x0F
    return qualityInfo
    

}

module.exports = {
    GnssFix: GnssFix,
    determineGnssFix: determineGnssFix
}

/***/ }),

/***/ 851:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

let eventClass = __webpack_require__(977)
const CommandType = Object.freeze({
    CLEAR_AND_RESET: "CLEAR_AND_RESET",
    RESET: "RESET",
    START_SOS: "START_SOS",
    STOP_SOS: "STOP_SOS",
    SYSTEM_STATUS_REQUEST: "SYSTEM_STATUS_REQUEST",
    POSITION_ON_DEMAND: "POSITION_ON_DEMAND",
    SET_GPS_ALMANAC: "SET_GPS_ALMANAC",
    SET_BEIDOU_ALMANAC: "SET_BEIDOU_ALMANAC",
    START_BLE_CONNECTIVITY: "START_BLE_CONNECTIVITY",
    STOP_BLE_CONNECTIVITY: "STOP_BLE_CONNECTIVITY",
    SYSTEM_EVENT: "SYSTEM_EVENT",
    CLEAR_MOTION_PERCENTAGE: "CLEAR_MOTION_PERCENTAGE"

});
function Command(command,classId,eventType){
    this.commandType = command;
    this.classId = classId;
    this.eventType = eventType;
}
function determineCommand(value) {
    const commands = [
        CommandType.CLEAR_AND_RESET,
        CommandType.RESET,
        CommandType.START_SOS,
        CommandType.STOP_SOS,
        CommandType.SYSTEM_STATUS_REQUEST,
        CommandType.POSITION_ON_DEMAND,
        CommandType.SET_GPS_ALMANAC,
        CommandType.SET_BEIDOU_ALMANAC,
        CommandType.START_BLE_CONNECTIVITY,
        CommandType.STOP_BLE_CONNECTIVITY,
        CommandType.SYSTEM_EVENT,
        CommandType.CLEAR_MOTION_PERCENTAGE
    ];
    return commands[value] || null; // Returns null if the command is unknown
}

function encodeCommand(data) {
    let encode = [];
    encode[0] = (0x01 << 3) | data.ackToken;

    let command = Object.values(CommandType).indexOf(data.commandType);
    if (command === -1) {
        throw new Error("Unknown command");
    }

    encode[1] = command;

    if (command === 10) { // SYSTEM_EVENT
        let classId = getClassId(data.classId);
        encode[2] = classId;
        encode[3] = data.eventType;
    }

    return encode;
}

function decodeCommand(bytes) {
    let decoded = new Command();
    let command = determineCommand(bytes[0]);

    if (!command) {
        throw new Error("Unknown command received");
    }

    decoded.commandType = command
    if (command === Command.SYSTEM_EVENT) {
        if (bytes.length < 4) {
            throw new Error("Invalid SYSTEM_EVENT byte array length");
        }
        decoded.classId = getClassName(bytes[1]);
        decoded.eventType = bytes[2];
    }
   
    return decoded;
}

// Convert classId to integer
function getClassId(className) {
    const classes = {
        [eventClass.Class.SYSTEM]: 0,
        [eventClass.Class.SOS]: 1,
        [eventClass.Class.TEMPERATURE]: 2,
        [eventClass.Class.ACCELEROMETER]: 3,
        [eventClass.Class.NETWORK]: 4,
        [eventClass.Class.GEOZONING]: 5
    };
    if (className in classes) {
        return classes[className];
    }
    throw new Error("Unknown class id");
}

//  Convert classId integer to class name
function getClassName(classId) {
    const classMap = {
        0: eventClass.Class.SYSTEM,
        1: eventClass.Class.SOS,
        2: eventClass.Class.TEMPERATURE,
        3: eventClass.Class.ACCELEROMETER,
        4: eventClass.Class.NETWORK,
        5: eventClass.Class.GEOZONING
    };
    return classMap[classId] || "UNKNOWN_CLASS";
}


module.exports = {
    Command: Command,
    decodeCommand: decodeCommand,
    encodeCommand: encodeCommand
}

/***/ }),

/***/ 925:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


let util = __webpack_require__(94);

function Accelerometer (accelerationVector, motionPercent, gaddIndex, numberShocks){

    this.accelerationVector = accelerationVector;
    this.motionPercent = motionPercent;
    this.gaddIndex = gaddIndex;
    this.numberShocks = numberShocks;
}
function determineAxis(payload, byteNumber){
    if (payload.length < (byteNumber + 2)){
        throw new Error("The payload is not valid to determine axis value");
    }
    let value = (payload[byteNumber]<<8)+payload[byteNumber+1];
    value = util.convertNegativeInt(value, 2)
    return value
}

function determineAccelerationVector(payload, xOffset, yOffset, zOffset){
    let x = determineAxis(payload, xOffset);
    let y = determineAxis(payload, yOffset);
    let z = determineAxis(payload, zOffset);
    return [x,y,z];
}
function determineGaddIndex(payload){
    if (payload.length < 11){
        throw new Error("The payload is not valid to determine GADD index");
    }
return payload[11]
}  
function determineMotion(payload){
    if (payload.length < 11){
        throw new Error("The payload is not valid to determine Motion");
    }
return payload[11]
}  
function determineNumberShocks(payload){
    if (payload.length < 12){
        throw new Error("The payload is not valid to determine number of shocks");
    }
return payload[12]
}   

const AcceleroType = Object.freeze({
    MOTION_START: "MOTION_START",
    MOTION_END: "MOTION_END",
    SHOCK: "SHOCK"
})

module.exports = {
    Accelerometer: Accelerometer,
    determineAccelerationVector: determineAccelerationVector,
    determineGaddIndex : determineGaddIndex,
    determineNumberShocks : determineNumberShocks,
    determineMotion: determineMotion, 
    AcceleroType: AcceleroType,
}

/***/ }),

/***/ 962:
/***/ ((module) => {

const messageType = Object.freeze({
    NOTIFICATION: "NOTIFICATION",
    POSITION: "POSITION",
    QUERY: "QUERY",
    RESPONSE: "RESPONSE",
    TELEMETRY: "TELEMETRY",
    UNKNOWN: "UNKNOWN"
});

function AbeewayUplinkPayload(header,
    extendedHeader,
    notification,
    position,
    query,
    response,
    telemetry,
    payload
    ) {
    this.header = header;
    this.extendedHeader = extendedHeader;
    this.notification = notification;
    this.position = position;
    this.query = query;
    this.response = response;
    this.telemetry = telemetry;
    this.telemetry = telemetry;
    this.payload = payload
}

module.exports = {
    AbeewayUplinkPayload: AbeewayUplinkPayload,
    messageType: messageType
}

/***/ }),

/***/ 977:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

let systemClass = __webpack_require__(187);
let temperatureClass = __webpack_require__ (406)
let accelerometerClass = __webpack_require__(925)
let networkClass = __webpack_require__(142)
let geozoningClass = __webpack_require__(548)
let telemetryClass = __webpack_require__(343)

const Class = Object.freeze({
    SYSTEM: "SYSTEM",
    SOS: "SOS",
    TEMPERATURE: "TEMPERATURE",
    ACCELEROMETER: "ACCELEROMETER",
    NETWORK: "NETWORK",
    GEOZONING: "GEOZONING",
    TELEMETRY: "TELEMETRY"
})

const SosType = Object.freeze({
    SOS_ON: "SOS_ON",
    SOS_OFF: "SOS_OFF"
})



function Notification(notificationClass,
    notificationType,
    system,
    sos,
    temperature,
    accelerometer,
    network,
    geozoning,
    telemetryMeasurements){
    this.notificationClass = notificationClass;
    this.notificationType = notificationType;
    this.system = system;
    this.sos = sos;
    this.temperature = temperature;
    this.accelerometer = accelerometer;
    this.network = network;
    this.geozoning = geozoning;
    this.telemetryMeasurements = telemetryMeasurements;
}

function decodeCrc(payload) {
    // Ensure the payload has enough bytes for the CRC
    if (payload.length < startingByte + byteNumber) {
        throw new Error("Payload is too short to contain a valid CRC.");
    }

    // Extract the n bytes of the CRC (big-endian)
    const crcBytes = payload.slice(startingByte, startingByte + byteNumber);
    // Convert each byte to a 2-digit hexadecimal string and concatenate
    const crc = crcBytes.map(b => b.toString(16).padStart(2, "0")).join("");
    return crc;
}
function determineNotification(payload){
    if (payload.length < 5)
        throw new Error("The payload is not valid to determine notification message");
    let notificationMessage = new Notification();
    let classValue = payload[4]>>4 & 0x0F;
    let typeValue = payload[4] & 0x0F;
    switch(classValue){
        case 0:
            notificationMessage.notificationClass = Class.SYSTEM;
            switch (typeValue){
                case 0:
                    notificationMessage.notificationType = systemClass.SystemType.STATUS
                    notificationMessage.system = new systemClass.System(systemClass.determineStatus(payload),null, null, null, null);
                    break;
                case 1:
                    notificationMessage.notificationType = systemClass.SystemType.LOW_BATTERY
                    notificationMessage.system = new systemClass.System( null, systemClass.determineLowBattery(payload), null, null);
                    break;
                case 2:
                    notificationMessage.notificationType = systemClass.SystemType.BLE_STATUS;
                    notificationMessage.system = new systemClass.System( null, null, systemClass.determineBleStatus(payload), null, null);
                    break;
                case 3:
                    notificationMessage.notificationType = systemClass.SystemType.TAMPER_DETECTION;
                    notificationMessage.system = new systemClass.System( null, null, null, systemClass.determineTamperDetection(payload),null);
                    break;
                case 4:
                    notificationMessage.notificationType = systemClass.SystemType.HEARTBEAT;
                    notificationMessage.system = new systemClass.System(null, null, null, null, systemClass.determineHeartbeat(payload))
                    break;
                default:
                    throw new Error("System Notification Type Unknown");
            }
            break;
        case 1:
            notificationMessage.notificationClass = Class.SOS
            switch (typeValue){
                case 0:
                    notificationMessage.notificationType = SosType.SOS_ON
                    break;
                case 1:
                    notificationMessage.notificationType = SosType.SOS_OFF
                    break;
                default:
                    throw new Error("SOS Notification Type Unknown");
            }
            break;
        case 2:
            notificationMessage.notificationClass = Class.TEMPERATURE
            switch (typeValue){
                case 0:
                    notificationMessage.notificationType = temperatureClass.TempType.TEMP_HIGH
                    notificationMessage.temperature = temperatureClass.determineTemperature(payload);
                    break;
                case 1:
                    notificationMessage.notificationType = temperatureClass.TempType.TEMP_LOW
                    notificationMessage.temperature = temperatureClass.determineTemperature(payload);
                    break;
                case 2:
                    notificationMessage.notificationType = temperatureClass.TempType.TEMP_NORMAL
                    notificationMessage.temperature = temperatureClass.determineTemperature(payload);
                    break;
                default:
                    throw new Error("Temperature Notification Type Unknown");
            }
            break;
        case 3:
            notificationMessage.notificationClass = Class.ACCELEROMETER
            switch (typeValue){
                case 0: 
                    notificationMessage.notificationType = accelerometerClass.AcceleroType.MOTION_START
                    break;
                case 1:
                    notificationMessage.notificationType = accelerometerClass.AcceleroType.MOTION_END
                    notificationMessage.accelerometer = new accelerometerClass.Accelerometer(accelerometerClass.determineAccelerationVector(payload,5, 7, 9), accelerometerClass.determineMotion(payload), null, null)
                    break;
                case 2:
                    notificationMessage.notificationType = accelerometerClass.AcceleroType.SHOCK
                    notificationMessage.accelerometer = new accelerometerClass.Accelerometer(accelerometerClass.determineAccelerationVector(payload, 5, 7, 9), null, accelerometerClass.determineGaddIndex(payload), accelerometerClass.determineNumberShocks(payload))
                    break;
                default:
                    throw new Error("Accelerometer Notification Type Unknown");
            }
            break;
        case 4:
            notificationMessage.notificationClass = Class.NETWORK
            switch (typeValue){
                case 0: 
                    notificationMessage.notificationType = networkClass.NetworkType.MAIN_UP
                    notificationMessage.network = networkClass.determineNetworkInfo(payload)
                    break;
                case 1:
                    notificationMessage.notificationType = networkClass.NetworkType.BACKUP_UP
                    notificationMessage.network = networkClass.determineNetworkInfo(payload)
                    break;
                default:
                    throw new Error("Network Notification Type Unknown");
            }
            break;
        case 5:
            notificationMessage.notificationClass = Class.GEOZONING
            switch (typeValue){
                case 0: 
                    notificationMessage.notificationType = geozoningClass.GeozoningType.ENTRY;
                    break;
                case 1:
                    notificationMessage.notificationType = geozoningClass.GeozoningType.EXIT;
                    break;
                case 2:
                    notificationMessage.notificationType = geozoningClass.GeozoningType.IN_HAZARD;
                    break;
                case 3:
                    notificationMessage.notificationType = geozoningClass.GeozoningType.OUT_HAZARD;
                    break;
                case 4:
                    notificationMessage.notificationType = geozoningClass.GeozoningType.MEETING_POINT;
                    break;
                default:
                    throw new Error("Geozoning Notification Type Unknown");
            }

            break;
        case 6:
            notificationMessage.notificationClass = Class.TELEMETRY
            switch (typeValue){
                case 0: 
                    notificationMessage.notificationType = telemetryClass.TelemetryType.TELEMETRY;
                    notificationMessage.telemetryMeasurements = telemetryClass.determineTelemetryMeasurements(payload.slice(5));
                    break;
                case 1:
                    notificationMessage.notificationType = telemetryClass.TelemetryType.TELEMETRY_MODE_BATCH;
                    break;
                default:
                    throw new Error("Telemetry Notification Type Unknown");
            }

            break;
        default:
            throw new Error("Notification Class Unknown");
    }
    return notificationMessage;


}


module.exports = {
    Notification: Notification,
    determineNotification: determineNotification,
    Class : Class
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