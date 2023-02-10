function datalog(i,bytes){
  var ff=(bytes[0+i]&0xFC)>>2;
  var aa=(bytes[0+i]&0x02)?"TRUE":"FALSE"; 
  var bb=(bytes[0+i]&0x01)?"OPEN":"CLOSE";  
  var cc=(bytes[1+i]<<16 | bytes[2+i]<<8 | bytes[3+i]).toString(10);
  var dd=(bytes[4+i]<<16 | bytes[5+i]<<8 | bytes[6+i]).toString(10);
  var ee= getMyDate((bytes[7+i]<<24 | bytes[8+i]<<16 | bytes[9+i]<<8 | bytes[10+i]).toString(10));
  var string='['+aa+','+bb+','+cc+','+ff+','+dd+','+ee+']'+',';  
  
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
	
function decodeUplink(input) {
	var port = input.fPort;
	var bytes = input.bytes;
	var data = {};
	 switch (input.fPort) {				 
 case 2:	
  { 
    data.ALARM=(bytes[0]&0x02)?"TRUE":"FALSE"; 
    data.PIN_STATUS=(bytes[0]&0x01)?"DISCONNECT":"CONNECT"; 
    data.CALCULATE_FLAG=(bytes[0]&0xFC)>>2;
    data.TOTAL_PULSE=bytes[1]<<16 | bytes[2]<<8 | bytes[3];
    data.DISCONNECT_DURATION=bytes[4]<<16 | bytes[5]<<8 | bytes[6];
    data.TIME= getMyDate((bytes[7]<<24 | bytes[8]<<16 | bytes[9]<<8 | bytes[10]).toString(10));
  }
  return {
      data: data,
    }
  break;
  
  case 3:
  {
    for(var i=0;i<bytes.length;i=i+11)
    {
      var da= datalog(i,bytes);
      if(i=='0')
        data.DATALOG=da;
      else
        data.DATALOG+=da;
    }
  }
  return {
      data: data,
    }
  break;
  
 case 4:
  {
    data.TDC= bytes[0]<<16 | bytes[1]<<8 | bytes[2];
    data.DISALARM= bytes[3]&0x01;
    data.KEEP_STATUS= bytes[4]&0x01;
    data.KEEP_TIME= bytes[5]<<8 | bytes[6];
    data.TRIGGER_MODE= bytes[7]&0x01;
  }
  return {
      data: data,
    }
  break;
  
   case 5:
  { 
    if(bytes[0]==0x0E)
      data.SENSOR_MODEL= "CPL01";
      
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