function decodeUplink(input) {
	var port = input.fPort;
	var bytes = input.bytes;
	var mode=(bytes[6] & 0x7C)>>2;
	var data = {};
	 switch (input.fPort) {
		 case 2:
if(mode=='3')
{
  data.Work_mode="DS18B20";
  data.BatV=(bytes[0]<<8 | bytes[1])/1000;
  data.ALARM_status=(bytes[6] & 0x01)? "TRUE":"FALSE";
  
  if((bytes[2]==0xff)&& (bytes[3]==0xff))
  {
    data.Temp_Red="NULL";
  }
  else
  {
    data.Temp_Red= parseFloat(((bytes[2]<<24>>16 | bytes[3])/10).toFixed(1));
  }

  if((bytes[7]==0xff)&& (bytes[8]==0xff))
  {
    data.Temp_White="NULL";
  }
  else
  {
  	data.Temp_White=parseFloat(((bytes[7]<<24>>16 | bytes[8])/10).toFixed(1));
  }
  
  if((bytes[9]==0xff)&& (bytes[10]==0xff))
  {
    data.Temp_Black="NULL";
  }
  else
  {
  	data.Temp_Black=parseFloat(((bytes[9]<<24>>16 | bytes[10])/10) .toFixed(1)); 
  }
}
else if(mode=='31')
{
  data.Work_mode="ALARM";
  data.Temp_Red_MIN= bytes[4]<<24>>24;
  data.Temp_Red_MAX= bytes[5]<<24>>24; 
  data.Temp_White_MIN= bytes[7]<<24>>24;
  data.Temp_White_MAX= bytes[8]<<24>>24; 
  data.Temp_Black_MIN= bytes[9]<<24>>24;
  data.Temp_Black_MAX= bytes[10]<<24>>24;  
}

  if(bytes.length==11)
  return {
      data: data,
    }
	break;
default:
    return {
      errors: ["unknown FPort"]
    }
  }
}