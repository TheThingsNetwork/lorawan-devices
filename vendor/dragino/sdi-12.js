// Only for AT+DATAUP=0 & AT+ALLDATAMOD=0
function decodeUplink(input) {
	var data = {};
	var port = input.fPort;
	var bytes = input.bytes;
  switch (input.fPort) {
		 case 5:
  {
  	var freq_band;
  	var sub_band;
    var sensor;
    
    if(bytes[0]==0x17)
      sensor= "SDI12-LB";
      data.SENSOR_MODEL=sensor;
	  var firm_ver= (bytes[1]&0x0f)+'.'+(bytes[2]>>4&0x0f)+'.'+(bytes[2]&0x0f);
	  data.FIRMWARE_VERSION=firm_ver;
    if(bytes[3]==0x01)
        freq_band="EU868";
  	else if(bytes[3]==0x02)
        freq_band="US915";
  	else if(bytes[3]==0x03)
        freq_band="IN865";
  	else if(bytes[3]==0x04)
        freq_band="AU915";
  	else if(bytes[3]==0x05)
        freq_band="KZ865";
  	else if(bytes[3]==0x06)
        freq_band="RU864";
  	else if(bytes[3]==0x07)
        freq_band="AS923";
  	else if(bytes[3]==0x08)
        freq_band="AS923_1";
  	else if(bytes[3]==0x09)
        freq_band="AS923_2";
  	else if(bytes[3]==0x0A)
        freq_band="AS923_3";
  	else if(bytes[3]==0x0F)
        freq_band="AS923_4";
  	else if(bytes[3]==0x0B)
        freq_band="CN470";
  	else if(bytes[3]==0x0C)
        freq_band="EU433";
  	else if(bytes[3]==0x0D)
        freq_band="KR920";
  	else if(bytes[3]==0x0E)
        freq_band="MA869";
  	
    data.FREQUENCY_BAND=freq_band;
    if(bytes[4]==0xff)
      data.SUB_BAND="NULL";
	  else
      data.SUB_BAND=bytes[4];

    data.bat= (bytes[5]<<8 | bytes[6])/1000;
    
  	return {
  	data:data,
  	}
  	break;
  }
  case 100:
  {
      
      for(var j=0;j<bytes.length;j++)
      {
        var datas= String.fromCharCode(bytes[j]);
        if(j=='0')
          data.datas_sum=datas;
        else
          data.datas_sum+=datas;
      }
      
      return{
    data:data
    };
    break;
  }
  
   default:
  {
      
      data.EXTI_Trigger= (bytes[0] & 0x80)? "TRUE":"FALSE";    
      data.BatV= ((bytes[0]<<8 | bytes[1])&0x7FFF)/1000;
      data.Payver= bytes[2];
      for(var i=3;i<bytes.length;i++)
      {
        var data1= String.fromCharCode(bytes[i]);
        if(i=='3')
          data.data_sum=data1;
        else
          data.data_sum+=data1;
      }
      return{
    data:data
    };  
  }
}
}