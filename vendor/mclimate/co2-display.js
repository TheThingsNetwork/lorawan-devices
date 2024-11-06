function decodeUplink(input) {
    try{
        var bytes = input.bytes;
        var data = {};
        const toBool = value => value == '1';
        var calculateTemperature = function (rawData){return (rawData - 400) / 10};
        var calculateHumidity = function(rawData){return (rawData * 100) / 256};
        var decbin = function (number) {
            if (number < 0) {
                number = 0xFFFFFFFF + number + 1
            }
            number = number.toString(2);
            return "00000000".substr(number.length) + number;
        }
        function handleKeepalive(bytes, data){
            var tempHex = '0' + bytes[1].toString(16) + bytes[2].toString(16);
            var tempDec = parseInt(tempHex, 16);
            var temperatureValue = calculateTemperature(tempDec);
            var humidityValue = calculateHumidity(bytes[3]);
            var batteryHex = '0' + bytes[4].toString(16) + bytes[5].toString(16);
            var batteryVoltageCalculated =  parseInt(batteryHex, 16)/1000;
            var temperature = temperatureValue;
            var humidity = humidityValue;
            var batteryVoltage = batteryVoltageCalculated;
            var ppmBin = decbin(bytes[6]);
            var ppmBin2 = decbin(bytes[7]);
            ppmBin = `${ppmBin2.slice(0,5)}${ppmBin}`
            var ppm = parseInt(ppmBin, 2);
            var powerSourceStatus = ppmBin2.slice(5,8);
            var lux = parseInt('0' + bytes[8].toString(16) + bytes[9].toString(16), 16);
            var pir = toBool(bytes[10]);
            data.sensorTemperature = Number(temperature.toFixed(2));
            data.relativeHumidity = Number(humidity.toFixed(2));
            data.batteryVoltage = Number(batteryVoltage.toFixed(3));
            data.ppm = ppm;
            data.powerSourceStatus = parseInt(powerSourceStatus,2);
            data.lux = lux;
            data.pir = pir;
            return data;
        }
    
        function handleResponse(bytes, data){
        var commands = bytes.map(function(byte){
            return ("0" + byte.toString(16)).substr(-2); 
        });
        commands = commands.slice(0,-11);
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
                case '14':
                    {
                        command_len = 1;
                        data.childLock = toBool(parseInt(commands[i + 1], 16)) ;
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
                case '1f':
                    {
                        command_len = 4;
                        var good_medium = parseInt(commands[i + 1] +'' + commands[i + 2], 16);
                        var medium_bad = parseInt(commands[i + 3] +'' + commands[i + 4], 16);
                        
                        data.boundaryLevels = { good_medium: Number(good_medium), medium_bad: Number(medium_bad) } ;
                    }
                break;
                case '21':
                    {
                        command_len = 2;
                        data.autoZeroValue = parseInt(commands[i + 1] +'' + commands[i + 2], 16);
                    }
                break;
                case '25':
                    {
                        
                        command_len = 3;
                        var good_zone = parseInt(commands[i + 1], 16);
                        var medium_zone = parseInt(commands[i + 2], 16);
                        var bad_zone = parseInt(commands[i + 3], 16);
                        
                        data.measurementPeriod = { good_zone: Number(good_zone), medium_zone: Number(medium_zone), bad_zone: Number(bad_zone) } ;
                    }
                break;
                case '2b':
                    {
                        command_len = 1;
                        data.autoZeroPeriod = parseInt(commands[i + 1], 16);
                    }
                break;
                case '34':
                    {
                        command_len = 1;
                        data.displayRefreshPeriod = parseInt(commands[i + 1], 16) ;
                    }
                break;
                case '3d':
                    {
                        command_len = 1;
                        data.pirSensorStatus = parseInt(commands[i + 1], 16) ;
                    }
                break;
                case '3f':
                    {
                        command_len = 1;
                        data.pirSensorSensitivity = parseInt(commands[i + 1], 16) ;
                    }
                break;
                case '41':
                    {
                        command_len = 1;
                        data.currentTemperatureVisibility = parseInt(commands[i + 1], 16) ;
                    }
                break;
                case '43':
                    {
                        command_len = 1;
                        data.humidityVisibility = parseInt(commands[i + 1], 16) ;
                    }
                break;
                case '45':
                    {
                        command_len = 1;
                        data.lightIntensityVisibility = parseInt(commands[i + 1], 16) ;
                    }
                break;
                case '47':
                    {
                        command_len = 1;
                        data.pirInitPeriod = parseInt(commands[i + 1], 16) ;
                    }
                break;
                case '49':
                    {
                        command_len = 1;
                        data.pirMeasurementPeriod = parseInt(commands[i + 1], 16) ;
                    }
                break;
                case '4b':
                    {
                        command_len = 1;
                        data.pirCheckPeriod = parseInt(commands[i + 1], 16) ;
                    }
                break;
                case '4d':
                    {
                        command_len = 1;
                        data.pirBlindPeriod = parseInt(commands[i + 1], 16) ;
                    }
                break;
                case '80':
                    {
                        command_len = 1;
                        data.measurementBlindTime = parseInt(commands[i + 1], 16) ;
                    }
                break;
                case '83':
                    {
                        command_len = 1;
                        var bin = decbin(parseInt(commands[i + 1], 16));
                        var chart = Number(bin[5]);
                        var digital_value = Number(bin[6]);
                        var emoji = Number(bin[7]);
                        data.imagesVisibility = { chart, digital_value, emoji } ;
                    }
                    break;
                case 'a0':
                    {
                        command_len = 4;
                        var fuota_address = parseInt(`${commands[i + 1]}${commands[i + 2]}${commands[i + 3]}${commands[i + 4]}`, 16)
                        var fuota_address_raw = `${commands[i + 1]}${commands[i + 2]}${commands[i + 3]}${commands[i + 4]}`
                        data.fuota = { fuota_address, fuota_address_raw };
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
            bytes = bytes.slice(-11);
            data = handleKeepalive(bytes, data);
        }
        return {data: data};
    } catch (e) {
        throw new Error('Unhandled data');
    }
}