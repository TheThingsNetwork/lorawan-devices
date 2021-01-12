function decodeUplink(input)
{
  var data = {};
  data.sensorType = 'fillrate';
  
  if (input.bytes.length === 0) 
  {
    data.valid = false;
    return data;
  }
  
  data.settingsAllowed = true;
  data.charging = false;
  data.battery = 2 + (input.bytes[0] / 10);
  
  if (input.port === 1)
  {
    if (input.bytes.length === 3)
    {
	  data.valid = true;
      data.distance = (input.bytes[1] << 8) | input.bytes[2];
    }
    else
    {
	  data.valid = false;
      data.errorcode = -1;
    }
  }
  else if (input.port === 2)
  {
	var code = input.bytes[1]
	if(code === 4)
	{
	  data.valid = true;
	  data.distance = -1;
	}
	else
	{
	  data.valid = false;
      data.errorcode = input.bytes[1];
	}
  }
  else if (input.port === 3)
  {
    data.valid = false;
    data.charging = true;
  }
  
  return {
    data: data,
  };
}