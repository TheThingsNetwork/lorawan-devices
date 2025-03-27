/**
 * Payload Encoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product WT201 v2
 */
var RAW_VALUE = 0x00;

function encodeDownlink(input) {
    var encoded = milesightDeviceEncode(input.data);
    return { bytes: encoded };
}

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
    if ("timezone" in payload) {
        encoded = encoded.concat(setTimezone(payload.timezone));
    }
    if ("dst_config" in payload) {
        encoded = encoded.concat(setDaylightSavingTime(payload.dst_config));
    }
    if ("temperature_unit" in payload) {
        encoded = encoded.concat(setTemperatureUnitDisplay(payload.temperature_unit));
    }
    if ("temperature_control_mode" in payload && "target_temperature" in payload) {
        if ("system_status" in payload) {
            encoded = encoded.concat(setTemperatureControl(payload.system_status, payload.temperature_control_mode, payload.target_temperature));
        } else {
            encoded = encoded.concat(setTemperatureTarget(payload.temperature_control_mode, payload.target_temperature));
        }
    }
    if ("system_status" in payload && !("temperature_control_mode" in payload)) {
        encoded = encoded.concat(setSystemStatus(payload.system_status));
    }
    if ("temperature_calibration" in payload) {
        encoded = encoded.concat(setTemperatureCalibration(payload.temperature_calibration));
    }
    if ("humidity_calibration" in payload) {
        encoded = encoded.concat(setHumidityCalibration(payload.humidity_calibration));
    }
    if ("temperature_level_up_condition" in payload) {
        encoded = encoded.concat(setTemperatureLevelUpCondition(payload.temperature_level_up_condition));
    }
    if ("temperature_source_config" in payload) {
        encoded = encoded.concat(setTemperatureSourceConfig(payload.temperature_source_config));
    }
    if ("temperature" in payload) {
        encoded = encoded.concat(setOutsideTemperature(payload.temperature));
    }
    if ("temperature_tolerance" in payload) {
        encoded = encoded.concat(setTemperatureTolerance(payload.temperature_tolerance));
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
        for (var i = 0; i < payload.plan_schedule.length; i++) {
            var schedule = payload.plan_schedule[i];
            encoded = encoded.concat(setPlanSchedule(schedule));
        }
    }
    if ("single_temperature_plan_config" in payload) {
        for (var i = 0; i < payload.single_temperature_plan_config.length; i++) {
            var config = payload.single_temperature_plan_config[i];
            encoded = encoded.concat(setPlanConfigWithSingleTemperature(config));
        }
    }
    if ("dual_temperature_plan_config" in payload) {
        for (var i = 0; i < payload.dual_temperature_plan_config.length; i++) {
            var config = payload.dual_temperature_plan_config[i];
            encoded = encoded.concat(setPlanConfigWithDualTemperature(config));
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
    if ("d2d_master_ids" in payload) {
        for (var i = 0; i < payload.d2d_master_ids.length; i++) {
            var d2d_master_id = payload.d2d_master_ids[i];
            encoded = encoded.concat(setD2DMasterId(d2d_master_id));
        }
    }
    if ("d2d_master_config" in payload) {
        for (var i = 0; i < payload.d2d_master_config.length; i++) {
            var d2d_config = payload.d2d_master_config[i];
            encoded = encoded.concat(setD2DMasterConfig(d2d_config));
        }
    }
    if ("d2d_slave_config" in payload) {
        for (var i = 0; i < payload.d2d_slave_config.length; i++) {
            var d2d_config = payload.d2d_slave_config[i];
            encoded = encoded.concat(setD2DSlaveConfig(d2d_config));
        }
    }
    if ("temperature_threshold_config" in payload) {
        for (var i = 0; i < payload.temperature_threshold_config.length; i++) {
            var config = payload.temperature_threshold_config[i];
            encoded = encoded.concat(setTemperatureAlarmConfig(config.alarm_type, config.condition, config.min, config.max, config.lock_time, config.continue_time));
        }
    }
    if ("temperature_alarm_config" in payload) {
        encoded = encoded.concat(setTemperatureAlarmConfig(payload.temperature_alarm_config));
    }
    if ("control_permissions" in payload) {
        encoded = encoded.concat(setControlPermissions(payload.control_permissions));
    }
    if ("offline_control_mode" in payload) {
        encoded = encoded.concat(setOfflineControlMode(payload.offline_control_mode));
    }
    if ("wires_relay_config" in payload) {
        encoded = encoded.concat(setWiresRelayConfig(payload.wires_relay_config));
    }
    if ("wires_relay_change_report_enable" in payload) {
        encoded = encoded.concat(setWiresRelayChangeReport(payload.wires_relay_change_report_enable));
    }
    if ("aux_control_config" in payload) {
        encoded = encoded.concat(setAuxControlConfig(payload.aux_control_config));
    }
    if ("screen_display_mode" in payload) {
        encoded = encoded.concat(setScreenDisplayMode(payload.screen_display_mode));
    }
    if ("system_protect_config" in payload) {
        encoded = encoded.concat(setSystemProtectConfig(payload.system_protect_config));
    }
    if ("target_temperature_range" in payload) {
        encoded = encoded.concat(setTargetTemperatureRange(payload.target_temperature_range));
    }
    if ("fan_control_during_heating" in payload) {
        encoded = encoded.concat(setFanControlDuringHeating(payload.fan_control_during_heating));
    }
    if ("dual_temperature_tolerance" in payload) {
        encoded = encoded.concat(setDualTemperatureTolerance(payload.dual_temperature_tolerance));
    }
    if ("compressor_aux_combine_enable" in payload) {
        encoded = encoded.concat(setCompressorAndAuxCombineEnable(payload.compressor_aux_combine_enable));
    }
    if ("unlock_config" in payload) {
        encoded = encoded.concat(setUnlockConfig(payload.unlock_config));
    }
    if ("fan_delay_config" in payload) {
        encoded = encoded.concat(setFanDelayConfig(payload.fan_delay_config));
    }
    if ("temperature_level_up_down_delta" in payload) {
        encoded = encoded.concat(setTemperatureLevelUpDownDelta(payload.temperature_level_up_down_delta));
    }
    if ("target_temperature_resolution" in payload) {
        encoded = encoded.concat(setTargetTemperatureResolution(payload.target_temperature_resolution));
    }
    if ("temperature_up_down_enable" in payload) {
        encoded = encoded.concat(setTemperatureUpDownEnable(payload.temperature_up_down_enable));
    }
    if ("temperature_control_forbidden_config" in payload) {
        encoded = encoded.concat(setTemperatureControlForbiddenConfig(payload.temperature_control_forbidden_config));
    }

    return encoded;
}

/**
 * reboot device
 * @param {number} reboot values: (0: no, 1: yes)
 * @example { "reboot": 1 }
 */
function reboot(reboot) {
    var reboot_map = { 0: "no", 1: "yes" };
    var reboot_values = getValues(reboot_map);
    if (reboot_values.indexOf(reboot) === -1) {
        throw new Error("reboot must be one of " + reboot_values.join(", "));
    }

    if (getValue(reboot_map, reboot) === 0) {
        return [];
    }
    return [0xff, 0x10, 0xff];
}

/**
 * report device status
 * @param {number} report_status values: (0: plan, 1: periodic, 2: target_temperature_range)
 * @example { "report_status": 1 }
 */
function reportStatus(report_status) {
    var report_status_map = { 0: "plan", 1: "periodic", 2: "target_temperature_range" };
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
    var sync_time_map = { 0: "no", 1: "yes" };
    var sync_time_values = getValues(sync_time_map);
    if (sync_time_values.indexOf(sync_time) === -1) {
        throw new Error("sync_time must be one of " + sync_time_values.join(", "));
    }

    if (sync_time === 0) {
        return [];
    }
    return [0xff, 0x4a, 0xff];
}

/**
 * set timezone
 * @param {number} timezone unit: minute, convert: "hh:mm" -> "hh * 60 + mm", values: ( -720: UTC-12, -660: UTC-11, -600: UTC-10, -570: UTC-9:30, -540: UTC-9, -480: UTC-8, -420: UTC-7, -360: UTC-6, -300: UTC-5, -240: UTC-4, -210: UTC-3:30, -180: UTC-3, -120: UTC-2, -60: UTC-1, 0: UTC, 60: UTC+1, 120: UTC+2, 180: UTC+3, 240: UTC+4, 300: UTC+5, 360: UTC+6, 420: UTC+7, 480: UTC+8, 540: UTC+9, 570: UTC+9:30, 600: UTC+10, 660: UTC+11, 720: UTC+12, 765: UTC+12:45, 780: UTC+13, 840: UTC+14 )
 * @example { "timezone": 8 }
 * @example { "timezone": -4 }
 */
function setTimezone(timezone) {
    var timezone_map = { "-720": "UTC-12", "-660": "UTC-11", "-600": "UTC-10", "-570": "UTC-9:30", "-540": "UTC-9", "-480": "UTC-8", "-420": "UTC-7", "-360": "UTC-6", "-300": "UTC-5", "-240": "UTC-4", "-210": "UTC-3:30", "-180": "UTC-3", "-120": "UTC-2", "-60": "UTC-1", 0: "UTC", 60: "UTC+1", 120: "UTC+2", 180: "UTC+3", 210: "UTC+3:30", 240: "UTC+4", 270: "UTC+4:30", 300: "UTC+5", 330: "UTC+5:30", 345: "UTC+5:45", 360: "UTC+6", 390: "UTC+6:30", 420: "UTC+7", 480: "UTC+8", 540: "UTC+9", 570: "UTC+9:30", 600: "UTC+10", 630: "UTC+10:30", 660: "UTC+11", 720: "UTC+12", 765: "UTC+12:45", 780: "UTC+13", 840: "UTC+14" };
    var timezone_values = getValues(timezone_map);
    if (timezone_values.indexOf(timezone) === -1) {
        throw new Error("timezone must be one of " + timezone_values.join(", "));
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xbd);
    buffer.writeInt16LE(getValue(timezone_map, timezone));
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
    buffer.writeUInt8(enable_value && start_month);
    buffer.writeUInt8(enable_value && (start_week_num << 4) | start_week_day);
    buffer.writeUInt16LE(enable_value && start_time);
    buffer.writeUInt8(enable_value && end_month);
    buffer.writeUInt8(enable_value && (end_week_num << 4) | end_week_day);
    buffer.writeUInt16LE(enable_value && end_time);
    return buffer.toBytes();
}

/**
 * set temperature unit display
 * @param {number} temperature_unit values: (0: celsius, 1: fahrenheit)
 * @example { "temperature_unit": 0 }
 */
function setTemperatureUnitDisplay(temperature_unit) {
    var temperature_unit_map = { 0: "celsius", 1: "fahrenheit" };
    var temperature_unit_values = getValues(temperature_unit_map);
    if (temperature_unit_values.indexOf(temperature_unit) === -1) {
        throw new Error("temperature_unit must be one of " + temperature_unit_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xeb);
    buffer.writeUInt8(getValue(temperature_unit_map, temperature_unit));
    return buffer.toBytes();
}

/**
 * set system status
 * @param {number} system_status values: (0: on, 1: off)
 * @example { "system_status": 1 }
 */
function setSystemStatus(system_status) {
    var on_off_map = { 0: "on", 1: "off" };
    var on_off_values = getValues(on_off_map);
    if (on_off_values.indexOf(system_status) === -1) {
        throw new Error("system_status must be one of " + on_off_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xc5);
    buffer.writeUInt8(getValue(on_off_map, system_status));
    return buffer.toBytes();
}

/**
 * set temperature control
 * @since v2.0
 * @param {number} system_status values: (0: off, 1: on)
 * @param {number} temperature_control_mode values: (0: heat, 1: em heat, 2: cool, 3: auto)
 * @param {number} target_temperature unit: celsius
 * @example { "system_status": 1, "temperature_control_mode": 2, "target_temperature": 25 }
 */
function setTemperatureControl(system_status, temperature_control_mode, target_temperature) {
    var on_off_map = { 0: "off", 1: "on" };
    var on_off_values = getValues(on_off_map);
    if (on_off_values.indexOf(system_status) === -1) {
        throw new Error("system_status must be one of " + on_off_values.join(", "));
    }
    var temperature_control_mode_map = { 0: "heat", 1: "em heat", 2: "cool", 3: "auto" };
    var temperature_control_mode_values = getValues(temperature_control_mode_map);
    if (temperature_control_mode_values.indexOf(temperature_control_mode) === -1) {
        throw new Error("temperature_control_mode must be one of " + temperature_control_mode_values.join(", "));
    }
    if (typeof target_temperature !== "number") {
        throw new Error("target_temperature must be a number");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x45);
    buffer.writeUInt8(getValue(on_off_map, system_status));
    buffer.writeUInt8(getValue(temperature_control_mode_map, temperature_control_mode));
    buffer.writeInt16LE(target_temperature * 10);
    return buffer.toBytes();
}

/**
 * set temperature calibration
 * @param {object} temperature_calibration
 * @param {number} temperature_calibration.enable values: (0: disable, 1: enable)
 * @param {number} temperature_calibration.temperature, unit: celsius
 * @example { "temperature_calibration": { "enable": 1, "temperature": 25 } }
 */
function setTemperatureCalibration(temperature_calibration) {
    var enable = temperature_calibration.enable;
    var temperature = temperature_calibration.temperature;

    var temperature_calibrate_enable_map = { 0: "disable", 1: "enable" };
    var temperature_calibrate_enable_values = getValues(temperature_calibrate_enable_map);
    if (temperature_calibrate_enable_values.indexOf(enable) === -1) {
        throw new Error("temperature_calibration.enable must be one of " + temperature_calibrate_enable_values.join(", "));
    }
    if (enable && typeof temperature !== "number") {
        throw new Error("temperature_calibration.temperature must be a number");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xab);
    buffer.writeUInt8(getValue(temperature_calibrate_enable_map, enable));
    buffer.writeInt16LE(temperature * 10);
    return buffer.toBytes();
}

/**
 * set humidity calibration
 * @since v1.3
 * @param {object} humidity_calibration
 * @param {number} humidity_calibration.enable values: (0: disable, 1: enable)
 * @param {number} humidity_calibration.humidity, unit: %
 * @example { "humidity_calibration": { "enable": 1, "humidity": 50 } }
 */
function setHumidityCalibration(humidity_calibration) {
    var enable = humidity_calibration.enable;
    var humidity = humidity_calibration.humidity;

    var humidity_calibrate_enable_map = { 0: "disable", 1: "enable" };
    var humidity_calibrate_enable_values = getValues(humidity_calibrate_enable_map);
    if (humidity_calibrate_enable_values.indexOf(enable) === -1) {
        throw new Error("humidity_calibration.enable must be one of " + humidity_calibrate_enable_values.join(", "));
    }
    if (enable && typeof humidity !== "number") {
        throw new Error("humidity_calibration.humidity must be a number");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(getValue(humidity_calibrate_enable_map, enable));
    buffer.writeInt16LE(humidity * 10);
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
 * set target temperature resolution
 * @since v2.0
 * @param {number} target_temperature_resolution values: (0: 0.5, 1: 1)
 * @example { "target_temperature_resolution": 0.5 }
 */
function setTargetTemperatureResolution(target_temperature_resolution) {
    var resolution_map = { 0: 0.5, 1: 1 };
    var resolution_values = getValues(resolution_map);
    if (resolution_values.indexOf(target_temperature_resolution) === -1) {
        throw new Error("target_temperature_resolution must be one of " + resolution_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x41);
    buffer.writeUInt8(getValue(resolution_map, target_temperature_resolution));
    return buffer.toBytes();
}

/**
 * set temperature target range
 * @since v2.0
 * @param {object} target_temperature_range
 * @param {number} target_temperature_range.temperature_control_mode values: (0: heat, 1: em heat, 2: cool, 3: auto)
 * @param {number} target_temperature_range.min unit: celsius
 * @param {number} target_temperature_range.max unit: celsius
 * @example { "target_temperature_range": { "temperature_control_mode": 2, "min": 15, "max": 30 } }
 */
function setTargetTemperatureRange(target_temperature_range) {
    var temperature_control_mode = target_temperature_range.temperature_control_mode;
    var min = target_temperature_range.min;
    var max = target_temperature_range.max;

    var temperature_mode_map = { 0: "heat", 1: "em heat", 2: "cool", 3: "auto" };
    var temperature_mode_values = getValues(temperature_mode_map);
    if (temperature_mode_values.indexOf(temperature_control_mode) === -1) {
        throw new Error("temperature_control_mode must be one of " + temperature_mode_values.join(", "));
    }

    var buffer = new Buffer(7);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x42);
    buffer.writeUInt8(getValue(temperature_mode_map, temperature_control_mode));
    buffer.writeInt16LE(min * 10);
    buffer.writeInt16LE(max * 10);
    return buffer.toBytes();
}
/**
 * set temperature level up condition
 * @param {object} temperature_level_up_condition
 * @param {number} temperature_level_up_condition.type values: (0: heat, 1: cool)
 * @param {number} temperature_level_up_condition.time unit: minute
 * @param {number} temperature_level_up_condition.temperature_control_tolerance unit: celsius
 * @example { "temperature_level_up_condition": { "type": 0, "time": 10, "temperature_control_tolerance": 1 } }
 */
function setTemperatureLevelUpCondition(temperature_level_up_condition) {
    var type = temperature_level_up_condition.type;
    var time = temperature_level_up_condition.time;
    var temperature_control_tolerance = temperature_level_up_condition.temperature_control_tolerance;

    var temperature_level_up_condition_type_map = { 0: "heat", 1: "cool" };
    var temperature_level_up_condition_type_values = getValues(temperature_level_up_condition_type_map);
    if (temperature_level_up_condition_type_values.indexOf(type) === -1) {
        throw new Error("temperature_level_up_condition.type must be one of " + temperature_level_up_condition_type_values.join(", "));
    }
    if (typeof time !== "number") {
        throw new Error("temperature_level_up_condition.time must be a number");
    }
    if (typeof temperature_control_tolerance !== "number") {
        throw new Error("temperature_level_up_condition.temperature_control_tolerance must be a number");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xb9);
    buffer.writeUInt8(getValue(temperature_level_up_condition_type_map, type));
    buffer.writeUInt8(time);
    buffer.writeUInt8(temperature_control_tolerance * 10);
    return buffer.toBytes();
}

/**
 * set temperature level up delta
 * @since v2.0
 * @param {object} temperature_level_up_down_delta
 * @param {number} temperature_level_up_down_delta.delta_1 unit: celsius
 * @param {number} temperature_level_up_down_delta.delta_2 unit: celsius
 * @example { "temperature_level_up_down_delta": { "delta_1": 1, "delta_2": 2 } }
 */
function setTemperatureLevelUpDownDelta(temperature_level_up_down_delta) {
    var delta_1 = temperature_level_up_down_delta.delta_1;
    var delta_2 = temperature_level_up_down_delta.delta_2;

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x43);
    buffer.writeUInt8(0x00);
    buffer.writeUInt8(delta_1 * 10);
    buffer.writeUInt8(delta_2 * 10);
    return buffer.toBytes();
}

/**
 * set temperature up down enable
 * @since v2.0
 * @param {object} temperature_up_down_enable
 * @param {number} temperature_up_down_enable.forward_enable values: (0: disable, 1: enable)
 * @param {number} temperature_up_down_enable.backward_enable values: (0: disable, 1: enable)
 * @example { "temperature_up_down_enable": { "forward_enable": 1, "backward_enable": 1 } }
 */
function setTemperatureUpDownEnable(temperature_up_down_enable) {
    var forward_enable = temperature_up_down_enable.forward_enable;
    var backward_enable = temperature_up_down_enable.backward_enable;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);

    var masked = 0x00;
    var enabled = 0x00;
    var bit_offset = { forward_enable: 0, backward_enable: 1 };
    for (var key in bit_offset) {
        if (key in temperature_up_down_enable) {
            if (enable_values.indexOf(temperature_up_down_enable[key]) === -1) {
                throw new Error("temperature_up_down_enable." + key + " must be one of " + enable_values.join(", "));
            }
            masked |= 1 << bit_offset[key];
            enabled |= getValue(enable_map, temperature_up_down_enable[key]) << bit_offset[key];
        }
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x1b);
    buffer.writeUInt8(masked);
    buffer.writeUInt8(enabled);
    return buffer.toBytes();
}

/**
 * set temperature control enable
 * @since v1.3
 * @param {number} temperature_control_mode values: (0: heat, 1: em heat, 2: cool, 3: auto, 4: auto heat, 5: auto cool)
 * @param {number} target_temperature unit: celsius
 * @example { "temperature_control_mode": 2, "target_temperature": 25 }
 */
function setTemperatureTarget(temperature_control_mode, target_temperature) {
    var temperature_mode_map = { 0: "heat", 1: "em heat", 2: "cool", 3: "auto", 4: "auto heat", 5: "auto cool" };
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
 * @param {number} temperature_control_mode values: (0: heat, 1: em heat, 2: cool, 3: auto)
 * @example { "temperature_control_mode": 2 }
 */
function setTemperatureControlMode(temperature_control_mode) {
    var temperature_mode_map = { 0: "heat", 1: "em heat", 2: "cool", 3: "auto" };
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
 * set temperature source config
 * @param {object} temperature_source_config
 * @param {number} temperature_source_config.source values: (0: disable, 1: lora, 2: d2d)
 * @param {number} temperature_source_config.timeout, unit: minute, range: [5, 60]
 * @example { "temperature_source_config": { "source": 1, "timeout": 10 } }
 */
function setTemperatureSourceConfig(temperature_source_config) {
    var source = temperature_source_config.source;
    var timeout = temperature_source_config.timeout;

    var source_map = { 0: "disable", 1: "lora", 2: "d2d" };
    var source_values = getValues(source_map);
    if (source_values.indexOf(source) === -1) {
        throw new Error("temperature_source_config.source must be one of " + source_values.join(", "));
    }
    if (getValue(source_map, source) != 0) {
        if (typeof timeout !== "number") {
            throw new Error("temperature_source_config.timeout must be a number");
        }
        if (timeout < 3 || timeout > 60) {
            throw new Error("temperature_source_config.timeout must be in range [5, 60]");
        }
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xc4);
    buffer.writeUInt8(getValue(source_map, source));
    buffer.writeUInt8(timeout);
    return buffer.toBytes();
}

/**
 * set temperature (source: outside)
 * @param {number} temperature, unit: celsius
 * @example { "temperature": 25 }
 */
function setOutsideTemperature(temperature) {
    if (typeof temperature !== "number") {
        throw new Error("temperature must be a number");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0x03);
    buffer.writeInt16LE(temperature * 10);
    buffer.writeUInt8(0xff);
    return buffer.toBytes();
}

/**
 * set humidity
 * @param {number} humidity, unit: %, range: [0, 100]
 * @example { "humidity": 50 }
 */
function setHumidity(humidity) {
    if (typeof humidity !== "number") {
        throw new Error("humidity must be a number");
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0x09);
    buffer.writeUInt8(humidity * 2);
    buffer.writeUInt8(0xff);
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
    var temperature_control_tolerance = temperature_dehumidify.temperature_control_tolerance;

    var dehumidify_enable_map = { 0: "disable", 1: "enable" };
    var dehumidify_enable_values = getValues(dehumidify_enable_map);
    if (dehumidify_enable_values.indexOf(enable) === -1) {
        throw new Error("temperature_dehumidify.enable must be one of " + dehumidify_enable_values.join(", "));
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
    buffer.writeUInt8(getValue(dehumidify_enable_map, enable));
    buffer.writeUInt8(getValue(dehumidify_enable_map, enable) && (temperature_tolerance === 0xff ? temperature_tolerance : temperature_tolerance * 10));
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

    var fan_dehumidify_enable_map = { 0: "disable", 1: "enable" };
    var fan_dehumidify_enable_values = getValues(fan_dehumidify_enable_map);
    if (fan_dehumidify_enable_values.indexOf(enable) === -1) {
        throw new Error("fan_dehumidify.enable must be one of " + fan_dehumidify_enable_values.join(", "));
    }
    if (getValue(fan_dehumidify_enable_map, enable) && typeof execute_time !== "number") {
        throw new Error("fan_dehumidify.execute_time must be a number");
    }
    if (getValue(fan_dehumidify_enable_map, enable) && (execute_time < 5 || execute_time > 55)) {
        throw new Error("fan_dehumidify.execute_time must be in range [5, 55]");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x07);
    buffer.writeUInt8(getValue(fan_dehumidify_enable_map, enable));
    buffer.writeUInt8(getValue(fan_dehumidify_enable_map, enable) && execute_time);
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

    var freeze_protection_enable_map = { 0: "disable", 1: "enable" };
    var freeze_protection_enable_values = getValues(freeze_protection_enable_map);
    if (freeze_protection_enable_values.indexOf(enable) === -1) {
        throw new Error("freeze_protection_config.enable must be one of " + freeze_protection_enable_values.join(", "));
    }
    if (enable && typeof temperature !== "number") {
        throw new Error("freeze_protection_config.temperature must be a number");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xb0);
    buffer.writeUInt8(getValue(freeze_protection_enable_map, enable));
    buffer.writeInt16LE(temperature * 10);
    return buffer.toBytes();
}

/**
 * @param {string} fan_mode values: (0: auto, 1: on, 2: circulate)
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
    var fan_delay_enable_map = { 0: "disable", 1: "enable" };
    var fan_delay_enable_values = getValues(fan_delay_enable_map);
    if (fan_delay_enable_values.indexOf(fan_delay_enable) === -1) {
        throw new Error("fan_delay_enable must be one of " + fan_delay_enable_values.join(", "));
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
    buffer.writeUInt8(getValue(fan_delay_enable_map, fan_delay_enable));
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
 * set plan type
 * @param {string} plan_type values: (0: wake, 1: away, 2: home, 3: sleep, 4: occupied, 5: vacant, 6: eco)
 * @example { "plan_type": 0 }
 */
function setPlanType(plan_type) {
    var plan_type_map = { 0: "wake", 1: "away", 2: "home", 3: "sleep", 4: "occupied", 5: "vacant", 6: "eco" };
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
 * @param {string} plan_schedule.plan_type values: (0: wake, 1: away, 2: home, 3: sleep, 4: occupied, 5: vacant, 6: eco)
 * @param {number} plan_schedule.id range: [1, 16]
 * @param {number} plan_schedule.enable values: (0: disable, 1: enable)
 * @param {object} plan_schedule.week_recycle
 * @param {number} plan_schedule.week_recycle.monday values: (0: disable, 1: enable)
 * @param {number} plan_schedule.week_recycle.tuesday values: (0: disable, 1: enable)
 * @param {number} plan_schedule.week_recycle.wednesday values: (0: disable, 1: enable)
 * @param {number} plan_schedule.week_recycle.thursday values: (0: disable, 1: enable)
 * @param {number} plan_schedule.week_recycle.friday values: (0: disable, 1: enable)
 * @param {number} plan_schedule.week_recycle.saturday values: (0: disable, 1: enable)
 * @param {number} plan_schedule.week_recycle.sunday values: (0: disable, 1: enable)
 * @param {number} plan_schedule.time unit: minute, convert: "hh:mm" -> "hh * 60 + mm"
 * @example { "plan_schedule": [{ "plan_type": 0, "id": 0, "enable": 1, "week_recycle": { "monday": 1, "tuesday": 0, "wednesday": 1, "thursday": 0, "friday": 1, "saturday": 0, "sunday": 1 }, "time": 240 }] }
 */
function setPlanSchedule(plan_schedule) {
    var plan_type = plan_schedule.plan_type;
    var id = plan_schedule.id;
    var enable = plan_schedule.enable;
    var week_recycle = plan_schedule.week_recycle;
    var time = plan_schedule.time;

    var plan_schedule_type_map = { 0: "wake", 1: "away", 2: "home", 3: "sleep", 4: "occupied", 5: "vacant", 6: "eco" };
    var plan_schedule_type_values = getValues(plan_schedule_type_map);
    if (plan_schedule_type_values.indexOf(plan_type) === -1) {
        throw new Error("plan_schedule._item.plan_type must be one of " + plan_schedule_type_values.join(", "));
    }
    if (typeof id !== "number") {
        throw new Error("plan_schedule._item.id must be a number");
    }
    if (id < 1 || id > 16) {
        throw new Error("plan_schedule._item.id must be in range [1, 16]");
    }
    var plan_schedule_enable_map = { 0: "disable", 1: "enable" };
    var plan_schedule_enable_values = getValues(plan_schedule_enable_map);
    if (plan_schedule_enable_values.indexOf(enable) === -1) {
        throw new Error("plan_schedule._item.enable must be one of " + plan_schedule_enable_values.join(", "));
    }

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);

    var week_day_bits_offset = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 7 };
    var days = 0x00;
    for (var day in week_recycle) {
        if (enable_values.indexOf(week_recycle[day]) === -1) {
            throw new Error("plan_schedule._item.week_recycle." + day + " must be one of " + enable_values.join(", "));
        }
        days |= getValue(enable_map, week_recycle[day]) << week_day_bits_offset[day];
    }

    var buffer = new Buffer(8);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xc9);
    buffer.writeUInt8(getValue(plan_schedule_type_map, plan_type));
    buffer.writeUInt8(id - 1);
    buffer.writeUInt8(getValue(plan_schedule_enable_map, enable));
    buffer.writeUInt8(days);
    buffer.writeUInt16LE(time);
    return buffer.toBytes();
}

/**
 * set plan config (target temperature dual)
 * @param {object} dual_plan_config
 * @param {number} dual_plan_config.type values: (0: wake, 1: away, 2: home, 3: sleep, 4: occupied, 5: vacant, 6: eco)
 * @param {number} dual_plan_config.temperature_control_mode values: (0: heat, 1: em heat, 2: cool, 3: auto)
 * @param {number} dual_plan_config.fan_mode values: (0: auto, 1: on, 2: circulate)
 * @param {number} dual_plan_config.heat_target_temperature
 * @param {number} dual_plan_config.heat_temperature_tolerance
 * @param {number} dual_plan_config.cool_target_temperature
 * @param {number} dual_plan_config.cool_temperature_tolerance
 * @example { "dual_temperature_plan_config": [{ "type": 0, "temperature_control_mode": 2, "fan_mode": 0, "heat_target_temperature": 20, "heat_temperature_tolerance": 1, "cool_target_temperature": 20, "cool_temperature_tolerance": 1 }]}
 */
function setPlanConfigWithDualTemperature(dual_temperature_plan_config) {
    var type = dual_temperature_plan_config.type;
    var temperature_control_mode = dual_temperature_plan_config.temperature_control_mode;
    var fan_mode = dual_temperature_plan_config.fan_mode;
    var heat_target_temperature = dual_temperature_plan_config.heat_target_temperature;
    var heat_temperature_tolerance = dual_temperature_plan_config.heat_temperature_tolerance;
    var cool_target_temperature = dual_temperature_plan_config.cool_target_temperature;
    var cool_temperature_tolerance = dual_temperature_plan_config.cool_temperature_tolerance;

    var plan_config_type_map = { 0: "wake", 1: "away", 2: "home", 3: "sleep", 4: "occupied", 5: "vacant", 6: "eco" };
    var plan_config_type_values = getValues(plan_config_type_map);
    if (plan_config_type_values.indexOf(type) === -1) {
        throw new Error("dual_temperature_plan_config.type must be one of " + plan_config_type_values.join(", "));
    }
    var plan_config_temperature_control_mode_map = { 0: "heat", 1: "em heat", 2: "cool", 3: "auto" };
    var plan_config_temperature_control_mode_values = getValues(plan_config_temperature_control_mode_map);
    if (plan_config_temperature_control_mode_values.indexOf(temperature_control_mode) === -1) {
        throw new Error("plan_config.temperature_control_mode must be one of " + plan_config_temperature_control_mode_values.join(", "));
    }
    var plan_config_fan_mode_map = { 0: "auto", 1: "on", 2: "circulate" };
    var plan_config_fan_mode_values = getValues(plan_config_fan_mode_map);
    if (plan_config_fan_mode_values.indexOf(fan_mode) === -1) {
        throw new Error("dual_temperature_plan_config.fan_mode must be one of " + plan_config_fan_mode_values.join(", "));
    }

    var heat_target_temperature_value = 0xffff;
    if ("heat_target_temperature" in dual_temperature_plan_config) {
        if (typeof heat_target_temperature !== "number") {
            throw new Error("dual_temperature_plan_config.heat_target_temperature must be a number");
        }
        heat_target_temperature_value = heat_target_temperature * 10;
    }

    var heat_temperature_tolerance_value = 0xff;
    if ("heat_temperature_tolerance" in dual_temperature_plan_config) {
        if (typeof heat_temperature_tolerance !== "number") {
            throw new Error("dual_temperature_plan_config.heat_temperature_tolerance must be a number");
        }
        heat_temperature_tolerance_value = heat_temperature_tolerance * 10;
    }

    var cool_target_temperature_value = 0xffff;
    if ("cool_target_temperature" in dual_temperature_plan_config) {
        if (typeof cool_target_temperature !== "number") {
            throw new Error("dual_temperature_plan_config.cool_target_temperature must be a number");
        }
        cool_target_temperature_value = cool_target_temperature * 10;
    }

    var cool_temperature_tolerance_value = 0xff;
    if ("cool_temperature_tolerance" in dual_temperature_plan_config) {
        if (typeof cool_temperature_tolerance !== "number") {
            throw new Error("dual_temperature_plan_config.cool_temperature_tolerance must be a number");
        }
        cool_temperature_tolerance_value = cool_temperature_tolerance * 10;
    }

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x59);
    buffer.writeUInt8(getValue(plan_config_type_map, type));
    buffer.writeUInt8(getValue(plan_config_temperature_control_mode_map, temperature_control_mode));
    buffer.writeUInt8(getValue(plan_config_fan_mode_map, fan_mode));
    buffer.writeInt16LE(heat_target_temperature_value);
    buffer.writeUInt8(heat_temperature_tolerance_value);
    buffer.writeInt16LE(cool_target_temperature_value);
    buffer.writeUInt8(cool_temperature_tolerance_value);
    return buffer.toBytes();
}

/**
 * set dual temperature tolerance
 * @odm 2706
 * @param {object} dual_temperature_tolerance
 * @param {number} dual_temperature_tolerance.heat_tolerance
 * @param {number} dual_temperature_tolerance.cool_tolerance
 * @example { "dual_temperature_tolerance": { "heat_tolerance": 1, "cool_tolerance": 1 } }
 */
function setDualTemperatureTolerance(dual_temperature_tolerance) {
    var heat_tolerance = dual_temperature_tolerance.heat_tolerance;
    var cool_tolerance = dual_temperature_tolerance.cool_tolerance;

    var heat_tolerance_buffer = [];
    if ("heat_tolerance" in dual_temperature_tolerance) {
        if (typeof heat_tolerance !== "number") {
            throw new Error("dual_temperature_tolerance.heat_tolerance must be a number");
        }

        var buffer = new Buffer(3);
        buffer.writeUInt8(0xf9);
        buffer.writeUInt8(0x5a);
        buffer.writeUInt8(0x00);
        buffer.writeUInt8(heat_tolerance * 10);
        heat_tolerance_buffer = buffer.toBytes();
    }

    var cool_tolerance_buffer = [];
    if ("cool_tolerance" in dual_temperature_tolerance) {
        if (typeof cool_tolerance !== "number") {
            throw new Error("dual_temperature_tolerance.cool_tolerance must be a number");
        }

        var buffer = new Buffer(4);
        buffer.writeUInt8(0xf9);
        buffer.writeUInt8(0x5a);
        buffer.writeUInt8(0x01);
        buffer.writeUInt8(cool_tolerance * 10);
        cool_tolerance_buffer = buffer.toBytes();
    }

    return heat_tolerance_buffer.concat(cool_tolerance_buffer);
}

/**
 * set card config
 * @param {object} card_config
 * @param {number} card_config.enable values: (0: disable, 1: enable)
 * @param {number} card_config.action_type values: (0: power, 1: plan)
 * @param {number} card_config.in_plan_type values: (0: wake, 1: away, 2: home, 3: sleep, 4: occupied, 5: vacant, 6: eco)
 * @param {number} card_config.out_plan_type values: (0: wake, 1: away, 2: home, 3: sleep, 4: occupied, 5: vacant, 6: eco)
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

    var card_config_enable_map = { 0: "disable", 1: "enable" };
    var card_config_enable_values = getValues(card_config_enable_map);
    if (card_config_enable_values.indexOf(enable) === -1) {
        throw new Error("card_config.enable must be one of " + card_config_enable_values.join(", "));
    }
    var card_config_action_type_map = { 0: "power", 1: "plan" };
    var card_config_action_type_values = getValues(card_config_action_type_map);
    if (getValue(card_config_enable_map, enable) && card_config_action_type_values.indexOf(action_type) === -1) {
        throw new Error("card_config.action_type must be one of " + card_config_action_type_values.join(", "));
    }

    var action = 0x00;
    if (getValue(card_config_action_type_map, action_type) === 1) {
        var card_config_plan_type_map = { 0: "wake", 1: "away", 2: "home", 3: "sleep", 4: "occupied", 5: "vacant", 6: "eco" };
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

    var card_config_invert_map = { 0: "no", 1: "yes" };
    var card_config_invert_values = getValues(card_config_invert_map);
    if (enable && card_config_invert_values.indexOf(invert) === -1) {
        throw new Error("card_config.invert must be one of " + card_config_invert_values.join(", "));
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xc1);
    buffer.writeUInt8(getValue(card_config_enable_map, enable));
    buffer.writeUInt8(getValue(card_config_enable_map, enable) ? getValue(card_config_action_type_map, action_type) : 0);
    buffer.writeUInt8(action);
    buffer.writeUInt8(getValue(card_config_enable_map, enable) ? getValue(card_config_invert_map, invert) : 0);
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
    var wire_relay_enable_map = { 0: "off", 1: "on" };
    var wire_relay_enable_values = getValues(wire_relay_enable_map);
    var wire_relay_bit_offset = { y1: 0, y2_gl: 1, w1: 2, w2_aux: 3, e: 4, g: 5, ob: 6 };

    var masked = 0x00;
    var status = 0x00;
    for (var wire in wires_relay_config) {
        if (wire_relay_enable_values.indexOf(wires_relay_config[wire]) === -1) {
            throw new Error("wires_relay_config." + wire + " must be one of " + wire_relay_enable_values.join(", "));
        }

        masked |= 1 << wire_relay_bit_offset[wire];
        status |= getValue(wire_relay_enable_map, wires_relay_config[wire]) << wire_relay_bit_offset[wire];
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xf7);
    buffer.writeUInt16LE(masked);
    buffer.writeUInt16LE(status);
    return buffer.toBytes();
}

/**
 * set wires relay change report
 * @param {number} wires_relay_change_report_enable values: (0: disable, 1: enable)
 * @example { "wires_relay_change_report_enable": 1 }
 */
function setWiresRelayChangeReport(wires_relay_change_report_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(wires_relay_change_report_enable) === -1) {
        throw new Error("wires_relay_change_report_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x3a);
    buffer.writeUInt8(getValue(enable_map, wires_relay_change_report_enable));
    return buffer.toBytes();
}

/**
 * set aux config
 * @odm 2706
 * @param {object} aux_control_config
 * @param {number} aux_control_config.y2_enable values: (0: disable, 1: enable)
 * @param {number} aux_control_config.w2_enable values: (0: disable, 1: enable)
 * @example { "aux_control_config": { "y2_enable": 1, "w2_enable": 1 } }
 */
function setAuxControlConfig(aux_control_config) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);

    var data = 0;
    var aux_control_bit_offset = { y2_enable: 0, w2_enable: 1 };
    for (var key in aux_control_bit_offset) {
        if (key in aux_control_config) {
            if (enable_values.indexOf(aux_control_config[key]) === -1) {
                throw new Error("aux_control_config." + key + " must be one of " + enable_values.join(", "));
            }
            // mask
            data |= 1 << (aux_control_bit_offset[key] + 4);
            // status
            data |= getValue(enable_map, aux_control_config[key]) << aux_control_bit_offset[key];
        }
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x3b);
    buffer.writeUInt8(data);
    return buffer.toBytes();
}

/**
 * set fan delay config
 * @param {number} enable values: (0: disable, 1: enable)
 * @param {number} delay_time unit: second, range: [1, 3600]
 * @example { "fan_delay_config": { "enable": 1, "delay_time": 10 } }
 */
function setFanDelayConfig(fan_delay_config) {
    var enable = fan_delay_config.enable;
    var delay_time = fan_delay_config.delay_time;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("fan_delay_config.enable must be one of " + enable_values.join(", "));
    }
    if (getValue(enable_map, enable) && (delay_time < 1 || delay_time > 3600)) {
        throw new Error("fan_delay_config.delay_time must be a number, range: [1, 3600]");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x44);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt16LE(delay_time);
    return buffer.toBytes();
}

/**
 * set compressor and aux combine enable
 * @param {number} compressor_aux_combine_enable values: (0: disable, 1: enable)
 * @example { "compressor_aux_combine_enable": 1 }
 * @since v2.0
 */
function setCompressorAndAuxCombineEnable(compressor_aux_combine_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(compressor_aux_combine_enable) === -1) {
        throw new Error("compressor_aux_combine_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x46);
    buffer.writeUInt8(getValue(enable_map, compressor_aux_combine_enable));
    return buffer.toBytes();
}

/**
 * set system protect config
 * @since v2.0
 * @param {object} system_protect_config
 * @param {number} system_protect_config.enable values: (0: disable, 1: enable)
 * @param {number} system_protect_config.duration unit: minute, range: [1, 60]
 * @example { "system_protect_config": { "enable": 1, "duration": 10 } }
 */
function setSystemProtectConfig(system_protect_config) {
    var enable = system_protect_config.enable;
    var duration = system_protect_config.duration;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("system_protect_config.enable must be one of " + enable_values.join(", "));
    }
    if (typeof duration !== "number" || duration < 1 || duration > 60) {
        throw new Error("system_protect_config.duration must be a number, range: [1, 60]");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x47);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(duration);
    return buffer.toBytes();
}

/**
 * set d2d enable
 * @param {number} d2d_master_enable values: (0: disable, 1: enable)
 * @param {number} d2d_slave_enable values: (0: disable, 1: enable)
 * @example { "d2d_master_enable": 1, "d2d_slave_enable": 0 }
 */
function setD2DEnable(d2d_master_enable, d2d_slave_enable) {
    var d2d_enable_map = { 0: "disable", 1: "enable" };
    var d2d_enable_values = getValues(d2d_enable_map);

    var mask = 0x00;
    var status = 0x00;
    if (d2d_master_enable !== undefined) {
        if (d2d_enable_values.indexOf(d2d_master_enable) === -1) {
            throw new Error("d2d_master_enable must be one of " + d2d_enable_values.join(", "));
        }
        mask |= 1 << 0;
        status |= getValue(d2d_enable_map, d2d_master_enable) << 0;
    }
    if (d2d_slave_enable !== undefined) {
        if (d2d_enable_values.indexOf(d2d_slave_enable) === -1) {
            throw new Error("d2d_slave_enable must be one of " + d2d_enable_values.join(", "));
        }
        mask |= 1 << 1;
        status |= getValue(d2d_enable_map, d2d_slave_enable) << 1;
    }
    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xc7);
    buffer.writeUInt8((mask << 4) | status);
    return buffer.toBytes();
}

/**
 * set d2d master id
 * @since v2.0
 * @param {object} d2d_master_ids
 * @param {number} d2d_master_ids.id values: (1, 2, 3, 4, 5)
 * @param {string} d2d_master_ids.dev_eui
 * @example { "d2d_master_ids": [{ "id": 1, "dev_eui": "0000000000000000" }] }
 */
function setD2DMasterId(d2d_master_id) {
    var id = d2d_master_id.id;
    var dev_eui = d2d_master_id.dev_eui;

    var id_values = [1, 2, 3, 4, 5];
    if (id_values.indexOf(id) === -1) {
        throw new Error("d2d_master_ids._item.id must be one of " + id_values.join(", "));
    }

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x3e);
    buffer.writeUInt8(id - 1);
    buffer.writeHexString(dev_eui, "0000000000000000");
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
    var button_mask_bit_offset = { power_button: 0, up_button: 1, down_button: 2, fan_button: 3, mode_button: 4, reset_button: 5 };
    var button_enable_map = { 0: "disable", 1: "enable" };
    var button_enable_values = getValues(button_enable_map);

    var masked = 0x00;
    var status = 0x00;
    for (var button in child_lock_config) {
        if (button_enable_values.indexOf(child_lock_config[button]) === -1) {
            throw new Error("child_lock_config." + button + " must be one of " + button_enable_values.join(", "));
        }

        masked |= 1 << button_mask_bit_offset[button];
        status |= getValue(button_enable_map, child_lock_config[button]) << button_mask_bit_offset[button];
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
 * @param {number} ob_mode values: (0: on cool, 1: on heat, 3: hold)
 * @example { "wires": { "y1": 1, "gh": 0, "ob": 1, "w1": 1, "e": 1, "di": 0, "pek": 1, "w2": 0, "aux": 0, "y2": 1, "gl": 0 }, "ob_mode": 0 }
 */
function setWires(wires, ob_mode) {
    var on_off_map = { 0: "off", 1: "on" };
    var on_off_values = getValues(on_off_map);

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
    var mode_map = { 0: "on cool", 1: "on heat", 3: "hold" };
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
 * @param {number} ob_mode values: (0: on cool, 1: on heat)
 * @example { "ob_mode": 0 }
 */
function setOBMode(ob_mode) {
    var ob_mode_map = { 0: "on cool", 1: "on heat" };
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
    var mask_id = 0;
    var mask_enable = 0;
    var group_mask_bit_offset = { group1_enable: 0, group2_enable: 1, group3_enable: 2, group4_enable: 3 };

    var group_enable_map = { 0: "disable", 1: "enable" };
    var group_enable_values = getValues(group_enable_map);
    for (var group in group_mask_bit_offset) {
        if (group in multicast_group_config) {
            if (group_enable_values.indexOf(multicast_group_config[group]) === -1) {
                throw new Error("multicast_group_config." + group + " must be one of " + group_enable_values.join(", "));
            }

            mask_id |= 1 << group_mask_bit_offset[group];
            mask_enable |= getValue(group_enable_map, multicast_group_config[group]) << group_mask_bit_offset[group];
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
 * @param {number} d2d_master_config.plan_type values: (0: wake, 1: away, 2: home, 3: sleep, 4: occupied, 5: vacant, 6: eco)
 * @param {number} d2d_master_config.enable values: (0: disable, 1: enable)
 * @param {number} d2d_master_config.d2d_cmd
 * @param {number} d2d_master_config.uplink_enable values: (0: disable, 1: enable)
 * @param {number} d2d_master_config.time_enable values: (0: disable, 1: enable)
 * @param {number} d2d_master_config.time unit: minute
 * @example { "d2d_master_config": [{ "plan_type": 0, "enable": 1, "d2d_cmd": "0000", "uplink_enable": 1, "time_enable": 1, "time": 10 }] }
 */
function setD2DMasterConfig(d2d_master_config) {
    var plan_type = d2d_master_config.plan_type;
    var enable = d2d_master_config.enable;
    var d2d_cmd = d2d_master_config.d2d_cmd;
    var uplink_enable = d2d_master_config.uplink_enable;
    var time_enable = d2d_master_config.time_enable;
    var time = d2d_master_config.time;

    var plan_type_map = { 0: "wake", 1: "away", 2: "home", 3: "sleep", 4: "occupied", 5: "vacant", 6: "eco" };
    var plan_type_values = getValues(plan_type_map);
    if (plan_type_values.indexOf(plan_type) === -1) {
        throw new Error("d2d_master_config._item.plan_type must be one of " + plan_type_values.join(", "));
    }
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("d2d_master_config._item.enable must be one of " + enable_values.join(", "));
    }
    if (enable && enable_values.indexOf(uplink_enable) === -1) {
        throw new Error("d2d_master_config._item.uplink_enable must be one of " + enable_values.join(", "));
    }
    if (enable && enable_values.indexOf(time_enable) === -1) {
        throw new Error("d2d_master_config._item.time_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(10);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x96);
    buffer.writeUInt8(getValue(plan_type_map, plan_type));
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(getValue(enable_map, uplink_enable));
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
 * @param {object} d2d_slave_config.action
 * @param {number} d2d_slave_config.action.action_type values: (0: power, 1: plan)
 * @param {number} d2d_slave_config.action.system_status values: action_type=0 (0: off, 1: on)
 * @param {number} d2d_slave_config.action.plan_type values: action_type=1 (0: wake, 1: away, 2: home, 3: sleep, 4: occupied, 5: vacant, 6: eco)
 * @example { "d2d_slave_config": [{ "id": 1, "enable": 1, "d2d_cmd": "0000", "action": { "action_type": 0, "system_status": 1 } }] }
 * @example { "d2d_slave_config": [{ "id": 1, "enable": 1, "d2d_cmd": "0000", "action": { "action_type": 1, "plan_type": 1 } }] }
 */
function setD2DSlaveConfig(d2d_slave_config) {
    var id = d2d_slave_config.id;
    var enable = d2d_slave_config.enable;
    var d2d_cmd = d2d_slave_config.d2d_cmd;
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
    if (action_type_values.indexOf(action.action_type) === -1) {
        throw new Error("d2d_slave_config.action.action_type must be one of " + action_type_values.join(", "));
    }

    var data = 0x00;
    // system status mode
    if (getValue(action_type_map, action.action_type) === 0) {
        var action_map = { 0: "off", 1: "on" };
        var action_values = getValues(action_map);
        if (action_values.indexOf(action.system_status) === -1) {
            throw new Error("d2d_slave_config.action.system_status must be one of " + action_values.join(", "));
        }
        data = (getValue(action_type_map, action.action_type) << 4) | getValue(action_map, action.system_status);
    }
    if (getValue(action_type_map, action.action_type) === 1) {
        var action_map = { 0: "wake", 1: "away", 2: "home", 3: "sleep", 4: "occupied", 5: "vacant", 6: "eco" };
        var action_values = getValues(action_map);
        if (action_values.indexOf(action.plan_type) === -1) {
            throw new Error("d2d_slave_config.action.plan_type must be one of " + action_values.join(", "));
        }
        data = (getValue(action_type_map, action.action_type) << 4) | getValue(action_map, action.plan_type);
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
 * @param {number} control_permissions values: (0: thermostat, 1: remote control)
 * @example { "control_permissions": 0 }
 */
function setControlPermissions(control_permissions) {
    var control_permission_map = { 0: "thermostat", 1: "remote control" };
    var control_permission_values = getValues(control_permission_map);
    if (control_permission_values.indexOf(control_permissions) === -1) {
        throw new Error("control_permissions must be one of " + control_permission_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xf6);
    buffer.writeUInt8(getValue(control_permission_map, control_permissions));
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
 * set fan control during heating
 * @since v2.0
 * @param {number} fan_control_during_heating values: (0: furnace, 1: thermostat)
 * @example { "fan_control_during_heating": 0 }
 */
function setFanControlDuringHeating(fan_control_during_heating) {
    var mode_map = { 0: "furnace", 1: "thermostat" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(fan_control_during_heating) === -1) {
        throw new Error("fan_control_during_heating must be one of " + mode_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x62);
    buffer.writeUInt8(getValue(mode_map, fan_control_during_heating));
    return buffer.toBytes();
}

/**
 * set temperature threshold alarm configuration
 * @param {object} temperature_alarm_config
 * @param {number} temperature_alarm_config.alarm_type values: (0: temperature threshold, 1: continuous low temperature, 2: continuous high temperature)
 * @param {number} temperature_alarm_config.condition values: (0: disable, 1: below, 2: above, 3: between, 4: outside)
 * @param {number} temperature_alarm_config.min condition=(below, within, outside)
 * @param {number} temperature_alarm_config.max condition=(above, within, outside)
 * @param {number} temperature_alarm_config.lock_time unit: minute
 * @param {number} temperature_alarm_config.continue_time unit: minute
 * @example { "temperature_alarm_config": { "alarm_type": 0, "condition": 1, "min": 10, "max": 20, "continue_time": 10 } }
 */
function setTemperatureAlarmConfig(temperature_alarm_config) {
    var condition = temperature_alarm_config.condition;
    var alarm_type = temperature_alarm_config.alarm_type;
    var min = temperature_alarm_config.min;
    var max = temperature_alarm_config.max;
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

    var data = getValue(condition_map, condition) | (getValue(alarm_type_map, alarm_type) << 3);

    var buffer = new Buffer(6);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x06);
    buffer.writeUInt8(data);
    buffer.writeInt16LE(min * 10);
    buffer.writeInt16LE(max * 10);
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
 * set unlock config
 * @since v2.0
 * @param {object} unlock_config
 * @param {number} unlock_config.time unit: second
 * @param {number} unlock_config.power_button values: (0: disable, 1: enable)
 * @param {number} unlock_config.temperature_up_button values: (0: disable, 1: enable)
 * @param {number} unlock_config.temperature_down_button values: (0: disable, 1: enable)
 * @param {number} unlock_config.fan_mode_button values: (0: disable, 1: enable)
 * @param {number} unlock_config.temperature_control_mode_button values: (0: disable, 1: enable)
 * @example { "unlock_config": { "time": 10, "power_button": 1, "temperature_up_button": 1, "temperature_down_button": 1, "fan_mode_button": 1, "temperature_control_mode_button": 1 } }
 */
function setUnlockConfig(unlock_config) {
    var time = unlock_config.time;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);

    var data = 0x00;
    var bit_offset = { power_button: 0, temperature_up_button: 1, temperature_down_button: 2, fan_mode_button: 3, temperature_control_mode_button: 4 };
    for (var key in bit_offset) {
        if (key in unlock_config) {
            if (enable_values.indexOf(unlock_config[key]) === -1) {
                throw new Error("unlock_config." + key + " must be one of " + enable_values.join(", "));
            }
            data |= getValue(enable_map, unlock_config[key]) << bit_offset[key];
        }
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x5c);
    buffer.writeUInt8(data);
    buffer.writeUInt16LE(time);
    return buffer.toBytes();
}

/**
 * set temperature control forbidden config
 * @since v2.0
 * @param {object} temperature_control_forbidden_config
 * @param {number} temperature_control_forbidden_config.heat_enable values: (0: disable, 1: enable)
 * @param {number} temperature_control_forbidden_config.em_heat_enable values: (0: disable, 1: enable)
 * @param {number} temperature_control_forbidden_config.cool_enable values: (0: disable, 1: enable)
 * @param {number} temperature_control_forbidden_config.auto_enable values: (0: disable, 1: enable)
 * @example { "temperature_control_forbidden_config": { "heat_enable": 1, "em_heat_enable": 1, "cool_enable": 1, "auto_enable": 1 } }
 */
function setTemperatureControlForbiddenConfig(temperature_control_forbidden_config) {
    var bit_offset = { heat_enable: 0, em_heat_enable: 1, cool_enable: 2, auto_enable: 3 };

    var data = 0x00;
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    for (var key in bit_offset) {
        if (key in temperature_control_forbidden_config) {
            if (enable_values.indexOf(temperature_control_forbidden_config[key]) === -1) {
                throw new Error("temperature_control_forbidden_config." + key + " must be one of " + enable_values.join(", "));
            }
            data |= getValue(enable_map, temperature_control_forbidden_config[key]) << bit_offset[key];
        }
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x5d);
    buffer.writeUInt8(data);
    return buffer.toBytes();
}

/**
 * set plan config (target temperature dual)
 * @param {object} dual_plan_config
 * @param {number} dual_plan_config.type values: (0: wake, 1: away, 2: home, 3: sleep, 4: occupied, 5: vacant, 6: eco)
 * @param {number} dual_plan_config.temperature_control_mode values: (0: heat, 1: em heat, 2: cool, 3: auto)
 * @param {number} dual_plan_config.fan_mode values: (0: auto, 1: on, 2: circulate)
 * @param {number} dual_plan_config.heat_target_temperature
 * @param {number} dual_plan_config.heat_temperature_tolerance
 * @param {number} dual_plan_config.cool_target_temperature
 * @param {number} dual_plan_config.cool_temperature_tolerance
 * @example { "dual_temperature_plan_config": [{ "type": 0, "temperature_control_mode": 2, "fan_mode": 0, "heat_target_temperature": 20, "heat_temperature_tolerance": 1, "cool_target_temperature": 20, "cool_temperature_tolerance": 1 }]}
 */
function setPlanConfigWithDualTemperature(dual_temperature_plan_config) {
    var type = dual_temperature_plan_config.type;
    var temperature_control_mode = dual_temperature_plan_config.temperature_control_mode;
    var fan_mode = dual_temperature_plan_config.fan_mode;
    var heat_target_temperature = dual_temperature_plan_config.heat_target_temperature;
    var heat_temperature_tolerance = dual_temperature_plan_config.heat_temperature_tolerance;
    var cool_target_temperature = dual_temperature_plan_config.cool_target_temperature;
    var cool_temperature_tolerance = dual_temperature_plan_config.cool_temperature_tolerance;

    var plan_config_type_map = { 0: "wake", 1: "away", 2: "home", 3: "sleep", 4: "occupied", 5: "vacant", 6: "eco" };
    var plan_config_type_values = getValues(plan_config_type_map);
    if (plan_config_type_values.indexOf(type) === -1) {
        throw new Error("dual_temperature_plan_config.type must be one of " + plan_config_type_values.join(", "));
    }
    var plan_config_temperature_control_mode_map = { 0: "heat", 1: "em heat", 2: "cool", 3: "auto" };
    var plan_config_temperature_control_mode_values = getValues(plan_config_temperature_control_mode_map);
    if (plan_config_temperature_control_mode_values.indexOf(temperature_control_mode) === -1) {
        throw new Error("plan_config.temperature_control_mode must be one of " + plan_config_temperature_control_mode_values.join(", "));
    }
    var plan_config_fan_mode_map = { 0: "auto", 1: "on", 2: "circulate" };
    var plan_config_fan_mode_values = getValues(plan_config_fan_mode_map);
    if (plan_config_fan_mode_values.indexOf(fan_mode) === -1) {
        throw new Error("dual_temperature_plan_config.fan_mode must be one of " + plan_config_fan_mode_values.join(", "));
    }

    var heat_target_temperature_value = 0xffff;
    if ("heat_target_temperature" in dual_temperature_plan_config) {
        if (typeof heat_target_temperature !== "number") {
            throw new Error("dual_temperature_plan_config.heat_target_temperature must be a number");
        }
        heat_target_temperature_value = heat_target_temperature * 10;
    }

    var heat_temperature_tolerance_value = 0xff;
    if ("heat_temperature_tolerance" in dual_temperature_plan_config) {
        if (typeof heat_temperature_tolerance !== "number") {
            throw new Error("dual_temperature_plan_config.heat_temperature_tolerance must be a number");
        }
        heat_temperature_tolerance_value = heat_temperature_tolerance * 10;
    }

    var cool_target_temperature_value = 0xffff;
    if ("cool_target_temperature" in dual_temperature_plan_config) {
        if (typeof cool_target_temperature !== "number") {
            throw new Error("dual_temperature_plan_config.cool_target_temperature must be a number");
        }
        cool_target_temperature_value = cool_target_temperature * 10;
    }

    var cool_temperature_tolerance_value = 0xff;
    if ("cool_temperature_tolerance" in dual_temperature_plan_config) {
        if (typeof cool_temperature_tolerance !== "number") {
            throw new Error("dual_temperature_plan_config.cool_temperature_tolerance must be a number");
        }
        cool_temperature_tolerance_value = cool_temperature_tolerance * 10;
    }

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x59);
    buffer.writeUInt8(getValue(plan_config_type_map, type));
    buffer.writeUInt8(getValue(plan_config_temperature_control_mode_map, temperature_control_mode));
    buffer.writeUInt8(getValue(plan_config_fan_mode_map, fan_mode));
    buffer.writeInt16LE(heat_target_temperature_value);
    buffer.writeUInt8(heat_temperature_tolerance_value);
    buffer.writeInt16LE(cool_target_temperature_value);
    buffer.writeUInt8(cool_temperature_tolerance_value);
    return buffer.toBytes();
}

/**
 * set temperature control config
 * @param {object} single_temperature_plan_config
 * @param {number} single_temperature_plan_config.plan_type values: (0: wake, 1: away, 2: home, 3: sleep, 4: occupied, 5: vacant, 6: eco)
 * @param {number} single_temperature_plan_config.temperature_control_mode values: (0: heat, 1: em heat, 2: cool, 3: auto)
 * @param {number} single_temperature_plan_config.fan_mode values: (0: auto, 1: on, 2: circulate)
 * @param {number} single_temperature_plan_config.target_temperature
 * @param {number} single_temperature_plan_config.target_temperature_tolerance
 * @param {number} single_temperature_plan_config.temperature_control_tolerance
 * @example { "single_temperature_plan_config": [{ "type": 0, "temperature_control_mode": 2, "fan_mode": 0, "target_temperature": 20, "target_temperature_tolerance": 1, "temperature_control_tolerance": 1 }] }
 */
function setPlanConfigWithSingleTemperature(single_temperature_plan_config) {
    var plan_type = single_temperature_plan_config.plan_type;
    var temperature_control_mode = single_temperature_plan_config.temperature_control_mode;
    var fan_mode = single_temperature_plan_config.fan_mode;
    var target_temperature = single_temperature_plan_config.target_temperature;
    var target_temperature_tolerance = single_temperature_plan_config.target_temperature_tolerance;
    var temperature_control_tolerance = single_temperature_plan_config.temperature_control_tolerance;

    var plan_type_map = { 0: "wake", 1: "away", 2: "home", 3: "sleep", 4: "occupied", 5: "vacant", 6: "eco" };
    var plan_type_values = getValues(plan_type_map);
    if (plan_type_values.indexOf(plan_type) === -1) {
        throw new Error("single_temperature_plan_config._item.plan_type must be one of " + plan_type_values.join(", "));
    }
    var temperature_control_mode_map = { 0: "heat", 1: "em heat", 2: "cool", 3: "auto" };
    var temperature_control_mode_values = getValues(temperature_control_mode_map);
    if (temperature_control_mode_values.indexOf(temperature_control_mode) === -1) {
        throw new Error("single_temperature_plan_config._item.temperature_control_mode must be one of " + temperature_control_mode_values.join(", "));
    }
    var fan_mode_map = { 0: "auto", 1: "on", 2: "circulate" };
    var fan_mode_values = getValues(fan_mode_map);
    if (fan_mode_values.indexOf(fan_mode) === -1) {
        throw new Error("single_temperature_plan_config._item.fan_mode must be one of " + fan_mode_values.join(", "));
    }

    var buffer = new Buffer(9);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x5e);
    buffer.writeUInt8(getValue(plan_type_map, plan_type));
    buffer.writeUInt8(getValue(temperature_control_mode_map, temperature_control_mode));
    buffer.writeUInt8(getValue(fan_mode_map, fan_mode));
    buffer.writeInt16LE(target_temperature * 10);
    buffer.writeUInt8(target_temperature_tolerance * 10);
    buffer.writeUInt8(temperature_control_tolerance * 10);
    return buffer.toBytes();
}

/**
 * set dual temperature tolerance
 * @param {object} dual_temperature_tolerance
 * @param {number} dual_temperature_tolerance.heat_tolerance
 * @param {number} dual_temperature_tolerance.cool_tolerance
 * @example { "dual_temperature_tolerance": { "heat_tolerance": 1, "cool_tolerance": 1 } }
 */
function setDualTemperatureTolerance(dual_temperature_tolerance) {
    var heat_tolerance = dual_temperature_tolerance.heat_tolerance;
    var cool_tolerance = dual_temperature_tolerance.cool_tolerance;

    var heat_tolerance_buffer = [];
    if ("heat_tolerance" in dual_temperature_tolerance) {
        if (typeof heat_tolerance !== "number") {
            throw new Error("dual_temperature_tolerance.heat_tolerance must be a number");
        }

        var buffer = new Buffer(3);
        buffer.writeUInt8(0xf9);
        buffer.writeUInt8(0x5a);
        buffer.writeUInt8(0x00);
        buffer.writeUInt8(heat_tolerance * 10);
        heat_tolerance_buffer = buffer.toBytes();
    }

    var cool_tolerance_buffer = [];
    if ("cool_tolerance" in dual_temperature_tolerance) {
        if (typeof cool_tolerance !== "number") {
            throw new Error("dual_temperature_tolerance.cool_tolerance must be a number");
        }

        var buffer = new Buffer(4);
        buffer.writeUInt8(0xf9);
        buffer.writeUInt8(0x5a);
        buffer.writeUInt8(0x01);
        buffer.writeUInt8(cool_tolerance * 10);
        cool_tolerance_buffer = buffer.toBytes();
    }

    return heat_tolerance_buffer.concat(cool_tolerance_buffer);
}

/**
 * set temperature tolerance 2
 * @param {number} temperature_tolerance_2 unit: celsius
 * @example { "temperature_tolerance_2": 1 }
 */
function temperature_tolerance_2(temperature_tolerance_2) {
    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x57);
    buffer.writeUInt8(temperature_tolerance_2 * 10);
    return buffer.toBytes();
}

/**
 * set d2d id
 * @param {object} d2d_config
 * @param {number} d2d_config.id
 * @param {string} d2d_config.dev_eui
 * @example { "d2d_config": { "id": 1, "dev_eui": "0000000000000000" } }
 */
function setD2DId(d2d_config) {
    var id = d2d_config.id;
    var dev_eui = d2d_config.dev_eui;

    if (typeof id !== "number") {
        throw new Error("d2d_config.id must be a number");
    }
    if (id < 1 || id > 5) {
        throw new Error("d2d_config.id must be in range [1, 5]");
    }

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x3e);
    buffer.writeUInt8(id - 1);
    buffer.writeHexString(dev_eui, "0000000000000000");
    return buffer.toBytes();
}

/**
 * set target temperature dual enable
 * @param {number} target_temperature_dual_enable values: (0: disable, 1: enable)
 * @example { "target_temperature_dual_enable": 1 }
 */
function setTargetTemperatureDual(target_temperature_dual_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(target_temperature_dual_enable) === -1) {
        throw new Error("target_temperature_dual_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x58);
    buffer.writeUInt8(getValue(enable_map, target_temperature_dual_enable));
    return buffer.toBytes();
}

function getValues(map) {
    var values = [];
    if (RAW_VALUE) {
        for (var key in map) {
            values.push(parseInt(key));
        }
    } else {
        for (var key in map) {
            values.push(map[key]);
        }
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
    if (value.length !== defaultValue.length) {
        throw new Error("d2d_cmd length must be " + defaultValue.length);
    }
    this.buffer[this.offset] = parseInt(value.substr(2, 2), 16);
    this.buffer[this.offset + 1] = parseInt(value.substr(0, 2), 16);
    this.offset += 2;
};

Buffer.prototype.writeHexString = function (hex, defaultValue) {
    if (typeof hex !== "string") {
        hex = defaultValue;
    }
    if (hex.length !== defaultValue.length) {
        throw new Error("string length must be " + defaultValue.length);
    }
    this.writeBytes(hexStringToBytes(hex));
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