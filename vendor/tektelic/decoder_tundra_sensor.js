function Decoder(bytes, port) { //bytes - Array of bytes (signed)

    function slice(a, f, t) {
        var res = [];
        for (var i = 0; i < t - f; i++) {
            res[i] = a[f + i];
        }
        return res;
    }

    function extract_bytes(chunk, start_bit, end_bit) {
        var total_bits = end_bit - start_bit + 1;
        var total_bytes = total_bits % 8 === 0 ? to_uint(total_bits / 8) : to_uint(total_bits / 8) + 1;
        var offset_in_byte = start_bit % 8;
        var end_bit_chunk = total_bits % 8;
        var arr = new Array(total_bytes);
        for (byte = 0; byte < total_bytes; ++byte) {
            var chunk_idx = to_uint(start_bit / 8) + byte;
            var lo = chunk[chunk_idx] >> offset_in_byte;
            var hi = 0;
            if (byte < total_bytes - 1) {
                hi = (chunk[chunk_idx + 1] & ((1 << offset_in_byte) - 1)) << (8 - offset_in_byte);
            } else if (end_bit_chunk !== 0) {
                // Truncate last bits
                lo = lo & ((1 << end_bit_chunk) - 1);
            }
            arr[byte] = hi | lo;
        }
        return arr;
    }

    function apply_data_type(bytes, data_type) {
        var output = 0;
        if (data_type === "unsigned") {
            for (var i = 0; i < bytes.length; ++i) {
                output = (to_uint(output << 8)) | bytes[i];
            }
            return output;
        }

        if (data_type === "signed") {
            for (var i = 0; i < bytes.length; ++i) {
                output = (output << 8) | bytes[i];
            }
            // Convert to signed, based on value size
            if (output > Math.pow(2, 8 * bytes.length - 1)) {
                output -= Math.pow(2, 8 * bytes.length);
            }
            return output;
        }
        if (data_type === "bool") {
            return !(bytes[0] === 0);
        }
        if (data_type === "hexstring") {
            return toHexString(bytes);
        }
        // Incorrect data type
        return null;
    }

    function decode_field(chunk, start_bit, end_bit, data_type) {
        var chunk_size = chunk.length;
        if (end_bit >= chunk_size * 8) {
            return null; // Error: exceeding boundaries of the chunk
        }
        if (end_bit < start_bit) {
            return null; // Error: invalid input
        }
        var arr = extract_bytes(chunk, start_bit, end_bit);
        return apply_data_type(arr, data_type);
    }

    if (port === 32) {
        bytes = slice(bytes, 2, bytes.length);
        port = 10;
    }

    var decoded_data = {};
    var decoder = [];

    if (port === 10) {
        decoder = [
            {
                key: [0x03, 0x67],
                fn: function (arg) {
                    decoded_data.ambient_temperature = decode_field(arg, 0, 15, "signed") * 0.1;
                    decoded_data.ambient_temperature = Math.round(decoded_data.ambient_temperature * 10) / 10
                    return 2;
                }
            },
            {
                key: [0x04, 0x68],
                fn: function (arg) {
                    decoded_data.relative_humidity = decode_field(arg, 0, 7, "unsigned") * 0.5;
                    return 1;
                }
            },
            {
                key: [0x0B, 0x67],
                fn: function (arg) {
                    decoded_data.mcu_temperature = decode_field(arg, 0, 15, "signed") * 0.1;
                    return 2;
                }
            },
            {
                key: [0x0F, 0x04],
                fn: function (arg) {
                    decoded_data.extconnector_count = decode_field(arg, 0, 15, "unsigned");
                    return 2;
                }
            },
            {
                key: [0x0E, 0x00],
                fn: function (arg) {
                    decoded_data.extconnector_state = decode_field(arg, 0, 7, "unsigned");
                    return 1;
                }
            },
            {
                key: [0x00, 0xFF],
                fn: function (arg) {
                    decoded_data.battery_voltage = decode_field(arg, 0, 15, "signed") * 0.01;
                    return 2;
                }
            },
        ]
    }
    if (port === 100) {
        decoder = [
            {
                key: [0x00],
                fn: function (arg) {
                    decoded_data.device_eui = decode_field(arg, 0, 63, "hexstring");
                    return 8;
                }
            },
            {
                key: [0x01],
                fn: function (arg) {
                    decoded_data.app_eui = decode_field(arg, 0, 63, "hexstring");
                    return 8;
                }
            },
            {
                key: [0x02],
                fn: function (arg) {
                    decoded_data.app_key = decode_field(arg, 0, 127, "hexstring");
                    return 16;
                }
            },
            {
                key: [0x03],
                fn: function (arg) {
                    decoded_data.device_address = decode_field(arg, 0, 31, "hexstring");
                    return 4;
                }
            },
            {
                key: [0x04],
                fn: function (arg) {
                    decoded_data.network_session_key = decode_field(arg, 0, 127, "hexstring");
                    return 16;
                }
            },
            {
                key: [0x05],
                fn: function (arg) {
                    decoded_data.app_session_key = decode_field(arg, 0, 127, "hexstring");
                    return 16;
                }
            },
            {
                key: [0x10],
                fn: function (arg) {
                    decoded_data.loramac_join_mode = decode_field(arg, 7, 7, "unsigned");
                    return 2;
                }
            },
            {
                key: [0x11],
                fn: function (arg) {
                    decoded_data['loramac_opts.confirm_mode'] = decode_field(arg, 8, 8, "unsigned");
                    decoded_data['loramac_opts.sync_word'] = decode_field(arg, 9, 9, "unsigned");
                    decoded_data['loramac_opts.duty_cycle'] = decode_field(arg, 10, 10, "unsigned");
                    decoded_data['loramac_opts.adr'] = decode_field(arg, 11, 11, "unsigned");
                    return 2;
                }
            },
            {
                key: [0x12],
                fn: function (arg) {
                    decoded_data['loramac_dr_tx.dr_number'] = decode_field(arg, 0, 3, "unsigned");
                    decoded_data['loramac_dr_tx.tx_power_number'] = decode_field(arg, 8, 11, "unsigned");
                    return 2;
                }
            },
            {
                key: [0x13],
                fn: function (arg) {
                    decoded_data['loramac_rx2.frequency'] = decode_field(arg, 0, 31, "unsigned");
                    decoded_data['loramac_rx2.dr_number'] = decode_field(arg, 32, 39, "unsigned");
                    return 5;
                }
            },
            {
                key: [0x20],
                fn: function (arg) {
                    decoded_data.seconds_per_core_tick = decode_field(arg, 0, 31, "unsigned");
                    return 4;
                }
            },
            {
                key: [0x21],
                fn: function (arg) {
                    decoded_data.tick_per_battery = decode_field(arg, 0, 15, "unsigned");
                    return 2;
                }
            },
            {
                key: [0x24],
                fn: function (arg) {
                    decoded_data.tick_per_accelerometer = decode_field(arg, 0, 15, "unsigned");
                    return 2;
                }
            },
            {
                key: [0x25],
                fn: function (arg) {
                    decoded_data.tick_per_ble_default = decode_field(arg, 0, 15, "unsigned");
                    return 2;
                }
            },
            {
                key: [0x26],
                fn: function (arg) {
                    decoded_data.tick_per_ble_stillness = decode_field(arg, 0, 15, "unsigned");
                    return 2;
                }
            },
            {
                key: [0x27],
                fn: function (arg) {
                    decoded_data.tick_per_ble_mobility = decode_field(arg, 0, 15, "unsigned");
                    return 2;
                }
            },
            {
                key: [0x28],
                fn: function (arg) {
                    decoded_data.tick_per_temperature = decode_field(arg, 0, 15, "unsigned");
                    return 2;
                }
            },
            {
                key: [0x2A],
                fn: function (arg) {
                    decoded_data['mode.reed_event_type'] = decode_field(arg, 7, 7, "unsigned");
                    decoded_data['mode.battery_voltage_report'] = decode_field(arg, 8, 8, "unsigned");
                    decoded_data['mode.acceleration_vector_report'] = decode_field(arg, 9, 9, "unsigned");
                    decoded_data['mode.temperature_report'] = decode_field(arg, 10, 10, "unsigned");
                    decoded_data['mode.ble_report'] = decode_field(arg, 11, 11, "unsigned")
                    return 2;
                }
            },
            {
                key: [0x2B],
                fn: function (arg) {
                    decoded_data['event_type1.m_value'] = decode_field(arg, 0, 3, "unsigned");
                    decoded_data['event_type1.n_value'] = decode_field(arg, 4, 7, "unsigned");
                    return 1;
                }
            },
            {
                key: [0x2C],
                fn: function (arg) {
                    decoded_data['event_type2.t_value'] = decode_field(arg, 0, 3, "unsigned");
                    return 1;
                }
            },
            {
                key: [0x40],
                fn: function (arg) {
                    decoded_data['accelerometer.xaxis_enabled'] = decode_field(arg, 0, 0, "unsigned");
                    decoded_data['accelerometer.yaxis_enabled'] = decode_field(arg, 1, 1, "unsigned");
                    decoded_data['accelerometer.zaxis_enabled'] = decode_field(arg, 2, 2, "unsigned");
                    return 1;
                }
            },
            {
                key: [0x41],
                fn: function (arg) {
                    //}
                    decoded_data['sensitivity.accelerometer_sample_rate'] = decode_field(arg, 0, 2, "unsigned") * 1;
                    switch (decoded_data['sensitivity.accelerometer_sample_rate']) {
                        case 1:
                            decoded_data['sensitivity.accelerometer_sample_rate'] = 1;
                            break;
                        case 2:
                            decoded_data['sensitivity.accelerometer_sample_rate'] = 10;
                            break;
                        case 3:
                            decoded_data['sensitivity.accelerometer_sample_rate'] = 25;
                            break;
                        case 4:
                            decoded_data['sensitivity.accelerometer_sample_rate'] = 50;
                            break;
                        case 5:
                            decoded_data['sensitivity.accelerometer_sample_rate'] = 100;
                            break;
                        case 6:
                            decoded_data['sensitivity.accelerometer_sample_rate'] = 200;
                            break;
                        case 7:
                            decoded_data['sensitivity.accelerometer_sample_rate'] = 400;
                            break;
                        default: // invalid value
                            decoded_data['sensitivity.accelerometer_sample_rate'] = 0;
                            break;
                    }

                    decoded_data['sensitivity.accelerometer_measurement_range'] = decode_field(arg, 4, 5, "unsigned") * 1;
                    switch (decoded_data['decoded_data.sensitivity.accelerometer_measurement_range']) {
                        case 0:
                            decoded_data['sensitivity.accelerometer_measurement_range'] = 2;
                            break;
                        case 1:
                            decoded_data['sensitivity.accelerometer_measurement_range'] = 4;
                            break;
                        case 2:
                            decoded_data['sensitivity.accelerometer_measurement_range'] = 8;
                            break;
                        case 3:
                            decoded_data['sensitivity.accelerometer_measurement_range'] = 16;
                            break;
                        default:
                            decoded_data['sensitivity.accelerometer_measurement_range'] = 0;
                    }
                    return 1;
                }
            },
            {
                key: [0x42],
                fn: function (arg) {
                    decoded_data.acceleration_alarm_threshold_count = decode_field(arg, 0, 15, "unsigned");
                    return 2;
                }
            },
            {
                key: [0x43],
                fn: function (arg) {
                    decoded_data.acceleration_alarm_threshold_period = decode_field(arg, 0, 15, "unsigned");
                    return 2;
                }
            },
            {
                key: [0x44],
                fn: function (arg) {
                    decoded_data.acceleration_alarm_threshold = decode_field(arg, 0, 15, "unsigned") * 0.001;
                    return 2;
                }
            },
            {
                key: [0x45],
                fn: function (arg) {
                    decoded_data.acceleration_alarm_grace_period = decode_field(arg, 0, 15, "unsigned");
                    return 2;
                }
            },
            {
                key: [0x46],
                fn: function (arg) {
                    decoded_data['accelerometer_tx.report_periodic_enabled'] = decode_field(arg, 0, 0, "unsigned");
                    decoded_data['accelerometer_tx.report_alarm_enabled'] = decode_field(arg, 1, 1, "unsigned");
                    return 1;
                }
            },
            {
                key: [0x50],
                fn: function (arg) {
                    decoded_data.ble_mode = decode_field(arg, 7, 7, "unsigned");
                    return 1;
                }
            },
            {
                key: [0x51],
                fn: function (arg) {
                    decoded_data.ble_scan_interval = decode_field(arg, 0, 15, "unsigned") * 0.001;
                    return 2;
                }
            },
            {
                key: [0x52],
                fn: function (arg) {
                    decoded_data.ble_scan_window = decode_field(arg, 0, 15, "unsigned") * 0.001;
                    return 2;
                }
            },
            {
                key: [0x53],
                fn: function (arg) {
                    decoded_data.ble_scan_duration = decode_field(arg, 0, 15, "unsigned");
                    return 2;
                }
            },
            {
                key: [0x54],
                fn: function (arg) {
                    decoded_data.ble_reported_devices = decode_field(arg, 0, 7, "unsigned");
                    return 1;
                }
            },
            {
                key: [0x60],
                fn: function (arg) {
                    decoded_data.temperature_sample_period_idle = decode_field(arg, 0, 31, "unsigned");
                    return 4;
                }
            },
            {
                key: [0x61],
                fn: function (arg) {
                    decoded_data.temperature_sample_period_active = decode_field(arg, 0, 31, "unsigned");
                    return 4;
                }
            },
            {
                key: [0x62],
                fn: function (arg) {
                    decoded_data['temperature_threshold.high'] = decode_field(arg, 0, 7, "unsigned");
                    decoded_data['temperature_threshold.low'] = decode_field(arg, 8, 15, "unsigned");
                    return 2;
                }
            },
            {
                key: [0x63],
                fn: function (arg) {
                    decoded_data.temperature_threshold_enabled = decode_field(arg, 0, 0, "unsigned");
                    return 1;
                }
            },
            {
                key: [0x71],
                fn: function (arg) {
                    decoded_data['firmware_version.app_major_version'] = decode_field(arg, 0, 7, "unsigned");
                    decoded_data['firmware_version.app_minor_version'] = decode_field(arg, 8, 15, "unsigned");
                    decoded_data['firmware_version.app_revision'] = decode_field(arg, 16, 23, "unsigned");
                    decoded_data['firmware_version.loramac_major_version'] = decode_field(arg, 24, 31, "unsigned");
                    decoded_data['firmware_version.loramac_minor_version'] = decode_field(arg, 32, 39, "unsigned");
                    decoded_data['firmware_version.loramac_revision'] = decode_field(arg, 40, 47, "unsigned");
                    decoded_data['firmware_version.region'] = decode_field(arg, 48, 55, "unsigned");
                    return 7;
                }
            }
        ]
    }

    if (port === 25) {
        decoder = [
            {
                key: [0x0A],
                fn: function (arg) {
                    // RSSI to beacons
                    var count = 0;
                    for (var i = 0; i < arg.length * 8; i += 7 * 8) {
                        var dev_id = decode_field(arg, i, i + 6 * 8 - 1, "hexstring");
                        decoded_data[dev_id] = decode_field(arg, i + 6 * 8, i + 7 * 8 - 1, "signed");
                        count += 7;
                    }
                    return count;
                }
            }
        ]
    }

    bytes = convertToUint8Array(bytes);
    decoded_data['raw'] = JSON.stringify(byteToArray(bytes));
    decoded_data['port'] = port;

    for (var bytes_left = bytes.length; bytes_left > 0;) {
        var found = false;
        for (var i = 0; i < decoder.length; i++) {
            var item = decoder[i];
            var key = item.key;
            var keylen = key.length;
            var header = slice(bytes, 0, keylen);
            // Header in the data matches to what we expect
            if (is_equal(header, key)) {
                var f = item.fn;
                var consumed = f(slice(bytes, keylen, bytes.length)) + keylen;
                bytes_left -= consumed;
                bytes = slice(bytes, consumed, bytes.length);
                found = true;
                break;
            }
        }
        if (found) {
            continue;
        }
        // Unable to decode -- headers are not as expected, send raw payload to the application!
        decoded_data = {};
        decoded_data['raw'] = JSON.stringify(byteToArray(bytes));
        decoded_data['port'] = port;
        return decoded_data;
    }

    // Converts value to unsigned
    function to_uint(x) {
        return x >>> 0;
    }

    // Checks if two arrays are equal
    function is_equal(arr1, arr2) {
        if (arr1.length != arr2.length) {
            return false;
        }
        for (var i = 0; i != arr1.length; i++) {
            if (arr1[i] != arr2[i]) {
                return false;
            }
        }
        return true;
    }

    function byteToArray(byteArray) {
        var arr = [];
        for (var i = 0; i < byteArray.length; i++) {
            arr.push(byteArray[i]);
        }
        return arr;
    }

    function convertToUint8Array(byteArray) {
        var arr = [];
        for (var i = 0; i < byteArray.length; i++) {
            arr.push(to_uint(byteArray[i]) & 0xff);
        }
        return arr;
    }

    function toHexString(byteArray) {
        var arr = [];
        for (var i = 0; i < byteArray.length; ++i) {
            arr.push(('0' + (byteArray[i] & 0xFF).toString(16)).slice(-2));
        }
        return arr.join('');
    }

    return decoded_data;
}

module.exports = Decoder;