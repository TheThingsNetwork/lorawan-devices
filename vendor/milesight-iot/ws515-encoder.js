/**
 * Payload Encoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product WS51x
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
function Encode(fPort, obj, variables) {
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
    if ("delay_task" in payload) {
        encoded = encoded.concat(setDelayTask(payload.delay_task));
    }
    if ("socket_status" in payload) {
        encoded = encoded.concat(socketStatus(payload.socket_status));
    }
    if ("cancel_delay_task" in payload) {
        encoded = encoded.concat(cancelDelayTask(payload.cancel_delay_task));
    }
    if ("current_threshold" in payload) {
        encoded = encoded.concat(setCurrentThreshold(payload.current_threshold));
    }
    if ("over_current_protection" in payload) {
        encoded = encoded.concat(setOverCurrentProtection(payload.over_current_protection));
    }
    if ("overload_current_protection" in payload) {
        encoded = encoded.concat(setOverloadCurrentProtection(payload.overload_current_protection));
    }
    if ("child_lock_config" in payload) {
        encoded = encoded.concat(setChildLock(payload.child_lock_config));
    }
    if ("power_consumption_enable" in payload) {
        encoded = encoded.concat(powerConsumptionEnable(payload.power_consumption_enable));
    }
    if ("reset_power_consumption" in payload) {
        encoded = encoded.concat(resetPowerConsumption(payload.reset_power_consumption));
    }
    if ("led_indicator_enable" in payload) {
        encoded = encoded.concat(setLedEnable(payload.led_indicator_enable));
    }
    if ("led_indicator_reserve" in payload) {
        encoded = encoded.concat(setLedReserve(payload.led_indicator_reserve));
    }
    if ("temperature_calibration_settings" in payload) {
        encoded = encoded.concat(setTemperatureCalibration(payload.temperature_calibration_settings));
    }
    if ("temperature_alarm_config" in payload) {
        encoded = encoded.concat(setTemperatureAlarmConfig(payload.temperature_alarm_config));
    }
    if ("d2d_command" in payload) {
        encoded = encoded.concat(setD2DCommand(payload.d2d_command));
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
 * report interval configuration
 * @param {number} report_interval uint: second
 * @example { "report_interval": 600 }
 */
function setReportInterval(report_interval) {
    if (typeof report_interval !== "number") {
        throw new Error("report_interval must be a number");
    }
    if (report_interval < 1) {
        throw new Error("report_interval must be greater than 1");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x03);
    buffer.writeUInt16LE(report_interval);
    return buffer.toBytes();
}

/**
 * control socket status
 * @param {number} socket_status values: (0: off, 1: on)
 */
function socketStatus(socket_status) {
    var on_off_map = { 0: "off", 1: "on" };
    var on_off_values = getValues(on_off_map);
    if (on_off_values.indexOf(socket_status) === -1) {
        throw new Error("socket_status must be one of " + on_off_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0x08);
    buffer.writeUInt8(getValue(on_off_map, socket_status));
    buffer.writeUInt16LE(0xffff);
    return buffer.toBytes();
}

/**
 * set delay task
 * @param {object} delay_task
 * @param {number} delay_task.socket_status values: (0: off, 1: on)
 * @param {number} delay_task.frame_count values: (0-255, 0: force control)
 * @param {number} delay_task.delay_time unit: second, range: [0, 65535]
 * @example { "delay_task": { "socket_status": 1, "frame_count": 1, "delay_time": 1 } }
 */
function setDelayTask(delay_task) {
    var frame_count = delay_task.frame_count;
    var delay_time = delay_task.delay_time;

    var on_off_map = { 0: "off", 1: "on" };
    var on_off_values = getValues(on_off_map);
    if (frame_count < 0 || frame_count > 255) {
        throw new Error("delay_task.frame_count must be between 0 and 255");
    }
    if (typeof delay_time !== "number") {
        throw new Error("delay_task.delay_time must be a number");
    }
    if (delay_time < 0 || delay_time > 65535) {
        throw new Error("delay_task.delay_time must be in the range of [0, 65535]");
    }

    var data = 0x00;
    var switch_bit_offset = { socket_status: 0 };
    for (var key in switch_bit_offset) {
        if (key in delay_task) {
            if (on_off_values.indexOf(delay_task[key]) !== -1) {
                data |= 1 << (switch_bit_offset[key] + 4);
                data |= getValue(on_off_map, delay_task[key]) << switch_bit_offset[key];
            }
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
 * @param {number} cancel_delay_task values: (0: force cancel, 1-255: task-id)
 * @example { "cancel_delay_task": 0 }
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
 * set current threshold configuration
 * @param {object} current_alarm_config
 * @param {number} current_alarm_config.enable values: (0: disable, 1: enable)
 * @param {number} current_alarm_config.threshold unit: A
 * @example { "current_threshold": { "enable": 1, "threshold": 10 } }
 */
function setCurrentThreshold(current_alarm_config) {
    var enable = current_alarm_config.enable;
    var threshold = current_alarm_config.threshold;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("current_alarm_config.enable must be one of " + enable_values.join(", "));
    }
    if (typeof threshold !== "number") {
        throw new Error("current_alarm_config.threshold must be a number");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x24);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(threshold);
    return buffer.toBytes();
}

/**
 * set over_current protection configuration
 * @param {object} over_current_protection
 * @param {number} over_current_protection.enable values: (0: disable, 1: enable)
 * @param {number} over_current_protection.trip_current unit: A
 * @example { "over_current_protection": { "enable": 1, "trip_current": 10 } }
 */
function setOverCurrentProtection(over_current_protection) {
    var enable = over_current_protection.enable;
    var trip_current = over_current_protection.trip_current;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("over_current_protection.enable must be one of " + enable_values.join(", "));
    }
    if (typeof trip_current !== "number") {
        throw new Error("over_current_protection.trip_current must be a number");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x30);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(trip_current);
    return buffer.toBytes();
}

/**
 * set overload current protection configuration
 * @since v2.1
 * @param {object} overload_current_protection
 * @param {number} overload_current_protection.enable values: (0: disable, 1: enable)
 * @example { "overload_current_protection": { "enable": 1 } }
 */
function setOverloadCurrentProtection(overload_current_protection) {
    var enable = overload_current_protection.enable;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("overload_current_protection.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x8d);
    buffer.writeUInt8(getValue(enable_map, enable));
    return buffer.toBytes();
}

/**
 * set child lock configuration
 * @param {object} child_lock_config
 * @param {number} child_lock_config.enable values: (0: disable, 1: enable)
 * @param {number} child_lock_config.lock_time unit: min
 * @example { "child_lock_config": { "enable": 1, "lock_time": 60 } }
 */
function setChildLock(child_lock_config) {
    var enable = child_lock_config.enable;
    var lock_time = child_lock_config.lock_time;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("child_lock_config.enable must be one of " + enable_values.join(", "));
    }
    if (typeof lock_time !== "number") {
        throw new Error("child_lock_config.lock_time must be a number");
    }

    var data = getValue(enable_map, enable);
    data = (data << 15) + lock_time;
    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x25);
    buffer.writeUInt16LE(data);
    return buffer.toBytes();
}

/**
 * set power consumption configuration
 * @param {number} power_consumption_enable values: (0: disable, 1: enable)
 * @example { "power_consumption_enable": 1 }
 */
function powerConsumptionEnable(power_consumption_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(power_consumption_enable) === -1) {
        throw new Error("power_consumption_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x26);
    buffer.writeUInt8(getValue(enable_map, power_consumption_enable));
    return buffer.toBytes();
}

/**
 * reset power consumption
 * @param {number} reset_power_consumption values: (0: no, 1: yes)
 * @example { "reset_power_consumption": 1 }
 */
function resetPowerConsumption(reset_power_consumption) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(reset_power_consumption) === -1) {
        throw new Error("reset_power_consumption must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, reset_power_consumption) === 0) {
        return [];
    }
    return [0xff, 0x27, 0xff];
}

/**
 * set led enable configuration
 * @param {number} led_indicator_enable values: (0: disable, 1: enable)
 * @example { "led_indicator_enable": 1 }
 */
function setLedEnable(led_indicator_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(led_indicator_enable) === -1) {
        throw new Error("led_indicator_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x2f);
    buffer.writeUInt16LE(getValue(enable_map, led_indicator_enable));
    return buffer.toBytes();
}

/**
 * set led indicator reserve configuration
 * @param {number} led_indicator_reserve value: (0: disable, 1: enable)
 * @example { "led_indicator_reserve": 1 }
 */
function setLedReserve(led_indicator_reserve) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(led_indicator_reserve) === -1) {
        throw new Error("led_indicator_reserve must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xa5);
    buffer.writeUInt8(getValue(enable_map, led_indicator_reserve));
    return buffer.toBytes();
}

/**
 * temperature calibration configuration
 * @since v1.9
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
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("temperature_calibration_settings.enable must be one of " + enable_values.join(", "));
    }
    if (getValue(enable_map, enable) === 1 && typeof calibration_value !== "number") {
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
 * set temperature threshold alarm configuration
 * @param {object} temperature_alarm_config
 * @param {number} temperature_alarm_config.condition values: (0: disable, 1: below, 2: above, 3: between, 4: outside)
 * @param {number} temperature_alarm_config.threshold_min condition=(below, within, outside)
 * @param {number} temperature_alarm_config.threshold_max condition=(above, within, outside)
 * @param {number} temperature_alarm_config.alarm_interval unit: minute
 * @param {number} temperature_alarm_config.alarm_times
 * @example { "temperature_alarm_config": { "condition": 1, "threshold_min": 10, "threshold_max": 20, "alarm_interval": 10, "alarm_times": 10 } }
 */
function setTemperatureAlarmConfig(temperature_alarm_config) {
    var condition = temperature_alarm_config.condition;
    var threshold_min = temperature_alarm_config.threshold_min;
    var threshold_max = temperature_alarm_config.threshold_max;
    var alarm_interval = temperature_alarm_config.alarm_interval;
    var alarm_times = temperature_alarm_config.alarm_times;

    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside" };
    var condition_values = getValues(condition_map);
    if (condition_values.indexOf(condition) === -1) {
        throw new Error("temperature_alarm_config.condition must be one of " + condition_values.join(", "));
    }

    var alarm_type = 1;
    var data = getValue(condition_map, condition) | (alarm_type << 3);

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x06);
    buffer.writeUInt8(data);
    buffer.writeInt16LE(threshold_min * 10);
    buffer.writeInt16LE(threshold_max * 10);
    buffer.writeUInt16LE(alarm_interval);
    buffer.writeUInt16LE(alarm_times);
    return buffer.toBytes();
}

/**
 * set d2d command
 * @param {string} d2d_command
 * @example { "d2d_command": "0000" }
 */
function setD2DCommand(d2d_command) {
    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x34);
    buffer.writeUInt8(0x00);
    buffer.writeD2DCommand(d2d_command, "0000");
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

Buffer.prototype.writeD2DCommand = function (value, defaultValue) {
    if (typeof value !== "string") {
        value = defaultValue;
    }
    if (value.length !== 4) {
        throw new Error("d2d_cmd length must be 4");
    }
    this.buffer[this.offset] = parseInt(value.substr(2, 2), 16);
    this.buffer[this.offset + 1] = parseInt(value.substr(0, 2), 16);
    this.offset += 2;
};

Buffer.prototype.toBytes = function () {
    return this.buffer;
};
