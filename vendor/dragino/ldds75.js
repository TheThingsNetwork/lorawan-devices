function Decoder(bytes, port) {
  // Decode an uplink message from a buffer
  // (array) of bytes to an object of fields.
  var len=bytes.length;
  var value=(bytes[0]<<8 | bytes[1]) & 0x3FFF;
  var batV=value/1000;//Battery,units:V
  
  var distance = 0;
  if(len==5)  
  {
   value=bytes[2]<<8 | bytes[3];
   distance=(value);//distance,units:mm
   if(value<20)
    distance = "Invalid Reading";
  }
  else
   distance = "No Sensor";
   
  var interrupt = bytes[len-1]; 
  return {
       Bat:batV ,
       Distance:distance,
       Interrupt_status:interrupt
  };
}