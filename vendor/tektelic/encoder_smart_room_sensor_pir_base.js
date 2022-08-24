function encodeDownlink(input) {
    var ret = [];
    port = 100;

    check_encode("device_eui",
        function (value) {
        },
        function () {
            ret = ret.concat(ret, [0x00])
        }
    );
    check_encode("app_eui",
        function (value) {
        },
        function () {
            ret = ret.concat(ret, [0x01])
        }
    );
    check_encode("app_key",
        function (value) {
        },
        function () {
            ret = ret.concat(ret, [0x02])
        }
    );
    check_encode("device_address",
        function (value) {
        },
        function () {
            ret = ret.concat(ret, [0x03])
        }
    );
    check_encode("network_session_key",
        function (value) {
        },
        function () {
            ret = ret.concat(ret, [0x04])
        }
    );
    check_encode("app_session_key",
        function (value) {
        },
        function () {
            ret = ret.concat(ret, [0x05])
        }
    );
    check_encode("lorawan_join_mode",
        function (value) {
            var converted = [0x10 | 0x80,
                ((value & 0x1) << 7), 0x00];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x10])
        }
    );
    check_encode("loramac_opts",
        function (value) {
            var converted = [0x11 | 0x80, 0x00,
                ((value.loramac_confirm_mode & 0x1) << 0) |
                ((value.loramac_sync_word & 0x1) << 1) |
                ((value.loramac_duty_cycle & 0x1) << 2) |
                ((value.loramac_adr & 0x1) << 3)];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x11])
        }
    );
    check_encode("loramac_dr_tx",
        function (value) {
            var converted = [0x12 | 0x80,
                ((value.dr_number & 0xf) << 0),
                ((value.tx_power_number & 0xf) << 0)];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x12])
        }
    );
    check_encode("loramac_rx2",
        function (value) {
            var converted = [0x13 | 0x80,
                (value.frequency >> 24) & 0xff, (value.frequency >> 16) & 0xff, (value.frequency >> 8) & 0xff, value.frequency & 0xff,
                value.dr_number & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x13])
        }
    );
    check_encode("seconds_per_core_tick",
        function (value) {
            var converted = [0x20 | 0x80,
                (value >> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x20])
        }
    );
    check_encode("tick_per_battery",
        function (value) {
            var converted = [0x21 | 0x80,
                (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x21])
        }
    );
    check_encode("tick_per_ambient_temperature",
        function (value) {
            var converted = [0x22 | 0x80,
                (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x22])
        }
    );
    check_encode("tick_per_relative_humidity",
        function (value) {
            var converted = [0x23 | 0x80,
                (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x23])
        }
    );
    check_encode("tick_per_reed_switch",
        function (value) {
            var converted = [0x24 | 0x80,
                (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x24])
        }
    );
    check_encode("tick_per_light",
        function (value) {
            var converted = [0x25 | 0x80,
                (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x25])
        }
    );
    check_encode("tick_per_accelerometer",
        function (value) {
            var converted = [0x26 | 0x80,
                (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x26])
        }
    );
    check_encode("tick_per_mcu_temperature",
        function (value) {
            var converted = [0x27 | 0x80,
                (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x27])
        }
    );
    check_encode("tick_per_pir",
        function (value) {
            var converted = [0x28 | 0x80,
                (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x28])
        }
    );
    check_encode("tick_per_external_connector",
        function (value) {
            var converted = [0x29 | 0x80,
                (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x29])
        }
    );
    check_encode("reed_mode",
        function (value) {
            var converted = [0x2A | 0x80,
                ((value.rising_edge_enabled & 0x1) << 0) |
                ((value.falling_edge_enabled & 0x1) << 1)];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x2A])
        }
    );
    check_encode("reed_switch_count_threshold",
        function (value) {
            var converted = [0x2B | 0x80,
                (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x2B])
        }
    );
    check_encode("reed_tx",
        function (value) {
            var converted = [0x2C | 0x80,
                ((value.report_state_enabled & 0x1) << 0) |
                ((value.report_count_enabled & 0x1) << 1)];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x2C])
        }
    );
    check_encode("external_connector",
        function (value) {
            var converted = [0x2D | 0x80,
                ((value.rising_edge_enabled & 0x1) << 0) |
                ((value.falling_edge_enabled & 0x1) << 1) |
                ((value.mode & 0x1) << 7)];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x2D])
        }
    );
    check_encode("external_connector_count_threshold",
        function (value) {
            var converted = [0x2E | 0x80,
                (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x2E])
        }
    );
    check_encode("external_connector_tx",
        function (value) {
            var converted = [0x2F | 0x80,
                ((value.report_state_enabled & 0x1) << 0) |
                ((value.report_count_enabled & 0x1) << 1)];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x2F])
        }
    );
    check_encode("impact_event_threshold",
        function (value) {
            var converted = [0x30 | 0x80,
                (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x30])
        }
    );
    check_encode("acceleration_event_threshold",
        function (value) {
            var converted = [0x31 | 0x80,
                (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x31])
        }
    );
    check_encode("accelerometer_tx",
        function (value) {
            var converted = [0x32 | 0x80,
                ((value.report_alarm_enabled & 0x1) << 0) |
                ((value.report_magnitude_enabled & 0x1) << 4) |
                ((value.report_vector_enabled & 0x1) << 5)];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x32])
        }
    );
    check_encode("acceleration_impact_grace_period",
        function (value) {
            var converted = [0x33 | 0x80,
                (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x33])
        }
    );
    check_encode("accelerometer",
        function (value) {
            var converted = [0x34 | 0x80,
                ((value.impact_threshold_enabled & 0x1) << 0) |
                ((value.acceleration_threshold_enabled & 0x1) << 1) |
                ((value.xaxis_enabled & 0x1) << 4) |
                ((value.yaxis_enabled & 0x1) << 5) |
                ((value.zaxis_enabled & 0x1) << 6) |
                ((value.poweron & 0x1) << 7)];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x34])
        }
    );
    check_encode("sensitivity",
        function (value) {
            var converted = [0x35 | 0x80,
                ((value.accelerometer_sample_rate & 0x7) << 0) |
                ((value.accelerometer_measurement_range & 0x3) << 4)];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x35])
        }
    );
    check_encode("impact_alarm_grace_period",
        function (value) {
            var converted = [0x36 | 0x80,
                (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x36])
        }
    );
    check_encode("impact_alarm_threshold_count",
        function (value) {
            var converted = [0x37 | 0x80,
                (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x37])
        }
    );
    check_encode("impact_alarm_threshold_period",
        function (value) {
            var converted = [0x38 | 0x80,
                (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x38])
        }
    );
    check_encode("temperature_relative_humidity_sample_period_idle",
        function (value) {
            var converted = [0x39 | 0x80,
                (value >> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x39])
        }
    );
    check_encode("temperature_relative_humidity_sample_period_active",
        function (value) {
            var converted = [0x3A | 0x80,
                (value >> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x3A])
        }
    );
    check_encode("ambient_temperature_threshold",
        function (value) {
            var converted = [0x3B | 0x80,
                value.high & 0xff,
                value.low & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x3B])
        }
    );
    check_encode("ambient_temperature_threshold_enabled",
        function (value) {
            var converted = [0x3C | 0x80,
                value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x3C])
        }
    );
    check_encode("relative_humidity_threshold",
        function (value) {
            var converted = [0x3D | 0x80,
                value.high & 0xff,
                value.low & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x3D])
        }
    );
    check_encode("relative_humidity_threshold_enabled",
        function (value) {
            var converted = [0x3E | 0x80,
                value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x3E])
        }
    );
    check_encode("mcu_temperature_sample_period_idle",
        function (value) {
            var converted = [0x40 | 0x80,
                (value >> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x40])
        }
    );
    check_encode("mcu_temperature_sample_period_active",
        function (value) {
            var converted = [0x41 | 0x80,
                (value >> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x41])
        }
    );
    check_encode("mcu_temperature_threshold",
        function (value) {
            var converted = [0x42 | 0x80,
                value.high & 0xff,
                value.low & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x42])
        }
    );
    check_encode("mcu_temperature_threshold_enabled",
        function (value) {
            var converted = [0x43 | 0x80,
                value & 0x1];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x43])
        }
    );
    check_encode("analog_sample_period_idle",
        function (value) {
            var converted = [0x44 | 0x80,
                (value >> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x44])
        }
    );
    check_encode("analog_sample_period_active",
        function (value) {
            var converted = [0x45 | 0x80,
                (value >> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x45])
        }
    );
    check_encode("analog_input_threshold",
        function (value) {
            var converted = [0x46 | 0x80,
                (value.high >> 16) & 0xff,
                (value.high) & 0xff,
                (value.low >> 16) & 0xff,
                (value.low) & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x46])
        }
    );
    check_encode("light_sample_period",
        function (value) {
            var converted = [0x47 | 0x80,
                (value >> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x47])
        }
    );
    check_encode("light",
        function (value) {
            var converted = [0x48 | 0x80,
                (value.threshold & 0x3f) |
                (value.threshold_enabled & 0x1) << 7];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x48])
        }
    );
    check_encode("light_tx",
        function (value) {
            var converted = [0x49 | 0x80,
                (value.state_reported & 0x1) |
                (value.intensity_reported & 0x1) << 1];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x49])
        }
    );
    check_encode("analog_input_threshold_enabled",
        function (value) {
            var converted = [0x4A | 0x80,
                value.analog_input_threshold_enabled & 0x1];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x4A])
        }
    );
    check_encode("pir_grace_period",
        function (value) {
            var converted = [0x50 | 0x80,
                (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x50])
        }
    );
    check_encode("pir_threshold",
        function (value) {
            var converted = [0x51 | 0x80,
                (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x51])
        }
    );
    check_encode("pir_threshold_period",
        function (value) {
            var converted = [0x52 | 0x80,
                (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x52])
        }
    );
    check_encode("pir_mode",
        function (value) {
            var converted = [0x53 | 0x80,
                ((value.motion_count_reported & 0x1) << 0) |
                ((value.motion_state_reported & 0x1) << 1) |
                ((value.event_transmission_enabled & 0x1) << 6) |
                ((value.transducer_enabled & 0x1) << 7)];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x53])
        }
    );
    check_encode("moisture_sample_period",
        function (value) {
            var converted = [0x5A | 0x80,
                value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x5A])
        }
    );
    check_encode("moisture_threshold",
        function (value) {
            var converted = [0x5B | 0x80,
                value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x5B])
        }
    );
    check_encode("moisture_sensing_enabled",
        function (value) {
            var converted = [0x5C | 0x80,
                value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x5C])
        }
    );
    check_encode("moisture_caliberation_dry",
        function (value) {
            var converted = [0x5D | 0x80,
                value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x5D])
        }
    );
    check_encode("write_to_flash",
        function (value) {
            var converted = [0x70 | 0x80,
                ((value.app_configuration & 0x1) << 5) |
                ((value.lora_configuration & 0x1) << 6),
                ((value.restart_sensor & 0x1) << 0)];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x70])
        }
    );
    check_encode("firmware_version",
        function (value) {
        },
        function () {
            ret = ret.concat(ret, [0x71])
        }
    );
    check_encode("configuration_factory_reset",
        function (value) {
            var converted = [0x72 | 0x80,
                value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x72])
        }
    );
    check_encode("payload",
        function (value) {
            var converted = base64ToArray(value);
            ret = ret.concat(converted);
        },
        function () {
        }
    );
    function check_encode(prop_name, do_write, do_read) {
        if (input.data.hasOwnProperty(prop_name)) {
            var obj = input.data[prop_name];
            if (obj.hasOwnProperty("access")) {
                var access_value = obj.access;
                if (access_value == "write") {
                    do_write(obj.value);
                } else if (access_value == "read") {
                    do_read();
                }
            } else if (obj.hasOwnProperty("value")) {
                do_write(obj.value);
            }
        }
    }

    function atob(input) {
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        var str = String(input).replace(/[=]+$/, ''); // #31: ExtendScript bad parse of /=
        if (str.length % 4 === 1) {
            throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
        }
        for (
            var bc = 0, bs, buffer, idx = 0, output = '';
            buffer = str.charAt(idx++);
            ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
        ) {
            buffer = chars.indexOf(buffer);
        }
        return output;
    }

    function base64ToArray(base64) {
        var binary_string = atob(base64);
        var len = binary_string.length;
        var result = [];
        for (var i = 0; i < len; i++) {
            result.push(binary_string.charCodeAt(i));
        }
        return result;
    }

    return {
        bytes: ret,
        fPort: port
    };

}