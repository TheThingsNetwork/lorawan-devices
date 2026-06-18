function decodeUplink(input) {
	var bytes = input.bytes;
	var decbin = function(number) {
		return parseInt(number, 10).toString(2);
	};
	var byteArray = bytes.map(function(byte) {
		var number = decbin(byte);
		return Array(9 - number.length).join('0') + number;
	});

	var messageTypes = [ 'keepalive', 'testButtonPressed', 'floodDetected', 'controlButtonPressed', 'fraudDetected' ];
	toBool = function(value) {
		return value == '1';
	};
	shortPackage = function(byteArray) {
		return {
			data: {
				reason: 'keepalive',
				waterTemp: parseInt(byteArray[0], 2)/2,
				valveState: toBool(byteArray[1][0]),
				ambientTemp: (parseInt(byteArray[1].slice(1, 8), 2)-20)/2,
			}
		};
	};
	longPackage = function(byteArray) {
		return {
			data: {
				reason: messageTypes[parseInt(byteArray[0].slice(0, 3),2)],
				boxTamper: toBool(byteArray[0][4]),
				floodDetectionWireState: toBool(byteArray[0][5]),
				flood: toBool(byteArray[0][6]),
				magnet: toBool(byteArray[0][7]),
				alarmValidated: toBool(byteArray[1][0]),
				manualOpenIndicator: toBool(byteArray[1][1]),
				manualCloseIndicator: toBool(byteArray[1][2]),
				closeTime: parseInt(byteArray[2], 2),
				openTime: parseInt(byteArray[3], 2),
				battery: ((parseInt(byteArray[4], 2) * 8) + 1600)/1000,
			}
		};
	};
	if (byteArray.length > 2) {
		return longPackage(byteArray);
	} else {
		return shortPackage(byteArray);
	}
}
