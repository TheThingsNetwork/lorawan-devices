function decodeUplink(input) {
    var bytes = input.bytes;

     //Check if temperature Board byte is present
     if((byte[2] & 0x7f) === 0) {
      return {} //Return empty object 
    }

    switch (input.fPort) {
      case 147:
        return {
          data: {
            status: bytes[0] & 0x01,
            battery: (25 + (bytes[1] & 0x0f)) / 10,
            temperatureBoard: (bytes[2] & 0x7f) - 32,
          }
      };
    default:
      return {
        errors: ['unknown FPort'],
      };
    }
  }
