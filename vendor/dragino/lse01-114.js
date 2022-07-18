function decodeUplink(input) {
  var port = input.fPort;
  var bytes = input.bytes;
  var value = ((bytes[0] << 8) | bytes[1]) & 0x3fff;
  var batV = value / 1000;
  var data = {};
  switch (input.fPort) {
    case 2:
      data.Bat = batV;
      value = (bytes[2] << 8) | bytes[3];
      if (bytes[2] & 0x80) {
        value |= 0xffff0000;
      }
      data.TempC_DS18B20 = (value / 10).toFixed(2); //DS18B20,temperature

      value = (bytes[4] << 8) | bytes[5];
      data.water_SOIL = (value / 100).toFixed(2); //water_SOIL,Humidity,units:%

      value = (bytes[6] << 8) | bytes[7];

      if ((value & 0x8000) >> 15 === 0) data.temp_SOIL = (value / 100).toFixed(2); //temp_SOIL,temperature
      else if ((value & 0x8000) >> 15 === 1) data.temp_SOIL = ((value - 0xffff) / 100).toFixed(2);

      value = (bytes[8] << 8) | bytes[9];
      data.conduct_SOIL = value; //conduct_SOIL,conductivity,units:uS/cm,max:65535	uS/cm

      data.Sensor_flag = bytes[10] >> 4;
      data.Interrupt_flag = bytes[10] & 0x0f;
      data.Hardware_flag = (bytes[10] >> 2) & 0x01;
      return {
        data: data,
      };
    default:
      return {
        errors: ['unknown FPort'],
      };
  }
}
