function decodeUplink(input) {
  var bytes = input.bytes;

  // Check if the payload is empty by verifying if all elements in 'bytes' are 0 or if 'bytes' is empty
  var isEmptyPayload = bytes.length === 0 || bytes.every(element => element === 0);
  if (isEmptyPayload) {
      return {}; // Return an empty object if the payload is empty
  }

  switch (input.fPort) {
    case 103:
      return {
        data: {
          status: (bytes[0] >> 3),
          battery: (25 + (bytes[1] & 0x0f)) / 10,
          temperature: (bytes[2] & 0x7f) - 32,
          humidity: bytes[3] & 0x7f
        }
    };
  default:
    return {
      errors: ['unknown FPort'],
    };
  }
}
