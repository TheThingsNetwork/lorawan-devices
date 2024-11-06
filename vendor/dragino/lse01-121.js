function decodeUplink(input) {
  var port = input.fPort;
var bytes = input.bytes;
  	var value;
  	var mod=(bytes[10]>>7)&0x01;
   var data = {};
	data.BatV=((bytes[0]<<8 | bytes[1]) & 0x3FFF)/1000;//Battery,units:V

	value=bytes[2]<<8 | bytes[3];
	if(bytes[2] & 0x80)
	{value |= 0xFFFF0000;}
  data.temp_DS18B20=(value/10).toFixed(2);//DS18B20,temperature
  
	if(mod===0)
	{
                value=bytes[6]<<8 | bytes[7];
	var temp_SOIL;
	if((value & 0x8000)>>15 === 0)
	data.temp_SOIL=(value/100).toFixed(2);//temp_SOIL,temperature
	else if((value & 0x8000)>>15 === 1)
	data.temp_SOIL=((value-0xFFFF)/100).toFixed(2);
	data.water_SOIL=((bytes[4]<<8 | bytes[5])/100).toFixed(2);//water_SOIL,Humidity,units:%
                data.conduct_SOIL=bytes[8]<<8 | bytes[9];
	}
	else
	{ 
                  data.Soil_dielectric_constant=((bytes[4]<<8 | bytes[5])/10).toFixed(1);
	  data.Raw_water_SOIL=bytes[6]<<8 | bytes[7];
	  data.Raw_conduct_SOIL=bytes[8]<<8 | bytes[9];
	}
	data.s_flag = (bytes[10]>>4)&0x01;
	data.i_flag = bytes[10]&0x0F;
	data.Mod = mod;
	
  return {
    data:data
}
}