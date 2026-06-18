
// Version Control
var VERSION_CONTROL = {
    CODEC : {VERSION: "1.0.1", NAME: "codecVersion"},
    DEVICE: {MODEL : "EM4301", NAME: "genericModel"},
    PRODUCT: {CODE : "P1002011", NAME: "productCode"},
    MANUFACTURER: {COMPANY : "YOBIIQ B.V.", NAME: "manufacturer"},
}


// Configuration constants for device basic info
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
        "0x1E" : {SIZE : 2, NAME : "primaryCurrentTransformerRatio",},
        "0x1F" : {SIZE : 1, NAME : "secondaryCurrentTransformerRatio",},
        "0x20" : {SIZE : 4, NAME : "primaryVoltageTransformerRatio",},
        "0x21" : {SIZE : 2, NAME : "secondaryVoltageTransformerRatio",},
        "0x28" : {SIZE : 0, NAME : "deviceModel",},
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
        "0x04" : {SIZE : 4, NAME : "activeEnergyImportL123T1", UNIT : "Wh",},
        "0x05" : {SIZE : 4, NAME : "activeEnergyImportL123T2", UNIT : "Wh",},
        "0x06" : {SIZE : 4, NAME : "activeEnergyExportL123T1", UNIT : "Wh",},
        "0x07" : {SIZE : 4, NAME : "activeEnergyExportL123T2", UNIT : "Wh",},
        "0x08" : {SIZE : 4, NAME : "reactiveEnergyImportL123T1", UNIT : "varh",},
        "0x09" : {SIZE : 4, NAME : "reactiveEnergyImportL123T2", UNIT : "varh",},
        "0x0A" : {SIZE : 4, NAME : "reactiveEnergyExportL123T1", UNIT : "varh",},
        "0x0B" : {SIZE : 4, NAME : "reactiveEnergyExportL123T2", UNIT : "varh",},
        "0x0C" : {SIZE : 4, NAME : "voltageL1N", UNIT : "V", RESOLUTION : 0.1, SIGNED : true,},
        "0x0D" : {SIZE : 4, NAME : "voltageL2N", UNIT : "V", RESOLUTION : 0.1, SIGNED : true,},
        "0x0E" : {SIZE : 4, NAME : "voltageL3N", UNIT : "V", RESOLUTION : 0.1, SIGNED : true,},
        "0x0F" : {SIZE : 4, NAME : "currentL123", UNIT : "mA", SIGNED : true,},
        "0x10" : {SIZE : 4, NAME : "currentL1", UNIT : "mA", SIGNED : true,},
        "0x11" : {SIZE : 4, NAME : "currentL2", UNIT : "mA", SIGNED : true,},
        "0x12" : {SIZE : 4, NAME : "currentL3", UNIT : "mA", SIGNED : true,},
        "0x13" : {SIZE : 4, NAME : "activePowerL123", UNIT : "W", SIGNED : true,},
        "0x14" : {SIZE : 4, NAME : "activePowerL1", UNIT : "W", SIGNED : true,},
        "0x15" : {SIZE : 4, NAME : "activePowerL2", UNIT : "W", SIGNED : true,},
        "0x16" : {SIZE : 4, NAME : "activePowerL3", UNIT : "W", SIGNED : true,},
        "0x17" : {SIZE : 4, NAME : "reactivePowerL1", UNIT : "kvar", RESOLUTION : 0.001, SIGNED : true,},
        "0x18" : {SIZE : 4, NAME : "reactivePowerL2", UNIT : "kvar", RESOLUTION : 0.001, SIGNED : true,},
        "0x19" : {SIZE : 4, NAME : "reactivePowerL3", UNIT : "kvar", RESOLUTION : 0.001, SIGNED : true,},
        "0x1A" : {SIZE : 4, NAME : "apparentPowerL1", UNIT : "kVA", RESOLUTION : 0.001, SIGNED : true,},
        "0x1B" : {SIZE : 4, NAME : "apparentPowerL2", UNIT : "kVA", RESOLUTION : 0.001, SIGNED : true,},
        "0x1C" : {SIZE : 4, NAME : "apparentPowerL3", UNIT : "kVA", RESOLUTION : 0.001, SIGNED : true,},
        "0x1D" : {SIZE : 1, NAME : "powerFactorL1", RESOLUTION : 0.01, SIGNED : true,},
        "0x1E" : {SIZE : 1, NAME : "powerFactorL2", RESOLUTION : 0.01, SIGNED : true,},
        "0x1F" : {SIZE : 1, NAME : "powerFactorL3", RESOLUTION : 0.01, SIGNED : true,},
        "0x20" : {SIZE : 2, NAME : "phaseAngleL1", UNIT : "degree", RESOLUTION : 0.01, SIGNED : true,},
        "0x21" : {SIZE : 2, NAME : "phaseAngleL2", UNIT : "degree", RESOLUTION : 0.01, SIGNED : true,},
        "0x22" : {SIZE : 2, NAME : "phaseAngleL3", UNIT : "degree", RESOLUTION : 0.01, SIGNED : true,},
        "0x23" : {SIZE : 2, NAME : "frequency", UNIT : "Hz", RESOLUTION : 0.01, SIGNED : true,},
        "0x24" : {SIZE : 4, NAME : "totalSystemActivePower", UNIT : "kW",},
        "0x25" : {SIZE : 4, NAME : "totalSystemReactivePower", UNIT : "kvar", RESOLUTION : 0.001,},
        "0x26" : {SIZE : 4, NAME : "totalSystemApparentPower", UNIT : "kVA", RESOLUTION : 0.001,},
        "0x27" : {SIZE : 4, NAME : "maximumL1CurrentDemand", UNIT : "mA", SIGNED : true,},
        "0x28" : {SIZE : 4, NAME : "maximumL2CurrentDemand", UNIT : "mA", SIGNED : true,},
        "0x29" : {SIZE : 4, NAME : "maximumL3CurrentDemand", UNIT : "mA", SIGNED : true,},
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
            if(channel == CONFIG_INFO.CHANNEL)
            {
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
                    }else
                    {
                        if(info.VALUES)
                        {
                            // Decode into STRING (VALUES specified in CONFIG_INFO)
                            value = "0x" + toEvenHEX(bytes[index].toString(16).toUpperCase());
                            value = info.VALUES[value];
                        }else
                        {
                            // Decode into DECIMAL format
                            value = getValueFromBytesBigEndianFormat(bytes, index, size);
                        }
                    }
                    decoded[info.NAME] = value;
                    index = index + size;
                }else
                {
                    // Device Model (End of decoding)
                    size = getSizeBasedOnChannel(bytes, index, channel);
                    decoded[info.NAME] = getStringFromBytesBigEndianFormat(bytes, index, size);
                    index = index + size;
                }
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
    }
    else if(fPort == CONFIG_INFO.FPORT)
    {
        decoded = decodeBasicInformation(bytes);
    }else if(fPort >= CONFIG_MEASUREMENT.FPORT_MIN && fPort <= CONFIG_MEASUREMENT.FPORT_MAX)
    {
        decoded = decodeDeviceData(bytes);
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
        }else if(obj[CONFIG_DOWNLINK.TYPE] == CONFIG_DOWNLINK.MEASURE)
        {
            return encodePeriodicPackage(obj[[CONFIG_DOWNLINK.MEASURE]], variables);
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
        "primaryCurrentTransformerRatio" : {TYPE : parseInt("0x1E", 16), SIZE : 2, MIN : 0, MAX : 9999,},
        "secondaryCurrentTransformerRatio" : {TYPE : parseInt("0x1F", 16), SIZE : 1, MIN : 0, MAX : 5,},
        "primaryVoltageTransformerRatio" : {TYPE : parseInt("0x20", 16), SIZE : 4, MIN : 30, MAX : 500000,},
        "secondaryVoltageTransformerRatio" : {TYPE : parseInt("0x21", 16), SIZE : 2, MIN : 30, MAX : 500,},
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
        activeEnergyImportL123T1 : "0x04",
        activeEnergyImportL123T2 : "0x05",
        activeEnergyExportL123T1 : "0x06",
        activeEnergyExportL123T2 : "0x07",
        reactiveEnergyImportL123T1 : "0x08",
        reactiveEnergyImportL123T2 : "0x09",
        reactiveEnergyExportL123T1 : "0x0A",
        reactiveEnergyExportL123T2 : "0x0B",
        voltageL1N : "0x0C",
        voltageL2N : "0x0D",
        voltageL3N : "0x0E",
        currentL123 : "0x0F",
        currentL1 : "0x10",
        currentL2 : "0x11",
        currentL3 : "0x12",
        activePowerL123 : "0x13",
        activePowerL1 : "0x14",
        activePowerL2 : "0x15",
        activePowerL3 : "0x16",
        reactivePowerL1 : "0x17",
        reactivePowerL2 : "0x18",
        reactivePowerL3 : "0x19",
        apparentPowerL1 : "0x1A",
        apparentPowerL2 : "0x1B",
        apparentPowerL3 : "0x1C",
        powerFactorL1 : "0x1D",
        powerFactorL2 : "0x1E",
        powerFactorL3 : "0x1F",
        phaseAngleL1 : "0x20",
        phaseAngleL2 : "0x21",
        phaseAngleL3 : "0x22",
        frequency : "0x23",
        totalSystemActivePower : "0x24",
        totalSystemReactivePower : "0x25",
        totalSystemApparentPower : "0x26",
        maximumL1CurrentDemand : "0x27",
        maximumL2CurrentDemand : "0x28",
        maximumL3CurrentDemand : "0x29",
        averagePower : "0x2A",
        midYearOfCertification : "0x2B",
        manufacturedYear : "0xF0",
        firmwareVersion : "0xF1",
        hardwareVersion : "0xF2",
    }
}

// Constants for downlink type (Config or Measure)
var CONFIG_DOWNLINK = {
    TYPE    : "Type",
    CONFIG  : "Config",
    MEASURE : "Measure",
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
            encoded[index] = CONFIG_DEVICE.CHANNEL;
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



