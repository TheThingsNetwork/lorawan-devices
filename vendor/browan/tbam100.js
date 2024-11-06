function decodeUplink(input) {
  var bytes = input.bytes;

  // Check if the payload is empty by verifying if all elements in 'bytes' are 0 or if 'bytes' is empty
  var isEmptyPayload = bytes.length === 0 || bytes.every(element => element === 0);

  if (isEmptyPayload) {
      return {}; // Return an empty object if the payload is empty
  }

  switch (input.fPort) {
    case 104:
      return {
        data: {
          darker: bytes[0] & 0x01,
          lighter: (bytes[0] >> 1) & 0x01,
          statusChange: (bytes[0] >> 4) & 0x01,
          keepAlive: (bytes[0] >> 5) & 0x01,
          battery: (25 + (bytes[1] & 0x0f)) / 10,
          temperatureBoard: (bytes[2] & 0x7f) - 32,
          lux: (((bytes[5] << 16) | (bytes[4] << 8)) | bytes[3]) / 100
        }
      };
    default:
      return {
        errors: ['unknown FPort'],
      };
  }
}

