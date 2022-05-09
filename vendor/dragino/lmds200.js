function decodeUplink(input) {
	var port = input.fPort;
	var bytes = input.bytes;
	var data = {};
	 switch (input.fPort) {				 
 case 2:	
  { 
    data.Bat=(bytes[0]<<8 | bytes[1])/1000;
    data.dis1=(bytes[2]<<8 | bytes[3]); 
    data.dis2=(bytes[4]<<8 | bytes[5]);
    data.DALARM_count=(bytes[6]>>2)&0x3F;
    data.Distance_alarm= (bytes[6]>>1)&0x01;
    data.Interrupt_alarm= (bytes[6])&0x01;
  }
  return {
      data: data,
    }
  break;
  
 case 4:
  {
    data.TDC= bytes[0]<<16 | bytes[1]<<8 | bytes[2];
    data.ATDC= (bytes[3]);
    data.Alarm_min= (bytes[4]<<8 | bytes[5]);
    data.Alarm_max= (bytes[6]<<8 | bytes[7]);
    data.Interrupt= (bytes[8]);
  }
  return {
      data: data,
    }
  break;
  
   case 5:
  { 
  
    if(bytes[0]==0x0C)
      data.SENSOR_MODEL= "LMDS200";
      
      data.Ver= parseInt((bytes[1]<<8 | bytes[2]).toString(16),10);
    
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
      
    data.Sub_band= bytes[4];
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