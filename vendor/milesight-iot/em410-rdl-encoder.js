/**
 * Payload Encoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product EM410-RDL
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
    if ("collection_interval" in payload) {
        encoded = encoded.concat(setCollectionInterval(payload.collection_interval));
    }
    if ("sync_time" in payload) {
        encoded = encoded.concat(syncTime(payload.sync_time));
    }
    if ("time_zone" in payload) {
        encoded = encoded.concat(setTimeZone(payload.time_zone));
    }
    if ("distance_range" in payload) {
        encoded = encoded.concat(setDistanceRange(payload.distance_range));
    }
    if ("distance_alarm_config" in payload) {
        encoded = encoded.concat(setDistanceAlarm(payload.distance_alarm_config));
    }
    if ("distance_mutation_alarm_config" in payload) {
        encoded = encoded.concat(setDistanceMutationAlarm(payload.distance_mutation_alarm_config));
    }
    if ("tank_mode_distance_alarm_config" in payload) {
        encoded = encoded.concat(setTankModeDistanceAlarmConfig(payload.tank_mode_distance_alarm_config));
    }
    if ("tank_mode_distance_mutation_alarm_config" in payload) {
        encoded = encoded.concat(setTankModeDistanceMutationAlarm(payload.tank_mode_distance_mutation_alarm_config));
    }
    if ("alarm_counts" in payload) {
        encoded = encoded.concat(setAlarmCounts(payload.alarm_counts));
    }
    if ("radar_calibration" in payload) {
        encoded = encoded.concat(setRadarCalibration(payload.radar_calibration));
    }
    if ("radar_blind_calibration" in payload) {
        encoded = encoded.concat(setRadarBlindCalibration(payload.radar_blind_calibration));
    }
    if ("distance_calibration_settings" in payload) {
        encoded = encoded.concat(setDistanceCalibration(payload.distance_calibration_settings));
    }
    if ("distance_mode" in payload) {
        encoded = encoded.concat(setDistanceMode(payload.distance_mode));
    }
    if ("blind_detection_enable" in payload) {
        encoded = encoded.concat(setBlindDetectionEnable(payload.blind_detection_enable));
    }
    if ("recollection_config" in payload) {
        encoded = encoded.concat(setRecollectionConfig(payload.recollection_config));
    }
    if ("signal_quality" in payload) {
        encoded = encoded.concat(setSignalQuality(payload.signal_quality));
    }
    if ("distance_threshold_sensitive" in payload) {
        encoded = encoded.concat(setDistanceThresholdSensitive(payload.distance_threshold_sensitive));
    }
    if ("peak_sorting" in payload) {
        encoded = encoded.concat(setPeakSortingAlgorithm(payload.peak_sorting));
    }
    if ("retransmit_enable" in payload) {
        encoded = encoded.concat(setRetransmitEnable(payload.retransmit_enable));
    }
    if ("retransmit_interval" in payload) {
        encoded = encoded.concat(setRetransmitInterval(payload.retransmit_interval));
    }
    if ("resend_interval" in payload) {
        encoded = encoded.concat(setResendInterval(payload.resend_interval));
    }
    if ("stop_transmit" in payload) {
        encoded = encoded.concat(stopTransmit(payload.stop_transmit));
    }
    if ("history_enable" in payload) {
        encoded = encoded.concat(setHistoryEnable(payload.history_enable));
    }
    if ("fetch_history" in payload) {
        encoded = encoded.concat(fetchHistory(payload.fetch_history));
    }
    if ("clear_history" in payload) {
        encoded = encoded.concat(clearHistory(payload.clear_history));
    }
    if ("tilt_distance_link" in payload) {
        encoded = encoded.concat(setTiltAndDistanceLink(payload.tilt_distance_link));
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
    return [0xff, 0x28, 0x01];
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
    buffer.writeUInt8(0x00);
    buffer.writeUInt16LE(report_interval);
    return buffer.toBytes();
}

/**
 * set collection interval
 * @param {number} collection_interval unit: minute, range: [1, 1440]
 * @example { "collection_interval": 300 }
 */
function setCollectionInterval(collection_interval) {
    if (typeof collection_interval !== "number") {
        throw new Error("collection_interval must be a number");
    }
    if (collection_interval < 1 || collection_interval > 1440) {
        throw new Error("collection_interval must be in range [1, 1440]");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x39);
    buffer.writeUInt16LE(collection_interval);
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
 * set distance range
 * @param {object} distance_range
 * @param {number} distance_range.mode values: (0: general, 1: rainwater, 2: wastewater, 3: tank)
 * @param {number} distance_range.max unit: mm
 * @example { "distance_range": { "mode": 0, "max": 1000 } }
 */
function setDistanceRange(distance_range) {
    var mode = distance_range.mode;
    var max = distance_range.max;

    var distance_mode_map = { 0: "general", 1: "rainwater", 2: "wastewater", 3: "tank" };
    var distance_mode_values = getValues(distance_mode_map);
    if (distance_mode_values.indexOf(mode) === -1) {
        throw new Error("distance_range.mode must be one of " + distance_mode_values.join(", "));
    }
    if (typeof max !== "number") {
        throw new Error("distance_range.max must be a number");
    }

    var buffer = new Buffer(7);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x1b);
    buffer.writeUInt8(getValue(distance_mode_map, mode));
    buffer.writeUInt16LE(0);
    buffer.writeUInt16LE(max);
    return buffer.toBytes();
}

/**
 * set distance alarm
 * @param {object} distance_alarm_config
 * @param {number} distance_alarm_config.enable values: (0: disable, 1: enable)
 * @param {number} distance_alarm_config.condition values: (0: disable, 1: below, 2: above, 3: between, 4: outside, 5: mutation)
 * @param {number} distance_alarm_config.alarm_release_enable values: (0: disable, 1: enable)
 * @param {number} distance_alarm_config.threshold_min
 * @param {number} distance_alarm_config.threshold_max
 * @example { "distance_alarm_config": { "condition": 1, "alarm_release_enable": 1, "threshold": 100, "threshold": 1000 } }_min_max
 */
function setDistanceAlarm(distance_alarm_config) {
    var enable = distance_alarm_config.enable;
    var condition = distance_alarm_config.condition;
    var alarm_release_enable = distance_alarm_config.alarm_release_enable;
    var threshold_min = distance_alarm_config.threshold_min;
    var threshold_max = distance_alarm_config.threshold_max;

    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside", 5: "mutation" };
    var condition_values = getValues(condition_map);
    if (condition_values.indexOf(condition) === -1) {
        throw new Error("distance_alarm_config.condition must be one of " + condition_values.join(", "));
    }
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("distance_alarm_config.enable must be one of " + enable_values.join(", "));
    }
    if (enable_values.indexOf(alarm_release_enable) === -1) {
        throw new Error("distance_alarm_config.alarm_release_enable must be one of " + enable_values.join(", "));
    }
    if (typeof threshold_min !== "number") {
        throw new Error("distance_alarm_config.threshold_min must be a number");
    }
    if (typeof threshold_max !== "number") {
        throw new Error("distance_alarm_config.threshold_max must be a number");
    }

    var data = 0x00;
    data |= getValue(enable_map, alarm_release_enable) << 7;
    data |= 1 << 3;
    data |= getValue(enable_map, enable) === 0 ? 0 : getValue(condition_map, condition);

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x06);
    buffer.writeUInt8(data);
    buffer.writeInt16LE(threshold_min);
    buffer.writeInt16LE(threshold_max);
    buffer.writeUInt16LE(0);
    buffer.writeUInt16LE(0);
    return buffer.toBytes();
}

/**
 * set tank mode distance alarm
 * @param {object} tank_mode_distance_alarm_config
 * @param {number} tank_mode_distance_alarm_config.enable values: (0: disable, 1: enable)
 * @param {number} tank_mode_distance_alarm_config.condition values: (0: disable, 1: below, 2: above, 3: between, 4: outside, 5: mutation)
 * @param {number} tank_mode_distance_alarm_config.alarm_release_enable values: (0: disable, 1: enable)
 * @param {number} tank_mode_distance_alarm_config.threshold_min
 * @param {number} tank_mode_distance_alarm_config.threshold_max
 * @example { "tank_mode_distance_alarm_config": { "enable": 1, "condition": 1, "alarm_release_enable": 1, "threshold": 100, "threshold": 1000 } }_min_max
 */
function setTankModeDistanceAlarmConfig(tank_mode_distance_alarm_config) {
    var enable = tank_mode_distance_alarm_config.enable;
    var condition = tank_mode_distance_alarm_config.condition;
    var alarm_release_enable = tank_mode_distance_alarm_config.alarm_release_enable;
    var threshold_min = tank_mode_distance_alarm_config.threshold_min;
    var threshold_max = tank_mode_distance_alarm_config.threshold_max;

    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside", 5: "mutation" };
    var condition_values = getValues(condition_map);
    if (condition_values.indexOf(condition) === -1) {
        throw new Error("tank_mode_distance_alarm_config.condition must be one of " + condition_values.join(", "));
    }
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("tank_mode_distance_alarm_config.enable must be one of " + enable_values.join(", "));
    }
    if (enable_values.indexOf(alarm_release_enable) === -1) {
        throw new Error("tank_mode_distance_alarm_config.alarm_release_enable must be one of " + enable_values.join(", "));
    }
    if (typeof threshold_min !== "number") {
        throw new Error("tank_mode_distance_alarm_config.threshold_min must be a number");
    }
    if (typeof threshold_max !== "number") {
        throw new Error("tank_mode_distance_alarm_config.threshold_max must be a number");
    }

    var data = 0x00;
    data |= getValue(enable_map, alarm_release_enable) << 7;
    data |= 3 << 3;
    data |= getValue(enable_map, enable) === 0 ? 0 : getValue(condition_map, condition);

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x06);
    buffer.writeUInt8(data);
    buffer.writeInt16LE(threshold_min);
    buffer.writeInt16LE(threshold_max);
    buffer.writeUInt16LE(0);
    buffer.writeUInt16LE(0);
    return buffer.toBytes();
}

/**
 * set distance mutation alarm
 * @param {object} distance_mutation_alarm_config
 * @param {number} distance_mutation_alarm_config.enable values: (0: disable, 1: enable)
 * @param {number} distance_mutation_alarm_config.alarm_release_enable values: (0: disable, 1: enable)
 * @param {number} distance_mutation_alarm_config.mutation
 * @example { "distance_mutation_alarm_config": { "enable": 1, "alarm_release_enable": 1, "mutation": 100 } }
 */
function setDistanceMutationAlarm(distance_mutation_alarm_config) {
    var enable = distance_mutation_alarm_config.enable;
    var alarm_release_enable = distance_mutation_alarm_config.alarm_release_enable;
    var mutation = distance_mutation_alarm_config.mutation;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    var enable = distance_mutation_alarm_config.enable;
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("distance_mutation_alarm_config.enable must be one of " + enable_values.join(", "));
    }
    if (enable_values.indexOf(alarm_release_enable) === -1) {
        throw new Error("distance_mutation_alarm_config.alarm_release_enable must be one of " + enable_values.join(", "));
    }
    var data = 0x00;
    data |= getValue(enable_map, alarm_release_enable) << 7;
    data |= 2 << 3;
    data |= getValue(enable_map, enable) === 0 ? 0 : 5;

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x06);
    buffer.writeUInt8(data);
    buffer.writeInt16LE(0x00);
    buffer.writeInt16LE(mutation);
    buffer.writeUInt16LE(0);
    buffer.writeUInt16LE(0);
    return buffer.toBytes();
}

/**
 * set tank mode distance mutation alarm
 * @param {object} tank_mode_distance_mutation_alarm_config
 * @param {number} tank_mode_distance_mutation_alarm_config.enable values: (0: disable, 1: enable)
 * @param {number} tank_mode_distance_mutation_alarm_config.alarm_release_enable values: (0: disable, 1: enable)
 * @param {number} tank_mode_distance_mutation_alarm_config.mutation
 * @example { "tank_mode_distance_mutation_alarm_config": { "enable": 1, "alarm_release_enable": 1, "mutation": 100 } }
 */
function setTankModeDistanceMutationAlarm(tank_mode_distance_mutation_alarm_config) {
    var enable = tank_mode_distance_mutation_alarm_config.enable;
    var alarm_release_enable = tank_mode_distance_mutation_alarm_config.alarm_release_enable;
    var mutation = tank_mode_distance_mutation_alarm_config.mutation;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("tank_mode_distance_mutation_alarm_config.enable must be one of " + enable_values.join(", "));
    }
    if (enable_values.indexOf(alarm_release_enable) === -1) {
        throw new Error("tank_mode_distance_mutation_alarm_config.alarm_release_enable must be one of " + enable_values.join(", "));
    }
    var data = 0x00;
    data |= getValue(enable_map, alarm_release_enable) << 7;
    data |= 4 << 3;
    data |= getValue(enable_map, enable) === 0 ? 0 : 5;

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x06);
    buffer.writeUInt8(data);
    buffer.writeInt16LE(0x00);
    buffer.writeInt16LE(mutation);
    buffer.writeUInt16LE(0);
    buffer.writeUInt16LE(0);
    return buffer.toBytes();
}

/**
 * set alarm count
 * @param {number} alarm_counts range: [1, 1000]
 * @example { "alarm_counts": 10 }
 */
function setAlarmCounts(alarm_counts) {
    if (typeof alarm_counts !== "number") {
        throw new Error("alarm_counts must be a number");
    }
    if (alarm_counts < 1 || alarm_counts > 1000) {
        throw new Error("alarm_counts must be in range [1, 1000]");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xf2);
    buffer.writeUInt16LE(alarm_counts);
    return buffer.toBytes();
}

/**
 * radar calibration
 * @param {number} radar_calibration values: (0: no, 1: yes)
 * @example { "radar_calibration": 0 }
 */
function setRadarCalibration(radar_calibration) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(radar_calibration) === -1) {
        throw new Error("radar_calibration must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, radar_calibration) === 0) {
        return [];
    }
    return [0xff, 0x2a, 0x00];
}

/**
 * radar blind calibration
 * @param {number} radar_blind_calibration values: (0: no, 1: yes)
 * @example { "radar_blind_calibration": 0 }
 */
function setRadarBlindCalibration(radar_blind_calibration) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(radar_blind_calibration) === -1) {
        throw new Error("radar_blind_calibration must be one of " + yes_no_values.join(", "));
    }
    if (getValue(yes_no_map, radar_blind_calibration) === 0) {
        return [];
    }
    return [0xff, 0x2a, 0x01];
}

/**
 * calibrate radar distance
 * @param {object} distance_calibration_settings
 * @param {number} distance_calibration_settings.enable values: (0: disable, 1: enable)
 * @param {number} distance_calibration_settings.calibration_value unit: mm
 * @example { "distance_calibration_settings": { "enable": 1, "calibration_value": 100 } }
 */
function setDistanceCalibration(distance_calibration_settings) {
    var enable = distance_calibration_settings.enable;
    var calibration_value = distance_calibration_settings.calibration_value;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("distance_calibration_settings.enable must be one of " + enable_values.join(", "));
    }

    if (typeof calibration_value !== "number") {
        throw new Error("distance_calibration_settings.calibration_value must be a number");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xab);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeInt16LE(calibration_value);
    return buffer.toBytes();
}

/**
 * distance mode
 * @param {number} distance_mode values: (0: general, 1: rainwater, 2: wastewater, 3: tank)
 * @example { "distance_mode": 0 }
 */
function setDistanceMode(distance_mode) {
    var distance_mode_map = { 0: "general", 1: "rainwater", 2: "wastewater", 3: "tank" };
    var distance_mode_values = getValues(distance_mode_map);
    if (distance_mode_values.indexOf(distance_mode) === -1) {
        throw new Error("distance_mode must be one of " + distance_mode_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x12);
    buffer.writeUInt8(getValue(distance_mode_map, distance_mode));
    return buffer.toBytes();
}

/**
 * blind detection enable
 * @param {number} blind_detection_enable values: (0: disable, 1: enable)
 * @example { "blind_detection_enable": 1 }
 */
function setBlindDetectionEnable(blind_detection_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(blind_detection_enable) === -1) {
        throw new Error("blind_detection_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x13);
    buffer.writeUInt8(getValue(enable_map, blind_detection_enable));
    return buffer.toBytes();
}

/**
 * set recollection config
 * @param {object} recollection_config
 * @param {number} recollection_config.counts range: [1, 3]
 * @param {number} recollection_config.interval unit: s, range: [1, 10]
 * @example { "recollection_config": { "counts": 3, "interval": 10 } }
 */
function setRecollectionConfig(recollection_config) {
    var counts = recollection_config.counts;
    var interval = recollection_config.interval;

    if (typeof counts !== "number") {
        throw new Error("recollection_config.counts must be a number");
    }
    if (counts < 1 || counts > 3) {
        throw new Error("recollection_config.counts must be in range [1, 3]");
    }
    if (typeof interval !== "number") {
        throw new Error("recollection_config.interval must be a number");
    }
    if (interval < 1 || interval > 10) {
        throw new Error("recollection_config.interval must be in range [1, 10]");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x1c);
    buffer.writeUInt8(counts);
    buffer.writeUInt8(interval);
    return buffer.toBytes();
}

/**
 * signal quality
 * @param {number} signal_quality
 * @example { "signal_quality": 10 }
 */
function setSignalQuality(signal_quality) {
    if (typeof signal_quality !== "number") {
        throw new Error("signal_quality must be a number");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x14);
    buffer.writeInt16LE(signal_quality);
    return buffer.toBytes();
}

/**
 * threshold sensitive
 * @param {number} distance_threshold_sensitive
 * @example { "distance_threshold_sensitive": 10 }
 */
function setDistanceThresholdSensitive(distance_threshold_sensitive) {
    if (typeof distance_threshold_sensitive !== "number") {
        throw new Error("distance_threshold_sensitive must be a number");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x15);
    buffer.writeInt16LE(distance_threshold_sensitive * 10);
    return buffer.toBytes();
}

/**
 * set peak sort
 * @param {number} peak_sorting values: (0: closest, 1: strongest)
 * @example { "peak_sorting": 0 }
 */
function setPeakSortingAlgorithm(peak_sorting) {
    var peak_sorting_map = { 0: "closest", 1: "strongest" };
    var peak_sorting_values = getValues(peak_sorting_map);
    if (peak_sorting_values.indexOf(peak_sorting) === -1) {
        throw new Error("peak_sorting must be one of " + peak_sorting_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x16);
    buffer.writeUInt8(getValue(peak_sorting_map, peak_sorting));
    return buffer.toBytes();
}

/**
 * retransmit enable
 * @param {number} retransmit_enable values: (0: disable, 1: enable)
 * @example { "retransmit_enable": 1 }
 */
function setRetransmitEnable(retransmit_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(retransmit_enable) === -1) {
        throw new Error("retransmit_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x69);
    buffer.writeUInt8(getValue(enable_map, retransmit_enable));
    return buffer.toBytes();
}

/**
 * retransmit interval
 * @param {number} retransmit_interval unit: second
 * @example { "retransmit_interval": 60 }
 */
function setRetransmitInterval(retransmit_interval) {
    if (typeof retransmit_interval !== "number") {
        throw new Error("retransmit_interval must be a number");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x6a);
    buffer.writeUInt8(0x00);
    buffer.writeUInt16LE(retransmit_interval);
    return buffer.toBytes();
}

/**
 * resend interval
 * @param {number} resend_interval unit: second
 * @example { "resend_interval": 60 }
 */
function setResendInterval(resend_interval) {
    if (typeof resend_interval !== "number") {
        throw new Error("resend_interval must be a number");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x6a);
    buffer.writeUInt8(0x01);
    buffer.writeUInt16LE(resend_interval);
    return buffer.toBytes();
}

/**
 * history stop transmit
 * @param {number} stop_transmit values: (0: no, 1: yes)
 * @example { "stop_transmit": 1 }
 */
function stopTransmit(stop_transmit) {
    var enable_map = { 0: "no", 1: "yes" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(stop_transmit) === -1) {
        throw new Error("stop_transmit must be one of " + enable_values.join(", "));
    }

    if (getValue(enable_map, stop_transmit) === 0) {
        return [];
    }
    return [0xfd, 0x6d, 0xff];
}

/**
 * history enable
 * @param {number} history_enable values: (0: disable, 1: enable)
 * @example { "history_enable": 1 }
 */
function setHistoryEnable(history_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(history_enable) === -1) {
        throw new Error("history_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x68);
    buffer.writeUInt8(getValue(enable_map, history_enable));
    return buffer.toBytes();
}

/**
 * fetch history
 * @param {object} fetch_history
 * @param {number} fetch_history.start_time
 * @param {number} fetch_history.end_time
 * @example { "fetch_history": { "start_time": 1609459200, "end_time": 1609545600 } }
 */
function fetchHistory(fetch_history) {
    var start_time = fetch_history.start_time;
    var end_time = fetch_history.end_time;

    if (typeof start_time !== "number") {
        throw new Error("fetch_history.start_time must be a number");
    }
    if (end_time && typeof end_time !== "number") {
        throw new Error("fetch_history.end_time must be a number");
    }
    if (end_time && start_time > end_time) {
        throw new Error("fetch_history.start_time must be less than fetch_history.end_time");
    }

    var buffer;
    if (end_time === 0) {
        buffer = new Buffer(6);
        buffer.writeUInt8(0xfd);
        buffer.writeUInt8(0x6b);
        buffer.writeUInt32LE(start_time);
    } else {
        buffer = new Buffer(10);
        buffer.writeUInt8(0xfd);
        buffer.writeUInt8(0x6c);
        buffer.writeUInt32LE(start_time);
        buffer.writeUInt32LE(end_time);
    }
    return buffer.toBytes();
}

/**
 * clear history
 * @param {number} clear_history values: (0: no, 1: yes)
 * @example { "clear_history": 1 }
 */
function clearHistory(clear_history) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(clear_history) === -1) {
        throw new Error("clear_history must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, clear_history) === 0) {
        return [];
    }
    return [0xff, 0x27, 0x01];
}

/**
 * tilt and distance link
 * @param {number} tilt_distance_link values: (0: disable, 1: enable)
 * @example { "tilt_distance_link": 1 }
 */
function setTiltAndDistanceLink(tilt_distance_link) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(tilt_distance_link) === -1) {
        throw new Error("tilt_distance_link must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x3e);
    buffer.writeUInt8(getValue(enable_map, tilt_distance_link));
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
    for (var index = 0; index < byteLength; index++) {
        var shift = isLittleEndian ? index << 3 : (byteLength - 1 - index) << 3;
        this.buffer[this.offset + index] = (value & (0xff << shift)) >> shift;
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
