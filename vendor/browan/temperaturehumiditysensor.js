//Browan version:1.0
function decodeUplink(input) {
  switch (input.fPort) {
    case 103:
      var status_low = (input.bytes[0] >> 3);
      var int_battery = (25 + (input.bytes[1] - ((input.bytes[1] >> 4) * 16))) / 10;
      var int_Temp = input.bytes[2] - 32;
      var int_rh = input.bytes[3];

      return {
        // Decoded data
        data: {
          Status: status_low,
          Battery: int_battery,
          Temp: int_Temp,
          Humidity: int_rh,
        },
      };
    default:
      return {
        errors: ['unknown FPort'],
      };
  }
}