function Encoder(data) {
    var ret = [];
    var port = 100;

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
            var converted = [0x11 | 0x80, 0x00,
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
    check_encode("tick_per_gps_stillness",
        function (value) {
            var converted = [0x22 | 0x80,
                (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x22])
        }
    );
    check_encode("tick_per_gps_mobility",
        function (value) {
            var converted = [0x23 | 0x80,
                (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x23])
        }
    );
    check_encode("tick_per_accelerometer",
        function (value) {
            var converted = [0x24 | 0x80,
                (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x24])
        }
    );
    check_encode("tick_per_ble_default",
        function (value) {
            var converted = [0x25 | 0x80,
                (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x25])
        }
    );
    check_encode("tick_per_ble_stillness",
        function (value) {
            var converted = [0x26 | 0x80,
                (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x26])
        }
    );
    check_encode("tick_per_ble_mobility",
        function (value) {
            var converted = [0x27 | 0x80,
                (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x27])
        }
    );
    check_encode("tick_per_temperature",
        function (value) {
            var converted = [0x28 | 0x80,
                (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x28])
        }
    );
    check_encode("mode",
        function (value) {
            var converted = [0x2A | 0x80,
                ((value.reed_event_type & 0x1) << 7),
                ((value.battery_voltage_report & 0x1) << 0) |
                ((value.acceleration_vector_report & 0x1) << 1) |
                ((value.temperature_report & 0x1) << 2) |
                ((value.ble_report & 0x1) << 3)];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x2A])
        }
    );
    check_encode("event_type1",
        function (value) {
            var converted = [0x2B | 0x80,
                (value.m_value & 0xf) |
                ((value.n_value & 0xf) << 4)];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x2B])
        }
    );
    check_encode("event_type2",
        function (value) {
            var converted = [0x2C | 0x80,
                (value.t_value & 0xf)];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x2C])
        }
    );
    check_encode("gps_enabled",
        function (value) {
            var converted = [0x30 | 0x80,
                (value >> 0x1) << 7];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x30])
        }
    );
    check_encode("speed_threshold",
        function (value) {
            value.mobility = value.mobility / 0.1;
            value.stillness = value.stillness / 0.1;
            var converted = [0x31 | 0x80,
                (value.mobility & 0xff),
                (value.stillness & 0xff)];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x31])
        }
    );
    check_encode("average_speed_count",
        function (value) {
            var converted = [0x32 | 0x80,
                ((value.mobility & 0xf) << 4) |
                (value.stillness & 0xf)];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x32])
        }
    );
    check_encode("tx",
        function (value) {
            var converted = [0x33 | 0x80,
                ((value.utc_report_enabled & 0x1) << 0) |
                ((value.coordinate_report_enabled & 0x1) << 1) |
                ((value.fsm_report_enabled & 0x1) << 2) |
                ((value.geofence_report_enabled & 0x1) << 3)];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x33])
        }
    );
    check_encode("geofence_definition1",
        function (value) {
            value.latitude = value.latitude / 0.0000125; // applying scaling factor
            value.longitude = value.longitude / 0.000025; // applying scaling factor
            value.radius = value.radius / 10; // applying scaling factor
            var converted = [0x34 | 0x80,
                (value.latitude >> 16) & 0xff, (value.latitude >> 8) & 0xff, value.latitude & 0xff,
                (value.longitude >> 16) & 0xff, (value.longitude >> 8) & 0xff, value.longitude & 0xff,
                ((value.radius >> 8) & 0xff), (value.radius & 0xff)];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x34])
        }
    );
    check_encode("geofence_definition2",
        function (value) {
            value.latitude = value.latitude / 0.0000125; // applying scaling factor
            value.longitude = value.longitude / 0.000025; // applying scaling factor
            value.radius = value.radius / 10; // applying scaling factor
            var converted = [0x35 | 0x80,
                (value.latitude >> 16) & 0xff, (value.latitude >> 8) & 0xff, value.latitude & 0xff,
                (value.longitude >> 16) & 0xff, (value.longitude >> 8) & 0xff, value.longitude & 0xff,
                ((value.radius >> 8) & 0xff), (value.radius & 0xff)];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x35])
        }
    );
    check_encode("geofence_definition3",
        function (value) {
            value.latitude = value.latitude / 0.0000125; // applying scaling factor
            value.longitude = value.longitude / 0.000025; // applying scaling factor
            value.radius = value.radius / 10; // applying scaling factor
            var converted = [0x36 | 0x80,
                (value.latitude >> 16) & 0xff, (value.latitude >> 8) & 0xff, value.latitude & 0xff,
                (value.longitude >> 16) & 0xff, (value.longitude >> 8) & 0xff, value.longitude & 0xff,
                ((value.radius >> 8) & 0xff), (value.radius & 0xff)];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x36])
        }
    );
    check_encode("geofence_definition4",
        function (value) {
            value.latitude = value.latitude / 0.0000125; // applying scaling factor
            value.longitude = value.longitude / 0.000025; // applying scaling factor
            value.radius = value.radius / 10; // applying scaling factor
            var converted = [0x37 | 0x80,
                (value.latitude >> 16) & 0xff, (value.latitude >> 8) & 0xff, value.latitude & 0xff,
                (value.longitude >> 16) & 0xff, (value.longitude >> 8) & 0xff, value.longitude & 0xff,
                ((value.radius >> 8) & 0xff), (value.radius & 0xff)];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x37])
        }
    );
    check_encode("accelerometer",
        function (value) {
            var converted = [0x40 | 0x80,
                ((value.xaxis_enabled & 0x1) << 0) |
                ((value.yaxis_enabled & 0x1) << 1) |
                ((value.zaxis_enabled & 0x1) << 2)];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x40])
        }
    );
    check_encode("sensitivity",
        function (value) {

            switch (value.accelerometer_sample_rate) { // mapping from Hz to a code value
                case 1:
                    value.sensitivity.accelerometer_sample_rate = 1;
                    break;
                case 10:
                    value.accelerometer_sample_rate = 2;
                    break;
                case 25:
                    value.accelerometer_sample_rate = 3;
                    break;
                case 50:
                    value.accelerometer_sample_rate = 4;
                    break;
                case 100:
                    value.accelerometer_sample_rate = 5;
                    break;
                case 200:
                    value.accelerometer_sample_rate = 6;
                    break;
                case 400:
                    value.accelerometer_sample_rate = 7;
                    break;
                default: // invalid value
                    value.accelerometer_sample_rate = 0;
                    break;
            }
            switch (value.accelerometer_measurement_range) {
                case 2:
                case -2:
                    value.accelerometer_measurement_range = 0;
                    break;
                case 4:
                case -4:
                    value.sensitivity.accelerometer_measurement_range = 1;
                    break;
                case 8:
                case -8:
                    value.sensitivity.accelerometer_measurement_range = 2;
                    break;
                case 16:
                case -16:
                    value.sensitivity.accelerometer_measurement_range = 3;
                    break;
                default:
                    value.sensitivity.accelerometer_measurement_range = 0;
            }
            var converted = [0x41 | 0x80,
                (value.accelerometer_sample_rate & 0x7) |
                (value.accelerometer_measurement_range & 0x3) << 4];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x41])
        }
    );
    check_encode("acceleration_alarm_threshold_count",
        function (value) {
            var converted = [0x42 | 0x80,
                ((value >> 8) & 0xff),
                value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x42])
        }
    );
    check_encode("acceleration_alarm_threshold_period",
        function (value) {
            var converted = [0x43 | 0x80,
                ((value >> 8) & 0xff),
                value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x43])
        }
    );
    check_encode("acceleration_alarm_threshold",
        function (value) {
            value = value / 1000; //convert to milli-g -- the integer part would be used for the bit shifting
            var converted = [0x44 | 0x80,
                ((value >> 8) & 0xff),
                value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x44])
        }
    );
    check_encode("acceleration_alarm_grace_period",
        function (value) {
            var converted = [0x45 | 0x80,
                ((value >> 8) & 0xff),
                value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x45])
        }
    );
    check_encode("accelerometer_tx",
        function (value) {
            var converted = [0x46 | 0x80,
                (value.report_periodic_enabled & 0x01) |
                (value.report_alarm_enabled & 0x01) << 1];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x46])
        }
    );
    check_encode("ble_mode",
        function (value) {
            var converted = [0x50 | 0x80,
                ((value & 0x1) << 7)];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x50])
        }
    );
    check_encode("ble_scan_interval",
        function (value) {
            value = value / 1000; //convert to ms -- the integer part would be used for bit the shifting
            var converted = [0x51 | 0x80,
                ((value >> 8) & 0xff),
                value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x51])
        }
    );
    check_encode("ble_scan_window",
        function (value) {
            value = value / 1000; //convert to ms -- the integer part would be used for bit the shifting
            var converted = [0x52 | 0x80,
                ((value >> 8) & 0xff),
                value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x52])
        }
    );
    check_encode("ble_scan_duration",
        function (value) {
            var converted = [0x53 | 0x80,
                ((value >> 8) & 0xff),
                value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x53])
        }
    );
    check_encode("ble_reported_devices",
        function (value) {
            var converted = [0x54 | 0x80,
                value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x54])
        }
    );
    check_encode("temperature_sample_period_idle",
        function (value) {
            var converted = [0x60 | 0x80,
                (value >> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x60])
        }
    );
    check_encode("temperature_sample_period_active",
        function (value) {
            var converted = [0x61 | 0x80,
                (value >> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x61])
        }
    );
    check_encode("temperature_threshold",
        function (value) {
            var converted = [0x62 | 0x80,
                value.high & 0xff,
                value.low & 0xff];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x62])
        }
    );
    check_encode("temperature_threshold_enabled",
        function (value) {
            var converted = [0x63 | 0x80,
                value & 0x1];
            ret = ret.concat(converted);
        },
        function () {
            ret = ret.concat([0x63])
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

function encodeDownlink(data) {
    return Encoder(data.data);
}
