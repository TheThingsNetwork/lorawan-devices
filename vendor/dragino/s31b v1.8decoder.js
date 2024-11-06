function datalog(i,bytes){
  var aa= parseFloat(((bytes[3+i]<<24>>16 | bytes[4+i])/10).toFixed(1));
  var bb= parseFloat(((bytes[5+i]<<8 | bytes[6+i])/10).toFixed(1));
  var cc= getMyDate((bytes[7+i]<<24 | bytes[8+i]<<16 | bytes[9+i]<<8 | bytes[10+i]).toString(10));
  var string='['+aa+','+bb+','+cc+']'+',';  
  
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
	var mode=(input.bytes[6] & 0x7C)>>2;
	var data = {};
	var port = input.fPort;
	var bytes = input.bytes;
	var mode=(bytes[6] & 0x7C)>>2;
	 switch (input.fPort) {
		 case 2:
  {
    
    var mode=(bytes[6] & 0x7C)>>2;
    if(mode==0)
    {
      data.BatV=(bytes[0]<<8 | bytes[1])/1000;
      data.EXTI_Trigger=(bytes[6] & 0x01)? "TRUE":"FALSE";
      data.Door_status=(bytes[6] & 0x80)? "CLOSE":"OPEN";     
      data.TempC_SHT31= parseFloat(((bytes[7]<<24>>16 | bytes[8])/10).toFixed(1));
      data.Hum_SHT31=parseFloat(((bytes[9]<<8 | bytes[10])/10).toFixed(1));
      data.Data_time= getMyDate((bytes[2]<<24 | bytes[3]<<16 | bytes[4]<<8 | bytes[5]).toString(10));         
    }
    else if(mode==31)
    {
      data.SHTEMP_MIN= bytes[7]<<24>>24;
      data.SHTEMP_MAX= bytes[8]<<24>>24;
      data.SHHUM_MIN= bytes[9];
      data.SHHUM_MAX= bytes[10];         
    }
    
    if(bytes.length==11)
      return {
        data:data,
      }
  }
  
  case 3:
  {
    for(var i=0;i<bytes.length;i=i+11)
    {
      var data1= datalog(i,bytes);
      if(i=='0')
        data.Datalog=data1;
      else
        data.Datalog+=data1;
    }
    
    return{
   data:data
    };    
  }
  case 5:
  {
  	var FREQUENCY_BAND;
  	var SUB_BAND;
  	
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
  	
  	data.FREQUENCY_BAND=freq_band;
    if(bytes[1]==0xff)
      data.SUB_BAND="NULL";
	  else
      data.SUB_BAND=bytes[1];

	  data.FIRMWARE_VERSION= (bytes[2]&0x0f)+'.'+(bytes[3]>>4&0x0f)+'.'+(bytes[3]&0x0f);
	  
	  data.TDC_sec= bytes[4]<<16 | bytes[5]<<8 | bytes[6];
	  
  	return {
      data:data
  	}
  }
	 }
}