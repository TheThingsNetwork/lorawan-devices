function decodeUplink(input) {
	try{
		var bytes = input.bytes;
		var data = {};
		var calculateTemperature = function (rawData){return (rawData - 400) / 10};
		var calculateHumidity = function(rawData){return (rawData * 100) / 256};
		function decbin (number) {
		if (number < 0) {
			number = 0xFFFFFFFF + number + 1;
		}
		return parseInt(number, 10).toString(2);
		}

		function handleKeepalive(bytes, data){
			var tempHex = ("0" + bytes[1].toString(16)).substr(-2) + ("0" + bytes[2].toString(16)).substr(-2);
			var tempDec = parseInt(tempHex, 16);
			var temperatureValue = calculateTemperature(tempDec);
			var humidityValue = calculateHumidity(bytes[3]);
			var batteryTmp = ("0" + bytes[4].toString(16)).substr(-2)[0];
			var batteryVoltageCalculated = 2 + parseInt("0x" + batteryTmp, 16) * 0.1;
			var temperature = temperatureValue;
			var humidity = humidityValue;
			var batteryVoltage = batteryVoltageCalculated;
			var thermistorProperlyConnected = decbin(bytes[5])[5] == 0;

			var extT1 = ("0" + bytes[5].toString(16)).substr(-2)[1];

			var extT2 = ("0" + bytes[6].toString(16)).substr(-2);
			var extThermistorTemperature = 0;
			if(thermistorProperlyConnected){
				extThermistorTemperature = parseInt("0x"+extT1+""+extT2, 16) * 0.1;
			}

			data.sensorTemperature = Number(temperature.toFixed(2));
			data.relativeHumidity = Number(humidity.toFixed(2));
			data.batteryVoltage = Number(batteryVoltage.toFixed(2));
			data.thermistorProperlyConnected = thermistorProperlyConnected;
			data.extThermistorTemperature = extThermistorTemperature;
			return data;
		}
	
		function handleResponse(bytes, data){

		var commands = bytes.map(function(byte){
			return ("0" + byte.toString(16)).substr(-2); 
		});
		commands = commands.slice(0,-7);
		var command_len = 0;
	
		commands.map(function (command, i) {
			switch (command) {
				case '04':
					{
						command_len = 2;
						var hardwareVersion = commands[i + 1];
						var softwareVersion = commands[i + 2];
						data.deviceVersions = { hardware: Number(hardwareVersion), software: Number(softwareVersion) };
					}
				break;
				case '12':
					{
						command_len = 1;
						data.keepAliveTime = parseInt(commands[i + 1], 16);
					}
				break;
				case '19':
					{
						command_len = 1;
						var commandResponse = parseInt(commands[i + 1], 16);
						var periodInMinutes = commandResponse * 5 / 60;
						data.joinRetryPeriod =  periodInMinutes;
					}
				break;
				case '1b':
					{
						command_len = 1;
						data.uplinkType = parseInt(commands[i + 1], 16) ;
					}
				break;
				case '1d':
					{
						command_len = 2;
						var deviceKeepAlive = 5;
						var wdpC = commands[i + 1] == '00' ? false : commands[i + 1] * deviceKeepAlive + 7;
						var wdpUc = commands[i + 2] == '00' ? false : parseInt(commands[i + 2], 16);
						data.watchDogParams= { wdpC: wdpC, wdpUc: wdpUc } ;
					}
				break;
				default:
					break;
			}
			commands.splice(i,command_len);
		});
		return data;
		}
		if (bytes[0] == 1) {
			data = handleKeepalive(bytes, data);

		}else{
			data = handleResponse(bytes,data);
			bytes = bytes.slice(-7);
			data = handleKeepalive(bytes, data);
		}
		return {data: data};
	} catch (e) {
		throw new Error(e);
	}
}
