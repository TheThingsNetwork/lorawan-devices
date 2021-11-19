/*
    IMBUILDINGS Payload decoder for The Things Network
    ===========================================================
    Version  : 1.1
    Author   : Ronald Conen - IMBUILDINGS B.V.
*/

var portBasedDecoding = true;
var standardPort = 1;

var portDecodingScheme = {};

//Define port decoding rules
portDecodingScheme[26] = {
    metaDataEnable: false,
    payload_type: 2,
    payload_variant: 6
}

portDecodingScheme[27] = {
    metaDataEnable: false,
    payload_type: 2,
    payload_variant: 7
}

function Decoder(bytes, port){
    var decoded = {};
    var portDecoding = undefined;

    if(bytes.length > 2 || portBasedDecoding === true){
        var payload_type = bytes[0];

        //Setup port decoding unless the standardport is used
        if(port != standardPort && portBasedDecoding === true && portDecodingScheme[port] != undefined){
            //Load port decoding rule according to port number
            portDecoding = portDecodingScheme[port];
            if(portDecoding.metaDataEnable === false){

                //Payload type not in payload when metaData is disabled
                payload_type = portDecoding.payload_type;   //get payload type according to port decoding scheme
            }
        }

        switch(payload_type){
            case 1:
                //Comfort Sensor
                decoded = parseComfortSensor(bytes, portDecoding);
                break;
            case 2:
                //People Counter
                decoded = parsePeopleCounter(bytes, portDecoding);
                break;
            case 3:
                //Button
                decoded = parseButton(bytes, portDecoding);
                break;
            case 4:
                //Pulse Counter
                decoded = parsePulseCounter(bytes, portDecoding);
                break;
        }
    }

    return decoded;
}


function bcd(dec) {
    return ((dec / 10) << 4) + (dec % 10);
}

function unbcd(bcd) {
    return ((bcd >> 4) * 10) + bcd % 16;
}

function toHEXString(payload, index, length){
    var HEXString = '';

    for(var i = 0; i < length; i++){
        if(payload[index + i] < 16){
            HEXString = HEXString + '0';
        }
        HEXString = HEXString + payload[index + i].toString(16);
    }

    return HEXString;
}

function readInt16BE(payload, index){
    var int16 = (payload[index] << 8) + payload[++index];

    if(int16 & 0x8000){
        int16 = - (0x10000 - int16);
    }

    return int16;
}

function readUInt16BE(payload, index){
    return (payload[index] << 8) + payload[++index];
}

function readInt8(payload, index){
    var int8 = payload[index];

    if(int8 & 0x80){
        int8 = - (0x100 - int8);
    }

    return int8;
}

function parseComfortSensor(payload, portDecoding){
    var payload_variant = payload[1];

    var deviceData = {
        //received_at: new Date().toISOString(),        //Not supported on TTN
        device_type_identifier: payload[0],
        device_type: 'Comfort Sensor CO2',
        device_type_variant: payload[1],
        device_id: toHEXString(payload, 2, 6),
        battery_voltage: readUInt16BE(payload, 9) / 100,
        rssi: readInt8(payload, 11)
    };

    switch(payload_variant){
        case 1:     //NB-IoT Payload
            if(payload.length != 19) return {};
            deviceData.temperature = readInt16BE(payload, payload.length - 7) / 100;
            deviceData.humidity = readUInt16BE(payload, payload.length - 5) / 100;
            deviceData.presence = payload[payload.length - 1];
            deviceData.co2 = readUInt16BE(payload, payload.length - 3);
            return deviceData;
        case 2:     //NB-IoT Payload
            if(payload.length != 25) return {};
            // var datetime = Date.UTC(
            //     unbcd(payload[12] * 100 + unbcd(payload[13])),
            //     unbcd(payload[14] - 1),
            //     unbcd(payload[15]),
            //     unbcd(payload[16]),
            //     unbcd(payload[17]),
            //     unbcd(payload[18]),
            //     0
            // );
            // deviceData.datetime = datetime.toISOString();        //Not supported on TTN
            deviceData.temperature = readInt16BE(payload, payload.length - 7) / 100;
            deviceData.humidity = readUInt16BE(payload, payload.length - 5) / 100;
            deviceData.presence = payload[payload.length - 1];
            deviceData.co2 = readUInt16BE(payload, payload.length - 3);
            return deviceData;
        case 3:
            if(payload.length != 20) return {};
            deviceData.device_id = toHEXString(payload, 2, 8);
            deviceData.device_status = payload[10];
            deviceData.battery_voltage = readUInt16BE(payload, 11) / 100;
            delete deviceData.rssi;
            deviceData.temperature = readUInt16BE(payload, payload.length - 7) / 100;
            deviceData.humidity = readUInt16BE(payload, payload.length - 5) / 100;
            deviceData.presence = payload[payload.length - 1];
            deviceData.co2 = readUInt16BE(payload, payload.length - 3);
            //deviceData.pressure = readUInt16BE(payload , 20);
            //deviceData.ligth = //To be implemented
            return deviceData;
        case 4:     //NB-IoT Payload for North, temperatures
            if(payload.length != 18) return {};
            deviceData.min_temperature = readInt16BE(payload, payload.length - 6) / 100;
            deviceData.max_temperature = readUInt16BE(payload, payload.length - 4) / 100;
            //deviceData.presence = payload[payload.length - 1];
            deviceData.current_temperature = readUInt16BE(payload, payload.length - 2) / 100;
            return deviceData;
        case 5:     //NB-IoT Payload for North, presence alert
            if(payload.length != 13) return {};
            deviceData.presence_event = payload[12];
            return deviceData;
    }

    return {};
}

function parsePeopleCounter(payload, portDecoding){
    var indexOrigin = 0;
    var deviceData = {};
    var parseMetaData = true;
    var payload_variant = payload[1];


    if(portDecoding != undefined){
        payload_variant = portDecoding.payload_variant;
        parseMetaData = portDecoding.metaDataEnable;
    }


    var deviceData = {};
    if(parseMetaData === true){
        //received_at: new Date().toISOString(),        //Not supported on TTN
        deviceData.device_type_identifier = payload[0],
        deviceData.device_type = 'People Counter',
        deviceData.device_type_variant = payload[1],
        deviceData.device_id = toHEXString(payload, 2, 6),
        deviceData.device_status = payload[8],
        deviceData.battery_voltage = readUInt16BE(payload, 9) / 100,
        deviceData.rssi = readInt8(payload, 11)
    }

    switch(payload_variant){
        case 1:     //NB-IoT People Counter payload
            if(payload.length != 22) return {};
            break;
        case 2:     //NB-IoT People Counter payload
            if(payload.length != 15) return {};
            deviceData.counter_a = payload[payload.length - 3];
            deviceData.counter_b = payload[payload.length - 2];
            deviceData.sensor_status = payload[payload.length - 1];
            return deviceData;
        case 3:     //NB-IoT People Counter payload
            if(payload.length != 17) return {};
            deviceData.counter_a = readUInt16BE(payload, payload.length - 5);
            deviceData.counter_b = readUInt16BE(payload, payload.length - 3);
            deviceData.sensor_status = payload[payload.length - 1];
            return deviceData;
        case 4:     //NB-IoT People Counter payload
            if(payload.length != 24) return {};
            // var datetime = new Date.UTC(
            //     unbcd(payload[12] * 100 + unbcd(payload[13])),
            //     unbcd(payload[14] - 1),
            //     unbcd(payload[15]),
            //     unbcd(payload[16]),
            //     unbcd(payload[17]),
            //     unbcd(payload[18]),
            //     0
            // );
            // deviceData.datetime = datetime.toISOString();        //Not supported on TTN
            deviceData.counter_a = readUInt16BE(payload, payload.length - 5);
            deviceData.counter_b = readUInt16BE(payload, payload.length - 3);
            deviceData.sensor_status = payload[payload.length - 1];
            return deviceData;
        case 5:     //LoRaWAN People Counter payload
            if(payload.length != 19) return {};
            deviceData.device_id = toHEXString(payload, 2, 8);
            deviceData.device_status = payload[10];
            deviceData.battery_voltage = readUInt16BE(payload, 11) / 100;
            delete deviceData.rssi;
            deviceData.counter_a = readUInt16BE(payload, payload.length - 6);
            deviceData.counter_b = readUInt16BE(payload, payload.length - 4);
            deviceData.sensor_status = payload[payload.length - 2];
            deviceData.payload_counter = payload[payload.length - 1];
            return deviceData;
        case 6:     //LoRaWAN People Counter payload
            if(payload.length != 23 && parseMetaData === true) return {};
            if(parseMetaData === true){
                deviceData.device_id = toHEXString(payload, 2, 8);
                delete deviceData.rssi;

                indexOrigin = 10;
            }

            deviceData.device_status = payload[payload.length - 13];
            deviceData.battery_voltage = readUInt16BE(payload, payload.length - 12) / 100;
            deviceData.counter_a = readUInt16BE(payload, payload.length - 10);
            deviceData.counter_b = readUInt16BE(payload, payload.length - 8);
            deviceData.sensor_status = payload[payload.length - 6];
            deviceData.total_counter_a = readUInt16BE(payload, payload.length - 5);
            deviceData.total_counter_b = readUInt16BE(payload, payload.length - 3);
            deviceData.payload_counter = payload[payload.length - 1];
            return deviceData;
        case 7:     //LoRaWAN People Counter
            if(parseMetaData === true){
                deviceData.device_id = toHEXString(payload, 2, 8);
                deviceData.device_status = payload[10];
                deviceData.battery_voltage = readUInt16BE(payload, 11) / 100;
                delete deviceData.rssi;

                indexOrigin = 10;
            }

            deviceData.sensor_status = payload[payload.length - 5];
            deviceData.total_counter_a = readUInt16BE(payload, payload.length - 4);
            deviceData.total_counter_b = readUInt16BE(payload, payload.length - 2);

            return deviceData;
    }

    return {};
}

function parseButton(payload, portDecoding){
    var payload_variant = payload[1];

    var deviceData = {
        //received_at: new Date().toISOString(),        //Not supported on TTN
        device_type_identifier: payload[0],
        device_type: 'Button',
        device_type_variant: payload[1],
        device_id: toHEXString(payload, 2, 6),
        device_status: payload[8],
        battery_voltage: readUInt16BE(payload, 9) / 100,
        rssi: readInt8(payload, 11),
        button_pressed: 0x01 & payload[12]
    };

    switch(payload_variant){
        case 1:     //NB-IoT Payload
        case 3:     //NB-IoT Payload
            if(payload.length != 13) return {};
            return deviceData;
        case 2:     //NB-IoT Payload
            if(payload.length != 20) return {};
            deviceData.button_pressed = 0x01 & payload[19];
            // var datetime = new Date.UTC(
            //     unbcd(payload[12] * 100 + unbcd(payload[13])),
            //     unbcd(payload[14] - 1),
            //     unbcd(payload[15]),
            //     unbcd(payload[16]),
            //     unbcd(payload[17]),
            //     unbcd(payload[18]),
            //     0
            // );
            // deviceData.datetime.toISOString();       //Not supported on TTN
            return deviceData;
    }

    return {};
}

function parsePulseCounter(payload, portDecoding){
    var payload_variant = payload[1];

    var deviceData = {
        //received_at: new Date().toISOString(),        //Not supported on TTN
        device_type_identifier: payload[0],
        device_type: 'Counter',
        device_type_variant: payload[1],
        device_id: toHEXString(payload, 2, 6),
        device_status: payload[8],
        battery_voltage: readUInt16BE(payload, 9) / 100,
        rssi: readInt8(payload, 11),
        counter: payload[19]
    };

    switch(payload_variant){
        case 1:     //NB-IoT Payload
            if(payload.length != 20) return {};
            return deviceData;
    }

    return {};
}

function decodeUplink(input) {
  return { data: Decoder(input.bytes, input.fPort) };
}

