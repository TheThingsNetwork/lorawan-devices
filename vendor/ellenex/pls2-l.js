function decodeUplink(input) {
  switch (input.fPort) {
    case 1:
      // return error if length of Bytes is not 8
      if (input.bytes.length != 8) {
        return {
          errors: ['input bytes in wrong format'],
        };
      }
      var k = 0.019
      var m = 0.05
      var b = 0
      var d = 1   // Liquid density
      var level = (k * parseInt((input.bytes[3]).toString(16) + (input.bytes[4]).toString(16), 16) * m + b) / d
      return {
        // Decoded data
        data: {
          level: Math.round(level * 100, 2) / 100,
        },
      };
    default:
      return {
        errors: ['unknown FPort'],
      };
  }
}
