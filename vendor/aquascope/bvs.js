function decodeUplink(input) {
  var t = input.bytes[2]*0xff+input.bytes[3]
  switch (input.fPort) {
    case 10:
      return {
        // Decoded data
        data: {
          leak: (input.bytes[0] & 0x01) ? "Y":"N",
          valve: (input.bytes[0] & 0x20) ? "On":"Off",
          temperature: t
        },
      };
    case 16:
      return {
        // Decoded data
        data: {
          valve: (input.bytes[0] & 0x20) ? "On":"Off",
          temperature: t
        },
      };
    default:
      return {
        errors: ['unknown FPort'],
      };
  }
}

function encodeDownlink(input) {
  if (input.data.valve == "On") r = 255; else r = 0;
  return {
    // LoRaWAN FPort used for the downlink message
    fPort: 10,
    // Encoded bytes
    bytes: [2,r],
  };
}

function decodeDownlink(input) {
  switch (input.fPort) {
    case 10:
      if (input.bytes[0] == 2)
        return {
          data: {
            valve: input.bytes[1]?"On":"Off",
          },
        };
    default:
      return {
        errors: ['invalid FPort'],
      };
  }
}
