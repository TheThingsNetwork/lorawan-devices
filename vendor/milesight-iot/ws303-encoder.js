/**
 * Payload Encoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product WS303
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
    if ("query_device_status" in payload) {
        encoded = encoded.concat(queryDeviceStatus(payload.query_device_status));
    }
    if ("report_interval" in payload) {
        encoded = encoded.concat(setReportInterval(payload.report_interval));
    }
    if ("leakage_alarm_config" in payload) {
        encoded = encoded.concat(setLeakageAlarmSettings(payload.leakage_alarm_config));
    }
    if ("buzzer_enable" in payload) {
        encoded = encoded.concat(setBuzzerEnable(payload.buzzer_enable));
    }
    if ("find_device_enable" in payload) {
        encoded = encoded.concat(findDeviceEnable(payload.find_device_enable));
    }
    if ("find_device_time" in payload) {
        encoded = encoded.concat(setFindDeviceTime(payload.find_device_time));
    }
    if ("stop_alarming" in payload) {
        encoded = encoded.concat(stopAlarming(payload.stop_alarming));
    }
    if ("lora_report_settings" in payload) {
        encoded = encoded.concat(setLoRaReportSettings(payload.lora_report_settings));
    }
    if ("d2d_enable" in payload) {
        encoded = encoded.concat(setD2DEnable(payload.d2d_enable));
    }
    if ("d2d_master_config" in payload) {
        for (var i = 0; i < payload.d2d_master_config.length; i++) {
            encoded = encoded.concat(setD2DMasterSettings(payload.d2d_master_config[i]));
        }
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
 * set report interval
 * @param {number} report_interval unit: second, range: [60, 64800]
 * @example { "report_interval": 300 }
 */
function setReportInterval(report_interval) {
    if (report_interval < 60 || report_interval > 64800) {
        throw new Error("report_interval must be between 60 and 64800");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x03);
    buffer.writeUInt16LE(report_interval);
    return buffer.toBytes();
}

/**
 * set leakage alarm settings
 * @param {object} leakage_alarm_config
 * @param {number} leakage_alarm_config.enable values: (0: disable, 1: enable)
 * @param {number} leakage_alarm_config.alarm_interval unit: second, range: [60, 64800]
 * @param {number} leakage_alarm_config.alarm_count unit: count, range: [2, 1000]
 * @example { "leakage_alarm_config": { "enable": 1, "alarm_interval": 60, "alarm_count": 2 } }
 */
function setLeakageAlarmSettings(leakage_alarm_config) {
    var enable = leakage_alarm_config.enable;
    var alarm_interval = leakage_alarm_config.alarm_interval;
    var alarm_count = leakage_alarm_config.alarm_count;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("leakage_alarm_config.enable must be one of " + enable_values.join(", "));
    }
    if (alarm_interval < 60 || alarm_interval > 64800) {
        throw new Error("leakage_alarm_config.alarm_interval must be between 60 and 64800");
    }
    if (alarm_count < 2 || alarm_count > 1000) {
        throw new Error("leakage_alarm_config.alarm_count must be between 2 and 1000");
    }

    var buffer = new Buffer(7);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x7e);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt16LE(alarm_interval);
    buffer.writeUInt16LE(alarm_count);
    return buffer.toBytes();
}

/**
 * set buzzer enable
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
 * set find device enable
 * @param {number} find_device_enable values: (0: disable, 1: enable)
 * @example { "find_device_enable": 1 }
 */
function findDeviceEnable(find_device_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(find_device_enable) === -1) {
        throw new Error("find_device_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x7f);
    buffer.writeUInt8(getValue(enable_map, find_device_enable));
    return buffer.toBytes();
}

/**
 * set find device time
 * @param {number} find_device_time unit: second, range: [60, 64800]
 * @example { "find_device_time": 10 }
 */
function setFindDeviceTime(find_device_time) {
    if (find_device_time < 60 || find_device_time > 64800) {
        throw new Error("find_device_time must be between 60 and 64800");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x80);
    buffer.writeUInt16LE(find_device_time);
    return buffer.toBytes();
}

/**
 * stop alarming
 * @param {number} stop_alarming values: (0: no, 1: yes)
 * @example { "stop_alarming": 1 }
 */
function stopAlarming(stop_alarming) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(stop_alarming) === -1) {
        throw new Error("stop_alarming must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, stop_alarming) === 0) {
        return [];
    }
    return [0xff, 0x3d, 0xff];
}

/**
 * set LoRa report settings
 * @param {object} lora_report_settings
 * @param {number} lora_report_settings.lora_uplink_enable values: (0: disable, 1: enable)
 * @param {number} lora_report_settings.d2d_uplink_enable values: (0: disable, 1: enable)
 * @example { "lora_report_settings": { "lora_uplink_enable": 1, "d2d_uplink_enable": 1 } }
 */
function setLoRaReportSettings(lora_report_settings) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(lora_report_settings.lora_uplink_enable) === -1) {
        throw new Error("lora_report_settings.lora_uplink_enable must be one of " + enable_values.join(", "));
    }
    if (enable_values.indexOf(lora_report_settings.d2d_uplink_enable) === -1) {
        throw new Error("lora_report_settings.d2d_uplink_enable must be one of " + enable_values.join(", "));
    }

    var data = 0x00;
    data |= getValue(enable_map, lora_report_settings.lora_uplink_enable) << 0;
    data |= getValue(enable_map, lora_report_settings.d2d_uplink_enable) << 1;

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x81);
    buffer.writeUInt8(0x01); // leakage alarm
    buffer.writeUInt8(data);
    return buffer.toBytes();
}

/**
 * set D2D enable
 * @param {number} d2d_enable values: (0: disable, 1: enable)
 * @example { "d2d_enable": 1 }
 */
function setD2DEnable(d2d_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(d2d_enable) === -1) {
        throw new Error("d2d_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x84);
    buffer.writeUInt8(getValue(enable_map, d2d_enable));
    return buffer.toBytes();
}

/**
 * set D2D master settings
 * @param {object} d2d_master_config
 * @param {number} d2d_master_config.mode values: (0: normal, 1: leakage)
 * @param {string} d2d_master_config.d2d_command
 * @example { "d2d_master_config": { "mode": 1, "d2d_command": "0000" } }
 */
function setD2DMasterSettings(d2d_master_config) {
    var mode = d2d_master_config.mode;
    var d2d_command = d2d_master_config.d2d_command;

    var mode_map = { 0: "normal", 1: "leakage" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(mode) === -1) {
        throw new Error("d2d_master_config.mode must be one of " + mode_values.join(", "));
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x83);
    buffer.writeUInt8(getValue(mode_map, mode));
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
