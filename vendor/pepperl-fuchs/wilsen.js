'use strict';

const LoRaMessgeType = {
    0: 'Unconfirmed',
    1: 'Confirmed'
};
const SonicBeamWidth = {
    254: 'Small',
    253: 'Medium',
    252: 'Wide',
    55: 'User-defined',
};
const SonicBurstLength = {
    5: 'Normal',
    3: 'Short',
    16: 'Very short',
};
const SonicTransmittingPower = {
    63: 'High',
    40: 'Medium',
    12: 'Low'
};
const SonicSensitivity = {
    63: 'Maximum',
    51: 'Very high',
    48: 'High',
    38: 'Medium',
    27: 'Low',
    15: 'Minimum',
};
const SonicEvaluationMethod = {
    1: 'Average value'
};
const SonicApplicationFilter = {
    1: 'Container filling'
};

function decodeUplink(input) {
    var hexStr = byte2HexString(input.bytes);
    var obj = payloadParser(hexStr);

    return {
        data: obj,
        warnings: [],
        errors: []
    };
}

/**
 * This is the function to create a payload object by decoding hex string
 * @param {String} hexStr
 * @return {Object}
 */
function payloadParser(hexStr) {
    var len;
    var sID;
    var obj = {};

    obj.payload = hexStr;
    for (var i = 0; i < hexStr.length; i = i + 2) {
        len = parseInt(hexStr.substr(i, 2), 16);
        sID = hexStr.substr(i + 2, 4);

        if (sID == '0201') { // 'Temperature'
            obj.temp = parseFloat(hex2float(hexStr.substr(i + 6, 8)).toFixed(1)); // float
        }
        else if (sID == '0B01') { // 'Proximity'
            obj.proxx = parseInt(hexStr.substr(i + 6, 4), 16); // uint16
        }
        else if (sID == '0B02') { // 'Proximity in mm'
            obj.proxx_mm = parseInt(hexStr.substr(i + 6, 4), 16); // uint16
        }
        else if (sID == '0B06') { // 'Fillinglevel'
            obj.fillinglvl = parseInt(hexStr.substr(i + 6, 2), 16); // uint8
        }
        else if (sID == '0B07') { // 'Amplitude'
            obj.amplitude = parseInt(hexStr.substr(i + 6, 2), 16); // uint8
        }
        else if (sID == '0C01') { // 'Valve'
            obj.valve = parseInt(hexStr.substr(i + 6, 2), 16); // uint8
            obj.valveChecksum = parseInt(hexStr.substr(i + 8, 2), 16); // uint8
        }
        else if (sID == '0C02') { // 'Valve Status'
            obj.valve_status = parseInt(hexStr.substr(i + 6, 2), 16); // uint8
        }
        else if (sID == '0C03') { // 'Sensor Details'
            obj.sensor_details = parseInt(hexStr.substr(i + 6, 4), 16); // uint16
        }
        else if (sID == '0C04') { // 'Sensor Status'
            obj.sensor_status = parseInt(hexStr.substr(i + 6, 2), 16); // uint8
        }
        else if (sID == '2A25') { // 'Serial Number'
            obj.serial_nr = hex2string(hexStr.substr(i + 6, 28));
        }
        else if (sID == '3101') { // 'LoRa Transmission Counter'
            obj.lora_count = parseInt(hexStr.substr(i + 6, 4), 16); // uint16
        }
        else if (sID == '3102') { // 'GPS Acquisition Counter'
            obj.gps_count = parseInt(hexStr.substr(i + 6, 4), 16); // uint16
        }
        else if (sID == '3103') { // 'US Measurement Counter'
            obj.us_sensor_count = parseInt(hexStr.substr(i + 6, 8), 16); // uint32
        }
        else if (sID == '5001') { // 'GPS Latitude'
            obj.latitude = parseFloat((number2Int32(parseInt(hexStr.substr(i + 6, 8), 16)) / 1000000).toFixed(6));
        }
        else if (sID == '5002') { // 'GPS Longitude'
            obj.longitude = parseFloat((number2Int32(parseInt(hexStr.substr(i + 6, 8), 16)) / 1000000).toFixed(6));
        }
        else if (sID == '5101') { // 'Battery'
            if (parseInt(hexStr.substr(i + 4, 2), 16) == 1) {
                obj.battery_vol = parseInt(hexStr.substr(i + 6, 2), 16) / 10; // uint8
            }
        }

        // Downlink ACK: Device Config
        else if (sID == 'F101') {
            obj.ble_enable = (parseInt(hexStr.substr(i + 6, 2), 16) == 1);
        }
        else if (sID == 'F102') {
            obj.device_name = hex2string(hexStr.substr(i + 6, 32));
        }
        else if (sID == 'F103') {
            obj.reset_counter = 'done';
        }
        else if (sID == 'F104') {
            obj.factory_reset = 'done';
        }
        else if (sID == 'F105') {
            obj.change_password = 'done';
        }
        else if (sID == 'F108') {
            obj.device_name_1 = hex2string(hexStr.substr(i + 6, 16));
        }
        else if (sID == 'F109') {
            obj.device_name_2 = hex2string(hexStr.substr(i + 6, 16));
        }     
 
        // Downlink ACK: GPS Config
        else if (sID == 'F201') {
            obj.gps_acquisition_active = (parseInt(hexStr.substr(i + 6, 2), 16) == 1);
        }
        else if (sID == 'F202') {
            obj.gps_acquisition_interval = parseInt(hexStr.substr(i + 6, 8), 16);
        }
        else if (sID == 'F203') {
            obj.gps_next_acquisition = parseInt(hexStr.substr(i + 6, 8), 16);
        }

        // Downlink ACK: LoRa Config
        else if (sID == 'F301') {
            const messageTypeIndex = parseInt(hexStr.substr(i + 6, 2), 16);
            obj.lora_message_type = (LoRaMessgeType[messageTypeIndex] ? LoRaMessgeType[messageTypeIndex] : 'Invalid');
        }
        else if (sID == 'F302') {
            obj.lora_number_of_transmission = parseInt(hexStr.substr(i + 6, 2), 16);
        }
        else if (sID == 'F303') {
            const spreadingFactor = parseInt(hexStr.substr(i + 6, 2), 16);
            obj.lora_spreading_factor = (spreadingFactor == 255 ? 'ADR' : spreadingFactor);
        }
        else if (sID == 'F304') {
            obj.lora_data_transmission_active = (parseInt(hexStr.substr(i + 6, 2), 16) == 1);
        }
        else if (sID == 'F305') {
            obj.lora_transmission_interval = parseInt(hexStr.substr(i + 6, 8), 16);
        }
        else if (sID == 'F306') {
            obj.lora_next_transmission = parseInt(hexStr.substr(i + 6, 8), 16);
        }
        else if (sID == 'F307') {
            obj.lora_downlink_config = (parseInt(hexStr.substr(i + 6, 2), 16) == 1);
        }
        else if (sID == 'F308') {
            obj.lora_downlink_config_ack = (parseInt(hexStr.substr(i + 6, 2), 16) == 1);
        }
        else if (sID == 'F309') {
            obj.lora_sub_band = parseInt(hexStr.substr(i + 6, 2), 16);
        }

        // Downlink ACK: UltraSonic Config
        else if (sID == 'F401') {
            const SonicBeamWidthVal = parseInt(hexStr.substr(i + 6, 2), 16);
            obj.us_beam_width = (SonicBeamWidth[SonicBeamWidthVal] ? SonicBeamWidth[SonicBeamWidthVal] : 'Invalid');
        }
        else if (sID == 'F402') {
            const SonicBurstLengthVal = parseInt(hexStr.substr(i + 6, 2), 16);
            obj.us_user_defined_burst_length = (SonicBurstLength[SonicBurstLengthVal] ? SonicBurstLength[SonicBurstLengthVal] : SonicBurstLengthVal);
        }
        else if (sID == 'F403') {
            const SonicTransmittingPowerVal = parseInt(hexStr.substr(i + 6, 2), 16);
            obj.us_user_defined_transmitting_power = (SonicTransmittingPower[SonicTransmittingPowerVal] ? SonicTransmittingPower[SonicTransmittingPowerVal] : SonicTransmittingPowerVal);
        }
        else if (sID == 'F404') {
            const SonicSensitivityVal = parseInt(hexStr.substr(i + 6, 2), 16);
            obj.us_user_defined_sensitivity = (SonicSensitivity[SonicSensitivityVal] ? SonicSensitivity[SonicSensitivityVal] : SonicSensitivityVal);
        }
        else if (sID == 'F405') {
            obj.us_full_distance = parseInt(hexStr.substr(i + 6, 4), 16);
        }
        else if (sID == 'F406') {
            obj.us_empty_distance = parseInt(hexStr.substr(i + 6, 4), 16);
        }
        else if (sID == 'F407') {
            obj.us_measurement_sequence_active = (parseInt(hexStr.substr(i + 6, 2), 16) == 1);
        }
        else if (sID == 'F408') {
            const evaluationMethodVal = parseInt(hexStr.substr(i + 6, 2), 16);
            obj.us_evaluation_method = (SonicEvaluationMethod[evaluationMethodVal] ? SonicEvaluationMethod[evaluationMethodVal] : 'Invalid');
        }
        else if (sID == 'F409') {
            obj.us_measurements_per_sequence = parseInt(hexStr.substr(i + 6, 2), 16);
        }
        else if (sID == 'F40A') {
            obj.us_at_intervals_of = parseInt(hexStr.substr(i + 6, 4), 16);
        }
        else if (sID == 'F40B') {
            obj.us_application_filter_active = (parseInt(hexStr.substr(i + 6, 2), 16) == 1);
        }
        else if (sID == 'F40C') {
            const filterVal = parseInt(hexStr.substr(i + 6, 2), 16);
            obj.us_post_processing_filter = (SonicApplicationFilter[filterVal] ? SonicApplicationFilter[filterVal] : 'Invalid');
        }
        else if (sID == 'F40D') {
            obj.us_additional_measurement = parseInt(hexStr.substr(i + 6, 2), 16);
        }

        // Downlink ACK: Device Information
        else if (sID == 'F501') {
            obj.part_number = parseInt(hexStr.substr(i + 6, 8), 16);
        }
        else if (sID == 'F502') {
            const major = parseInt(hexStr.substr(i + 6, 4), 16);
            const minor = parseInt(hexStr.substr(i + 10, 4), 16);
            const patch = parseInt(hexStr.substr(i + 14, 4), 16);
            obj.hardware_revision = major + '.' + minor + '.' + patch;
        }
        else if (sID == 'F503') {
            const major = parseInt(hexStr.substr(i + 6, 4), 16);
            const minor = parseInt(hexStr.substr(i + 10, 4), 16);
            const patch = parseInt(hexStr.substr(i + 14, 4), 16);
            obj.firmware_revision = major + '.' + minor + '.' + patch;
        }

        i = i + (len * 2);
    }
    return obj;
}

function byte2HexString(bytes) {
    var retHexString = '';
    for (var i_b = 0; i_b < bytes.length; i_b++) {
        retHexString = retHexString.concat(('0' + (Number(bytes[i_b]).toString(16))).slice(-2).toUpperCase());
    }
    return retHexString;
}

function number2Int32(value) {
    if (value > 0x7FFFFFFF) {
        return (value - 0x100000000);
    }
    return value;
}

function hex2string(hexx) {
    var hex = hexx.toString();
    var str = '';
    for (var j = 0;
        (j < hex.length && hex.substr(j, 2) !== '00'); j += 2)
        str += String.fromCharCode(parseInt(hex.substr(j, 2), 16));
    return str;
}

function hex2float(hexstring) {
    var bytes = [];
    bytes[0] = parseInt(hexstring.substr(0, 2), 16);
    bytes[1] = parseInt(hexstring.substr(2, 2), 16);
    bytes[2] = parseInt(hexstring.substr(4, 2), 16);
    bytes[3] = parseInt(hexstring.substr(6, 2), 16);
    return decodeFloat(bytes, 1, 8, 23, -126, 127, false);
}

function decodeFloat(bytes, signBits, exponentBits, fractionBits, eMin, eMax, littleEndian) {
    var binary = '';
    for (var z = 0, l = bytes.length; z < l; z += 1) {
        var bits = bytes[z].toString(2);
        while (bits.length < 8) {
            bits = '0' + bits;
        }
        if (littleEndian) {
            binary = bits + binary;
        } else {
            binary += bits;
        }
    }
    var sign = (binary.charAt(0) === '1') ? -1 : 1;
    var exponent = parseInt(binary.substr(signBits, exponentBits), 2) - eMax;
    var significandBase = binary.substr(signBits + exponentBits, fractionBits);
    var significandBin = '1' + significandBase;
    var cnt = 0;
    var val = 1;
    var significand = 0;
    if (exponent == -eMax) {
        if (significandBase.indexOf('1') === -1)
            return 0;
        else {
            exponent = eMin;
            significandBin = '0' + significandBase;
        }
    }
    while (cnt < significandBin.length) {
        significand += val * parseInt(significandBin.charAt(cnt));
        val = val / 2;
        cnt += 1;
    }
    return sign * significand * Math.pow(2, exponent);
}
