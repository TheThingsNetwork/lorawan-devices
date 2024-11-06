function decodeUplink(input) {
    var bytes = input.bytes;

    // Check if the payload is empty by verifying if all elements in 'bytes' are 0 or if 'bytes' is empty
  var isEmptyPayload = bytes.length === 0 || bytes.every(element => element === 0);
  if (isEmptyPayload) {
      return {}; // Return an empty object if the payload is empty
  }

    switch (input.fPort) {
      case 100:
        return {
          data: {
            status: bytes[0] & 0x01,
            battery: (25 + (bytes[1] & 0x0f)) / 10,
            temperatureBoard: (bytes[2] & 0x7f) - 32,
            time: (bytes[4] << 8) | bytes[3],
            count: ((bytes[7] << 16) | (bytes[6] << 8)) | bytes[5]
          }
      };
    default:
      return {
        errors: ['unknown FPort'],
      };
    }
  }

function normalizeUplink(input) {
  return {
    data: {
        action: {
          motion: {
            detected: input.data.status > 0,
          }
        },
        air: {
            temperature: input.data.temperatureBoard,
        },
        battery: input.data.battery,
      }
  };
}
