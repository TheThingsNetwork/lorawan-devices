function decodeUplink(input) {
  switch (input.fPort) {
    case 1:
      var k = 0.01907
      var m = 0.05
      var b = 0
      var pressure = k * parseInt((input.bytes[3]).toString(16) + (input.bytes[4]).toString(16), 16) * m + b
      var battery = parseInt(input.bytes[7].toString(16), 16) * 0.1
      return {
        // Decoded data
        data: {
          pressure: Math.round(pressure * 100, 2) / 100,
          batteryVoltage: Math.round(battery * 10, 1)/ 10,
        },
      };
    default:
      return {
        errors: ['unknown FPort'],
      };
  }
}
