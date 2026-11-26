function decodeUplink(input) {
  var bytes = input.bytes;
  var port = input.fPort;
  var decode = {};

  switch (port) {
    // Distance uplink
    case 2: {
      if (bytes.length != 7) {
        return { errors: ['Invalid Payload Length: ' + bytes.length] };
      }

      decode.Node_type = 'LMDS200';
      decode.Bat = ((bytes[0] << 8) | bytes[1]) / 1000; // V
      decode.dis1 = (bytes[2] << 8) | bytes[3]; // cm
      decode.dis2 = (bytes[4] << 8) | bytes[5]; // cm
      decode.DALARM_count = (bytes[6] >> 2) & 0x3f;
      decode.Distance_alarm = (bytes[6] >> 1) & 0x01;
      decode.Interrupt_alarm = bytes[6] & 0x01;
      return { data: decode };
    }

    // Alarm settings
    case 4: {
      if (bytes.length != 9) {
        return { errors: ['Invalid Payload Length: ' + bytes.length] };
      }

      decode.Node_type = 'LMDS200';
      decode.TDC = (bytes[0] << 16) | (bytes[1] << 8) | bytes[2]; // s
      decode.ATDC = bytes[3];
      decode.Alarm_min = (bytes[4] << 8) | bytes[5]; // cm
      decode.Alarm_max = (bytes[6] << 8) | bytes[7]; // cm
      decode.Interrupt = bytes[8];
      return { data: decode };
    }

    // Device information
    case 5: {
      if (bytes.length != 7) {
        return { errors: ['Invalid Payload Length: ' + bytes.length] };
      }

      if (bytes[0] == 0x0c) decode.SENSOR_MODEL = 'LMDS200';

      decode.Ver = parseInt(((bytes[1] << 8) | bytes[2]).toString(16), 10);

      if (bytes[3] == 0x01) decode.FREQUENCY_BAND = 'EU868';
      else if (bytes[3] == 0x02) decode.FREQUENCY_BAND = 'US915';
      else if (bytes[3] == 0x03) decode.FREQUENCY_BAND = 'IN865';
      else if (bytes[3] == 0x04) decode.FREQUENCY_BAND = 'AU915';
      else if (bytes[3] == 0x05) decode.FREQUENCY_BAND = 'KZ865';
      else if (bytes[3] == 0x06) decode.FREQUENCY_BAND = 'RU864';
      else if (bytes[3] == 0x07) decode.FREQUENCY_BAND = 'AS923';
      else if (bytes[3] == 0x08) decode.FREQUENCY_BAND = 'AS923_1';
      else if (bytes[3] == 0x09) decode.FREQUENCY_BAND = 'AS923_2';
      else if (bytes[3] == 0x0a) decode.FREQUENCY_BAND = 'AS923_3';
      else if (bytes[3] == 0x0b) decode.FREQUENCY_BAND = 'CN470';
      else if (bytes[3] == 0x0c) decode.FREQUENCY_BAND = 'EU433';
      else if (bytes[3] == 0x0d) decode.FREQUENCY_BAND = 'KR920';
      else if (bytes[3] == 0x0e) decode.FREQUENCY_BAND = 'MA869';
      else if (bytes[3] == 0x0f) decode.FREQUENCY_BAND = 'AS923_4';

      decode.Sub_band = bytes[4];
      decode.BAT = ((bytes[5] << 8) | bytes[6]) / 1000; // V
      return { data: decode };
    }

    default:
      return { errors: ['Unsupported fPort: ' + port] };
  }
}
