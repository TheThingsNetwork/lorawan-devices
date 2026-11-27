function decodeUplink(input) {
  var bytes = input.bytes;
  var port = input.fPort;
  var decode = {};

  switch (port) {
    case 2: {
      decode.Node_type = 'LDDS45';

      var value = ((bytes[0] << 8) | bytes[1]) & 0x3fff;
      decode.Bat = value / 1000; // V

      value = (bytes[2] << 8) | bytes[3];
      if (value < 30) decode.Distance = 'Invalid Reading';
      else decode.Distance = value; // mm

      decode.Interrupt_flag = bytes[4];

      value = (bytes[5] << 8) | bytes[6];
      if (bytes[5] & 0x80) {
        value |= 0xffff0000;
      }
      decode.TempC_DS18B20 = (value / 10).toFixed(2); // °C

      decode.Sensor_flag = bytes[7];
      return { data: decode };
    }

    default:
      return { errors: ['Unsupported fPort: ' + port] };
  }
}
