function decodeUplink(input) {
	return {
	  data : Decoder(input.bytes, input.fPort),
	};
}

function Decoder(bytes, port) {
    var decoded = {};

    for (var i = 0; i < bytes.length;) {

        var channel_id = bytes[i++];

        var channel_type = bytes[i++];

        // BATTERY

        if (channel_id === 0x01 && channel_type === 0x75) {

            decoded.battery = bytes[i];

            i += 1;

        }

        // TEMPERATURE

        else if (channel_id === 0x03 && channel_type === 0x67) {

            decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;

            i += 2;

        }

        // HUMIDITY

        else if (channel_id === 0x04 && channel_type === 0x68) {

            decoded.humidity = bytes[i] / 2;

            i += 1;

        }



        else {

            break;

        }

    }

    return decoded;

}

function normalizeUplink(input) {
    var data = {};
    var air = {};

    if (input.data.temperature) {
        air.temperature = input.data.temperature;
    }

    if (input.data.humidity) {
        air.relativeHumidity = input.data.humidity;
    }

    if (Object.keys(air).length > 0) {
        data.air = air;
    }

    if (input.data.battery) {
        data.battery = input.data.battery;
    }

    return { data: data };
}

/* ******************************************
 * bytes to number
 ********************************************/

function readUInt16LE(bytes) {

    var value = (bytes[1] << 8) + bytes[0];

    return value & 0xffff;

}



function readInt16LE(bytes) {

    var ref = readUInt16LE(bytes);

    return ref > 0x7fff ? ref - 0x10000 : ref;

}
