function decodeUplink(input) {
  return {
    data: {
      battery : input.bytes[14] + (input.bytes[15] << 8),
      solar : input.bytes[16] + (input.bytes[17] << 8),
      precipitation : input.bytes[18] + (input.bytes[19] << 8),
      avg_temp : (input.bytes[20] + (input.bytes[21] << 8))/100, //s4
      min_temp : (input.bytes[22] + (input.bytes[23] << 8))/100, //s5
      max_temp : (input.bytes[24] + (input.bytes[25] << 8))/100, //s6
      humidity_avg : (input.bytes[26] + (input.bytes[27] << 8))/10, //s7
      humidity_max: (input.bytes[30] + (input.bytes[31] << 8))/10, //s7
      humidity_min: (input.bytes[28] + (input.bytes[29] << 8))/10, //s7
      deltaT_avg : (input.bytes[32] + (input.bytes[33] << 8))/100,
      deltaT_min : (input.bytes[34] + (input.bytes[35] << 8))/100,
      deltaT_max :(input.bytes[36] + (input.bytes[37] << 8))/100,
      dewPoint_avg : input.bytes[38] + (input.bytes[39] << 8),
        //dewPoint_min : input.bytes[40] - (input.bytes[41] << 8),

      vpd_avg : (input.bytes[42] + (input.bytes[43] << 8))/100,
      vpd_min : (input.bytes[44] + (input.bytes[45] << 8))/100,
    }
  };
}