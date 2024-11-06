function Decoder(bytes, port) {
  
	var i = 0;
    var output = {};
    var device_address = data[i++];
    var function_code = data[i++];
	var data_length = data[i++];
    var data_type = data[i++];
    
	// Parsing only real time data from sensor   
	if ((0x41 == function_code) && (0x01 == data_type)) {
      
      	// id
		output.device = device_address;

        // timestamp
        output.timestamp = (data[i] << 24) + (data[i+1] << 16) + (data[i+2] << 8) + data[i+3];
        i+=4;

        // temperature
        output.temperature = ((data[i] * 16) + (data[i+1] >> 4) - 500) / 10.0;
        output.humidity = (256 * (data[i+1] & 0x0F) + data[i+2]) / 10.0;
		output.co2 = (data[i+3] << 8) + data[i+4];
        i+=5;

        // battery
        output.battery = data[i];

	}

  	return output;

}

function bytesToHex(bytes) {
  
	var hexArray = [];
  	for (var i = 0; i < bytes.length; i++) {
	    var hex = (bytes[i] & 0xff).toString(16).toUpperCase();
    	if (hex.length === 1) {
      		hex = '0' + hex;
    	}
    	hexArray.push(hex);
  	}
  	return hexArray.join('');

}

function decodeUplink(input) {

	bytes = input.bytes;
	fPort = input.fPort;

	return {
		data: Decoder(bytes, fPort),
		warnings: [],
		errors: []
	};

}


