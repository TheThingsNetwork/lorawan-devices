/**
 * Payload Decoder
 * https://github.com/Milesight-IoT/SensorDecoders/blob/main/at-series/at101/at101-decoder.js
 *
 * Copyright 2024 Milesight IoT
 *
 * @product AT101
 */
var RAW_VALUE = 0x00;

function decodeUplink(input) {
    var decoded = milesightDeviceDecode(input.bytes);
    return { data: decoded };
}

function Decoder(bytes, port) {
    return milesightDeviceDecode(bytes);
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
        // LOCATION
        else if ((channel_id === 0x04 || channel_id == 0x84) && channel_type === 0x88) {
            decoded.latitude = readInt32LE(bytes.slice(i, i + 4)) / 1000000;
            decoded.longitude = readInt32LE(bytes.slice(i + 4, i + 8)) / 1000000;
            var status = bytes[i + 8];
            decoded.motion_status = readMotionStatus(status & 0x0f);
            decoded.geofence_status = readGeofenceStatus(status >> 4);
            i += 9;
        }
        // DEVICE POSITION
        else if (channel_id === 0x05 && channel_type === 0x00) {
            decoded.position = readDevicePosition(bytes[i]);
            i += 1;
        }
        // Wi-Fi SCAN RESULT
        else if (channel_id === 0x06 && channel_type === 0xd9) {
            var wifi = {};
            wifi.group = readUInt8(bytes[i]);
            wifi.mac = readMAC(bytes.slice(i + 1, i + 7));
            wifi.rssi = readInt8(bytes[i + 7]);
            wifi.motion_status = readMotionStatus(bytes[i + 8] & 0x0f);
            i += 9;

            decoded.wifi_scan_result = "finish";
            if (wifi.mac === "ff:ff:ff:ff:ff:ff") {
                decoded.wifi_scan_result = "timeout";
                continue;
            }
            decoded.motion_status = wifi.motion_status;

            decoded.wifi = decoded.wifi || [];
            decoded.wifi.push(wifi);
        }
        // TAMPER STATUS
        else if (channel_id === 0x07 && channel_type === 0x00) {
            decoded.tamper_status = readTamperStatus(bytes[i]);
            i += 1;
        }
        // TEMPERATURE WITH ABNORMAL
        else if (channel_id === 0x83 && channel_type === 0x67) {
            decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
            decoded.temperature_alarm = readTemperatureAlarm(bytes[i + 2]);
            i += 3;
        }
        // HISTORICAL DATA
        else if (channel_id === 0x20 && channel_type === 0xce) {
            var location = {};
            location.timestamp = readUInt32LE(bytes.slice(i, i + 4));
            location.longitude = readInt32LE(bytes.slice(i + 4, i + 8)) / 1000000;
            location.latitude = readInt32LE(bytes.slice(i + 8, i + 12)) / 1000000;
            i += 12;

            decoded.history = decoded.history || [];
            decoded.history.push(location);
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
        case 0x10:
            decoded.reboot = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x13:
            decoded.motion_report_config = {};
            decoded.motion_report_config.enable = readEnableStatus(readUInt8(bytes[offset]));
            decoded.motion_report_config.interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            offset += 3;
            break;
        case 0x17:
            decoded.time_zone = readTimeZone(readInt16LE(bytes.slice(offset, offset + 2)));
            offset += 2;
            break;
        case 0x28:
            decoded.report_status = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x2d:
            var wifi_positioning_config = {};
            wifi_positioning_config.mode = readWiFiScanMode(readUInt8(bytes[offset]));
            wifi_positioning_config.num_of_bssid = readUInt8(bytes[offset + 1]);
            wifi_positioning_config.timeout = readUInt8(bytes[offset + 2]);
            offset += 3;
            decoded.wifi_positioning_config = wifi_positioning_config;
            break;
        case 0x3b:
            decoded.time_sync_enable = readEnableStatus(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x3c:
            decoded.gnss_positioning_timeout = readUInt8(bytes[offset]);
            offset += 1;
            break;
        case 0x4a:
            decoded.sync_time = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x58:
            var detection_type_value = readUInt8(bytes[offset]);
            if (detection_type_value === 0x00) {
                decoded.motion_detection_config = {};
                decoded.motion_detection_config.delta_g = readUInt8(bytes[offset + 1]);
                decoded.motion_detection_config.duration = readUInt16LE(bytes.slice(offset + 2, offset + 4));
            } else if (detection_type_value === 0x01) {
                decoded.static_detection_config = {};
                decoded.static_detection_config.delta_g = readUInt8(bytes[offset + 1]);
                decoded.static_detection_config.duration = readUInt16LE(bytes.slice(offset + 2, offset + 4));
            }
            offset += 4;
            break;
        case 0x66:
            decoded.report_strategy = readReportStrategy(bytes[offset]);
            offset += 1;
            break;
        case 0x71:
            decoded.positioning_strategy = readPositioningStrategy(bytes[offset]);
            offset += 1;
            break;
        case 0x7e:
            decoded.geofence_alarm_config = {};
            decoded.geofence_alarm_config.enable = readEnableStatus(readUInt8(bytes[offset]));
            decoded.geofence_alarm_config.interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            decoded.geofence_alarm_config.counts = readUInt8(bytes[offset + 3]);
            offset += 4;
            break;
        case 0x87:
            decoded.tamper_detection_enable = readEnableStatus(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x88:
            decoded.geofence_center_config = decoded.geofence_center_config || {};
            decoded.geofence_center_config.latitude = readInt32LE(bytes.slice(offset, offset + 4)) / 1000000;
            decoded.geofence_center_config.longitude = readInt32LE(bytes.slice(offset + 4, offset + 8)) / 1000000;
            offset += 8;
            break;
        case 0x89:
            decoded.geofence_center_config = decoded.geofence_center_config || {};
            decoded.geofence_center_config.radius = readUInt32LE(bytes.slice(offset, offset + 4));
            offset += 4;
            break;
        case 0x8a:
            var timed_report_config = {};
            timed_report_config.index = readUInt8(bytes[offset]) + 1;
            timed_report_config.time = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            offset += 3;
            decoded.timed_report_config = decoded.timed_report_config || [];
            decoded.timed_report_config.push(timed_report_config);
            break;
        case 0x8f:
            decoded.bluetooth_enable = readEnableStatus(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x8e:
            var report_type_value = readUInt8(bytes[offset]);
            if (report_type_value === 0x00) {
                decoded.report_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            } else if (report_type_value === 0x01) {
                decoded.motion_report_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            }
            offset += 3;
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

function readMAC(bytes) {
    var temp = [];
    for (var idx = 0; idx < bytes.length; idx++) {
        temp.push(("0" + (bytes[idx] & 0xff).toString(16)).slice(-2));
    }
    return temp.join(":");
}

function readMotionStatus(type) {
    var motion_status_map = {
        0: "unknown",
        1: "start",
        2: "moving",
        3: "stop",
    };
    return getValue(motion_status_map, type);
}

function readGeofenceStatus(type) {
    var geofence_status_map = {
        0: "inside",
        1: "outside",
        2: "unset",
        3: "unknown",
    };
    return getValue(geofence_status_map, type);
}

function readDevicePosition(type) {
    var device_position_map = { 0: "normal", 1: "tilt" };
    return getValue(device_position_map, type);
}

function readTamperStatus(type) {
    var tamper_status_map = { 0: "install", 1: "uninstall" };
    return getValue(tamper_status_map, type);
}

function readTemperatureAlarm(type) {
    var alarm_map = { 0: "normal", 1: "abnormal" };
    return getValue(alarm_map, type);
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

function readReportStrategy(type) {
    var report_strategy_map = { 0: "periodic", 1: "motion", 2: "timing" };
    return getValue(report_strategy_map, type);
}

function readPositioningStrategy(type) {
    var positioning_strategy_map = { 0: "gnss", 1: "wifi", 2: "wifi_gnss" };
    return getValue(positioning_strategy_map, type);
}

function readWiFiScanMode(type) {
    var wifi_scan_mode_map = { 0: "low_power", 1: "high_accuracy" };
    return getValue(wifi_scan_mode_map, type);
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

function getValue(map, key) {
    if (RAW_VALUE) return key;
    var value = map[key];
    if (!value) value = "unknown";
    return value;
}
