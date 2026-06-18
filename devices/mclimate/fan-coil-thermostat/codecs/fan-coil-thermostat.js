function decodeUplink(input) {
    try {
        var bytes = input.bytes;
        var data = {};
        const toBool = value => value == '1';
        var calculateTemperature = function (rawData) { return (rawData - 400) / 10 };
        var calculateHumidity = function (rawData) { return (rawData * 100) / 256 };
        var decbin = function (number) {
            if (number < 0) {
                number = 0xFFFFFFFF + number + 1
            }
            number = number.toString(2);
            return "00000000".substr(number.length) + number;
        }
        function handleKeepalive(bytes, data) {
            var tempDec = parseInt(`${decbin(bytes[1])}${decbin(bytes[2])}`, 2);
            var temperatureValue = calculateTemperature(tempDec);
            var humidityValue = calculateHumidity(bytes[3]);
            var targetTemperature = parseInt(`${decbin(bytes[4])}${decbin(bytes[5])}`, 2) / 10;
            var operationalMode = bytes[6];
            var displayedFanSpeed = bytes[7];
            var actualFanSpeed = bytes[8];
            var valveStatus = bytes[9];
            var deviceStatus = bytes[10];

            data.sensorTemperature = Number(temperatureValue.toFixed(2));
            data.relativeHumidity = Number(humidityValue.toFixed(2));
            data.targetTemperature = targetTemperature;
            data.operationalMode = operationalMode;
            data.displayedFanSpeed = displayedFanSpeed;
            data.actualFanSpeed = actualFanSpeed;
            data.valveStatus = valveStatus;
            data.deviceStatus = deviceStatus;
            return data;
        }

        function handleResponse(bytes, data) {
            var commands = bytes.map(function (byte) {
                return ("0" + byte.toString(16)).substr(-2);
            });
            commands = commands.slice(0, -11);
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
                    case '05':
                        {
                            command_len = 1;
                            data.targetTemperatureStep = parseInt(commands[i + 1], 16) / 10
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
                            data.keysLock = toBool(parseInt(commands[i + 1], 16));
                        }
                        break;
                    case '15':
                        {
                            command_len = 2;
                            data.temperatureRangeSettings = { min: parseInt(commands[i + 1], 16), max: parseInt(commands[i + 2], 16) };
                        }
                        break;
                    case '19':
                        {
                            command_len = 1;
                            var commandResponse = parseInt(commands[i + 1], 16);
                            var periodInMinutes = commandResponse * 5 / 60;
                            data.joinRetryPeriod = periodInMinutes;
                        }
                        break;
                    case '1b':
                        {
                            command_len = 1;
                            data.uplinkType = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '1d':
                        {
                            command_len = 2;
                            var deviceKeepAlive = 5;
                            var wdpC = commands[i + 1] == '00' ? false : commands[i + 1] * deviceKeepAlive + 7;
                            var wdpUc = commands[i + 2] == '00' ? false : parseInt(commands[i + 2], 16);
                            data.watchDogParams = { wdpC: wdpC, wdpUc: wdpUc };
                        }
                        break;
                    case '2f':
                        {
                            command_len = 1;
                            data.targetTemperature = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '30':
                        {
                            command_len = 1;
                            data.manualTargetTemperatureUpdate = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '32':
                        {
                            command_len = 1;
                            data.valveOpenCloseTime = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '34':
                        {
                            command_len = 1;
                            data.displayRefreshPeriod = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '36':
                        {
                            command_len = 1;
                            data.extAutomaticTemperatureControl = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '3e':
                        {
                            command_len = 2;
                            data.extSensorTemperature = parseInt(`${commands[i + 1]}${commands[i + 2]}`, 16);
                        }
                        break;
                    case '41':
                        {
                            command_len = 1;
                            data.currentTemperatureVisibility = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '43':
                        {
                            command_len = 1;
                            data.humidityVisibility = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '45':
                        {
                            command_len = 1;
                            data.fanSpeed = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '47':
                        {
                            command_len = 1;
                            data.fanSpeedLimit = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '49':
                        {
                            command_len = 2;
                            data.ecmVoltageRange = { min: parseInt(commands[i + 1], 16) / 10, max: parseInt(commands[i + 2], 16) / 10 };
                        }
                        break;
                    case '4b':
                        {
                            command_len = 1;
                            data.ecmStartUpTime = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '4d':
                        {
                            command_len = 1;
                            data.ecmRelay = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '4f':
                        {
                            command_len = 1;
                            data.frostProtection = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '51':
                        {
                            command_len = 2;
                            data.frostProtectionSettings = { threshold: parseInt(commands[i + 1], 16), setpoint: parseInt(commands[i + 2], 16) };
                        }
                        break;
                    case '55':
                        {
                            command_len = 1;
                            data.allowedOperationalModes = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '57':
                        {
                            command_len = 1;
                            data.coolingSetpointNotOccupied = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '59':
                        {
                            command_len = 1;
                            data.heatingSetpointNotOccupied = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '5b':
                        {
                            command_len = 2;
                            data.tempSensorCompensation = { compensation: parseInt(commands[i + 1], 16), temperature: parseInt(commands[i + 2], 16) };
                        }
                        break;
                    case '5d':
                        {
                            command_len = 1;
                            data.fanSpeedNotOccupied = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '5f':
                        {
                            command_len = 1;
                            data.automaticChangeover = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '61':
                        {
                            command_len = 1;
                            data.wiringDiagram = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '63':
                        {
                            command_len = 1;
                            data.occFunction = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '65':
                        {
                            command_len = 2;
                            data.automaticChangeoverThreshold = { coolingThreshold: parseInt(commands[i + 1], 16), heatingThreshold: parseInt(commands[i + 2], 16) };
                        }
                        break;
                    case '69':
                        {
                            command_len = 1;
                            data.returnOfPowerOperation = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '6b':
                        {
                            command_len = 1;
                            data.deltaTemperature1 = parseInt(commands[i + 1], 16) / 10;
                        }
                        break;
                    case '6d':
                        {
                            command_len = 2;
                            data.deltaTemperature2and3 = { deltaTemperature2: parseInt(commands[i + 1], 16) * 10, deltaTemperature3: parseInt(commands[i + 2], 16) * 10 };
                        }
                        break;
                    case '6e':
                        {
                            command_len = 1;
                            data.frostProtectionStatus = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '70':
                        {
                            command_len = 1;
                            data.occupancySensorStatusSetPoint = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '71':
                        {
                            command_len = 1;
                            data.occupancySensorStatus = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '72':
                        {
                            command_len = 1;
                            data.dewPointSensorStatus = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '73':
                        {
                            command_len = 1;
                            data.filterAlarm = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '74':
                        {
                            command_len = 2;
                            data.automaticChangeoverMode = { ntcTemperature: parseInt(commands[i + 1], 16), automaticChangeover: parseInt(commands[i + 2], 16) };
                        }
                        break;
                    case '75':
                        {
                            command_len = 1;
                            data.powerModuleStatus = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case 'a0':
                        {
                            command_len = 4;
                            let fuota_address = parseInt(`${commands[i + 1]}${commands[i + 2]}${commands[i + 3]}${commands[i + 4]}`, 16)
                            let fuota_address_raw = `${commands[i + 1]}${commands[i + 2]}${commands[i + 3]}${commands[i + 4]}`
                            data.fuota = { fuota_address, fuota_address_raw };
                        }
                        break;
                    default:
                        break;
                }
                commands.splice(i, command_len);
            });
            return data;
        }
        if (bytes[0] == 1) {
            data = handleKeepalive(bytes, data);
        } else {
            data = handleResponse(bytes, data);
            bytes = bytes.slice(-11);
            data = handleKeepalive(bytes, data);
        }
        return { data: data };
    } catch (e) {
        throw new Error('Unhandled data');
    }
}