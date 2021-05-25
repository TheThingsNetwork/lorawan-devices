/*
 * Decoder function for The Things Network to unpack the payload of TEKTELIC's Agriculture Sensors
 * More info on the sensors/buy online:
 * https://connectedthings.store/gb/tektelic-agriculture-soil-moisture-sensor-surface-version.html
 * https://connectedthings.store/gb/tektelic-agriculture-soil-moisture-sensor-external-probe.html
 * This function was created by Al Bennett at Sensational Systems - al@sensational.systems
 */
function decodeUplink(input) {
  var port = input.fPort;
  var bytes = input.bytes;
  var moisture_calibration = 1367000; // This is the "dry" value measured by the sensor before putting in the ground, in Hz
  var params = {};
  if(10 == port) {  // Sensor readings are on port 10
    params.port = port;
    params.raw = stringifyBytes(bytes);
    for (var i = 0; i < bytes.length; i++) {
        // battery voltage
        if(0x00 === bytes[i] && 0xFF === bytes[i+1]) {
            params.battery_voltage = 0.01 * ((bytes[i+2] << 8) | bytes[i+3]);
            i = i+3;
        }
        // soil moisture - built in probe version
        if(0x01 === bytes[i] && 0x04 === bytes[i+1]) {
            var soil_moisture_raw = (bytes[i+2] << 8) | bytes[i+3];
            params.soil_moisture_raw = soil_moisture_raw;
            // Calculate Gravimetric Water Content
            soil_moisture_raw *= 1000; // in Hz
            var moisture_diff = Math.abs(soil_moisture_raw - moisture_calibration);
            params.soil_gwc = 0;
            if(moisture_diff <= 3000) {
                params.soil_gwc = 0;
            } else if(moisture_diff <= 6000) {
                params.soil_gwc = 0.1;
            } else if(moisture_diff <= 11000) {
                params.soil_gwc = 0.2;
            } else if(moisture_diff <= 16000) {
                params.soil_gwc = 0.3;
            } else if(moisture_diff <= 21000) {
                params.soil_gwc = 0.4;
            } else if(moisture_diff <= 26000) {
                params.soil_gwc = 0.5;
            } else if(moisture_diff <= 31000) {
                params.soil_gwc = 0.6;
            } else if(moisture_diff <= 36000) {
                params.soil_gwc = 0.7;
            } else if(moisture_diff <= 41000) {
                params.soil_gwc = 0.8;
            } else if(moisture_diff <= 46000) {
                params.soil_gwc = 0.9;
            } else if(moisture_diff <= 51000) {
                params.soil_gwc = 1;
            } else if(moisture_diff <= 56000) {
                params.soil_gwc = 1.1;
            } else if(moisture_diff <= 61000) {
                params.soil_gwc = 1.2;
            } else if(moisture_diff <= 80000) {
                params.soil_gwc = 2;
            }
            i = i+3;
            params.soil_gwc = params.soil_gwc;
        }
        // soil temp - built in probe version
        if(0x02 === bytes[i] && 0x02 === bytes[i+1]) {
            // raw value in mV
            var soil_temp_raw = (bytes[i+2] << 8) | bytes[i+3];
            params.soil_temp_raw = soil_temp_raw;
            // convert to degrees C
            params.soil_temp = -32.46 * Math.log(soil_temp_raw) + 236.36
            // Fix the floating point
            params.soil_temp = params.soil_temp;
            i = i+3;
        }
        // watermark reading 1 - external probe version
        if(0x05 === bytes[i] && 0x04 === bytes[i+1]) {
            params.input5_frequency = (bytes[i+2] << 8) | bytes[i+3]; //hz
            watermark = freqToWatermark(params.input5_frequency);
            params.watermark1 = watermark;
            i = i+3;
        }
        //thermistor reading 1 - external probe version
        if(0x03 ===bytes[i] && 0x02 === bytes[i+1]){
            params.input3_voltage = (bytes[i+2] << 8) | bytes[i+3];
            temperature = voltageToTemp(params.input3_voltage)
            params.temperature1 = temperature
            i = i+3
        }
        // watermark reading 2 - external probe version
        if(0x06 === bytes[i] && 0x04 === bytes[i+1]) {
            params.input6_frequency = (bytes[i+2] << 8) | bytes[i+3]; //hz
            watermark = freqToWatermark(params.input6_frequency);
            params.watermark2 = watermark;
            i = i+3;
        }
        //thermistor reading 2 - external probe version
        if(0x04 ===bytes[i] && 0x02 === bytes[i+1]){
            params.input4_voltage = (bytes[i+2] << 8) | bytes[i+3];
            temperature = voltageToTemp(params.input4_voltage)
            params.temperature2 = temperature
            i = i+3
        }
        // ambient light, in lux
        if(0x09 === bytes[i] && 0x65 === bytes[i+1]) {
            params.light_intensity = (bytes[i+2] << 8) | bytes[i+3];
            i = i+3;
        }
        // ambient temperature, in degrees C
        if(0x0B === bytes[i] && 0x67 === bytes[i+1]) {
            // Sign-extend to 32 bits to support negative values, by shifting 24 bits
            // (16 too far) to the left, followed by a sign-propagating right shift:
            params.ambient_temp = (bytes[i+2]<<24>>16 | bytes[i+3]) / 10;
            params.ambient_temp = params.ambient_temp;
            i = i+3;
        }
        // humidity
        if(0x0B === bytes[i] && 0x68 === bytes[i+1]) {
            params.ambient_humidity = 0.5 * bytes[i+2];
            params.ambient_humidity = params.ambient_humidity
            i = i+2;
        }
    }
    //Calculate adjusted values for watermark if the temp and watermark exist
    if(params.watermark1 && params.temperature1){
        params.adj_watermark1 = params.watermark1*(1-0.019*(params.temperature1-24))
    }
    if(params.watermark2 && params.temperature2){
        params.adj_watermark2 = params.watermark2*(1-0.019*(params.temperature2-24))
    }
  }
  return {
    data: params
  }
}
function voltageToTemp(value){
    return -31.96 * Math.log(value) + 213.25
  }
function freqToWatermark(hz) {
    var water_tension;
    if(hz < 293) {
        water_tension = 200;
    } else if(hz <= 485) {
        water_tension = 200 - (hz - 293) * 0.5208;
    } else if(hz <= 600) {
        water_tension = 100 - (hz - 485) * 0.2174;
    } else if(hz <= 770) {
        water_tension = 75 - (hz - 600) * 0.1176;
    } else if(hz <= 1110) {
        water_tension = 55 - (hz - 770) * 0.05884;
    } else if(hz <= 2820) {
        water_tension = 35 - (hz - 1110) * 0.01170;
    } else if(hz <= 4330) {
        water_tension = 15 - (hz - 2820) * 0.003974;
    } else if(hz <= 6430) {
        water_tension = 9 - (hz - 4330) * 0.004286;
    } else if(hz > 6430) {
        water_tension = 0;
    }
    return water_tension;
}
function stringifyBytes(bytes){
    var stringBytes = "["
    for (var i = 0; i < bytes.length; i++){
        if (i !== 0)
            stringBytes+=", "
        var byte = bytes[i].toString(16).toUpperCase()
        if (byte.split("").length === 1)
            byte = "0" + byte
        stringBytes+= byte
    }
    stringBytes+="]"

    return stringBytes
}