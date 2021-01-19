
function decodeUplink(input) {
  switch (input.fPort) {
    case 2:
      return {
        // Decoded data
        data: {
          Status: bytes[0],
          Temperature: sintToDec((bytes[1] << 8) + bytes[2]),
          Humidity: ((bytes[3] << 8) + bytes[4]) / 100.0,
          AirPressure: bytes[5],
          Movement: bytes[6] / 100,
          BatteryLevel: (bytes[7] + 100) / 100
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