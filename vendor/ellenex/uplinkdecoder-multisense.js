function decodeUplink(input) {
    switch (input.fPort) {
      case 15:
        // return error if length of Bytes is not 8
        if (input.bytes.length != 8) {
          return {
            errors: ['Invalid uplink payload: length is not 8 byte'],
          };
        }
        let primarySense = readHex2bytes(input.bytes[3], input.bytes[4]);
        let secondarySense = readHex2bytes(input.bytes[5], input.bytes[6]);
        let batteryVoltage = input.bytes[7] * 0.1;
        return {
          // Decoded data
          data: {
            sensorReading: primarySense,
            temperatureReading: secondarySense,
            batteryVoltage: +batteryVoltage.toFixed(1),
          },
        };
      default:
        return {
          errors: ['Unknown FPort: please use fPort 1'],
        };
    }
  }
  
  /*
   * The readHex2bytes function is to decode a signed 16-bit integer
   * represented by 2 bytes.  
   */
  function readHex2bytes(byte1, byte2) {
    let result = (byte1 << 8) | byte2;  // merge the two bytes
    // check whether input is signed as a negative number
    // by checking whether significant bit (leftmost) is 1
    let negative = byte1 & 0x80;
    // process negative value
    if (negative) {
      //result = ~(0xFFFF0000 | (result - 1)) * (-1);  // minus 1 and flip all bits
      result = result - 0x10000;
    }
    return result;
  }