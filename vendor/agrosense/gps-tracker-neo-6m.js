// This file contains the uplink and downlink for ttn

// Uplink
function decodeUplink(input) {

    var num = input.bytes[0] * 256 + input.bytes[1];
    var batteryLevel = input.bytes[2] / 10.0;
    var gSensorState = input.bytes[3];
    var gpsStatus = input.bytes[4];
    var gsensor_onoff = input.bytes[22];
    var gsensor_sensitivity = input.bytes[23];
    
    if (gpsStatus != 0) {
        var year = input.bytes[5] * 256 + input.bytes[6];
        var month = input.bytes[7];
        var date = input.bytes[8];
        var hour = input.bytes[9];
        var minute = input.bytes[10];
        var second = input.bytes[11];

        var latitude = (input.bytes[12] * 16777216 + input.bytes[13] * 65536 + input.bytes[14] * 256 + input.bytes[15]) / 100000;
        var nsHemi = input.bytes[16] === 0 ? 'N' : 'S';

        var longitude = (input.bytes[17] * 16777216 + input.bytes[18] * 65536 + input.bytes[19] * 256 + input.bytes[20]) / 100000;
        var ewHemi = input.bytes[21] === 0 ? 'E' : 'W';
    } else {
        var year = 0;
        var month = 0;
        var date = 0;
        var hour = 0;
        var minute = 0;
        var second = 0;

        var latitude = 0;
        var nsHemi = 'N';

        var longitude = 0;
        var ewHemi = 'E';
    }

    // Correct hemisphere values based on actual GPS data
    nsHemi = latitude < 0 ? 'S' : 'N';
    ewHemi = longitude < 0 ? 'W' : 'E';

    // Convert latitude and longitude to positive values if necessary
    latitude = Math.abs(latitude);
    longitude = Math.abs(longitude);

    return {
        data: {
 
            field1: batteryLevel,
            field2: latitude,
            field3: longitude,
            field4: gSensorState,
        },
    };
}

// .................................................................................................
// .................................................................................................
// .................................................................................................

// Downlink

// Main Encoder function that calls respective encoding functions based on the input
function Encoder(input) {
    if ("gsensor_onoff" in input && Object.keys(input).length === 1) {
        // If only gsensor_onoff is provided, call the simplified function
        return encodeGsensorOnOff(input);
    } else if ("minutes" in input && "gsensor_sensitivity" in input && "gsensor_onoff" in input) {
        // If minutes, gsensor_sensitivity, and gsensor_onoff are provided, call the full settings function
        return encodeFullSettings(input);
    } else if ("minutes" in input && Object.keys(input).length === 1) {
        // If only minutes is provided, call the minutes-only function
        return encodeMinutesOnly(input);
    } else if ("gsensor_sensitivity" in input && Object.keys(input).length === 1) {
        // If only gsensor_sensitivity is provided, call the gsensor sensitivity function
        return encodeGsensorSensitivity(input);
    } else {
        throw new Error("Invalid input structure: Unsupported combination of fields.");
    }
}

// Function to handle full settings, including minutes, gsensor_sensitivity, and gsensor_onoff
function encodeFullSettings(input) {
    var minutes = Number(input.minutes);
    var gsensor_sensitivity = Number(input.gsensor_sensitivity);
    var gsensor_onoff = Number(input.gsensor_onoff);

    // Validate input
    if (gsensor_sensitivity !== 0 && gsensor_sensitivity !== 1) {
        throw new Error("Invalid value for gsensor_sensitivity: must be 0 or 1");
    }
    if (gsensor_onoff !== 0 && gsensor_onoff !== 1) {
        throw new Error("Invalid value for gsensor_onoff: must be 0 or 1");
    }

    // Convert minutes to seconds
    var seconds = minutes * 60;

    // Set a minimum of 300 seconds if the calculated seconds are less than 300
    if (seconds < 300) {
        seconds = 300;
    }

    // Create payload
    var payload = [
        (seconds >> 24) & 0xFF,
        (seconds >> 16) & 0xFF,
        (seconds >> 8) & 0xFF,
        seconds & 0xFF,
        gsensor_sensitivity & 0x01,
        gsensor_onoff & 0x01
    ];

    return payload;
}

// Function to handle simplified G-sensor on/off, only including gsensor_onoff
function encodeGsensorOnOff(input) {
    var gsensor_onoff = Number(input.gsensor_onoff);

    // Validate input
    if (gsensor_onoff !== 0 && gsensor_onoff !== 1) {
        throw new Error("Invalid value for gsensor_onoff: must be 0 or 1");
    }

    // Create payload containing only gsensor_onoff
    var payload = [
        gsensor_onoff & 0x01 // Ensure gsensor_onoff value is 0 or 1
    ];

    return payload;
}

// Function to handle minutes only
function encodeMinutesOnly(input) {
    var minutes = Number(input.minutes);

    // Convert minutes to seconds
    var seconds = minutes * 60;

    // Set a minimum of 300 seconds if the calculated seconds are less than 300
    if (seconds < 300) {
        seconds = 300;
    }

    // Create payload containing only time part
    var payload = [
        (seconds >> 24) & 0xFF,
        (seconds >> 16) & 0xFF,
        (seconds >> 8) & 0xFF,
        seconds & 0xFF
    ];

    return payload;
}

// Function to handle G-sensor sensitivity only, including gsensor_sensitivity
function encodeGsensorSensitivity(input) {
    var gsensor_sensitivity = Number(input.gsensor_sensitivity);

    // Validate input
    if (gsensor_sensitivity !== 0 && gsensor_sensitivity !== 1) {
        throw new Error("Invalid value for gsensor_sensitivity: must be 0 or 1");
    }

    // Create payload containing only gsensor_sensitivity
    var payload = [
        gsensor_sensitivity & 0x01 // Ensure gsensor_sensitivity value is 0 or 1
    ];

    return payload;
}