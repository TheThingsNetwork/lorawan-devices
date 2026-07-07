function decodeUplink(input) {

    // var num = input.bytes[0] * 256 + input.bytes[1]
    var bat = input.bytes[4] / 10.0
    var adc = input.bytes[2] * 256 + input.bytes[3]

    return {
        data: {
            field1: bat,
            field2: adc,
        },

    };
}