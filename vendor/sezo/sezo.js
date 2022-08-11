function decodeUplink(input) {

  /**
     * @reference https://github.com/myDevicesIoT/cayenne-docs/blob/master/docs/LORA.md
     *
     *
     * Type                 IPSO    LPP     Hex     Data Size   Data Resolution per bit
     *  Digital Input       3200    0       0       1           1
     *  Digital Output      3201    1       1       1           1
     *  Analog Input        3202    2       2       2           0.01 Signed
     *  Analog Output       3203    3       3       2           0.01 Signed
	 *  Counter Input       5501    4       4       2           1 event Unsigned MSB
     *  Illuminance Sensor  3301    101     65      2           1 Lux Unsigned MSB
     *  Presence Sensor     3302    102     66      1           1
     *  Temperature Sensor  3303    103     67      2           0.1 °C Signed MSB
     *  Humidity Sensor     3304    104     68      1           0.5 % Unsigned
     *  Accelerometer       3313    113     71      6           0.001 G Signed MSB per axis
     *  Barometer           3315    115     73      2           0.1 hPa Unsigned MSB
     *  Gyrometer           3334    134     86      6           0.01 °/s Signed MSB per axis
     *  GPS Location        3336    136     88      9           Latitude  : 0.0001 ° Signed MSB
     *                                                          Longitude : 0.0001 ° Signed MSB
     *                                                          Altitude  : 0.01 meter Signed MSB
	SEZO specific types
	 *	Loudness			  -		200		C8		2			0.01 Signed
	 *	Particle Matter PM1   -		201		C9		1			1
	 *	Particle Matter PM2.5 -		202		CA		1			1
	 *	Particle Matter PM4   -		203		CB		1			1
	 *	Particle Matter PM10  -		204		CC		1			1	 
	 *  Index air quality	  -		205		CD		2			1
     */
    var sensor_types = {
            0  : {'size': 1, 'name': 'digital_input', 'readable_name': 'Digital Input', 'signed': false, 'divisor': 1,},
            1  : {'size': 1, 'name': 'digital_output', 'readable_name': 'Digital Output', 'signed': false, 'divisor': 1,},
            2  : {'size': 2, 'name': 'analog_input', 'readable_name': 'Analog Input', 'signed': true , 'divisor': 100,},
            3  : {'size': 2, 'name': 'analog_output', 'readable_name': 'Analog Output', 'signed': true , 'divisor': 100,},
            4  : {'size': 2, 'name': 'counter_input', 'readable_name': 'Counter Input', 'signed': false, 'divisor': 1,},
            101: {'size': 2, 'name': 'luminosity', 'readable_name': 'Illuminance Sensor', 'signed': false, 'divisor': 1,},
            102: {'size': 1, 'name': 'presence', 'readable_name': 'Presence Sensor', 'signed': false, 'divisor': 1,},
            103: {'size': 2, 'name': 'temperature', 'readable_name': 'Temperature Sensor', 'signed': true , 'divisor': 10,},
            104: {'size': 1, 'name': 'humidity', 'readable_name': 'Humidity Sensor', 'signed': false, 'divisor': 2,},
            113: {'size': 6, 'name': 'accelerometer', 'readable_name': 'Accelerometer', 'signed': true ,  'divisor': [1000,1000,1000],},
            114: {'size': 6, 'name': 'magnetometer', 'readable_name': 'Magnetometer', 'signed': true , 'divisor': [1000,1000,1000],},
            115: {'size': 2, 'name': 'barometer', 'readable_name': 'Barometer', 'signed': false, 'divisor': 10,},
            134: {'size': 6, 'name': 'gyrometer', 'readable_name': 'Gyrometer', 'signed': true , 'divisor': 100,},
            136: {'size': 9, 'name': 'gps_location', 'readable_name': 'GPS Location', 'signed': false, 'divisor': [10000,10000,100],},
			//SEZO specific types
            200: {'size': 2, 'name': 'battery', 'readable_name': 'Battery', 'signed': false , 'divisor': 100,},
            201: {'size': 2, 'name': 'loudness', 'readable_name': 'Loudness', 'signed': true , 'divisor': 100,},
			202: {'size': 1, 'name': 'PM1', 'readable_name': 'PM1', 'signed': false, 'divisor': 1,},
			203: {'size': 1, 'name': 'PM2_5', 'readable_name': 'PM2_5', 'signed': false, 'divisor': 1,},
			204: {'size': 1, 'name': 'PM4', 'readable_name': 'PM4', 'signed': false, 'divisor': 1,},
			205: {'size': 1, 'name': 'PM10', 'readable_name': 'PM10', 'signed': false, 'divisor': 1,},
			206: {'size': 2, 'name': 'IAQ', 'readable_name': 'IAQ', 'signed': false, 'divisor': 1,},
			207: {'size': 2, 'name': 'UV', 'readable_name': 'UV Sensor', 'signed': false, 'divisor': 1,},
 			208: {'size': 2, 'name': 'EXT_temperature', 'readable_name': 'External Temperature Sensor', 'signed': true , 'divisor': 10,},
            209: {'size': 1, 'name': 'EXT_humidity', 'readable_name': 'External Humidity Sensor', 'signed': false, 'divisor': 2,},
			210: {'size': 2, 'name': 'EXT_barometer', 'readable_name': 'Barometer', 'signed': false, 'divisor': 10,},
			211: {'size': 1, 'name': 'IAQ_accuracy', 'readable_name': 'IAQ accuracy', 'signed': false, 'divisor': 1,}
		};

    function arrayToDecimal(stream, is_signed, divisor) {
        var value = 0;
        for (var i = 0; i < stream.length; i++) {
            if (stream[i] > 0xFF)
                throw 'Byte value overflow!';
            value = (value << 8) | stream[i];
        }

        if (is_signed) {
            var edge = 1 << (stream.length) * 8;  // 0x1000..
            var max = (edge - 1) >> 1;             // 0x0FFF.. >> 1
            value = (value > max) ? value - edge : value;
        }
        
        value /= divisor;

        return value;
    }
    var bytes = input.bytes;
    var sensors = {};
    var i = 0;
	while (i < bytes.length) {
	    // console.log(i);
	    // console.log(typeof bytes[i])
	    // console.log(bytes[i].toString())
	    var s_no   = bytes[i++];
		var s_type = bytes[i++];
		if (typeof sensor_types[s_type] == 'undefined')
		    throw 'Sensor type error!: ' + s_type;
	    var s_size = sensor_types[s_type].size;
	    var s_name = sensor_types[s_type].name;

	    switch (s_type) {
    	    case 0  :  // Digital Input
            case 1  :  // Digital Output
            case 2  :  // Analog Input
            case 3  :  // Analog Output
            case 4  :  // Counter input
            case 101:  // Illuminance Sensor
            case 102:  // Presence Sensor
            case 103:  // Temperature Sensor
            case 104:  // Humidity Sensor
            case 115:  // Barometer
            case 134:  // Gyrometer
			case 200:  // Battery
            case 201:  // Loudness
            case 202:  // PM1
            case 203:  // PM2.5
            case 204:  // PM4
            case 205:  // PM10
			case 206:  // IAQ
			case 207:  // UV radiation
			case 208:  // External temperature
			case 209:  // External Relative Humidity
			case 210:  // External Pressure
			case 211:  // External Pressure
			var s_value = arrayToDecimal(bytes.slice(i, i+s_size),
            is_signed     = sensor_types[s_type].signed,
            divisor = sensor_types[s_type].divisor);
             break;
			case 113:  // Accelerometer
			case 114:  // Magnetometer 
			var s_value = {
                        'x':  arrayToDecimal(bytes.slice(i+0, i+2), is_signed=sensor_types[s_type].signed, divisor=sensor_types[s_type].divisor[0]),
                        'y': arrayToDecimal(bytes.slice(i+2, i+4), is_signed=sensor_types[s_type].signed, divisor=sensor_types[s_type].divisor[1]),
                        'z':  arrayToDecimal(bytes.slice(i+4, i+6), is_signed=sensor_types[s_type].signed, divisor=sensor_types[s_type].divisor[2])};
             break;
            case 136:  // GPS Location
                var s_value = {
                        'latitude':  arrayToDecimal(bytes.slice(i+0, i+3), is_signed=sensor_types[s_type].signed, divisor=sensor_types[s_type].divisor[0]),
                        'longitude': arrayToDecimal(bytes.slice(i+3, i+6), is_signed=sensor_types[s_type].signed, divisor=sensor_types[s_type].divisor[1]),
                        'altitude':  arrayToDecimal(bytes.slice(i+6, i+9), is_signed=sensor_types[s_type].signed, divisor=sensor_types[s_type].divisor[2])};
                 break;
        }
        if (typeof(sensors[s_name]) === "undefined") {
            sensors[s_name] = {};
        }
        sensors[s_name] = s_value;
	    // sensors[s_no] = {'type': s_type, 'type_name': s_name, 'value': s_value };
	    i += s_size;
	}

	return {data: sensors};
}

function encodeDownlink(input) {
    var i = colors.indexOf(input.data.led);
    if (i === -1) {
        return {
            errors: ['invalid LED color'],
        };
    }
    return {
        // LoRaWAN FPort used for the downlink message
        fPort: 2,
        // Encoded bytes
        bytes: [i],
    };
}

function decodeDownlink(input) {
    switch (input.fPort) {
        case 2:
            return {
                // Decoded downlink (must be symmetric with encodeDownlink)
                data: {
                    led: colors[input.bytes[0]],
                },
            };
        default:
            return {
                errors: ['invalid FPort'],
            };
    }
}
