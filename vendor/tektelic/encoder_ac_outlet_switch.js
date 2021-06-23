function Encoder(data) {
    var ret = [];
    var port = 100;

    check_encode("device_eui",
        function (value) {
        },
        function () {
            ret = ret.concat(ret, [0x00]);
        }
    );
    check_encode("app_eui",
        function (value) {
        },
        function () {
            ret = ret.concat(ret, [0x01]);
        }
    );
    check_encode("app_key",
        function (value) {
        },
        function () {
            ret = ret.concat(ret, [0x02]);
        }
    );
    check_encode("device_address",
        function (value) {
        },
        function () {
            ret = ret.concat(ret, [0x03]);
        }
    );
    check_encode("network_session_key",
        function (value) {
        },
        function () {
            ret = ret.concat(ret, [0x04]);
        }
    );
    check_encode("app_session_key",
        function (value) {
        },
        function () {
            ret = ret.concat(ret, [0x05]);
        }
    );
    check_encode("energy_consumption_push_button",
        function (value) {
        },
        function () {
            ret = ret.concat([0x00, 0x93]);
            port = 10;
        }
    );
    check_encode("energy_consumption_reset_button",
        function (value) {
        },
        function () {
            ret = ret.concat([0x01, 0x93]);
            port = 10;
        }
    );
    check_encode("energy_consumption_status_button",
        function (value) {
        },
        function () {
            ret = ret.concat([0x02, 0x93]);
            port = 10;
        }
    );
    check_encode("voltmeter_push_button",
        function (value) {
        },
        function () {
            ret = ret.concat([0x03, 0x93]);
            port = 10;
        }
    );
    check_encode("ammeter_push_button",
        function (value) {
        },
        function () {
            ret = ret.concat([0x04, 0x93]);
            port = 10;
        }
    );
    check_encode("realpower_push_button",
        function (value) {
        },
        function () {
            ret = ret.concat([0x05, 0x93]);
            port = 10;
        }
    );
    check_encode("apparent_power_push_button",
        function (value) {
        },
        function () {
            ret = ret.concat([0x06, 0x93]);
            port = 10;
        }
    );
    check_encode("powerfactor_push_button",
        function (value) {
        },
        function () {
            ret = ret.concat([0x07, 0x93]);
            port = 10;
        }
    );
    check_encode("relay_control",
        function (value) {
            var converted = value == 0 ? [0x00, 0x01, 0x00]: [0x00, 0x01, 0xFF];
            ret = ret.concat(converted);
            port = 10;
        },
        function () {
        }
    );
    check_encode("relaystatus_push_button",
        function (value) {
        },
        function () {
            ret = ret.concat([0x08, 0x93]);
            port = 10;
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
            } else if (value.lora_class == 'B') {
                value.lora_class = 0xB;
            } else if (value.lora_class == 'A') {
                value.lora_class = 0xA;
            } else {
                value.lora_class = 0xF;
            }
            var converted = [0x11 | 0x80,
                (value.lora_class & 0xF) << 4,
                ((value.confirm_mode & 0x1) << 0) |
                ((value.sync_word & 0x1) << 1) |
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
    check_encode("tick_period",
        function (value) {
            var converted = [0x20 | 0x80,
                (value >> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x20])
        }
    );
    check_encode("energy_period",
        function (value) {
            var converted = [0x21 | 0x80,
                ((value >> 8) & 0xff),
                value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x21])
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