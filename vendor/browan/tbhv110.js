function decodeUplink(input) {
  var bytes = input.bytes;

  switch (input.fPort) {
    case 103:
      return {
        data: {
          status: bytes[0] & 0x01,
          tempHumidChanged: (bytes[0] >> 4) & 0x01,
          iaqChanged: (bytes[0] >> 5) & 0x01,
          battery: (25 + (bytes[1] & 0x0f)) / 10,
          temperatureBoard: (bytes[2] & 0x7f) - 32,
          humidity: bytes[3] & 0x7f,
          eco2: (bytes[5] << 8) | bytes[4],
          voc: (bytes[7] << 8) | bytes[6],
          iaq: (bytes[9] << 8) | bytes[8],
          temperature: (bytes[10] & 0x7f) -32
        }
    };
  default:
    return {
      errors: ['unknown FPort'],
    };
  }
}
