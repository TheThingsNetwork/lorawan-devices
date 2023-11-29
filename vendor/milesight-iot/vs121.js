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
 * Copyright 2020 Milesight IoT
 *
 * @product VS121
 */
function Decoder(bytes, port) {
    var decoded = {};

    for (i = 0; i < bytes.length;) {
        var channel_id = bytes[i++];
        var channel_type = bytes[i++];

        // PEOPLE COUNTER
        if (channel_id === 0x04 && channel_type === 0xc9) {
            decoded.people_counter_all = bytes[i];
            decoded.region_count = bytes[i + 1];
            decoded.regions = [];
            var region = readUInt16BE(bytes.slice(i + 2, i + 4));
            for (var idx = 0; idx < decoded.region_count; idx++) {
                var block = {};
                block['index'] = idx;
                block['count'] = (region > idx) & 1;
                decoded.regions.push(block);
            }
            i += 4;
        } else {
            break;
        }
    }
    return decoded;
}

// bytes to number
function readUInt16BE(bytes) {
    var value = (bytes[0] << 8) + bytes[1];
    return value & 0xffff;
}

// bytes to version
function readVersion(bytes) {
    var temp = [];
    for (var idx = 0; idx < bytes.length; idx++) {
        temp.push((bytes[idx] & 0xff).toString(10));
    }
    return temp.join(".");
}

// bytes to string
function readString(bytes) {
    var temp = [];
    for (var idx = 0; idx < bytes.length; idx++) {
        temp.push(("0" + (bytes[idx] & 0xff).toString(16)).slice(-2));
    }
    return temp.join("");
}
