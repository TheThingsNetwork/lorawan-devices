/**
 * Payload Encoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product EM400-UDL
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
    if ("sync_time" in payload) {
        encoded = encoded.concat(syncTime(payload.sync_time));
    }
    if ("query_device_status" in payload) {
        encoded = encoded.concat(queryDeviceStatus(payload.query_device_status));
    }
    if ("collection_interval" in payload) {
        encoded = encoded.concat(setCollectionInterval(payload.collection_interval));
    }
    if ("report_interval" in payload) {
        encoded = encoded.concat(setReportInterval(payload.report_interval));
    }
    if ("people_existing_height" in payload) {
        encoded = encoded.concat(setPeopleExistingHeight(payload.people_existing_height));
    }
    if ("install_height_enable" in payload) {
        encoded = encoded.concat(setInstallHeightEnable(payload.install_height_enable));
    }
    if ("working_mode" in payload) {
        encoded = encoded.concat(setWorkingMode(payload.working_mode));
    }
    if ("tilt_linkage_distance_enable" in payload) {
        encoded = encoded.concat(setTiltLinkageDistanceEnable(payload.tilt_linkage_distance_enable));
    }
    if ("tof_detection_enable" in payload) {
        encoded = encoded.concat(setToFDetectionEnable(payload.tof_detection_enable));
    }
    if ("standard_mode_alarm_config" in payload) {
        encoded = encoded.concat(setStandardModeAlarmConfig(payload.standard_mode_alarm_config));
    }
    if ("recollection_config" in payload) {
        encoded = encoded.concat(setRecollectionConfig(payload.recollection_config));
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
 * collection interval
 * @param {number} collection_interval unit: second, range: [60, 64800]
 * @example { "collection_interval": 60 }
 */
function setCollectionInterval(collection_interval) {
    if (collection_interval < 60 || collection_interval > 64800) {
        throw new Error("collection_interval must be in range [60, 64800]");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x02);
    buffer.writeUInt16LE(collection_interval);
    return buffer.toBytes();
}

/**
 * report interval
 * @param {number} report_interval uint: second, range: [60, 64800]
 * @example payload: { "report_interval": 600 }
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
 * people existing height
 * @param {number} people_existing_height unit: mm
 * @example { "people_existing_height": 20 }
 */
function setPeopleExistingHeight(people_existing_height) {
    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x70);
    buffer.writeUInt16LE(people_existing_height);
    return buffer.toBytes();
}

/**
 * install height enable
 * @param {number} install_height_enable values: (0: disable, 1: enable)
 * @example { "install_height_enable": 1 }
 */
function setInstallHeightEnable(install_height_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(install_height_enable) === -1) {
        throw new Error("install_height_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x13);
    buffer.writeUInt8(getValue(enable_map, install_height_enable));
    return buffer.toBytes();
}

/**
 * working mode
 * @param {number} working_mode values: (0: standard, 1: bin)
 * @example { "working_mode": 0 }
 */
function setWorkingMode(working_mode) {
    var working_mode_map = { 0: "standard" };
    var working_mode_values = getValues(working_mode_map);
    if (working_mode_values.indexOf(working_mode) === -1) {
        throw new Error("working_mode must be one of " + working_mode_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x71);
    buffer.writeUInt8(getValue(working_mode_map, working_mode));
    return buffer.toBytes();
}

/**
 * tilt linkage distance enable
 * @param {number} tilt_linkage_distance_enable values: (0: disable, 1: enable)
 * @example { "tilt_linkage_distance_enable": 1 }
 */
function setTiltLinkageDistanceEnable(tilt_linkage_distance_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(tilt_linkage_distance_enable) === -1) {
        throw new Error("tilt_linkage_distance_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x3e);
    buffer.writeUInt8(getValue(enable_map, tilt_linkage_distance_enable));
    return buffer.toBytes();
}

/**
 * tof detection enable
 * @param {number} tof_detection_enable values: (0: disable, 1: enable)
 * @example { "tof_detection_enable": 1 }
 */
function setToFDetectionEnable(tof_detection_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(tof_detection_enable) === -1) {
        throw new Error("tof_detection_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x56);
    buffer.writeUInt8(getValue(enable_map, tof_detection_enable));
    return buffer.toBytes();
}

/**
 * standard mode alarm config
 * @param {object} standard_mode_alarm_config
 * @param {number} standard_mode_alarm_config.condition values: (0: disable, 1: below, 2: above, 3: between, 4: outside)
 * @param {number} standard_mode_alarm_config.alarm_release_enable values: (0: disable, 1: enable)
 * @param {number} standard_mode_alarm_config.threshold_min unit: mm, range: [0, 10000]
 * @param {number} standard_mode_alarm_config.threshold_max unit: mm, range: [0, 10000]
 * @example { "standard_mode_alarm_config": { "condition": 1, "threshold_min": 10, "threshold_max": 20 } }
 */
function setStandardModeAlarmConfig(standard_mode_alarm_config) {
    var condition = standard_mode_alarm_config.condition;
    var alarm_release_enable = standard_mode_alarm_config.alarm_release_enable;
    var threshold_min = standard_mode_alarm_config.threshold_min;
    var threshold_max = standard_mode_alarm_config.threshold_max;

    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside" };
    var condition_values = getValues(condition_map);
    if (condition_values.indexOf(condition) === -1) {
        throw new Error("standard_mode_alarm_config.condition must be one of " + condition_values.join(", "));
    }
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(alarm_release_enable) === -1) {
        throw new Error("standard_mode_alarm_config.alarm_release_enable must be one of " + enable_values.join(", "));
    }
    if (threshold_min < 0 || threshold_min > 10000) {
        throw new Error("standard_mode_alarm_config.threshold_min must be in range [0, 10000]");
    }
    if (threshold_max < 0 || threshold_max > 10000) {
        throw new Error("standard_mode_alarm_config.threshold_max must be in range [0, 10000]");
    }

    var data = 0x00;
    data |= getValue(condition_map, condition) << 0;
    data |= 1 << 3; // standard mode
    data |= getValue(enable_map, alarm_release_enable) << 7;

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x06);
    buffer.writeUInt8(data);
    buffer.writeUInt16LE(threshold_min);
    buffer.writeUInt16LE(threshold_max);
    buffer.writeUInt16LE(0x00);
    buffer.writeUInt16LE(0x00);
    return buffer.toBytes();
}

/**
 * recollection config
 * @param {object} recollection_config
 * @param {number} recollection_config.counts
 * @param {number} recollection_config.interval unit: s
 * @example { "recollection_config": { "counts": 1, "interval": 5 } }
 */
function setRecollectionConfig(recollection_config) {
    var counts = recollection_config.counts;
    var interval = recollection_config.interval;

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x1c);
    buffer.writeUInt8(counts);
    buffer.writeUInt8(interval);
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

Buffer.prototype.toBytes = function () {
    return this.buffer;
};
