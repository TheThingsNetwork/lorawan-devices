function decodeUplink(input) {
    var bytes = input.bytes;

     // Check if the payload is empty by verifying if all elements in 'bytes' are 0 or if 'bytes' is empty
  var isEmptyPayload = bytes.length === 0 || bytes.every(element => element === 0);
  if (isEmptyPayload) {
      return {}; // Return an empty object if the payload is empty
  }

    switch (input.fPort) {
      case 106:
        return {
          data: {
            status: bytes[0] & 0x01,
            temperatureChanged: (bytes[0] >> 5) & 0x01,
            humidityChanged: (bytes[0] >> 6) & 0x01,
            battery: (25 + (bytes[1] & 0x0f)) / 10,
            temperatureBoard: (bytes[2] & 0x7f) - 32,
            humidity: bytes[3],
            temperature: (bytes[4] & 0x7f) - 32
          }
      };
    default:
      return {
        errors: ['unknown FPort'],
      };
    }
  }
