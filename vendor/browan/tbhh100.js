function decodeUplink(input) {
  var bytes = input.bytes;

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
