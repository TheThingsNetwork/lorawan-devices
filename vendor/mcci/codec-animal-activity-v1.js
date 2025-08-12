/*

Name:   codec-port2-port3-fmt22-fmt33.js

Function:
    Decode port 0x02 and 0x03 format 0x22 and 0x33 messages for TTN console.

Copyright and License:
    See accompanying LICENSE file at https://github.com/mcci-catena/MCCI-Catena-4430/

Author:
    Terry Moore, MCCI Corporation   August 2019

*/

// calculate dewpoint (degrees C) given temperature (C) and relative humidity (0..100)
// from http://andrew.rsmas.miami.edu/bmcnoldy/Humidity.html
// rearranged for efficiency and to deal sanely with very low (< 1%) RH
function dewpoint(t, rh) {
    var c1 = 243.04;
    var c2 = 17.625;
    var h = rh / 100;
    if (h <= 0.01)
        h = 0.01;
    else if (h > 1.0)
        h = 1.0;

    var lnh = Math.log(h);
    var tpc1 = t + c1;
    var txc2 = t * c2;
    var txc2_tpc1 = txc2 / tpc1;

    var tdew = c1 * (lnh + txc2_tpc1) / (c2 - lnh - txc2_tpc1);
    return tdew;
}

/*

Name:   CalculateHeatIndex()

Description:
        Calculate the NWS heat index given dry-bulb T and RH

Definition:
        function CalculateHeatIndex(t, rh) -> value or null

Description:
        T is a Farentheit temperature in [76,120]; rh is a
        relative humidity in [0,100]. The heat index is computed
        and returned; or an error is returned.  For consistency with
        the other temperature, despite the heat index being defined
        in Farenheit, we return in Celsius.

Returns:
        number => heat index in Farenheit.
        null => error.

References:
        https://github.com/mcci-catena/heat-index/
        https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml

        Results was checked against the full chart at iweathernet.com:
        https://www.iweathernet.com/wxnetcms/wp-content/uploads/2015/07/heat-index-chart-relative-humidity-2.png

        The MCCI-Catena heat-index site has a test js script to generate CSV to
        match the chart, a spreadsheet that recreates the chart, and a
        spreadsheet that compares results.

*/

function CalculateHeatIndex(t, rh) {
    var tRounded = Math.floor(t + 0.5);

    // return null outside the specified range of input parameters
    if (tRounded < 76 || tRounded > 126)
        return null;
    if (rh < 0 || rh > 100)
        return null;

    // according to the NWS, we try this first, and use it if we can
    var tHeatEasy = 0.5 * (t + 61.0 + ((t - 68.0) * 1.2) + (rh * 0.094));

    // The NWS says we use tHeatEasy if (tHeatHeasy + t)/2 < 80.0
    // This is the same computation:
    if ((tHeatEasy + t) < 160.0)
            return (tHeatEasy - 32) * 5 / 9;

    // need to use the hard form, and possibly adjust.
    var t2 = t * t;         // t squared
    var rh2 = rh * rh;      // rh squared
    var tResult =
        -42.379 +
        (2.04901523 * t) +
        (10.14333127 * rh) +
        (-0.22475541 * t * rh) +
        (-0.00683783 * t2) +
        (-0.05481717 * rh2) +
        (0.00122874 * t2 * rh) +
        (0.00085282 * t * rh2) +
        (-0.00000199 * t2 * rh2);

    // these adjustments come from the NWA page, and are needed to
    // match the reference table.
    var tAdjust;
    if (rh < 13.0 && 80.0 <= t && t <= 112.0)
        tAdjust = -((13.0 - rh) / 4.0) * Math.sqrt((17.0 - Math.abs(t - 95.0)) / 17.0);
    else if (rh > 85.0 && 80.0 <= t && t <= 87.0)
        tAdjust = ((rh - 85.0) / 10.0) * ((87.0 - t) / 5.0);
    else
        tAdjust = 0;

    // apply the adjustment
    tResult += tAdjust;

    // finally, the reference tables have no data above 183 (rounded),
    // so filter out answers that we have no way to vouch for.
    if (tResult >= 183.5)
        return null;
    else
        return (tResult - 32) * 5 / 9;
}

function DecodeU16(Parse) {
    var i = Parse.i;
    var bytes = Parse.bytes;
    var result = (bytes[i] << 8) + bytes[i + 1];
    Parse.i = i + 2;
    return result;
}

function DecodeUflt16(Parse) {
    var rawUflt16 = DecodeU16(Parse);
    var exp1 = rawUflt16 >> 12;
    var mant1 = (rawUflt16 & 0xFFF) / 4096.0;
    var f_unscaled = mant1 * Math.pow(2, exp1 - 15);
    return f_unscaled;
}

function DecodeSflt16(Parse)
    {
    var rawSflt16 = DecodeU16(Parse);
    // rawSflt16 is the 2-byte number decoded from wherever;
    // it's in range 0..0xFFFF
    // bit 15 is the sign bit
    // bits 14..11 are the exponent
    // bits 10..0 are the the mantissa. Unlike IEEE format,
    // the msb is explicit; this means that numbers
    // might not be normalized, but makes coding for
    // underflow easier.
    // As with IEEE format, negative zero is possible, so
    // we special-case that in hopes that JavaScript will
    // also cooperate.
    //
    // The result is a number in the open interval (-1.0, 1.0);
    //

    // throw away high bits for repeatability.
    rawSflt16 &= 0xFFFF;

    // special case minus zero:
    if (rawSflt16 === 0x8000)
        return -0.0;

    // extract the sign.
    var sSign = ((rawSflt16 & 0x8000) !== 0) ? -1 : 1;

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


function DecodeLight(Parse) {
    return DecodeUflt16(Parse);
}

function DecodeActivity(Parse) {
    return DecodeSflt16(Parse);
}

function DecodeI16(Parse) {
    var i = Parse.i;
    var bytes = Parse.bytes;
    var result = (bytes[i] << 8) + bytes[i + 1];
    Parse.i = i + 2;

    // interpret uint16 as an int16 instead.
    if (result & 0x8000)
        result += -0x10000;

    return result;
}

function DecodeU24(Parse) {
    var i = Parse.i;
    var bytes = Parse.bytes;

    var result = (bytes[i + 0] << 16) + (bytes[i + 1] << 8) + bytes[i + 2];
    Parse.i = i + 3;

    return result;
}

function DecodeSflt24(Parse)
    {
    var rawSflt24 = DecodeU24(Parse);
    // rawSflt24 is the 3-byte number decoded from wherever;
    // it's in range 0..0xFFFFFF
    // bit 23 is the sign bit
    // bits 22..16 are the exponent
    // bits 15..0 are the the mantissa. Unlike IEEE format,
    // the msb is explicit; this means that numbers
    // might not be normalized, but makes coding for
    // underflow easier.
    // As with IEEE format, negative zero is possible, so
    // we special-case that in hopes that JavaScript will
    // also cooperate.

    // extract sign, exponent, mantissa
    var bSign     = (rawSflt24 & 0x800000) ? true : false;
    var uExp      = (rawSflt24 & 0x7F0000) >> 16;
    var uMantissa = (rawSflt24 & 0x00FFFF);

    // if non-numeric, return appropriate result.
    if (uExp === 0x7F) {
        if (uMantissa === 0)
            return bSign ? Number.NEGATIVE_INFINITY
                    : Number.POSITIVE_INFINITY;
        else
            return Number.NaN;
    // else unless denormal, set the 1.0 bit
    } else if (uExp !== 0) {
        uMantissa += 0x010000;
    } else { // denormal: exponent is the minimum
        uExp = 1;
    }

    // make a floating mantissa in [0,2); usually [1,2), but
    // sometimes (0,1) for denormals, and exactly zero for zero.
    var mantissa = uMantissa / 0x010000;

    // apply the exponent.
    mantissa = Math.pow(2, uExp - 63) * mantissa;

    // apply sign and return result.
    return bSign ? -mantissa : mantissa;
    }

function DecodeLux(Parse) {
    return DecodeSflt24(Parse);
}

function DecodeI32(Parse) {
    var i = Parse.i;
    var bytes = Parse.bytes;

    var result = (bytes[i + 0] << 24)+ (bytes[i + 1] << 16) + (bytes[i + 2] << 8) + bytes[i + 3];
    Parse.i = i + 4;

    // interpret uint16 as an int16 instead.
    if (result & 0x80000000)
        result += -0x100000000;

    return result;
}

function DecodeU32(Parse) {
    var i = Parse.i;
    var bytes = Parse.bytes;

    var result = (bytes[i + 0] << 24)+ (bytes[i + 1] << 16) + (bytes[i + 2] << 8) + bytes[i + 3];
    Parse.i = i + 4;

    return result;
}

function RemainingBytes(Parse) {
    var i = Parse.i;
    var nBytes = Parse.bytes.length;

    if (i < nBytes)
        return (nBytes - i);
    else
        return 0;
}

function DecodeV(Parse) {
    return DecodeI16(Parse) / 4096.0;
}

function Decoder(bytes, port) {
    // Decode an uplink message from a buffer
    // (array) of bytes to an object of fields.
    var decoded = {};

    if (! (port === 2) && ! (port === 3))
        return null;

    var uFormat = bytes[0];
    if (! (uFormat === 0x22) && ! (uFormat === 0x33))
        return null;

    // an object to help us parse.
    var Parse = {};
    Parse.bytes = bytes;
    // i is used as the index into the message. Start with the time.
    Parse.i = 1;

    // fetch time; convert to database time (which is UTC-like ignoring leap seconds)
    decoded.time = new Date((DecodeU32(Parse) + /* gps epoch to posix */ 315964800 - /* leap seconds */ 17) * 1000);

    // fetch the bitmap.
    var flags = bytes[Parse.i++];

    if (flags & 0x1) {
        decoded.Vbat = DecodeV(Parse);
    }

    if (flags & 0x2) {
        decoded.Vsys = DecodeV(Parse);
    }

    if (flags & 0x4) {
        decoded.Vbus = DecodeV(Parse);
    }

    if (flags & 0x8) {
        var iBoot = bytes[Parse.i++];
        decoded.boot = iBoot;
    }

    if (flags & 0x10) {
        if (uFormat === 0x22) {
            // we have temp, pressure, RH
            decoded.tempC = DecodeI16(Parse) / 256;
            decoded.p = DecodeU16(Parse) * 4 / 100.0;
            decoded.rh = DecodeU16(Parse) * 100 / 65535.0;
            decoded.tDewC = dewpoint(decoded.tempC, decoded.rh);
            var tHeat = CalculateHeatIndex(decoded.tempC * 1.8 + 32, decoded.rh);
            if (tHeat !== null)
                decoded.tHeatIndexC = tHeat;
            }
        else if (uFormat === 0x33 ) {
            // we have temp, pressure, RH
            decoded.tempC = DecodeI16(Parse) / 256;
            decoded.rh = DecodeU16(Parse) * 100 / 65535.0;
            decoded.tDewC = dewpoint(decoded.tempC, decoded.rh);
            var tHeat = CalculateHeatIndex(decoded.tempC * 1.8 + 32, decoded.rh);
            if (tHeat !== null)
                decoded.tHeatIndexC = tHeat;
            }
    }

    if (flags & 0x20) {
        if (uFormat === 0x22) {
            // we have light
            decoded.irradiance = {};
            decoded.irradiance.White = DecodeLight(Parse) * Math.pow(2.0, 24);
        }
        else if (uFormat === 0x33) {
            // we have light
            decoded.lux = DecodeLux(Parse);
        }
    }

    if (flags & 0x40) {
        // we have gpio counts
        decoded.pellets = [];
        for (var i = 0; i < 2; ++i) {
            decoded.pellets[i] = {};
            decoded.pellets[i].Total = DecodeU16(Parse);
            decoded.pellets[i].Delta = bytes[Parse.i++];
        }
    }

    if (flags & 0x80) {
        // we have Activity
        decoded.activity = [];
        var i = 0;
        while (RemainingBytes(Parse) >= 2) {
            decoded.activity[i] = DecodeActivity(Parse);
            ++i;
        }
    }

    if (port === 3)
        decoded.NwTime = "set";
    
    return decoded;
}

// TTN V3 decoder
function decodeUplink(tInput) {
    var decoded = Decoder(tInput.bytes, tInput.fPort);
    var result = {};
    result.data = decoded;
    return result;
}