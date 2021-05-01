function decode(data) { //data - Array of bytes. Base64 to Array decoder for ECMAScript 6 is commented.
//You will need a different solution if you are using ECMAScript 5. An ES5 compatible decoder is on our road map.

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
        output = 0;
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
            if (output > Math.pow(2, 8*bytes.length-1))
                output -= Math.pow(2, 8*bytes.length);


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
        chunk_size = chunk.length;
        if (end_bit >= chunk_size * 8) {
            return null; // Error: exceeding boundaries of the chunk
        }

        if (end_bit < start_bit) {
            return null; // Error: invalid input
        }

        arr = extract_bytes(chunk, start_bit, end_bit);
        return apply_data_type(arr, data_type);
    }

    decoded_data = {};
    decoder = [];


    if (port === 10) {
        decoder = [
            {
                key: [0x00, 0xFF],
                fn: function(arg) {
                    // Battery Voltage
                    decoded_data.battery_voltage = decode_field(arg, 0, 7, "unsigned")*0.01;
                    return 1;
                }
            },
            {
                key: [0x01, 0x04],
                fn: function(arg) {
                    // Soil Moisture Content
                    decoded_data.soil_moisture_percentage = decode_field(arg, 0, 15, "unsigned")*0.01;
                    return 2;
                }
            },
            {
                key: [0x02, 0x02],
                fn: function(arg) {
                    // Soil Temperature
                    decoded_data.soil_temperature = decode_field(arg, 0, 15, "unsigned")*0.01;
                    return 2;
                }
            },
          {
                key: [0x05, 0x04],
                fn: function(arg) {
                    // Soil Watermark 1
                    decoded_data.soil_watermark_1 = decode_field(arg, 0, 15, "unsigned")*0.00001;
                    return 2;
                }
            },
            {
                key: [0x06, 0x04],
                fn: function(arg) {
                    // Soil Watermark 2
                    decoded_data.soil_watermark_2 = decode_field(arg, 0, 15, "unsigned")*0.00001;
                    return 2;
                }
            },
            {
                key: [0x09, 0x65],
                fn: function(arg) {
                    // Ambient Light Levels
                    decoded_data.ambient_light = decode_field(arg, 0, 15, "unsigned");
                    return 2;
                }
            },
            {
                key: [0x09, 0x00],
                fn: function(arg) {
                    // Ambient Light Alarm
                    decoded_data.ambient_light_alarm = decode_field(arg, 0, 7, "bool");
                    return 1;
                }
            },
            {
                key: [0x0A, 0x71],
                fn: function(arg) {
                    // Impact Magnitude
                    decoded_data.acceleration_x = decode_field(arg, 0, 15, "signed")*0.001;
                    decoded_data.acceleration_y = decode_field(arg, 16, 31, "signed")*0.001;
                    decoded_data.acceleration_z = decode_field(arg, 32, 47, "signed")*0.001;
                    return 6;
                }
            },
            {
                key: [0x0A, 0x00],
                fn: function(arg) {
                    // Impact Alarm
                    decoded_data.impact_alarm = decode_field(arg, 0, 7, "bool");
                    return 1;
                }
            },
            {
                key: [0x0B, 0x67],
                fn: function(arg) {
                    // Ambient Temperature
                    decoded_data.ambient_temperature = decode_field(arg, 0, 15, "unsigned")*0.1;
                    return 2;
                }
            },
            {
                key: [0x0B, 0x68],
                fn: function(arg) {
                    // Ambient Relative Humidity
                    decoded_data.ambient_humidity = parseFloat((decode_field(arg, 0, 7, "unsigned")*0.5).toFixed(4));
                    return 1;
                }
            },
            {
                key: [0x0C, 0x67],
                fn: function(arg) {
                    // MCU temperature
                    decoded_data.mcu_temperature = decode_field(arg, 0, 7, "signed")*0.01;
                    return 1;
                }
            }
        ]
    }
  
    decoded_data['raw'] = JSON.stringify(byteToArray(data));
    decoded_data['port'] = port;

    for (var bytes_left = data.length; bytes_left > 0; ) {
        var found = false;
        for (var i = 0; i < decoder.length; i++) {
            var item = decoder[i];
            var key = item.key;
            var keylen = key.length;
            header = data.slice(0, keylen);
            // Header in the data matches to what we expect
            if (is_equal(header, key)) {
                var f = item.fn;
                consumed = f(data.slice(keylen, data.length)) + keylen;
                bytes_left -= consumed;
                data = data.slice(consumed, data.length);
                found = true;
                break;
            }
        }
        if (found) {
            continue;
        }
        // No header located, abort
        return decoded_data;
    }

    return decoded_data;
}

// Converts value to unsigned
function to_uint(x) {
    return x >>> 0;
}

// Checks if two arrays are equal
function is_equal(arr1, arr2) {
    if (arr1.length != arr2.length) return false;
    for (var i = 0 ; i != arr1.length; i++) {
        if (arr1[i] != arr2[i]) return false;
    }
    return true;
};

function byteToArray(byteArray) {
    arr = [];
    for(var i = 0; i < byteArray.length; i++) {
        arr.push(byteArray[i]);
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
