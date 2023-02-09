function decodeUplink(input) {
  var data = {};
  var len=input.bytes.length;
  var value=(input.bytes[0]<<8 | input.bytes[1]) & 0x3FFF;
  var batV=value/1000;//Battery,units:V
  var distance = 0;
  var interrupt = input.bytes[len-1]; 
  switch (input.fPort) {
    case 2:
  if(len==5)  
  {
   data.value=input.bytes[2]<<8 | input.bytes[3];
   data.distance=(value);//distance,units:mm
   if(value<20)
    data.distance = "Invalid Reading";
  }
  else
   data.distance = "No Sensor";
  return {
       data:data,
  };

default:
    return {
      errors: ["unknown FPort"]
    }
}
}