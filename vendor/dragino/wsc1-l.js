function zxc(num){ 
	if(parseInt(num) < 10)
	  num = '0'+ num; 
	return num; 
  }
	
function decodeUplink(input) {
	var port = input.fPort;
	var bytes = input.bytes;
	var data = {};
	 switch (input.fPort) {				 
 case 2:	
  { 
    if( bytes[0]<0xE0)
    {
    var direction = {0:"N",1:"NNE",2:"NE",3:"ENE",4:"E",5:"ESE",6:"SE",7:"SSE",8:"S",9:"SSW",10:"SW",11:"WSW",12:"W",13:"WNW",14:"NW",15:"NNW"};
	  var dic = {};
	  var sensor	  =["bat","wind_speed","wind_direction_angle","illumination",
					  "rain_snow","CO2","TEM","HUM","pressure",
					  "rain_gauge","PM2_5","PM10","PAR","TSR"];
	  var sensor_diy=["A1","A2","A3","A4"];
	  var algorithm =[0x03,0x01,0x01,0x11,
					  0x20,0x20,0x01,0x01,0x01,
					  0x01,0x20,0x20,0x20,0x01];
    for(i=0;i<bytes.length;)
	  {
		  var len=bytes[i+1];
		  if(bytes[i]<0xA1)
		  {
			  var sensor_type= bytes[i];			
			  var operation  = algorithm[sensor_type]>>4;
			  var count  	   = algorithm[sensor_type]&0x0F;
			  
			  if(operation===0)
			  {
				  if(sensor_type === 0x06)	//TEM
				  {
					  if(bytes[i+2] & 0x80)
						  dic[sensor[sensor_type]] = (((bytes[i+2]<<8)|bytes[i+3])-0xFFFF)/(count*10.0);	//<0
					  else
						  dic[sensor[sensor_type]] = ((bytes[i+2]<<8)|bytes[i+3])/(count*10.0);
				  }
				  else
					  dic[sensor[sensor_type]] = ((bytes[i+2]<<8)|bytes[i+3])/(count*10.0);
			  }
			  else if(operation===1)
			  {
				  dic[sensor[sensor_type]] = ((bytes[i+2]<<8)|bytes[i+3])*(count*10);
			  }
			  else
			  {
				  if(sensor_type === 0x04)	//RAIN_SNOW
					  dic[sensor[sensor_type]] = bytes[i+2];
				  else
					  dic[sensor[sensor_type]] = (bytes[i+2]<<8)|bytes[i+3];
			  }
			  
			  if(sensor_type===0x01)
			  {
				  dic.wind_speed_level = bytes[i+4];
			  }
			  else if(sensor_type===0x02)
			  {
				  values = bytes[i+4];
				  dic.wind_direction = direction[values];
					
				  }
		  }		
		  else
		  {
			  dic[sensor_diy[bytes[i]-0xA1]]=(bytes[i+2]<<8)|bytes[i+3];
		  }
			  
		  i=i+2+len;
	  }
  
  }
}
  return {
    data: dic,
    }
  break;
  
   case 5:
  { 
    var frequency = {1:"EU868",2:"US915",3:"IN865",4:"AU915",5:"KZ865",6:"RU864",7:"AS923",8:"AS923-1",9:"AS923-2",10:"AS923-3"};
    {
		var node = bytes[0];
			if (node ===13);
      data.node="WSC1-L";
		var version1 = bytes[1],version2 = bytes[2]>>4,version3 = bytes[2]&0x0f;
       data.version="V"+"."+version1+"."+version2+"."+version3;
		var values = bytes[3];
        data.frequency_band = frequency[values];
				data.sub_band = bytes[4];
				data.bat = (bytes[5]<<8|bytes[6])/1000;
				data.weather_sensor_types=bytes[7].toString(16)+zxc(bytes[8].toString(16))+bytes[9].toString(16);
  }
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