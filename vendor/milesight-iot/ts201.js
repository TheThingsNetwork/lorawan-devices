/**
 * Payload Decoder
 *
 * Copyright 2024 Milesight IoT
 *
 * @product TS201
 */

function decodeUplink(input) {
    var decoded = milesightDeviceDecode(input.bytes);
    return { data: decoded };
}


function milesightDeviceDecode(bytes) {
    var decoded = {};

    for (var i = 0; i < bytes.length; ) {
        var channel_id = bytes[i++];
        var channel_type = bytes[i++];

        // IPSO VERSION
        if (channel_id === 0xff && channel_type === 0x01) {
            decoded.ipso_version = readProtocolVersion(bytes[i]);
            i += 1;
        }
        // HARDWARE VERSION
        else if (channel_id === 0xff && channel_type === 0x09) {
            decoded.hardware_version = readHardwareVersion(bytes.slice(i, i + 2));
            i += 2;
        }
        // FIRMWARE VERSION
        else if (channel_id === 0xff && channel_type === 0x0a) {
            decoded.firmware_version = readFirmwareVersion(bytes.slice(i, i + 2));
            i += 2;
        }
        // DEVICE STATUS
        else if (channel_id === 0xff && channel_type === 0x0b) {
            decoded.device_status = "on";
            i += 1;
        }
        // LORAWAN CLASS TYPE
        else if (channel_id === 0xff && channel_type === 0x0f) {
            decoded.lorawan_class = readLoRaWANType(bytes[i]);
            i += 1;
        }
        // SERIAL NUMBER
        else if (channel_id === 0xff && channel_type === 0x16) {
            decoded.sn = readSerialNumber(bytes.slice(i, i + 8));
            i += 8;
        }
        // TSL VERSION
        else if (channel_id === 0xff && channel_type === 0xff) {
            decoded.tsl_version = readTslVersion(bytes.slice(i, i + 2));
            i += 2;
        }
        // BATTERY
        else if (channel_id === 0x01 && channel_type === 0x75) {
            decoded.battery = bytes[i];
            i += 1;
        }
        // TEMPERATURE
        else if (channel_id === 0x03 && channel_type === 0x67) {
            decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
            i += 2;
        }
        // TEMPERATURE THRESHOLD ALARM
        else if (channel_id === 0x83 && channel_type === 0x67) {
            var data = {};
            data.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
            data.temperature_alarm = readAlarmType(bytes[i + 2]);
            i += 3;

            decoded.temperature = data.temperature;
            decoded.event = decoded.event || [];
            decoded.event.push(data);
        }
        // TEMPERATURE MUTATION ALARM
        else if (channel_id === 0x93 && channel_type === 0x67) {
            var data = {};
            data.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
            data.temperature_mutation = readInt16LE(bytes.slice(i + 2, i + 4)) / 10;
            data.temperature_alarm = readAlarmType(bytes[i + 4]);
            i += 5;

            decoded.temperature = data.temperature;
            decoded.event = decoded.event || [];
            decoded.event.push(data);
        }
        // TEMPERATURE ERROR
        else if (channel_id === 0xb3 && channel_type === 0x67) {
            var data = {};
            data.temperature_error = readErrorType(bytes[i]);
            i += 1;

            decoded.event = decoded.event || [];
            decoded.event.push(data);
        }
        // HISTORY DATA
        else if (channel_id === 0x20 && channel_type === 0xce) {
            var timestamp = readUInt32LE(bytes.slice(i, i + 4));
            var event = bytes[i + 4];
            var temperature = readInt16LE(bytes.slice(i + 5, i + 7)) / 10;
            i += 7;

            var read_status = readStatus((event >>> 4) & 0x0f);
            var event_type = readType(event & 0x0f);

            var data = {};
            data.timestamp = timestamp;
            data.read_status = read_status;
            data.event_type = event_type;
            data.temperature = temperature;

            decoded.history = decoded.history || [];
            decoded.history.push(data);
        } else {
            break;
        }
    }

    return decoded;
}

function readUInt8(bytes) {
    return bytes & 0xff;
}

function readInt8(bytes) {
    var ref = readUInt8(bytes);
    return ref > 0x7f ? ref - 0x100 : ref;
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

function readInt32LE(bytes) {
    var ref = readUInt32LE(bytes);
    return ref > 0x7fffffff ? ref - 0x100000000 : ref;
}

function readFloatLE(bytes) {
    var bits = (bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0];
    var sign = bits >>> 31 === 0 ? 1.0 : -1.0;
    var e = (bits >>> 23) & 0xff;
    var m = e === 0 ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
    var f = sign * m * Math.pow(2, e - 150);
    return f;
}

function readProtocolVersion(bytes) {
    var major = (bytes & 0xf0) >> 4;
    var minor = bytes & 0x0f;
    return "v" + major + "." + minor;
}

function readHardwareVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = (bytes[1] & 0xff) >> 4;
    return "v" + major + "." + minor;
}

function readFirmwareVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = bytes[1] & 0xff;
    return "v" + major + "." + minor;
}

function readTslVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = bytes[1] & 0xff;
    return "v" + major + "." + minor;
}

function readSerialNumber(bytes) {
    var temp = [];
    for (var idx = 0; idx < bytes.length; idx++) {
        temp.push(("0" + (bytes[idx] & 0xff).toString(16)).slice(-2));
    }
    return temp.join("");
}

function readLoRaWANType(type) {
    switch (type) {
        case 0x00:
            return "ClassA";
        case 0x01:
            return "ClassB";
        case 0x02:
            return "ClassC";
        case 0x03:
            return "ClassCtoB";
        default:
            return "Unknown";
    }
}

function readAlarmType(type) {
    switch (type) {
        case 0x00:
            return "Threshold Alarm Release";
        case 0x01:
            return "Threshold Alarm";
        case 0x02:
            return "Mutation Alarm";
        default:
            return "Unknown";
    }
}

function readErrorType(type) {
    switch (type) {
        case 0x00:
            return "Read Error";
        case 0x01:
            return "Overload";
        default:
            return "Unknown";
    }
}

function readHistoryEvent(type) {
    switch (type) {
        case 0x00:
            return "Time Update";
        case 0x01:
            return "Periodic";
        case 0x02:
            return "Alarm(Threshold or Mutation)";
        case 0x03:
            return "Alarm Release";
        case 0x04:
            return "Read Error";
        case 0x05:
            return "Overload";
        default:
            return "Unknown";
    }
}

function readStatus(type) {
    switch (type) {
        case 0x00:
            return "Success";
        case 0x01:
            return "Read Error";
        case 0x02:
            return "Overload";
        default:
            return "Unknown";
    }
}

function readType(type) {
    switch (type) {
        case 0x00:
            return "";
        case 0x01:
            return "Periodic";
        case 0x02:
            return "Alarm(Threshold or Mutation)";
        case 0x03:
            return "Alarm Release";
        default:
            return "Unknown";
    }
}
