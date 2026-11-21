function decodeUplink(input) {
  var bytes = input.bytes;
  var port = input.fPort;
  var decode = {};

  switch (port) {
    case 2: {
      var len = bytes.length;
      var value = ((bytes[0] << 8) | bytes[1]) & 0x3fff;

      var distance = 0;
      if (len == 5) {
        value = (bytes[2] << 8) | bytes[3];
        distance = value;
        if (value < 20) distance = 'Invalid Reading';
      } else {
        distance = 'No Sensor';
      }

      decode.Node_type = 'LDDS20';
      decode.Bat = (((bytes[0] << 8) | bytes[1]) & 0x3fff) / 1000;
      decode.Distance = distance;
      decode.Interrupt_status = bytes[len - 1];
      return { data: decode };
    }

    default:
      return { errors: ['Unsupported fPort: ' + port] };
  }
}
