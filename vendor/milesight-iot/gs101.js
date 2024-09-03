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
 * @product GS101
 */
function Decoder(bytes, port) {
    return milesight(bytes);
}

function milesight(bytes) {
    var decoded = {};

    for (var i = 0; i < bytes.length; ) {
        var channel_id = bytes[i++];
        var channel_type = bytes[i++];
        //gas status
        if (channel_id === 0x05 && channel_type === 0x8e) {
            decoded.state = bytes[i] === 0 ? "normal" : "abnormal";
            i += 1;
        }
        //vale
        else if (channel_id === 0x06 && channel_type === 0x01) {
            decoded.valve = bytes[i] === 0 ? "close" : "open";
            i += 1;
        }
        //relay
        else if (channel_id === 0x07 && channel_type === 0x01) {
            decoded.relay = bytes[i] === 0 ? "close" : "open";
            i += 1;
        }
        //remained life time for the sensor
        else if (channel_id === 0x08 && channel_type === 0x90) {
            decoded.life_remain = readUInt32LE(bytes.slice(i, i + 4)) + "s";
            i += 4;
        }
        //alarm info
        else if (channel_id === 0xff && channel_type === 0x3f) {
            var alarm_type = bytes[i];
            switch (alarm_type) {
                case 0:
                    decoded.alarm = "power down";
                    i += 1;
                    break;
                case 1:
                    decoded.alarm = "power on";
                    i += 1;
                    break;
                case 2:
                    decoded.alarm = "sensor failure";
                    i += 1;
                    break;
                case 3:
                    decoded.alarm = "sensor recover";
                    i += 1;
                    break;
                case 4:
                    decoded.alarm = "sensor about to fail";
                    i += 1;
                    break;
                case 5:
                    decoded.alarm = "sensor failed";
                    i += 1;
                    break;
            }
        } else {
            break;
        }
    }

    return decoded;
}

/* ******************************************
 * bytes to number
 ********************************************/
function readUInt32LE(bytes) {
    var value = (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
    return (value & 0xffffffff) >>> 0;
}
