function decodeUplink(input) {
	var bytes = input.bytes;
	// Decode an uplink message from a buffer
	// (array) of bytes to an object of fields.
	var decoded = {};

	// gwf protocol byte 0
	switch (bytes[0]) {
		case 0x01:
			decoded.protocol = "standard";
			break;
		case 0x02:
			decoded.protocol = "noDueDate";
			break;
		default:
			decoded.protocol = "unkown";
			break;
	}
	// manufacturer byte 1,2
	decoded.manufacturer = getManufacturer(bytes[1], bytes[2]);

	// meter id byte 3,4,5,6

	decoded.meterId = 0;

	for (var i = 3; i >= 0; i--) {
		decoded.meterId = decoded.meterId * 100 + decode(bytes[i + 3]);
	}

	//medium byte 7
	switch (bytes[7]) {
		case 0x03:
			decoded.medium = "Gas";
			break;
		case 0x06:
			decoded.medium = "Hot Water";
			break;
		case 0x07:
			decoded.medium = "Water";
			break;
		default:
			decoded.medium = "Unkown";
	}

	decoded.badEncoder =
		(((bytes[8] & (1 << 4)) >> 4) & ((bytes[8] & (1 << 6)) >> 6)) !== 0;
	decoded.noEncoder =
		(((bytes[8] & (1 << 4)) >> 4) & ((bytes[8] & (1 << 5)) >> 5)) !== 0;
	decoded.lowBattery = (bytes[8] & (1 << 2)) >> 2 == 1;

	//actuality duration bytes 10,11
	decoded.actualityduration = bytes[10] * 265 + bytes[9];

	// register value, bytes 12,13,14,15
	var registerValue = 0;
	var j = 15;
	while (1) {
		registerValue += bytes[j];
		if (j == 12) break;
		registerValue *= 256;
		j--;
	}

	decoded.registerValue = registerValue;

	//byte 16

	decoded.reservedBit0 = (bytes[16] & 0x1) == 1;
	decoded.continousFlow = (bytes[16] & 0x2) == 1;
	decoded.reservedBit2 = (bytes[16] & 0x4) == 1;
	decoded.brokenPipe = (bytes[16] & 0x8) == 1;
	decoded.reservedBit4 = (bytes[16] & 0x10) == 1;
	//decoded.lowBattery=(bytes[16]&0x20)==1;
	decoded.backFlow = (bytes[16] & 0x40) == 1;
	decoded.reservedBit7 = (bytes[16] & 0x80) == 1;

	//byte 17
	decoded.batteryLifeSemesters = (bytes[17] & 0xf8) >> 3;
	decoded.linkError = (bytes[17] & 0x04) !== 0;

	//byte 18-19
	decoded.crc = "0x" + (bytes[18] * 256 + bytes[19]).toString(16);

	return {
	  data: decoded,
    warnings: [],
    errors: []
	};
}

function decode(b) {
	return (b >> 4) * 10 + (b & 0xf);
}

function getManufacturer(lowByte, highByte) {
	var valHB = parseInt(highByte);
	var valLB = parseInt(lowByte);
	var res = valHB * 256 + valLB;
	firstLetterCC = res / 32 / 32 + 64;
	firstLetter = String.fromCharCode(firstLetterCC);
	secondLetterCC = ((res / 32) % 32) + 64;
	secondLetter = String.fromCharCode(secondLetterCC);
	thirdLetterCC = (res % 32) + 64;
	thirdLetter = String.fromCharCode(thirdLetterCC);
	return firstLetter.concat(secondLetter, thirdLetter);
}
