/**
 * Payload Encoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product WT101
 */
var RAW_VALUE = 0x00;

/* eslint no-redeclare: "off" */
/* eslint-disable */
// Chirpstack v4
function encodeDownlink(input) {
    var encoded = milesightDeviceEncode(input.data);
    return { bytes: encoded };
}

// Chirpstack v3
function Encode(fPort, obj) {
    var encoded = milesightDeviceEncode(obj);
    return encoded;
}

// The Things Network
function Encoder(obj, port) {
    return milesightDeviceEncode(obj);
}
/* eslint-enable */

function milesightDeviceEncode(payload) {
    var encoded = [];

    if ("reboot" in payload) {
        encoded = encoded.concat(reboot(payload.reboot));
    }
    if ("report_status" in payload) {
        encoded = encoded.concat(reportStatus(payload.report_status));
    }
    if ("report_heating_date" in payload) {
        encoded = encoded.concat(reportHeatingDate(payload.report_heating_date));
    }
    if ("report_heating_schedule" in payload) {
        encoded = encoded.concat(reportHeatingSchedule(payload.report_heating_schedule));
    }
    if ("sync_time" in payload) {
        encoded = encoded.concat(syncTime(payload.sync_time));
    }
    if ("report_interval" in payload) {
        encoded = encoded.concat(setReportInterval(payload.report_interval));
    }
    if ("time_zone" in payload) {
        encoded = encoded.concat(setTimeZone(payload.time_zone));
    }
    if ("time_sync_enable" in payload) {
        encoded = encoded.concat(setTimeSyncEnable(payload.time_sync_enable));
    }
    if ("temperature_calibration_settings" in payload) {
        encoded = encoded.concat(setTemperatureCalibration(payload.temperature_calibration_settings));
    }
    if ("temperature_control" in payload && "enable" in payload.temperature_control) {
        encoded = encoded.concat(setTemperatureControl(payload.temperature_control.enable));
    }
    if ("temperature_control" in payload && "mode" in payload.temperature_control) {
        encoded = encoded.concat(setTemperatureControlMode(payload.temperature_control.mode));
    }
    if ("target_temperature" in payload) {
        encoded = encoded.concat(setTargetTemperature(payload.target_temperature, payload.temperature_tolerance));
    }
    if ("target_temperature_range" in payload) {
        encoded = encoded.concat(setTargetTemperatureRange(payload.target_temperature_range));
    }
    if ("open_window_detection" in payload) {
        encoded = encoded.concat(setOpenWindowDetection(payload.open_window_detection));
    }
    if ("restore_open_window_detection" in payload) {
        encoded = encoded.concat(restoreOpenWindowDetection(payload.restore_open_window_detection));
    }
    if ("valve_opening" in payload) {
        encoded = encoded.concat(setValveOpening(payload.valve_opening));
    }
    if ("valve_calibration" in payload) {
        encoded = encoded.concat(setValveCalibration(payload.valve_calibration));
    }
    if ("valve_control_algorithm" in payload) {
        encoded = encoded.concat(setValveControlAlgorithm(payload.valve_control_algorithm));
    }
    if ("freeze_protection_config" in payload) {
        encoded = encoded.concat(setFreezeProtection(payload.freeze_protection_config));
    }
    if ("child_lock_config" in payload) {
        encoded = encoded.concat(setChildLockEnable(payload.child_lock_config.enable));
    }
    if ("offline_control_mode" in payload) {
        encoded = encoded.concat(setOfflineControlMode(payload.offline_control_mode));
    }
    if ("outside_temperature" in payload) {
        encoded = encoded.concat(setOutsideTemperature(payload.outside_temperature));
    }
    if ("outside_temperature_control" in payload) {
        encoded = encoded.concat(setOutsideTemperatureControl(payload.outside_temperature_control));
    }
    if ("display_ambient_temperature" in payload) {
        encoded = encoded.concat(setDisplayAmbientTemperature(payload.display_ambient_temperature));
    }
    if ("window_detection_valve_strategy" in payload) {
        encoded = encoded.concat(setWindowDetectionValveStrategy(payload.window_detection_valve_strategy));
    }
    if ("dst_config" in payload) {
        encoded = encoded.concat(setDaylightSavingTime(payload.dst_config));
    }
    if ("effective_stroke" in payload) {
        encoded = encoded.concat(setEffectiveStroke(payload.effective_stroke));
    }
    if ("heating_date" in payload) {
        encoded = encoded.concat(setHeatingDate(payload.heating_date));
    }
    if ("heating_schedule" in payload) {
        for (var i = 0; i < payload.heating_schedule.length; i++) {
            encoded = encoded.concat(setHeatingSchedule(payload.heating_schedule[i]));
        }
    }
    if ("change_report_enable" in payload) {
        encoded = encoded.concat(setChangeReportEnable(payload.change_report_enable));
    }
    return encoded;
}

/**
 * device reboot
 * @param {number} reboot, values: (0: no, 1: yes)
 * @example { "reboot": 1 }
 */
function reboot(reboot) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(reboot) == -1) {
        throw new Error("reboot must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, reboot) === 0) {
        return [];
    }
    return [0xff, 0x10, 0xff];
}

/**
 * sync time
 * @param {number} sync_time, values: (0: no, 1: yes)
 * @example { "sync_time": 1 }
 */
function syncTime(sync_time) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(sync_time) === -1) {
        throw new Error("sync_time must be one of " + yes_no_values.join(", "));
    }

    if (sync_time === 0) {
        return [];
    }
    return [0xff, 0x4a, 0xff];
}

/**
 * report status
 * @param {number} report_status, values: (0: no, 1: yes)
 * @example { "report_status": 1 }
 */
function reportStatus(report_status) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(report_status) == -1) {
        throw new Error("report_status must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, report_status) === 0) {
        return [];
    }
    return [0xff, 0x28, 0x00];
}

/**
 * report heating date
 * @param {number} report_heating_date values: (0: no, 1: yes)
 * @example { "report_heating_date": 1 }
 */
function reportHeatingDate(report_heating_date) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(report_heating_date) == -1) {
        throw new Error("report_heating_date must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, report_heating_date) === 0) {
        return [];
    }
    return [0xff, 0x28, 0x01];
}

/**
 * report heating schedule
 * @param {number} report_heating_schedule values: (0: no, 1: yes)
 * @example { "report_heating_schedule": 1 }
 */
function reportHeatingSchedule(report_heating_schedule) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(report_heating_schedule) == -1) {
        throw new Error("report_heating_schedule must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, report_heating_schedule) === 0) {
        return [];
    }
    return [0xff, 0x28, 0x02];
}

/**
 * report interval configuration
 * @param {number} report_interval uint: minute, range: [1, 1440]
 * @example { "report_interval": 10 }
 */
function setReportInterval(report_interval) {
    if (typeof report_interval !== "number") {
        throw new Error("report_interval must be a number");
    }
    if (report_interval < 1 || report_interval > 1440) {
        throw new Error("report_interval must be between 1 and 1440");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x8e);
    buffer.writeUInt8(0x00);
    buffer.writeUInt16LE(report_interval);
    return buffer.toBytes();
}

/**
 * time sync configuration
 * @param {number} time_sync_enable values: (0: disable, 1: enable)
 * @example { "time_sync_enable": 0 }
 */
function setTimeSyncEnable(time_sync_enable) {
    var enable_map = { 0: "disable", 2: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(time_sync_enable) == -1) {
        throw new Error("time_sync_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x3b);
    buffer.writeUInt8(getValue(enable_map, time_sync_enable));
    return buffer.toBytes();
}

/**
 * temperature calibration configuration
 * @param {object} temperature_calibration_settings
 * @param {number} temperature_calibration_settings.enable values: (0: disable, 1: enable)
 * @param {number} temperature_calibration_settings.calibration_value uint: Celsius
 * @example { "temperature_calibration_settings": { "enable": 1, "calibration_value": 5 } }
 * @example { "temperature_calibration_settings": { "enable": 1, "calibration_value": -5 } }
 * @example { "temperature_calibration_settings": { "enable": 0 } }
 */
function setTemperatureCalibration(temperature_calibration_settings) {
    var enable = temperature_calibration_settings.enable;
    var calibration_value = temperature_calibration_settings.calibration_value;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) == -1) {
        throw new Error("temperature_calibration_settings.enable must be one of " + enable_values.join(", "));
    }
    if (enable && typeof calibration_value !== "number") {
        throw new Error("temperature_calibration_settings.calibration_value must be a number");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xab);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeInt16LE(calibration_value * 10);
    return buffer.toBytes();
}

/**
 * temperature control enable configuration
 * @param {number} enable values: (0: disable, 1: enable)
 * @example { "temperature_control": { "enable": 1 } }
 */
function setTemperatureControl(enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) == -1) {
        throw new Error("temperature_control.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xb3);
    buffer.writeUInt8(getValue(enable_map, enable));
    return buffer.toBytes();
}

/**
 * temperature control mode configuration
 * @param {number} mode, values: (0: auto, 1: manual)
 * @example { "temperature_control": { "mode": 0 } }
 * @example { "temperature_control": { "mode": 1 } }
 */
function setTemperatureControlMode(mode) {
    var temperature_control_mode_map = { 0: "auto", 1: "manual" };
    var temperature_control_mode_values = getValues(temperature_control_mode_map);
    if (temperature_control_mode_values.indexOf(mode) == -1) {
        throw new Error("temperature_control.mode must be one of " + temperature_control_mode_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xae);
    buffer.writeUInt8(getValue(temperature_control_mode_map, mode));
    return buffer.toBytes();
}

/**
 * temperature target configuration
 * @param {number} target_temperature uint: Celsius
 * @param {number} temperature_tolerance uint: Celsius
 * @example { "target_temperature": 10, "temperature_tolerance": 0.1 }
 * @example { "target_temperature": 28, "temperature_tolerance": 5 }
 */
function setTargetTemperature(target_temperature, temperature_tolerance) {
    if (typeof target_temperature !== "number") {
        throw new Error("target_temperature must be a number");
    }
    if (typeof temperature_tolerance !== "number") {
        throw new Error("temperature_tolerance must be a number");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xb1);
    buffer.writeInt8(target_temperature);
    buffer.writeUInt16LE(temperature_tolerance * 10);
    return buffer.toBytes();
}

/**
 * set target temperature range
 * @since v1.3
 * @param {object} target_temperature_range
 * @param {number} target_temperature_range.min unit: °C, range: [5, 15]
 * @param {number} target_temperature_range.max unit: °C, range: [16, 35]
 * @example { "target_temperature_range": { "min": 5, "max": 16 } }
 */
function setTargetTemperatureRange(target_temperature_range) {
    var min = target_temperature_range.min;
    var max = target_temperature_range.max;

    if (typeof min !== "number") {
        throw new Error("target_temperature_range.min must be a number");
    }
    if (min < 5 || min > 15) {
        throw new Error("target_temperature_range.min must be between 5 and 15");
    }
    if (typeof max !== "number") {
        throw new Error("target_temperature_range.max must be a number");
    }
    if (max < 16 || max > 35) {
        throw new Error("target_temperature_range.max must be between 16 and 35");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x35);
    buffer.writeUInt8(min);
    buffer.writeUInt8(max);
    return buffer.toBytes();
}

/**
 * open window detection configuration
 * @param {object} open_window_detection
 * @param {number} open_window_detection.enable, values: (0: disable, 1: enable)
 * @param {number} open_window_detection.temperature_threshold uint: Celsius
 * @param {number} open_window_detection.time uint: minute
 * @example { "open_window_detection": { "enable": 1, "temperature_threshold": 2, "time": 1 } }
 * @example { "open_window_detection": { "enable": 1, "temperature_threshold": 10, "time": 1440 } }
 * @example { "open_window_detection": { "enable": 0 } }
 */
function setOpenWindowDetection(open_window_detection) {
    var enable = open_window_detection.enable;
    var temperature_threshold = open_window_detection.temperature_threshold;
    var time = open_window_detection.time;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) == -1) {
        throw new Error("open_window_detection.enable must be one of " + enable_values.join(", "));
    }
    if (enable && typeof temperature_threshold !== "number") {
        throw new Error("open_window_detection.temperature_threshold must be a number");
    }
    if (enable && typeof time !== "number") {
        throw new Error("open_window_detection.time must be a number");
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xaf);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeInt8(temperature_threshold * 10);
    buffer.writeUInt16LE(time);
    return buffer.toBytes();
}

/**
 * restore open window detection status
 * @param {number} restore_open_window_detection values: (0: no, 1: yes)
 * @example { "restore_open_window_detection": 1 }
 */
function restoreOpenWindowDetection(restore_open_window_detection) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(restore_open_window_detection) == -1) {
        throw new Error("restore_open_window_detection must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, restore_open_window_detection) === 0) {
        return [];
    }
    return [0xff, 0x57, 0xff];
}

/**
 * valve opening configuration
 * @param {number} valve_opening uint: percentage, range: [0, 100]
 * @example { "valve_opening": 50 }
 */
function setValveOpening(valve_opening) {
    if (typeof valve_opening !== "number") {
        throw new Error("valve_opening must be a number");
    }
    if (valve_opening < 0 || valve_opening > 100) {
        throw new Error("valve_opening must be between 0 and 100");
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xb4);
    buffer.writeUInt8(valve_opening);
    return buffer.toBytes();
}

/**
 * valve calibration
 * @param {number} valve_calibration values: (0: no, 1: yes)
 * @example { "valve_calibration": 1 }
 */
function setValveCalibration(valve_calibration) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(valve_calibration) == -1) {
        throw new Error("valve_calibration must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, valve_calibration) === 0) {
        return [];
    }
    return [0xff, 0xad, 0xff];
}

/**
 * valve control algorithm
 * @param {number} valve_control_algorithm values: (0: rate, 1: pid)
 * @example { "valve_control_algorithm": 0 }
 */
function setValveControlAlgorithm(valve_control_algorithm) {
    var valve_control_algorithm_map = { 0: "rate", 1: "pid" };
    var valve_control_algorithm_values = getValues(valve_control_algorithm_map);
    if (valve_control_algorithm_values.indexOf(valve_control_algorithm) == -1) {
        throw new Error("valve_control_algorithm must be one of " + valve_control_algorithm_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xac);
    buffer.writeUInt8(getValue(valve_control_algorithm_map, valve_control_algorithm));
    return buffer.toBytes();
}

/**
 * freeze protection configuration
 * @param {object} freeze_protection_config
 * @param {number} freeze_protection_config.enable values: (0: disable, 1: enable)
 * @param {number} freeze_protection_config.temperature uint: Celsius
 * @example { "freeze_protection_config": { "enable": 1, "temperature": 5 } }
 * @example { "freeze_protection_config": { "enable": 0 } }
 */
function setFreezeProtection(freeze_protection_config) {
    var enable = freeze_protection_config.enable;
    var temperature = freeze_protection_config.temperature;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) == -1) {
        throw new Error("freeze_protection_config.enable must be one of " + enable_values.join(", "));
    }
    if (enable && typeof temperature !== "number") {
        throw new Error("freeze_protection_config.temperature must be a number");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xb0);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeInt16LE(temperature * 10);
    return buffer.toBytes();
}

/**
 * child lock configuration
 * @param {number} enable values: (0: disable, 1: enable)
 * @example { "child_lock_config": { "enable": 1 } }
 */
function setChildLockEnable(enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) == -1) {
        throw new Error("child_lock_config.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x25);
    buffer.writeUInt8(getValue(enable_map, enable));
    return buffer.toBytes();
}

/**
 * offline control mode configuration
 * @since v1.3
 * @param {number} offline_control_mode values: (0: keep, 1: embedded temperature control, 2: off)
 * @example { "offline_control_mode": 0 }
 */
function setOfflineControlMode(offline_control_mode) {
    var offline_control_mode_map = { 0: "keep", 1: "embedded temperature control", 2: "off" };
    var offline_control_mode_values = getValues(offline_control_mode_map);
    if (offline_control_mode_values.indexOf(offline_control_mode) === -1) {
        throw new Error("offline_control_mode must be one of " + offline_control_mode_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xf8);
    buffer.writeUInt8(getValue(offline_control_mode_map, offline_control_mode));
    return buffer.toBytes();
}

/**
 * set outside temperature
 * @since v1.3
 * @param {number} outside_temperature, unit: celsius
 * @example { "outside_temperature": 25 }
 */
function setOutsideTemperature(outside_temperature) {
    if (typeof outside_temperature !== "number") {
        throw new Error("outside_temperature must be a number");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0x03);
    buffer.writeInt16LE(outside_temperature * 10);
    buffer.writeUInt8(0xff);
    return buffer.toBytes();
}

/**
 * set outside temperature control
 * @since v1.3
 * @param {object} outside_temperature_control
 * @param {number} outside_temperature_control.enable values: (0: disable, 1: enable)
 * @param {number} outside_temperature_control.timeout, unit: minute, range: [3, 60]
 * @example { "outside_temperature_control": { "enable": 1, "timeout": 10 } }
 */
function setOutsideTemperatureControl(outside_temperature_control) {
    var enable = outside_temperature_control.enable;
    var timeout = outside_temperature_control.timeout;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("outside_temperature_control.enable must be one of " + enable_values.join(", "));
    }
    if (enable && typeof timeout !== "number") {
        throw new Error("outside_temperature_control.timeout must be a number");
    }
    if (enable && (timeout < 3 || timeout > 60)) {
        throw new Error("outside_temperature_control.timeout must be between 3 and 60");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xc4);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(timeout);
    return buffer.toBytes();
}

/**
 * set display ambient temperature
 * @since v1.3
 * @param {number} display_ambient_temperature values: (0: disable, 1: enable)
 * @example { "display_ambient_temperature": 1 }
 */
function setDisplayAmbientTemperature(display_ambient_temperature) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(display_ambient_temperature) === -1) {
        throw new Error("display_ambient_temperature must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x36);
    buffer.writeUInt8(getValue(enable_map, display_ambient_temperature));
    return buffer.toBytes();
}

/**
 * set window detection valve strategy
 * @since v1.3
 * @param {number} window_detection_valve_strategy values: (0: keep, 1: close)
 * @example { "window_detection_valve_strategy": 0 }
 */
function setWindowDetectionValveStrategy(window_detection_valve_strategy) {
    var window_detection_valve_strategy_map = { 0: "keep", 1: "close" };
    var window_detection_valve_strategy_values = getValues(window_detection_valve_strategy_map);
    if (window_detection_valve_strategy_values.indexOf(window_detection_valve_strategy) === -1) {
        throw new Error("window_detection_valve_strategy must be one of " + window_detection_valve_strategy_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x37);
    buffer.writeUInt8(getValue(window_detection_valve_strategy_map, window_detection_valve_strategy));
    return buffer.toBytes();
}

/**
 * set daylight saving time
 * @since v1.3
 * @param {number} enable values: (0: disable, 1: enable)
 * @param {number} offset, unit: minute
 * @param {number} start_month, values: (1: January, 2: February, 3: March, 4: April, 5: May, 6: June, 7: July, 8: August, 9: September, 10: October, 11: November, 12: December)
 * @param {number} start_week_num, range: [1, 5]
 * @param {number} start_week_day, range: [1, 7]
 * @param {number} start_time, unit: minute, convert: "hh:mm" -> "hh * 60 + mm"
 * @param {number} end_month, values: (1: January, 2: February, 3: March, 4: April, 5: May, 6: June, 7: July, 8: August, 9: September, 10: October, 11: November, 12: December)
 * @param {number} end_week_num, range: [1, 5]
 * @param {number} end_week_day, range: [1, 7]
 * @param {number} end_time, unit: minute, convert: "hh:mm" -> "hh * 60 + mm"
 * @example { "dst_config": { "enable": 1, "offset": 60, "start_month": 3, "start_week_num": 2, "start_week_day": 7, "start_time": 120, "end_month": 1, "end_week_num": 4, "end_week_day": 1, "end_time": 180 } }
 */
function setDaylightSavingTime(dst_config) {
    var enable = dst_config.enable;
    var offset = dst_config.offset;
    var start_month = dst_config.start_month;
    var start_week_num = dst_config.start_week_num;
    var start_week_day = dst_config.start_week_day;
    var start_time = dst_config.start_time;
    var end_month = dst_config.end_month;
    var end_week_num = dst_config.end_week_num;
    var end_week_day = dst_config.end_week_day;
    var end_time = dst_config.end_time;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("dst_config.enable must be one of " + enable_values.join(", "));
    }
    var month_values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    if (enable && month_values.indexOf(start_month) === -1) {
        throw new Error("dst_config.start_month must be one of " + month_values.join(", "));
    }
    if (enable && month_values.indexOf(end_month) === -1) {
        throw new Error("dst_config.end_month must be one of " + month_values.join(", "));
    }
    var week_values = [1, 2, 3, 4, 5, 6, 7];
    if (enable && week_values.indexOf(start_week_day) === -1) {
        throw new Error("dst_config.start_week_day must be one of " + week_values.join(", "));
    }

    var buffer = new Buffer(12);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xba);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeInt8(offset);
    buffer.writeUInt8(start_month);
    buffer.writeUInt8((start_week_num << 4) | start_week_day);
    buffer.writeUInt16LE(start_time);
    buffer.writeUInt8(end_month);
    buffer.writeUInt8((end_week_num << 4) | end_week_day);
    buffer.writeUInt16LE(end_time);
    return buffer.toBytes();
}

/**
 * set time zone
 * @param {number} time_zone unit: minute, convert: "hh:mm" -> "hh * 60 + mm", values: ( -720: UTC-12, -660: UTC-11, -600: UTC-10, -570: UTC-9:30, -540: UTC-9, -480: UTC-8, -420: UTC-7, -360: UTC-6, -300: UTC-5, -240: UTC-4, -210: UTC-3:30, -180: UTC-3, -120: UTC-2, -60: UTC-1, 0: UTC, 60: UTC+1, 120: UTC+2, 180: UTC+3, 240: UTC+4, 300: UTC+5, 360: UTC+6, 420: UTC+7, 480: UTC+8, 540: UTC+9, 570: UTC+9:30, 600: UTC+10, 660: UTC+11, 720: UTC+12, 765: UTC+12:45, 780: UTC+13, 840: UTC+14 )
 * @example { "time_zone": 480 }
 * @example { "time_zone": -240 }
 */
function setTimeZone(time_zone) {
    var timezone_map = { "-720": "UTC-12", "-660": "UTC-11", "-600": "UTC-10", "-570": "UTC-9:30", "-540": "UTC-9", "-480": "UTC-8", "-420": "UTC-7", "-360": "UTC-6", "-300": "UTC-5", "-240": "UTC-4", "-210": "UTC-3:30", "-180": "UTC-3", "-120": "UTC-2", "-60": "UTC-1", 0: "UTC", 60: "UTC+1", 120: "UTC+2", 180: "UTC+3", 210: "UTC+3:30", 240: "UTC+4", 270: "UTC+4:30", 300: "UTC+5", 330: "UTC+5:30", 345: "UTC+5:45", 360: "UTC+6", 390: "UTC+6:30", 420: "UTC+7", 480: "UTC+8", 540: "UTC+9", 570: "UTC+9:30", 600: "UTC+10", 630: "UTC+10:30", 660: "UTC+11", 720: "UTC+12", 765: "UTC+12:45", 780: "UTC+13", 840: "UTC+14" };
    var timezone_values = getValues(timezone_map);
    if (timezone_values.indexOf(time_zone) === -1) {
        throw new Error("time_zone must be one of " + timezone_values.join(", "));
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xbd);
    buffer.writeInt16LE(getValue(timezone_map, time_zone));
    return buffer.toBytes();
}

/**
 * set effective stroke rate
 * @since v1.3
 * @param {object} effective_stroke
 * @param {number} effective_stroke.enable values: (0: disable, 1: enable)
 * @param {number} effective_stroke.rate range: [0, 100]
 * @example { "effective_stroke": { "enable": 1, "rate": 50 } }
 */
function setEffectiveStroke(effective_stroke) {
    var enable = effective_stroke.enable;
    var rate = effective_stroke.rate;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("effective_stroke.enable must be one of " + enable_values.join(", "));
    }
    if (enable && (rate < 0 || rate > 100)) {
        throw new Error("effective_stroke.rate must be between 0 and 100");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x38);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(rate);
    return buffer.toBytes();
}

/**
 * set heating date
 * @since v1.3
 * @param {object} heating_date
 * @param {number} heating_date.enable values: (0: disable, 1: enable)
 * @param {number} heating_date.start_month values: (1: January, 2: February, 3: March, 4: April, 5: May, 6: June, 7: July, 8: August, 9: September, 10: October, 11: November, 12: December)
 * @param {number} heating_date.start_day values: [1, 31]
 * @param {number} heating_date.end_month values: (1: January, 2: February, 3: March, 4: April, 5: May, 6: June, 7: July, 8: August, 9: September, 10: October, 11: November, 12: December)
 * @param {number} heating_date.end_day values: [1, 31]
 * @param {number} heating_date.report_interval unit: minute
 * @example { "heating_date": { "enable": 1, "start_month": 10, "start_day": 1, "end_month": 4, "end_day": 30, "report_interval": 720 } }
 */
function setHeatingDate(heating_date) {
    var enable = heating_date.enable;
    var start_month = heating_date.start_month;
    var start_day = heating_date.start_day;
    var end_month = heating_date.end_month;
    var end_day = heating_date.end_day;
    var report_interval = heating_date.report_interval;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("heating_date.enable must be one of " + enable_values.join(", "));
    }
    var month_values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    if (enable && month_values.indexOf(start_month) === -1) {
        throw new Error("heating_date.start_month must be one of " + month_values.join(", "));
    }
    if (enable && month_values.indexOf(end_month) === -1) {
        throw new Error("heating_date.end_month must be one of " + month_values.join(", "));
    }

    var buffer = new Buffer(9);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x33);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt16LE(report_interval);
    buffer.writeUInt8(start_month);
    buffer.writeUInt8(start_day);
    buffer.writeUInt8(end_month);
    buffer.writeUInt8(end_day);
    return buffer.toBytes();
}

/**
 * set heating schedule
 * @since v1.3
 * @param {object} heating_schedule
 * @param {number} heating_schedule.index range: [1, 16]
 * @param {number} heating_schedule.enable values: (0: disable, 1: enable)
 * @param {number} heating_schedule.temperature_control_mode values: (0: auto, 1: manual)
 * @param {number} heating_schedule.value temperature_control_mode=0, value means target_temperature, temperature_control_mode=1, value means valve_opening
 * @param {number} heating_schedule.report_interval unit: minute
 * @param {number} heating_schedule.execute_time unit: minute, convert: "hh:mm" -> "hh * 60 + mm"
 * @param {object} heating_schedule.week_recycle
 * @param {number} heating_schedule.week_recycle.monday values: (0: disable, 1: enable)
 * @param {number} heating_schedule.week_recycle.tuesday values: (0: disable, 1: enable)
 * @param {number} heating_schedule.week_recycle.wednesday values: (0: disable, 1: enable)
 * @param {number} heating_schedule.week_recycle.thursday values: (0: disable, 1: enable)
 * @param {number} heating_schedule.week_recycle.friday values: (0: disable, 1: enable)
 * @param {number} heating_schedule.week_recycle.saturday values: (0: disable, 1: enable)
 * @param {number} heating_schedule.week_recycle.sunday values: (0: disable, 1: enable)
 * @example { "heating_schedule": [{ "index": 1, "enable": 1, "temperature_control_mode": 0, "value": 20, "report_interval": 10, "execute_time": 480, "week_recycle": { "monday": 1, "tuesday": 1, "wednesday": 1, "thursday": 1, "friday": 1, "saturday": 1, "sunday": 1 } }] }
 */
function setHeatingSchedule(heating_schedule) {
    var index = heating_schedule.index;
    var enable = heating_schedule.enable;
    var temperature_control_mode = heating_schedule.temperature_control_mode;
    var value = heating_schedule.value;
    var report_interval = heating_schedule.report_interval;
    var execute_time = heating_schedule.execute_time;
    var week_recycle = heating_schedule.week_recycle;

    if (index < 1 || index > 16) {
        throw new Error("heating_schedule._item.index must be between 1 and 16");
    }
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("heating_schedule._item.enable must be one of " + enable_values.join(", "));
    }
    var temperature_control_mode_map = { 0: "auto", 1: "manual" };
    var temperature_control_mode_values = getValues(temperature_control_mode_map);
    if (temperature_control_mode_values.indexOf(temperature_control_mode) === -1) {
        throw new Error("heating_schedule._item.temperature_control_mode must be one of " + temperature_control_mode_values.join(", "));
    }
    if (enable && (report_interval < 1 || report_interval > 1440)) {
        throw new Error("heating_schedule._item.report_interval must be between 1 and 1440");
    }

    var week_day_offset = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 7 };
    var days = 0x00;
    for (var day in week_recycle) {
        if (enable_values.indexOf(week_recycle[day]) === -1) {
            throw new Error("heating_schedule._item.week_recycle." + day + " must be one of " + enable_values.join(", "));
        }
        days |= getValue(enable_map, week_recycle[day]) << week_day_offset[day];
    }

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x34);
    buffer.writeUInt8(index - 1);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(getValue(temperature_control_mode_map, temperature_control_mode));
    buffer.writeUInt8(value);
    buffer.writeUInt16LE(report_interval);
    buffer.writeUInt16LE(execute_time);
    buffer.writeUInt8(days);
    return buffer.toBytes();
}

/**
 * set change reportable.
 * @since v1.3
 * @description When the device status changes (target_temperature, valve_opening), the device will report the status to the server.
 * @param {number} change_report_enable values: (0: disable, 1: enable)
 * @example { "change_report_enable": 1 }
 */
function setChangeReportEnable(change_report_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(change_report_enable) === -1) {
        throw new Error("change_report_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x3a);
    buffer.writeUInt8(getValue(enable_map, change_report_enable));
    return buffer.toBytes();
}

function getValues(map) {
    var values = [];
    for (var key in map) {
        values.push(RAW_VALUE ? parseInt(key) : map[key]);
    }
    return values;
}

function getValue(map, value) {
    if (RAW_VALUE) return value;

    for (var key in map) {
        if (map[key] === value) {
            return parseInt(key);
        }
    }

    throw new Error("not match in " + JSON.stringify(map));
}

function Buffer(size) {
    this.buffer = new Array(size);
    this.offset = 0;

    for (var i = 0; i < size; i++) {
        this.buffer[i] = 0;
    }
}

Buffer.prototype._write = function (value, byteLength, isLittleEndian) {
    var offset = 0;
    for (var index = 0; index < byteLength; index++) {
        offset = isLittleEndian ? index << 3 : (byteLength - 1 - index) << 3;
        this.buffer[this.offset + index] = (value >> offset) & 0xff;
    }
};

Buffer.prototype.writeUInt8 = function (value) {
    this._write(value, 1, true);
    this.offset += 1;
};

Buffer.prototype.writeInt8 = function (value) {
    this._write(value < 0 ? value + 0x100 : value, 1, true);
    this.offset += 1;
};

Buffer.prototype.writeUInt16LE = function (value) {
    this._write(value, 2, true);
    this.offset += 2;
};

Buffer.prototype.writeInt16LE = function (value) {
    this._write(value < 0 ? value + 0x10000 : value, 2, true);
    this.offset += 2;
};

Buffer.prototype.writeUInt32LE = function (value) {
    this._write(value, 4, true);
    this.offset += 4;
};

Buffer.prototype.writeInt32LE = function (value) {
    this._write(value < 0 ? value + 0x100000000 : value, 4, true);
    this.offset += 4;
};

Buffer.prototype.toBytes = function () {
    return this.buffer;
};
