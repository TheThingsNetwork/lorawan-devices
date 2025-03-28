/*

Name:   codec-model4811.js

Function:
    Decode messages from MCCI Model 4811 meter (long and short formats)

Copyright and License:
    This file is released under the MIT license:

    Copyright (c) 2019-2021, 2022 MCCI Corporation.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.

Author:
    Terry Moore, MCCI Corporation   August 2019

*/

// test vectors (port 1):
//
// 19 1B 35 34 0E 00 00 00 76 00 00 01 61 42 92 92 89
//  {
//	"ModbusError": 0,
//	"boot": 14,
//	"energySourced": 35300,
//	"energyUsed": 11800,
//	"mainDemand": 73.28620147705078,
//	"vBat": 3.3251953125
//  }
//
// 19 1B 35 34 0E 00 00 00 76 00 00 01 61 00 00 00 01
//  {
//	"ModbusError": 0,
//	"boot": 14,
//	"energySourced": 35300,
//	"energyUsed": 11800,
//	"mainDemand": 1.401298464324817e-45,
//	"vBat": 3.3251953125
//  }
//
// 19 1B 35 34 0E 00 00 00 76 00 00 01 61 00 80 00 00
//  {
//	"ModbusError": 0,
//	"boot": 14,
//	"energySourced": 35300,
//	"energyUsed": 11800,
//	"mainDemand": 1.1754943508222875e-38,
//	"vBat": 3.3251953125
//  }
//
// 198B351738000000060000001200000000000000000000000042EF59A542EF50010000000042EF6349
//  {
//    "ModbusError": 0,
//    "boot": 56,
//    "energySourced": 1800,
//    "energyUsed": 600,
//    "mainDemand": 0,
//    "quality": {
//      "VoltageAB": 119.65625762939453,
//      "VoltageBC": 0,
//      "VoltageCA": 119.69391632080078,
//      "VoltageLL": 119.67508697509766,
//      "current1": 0,
//      "current2": 0,
//      "current3": 0
//    },
//    "vBat": 3.318115234375
//  }

function u4toFloat32(bytes, i)
	{
	// pick up four bytes at i
	var u32 = (bytes[i] << 24) + (bytes[i+1] << 16) + (bytes[i+2] << 8) + bytes[i+3];

	// extract sign
	var bSign =     (u32 & 0x80000000) ? true : false;
	var uExp =      (u32 & 0x7F800000) >> 23;
	var uMantissa = (u32 & 0x007FFFFF);

	// unless denormal, set the 1.0 bit
	if (uExp !== 0)
		uMantissa +=   0x00800000;
	else
		uExp += 1;

	// make a floating mantissa in [0,2)
	var mantissa = uMantissa / 0x00800000;

	// apply the exponent.
	mantissa = Math.pow(2, uExp - 127) * mantissa;
	return bSign ? -mantissa : mantissa;
	}

function u2toInt16(bytes, i)
	{
	var u16 = (bytes[i+0] << 8) + bytes[i+1];

	if (u16 & 0x8000)
		return u16 - 0x10000;
	else
		return u16;
	}

function u4toInt32(bytes, i)
	{
	var u32 = (bytes[i] << 24) + (bytes[i+1] << 16) + (bytes[i+2] << 8) + bytes[i+3];

	if (u32 & 0x80000000)
		return u32 - 4294967296;
	else
		return u32;
	}

function u3toFloat24(bytes, i) {
	// pick up three bytes at index i into variable u32
	var u24 = (bytes[i] << 16) + (bytes[i + 1] << 8) + bytes[i + 2];

	// extract sign, exponent, mantissa
	var bSign     = (u24 & 0x800000) ? true : false;
	var uExp      = (u24 & 0x7F0000) >> 16;
	var uMantissa = (u24 & 0x00FFFF);

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

function Decoder(bytes, port) {
	// Decode an uplink message from a buffer
	// (array) of bytes to an object of fields.
	var decoded = {};

	if (port === 1) {
		cmd = bytes[0];
		if (cmd === 0x19) {
				// i is used as the index into the message. Start with the flag byte.
			var i = 1;
			// fetch the bitmap.
			var flags = bytes[i++];

			if (flags & 0x1) {
				decoded.vBat = u2toInt16(bytes, i) / 4096.0;
				i += 2;
			}

			if (flags & 0x2) {
				var iBoot = bytes[i];
				i += 1;
				decoded.boot = iBoot;
			}

			if (flags & 0x4) {
				// error code, as signed int.
				decoded.ModbusError = u2toInt16(bytes, i);
				i += 2;
			} else {
				decoded.ModbusError = 0;
			}

			if (flags & 0x08) {
				decoded.energyUsed = u4toInt32(bytes, i) * 100;
				decoded.energySourced = u4toInt32(bytes, i+4) * 100;
				i += 8;
			}

			if (flags & 0x10) {
				decoded.mainDemand = u4toFloat32(bytes, i);
				i += 4;
			} else if ((flags & 0x04) === 0) {
				decoded.mainDemand = 0;
			}

			if (flags & 0x20) {
				decoded.branchEnergyUsed = u4toInt32(bytes, i) * 100;
				decoded.branchDemand = 0;
				i += 4;
			}

			if (flags & 0x40) {
				decoded.branchDemand = u4toFloat32(bytes, i);
				i += 4;
			}

			if (flags & 0x80) {
				var quality = {};
				decoded.quality = quality;
				quality.current1 = u4toFloat32(bytes, i);
				quality.current2 = u4toFloat32(bytes, i + 4);
				quality.current3 = u4toFloat32(bytes, i + 8);
				quality.VoltageLL = u4toFloat32(bytes, i + 12);
				quality.VoltageAB = u4toFloat32(bytes, i + 16);
				quality.VoltageBC = u4toFloat32(bytes, i + 20);
				quality.VoltageCA = u4toFloat32(bytes, i + 24);
				i += 28;
			}

			var flags2 = 0;
			if (bytes.length > i) {
				flags2 = bytes[i];
				++i;
			}
			if (flags2 & 1) {
				decoded.Ct2Used = u4toInt32(bytes, i) * 100;
				i += 4;
			}
			if (flags2 & 2) {
				decoded.Ct2Sourced = u4toInt32(bytes, i) * 100;
				i += 4;
			}
			if (flags2 & 4) {
				decoded.Ct2Demand = u4toFloat32(bytes, i);
				i += 4;
			}
			if (flags2 & 8) {
				decoded.Ct3Used = u4toInt32(bytes, i) * 100;
				i += 4;
			}
			if (flags2 & 16) {
				decoded.Ct3Sourced = u4toInt32(bytes, i) * 100;
				i += 4;
			}
			if (flags2 & 32) {
				decoded.Ct3Demand = u4toFloat32(bytes, i);
				i += 4;
			}
		}
	}
	else if (port === 10) {
		var i = 0;
		decoded.vBat = u2toInt16(bytes, i) / 4096.0;
		i += 2;
		decoded.boot = bytes[i];
		i += 1;
		if (bytes.length > i) {
			decoded.ModbusError = u2toInt16(bytes, i);
			i += 2;
		}
		if (bytes.length > i) {
			var quality = {}
			decoded.quality = quality;
			quality.VoltageLL = u3toFloat24(bytes, i);
			i += 3;
		}
	}
	else if (port === 11) {
		var i = 0;
		decoded.energyUsed = u4toInt32(bytes, i) * 100;
		i += 4;
		decoded.energySourced = u4toInt32(bytes, i) * 100;
		i += 4;
		decoded.mainDemand = u3toFloat24(bytes, i);
		i += 3;
	}
	else if (port === 12) {
		var quality = {};
		decoded.quality = quality;
		quality.current1 = u3toFloat24(bytes, 0);
		quality.current2 = u3toFloat24(bytes, 3);
		quality.current3 = u3toFloat24(bytes, 6);
	}
	else if (port === 13) {
		var quality = {};
		decoded.quality = quality;
		quality.VoltageAB = u3toFloat24(bytes, 0);
		quality.VoltageBC = u3toFloat24(bytes, 3);
		quality.VoltageCA = u3toFloat24(bytes, 6);
	}
	else if (port === 14) {
		var i = 0;
		decoded.branchEnergyUsed = u4toInt32(bytes, i) * 100;
		i += 4;
		decoded.branchDemand = 0;
		if (bytes.length > i) {
			decoded.branchDemand = u3toFloat24(bytes, i);
			i += 3;
		}
	}
	else if (port === 15) {
		decoded.Ct2Used 	= u4toInt32(bytes, 0);
		decoded.Ct2Sourced 	= u4toInt32(bytes, 4);
		decoded.Ct2Demand 	= u3toFloat24(bytes, 8);
	}
	else if (port === 16) {
		decoded.Ct3Used 	= u4toInt32(bytes, 0);
		decoded.Ct3Sourced 	= u4toInt32(bytes, 4);
		decoded.Ct3Demand 	= u3toFloat24(bytes, 8);
	}

	// at this point, decoded has the real values.
	return decoded;
}

// TTN V3 decoder
function decodeUplink(tInput) {
	var decoded = Decoder(tInput.bytes, tInput.fPort);
	var result = {};
	result.data = decoded;
	return result;
}