function Decoder(bytes, port) { //bytes - Array of bytes.

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

    var decoded_data = {};
    var decoder = [];

    if (port === 10) {
        decoder = [
            {
                key: [0x00, 0xFF],
                fn: function (arg) {
                    decoded_data.battery_voltage = decode_field(arg, 0, 15, "signed") * 0.01;
                    return 2;
                }
            },
            {
                key: [0x01, 0x00],
                fn: function (arg) {
                    decoded_data.reed_state = decode_field(arg, 0, 7, "unsigned");
                    return 1;
                }
            },
            {
                key: [0x02, 0x00],
                fn: function (arg) {
                    decoded_data.light_detected = decode_field(arg, 0, 7, "unsigned");
                    return 1;
                }
            },
            {
                key: [0x03, 0x67],
                fn: function (arg) {
                    decoded_data.ambient_temperature = decode_field(arg, 0, 15, "signed") * 0.1;
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
                key: [0x05, 0x02],
                fn: function (arg) {
                    decoded_data.impact_magnitude = decode_field(arg, 0, 15, "unsigned") * 0.001;
                    return 2;
                }
            },
            {
                key: [0x06, 0x00],
                fn: function (arg) {
                    decoded_data.break_in = decode_field(arg, 0, 7, "bool");
                    return 1;
                }
            },
            {
                key: [0x07, 0x71],
                fn: function (arg) {
                    decoded_data['acceleration.xaxis'] = decode_field(arg, 0, 15, "signed") * 0.001;
                    decoded_data['acceleration.yaxis'] = decode_field(arg, 16, 31, "signed") * 0.001;
                    decoded_data['acceleration.zaxis'] = decode_field(arg, 32, 47, "signed") * 0.001;
                    return 6;
                }
            },
            {
                key: [0x08, 0x04],
                fn: function (arg) {
                    decoded_data.reed_count = decode_field(arg, 0, 15, "unsigned");
                    return 2;
                }
            },
            {
                key: [0x09, 0x00],
                fn: function (arg) {
                    decoded_data.moisture = decode_field(arg, 0, 7, "unsigned");
                    return 1;
                }
            },
            {
                key: [0x0A, 0x00],
                fn: function (arg) {
                    decoded_data.motion_event_state = decode_field(arg, 0, 7, "unsigned");
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
                key: [0x0C, 0x00],
                fn: function (arg) {
                    decoded_data.impact_alarm = decode_field(arg, 0, 7, "unsigned");
                    return 1;
                }
            },
            {
                key: [0x0D, 0x04],
                fn: function (arg) {
                    decoded_data.motion_event_count = decode_field(arg, 0, 15, "unsigned");
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
                key: [0x0F, 0x04],
                fn: function (arg) {
                    decoded_data.extconnector_count = decode_field(arg, 0, 15, "unsigned");
                    return 2;
                }
            },
            {
                key: [0x10, 0x02],
                fn: function (arg) {
                    decoded_data.light_intensity = decode_field(arg, 0, 7, "unsigned");
                    return 1;
                }
            },
            {
                key: [0x11, 0x02],
                fn: function (arg) {
                    decoded_data.extconnector_analog = decode_field(arg, 0, 15, "unsigned") * 0.001;
                    return 2;
                }
            }
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
                key: [0x22],
                fn: function (arg) {
                    decoded_data.tick_per_ambient_temperature = decode_field(arg, 0, 15, "unsigned");
                    return 2;
                }
            },
            {
                key: [0x23],
                fn: function (arg) {
                    decoded_data.tick_per_relative_humidity = decode_field(arg, 0, 15, "unsigned");
                    return 2;
                }
            },
            {
                key: [0x24],
                fn: function (arg) {
                    decoded_data.tick_per_reed_switch = decode_field(arg, 0, 15, "unsigned");
                    return 2;
                }
            },
            {
                key: [0x25],
                fn: function (arg) {
                    decoded_data.tick_per_light = decode_field(arg, 0, 15, "unsigned");
                    return 2;
                }
            },
            {
                key: [0x26],
                fn: function (arg) {
                    decoded_data.tick_per_accelerometer = decode_field(arg, 0, 15, "unsigned");
                    return 2;
                }
            },
            {
                key: [0x27],
                fn: function (arg) {
                    decoded_data.tick_per_mcu_temperature = decode_field(arg, 0, 15, "unsigned");
                    return 2;
                }
            },
            {
                key: [0x28],
                fn: function (arg) {
                    decoded_data.tick_per_pir = decode_field(arg, 0, 15, "unsigned");
                    return 2;
                }
            },
            {
                key: [0x29],
                fn: function (arg) {
                    decoded_data.tick_per_external_connector = decode_field(arg, 0, 15, "unsigned");
                    return 2;
                }
            },
            {
                key: [0x2A],
                fn: function (arg) {
                    decoded_data['reed_mode.rising_edge_enabled'] = decode_field(arg, 0, 0, "unsigned");
                    decoded_data['reed_mode.falling_edge_enabled'] = decode_field(arg, 1, 1, "unsigned");
                    return 1;
                }
            },
            {
                key: [0x2B],
                fn: function (arg) {
                    decoded_data.reed_switch_count_threshold = decode_field(arg, 0, 15, "unsigned");
                    return 2;
                }
            },
            {
                key: [0x2C],
                fn: function (arg) {
                    decoded_data['reed_tx.report_state_enabled'] = decode_field(arg, 0, 0, "unsigned");
                    decoded_data['reed_tx.report_count_enabled'] = decode_field(arg, 1, 1, "unsigned");
                    return 1;
                }
            },
            {
                key: [0x2D],
                fn: function (arg) {
                    decoded_data['external_connector.rising_edge_enabled'] = decode_field(arg, 0, 0, "unsigned");
                    decoded_data['external_connector.falling_edge_enabled'] = decode_field(arg, 1, 1, "unsigned");
                    decoded_data['external_connector.mode'] = decode_field(arg, 7, 7, "unsigned");
                    return 1;
                }
            },
            {
                key: [0x2E],
                fn: function (arg) {
                    decoded_data.external_connector_count_threshold = decode_field(arg, 0, 15, "unsigned");
                    return 2;
                }
            },
            {
                key: [0x2F],
                fn: function (arg) {
                    decoded_data['external_connector_tx.report_state_enabled'] = decode_field(arg, 0, 0, "unsigned");
                    decoded_data['external_connector_tx.report_count_enabled'] = decode_field(arg, 1, 1, "unsigned");
                    return 1;
                }
            },
            {
                key: [0x30],
                fn: function (arg) {
                    decoded_data.impact_event_threshold = decode_field(arg, 0, 15, "unsigned") * 0.001;
                    return 2;
                }
            },
            {
                key: [0x31],
                fn: function (arg) {
                    decoded_data.acceleration_event_threshold = decode_field(arg, 0, 15, "unsigned") * 0.001;
                    return 2;
                }
            },
            {
                key: [0x32],
                fn: function (arg) {
                    decoded_data['accelerometer_tx.report_alarm_enabled'] = decode_field(arg, 0, 0, "unsigned");
                    decoded_data['accelerometer_tx.report_magnitude_enabled'] = decode_field(arg, 4, 4, "unsigned");
                    decoded_data['accelerometer_tx.report_vector_enabled'] = decode_field(arg, 5, 5, "unsigned");
                    return 1;
                }
            },
            {
                key: [0x33],
                fn: function (arg) {
                    decoded_data.acceleration_impact_grace_period = decode_field(arg, 0, 15, "unsigned");
                    return 2;
                }
            },
            {
                key: [0x34],
                fn: function (arg) {
                    decoded_data['accelerometer.impact_threshold_enabled'] = decode_field(arg, 0, 0, "unsigned");
                    decoded_data['accelerometer.acceleration_threshold_enabled'] = decode_field(arg, 1, 1, "unsigned");
                    decoded_data['accelerometer.xaxis_enabled'] = decode_field(arg, 4, 4, "unsigned");
                    decoded_data['accelerometer.yaxis_enabled'] = decode_field(arg, 5, 5, "unsigned");
                    decoded_data['accelerometer.zaxis_enabled'] = decode_field(arg, 6, 6, "unsigned");
                    decoded_data['accelerometer.poweron'] = decode_field(arg, 7, 7, "unsigned");
                    return 1;
                }
            },
            {
                key: [0x35],
                fn: function (arg) {
                    //}
                    decoded_data['sensitivity.accelerometer_sample_rate'] = decode_field(arg, 0, 2, "unsigned");
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

                    decoded_data['sensitivity.accelerometer_measurement_range'] = decode_field(arg, 4, 5, "unsigned");
                    switch (decoded_data['sensitivity.accelerometer_measurement_range']) {
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
                key: [0x36],
                fn: function (arg) {
                    decoded_data.impact_alarm_grace_period = decode_field(arg, 0, 15, "unsigned");
                    return 2;
                }
            },
            {
                key: [0x37],
                fn: function (arg) {
                    decoded_data.impact_alarm_threshold_count = decode_field(arg, 0, 15, "unsigned");
                    return 2;
                }
            },
            {
                key: [0x38],
                fn: function (arg) {
                    decoded_data.impact_alarm_threshold_period = decode_field(arg, 0, 15, "unsigned");
                    return 2;
                }
            },
            {
                key: [0x39],
                fn: function (arg) {
                    decoded_data.temperature_relative_humidity_sample_period_idle = decode_field(arg, 0, 31, "unsigned");
                    return 4;
                }
            },
            {
                key: [0x3A],
                fn: function (arg) {
                    decoded_data.temperature_relative_humidity_sample_period_active = decode_field(arg, 0, 31, "unsigned");
                    return 4;
                }
            },
            {
                key: [0x3B],
                fn: function (arg) {
                    decoded_data['ambient_temperature_threshold.high'] = decode_field(arg, 0, 7, "signed");
                    decoded_data['ambient_temperature_threshold.low'] = decode_field(arg, 8, 15, "signed");
                    return 2;
                }
            },
            {
                key: [0x3C],
                fn: function (arg) {
                    decoded_data.ambient_temperature_threshold_enabled = decode_field(arg, 0, 0, "unsigned");
                    return 1;
                }
            },
            {
                key: [0x3D],
                fn: function (arg) {
                    decoded_data['relative_humidity_threshold.low'] = decode_field(arg, 0, 7, "unsigned");
                    decoded_data['relative_humidity_threshold.high'] = decode_field(arg, 8, 15, "unsigned");
                    return 2;
                }
            },
            {
                key: [0x3E],
                fn: function (arg) {
                    decoded_data.relative_humidity_threshold_enabled = decode_field(arg, 0, 0, "unsigned");
                    return 1;
                }
            },
            {
                key: [0x40],
                fn: function (arg) {
                    decoded_data.mcu_temperature_sample_period_idle = decode_field(arg, 0, 31, "unsigned");
                    return 4;
                }
            },
            {
                key: [0x41],
                fn: function (arg) {
                    decoded_data.mcu_temperature_sample_period_active = decode_field(arg, 0, 31, "unsigned");
                    return 4;
                }
            },
            {
                key: [0x42],
                fn: function (arg) {
                    decoded_data['mcu_temperature_threshold.high'] = decode_field(arg, 0, 7, "signed");
                    decoded_data['mcu_temperature_threshold.low'] = decode_field(arg, 8, 15, "signed");
                    return 2;
                }
            },
            {
                key: [0x43],
                fn: function (arg) {
                    decoded_data.mcu_temperature_threshold_enabled = decode_field(arg, 0, 0, "unsigned");
                    return 1;
                }
            },
            {
                key: [0x44],
                fn: function (arg) {
                    decoded_data.analog_sample_period_idle = decode_field(arg, 0, 31, "unsigned");
                    return 4;
                }
            },
            {
                key: [0x45],
                fn: function (arg) {
                    decoded_data.analog_sample_period_active = decode_field(arg, 0, 31, "unsigned");
                    return 4;
                }
            },
            {
                key: [0x46],
                fn: function (arg) {
                    decoded_data['analog_input_threshold.high'] = decode_field(arg, 0, 15, "unsigned") * 0.001;
                    decoded_data['analog_input_threshold.low'] = decode_field(arg, 16, 31, "unsigned") * 0.001;
                    return 4;
                }
            },
            {
                key: [0x47],
                fn: function (arg) {
                    decoded_data.light_sample_period = decode_field(arg, 0, 31, "unsigned");
                    return 4;
                }
            },
            {
                key: [0x48],
                fn: function (arg) {
                    decoded_data['light.threshold'] = decode_field(arg, 0, 5, "unsigned");
                    decoded_data['light.threshold_enabled'] = decode_field(arg, 7, 7, "unsigned") * 1;
                    return 1;
                }
            },
            {
                key: [0x49],
                fn: function (arg) {
                    decoded_data['light_tx.state_reported'] = decode_field(arg, 0, 0, "unsigned");
                    decoded_data['light_tx.intensity_reported'] = decode_field(arg, 1, 1, "unsigned");
                    return 1;
                }
            },
            {
                key: [0x4A],
                fn: function (arg) {
                    decoded_data.analog_input_threshold_enabled = decode_field(arg, 0, 0, "unsigned");
                    return 1;
                }
            },
            {
                key: [0x50],
                fn: function (arg) {
                    decoded_data.pir_grace_period = decode_field(arg, 0, 15, "unsigned");
                    return 2;
                }
            },
            {
                key: [0x51],
                fn: function (arg) {
                    decoded_data.pir_threshold = decode_field(arg, 0, 15, "unsigned");
                    return 2;
                }
            },
            {
                key: [0x52],
                fn: function (arg) {
                    decoded_data.pir_threshold_period = decode_field(arg, 0, 15, "unsigned");
                    return 2;
                }
            },
            {
                key: [0x53],
                fn: function (arg) {
                    decoded_data['pir_mode.motion_count_reported'] = decode_field(arg, 0, 0, "unsigned");
                    decoded_data['pir_mode.motion_state_reported'] = decode_field(arg, 1, 1, "unsigned");
                    decoded_data['pir_mode.event_transmission_enabled'] = decode_field(arg, 6, 6, "unsigned");
                    decoded_data['pir_mode.transducer_enabled'] = decode_field(arg, 7, 7, "unsigned");
                    return 1;
                }
            },
            {
                key: [0x5A],
                fn: function (arg) {
                    //}
                    decoded_data.moisture_sample_period = decode_field(arg, 0, 2, "unsigned");
                    switch (decoded_data.moisture_sample_period) {
                        case 1:
                            decoded_data.moisture_sample_period = 16;
                            break;
                        case 2:
                            decoded_data.moisture_sample_period = 32;
                            break;
                        case 3:
                            decoded_data.moisture_sample_period = 64;
                            break;
                        case 4:
                            decoded_data.moisture_sample_period = 128;
                            break;
                        default:
                            decoded_data.moisture_sample_period = 0;
                    }
                    return 1;
                }
            },
            {
                key: [0x5B],
                fn: function (arg) {
                    decoded_data.moisture_threshold = decode_field(arg, 0, 7, "unsigned");
                    return 1;
                }
            },
            {
                key: [0x5C],
                fn: function (arg) {
                    decoded_data.moisture_sensing_enabled = decode_field(arg, 0, 0, "unsigned");
                    return 1;
                }
            },
            {
                key: [0x5D],
                fn: function (arg) {
                    decoded_data.moisture_caliberation_dry = decode_field(arg, 0, 7, "unsigned");
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