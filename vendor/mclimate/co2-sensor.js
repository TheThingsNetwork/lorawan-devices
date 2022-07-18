function decodeUplink(input) {
  var bytes = input.bytes;
  var hexData = bytes.map(function (byte) {
    var num = byte.toString(16);
    if (num.length < 2) {
      num = '0' + num;
    }
    return num;
  });
  hexData = String(hexData).split(',').join('');

  var co2 = parseInt(hexData.substr(2, 4), 16);
  var temperature = (parseInt(hexData.substr(6, 4), 16) - 400) / 10;
  var humidity = Number(((parseInt(hexData.substr(10, 2), 16) * 100) / 256).toFixed(2));
  var battery = Number(((parseInt(hexData.substr(12, 2), 16) * 8 + 1600) / 1000).toFixed(2));

  return {
    data: {
      co2: co2,
      temperature: temperature,
      humidity: humidity,
      battery: battery,
    },
  };
}
