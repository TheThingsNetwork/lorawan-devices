function decodeUplink(input) {
  var data = {};
  data.batt_volt = input.bytes[0] / 10;
  data.temperature = ((input.bytes[1] << 8) + input.bytes[2] - 500) / 10;
  data.humidity = ((input.bytes[3] << 8) + input.bytes[4]) / 10;

  return {
    data: data,
  };
}
