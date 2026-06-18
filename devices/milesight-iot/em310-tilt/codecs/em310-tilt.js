/**
 * Payload Decoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product EM310-TILT
 */
var RAW_VALUE = 0x00;

/* eslint no-redeclare: "off" */
/* eslint-disable */
// Chirpstack v4
function decodeUplink(input) {
    var decoded = milesightDeviceDecode(input.bytes);
    return { data: decoded };
}

// Chirpstack v3
function Decode(fPort, bytes) {
    return milesightDeviceDecode(bytes);
}

// The Things Network
function Decoder(bytes, port) {
    return milesightDeviceDecode(bytes);
}
/* eslint-enable */

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
        // TSL VERSION
        else if (channel_id === 0xff && channel_type === 0xff) {
            decoded.tsl_version = readTslVersion(bytes.slice(i, i + 2));
            i += 2;
        }
        // SERIAL NUMBER
        else if (channel_id === 0xff && channel_type === 0x16) {
            decoded.sn = readSerialNumber(bytes.slice(i, i + 8));
            i += 8;
        }
        // LORAWAN CLASS TYPE
        else if (channel_id === 0xff && channel_type === 0x0f) {
            decoded.lorawan_class = readLoRaWANClass(bytes[i]);
            i += 1;
        }
        // RESET EVENT
        else if (channel_id === 0xff && channel_type === 0xfe) {
            decoded.reset_event = readResetEvent(1);
            i += 1;
        }
        // DEVICE STATUS
        else if (channel_id === 0xff && channel_type === 0x0b) {
            decoded.device_status = readDeviceStatus(1);
            i += 1;
        }

        // BATTERY
        else if (channel_id === 0x01 && channel_type === 0x75) {
            decoded.battery = readUInt8(bytes[i]);
            i += 1;
        }
        // ANGLE
        else if (channel_id === 0x03 && channel_type === 0xcf) {
            decoded.angle_x = readInt16LE(bytes.slice(i, i + 2)) / 100;
            decoded.angle_y = readInt16LE(bytes.slice(i + 2, i + 4)) / 100;
            decoded.angle_z = readInt16LE(bytes.slice(i + 4, i + 6)) / 100;
            var threshold_value = readUInt8(bytes[i + 6]);
            decoded.threshold_x = readAngleStatus((threshold_value >>> 0) & 0x01);
            decoded.threshold_y = readAngleStatus((threshold_value >>> 1) & 0x01);
            decoded.threshold_z = readAngleStatus((threshold_value >>> 2) & 0x01);
            i += 7;
        }
        // DOWNLINK RESPONSE
        else if (channel_id === 0xfe || channel_id === 0xff) {
            var result = handle_downlink_response(channel_type, bytes, i);
            decoded = Object.assign(decoded, result.data);
            i = result.offset;
        } else {
            break;
        }
    }

    return decoded;
}

function handle_downlink_response(channel_type, bytes, offset) {
    var decoded = {};

    switch (channel_type) {
        case 0x03:
            decoded.report_interval = readUInt16LE(bytes.slice(offset, offset + 2));
            offset += 2;
            break;
        case 0x06:
            var value = readUInt8(bytes[offset]);
            var condition_type = (value >>> 0) & 0x07;
            var alarm_type = (value >>> 3) & 0x07;
            var config = {};
            config.condition = readMathConditionType(condition_type);
            config.threshold_min = readInt16LE(bytes.slice(offset + 1, offset + 3)) / 100;
            config.threshold_max = readInt16LE(bytes.slice(offset + 3, offset + 5)) / 100;
            config.lock_time = readUInt16LE(bytes.slice(offset + 5, offset + 7));
            config.continue_time = readUInt16LE(bytes.slice(offset + 7, offset + 9));
            offset += 9;
            if (alarm_type === 0x01) {
                decoded.angle_x_alarm_config = config;
            } else if (alarm_type === 0x02) {
                decoded.angle_y_alarm_config = config;
            } else if (alarm_type === 0x03) {
                decoded.angle_z_alarm_config = config;
            }
            break;
        case 0x10:
            decoded.reboot = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x28:
            decoded.query_device_status = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x4a:
            decoded.sync_time = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x62:
            decoded.initial_surface = readInitialSurfaceType(bytes[offset]);
            offset += 1;
            break;
        case 0x63:
            decoded.angle_alarm_condition = readUtf8(bytes.slice(offset, offset + 8));
            offset += 8;
            break;
        default:
            throw new Error("unknown downlink response");
    }

    return { data: decoded, offset: offset };
}

function readProtocolVersion(bytes) {
    var major = (bytes & 0xf0) >> 4;
    var minor = bytes & 0x0f;
    return "v" + major + "." + minor;
}

function readHardwareVersion(bytes) {
    var major = (bytes[0] & 0xff).toString(16);
    var minor = (bytes[1] & 0xff) >> 4;
    return "v" + major + "." + minor;
}

function readFirmwareVersion(bytes) {
    var major = (bytes[0] & 0xff).toString(16);
    var minor = (bytes[1] & 0xff).toString(16);
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

function readLoRaWANClass(type) {
    var class_map = {
        0: "Class A",
        1: "Class B",
        2: "Class C",
        3: "Class CtoB",
    };
    return getValue(class_map, type);
}

function readResetEvent(status) {
    var status_map = { 0: "normal", 1: "reset" };
    return getValue(status_map, status);
}

function readDeviceStatus(status) {
    var status_map = { 0: "off", 1: "on" };
    return getValue(status_map, status);
}

function readAngleStatus(status) {
    var status_map = { 0: "normal", 1: "trigger" };
    return getValue(status_map, status);
}

function readMathConditionType(type) {
    var type_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside", 5: "mutation" };
    return getValue(type_map, type);
}

function readYesNoStatus(status) {
    var status_map = { 0: "no", 1: "yes" };
    return getValue(status_map, status);
}

function readInitialSurfaceType(type) {
    var type_map = { 255: "current_plane", 254: "reset_zero_reference_point", 253: "set_zero_calibration", 252: "clear_zero_calibration" };
    return getValue(type_map, type);
}

/* eslint-disable */
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
    return value & 0xffffffff;
}

function readUtf8(bytes) {
    var str = "";
    var i = 0;
    var byte1, byte2, byte3, byte4;
    while (i < bytes.length) {
        byte1 = bytes[i++];
        if (byte1 === 0x00) {
            break;
        }
        if (byte1 <= 0x7f) {
            str += String.fromCharCode(byte1);
        } else if (byte1 <= 0xdf) {
            byte2 = bytes[i++];
            str += String.fromCharCode(((byte1 & 0x1f) << 6) | (byte2 & 0x3f));
        } else if (byte1 <= 0xef) {
            byte2 = bytes[i++];
            byte3 = bytes[i++];
            str += String.fromCharCode(((byte1 & 0x0f) << 12) | ((byte2 & 0x3f) << 6) | (byte3 & 0x3f));
        } else if (byte1 <= 0xf7) {
            byte2 = bytes[i++];
            byte3 = bytes[i++];
            byte4 = bytes[i++];
            var codepoint = ((byte1 & 0x07) << 18) | ((byte2 & 0x3f) << 12) | ((byte3 & 0x3f) << 6) | (byte4 & 0x3f);
            codepoint -= 0x10000;
            str += String.fromCharCode((codepoint >> 10) + 0xd800);
            str += String.fromCharCode((codepoint & 0x3ff) + 0xdc00);
        }
    }
    return str;
}

function getValue(map, key) {
    if (RAW_VALUE) return key;

    var value = map[key];
    if (!value) value = "unknown";
    return value;
}

//if (!Object.assign) {
    Object.defineProperty(Object, "assign", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (target) {
            "use strict";
            if (target == null) {
                throw new TypeError("Cannot convert first argument to object");
            }

            var to = Object(target);
            for (var i = 1; i < arguments.length; i++) {
                var nextSource = arguments[i];
                if (nextSource == null) {
                    continue;
                }
                nextSource = Object(nextSource);

                var keysArray = Object.keys(Object(nextSource));
                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                    var nextKey = keysArray[nextIndex];
                    var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== undefined && desc.enumerable) {
                        // concat array
                        if (Array.isArray(to[nextKey]) && Array.isArray(nextSource[nextKey])) {
                            to[nextKey] = to[nextKey].concat(nextSource[nextKey]);
                        } else {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        },
    });
//}