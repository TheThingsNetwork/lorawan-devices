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
 * @product EM410-RDL
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
            decoded.device_status = readOnOffStatus(1);
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
        // DISTANCE
        else if (channel_id === 0x04 && channel_type === 0x82) {
            decoded.distance = readInt16LE(bytes.slice(i, i + 2));
            i += 2;
        }
        // POSITION
        else if (channel_id === 0x05 && channel_type === 0x00) {
            decoded.position = readPositionStatus(bytes[i]);
            i += 1;
        }
        // RADAR SIGNAL STRENGTH
        else if (channel_id === 0x06 && channel_type === 0xc7) {
            decoded.radar_signal_rssi = readInt16LE(bytes.slice(i, i + 2)) / 100;
            i += 2;
        }
        // DISTANCE ALARM
        else if (channel_id === 0x84 && channel_type === 0x82) {
            var data = {};
            data.distance = readInt16LE(bytes.slice(i, i + 2));
            data.distance_alarm = readDistanceAlarm(bytes[i + 2]);
            i += 3;

            decoded.distance = data.distance;
            decoded.event = decoded.event || [];
            decoded.event.push(data);
        }
        // DISTANCE MUTATION ALARM
        else if (channel_id === 0x94 && channel_type === 0x82) {
            var data = {};
            data.distance = readInt16LE(bytes.slice(i, i + 2));
            data.distance_mutation = readInt16LE(bytes.slice(i + 2, i + 4));
            data.distance_alarm = readDistanceAlarm(bytes[i + 4]);
            i += 5;

            decoded.distance = data.distance;
            decoded.event = decoded.event || [];
            decoded.event.push(data);
        }
        // DISTANCE EXCEPTION ALARM
        else if (channel_id === 0xb4 && channel_type === 0x82) {
            var distance_raw_data = readUInt16LE(bytes.slice(i, i + 2));
            var distance_value = readInt16LE(bytes.slice(i, i + 2));
            var distance_exception = readDistanceException(bytes[i + 2]);
            i += 3;

            var data = {};
            if (distance_raw_data === 0xfffd || distance_raw_data === 0xffff) {
                // IGNORE NO TARGET AND SENSOR EXCEPTION
            } else {
                data.distance = distance_value;
            }
            data.distance_exception = distance_exception;

            decoded.event = decoded.event || [];
            decoded.event.push(data);
        }
        // HISTORY
        else if (channel_id === 0x20 && channel_type === 0xce) {
            var timestamp = readUInt32LE(bytes.slice(i, i + 4));
            var distance_raw_data = readUInt16LE(bytes.slice(i + 4, i + 6));
            var distance_value = readInt16LE(bytes.slice(i + 4, i + 6));
            var temperature_raw_data = readUInt16LE(bytes.slice(i + 6, i + 8));
            var temperature_value = readInt16LE(bytes.slice(i + 6, i + 8)) / 10;
            var mutation = readInt16LE(bytes.slice(i + 8, i + 10));
            var event_value = readUInt8(bytes[i + 10]);
            i += 11;

            var data = {};
            data.timestamp = timestamp;
            if (distance_raw_data === 0xfffd) {
                data.distance_sensor_status = "no target";
            } else if (distance_raw_data === 0xffff) {
                data.distance_sensor_status = "sensor exception";
            } else if (distance_raw_data === 0xfffe) {
                data.distance_sensor_status = "disabled";
            } else {
                data.distance = distance_value;
            }

            if (temperature_raw_data === 0xfffe) {
                data.temperature_sensor_status = "disabled";
            } else if (temperature_raw_data === 0xffff) {
                data.temperature_sensor_status = "sensor exception";
            } else {
                data.temperature = temperature_value;
            }

            var event = readHistoryEvent(event_value);
            if (event.length > 0) {
                data.event = event;
            }
            if (event.indexOf("mutation alarm") !== -1) {
                data.distance_mutation = mutation;
            }

            decoded.history = decoded.history || [];
            decoded.history.push(data);
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

// 0xFE
function handle_downlink_response(channel_type, bytes, offset) {
    var decoded = {};

    switch (channel_type) {
        case 0x06:
            var data = readUInt8(bytes[offset]);
            var min = readInt16LE(bytes.slice(offset + 1, offset + 3));
            var max = readInt16LE(bytes.slice(offset + 3, offset + 5));
            // skip 4 bytes (reserved)
            offset += 9;

            var condition_type = data & 0x07;
            var id = (data >>> 3) & 0x07;
            var alarm_release_enable = (data >>> 7) & 0x01;
            if (id === 1) {
                decoded.distance_alarm_config = {};
                decoded.distance_alarm_config.enable = readEnableStatus(condition_type === 0 ? 0 : 1);
                decoded.distance_alarm_config.condition = readConditionType(condition_type);
                decoded.distance_alarm_config.alarm_release_enable = readEnableStatus(alarm_release_enable);
                decoded.distance_alarm_config.threshold_min = min;
                decoded.distance_alarm_config.threshold_max = max;
            } else if (id === 2) {
                decoded.distance_mutation_alarm_config = {};
                decoded.distance_mutation_alarm_config.enable = readEnableStatus(condition_type === 0 ? 0 : 1);
                decoded.distance_mutation_alarm_config.alarm_release_enable = readEnableStatus(alarm_release_enable);
                decoded.distance_mutation_alarm_config.mutation = max;
            } else if (id === 3) {
                decoded.tank_mode_distance_alarm_config = {};
                decoded.tank_mode_distance_alarm_config.enable = readEnableStatus(condition_type === 0 ? 0 : 1);
                decoded.tank_mode_distance_alarm_config.condition = readConditionType(condition_type);
                decoded.tank_mode_distance_alarm_config.alarm_release_enable = readEnableStatus(alarm_release_enable);
                decoded.tank_mode_distance_alarm_config.threshold_min = min;
                decoded.tank_mode_distance_alarm_config.threshold_max = max;
            } else if (id === 4) {
                decoded.tank_mode_distance_mutation_alarm_config = {};
                decoded.tank_mode_distance_mutation_alarm_config.enable = readEnableStatus(condition_type === 0 ? 0 : 1);
                decoded.tank_mode_distance_mutation_alarm_config.alarm_release_enable = readEnableStatus(alarm_release_enable);
                decoded.tank_mode_distance_mutation_alarm_config.mutation = max;
            }
            break;
        case 0x10:
            decoded.reboot = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x1b:
            decoded.distance_range = {};
            decoded.distance_range.mode = readDistanceMode(readUInt8(bytes[offset]));
            // skip 2 bytes (reserved)
            decoded.distance_range.max = readUInt16LE(bytes.slice(offset + 3, offset + 5));
            offset += 5;
            break;
        case 0x1c:
            decoded.recollection_config = {};
            decoded.recollection_config.counts = readUInt8(bytes[offset]);
            decoded.recollection_config.interval = readUInt8(bytes[offset + 1]);
            offset += 2;
            break;
        case 0x27:
            decoded.clear_history = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x28:
            decoded.report_status = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x2a:
            var calibrate_type = readUInt8(bytes[offset]);
            offset += 1;

            switch (calibrate_type) {
                case 0:
                    decoded.radar_calibration = readYesNoStatus(1);
                    break;
                case 1:
                    decoded.radar_blind_calibration = readYesNoStatus(1);
                    break;
            }
            break;
        case 0x3e:
            decoded.tilt_distance_link = readEnableStatus(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x4a:
            decoded.sync_time = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x68:
            decoded.history_enable = readEnableStatus(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x69:
            decoded.retransmit_enable = readEnableStatus(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x6a:
            var interval_type = readUInt8(bytes[offset]);
            switch (interval_type) {
                case 0:
                    decoded.retransmit_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
                    break;
                case 1:
                    decoded.resend_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
                    break;
            }
            offset += 3;
            break;
        case 0x8e:
            // ignore the first byte
            decoded.report_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            offset += 3;
            break;
        case 0xab:
            decoded.distance_calibration_settings = {};
            decoded.distance_calibration_settings.enable = readEnableStatus(readUInt8(bytes[offset]));
            decoded.distance_calibration_settings.calibration_value = readInt16LE(bytes.slice(offset + 1, offset + 3));
            offset += 3;
            break;
        case 0xbd:
            decoded.time_zone = readTimeZone(readInt16LE(bytes.slice(offset, offset + 2)));
            offset += 2;
            break;
        case 0xf2:
            decoded.alarm_counts = readUInt16LE(bytes.slice(offset, offset + 2));
            offset += 2;
            break;
        default:
            throw new Error("unknown downlink response");
    }

    return { data: decoded, offset: offset };
}

// 0xF8
function handle_downlink_response_ext(code, channel_type, bytes, offset) {
    var decoded = {};

    switch (channel_type) {
        case 0x12:
            decoded.distance_mode = readDistanceMode(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x13:
            decoded.blind_detection_enable = readEnableStatus(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x14:
            decoded.signal_quality = readInt16LE(bytes.slice(offset, offset + 2));
            offset += 2;
            break;
        case 0x15:
            decoded.distance_threshold_sensitive = readInt16LE(bytes.slice(offset, offset + 2)) / 10;
            offset += 2;
            break;
        case 0x16:
            decoded.peak_sorting = readPeakSortingAlgorithm(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x0d:
            decoded.retransmit_config = {};
            decoded.retransmit_config.enable = readEnableStatus(readUInt8(bytes[offset]));
            decoded.retransmit_config.retransmit_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            offset += 3;
            break;
        case 0x39:
            decoded.collection_interval = readUInt16LE(bytes.slice(offset, offset + 2));
            offset += 2;
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

function readOnOffStatus(status) {
    var status_map = { 0: "off", 1: "on" };
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

function readPositionStatus(status) {
    var status_map = { 0: "normal", 1: "tilt" };
    return getValue(status_map, status);
}

function readDistanceMode(status) {
    var status_map = { 0: "general", 1: "rainwater", 2: "wastewater", 3: "tank" };
    return getValue(status_map, status);
}

function readPeakSortingAlgorithm(status) {
    var status_map = { 0: "closest", 1: "strongest" };
    return getValue(status_map, status);
}

function readTimeZone(time_zone) {
    var timezone_map = { "-720": "UTC-12", "-660": "UTC-11", "-600": "UTC-10", "-570": "UTC-9:30", "-540": "UTC-9", "-480": "UTC-8", "-420": "UTC-7", "-360": "UTC-6", "-300": "UTC-5", "-240": "UTC-4", "-210": "UTC-3:30", "-180": "UTC-3", "-120": "UTC-2", "-60": "UTC-1", 0: "UTC", 60: "UTC+1", 120: "UTC+2", 180: "UTC+3", 210: "UTC+3:30", 240: "UTC+4", 270: "UTC+4:30", 300: "UTC+5", 330: "UTC+5:30", 345: "UTC+5:45", 360: "UTC+6", 390: "UTC+6:30", 420: "UTC+7", 480: "UTC+8", 540: "UTC+9", 570: "UTC+9:30", 600: "UTC+10", 630: "UTC+10:30", 660: "UTC+11", 720: "UTC+12", 765: "UTC+12:45", 780: "UTC+13", 840: "UTC+14" };
    return getValue(timezone_map, time_zone);
}

function readDistanceAlarm(status) {
    var status_map = {
        0: "threshold alarm release",
        1: "threshold alarm",
        2: "mutation alarm",
    };
    return getValue(status_map, status);
}

function readDistanceException(status) {
    var status_map = {
        0: "blind spot alarm release",
        1: "blind spot alarm",
        2: "no target",
        3: "sensor exception",
    };
    return getValue(status_map, status);
}

function readHistoryEvent(status) {
    var event = [];

    if (((status >>> 0) & 0x01) === 0x01) {
        event.push("threshold alarm");
    }
    if (((status >>> 1) & 0x01) === 0x01) {
        event.push("threshold alarm release");
    }
    if (((status >>> 2) & 0x01) === 0x01) {
        event.push("blind spot alarm");
    }
    if (((status >>> 3) & 0x01) === 0x01) {
        event.push("blind spot alarm release");
    }
    if (((status >>> 4) & 0x01) === 0x01) {
        event.push("mutation alarm");
    }
    if (((status >>> 5) & 0x01) === 0x01) {
        event.push("tilt alarm");
    }

    return event;
}

function readConditionType(condition) {
    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside", 5: "mutation" };
    return getValue(condition_map, condition);
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