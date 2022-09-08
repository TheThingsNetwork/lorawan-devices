function decodeUplink(input) {
  var decoded = {};
    
  if( input.fPort == 2 )
  {
    decoded.type = "position";
    
    decoded.latitudeDeg = input.bytes[3] + input.bytes[2] * 256 + input.bytes[1] * 65536 + input.bytes[0] * 16777216; 
    if (decoded.latitudeDeg >= 0x80000000) // 2^31 
      decoded.latitudeDeg -= 0x100000000; // 2^32 
    decoded.latitudeDeg /= 1e6; 
    
    decoded.longitudeDeg = input.bytes[7] + input.bytes[6] * 256 + input.bytes[5] * 65536 + input.bytes[4] * 16777216; 
    if (decoded.longitudeDeg >= 0x80000000) // 2^31 
      decoded.longitudeDeg -= 0x100000000; // 2^32 
    decoded.longitudeDeg /= 1e6; 
    
    decoded.inTrip = ((input.bytes[8] & 0x80) !== 0) ? true : false;
    decoded.fixFailed = ((input.bytes[8] & 0x40) !== 0) ? true : false; 
    decoded.batV = ((input.bytes[8] & 0x3F) + 20) / 10; // 6 bits, range 0V to 6V 

    decoded.direction = (input.bytes[9] * 360/255); // 8 bits, range 0 to (360-360/255) degrees
    
    decoded.temperature = input.bytes[10];
    if (decoded.temperature > 127) // negative
      decoded.temperature -= 128;
    decoded.temperature = decoded.temperature / 2;
  }
  else if(input.fPort == 3)
  {
    decoded.LoRaWANVersion = input.bytes[0].toString(16) + "." + input.bytes[1].toString(16) + "." + input.bytes[2].toString(16) + "." + input.bytes[3].toString(16);
    decoded.FirmwareVersion = input.bytes[4].toString(16) + "." + input.bytes[5].toString(16) + "." + input.bytes[6].toString(16) + "." + input.bytes[7].toString(16);
  }
  else if (input.fPort == 4)
  {
    decoded.ShortSleepTime = input.bytes[3] + input.bytes[2] * 256 + input.bytes[1] * 65536 + input.bytes[0] * 16777216;
    decoded.LongSleepTime = input.bytes[7] + input.bytes[6] * 256 + input.bytes[5] * 65536 + input.bytes[4] * 16777216;
  }
  else if (input.fPort == 5)
  {
    decoded.gpsTimeoutSec = input.bytes[3] + input.bytes[2] * 256 + input.bytes[1] * 65536 + input.bytes[0] * 16777216;
    decoded.accelSensitivity = input.bytes[4];
  }
  return {
    data: decoded
  }
}