// decode format 0x19

// test vectors:
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

function u4toFloat32(bytes, i)
	{
	// pick up four bytes at i
	var u32 = (bytes[i] << 24) + (bytes[i+1] << 16) + (bytes[i+2] << 8) + bytes[i+3];

	// extract sign
	var bSign =     (u32 & 0x80000000) ? true : false;
	var uExp =      (u32 & 0x7F800000) >> 23;
	var uMantissa = (u32 & 0x007FFFFF);

	// unless denormal, set the 1.0 bit
	if (uExp != 0)
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

function Decoder(bytes, port) {
	// Decode an uplink message from a buffer
	// (array) of bytes to an object of fields.
	var decoded = {};
	
	if (port === 1) {
		cmd = bytes[0];
		if (cmd == 0x19) {
				// i is used as the index into the message. Start with the flag byte.
			var i = 1;
			// fetch the bitmap.
			var flags = bytes[i++];
		
			if (flags & 0x1) {
				// set vRaw to a uint16, and increment pointer
				var vRaw = (bytes[i] << 8) + bytes[i + 1];
				i += 2;
				// interpret uint16 as an int16 instead.
				if (vRaw & 0x8000)
					vRaw += -0x10000;
				// scale and save in decoded.
				decoded.vBat = vRaw / 4096.0;
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
			} else if ((flags & 0x04) == 0) {
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
		}
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
