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
    switch (input.fPort) {
        case 1:
            return {
                data: {
                    unit: units[input.bytes[0]],
                    min_value: +bytesToFloat(input.bytes.slice(1, 5)).toFixed(4),
                    max_value: +bytesToFloat(input.bytes.slice(5, 9)).toFixed(4),
                    average_value: +bytesToFloat(input.bytes.slice(9, 13)).toFixed(4),
                    last_value: +bytesToFloat(input.bytes.slice(13, 17)).toFixed(4)
                }
            };
        default:
            return {
                errors: ['Unknown FPort - see device manual!'],
            };
      }
}
