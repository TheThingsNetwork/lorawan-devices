function Decoder(bytes, port) {
	// Decode an uplink message from a buffer
	// (array) of bytes to an object of fields.
	value = bytes[0] << 8 | bytes[1];
	var batV = value/1000;//Battery,units:V

	var mode = bytes[5];

	//var value=(bytes[3]-0x30)*1000 +(bytes[5]-0x30)*100 + (bytes[5]-0x30)*10 +(bytes[6]-0x30);
	//var value = bytes.slice(3);

	var i;
	var con;
	var str = "";
	var major = 1;
	var minor = 1;
	var rssi = 0;
	var addr = "";

	if(mode ==2 ) {
		for(i = 38 ; i<50 ; i++) {
			con = bytes[i].toString();
			str += String.fromCharCode(con);
		}

		addr = str;

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

		major = parseInt(str, 16);
		
		str = "";

		for(i = 22 ; i < 26 ; i++) {
		  	con = bytes[i].toString();
		  	str += String.fromCharCode(con);
		}

		minor = parseInt(str, 16); 

		str = "";

		for(i = 28 ; i < 32 ; i++) {
		  	con = bytes[i].toString();
		  	str += String.fromCharCode(con);
		}

		rssi = parseInt(str);

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

		value = str;
	}

	var uuid = value;
	var alarm = bytes[2] >> 4 & 0x0F;
	var step_count = (bytes[2] & 0x0F) << 16 | bytes[3] << 8 | bytes[4];

	return {
		UUID: uuid,
		ADDR: addr,
		MAJOR: major,
		MINOR: minor,
		RSSI:rssi,
		STEP: step_count,
		ALARM: alarm,
		BatV:batV,
	};
}
