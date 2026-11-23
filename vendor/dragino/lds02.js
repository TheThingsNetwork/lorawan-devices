function decodeUplink(input) {
  var bytes = input.bytes;
  var port = input.fPort;
  var decode = {};

  switch (port) {
    case 10: {
      if (bytes.length != 10) {
        return { errors: ['Invalid Payload Length: ' + bytes.length] };
      }

      var value = ((bytes[0] << 8) | bytes[1]) & 0x3fff;

      decode.Node_type = 'LDS02';
      decode.BAT_V = value / 1000; // V

      var door_open_status = bytes[0] & 0x80 ? 1 : 0; // 1: open, 0: close
      var water_leak_status = bytes[0] & 0x40 ? 1 : 0;

      var mod = bytes[2];
      var alarm = bytes[9] & 0x01;
      decode.MOD = mod;

      if (mod == 1) {
        decode.DOOR_OPEN_STATUS = door_open_status;
        decode.DOOR_OPEN_TIMES = (bytes[3] << 16) | (bytes[4] << 8) | bytes[5];
        decode.LAST_DOOR_OPEN_DURATION = (bytes[6] << 16) | (bytes[7] << 8) | bytes[8]; // min
        decode.ALARM = alarm;
      } else if (mod == 2) {
        decode.WATER_LEAK_STATUS = water_leak_status;
        decode.WATER_LEAK_TIMES = (bytes[3] << 16) | (bytes[4] << 8) | bytes[5];
        decode.LAST_WATER_LEAK_DURATION = (bytes[6] << 16) | (bytes[7] << 8) | bytes[8]; // min
        decode.ALARM = alarm;
      } else if (mod == 3) {
        decode.DOOR_OPEN_STATUS = door_open_status;
        decode.WATER_LEAK_STATUS = water_leak_status;
        decode.ALARM = alarm;
      }

      return { data: decode };
    }

    default:
      return { errors: ['Unsupported fPort: ' + port] };
  }
}
