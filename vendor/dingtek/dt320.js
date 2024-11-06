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
    switch (input.bytes.length) {
        case 18:
            return {
                // Decoded data
                data: {
                    level: (input.bytes[5] << 8) + input.bytes[6],
                    alarmLevel: Boolean(input.bytes[11] >> 4),
                    alarmBattery: Boolean(input.bytes[12] & 0x0f),
                    temperature: input.bytes[8],
                    volt: ((input.bytes[13] << 8) + input.bytes[14]) / 100,
                    frameCounter: (input.bytes[15] << 8) + input.bytes[16],
                },
            };
        case 12:
            return {
                // Decoded data
                data: {
                    firmware: input.bytes[5] + "." +input.bytes[6],
                    uploadInterval: input.bytes[7],
                    detectInterval: input.bytes[8],
                    levelThreshold: input.bytes[9],
                    workMode: input.bytes[10],
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
    if (input.data.levelThreshold != null && !isNaN(input.data.levelThreshold)) {
        var levelThreshold = input.data.levelThreshold;
        var levelThreshold_high = levelThreshold.toString(16).padStart(2, '0').toUpperCase()[0].charCodeAt(0);
        var levelThreshold_low = levelThreshold.toString(16).padStart(2, '0').toUpperCase()[1].charCodeAt(0);
        if (levelThreshold > 3 || levelThreshold < 1) {
            return {
                errors: ['Air quality alarm threshold range 1-3.'],
            };
        } else {
            return {
                // LoRaWAN FPort used for the downlink message
                fPort: 3,
                // Encoded bytes
                bytes: [0x38, 0x30, 0x30, 0x32, 0x39, 0x39, 0x39, 0x39, 0x30, 0x32, levelThreshold_high, levelThreshold_low, 0x38, 0x31],
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
        } else if(workMode === 1) {
            return {
                // LoRaWAN FPort used for the downlink message
                fPort: 3,
                // Encoded bytes
                bytes: [0x38, 0x30, 0x30, 0x32, 0x39, 0x39, 0x39, 0x39, 0x30, 0x39, 0x30, 0x36, 0x38, 0x31],
            };
        }else{
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
            return {
                data: {
                    levelThreshold: value,
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