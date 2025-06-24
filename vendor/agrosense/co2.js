function decodeUplink(input) {

    // var num = input.bytes[0] * 256 + input.bytes[1]
    var bat = input.bytes[2] / 10.0
    var co2 = input.bytes[3] * 256 + input.bytes[4]

    return {
        data: {
            field1: bat,
            field2: co2,
        },

    };
}