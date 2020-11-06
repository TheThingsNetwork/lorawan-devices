function log(s) {
    print(s);
}

function decode_data_test_temperature_humidity() {
    data = new Int8Array(base64ToHex('A2cACgRoKA=='));
    var decoded = Decoder(data, 10);
    if ((decoded['ambient_temperature'] == 1 && decoded['relative_humidity'] == 20)) {
        log("test humidity passed");
    } else {
        throw "test humidity failed -- Expected: ambient_temperature = 1 and relative_humidity = 20, Actual: ambient_temperature = " + decoded['ambient_temperature'] + " and relative_humidity = " + decoded['relative_humidity'];
    }
    return decoded;
}

function decode_data_test_humidity_reed() {
    data = new Int8Array(base64ToHex('BGgUAQD/CAQABQ=='));
    var decoded = Decoder(data, 10);
    if ((decoded['relative_humidity'] == 10 && decoded['reed_state'] == 0xFF && decoded['reed_count'] == 5)) {
        log("test humidity_reed passed");
    } else {
        throw "test humidity_reed failed -- Expected: relative_humidity = 10 and reed_state = 255 and reed_count = 5, Actual: relative_humidity = " + decoded['relative_humidity'] + " and reed_state = " + decoded['reed_state'] + " and reed_count = " + decoded['reed_count'];
    }
    return decoded;
}

function decode_data_test_extconnector() {
    data = new Int8Array(base64ToHex('DgAADwQAAQ=='));
    var decoded = Decoder(data, 10);
    if ((decoded['extconnector_state'] == 0 && decoded['extconnector_count'] == 1)) {
        log("test extconnector passed");
    } else {
        throw "test extconnector failed -- Expected: extconnector_state = 0 and extconnector_count = 1, Actual: extconnector_state = " + decoded['extconnector_state'] + " and extconnector_count = " + decoded['extconnector_count'];
    }
    return decoded;
}

//------------- TEST INVOCATION --------------------------------------------------------
decode_data_test_temperature_humidity();
decode_data_test_humidity_reed();
decode_data_test_extconnector();