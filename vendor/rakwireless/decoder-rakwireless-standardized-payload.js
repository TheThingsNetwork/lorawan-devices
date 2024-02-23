// Source:
// https://github.com/RAKWireless/RAKwireless_Standardized_Payload/blob/main/RAKwireless_Standardized_Payload.js

/**
 * @reference https://github.com/myDevicesIoT/cayenne-docs/blob/master/docs/LORA.md
 * @reference http://openmobilealliance.org/wp/OMNA/LwM2M/LwM2MRegistry.html#extlabel
 *
 * Adapted for lora-app-server from https://gist.github.com/iPAS/e24970a91463a4a8177f9806d1ef14b8
 *
 * Type                 IPSO    LPP     Hex     Data Size   Data Resolution per bit
 *  Digital Input       3200    0       0       1           1
 *  Digital Output      3201    1       1       1           1
 *  Analog Input        3202    2       2       2           0.01 Signed
 *  Analog Output       3203    3       3       2           0.01 Signed
 *  Illuminance Sensor  3301    101     65      2           1 Lux Unsigned MSB
 *  Presence Sensor     3302    102     66      1           1
 *  Temperature Sensor  3303    103     67      2           0.1 °C Signed MSB
 *  Humidity Sensor     3304    104     68      1           0.5 % Unsigned
 *  Accelerometer       3313    113     71      6           0.001 G Signed MSB per axis
 *  Barometer           3315    115     73      2           0.1 hPa Unsigned MSB
 *  Time                3333    133     85      4           Unix time MSB
 *  Gyrometer           3334    134     86      6           0.01 °/s Signed MSB per axis
 *  GPS Location        3336    136     88      9           Latitude  : 0.0001 ° Signed MSB
 *                                                          Longitude : 0.0001 ° Signed MSB
 *                                                          Altitude  : 0.01 meter Signed MSB
 *
 * Additional types
 *  Generic Sensor      3300    100     64      4           Unsigned integer MSB
 *  Voltage             3316    116     74      2           0.01 V Unsigned MSB
 *  Current             3317    117     75      2           0.001 A Unsigned MSB
 *  Frequency           3318    118     76      4           1 Hz Unsigned MSB
 *  Percentage          3320    120     78      1           1% Unsigned
 *  Altitude            3321    121     79      2           1m Signed MSB
 *  Concentration       3325    125     7D      2           1 PPM unsigned : 1pmm = 1 * 10 ^-6 = 0.000 001
 *  Power               3328    128     80      2           1 W Unsigned MSB
 *  Distance            3330    130     82      4           0.001m Unsigned MSB
 *  Energy              3331    131     83      4           0.001kWh Unsigned MSB
 *  Colour              3335    135     87      3           R: 255 G: 255 B: 255
 *  Direction           3332    132     84      2           1º Unsigned MSB
 *  Switch              3342    142     8E      1           0/1
 * 
 *  RAKwireless specific types
 *  GPS Location        3337    137     89      11          Higher precision location information
 *                                                          Latitude  : 0.000001 ° Signed MSB
 *                                                          Longitude : 0.000001 ° Signed MSB
 *                                                          Altitude  : 0.01 meter Signed MSB
 *  VOC index           3338    138     8A      1           VOC index
 *  Wind Speed          3390    190     BE      2           Wind speed 0.01 m/s
 *  Wind Direction      3391    191     BF      2           Wind direction 1º Unsigned MSB
 *  Light Level         3403    203     CB      1           0 0-5 lux, 1 6-50 lux, 2 51-100 lux, 3 101-500 lux, 4 501-2000 lux, 6 >2000 lux
 *  Soil Moisture       3388    188     BC      2           0.1 % in 0~100% (m3/m3)
 *  Soil EC             3392    192     C0      2           0.001, mS/cm
 *  Soil pH high prec.  3393    193     C1      2           0.01 pH
 *  Soil pH low prec.   3394    194     C2      2           0.1 pH
 *  Pyranometer         3395    195     C3      2           1 unsigned MSB (W/m2)
 *  Precise Humidity    3312    112     70      2           0.1 %RH
 * 
 */

// lppDecode decodes an array of bytes into an array of ojects, 
// each one with the channel, the data type and the value.
function lppDecode(bytes) {

	var sensor_types = {
		0: { 'size': 1, 'name': 'digital_in', 'signed': false, 'divisor': 1 },
		1: { 'size': 1, 'name': 'digital_out', 'signed': false, 'divisor': 1 },
		2: { 'size': 2, 'name': 'analog_in', 'signed': true, 'divisor': 100 },
		3: { 'size': 2, 'name': 'analog_out', 'signed': true, 'divisor': 100 },
		100: { 'size': 4, 'name': 'generic', 'signed': false, 'divisor': 1 },
		101: { 'size': 2, 'name': 'illuminance', 'signed': false, 'divisor': 1 },
		102: { 'size': 1, 'name': 'presence', 'signed': false, 'divisor': 1 },
		103: { 'size': 2, 'name': 'temperature', 'signed': true, 'divisor': 10 },
		104: { 'size': 1, 'name': 'humidity', 'signed': false, 'divisor': 2 },
		112: { 'size': 2, 'name': 'humidity_prec', 'signed': true, 'divisor': 10 },
		113: { 'size': 6, 'name': 'accelerometer', 'signed': true, 'divisor': 1000 },
		115: { 'size': 2, 'name': 'barometer', 'signed': false, 'divisor': 10 },
		116: { 'size': 2, 'name': 'voltage', 'signed': false, 'divisor': 100 },
		117: { 'size': 2, 'name': 'current', 'signed': false, 'divisor': 1000 },
		118: { 'size': 4, 'name': 'frequency', 'signed': false, 'divisor': 1 },
		120: { 'size': 1, 'name': 'percentage', 'signed': false, 'divisor': 1 },
		121: { 'size': 2, 'name': 'altitude', 'signed': true, 'divisor': 1 },
		125: { 'size': 2, 'name': 'concentration', 'signed': false, 'divisor': 1 },
		128: { 'size': 2, 'name': 'power', 'signed': false, 'divisor': 1 },
		130: { 'size': 4, 'name': 'distance', 'signed': false, 'divisor': 1000 },
		131: { 'size': 4, 'name': 'energy', 'signed': false, 'divisor': 1000 },
		132: { 'size': 2, 'name': 'direction', 'signed': false, 'divisor': 1 },
		133: { 'size': 4, 'name': 'time', 'signed': false, 'divisor': 1 },
		134: { 'size': 6, 'name': 'gyrometer', 'signed': true, 'divisor': 100 },
		135: { 'size': 3, 'name': 'colour', 'signed': false, 'divisor': 1 },
		136: { 'size': 9, 'name': 'gps', 'signed': true, 'divisor': [10000, 10000, 100] },
		137: { 'size': 11, 'name': 'gps', 'signed': true, 'divisor': [1000000, 1000000, 100] },
		138: { 'size': 2, 'name': 'voc', 'signed': false, 'divisor': 1 },
		142: { 'size': 1, 'name': 'switch', 'signed': false, 'divisor': 1 },
		188: { 'size': 2, 'name': 'soil_moist', 'signed': false, 'divisor': 10 },
		190: { 'size': 2, 'name': 'wind_speed', 'signed': false, 'divisor': 100 },
		191: { 'size': 2, 'name': 'wind_direction', 'signed': false, 'divisor': 1 },
		192: { 'size': 2, 'name': 'soil_ec', 'signed': false, 'divisor': 1000 },
		193: { 'size': 2, 'name': 'soil_ph_h', 'signed': false, 'divisor': 100 },
		194: { 'size': 2, 'name': 'soil_ph_l', 'signed': false, 'divisor': 10 },
		195: { 'size': 2, 'name': 'pyranometer', 'signed': false, 'divisor': 1 },
		203: { 'size': 1, 'name': 'light', 'signed': false, 'divisor': 1 },
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

	var sensors = [];
	var i = 0;
	while (i < bytes.length) {

		var s_no = bytes[i++];
		var s_type = bytes[i++];
		if (typeof sensor_types[s_type] == 'undefined') {
			throw 'Sensor type error!: ' + s_type;
		}

		var s_value = 0;
		var type = sensor_types[s_type];
		switch (s_type) {

			case 113:   // Accelerometer
			case 134:   // Gyrometer
				s_value = {
					'x': arrayToDecimal(bytes.slice(i + 0, i + 2), type.signed, type.divisor),
					'y': arrayToDecimal(bytes.slice(i + 2, i + 4), type.signed, type.divisor),
					'z': arrayToDecimal(bytes.slice(i + 4, i + 6), type.signed, type.divisor)
				};
				break;
			case 136:   // GPS Location
				s_value = {
					'latitude': arrayToDecimal(bytes.slice(i + 0, i + 3), type.signed, type.divisor[0]),
					'longitude': arrayToDecimal(bytes.slice(i + 3, i + 6), type.signed, type.divisor[1]),
					'altitude': arrayToDecimal(bytes.slice(i + 6, i + 9), type.signed, type.divisor[2])
				};
				break;
			case 137:   // Precise GPS Location
				s_value = {
					'latitude': arrayToDecimal(bytes.slice(i + 0, i + 4), type.signed, type.divisor[0]),
					'longitude': arrayToDecimal(bytes.slice(i + 4, i + 8), type.signed, type.divisor[1]),
					'altitude': arrayToDecimal(bytes.slice(i + 8, i + 11), type.signed, type.divisor[2])
				};
				sensors.push({
					'channel': s_no,
					'type': s_type,
					'name': 'location',
					'value': "(" + s_value.latitude + "," + s_value.longitude + ")"
				});
				sensors.push({
					'channel': s_no,
					'type': s_type,
					'name': 'altitude',
					'value': s_value.altitude
				});
				break;
			case 135:   // Colour
				s_value = {
					'r': arrayToDecimal(bytes.slice(i + 0, i + 1), type.signed, type.divisor),
					'g': arrayToDecimal(bytes.slice(i + 1, i + 2), type.signed, type.divisor),
					'b': arrayToDecimal(bytes.slice(i + 2, i + 3), type.signed, type.divisor)
				};
				break;

			default:    // All the rest
				s_value = arrayToDecimal(bytes.slice(i, i + type.size), type.signed, type.divisor);
				break;
		}

		sensors.push({
			'channel': s_no,
			'type': s_type,
			'name': type.name,
			'value': s_value
		});

		i += type.size;

	}

	return sensors;

}

function decodeUplink(input) {

	bytes = input.bytes;
	fPort = input.fPort;

	var response = {};
	lppDecode(bytes, 1).forEach(function (field) {
		response[field['name'] + '_' + field['channel']] = field['value'];
	});

	return {
		data: response,
		warnings: [],
		errors: []
	};

}