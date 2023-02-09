function decodeUplink(input) {
  var port = input.fPort;
  var bytes = input.bytes;
  var poll_message_status=(bytes[2]&0x40)>>6;
  var data = {};
  switch (input.fPort) {
    case 2:
    
  if(poll_message_status===0)
  {
  data.Ext= bytes[2]&0x0F;
  data.BatV= ((bytes[0]<<8 | bytes[1]) & 0x3FFF)/1000;
  
  if(data.Ext==0x01)
  {
    data.Temp_Channel1=parseFloat(((bytes[3]<<24>>16 | bytes[4])/100).toFixed(2));
    data.Temp_Channel2=parseFloat(((bytes[5]<<24>>16 | bytes[6])/100).toFixed(2));
  }
  else if(data.Ext==0x02)
  {
    data.Temp_Channel1=parseFloat(((bytes[3]<<24>>16 | bytes[4])/10).toFixed(1));
    data.Temp_Channel2=parseFloat(((bytes[5]<<24>>16 | bytes[6])/10).toFixed(1));
  }
  else if(data.Ext==0x03)
  {
    data.Res_Channel1=parseFloat(((bytes[3]<<8 | bytes[4])/100).toFixed(2));
    data.Res_Channel2=parseFloat(((bytes[5]<<8 | bytes[6])/100).toFixed(2));
  }
  
  data.Systimestamp=(bytes[7]<<24 | bytes[8]<<16 | bytes[9]<<8 | bytes[10] );
  }
  
  return {
        data:data,
       };
      default:
   return {
     errors: ["unknown FPort"]
   }
  }
  }
   
  
  
  