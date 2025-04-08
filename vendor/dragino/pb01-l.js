function decodeUplink(input) {
	var port = input.fPort;
	var bytes = input.bytes;
	var mode=(bytes[6] & 0x7C)>>2;
	var data = {};
	function datalog(i,bytes){
  var aa= parseFloat(((bytes[0+i]<<24>>16 | bytes[1+i])/10).toFixed(1));
  var bb= parseFloat(((bytes[2+i]<<24>>16 | bytes[3+i])/10).toFixed(1));
  var cc= parseFloat(((bytes[4+i]<<24>>16 | bytes[5+i])/10).toFixed(1));
  var dd= (bytes[6+i]&0x01) ? "True":"False";
  var ee= getMyDate((bytes[7+i]<<24 | bytes[8+i]<<16 | bytes[9+i]<<8 | bytes[10+i]).toString(10));
  var string='['+aa+','+bb+','+cc+','+dd+','+ee+']'+',';  
  
  return string;
}
	function getzf(c_num){ 
	  if(parseInt(c_num) < 10)
		c_num = '0' + c_num; 

	  return c_num; 
	}

	function getMyDate(str){ 
	  var c_Date;
	  if(str > 9999999999)
		c_Date = new Date(parseInt(str));
	  else 
		c_Date = new Date(parseInt(str) * 1000);
	  
	  var c_Year = c_Date.getFullYear(), 
	  c_Month = c_Date.getMonth()+1, 
	  c_Day = c_Date.getDate(),
	  c_Hour = c_Date.getHours(), 
	  c_Min = c_Date.getMinutes(), 
	  c_Sen = c_Date.getSeconds();
	  var c_Time = c_Year +'-'+ getzf(c_Month) +'-'+ getzf(c_Day) +' '+ getzf(c_Hour) +':'+ getzf(c_Min) +':'+getzf(c_Sen); 
	  
	  return c_Time;
	}
	 switch (input.fPort) {
		 case 2:

   
      data.BatV=(bytes[0]<<8 | bytes[1])/1000;
      data.Sound_key=((bytes[2]>>1) & 0x01)? "OPEN":"CLOSE";
      data.Sound_ACK=(bytes[2] & 0x01)? "OPEN":"CLOSE";
      data.Alarm=(bytes[3] & 0x01)? "TRUE":"FALSE";     
      data.TempC_SHT41= parseFloat(((bytes[4]<<24>>16 | bytes[5])/10).toFixed(1));
      data.Hum_SHT41=parseFloat(((bytes[6]<<8 | bytes[7])/10).toFixed(1));


  if(bytes.length==8)
  return {
      data: data,
    }
	break;
case 3:
   var pnack= ((bytes[6]>>7)&0x01) ? "True":"False";
    for(var i=0;i<bytes.length;i=i+11)
    {
      var data1= datalog(i,bytes);
      if(i=='0')
        data_sum=data1;
      else
        data_sum+=data1;
    }
     
    data.DATALOG=data_sum;
    data.PNACKMD=pnack;
    return {
      data: data,
    }
    
  break;
  
case 5:
  { 
    if(bytes[0]==0x35)
      data.SENSOR_MODEL= "PB01-L";
      
    if(bytes[4]==0xff)
      data.SUB_BAND="NULL";
    else
      data.SUB_BAND=bytes[4];
    
    if(bytes[3]==0x01)
      data.FREQUENCY_BAND="EU868";
    else if(bytes[3]==0x02)
      data.FREQUENCY_BAND="US915";
    else if(bytes[3]==0x03)
      data.FREQUENCY_BAND="IN865";
    else if(bytes[3]==0x04)
      data.FREQUENCY_BAND="AU915";
    else if(bytes[3]==0x05)
      data.FREQUENCY_BAND="KZ865";
    else if(bytes[3]==0x06)
      data.FREQUENCY_BAND="RU864";
    else if(bytes[3]==0x07)
      data.FREQUENCY_BAND="AS923";
    else if(bytes[3]==0x08)
      data.FREQUENCY_BAND="AS923_1";
    else if(bytes[3]==0x09)
      data.FREQUENCY_BAND="AS923_2";
    else if(bytes[3]==0x0A)
      data.FREQUENCY_BAND="AS923_3";
    else if(bytes[3]==0x0B)
      data.FREQUENCY_BAND="CN470";
    else if(bytes[3]==0x0C)
      data.FREQUENCY_BAND="EU433";
    else if(bytes[3]==0x0D)
      data.FREQUENCY_BAND="KR920";
    else if(bytes[3]==0x0E)
      data.FREQUENCY_BAND="MA869";
      
    data.FIRMWARE_VERSION= (bytes[1]&0x0f)+'.'+(bytes[2]>>4&0x0f)+'.'+(bytes[2]&0x0f);
    data.BAT= (bytes[5]<<8 | bytes[6])/1000;
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