var frameTypes = ['ModbusRTU', 'ModbusTCP', 'Trasnparent'];


function decodeUplink(input) {
  switch (input.fPort) {
    case 1:
      return {
        // Decoded data
        data: {
          frameType: frameTypes[input.bytes[0] & 0x01],
          deviceID: ((input.bytes[1] << 24) + (input.bytes[2] << 16) + (input.bytes[3] << 8) + (input.bytes[4])),
          targetPort: input.bytes[5],
          deviceTime: ((input.bytes[6] << 24) + (input.bytes[7] << 16) + (input.bytes[8] << 8) + (input.bytes[9])),
          firmwareVMajor: input.bytes[10],
          firmwareVMinor: input.bytes[11],
          firmwareVMinorSub: input.bytes[12],
        },
      };
    default:
      return {
        errors: ['unknown FPort'],
      };
  }
}

function normalizeUplink(input) {
  return {
    // Normalized data
    data: {
      frameType: frameTypes[input.bytes[0] & 0x01],
          deviceID: deviceID,
          targetPort: targetPort,
          deviceTime: deviceTime,
          firmwareVMajor: firmwareVMajor,
          firmwareVMinor: firmwareVMinor,
          firmwareVMinorSub: firmwareVMinorSub,
    },
  };
}

