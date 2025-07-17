function decodeUplink(input) {

    //var num = input.bytes[0] * 256 + input.bytes[1]
    var bat = input.bytes[2] / 10.0
    var water_leak_flag = input.bytes[3]
    var water_leak_cnt = input.bytes[4] * 256 + input.bytes[5]
    var water_leak_time =  input.bytes[6] * 16777216 + input.bytes[7] * 65536 + input.bytes[8] * 256 + input.bytes[9]

    return {
        data: {
            field1: bat,
            field2: water_leak_flag, //Normal is 0,leakage is 1.
            field3: water_leak_cnt,
            field4: water_leak_time,
        },

    };
}