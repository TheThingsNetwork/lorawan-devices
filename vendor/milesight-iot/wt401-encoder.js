/**
 * Payload Encoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product WT401
 */
var RAW_VALUE = 0x00;
var WITH_QUERY_CMD = 0x00;

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

    if ("frame" in payload) {
        encoded = encoded.concat(setFrame(payload.frame));
    }
    if ("collection_interval" in payload) {
        var cmd_buffer = setCollectionInterval(payload.collection_interval);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("reporting_interval" in payload) {
        var cmd_buffer = setReportingInterval(payload.reporting_interval);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("intelligent_display_enable" in payload) {
        var cmd_buffer = setIntelligentDisplayEnable(payload.intelligent_display_enable);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("temperature_unit" in payload) {
        var cmd_buffer = setTemperatureUnit(payload.temperature_unit);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("temperature_control_mode_support" in payload) {
        var cmd_buffer = setTemperatureControlModeSupport(payload.temperature_control_mode_support);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("target_temperature_mode" in payload) {
        var cmd_buffer = setTargetTemperatureMode(payload.target_temperature_mode);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("target_temperature_resolution" in payload) {
        var cmd_buffer = setTargetTemperatureResolution(payload.target_temperature_resolution);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("system_status" in payload) {
        var cmd_buffer = setSystemStatus(payload.system_status);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("temperature_control_mode" in payload) {
        var cmd_buffer = setTemperatureControlMode(payload.temperature_control_mode);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("temperature_control_mode_in_plan_enable" in payload) {
        var cmd_buffer = setTemperatureControlModeInPlanEnable(payload.temperature_control_mode_in_plan_enable);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("target_temperature_settings" in payload) {
        var cmd_buffer = setTargetTemperature(payload.target_temperature_settings);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("dead_band" in payload) {
        var cmd_buffer = setDeadBand(payload.dead_band);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("target_temperature_range" in payload) {
        var cmd_buffer = setTargetTemperatureRange(payload.target_temperature_range);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("communicate_interval" in payload) {
        var cmd_buffer = setCommunicateInterval(payload.communicate_interval);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("button_custom_function" in payload) {
        var cmd_buffer = setButtonCustomFunction(payload.button_custom_function);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("child_lock_settings" in payload) {
        var cmd_buffer = setChildLockSettings(payload.child_lock_settings);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("fan_mode" in payload) {
        var cmd_buffer = setFanMode(payload.fan_mode);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("screen_display_settings" in payload) {
        var cmd_buffer = setScreenObjectSettings(payload.screen_display_settings);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("temperature_calibration_settings" in payload) {
        var cmd_buffer = setTemperatureCalibrationSettings(payload.temperature_calibration_settings);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("humidity_calibration_settings" in payload) {
        var cmd_buffer = setHumidityCalibrationSettings(payload.humidity_calibration_settings);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("plan_config" in payload) {
        for (var i = 0; i < payload.plan_config.length; i++) {
            var cmd_buffer = setPlanConfig(payload.plan_config[i]);
            encoded = encoded.concat(cmd_buffer);
            encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
        }
    }
    if ('system_status_control' in payload) {
		var buffer = new Buffer(7);
		buffer.writeUInt8(0x59);
		// 0：system close, 1：system open
		buffer.writeUInt8(payload.system_status_control.on_off);
		// 0：heat, 1：em heat, 2：cool, 3：auto
		buffer.writeUInt8(payload.system_status_control.mode);
		buffer.writeInt16LE(payload.system_status_control.temperature1 * 100);
		buffer.writeInt16LE(payload.system_status_control.temperature2 * 100);
        encoded = encoded.concat(buffer.toBytes());
		encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(buffer.toBytes())) : encoded;
	}
    if ("data_sync_to_peer" in payload) {
        var cmd_buffer = setDataSyncToPeer(payload.data_sync_to_peer);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("data_sync_timeout" in payload) {
        var cmd_buffer = setDataSyncTimeout(payload.data_sync_timeout);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("unlock_combination_button_settings" in payload) {
        var cmd_buffer = setUnlockCombinationButtonSettings(payload.unlock_combination_button_settings);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("temporary_unlock_settings" in payload) {
        var cmd_buffer = setTemporaryUnlockSettings(payload.temporary_unlock_settings);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("pir_config" in payload) {
        var cmd_buffer = setPirConfig(payload.pir_config);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("ble_enable" in payload) {
        var cmd_buffer = setBleEnable(payload.ble_enable);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("external_temperature" in payload) {
        var cmd_buffer = setExternalTemperature(payload.external_temperature);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("external_humidity" in payload) {
        var cmd_buffer = setExternalHumidity(payload.external_humidity);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("fan_support_mode" in payload) {
        var cmd_buffer = setFanSupportMode(payload.fan_support_mode);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("ble_name" in payload) {
        var cmd_buffer = setBleName(payload.ble_name);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("ble_pair_info" in payload) {
        var cmd_buffer = setBlePairInfo(payload.ble_pair_info);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("communication_mode" in payload) {
        var cmd_buffer = setCommunicationMode(payload.communication_mode);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("daylight_saving_time" in payload) {
        var cmd_buffer = setDaylightSavingTimeSettings(payload.daylight_saving_time);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("time_zone" in payload) {
        var cmd_buffer = setTimeZone(payload.time_zone);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("reset_ble_name" in payload) {
        var cmd_buffer = resetBleName(payload.reset_ble_name);
        encoded = encoded.concat(cmd_buffer);
    }
    if ("trigger_fan_alarm" in payload) {
        var cmd_buffer = triggerFanAlarm(payload.trigger_fan_alarm);
        encoded = encoded.concat(cmd_buffer);
    }
    if ("release_fan_alarm" in payload) {
        var cmd_buffer = releaseFanAlarm(payload.release_fan_alarm);
        encoded = encoded.concat(cmd_buffer);
    }
    if ("trigger_freeze_alarm" in payload) {
        var cmd_buffer = triggerFreezeAlarm(payload.trigger_freeze_alarm);
        encoded = encoded.concat(cmd_buffer);
    }
    if ("release_freeze_alarm" in payload) {
        var cmd_buffer = releaseFreezeAlarm(payload.release_freeze_alarm);
        encoded = encoded.concat(cmd_buffer);
    }
    if ("peer_ble_pair_info" in payload) {
        var cmd_buffer = setPeerBlePairInfo(payload.peer_ble_pair_info);
        encoded = encoded.concat(cmd_buffer);
    }
    if ("trigger_no_wire_alarm" in payload) {
        var cmd_buffer = triggerNoWireAlarm(payload.trigger_no_wire_alarm);
        encoded = encoded.concat(cmd_buffer);
    }
    if ("release_no_wire_alarm" in payload) {
        var cmd_buffer = releaseNoWireAlarm(payload.release_no_wire_alarm);
        encoded = encoded.concat(cmd_buffer);
    }
    if ("trigger_window_open_alarm" in payload) {
        var cmd_buffer = triggerWindowOpenAlarm(payload.trigger_window_open_alarm);
        encoded = encoded.concat(cmd_buffer);
    }
    if ("release_window_open_alarm" in payload) {
        var cmd_buffer = releaseWindowOpenAlarm(payload.release_window_open_alarm);
        encoded = encoded.concat(cmd_buffer);
    }
    if ("trigger_filter_alarm" in payload) {
        var cmd_buffer = triggerFilterAlarm(payload.trigger_filter_alarm);
        encoded = encoded.concat(cmd_buffer);
    }
    if ("release_filter_alarm" in payload) {
        var cmd_buffer = releaseFilterAlarm(payload.release_filter_alarm);
        encoded = encoded.concat(cmd_buffer);
    }
    if ("insert_plan" in payload) {
        var cmd_buffer = insertPlan(payload.insert_plan);
        encoded = encoded.concat(cmd_buffer);
    }
    if ("trigger_ble_pair" in payload) {
        var cmd_buffer = triggerBlePair(payload.trigger_ble_pair);
        encoded = encoded.concat(cmd_buffer);
    }
    if ("cancel_ble_pair" in payload) {
        var cmd_buffer = cancelBlePair(payload.cancel_ble_pair);
        encoded = encoded.concat(cmd_buffer);
    }
    if ("remove_plan" in payload) {
        var cmd_buffer = removePlan(payload.remove_plan);
        encoded = encoded.concat(cmd_buffer);
    }
    if ("reconnect" in payload) {
        var cmd_buffer = reconnect(payload.reconnect);
        encoded = encoded.concat(cmd_buffer);
    }
    if ("synchronize_time" in payload) {
        var cmd_buffer = synchronizeTime(payload.synchronize_time);
        encoded = encoded.concat(cmd_buffer);
    }
    if ("query_device_status" in payload) {
        var cmd_buffer = queryDeviceStatus(payload.query_device_status);
        encoded = encoded.concat(cmd_buffer);
    }
    if ("reboot" in payload) {
        var cmd_buffer = reboot(payload.reboot);
        encoded = encoded.concat(cmd_buffer);
    }

    return encoded;
}

/**
 * Set frame
 * @param {number} frame values: (0: normal, 1: debug)
 * @example { "frame": 0 }
 */
function setFrame(frame) {
    var buffer = new Buffer(2);
    buffer.writeUInt8(0xfe);
    buffer.writeUInt8(frame);
    return buffer.toBytes();
}

/**
 * Set collection interval
 * @param {object} collection_interval
 * @param {number} collection_interval.unit values: (0: second, 1: minute)
 * @param {number} collection_interval.seconds_of_time unit: second, range: [1, 2600], default: 30s
 * @param {number} collection_interval.minutes_of_time unit: minute, range: [1, 1440], default: 1min
 * @example { "collection_interval": { "unit": 0, "seconds_of_time": 300 } }
 */
function setCollectionInterval(collection_interval) {
    var unit = collection_interval.unit;
    var seconds_of_time = collection_interval.seconds_of_time;
    var minutes_of_time = collection_interval.minutes_of_time;

    var unit_map = { 0: "second", 1: "minute" };
    var unit_values = getValues(unit_map);
    if (unit_values.indexOf(unit) === -1) {
        throw new Error("collection_interval.unit must be one of " + unit_values.join(", "));
    }
    if (getValue(unit_map, unit) === 0 && (seconds_of_time < 1 || seconds_of_time > 3600)) {
        throw new Error("collection_interval.seconds_of_time must be between 1 and 3600 when collection_interval.unit is second");
    }
    if (getValue(unit_map, unit) === 1 && (minutes_of_time < 1 || minutes_of_time > 1440)) {
        throw new Error("collection_interval.minutes_of_time must be between 1 and 1440 when collection_interval.unit is minute");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0x60);
    buffer.writeUInt8(getValue(unit_map, unit));
    buffer.writeUInt16LE(getValue(unit_map, unit) === 0 ? seconds_of_time : minutes_of_time);
    return buffer.toBytes();
}

/**
 * Set report interval
 * @param {object} reporting_interval
 * @param {object} reporting_interval.mode values: (0: ble, 1: lora, 2: ble_and_lora, 3: power_bus_and_lora)
 * @param {number} reporting_interval.minutes_of_time unit: minute, range: [1, 1440], default: 10min
 * @example { "reporting_interval": { "mode": 0, "minutes_of_time": 10 } }
 */
function setReportingInterval(reporting_interval) {
    var mode = reporting_interval.mode;
    var minutes_of_time = reporting_interval.minutes_of_time;

    var mode_map = { 0: "ble", 1: "lora", 2: "ble_and_lora", 3: "power_bus_and_lora" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(mode) === -1) {
        throw new Error("reporting_interval.mode must be one of " + mode_values.join(", "));
    }

    if ((minutes_of_time < 1 || minutes_of_time > 1440)) {
        throw new Error("reporting_interval.minutes_of_time must be between 1 and 1440 when reporting_interval.mode is ble");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0x61);
    buffer.writeUInt8(getValue(mode_map, mode));
    buffer.writeUInt8(0x01); // minute
    buffer.writeUInt16LE(minutes_of_time);
    return buffer.toBytes();
}

/**
 * Set intelligent display enable
 * @param {number} intelligent_display_enable values: (0: disable, 1: enable)
 * @example { "intelligent_display_enable": 1 }
 */
function setIntelligentDisplayEnable(intelligent_display_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(intelligent_display_enable) === -1) {
        throw new Error("intelligent_display_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x62);
    buffer.writeUInt8(getValue(enable_map, intelligent_display_enable));
    return buffer.toBytes();
}

/**
 * Set temperature unit
 * @param {number} temperature_unit values: (0: celsius, 1: fahrenheit)
 * @example { "temperature_unit": 0 }
 */
function setTemperatureUnit(temperature_unit) {
    var unit_map = { 0: "celsius", 1: "fahrenheit" };
    var unit_values = getValues(unit_map);
    if (unit_values.indexOf(temperature_unit) === -1) {
        throw new Error("temperature_unit must be one of " + unit_values.join(", "));
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x63);
    buffer.writeUInt8(getValue(unit_map, temperature_unit));
    return buffer.toBytes();
}

/**
 * Set temperature control mode support
 * @param {object} temperature_control_mode_support
 * @param {number} temperature_control_mode_support.heat values: (0: disable, 1: enable)
 * @param {number} temperature_control_mode_support.em_heat values: (0: disable, 1: enable)
 * @param {number} temperature_control_mode_support.cool values: (0: disable, 1: enable)
 * @param {number} temperature_control_mode_support.auto values: (0: disable, 1: enable)
 * @example { "temperature_control_mode_support": { "heat": 1, "em_heat": 1, "cool": 1, "auto": 1 } }
 */
function setTemperatureControlModeSupport(temperature_control_mode_support) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);

    var data = 0x00;
    var mode_bit_offset = { heat: 0, em_heat: 1, cool: 2, auto: 3 };
    for (var mode in mode_bit_offset) {
        if (enable_values.indexOf(temperature_control_mode_support[mode]) === -1) {
            throw new Error("temperature_control_mode_support[" + mode + "] must be one of " + enable_values.join(", "));
        }
        data |= getValue(enable_map, temperature_control_mode_support[mode]) << mode_bit_offset[mode];
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x64);
    buffer.writeUInt8(data);
    return buffer.toBytes();
}

/**
 * Set target temperature mode
 * @param {number} target_temperature_mode values: (0: single_point, 1: dual_point)
 * @example { "target_temperature_mode": 0 }
 */
function setTargetTemperatureMode(target_temperature_mode) {
    var mode_map = { 0: "single_point", 1: "dual_point" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(target_temperature_mode) === -1) {
        throw new Error("target_temperature_mode must be one of " + mode_values.join(", "));
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x65);
    buffer.writeUInt8(getValue(mode_map, target_temperature_mode));
    return buffer.toBytes();
}

/**
 * Set target temperature resolution
 * @param {number} target_temperature_resolution values: (0: 0.5, 1: 1)
 * @example { "target_temperature_resolution": 0 }
 */
function setTargetTemperatureResolution(target_temperature_resolution) {
    var resolution_map = { 0: "0.5", 1: "1" };
    var resolution_values = getValues(resolution_map);
    if (resolution_values.indexOf(target_temperature_resolution) === -1) {
        throw new Error("target_temperature_resolution must be one of " + resolution_values.join(", "));
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x66);
    buffer.writeUInt8(getValue(resolution_map, target_temperature_resolution));
    return buffer.toBytes();
}

/**
 * Set system status
 * @param {number} system_status values: (0: off, 1: on)
 * @example { "system_status": 0 }
 */
function setSystemStatus(system_status) {
    var on_off_status = { 0: "off", 1: "on" };
    var on_off_values = getValues(on_off_status);
    if (on_off_values.indexOf(system_status) === -1) {
        throw new Error("system_status must be one of " + on_off_values.join(", "));
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x67);
    buffer.writeUInt8(getValue(on_off_status, system_status));
    return buffer.toBytes();
}

/**
 * Set temperature control mode
 * @param {number} temperature_control_mode values: (0: heat, 1: em_heat, 2: cool, 3: auto)
 * @example { "temperature_control_mode": 0 }
 */
function setTemperatureControlMode(temperature_control_mode) {
    var mode_map = { 0: "heat", 1: "em_heat", 2: "cool", 3: "auto" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(temperature_control_mode) === -1) {
        throw new Error("temperature_control_mode must be one of " + mode_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0x68);
    buffer.writeUInt8(0x00);
    buffer.writeUInt8(getValue(mode_map, temperature_control_mode));
    return buffer.toBytes();
}

/**
 * Set temperature control mode in plan enable
 * @param {number} temperature_control_mode_in_plan_enable values: (0: disable, 1: enable)
 * @example { "temperature_control_mode_in_plan_enable": 0 }
 */
function setTemperatureControlModeInPlanEnable(temperature_control_mode_in_plan_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(temperature_control_mode_in_plan_enable) === -1) {
        throw new Error("temperature_control_mode_in_plan_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0x68);
    buffer.writeUInt8(0x01);
    buffer.writeUInt8(getValue(enable_map, temperature_control_mode_in_plan_enable));
    return buffer.toBytes();
}

/**
 * Set target temperature
 * @param {object} target_temperature_settings
 * @param {number} target_temperature_settings.heat unit: celsius, range: [5, 35]
 * @param {number} target_temperature_settings.em_heat unit: celsius, range: [5, 35]
 * @param {number} target_temperature_settings.cool unit: celsius, range: [5, 35]
 * @param {number} target_temperature_settings.auto unit: celsius, range: [5, 35]
 * @param {number} target_temperature_settings.auto_heat unit: celsius, range: [5, 35]
 * @param {number} target_temperature_settings.auto_cool unit: celsius, range: [5, 35]
 * @example { "target_temperature_settings": { "heat": 20, "em_heat": 20, "cool": 20, "auto": 20 } }
 */
function setTargetTemperature(target_temperature_settings) {
    var data = [];
    if ("heat" in target_temperature_settings) {
        if (target_temperature_settings.heat < 5 || target_temperature_settings.heat > 35) {
            throw new Error("target_temperature_settings.heat must be between 5 and 35");
        }
        var buffer = new Buffer(4);
        buffer.writeUInt8(0x69);
        buffer.writeUInt8(0x00); // heat mode
        buffer.writeInt16LE(target_temperature_settings.heat * 100);
        data = data.concat(buffer.toBytes());
    }
    if ("em_heat" in target_temperature_settings) {
        if (target_temperature_settings.em_heat < 5 || target_temperature_settings.em_heat > 35) {
            throw new Error("target_temperature_settings.em_heat must be between 5 and 35");
        }
        var buffer = new Buffer(4);
        buffer.writeUInt8(0x69);
        buffer.writeUInt8(0x01); // em heat mode
        buffer.writeInt16LE(target_temperature_settings.em_heat * 100);
        data = data.concat(buffer.toBytes());
    }
    if ("cool" in target_temperature_settings) {
        if (target_temperature_settings.cool < 5 || target_temperature_settings.cool > 35) {
            throw new Error("target_temperature_settings.cool must be between 5 and 35");
        }
        var buffer = new Buffer(4);
        buffer.writeUInt8(0x69);
        buffer.writeUInt8(0x02); // cool mode
        buffer.writeInt16LE(target_temperature_settings.cool * 100);
        data = data.concat(buffer.toBytes());
    }
    if ("auto" in target_temperature_settings) {
        if (target_temperature_settings.auto < 5 || target_temperature_settings.auto > 35) {
            throw new Error("target_temperature_settings.auto must be between 5 and 35");
        }
        var buffer = new Buffer(4);
        buffer.writeUInt8(0x69);
        buffer.writeUInt8(0x03); // auto mode
        buffer.writeInt16LE(target_temperature_settings.auto * 100);
        data = data.concat(buffer.toBytes());
    }
    if ("auto_heat" in target_temperature_settings) {
        if (target_temperature_settings.auto_heat < 5 || target_temperature_settings.auto_heat > 35) {
            throw new Error("target_temperature_settings.auto_heat must be between 5 and 35");
        }
        var buffer = new Buffer(4);
        buffer.writeUInt8(0x69);
        buffer.writeUInt8(0x04); // auto heat mode
        buffer.writeInt16LE(target_temperature_settings.auto_heat * 100);
        data = data.concat(buffer.toBytes());
    }
    if ("auto_cool" in target_temperature_settings) {
        if (target_temperature_settings.auto_cool < 5 || target_temperature_settings.auto_cool > 35) {
            throw new Error("target_temperature_settings.auto_cool must be between 5 and 35");
        }
        var buffer = new Buffer(4);
        buffer.writeUInt8(0x69);
        buffer.writeUInt8(0x05); // auto cool mode
        buffer.writeInt16LE(target_temperature_settings.auto_cool * 100);
        data = data.concat(buffer.toBytes());
    }
    return data;
}

/**
 * Set dead band
 * @param {number} dead_band unit: celsius, range: [1, 30]
 * @example { "dead_band": 1 }
 */
function setDeadBand(dead_band) {
    if (dead_band < 1 || dead_band > 30) {
        throw new Error("dead_band must be between 1 and 30");
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x6a);
    buffer.writeInt16LE(dead_band * 100);
    return buffer.toBytes();
}

/**
 * Set target temperature range
 * @param {object} target_temperature_range
 * @param {object} target_temperature_range.heat
 * @param {number} target_temperature_range.heat.min unit: celsius, range: [5, 35]
 * @param {number} target_temperature_range.heat.max unit: celsius, range: [5, 35]
 * @param {object} target_temperature_range.em_heat
 * @param {number} target_temperature_range.em_heat.min unit: celsius, range: [5, 35]
 * @param {number} target_temperature_range.em_heat.max unit: celsius, range: [5, 35]
 * @param {object} target_temperature_range.cool
 * @param {number} target_temperature_range.cool.min unit: celsius, range: [5, 35]
 * @param {number} target_temperature_range.cool.max unit: celsius, range: [5, 35]
 * @param {object} target_temperature_range.auto
 * @param {number} target_temperature_range.auto.min unit: celsius, range: [5, 35]
 * @param {number} target_temperature_range.auto.max unit: celsius, range: [5, 35]
 * @example { "target_temperature_range": { "heat": { "min": 5, "max": 35 }, "em_heat": { "min": 5, "max": 35 }, "cool": { "min": 5, "max": 35 }, "auto": { "min": 5, "max": 35 } } }
 */
function setTargetTemperatureRange(target_temperature_range) {
    var data = [];
    if ("heat" in target_temperature_range) {
        if (target_temperature_range.heat.min < 5 || target_temperature_range.heat.min > 35) {
            throw new Error("target_temperature_range.heat.min must be between 5 and 35");
        }
        if (target_temperature_range.heat.max < 5 || target_temperature_range.heat.max > 35) {
            throw new Error("target_temperature_range.heat.max must be between 5 and 35");
        }
        var buffer = new Buffer(6);
        buffer.writeUInt8(0x6b);
        buffer.writeUInt8(0x00); // heat mode
        buffer.writeInt16LE(target_temperature_range.heat.min * 100);
        buffer.writeInt16LE(target_temperature_range.heat.max * 100);
        data = data.concat(buffer.toBytes());
    }
    if ("em_heat" in target_temperature_range) {
        if (target_temperature_range.em_heat.min < 5 || target_temperature_range.em_heat.min > 35) {
            throw new Error("target_temperature_range.em_heat.min must be between 5 and 35");
        }
        if (target_temperature_range.em_heat.max < 5 || target_temperature_range.em_heat.max > 35) {
            throw new Error("target_temperature_range.em_heat.max must be between 5 and 35");
        }
        var buffer = new Buffer(6);
        buffer.writeUInt8(0x6b);
        buffer.writeUInt8(0x01); // em heat mode
        buffer.writeInt16LE(target_temperature_range.em_heat.min * 100);
        buffer.writeInt16LE(target_temperature_range.em_heat.max * 100);
        data = data.concat(buffer.toBytes());
    }
    if ("cool" in target_temperature_range) {
        if (target_temperature_range.cool.min < 5 || target_temperature_range.cool.min > 35) {
            throw new Error("target_temperature_range.cool.min must be between 5 and 35");
        }
        if (target_temperature_range.cool.max < 5 || target_temperature_range.cool.max > 35) {
            throw new Error("target_temperature_range.cool.max must be between 5 and 35");
        }
        var buffer = new Buffer(6);
        buffer.writeUInt8(0x6b);
        buffer.writeUInt8(0x02); // cool mode
        buffer.writeInt16LE(target_temperature_range.cool.min * 100);
        buffer.writeInt16LE(target_temperature_range.cool.max * 100);
        data = data.concat(buffer.toBytes());
    }
    if ("auto" in target_temperature_range) {
        if (target_temperature_range.auto.min < 5 || target_temperature_range.auto.min > 35) {
            throw new Error("target_temperature_range.auto.min must be between 5 and 35");
        }
        if (target_temperature_range.auto.max < 5 || target_temperature_range.auto.max > 35) {
            throw new Error("target_temperature_range.auto.max must be between 5 and 35");
        }
        var buffer = new Buffer(6);
        buffer.writeUInt8(0x6b);
        buffer.writeUInt8(0x03); // auto mode
        buffer.writeInt16LE(target_temperature_range.auto.min * 100);
        buffer.writeInt16LE(target_temperature_range.auto.max * 100);
        data = data.concat(buffer.toBytes());
    }

    return data;
}

/**
 * Set communicate interval
 * @param {object} communicate_interval
 * @param {object} communicate_interval.mode values: (0: ble, 1: lora, 2: ble_and_lora, 3: power_bus_and_lora)
 * @param {number} communicate_interval.minutes_of_time unit: minute, range: [1, 30]
 * @example { "communicate_interval": { "mode": 0, "minutes_of_time": 10 } }
 */
function setCommunicateInterval(communicate_interval) {
    var mode = communicate_interval.mode;
    var minutes_of_time = communicate_interval.minutes_of_time || 0;

    var mode_map = { 0: "ble", 1: "lora", 2: "ble_and_lora", 3: "power_bus_and_lora" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(mode) === -1) {
        throw new Error("communicate_interval.mode must be one of " + mode_values.join(", "));
    }
    if (minutes_of_time < 1 || minutes_of_time > 30) {
        throw new Error("communicate_interval.minutes_of_time must be between 1 and 30");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0x6c);
    buffer.writeUInt8(getValue(mode_map, mode));
    buffer.writeUInt8(0x01); // minute
    buffer.writeUInt16LE(minutes_of_time);
    return buffer.toBytes();
}

/**
 * Set button custom function
 * @param {object} button_custom_function
 * @param {number} button_custom_function.enable values: (0: disable, 1: enable)
 * @param {number} button_custom_function.button_1 values: (1: temperature_control_mode, 2: fan_mode, 3: plan_switch, 4: status_report, 5: release_filter_alarm, 6: button_value, 7: temperature_unit_switch)
 * @param {number} button_custom_function.button_2 values: (1: temperature_control_mode, 2: fan_mode, 3: plan_switch, 4: status_report, 5: release_filter_alarm, 6: button_value, 7: temperature_unit_switch)
 * @param {number} button_custom_function.button_3 values: (1: temperature_control_mode, 2: fan_mode, 3: plan_switch, 4: status_report, 5: release_filter_alarm, 6: button_value, 7: temperature_unit_switch)
 * @example { "button_custom_function": { "enable": 0, "button_1": 0, "button_2": 0, "button_3": 0 } }
 */
function setButtonCustomFunction(button_custom_function) {
    var data = [];
    if ("enable" in button_custom_function) {
        var enable_map = { 0: "disable", 1: "enable" };
        var enable_values = getValues(enable_map);
        if (enable_values.indexOf(button_custom_function.enable) === -1) {
            throw new Error("button_custom_function.enable must be one of " + enable_values.join(", "));
        }

        var buffer = new Buffer(3);
        buffer.writeUInt8(0x71);
        buffer.writeUInt8(0x00); // enable
        buffer.writeUInt8(getValue(enable_map, button_custom_function.enable));
        data = data.concat(buffer.toBytes());
    }
    var function_map = { 1: "temperature_control_mode", 2: "fan_mode", 3: "plan_switch", 4: "status_report", 5: "release_filter_alarm", 6: "button_value", 7: "temperature_unit_switch" };
    var function_values = getValues(function_map);
    if ("button_1" in button_custom_function) {
        if (function_values.indexOf(button_custom_function.button_1) === -1) {
            throw new Error("button_custom_function.button_1 must be one of " + function_values.join(", "));
        }

        var buffer = new Buffer(3);
        buffer.writeUInt8(0x71);
        buffer.writeUInt8(0x01); // button 1
        buffer.writeUInt8(getValue(function_map, button_custom_function.button_1));
        data = data.concat(buffer.toBytes());
    }
    if ("button_2" in button_custom_function) {
        if (function_values.indexOf(button_custom_function.button_2) === -1) {
            throw new Error("button_custom_function.button_2 must be one of " + function_values.join(", "));
        }

        var buffer = new Buffer(3);
        buffer.writeUInt8(0x71);
        buffer.writeUInt8(0x02); // button 2
        buffer.writeUInt8(getValue(function_map, button_custom_function.button_2));
        data = data.concat(buffer.toBytes());
    }
    var function_2_map = { 0: "system_status", 3: "plan_switch", 4: "status_report", 5: "release_filter_alarm", 6: "button_value", 7: "temperature_unit_switch" };
    var function_2_values = getValues(function_2_map);
    if ("button_3" in button_custom_function) {
        if (function_2_values.indexOf(button_custom_function.button_3) === -1) {
            throw new Error("button_custom_function.button_3 must be one of " + function_2_values.join(", "));
        }

        var buffer = new Buffer(3);
        buffer.writeUInt8(0x71);
        buffer.writeUInt8(0x03); // button 3s
        buffer.writeUInt8(getValue(function_2_map, button_custom_function.button_3));
        data = data.concat(buffer.toBytes());
    }
    return data;
}

/**
 * Set child lock settings
 * @param {object} child_lock_settings
 * @param {number} child_lock_settings.enable values: (0: disable, 1: enable)
 * @param {number} child_lock_settings.temperature_up values: (0: disable, 1: enable)
 * @param {number} child_lock_settings.temperature_down values: (0: disable, 1: enable)
 * @param {number} child_lock_settings.system_on_off values: (0: disable, 1: enable)
 * @param {number} child_lock_settings.fan_mode values: (0: disable, 1: enable)
 * @param {number} child_lock_settings.temperature_control_mode values: (0: disable, 1: enable)
 * @param {number} child_lock_settings.reboot_reset values: (0: disable, 1: enable)
 * @param {number} child_lock_settings.power_on_off values: (0: disable, 1: enable)
 * @param {number} child_lock_settings.cancel_pair values: (0: disable, 1: enable)
 * @param {number} child_lock_settings.plan_switch values: (0: disable, 1: enable)
 * @param {number} child_lock_settings.status_report values: (0: disable, 1: enable)
 * @param {number} child_lock_settings.release_filter_alarm values: (0: disable, 1: enable)
 * @param {number} child_lock_settings.button_report_1 values: (0: disable, 1: enable)
 * @param {number} child_lock_settings.button_report_2 values: (0: disable, 1: enable)
 * @param {number} child_lock_settings.button_report_3 values: (0: disable, 1: enable)
 * @param {number} child_lock_settings.temperature_unit_switch values: (0: disable, 1: enable)
 * @example { "child_lock_settings": { "enable": 0, "button_1": 0, "button_2": 0, "button_3": 0 } }
 */
function setChildLockSettings(child_lock_settings) {
    var enable = child_lock_settings.enable;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("child_lock_settings.enable must be one of " + enable_values.join(", "));
    }

    var data = 0x00;
    var button_bit_offset = { temperature_up: 0, temperature_down: 1, system_on_off: 2, fan_mode: 3, temperature_control_mode: 4, reboot_reset: 5, power_on_off: 6, cancel_pair: 7, plan_switch: 8, status_report: 9, release_filter_alarm: 10, button_report_1: 11, button_report_2: 12, button_report_3: 13, temperature_unit_switch: 14 };
    for (var button in button_bit_offset) {
        if (button in child_lock_settings) {
            if (enable_values.indexOf(child_lock_settings[button]) === -1) {
                throw new Error("child_lock_settings." + button + " must be one of " + enable_values.join(", "));
            }
            data |= getValue(enable_map, child_lock_settings[button]) << button_bit_offset[button];
        }
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0x72);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt16LE(data);
    return buffer.toBytes();
}

/**
 * Set fan mode
 * @param {number} fan_mode values: (0: auto, 1: circulate, 2: on, 3: low, 4: medium, 5: high)
 * @example { "fan_mode": 0 }
 */
function setFanMode(fan_mode) {
    var fan_mode_map = { 0: "auto", 1: "circulate", 2: "on", 3: "low", 4: "medium", 5: "high" };
    var fan_mode_values = getValues(fan_mode_map);
    if (fan_mode_values.indexOf(fan_mode) === -1) {
        throw new Error("fan_mode must be one of " + fan_mode_values.join(", "));
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x74);
    buffer.writeUInt8(getValue(fan_mode_map, fan_mode));
    return buffer.toBytes();
}

/**
 * Set screen object settings
 * @param {object} screen_display_settings
 * @param {number} screen_display_settings.plan_name values: (0: disable, 1: enable)
 * @param {number} screen_display_settings.ambient_temperature values: (0: disable, 1: enable)
 * @param {number} screen_display_settings.ambient_humidity values: (0: disable, 1: enable)
 * @param {number} screen_display_settings.target_temperature values: (0: disable, 1: enable)
 * @example { "screen_display_settings": { "plan_name": 0, "ambient_temperature": 0, "ambient_humidity": 0, "target_temperature": 0 } }
 */
function setScreenObjectSettings(screen_display_settings) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);

    var data = 0x00;
    var object_bit_offset = { plan_name: 0, ambient_temperature: 1, ambient_humidity: 2, target_temperature: 3 };
    for (var object in object_bit_offset) {
        if (object in screen_display_settings) {
            if (enable_values.indexOf(screen_display_settings[object]) === -1) {
                throw new Error("screen_display_settings." + object + " must be one of " + enable_values.join(", "));
            }
            data |= getValue(enable_map, screen_display_settings[object]) << object_bit_offset[object];
        }
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x75);
    buffer.writeUInt8(data);
    return buffer.toBytes();
}

/**
 * Set temperature calibration settings
 * @param {object} temperature_calibration_settings
 * @param {number} temperature_calibration_settings.enable values: (0: disable, 1: enable)
 * @param {number} temperature_calibration_settings.calibration_value unit: celsius, range: [-80, 80]
 * @example { "temperature_calibration_settings": { "enable": 0, "calibration_value": 0 } }
 */
function setTemperatureCalibrationSettings(temperature_calibration_settings) {
    var enable = temperature_calibration_settings.enable;
    var calibration_value = temperature_calibration_settings.calibration_value;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("temperature_calibration_settings.enable must be one of " + enable_values.join(", "));
    }
    if (calibration_value < -80 || calibration_value > 80) {
        throw new Error("temperature_calibration_settings.calibration_value must be between -80 and 80");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0x76);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeInt16LE(calibration_value * 100);
    return buffer.toBytes();
}

/**
 * Set humidity calibration settings
 * @param {object} humidity_calibration_settings
 * @param {number} humidity_calibration_settings.enable values: (0: disable, 1: enable)
 * @param {number} humidity_calibration_settings.calibration_value unit: %RH, range: [-100, 100]
 * @example { "humidity_calibration_settings": { "enable": 0, "calibration_value": 0 } }
 */
function setHumidityCalibrationSettings(humidity_calibration_settings) {
    var enable = humidity_calibration_settings.enable;
    var calibration_value = humidity_calibration_settings.calibration_value;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("humidity_calibration_settings.enable must be one of " + enable_values.join(", "));
    }
    if (calibration_value < -100 || calibration_value > 100) {
        throw new Error("humidity_calibration_settings.calibration_value must be between -100 and 100");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0x77);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeInt16LE(calibration_value * 10);
    return buffer.toBytes();
}

/**
 * Set plan config
 * @param {object} plan_config
 * @param {number} plan_config.plan_id range: [1, 16]
 * @param {number} plan_config.enable values: (0: disable, 1: enable)
 * @param {string} plan_config.name_first range: [0, 10]
 * @param {string} plan_config.name_last range: [0, 10]
 * @param {number} plan_config.temperature_control_mode values: (0: heat, 1: em_heat, 2: cool, 3: auto, 10: off)
 * @param {number} plan_config.heat_target_temperature range: [5, 35]
 * @param {number} plan_config.em_heat_target_temperature range: [5, 35]
 * @param {number} plan_config.cool_target_temperature range: [5, 35]
 * @param {number} plan_config.fan_mode values: (0: auto, 1: circulate, 2: on, 3: low, 4: medium, 5: high, 10: off)
 * @param {number} plan_config.auto_target_temperature range: [5, 35]
 * @param {number} plan_config.auto_heat_target_temperature range: [5, 35]
 * @param {number} plan_config.auto_cool_target_temperature range: [5, 35]
 * @example { "plan_config": [{ "plan_id": 1, "enable": 0, "name_first": "plan 1", "name_last": "plan 1", "temperature_control_mode": 0, "heat_target_temperature": 5, "em_heat_target_temperature": 5, "cool_target_temperature": 5, "fan_mode": 0, "auto_target_temperature": 5, "auto_heat_target_temperature": 5, "auto_cool_target_temperature": 5 }] }
 */
function setPlanConfig(plan_config) {
    var plan_id = plan_config.plan_id;
    if (plan_id < 1 || plan_id > 16) {
        throw new Error("plan_config.plan_id must be between 1 and 16");
    }

    var data = [];
    if ("enable" in plan_config) {
        data = data.concat(setPlanEnable(plan_id - 1, plan_config.enable));
    }
    if ("name_first" in plan_config) {
        data = data.concat(setPlanNameFirst(plan_id - 1, plan_config.name_first));
    }
    if ("name_last" in plan_config) {
        data = data.concat(setPlanNameLast(plan_id - 1, plan_config.name_last));
    }
    if ("temperature_control_mode" in plan_config && "heat_target_temperature" in plan_config && "em_heat_target_temperature" in plan_config && "cool_target_temperature" in plan_config) {
        data = data.concat(setPlanTargetTemperature1(plan_id - 1, plan_config));
    }
    if ("fan_mode" in plan_config && "auto_target_temperature" in plan_config && "auto_heat_target_temperature" in plan_config && "auto_cool_target_temperature" in plan_config) {
        data = data.concat(setPlanTargetTemperature2(plan_id - 1, plan_config));
    }

    return data;
}

/**
 * Set plan enable
 * @param {number} plan_id range: [1, 16]
 * @param {number} enable values: (0: disable, 1: enable)
 */
function setPlanEnable(plan_id, enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("plan_config._item.enable must be one of " + enable_values.join(", "));
    }
    var buffer = new Buffer(4);
    buffer.writeUInt8(0x7b);
    buffer.writeUInt8(plan_id);
    buffer.writeUInt8(0x00); // enable sub-command
    buffer.writeUInt8(getValue(enable_map, enable));
    return buffer.toBytes();
}

/**
 * Set plan name first
 * @param {number} plan_id range: [1, 16]
 * @param {string} name_first range: [0, 10]
 */
function setPlanNameFirst(plan_id, name_first) {
    var name = encodeUtf8(name_first);
    if (name.length > 12) {
        throw new Error("plan_config._item.name_first must be less than 12 characters");
    }

    var buffer = new Buffer(9);
    buffer.writeUInt8(0x7b);
    buffer.writeUInt8(plan_id);
    buffer.writeUInt8(0x01); // name1 sub-command
    buffer.writeBytes(name);
    return buffer.toBytes();
}

/**
 * Set plan name last
 * @param {number} plan_id range: [1, 16]
 * @param {string} name_last range: [0, 10]
 */
function setPlanNameLast(plan_id, name_last) {
    var name = encodeUtf8(name_last);
    if (name.length > 8) {
        throw new Error("plan_config._item.name_last must be less than 8 characters");
    }

    var buffer = new Buffer(7);
    buffer.writeUInt8(0x7b);
    buffer.writeUInt8(plan_id);
    buffer.writeUInt8(0x02); // name2 sub-command
    buffer.writeBytes(name);
    return buffer.toBytes();
}

/**
 * Set plan target temperature 1
 * @param {number} plan_id range: [1, 16]
 * @param {object} plan_config
 * @param {number} plan_config.temperature_control_mode values: (0: heat, 1: em_heat, 2: cool, 3: auto, 10: off)
 * @param {number} plan_config.heat_target_temperature range: [5, 35]
 * @param {number} plan_config.em_heat_target_temperature range: [5, 35]
 * @param {number} plan_config.cool_target_temperature range: [5, 35]
 */
function setPlanTargetTemperature1(plan_id, plan_config) {
    var temperature_control_mode = plan_config.temperature_control_mode;
    var heat_target_temperature = plan_config.heat_target_temperature;
    var em_heat_target_temperature = plan_config.em_heat_target_temperature;
    var cool_target_temperature = plan_config.cool_target_temperature;

    var temperature_control_map = { 0: "heat", 1: "em_heat", 2: "cool", 3: "auto", 10: "off" };
    var temperature_control_values = getValues(temperature_control_map);
    if (temperature_control_values.indexOf(temperature_control_mode) === -1) {
        throw new Error("plan_config._item.temperature_control_mode must be one of " + temperature_control_values.join(", "));
    }
    if (heat_target_temperature < 5 || heat_target_temperature > 35) {
        throw new Error("plan_config._item.heat_target_temperature must be between 5 and 35");
    }
    if (em_heat_target_temperature < 5 || em_heat_target_temperature > 35) {
        throw new Error("plan_config._item.em_heat_target_temperature must be between 5 and 35");
    }
    if (cool_target_temperature < 5 || cool_target_temperature > 35) {
        throw new Error("plan_config._item.cool_target_temperature must be between 5 and 35");
    }

    var buffer = new Buffer(10);
    buffer.writeUInt8(0x7b);
    buffer.writeUInt8(plan_id);
    buffer.writeUInt8(0x03); // target temperature1 sub-command
    buffer.writeUInt8(getValue(temperature_control_map, temperature_control_mode));
    buffer.writeInt16LE(heat_target_temperature * 100);
    buffer.writeInt16LE(em_heat_target_temperature * 100);
    buffer.writeInt16LE(cool_target_temperature * 100);
    return buffer.toBytes();
}

/**
 * Set plan target temperature 2
 * @param {number} plan_id range: [1, 16]
 * @param {object} plan_config
 * @param {number} plan_config.fan_mode values: (0: auto, 1: circulate, 2: on, 3: low, 4: medium, 5: high, 10: off)
 * @param {number} plan_config.auto_target_temperature range: [5, 35]
 * @param {number} plan_config.auto_heat_target_temperature range: [5, 35]
 * @param {number} plan_config.auto_cool_target_temperature range: [5, 35]
 */
function setPlanTargetTemperature2(plan_id, plan_config) {
    var fan_mode = plan_config.fan_mode;
    var auto_target_temperature = plan_config.auto_target_temperature;
    var auto_heat_target_temperature = plan_config.auto_heat_target_temperature;
    var auto_cool_target_temperature = plan_config.auto_cool_target_temperature;

    var fan_mode_map = { 0: "auto", 1: "circulate", 2: "on", 3: "low", 4: "medium", 5: "high", 10: "off" };
    var fan_mode_values = getValues(fan_mode_map);
    if (fan_mode_values.indexOf(fan_mode) === -1) {
        throw new Error("plan_config._item.fan_mode must be one of " + fan_mode_values.join(", "));
    }
    if (auto_target_temperature < 5 || auto_target_temperature > 35) {
        throw new Error("plan_config._item.auto_target_temperature must be between 5 and 35");
    }
    if (auto_heat_target_temperature < 5 || auto_heat_target_temperature > 35) {
        throw new Error("plan_config._item.auto_heat_target_temperature must be between 5 and 35");
    }
    if (auto_cool_target_temperature < 5 || auto_cool_target_temperature > 35) {
        throw new Error("plan_config._item.auto_cool_target_temperature must be between 5 and 35");
    }

    var buffer = new Buffer(10);
    buffer.writeUInt8(0x7b);
    buffer.writeUInt8(plan_id);
    buffer.writeUInt8(0x04); // target temperature2 sub-command
    buffer.writeUInt8(getValue(fan_mode_map, fan_mode));
    buffer.writeInt16LE(auto_target_temperature * 100);
    buffer.writeInt16LE(auto_heat_target_temperature * 100);
    buffer.writeInt16LE(auto_cool_target_temperature * 100);
    return buffer.toBytes();
}

/**
 * Set data sync to peer
 * @param {number} data_sync_to_peer values: (0: embedded_data, 1: external_receive)
 * @example { "data_sync_to_peer": 0 }
 */
function setDataSyncToPeer(data_sync_to_peer) {
    var data_sync_to_peer_map = { 0: "embedded_data", 1: "external_receive" };
    var data_sync_to_peer_values = getValues(data_sync_to_peer_map);
    if (data_sync_to_peer_values.indexOf(data_sync_to_peer) === -1) {
        throw new Error("data_sync_to_peer must be one of " + data_sync_to_peer_values.join(", "));
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x7d);
    buffer.writeUInt8(getValue(data_sync_to_peer_map, data_sync_to_peer));
    return buffer.toBytes();
}

/**
 * Set data sync timeout
 * @param {number} data_sync_timeout unit: minute, range: [1, 60]
 * @example { "data_sync_timeout": 1 }
 */
function setDataSyncTimeout(data_sync_timeout) {
    if (data_sync_timeout < 1 || data_sync_timeout > 60) {
        throw new Error("data_sync_timeout must be between 1 and 60");
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x7e);
    buffer.writeUInt8(data_sync_timeout);
    return buffer.toBytes();
}

/**
 * Set unlock combination button settings
 * @param {object} unlock_combination_button_settings
 * @param {number} unlock_combination_button_settings.button_1 values: (0: disable, 1: enable)
 * @param {number} unlock_combination_button_settings.button_2 values: (0: disable, 1: enable)
 * @param {number} unlock_combination_button_settings.button_3 values: (0: disable, 1: enable)
 * @param {number} unlock_combination_button_settings.button_4 values: (0: disable, 1: enable)
 * @param {number} unlock_combination_button_settings.button_5 values: (0: disable, 1: enable)
 * @example { "unlock_combination_button_settings": { "button_1": 0, "button_2": 0, "button_3": 0, "button_4": 0, "button_5": 0 } }
 */
function setUnlockCombinationButtonSettings(unlock_combination_button_settings) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);

    var data = 0x00;
    var button_bit_offset = { button_1: 0, button_2: 1, button_3: 2, button_4: 3, button_5: 4 };
    for (var button in button_bit_offset) {
        if (button in unlock_combination_button_settings) {
            if (enable_values.indexOf(unlock_combination_button_settings[button]) === -1) {
                throw new Error("unlock_combination_button_settings." + button + " must be one of " + enable_values.join(", "));
            }
            data |= getValue(enable_map, unlock_combination_button_settings[button]) << button_bit_offset[button];
        }
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x80);
    buffer.writeUInt8(data);
    return buffer.toBytes();
}

/**
 * Set temporary unlock settings
 * @param {object} temporary_unlock_settings
 * @param {number} temporary_unlock_settings.enable values: (0: disable, 1: enable)
 * @param {number} temporary_unlock_settings.timeout unit: second, range: [1, 3600]
 * @example { "temporary_unlock_settings": { "enable": 0, "timeout": 1 } }
 */
function setTemporaryUnlockSettings(temporary_unlock_settings) {
    var enable = temporary_unlock_settings.enable;
    var timeout = temporary_unlock_settings.timeout;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("temporary_unlock_settings.enable must be one of " + enable_values.join(", "));
    }
    if (timeout < 1 || timeout > 3600) {
        throw new Error("temporary_unlock_settings.timeout must be between 1 and 3600");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0x81);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt16LE(timeout);
    return buffer.toBytes();
}

/**
 * Set PIR config
 * @param {object} pir_config
 * @param {number} pir_config.enable values: (0: disable, 1: enable)
 * @param {number} pir_config.release_time unit: second, range: [1, 3600]
 * @param {object} pir_config.general_mode
 * @param {object} pir_config.eco_mode
 * @param {object} pir_config.night_mode
 */
function setPirConfig(pir_config) {
    var data = [];
    if ("enable" in pir_config) {
        data = data.concat(setPirEnable(pir_config));
    }
    if ("release_time" in pir_config) {
        data = data.concat(setPirReleaseTime(pir_config));
    }
    if ("general_mode" in pir_config) {
        data = data.concat(setPirGeneralMode(pir_config));
    }
    if ("eco_mode" in pir_config) {
        data = data.concat(setPirEcoMode(pir_config));
    }
    if ("night_mode" in pir_config) {
        data = data.concat(setPirNightMode(pir_config));
    }
    return data;
}

/**
 * Set PIR enable
 * @param {object} pir_config
 * @param {number} pir_config.enable values: (0: disable, 1: enable)
 * @example { "pir_config": { "enable": 0 } }
 */
function setPirEnable(pir_config) {
    var enable = pir_config.enable;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("pir_config.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0x82);
    buffer.writeUInt8(0x01); // enable
    buffer.writeUInt8(getValue(enable_map, enable));
    return buffer.toBytes();
}

/**
 * Set PIR release time
 * @param {object} pir_config
 * @param {number} pir_config.release_time unit: minute, range: [1, 360]
 */
function setPirReleaseTime(pir_config) {
    var release_time = pir_config.release_time;
    if (release_time < 1 || release_time > 360) {
        throw new Error("pir_config.release_time must be between 1 and 360");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0x82);
    buffer.writeUInt8(0x02); // release time
    buffer.writeUInt16LE(release_time);
    return buffer.toBytes();
}

/**
 * Set PIR general mode
 * @param {object} pir_config
 * @param {number} pir_config.general_mode.detection_mode values: (0: single, 1: multiple)
 * @example { "pir_config": { "general_mode": { "detection_mode": 0 } } }
 */
function setPirGeneralMode(pir_config) {
    var data = [];
    if ("detection_mode" in pir_config.general_mode) {
        data = data.concat(setPirGeneralModeDetectionMode(pir_config));
    }
    if ("period" in pir_config.general_mode && "rate" in pir_config.general_mode) {
        data = data.concat(setPirGeneralModePeriodAndRate(pir_config));
    }
    return data;
}

function setPirGeneralModeDetectionMode(pir_config) {
    var general_mode = pir_config.general_mode;
    var detection_mode = general_mode.detection_mode;
    var detection_mode_map = { 0: "single", 1: "multiple" };
    var detection_mode_values = getValues(detection_mode_map);
    if (detection_mode_values.indexOf(detection_mode) === -1) {
        throw new Error("pir_config.general_mode.detection_mode must be one of " + detection_mode_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0x82);
    buffer.writeUInt8(0x03); // general mode
    buffer.writeUInt8(getValue(detection_mode_map, detection_mode));
    return buffer.toBytes();
}

/**
 * Set PIR general mode period and rate
 * @param {object} pir_config
 * @param {number} pir_config.general_mode.period unit: second, range: [1, 60]
 * @param {number} pir_config.general_mode.rate unit: %, range: [1, 100]
 * @example { "pir_config": { "general_mode": { "period": 1, "rate": 0 } } }
 */
function setPirGeneralModePeriodAndRate(pir_config) {
    var general_mode = pir_config.general_mode;
    var period = general_mode.period;
    var rate = general_mode.rate;

    if (period < 1 || period > 60) {
        throw new Error("pir_config.general_mode.period must be between 1 and 60");
    }
    if (rate < 1 || rate > 100) {
        throw new Error("pir_config.general_mode.rate must be between 1 and 100");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0x82);
    buffer.writeUInt8(0x04); // general mode
    buffer.writeUInt8(period);
    buffer.writeUInt8(rate);
    return buffer.toBytes();
}

/**
 * Set PIR eco mode
 * @param {object} pir_config
 * @param {number} pir_config.eco_mode.enable values: (0: disable, 1: enable)
 * @param {number} pir_config.eco_mode.occupied_plan values: (0: disable, 1: enable)
 * @param {number} pir_config.eco_mode.vacant_plan values: (0: disable, 1: enable)
 * @example { "pir_config": { "eco_mode": { "enable": 0, "occupied_plan": 0, "vacant_plan": 0 } } }
 */
function setPirEcoMode(pir_config) {
    var data = [];
    if ("enable" in pir_config.eco_mode) {
        data = data.concat(setPirEcoModeEnable(pir_config));
    }
    if ("occupied_plan" in pir_config.eco_mode && "vacant_plan" in pir_config.eco_mode) {
        data = data.concat(setPirEcoModeOccupiedAndVacantPlan(pir_config));
    }
    return data;
}

/**
 * Set PIR eco mode enable
 * @param {object} pir_config
 * @param {number} pir_config.eco_mode.enable values: (0: disable, 1: enable)
 * @example { "pir_config": { "eco_mode": { "enable": 0 } } }
 */
function setPirEcoModeEnable(pir_config) {
    var eco_mode = pir_config.eco_mode;
    var enable = eco_mode.enable;
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("pir_config.eco_mode.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0x83);
    buffer.writeUInt8(0x01); // enable
    buffer.writeUInt8(getValue(enable_map, enable));
    return buffer.toBytes();
}

/**
 * Set PIR eco mode occupied and vacant plan
 * @param {object} pir_config
 * @param {number} pir_config.eco_mode.occupied_plan values: (0: plan_1, 1: plan_2, 2: plan_3, 3: plan_4, 4: plan_5, 5: plan_6, 6: plan_7, 7: plan_8, 8: plan_9, 9: plan_10, 10: plan_11, 11: plan_12, 12: plan_13, 13: plan_14, 14: plan_15, 15: plan_16, 255: none)
 * @param {number} pir_config.eco_mode.vacant_plan values: (0: plan_1, 1: plan_2, 2: plan_3, 3: plan_4, 4: plan_5, 5: plan_6, 6: plan_7, 7: plan_8, 8: plan_9, 9: plan_10, 10: plan_11, 11: plan_12, 12: plan_13, 13: plan_14, 14: plan_15, 15: plan_16)
 * @example { "pir_config": { "eco_mode": { "occupied_plan": 0, "vacant_plan": 0 } } }
 */
function setPirEcoModeOccupiedAndVacantPlan(pir_config) {
    var eco_mode = pir_config.eco_mode;
    var occupied_plan = eco_mode.occupied_plan;
    var vacant_plan = eco_mode.vacant_plan;

    var plan_map = { 0: "plan_1", 1: "plan_2", 2: "plan_3", 3: "plan_4", 4: "plan_5", 5: "plan_6", 6: "plan_7", 7: "plan_8", 8: "plan_9", 9: "plan_10", 10: "plan_11", 11: "plan_12", 12: "plan_13", 13: "plan_14", 14: "plan_15", 15: "plan_16", 255: "none" };
    var plan_values = getValues(plan_map);
    if (plan_values.indexOf(occupied_plan) === -1 || plan_values.indexOf(vacant_plan) === -1) {
        throw new Error("pir_config.eco_mode.occupied_plan and pir_config.eco_mode.vacant_plan must be one of " + plan_values.join(", "));
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0x83);
    buffer.writeUInt8(0x02); // occupied and vacant plan
    buffer.writeUInt8(getValue(plan_map, occupied_plan));
    buffer.writeUInt8(getValue(plan_map, vacant_plan));
    return buffer.toBytes();
}

function setPirNightMode(pir_config) {
    var data = [];
    if ("enable" in pir_config.night_mode) {
        data = data.concat(setPirNightModeEnable(pir_config));
    }
    if ("detection_mode" in pir_config.night_mode) {
        data = data.concat(setPirNightModeDetectionMode(pir_config));
    }
    if ("period" in pir_config.night_mode && "rate" in pir_config.night_mode) {
        data = data.concat(setPirNightModePeriodAndRate(pir_config));
    }
    if ("start_time" in pir_config.night_mode && "end_time" in pir_config.night_mode) {
        data = data.concat(setPirNightModeStartTimeAndEndTime(pir_config));
    }
    if ("occupied_plan" in pir_config.night_mode) {
        data = data.concat(setPirNightModeOccupiedPlan(pir_config));
    }
    return data;
}

/**
 * Set PIR night mode enable
 * @param {object} pir_config
 * @param {number} pir_config.night_mode.enable values: (0: disable, 1: enable)
 * @example { "pir_config": { "night_mode": { "enable": 0 } } }
 */
function setPirNightModeEnable(pir_config) {
    var night_mode = pir_config.night_mode;
    var enable = night_mode.enable;
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("pir_config.night_mode.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0x84);
    buffer.writeUInt8(0x01); // enable
    buffer.writeUInt8(getValue(enable_map, enable));
    return buffer.toBytes();
}

/**
 * Set PIR night mode detection mode
 * @param {object} pir_config
 * @param {number} pir_config.night_mode.detection_mode values: (0: single, 1: multiple)
 * @example { "pir_config": { "night_mode": { "detection_mode": 0 } } }
 */
function setPirNightModeDetectionMode(pir_config) {
    var night_mode = pir_config.night_mode;
    var detection_mode = night_mode.detection_mode;
    var detection_mode_map = { 0: "single", 1: "multiple" };
    var detection_mode_values = getValues(detection_mode_map);
    if (detection_mode_values.indexOf(detection_mode) === -1) {
        throw new Error("pir_config.night_mode.detection_mode must be one of " + detection_mode_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0x84);
    buffer.writeUInt8(0x02); // detection mode
    buffer.writeUInt8(getValue(detection_mode_map, detection_mode));
    return buffer.toBytes();
}

/**
 * Set PIR night mode period and rate
 * @param {object} pir_config
 * @param {number} pir_config.night_mode.period unit: second, range: [1, 60]
 * @param {number} pir_config.night_mode.rate unit: %, range: [1, 100]
 * @example { "pir_config": { "night_mode": { "period": 1, "rate": 0 } } }
 */
function setPirNightModePeriodAndRate(pir_config) {
    var night_mode = pir_config.night_mode;
    var period = night_mode.period;
    var rate = night_mode.rate;

    if (period < 1 || period > 60) {
        throw new Error("pir_config.night_mode.period must be between 1 and 60");
    }
    if (rate < 1 || rate > 100) {
        throw new Error("pir_config.night_mode.rate must be between 1 and 100");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0x84);
    buffer.writeUInt8(0x03); // period and rate
    buffer.writeUInt8(period);
    buffer.writeUInt8(rate);
    return buffer.toBytes();
}

/**
 * Set PIR night mode start and end time
 * @param {object} pir_config
 * @param {number} pir_config.night_mode.start_time unit: minute, range: [0, 1439]
 * @param {number} pir_config.night_mode.end_time unit: minute, range: [0, 1439]
 * @example { "pir_config": { "night_mode": { "start_time": 0, "end_time": 1439 } } }
 */
function setPirNightModeStartTimeAndEndTime(pir_config) {
    var night_mode = pir_config.night_mode;
    var start_time = night_mode.start_time;
    var end_time = night_mode.end_time;

    if (start_time < 0 || start_time > 1439) {
        throw new Error("pir_config.night_mode.start_time must be between 0 and 1439");
    }
    if (end_time < 0 || end_time > 1439) {
        throw new Error("pir_config.night_mode.end_time must be between 0 and 1439");
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0x84);
    buffer.writeUInt8(0x04); // start and end time
    buffer.writeUInt16LE(start_time);
    buffer.writeUInt16LE(end_time);
    return buffer.toBytes();
}

/**
 * Set PIR night mode occupied plan
 * @param {object} pir_config
 * @param {number} pir_config.night_mode.occupied_plan values: (0: plan_1, 1: plan_2, 2: plan_3, 3: plan_4, 4: plan_5, 5: plan_6, 6: plan_7, 7: plan_8, 8: plan_9, 9: plan_10, 10: plan_11, 11: plan_12, 12: plan_13, 13: plan_14, 14: plan_15, 15: plan_16, 255: none)
 * @example { "pir_config": { "night_mode": { "occupied_plan": 0 } } }
 */
function setPirNightModeOccupiedPlan(pir_config) {
    var night_mode = pir_config.night_mode;
    var occupied_plan = night_mode.occupied_plan;

    var plan_map = { 0: "plan_1", 1: "plan_2", 2: "plan_3", 3: "plan_4", 4: "plan_5", 5: "plan_6", 6: "plan_7", 7: "plan_8", 8: "plan_9", 9: "plan_10", 10: "plan_11", 11: "plan_12", 12: "plan_13", 13: "plan_14", 14: "plan_15", 15: "plan_16", 255: "none" };
    var plan_values = getValues(plan_map);
    if (plan_values.indexOf(occupied_plan) === -1) {
        throw new Error("pir_config.night_mode.occupied_plan must be one of " + plan_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0x84);
    buffer.writeUInt8(0x05); // occupied plan
    buffer.writeUInt8(getValue(plan_map, occupied_plan));
    return buffer.toBytes();
}

/**
 * Set BLE enable
 * @param {number} ble_enable values: (0: disable, 1: enable)
 * @example { "ble_enable": 0 }
 */
function setBleEnable(ble_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(ble_enable) === -1) {
        throw new Error("ble_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x85);
    buffer.writeUInt8(getValue(enable_map, ble_enable));
    return buffer.toBytes();
}

/**
 * Set external temperature
 * @param {number} external_temperature unit: °C, range: [-20, 60]
 * @example { "external_temperature": 20 }
 */
function setExternalTemperature(external_temperature) {
    if (external_temperature < -20 || external_temperature > 60) {
        throw new Error("external_temperature must be between -20 and 60");
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0x86);
    buffer.writeInt16LE(external_temperature * 100);
    return buffer.toBytes();
}

/**
 * Set external humidity
 * @param {number} external_humidity unit: %r.h., range: [0, 100]
 * @example { "external_humidity": 50 }
 */
function setExternalHumidity(external_humidity) {
    if (external_humidity < 0 || external_humidity > 100) {
        throw new Error("external_humidity must be between 0 and 100");
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0x87);
    buffer.writeInt16LE(external_humidity * 10);
    return buffer.toBytes();
}

/**
 * Set fan support mode
 * @param {object} fan_support_mode
 * @param {number} fan_support_mode.auto values: (0: disable, 1: enable)
 * @param {number} fan_support_mode.circulate values: (0: disable, 1: enable)
 * @param {number} fan_support_mode.on values: (0: disable, 1: enable)
 * @param {number} fan_support_mode.low values: (0: disable, 1: enable)
 * @param {number} fan_support_mode.medium values: (0: disable, 1: enable)
 * @param {number} fan_support_mode.high values: (0: disable, 1: enable)
 * @example { "fan_support_mode": { "auto": 0, "circulate": 0, "on": 0, "low": 0, "medium": 0, "high": 0 } }
 */
function setFanSupportMode(fan_support_mode) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);

    var data = 0x00;
    var mode_offset = { auto: 0, circulate: 1, on: 2, low: 3, medium: 4, high: 5 };
    for (var mode in mode_offset) {
        if (mode in fan_support_mode) {
            if (enable_values.indexOf(fan_support_mode[mode]) === -1) {
                throw new Error("fan_support_mode." + mode + " must be one of " + enable_values.join(", "));
            }
            data |= getValue(enable_map, fan_support_mode[mode]) << mode_offset[mode];
        }
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x88);
    buffer.writeUInt8(data);
    return buffer.toBytes();
}

/**
 * Set BLE name
 * @param {string} ble_name length: [0, 32]
 * @example { "ble_name": "WT401-123456" }
 */
function setBleName(ble_name) {
    var name = encodeUtf8(ble_name);
    if (name.length > 32) {
        throw new Error("ble_name must be less than 32 characters");
    }

    var buffer = new Buffer(33);
    buffer.writeUInt8(0x8b);
    buffer.writeBytes(name);
    return buffer.toBytes();
}

/**
 * Set BLE pair info
 * @param {object} ble_pair_info
 * @param {number} ble_pair_info.address_type values: (0: public, 1: random)
 * @param {string} ble_pair_info.address length: 12
 * @param {string} ble_pair_info.name length: [0, 32]
 * @example { "ble_pair_info": { "address_type": 0, "address": "123456789012", "name": "WT401-123456" } }
 */
function setBlePairInfo(ble_pair_info) {
    var address_type = ble_pair_info.address_type;
    var address = ble_pair_info.address;
    var name = ble_pair_info.name;

    var address_type_map = { 0: "public", 1: "random" };
    var address_type_values = getValues(address_type_map);
    if (address_type_values.indexOf(address_type) === -1) {
        throw new Error("ble_pair_info.address_type must be one of " + address_type_values.join(", "));
    }
    if (address.length !== 12) {
        throw new Error("ble_pair_info.address must be 12 characters");
    }
    var ble_name = encodeUtf8(name);
    if (ble_name.length > 32) {
        throw new Error("ble_pair_info.name must be less than 32 characters");
    }

    var buffer = new Buffer(40);
    buffer.writeUInt8(0x8c);
    buffer.writeUInt8(getValue(address_type_map, address_type));
    buffer.writeHexString(address);
    buffer.writeBytes(ble_name);
    return buffer.toBytes();
}

/**
 * Set communication mode
 * @param {number} communication_mode values: (0: ble, 1: lora, 2: ble_and_lora, 3: power_bus_and_lora)
 * @example { "communication_mode": 0 }
 */
function setCommunicationMode(communication_mode) {
    var mode_map = { 0: "ble", 1: "lora", 2: "ble_and_lora", 3: "power_bus_and_lora" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(communication_mode) === -1) {
        throw new Error("communication_mode must be one of " + mode_values.join(", "));
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x8d);
    buffer.writeUInt8(getValue(mode_map, communication_mode));
    return buffer.toBytes();
}

/**
 * Set daylight saving time settings
 * @param {object} daylight_saving_time
 * @param {number} daylight_saving_time.enable values: (0: disable, 1: enable)
 * @param {number} daylight_saving_time.offset unit: minute
 * @param {number} daylight_saving_time.start_month values: (1: January, 2: February, 3: March, 4: April, 5: May, 6: June, 7: July, 8: August, 9: September, 10: October, 11: November, 12: December)
 * @param {number} daylight_saving_time.start_week_num values: (1: First week, 2: Second week, 3: Third week, 4: Fourth week, 5: Last week)
 * @param {number} daylight_saving_time.start_week_day values: (1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday, 5: Friday, 6: Saturday, 7: Sunday)
 * @param {number} daylight_saving_time.start_hour_min unit: minutes
 * @param {number} daylight_saving_time.end_month values: (1: January, 2: February, 3: March, 4: April, 5: May, 6: June, 7: July, 8: August, 9: September, 10: October, 11: November, 12: December)
 * @param {number} daylight_saving_time.end_week_num values: (1: First week, 2: Second week, 3: Third week, 4: Fourth week, 5: Last week)
 * @param {number} daylight_saving_time.end_week_day values: (1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday, 5: Friday, 6: Saturday, 7: Sunday)
 * @param {number} daylight_saving_time.end_hour_min unit: minute
 * @example { "daylight_saving_time": { "enable": 1, "offset": 60, "start_month": 3, "start_week": 1, "start_day": 1, "start_time": 0, "end_month": 11, "end_week": 4, "end_day": 7, "end_time": 120 } }
 */
function setDaylightSavingTimeSettings(daylight_saving_time) {
    var enable = daylight_saving_time.enable;
    var offset = daylight_saving_time.offset;
    var start_month = daylight_saving_time.start_month;
    var start_week_num = daylight_saving_time.start_week_num;
    var start_week_day = daylight_saving_time.start_week_day;
    var start_hour_min = daylight_saving_time.start_hour_min;
    var end_month = daylight_saving_time.end_month;
    var end_week_num = daylight_saving_time.end_week_num;
    var end_week_day = daylight_saving_time.end_week_day;
    var end_hour_min = daylight_saving_time.end_hour_min;

    if (offset < 1 || offset > 120) {
        throw new Error('daylight_saving_time.offset must be between 1 and 120');
    }

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("daylight_saving_time.enable must be one of " + enable_values.join(", "));
    }
    var month_values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    if (month_values.indexOf(start_month) === -1 || month_values.indexOf(end_month) === -1) {
        throw new Error("daylight_saving_time.start_month and end_month must be one of " + month_values.join(", "));
    }
    var week_values = [1, 2, 3, 4, 5];
    if (week_values.indexOf(start_week_num) === -1 || week_values.indexOf(end_week_num) === -1) {
        throw new Error("daylight_saving_time.start_week_num and end_week_num must be one of " + week_values.join(", "));
    }
    var day_values = [1, 2, 3, 4, 5, 6, 7];
    if (day_values.indexOf(start_week_day) === -1 || day_values.indexOf(end_week_day) === -1) {
        throw new Error("daylight_saving_time.start_week_day and end_week_day must be one of " + day_values.join(", "));
    }

    if (start_hour_min < 0 || start_hour_min > 1380) {
        throw new Error('daylight_saving_time.start_hour_min must be between 0 and 1380');
    }

    if (end_month < 1 || end_month > 12) {
        throw new Error('daylight_saving_time.end_month must be between 1 and 12');
    }

    if (end_hour_min < 0 || end_hour_min > 1380) {
        throw new Error('daylight_saving_time.end_hour_min must be between 0 and 1380');
    }

    var start_day_value = (start_week_num << 4) | start_week_day;
    var end_day_value = (end_week_num << 4) | end_week_day;

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xc6);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(offset);
    buffer.writeUInt8(start_month);
    buffer.writeUInt8(start_day_value);
    buffer.writeUInt16LE(start_hour_min);
    buffer.writeUInt8(end_month);
    buffer.writeUInt8(end_day_value);
    buffer.writeUInt16LE(end_hour_min);
    return buffer.toBytes();
}

/**
 * Set time zone
 * @param {number} time_zone unit: minute, convert: "hh:mm" -> "hh * 60 + mm", values: ( -720: UTC-12, -660: UTC-11, -600: UTC-10, -570: UTC-9:30, -540: UTC-9, -480: UTC-8, -420: UTC-7, -360: UTC-6, -300: UTC-5, -240: UTC-4, -210: UTC-3:30, -180: UTC-3, -120: UTC-2, -60: UTC-1, 0: UTC, 60: UTC+1, 120: UTC+2, 180: UTC+3, 240: UTC+4, 300: UTC+5, 360: UTC+6, 420: UTC+7, 480: UTC+8, 540: UTC+9, 570: UTC+9:30, 600: UTC+10, 660: UTC+11, 720: UTC+12, 765: UTC+12:45, 780: UTC+13, 840: UTC+14 )
 * @example { "time_zone": 480 }
 */
function setTimeZone(time_zone) {
    var timezone_map = { "-720": "UTC-12", "-660": "UTC-11", "-600": "UTC-10", "-570": "UTC-9:30", "-540": "UTC-9", "-480": "UTC-8", "-420": "UTC-7", "-360": "UTC-6", "-300": "UTC-5", "-240": "UTC-4", "-210": "UTC-3:30", "-180": "UTC-3", "-120": "UTC-2", "-60": "UTC-1", 0: "UTC", 60: "UTC+1", 120: "UTC+2", 180: "UTC+3", 210: "UTC+3:30", 240: "UTC+4", 270: "UTC+4:30", 300: "UTC+5", 330: "UTC+5:30", 345: "UTC+5:45", 360: "UTC+6", 390: "UTC+6:30", 420: "UTC+7", 480: "UTC+8", 540: "UTC+9", 570: "UTC+9:30", 600: "UTC+10", 630: "UTC+10:30", 660: "UTC+11", 720: "UTC+12", 765: "UTC+12:45", 780: "UTC+13", 840: "UTC+14" };
    var timezone_values = getValues(timezone_map);
    if (timezone_values.indexOf(time_zone) === -1) {
        throw new Error("time_zone must be one of " + timezone_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xc7);
    buffer.writeInt16LE(getValue(timezone_map, time_zone));
    return buffer.toBytes();
}

/**
 * Reset BLE name
 * @param {number} reset_ble_name values: (0: no, 1: yes)
 * @example { "reset_ble_name": 0 }
 */
function resetBleName(reset_ble_name) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(reset_ble_name) === -1) {
        throw new Error("reset_ble_name must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, reset_ble_name) === 0) {
        return [];
    }
    return [0x54];
}

/**
 * Set trigger fan alarm
 * @param {number} trigger_fan_alarm values: (0: no, 1: yes)
 * @example { "trigger_fan_alarm": 1 }
 */
function triggerFanAlarm(trigger_fan_alarm) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(trigger_fan_alarm) === -1) {
        throw new Error("trigger_fan_alarm must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, trigger_fan_alarm) === 0) {
        return [];
    }
    return [0x55, 0x01];
}

/**
 * Release fan alarm
 * @param {number} release_fan_alarm values: (0: no, 1: yes)
 * @example { "release_fan_alarm": 1 }
 */
function releaseFanAlarm(release_fan_alarm) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(release_fan_alarm) === -1) {
        throw new Error("release_fan_alarm must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, release_fan_alarm) === 0) {
        return [];
    }
    return [0x55, 0x00];
}

/**
 * Set peer BLE pair info
 * @param {object} peer_ble_pair_info
 * @param {number} peer_ble_pair_info.address_type values: (0: public, 1: random)
 * @param {string} peer_ble_pair_info.address length: 12
 * @param {string} peer_ble_pair_info.name length: [0, 32]
 * @example { "peer_ble_pair_info": { "address_type": 0, "address": "123456789012", "name": "WT401-123456" } }
 */
function setPeerBlePairInfo(peer_ble_pair_info) {
    var address_type = peer_ble_pair_info.address_type;
    var address = peer_ble_pair_info.address;
    var name = peer_ble_pair_info.name;

    var address_type_map = { 0: "public", 1: "random" };
    var address_type_values = getValues(address_type_map);
    if (address_type_values.indexOf(address_type) === -1) {
        throw new Error("peer_ble_pair_info.address_type must be one of " + address_type_values.join(", "));
    }
    if (address.length !== 12) {
        throw new Error("peer_ble_pair_info.address must be 12 characters");
    }
    var ble_name = encodeUtf8(name);
    if (ble_name.length > 32) {
        throw new Error("peer_ble_pair_info.name must be less than 32 characters");
    }

    var buffer = new Buffer(40);
    buffer.writeUInt8(0x56);
    buffer.writeUInt8(getValue(address_type_map, address_type));
    buffer.writeHexString(address);
    buffer.writeBytes(ble_name);
    return buffer.toBytes();
}

/**
 * Trigger freeze alarm
 * @param {number} trigger_freeze_alarm values: (0: no, 1: yes)
 * @example { "trigger_freeze_alarm": 1 }
 */
function triggerFreezeAlarm(trigger_freeze_alarm) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(trigger_freeze_alarm) === -1) {
        throw new Error("trigger_freeze_alarm must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, trigger_freeze_alarm) === 0) {
        return [];
    }
    return [0x57, 0x01];
}

/**
 * Release freeze alarm
 * @param {number} release_freeze_alarm values: (0: no, 1: yes)
 * @example { "release_freeze_alarm": 1 }
 */
function releaseFreezeAlarm(release_freeze_alarm) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(release_freeze_alarm) === -1) {
        throw new Error("release_freeze_alarm must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, release_freeze_alarm) === 0) {
        return [];
    }
    return [0x57, 0x00];
}

/**
 * Trigger no wire alarm
 * @param {number} trigger_no_wire_alarm values: (0: no, 1: yes)
 * @example { "trigger_no_wire_alarm": 1 }
 */
function triggerNoWireAlarm(trigger_no_wire_alarm) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(trigger_no_wire_alarm) === -1) {
        throw new Error("trigger_no_wire_alarm must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, trigger_no_wire_alarm) === 0) {
        return [];
    }
    return [0x58, 0x01];
}

/**
 * Release no wire alarm
 * @param {number} release_no_wire_alarm values: (0: no, 1: yes)
 * @example { "release_no_wire_alarm": 1 }
 */
function releaseNoWireAlarm(release_no_wire_alarm) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(release_no_wire_alarm) === -1) {
        throw new Error("release_no_wire_alarm must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, release_no_wire_alarm) === 0) {
        return [];
    }
    return [0x58, 0x00];
}

/**
 * Trigger window open alarm
 * @param {number} trigger_window_open_alarm values: (0: no, 1: yes)
 * @example { "trigger_window_open_alarm": 1 }
 */
function triggerWindowOpenAlarm(trigger_window_open_alarm) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(trigger_window_open_alarm) === -1) {
        throw new Error("trigger_window_open_alarm must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, trigger_window_open_alarm) === 0) {
        return [];
    }
    return [0x5a, 0x01];
}

/**
 * Release window open alarm
 * @param {number} release_window_open_alarm values: (0: no, 1: yes)
 * @example { "release_window_open_alarm": 1 }
 */
function releaseWindowOpenAlarm(release_window_open_alarm) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(release_window_open_alarm) === -1) {
        throw new Error("release_window_open_alarm must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, release_window_open_alarm) === 0) {
        return [];
    }
    return [0x5a, 0x00];
}

/**
 * Trigger filter alarm
 * @param {number} trigger_filter_alarm values: (0: no, 1: yes)
 * @example { "trigger_filter_alarm": 1 }
 */
function triggerFilterAlarm(trigger_filter_alarm) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(trigger_filter_alarm) === -1) {
        throw new Error("trigger_filter_alarm must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, trigger_filter_alarm) === 0) {
        return [];
    }
    return [0x5b, 0x01];
}

/**
 * Release filter alarm
 * @param {number} release_filter_alarm values: (0: no, 1: yes)
 * @example { "release_filter_alarm": 1 }
 */
function releaseFilterAlarm(release_filter_alarm) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(release_filter_alarm) === -1) {
        throw new Error("release_filter_alarm must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, release_filter_alarm) === 0) {
        return [];
    }
    return [0x5b, 0x00];
}

/**
 * Insert plan id
 * @param {number} insert_plan values: (0: plan_1, 1: plan_2, 2: plan_3, 3: plan_4, 4: plan_5, 5: plan_6, 6: plan_7, 7: plan_8, 8: plan_9, 9: plan_10, 10: plan_11, 11: plan_12, 12: plan_13, 13: plan_14, 14: plan_15, 15: plan_16)
 * @example { "insert_plan": 0 }
 */
function insertPlan(insert_plan) {
    var plan_id_map = { 0: "plan_1", 1: "plan_2", 2: "plan_3", 3: "plan_4", 4: "plan_5", 5: "plan_6", 6: "plan_7", 7: "plan_8", 8: "plan_9", 9: "plan_10", 10: "plan_11", 11: "plan_12", 12: "plan_13", 13: "plan_14", 14: "plan_15", 15: "plan_16" };
    var plan_id_values = getValues(plan_id_map);
    if (plan_id_values.indexOf(insert_plan) === -1) {
        throw new Error("insert_plan must be one of " + plan_id_values.join(", "));
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x5c);
    buffer.writeUInt8(getValue(plan_id_map, insert_plan));
    return buffer.toBytes();
}

/**
 * Trigger BLE pair
 * @param {number} trigger_ble_pair values: (0: no, 1: yes)
 * @example { "trigger_ble_pair": 1 }
 */
function triggerBlePair(trigger_ble_pair) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(trigger_ble_pair) === -1) {
        throw new Error("trigger_ble_pair must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, trigger_ble_pair) === 0) {
        return [];
    }
    return [0x5e, 0x01];
}

/**
 * Cancel BLE pair
 * @param {number} cancel_ble_pair values: (0: no, 1: yes)
 * @example { "cancel_ble_pair": 1 }
 */
function cancelBlePair(cancel_ble_pair) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(cancel_ble_pair) === -1) {
        throw new Error("cancel_ble_pair must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, cancel_ble_pair) === 0) {
        return [];
    }
    return [0x5e, 0x00];
}

/**
 * Remove plan
 * @param {object} remove_plan
 * @param {number} remove_plan.plan_1 values: (0: no, 1: yes)
 * @param {number} remove_plan.plan_2 values: (0: no, 1: yes)
 * @param {number} remove_plan.plan_3 values: (0: no, 1: yes)
 * @param {number} remove_plan.plan_4 values: (0: no, 1: yes)
 * @param {number} remove_plan.plan_5 values: (0: no, 1: yes)
 * @param {number} remove_plan.plan_6 values: (0: no, 1: yes)
 * @param {number} remove_plan.plan_7 values: (0: no, 1: yes)
 * @param {number} remove_plan.plan_8 values: (0: no, 1: yes)
 * @param {number} remove_plan.plan_9 values: (0: no, 1: yes)
 * @param {number} remove_plan.plan_10 values: (0: no, 1: yes)
 * @param {number} remove_plan.plan_11 values: (0: no, 1: yes)
 * @param {number} remove_plan.plan_12 values: (0: no, 1: yes)
 * @param {number} remove_plan.plan_13 values: (0: no, 1: yes)
 * @param {number} remove_plan.plan_14 values: (0: no, 1: yes)
 * @param {number} remove_plan.plan_15 values: (0: no, 1: yes)
 * @param {number} remove_plan.plan_16 values: (0: no, 1: yes)
 * @param {number} remove_plan.all values: (0: no, 1: yes)
 * @example { "remove_plan": { "plan_1": 1, "plan_2": 0, "plan_3": 1, "plan_4": 0, "plan_5": 1, "plan_6": 0, "plan_7": 1, "plan_8": 0, "plan_9": 1, "plan_10": 0, "plan_11": 1, "plan_12": 0, "plan_13": 1, "plan_14": 0, "plan_15": 1, "plan_16": 0, "reset": 1 } }
 * @example { "remove_plan": { "all": 1 } }
 */
function removePlan(remove_plan) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);

    var data = [];
    var plan_offset = { plan_1: 0, plan_2: 1, plan_3: 2, plan_4: 3, plan_5: 4, plan_6: 5, plan_7: 6, plan_8: 7, plan_9: 8, plan_10: 9, plan_11: 10, plan_12: 11, plan_13: 12, plan_14: 13, plan_15: 14, plan_16: 15, reset: 255 };
    for (var plan in plan_offset) {
        if (plan in remove_plan) {
            if (yes_no_values.indexOf(remove_plan[plan]) === -1) {
                throw new Error("remove_plan." + plan + " must be one of " + yes_no_values.join(", "));
            }
            if (getValue(yes_no_map, remove_plan[plan]) === 0) {
                continue;
            }
            data = data.concat([0x5f, plan_offset[plan]]);
        }
    }

    return data;
}

/**
 * Reconnect
 * @param {number} reconnect values: (0: no, 1: yes)
 * @example { "reconnect": 1 }
 */
function reconnect(reconnect) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(reconnect) === -1) {
        throw new Error("reconnect must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, reconnect) === 0) {
        return [];
    }
    return [0xb6];
}

/**
 * Synchronize time
 * @param {number} synchronize_time values: (0: no, 1: yes)
 * @example { "synchronize_time": 1 }
 */
function synchronizeTime(synchronize_time) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(synchronize_time) === -1) {
        throw new Error("synchronize_time must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, synchronize_time) === 0) {
        return [];
    }
    return [0xb8];
}

/**
 * Query device status
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
    return [0xb9];
}

/**
 * Reboot
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
    return [0xbe];
}

function setQueryCmd(bytes) {
    var name_map = {
        "56": { level: 1, name: "combine_command" },
        "60": { level: 1, name: "collection_interval" },
        "61": { level: 1, name: "reporting_interval" },
        "62": { level: 1, name: "intelligent_display_enable" },
        "63": { level: 1, name: "temperature_unit" },
        "64": { level: 1, name: "temperature_control_mode_support" },
        "65": { level: 1, name: "target_temperature_mode" },
        "66": { level: 1, name: "target_temperature_resolution" },
        "67": { level: 1, name: "system_status" },
        "68": { level: 2, name: "temperature_control_mode" },
        "69": { level: 2, name: "target_temperature_settings" },
        "6a": { level: 1, name: "dead_band" },
        "6b": { level: 2, name: "target_temperature_range" },
        "71": { level: 2, name: "button_custom_function" },
        "72": { level: 1, name: "child_lock_settings" },
        "74": { level: 1, name: "fan_mode" },
        "75": { level: 1, name: "screen_display_settings" },
        "76": { level: 1, name: "temperature_calibration_settings" },
        "77": { level: 1, name: "humidity_calibration_settings" },
        "7d": { level: 1, name: "data_sync_to_peer" },
        "7e": { level: 1, name: "data_sync_timeout" },
        "80": { level: 1, name: "unlock_combination_button_settings" },
        "81": { level: 1, name: "temporary_unlock_settings" },
        "82": { level: 2, name: "pir_config" },
        "85": { level: 1, name: "ble_enable" },
        "86": { level: 1, name: "external_temperature" },
        "87": { level: 1, name: "external_humidity" },
        "88": { level: 1, name: "fan_support_mode" },
        "8b": { level: 1, name: "ble_name" },
        "8c": { level: 1, name: "ble_pair_info" },
        "8d": { level: 1, name: "communication_mode" },
        "c6": { level: 1, name: "daylight_saving_time" },
        "c7": { level: 1, name: "time_zone" },
    };

    var cmd = readHexString(bytes.slice(0, 1));
    var cmd_level = name_map[cmd].level;

    if (cmd_level != 0) {
        var buffer = new Buffer(2 + cmd_level);
        buffer.writeUInt8(0xef);
        buffer.writeUInt8(cmd_level);
        buffer.writeBytes(bytes.slice(0, cmd_level));
        return buffer.toBytes();
    }
    return [];
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
    value = Math.round(value);
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

Buffer.prototype.writeBytes = function (bytes) {
    for (var i = 0; i < bytes.length; i++) {
        this.buffer[this.offset + i] = bytes[i];
    }
    this.offset += bytes.length;
};

Buffer.prototype.writeHexString = function (hexString) {
    var bytes = [];
    for (var i = 0; i < hexString.length; i += 2) {
        bytes.push(parseInt(hexString.substr(i, 2), 16));
    }
    this.writeBytes(bytes);
};

Buffer.prototype.writeHexStringReverse = function (hexString) {
    var bytes = [];
    for (var i = hexString.length - 2; i >= 0; i -= 2) {
        bytes.push(parseInt(hexString.substr(i, 2), 16));
    }
    this.writeBytes(bytes);
};

Buffer.prototype.toBytes = function () {
    return this.buffer;
};

function encodeUtf8(str) {
    var byteArray = [];
    for (var i = 0; i < str.length; i++) {
        var charCode = str.charCodeAt(i);
        if (charCode < 0x80) {
            byteArray.push(charCode);
        } else if (charCode < 0x800) {
            byteArray.push(0xc0 | (charCode >> 6));
            byteArray.push(0x80 | (charCode & 0x3f));
        } else if (charCode < 0x10000) {
            byteArray.push(0xe0 | (charCode >> 12));
            byteArray.push(0x80 | ((charCode >> 6) & 0x3f));
            byteArray.push(0x80 | (charCode & 0x3f));
        } else if (charCode < 0x200000) {
            byteArray.push(0xf0 | (charCode >> 18));
            byteArray.push(0x80 | ((charCode >> 12) & 0x3f));
            byteArray.push(0x80 | ((charCode >> 6) & 0x3f));
            byteArray.push(0x80 | (charCode & 0x3f));
        }
    }
    return byteArray;
}

function readHexString(bytes) {
    var temp = [];
    for (var idx = 0; idx < bytes.length; idx++) {
        temp.push(("0" + (bytes[idx] & 0xff).toString(16)).slice(-2));
    }
    return temp.join("");
}