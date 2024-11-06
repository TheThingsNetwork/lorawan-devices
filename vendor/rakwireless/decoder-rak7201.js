function decodeUplink(input) {

	bytes = input.bytes;
	fPort = input.fPort;

	return {
		data: { button_pressed: bytes[0] - 64 },
		warnings: [],
		errors: []
	};

}


