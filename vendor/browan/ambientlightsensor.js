//Browan version:1.0
function decodeUplink(input) {
  switch (input.fPort) {
    case 104:
      var status_low = (input.bytes[0] - ((input.bytes[0] >> 4) * 16)) % 2;
      var status_low2 = (input.bytes[0] - ((input.bytes[0] >> 4) * 16)) >> 1;
      var status_hight = ((input.bytes[0] >> 4) % 2);
      var status_hight2 = (input.bytes[0] >> 5);
      var int_battery = (25 + (input.bytes[1] - ((input.bytes[1] >> 4) * 16))) / 10;
      var int_Temp = input.bytes[2] - 32;
      var int_lux = (input.bytes[3] + input.bytes[4] * 256 + input.bytes[5] * 65536) / 100;

      return {
        // Decoded data
        data: {
          Darker: status_low,
          Lighter: status_low2,
          StatusChange: status_hight,
          KeepAlive: status_hight2,
          Battery: int_battery,
          Temp: int_Temp,
          Lux: int_lux,
        },
      };
    default:
      return {
        errors: ['unknown FPort'],
      };
  }
}