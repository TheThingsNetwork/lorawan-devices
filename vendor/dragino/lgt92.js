function decodeUplink(input) {
  var port = input.fPort;
var bytes = input.bytes;
var latitude=0;
var longitude = 0;
var data = {};
    switch (input.fPort) {
   case 2:

data.latitude=(bytes[0]<<24 | bytes[1]<<16 | bytes[2]<<8 | bytes[3])/1000000;//gps latitude,units: °
data.longitude=(bytes[4]<<24 | bytes[5]<<16 | bytes[6]<<8 | bytes[7])/1000000;//gps longitude,units: °

data.ALARM_status=(bytes[8] & 0x40)?"TRUE":"FALSE";//Alarm status  
data.BatV=(((bytes[8] & 0x3f) <<8) | bytes[9])/1000;//Battery,units:V  
if(bytes[10] & 0xC0==0x40)
{
  var MD="Move";
}
else if(bytes[10] & 0xC0 ==0x80)
{
  data.MD="Collide";
}
else if(bytes[10] & 0xC0 ==0xC0)
{
  data.MD="User";
}
else
{
  data.MD="Disable";
}                                            //mode of motion 
data.LON=(bytes[10] & 0x20)?"ON":"OFF";//LED status for position,uplink and downlink 
data.FW= 160+(bytes[10] & 0x1f);  // Firmware version; 5 bits   
data.Roll=(bytes[11]<<8 | bytes[12])/100;//roll,units: ° 
data.Pitch=(bytes[13]<<8 | bytes[14])/100; //pitch,units: ° 
var hdop = 0;
if(bytes[15] > 0)
{
   data.hdop =bytes[15]/100; //hdop,units: °
}
else
{
   data.hdop =bytes[15];
}
data.altitude =(bytes[16]<<8 | bytes[17]) / 100; //Altitude,units: °
return {
data:data,
};
  default:
  return {
    errors: ["unknown FPort"]
  }
}
}