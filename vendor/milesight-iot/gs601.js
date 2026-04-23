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
 * @product GS601
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

    var unknown_command = 0;
    for (var i = 0; i < bytes.length; ) {
        var command_id = bytes[i++];

        switch (command_id) {
            // attribute
            case 0xdf:
                decoded.tsl_version = readProtocolVersion(bytes.slice(i, i + 2));
                i += 2;
                break;
            case 0xde:
                decoded.product_name = readString(bytes.slice(i, i + 32));
                i += 32;
                break;
            case 0xdd:
                decoded.product_pn = readString(bytes.slice(i, i + 32));
                i += 32;
                break;
            case 0xdb:
                decoded.product_sn = readHexString(bytes.slice(i, i + 8));
                i += 8;
                break;
            case 0xda:
                decoded.version = {};
                decoded.version.hardware_version = readHardwareVersion(bytes.slice(i, i + 2));
                decoded.version.firmware_version = readFirmwareVersion(bytes.slice(i + 2, i + 8));
                i += 8;
                break;
            case 0xd9:
                decoded.oem_id = readHexString(bytes.slice(i, i + 2));
                i += 2;
                break;
            case 0xd8:
                decoded.product_frequency_band = readString(bytes.slice(i, i + 16));
                i += 16;
                break;
            case 0xee:
                decoded.device_request = 1;
                i += 0;
                break;
            case 0xc8:
                decoded.device_status = readDeviceStatus(bytes[i]);
                i += 1;
                break;
            case 0xcf:
                // skip 1 byte
                decoded.lorawan_class = readLoRaWANClass(bytes[i + 1]);
                i += 2;
                break;

            // telemetry
            case 0x00:
                decoded.battery = readUInt8(bytes[i]);
                i += 1;
                break;
            case 0x01:
                decoded.vaping_index = readUInt8(bytes[i]);
                i += 1;
                break;
            case 0x02:
                var vaping_index_alarm = {};
                var alarm_type = bytes[i];

                vaping_index_alarm.type = readVapeIndexAlarmType(alarm_type);
                if (alarm_type === 0x10 || alarm_type === 0x11) {
                    vaping_index_alarm.vaping_index = readUInt8(bytes[i + 1]);
                    decoded.vaping_index = readUInt8(bytes[i + 1]);
                    i += 2;
                } else {
                    i += 1;
                }

                decoded.vaping_index_alarm = vaping_index_alarm;
                break;
            case 0x03:
                decoded.pm1_0 = readUInt16LE(bytes.slice(i, i + 2));
                i += 2;
                break;
            case 0x04:
                var pm1_0_alarm = {};
                var alarm_type = bytes[i];

                pm1_0_alarm.type = readPMAlarmType(alarm_type);
                if (alarm_type === 0x10 || alarm_type === 0x11) {
                    pm1_0_alarm.pm1_0 = readUInt16LE(bytes.slice(i + 1, i + 3));
                    decoded.pm1_0 = readUInt16LE(bytes.slice(i + 1, i + 3));
                    i += 3;
                } else {
                    i += 1;
                }

                decoded.pm1_0_alarm = pm1_0_alarm;
                break;
            case 0x05:
                decoded.pm2_5 = readUInt16LE(bytes.slice(i, i + 2));
                i += 2;
                break;
            case 0x06:
                var pm2_5_alarm = {};
                var alarm_type = bytes[i];

                pm2_5_alarm.type = readPMAlarmType(alarm_type);
                if (alarm_type === 0x10 || alarm_type === 0x11) {
                    pm2_5_alarm.pm2_5 = readUInt16LE(bytes.slice(i + 1, i + 3));
                    decoded.pm2_5 = readUInt16LE(bytes.slice(i + 1, i + 3));
                    i += 3;
                } else {
                    i += 1;
                }

                decoded.pm2_5_alarm = pm2_5_alarm;
                break;
            case 0x07:
                decoded.pm10 = readUInt16LE(bytes.slice(i, i + 2));
                i += 2;
                break;
            case 0x08:
                var pm10_alarm = {};
                var alarm_type = bytes[i];

                pm10_alarm.type = readPMAlarmType(alarm_type);
                if (alarm_type === 0x10 || alarm_type === 0x11) {
                    pm10_alarm.pm10 = readUInt16LE(bytes.slice(i + 1, i + 3));
                    decoded.pm10 = readUInt16LE(bytes.slice(i + 1, i + 3));
                    i += 3;
                } else {
                    i += 1;
                }

                decoded.pm10_alarm = pm10_alarm;
                break;
            case 0x09:
                decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
                i += 2;
                break;
            case 0x0a:
                var temperature_alarm = {};
                var alarm_type = bytes[i];

                temperature_alarm.type = readTemperatureAlarmType(alarm_type);
                if (alarm_type === 0x10 || alarm_type === 0x11) {
                    temperature_alarm.temperature = readInt16LE(bytes.slice(i + 1, i + 3)) / 10;
                    decoded.temperature = readInt16LE(bytes.slice(i + 1, i + 3)) / 10;
                    i += 3;
                } else {
                    i += 1;
                }

                decoded.temperature_alarm = temperature_alarm;
                break;
            case 0x0b:
                decoded.humidity = readUInt16LE(bytes.slice(i, i + 2)) / 10;
                i += 2;
                break;
            case 0x0c:
                var humidity_alarm = {};
                var alarm_type = bytes[i];

                humidity_alarm.type = readHumidityAlarmType(alarm_type);
                i += 1;

                decoded.humidity_alarm = humidity_alarm;
                break;
            case 0x0d:
                decoded.tvoc = readUInt16LE(bytes.slice(i, i + 2));
                i += 2;
                break;
            case 0x0e:
                var tvoc_alarm = {};
                var alarm_type = bytes[i];

                tvoc_alarm.type = readTVOCAlarmType(alarm_type);
                if (alarm_type === 0x10 || alarm_type === 0x11) {
                    tvoc_alarm.tvoc = readUInt16LE(bytes.slice(i + 1, i + 3));
                    decoded.tvoc = readUInt16LE(bytes.slice(i + 1, i + 3));
                    i += 3;
                } else {
                    i += 1;
                }

                decoded.tvoc_alarm = tvoc_alarm;
                break;
            case 0x0f:
                decoded.tamper_status = readTamperStatus(bytes[i]);
                i += 1;
                break;
            case 0x10:
                var tamper_status_alarm = {};
                tamper_status_alarm.type = readTamperAlarmType(bytes[i]);
                i += 1;

                decoded.tamper_status_alarm = tamper_status_alarm;
                break;
            case 0x11:
                decoded.buzzer = readBuzzerStatus(bytes[i]);
                i += 1;
                break;
            case 0x12:
                decoded.occupancy_status = readOccupancyStatus(bytes[i]);
                i += 1;
                break;
            case 0x20:
                decoded.tvoc_raw_data_1 = {};
                decoded.tvoc_raw_data_1.rmox_0 = readFloatLE(bytes.slice(i, i + 4));
                decoded.tvoc_raw_data_1.rmox_1 = readFloatLE(bytes.slice(i + 4, i + 8));
                i += 8;
                break;
            case 0x21:
                decoded.tvoc_raw_data_2 = {};
                decoded.tvoc_raw_data_2.rmox_2 = readFloatLE(bytes.slice(i, i + 4));
                decoded.tvoc_raw_data_2.rmox_3 = readFloatLE(bytes.slice(i + 4, i + 8));
                i += 8;
                break;
            case 0x22:
                decoded.tvoc_raw_data_3 = {};
                decoded.tvoc_raw_data_3.rmox_4 = readFloatLE(bytes.slice(i, i + 4));
                decoded.tvoc_raw_data_3.rmox_5 = readFloatLE(bytes.slice(i + 4, i + 8));
                i += 8;
                break;
            case 0x23:
                decoded.tvoc_raw_data_4 = {};
                decoded.tvoc_raw_data_4.rmox_6 = readFloatLE(bytes.slice(i, i + 4));
                decoded.tvoc_raw_data_4.rmox_7 = readFloatLE(bytes.slice(i + 4, i + 8));
                i += 8;
                break;
            case 0x24:
                decoded.tvoc_raw_data_5 = {};
                decoded.tvoc_raw_data_5.rmox_8 = readFloatLE(bytes.slice(i, i + 4));
                decoded.tvoc_raw_data_5.rmox_9 = readFloatLE(bytes.slice(i + 4, i + 8));
                i += 8;
                break;
            case 0x25:
                decoded.tvoc_raw_data_6 = {};
                decoded.tvoc_raw_data_6.rmox_10 = readFloatLE(bytes.slice(i, i + 4));
                decoded.tvoc_raw_data_6.rmox_11 = readFloatLE(bytes.slice(i + 4, i + 8));
                i += 8;
                break;
            case 0x26:
                decoded.tvoc_raw_data_7 = {};
                decoded.tvoc_raw_data_7.rmox_12 = readFloatLE(bytes.slice(i, i + 4));
                decoded.tvoc_raw_data_7.zmod4510_rmox_3 = readFloatLE(bytes.slice(i + 4, i + 8));
                i += 8;
                break;
            case 0x27:
                decoded.tvoc_raw_data_8 = {};
                decoded.tvoc_raw_data_8.log_rcda = readFloatLE(bytes.slice(i, i + 4));
                decoded.tvoc_raw_data_8.rhtr = readFloatLE(bytes.slice(i + 4, i + 8));
                i += 8;
                break;
            case 0x28:
                decoded.tvoc_raw_data_9 = {};
                decoded.tvoc_raw_data_9.temperature = readFloatLE(bytes.slice(i, i + 4));
                decoded.tvoc_raw_data_9.iaq = readFloatLE(bytes.slice(i + 4, i + 8));
                i += 8;
                break;
            case 0x29:
                decoded.tvoc_raw_data_10 = {};
                decoded.tvoc_raw_data_10.tvoc = readFloatLE(bytes.slice(i, i + 4));
                decoded.tvoc_raw_data_10.etoh = readFloatLE(bytes.slice(i + 4, i + 8));
                i += 8;
                break;
            case 0x2a:
                decoded.tvoc_raw_data_11 = {};
                decoded.tvoc_raw_data_11.eco2 = readFloatLE(bytes.slice(i, i + 4));
                decoded.tvoc_raw_data_11.rel_iaq = readFloatLE(bytes.slice(i + 4, i + 8));
                i += 8;
                break;
            case 0x2b:
                decoded.pm_sensor_working_time = readUInt32LE(bytes.slice(i, i + 4));
                i += 4;
                break;

            // config
            case 0x60:
                var time_unit = readUInt8(bytes[i]);
                decoded.reporting_interval = {};
                decoded.reporting_interval.unit = readTimeUnitType(time_unit);
                if (time_unit === 0) {
                    decoded.reporting_interval.seconds_of_time = readUInt16LE(bytes.slice(i + 1, i + 3));
                } else if (time_unit === 1) {
                    decoded.reporting_interval.minutes_of_time = readUInt16LE(bytes.slice(i + 1, i + 3));
                }
                i += 3;
                break;
            case 0x61:
                decoded.temperature_unit = readTemperatureType(bytes[i]);
                i += 1;
                break;
            case 0x62:
                decoded.led_status = readEnableStatus(bytes[i]);
                i += 1;
                break;
            case 0x63:
                decoded.buzzer_enable = readEnableStatus(bytes[i]);
                i += 1;
                break;
            case 0x64:
                var index = readUInt8(bytes[i]);
                var buzzer_sleep = {};
                buzzer_sleep.enable = readEnableStatus(bytes[i + 1]);
                buzzer_sleep.start_time = readUInt16LE(bytes.slice(i + 2, i + 4));
                buzzer_sleep.end_time = readUInt16LE(bytes.slice(i + 4, i + 6));
                i += 6;
                decoded.buzzer_sleep = decoded.buzzer_sleep || {};
                decoded.buzzer_sleep["item_" + index] = buzzer_sleep;
                break;
            case 0x65:
                decoded.buzzer_button_stop_enable = readEnableStatus(bytes[i]);
                i += 1;
                break;
            case 0x66:
                decoded.buzzer_silent_time = readUInt16LE(bytes.slice(i, i + 2));
                i += 2;
                break;
            case 0x67:
                decoded.tamper_alarm_enable = readEnableStatus(bytes[i]);
                i += 1;
                break;
            case 0x68:
                decoded.tvoc_raw_reporting_enable = readEnableStatus(bytes[i]);
                i += 1;
                break;
            case 0x69:
                decoded.temperature_alarm_settings = {};
                decoded.temperature_alarm_settings.enable = readEnableStatus(bytes[i]);
                decoded.temperature_alarm_settings.condition = readThresholdCondition(bytes[i + 1]);
                decoded.temperature_alarm_settings.threshold_min = readInt16LE(bytes.slice(i + 2, i + 4)) / 10;
                decoded.temperature_alarm_settings.threshold_max = readInt16LE(bytes.slice(i + 4, i + 6)) / 10;
                i += 6;
                break;
            case 0x6a:
                decoded.pm1_0_alarm_settings = {};
                decoded.pm1_0_alarm_settings.enable = readEnableStatus(bytes[i]);
                // decoded.pm1_0_alarm_settings.condition = readThresholdCondition(bytes[i + 1]);
                // decoded.pm1_0_alarm_settings.threshold_min = readInt16LE(bytes.slice(i + 2, i + 4));
                decoded.pm1_0_alarm_settings.threshold_max = readInt16LE(bytes.slice(i + 4, i + 6));
                i += 6;
                break;
            case 0x6b:
                decoded.pm2_5_alarm_settings = {};
                decoded.pm2_5_alarm_settings.enable = readEnableStatus(bytes[i]);
                // decoded.pm2_5_alarm_settings.condition = readThresholdCondition(bytes[i + 1]);
                // decoded.pm2_5_alarm_settings.threshold_min = readInt16LE(bytes.slice(i + 2, i + 4));
                decoded.pm2_5_alarm_settings.threshold_max = readInt16LE(bytes.slice(i + 4, i + 6));
                i += 6;
                break;
            case 0x6c:
                decoded.pm10_alarm_settings = {};
                decoded.pm10_alarm_settings.enable = readEnableStatus(bytes[i]);
                // decoded.pm10_alarm_settings.condition = readThresholdCondition(bytes[i + 1]);
                // decoded.pm10_alarm_settings.threshold_min = readInt16LE(bytes.slice(i + 2, i + 4));
                decoded.pm10_alarm_settings.threshold_max = readInt16LE(bytes.slice(i + 4, i + 6));
                i += 6;
                break;
            case 0x6d:
                decoded.tvoc_alarm_settings = {};
                decoded.tvoc_alarm_settings.enable = readEnableStatus(bytes[i]);
                // decoded.tvoc_alarm_settings.condition = readThresholdCondition(bytes[i + 1]);
                // decoded.tvoc_alarm_settings.threshold_min = readInt16LE(bytes.slice(i + 2, i + 4));
                decoded.tvoc_alarm_settings.threshold_max = readInt16LE(bytes.slice(i + 4, i + 6));
                i += 6;
                break;
            case 0x6e:
                decoded.vaping_index_alarm_settings = {};
                decoded.vaping_index_alarm_settings.enable = readEnableStatus(bytes[i]);
                // decoded.vaping_index_alarm_settings.condition = readThresholdCondition(bytes[i + 1]);
                // decoded.vaping_index_alarm_settings.threshold_min = readUInt8(bytes[i + 2]);
                decoded.vaping_index_alarm_settings.threshold_max = readUInt8(bytes[i + 3]);
                i += 4;
                break;
            case 0x6f:
                decoded.alarm_reporting_times = readUInt16LE(bytes.slice(i, i + 2));
                i += 2;
                break;
            case 0x70:
                decoded.alarm_deactivation_enable = readEnableStatus(bytes[i]);
                i += 1;
                break;
            case 0x71:
                decoded.temperature_calibration_settings = {};
                decoded.temperature_calibration_settings.enable = readEnableStatus(bytes[i]);
                decoded.temperature_calibration_settings.calibration_value = readInt16LE(bytes.slice(i + 1, i + 3)) / 10;
                i += 3;
                break;
            case 0x72:
                decoded.humidity_calibration_settings = {};
                decoded.humidity_calibration_settings.enable = readEnableStatus(bytes[i]);
                decoded.humidity_calibration_settings.calibration_value = readInt16LE(bytes.slice(i + 1, i + 3)) / 10;
                i += 3;
                break;
            case 0x73:
                decoded.pm1_0_calibration_settings = {};
                decoded.pm1_0_calibration_settings.enable = readEnableStatus(bytes[i]);
                decoded.pm1_0_calibration_settings.calibration_value = readInt16LE(bytes.slice(i + 1, i + 3));
                i += 3;
                break;
            case 0x74:
                decoded.pm2_5_calibration_settings = {};
                decoded.pm2_5_calibration_settings.enable = readEnableStatus(bytes[i]);
                decoded.pm2_5_calibration_settings.calibration_value = readInt16LE(bytes.slice(i + 1, i + 3));
                i += 3;
                break;
            case 0x75:
                decoded.pm10_calibration_settings = {};
                decoded.pm10_calibration_settings.enable = readEnableStatus(bytes[i]);
                decoded.pm10_calibration_settings.calibration_value = readInt16LE(bytes.slice(i + 1, i + 3));
                i += 3;
                break;
            case 0x76:
                decoded.tvoc_calibration_settings = {};
                decoded.tvoc_calibration_settings.enable = readEnableStatus(bytes[i]);
                decoded.tvoc_calibration_settings.calibration_value = readInt16LE(bytes.slice(i + 1, i + 3));
                i += 3;
                break;
            case 0x77:
                decoded.vaping_index_calibration_settings = {};
                decoded.vaping_index_calibration_settings.enable = readEnableStatus(bytes[i]);
                decoded.vaping_index_calibration_settings.calibration_value = readInt8(bytes[i + 1]);
                i += 2;
                break;
            case 0xc6:
                decoded.daylight_saving_time = {};
                decoded.daylight_saving_time.daylight_saving_time_enable = readEnableStatus(bytes[i]);
                decoded.daylight_saving_time.daylight_saving_time_offset = readUInt8(bytes[i + 1]);
                decoded.daylight_saving_time.start_month = readUInt8(bytes[i + 2]);
                var start_day_value = readUInt8(bytes[i + 3]);
                decoded.daylight_saving_time.start_week_num = (start_day_value >>> 4) & 0x07;
                decoded.daylight_saving_time.start_week_day = start_day_value & 0x0f;
                decoded.daylight_saving_time.start_hour_min = readUInt16LE(bytes.slice(i + 4, i + 6));
                decoded.daylight_saving_time.end_month = readUInt8(bytes[i + 6]);
                var end_day_value = readUInt8(bytes[i + 7]);
                decoded.daylight_saving_time.end_week_num = (end_day_value >>> 4) & 0x0f;
                decoded.daylight_saving_time.end_week_day = end_day_value & 0x0f;
                decoded.daylight_saving_time.end_hour_min = readUInt16LE(bytes.slice(i + 8, i + 10));
                i += 10;
                break;
            case 0xc7:
                decoded.time_zone = readTimeZone(readInt16LE(bytes.slice(i, i + 2)));
                i += 2;
                break;

            // service
            case 0x5f:
                decoded.stop_buzzer_alarm = readYesNoStatus(1);
                break;
            case 0x5e:
                decoded.execute_tvoc_self_clean = readYesNoStatus(1);
                break;
            case 0xb6:
                decoded.reconnect = readYesNoStatus(1);
                break;
            case 0xb8:
                decoded.synchronize_time = readYesNoStatus(1);
                break;
            case 0xb9:
                decoded.query_device_status = readYesNoStatus(1);
                break;
            case 0xbe:
                decoded.reboot = readYesNoStatus(1);
                break;
            // control frame
            case 0xef:
                var cmd_data = readUInt8(bytes[i]);
                var cmd_result = (cmd_data >>> 4) & 0x0f;
                var cmd_length = cmd_data & 0x0f;
                var cmd_id = readHexString(bytes.slice(i + 1, i + 1 + cmd_length));
                var cmd_header = readHexString(bytes.slice(i + 1, i + 2));
                i += 1 + cmd_length;

                var response = {};
                response.result = readCmdResult(cmd_result);
                response.cmd_id = cmd_id;
                response.cmd_name = readCmdName(cmd_header);

                decoded.request_result = decoded.request_result || [];
                decoded.request_result.push(response);
                break;
            case 0xfe:
                decoded.frame = readUInt8(bytes[i]);
                i += 1;
                break;
            default:
                unknown_command = 1;
                break;
        }

        if (unknown_command) {
            throw new Error("unknown command: " + command_id);
        }
    }

    return decoded;
}

function readProtocolVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = bytes[1] & 0xff;
    return "v" + major + "." + minor;
}

function readHardwareVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = bytes[1] & 0xff;
    return "v" + major + "." + minor;
}

function readFirmwareVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = bytes[1] & 0xff;
    var release = bytes[2] & 0xff;
    var alpha = bytes[3] & 0xff;
    var unit_test = bytes[4] & 0xff;
    var test = bytes[5] & 0xff;

    var version = "v" + major + "." + minor;
    if (release !== 0) version += "-r" + release;
    if (alpha !== 0) version += "-a" + alpha;
    if (unit_test !== 0) version += "-u" + unit_test;
    if (test !== 0) version += "-t" + test;
    return version;
}

function readDeviceStatus(type) {
    var device_status_map = { 0: "off", 1: "on" };
    return getValue(device_status_map, type);
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

function readVapeIndexAlarmType(type) {
    var vape_index_alarm_map = {
        0: "collection error", // 0x00
        1: "lower range error", // 0x01
        2: "over range error", // 0x02
        16: "alarm deactivation", // 0x10
        17: "alarm trigger", // 0x11
        32: "interference alarm deactivation", // 0x20
        33: "interference alarm trigger", // 0x21
    };
    return getValue(vape_index_alarm_map, type);
}

function readPMAlarmType(type) {
    var pm_alarm_map = {
        0: "collection error", // 0x00
        1: "lower range error", // 0x01
        2: "over range error", // 0x02
        16: "alarm deactivation", // 0x10
        17: "alarm trigger", // 0x11
    };
    return getValue(pm_alarm_map, type);
}

function readTemperatureAlarmType(type) {
    var temperature_alarm_map = {
        0: "collection error", // 0x00
        1: "lower range error", // 0x01
        2: "over range error", // 0x02
        16: "alarm deactivation", // 0x10
        17: "alarm trigger", // 0x11
        32: "burning alarm deactivation", // 0x20
        33: "burning alarm trigger", // 0x21
    };
    return getValue(temperature_alarm_map, type);
}

function readHumidityAlarmType(type) {
    var humidity_alarm_map = {
        0: "collection error", // 0x00
        1: "lower range error", // 0x01
        2: "over range error", // 0x02
    };
    return getValue(humidity_alarm_map, type);
}

function readTVOCAlarmType(type) {
    var tvoc_alarm_map = {
        0: "collection error", // 0x00
        1: "lower range error", // 0x01
        2: "over range error", // 0x02
        16: "alarm deactivation", // 0x10
        17: "alarm trigger", // 0x11
    };
    return getValue(tvoc_alarm_map, type);
}

function readTamperStatus(type) {
    var tamper_status_map = { 0: "normal", 1: "triggered" };
    return getValue(tamper_status_map, type);
}

function readTamperAlarmType(type) {
    var tamper_alarm_map = {
        32: "alarm deactivation", // 0x20
        33: "alarm trigger", // 0x21
    };
    return getValue(tamper_alarm_map, type);
}

function readBuzzerStatus(type) {
    var buzzer_status_map = { 0: "normal", 1: "triggered" };
    return getValue(buzzer_status_map, type);
}

function readOccupancyStatus(type) {
    var occupancy_status_map = { 0: "vacant", 1: "occupied" };
    return getValue(occupancy_status_map, type);
}

function readTimeUnitType(type) {
    var unit_map = { 0: "second", 1: "minute" };
    return getValue(unit_map, type);
}

function readTemperatureType(type) {
    var unit_map = { 0: "celsius", 1: "fahrenheit" };
    return getValue(unit_map, type);
}

function readEnableStatus(status) {
    var status_map = { 0: "disable", 1: "enable" };
    return getValue(status_map, status);
}

function readYesNoStatus(type) {
    var yes_no_map = { 0: "no", 1: "yes" };
    return getValue(yes_no_map, type);
}

function readThresholdCondition(type) {
    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside" };
    return getValue(condition_map, type);
}

function readTimeZone(time_zone) {
    var timezone_map = { "-720": "UTC-12", "-660": "UTC-11", "-600": "UTC-10", "-570": "UTC-9:30", "-540": "UTC-9", "-480": "UTC-8", "-420": "UTC-7", "-360": "UTC-6", "-300": "UTC-5", "-240": "UTC-4", "-210": "UTC-3:30", "-180": "UTC-3", "-120": "UTC-2", "-60": "UTC-1", 0: "UTC", 60: "UTC+1", 120: "UTC+2", 180: "UTC+3", 210: "UTC+3:30", 240: "UTC+4", 270: "UTC+4:30", 300: "UTC+5", 330: "UTC+5:30", 345: "UTC+5:45", 360: "UTC+6", 390: "UTC+6:30", 420: "UTC+7", 480: "UTC+8", 540: "UTC+9", 570: "UTC+9:30", 600: "UTC+10", 630: "UTC+10:30", 660: "UTC+11", 720: "UTC+12", 765: "UTC+12:45", 780: "UTC+13", 840: "UTC+14" };
    return getValue(timezone_map, time_zone);
}

function readCmdResult(type) {
    var result_map = { 0: "success", 1: "parsing error", 2: "order error", 3: "password error", 4: "read params error", 5: "write params error", 6: "read execution error", 7: "write execution error", 8: "read apply error", 9: "write apply error", 10: "associative error" };
    return getValue(result_map, type);
}

function readCmdName(type) {
    var name_map = {
        60: { level: 1, name: "reporting_interval" },
        61: { level: 1, name: "temperature_unit" },
        62: { level: 1, name: "led_status" },
        63: { level: 1, name: "buzzer_enable" },
        64: { level: 1, name: "buzzer_sleep" },
        65: { level: 1, name: "buzzer_button_stop_enable" },
        66: { level: 1, name: "buzzer_silent_time" },
        67: { level: 1, name: "tamper_alarm_enable" },
        68: { level: 1, name: "tvoc_raw_reporting_enable" },
        69: { level: 1, name: "temperature_alarm_settings" },
        "6a": { level: 1, name: "pm1_0_alarm_settings" },
        "6b": { level: 1, name: "pm2_5_alarm_settings" },
        "6c": { level: 1, name: "pm10_alarm_settings" },
        "6d": { level: 1, name: "tvoc_alarm_settings" },
        "6e": { level: 1, name: "vaping_index_alarm_settings" },
        "6f": { level: 1, name: "alarm_reporting_times" },
        70: { level: 1, name: "alarm_deactivation_enable" },
        71: { level: 1, name: "temperature_calibration_settings" },
        72: { level: 1, name: "humidity_calibration_settings" },
        73: { level: 1, name: "pm1_0_calibration_settings" },
        74: { level: 1, name: "pm2_5_calibration_settings" },
        75: { level: 1, name: "pm10_calibration_settings" },
        76: { level: 1, name: "tvoc_calibration_settings" },
        77: { level: 1, name: "vaping_index_calibration_settings" },
        c6: { level: 1, name: "daylight_saving_time" },
        c7: { level: 1, name: "time_zone" },
        be: { level: 1, name: "reboot" },
        b6: { level: 0, name: "reconnect" },
        b8: { level: 0, name: "synchronize_time" },
        b9: { level: 0, name: "query_device_status" },
        "5f": { level: 0, name: "stop_buzzer_alarm" },
        "5e": { level: 0, name: "execute_tvoc_self_clean" },
    };

    var data = name_map[type];
    if (data === undefined) return "unknown";
    return data.name;
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

function readFloat16LE(bytes) {
    var bits = (bytes[1] << 8) | bytes[0];
    var sign = bits >>> 15 === 0 ? 1.0 : -1.0;
    var e = (bits >>> 10) & 0x1f;
    var m = e === 0 ? (bits & 0x3ff) << 1 : (bits & 0x3ff) | 0x400;
    var f = sign * m * Math.pow(2, e - 25);

    var n = Number(f.toFixed(2));
    return n;
}

function readFloatLE(bytes) {
    var bits = (bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0];
    var sign = bits >>> 31 === 0 ? 1.0 : -1.0;
    var e = (bits >>> 23) & 0xff;
    var m = e === 0 ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
    var f = sign * m * Math.pow(2, e - 150);
    return Number(f.toFixed(3));
}

function readString(bytes) {
    var str = "";
    var i = 0;
    var byte1, byte2, byte3, byte4;
    while (i < bytes.length) {
        byte1 = bytes[i++];
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

function readHexString(bytes) {
    var temp = [];
    for (var idx = 0; idx < bytes.length; idx++) {
        temp.push(("0" + (bytes[idx] & 0xff).toString(16)).slice(-2));
    }
    return temp.join("");
}

function getValue(map, key) {
    if (RAW_VALUE) return key;
    var value = map[key];
    if (!value) value = "unknown";
    return value;
}
