function decodeUplink(payload) {
    payload = TTNfrom(payload);

    const uplinkId = payload.substring(0, 2);
    var content;
    switch (uplinkId.toUpperCase()) {
        case '01':
            content = parseTimeSync(payload.trim());
            break;
        case '04':
            content = parseTER(payload.trim());
            break;
        case '09':
            content = parseMetering(payload.trim());
            break;
        case '10':
            content = parseDigitalData(payload.trim());
            break;
        case '12':
            content = parseVOC(payload.trim(), true); //true is for new sensor
            break;
        case '13':
            content = parseCo2(payload.trim(), true); //true is for new sensor
            break;
        case '0A':
            content = parseIO(payload.trim());
            break;
        case '0B':
            content = parseReportData(payload.trim());
            break;
        case '0C':
            content = parseVOC(payload.trim(), false); //false is for new sensor
            break;
        case '0D':
            content = parseAnalog(payload.trim());
            break;
        case '0E':
            content = parseCo2(payload.trim(), false); //false is for new sensor
            break;
        default:
            content = null;
            break;
    }

    return TTNto(content);
}

function TTNfrom(TTNpayload) {
    let obj = JSON.parse(TTNpayload);

    let fPort = obj.fPort;

    var payload = '';
    for (i = 0; i < obj.bytes.length; i++) {
        payload += parseInt(obj.bytes[i], 10).toString(16).padStart(2, '0');
    }
    return payload;
}

function TTNto(content) {
    let TTNcontent = {};

    if (content !== null) {
        for (i = 0; i < content.length; i++) {
            TTNcontent[content[i].variable] = content[i].value;
        }
        return {
            data: TTNcontent
        };
    } else {
        return {
            data: content,
            warnings: [],
            errors: ["Error on deconding payload"]
        };
    }
}

function parseReportData(payload) {
    const uplinkId = payload.substring(0, 2);
    var content;
    if (uplinkId.toUpperCase() === '0B') {
        switch (payload.substring(2, 3)) {
            case '1':
            case '4':
                content = parseModBus(payload);
                break;
            case '2':
                switch (payload.substring(4, 6)) {
                    case '00':
                        content = parseWeather(payload);
                        break;
                    case '01':
                        content = parsePM(payload);
                        break;
                    default:
                        content = null;
                        break;
                }
                break;
            case '3':
                content = parseTERPM(payload);
                break;
            default:
                content = null;
                break;
        }
    } else {
        return null;
    }
    return content;
}

function parseModBus(payloads) {
    var splitted = payloads.split('\n'); //payloads must be on diffrent lines or change the \n split character

    var m = [];
    var dP = '';

    for (var i = 0; i < splitted.length; i++) {
        var payload = splitted[i];
        const uplinkId = payload.substring(0, 2);
        if (uplinkId.toUpperCase() === '0B') {
            var payloadToByteArray = hexStringToByteArray(payload);
            payloadToByteArray = payloadToByteArray.slice(2);
            if (payload.substring(2, 3) === '1' || payload.substring(2, 3) === '4') {
                var id = Number(payloadToByteArray[0]).toFixed();

                const frameId = {
                    variable: 'frameId',
                    value: id
                };

                if (payload.length === 12) {
                    var e = '';
                    switch (payload.substring(10, 12).toUpperCase()) {
                        case '05':
                            e = 'Configuration error';
                            break;
                        case '07':
                            e = 'Error reading internal configuration';
                            break;
                        case '7F':
                            e = 'Command not implemented';
                            break;
                        case 'CC':
                            e = 'Communication error';
                            break;
                    }

                    const error = {
                        variable: 'error',
                        value: e
                    };

                    m.push(...[
                        frameId,
                        error
                    ]
                            );
                } else {
                    var d = id === '0' ? payload.substring(10) : payload.substring(6);
                    const data = {
                        variable: 'data',
                        value: d
                    };

                    dP += d;

                    if (id === '0') {//length is declared only on first payload
                        const length = {
                            variable: 'length',
                            value: Number(payloadToByteArray[2] << 8 & 0x0000FF00 | payloadToByteArray[1] & 0x000000FF).toFixed()
                        };

                        m.push(...[
                            frameId,
                            length,
                            data
                        ]
                                );
                    } else {
                        m.push(...[
                            frameId,
                            data
                        ]
                                );
                    }
                }
            }
        }
    }

    const dataPayload = {
        variable: 'dataPayload',
        value: dP
    };

    return [
        ...m,
        dataPayload
    ];
}

function parsePM(payload) {
    const uplinkId = payload.substring(0, 2);
    if (uplinkId.toUpperCase() === '0B') {
        var payloadToByteArray = hexStringToByteArray(payload);
        payloadToByteArray = payloadToByteArray.slice(3);
        if (payload.substring(2, 3) === '2' && payload.substring(4, 6) === '01') {
            const date = {
                variable: 'date',
                value: parseDate(payload.substring(6, 14))
            };

            const pm1 = {
                variable: 'pm1',
                value: Number((
                        payloadToByteArray[4] & 0xFF) +
                        ((payloadToByteArray[5] << 8) & 0xFF00)).toFixed(),
                unit: 'micro g/m3'
            };
            const pm25 = {
                variable: 'pm25',
                value: Number((
                        payloadToByteArray[6] & 0xFF) +
                        ((payloadToByteArray[7] << 8) & 0xFF00)).toFixed(),
                unit: 'micro g/m3'
            };
            const pm10 = {
                variable: 'pm10',
                value: Number((
                        payloadToByteArray[8] & 0xFF) +
                        ((payloadToByteArray[9] << 8) & 0xFF00)).toFixed(),
                unit: 'micro g/m3'
            };

            return [
                date,
                pm1,
                pm25,
                pm10
            ];
        } else {
            return null;
        }
    } else {
        return null;
    }
}

function parseTERPM(payload) {
    const uplinkId = payload.substring(0, 2);
    if (uplinkId.toUpperCase() === '0B') {
        var payloadToByteArray = hexStringToByteArray(payload);
        payloadToByteArray = payloadToByteArray.slice(3);
        if (payload.substring(2, 3) === '3' && payload.substring(4, 6) === '00') {
            const date = {
                variable: 'date',
                value: parseDate(payload.substring(6, 14))
            };

            const temperature = {
                variable: 'temperature',
                value: getTemperature(
                        payloadToByteArray[4],
                        payloadToByteArray[5]),
                unit: '�C'
            };
            const humidity = {
                variable: 'humidity',
                value: getHumidity(payloadToByteArray[6]),
                unit: '%'
            };
            const pressure = {
                variable: 'pressure',
                value: getPressure(
                        payloadToByteArray[7],
                        payloadToByteArray[8],
                        payloadToByteArray[9]),
                unit: 'hPa'
            };
            const pm1 = {
                variable: 'pm1',
                value: Number((
                        payloadToByteArray[10] & 0xFF) +
                        ((payloadToByteArray[11] << 8) & 0xFF00)).toFixed(),
                unit: 'micro g/m3'
            };
            const pm25 = {
                variable: 'pm25',
                value: Number((
                        payloadToByteArray[12] & 0xFF) +
                        ((payloadToByteArray[13] << 8) & 0xFF00)).toFixed(),
                unit: 'micro g/m3'
            };
            const pm10 = {
                variable: 'pm10',
                value: Number((
                        payloadToByteArray[14] & 0xFF) +
                        ((payloadToByteArray[15] << 8) & 0xFF00)).toFixed(),
                unit: 'micro g/m3'
            };

            if (payload.length <= 38) {
                return [
                    date,
                    temperature,
                    humidity,
                    pressure,
                    pm1,
                    pm25,
                    pm10
                ];
            } else {
                const battery = {
                    variable: 'battery',
                    value: Number(parseInt(payloadToByteArray[16])).toFixed(),
                    unit: '%'
                };

                return [
                    date,
                    temperature,
                    humidity,
                    pressure,
                    pm1,
                    pm25,
                    pm10,
                    battery
                ];
            }
        } else {
            return null;
        }
    } else {
        return null;
    }
}

function parseWeather(payload) {
    const uplinkId = payload.substring(0, 2);
    if (uplinkId.toUpperCase() === '0B') {
        var payloadToByteArray = hexStringToByteArray(payload);
        payloadToByteArray = payloadToByteArray.slice(3);
        if (payload.substring(2, 3) === '2' && payload.substring(4, 6) === '00') {
            const pressure = {
                variable: 'pressure',
                value: getAtmosphericPressure((
                        payloadToByteArray[3] << 8 & 0x0000FF00 |
                        payloadToByteArray[2] & 0x000000FF) / 1000.0),
                unit: 'hPa'
            };
            const outsideTemperature = {
                variable: 'outsideTemperature',
                value: getFahrenheitToCelsius((
                        payloadToByteArray[5] << 8 & 0x0000FF00 |
                        payloadToByteArray[4] & 0x000000FF) / 10.0),
                unit: '�C'
            };
            const windSpeed = {
                variable: 'windSpeed',
                value: getWindSpeed((
                        payloadToByteArray[6] & 0x00FF)),
                unit: 'm/s'
            };
            const tenMinutesAvgWindSpeed = {
                variable: 'tenMinutesAvgWindSpeed',
                value: getWindSpeed((
                        payloadToByteArray[7] & 0x00FF)),
                unit: 'm/s'
            };
            const windDirection = {
                variable: 'windDirection',
                value: Number(
                        payloadToByteArray[9] << 8 & 0x0000FF00 |
                        payloadToByteArray[8] & 0x000000FF).toFixed(2),
                unit: '�'
            };
            const outsideHumidity = {
                variable: 'outsideHumidity',
                value: Number(payloadToByteArray[10] & 0x00FF).toFixed(2),
                unit: '%'
            };
            const rainRate = {
                variable: 'rainRate',
                value: getRainRate((
                        payloadToByteArray[12] << 8 & 0x0000FF00 |
                        payloadToByteArray[11] & 0x000000FF)),
                unit: 'mm/h'
            };
            const uv = {
                variable: 'uv',
                value: Number(payloadToByteArray[13] & 0x00FF).toFixed(2)
            };
            const solarRadiation = {
                variable: 'solarRadiation',
                value: Number(
                        payloadToByteArray[15] << 8 & 0x0000FF00 |
                        payloadToByteArray[14] & 0x000000FF).toFixed(2),
                unit: 'W/m�'
            };
            const dayRain = {
                variable: 'dayRain',
                value: getRainRate((
                        payloadToByteArray[17] << 8 & 0x0000FF00 |
                        payloadToByteArray[16] & 0x000000FF))
            };
            const dayET = {
                variable: 'dayET',
                value: getET(
                        payloadToByteArray[19] << 8 & 0x0000FF00 |
                        payloadToByteArray[18] & 0x000000FF),
                unit: 'mm'
            };
            var soilMoistures = [];
            for (var i = 0; i < 4; i++) {
                const soilMoisture = {
                    variable: 'soilMoisture',
                    value: Number((payloadToByteArray[20 + i])).toFixed(2),
                    unit: 'centibar'
                };
                soilMoistures.push(soilMoisture);
            }
            var leafWetnesses = [];
            for (var i = 0; i < 4; i++) {
                const leafWetness = {
                    variable: 'leafWetness',
                    value: Number(payloadToByteArray[24 + i])
                };
                leafWetnesses.push(leafWetness);
            }
            const forecastIcons = {
                variable: 'forecastIcons',
                value: Number(payloadToByteArray[28]).toFixed()
            };
            const barTrend = {
                variable: 'barTrend',
                value: Number(payloadToByteArray[29]).toFixed(2)
            };
            return [
                pressure,
                outsideTemperature,
                windSpeed,
                tenMinutesAvgWindSpeed,
                windDirection,
                outsideHumidity,
                rainRate,
                uv,
                solarRadiation,
                dayRain,
                dayET,
                soilMoistures,
                leafWetnesses,
                forecastIcons,
                barTrend
            ];
        }
    } else {
        return null;
    }
}

function hexStringToByteArray(s) {
    for (var bytes = [], c = 0; c < s.length; c += 2) {
        bytes.push(parseInt(s.substr(c, 2), 16));
    }
    return bytes;
}

function getAtmosphericPressure(value) {
    var pressure = value * 33.863886666667;
    return Number(pressure).toFixed(2);
}

function getFahrenheitToCelsius(value) {
    var celsius = (value - 32) / 1.8;
    return Number(celsius).toFixed(2);
}

function getWindSpeed(value) {
    var windSpeed = value * 0.44704;
    return Number(windSpeed).toFixed(2);
}

function getRainRate(value) {
    var rainRate = value * 0.254;
    return Number(rainRate).toFixed(2);
}

function getET(value) {
    var et = value / 1000 * 25.4;
    return Number(et).toFixed(2);
}

function parseDate(payload) {
    var date = new Date();

    var binary = Number(parseInt(reverseBytes(payload), 16)).toString(2).padStart(32, '0');
    var year = parseInt(binary.substring(0, 7), 2) + 2000;
    var month = parseInt(binary.substring(7, 11), 2);
    var day = parseInt(binary.substring(11, 16), 2);
    var hour = parseInt(binary.substring(16, 21), 2);
    var minute = parseInt(binary.substring(21, 27), 2);
    var second = parseInt(binary.substring(27, 32), 2) * 2;

    date = new Date(year, month - 1, day, hour, minute, second, 0).toLocaleString();
    return date;
}

function getTemperature(lo, hi) {
    var temperature = String((((lo & 0xFF) + ((hi << 8) & 0xFF00)) << 16) >> 16).padStart(3);
    temperature = temperature.substring(0, temperature.length - 2) + "." + temperature.substring(temperature.length - 2);
    return Number(temperature).toFixed(2);
}

function getHumidity(lo) {
    var humidity = (((((0 & 0xFF) << 8) | (lo & 0xFF)) << 16) >> 16) / 2;
    return Number(humidity).toFixed(2);
}

function getPressure(lo, mi, hi) {
    var pressure = String((lo & 0xFF) + ((mi << 8) & 0xFF00) + ((hi << 16) & 0xFF0000)).padStart(3);
    pressure = pressure.substring(0, pressure.length - 2) + "." + pressure.substring(pressure.length - 2);
    return Number(pressure).toFixed(2);
}

function reverseBytes(bytes) {
    var reversed = bytes;
    if (bytes.length % 2 === 0) {
        reversed = "";
        for (var starting = 0; starting + 2 <= bytes.length; starting += 2) {
            reversed = bytes.substring(starting, starting + 2) + reversed;
        }
    }
    return reversed;
}


