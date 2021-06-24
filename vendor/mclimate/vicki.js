function decodeUplink(input) {
	var bytes = input.bytes;

	toBool = function(value) {
		return value == '1';
	};
	if (bytes[0] == 1) {
		tmp = ('0' + bytes[6].toString(16)).substr(-2);
		motorRange1 = tmp[1];
		motorRange2 = ('0' + bytes[5].toString(16)).substr(-2);
		motorRange = parseInt('0x' + motorRange1 + motorRange2, 16);

		motorPos2 = ('0' + bytes[4].toString(16)).substr(-2);
		motorPos1 = tmp[0];
		motorPosition = parseInt('0x' + motorPos1 + motorPos2, 16);

		batteryTmp = ('0' + bytes[7].toString(16)).substr(-2)[0];
		batteryVoltageCalculated = 2 + parseInt('0x' + batteryTmp, 16) * 0.1;
		decbin = function(number) {
			if (number < 0) {
				number = 0xffffffff + number + 1;
			}
			return parseInt(number, 10).toString(2);
		};

		byteBin = decbin(bytes[7]);
		openWindow = byteBin.substr(4, 1);
		childLockBin = decbin(bytes[8]);
		childLock = childLockBin.charAt(0);
		highMotorConsumption = byteBin.substr(-2, 1);
		lowMotorConsumption = byteBin.substr(-3, 1);
		brokenSensor = byteBin.substr(-4, 1);

		var data = {
			reason: bytes[0],
			targetTemperature: bytes[1],
			sensorTemperature: bytes[2] * 165 / 256 - 40,
            relativeHumidity: (bytes[3] * 100) / 256 ,
			motorRange: motorRange,
			motorPosition: motorPosition,
			batteryVoltage: batteryVoltageCalculated,
			openWindow: toBool(openWindow),
			childLock: toBool(childLock),
			highMotorConsumption: toBool(highMotorConsumption),
			lowMotorConsumption: toBool(lowMotorConsumption),
			brokenSensor: toBool(brokenSensor)
		};
		return {
			data: data
		};
	}
}
