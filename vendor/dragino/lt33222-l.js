function decodeUplink(input) {
  var port = input.fPort;
var bytes = input.bytes;
  var hardware= (bytes[10] & 0xC0)>>6;
  var mode0= bytes[10] & 0xff;
  var mode= bytes[10] & 0x3f;
 var data = {};
switch (input.fPort) {
  case 2:
  
  if(hardware=='0')
  {
    data.Hardware_mode="LT33222";
    data.DO3_status=(bytes[8] &0x04)? "L":"H";
    if(mode0=='1')
    {
    	data.DI3_status= (bytes[8] &0x20)?"H":"L"; 
    }
  }
  else if(hardware=='1')
  {
    data.Hardware_mode= "LT22222";
  }
  
  if(mode!=6)
  {
    data.DO1_status= (bytes[8] &0x01)? "L":"H";
    data.DO2_status= (bytes[8] &0x02)? "L":"H";
    data.RO1_status= (bytes[8] &0x80)? "ON":"OFF";
    data.RO2_status= (bytes[8] &0x40)? "ON":"OFF";
    if(mode!=1)
    {
      if(mode!=5)
      {
       data.Count1_times= (bytes[0]<<24 | bytes[1]<<16 | bytes[2]<<8 | bytes[3]);
      }
      data.First_status= (bytes[8] &0x20)? "Yes":"No";
    }
  }
  
  if(mode=='1')
  {
    data.Work_mode= "2ACI+2AVI";
    data.AVI1_V= parseFloat(((bytes[0]<<24>>16 | bytes[1])/1000).toFixed(3));
    data.AVI2_V= parseFloat(((bytes[2]<<24>>16 | bytes[3])/1000).toFixed(3));
    data.ACI1_mA= parseFloat(((bytes[4]<<24>>16 | bytes[5])/1000).toFixed(3));
    data.ACI2_mA= parseFloat(((bytes[6]<<24>>16 | bytes[7])/1000).toFixed(3));
    data.DI1_status= (bytes[8] &0x08)? "H":"L";
    data.DI2_status= (bytes[8] &0x10)? "H":"L"
  }
  else if(mode=='2')
  {
    data.Work_mode= "Count mode 1";
    data.Count2_times= (bytes[4]<<24 | bytes[5]<<16 | bytes[6]<<8 | bytes[7]);
  }
  else if(mode=='3')
  {
    data.Work_mode= "2ACI+1Count";
    data.ACI1_mA= parseFloat(((bytes[4]<<24>>16 | bytes[5])/1000).toFixed(3));
    data.ACI2_mA= parseFloat(((bytes[6]<<24>>16 | bytes[7])/1000).toFixed(3));
  }
  else if(mode=='4')
  {
    data.Work_mode= "Count mode 2";
    data.Acount_times= (bytes[4]<<24 | bytes[5]<<16 | bytes[6]<<8 | bytes[7]);
  }
  else if(mode=='5')
  {
    data.Work_mode= " 1ACI+2AVI+1Count";
    data.AVI1_V= parseFloat(((bytes[0]<<24>>16 | bytes[1])/1000).toFixed(3));
    data.AVI2_V= parseFloat(((bytes[2]<<24>>16 | bytes[3])/1000).toFixed(3));
    data.ACI1_mA= parseFloat(((bytes[4]<<24>>16 | bytes[5])/1000).toFixed(3));
    data.Count1_times= bytes[6]<<8 | bytes[7];
  }
  else if(mode=='6')
  {
    data.Work_mode= "Exit mode"; 
    data.Mode_status= bytes[9] ? "True":"False";
    data.AV1L_flag= (bytes[0] &0x80)? "True":"False";
    data.AV1H_flag= (bytes[0] &0x40)? "True":"False";
    data.AV2L_flag= (bytes[0] &0x20)? "True":"False";
    data.AV2H_flag= (bytes[0] &0x10)? "True":"False";   
    data.AC1L_flag= (bytes[0] &0x08)? "True":"False";
    data.AC1H_flag= (bytes[0] &0x04)? "True":"False";
    data.AC2L_flag= (bytes[0] &0x02)? "True":"False";
    data.AC2H_flag= (bytes[0] &0x01)? "True":"False";   
    data.AV1L_status= (bytes[1] &0x80)? "True":"False";
    data.AV1H_status= (bytes[1] &0x40)? "True":"False";
    data.AV2L_status= (bytes[1] &0x20)? "True":"False";
    data.AV2H_status= (bytes[1] &0x10)? "True":"False";   
    data.AC1L_status= (bytes[1] &0x08)? "True":"False";
    data.AC1H_status= (bytes[1] &0x04)? "True":"False";
    data.AC2L_status= (bytes[1] &0x02)? "True":"False";
    data.AC2H_status= (bytes[1] &0x01)? "True":"False";   
    data.DI2_status= (bytes[2] &0x08)? "True":"False";
    data.DI2_flag= (bytes[2] &0x04)? "True":"False";
    data.DI1_status= (bytes[2] &0x02)? "True":"False";
    data.DI1_flag= (bytes[2] &0x01)? "True":"False";   
  }
  
  if(bytes.length==11)
  {
   return {
      data:data,
     };
  }
  default:
 return {
   errors: ["unknown FPort"]
 }
}
}