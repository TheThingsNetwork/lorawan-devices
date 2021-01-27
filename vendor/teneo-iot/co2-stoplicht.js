function decodeUplink(input) {
  var data = {};
  var index = 0;
  data.battery = (input.bytes[index++] & 0x0f) / 10 + 2;

  if (input.fPort == 223) {
    if ((input.bytes[0] & 0xc0) == 0x80) {
      data.type = 'status';
      data.status = input.bytes[0] & ~0xc0;
    }

    return data;
  }

  if (input.fPort == 1) {
    data.co2 = ((input.bytes[2] << 24) | (input.bytes[3] << 16) | (input.bytes[4] << 8) | input.bytes[5]) / 100;

    var Tempx100 = (input.bytes[6] << 8) + input.bytes[7];

    if (Tempx100 == 32767) {
      data.temperature = 'no temp';
    } else {
      if (Tempx100 > 32767) {
        data.temperature = -(65536 - Tempx100) / 100;
      } else {
        data.temperature = Tempx100 / 100;
      }
    }

    data.relativeHumidity = ((input.bytes[8] << 8) | input.bytes[9]) / 100;
  }

  return {
    data: data,
  };
}
