function decodeUplink(input){
	var data = {};
	data.sensorType = 'moisture';

	if (input.bytes.length === 0){
		data.valid = false;
		return{
			data: data
		}
	}

	data.settingsAllowed = true;
	data.moisture = 0;
	data.charging = false;
	data.battery = 2 + (input.bytes[0] / 10);

	if (input.fPort === 1){
		if (input.bytes.length === 3){
			data.valid = true;
			data.moisture = input.bytes[1];

			var temp = input.bytes[2];
			if (temp > 127){
				temp = temp - 256;
			}
			data.temperature = temp;
		}
		else if (input.bytes.length === 6){
			data.valid = true;
			data.moisture = input.bytes[1];

			var temp = input.bytes[2]<<24>>16 | input.bytes[3];
			data.temperature = temp / 100;
		} else{
			data.valid = false;
			data.errorcode = -1;
		}
	} else if (input.fPort === 3){
		data.valid = false;
		data.charging = true;
	}

	return{
		data: data
	}
}