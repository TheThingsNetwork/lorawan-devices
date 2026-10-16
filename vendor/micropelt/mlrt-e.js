function decodeUplink(input) {
  switch (input.fPort) {
    case 1:
      {
        var output = {
          NTC1_Raw_Temperature: input.bytes[0] * 0.5,
          NTC1_Temperature: input.bytes[1] * 0.5,
          NTC2_Raw_Temperature: input.bytes[2] * 0.5,
          NTC2_Temperature: input.bytes[3] * 0.5,
          Ambient_Temperature: input.bytes[4] * 0.25,
          Ambient_Temperature_Failure: input.bytes[5]>>5 & 0x01,
          Energy_Storage_Low: input.bytes[5]>>4 & 0x01,
          Radio_Communication_Error: input.bytes[5]>>3 & 0x01,
          Radio_Signal_Strength: input.bytes[5]>>2 & 0x01,
          NTC2_Failure: input.bytes[5]>>1 & 0x01,
          NTC1_Failure: input.bytes[5] & 0x01,
          Storage_Voltage: Number((input.bytes[6]*0.02).toFixed(2))
        };
        return { data: output };
      }
    case 8:
      // Temperature Estimate coefficients (confirmation of the current settings)
      return {
        data: {
          p0: Number((toSignedByte(input.bytes[0]) * 0.01).toFixed(2)),
          p1: Number((input.bytes[1] * 0.01).toFixed(2)),
          p2: Number((input.bytes[2] * 0.00001).toFixed(5))
        }
      };
    default:
      return {
        errors: ['unknown FPort'],
      };
  }
}

function toSignedByte(value) {
  return value >= 128 ? value - 256 : value;
}

function encode_port_1(input) {
  // Byte 0: RESERVED (bits7-3) | RCI - Radio Communication Interval (bits2-0)
  switch (input.data.radioInterval) {
    case 5: return [0];
    case 10: return [1];
    case 15: return [2];
    case 20: return [3];
    case 30: return [4];
    case 60: return [5];
    case 120: return [6];
    case 480: return [7];
    default: throw new Error("Invalid radioInterval (5, 10, 15, 20, 30, 60, 120 or 480 minutes)");
  }
}

function encode_port_8(input) {
  var p0 = input.data.p0;
  var p1 = input.data.p1;
  var p2 = input.data.p2;

  // An empty downlink requests an uplink with the current settings
  if (p0 === undefined && p1 === undefined && p2 === undefined) {
    return [];
  }

  // Byte 0: p0 - signed (two's complement), Res = 0.01, -1.28 ... 1.27
  if (typeof p0 !== "number" || p0 < -1.28 || p0 > 1.27) {
    throw new Error("Invalid p0 value (-1.28 to 1.27)");
  }
  // Byte 1: p1 - unsigned, Res = 0.01, 0 ... 2.55
  if (typeof p1 !== "number" || p1 < 0 || p1 > 2.55) {
    throw new Error("Invalid p1 value (0 to 2.55)");
  }
  // Byte 2: p2 - unsigned, Res = 0.00001, 0 ... 0.00255
  if (typeof p2 !== "number" || p2 < 0 || p2 > 0.00255) {
    throw new Error("Invalid p2 value (0 to 0.00255)");
  }

  return [Math.round(p0 * 100) & 0xFF, Math.round(p1 * 100), Math.round(p2 * 100000)];
}

function encodeDownlink(input) {
  var bytes;
  switch (Number(input.fPort)) {
    case 1:
      bytes = encode_port_1(input);
      break;
    case 8:
      bytes = encode_port_8(input);
      break;
    default:
      return {
        errors: ['unknown FPort'],
      };
  }
  return {
    bytes: bytes,
    fPort: input.fPort
  };
}
