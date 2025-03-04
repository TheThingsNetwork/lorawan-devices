/**
 * Payload Decoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product WT201 v2
 */
var RAW_VALUE = 0x00;

// Chirpstack v4
function decodeUplink(input) {
    var decoded = milesightDeviceDecode(input.bytes);
    return { data: decoded };
}

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
        // RESET EVENT
        else if (channel_id === 0xff && channel_type === 0xfe) {
            decoded.reset_event = readResetEvent(1);
            i += 1;
        }
        // DEVICE STATUS
        else if (channel_id === 0xff && channel_type === 0x0b) {
            decoded.device_status = readOnOffStatus(1);
            i += 1;
        }
        // LORAWAN CLASS TYPE
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
        // TARGET TEMPERATURE 2
        else if (channel_id === 0x0b && channel_type === 0x67) {
            decoded.target_temperature_2 = readInt16LE(bytes.slice(i, i + 2)) / 10;
            i += 2;
        }
        // TEMPERATURE CONTROL
        else if (channel_id === 0x05 && channel_type === 0xe7) {
            var value = bytes[i];
            // value = temperature_control_mode(0..1) + temperature_control_status(4..7)
            decoded.temperature_control_mode = readTemperatureControlMode((value >>> 0) & 0x03);
            decoded.temperature_control_status = readTemperatureControlStatus((value >>> 4) & 0x0f);
            i += 1;
        }
        // FAN CONTROL
        else if (channel_id === 0x06 && channel_type === 0xe8) {
            var value = bytes[i];
            // value = fan_mode(0..1) + fan_status(2..3)
            decoded.fan_mode = readFanMode((value >>> 0) & 0x03);
            decoded.fan_status = readFanStatus((value >>> 2) & 0x03);
            i += 1;
        }
        // PLAN EVENT
        else if (channel_id === 0x07 && channel_type === 0xbc) {
            var value = bytes[i];
            // value = plan_type(0..3)
            decoded.plan_type = readExecutePlanType((value >>> 0) & 0x0f);
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
        // PLAN
        else if (channel_id === 0xff && channel_type === 0xc9) {
            var schedule = readPlanSchedule(bytes.slice(i, i + 6));
            i += 6;

            decoded.plan_schedule = decoded.plan_schedule || [];
            decoded.plan_schedule.push(schedule);
        }
        // WIRES
        else if (channel_id === 0xff && channel_type === 0xca) {
            decoded.wires = readWires(bytes[i], bytes[i + 1], bytes[i + 2]);
            decoded.ob_mode = readObMode((bytes[i + 2] >>> 2) & 0x03);
            i += 3;
        }
        // TEMPERATURE MODE SUPPORT
        else if (channel_id === 0xff && channel_type === 0xcb) {
            decoded.temperature_control_support_mode = readTemperatureControlSupportMode(bytes[i]);
            decoded.temperature_control_support_status = readTemperatureControlSupportStatus(bytes[i + 1], bytes[i + 2]);
            i += 3;
        }
        // CONTROL PERMISSIONS
        else if (channel_id === 0xff && channel_type === 0xf6) {
            decoded.control_permission = readControlPermission(bytes[i]);
            i += 1;
        }
        // TEMPERATURE ALARM
        else if (channel_id === 0x83 && channel_type === 0x67) {
            decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
            decoded.temperature_alarm = readTemperatureAlarm(bytes[i + 2]);
            i += 3;
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
        // SINGLE TEMPERATURE PLAN CONFIG
        else if (channel_id === 0xf9 && channel_type === 0x5e) {
            var single_temperature_plan_config = readSingleTemperaturePlanConfig(bytes.slice(i, i + 7));
            i += 7;

            decoded.single_temperature_plan_config = decoded.single_temperature_plan_config || [];
            decoded.single_temperature_plan_config.push(single_temperature_plan_config);
        }
        // DUAL TEMPERATURE PLAN CONFIG
        else if (channel_id === 0xf9 && channel_type === 0x59) {
            var config = readDualTemperaturePlanConfig(bytes.slice(i, i + 9));
            i += 9;

            decoded.dual_temperature_plan_config = decoded.dual_temperature_plan_config || [];
            decoded.dual_temperature_plan_config.push(config);
        }
        // TEMPERATURE OUT OF RANGE ALARM
        else if (channel_id === 0xf9 && channel_type === 0x40) {
            var target_temperature_range_config = {};
            target_temperature_range_config.temperature_control_mode = readTemperatureControlMode(bytes[i]);
            target_temperature_range_config.target_temperature = readInt16LE(bytes.slice(i + 1, i + 3)) / 10;
            target_temperature_range_config.min = readInt16LE(bytes.slice(i + 3, i + 5)) / 10;
            target_temperature_range_config.max = readInt16LE(bytes.slice(i + 5, i + 7)) / 10;
            i += 7;

            decoded.target_temperature_range_config = decoded.target_temperature_range_config || [];
            decoded.target_temperature_range_config.push(target_temperature_range_config);
        }
        // HISTORICAL DATA
        else if (channel_id === 0x20 && channel_type === 0xce) {
            var timestamp = readUInt32LE(bytes.slice(i, i + 4));
            var value1 = readUInt16LE(bytes.slice(i + 4, i + 6));

            var data = {};
            data.timestamp = timestamp;
            // value1 = system_status(0) + fan_mode(1..2) + fan_status(3..4) + temperature_control_mode(5..6) + temperature_control_status(7..10)
            data.system_status = readOnOffStatus(value1 & 0x01);
            data.fan_mode = readFanMode((value1 >>> 1) & 0x03);
            data.fan_status = readFanStatus((value1 >>> 3) & 0x03);
            data.temperature_control_mode = readTemperatureControlMode((value1 >>> 5) & 0x03);
            data.temperature_control_status = readTemperatureControlStatus((value1 >>> 7) & 0x0f);

            data.target_temperature = readInt16LE(bytes.slice(i + 6, i + 8)) / 10;
            var temperature_target_value = readUInt16LE(bytes.slice(i + 8, i + 10));
            if (temperature_target_value !== 0xffff) {
                data.target_temperature_2 = readInt16LE(bytes.slice(i + 8, i + 10)) / 10;
            }
            data.temperature = readInt16LE(bytes.slice(i + 10, i + 12)) / 10;
            data.humidity = readUInt8(bytes[i + 12]) / 2;
            i += 13;

            decoded.history = decoded.history || [];
            decoded.history.push(data);
        }
        // DOWNLINK RESPONSE
        else if (channel_id === 0xfe) {
            result = handle_downlink_response(channel_type, bytes, i);
            decoded = Object.assign(decoded, result.data);
            i = result.offset;
        } else if (channel_id === 0xf8) {
            result = handle_downlink_response_ext(channel_type, bytes, i);
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
        case 0x02: // collection_interval
            decoded.collection_interval = readUInt16LE(bytes.slice(offset, offset + 2));
            offset += 2;
            break;
        case 0x03:
            decoded.outside_temperature = readInt16LE(bytes.slice(offset, offset + 2)) / 10;
            offset += 2;
            break;
        case 0x06: // temperature_alarm_config
            var ctl = readUInt8(bytes[offset]);
            var condition = ctl & 0x07;
            var alarm_type = (ctl >>> 3) & 0x07;

            var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside" };
            var alarm_type_map = { 0: "temperature threshold", 1: "continuous low temperature", 2: "continuous high temperature" };
            var data = { condition: getValue(condition_map, condition), alarm_type: getValue(alarm_type_map, alarm_type) };

            if (condition === 1 || condition === 3 || condition === 4) {
                data.min = readInt16LE(bytes.slice(offset + 1, offset + 3)) / 10;
            }
            if (condition === 2 || condition === 3 || condition === 4) {
                data.max = readInt16LE(bytes.slice(offset + 3, offset + 5)) / 10;
            }
            data.lock_time = readInt16LE(bytes.slice(offset + 5, offset + 7));
            data.continue_time = readInt16LE(bytes.slice(offset + 7, offset + 9));
            offset += 9;

            decoded.temperature_alarm_config = data;
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
            var config = readD2DSlaveConfig(bytes.slice(offset, offset + 5));
            offset += 5;

            decoded.d2d_slave_config = decoded.d2d_slave_config || [];
            decoded.d2d_slave_config.push(config);
            break;
        case 0x96:
            var config = readD2DMasterConfig(bytes.slice(offset, offset + 8));
            offset += 8;

            decoded.d2d_master_config = decoded.d2d_master_config || [];
            decoded.d2d_master_config.push(config);
            break;
        case 0x4a: // sync_time
            decoded.sync_time = readYesNoStatus(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x8e: // report_interval
            // ignore the first byte
            decoded.report_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            offset += 3;
            break;
        case 0xab:
            decoded.temperature_calibration = {};
            decoded.temperature_calibration.enable = readEnableStatus(readUInt8(bytes[offset]));
            decoded.temperature_calibration.temperature = readInt16LE(bytes.slice(offset + 1, offset + 3)) / 10;
            offset += 3;
            break;
        case 0xb0:
            decoded.freeze_protection_config = decoded.freeze_protection_config || {};
            decoded.freeze_protection_config.enable = readEnableStatus(readUInt8(bytes[offset]));
            decoded.freeze_protection_config.temperature = readInt16LE(bytes.slice(offset + 1, offset + 3)) / 10;
            offset += 3;
            break;
        case 0xb5: // ob_mode
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
        case 0xb8: // temperature_tolerance
            decoded.temperature_tolerance = {};
            decoded.temperature_tolerance.target_temperature_tolerance = readUInt8(bytes[offset]) / 10;
            decoded.temperature_tolerance.auto_temperature_tolerance = readUInt8(bytes[offset + 1]) / 10;
            offset += 2;
            break;
        case 0xb9:
            decoded.temperature_level_up_condition = {};
            decoded.temperature_level_up_condition.type = readTemperatureLevelUpCondition(readUInt8(bytes[offset]));
            decoded.temperature_level_up_condition.time = readUInt8(bytes[offset + 1]);
            decoded.temperature_level_up_condition.temperature_control_tolerance = readInt16LE(bytes.slice(offset + 2, offset + 4)) / 10;
            offset += 4;
            break;
        case 0xba:
            var enable_value = bytes[offset];
            decoded.dst_config = {};
            decoded.dst_config.enable = readEnableStatus(enable_value);
            if (enable_value) {
                decoded.dst_config.offset = readUInt8(bytes[offset + 1]);
                decoded.dst_config.start_month = readMonth(readUInt8(bytes[offset + 2]));
                var start_day = readUInt8(bytes[offset + 3]);
                decoded.dst_config.start_week_num = (start_day >>> 4) & 0x0f;
                decoded.dst_config.start_week_day = readWeekDay(start_day & 0x0f);
                decoded.dst_config.start_time = readUInt16LE(bytes.slice(offset + 4, offset + 6));
                decoded.dst_config.end_month = readMonth(readUInt8(bytes[offset + 6]));
                var end_day = readUInt8(bytes[offset + 7]);
                decoded.dst_config.end_week_num = (end_day >>> 4) & 0x0f;
                decoded.dst_config.end_week_day = readWeekDay(end_day & 0x0f);
                decoded.dst_config.end_time = readUInt16LE(bytes.slice(offset + 8, offset + 10));
            }
            offset += 10;
            break;
        case 0xbd:
            decoded.timezone = readTimeZone(readInt16LE(bytes.slice(offset, offset + 2)));
            offset += 2;
            break;
        case 0xc1:
            var action_type_map = { 0: "power", 1: "plan" };
            decoded.card_config = {};
            decoded.card_config.enable = readEnableStatus(bytes[offset]);
            var action_type_value = readUInt8(bytes[offset + 1]);
            decoded.card_config.action_type = getValue(action_type_map, action_type_value);
            if (action_type_value === 1) {
                var action = readUInt8(bytes[offset + 2]);
                decoded.card_config.in_plan_type = readPlanType((action >>> 4) & 0x0f);
                decoded.card_config.out_plan_type = readPlanType(action & 0x0f);
            }
            decoded.card_config.invert = readYesNoStatus(bytes[offset + 3]);
            offset += 4;
            break;
        case 0xc2:
            decoded.plan_type = readPlanType(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0xc4:
            decoded.temperature_source_config = {};
            decoded.temperature_source_config.source = readTemperatureSource(readUInt8(bytes[offset]));
            decoded.temperature_source_config.timeout = readUInt8(bytes[offset + 1]);
            offset += 2;
            break;
        case 0xc5:
            decoded.temperature_control_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0xc7:
            var data = readUInt8(bytes[offset]);
            offset += 1;

            var mask = data >>> 4;
            var status = data & 0x0f;

            if ((mask >> 0) & 0x01) {
                decoded.d2d_master_enable = readEnableStatus(status & 0x01);
            }
            if ((mask >> 1) & 0x01) {
                decoded.d2d_slave_enable = readEnableStatus((status >> 1) & 0x01);
            }
            break;
        case 0xc9:
            var schedule = readPlanSchedule(bytes.slice(offset, offset + 6));
            offset += 6;

            decoded.plan_schedule = decoded.plan_schedule || [];
            decoded.plan_schedule.push(schedule);
            break;
        case 0xca:
            decoded.wires = readWires(bytes[offset], bytes[offset + 1], bytes[offset + 2]);
            decoded.ob_mode = readObMode((bytes[offset + 2] >>> 2) & 0x03);
            offset += 3;
            break;
        case 0xeb:
            decoded.temperature_unit = readTemperatureUnit(bytes[offset]);
            offset += 1;
            break;
        case 0xf6:
            decoded.control_permission = readControlPermission(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0xf7:
            var wire_relay_bit_offset = { y1: 0, y2_gl: 1, w1: 2, w2_aux: 3, e: 4, g: 5, ob: 6 };
            var mask = readUInt16LE(bytes.slice(offset, offset + 2));
            var status = readUInt16LE(bytes.slice(offset + 2, offset + 4));
            offset += 4;

            decoded.wires_relay_config = {};
            for (var key in wire_relay_bit_offset) {
                if ((mask >>> wire_relay_bit_offset[key]) & 0x01) {
                    decoded.wires_relay_config[key] = readOnOffStatus((status >>> wire_relay_bit_offset[key]) & 0x01);
                }
            }
            break;
        case 0xf8: // offline_control_mode
            decoded.offline_control_mode = readOfflineControlMode(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0xf9: // humidity_calibration
            decoded.humidity_calibration = {};
            decoded.humidity_calibration.enable = readEnableStatus(readUInt8(bytes[offset]));
            decoded.humidity_calibration.humidity = readInt16LE(bytes.slice(offset + 1, offset + 3)) / 10;
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

function handle_downlink_response_ext(channel_type, bytes, offset) {
    var decoded = {};

    switch (channel_type) {
        case 0x05:
            var fan_delay_control_result = readUInt8(bytes[offset + 2]);
            if (fan_delay_control_result === 0) {
                decoded.fan_delay_enable = readEnableStatus(readUInt8(bytes[offset]));
                decoded.fan_delay_time = readUInt8(bytes[offset + 1]);
            }
            offset += 3;
            break;
        case 0x06:
            var fan_execute_result = readUInt8(bytes[offset + 1]);
            if (fan_execute_result === 0) {
                decoded.fan_execute_time = readUInt8(bytes[offset]);
            }
            offset += 2;
            break;
        case 0x07:
            var dehumidify_control_result = readUInt8(bytes[offset + 2]);
            if (dehumidify_control_result === 0) {
                decoded.fan_dehumidify = {};
                var enable_value = readUInt8(bytes[offset]);
                decoded.fan_dehumidify.enable = readEnableStatus(enable_value);
                if (enable_value) {
                    decoded.fan_dehumidify.execute_time = readUInt8(bytes[offset + 1]);
                }
            }
            offset += 3;
            break;
        case 0x08:
            var screen_display_mode_result = readUInt8(bytes[offset + 1]);
            if (screen_display_mode_result === 0) {
                var screen_display_mode_map = { 0: "on", 1: "without plan show", 2: "disable all" };
                decoded.screen_display_mode = getValue(screen_display_mode_map, readUInt8(bytes[offset]));
            }
            offset += 2;
            break;
        case 0x09:
            var humidity_range_result = readUInt8(bytes[offset + 2]);
            if (humidity_range_result === 0) {
                decoded.humidity_range = {};
                decoded.humidity_range.min = readUInt8(bytes[offset]);
                decoded.humidity_range.max = readUInt8(bytes[offset + 1]);
            } else {
                throw new Error("humidity range control failed");
            }
            offset += 3;
            break;
        case 0x0a:
            var dehumidify_result = readUInt8(bytes[offset + 2]);
            if (dehumidify_result === 0) {
                decoded.temperature_dehumidify = {};
                var enable_value = readUInt8(bytes[offset]);
                decoded.temperature_dehumidify.enable = readEnableStatus(enable_value);
                var value = readUInt8(bytes[offset + 1]);
                if (value !== 0xff) {
                    decoded.temperature_dehumidify.temperature_tolerance = readUInt8(bytes[offset + 1]) / 10;
                }
            } else {
                throw new Error("dehumidify control failed");
            }
            offset += 3;
            break;
        case 0x1b:
            var temperature_up_down_enable_result = readUInt8(bytes[offset + 2]);
            if (temperature_up_down_enable_result === 0) {
                var masked = readUInt8(bytes[offset]);
                var enabled = readUInt8(bytes[offset + 1]);

                decoded.temperature_up_down_enable = {};
                var bit_offset = { forward_enable: 0, backward_enable: 1 };
                for (var key in bit_offset) {
                    decoded.temperature_up_down_enable[key] = readEnableStatus((enabled >>> bit_offset[key]) & 0x01);
                }
            } else {
                throw new Error("temperature up down enable control failed");
            }
            offset += 3;
            break;
        case 0x3a:
            var wires_relay_change_report_result = readUInt8(bytes[offset + 1]);
            if (wires_relay_change_report_result === 0) {
                decoded.wires_relay_change_report_enable = readEnableStatus(readUInt8(bytes[offset]));
            } else {
                throw new Error("wires relay change report control failed");
            }
            offset += 2;
            break;
        case 0x3b:
            var aux_control_config_result = readUInt8(bytes[offset + 1]);
            if (aux_control_config_result === 0) {
                var value = readUInt8(bytes[offset]);
                decoded.aux_control_config = {};
                var aux_control_bit_offset = { y2_enable: 0, w2_enable: 1 };
                for (var key in aux_control_bit_offset) {
                    if ((value >>> (aux_control_bit_offset[key] + 4)) & 0x01) {
                        decoded.aux_control_config[key] = readEnableStatus((value >>> aux_control_bit_offset[key]) & 0x01);
                    }
                }
            } else {
                throw new Error("aux control config control failed");
            }
            offset += 2;
            break;
        case 0x3e:
            var d2d_master_id_result = readUInt8(bytes[offset + 9]);
            if (d2d_master_id_result === 0) {
                var d2d_master_id = {};
                d2d_master_id.id = readUInt8(bytes[offset]) + 1;
                d2d_master_id.dev_eui = toHexString(bytes.slice(offset + 1, offset + 9));

                decoded.d2d_master_ids = decoded.d2d_master_ids || [];
                decoded.d2d_master_ids.push(d2d_master_id);
            } else {
                throw new Error("d2d master id control failed");
            }
            offset += 10;
            break;
        case 0x41:
            var target_temperature_resolution_result = readUInt8(bytes[offset + 1]);
            if (target_temperature_resolution_result === 0) {
                decoded.target_temperature_resolution = readTemperatureResolution(readUInt8(bytes[offset]));
            } else {
                throw new Error("target temperature resolution control failed");
            }
            offset += 2;
            break;
        case 0x42:
            var target_temperature_range_result = readUInt8(bytes[offset + 5]);
            if (target_temperature_range_result === 0) {
                decoded.target_temperature_range = {};
                decoded.target_temperature_range.temperature_control_mode = readTemperatureControlMode(readUInt8(bytes[offset]));
                decoded.target_temperature_range.min = readInt16LE(bytes.slice(offset + 1, offset + 3)) / 10;
                decoded.target_temperature_range.max = readInt16LE(bytes.slice(offset + 3, offset + 5)) / 10;
            } else {
                throw new Error("temperature target range control failed");
            }
            offset += 6;
            break;
        case 0x43:
            var temperature_level_up_down_delta_result = readUInt8(bytes[offset + 3]);
            if (temperature_level_up_down_delta_result === 0) {
                decoded.temperature_level_up_down_delta = {};
                // skip the first byte
                decoded.temperature_level_up_down_delta.delta_1 = readUInt8(bytes[offset + 1]) / 10;
                decoded.temperature_level_up_down_delta.delta_2 = readUInt8(bytes[offset + 2]) / 10;
            } else {
                throw new Error("temperature level up down delta control failed");
            }
            offset += 4;
            break;
        case 0x44:
            var fan_delay_control_result = readUInt8(bytes[offset + 3]);
            if (fan_delay_control_result === 0) {
                decoded.fan_delay_config = {};
                decoded.fan_delay_config.enable = readEnableStatus(readUInt8(bytes[offset]));
                decoded.fan_delay_config.delay_time = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            } else {
                throw new Error("fan delay control failed");
            }
            offset += 4;
            break;
        case 0x45:
            var temperature_control_config_result = readUInt8(bytes[offset + 4]);
            if (temperature_control_config_result === 0) {
                decoded.system_status = readOnOffStatus(readUInt8(bytes[offset]));
                decoded.temperature_control_mode = readTemperatureControlMode(readUInt8(bytes[offset + 1]));
                decoded.target_temperature = readInt16LE(bytes.slice(offset + 2, offset + 4)) / 10;
            } else {
                throw new Error("temperature control failed");
            }
            offset += 5;
            break;
        case 0x46:
            var compressor_aux_combine_enable_result = readUInt8(bytes[offset + 1]);
            if (compressor_aux_combine_enable_result === 0) {
                decoded.compressor_aux_combine_enable = readEnableStatus(readUInt8(bytes[offset]));
            } else {
                throw new Error("compressor aux combine enable control failed");
            }
            offset += 2;
            break;
        case 0x47:
            var system_protect_config_result = readUInt8(bytes[offset + 2]);
            if (system_protect_config_result === 0) {
                decoded.system_protect_config = {};
                decoded.system_protect_config.enable = readEnableStatus(readUInt8(bytes[offset]));
                decoded.system_protect_config.duration = readUInt8(bytes[offset + 1]);
            } else {
                throw new Error("system protect config control failed");
            }
            offset += 3;
            break;
        case 0x57:
            var temperature_tolerance_2_result = readUInt8(bytes[offset + 1]);
            if (temperature_tolerance_2_result === 0) {
                decoded.temperature_tolerance_2 = readUInt8(bytes[offset]) / 10;
            }
            offset += 2;
            break;
        case 0x58:
            var target_temperature_dual_result = readUInt8(bytes[offset + 1]);
            if (target_temperature_dual_result === 0) {
                decoded.target_temperature_dual = readEnableStatus(readUInt8(bytes[offset]));
            }
            offset += 2;
            break;
        case 0x59:
            var dual_temperature_plan_config_result = readUInt8(bytes[offset + 9]);
            if (dual_temperature_plan_config_result === 0) {
                var dual_temperature_plan_config = readDualTemperaturePlanConfig(bytes.slice(offset, offset + 9));
                decoded.dual_temperature_plan_config = decoded.dual_temperature_plan_config || [];
                decoded.dual_temperature_plan_config.push(dual_temperature_plan_config);
            }
            offset += 10;
            break;
        case 0x5a:
            var tolerance_result = readUInt8(bytes[offset + 2]);
            if (tolerance_result === 0) {
                decoded.dual_temperature_tolerance = decoded.dual_temperature_tolerance || {};
                var tolerance_index = readUInt8(bytes[offset]);
                var tolerance_value = readUInt8(bytes[offset + 1]) / 10;
                if (tolerance_index === 0x00) {
                    decoded.dual_temperature_tolerance.heat_tolerance = tolerance_value;
                } else if (tolerance_index === 0x01) {
                    decoded.dual_temperature_tolerance.cool_tolerance = tolerance_value;
                }
            }
            offset += 3;
            break;
        case 0x5c:
            var unlock_config_result = readUInt8(bytes[offset + 3]);
            if (unlock_config_result === 0) {
                var bit_offset = { power_button: 0, temperature_up_button: 1, temperature_down_button: 2, fan_mode_button: 3, temperature_control_mode_button: 4 };

                var data = readUInt8(bytes[offset]);
                decoded.unlock_config = {};
                for (var key in bit_offset) {
                    decoded.unlock_config[key] = readEnableStatus((data >>> bit_offset[key]) & 0x01);
                }
                decoded.unlock_config.time = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            }
            offset += 4;
            break;
        case 0x5e:
            var single_temperature_plan_config_result = readUInt8(bytes[offset + 7]);
            if (single_temperature_plan_config_result === 0) {
                var single_temperature_plan_config = readSingleTemperaturePlanConfig(bytes.slice(offset, offset + 7));
                decoded.single_temperature_plan_config = decoded.single_temperature_plan_config || [];
                decoded.single_temperature_plan_config.push(single_temperature_plan_config);
            }
            offset += 8;
            break;
        case 0x5d:
            var temperature_control_forbidden_config_result = readUInt8(bytes[offset + 1]);
            if (temperature_control_forbidden_config_result === 0) {
                var bit_offset = { heat_enable: 0, em_heat_enable: 1, cool_enable: 2, auto_enable: 3 };

                var value = readUInt8(bytes[offset]);
                decoded.temperature_control_forbidden_config = {};
                for (var key in bit_offset) {
                    decoded.temperature_control_forbidden_config[key] = readEnableStatus((value >>> bit_offset[key]) & 0x01);
                }
            } else {
                throw new Error("temperature control forbidden config control failed");
            }
            offset += 2;
            break;
        case 0x62:
            var fan_control_during_heating_result = readUInt8(bytes[offset + 1]);
            if (fan_control_during_heating_result === 0) {
                decoded.fan_control_during_heating = readFanControlDuringHeating(readUInt8(bytes[offset]));
            } else {
                throw new Error("fan control during heating control failed");
            }
            offset += 2;
            break;
        default:
            throw new Error("unknown downlink response");
    }

    return { data: decoded, offset: offset };
}

function readProtocolVersion(bytes) {
    var major = (bytes & 0xf0) >> 4;
    var minor = bytes & 0x0f;
    return "v" + major + "." + minor;
}

function readHardwareVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = (bytes[1] & 0xff) >> 4;
    return "v" + major + "." + minor;
}

function readFirmwareVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = bytes[1] & 0xff;
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

function readD2DCommand(bytes) {
    return ("0" + (bytes[1] & 0xff).toString(16)).slice(-2) + ("0" + (bytes[0] & 0xff).toString(16)).slice(-2);
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

function readResetEvent(status) {
    var status_map = { 0: "normal", 1: "reset" };
    return getValue(status_map, status);
}

function readEnableStatus(type) {
    var enable_status_map = { 0: "disable", 1: "enable" };
    return getValue(enable_status_map, type);
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

function readTemperatureResolution(type) {
    var temperature_resolution_map = { 0: 0.5, 1: 1 };
    return getValue(temperature_resolution_map, type);
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

function readExecutePlanType(type) {
    var plan_event_map = {
        0: "not executed",
        1: "wake",
        2: "away",
        3: "home",
        4: "sleep",
        5: "occupied",
        6: "vacant",
        7: "eco",
    };
    return getValue(plan_event_map, type);
}

function readPlanType(type) {
    var plan_event_type_map = {
        0: "wake",
        1: "away",
        2: "home",
        3: "sleep",
        4: "occupied",
        5: "vacant",
        6: "eco",
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
    var temperature_control_mode_map = {
        0: "heat",
        1: "em heat",
        2: "cool",
        3: "auto",
        4: "auto heat",
        5: "auto cool",
    };
    return getValue(temperature_control_mode_map, type);
}

function readTemperatureControlStatus(type) {
    var temperature_control_status_map = {
        0: "standby",
        1: "stage-1 heat",
        2: "stage-2 heat",
        3: "stage-3 heat",
        4: "stage-4 heat",
        5: "em heat",
        6: "stage-1 cool",
        7: "stage-2 cool",
        8: "stage-5 heat",
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
    var ob_mode_map = {
        0: "on cool",
        1: "on heat",
        3: "hold",
    };
    return getValue(ob_mode_map, type);
}

function readActionType(type) {
    var action_type_map = {
        0: "power",
        1: "plan",
    };
    return getValue(action_type_map, type);
}

function readTemperatureLevelUpCondition(type) {
    var temperature_level_up_condition_map = { 0: "heat", 1: "cool" };
    return getValue(temperature_level_up_condition_map, type);
}

function readTemperatureControlSupportMode(value) {
    var enable = {};
    enable.heat = readEnableStatus((value >>> 0) & 0x01);
    enable.em_heat = readEnableStatus((value >>> 1) & 0x01);
    enable.cool = readEnableStatus((value >>> 2) & 0x01);
    enable.auto = readEnableStatus((value >>> 3) & 0x01);
    return enable;
}

function readTemperatureControlSupportStatus(heat_mode_value, cool_mode_value) {
    var enable = {};
    enable.stage_1_heat = readEnableStatus((heat_mode_value >>> 0) & 0x01);
    enable.stage_2_heat = readEnableStatus((heat_mode_value >>> 1) & 0x01);
    enable.stage_3_heat = readEnableStatus((heat_mode_value >>> 2) & 0x01);
    enable.stage_4_heat = readEnableStatus((heat_mode_value >>> 3) & 0x01);
    enable.stage_5_heat = readEnableStatus((heat_mode_value >>> 4) & 0x01);
    enable.stage_1_cool = readEnableStatus((cool_mode_value >>> 0) & 0x01);
    enable.stage_2_cool = readEnableStatus((cool_mode_value >>> 1) & 0x01);
    return enable;
}

function readWeekRecycleSettings(value) {
    var week_day_bits_offset = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 7 };
    var week_enable = {};
    for (var day in week_day_bits_offset) {
        week_enable[day] = readEnableStatus((value >>> week_day_bits_offset[day]) & 0x01);
    }
    return week_enable;
}

function readMonth(type) {
    var month_map = { 1: "January", 2: "February", 3: "March", 4: "April", 5: "May", 6: "June", 7: "July", 8: "August", 9: "September", 10: "October", 11: "November", 12: "December" };
    return getValue(month_map, type);
}

function readWeekDay(type) {
    var week_day_map = { 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday", 7: "Sunday" };
    return getValue(week_day_map, type);
}

function readTimeZone(timezone) {
    var timezone_map = { "-720": "UTC-12", "-660": "UTC-11", "-600": "UTC-10", "-570": "UTC-9:30", "-540": "UTC-9", "-480": "UTC-8", "-420": "UTC-7", "-360": "UTC-6", "-300": "UTC-5", "-240": "UTC-4", "-210": "UTC-3:30", "-180": "UTC-3", "-120": "UTC-2", "-60": "UTC-1", 0: "UTC", 60: "UTC+1", 120: "UTC+2", 180: "UTC+3", 210: "UTC+3:30", 240: "UTC+4", 270: "UTC+4:30", 300: "UTC+5", 330: "UTC+5:30", 345: "UTC+5:45", 360: "UTC+6", 390: "UTC+6:30", 420: "UTC+7", 480: "UTC+8", 540: "UTC+9", 570: "UTC+9:30", 600: "UTC+10", 630: "UTC+10:30", 660: "UTC+11", 720: "UTC+12", 765: "UTC+12:45", 780: "UTC+13", 840: "UTC+14" };
    return getValue(timezone_map, timezone);
}

function readDualTemperaturePlanConfig(bytes) {
    var offset = 0;

    var config = {};
    config.plan_type = readPlanType(readUInt8(bytes[offset]));
    config.temperature_control_mode = readTemperatureControlMode(readUInt8(bytes[offset + 1]));
    config.fan_mode = readFanMode(readUInt8(bytes[offset + 2]));
    var heat_target_temperature_value = readUInt16LE(bytes.slice(offset + 3, offset + 5));
    if (heat_target_temperature_value !== 0xffff) {
        config.heat_target_temperature = readInt16LE(bytes.slice(offset + 3, offset + 5)) / 10;
    }
    var heat_temperature_tolerance_value = readUInt8(bytes[offset + 5]);
    if (heat_temperature_tolerance_value !== 0xff) {
        config.heat_temperature_control_tolerance = heat_temperature_tolerance_value / 10;
    }
    var cool_target_temperature_value = readUInt16LE(bytes.slice(offset + 6, offset + 8));
    if (cool_target_temperature_value !== 0xffff) {
        config.cool_target_temperature = readInt16LE(bytes.slice(offset + 6, offset + 8)) / 10;
    }
    var cool_temperature_tolerance_value = readUInt8(bytes[offset + 8]);
    if (cool_temperature_tolerance_value !== 0xff) {
        config.cool_temperature_control_tolerance = cool_temperature_tolerance_value / 10;
    }
    return config;
}

function readSingleTemperaturePlanConfig(bytes) {
    var offset = 0;

    var config = {};
    config.plan_type = readPlanType(readUInt8(bytes[offset]));
    config.temperature_control_mode = readTemperatureControlMode(readUInt8(bytes[offset + 1]));
    config.fan_mode = readFanMode(readUInt8(bytes[offset + 2]));
    config.target_temperature = readInt16LE(bytes.slice(offset + 3, offset + 5)) / 10;
    config.target_temperature_tolerance = readUInt8(bytes[offset + 5]) / 10;
    config.temperature_control_tolerance = readUInt8(bytes[offset + 6]) / 10;
    return config;
}

function readDualTemperaturePlanConfig(bytes) {
    var offset = 0;

    var config = {};
    config.type = readPlanType(readUInt8(bytes[offset]));
    config.temperature_control_mode = readTemperatureControlMode(readUInt8(bytes[offset + 1]));
    config.fan_mode = readFanMode(readUInt8(bytes[offset + 2]));
    var heat_target_temperature_value = readUInt16LE(bytes.slice(offset + 3, offset + 5));
    if (heat_target_temperature_value !== 0xffff) {
        config.heat_target_temperature = readUInt16LE(bytes.slice(offset + 3, offset + 5)) / 10;
    }
    var heat_temperature_tolerance_value = readUInt8(bytes[offset + 5]);
    if (heat_temperature_tolerance_value !== 0xff) {
        config.heat_temperature_tolerance = heat_temperature_tolerance_value / 10;
    }
    var cool_target_temperature_value = readUInt16LE(bytes.slice(offset + 6, offset + 8));
    if (cool_target_temperature_value !== 0xffff) {
        config.cool_target_temperature = readUInt16LE(bytes.slice(offset + 6, offset + 8)) / 10;
    }
    var cool_temperature_tolerance_value = readUInt8(bytes[offset + 8]);
    if (cool_temperature_tolerance_value !== 0xff) {
        config.cool_temperature_tolerance = cool_temperature_tolerance_value / 10;
    }
    return config;
}

function readPlanSchedule(bytes) {
    var offset = 0;
    var schedule = {};
    schedule.plan_type = readPlanType(bytes[offset]);
    schedule.id = bytes[offset + 1] + 1;
    schedule.enable = readEnableStatus(bytes[offset + 2]);
    schedule.week_recycle = readWeekRecycleSettings(bytes[offset + 3]);
    schedule.time = readUInt16LE(bytes.slice(offset + 4, offset + 6));
    return schedule;
}

function readD2DMasterConfig(bytes) {
    var offset = 0;
    var config = {};
    config.plan_type = readPlanType(readUInt8(bytes[offset]));
    config.enable = readEnableStatus(bytes[offset + 1]);
    config.uplink_enable = readEnableStatus(bytes[offset + 2]);
    config.d2d_cmd = readD2DCommand(bytes.slice(offset + 3, offset + 5));
    config.time = readUInt16LE(bytes.slice(offset + 5, offset + 7));
    config.time_enable = readEnableStatus(bytes[offset + 7]);
    return config;
}

function readD2DSlaveConfig(bytes) {
    var offset = 0;
    var config = {};
    config.id = readUInt8(bytes[offset]) + 1;
    config.enable = readEnableStatus(bytes[offset + 1]);
    config.d2d_cmd = readD2DCommand(bytes.slice(offset + 2, offset + 4));

    var value = readUInt8(bytes[offset + 4]);
    // value = action(0..3) + action_type(4..7)
    var action_value = value & 0x0f;
    var action_type_value = (value >>> 4) & 0x0f;
    config.action = {};
    if (action_type_value === 0) {
        config.action.action_type = readActionType(action_type_value);
        config.action.system_status = readOnOffStatus(action_value);
    } else {
        config.action.action_type = readActionType(action_type_value);
        config.action.plan_type = readPlanType(action_value);
    }
    return config;
}

function readTemperatureSource(value) {
    var source_map = { 0: "disable", 1: "lora", 2: "d2d" };
    return getValue(source_map, value);
}

function readFanControlDuringHeating(value) {
    var mode_map = { 0: "furnace", 1: "thermostat" };
    return getValue(mode_map, value);
}

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

// hex bytes to hex string
function toHexString(bytes) {
    for (var i = 0; i < bytes.length; i++) {
        bytes[i] = ("0" + bytes[i].toString(16)).slice(-2);
    }
    return bytes.join("");
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
                // TypeError if undefined or null
                throw new TypeError("Cannot convert first argument to object");
            }

            var to = Object(target);
            for (var i = 1; i < arguments.length; i++) {
                var nextSource = arguments[i];
                if (nextSource == null) {
                    // Skip over if undefined or null
                    continue;
                }
                nextSource = Object(nextSource);

                var keysArray = Object.keys(Object(nextSource));
                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                    var nextKey = keysArray[nextIndex];
                    var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== undefined && desc.enumerable) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
            return to;
        },
    });
}
