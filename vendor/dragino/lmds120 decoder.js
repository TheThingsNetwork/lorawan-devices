function decodeUplink(input) {
  var port = input.fPort;
var bytes = input.bytes;
var data={}
 switch (input.fPort) {
		 case 2:
  {
	var value=(bytes[0]<<8 | bytes[1]) & 0x3FFF;
	data.Bat=value/1000;//Battery,units:V
  
    var distance = 0;
	value=bytes[2]<<8 | bytes[3];
	if(value==0x3FFF)
		data.Distance = "Invalid Reading";   
	else
		data.Distance =(value);//distance,units:mm  
  
  data.Interrupt_flag =(bytes[4])&0x01;  
	value=bytes[5]<<8 | bytes[6];
	if(bytes[5] & 0x80)
	{value |= 0xFFFF0000;}
	data.TempC_DS18B20=(value/10).toFixed(2);//DS18B20,temperature
	 data.Sensor_flag = (bytes[7])&0x01;
    return {
       data:data,
    };
  }
  break;
  case 5:
  {
     var model="";
    if(bytes[5]==0x18)
      data.Sensor_model="LMDS120";
      var version=(bytes[3]<<8 | bytes[4]).toString(16);
    data.Ver = parseInt(version,10);
     var fre_band="";
    switch(bytes[1])
    {
      case 0x01:fre_band="EU868";break;
      case 0x02:fre_band="US915";break;
      case 0x03:fre_band="IN865";break;
      case 0x04:fre_band="AU915";break;
      case 0x05:fre_band="KZ865";break;
      case 0x06:fre_band="RU864";break;
      case 0x07:fre_band="AS923";break;
      case 0x08:fre_band="AS923-1";break;
      case 0x09:fre_band="AS923-2";break;
      case 0x0a:fre_band="AS923-3";break;
      case 0x0b:fre_band="AS923-4";break;
    }
    data.fre_band=fre_band
    data.Sub_band = bytes[2];
    
    return {
      data:data
    };
    break;
  }
}
}