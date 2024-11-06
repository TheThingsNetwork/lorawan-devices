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
 * @product UC500 series
 */
function Decoder(bytes, port) {
    var decoded = {};

    for (i = 0; i < bytes.length;) {
        var channel_id = bytes[i++];
        var channel_type = bytes[i++];

        // BATTERY
        if (channel_id === 0x01 && channel_type === 0x75) {
            decoded.battery = bytes[i];
            i += 1;
        }
        // GPIO1
        else if (channel_id === 0x03 && channel_type !== 0xC8) {
            decoded.gpio_1 = bytes[i] === 0 ? "off" : "on";
            i += 1;
        }
        // GPIO2
        else if (channel_id === 0x04 && channel_type !== 0xC8) {
            decoded.gpio_2 = bytes[i] === 0 ? "off" : "on";
            i += 1;
        }
        // PULSE COUNTER 1
        else if (channel_id === 0x03 && channel_type === 0xc8) {
            decoded.pulse_count_1 = readUInt32LE(bytes.slice(i, i + 4));
            i += 4;
        }
        // PULSE COUNTER 2
        else if (channel_id === 0x04 && channel_type === 0xc8) {
            decoded.pulse_count_2 = readUInt32LE(bytes.slice(i, i + 4));
            i += 4;
        }
        // ADC 1
        else if (channel_id === 0x05) {
            decoded.analog_input_1 = {};
            decoded.analog_input_1_cur = readInt16LE(bytes.slice(i, i + 2)) / 100;
            decoded.analog_input_1_min = readInt16LE(bytes.slice(i + 2, i + 4)) / 100;
            decoded.analog_input_1_max = readInt16LE(bytes.slice(i + 4, i + 6)) / 100;
            decoded.analog_input_1_avg = readInt16LE(bytes.slice(i + 6, i + 8)) / 100;
            i += 8;
            continue;
        }
        // ADC 2
        else if (channel_id === 0x06) {
            decoded.analog_input_2 = {};
            decoded.analog_input_2_cur = readInt16LE(bytes.slice(i, i + 2)) / 100;
            decoded.analog_input_2_min = readInt16LE(bytes.slice(i + 2, i + 4)) / 100;
            decoded.analog_input_2_max = readInt16LE(bytes.slice(i + 4, i + 6)) / 100;
            decoded.analog_input_2_avg = readInt16LE(bytes.slice(i + 6, i + 8)) / 100;
            i += 8;
            continue;
        }
        // MODBUS
        else if (channel_id === 0xFF && channel_type === 0x0E) {
            var modbus_chn_id = bytes[i++] - 6;
            var package_type = bytes[i++];
            var data_type = package_type & 7;
            var date_length = package_type >> 3;
            decoded.modbus_channels = [];
            var perchannel = {};
            switch (data_type) {
                case 0:
                    perchannel['index'] = modbus_chn_id;
                    perchannel['reading'] = bytes[i] ? "on" : "off";
                    decoded.modbus_channels.push(perchannel);
                    i += 1;
                    break;
                case 1:
                    perchannel['index'] = modbus_chn_id;
                    perchannel['reading'] = bytes[i];
                    decoded.modbus_channels.push(perchannel);
                    i += 1;
                    break;
                case 2:
                case 3:
                    perchannel['index'] = modbus_chn_id;
                    perchannel['reading'] = readUInt16LE(bytes.slice(i, i + 2));
                    decoded.modbus_channels.push(perchannel);
                    i += 2;
                    break;
                case 4:
                case 6:
                    perchannel['index'] = modbus_chn_id;
                    perchannel['reading'] = readUInt32LE(bytes.slice(i, i + 4));
                    decoded.modbus_channels.push(perchannel);
                    i += 4;
                    break;
                case 5:
                case 7:
                    perchannel['index'] = modbus_chn_id;
                    perchannel['reading'] = readFloatLE(bytes.slice(i, i + 4));
                    decoded.modbus_channels.push(perchannel);
                    i += 4;
                    break;
            }
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
