function decodeUplink(input) {
    var bytes = input.bytes;

    switch (input.fPort) {
      case 100:
        return {
          data: {
            status: bytes[0] & 0x01,
            battery: (25 + (bytes[1] & 0x0f)) / 10,
            temperatureBoard: (bytes[2] & 0x7f) - 32,
            time: (bytes[4] << 8) | bytes[3],
            count: ((bytes[7] << 16) | (bytes[6] << 8)) | bytes[5]
          }
      };
    default:
      return {
        errors: ['unknown FPort'],
      };
    }
  }
