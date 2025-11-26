/**
 * Payload Encoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product WS503
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
    if ("report_attribute" in payload) {
        encoded = encoded.concat(reportAttribute(payload.report_attribute));
    }
    if ("switch_1" in payload || "switch_2" in payload || "switch_3" in payload) {
        encoded = encoded.concat(updateSwitch(payload));
    }
    if ("delay_task" in payload) {
        encoded = encoded.concat(setDelayTask(payload.delay_task));
    }
    if ("cancel_delay_task" in payload) {
        encoded = encoded.concat(cancelDelayTask(payload.cancel_delay_task));
    }
    if ("led_mode" in payload) {
        encoded = encoded.concat(setLedMode(payload.led_mode));
    }
    if ("child_lock_config" in payload) {
        encoded = encoded.concat(setChildLockConfig(payload.child_lock_config));
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
        throw new Error("reboot must be one of: " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, reboot) === 0) {
        return [];
    }
    return [0xff, 0x10, 0xff];
}

/**
 * report interval configuration
 * @param {number} report_interval uint: second, range: [60, 64800]
 * @example { "report_interval": 1200 }
 */
function setReportInterval(report_interval) {
    if (typeof report_interval !== "number") {
        throw new Error("report_interval must be a number");
    }
    if (report_interval < 60 || report_interval > 64800) {
        throw new Error("report_interval must be in the range of [60, 64800]");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x03);
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
        throw new Error("report_status must be one of: " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, report_status) === 0) {
        return [];
    }
    return [0xff, 0x28, 0xff];
}

/**
 * report attribute
 * @param {number} report_attribute values: (0: no, 1: yes)
 * @example { "report_attribute": 1 }
 */
function reportAttribute(report_attribute) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(report_attribute) === -1) {
        throw new Error("report_attribute must be one of: " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, report_attribute) === 0) {
        return [];
    }
    return [0xff, 0x2c, 0xff];
}

/**
 * button control
 * @param {number} switch_1 values: (0: off, 1: on)
 * @param {number} switch_2 values: (0: off, 1: on)
 * @param {number} switch_3 values: (0: off, 1: on)
 * @example { "switch_1": 1 }
 */
function updateSwitch(switch_data) {
    var on_off_map = { 0: "off", 1: "on" };
    var on_off_values = getValues(on_off_map);

    var data = 0x00;
    var switch_bit_offset = { switch_1: 0, switch_2: 1, switch_3: 2 };
    for (var key in switch_bit_offset) {
        if (key in switch_data) {
            if (on_off_values.indexOf(switch_data[key]) === -1) {
                throw new Error("switch_" + key + " must be one of: " + on_off_values.join(", "));
            }

            data |= 1 << (switch_bit_offset[key] + 4);
            data |= getValue(on_off_map, switch_data[key]) << switch_bit_offset[key];
        }
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x29);
    buffer.writeUInt8(data);
    return buffer.toBytes();
}

/**
 * set delay task
 * @param {object} delay_task
 * @param {number} delay_task.switch_1 values: (0: off, 1: on)
 * @param {number} delay_task.switch_2 values: (0: off, 1: on)
 * @param {number} delay_task.switch_3 values: (0: off, 1: on)
 * @param {number} delay_task.frame_count values: (0-255, 0: force control)
 * @param {number} delay_task.delay_time unit: second, range: [0, 65535]
 * @example { "delay_task": { "switch_1": 1, "switch_2": 1, "switch_3": 1, "frame_count": 1, "delay_time": 1 } }
 */
function setDelayTask(delay_task) {
    var frame_count = delay_task.frame_count;
    var delay_time = delay_task.delay_time;

    var on_off_map = { 0: "off", 1: "on" };
    var on_off_values = getValues(on_off_map);
    if (frame_count < 0 || frame_count > 255) {
        throw new Error("delay_task.frame_count must be in the range of [0, 255]");
    }
    if (typeof delay_time !== "number") {
        throw new Error("delay_task.delay_time must be a number");
    }
    if (delay_time < 0 || delay_time > 65535) {
        throw new Error("delay_task.delay_time must be in the range of [0, 65535]");
    }

    var data = 0x00;
    var switch_bit_offset = { switch_1: 0, switch_2: 1, switch_3: 2 };
    for (var key in switch_bit_offset) {
        if (key in delay_task) {
            if (on_off_values.indexOf(delay_task[key]) === -1) {
                throw new Error("delay_task." + key + " must be one of: " + on_off_values.join(", "));
            }

            data |= 1 << (switch_bit_offset[key] + 4);
            data |= getValue(on_off_map, delay_task[key]) << switch_bit_offset[key];
        }
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x22);
    buffer.writeUInt8(frame_count);
    buffer.writeUInt16LE(delay_time);
    buffer.writeUInt8(data);
    return buffer.toBytes();
}

/**
 * cancel delay task
 * @param {number} cancel_delay_task values: (delay_task.frame_count)
 * @example { "cancel_delay_task": 1 }
 */
function cancelDelayTask(cancel_delay_task) {
    if (typeof cancel_delay_task !== "number") {
        throw new Error("cancel_delay_task must be a number");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x23);
    buffer.writeUInt8(cancel_delay_task);
    buffer.writeUInt8(0xff);
    return buffer.toBytes();
}

/**
 * set led mode
 * @param {number} led_mode, values: (0: off, 1: on_inverted, 2: on_synced)
 * @example { "led_mode": 1 }
 */
function setLedMode(led_mode) {
    var led_mode_map = { 0: "off", 1: "on_inverted", 2: "on_synced" };
    var led_mode_values = getValues(led_mode_map);
    if (led_mode_values.indexOf(led_mode) === -1) {
        throw new Error("led_mode must be one of: " + led_mode_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x2f);
    buffer.writeUInt8(getValue(led_mode_map, led_mode));
    return buffer.toBytes();
}

/**
 * child lock configuration
 * @param {object} child_lock_config
 * @param {number} child_lock_config.enable values: (0: disable, 1: enable)
 * @param {number} child_lock_config.lock_time value: (0: forever), unit: minute
 * @example { "child_lock_config": { "enable": 1, "lock_time": 60 } }
 */
function setChildLockConfig(child_lock_config) {
    var enable = child_lock_config.enable;
    var lock_time = child_lock_config.lock_time;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("child_lock_config.enable must be one of: " + enable_values.join(", "));
    }
    if (typeof lock_time !== "number") {
        throw new Error("child_lock_config.lock_time must be a number");
    }

    var data = 0x00;
    data |= getValue(enable_map, enable) << 15;
    data |= lock_time;
    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x25);
    buffer.writeUInt16LE(data);
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