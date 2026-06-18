// This file contains the uplink and downlink for ttn

// Uplink
function decodeUplink(input) {

    // var num = input.bytes[0] * 256 + input.bytes[1]
    var bat = input.bytes[2] / 10.0
    var Significant = input.bytes[3]
    var humi = (input.bytes[4] * 256 + input.bytes[5]) / 10.0

    var temp = input.bytes[6] * 256 + input.bytes[7]
    if (temp >= 0x8000) {
        temp -= 0x10000;
    }
    temp = temp / 10.0
    var interval = (input.bytes[8] * 16777216 + input.bytes[9] * 65536 + input.bytes[10] * 256 + input.bytes[11]) / 1000

    
        if (Significant) {
          return {
            data: {
            field1: bat,
            field2: humi,
            field3: temp,
            field4: interval,
            },
          };
        }
        else {
          return {
            data: {
            Significant: "data invalid",
            },
          };
        }
}

// .................................................................................................
// .................................................................................................
// .................................................................................................

// Downlink

// Encoder function to be used in the TTN console for downlink payload
function Encoder(input) {
    var minutes = input.minutes;

    // Converting minutes to seconds
    var seconds = minutes * 60;

    // If the number of seconds is less than 300 seconds, set it to 300 seconds
    if (seconds < 300) {
        seconds = 300;
    }

    var payload = [
        (seconds >> 24) & 0xFF,
        (seconds >> 16) & 0xFF,
        (seconds >> 8) & 0xFF,
        seconds & 0xFF
    ];

    return payload;
}