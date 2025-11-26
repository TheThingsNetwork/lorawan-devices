/**
 * Payload Decoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product TS201
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
        // SENSOR ID
        else if (channel_id === 0xff && channel_type === 0xa0) {
            var data = readUInt8(bytes[i]);
            var channel_idx = (data >>> 4) & 0x0f;
            var sensor_type = (data >>> 0) & 0x0f;
            var sensor_id = readSerialNumber(bytes.slice(i + 1, i + 9));
            var sensor_chn_name = "sensor_" + channel_idx;
            i += 9;
            decoded[sensor_chn_name + "_type"] = readSensorIDType(sensor_type);
            decoded[sensor_chn_name + "_sn"] = sensor_id;
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
        // TEMPERATURE SENSOR STATUS
        else if (channel_id === 0xb3 && channel_type === 0x67) {
            var data = {};
            data.temperature_sensor_status = readSensorStatus(bytes[i]);
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
            var read_status = readDataStatus((event >>> 4) & 0x0f);
            var event_type = readEventType((event >>> 0) & 0x0f);
            var data = {};
            data.timestamp = timestamp;
            data.read_status = read_status;
            data.event_type = event_type;
            data.temperature = temperature;
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
        case 0x10:
            decoded.reboot = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x27:
            decoded.clear_history = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x28:
            decoded.report_status = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x4a:
            decoded.sync_time = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x68:
            decoded.history_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x8e:
            // skip first byte
            decoded.report_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            offset += 3;
            break;
        case 0xea:
            var data = readUInt8(bytes[offset]);
            var calibration_value = readInt16LE(bytes.slice(offset + 1, offset + 3));

            var type = (data >>> 0) & 0x01;
            var enable_value = (data >>> 7) & 0x01;
            if (type === 0) {
                decoded.temperature_calibration_settings = {};
                decoded.temperature_calibration_settings.enable = readEnableStatus(enable_value);
                decoded.temperature_calibration_settings.calibration_value = calibration_value / 10;
            } else if (type === 1) {
                decoded.humidity_calibration_settings = {};
                decoded.humidity_calibration_settings.enable = readEnableStatus(enable_value);
                decoded.humidity_calibration_settings.calibration_value = calibration_value / 2;
            }
            offset += 3;
            break;
        case 0xf2:
            decoded.alarm_report_counts = readUInt16LE(bytes.slice(offset, offset + 2));
            offset += 2;
            break;
        case 0xf5:
            decoded.alarm_release_enable = readEnableStatus(bytes[offset]);
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
        case 0x0b:
            var data_type = readUInt8(bytes[offset]);
            if (data_type === 0x01) {
                decoded.temperature_alarm_config = {};
                decoded.temperature_alarm_config.condition = readMathConditionType(bytes[offset + 1]);
                decoded.temperature_alarm_config.threshold_max = readInt16LE(bytes.slice(offset + 2, offset + 4)) / 10;
                decoded.temperature_alarm_config.threshold_min = readInt16LE(bytes.slice(offset + 4, offset + 6)) / 10;
                decoded.temperature_alarm_config.enable = readEnableStatus(bytes[offset + 6]);
            }
            offset += 7;
            break;
        case 0x0c:
            var data_type = readUInt8(bytes[offset]);
            if (data_type === 0x02) {
                decoded.temperature_mutation_alarm_config = {};
                decoded.temperature_mutation_alarm_config.mutation = readUInt16LE(bytes.slice(offset + 1, offset + 3)) / 10;
                decoded.temperature_mutation_alarm_config.enable = readEnableStatus(bytes[offset + 3]);
            }
            offset += 4;
            break;
        case 0x0d:
            decoded.retransmit_config = {};
            decoded.retransmit_config.enable = readEnableStatus(bytes[offset]);
            decoded.retransmit_config.interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            offset += 3;
            break;
        case 0x0e:
            decoded.resend_interval = readUInt16LE(bytes.slice(offset, offset + 2));
            offset += 2;
            break;
        case 0x31:
            decoded.fetch_sensor_id = readSensorId(bytes[offset]);
            offset += 1;
            break;
        case 0x32:
            // skip 2 byte
            decoded.ack_retry_times = readUInt8(bytes[offset + 2]);
            offset += 3;
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

function readSensorIDType(type) {
    var sensor_id_map = { 1: "DS18B20", 2: "SHT4X" };
    return getValue(sensor_id_map, type);
}

function readSensorId(type) {
    var sensor_id_map = { 0: "all", 1: "sensor_1" };
    return getValue(sensor_id_map, type);
}

function readAlarmType(type) {
    var alarm_map = {
        0: "threshold alarm release",
        1: "threshold alarm",
        2: "mutation alarm",
    };
    return getValue(alarm_map, type);
}

function readSensorStatus(type) {
    var status_map = { 0: "read error", 1: "out of range" };
    return getValue(status_map, type);
}

function readDataStatus(type) {
    var status_map = { 0: "normal", 1: "read error", 2: "out of range" };
    return getValue(status_map, type);
}

function readEventType(type) {
    var type_map = {
        1: "periodic event",
        2: "temperature alarm event",
        3: "temperature alarm release event",
    };
    return getValue(type_map, type);
}

function readMathConditionType(type) {
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

function readFloatLE(bytes) {
    var bits = (bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0];
    var sign = bits >>> 31 === 0 ? 1.0 : -1.0;
    var e = (bits >>> 23) & 0xff;
    var m = e === 0 ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
    var f = sign * m * Math.pow(2, e - 150);
    return f;
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
                // TypeError if undefined or null
                throw new TypeError("Cannot convert first argument to object");
            }

            var to = Object(target);
            for (var i = 1; i < arguments.length; i++) {
                var nextSource = arguments[i];
                if (nextSource == null) {
                    // Skip over if undefined or null
                    continue;
                }
                nextSource = Object(nextSource);

                var keysArray = Object.keys(Object(nextSource));
                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                    var nextKey = keysArray[nextIndex];
                    var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== undefined && desc.enumerable) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
            return to;
        },
    });
}