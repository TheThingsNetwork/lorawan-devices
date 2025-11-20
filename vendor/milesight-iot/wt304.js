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
 * @product WT303
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

    var unknown_command = 0;
    for (var i = 0; i < bytes.length; ) {
        var command_id = bytes[i++];

        switch (command_id) {
            // attribute
            case 0xdf:
                decoded.tsl_version = readProtocolVersion(bytes.slice(i, i + 2));
                i += 2;
                break;
            case 0xde: // ?
                decoded.product_name = readString(bytes.slice(i, i + 32));
                i += 32;
                break;
            case 0xdd: // ?
                decoded.product_pn = readString(bytes.slice(i, i + 32));
                i += 32;
                break;
            case 0xdb:
                decoded.product_sn = readHexString(bytes.slice(i, i + 8));
                i += 8;
                break;
            case 0xda:
                decoded.version = {};
                decoded.version.hardware_version = readHardwareVersion(bytes.slice(i, i + 2));
                decoded.version.firmware_version = readFirmwareVersion(bytes.slice(i + 2, i + 8));
                i += 8;
                break;
            case 0xd9:
                decoded.oem_id = readHexString(bytes.slice(i, i + 2));
                i += 2;
                break;
            case 0xd8:
                decoded.product_frequency_band = readString(bytes.slice(i, i + 16));
                i += 16;
                break;
            case 0xee:
                decoded.device_request = 1;
                i += 0;
                break;
            case 0xc8:
                decoded.device_status = readDeviceStatus(bytes[i]);
                i += 1;
                break;
            case 0xcf:
                // skip 1 byte
                decoded.lorawan_class = readLoRaWANClass(bytes[i + 1]);
                i += 2;
                break;

            // telemetry
            case 0x01:
                decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 100;
                i += 2;
                break;
            case 0x02:
                decoded.humidity = readUInt16LE(bytes.slice(i, i + 2)) / 10;
                i += 2;
                break;
            case 0x03:
                decoded.target_temperature = readInt16LE(bytes.slice(i, i + 2)) / 100;
                i += 2;
                break;
            case 0x04:
                decoded.temperature_data_source = readTemperatureDataSource(bytes[i]);
                i += 1;
                break;
            case 0x05:
                var temperature_control_data = readUInt8(bytes[i]);
                decoded.temperature_control_status = readTemperatureControlStatus((temperature_control_data >>> 0) & 0x0f);
                decoded.temperature_control_mode = readTemperatureControlMode((temperature_control_data >>> 4) & 0x0f);
                i += 1;
                break;
            case 0x06:
                decoded.valve_status = readValveStatus(bytes[i]);
                i += 1;
                break;
            case 0x07:
                var fan_data = readUInt8(bytes[i]);
                decoded.fan_status = readFanStatus((fan_data >>> 0) & 0x0f);
                decoded.fan_mode = readFanMode((fan_data >>> 4) & 0x0f);
                i += 1;
                break;
            case 0x08:
                decoded.plan_id = readPlanId(readUInt8(bytes[i]));
                i += 1;
                break;
            case 0x09:
                var alarm_type = readUInt8(bytes[i]);
                decoded.temperature_alarm = {};
                decoded.temperature_alarm.type = readTemperatureAlarmType(alarm_type);
                if (hasTemperature(alarm_type)) {
                    var temperature = readInt16LE(bytes.slice(i + 1, i + 3)) / 100;
                    decoded.temperature = temperature;
                    decoded.temperature_alarm.temperature = temperature;
                    i += 3;
                } else {
                    i += 1;
                }
                break;
            case 0x0a:
                decoded.humidity_alarm = readHumidityAlarm(bytes[i]);
                i += 1;
                break;
            case 0x0b:
                decoded.target_temperature_alarm = readTargetTemperatureAlarm(bytes[i]);
                i += 1;
                break;
            case 0x10:
                var relay_status_offset = { gl_status: 0, gm_status: 1, gh_status: 2, valve_1_status: 3, valve_2_status: 4 };
                var relay_status_data = readUInt32LE(bytes.slice(i, i + 4));
                decoded.relay_status = decoded.relay_status || {};
                for (var key in relay_status_offset) {
                    decoded.relay_status[key] = readEnableStatus((relay_status_data >>> relay_status_offset[key]) & 0x01);
                }
                i += 4;
                break;

            // config
            case 0x60:
                var time_unit = readUInt8(bytes[i]);
                decoded.collection_interval = {};
                decoded.collection_interval.unit = readTimeUnitType(time_unit);
                if (time_unit === 0) {
                    decoded.collection_interval.seconds_of_time = readUInt16LE(bytes.slice(i + 1, i + 3));
                } else if (time_unit === 1) {
                    decoded.collection_interval.minutes_of_time = readUInt16LE(bytes.slice(i + 1, i + 3));
                }
                i += 3;
                break;
            case 0x62:
                var time_unit = readUInt8(bytes[i]);
                decoded.reporting_interval = {};
                decoded.reporting_interval.unit = readTimeUnitType(time_unit);
                if (time_unit === 0) {
                    decoded.reporting_interval.seconds_of_time = readUInt16LE(bytes.slice(i + 1, i + 3));
                } else if (time_unit === 1) {
                    decoded.reporting_interval.minutes_of_time = readUInt16LE(bytes.slice(i + 1, i + 3));
                }
                i += 3;
                break;
            case 0x63:
                decoded.temperature_unit = readTemperatureUnit(bytes[i]);
                i += 1;
                break;
            case 0x64:
                decoded.support_mode = readSupportMode(bytes[i]);
                i += 1;
                break;
            case 0x65:
                decoded.intelligent_display_enable = readEnableStatus(bytes[i]);
                i += 1;
                break;
            case 0x66:
                decoded.screen_object_settings = decoded.screen_object_settings || {};
                decoded.screen_object_settings.enable = readEnableStatus(bytes[i]);
                var screen_object_data = readUInt8(bytes[i + 1]);
                var screen_object_offset = { environment_temperature_enable: 0, environment_humidity_enable: 1, target_temperature_enable: 2, schedule_name_enable: 3 };
                for (var key in screen_object_offset) {
                    decoded.screen_object_settings[key] = readEnableStatus((screen_object_data >>> screen_object_offset[key]) & 0x01);
                }
                i += 2;
                break;
            case 0x67:
                decoded.system_status = readSystemStatus(bytes[i]);
                i += 1;
                break;
            case 0x68:
                decoded.temperature_control_mode = readTemperatureControlMode(bytes[i]);
                i += 1;
                break;
            case 0x69:
                decoded.target_temperature_resolution = readTargetTemperatureResolution(bytes[i]);
                i += 1;
                break;
            case 0x6a:
                decoded.target_temperature_tolerance = readInt16LE(bytes.slice(i, i + 2)) / 100;
                i += 2;
                break;
            case 0x6b:
                decoded.heating_target_temperature = readInt16LE(bytes.slice(i, i + 2)) / 100;
                i += 2;
                break;
            case 0x6c:
                decoded.cooling_target_temperature = readInt16LE(bytes.slice(i, i + 2)) / 100;
                i += 2;
                break;
            case 0x6d:
                decoded.heating_target_temperature_range = {};
                decoded.heating_target_temperature_range.min = readInt16LE(bytes.slice(i, i + 2)) / 100;
                decoded.heating_target_temperature_range.max = readInt16LE(bytes.slice(i + 2, i + 4)) / 100;
                i += 4;
                break;
            case 0x6e:
                decoded.cooling_target_temperature_range = {};
                decoded.cooling_target_temperature_range.min = readInt16LE(bytes.slice(i, i + 2)) / 100;
                decoded.cooling_target_temperature_range.max = readInt16LE(bytes.slice(i + 2, i + 4)) / 100;
                i += 4;
                break;
            case 0x6f:
                decoded.dehumidify_config = {};
                decoded.dehumidify_config.enable = readEnableStatus(bytes[i]);
                decoded.dehumidify_config.temperature_tolerance = readInt16LE(bytes.slice(i + 1, i + 3)) / 100;
                i += 3;
                break;
            case 0x70:
                decoded.target_humidity_range = {};
                decoded.target_humidity_range.min = readUInt16LE(bytes.slice(i, i + 2)) / 10;
                decoded.target_humidity_range.max = readUInt16LE(bytes.slice(i + 2, i + 4)) / 10;
                i += 4;
                break;
            case 0x72:
                decoded.fan_mode = readFanMode(bytes[i]);
                i += 1;
                break;
            case 0x73:
                decoded.fan_speed_config = {};
                decoded.fan_speed_config.delta_1 = readInt16LE(bytes.slice(i, i + 2)) / 100;
                decoded.fan_speed_config.delta_2 = readInt16LE(bytes.slice(i + 2, i + 4)) / 100;
                i += 4;
                break;
            case 0x74:
                decoded.fan_delay_config = {};
                decoded.fan_delay_config.enable = readEnableStatus(bytes[i]);
                decoded.fan_delay_config.delay_time = readUInt16LE(bytes.slice(i + 1, i + 3));
                i += 3;
                break;
            case 0x75:
                var child_lock_offset = { system_button: 0, temperature_button: 1, fan_button: 2, temperature_control_button: 3, reboot_reset_button: 4 };
                decoded.child_lock_settings = {};
                decoded.child_lock_settings.enable = readEnableStatus(bytes[i]);
                var child_lock_data = readUInt8(bytes[i + 1]);
                for (var key in child_lock_offset) {
                    decoded.child_lock_settings[key] = readEnableStatus((child_lock_data >>> child_lock_offset[key]) & 0x01);
                }
                i += 2;
                break;
            case 0x76:
                decoded.temperature_alarm_settings = {};
                decoded.temperature_alarm_settings.enable = readEnableStatus(bytes[i]);
                decoded.temperature_alarm_settings.condition = readMathConditionType(readUInt8(bytes[i + 1]));
                decoded.temperature_alarm_settings.threshold_min = readInt16LE(bytes.slice(i + 2, i + 4)) / 100;
                decoded.temperature_alarm_settings.threshold_max = readInt16LE(bytes.slice(i + 4, i + 6)) / 100;
                i += 6;
                break;
            case 0x77:
                decoded.high_temperature_alarm_settings = {};
                decoded.high_temperature_alarm_settings.enable = readEnableStatus(bytes[i]);
                decoded.high_temperature_alarm_settings.delta_temperature = readInt16LE(bytes.slice(i + 1, i + 3)) / 100;
                decoded.high_temperature_alarm_settings.duration = readUInt8(bytes[i + 3]);
                i += 4;
                break;
            case 0x78:
                decoded.low_temperature_alarm_settings = {};
                decoded.low_temperature_alarm_settings.enable = readEnableStatus(bytes[i]);
                decoded.low_temperature_alarm_settings.delta_temperature = readInt16LE(bytes.slice(i + 1, i + 3)) / 100;
                decoded.low_temperature_alarm_settings.duration = readUInt8(bytes[i + 3]);
                i += 4;
                break;
            case 0x79:
                decoded.temperature_calibration_settings = {};
                decoded.temperature_calibration_settings.enable = readEnableStatus(bytes[i]);
                decoded.temperature_calibration_settings.calibration_value = readInt16LE(bytes.slice(i + 1, i + 3)) / 100;
                i += 3;
                break;
            case 0x7a:
                decoded.humidity_calibration_settings = {};
                decoded.humidity_calibration_settings.enable = readEnableStatus(bytes[i]);
                decoded.humidity_calibration_settings.calibration_value = readInt16LE(bytes.slice(i + 1, i + 3)) / 10;
                i += 3;
                break;
            case 0x7b:
                var plan_config = {};
                plan_config.plan_id = readUInt8(bytes[i]) + 1;
                var data = readUInt8(bytes[i + 1]);
                if (data === 0x00) {
                    plan_config.enable = readEnableStatus(bytes[i + 2]);
                    i += 3;
                } else if (data === 0x01) {
                    plan_config.name_first = readString(bytes.slice(i + 2, i + 8));
                    i += 8;
                } else if (data === 0x02) {
                    plan_config.name_last = readString(bytes.slice(i + 2, i + 6));
                    i += 6;
                } else if (data === 0x03) {
                    var fan_mode_data = readUInt8(bytes[i + 2]);
                    var heating_temperature_data = readInt16LE(bytes.slice(i + 3, i + 5));
                    var cooling_temperature_data = readInt16LE(bytes.slice(i + 5, i + 7));
                    var temperature_tolerance_data = readInt16LE(bytes.slice(i + 7, i + 9));
                    plan_config.fan_mode = readFanMode(fan_mode_data);
                    plan_config.heating_temperature = (heating_temperature_data >>> 1) / 100;
                    plan_config.cooling_temperature = (cooling_temperature_data >>> 1) / 100;
                    plan_config.temperature_tolerance = (temperature_tolerance_data >>> 1) / 100;
                    plan_config.heating_temperature_enable = readEnableStatus((heating_temperature_data >>> 0) & 0x01);
                    plan_config.cooling_temperature_enable = readEnableStatus((cooling_temperature_data >>> 0) & 0x01);
                    plan_config.temperature_tolerance_enable = readEnableStatus((temperature_tolerance_data >>> 0) & 0x01);
                    i += 9;
                } else if (data === 0x04) {
                    var schedule_config = {};
                    schedule_config.index = readUInt8(bytes[i + 2]) + 1;
                    schedule_config.enable = readEnableStatus(bytes[i + 3]);
                    schedule_config.time = readUInt16LE(bytes.slice(i + 4, i + 6));
                    var data = readUInt8(bytes[i + 6]);
                    var weekday_bits_offset = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
                    schedule_config.weekday = {};
                    for (var key in weekday_bits_offset) {
                        schedule_config.weekday[key] = readEnableStatus((data >>> weekday_bits_offset[key]) & 0x01);
                    }
                    i += 7;
                    plan_config.schedule_config = plan_config.schedule_config || [];
                    plan_config.schedule_config.push(schedule_config);
                }
                decoded.plan_config = decoded.plan_config || [];
                decoded.plan_config.push(plan_config);
                break;
            case 0x7c:
                var mode_value = readUInt8(bytes[i]);
                decoded.valve_interface_settings = {};
                decoded.valve_interface_settings.mode = readValveInterfaceMode(mode_value);
                // four_pipe_two_wire
                if (mode_value === 0x00) {
                    decoded.valve_interface_settings.four_pipe_two_wire = {};
                    decoded.valve_interface_settings.four_pipe_two_wire.cooling_valve = readValve(bytes[i + 1]);
                    decoded.valve_interface_settings.four_pipe_two_wire.heating_valve = readValve(bytes[i + 2]);
                    i += 3;
                }
                // two_pipe_two_wire
                else if (mode_value === 0x01) {
                    decoded.valve_interface_settings.two_pipe_two_wire = {};
                    decoded.valve_interface_settings.two_pipe_two_wire.valve = readValve(bytes[i + 1]);
                    i += 2;
                }
                // two_pipe_three_wire
                else if (mode_value === 0x02) {
                    decoded.valve_interface_settings.two_pipe_three_wire = {};
                    decoded.valve_interface_settings.two_pipe_three_wire.no_valve = readValve(bytes[i + 1]);
                    decoded.valve_interface_settings.two_pipe_three_wire.nc_valve = readValve(bytes[i + 2]);
                    i += 3;
                }
                break;
            case 0x80:
                decoded.di_settings = decoded.di_settings || {};
                decoded.di_settings.enable = readEnableStatus(bytes[i]);
                i += 1;
                break;
            case 0x81:
                decoded.di_settings = decoded.di_settings || {};
                var di_settings_type = readUInt8(bytes[i]);
                decoded.di_settings.type = readDIType(di_settings_type);
                if (di_settings_type === 0) {
                    decoded.di_settings.card_control = {};
                    var card_control_data = readUInt8(bytes[i + 1]);
                    decoded.di_settings.card_control.mode = readCardControlMode(card_control_data);
                    // power mode
                    if (card_control_data === 0x00) {
                        decoded.di_settings.card_control.system_status = readSystemStatus(bytes[i + 2]);
                        i += 3;
                    }
                    // plan mode
                    else if (card_control_data === 0x01) {
                        decoded.di_settings.card_control.in_plan_id = readUInt8(bytes[i + 2]) + 1;
                        decoded.di_settings.card_control.out_plan_id = readUInt8(bytes[i + 3]) + 1;
                        i += 4;
                    }
                } else if (di_settings_type === 1) {
                    decoded.di_settings.magnet_detection = {};
                    var magnet_detection_data = readUInt8(bytes[i + 1]);
                    decoded.di_settings.magnet_detection.mode = readMagnetDetectionMode(magnet_detection_data);
                    i += 2;
                }
                break;
            case 0x82:
                decoded.window_opening_detection_settings = decoded.window_opening_detection_settings || {};
                decoded.window_opening_detection_settings.enable = readEnableStatus(bytes[i]);
                i += 1;
                break;
            case 0x83:
                decoded.window_opening_detection_settings = decoded.window_opening_detection_settings || {};
                var data = readUInt8(bytes[i]);
                decoded.window_opening_detection_settings.type = readWindowOpeningDetectionType(data);
                // temperature detection
                if (data === 0x00) {
                    decoded.window_opening_detection_settings.temperature_detection = {};
                    decoded.window_opening_detection_settings.temperature_detection.delta_temperature = readInt16LE(bytes.slice(i + 1, i + 3)) / 100;
                    decoded.window_opening_detection_settings.temperature_detection.duration = readUInt8(bytes[i + 3]);
                    i += 4;
                }
                // magnet detection
                else if (data === 0x01) {
                    decoded.window_opening_detection_settings.magnet_detection = {};
                    decoded.window_opening_detection_settings.magnet_detection.duration = readUInt8(bytes[i + 1]);
                    i += 2;
                }
                break;
            case 0x84:
                decoded.freeze_protection_settings = decoded.freeze_protection_settings || {};
                decoded.freeze_protection_settings.enable = readEnableStatus(bytes[i]);
                decoded.freeze_protection_settings.target_temperature = readInt16LE(bytes.slice(i + 1, i + 3)) / 100;
                i += 3;
                break;
            case 0x85:
                decoded.temperature_source_settings = decoded.temperature_source_settings || {};
                var data_source = readUInt8(bytes[i]);
                decoded.temperature_source_settings.source = readTemperatureDataSource(data_source);
                if (data_source === 0 || data_source === 1) {
                    i += 1;
                } else if (data_source === 2 || data_source === 3) {
                    decoded.temperature_source_settings.duration = readUInt8(bytes[i + 1]);
                    decoded.temperature_source_settings.missing_data_action = readMissingDataAction(bytes[i + 2]);
                    i += 3;
                }
                break;
            case 0x86:
                decoded.d2d_pairing_enable = readEnableStatus(bytes[i]);
                i += 1;
                break;
            case 0x87:
                var d2d_pairing_settings = {};
                d2d_pairing_settings.index = readUInt8(bytes[i]) + 1;
                var data = readUInt8(bytes[i + 1]);
                if (data === 0x00) {
                    d2d_pairing_settings.enable = readEnableStatus(bytes[i + 2]);
                    i += 3;
                } else if (data === 0x01) {
                    d2d_pairing_settings.eui = readHexString(bytes.slice(i + 2, i + 10));
                    i += 10;
                } else if (data === 0x02) {
                    d2d_pairing_settings.name_first = readString(bytes.slice(i + 2, i + 10));
                    i += 10;
                } else if (data === 0x03) {
                    d2d_pairing_settings.name_last = readString(bytes.slice(i + 2, i + 10));
                    i += 10;
                }
                decoded.d2d_pairing_settings = decoded.d2d_pairing_settings || [];
                decoded.d2d_pairing_settings.push(d2d_pairing_settings);
                break;
            case 0x88:
                decoded.d2d_master_enable = readEnableStatus(bytes[i]);
                i += 1;
                break;
            case 0x89:
                var trigger_source_data = readUInt8(bytes[i]);
                var d2d_master_settings = {};
                d2d_master_settings.trigger_source = readD2DTriggerSource(trigger_source_data);
                d2d_master_settings.enable = readEnableStatus(bytes[i + 1]);
                d2d_master_settings.lora_uplink_enable = readEnableStatus(bytes[i + 2]);
                d2d_master_settings.command = readHexStringLE(bytes.slice(i + 3, i + 5));
                d2d_master_settings.time_enable = readEnableStatus(bytes[i + 5]);
                d2d_master_settings.time = readUInt16LE(bytes.slice(i + 6, i + 8));
                i += 8;
                decoded.d2d_master_settings = decoded.d2d_master_settings || [];
                decoded.d2d_master_settings.push(d2d_master_settings);
                break;
            case 0x8a:
                decoded.d2d_slave_enable = readEnableStatus(bytes[i]);
                i += 1;
                break;
            case 0x8b:
                var d2d_slave_settings = {};
                d2d_slave_settings.index = readUInt8(bytes[i]) + 1;
                d2d_slave_settings.enable = readEnableStatus(bytes[i + 1]);
                d2d_slave_settings.command = readHexStringLE(bytes.slice(i + 2, i + 4));
                d2d_slave_settings.trigger_target = readD2DTriggerTarget(bytes[i + 4]);
                i += 5;
                decoded.d2d_slave_settings = decoded.d2d_slave_settings || [];
                decoded.d2d_slave_settings.push(d2d_slave_settings);
                break;
            case 0x8c:
                var type = readUInt8(bytes[i]);
                decoded.timed_system_control_settings = decoded.timed_system_control_settings || {};
                if (type === 0) {
                    decoded.timed_system_control_settings.enable = readEnableStatus(bytes[i + 1]);
                    i += 2;
                } else if (type === 1) {
                    var start_cycle_settings = {};
                    start_cycle_settings.index = readUInt8(bytes[i + 1]) + 1;
                    start_cycle_settings.enable = readEnableStatus(bytes[i + 2]);
                    start_cycle_settings.time = readUInt16LE(bytes.slice(i + 3, i + 5));
                    var weekday_data = readUInt8(bytes[i + 5]);
                    var weekday_bits_offset = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
                    start_cycle_settings.weekday = {};
                    for (var key in weekday_bits_offset) {
                        start_cycle_settings.weekday[key] = readEnableStatus((weekday_data >>> weekday_bits_offset[key]) & 0x01);
                    }
                    i += 6;
                    decoded.timed_system_control_settings.start_cycle_settings = decoded.timed_system_control_settings.start_cycle_settings || [];
                    decoded.timed_system_control_settings.start_cycle_settings.push(start_cycle_settings);
                } else if (type === 2) {
                    var end_cycle_settings = {};
                    end_cycle_settings.index = readUInt8(bytes[i + 1]) + 1;
                    end_cycle_settings.enable = readEnableStatus(bytes[i + 2]);
                    end_cycle_settings.time = readUInt16LE(bytes.slice(i + 3, i + 5));
                    var weekday_data = readUInt8(bytes[i + 5]);
                    var week_bits_offset = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
                    end_cycle_settings.weekday = {};
                    for (var key in week_bits_offset) {
                        end_cycle_settings.weekday[key] = readEnableStatus((weekday_data >>> week_bits_offset[key]) & 0x01);
                    }
                    i += 6;
                    decoded.timed_system_control_settings.end_cycle_settings = decoded.timed_system_control_settings.end_cycle_settings || [];
                    decoded.timed_system_control_settings.end_cycle_settings.push(end_cycle_settings);
                }
                break;
            case 0x8d:
                var data = readUInt8(bytes[i]);
                var unlock_bits_offset = { system_button: 0, temperature_up_button: 1, temperature_down_button: 2, fan_button: 3, temperature_control_mode_button: 4 };
                decoded.temporary_unlock_settings = decoded.temporary_unlock_settings || {};
                for (var key in unlock_bits_offset) {
                    decoded.temporary_unlock_settings[key] = readEnableStatus((data >>> unlock_bits_offset[key]) & 0x01);
                }
                decoded.temporary_unlock_settings.duration = readUInt16LE(bytes.slice(i + 1, i + 3));
                i += 3;
                break;
            case 0x8e:
                decoded.temperature_control_with_standby_fan_mode = readTemperatureControlWithStandbyFanMode(bytes[i]);
                i += 1;
                break;
            case 0x8f:
                decoded.valve_opening_negative_valve_mode = readValveOpeningNegativeValveMode(bytes[i]);
                i += 1;
                break;
            case 0x90:
                decoded.relay_changes_report_enable = readEnableStatus(bytes[i]);
                i += 1;
                break;

            case 0xc4:
                decoded.auto_provisioning_enable = readEnableStatus(bytes[i]);
                i += 1;
                break;
            case 0xc5:
                decoded.history_transmit_settings = decoded.history_transmit_settings || {};
                var data = readUInt8(bytes[i]);
                if (data === 0x00) {
                    decoded.history_transmit_settings.enable = readEnableStatus(bytes[i + 1]);
                    i += 2;
                } else if (data === 0x01) {
                    decoded.history_transmit_settings.retransmission_interval = readUInt16LE(bytes.slice(i + 1, i + 3));
                    i += 3;
                } else if (data === 0x02) {
                    decoded.history_transmit_settings.resend_interval = readUInt16LE(bytes.slice(i + 1, i + 3));
                    i += 3;
                }
                break;
            case 0xc6:
                decoded.daylight_saving_time = {};
                decoded.daylight_saving_time.enable = readEnableStatus(bytes[i]);
                decoded.daylight_saving_time.offset = readUInt8(bytes[i + 1]);
                decoded.daylight_saving_time.start_month = readUInt8(bytes[i + 2]);
                var start_day_value = readUInt8(bytes[i + 3]);
                decoded.daylight_saving_time.start_week_num = (start_day_value >>> 4) & 0x07;
                decoded.daylight_saving_time.start_week_day = start_day_value & 0x0f;
                decoded.daylight_saving_time.start_hour_min = readUInt16LE(bytes.slice(i + 4, i + 6));
                decoded.daylight_saving_time.end_month = readUInt8(bytes[i + 6]);
                var end_day_value = readUInt8(bytes[i + 7]);
                decoded.daylight_saving_time.end_week_num = (end_day_value >>> 4) & 0x0f;
                decoded.daylight_saving_time.end_week_day = end_day_value & 0x0f;
                decoded.daylight_saving_time.end_hour_min = readUInt16LE(bytes.slice(i + 8, i + 10));
                i += 10;
                break;
            case 0xc7:
                decoded.time_zone = readTimeZone(readInt16LE(bytes.slice(i, i + 2)));
                i += 2;
                break;

            // services
            case 0xb6:
                decoded.reconnect = readYesNoStatus(1);
                break;
            case 0xb8:
                decoded.synchronize_time = readYesNoStatus(1);
                break;
            case 0xb9:
                decoded.query_device_status = readYesNoStatus(1);
                break;
            case 0xba:
                decoded.fetch_history = decoded.fetch_history || {};
                decoded.fetch_history.start_time = readUInt32LE(bytes.slice(i, i + 4));
                i += 4;
                break;
            case 0xbb:
                decoded.fetch_history = decoded.fetch_history || {};
                decoded.fetch_history.start_time = readUInt32LE(bytes.slice(i, i + 4));
                decoded.fetch_history.end_time = readUInt32LE(bytes.slice(i + 4, i + 8));
                i += 8;
                break;
            case 0xbc:
                decoded.stop_transmit_history = readYesNoStatus(1);
                break;
            case 0xbd:
                decoded.clear_history = readYesNoStatus(1);
                break;
            case 0xbe:
                decoded.reboot = readYesNoStatus(1);
                break;
            case 0x5b:
                decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 100;
                i += 2;
                break;
            case 0x5c:
                decoded.humidity = readInt16LE(bytes.slice(i, i + 2)) / 10;
                i += 2;
                break;
            case 0x5d:
                decoded.opening_window_alarm = readOpenWindowAlarm(bytes[i]);
                i += 1;
                break;
            case 0x5e:
                decoded.insert_plan_id = readUInt8(bytes[i]) + 1;
                i += 1;
                break;
            case 0x5f:
                decoded.clear_plan = decoded.clear_plan || {};
                var plan_data = readUInt8(bytes[i]);
                var plan_offset = { 0: "plan_1", 1: "plan_2", 2: "plan_3", 3: "plan_4", 4: "plan_5", 5: "plan_6", 6: "plan_7", 7: "plan_8", 8: "plan_9", 9: "plan_10", 10: "plan_11", 11: "plan_12", 12: "plan_13", 13: "plan_14", 14: "plan_15", 15: "plan_16", 255: "reset" };
                decoded.clear_plan[plan_offset[plan_data]] = readYesNoStatus(1);
                i += 1;
                break;

            // control frame
            case 0xef:
                var cmd_data = readUInt8(bytes[i]);
                var cmd_result = (cmd_data >>> 4) & 0x0f;
                var cmd_length = cmd_data & 0x0f;
                var cmd_id = readHexString(bytes.slice(i + 1, i + 1 + cmd_length));
                var cmd_header = readHexString(bytes.slice(i + 1, i + 2));
                i += 1 + cmd_length;

                var response = {};
                response.result = readCmdResult(cmd_result);
                response.cmd_id = cmd_id;
                response.cmd_name = readCmdName(cmd_header);

                decoded.request_result = decoded.request_result || [];
                decoded.request_result.push(response);
                break;
            case 0xfe:
                decoded.frame = readUInt8(bytes[i]);
                i += 1;
                break;
            default:
                unknown_command = 1;
                break;
        }

        if (unknown_command) {
            throw new Error("unknown command: " + command_id);
        }
    }

    return decoded;
}

function readProtocolVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = bytes[1] & 0xff;
    return "v" + major + "." + minor;
}

function readHardwareVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = bytes[1] & 0xff;
    return "v" + major + "." + minor;
}

function readFirmwareVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = bytes[1] & 0xff;
    var release = bytes[2] & 0xff;
    var alpha = bytes[3] & 0xff;
    var unit_test = bytes[4] & 0xff;
    var test = bytes[5] & 0xff;

    var version = "v" + major + "." + minor;
    if (release !== 0) version += "-r" + release;
    if (alpha !== 0) version += "-a" + alpha;
    if (unit_test !== 0) version += "-u" + unit_test;
    if (test !== 0) version += "-t" + test;
    return version;
}

function readDeviceStatus(type) {
    var device_status_map = { 0: "off", 1: "on" };
    return getValue(device_status_map, type);
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

function readYesNoStatus(type) {
    var yes_no_map = { 0: "no", 1: "yes" };
    return getValue(yes_no_map, type);
}

function readEnableStatus(status) {
    var status_map = { 0: "disable", 1: "enable" };
    return getValue(status_map, status);
}

function readTemperatureDataSource(type) {
    var source_map = { 0: "internal", 1: "ntc", 2: "lorawan", 3: "d2d" };
    return getValue(source_map, type);
}

function readMissingDataAction(type) {
    var action_map = { 0: "hold", 1: "off_or_fan_control", 2: "switch_to_internal" };
    return getValue(action_map, type);
}

function readTemperatureControlStatus(type) {
    var status_map = { 0: "standby", 1: "heating", 2: "cooling" };
    return getValue(status_map, type);
}

function readTemperatureControlMode(type) {
    var mode_map = { 0: "fan", 1: "heating", 2: "cooling" };
    return getValue(mode_map, type);
}

function readValveStatus(type) {
    var status_map = { 0: "off", 100: "on" };
    return getValue(status_map, type);
}

function readFanMode(type) {
    var mode_map = { 0: "auto", 1: "low", 2: "medium", 3: "high" };
    return getValue(mode_map, type);
}

function readPlanId(type) {
    var plan_id_map = { 0: "plan_1", 1: "plan_2", 2: "plan_3", 3: "plan_4", 4: "plan_5", 5: "plan_6", 6: "plan_7", 7: "plan_8", 8: "plan_9", 9: "plan_10", 10: "plan_11", 11: "plan_12", 12: "plan_13", 13: "plan_14", 14: "plan_15", 15: "plan_16", 255: "no_plan" };
    return getValue(plan_id_map, type);
}

function readFanStatus(type) {
    var status_map = { 0: "off", 1: "low", 2: "medium", 3: "high" };
    return getValue(status_map, type);
}

function readTemperatureAlarmType(type) {
    var type_map = {
        0: "collection error",                              // 0x00
        1: "lower range error",                             // 0x01
        2: "over range error",                              // 0x02
        3: "no data",                                       // 0x03
        16: "below threshold temperature alarm release",    // 0x10
        17: "below threshold temperature alarm",            // 0x11
        18: "above threshold temperature alarm release",    // 0x12
        19: "above threshold temperature alarm",            // 0x13
        20: "between threshold temperature alarm release",  // 0x14
        21: "between threshold temperature alarm",          // 0x15
        22: "outside threshold temperature alarm release",  // 0x16
        23: "outside threshold temperature alarm",          // 0x17
        32: "continuous low temperature alarm release",     // 0x20
        33: "continuous low temperature alarm",             // 0x21
        34: "continuous high temperature alarm release",    // 0x22
        35: "continuous high temperature alarm",            // 0x23
        48: "freeze alarm release",                         // 0x30
        49: "freeze alarm",                                 // 0x31
        50: "window open alarm release",                    // 0x32
        51: "window open alarm",                            // 0x33
    };
    return getValue(type_map, type);
}

function hasTemperature(alarm_type) {
    return alarm_type === 0x10 // (below threshold) temperature alarm release
        || alarm_type === 0x11 // (below threshold) temperature alarm
        || alarm_type === 0x12 // (above threshold) temperature alarm release
        || alarm_type === 0x13 // (above threshold) temperature alarm
        || alarm_type === 0x14 // (between threshold) continuous temperature alarm release
        || alarm_type === 0x15 // (between threshold) continuous temperature alarm
        || alarm_type === 0x16 // (outside threshold) continuous temperature alarm release
        || alarm_type === 0x17 // (outside threshold) continuous temperature alarm
        || alarm_type === 0x20 // continuous low temperature alarm release
        || alarm_type === 0x21 // continuous low temperature alarm
        || alarm_type === 0x22 // continuous high temperature alarm release
        || alarm_type === 0x23 // continuous high temperature alarm
        || alarm_type === 0x30 // freeze alarm release
        || alarm_type === 0x31 // freeze alarm
        || alarm_type === 0x32 // window open alarm release
        || alarm_type === 0x33 // window open alarm
}

function readHumidityAlarm(type) {
    var type_map = {
        0: "collection error",  // 0x00
        1: "lower range error", // 0x01
        2: "over range error",  // 0x02
        3: "no data",           // 0x03
    };
    return getValue(type_map, type);
}

function readTargetTemperatureAlarm(type) {
    var type_map = {
        3: "no data", // 0x03
    };
    return getValue(type_map, type);
}

function readTimeUnitType(type) {
    var unit_map = { 0: "second", 1: "minute" };
    return getValue(unit_map, type);
}

function readTemperatureUnit(type) {
    var unit_map = { 0: "celsius", 1: "fahrenheit" };
    return getValue(unit_map, type);
}

function readSupportMode(type) {
    var mode_map = { 3: "fan_and_heating", 5: "fan_and_cooling", 7: "fan_and_heating_and_cooling" };
    return getValue(mode_map, type);
}

function readSystemStatus(type) {
    var status_map = { 0: "off", 1: "on" };
    return getValue(status_map, type);
}

function readTargetTemperatureResolution(type) {
    var resolution_map = { 0: 0.5, 1: 1 };
    return getValue(resolution_map, type);
}

function readMathConditionType(type) {
    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside" };
    return getValue(condition_map, type);
}

function readValveInterfaceMode(type) {
    var mode_map = { 0: "four_pipe_two_wire", 1: "two_pipe_two_wire", 2: "two_pipe_three_wire" };
    return getValue(mode_map, type);
}

function readValve(type) {
    var valve_map = { 0: "valve_1", 1: "valve_2" };
    return getValue(valve_map, type);
}

function readDIType(type) {
    var type_map = { 0: "card_control", 1: "magnet_detection" };
    return getValue(type_map, type);
}

function readMagnetDetectionMode(type) {
    var mode_map = { 0: "normally_close", 1: "normally_open" };
    return getValue(mode_map, type);
}

function readCardControlMode(type) {
    var mode_map = { 0: "power", 1: "plan" };
    return getValue(mode_map, type);
}

function readWindowOpeningDetectionType(type) {
    var type_map = { 0: "temperature_detection", 1: "magnet_detection" };
    return getValue(type_map, type);
}

function readD2DTriggerSource(type) {
    var source_map = { 0: "plan_1", 1: "plan_2", 2: "plan_3", 3: "plan_4", 4: "plan_5", 5: "plan_6", 6: "plan_7", 7: "plan_8", 8: "plan_9", 9: "plan_10", 10: "plan_11", 11: "plan_12", 12: "plan_13", 14: "plan_15", 15: "plan_16", 16: "system_status_off", 17: "system_status_on" };
    return getValue(source_map, type);
}

function readOpenWindowAlarm(type) {
    var alarm_map = { 0: "release", 1: "trigger" };
    return getValue(alarm_map, type);
}

function readD2DTriggerTarget(type) {
    var trigger_target_map = { 0: "plan_1", 1: "plan_2", 2: "plan_3", 3: "plan_4", 4: "plan_5", 5: "plan_6", 6: "plan_7", 7: "plan_8", 8: "plan_9", 9: "plan_10", 10: "plan_11", 11: "plan_12", 12: "plan_13", 14: "plan_15", 15: "plan_16", 16: "system_status_off", 17: "system_status_on" };
    return getValue(trigger_target_map, type);
}

function readTemperatureControlWithStandbyFanMode(type) {
    var mode_map = { 0: "low", 1: "stop" };
    return getValue(mode_map, type);
}

function readValveOpeningNegativeValveMode(type) {
    var mode_map = { 0: "low", 1: "stop" };
    return getValue(mode_map, type);
}

function readTimeZone(time_zone) {
    var timezone_map = { "-720": "UTC-12", "-660": "UTC-11", "-600": "UTC-10", "-570": "UTC-9:30", "-540": "UTC-9", "-480": "UTC-8", "-420": "UTC-7", "-360": "UTC-6", "-300": "UTC-5", "-240": "UTC-4", "-210": "UTC-3:30", "-180": "UTC-3", "-120": "UTC-2", "-60": "UTC-1", 0: "UTC", 60: "UTC+1", 120: "UTC+2", 180: "UTC+3", 210: "UTC+3:30", 240: "UTC+4", 270: "UTC+4:30", 300: "UTC+5", 330: "UTC+5:30", 345: "UTC+5:45", 360: "UTC+6", 390: "UTC+6:30", 420: "UTC+7", 480: "UTC+8", 540: "UTC+9", 570: "UTC+9:30", 600: "UTC+10", 630: "UTC+10:30", 660: "UTC+11", 720: "UTC+12", 765: "UTC+12:45", 780: "UTC+13", 840: "UTC+14" };
    return getValue(timezone_map, time_zone);
}

function readCmdResult(type) {
    var result_map = { 0: "success", 1: "parsing error", 2: "order error", 3: "password error", 4: "read params error", 5: "write params error", 6: "read execution error", 7: "write execution error", 8: "read apply error", 9: "write apply error", 10: "associative error" };
    return getValue(result_map, type);
}

function readCmdName(type) {
    var name_map = {
        "60": { "level": 1, "name": "collection_interval" },
        "62": { "level": 1, "name": "reporting_interval" },
        "63": { "level": 1, "name": "temperature_unit" },
        "64": { "level": 1, "name": "support_mode" },
        "65": { "level": 1, "name": "intelligent_display_enable" },
        "66": { "level": 1, "name": "screen_object_settings" },
        "67": { "level": 1, "name": "system_status" },
        "68": { "level": 1, "name": "temperature_control_mode" },
        "69": { "level": 1, "name": "target_temperature_resolution" },
        "6a": { "level": 1, "name": "target_temperature_tolerance" },
        "6b": { "level": 1, "name": "heating_target_temperature" },
        "6c": { "level": 1, "name": "cooling_target_temperature" },
        "6d": { "level": 1, "name": "heating_target_temperature_range" },
        "6e": { "level": 1, "name": "cooling_target_temperature_range" },
        "6f": { "level": 1, "name": "dehumidify_config" },
        "70": { "level": 1, "name": "target_humidity_range" },
        "72": { "level": 1, "name": "fan_mode" },
        "73": { "level": 1, "name": "fan_speed_config" },
        "74": { "level": 1, "name": "fan_delay_config" },
        "75": { "level": 1, "name": "child_lock_settings" },
        "76": { "level": 1, "name": "temperature_alarm_settings" },
        "77": { "level": 1, "name": "high_temperature_alarm_settings" },
        "78": { "level": 1, "name": "low_temperature_alarm_settings" },
        "79": { "level": 1, "name": "temperature_calibration_settings" },
        "7a": { "level": 1, "name": "humidity_calibration_settings" },
        "7b": { "level": 3, "name": "plan_config" },
        "7c": { "level": 1, "name": "valve_interface_settings" },
        "80": { "level": 1, "name": "di_setting_enable" },
        "81": { "level": 1, "name": "di_settings" },
        "82": { "level": 1, "name": "window_opening_detection_enable" },
        "83": { "level": 1, "name": "window_opening_detection_settings" },
        "84": { "level": 1, "name": "freeze_protection_settings" },
        "85": { "level": 1, "name": "temperature_source_settings" },
        "86": { "level": 1, "name": "d2d_pairing_enable" },
        "87": { "level": 3, "name": "d2d_pairing_settings" },
        "88": { "level": 1, "name": "d2d_master_enable" },
        "89": { "level": 2, "name": "d2d_master_settings" },
        "8a": { "level": 1, "name": "d2d_slave_enable" },
        "8b": { "level": 2, "name": "d2d_slave_settings" },
        "8c": { "level": 3, "name": "timed_system_control_settings" },
        "8d": { "level": 1, "name": "temporary_unlock_settings" },
        "8e": { "level": 1, "name": "temperature_control_with_standby_fan_mode" },
        "8f": { "level": 1, "name": "valve_opening_negative_valve_mode" },
        "90": { "level": 1, "name": "relay_changes_report_enable" },
        "c4": { "level": 1, "name": "auto_provisioning_enable" },
        "c5": { "level": 1, "name": "history_transmit_settings" },
        "c6": { "level": 1, "name": "daylight_saving_time" },
        "c7": { "level": 1, "name": "time_zone" },
        "b6": { "level": 0, "name": "reconnect" },
        "b8": { "level": 0, "name": "synchronize_time" },
        "b9": { "level": 0, "name": "query_device_status" },
        "ba": { "level": 0, "name": "fetch_history" },
        "bb": { "level": 0, "name": "fetch_history" },
        "bc": { "level": 0, "name": "stop_transmit_history" },
        "bd": { "level": 0, "name": "clear_history" },
        "be": { "level": 0, "name": "reboot" },
        "5b": { "level": 0, "name": "temperature" },
        "5c": { "level": 0, "name": "humidity" },
        "5d": { "level": 0, "name": "opening_window_alarm" },
        "5e": { "level": 0, "name": "insert_plan_id" },
        "5f": { "level": 0, "name": "clear_plan" },
    }

    var data = name_map[type];
    if (data === undefined) return "unknown";
    return data.name;
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

function readFloat16LE(bytes) {
    var bits = (bytes[1] << 8) | bytes[0];
    var sign = bits >>> 15 === 0 ? 1.0 : -1.0;
    var e = (bits >>> 10) & 0x1f;
    var m = e === 0 ? (bits & 0x3ff) << 1 : (bits & 0x3ff) | 0x400;
    var f = sign * m * Math.pow(2, e - 25);

    var n = Number(f.toFixed(2));
    return n;
}

function readFloatLE(bytes) {
    var bits = (bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0];
    var sign = bits >>> 31 === 0 ? 1.0 : -1.0;
    var e = (bits >>> 23) & 0xff;
    var m = e === 0 ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
    var f = sign * m * Math.pow(2, e - 150);
    return f;
}

function readString(bytes) {
    var str = "";
    var i = 0;
    var byte1, byte2, byte3, byte4;
    while (i < bytes.length) {
        byte1 = bytes[i++];
        if (byte1 <= 0x7f) {
            str += String.fromCharCode(byte1);
        } else if (byte1 <= 0xdf) {
            byte2 = bytes[i++];
            str += String.fromCharCode(((byte1 & 0x1f) << 6) | (byte2 & 0x3f));
        } else if (byte1 <= 0xef) {
            byte2 = bytes[i++];
            byte3 = bytes[i++];
            str += String.fromCharCode(((byte1 & 0x0f) << 12) | ((byte2 & 0x3f) << 6) | (byte3 & 0x3f));
        } else if (byte1 <= 0xf7) {
            byte2 = bytes[i++];
            byte3 = bytes[i++];
            byte4 = bytes[i++];
            var codepoint = ((byte1 & 0x07) << 18) | ((byte2 & 0x3f) << 12) | ((byte3 & 0x3f) << 6) | (byte4 & 0x3f);
            codepoint -= 0x10000;
            str += String.fromCharCode((codepoint >> 10) + 0xd800);
            str += String.fromCharCode((codepoint & 0x3ff) + 0xdc00);
        }
    }
    return str;
}

function readHexString(bytes) {
    var temp = [];
    for (var idx = 0; idx < bytes.length; idx++) {
        temp.push(("0" + (bytes[idx] & 0xff).toString(16)).slice(-2));
    }
    return temp.join("");
}

function readHexStringLE(bytes) {
    var temp = [];
    for (var idx = bytes.length - 1; idx >= 0; idx--) {
        temp.push(("0" + (bytes[idx] & 0xff).toString(16)).slice(-2));
    }
    return temp.join("");
}

function getValue(map, key) {
    if (RAW_VALUE) return key;
    var value = map[key];
    if (!value) value = "unknown";
    return value;
}