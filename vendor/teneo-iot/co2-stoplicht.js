function decodeUplink(input) {
  var decoded = {};
  var index = 0;
  decoded.Voltage = (bytes[index++] & 0x0F) / 10 + 2;
  
  if(port == 223)
  {
    if((bytes[0] & 0xc0) == 0x80)
    {
      decoded.type = "status";
        decoded.status = bytes[0] & ~0xC0;
    }
    
    return decoded;
  }
  
  
  if(port == 1)
  {
      decoded.CO2 = (bytes[2] << 24 | bytes[3] << 16 | bytes[4] << 8 | bytes[5])/100;
    
     var Tempx100 = ((bytes[6] << 8) + bytes[7]);
     
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

    
     decoded.Humid = (bytes[8] << 8 | bytes[9])/100;
  }
  
  return decoded;
  }