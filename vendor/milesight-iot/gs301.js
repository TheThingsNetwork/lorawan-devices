/**
 * Payload Decoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product GS301
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
        // DEVICE STATUS
        else if (channel_id === 0xff && channel_type === 0x0b) {
            decoded.device_status = readOnOffStatus(1);
            i += 1;
        }
        // LORAWAN CLASS
        else if (channel_id === 0xff && channel_type === 0x0f) {
            decoded.lorawan_class = readLoRaWANClass(bytes[i]);
            i += 1;
        }
        // PRODUCT SERIAL NUMBER
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
            decoded.battery = readUInt8(bytes[i]);
            i += 1;
        }
        // TEMPERATURE
        else if (channel_id === 0x02 && channel_type === 0x67) {
            decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
            i += 2;
        }
        // HUMIDITY
        else if (channel_id === 0x03 && channel_type === 0x68) {
            decoded.humidity = readUInt8(bytes[i]) / 2;
            i += 1;
        }
        // NH3
        else if (channel_id === 0x04 && channel_type === 0x7d) {
            var nh3_raw_data = readUInt16LE(bytes.slice(i, i + 2));
            switch (nh3_raw_data) {
                case 0xfffe:
                case 0xffff:
                    decoded.nh3_sensor_status = readSensorStatus(nh3_raw_data);
                    break;
                default:
                    decoded.nh3 = nh3_raw_data / 100;
                    break;
            }

            i += 2;
        }
        // H2S
        else if (channel_id === 0x05 && channel_type === 0x7d) {
            var h2s_raw_data = readUInt16LE(bytes.slice(i, i + 2));
            switch (h2s_raw_data) {
                case 0xfffe:
                case 0xffff:
                    decoded.h2s_sensor_status = readSensorStatus(h2s_raw_data);
                    break;
                default:
                    decoded.h2s = h2s_raw_data / 100;
                    break;
            }
            i += 2;
        }
        // H2S (@since v1.2)
        else if (channel_id === 0x06 && channel_type === 0x7d) {
            var h2s_raw_data = readUInt16LE(bytes.slice(i, i + 2));
            switch (h2s_raw_data) {
                case 0xfffe:
                case 0xffff:
                    decoded.h2s_sensor_status = readSensorStatus(h2s_raw_data);
                    break;
                default:
                    decoded.h2s = h2s_raw_data / 1000;
                    break;
            }
            i += 2;
        }
        // SENSOR CALIBRATION RESULT (@since v1.2)
        else if (channel_id === 0x07 && channel_type === 0xea) {
            var sensor_id = readUInt8(bytes[i]);
            switch (sensor_id) {
                case 0x00:
                    decoded.nh3_calibration_result = {};
                    decoded.nh3_calibration_result.type = readCalibrationType(bytes[i + 1]);
                    decoded.nh3_calibration_result.calibration_value = readInt16LE(bytes.slice(i + 2, i + 4)) / 100;
                    decoded.nh3_calibration_result.result = readCalibrationResult(bytes[i + 4]);
                    break;
                case 0x01:
                    decoded.h2s_calibration_result = {};
                    decoded.h2s_calibration_result.type = readCalibrationType(bytes[i + 1]);
                    decoded.h2s_calibration_result.calibration_value = readInt16LE(bytes.slice(i + 2, i + 4)) / 1000;
                    decoded.h2s_calibration_result.result = readCalibrationResult(bytes[i + 4]);
                    break;
                default:
                    break;
            }
            i += 5;
        }
        // SENSOR ID (@since v1.2)
        else if (channel_id === 0xff && channel_type === 0x7c) {
            decoded.sensor_id = readAscii(bytes.slice(i, i + 43));
            i += 43;
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
            var data = readUInt8(bytes[offset]);
            decoded.alarm_config = {};
            decoded.alarm_config.enable = readEnableStatus((data & 0x07) === 0 ? 0 : 1);
            decoded.alarm_config.condition = readConditionType(data & 0x07);
            decoded.alarm_config.trigger_source = readTriggerSource((data >> 3) & 0x1f);
            decoded.alarm_config.threshold_min = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            decoded.alarm_config.threshold_max = readUInt16LE(bytes.slice(offset + 3, offset + 5));
            decoded.alarm_config.lock_time = readUInt16LE(bytes.slice(offset + 5, offset + 7));
            decoded.alarm_config.continue_time = readUInt16LE(bytes.slice(offset + 7, offset + 9));
            offset += 9;
            break;
        case 0x10:
            decoded.reboot = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x66:
            decoded.threshold_report_interval = readUInt16LE(bytes.slice(offset, offset + 2));
            offset += 2;
            break;
        case 0x2f:
            decoded.led_indicator_enable = readEnableStatus(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x3e:
            decoded.buzzer_enable = readEnableStatus(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x7d:
            decoded.query_life_remain = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x8d:
            var sensor_id = readUInt8(bytes[offset]);
            switch (sensor_id) {
                case 0x00:
                    decoded.nh3_calibration_settings = {};
                    decoded.nh3_calibration_settings.mode = readCalibrationMode(bytes[offset + 1]);
                    decoded.nh3_calibration_settings.calibration_value = readInt16LE(bytes.slice(offset + 2, offset + 4)) / 100;
                    break;
                case 0x01:
                    decoded.h2s_calibration_settings = {};
                    decoded.h2s_calibration_settings.mode = readCalibrationMode(bytes[offset + 1]);
                    decoded.h2s_calibration_settings.calibration_value = readInt16LE(bytes.slice(offset + 2, offset + 4)) / 1000;
                    break;
                default:
                    break;
            }
            offset += 6;
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
    var lorawan_class_map = {
        0: "Class A",
        1: "Class B",
        2: "Class C",
        3: "Class CtoB",
    };
    return getValue(lorawan_class_map, type);
}

function readOnOffStatus(type) {
    var on_off_status_map = { 0: "off", 1: "on" };
    return getValue(on_off_status_map, type);
}

function readSensorStatus(value) {
    if (RAW_VALUE) return value;

    if (value === 0xfffe) return "polarizing";
    if (value === 0xffff) return "device error";
    return "normal";
}

function readCalibrationType(type) {
    var calibration_type_map = { 0: "factory", 1: "manual" };
    return getValue(calibration_type_map, type);
}

function readCalibrationResult(result) {
    var calibration_result_map = {
        0: "success",
        1: "sensor version not match",
        2: "i2c communication error",
    };
    return getValue(calibration_result_map, result);
}

function readEnableStatus(value) {
    var status_map = { 0: "disable", 1: "enable" };
    return getValue(status_map, value);
}

function readYesNoStatus(value) {
    var yes_no_map = { 0: "no", 1: "yes" };
    return getValue(yes_no_map, value);
}

function readCalibrationMode(value) {
    var calibration_mode_map = { 0: "factory", 1: "manual" };
    return getValue(calibration_mode_map, value);
}

function readConditionType(value) {
    var condition_type_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside" };
    return getValue(condition_type_map, value);
}

function readTriggerSource(value) {
    var trigger_source_map = { 1: "nh3", 2: "h2s", 3: "nh3_d2d", 4: "h2s_d2d", 5: "nh3_d2d", 6: "nh3_d2d_release", 7: "h2s_d2d_release", 8: "h2s_v2", 9: "h2s_d2d_v2", 10: "h2s_release_v2" };
    return getValue(trigger_source_map, value);
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

function readAscii(bytes) {
    var str = "";
    for (var i = 0; i < bytes.length; i++) {
        if (bytes[i] === 0) {
            break;
        }
        str += String.fromCharCode(bytes[i]);
    }
    return str;
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