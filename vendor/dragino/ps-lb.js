function datalog(i,bytes){
  var aa= parseFloat((bytes[2+i]<<8 | bytes[2+i+1])/1000).toFixed(3); 
  var string='['+ aa +']'+',';  
  return string;
}

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
    
    if(bytes[0]==0x16)
      sensor= "PS-LB";
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

    data.BAT= (bytes[5]<<8 | bytes[6])/1000;
    
  	return {
  	  data:data
  	}
  	break;
  }
  case 7:
  {
     data.Bat_V= (bytes[0]<<8 | bytes[1])/1000;
    for(var i=0;i<bytes.length-2;i=i+2)
    {
      var data1= datalog(i,bytes);
      if(i=='0')
        data.DATALOG=data1;
      else
        data.DATALOG+=data1;
    }
    return{
    data:data
    };
    break;
  }
  default:
  {
    
    data.Bat_V= (bytes[0]<<8 | bytes[1])/1000;
    data.Probe_mod= bytes[2];   
    data.IDC_intput_mA= (bytes[4]<<8 | bytes[5])/1000;  
    data.VDC_intput_V= (bytes[6]<<8 | bytes[7])/1000; 
    data.IN1_pin_level= (bytes[8] & 0x08)? "High":"Low";   
    data.IN2_pin_level= (bytes[8] & 0x04)? "High":"Low";   
    data.Exti_pin_level= (bytes[8] & 0x02)? "High":"Low";  
    data.Exti_status= (bytes[8] & 0x01)? "True":"False";
    
    if(data.Probe_mod===0x00)
    {
      if(data.IDC_intput_mA<=4.0)
        data.Water_deep_cm= 0;
      else
        data.Water_deep_cm= parseFloat(((decode.IDC_intput_mA-4.0)*(bytes[3]*100/16)).toFixed(3));
    }
    else if(data.Probe_mod==0x01)
    {
      if(data.IDC_intput_mA<=4.0)
        data.Water_pressure_MPa= 0;
      else if(bytes[3]==1)
        data.Water_pressure_MPa= parseFloat(((decode.IDC_intput_mA-4.0)*0.0375).toFixed(3));
      else if(bytes[3]==2)
        data.Water_pressure_MPa= parseFloat(((decode.IDC_intput_mA-4.0)*0.0625).toFixed(3));   
      else if(bytes[3]==3)
        data.Water_pressure_MPa= parseFloat(((decode.IDC_intput_mA-4.0)*0.1).toFixed(3)); 
      else if(bytes[3]==4)
        data.Water_pressure_MPa= parseFloat(((decode.IDC_intput_mA-4.0)*0.15625).toFixed(3));
      else if(bytes[3]==5)
        data.Water_pressure_MPa= parseFloat(((decode.IDC_intput_mA-4.0)*0.625).toFixed(3));  
      else if(bytes[3]==6)
        data.Water_pressure_MPa= parseFloat(((decode.IDC_intput_mA-4.0)*2.5).toFixed(3));   
      else if(bytes[3]==7)
        data.Water_pressure_MPa= parseFloat(((decode.IDC_intput_mA-4.0)*3.75).toFixed(3));  
      else if(bytes[3]==8)
        data.Water_pressure_MPa= parseFloat(((decode.IDC_intput_mA-4.0)*-0.00625).toFixed(3));    
      else if(bytes[3]==9)
      {
        if(data.IDC_intput_mA<=12.0)
        {
          data.Water_pressure_MPa= parseFloat(((decode.IDC_intput_mA-4.0)*-0.0125).toFixed(3));
        }
        else
        {
          data.Water_pressure_MPa= parseFloat(((decode.IDC_intput_mA-12.0)*0.0125).toFixed(3));
        }
      }
      else if(bytes[3]==10)
        data.Water_pressure_kPa= parseFloat(((decode.IDC_intput_mA-4.0)*0.3125).toFixed(3));   
      else if(bytes[3]==11)
        data.Water_pressure_kPa= parseFloat(((decode.IDC_intput_mA-4.0)*3.125).toFixed(3));   
      else if(bytes[3]==12)
        data.Water_pressure_kPa= parseFloat(((decode.IDC_intput_mA-4.0)*6.25).toFixed(3));         
    }
    }
  return{
    data:data
    };
  }
}