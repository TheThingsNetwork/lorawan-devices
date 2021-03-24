function decodeUplink(input) {
    var bytes = input.bytes;
    var decbin = function(number) {
        return parseInt(number, 10).toString(2)
    }
    var byteArray = bytes.map(function (byte) {
        var number = decbin(byte);
        return Array(9 - number.length).join("0") + number;
    });
    var sAQI1 = byteArray[1].substr(0);
    var sAQI2 = byteArray[2].slice(0, 1);
    var p1 = byteArray[6];
    var p2 = byteArray[7].slice(0, 3);
    var t1 = byteArray[7].substr(4);
    var t2 = byteArray[8].slice(0, 6);
    return {data:{
        sAQI: parseInt('' + sAQI1 + sAQI2, 2) * 16,
        AQI: parseInt(byteArray[2].substring(1, 6), 2) * 16,
        CO2eq: parseInt('' + byteArray[2].slice(6, 8) + byteArray[3], 2) * 32,
        VOC: parseInt(byteArray[4], 2) * 4,
        relative_humidity: parseInt(byteArray[5], 2) * 4 / 10,
        pressure: (parseInt('' + p1 + p2, 2) * 40 + 30000) / 100,
        temperature: (parseInt('' + t1 + t2, 2) - 400) / 10,
        accuracy_aqi: parseInt(byteArray[8].substr(-2), 2),
        voltage: parseInt(byteArray[9], 2) * 8 + 1600
    }};
}