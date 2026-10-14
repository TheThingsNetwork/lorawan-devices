function decodeUplink(input) {
  switch (input.fPort) {
    case 1:
      {
        var output = {
          Ambient_Temperature: input.bytes[0] * 0.25,
          Energy_Storage_Low: input.bytes[1]>>4 & 0x01,
          Radio_Communication_Error: input.bytes[1]>>3 & 0x01,
          Radio_Signal_Strength: input.bytes[1]>>2 & 0x01,
          Ambient_Temperature_Failure: input.bytes[1] & 0x01,
          Storage_Voltage: Number((input.bytes[2]*0.02).toFixed(2))
        };
        return { data: output };
      }
    case 4:
      return { data: { SpreadingFactor: get_spreading_factor(input.bytes[0]) } };
    default:
      return {
        errors: ['unknown FPort'],
      };
  }
}

function get_spreading_factor(code) {
  switch (code) {
    case 0: return "SF7";
    case 1: return "SF8";
    case 2: return "SF9";
    case 3: return "SF10";
    case 4: return "SF11";
    case 5: return "SF12";
    default: return "Invalid SF";
  }
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

function encode_port_4(input) {
  // Byte 0: DR - Data Rate (default SF9BW125)
  switch (input.data.spreading_factor) {
    case "SF7": return [0];
    case "SF8": return [1];
    case "SF9": return [2];
    case "SF10": return [3];
    case "SF11": return [4];
    case "SF12": return [5];
    default: throw new Error("Invalid Spreading Factor");
  }
}

function encodeDownlink(input) {
  var bytes;
  switch (Number(input.fPort)) {
    case 1:
      bytes = encode_port_1(input);
      break;
    case 4:
      bytes = encode_port_4(input);
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
