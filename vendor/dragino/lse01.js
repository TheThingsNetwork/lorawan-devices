function decodeUplink(input) {
  var port = input.fPort;
var bytes = input.bytes;
 var value=(bytes[0]<<8 | bytes[1]) & 0x3FFF;
 var batV=value/1000;//Battery,units:V
 value=bytes[2]<<8 | bytes[3];
 var data = {};
switch (input.fPort) {
  case 2:
 if(bytes[2] & 0x80)
 {value |= 0xFFFF0000;}
   data.Bat=batV;
  data.TempC_DS18B20=(value/10).toFixed(1);//DS18B20,temperature,units:℃
  
  value=bytes[4]<<8 | bytes[5];
  data.water_SOIL=(value/100).toFixed(2);//water_SOIL,Humidity,units:%
  
  value=bytes[6]<<8 | bytes[7];
  if((value & 0x8000)>>15 === 0)
   data.temp_SOIL=(value/100).toFixed(2);//temp_SOIL,temperature,units:°C
  else if((value & 0x8000)>>15 === 1)
   data.temp_SOIL=((value-0xFFFF)/100).toFixed(2);//temp_SOIL,temperature,units:°C
  
  value=bytes[8]<<8 | bytes[9];
  data.conduct_SOIL=(value);//conduct_SOIL,conductivity,units:uS/cm

 return {
      data:data,
     };
    default:
 return {
   errors: ["unknown FPort"]
 }
}
}