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
 * @product WT401
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
            case 0x00:
                decoded.battery = readUInt8(bytes[i]);
                i += 1;
                break;
            case 0x01:
                decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 100;
                i += 2;
                break;
            case 0x02:
                decoded.humidity = readUInt16LE(bytes.slice(i, i + 2)) / 10;
                i += 2;
                break;
            case 0x03:
                decoded.temperature_control_mode = readTemperatureControlMode(bytes[i]);
                i += 1;
                break;
            case 0x04:
                decoded.fan_mode = readFanMode(bytes[i]);
                i += 1;
                break;
            case 0x05:
                decoded.execution_plan = readPlan(readUInt8(bytes[i]));
                i += 1;
                break;
            case 0x06:
                decoded.target_temperature_1 = readInt16LE(bytes.slice(i, i + 2)) / 100;
                i += 2;
                break;
            case 0x07:
                decoded.target_temperature_2 = readInt16LE(bytes.slice(i, i + 2)) / 100;
                i += 2;
                break;
            case 0x08:
                decoded.pir_status = readPIRStatus(bytes[i]);
                i += 1;
                break;
            case 0x09:
                decoded.ble_event = readBleEvent(bytes[i]);
                i += 1;
                break;
            case 0x0a:
                decoded.power_bus_event = readPowerBusEvent(bytes[i]);
                i += 1;
                break;
            case 0x0b:
                decoded.temperature_alarm = readTemperatureAlarm(bytes[i]);
                i += 1;
                break;
            case 0x0c:
                decoded.humidity_alarm = readHumidityAlarm(bytes[i]);
                i += 1;
                break;
            case 0x0d:
                decoded.button_event = readButtonEvent(bytes[i]);
                i += 1;
                break;
            case 0x0f:
                decoded.battery_event = readBatteryEvent(bytes[i]);
                i += 1;
                break;

            // config
            case 0x56:
                decoded.peer_ble_pair_info = {};
                decoded.peer_ble_pair_info.address_type = readAddressType(bytes[i]);
                decoded.peer_ble_pair_info.address = readHexString(bytes.slice(i + 1, i + 1 + 6));
                decoded.peer_ble_pair_info.name = readString(bytes.slice(i + 7, i + 7 + 32));
                i += 40;
                break;
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
            case 0x61:
                decoded.reporting_interval = {};
                decoded.reporting_interval.mode = readReportingMode(bytes[i]);
                decoded.reporting_interval.unit = readTimeUnitType(bytes[i + 1]);
                var time_unit = readUInt8(bytes[i + 1]);
                if (time_unit === 0) {
                    decoded.reporting_interval.seconds_of_time = readUInt16LE(bytes.slice(i + 2, i + 4));
                } else if (time_unit === 1) {
                    decoded.reporting_interval.minutes_of_time = readUInt16LE(bytes.slice(i + 2, i + 4));
                }
                i += 4;
                break;
            case 0x62:
                decoded.intelligent_display_enable = readEnableStatus(bytes[i]);
                i += 1;
                break;
            case 0x63:
                decoded.temperature_unit = readTemperatureUnit(bytes[i]);
                i += 1;
                break;
            case 0x64:
                var data = readUInt8(bytes[i]);
                decoded.temperature_control_mode_support = {};
                var mode_bit_offset = { heat: 0, em_heat: 1, cool: 2, auto: 3 };
                for (var mode in mode_bit_offset) {
                    decoded.temperature_control_mode_support[mode] = readEnableStatus((data >> mode_bit_offset[mode]) & 0x01);
                }
                i += 1;
                break;
            case 0x65:
                decoded.target_temperature_mode = readTargetTemperatureMode(bytes[i]);
                i += 1;
                break;
            case 0x66:
                decoded.target_temperature_resolution = readTargetTemperatureResolution(bytes[i]);
                i += 1;
                break;
            case 0x67:
                decoded.system_status = readSystemStatus(bytes[i]);
                i += 1;
                break;
            case 0x68:
                var data = readUInt8(bytes[i]);
                if (data === 0x00) {
                    decoded.temperature_control_mode = readTemperatureControlMode(bytes[i + 1]);
                } else if (data === 0x01) {
                    decoded.temperature_control_mode_in_plan_enable = readEnableStatus(bytes[i + 1]);
                }
                i += 2;
                break;
            case 0x69:
                var data = readUInt8(bytes[i]);
                var temperature = readInt16LE(bytes.slice(i + 1, i + 3)) / 100;
                // heat
                if (data === 0x00) {
                    decoded.target_temperature_settings = decoded.target_temperature_settings || {};
                    decoded.target_temperature_settings.heat = temperature;
                }
                // em heat
                else if (data === 0x01) {
                    decoded.target_temperature_settings = decoded.target_temperature_settings || {};
                    decoded.target_temperature_settings.em_heat = temperature;
                }
                // cool
                else if (data === 0x02) {
                    decoded.target_temperature_settings = decoded.target_temperature_settings || {};
                    decoded.target_temperature_settings.cool = temperature;
                }
                // auto
                else if (data === 0x03) {
                    decoded.target_temperature_settings = decoded.target_temperature_settings || {};
                    decoded.target_temperature_settings.auto = temperature;
                }
                // dual (auto heat)
                else if (data === 0x04) {
                    decoded.target_temperature_settings = decoded.target_temperature_settings || {};
                    decoded.target_temperature_settings.auto_heat = temperature;
                }
                // dual (auto cool)
                else if (data === 0x05) {
                    decoded.target_temperature_settings = decoded.target_temperature_settings || {};
                    decoded.target_temperature_settings.auto_cool = temperature;
                }
                i += 3;
                break;
            case 0x6a:
                decoded.dead_band = readInt16LE(bytes.slice(i, i + 2)) / 100;
                i += 2;
                break;
            case 0x6b:
                var data = readUInt8(bytes[i]);
                var range = {};
                range.min = readInt16LE(bytes.slice(i + 1, i + 3)) / 100;
                range.max = readInt16LE(bytes.slice(i + 3, i + 5)) / 100;
                i += 5;
                if (data === 0x00) {
                    decoded.target_temperature_range = decoded.target_temperature_range || {};
                    decoded.target_temperature_range.heat = range;
                } else if (data === 0x01) {
                    decoded.target_temperature_range = decoded.target_temperature_range || {};
                    decoded.target_temperature_range.em_heat = range;
                } else if (data === 0x02) {
                    decoded.target_temperature_range = decoded.target_temperature_range || {};
                    decoded.target_temperature_range.cool = range;
                } else if (data === 0x03) {
                    decoded.target_temperature_range = decoded.target_temperature_range || {};
                    decoded.target_temperature_range.auto = range;
                }
                break;
            case 0x6c:
                decoded.communicate_interval = {};
                decoded.communicate_interval.mode = readReportingMode(bytes[i]);
                decoded.communicate_interval.unit = readTimeUnitType(bytes[i + 1]);
                var time_unit = readUInt8(bytes[i + 1]);
                if (time_unit === 0) {
                    decoded.communicate_interval.seconds_of_time = readUInt16LE(bytes.slice(i + 2, i + 4));
                } else if (time_unit === 1) {
                    decoded.communicate_interval.minutes_of_time = readUInt16LE(bytes.slice(i + 2, i + 4));
                }
                i += 4;
                break;
            case 0x71:
                var data = readUInt8(bytes[i]);
                decoded.button_custom_function = decoded.button_custom_function || {};
                if (data === 0x00) {
                    decoded.button_custom_function.enable = readEnableStatus(bytes[i + 1]);
                }
                // button 1
                else if (data === 0x01 || data === 0x02 || data === 0x03) {
                    var button_name = "button_" + data;
                    decoded.button_custom_function[button_name] = readButtonFunction(bytes[i + 1]);
                }
                i += 2;
                break;
            case 0x72:
                var enable = readEnableStatus(bytes[i]);
                var data = readUInt16LE(bytes.slice(i + 1, i + 3));
                decoded.child_lock_settings = {};
                decoded.child_lock_settings.enable = enable;
                var button_bit_offset = { temperature_up: 0, temperature_down: 1, system_on_off: 2, fan_mode: 3, temperature_control_mode: 4, reboot_reset: 5, power_on_off: 6, cancel_pair: 7, plan_switch: 8, status_report: 9, release_filter_alarm: 10, button_report_1: 11, button_report_2: 12, button_report_3: 13, temperature_unit_switch: 14 };
                for (var button in button_bit_offset) {
                    decoded.child_lock_settings[button] = readEnableStatus((data >> button_bit_offset[button]) & 0x01);
                }
                i += 3;
                break;
            case 0x74:
                decoded.fan_mode = readFanMode(bytes[i]);
                i += 1;
                break;
            case 0x75:
                decoded.screen_display_settings = decoded.screen_display_settings || {};
                var screen_object_data = readUInt8(bytes[i]);
                var screen_object_bit_offset = { plan_name: 0, ambient_temperature: 1, ambient_humidity: 2, target_temperature: 3 };
                for (var key in screen_object_bit_offset) {
                    decoded.screen_display_settings[key] = readEnableStatus((screen_object_data >>> screen_object_bit_offset[key]) & 0x01);
                }
                i += 1;
                break;
            case 0x76:
                decoded.temperature_calibration_settings = {};
                decoded.temperature_calibration_settings.enable = readEnableStatus(bytes[i]);
                decoded.temperature_calibration_settings.calibration_value = readInt16LE(bytes.slice(i + 1, i + 3)) / 100;
                i += 3;
                break;
            case 0x77:
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
                    plan_config.temperature_control_mode = readTemperatureControlMode(bytes[i + 2]);
                    plan_config.heat_target_temperature = readInt16LE(bytes.slice(i + 3, i + 5)) / 100;
                    plan_config.em_heat_target_temperature = readInt16LE(bytes.slice(i + 5, i + 7)) / 100;
                    plan_config.cool_target_temperature = readInt16LE(bytes.slice(i + 7, i + 9)) / 100;
                    i += 9;
                } else if (data === 0x04) {
                    plan_config.fan_mode = readFanMode(bytes[i + 2]);
                    plan_config.auto_target_temperature = readInt16LE(bytes.slice(i + 3, i + 5)) / 100;
                    plan_config.auto_heat_target_temperature = readInt16LE(bytes.slice(i + 5, i + 7)) / 100;
                    plan_config.auto_cool_target_temperature = readInt16LE(bytes.slice(i + 7, i + 9)) / 100;
                    i += 9;
                }
                decoded.plan_config = decoded.plan_config || [];
                decoded.plan_config.push(plan_config);
                break;
            case 0x7d:
                decoded.data_sync_to_peer = readDataSource(bytes[i]);
                i += 1;
                break;
            case 0x7e:
                decoded.data_sync_timeout = readUInt8(bytes[i]);
                i += 1;
                break;
            case 0x80:
                var data = readUInt8(bytes[i]);
                decoded.unlock_combination_button_settings = {};
                var button_bit_offset = { button_1: 0, button_2: 1, button_3: 2, button_4: 3, button_5: 4 };
                for (var button in button_bit_offset) {
                    decoded.unlock_combination_button_settings[button] = readEnableStatus((data >> button_bit_offset[button]) & 0x01);
                }
                i += 1;
                break;
            case 0x81:
                decoded.temporary_unlock_settings = decoded.temporary_unlock_settings || {};
                decoded.temporary_unlock_settings.enable = readEnableStatus(bytes[i]);
                decoded.temporary_unlock_settings.timeout = readUInt16LE(bytes.slice(i + 1, i + 3));
                i += 3;
                break;
            case 0x82:
                var data = readUInt8(bytes[i]);
                decoded.pir_config = decoded.pir_config || {};
                if (data === 0x01) {
                    decoded.pir_config.enable = readEnableStatus(bytes[i + 1]);
                    i += 2;
                } else if (data === 0x02) {
                    decoded.pir_config.release_time = readUInt16LE(bytes.slice(i + 1, i + 3));
                    i += 3;
                } else if (data === 0x03) {
                    decoded.pir_config.general_mode = decoded.pir_config.general_mode || {};
                    decoded.pir_config.general_mode.detection_mode = readPIRDetectionMode(bytes[i + 1]);
                    i += 2;
                } else if (data === 0x04) {
                    decoded.pir_config.general_mode = decoded.pir_config.general_mode || {};
                    decoded.pir_config.general_mode.period = readUInt8(bytes[i + 1]);
                    decoded.pir_config.general_mode.rate = readUInt8(bytes[i + 2]);
                    i += 3;
                }
                break;
            case 0x83:
                var data = readUInt8(bytes[i]);
                decoded.pir_config = decoded.pir_config || {};
                if (data === 0x01) {
                    decoded.pir_config.eco_mode = decoded.pir_config.eco_mode || {};
                    decoded.pir_config.eco_mode.enable = readEnableStatus(bytes[i + 1]);
                    i += 2;
                } else if (data === 0x02) {
                    decoded.pir_config.eco_mode = decoded.pir_config.eco_mode || {};
                    decoded.pir_config.eco_mode.occupied_plan = readPlan(readUInt8(bytes[i + 1]));
                    decoded.pir_config.eco_mode.vacant_plan = readPlan(readUInt8(bytes[i + 2]));
                    i += 3;
                }
                break;
            case 0x84:
                var data = readUInt8(bytes[i]);
                decoded.pir_config = decoded.pir_config || {};
                if (data === 0x01) {
                    decoded.pir_config.night_mode = decoded.pir_config.night_mode || {};
                    decoded.pir_config.night_mode.enable = readEnableStatus(bytes[i + 1]);
                    i += 2;
                } else if (data === 0x02) {
                    decoded.pir_config.night_mode = decoded.pir_config.night_mode || {};
                    decoded.pir_config.night_mode.detection_mode = readPIRDetectionMode(bytes[i + 1]);
                    i += 2;
                } else if (data === 0x03) {
                    decoded.pir_config.night_mode = decoded.pir_config.night_mode || {};
                    decoded.pir_config.night_mode.period = readUInt8(bytes[i + 1]);
                    decoded.pir_config.night_mode.rate = readUInt8(bytes[i + 2]);
                    i += 3;
                } else if (data === 0x04) {
                    decoded.pir_config.night_mode = decoded.pir_config.night_mode || {};
                    decoded.pir_config.night_mode.start_time = readUInt16LE(bytes.slice(i + 1, i + 3));
                    decoded.pir_config.night_mode.end_time = readUInt16LE(bytes.slice(i + 3, i + 5));
                    i += 5;
                } else if (data === 0x05) {
                    decoded.pir_config.night_mode = decoded.pir_config.night_mode || {};
                    decoded.pir_config.night_mode.occupied_plan = readPlan(readUInt8(bytes[i + 1]));
                    i += 2;
                }
                break;
            case 0x85:
                decoded.ble_enable = readEnableStatus(bytes[i]);
                i += 1;
                break;
            case 0x86:
                decoded.external_temperature = readInt16LE(bytes.slice(i, i + 2)) / 100;
                i += 2;
                break;
            case 0x87:
                decoded.external_humidity = readInt16LE(bytes.slice(i, i + 2)) / 10;
                i += 2;
                break;
            case 0x88:
                var data = readUInt8(bytes[i]);
                decoded.fan_support_mode = {};
                var mode_bit_offset = { auto: 0, circulate: 1, on: 2, low: 3, medium: 4, high: 5 };
                for (var mode in mode_bit_offset) {
                    decoded.fan_support_mode[mode] = readEnableStatus((data >> mode_bit_offset[mode]) & 0x01);
                }
                i += 1;
                break;
            case 0x8b:
                decoded.ble_name = readString(bytes.slice(i, i + 32));
                i += 32;
                break;
            case 0x8c:
                decoded.ble_pair_info = {};
                decoded.ble_pair_info.address_type = readAddressType(bytes[i]);
                decoded.ble_pair_info.address = readHexString(bytes.slice(i + 1, i + 1 + 6));
                decoded.ble_pair_info.name = readString(bytes.slice(i + 7, i + 7 + 32));
                i += 40;
                break;
            case 0x8d:
                decoded.communication_mode = readCommunicationMode(bytes[i]);
                i += 1;
                break;
            case 0xc6:
                decoded.daylight_saving_time = {};
                decoded.daylight_saving_time.enable = readEnableStatus(bytes[i]);
                decoded.daylight_saving_time.offset = readUInt8(bytes[i + 1]);
                decoded.daylight_saving_time.start_month = readUInt8(bytes[i + 2]);
                var start_day_value = readUInt8(bytes[i + 3]);
                decoded.daylight_saving_time.start_week_num = (start_day_value >>> 4) & 0x0f;
                decoded.daylight_saving_time.start_week_day = (start_day_value >>> 0) & 0x0f;
                decoded.daylight_saving_time.start_hour_min = readUInt16LE(bytes.slice(i + 4, i + 6));
                decoded.daylight_saving_time.end_month = readUInt8(bytes[i + 6]);
                var end_day_value = readUInt8(bytes[i + 7]);
                decoded.daylight_saving_time.end_week_num = (end_day_value >>> 4) & 0x0f;
                decoded.daylight_saving_time.end_week_day = (end_day_value >>> 0) & 0x0f;
                decoded.daylight_saving_time.end_hour_min = readUInt16LE(bytes.slice(i + 8, i + 10));
                i += 10;
                break;
            case 0xc7:
                decoded.time_zone = readTimeZone(readInt16LE(bytes.slice(i, i + 2)));
                i += 2;
                break;

            // service
            case 0x54:
                decoded.reset_ble_name = readYesNoStatus(1);
                break;
            case 0x55:
                var data = readUInt8(bytes[i]);
                if (data === 0x00) {
                    decoded.release_fan_alarm = readYesNoStatus(1);
                } else if (data === 0x01) {
                    decoded.trigger_fan_alarm = readYesNoStatus(1);
                }
                i += 1;
                break;
            case 0x57:
                var data = readUInt8(bytes[i]);
                if (data === 0x00) {
                    decoded.release_freeze_alarm = readYesNoStatus(1);
                } else if (data === 0x01) {
                    decoded.trigger_freeze_alarm = readYesNoStatus(1);
                }
                i += 1;
                break;
            case 0x58:
                var data = readUInt8(bytes[i]);
                if (data === 0x00) {
                    decoded.release_no_wire_alarm = readYesNoStatus(1);
                } else if (data === 0x01) {
                    decoded.trigger_no_wire_alarm = readYesNoStatus(1);
                }
                i += 1;
                break;
            case 0x5a:
                var data = readUInt8(bytes[i]);
                if (data === 0x00) {
                    decoded.release_window_open_alarm = readYesNoStatus(1);
                } else if (data === 0x01) {
                    decoded.trigger_window_open_alarm = readYesNoStatus(1);
                }
                i += 1;
                break;
            case 0x5b:
                var data = readUInt8(bytes[i]);
                if (data === 0x00) {
                    decoded.release_filter_alarm = readYesNoStatus(1);
                } else if (data === 0x01) {
                    decoded.trigger_filter_alarm = readYesNoStatus(1);
                }
                i += 1;
                break;
            case 0x5c:
                decoded.insert_plan = readPlan(readUInt8(bytes[i]));
                i += 1;
                break;
            case 0x5e:
                var data = readUInt8(bytes[i]);
                if (data === 0x00) {
                    decoded.cancel_ble_pair = readYesNoStatus(1);
                } else if (data === 0x01) {
                    decoded.trigger_ble_pair = readYesNoStatus(1);
                }
                i += 1;
                break;
            case 0x5f:
                decoded.remove_plan = decoded.remove_plan || {};
                var plan_data = readUInt8(bytes[i]);
                var plan_offset = { 0: "plan_1", 1: "plan_2", 2: "plan_3", 3: "plan_4", 4: "plan_5", 5: "plan_6", 6: "plan_7", 7: "plan_8", 8: "plan_9", 9: "plan_10", 10: "plan_11", 11: "plan_12", 12: "plan_13", 13: "plan_14", 14: "plan_15", 15: "plan_16", 255: "reset" };
                decoded.remove_plan[plan_offset[plan_data]] = readYesNoStatus(1);
                i += 1;
                break;
            case 0xb6:
                decoded.reconnect = readYesNoStatus(1);
                break;
            case 0xb8:
                decoded.synchronize_time = readYesNoStatus(1);
                break;
            case 0xb9:
                decoded.query_device_status = readYesNoStatus(1);
                break;
            case 0xbe:
                decoded.reboot = readYesNoStatus(1);
                break;
            case 0x59:
                decoded.system_status_control = decoded.system_status_control || {};
                // 0：system close, 1：system open
                decoded.system_status_control.on_off = readUInt8(bytes[i]);
                // 0：heat, 1：em heat, 2：cool, 3：auto
                decoded.system_status_control.mode = readUInt8(bytes.slice(i + 1, i + 2));
                decoded.system_status_control.temperature1 = readInt16LE(bytes.slice(i + 2, i + 4)) / 100;
                decoded.system_status_control.temperature2 = readInt16LE(bytes.slice(i + 4, i + 6)) / 100;
                i += 6;
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
    var major = (bytes[0] & 0xff).toString(16);
    var minor = (bytes[1] & 0xff).toString(16);
    return "v" + major + "." + minor;
}

function readHardwareVersion(bytes) {
    var major = (bytes[0] & 0xff).toString(16);
    var minor = (bytes[1] & 0xff).toString(16);
    return "v" + major + "." + minor;
}

function readFirmwareVersion(bytes) {
    var major = (bytes[0] & 0xff).toString(16);
    var minor = (bytes[1] & 0xff).toString(16);
    var release = (bytes[2] & 0xff).toString(16);
    var alpha = (bytes[3] & 0xff).toString(16);
    var unit_test = (bytes[4] & 0xff).toString(16);
    var test = (bytes[5] & 0xff).toString(16);

    var version = "v" + major + "." + minor;
    if (release !== "0") version += "-r" + release;
    if (alpha !== "0") version += "-a" + alpha;
    if (unit_test !== "0") version += "-u" + unit_test;
    if (test !== "0") version += "-t" + test;
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

function readSystemStatus(status) {
    var status_map = { 0: "off", 1: "on" };
    return getValue(status_map, status);
}

function readTemperatureControlMode(mode) {
    var mode_map = { 0: "heat", 1: "em_heat", 2: "cool", 3: "auto", 10: "off", 11: "NA" };
    return getValue(mode_map, mode);
}

function readFanMode(mode) {
    var mode_map = { 0: "auto", 1: "circulate", 2: "on", 3: "low", 4: "medium", 5: "high", 10: "off", 11: "NA" };
    return getValue(mode_map, mode);
}

function readPIRStatus(status) {
    var status_map = { 0: "vacant", 1: "occupied", 2: "night_occupied" };
    return getValue(status_map, status);
}

function readBleEvent(event) {
    var event_map = { 0: "none", 1: "peer_cancel", 2: "disconnect" };
    return getValue(event_map, event);
}

function readPowerBusEvent(event) {
    var event_map = { 0: "none", 1: "communication_error" };
    return getValue(event_map, event);
}

function readTemperatureAlarm(type) {
    var type_map = { 0: "collection_error", 1: "lower_range_error", 2: "over_range_error", 3: "no_data" };
    return getValue(type_map, type);
}

function readHumidityAlarm(type) {
    var type_map = { 0: "collection_error", 1: "lower_range_error", 2: "over_range_error", 3: "no_data" };
    return getValue(type_map, type);
}

function readButtonEvent(event) {
    var event_map = { 0: "F1", 1: "F2", 2: "F3" };
    return getValue(event_map, event);
}

function readBatteryEvent(event) {
    var event_map = { 0: "recover", 1: "low_voltage" };
    return getValue(event_map, event);
}

function readTimeUnitType(type) {
    var unit_map = { 0: "second", 1: "minute" };
    return getValue(unit_map, type);
}

function readReportingMode(mode) {
    var mode_map = { 0: "ble", 1: "lora", 2: "ble_and_lora", 3: "power_bus_and_lora" };
    return getValue(mode_map, mode);
}

function readTemperatureUnit(type) {
    var unit_map = { 0: "celsius", 1: "fahrenheit" };
    return getValue(unit_map, type);
}

function readTargetTemperatureMode(type) {
    var mode_map = { 0: "single_point", 1: "dual_point" };
    return getValue(mode_map, type);
}

function readTargetTemperatureResolution(type) {
    var resolution_map = { 0: "0.5", 1: "1" };
    return getValue(resolution_map, type);
}

function readButtonFunction(type) {
    var function_map = { 0: "system_status", 1: "temperature_control_mode", 2: "fan_mode", 3: "plan_switch", 4: "status_report", 5: "release_filter_alarm", 6: "button_value", 7: "temperature_unit_switch" };
    return getValue(function_map, type);
}

function readDataSource(type) {
    var data_source_map = { 0: "embedded_data", 1: "external_receive" };
    return getValue(data_source_map, type);
}

function readTimeZone(time_zone) {
    var timezone_map = { "-720": "UTC-12", "-660": "UTC-11", "-600": "UTC-10", "-570": "UTC-9:30", "-540": "UTC-9", "-480": "UTC-8", "-420": "UTC-7", "-360": "UTC-6", "-300": "UTC-5", "-240": "UTC-4", "-210": "UTC-3:30", "-180": "UTC-3", "-120": "UTC-2", "-60": "UTC-1", 0: "UTC", 60: "UTC+1", 120: "UTC+2", 180: "UTC+3", 210: "UTC+3:30", 240: "UTC+4", 270: "UTC+4:30", 300: "UTC+5", 330: "UTC+5:30", 345: "UTC+5:45", 360: "UTC+6", 390: "UTC+6:30", 420: "UTC+7", 480: "UTC+8", 540: "UTC+9", 570: "UTC+9:30", 600: "UTC+10", 630: "UTC+10:30", 660: "UTC+11", 720: "UTC+12", 765: "UTC+12:45", 780: "UTC+13", 840: "UTC+14" };
    return getValue(timezone_map, time_zone);
}

function readAddressType(type) {
    var address_type_map = { 0: "public", 1: "random" };
    return getValue(address_type_map, type);
}

function readCommunicationMode(mode) {
    var mode_map = { 0: "ble", 1: "lora", 2: "ble_and_lora", 3: "power_bus_and_lora" };
    return getValue(mode_map, mode);
}

function readPIRDetectionMode(mode) {
    var mode_map = { 0: "single", 1: "multiple" };
    return getValue(mode_map, mode);
}

function readPlan(id) {
    var id_map = { 0: "plan_1", 1: "plan_2", 2: "plan_3", 3: "plan_4", 4: "plan_5", 5: "plan_6", 6: "plan_7", 7: "plan_8", 8: "plan_9", 9: "plan_10", 10: "plan_11", 11: "plan_12", 12: "plan_13", 13: "plan_14", 14: "plan_15", 15: "plan_16", 255: "none" };
    return getValue(id_map, id);
}

//
//
//
//
//
function readCmdResult(type) {
    var result_map = { 0: "success", 1: "parsing error", 2: "order error", 3: "password error", 4: "read params error", 5: "write params error", 6: "read execution error", 7: "write execution error", 8: "read apply error", 9: "write apply error", 10: "associative error" };
    return getValue(result_map, type);
}

function readCmdName(type) {
    var name_map = {
        56: { level: 1, name: "combine_command" },
        60: { level: 1, name: "collection_interval" },
        61: { level: 1, name: "reporting_interval" },
        62: { level: 1, name: "intelligent_display_enable" },
        63: { level: 1, name: "temperature_unit" },
        64: { level: 1, name: "temperature_control_mode_support" },
        65: { level: 1, name: "target_temperature_mode" },
        66: { level: 1, name: "target_temperature_resolution" },
        67: { level: 1, name: "system_status" },
        68: { level: 2, name: "temperature_control_mode" },
        69: { level: 2, name: "target_temperature_settings" },
        "6a": { level: 1, name: "dead_band" },
        "6b": { level: 2, name: "target_temperature_range" },
        71: { level: 2, name: "button_custom_function" },
        72: { level: 1, name: "child_lock_settings" },
        74: { level: 1, name: "fan_mode" },
        75: { level: 1, name: "screen_display_settings" },
        76: { level: 1, name: "temperature_calibration_settings" },
        77: { level: 1, name: "humidity_calibration_settings" },
        "7d": { level: 1, name: "data_sync_to_peer" },
        "7e": { level: 1, name: "data_sync_timeout" },
        80: { level: 1, name: "unlock_combination_button_settings" },
        81: { level: 1, name: "temporary_unlock_settings" },
        82: { level: 2, name: "pir_config" },
        85: { level: 1, name: "ble_enable" },
        86: { level: 1, name: "external_temperature" },
        87: { level: 1, name: "external_humidity" },
        88: { level: 1, name: "fan_support_mode" },
        "8b": { level: 1, name: "ble_name" },
        "8c": { level: 1, name: "ble_pair_info" },
        "8d": { level: 1, name: "communication_mode" },
        c6: { level: 1, name: "daylight_saving_time" },
        c7: { level: 1, name: "time_zone" },
    };

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