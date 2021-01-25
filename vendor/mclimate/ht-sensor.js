var calculateTemperature = function (rawData){return (rawData - 400) / 10};
var calculateHumidity = function(rawData){return (rawData * 100) / 256};
function decodeUplink(hexData){
    var data = hexData;
    var tempHex = '0' + data[1].toString(16) + data[2].toString(16);
    var tempDec = parseInt(tempHex, 16);
    var temperatureValue = calculateTemperature(tempDec);
    var humidityValue = calculateHumidity(data[3]);
    var batteryTmp = ("0" + data[4].toString(16)).substr(-2)[0];
    var batteryVoltageCalculated = 2 + parseInt("0x" + batteryTmp, 16) * 0.1;
    var reason = data[0];
    var temperature = temperatureValue;
    var humidity = humidityValue;
    var batteryVoltage = batteryVoltageCalculated;
    // check if it is a keepalive
    if (reason == 1) {
        return {
            reason: 'keepalive',
            temperature: temperature,
            humidity:humidity,
            batteryVoltage: batteryVoltage
        }
    }
}