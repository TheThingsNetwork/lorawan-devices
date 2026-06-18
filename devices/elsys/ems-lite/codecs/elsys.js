/*
    ______ _       _______     _______
    |  ____| |     / ____\ \   / / ____|
    | |__  | |    | (___  \ \_/ / (___
    |  __| | |     \___ \  \   / \___ \
    | |____| |____ ____) |  | |  ____) |
    |______|______|_____/   |_| |_____/

    ELSYS simple payload decoder.
    Use it as it is or remove the bugs :)

    www.elsys.se
    peter@elsys.se

    Good-to-have links:
    https://www.elsys.se/en/elsys-payload/
    https://github.com/TheThingsNetwork/lorawan-devices/blob/master/vendor/elsys/elsys.js
    https://elsys.se/public/documents/Sensor_payload.pdf
*/

// Constants for sensor data types
const SENSOR_DATA_TYPES = {
    TEMP: 0x01, // Temperature Sensor: 2 bytes, range -3276.8°C to 3276.7°C.
    RH: 0x02, // Humidity Sensor: 1 byte, percentage range 0-100%.
    ACC: 0x03, // Accelerometer: 3 bytes for X, Y, Z axes, range -128 to 127, where +/-63 equals 1G.
    LIGHT: 0x04, // Light Sensor: 2 bytes, luminosity range 0 to 65535 Lux.
    MOTION: 0x05, // Motion Sensor: 1 byte, counts the number of motions detected, range 0-255.
    CO2: 0x06, // CO2 Sensor: 2 bytes, CO2 concentration range 0-65535 ppm (parts per million).
    VDD: 0x07, // Battery Voltage: 2 bytes, voltage level range 0-65535mV.
    ANALOG1: 0x08, // Analog Input 1: 2 bytes, voltage measurement range 0-65535mV.
    GPS: 0x09, // GPS Location: 6 bytes, 3 bytes for latitude and 3 for longitude, stored in binary format.
    PULSE1: 0x0A, // Pulse Counter 1: 2 bytes, relative pulse count.
    PULSE1_ABS: 0x0B, // Pulse Counter 1 (Absolute Value): 4 bytes, absolute number of pulses, range 0 to 0xFFFFFFFF.
    EXT_TEMP1: 0x0C, // External Temperature Sensor 1: 2 bytes, range -3276.5°C to 3276.5°C.
    EXT_DIGITAL: 0x0D, // External Digital Input: 1 byte, value either 1 (high) or 0 (low).
    EXT_DISTANCE: 0x0E, // Distance Sensor: 2 bytes, measures distance in millimeters.
    ACC_MOTION: 0x0F, // Acceleration-based Motion Detection: 1 byte, number of detected movements.
    IR_TEMP: 0x10, // IR Temperature Sensor: 4 bytes, 2 for internal and 2 for external temperature, range -3276.5°C to 3276.5°C.
    OCCUPANCY: 0x11, // Occupancy Sensor: 1 byte, data indicating presence (not detailed).
    WATERLEAK: 0x12, // Water Leak Sensor: 1 byte, range 0-255 indicating leak strength or detection.
    GRIDEYE: 0x13, // Grid-Eye Sensor: 65 bytes, 1 byte for reference temperature and 64 bytes for external temperatures.
    PRESSURE: 0x14, // Pressure Sensor: 4 bytes, atmospheric pressure in hPa.
    SOUND: 0x15, // Sound Sensor: 2 bytes, capturing peak and average sound levels.
    PULSE2: 0x16, // Pulse Counter 2: 2 bytes, relative pulse count.
    PULSE2_ABS: 0x17, // Pulse Counter 2 (Absolute Value): 4 bytes, absolute number of pulses, range 0 to 0xFFFFFFFF.
    ANALOG2: 0x18, // Analog Input 2: 2 bytes, voltage measurement range 0-65535mV.
    EXT_TEMP2: 0x19, // External Temperature Sensor 2: 2 bytes, range -3276.5°C to 3276.5°C.
    EXT_DIGITAL2: 0x1A, // External Digital Input 2: 1 byte, value either 1 (high) or 0 (low).
    EXT_ANALOG_UV: 0x1B, // External Analog UV Sensor: 4 bytes, UV light intensity in signed integer (microvolts).
    TVOC: 0x1C, // Total Volatile Organic Compounds Sensor: 2 bytes, concentration in ppb (parts per billion).
    DEBUG: 0x3D, // Debug Information: 4 bytes, intended for diagnostics or debugging purposes.
};


// Helper functions for decoding binary data
function bin16dec(bin) {
    let num = bin & 0xffff;
    if (0x8000 & num) num = -(0x010000 - num);
    return num;
}

function bin8dec(bin) {
    let num = bin & 0xff;
    if (0x80 & num) num = -(0x0100 - num);
    return num;
}

function hexToBytes(hex) {
    let bytes = [];
    for (let c = 0; c < hex.length; c += 2) {
        bytes.push(parseInt(hex.substr(c, 2), 16));
    }
    return bytes;
}

// Main function to decode the ELSYS payload
function DecodeElsysPayload(data) {
    let obj = {};
    for (let i = 0; i < data.length; i++) {
        switch (data[i]) {
            // Case handlers for each sensor data type
            case SENSOR_DATA_TYPES.TEMP: // Decode temperature from 2 bytes, convert to real value in °C.
                var temp = (data[i + 1] << 8) | (data[i + 2]);
                temp = bin16dec(temp);
                obj.temperature = temp / 10; // Temperature is in tenths of a degree.
                i += 2;
                break;
            case SENSOR_DATA_TYPES.RH: // Decode relative humidity from 1 byte, value in percentage.
                var rh = data[i + 1];
                obj.humidity = rh; // Humidity percentage, 0 to 100%.
                i += 1;
                break;
            case SENSOR_DATA_TYPES.ACC: // Decode 3-axis acceleration, values in Gs, from 3 bytes.
                obj.x = bin8dec(data[i + 1]); // X-axis acceleration.
                obj.y = bin8dec(data[i + 2]); // Y-axis acceleration.
                obj.z = bin8dec(data[i + 3]); // Z-axis acceleration.
                i += 3;
                break;
            case SENSOR_DATA_TYPES.LIGHT: // Decode light intensity from 2 bytes, value in Lux.
                obj.light = (data[i + 1] << 8) | (data[i + 2]);
                i += 2;
                break;
            case SENSOR_DATA_TYPES.MOTION: // Decode motion count from 1 byte, number of detected movements.
                obj.motion = data[i + 1];
                i += 1;
                break;
            case SENSOR_DATA_TYPES.CO2: // Decode CO2 concentration from 2 bytes, value in ppm.
                obj.co2 = (data[i + 1] << 8) | (data[i + 2]);
                i += 2;
                break;
            case SENSOR_DATA_TYPES.VDD: // Decode battery voltage level from 2 bytes, value in mV.
                obj.vdd = (data[i + 1] << 8) | (data[i + 2]);
                i += 2;
                break;
            case SENSOR_DATA_TYPES.ANALOG1: // Decode analog input 1 from 2 bytes, value in mV.
                obj.analog1 = (data[i + 1] << 8) | (data[i + 2]);
                i += 2;
                break;
            case SENSOR_DATA_TYPES.GPS: // Decode GPS coordinates from 6 bytes, converted to decimal degrees.
                i++;
                obj.lat = (data[i + 0] | data[i + 1] << 8 | data[i + 2] << 16 | (data[i + 2] & 0x80 ? 0xFF << 24 : 0)) / 10000;
                obj.long = (data[i + 3] | data[i + 4] << 8 | data[i + 5] << 16 | (data[i + 5] & 0x80 ? 0xFF << 24 : 0)) / 10000;
                i += 5;
                break;
            case SENSOR_DATA_TYPES.PULSE1: // Decode pulse input 1 from 2 bytes, relative pulse count.
                obj.pulse1 = (data[i + 1] << 8) | (data[i + 2]);
                i += 2;
                break;
            case SENSOR_DATA_TYPES.PULSE1_ABS: // Decode absolute value of pulse input 1 from 4 bytes.
                var pulseAbs = (data[i + 1] << 24) | (data[i + 2] << 16) | (data[i + 3] << 8) | (data[i + 4]);
                obj.pulseAbs = pulseAbs;
                i += 4;
                break;
            case SENSOR_DATA_TYPES.EXT_TEMP1: // Decode external temperature from 2 bytes, convert to real value in °C.
                var temp = (data[i + 1] << 8) | (data[i + 2]);
                temp = bin16dec(temp);
                obj.externalTemperature = temp / 10; // External temperature in tenths of a degree.
                i += 2;
                break;
            case SENSOR_DATA_TYPES.EXT_DIGITAL: // Decode external digital input from 1 byte, value 1 or 0.
                obj.digital = data[i + 1];
                i += 1;
                break;
            case SENSOR_DATA_TYPES.EXT_DISTANCE: // Decode distance sensor input from 2 bytes, value in mm.
                obj.distance = (data[i + 1] << 8) | (data[i + 2]);
                i += 2;
                break;
            case SENSOR_DATA_TYPES.ACC_MOTION: // Decode acceleration-based motion detection from 1 byte.
                obj.accMotion = data[i + 1]; // Number of detected movements via accelerometer.
                i += 1;
                break;
            case SENSOR_DATA_TYPES.IR_TEMP: // Decode IR temperatures: internal and external, from 4 bytes, convert to °C.
                var iTemp = (data[i + 1] << 8) | (data[i + 2]);
                iTemp = bin16dec(iTemp); // Internal temperature.
                var eTemp = (data[i + 3] << 8) | (data[i + 4]);
                eTemp = bin16dec(eTemp); // External temperature.
                obj.irInternalTemperature = iTemp / 10; // Converted to real temperature value.
                obj.irExternalTemperature = eTemp / 10; // Converted to real temperature value.
                i += 4;
                break;
            case SENSOR_DATA_TYPES.OCCUPANCY: // Decode occupancy from 1 byte, presence detected or not.
                obj.occupancy = data[i + 1]; // Occupancy data, binary presence indication.
                i += 1;
                break;
            case SENSOR_DATA_TYPES.WATERLEAK: // Decode water leak detection from 1 byte.
                obj.waterleak = data[i + 1]; // Water leak data, 0-255 indicating the detection level.
                i += 1;
                break;
            case SENSOR_DATA_TYPES.GRIDEYE: // Decode Grid-Eye sensor data: 1 byte reference temperature + 64 bytes external temperatures.
                var ref = data[i + 1];
                i++;
                obj.grideye = []; // Array to store temperature data.
                for (var j = 0; j < 64; j++) {
                    obj.grideye[j] = ref + (data[1 + i + j] / 10.0); // Calculate each temperature point.
                }
                i += 64;
                break;
            case SENSOR_DATA_TYPES.PRESSURE: // Decode atmospheric pressure from 4 bytes, value in hPa.
                var temp = (data[i + 1] << 24) | (data[i + 2] << 16) | (data[i + 3] << 8) | (data[i + 4]);
                obj.pressure = temp / 1000; // Convert to hPa.
                i += 4;
                break;
            case SENSOR_DATA_TYPES.SOUND: // Decode sound levels from 2 bytes: peak and average sound levels.
                obj.soundPeak = data[i + 1]; // Peak sound level.
                obj.soundAvg = data[i + 2]; // Average sound level.
                i += 2;
                break;
            case SENSOR_DATA_TYPES.PULSE2: // Decode pulse input 2 from 2 bytes, relative pulse count.
                obj.pulse2 = (data[i + 1] << 8) | (data[i + 2]);
                i += 2;
                break;
            case SENSOR_DATA_TYPES.PULSE2_ABS: // Decode absolute value of pulse input 2 from 4 bytes.
                obj.pulseAbs2 = (data[i + 1] << 24) | (data[i + 2] << 16) | (data[i + 3] << 8) | (data[i + 4]);
                i += 4;
                break;
            case SENSOR_DATA_TYPES.ANALOG2: // Decode analog input 2 from 2 bytes, value in mV.
                obj.analog2 = (data[i + 1] << 8) | (data[i + 2]);
                i += 2;
                break;
            case SENSOR_DATA_TYPES.EXT_TEMP2: // Decode and manage external temperature 2 data from 2 bytes, convert to °C.
                var temp = (data[i + 1] << 8) | (data[i + 2]);
                temp = bin16dec(temp); // Convert binary to decimal.
                // Ensure externalTemperature2 is properly handled as an array if multiple readings exist.
                if (typeof obj.externalTemperature2 === "number") {
                    obj.externalTemperature2 = [obj.externalTemperature2];
                }
                if (Array.isArray(obj.externalTemperature2)) {
                    obj.externalTemperature2.push(temp / 10);
                } else {
                    obj.externalTemperature2 = temp / 10;
                }
                i += 2;
                break;
            case SENSOR_DATA_TYPES.EXT_DIGITAL2: // Decode external digital input 2 from 1 byte, value 1 or 0.
                obj.digital2 = data[i + 1];
                i += 1;
                break;
            case SENSOR_DATA_TYPES.EXT_ANALOG_UV: // Decode load cell analog data in microvolts (uV) from 4 bytes.
                obj.analogUv = (data[i + 1] << 24) | (data[i + 2] << 16) | (data[i + 3] << 8) | (data[i + 4]);
                i += 4;
                break;
            case SENSOR_DATA_TYPES.TVOC: // Decode Total Volatile Organic Compounds (TVOC) from 2 bytes, value in parts per billion (ppb).
                obj.tvoc = (data[i + 1] << 8) | (data[i + 2]);
                i += 2; // Move past the bytes used for TVOC data.
                break;
            default: // Case to handle unknown or invalid sensor data types.
                i = data.length; // If an unrecognized type is encountered, skip to the end of the data array to avoid processing invalid data.
                break;

        }
    }
    return obj;
}

function decodeUplink(input) {
    return {
        "data": DecodeElsysPayload(input.bytes)
    }
}

function normalizeUplink(input) {
    var data = {};
    var air = {};
    var action = {};
    var motion = {};

    if (input.data.temperature) {
        air.temperature = input.data.temperature;
    }

    if (input.data.humidity) {
        air.relativeHumidity = input.data.humidity;
    }

    if (input.data.light) {
        air.lightIntensity = input.data.light;
    }

    if (input.data.motion) {
        motion.detected = input.data.motion > 0;
        motion.count = input.data.motion;
        action.motion = motion;
    }

    if (Object.keys(air).length > 0) {
        data.air = air;
    }

    if (Object.keys(action).length > 0) {
        data.action = action;
    }

    return { data: data }; 
}
