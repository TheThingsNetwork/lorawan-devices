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
 * Payload Decoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product VS370
 */
var RAW_VALUE = 0x00;

/* eslint no-redeclare: "off" */
/* eslint-disable */


// The Things Network
function Decoder(bytes, port) {
    return milesightDeviceDecode(bytes);
}
/* eslint-enable */

function milesightDeviceDecode(bytes) {
    var decoded = {};

    for (var i = 0; i < bytes.length;) {
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
        // OCCUPANCY
        else if (channel_id === 0x03 && channel_type === 0x00) {
            decoded.occupancy = readOccupancyStatus(readUInt8(bytes[i]));
            i += 1;
        }
        // ILLUMINANCE
        else if (channel_id === 0x04 && channel_type === 0x00) {
            decoded.illuminance = readIlluminanceStatus(readUInt8(bytes[i]));
            i += 1;
        }
        // DOWNLINK RESPONSE
        else if (channel_id === 0xfe || channel_id === 0xff) {
            var result = handle_downlink_response(channel_type, bytes, i);
            decoded = Object.assign(decoded, result.data);
            i = result.offset;
        } else if (channel_id === 0xf8 || channel_id === 0xf9) {
            var result = handle_downlink_response_ext(channel_id, channel_type, bytes, i);
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
        case 0x10:
            decoded.reboot = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x28:
            decoded.report_status = readReportType(bytes[offset]);
            offset += 1;
            break;
        case 0x35:
            decoded.d2d_key = readHexString(bytes.slice(offset, offset + 8));
            offset += 8;
            break;
        case 0x4a:
            decoded.sync_time = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x84:
            decoded.d2d_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x8e:
            // ignore the first byte
            decoded.report_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            offset += 3;
            break;
        case 0x8f:
            decoded.bluetooth_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x96:
            var d2d_master_config = readD2DMasterConfig(bytes.slice(offset, offset + 8));
            offset += 8;
            decoded.d2d_master_config = decoded.d2d_master_config || [];
            decoded.d2d_master_config.push(d2d_master_config);
            break;
        case 0xba:
            decoded.dst_config = readDstConfig(bytes.slice(offset, offset + 10));
            offset += 10;
            break;
        case 0xbd:
            decoded.time_zone = readTimeZone(readInt16LE(bytes.slice(offset, offset + 2)));
            offset += 2;
            break;
        default:
            throw new Error("unknown downlink response");
    }

    return { data: decoded, offset: offset };
}

function handle_downlink_response_ext(code, channel_type, bytes, offset) {
    var decoded = {};

    switch (channel_type) {
        case 0x3e:
            decoded.pir_sensitivity = readPirSensitivity(bytes[offset]);
            offset += 1;
            break;
        case 0x3f:
            decoded.radar_sensitivity = readRadarSensitivity(bytes[offset]);
            offset += 1;
            break;
        case 0x40:
            decoded.pir_idle_interval = readUInt8(bytes[offset]);
            offset += 1;
            break;
        case 0x41:
            decoded.pir_illuminance_threshold = {};
            decoded.pir_illuminance_threshold.enable = readEnableStatus(bytes[offset]);
            decoded.pir_illuminance_threshold.upper_limit = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            decoded.pir_illuminance_threshold.lower_limit = readUInt16LE(bytes.slice(offset + 3, offset + 5));
            offset += 5;
            break;
        case 0x42:
            decoded.pir_window_time = readPirWindowTime(bytes[offset]);
            offset += 1;
            break;
        case 0x43:
            decoded.pir_pulse_times = readPirPulseTimes(bytes[offset]);
            offset += 1;
            break;
        case 0x44:
            var hibernate_config = readHibernateConfig(bytes.slice(offset, offset + 6));
            offset += 6;
            decoded.hibernate_config = decoded.hibernate_config || [];
            decoded.hibernate_config.push(hibernate_config);
            break;
        default:
            throw new Error("unknown downlink response");
    }

    if (hasResultFlag(code)) {
        var result_value = readUInt8(bytes[offset]);
        offset += 1;

        if (result_value !== 0) {
            var request = decoded;
            decoded = {};
            decoded.device_response_result = {};
            decoded.device_response_result.channel_type = channel_type;
            decoded.device_response_result.result = readResultStatus(result_value);
            decoded.device_response_result.request = request;
        }
    }

    return { data: decoded, offset: offset };
}

function hasResultFlag(code) {
    return code === 0xf8;
}

function readResultStatus(status) {
    var status_map = { 0: "success", 1: "forbidden", 2: "invalid parameter" };
    return getValue(status_map, status);
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

function readOccupancyStatus(status) {
    var status_map = { 0: "vacant", 1: "occupied" };
    return getValue(status_map, status);
}

function readIlluminanceStatus(status) {
    var status_map = { 0: "dim", 1: "bright", 254: "disable" };
    return getValue(status_map, status);
}

function readEnableStatus(status) {
    var status_map = { 0: "disable", 1: "enable" };
    return getValue(status_map, status);
}

function readYesNoStatus(status) {
    var status_map = { 0: "no", 1: "yes" };
    return getValue(status_map, status);
}

function readReportType(status) {
    var status_map = { 0: "plan", 1: "periodic" };
    return getValue(status_map, status);
}

function readPirSensitivity(status) {
    var status_map = { 0: "low", 1: "medium", 2: "high" };
    return getValue(status_map, status);
}

function readPirWindowTime(status) {
    var status_map = { 0: "2s", 1: "4s", 2: "6s", 3: "8s" };
    return getValue(status_map, status);
}

function readPirPulseTimes(status) {
    var status_map = { 0: "1_times", 1: "2_times", 2: "3_times", 3: "4_times" };
    return getValue(status_map, status);
}

function readRadarSensitivity(status) {
    var status_map = { 0: "low", 1: "medium", 2: "high" };
    return getValue(status_map, status);
}

function readDstConfig(bytes) {
    var offset = 0;

    var dst_config = {};
    var enable_value = bytes[offset];
    dst_config.enable = readEnableStatus(enable_value);
    dst_config.offset = readUInt8(bytes[offset + 1]);
    if (enable_value === 1) {
        dst_config.start_month = readMonth(bytes[offset + 2]);
        var start_week_value = bytes[offset + 3];
        dst_config.start_week_num = start_week_value >> 4;
        dst_config.start_week_day = readWeek(start_week_value & 0x0f);
        dst_config.start_time = readUInt16LE(bytes.slice(offset + 4, offset + 6));
        dst_config.end_month = readMonth(bytes[offset + 6]);
        var end_week_value = bytes[offset + 7];
        dst_config.end_week_num = end_week_value >> 4;
        dst_config.end_week_day = readWeek(end_week_value & 0x0f);
        dst_config.end_time = readUInt16LE(bytes.slice(offset + 8, offset + 10));
    }
    offset += 10;

    return dst_config;
}

function readMonth(month) {
    var month_map = { 1: "January", 2: "February", 3: "March", 4: "April", 5: "May", 6: "June", 7: "July", 8: "August", 9: "September", 10: "October", 11: "November", 12: "December" };
    return getValue(month_map, month);
}

function readWeek(week) {
    var week_map = { 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday", 7: "Sunday" };
    return getValue(week_map, week);
}

function readTimeZone(time_zone) {
    var timezone_map = { "-720": "UTC-12", "-660": "UTC-11", "-600": "UTC-10", "-570": "UTC-9:30", "-540": "UTC-9", "-480": "UTC-8", "-420": "UTC-7", "-360": "UTC-6", "-300": "UTC-5", "-240": "UTC-4", "-210": "UTC-3:30", "-180": "UTC-3", "-120": "UTC-2", "-60": "UTC-1", 0: "UTC", 60: "UTC+1", 120: "UTC+2", 180: "UTC+3", 210: "UTC+3:30", 240: "UTC+4", 270: "UTC+4:30", 300: "UTC+5", 330: "UTC+5:30", 345: "UTC+5:45", 360: "UTC+6", 390: "UTC+6:30", 420: "UTC+7", 480: "UTC+8", 540: "UTC+9", 570: "UTC+9:30", 600: "UTC+10", 630: "UTC+10:30", 660: "UTC+11", 720: "UTC+12", 765: "UTC+12:45", 780: "UTC+13", 840: "UTC+14" };
    return getValue(timezone_map, time_zone);
}

function readD2DMasterConfig(bytes) {
    var offset = 0;
    var config = {};
    config.mode = readD2DMode(readUInt8(bytes[offset]));
    config.enable = readEnableStatus(bytes[offset + 1]);
    config.lora_uplink_enable = readEnableStatus(bytes[offset + 2]);
    config.d2d_cmd = readD2DCommand(bytes.slice(offset + 3, offset + 5));
    config.time = readUInt16LE(bytes.slice(offset + 5, offset + 7));
    config.time_enable = readEnableStatus(bytes[offset + 7]);
    return config;
}

function readD2DCommand(bytes) {
    return ("0" + (bytes[1] & 0xff).toString(16)).slice(-2) + ("0" + (bytes[0] & 0xff).toString(16)).slice(-2);
}

function readD2DMode(type) {
    var mode_map = { 0: "occupied", 1: "vacant", 2: "bright", 3: "dim", 4: "occupied_bright", 5: "occupied_dim" };
    return getValue(mode_map, type);
}

function readHibernateConfig(bytes) {
    var offset = 0;
    var config = {};
    config.id = readUInt8(bytes[offset]) + 1;
    config.enable = readEnableStatus(bytes[offset + 1]);
    config.start_time = readUInt16LE(bytes.slice(offset + 2, offset + 4));
    config.end_time = readUInt16LE(bytes.slice(offset + 4, offset + 6));
    return config;
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
    return (value & 0xffffffff) >>> 0;
}

function readInt32LE(bytes) {
    var ref = readUInt32LE(bytes);
    return ref > 0x7fffffff ? ref - 0x100000000 : ref;
}

function readHexString(bytes) {
    var temp = [];
    for (var i = 0; i < bytes.length; i++) {
        temp.push(("0" + (bytes[i] & 0xff).toString(16)).slice(-2));
    }
    return temp.join("");
}

function getValue(map, key) {
    if (RAW_VALUE) return key;

    var value = map[key];
    if (!value) value = "unknown";
    return value;
}

if (!Object.assign) {
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
}