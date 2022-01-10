function decodeUplink(input) {
  switch (input.fPort) {
    case 1:
      // return error if length of Bytes is not 8
      if (input.bytes.length != 8) {
        return {
          errors: ['input bytes in wrong format'],
        };
      }
      let pressure = integerParser(input.bytes[3], input.bytes[4]);
      // (K * Pressure * m + b) / Liquid density
      // k = 0.019, m = 0.05, b = 0, liquid density = 1
      // separate calibration sheet will specify K, m and b
      let k = 0.019, m = 0.05, b = 0, density = 1;
      let level = (k * pressure * m + b) / density;
      let battery = input.bytes[7] * 0.1;
      return {
        // Decoded data
        data: {
          level: Math.round(level * 100, 2) / 100,
          batteryVoltage: Math.round(battery * 10, 1) / 10,
        },
      };
    default:
      return {
        errors: ['unknown FPort'],
      };
  }
}

/*
 * This function is to process a 16-bit integer signed by the leftmost bit
 * represented by 2 bytes. 
 */
function integerParser(byte1, byte2) {
  // check whether the byte is signed as a negative number
  // by checking whether the significant bit (leftmost) is 1
  let negative = byte1 & (1 << 7);
  // merge the two bytes
  let result = (byte1 << 8) | byte2;
  // process negative integer
  if (negative) {
    // minus 1 and flip the bits
    result = ~(0xFFFF0000 | (result - 1)) * (-1);
  }
  return result;
}