function decodeUplink(input) {
  var port = input.fPort;
  var bytes = input.bytes;
  var value=(bytes[0]<<8 | bytes[1]) & 0x3FFF;
  var batV=value/1000;
  var data = {};
  switch (input.fPort) {
    case 2:
      data.Bat=batV;
    value=bytes[2]<<8 | bytes[3];
    if(bytes[2] & 0x80)
    {value |= 0xFFFF0000;}
  
    data.TempC_DS18B20=(value/10).toFixed(2);//DS18B20,temperature
     
    value=bytes[4]<<8 | bytes[5];
    data.N_SOIL=value;	//Unit:mg/kg
     
    value=bytes[6]<<8 | bytes[7];
    data.P_SOIL=value;	//Unit:mg/kg
    
    value=bytes[8]<<8 | bytes[9];
    data.K_SOIL=value;	//Unit:mg/kg
     
    data.Message_type = bytes[10]>>4;
    data.Interrupt_flag = bytes[10]&0x0F;
   
   return {
        data:data,
       };
      default:
   return {
     errors: ["unknown FPort"]
   }
  }
  }