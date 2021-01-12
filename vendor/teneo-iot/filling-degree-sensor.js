function decodeUplink(input)
{
  var decoded = {};
  decoded.sensorType = 'fillrate';
  
  if (input.bytes.length === 0) 
  {
    decoded.valid = false;
    return decoded;
  }
  
  decoded.settingsAllowed = true;
  decoded.charging = false;
  decoded.battery = 2 + (bytes[0] / 10);
  
  if (input.port === 1)
  {
    if (input.bytes.length === 3)
    {
	  decoded.valid = true;
      decoded.distance = (input.bytes[1] << 8) | input.bytes[2];
    }
    else
    {
	  decoded.valid = false;
      decoded.errorcode = -1;
    }
  }
  else if (input.port === 2)
  {
	var code = input.bytes[1]
	if(code === 4)
	{
	  decoded.valid = true;
	  decoded.distance = -1;
	}
	else
	{
	  decoded.valid = false;
      decoded.errorcode = input.bytes[1];
	}
  }
  else if (input.port === 3)
  {
    decoded.valid = false;
    decoded.charging = true;
  }

  return decoded;
}