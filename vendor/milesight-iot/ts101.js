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
 * @product TS101
 */
function Decoder(bytes, port) {
    return milesight(bytes);
}

function milesight(bytes) {
    var decoded = {};

    for (var i = 0; i < bytes.length; ) {
        var channel_id = bytes[i++];
        var channel_type = bytes[i++];
        // battery
        if (channel_id === 0x01 && channel_type === 0x75) {
            decoded.battery = bytes[i];
            i += 1;
        }
        // temperature
        else if (channel_id === 0x03 && channel_type === 0x67) {
            decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
            i += 2;
        }
        // temperature threshold alert
        else if (channel_id === 0x83 && channel_type === 0x67) {
            decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
            decoded.temperature_alert = readAlertType(bytes[i + 2]);
            i += 3;
        }
        // temperature mutation alert
        else if (channel_id === 0x93 && channel_type === 0xd7) {
            decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
            decoded.temperature_change = readInt16LE(bytes.slice(i + 2, i + 4)) / 100;
            decoded.temperature_alert = readAlertType(bytes[i + 4]);
            i += 5;
        }
        // temperature history
        else if (channel_id === 0x20 && channel_type === 0xce) {
            if (decoded.history == undefined) {
                decoded.history = [];
            }
            var item = {};
            item.timestamp = readUInt32LE(bytes.slice(i, i + 4));
            item.temperature = readInt16LE(bytes.slice(i + 4, i + 6)) / 10;
            decoded.history.push(item);
            i += 6;
        } else {
            break;
        }
    }

    return decoded;
}

function readUInt16LE(bytes) {
    var value = (bytes[1] << 8) + bytes[0];
    return value & 0xffff;
}

function readInt16LE(bytes) {
    var ref = readUInt16LE(bytes);
    return ref > 0x7fff ? ref - 0x10000 : ref;
}

function readUInt32LE(bytes) {
    var value = (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
    return (value & 0xffffffff) >>> 0;
}

function readAlertType(type) {
    switch (type) {
        case 0:
            return "normal";
        case 1:
            return "threshold";
        case 2:
            return "mutation";
        default:
            return "unkown";
    }
}
