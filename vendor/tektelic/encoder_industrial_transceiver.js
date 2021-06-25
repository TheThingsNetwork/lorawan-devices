function Encoder(data) {
    var ret = [];
    var port = 100;

    check_encode("output_1",
        function (value) {
            var converted;
            if (value == 0) {
                converted = [0x01, 0x01,
                    0x00];
            } else {
                converted = [0x01, 0x01,
                    0xFF];
            }
            ret.concat(converted);
            port = 10;
        },
        function () {
        }
    );
    check_encode("output_2",
        function (value) {
            var converted;
            if (value == 0) {
                converted = [0x02, 0x01,
                    0x00];
            } else {
                converted = [0x02, 0x01,
                    0xFF];
            }
            ret.concat(converted);
            port = 10;
        },
        function () {
        }
    );
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
    check_encode("loramac_join_mode",
        function (value) {
            var converted = [0x10 | 0x80,
                ((value & 0x1) << 7),
                0x00];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x10])
        }
    );
    check_encode("loramac_opts",
        function (value) {
            if (value.lora_class == 'C') {
                value.lora_class = 0xC;
            } else if (value.lora_class == 'A') {
                value.lora_class = 0x0;
            } else {
                value.lora_class = 0xF;
            }
            var converted = [0x11 | 0x80,
                (value.lora_class & 0xF) << 4,
                ((value.confirm_mode & 0x1) << 0) |
                ((value.duty_cycle & 0x1) << 2) |
                ((value.adr & 0x1) << 3)];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x11])
        }
    );
    check_encode("loramac_dr_tx",
        function (value) {
            var converted = [0x12 | 0x80,
                value.dr_number & 0xf,
                value.tx_power_number & 0xf];
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
    check_encode("netid_msb",
        function (value) {
            var converted = [0x19 | 0x80,
                (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x19])
        }
    );
    check_encode("netid_lsb",
        function (value) {
            var converted = [0x1A | 0x80,
                (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x1A])
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
    check_encode("tick_input1",
        function (value) {
            var converted = [0x24 | 0x80,
                (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x24])
        }
    );
    check_encode("tick_input2",
        function (value) {
            var converted = [0x25 | 0x80,
                (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x25])
        }
    );
    check_encode("tick_input3",
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
    check_encode("tick_output1",
        function (value) {
            var converted = [0x28 | 0x80,
                (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x28])
        }
    );
    check_encode("tick_output2",
        function (value) {
            var converted = [0x29 | 0x80,
                (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x29])
        }
    );
    check_encode("input1_mode",
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
    check_encode("input1_count_threshold",
        function (value) {
            var converted = [0x2B | 0x80,
                (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x2B])
        }
    );
    check_encode("input1_tx",
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
    check_encode("input_sample_period_idle",
        function (value) {
            var converted = [0x30 | 0x80,
                (value >> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x30])
        }
    );
    check_encode("input_sample_period_active",
        function (value) {
            var converted = [0x31 | 0x80,
                (value >> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x31])
        }
    );
    check_encode("input2_threshold",
        function (value) {
            value.high /= 0.1;
            value.low /= 0.1;
            var converted = [0x32 | 0x80,
                value.high & 0xff,
                value.low & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x32])
        }
    );
    check_encode("input3_threshold",
        function (value) {
            value.high /= 0.05;
            value.low /= 0.05;
            var converted = [0x33 | 0x80,
                value.high & 0xff,
                value.low & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x33])
        }
    );
    check_encode("threshold_enabled",
        function (value) {
            var converted = [0x34 | 0x80,
                ((value.input2 & 0x1) << 0) |
                ((value.input3 & 0x1) << 4)];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x34])
        }
    );
    check_encode("temperature_sample_period_idle",
        function (value) {
            var converted = [0x39 | 0x80,
                (value >> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x39])
        }
    );
    check_encode("temperature_sample_period_active",
        function (value) {
            var converted = [0x3A | 0x80,
                (value >> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x3A])
        }
    );
    check_encode("temperature_threshold",
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
    check_encode("temperature_threshold_enabled",
        function (value) {
            var converted = [0x3C | 0x80,
                value & 0x1];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x3C])
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
                value & 0x01];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x43])
        }
    );
    check_encode("output1_control",
        function (value) {
            var converted = [0x50 | 0x80,
                value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x50])
        }
    );
    check_encode("output1_delay",
        function (value) {
            value /= 0.001;
            var converted = [0x51 | 0x80,
                (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x51])
        }
    );
    check_encode("output2_control",
        function (value) {
            var converted = [0x52 | 0x80,
                value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x52])
        }
    );
    check_encode("output2_delay",
        function (value) {
            value /= 0.001;
            var converted = [0x53 | 0x80,
                (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x53])
        }
    );
    check_encode("serial_interface_type",
        function (value) {
            var converted = [0x60 | 0x80,
                value & 0x01];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x60])
        }
    );
    check_encode("serial_baud_rate",
        function (value) {
            var converted = [0x61 | 0x80,
                (value >> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x61])
        }
    );
    check_encode("serial_data_bits",
        function (value) {
            var converted = [0x62 | 0x80,
                value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x62])
        }
    );
    check_encode("serial_parity_bits",
        function (value) {
            var converted = [0x63 | 0x80,
                value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x63])
        }
    );
    check_encode("serial_stop_bits",
        function (value) {
            if (value == 0.5) {
                value = 0x05;
            } else if (value == 1) {
                value = 0x0A;
            } else if (value == 1.5) {
                value = 0x0F;
            } else if (value == 2) {
                value = 0x14;
            } else {
                value = 0; // invalid value
            }
            var converted = [0x64 | 0x80,
                value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x64])
        }
    );
    check_encode("serial_duplex_mode",
        function (value) {
            var converted = [0x65 | 0x80,
                value & 0x01];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x65])
        }
    );
    check_encode("modbus_rtu_symbol_timeout",
        function (value) {
            var converted = [0x68 | 0x80,
                (value >> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x68])
        }
    );
    check_encode("modbus_rtu_rx_timeout",
        function (value) {
            var converted = [0x69 | 0x80,
                (value >> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x69])
        }
    );
    check_encode("modbus_rtu_polling_period",
        function (value) {
            var converted = [0x6A | 0x80,
                (value >> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x6A])
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
    check_encode("serial_payload",
        function (value) {
            var converted = base64ToArray(value);
            ret = ret.concat(converted);
            port = 20;
        },
        function () {
        }
    );

    function check_encode(prop_name, do_write, do_read) {
        if (data.hasOwnProperty(prop_name)) {
            var obj = data[prop_name];
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
        'bytes': ret,
        'port': port
    };
}

function encodeDownlink(data) {
    return Encoder(data.data);
}
