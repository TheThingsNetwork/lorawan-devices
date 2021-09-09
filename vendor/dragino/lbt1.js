function decodeUplink(input) {
	// Decode an uplink message from a buffer
	// (array) of bytes to an object of fields.
var port = input.fPort;
var bytes = input.bytes;
var mode = bytes[5];
var data = {};
var i;
var con;
var str = "";
var value = bytes[0] << 8 | bytes[1];
var addr= "";
var rssi = 0;
var major = 1;
var minor = 1;

  switch (input.fPort) {
    case 2:
	if(mode ==2 ) {
		for(i = 38 ; i<50 ; i++) {
			con = bytes[i].toString();
			str += String.fromCharCode(con);
		}

		data.addr = str;
		data.batV = value/1000;
		data.major = 1;
        data.minor = 1;
		data.rssi = 0;

		str = "";

		for(i = 6 ; i<38 ; i++) {
		  	con = bytes[i].toString();
		  	str += String.fromCharCode(con);
		}

		value = str;
	}

	if(mode == 3 ) {
		str = "";
		for(i = 18 ; i < 22 ; i++) {
		  	con = bytes[i].toString();
		  	str += String.fromCharCode(con);
		}

		data.major = parseInt(str, 16);
		data.batV = value/1000;
		data.addr= "";
		
		str = "";

		for(i = 22 ; i < 26 ; i++) {
		  	con = bytes[i].toString();
		  	str += String.fromCharCode(con);
		}

		data.minor = parseInt(str, 16); 

		str = "";

		for(i = 28 ; i < 32 ; i++) {
		  	con = bytes[i].toString();
		  	str += String.fromCharCode(con);
		}

		data.rssi = parseInt(str);

		str = "";
		for(i = 6 ; i < 18 ; i++) {
		  	con = bytes[i].toString();
		  	str += String.fromCharCode(con);
		}

		value = str;
	}

	if(mode == 1) {
		for(i = 6 ; i<11 ; i++) {
		  	con = bytes[i].toString();
		  	str += String.fromCharCode(con);
		}
        data.batV = value/1000;
		value = str;
		data.addr= "";
		data.major = 1;
        data.minor = 1;
		data.rssi = 0
		
	}
	
	data.uuid = value;
	data.alarm = bytes[2] >> 4 & 0x0F;
	data.step_count = (bytes[2] & 0x0F) << 16 | bytes[3] << 8 | bytes[4];
  return {
       data:data,
  };
default:
    return {
      errors: ["unknown FPort"]
    }
}
}
