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
        case 19:
            return {
                // Decoded data
                data: {
                    balanceCounter: ((input.bytes[5] << 8) + input.bytes[6]),
                    inCounter: ((input.bytes[7] << 8) + input.bytes[8]),
                    outCounter: ((input.bytes[9] << 8) + input.bytes[10]),
                    alarmBalance: input.bytes[11] >> 4,
                    alarmIn: input.bytes[11] & 0x0F,
                    alarmOut: input.bytes[12] >> 4,
                    alarmBattery: input.bytes[12] & 0x0F,
                    volt: ((input.bytes[13] << 8) + input.bytes[14]),
                    errorCode: input.bytes[15],
                    frameCounter: (input.bytes[16] << 8) + input.bytes[17],
                },
            };
        case 18:
            return {
                // Decoded data
                data: {
                    firmware: input.bytes[5] + "." + input.bytes[6],
                    uploadInterval: input.bytes[7],
                    originalBalance: (input.bytes[8] << 8) + input.bytes[9],
                    balanceThreshold: (input.bytes[10] << 8) + input.bytes[11],
                    inThreshold: (input.bytes[12] << 8) + input.bytes[13],
                    outThreshold: (input.bytes[14] << 8) + input.bytes[15],
                    batteryThreshold: input.bytes[16]

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
    if (input.data.uploadInterval !== null && !isNaN(input.data.uploadInterval)) {
        var uploadInterval = input.data.uploadInterval;
        var uploadInterval_high = uploadInterval.toString(16).padStart(2, '0').toUpperCase()[0].charCodeAt(0);
        var uploadInterval_low = uploadInterval.toString(16).padStart(2, '0').toUpperCase()[1].charCodeAt(0);
        if (uploadInterval > 168 || uploadInterval < 1) {
            return {
                errors: ['upload interval range 1-168 hours.'],
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
    if (input.data.originalBalance !== null && !isNaN(input.data.originalBalance)) {
        var originalBalance = input.data.originalBalance;
        var originalBalance_1st = originalBalance.toString(16).padStart(4, '0').toUpperCase()[0].charCodeAt(0);
        var originalBalance_2nd = originalBalance.toString(16).padStart(4, '0').toUpperCase()[1].charCodeAt(0);
        var originalBalance_3rd = originalBalance.toString(16).padStart(4, '0').toUpperCase()[2].charCodeAt(0);
        var originalBalance_4th = originalBalance.toString(16).padStart(4, '0').toUpperCase()[3].charCodeAt(0);
        if (originalBalance > 65535 || originalBalance < 1) {
            return {
                errors: ['original balance range 1-65535.'],
            };
        } else {
            return {
                // LoRaWAN FPort used for the downlink message
                fPort: 3,
                // Encoded bytes
                bytes: [0x38, 0x30, 0x30, 0x32, 0x39, 0x39, 0x39, 0x39, 0x30, 0x41, originalBalance_1st, originalBalance_2nd, originalBalance_3rd, originalBalance_4th, 0x38, 0x31],
            };
        }
    }
    if (input.data.balanceThreshold !== null && !isNaN(input.data.balanceThreshold)) {
        var balanceThreshold = input.data.balanceThreshold;
        var balanceThreshold_1st = balanceThreshold.toString(16).padStart(4, '0').toUpperCase()[0].charCodeAt(0);
        var balanceThreshold_2nd = balanceThreshold.toString(16).padStart(4, '0').toUpperCase()[1].charCodeAt(0);
        var balanceThreshold_3rd = balanceThreshold.toString(16).padStart(4, '0').toUpperCase()[2].charCodeAt(0);
        var balanceThreshold_4th = balanceThreshold.toString(16).padStart(4, '0').toUpperCase()[3].charCodeAt(0);
        if (balanceThreshold > 65535 || balanceThreshold < 1) {
            return {
                errors: ['balance threshold range 1-65535.'],
            };
        } else {
            return {
                // LoRaWAN FPort used for the downlink message
                fPort: 3,
                // Encoded bytes
                bytes: [0x38, 0x30, 0x30, 0x32, 0x39, 0x39, 0x39, 0x39, 0x30, 0x32, balanceThreshold_1st, balanceThreshold_2nd, balanceThreshold_3rd, balanceThreshold_4th, 0x38, 0x31],
            };
        }
    }
    if (input.data.inThreshold !== null && !isNaN(input.data.inThreshold)) {
        var inThreshold = input.data.inThreshold;
        var inThreshold_1st = inThreshold.toString(16).padStart(4, '0').toUpperCase()[0].charCodeAt(0);
        var inThreshold_2nd = inThreshold.toString(16).padStart(4, '0').toUpperCase()[1].charCodeAt(0);
        var inThreshold_3rd = inThreshold.toString(16).padStart(4, '0').toUpperCase()[2].charCodeAt(0);
        var inThreshold_4th = inThreshold.toString(16).padStart(4, '0').toUpperCase()[3].charCodeAt(0);
        if (inThreshold > 65535 || inThreshold < 1) {
            return {
                errors: ['In threshold range 1-65535.'],
            };
        } else {
            return {
                // LoRaWAN FPort used for the downlink message
                fPort: 3,
                // Encoded bytes
                bytes: [0x38, 0x30, 0x30, 0x32, 0x39, 0x39, 0x39, 0x39, 0x30, 0x33, inThreshold_1st, inThreshold_2nd, inThreshold_3rd, inThreshold_4th, 0x38, 0x31],
            };
        }
    }
    if (input.data.outThreshold !== null && !isNaN(input.data.outThreshold)) {
        var outThreshold = input.data.outThreshold;
        var outThreshold_1st = outThreshold.toString(16).padStart(4, '0').toUpperCase()[0].charCodeAt(0);
        var outThreshold_2nd = outThreshold.toString(16).padStart(4, '0').toUpperCase()[1].charCodeAt(0);
        var outThreshold_3rd = outThreshold.toString(16).padStart(4, '0').toUpperCase()[2].charCodeAt(0);
        var outThreshold_4th = outThreshold.toString(16).padStart(4, '0').toUpperCase()[3].charCodeAt(0);
        if (outThreshold > 65535 || outThreshold < 1) {
            return {
                errors: ['In threshold range 1-65535.'],
            };
        } else {
            return {
                // LoRaWAN FPort used for the downlink message
                fPort: 3,
                // Encoded bytes
                bytes: [0x38, 0x30, 0x30, 0x32, 0x39, 0x39, 0x39, 0x39, 0x30, 0x34, outThreshold_1st, outThreshold_2nd, outThreshold_3rd, outThreshold_4th, 0x38, 0x31],
            };
        }
    }
    if (input.data.batteryThreshold !== null && !isNaN(input.data.batteryThreshold)) {
        var batteryThreshold = input.data.batteryThreshold;
        var batteryThreshold_high = batteryThreshold.toString(16).padStart(2, '0').toUpperCase()[0].charCodeAt(0);
        var batteryThreshold_low = batteryThreshold.toString(16).padStart(2, '0').toUpperCase()[1].charCodeAt(0);
        if (batteryThreshold > 99 || batteryThreshold < 5) {
            return {
                errors: ['battery alarm threshold range 5-99.'],
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
    if (input_length == 16)
        var value = parseInt(String.fromCharCode(input.bytes[10]) + String.fromCharCode(input.bytes[11]) + String.fromCharCode(input.bytes[12]) + String.fromCharCode(input.bytes[13]), 16);
    else
        var value = parseInt(String.fromCharCode(input.bytes[10]) + String.fromCharCode(input.bytes[11]), 16);
    switch (option) {
        case 1:
            return {
                data: {
                    uploadInterval: value,
                },
            };
        case 2:
            return {
                data: {
                    balanceThreshold: value,
                },
            };
        case 3:
            return {
                data: {
                    inThreshold: value,
                },
            };
        case 4:
            return {
                data: {
                    outThreshold: value,
                },
            };
        case 5:
            return {
                data: {
                    batteryThreshold: value,
                },
            };
        case 10:
            return {
                data: {
                    originalBalance: value,
                },
            };

        default:
            return {
                errors: ['invalid parameter key.'],
            };
    }
}