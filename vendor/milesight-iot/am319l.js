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
 * @product AM319 HCHO (v2)
 */
var RAW_VALUE = 0x00;


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
            decoded.device_status = readDeviceStatus(bytes[i]);
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
        else if (channel_id === 0x03 && channel_type === 0x67) {
            // °C
            decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
            i += 2;
        }
        // HUMIDITY
        else if (channel_id === 0x04 && channel_type === 0x68) {
            decoded.humidity = readUInt8(bytes[i]) / 2;
            i += 1;
        }
        // PIR
        else if (channel_id === 0x05 && channel_type === 0x00) {
            decoded.pir = readPIRStatus(bytes[i]);
            i += 1;
        }
        // LIGHT
        else if (channel_id === 0x06 && channel_type === 0xcb) {
            decoded.light_level = readUInt8(bytes[i]);
            i += 1;
        }
        // CO2
        else if (channel_id === 0x07 && channel_type === 0x7d) {
            decoded.co2 = readUInt16LE(bytes.slice(i, i + 2));
            i += 2;
        }
        // TVOC (iaq)
        else if (channel_id === 0x08 && channel_type === 0x7d) {
            decoded.tvoc = readUInt16LE(bytes.slice(i, i + 2)) / 100;
            i += 2;
        }
        // TVOC (µg/m³)
        else if (channel_id === 0x08 && channel_type === 0xe6) {
            decoded.tvoc = readUInt16LE(bytes.slice(i, i + 2));
            i += 2;
        }
        // PRESSURE
        else if (channel_id === 0x09 && channel_type === 0x73) {
            decoded.pressure = readUInt16LE(bytes.slice(i, i + 2)) / 10;
            i += 2;
        }
        // HCHO
        else if (channel_id === 0x0a && channel_type === 0x7d) {
            decoded.hcho = readUInt16LE(bytes.slice(i, i + 2)) / 100;
            i += 2;
        }
        // PM2.5
        else if (channel_id === 0x0b && channel_type === 0x7d) {
            decoded.pm2_5 = readUInt16LE(bytes.slice(i, i + 2));
            i += 2;
        }
        // PM10
        else if (channel_id === 0x0c && channel_type === 0x7d) {
            decoded.pm10 = readUInt16LE(bytes.slice(i, i + 2));
            i += 2;
        }
        // BEEP
        else if (channel_id === 0x0e && channel_type === 0x01) {
            decoded.buzzer_status = readBuzzerStatus(bytes[i]);
            i += 1;
        }
        // HISTORY DATA (AM319 CH2O)
        else if (channel_id === 0x20 && channel_type === 0xce) {
            var data = {};
            data.timestamp = readUInt32LE(bytes.slice(i, i + 4));
            data.temperature = readInt16LE(bytes.slice(i + 4, i + 6)) / 10;
            data.humidity = readUInt16LE(bytes.slice(i + 6, i + 8)) / 2;
            data.pir = readPIRStatus(bytes[i + 8]);
            data.light_level = readUInt8(bytes[i + 9]);
            data.co2 = readUInt16LE(bytes.slice(i + 10, i + 12));
            // unit: iaq
            data.tvoc = readUInt16LE(bytes.slice(i + 12, i + 14)) / 100;
            data.pressure = readUInt16LE(bytes.slice(i + 14, i + 16)) / 10;
            data.pm2_5 = readUInt16LE(bytes.slice(i + 16, i + 18));
            data.pm10 = readUInt16LE(bytes.slice(i + 18, i + 20));
            data.hcho = readUInt16LE(bytes.slice(i + 20, i + 22)) / 100;
            i += 22;

            decoded.history = decoded.history || [];
            decoded.history.push(data);
        }
        // HISTORY DATA (AM319 CH2O) with tvoc unit: µg/m³
        else if (channel_id === 0x21 && channel_type === 0xce) {
            var data = {};
            data.timestamp = readUInt32LE(bytes.slice(i, i + 4));
            data.temperature = readInt16LE(bytes.slice(i + 4, i + 6)) / 10;
            data.humidity = readUInt16LE(bytes.slice(i + 6, i + 8)) / 2;
            data.pir = readPIRStatus(bytes[i + 8]);
            data.light_level = readUInt8(bytes[i + 9]);
            data.co2 = readUInt16LE(bytes.slice(i + 10, i + 12));
            // unit: µg/m³
            data.tvoc = readUInt16LE(bytes.slice(i + 12, i + 14));
            data.pressure = readUInt16LE(bytes.slice(i + 14, i + 16)) / 10;
            data.pm2_5 = readUInt16LE(bytes.slice(i + 16, i + 18));
            data.pm10 = readUInt16LE(bytes.slice(i + 18, i + 20));
            data.hcho = readUInt16LE(bytes.slice(i + 20, i + 22)) / 100;
            i += 22;

            decoded.history = decoded.history || [];
            decoded.history.push(data);
        }
        // RESPONSE DATA
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
        case 0x10:
            decoded.reboot = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x17:
            decoded.time_zone = readTimeZone(readInt16LE(bytes.slice(offset, offset + 2)));
            offset += 2;
            break;
        case 0x1a:
            var mode_value = readUInt8(bytes[offset]);
            decoded.co2_calibration_settings = {};
            decoded.co2_calibration_settings.mode = readCalibrationMode(mode_value);
            if (mode_value === 2) {
                decoded.co2_calibration_settings.calibration_value = readUInt16LE(bytes.slice(offset + 1, offset + 3));
                offset += 3;
            } else {
                offset += 1;
            }
            break;
        case 0x25:
            decoded.child_lock_settings = readChildLockSettings(bytes[offset]);
            offset += 1;
            break;
        case 0x27:
            decoded.clear_history = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x2c:
            decoded.query_status = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x2d:
            decoded.screen_display_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x2e:
            decoded.led_indicator_mode = readLedIndicatorMode(bytes[offset]);
            offset += 1;
            break;
        case 0xeb:
            decoded.tvoc_unit = readTVOCUnit(bytes[offset]);
            offset += 1;
            break;
        case 0x39:
            decoded.co2_abc_calibration_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x3a:
            decoded.report_interval = readUInt16LE(bytes.slice(offset, offset + 2));
            offset += 2;
            break;
        case 0x3b:
            decoded.time_sync_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x3c:
            decoded.screen_display_pattern = bytes[offset];
            offset += 1;
            break;
        case 0x3d:
            decoded.stop_buzzer = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x3e:
            decoded.buzzer_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x65:
            decoded.pm2_5_collection_interval = readUInt16LE(bytes.slice(offset, offset + 2));
            offset += 2;
            break;
        case 0x66:
            decoded.screen_display_alarm_enable = readEnableStatus(bytes[offset]);
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
        case 0xf0:
            decoded.screen_display_element_settings = readScreenDisplayElementSettings(bytes.slice(offset, offset + 4));
            offset += 4;
            break;
        case 0xf4:
            decoded.co2_calibration_enable = readEnableStatus(bytes[offset]);
            offset += 1;
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

function readDeviceStatus(type) {
    var device_status_map = {
        0: "offline",
        1: "online",
    };
    return getValue(device_status_map, type);
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

function readPIRStatus(type) {
    var pir_status_map = { 0: "idle", 1: "trigger" };
    return getValue(pir_status_map, type);
}

function readBuzzerStatus(type) {
    var buzzer_status_map = { 0: "off", 1: "on" };
    return getValue(buzzer_status_map, type);
}

function readYesNoStatus(status) {
    var yes_no_map = { 0: "no", 1: "yes" };
    return getValue(yes_no_map, status);
}

function readEnableStatus(status) {
    var status_map = { 0: "disable", 1: "enable" };
    return getValue(status_map, status);
}

function readTimeZone(time_zone) {
    var timezone_map = { "-120": "UTC-12", "-110": "UTC-11", "-100": "UTC-10", "-95": "UTC-9:30", "-90": "UTC-9", "-80": "UTC-8", "-70": "UTC-7", "-60": "UTC-6", "-50": "UTC-5", "-40": "UTC-4", "-35": "UTC-3:30", "-30": "UTC-3", "-20": "UTC-2", "-10": "UTC-1", 0: "UTC", 10: "UTC+1", 20: "UTC+2", 30: "UTC+3", 35: "UTC+3:30", 40: "UTC+4", 45: "UTC+4:30", 50: "UTC+5", 55: "UTC+5:30", 57: "UTC+5:45", 60: "UTC+6", 65: "UTC+6:30", 70: "UTC+7", 80: "UTC+8", 90: "UTC+9", 95: "UTC+9:30", 100: "UTC+10", 105: "UTC+10:30", 110: "UTC+11", 120: "UTC+12", 127: "UTC+12:45", 130: "UTC+13", 140: "UTC+14" };
    return getValue(timezone_map, time_zone);
}

function readTVOCUnit(status) {
    var tvoc_unit_map = { 0: "iaq", 1: "µg/m³" };
    return getValue(tvoc_unit_map, status);
}

function readCalibrationMode(status) {
    var calibration_mode_map = { 0: "factory", 1: "abc", 2: "manual", 3: "background", 4: "zero" };
    return getValue(calibration_mode_map, status);
}

function readLedIndicatorMode(status) {
    var led_indicator_mode_map = { 0: "off", 1: "on", 2: "blink" };
    return getValue(led_indicator_mode_map, status);
}

function readScreenDisplayElementSettings(bytes) {
    var mask = readUInt16LE(bytes.slice(0, 2));
    var data = readUInt16LE(bytes.slice(2, 4));

    var settings = {};
    var sensor_bit_offset = { temperature: 0, humidity: 1, co2: 2, light: 3, tvoc: 4, smile: 5, letter: 6, pm2_5: 7, pm10: 8, hcho: 9, o3: 9 };
    for (var key in sensor_bit_offset) {
        if ((mask >>> sensor_bit_offset[key]) & 0x01) {
            settings[key] = readEnableStatus((data >> sensor_bit_offset[key]) & 0x01);
        }
    }
    return settings;
}

function readChildLockSettings(data) {
    var button_bit_offset = { off_button: 0, on_button: 1, collection_button: 2 };

    var settings = {};
    for (var key in button_bit_offset) {
        settings[key] = readEnableStatus((data >> button_bit_offset[key]) & 0x01);
    }
    return settings;
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