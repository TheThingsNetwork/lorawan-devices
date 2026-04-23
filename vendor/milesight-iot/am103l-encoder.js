/**
 * Payload Encoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product AM103L
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
    return milesightDeviceEncode(obj);
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
    if ("report_interval" in payload) {
        encoded = encoded.concat(setReportInterval(payload.report_interval));
    }
    if ("time_zone" in payload) {
        encoded = encoded.concat(setTimeZone(payload.time_zone));
    }
    if ("timestamp" in payload) {
        encoded = encoded.concat(setTimestamp(payload.timestamp));
    }
    if ("time_sync_enable" in payload) {
        encoded = encoded.concat(setTimeSyncEnable(payload.time_sync_enable));
    }
    if ("report_schedule_config" in payload) {
        encoded = encoded.concat(setReportScheduleConfig(payload.report_schedule_config));
    }
    if ("clear_report_schedule" in payload) {
        encoded = encoded.concat(clearReportSchedule(payload.clear_report_schedule));
    }
    if ("led_indicator_mode" in payload) {
        encoded = encoded.concat(setLedIndicatorMode(payload.led_indicator_mode));
    }
    if ("reset_battery" in payload) {
        encoded = encoded.concat(resetBattery(payload.reset_battery));
    }
    if ("temperature_alarm_config" in payload) {
        encoded = encoded.concat(setTemperatureAlarmConfig(payload.temperature_alarm_config));
    }
    if ("co2_calibration_settings" in payload) {
        encoded = encoded.concat(setCO2CalibrationSettings(payload.co2_calibration_settings));
    }
    if ("co2_alarm_config" in payload) {
        encoded = encoded.concat(setCO2AlarmConfig(payload.co2_alarm_config));
    }
    if ("co2_abc_calibration_settings" in payload) {
        encoded = encoded.concat(setCO2AutoBackgroundCalibrationSettings(payload.co2_abc_calibration_settings));
    }
    if ("altitude_calibration_settings" in payload) {
        encoded = encoded.concat(setAltitudeCalibrationSettings(payload.altitude_calibration_settings));
    }
    if ("retransmit_enable" in payload) {
        encoded = encoded.concat(setRetransmitEnable(payload.retransmit_enable));
    }
    if ("retransmit_interval" in payload) {
        encoded = encoded.concat(setRetransmitInterval(payload.retransmit_interval));
    }
    if ("resend_interval" in payload) {
        encoded = encoded.concat(setResendInterval(payload.resend_interval));
    }
    if ("history_enable" in payload) {
        encoded = encoded.concat(setHistoryEnable(payload.history_enable));
    }
    if ("fetch_history" in payload) {
        encoded = encoded.concat(fetchHistory(payload.fetch_history));
    }
    if ("stop_transmit" in payload) {
        encoded = encoded.concat(stopTransmit(payload.stop_transmit));
    }
    if ("clear_history" in payload) {
        encoded = encoded.concat(clearHistory(payload.clear_history));
    }

    return encoded;
}

/**
 * reboot
 * @param {number} reboot values: (0: no, 1: yes)
 * @example { "reboot": 1 }
 */
function reboot(reboot) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(reboot) === -1) {
        throw new Error("reboot must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, reboot) === 0) {
        return [];
    }
    return [0xff, 0x10, 0xff];
}

/**
 * report interval
 * @param {number} report_interval unit: second
 * @example { "report_interval": 300 }
 */
function setReportInterval(report_interval) {
    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x03);
    buffer.writeUInt16LE(report_interval);
    return buffer.toBytes();
}

/**
 * set time zone
 * @param {number} time_zone unit: minute, UTC+8 -> 8 * 10 = 80
 * @example { "time_zone": 80 }
 */
function setTimeZone(time_zone) {
    var timezone_map = { "-120": "UTC-12", "-110": "UTC-11", "-100": "UTC-10", "-95": "UTC-9:30", "-90": "UTC-9", "-80": "UTC-8", "-70": "UTC-7", "-60": "UTC-6", "-50": "UTC-5", "-40": "UTC-4", "-35": "UTC-3:30", "-30": "UTC-3", "-20": "UTC-2", "-10": "UTC-1", 0: "UTC", 10: "UTC+1", 20: "UTC+2", 30: "UTC+3", 35: "UTC+3:30", 40: "UTC+4", 45: "UTC+4:30", 50: "UTC+5", 55: "UTC+5:30", 57: "UTC+5:45", 60: "UTC+6", 65: "UTC+6:30", 70: "UTC+7", 80: "UTC+8", 90: "UTC+9", 95: "UTC+9:30", 100: "UTC+10", 105: "UTC+10:30", 110: "UTC+11", 120: "UTC+12", 127: "UTC+12:45", 130: "UTC+13", 140: "UTC+14" };
    var timezone_values = getValues(timezone_map);
    if (timezone_values.indexOf(time_zone) === -1) {
        throw new Error("time_zone must be one of " + timezone_values.join(", "));
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x17);
    buffer.writeInt16LE(getValue(timezone_map, time_zone));
    return buffer.toBytes();
}

/**
 * timestamp
 * @param {number} timestamp unit: second
 * @example { "timestamp": 1717756800 }
 */
function setTimestamp(timestamp) {
    if (typeof timestamp !== "number") {
        throw new Error("timestamp must be a number");
    }
    if (timestamp < 0) {
        throw new Error("timestamp must be greater than 0");
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x11);
    buffer.writeUInt32LE(timestamp);
    return buffer.toBytes();
}

/**
 * time sync enable
 * @param {number} time_sync_enable values: (0: disable, 2: enable)
 * @example { "time_sync_enable": 2 }
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
 * report schedule config
 * @param {object} report_schedule_config
 * @param {number} report_schedule_config._item.start_time unit: hour, values: (0-23)
 * @param {number} report_schedule_config._item.end_time unit: hour, values: (0-23)
 * @param {number} report_schedule_config._item.report_interval unit: second
 * @param {number} report_schedule_config._item.co2_collection_interval unit: minute
 * @param {number} report_schedule_config._item.collection_interval unit: minute
 * @example { "report_schedule_config": [ { "id": 0, "start_time": 0, "end_time": 23, "report_interval": 10, "co2_collection_interval": 10, "collection_interval": 10 } ] }
 */
function setReportScheduleConfig(report_schedule_config) {
    var num = report_schedule_config.length;
    if (num < 1 || num > 3) {
        throw new Error("report_schedule_config.num must be between 1 and 3");
    }

    var buffer = new Buffer(3 + num * 6);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x3a);
    buffer.writeUInt8(num);
    for (var i = 0; i < num; i++) {
        var item = report_schedule_config[i];
        buffer.writeUInt8(item.start_time * 10);
        buffer.writeUInt8(item.end_time * 10);
        buffer.writeUInt16LE(item.report_interval);
        buffer.writeUInt8(item.co2_collection_interval);
        buffer.writeUInt8(item.collection_interval);
    }
    return buffer.toBytes();
}

/**
 * clear report schedule
 * @param {number} clear_report_schedule values: (0: no, 1: yes)
 * @example { "clear_report_schedule": 1 }
 */
function clearReportSchedule(clear_report_schedule) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(clear_report_schedule) === -1) {
        throw new Error("clear_report_schedule must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, clear_report_schedule) === 0) {
        return [];
    }
    return [0xff, 0x57, 0xff];
}

/**
 * led indicator mode
 * @param {number} led_indicator_mode values: (0: off, 2: blink)
 * @example { "led_indicator_mode": 2 }
 */
function setLedIndicatorMode(led_indicator_mode) {
    var mode_map = { 0: "off", 2: "blink" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(led_indicator_mode) === -1) {
        throw new Error("led_indicator_mode must be one of " + mode_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x2f);
    buffer.writeUInt8(getValue(mode_map, led_indicator_mode));
    return buffer.toBytes();
}

/**
 * temperature threshold alarm
 * @param {object} temperature_alarm_config
 * @param {number} temperature_alarm_config.condition values: (0: disable, 1: below, 2: above, 3: between, 4: outside)
 * @param {number} temperature_alarm_config.threshold_min condition=(below, within, outside)
 * @param {number} temperature_alarm_config.threshold_max condition=(above, within, outside)
 * @example { "temperature_alarm_config": { "condition": 2, "threshold_min": 10, "threshold_max": 30 } }
 */
function setTemperatureAlarmConfig(temperature_alarm_config) {
    var condition = temperature_alarm_config.condition;
    var threshold_min = temperature_alarm_config.threshold_min;
    var threshold_max = temperature_alarm_config.threshold_max;

    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside" };
    var condition_values = getValues(condition_map);
    if (condition_values.indexOf(condition) === -1) {
        throw new Error("temperature_alarm_config.condition must be one of " + condition_values.join(", "));
    }

    var data = 0x00;
    data |= getValue(condition_map, condition);
    data |= 1 << 3; // temperature alarm

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x06);
    buffer.writeUInt8(data);
    buffer.writeInt16LE(threshold_min * 10);
    buffer.writeInt16LE(threshold_max * 10);
    buffer.writeUInt16LE(0x00);
    buffer.writeUInt16LE(0x00);
    return buffer.toBytes();
}
/**
 * CO2 calibration settings
 * @param {object} co2_calibration_settings
 * @param {number} co2_calibration_settings.mode values: (0: factory, 1: abc, 2: manual, 3: background, 4: zero)
 * @param {number} co2_calibration_settings.calibration_value
 * @example { "co2_calibration_settings": { "mode": 1 } }
 */
function setCO2CalibrationSettings(co2_calibration_settings) {
    var mode = co2_calibration_settings.mode;
    var calibration_value = co2_calibration_settings.calibration_value;

    var calibration_mode_map = { 0: "factory", 1: "abc", 2: "manual", 3: "background", 4: "zero" };
    var calibration_mode_values = getValues(calibration_mode_map);
    if (calibration_mode_values.indexOf(mode) == -1) {
        throw new Error("co2_calibration_settings.mode must be one of " + calibration_mode_values.join(", "));
    }

    if (getValue(calibration_mode_map, mode) === 2) {
        var buffer = new Buffer(5);
        buffer.writeUInt8(0xff);
        buffer.writeUInt8(0x1a);
        buffer.writeUInt8(getValue(calibration_mode_map, mode));
        buffer.writeInt16LE(calibration_value);
        return buffer.toBytes();
    } else {
        var buffer = new Buffer(3);
        buffer.writeUInt8(0xff);
        buffer.writeUInt8(0x1a);
        buffer.writeUInt8(getValue(calibration_mode_map, mode));
        return buffer.toBytes();
    }
}

/**
 * co2 alarm config
 * @param {object} co2_alarm_config
 * @param {number} co2_alarm_config.enable values: (0: disable, 1: enable)
 * @param {number} co2_alarm_config.threshold_1 range: [400, 5000]
 * @param {number} co2_alarm_config.threshold_2 range: [400, 5000]
 * @example { "co2_alarm_config": { "enable": 1, "threshold_1": 1000, "threshold_2": 2000 } }
 */
function setCO2AlarmConfig(co2_alarm_config) {
    var enable = co2_alarm_config.enable;
    var threshold_1 = co2_alarm_config.threshold_1;
    var threshold_2 = co2_alarm_config.threshold_2;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("co2_alarm_config.enable must be one of " + enable_values.join(", "));
    }
    if (threshold_1 < 400 || threshold_1 > 5000) {
        throw new Error("co2_alarm_config.threshold_1 must be between 400 and 5000");
    }
    if (threshold_2 < 400 || threshold_2 > 5000) {
        throw new Error("co2_alarm_config.threshold_2 must be between 400 and 5000");
    }
    if (threshold_1 > threshold_2) {
        throw new Error("co2_alarm_config.threshold_1 must be less than co2_alarm_config.threshold_2");
    }

    var buffer = new Buffer(7);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x54);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt16LE(threshold_1);
    buffer.writeUInt16LE(threshold_2);
    return buffer.toBytes();
}

/**
 * CO2 auto background calibration
 * @param {object} co2_abc_calibration_settings
 * @param {number} co2_abc_calibration_settings.enable values: (0: disable, 1: enable)
 * @param {number} co2_abc_calibration_settings.period unit: hour, range: [1, 65535]
 * @param {number} co2_abc_calibration_settings.calibration_value unit: ppm, range: [1, 65535]
 * @example { "co2_abc_calibration_settings": { "enable": 1, "period": 168, "calibration_value": 400 } }
 */
function setCO2AutoBackgroundCalibrationSettings(co2_abc_calibration_settings) {
    var enable = co2_abc_calibration_settings.enable;
    var period = co2_abc_calibration_settings.period;
    var calibration_value = co2_abc_calibration_settings.calibration_value;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) == -1) {
        throw new Error("co2_abc_calibration_settings.enable must be one of " + enable_values.join(", "));
    }
    if (period < 1 || period > 65535) {
        throw new Error("co2_abc_calibration_settings.period must be between 1 and 65535");
    }
    if (calibration_value < 1 || calibration_value > 65535) {
        throw new Error("co2_abc_calibration_settings.calibration_value must be between 1 and 65535");
    }

    var buffer = new Buffer(7);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x39);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt16LE(period);
    buffer.writeUInt16LE(calibration_value);
    return buffer.toBytes();
}

/**
 * altitude calibration settings
 * @param {object} altitude_calibration_settings
 * @param {number} altitude_calibration_settings.enable values: (0: disable, 1: enable)
 * @param {number} altitude_calibration_settings.calibration_value unit: m, range: [0, 5000]
 * @example { "altitude_calibration_settings": { "enable": 1, "calibration_value": 100 } }
 */
function setAltitudeCalibrationSettings(altitude_calibration_settings) {
    var enable = altitude_calibration_settings.enable;
    var altitude = altitude_calibration_settings.calibration_value;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("altitude_calibration_settings.enable must be one of " + enable_values.join(", "));
    }
    if (altitude < 0 || altitude > 5000) {
        throw new Error("altitude_calibration_settings.calibration_value must be between 0 and 5000");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x87);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt16LE(altitude);
    return buffer.toBytes();
}

/**
 * reset battery
 * @param {number} reset_battery values: (0: no, 1: yes)
 * @example { "reset_battery": 1 }
 */
function resetBattery(reset_battery) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(reset_battery) === -1) {
        throw new Error("reset_battery must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, reset_battery) === 0) {
        return [];
    }
    return [0xff, 0x59, 0xff];
}

/**
 * retransmit enable
 * @param {number} retransmit_enable values: (0: disable, 1: enable)
 * @example { "retransmit_enable": 1 }
 */
function setRetransmitEnable(retransmit_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(retransmit_enable) === -1) {
        throw new Error("retransmit_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x69);
    buffer.writeUInt8(getValue(enable_map, retransmit_enable));
    return buffer.toBytes();
}

/**
 * retransmit interval
 * @param {number} retransmit_interval unit: second, range: [1, 64800]
 * @example { "retransmit_interval": 600 }
 */
function setRetransmitInterval(retransmit_interval) {
    if (typeof retransmit_interval !== "number") {
        throw new Error("retransmit_interval must be a number");
    }
    if (retransmit_interval < 1 || retransmit_interval > 64800) {
        throw new Error("retransmit_interval must be between 1 and 64800");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x6a);
    buffer.writeUInt8(0x00);
    buffer.writeUInt16LE(retransmit_interval);
    return buffer.toBytes();
}

/**
 * resend interval
 * @param {number} resend_interval unit: second, range: [1, 64800]
 * @example { "resend_interval": 600 }
 */
function setResendInterval(resend_interval) {
    if (typeof resend_interval !== "number") {
        throw new Error("resend_interval must be a number");
    }
    if (resend_interval < 1 || resend_interval > 64800) {
        throw new Error("resend_interval must be between 1 and 64800");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x6a);
    buffer.writeUInt8(0x01);
    buffer.writeUInt16LE(resend_interval);
    return buffer.toBytes();
}

/**
 * history enable
 * @param {number} history_enable values: (0: disable, 1: enable)
 * @example { "history_enable": 1 }
 */
function setHistoryEnable(history_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(history_enable) === -1) {
        throw new Error("history_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x68);
    buffer.writeUInt8(getValue(enable_map, history_enable));
    return buffer.toBytes();
}

/**
 * fetch history
 * @param {object} fetch_history
 * @param {number} fetch_history.start_time unit: second
 * @param {number} fetch_history.end_time unit: second
 * @example { "fetch_history": { "start_time": 1609459200, "end_time": 1609545600 } }
 */
function fetchHistory(fetch_history) {
    var start_time = fetch_history.start_time;
    var end_time = fetch_history.end_time || 0;

    var buffer;
    if (end_time === 0) {
        buffer = new Buffer(6);
        buffer.writeUInt8(0xfd);
        buffer.writeUInt8(0x6b);
        buffer.writeUInt32LE(start_time);
    } else {
        buffer = new Buffer(10);
        buffer.writeUInt8(0xfd);
        buffer.writeUInt8(0x6c);
        buffer.writeUInt32LE(start_time);
        buffer.writeUInt32LE(end_time);
    }
    return buffer.toBytes();
}

/**
 * history stop transmit
 * @param {number} stop_transmit values: (0: no, 1: yes)
 * @example { "stop_transmit": 1 }
 */
function stopTransmit(stop_transmit) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(stop_transmit) === -1) {
        throw new Error("stop_transmit must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, stop_transmit) === 0) {
        return [];
    }
    return [0xfd, 0x6d, 0xff];
}

/**
 * clear history
 * @param {number} clear_history values: (0: no, 1: yes)
 * @example { "clear_history": 1 }
 */
function clearHistory(clear_history) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(clear_history) === -1) {
        throw new Error("clear_history must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, clear_history) === 0) {
        return [];
    }
    return [0xff, 0x27, 0x01];
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

Buffer.prototype.writeUInt24LE = function (value) {
    this._write(value, 3, true);
    this.offset += 3;
};

Buffer.prototype.writeInt24LE = function (value) {
    this._write(value < 0 ? value + 0x1000000 : value, 3, true);
    this.offset += 3;
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
