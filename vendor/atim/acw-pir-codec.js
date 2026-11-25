/**
 * ATIM ACW-PIRxx – Motion detector
 * Codec version 1.0.0 – English output
 *
 * LoRaWAN Payload Codec API (TS013) entry points:
 *   decodeUplink(input)
 *   encodeDownlink(input)
 *   decodeDownlink(input)
 *
 * Works as is on The Things Stack (TTN v3), ChirpStack v4 and v3, and Node.js.
 * Documentation and examples: README.md and examples.json in this folder.
 * Generated from the French codec by scripts/build-en.js: edit the French codec, then rebuild.
 *
 * Copyright (c) 2026 ATIM – SPDX-License-Identifier: MIT
 */

/* One sample -> number; several -> array. */
function atimValue(samples) {
    if (!Array.isArray(samples)) return samples;
    return samples.length === 1 ? samples[0] : samples;
}

/* ATIM epoch (UTC seconds) -> ISO 8601. */
function atimTimestamp(bytes) {
    var epoch = ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0;
    return new Date(epoch * 1000).toISOString();
}

function decodeUplink(input) {
    var errors = [];
    var warnings = [];

    if (!input.bytes || input.bytes.length === 0) {
        return { data: {}, errors: ["Empty payload"], warnings: warnings };
    }

    var hexStringInput = "";
    for (var i = 0; i < input.bytes.length; i++) {
        var hex = input.bytes[i].toString(16);
        if (hex.length === 1) {
            hex = "0" + hex;
        }
        hexStringInput += hex;
    }

    var res;
    try {
        var data = decode_pay(hexStringInput);
        var decoded = decode_json(data.data, hexStringInput);
        res = postProcess(data, JSON.parse(decoded));
    } catch (e) {
        return { data: {}, errors: ["Unsupported payload: " + hexStringInput], warnings: warnings };
    }

    if (res.frame_type === "Unknown frame type" || res.frame_type === "Empty frame") {
        errors.push("Unknown frame type for payload " + hexStringInput);
    }

    return { data: res, errors: errors, warnings: warnings };
}

////// DECODER //////




function postProcess(data, decoded) {
    /*ACW range*/
    postProcessVoltageC(decoded, data);
    postProcessVoltageV(decoded, data);
    postProcessFrameType(decoded, data);
    postProcessTypeAlert(decoded, data);
    postProcessTypeError(decoded, data);
    postProcessTemp(decoded, data);
    postProcessCounter(decoded, data);
    postProcessLegacyPir(decoded, data);
    postProcessTimestamp(decoded, data);
    postProcessPeriod(decoded, data);
    postProcessHum(decoded, data);

    postProcessExtendedFrame(decoded);
    postProcessGps(decoded);
    return decoded;
}

/* Extended frame: frame index on 4 bytes (counter of the sent frames) */
function postProcessExtendedFrame(decoded) {
    if (decoded.frame_index != undefined) {
        var value_index = decoded.frame_index;
        decoded.frame_index = ((value_index[0] << 24) | (value_index[1] << 16) | (value_index[2] << 8) | value_index[3]) >>> 0;
    }
    delete decoded.hist_sample;
}

/* Keep alive GPS position: latitude and longitude in thousandths of an arc minute, converted to degrees */
function postProcessGps(decoded) {
    if (decoded.gps == undefined) return;
    var value_gps = decoded.gps;
    delete decoded.gps;
    var latitude = (value_gps[1] << 16) | (value_gps[2] << 8) | value_gps[3];
    var longitude = (value_gps[4] << 16) | (value_gps[5] << 8) | value_gps[6];
    if (value_gps[0] & 0x80) {
        decoded.gps_status = "GPS hardware fault";
    } else if (latitude === 0xFFFFFF || longitude === 0xFFFFFF) {
        decoded.gps_status = "Position not found";
    } else {
        decoded.gps_status = "Position found";
        decoded.latitude = Math.round(latitude / 60000 * 1000000) / 1000000 * ((value_gps[0] & 0x02) ? 1 : -1);
        decoded.longitude = Math.round(longitude / 60000 * 1000000) / 1000000 * ((value_gps[0] & 0x01) ? 1 : -1);
    }
}

/*******************************************************************************************************************************/
/*******************************************************************************************************************************/
/*OUTPUT FORMATTING*/
/*******************************************************************************************************************************/
/*******************************************************************************************************************************/

/***********/
/*ACW*/
/***********/

function postProcessTypeError(decoded,data){
    if(data.typeError != undefined){
        decoded.error = data.typeError[0];
    }
}

function postProcessTypeAlert(decoded, data) {
    if (data.typeAlert != undefined) {
        var res = "";
        for (var i = 0; i < data.nbrData; i++) {
            res += data.typeAlert[i];
            if ((data.nbrData > 1) && (i < data.nbrData - 1)) {
                res += " | ";
            }
        }
        delete decoded.typeAlert;
        decoded.alert = res;
    }
}

function postProcessFrameType(decoded,data){
    if(decoded.frame_type != undefined){
        decoded.frame_type = data.frame_type;
    }
}

function postProcessVoltageC(decoded, data) {
    if (decoded.voltage_c != undefined) {
        decoded.voltagec = (decoded.voltage_c[0] << 8 | decoded.voltage_c[1]) / 1000;
        delete decoded.voltage_c;
    }
}

function postProcessVoltageV(decoded, data) {
    if (decoded.voltage_v != undefined) {
        decoded.voltagev = (decoded.voltage_v[0] << 8 | decoded.voltage_v[1]) / 1000;
        delete decoded.voltage_v;
    }
}

function postProcessTemp(decoded,data){
    var value_temp0 = [];
    var value_sample_hist = (data.sample * data.history);

    if(decoded.temp0 != undefined){
        for(var i=0;i<value_sample_hist;i++){
            if(((decoded.temp0[1+i*2]<<8 | decoded.temp0[2+i*2])<<16>>16 )/100 === -327.68){
                value_temp0.push("error");
            }else{
                value_temp0.push(((decoded.temp0[1+i*2]<<8 | decoded.temp0[2+i*2])<<16>>16 )/100) ;
            }

        }
        delete decoded.temp0;
        decoded.temperature0 = atimValue(value_temp0);
    }
}

function postProcessHum(decoded,data){
    var value_hum0 = [];
    var value_sample_hist = (data.sample * data.history);

    if(decoded.hum0 != undefined){
        for(var i=0;i<value_sample_hist;i++){
            if(((decoded.hum0[1+i*2]<<8 | decoded.hum0[2+i*2])/100) === 327.68){
                value_hum0.push("error");
            }else{
                value_hum0.push((decoded.hum0[1+i*2]<<8 | decoded.hum0[2+i*2])/100);
            }
        }
        delete decoded.hum0;
        decoded.humidity0 = atimValue(value_hum0);
    }
}

function postProcessCounter(decoded,data){
    var value_sample_hist = (data.sample * data.history);
    var value_count0 = [];

    if(decoded.counter_pir0 != undefined){
        for(var i=0;i<value_sample_hist;i++){
            value_count0.push(decoded.counter_pir0[1+i*2]<<8 | decoded.counter_pir0[2+i*2]);
        }
        delete decoded.counter_pir0;
        decoded.counter0 = atimValue(value_count0);
    }
 }

function postProcessPeriod(decoded,data){
    if(decoded.period != undefined){
        decoded.period = (decoded.period[0] << 8) | decoded.period[1];
   }
}



/*******************************************************************************************************************************/
/*******************************************************************************************************************************/
/*DECODER*/
/*******************************************************************************************************************************/
/*******************************************************************************************************************************/
function decode_pay(encoded) {
    var frame_type = getFrameType(encoded);
    var data = {};
    /*Check whether the frame carries a timestamp*/
    var with_timestamp = 0;
    var frame_0 = parseInt(encoded[0], 16);
    var bin_frame_0 = (parseInt((frame_0 - 0).toString(16), 16)).toString(2);
    if (bin_frame_0[1] === "1") {
        with_timestamp = 1;
    }
    var alert = 0;
    if (frame_type === "Measurement frame" || frame_type === "Test frame" || frame_type === "Extended measurement frame") {
        data = decode_frame_test_measure(encoded, frame_type, with_timestamp, alert);
    } else if (frame_type === "Keep alive frame") {
        data = decode_frame_keepalive(encoded, with_timestamp);
    } else if (frame_type === "Alert frame") {
        alert = 1;
        data = decode_frame_test_measure(encoded, frame_type, with_timestamp, alert);
        decode_alert(encoded, with_timestamp, data);
    } else if (frame_type === "Error frame") {
        data = decode_frame_error(encoded, with_timestamp);
    } else if (frame_type === "Legacy product") {
        frame_type = frame_type_legacy(encoded);
        data = decode_frame_legacy(encoded, frame_type);
    } else if (frame_type === "Specific frame") {
        var wr1 = parseInt(encoded[4], 16);
        if (wr1 === 0) {
            data.data = 'byte frame_type;' + 'byte[2] wr;';
        } else if (wr1 === 2) {
            data.data = 'byte frame_type;' + 'byte[2] wrs;';
        } else {
            data.data = 'byte frame_type;';
        }
    }
    else {
        data.data = 'byte frame_type;';
    }
    data.frame_type = frame_type;
    return data;
}

function getFrameType(encoded) {

    /*Read the first two nibbles of the frame*/
    var byte1 = parseInt(encoded[0], 16);
    var byte2 = parseInt(encoded[1], 16);

    /*Binary decomposition padded to 4 bits (JavaScript drops leading zeros)*/
    var bin1 = (parseInt((byte1 - 0).toString(16), 16)).toString(2);
    var size = bin1.length + 1;
    if (size <= 5) {
        if (bin1.length != 4) {
            for (var i = 0; i < (5 - (size)); i++) {
                bin1 = "0" + bin1;
            }
        }
    }
    /*Frame type according to the first byte*/
    var frameType = bin1;
    if (bin1[0] === "0") {
        frameType = "Legacy product";
    }
    else if (bin1[2] === "1") {
        frameType = "Measurement frame";
    }
    else if (byte2 === 0x1) {
        frameType = "Keep alive frame";
    } else if (byte2 === 0x2) {
        frameType = "Network test frame";
    } else if (byte2 === 0x5) {
        frameType = "Test frame";
    } else if (byte2 === 0xD) {
        frameType = "Alert frame";
    } else if (byte2 === 0xE) {
        frameType = "Error frame";
    } else if (byte2 === 0xF) {
        frameType = "Specific frame";
    } else if (byte2 === 0x6) {
        frameType = "Response to a configuration frame";
    } else if (byte2 === 0x7) {
        frameType = "Response to a command frame";
    } else if (byte2 === 0x8) {
        frameType = "Response to an invalid frame";
    } else if (byte2 === 0x9) {
        frameType = "Extended measurement frame";
    } else {
        frameType = "Unknown frame type";
    }
    if (encoded === "") {
        frameType = "Empty frame";
    }
    return frameType;
}

function decode_alert(encoded, with_timestamp, data) {
    var k = 0;
    data.typeAlert = [];
    for (var i = 0; i < data.nbrData; i++) {
        if (with_timestamp) {
            var dframe1 = parseInt(encoded.substr(i + 10 + k, 2), 16);
            var bin1_dframe = (parseInt((dframe1 - 0).toString(16), 16)).toString(2);
        } else {
            var dframe1 = parseInt(encoded.substr(i + 2 + k, 2), 16);
            var bin1_dframe = (parseInt((dframe1 - 0).toString(16), 16)).toString(2);
        }
        var size_bin = bin1_dframe.length;
        if (size_bin <= 8) {
            for (var j = 0; j < (8 - (size_bin)); j++) {
                bin1_dframe = "0" + bin1_dframe;
            }
        }
        var nbr = bin1_dframe[0] << 1 | bin1_dframe[1];
        if (nbr === 0) {
            data.typeAlert[i] = "Back within thresholds";
        }
        else if (nbr === 1) {
            data.typeAlert[i] = "High threshold exceeded";
        }
        else if (nbr === 2) {
            data.typeAlert[i] = "Low threshold exceeded";
        }
        var type_data = dframe1 & 0x0F;
        if (data.typeAlert != undefined) {
            if (type_data === 0x08) {
                k = k + 5;
                data.typeAlert[i] += " on temperature";
                data.typeAlert[i] += " channel " + data.channelTemp[i];
            }
            else if (type_data === 0x06) {
                data.typeAlert[i] += " on differential pressure";
                k = k + 5;
            }
            else if (type_data === 0x09) {
                k = k + 5;
                data.typeAlert[i] += " on humidity";
                data.typeAlert[i] += " channel " + data.channelRh[i];
            }
            else if (type_data === 0x0c) {
                data.typeAlert[i] += " on level";
                k = k + 5;
            }
            else if (type_data === 0x0d) {
                data.typeAlert[i] += " on CO2";
                k = k + 5;
            }
            else if (type_data === 0x04) {
                k = k + 11;
                data.typeAlert[i] += " on counter";
                data.typeAlert[i] += " channel " + data.channelCounting[i];
            }
            else if (type_data === 0x07) {
                data.typeAlert[i] += " on distance";
                k = k + 5;
            }
            else if (type_data === 0x0a) {
                data.typeAlert[i] += " on voltage";
                k = k + 5;
            }
            else if (type_data === 0x0b) {
                data.typeAlert[i] += " on current";
                k = k + 5;
            }
        }
    }

}

function decode_frame_keepalive(encoded, with_timestamp) {
    var data = {};
    var res_str = 'byte frame_type;';
    var size_without_gps = 10;
    if (with_timestamp) {
        res_str = res_str + 'ubyte[4] ts;';
        size_without_gps += 8;
    }
    res_str = res_str + 'ubyte[2] voltage_v;' + 'ubyte[2] voltage_c;';
    /* LTE-M / NB-IoT: GPS position (7 bytes) after the voltages */
    if (encoded.length >= size_without_gps + 14) {
        res_str = res_str + 'ubyte[7] gps;';
    }
    data.data = res_str;
    return data;
}

function decode_frame_test_measure(encoded, frame_type, with_timestamp, alert) {
    var frame_0 = parseInt(encoded[0], 16);
    var frame_1 = parseInt(encoded[1], 16);
    var bin_frame_0 = (parseInt((frame_0 - 0).toString(16), 16)).toString(2);
    var bin_frame_1 = (parseInt((frame_1 - 0).toString(16), 16)).toString(2);

    var size_0 = bin_frame_0.length + 1;
    if (size_0 <= 5) {
        if (bin_frame_0.length != 4) {
            for (var i = 0; i < (5 - (size_0)); i++) {
                bin_frame_0 = "0" + bin_frame_0;
            }
        }
    }

    var size_1 = bin_frame_1.length + 1;
    if (size_1 <= 5) {
        if (bin_frame_1.length != 4) {
            for (var i = 0; i < (5 - (size_1)); i++) {
                bin_frame_1 = "0" + bin_frame_1;
            }
        }
    }

    var history = 0;
    var sample = 0;
    if (frame_type === "Measurement frame") {
        if (bin_frame_0[3] === "1" || bin_frame_1[0] === "1") {
            var bin_hist = bin_frame_0[3] + bin_frame_1[0];
            history = parseInt(bin_hist, 2) + 1;
        }
        if (bin_frame_1[1] === "1" || bin_frame_1[2] === "1" || bin_frame_1[3] === "1") {
            var bin_smp = bin_frame_1[1] + bin_frame_1[2] + bin_frame_1[3];
            sample = parseInt(bin_smp, 2) + 1;
        }
        var data = decodeFrame(encoded, history, sample, with_timestamp, alert, 0);
    }
    if (frame_type === "Extended measurement frame") {
        /* Extended header after the timestamp: frame index (4 bytes), history depth (1), number of samples (2) */
        var start_extended = with_timestamp ? 18 : 10;
        history = parseInt(encoded.substr(start_extended, 2), 16);
        sample = parseInt(encoded.substr(start_extended + 2, 4), 16);
        var data = decodeFrame(encoded, history, sample, with_timestamp, alert, 1);
    }
    if (frame_type === "Test frame") {
        var data = decodeFrame(encoded, 0, 0, with_timestamp, alert, 0);
    }
    if (alert === 1) {
        var data = decodeFrame(encoded, 0, 0, with_timestamp, alert, 0);
    }

    return data;
}

function hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

function decodeFrame(frame, history, sample, with_timestamp, alert, extended) {
    var bytes = hexToBytes(frame);
    var res_str = 'byte frame_type;';
    var start_lp = 1;
    var data = {};
    var k = 0;
    data.nbrData = 0;
    data.channelTemp = []; data.channelRh = []; data.channelInput = []; data.channelCounting = []; data.channelCountingPir = [];
    var ctn_channel_temp = 0; var ctn_channel_rh = 0; var ctn_channel_counting = 0; var ctn_channel_counting_pir = 0;
    var size_counting = 0;

    if (with_timestamp === 1) {
        res_str = res_str + 'ubyte[4] ts;';
        start_lp += 4;
    }
    if (extended) {
        /* Extended frame (LTE-M / NB-IoT): frame index, history depth and number of samples, then the period */
        res_str = res_str + 'ubyte[4] frame_index;' + 'ubyte[3] hist_sample;' + 'ubyte[2] period;';
        start_lp += 9;
    } else if (history >= 1 | sample >= 1) {
        res_str = res_str + 'ubyte[2] period;';
        start_lp += 2;
    }
    if (history < 1) {
        history = 1;
    }
    if (sample < 1) {
        sample = 1;
    }

    data.sample = sample;
    data.history = history;
    /*var alerte = 0;*/

    var i = start_lp;
    while (i < bytes.length) {
        var channel = 0;
        var var_inter = bytes[i] & 0x0F;
        if (var_inter != bytes[i]) {
            if (alert) {
                channel = bytes[i] & 0x30;
                if (channel === 16) {
                    channel = 1;
                } else if (channel === 32) {
                    channel = 2;
                } else if (channel === 48) {
                    channel = 3;
                }
            } else {
                channel = (bytes[i] & 0xF0);
                if (channel === 16) {
                    channel = 1;
                } else if (channel === 32) {
                    channel = 2;
                } else if (channel === 48) {
                    channel = 3;
                }
            }
            bytes[i] = var_inter;
        }
        switch (bytes[i]) {
            case 0x08:
                k = 1;
                for (var j = 0; j < (history * sample); j++) {
                    k += 2;
                    i += 2;
                }
                res_str = res_str + 'ubyte[' + k + '] temp' + channel.toString() + ';';
                i++;
                data.channelTemp[ctn_channel_temp] = channel.toString();
                ctn_channel_temp++;
                break;

            case 0x09:
                k = 1;
                for (var j = 0; j < (history * sample); j++) {
                    k += 2;
                    i += 2;
                }
                res_str = res_str + 'ubyte[' + k + '] hum' + channel.toString() + ';';
                i++;
                data.channelRh[ctn_channel_rh] = channel.toString();
                ctn_channel_rh++;
                break;
            case 0x0c:
                k = 1;
                for (var j = 0; j < (history * sample); j++) {
                    k += 2;
                    i += 2;
                }
                res_str = res_str + 'ubyte[' + k + '] rate;';
                i++;
                break;
            case 0x0d:
                k = 1;
                for (var j = 0; j < (history * sample); j++) {
                    k += 2;
                    i += 2;
                }
                res_str = res_str + 'ubyte[' + k + '] co2;';
                i++;
                break;
            case 0x01:
                k = 1;
                for (var j = 0; j < (history * sample); j++) {
                    k += 1;
                    i += 1;
                }
                res_str = res_str + 'ubyte[' + k + '] inputs;';
                i++;
                break;
            case 0x07:
                k = 1;
                for (var j = 0; j < (history * sample); j++) {
                    k += 2;
                    i += 2;
                }
                res_str = res_str + 'ubyte[' + k + '] dist;';
                i++;
                break;

            case 0x06:
                k = 1;
                for (var j = 0; j < (history * sample); j++) {
                    i += 2;
                    k += 2;
                }
                res_str = res_str + 'ubyte[' + k + '] dp;';
                i++;
                break;

            case 0x03:
                k=1;
                for(var j=0;j<(history*sample);j++){
                    i += 2;
                    k += 2;
                }
                res_str = res_str + 'ubyte['+ k +'] counter_pir' + channel.toString() + ';';
                i++;
                data.channelCountingPir[ctn_channel_counting_pir] = channel;
                ctn_channel_counting_pir++;
                break;

            case 0x04:
                k = 1;
                for (var j = 0; j < (history * sample); j++) {
                    i += 4;
                    k += 4;
                }
                res_str = res_str + 'ubyte[' + k + '] count' + channel.toString() + ';';
                i++;
                data.channelCounting[ctn_channel_counting] = channel;
                ctn_channel_counting++;
                break;

            case 0x0a:
                k = 1;
                for (var j = 0; j < (history * sample); j++) {
                    i += 2;
                    k += 2;
                }
                res_str = res_str + 'ubyte[' + k + '] voltage;';
                i++;
                break;
            case 0x0b:
                k = 1;
                for (var j = 0; j < (history * sample); j++) {
                    i += 2;
                    k += 2;
                }
                res_str = res_str + 'ubyte[' + k + '] current;';
                i++;
                break;
            default:
                i++;
        }
        data.nbrData++;
    }
    data.data = res_str;
    return data;
}

function decode_frame_error(encoded, with_timestamp) {
    var res_str = 'byte frame_type;';
    var data = {};
    data.typeError = [];

    var ERR_SENSOR_NO_DATA = 0x81; /*Could not read temperature/humidity from the sensor.*/
    var ERR_BUF_SMALLER = 0x82; /*The data table is full, no more data can be written*/
    var ERR_DEPTH_HISTORIC_OUT_OF_RANGE = 0x83; /*The history depth is too large or too small for the frame*/
    var ERR_NB_SAMPLE_OUT_OF_RANGE = 0x84; /*The number of samples is too large or too small for the frame*/
    var ERR_NWAY_OUT_OF_RANGE = 0x85; /*The number of channels in the frame header is too large or too small*/
    var ERR_TYPEWAY_OUT_OF_RANGE = 0x86; /*The measurement type in the frame header is too large or too small*/
    var ERR_SAMPLING_PERIOD = 0x87; /*Invalid sampling period structure*/
    var ERR_SUBTASK_END = 0x88; /*A subtask ended after leaving an infinite loop*/
    var ERR_NULL_POINTER = 0x89; /*Pointer with “NULL” value*/
    var ERR_BATTERY_LEVEL_DEAD = 0x8A; /*Critical battery level*/
    var ERR_EEPROM = 0x8B; /*EEPROM is corrupted*/
    var ERR_ROM = 0x8C; /*ROM is corrupted*/
    var ERR_RAM = 0x8D; /*RAM is corrupted*/
    var ERR_ARM_INIT_FAIL = 0x8E; /*Radio module initialisation failed*/
    var ERR_ARM_BUSY = 0x8F; /*The module is already busy (possibly not initialised)*/
    var ERR_ARM_BRIDGE_ENABLE = 0x90; /*The module is in bridge mode and cannot send data over the radio*/
    var ERR_RADIO_QUEUE_FULL = 0x91; /*The radio buffer is full*/
    var ERR_CFG_BOX_INIT_FAIL = 0x92; /*Black box initialisation error*/
    var ERR_KEEP_ALIVE_PERIOD = 0x93; /*Invalid keep alive period structure*/
    var ERR_ENTER_DEEP_SLEEP = 0x94; /*The product entered deep sleep mode*/
    var ERR_BATTERY_LEVEL_LOW = 0x95; /*Low battery level*/
    var ERR_ARM_TRANSMISSION = 0x96; /*A transmission was started but an error occurred*/
    var ERR_ARM_PAYLOAD_BIGGER = 0x97; /*The message is too large for the network capacity*/
    var ERR_RADIO_PAIRING_TIMEOUT = 0x98; /*Could not join a network within the allotted time*/
    var ERR_SENSORS_TIMEOUT = 0x99; /*Sensor timeout*/
    var ERR_SENSOR_STOP = 0x9A; /*The sensor returned no value during a reading*/
    var ERR_SENSORS_INIT_FAIL = 0x9B; /*Temperature/humidity sensor not detected at start-up*/
    var ERR_BOX_OPENED = 0X9C; /*Box opened*/
    var ERR_BOX_CLOSED = 0X9D; /*Box closed*/
    var ERR_SENSORS_MOVE = 0x9E; /*Movement or theft detected on the product*/
    var ERR_SENSOR_CRC_KO = 0x9F; /*Temperature/humidity sensor data corrupted*/

    var cpt = 0;
    var size_frame = encoded.length;
    var start_loop = 2;
    if (with_timestamp) {
        res_str += 'ubyte[4] ts;';
        start_loop += 8;
    }
    for (var i = start_loop; i < size_frame; i += 2) {

        var size_error = parseInt(encoded.substr(i, 2), 16) & 0x0F;
        i += 2;
        var frameErrorCode = (parseInt(encoded.substr(i, 2), 16));
        switch (frameErrorCode) {
            case ERR_SENSOR_NO_DATA:
                data.typeError[cpt] = "Unknown error";
                break;
            case ERR_BUF_SMALLER:
                data.typeError[cpt] = "The data table is full, no more data can be written";
                break;
            case ERR_DEPTH_HISTORIC_OUT_OF_RANGE:
                data.typeError[cpt] = " The history depth is too large or too small for the frame";
                break;
            case ERR_NB_SAMPLE_OUT_OF_RANGE:
                data.typeError[cpt] = "The number of samples is too large or too small for the frame";
                break;
            case ERR_NWAY_OUT_OF_RANGE:
                data.typeError[cpt] = "The number of channels in the frame header is too large or too small";
                break;
            case ERR_TYPEWAY_OUT_OF_RANGE:
                data.typeError[cpt] = "The measurement type in the frame header is too large or too small";
                break;
            case ERR_SAMPLING_PERIOD:
                data.typeError[cpt] = "Invalid sampling period structure";
                break;
            case ERR_SUBTASK_END:
                data.typeError[cpt] = "A subtask ended after leaving an infinite loop";
                break;
            case ERR_NULL_POINTER:
                data.typeError[cpt] = "Pointer with “NULL” value";
                break;
            case ERR_BATTERY_LEVEL_DEAD:
                data.typeError[cpt] = "Critical battery level";
                data.battery = parseInt(encoded.substr(i + 2, 4), 16) / 1000;
                break;
            case ERR_EEPROM:
                data.typeError[cpt] = "EEPROM is corrupted";
                break;
            case ERR_ROM:
                data.typeError[cpt] = "ROM is corrupted";
                break;
            case ERR_RAM:
                data.typeError[cpt] = "RAM is corrupted";
                break;
            case ERR_ARM_INIT_FAIL:
                data.typeError[cpt] = "Radio module initialisation failed";
                break;
            case ERR_ARM_BUSY:
                data.typeError[cpt] = "The module is already busy (possibly not initialised)";
                break;
            case ERR_ARM_BRIDGE_ENABLE:
                data.typeError[cpt] = "The module is in bridge mode and cannot send data over the radio";
                break;
            case ERR_RADIO_QUEUE_FULL:
                data.typeError[cpt] = "The radio buffer is full";
                break;
            case ERR_CFG_BOX_INIT_FAIL:
                data.typeError[cpt] = "Black box initialisation error";
                break;
            case ERR_KEEP_ALIVE_PERIOD:
                data.typeError[cpt] = "Invalid keep alive period structure";
                break;
            case ERR_ENTER_DEEP_SLEEP:
                data.typeError[cpt] = "The product entered deep sleep mode";
                break;
            case ERR_BATTERY_LEVEL_LOW:
                data.typeError[cpt] = "Low battery level";
                data.battery = parseInt(encoded.substr(i + 2, 4), 16) / 1000;
                break;
            case ERR_ARM_TRANSMISSION:
                data.typeError[cpt] = "A transmission was started but an error occurred";
                break;
            case ERR_ARM_PAYLOAD_BIGGER:
                data.typeError[cpt] = "The message is too large for the network capacity";
                break;
            case ERR_RADIO_PAIRING_TIMEOUT:
                data.typeError[cpt] = "Could not join a network within the allotted time";
                break;
            case ERR_SENSORS_TIMEOUT:
                data.typeError[cpt] = "Sensor timeout";
                break;
            case ERR_SENSOR_STOP:
                data.typeError[cpt] = "The sensor returned no value during a reading";
                break;
            case ERR_SENSORS_INIT_FAIL:
                data.typeError[cpt] = "The sensor stopped working";
                break;
            case ERR_BOX_OPENED:
                data.typeError[cpt] = "Box opened";
                break;
            case ERR_BOX_CLOSED:
                data.typeError[cpt] = "Box closed";
                break;
            case ERR_SENSORS_MOVE:
                data.typeError[cpt] = "Movement or theft detected on the product";
                break;
            case ERR_SENSOR_CRC_KO:
                data.typeError[cpt] = "Temperature/humidity sensor data corrupted";
                break;
            default:
                data.typeError[cpt] = "Unknown error";
        }
        cpt++;
        if (size_error > 1) {
            i += 2 * size_error - 1;
        }
    }
    data.data = res_str;
    return data;
}

/***********/
/*Legacy products*/
/***********/

function frame_type_legacy(encoded) {
    var frameType;
    var byte1 = parseInt(encoded.substr(0, 2), 16);
    if (byte1 === 0x01) {
        frameType = "Keep alive frame";
    } else if (byte1 === 0x05) {
        frameType = "Test frame";
    } else if (byte1 === 0x42) {
        frameType = "Digital inputs frame";
    } else if (byte1 === 0x41) {
        frameType = "Digital inputs and temperature frame";
    } else if (byte1 === 0x4E) {
        frameType = "Digital inputs, temperature and counter 1 frame";
    } else if (byte1 === 0x4F) {
        frameType = "Digital inputs, counter 1 and counter 2 frame";
    } else if (byte1 === 0x52) {
        frameType = "Digital inputs and counter 1 frame";
    } else if (byte1 === 0x50) {
        frameType = "Counters 1 and 2 frame";
    } else if (byte1 === 0x51) {
        frameType = "Counters 3 and 4 frame";
    } else if (byte1 === 0x5F) {
        frameType = "Counters 5 and 6 frame";
    } else if (byte1 === 0x60) {
        frameType = "Counters 7 and 8 frame";
    } else if (byte1 === 0x5D) {
        frameType = "Digital inputs, temperature and counters frame";
    } else if (byte1 === 0x5E) {
        frameType = "Digital inputs and counters frame";
    } else if (byte1 === 0x43) {
        frameType = "Alarm or shock frame";
    } else if (byte1 === 0x62) {
        frameType = "Digital inputs/outputs frame";
    } else if (byte1 === 0x61) {
        frameType = "Digital inputs/outputs and temperature frame";
    } else if (byte1 === 0x6E) {
        frameType = "Digital inputs/outputs, temperature and counter 1 frame";
    } else if (byte1 === 0x6F) {
        frameType = "Digital inputs/outputs, counter 1 and counter 2 frame";
    } else if (byte1 === 0x72) {
        frameType = "Digital inputs/outputs and counter 1 frame";
    } else if (byte1 === 0x7D) {
        frameType = "Digital inputs/outputs, temperature and counters frame";
    } else if (byte1 === 0x7E) {
        frameType = "Digital inputs/outputs and counters frame";
    } else if (byte1 === 0x32) {
        frameType = "PIR product";
    } else if (byte1 === 0x14) {
        frameType = "Standard counter frame";
    } else if (byte1 === 0x37) {
        frameType = "Cut cable alert frame";
    } else if (byte1 === 0x09) {
        frameType = "Change of state detection frame (digital)";
    } else if (byte1 === 0x30) {
        frameType = "ECO mode counter frame (counter 1 22 bits and 5 deltas 32 bits, LoRaWAN)";
    } else if (byte1 === 0x31) {
        frameType = "LoRaWAN test frame";
    } else if (byte1 === 0x39) {
        frameType = "Frame 39 ECO mode counter (counter 1 20 bits and five concatenated 12-bit deltas, Sigfox)";
    } else if (byte1 === 0x3a) {
        frameType = "Frame 3A ECO mode counter (counter 1 20 bits and five concatenated 12-bit deltas, Sigfox)";
    } else if (byte1 === 0x3b) {
        frameType = "Frame 3B ECO mode counter (counter 1 20 bits and five concatenated 12-bit deltas, Sigfox)";
    } else if (byte1 === 0x18) {
        frameType = "0-10 V value periodic report frame";
    } else if (byte1 === 0x19) {
        frameType = "0-20 mA value periodic report frame";
    } else if (byte1 === 0x1e) {
        frameType = "0-10 V value LOW alert frame";
    } else if (byte1 === 0x22) {
        frameType = "4-20 mA value LOW alert frame";
    } else if (byte1 === 0x1f) {
        frameType = "0-10 V value end of LOW alert frame";
    } else if (byte1 === 0x23) {
        frameType = "4-20 mA value end of LOW alert frame";
    } else if (byte1 === 0x20) {
        frameType = "0-10 V value HIGH alert frame";
    } else if (byte1 === 0x24) {
        frameType = "4-20 mA value HIGH alert frame";
    } else if (byte1 === 0x21) {
        frameType = "0-10 V value end of HIGH alert frame";
    } else if (byte1 === 0x25) {
        frameType = "4-20 mA value end of HIGH alert frame";
    } else if (byte1 === 0x53) {
        frameType = "Temperature S1 < low threshold and temperature S2 < low threshold";
    } else if (byte1 === 0x54) {
        frameType = "Temperature S1 < low threshold and temperature S2 between thresholds";
    } else if (byte1 === 0x55) {
        frameType = "Temperature S1 < low threshold and temperature S2 > high threshold";
    } else if (byte1 === 0x56) {
        frameType = "Temperature S1 between thresholds and temperature S2 < low threshold";
    } else if (byte1 === 0x57) {
        frameType = "Temperature S1 between thresholds and temperature S2 between thresholds";
    } else if (byte1 === 0x58) {
        frameType = "Temperature S1 between thresholds and temperature S2 > high threshold";
    } else if (byte1 === 0x59) {
        frameType = "Temperature S1 > high threshold and temperature S2 < low threshold";
    } else if (byte1 === 0x5A) {
        frameType = "Temperature S1 > high threshold and temperature S2 between thresholds";
    } else if (byte1 === 0x5B) {
        frameType = "Temperature S1 > high threshold and temperature S2 > high threshold";
    } else if (byte1 === 0x1A) {
        frameType = "Two temperatures periodic report frame";
    } else if (byte1 === 0x1B) {
        frameType = "Temperature periodic report frame";
    } else if (byte1 === 0x26) {
        frameType = "Low threshold crossing detected TM2D";
    } else if (byte1 === 0x27) {
        frameType = "Low threshold crossing ended TM2D";
    } else if (byte1 === 0x28) {
        frameType = "High threshold crossing detected TM2D";
    } else if (byte1 === 0x29) {
        frameType = "High threshold crossing ended TM2D";
    } else if (byte1 === 0x2A) {
        frameType = "Low threshold crossing detected TM1D";
    } else if (byte1 === 0x2B) {
        frameType = "Low threshold crossing ended TM1D";
    } else if (byte1 === 0x2C) {
        frameType = "High threshold crossing detected TM1D";
    } else if (byte1 === 0x2D) {
        frameType = "High threshold crossing ended TM1D";
    } else {
        frameType = "Unknown frame type";
    }
    return frameType;
}
function decode_frame_legacy(encoded, frame_type) {
    var bytes = hexToBytes(encoded);
    var res_str = 'byte frame_type;';
    var data = {};
    switch (frame_type) {
        case "Keep alive frame":
            res_str = res_str + 'ubyte[2] voltage_c;';
            break;
        case "Test frame":
            res_str = res_str + 'ubyte legacy_counter;';
            break;

        case "Digital inputs frame":
            res_str = res_str + 'ubyte[2] input_legacy;';
            break;

        case "Digital inputs and temperature frame":
            res_str = res_str + 'ubyte[2] input_legacy;' + 'ubyte[2] temperature;';
            break;

        case "Digital inputs, temperature and counter 1 frame":
            res_str = res_str + 'ubyte[2] input_legacy;' + 'ubyte[2] temperature;' + 'ubyte[4] legacy_counter1;';
            break;

        case "Digital inputs, counter 1 and counter 2 frame":
            res_str = res_str + 'ubyte[2] input_legacy;' + 'ubyte[4] legacy_counter1;' + 'ubyte[4] legacy_counter2;';
            break;

        case "Digital inputs and counter 1 frame":
            res_str = res_str + 'ubyte[2] input_legacy;' + 'ubyte[4] legacy_counter1;';
            break;

        case "Counters 1 and 2 frame":
            res_str = res_str + 'ubyte[4] legacy_counter1;' + 'ubyte[4] legacy_counter2;';
            break;

        case "Counters 3 and 4 frame":
            res_str = res_str + 'ubyte[4] legacy_counter3;' + 'ubyte[4] legacy_counter4;';

            break;

        case "Counters 5 and 6 frame":
            res_str = res_str + 'ubyte[4] legacy_counter5;' + 'ubyte[4] legacy_counter6;';
            break;

        case "Counters 7 and 8 frame":
            res_str = res_str + 'ubyte[4] legacy_counter7;' + 'ubyte[4] legacy_counter8;';
            break;

        case "Digital inputs, temperature and counters frame":
            res_str = res_str + 'ubyte[2] input_legacy;' + 'ubyte[2] temperature;';
            var size_bytes = (bytes.length - 5) / 4;
            for (var j = 0; j < size_bytes; j++) {
                res_str = res_str + 'ubyte[4] legacy_counter' + j + ';';
            }
            break;
        case "Digital inputs and counters frame":
            res_str = res_str + 'ubyte[2] input_legacy;';
            var size_bytes = (bytes.length - 3) / 4;
            for (var j = 0; j < size_bytes; j++) {
                res_str = res_str + 'ubyte[4] legacy_counter' + j + ';';
            }
            break;

        case "Alarm or shock frame":
            res_str = res_str + 'ubyte legacy_counter;';
            break;

        case "Digital inputs/outputs frame":
            res_str = res_str + 'ubyte input_digital;' + 'ubyte output_digital;';
            break;

        case "Digital inputs/outputs and temperature frame":
            res_str = res_str + 'ubyte input_digital;' + 'ubyte output_digital;' + 'ubyte[2] temperature;';
            break;

        case "Digital inputs/outputs, temperature and counter 1 frame":
            res_str = res_str + 'ubyte input_digital;' + 'ubyte output_digital;' + 'ubyte[2] temperature;' + 'ubyte[4] legacy_counter1;';
            break;

        case "Digital inputs/outputs, counter 1 and counter 2 frame":
            res_str = res_str + 'ubyte input_digital;' + 'ubyte output_digital;' + 'ubyte[4] legacy_counter1;' + 'ubyte[4] legacy_counter2;';
            break;

        case "Digital inputs/outputs and counter 1 frame":
            res_str = res_str + 'ubyte input_digital;' + 'ubyte output_digital;' + 'ubyte[4] legacy_counter1;';
            break;

        case "Digital inputs/outputs, temperature and counters frame":
            res_str = res_str + 'ubyte input_digital;' + 'ubyte output_digital;' + 'ubyte[2] temperature;';
            var size_bytes = (bytes.length - 5) / 4;
            for (var j = 0; j < size_bytes; j++) {
                res_str = res_str + 'ubyte[4] legacy_counter' + j + ';';
            }
            break;

        case "Digital inputs/outputs and counters frame":
            res_str = res_str + 'ubyte input_digital;' + 'ubyte output_digital;';
            var size_bytes = (bytes.length - 3) / 4;
            for (var j = 0; j < size_bytes; j++) {
                res_str = res_str + 'ubyte[4] legacy_counter' + j + ';';
            }
            break;

        case "PIR product":
            res_str = res_str + 'ubyte type_frame;' + 'ubyte opening_box;' + 'ubyte[2] sensor_dq;' + 'ubyte[2] counter_pir;' + 'ubyte[2] temperature_pir;';
            break; res_str = res_str + 'ubyte[2] temperature_TMXD_S1;';
            break;
        case "Standard counter frame":
            res_str = res_str + 'ubyte wirecut;' + 'ubyte[4] legacy_counter1;' + 'ubyte[4] legacy_counter2;';
            break;
        case "Cut cable alert frame":
            res_str = res_str + 'ubyte wirecut;';
            break;
        case "Change of state detection frame (digital)":
            res_str = res_str + 'ubyte[2] logic_level;';
            break;
        case "ECO mode counter frame (counter 1 22 bits and 5 deltas 32 bits, LoRaWAN)":
            res_str = res_str + 'ubyte[4] legacy_counter5;' + 'ubyte[4] legacy_counter4;' + 'ubyte[4] legacy_counter3;' + 'ubyte[4] legacy_counter2;' + 'ubyte[4] legacy_counter1;' + 'ubyte[4] legacy_counter0;';
            break;
        case "LoRaWAN test frame":
            res_str = res_str + 'ubyte[4] legacy_counter1;';
            break;
        case "Frame 39 ECO mode counter (counter 1 20 bits and five concatenated 12-bit deltas, Sigfox)":
            res_str = res_str + 'ubyte[10] sigfox;';
            break;
        case "Frame 3A ECO mode counter (counter 1 20 bits and five concatenated 12-bit deltas, Sigfox)":
            res_str = res_str + 'ubyte[10] sigfox;';
            break;
        case "Frame 3B ECO mode counter (counter 1 20 bits and five concatenated 12-bit deltas, Sigfox)":
            res_str = res_str + 'ubyte[10] sigfox;';
            break;
        case "0-10 V value periodic report frame":
            res_str = res_str + 'ubyte logic_level_dinda;' + 'ubyte[2] voltage_analog;';
            break;
        case "0-20 mA value periodic report frame":
            res_str = res_str + 'ubyte logic_level_dinda;' + 'ubyte[2] current_analog;';
            break;
        case "0-10 V value LOW alert frame":
            res_str = res_str + 'ubyte logic_level_dinda;' + 'ubyte[2] voltage_analog;';
            break;
        case "4-20 mA value LOW alert frame":
            res_str = res_str + 'ubyte logic_level_dinda;' + 'ubyte[2] current_analog;' + 'ubyte offset;';
            break;
        case "0-10 V value end of LOW alert frame":
            res_str = res_str + 'ubyte logic_level_dinda;' + 'ubyte[2] voltage_analog;';
            break;
        case "4-20 mA value end of LOW alert frame":
            res_str = res_str + 'ubyte logic_level_dinda;' + 'ubyte[2] current_analog;' + 'ubyte offset;';
            break;
        case "0-10 V value HIGH alert frame":
            res_str = res_str + 'ubyte logic_level_dinda;' + 'ubyte[2] voltage_analog;';
            break;
        case "4-20 mA value HIGH alert frame":
            res_str = res_str + 'ubyte logic_level_dinda;' + 'ubyte[2] current_analog;' + 'ubyte offset;';
            break;
        case "0-10 V value end of HIGH alert frame":
            res_str = res_str + 'ubyte logic_level_dinda;' + 'ubyte[2] voltage_analog;';
            break;
        case "4-20 mA value end of HIGH alert frame":
            res_str = res_str + 'ubyte logic_level_dinda;' + 'ubyte[2] current_analog;' + 'ubyte offset;';
            break;

        case "Temperature S1 < low threshold and temperature S2 < low threshold":
        case "Temperature S1 < low threshold and temperature S2 between thresholds":
        case "Temperature S1 < low threshold and temperature S2 > high threshold":
        case "Temperature S1 between thresholds and temperature S2 < low threshold":
        case "Temperature S1 between thresholds and temperature S2 between thresholds":
        case "Temperature S1 between thresholds and temperature S2 > high threshold":
        case "Temperature S1 > high threshold and temperature S2 < low threshold":
        case "Temperature S1 > high threshold and temperature S2 between thresholds":
        case "Temperature S1 > high threshold and temperature S2 > high threshold":
            res_str = res_str + 'ubyte[2] temperature_TMXD_S1;' + 'ubyte[2] temperature_TMXD_S2;';
            break;

        //TM1D
        case "Temperature periodic report frame":
        case "Temperature periodic report frame":
        case "Low threshold crossing detected TM2D":
        case "Low threshold crossing ended TM2D":
        case "High threshold crossing detected TM2D":
        case "High threshold crossing ended TM2D":
            res_str = res_str + 'ubyte[2] temperature_TMXD_S1;' + 'ubyte[2] temperature_TMXD_S2;';
            break;

        //TM2D
        case "Two temperatures periodic report frame":
        case "Low threshold crossing detected TM1D":
        case "Low threshold crossing ended TM1D":
        case "High threshold crossing detected TM1D":
        case "High threshold crossing ended TM1D":
            res_str = res_str + 'ubyte[2] temperature_TMXD_S1;';
            break;

    }
    data.data = res_str;
    return data;
}

function decode_json(data_json, frame) {

    var declarationString = data_json;
    var str = declarationString.split(';');
    var inputString = frame;

    //console.log(str);
    var length_prev = 0;
    var data = {};

    for (var w = 0; w < str.length; w++) {
        declarationString = str[w];
        declarationString = declarationString.split(' ');

        // Extract the variable types and names from the declaration
        var variables = [];
        if (isNaN(parseInt(declarationString[0][6]))) {
            var length = 1;
        } else if (isNaN(parseInt(declarationString[0][7]))) {
            var length = parseInt(declarationString[0][6]);
        } else {
            var length = parseInt(parseInt(declarationString[0][6]) * 10 + parseInt(declarationString[0][7]));
        }
        var variable = {
            type: declarationString[0],
            name: declarationString[1],
            length: length
        };
        variables.push(variable);

        // Split the hex string using the variable declarations
        var currentIndex = length_prev;
        for (var i = 0; i < variables.length; i++) {
            var variable = variables[i];
            var bytesHex = inputString.substr(currentIndex, variable.length * 2);
            currentIndex += variable.length * 2;

            var bytesDecimal = [];
            for (var j = 0; j < bytesHex.length; j += 2) {
                bytesDecimal.push(parseInt(bytesHex.substr(j, 2), 16));
            }

            if (variable.length === 1) {
                data[variable.name] = bytesDecimal[0];
            } else {
                data[variable.name] = bytesDecimal;
            }

        }
        length_prev += variable.length * 2;
    }

    var output = {};
    for (var key in data) {
        if (data.hasOwnProperty(key) && key !== "undefined") {
            output[key] = data[key];
        }
    }
    return JSON.stringify(output);
}




////// ENCODER //////

// --------------------------
// ACW_CFG_PARAM_INx
// --------------------------
//Event mode                                        byte 0 - b0,2
var ACW_CFG_PARAM_IN_EVENT_DISABLE = 0x00;
var ACW_CFG_PARAM_IN_EVENT_EDGE = 0x01;
var ACW_CFG_PARAM_IN_EVENT_COUNTER1 = 0x02;
var ACW_CFG_PARAM_IN_EVENT_COUNTER2 = 0x03;
var ACW_CFG_PARAM_IN_EVENT_COUNTER3 = 0x04;
var ACW_CFG_PARAM_IN_EVENT_COUNTER4 = 0x05;
var ACW_CFG_PARAM_IN_EVENT_ANALOG = 0x06;
var ACW_CFG_PARAM_IN_EVENT_I2C = 0x07;
var ACW_CFG_PARAM_IN_EVENT_UART = 0x08;

//Pull type                             					  byte 0 - b5,4
var ACW_CFG_PARAM_IN_PULL_UP = 0x10;
var ACW_CFG_PARAM_IN_PULL_DOWN = 0x20;

//Trigger mode                          					  byte 0 - b6,7
var ACW_CFG_PARAM_IN_TRIGGER_RISING = 0x40;
var ACW_CFG_PARAM_IN_TRIGGER_FALLING = 0x80;
var ACW_CFG_PARAM_IN_TRIGGER_RISING_FALLING = 0xc0;

//ANALOG MODE
var ACW_CFG_PARAM_IN_ANALOG_420 = (1 << 0 << 4);
var ACW_CFG_PARAM_IN_ANALOG_010 = (1 << 1 << 4);
var ACW_CFG_PARAM_IN_ANALOG_36 = (1 << 2 << 4);

// --------------------------
// ACW_CFG_PARAM_SENSORS_ENABLED -> 1 byte
// --------------------------
var ACW_CFG_PARAM_NO_SENSOR_ACTIVATED = 0x00;
var ACW_CFG_PARAM_SENSOR_INTERNAL_SHT30_ACTIVATED = 0x01;
var ACW_CFG_PARAM_SENSOR_EXTERNAL_SHT30_ACTIVATED = 0x02;
var ACW_CFG_PARAM_SENSOR_ACC_ACTIVATED = 0x04;
var ACW_CFG_PARAM_BOTH_SENSORS_ACTIVATED = ((ACW_CFG_PARAM_SENSOR_INTERNAL_SHT30_ACTIVATED) | (ACW_CFG_PARAM_SENSOR_EXTERNAL_SHT30_ACTIVATED) | (ACW_CFG_PARAM_SENSOR_ACC_ACTIVATED));
var ACW_CFG_PARAM_BOTH_SENSORS_SHT30_ACTIVATED = ((ACW_CFG_PARAM_SENSOR_INTERNAL_SHT30_ACTIVATED) | (ACW_CFG_PARAM_SENSOR_EXTERNAL_SHT30_ACTIVATED));

// --------------------------
// ACW_CFG_PARAM_RADIO
// --------------------------
var WDGRADIO_LOCAL_SF7 = 0x70;
var WDGRADIO_LOCAL_SF8 = 0x80;
var WDGRADIO_LOCAL_SF9 = 0x90;
var WDGRADIO_LOCAL_SF10 = 0xA0;
var WDGRADIO_LOCAL_SF11 = 0xB0;
var WDGRADIO_LOCAL_SF12 = 0xC0;

// ---------------------------------------
// ACW_CFG_PARAM_SENSORS_ENBLED
// ---------------------------------------
var ACW_CFG_PARAM_SENSORS_TH_BIT = 0;
var ACW_CFG_PARAM_SENSORS_TH_MASK = (1 << ACW_CFG_PARAM_SENSORS_TH_BIT);

var ACW_CFG_PARAM_SENSORS_VOC_BIT = 1;
var ACW_CFG_PARAM_SENSORS_VOC_MASK = (1 << ACW_CFG_PARAM_SENSORS_VOC_BIT);

var ACW_CFG_PARAM_SENSORS_LUM_BIT = 2;
var ACW_CFG_PARAM_SENSORS_LUM_MASK = (1 << ACW_CFG_PARAM_SENSORS_LUM_BIT);

var ACW_CFG_PARAM_SENSORS_CO2_BIT = 3;
var ACW_CFG_PARAM_SENSORS_CO2_MASK = (1 << ACW_CFG_PARAM_SENSORS_CO2_BIT);

var ACW_CFG_PARAM_SENSORS_ALL_MASK = (ACW_CFG_PARAM_SENSORS_TH_MASK | ACW_CFG_PARAM_SENSORS_VOC_MASK | ACW_CFG_PARAM_SENSORS_LUM_MASK | ACW_CFG_PARAM_SENSORS_CO2_MASK)

function encodeDownlink(input) {
    var bytes = [];

    if("setTimestamp" in input.data)
    {
        bytes.push(0x0B);
        bytes.push(input.data.setTimestamp);
    }

    if("setKeepAlivePeriod" in input.data)
    {
        bytes.push(0x03);
        switch (input.data.setKeepAlivePeriod) {
            case "Disable":
                bytes.push(0x00);
                break;
            case "Once every 10 mins":
                bytes.push(0x04);
                break;
            case "Once every hour":
                bytes.push(0x05);
                break;
            case "Once every 2 hours":
                bytes.push(0x0a);
                break;
            case "Once every 4 hours":
                bytes.push(0x0b);
                break;
            case "Once every 8 hours":
                bytes.push(0x0c);
                break;
            case "Once every day":
                bytes.push(0x06);
                break;
            case "Once every 2 days":
                bytes.push(0x0d);
                break;
            case "Once every 3 days":
                bytes.push(0x0e);
                break;
            case "Once every 4 days":
                bytes.push(0x0f);
                break;
            case "Once every week":
                bytes.push(0x07);
                break;
            case "Once every month (30 days)":
                bytes.push(0x08);
                break;
            default:
                bytes.push(0x05);
                break;
        }
    }

    if("setDataloggingPeriod" in input.data)
    {
        bytes.push(0xD4);
        bytes.push(0x03);
        bytes.push(0x01);
        bytes.push(input.data.setDataloggingPeriod & 0xFF);
        bytes.push(input.data.setDataloggingPeriod >> 8);
    }

    return {
        bytes: bytes,
        fPort: 1,
        warnings: [],
        errors: [],
    };
}

function decodeDownlink(input) {
    return {
        data: {
            bytes: input.bytes,
        },
        warnings: [],
        errors: [],
    };
}

function postProcessTimestamp(decoded, data) {
    if (decoded.ts !== undefined) {
        decoded.timestamp = atimTimestamp(decoded.ts);
        delete decoded.ts;
    }
}

function postProcessLegacyPir(decoded, data) {
    if (decoded.type_frame !== undefined) {
        var frame_label = "";
        if (decoded.type_frame === 0x01) frame_label = "Box opening frame";
        if (decoded.type_frame === 0x08) frame_label = "Alarm frame";
        if (decoded.type_frame === 0x10) frame_label = "Counting frame";
        decoded.type_frame = frame_label;
    }
    if (decoded.opening_box !== undefined) {
        decoded.box = decoded.opening_box === 0x00 ? "box open" : "box closed";
        delete decoded.opening_box;
    }
    if (decoded.sensor_dq !== undefined) {
        var dq;
        if (decoded.sensor_dq[1] === 0x00) dq = "Enabled";
        else if (decoded.sensor_dq[1] === 0x01) dq = "Disabled";
        else dq = "Not used";
        decoded.sensor_dq = dq;
    }
    if (decoded.counter_pir !== undefined) {
        decoded.counter_pir = decoded.counter_pir[0] << 8 | decoded.counter_pir[1];
    }
    if (decoded.temperature_pir !== undefined) {
        decoded.temperature_pir = decoded.temperature_pir[0] << 8 | decoded.temperature_pir[1];
    }
}

/* ---------------------------------------------------------------------------
 * Platform adapters
 * ------------------------------------------------------------------------- */

/* ChirpStack v3 */
function Decode(fPort, bytes, variables) {
    return decodeUplink({ bytes: bytes, fPort: fPort, variables: variables }).data;
}

function Encode(fPort, obj, variables) {
    return encodeDownlink({ data: obj, variables: variables }).bytes;
}

/* Node.js / CommonJS */
if (typeof module !== "undefined" && module.exports) {
    module.exports.decodeUplink = decodeUplink;
    module.exports.encodeDownlink = encodeDownlink;
    module.exports.decodeDownlink = decodeDownlink;
}
