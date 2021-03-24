function decodeUplink(input) {
  var data = {};
  switch (input.fPort) {
    case 2:
      data.light = input.bytes[0];
      data.temperature = input.bytes[3] & 0x80 ? input.bytes[3] - 0x100 : input.bytes[3];
      return {
        data: data
      }
    default:
      return {
        errors: ['unknown FPort'],
      };
  }
}

function encodeDownlink(input) {
  return {
    bytes: [input.data.led],
    fPort: 2,
  };
}

function decodeDownlink(input) {
  switch (input.fPort) {
    case 2:
      return {
        data: {
          led: input.bytes[0],
        },
      };
    default:
      return {
        errors: ['invalid FPort'],
      };
  }
}
