function decodeUplink(input) {
  var bytes = input.bytes;
  var port = input.fPort;
  var decode = {};

  switch (port) {
    // Uplink
    case 2: {
      if (bytes.length != 11) {
        return { errors: ['Invalid Payload Length: ' + bytes.length] };
      }

      var mode = (bytes[6] & 0x7c) >> 2;

      // A probe that the model does not have is sent as 0xFF 0xFF, which tells the
      // models apart and gives each slot its colour:
      //   D20  first slot = Red
      //   D22  first slot = White, second slot = Red
      //   D23  first slot = White, second slot = Red, third slot = Black
      var redPresent = !(bytes[7] == 0xff && bytes[8] == 0xff);
      var blackPresent = !(bytes[9] == 0xff && bytes[10] == 0xff);
      var firstColor = redPresent || blackPresent ? 'White' : 'Red';
      var model = 'LSN50v2-D23';
      if (!redPresent && !blackPresent) model = 'LSN50v2-D20';
      else if (!blackPresent) model = 'LSN50v2-D22';

      if (mode == 3) {
        decode.Work_mode = 'DS18B20';
        decode.Node_type = model;
        decode.BatV = ((bytes[0] << 8) | bytes[1]) / 1000; // V
        decode.ALARM_status = bytes[6] & 0x01 ? 'TRUE' : 'FALSE';

        if (bytes[2] == 0xff && bytes[3] == 0xff) decode['Temp_' + firstColor] = 'NULL';
        else decode['Temp_' + firstColor] = parseFloat(((((bytes[2] << 24) >> 16) | bytes[3]) / 10).toFixed(1)); // °C

        if (redPresent) decode.Temp_Red = parseFloat(((((bytes[7] << 24) >> 16) | bytes[8]) / 10).toFixed(1)); // °C
        if (blackPresent) decode.Temp_Black = parseFloat(((((bytes[9] << 24) >> 16) | bytes[10]) / 10).toFixed(1)); // °C
      } else if (mode == 31) {
        decode.Work_mode = 'ALARM';
        decode.Temp_Red_MIN = (bytes[4] << 24) >> 24; // °C
        decode.Temp_Red_MAX = (bytes[5] << 24) >> 24; // °C
        decode.Temp_White_MIN = (bytes[7] << 24) >> 24; // °C
        decode.Temp_White_MAX = (bytes[8] << 24) >> 24; // °C
        decode.Temp_Black_MIN = (bytes[9] << 24) >> 24; // °C
        decode.Temp_Black_MAX = (bytes[10] << 24) >> 24; // °C
      } else {
        return { errors: ['unknown data frame'] };
      }

      return { data: decode };
    }

    default:
      return { errors: ['Unsupported fPort: ' + port] };
  }
}
