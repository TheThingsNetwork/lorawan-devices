
// Version Control
var VERSION_CONTROL = {
    CODEC : {VERSION: "1.0.0", NAME: "codecVersion"},
    DEVICE: {MODEL : "OTM", NAME: "genericModel"},
    PRODUCT: {CODE : "P1002004", NAME: "productCode"},
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
var FLAG_MASTER_STATUS = {NAME : "masterStatus", 
    FLAGS : [
        {NAME : "centralHeating" , false: "disabled", true: "enabled"},
        {NAME : "domesticHotWater" , false: "disabled", true: "enabled"},
        {NAME : "cooling" , false: "disabled", true: "enabled"},
        {NAME : "outsideTemperatureCompensation" , false: "disabled", true: "enabled"},
        {NAME : "centralHeating2" , false: "disabled", true: "enabled"}
    ]
}
var FLAG_SLAVE_STATUS = {NAME : "slaveStatus", 
    FLAGS : [
        {NAME : "faultIndication" , false: "no fault", true: "fault"},
        {NAME : "centralHeatingMode" , false: "inactive", true: "active"},
        {NAME : "domesticHotWaterMode" , false: "inactive", true: "active"},
        {NAME : "flame" , false: "inactive", true: "active"},
        {NAME : "coolingMode" , false: "inactive", true: "active"},
        {NAME : "centralHeating2Mode" , false: "inactive", true: "active"},
        {NAME : "diagnosticIndication" , false: "no diagnostics", true: "diagnostic event"}
    ]
}

var FLAG_SLAVE_CONFIG = {NAME : "slaveConfigurationFlags", 
    FLAGS : [
        {NAME : "domesticHotWaterPresence" , false: "not present", true: "present"},
        {NAME : "controlType" , false: "modulating", true: "on/off"},
        {NAME : "coolingConfig" , false: "not supported", true: "supported"},
        {NAME : "domesticHotWaterConfig" , false: "instantaneous or not-specified", true: "storage tank"},
        {NAME : "pumpControlFunction" , false: "allowed", true: "not allowed"},
        {NAME : "centralHeating2Presence" , false: "not present", true: "present"}
    ]
}

var FLAG_APP_FAULT = {NAME : "applicationSpecificFaultFlags", 
    FLAGS : [
        {NAME : "serviceRequest" , false: "not required", true: "required"},
        {NAME : "remoteReset" , false: "disabled", true: "enabled"},
        {NAME : "lowWaterPressure" , false: "no fault", true: "fault"},
        {NAME : "gasOrFlame" , false: "no fault", true: "fault"},
        {NAME : "airPressure" , false: "no fault", true: "fault"},
        {NAME : "waterOverTemperature" , false: "no fault", true: "fault"}
    ]
}

var FLAG_REMOTE_PARAM_XFER = {NAME : "remoteParameterTransferFlags", 
    FLAGS : [
        {NAME : "domesticHotWaterSetpoint" , false: "disabled", true: "enabled"},
        {NAME : "dentralHeatingSetpointMaximum" , false: "disabled", true: "enabled"}
    ]
}

var FLAG_REMOTE_PARAM_RW = {NAME : "remoteParameterReadOrWriteFlags", 
    FLAGS : [
        {NAME : "domesticHotWaterSetpoint" , false: "read-only", true: "read/write"},
        {NAME : "centralHeatingSetpointMaximum" , false: "read-only", true: "read/write"}
    ]
}

var FLAG_REMOTE_OVERRIDE_FUNCTION = {NAME : "remoteOverrideFunction", 
    FLAGS : [
        {NAME : "manualChangePriority" , false: "disabled", true: "enabled"},
        {NAME : "programChangePriority" , false: "disabled", true: "enabled"}
    ]
}

var REMOTE_COMMAND = {
    HIGH_BYTE : {NAME: "commandCode", VALUES: {"0x01" : "BoilerReset", "0x02" : "CentralHeatingWaterFilling"}},
    LOW_BYTE : {NAME: "responseCode", CENTER: 128}
}

// Configuration constants for opentherm data
 var CONFIG_OPENTHERM = {
    CHANNEL  : parseInt("0xDD", 16),
    FPORT_MIN : 1,
    FPORT_MAX : 5,
    DATAPOINT_UNAVAILABLE : parseInt("0x00", 16),
    DATAPOINT_AVAILABLE_REFRESHED : parseInt("0xAA", 16),
    DATAPOINT_AVAILABLE_NOT_REFRESHED : parseInt("0xAB", 16),
    TYPES : {
        "0xFE" : {SIZE: 4, TYPE: "U32", NAME : "timestamp"},
        "0xFD" : {SIZE: 4, TYPE: "U32", NAME : "dataloggerTimestamp"},
        "0x00" : {TYPE: "F8F8", FLAG_HB: FLAG_MASTER_STATUS, FLAG_LB: FLAG_SLAVE_STATUS},
        "0x01" : {TYPE: "FLOAT", NAME : "controlSetpointTemperature"},
        "0x02" : {TYPE: "F8U8", FLAG_HB: null, NAME_LB: "masterMemberIdCode"},
        "0x03" : {TYPE: "F8U8", FLAG_HB: FLAG_SLAVE_CONFIG, NAME_LB: "slaveMemberIdCode"},
        "0x04" : {TYPE: "RCMD", NAME : "remoteCommand"},
        "0x05" : {TYPE: "F8U8", FLAG_HB: FLAG_APP_FAULT, NAME_LB: "equipmentManufacturerFaultCode"},
        "0x06" : {TYPE: "F8F8", FLAG_HB: FLAG_REMOTE_PARAM_XFER, FLAG_LB: FLAG_REMOTE_PARAM_RW},
        "0x07" : {TYPE: "FLOAT", NAME: "coolingControlSignalPercentage"},
        "0x08" : {TYPE: "FLOAT", NAME: "controlSetpointTemperature2"},
        "0x09" : {TYPE: "BOOL", NAME: "remoteOverrideRoomSetpoint"},
        "0x0A" : {TYPE: "U8U8", NAME_HB: "numberOfTransparentSlaveParameters", NAME_LB: null},
        "0x0B" : {TYPE: "INDEX", NAME: "transparentSlaveParameter"},
        "0x0C" : {TYPE: "U8U8", NAME_HB: "faultBufferSize", NAME_LB: null},
        "0x0D" : {TYPE: "INDEX", NAME: "faultHistoryBuffer"},
        "0x0E" : {TYPE: "FLOAT", NAME: "maximumRelativeModulationLevel"},
        "0x0F" : {TYPE: "U8U8", NAME_HB: "maximumBoilerCapacity", NAME_LB:"minimumModulationLevel"},
        "0x10" : {TYPE: "FLOAT", NAME: "roomSetpointTemperature"},
        "0x11" : {TYPE: "FLOAT", NAME: "relativeModulationLevel"},
        "0x12" : {TYPE: "FLOAT", NAME: "waterPressure"},
        "0x13" : {TYPE: "FLOAT", NAME: "domesticHotWaterFlowRate"},
        "0x14" : {TYPE: "TIME", NAME: "boilerTime"},
        "0x15" : {TYPE: "DATE", NAME: "calendarDate"},
        "0x16" : {TYPE: "U16",  NAME: "calendarYear"},
        "0x17" : {TYPE: "FLOAT", NAME: "roomSetpointTemperature2"},
        "0x18" : {TYPE: "FLOAT", NAME: "roomTemperature"},
        "0x19" : {TYPE: "FLOAT", NAME: "boilerFlowWaterTemperature"},
        "0x1A" : {TYPE: "FLOAT", NAME: "domesticHotWaterTemperature1"},
        "0x1B" : {TYPE: "FLOAT", NAME: "outsideTemperature"},
        "0x1C" : {TYPE: "FLOAT", NAME: "returnWaterTemperature"},
        "0x1D" : {TYPE: "FLOAT", NAME: "solarStorageTemperature"},
        "0x1E" : {TYPE: "FLOAT", NAME: "solarCollectorTemperature"},
        "0x1F" : {TYPE: "FLOAT", NAME: "flowWaterTemperature2"},
        "0x20" : {TYPE: "FLOAT", NAME: "domesticHotWaterTemperature2"},
        "0x21" : {TYPE: "S16",  NAME: "boilerExhaustTemperature"},
        "0x30" : {TYPE: "S8S8", NAME: "domesticHotWaterSetpointAdjustmentBounds",},
        "0x31" : {TYPE: "S8S8", NAME: "centralHeatingWaterMaximumSetpointAdjustmentBounds"},
        "0x32" : {TYPE: "S8S8", NAME: "outsideTemperatureCompensationHeatCurveRatioAdjustmentBounds"},
        "0x38" : {TYPE: "FLOAT", NAME: "domesticHotWaterSetpointTemperature"},
        "0x39" : {TYPE: "FLOAT", NAME: "centralHeatingWaterMaximumSetpointTemperature"},
        "0x3A" : {TYPE: "FLOAT", NAME: "outsideTemperatureCompensationHeatCurveRatio"},
        "0x64" : {TYPE: "F8U8", FLAG_HB: FLAG_REMOTE_OVERRIDE_FUNCTION, NAME_LB: null},
        "0x73" : {TYPE: "U16", NAME: "originalEquipmentManufacturerDiagnosticCode"},
        "0x74" : {TYPE: "U16", NAME: "numberOfStartsBurner"},
        "0x75" : {TYPE: "U16", NAME: "numberOfStartsCentralHeatingPump"},
        "0x76" : {TYPE: "U16", NAME: "numberOfStartsDomesticHotWaterPumpOrValve"},
        "0x77" : {TYPE: "U16", NAME: "numberOfStartsBurnerDuringDomesticHotWaterMode"},
        "0x78" : {TYPE: "U16", NAME: "numberOfHoursWhenBurnerOperating"},
        "0x79" : {TYPE: "U16", NAME: "numberOfHoursWhenCentralHeatingPumpOperating"},
        "0x7A" : {TYPE: "U16", NAME: "numberOfHoursWhenDomesticHotWaterPumpOrValveOperating"},
        "0x7B" : {TYPE: "U16", NAME: "numberOfHoursOfBurnerOperatingDuringDomesticHotWaterMode"},
        "0x7C" : {TYPE: "FLOAT", NAME: "masterOpenThermProtocolVersion"},
        "0x7D" : {TYPE: "FLOAT", NAME: "slaveOpenThermProtocolVersion"},
        "0x7E" : {TYPE: "U8U8", NAME_HB: "masterProductType", NAME_LB: "masterProductVersion"},
        "0x7F" : {TYPE: "U8U8", NAME_HB: "slaveProductType",  NAME_LB: "slaveProductVersion"},
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
        "0x00" : {SIZE: 1, NAME : "configurationAlarm",
            VALUES     : {
                "0x00" : "normal",
                "0x01" : "alarm triggered by No Boiler Setpoint Mode but the device is in Controller Mode",
                "0x02" : "alarm triggered by Outside Temperature",
                "0x03" : "alarm triggered by Dewpoint Offset Temperature ",
                "0x04" : "alarm triggered by Dewpoint Temperature ",
                "0x05" : "alarm triggered by Delta Room Temperature",
            },
        },
        "0x01" : {SIZE: 1, NAME : "boilerWatchdog",
            VALUES     : {
                "0x00" : "normal",
                "0x01" : "alarm",
            },
        },
        "0x02" : {SIZE : 1, NAME : "thermostatWatchdog",
            VALUES     : {
                "0x00" : "normal",
                "0x01" : "alarm",
            },
        }
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
        "0x12": {NAME: "adr", SIZE: 1, VALUES: {"0x00" : "disabled", "0x01" : "enabled",}},
        "0x13": {NAME: "sf", SIZE: 1, VALUES: {
                "0x00" : "SF12BW125",
                "0x01" : "SF11BW125",
                "0x02" : "SF10BW125",
                "0x03" : "SF9BW125",
                "0x04" : "SF8BW125",
                "0x05" : "SF7BW125",
                "0x06" : "SF7BW250",
            }
        },
        "0x64": {NAME : "watchdogThermostatTimeout", SIZE: 2, RESOLUTION: 1,},
        "0x65": {NAME : "watchdogBoilerTimeout", SIZE: 2, RESOLUTION: 1,},
        "0x66": {NAME : "deviceOperationMode", SIZE: 1, VALUES: {"0x00" : "normal", "0x01" : "controller",}},
        "0x67": {NAME : "boilerSetpointMode", SIZE: 1, VALUES: {
                "0x00" : "n/a",
                "0x01" : "MODE1",
                "0x02" : "MODE2",
                "0x03" : "MODE3",
                "0x04" : "MODE4",
            }
        },
        "0x70": {NAME : "realThermostat", SIZE: 1, VALUES: {"0x00" : "not present", "0x01" : "present",}},
        "0x71": {NAME : "boilerCentralHeating", SIZE: 1, VALUES: {"0x00" : "disabled", "0x01" : "enabled",}},
        "0x72": {NAME : "boilerDomesticHotWater", SIZE: 1, VALUES: {"0x00" : "disabled", "0x01" : "enabled",}},
        "0x73": {NAME : "boilerCooling", SIZE: 1, VALUES: {"0x00" : "disabled", "0x01" : "enabled",}},
        "0x74": {NAME : "boilerOutsideTemperatureCompensation", SIZE: 1, VALUES: {"0x00" : "disabled", "0x01" : "enabled",}},
        "0x75": {NAME : "boilerCentralHeating2", SIZE: 1, VALUES: {"0x00" : "disabled", "0x01" : "enabled",}},
        "0x95": {NAME : "outsideTemperature", SIZE: 2, RESOLUTION: 0.01,},
        "0x96": {NAME : "dewpointOffsetTemperature", SIZE: 2, RESOLUTION: 0.01,},
        "0x97": {NAME : "dewpointTemperature", SIZE: 2, RESOLUTION: 0.01,},
        "0x98": {NAME : "deltaRoomTemperature", SIZE: 2, RESOLUTION: 0.01,},
        "0x99": {NAME : "heatcurveMinimumTemperature", SIZE: 2, RESOLUTION: 0.01,},
        "0x9A": {NAME : "heatcurveMaximumTemperature", SIZE: 2, RESOLUTION: 0.01,},
        "0x9B": {NAME : "outsideTemperature1", SIZE: 2, RESOLUTION: 0.01,},
        "0x9C": {NAME : "supplyTemperature1", SIZE: 2, RESOLUTION: 0.01,},
        "0x9D": {NAME : "outsideTemperature2", SIZE: 2, RESOLUTION: 0.01,},
        "0x9E": {NAME : "supplyTemperature2", SIZE: 2, RESOLUTION: 0.01,},
        "0x9F": {NAME : "compensationFactorHigher", SIZE: 1, RESOLUTION: 1,},
        "0xA0": {NAME : "compensationFactorLower", SIZE: 1, RESOLUTION: 1,},
        "0xA1": {NAME : "compensationValueMinimum", SIZE: 1, RESOLUTION: 1,},
        "0xA2": {NAME : "compensationValueMaximum", SIZE: 1, RESOLUTION: 1,},
        "0xA3": {NAME : "calculatedHeatingCurveValue", SIZE: 2, RESOLUTION: 0.01,},
        "0xA4": {NAME : "calculatedSetpointBoiler", SIZE: 2, RESOLUTION: 0.01,},
        "0xA5": {NAME : "externalHeatDemand", SIZE: 2, RESOLUTION: 0.01,},
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
            decoded[CONFIG_OPENTHERM.INFO_NAME] = "Downlink command succeeded";

        } else if(bytes[0] == 1)
        {
            decoded[CONFIG_OPENTHERM.WARNING_NAME] = "Downlink command failed";
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
            if(channel != CONFIG_OPENTHERM.CHANNEL)
            {
                continue;
            }
            // Type of basic information
            type = "0x" + toEvenHEX(bytes[index].toString(16).toUpperCase());
            index = index + 1;
            var info = CONFIG_OPENTHERM.TYPES[type] ? CONFIG_OPENTHERM.TYPES[type] : null;
            if(info == null)
            {
                info = {TYPE: "UNKNOWN", NAME : "DataPointID"+parseInt(type)};
            }
            size = info.SIZE ? info.SIZE : 0;
            if(size == 0)
            {
                info.avaibility = bytes[index];
                index = index + 1;
                size = getSizeBasedOnAvailability(info.avaibility);
            }else
            {
                info.avaibility = CONFIG_OPENTHERM.DATAPOINT_AVAILABLE_REFRESHED;
            }
            // Decoding
            var values = {};
            if(info.avaibility == CONFIG_OPENTHERM.DATAPOINT_UNAVAILABLE && info.NAME)
            {
                values[info.NAME] = null;
            }
            switch (info.TYPE) 
            {
                case "U32":
                {
                    // always available
                    values[info.NAME] = getValueFromBytesBigEndianFormat(bytes, index, size);
                    break;
                }
                case "U16":
                case "S16":
                {
                    if(info.avaibility != CONFIG_OPENTHERM.DATAPOINT_UNAVAILABLE)
                    {
                        values[info.NAME] = getValueFromBytesBigEndianFormat(bytes, index, 2);
                        if(info.TYPE == "S16")
                        {
                            values[info.NAME] = getSignedIntegerFromInteger(values[info.NAME], 2);
                        }
                    }
                    break;
                }
                case "BOOL":
                {
                    if(info.avaibility != CONFIG_OPENTHERM.DATAPOINT_UNAVAILABLE)
                    {
                        values[info.NAME] = getValueFromBytesBigEndianFormat(bytes, index, 2);
                        if(values[info.NAME] == 0)
                        {
                            values[info.NAME] = false;
                        }else{
                            values[info.NAME] = true;
                        }
                    }
                    break;
                }
                case "FLOAT":
                {
                    if(info.avaibility != CONFIG_OPENTHERM.DATAPOINT_UNAVAILABLE)
                    {
                        values[info.NAME] = getValueFLOATFormat(bytes, index);
                    }
                    break;
                }
                case "F8F8":
                {
                    values = getValuesF8F8Format(bytes, index, info);
                    break;
                }
                case "F8U8":
                {
                    values = getValuesF8U8Format(bytes, index, info);
                    break;
                }
                case "U8U8":
                {
                    values = getValuesU8U8Format(bytes, index, info);
                    break;
                }
                case "S8S8":
                {
                    values = getValuesS8S8Format(bytes, index, info);
                    break;
                }
                case "TIME":
                {
                    values = getValuesTIMEFormat(bytes, index, info);
                    break;
                }
                case "DATE":
                {
                    values = getValuesDATEFormat(bytes, index, info);
                    break;
                }
                case "RCMD":
                {
                    values = getValuesRCMDFormat(bytes, index, info);
                    break;
                }
                case "INDEX":
                {
                    values = getValuesINDEXFormat(bytes, index, info);
                    break;
                }
                case "UNKNOWN":
                {
                    if(info.avaibility != CONFIG_OPENTHERM.DATAPOINT_UNAVAILABLE)
                    {
                        values[info.NAME] = "0x" + getDigitStringArrayEvenFormat(bytes, index, size).join("").toUpperCase();
                    }
                    break;
                }
                default:
                    break;
            }
            Object.keys(values).forEach( function(key) {
                decoded[key] = values[key];
            });
            index = index + size;
        
        }
    }catch(error)
    {
        decoded[CONFIG_OPENTHERM.ERROR_NAME] = error.message;
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
            var info = CONFIG_ALARM.TYPES[type];
            size = info.SIZE;
            // Decoding
            var value = 0;
            value = getValueFromBytesBigEndianFormat(bytes, index, size);
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
            var info = CONFIG_PARAMETER.TYPES[type];
            size = info.SIZE;
            // Decoding
            var value = 0;
            value = getValueFromBytesBigEndianFormat(bytes, index, size);
            value = getSignedIntegerFromInteger(value, info.SIZE);
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

function getBitValue(byte, indexOfBitInByte)
{
    var bitMask = 0x01 << indexOfBitInByte;
    if(byte & bitMask)
    {
        return true;
    }
    return false;
}

function getFlags(byte, info)
{
    var flags = {};
    var flag = {};
    for(var i=0; i<info.FLAGS.length; i=i+1)
    {
        flag = info.FLAGS[i];
        flags[flag.NAME] = flag[getBitValue(byte, i).toString()];
    }
    return flags;
}

function getValuesF8F8Format(bytes, index, info)
{
    var decoded = {};
    if(info.avaibility == CONFIG_OPENTHERM.DATAPOINT_UNAVAILABLE)
    {
        if(info.FLAG_HB)
        {
            decoded[info.FLAG_HB.NAME] = null;
        }
        if(info.FLAG_LB)
        {
            decoded[info.FLAG_LB.NAME] = null;
        }
    }else
    {
        if(info.FLAG_HB)
        {
            decoded[info.FLAG_HB.NAME] = getFlags(bytes[index], info.FLAG_HB);
        }
        if(info.FLAG_LB)
        {
            decoded[info.FLAG_LB.NAME] = getFlags(bytes[index+1], info.FLAG_LB);
        }
    }
    return decoded;
}

function getValuesF8U8Format(bytes, index, info)
{
    var decoded = {};
    if(info.avaibility == CONFIG_OPENTHERM.DATAPOINT_UNAVAILABLE)
    {
        if(info.FLAG_HB)
        {
            decoded[info.FLAG_HB.NAME] = null;
        }
        if(info.NAME_LB)
        {
            decoded[info.NAME_LB] = null;
        }
    }else
    {
        if(info.FLAG_HB)
        {
            decoded[info.FLAG_HB.NAME] = getFlags(bytes[index], info.FLAG_HB);
        }
        if(info.NAME_LB)
        {
            decoded[info.NAME_LB] = bytes[index+1];
        }
    }
    return decoded;
}

function getValuesU8U8Format(bytes, index, info)
{
    var decoded = {};
    if(info.avaibility == CONFIG_OPENTHERM.DATAPOINT_UNAVAILABLE)
    {
        decoded[info.NAME_HB] = null;
        decoded[info.NAME_LB] = null;
    }else
    {
        if(info.NAME_HB)
        {
            decoded[info.NAME_HB] = bytes[index];
        }
        if(info.NAME_LB)
        {
            decoded[info.NAME_LB] = bytes[index+1];
        }
    }
    return decoded;
}

function getValuesS8S8Format(bytes, index, info)
{
    var decoded = {};
    if(info.avaibility == CONFIG_OPENTHERM.DATAPOINT_UNAVAILABLE)
    {
        decoded[info.NAME] = null;
    }else
    {
        decoded[info.NAME] = {};
        decoded[info.NAME].UpperTemperature = getSignedIntegerFromInteger(bytes[index], 1);
        decoded[info.NAME].LowerTemperature = getSignedIntegerFromInteger(bytes[index+1], 1);
    }
    return decoded;
}

function getValuesTIMEFormat(bytes, index, info)
{
    var decoded = {};
    if(info.avaibility == CONFIG_OPENTHERM.DATAPOINT_UNAVAILABLE)
    {
        decoded[info.NAME] = null;
    }else
    {
        var hours = bytes[index]  & 0x1F;
        var minutes = bytes[index+1];
        decoded[info.NAME] = toEvenHEX(hours.toString(10))+ ":" + toEvenHEX(minutes.toString(10));
    }
    return decoded;
}

function getValuesDATEFormat(bytes, index, info)
{
    var decoded = {};
    if(info.avaibility == CONFIG_OPENTHERM.DATAPOINT_UNAVAILABLE)
    {
        decoded[info.NAME] = null;
    }else
    {
        decoded[info.NAME] = {};
        decoded[info.NAME].Month = getMonthName(bytes[index]);
        decoded[info.NAME].DayOfMonth = bytes[index+1];
    }
    return decoded;
}

function getValuesRCMDFormat(bytes, index, info)
{
    var decoded = {};
    if(info.avaibility == CONFIG_OPENTHERM.DATAPOINT_UNAVAILABLE)
    {
        decoded[info.NAME] = null;
    }else
    {
        decoded[info.NAME] = {};
        var value = "0x"+toEvenHEX(bytes[index].toString(16)).toUpperCase();
        if(!REMOTE_COMMAND.HIGH_BYTE.VALUES[value])
        {
            decoded[info.NAME] = null;
            return decoded;
        }
        decoded[info.NAME][REMOTE_COMMAND.HIGH_BYTE.NAME] = REMOTE_COMMAND.HIGH_BYTE.VALUES[value];
        if(bytes[index+1] < REMOTE_COMMAND.LOW_BYTE.CENTER)
        {
            decoded[info.NAME][REMOTE_COMMAND.LOW_BYTE.NAME] = "failed";
        }else
        {	
            decoded[info.NAME][REMOTE_COMMAND.LOW_BYTE.NAME] = "completed";
        }
    }
    return decoded;
}

function getValuesINDEXFormat(bytes, index, info)
{
    var decoded = {};
    if(info.avaibility == CONFIG_OPENTHERM.DATAPOINT_UNAVAILABLE)
    {
        decoded[info.NAME] = null;
    }else
    {
        decoded[info.NAME] = {};
        decoded[info.NAME].Index = bytes[index];
        decoded[info.NAME].Value = bytes[index+1];
    }
    return decoded;
}

function getValueFLOATFormat(bytes, index)
{
    var value = 0.0;
    value = value + getSignedIntegerFromInteger(bytes[index], 1);
    value = value + bytes[index + 1] / 256;
    return parseFloat(value.toFixed(2));
}

function getMonthName(month)
{
  switch(month)
  {
    case 1  : return "January";
    case 2  : return "February";
    case 3  : return "March";
    case 4  : return "April";
    case 5  : return "May";
    case 6  : return "June";
    case 7  : return "July";
    case 8  : return "August";
    case 9  : return "September";
    case 10 : return "October";
    case 11 : return "November";
    case 12 : return "December";
    default : return "unknown";
  }
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

function getSizeBasedOnChannel(bytes, index, channel)
{
    var size = 0;
    while(index + size < bytes.length && bytes[index + size] != channel)
    {
        size = size + 1;
    }
    return size;
}

function getSizeBasedOnAvailability(avaibility)
{
    if(avaibility == CONFIG_OPENTHERM.DATAPOINT_UNAVAILABLE)
    {
        return 0;
    }
    return 2;
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
    }else if(fPort >= CONFIG_OPENTHERM.FPORT_MIN && fPort <= CONFIG_OPENTHERM.FPORT_MAX)
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
        else if(obj[CONFIG_DOWNLINK.TYPE] == CONFIG_DOWNLINK.OPENTHERM)
        {
            return encodeOpenthermConfiguration(obj[CONFIG_DOWNLINK.OPENTHERM], variables);
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
    OPENTHERM : "Opentherm",
    READING : "Reading"
}

// Constants for device configuration 
var CONFIG_DEVICE = {
    PORT : 50,
    REGISTER_CHANNEL : parseInt("0xFF", 16),
    OPENTHERM_CHANNEL : parseInt("0xCC", 16),
    READING_TYPE : parseInt("0xCC", 16),
    DATA_MAX_SIZE : 9,
    REGISTERS : {
        "restart": {TYPE: parseInt("0x0B", 16), SIZE: 1, MIN: 1, MAX: 1, RIGHT:"WRITE_ONLY"},
        "adr": {TYPE: parseInt("0x12", 16), SIZE: 1, MIN: 0, MAX: 1,},
        "sf": {TYPE: parseInt("0x13", 16), SIZE: 1, MIN: 0, MAX: 6,},
        "watchdogThermostatTimeout": {TYPE : parseInt("0x64", 16), SIZE: 2, MIN: 1, MAX: 65535,},
        "watchdogBoilerTimeout": {TYPE : parseInt("0x65", 16), SIZE: 2, MIN: 1, MAX: 65535,},
        "deviceOperationMode": {TYPE : parseInt("0x66", 16), SIZE: 1, MIN: 0, MAX: 1,},
        "boilerSetpointMode": {TYPE : parseInt("0x67", 16), SIZE: 1, MIN: 0, MAX: 4,},
        "realThermostat": {TYPE : parseInt("0x70", 16), SIZE: 1, MIN: 0, MAX: 1,},
        "boilerCentralHeating": {TYPE : parseInt("0x71", 16), SIZE: 1, MIN: 0, MAX: 1,},
        "boilerDomesticHotWater": {TYPE : parseInt("0x72", 16), SIZE: 1, MIN: 0, MAX: 1,},
        "boilerCooling": {TYPE : parseInt("0x73", 16), SIZE: 1, MIN: 0, MAX: 1,},
        "boilerOutsideTemperatureCompensation": {TYPE : parseInt("0x74", 16), SIZE: 1, MIN: 0, MAX: 1,},
        "boilerCentralHeating2": {TYPE : parseInt("0x75", 16), SIZE: 1, MIN: 0, MAX: 1,},
        "outsideTemperature": {TYPE : parseInt("0x95", 16), SIZE: 2, MIN: -32768, MAX: 32767,},
        "dewpointOffsetTemperature": {TYPE : parseInt("0x96", 16), SIZE: 2, MIN: -32768, MAX: 32767,},
        "dewpointTemperature": {TYPE : parseInt("0x97", 16), SIZE: 2, MIN: -32768, MAX: 32767,},
        "deltaRoomTemperature": {TYPE : parseInt("0x98", 16), SIZE: 2, MIN: -32768, MAX: 32767,},
        "heatcurveMinimumTemperature": {TYPE : parseInt("0x99", 16), SIZE: 2, MIN: -32768, MAX: 32767,},
        "heatcurveMaximumTemperature": {TYPE : parseInt("0x9A", 16), SIZE: 2, MIN: -32768, MAX: 32767,},
        "outsideTemperature1": {TYPE : parseInt("0x9B", 16), SIZE: 2, MIN: -32768, MAX: 32767,},
        "supplyTemperature1": {TYPE : parseInt("0x9C", 16), SIZE: 2, MIN: -32768, MAX: 32767,},
        "outsideTemperature2": {TYPE : parseInt("0x9D", 16), SIZE: 2, MIN: -32768, MAX: 32767,},
        "supplyTemperature2": {TYPE : parseInt("0x9E", 16), SIZE: 2, MIN: -32768, MAX: 32767,},
        "compensationFactorHigher": {TYPE : parseInt("0x9F", 16), SIZE: 1, MIN: -128, MAX: 127,},
        "compensationFactorLower": {TYPE : parseInt("0xA0", 16), SIZE: 1, MIN: -128, MAX: 127,},
        "compensationValueMinimum": {TYPE : parseInt("0xA1", 16), SIZE: 1, MIN: -128, MAX: 127,},
        "compensationValueMaximum": {TYPE : parseInt("0xA2", 16), SIZE: 1, MIN: -128, MAX: 127,},
        "calculatedHeatingCurveValue": {TYPE : parseInt("0xA3", 16), SIZE: 2, MIN: -32768, MAX: 32767, RIGHT:"READ_ONLY"},
        "calculatedSetpointBoiler": {TYPE : parseInt("0xA4", 16), SIZE: 2, MIN: -32768, MAX: 32767,},
        "externalHeatDemand": {TYPE : parseInt("0xA5", 16), SIZE: 2, MIN: -32768, MAX: 32767,},
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
                    if(config.MAX != 65535)
                    {
                        value = value * 100;
                    }
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

function encodeOpenthermConfiguration(obj, variables)
{
    var encoded = []
    var index = 0;
    var firstType = parseInt("0x64", 16);
    var field = ["BufferInterval", "UplinkInterval", "Mode", "Status", "DataIds"];
    var fieldIndex = 0;
    var isFieldPresent = false;
    var value = 0;
    var dataIds = [];
    var dataId = 0;
    try 
    {
        // Encode BufferInterval, UplinkInterval, Mode, Status
        for(fieldIndex=0; fieldIndex<4; fieldIndex=fieldIndex+1)
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
            if((fieldIndex < 2 && value >= 1 && value <= 65535) || 
                (fieldIndex >= 2 && value >= 0 && value <= 1))
            {
                encoded[index] = CONFIG_DEVICE.OPENTHERM_CHANNEL;
                index = index + 1;
                encoded[index] = firstType + fieldIndex;
                index = index + 1;
                if(fieldIndex < 2) // 2 bytes encoded
                {
                    encoded[index] = (value >> 8) % 256;
                    index = index + 1;
                    encoded[index] = value % 256;
                    index = index + 1;
                }else  // 1 byte encoded
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
        // Encode dataIds
        isFieldPresent = false;
        if(field[fieldIndex] in obj)
        {
            isFieldPresent = true;
        }
        if(!isFieldPresent)
        {
            return [];  // error
        }
        dataIds = obj[field[fieldIndex]];
        if(dataIds.length < 0 || dataIds.length > CONFIG_DEVICE.DATA_MAX_SIZE)
        {
            return [];  // Error
        }
        encoded[index] = CONFIG_DEVICE.OPENTHERM_CHANNEL;
        index = index + 1;
        encoded[index] = firstType + fieldIndex;
        index = index + 1;
        var savedIndex = index;
        for(var i=0; i<dataIds.length; i=i+1)
        {
            dataId = dataIds[i];
            value = "0x" + toEvenHEX(dataId.toString(16).toUpperCase());
            if(value in CONFIG_OPENTHERM.TYPES)
            {
                encoded[index] = dataId;
                index = index + 1;
            }
        }
        if(savedIndex == index)
        {
            return [];  // error (dataIds not supported)
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



