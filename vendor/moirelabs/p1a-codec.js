var units = ['C', 'Pa', 'kPa', 'MPa'];

function bytesToFloat(bytes) {
    "use strict";
    var bits = bytes[3]<<24 | bytes[2]<<16 | bytes[1]<<8 | bytes[0];
    var sign = (bits>>>31 === 0) ? 1.0 : -1.0;
    var e = bits>>>23 & 0xff;
    var m = (e === 0) ? (bits & 0x7fffff)<<1 : (bits & 0x7fffff) | 0x800000;
    var f = sign * m * Math.pow(2, e - 150);
    return f;
}

function decodeUplink(input) {
    "use strict";
    return {
        data: {
            unit: units[input.bytes[1]],
            min_value: bytesToFloat(input.bytes.slice(2, 6)),
            max_value: bytesToFloat(input.bytes.slice(6, 10)),
            average_value: bytesToFloat(input.bytes.slice(10, 14)),
            last_value: bytesToFloat(input.bytes.slice(14, 18))
        }
    };
}
