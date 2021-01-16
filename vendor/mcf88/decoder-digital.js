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

function parseDigitalData(payload) {
    const uplinkId = payload.substring(0, 2);
    if (uplinkId.toUpperCase() === '10') {
        var m = [];

        var payloadToByteArray = hexStringToByteArray(payload);
        var type = payloadToByteArray[1];

        var numberOfBytes = 2;
        switch (type) {
            case 0x00:
                numberOfBytes = 2;
                break;
            case 0x01:
                numberOfBytes = 6;
                break;
            case 0x02:
                numberOfBytes = 6;
                break;
        }

        var count = 0;
        for (var i = 2; count <= 16 && i + numberOfBytes - 1 < payloadToByteArray.length; i += numberOfBytes) {
            switch (type) {
                case 0x00:
                    count++;

                    const measure1 = {
                        variable: 'measure',
                        value: Number(count).toFixed()
                    };
                    const counter1 = {
                        variable: 'counter',
                        value: Number(((payloadToByteArray[i + 1] & 0xFF) << 8) + payloadToByteArray[i]).toFixed()
                    };

                    m.push(measure1, counter1);
                    break;
                case 0x01:
                    count++;
                    const detection1 = payloadToByteArray.slice(i, i + numberOfBytes);

                    const measure2 = {
                        variable: 'measure',
                        value: Number(count).toFixed()
                    };
                    const date1 = {
                        variable: 'date',
                        value: parseDateByte(detection1.slice(0, 4))
                    };
                    const frequency = {
                        variable: 'frequency',
                        value: Number(((detection1[4] & 0x000000FF) + ((detection1[5] << 8) & 0x0000FF00)) / 10.0).toFixed(2),
                        unit: 'Hz'
                    };

                    m.push(measure2, date1, frequency);
                    break;
                case 0x02:
                    count++;
                    const detection2 = payloadToByteArray.slice(i, i + numberOfBytes);

                    const measure3 = {
                        variable: 'measure',
                        value: Number(count).toFixed()
                    };
                    const date2 = {
                        variable: 'date',
                        value: parseDateByte(detection2.slice(0, 4))
                    };
                    const counter2 = {
                        variable: 'counter',
                        value: Number(detection2[4] & 0x000000FF + ((detection2[5] << 8) & 0x0000FF00)).toFixed()
                    };

                    m.push(measure3, date2, counter2);
                    break;
            }
        }

        return m;
    } else {
        return null;
    }
}

function parseIO(payload) {
    const uplinkId = payload.substring(0, 2);
    if (uplinkId.toUpperCase() === '0A') {
        const date = {
            variable: 'date',
            value: parseDate(payload.substring(2, 10))
        };

        var firstByte = [];
        var secondByte = [];
        var thirdByte = [];
        var fourthByte = [];

        var k = 0;
        for (var i = 0; i < 3; i++) {
            firstByte[i] = parseInt(payload.substring(k + 10, k + 10 + 2), 16);
            secondByte[i] = parseInt(payload.substring(k + 10 + 2, k + 10 + 4), 16);
            thirdByte[i] = parseInt(payload.substring(k + 10 + 4, k + 10 + 6), 16);
            fourthByte[i] = parseInt(payload.substring(k + 10 + 6, k + 10 + 8), 16);

            k = k + 8;
        }

        const inputStatus8_1 = {
            variable: 'inputStatus8_1',
            value: firstByte[0].toString(2)
        };
        const inputStatus9_16 = {
            variable: 'inputStatus9_16',
            value: secondByte[0].toString(2)
        };
        const inputStatus17_24 = {
            variable: 'inputStatus17_24',
            value: thirdByte[0].toString(2)
        };
        const inputStatus25_32 = {
            variable: 'inputStatus25_32',
            value: fourthByte[0].toString(2)
        };

        const outputStatus8_1 = {
            variable: 'outputStatus8_1',
            value: firstByte[1].toString(2)
        };
        const outputStatus9_16 = {
            variable: 'outputStatus9_16',
            value: secondByte[1].toString(2)
        };
        const outputStatus17_24 = {
            variable: 'outputStatus17_24',
            value: thirdByte[1].toString(2)
        };
        const outputStatus25_32 = {
            variable: 'outputStatus25_32',
            value: fourthByte[1].toString(2)
        };

        const inputTrigger8_1 = {
            variable: 'inputTrigger8_1',
            value: firstByte[2].toString(2)
        };
        const inputTrigger9_16 = {
            variable: 'inputTrigger9_16',
            value: secondByte[2].toString(2)
        };
        const inputTrigger17_24 = {
            variable: 'inputTrigger17_24',
            value: thirdByte[2].toString(2)
        };
        const inputTrigger25_32 = {
            variable: 'inputTrigger25_32',
            value: fourthByte[2].toString(2)
        };

        return [
            date,
            inputStatus8_1,
            inputStatus9_16,
            inputStatus17_24,
            inputStatus25_32,
            outputStatus8_1,
            outputStatus9_16,
            outputStatus17_24,
            outputStatus25_32,
            inputTrigger8_1,
            inputTrigger9_16,
            inputTrigger17_24,
            inputTrigger25_32
        ];
    } else {
        return null;
    }
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

function hexStringToByteArray(s) {
    for (var bytes = [], c = 0; c < s.length; c += 2) {
        bytes.push(parseInt(s.substr(c, 2), 16));
    }
    return bytes;
}

function parseDateByte(payload) {
    var date = new Date();

    var binary = (payload[0] & 0xFF) + ((payload[1] << 8) & 0xFF00) + ((payload[2] << 16) & 0xFF0000) + ((payload[3] << 24) & 0xFF000000);
    var second = binary & 0x1F;
    second *= 2;
    binary = binary >> 5;
    var minute = binary & 0x3F;
    binary = binary >> 6;
    var hour = binary & 0x1F;
    binary = binary >> 5;
    var day = binary & 0x1F;
    binary = binary >> 5;
    var month = binary & 0x0F;
    binary = binary >> 4;
    var year = binary & 0x7F;
    year += 2000;

    date = new Date(year, month - 1, day, hour, minute, second, 0).toLocaleString();
    return date;
}


