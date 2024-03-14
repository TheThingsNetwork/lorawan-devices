function Decoder(bytes, port) {
var poll_message_status=(bytes[6]&0x40)>>6;
var decode = {};
switch (poll_message_status) {  
case 0: 
{ 
  decode.BatV= ((bytes[0]<<8 | bytes[1]) & 0x3FFF)/1000;
  decode.TempC_SHT=parseFloat(((bytes[2]<<24>>16 | bytes[3])/100).toFixed(2));
  decode.Hum_SHT=parseFloat((((bytes[4]<<8 | bytes[5])&0xFFF)/10).toFixed(1));
  decode.EXT_TempC_SHT=parseFloat(((bytes[7]<<24>>16 | bytes[8])/100).toFixed(2));
  decode.EXT_Hum_SHT=parseFloat((((bytes[9]<<8 | bytes[10])&0xFFF)/10).toFixed(1));
}
  if(bytes.length==11)
  {
    return decode;
  }
break;

default:
    return {
      errors: ["unknown"]
    }
}
}