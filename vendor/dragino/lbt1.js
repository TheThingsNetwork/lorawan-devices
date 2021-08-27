function decodeUplink(input) {
	var port = input.fPort;
	var bytes = input.bytes;
	var mode = bytes[5];
	var data = {};
	var i;
	var con;
	var str = "";
	var value = bytes[0] << 8 | bytes[1];
	var batV = value/1000;
	var addr= "";
	var rssi = 0;
	var major = 1;
	var minor = 1;
	var power = 0;
	var uuid;
	var alarm;
	var step_count;
	var device_information1 = 0;     
	var device_information2 = 0;
	var device_information3 = 0;
	
	  switch (input.fPort) {
		case 2:
		if(mode == 1) {
		  str = "";
			for(i = 6 ; i<11 ; i++) {
				  con = bytes[i].toString();
				  str += String.fromCharCode(con);
			}
			value = str;
		}
		
		else if(mode ==2 ) {
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
	
		 else if(mode == 3 ) {
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
	
			for(i = 26 ; i < 28 ; i++) {
				  con = bytes[i].toString();
				  str += String.fromCharCode(con);
			}
	
			power = parseInt(str, 16); 		
	
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
	
		else if(mode == 4){
			str = "";
			for(i = 6 ; i < 20 ; i++) {
				  con = bytes[i].toString();
				  str += String.fromCharCode(con);
			}
	
			device_information1 = str;
	
			str = "";
			for(i = 20 ; i < 34 ; i++) {
				  con = bytes[i].toString();
				  str += String.fromCharCode(con);
			}
	
			device_information2 = str;
			
			str = "";
	
			for(i = 34 ; i < 48 ; i++) {
				  con = bytes[i].toString();
				  str += String.fromCharCode(con);
			}
	
			device_information3 = str; 
			
			str = "";
			value = str;
		}
		else if(mode == 5 ) {
	
			major = bytes[22] << 8 | bytes[23];
			
			minor = bytes[24] << 8 | bytes[25];
			
			power = bytes[26] << 8 | bytes[27];
	
			con = "";
	
			for(i = 28 ; i < 30 ; i++) {
				  con = bytes[i].toString(16);
			}
			rssi = con;
	
			con = "";
			for(i = 6 ; i < 22 ; i++) {
				  con += bytes[i].toString(16);
				  
			}
			value =  con;
		}
		
		uuid = value;
		alarm = bytes[2] >> 4 & 0x0F;
		step_count = (bytes[2] & 0x0F) << 16 | bytes[3] << 8 | bytes[4];
			
			data.UUID= uuid;
			data.ADDR= addr;
			data.MAJOR= major;
			data.MINOR= minor;
			data.RSSI=rssi;
			data.POWER=power;
			data.Dvice_Information1=device_information1;
			data.Dvice_Information2=device_information2;
			data.Dvice_Information3=device_information3;
			data.STEP= step_count;
			data.ALARM= alarm;
			data.BatV=batV;
			
	  return {
		   data:data,
		   };
	default:
		return {
		  errors: ["unknown FPort"]
		}
	}
	}