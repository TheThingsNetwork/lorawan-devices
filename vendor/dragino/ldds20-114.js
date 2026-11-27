function decodeUplink(input) {
  var bytes = input.bytes;
  var port = input.fPort;
  var decode = {};

  switch (port) {
    case 2: {
      if (bytes.length == 8) {
        var value = ((bytes[0] << 8) | bytes[1]) & 0x3fff;

        decode.Node_type = 'LDDS20';
        decode.Bat = value / 1000;

        value = (bytes[2] << 8) | bytes[3];
        var distance = value;
        if (value < 20) distance = 'Invalid Reading';
        decode.Distance = distance;

        decode.Interrupt_flag = bytes[4];

        value = (bytes[5] << 8) | bytes[6];
        if (bytes[5] & 0x80) {
          value |= 0xffff0000;
        }
        decode.TempC_DS18B20 = (value / 10).toFixed(2);

        decode.Sensor_flag = bytes[7];
        return { data: decode };
      } else {
        return { errors: ['Invalid Payload Length: ' + bytes.length] };
      }
  }

    default:
      return { errors: ['Unsupported fPort: ' + port] };
  }
}
