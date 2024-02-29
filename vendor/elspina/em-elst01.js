function decodeUplink(input) {
    // Decode an uplink message from a buffer
    // (array) of bytes to an object of fields.
    var port = input.fPort;
    var bytes = input.bytes;
    var switch_status = (bytes[0]>>4)&0xFF;
    var value=(bytes[0]<<8 | bytes[1]) & 0x0FFF;
    var batV=value/1000;//Battery,units:V
    
    if(bytes.length == 4)
    {
      var tnomd = (bytes[2]<<8 | bytes[3]) & 0xFFFF;
      return {
        status:switch_status,
        Bat:batV ,
        TNOMD:tnomd,
      };
    }
    else if(bytes.length == 9)
    {
      var tode = (bytes[2]<<16 | bytes[3]<<8 | bytes[4]) & 0xFFFFFF;
      var ldod = (bytes[5]<<16 | bytes[6]<<8 | bytes[7]) & 0xFFFFFF;
      var alarm = bytes[8];
      return {
        status:switch_status,
        Bat:batV ,
        TODE:tode,
        LDOD:ldod,
        ALARM:alarm,
      };
    }
    else if(bytes.length == 19)
    {
      var tode1 = (bytes[2]<<16 | bytes[3]<<8 | bytes[4]) & 0xFFFFFF;
      var ldod1 = (bytes[5]<<16 | bytes[6]<<8 | bytes[7]) & 0xFFFFFF;
      var alarm1 = bytes[8];
      var tnomd1 = (bytes[9]<<8 | bytes[10]) & 0xFFFF;
      
      value=bytes[11]<<8 | bytes[12];
      var X = 0;
      if(bytes[11]>>4 == 0x0F)
        X=((value-0xFFFF)/100).toFixed(2);
      else
        X=(value/100).toFixed(2);
    
      value=bytes[13]<<8 | bytes[14];
      var Y=0;
      if(bytes[13]>>4 == 0x0F)
        Y=((value-0xFFFF)/100).toFixed(2);
      else
        Y=(value/100).toFixed(2);
    
      value=bytes[15]<<8 | bytes[16];
      var Z=0;
      if(bytes[15]>>4 == 0x0F)
        Z=((value-0xFFFF)/100).toFixed(2);
      else
        Z=(value/100).toFixed(2);
      
      value=bytes[17]<<8 | bytes[18];
      var temp_DS18B20=0;//DS18B20,temperature,units:°C
      if(bytes[17]>>4 == 0x0F)
        temp_DS18B20=((value-0xFFFF)/10).toFixed(1);
      else
        temp_DS18B20=(value/10).toFixed(1);
      return {
        data:{
          status:switch_status,
          Bat:batV ,
          TODE:tode1,
          LDOD:ldod1,
          ALARM:alarm1,
          TNOMD:tnomd1,
          X:X,
          Y:Y,
          Z:Z,
          temp_ds:temp_DS18B20
        },
      };
    }
  }