function log(s) {
    print(s);
}

function is_equal(buf1, buf2) {
    if (buf1.length != buf2.length) return false;
    for (var i = 0; i != buf1.length; i++) {
        if (buf1[i] != buf2[i]) return false;
    }
    return true;
}

function encode_data_test_sensor_mode() {
    data = {"lorawan_join_mode": {"access": "write", "value": 0}};
    encoded = Encoder(data);
    if (is_equal(encoded.bytes, new Uint8Array([144, 0, 0]))) {
        log("test sensor_mode passed");
    } else {
        throw "test sensor_mode failed -- Expected: [144,0,0], Actual: [" + encoded.bytes + "]";
    }
    return encoded;
}

function encode_data_test1_loramac_opts() {
    loramac_confirm_mode = 0;
    loramac_sync_word = 0;
    loramac_duty_cycle = 0;
    loramac_adr = 1;
    data = {"loramac_opts": {"access": "write",
            "value": {
                "loramac_confirm_mode": loramac_confirm_mode,
                "loramac_sync_word": loramac_sync_word,
                "loramac_duty_cycle": loramac_duty_cycle,
                "loramac_adr": loramac_adr
            }
        }
    };
    encoded = Encoder(data);
    if (is_equal(encoded.bytes, new Uint8Array([145, 0, 8]))) {
        log("test loramac_opts passed");
    } else {
        throw "test loramac_opts failed -- Expected: [145,0,8], Actual: [" + encoded.bytes + "]";
    }
    return encoded;
}

function encode_data_test_application_data() {
    data = {"payload": {"value": "CQo="}};
    encoded = Encoder(data);
    if (is_equal(encoded.bytes, new Uint8Array([9, 10]))) {
        log("test application_data passed");
    } else {
        throw "test application_data failed -- Expected: [9,10], Actual: [" + encoded.bytes + "]";
    }
    return encoded;
}

//-------------------- TEST INVOCATION ----------------------------------------------------------
encode_data_test_sensor_mode();
encode_data_test1_loramac_opts();
encode_data_test_application_data();