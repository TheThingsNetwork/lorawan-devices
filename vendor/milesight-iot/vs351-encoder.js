/**
 * Payload Encoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product VS351
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
    if ("installation_height" in payload) {
        encoded = encoded.concat(setInstallationHeight(payload.installation_height));
    }
    if ("reset_cumulative_enable" in payload) {
        encoded = encoded.concat(setCumulativeResetEnable(payload.reset_cumulative_enable));
    }
    if ("reset_cumulative_schedule_config" in payload) {
        encoded = encoded.concat(setCumulativeResetScheduleConfig(payload.reset_cumulative_schedule_config));
    }
    if ("reset_cumulative_in" in payload) {
        encoded = encoded.concat(resetCumulativeIn(payload.reset_cumulative_in));
    }
    if ("reset_cumulative_out" in payload) {
        encoded = encoded.concat(resetCumulativeOut(payload.reset_cumulative_out));
    }
    if ("report_cumulative_enable" in payload) {
        encoded = encoded.concat(setCumulativeReportEnable(payload.report_cumulative_enable));
    }
    if ("report_temperature_enable" in payload) {
        encoded = encoded.concat(setTemperatureReportEnable(payload.report_temperature_enable));
    }
    if ("temperature_calibration_settings" in payload) {
        encoded = encoded.concat(setTemperatureCalibrationSetting(payload.temperature_calibration_settings));
    }
    if ("detection_direction" in payload) {
        encoded = encoded.concat(setDetectionDirection(payload.detection_direction));
    }
    if ("hibernate_config" in payload) {
        encoded = encoded.concat(setHibernateConfig(payload.hibernate_config));
    }
    if ("people_period_alarm_config" in payload) {
        encoded = encoded.concat(setPeoplePeriodAlarmSettings(payload.people_period_alarm_config));
    }
    if ("people_cumulative_alarm_config" in payload) {
        encoded = encoded.concat(setPeopleCumulativeAlarmSettings(payload.people_cumulative_alarm_config));
    }
    if ("temperature_alarm_config" in payload) {
        encoded = encoded.concat(setTemperatureAlarmSettings(payload.temperature_alarm_config));
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
    if ("d2d_key" in payload) {
        encoded = encoded.concat(setD2DKey(payload.d2d_key));
    }
    if ("d2d_enable" in payload) {
        encoded = encoded.concat(setD2DEnable(payload.d2d_enable));
    }
    if ("d2d_master_config" in payload) {
        for (var i = 0; i < payload.d2d_master_config.length; i++) {
            encoded = encoded.concat(setD2DMasterConfig(payload.d2d_master_config[i]));
        }
    }
    if ("confirm_mode_enable" in payload) {
        encoded = encoded.concat(setConfirmMode(payload.confirm_mode_enable));
    }
    if ("lora_channel_mask_config" in payload) {
        for (var i = 0; i < payload.lora_channel_mask_config.length; i++) {
            encoded = encoded.concat(setLoRaChannelMaskConfig(payload.lora_channel_mask_config[i]));
        }
    }
    if ("adr_enable" in payload) {
        encoded = encoded.concat(setADREnable(payload.adr_enable));
    }
    if ("lora_port" in payload) {
        encoded = encoded.concat(setLoRaPort(payload.lora_port));
    }
    if ("rejoin_config" in payload) {
        encoded = encoded.concat(setRejoinConfig(payload.rejoin_config));
    }
    if ("data_rate" in payload) {
        encoded = encoded.concat(setDataRate(payload.data_rate));
    }
    if ("tx_power_level" in payload) {
        encoded = encoded.concat(setTxPowerLevel(payload.tx_power_level));
    }
    if ("lorawan_version" in payload) {
        encoded = encoded.concat(setLoRaWANVersion(payload.lorawan_version));
    }
    if ("rx2_data_rate" in payload) {
        encoded = encoded.concat(setRx2DataRate(payload.rx2_data_rate));
    }
    if ("rx2_frequency" in payload) {
        encoded = encoded.concat(setRx2Frequency(payload.rx2_frequency));
    }
    if ("lora_join_mode" in payload) {
        encoded = encoded.concat(setLoRaJoinMode(payload.lora_join_mode));
    }
    if ("history_enable" in payload) {
        encoded = encoded.concat(setHistoryEnable(payload.history_enable));
    }
    if ("fetch_history" in payload) {
        encoded = encoded.concat(fetchHistory(payload.fetch_history));
    }
    if ("stop_transmit" in payload) {
        encoded = encoded.concat(stopTransmit(payload.stop_transmit));
    }
    if ("clear_history" in payload) {
        encoded = encoded.concat(clearHistory(payload.clear_history));
    }
    if ("report_type" in payload) {
        encoded = encoded.concat(setReportType(payload.report_type));
    }
    if ("installation_scene" in payload) {
        encoded = encoded.concat(setInstallationScene(payload.installation_scene));
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
 * @param {number} report_interval unit: minute, range: [1, 1440]
 * @example { "report_interval": 20 }
 */
function setReportInterval(report_interval) {
    if (report_interval < 1 || report_interval > 1440) {
        throw new Error("report_interval must be between 1 and 1440");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x8e);
    buffer.writeUInt8(0x00);
    buffer.writeUInt16LE(report_interval);
    return buffer.toBytes();
}

/**
 * set install height
 * @param {number} installation_height unit: mm, range: [2000, 3500]
 * @example { "installation_height": 2700 }
 */
function setInstallationHeight(installation_height) {
    if (installation_height < 2000 || installation_height > 3500) {
        throw new Error("installation_height must be between 2000 and 3500");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x77);
    buffer.writeUInt16LE(installation_height);
    return buffer.toBytes();
}

/**
 * set reset cumulative enable
 * @param {number} reset_cumulative_enable values: (0: disable, 1: enable)
 * @example { "reset_cumulative_enable": 1 }
 */
function setCumulativeResetEnable(reset_cumulative_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(reset_cumulative_enable) === -1) {
        throw new Error("reset_cumulative_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xa6);
    buffer.writeUInt8(getValue(enable_map, reset_cumulative_enable));
    return buffer.toBytes();
}

/**
 * set cumulative reset config
 * @param {object} reset_cumulative_schedule_config
 * @param {number} reset_cumulative_schedule_config.weekday values: (0: everyday, 1: sunday, 2: monday, 3: tuesday, 4: wednesday, 5: thursday, 6: friday, 7: saturday)
 * @param {number} reset_cumulative_schedule_config.hour values: (0-23)
 * @param {number} reset_cumulative_schedule_config.minute values: (0-59)
 * @example { "reset_cumulative_schedule_config": { "weekday": 0, "hour": 0, "minute": 0 } }
 */
function setCumulativeResetScheduleConfig(reset_cumulative_schedule_config) {
    var weekday = reset_cumulative_schedule_config.weekday;
    var hour = reset_cumulative_schedule_config.hour;
    var minute = reset_cumulative_schedule_config.minute;

    var weekday_map = { 0: "everyday", 1: "sunday", 2: "monday", 3: "tuesday", 4: "wednesday", 5: "thursday", 6: "friday", 7: "saturday" };
    var weekday_values = getValues(weekday_map);
    if (weekday_values.indexOf(weekday) === -1) {
        throw new Error("reset_cumulative_schedule_config.weekday must be one of " + weekday_values.join(", "));
    }
    if (typeof hour !== "number" || hour < 0 || hour > 23) {
        throw new Error("reset_cumulative_schedule_config.hour must be a number in range [0, 23]");
    }
    if (typeof minute !== "number" || minute < 0 || minute > 59) {
        throw new Error("reset_cumulative_schedule_config.minute must be a number in range [0, 59]");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xed);
    buffer.writeUInt8(getValue(weekday_map, weekday));
    buffer.writeUInt8(hour);
    buffer.writeUInt8(minute);
    return buffer.toBytes();
}

/**
 * set reset cumulative in
 * @param {number} reset_cumulative_in values: (0: no, 1: yes)
 * @example { "reset_cumulative_in": 1 }
 */
function resetCumulativeIn(reset_cumulative_in) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(reset_cumulative_in) === -1) {
        throw new Error("reset_cumulative_in must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, reset_cumulative_in) === 0) {
        return [];
    }
    return [0xff, 0xa8, 0x01];
}

/**
 * set reset cumulative out
 * @param {number} reset_cumulative_out values: (0: no, 1: yes)
 * @example { "reset_cumulative_out": 1 }
 */
function resetCumulativeOut(reset_cumulative_out) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(reset_cumulative_out) === -1) {
        throw new Error("reset_cumulative_out must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, reset_cumulative_out) === 0) {
        return [];
    }
    return [0xff, 0xa8, 0x02];
}

/**
 * set cumulative report enable
 * @param {number} report_cumulative_enable values: (0: disable, 1: enable)
 * @example { "report_cumulative_enable": 1 }
 */
function setCumulativeReportEnable(report_cumulative_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(report_cumulative_enable) === -1) {
        throw new Error("report_cumulative_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xa9);
    buffer.writeUInt8(getValue(enable_map, report_cumulative_enable));
    return buffer.toBytes();
}

/**
 * set temperature report enable
 * @param {number} report_temperature_enable values: (0: disable, 1: enable)
 * @example { "report_temperature_enable": 1 }
 */
function setTemperatureReportEnable(report_temperature_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(report_temperature_enable) === -1) {
        throw new Error("report_temperature_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xaa);
    buffer.writeUInt8(getValue(enable_map, report_temperature_enable));
    return buffer.toBytes();
}

/**
 * set temperature calibration setting
 * @param {object} temperature_calibration_settings
 * @param {number} temperature_calibration_settings.enable values: (0: disable, 1: enable)
 * @param {number} temperature_calibration_settings.calibration_value unit: °C, range: [-100, 100]
 * @example { "temperature_calibration_settings": { "enable": 1, "calibration_value": 0 } }
 */
function setTemperatureCalibrationSetting(temperature_calibration_settings) {
    var enable = temperature_calibration_settings.enable;
    var calibration_value = temperature_calibration_settings.calibration_value;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("temperature_calibration_settings.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xab);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeInt16LE(calibration_value * 10);
    return buffer.toBytes();
}

/**
 * set detection direction
 * @param {number} detection_direction values: (0: forward, 1: reverse)
 * @example { "detection_direction": 1 }
 */
function setDetectionDirection(detection_direction) {
    var direction_map = { 0: "forward", 1: "reverse" };
    var direction_values = getValues(direction_map);
    if (direction_values.indexOf(detection_direction) === -1) {
        throw new Error("detection_direction must be one of " + direction_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xec);
    buffer.writeUInt8(getValue(direction_map, detection_direction));
    return buffer.toBytes();
}

/**
 * set hibernate config
 * @param {object} hibernate_config
 * @param {number} hibernate_config.enable values: (0: "enable", 1: "disable")
 * @param {number} hibernate_config.start_time unit: minute. range: [0, 1439] (4:00 -> 240, 4:30 -> 270)
 * @param {number} hibernate_config.end_time unit: minute. range: [0, 1439] (start_time < end_time: one day, start_time > end_time: across the day, start_time == end_time: whole day)
 * @example { "hibernate_config": { "enable": 1, "start_time": 240, "end_time": 270 } }
 */
function setHibernateConfig(hibernate_config) {
    var enable = hibernate_config.enable;
    var start_time = hibernate_config.start_time;
    var end_time = hibernate_config.end_time;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("hibernate_config.enable must be one of " + enable_values.join(", "));
    }
    if (start_time < 0 || start_time > 1439) {
        throw new Error("hibernate_config.start_time must be between 0 and 1439");
    }
    if (end_time < 0 || end_time > 1439) {
        throw new Error("hibernate_config.end_time must be between 0 and 1439");
    }

    var buffer = new Buffer(8);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x75);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt16LE(start_time);
    buffer.writeUInt16LE(end_time);
    buffer.writeUInt8(0xff);
    return buffer.toBytes();
}

/**
 * set people period alarm settings
 * @param {object} people_period_alarm_config
 * @param {number} people_period_alarm_config.condition values: (0: disable, 1: below, 2: above, 3: between, 4: outside)
 * @param {number} people_period_alarm_config.threshold_out range: [1, 65535]
 * @param {number} people_period_alarm_config.threshold_in range: [1, 65535]
 * @example { "people_period_alarm_config": { "condition": 3, "threshold_out": 20, "threshold_in": 25 } }
 */
function setPeoplePeriodAlarmSettings(people_period_alarm_config) {
    var condition = people_period_alarm_config.condition;
    var threshold_out = people_period_alarm_config.threshold_out;
    var threshold_in = people_period_alarm_config.threshold_in;

    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside" };
    var condition_values = getValues(condition_map);
    if (condition_values.indexOf(condition) === -1) {
        throw new Error("people_period_alarm_config.condition must be one of " + condition_values.join(", "));
    }

    var data = 0x00;
    data |= getValue(condition_map, condition) << 0;
    data |= 1 << 3; // 1: period
    data |= 1 << 6; // enable

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x06);
    buffer.writeUInt8(data);
    buffer.writeUInt16LE(threshold_out);
    buffer.writeUInt16LE(threshold_in);
    buffer.writeUInt16LE(0x00);
    buffer.writeUInt16LE(0x00);
    return buffer.toBytes();
}

/**
 * set people cumulative alarm settings
 * @param {object} people_cumulative_alarm_config
 * @param {number} people_cumulative_alarm_config.condition values: (0: disable, 1: below, 2: above, 3: between, 4: outside)
 * @param {number} people_cumulative_alarm_config.threshold_out range: [1, 65535]
 * @param {number} people_cumulative_alarm_config.threshold_in range: [1, 65535]
 * @example { "people_cumulative_alarm_config": { "condition": 3, "threshold_out": 20, "threshold_in": 25 } }
 */
function setPeopleCumulativeAlarmSettings(people_cumulative_alarm_config) {
    var condition = people_cumulative_alarm_config.condition;
    var threshold_out = people_cumulative_alarm_config.threshold_out;
    var threshold_in = people_cumulative_alarm_config.threshold_in;

    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside" };
    var condition_values = getValues(condition_map);
    if (condition_values.indexOf(condition) === -1) {
        throw new Error("people_cumulative_alarm_config.condition must be one of " + condition_values.join(", "));
    }

    var data = 0x00;
    data |= getValue(condition_map, condition) << 0;
    data |= 2 << 3; // 2: cumulative
    data |= 1 << 6; // enable

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x06);
    buffer.writeUInt8(data);
    buffer.writeUInt16LE(threshold_out);
    buffer.writeUInt16LE(threshold_in);
    buffer.writeUInt16LE(0x00);
    buffer.writeUInt16LE(0x00);
    return buffer.toBytes();
}

/**
 * set temperature alarm settings
 * @param {object} temperature_alarm_config
 * @param {number} temperature_alarm_config.condition values: (0: disable, 1: below, 2: above, 3: between, 4: outside)
 * @param {number} temperature_alarm_config.threshold_min unit: °C
 * @param {number} temperature_alarm_config.threshold_max unit: °C
 * @example { "temperature_alarm_config": { "condition": 3, "threshold_min": 20, "threshold_max": 25 } }
 */
function setTemperatureAlarmSettings(temperature_alarm_config) {
    var condition = temperature_alarm_config.condition;
    var threshold_min = temperature_alarm_config.threshold_min;
    var threshold_max = temperature_alarm_config.threshold_max;

    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside" };
    var condition_values = getValues(condition_map);
    if (condition_values.indexOf(condition) === -1) {
        throw new Error("temperature_alarm_config.condition must be one of " + condition_values.join(", "));
    }

    var data = 0x00;
    data |= getValue(condition_map, condition) << 0;
    data |= 3 << 3; // 3: temperature
    data |= 1 << 6; // enable

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x06);
    buffer.writeUInt8(data);
    buffer.writeUInt16LE(threshold_min * 10);
    buffer.writeUInt16LE(threshold_max * 10);
    buffer.writeUInt16LE(0x00);
    buffer.writeUInt16LE(0x00);
    return buffer.toBytes();
}

/**
 * set retransmit enable
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
 * set retransmit interval
 * @param {number} retransmit_interval unit: second, range: [1, 64800]
 * @example { "retransmit_interval": 600 }
 */
function setRetransmitInterval(retransmit_interval) {
    if (typeof retransmit_interval !== "number") {
        throw new Error("retransmit_interval must be a number");
    }
    if (retransmit_interval < 1 || retransmit_interval > 64800) {
        throw new Error("retransmit_interval must be between 1 and 64800");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x6a);
    buffer.writeUInt8(0x00);
    buffer.writeUInt16LE(retransmit_interval);
    return buffer.toBytes();
}

/**
 * set resend interval
 * @param {number} resend_interval unit: second, range: [1, 64800]
 * @example { "resend_interval": 600 }
 */
function setResendInterval(resend_interval) {
    if (typeof resend_interval !== "number") {
        throw new Error("resend_interval must be a number");
    }
    if (resend_interval < 1 || resend_interval > 64800) {
        throw new Error("resend_interval must be between 1 and 64800");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x6a);
    buffer.writeUInt8(0x01);
    buffer.writeUInt16LE(resend_interval);
    return buffer.toBytes();
}

/**
 * set d2d key
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
 * d2d master configuration
 * @param {object} d2d_master_config
 * @param {number} d2d_master_config.mode values: (1: someone enter, 2: someone leave, 3: counting threshold alarm, 4: temperature alarm, 5: temperature alarm release)
 * @param {number} d2d_master_config.enable values: (0: disable, 1: enable)
 * @param {string} d2d_master_config.d2d_cmd
 * @param {number} d2d_master_config.lora_uplink_enable values: (0: disable, 1: enable)
 * @param {number} d2d_master_config.time_enable values: (0: disable, 1: enable)
 * @param {number} d2d_master_config.time unit: minute
 * @example { "d2d_master_config": [{ "mode": 0, "enable": 1, "d2d_cmd": "0000", "lora_uplink_enable": 1, "time_enable": 1, "time": 10 }] }
 */
function setD2DMasterConfig(d2d_master_config) {
    var mode = d2d_master_config.mode;
    var enable = d2d_master_config.enable;
    var d2d_cmd = d2d_master_config.d2d_cmd;
    var lora_uplink_enable = d2d_master_config.lora_uplink_enable;
    var time_enable = d2d_master_config.time_enable;
    var time = d2d_master_config.time;

    var mode_map = { 1: "someone enter", 2: "someone leave", 3: "counting threshold alarm", 4: "temperature alarm", 5: "temperature alarm release" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(mode) === -1) {
        throw new Error("d2d_master_config._item.mode must be one of " + mode_values.join(", "));
    }
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("d2d_master_config._item.enable must be one of " + enable_values.join(", "));
    }
    if ("enable" in d2d_master_config && enable_values.indexOf(lora_uplink_enable) === -1) {
        throw new Error("d2d_master_config._item.lora_uplink_enable must be one of " + enable_values.join(", "));
    }
    if ("enable" in d2d_master_config && enable_values.indexOf(time_enable) === -1) {
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
 * confirm mode
 * @since v1.5
 * @param {number} confirm_mode_enable values: (0: disable, 1: enable)
 * @example { "confirm_mode_enable": 1 }
 */
function setConfirmMode(confirm_mode_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(confirm_mode_enable) === -1) {
        throw new Error("confirm_mode must be in " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x04);
    buffer.writeUInt8(getValue(enable_map, confirm_mode_enable));
    return buffer.toBytes();
}

/**
 * LoRa channel mask config
 * @since v1.5
 * @param {object} lora_channel_mask_config
 * @param {number} lora_channel_mask_config.id range: [1, 16]
 * @param {number} lora_channel_mask_config.mask
 * @example { "lora_channel_mask_config": { "id": 1, "mask": 255 } }
 */
function setLoRaChannelMaskConfig(lora_channel_mask_config) {
    var id = lora_channel_mask_config.id;
    var mask = lora_channel_mask_config.mask;

    if (id < 1 || id > 16) {
        throw new Error("lora_channel_mask_config._item.id must be between 1 and 16");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x05);
    buffer.writeUInt8(id);
    buffer.writeUInt16LE(mask);
    return buffer.toBytes();
}

/**
 * set ADR
 * @since v1.5
 * @param {number} adr_enable values: (0: disable, 1: enable)
 * @example { "adr_enable": 1 }
 */
function setADREnable(adr_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(adr_enable) === -1) {
        throw new Error("adr_enable must be in " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x40);
    buffer.writeUInt8(getValue(enable_map, adr_enable));
    return buffer.toBytes();
}

/**
 * LoRa port
 * @since v1.5
 * @param {number} lora_port range: [1, 223]
 * @example { "lora_port": 1 }
 */
function setLoRaPort(lora_port) {
    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x41);
    buffer.writeUInt8(lora_port);
    return buffer.toBytes();
}

/**
 * rejoin config
 * @since v1.5
 * @param {object} rejoin_config
 * @param {number} rejoin_config.enable values: (0: disable, 1: enable)
 * @param {number} rejoin_config.max_count
 * @example { "rejoin_config": { "enable": 1, "max_count": 10 } }
 */
function setRejoinConfig(rejoin_config) {
    var enable = rejoin_config.enable;
    var max_count = rejoin_config.max_count;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x85);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(max_count);
    return buffer.toBytes();
}

/**
 * set data rate
 * @since v1.5
 * @param {number} data_rate
 * @example { "data_rate": 0 }
 */
function setDataRate(data_rate) {
    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x86);
    buffer.writeUInt8(data_rate);
    return buffer.toBytes();
}

/**
 * tx power
 * @since v1.5
 * @param {number} tx_power_level
 *  EU868, values: (0:-16dBm, 1:-14dBm, 2:-12dBm, 3:-10dBm, 4:-8dBm, 5:-6dBm, 6:-4dBm, 7:-2dBm)
 *  IN865, values: (0:-22dBm, 1:-22dBm, 2:-22dBm, 3:-22dBm, 4:-22dBm, 5:-20dBm, 6:-18dBm, 7:-16dBm, 8:-14dBm, 9:-12dBm, 10:-10dBm)
 *  RU864, values: (0:-16dBm, 1:-14dBm, 2:-12dBm, 3:-10dBm, 4:-8dBm, 5:-6dBm, 6:-4dBm, 7:-2dBm)
 *  AU915, values: (0:-22dBm, 1:-22dBm, 2:-22dBm, 3:-22dBm, 4:-22dBm, 5:-20dBm, 6:-18dBm, 7:-16dBm, 8:-14dBm, 9:-12dBm, 10:-10dBm, 11:-8dBm, 12:-6dBm, 13:-4dBm, 14:-2dBm)
 *  KR920, values: (0:-14dBm, 1:-12dBm, 2:-10dBm, 3:-8dBm, 4:-6dBm, 5:-4dBm, 6:-2dBm, 7:0dBm)
 *  AS923, values: (0:-16dBm, 1:-14dBm, 2:-12dBm, 3:-10dBm, 4:-8dBm, 5:-6dBm, 6:-4dBm, 7:-2dBm)
 *  US915, values: (0:-22dBm, 1:-22dBm, 2:-22dBm, 3:-22dBm, 4:-22dBm, 5:-20dBm, 6:-18dBm, 7:-16dBm, 8:-14dBm, 9:-12dBm, 10:-10dBm, 11:-8dBm, 12:-6dBm, 13:-4dBm, 14:-2dBm)
 *  CN470, values: (0:-19.15dBm, 1:-17.15dBm, 2:-15.15dBm, 3:-13.15dBm, 4:-11.15dBm, 5:-9.15dBm, 6:-7.15dBm, 7:-5.15dBm)
 * @example { "tx_power_level": 0 }
 */
function setTxPowerLevel(tx_power_level) {
    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x87);
    buffer.writeUInt8(tx_power_level);
    return buffer.toBytes();
}

/**
 * LoRaWAN version
 * @since v1.5
 * @param {number} lorawan_version values: (1: v1.0.2, 2: v1.0.3)
 * @example { "lorawan_version": 1 }
 */
function setLoRaWANVersion(lorawan_version) {
    var version_map = { 1: "v1.0.2", 2: "v1.0.3" };
    var version_values = getValues(version_map);
    if (version_values.indexOf(lorawan_version) === -1) {
        throw new Error("lorawan_version must be one of " + version_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x8b);
    buffer.writeUInt8(getValue(version_map, lorawan_version));
    return buffer.toBytes();
}

/**
 * set RX2 data rate
 * @since v1.5
 * @param {number} rx2_data_rate
 * @example { "rx2_data_rate": 0 }
 */
function setRx2DataRate(rx2_data_rate) {
    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x8c);
    buffer.writeUInt8(rx2_data_rate);
    return buffer.toBytes();
}

/**
 * set RX2 frequency
 * @since v1.5
 * @param {number} rx2_frequency
 * @example { "rx2_frequency": 923500000 }
 */
function setRx2Frequency(rx2_frequency) {
    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x8d);
    buffer.writeUInt32LE(rx2_frequency);
    return buffer.toBytes();
}

/**
 * set LoRa join mode
 * @since v1.5
 * @param {number} lora_join_mode values: (0: ABP, 1: OTAA)
 * @example { "lora_join_mode": 0 }
 */
function setLoRaJoinMode(lora_join_mode) {
    var mode_map = { 0: "ABP", 1: "OTAA" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(lora_join_mode) === -1) {
        throw new Error("lora_join_mode must be one of " + mode_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0xa3);
    buffer.writeUInt8(getValue(mode_map, lora_join_mode));
    return buffer.toBytes();
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
 * @param {number} fetch_history.start_time unit: second
 * @param {number} fetch_history.end_time unit: second
 * @example { "fetch_history": { "start_time": 1609459200, "end_time": 1609545600 } }
 */
function fetchHistory(fetch_history) {
    var start_time = fetch_history.start_time;
    var end_time = fetch_history.end_time;

    if (typeof start_time !== "number") {
        throw new Error("start_time must be a number");
    }
    if ("end_time" in fetch_history && typeof end_time !== "number") {
        throw new Error("end_time must be a number");
    }
    if ("end_time" in fetch_history && start_time > end_time) {
        throw new Error("start_time must be less than end_time");
    }

    var buffer;
    if ("end_time" in fetch_history || end_time === 0) {
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
 * history stop transmit
 * @param {number} stop_transmit values: (0: no, 1: yes)
 * @example { "stop_transmit": 1 }
 */
function stopTransmit(stop_transmit) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(stop_transmit) === -1) {
        throw new Error("stop_transmit must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, stop_transmit) === 0) {
        return [];
    }
    return [0xfd, 0x6d, 0xff];
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
 * set report type
 * @param {number} report_type values: (0: period, 1: immediately)
 * @example { "report_type": 0 }
 */
function setReportType(report_type) {
    var report_type_map = { 0: "period", 1: "immediately" };
    var report_type_values = getValues(report_type_map);
    if (report_type_values.indexOf(report_type) === -1) {
        throw new Error("report_type must be one of " + report_type_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x10);
    buffer.writeUInt8(getValue(report_type_map, report_type));
    return buffer.toBytes();
}

/**
 * set installation scene
 * @param {number} installation_scene values: (0: no_door_access, 1: door_controlled_access)
 * @example { "installation_scene": 0 }
 */
function setInstallationScene(installation_scene) {
    var scene_map = { 0: "no_door_access", 1: "door_controlled_access" };
    var scene_values = getValues(scene_map);
    if (scene_values.indexOf(installation_scene) === -1) {
        throw new Error("installation_scene must be one of " + scene_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0xa2);
    buffer.writeUInt8(getValue(scene_map, installation_scene));
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
