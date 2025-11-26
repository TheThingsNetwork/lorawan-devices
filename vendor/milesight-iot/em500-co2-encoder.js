/**
 * Payload Encoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product EM500-CO2
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
    if ("collection_interval" in payload) {
        encoded = encoded.concat(setCollectionInterval(payload.collection_interval));
    }
    if ("report_interval" in payload) {
        encoded = encoded.concat(setReportInterval(payload.report_interval));
    }
    if ("report_status" in payload) {
        encoded = encoded.concat(reportStatus(payload.report_status));
    }
    if ("timestamp" in payload) {
        encoded = encoded.concat(setTimestamp(payload.timestamp));
    }
    if ("time_zone" in payload) {
        encoded = encoded.concat(setTimeZone(payload.time_zone));
    }
    if ("time_sync_enable" in payload) {
        encoded = encoded.concat(setTimeSyncEnable(payload.time_sync_enable));
    }
    if ("sync_time" in payload) {
        encoded = encoded.concat(syncTime(payload.sync_time));
    }
    if ("recollection_config" in payload) {
        encoded = encoded.concat(setRecollectionConfig(payload.recollection_config));
    }
    if ("co2_calibration_config" in payload) {
        encoded = encoded.concat(setCO2CalibrationConfig(payload.co2_calibration_config));
    }
    if ("co2_abc_calibration_schedule" in payload) {
        encoded = encoded.concat(setCO2AutoBackgroundCalibrationConfig(payload.co2_abc_calibration_schedule));
    }
    if ("temperature_calibration_settings" in payload) {
        encoded = encoded.concat(setTemperatureCalibrationValueConfig(payload.temperature_calibration_settings));
    }
    if ("co2_calibration_settings" in payload) {
        encoded = encoded.concat(setCO2CalibrationValueConfig(payload.co2_calibration_settings));
    }
    if ("humidity_calibration_settings" in payload) {
        encoded = encoded.concat(setHumidityCalibrationValueConfig(payload.humidity_calibration_settings));
    }
    if ("pressure_calibration_settings" in payload) {
        encoded = encoded.concat(setPressureCalibrationValueConfig(payload.pressure_calibration_settings));
    }
    if ("altitude_calibration_settings" in payload) {
        encoded = encoded.concat(setAltitudeCalibrationConfig(payload.altitude_calibration_settings));
    }
    if ("sensor_function_config" in payload) {
        encoded = encoded.concat(setSensorFunctionConfig(payload.sensor_function_config));
    }
    if ("co2_alarm_config" in payload) {
        encoded = encoded.concat(setCO2ThresholdAlarmConfig(payload.co2_alarm_config));
    }
    if ("temperature_alarm_config" in payload) {
        encoded = encoded.concat(setTemperatureThresholdAlarmConfig(payload.temperature_alarm_config));
    }
    if ("temperature_mutation_alarm_config" in payload) {
        encoded = encoded.concat(setTemperatureMutationAlarmConfig(payload.temperature_mutation_alarm_config));
    }
    if ("alarm_report_counts" in payload) {
        encoded = encoded.concat(alarmReportCounts(payload.alarm_report_counts));
    }
    if ("alarm_release_enable" in payload) {
        encoded = encoded.concat(setAlarmReleaseEnable(payload.alarm_release_enable));
    }
    if ("d2d_master_config" in payload) {
        for (var i = 0; i < payload.d2d_master_config.length; i++) {
            encoded = encoded.concat(setD2DMasterConfig(payload.d2d_master_config[i]));
        }
    }
    if ("d2d_key" in payload) {
        encoded = encoded.concat(setD2DKey(payload.d2d_key));
    }
    if ("d2d_enable" in payload) {
        encoded = encoded.concat(setD2DEnable(payload.d2d_enable));
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
 * set report interval
 * @param {number} report_interval unit: seconds
 * @example { "report_interval": 600 }
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
 * report device status
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
 * set timestamp
 * @param {number} timestamp unit: second
 * @example { "timestamp": 1717756800 }
 */
function setTimestamp(timestamp) {
    if (typeof timestamp !== "number") {
        throw new Error("timestamp must be a number");
    }
    if (timestamp < 0) {
        throw new Error("timestamp must be greater than 0");
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x11);
    buffer.writeUInt32LE(timestamp);
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
 * set time sync enable
 * @param {number} time_sync_enable values: (0: disable, 1: enable)
 * @example { "time_sync_enable": 1 }
 */
function setTimeSyncEnable(time_sync_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(time_sync_enable) === -1) {
        throw new Error("time_sync_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x3b);
    buffer.writeUInt8(getValue(enable_map, time_sync_enable));
    return buffer.toBytes();
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
    return [0xff, 0x4a, 0xff];
}

/**
 * set recollection config
 * @param {object} recollection_config
 * @param {number} recollection_config.counts
 * @param {number} recollection_config.interval
 * @example { "recollection_config": { "counts": 3, "interval": 10 } }
 */
function setRecollectionConfig(recollection_config) {
    var counts = recollection_config.counts;
    var interval = recollection_config.interval;

    if (typeof counts !== "number") {
        throw new Error("recollection_config.counts must be a number");
    }
    if (typeof interval !== "number") {
        throw new Error("recollection_config.interval must be a number");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x1c);
    buffer.writeUInt8(counts);
    buffer.writeUInt8(interval);
    return buffer.toBytes();
}

/**
 * set CO2 calibration config
 * @param {object} co2_calibration_config
 * @param {number} co2_calibration_config.mode values: (0: factory, 1: abc, 2: manual, 3: background, 4: zero)
 * @param {number} co2_calibration_config.calibration_value
 * @example { "co2_calibration_config": { "mode": 1 } }
 */
function setCO2CalibrationConfig(co2_calibration_config) {
    var mode = co2_calibration_config.mode;
    var calibration_value = co2_calibration_config.calibration_value;

    var calibration_strategy_map = { 0: "factory", 1: "abc", 2: "manual", 3: "background", 4: "zero" };
    var calibration_strategy_values = getValues(calibration_strategy_map);
    if (calibration_strategy_values.indexOf(mode) == -1) {
        throw new Error("co2_calibration_config.mode must be one of " + calibration_strategy_values.join(", "));
    }

    if (getValue(calibration_strategy_map, mode) === 2) {
        var buffer = new Buffer(5);
        buffer.writeUInt8(0xff);
        buffer.writeUInt8(0x1a);
        buffer.writeUInt8(getValue(calibration_strategy_map, mode));
        buffer.writeUInt16LE(calibration_value);
        return buffer.toBytes();
    } else {
        var buffer = new Buffer(3);
        buffer.writeUInt8(0xff);
        buffer.writeUInt8(0x1a);
        buffer.writeUInt8(getValue(calibration_strategy_map, mode));
        return buffer.toBytes();
    }
}

/**
 * set CO2 auto background calibration schedule
 * @param {object} co2_abc_calibration_schedule
 * @param {number} co2_abc_calibration_schedule.enable values: (0: disable, 1: enable)
 * @param {number} co2_abc_calibration_schedule.period unit: minute, range: [1, 65534]
 * @param {number} co2_abc_calibration_schedule.calibration_value unit: ppm, range: [1, 65534]
 * @example { "co2_abc_calibration_schedule": { "enable": 1, "period": 3600, "calibration_value": 400 } }
 * @product AM319
 */
function setCO2AutoBackgroundCalibrationConfig(co2_abc_calibration_schedule) {
    var enable = co2_abc_calibration_schedule.enable;
    var period = co2_abc_calibration_schedule.period;
    var calibration_value = co2_abc_calibration_schedule.calibration_value;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) == -1) {
        throw new Error("co2_abc_calibration_schedule.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(7);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x39);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt16LE(period);
    buffer.writeUInt16LE(calibration_value);
    return buffer.toBytes();
}

/**
 * set temperature calibration value
 * @since hardware_version v2.0, firmware_version v1.7
 * @param {object} temperature_calibration_settings
 * @param {number} temperature_calibration_settings.enable values: (0: disable, 1: enable)
 * @param {number} temperature_calibration_settings.calibration_value
 * @example { "temperature_calibration_settings": { "enable": 1, "calibration_value": 23 } }
 */
function setTemperatureCalibrationValueConfig(temperature_calibration_settings) {
    var enable = temperature_calibration_settings.enable;
    var calibration_value = temperature_calibration_settings.calibration_value;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("temperature_calibration_settings.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xf1);
    buffer.writeUInt8(0x00); // temperature
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeInt16LE(calibration_value * 10);
    return buffer.toBytes();
}

/**
 * set CO2 calibration value
 * @since hardware_version v2.0, firmware_version v1.7
 * @param {object} co2_calibration_settings
 * @param {number} co2_calibration_settings.enable values: (0: disable, 1: enable)
 * @param {number} co2_calibration_settings.calibration_value
 * @example { "co2_calibration_settings": { "enable": 1, "calibration_value": 1000 } }
 */
function setCO2CalibrationValueConfig(co2_calibration_settings) {
    var enable = co2_calibration_settings.enable;
    var calibration_value = co2_calibration_settings.calibration_value;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("co2_calibration_settings.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xf1);
    buffer.writeUInt8(0x04); // co2
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeInt16LE(calibration_value);
    return buffer.toBytes();
}

/**
 * set humidity calibration value
 * @since hardware_version v2.0, firmware_version v1.7
 * @param {object} humidity_calibration_settings
 * @param {number} humidity_calibration_settings.enable values: (0: disable, 1: enable)
 * @param {number} humidity_calibration_settings.calibration_value
 * @example { "humidity_calibration_settings": { "enable": 1, "calibration_value": 50 } }
 */
function setHumidityCalibrationValueConfig(humidity_calibration_settings) {
    var enable = humidity_calibration_settings.enable;
    var calibration_value = humidity_calibration_settings.calibration_value;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("humidity_calibration_settings.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0xff);

    var buffer = new Buffer(6);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xf1);
    buffer.writeUInt8(0x09);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeInt16LE(calibration_value * 2);
    return buffer.toBytes();
}

/**
 * set pressure calibration value
 * @since hardware_version v2.0, firmware_version v1.7
 * @param {object} pressure_calibration_settings
 * @param {number} pressure_calibration_settings.enable values: (0: disable, 1: enable)
 * @param {number} pressure_calibration_settings.calibration_value
 * @example { "pressure_calibration_settings": { "enable": 1, "calibration_value": 1000 } }
 */
function setPressureCalibrationValueConfig(pressure_calibration_settings) {
    var enable = pressure_calibration_settings.enable;
    var calibration_value = pressure_calibration_settings.calibration_value;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("pressure_calibration_settings.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xf1);
    buffer.writeUInt8(0x05);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeInt16LE(calibration_value * 10);
    return buffer.toBytes();
}

/**
 * set pressure calibration config
 * @param {object} altitude_calibration_settings
 * @param {number} altitude_calibration_settings.mode values: (0: disable, 1: auto, 2: manual)
 * @param {number} altitude_calibration_settings.calibration_value
 * @example { "altitude_calibration_settings": { "mode": 1, "calibration_value": 1000 } }
 */
function setAltitudeCalibrationConfig(altitude_calibration_settings) {
    var mode = altitude_calibration_settings.mode;
    var calibration_value = altitude_calibration_settings.calibration_value;

    var mode_map = { 0: "disable", 1: "auto", 2: "manual" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(mode) == -1) {
        throw new Error("pressure_calibration_settings.mode must be one of " + mode_values.join(", "));
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x87);
    buffer.writeUInt8(getValue(mode_map, mode));
    buffer.writeInt16LE(calibration_value);
    return buffer.toBytes();
}

/**
 * set sensor function config
 * @param {object} sensor_function_config
 * @param {number} sensor_function_config.temperature_enable values: (0: disable, 1: enable)
 * @param {number} sensor_function_config.humidity_enable values: (0: disable, 1: enable)
 * @param {number} sensor_function_config.pressure_enable values: (0: disable, 1: enable)
 * @param {number} sensor_function_config.co2_enable values: (0: disable, 1: enable)
 * @example { "sensor_function_config": { "temperature_enable": 1, "humidity_enable": 1, "pressure_enable": 1, "co2_enable": 1 } }
 */
function setSensorFunctionConfig(sensor_function_config) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);

    var data = [];
    var sensor_offset = { temperature_enable: 1, humidity_enable: 2, pressure_enable: 6, co2_enable: 5 };
    for (var key in sensor_offset) {
        if (key in sensor_function_config) {
            if (enable_values.indexOf(sensor_function_config[key]) == -1) {
                throw new Error("sensor_function_config." + key + " must be one of " + enable_values.join(", "));
            }

            data = data.concat([0xff, 0x18, sensor_offset[key], getValue(enable_map, sensor_function_config[key])]);
        }
    }

    return data;
}

/**
 * set CO2 threshold alarm config
 * @param {object} co2_alarm_config
 * @param {number} co2_alarm_config.enable values: (0: disable, 1: enable)
 * @param {number} co2_alarm_config.condition values: (0: disable, 1: below, 2: above, 3: between, 4: outside, 5: mutation)
 * @param {number} co2_alarm_config.threshold_min unit: ppm
 * @param {number} co2_alarm_config.threshold_max unit: ppm
 * @example { "co2_alarm_config": { "enable": 1, "condition": 1, "threshold_max": 1000, "threshold_min": 1000 } }
 */
function setCO2ThresholdAlarmConfig(co2_alarm_config) {
    var enable = co2_alarm_config.enable;
    var condition = co2_alarm_config.condition;
    var threshold_max = co2_alarm_config.threshold_max;
    var threshold_min = co2_alarm_config.threshold_min;

    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside", 5: "mutation" };
    var condition_values = getValues(condition_map);
    if (condition_values.indexOf(condition) == -1) {
        throw new Error("co2_alarm_config.condition must be one of " + condition_values.join(", "));
    }
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) == -1) {
        throw new Error("co2_alarm_config.enable must be one of " + enable_values.join(", "));
    }

    var data = 0x00;
    data |= getValue(condition_map, condition) << 0;
    data |= 1 << 3; // co2
    data |= getValue(enable_map, enable) << 6;

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x06);
    buffer.writeUInt8(data);
    buffer.writeUInt16LE(threshold_min);
    buffer.writeUInt16LE(threshold_max);
    buffer.writeUInt32LE(0x00);
    return buffer.toBytes();
}

/**
 * set temperature threshold alarm config
 * @param {object} temperature_alarm_config
 * @param {number} temperature_alarm_config.enable values: (0: disable, 1: enable)
 * @param {number} temperature_alarm_config.condition values: (0: disable, 1: below, 2: above, 3: between, 4: outside)
 * @param {number} temperature_alarm_config.threshold_min unit: °C
 * @param {number} temperature_alarm_config.threshold_max unit: °C
 * @example { "temperature_alarm_config": { "enable": 1, "condition": 1, "threshold_max": 20, "threshold_min": 0 } }
 */
function setTemperatureThresholdAlarmConfig(temperature_alarm_config) {
    var enable = temperature_alarm_config.enable;
    var condition = temperature_alarm_config.condition;
    var threshold_max = temperature_alarm_config.threshold_max;
    var threshold_min = temperature_alarm_config.threshold_min;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) == -1) {
        throw new Error("temperature_alarm_config.enable must be one of " + enable_values.join(", "));
    }
    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside" };
    var condition_values = getValues(condition_map);
    if (condition_values.indexOf(condition) == -1) {
        throw new Error("temperature_alarm_config.condition must be one of " + condition_values.join(", "));
    }

    var data = 0x00;
    data |= getValue(condition_map, condition) << 0;
    data |= 2 << 3; // temperature
    data |= getValue(enable_map, enable) << 6;

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x06);
    buffer.writeUInt8(data);
    buffer.writeInt16LE(threshold_min * 10);
    buffer.writeInt16LE(threshold_max * 10);
    buffer.writeUInt32LE(0x00);
    return buffer.toBytes();
}

/**
 * set temperature mutation alarm config
 * @param {object} temperature_mutation_alarm_config
 * @param {number} temperature_mutation_alarm_config.enable values: (0: disable, 1: enable)
 * @param {number} temperature_mutation_alarm_config.mutation unit: °C
 * @example { "temperature_mutation_alarm_config": { "enable": 1, "mutation": 0 } }
 */
function setTemperatureMutationAlarmConfig(temperature_mutation_alarm_config) {
    var enable = temperature_mutation_alarm_config.enable;
    var mutation = temperature_mutation_alarm_config.mutation;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) == -1) {
        throw new Error("temperature_mutation_alarm_config.enable must be one of " + enable_values.join(", "));
    }

    var data = 0x00;
    data |= 5 << 0; // mutation
    data |= 3 << 3; // temperature
    data |= getValue(enable_map, enable) << 6;

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x06);
    buffer.writeUInt8(data);
    buffer.writeInt16LE(0x00);
    buffer.writeInt16LE(mutation * 10);
    buffer.writeUInt32LE(0x00);
    return buffer.toBytes();
}

/**
 * alarm report counts
 * @since hardware_version v2.0, firmware_version v1.7
 * @param {number} alarm_report_counts
 * @example { "alarm_report_counts": 1000 }
 */
function alarmReportCounts(alarm_report_counts) {
    if (typeof alarm_report_counts !== "number") {
        throw new Error("alarm_report_counts must be a number");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xf2);
    buffer.writeUInt16LE(alarm_report_counts);
    return buffer.toBytes();
}

/**
 * set alarm release enable
 * @since hardware_version v2.0, firmware_version v1.7
 * @param {number} alarm_release_enable values: (0: disable, 1: enable)
 * @example { "alarm_release_enable": 1 }
 */
function setAlarmReleaseEnable(alarm_release_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(alarm_release_enable) == -1) {
        throw new Error("alarm_release_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xf5);
    buffer.writeUInt8(getValue(enable_map, alarm_release_enable));
    return buffer.toBytes();
}

/**
 * d2d master configuration
 * @since hardware_version v2.0, firmware_version v1.7
 * @param {object} d2d_master_config
 * @param {number} d2d_master_config.mode values: (1: threshold_alarm, 2: threshold_alarm_release, 3: mutation_alarm)
 * @param {number} d2d_master_config.enable values: (0: disable, 1: enable)
 * @param {string} d2d_master_config.d2d_cmd
 * @param {number} d2d_master_config.lora_uplink_enable values: (0: disable, 1: enable)
 * @example { "d2d_master_config": [{ "mode": 0, "enable": 1, "d2d_cmd": "0000", "lora_uplink_enable": 1 }] }
 */
function setD2DMasterConfig(d2d_master_config) {
    var mode = d2d_master_config.mode;
    var enable = d2d_master_config.enable;
    var d2d_cmd = d2d_master_config.d2d_cmd;
    var lora_uplink_enable = d2d_master_config.lora_uplink_enable;

    var mode_map = { 1: "threshold_alarm", 2: "threshold_alarm_release", 3: "mutation_alarm" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(mode) === -1) {
        throw new Error("d2d_master_config._item.mode must be one of " + mode_values.join(", "));
    }
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("d2d_master_config._item.enable must be one of " + enable_values.join(", "));
    }
    if (enable_values.indexOf(lora_uplink_enable) === -1) {
        throw new Error("d2d_master_config._item.lora_uplink_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(10);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x96);
    buffer.writeUInt8(getValue(mode_map, mode));
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(getValue(enable_map, lora_uplink_enable));
    buffer.writeD2DCommand(d2d_cmd, "0000");
    buffer.writeUInt16LE(0x00);
    buffer.writeUInt8(0x00);
    return buffer.toBytes();
}

/**
 * set d2d key
 * @since hardware_version v2.0, firmware_version v1.7
 * @param {string} d2d_key
 * @example { "d2d_key": "0000000000000000" }
 */
function setD2DKey(d2d_key) {
    if (typeof d2d_key !== "string") {
        throw new Error("d2d_key must be a string");
    }
    if (d2d_key.length !== 16) {
        throw new Error("d2d_key must be 16 characters");
    }
    if (!/^[0-9A-F]+$/.test(d2d_key)) {
        throw new Error("d2d_key must be hex string [0-9A-F]");
    }

    var data = hexStringToBytes(d2d_key);
    var buffer = new Buffer(10);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x35);
    buffer.writeBytes(data);
    return buffer.toBytes();
}

/**
 * set d2d enable
 * @since hardware_version v2.0, firmware_version v1.7
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
    var enable_map = { 0: "no", 1: "yes" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(clear_history) === -1) {
        throw new Error("clear_history must be one of " + enable_values.join(", "));
    }

    if (getValue(enable_map, clear_history) === 0) {
        return [];
    }
    return [0xff, 0x27, 0x01];
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

function hexStringToBytes(hex) {
    var bytes = [];
    for (var c = 0; c < hex.length; c += 2) {
        bytes.push(parseInt(hex.substr(c, 2), 16));
    }
    return bytes;
}
