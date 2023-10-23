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
 * Copyright 2023 Milesight IoT
 *
 * @product EM320-TILT
 */
function Decoder(bytes, port) {
    return milesight(bytes);
}

function milesight(bytes) {
    var decoded = {};

    for (var i = 0; i < bytes.length;) {
        var channel_id = bytes[i++];
        var channel_type = bytes[i++];

        // BATTERY
        if (channel_id === 0x01 && channel_type === 0x75) {
            decoded.battery = bytes[i];
            i += 1;
        }
        // ANGLE
        else if (channel_id === 0x03 && channel_type === 0xd4) {
            decoded.angle_x = (readInt16LE(bytes.slice(i, i + 2)) >> 1) / 100;
            decoded.angle_y = (readInt16LE(bytes.slice(i + 2, i + 4)) >> 1) / 100;
            decoded.angle_z = (readInt16LE(bytes.slice(i + 4, i + 6)) >> 1) / 100;
            decoded.threshold_x = (bytes[i] & 0x01) === 0x01 ? "trigger" : "normal";
            decoded.threshold_y = (bytes[i + 2] & 0x01) === 0x01 ? "trigger" : "normal";
            decoded.threshold_z = (bytes[i + 4] & 0x01) === 0x01 ? "trigger" : "normal";
            i += 6;
        } else {
            break;
        }
    }

    return decoded;
}

/* ******************************************
 * bytes to number
 ********************************************/
function readUInt16LE(bytes) {
    var value = (bytes[1] << 8) + bytes[0];
    return value & 0xffff;
}

function readInt16LE(bytes) {
    var ref = readUInt16LE(bytes);
    return ref > 0x7fff ? ref - 0x10000 : ref;
}
