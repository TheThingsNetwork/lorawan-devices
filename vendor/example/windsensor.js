var directions = ['N', 'E', 'S', 'W'];
var colors = ['red', 'green'];

function decodeUplink(input) {
  switch (input.fPort) {
    case 1:
      return {
        // Decoded data
        data: {
          direction: directions[input.bytes[0]],
          speed: input.bytes[1],
        },
      };
    default:
      return {
        errors: ['unknown FPort'],
      };
  }
}

function encodeDownlink(input) {
  var i = colors.indexOf(input.data.led);
  if (i === -1) {
    return {
      errors: ['invalid LED color'],
    };
  }
  return {
    // LoRaWAN FPort used for the downlink message
    fPort: 2,
    // Encoded bytes
    bytes: [i],
  };
}

function decodeDownlink(input) {
  switch (input.fPort) {
    case 2:
      return {
        // Decoded downlink (must be symmetric with encodeDownlink)
        data: {
          led: colors[input.bytes[0]],
        },
      };
    default:
      return {
        errors: ['invalid FPort'],
      };
  }
}
