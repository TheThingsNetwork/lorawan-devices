function decodeUplink(input) {
    var bytes = input.bytes;

    switch (input.fPort) {
      case 127:
        return {
          data: {
            status: bytes[0] & 0x01,
            button: (bytes[0] >> 1) & 0x01,
            co2threshold: (bytes[0] >> 4) & 0x01,
            co2calibration: (bytes[0] >> 5) & 0x01,
            battery: (21 + (bytes[1] & 0x0f)) / 10,
            temperature: ((bytes[3] << 8) | bytes[2])/10,
            humidity: bytes[4],
            co2_ppm: (bytes[6] << 8) | bytes[5],
          }
      };
    default:
      return {
        errors: ['unknown FPort'],
      };
    }
  }
