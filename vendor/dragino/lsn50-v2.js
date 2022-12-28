function Decoder(bytes, port) {
//LSN50 Decode   
if(port==0x02)
{
  var decode = {};
  var mode=(bytes[6] & 0x7C)>>2;
  
  decode.Digital_IStatus= (bytes[6] & 0x02)? "H":"L";
  
  if(mode!=2)
  {
    decode.BatV= (bytes[0]<<8 | bytes[1])/1000;
    if((bytes[2]==0x7f)&&(bytes[3]==0xff))
      decode.TempC1= "NULL";
    else
      decode.TempC1= parseFloat(((bytes[2]<<24>>16 | bytes[3])/10).toFixed(1));
    if(mode!=8)
      decode.ADC_CH0V= (bytes[4]<<8 | bytes[5])/1000;
  }
  
  if((mode!=5)&&(mode!=6))
  {
  	decode.EXTI_Trigger= (bytes[6] & 0x01)? "TRUE":"FALSE";
    decode.Door_status= (bytes[6] & 0x80)? "CLOSE":"OPEN";
  }
  
  if(mode=='0')
  {
    decode.Work_mode="IIC";
    if((bytes[9]<<8 | bytes[10])===0)
      decode.Illum= (bytes[7]<<8 | bytes[8]);
    else 
    {
      if(((bytes[7]==0x7f)&&(bytes[8]==0xff))||((bytes[7]==0xff)&&(bytes[8]==0xff)))
        decode.TempC_SHT= "NULL";
      else
        decode.TempC_SHT= parseFloat(((bytes[7]<<24>>16 | bytes[8])/10).toFixed(1));
  
      if((bytes[9]==0xff)&&(bytes[10]==0xff))
        decode.Hum_SHT= "NULL";
      else
        decode.Hum_SHT= parseFloat(((bytes[9]<<8 | bytes[10])/10).toFixed(1));
    }
  }
  else if(mode=='1')
  {
    decode.Work_mode="Distance";

    if((bytes[7]===0x00)&&(bytes[8]===0x00))
      decode.Distance_cm= "NULL";
    else
      decode.Distance_cm= parseFloat(((bytes[7]<<8 | bytes[8])/10).toFixed(1));
        
    if(!((bytes[9]==0xff)&&(bytes[10]==0xff)))
      decode.Distance_signal_strength= (bytes[9]<<8 | bytes[10]);
  }
  else if(mode=='2')
  {
    decode.Work_mode="3ADC+IIC";
    decode.BatV= bytes[11]/10;
    decode.ADC_CH0V= (bytes[0]<<8 | bytes[1])/1000;
    decode.ADC_CH1V= (bytes[2]<<8 | bytes[3])/1000;
    decode.ADC_CH4V= (bytes[4]<<8 | bytes[5])/1000;
    if((bytes[9]<<8 | bytes[10])===0)
      decode.Illum= (bytes[7]<<8 | bytes[8]);
    else 
    {
      if(((bytes[7]==0x7f)&&(bytes[8]==0xff))||((bytes[7]==0xff)&&(bytes[8]==0xff)))
        decode.TempC_SHT= "NULL";
      else
        decode.TempC_SHT= parseFloat(((bytes[7]<<24>>16 | bytes[8])/10).toFixed(1));
  
      if((bytes[9]==0xff)&&(bytes[10]==0xff))
        decode.Hum_SHT= "NULL";
      else
        decode.Hum_SHT= parseFloat(((bytes[9]<<8 | bytes[10])/10).toFixed(1));
    }
  }
  else if(mode=='3')
  {
    decode.Work_mode="3DS18B20";
    if((bytes[7]==0x7f)&&(bytes[8]==0xff))
      decode.TempC2= "NULL";
    else  
      decode.TempC2= parseFloat(((bytes[7]<<24>>16 | bytes[8])/10).toFixed(1));
      
    if((bytes[9]==0x7f)&&(bytes[10]==0xff))
      decode.TempC3= "NULL";  
    else
      decode.TempC3= parseFloat(((bytes[9]<<24>>16 | bytes[10])/10).toFixed(1));
  }
  else if(mode=='4')
  {
    decode.Work_mode="Weight";
    decode.Weight= (bytes[9]<<24 | bytes[10]<<16 | bytes[7]<<8 | bytes[8]);
  }
  else if(mode=='5')
  {
    decode.Work_mode="1Count";
    decode.Count= (bytes[7]<<24 | bytes[8]<<16 | bytes[9]<<8 | bytes[10])>>>0;
  }
  else if(mode=='6')
  {
    decode.Work_mode="3Interrupt";
    decode.EXTI1_Trigger= (bytes[6] & 0x01)? "TRUE":"FALSE";  
    decode.EXTI1_Status= (bytes[6] & 0x80)? "CLOSE":"OPEN"; 
    decode.EXTI2_Trigger= (bytes[7] & 0x10)? "TRUE":"FALSE";
    decode.EXTI2_Status= (bytes[7] & 0x01)? "CLOSE":"OPEN"; 
    decode.EXTI3_Trigger= (bytes[8] & 0x10)? "TRUE":"FALSE";
    decode.EXTI3_Status= (bytes[8] & 0x01)? "CLOSE":"OPEN";
  }
  else if(mode=='7')
  {
    decode.Work_mode="3ADC+1DS18B20";
    decode.ADC_CH1V= (bytes[7]<<8 | bytes[8])/1000;
    decode.ADC_CH4V= (bytes[9]<<8 | bytes[10])/1000;  
  }
  else if(mode=='8')
  {
    decode.Work_mode="3DS18B20+2Count";
    if((bytes[4]==0x7f)&&(bytes[5]==0xff))
      decode.TempC2= "NULL";
    else  
      decode.TempC2= parseFloat(((bytes[4]<<24>>16 | bytes[5])/10).toFixed(1));
      
    if((bytes[7]==0x7f)&&(bytes[8]==0xff))
      decode.TempC3= "NULL";  
    else
      decode.TempC3= parseFloat(((bytes[7]<<24>>16 | bytes[8])/10).toFixed(1));
      
    decode.Count1= (bytes[9]<<24 | bytes[10]<<16 | bytes[11]<<8 | bytes[12])>>>0;
    decode.Count2= (bytes[13]<<24 | bytes[14]<<16 | bytes[15]<<8 | bytes[16])>>>0;
  }
  
  if(bytes.length!=1)
    return decode;
  }
  
  else if(port==5)
  {
  	var freq_band;
  	var sub_band;
  	
    if(bytes[0]==0x01)
        freq_band="EU868";
  	else if(bytes[0]==0x02)
        freq_band="US915";
  	else if(bytes[0]==0x03)
        freq_band="IN865";
  	else if(bytes[0]==0x04)
        freq_band="AU915";
  	else if(bytes[0]==0x05)
        freq_band="KZ865";
  	else if(bytes[0]==0x06)
        freq_band="RU864";
  	else if(bytes[0]==0x07)
        freq_band="AS923";
  	else if(bytes[0]==0x08)
        freq_band="AS923_1";
  	else if(bytes[0]==0x09)
        freq_band="AS923_2";
  	else if(bytes[0]==0x0A)
        freq_band="AS923_3";
  	else if(bytes[0]==0x0F)
        freq_band="AS923_4";
  	else if(bytes[0]==0x0B)
        freq_band="CN470";
  	else if(bytes[0]==0x0C)
        freq_band="EU433";
  	else if(bytes[0]==0x0D)
        freq_band="KR920";
  	else if(bytes[0]==0x0E)
        freq_band="MA869";
  	
    if(bytes[1]==0xff)
      sub_band="NULL";
	  else
      sub_band=bytes[1];

	  var firm_ver= (bytes[2]&0x0f)+'.'+(bytes[3]>>4&0x0f)+'.'+(bytes[3]&0x0f);
	  
	  var tdc_time= bytes[4]<<16 | bytes[5]<<8 | bytes[6];
	  
  	return {
      FIRMWARE_VERSION:firm_ver,
      FREQUENCY_BAND:freq_band,
      SUB_BAND:sub_band,
      TDC_sec:tdc_time,
  	}
  }
}