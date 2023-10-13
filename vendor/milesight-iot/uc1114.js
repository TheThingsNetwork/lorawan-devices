function decodeUplink(input) {
    var res = Decoder(input.bytes, input.fPort);
    if (res.error) {
        return {
            errors: [res.error],
        };
    }
    return {
        data: res,
    };
}
/**
 * Payload Decoder for The Things Network
 * 
 * Copyright 2021 Milesight IoT
 * 
 * @product UC11 series
 */
function Decoder(bytes, port) {
    var decoded = {};

    for (i = 0; i < bytes.length;) {
        var channel_id = bytes[i++];
        var channel_type = bytes[i++];

        // Digital Input 1
        if (channel_id === 0x01 && channel_type !== 0x00) {
            decoded.digital_input_1 = bytes[i] === 0 ? "off" : "on";
            i += 1;
        }
        // Digital Input 2
        else if (channel_id === 0x02 && channel_type !== 0x00) {
            decoded.digital_input_2 = bytes[i] === 0 ? "off" : "on";
            i += 1;
        }
        // Pulse Counter 1
        else if (channel_id === 0x01 && channel_type === 0xc8) {
            decoded.pulse_count_1 = readUInt32LE(bytes.slice(i, i + 4));
            i += 4;
        }
        // Pulse Counter 1
        else if (channel_id === 0x02 && channel_type === 0xc8) {
            decoded.pulse_count_2 = readUInt32LE(bytes.slice(i, i + 4));
            i += 4;
        }
        // Digital Output 1
        else if (channel_id === 0x09) {
            decoded.digital_output_1 = bytes[i] === 0 ? "off" : "on";
            i += 1;
        }
        // Digital Output 2
        else if (channel_id === 0x0a) {
            decoded.digital_output_2 = bytes[i] === 0 ? "off" : "on";
            i += 1;
        }
    }

    return decoded;
}

/* ******************************************
 * bytes to number
 ********************************************/
function readUInt8LE(bytes) {
    return (bytes & 0xFF);
}

function readInt8LE(bytes) {
    var ref = readUInt8LE(bytes);
    return (ref > 0x7F) ? ref - 0x100 : ref;
}

function readUInt16LE(bytes) {
    var value = (bytes[1] << 8) + bytes[0];
    return (value & 0xFFFF);
}

function readInt16LE(bytes) {
    var ref = readUInt16LE(bytes);
    return (ref > 0x7FFF) ? ref - 0x10000 : ref;
}

function readUInt32LE(bytes) {
    var value = (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
    return (value & 0xFFFFFFFF);
}

function readInt32LE(bytes) {
    var ref = readUInt32LE(bytes);
    return (ref > 0x7FFFFFFF) ? ref - 0x100000000 : ref;
}

function readFloatLE(bytes) {
    // JavaScript bitwise operators yield a 32 bits integer, not a float.
    // Assume LSB (least significant byte first).
    var bits = bytes[3] << 24 | bytes[2] << 16 | bytes[1] << 8 | bytes[0];
    var sign = (bits >>> 31 === 0) ? 1.0 : -1.0;
    var e = bits >>> 23 & 0xff;
    var m = (e === 0) ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
    var f = sign * m * Math.pow(2, e - 150);
    return f;
}
