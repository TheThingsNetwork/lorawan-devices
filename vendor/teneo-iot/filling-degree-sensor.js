function decodeUplink(input) {
  var decoded = {};
  decoded.sensorType = 'fillrate';
  
  if (bytes.length === 0) 
  {
    decoded.valid = false;
    return decoded;
  }
  
  decoded.settingsAllowed = true;
  decoded.charging = false;
  decoded.battery = 2 + (bytes[0] / 10);
  
  if (port === 1)
  {
    if (bytes.length === 3)
    {
	  decoded.valid = true;
      decoded.distance = (bytes[1] << 8) | bytes[2];
    }
    else
    {
	  decoded.valid = false;
      decoded.errorcode = -1;
    }
  }
  else if (port === 2)
  {
	var code = bytes[1]
	if(code === 4)
	{
	  decoded.valid = true;
	  decoded.distance = -1;
	}
	else
	{
	  decoded.valid = false;
      decoded.errorcode = bytes[1];
	}
  }
  else if (port === 3)
  {
    decoded.valid = false;
    decoded.charging = true;
  }

  return decoded;
}