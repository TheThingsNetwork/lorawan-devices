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
 * @product VS133
 */
function Decoder(bytes, port) {
    return milesight(bytes);
}

total_in_chns = [0x03, 0x06, 0x09, 0x0c];
total_out_chns = [0x04, 0x07, 0x0a, 0x0d];
period_chns = [0x05, 0x08, 0x0b, 0x0e];

function milesight(bytes) {
    var decoded = {};

    for (var i = 0; i < bytes.length; ) {
        var channel_id = bytes[i++];
        var channel_type = bytes[i++];

        // LINE TOTAL IN
        if (includes(total_in_chns, channel_id) && channel_type === 0xd2) {
            var channel_in_name = "line_" + ((channel_id - total_in_chns[0]) / 3 + 1);
            decoded[channel_in_name] = decoded[channel_in_name] || {};
            decoded[channel_in_name].total_in = readUInt32LE(bytes.slice(i, i + 4));
            i += 4;
        }
        // LINE TOTAL OUT
        else if (includes(total_out_chns, channel_id) && channel_type === 0xd2) {
            var channel_out_name = "line_" + ((channel_id - total_out_chns[0]) / 3 + 1);
            decoded[channel_out_name] = decoded[channel_out_name] || {};
            decoded[channel_out_name].total_out = readUInt32LE(bytes.slice(i, i + 4));
            i += 4;
        }
        // LINE PERIOD
        else if (includes(period_chns, channel_id) && channel_type === 0xcc) {
            var channel_period_name = "line_" + ((channel_id - period_chns[0]) / 3 + 1);
            decoded[channel_period_name] = decoded[channel_period_name] || {};
            decoded[channel_period_name].period_in = readUInt16LE(bytes.slice(i, i + 2));
            decoded[channel_period_name].period_out = readUInt16LE(bytes.slice(i + 2, i + 4));
            i += 4;
        } else {
            break;
        }
    }

    return decoded;
}

function readUInt8LE(bytes) {
    return bytes & 0xff;
}

function readUInt16LE(bytes) {
    var value = (bytes[1] << 8) + bytes[0];
    return value & 0xffff;
}

function readUInt32LE(bytes) {
    var value = (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
    return (value & 0xffffffff) >>> 0;
}

function includes(datas, value) {
    var size = datas.length;
    for (var i = 0; i < size; i++) {
        if (datas[i] == value) {
            return true;
        }
    }
    return false;
}
