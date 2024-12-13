/**
 *__   _____  ____ ___ ___ ___  
 *\ \ / / _ \| __ )_ _|_ _/ _ \ 
 * \ V / | | |  _ \| | | | | | |
 * | || |_| | |_) | | | | |_| |
 * |_| \___/|____/___|___\__\_\
 *                              
 *
 * @brief This YOBIIQ JS payload decoder/encoder follows the LoRa Alliance Payload Codec API specs (TS013-1.0.0). 
 * 
 * @compatibility TTN, TTI, LORIOT, ThingPark, ChirpStack v3/v4 and any LNS that follows LoRa Alliance API specs.
 * 
 * @author      Fostin Kpodar <f.kpodar@yobiiq.com>
 * @version     2.0.0
 * @copyright   YOBIIQ B.V. | https://www.yobiiq.com
 * 
 * @release     2024-01-11
 * @update      2024-12-11
 * 
 * @product     P1002003 iQ RM200 (iQ Digital Controller)
 * 
 * @firmware    RM200 firmware version >= 2.1
 * 
 */

// Version Control
var VERSION_CONTROL = {
    CODEC : {VERSION: "2.0.0", NAME: "codecVersion"},
    DEVICE: {MODEL : "RM200", NAME: "genericModel"},
    PRODUCT: {CODE : "P1002003", NAME: "productCode"},
    MANUFACTURER: {COMPANY : "YOBIIQ B.V.", NAME: "manufacturer"},
};

var UPLINK = {
    // generic data
    GENERIC_DATA : {
        CHANNEL    : 255, // 0xFF
        FPORT_MIN  : 50,
        FPORT_MAX  : 99,
    },
    // device data
    DEVICE_DATA : {
        CHANNEL   : 1,   // 0x01
        FPORT_MIN : 1,
        FPORT_MAX : 5,
    },
    // alarm data
    ALARM_DATA : {
        CHANNEL  : 170, // 0xAA
        FPORT    : 11,
    },
    // parameter data
    PARAMTER_DATA : {
        CHANNEL  : 255, // 0xFF
        FPORT    : 100,
    },
    // general
    MAC : {
        FPORT : 0,
        MSG: "MAC COMMAND RECEIVED",
    },
    OPTIONAL_KEYS : { // in DEVICE_GENERIC_REGISTERS or in DEVICE_SPECIFIC_REGISTERS
        RESOLUTION: "RESOLUTION",
        VALUES: "VALUES",
        SIGNED: "SIGNED",
        DIGIT: "DIGIT",
        UNIT: "UNIT",
    },
    COMMON_REGISTERS: {
        "0xFE" : {SIZE: 4, NAME : "timestamp"},
        "0x01" : {SIZE: 4, NAME : "dataloggerTimestamp"},
    },
    DOWNLINK : {
        SUCCESS : "DOWNLINK COMMAND SUCCEEDED",
        FAILURE : "DOWNLINK COMMAND FAILED"
    },
    ERRORS : {
        CHANNEL: "Unknown channel ",
        TYPE: "Unknown type ",
        FPORT_INCORRECT: "Incorrect fPort",
    },
    WARNING_NAME   : "warning",
    ERROR_NAME     : "error",
    INFO_NAME      : "info",
};

var DEVICE_GENERIC_REGISTERS = {
    "0x64" : {SIZE : 1, NAME : "deviceStatus",
        VALUES : { "0x00" : "NORMAL MODE", "0x01" : "BUTTON MODE",},
    },
    "0x65" : {SIZE : 0, NAME : "manufacturer"}, // size to be determinated
    "0x66" : {SIZE : 0, NAME : "originalEquipmentManufacturer"},  // size to be determinated
    "0x67" : {SIZE : 0, NAME : "deviceModel"},  // size to be determinated
    "0x68" : {SIZE : 4, NAME : "deviceSerialNumber"},
    "0x69" : {SIZE : 2, NAME : "firmwareVersion", DIGIT: false},
    "0x6A" : {SIZE : 2, NAME : "hardwareVersion", DIGIT: false},
    "0x6B" : {SIZE : 1, NAME : "externalPowerStatus",
        VALUES : { "0x00" : "AC POWER OFF", "0x01" : "AC POWER ON",},
    },
    "0x6C" : {SIZE : 1, NAME : "batteryVoltage", RESOLUTION: 0.1},
    "0x6D" : {SIZE : 1, NAME : "batteryPercentage"},
    "0x78" : {SIZE: 1, NAME : "internalCircuitTemperatureAlarm", 
        VALUES: {"0x00" : "NORMAL", "0x01" : "ALARM",}
    },
    "0x79" : {SIZE: 4, NAME : "internalCircuitTemperatureNumberOfAlarms",},
    "0x7A" : {SIZE: 2, NAME : "internalCircuitTemperature", RESOLUTION: 0.01, SIGNED: true},
    "0x7B" : {SIZE: 1, NAME : "internalCircuitHumidity",},
    "0x82" : {SIZE: 2, NAME : "ambientTemperature", RESOLUTION: 0.01, SIGNED: true},
    "0x83" : {SIZE: 1, NAME : "ambientHumidity",},
    "0x96" : {SIZE : 1, NAME : "joinStatus",
        VALUES : { "0x00" : "OFFLINE", "0x01" : "ONLINE",},
    },
    "0x9D" : {SIZE: 1, NAME : "applicationPort",},
    "0x9E" : {SIZE: 1, NAME : "joinType",
        VALUES : { "0x01" : "OTAA",},
    },
    "0x9F" : {SIZE : 1, NAME : "deviceClass",
        VALUES : { "0x00" : "CLASS A", "0x01" : "CLASS B", "0x02" : "CLASS C",},
    },
    "0xA0" : {SIZE: 1, NAME: "adr", 
        VALUES: {"0x00" : "DISABLED", "0x01" : "ENABLED",}
    },
    "0xA1" : {SIZE: 1, NAME: "sf", 
        VALUES: { "0x00" : "SF12BW125", "0x01" : "SF11BW125", "0x02" : "SF10BW125",
            "0x03" : "SF9BW125", "0x04" : "SF8BW125", "0x05" : "SF7BW125", "0x06" : "SF7BW250",}
    },
    "0xA3" : {SIZE: 1, NAME: "radioMode", SIZE: 1, 
        VALUES: { "0x00" : "LoRaWAN", "0x01" : "iQ D2D", "0x02" : "LoRaWAN & iQ D2D",}
    },
    "0xA4" : {SIZE: 1, NAME: "numberOfJoinAttempts"},
    "0xA5" : {SIZE: 2, NAME: "linkCheckTimeframe",},
    "0xA6" : {SIZE: 1, NAME: "dataRetransmission", 
        VALUES: { "0x00" : "DISABLED", "0x01" : "ENABLED",}
    },
    "0xA7" : {SIZE: 1, NAME: "lorawanWatchdogAlarm", 
        VALUES: { "0x00" : "NORMAL", "0x01" : "ALARM",}
    },
};

var DEVICE_SPECIFIC_REGISTERS = {
    "0x1A" : {SIZE: 1, NAME : "channel1State", 
        VALUES: { "0x00": "OFF", "0x01": "ON",}
    },
    "0x1B" : {SIZE: 1, NAME : "channel1Control", 
        VALUES: { "0x00": "OFF", "0x01": "ON",}
    },
    "0x1C" : {SIZE: 4, NAME : "channel1Counter",},
    "0x1D" : {SIZE: 1, NAME : "channel1DefaultState",
        VALUES: {"0x00": "OFF", "0x01": "ON", "0x02": "RETAIN"}
    },
    "0x1E" : {SIZE: 1, NAME : "channel1WatchdogState",
        VALUES: {"0x00": "OFF", "0x01": "ON", "0x02": "RETAIN"}
    },
    "0x1F" : {SIZE: 1, NAME : "channel1ButtonOverrideFunction",
        VALUES: {"0x00" : "DISABLED", "0x01" : "ENABLED",}
    },
    "0x10" : {SIZE: 1, NAME : "channel1ButtonOverrideStatus",
        VALUES: {"0x00" : "NORMAL MODE", "0x01" : "MANUAL ON", "0x02" : "MANUAL OFF",}
    },
    "0x2A" : {SIZE: 1, NAME : "channel2State", 
        VALUES: { "0x00": "OFF", "0x01": "ON",}
    },
    "0x2B" : {SIZE: 1, NAME : "channel2Control", 
        VALUES: { "0x00": "OFF", "0x01": "ON",}
    },
    "0x2C" : {SIZE: 4, NAME : "channel2Counter",},
    "0x2D" : {SIZE: 1, NAME : "channel2DefaultState",
        VALUES: {"0x00": "OFF", "0x01": "ON", "0x02": "RETAIN"}
    },
    "0x2E" : {SIZE: 1, NAME : "channel2WatchdogState",
        VALUES: {"0x00": "OFF", "0x01": "ON", "0x02": "RETAIN"}
    },
    "0x2F" : {SIZE: 1, NAME : "channel2ButtonOverrideFunction",
        VALUES: {"0x00" : "DISABLED", "0x01" : "ENABLED",}
    },
    "0x20" : {SIZE: 1, NAME : "channel2ButtonOverrideStatus",
        VALUES: {"0x00" : "NORMAL MODE", "0x01" : "MANUAL ON", "0x02" : "MANUAL OFF",}
    },
};


function decodeGenericData(bytes)
{
    var decoded = {};
    var index = 0;
    var channel = 0;
    var type = "";
    while(index < bytes.length)
    {
        var reg = {};
        channel = bytes[index];
        index = index + 1;
        // Channel checking
        if(channel != UPLINK.GENERIC_DATA.CHANNEL){
            channel = "0x" + byteToEvenHEX(channel);
            index = " at index " + (index - 1);
            decoded[UPLINK.ERROR_NAME] = UPLINK.ERRORS.CHANNEL + channel + index;
            return decoded;
        }
        // Type of generic register
        type = "0x" + byteToEvenHEX(bytes[index]);
        index = index + 1;
        if(!(type in DEVICE_GENERIC_REGISTERS)){
            index = " at index " + (index - 1);
            decoded[UPLINK.ERROR_NAME] = UPLINK.ERRORS.TYPE + type + index;
            return decoded;
        }
        reg = DEVICE_GENERIC_REGISTERS[type];
        // Decoding
        reg.CHANNEL = channel;
        reg.TYPE = type;
        reg.INDEX = index;
        reg = decodeRegister(bytes, reg);
        decoded[reg.NAME] = reg.DATA;
        index = index + reg.DATA_SIZE;
    }
    return decoded;
}

function decodeDeviceData(bytes)
{
    var decoded = {};
    var index = 0;
    var channel = 0;
    var type = "";
    var reg = {};
    while(index < bytes.length)
    {
        channel = bytes[index];
        index = index + 1;
        // Channel checking
        if(channel != UPLINK.DEVICE_DATA.CHANNEL){
            channel = "0x" + byteToEvenHEX(channel);
            index = " at index " + (index - 1);
            decoded[UPLINK.ERROR_NAME] = UPLINK.ERRORS.CHANNEL + channel + index;
            return decoded;
        }
        // Type of register
        type = "0x" + byteToEvenHEX(bytes[index]);
        index = index + 1;
        if(!(type in DEVICE_SPECIFIC_REGISTERS)){
            if(!(type in DEVICE_GENERIC_REGISTERS)){
                if(!(type in UPLINK.COMMON_REGISTERS)){
                    index = " at index " + (index - 1);
                    decoded[UPLINK.ERROR_NAME] = UPLINK.ERRORS.TYPE + type + index;
                    return decoded;
                }
                reg = UPLINK.COMMON_REGISTERS[type];
            }else{
                reg = DEVICE_GENERIC_REGISTERS[type];
            }
        }else{
            reg = DEVICE_SPECIFIC_REGISTERS[type];
        }
        // Decoding
        reg.CHANNEL = channel;
        reg.TYPE = type;
        reg.INDEX = index;
        reg = decodeRegister(bytes, reg);
        decoded[reg.NAME] = reg.DATA;
        index = index + reg.DATA_SIZE;
    }
    return decoded;
}

function decodeAlarmData(bytes)
{
    var decoded = {};
    var index = 0;
    var channel = 0;
    var type = "";
    var reg = {};
    while(index < bytes.length)
    {
        channel = bytes[index];
        index = index + 1;
        // Channel checking
        if(channel != UPLINK.ALARM_DATA.CHANNEL){
            channel = "0x" + byteToEvenHEX(channel);
            index = " at index " + (index - 1);
            decoded[UPLINK.ERROR_NAME] = UPLINK.ERRORS.CHANNEL + channel + index;
            return decoded;
        }
        // Type of register
        type = "0x" + byteToEvenHEX(bytes[index]);
        index = index + 1;
        if(!(type in DEVICE_SPECIFIC_REGISTERS)){
            if(!(type in DEVICE_GENERIC_REGISTERS)){
                if(!(type in UPLINK.COMMON_REGISTERS)){
                    index = " at index " + (index - 1);
                    decoded[UPLINK.ERROR_NAME] = UPLINK.ERRORS.TYPE + type + index;
                    return decoded;
                }
                reg = UPLINK.COMMON_REGISTERS[type];
            }else{
                reg = DEVICE_GENERIC_REGISTERS[type];
            }
        }else{
            reg = DEVICE_SPECIFIC_REGISTERS[type];
        }
        // Decoding
        reg.CHANNEL = channel;
        reg.TYPE = type;
        reg.INDEX = index;
        reg = decodeRegister(bytes, reg);
        decoded[reg.NAME] = reg.DATA;
        index = index + reg.DATA_SIZE;
    }
    return decoded;
}

function decodeParameterData(bytes)
{
    var decoded = {};
    var index = 0;
    var channel = 0;
    var type = "";
    var reg = {};
    while(index < bytes.length)
    {
        channel = bytes[index];
        index = index + 1;
        // Channel checking
        if(channel != UPLINK.PARAMTER_DATA.CHANNEL){
            channel = "0x" + byteToEvenHEX(channel);
            index = " at index " + (index - 1);
            decoded[UPLINK.ERROR_NAME] = UPLINK.ERRORS.CHANNEL + channel + index;
            return decoded;
        }
        // Type of register
        type = "0x" + byteToEvenHEX(bytes[index]);
        index = index + 1;
        if(!(type in DEVICE_SPECIFIC_REGISTERS)){
            if(!(type in DEVICE_GENERIC_REGISTERS)){
                index = " at index " + (index - 1);
                decoded[UPLINK.ERROR_NAME] = UPLINK.ERRORS.TYPE + type + index;
                return decoded;
            }
            reg = DEVICE_GENERIC_REGISTERS[type];
        }else{
            reg = DEVICE_SPECIFIC_REGISTERS[type];
        }
        // Decoding
        reg.CHANNEL = channel;
        reg.TYPE = type;
        reg.INDEX = index;
        reg = decodeRegister(bytes, reg);
        decoded[reg.NAME] = reg.DATA;
        index = index + reg.DATA_SIZE;
    }
    return decoded;
}

/**  Helper functions  **/

function decodeRegister(bytes, reg)
{
    var data = 0;
    reg.DATA_SIZE = reg.SIZE;
    if(UPLINK.OPTIONAL_KEYS.DIGIT in reg)
    {
        if(reg.DIGIT == false){
            // Decode into "V" + DIGIT STRING + "." DIGIT STRING format
            data = getDigitStringArrayNoFormat(bytes, reg.INDEX, reg.DATA_SIZE);
            data = "V" + data[0] + "." + data[1];
        }else{
            // Decode into DIGIT STRING format
            data = getDigitStringArrayEvenFormat(bytes, reg.INDEX, reg.DATA_SIZE);
            data = data.toString().toUpperCase();
        }
        reg.DATA = data;
        return reg;
    }
    if(reg.VALUES){
        // Decode into HEX byte (VALUES specified in reg.VALUES)
        data = "0x" + byteToEvenHEX(bytes[reg.INDEX]);
        data = reg.VALUES[data];
        reg.DATA = data;
        return reg;
    }
    if(reg.DATA_SIZE == 0)
    {
        reg.DATA_SIZE = getSizeBasedOnChannel(bytes, reg.INDEX, reg.CHANNEL);
        // Decode into STRING format
        data = getStringFromBytesBigEndianFormat(bytes, reg.INDEX, reg.DATA_SIZE);
        reg.DATA = data;
        return reg;
    }
    // Decode into DECIMAL format
    data = getValueFromBytesBigEndianFormat(bytes, reg.INDEX, reg.DATA_SIZE);
    if(reg.SIGNED){
        data = getSignedIntegerFromInteger(data, reg.DATA_SIZE);
    }
    if(reg.RESOLUTION){
        data = data * reg.RESOLUTION;
        data = parseFloat(data.toFixed(2));
    }
    reg.DATA = data;
    return reg;
}

function getStringFromBytesBigEndianFormat(bytes, index, size)
{
    var value = "";
    for(var i=0; i<size; i=i+1)
    {
        value = value + String.fromCharCode(bytes[index+i]);
    }
    return value;
}

function getStringFromBytesLittleEndianFormat(bytes, index, size)
{
    var value = "";
    for(var i=(size - 1); i>=0; i=i-1)
    {
        value = value + String.fromCharCode(bytes[index+i]);
    }
    return value;
}

function getValueFromBytesBigEndianFormat(bytes, index, size)
{
    var value = 0;
    for(var i=0; i<(size-1); i=i+1)
    {
        value = (value | bytes[index+i]) << 8; 
    }
    value = value | bytes[index+size-1];
    return (value >>> 0); // to unsigned
}

function getValueFromBytesLittleEndianFormat(bytes, index, size)
{
    var value = 0;
    for(var i=(size-1); i>0; i=i-1)
    {
        value = (value | bytes[index+i]) << 8; 
    }
    value = value | bytes[index];
    return (value >>> 0); // to unsigned
}

function getDigitStringArrayNoFormat(bytes, index, size)
{
  var hexString = []
  for(var i=0; i<size; i=i+1)
  {
    hexString.push(bytes[index+i].toString(16));
  }
  return hexString;
}

function getDigitStringArrayEvenFormat(bytes, index, size)
{
  var hexString = []
  for(var i=0; i<size; i=i+1)
  {
    hexString.push(bytes[index+i].toString(16));
  }
  return hexString.map(toEvenHEX);
}

function toEvenHEX(hex)
{
  if(hex.length == 1)
  {
    return "0"+hex;
  }
  return hex;
}

function byteToEvenHEX(byte)
{
    return toEvenHEX(byte.toString(16).toUpperCase());
}

function getSizeBasedOnChannel(bytes, index, channel)
{
    var size = 0;
    while(index + size < bytes.length && bytes[index + size] != channel)
    {
        size = size + 1;
    }
    return size;
}

function getSignedIntegerFromInteger(integer, size) 
{
    var signMask = 1 << (size * 8 - 1);
    var dataMask = (1 << (size * 8 - 1)) - 1;
    if(integer & signMask) 
    {
        return -(~integer & dataMask) - 1;
    }else 
    {
        return integer & dataMask;
    }
}

/************************************************************************************************************/

// Decode decodes an array of bytes into an object. (ChirpStack v3)
//  - fPort contains the LoRaWAN fPort number
//  - bytes is an array of bytes, e.g. [225, 230, 255, 0]
//  - variables contains the device variables e.g. {"calibration": "3.5"} (both the key / value are of type string)
// The function must return an object, e.g. {"temperature": 22.5}
function Decode(fPort, bytes, variables) 
{
    var decoded = {};
    if(fPort == 0){
        decoded = {mac: UPLINK.MAC.MSG, fPort: fPort};
    }else if(bytes.length == 1){
        if(bytes[0] == 0){
            decoded[UPLINK.INFO_NAME] = UPLINK.DOWNLINK.SUCCESS;
        }else if(bytes[0] == 1){
            decoded[UPLINK.WARNING_NAME] = UPLINK.DOWNLINK.FAILURE;
        } 
    }else if(fPort >= UPLINK.GENERIC_DATA.FPORT_MIN && fPort <= UPLINK.GENERIC_DATA.FPORT_MAX){
        decoded = decodeGenericData(bytes);
    }else if(fPort >= UPLINK.DEVICE_DATA.FPORT_MIN && fPort <= UPLINK.DEVICE_DATA.FPORT_MAX){
        decoded = decodeDeviceData(bytes);
    }else if(fPort == UPLINK.ALARM_DATA.FPORT){
        decoded = decodeAlarmData(bytes);
    }else if(fPort == UPLINK.PARAMTER_DATA.FPORT){
        decoded = decodeParameterData(bytes);
    }else{
        decoded.fPort = fPort;
        decoded[UPLINK.ERROR_NAME] = UPLINK.ERRORS.FPORT_INCORRECT;
    }
    decoded[VERSION_CONTROL.CODEC.NAME] = VERSION_CONTROL.CODEC.VERSION;
    decoded[VERSION_CONTROL.DEVICE.NAME] = VERSION_CONTROL.DEVICE.MODEL;
    decoded[VERSION_CONTROL.PRODUCT.NAME] = VERSION_CONTROL.PRODUCT.CODE;
    decoded[VERSION_CONTROL.MANUFACTURER.NAME] = VERSION_CONTROL.MANUFACTURER.COMPANY;
    return decoded;
}

// Decode uplink function. (ChirpStack v4, TTN, TTI, LORIOT, ThingPark)
//
// Input is an object with the following fields:
// - bytes = Byte array containing the uplink payload, e.g. [255, 230, 255, 0]
// - fPort = Uplink fPort.
// - variables = Object containing the configured device variables.
//
// Output must be an object with the following fields:
// - data = Object representing the decoded payload.
function decodeUplink(input) {
    var errors = [];
    var warnings = [];
    var decoded = Decode(input.fPort, input.bytes, input.variables);
    if(UPLINK.ERROR_NAME in decoded){
        errors.push(decoded[UPLINK.ERROR_NAME]);
    }
    if(UPLINK.WARNING_NAME in decoded){
        warnings.push(decoded[UPLINK.WARNING_NAME]);
    }
    return {
        data: decoded,
        errors: errors,
        warnings: warnings
    };
}

/*************************************************************************************************************/
// Constants for device downlink 
var DEVICE = {

    DOWNLINK : {
        TYPE    : "Type",
        CONFIG  : "Config",
        PERIODIC: "Periodic",
        READING : "Reading"
    },
    CONFIG : {
        FPORT: 50,
        CHANNEL : 255, // 0xFF
        REG_MIN_NUMBER : 1,  // downlink min number of registers
        REG_MAX_NUMBER : 10, // downlink max number of registers
    },
    PERIODIC : {
        FPORT_MIN: 1,
        FPORT_MAX: 5,
        CHANNEL : 255, // 0xFF
        INTERVAL_TYPE : 20, // 0x14
        MODE_TYPE : 21, // 0x15
        STATUS_TYPE : 22, // 0x16
        REGISTERS_TYPE : 23, // 0x17
        REG_MIN_NUMBER : 1,  // downlink min number of registers
        REG_MAX_NUMBER : 10, // downlink max number of registers
    },
    READING: {
        FPORT: 100,
        CHANNEL : 255, // 0xFF
        TYPE : 204, // 0xCC
        REG_MIN_NUMBER : 1,  // downlink min number of registers
        REG_MAX_NUMBER : 10, // downlink max number of registers
    },

    REGISTERS : {
        /* device registers */
        // SIZE, MIN and MAX are required if the register is writable (RW permission is "W" or "RW")
        // "registerName": {TYPE: <address>, RW: <"R"/"W"/"RW">, SIZE: <size>, MIN: <min>, MAX: <max> }

        /* generic registers */
        "deviceStatus": {TYPE: 100, /* 0x64 */ RW:"R",},
        "manufacturer": {TYPE: 101, /* 0x65 */ RW:"R",},
        "originalEquipmentManufacturer": {TYPE: 102, /* 0x66 */ RW:"R",},
        "deviceModel": {TYPE: 103, /* 0x67 */ RW:"R",},
        "deviceSerialNumber": {TYPE: 104, /* 0x68 */ RW:"R",},
        "firmwareVersion": {TYPE: 105, /* 0x69 */ RW:"R",},
        "hardwareVersion": {TYPE: 106, /* 0x6A */ RW:"R",},
        "externalPowerStatus": {TYPE: 107, /* 0x6B */ RW:"R",},
        "batteryVoltage": {TYPE: 108, /* 0x6C */ RW:"R",},
        "batteryPercentage": {TYPE: 109, /* 0x6D */ RW:"R",},
        "rebootDevice": {TYPE: 111, /* 0x6F */ SIZE: 1, MIN: 1, MAX: 1, RW:"WRITE_ONLY",},
        "internalCircuitTemperatureAlarm": {TYPE: 120, /* 0x78 */ RW:"R",},
        "internalCircuitTemperatureNumberOfAlarms": {TYPE: 121, /* 0x79 */ RW:"R",},
        "internalCircuitTemperature": {TYPE: 122, /* 0x7A */ RW:"R",},
        "internalCircuitHumidity": {TYPE: 123, /* 0x7B */ RW:"R",},
        "ambientTemperature": {TYPE: 130, /* 0x82 */ RW:"R",},
        "ambientHumidity": {TYPE: 131, /* 0x83 */ RW:"R",},
        "joinStatus": {TYPE: 150, /* 0x96 */ RW:"R",},
        "applicationPort": {TYPE: 157, /* 0x9D */ SIZE: 1, MIN: 50, MAX: 99, RW:"RW",},
        "joinType": {TYPE: 158, /* 0x9E */ RW:"RW",},
        "deviceClass": {TYPE: 159, /* 0x9F */ RW:"RW",},
        "adr": {TYPE: 160, /* 0xA0 */ SIZE: 1, MIN: 0, MAX: 1, RW:"RW",},
        "sf": {TYPE: 161, /* 0xA1 */ SIZE: 1, MIN: 0, MAX: 6, RW:"RW",},
        "restartLoRaWAN": {TYPE: 162, /* 0xA2 */ SIZE: 1, MIN: 1, MAX: 1, RW:"W",},
        "radioMode": {TYPE: 163, /* 0xA3 */ SIZE: 1, MIN: 0, MAX: 2, RW:"RW",},
        "numberOfJoinAttempts": {TYPE: 164, /* 0xA4 */ SIZE: 1, MIN: 0, MAX: 255, RW:"RW",},
        "linkCheckTimeframe": {TYPE: 164, /* 0xA5 */ SIZE: 2, MIN: 1, MAX: 65535, RW:"RW",},
        "dataRetransmission": {TYPE: 165, /* 0xA6 */ SIZE: 1, MIN: 0, MAX: 1, RW:"RW",},
        "lorawanWatchdogAlarm": {TYPE: 166, /* 0xA7 */ SIZE: 1, MIN: 0, MAX: 1, RW:"R",},

        /* specific registers */
        "channel1State": {TYPE: 26, /* 0x1A */ RW:"R",},
        "channel1Control": {TYPE: 27, /* 0x1B */ SIZE: 1, MIN: 0, MAX: 1, RW:"RW",},
        "channel1Counter": {TYPE: 28, /* 0x1C */ RW:"R",},
        "channel1DefaultState": {TYPE: 29, /* 0x1D */ SIZE: 1, MIN: 0, MAX: 2, RW:"RW",},
        "channel1WatchdogState": {TYPE: 30, /* 0x1E */ SIZE: 1, MIN: 0, MAX: 2, RW:"RW",},
        "channel1ButtonOverrideFunction": {TYPE: 31, /* 0x1F */ SIZE: 1, MIN: 0, MAX: 1, RW:"RW",},
        "channel1ButtonOverrideStatus": {TYPE: 16, /* 0x10 */ RW:"R",},
        "channel1ButtonOverrideReset": {TYPE: 17, /* 0x11 */ SIZE: 1, MIN: 1, MAX: 1, RW:"W",},
        "channel2State": {TYPE: 42, /* 0x2A */ RW:"R",},
        "channel2Control": {TYPE: 43, /* 0x2B */ SIZE: 1, MIN: 0, MAX: 1, RW:"RW",},
        "channel2Counter": {TYPE: 44, /* 0x2C */ RW:"R",},
        "channel2DefaultState": {TYPE: 45, /* 0x2D */ SIZE: 1, MIN: 0, MAX: 2, RW:"RW",},
        "channel2WatchdogState": {TYPE: 46, /* 0x2E */ SIZE: 1, MIN: 0, MAX: 2, RW:"RW",},
        "channel2ButtonOverrideFunction": {TYPE: 47, /* 0x2F */ SIZE: 1, MIN: 0, MAX: 1, RW:"RW",},
        "channel2ButtonOverrideStatus": {TYPE: 32, /* 0x20 */ RW:"R",},
        "channel2ButtonOverrideReset": {TYPE: 33, /* 0x21 */ SIZE: 1, MIN: 1, MAX: 1, RW:"W",},
    },
    ERRORS : {
        CMD_INVALID: "Invalid command",
        CMD_REGISTER_NOT_FOUND: "Register not found in the device registers",
        CMD_REGISTER_NOT_WRITABLE: "Register not writable",
        CMD_REGISTER_NOT_READABLE: "Register not readable",
        CMD_REGISTER_NUMBER_INVALID: "Invalid number of registers",
        CMD_DATA_INVALID: "Invalid data in the command",
        CMD_FPORT_INVALID: "Invalid fPort in the command",
    },
    WARNING_NAME   : "warning",
    ERROR_NAME     : "error",
    INFO_NAME      : "info",
};

/************************************************************************************************************/

// Encode encodes the given object into an array of bytes. (ChirpStack v3)
//  - fPort contains the LoRaWAN fPort number
//  - obj is an object, e.g. {"temperature": 22.5}
//  - variables contains the device variables e.g. {"calibration": "3.5"} (both the key / value are of type string)
// The function must return an array of bytes, e.g. [225, 230, 255, 0]
function Encode(fPort, obj, variables) {
    if(!(DEVICE.DOWNLINK.TYPE in obj)){
        DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_INVALID + 
            ": please add " + DEVICE.DOWNLINK.TYPE + " to the command";
        return []; // error
    }
    if(obj[DEVICE.DOWNLINK.TYPE] == DEVICE.DOWNLINK.CONFIG){
        if(fPort != DEVICE.CONFIG.FPORT){
            DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_FPORT_INVALID;
            return []; // error
        }
        return encodeDeviceConfiguration(obj[DEVICE.DOWNLINK.CONFIG]);
    }else if(obj[DEVICE.DOWNLINK.TYPE] == DEVICE.DOWNLINK.PERIODIC){
        if(fPort < DEVICE.PERIODIC.FPORT_MIN || fPort > DEVICE.PERIODIC.FPORT_MAX){
            DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_FPORT_INVALID;
            return []; // error
        }
        return encodeUplinkConfiguration(obj[DEVICE.DOWNLINK.PERIODIC]);
    }else if(obj[DEVICE.DOWNLINK.TYPE] == DEVICE.DOWNLINK.READING){
        if(fPort != DEVICE.READING.FPORT){
            DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_FPORT_INVALID;
            return []; // error
        }
        return encodeParameterReading(obj[DEVICE.DOWNLINK.READING]);
    }
    DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_INVALID + 
        ": please check " + obj[DEVICE.DOWNLINK.TYPE] + " in the command";
    return []; // error
}

// Encode downlink function. (ChirpStack v4 , TTN, TTI, LORIOT, ThingPark)
//
// Input is an object with the following fields:
// - data = Object representing the payload that must be encoded.
// - variables = Object containing the configured device variables.
//
// Output must be an object with the following fields:
// - bytes = Byte array containing the downlink payload.
function encodeDownlink(input) {
    var fPort = DEVICE.CONFIG.FPORT; // by default use config fPort (50)
    if(input.data.fPort)
    {
        fPort = input.data.fPort;
    }
    var errors = [];
    var warnings = [];
    var encoded = Encode(fPort, input.data, input.variables);
    if(DEVICE.ERROR_NAME in DEVICE)
    {
        errors.push(DEVICE[DEVICE.ERROR_NAME]);
    }
    if(DEVICE.WARNING_NAME in DEVICE)
    {
        warnings.push(DEVICE[DEVICE.WARNING_NAME]);
    }
    return {
        bytes: encoded,
        fPort: fPort,
        errors: errors,
        warnings : warnings
    };
}


/************************************************************************************************************/


function encodeDeviceConfiguration(cmdArray)
{
    var encoded = [];
    var reg = {};
    var regName = "";

    if(!(cmdArray)){
        DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_INVALID + 
            ": please add " + DEVICE.DOWNLINK.CONFIG + " array to the command";
        return []; // error
    }
    if(cmdArray.length < DEVICE.CONFIG.REG_MIN_NUMBER ||
        cmdArray.length > DEVICE.CONFIG.REG_MAX_NUMBER){
        DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_REGISTER_NUMBER_INVALID + 
            ": please check " + DEVICE.DOWNLINK.CONFIG + " in the command";
        return [];
    }
    
    for(var i=0; i<cmdArray.length; i=i+1)
    {
        var cmdObj = cmdArray[i];
        if(!("Param" in cmdObj) || !("Value" in cmdObj)){
            DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_INVALID + 
            ": please add Param and Value to each object in the " + 
            DEVICE.DOWNLINK.CONFIG + " array of the command";
            return []; // error
        }
        regName = cmdObj.Param;
        if(!(regName in DEVICE.REGISTERS)){
            DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_REGISTER_NOT_FOUND + 
                ": please check " + regName + " in the command";
            return []; // error
        }
        reg = DEVICE.REGISTERS[regName];
        if(reg.RW == "R"){
            DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_REGISTER_NOT_WRITABLE +
                ": please check " + regName + " in the command";
            return [];  // error
        }
        if(cmdObj.Value < reg.MIN || cmdObj.Value > reg.MAX){
            DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_DATA_INVALID +
                ": please check " + regName + " in the command";
            return []; // error
        }
        encoded.push(DEVICE.CONFIG.CHANNEL);
        encoded.push(reg.TYPE);
        if(reg.SIZE == 2){
            encoded.push((cmdObj.Value >> 8) & 255);
            encoded.push(cmdObj.Value & 255);
        }else{
            encoded.push(cmdObj.Value);
        }
    }
    return encoded;
}

function encodeUplinkConfiguration(cmdObj)
{
    var encoded = [];
    var reg = {};
    var regName = "";

    if(!(cmdObj)){
        DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_INVALID + 
            ": please add " + DEVICE.DOWNLINK.PERIODIC + " object to the command";
        return []; // error
    }
    if(!("UplinkInterval" in cmdObj) ||  !("Mode" in cmdObj) ||
        !("Status" in cmdObj) || !("Registers" in cmdObj)){
        DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_INVALID;
        return []; // error
    }
    // Encode UplinkInterval, Mode, Status
    if(cmdObj.UplinkInterval < 0 || cmdObj.UplinkInterval > 65535){
        DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_DATA_INVALID +
        ": please check UplinkInterval in the command";
        return []; // error
    }
    encoded.push(DEVICE.PERIODIC.CHANNEL);
    encoded.push(DEVICE.PERIODIC.INTERVAL_TYPE);
    encoded.push((cmdObj.UplinkInterval >> 8) & 255);
    encoded.push(cmdObj.UplinkInterval & 255);

    if(cmdObj.Mode < 0 || cmdObj.Mode > 1){
        DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_DATA_INVALID +
            ": please check Mode in the command";
        return []; // error
    }
    encoded.push(DEVICE.PERIODIC.CHANNEL);
    encoded.push(DEVICE.PERIODIC.MODE_TYPE);
    encoded.push(cmdObj.Mode);
    
    if(cmdObj.Status < 0 || cmdObj.Status > 1){
        DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_DATA_INVALID +
            ": please check Status in the command";
        return []; // error
    }
    encoded.push(DEVICE.PERIODIC.CHANNEL);
    encoded.push(DEVICE.PERIODIC.STATUS_TYPE);
    encoded.push(cmdObj.Status);
    // Encode registers
    if(cmdObj.Registers.length < DEVICE.PERIODIC.REG_MIN_NUMBER || 
        cmdObj.Registers.length > DEVICE.PERIODIC.REG_MAX_NUMBER){
        DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_REGISTER_NUMBER_INVALID +
            ": please check Registers in the command";
        return [];  // Error
    }
    encoded.push(DEVICE.PERIODIC.CHANNEL);
    encoded.push(DEVICE.PERIODIC.REGISTERS_TYPE);
    for(var i=0; i<cmdObj.Registers.length; i=i+1)
    {
        regName = cmdObj.Registers[i];
        if(!(regName in DEVICE.REGISTERS)){
            DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_REGISTER_NOT_FOUND + 
                ": please check " + regName + " in the command";
            return []; // error (registers not supported)
        }
        reg = DEVICE.REGISTERS[regName];
        if(reg.RW == "W"){
            DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_REGISTER_NOT_READABLE +
                ": please check " + regName + " in the command";
            return [];  // error
        }
        encoded.push(reg.TYPE);
    }
    return encoded;
}

function encodeParameterReading(cmdArray)
{
    var encoded = [];
    var reg = {};
    var regName = "";
    if(!(cmdArray)){
        DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_INVALID + 
            ": please add " + DEVICE.DOWNLINK.READING + " array to the command";
        return []; // error
    }
    if(cmdArray.length < DEVICE.READING.REG_MIN_NUMBER ||
        cmdArray.length > DEVICE.READING.REG_MAX_NUMBER){
        DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_REGISTER_NUMBER_INVALID +
            ": please check " + DEVICE.DOWNLINK.READING + " in the command";
        return []; // error
    }
    encoded.push(DEVICE.READING.CHANNEL);
    encoded.push(DEVICE.READING.TYPE);
    for(var i=0; i<cmdArray.length; i=i+1)
    {
        regName = cmdArray[i];
        if(!(regName in DEVICE.REGISTERS)){
            DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_REGISTER_NOT_FOUND +
                ": please check " + regName + " in the command";
            return []; // error
        }
        reg = DEVICE.REGISTERS[regName];
        if(reg.RW == "W"){
            DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_REGISTER_NOT_READABLE +
                ": please check " + regName + " in the command";
            return [];  // error
        }
        encoded.push(reg.TYPE);
    }
    return encoded;
}


