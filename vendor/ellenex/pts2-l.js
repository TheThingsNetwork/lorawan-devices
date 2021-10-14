function decodeUplink(input) {
  switch (input.fPort) {
    case 1:
      // return error if length of Bytes is not 8
      if (input.bytes.length != 8) {
        return {
          errors: ['input bytes in wrong format'],
        };
      }
      var tmp = ('00'+(input.bytes[3]).toString(16)).slice(-2) + ('00'+(input.bytes[4]).toString(16)).slice(-2);
      var pReading = 0;
      // process negative pressure
      if (input.bytes[3] === 0xFF) {
        // fill in the first 16 bits with 1's to perform bitwise operation
        pReading = - ~(parseInt('FFFF' + tmp.toString(16) , 16) - 1);
      } else {
        pReading = parseInt(tmp, 16);
      }
      // K * Pressure * m + b
      // K = 0.01907, m = 0.05, b = 0
      // separate calibration sheet will specify K, m and b
      var pressure = 0.01907 * pReading * 0.05 + 0;
      var battery = parseInt(input.bytes[7].toString(16), 16) * 0.1;
      return {
        // Decoded data
        data: {
          pressure: Math.round(pressure * 100, 2) / 100,
          batteryVoltage: Math.round(battery * 10, 1) / 10,
        },
      };
    default:
      return {
        errors: ['unknown FPort'],
      };
  }
}
