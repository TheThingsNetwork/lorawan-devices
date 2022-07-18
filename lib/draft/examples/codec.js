function decodeUplink(input) {
  switch (input.fPort) {
    case 1:
      return {
        data: {
          temperature: (input.bytes[0] << 8) | input.bytes[1],
        },
      };
    default:
      return {
        errors: ["Invalid FPort"],
      };
  }
}
