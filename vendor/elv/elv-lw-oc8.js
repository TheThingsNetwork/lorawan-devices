/*
 * ELV-LW-OC8-Payload-Parser
 * 
 * Version: V1.0.0
 * 
 * */
 
var tx_reason = [
    "UNDEFINED_EVENT",      // 0x00
    "TIMER_EVENT",          // 0x01
    "USER_BUTTON_EVENT",    // 0x02
    "INPUT_1_EVENT",        // 0x03
    "INPUT_2_EVENT",        // 0x04
    "INPUT_3_EVENT",        // 0x05
    "INPUT_4_EVENT",        // 0x06
    "INPUT_5_EVENT",        // 0x07
    "INPUT_6_EVENT",        // 0x08
    "INPUT_7_EVENT",        // 0x09
    "INPUT_8_EVENT",        // 0x0A
    "APP_EVENT",            // 0x0B
    "CYCLIC_EVENT",         // 0x0C
    "TIMEOUT_EVENT",        // 0x0D
    "DOWNLINK_ACK_EVENT",   // 0x0E
    "DOWNLINK_ERROR_EVENT"  // 0x0E
  ];

/*
* @brief   Receives the bytes transmitted from a ELV-LW-OC8 device 
* @param   bytes:  Array with the data stream
* @param   port:   Used TTN/TTS data port 
* @return  Decoded data from the ELV-LW-OC8 device
* */
function decodeUplink(input)
{
var decoded = {};   // Container with the decoded output
var index   = 0;    // Index variable for the application data in the bytes[] array

var bytes = input.bytes;
var port = input.fPort;

if( port === 10 )   // The default port for app data
{
if( bytes.length != 0 )
{
// Loop for collecting the application data
do
{
switch( bytes[index] )
{
case 0x01:  // Application version
{
decoded.app_version = "V" + bytes[++index] + "." + bytes[++index] + "." + bytes[++index];

break;
}
case 0x02:  // Bootloader version
{
decoded.bl_version = "V" + bytes[++index] + "." + bytes[++index] + "." + bytes[++index];

break;
}
case 0x03:  // TX-Reason
{
index++;

if( bytes[index] > tx_reason.length )       // Verify that the TX_Reason value is within the available array elements
{                                           // The TX_Reason value is not within the available array elements.
decoded.tx_reason = "UNKNOWN_EVENT --> Please update your payload parser";
}
else                                        // The TX_Reason value is within the available array elements.
{                                           // Read out the reason for transmit.
decoded.tx_reason = tx_reason[bytes[index]];
}

break;
}
case 0x04:  // Supply voltage
{
decoded.supply_voltage  = ( bytes[++index] << 8 ) | bytes[++index];

break;
}
case 0x07:  // Output states
{
if( bytes[++index] == 1 )
{
index++;
decoded.ch1  = ( bytes[index] >> 0 ) & 0x01;
decoded.ch2  = ( bytes[index] >> 1 ) & 0x01;
decoded.ch3  = ( bytes[index] >> 2 ) & 0x01;
decoded.ch4  = ( bytes[index] >> 3 ) & 0x01;
decoded.ch5  = ( bytes[index] >> 4 ) & 0x01;
decoded.ch6  = ( bytes[index] >> 5 ) & 0x01;
decoded.ch7  = ( bytes[index] >> 6 ) & 0x01;
decoded.ch8  = ( bytes[index] >> 7 ) & 0x01;
}

break;
}
case 0x08:  // Interval
{
decoded.interval = bytes[++index];

break;
}
case 0x09:  // Contact interface enabled
{
decoded.contact_interface_en = bytes[++index];

break;
}

// case 0x??:    // Further Data Type
// {
//   .
//   .
//   .
//   break;
// }
default:  // There is something wrong with the data type value
{
// Clear all properties from the "decoded" object
decoded = {};

// Add error code property to the "decoded" object
decoded.parser_error = "Data Type Failure --> Please update your payload parser";
break;
}
}
}
while( ( ++index < bytes.length ) && ( 'parser_error' in decoded === false ) );


}
}
else
{
decoded.parser_error = "Wrong Port Number";
}

return {
    data:decoded
};
}