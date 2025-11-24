/**
 * Payload Decoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product WT201
 */
var RAW_VALUE = 0x00;

/* eslint-disable */
// Chirpstack v4
function decodeUplink(input) {
    var decoded = milesightDeviceDecode(input.bytes);
    return { data: decoded };
}

// Chirpstack v3
function Decode(fPort, bytes) {
    return milesightDeviceDecode(bytes);
}

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
        // TSL VERSION
        else if (channel_id === 0xff && channel_type === 0xff) {
            decoded.tsl_version = readTslVersion(bytes.slice(i, i + 2));
            i += 2;
        }
        // SERIAL NUMBER
        else if (channel_id === 0xff && channel_type === 0x16) {
            decoded.sn = readSerialNumber(bytes.slice(i, i + 8));
            i += 8;
        }
        // LORAWAN CLASS TYPE
        else if (channel_id === 0xff && channel_type === 0x0f) {
            decoded.lorawan_class = readLoRaWANClass(bytes[i]);
            i += 1;
        }
        // RESET EVENT
        else if (channel_id === 0xff && channel_type === 0xfe) {
            decoded.reset_event = readResetEvent(1);
            i += 1;
        }
        // DEVICE STATUS
        else if (channel_id === 0xff && channel_type === 0x0b) {
            decoded.device_status = readDeviceStatus(1);
            i += 1;
        }
        // TEMPERATURE
        else if (channel_id === 0x03 && channel_type === 0x67) {
            decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
            i += 2;
        }
        // TARGET TEMPERATURE
        else if (channel_id === 0x04 && channel_type === 0x67) {
            decoded.target_temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
            i += 2;
        }
        // TEMPERATURE CONTROL
        else if (channel_id === 0x05 && channel_type === 0xe7) {
            var temperature_control_value = bytes[i];
            decoded.temperature_control_mode = readTemperatureControlMode((temperature_control_value >>> 0) & 0x03);
            decoded.temperature_control_status = readTemperatureControlStatus((temperature_control_value >>> 4) & 0x0f);
            i += 1;
        }
        // FAN CONTROL
        else if (channel_id === 0x06 && channel_type === 0xe8) {
            var fan_value = bytes[i];
            decoded.fan_mode = readFanMode((fan_value >>> 0) & 0x03);
            decoded.fan_status = readFanStatus((fan_value >>> 2) & 0x03);
            i += 1;
        }
        // PLAN EVENT
        else if (channel_id === 0x07 && channel_type === 0xbc) {
            var plan_event_value = bytes[i];
            decoded.plan_type = readPlanEvent((plan_event_value >>> 0) & 0x0f);
            i += 1;
        }
        // SYSTEM STATUS
        else if (channel_id === 0x08 && channel_type === 0x8e) {
            decoded.system_status = readOnOffStatus(bytes[i]);
            i += 1;
        }
        // HUMIDITY
        else if (channel_id === 0x09 && channel_type === 0x68) {
            decoded.humidity = readUInt8(bytes[i]) / 2;
            i += 1;
        }
        // RELAY STATUS
        else if (channel_id === 0x0a && channel_type === 0x6e) {
            decoded.wires_relay = readWiresRelay(bytes[i]);
            i += 1;
        }
        // TEMPERATURE MODE SUPPORT
        else if (channel_id === 0xff && channel_type === 0xcb) {
            decoded.temperature_control_support_mode = readTemperatureControlSupportMode(bytes[i]);
            decoded.temperature_control_support_status = readTemperatureControlSupportStatus(bytes[i + 1], bytes[i + 2]);
            i += 3;
        }
        // TEMPERATURE ALARM
        else if (channel_id === 0x83 && channel_type === 0x67) {
            decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
            decoded.temperature_alarm = readTemperatureAlarm(bytes[i + 2]);
            i += 2;
        }
        // TEMPERATURE EXCEPTION
        else if (channel_id === 0xb3 && channel_type === 0x67) {
            decoded.temperature_sensor_status = readSensorStatus(bytes[i]);
            i += 1;
        }
        // HUMIDITY EXCEPTION
        else if (channel_id === 0xb9 && channel_type === 0x68) {
            decoded.humidity_sensor_status = readSensorStatus(bytes[i]);
            i += 1;
        }
        // HISTORICAL DATA
        else if (channel_id === 0x20 && channel_type === 0xce) {
            var timestamp = readUInt32LE(bytes.slice(i, i + 4));
            var value1 = readUInt16LE(bytes.slice(i + 4, i + 6));
            var value2 = readUInt16LE(bytes.slice(i + 6, i + 8));

            var data = { timestamp: timestamp };
            // fan_mode(0..1) + fan_status(2..3) + system_status(4) + temperature(5..15)
            data.fan_mode = readFanMode((value1 >>> 0) & 0x03);
            data.fan_status = readFanStatus((value1 >>> 2) & 0x03);
            data.system_status = readOnOffStatus((value1 >>> 4) & 0x01);
            var temperature = ((value1 >>> 5) & 0x7ff) / 10 - 100;
            data.temperature = Number(temperature.toFixed(1));

            // temperature_control_mode(0..1) + temperature_control_status(2..4) + target_temperature(5..15)
            data.temperature_control_mode = readTemperatureControlMode((value2 >>> 0) & 0x03);
            data.temperature_control_status = readTemperatureControlStatus((value2 >>> 2) & 0x07);
            var target_temperature = ((value2 >>> 5) & 0x7ff) / 10 - 100;
            data.target_temperature = Number(target_temperature.toFixed(1));
            i += 8;
            decoded.history = decoded.history || [];
            decoded.history.push(data);
        }
        // DOWNLINK RESPONSE
        else if (channel_id === 0xfe || channel_id === 0xff) {
            var respResult = handle_downlink_response(channel_type, bytes, i);
            decoded = Object.assign(decoded, respResult.data);
            i = respResult.offset;
        }
        // DOWNLINK RESPONSE EXT
        else if (channel_id === 0xf8 || channel_id === 0xf9) {
            var respResultExt = handle_downlink_response_ext(channel_id, channel_type, bytes, i);
            decoded = Object.assign(decoded, respResultExt.data);
            i = respResultExt.offset;
        } else {
            break;
        }
    }

    return decoded;
}

function handle_downlink_response(channel_type, bytes, offset) {
    var decoded = {};

    switch (channel_type) {
        case 0x02:
            decoded.collection_interval = readUInt16LE(bytes.slice(offset, offset + 2));
            offset += 2;
            break;
        case 0x03:
            decoded.outside_temperature = readInt16LE(bytes.slice(offset, offset + 2)) / 10;
            offset += 2;
            break;
        case 0x06:
            var ctl = readUInt8(bytes[offset]);
            var condition = ctl & 0x07;
            var alarm_type = (ctl >>> 3) & 0x07;

            var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside" };
            var alarm_type_map = { 0: "temperature threshold", 1: "continuous low temperature", 2: "continuous high temperature" };
            var data = { condition: getValue(condition_map, condition), alarm_type: getValue(alarm_type_map, alarm_type) };

            if (condition === 1 || condition === 3 || condition === 4 || alarm_type === 1) {
                data.threshold_min = readInt16LE(bytes.slice(offset + 1, offset + 3)) / 10;
            }
            if (condition === 2 || condition === 3 || condition === 4 || alarm_type === 2) {
                data.threshold_max = readInt16LE(bytes.slice(offset + 3, offset + 5)) / 10;
            }
            data.lock_time = readInt16LE(bytes.slice(offset + 5, offset + 7));
            data.continue_time = readInt16LE(bytes.slice(offset + 7, offset + 9));
            offset += 9;

            decoded.temperature_alarm_config = data;
            break;
        case 0x10:
            decoded.reboot = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x25:
            var masked = readUInt8(bytes[offset]);
            var status = readUInt8(bytes[offset + 1]);
            var button_mask_bit_offset = { power_button: 0, up_button: 1, down_button: 2, fan_button: 3, mode_button: 4, reset_button: 5 };
            decoded.child_lock_config = decoded.child_lock_config || {};
            for (var button in button_mask_bit_offset) {
                if ((masked >> button_mask_bit_offset[button]) & 0x01) {
                    decoded.child_lock_config[button] = readEnableStatus((status >> button_mask_bit_offset[button]) & 0x01);
                }
            }
            offset += 2;
            break;
        case 0x27:
            decoded.clear_history = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x28:
            decoded.report_status = readReportStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x68:
            decoded.history_enable = readEnableStatus(bytes[offset]);
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
        case 0x82:
            var value = readUInt8(bytes[offset]);
            var mask = value >>> 4;
            var enabled = value & 0x0f;

            var group_mask_bit_offset = { group1_enable: 0, group2_enable: 1, group3_enable: 2, group4_enable: 3 };
            decoded.multicast_group_config = {};
            for (var group in group_mask_bit_offset) {
                if ((mask >> group_mask_bit_offset[group]) & 0x01) {
                    decoded.multicast_group_config[group] = readEnableStatus((enabled >> group_mask_bit_offset[group]) & 0x01);
                }
            }
            offset += 1;
            break;
        case 0x83:
            var d2d_slave_config = {};
            d2d_slave_config.id = readUInt8(bytes[offset]) + 1;
            d2d_slave_config.enable = readEnableStatus(bytes[offset + 1]);
            d2d_slave_config.d2d_cmd = readD2DCommand(bytes.slice(offset + 2, offset + 4));
            var action_type_value = (readUInt8(bytes[offset + 4]) >>> 4) & 0x0f;
            d2d_slave_config.action_type = readActionType(action_type_value);
            if (action_type_value === 0) {
                d2d_slave_config.action = readOnOffStatus(readUInt8(bytes[offset + 4]) & 0x0f);
            } else {
                d2d_slave_config.action = readPlanEventType(readUInt8(bytes[offset + 4]) & 0x0f);
            }
            offset += 5;
            decoded.d2d_slave_config = decoded.d2d_slave_config || [];
            decoded.d2d_slave_config.push(d2d_slave_config);
            break;
        case 0x96:
            var d2d_master_config = {};
            d2d_master_config.mode = readPlanEventType(readUInt8(bytes[offset]));
            d2d_master_config.enable = readEnableStatus(bytes[offset + 1]);
            d2d_master_config.lora_uplink_enable = readEnableStatus(bytes[offset + 2]);
            d2d_master_config.d2d_cmd = readD2DCommand(bytes.slice(offset + 3, offset + 5));
            d2d_master_config.time_enable = readEnableStatus(bytes[offset + 7]);
            d2d_master_config.time = readUInt16LE(bytes.slice(offset + 5, offset + 7));
            offset += 8;
            decoded.d2d_master_config = decoded.d2d_master_config || [];
            decoded.d2d_master_config.push(d2d_master_config);
            break;
        case 0x4a:
            decoded.sync_time = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x8e:
            // ignore the first byte
            decoded.report_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            offset += 3;
            break;
        case 0xab:
            decoded.temperature_calibration_settings = {};
            decoded.temperature_calibration_settings.enable = readEnableStatus(readUInt8(bytes[offset]));
            decoded.temperature_calibration_settings.calibration_value = readInt16LE(bytes.slice(offset + 1, offset + 3)) / 10;
            offset += 3;
            break;
        case 0xb0:
            decoded.freeze_protection_config = decoded.freeze_protection_config || {};
            decoded.freeze_protection_config.enable = readEnableStatus(readUInt8(bytes[offset]));
            decoded.freeze_protection_config.temperature = readInt16LE(bytes.slice(offset + 1, offset + 3)) / 10;
            offset += 3;
            break;
        case 0xb5:
            decoded.ob_mode = readObMode(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0xb6:
            decoded.fan_mode = readFanMode(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0xb7:
            decoded.temperature_control_mode = readTemperatureControlMode(readUInt8(bytes[offset]));
            var t = readUInt8(bytes[offset + 1]);
            decoded.target_temperature = t & 0x7f;
            decoded.temperature_unit = readTemperatureUnit((t >>> 7) & 0x01);
            offset += 2;
            break;
        case 0xb8:
            decoded.temperature_tolerance = {};
            decoded.temperature_tolerance.target_temperature_tolerance = readUInt8(bytes[offset]) / 10;
            decoded.temperature_tolerance.auto_temperature_tolerance = readUInt8(bytes[offset + 1]) / 10;
            offset += 2;
            break;
        case 0xb9:
            decoded.temperature_level_up_condition = {};
            decoded.temperature_level_up_condition.type = readTemperatureLevelUpCondition(readUInt8(bytes[offset]));
            decoded.temperature_level_up_condition.time = readUInt8(bytes[offset + 1]);
            decoded.temperature_level_up_condition.temperature_tolerance = readInt16LE(bytes.slice(offset + 2, offset + 4)) / 10;
            offset += 4;
            break;
        case 0xba:
            var enable_value = bytes[offset];
            decoded.dst_config = {};
            decoded.dst_config.enable = readEnableStatus(enable_value);
            decoded.dst_config.offset = readUInt8(bytes[offset + 1]);
            decoded.dst_config.start_month = readUInt8(bytes[offset + 2]);
            var start_day = readUInt8(bytes[offset + 3]);
            decoded.dst_config.start_week_num = (start_day >>> 4) & 0x0f;
            decoded.dst_config.start_week_day = start_day & 0x0f;
            decoded.dst_config.start_time = readUInt16LE(bytes.slice(offset + 4, offset + 6));
            decoded.dst_config.end_month = readUInt8(bytes[offset + 6]);
            var end_day = readUInt8(bytes[offset + 7]);
            decoded.dst_config.end_week_num = (end_day >>> 4) & 0x0f;
            decoded.dst_config.end_week_day = end_day & 0x0f;
            decoded.dst_config.end_time = readUInt16LE(bytes.slice(offset + 8, offset + 10));
            offset += 10;
            break;
        case 0xbd:
            decoded.time_zone = readTimeZone(readInt16LE(bytes.slice(offset, offset + 2)));
            offset += 2;
            break;
        case 0xc1:
            var action_map = { 0: "power", 1: "plan" };
            var action_value = readUInt8(bytes[offset + 1]);
            var card_action = readUInt8(bytes[offset + 2]);
            decoded.card_config = {};
            decoded.card_config.enable = readEnableStatus(bytes[offset]);
            decoded.card_config.action_type = getValue(action_map, action_value);
            if (action_value === 1) {
                decoded.card_config.in_plan_type = readPlanEventType((card_action >>> 4) & 0x0f);
                decoded.card_config.out_plan_type = readPlanEventType(card_action & 0x0f);
            } else if (action_value === 0) {
                decoded.card_config.action = readOnOffStatus(card_action);
            }
            decoded.card_config.invert = readYesNoStatus(bytes[offset + 3]);
            offset += 4;
            break;
        case 0xc2:
            decoded.plan_type = readPlanEventType(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0xc4:
            decoded.outside_temperature_control = decoded.outside_temperature_control_config || {};
            decoded.outside_temperature_control.enable = readEnableStatus(bytes[offset]);
            decoded.outside_temperature_control.timeout = readUInt8(bytes[offset + 1]);
            offset += 2;
            break;
        case 0xc5:
            decoded.temperature_control_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0xc7:
            var d2d_enable_value = readUInt8(bytes[offset]);
            offset += 1;
            var d2d_mask = (d2d_enable_value >>> 4) & 0x0f;
            var d2d_status = (d2d_enable_value >>> 0) & 0x0f;
            if ((d2d_mask >> 0) & 0x01) {
                decoded.d2d_master_enable = readEnableStatus((d2d_status >>> 0) & 0x01);
            }
            if ((d2d_mask >> 1) & 0x01) {
                decoded.d2d_slave_enable = readEnableStatus((d2d_status >>> 1) & 0x01);
            }
            break;
        case 0xc8:
            var plan_config = {};
            plan_config.type = readPlanEventType(readUInt8(bytes[offset]));
            plan_config.temperature_control_mode = readTemperatureControlMode(readUInt8(bytes[offset + 1]));
            plan_config.fan_mode = readFanMode(readUInt8(bytes[offset + 2]));
            var target_temperature_value = readInt8(bytes[offset + 3]);
            plan_config.target_temperature = target_temperature_value & 0x7f;
            decoded.temperature_unit = readTemperatureUnit((target_temperature_value >>> 7) & 0x01);
            plan_config.temperature_tolerance = readInt8(bytes[offset + 4] & 0x7f) / 10;
            offset += 5;
            decoded.plan_config = decoded.plan_config || [];
            decoded.plan_config.push(plan_config);
            break;
        case 0xc9:
            var plan_schedule = {};
            plan_schedule.type = readPlanEventType(bytes[offset]);
            plan_schedule.id = bytes[offset + 1] + 1;
            plan_schedule.enable = readEnableStatus(bytes[offset + 2]);
            plan_schedule.week_recycle = readWeekRecycleSettings(bytes[offset + 3]);
            plan_schedule.time = readUInt16LE(bytes.slice(offset + 4, offset + 6));
            offset += 6;
            decoded.plan_schedule = decoded.plan_schedule || [];
            decoded.plan_schedule.push(plan_schedule);
            break;
        case 0xca:
            decoded.wires = readWires(bytes[offset], bytes[offset + 1], bytes[offset + 2]);
            decoded.ob_mode = readObMode((bytes[offset + 2] >>> 2) & 0x03);
            offset += 3;
            break;
        case 0xf6:
            decoded.control_permission = readControlPermission(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0xf7:
            var wires_relay_mask = readUInt16LE(bytes.slice(offset, offset + 2));
            var wires_relay_status = readUInt16LE(bytes.slice(offset + 2, offset + 4));
            offset += 4;

            decoded.wires_relay_config = {};
            var wire_relay_bit_offset = { y1: 0, y2_gl: 1, w1: 2, w2_aux: 3, e: 4, g: 5, ob: 6 };
            for (var key in wire_relay_bit_offset) {
                if ((wires_relay_mask >>> wire_relay_bit_offset[key]) & 0x01) {
                    decoded.wires_relay_config[key] = readOnOffStatus((wires_relay_status >>> wire_relay_bit_offset[key]) & 0x01);
                }
            }
            break;
        case 0xf8:
            decoded.offline_control_mode = readOfflineControlMode(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0xf9:
            decoded.humidity_calibration_settings = {};
            decoded.humidity_calibration_settings.enable = readEnableStatus(readUInt8(bytes[offset]));
            decoded.humidity_calibration_settings.calibration_value = readInt16LE(bytes.slice(offset + 1, offset + 3)) / 10;
            offset += 3;
            break;
        case 0xfa:
            decoded.temperature_control_mode = readTemperatureControlMode(readUInt8(bytes[offset]));
            decoded.target_temperature = readInt16LE(bytes.slice(offset + 1, offset + 3)) / 10;
            offset += 3;
            break;
        case 0xfb:
            decoded.temperature_control_mode = readTemperatureControlMode(readUInt8(bytes[offset]));
            offset += 1;
            break;
        default:
            throw new Error("unknown downlink response");
    }

    return { data: decoded, offset: offset };
}

function handle_downlink_response_ext(code, channel_type, bytes, offset) {
    var decoded = {};

    switch (channel_type) {
        case 0x05:
            decoded.fan_delay_enable = readEnableStatus(readUInt8(bytes[offset]));
            decoded.fan_delay_time = readUInt8(bytes[offset + 1]);
            offset += 2;
            break;
        case 0x06:
            decoded.fan_execute_time = readUInt8(bytes[offset]);
            offset += 1;
            break;
        case 0x07:
            decoded.fan_dehumidify = {};
            decoded.fan_dehumidify.enable = readEnableStatus(readUInt8(bytes[offset]));
            decoded.fan_dehumidify.execute_time = readUInt8(bytes[offset + 1]);
            offset += 2;
            break;
        case 0x08:
            var screen_display_mode_map = { 0: "on", 1: "without plan show", 2: "disable all" };
            decoded.screen_display_mode = getValue(screen_display_mode_map, readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x09:
            decoded.humidity_range = {};
            decoded.humidity_range.min = readUInt8(bytes[offset]);
            decoded.humidity_range.max = readUInt8(bytes[offset + 1]);
            offset += 2;
            break;
        case 0x0a:
            decoded.temperature_dehumidify = {};
            decoded.temperature_dehumidify.enable = readEnableStatus(bytes[offset]);
            var temperature_dehumidify_value = readUInt8(bytes[offset + 1]);
            if (temperature_dehumidify_value !== 0xff) {
                decoded.temperature_dehumidify.temperature_tolerance = temperature_dehumidify_value / 10;
            }
            offset += 2;
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
    var class_map = {
        0: "Class A",
        1: "Class B",
        2: "Class C",
        3: "Class CtoB",
    };
    return getValue(class_map, type);
}

function readResetEvent(status) {
    var status_map = { 0: "normal", 1: "reset" };
    return getValue(status_map, status);
}

function readDeviceStatus(status) {
    var status_map = { 0: "off", 1: "on" };
    return getValue(status_map, status);
}

function readEnableStatus(status) {
    var status_map = { 0: "disable", 1: "enable" };
    return getValue(status_map, status);
}

function readYesNoStatus(type) {
    var yes_no_status_map = { 0: "no", 1: "yes" };
    return getValue(yes_no_status_map, type);
}

function readOnOffStatus(type) {
    var on_off_status_map = { 0: "off", 1: "on" };
    return getValue(on_off_status_map, type);
}

function readTemperatureUnit(type) {
    var temperature_unit_map = { 0: "celsius", 1: "fahrenheit" };
    return getValue(temperature_unit_map, type);
}

function readTemperatureAlarm(type) {
    var temperature_alarm_map = {
        1: "emergency heating timeout alarm",
        2: "auxiliary heating timeout alarm",
        3: "persistent low temperature alarm",
        4: "persistent low temperature alarm release",
        5: "persistent high temperature alarm",
        6: "persistent high temperature alarm release",
        7: "freeze protection alarm",
        8: "freeze protection alarm release",
        9: "threshold alarm",
        10: "threshold alarm release",
    };
    return getValue(temperature_alarm_map, type);
}

function readSensorStatus(type) {
    var sensor_status_map = {
        1: "read failed",
        2: "out of range",
    };
    return getValue(sensor_status_map, type);
}

function readPlanEvent(type) {
    var fix_type = type - 1;
    if (fix_type === -1) {
        fix_type = 255;
    }
    var plan_event_map = {
        0: "wake",
        1: "away",
        2: "home",
        3: "sleep",
        255: "not executed",
    };
    return getValue(plan_event_map, fix_type);
}

function readPlanEventType(type) {
    var plan_event_type_map = {
        0: "wake",
        1: "away",
        2: "home",
        3: "sleep",
    };
    return getValue(plan_event_type_map, type);
}

function readFanMode(type) {
    var fan_mode_map = {
        0: "auto",
        1: "on",
        2: "circulate",
        3: "disable",
    };
    return getValue(fan_mode_map, type);
}

function readFanStatus(type) {
    var fan_status_map = {
        0: "standby",
        1: "high speed",
        2: "low speed",
        3: "on",
    };
    return getValue(fan_status_map, type);
}

function readControlPermission(type) {
    var control_permission_map = { 0: "thermostat", 1: "remote control" };
    return getValue(control_permission_map, type);
}

function readOfflineControlMode(type) {
    var offline_control_mode_map = { 0: "keep", 1: "thermostat", 2: "off" };
    return getValue(offline_control_mode_map, type);
}

function readTemperatureControlMode(type) {
    var temperature_control_mode_map = { 0: "heat", 1: "em_heat", 2: "cool", 3: "auto" };
    return getValue(temperature_control_mode_map, type);
}

function readTemperatureControlStatus(type) {
    var temperature_control_status_map = {
        0: "standby",
        1: "stage-1 heat",
        2: "stage-2 heat",
        3: "stage-3 heat",
        4: "stage-4 heat",
        5: "em_heat",
        6: "stage-1 cool",
        7: "stage-2 cool",
    };
    return getValue(temperature_control_status_map, type);
}

function readWires(wire1, wire2, wire3) {
    var wire = {};
    wire.y1 = readOnOffStatus((wire1 >>> 0) & 0x03);
    wire.gh = readOnOffStatus((wire1 >>> 2) & 0x03);
    wire.ob = readOnOffStatus((wire1 >>> 4) & 0x03);
    wire.w1 = readOnOffStatus((wire1 >>> 6) & 0x03);

    wire.e = readOnOffStatus((wire2 >>> 0) & 0x03);
    wire.di = readOnOffStatus((wire2 >>> 2) & 0x03);
    wire.pek = readOnOffStatus((wire2 >>> 4) & 0x03);
    wire.w2 = readOnOffStatus((wire2 >>> 6) & 0x01);
    wire.aux = readOnOffStatus(((wire2 >>> 6) & 0x03) === 2 ? 1 : 0);

    wire.y2 = readOnOffStatus((wire3 >>> 0) & 0x01);
    wire.gl = readOnOffStatus(((wire3 >>> 0) & 0x03) === 2 ? 1 : 0);
    return wire;
}

function readWiresRelay(status) {
    var relay = {};
    relay.y1 = readOnOffStatus((status >>> 0) & 0x01);
    relay.y2_gl = readOnOffStatus((status >>> 1) & 0x01);
    relay.w1 = readOnOffStatus((status >>> 2) & 0x01);
    relay.w2_aux = readOnOffStatus((status >>> 3) & 0x01);
    relay.e = readOnOffStatus((status >>> 4) & 0x01);
    relay.g = readOnOffStatus((status >>> 5) & 0x01);
    relay.ob = readOnOffStatus((status >>> 6) & 0x01);
    return relay;
}

function readObMode(type) {
    var ob_mode_map = { 0: "on_cool", 1: "on_heat", 3: "hold" };
    return getValue(ob_mode_map, type);
}

function readActionType(type) {
    var action_type_map = { 0: "power", 1: "plan" };
    return getValue(action_type_map, type);
}

function readTemperatureLevelUpCondition(type) {
    var temperature_level_up_condition_map = { 0: "heat", 1: "cool" };
    return getValue(temperature_level_up_condition_map, type);
}

function readTemperatureControlSupportMode(type) {
    var enable = {};
    enable.heat = readEnableStatus((type >>> 0) & 0x01);
    enable.em_heat = readEnableStatus((type >>> 1) & 0x01);
    enable.cool = readEnableStatus((type >>> 2) & 0x01);
    enable.auto = readEnableStatus((type >>> 3) & 0x01);
    return enable;
}

function readTemperatureControlSupportStatus(heat_mode, cool_mode) {
    var enable = {};
    enable.stage_1_heat = readEnableStatus((heat_mode >>> 0) & 0x01);
    enable.stage_2_heat = readEnableStatus((heat_mode >>> 1) & 0x01);
    enable.stage_3_heat = readEnableStatus((heat_mode >>> 2) & 0x01);
    enable.stage_4_heat = readEnableStatus((heat_mode >>> 3) & 0x01);
    enable.aux_heat = readEnableStatus((heat_mode >>> 4) & 0x01);
    enable.stage_1_cool = readEnableStatus((cool_mode >>> 0) & 0x01);
    enable.stage_2_cool = readEnableStatus((cool_mode >>> 1) & 0x01);
    return enable;
}

function readReportStatus(type) {
    var report_status_map = { 0: "plan", 1: "periodic" };
    return getValue(report_status_map, type);
}

function readWeekRecycleSettings(type) {
    var week_day_bits_offset = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 7 };
    var week_enable = {};
    for (var day in week_day_bits_offset) {
        week_enable[day] = readEnableStatus((type >>> week_day_bits_offset[day]) & 0x01);
    }
    return week_enable;
}

function readTimeZone(time_zone) {
    var timezone_map = { "-720": "UTC-12", "-660": "UTC-11", "-600": "UTC-10", "-570": "UTC-9:30", "-540": "UTC-9", "-480": "UTC-8", "-420": "UTC-7", "-360": "UTC-6", "-300": "UTC-5", "-240": "UTC-4", "-210": "UTC-3:30", "-180": "UTC-3", "-120": "UTC-2", "-60": "UTC-1", 0: "UTC", 60: "UTC+1", 120: "UTC+2", 180: "UTC+3", 210: "UTC+3:30", 240: "UTC+4", 270: "UTC+4:30", 300: "UTC+5", 330: "UTC+5:30", 345: "UTC+5:45", 360: "UTC+6", 390: "UTC+6:30", 420: "UTC+7", 480: "UTC+8", 540: "UTC+9", 570: "UTC+9:30", 600: "UTC+10", 630: "UTC+10:30", 660: "UTC+11", 720: "UTC+12", 765: "UTC+12:45", 780: "UTC+13", 840: "UTC+14" };
    return getValue(timezone_map, time_zone);
}

function readD2DCommand(bytes) {
    return ("0" + (bytes[1] & 0xff).toString(16)).slice(-2) + ("0" + (bytes[0] & 0xff).toString(16)).slice(-2);
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

function readUInt32LE(bytes) {
    var value = (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
    return (value & 0xffffffff) >>> 0;
}

function readInt32LE(bytes) {
    var ref = readUInt32LE(bytes);
    return ref > 0x7fffffff ? ref - 0x100000000 : ref;
}

function getValue(map, key) {
    if (RAW_VALUE) return key;

    var value = map[key];
    if (!value) value = "unknown";
    return value;
}

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
/* eslint-enable */