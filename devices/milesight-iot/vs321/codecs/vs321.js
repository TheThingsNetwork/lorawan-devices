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
 * @product VS321
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
        // TEMPERATURE
        else if (channel_id === 0x03 && channel_type === 0x67) {
            var temperature_value = readUInt16LE(bytes.slice(i, i + 2));
            if (temperature_value === 0xFFFF) {
                decoded.temperature_sensor_status = readSensorStatus(2);
            } else {
                decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
            }
            i += 2;
        }
        // HUMIDITY
        else if (channel_id === 0x04 && channel_type === 0x68) {
            var humidity_value = readUInt8(bytes[i]);
            if (humidity_value === 0xFF) {
                decoded.humidity_sensor_status = readSensorStatus(2);
            } else {
                decoded.humidity = readUInt8(bytes[i]) / 2;
            }
            i += 1;
        }
        // PEOPLE TOTAL COUNTS
        else if (channel_id === 0x05 && channel_type === 0xfd) {
            decoded.people_total_counts = readUInt16LE(bytes.slice(i, i + 2));
            i += 2;
        }
        // REGION OCCUPANCY
        else if (channel_id === 0x06 && channel_type === 0xFE) {
            var region_mask = readUInt16LE(bytes.slice(i, i + 2));
            var region_data = readUInt16LE(bytes.slice(i + 2, i + 4));
            var region_offset = { region_1: 0, region_2: 1, region_3: 2, region_4: 3, region_5: 4, region_6: 5, region_7: 6, region_8: 7, region_9: 8, region_10: 9 };
            for (var key in region_offset) {
                decoded[key + "_enable"] = readEnableStatus((region_mask >>> region_offset[key]) & 0x01);
                decoded[key] = readOccupancyStatus((region_data >>> region_offset[key]) & 0x01);
            }
            i += 4;
        }
        // ILLUMINANCE STATUS
        else if (channel_id === 0x07 && channel_type === 0xFF) {
            decoded.illuminance_status = readIlluminanceStatus(bytes[i]);
            i += 1;
        }
        // CONFIDENCE STATUS
        else if (channel_id === 0x08 && channel_type === 0xF4) {
            // skip first byte
            decoded.detection_status = readDetectionStatus(bytes[i + 1]);
            i += 2;
        }
        // TIMESTAMP
        else if (channel_id === 0x0a && channel_type === 0xEF) {
            decoded.timestamp = readUInt32LE(bytes.slice(i, i + 4));
            i += 4;
        }
        // TEMPERATURE ALARM
        else if (channel_id === 0x83 && channel_type === 0x67) {
            decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
            decoded.temperature_alarm = readTemperatureAlarm(bytes[i + 2]);
            i += 3;
        }
        // HUMIDITY ALARM
        else if (channel_id === 0x84 && channel_type === 0x68) {
            decoded.humidity = readUInt8(bytes[i]) / 2;
            decoded.humidity_alarm = readHumidityAlarm(bytes[i + 1]);
            i += 2;
        }
        else if (channel_id === 0x20 && channel_type === 0xce) {
            var data = {};
            data.timestamp = readUInt32LE(bytes.slice(i, i + 4));
            var mode = readUInt8(bytes[i + 4]);
            if (mode === 0x00) {
                data.people_total_counts = readUInt16LE(bytes.slice(i + 5, i + 7));
                i += 7;
            } else if (mode === 0x01) {
                var data_mask = readUInt16LE(bytes.slice(i + 5, i + 7));
                var data_value = readUInt16LE(bytes.slice(i + 7, i + 9));
                var data_offset = { region_1: 0, region_2: 1, region_3: 2, region_4: 3, region_5: 4, region_6: 5, region_7: 6, region_8: 7, region_9: 8, region_10: 9 };
                for (var key in data_offset) {
                    data[key + "_enable"] = readEnableStatus((data_mask >>> data_offset[key]) & 0x01);
                    data[key] = readOccupancyStatus((data_value >>> data_offset[key]) & 0x01);
                }
                i += 9;
            }
            decoded.history = decoded.history || [];
            decoded.history.push(data);
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
        case 0x02:
            decoded.collection_interval = readUInt16LE(bytes.slice(offset, offset + 2));
            offset += 2;
            break;
        case 0x06:
            var data = readUInt8(bytes[offset]);
            var condition_value = data & 0x07;
            var channel_id = (data >>> 3 & 0x07);
            if (channel_id === 0x01) {
                decoded.temperature_alarm_config = {};
                decoded.temperature_alarm_config.condition = readConditionType(condition_value);
                decoded.temperature_alarm_config.threshold_min = readInt16LE(bytes.slice(offset + 1, offset + 3)) / 10;
                decoded.temperature_alarm_config.threshold_max = readInt16LE(bytes.slice(offset + 3, offset + 5)) / 10;
                decoded.temperature_alarm_config.lock_time = readUInt16LE(bytes.slice(offset + 5, offset + 7));
                decoded.temperature_alarm_config.continue_time = readUInt16LE(bytes.slice(offset + 7, offset + 9));
            } else if (channel_id === 0x02) {
                decoded.humidity_alarm_config = {};
                decoded.humidity_alarm_config.condition = readConditionType(condition_value);
                decoded.humidity_alarm_config.threshold_min = readUInt16LE(bytes.slice(offset + 1, offset + 3)) / 2;
                decoded.humidity_alarm_config.threshold_max = readUInt16LE(bytes.slice(offset + 3, offset + 5)) / 2;
                decoded.humidity_alarm_config.lock_time = readUInt16LE(bytes.slice(offset + 5, offset + 7));
                decoded.humidity_alarm_config.continue_time = readUInt16LE(bytes.slice(offset + 7, offset + 9));
            } else if (channel_id === 0x03) {
                decoded.illuminance_alarm_config = {};
                decoded.illuminance_alarm_config.condition = readConditionType(condition_value);
                decoded.illuminance_alarm_config.threshold_min = readUInt16LE(bytes.slice(offset + 1, offset + 3));
                decoded.illuminance_alarm_config.threshold_max = readUInt16LE(bytes.slice(offset + 3, offset + 5));
                decoded.illuminance_alarm_config.lock_time = readUInt16LE(bytes.slice(offset + 5, offset + 7));
                decoded.illuminance_alarm_config.continue_time = readUInt16LE(bytes.slice(offset + 7, offset + 9));
            }
            offset += 9;
            break;
        case 0x10:
            decoded.reboot = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x35:
            decoded.d2d_key = readHexString(bytes.slice(offset, offset + 8));
            offset += 8;
            break;
        case 0x40:
            decoded.adr_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x65:
            decoded.lora_port = readUInt8(bytes[offset]);
            offset += 1;
            break;
        case 0x68:
            decoded.history_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x69:
            decoded.retransmit_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x6a:
            var interval_type = readUInt8(bytes[offset]);
            if (interval_type === 0) {
                decoded.retransmit_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            } else if (interval_type === 1) {
                decoded.resend_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            }
            offset += 3;
            break;
        case 0x6d:
            decoded.stop_transmit = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x84:
            decoded.d2d_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x8e:
            // skip first byte
            decoded.report_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            offset += 3;
            break;
        case 0x96:
            var d2d_master_config = {};
            d2d_master_config.mode = readUInt8(bytes[offset]);
            d2d_master_config.enable = readEnableStatus(bytes[offset + 1]);
            d2d_master_config.lora_uplink_enable = readEnableStatus(bytes[offset + 2]);
            d2d_master_config.d2d_cmd = readD2DCommand(bytes.slice(offset + 3, offset + 5));
            d2d_master_config.time = readUInt16LE(bytes.slice(offset + 5, offset + 7));
            d2d_master_config.time_enable = readEnableStatus(bytes[offset + 7]);
            offset += 8;
            decoded.d2d_master_config = decoded.d2d_master_config || [];
            decoded.d2d_master_config.push(d2d_master_config);
            break;
        default:
            throw new Error("unknown downlink response");
    }

    return { data: decoded, offset: offset };
}

function handle_downlink_response_ext(code, channel_type, bytes, offset) {
    var decoded = {};

    switch (channel_type) {
        case 0x10:
            decoded.report_type = readReportType(bytes[offset]);
            offset += 1;
            break;
        case 0x6b:
            decoded.detection_mode = readDetectionMode(bytes[offset]);
            offset += 1;
            break;
        case 0x6c:
            decoded.detect = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x6e:
            decoded.reset = readYesNoStatus(1);
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

function readSensorStatus(status) {
    var status_map = { 0: "normal", 1: "over_range", 2: "read_failed" };
    return getValue(status_map, status);
}

function readOccupancyStatus(status) {
    var status_map = { 0: "vacant", 1: "occupied" };
    return getValue(status_map, status);
}

function readIlluminanceStatus(status) {
    var status_map = { 0: "dim", 1: "bright" };
    return getValue(status_map, status);
}

function readDetectionStatus(status) {
    var status_map = { 0: "normal", 1: "unavailable" };
    return getValue(status_map, status);
}

function readTemperatureAlarm(type) {
    var alarm_map = { 0: "threshold_alarm_release", 1: "threshold_alarm" };
    return getValue(alarm_map, type);
}

function readHumidityAlarm(type) {
    var alarm_map = { 0: "threshold_alarm_release", 1: "threshold_alarm" };
    return getValue(alarm_map, type);
}

function readEnableStatus(status) {
    var status_map = { 0: "disable", 1: "enable" };
    return getValue(status_map, status);
}

function readYesNoStatus(status) {
    var status_map = { 0: "no", 1: "yes" };
    return getValue(status_map, status);
}

function readReportType(type) {
    var type_map = { 0: "period", 1: "immediately" };
    return getValue(type_map, type);
}

function readDetectionMode(type) {
    var type_map = { 0: "auto", 1: "on" };
    return getValue(type_map, type);
}

function readConditionType(type) {
    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside" };
    return getValue(condition_map, type);
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

function readD2DCommand(bytes) {
    return ("0" + (bytes[1] & 0xff).toString(16)).slice(-2) + ("0" + (bytes[0] & 0xff).toString(16)).slice(-2);
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