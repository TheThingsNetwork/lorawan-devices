/**
 * Payload Encoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product EM300-DI
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
    if ("sync_time" in payload) {
        encoded = encoded.concat(syncTime(payload.sync_time));
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
    if ("temperature_alarm_settings" in payload) {
        encoded = encoded.concat(setTemperatureAlarmSettings(payload.temperature_alarm_settings));
    }
    if ("clear_counter" in payload) {
        encoded = encoded.concat(clearCounter(payload.clear_counter));
    }
    if ("stop_counter" in payload) {
        encoded = encoded.concat(stopCounter(payload.stop_counter));
    }
    if ("start_counter" in payload) {
        encoded = encoded.concat(startCounter(payload.start_counter));
    }
    if ("counter" in payload) {
        encoded = encoded.concat(setCounter(payload.counter));
    }
    if ("water_flow_alarm_settings" in payload) {
        encoded = encoded.concat(setWaterFlowAlarmSettings(payload.water_flow_alarm_settings));
    }
    if ("water_flow_timeout_alarm_settings" in payload) {
        encoded = encoded.concat(setWaterFlowTimeoutAlarmConfig(payload.water_flow_timeout_alarm_settings));
    }
    if ("water_outage_timeout_alarm_settings" in payload) {
        encoded = encoded.concat(setWaterOutageTimeoutAlarmSettings(payload.water_outage_timeout_alarm_settings));
    }
    if ("pulse_conversion_settings" in payload) {
        encoded = encoded.concat(setPulseConversionSettings(payload.pulse_conversion_settings));
    }
    if ("pulse_filter_enable" in payload) {
        encoded = encoded.concat(setPulseFilterEnable(payload.pulse_filter_enable));
    }
    if ("water_flow_determination" in payload) {
        encoded = encoded.concat(setWaterFlowDetermination(payload.water_flow_determination));
    }
    if ("d2d_key" in payload) {
        encoded = encoded.concat(setD2DKey(payload.d2d_key));
    }
    if ("d2d_master_config" in payload) {
        for (var i = 0; i < payload.d2d_master_config.length; i++) {
            encoded = encoded.concat(setD2DMasterConfig(payload.d2d_master_config[i]));
        }
    }
    if ("gpio_mode" in payload) {
        encoded = encoded.concat(setGPIOMode(payload.gpio_mode));
    }
    if ("history_enable" in payload) {
        encoded = encoded.concat(setHistoryEnable(payload.history_enable));
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
 * report interval configuration
 * @param {number} report_interval uint: second, range: [60, 64800]
 * @example { "report_interval": 1200 }
 */
function setReportInterval(report_interval) {
    if (typeof report_interval !== "number") {
        throw new Error("report_interval must be a number");
    }
    if (report_interval < 60 || report_interval > 64800) {
        throw new Error("report_interval must be in the range of [60, 64800]");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x03);
    buffer.writeUInt16LE(report_interval);
    return buffer.toBytes();
}

/**
 * collection interval
 * @param {number} collection_interval unit: second, range: [60, 64800]
 * @example { "collection_interval": 60 }
 */
function setCollectionInterval(collection_interval) {
    if (typeof collection_interval !== "number") {
        throw new Error("collection_interval must be a number");
    }
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
 * set temperature alarm config
 * @param {object} temperature_alarm_settings
 * @param {number} temperature_alarm_settings.condition values: (0: disable, 1: below, 2: above, 3: between, 4: outside)
 * @param {number} temperature_alarm_settings.threshold_min unit: °C
 * @param {number} temperature_alarm_settings.threshold_max unit: °C
 * @example { "temperature_alarm_settings": { "condition": 1, "threshold_min": 100, "threshold_max": 200 } }
 */
function setTemperatureAlarmSettings(temperature_alarm_settings) {
    var condition = temperature_alarm_settings.condition;
    var threshold_min = temperature_alarm_settings.threshold_min;
    var threshold_max = temperature_alarm_settings.threshold_max;

    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside" };
    var condition_values = getValues(condition_map);
    if (condition_values.indexOf(condition) === -1) {
        throw new Error("temperature_alarm_settings.condition must be one of " + condition_values.join(", "));
    }

    var data = 0x00;
    data |= 0x01 << 3; // temperature
    data |= getValue(condition_map, condition) << 0;

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x06);
    buffer.writeUInt8(data);
    buffer.writeInt16LE(threshold_min * 10);
    buffer.writeInt16LE(threshold_max * 10);
    buffer.writeUInt16LE(0x00);
    buffer.writeUInt16LE(0x00);
    return buffer.toBytes();
}

/**
 * set clear counter
 * @param {number} clear_counter values: (0: no, 1: yes)
 * @example { "clear_counter": 1 }
 */
function clearCounter(clear_counter) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(clear_counter) === -1) {
        throw new Error("clear_counter must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, clear_counter) === 0) {
        return [];
    }
    return [0xff, 0x4e, 0x01, 0x00];
}

/**
 * stop counter
 * @param {number} stop_counter values: (0: no, 1: yes)
 * @example { "stop_counter": 1 }
 */
function stopCounter(stop_counter) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(stop_counter) === -1) {
        throw new Error("stop_counter must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, stop_counter) === 0) {
        return [];
    }
    return [0xff, 0x4e, 0x01, 0x01];
}

/**
 * start counter
 * @param {number} start_counter values: (0: no, 1: yes)
 * @example { "start_counter": 1 }
 */
function startCounter(start_counter) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(start_counter) === -1) {
        throw new Error("start_counter must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, start_counter) === 0) {
        return [];
    }
    return [0xff, 0x4e, 0x01, 0x02];
}

/**
 * set counter
 * @param {number} counter
 * @example { "counter": 1200 }
 */
function setCounter(counter) {
    if (counter < 0) {
        throw new Error("counter must be greater than 0");
    }

    var buffer = new Buffer(7);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x92);
    buffer.writeUInt8(0x01);
    buffer.writeUInt32LE(counter);
    return buffer.toBytes();
}

/**
 * set water flow alarm config
 * @param {object} water_flow_alarm_settings
 * @param {number} water_flow_alarm_settings.enable values: (0: disable, 1: enable)
 * @param {number} water_flow_alarm_settings.duration unit: minute, range: [1, 64800]
 * @example { "water_flow_alarm_settings": { "enable": 1, "duration": 1200 } }
 */
function setWaterFlowAlarmSettings(water_flow_alarm_settings) {
    var enable = water_flow_alarm_settings.enable;
    var duration = water_flow_alarm_settings.duration;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("water_flow_alarm_settings.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(9);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xa1);
    buffer.writeUInt8(0x01);
    buffer.writeUInt8(0x00); // water flow
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt32LE(duration);
    return buffer.toBytes();
}

/**
 * set water flow timeout alarm config
 * @param {object} water_flow_timeout_alarm_settings
 * @param {number} water_flow_timeout_alarm_settings.enable values: (0: disable, 1: enable)
 * @param {number} water_flow_timeout_alarm_settings.duration unit: minute, range: [1, 64800]
 * @example { "water_flow_timeout_alarm_settings": { "enable": 1, "duration": 1200 } }
 */
function setWaterFlowTimeoutAlarmConfig(water_flow_timeout_alarm_settings) {
    var enable = water_flow_timeout_alarm_settings.enable;
    var duration = water_flow_timeout_alarm_settings.duration;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("water_flow_timeout_alarm_settings.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(9);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xa1);
    buffer.writeUInt8(0x01);
    buffer.writeUInt8(0x01); // water flow timeout
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt32LE(duration);
    return buffer.toBytes();
}

/**
 * set water outage timeout alarm config
 * @param {object} water_outage_timeout_alarm_settings
 * @param {number} water_outage_timeout_alarm_settings.enable values: (0: disable, 1: enable)
 * @param {number} water_outage_timeout_alarm_settings.duration unit: minute, range: [1, 64800]
 * @example { "water_outage_timeout_alarm_settings": { "enable": 1, "duration": 1200 } }
 */
function setWaterOutageTimeoutAlarmSettings(water_outage_timeout_alarm_settings) {
    var enable = water_outage_timeout_alarm_settings.enable;
    var duration = water_outage_timeout_alarm_settings.duration;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("water_outage_timeout_alarm_settings.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(9);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xa1);
    buffer.writeUInt8(0x01);
    buffer.writeUInt8(0x02); // water outage timeout
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt32LE(duration);
    return buffer.toBytes();
}

/**
 * set pulse conversion config
 * @param {object} pulse_conversion_settings
 * @param {number} pulse_conversion_settings.enable values: (0: disable, 1: enable)
 * @param {number} pulse_conversion_settings.water decimal: 0.1
 * @param {number} pulse_conversion_settings.pulse decimal: 0.1
 * @param {string} pulse_conversion_settings.unit
 * @example { "pulse_conversion_settings": { "enable": 1, "water": 1000, "pulse": 1000, "unit": "mL" } }
 */
function setPulseConversionSettings(pulse_conversion_settings) {
    var enable = pulse_conversion_settings.enable;
    var water = pulse_conversion_settings.water;
    var pulse = pulse_conversion_settings.pulse;
    var unit = pulse_conversion_settings.unit;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("pulse_conversion_settings.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xa2);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt16LE(water * 10);
    buffer.writeUInt16LE(pulse * 10);
    buffer.writeUtf8(unit);
    return buffer.toBytes();
}

/**
 * set pulse filter enable
 * @param {number} pulse_filter_enable values: (0: disable, 1: enable)
 * @example { "pulse_filter_enable": 1 }
 */
function setPulseFilterEnable(pulse_filter_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(pulse_filter_enable) === -1) {
        throw new Error("pulse_filter_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xa3);
    buffer.writeUInt8(0x01);
    buffer.writeUInt8(getValue(enable_map, pulse_filter_enable));
    return buffer.toBytes();
}

/**
 * set water flow determination
 * @param {number} water_flow_determination unit: second
 * @example { "water_flow_determination": 1 }
 */
function setWaterFlowDetermination(water_flow_determination) {
    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xa4);
    buffer.writeUInt16LE(water_flow_determination);
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
    if (!/^[0-9a-fA-F]+$/.test(d2d_key)) {
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
 * set d2d master config
 * @param {object} d2d_master_config
 * @param {number} d2d_master_config.mode values: (1: water outage timeout alarm, 2: water outage timeout alarm release, 3: water flow timeout alarm, 4: water flow timeout alarm release, 5: gpio high, 6: gpio low)
 * @param {number} d2d_master_config.enable values: (0: disable, 1: enable)
 * @param {number} d2d_master_config.lora_uplink_enable values: (0: d2d command, 1: d2d command release)
 * @param {string} d2d_master_config.d2d_cmd
 * @example { "d2d_master_config": { "mode": 1, "enable": 1, "d2d_cmd_type": 0, "d2d_cmd": "0000" } }
 */
function setD2DMasterConfig(d2d_master_config) {
    var mode = d2d_master_config.mode;
    var enable = d2d_master_config.enable;
    var lora_uplink_enable = d2d_master_config.lora_uplink_enable;
    var d2d_cmd = d2d_master_config.d2d_cmd;

    var mode_map = { 1: "water outage timeout alarm", 2: "water outage timeout alarm release", 3: "water flow timeout alarm", 4: "water flow timeout alarm release", 5: "gpio high", 6: "gpio low" };
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

    var data = 0x00;
    data |= getValue(enable_map, enable) << 0;
    data |= getValue(enable_map, lora_uplink_enable) << 1;
    var buffer = new Buffer(6);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x79);
    buffer.writeUInt8(getValue(mode_map, mode));
    buffer.writeUInt8(data);
    buffer.writeD2DCommand(d2d_cmd, "0000");
    return buffer.toBytes();
}

/**
 * set gpio mode
 * @param {number} gpio_mode values: (1: digital, 2: counter)
 * @example { "gpio_mode": 1 }
 */
function setGPIOMode(gpio_mode) {
    var mode_map = { 1: "digital", 2: "counter" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(gpio_mode) === -1) {
        throw new Error("gpio_mode must be one of " + mode_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xc3);
    buffer.writeUInt8(getValue(mode_map, gpio_mode));
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
 * @param {number} retransmit_interval unit: seconds
 * @example { "retransmit_interval": 300 }
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
 * retransmit interval
 * @param {number} resend_interval unit: seconds
 * @example { "resend_interval": 300 }
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
 * fetch history
 * @param {object} fetch_history
 * @param {number} fetch_history.start_time
 * @param {number} fetch_history.end_time
 * @example { "fetch_history": { "start_time": 1609459200, "end_time": 1609545600 } }
 */
function fetchHistory(fetch_history) {
    var start_time = fetch_history.start_time;
    var end_time = fetch_history.end_time || 0;

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

Buffer.prototype.writeUtf8 = function (str) {
    var bytes = [];
    for (var i = 0; i < str.length; i++) {
        var charCode = str.charCodeAt(i);
        if (charCode < 0x80) {
            bytes.push(charCode);
        } else if (charCode < 0x800) {
            bytes.push(0xc0 | (charCode >> 6));
            bytes.push(0x80 | (charCode & 0x3f));
        } else if (charCode < 0x10000) {
            bytes.push(0xe0 | (charCode >> 12));
            bytes.push(0x80 | ((charCode >> 6) & 0x3f));
            bytes.push(0x80 | (charCode & 0x3f));
        } else if (charCode < 0x200000) {
            bytes.push(0xf0 | (charCode >> 18));
            bytes.push(0x80 | ((charCode >> 12) & 0x3f));
            bytes.push(0x80 | ((charCode >> 6) & 0x3f));
            bytes.push(0x80 | (charCode & 0x3f));
        }
    }
    this.writeBytes(bytes);
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

Buffer.prototype.writeBytes = function (bytes) {
    for (var i = 0; i < bytes.length; i++) {
        this.buffer[this.offset + i] = bytes[i];
    }
    this.offset += bytes.length;
};

function hexStringToBytes(hex) {
    var bytes = [];
    for (var c = 0; c < hex.length; c += 2) {
        bytes.push(parseInt(hex.substr(c, 2), 16));
    }
    return bytes;
}
