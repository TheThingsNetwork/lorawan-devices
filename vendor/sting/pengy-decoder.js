function getEAQI(pm1, pm25, pm10) {
    var eaqi = "NaN";
    if (pm25 >= 75 || pm10 >= 150) { eaqi = "Extremely poor" } else  
    if (pm25 >= 50 && pm25 < 75 || pm10 >= 100 && pm10 < 150) { eaqi = "Very poor" } else
    if (pm25 >= 25 && pm25 < 50 || pm10 >= 50 && pm10 < 100) { eaqi = "Poor" } else
    if (pm25 >= 20 && pm25 < 25 || pm10 >= 40 && pm10 < 50) { eaqi = "Moderate" } else
    if (pm25 >= 10 && pm25 < 20 || pm10 >= 20 && pm10 < 40) { eaqi = "Fair" } else
    if (pm25 >= 0 && pm25 < 10 || pm10 >= 0 && pm10 < 20) { eaqi = "Good" } else { eaqi = "Unknown" };
    return eaqi;
}

function decodeUplink(input) {
    var bytes = input.bytes;

    var data = {};
    var warnings = [];

    // firmware version 1.0
    // firmware version 1.5
    if (input.fPort == 1 || input.fPort == 2) {
        var hum = bytes[0] << 8 | bytes[1]; hum = 0.1 * hum; hum = Number(hum.toFixed(1));
        var tem = bytes[2] << 24 >> 16 | bytes[3]; tem = 0.1 * tem; tem = Number(tem.toFixed(1));
        var rpm = bytes[4] << 8 | bytes[5]; rpm = 0.1 * rpm; rpm = Number(rpm.toFixed(0));
        var fpm = bytes[6] << 8 | bytes[7]; fpm = 0.1 * fpm; fpm = Number(fpm.toFixed(0));

        if (hum > 100.0) {
            warnings.push("Humidity out of range (" + hum + ")");
            hum = 100.0;
        }

        if (hum < 0.0 || hum > 100.0) hum = null;
        if (tem < -50.0 || tem > 100.0) tem = null;
        if (rpm < 0 || rpm > 5000) rpm = null;
        if (fpm < 0 || fpm > 5000) fpm = null;

        data.Humidity = hum;
        data.Temperature = tem;
        data.FPM = fpm;
        data.RPM = rpm;

        data.EAQI = getEAQI(null, fpm, rpm);

        data.Version = "1.0";
    }

    // firmware version 1.5
    if (input.fPort == 2) {
        var pre = bytes[8] << 8 | bytes[9]; pre = Number(pre.toFixed(0));
        var co = bytes[10] << 8 | bytes[11]; co = 1.0 * co; co = Number(co.toFixed(0));
        var nh3 = bytes[12] << 8 | bytes[13]; nh3 = 1.0 * nh3; nh3 = Number(nh3.toFixed(0));
        var no2 = bytes[14] << 8 | bytes[15]; no2 = 0.01 * no2; no2 = Number(no2.toFixed(2));
        var noise = bytes[16] << 8 | bytes[17]; noise = 0.01 * noise; noise = Number(noise.toFixed(2));

        if (pre < 0.0 || pre > 1000000.0) pre = null;
        if (co < 0.0 || co > 10000) co = null;
        if (nh3 < 0.0 || nh3 > 10000) nh3 = null;
        if (no2 < 0.0 || no2 > 10000) no2 = null;

        data.Pressure = pre;
        data.CO = co;
        data.NH3 = nh3;
        data.NO2 = no2;
        data.Noise = noise;

        data.Version = "1.5";
    }

    // firmware version 2.0
    if (input.fPort == 3) {
        var hum = bytes[0] << 8 | bytes[1]; hum = 0.1 * hum; hum = Number(hum.toFixed(1));
        var tem = bytes[2] << 24 >> 16 | bytes[3]; tem = 0.1 * tem; tem = Number(tem.toFixed(1));
        var pre = bytes[4] << 8 | bytes[5]; pre = Number(pre.toFixed(0));

        var pm1 = bytes[6] << 8 | bytes[7]; pm1 = 0.1 * pm1; pm1 = Number(pm1.toFixed(0));
        var pm25 = bytes[8] << 8 | bytes[9]; pm25 = 0.1 * pm25; pm25 = Number(pm25.toFixed(0));
        var pm10 = bytes[10] << 8 | bytes[11]; pm10 = 0.1 * pm10; pm10 = Number(pm10.toFixed(0));

        var noise = bytes[12] << 8 | bytes[13]; noise = 0.01 * noise; noise = Number(noise.toFixed(2));

        if (hum > 100.0) hum = 100.0;
        if (hum < 0.0 || hum > 100.0) hum = null;
        if (tem < -50.0 || tem > 100.0) tem = null;

        if (pre < 0.0 || pre > 1000000.0) pre = null;

        if (pm1 < 0 || pm1 > 5000) pm1 = null;
        if (pm25 < 0 || pm25 > 5000) pm25 = null;
        if (pm10 < 0 || pm10 > 5000) pm10 = null;

        data.Humidity = hum;
        data.Temperature = tem;
        data.Pressure = pre;

        data.UPM = pm1;
        data.FPM = pm25;
        data.RPM = pm10;

        data.Noise = noise;

        data.EAQI = getEAQI(pm1, pm25, pm10);

        data.Version = "2.0";
    }

    return {
        data: data,
        warnings: warnings
    };
}