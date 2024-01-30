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
 * @product VS330
 */
function Decoder(bytes, port) {
    return milesight(bytes);
}

function milesight(bytes) {
    var decoded = {};

    for (i = 0; i < bytes.length; ) {
        var channel_id = bytes[i++];
        var channel_type = bytes[i++];

        // BATTERY
        if (channel_id === 0x01 && channel_type === 0x75) {
            decoded.battery = bytes[i];
            i += 1;
        }
        // DISTANCE
        else if (channel_id === 0x02 && channel_type === 0x82) {
            decoded.distance = readUInt16LE(bytes.slice(i, i + 2));
            i += 2;
        }
        // OCCUPANCY
        else if (channel_id === 0x03 && channel_type === 0x8e) {
            decoded.occupancy = bytes[i] === 0 ? "vacant" : "occupied";
            i += 1;
        }
        // CALIBRATION
        else if (channel_id === 0x04 && channel_type === 0x8e) {
            decoded.calibration = bytes[i] === 0 ? "failed" : "success";
            i += 1;
        } else {
            break;
        }
    }

    return decoded;
}

// bytes to number
function readUInt16LE(bytes) {
    var value = (bytes[1] << 8) + bytes[0];
    return value & 0xffff;
}
