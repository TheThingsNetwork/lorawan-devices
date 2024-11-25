function decodeUplink(input) {
  var mode=(input.bytes[6] & 0x7C)>>2;
	var data = {};
	 switch (input.fPort) {
		 case 2:
		 if((mode!=2)&&(mode!=31))
{
  var decode = {};
  
  decode.Digital_IStatus= (input.bytes[6] & 0x02)? "H":"L";
  
  if(mode!=2)
  {
    decode.BatV= (input.bytes[0]<<8 | input.bytes[1])/1000;
    if((input.bytes[2]==0x7f)&&(input.bytes[3]==0xff))
      decode.TempC1= "NULL";
    else
      decode.TempC1= parseFloat(((input.bytes[2]<<24>>16 | input.bytes[3])/10).toFixed(1));
    if(mode!=8)
      decode.ADC_CH0V= (input.bytes[4]<<8 | input.bytes[5])/1000;
  }
  
  if((mode!=5)&&(mode!=6))
  {
  	decode.EXTI_Trigger= (input.bytes[6] & 0x01)? "TRUE":"FALSE";
    decode.Door_status= (input.bytes[6] & 0x80)? "CLOSE":"OPEN";
  }
  
  if(mode=='0')
  {
    decode.Work_mode="IIC";
    if((input.bytes[9]<<8 | input.bytes[10])===0)
      decode.Illum= (input.bytes[7]<<8 | input.bytes[8]);
    else 
    {
      if(((input.bytes[7]==0x7f)&&(input.bytes[8]==0xff))||((input.bytes[7]==0xff)&&(input.bytes[8]==0xff)))
        decode.TempC_SHT= "NULL";
      else
        decode.TempC_SHT= parseFloat(((input.bytes[7]<<24>>16 | input.bytes[8])/10).toFixed(1));
  
      if((input.bytes[9]==0xff)&&(input.bytes[10]==0xff))
        decode.Hum_SHT= "NULL";
      else
        decode.Hum_SHT= parseFloat(((input.bytes[9]<<8 | input.bytes[10])/10).toFixed(1));
    }
  }
  else if(mode=='1')
  {
    decode.Work_mode="Distance";

    if((input.bytes[7]===0x00)&&(input.bytes[8]===0x00))
      decode.Distance_cm= "NULL";
    else
      decode.Distance_cm= parseFloat(((input.bytes[7]<<8 | input.bytes[8])/10).toFixed(1));
        
    if(!((input.bytes[9]==0xff)&&(input.bytes[10]==0xff)))
      decode.Distance_signal_strength= (input.bytes[9]<<8 | input.bytes[10]);
  }
  else if(mode=='2')
  {
    decode.Work_mode="3ADC+IIC";
    decode.BatV= input.bytes[11]/10;
    decode.ADC_CH0V= (input.bytes[0]<<8 | input.bytes[1])/1000;
    decode.ADC_CH1V= (input.bytes[2]<<8 | input.bytes[3])/1000;
    decode.ADC_CH4V= (input.bytes[4]<<8 | input.bytes[5])/1000;
    if((input.bytes[9]<<8 | input.bytes[10])===0)
      decode.Illum= (input.bytes[7]<<8 | input.bytes[8]);
    else 
    {
      if(((input.bytes[7]==0x7f)&&(input.bytes[8]==0xff))||((input.bytes[7]==0xff)&&(input.bytes[8]==0xff)))
        decode.TempC_SHT= "NULL";
      else
        decode.TempC_SHT= parseFloat(((input.bytes[7]<<24>>16 | input.bytes[8])/10).toFixed(1));
  
      if((input.bytes[9]==0xff)&&(input.bytes[10]==0xff))
        decode.Hum_SHT= "NULL";
      else
        decode.Hum_SHT= parseFloat(((input.bytes[9]<<8 | input.bytes[10])/10).toFixed(1));
    }
  }
  else if(mode=='3')
  {
    decode.Work_mode="3DS18B20";
    if((input.bytes[7]==0x7f)&&(input.bytes[8]==0xff))
      decode.TempC2= "NULL";
    else  
      decode.TempC2= parseFloat(((input.bytes[7]<<24>>16 | input.bytes[8])/10).toFixed(1));
      
    if((input.bytes[9]==0x7f)&&(input.bytes[10]==0xff))
      decode.TempC3= "NULL";  
    else
      decode.TempC3= parseFloat(((input.bytes[9]<<24>>16 | input.bytes[10])/10).toFixed(1));
  }
  else if(mode=='4')
  {
    decode.Work_mode="Weight";
    decode.Weight= (input.bytes[9]<<24 | input.bytes[10]<<16 | input.bytes[7]<<8 | input.bytes[8]);
  }
  else if(mode=='5')
  {
    decode.Work_mode="1Count";
    decode.Count= (input.bytes[7]<<24 | input.bytes[8]<<16 | input.bytes[9]<<8 | input.bytes[10])>>>0;
  }
  else if(mode=='6')
  {
    decode.Work_mode="3Interrupt";
    decode.EXTI1_Trigger= (input.bytes[6] & 0x01)? "TRUE":"FALSE";  
    decode.EXTI1_Status= (input.bytes[6] & 0x80)? "CLOSE":"OPEN"; 
    decode.EXTI2_Trigger= (input.bytes[7] & 0x10)? "TRUE":"FALSE";
    decode.EXTI2_Status= (input.bytes[7] & 0x01)? "CLOSE":"OPEN"; 
    decode.EXTI3_Trigger= (input.bytes[8] & 0x10)? "TRUE":"FALSE";
    decode.EXTI3_Status= (input.bytes[8] & 0x01)? "CLOSE":"OPEN";
  }
  else if(mode=='7')
  {
    decode.Work_mode="3ADC+1DS18B20";
    decode.ADC_CH1V= (input.bytes[7]<<8 | input.bytes[8])/1000;
    decode.ADC_CH4V= (input.bytes[9]<<8 | input.bytes[10])/1000;  
  }
  else if(mode=='8')
  {
    decode.Work_mode="3DS18B20+2Count";
    if((input.bytes[4]==0x7f)&&(input.bytes[5]==0xff))
      decode.TempC2= "NULL";
    else  
      decode.TempC2= parseFloat(((input.bytes[4]<<24>>16 | input.bytes[5])/10).toFixed(1));
      
    if((input.bytes[7]==0x7f)&&(input.bytes[8]==0xff))
      decode.TempC3= "NULL";  
    else
      decode.TempC3= parseFloat(((input.bytes[7]<<24>>16 | input.bytes[8])/10).toFixed(1));
      
    decode.Count1= (input.bytes[9]<<24 | input.bytes[10]<<16 | input.bytes[11]<<8 | input.bytes[12])>>>0;
    decode.Count2= (input.bytes[13]<<24 | input.bytes[14]<<16 | input.bytes[15]<<8 | input.bytes[16])>>>0;
  }
  
  if(input.bytes.length!=1)
    return {
       data:decode,
  }
  }
  break;
  case 5:
  {
    var decode = {};
  	var freq_band;
  	var sub_band;
  	
    if(input.bytes[0]==0x01)
        decode.freq_band="EU868";
  	else if(input.bytes[0]==0x02)
        decode.freq_band="US915";
  	else if(input.bytes[0]==0x03)
        decode.freq_band="IN865";
  	else if(input.bytes[0]==0x04)
        decode.freq_band="AU915";
  	else if(input.bytes[0]==0x05)
        decode.freq_band="KZ865";
  	else if(input.bytes[0]==0x06)
        decode.freq_band="RU864";
  	else if(input.bytes[0]==0x07)
        decode.freq_band="AS923";
  	else if(input.bytes[0]==0x08)
        decode.freq_band="AS923_1";
  	else if(input.bytes[0]==0x09)
        decode.freq_band="AS923_2";
  	else if(input.bytes[0]==0x0A)
        decode.freq_band="AS923_3";
  	else if(input.bytes[0]==0x0F)
        decode.freq_band="AS923_4";
  	else if(input.bytes[0]==0x0B)
        decode.freq_band="CN470";
  	else if(input.bytes[0]==0x0C)
        decode.freq_band="EU433";
  	else if(input.bytes[0]==0x0D)
        decode.freq_band="KR920";
  	else if(input.bytes[0]==0x0E)
        decode.freq_band="MA869";
  	
    if(input.bytes[1]==0xff)
      decode.sub_band="NULL";
	  else
      decode.sub_band=input.bytes[1];

	  decode.firm_ver= (input.bytes[2]&0x0f)+'.'+(input.bytes[3]>>4&0x0f)+'.'+(input.bytes[3]&0x0f);
	  
	  decode.tdc_time= input.bytes[4]<<16 | input.bytes[5]<<8 | input.bytes[6];
	  
  	return {
      data:decode,
  	}
  }
  	break;
default:
	return {
		  errors: ["unknown FPort"]
}
}
}

function normalizeUplink(input) {
  var data = {};
  var air = {};
  var action = {};

  if (input.data.TempC_SHT) {
    air.temperature = input.data.TempC_SHT;
  }

  if (input.data.Hum_SHT) {
    air.relativeHumidity = input.data.Hum_SHT;
  }

  if (input.data.Door_status === "CLOSE" || input.data.Door_status === "OPEN") {
    action.contactState = input.data.Door_status === "CLOSE" ? "closed" : "open";
  }

  if (Object.keys(air).length > 0) {
    data.air = air;
  }

  if (Object.keys(action).length > 0) {
    data.action = action;
  }

  if (input.data.BatV) {
      data.battery = input.data.BatV;
  }

  return { data: data };
}
