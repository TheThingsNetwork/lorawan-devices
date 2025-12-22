function decodeUplink(input) {
  // Helper function to convert bytes to float
  function bytesToFloat(bytes) {
    var bits = (bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0];
    var sign = (bits & 0x80000000) ? -1 : 1;
    var exponent = ((bits >> 23) & 0xFF) - 127;
    var significand = (bits & ~(-1 << 23));

    if (exponent === 128)
        return sign * ((significand) ? NaN : Infinity);

    if (exponent === -127) {
        if (significand === 0) return sign * 0.0;
        exponent = -126;
        significand /= (1 << 22);
    } else significand = (significand | (1 << 23)) / (1 << 23);

    return sign * significand * Math.pow(2, exponent);
  }

  // Decode each float from the 12-byte payload
  var sensor1Voltage = bytesToFloat(input.bytes.slice(0, 4));
  var sensor2Voltage = bytesToFloat(input.bytes.slice(4, 8));
  var sensor3Voltage = bytesToFloat(input.bytes.slice(8, 12));

  // Round the float values to 2 decimal places
  sensor1Voltage = Math.round(sensor1Voltage * 100) / 100;
  sensor2Voltage = Math.round(sensor2Voltage * 100) / 100;
  sensor3Voltage = Math.round(sensor3Voltage * 100) / 100;

  // Return decoded values
  return {
    data: {
      sensor1Voltage: sensor1Voltage.toFixed(2),
      sensor2Voltage: sensor2Voltage.toFixed(2),
      sensor3Voltage: sensor3Voltage.toFixed(2)
    },
    warnings: [],
    errors: []
  };
}