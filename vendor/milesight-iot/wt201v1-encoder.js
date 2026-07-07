/**
 * Payload Encoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product WT201
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
    var encoded = milesightDeviceEncode(obj);
    return encoded;
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
    if ("dst_config" in payload) {
        encoded = encoded.concat(setDaylightSavingTime(payload.dst_config));
    }
    if ("temperature_control_mode" in payload) {
        if ("target_temperature" in payload) {
            if ("temperature_unit" in payload) {
                encoded = encoded.concat(setTemperatureControl(payload.temperature_control_mode, payload.target_temperature, payload.temperature_unit));
            } else {
                encoded = encoded.concat(setTemperatureTarget(payload.temperature_control_mode, payload.target_temperature));
            }
        } else {
            encoded = encoded.concat(setTemperatureControlMode(payload.temperature_control_mode));
        }
    }
    if ("temperature_control_enable" in payload) {
        encoded = encoded.concat(setTemperatureControlEnable(payload.temperature_control_enable));
    }
    if ("temperature_calibration_settings" in payload) {
        encoded = encoded.concat(setTemperatureCalibration(payload.temperature_calibration_settings));
    }
    if ("humidity_calibration_settings" in payload) {
        encoded = encoded.concat(setHumidityCalibration(payload.humidity_calibration_settings));
    }
    if ("temperature_tolerance" in payload) {
        encoded = encoded.concat(setTemperatureTolerance(payload.temperature_tolerance));
    }
    if ("temperature_level_up_condition" in payload) {
        encoded = encoded.concat(setTemperatureLevelUpCondition(payload.temperature_level_up_condition));
    }
    if ("outside_temperature_control" in payload) {
        encoded = encoded.concat(setOutsideTemperatureControl(payload.outside_temperature_control));
    }
    if ("outside_temperature" in payload) {
        encoded = encoded.concat(setOutsideTemperature(payload.outside_temperature));
    }
    if ("freeze_protection_config" in payload) {
        encoded = encoded.concat(setFreezeProtection(payload.freeze_protection_config));
    }
    if ("fan_mode" in payload) {
        encoded = encoded.concat(setFanMode(payload.fan_mode));
    }
    if ("fan_delay_enable" in payload) {
        encoded = encoded.concat(setFanModeWithDelay(payload.fan_delay_enable, payload.fan_delay_time));
    }
    if ("fan_execute_time" in payload) {
        encoded = encoded.concat(setFanExecuteTime(payload.fan_execute_time));
    }
    if ("humidity_range" in payload) {
        encoded = encoded.concat(setHumidityRange(payload.humidity_range));
    }
    if ("temperature_dehumidify" in payload) {
        encoded = encoded.concat(setTemperatureDehumidify(payload.temperature_dehumidify));
    }
    if ("fan_dehumidify" in payload) {
        encoded = encoded.concat(setFanDehumidify(payload.fan_dehumidify));
    }
    if ("plan_type" in payload) {
        encoded = encoded.concat(setPlanType(payload.plan_type));
    }
    if ("plan_schedule" in payload) {
        for (var plan_schedule_index = 0; plan_schedule_index < payload.plan_schedule.length; plan_schedule_index++) {
            var schedule = payload.plan_schedule[plan_schedule_index];
            encoded = encoded.concat(setPlanSchedule(schedule));
        }
    }
    if ("plan_config" in payload && "temperature_unit" in payload) {
        for (var plan_config_index = 0; plan_config_index < payload.plan_config.length; plan_config_index++) {
            var config = payload.plan_config[plan_config_index];
            encoded = encoded.concat(setPlanConfig(config, payload.temperature_unit));
        }
    }
    if ("card_config" in payload) {
        encoded = encoded.concat(setCardConfig(payload.card_config));
    }
    if ("child_lock_config" in payload) {
        encoded = encoded.concat(setChildLock(payload.child_lock_config));
    }
    if ("ob_mode" in payload) {
        if ("wires" in payload) {
            encoded = encoded.concat(setWires(payload.wires, payload.ob_mode));
        } else {
            encoded = encoded.concat(setOBMode(payload.ob_mode));
        }
    }
    if ("multicast_group_config" in payload) {
        encoded = encoded.concat(setMulticastGroupConfig(payload.multicast_group_config));
    }
    if ("d2d_master_enable" in payload || "d2d_slave_enable" in payload) {
        encoded = encoded.concat(setD2DEnable(payload.d2d_master_enable, payload.d2d_slave_enable));
    }
    if ("d2d_master_config" in payload) {
        for (var d2d_master_config_index = 0; d2d_master_config_index < payload.d2d_master_config.length; d2d_master_config_index++) {
            var d2d_master_config = payload.d2d_master_config[d2d_master_config_index];
            encoded = encoded.concat(setD2DMasterConfig(d2d_master_config));
        }
    }
    if ("d2d_slave_config" in payload) {
        for (var d2d_slave_config_index = 0; d2d_slave_config_index < payload.d2d_slave_config.length; d2d_slave_config_index++) {
            var d2d_slave_config = payload.d2d_slave_config[d2d_slave_config_index];
            encoded = encoded.concat(setD2DSlaveConfig(d2d_slave_config));
        }
    }
    if ("temperature_alarm_config" in payload) {
        encoded = encoded.concat(setTemperatureAlarmConfig(payload.temperature_alarm_config));
    }
    if ("control_permission" in payload) {
        encoded = encoded.concat(setControlPermission(payload.control_permission));
    }
    if ("offline_control_mode" in payload) {
        encoded = encoded.concat(setOfflineControlMode(payload.offline_control_mode));
    }
    if ("wires_relay_config" in payload) {
        encoded = encoded.concat(setWiresRelayConfig(payload.wires_relay_config));
    }
    if ("screen_display_mode" in payload) {
        encoded = encoded.concat(setScreenDisplayMode(payload.screen_display_mode));
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
    if ("history_enable" in payload) {
        encoded = encoded.concat(setHistoryEnable(payload.history_enable));
    }
    if ("fetch_history" in payload) {
        encoded = encoded.concat(fetchHistory(payload.fetch_history));
    }
    if ("clear_history" in payload) {
        encoded = encoded.concat(clearHistory(payload.clear_history));
    }
    if ("stop_transmit" in payload) {
        encoded = encoded.concat(stopTransmit(payload.stop_transmit));
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
 * report device status
 * @param {number} report_status values: (0: plan, 1: periodic)
 * @example { "report_status": 1 }
 */
function reportStatus(report_status) {
    var report_status_map = { 0: "plan", 1: "periodic" };
    var report_status_values = getValues(report_status_map);
    if (report_status_values.indexOf(report_status) === -1) {
        throw new Error("report_status must be one of " + report_status_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x28);
    buffer.writeUInt8(getValue(report_status_map, report_status));
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
    buffer.writeUInt8(0x00);
    buffer.writeUInt16LE(report_interval);
    return buffer.toBytes();
}

/**
 * set collection interval
 * @param {number} collection_interval unit: second, range: [10, 60]
 * @example { "collection_interval": 300 }
 */
function setCollectionInterval(collection_interval) {
    if (typeof collection_interval !== "number") {
        throw new Error("collection_interval must be a number");
    }
    if (collection_interval < 10 || collection_interval > 60) {
        throw new Error("collection_interval must be in range [10, 60]");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x02);
    buffer.writeUInt16LE(collection_interval);
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
 * set daylight saving time
 * @param {object} dst_config
 * @param {number} dst_config.enable values: (0: disable, 1: enable)
 * @param {number} dst_config.offset, unit: minute
 * @param {number} dst_config.start_month, values: (1: January, 2: February, 3: March, 4: April, 5: May, 6: June, 7: July, 8: August, 9: September, 10: October, 11: November, 12: December)
 * @param {number} dst_config.start_week_num, range: [1, 5]
 * @param {number} dst_config.start_week_day, range: [1, 7]
 * @param {number} dst_config.start_time, unit: minute, convert: "hh:mm" -> "hh * 60 + mm"
 * @param {number} dst_config.end_month, values: (1: January, 2: February, 3: March, 4: April, 5: May, 6: June, 7: July, 8: August, 9: September, 10: October, 11: November, 12: December)
 * @param {number} dst_config.end_week_num, range: [1, 5]
 * @param {number} dst_config.end_week_day, range: [1, 7]
 * @param {number} dst_config.end_time, unit: minute, convert: "hh:mm" -> "hh * 60 + mm"
 * @example { "dst_config": { "enable": 1, "offset": 60, "start_month": 3, "start_week_num": 2, "start_week_day": 7, "start_time": 120, "end_month": 1, "end_week_num": 4, "end_week_day": 1, "end_time": 180 } } output: FFBA013C032778000141B400
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
    var month_values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    var enable_value = getValue(enable_map, enable);
    if (enable_value && month_values.indexOf(start_month) === -1) {
        throw new Error("dst_config.start_month must be one of " + month_values.join(", "));
    }
    if (enable_value && month_values.indexOf(end_month) === -1) {
        throw new Error("dst_config.end_month must be one of " + month_values.join(", "));
    }
    var week_values = [1, 2, 3, 4, 5, 6, 7];
    if (enable_value && week_values.indexOf(start_week_day) === -1) {
        throw new Error("dst_config.start_week_day must be one of " + week_values.join(", "));
    }

    var buffer = new Buffer(12);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xba);
    buffer.writeUInt8(enable_value);
    buffer.writeInt8(offset);
    buffer.writeUInt8(start_month);
    buffer.writeUInt8((start_week_num << 4) | start_week_day);
    buffer.writeUInt16LE(start_time);
    buffer.writeUInt8(end_month);
    buffer.writeUInt8((end_week_num << 4) | end_week_day);
    buffer.writeUInt16LE(end_time);
    return buffer.toBytes();
}

/**
 * set temperature control enable
 * @param {number} enable values: (0: disable, 1: enable)
 * @example { "temperature_control_enable": 1 }
 */
function setTemperatureControlEnable(temperature_control_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(temperature_control_enable) === -1) {
        throw new Error("enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xc5);
    buffer.writeUInt8(getValue(enable_map, temperature_control_enable));
    return buffer.toBytes();
}

/**
 * set temperature control
 * @param {number} temperature_control_mode values: (0: heat, 1: em_heat, 2: cool, 3: auto)
 * @param {number} target_temperature
 * @param {number} temperature_unit values: (0: celsius, 1: fahrenheit)
 * @example { "temperature_control_mode": 2, "target_temperature": 25 , "temperature_unit": 0 }
 * @example { "temperature_control_mode": 2, "target_temperature": 77 , "temperature_unit": 1 }
 */
function setTemperatureControl(temperature_control_mode, target_temperature, temperature_unit) {
    var temperature_control_mode_map = { 0: "heat", 1: "em_heat", 2: "cool", 3: "auto" };
    var temperature_control_mode_values = getValues(temperature_control_mode_map);
    if (temperature_control_mode_values.indexOf(temperature_control_mode) === -1) {
        throw new Error("temperature_control_mode must be one of " + temperature_control_mode_values.join(", "));
    }
    if (typeof target_temperature !== "number") {
        throw new Error("target_temperature must be a number");
    }
    var temperature_unit_map = { 0: "celsius", 1: "fahrenheit" };
    var temperature_unit_values = getValues(temperature_unit_map);
    if (temperature_unit_values.indexOf(temperature_unit) === -1) {
        throw new Error("temperature_unit must be one of " + temperature_unit_values.join(", "));
    }
    var value = getValue(temperature_unit_map, temperature_unit) === 1 ? target_temperature | 0x80 : target_temperature & 0x7f;

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xb7);
    buffer.writeUInt8(getValue(temperature_control_mode_map, temperature_control_mode));
    buffer.writeUInt8(value);
    return buffer.toBytes();
}

/**
 * set temperature calibration
 * @param {object} temperature_calibration_settings
 * @param {number} temperature_calibration_settings.enable values: (0: disable, 1: enable)
 * @param {number} temperature_calibration_settings.calibration_value, unit: celsius
 * @example { "temperature_calibration_settings": { "enable": 1, "temperature": 25 } }
 */
function setTemperatureCalibration(temperature_calibration_settings) {
    var enable = temperature_calibration_settings.enable;
    var calibration_value = temperature_calibration_settings.calibration_value;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("temperature_calibration_settings.enable must be one of " + enable_values.join(", "));
    }
    if (enable && typeof calibration_value !== "number") {
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
 * set humidity calibration
 * @since v1.3
 * @param {object} humidity_calibration_settings
 * @param {number} humidity_calibration_settings.enable values: (0: disable, 1: enable)
 * @param {number} humidity_calibration_settings.calibration_value, unit: %
 * @example { "humidity_calibration_settings": { "enable": 1, "calibration_value": 50 } }
 */
function setHumidityCalibration(humidity_calibration_settings) {
    var enable = humidity_calibration_settings.enable;
    var calibration_value = humidity_calibration_settings.calibration_value;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("humidity_calibration_settings.enable must be one of " + enable_values.join(", "));
    }
    if (enable && typeof calibration_value !== "number") {
        throw new Error("humidity_calibration_settings.calibration_value must be a number");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeInt16LE(calibration_value * 10);
    return buffer.toBytes();
}

/**
 * set temperature tolerance
 * @param {object} temperature_tolerance
 * @param {number} temperature_tolerance.target_temperature_tolerance unit: celsius
 * @param {number} temperature_tolerance.auto_temperature_tolerance unit: celsius
 * @example { "temperature_tolerance": {"target_temperature_tolerance": 1, "auto_temperature_tolerance": 1 }}
 */
function setTemperatureTolerance(temperature_tolerance) {
    var target_temperature_tolerance = temperature_tolerance.target_temperature_tolerance;
    var auto_temperature_tolerance = temperature_tolerance.auto_temperature_tolerance;

    if (typeof target_temperature_tolerance !== "number") {
        throw new Error("temperature_tolerance.target_temperature_tolerance must be a number");
    }
    if (typeof auto_temperature_tolerance !== "number") {
        throw new Error("temperature_tolerance.auto_temperature_tolerance must be a number");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xb8);
    buffer.writeUInt8(target_temperature_tolerance * 10);
    buffer.writeUInt8(auto_temperature_tolerance * 10);
    return buffer.toBytes();
}

/**
 * set temperature level up condition
 * @param {object} temperature_level_up_condition
 * @param {number} temperature_level_up_condition.type values: (0: heat, 1: cool)
 * @param {number} temperature_level_up_condition.time unit: minute
 * @param {number} temperature_level_up_condition.temperature_tolerance unit: celsius
 * @example { "temperature_level_up_condition": { "type": 0, "time": 10, "temperature_tolerance": 1 } }
 */
function setTemperatureLevelUpCondition(temperature_level_up_condition) {
    var type = temperature_level_up_condition.type;
    var time = temperature_level_up_condition.time;
    var temperature_tolerance = temperature_level_up_condition.temperature_tolerance;

    var temperature_level_up_condition_type_map = { 0: "heat", 1: "cool" };
    var temperature_level_up_condition_type_values = getValues(temperature_level_up_condition_type_map);
    if (temperature_level_up_condition_type_values.indexOf(type) === -1) {
        throw new Error("temperature_level_up_condition.type must be one of " + temperature_level_up_condition_type_values.join(", "));
    }
    if (typeof time !== "number") {
        throw new Error("temperature_level_up_condition.time must be a number");
    }
    if (typeof temperature_tolerance !== "number") {
        throw new Error("temperature_level_up_condition.temperature_tolerance must be a number");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xb9);
    buffer.writeUInt8(getValue(temperature_level_up_condition_type_map, type));
    buffer.writeUInt8(time);
    buffer.writeUInt8(temperature_tolerance * 10);
    return buffer.toBytes();
}

/**
 * set temperature control enable
 * @since v1.3
 * @param {number} temperature_control_mode values: (0: heat, 1: em_heat, 2: cool, 3: auto)
 * @param {number} target_temperature unit: celsius
 * @example { "temperature_control_mode": 2, "target_temperature": 25 }
 */
function setTemperatureTarget(temperature_control_mode, target_temperature) {
    var temperature_mode_map = { 0: "heat", 1: "em_heat", 2: "cool", 3: "auto" };
    var temperature_mode_values = getValues(temperature_mode_map);
    if (temperature_mode_values.indexOf(temperature_control_mode) === -1) {
        throw new Error("temperature_control_mode must be one of " + temperature_mode_values.join(", "));
    }
    if (typeof target_temperature !== "number") {
        throw new Error("target_temperature must be a number");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xfa);
    buffer.writeUInt8(getValue(temperature_mode_map, temperature_control_mode));
    buffer.writeInt16LE(target_temperature * 10);
    return buffer.toBytes();
}

/**
 * set temperature control mode
 * @since v1.3
 * @param {number} temperature_control_mode values: (0: heat, 1: em_heat, 2: cool, 3: auto)
 * @example { "temperature_control_mode": 2 }
 */
function setTemperatureControlMode(temperature_control_mode) {
    var temperature_mode_map = { 0: "heat", 1: "em_heat", 2: "cool", 3: "auto" };
    var temperature_mode_values = getValues(temperature_mode_map);
    if (temperature_mode_values.indexOf(temperature_control_mode) === -1) {
        throw new Error("temperature_control_mode must be one of " + temperature_mode_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xfb);
    buffer.writeUInt8(getValue(temperature_mode_map, temperature_control_mode));
    return buffer.toBytes();
}

/**
 * set outside temperature control
 * @param {object} outside_temperature_control
 * @param {number} outside_temperature_control.enable values: (0: disable, 1: enable)
 * @param {number} outside_temperature_control.timeout, unit: minute, range: [3, 60]
 * @example { "outside_temperature_control": { "enable": 1, "timeout": 10 } }
 */
function setOutsideTemperatureControl(outside_temperature_control) {
    var enable = outside_temperature_control.enable;
    var timeout = outside_temperature_control.timeout;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("outside_temperature_control.enable must be one of " + enable_values.join(", "));
    }
    if (enable && typeof timeout !== "number") {
        throw new Error("outside_temperature_control.timeout must be a number");
    }
    if (enable && (timeout < 3 || timeout > 60)) {
        throw new Error("outside_temperature_control.timeout must be in range [3, 60]");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xc4);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(timeout);
    return buffer.toBytes();
}

/**
 * set outside temperature
 * @param {number} outside_temperature, unit: celsius
 * @example { "outside_temperature": 25 }
 */
function setOutsideTemperature(outside_temperature) {
    if (typeof outside_temperature !== "number") {
        throw new Error("outside_temperature must be a number");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0x03);
    buffer.writeInt16LE(outside_temperature * 10);
    buffer.writeUInt8(0x00);
    return buffer.toBytes();
}

/**
 * set humidity range
 * @since v1.3
 * @param {object} humidity_range
 * @param {number} humidity_range.min range: [0, 100]
 * @param {number} humidity_range.max range: [0, 100]
 * @example { "humidity_range": { "min": 20, "max": 80 } }
 */
function setHumidityRange(humidity_range) {
    var min = humidity_range.min;
    var max = humidity_range.max;

    if (typeof min !== "number") {
        throw new Error("humidity_range.min must be a number");
    }
    if (typeof max !== "number") {
        throw new Error("humidity_range.max must be a number");
    }
    if (min < 0 || min > 100) {
        throw new Error("humidity_range.min must be in range [0, 100]");
    }
    if (max < 0 || max > 100) {
        throw new Error("humidity_range.max must be in range [0, 100]");
    }
    if (min > max) {
        throw new Error("humidity_range.min must be less than humidity_range.max");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x09);
    buffer.writeUInt8(min);
    buffer.writeUInt8(max);
    return buffer.toBytes();
}

/**
 * set temperature dehumidify
 * @since v1.3
 * @param {object} temperature_dehumidify
 * @param {number} temperature_dehumidify.enable values: (0: disable, 1: enable)
 * @param {number} temperature_dehumidify.temperature_tolerance unit: celsius, range: [0.1, 5]
 * @example { "temperature_dehumidify": { "enable": 1, "temperature_tolerance": 1 } }
 */
function setTemperatureDehumidify(temperature_dehumidify) {
    var enable = temperature_dehumidify.enable;
    var temperature_tolerance = temperature_dehumidify.temperature_tolerance;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("temperature_dehumidify.enable must be one of " + enable_values.join(", "));
    }
    if (enable) {
        // default value
        if (temperature_tolerance === undefined) {
            temperature_tolerance = 0xff;
        }
        if (typeof temperature_tolerance !== "number") {
            throw new Error("temperature_dehumidify.temperature_tolerance must be a number");
        }
        if (temperature_tolerance !== 0xff && (temperature_tolerance < 0.1 || temperature_tolerance > 5)) {
            throw new Error("temperature_dehumidify.temperature_tolerance must be in range [0.1, 5]");
        }
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x0a);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(temperature_tolerance === 0xff ? temperature_tolerance : temperature_tolerance * 10);
    return buffer.toBytes();
}

/**
 * set fan dehumidify
 * @since v1.3
 * @param {object} fan_dehumidify
 * @param {number} fan_dehumidify.enable values: (0: disable, 1: enable)
 * @param {number} fan_dehumidify.execute_time range: [5, 55], unit: minute
 * @example { "fan_dehumidify": { "enable": 1, "execute_time": 10 } }
 */
function setFanDehumidify(fan_dehumidify) {
    var enable = fan_dehumidify.enable;
    var execute_time = fan_dehumidify.execute_time;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("fan_dehumidify.enable must be one of " + enable_values.join(", "));
    }
    if (getValue(enable_map, enable) && typeof execute_time !== "number") {
        throw new Error("fan_dehumidify.execute_time must be a number");
    }
    if (getValue(enable_map, enable) && (execute_time < 5 || execute_time > 55)) {
        throw new Error("fan_dehumidify.execute_time must be in range [5, 55]");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x07);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(execute_time);
    return buffer.toBytes();
}

/**
 * freeze protection configuration
 * @param {object} freeze_protection_config
 * @param {number} freeze_protection_config.enable values: (0: disable, 1: enable)
 * @param {number} freeze_protection_config.temperature, unit: celsius
 * @example { "freeze_protection_config": { "enable": 1, "temperature": 10 } }
 */
function setFreezeProtection(freeze_protection_config) {
    var enable = freeze_protection_config.enable;
    var temperature = freeze_protection_config.temperature;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("freeze_protection_config.enable must be one of " + enable_values.join(", "));
    }
    if (enable && typeof temperature !== "number") {
        throw new Error("freeze_protection_config.temperature must be a number");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xb0);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeInt16LE(temperature * 10);
    return buffer.toBytes();
}

/**
 * @param {number} fan_mode values: (0: auto, 1: on, 2: circulate)
 * @example { "fan_mode": 0 }
 */
function setFanMode(fan_mode) {
    var fan_mode_map = { 0: "auto", 1: "on", 2: "circulate" };
    var fan_mode_values = getValues(fan_mode_map);
    if (fan_mode_values.indexOf(fan_mode) === -1) {
        throw new Error("fan_mode must be one of " + fan_mode_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xb6);
    buffer.writeUInt8(getValue(fan_mode_map, fan_mode));
    return buffer.toBytes();
}

/**
 * set fan mode with delay
 * @param {number} fan_delay_enable values: (0: disable, 1: enable)
 * @param {number} fan_delay_time unit: minute, range: [5, 55]
 * @example { "fan_delay_enable": 1, "fan_delay_time": 10 }
 */
function setFanModeWithDelay(fan_delay_enable, fan_delay_time) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(fan_delay_enable) === -1) {
        throw new Error("fan_delay_enable must be one of " + enable_values.join(", "));
    }
    if (fan_delay_enable && typeof fan_delay_time !== "number") {
        throw new Error("fan_delay_time must be a number");
    }
    if (fan_delay_enable && (fan_delay_time < 5 || fan_delay_time > 55)) {
        throw new Error("fan_delay_time must be in range [5, 55]");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x05);
    buffer.writeUInt8(getValue(enable_map, fan_delay_enable));
    buffer.writeUInt8(fan_delay_time);
    return buffer.toBytes();
}

/**
 * set fan execute time
 * @since v1.3
 * @param {number} fan_execute_time range: [5,55], unit: minute
 * @example { "fan_execute_time": 10 }
 */
function setFanExecuteTime(fan_execute_time) {
    if (typeof fan_execute_time !== "number") {
        throw new Error("fan_execute_time must be a number");
    }
    if (fan_execute_time < 5 || fan_execute_time > 55) {
        throw new Error("fan_execute_time must be in range [5, 55]");
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x06);
    buffer.writeUInt8(fan_execute_time);
    return buffer.toBytes();
}

/**
 * set plan mode
 * @param {number} plan_type values: (0: wake, 1: away, 2: home, 3: sleep)
 * @example { "plan_type": 0 }
 */
function setPlanType(plan_type) {
    var plan_type_map = { 0: "wake", 1: "away", 2: "home", 3: "sleep" };
    var plan_type_values = getValues(plan_type_map);
    if (plan_type_values.indexOf(plan_type) === -1) {
        throw new Error("plan_type must be one of " + plan_type_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xc2);
    buffer.writeUInt8(getValue(plan_type_map, plan_type));
    return buffer.toBytes();
}

/**
 * set plan schedule
 * @param {object} plan_schedule
 * @param {number} plan_schedule._item.type values: (0: wake, 1: away, 2: home, 3: sleep)
 * @param {number} plan_schedule._item.id range: [1, 16]
 * @param {number} plan_schedule._item.enable values: (0: disable, 1: enable)
 * @param {object} plan_schedule._item.week_recycle
 * @param {number} plan_schedule._item.week_recycle.monday values: (0: disable, 1: enable)
 * @param {number} plan_schedule._item.week_recycle.tuesday values: (0: disable, 1: enable)
 * @param {number} plan_schedule._item.week_recycle.wednesday values: (0: disable, 1: enable)
 * @param {number} plan_schedule._item.week_recycle.thursday values: (0: disable, 1: enable)
 * @param {number} plan_schedule._item.week_recycle.friday values: (0: disable, 1: enable)
 * @param {number} plan_schedule._item.week_recycle.saturday values: (0: disable, 1: enable)
 * @param {number} plan_schedule._item.week_recycle.sunday values: (0: disable, 1: enable)
 * @param {number} plan_schedule._item.time unit: minute, convert: "hh:mm" -> "hh * 60 + mm"
 * @example { "plan_schedule": [{ "type": 0, "id": 0, "enable": 1, "week_recycle": { "monday": 1, "tuesday": 0, "wednesday": 1, "thursday": 0, "friday": 1, "saturday": 0, "sunday": 1 }, "time": 240 }] }
 */
function setPlanSchedule(plan_schedule) {
    var type = plan_schedule.type;
    var id = plan_schedule.id;
    var enable = plan_schedule.enable;
    var week_recycle = plan_schedule.week_recycle;
    var time = plan_schedule.time;

    var plan_schedule_type_map = { 0: "wake", 1: "away", 2: "home", 3: "sleep" };
    var plan_schedule_type_values = getValues(plan_schedule_type_map);
    if (plan_schedule_type_values.indexOf(type) === -1) {
        throw new Error("plan_schedule._item.type must be one of " + plan_schedule_type_values.join(", "));
    }
    if (typeof id !== "number") {
        throw new Error("plan_schedule._item.id must be a number");
    }
    if (id < 1 || id > 16) {
        throw new Error("plan_schedule._item.id must be in range [1, 16]");
    }
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("plan_schedule._item.enable must be one of " + enable_values.join(", "));
    }

    var days = 0x00;
    var week_day_bits_offset = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 7 };
    for (var day in week_recycle) {
        if (enable_values.indexOf(week_recycle[day]) === -1) {
            throw new Error("plan_schedule._item.week_recycle." + day + " must be one of " + enable_values.join(", "));
        }
        days |= getValue(enable_map, week_recycle[day]) << week_day_bits_offset[day];
    }

    var buffer = new Buffer(8);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xc9);
    buffer.writeUInt8(getValue(plan_schedule_type_map, type));
    buffer.writeUInt8(id - 1);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(days);
    buffer.writeUInt16LE(time);
    return buffer.toBytes();
}

/**
 * set plan config
 * @param {object} plan_config
 * @param {number} plan_config._item.type values: (0: wake, 1: away, 2: home, 3: sleep)
 * @param {number} plan_config._item.temperature_control_mode values: (0: heat, 1: em_heat, 2: cool, 3: auto)
 * @param {number} plan_config._item.fan_mode values: (0: auto, 1: on, 2: circulate)
 * @param {number} plan_config._item.target_temperature unit: °C
 * @param {number} plan_config._item.temperature_tolerance unit: °C
 * @param {number} temperature_unit values: (0: celsius, 1: fahrenheit)
 * @example { "plan_config": [{ "type": 0, "temperature_control_mode": 2, "fan_mode": 0, "target_temperature": 20, "temperature_tolerance": 1 }], "temperature_unit": 0}
 * @example { "plan_config": [{ "type": 0, "temperature_control_mode": 2, "fan_mode": 0, "target_temperature": 77, "temperature_tolerance": 1 }], "temperature_unit": 1}
 */
function setPlanConfig(plan_config, temperature_unit) {
    var type = plan_config.type;
    var temperature_control_mode = plan_config.temperature_control_mode;
    var fan_mode = plan_config.fan_mode;
    var target_temperature = plan_config.target_temperature;
    var temperature_tolerance = plan_config.temperature_tolerance;

    var plan_config_type_map = { 0: "wake", 1: "away", 2: "home", 3: "sleep" };
    var plan_config_type_values = getValues(plan_config_type_map);
    if (plan_config_type_values.indexOf(type) === -1) {
        throw new Error("plan_config._item.type must be one of " + plan_config_type_values.join(", "));
    }
    var plan_config_temperature_control_mode_map = { 0: "heat", 1: "em_heat", 2: "cool", 3: "auto" };
    var plan_config_temperature_control_mode_values = getValues(plan_config_temperature_control_mode_map);
    if (plan_config_temperature_control_mode_values.indexOf(temperature_control_mode) === -1) {
        throw new Error("plan_config._item.temperature_control_mode must be one of " + plan_config_temperature_control_mode_values.join(", "));
    }
    var plan_config_fan_mode_map = { 0: "auto", 1: "on", 2: "circulate" };
    var plan_config_fan_mode_values = getValues(plan_config_fan_mode_map);
    if (plan_config_fan_mode_values.indexOf(fan_mode) === -1) {
        throw new Error("plan_config._item.fan_mode must be one of " + plan_config_fan_mode_values.join(", "));
    }
    if (typeof target_temperature !== "number") {
        throw new Error("plan_config._item.target_temperature must be a number");
    }
    if (typeof temperature_tolerance !== "number") {
        throw new Error("plan_config._item.temperature_tolerance must be a number");
    }
    var temperature_unit_map = { 0: "celsius", 1: "fahrenheit" };
    var temperature_unit_values = getValues(temperature_unit_map);
    if (temperature_unit_values.indexOf(temperature_unit) === -1) {
        throw new Error("temperature_unit must be one of " + temperature_unit_values.join(", "));
    }

    var buffer = new Buffer(7);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xc8);
    buffer.writeUInt8(getValue(plan_config_type_map, type));
    buffer.writeUInt8(getValue(plan_config_temperature_control_mode_map, temperature_control_mode));
    buffer.writeUInt8(getValue(plan_config_fan_mode_map, fan_mode));
    var tmp = getValue(temperature_unit_map, temperature_unit) === 1 ? target_temperature | 0x80 : target_temperature & 0x7f;
    buffer.writeInt8(tmp);
    buffer.writeInt8(temperature_tolerance * 10);
    return buffer.toBytes();
}

/**
 * set card config
 * @param {object} card_config
 * @param {number} card_config.enable values: (0: disable, 1: enable)
 * @param {number} card_config.action_type values: (0: power, 1: plan)
 * @param {number} card_config.in_plan_type values: (0: wake, 1: away, 2: home, 3: sleep)
 * @param {number} card_config.out_plan_type values: (0: wake, 1: away, 2: home, 3: sleep)
 * @param {number} card_config.invert values: (0: no, 1: yes)
 * @example { "card_config": { "enable": 0 } }
 * @example { "card_config": { "enable": 1, "action_type": 0, "invert": 1 } }
 * @example { "card_config": { "enable": 1, "action_type": 1, "in_plan_type": 0, "out_plan_type": 1, "invert": 0 } }
 */
function setCardConfig(card_config) {
    var enable = card_config.enable;
    var action_type = card_config.action_type;
    var in_plan_type = card_config.in_plan_type;
    var out_plan_type = card_config.out_plan_type;
    var invert = card_config.invert;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("card_config.enable must be one of " + enable_values.join(", "));
    }
    var card_config_action_type_map = { 0: "power", 1: "plan" };
    var card_config_action_type_values = getValues(card_config_action_type_map);
    if (getValue(enable_map, enable) && card_config_action_type_values.indexOf(action_type) === -1) {
        throw new Error("card_config.action_type must be one of " + card_config_action_type_values.join(", "));
    }

    var action = 0x00;
    // PLAN MODE
    if (getValue(card_config_action_type_map, action_type) === 1) {
        var card_config_plan_type_map = { 0: "wake", 1: "away", 2: "home", 3: "sleep" };
        var card_config_plan_type_values = getValues(card_config_plan_type_map);
        if (card_config_plan_type_values.indexOf(in_plan_type) === -1) {
            throw new Error("card_config.in_plan_type must be one of " + card_config_plan_type_values.join(", "));
        } else {
            action |= card_config_plan_type_values.indexOf(in_plan_type) << 4;
        }
        if (card_config_plan_type_values.indexOf(out_plan_type) === -1) {
            throw new Error("card_config.out_plan_type must be one of " + card_config_plan_type_values.join(", "));
        } else {
            action |= card_config_plan_type_values.indexOf(out_plan_type);
        }
    }

    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (enable && yes_no_values.indexOf(invert) === -1) {
        throw new Error("card_config.invert must be one of " + yes_no_values.join(", "));
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xc1);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(getValue(card_config_action_type_map, action_type));
    buffer.writeUInt8(action);
    buffer.writeUInt8(getValue(yes_no_map, invert));
    return buffer.toBytes();
}

/**
 * set wires relay config
 * @since v1.3
 * @param {number} y1: values: (0: off, 1: on)
 * @param {number} y2_gl: values: (0: off, 1: on)
 * @param {number} w1: values: (0: off, 1: on)
 * @param {number} w2_aux: values: (0: off, 1: on)
 * @param {number} e: values: (0: off, 1: on)
 * @param {number} g: values: (0: off, 1: on)
 * @param {number} ob: values: (0: off, 1: on)
 * @example { "wires_relay_config": { "y1": 1, "y2_gl": 0, "w1": 1, "w2_aux": 0, "e": 1, "g": 0 },"ob_mode": 1 }
 */
function setWiresRelayConfig(wires_relay_config) {
    var on_off_map = { 0: "off", 1: "on" };
    var on_off_values = getValues(on_off_map);

    var masked = 0x00;
    var status = 0x00;
    var wire_relay_bit_offset = { y1: 0, y2_gl: 1, w1: 2, w2_aux: 3, e: 4, g: 5, ob: 6 };
    for (var wire in wires_relay_config) {
        if (on_off_values.indexOf(wires_relay_config[wire]) === -1) {
            throw new Error("wires_relay_config." + wire + " must be one of " + on_off_values.join(", "));
        }

        masked |= 1 << wire_relay_bit_offset[wire];
        status |= getValue(on_off_map, wires_relay_config[wire]) << wire_relay_bit_offset[wire];
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xf7);
    buffer.writeUInt16LE(masked);
    buffer.writeUInt16LE(status);
    return buffer.toBytes();
}

/**
 * set d2d enable
 * @param {number} d2d_master_enable values: (0: disable, 1: enable)
 * @param {number} d2d_slave_enable values: (0: disable, 1: enable)
 * @example { "d2d_master_enable": 1, "d2d_slave_enable": 0 }
 */
function setD2DEnable(d2d_master_enable, d2d_slave_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);

    var mask = 0x00;
    var status = 0x00;
    if (d2d_master_enable !== undefined) {
        if (enable_values.indexOf(d2d_master_enable) === -1) {
            throw new Error("d2d_master_enable must be one of " + enable_values.join(", "));
        }
        mask |= 1 << 0;
        status |= getValue(enable_map, d2d_master_enable) << 0;
    }
    if (d2d_slave_enable !== undefined) {
        if (enable_values.indexOf(d2d_slave_enable) === -1) {
            throw new Error("d2d_slave_enable must be one of " + enable_values.join(", "));
        }
        mask |= 1 << 1;
        status |= getValue(enable_map, d2d_slave_enable) << 1;
    }
    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xc7);
    buffer.writeUInt8((mask << 4) | status);
    return buffer.toBytes();
}

/**
 * set child lock
 * @param {object} child_lock_config
 * @param {number} child_lock_config.power_button values: (0: disable, 1: enable)
 * @param {number} child_lock_config.up_button values: (0: disable, 1: enable)
 * @param {number} child_lock_config.down_button values: (0: disable, 1: enable)
 * @param {number} child_lock_config.fan_button values: (0: disable, 1: enable)
 * @param {number} child_lock_config.mode_button values: (0: disable, 1: enable)
 * @param {number} child_lock_config.reset_button values: (0: disable, 1: enable)
 * @example { "child_lock_config": { "power_button": 1, "up_button": 0, "down_button": 1, "fan_button": 0, "mode_button": 0 , "reset_button": 1 } }
 */
function setChildLock(child_lock_config) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);

    var masked = 0x00;
    var status = 0x00;
    var button_mask_bit_offset = { power_button: 0, up_button: 1, down_button: 2, fan_button: 3, mode_button: 4, reset_button: 5 };
    for (var button in child_lock_config) {
        if (enable_values.indexOf(child_lock_config[button]) === -1) {
            throw new Error("child_lock_config." + button + " must be one of " + enable_values.join(", "));
        }
        masked |= 1 << button_mask_bit_offset[button];
        status |= getValue(enable_map, child_lock_config[button]) << button_mask_bit_offset[button];
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x25);
    buffer.writeUInt8(masked);
    buffer.writeUInt8(status);
    return buffer.toBytes();
}

/**
 * set wires
 * @param {object} wires
 * @param {number} wires.y1 values: (0: on, 1: off)
 * @param {number} wires.gh values: (0: on, 1: off)
 * @param {number} wires.ob values: (0: on, 1: off)
 * @param {number} wires.w1 values: (0: on, 1: off)
 * @param {number} wires.e values: (0: on, 1: off)
 * @param {number} wires.di values: (0: on, 1: off)
 * @param {number} wires.pek values: (0: on, 1: off)
 * @param {number} wires.w2 values: (0: on, 1: off)
 * @param {number} wires.aux values: (0: on, 1: off)
 * @param {number} wires.y2 values: (0: on, 1: off)
 * @param {number} wires.gl values: (0: on, 1: off)
 * @param {number} ob_mode values: (0: on_cool, 1: on_heat, 3: hold)
 * @example { "wires": { "y1": 1, "gh": 0, "ob": 1, "w1": 1, "e": 1, "di": 0, "pek": 1, "w2": 0, "aux": 0, "y2": 1, "gl": 0 }, "ob_mode": 0 }
 */
function setWires(wires, ob_mode) {
    var on_off_map = { 0: "off", 1: "on" };

    var b1 = 0x00;
    if ("y1" in wires) {
        b1 |= getValue(on_off_map, wires.y1) << 0;
    }
    if ("gh" in wires) {
        b1 |= getValue(on_off_map, wires.gh) << 2;
    }
    if ("ob" in wires) {
        b1 |= getValue(on_off_map, wires.ob) << 4;
    }
    if ("w1" in wires) {
        b1 |= getValue(on_off_map, wires.w1) << 6;
    }

    var b2 = 0x00;
    if ("e" in wires) {
        b2 |= getValue(on_off_map, wires.e) << 0;
    }
    if ("di" in wires) {
        b2 |= getValue(on_off_map, wires.di) << 2;
    }
    if ("pek" in wires) {
        b2 |= getValue(on_off_map, wires.pek) << 4;
    }
    if ("w2" in wires) {
        b2 |= getValue(on_off_map, wires.w2) << 6;
    }
    if ("aux" in wires) {
        b2 |= getValue(on_off_map, wires.aux) ? 2 << 6 : 0;
    }

    var b3 = 0x00;
    if ("y2" in wires) {
        b3 |= getValue(on_off_map, wires.y2) << 0;
    }
    if ("gl" in wires) {
        b3 |= getValue(on_off_map, wires.gl) ? 2 << 0 : 0;
    }
    var mode_map = { 0: "on_cool", 1: "on_heat", 3: "hold" };
    b3 |= getValue(mode_map, ob_mode) << 2;

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xca);
    buffer.writeUInt8(b1);
    buffer.writeUInt8(b2);
    buffer.writeUInt8(b3);
    return buffer.toBytes();
}

/**
 * set ob directive mode
 * @param {number} ob_mode values: (0: on_cool, 1: on_heat)
 * @example { "ob_mode": 0 }
 */
function setOBMode(ob_mode) {
    var ob_mode_map = { 0: "on_cool", 1: "on_heat" };
    var ob_mode_values = getValues(ob_mode_map);
    if (ob_mode_values.indexOf(ob_mode) === -1) {
        throw new Error("ob_mode must be one of " + ob_mode_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xb5);
    buffer.writeUInt8(getValue(ob_mode_map, ob_mode));
    return buffer.toBytes();
}

/**
 * multicast group configuration
 * @param {object} multicast_group_config
 * @param {number} multicast_group_config.group1_enable values: (0: disable, 1: enable)
 * @param {number} multicast_group_config.group2_enable values: (0: disable, 1: enable)
 * @param {number} multicast_group_config.group3_enable values: (0: disable, 1: enable)
 * @param {number} multicast_group_config.group4_enable values: (0: disable, 1: enable)
 * @example { "multicast_group_config": { "group1_enable": 1, "group2_enable": 0, "group3_enable": 1, "group4_enable": 0 } }
 */
function setMulticastGroupConfig(multicast_group_config) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);

    var mask_id = 0;
    var mask_enable = 0;
    var group_mask_bit_offset = { group1_enable: 0, group2_enable: 1, group3_enable: 2, group4_enable: 3 };
    for (var group in group_mask_bit_offset) {
        if (group in multicast_group_config) {
            if (enable_values.indexOf(multicast_group_config[group]) === -1) {
                throw new Error("multicast_group_config." + group + " must be one of " + enable_values.join(", "));
            }
            mask_id |= 1 << group_mask_bit_offset[group];
            mask_enable |= getValue(enable_map, multicast_group_config[group]) << group_mask_bit_offset[group];
        }
    }

    var data = (mask_id << 4) | mask_enable;
    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x82);
    buffer.writeUInt8(data);
    return buffer.toBytes();
}

/**
 * d2d master configuration
 * @param {object} d2d_master_config
 * @param {number} d2d_master_config.mode values: (0: wake, 1: away, 2: home, 3: sleep)
 * @param {number} d2d_master_config.enable values: (0: disable, 1: enable)
 * @param {string} d2d_master_config.d2d_cmd
 * @param {number} d2d_master_config.lora_uplink_enable values: (0: disable, 1: enable)
 * @param {number} d2d_master_config.time_enable values: (0: disable, 1: enable)
 * @param {number} d2d_master_config.time unit: minute
 * @example { "d2d_master_config": [{ "mode": 0, "enable": 1, "d2d_cmd": "0000", "uplink_enable": 1, "time_enable": 1, "time": 10 }] }
 */
function setD2DMasterConfig(d2d_master_config) {
    var mode = d2d_master_config.mode;
    var enable = d2d_master_config.enable;
    var d2d_cmd = d2d_master_config.d2d_cmd;
    var lora_uplink_enable = d2d_master_config.lora_uplink_enable;
    var time_enable = d2d_master_config.time_enable;
    var time = d2d_master_config.time;

    var mode_map = { 0: "wake", 1: "away", 2: "home", 3: "sleep" };
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
 * d2d slave configuration
 * @param {object} d2d_slave_config
 * @param {number} d2d_slave_config.id
 * @param {number} d2d_slave_config.enable values: (0: disable, 1: enable)
 * @param {string} d2d_slave_config.d2d_cmd
 * @param {number} d2d_slave_config.action_type values: (0: power, 1: plan)
 * @param {number} d2d_slave_config.action values: action_type=0 (0: off, 1: on), action_type=1 (0: wake, 1: away, 2: home, 3: sleep)
 * @example { "d2d_slave_config": [{ "id": 1, "enable": 1, "d2d_cmd": "0000", "action_type": 0, "action": 1 }] }
 */
function setD2DSlaveConfig(d2d_slave_config) {
    var id = d2d_slave_config.id;
    var enable = d2d_slave_config.enable;
    var d2d_cmd = d2d_slave_config.d2d_cmd;
    var action_type = d2d_slave_config.action_type;
    var action = d2d_slave_config.action;

    if (typeof id !== "number") {
        throw new Error("d2d_slave_config.id must be a number");
    }
    if (id < 1 || id > 16) {
        throw new Error("d2d_slave_config.id must be in range [1, 16]");
    }
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("d2d_slave_config.enable must be one of " + enable_values.join(", "));
    }
    var action_type_map = { 0: "power", 1: "plan" };
    var action_type_values = getValues(action_type_map);
    if (action_type_values.indexOf(action_type) === -1) {
        throw new Error("d2d_slave_config.action_type must be one of " + action_type_values.join(", "));
    }

    var data = 0x00;
    // system status mode
    if (getValue(action_type_map, action_type) === 0) {
        var on_off_map = { 0: "off", 1: "on" };
        var on_off_values = getValues(on_off_map);
        if (on_off_values.indexOf(action) === -1) {
            throw new Error("d2d_slave_config.action must be one of " + on_off_values.join(", "));
        }
        data = (getValue(action_type_map, action_type) << 4) | getValue(on_off_map, action);
    }
    if (getValue(action_type_map, action_type) === 1) {
        var plan_action_map = { 0: "wake", 1: "away", 2: "home", 3: "sleep" };
        var plan_action_values = getValues(plan_action_map);
        if (plan_action_values.indexOf(action) === -1) {
            throw new Error("d2d_slave_config.action must be one of " + plan_action_values.join(", "));
        }
        data = (getValue(action_type_map, action_type) << 4) | getValue(plan_action_map, action);
    }

    var buffer = new Buffer(7);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x83);
    buffer.writeUInt8(id - 1);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeD2DCommand(d2d_cmd, "0000");
    buffer.writeUInt8(data);
    return buffer.toBytes();
}

/**
 * set d2d slave group
 * @since v1.3
 * @param {number} control_permission values: (0: thermostat, 1: remote control)
 * @example { "control_permission": 0 }
 */
function setControlPermission(control_permission) {
    var control_permission_map = { 0: "thermostat", 1: "remote control" };
    var control_permission_values = getValues(control_permission_map);
    if (control_permission_values.indexOf(control_permission) === -1) {
        throw new Error("control_permission must be one of " + control_permission_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xf6);
    buffer.writeUInt8(getValue(control_permission_map, control_permission));
    return buffer.toBytes();
}

/**
 * set offline control mode
 * @since v1.3
 * @param {number} offline_control_mode values: (0: keep, 1: thermostat, 2: off)
 * @example { "offline_control_mode": 0 }
 */
function setOfflineControlMode(offline_control_mode) {
    var offline_control_mode_map = { 0: "keep", 1: "thermostat", 2: "off" };
    var offline_control_mode_values = getValues(offline_control_mode_map);
    if (offline_control_mode_values.indexOf(offline_control_mode) === -1) {
        throw new Error("offline_control_mode must be one of " + offline_control_mode_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xf8);
    buffer.writeUInt8(getValue(offline_control_mode_map, offline_control_mode));
    return buffer.toBytes();
}

/**
 * set temperature threshold alarm configuration
 * @param {object} temperature_alarm_config
 * @param {number} temperature_alarm_config.alarm_type values: (0: temperature threshold, 1: continuous low temperature, 2: continuous high temperature)
 * @param {number} temperature_alarm_config.condition values: (0: disable, 1: below, 2: above, 3: between, 4: outside)
 * @param {number} temperature_alarm_config.threshold_min condition=(below, within, outside)
 * @param {number} temperature_alarm_config.threshold_max condition=(above, within, outside)
 * @param {number} temperature_alarm_config.lock_time unit: minute
 * @param {number} temperature_alarm_config.continue_time unit: minute
 * @example { "temperature_alarm_config": { "alarm_type": 0, "condition": 1, "threshold_min": 10, "threshold_max": 20, "continue_time": 10 } }
 */
function setTemperatureAlarmConfig(temperature_alarm_config) {
    var condition = temperature_alarm_config.condition;
    var alarm_type = temperature_alarm_config.alarm_type;
    var threshold_min = temperature_alarm_config.threshold_min;
    var threshold_max = temperature_alarm_config.threshold_max;
    var lock_time = temperature_alarm_config.lock_time;
    var continue_time = temperature_alarm_config.continue_time;

    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside" };
    var condition_values = getValues(condition_map);
    if (condition_values.indexOf(condition) === -1) {
        throw new Error("temperature_alarm_config.condition must be one of " + condition_values.join(", "));
    }
    var alarm_type_map = { 0: "temperature threshold", 1: "continuous low temperature", 2: "continuous high temperature" };
    var alarm_type_values = getValues(alarm_type_map);
    if (alarm_type_values.indexOf(alarm_type) === -1) {
        throw new Error("temperature_alarm_config.alarm_type must be one of " + alarm_type_values.join(", "));
    }

    var data = 0x00;
    data |= getValue(condition_map, condition);
    data |= getValue(alarm_type_map, alarm_type) << 3;

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x06);
    buffer.writeUInt8(data);
    buffer.writeInt16LE(threshold_min * 10);
    buffer.writeInt16LE(threshold_max * 10);
    buffer.writeUInt16LE(lock_time);
    buffer.writeUInt16LE(continue_time);
    return buffer.toBytes();
}

/**
 * set screen display mode
 * @since v1.3
 * @param {number} screen_display_mode, values: (0: on, 1: without plan show, 2: disable all)
 * @example { "screen_display_mode": 0 }
 */
function setScreenDisplayMode(screen_display_mode) {
    var screen_display_mode_map = { 0: "on", 1: "without plan show", 2: "disable all" };
    var screen_display_mode_values = getValues(screen_display_mode_map);
    if (screen_display_mode_values.indexOf(screen_display_mode) === -1) {
        throw new Error("screen_display_mode must be one of " + screen_display_mode_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x08);
    buffer.writeUInt8(getValue(screen_display_mode_map, screen_display_mode));
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