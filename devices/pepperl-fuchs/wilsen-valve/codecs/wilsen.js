'use strict';

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
    const ValveStatus = {
        0: 'Closed',
        1: 'Open',
        2: 'Undefined',
        3: 'Not connected',
        7: 'Not inquired'
    }
    const SensorDetails = {
        0: 'Low',
        1: 'High',
        7: 'Not inquired',
        8: 'Short circuit',
        9: 'Not connected',
        10: 'Invalid current level',
    }
    const ValveOpenSignal = {
        1: 'Sensor 1',
        2: 'Sensor 2'
    };
    const ValveTriggerEventType = {
        1: 'State change',
        2: 'Valve open',
        3: 'Valve closed',
    };
    const NodeOutputLogic = {
        1: 'Normally open',
        2: 'Normally closed'
    };
    const SensorStatus = {
        0: 'No target detected',
        1: 'Target detected',
        7: 'Not inquired',
        8: 'Short circuit',
        9: 'Not connected',
        10: 'Invalid current level',
    }
    const NodeTriggerEventType = {
        1: 'State change',
        2: 'Target detected',
        3: 'No target detected',
    };
    const GPSAccuracyMode = {
        1: 'Eco mode',
        2: 'Precision mode',
    };
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
        else if (sID == '0B08') { // 'Water Body Level'
            obj.water_body_level_mm = parseInt(hexStr.substr(i + 6, 4), 16); // uint16
        }
        else if (sID == '0C01') { // 'Valve'
            obj.valve = parseInt(hexStr.substr(i + 6, 2), 16); // uint8
            obj.valveChecksum = parseInt(hexStr.substr(i + 8, 2), 16); // uint8
        }
        else if (sID == '0C02') { // 'Valve Status'
            obj.valve_status = parseInt(hexStr.substr(i + 6, 2), 16); // uint8
            const valve1Status = obj.valve_status & 0x0F;
            const valve2Status = (obj.valve_status >> 4) & 0x0F;
            obj.valve_1_status = (ValveStatus[valve1Status] ? ValveStatus[valve1Status] : 'Invalid');
            obj.valve_2_status = (ValveStatus[valve2Status] ? ValveStatus[valve2Status] : 'Invalid');
        }
        else if (sID == '0C03') { // 'Sensor Details'
            obj.sensor_details = parseInt(hexStr.substr(i + 6, 4), 16); // uint16
            const sensor1details = obj.sensor_details & 0x000F;
            const sensor2details = (obj.sensor_details >> 4) & 0x000F;
            const sensor3details = (obj.sensor_details >> 8) & 0x000F;
            const sensor4details = (obj.sensor_details >> 12) & 0x000F;
            obj.sensor_1_details = (SensorDetails[sensor1details] ? SensorDetails[sensor1details] : 'Invalid');
            obj.sensor_2_details = (SensorDetails[sensor2details] ? SensorDetails[sensor2details] : 'Invalid');
            obj.sensor_3_details = (SensorDetails[sensor3details] ? SensorDetails[sensor3details] : 'Invalid');
            obj.sensor_4_details = (SensorDetails[sensor4details] ? SensorDetails[sensor4details] : 'Invalid');
        }
        else if (sID == '0C04') { // 'Sensor Status'
            obj.sensor_status = parseInt(hexStr.substr(i + 6, 2), 16); // uint8
            const sensor1Status = obj.sensor_status & 0x0F;
            const sensor2Status = (obj.sensor_status >> 4) & 0x0F;
            obj.sensor_1_status = (SensorStatus[sensor1Status] ? SensorStatus[sensor1Status] : 'Invalid');
            obj.sensor_2_status = (SensorStatus[sensor2Status] ? SensorStatus[sensor2Status] : 'Invalid');
        }
        else if (sID == '2A25') { // 'Serial Number'
            obj.serial_nr = hex2string(hexStr.substr(i + 6, 28));
        }
        else if (sID == '2A26') { // 'Serial Number - 6 bytes uint'
            obj.serial_nr_uint = parseInt(hexStr.substr(i + 6, 12), 16); // uint24
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
        else if (sID == '3104') { // 'Sensor Measurement Counter'
            obj.sensing_count = parseInt(hexStr.substr(i + 6, 8), 16); // uint32
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
            obj.ble_enable = (parseInt(hexStr.substr(i + 6, 2), 16) > 0);
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
            obj.gps_acquisition_active = (parseInt(hexStr.substr(i + 6, 2), 16) > 0);
        }
        else if (sID == 'F202') {
            obj.gps_acquisition_interval = parseInt(hexStr.substr(i + 6, 8), 16);
        }
        else if (sID == 'F203') {
            obj.gps_next_acquisition = parseInt(hexStr.substr(i + 6, 8), 16);
        }
        else if (sID == 'F204') {
            const gpsAccuracyModeIndex = parseInt(hexStr.substr(i + 6, 2), 16);
            obj.gps_accuracy_mode = (GPSAccuracyMode[gpsAccuracyModeIndex] ? GPSAccuracyMode[gpsAccuracyModeIndex] : 'Invalid');
        }
        else if (sID == 'F205') {
            const messageTypeIndex = parseInt(hexStr.substr(i + 6, 2), 16);
            obj.gps_message_type = (LoRaMessgeType[messageTypeIndex] ? LoRaMessgeType[messageTypeIndex] : 'Invalid');
        }
        else if (sID == 'F206') {
            obj.gps_number_of_transmission = parseInt(hexStr.substr(i + 6, 2), 16);
        }
        else if (sID == 'F207') {
            obj.gps_localization = 'triggered';
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
            obj.lora_data_transmission_active = (parseInt(hexStr.substr(i + 6, 2), 16) > 0);
        }
        else if (sID == 'F305') {
            obj.lora_transmission_interval = parseInt(hexStr.substr(i + 6, 8), 16);
        }
        else if (sID == 'F306') {
            obj.lora_next_transmission = parseInt(hexStr.substr(i + 6, 8), 16);
        }
        else if (sID == 'F307') {
            obj.lora_downlink_config = (parseInt(hexStr.substr(i + 6, 2), 16) > 0);
        }
        else if (sID == 'F308') {
            obj.lora_downlink_config_ack = (parseInt(hexStr.substr(i + 6, 2), 16) > 0);
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
            obj.us_measurement_sequence_active = (parseInt(hexStr.substr(i + 6, 2), 16) > 0);
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
            obj.us_application_filter_active = (parseInt(hexStr.substr(i + 6, 2), 16) > 0);
        }
        else if (sID == 'F40C') {
            const filterVal = parseInt(hexStr.substr(i + 6, 2), 16);
            obj.us_post_processing_filter = (SonicApplicationFilter[filterVal] ? SonicApplicationFilter[filterVal] : 'Invalid');
        }
        else if (sID == 'F40D') {
            obj.us_additional_measurement = parseInt(hexStr.substr(i + 6, 2), 16);
        }
        else if (sID == 'F40E') {
            obj.water_body_level_active = parseInt(hexStr.substr(i + 6, 2), 16);
        }
        else if (sID == 'F40F') {
            obj.distance_to_water_body_ground = parseInt(hexStr.substr(i + 6, 4), 16);
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
      
        // Downlink ACK: Valve(UCC) Config
      	else if (sID == 'F601') {
            const messageTypeIndex = parseInt(hexStr.substr(i + 6, 2), 16);
            obj.valve_monitoring_message_type = (LoRaMessgeType[messageTypeIndex] ? LoRaMessgeType[messageTypeIndex] : 'Invalid');
        }
        else if (sID == 'F602') {
            obj.valve_monitoring_interval = parseInt(hexStr.substr(i + 6, 8), 16);
        }

        // Downlink ACK: Valve Config
      	else if (sID == 'F701') {
            const openSignalIndex = parseInt(hexStr.substr(i + 6, 2), 16);
            obj.valve_1_open_signal = (ValveOpenSignal[openSignalIndex] ? ValveOpenSignal[openSignalIndex] : 'Invalid');
        }
        else if (sID == 'F702') {
            obj.valve_1_event_driven_transmission = (parseInt(hexStr.substr(i + 6, 2), 16) > 0);
        }
        else if (sID == 'F703') {
            const triggerEventIndex = parseInt(hexStr.substr(i + 6, 2), 16);
            obj.valve_1_trigger_event = (ValveTriggerEventType[triggerEventIndex] ? ValveTriggerEventType[triggerEventIndex] : 'Invalid');
        }
        else if (sID == 'F704') {
            const messageTypeIndex = parseInt(hexStr.substr(i + 6, 2), 16);
            obj.valve_1_message_type = (LoRaMessgeType[messageTypeIndex] ? LoRaMessgeType[messageTypeIndex] : 'Invalid');
        }
        else if (sID == 'F705') {
            obj.valve_1_num_of_transmission = parseInt(hexStr.substr(i + 6, 2), 16);
        }
        else if (sID == 'F706') {
            obj.valve_1_monitoring_interval = parseInt(hexStr.substr(i + 6, 8), 16);
        }
        else if (sID == 'F707') {
            const openSignalIndex = parseInt(hexStr.substr(i + 6, 2), 16);
            obj.valve_2_open_signal = (ValveOpenSignal[openSignalIndex] ? ValveOpenSignal[openSignalIndex] : 'Invalid');
        }
        else if (sID == 'F708') {
            obj.valve_2_event_driven_transmission = (parseInt(hexStr.substr(i + 6, 2), 16) > 0);
        }
        else if (sID == 'F709') {
            const triggerEventIndex = parseInt(hexStr.substr(i + 6, 2), 16);
            obj.valve_2_trigger_event = (ValveTriggerEventType[triggerEventIndex] ? ValveTriggerEventType[triggerEventIndex] : 'Invalid');
        }
        else if (sID == 'F70A') {
            const messageTypeIndex = parseInt(hexStr.substr(i + 6, 2), 16);
            obj.valve_2_message_type = (LoRaMessgeType[messageTypeIndex] ? LoRaMessgeType[messageTypeIndex] : 'Invalid');
        }
        else if (sID == 'F70B') {
            obj.valve_2_num_of_transmission = parseInt(hexStr.substr(i + 6, 2), 16);
        }
        else if (sID == 'F70C') {
            obj.valve_2_monitoring_interval = parseInt(hexStr.substr(i + 6, 8), 16);
        }

        // Downlink ACK: Node Config
      	else if (sID == 'F801') {
            const outputLogicIndex = parseInt(hexStr.substr(i + 6, 2), 16);
            obj.sensor_1_output_logic = (NodeOutputLogic[outputLogicIndex] ? NodeOutputLogic[outputLogicIndex] : 'Invalid');
        }
        else if (sID == 'F802') {
            obj.sensor_1_event_driven_transmission = (parseInt(hexStr.substr(i + 6, 2), 16) > 0);
        }
        else if (sID == 'F803') {
            const triggerEventIndex = parseInt(hexStr.substr(i + 6, 2), 16);
            obj.sensor_1_trigger_event = (NodeTriggerEventType[triggerEventIndex] ? NodeTriggerEventType[triggerEventIndex] : 'Invalid');
        }
        else if (sID == 'F804') {
            const messageTypeIndex = parseInt(hexStr.substr(i + 6, 2), 16);
            obj.sensor_1_message_type = (LoRaMessgeType[messageTypeIndex] ? LoRaMessgeType[messageTypeIndex] : 'Invalid');
        }
        else if (sID == 'F805') {
            obj.sensor_1_num_of_transmission = parseInt(hexStr.substr(i + 6, 2), 16);
        }
        else if (sID == 'F806') {
            obj.sensor_1_monitoring_interval = parseInt(hexStr.substr(i + 6, 8), 16);
        }
        else if (sID == 'F807') {
            const outputLogicIndex = parseInt(hexStr.substr(i + 6, 2), 16);
            obj.sensor_2_output_logic = (NodeOutputLogic[outputLogicIndex] ? NodeOutputLogic[outputLogicIndex] : 'Invalid');
        }
        else if (sID == 'F808') {
            obj.sensor_2_event_driven_transmission = (parseInt(hexStr.substr(i + 6, 2), 16) > 0);
        }
        else if (sID == 'F809') {
            const triggerEventIndex = parseInt(hexStr.substr(i + 6, 2), 16);
            obj.sensor_2_trigger_event = (NodeTriggerEventType[triggerEventIndex] ? NodeTriggerEventType[triggerEventIndex] : 'Invalid');
        }
        else if (sID == 'F80A') {
            const messageTypeIndex = parseInt(hexStr.substr(i + 6, 2), 16);
            obj.sensor_2_message_type = (LoRaMessgeType[messageTypeIndex] ? LoRaMessgeType[messageTypeIndex] : 'Invalid');
        }
        else if (sID == 'F80B') {
            obj.sensor_2_num_of_transmission = parseInt(hexStr.substr(i + 6, 2), 16);
        }
        else if (sID == 'F80C') {
            obj.sensor_2_monitoring_interval = parseInt(hexStr.substr(i + 6, 8), 16);
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
