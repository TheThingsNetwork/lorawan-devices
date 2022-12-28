function Decoder(bytes, port) {
//LT33222-L or LT22222-L Decode   
  if(port==0x02)
  {  
    var hardware= (bytes[10] & 0xC0)>>6;
    var mode0= bytes[10] & 0xff;
    var mode= bytes[10] & 0x3f;
    var decode = {};
    
    if(hardware=='0')
    {
      decode.Hardware_mode="LT33222";
      decode.DO3_status=(bytes[8] &0x04)? "L":"H";
      if(mode0=='1')
      {
      	decode.DI3_status= (bytes[8] &0x20)?"H":"L"; 
      }
    }
    else if(hardware=='1')
    {
      decode.Hardware_mode= "LT22222";
    }
    
    if(mode!=6)
    {
      decode.DO1_status= (bytes[8] &0x01)? "L":"H";
      decode.DO2_status= (bytes[8] &0x02)? "L":"H";
      decode.RO1_status= (bytes[8] &0x80)? "ON":"OFF";
      decode.RO2_status= (bytes[8] &0x40)? "ON":"OFF";
      if(mode!=1)
      {
        if(mode!=5)
        {
         decode.Count1_times= (bytes[0]<<24 | bytes[1]<<16 | bytes[2]<<8 | bytes[3])>>>0;
        }
        decode.First_status= (bytes[8] &0x20)? "Yes":"No";
      }
    }
    
    if(mode=='1')
    {
      decode.Work_mode= "2ACI+2AVI";
      decode.AVI1_V= parseFloat(((bytes[0]<<24>>16 | bytes[1])/1000).toFixed(3));
      decode.AVI2_V= parseFloat(((bytes[2]<<24>>16 | bytes[3])/1000).toFixed(3));
      decode.ACI1_mA= parseFloat(((bytes[4]<<24>>16 | bytes[5])/1000).toFixed(3));
      decode.ACI2_mA= parseFloat(((bytes[6]<<24>>16 | bytes[7])/1000).toFixed(3));
      decode.DI1_status= (bytes[8] &0x08)? "H":"L";
      decode.DI2_status= (bytes[8] &0x10)? "H":"L";
    }
    else if(mode=='2')
    {
      decode.Work_mode= "Count mode 1";
      decode.Count2_times= (bytes[4]<<24 | bytes[5]<<16 | bytes[6]<<8 | bytes[7]) >>>0;
    }
    else if(mode=='3')
    {
      decode.Work_mode= "2ACI+1Count";
      decode.ACI1_mA= parseFloat(((bytes[4]<<24>>16 | bytes[5])/1000).toFixed(3));
      decode.ACI2_mA= parseFloat(((bytes[6]<<24>>16 | bytes[7])/1000).toFixed(3));
    }
    else if(mode=='4')
    {
      decode.Work_mode= "Count mode 2";
      decode.Acount_times= (bytes[4]<<24 | bytes[5]<<16 | bytes[6]<<8 | bytes[7]) >>>0;
    }
    else if(mode=='5')
    {
      decode.Work_mode= " 1ACI+2AVI+1Count";
      decode.AVI1_V= parseFloat(((bytes[0]<<24>>16 | bytes[1])/1000).toFixed(3));
      decode.AVI2_V= parseFloat(((bytes[2]<<24>>16 | bytes[3])/1000).toFixed(3));
      decode.ACI1_mA= parseFloat(((bytes[4]<<24>>16 | bytes[5])/1000).toFixed(3));
      decode.Count1_times= bytes[6]<<8 | bytes[7];
    }
    else if(mode=='6')
    {
      decode.Work_mode= "Exit mode"; 
      decode.Mode_status= bytes[9] ? "True":"False";
      decode.AV1L_flag= (bytes[0] &0x80)? "True":"False";
      decode.AV1H_flag= (bytes[0] &0x40)? "True":"False";
      decode.AV2L_flag= (bytes[0] &0x20)? "True":"False";
      decode.AV2H_flag= (bytes[0] &0x10)? "True":"False";   
      decode.AC1L_flag= (bytes[0] &0x08)? "True":"False";
      decode.AC1H_flag= (bytes[0] &0x04)? "True":"False";
      decode.AC2L_flag= (bytes[0] &0x02)? "True":"False";
      decode.AC2H_flag= (bytes[0] &0x01)? "True":"False";   
      decode.AV1L_status= (bytes[1] &0x80)? "True":"False";
      decode.AV1H_status= (bytes[1] &0x40)? "True":"False";
      decode.AV2L_status= (bytes[1] &0x20)? "True":"False";
      decode.AV2H_status= (bytes[1] &0x10)? "True":"False";   
      decode.AC1L_status= (bytes[1] &0x08)? "True":"False";
      decode.AC1H_status= (bytes[1] &0x04)? "True":"False";
      decode.AC2L_status= (bytes[1] &0x02)? "True":"False";
      decode.AC2H_status= (bytes[1] &0x01)? "True":"False";   
      decode.DI2_status= (bytes[2] &0x08)? "True":"False";
      decode.DI2_flag= (bytes[2] &0x04)? "True":"False";
      decode.DI1_status= (bytes[2] &0x02)? "True":"False";
      decode.DI1_flag= (bytes[2] &0x01)? "True":"False";   
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