function decodeUplink(input) {
  var port = input.fPort;
  var bytes = input.bytes;
  var value=(bytes[0]<<8 | bytes[1]) & 0x3FFF;
  var batV=value/1000;
  var temp=0;	
  var data = {};
  switch (input.fPort) {
    case 2:
    if((bytes[0]!=0x03)&&(bytes[10]!=0x02))
    {
   data.Bat=batV;
   value=(bytes[2]<<24>>16) | bytes[3];
   data.TempC_DS18B20=(value/10).toFixed(2);//DS18B20,temperature
     
   value=bytes[4]<<8 | bytes[5];
   data.Lidar_distance=(value/10);  
    
   value=bytes[6]<<8 | bytes[7];
   data.Lidar_signal=value; 
  
   value=bytes[9]<<24>>24;
   data.Lidar_temp=value; 
   
   data.Interrupt_flag = bytes[8];
   data.Message_type = bytes[10];        
    }
   return {
        data:data,
       };
      default:
   return {
     errors: ["unknown FPort"]
   }
  }
  }