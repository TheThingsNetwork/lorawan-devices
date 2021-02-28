function Decoder(bytes, port) {
  var mode=(bytes[6] & 0x7C)>>2;
  var decode = {};
  if((mode!=2)&&(mode!=31))
  {
    decode.BatV=(bytes[0]<<8 | bytes[1])/1000;
    decode.TempC1= parseFloat(((bytes[2]<<24>>16 | bytes[3])/10).toFixed(2));
    decode.ADC_CH0V=(bytes[4]<<8 | bytes[5])/1000;
    decode.Digital_IStatus=(bytes[6] & 0x02)? "H":"L";
    if(mode!=6)
    {
     decode.EXTI_Trigger=(bytes[6] & 0x01)? "TRUE":"FALSE";
    decode.Door_status=(bytes[6] & 0x80)? "CLOSE":"OPEN";
    }
  }
  
  if(mode=='0')
  {
    decode.Work_mode="IIC";
    if((bytes[9]<<8 | bytes[10])===0)
    {
      decode.Illum=(bytes[7]<<24>>16 | bytes[8]);
    }
    else
    {
    decode.TempC_SHT=parseFloat(((bytes[7]<<24>>16 | bytes[8])/10).toFixed(2));
    decode.Hum_SHT=parseFloat(((bytes[9]<<8 | bytes[10])/10).toFixed(1));
    }
  }
  else if(mode=='1')
  {
    decode.Work_mode=" Distance";
    decode.Distance_cm=parseFloat(((bytes[7]<<8 | bytes[8])/10) .toFixed(1));
    if((bytes[9]<<8 | bytes[10])!=65535)
    {
      decode.Distance_signal_strength=parseFloat((bytes[9]<<8 | bytes[10]) .toFixed(0));
    }
  }
  else if(mode=='2')
  {
    decode.Work_mode=" 3ADC";
    decode.BatV=bytes[11]/10;
    decode.ADC_CH0V=(bytes[0]<<8 | bytes[1])/1000;
    decode.ADC_CH1V=(bytes[2]<<8 | bytes[3])/1000;
    decode.ADC_CH4V=(bytes[4]<<8 | bytes[5])/1000;
    decode.Digital_IStatus=(bytes[6] & 0x02)? "H":"L";
    decode.EXTI_Trigger=(bytes[6] & 0x01)? "TRUE":"FALSE";
    decode.Door_status=(bytes[6] & 0x80)? "CLOSE":"OPEN";
    if((bytes[9]<<8 | bytes[10])===0)
    {
      decode.Illum=(bytes[7]<<24>>16 | bytes[8]);
    }
    else
    {
    decode.TempC_SHT=parseFloat(((bytes[7]<<24>>16 | bytes[8])/10).toFixed(2));
    decode.Hum_SHT=parseFloat(((bytes[9]<<8 | bytes[10])/10) .toFixed(1));
    }
  }
  else if(mode=='3')
  {
    decode.Work_mode="3DS18B20";
    decode.TempC2=parseFloat(((bytes[7]<<24>>16 | bytes[8])/10).toFixed(2));
    decode.TempC3=parseFloat(((bytes[9]<<8 | bytes[10])/10) .toFixed(1));
    
  }
  else if(mode=='4')
  {
    decode.Work_mode="Weight";
    decode.Weight=(bytes[7]<<24>>16 | bytes[8]);
  }
  else if(mode=='5')
  {
    decode.Work_mode="Count";
    decode.Count=(bytes[7]<<24 | bytes[8]<<16 | bytes[9]<<8 | bytes[10]);
  }
  else if(mode=='31')
  {
    decode.Work_mode="ALARM";
    decode.BatV=(bytes[0]<<8 | bytes[1])/1000;
    decode.TempC1= parseFloat(((bytes[2]<<24>>16 | bytes[3])/10).toFixed(2));
    decode.TempC1MIN= bytes[4]<<24>>24;
    decode.TempC1MAX= bytes[5]<<24>>24; 
    decode.SHTEMPMIN= bytes[7]<<24>>24;
    decode.SHTEMPMAX= bytes[8]<<24>>24;   
    decode.SHTHUMMIN= bytes[9];
    decode.SHTHUMMAX= bytes[10];    
  }
  
    if((bytes.length==11)||(bytes.length==12))
    {
    return decode;
    }
  }