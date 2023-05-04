function decodeUplink(input) {
  var port = input.fPort;
  var hardware= (input.bytes[10] & 0xC0)>>6;
  var mode0= input.bytes[10] & 0xff;
  var mode= input.bytes[10] & 0x3f;
 var data = {};
switch (input.fPort) {
  case 2:

  if(hardware=='0')
  {
    data.Hardware_mode="LT33222";
    data.DO3_status=(input.bytes[8] &0x04)? "L":"H";
    if(mode0=='1')
	 {
    	data.DI3_status= (input.bytes[8] &0x20)?"H":"L"; 
		    }
  }
  else if(hardware=='1')
  {
    data.Hardware_mode= "LT22222";
  }

  if(mode!=6)
  {
    data.DO1_status= (input.bytes[8] &0x01)? "L":"H";
    data.DO2_status= (input.bytes[8] &0x02)? "L":"H";
    data.RO1_status= (input.bytes[8] &0x80)? "ON":"OFF";
    data.RO2_status= (input.bytes[8] &0x40)? "ON":"OFF";
    if(mode!=1)
	  {
      if(mode!=5)
	   {
       data.Count1_times= (input.bytes[0]<<24 | input.bytes[1]<<16 | input.bytes[2]<<8 | input.bytes[3]);
	      }
      data.First_status= (input.bytes[8] &0x20)? "Yes":"No";
    }
	 }

  if(mode=='1')
  {
    data.Work_mode= "2ACI+2AVI";
    data.AVI1_V= parseFloat(((input.bytes[0]<<24>>16 | input.bytes[1])/1000).toFixed(3));
    data.AVI2_V= parseFloat(((input.bytes[2]<<24>>16 | input.bytes[3])/1000).toFixed(3));
    data.ACI1_mA= parseFloat(((input.bytes[4]<<24>>16 | input.bytes[5])/1000).toFixed(3));
    data.ACI2_mA= parseFloat(((input.bytes[6]<<24>>16 | input.bytes[7])/1000).toFixed(3));
    data.DI1_status= (input.bytes[8] &0x08)? "H":"L";
    data.DI2_status= (input.bytes[8] &0x10)? "H":"L"
  }
  else if(mode=='2')
  {
    data.Work_mode= "Count mode 1";
    data.Count2_times= (input.bytes[4]<<24 | input.bytes[5]<<16 | input.bytes[6]<<8 | input.bytes[7]);
  }
  else if(mode=='3')
  {
    data.Work_mode= "2ACI+1Count";
    data.ACI1_mA= parseFloat(((input.bytes[4]<<24>>16 | input.bytes[5])/1000).toFixed(3));
    data.ACI2_mA= parseFloat(((input.bytes[6]<<24>>16 | input.bytes[7])/1000).toFixed(3));
  }
  else if(mode=='4')
  {
    data.Work_mode= "Count mode 2";
    data.Acount_times= (input.bytes[4]<<24 | input.bytes[5]<<16 | input.bytes[6]<<8 | input.bytes[7]);
  }
  else if(mode=='5')
  {
    data.Work_mode= " 1ACI+2AVI+1Count";
    data.AVI1_V= parseFloat(((input.bytes[0]<<24>>16 | input.bytes[1])/1000).toFixed(3));
    data.AVI2_V= parseFloat(((input.bytes[2]<<24>>16 | input.bytes[3])/1000).toFixed(3));
    data.ACI1_mA= parseFloat(((input.bytes[4]<<24>>16 | input.bytes[5])/1000).toFixed(3));
    data.Count1_times= input.bytes[6]<<8 | input.bytes[7];
  }
  else if(mode=='6')
  {
    data.Work_mode= "Exit mode"; 
    data.Mode_status= input.bytes[9] ? "True":"False";
    data.AV1L_flag= (input.bytes[0] &0x80)? "True":"False";
    data.AV1H_flag= (input.bytes[0] &0x40)? "True":"False";
    data.AV2L_flag= (input.bytes[0] &0x20)? "True":"False";
    data.AV2H_flag= (input.bytes[0] &0x10)? "True":"False";   
    data.AC1L_flag= (input.bytes[0] &0x08)? "True":"False";
    data.AC1H_flag= (input.bytes[0] &0x04)? "True":"False";
    data.AC2L_flag= (input.bytes[0] &0x02)? "True":"False";
    data.AC2H_flag= (input.bytes[0] &0x01)? "True":"False";   
    data.AV1L_status= (input.bytes[1] &0x80)? "True":"False";
    data.AV1H_status= (input.bytes[1] &0x40)? "True":"False";
    data.AV2L_status= (input.bytes[1] &0x20)? "True":"False";
    data.AV2H_status= (input.bytes[1] &0x10)? "True":"False";   
    data.AC1L_status= (input.bytes[1] &0x08)? "True":"False";
    data.AC1H_status= (input.bytes[1] &0x04)? "True":"False";
    data.AC2L_status= (input.bytes[1] &0x02)? "True":"False";
    data.AC2H_status= (input.bytes[1] &0x01)? "True":"False";   
    data.DI2_status= (input.bytes[2] &0x08)? "True":"False";
    data.DI2_flag= (input.bytes[2] &0x04)? "True":"False";
    data.DI1_status= (input.bytes[2] &0x02)? "True":"False";
    data.DI1_flag= (input.bytes[2] &0x01)? "True":"False";   
  }

  if(input.bytes.length==11)
   {
 
   return {
      data:data,
     }
	 }
	break;
	case 5:
	  {
	    var decode = {};
		var freq_band;
		var sub_band;
		
		if(input.bytes[0]==0x01)
			freq_band="EU868";
		else if(input.bytes[0]==0x02)
			freq_band="US915";
		else if(input.bytes[0]==0x03)
			freq_band="IN865";
		else if(input.bytes[0]==0x04)
			freq_band="AU915";
		else if(input.bytes[0]==0x05)
			freq_band="KZ865";
		else if(input.bytes[0]==0x06)
			freq_band="RU864";
		else if(input.bytes[0]==0x07)
			freq_band="AS923";
		else if(input.bytes[0]==0x08)
			freq_band="AS923_1";
		else if(input.bytes[0]==0x09)
			freq_band="AS923_2";
		else if(input.bytes[0]==0x0A)
			freq_band="AS923_3";
		else if(input.bytes[0]==0x0F)
			freq_band="AS923_4";
		else if(input.bytes[0]==0x0B)
			freq_band="CN470";
		else if(input.bytes[0]==0x0C)
			freq_band="EU433";
		else if(input.bytes[0]==0x0D)
			freq_band="KR920";
		else if(input.bytes[0]==0x0E)
			freq_band="MA869";
		
		if(input.bytes[1]==0xff)
		  sub_band="NULL";
		  else
		  sub_band=input.bytes[1];

		  var firm_ver= (input.bytes[2]&0x0f)+'.'+(input.bytes[3]>>4&0x0f)+'.'+(input.bytes[3]&0x0f);
		  
		  var tdc_time= input.bytes[4]<<16 | input.bytes[5]<<8 | input.bytes[6];
		  
		  }
  default:
 return {
   errors: ["unknown FPort"]
 }
}
}