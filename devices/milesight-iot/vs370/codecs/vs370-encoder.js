/**
 * Payload Encoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product VS370
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
    if ("pir_idle_interval" in payload) {
        encoded = encoded.concat(setPIRIdleInterval(payload.pir_idle_interval));
    }
    if ("sync_time" in payload) {
        encoded = encoded.concat(syncTime(payload.sync_time));
    }
    if ("time_zone" in payload) {
        encoded = encoded.concat(setTimeZone(payload.time_zone));
    }
    if ("dst_config" in payload) {
        encoded = encoded.concat(setDaylightSavingTime(payload.dst_config));
    }
    if ("pir_window_time" in payload) {
        encoded = encoded.concat(setPirWindowTime(payload.pir_window_time));
    }
    if ("pir_pulse_times" in payload) {
        encoded = encoded.concat(setPirPulseTimes(payload.pir_pulse_times));
    }
    if ("pir_sensitivity" in payload) {
        encoded = encoded.concat(setPirSensitivity(payload.pir_sensitivity));
    }
    if ("radar_sensitivity" in payload) {
        encoded = encoded.concat(setRadarSensitivity(payload.radar_sensitivity));
    }
    if ("pir_illuminance_threshold" in payload) {
        encoded = encoded.concat(setPirIlluminanceThreshold(payload.pir_illuminance_threshold));
    }
    if ("bluetooth_enable" in payload) {
        encoded = encoded.concat(setBluetoothEnable(payload.bluetooth_enable));
    }
    if ("d2d_enable" in payload) {
        encoded = encoded.concat(setD2DEnable(payload.d2d_enable));
    }
    if ("d2d_key" in payload) {
        encoded = encoded.concat(setD2DKey(payload.d2d_key));
    }
    if ("d2d_master_config" in payload) {
        for (var i = 0; i < payload.d2d_master_config.length; i++) {
            var config = payload.d2d_master_config[i];
            encoded = encoded.concat(setD2DMasterConfig(config));
        }
    }
    if ("hibernate_config" in payload) {
        for (var i = 0; i < payload.hibernate_config.length; i++) {
            var config = payload.hibernate_config[i];
            encoded = encoded.concat(setHibernateConfig(config));
        }
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
 * report device status
 * @param {number} report_status values: (0: plan, 1: periodic)
 * @example { "report_status": 1 }
 */
function reportStatus(report_status) {
    var report_type_map = { 0: "plan", 1: "periodic" };
    var report_type_values = getValues(report_type_map);
    if (report_type_values.indexOf(report_status) === -1) {
        throw new Error("report_status must be one of " + report_type_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x28);
    buffer.writeUInt8(getValue(report_type_map, report_status));
    return buffer.toBytes();
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
        throw new Error("report_interval must be in range [1, 1440]");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x8e);
    buffer.writeUInt8(0x01);
    buffer.writeUInt16LE(report_interval);
    return buffer.toBytes();
}

/**
 * set pir idle interval
 * @param {number} pir_idle_interval unit: minute, range: [1, 60]
 * @example { "pir_idle_interval": 3 }
 */
function setPIRIdleInterval(pir_idle_interval) {
    if (typeof pir_idle_interval !== "number") {
        throw new Error("pir_idle_interval must be a number");
    }
    if (pir_idle_interval < 1 || pir_idle_interval > 60) {
        throw new Error("pir_idle_interval must be in range [1, 60]");
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x40);
    buffer.writeUInt8(pir_idle_interval);
    return buffer.toBytes();
}

/**
 * sync time
 * @param {number} sync_time values：(0: no, 1: yes)
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
    return [0xff, 0x4a, 0xff];
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
 * set pir window time
 * @param {number} pir_window_time values: (0: 2s, 1: 4s, 2: 6s, 3: 8s)
 * @example { "pir_window_time": 2 }
 */
function setPirWindowTime(pir_window_time) {
    var pir_window_time_map = { 0: "2s", 1: "4s", 2: "6s", 3: "8s" };
    var pir_window_time_values = getValues(pir_window_time_map);
    if (pir_window_time_values.indexOf(pir_window_time) === -1) {
        throw new Error("pir_window_time must be one of " + pir_window_time_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x42);
    buffer.writeUInt8(getValue(pir_window_time_map, pir_window_time));
    return buffer.toBytes();
}

/**
 * set pir pulse times threshold
 * @param {number} pir_pulse_times values: (0: 1_times, 1: 2_times, 2: 3_times, 3: 4_times)
 * @example { "pir_pulse_times": 2 }
 */
function setPirPulseTimes(pir_pulse_times) {
    var pir_pulse_times_map = { 0: "1_times", 1: "2_times", 2: "3_times", 3: "4_times" };
    var pir_pulse_times_values = getValues(pir_pulse_times_map);
    if (pir_pulse_times_values.indexOf(pir_pulse_times) === -1) {
        throw new Error("pir_pulse_times must be one of " + pir_pulse_times_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x43);
    buffer.writeUInt8(getValue(pir_pulse_times_map, pir_pulse_times));
    return buffer.toBytes();
}

/**
 * set pir sensitivity (sensitivity to triggers when transitioning from vacant to occupied)
 * @param {number} pir_sensitivity values: (0: low, 1: medium, 2: high)
 * @example { "pir_sensitivity": 1 }
 */
function setPirSensitivity(pir_sensitivity) {
    var pir_sensitivity_map = { 0: "low", 1: "medium", 2: "high" };
    var pir_sensitivity_values = getValues(pir_sensitivity_map);
    if (pir_sensitivity_values.indexOf(pir_sensitivity) === -1) {
        throw new Error("pir_sensitivity must be one of " + pir_sensitivity_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x3e);
    buffer.writeUInt8(getValue(pir_sensitivity_map, pir_sensitivity));
    return buffer.toBytes();
}

/**
 * set radar sensitivity (sensitivity to triggers while maintaining a motionless state)
 * @param {number} radar_sensitivity values: (0: low, 1: medium, 2: high)
 * @example { "radar_sensitivity": 1 }
 */
function setRadarSensitivity(radar_sensitivity) {
    var radar_sensitivity_map = { 0: "low", 1: "medium", 2: "high" };
    var radar_sensitivity_values = getValues(radar_sensitivity_map);
    if (radar_sensitivity_values.indexOf(radar_sensitivity) === -1) {
        throw new Error("radar_sensitivity must be one of " + radar_sensitivity_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x3f);
    buffer.writeUInt8(getValue(radar_sensitivity_map, radar_sensitivity));
    return buffer.toBytes();
}

/**
 * set light threshold
 * @param {number} enable values: (0: disable, 1: enable)
 * @param {number} upper_limit unit: lux, range: [1, 8000]
 * @param {number} lower_limit unit: lux, range: [1, 8000]
 * @example { "pir_illuminance_threshold": { "enable": 1, "upper_limit": 700, "lower_limit": 300 } }
 */
function setPirIlluminanceThreshold(pir_illuminance_threshold) {
    var enable = pir_illuminance_threshold.enable;
    var upper_limit = pir_illuminance_threshold.upper_limit;
    var lower_limit = pir_illuminance_threshold.lower_limit;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("pir_illuminance_threshold.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(7);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x41);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt16LE(upper_limit);
    buffer.writeUInt16LE(lower_limit);
    return buffer.toBytes();
}

/**
 * set daylight saving time
 * @param {object} dst_config
 * @param {number} dst_config.enable values: (0: disable, 1: enable)
 * @param {number} dst_config.offset, unit: minute
 * @param {number} dst_config.start_month, values: (1: January, 2: February, 3: March, 4: April, 5: May, 6: June, 7: July, 8: August, 9: September, 10: October, 11: November, 12: December)
 * @param {number} dst_config.start_week_num, range: [1, 5]
 * @param {number} dst_config.start_week_day, values: (1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday, 5: Friday, 6: Saturday, 7: Sunday)
 * @param {number} dst_config.start_time, unit: minute
 * @param {number} dst_config.end_month, values: (1: January, 2: February, 3: March, 4: April, 5: May, 6: June, 7: July, 8: August, 9: September, 10: October, 11: November, 12: December)
 * @param {number} dst_config.end_week_num, range: [1, 5]
 * @param {number} dst_config.end_week_day, values: (1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday, 5: Friday, 6: Saturday, 7: Sunday)
 * @param {number} dst_config.end_time, unit: minute
 * @example { "dst_config": { "enable": 1, "offset": 60, "start_month": 3, "start_week_num": 2, "start_week_day": 7, "start_time": 120, "end_month": 1, "end_week_num": 4, "end_week_day": 1, "end_time": 120 } }
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
    var month_map = { 1: "January", 2: "February", 3: "March", 4: "April", 5: "May", 6: "June", 7: "July", 8: "August", 9: "September", 10: "October", 11: "November", 12: "December" };
    var month_values = getValues(month_map);

    var enable_value = getValue(enable_map, enable);
    if (enable_value && month_values.indexOf(start_month) === -1) {
        throw new Error("dst_config.start_month must be one of " + month_values.join(", "));
    }
    if (enable_value && month_values.indexOf(end_month) === -1) {
        throw new Error("dst_config.end_month must be one of " + month_values.join(", "));
    }
    var week_map = { 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday", 7: "Sunday" };
    var week_values = getValues(week_map);
    if (enable_value && week_values.indexOf(start_week_day) === -1) {
        throw new Error("dst_config.start_week_day must be one of " + week_values.join(", "));
    }

    var buffer = new Buffer(12);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xba);
    buffer.writeUInt8(enable_value);
    buffer.writeInt8(offset);
    buffer.writeUInt8(enable_value && getValue(month_map, start_month));
    buffer.writeUInt8(enable_value && (start_week_num << 4) | getValue(week_map, start_week_day));
    buffer.writeUInt16LE(enable_value && start_time);
    buffer.writeUInt8(enable_value && getValue(month_map, end_month));
    buffer.writeUInt8(enable_value && (end_week_num << 4) | getValue(week_map, end_week_day));
    buffer.writeUInt16LE(enable_value && end_time);
    return buffer.toBytes();
}

/**
 * set bluetooth enable
 * @param {number} bluetooth_enable values: (0: disable, 1: enable)
 * @example { "bluetooth_enable": 1 }
 */
function setBluetoothEnable(bluetooth_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(bluetooth_enable) === -1) {
        throw new Error("bluetooth_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x8f);
    buffer.writeUInt8(getValue(enable_map, bluetooth_enable));
    return buffer.toBytes();
}

/**
 * set d2d enable
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
 * set d2d key
 * @param {string} d2d_key
 * @example { "d2d_key": "5572404C696E6B4C" }
 */
function setD2DKey(d2d_key) {
    if (typeof d2d_key !== "string") {
        throw new Error("d2d_key must be a string");
    }
    if (d2d_key.length !== 16) {
        throw new Error("d2d_key must be 16 characters");
    }
    if (!/^[0-9a-fA-F]+$/.test(d2d_key)) {
        throw new Error("d2d_key must be hex string [0-9a-fA-F]");
    }

    var data = hexStringToBytes(d2d_key);
    var buffer = new Buffer(10);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x35);
    buffer.writeBytes(data);
    return buffer.toBytes();
}

/**
 * d2d master configuration
 * @param {object} d2d_master_config
 * @param {number} d2d_master_config._item.mode values: (0: occupied, 1: vacant, 2: bright, 3: dim, 4: occupied_bright, 5: occupied_dim)
 * @param {number} d2d_master_config._item.enable values: (0: disable, 1: enable)
 * @param {string} d2d_master_config._item.d2d_cmd
 * @param {number} d2d_master_config._item.lora_uplink_enable values: (0: disable, 1: enable)
 * @param {number} d2d_master_config._item.time_enable values: (0: disable, 1: enable)
 * @param {number} d2d_master_config._item.time unit: minute
 * @example { "d2d_master_config": [{ "mode": 0, "enable": 1, "d2d_cmd": "0000", "lora_uplink_enable": 1, "time_enable": 1, "time": 10 }] }
 */
function setD2DMasterConfig(d2d_master_config) {
    var mode = d2d_master_config.mode;
    var enable = d2d_master_config.enable;
    var d2d_cmd = d2d_master_config.d2d_cmd;
    var lora_uplink_enable = d2d_master_config.lora_uplink_enable;
    var time_enable = d2d_master_config.time_enable;
    var time = d2d_master_config.time;

    var mode_map = { 0: "occupied", 1: "vacant", 2: "bright", 3: "dim", 4: "occupied_bright", 5: "occupied_dim" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(mode) === -1) {
        throw new Error("d2d_master_config._item.mode must be one of " + mode_values.join(", "));
    }
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("d2d_master_config._item.enable must be one of " + enable_values.join(", "));
    }
    if (enable && enable_values.indexOf(lora_uplink_enable) === -1) {
        throw new Error("d2d_master_config._item.lora_uplink_enable must be one of " + enable_values.join(", "));
    }
    if (enable && enable_values.indexOf(time_enable) === -1) {
        throw new Error("d2d_master_config._item.time_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(10);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x96);
    buffer.writeUInt8(getValue(mode_map, mode));
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(getValue(enable_map, lora_uplink_enable));
    buffer.writeD2DCommand(d2d_cmd, "0000");
    buffer.writeUInt16LE(time);
    buffer.writeUInt8(getValue(enable_map, time_enable));
    return buffer.toBytes();
}

/**
 * set hibernate config
 * @param {object} hibernate_config
 * @param {number} hibernate_config._item.id values: (1: group_1, 2: group_2)
 * @param {number} hibernate_config._item.enable values: (0: disable, 1: enable)
 * @param {number} hibernate_config._item.start_time unit: minute, range: [0, 1440]
 * @param {number} hibernate_config._item.end_time unit: minute, range: [0, 1440]
 * @example { "hibernate_config": [{ "id": 1, "enable": 1, "start_time": 0, "end_time": 120 }] }
 */
function setHibernateConfig(hibernate_config) {
    var id = hibernate_config.id;
    var enable = hibernate_config.enable;
    var start_time = hibernate_config.start_time;
    var end_time = hibernate_config.end_time;

    var id_values = [1, 2];
    if (id_values.indexOf(id) === -1) {
        throw new Error("hibernate_config._item.id must be one of " + id_values.join(", "));
    }
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("hibernate_config._item.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(8);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x44);
    buffer.writeUInt8(id - 1);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt16LE(start_time);
    buffer.writeUInt16LE(end_time);
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

Buffer.prototype.writeBytes = function (bytes) {
    for (var i = 0; i < bytes.length; i++) {
        this.buffer[this.offset + i] = bytes[i];
    }
    this.offset += bytes.length;
};

Buffer.prototype.toBytes = function () {
    return this.buffer;
};

function hexStringToBytes(hex) {
    var bytes = [];
    for (var c = 0; c < hex.length; c += 2) {
        bytes.push(parseInt(hex.substr(c, 2), 16));
    }
    return bytes;
}
