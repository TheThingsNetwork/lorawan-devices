function decodeUplink(input) {
    var res = Decoder(input.bytes, input.fPort);
    if (res.error) {
        return {
            errors: [res.error],
        };
    }
    return {
        data: res,
    };
}
/**
 * Payload Decoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product VS373
 */
var RAW_VALUE = 0x00;

/* eslint no-redeclare: "off" */
/* eslint-disable */

// The Things Network
function Decoder(bytes, port) {
    return milesightDeviceDecode(bytes);
}
/* eslint-enable */

function milesightDeviceDecode(bytes) {
    var decoded = {};

    for (var i = 0; i < bytes.length; ) {
        var channel_id = bytes[i++];
        var channel_type = bytes[i++];

        // IPSO VERSION
        if (channel_id === 0xff && channel_type === 0x01) {
            decoded.ipso_version = readProtocolVersion(bytes[i]);
            i += 1;
        }
        // HARDWARE VERSION
        else if (channel_id === 0xff && channel_type === 0x09) {
            decoded.hardware_version = readHardwareVersion(bytes.slice(i, i + 2));
            i += 2;
        }
        // FIRMWARE VERSION
        else if (channel_id === 0xff && channel_type === 0x0a) {
            decoded.firmware_version = readFirmwareVersion(bytes.slice(i, i + 2));
            i += 2;
        }
        // DEVICE STATUS
        else if (channel_id === 0xff && channel_type === 0x0b) {
            decoded.device_status = readDeviceStatus(bytes[i]);
            i += 1;
        }
        // LORAWAN CLASS
        else if (channel_id === 0xff && channel_type === 0x0f) {
            decoded.lorawan_class = readLoRaWANClass(bytes[i]);
            i += 1;
        }
        // PRODUCT SERIAL NUMBER
        else if (channel_id === 0xff && channel_type === 0x16) {
            decoded.sn = readSerialNumber(bytes.slice(i, i + 8));
            i += 8;
        }
        // TSL VERSION
        else if (channel_id === 0xff && channel_type === 0xff) {
            decoded.tsl_version = readTslVersion(bytes.slice(i, i + 2));
            i += 2;
        }
        // DETECTION TARGET (v1.0.1)
        else if (channel_id === 0x03 && channel_type === 0xf8) {
            decoded.detection_status = readDetectionStatus(bytes[i]);
            decoded.target_status = readTargetStatus(bytes[i + 1]);
            decoded.use_time_now = readUInt16LE(bytes.slice(i + 2, i + 4));
            decoded.use_time_today = readUInt16LE(bytes.slice(i + 4, i + 6));
            i += 6;
        }
        // DETECTION TARGET (v1.0.2)
        else if (channel_id === 0x07 && channel_type === 0xb0) {
            decoded.detection_status = readDetectionStatus(bytes[i]);
            decoded.target_status = readTargetStatus(bytes[i + 1]);
            decoded.use_time_now = readUInt24LE(bytes.slice(i + 2, i + 5));
            decoded.use_time_today = readUInt24LE(bytes.slice(i + 5, i + 8));
            i += 8;
        }
        // REGION OCCUPANCY (v1.0.1)
        else if (channel_id === 0x04 && channel_type === 0xf9) {
            // for the old firmware, the occupancy status is 0: occupied, 1: vacant
            // for the new firmware, the occupancy status is 0: vacant, 1: occupied
            decoded.region_1_occupancy = readOccupancyStatus(bytes[i] === 1 ? 0 : 1);
            decoded.region_2_occupancy = readOccupancyStatus(bytes[i + 1] === 1 ? 0 : 1);
            decoded.region_3_occupancy = readOccupancyStatus(bytes[i + 2] === 1 ? 0 : 1);
            decoded.region_4_occupancy = readOccupancyStatus(bytes[i + 3] === 1 ? 0 : 1);
            i += 4;
        }
        // REGION TYPE (v1.0.2)
        else if (channel_id === 0x09 && channel_type === 0xb2) {
            for (var j = 0; j <= 5; j++) {
                var region_chn_name = "region_" + (j + 1) + "_type";
                decoded[region_chn_name] = readRegionType(bytes[i + j]);
            }
            i += 6;
        }
        // REGION OCCUPY(v1.0.2)
        else if (channel_id === 0x0a && channel_type === 0xb3) {
            var region_count = readUInt8(bytes[i]);
            var data = readUInt32LE(bytes.slice(i + 1, i + 5));
            for (var j = 0; j < region_count; j++) {
                var region_chn_name = "region_" + (j + 1) + "_occupancy";
                decoded[region_chn_name] = readOccupancyStatus((data >>> j) & 0x01);
            }
            i += 5;
        }
        // OUT OF BED (v1.0.1)
        else if (channel_id === 0x05 && channel_type === 0xfa) {
            decoded.region_1_out_of_bed_time = readUInt16LE(bytes.slice(i, i + 2));
            decoded.region_2_out_of_bed_time = readUInt16LE(bytes.slice(i + 2, i + 4));
            decoded.region_3_out_of_bed_time = readUInt16LE(bytes.slice(i + 4, i + 6));
            decoded.region_4_out_of_bed_time = readUInt16LE(bytes.slice(i + 6, i + 8));
            i += 8;
        }
        // OUT OF BED (v1.0.2) - REGION 1-3
        else if (channel_id === 0x0b && channel_type === 0xb4) {
            decoded.region_1_out_of_bed_time = readUInt24LE(bytes.slice(i, i + 3));
            decoded.region_2_out_of_bed_time = readUInt24LE(bytes.slice(i + 3, i + 6));
            decoded.region_3_out_of_bed_time = readUInt24LE(bytes.slice(i + 6, i + 9));
            i += 9;
        }
        // OUT OF BED (v1.0.2) - REGION 4-6
        else if (channel_id === 0x0c && channel_type === 0xb4) {
            decoded.region_4_out_of_bed_time = readUInt24LE(bytes.slice(i, i + 3));
            decoded.region_5_out_of_bed_time = readUInt24LE(bytes.slice(i + 3, i + 6));
            decoded.region_6_out_of_bed_time = readUInt24LE(bytes.slice(i + 6, i + 9));
            i += 9;
        }
        // ALARM
        else if (channel_id === 0x06 && channel_type === 0xfb) {
            var event = {};
            event.alarm_id = readUInt16LE(bytes.slice(i, i + 2));
            event.alarm_type = readAlarmType(bytes[i + 2]);
            event.alarm_status = readAlarmStatus(bytes[i + 3]);
            // EVENT TYPE: OUT OF BED
            var alarm_type = readUInt8(bytes[i + 2]);
            // out_of_bed, bradynea, tachypnea
            if (alarm_type === 3 || alarm_type === 6 || alarm_type === 7) {
                event.region_id = readUInt8(bytes[i + 4]);
            }
            i += 5;
            decoded.events = decoded.events || [];
            decoded.events.push(event);
        }
        // BREATHING DETECTION
        else if (channel_id === 0x08 && channel_type === 0xb1) {
            decoded.respiratory_status = readBreathStatus(bytes[i]);
            decoded.respiratory_rate = readUInt16LE(bytes.slice(i + 1, i + 3)) / 100;
            i += 3;
        }
        // HISTORY DATA
        else if (channel_id === 0x20 && channel_type === 0xce) {
            var data = {};
            data.timestamp = readUInt32LE(bytes.slice(i, i + 4));
            data.alarm_id = readUInt16LE(bytes.slice(i + 4, i + 6));
            data.alarm_type = readAlarmType(bytes[i + 6]);
            data.alarm_status = readAlarmStatus(bytes[i + 7]);
            var alarm_type = readUInt8(bytes[i + 6]);
            // EVENT TYPE: OUT OF BED
            if (alarm_type === 3 || alarm_type === 6 || alarm_type === 7) {
                data.region_id = readUInt8(bytes[i + 8]);
            }
            i += 9;
            decoded.history = decoded.history || [];
            decoded.history.push(data);
        }
        // DOWNLINK RESPONSE
        else if (channel_id === 0xfe || channel_id === 0xff) {
            var result = handle_downlink_response(channel_type, bytes, i);
            decoded = Object.assign(decoded, result.data);
            i = result.offset;
        } else if (channel_id === 0xf8 || channel_id === 0xf9) {
            var result = handle_downlink_response_ext(channel_id, channel_type, bytes, i);
            decoded = Object.assign(decoded, result.data);
            i = result.offset;
        } else {
            break;
        }
    }

    return decoded;
}

function handle_downlink_response(channel_type, bytes, offset) {
    var decoded = {};

    switch (channel_type) {
        case 0x04:
            decoded.confirm_mode_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x10:
            decoded.reboot = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x11:
            decoded.timestamp = readUInt32LE(bytes.slice(offset, offset + 4));
            offset += 4;
            break;
        case 0x28:
            decoded.report_status = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x2f:
            decoded.led_indicator_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x35:
            decoded.d2d_key = bytesToHexString(bytes.slice(offset, offset + 8));
            offset += 8;
            break;
        case 0x3e:
            decoded.buzzer_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x40:
            decoded.adr_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x42:
            decoded.wifi_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x64:
            decoded.release_alarm = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x69:
            decoded.retransmit_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x6a:
            var interval_type = readUInt8(bytes[offset]);
            switch (interval_type) {
                case 0:
                    decoded.retransmit_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
                    break;
                case 1:
                    decoded.resend_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
                    break;
            }
            offset += 3;
            break;
        case 0x84:
            decoded.d2d_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x8e:
            // ignore the first byte
            decoded.report_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            offset += 3;
            break;
        case 0x96:
            var config = readD2DMasterConfig(bytes.slice(offset, offset + 8));
            offset += 8;

            decoded.d2d_master_config = decoded.d2d_master_config || [];
            decoded.d2d_master_config.push(config);
            break;
        default:
            throw new Error("unknown downlink response");
    }

    return { data: decoded, offset: offset };
}

function handle_downlink_response_ext(code, channel_type, bytes, offset) {
    var decoded = {};

    switch (channel_type) {
        case 0x48:
            var region_id = readUInt8(bytes[offset]) + 1;
            var region_name = "region_" + region_id;
            decoded.delete_region = {};
            decoded.delete_region[region_name] = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x49:
            var region_settings = readRegionSettings(bytes.slice(offset, offset + 9));
            offset += 9;
            decoded.region_settings = decoded.region_settings || [];
            decoded.region_settings.push(region_settings);
            break;
        case 0x4a:
            var region_detection_settings = readRegionDetectionSettings(bytes.slice(offset, offset + 5));
            offset += 5;
            decoded.region_detection_settings = decoded.region_detection_settings || [];
            decoded.region_detection_settings.push(region_detection_settings);
            break;
        case 0x4b:
            var bed_detection_settings = readBedDetectionSettings(bytes.slice(offset, offset + 9));
            offset += 9;
            decoded.bed_detection_settings = decoded.bed_detection_settings || [];
            decoded.bed_detection_settings.push(bed_detection_settings);
            break;
        case 0x4c:
            var d2d_slave_config = readD2DSlaveConfig(bytes.slice(offset, offset + 5));
            offset += 5;
            decoded.d2d_slave_config = decoded.d2d_slave_config || [];
            decoded.d2d_slave_config.push(d2d_slave_config);
            break;
        case 0x4e:
            decoded.digital_output = readDigitalOutput(bytes[offset]);
            offset += 1;
            break;
        case 0x4d:
            decoded.wifi_ssid_hidden = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x4f:
            decoded.detection_region_settings = readDetectionRegion(bytes.slice(offset, offset + 12));
            offset += 12;
            break;
        case 0x50:
            decoded.detection_settings = readDetectionSettings(bytes.slice(offset, offset + 2));
            offset += 2;
            break;
        case 0x51:
            decoded.fall_detection_settings = readFallDetectionSettings(bytes.slice(offset, offset + 6));
            offset += 6;
            break;
        case 0x52:
            decoded.dwell_detection_settings = readDwellDetectionSettings(bytes.slice(offset, offset + 3));
            offset += 3;
            break;
        case 0x53:
            decoded.motion_detection_settings = readMotionDetectionSettings(bytes.slice(offset, offset + 3));
            offset += 3;
            break;
        case 0x56:
            decoded.existence_detection_settings = readExistenceDetectionSettings(bytes.slice(offset, offset + 2));
            offset += 2;
            break;
        case 0x85:
            decoded.rejoin_config = {};
            decoded.rejoin_config.enable = readEnableStatus(bytes[offset]);
            decoded.rejoin_config.max_count = readUInt8(bytes[offset + 1]);
            offset += 2;
            break;
        case 0x86:
            decoded.data_rate = readUInt8(bytes[offset]);
            offset += 1;
            break;
        case 0x87:
            decoded.tx_power_level = readUInt8(bytes[offset]);
            offset += 1;
            break;
        case 0x91:
            decoded.time_sync_config = {};
            decoded.time_sync_config.mode = readTimeSyncMode(bytes[offset]);
            decoded.time_sync_config.timestamp = readUInt32LE(bytes.slice(offset + 1, offset + 5));
            offset += 5;
            break;
        case 0xb1:
            decoded.sleep_detection_config = {};
            decoded.sleep_detection_config.enable = readEnableStatus(bytes[offset]);
            decoded.sleep_detection_config.start_time = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            decoded.sleep_detection_config.end_time = readUInt16LE(bytes.slice(offset + 3, offset + 5));
            decoded.sleep_detection_config.out_of_bed_enable = readEnableStatus(bytes[offset + 5]);
            decoded.sleep_detection_config.out_of_bed_time = readUInt8(bytes[offset + 6]);
            offset += 7;
            break;
        case 0xb2:
            decoded.respiratory_detection_config = {};
            decoded.respiratory_detection_config.enable = readEnableStatus(bytes[offset]);
            decoded.respiratory_detection_config.min = readUInt8(bytes[offset + 1]);
            decoded.respiratory_detection_config.max = readUInt8(bytes[offset + 2]);
            offset += 3;
            break;
        case 0xb3:
            decoded.ai_fall_detection_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0xb4:
            decoded.confirm_fall_alarm = {};
            decoded.confirm_fall_alarm.alarm_id = readUInt16LE(bytes.slice(offset, offset + 2));
            decoded.confirm_fall_alarm.action = readConfirmAlarmType(bytes[offset + 2]);
            offset += 3;
            break;
        case 0xb5:
            decoded.trigger_digital_output_config = {};
            decoded.trigger_digital_output_config.enable = readEnableStatus(bytes[offset]);
            decoded.trigger_digital_output_config.fall = readEnableStatus(bytes[offset + 1]);
            decoded.trigger_digital_output_config.lying = readEnableStatus(bytes[offset + 2]);
            decoded.trigger_digital_output_config.out_of_bed = readEnableStatus(bytes[offset + 3]);
            decoded.trigger_digital_output_config.dwell = readEnableStatus(bytes[offset + 4]);
            decoded.trigger_digital_output_config.motionless = readEnableStatus(bytes[offset + 5]);
            offset += 6;
            break;
        default:
            throw new Error("unknown downlink response");
    }

    if (hasResultFlag(code)) {
        var result_value = readUInt8(bytes[offset]);
        offset += 1;

        if (result_value !== 0) {
            var request = decoded;
            decoded = {};
            decoded.device_response_result = {};
            decoded.device_response_result.channel_type = channel_type;
            decoded.device_response_result.result = readResultStatus(result_value);
            decoded.device_response_result.request = request;
        }
    }

    return { data: decoded, offset: offset };
}

function hasResultFlag(code) {
    return code === 0xf8;
}

function readResultStatus(status) {
    var status_map = { 0: "success", 1: "forbidden", 2: "invalid parameter" };
    return getValue(status_map, status);
}

function readProtocolVersion(bytes) {
    var major = (bytes & 0xf0) >> 4;
    var minor = bytes & 0x0f;
    return "v" + major + "." + minor;
}

function readHardwareVersion(bytes) {
    var major = (bytes[0] & 0xff).toString(16);
    var minor = (bytes[1] & 0xff) >> 4;
    return "v" + major + "." + minor;
}

function readFirmwareVersion(bytes) {
    var major = (bytes[0] & 0xff).toString(16);
    var minor = (bytes[1] & 0xff).toString(16);
    return "v" + major + "." + minor;
}

function readTslVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = bytes[1] & 0xff;
    return "v" + major + "." + minor;
}

function readSerialNumber(bytes) {
    var temp = [];
    for (var idx = 0; idx < bytes.length; idx++) {
        temp.push(("0" + (bytes[idx] & 0xff).toString(16)).slice(-2));
    }
    return temp.join("");
}

function readLoRaWANClass(type) {
    var lorawan_class_map = {
        0: "Class A",
        1: "Class B",
        2: "Class C",
        3: "Class CtoB",
    };
    return getValue(lorawan_class_map, type);
}

function readDeviceStatus(status) {
    var device_status_map = { 0: "off", 1: "on" };
    return getValue(device_status_map, status);
}

function readDetectionStatus(status) {
    var detection_status_map = {
        0: "normal",
        1: "vacant",
        2: "in_bed",
        3: "out_of_bed",
        4: "fall",
    };
    return getValue(detection_status_map, status);
}

function readBreathStatus(status) {
    var breath_status_map = {
        1: "no_data_input",
        2: "normal",
        3: "tachypnea",
        4: "bradypnea",
        5: "undetectable",
    };
    return getValue(breath_status_map, status);
}

function readTargetStatus(status) {
    var target_status_map = {
        0: "normal",
        1: "motionless",
        2: "abnormal",
        3: "lying_down",
    };
    return getValue(target_status_map, status);
}

function readOccupancyStatus(status) {
    var occupancy_status_map = {
        0: "vacant",
        1: "occupied",
    };
    return getValue(occupancy_status_map, status);
}

function readAlarmType(type) {
    var alarm_type_map = {
        0: "fall",
        1: "motionless",
        2: "dwell",
        3: "out_of_bed",
        4: "occupied",
        5: "vacant",
        6: "bradynea",
        7: "tachypnea",
        8: "lying_down",
    };
    return getValue(alarm_type_map, type);
}

function readAlarmStatus(status) {
    var alarm_status_map = {
        1: "alarm_triggered",
        2: "alarm_deactivated",
        3: "alarm_ignored",
        4: "respiratory_status",
    };
    return getValue(alarm_status_map, status);
}

function readEnableStatus(status) {
    var status_map = { 0: "disable", 1: "enable" };
    return getValue(status_map, status);
}

function readYesNoStatus(status) {
    var yes_no_status_map = { 0: "no", 1: "yes" };
    return getValue(yes_no_status_map, status);
}

function readDigitalOutput(status) {
    var digital_output_map = { 0: "low", 1: "high" };
    return getValue(digital_output_map, status);
}

function readDetectionRegion(bytes) {
    var detection_region = {};
    detection_region.x_min = readInt16LE(bytes.slice(0, 2));
    detection_region.x_max = readInt16LE(bytes.slice(2, 4));
    detection_region.y_min = readInt16LE(bytes.slice(4, 6));
    detection_region.y_max = readInt16LE(bytes.slice(6, 8));
    detection_region.z_max = readUInt16LE(bytes.slice(8, 10));
    detection_region.install_height = readUInt16LE(bytes.slice(10, 12));
    return detection_region;
}

function readDetectionSettings(bytes) {
    var detection_settings = {};
    detection_settings.mode = readDetectionMode(bytes[0]);
    detection_settings.sensitivity = readDetectionSensitivity(bytes[1]);
    return detection_settings;
}

function readDetectionMode(type) {
    var detection_mode_map = { 0: "default", 1: "bedroom", 2: "bathroom", 3: "public" };
    return getValue(detection_mode_map, type);
}

function readDetectionSensitivity(type) {
    var detection_sensitivity_map = { 0: "low", 1: "high", 2: "medium", 3: "custom" };
    return getValue(detection_sensitivity_map, type);
}

function readFallDetectionSettings(bytes) {
    var fall_detection_settings = {};
    fall_detection_settings.confirm_time = readUInt16LE(bytes.slice(0, 2));
    fall_detection_settings.delay_report_time = readUInt16LE(bytes.slice(2, 4));
    fall_detection_settings.alarm_duration = readUInt16LE(bytes.slice(4, 6));
    return fall_detection_settings;
}

function readDwellDetectionSettings(bytes) {
    var dwell_detection_settings = {};
    dwell_detection_settings.enable = readEnableStatus(bytes[0]);
    dwell_detection_settings.dwell_time = readUInt16LE(bytes.slice(1, 3));
    return dwell_detection_settings;
}

function readMotionDetectionSettings(bytes) {
    var motion_detection_settings = {};
    motion_detection_settings.enable = readEnableStatus(bytes[0]);
    motion_detection_settings.motionless_time = readUInt8(bytes[2]);
    return motion_detection_settings;
}

function readExistenceDetectionSettings(bytes) {
    var existence_detection_settings = {};
    existence_detection_settings.exist_confirm_time = readUInt8(bytes[0]);
    existence_detection_settings.leaved_confirm_time = readUInt8(bytes[1]);
    return existence_detection_settings;
}

function readRegionSettings(bytes) {
    var region_settings = {};
    region_settings.region_id = readUInt8(bytes[0]) + 1;
    region_settings.x_min = readInt16LE(bytes.slice(1, 3));
    region_settings.x_max = readInt16LE(bytes.slice(3, 5));
    region_settings.y_min = readInt16LE(bytes.slice(5, 7));
    region_settings.y_max = readInt16LE(bytes.slice(7, 9));
    return region_settings;
}

function readRegionDetectionSettings(bytes) {
    var region_detection_settings = {};
    region_detection_settings.region_id = readUInt8(bytes[0]) + 1;
    region_detection_settings.fall_detection_enable = readEnableStatus(bytes[1]);
    region_detection_settings.dwell_detection_enable = readEnableStatus(bytes[2]);
    region_detection_settings.motion_detection_enable = readEnableStatus(bytes[3]);
    region_detection_settings.region_type = readRegionType(bytes[4]);
    return region_detection_settings;
}

function readRegionType(type) {
    var region_type_map = { 0: "custom", 1: "bed", 2: "door", 3: "ignore", 255: "unset" };
    return getValue(region_type_map, type);
}

function readBedDetectionSettings(bytes) {
    var bed_detection_settings = {};
    bed_detection_settings.bed_id = readUInt8(bytes[0]) + 1;
    bed_detection_settings.enable = readEnableStatus(bytes[1]);
    bed_detection_settings.start_time = readUInt16LE(bytes.slice(2, 4));
    bed_detection_settings.end_time = readUInt16LE(bytes.slice(4, 6));
    bed_detection_settings.bed_height = readUInt16LE(bytes.slice(6, 8));
    bed_detection_settings.out_of_bed_time = readUInt16LE(bytes.slice(8, 10));
    return bed_detection_settings;
}

function readD2DMasterConfig(bytes) {
    var offset = 0;
    var config = {};
    config.mode = readD2DMode(readUInt8(bytes[offset]));
    config.enable = readEnableStatus(bytes[offset + 1]);
    config.lora_uplink_enable = readEnableStatus(bytes[offset + 2]);
    config.d2d_cmd = readD2DCommand(bytes.slice(offset + 3, offset + 5));
    config.time = readUInt16LE(bytes.slice(offset + 5, offset + 7));
    config.time_enable = readEnableStatus(bytes[offset + 7]);
    return config;
}

function readD2DCommand(bytes) {
    return ("0" + (bytes[1] & 0xff).toString(16)).slice(-2) + ("0" + (bytes[0] & 0xff).toString(16)).slice(-2);
}

function readD2DMode(type) {
    var d2d_mode_map = { 0: "occupied", 1: "vacant", 2: "fall", 3: "out_of_bed", 4: "motionless", 5: "dwell" };
    return getValue(d2d_mode_map, type);
}

function readD2DSlaveConfig(bytes) {
    var d2d_slave_config = {};
    d2d_slave_config.mode = readD2DMode(readUInt8(bytes[0]));
    d2d_slave_config.d2d_cmd = readD2DCommand(bytes.slice(1, 3));
    d2d_slave_config.control_type = readD2DControlType(bytes[3]);
    d2d_slave_config.action_type = readD2DActionType(bytes[4]);
    return d2d_slave_config;
}

function readD2DControlType(type) {
    var d2d_control_type_map = { 1: "button" };
    return getValue(d2d_control_type_map, type);
}

function readD2DActionType(type) {
    var d2d_action_type_map = { 1: "alarm_deactivate", 2: "wifi_on", 3: "wifi_off" };
    return getValue(d2d_action_type_map, type);
}

function readConfirmAlarmType(type) {
    var confirm_alarm_type_map = { 2: "dismiss", 3: "ignore" };
    return getValue(confirm_alarm_type_map, type);
}

function readTimeSyncMode(type) {
    var time_sync_mode_map = { 0: "sync_from_gateway", 1: "manual_sync" };
    return getValue(time_sync_mode_map, type);
}

/* eslint-disable */
function readUInt8(bytes) {
    return bytes & 0xff;
}

function readInt8(bytes) {
    var ref = readUInt8(bytes);
    return ref > 0x7f ? ref - 0x100 : ref;
}

function readUInt16LE(bytes) {
    var value = (bytes[1] << 8) + bytes[0];
    return value & 0xffff;
}

function readInt16LE(bytes) {
    var ref = readUInt16LE(bytes);
    return ref > 0x7fff ? ref - 0x10000 : ref;
}

function readUInt24LE(bytes) {
    var value = (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
    return value & 0xffffff;
}

function readInt24LE(bytes) {
    var ref = readUInt24LE(bytes);
    return ref > 0x7fffff ? ref - 0x1000000 : ref;
}

function readUInt32LE(bytes) {
    var value = (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
    return (value & 0xffffffff) >>> 0;
}

function readInt32LE(bytes) {
    var ref = readUInt32LE(bytes);
    return ref > 0x7fffffff ? ref - 0x100000000 : ref;
}

function readFloatLE(bytes) {
    var bits = (bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0];
    var sign = bits >>> 31 === 0 ? 1.0 : -1.0;
    var e = (bits >>> 23) & 0xff;
    var m = e === 0 ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
    var f = sign * m * Math.pow(2, e - 150);
    return f;
}

function bytesToHexString(bytes) {
    var temp = [];
    for (var i = 0; i < bytes.length; i++) {
        temp.push(("0" + (bytes[i] & 0xff).toString(16)).slice(-2));
    }
    return temp.join("");
}

function getValue(map, key) {
    if (RAW_VALUE) return key;

    var value = map[key];
    if (!value) value = "unknown";
    return value;
}

if (!Object.assign) {
    Object.defineProperty(Object, "assign", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (target) {
            "use strict";
            if (target == null) {
                throw new TypeError("Cannot convert first argument to object");
            }

            var to = Object(target);
            for (var i = 1; i < arguments.length; i++) {
                var nextSource = arguments[i];
                if (nextSource == null) {
                    continue;
                }
                nextSource = Object(nextSource);

                var keysArray = Object.keys(Object(nextSource));
                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                    var nextKey = keysArray[nextIndex];
                    var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== undefined && desc.enumerable) {
                        // concat array
                        if (Array.isArray(to[nextKey]) && Array.isArray(nextSource[nextKey])) {
                            to[nextKey] = to[nextKey].concat(nextSource[nextKey]);
                        } else {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        },
    });
}