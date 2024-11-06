/*
 * ELV-LW-GPS1-Payload-Parser
 * 
 * Version: V1.0.0
 * 
 * */



var tx_reason = ["Reserved", "Timer_Event", "User_Button", "GNSS_Timeout", "Heartbeat", "Input_One_Shot", "Input_Cyclic", "Motion_Start", "Motion_Cyclic", "Motion_Stop" ];

/*
 * @brief   Receives the bytes transmitted from a ELV-LW-GPS1 device 
 * @param   bytes:  Array with the data stream
 * @param   port:   Used TTN/TTS data port 
 * @return  Decoded data from the ELV-LW-GPS1 device
 * */
function decodeUplink( input )
{

  var bytes = input.bytes;
  var port = input.fPort;
  
  var decoded = {};               // Container with the decoded output
  var index   = bytes[0] + 1;     // Index variable for the application data in the bytes[] array
  
  if( port === 10 ) // The default port for app data
  {
    if( bytes.length >= 1 ) // Minimum 1 Bytes for Header length
    {
      // Collecting header data
      decoded.TX_Reason       = tx_reason[( bytes[1] & 0x0F )]; // Read out the reason for sending 
      decoded.Supply_Voltage  = ( bytes[2] << 8 ) | bytes[3];

      if( bytes.length > ( bytes[0] + 1 ) ) // There is not only the header data
      {
        // Loop for collecting the application data 
        do
        {
          switch( bytes[index] )
          {
            case 0x01:  // Positioning Data (TTN Mapper conform)
            {
              decoded.latitude  = parseFloat( bytes[++index] | ( bytes[++index] << 8 ) | ( bytes[++index] << 16 ) | ( bytes[++index] << 24 ) ) / 1000000;
              decoded.longitude = parseFloat( bytes[++index] | ( bytes[++index] << 8 ) | ( bytes[++index] << 16 ) | ( bytes[++index] << 24 ) ) / 1000000;
              decoded.altitude  = bytes[++index] | ( bytes[++index] << 8 ) | ( bytes[++index] << 16 ) | ( bytes[++index] << 24 );
              decoded.altitude  = Number( ( decoded.altitude / 10000 ).toFixed( 2 ) );
              decoded.hdop      = Number( parseFloat( String( bytes[++index] ) + "." + String( bytes[++index] * 4 ).padStart( 2, '0' ) ).toFixed( 2 ) );
            }
              break;
            default:  // There is something wrong with the data type value
            {
              // Removing all added properties from the "decoded" object with a deep clean
              // Clear all properties from the "decoded" object
              decoded = {};

              // Add error code propertiy to the "decoded" object
              decoded.parser_error = "Data Type Failure";
            }
              break;
          }
        }
        while( ( ++index < bytes.length ) && ( 'parser_error' in decoded === false ) );
      }
    }
    else
    {
      decoded.parser_error = "Not enough data";
    }
  }
  else
  {
    decoded.parser_error = "Wrong Port Number";
  }

  //return decoded;

  return{
    data: decoded,
  };
}