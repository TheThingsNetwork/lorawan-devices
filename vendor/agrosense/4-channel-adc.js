function decodeUplink(input) {
    var num = input.bytes[0] * 256 + input.bytes[1]
    var bat = input.bytes[2] / 10.0
    var ADC1 = (input.bytes[3] * 256 + input.bytes[4]) / 1000.0 //V
    var ADC2 = (input.bytes[5] * 256 + input.bytes[6]) / 1000.0 //V
    var ADC3 = (input.bytes[7] * 256 + input.bytes[8]) / 1000.0 //V
    var ADC4 = (input.bytes[9] * 256 + input.bytes[10]) / 1000.0 //V
    var Differentialbits = (input.bytes[11] * 256 + input.bytes[12]) / 1000.0 //V
    var time_interval = (input.bytes[13] * 16777216 + input.bytes[14] * 65536 + input.bytes[15] * 256 + input.bytes[16]) / 1000.0//S

    return {
        data: {
            field1: bat,
            field2: ADC1,
            field3: ADC2,
            field4: ADC3,
            field5: ADC4,
            field6: Differentialbits,
            field7: time_interval,
        },
  };
}

// .................................................................................................
// .................................................................................................
// .................................................................................................

/* 
Downlink:

The downlink has four functions: 
the first is the modification interval for Fport1; 
the second is the amount of uploaded local latest log data for Fport5;
the third is to turn on or off the corresponding ADC channel for Fport6 (the default is all on); 
the fourth is to set the third and fourth channels as differential inputs for Fport7;

Fport6 sets the truth table：
------------------------------------------------------
|    Differentialbits	ADC4	ADC3	ADC2	ADC1 |  
|           0            0       0       0       1   |  0x01 =enable the ADC1 channel
|           0            0       0       1       0   |  0x02 =enable the ADC2 channel
|           0            0       1       0       0   |  0x04 =enable the ADC3 channel
|           0            1       0       0       0   |  0x08 =enable the ADC4 channel
|           1            0       0       0       0   |  0x10 =enable the Differentialbits  channel，At this point, FPort7 must be set to 1
|           0            0       0       0       0   |  0x00 =Turn off all channels
|           1            1       1       1       1   |  0x1F =enable all channels
------------------------------------------------------
*/

// Encoder function to be used in the TTN console for downlink payload(Fport1)
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