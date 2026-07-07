/**
 * Payload Encoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product CT101 / CT103 / CT105
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
    if ("report_status" in payload) {
        encoded = encoded.concat(reportStatus(payload.report_status));
    }
    if ("clear_current_cumulative" in payload) {
        encoded = encoded.concat(clearCurrentCumulativeValue(payload.clear_current_cumulative));
    }
    if ("alarm_report_counts" in payload) {
        encoded = encoded.concat(alarmReportCounts(payload.alarm_report_counts));
    }
    if ("alarm_report_interval" in payload) {
        encoded = encoded.concat(alarmReportInterval(payload.alarm_report_interval));
    }
    if ("current_alarm_config" in payload) {
        encoded = encoded.concat(setCurrentThresholdAlarmConfig(payload.current_alarm_config));
    }
    if ("temperature_alarm_config" in payload) {
        encoded = encoded.concat(setTemperatureThresholdAlarmConfig(payload.temperature_alarm_config));
    }

    return encoded;
}

/**
 * reboot device
 * @param {number} reboot values: (0: no, 1: yes)
 * @example { "reboot": 1 }
 */
function reboot(reboot) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var reboot_values = getValues(yes_no_map);
    if (reboot_values.indexOf(reboot) === -1) {
        throw new Error("reboot must be one of " + reboot_values.join(", "));
    }

    if (getValue(yes_no_map, reboot) === 0) {
        return [];
    }
    return [0xff, 0x10, 0xff];
}

/**
 * set report interval
 * @param {number} report_interval unit: minute, range: [1, 1440]
 * @example { "report_interval": 20 }
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
 * report status
 * @param {number} report_status values: (0: no, 1: yes)
 * @example { "report_status": 1 }
 */
function reportStatus(report_status) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(report_status) === -1) {
        throw new Error("report_status must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, report_status) === 0) {
        return [];
    }
    return [0xff, 0x28, 0xff];
}

/**
 * clear current cumulative value
 * @param {number} clear_current_cumulative values: (0: no, 1: yes)
 * @example { "clear_current_cumulative": 1 }
 */
function clearCurrentCumulativeValue(clear_current_cumulative) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(clear_current_cumulative) === -1) {
        throw new Error("clear_current_cumulative must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, clear_current_cumulative) === 0) {
        return [];
    }
    return [0xff, 0x27, 0x01];
}

/**
 * set current threshold alarm config
 * @param {object} current_alarm_config
 * @param {number} current_alarm_config.condition values: (0: disable, 1: below, 2: above, 3: between, 4: outside)
 * @param {number} current_alarm_config.threshold_min unit: A
 * @param {number} current_alarm_config.threshold_max unit: A
 * @param {number} current_alarm_config.alarm_interval unit: minute
 * @param {number} current_alarm_config.alarm_counts
 * @example { "current_alarm_config": { "condition": 1, "threshold_min": 100, "threshold_max": 200 } }
 */
function setCurrentThresholdAlarmConfig(current_alarm_config) {
    var condition = current_alarm_config.condition;
    var threshold_min = current_alarm_config.threshold_min;
    var threshold_max = current_alarm_config.threshold_max;
    var alarm_interval = current_alarm_config.alarm_interval;
    var alarm_counts = current_alarm_config.alarm_counts;

    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside" };
    var condition_values = getValues(condition_map);
    if (condition_values.indexOf(condition) === -1) {
        throw new Error("current_alarm_config.condition must be one of " + condition_values.join(", "));
    }

    var data = 0x00;
    data |= 0x01 << 3; // phrase A
    data |= getValue(condition_map, condition) << 0;

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x06);
    buffer.writeUInt8(data);
    buffer.writeUInt16LE(threshold_min);
    buffer.writeUInt16LE(threshold_max);
    buffer.writeUInt16LE(alarm_interval);
    buffer.writeUInt16LE(alarm_counts);
    return buffer.toBytes();
}

/**
 * set temperature threshold alarm config
 * @param {object} temperature_alarm_config
 * @param {number} temperature_alarm_config.condition values: (0: disable, 1: below, 2: above, 3: between, 4: outside)
 * @param {number} temperature_alarm_config.threshold_min unit: °C
 * @param {number} temperature_alarm_config.threshold_max unit: °C
 * @example { "temperature_alarm_config": { "condition": 1, "threshold_min": 100, "threshold_max": 200 } }
 */
function setTemperatureThresholdAlarmConfig(temperature_alarm_config) {
    var condition = temperature_alarm_config.condition;
    var threshold_min = temperature_alarm_config.threshold_min;
    var threshold_max = temperature_alarm_config.threshold_max;

    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside" };
    var condition_values = getValues(condition_map);
    if (condition_values.indexOf(condition) === -1) {
        throw new Error("temperature_alarm_config.condition must be one of " + condition_values.join(", "));
    }
    var data = 0x00;
    data |= 0x04 << 3; // temperature
    data |= getValue(condition_map, condition) << 0;

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x06);
    buffer.writeUInt8(data);
    buffer.writeInt16LE(threshold_min * 10);
    buffer.writeInt16LE(threshold_max * 10);
    buffer.writeUInt32LE(0x00); // reserved
    return buffer.toBytes();
}

/**
 * alarm report counts
 * @param {number} alarm_report_counts, range: [1, 1000]
 * @example { "alarm_report_counts": 1000 }
 */
function alarmReportCounts(alarm_report_counts) {
    if (typeof alarm_report_counts !== "number") {
        throw new Error("alarm_report_counts must be a number");
    }
    if (alarm_report_counts < 1 || alarm_report_counts > 1000) {
        throw new Error("alarm_report_counts must be between 1 and 1000");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xf2);
    buffer.writeUInt16LE(alarm_report_counts);
    return buffer.toBytes();
}

/**
 * alarm report interval
 * @param {number} alarm_report_interval unit: minute, range: [1, 1440]
 * @example { "alarm_report_interval": 1 }
 */
function alarmReportInterval(alarm_report_interval) {
    if (typeof alarm_report_interval !== "number") {
        throw new Error("alarm_report_interval must be a number");
    }
    if (alarm_report_interval < 1 || alarm_report_interval > 1440) {
        throw new Error("alarm_report_interval must be between 1 and 1440");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x02);
    buffer.writeUInt16LE(alarm_report_interval);
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
