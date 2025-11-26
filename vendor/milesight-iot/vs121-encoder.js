/**
 * Payload Encoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product VS121
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
    if ("confirm_mode_enable" in payload) {
        encoded = encoded.concat(setConfirmModeEnable(payload.confirm_mode_enable));
    }
    if ("adr_enable" in payload) {
        encoded = encoded.concat(setADREnable(payload.adr_enable));
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
    if ("d2d_enable" in payload) {
        encoded = encoded.concat(setD2DEnable(payload.d2d_enable));
    }
    if ("d2d_key" in payload) {
        encoded = encoded.concat(setD2DKey(payload.d2d_key));
    }
    if ("d2d_occupied_config" in payload) {
        encoded = encoded.concat(setD2DOccupiedConfig(payload.d2d_occupied_config));
    }
    if ("d2d_vacant_config" in payload) {
        encoded = encoded.concat(setD2DVacantConfig(payload.d2d_vacant_config));
    }
    if ("region_people_counting_enable" in payload) {
        encoded = encoded.concat(setRegionPeopleCountingEnable(payload.region_people_counting_enable));
    }
    if ("region_people_counting_dwell_config" in payload) {
        encoded = encoded.concat(setRegionPeopleCountingDwellConfig(payload.region_people_counting_dwell_config));
    }
    if ("report_regularly_enable" in payload) {
        encoded = encoded.concat(setReportRegularlyEnable(payload.report_regularly_enable));
    }
    if ("periodic_report_scheme" in payload) {
        encoded = encoded.concat(setPeriodicReportScheme(payload.periodic_report_scheme));
    }
    if ("on_the_dot_report_interval" in payload) {
        encoded = encoded.concat(setOnTheDotReportInterval(payload.on_the_dot_report_interval));
    }
    if ("from_now_on_report_interval" in payload) {
        encoded = encoded.concat(setFromNowOnReportInterval(payload.from_now_on_report_interval));
    }
    if ("people_counting_report_mode" in payload) {
        encoded = encoded.concat(setPeopleCountingReportMode(payload.people_counting_report_mode));
    }
    if ("people_count_change_report_enable" in payload) {
        encoded = encoded.concat(setPeopleCountChangeReportEnable(payload.people_count_change_report_enable));
    }
    if ("people_count_jitter" in payload) {
        encoded = encoded.concat(setPeopleCountJitter(payload.people_count_jitter));
    }
    if ("report_with_timestamp" in payload) {
        encoded = encoded.concat(setReportWithTimestamp(payload.report_with_timestamp));
    }
    if ("line_detect_enable" in payload) {
        encoded = encoded.concat(setLineDetectEnable(payload.line_detect_enable));
    }
    if ("line_detect_report_enable" in payload) {
        encoded = encoded.concat(setLineDetectReportEnable(payload.line_detect_report_enable));
    }
    if ("clear_cumulative_count" in payload) {
        encoded = encoded.concat(clearCumulativeCount(payload.clear_cumulative_count));
    }
    if ("timed_reset_cumulative_enable" in payload) {
        encoded = encoded.concat(setTimedResetCumulativeEnable(payload.timed_reset_cumulative_enable));
    }
    if ("reset_cumulative_schedule" in payload) {
        for (var i = 0; i < payload.reset_cumulative_schedule.length; i++) {
            encoded = encoded.concat(setResetCumulativeSchedule(payload.reset_cumulative_schedule[i]));
        }
    }
    if ("detect_region_config" in payload) {
        encoded = encoded.concat(setDetectRegionConfig(payload.detect_region_config));
    }
    if ("time_schedule_config" in payload) {
        encoded = encoded.concat(setScheduleSetting(payload.time_schedule_config[i]));
    }
    if ("time_schedule" in payload) {
        for (var i = 0; i < payload.time_schedule.length; i++) {
            encoded = encoded.concat(setTimeSchedule(payload.time_schedule[i]));
        }
    }
    if ("time_config" in payload) {
        encoded = encoded.concat(setTimeConfig(payload.time_config));
    }
    if ("log_level" in payload) {
        encoded = encoded.concat(setLogConfig(payload.log_level));
    }
    if ("filter_u_turn_enable" in payload) {
        encoded = encoded.concat(setFilterUTurn(payload.filter_u_turn_enable));
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
 * confirm_mode_enable
 * @param {number} confirm_mode_enable values: (0: disable, 1: enable)
 * @example { "confirm_mode_enable": 1 }
 */
function setConfirmModeEnable(confirm_mode_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(confirm_mode_enable) === -1) {
        throw new Error("confirm_mode_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x04);
    buffer.writeUInt8(getValue(enable_map, confirm_mode_enable));
    return buffer.toBytes();
}

/**
 * set ADR
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
 * set rejoin config
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
 * set tx power
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
 * set LoRaWAN version
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
 * D2D occupied mode config
 * @param {object} d2d_occupied_config 
 * @param {number} d2d_occupied_config.region
 * @param {number} d2d_occupied_config.enable values: (0: disable, 1: enable)
 * @param {string} d2d_occupied_config.command
 * @example { "d2d_occupied_config": { "region": 0, "max_count": 10 } }
 */
function setD2DOccupiedConfig(d2d_occupied_config) {
    var region = d2d_occupied_config.region;
    var enable = d2d_occupied_config.enable;
    var command = d2d_occupied_config.command;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("d2d_occupied_config.enable must be one of " + enable_values.join(", "));
    }
    if (command.length !== 4) {
        throw new Error("d2d_occupied_config.command must be 4 characters");
    }
    if (!/^[0-9a-fA-F]+$/.test(command)) {
        throw new Error("d2d_occupied_config.command must be hex string [0-9A-F]");
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x8e);
    buffer.writeUInt8(region - 1);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeD2DCommand(command, "0000");
    return buffer.toBytes();
}

/**
 * D2D Vacant mode config
 * @param {object} d2d_vacant_config 
 * @param {number} d2d_vacant_config.region
 * @param {number} d2d_vacant_config.enable values: (0: disable, 1: enable)
 * @param {string} d2d_vacant_config.command
 * @param {number} d2d_vacant_config.delay_time unit: second
 * @example { "d2d_vacant_config": { "region": 0, "max_count": 10 } }
 */
function setD2DVacantConfig(d2d_vacant_config) {
    var region = d2d_vacant_config.region;
    var enable = d2d_vacant_config.enable;
    var command = d2d_vacant_config.command;
    var delay_time = d2d_vacant_config.delay_time;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("d2d_vacant_config.enable must be one of " + enable_values.join(", "));
    }
    if (command.length !== 4) {
        throw new Error("d2d_vacant_config.command must be 4 characters");
    }
    if (!/^[0-9a-fA-F]+$/.test(command)) {
        throw new Error("d2d_vacant_config.command must be hex string [0-9A-F]");
    }

    var buffer = new Buffer(8);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x90);
    buffer.writeUInt8(region - 1);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeD2DCommand(command, "0000");
    buffer.writeUInt16LE(delay_time);
    return buffer.toBytes();
}

/**
 * set region people counting enable
 * @param {number} region_people_counting_enable values: (0: disable, 1: enable)
 * @example { "region_people_counting_enable": 1 }
 */
function setRegionPeopleCountingEnable(region_people_counting_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(region_people_counting_enable) === -1) {
        throw new Error("region_people_counting_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x50);
    buffer.writeUInt8(getValue(enable_map, region_people_counting_enable));
    return buffer.toBytes();
}

/**
 * set region people counting dwell config
 * @param {object} region_people_counting_dwell_config
 * @param {number} region_people_counting_dwell_config.enable values: (0: disable, 1: enable)
 * @param {number} region_people_counting_dwell_config.min_dwell_time unit: second
 * @example { "region_people_counting_dwell_config": { "enable": 1, "min_dwell_time": 5} }
 */
function setRegionPeopleCountingDwellConfig(region_people_counting_dwell_config) {
    var enable = region_people_counting_dwell_config.enable;
    var min_dwell_time = region_people_counting_dwell_config.min_dwell_time;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("region_people_counting_dwell_config.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x92);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt16LE(min_dwell_time);
    return buffer.toBytes();
}

/**
 * set report regularly enable
 * @param {number} report_regularly_enable values: (0: disable, 1: enable)
 * @example { "report_regularly_enable": 1 }
 */
function setReportRegularlyEnable(report_regularly_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(report_regularly_enable) === -1) {
        throw new Error("report_regularly_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x43);
    buffer.writeUInt8(getValue(enable_map, report_regularly_enable));
    return buffer.toBytes();
}


/**
 * set periodic report scheme
 * @param {number} periodic_report_scheme values: (0: on_the_dot, 1: from_now_on)
 * @example { "periodic_report_scheme": 0 }
 */
function setPeriodicReportScheme(periodic_report_scheme) {
    var scheme_map = { 0: "on_the_dot", 1: "from_now_on" };
    var scheme_values = getValues(scheme_map);
    if (scheme_values.indexOf(periodic_report_scheme) === -1) {
        throw new Error("periodic_report_scheme must be one of " + scheme_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x10);
    buffer.writeUInt8(getValue(scheme_map, periodic_report_scheme));
    return buffer.toBytes();
}

/**
 * set on the dot report interval
 * @param {number} on_the_dot_report_interval values: (0: 5min, 1: 10min, 2: 15min, 3: 30min, 4: 1h, 5: 4h, 6: 6h, 7: 8h, 8: 12h)
 * @example { "on_the_dot_report_interval": 0 }
 */
function setOnTheDotReportInterval(on_the_dot_report_interval) {
    var interval_map = { 0: "5min", 1: "10min", 2: "15min", 3: "30min", 4: "1h", 5: "4h", 6: "6h", 7: "8h", 8: "12h" };
    var interval_values = getValues(interval_map);
    if (interval_values.indexOf(on_the_dot_report_interval) === -1) {
        throw new Error("on_the_dot_report_interval must be one of " + interval_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x11);
    buffer.writeUInt8(getValue(interval_map, on_the_dot_report_interval));
    return buffer.toBytes();
}

/**
 * set from now on report interval
 * @param {number} from_now_on_report_interval unit: second, range: [5, 65535]
 * @example { "from_now_on_report_interval": 10 }
 */
function setFromNowOnReportInterval(from_now_on_report_interval) {
    if (from_now_on_report_interval < 5 || from_now_on_report_interval > 65535) {
        throw new Error("from_now_on_report_interval must be between 5 and 65535");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x03);
    buffer.writeUInt16LE(from_now_on_report_interval);
    return buffer.toBytes();
}

/**
 * set people counting report mode
 * @param {number} people_counting_report_mode value: (0: zero_to_nonzero, 1: once_result_change)
 * @example { "people_counting_report_mode": 0 }
 */
function setPeopleCountingReportMode(people_counting_report_mode) {
    var report_mode_map = { 0: "zero_to_nonzero", 1: "once_result_change" };
    var report_mode_values = getValues(report_mode_map);
    if (report_mode_values.indexOf(people_counting_report_mode) === -1) {
        throw new Error("people_counting_report_mode must be one of " + report_mode_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x45);
    buffer.writeUInt8(getValue(report_mode_map, people_counting_report_mode));
    return buffer.toBytes();
}

/**
 * set people count change report enable
 * @param {number} people_count_change_report_enable values: (0: disable, 1: enable)
 * @example { "people_count_change_report_enable": 1 }
 */
function setPeopleCountChangeReportEnable(people_count_change_report_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(people_count_change_report_enable) === -1) {
        throw new Error("people_count_change_report_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x44);
    buffer.writeUInt8(getValue(enable_map, people_count_change_report_enable));
    return buffer.toBytes();
}

/**
 * set people count jitter
 * @param {object} people_count_jitter_config
 * @param {number} people_count_jitter_config.enable values: (0: disable, 1: enable)
 * @param {number} people_count_jitter_config.time unit: second, range: [1, 60]
 * @example { "people_count_jitter_config": { "time": 2 } }
 */
function setPeopleCountJitter(people_count_jitter_config) {
    var enable = people_count_jitter_config.enable;
    var time = people_count_jitter_config.time;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("people_count_jitter_config.enable must be one of " + enable_values.join(", "));
    }
    if (time < 1 || time > 60) {
        throw new Error("people_count_jitter_config.time must be between 1 and 60");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x46);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt16LE(time);
    return buffer.toBytes();
}

/**
 * set report with timestamp
 * @param {number} report_with_timestamp values: (0: no, 1: yes)
 * @example { "report_with_timestamp": 1 }
 */
function setReportWithTimestamp(report_with_timestamp) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(report_with_timestamp) === -1) {
        throw new Error("report_with_timestamp must be one of " + yes_no_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x93);
    buffer.writeUInt8(getValue(yes_no_map, report_with_timestamp));
    return buffer.toBytes();
}

/**
 * set line detect enable
 * @param {number} line_detect_enable values: (0: disable, 1: enable)
 * @example { "line_detect_enable": 1 }
 */
function setLineDetectEnable(line_detect_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(line_detect_enable) === -1) {
        throw new Error("line_detect_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x48);
    buffer.writeUInt8(getValue(enable_map, line_detect_enable));
    return buffer.toBytes();
}

/**
 * set line detect report enable
 * @param {number} line_detect_report_enable values: (0: disable, 1: enable)
 * @example { "line_detect_report_enable": 1 }
 */
function setLineDetectReportEnable(line_detect_report_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(line_detect_report_enable) === -1) {
        throw new Error("line_detect_report_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x3d);
    buffer.writeUInt8(getValue(enable_map, line_detect_report_enable));
    return buffer.toBytes();
}

/**
 * clear cumulative count
 * @param {number} clear_cumulative_count values: (0: no, 1: yes)
 * @example { "clear_cumulative_count": 1 }
 */
function clearCumulativeCount(clear_cumulative_count) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(clear_cumulative_count) === -1) {
        throw new Error("clear_cumulative_count must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, clear_cumulative_count) === 0) {
        return [];
    }
    return [0xff, 0x51, 0xff];
}

/**
 * set timed reset cumulative enable
 * @param {number} timed_reset_cumulative_enable values: (0: disable, 1: enable)
 * @example { "timed_reset_cumulative_enable": 1 }
 */
function setTimedResetCumulativeEnable(timed_reset_cumulative_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(timed_reset_cumulative_enable) === -1) {
        throw new Error("timed_reset_cumulative_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x94);
    buffer.writeUInt8(getValue(enable_map, timed_reset_cumulative_enable));
    return buffer.toBytes();
}

/**
 * set reset cumulative schedule
 * @param {object} reset_cumulative_schedule
 * @param {number} reset_cumulative_schedule.mode values: (0: modify, 1: add, 2: delete)
 * @param {number} reset_cumulative_schedule.index range: [1, 5]
 * @param {object} reset_cumulative_schedule.week_cycle
 * @param {number} reset_cumulative_schedule.week_cycle.monday values: (0: disable, 1: enable)
 * @param {number} reset_cumulative_schedule.week_cycle.tuesday values: (0: disable, 1: enable)
 * @param {number} reset_cumulative_schedule.week_cycle.wednesday values: (0: disable, 1: enable)
 * @param {number} reset_cumulative_schedule.week_cycle.thursday values: (0: disable, 1: enable)
 * @param {number} reset_cumulative_schedule.week_cycle.friday values: (0: disable, 1: enable)
 * @param {number} reset_cumulative_schedule.week_cycle.saturday values: (0: disable, 1: enable)
 * @param {number} reset_cumulative_schedule.week_cycle.sunday values: (0: disable, 1: enable)
 * @param {number} reset_cumulative_schedule.time unit: minute, "20:30" -> 20*60 + 30 = 1230min
 * @example { "reset_cumulative_schedule": { "index": 1, "week_cycle": { "monday": 1, "tuesday": 1, "wednesday": 1, "thursday": 1, "friday": 1, "saturday": 1, "sunday": 1 }, "time": 10 } }
 */
function setResetCumulativeSchedule(reset_cumulative_schedule) {
    var mode = reset_cumulative_schedule.mode;
    var index = reset_cumulative_schedule.index;
    var week_cycle = reset_cumulative_schedule.week_cycle;
    var time = reset_cumulative_schedule.time;

    var mode_map = { 0: "modify", 1: "add", 2: "delete" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(mode) === -1) {
        throw new Error("reset_cumulative_schedule._item.mode must be one of " + mode_values.join(", "));
    }
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    var week_mask = 0x00;
    var week_offset_bitmap = { "sun": 0, "mon": 1, "tue": 2, "wed": 3, "thu": 4, "fri": 5, "sat": 6 };
    for (var key in week_cycle) {
        if (key in week_cycle) {
            if (enable_values.indexOf(week_cycle[key]) === -1) {
                throw new Error("reset_cumulative_schedule._item.week_cycle[" + key + "] must be one of " + enable_values.join(", "));
            }
            week_mask |= getValue(enable_map, week_cycle[key]) << week_offset_bitmap[key];
        }
    }

    var buffer = new Buffer(8);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x95);
    buffer.writeUInt8(getValue(mode_map, mode));
    buffer.writeUInt8(index - 1);
    buffer.writeUInt8(week_mask);
    buffer.writeUInt24LE(time);
    return buffer.toBytes();
}

/**
 * set detect region config
 * @param {object} detect_region_config
 * @param {number} detect_region_config.enable values: (0: disable, 1: enable)
 * @param {number} detect_region_config.detection_type values: (0: mapped_region, 1: unmapped_region)
 * @param {number} detect_region_config.reporting_type values: (0: occupancy, 1: region_people_counting)
 * @example { "detect_region_config": { "enable": 1, "detection_type": 0, "reporting_type": 0 } }
 */
function setDetectRegionConfig(detect_region_config) {
    var enable = detect_region_config.enable;
    var detection_type = detect_region_config.detection_type;
    var reporting_type = detect_region_config.reporting_type;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("enable must be one of " + enable_values.join(", "));
    }
    var detection_type_map = { 0: "mapped_region", 1: "unmapped_region" };
    var detection_type_values = getValues(detection_type_map);
    if (detection_type_values.indexOf(detection_type) === -1) {
        throw new Error("detection_type must be one of " + detection_type_values.join(", "));
    }
    var reporting_type_map = { 0: "occupancy", 1: "region_people_counting" };
    var reporting_type_values = getValues(reporting_type_map);
    if (reporting_type_values.indexOf(reporting_type) === -1) {
        throw new Error("reporting_type must be one of " + reporting_type_values.join(", "));
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x96);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(getValue(detection_type_map, detection_type));
    buffer.writeUInt8(getValue(reporting_type_map, reporting_type));
    return buffer.toBytes();
}

/**
 * set schedule setting
 * @param {object} time_schedule_config
 * @param {number} time_schedule_config.enable values: (0: disable, 1: enable)
 * @param {number} time_schedule_config.people_counting_type values: (0: region_people_counting, 1: line_crossing_counting, 2: people_flow_analysis)
 * @example { "time_schedule_config": { "enable": 1, "people_counting_type": 0 } }
 */
function setScheduleSetting(time_schedule_config) {
    var enable = time_schedule_config.enable;
    var people_counting_type = time_schedule_config.people_counting_type;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("time_schedule_config.enable must be one of " + enable_values.join(", "));
    }
    var people_counting_type_map = { 0: "region_people_counting", 1: "line_crossing_counting", 2: "people_flow_analysis" };
    var people_counting_type_values = getValues(people_counting_type_map);
    if (people_counting_type_values.indexOf(people_counting_type) === -1) {
        throw new Error("time_schedule_config.people_counting_type must be one of " + people_counting_type_values.join(", "));
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x97);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(getValue(people_counting_type_map, people_counting_type));
    return buffer.toBytes();
}

/**
 * set time schedule
 * @param {object} time_schedule
 * @param {number} time_schedule.people_counting_type values: (0: region_people_counting, 1: line_crossing_counting, 2: people_flow_analysis)
 * @param {number} time_schedule.period values: (1: period, 2: once, 3: once_per_day)
 * @param {number} time_schedule.weekday values: (0: sun, 1: mon, 2: tue, 3: wed, 4: thu, 5: fri, 6: sat)
 * @param {number} time_schedule.start_hour range: [0, 23]
 * @param {number} time_schedule.start_minute range: [0, 59]
 * @param {number} time_schedule.end_hour range: [0, 23]
 * @param {number} time_schedule.end_minute range: [0, 59]
 * @example { "time_schedule": { "people_counting_type": 0, "period": 1, "weekday": 0, "start_hour": 0, "start_minute": 0, "end_hour": 23, "end_minute": 59 } }
 */
function setTimeSchedule(time_schedule) {
    var people_counting_type = time_schedule.people_counting_type;
    var period = time_schedule.period;
    var weekday = time_schedule.weekday;
    var start_hour = time_schedule.start_hour;
    var start_minute = time_schedule.start_minute;
    var end_hour = time_schedule.end_hour;
    var end_minute = time_schedule.end_minute;

    var people_counting_type_map = { 0: "region_people_counting", 1: "line_crossing_counting", 2: "people_flow_analysis" };
    var people_counting_type_values = getValues(people_counting_type_map);
    if (people_counting_type_values.indexOf(people_counting_type) === -1) {
        throw new Error("time_schedule._item.people_counting_type must be one of " + people_counting_type_values.join(", "));
    }
    var weekday_map = { 0: "sun", 1: "mon", 2: "tue", 3: "wed", 4: "thu", 5: "fri", 6: "sat" };
    var weekday_values = getValues(weekday_map);
    if (weekday_values.indexOf(weekday) === -1) {
        throw new Error("time_schedule._item.weekday must be one of " + weekday_values.join(", "));
    }
    if (period < 1 || period > 3) {
        throw new Error("time_schedule._item.period must be between 1 and 3");
    }
    if (start_hour < 0 || start_hour > 23) {
        throw new Error("time_schedule._item.start_hour must be between 0 and 23");
    }
    if (start_minute < 0 || start_minute > 59) {
        throw new Error("time_schedule._item.start_minute must be between 0 and 59");
    }
    if (end_hour < 0 || end_hour > 23) {
        throw new Error("time_schedule._item.end_hour must be between 0 and 23");
    }
    if (end_minute < 0 || end_minute > 59) {
        throw new Error("time_schedule._item.end_minute must be between 0 and 59");
    }

    var buffer = new Buffer(8);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x99);
    buffer.writeUInt8(getValue(people_counting_type_map, people_counting_type));
    buffer.writeUInt8(getValue(weekday_map, weekday));
    buffer.writeUInt8(period - 1);
    buffer.writeUInt8(start_hour);
    buffer.writeUInt8(start_minute);
    buffer.writeUInt8(end_hour);
    buffer.writeUInt8(end_minute);
    return buffer.toBytes();
}

/**
 * set time config
 * @param {object} time_config
 * @param {number} time_config.mode values: (0: sync_from_gateway, 1: manual)
 * @param {number} time_config.timestamp unit: second, range: [0, 2147483647]
 * @example { "time_config": { "mode": 0, "timestamp": 1715145600 } }
 */
function setTimeConfig(time_config) {
    var mode = time_config.mode;
    var timestamp = time_config.timestamp || 0;

    var mode_map = { 0: "sync_from_gateway", 1: "manual" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(mode) === -1) {
        throw new Error("time_config.mode must be one of " + mode_values.join(", "));
    }

    var buffer = new Buffer(7);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x91);
    buffer.writeUInt8(getValue(mode_map, mode));
    buffer.writeUInt32LE(timestamp);
    return buffer.toBytes();
}

/**
 * set filter u turn
 * @param {number} filter_u_turn_enable values: (0: disable, 1: enable)
 * @example { "filter_u_turn_enable": 1 }
 */
function setFilterUTurn(filter_u_turn_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(filter_u_turn_enable) === -1) {
        throw new Error("filter_u_turn_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x98);
    buffer.writeUInt8(getValue(enable_map, filter_u_turn_enable));
    return buffer.toBytes();
}

/**
 * set log level
 * @param {number} log_level values: (2: error, 4: debug)
 * @example { "log_level": 2 }
 */
function setLogConfig(log_level) {
    var log_level_map = { 2: "error", 4: "debug" };
    var log_level_values = getValues(log_level_map);
    if (log_level_values.indexOf(log_level) === -1) {
        throw new Error("log_level must be one of " + log_level_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x88);
    buffer.writeUInt8(0x00);
    buffer.writeUInt8(getValue(log_level_map, log_level));
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

function hexStringToBytes(hex) {
    var bytes = [];
    for (var c = 0; c < hex.length; c += 2) {
        bytes.push(parseInt(hex.substr(c, 2), 16));
    }
    return bytes;
}