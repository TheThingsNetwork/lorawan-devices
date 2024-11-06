//IEEE754 hex to float convert
function hex2float(num) {
    var sign = num & 0x80000000 ? -1 : 1;
    var exponent = ((num >> 23) & 0xff) - 127;
    var mantissa = 1 + (num & 0x7fffff) / 0x7fffff;
    return sign * mantissa * Math.pow(2, exponent);
}

function decodeUplink(input) {
    if (input.fPort != 3) {
        return {
            errors: ['unknown FPort'],
        };
    }
    switch (input.bytes[3]) {
        case 1:
        case 2:
            var temp_sign = input.bytes[8];
            var temp_abs = (input.bytes[9] >> 4) * 10 + (input.bytes[9] & 0x0F) + (input.bytes[10] >> 4) / 10 + (input.bytes[10] & 0x0F) / 100;
            var humi_abs = (input.bytes[11] >> 4) * 10 + (input.bytes[11] & 0x0F) + (input.bytes[12] >> 4) / 10 + (input.bytes[12] & 0x0F) / 100;
            var temperature_temp=(temp_sign == 0 )? temp_abs : (0 - temp_abs);
            return {
                // Decoded data
                data: {
                    temperature: temperature_temp.toFixed(2),
                    humidity: humi_abs.toFixed(2),
                    alarmHighTemperature: (input.bytes[13] & 0x10) ? true : false,
                    alarmLowTemperature: (input.bytes[13] & 0x01) ? true : false,
                    alarmHighHumidity: (input.bytes[14] & 0x10) ? true : false,
                    alarmLowHumidity: (input.bytes[14] & 0x01) ? true : false,
                    alarmBattery: (input.bytes[7] & 0x01) ? true : false,
                    volt: ((input.bytes[5] << 8) + input.bytes[6]) / 100,
                    frameCounter: (input.bytes[15] << 8) + input.bytes[16],
                },
            };
        case 3:
            var high_temp_abs = input.bytes[10];
            var low_temp_abs = input.bytes[12];
            return {
                // Decoded data
                data: {
                    firmware: input.bytes[5] + "." + input.bytes[6],
                    uploadInterval: input.bytes[7],
                    detectInterval: input.bytes[8],
                    highTemperatureThreshold: input.bytes[9] ? 256 - high_temp_abs : high_temp_abs,
                    lowTemperatureThreshold: input.bytes[11] ? 0 - low_temp_abs : low_temp_abs,
                    highHumidityThreshold: input.bytes[13],
                    lowHumidityThreshold: input.bytes[14],
                    batteryThreshold: input.bytes[16],
                    workMode: input.bytes[15],
                },
            };
        default:
            return {
                errors: ['wrong length'],
            };
    }
}

// Encode downlink function.
//
// Input is an object with the following fields:
// - data = Object representing the payload that must be encoded.
// - variables = Object containing the configured device variables.
//
// Output must be an object with the following fields:
// - bytes = Byte array containing the downlink payload.
function encodeDownlink(input) {
    if (input.data.uploadInterval != null && !isNaN(input.data.uploadInterval)) {
        var uploadInterval = input.data.uploadInterval;
        var uploadInterval_high = uploadInterval.toString(16).padStart(2, '0').toUpperCase()[0].charCodeAt(0);        
        var uploadInterval_low = uploadInterval.toString(16).padStart(2, '0').toUpperCase()[1].charCodeAt(0);
        if (uploadInterval > 255 || uploadInterval < 1) {
            return {
                errors: ['upload interval range 1-255 hours.'],
            };
        } else {
            return {
                // LoRaWAN FPort used for the downlink message
                fPort: 3,
                // Encoded bytes
                bytes: [0x38, 0x30, 0x30, 0x32, 0x39, 0x39, 0x39, 0x39, 0x30, 0x31, uploadInterval_high, uploadInterval_low, 0x38, 0x31],
            };
        }
    }
    if (input.data.detectInterval != null && !isNaN(input.data.detectInterval)) {
        var detectInterval = input.data.detectInterval;
        var detectInterval_high = detectInterval.toString(16).padStart(2, '0').toUpperCase()[0].charCodeAt(0);
        var detectInterval_low = detectInterval.toString(16).padStart(2, '0').toUpperCase()[1].charCodeAt(0);
        if (detectInterval > 255 || detectInterval < 1) {
            return {
                errors: ['detection interval range 1-255 minutes.'],
            };
        } else {
            return {
                // LoRaWAN FPort used for the downlink message
                fPort: 3,
                // Encoded bytes
                bytes: [0x38, 0x30, 0x30, 0x32, 0x39, 0x39, 0x39, 0x39, 0x30, 0x38, detectInterval_high, detectInterval_low, 0x38, 0x31],
            };
        }
    }
    if (input.data.highTemperatureThreshold != null && !isNaN(input.data.highTemperatureThreshold)) {
        var highTemperatureThreshold = input.data.highTemperatureThreshold<0?0-input.data.highTemperatureThreshold:input.data.highTemperatureThreshold;
        var highTemperatureSign=input.data.highTemperatureThreshold<0?0x31:0x30;
        var highTemperatureThreshold_high = highTemperatureThreshold.toString(16).padStart(2, '0').toUpperCase()[0].charCodeAt(0);
        var highTemperatureThreshold_low = highTemperatureThreshold.toString(16).padStart(2, '0').toUpperCase()[1].charCodeAt(0);
        if (input.data.highTemperatureThreshold > 85 || input.data.highTemperatureThreshold < -30) {
            return {
                errors: ['High temperature alarm threshold range -30~+85.'],
            };
        } else {
            return {
                // LoRaWAN FPort used for the downlink message
                fPort: 3,
                // Encoded bytes
                bytes: [0x38, 0x30, 0x30, 0x32, 0x39, 0x39, 0x39, 0x39, 0x30, 0x32, 0x30,highTemperatureSign,highTemperatureThreshold_high, highTemperatureThreshold_low, 0x38, 0x31],
            };
        }
    }
    if (input.data.lowTemperatureThreshold != null && !isNaN(input.data.lowTemperatureThreshold)) {
        var lowTemperatureThreshold = input.data.lowTemperatureThreshold<0?0-input.data.lowTemperatureThreshold:input.data.lowTemperatureThreshold;
        var lowTemperatureSign=input.data.lowTemperatureThreshold<0?0x31:0x30;
        var lowTemperatureThreshold_high = lowTemperatureThreshold.toString(16).padStart(2, '0').toUpperCase()[0].charCodeAt(0);
        var lowTemperatureThreshold_low = lowTemperatureThreshold.toString(16).padStart(2, '0').toUpperCase()[1].charCodeAt(0);
        if (input.data.lowTemperatureThreshold > 85 || input.data.lowTemperatureThreshold < -30) {
            return {
                errors: ['Low temperature alarm threshold range -30~+85.'],
            };
        } else {
            return {
                // LoRaWAN FPort used for the downlink message
                fPort: 3,
                // Encoded bytes
                bytes: [0x38, 0x30, 0x30, 0x32, 0x39, 0x39, 0x39, 0x39, 0x30, 0x33, 0x30,lowTemperatureSign,lowTemperatureThreshold_high, lowTemperatureThreshold_low, 0x38, 0x31],
            };
        }
    }
   
    if (input.data.highHumidityThreshold != null && !isNaN(input.data.highHumidityThreshold)) {
        var highHumidityThreshold = input.data.highHumidityThreshold<0?0-input.data.highHumidityThreshold:input.data.highHumidityThreshold;       
        var highHumidityThreshold_high = highHumidityThreshold.toString(16).padStart(2, '0').toUpperCase()[0].charCodeAt(0);
        var highHumidityThreshold_low = highHumidityThreshold.toString(16).padStart(2, '0').toUpperCase()[1].charCodeAt(0);
        if (input.data.highHumidityThreshold > 100 || input.data.highHumidityThreshold < 0) {
            return {
                errors: ['High humidity alarm threshold range 0~100.'],
            };
        } else {
            return {
                // LoRaWAN FPort used for the downlink message
                fPort: 3,
                // Encoded bytes
                bytes: [0x38, 0x30, 0x30, 0x32, 0x39, 0x39, 0x39, 0x39, 0x30, 0x34, highHumidityThreshold_high, highHumidityThreshold_low, 0x38, 0x31],
            };
        }
    }
    if (input.data.lowHumidityThreshold != null && !isNaN(input.data.lowHumidityThreshold)) {
        var lowHumidityThreshold = input.data.lowHumidityThreshold<0?0-input.data.lowHumidityThreshold:input.data.lowHumidityThreshold;       
        var lowHumidityThreshold_high = lowHumidityThreshold.toString(16).padStart(2, '0').toUpperCase()[0].charCodeAt(0);
        var lowHumidityThreshold_low = lowHumidityThreshold.toString(16).padStart(2, '0').toUpperCase()[1].charCodeAt(0);
        if (input.data.lowHumidityThreshold > 100 || input.data.lowHumidityThreshold < 0) {
            return {
                errors: ['High humidity alarm threshold range 0~100.'],
            };
        } else {
            return {
                // LoRaWAN FPort used for the downlink message
                fPort: 3,
                // Encoded bytes
                bytes: [0x38, 0x30, 0x30, 0x32, 0x39, 0x39, 0x39, 0x39, 0x30, 0x45, lowHumidityThreshold_high, lowHumidityThreshold_low, 0x38, 0x31],
            };
        }
    }
    if (input.data.batteryThreshold != null && !isNaN(input.data.batteryThreshold)) {
        var batteryThreshold = input.data.batteryThreshold;
        var batteryThreshold_high = batteryThreshold.toString(16).padStart(2, '0').toUpperCase()[0].charCodeAt(0);
        var batteryThreshold_low = batteryThreshold.toString(16).padStart(2, '0').toUpperCase()[1].charCodeAt(0);
        if (batteryThreshold > 99 || batteryThreshold < 1) {
            return {
                errors: ['Battery alarm threshold range 1-99.'],
            };
        } else {
            return {
                // LoRaWAN FPort used for the downlink message
                fPort: 3,
                // Encoded bytes
                bytes: [0x38, 0x30, 0x30, 0x32, 0x39, 0x39, 0x39, 0x39, 0x30, 0x35, batteryThreshold_high, batteryThreshold_low, 0x38, 0x31],
            };
        }
    }

    if (input.data.workMode != null && !isNaN(input.data.workMode)) {
        var workMode = input.data.workMode;
        if (workMode === 0) {
            return {
                // LoRaWAN FPort used for the downlink message
                fPort: 3,
                // Encoded bytes
                bytes: [0x38, 0x30, 0x30, 0x32, 0x39, 0x39, 0x39, 0x39, 0x30, 0x39, 0x30, 0x35, 0x38, 0x31],
            };
        } else if (workMode === 1) {
            return {
                // LoRaWAN FPort used for the downlink message
                fPort: 3,
                // Encoded bytes
                bytes: [0x38, 0x30, 0x30, 0x32, 0x39, 0x39, 0x39, 0x39, 0x30, 0x39, 0x30, 0x36, 0x38, 0x31],
            };
        } else {
            return {
                errors: ['Work mode range 0-1.'],
            }
        }
    }
    return {
        errors: ['invalid downlink parameter.'],
    };
}

function decodeDownlink(input) {
    var input_length = input.bytes.length;
    if (input.fPort != 3) {
        return {
            errors: ['invalid FPort.'],
        };
    }

    if (
        input_length < 12 ||
        input.bytes[0] != 0x38 ||
        input.bytes[1] != 0x30 ||
        input.bytes[2] != 0x30 ||
        input.bytes[3] != 0x32 ||
        input.bytes[4] != 0x39 ||
        input.bytes[5] != 0x39 ||
        input.bytes[6] != 0x39 ||
        input.bytes[7] != 0x39 ||
        input.bytes[input_length - 2] != 0x38 ||
        input.bytes[input_length - 1] != 0x31
    ) {
        return {
            errors: ['invalid format.'],
        };
    }
    var option = parseInt(String.fromCharCode(input.bytes[8]) + String.fromCharCode(input.bytes[9]), 16);
    var value = parseInt(String.fromCharCode(input.bytes[10]) + String.fromCharCode(input.bytes[11]), 16);
    switch (option) {
        case 1:
            return {
                data: {
                    uploadInterval: value,
                },
            };
        case 8:
            return {
                data: {
                    detectInterval: value,
                },
            };
        case 2:
            var temp_abs = parseInt(String.fromCharCode(input.bytes[12]) + String.fromCharCode(input.bytes[13]), 16);
            return {
                data: {
                    highTemperatureThreshold: value > 0 ? 0 - temp_abs : temp_abs,
                },
            };
        case 3:
            var temp_abs = parseInt(String.fromCharCode(input.bytes[12]) + String.fromCharCode(input.bytes[13]), 16);
            return {
                data: {
                    lowTemperatureThreshold: value > 0 ? 0 - temp_abs : temp_abs,
                },
            };
        case 4:
            return {
                data: {
                    highHumidityThreshold: value,
                },
            };
        case 5:
            return {
                data: {
                    batteryThreshold: value,
                },
            };
        case 14:
            return {
                data: {
                    lowHumidityThreshold: value,
                },
            };
        case 9:
            switch (value) {
                case 0x05:
                    return {
                        data: {
                            workMode: 0,
                        },
                    };
                case 0x06:
                    return {
                        data: {
                            workMode: 1,
                        },
                    };
                default:
                    return {
                        errors: ['invalid parameter value.'],
                    };
            }
        default:
            return {
                errors: ['invalid parameter key.'],
            };
    }
}