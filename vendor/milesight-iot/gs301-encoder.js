/**
 * Payload Encoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product GS301
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
        encoded = encoded.concat(setReboot(payload.reboot));
    }
    if ("report_interval" in payload) {
        encoded = encoded.concat(setReportInterval(payload.report_interval));
    }
    if ("query_life_remain" in payload) {
        encoded = encoded.concat(querySensorLifeRemain(payload.query_life_remain));
    }
    if ("threshold_report_interval" in payload) {
        encoded = encoded.concat(setThresholdReportInterval(payload.threshold_report_interval));
    }
    if ("led_indicator_enable" in payload) {
        encoded = encoded.concat(setLedIndicatorEnable(payload.led_indicator_enable));
    }
    if ("buzzer_enable" in payload) {
        encoded = encoded.concat(setBuzzerEnable(payload.buzzer_enable));
    }
    if ("nh3_calibration_settings" in payload) {
        encoded = encoded.concat(setNH3CalibrationConfig(payload.nh3_calibration_settings));
    }
    if ("h2s_calibration_settings" in payload) {
        encoded = encoded.concat(setH2SCalibrationConfig(payload.h2s_calibration_settings));
    }
    if ("alarm_config" in payload) {
        encoded = encoded.concat(setAlarmConfig(payload.alarm_config));
    }

    return encoded;
}

/**
 * Set reboot
 * @param {number} reboot values: (0: no, 1: yes)
 * @example { "reboot": 1 }
 */
function setReboot(reboot) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(reboot) === -1) {
        throw new Error("reboot must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, reboot) === 0) {
        return [];
    }
    return [0xff, 0x10, 0x01];
}

/**
 * Set report interval
 * @param {number} report_interval unit: second
 * @example { "report_interval": 600 }
 */
function setReportInterval(report_interval) {
    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x03);
    buffer.writeUInt16LE(report_interval);
    return buffer.toBytes();
}

/**
 * Report sensor life remain
 * @param {number} query_life_remain values: (0: no, 1: yes)
 * @example { "query_life_remain": 1 }
 */
function querySensorLifeRemain(query_life_remain) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(query_life_remain) === -1) {
        throw new Error("query_life_remain must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, query_life_remain) === 0) {
        return [];
    }

    return [0xff, 0x7d, 0xff];
}

/**
 * Set threshold report interval
 * @param {number} threshold_report_interval unit: second
 * @example { "threshold_report_interval": 120 }
 */
function setThresholdReportInterval(threshold_report_interval) {
    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x66);
    buffer.writeUInt16LE(threshold_report_interval);
    return buffer.toBytes();
}

/**
 * Set led indicator enable
 * @param {number} led_indicator_enable values: (0: disable, 1: enable)
 * @example { "led_indicator_enable": 1 }
 */
function setLedIndicatorEnable(led_indicator_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(led_indicator_enable) === -1) {
        throw new Error("led_indicator_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x2f);
    buffer.writeUInt8(getValue(enable_map, led_indicator_enable));
    return buffer.toBytes();
}

/**
 * Set buzzer enable
 * @param {number} buzzer_enable values: (0: disable, 1: enable)
 * @example { "buzzer_enable": 1 }
 */
function setBuzzerEnable(buzzer_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(buzzer_enable) === -1) {
        throw new Error("buzzer_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x3e);
    buffer.writeUInt8(getValue(enable_map, buzzer_enable));
    return buffer.toBytes();
}

/**
 * Set NH3 calibration config
 * @param {object} nh3_calibration_settings
 * @param {number} nh3_calibration_settings.mode  values: (0: factory, 1: manual)
 * @param {number} nh3_calibration_settings.calibration_value
 * @example { "nh3_calibration_settings": { "mode": 1, "nh3_calibration_value": 0.01 } }
 */
function setNH3CalibrationConfig(nh3_calibration_settings) {
    var mode = nh3_calibration_settings.mode;
    var calibration_value = nh3_calibration_settings.calibration_value || 0;

    var mode_map = { 0: "factory", 1: "manual" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(mode) === -1) {
        throw new Error("nh3_calibration_settings.mode must be one of " + mode_values.join(", "));
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x8d);
    buffer.writeUInt8(0x00);
    buffer.writeUInt8(getValue(mode_map, mode));
    buffer.writeUInt16LE(calibration_value * 100);
    return buffer.toBytes();
}

/**
 * Set H2S calibration config
 * @param {object} h2s_calibration_settings
 * @param {number} h2s_calibration_settings.mode  values: (0: factory, 1: manual)
 * @param {number} h2s_calibration_settings.calibration_value
 * @example { "h2s_calibration_settings": { "mode": 1, "h2s_calibration_value": 0.001 } }
 */
function setH2SCalibrationConfig(h2s_calibration_settings) {
    var mode = h2s_calibration_settings.mode;
    var calibration_value = h2s_calibration_settings.calibration_value || 0;

    var mode_map = { 0: "factory", 1: "manual" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(mode) === -1) {
        throw new Error("h2s_calibration_settings.mode must be one of " + mode_values.join(", "));
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x8d);
    buffer.writeUInt8(0x01);
    buffer.writeUInt8(getValue(mode_map, mode));
    buffer.writeUInt16LE(calibration_value * 1000);
    return buffer.toBytes();
}

/**
 * Set alarm config
 * @param {object} alarm_config
 * @param {number} alarm_config.enable values: (0: disable, 1: enable)
 * @param {number} alarm_config.condition values: (0: disable, 1: below, 2: above, 3: between, 4: outside)
 * @param {number} alarm_config.trigger_source values: (1: nh3, 1: h2s, 2: nh3_d2d, 3: h2s_d2d, 4: nh3_d2d, 5: nh3_d2d_release, 6: h2s_d2d_release, 7: h2s_v2, 8: h2s_d2d_v2, 9: h2s_release_v2)
 * @param {number} alarm_config.threshold_min
 * @param {number} alarm_config.threshold_max
 * @param {number} alarm_config.lock_time
 * @param {number} alarm_config.continue_time
 * @example { "alarm_config": { "enable": 1, "condition": 1, "trigger_source": 1, "threshold": 100, "threshold_max": 1000, "lock_time": 10, "continue_time": 10 } }_min
 */
function setAlarmConfig(alarm_config) {
    var enable = alarm_config.enable;
    var condition = alarm_config.condition;
    var trigger_source = alarm_config.trigger_source;
    var threshold_min = alarm_config.threshold_min;
    var threshold_max = alarm_config.threshold_max;
    var lock_time = alarm_config.lock_time;
    var continue_time = alarm_config.continue_time;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("alarm_config.enable must be one of " + enable_values.join(", "));
    }
    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside" };
    var condition_values = getValues(condition_map);
    if (condition_values.indexOf(condition) === -1) {
        throw new Error("alarm_config.condition must be one of " + condition_values.join(", "));
    }
    var trigger_source_map = { 1: "nh3", 2: "h2s", 3: "nh3_d2d", 4: "h2s_d2d", 5: "nh3_d2d", 6: "nh3_d2d_release", 7: "h2s_d2d_release", 8: "h2s_v2", 9: "h2s_d2d_v2", 10: "h2s_release_v2" };
    var trigger_source_values = getValues(trigger_source_map);
    if (trigger_source_values.indexOf(trigger_source) === -1) {
        throw new Error("alarm_config.trigger_source must be one of " + trigger_source_values.join(", "));
    }

    var data = 0x00;
    data |= getValue(enable_map, enable) === 0 ? 0 : getValue(condition_map, condition);
    data |= getValue(trigger_source_map, trigger_source) << 3;

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x06);
    buffer.writeUInt8(data);
    buffer.writeUInt16LE(threshold_min);
    buffer.writeUInt16LE(threshold_max);
    buffer.writeUInt16LE(lock_time);
    buffer.writeUInt16LE(continue_time);
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
