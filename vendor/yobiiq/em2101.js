// Version Control
var VERSION_CONTROL = {
    CODEC : {VERSION: "1.0.1", NAME: "codecVersion"},
    DEVICE: {MODEL : "EM2101", NAME: "genericModel"},
    PRODUCT: {CODE : "P1002009", NAME: "productCode"},
    MANUFACTURER: {COMPANY : "YOBIIQ B.V.", NAME: "manufacturer"},
}

// Configuration constants for device basic info and current settings
var CONFIG_INFO = {
    FPORT     : 50,
    CHANNEL  : parseInt("0xFF", 16),
    TYPES    : {
        "0x09" : {SIZE : 2, NAME : "hardwareVersion", DIGIT: false},
        "0x0A" : {SIZE : 2, NAME : "firmwareVersion", DIGIT: false},
        "0x16" : {SIZE : 4, NAME : "deviceSerialNumber"},
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
        "0x00" : {SIZE : 1, NAME : "relayStatus",
            VALUES     : {
                "0x00" : "LOW",
                "0x01" : "HIGH"
            },
        },
        "0x1E" : {SIZE : 2, NAME : "primaryCurrentTransformerRatio",},
        "0x1F" : {SIZE : 1, NAME : "secondaryCurrentTransformerRatio",},
        "0x20" : {SIZE : 4, NAME : "primaryVoltageTransformerRatio",},
        "0x21" : {SIZE : 2, NAME : "secondaryVoltageTransformerRatio",},
        "0x28" : {SIZE : 0, NAME : "deviceModel",},
        "0x3C" : {SIZE : 2, NAME : "currentLimitFallback", UNIT : "A", RESOLUTION : 0.1,},
        "0x3D" : {SIZE : 2, NAME : "voltageLimitFallback", UNIT : "V",},
        "0x3E" : {SIZE : 2, NAME : "powerLimitFallback", UNIT : "W",},
        "0x3F" : {SIZE : 2, NAME : "deactivationDelayFallback", UNIT : "s",},
        "0x40" : {SIZE : 2, NAME : "activationDelayFallback", UNIT : "s",},
        "0x41" : {SIZE : 2, NAME : "offsetCurrentFallback", UNIT : "A", RESOLUTION : 0.1,},
        "0x42" : {SIZE : 2, NAME : "offsetDelayFallback", UNIT : "s",},
        "0x43" : {SIZE : 2, NAME : "resetTimeFallback", UNIT : "s",},
        "0x44" : {SIZE : 1, NAME : "resetAmountFallback",},
        "0x50" : {SIZE : 2, NAME : "currentLimitDynamic", UNIT : "A", RESOLUTION : 0.1},
        "0x51" : {SIZE : 2, NAME : "voltageLimitDynamic", UNIT : "V",},
        "0x52" : {SIZE : 2, NAME : "powerLimitDynamic", UNIT : "W",},
        "0x53" : {SIZE : 2, NAME : "deactivationDelayDynamic", UNIT : "s",},
        "0x54" : {SIZE : 2, NAME : "activationDelayDynamic", UNIT : "s",},
        "0x55" : {SIZE : 2, NAME : "offsetCurrentDynamic", UNIT : "A", RESOLUTION : 0.1},
        "0x56" : {SIZE : 2, NAME : "offsetDelayDynamic", UNIT : "s",},
        "0x57" : {SIZE : 2, NAME : "resetTimeDynamic", UNIT : "s",},
        "0x58" : {SIZE : 1, NAME : "resetAmountDynamic",},
    },
    WARNING_NAME   : "warning",
    ERROR_NAME     : "error",
    INFO_NAME      : "info"
}

// Configuration constants for measurement registers
 var CONFIG_MEASUREMENT = {
    FPORT_MIN : 1,
    FPORT_MAX : 10,
    TYPES : {
        "0x00" : {SIZE : 4, NAME : "index",},
        "0x01" : {SIZE : 4, NAME : "timestamp",},
        "0x03" : {SIZE : 4, NAME : "dataloggerTimestamp",},
        "0x04" : {SIZE : 4, NAME : "activeEnergyImportL1T1", UNIT : "Wh",},
        "0x05" : {SIZE : 4, NAME : "activeEnergyImportL1T2", UNIT : "Wh",},
        "0x06" : {SIZE : 4, NAME : "activeEnergyExportL1T1", UNIT : "Wh",},
        "0x07" : {SIZE : 4, NAME : "activeEnergyExportL1T2", UNIT : "Wh",},
        "0x08" : {SIZE : 4, NAME : "reactiveEnergyImportL1T1", UNIT : "varh",},
        "0x09" : {SIZE : 4, NAME : "reactiveEnergyImportL1T2", UNIT : "varh",},
        "0x0A" : {SIZE : 4, NAME : "reactiveEnergyExportL1T1", UNIT : "varh",},
        "0x0B" : {SIZE : 4, NAME : "reactiveEnergyExportL1T2", UNIT : "varh",},
        "0x0C" : {SIZE : 4, NAME : "voltageL1N", UNIT : "V", RESOLUTION : 0.1, SIGNED : true,},
        "0x10" : {SIZE : 4, NAME : "currentL1", UNIT : "mA", SIGNED : true,},
        "0x14" : {SIZE : 4, NAME : "activePowerL1", UNIT : "W", SIGNED : true,},
        "0x17" : {SIZE : 4, NAME : "reactivePowerL1", UNIT : "kvar", RESOLUTION : 0.001, SIGNED : true,},
        "0x1A" : {SIZE : 4, NAME : "apparentPowerL1", UNIT : "kVA", RESOLUTION : 0.001, SIGNED : true,},
        "0x1D" : {SIZE : 1, NAME : "powerFactorL1", RESOLUTION : 0.01, SIGNED : true,},
        "0x20" : {SIZE : 2, NAME : "phaseAngleL1", UNIT : "degree", RESOLUTION : 0.01, SIGNED : true,},
        "0x23" : {SIZE : 2, NAME : "frequency", UNIT : "Hz", RESOLUTION : 0.01, SIGNED : true,},
        "0x24" : {SIZE : 4, NAME : "totalSystemActivePower", UNIT : "kW",},
        "0x25" : {SIZE : 4, NAME : "totalSystemReactivePower", UNIT : "kvar", RESOLUTION : 0.001,},
        "0x26" : {SIZE : 4, NAME : "totalSystemApparentPower", UNIT : "kVA", RESOLUTION : 0.001,},
        "0x27" : {SIZE : 4, NAME : "maximumL1CurrentDemand", UNIT : "mA", SIGNED : true,},
        "0x2A" : {SIZE : 4, NAME : "averagePower", UNIT : "W", SIGNED : true,},
        "0x2B" : {SIZE : 4, NAME : "midYearOfCertification",},
        "0xF0" : {SIZE : 2, NAME : "manufacturedYear", DIGIT: true,},
        "0xF1" : {SIZE : 2, NAME : "firmwareVersion", DIGIT: false,},
        "0xF2" : {SIZE : 2, NAME : "hardwareVersion", DIGIT: false,},
    },
    WARNING_NAME   : "warning",
    ERROR_NAME     : "error",
    INFO_NAME      : "info"
}

// Configuration constants for change of state
var CONFIG_STATE = {
    FPORT : 11,
    TYPES : {
        "0x01" : {SIZE : 1, NAME : "relayStatus",
            VALUES     : {
                "0x00" : "OPEN",
                "0x01" : "CLOSED"
            },
        },
        "0x02" : {SIZE : 1, NAME : "digitalInputStatus",
            VALUES     : {
                "0x00" : "OPEN",
                "0x01" : "CLOSED"
            },
        },
    },
    WARNING_NAME   : "warning",
    ERROR_NAME     : "error",
    INFO_NAME      : "info"
}

// Configuration constants for event logging
var CONFIG_LOGGING = {
    FPORT : 60,
    CHANNEL  : parseInt("0xFD", 16),
    TYPES : {
        "0x01" : {SIZE : 1, NAME : "relaySwitchingOffReason",
            VALUES     : {
                "0x00" : "Invalid",
                "0x01" : "Due to too high current limit",
                "0x02" : "By control from the Lora network",
                "0x03" : "By operation via display"
            },
        },
        "0x02" : {SIZE : 1, NAME : "relayEnableReason",
            VALUES     : {
                "0x00" : "Invalid",
                "0x01" : "By reset based on time",
                "0x02" : "By reset from the Lora network",
                "0x03" : "By operation via display",
                "0x04" : "By control from the Lora network"
            },
        },
        "0x03" : {SIZE : 4, NAME : "relaySwitchOffTime",},
        "0x04" : {SIZE : 4, NAME : "relayEnableTime",},
        "0x05" : {SIZE : 4, NAME : "currentWhenRelaySwitchingOff",},
        "0x06" : {SIZE : 4, NAME : "voltageWhenRelaySwitchingOff",},
        "0x07" : {SIZE : 4, NAME : "activePowerWhenRelaySwitchingOff",},
        "0x08" : {SIZE : 1, NAME : "resetAmountStatus",
            VALUES     : {
                "0x01" : "Current reset count is less than the reset amount",
                "0x02" : "Current reset count exceeds the reset amount",
            },
        },
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
            // No channel checking
            // Type of basic information
            type = "0x" + toEvenHEX(bytes[index].toString(16).toUpperCase());
            index = index + 1;
            var info = CONFIG_INFO.TYPES[type];
            size = info.SIZE;
            // Decoding
            var value = 0;
            if(size != 0)
            {
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
                        value = value.toString();
                    }
                }
                else if(info.VALUES)
                {
                    // Decode into STRING (VALUES specified in CONFIG_INFO)
                    value = "0x" + toEvenHEX(bytes[index].toString(16).toUpperCase());
                    value = info.VALUES[value];
                }else
                {
                    // Decode into DECIMAL format
                    value = getValueFromBytesBigEndianFormat(bytes, index, size);
                }
                if(info.RESOLUTION)
                {
                    value = value * info.RESOLUTION;
                    value = parseFloat(value.toFixed(2));
                }
                if(info.UNIT)
                {
                    decoded[info.NAME] = {};
                    decoded[info.NAME]["data"] = value;
                    decoded[info.NAME]["unit"] = info.UNIT;
                    // decoded[info.NAME] = value;
                }else
                {
                    decoded[info.NAME] = value;
                }
                index = index + size;
            }else
            {
                // Device Model (End of decoding)
                size = LENGTH - index;
                decoded[info.NAME] = getStringFromBytesBigEndianFormat(bytes, index, size);
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
    var channel = 0;
    var type = "";
    var size = 0;
    if(LENGTH == 1)
    {
        if(bytes[0] == 0)
        {
            decoded[CONFIG_MEASUREMENT.INFO_NAME] = "Downlink command succeeded";

        } else if(bytes[0] == 1)
        {
            decoded[CONFIG_MEASUREMENT.WARNING_NAME] = "Downlink command failed";
        }
        return decoded;
    }
    try
    {
        while(index < LENGTH)
        {
            channel = bytes[index];
            index = index + 1;
            // Type of device measurement
            type = "0x" + toEvenHEX(bytes[index].toString(16).toUpperCase());
            index = index + 1;
            
            // channel checking
            if(channel == 11 && type == "0x0A")
            {
                // Modbus error code decoding
                decoded.modbusErrorCode = bytes[index];
                index = index + 1;
                continue; // next channel
            }

            var measurement = CONFIG_MEASUREMENT.TYPES[type];
            size = measurement.SIZE;
            // Decoding
            var value = 0;
            if(measurement.DIGIT || measurement.DIGIT == false)
            {
                if(measurement.DIGIT == false)
                {
                    // Decode into "V" + DIGIT STRING + "." DIGIT STRING format
                    value = getDigitStringArrayNoFormat(bytes, index, size);
                    value = "V" + value[0] + "." + value[1];
                }else
                {
                    // Decode into DIGIT NUMBER format
                    value = getDigitStringArrayEvenFormat(bytes, index, size);
                    value = parseInt(value.join(""));
                }
            }else
            {
                // Decode into DECIMAL format
                value = getValueFromBytesBigEndianFormat(bytes, index, size);
            }
            if(measurement.SIGNED)
            {
                value = getSignedIntegerFromInteger(value, size);
            }
            if(measurement.RESOLUTION)
            {
                value = value * measurement.RESOLUTION;
                value = parseFloat(value.toFixed(2));
            }
            if(measurement.UNIT)
            {
                decoded[measurement.NAME] = {};
                decoded[measurement.NAME]["data"] = value;
                decoded[measurement.NAME]["unit"] = measurement.UNIT;
                // decoded[measurement.NAME] = value;
            }else
            {
                decoded[measurement.NAME] = value;
            }
            index = index + size;

        }
    }catch(error)
    {
        decoded[CONFIG_MEASUREMENT.ERROR_NAME] = error.message;
    }
    return decoded;
}

function decodeChangeState(bytes)
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
            decoded[CONFIG_STATE.INFO_NAME] = "Downlink command succeeded";

        } else if(bytes[0] == 1)
        {
            decoded[CONFIG_STATE.WARNING_NAME] = "Downlink command failed";
        }
        return decoded;
    }
    try
    {
        while(index < LENGTH)
        {
            channel = bytes[index];
            index = index + 1;
            // Type of change of state
            type = "0x" + toEvenHEX(bytes[index].toString(16).toUpperCase());
            index = index + 1;
            // No channel checking
            var state = CONFIG_STATE.TYPES[type];
            size = state.SIZE;
            // Decoding
            var value = 0;
            if(size != 0)
            {
                if(state.VALUES)
                {
                    // Decode into STRING (VALUES specified in CONFIG_STATE)
                    value = "0x" + toEvenHEX(bytes[index].toString(16).toUpperCase());
                    value = state.VALUES[value];
                }
                index = index + size;
            }
            decoded[state.NAME] = value;
        }
    }catch(error)
    {
        decoded[CONFIG_STATE.ERROR_NAME] = error.message;
    }

    return decoded;
}

function decodeEventLogging(bytes)
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
            decoded[CONFIG_LOGGING.INFO_NAME] = "Downlink command succeeded";

        } else if(bytes[0] == 1)
        {
            decoded[CONFIG_LOGGING.WARNING_NAME] = "Downlink command failed";
        }
        return decoded;
    }
    try
    {
        while(index < LENGTH)
        {
            channel = bytes[index];
            index = index + 1;
            // Type of change of state
            type = "0x" + toEvenHEX(bytes[index].toString(16).toUpperCase());
            index = index + 1;
            // No channel checking
            var logging = CONFIG_LOGGING.TYPES[type];
            size = logging.SIZE;
            // Decoding
            var value = 0;
            if(size != 0)
            {
                if(logging.VALUES)
                {
                    // Decode into STRING (VALUES specified in CONFIG_LOGGING)
                    value = "0x" + toEvenHEX(bytes[index].toString(16).toUpperCase());
                    value = logging.VALUES[value];
                }else
                {
                    // Decode into DECIMAL format
                    value = getValueFromBytesBigEndianFormat(bytes, index, size);
                }
                index = index + size;
            }
            decoded[logging.NAME] = value;
        }
    }catch(error)
    {
        decoded[CONFIG_LOGGING.ERROR_NAME] = error.message;
    }

    return decoded;
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
    }
    else if(fPort == CONFIG_INFO.FPORT)
    {
        decoded = decodeBasicInformation(bytes);
    }else if(fPort >= CONFIG_MEASUREMENT.FPORT_MIN && fPort <= CONFIG_MEASUREMENT.FPORT_MAX)
    {
        decoded = decodeDeviceData(bytes);
    }else if(fPort == CONFIG_STATE.FPORT)
    {
        decoded = decodeChangeState(bytes);
    }else if(fPort == CONFIG_LOGGING.FPORT)
    {
        decoded = decodeEventLogging(bytes);
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
        else if(obj[CONFIG_DOWNLINK.TYPE] == CONFIG_DOWNLINK.DYNAMIC)
        {
            return encodeDynamicLimitControl(obj[CONFIG_DOWNLINK.DYNAMIC], variables);
        }
        else if(obj[CONFIG_DOWNLINK.TYPE] == CONFIG_DOWNLINK.RELAY)
        {
            return encodeRelayControl(obj[CONFIG_DOWNLINK.RELAY], variables);
        }
        else if(obj[CONFIG_DOWNLINK.TYPE] == CONFIG_DOWNLINK.MEASURE)
        {
            return encodePeriodicPackage(obj[CONFIG_DOWNLINK.MEASURE], variables);
        }
        else if(obj[CONFIG_DOWNLINK.TYPE] == CONFIG_DOWNLINK.REQUEST)
        {
            return encodeRequestSettings(obj[CONFIG_DOWNLINK.REQUEST], variables);
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
    FPORT : 50,
    CHANNEL : parseInt("0xFF", 16),
    TYPES : {
        "restart" : {TYPE : parseInt("0x0B", 16), SIZE : 1, MIN : 1, MAX : 1,},
        "digitalInput" : {TYPE : parseInt("0x47", 16), SIZE : 1, MIN : 0, MAX : 1, CHANNEL : parseInt("0x08", 16),},
        "currentLimitFallback" : {TYPE : parseInt("0x32", 16), SIZE : 2, MIN : 0, MAX : 9999,},
        "voltageLimitFallback" : {TYPE : parseInt("0x33", 16), SIZE : 2, MIN : 0, MAX : 9999,},
        "powerLimitFallback" : {TYPE : parseInt("0x34", 16), SIZE : 2, MIN : 0, MAX : 9999,},
        "deactivationDelayFallback" : {TYPE : parseInt("0x35", 16), SIZE : 2, MIN : 0, MAX : 9999,},
        "activationDelayFallback" : {TYPE : parseInt("0x36", 16), SIZE : 2, MIN : 0, MAX : 9999,},
        "offsetCurrentFallback" : {TYPE : parseInt("0x37", 16), SIZE : 2, MIN : 0, MAX : 9999,},
        "offsetDelayFallback" : {TYPE : parseInt("0x38", 16), SIZE : 2, MIN : 0, MAX : 9999,},
        "resetTimeFallback" : {TYPE : parseInt("0x39", 16), SIZE : 2, MIN : 0, MAX : 9999,},
        "resetAmountFallback" : {TYPE : parseInt("0x3A", 16), SIZE : 1, MIN : 0, MAX : 255,}
    }
}

// Constants for Dynamic limit control
var CONFIG_DYNAMIC = {
    FPORT : 50,
    CHANNEL : parseInt("0x01", 16),
    TYPES : {
        "currentLimit" : {TYPE : parseInt("0x32", 16), SIZE : 2, MIN : 0, MAX : 9999,},
        "voltageLimit" : {TYPE : parseInt("0x33", 16), SIZE : 2, MIN : 0, MAX : 9999,},
        "powerLimit" : {TYPE : parseInt("0x34", 16), SIZE : 2, MIN : 0, MAX : 9999,},
        "deactivationDelay" : {TYPE : parseInt("0x35", 16), SIZE : 2, MIN : 0, MAX : 9999,},
        "activationDelay" : {TYPE : parseInt("0x36", 16), SIZE : 2, MIN : 0, MAX : 9999,},
        "offsetCurrent" : {TYPE : parseInt("0x37", 16), SIZE : 2, MIN : 0, MAX : 9999,},
        "offsetDelay" : {TYPE : parseInt("0x38", 16), SIZE : 2, MIN : 0, MAX : 9999,},
        "resetTime" : {TYPE : parseInt("0x39", 16), SIZE : 2, MIN : 0, MAX : 9999,},
        "resetAmount" : {TYPE : parseInt("0x3A", 16), SIZE : 1, MIN : 0, MAX : 255,}
    }
}

// Constants for Relay control
var CONFIG_RELAY = {
    FPORT : 50,
    CHANNEL : parseInt("0x07", 16),
    TYPES : {
        "reset" : {TYPE : parseInt("0x46", 16), SIZE : 1, MIN : 1, MAX : 1,},
        "controlMode" : {TYPE : parseInt("0x47", 16), SIZE : 1, MIN : 0, MAX : 1,},
        "relayCommand" : {TYPE : parseInt("0x48", 16), SIZE : 1, MIN : 0, MAX : 1,}
    }
}

// Constants for device periodic package 
var CONFIG_PERIODIC = {
    CHANNEL : parseInt("0xFF", 16),
    TYPES : {
        "Interval" : {TYPE : parseInt("0x14", 16), SIZE : 1, MIN : 1, MAX : 255,},
        "Mode" : {TYPE : parseInt("0x15", 16), SIZE : 1, MIN : 0, MAX : 1,},
        "Status" : {TYPE : parseInt("0x16", 16), SIZE : 1, MIN : 0, MAX : 1,},
        "Measurement" : {TYPE : parseInt("0x17", 16), SIZE : 1, MIN : 0, MAX : 10,},
    },
    MEASUREMENTS : {
        index : "0x00",
        timestamp : "0x01",
        dataloggerTimestamp : "0x03",
        activeEnergyImportL1T1 : "0x04",
        activeEnergyImportL1T2 : "0x05",
        activeEnergyExportL1T1 : "0x06",
        activeEnergyExportL1T2 : "0x07",
        reactiveEnergyImportL1T1 : "0x08",
        reactiveEnergyImportL1T2 : "0x09",
        reactiveEnergyExportL1T1 : "0x0A",
        reactiveEnergyExportL1T2 : "0x0B",
        voltageL1N : "0x0C",
        currentL1 : "0x10",
        activePowerL1 : "0x14",
        reactivePowerL1 : "0x17",
        apparentPowerL1 : "0x1A",
        powerFactorL1 : "0x1d",
        phaseAngleL1 : "0x20",
        frequency : "0x23",
        totalSystemActivePower : "0x24",
        totalSystemReactivePower : "0x25",
        totalSystemApparentPower : "0x26",
        maximumL1CurrentDemand : "0x27",
        AveragePower : "0x2A",
        midYearOfCertification : "0x2B",
        manufacturedYear : "0xF0",
        firmwareVersion : "0xF1",
        hardwareVersion : "0xF2",
    }
}

// Constants for request settings
var CONFIG_REQUEST = {
    FPORT: 50,
    CHANNEL : parseInt("0x02", 16),
    TYPE : parseInt("0x0B", 16),
    MIN: 1,
    MAX: 10,
    SETTINGS : {
        currentLimitFallback : "0x3C",
        voltageLimitFallback : "0x3D",
        powerLimitFallback : "0x3E",
        deactivationDelayFallback : "0x3F",
        activationDelayFallback : "0x40",
        offsetCurrentFallback : "0x41",
        offsetDelayFallback : "0x42",
        resetTimeFallback : "0x43",
        resetAmountFallback : "0x44",
        currentLimitDynamic : "0x50",
        voltageLimitDynamic : "0x51",
        powerLimitDynamic : "0x52",
        deactivationDelayDynamic : "0x53",
        activationDelayDynamic : "0x54",
        offsetCurrentDynamic : "0x55",
        offsetDelayDynamic : "0x56",
        resetTimeDynamic : "0x57",
        resetAmountDynamic : "0x58",
    }

}

// Constants for downlink type (Config or Measure)
var CONFIG_DOWNLINK = {
    TYPE    : "Type",
    CONFIG  : "Config",
    DYNAMIC : "Dynamic",
    RELAY   : "Relay",
    MEASURE : "Measure",
    REQUEST : "RequestSettings"
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
        if(obj[field[1]] >= config.MIN && obj[field[1]] <= config.MAX)
        {
            if("CHANNEL" in config)
            {
                encoded[index] = config.CHANNEL;
            }else
            {
                encoded[index] = CONFIG_DEVICE.CHANNEL;
            }
            index = index + 1;
            encoded[index] = config.TYPE;
            index = index + 1;
            for(var i=1; i<=config.SIZE; i=i+1)
            {
                encoded[index] = (value >> 8*(config.SIZE - i)) % 256;
                index = index + 1;
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

function encodeDynamicLimitControl(obj, variables)
{
    var encoded = []
    var index = 0;
    var field = ["Param", "Value"];
    try
    {
        var config = CONFIG_DYNAMIC.TYPES[obj[field[0]]];
        var value = obj[field[1]];
        if(obj[field[1]] >= config.MIN && obj[field[1]] <= config.MAX)
        {
            encoded[index] = CONFIG_DYNAMIC.CHANNEL;
            index = index + 1;
            encoded[index] = config.TYPE;
            index = index + 1;
            for(var i=1; i<=config.SIZE; i=i+1)
            {
                encoded[index] = (value >> 8*(config.SIZE - i)) % 256;
                index = index + 1;
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

function encodeRelayControl(obj, variables)
{
    var encoded = []
    var index = 0;
    var field = ["Param", "Value"];
    try
    {
        var config = CONFIG_RELAY.TYPES[obj[field[0]]];
        var value = obj[field[1]];
        if(obj[field[1]] >= config.MIN && obj[field[1]] <= config.MAX)
        {
            encoded[index] = CONFIG_RELAY.CHANNEL;
            index = index + 1;
            encoded[index] = config.TYPE;
            index = index + 1;
            for(var i=1; i<=config.SIZE; i=i+1)
            {
                encoded[index] = (value >> 8*(config.SIZE - i)) % 256;
                index = index + 1;
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

function encodePeriodicPackage(obj, variables)
{
    var encoded = []
    var index = 0;
    var field = ["Interval", "Mode", "Status", "Measurement"];
    try 
    {
        // Encode Interval, Mode, Status
        for(var i=0; i<3; i=i+1)
        {
            if(field[i] in obj)
            {
                var config = CONFIG_PERIODIC.TYPES[field[i]];
                if(obj[field[i]] >= config.MIN && obj[field[i]] <= config.MAX)
                {
                    encoded[index] = CONFIG_PERIODIC.CHANNEL;
                    index = index + 1;
                    encoded[index] = config.TYPE;
                    index = index + 1;
                    encoded[index] = obj[field[i]];
                    index = index + 1;
                }else
                {
                    // Error
                    return [];
                }
            }
        }
        // Encode Measurement
        if(field[3] in obj)
        {
            var measurements = obj[field[3]];
            var LENGTH = measurements.length;
            var config = CONFIG_PERIODIC.TYPES[field[3]];
            if(LENGTH > config.MAX)
            {
                // Error
                return [];
            }
            var measurement = "";
            if(LENGTH > 0)
            {
                encoded[index] = CONFIG_PERIODIC.CHANNEL;
                index = index + 1;
                encoded[index] = config.TYPE;
                index = index + 1;
            }
            for(var i=0; i<LENGTH; i=i+1)
            {
                measurement = measurements[i];
                if(measurement in CONFIG_PERIODIC.MEASUREMENTS)
                {
                    encoded[index] = parseInt(CONFIG_PERIODIC.MEASUREMENTS[measurement], 16);
                    index = index + 1;
                }else
                {
                    // Error
                    return [];
                }
            }
        }

    }catch(error)
    {
        // Error
        return [];
    }

    return encoded;
}

function encodeRequestSettings(obj, variables){
    var encoded = []
    var index = 0;
    var LENGTH = obj.length;
    try 
    {
        // Encode each request setting
        for(var i=0; i<LENGTH; i=i+1)
        {
            if(obj[i] in CONFIG_REQUEST.SETTINGS)
            {
                encoded[index] = CONFIG_REQUEST.CHANNEL;
                index = index + 1;
                encoded[index] = CONFIG_REQUEST.TYPE;
                index = index + 1;
                encoded[index] = parseInt(CONFIG_REQUEST.SETTINGS[obj[i]], 16);
                index = index + 1;
            }
        }       
    }catch(error)
    {
        // Error
        return [];
    }

    return encoded;
}