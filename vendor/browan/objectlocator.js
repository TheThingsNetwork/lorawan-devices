//Browan version:1.0
function twocomplement_Lat(inputNum, comtimes) {
  var count02 = (Math.pow(2, comtimes + 1)) - 1;
  var final_Lat;
  if ((inputNum >> comtimes) == 0) {
    final_Lat = inputNum;
    return final_Lat;
  }
  else {
    final_Lat = -(inputNum ^ count02) - 1;
    return final_Lat;
  }
}
function twocomplement_Long(firstbit, inputNum, comtimes) {
  var count02 = (Math.pow(2, comtimes + 1)) - 1;
  var final_Long;
  if (firstbit == 0) {
    final_Long = inputNum;
    return final_Long;
  }
  else {
    final_Long = -(inputNum ^ count02) - 1;
    return final_Long;
  }
}
function decodeUplink(input) {
  switch (input.fPort) {
    case 136:
      var status_low = ((input.bytes[0] - ((input.bytes[0] >> 4) * 16)) % 8) % 2;
      var status_low2 = ((input.bytes[0] - ((input.bytes[0] >> 4) * 16)) % 8) >> 1;
      var status_low3 = (input.bytes[0] - ((input.bytes[0] >> 4) * 16)) >> 3;
      var status_hight = (input.bytes[0] >> 4);
      var int_battery = (25 + (input.bytes[1] - ((input.bytes[1] >> 4) * 16))) / 10;
      var int_Temp = input.bytes[2] - 32;
      var int_lat = (input.bytes[3] + input.bytes[4] * 256 + input.bytes[5] * 65536 + (input.bytes[6] - ((input.bytes[6] >> 4))) * 16777216);
      var int_long = (input.bytes[7] + input.bytes[8] * 256 + input.bytes[9] * 65536 + (input.bytes[10] - (((input.bytes[10] >> 5) << 1) * 16)) * 16777216);
      var bit_long = ((input.bytes[10] >> 4) % 2);
      var int_pestimate = Math.pow(2, ((input.bytes[10] >> 5) + 2));
      var Ftotal_lat = twocomplement_Lat(int_lat, 27);
      var Ftotal_long = twocomplement_Long(bit_long, int_long, 28);
      return {
        // Decoded data
        data: {
          ButtonTrigger: status_low,
          MovingMode: status_low2,
          NoGNSSFix: status_low3,
          GNSSerror: status_hight,
          Battery: int_battery,
          Temp: int_Temp,
          Lat: (Ftotal_lat / 1000000),
          Long: (Ftotal_long / 1000000),
          PositionEstimate: int_pestimate,
        },
      };
    default:
      return {
        errors: ['unknown FPort'],
      };
  }
}