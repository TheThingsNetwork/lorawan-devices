
/**
 *__   _____  ____ ___ ___ ___  
 *\ \ / / _ \| __ )_ _|_ _/ _ \ 
 * \ V / | | |  _ \| | | | | | |
 * | || |_| | |_) | | | | |_| |
 * |_| \___/|____/___|___\__\_\
 *                              
 * 
 * YOBIIQ JS payload decoder compatible with TTN v3/v4 payload formatter and ChirpStack payload codec.
 * 
 * @author      Fostin Kpodar <f.kpodar@yobiiq.com>
 * @version     1.1.0
 * @copyright   YOBIIQ B.V. | https://www.yobiiq.com
 * 
 * @release     06/12/2023
 * @update      10/30/2024
 * 
 * @author      Dominic Hakke <d.hakke@yobiiq.com>
 * // Changes in header of document, naming conventions changed.
 * 
 *
 * @product     P1002015 iQ SD-1001 (Smoke Detector)
 * 
 * 
 */

// Version Control
var VERSION_CONTROL = {
    CODEC : {VERSION: "1.1.0", NAME: "codecVersion"},
    DEVICE: {MODEL : "SD-1001", NAME: "deviceModel"},
    PRODUCT: {CODE : "1002015", NAME: "productCode"},
    MANUFACTURER: {COMPANY : "YOBIIQ B.V.", NAME: "manufacturer"},
}

// Configuration constants for device basic info
var CONFIG_INFO = {
    FPORT     : 50,
    CHANNEL  : parseInt("0xFF", 16),
    TYPES    : {
        "0x09" : {SIZE : 2, NAME : "hardwareVersion", DIGIT: false},
        "0x0A" : {SIZE : 2, NAME : "firmwareVersion", DIGIT: false},
        "0x16" : {SIZE : 5, NAME : "deviceSerialNumber", DIGIT: true},
        "0x0F" : {SIZE : 1, NAME : "deviceClass",
            VALUES     : {
                "0x00" : "Class A",
                "0x01" : "Class B",
                "0x02" : "Class C",
            },
        },
        "0x0B" : {SIZE : 1, NAME : "powerEvent",
            VALUES     : {
                "0x00" : "AC Power Off",
                "0x01" : "AC Power On",
            },
        },
    },
    WARNING_NAME   : "warning",
    ERROR_NAME     : "error",
    INFO_NAME      : "info"
}

// Configuration constants for data registers
 var CONFIG_DATA = {
    FPORT   : 8,
    CHANNELS   : {
        "0x01" : {SIZE : 1, NAME : "batteryLevelInPercentage",},
        "0x02" : {SIZE : 1, NAME : "powerEvent",
            VALUES     : {
                "0x00" : "AC Power Off",
                "0x01" : "AC Power On",
            },
        },
        "0x03" : {SIZE : 1, NAME : "lowBatteryAlarm",
            VALUES     : {
                "0x00" : "Normal",
                "0x01" : "Alarm",
            },
        },
        "0x04" : {SIZE : 1, NAME : "faultAlarm",
            VALUES     : {
                "0x00" : "Normal",
                "0x01" : "Alarm",
            },
        },
        "0x05" : {SIZE : 1, NAME : "smokeAlarm",
            VALUES     : {
                "0x00" : "Normal",
                "0x01" : "Alarm",
            },
        },
        "0x06" : {SIZE : 1, NAME : "interconnectAlarm",
            VALUES     : {
                "0x00" : "Normal",
                "0x01" : "Alarm",
            },
        },
        "0x07" : {SIZE : 1, NAME : "testButtonPressed",
            VALUES     : {
                "0x00" : "Normal",
                "0x01" : "Pushed",
            },
        },
    },
    WARNING_NAME   : "warning",
    ERROR_NAME     : "error",
    INFO_NAME      : "info"
}

function isBasicInformation(bytes, fPort)
{
    if(fPort == CONFIG_INFO.FPORT)
    {
        return true;
    }
    // Example: ff090100 ff0a0102 ff162404152795 ff0f02 ff0b01
    if(bytes[0] == CONFIG_INFO.CHANNEL &&
        bytes[4] == CONFIG_INFO.CHANNEL &&
        bytes[8] == CONFIG_INFO.CHANNEL
    )
    {
        return true
    }
    return false;
}

function decodeBasicInformation(bytes)
{
    var LENGTH = bytes.length;
    var decoded = {};
    var index = 0;
    var channel = 0;
    var type = "";
    var size = 0;
    var security = Object.keys(CONFIG_INFO.TYPES).length;
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
        while(index < LENGTH && security != 0)
        {
            security = security - 1;
            channel = bytes[index];
            index = index + 1;
            if(channel != CONFIG_INFO.CHANNEL)
            {
                continue; // next byte
            }
            // Type of basic information
            type = "0x" + toEvenHEX(bytes[index].toString(16).toUpperCase());
            index = index + 1;
            var info = CONFIG_INFO.TYPES[type]
            size = info.SIZE;
            // Decoding
            var value = 0;
            if(size != 0)
            {
                if("DIGIT" in info)
                {
                    if(info.DIGIT == false)
                    {
                        // Decode into "V" + DIGIT STRING + "." DIGIT STRING format
                        value = getDigitStringArrayNoFormat(bytes, index, size);
                        value = "V" + value[0] + "." + value[1];
                    }else
                    {
                        // Decode into DIGIT STRING format
                        value = getDigitStringArrayEvenFormat(bytes, index, size).join("");
                        value = parseInt(value, 10);
                    }
                }
                else if("VALUES" in info)
                {
                    // Decode into HEX STRING (VALUES specified in CONFIG_INFO)
                    value = "0x" + toEvenHEX(bytes[index].toString(16).toUpperCase());
                    value = info.VALUES[value];
                }else
                {
                    // Decode into DECIMAL format
                    value = getValueFromBytesBigEndianFormat(bytes, index, size);
                }
                decoded[info.NAME] = value;
                index = index + size;
            }
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
    var channel = "";
    var type = 0;
    var size = 0;
    var security = Object.keys(CONFIG_DATA).length;
    if(LENGTH == 1)
    {
        if(bytes[0] == 0)
        {
            decoded[CONFIG_DATA.INFO_NAME] = "Downlink command succeeded";

        } else if(bytes[0] == 1)
        {
            decoded[CONFIG_DATA.WARNING_NAME] = "Downlink command failed";
        }
        return decoded;
    }
    try
    {
        while(index < LENGTH && security != 0)
        {
            security = security - 1;
            // Channel of device data
            channel = "0x" + toEvenHEX(bytes[index].toString(16).toUpperCase());
            index = index + 1;
            // Type of device data
            type = bytes[index];
            index = index + 1;

            // No type checking

            var config = CONFIG_DATA.CHANNELS[channel]
            size = config.SIZE;
            // Decoding
            var value = 0;
            if("VALUES" in config)
            {
                // Decode into STRING (VALUES specified in CONFIG_DATA)
                value = "0x" + toEvenHEX(bytes[index].toString(16).toUpperCase());
                value = config.VALUES[value];
            }else
            {
                // Decode into DECIMAL format
                value = getValueFromBytesBigEndianFormat(bytes, index, size);
            }
            decoded[config.NAME] = value;
            index = index + size;
        }
    }catch(error)
    {
        decoded[CONFIG_DATA.ERROR_NAME] = error.message;
    }
    return decoded;
}

function getValueFromBytesBigEndianFormat(bytes, index, size)
{
    var value = 0;
    for(var i=0; i<(size-1); i=i+1)
    {
        value = (value | bytes[index+i]) << 8; 
    }
    value = value | bytes[index+size-1]
    return (value >>> 0); // to unsigned
}

function getValueFromBytesLittleEndianFormat(bytes, index, size)
{
    var value = 0;
    for(var i=(size-1); i>0; i=i-1)
    {
        value = (value | bytes[index+i]) << 8; 
    }
    value = value | bytes[index]
    return (value >>> 0); // to unsigned
}

function getDigitStringArrayNoFormat(bytes, index, size)
{
  var hexString = []
  for(var i=0; i<size; i=i+1)
  {
    hexString.push(bytes[index+i].toString(16));
  }
  return hexString
}

function getDigitStringArrayEvenFormat(bytes, index, size)
{
  var hexString = []
  for(var i=0; i<size; i=i+1)
  {
    hexString.push(bytes[index+i].toString(16));
  }
  return hexString.map(toEvenHEX)
}

function toEvenHEX(hex)
{
  if(hex.length == 1)
  {
    return "0"+hex;
  }
  return hex;
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
    if(isBasicInformation(bytes, fPort))
    {
        decoded = decodeBasicInformation(bytes);
    }else
    {
        decoded = decodeDeviceData(bytes);
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

// Constants for device configuration 
var CONFIG_DEVICE = {
    PORT : 50,
    CHANNEL : parseInt("0xFF", 16),
    TYPES : {
        "reportingInterval" : {TYPE : parseInt("0x03", 16), SIZE : 2, MIN : 1, MAX : 65535,},
        "smokeDetector" : {TYPE : parseInt("0x00", 16), SIZE : 1, MIN : 0, MAX : 1,},
        "silenceBuzzer" : {TYPE : parseInt("0x0A", 16), SIZE : 2, MIN : 0, MAX : 65535,},
        "confirmedUplink" : {TYPE : parseInt("0x01", 16), SIZE : 1, MIN : 0, MAX : 1,},
    }
}

// Constants for downlink
var CONFIG_DOWNLINK = {
    TYPE    : "Type",
    CONFIG  : "Config"
}

function encodeDeviceConfiguration(obj, variables)
{
    var encoded = []
    var index = 0;
    var field = ["Param", "Value"];
    try
    {
        var config = CONFIG_DEVICE.TYPES[obj[field[0]]];
        var value = obj[field[1]];
        if(obj[field[1]] >= config["MIN"] && obj[field[1]] <= config["MAX"])
        {
            encoded[index] = CONFIG_DEVICE.CHANNEL;
            index = index + 1;
            encoded[index] = config.TYPE;
            index = index + 1;
            if(config.SIZE == 1)
            {
                encoded[index] = value;
                index = index + 1;
            }else if(config.SIZE == 2)
            {
                switch(config.TYPE)
                {
                    case 3: // reporting interval
                        var lowByte = value % 256;
                        encoded[index] = ((lowByte & parseInt("0x0F", 16)) << 4) +  (lowByte >> 4);
                        index = index + 1;
                        encoded[index] = (value >> 8) % 256;
                        index = index + 1;
                        break;
                    default:
                        encoded[index] = (value >> 8) % 256;
                        index = index + 1;
                        encoded[index] = value % 256;
                        index = index + 1;
                        break;
                }
            }
        }else
        {
            // Error
            return [];
        }
    }catch(error)
    {
        // Error
        return [];
    }
    return encoded;
}