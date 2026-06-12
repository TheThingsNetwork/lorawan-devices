/**
 * Payload Encoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product WS558
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
    if ("report_status" in payload) {
        encoded = encoded.concat(reportStatus(payload.report_status));
    }
    if ("report_interval" in payload) {
        encoded = encoded.concat(setReportInterval(payload.report_interval));
    }
    if ("switch_1" in payload || "switch_2" in payload || "switch_3" in payload || "switch_4" in payload || "switch_5" in payload || "switch_6" in payload || "switch_7" in payload || "switch_8" in payload) {
        if ("delay_time" in payload) {
            encoded = encoded.concat(controlSwitchWithDelay(payload));
        } else {
            encoded = encoded.concat(controlSwitch(payload));
        }
    }
    if ("cancel_delay_task" in payload) {
        encoded = encoded.concat(cancelDelayTask(payload.cancel_delay_task));
    }
    if ("power_consumption_enable" in payload) {
        encoded = encoded.concat(setPowerConsumptionEnable(payload.power_consumption_enable));
    }
    if ("clear_power_consumption" in payload) {
        encoded = encoded.concat(clearPowerConsumption(payload.clear_power_consumption));
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
 * Set report interval
 * @param {number} report_interval unit: second
 * @example { "report_interval": 300 }
 */
function setReportInterval(report_interval) {
    if (typeof report_interval !== "number") {
        throw new Error("report_interval must be a number");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x03);
    buffer.writeUInt16LE(report_interval);
    return buffer.toBytes();
}

/**
 * Control switch
 * @param {string} switch_1 values: (0: off, 1: on)
 * @param {string} switch_2 values: (0: off, 1: on)
 * @param {string} switch_3 values: (0: off, 1: on)
 * @param {string} switch_4 values: (0: off, 1: on)
 * @param {string} switch_5 values: (0: off, 1: on)
 * @param {string} switch_6 values: (0: off, 1: on)
 * @param {string} switch_7 values: (0: off, 1: on)
 * @param {string} switch_8 values: (0: off, 1: on)
 * @example { "switch_1": 1, "switch_2": 0, "switch_3": 1, "switch_4": 0, "switch_5": 1, "switch_6": 0, "switch_7": 1, "switch_8": 0 }
 */
function controlSwitch(switch_control) {
    var on_off_map = { 0: "off", 1: "on" };
    var on_off_values = getValues(on_off_map);

    var switch_bit_offset = { switch_1: 0, switch_2: 1, switch_3: 2, switch_4: 3, switch_5: 4, switch_6: 5, switch_7: 6, switch_8: 7 };

    var mask = 0;
    var status = 0;
    for (var key in switch_bit_offset) {
        if (key in switch_control) {
            if (on_off_values.indexOf(switch_control[key]) === -1) {
                throw new Error(key + " must be one of " + on_off_values.join(", "));
            }
            mask |= 1 << switch_bit_offset[key];
            status |= getValue(on_off_map, switch_control[key]) << switch_bit_offset[key];
        }
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0x08);
    buffer.writeUInt8(mask);
    buffer.writeUInt8(status);
    return buffer.toBytes();
}

/**
 * Control switch with delay
 * @param {object} delay_task
 * @param {number} delay_task.task_id value: (0: force control, > 0: task_id)
 * @param {number} delay_task.delay_time unit: second
 * @param {string} delay_task.switch_1 values: (0: off, 1: on)
 * @param {string} delay_task.switch_2 values: (0: off, 1: on)
 * @param {string} delay_task.switch_3 values: (0: off, 1: on)
 * @param {string} delay_task.switch_4 values: (0: off, 1: on)
 * @param {string} delay_task.switch_5 values: (0: off, 1: on)
 * @param {string} delay_task.switch_6 values: (0: off, 1: on)
 * @param {string} delay_task.switch_7 values: (0: off, 1: on)
 * @param {string} delay_task.switch_8 values: (0: off, 1: on)
 * @example { "delay_task": { "task_id": 1, "delay_time": 300, "switch_1": 1, "switch_2": 0, "switch_3": 1, "switch_4": 0, "switch_5": 1, "switch_6": 0, "switch_7": 1, "switch_8": 0 } }
 */
function controlSwitchWithDelay(delay_task) {
    var task_id = delay_task.task_id;
    var delay_time = delay_task.delay_time;

    var on_off_map = { 0: "off", 1: "on" };
    var on_off_values = getValues(on_off_map);

    var mask = 0;
    var status = 0;
    var switch_bit_offset = { switch_1: 0, switch_2: 1, switch_3: 2, switch_4: 3, switch_5: 4, switch_6: 5, switch_7: 6, switch_8: 7 };
    for (var key in switch_bit_offset) {
        if (key in delay_task) {
            var switch_status = delay_task[key];
            if (on_off_values.indexOf(switch_status) === -1) {
                throw new Error(key + " must be one of " + on_off_values.join(", "));
            }
            mask |= 1 << switch_bit_offset[key];
            status |= getValue(on_off_map, switch_status) << switch_bit_offset[key];
        }
    }

    if (task_id < 0) {
        throw new Error("task_id must be greater than 0");
    }
    if (delay_time < 0) {
        throw new Error("delay_time must be greater than 0");
    }

    var buffer = new Buffer(7);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x32);
    buffer.writeUInt8(task_id);
    buffer.writeUInt16LE(delay_time);
    buffer.writeUInt8(mask);
    buffer.writeUInt8(status);
    return buffer.toBytes();
}

/**
 * cancel delay task
 * @param {number} cancel_delay_task task_id
 * @example { "cancel_delay_task": 1 }
 */
function cancelDelayTask(cancel_delay_task) {
    if (typeof cancel_delay_task !== "number") {
        throw new Error("cancel_delay_task must be a number");
    }

    if (cancel_delay_task === 0) {
        return [];
    }
    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x23);
    buffer.writeUInt8(cancel_delay_task);
    buffer.writeUInt8(0xff);
    return buffer.toBytes();
}

/**
 * Set power consumption enable
 * @param {number} power_consumption_enable values: (0: disable, 1: enable)
 * @example { "power_consumption_enable": 1 }
 */
function setPowerConsumptionEnable(power_consumption_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(power_consumption_enable) === -1) {
        throw new Error("power_consumption_enable must one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x26);
    buffer.writeUInt8(getValue(enable_map, power_consumption_enable));
    return buffer.toBytes();
}

/**
 * clear power consumption
 * @param {number} clear_power_consumption values: (0: no, 1: yes)
 * @example payload: { "clear_power_consumption": 1 }
 */
function clearPowerConsumption(clear_power_consumption) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(clear_power_consumption) === -1) {
        throw new Error("clear_power_consumption must be one of: " + yes_no_values.join(", "));
    }

    if (clear_power_consumption === 0) {
        return [];
    }
    return [0xff, 0x27, 0xff];
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
