/*
 * ELV-LW-ESI-Payload-Parser
 * 
 * Version: V1.0.0
 * 
 * */



var tx_reason           = [ "Reserved", "Timer_Event", "User_Button", "Power_Event", "Calibration" ];
var consumption_type    = [ "Reserved", "Consumption", "Delivery" ];
var energy_counter_unit = [ "Wh", "kWh", "m^3" ];
var energy_power_unit   = [ "W", "kW", "m^3/h" ];
var boot_flag           = [ "No_Overflow", "Overflow" ];  // Overflow = At least one overflow of energy counter
var signum_of_power     = [ "Positive", "Negative" ];

/*
 * @brief   Receives the bytes transmitted from a ELV-LW-ESI device 
 * @param   bytes:  Array with the data stream
 * @param   port:   Used TTN/TTS data port 
 * @return  Decoded data from the ELV-LW device
 * */
function decodeUplink( input )
{
  var decoded = {};   // Container with the decoded output
  var index   = 1;    // Index variable for the application data in the bytes[] array

  var port = input.fPort;
  var bytes = input.bytes;
  
  if( port === 10 )   // The default port for app data
  {
    if( bytes.length >= 1 )     // Minimum 1 Bytes for Header length
    {
      // Collecting header data
      do
      {
        switch( index )
        {
          case 1:
          {
            decoded.TX_Reason       = tx_reason[( bytes[1] & 0x0F )];   // Read out the reason for TX
          }
          break;
          case 2:
          {
            decoded.Supply_Voltage  = ( bytes[2] << 8 ) | bytes[3];
          }
          break;
          case 3:
          {
            decoded.Supply_Voltage  |= bytes[3];
          }
          break;
        }
      }
      while( ++index < bytes[0] + 1 );

      if( bytes.length > ( bytes[0] + 1 ) )   // There is not only the header data
      {
        // Loop for collecting the application data
        Energy_Data = {
                        Consumption_Type:     [],
                        Energy_Counter_Unit:  [],
                        Boot_Flag:            [],
                        Energy_Counter:       [],
                        Energy_Power_Unit:    [],
                        Signum_Of_Power:      [],
                        Power:                []
                      }
        index_energy_data = 0;
        do
        {
          switch( bytes[index] )
          {
            case 0x01:
            {
              index++;
              //decoded.Consumption_Type      = consumption_type[bytes[index] & 0x3F];
              Energy_Data.Consumption_Type[index_energy_data] = consumption_type[bytes[index] & 0x3F];
              index++;
              //decoded.Energy_Counter_Unit   = energy_counter_unit[bytes[index] & 0x03];
              Energy_Data.Energy_Counter_Unit[index_energy_data] = energy_counter_unit[bytes[index] & 0x03];
              //decoded.Boot_Flag             = boot_flag[( bytes[index] >> 2 ) & 0x03];
              Energy_Data.Boot_Flag[index_energy_data] = boot_flag[( bytes[index] >> 2 ) & 0x03];
              index++;
              //decoded.Energy_Counter        = Number( "0x" + byteToString( bytes[index + 4] ) + byteToString( bytes[index + 3] ) + byteToString( bytes[index + 2] ) + byteToString( bytes[index + 1] ) + byteToString( bytes[index] ) ) / 10000.0;
              Energy_Data.Energy_Counter[index_energy_data] = Number( "0x" + byteToString( bytes[index + 4] ) + byteToString( bytes[index + 3] ) + byteToString( bytes[index + 2] ) + byteToString( bytes[index + 1] ) + byteToString( bytes[index] ) ) / 10000.0;
              index += 5;
              //decoded.Energy_Power_Unit     = energy_power_unit[bytes[index] & 0x03];
              Energy_Data.Energy_Power_Unit[index_energy_data] = energy_power_unit[bytes[index] & 0x03];
              //decoded.Signum_Of_Power       = signum_of_power[( bytes[index] >> 2 ) & 0x01];
              Energy_Data.Signum_Of_Power[index_energy_data] = signum_of_power[( bytes[index] >> 2 ) & 0x01];
              index++;
              //decoded.Power                 = Number( "0x" + byteToString( bytes[index + 3] ) + byteToString( bytes[index + 2] ) + byteToString( bytes[index + 1] ) + byteToString( bytes[index] ) ) / 100.0;
              Energy_Data.Power[index_energy_data] = Number( "0x" + byteToString( bytes[index + 3] ) + byteToString( bytes[index + 2] ) + byteToString( bytes[index + 1] ) + byteToString( bytes[index] ) ) / 100.0;
              index += 3;
              
              index_energy_data++;
            }
            break;
            case 0x02:
            {
              index++;
              decoded.IR_Meter_Sensibility  = Int16( bytes[index + 1] << 8 | bytes[index] ) - 100;
              index += 2;
              decoded.IR_Threshold_1  = Int16( bytes[index + 1] << 8 | bytes[index] ) - 100;
              index += 2;
              decoded.IR_Threshold_2  = Int16( bytes[index + 1] << 8 | bytes[index] ) - 100;
              index++;
            }
            break;
            default:    // There is something wrong with the data type value
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
        if( index_energy_data > 0 )
        {
          decoded.Energy_Data = Energy_Data;
        }
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

var UInt16 = function( value )
{
	return ( value & 0xFFFF );
};

var Int16 = function( value )
{
	var ref = UInt16( value );
	return ( ref > 0x7FFF ) ? ref - 0x10000 : ref;
};

var byteToString = function( value )
{
  var hex = Number( value ).toString( 16 );
  if( hex.length < 2 )
  {
    hex = "0" + hex;
  }
  return hex;
}