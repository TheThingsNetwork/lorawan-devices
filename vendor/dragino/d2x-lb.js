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
    data.Temp_C1="NULL";
  }
  else
  {
    data.Temp_C1= parseFloat(((bytes[2]<<24>>16 | bytes[3])/10).toFixed(1));
  }

  if((bytes[7]==0xff)&& (bytes[8]==0xff))
  {
    data.Temp_C2="NULL";
  }
  else
  {
  	data.Temp_C2=parseFloat(((bytes[7]<<24>>16 | bytes[8])/10).toFixed(1));
  }
  
  if((bytes[9]==0xff)&& (bytes[10]==0xff))
  {
    data.Temp_C3="NULL";
  }
  else
  {
  	data.Temp_C3=parseFloat(((bytes[9]<<8 | bytes[10])/10) .toFixed(1)); 
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

case 5:
  { 
    if(bytes[0]==0x19)
      data.SENSOR_MODEL= "D20-LB";
      
    if(bytes[4]==0xff)
      data.SUB_BAND="NULL";
    else
      data.SUB_BAND=bytes[4];
    
    if(bytes[3]==0x01)
      data.FREQUENCY_BAND="EU868";
    else if(bytes[3]==0x02)
      data.FREQUENCY_BAND="US915";
    else if(bytes[3]==0x03)
      data.FREQUENCY_BAND="IN865";
    else if(bytes[3]==0x04)
      data.FREQUENCY_BAND="AU915";
    else if(bytes[3]==0x05)
      data.FREQUENCY_BAND="KZ865";
    else if(bytes[3]==0x06)
      data.FREQUENCY_BAND="RU864";
    else if(bytes[3]==0x07)
      data.FREQUENCY_BAND="AS923";
    else if(bytes[3]==0x08)
      data.FREQUENCY_BAND="AS923_1";
    else if(bytes[3]==0x09)
      data.FREQUENCY_BAND="AS923_2";
    else if(bytes[3]==0x0A)
      data.FREQUENCY_BAND="AS923_3";
    else if(bytes[3]==0x0B)
      data.FREQUENCY_BAND="CN470";
    else if(bytes[3]==0x0C)
      data.FREQUENCY_BAND="EU433";
    else if(bytes[3]==0x0D)
      data.FREQUENCY_BAND="KR920";
    else if(bytes[3]==0x0E)
      data.FREQUENCY_BAND="MA869";
      
    data.FIRMWARE_VERSION= (bytes[1]&0x0f)+'.'+(bytes[2]>>4&0x0f)+'.'+(bytes[2]&0x0f);
    data.BAT= (bytes[5]<<8 | bytes[6])/1000;
  }
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