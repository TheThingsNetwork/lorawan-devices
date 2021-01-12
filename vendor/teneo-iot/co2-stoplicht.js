function decodeUplink(input) {
  var decoded = {};
  var index = 0;
  decoded.Voltage = (input.bytes[index++] & 0x0F) / 10 + 2;
  
  if(input.port == 223)
  {
    if((input.bytes[0] & 0xc0) == 0x80)
    {
      decoded.type = "status";
        decoded.status = input.bytes[0] & ~0xC0;
    }
    
    return decoded;
  }
  
  
  if(input.port == 1)
  {
      decoded.CO2 = (input.bytes[2] << 24 | input.bytes[3] << 16 | input.bytes[4] << 8 | input.bytes[5])/100;
    
     var Tempx100 = ((input.bytes[6] << 8) + input.bytes[7]);
     
     if (Tempx100 == 32767)
    {
      decoded.Temp = "no temp"
    }
    else
    {
      if (Tempx100 > 32767)
      {
        decoded.Temp = ((-(65536 - Tempx100)))/100;
      } 
      else
      {
        decoded.Temp = Tempx100/100; 
      }
    }

    
     decoded.Humid = (input.bytes[8] << 8 | input.bytes[9])/100;
  }
  
  return decoded;
  }