function decodeUplink(input) {
  var port = input.fPort;
  var bytes = input.bytes;
  var value;
  var data = {};

  switch (port) {
    case 2:
      var mod = (bytes[10] >> 7) & 0x01;

      data.BatV = (((bytes[0] << 8) | bytes[1]) & 0x3fff) / 1000;

      value = (bytes[2] << 8) | bytes[3];
      if (bytes[2] & 0x80) {
        value |= 0xffff0000;
      }
      data.temp_DS18B20 = (value / 10).toFixed(2);

      if (mod === 0) {
        value = (bytes[6] << 8) | bytes[7];
        if ((value & 0x8000) >> 15 === 0) data.temp_SOIL = (value / 100).toFixed(2);
        else if ((value & 0x8000) >> 15 === 1) data.temp_SOIL = ((value - 0xffff) / 100).toFixed(2);
        data.water_SOIL = (((bytes[4] << 8) | bytes[5]) / 100).toFixed(2);
        data.conduct_SOIL = (bytes[8] << 8) | bytes[9];
      } else {
        data.Soil_dielectric_constant = (((bytes[4] << 8) | bytes[5]) / 10).toFixed(1);
        data.Raw_water_SOIL = (bytes[6] << 8) | bytes[7];
        data.Raw_conduct_SOIL = (bytes[8] << 8) | bytes[9];
      }

      data.s_flag = (bytes[10] >> 4) & 0x01;
      data.i_flag = bytes[10] & 0x0f;
      data.Mod = mod;
      data.Node_type = 'LSE01';

      return {
        data: data,
      };
    default:
      return {
        errors: ['unknown FPort'],
      };
  }
}
