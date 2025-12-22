function decodeUplink(input) {
  var data = {};
  data.batt_volt = input.bytes[0] / 10;
  data.temperature = ((input.bytes[1] << 8) + input.bytes[2] - 500) / 10;
  data.humidity = ((input.bytes[3] << 8) + input.bytes[4]) / 10;
  data.button = input.bytes[5];

  return {
    data: data,
  };
}

function normalizeUplink(input) {
  return {
    data: {
      air: {
          temperature: input.data.temperature,
          relativeHumidity: input.data.humidity,
      },
      battery: input.data.batt_volt,
    },
  };
}
