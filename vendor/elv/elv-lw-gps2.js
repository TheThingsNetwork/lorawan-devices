/*
 * ELV-LW-GPS2-Payload-Parser
 * 
 * Version: V1.0.0
 * 
 * */
 
var tx_reason = [
                  "UNDEFINED_EVENT",      // 0x00
                  "TIMER_EVENT",          // 0x01
                  "USER_BUTTON_EVENT",    // 0x02
                  "GNSS_TIMEOUT_EVENT",   // 0x03
                  "HEARTBEAT_EVENT",      // 0x04
                  "INPUT_ONE_SHOT_EVENT", // 0x05
                  "INPUT_CYCLIC_EVENT",   // 0x06
                  "MOTION_START_EVENT",   // 0x07
                  "MOTION_CYCLIC_EVENT",  // 0x08
                  "MOTION_STOP_EVENT",    // 0x09
                  
                ];

/*
 * @brief   Receives the bytes transmitted from a ELV-LW-GPS2 device 
 * @param   bytes:  Array with the data stream
 * @param   port:   Used TTN/TTS data port 
 * @return  Decoded data from the ELV-LW-GPS2 device
 * */

function decodeUplink( input )
{
  var bytes = input.bytes;
  var port = input.fPort;
  
  var decoded = {};   // Container with the decoded output
  var index   = 0;    // Index variable for the application data in the bytes[] array
  
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
          case 0x0A:  // Positioning Data (TTN Mapper conform)
          {
            decoded.latitude  = parseFloat( bytes[++index] | ( bytes[++index] << 8 ) | ( bytes[++index] << 16 ) | ( bytes[++index] << 24 ) ) / 1000000;
            decoded.longitude = parseFloat( bytes[++index] | ( bytes[++index] << 8 ) | ( bytes[++index] << 16 ) | ( bytes[++index] << 24 ) ) / 1000000;
            decoded.altitude  = bytes[++index] | ( bytes[++index] << 8 ) | ( bytes[++index] << 16 ) | ( bytes[++index] << 24 );
            decoded.altitude  = Number( ( decoded.altitude / 10000 ).toFixed( 2 ) );
            decoded.hdop      = Number( parseFloat( String( bytes[++index] ) + "." + String( bytes[++index] * 4 ).padStart( 2, '0' ) ).toFixed( 2 ) );

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


  return {data:decoded};

}

function decodeDownlink(input) {
  return {
    data: {
      bytes: input.bytes
    },
    warnings: [],
    errors: []
  }
}