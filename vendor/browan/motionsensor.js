//Browan version:1.0
function decodeUplink(input) {
  switch (input.fPort) {
    case 102:
      var status_low = (input.bytes[0] - ((input.bytes[0] >> 4) * 16)) % 2;
      var int_battery = (25 + (input.bytes[1] - ((input.bytes[1] >> 4) * 16))) / 10;
      var int_Temp = input.bytes[2] - 32;
      var int_Time = input.bytes[3] + input.bytes[4] * 256;
      var int_Count = input.bytes[5] + input.bytes[6] * 256 + input.bytes[7] * 65536;

      return {
        // Decoded data
        data: {
          Status: status_low,
          Battery: int_battery,
          Temp: int_Temp,
          Time: int_Time,
          Count: int_Count,
        },
      };
    default:
      return {
        errors: ['unknown FPort'],
      };
  }
}