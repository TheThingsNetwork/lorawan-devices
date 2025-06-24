function decodeUplink(input) {

    // var num = input.bytes[0] * 256 + input.bytes[1]
    var bat = input.bytes[2] / 10.0
    var humi = (input.bytes[3] * 256 + input.bytes[4]) / 10.0
    // var temp = (input.bytes[5] * 256 + input.bytes[6] ) / 10.0

    var temp = input.bytes[5] * 256 + input.bytes[6]
    if (temp >= 0x8000) {
        temp -= 0x10000;
    }
    temp = temp / 10.0


    return {
        data: {
            Bat: bat,
            Humi: humi,
            Temp: temp,
        },

    };
}



// Encoder function to be used in the TTN console for downlink payload
function encodeDownlink(input) {
    var minutes = input.data.minutes;

    // Converting minutes to seconds
    var seconds = minutes * 60;

    // If the number of seconds is less than 300 seconds, set it to 300 seconds
    if (seconds < 300) {
        seconds = 300;
    }
    var bytes1 = (seconds >> 24) & 0xFF;
    var bytes2 = (seconds >> 16) & 0xFF;
    var bytes3 = (seconds >> 8) & 0xFF; 
    var bytes4 = seconds & 0xFF;

    // var payload = [
    //     (seconds >> 24) & 0xFF,
    //     (seconds >> 16) & 0xFF,
    //     (seconds >> 8) & 0xFF,
    //     seconds & 0xFF
    // ];

    return {        
        bytes: [bytes1,bytes2,bytes3,bytes4],
        fPort: 1,
    };
}