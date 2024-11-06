function decodeUplink(input) {
  var data = {};
  data.sensorType = 'fillrate';

  if (input.bytes.length === 0) {
    data.valid = false;
    return data;
  }

  data.settingsAllowed = true;
  data.charging = false;
  data.battery = 2 + input.bytes[0] / 10;

  if (input.fPort === 1) {

    //Distance-only payload
    if (input.bytes.length === 3 || input.bytes.length === 7) {
      data.valid = true;
      data.distance = (input.bytes[1] << 8) | input.bytes[2];
      if (input.bytes.length == 7) {
        data.temperature = ((input.bytes[3] << 8) | input.bytes[4]) / 100;
        data.relativeHumidity = ((input.bytes[5] << 8) | input.bytes[6]) / 100;
      }
    }

    //Distance and status combined payload
    else if (input.bytes.length === 4 || input.bytes.length === 8) {
      data.valid = true;
      data.distance = (input.bytes[1] << 8) | input.bytes[2];
      var statusCode = input.bytes[3];
      if(statusCode != 0){
        if (statusCode === 4) {
          data.valid = true;
          data.distance = -1;
        } else  {
          data.valid = false;
          data.errorcode = statusCode;
        }
      }
      if (input.bytes.length === 8) {
        data.temperature = ((input.bytes[4] << 8) | input.bytes[5]) / 100;
        data.relativeHumidity = ((input.bytes[6] << 8) | input.bytes[7]) / 100;
      }
    } else {
      data.valid = false;
      data.errorcode = -1;
    }
  } else if (input.fPort === 2) {
    var code = input.bytes[1];
    if (code === 4) {
      data.valid = true;
      data.distance = -1;
    } else {
      data.valid = false;
      data.errorcode = input.bytes[1];
    }
  } else if (input.fPort === 3) {
    data.valid = false;
    data.charging = true;
  }

  return {
    data: data,
  };
}
