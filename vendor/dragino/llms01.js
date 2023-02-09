function decodeUplink(input) {
  var port = input.fPort;
  var bytes = input.bytes;
  var value=(bytes[0]<<8 | bytes[1]) & 0x3FFF;
  var batV=value/1000;
  var temp=0;	
  var data = {};
  switch (input.fPort) {
    case 2:
      data.Bat=batV;
    value=bytes[2]<<8 | bytes[3];
    if(bytes[2] & 0x80)
    {value |= 0xFFFF0000;}
  
    data.TempC_DS18B20=(value/10).toFixed(2);//DS18B20,temperature
     
    value=bytes[4]<<8 | bytes[5];
    data.Leaf_Moisture=(value/10).toFixed(2);	
    
      value=bytes[6]<<8 | bytes[7];
      if((value & 0x8000)>>15 === 0)
      temp=(value/10).toFixed(2);//temp_SOIL,temperature
    else if((value & 0x8000)>>15 === 1)
      temp=((value-0xFFFF)/10).toFixed(2);
    data.Leaf_Temperature=temp;   
    data.Interrupt_flag = bytes[8];
    data.Message_type = bytes[10];
    
    return {
        data:data,
       };
      default:
   return {
     errors: ["unknown FPort"]
   }
  }
  }