function decodeUplink(input) {
  var bytes = input.bytes;
  var len = bytes.length;
  var data = {};

  switch (input.fPort) {
    case 2: {
      data.Node_type = 'LDDS75';
      data.Bat = (((bytes[0] << 8) | bytes[1]) & 0x3fff) / 1000;

      if (len == 5) {
        var distance = (bytes[2] << 8) | bytes[3];
        data.Distance = distance;
        if (distance < 20) data.Distance = 'Invalid Reading';
      } else {
        data.Distance = 'No Sensor';
      }

      data.Interrupt_status = bytes[len - 1];

      return { data: data };
    }

    default:
      return { errors: ['unknown FPort'] };
  }
}
