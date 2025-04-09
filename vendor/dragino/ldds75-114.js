function decodeUplink(input) {
  var data = {};
  var len = input.bytes.length;
  var value = ((input.bytes[0] << 8) | input.bytes[1]) & 0x3fff;
  switch (input.fPort) {
    case 2:
      data.Bat = value / 1000;
      value = (input.bytes[2] << 8) | input.bytes[3];
      data.Distance = value + ' mm';
      if (value === 0) data.Distance = 'No Sensor';
      else if (value === 20) data.Distance = 'Invalid Reading';
      data.Interrupt_flag = input.bytes[4];

      value = (input.bytes[5] << 8) | input.bytes[6];
      if (input.bytes[5] & 0x80) {
        value |= 0xffff0000;
      }
      data.TempC_DS18B20 = (value / 10).toFixed(2); //DS18B20,temperature
      data.Sensor_flag = input.bytes[7];
      return {
        data: data,
      };
    default:
      return {
        errors: ['unknown FPort'],
      };
  }
}
