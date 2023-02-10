function decodeUplink(input) {
  var t = input.bytes[2]*0xff+input.bytes[3]
  switch (input.fPort) {
    case 10:
      return {
        // Decoded data
        data: {
          leak: input.bytes[0] & 0x01 ,
          remote: (input.bytes[0] & 0x02)?1:0 ,
          battery: input.bytes[1],
          temperature: t
        },
      };
    case 16:
      return {
        // Decoded data
        data: {
          battery: input.bytes[1],
          temperature: t
        },
      };
    default:
      return {
        errors: ['unknown FPort'],
      };
  }
}
