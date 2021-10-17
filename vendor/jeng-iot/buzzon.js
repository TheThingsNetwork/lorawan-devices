let shortPressTot = 0;
let longPressTot = 0;
let voltage = 0.00;

function sflt162f(rawSflt16) {
    // rawSflt16 is the 2-byte number decoded from wherever;
    // it's in range 0..0xFFFF
    // bit 15 is the sign bit
    // bits 14..11 are the exponent
    // bits 10..0 are the the mantissa. Unlike IEEE format, 
    //        the msb is transmitted; this means that numbers
    //        might not be normalized, but makes coding for
    //        underflow easier.
    // As with IEEE format, negative zero is possible, so
    // we special-case that in hopes that JavaScript will
    // also cooperate.
    //
    // The result is a number in the open interval (-1.0, 1.0);
    // 

    // throw away high bits for repeatability.

    rawSflt16 &= 0xFFFF;

    // special case minus zero:
    if (rawSflt16 == 0x8000)
        return -0.0;

    // extract the sign.
    var sSign = ((rawSflt16 & 0x8000) != 0) ? -1 : 1;

    // extract the exponent
    var exp1 = (rawSflt16 >> 11) & 0xF;

    // extract the "mantissa" (the fractional part)
    var mant1 = (rawSflt16 & 0x7FF) / 2048.0;

    // convert back to a floating point number. We hope 
    // that Math.pow(2, k) is handled efficiently by
    // the JS interpreter! If this is time critical code,
    // you can replace by a suitable shift and divide.
    var f_unscaled = sSign * mant1 * Math.pow(2, exp1 - 15);

    return f_unscaled;
}
function decodeUplink(input) {
    switch (input.fPort) {
        case 1:
		//fPort 1 is normal message
            shortPressTot = input.bytes[0] + (input.bytes[1] * 256);		//The total shortpresses (2bytes)
            longPressTot = input.bytes[2] + (input.bytes[3] * 256);			//The total longpresses (2bytes)
			/*reserved bytes */												//2 bytes reserved for future use
            voltage = sflt162f(input.bytes[6]+(input.bytes[7]*256)) * 10;	//voltage is saved as 2byte float. Multiply by 10 to get node votlage.
            return {
                data: {
                    shortPressTot,
                    longPressTot,
                    voltage
                },
                warnings: [],
                errors: []
            };
        case 2:
		//fPort 2 is heartbeat. This is decoded the same as a normal message
            shortPressTot = input.bytes[0] + (input.bytes[1] * 256);		//The total shortpresses (2bytes)
            longPressTot = input.bytes[2] + (input.bytes[3] * 256);			//The total longpresses (2bytes)
			/*reserved bytes */												//2 bytes reserved for future use
            voltage = sflt162f(input.bytes[6]+(input.bytes[7]*256)) * 10;	//voltage is saved as 2byte float. Multiply by 10 to get node votlage.
            return {
                data: {
                    shortPressTot,
                    longPressTot,
                    voltage
                },
                warnings: [],
                errors: []
            };
        default:
            return {
                data: {
                },
                warnings: ["usupported fPort"],
                errors: []
            };

    }
}
