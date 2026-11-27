function decodeUplink(input) {
  var bytes = input.bytes;
  var port = input.fPort;
  var decode = {};

  switch (port) {
    // Normal uplink
    case 2: {
      if (bytes[10] != 0x01) {
        return { errors: ['unknown data frame'] };
      }
      var value = ((bytes[0] << 8) | bytes[1]) & 0x3fff;
      decode.BatV = value / 1000;
      decode.EXTI_Trigger = bytes[0] & 0x80 ? 'TRUE' : 'FALSE';
      decode.distance1_cm = ((bytes[2] << 8) | bytes[3]) / 10;
      decode.distance2_cm = ((bytes[4] << 8) | bytes[5]) / 10;
      decode.distance3_cm = ((bytes[6] << 8) | bytes[7]) / 10;
      decode.distance4_cm = ((bytes[8] << 8) | bytes[9]) / 10;
      decode.Node_type = 'LDDS04';
      return { data: decode };
    }

    // Configure info reply, answered to a 26 01 downlink
    case 5: {
      if (bytes[10] != 0x02) {
        return { errors: ['unknown data frame'] };
      }
      var freq_band;
      if (bytes[1] == 0x01) freq_band = 'EU868';
      else if (bytes[1] == 0x02) freq_band = 'US915';
      else if (bytes[1] == 0x03) freq_band = 'IN865';
      else if (bytes[1] == 0x04) freq_band = 'AU915';
      else if (bytes[1] == 0x05) freq_band = 'KZ865';
      else if (bytes[1] == 0x06) freq_band = 'RU864';
      else if (bytes[1] == 0x07) freq_band = 'AS923';
      else if (bytes[1] == 0x08) freq_band = 'AS923_1';
      else if (bytes[1] == 0x09) freq_band = 'AS923_2';
      else if (bytes[1] == 0x0a) freq_band = 'AS923_3';
      else if (bytes[1] == 0x0b) freq_band = 'CN470';
      else if (bytes[1] == 0x0c) freq_band = 'EU433';
      else if (bytes[1] == 0x0d) freq_band = 'KR920';
      else if (bytes[1] == 0x0e) freq_band = 'MA869';
      else if (bytes[1] == 0x0f) freq_band = 'AS923_4';
      else freq_band = 'NULL';

      decode.Software_Type = bytes[0];
      decode.FREQUENCY_BAND = freq_band;
      decode.SUB_BAND = bytes[2];
      decode.FIRMWARE_VERSION = (bytes[3] & 0x0f) + '.' + ((bytes[4] >> 4) & 0x0f) + '.' + (bytes[4] & 0x0f);
      decode.SENSOR_TYPE = bytes[5];
      decode.Node_type = 'LDDS04';
      return { data: decode };
    }

    default:
      return { errors: ['Unsupported fPort: ' + port] };
  }
}
