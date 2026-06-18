
function decodeUplink(input) {
  switch (input.fPort) {
    case 2:
      return {
        // Decoded data
        data: {
          Status: bytes[0],
          Temperature: sintToDec(bytes[1] << 8 | bytes[2]),
          Humidity: (bytes[3] << 8 | bytes[4]) / 100,
          AirPressure: bytes[5] + 845, 
          IAQ: bytes[6] << 8 | bytes[7],
          StaticIAQ: bytes[8] << 8 | bytes[9],
          eCO2: bytes[10] << 8 | bytes[11],
          BreathVOC: bytes[12] / 10,
          IAQAccuracy: bytes[13]
        },
      };
    default:
      return {
        errors: ['unknown FPort'],
      };
  }
}

function sintToDec(T){
  if (T > 32767) {
    return ((T - 65536) / 100.0);
  }
  else {
    return (T / 100.0);
  }
}
