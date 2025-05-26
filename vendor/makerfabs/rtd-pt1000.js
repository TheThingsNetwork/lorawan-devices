function decodeUplink(input) {

  // var num = input.bytes[0] * 256 + input.bytes[1]
  var bat = input.bytes[2] / 10.0
  // var temp = (input.bytes[3] * 256 + input.bytes[4]) / 10.0

  var temp = input.bytes[3] * 256 + input.bytes[4]
  if (temp >= 0x8000) {
      temp -= 0x10000;
  }
  temp = temp / 100.0

  return {
      data: {
          field1: bat,
          field2: temp,
      },

  };
}