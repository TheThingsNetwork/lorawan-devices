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
 * @product WT101
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
        // TEMPERATURE
        else if (channel_id === 0x03 && channel_type === 0x67) {
            decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
            i += 2;
        }
        // TARGET TEMPERATURE
        else if (channel_id === 0x04 && channel_type === 0x67) {
            decoded.target_temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
            i += 2;
        }
        // VALVE OPENING
        else if (channel_id === 0x05 && channel_type === 0x92) {
            decoded.valve_opening = readUInt8(bytes[i]);
            i += 1;
        }
        // TAMPER STATUS
        else if (channel_id === 0x06 && channel_type === 0x00) {
            decoded.tamper_status = readTamperStatus(bytes[i]);
            i += 1;
        }
        // WINDOW DETECTION
        else if (channel_id === 0x07 && channel_type === 0x00) {
            decoded.window_detection = readWindowDetectionStatus(bytes[i]);
            i += 1;
        }
        // MOTOR STROKE CALIBRATION RESULT
        else if (channel_id === 0x08 && channel_type === 0xe5) {
            decoded.motor_calibration_result = readMotorCalibrationResult(bytes[i]);
            i += 1;
        }
        // MOTOR STROKE
        else if (channel_id === 0x09 && channel_type === 0x90) {
            decoded.motor_stroke = readUInt16LE(bytes.slice(i, i + 2));
            i += 2;
        }
        // FREEZE PROTECTION
        else if (channel_id === 0x0a && channel_type === 0x00) {
            decoded.freeze_protection = readFreezeProtectionStatus(bytes[i]);
            i += 1;
        }
        // MOTOR CURRENT POSITION
        else if (channel_id === 0x0b && channel_type === 0x90) {
            decoded.motor_position = readUInt16LE(bytes.slice(i, i + 2));
            i += 2;
        }
        // HEATING DATE
        else if (channel_id === 0xf9 && channel_type === 0x33) {
            decoded.heating_date = readHeatingDate(bytes.slice(i, i + 7));
            i += 7;
        }
        // HEATING SCHEDULE
        else if (channel_id === 0xf9 && channel_type === 0x34) {
            var heating_schedule = readHeatingSchedule(bytes.slice(i, i + 9));
            decoded.heating_schedule = decoded.heating_schedule || [];
            decoded.heating_schedule.push(heating_schedule);
            i += 9;
        }
        // DOWNLINK RESPONSE
        else if (channel_id === 0xfe || channel_id === 0xff) {
            var result = handle_downlink_response(channel_type, bytes, i);
            decoded = Object.assign(decoded, result.data);
            i = result.offset;
        }
        // DOWNLINK RESPONSE
        else if (channel_id === 0xf8 || channel_id === 0xf9) {
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
        case 0x17:
            decoded.time_zone = readTimeZoneV1(readInt16LE(bytes.slice(offset, offset + 2)));
            offset += 2;
            break;
        case 0x25:
            decoded.child_lock_config = decoded.child_lock_config || {};
            decoded.child_lock_config.enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x28:
            decoded.report_status = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x3b:
            decoded.time_sync_enable = readTimeSyncEnable(bytes[offset]);
            offset += 1;
            break;
        case 0x4a:
            decoded.sync_time = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x57:
            decoded.restore_open_window_detection = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x8e:
            // ignore the first byte
            decoded.report_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            offset += 3;
            break;
        case 0xae:
            decoded.temperature_control = decoded.temperature_control || {};
            decoded.temperature_control.mode = readTemperatureControlMode(bytes[offset]);
            offset += 1;
            break;
        case 0xab:
            decoded.temperature_calibration_settings = {};
            decoded.temperature_calibration_settings.enable = readEnableStatus(bytes[offset]);
            decoded.temperature_calibration_settings.calibration_value = readInt16LE(bytes.slice(offset + 1, offset + 3)) / 10;
            offset += 3;
            break;
        case 0xac:
            decoded.valve_control_algorithm = readValveControlAlgorithm(bytes[offset]);
            offset += 1;
            break;
        case 0xad:
            decoded.valve_calibration = readYesNoStatus(1);
            offset += 1;
            break;
        case 0xaf:
            decoded.open_window_detection = decoded.open_window_detection || {};
            decoded.open_window_detection.enable = readEnableStatus(bytes[offset]);
            decoded.open_window_detection.temperature_threshold = readInt8(bytes[offset + 1]) / 10;
            decoded.open_window_detection.time = readUInt16LE(bytes.slice(offset + 2, offset + 4));
            offset += 4;
            break;
        case 0xb0:
            decoded.freeze_protection_config = decoded.freeze_protection_config || {};
            decoded.freeze_protection_config.enable = readEnableStatus(bytes[offset]);
            decoded.freeze_protection_config.temperature = readInt16LE(bytes.slice(offset + 1, offset + 3)) / 10;
            offset += 3;
            break;
        case 0xb1:
            decoded.target_temperature = readInt8(bytes[offset]);
            decoded.temperature_tolerance = readUInt16LE(bytes.slice(offset + 1, offset + 3)) / 10;
            offset += 3;
            break;
        case 0xb3:
            decoded.temperature_control = decoded.temperature_control || {};
            decoded.temperature_control.enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0xb4:
            decoded.valve_opening = readUInt8(bytes[offset]);
            offset += 1;
            break;
        case 0xba:
            decoded.dst_config = {};
            decoded.dst_config.enable = readEnableStatus(bytes[offset]);
            decoded.dst_config.offset = readInt8(bytes[offset + 1]);
            decoded.dst_config.start_month = bytes[offset + 2];
            decoded.dst_config.start_week_num = readUInt8(bytes[offset + 3]) >> 4;
            decoded.dst_config.start_week_day = bytes[offset + 3] & 0x0f;
            decoded.dst_config.start_time = readUInt16LE(bytes.slice(offset + 4, offset + 6));
            decoded.dst_config.end_month = bytes[offset + 6];
            decoded.dst_config.end_week_num = readUInt8(bytes[offset + 7]) >> 4;
            decoded.dst_config.end_week_day = bytes[offset + 7] & 0x0f;
            decoded.dst_config.end_time = readUInt16LE(bytes.slice(offset + 8, offset + 10));
            offset += 10;
            break;
        case 0xbd:
            decoded.time_zone = readTimeZone(readInt16LE(bytes.slice(offset, offset + 2)));
            offset += 2;
            break;
        case 0xc4:
            decoded.outside_temperature_control = {};
            decoded.outside_temperature_control.enable = readEnableStatus(bytes[offset]);
            decoded.outside_temperature_control.timeout = readUInt8(bytes[offset + 1]);
            offset += 2;
            break;
        case 0xf8:
            decoded.offline_control_mode = readOfflineControlMode(bytes[offset]);
            offset += 1;
            break;
        default:
            throw new Error("unknown downlink response");
    }

    return { data: decoded, offset: offset };
}

function handle_downlink_response_ext(code, channel_type, bytes, offset) {
    var decoded = {};

    switch (channel_type) {
        case 0x33:
            decoded.heating_date = readHeatingDate(bytes.slice(offset, offset + 7));
            offset += 7;
            break;
        case 0x34:
            var heating_schedule = readHeatingSchedule(bytes.slice(offset, offset + 9));
            decoded.heating_schedule = decoded.heating_schedule || [];
            decoded.heating_schedule.push(heating_schedule);
            offset += 9;
            break;
        case 0x35:
            decoded.target_temperature_range = {};
            decoded.target_temperature_range.min = readInt8(bytes[offset]);
            decoded.target_temperature_range.max = readInt8(bytes[offset + 1]);
            offset += 2;
            break;
        case 0x36:
            decoded.display_ambient_temperature = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x37:
            decoded.window_detection_valve_strategy = readWindowDetectionValveStrategy(bytes[offset]);
            offset += 1;
            break;
        case 0x38:
            decoded.effective_stroke = {};
            decoded.effective_stroke.enable = readEnableStatus(bytes[offset]);
            decoded.effective_stroke.rate = readUInt8(bytes[offset + 1]);
            offset += 2;
            break;
        case 0x3a:
            decoded.change_report_enable = readEnableStatus(bytes[offset]);
            offset += 1;
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

function readTamperStatus(type) {
    var tamper_status_map = { 0: "installed", 1: "uninstalled" };
    return getValue(tamper_status_map, type);
}

function readWindowDetectionStatus(type) {
    var window_detection_status_map = { 0: "normal", 1: "open" };
    return getValue(window_detection_status_map, type);
}

function readMotorCalibrationResult(type) {
    var motor_calibration_result_map = {
        0: "success",
        1: "fail: out of range",
        2: "fail: uninstalled",
        3: "calibration cleared",
        4: "temperature control disabled",
    };
    return getValue(motor_calibration_result_map, type);
}

function readFreezeProtectionStatus(type) {
    var freeze_protection_status_map = {
        0: "normal",
        1: "triggered",
    };
    return getValue(freeze_protection_status_map, type);
}

function readHeatingDate(bytes) {
    var heating_date = {};
    var offset = 0;
    heating_date.enable = readEnableStatus(bytes[offset]);
    heating_date.report_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
    heating_date.start_month = bytes[offset + 3];
    heating_date.start_day = readUInt8(bytes[offset + 4]);
    heating_date.end_month = bytes[offset + 5];
    heating_date.end_day = readUInt8(bytes[offset + 6]);
    return heating_date;
}

function readHeatingSchedule(bytes) {
    var heating_schedule = {};
    var offset = 0;
    heating_schedule.index = readUInt8(bytes[offset]) + 1;
    heating_schedule.enable = readEnableStatus(bytes[offset + 1]);
    heating_schedule.temperature_control_mode = readTemperatureControlMode(bytes[offset + 2]);
    heating_schedule.value = readUInt8(bytes[offset + 3]);
    heating_schedule.report_interval = readUInt16LE(bytes.slice(offset + 4, offset + 6));
    heating_schedule.execute_time = readUInt16LE(bytes.slice(offset + 6, offset + 8));
    var day = readUInt8(bytes[offset + 8]);
    heating_schedule.week_recycle = {};
    var week_day_offset = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 7 };
    for (var key in week_day_offset) {
        heating_schedule.week_recycle[key] = readEnableStatus((day >>> week_day_offset[key]) & 0x01);
    }

    return heating_schedule;
}

function readYesNoStatus(type) {
    var yes_no_map = { 0: "no", 1: "yes" };
    return getValue(yes_no_map, type);
}

function readEnableStatus(type) {
    var status_map = { 0: "disable", 1: "enable" };
    return getValue(status_map, type);
}

function readTemperatureControlMode(type) {
    var temperature_control_mode_map = { 0: "auto", 1: "manual" };
    return getValue(temperature_control_mode_map, type);
}

function readTimeZoneV1(time_zone) {
    var timezone_map = { "-120": "UTC-12", "-110": "UTC-11", "-100": "UTC-10", "-95": "UTC-9:30", "-90": "UTC-9", "-80": "UTC-8", "-70": "UTC-7", "-60": "UTC-6", "-50": "UTC-5", "-40": "UTC-4", "-35": "UTC-3:30", "-30": "UTC-3", "-20": "UTC-2", "-10": "UTC-1", 0: "UTC", 10: "UTC+1", 20: "UTC+2", 30: "UTC+3", 35: "UTC+3:30", 40: "UTC+4", 45: "UTC+4:30", 50: "UTC+5", 55: "UTC+5:30", 57: "UTC+5:45", 60: "UTC+6", 65: "UTC+6:30", 70: "UTC+7", 80: "UTC+8", 90: "UTC+9", 95: "UTC+9:30", 100: "UTC+10", 105: "UTC+10:30", 110: "UTC+11", 120: "UTC+12", 127: "UTC+12:45", 130: "UTC+13", 140: "UTC+14" };
    return getValue(timezone_map, time_zone);
}

function readTimeZone(time_zone) {
    var timezone_map = { "-720": "UTC-12", "-660": "UTC-11", "-600": "UTC-10", "-570": "UTC-9:30", "-540": "UTC-9", "-480": "UTC-8", "-420": "UTC-7", "-360": "UTC-6", "-300": "UTC-5", "-240": "UTC-4", "-210": "UTC-3:30", "-180": "UTC-3", "-120": "UTC-2", "-60": "UTC-1", 0: "UTC", 60: "UTC+1", 120: "UTC+2", 180: "UTC+3", 210: "UTC+3:30", 240: "UTC+4", 270: "UTC+4:30", 300: "UTC+5", 330: "UTC+5:30", 345: "UTC+5:45", 360: "UTC+6", 390: "UTC+6:30", 420: "UTC+7", 480: "UTC+8", 540: "UTC+9", 570: "UTC+9:30", 600: "UTC+10", 630: "UTC+10:30", 660: "UTC+11", 720: "UTC+12", 765: "UTC+12:45", 780: "UTC+13", 840: "UTC+14" };
    return getValue(timezone_map, time_zone);
}

function readTimeSyncEnable(type) {
    var enable_map = { 0: "disable", 2: "enable" };
    return getValue(enable_map, type);
}

function readValveControlAlgorithm(type) {
    var valve_control_algorithm_map = { 0: "rate", 1: "pid" };
    return getValue(valve_control_algorithm_map, type);
}

function readOfflineControlMode(type) {
    var offline_control_mode_map = { 0: "keep", 1: "embedded temperature control", 2: "off" };
    return getValue(offline_control_mode_map, type);
}

function readWindowDetectionValveStrategy(type) {
    var window_detection_valve_strategy_map = { 0: "keep", 1: "close" };
    return getValue(window_detection_valve_strategy_map, type);
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