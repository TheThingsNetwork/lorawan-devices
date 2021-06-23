function decodeUplink(input) {
	var bytes = input.bytes;
    var deviceData;
    function merge_obj(obj1,obj2){
        var obj3 = {};
        for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
        for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
        return obj3;
    }
    var hexData = bytes.map(function (byte) {
        var number = parseInt(byte).toString(16);
        if( (number.length % 2) > 0) { number= "0" + number }
        return number;
    });

    toBool = function (value) { return value == '1'};
    function handleKeepAliveData(bytes){
        tmp = ("0" + bytes[6].toString(16)).substr(-2);
        motorRange1 = tmp[1];
        motorRange2 = ("0" + bytes[5].toString(16)).substr(-2);
        motorRange = parseInt("0x"+ motorRange1 + motorRange2, 16);

        motorPos2 = ("0" + bytes[4].toString(16)).substr(-2);
        motorPos1 = tmp[0];
        motorPosition = parseInt("0x"+ motorPos1 + motorPos2, 16);

        batteryTmp = ("0" + bytes[7].toString(16)).substr(-2)[0];
        batteryVoltageCalculated = 2 + parseInt("0x"+ batteryTmp , 16) * 0.1;
         decbin = function (number) {
           if (number < 0) {
               number = 0xFFFFFFFF + number + 1;
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
            sensorTemperature: (bytes[2] * 165) / 256 - 40,
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
       }
    }
   if (bytes[0] == 1) {
        deviceData = merge_obj(deviceData, handleKeepAliveData(bytes));
        return deviceData;  
   } else {
        // parse command answers
        var data = commandsReadingHelper(deviceData, String(hexData).split(",").join(""), 18);
        deviceData = merge_obj(deviceData,data);

        // get only keepalive from device response
        var keepaliveData = String(hexData).split(",").join("").slice(-18);
        var dataToPass = keepaliveData.match(/.{1,2}/g).map(function (byte) { return parseInt(byte, 16) });

        deviceData = merge_obj(deviceData, handleKeepAliveData(dataToPass));
        return deviceData;
    }

function commandsReadingHelper(deviceData, hexData, payloadLength) {
    var resultToPass = {};
    var data = hexData.slice(0, -payloadLength);
    var commands = data.match(/.{1,2}/g);

    commands.map(function (command, i) {
        switch (command) {
            case '15':
                {
                    try {
                        var data = { temperatureRangeSettings: { min: parseInt(commands[i + 1], 16), max: parseInt(commands[i + 2], 16) } };
                        resultToPass = merge_obj(resultToPass,data);
                    } catch (e) {
                        // console.log(e)
                    }
                }
                break;

            case '14':
                {
                    try {
                        var data = { childLock: toBool(parseInt(commands[i + 1], 16)) };
                        resultToPass = merge_obj(resultToPass,data);
                    } catch (e) {
                        // console.log(e)
                    }
                }
                break;

            case '12':
                {
                    try {
                        var data = { keepAliveTime: parseInt(commands[i + 1], 16) };
                        resultToPass = merge_obj(resultToPass,data);
                    } catch (e) {
                        // console.log(e)
                    }
                }
                break;

            case '13':
                {
                    try {
                        var enabled = toBool(parseInt(commands[i + 1], 16));
                        var duration = parseInt(commands[i + 2], 16) * 5;
                        var tmp = ("0" + commands[i + 4].toString(16)).substr(-2);
                        var motorPos2 = ("0" + commands[i + 3].toString(16)).substr(-2);
                        var motorPos1 = tmp[0];
                        var motorPosition = parseInt('0x' + motorPos1 + motorPos2, 16);
                        var delta = Number(tmp[1]);

                        var data = { openWindowParams: { enabled: enabled, duration: duration, motorPosition: motorPosition, delta: delta } };
                        resultToPass = merge_obj(resultToPass,data);
                    } catch (e) {
                        // console.log(e)
                    }
                }
                break;

            case '18':
                {
                    try {
                        var data = { operationalMode: commands[i + 1].toString() };
                        resultToPass = merge_obj(resultToPass,data);
                    } catch (e) {
                        // console.log(e)
                    }
                }
                break;

            case '16':
                {
                    try {
                        var data = { internalAlgoParams: { period: parseInt(commands[i + 1], 16), pFirstLast: parseInt(commands[i + 2], 16), pNext: parseInt(commands[i + 3], 16) } };
                        resultToPass = merge_obj(resultToPass,data);
                    } catch (e) {
                        // console.log(e)
                    }
                }
                break;

            case '17':
                {
                    try {
                        var data = { internalAlgoTdiffParams: { warm: parseInt(commands[i + 1], 16), cold: parseInt(commands[i + 2], 16) } };
                        resultToPass = merge_obj(resultToPass,data);
                    } catch (e) {
                        // console.log(e)
                    }
                }
                break;

            case '1b':
                {
                    try {
                        var data = { uplinkType: commands[i + 1] };
                        resultToPass = merge_obj(resultToPass,data);
                    } catch (e) {
                        // console.log(e)
                    }
                }
                break;

            case '19':
                {
                    try {
                        var commandResponse = parseInt(commands[i + 1], 16);
                        var periodInMinutes = commandResponse * 5 / 60;
                        var data = { joinRetryPeriod: periodInMinutes };
                        resultToPass = merge_obj(resultToPass,data);
                    } catch (e) {
                        // console.log(e)
                    }
                }
                break;

            case '1d':
                {
                    try {
                        // get default keepalive if it is not available in data
                        var deviceKeepAlive = deviceData.keepAliveTime ? deviceData.keepAliveTime : 5;
                        var wdpC = commands[i + 1] == '00' ? false : commands[i + 1] * deviceKeepAlive + 7;
                        var wdpUc = commands[i + 2] == '00' ? false : parseInt(commands[i + 2], 16);
                        var data = { watchDogParams: { wdpC: wdpC, wdpUc: wdpUc } };
                        resultToPass = merge_obj(resultToPass,data);
                    } catch (e) {
                        // console.log(e)
                    }
                }
                break;

            case '04':
                {
                    try {
                        var hardwareVersion = commands[i + 1];
                        var softwareVersion = commands[i + 2];
                        var data = { deviceVersions: { hardware: Number(hardwareVersion), software: Number(softwareVersion) } };
                        
                        resultToPass = merge_obj(resultToPass,data);

                    } catch (e) {
                        // console.log(e)
                    }
                }
                break;

            default:
                break;
        }
    });

    return resultToPass;
};

 }
