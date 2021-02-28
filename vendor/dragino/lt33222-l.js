function Decoder(bytes, port) {
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
       decode.Count1_times= (bytes[0]<<24 | bytes[1]<<16 | bytes[2]<<8 | bytes[3]);
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
    decode.DI2_status= (bytes[8] &0x10)? "H":"L"
  }
  else if(mode=='2')
  {
    decode.Work_mode= "Count mode 1";
    decode.Count2_times= (bytes[4]<<24 | bytes[5]<<16 | bytes[6]<<8 | bytes[7]);
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
    decode.Acount_times= (bytes[4]<<24 | bytes[5]<<16 | bytes[6]<<8 | bytes[7]);
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
  
  if(bytes.length==11)
  {
    return decode;
  }
}