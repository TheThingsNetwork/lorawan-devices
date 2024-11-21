
// Version Control
var VERSION_CONTROL = {
    CODEC : {VERSION: "1.0.0", NAME: "codecVersion"},
    DEVICE: {MODEL : "RM200", NAME: "genericModel"},
    PRODUCT: {CODE : "P1002003", NAME: "productCode"},
    MANUFACTURER: {COMPANY : "YOBIIQ B.V.", NAME: "manufacturer"},
}

// Configuration constants for device basic info
var CONFIG_INFO = {
    FPORT    : 50,
    CHANNEL  : parseInt("0xFF", 16),
    TYPES    : {
        "0x05" : {SIZE : 2, NAME : "hardwareVersion", DIGIT: false},
        "0x04" : {SIZE : 2, NAME : "firmwareVersion", DIGIT: false},
        "0x03" : {SIZE : 4, NAME : "deviceSerialNumber"},
        "0x01" : {SIZE : 0, NAME : "manufacturer"}, // size to be determinated
        "0x02" : {SIZE : 0, NAME : "deviceModel"},  // size to be determinated
        "0x07" : {SIZE : 1, NAME : "batteryPercentage"},
        "0x08" : {SIZE : 1, NAME : "batteryVoltage", RESOLUTION: 0.1},
        "0x11" : {SIZE : 1, NAME : "deviceClass",
            VALUES     : {
                "0x00" : "Class A",
                "0x01" : "Class B",
                "0x02" : "Class C",
            },
        },
        "0x06" : {SIZE : 1, NAME : "powerEvent",
            VALUES     : {
                "0x00" : "AC Power Off",
                "0x01" : "AC Power On",
            },
        }
    },
    WARNING_NAME   : "warning",
    ERROR_NAME     : "error",
    INFO_NAME      : "info"
}

var RELAY = {
    OFF: 0x00,
    ON: 0x01,
    RETAIN: 0x02,
    OFF_NAME: "OFF",
    ON_NAME: "ON",
    RETAIN_NAME: "RETAIN",
    CHANNEL_1_STATE_NAME: "channel1State",
    CHANNEL_2_STATE_NAME: "channel2State",
}

var CHANNEL_STATES = {
    "0x00" : {state:RELAY.OFF_NAME, reason:"by downlink or auto"},
    "0x01" : {state:RELAY.ON_NAME,  reason:"by downlink or auto"},
    "0x02" : {state:RELAY.OFF_NAME, reason:"by button"},
    "0x03" : {state:RELAY.ON_NAME,  reason:"by button"},
};

// Configuration constants for device periodic data
 var CONFIG_PERIODIC = {
    CHANNEL  : parseInt("0xDD", 16),
    FPORT_MIN : 1,
    FPORT_MAX : 5,
    TYPES : {
        "0xFE" : {SIZE: 4, TYPE: "U32", NAME : "timestamp"},
        "0xFD" : {SIZE: 4, TYPE: "U32", NAME : "dataloggerTimestamp"},
        "0x12" : {SIZE: 1, NAME: "adr", VALUES: {"0x00" : "disabled", "0x01" : "enabled",}},
        "0x13" : {SIZE: 1, NAME: "sf", SIZE: 1, VALUES: {
                "0x00" : "SF12BW125",
                "0x01" : "SF11BW125",
                "0x02" : "SF10BW125",
                "0x03" : "SF9BW125",
                "0x04" : "SF8BW125",
                "0x05" : "SF7BW125",
                "0x06" : "SF7BW250",
            }
        },
        "0x14" : {SIZE: 1, NAME : "lorawanWatchdogFunction", VALUES: {"0x00" : "disabled", "0x01" : "enabled",},},
        "0x15" : {SIZE: 2, NAME : "lorawanWatchdogTimeout",},
        "0x16" : {SIZE: 1, NAME : "lorawanWatchdogAlarm", VALUES: {"0x00" : "normal", "0x01" : "alarm",},},
        "0x64" : {SIZE: 1, NAME : "defaultState", VALUES: {"0x00":RELAY.OFF_NAME, "0x01":RELAY.ON_NAME, "0x02":RELAY.RETAIN_NAME}},
        "0x65" : {SIZE: 1, NAME : "timeoutState", VALUES: {"0x00":RELAY.OFF_NAME, "0x01":RELAY.ON_NAME, "0x02":RELAY.RETAIN_NAME}},
        "0x66" : {SIZE: 1, NAME : "buttonOverrideFunction", VALUES: {"0x00" : "disabled", "0x01" : "enabled",}},
        "0x67" : {SIZE: 1, NAME : "deviceOperationMode", VALUES: {"0x00" : "normal", "0x01" : "override",}},
        "0x69" : {SIZE: 1, NAME : "internalCircuitTemperatureAlarm", VALUES: {"0x00" : "normal", "0x01" : "alarm",}},
        "0x70" : {SIZE: 4, NAME : "internalCircuitTemperatureNumberOfAlarms",},
        "0x71" : {SIZE: 2, NAME : "internalCircuitTemperature", RESOLUTION: 0.01, SIGNED: true},
        "0x72" : {SIZE: 1, NAME : "internalCircuitHumidity",},
        "0x95" : {SIZE: 1, NAME : "channel1State", VALUES: CHANNEL_STATES},
        "0x96" : {SIZE: 1, NAME : "channel1Control", VALUES: {"0x00":RELAY.OFF_NAME, "0x01":RELAY.ON_NAME,}},
        "0x97" : {SIZE: 4, NAME : "channel1Counter",},
        "0x98" : {SIZE: 1, NAME : "channel2State", VALUES: CHANNEL_STATES},
        "0x99" : {SIZE: 1, NAME : "channel2Control", VALUES: {"0x00":RELAY.OFF_NAME, "0x01":RELAY.ON_NAME,}},
        "0x9A" : {SIZE: 4, NAME : "channel2Counter",},
    },
    WARNING_NAME   : "warning",
    ERROR_NAME     : "error",
    INFO_NAME      : "info"
}

// Configuration constants for alarm packet
var CONFIG_ALARM = {
    FPORT : 11,
    CHANNEL : parseInt("0xAA", 16),
    TYPES : {
        "0xFE" : {SIZE: 4, NAME : "timestamp"},
        "0x00" : {SIZE: 1, NAME : "internalTemperatureAlarm",
            VALUES     : {
                "0x00" : "normal",
                "0x01" : "alarm",
            },
        },
        "0x01" : {SIZE: 1, NAME : "channel1State",
            VALUES     : CHANNEL_STATES,
        },
        "0x02" : {SIZE: 1, NAME : "channel2State",
            VALUES     : CHANNEL_STATES,
        },
        "0x03" : {SIZE: 1, NAME : "lorawanWatchdogAlarm",
            VALUES     : {
                "0x00" : "normal",
                "0x01" : "alarm",
            },
        },
        "0x97" : {SIZE: 4, NAME : "channel1Counter",},
        "0x9A" : {SIZE: 4, NAME : "channel2Counter",},
    },
    WARNING_NAME   : "warning",
    ERROR_NAME     : "error",
    INFO_NAME      : "info"
}

// Configuration constants for parameters reading
var CONFIG_PARAMETER = {
    FPORT : 100,
    CHANNEL : parseInt("0xFF", 16),
    TYPES : {
        "0x12" : {SIZE: 1, NAME: "adr", VALUES: {"0x00" : "disabled", "0x01" : "enabled",}},
        "0x13" : {SIZE: 1, NAME: "sf", SIZE: 1, VALUES: {
                "0x00" : "SF12BW125",
                "0x01" : "SF11BW125",
                "0x02" : "SF10BW125",
                "0x03" : "SF9BW125",
                "0x04" : "SF8BW125",
                "0x05" : "SF7BW125",
                "0x06" : "SF7BW250",
            }
        },
        "0x14" : {SIZE: 1, NAME : "lorawanWatchdogFunction", VALUES: {"0x00" : "disabled", "0x01" : "enabled",},},
        "0x15" : {SIZE: 2, NAME : "lorawanWatchdogTimeout",},
        "0x16" : {SIZE: 1, NAME : "lorawanWatchdogAlarm", VALUES: {"0x00" : "normal", "0x01" : "alarm",},},
        "0x64" : {SIZE: 1, NAME : "defaultState", VALUES: {"0x00":RELAY.OFF_NAME, "0x01":RELAY.ON_NAME, "0x02":RELAY.RETAIN_NAME}},
        "0x65" : {SIZE: 1, NAME : "timeoutState", VALUES: {"0x00":RELAY.OFF_NAME, "0x01":RELAY.ON_NAME, "0x02":RELAY.RETAIN_NAME}},
        "0x66" : {SIZE: 1, NAME : "buttonOverrideFunction", VALUES: {"0x00" : "disabled", "0x01" : "enabled",}},
        "0x67" : {SIZE: 1, NAME : "deviceOperationMode", VALUES: {"0x00" : "normal", "0x01" : "override",}},
        "0x69" : {SIZE: 1, NAME : "internalCircuitTemperatureAlarm", VALUES: {"0x00" : "normal", "0x01" : "alarm",}},
        "0x70" : {SIZE: 4, NAME : "internalCircuitTemperatureNumberOfAlarms",},
        "0x71" : {SIZE: 2, NAME : "internalCircuitTemperature", RESOLUTION: 0.01, SIGNED: true},
        "0x72" : {SIZE: 1, NAME : "internalCircuitHumidity",},
        "0x95" : {SIZE: 1, NAME : "channel1State", VALUES: CHANNEL_STATES},
        "0x96" : {SIZE: 1, NAME : "channel1Control", VALUES: {"0x00":RELAY.OFF_NAME, "0x01":RELAY.ON_NAME,}},
        "0x97" : {SIZE: 4, NAME : "channel1Counter",},
        "0x98" : {SIZE: 1, NAME : "channel2State", VALUES: CHANNEL_STATES},
        "0x99" : {SIZE: 1, NAME : "channel2Control", VALUES: {"0x00":RELAY.OFF_NAME, "0x01":RELAY.ON_NAME,}},
        "0x9A" : {SIZE: 4, NAME : "channel2Counter",},
    },
    WARNING_NAME   : "warning",
    ERROR_NAME     : "error",
    INFO_NAME      : "info"

}

function decodeBasicInformation(bytes)
{
    var LENGTH = bytes.length;
    var decoded = {};
    var index = 0;
    var channel = 0;
    var type = "";
    var size = 0;
    if(LENGTH == 1)
    {
        if(bytes[0] == 0)
        {
            decoded[CONFIG_INFO.INFO_NAME] = "Downlink command succeeded";

        } else if(bytes[0] == 1)
        {
            decoded[CONFIG_INFO.WARNING_NAME] = "Downlink command failed";
        }
        return decoded;
    }
    try
    {
        while(index < LENGTH)
        {
            channel = bytes[index];
            index = index + 1;
            // Channel checking
            if(channel != CONFIG_INFO.CHANNEL)
            {
                continue;
            }
            // Type of basic information
            type = "0x" + toEvenHEX(bytes[index].toString(16).toUpperCase());
            index = index + 1;
            var info = CONFIG_INFO.TYPES[type];
            size = info.SIZE;
            // Decoding
            var value = 0;
            if(info.DIGIT || info.DIGIT == false)
            {
                if(info.DIGIT == false)
                {
                    // Decode into "V" + DIGIT STRING + "." DIGIT STRING format
                    value = getDigitStringArrayNoFormat(bytes, index, size);
                    value = "V" + value[0] + "." + value[1];
                }else
                {
                    // Decode into DIGIT STRING format
                    value = getDigitStringArrayEvenFormat(bytes, index, size);
                    value = value.toString().toUpperCase();
                }

            }
            else if(info.VALUES)
            {
                // Decode into STRING (VALUES specified in CONFIG_INFO)
                value = "0x" + toEvenHEX(bytes[index].toString(16).toUpperCase());
                value = info.VALUES[value];
            }else
            {
                if(size == 0)
                {
                    size = getSizeBasedOnChannel(bytes, index, channel);
                    // Decode into STRING format
                    value = getStringFromBytesBigEndianFormat(bytes, index, size);
                    
                }else
                {
                    // Decode into DECIMAL format
                    value = getValueFromBytesBigEndianFormat(bytes, index, size);
                }
            }
            if(info.RESOLUTION)
            {
                value = value * info.RESOLUTION;
                value = parseFloat(value.toFixed(2));
            }
            decoded[info.NAME] = value;
            index = index + size;
        }
    }catch(error)
    {
        decoded[CONFIG_INFO.ERROR_NAME] = error.message;
    }

    return decoded;
}

function decodeDeviceData(bytes)
{
    var LENGTH = bytes.length;
    var decoded = {};
    var index = 0;
    var channel = 0;
    var type = "";
    var size = 0;
    if(LENGTH == 1)
    {
        if(bytes[0] == 0)
        {
            decoded[CONFIG_PERIODIC.INFO_NAME] = "Downlink command succeeded";

        } else if(bytes[0] == 1)
        {
            decoded[CONFIG_PERIODIC.WARNING_NAME] = "Downlink command failed";
        }
        return decoded;
    }
    try
    {
        while(index < LENGTH)
        {
            channel = bytes[index];
            index = index + 1;
            // Channel checking
            if(channel != CONFIG_PERIODIC.CHANNEL)
            {
                continue;
            }
            // Type of basic information
            type = "0x" + toEvenHEX(bytes[index].toString(16).toUpperCase());
            index = index + 1;
            var info = CONFIG_PERIODIC.TYPES[type] ? CONFIG_PERIODIC.TYPES[type] : null;
            if(info == null)
            {
                continue;
            }
            size = info.SIZE ? info.SIZE : 0;
            if(size == 0)
            {
                continue;
            }
            var value = getValueFromBytesBigEndianFormat(bytes, index, size);
            if(info.SIGNED)
            {
                value = getSignedIntegerFromInteger(value, size);
            }
            if(info.VALUES)
            {
                value = "0x" + toEvenHEX(value.toString(16).toUpperCase());
                value = info.VALUES[value];
            }
            if(info.RESOLUTION)
            {
                value = value * info.RESOLUTION;
                value = parseFloat(value.toFixed(2));
            }
            decoded[info.NAME] = value;
            index = index + size;
        }
    }catch(error)
    {
        decoded[CONFIG_PERIODIC.ERROR_NAME] = error.message;
    }

    return decoded;
}

function decodeAlarmPacket(bytes)
{
    var LENGTH = bytes.length;
    var decoded = {};
    var index = 0;
    var channel = 0;
    var type = "";
    var size = 0;
    if(LENGTH == 1)
    {
        if(bytes[0] == 0)
        {
            decoded[CONFIG_ALARM.INFO_NAME] = "Downlink command succeeded";

        } else if(bytes[0] == 1)
        {
            decoded[CONFIG_ALARM.WARNING_NAME] = "Downlink command failed";
        }
        return decoded;
    }
    try
    {
        while(index < LENGTH)
        {
            channel = bytes[index];
            index = index + 1;
            // Channel checking
            if(channel != CONFIG_ALARM.CHANNEL)
            {
                continue;
            }
            // Type of alarm
            type = "0x" + toEvenHEX(bytes[index].toString(16).toUpperCase());
            index = index + 1;
            var info = CONFIG_ALARM.TYPES[type] ? CONFIG_ALARM.TYPES[type] : null;
            if(info == null)
            {
                continue;
            }
            size = info.SIZE ? info.SIZE : 0;
            if(size == 0)
            {
                continue;
            }
            // Decoding
            var value = getValueFromBytesBigEndianFormat(bytes, index, size);
            if(info.VALUES)
            {
                value = "0x" + toEvenHEX(value.toString(16).toUpperCase());
                value = info.VALUES[value];
            }
            decoded[info.NAME] = value;
            index = index + size;
        }
    }catch(error)
    {
        decoded[CONFIG_ALARM.ERROR_NAME] = error.message;
    }

    return decoded;
}

function decodeParameters(bytes)
{
    var LENGTH = bytes.length;
    var decoded = {};
    var index = 0;
    var channel = 0;
    var type = "";
    var size = 0;
    if(LENGTH == 1)
    {
        if(bytes[0] == 0)
        {
            decoded[CONFIG_PARAMETER.INFO_NAME] = "Downlink command succeeded";

        } else if(bytes[0] == 1)
        {
            decoded[CONFIG_PARAMETER.WARNING_NAME] = "Downlink command failed";
        }
        return decoded;
    }
    try
    {
        while(index < LENGTH)
        {
            channel = bytes[index];
            index = index + 1;
            // Channel checking
            if(channel != CONFIG_PARAMETER.CHANNEL)
            {
                continue;
            }
            // Type of parameter
            type = "0x" + toEvenHEX(bytes[index].toString(16).toUpperCase());
            index = index + 1;
            var info = CONFIG_PARAMETER.TYPES[type] ? CONFIG_PARAMETER.TYPES[type] : null;
            if(info == null)
            {
                continue;
            }
            size = info.SIZE ? info.SIZE : 0;
            if(size == 0)
            {
                continue;
            }
            // Decoding
            var value = getValueFromBytesBigEndianFormat(bytes, index, size);
            if(info.SIGNED)
            {
                value = getSignedIntegerFromInteger(value, size);
            }
            if(info.VALUES)
            {
                value = "0x" + toEvenHEX(value.toString(16).toUpperCase());
                value = info.VALUES[value];
            }
            if(info.RESOLUTION)
            {
                value = value * info.RESOLUTION;
                value = parseFloat(value.toFixed(2));
            }
            decoded[info.NAME] = value;
            index = index + size;
        }
    }catch(error)
    {
        decoded[CONFIG_PARAMETER.ERROR_NAME] = error.message;
    }

    return decoded;
}

/**  Helper functions  **/

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
    if(fPort == 0)
    {
        decoded = {mac: "MAC command received", fPort: fPort};
    }else if(fPort == CONFIG_INFO.FPORT)
    {
        decoded = decodeBasicInformation(bytes);
    }else if(fPort >= CONFIG_PERIODIC.FPORT_MIN && fPort <= CONFIG_PERIODIC.FPORT_MAX)
    {
        decoded = decodeDeviceData(bytes);
    }else if(fPort == CONFIG_ALARM.FPORT)
    {
        decoded = decodeAlarmPacket(bytes);
    }else if(fPort == CONFIG_PARAMETER.FPORT)
    {
        decoded = decodeParameters(bytes);
    }else
    {
        decoded = {error: "Incorrect fPort", fPort : fPort};
    }
    decoded[VERSION_CONTROL.CODEC.NAME] = VERSION_CONTROL.CODEC.VERSION;
    decoded[VERSION_CONTROL.DEVICE.NAME] = VERSION_CONTROL.DEVICE.MODEL;
    decoded[VERSION_CONTROL.PRODUCT.NAME] = VERSION_CONTROL.PRODUCT.CODE;
    decoded[VERSION_CONTROL.MANUFACTURER.NAME] = VERSION_CONTROL.MANUFACTURER.COMPANY;
    return decoded;
}

// Decode uplink function. (ChirpStack v4 , TTN)
//
// Input is an object with the following fields:
// - bytes = Byte array containing the uplink payload, e.g. [255, 230, 255, 0]
// - fPort = Uplink fPort.
// - variables = Object containing the configured device variables.
//
// Output must be an object with the following fields:
// - data = Object representing the decoded payload.
function decodeUplink(input) {
    return {
        data: Decode(input.fPort, input.bytes, input.variables)
    };
}

/************************************************************************************************************/

// Encode encodes the given object into an array of bytes. (ChirpStack v3)
//  - fPort contains the LoRaWAN fPort number
//  - obj is an object, e.g. {"temperature": 22.5}
//  - variables contains the device variables e.g. {"calibration": "3.5"} (both the key / value are of type string)
// The function must return an array of bytes, e.g. [225, 230, 255, 0]
function Encode(fPort, obj, variables) {
    try
    {
        if(obj[CONFIG_DOWNLINK.TYPE] == CONFIG_DOWNLINK.CONFIG)
        {
            return encodeDeviceConfiguration(obj[CONFIG_DOWNLINK.CONFIG], variables);
        }
        else if(obj[CONFIG_DOWNLINK.TYPE] == CONFIG_DOWNLINK.PERIODIC)
        {
            return encodeUplinkConfiguration(obj[CONFIG_DOWNLINK.PERIODIC], variables);
        }
        else if(obj[CONFIG_DOWNLINK.TYPE] == CONFIG_DOWNLINK.READING)
        {
            return encodeParamtersReading(obj[CONFIG_DOWNLINK.READING], variables);
        }
    }catch(error)
    {

    }
    return [];
}

// Encode downlink function. (ChirpStack v4 , TTN)
//
// Input is an object with the following fields:
// - data = Object representing the payload that must be encoded.
// - variables = Object containing the configured device variables.
//
// Output must be an object with the following fields:
// - bytes = Byte array containing the downlink payload.
function encodeDownlink(input) {
    return {
        bytes: Encode(null, input.data, input.variables)
    };
}


/************************************************************************************************************/

// Constants for downlink type
var CONFIG_DOWNLINK = {
    TYPE    : "Type",
    CONFIG  : "Config",
    PERIODIC: "Periodic",
    READING : "Reading"
}

// Constants for device configuration 
var CONFIG_DEVICE = {
    FPORT : 50,
    REGISTER_CHANNEL : parseInt("0xFF", 16),
    PERIODIC_CHANNEL : parseInt("0xFF", 16),
    READING_TYPE : parseInt("0xCC", 16),
    DATA_MAX_SIZE : 10,
    REGISTERS : {
        "rebootDevice": {TYPE: parseInt("0x0A", 16), SIZE: 1, MIN: 1, MAX: 1, RIGHT:"WRITE_ONLY",},
        "restart": {TYPE: parseInt("0x0B", 16), SIZE: 1, MIN: 1, MAX: 1, RIGHT:"WRITE_ONLY",},
        "adr": {TYPE: parseInt("0x12", 16), SIZE: 1, MIN: 0, MAX: 1,},
        "sf": {TYPE: parseInt("0x13", 16), SIZE: 1, MIN: 0, MAX: 6,},
        "lorawanWatchdogFunction": {TYPE: parseInt("0x14", 16), SIZE: 1, MIN: 0, MAX: 1,},
        "lorawanWatchdogTimeout": {TYPE : parseInt("0x15", 16), SIZE: 2, MIN: 1, MAX: 65535,},
        "lorawanWatchdogAlarm": {TYPE: parseInt("0x16", 16), RIGHT:"READ_ONLY"},
        "defaultState": {TYPE: parseInt("0x64", 16), SIZE: 1, MIN: 0, MAX: 2,},
        "timeoutState": {TYPE: parseInt("0x65", 16), SIZE: 1, MIN: 0, MAX: 2,},
        "buttonOverrideFunction": {TYPE: parseInt("0x66", 16), SIZE: 1, MIN: 0, MAX: 1,},
        "deviceOperationMode": {TYPE: parseInt("0x67", 16), RIGHT:"READ_ONLY"},
        "buttonOverrideReset": {TYPE: parseInt("0x68", 16), SIZE: 1, MIN: 1, MAX: 1, RIGHT:"WRITE_ONLY",},
        "internalCircuitTemperatureAlarm": {TYPE: parseInt("0x69", 16), RIGHT:"READ_ONLY"},
        "internalCircuitTemperatureNumberOfAlarms": {TYPE: parseInt("0x70", 16), RIGHT:"READ_ONLY"},
        "internalCircuitTemperature": {TYPE: parseInt("0x71", 16), RIGHT:"READ_ONLY"},
        "internalCircuitHumidity": {TYPE: parseInt("0x72", 16), RIGHT:"READ_ONLY"},
        "channel1State": {TYPE: parseInt("0x95", 16), RIGHT:"READ_ONLY",},
        "channel1Control": {TYPE: parseInt("0x96", 16), SIZE: 1, MIN: 0, MAX: 1,},
        "channel1Counter": {TYPE: parseInt("0x97", 16), RIGHT:"READ_ONLY",},
        "channel2State": {TYPE: parseInt("0x98", 16), RIGHT:"READ_ONLY",},
        "channel2Control": {TYPE: parseInt("0x99", 16), SIZE: 1, MIN: 0, MAX: 1,},
        "channel2Counter": {TYPE: parseInt("0x9A", 16), RIGHT:"READ_ONLY",},
    }
}

function encodeDeviceConfiguration(obj, variables)
{
    var encoded = [];
    var index = 0;
    var config = {};
    var param = "";
    var value = 0;
    try
    {
        for(var i=0; i<obj.length; i=i+1)
        {
            param = obj[i]["Param"];
            value = obj[i]["Value"];
            var config = CONFIG_DEVICE.REGISTERS[param];
            if(config.RIGHT && config.RIGHT === "READ_ONLY")
            {
                return [];  // error
            }        
            if(value >= config.MIN && value <= config.MAX)
            {
                encoded[index] = CONFIG_DEVICE.REGISTER_CHANNEL;
                index = index + 1;
                encoded[index] = config.TYPE;
                index = index + 1;
                if(config.SIZE == 2)
                {
                    value = parseInt(value.toFixed(0));
                    encoded[index] = (value >> 8) & 0xFF;
                    index = index + 1;
                    encoded[index] = value & 0xFF;
                    index = index + 1;
                }else
                {
                    encoded[index] = value;
                    index = index + 1;
                }
            }else
            {
                // Error
                return [];
            }
        }
    }catch(error)
    {
        // Error
        return [];
    }
    return encoded;
}

function encodeUplinkConfiguration(obj, variables)
{
    var encoded = []
    var index = 0;
    var firstType = parseInt("0x14", 16);
    var field = ["UplinkInterval", "Mode", "Status", "Registers"];
    var fieldIndex = 0;
    var isFieldPresent = false;
    var value = 0;
    var registers = [];
    var register = "";
    try 
    {
        // Encode UplinkInterval, Mode, Status
        for(fieldIndex=0; fieldIndex<3; fieldIndex=fieldIndex+1)
        {
            isFieldPresent = false;
            if(field[fieldIndex] in obj)
            {
                isFieldPresent = true;
            }
            if(!isFieldPresent)
            {
                return [];  // error
            }
            value = obj[field[fieldIndex]];
            if((fieldIndex < 1 && value >= 1 && value <= 255) || 
                (fieldIndex >= 1 && value >= 0 && value <= 1))
            {
                encoded[index] = CONFIG_DEVICE.PERIODIC_CHANNEL;
                index = index + 1;
                encoded[index] = firstType + fieldIndex;
                index = index + 1;
                encoded[index] = value;
                index = index + 1;
            }else
            {
                // Error
                return [];
            }
        }
        // Encode registers
        isFieldPresent = false;
        if(field[fieldIndex] in obj)
        {
            isFieldPresent = true;
        }
        if(!isFieldPresent)
        {
            return [];  // error
        }
        registers = obj[field[fieldIndex]];
        if(registers.length < 1 || registers.length > CONFIG_DEVICE.DATA_MAX_SIZE)
        {
            return [];  // Error
        }
        encoded[index] = CONFIG_DEVICE.PERIODIC_CHANNEL;
        index = index + 1;
        encoded[index] = firstType + fieldIndex;
        index = index + 1;
        var config = {};
        for(var i=0; i<registers.length; i=i+1)
        {
            register = registers[i];
            if(register in CONFIG_DEVICE.REGISTERS)
            {
                config = CONFIG_DEVICE.REGISTERS[register];
                encoded[index] =  config.TYPE;
                index = index + 1;
            }else{
                return [];  // error (registers not supported)
            }
        }
    }catch(error)
    {
        // Error
        return [];
    }
    return encoded;
}

function encodeParamtersReading(obj, variables)
{
    var encoded = [];
    var index = 0;
    var config = {};
    var param = "";
    try
    {
        if(obj.length > CONFIG_DEVICE.DATA_MAX_SIZE)
        {
            return []; // error
        }
        encoded[index] = CONFIG_DEVICE.REGISTER_CHANNEL;
        index = index + 1;
        encoded[index] = CONFIG_DEVICE.READING_TYPE;
        index = index + 1;
        for(var i=0; i<obj.length; i=i+1)
        {
            param = obj[i];
            var config = CONFIG_DEVICE.REGISTERS[param];
            if(config.RIGHT && config.RIGHT === "WRITE_ONLY")
            {
                return [];  // error
            }
            encoded[index] = config.TYPE;
            index = index + 1;
        }
    }catch(error)
    {
        // Error
        return [];
    }
    return encoded;
}


