/**
 * Payload Encoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product EM320-TILT
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
    if ("query_device_status" in payload) {
        encoded = encoded.concat(queryDeviceStatus(payload.query_device_status));
    }
    if ("sync_time" in payload) {
        encoded = encoded.concat(syncTime(payload.sync_time));
    }
    if ("angle_x_alarm_config" in payload) {
        encoded = encoded.concat(setAngleXAlarmConfig(payload.angle_x_alarm_config));
    }
    if ("angle_y_alarm_config" in payload) {
        encoded = encoded.concat(setAngleYAlarmConfig(payload.angle_y_alarm_config));
    }
    if ("angle_z_alarm_config" in payload) {
        encoded = encoded.concat(setAngleZAlarmConfig(payload.angle_z_alarm_config));
    }
    if ("angle_alarm_condition" in payload) {
        encoded = encoded.concat(setAngleAlarmCondition(payload.angle_alarm_condition));
    }
    if ("initial_surface" in payload) {
        encoded = encoded.concat(setInitialSurface(payload.initial_surface));
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
 * query device status
 * @param {number} query_device_status values: (0: no, 1: yes)
 * @example { "query_device_status": 1 }
 */
function queryDeviceStatus(query_device_status) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(query_device_status) === -1) {
        throw new Error("query_device_status must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, query_device_status) === 0) {
        return [];
    }
    return [0xff, 0x28, 0xff];
}

/**
 * sync time
 * @param {number} sync_time values: (0: no, 1: yes)
 * @example { "sync_time": 1 }
 */
function syncTime(sync_time) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(sync_time) === -1) {
        throw new Error("sync_time must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, sync_time) === 0) {
        return [];
    }
    return [0xff, 0x4a, 0x00];
}

/**
 * report interval configuration
 * @param {number} report_interval uint: second, range: [1, 64800]
 * @example { "report_interval": 600 }
 */
function setReportInterval(report_interval) {
    if (typeof report_interval !== "number") {
        throw new Error("report_interval must be a number");
    }
    if (report_interval < 1 || report_interval > 64800) {
        throw new Error("report_interval must be in range [1, 64800]");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x03);
    buffer.writeUInt16LE(report_interval);
    return buffer.toBytes();
}

/**
 * set angle x alarm config
 * @param {object} angle_x_alarm_config
 * @param {number} angle_x_alarm_config.condition values: (0: disable, 1: below, 2: above, 3: between, 4: outside, 5: mutation)
 * @param {number} angle_x_alarm_config.threshold_min unit: °
 * @param {number} angle_x_alarm_config.threshold_max unit: °
 * @param {number} angle_x_alarm_config.report_interval unit: minute, range: [1, 1080]
 * @param {number} angle_x_alarm_config.report_times
 * @example { "angle_x_alarm_config": { "condition": 1, "threshold_min": 10, "threshold_max": 20 } }
 */
function setAngleXAlarmConfig(angle_x_alarm_config) {
    var condition = angle_x_alarm_config.condition;
    var threshold_min = angle_x_alarm_config.threshold_min;
    var threshold_max = angle_x_alarm_config.threshold_max;
    var report_interval = angle_x_alarm_config.report_interval;
    var report_times = angle_x_alarm_config.report_times;

    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside", 5: "mutation" };
    var condition_values = getValues(condition_map);
    if (condition_values.indexOf(condition) === -1) {
        throw new Error("angle_x_alarm_config.condition must be one of " + condition_values.join(", "));
    }

    var data = 0x00;
    data |= 0x01 << 3; // angle_x
    data |= getValue(condition_map, condition) << 0;

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x06);
    buffer.writeUInt8(data);
    buffer.writeInt16LE(threshold_min * 100);
    buffer.writeInt16LE(threshold_max * 100);
    buffer.writeUInt16LE(report_interval);
    buffer.writeUInt16LE(report_times);
    return buffer.toBytes();
}

/**
 * set angle y alarm config
 * @param {object} angle_y_alarm_config
 * @param {number} angle_y_alarm_config.condition values: (0: disable, 1: below, 2: above, 3: between, 4: outside, 5: mutation)
 * @param {number} angle_y_alarm_config.threshold_min unit: °
 * @param {number} angle_y_alarm_config.threshold_max unit: °
 * @param {number} angle_y_alarm_config.report_interval unit: minute, range: [1, 1080]
 * @param {number} angle_y_alarm_config.report_times
 * @example { "angle_y_alarm_config": { "condition": 1, "threshold_min": 10, "threshold_max": 20 } }
 */
function setAngleYAlarmConfig(angle_y_alarm_config) {
    var condition = angle_y_alarm_config.condition;
    var threshold_min = angle_y_alarm_config.threshold_min;
    var threshold_max = angle_y_alarm_config.threshold_max;
    var report_interval = angle_y_alarm_config.report_interval;
    var report_times = angle_y_alarm_config.report_times;

    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside", 5: "mutation" };
    var condition_values = getValues(condition_map);
    if (condition_values.indexOf(condition) === -1) {
        throw new Error("angle_y_alarm_config.condition must be one of " + condition_values.join(", "));
    }

    var data = 0x00;
    data |= 0x02 << 3; // angle_y
    data |= getValue(condition_map, condition) << 0;

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x06);
    buffer.writeUInt8(data);
    buffer.writeInt16LE(threshold_min * 100);
    buffer.writeInt16LE(threshold_max * 100);
    buffer.writeUInt16LE(report_interval);
    buffer.writeUInt16LE(report_times);
    return buffer.toBytes();
}

/**
 * set angle z alarm config
 * @param {object} angle_z_alarm_config
 * @param {number} angle_z_alarm_config.condition values: (0: disable, 1: below, 2: above, 3: between, 4: outside, 5: mutation)
 * @param {number} angle_z_alarm_config.threshold_min unit: °
 * @param {number} angle_z_alarm_config.threshold_max unit: °
 * @param {number} angle_z_alarm_config.report_interval unit: minute, range: [1, 1080]
 * @param {number} angle_z_alarm_config.report_times
 * @example { "angle_z_alarm_config": { "condition": 1, "threshold_min": 10, "threshold_max": 20 } }
 */
function setAngleZAlarmConfig(angle_z_alarm_config) {
    var condition = angle_z_alarm_config.condition;
    var threshold_min = angle_z_alarm_config.threshold_min;
    var threshold_max = angle_z_alarm_config.threshold_max;
    var report_interval = angle_z_alarm_config.report_interval;
    var report_times = angle_z_alarm_config.report_times;

    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside", 5: "mutation" };
    var condition_values = getValues(condition_map);
    if (condition_values.indexOf(condition) === -1) {
        throw new Error("angle_z_alarm_config.condition must be one of " + condition_values.join(", "));
    }

    var data = 0x00;
    data |= 0x03 << 3; // angle_z
    data |= getValue(condition_map, condition) << 0;

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x06);
    buffer.writeUInt8(data);
    buffer.writeInt16LE(threshold_min * 100);
    buffer.writeInt16LE(threshold_max * 100);
    buffer.writeUInt16LE(report_interval);
    buffer.writeUInt16LE(report_times);
    return buffer.toBytes();
}

/**
 * set angle alarm condition
 * @param {string} angle_alarm_condition
 * @example { "angle_alarm_condition": "X&Y|Z" }
 */
function setAngleAlarmCondition(angle_alarm_condition) {
    var buffer = new Buffer(10);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x63);
    buffer.writeUtf8(angle_alarm_condition);
    return buffer.toBytes();
}

/**
 * set initial surface
 * @param {number} initial_surface values: (255: current_plane, 254: reset_zero_reference_point, 253: set_zero_calibration, 252: clear_zero_calibration)
 * @example { "initial_surface": 255 }
 */
function setInitialSurface(initial_surface) {
    var mode_map = { 255: "current_plane", 254: "reset_zero_reference_point", 253: "set_zero_calibration", 252: "clear_zero_calibration" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(initial_surface) === -1) {
        throw new Error("initial_surface must be one of " + mode_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x62);
    buffer.writeUInt8(getValue(mode_map, initial_surface));
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

Buffer.prototype.writeBytes = function (bytes) {
    for (var i = 0; i < bytes.length; i++) {
        this.buffer[this.offset + i] = bytes[i];
    }
    this.offset += bytes.length;
};

Buffer.prototype.writeUtf8 = function (str) {
    var bytes = [];
    for (var i = 0; i < str.length; i++) {
        var charCode = str.charCodeAt(i);
        if (charCode < 0x80) {
            bytes.push(charCode);
        } else if (charCode < 0x800) {
            bytes.push(0xc0 | (charCode >> 6));
            bytes.push(0x80 | (charCode & 0x3f));
        } else if (charCode < 0x10000) {
            bytes.push(0xe0 | (charCode >> 12));
            bytes.push(0x80 | ((charCode >> 6) & 0x3f));
            bytes.push(0x80 | (charCode & 0x3f));
        } else if (charCode < 0x200000) {
            bytes.push(0xf0 | (charCode >> 18));
            bytes.push(0x80 | ((charCode >> 12) & 0x3f));
            bytes.push(0x80 | ((charCode >> 6) & 0x3f));
            bytes.push(0x80 | (charCode & 0x3f));
        }
    }
    this.writeBytes(bytes);
};

Buffer.prototype.toBytes = function () {
    return this.buffer;
};
