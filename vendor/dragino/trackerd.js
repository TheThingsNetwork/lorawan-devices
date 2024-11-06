//The function is :
function decodeUplink(input) {
  var port = input.fPort;
var bytes = input.bytes;
// Decode an uplink message from a buffer
// (array) of bytes to an object of fields.
	var i;
	var con;
	var str = "";
	var major = 1;
	var minor = 1;
	var rssi = 0;
	var power = 0;
	var device_information1 = 0;
	var device_information2 = 0;
	var device_information3 = 0;
	var addr = "";
	var alarm=0;//Alarm status
	var batV=0;//Battery,units:V
	var bat=0;//Battery,units:V
	var mod = 0;
	var led_updown="";//LED status for position,uplink and downlink
	var Firmware = 0;  // Firmware version; 5 bits   
	var hum=0;//hum,units: °
	var tem=0; //tem,units: °  
	var latitude=0;//gps latitude,units: °  
	var longitude = 0;//gps longitude,units: ° 
	var location=0;
	var time =0;
	var date =0;
  var sub_band;
  var freq_band;
  var sensor; 
  var firm_ver;	
  var sensor_mod;
  var gps_mod;
  var ble_mod;
  var pnackmd;
  var lon;
  var intwk;
  switch (input.fPort) {
	case 2:
	var decode = {};
    bat =(((bytes[8] & 0x3f) <<8) | bytes[9]);//Battery,units:V
		latitude=(bytes[0]<<24 | bytes[1]<<16 | bytes[2]<<8 | bytes[3])/1000000;//gps latitude,units: °
		longitude=(bytes[4]<<24 | bytes[5]<<16 | bytes[6]<<8 | bytes[7])/1000000;//gps longitude,units: °


		if ((latitude < 190) && (latitude > -190)) {
				if ((longitude < 190) && (longitude > -190)) {
					if ((latitude !== 0) && (longitude !==0)) {
							field: "location",
						  location= "" + latitude + "," + longitude + ""

					
					}        
			   }
			}		
			else
					location="invalid value";
		
			alarm=(bytes[8] & 0x40)?"TRUE":"FALSE";//Alarm status
			batV=(((bytes[8] & 0x3f) <<8) | bytes[9])/1000;//Battery,units:V
			mod = bytes[10] & 0xC0;

			if(mod !== 1) 
			{
			 hum=(bytes[11]<<8 | bytes[12])/10;//hum,units: °
			 tem=(bytes[13]<<8 | bytes[14])/10; //tem,units: °   
			}
			led_updown=(bytes[10] & 0x20)?"ON":"OFF";//LED status for position,uplink and downlink
	    intwk = (bytes[10] & 0x10)?"MOVE":"STILL";

			{
			var decode = {};
			decode.Location=location
			decode.Latitude=latitude
			decode.Longitude=longitude
			decode.Hum=hum
			decode.Tem=tem
			decode.ALARM_status=alarm
			decode.MD=mod
			decode.LON=led_updown
			decode.Transport=intwk
			return {
			data:decode,
			  }		
			}
			
			break;
			case 3:
			{
	var decode = {};

     bat =(((bytes[8] & 0x3f) <<8) | bytes[9]);//Battery,units:V
    
		latitude=(bytes[0]<<24 | bytes[1]<<16 | bytes[2]<<8 | bytes[3])/1000000;//gps latitude,units: °
		longitude=(bytes[4]<<24 | bytes[5]<<16 | bytes[6]<<8 | bytes[7])/1000000;//gps longitude,units: °


		if ((latitude < 190) && (latitude > -190)) {
				if ((longitude < 190) && (longitude > -190)) {
					if ((latitude !== 0) && (longitude !==0)) {
							field: "location",
						  location= "" + latitude + "," + longitude + ""

					
					}        
			   }
			}		
			else
					location="invalid value";
					

			alarm=(bytes[8] & 0x40)?"TRUE":"FALSE";//Alarm status
			batV=(((bytes[8] & 0x3f) <<8) | bytes[9])/1000;//Battery,units:V
			mod = bytes[10] & 0xC0;

			if(mod !== 1) 
			{
			 hum=(bytes[11]<<8 | bytes[12])/10;//hum,units: °
			 tem=(bytes[13]<<8 | bytes[14])/10; //tem,units: °   
			}
			led_updown=(bytes[10] & 0x20)?"ON":"OFF";//LED status for position,uplink and downlink
	    intwk = (bytes[10] & 0x10)?"MOVE":"STILL";
			{
			var decode = {};
			decode.Location=location
			decode.Latitude=latitude
			decode.Longitude=longitude
			decode.BatV=batV
			decode.ALARM_status=alarm
			decode.MD=mod
			decode.LON=led_updown
			decode.Transport=intwk
  			return {
  			  data:decode,
  			  }		
				}
	}
	break;
case 4:
{
        var decode = {};
		latitude=(bytes[0]<<24 | bytes[1]<<16 | bytes[2]<<8 | bytes[3])/1000000;//gps latitude,units: °
		longitude=(bytes[4]<<24 | bytes[5]<<16 | bytes[6]<<8 | bytes[7])/1000000;//gps longitude,units: °

		if ((latitude < 190) && (latitude > -190)) {
				if ((longitude < 190) && (longitude > -190)) {
					if ((latitude !== 0) && (longitude !==0)) {
							field: "location",

						  location= "" + latitude + "," + longitude + "";
					
					}        
			   }
			}	
			else
					location="invalid value";
					

			var year = bytes[8]<<8 | bytes[9];
			var Month =  bytes[10];
			var day =  bytes[11];
			var hour =  bytes[12];
			var min =  bytes[13];
			var sen =  bytes[14];

			date = year+':'+Month+":"+day;
			time = hour+":"+min+":"+sen;
			
			decode.Location=location
			decode.Latitude=latitude
			decode.Date=date
			decode.Time=time
			return {
			  data:decode,
			  }		

}
break;
case 7:
{
            var decode = {};
			alarm=(bytes[0] & 0x40)?"TRUE":"FALSE";//Alarm status
			batV=(((bytes[0] & 0x3f) <<8) | bytes[1])/1000;//Battery,units:V
			mod = bytes[2] & 0xC0;
			led_updown=(bytes[2] & 0x20)?"ON":"OFF";//LED status for position,uplink and downlink
			
			decode.BatV=batV
			decode.ALARM_status=alarm
			decode.MD=mod
			decode.LON=led_updown
			return {
			  data:decode,
			  }			
}
break;
case 8:
{
    var decode = {};
    con = "";
    for(i = 0 ; i < 6 ; i++) {
      	con = bytes[i].toString();
      	str += String.fromCharCode(con);
    }
    var wifissid = str,
    rssi =  bytes[6]<<24>>24;
    alarm=(bytes[7] & 0x40)?"TRUE":"FALSE";//Alarm status
    batV=(((bytes[7] & 0x3f) <<8) | bytes[8])/1000;//Battery,units:V
    mod = (bytes[9] & 0xC0)>>6;
    led_updown=(bytes[9] & 0x20)?"ON":"OFF";//LED status for position,uplink and downlink
    		
			decode.WIFISSID=wifissid
			decode.RSSI=rssi
			decode.BatV=batV
			decode.ALARM_status=alarm
			decode.MD=mod
			decode.LON=led_updown
			return {
    	         data:decode,			  
    		  }  
}
break;
case 5:
  {
    var decode = {};
    if(bytes[0]==0x13)
      sensor_mode="TrackerD";
    else
      sensor_mode="NULL"; 

    if(bytes[4]==0xff)
      sub_band="NULL";
    else
      sub_band=bytes[4];

    if(bytes[3]==0x01)
      freq_band="EU868";
    else if(bytes[3]==0x02)
      freq_band="US915";
    else if(bytes[3]==0x03)
      freq_band="IN865";
    else if(bytes[3]==0x04)
      freq_band="AU915";
    else if(bytes[3]==0x05)
      freq_band="KZ865";
    else if(bytes[3]==0x06)
      freq_band="RU864";
    else if(bytes[3]==0x07)
      freq_band="AS923";
    else if(bytes[3]==0x08)
      freq_band="AS923_1";
    else if(bytes[3]==0x09)
      freq_band="AS923_2";
    else if(bytes[3]==0x0A)
      freq_band="AS923_3";
    else if(bytes[3]==0x0B)
      freq_band="CN470";
    else if(bytes[3]==0x0C)
      freq_band="EU433";
    else if(bytes[3]==0x0D)
      freq_band="KR920";
    else if(bytes[3]==0x0E)
      freq_band="MA869";

    firm_ver= (bytes[1]&0x0f)+'.'+(bytes[2]>>4&0x0f)+'.'+(bytes[2]&0x0f);
    batV= (bytes[5]<<8 | bytes[6])/1000;
    semsor_mod = (bytes[7]>>6)&0x3f;
    gps_mod = (bytes[7]>>4)&0x03;
    ble_mod = bytes[7]&0x0f;
    panackmd = bytes[8]&0x04;
    lon = ((bytes[8]>>1)&0x01)?"ON":"OFF";;
    intwk = bytes[8]&0x01;

    if(semsor_mod == 1)
       sensor= "GPS";
    else if(semsor_mod == 2)
       sensor= "BLE"; 
    else if(intwk == 1)
       sensor= "Spots";         
     else if(semsor_mod == 3)
       sensor= "BLE+GPS Hybrid";     

     decode.BatV=batV
	 decode.SENSOR_MODEL=sensor_mode
	 decode.FIRMWARE_VERSION=firm_ver
	 decode.FREQUENCY_BAND=freq_band
	 decode.SUB_BAND=sub_band
	 decode.SMODE=sensor
	 decode.GPS_M0D=gps_mod
	 decode.BLE_MD=ble_mod
	 decode.PNACKMD=pnackmd
	 decode.LON=lon
	 decode.Intwk=intwk
   	return {
     data:decode,
    }
  }	
	break;
case 6:
	{ 
	    var decode = {};
		major =  bytes[16] << 8 | bytes[17];

		minor =  bytes[18] << 8 | bytes[19]

		power = bytes[15];

		rssi =  bytes[23]<<24>>24;

		con = "";
		for(i = 0 ; i < 16 ; i++) {
		  	con += bytes[i].toString(16);
		}
		value =  con;
		var uuid = value;	
		alarm=(bytes[24] & 0x40)?"TRUE":"FALSE";//Alarm status
		batV=(((bytes[24] & 0x3f) <<8) | bytes[25])/1000;//Battery,units:V
		mod = (bytes[26] & 0xC0)>>6;
		led_updown=(bytes[26] & 0x20)?"ON":"OFF";//LED status for position,uplink and downlink
		if(bytes[26] & 0xC0==0x40) 
		{
			hum=(bytes[27]<<8 | bytes[28])/10;//hum,units: °
			tem=(bytes[29]<<8 | bytes[30])/10; //tem,units: °
		}
		decode.BatV=batV
		decode.ALARM_status=alarm
		decode.MD=mod
		decode.LON=led_updown
		decode.UUID=uuid
		decode.MAJOR=major
		decode.MINOR=minor
		decode.RSSI=rssi
		decode.POWER=power
		return {
		 data:decode,
		  }			
	}
  }
}