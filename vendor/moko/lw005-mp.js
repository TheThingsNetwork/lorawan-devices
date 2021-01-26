function decodeUplink(input)
{
  var port = input.fPort;
  var bytes = input.bytes;
  var decoded = {};
  var fourStr = bytes.join("");
  if (port === 1)
  {
      decoded.mac = fourStr.substring(4,8);
      decoded.voltage = (bytes[4]*256 + bytes[5]) /10 ;
      decoded.energy = ( bytes[14] * 65536 ) + ( bytes[15] * 256 ) + bytes[16];
      decoded.lorastatus = bytes[16] % 2 ;
      decoded.overloadstatus = ((bytes[16] % 4) - ( bytes[16] % 2 )) / 2;
      decoded.switchstatus =((bytes[16] % 8) - (bytes[16] % 4)) / 4;
  } 
  else
  {
    return {
      errors: ['unknown FPort'],
    };
  }

  return {
    data: decoded,
  };
}
