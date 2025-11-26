/**
 * Payload Encoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product WS201
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
    if ("collection_interval" in payload) {
        encoded = encoded.concat(setCollectionInterval(payload.collection_interval));
    }
    if ("time_zone" in payload) {
        encoded = encoded.concat(setTimeZone(payload.time_zone));
    }
    if ("report_status" in payload) {
        encoded = encoded.concat(reportStatus(payload.report_status));
    }
    if ("depth" in payload) {
        encoded = encoded.concat(setDepth(payload.depth));
    }
    if ("remaining_alarm_config" in payload) {
        for (var i = 0; i < payload.remaining_alarm_config.length; i++) {
            encoded = encoded.concat(setRemainingAlarmConfig(payload.remaining_alarm_config[i]));
        }
    }
    if ("hibernate_config" in payload) {
        encoded = encoded.concat(setHibernateConfig(payload.hibernate_config));
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
 * report interval configuration
 * @param {number} report_interval uint: second
 * @example payload: { "report_interval": 600 }
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
 * set collection interval
 * @param {number} collection_interval unit: second
 * @example { "collection_interval": 300 }
 */
function setCollectionInterval(collection_interval) {
    if (typeof collection_interval !== "number") {
        throw new Error("collection_interval must be a number");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x02);
    buffer.writeUInt16LE(collection_interval);
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
 * set depth
 * @param {number} depth unit: mm
 * @example { "depth": 500 }
 */
function setDepth(depth) {
    if (typeof depth !== "number") {
        throw new Error("depth must be a number");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x76);
    buffer.writeUInt16LE(depth);
    return buffer.toBytes();
}

/**
 * set remaining threshold alarm configuration
 * @param {object} remaining_alarm_config
 * @param {number} remaining_alarm_config.index
 * @param {number} remaining_alarm_config.enable values: (0: disable, 1: enable)
 * @param {number} remaining_alarm_config.alarm_release_enable values: (0: disable, 1: enable)
 * @param {number} remaining_alarm_config.threshold unit: %
 * @example { "remaining_alarm_config": [{ "index": 1, "enable": 1, "alarm_release_enable": 1, "threshold": 20 }] }
 */
function setRemainingAlarmConfig(remaining_alarm_config) {
    var index = remaining_alarm_config.index;
    var enable = remaining_alarm_config.enable;
    var alarm_release_enable = remaining_alarm_config.alarm_release_enable;
    var threshold = remaining_alarm_config.threshold;

    var index_values = [1, 2];
    if (index_values.indexOf(index) === -1) {
        throw new Error("remaining_alarm_config._item.index must be one of " + index_values.join(", "));
    }
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("remaining_alarm_config._item.enable must be one of " + enable_values.join(", "));
    }
    if (enable_values.indexOf(alarm_release_enable) === -1) {
        throw new Error("remaining_alarm_config._item.alarm_release_enable must be one of " + enable_values.join(", "));
    }

    var data = 0x00;
    data |= getValue(enable_map, alarm_release_enable) << 7;
    data |= getValue(enable_map, enable) << 6;
    data |= index << 3;

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x06);
    buffer.writeUInt8(data);
    buffer.writeUInt16LE(0x00);
    buffer.writeUInt16LE(threshold);
    buffer.writeUInt16LE(0x00);
    buffer.writeUInt16LE(0x00);
    return buffer.toBytes();
}

/**
 * set hibernate config
 * @param {object} hibernate_config
 * @param {number} hibernate_config.enable values: (0: disable, 1: enable)
 * @param {number} hibernate_config.start_time unit: minute. (4:00 -> 240, 4:30 -> 270)
 * @param {number} hibernate_config.end_time unit: minute. (start_time < end_time: one day, start_time > end_time: across the day, start_time == end_time: whole day)
 * @param {object} hibernate_config.weekdays
 * @param {number} hibernate_config.weekdays.monday values: (0: disable, 1: enable)
 * @param {number} hibernate_config.weekdays.tuesday values: (0: disable, 1: enable)
 * @param {number} hibernate_config.weekdays.wednesday values: (0: disable, 1: enable)
 * @param {number} hibernate_config.weekdays.thursday values: (0: disable, 1: enable)
 * @param {number} hibernate_config.weekdays.friday values: (0: disable, 1: enable)
 * @param {number} hibernate_config.weekdays.saturday values: (0: disable, 1: enable)
 * @param {number} hibernate_config.weekdays.sunday values: (0: disable, 1: enable)
 * @example { "hibernate_config": { "enable": 1, "start_time": 240, "end_time": 270, "weekdays": { "monday": 1, "tuesday": 1, "wednesday": 1, "thursday": 1, "friday": 1, "saturday": 1, "sunday": 1 } } }
 */
function setHibernateConfig(hibernate_config) {
    var enable = hibernate_config.enable;
    var start_time = hibernate_config.start_time;
    var end_time = hibernate_config.end_time;
    var weekdays = hibernate_config.weekdays;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("hibernate_config.enable must be one of " + enable_values.join(", "));
    }
    if (typeof start_time !== "number") {
        throw new Error("hibernate_config.start_time must be a number");
    }
    if (typeof end_time !== "number") {
        throw new Error("hibernate_config.end_time must be a number");
    }

    var weekdays_map = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 7 };
    var day = 0;
    for (var key in weekdays_map) {
        if (key in weekdays) {
            day |= getValue(enable_map, weekdays[key]) << weekdays_map[key];
        }
    }

    var buffer = new Buffer(8);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x75);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt16LE(start_time);
    buffer.writeUInt16LE(end_time);
    buffer.writeUInt8(day);
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
