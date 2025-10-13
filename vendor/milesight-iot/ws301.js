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
 * @product WS301
 */
function Decoder(bytes, port) {
    var decoded = {};

    for (var i = 0; i < bytes.length;) {
        var channel_id = bytes[i++];
        var channel_type = bytes[i++];
        // BATTERY
        if (channel_id === 0x01 && channel_type === 0x75) {
            decoded.battery = bytes[i];
            i += 1;
        }
        // DOOR / WINDOW STATE
        else if (channel_id === 0x03 && channel_type === 0x00) {
            decoded.door = bytes[i] === 0 ? "close" : "open";
            i += 1;
        }
        //
        else if (channel_id === 0x04 && channel_type === 0x00) {
            decoded.install = bytes[i] === 0 ? "yes" : "no";
            i += 1;
        } else {
            break;
        }
    }

    return decoded;
}


function normalizeUplink(input) {
    var data = {};

    if (input.data.door && (input.data.door === "close" || input.data.door === "open")) {
        data.action = {
            contactState: input.data.door === "close" ? "closed" : "open"
        };
    }

    if (input.data.battery) {
        data.battery = input.data.battery;
    }

    return { data: data };
}
