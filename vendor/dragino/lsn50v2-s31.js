function decodeUplink(input) {
	var mode=(input.bytes[6] & 0x7C)>>2;
	var data = {};
	 switch (input.fPort) {
		 case 2:
		 if((mode!=2)&&(mode!=31))
{
  data.BatV=(input.bytes[0]<<8 | input.bytes[1])/1000;
  data.TempC1= parseFloat(((input.bytes[2]<<24>>16 | input.bytes[3])/10).toFixed(2));
  data.ADC_CH0V=(input.bytes[4]<<8 | input.bytes[5])/1000;
  data.Digital_IStatus=(input.bytes[6] & 0x02)? "H":"L";
  if(mode!=6)
  {
	 data.EXTI_Trigger=(input.bytes[6] & 0x01)? "TRUE":"FALSE";
  data.Door_status=(input.bytes[6] & 0x80)? "CLOSE":"OPEN";
  }
}
		 if(mode=='0')
{
  data.Work_mode="IIC";
  if((input.bytes[9]<<8 | input.bytes[10])===0)
  {
    data.Illum=(input.bytes[7]<<24>>16 |input.bytes[8]);
  }
  else
  {
  data.TempC_SHT=parseFloat(((input.bytes[7]<<24>>16 | input.bytes[8])/10).toFixed(2));
  data.Hum_SHT=parseFloat(((input.bytes[9]<<8 | input.bytes[10])/10).toFixed(1));
  }
}
else if(mode=='1')
{
  data.Work_mode=" Distance";
  data.Distance_cm=parseFloat(((input.bytes[7]<<8 | input.bytes[8])/10) .toFixed(1));
  if((input.bytes[9]<<8 | input.bytes[10])!=65535)
  {
    data.Distance_signal_strength=parseFloat((input.bytes[9]<<8 | input.bytes[10]) .toFixed(0));
  }
}
else if(mode=='2')
{
  data.Work_mode=" 3ADC";
  data.BatV=input.bytes[11]/10;
  data.ADC_CH0V=(input.bytes[0]<<8 | input.bytes[1])/1000;
  data.ADC_CH1V=(input.bytes[2]<<8 | input.bytes[3])/1000;
  data.ADC_CH4V=(input.bytes[4]<<8 | input.bytes[5])/1000;
  data.Digital_IStatus=(input.bytes[6] & 0x02)? "H":"L";
  data.EXTI_Trigger=(input.bytes[6] & 0x01)? "TRUE":"FALSE";
  data.Door_status=(input.bytes[6] & 0x80)? "CLOSE":"OPEN";
  if((input.bytes[9]<<8 | input.bytes[10])===0)
  {
    data.Illum=(input.bytes[7]<<24>>16 | input.bytes[8]);
  }
  else
  {
  data.TempC_SHT=parseFloat(((input.bytes[7]<<24>>16 |input.bytes[8])/10).toFixed(2));
  data.Hum_SHT=parseFloat(((input.bytes[9]<<8  | input.bytes[10])/10) .toFixed(2));
  }
}
else if(mode=='3')
{
  data.Work_mode="3DS18B20";
  data.TempC2=parseFloat(((input.bytes[7]<<24>>16 | input.bytes[8])/10).toFixed(2));
  data.TempC3=parseFloat(((input.bytes[9]<<24>>16 | input.bytes[10])/10) .toFixed(2));
  
}
else if(mode=='4')
{
  data.Work_mode="Weight";
  data.Weight=(input.bytes[7]<<24>>16 | input.bytes[8]);
}
else if(mode=='5')
{
  data.Work_mode="Count";
  data.Count=(input.bytes[7]<<24 | input.bytes[8]<<16 | input.bytes[9]<<8 | input.bytes[10]);
}
else if(mode=='31')
{
  data.Work_mode="ALARM";
  data.BatV=(input.bytes[0]<<8 | input.bytes[1])/1000;
  data.TempC1= parseFloat(((input.bytes[2]<<24>>16 | input.bytes[3])/10).toFixed(2));
  data.TempC1MIN= input.bytes[4]<<24>>24;
  data.TempC1MAX= input.bytes[5]<<24>>24; 
  data.SHTEMPMIN= input.bytes[7]<<24>>24;
  data.SHTEMPMAX= input.bytes[8]<<24>>24;   
  data.SHTHUMMIN= input.bytes[9];
 data.SHTHUMMAX= input.bytes[10];    
}

  if((input.bytes.length==11)||(input.bytes.length==12))
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