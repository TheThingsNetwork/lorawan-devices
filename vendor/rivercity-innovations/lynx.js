function decodeUplink(input) {
  var decoded = {};
  var errors = [];
    
  if( input.fPort == 2 )
  {
    decoded.type = "position";
    
    decoded.latitudeDeg = bytes[3] + bytes[2] * 256 + bytes[1] * 65536 + bytes[0] * 16777216; 
    if (decoded.latitudeDeg >= 0x80000000) // 2^31 
      decoded.latitudeDeg -= 0x100000000; // 2^32 
    decoded.latitudeDeg /= 1e6; 
    
    decoded.longitudeDeg = bytes[7] + bytes[6] * 256 + bytes[5] * 65536 + bytes[4] * 16777216; 
    if (decoded.longitudeDeg >= 0x80000000) // 2^31 
      decoded.longitudeDeg -= 0x100000000; // 2^32 
    decoded.longitudeDeg /= 1e6; 
    
    decoded.inTrip = ((bytes[8] & 0x80) !== 0) ? true : false;
    decoded.fixFailed = ((bytes[8] & 0x40) !== 0) ? true : false; 
    decoded.batV = ((bytes[8] & 0x3F) + 20) / 10; // 6 bits, range 0V to 6V 
    
    // decoded.speedKmph = (bytes[9] * 160 / 256); // 8 bits, range 0 to 160 km/h
    decoded.direction = (bytes[9] * 360/255); // 8 bits, range 0 to (360-360/255) degrees
    
    decoded.temperature = bytes[10];
    if (decoded.temperature > 127) // negative
      decoded.temperature -= 128;
    decoded.temperature = decoded.temperature / 2;
  }
  else if(input.fPort == 3)
  {
    decoded.LoRaWANVersion = bytes[0].toString(16) + "." + bytes[1].toString(16) + "." + bytes[2].toString(16) + "." + bytes[3].toString(16);
    decoded.FirmwareVersion = bytes[4].toString(16) + "." + bytes[5].toString(16) + "." + bytes[6].toString(16) + "." + bytes[7].toString(16);
  }
  else if (input.fPort == 4)
  {
    decoded.ShortSleepTime = bytes[3] + bytes[2] * 256 + bytes[1] * 65536 + bytes[0] * 16777216;
    decoded.LongSleepTime = bytes[7] + bytes[6] * 256 + bytes[5] * 65536 + bytes[4] * 16777216;
  }
  else if (input.fPort == 5)
  {
    decoded.gpsTimeoutSec = bytes[3] + bytes[2] * 256 + bytes[1] * 65536 + bytes[0] * 16777216;
    decoded.accelSensitivity = bytes[4];
  }
  return {
    data: decoded
  }
}