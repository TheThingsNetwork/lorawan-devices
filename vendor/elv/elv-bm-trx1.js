/*
 * LoRIS-Payload-Parser
 * 
 * Version: V1.4.3
 * 
 * */


var tx_reason = ["Timer_Event", "User_Button", "Input_Event", "Unused_Reason", "App_Cycle_Event"];

/*
 * @brief   Receives the bytes transmitted from a LoRIS device 
 * @param   bytes:  Array with the data stream
 * @param   port:   Used TTN/TTS data port 
 * @return  Decoded data from the LoRIS device
 * */
function decodeUplink(input) {                                                              
  var decoded = {};   // Container with the decoded output
  var index = 5;      // Index variable for the application data in the bytes[] array
  var Temp_Value = 0; // Variable for temporarily calculated values

  var bytes = input.bytes;
  var port = input.fPort;
  
  if (port === 10) {  // The default port for app data
    if (bytes.length >= 5) {    // Minimum 5 Bytes for Header
      
      // Collecting header data
      decoded.TX_Reason = tx_reason[(bytes[0] & 0x0F)];   // Read out the reason for sending 
      decoded.Supply_Voltage = (bytes[3] << 8) | bytes[4];
      
      if (bytes.length >= 6) {    // There is not only the header data
        // Loop for collecting the application data 
        do {
          switch (bytes[index]) {
            case 0x00:  // Binary Input
            {
              index++;    // Set index to data value
              if (bytes[index] & 0x02) {  // if Input 1 enabled
                if (bytes[index] & 0x01) {
                  decoded.Input_1 = "Active";
                }
                else {
                  decoded.Input_1 = "Inactive";
                }
              }
              if (bytes[index] & 0x08) {  // if Input 2 enabled
                if (bytes[index] & 0x04) {
                  decoded.Input_2 = "Active";
                }
                else {
                  decoded.Input_2 = "Inactive";
                }
              }
              if (bytes[index] & 0x20) {  // if Input 3 enabled
                if (bytes[index] & 0x10) {
                  decoded.Input_3 = "Active";
                }
                else {
                  decoded.Input_3 = "Inactive";
                }
              }
              if (bytes[index] & 0x80) {  // if Input 4 enabled
                if (bytes[index] & 0x40) {
                  decoded.Input_4 = "Active";
                }
                else {
                  decoded.Input_4 = "Inactive";
                }
              }
              break;
            }
            case 0x01:  // Binary Output
            {
              index++;    // Set index to data value
              if (bytes[index] & 0x02) {
                if (bytes[index] & 0x01) {
                  decoded.Output_1 = "Active";
                }
                else {
                  decoded.Output_1 = "Inactive";
                }
              }
              if (bytes[index] & 0x08) {
                if (bytes[index] & 0x04) {
                  decoded.Output_2 = "Active";
                }
                else {
                  decoded.Output_2 = "Inactive";
                }
              }
              if (bytes[index] & 0x20) {
                if (bytes[index] & 0x10) {
                  decoded.Output_3 = "Active";
                }
                else {
                  decoded.Output_3 = "Inactive";
                }
              }
              if (bytes[index] & 0x80) {
                if (bytes[index] & 0x40) {
                  decoded.Output_4 = "Active";
                }
                else {
                  decoded.Output_4 = "Inactive";
                }
              }
              break;
            }
            case 0x02:  // Temperature
            {
              // Get the 16 bit value
              index++;    // Set index to high byte data value
              Temp_Value = (bytes[index] * 256);
              index++;    // Set index to low byte data value
              Temp_Value += bytes[index];
              
              switch (Temp_Value) {
                case 0x8000:    // Special value
                  decoded.Temperature_Sensor = "Unknown";
                  break;
                case 0x8001:    // Special value
                  decoded.Temperature_Sensor = "Overflow";
                  break;
                case 0x8002:    // Special value
                  decoded.Temperature_Sensor = "Underflow";
                  break;
                default:        // Temperature value
                  // Convert to 16 bit signed value
                  if (Temp_Value > 0x7fff) {
                    Temp_Value -= 0x10000;
                  }
                  
                  Temp_Value *= 0.1;	// Adjust the temperature resolution
                  decoded.Temperature_Sensor = String(Temp_Value.toFixed(1));
                  break;
              }
              break;
            }
            case 0x03:  // Temperature + Relative Humidity
            {
              // Get the 16 bit value
              index++;    // Set index to high byte data value
              Temp_Value = (bytes[index] * 256);
              index++;    // Set index to low byte data value
              Temp_Value += bytes[index];
              
              switch (Temp_Value) {
                case 0x8000:    // Special value
                  decoded.TH_Sensor_Temperature = "Unknown";
                  break;
                case 0x8001:    // Special value
                  decoded.TH_Sensor_Temperature = "Overflow";
                  break;
                case 0x8002:    // Special value
                  decoded.TH_Sensor_Temperature = "Underflow";
                  break;
                default:        // Temperature value
                  // Convert to 16 bit signed value
                  if (Temp_Value > 0x7fff) {
                    Temp_Value -= 0x10000;
                  }
                  Temp_Value *= 0.1;	// Adjust the temperature resolution
                  decoded.TH_Sensor_Temperature = String(Temp_Value.toFixed(1));
                  break;
              }
              
              index++;      // Set index to relative humidity data value
              switch (bytes[index]) {
                case 0xff:  // Special value
                  decoded.TH_Sensor_Humidity = "Unknown";
                  break;
                case 0xfe:  // Special value
                  decoded.TH_Sensor_Humidity = "Overflow";
                  break;
                case 0xfd:  // Special value
                  decoded.TH_Sensor_Humidity = "Underflow";
                  break;
                default:    // Relative humidity value
                  decoded.TH_Sensor_Humidity = String(bytes[index]);
                  break;
              }
              break;
            }
            case 0x04:  // Positioning Data (TTN Mapper conform)
            {
              decoded.latitude = parseFloat( bytes[++index] | ( bytes[++index] << 8 ) | ( bytes[++index] << 16 ) | ( bytes[++index] << 24 ) ) / 1000000;
              decoded.longitude = parseFloat( bytes[++index] | ( bytes[++index] << 8 ) | ( bytes[++index] << 16 ) | ( bytes[++index] << 24 ) ) / 1000000;
              decoded.altitude = bytes[++index] | ( bytes[++index] << 8 ) | ( bytes[++index] << 16 ) | ( bytes[++index] << 24 );
              decoded.altitude  = Number( ( decoded.altitude / 10000 ).toFixed( 2 ) );
              decoded.hdop = Number( parseFloat( String( bytes[++index] ) + "." + String( bytes[++index] * 4 ).padStart( 2, '0' ) ).toFixed( 2 ) );
              break;
            }
            case 0x05:  // Time Value
            {
              // Get the 16 bit value
              index++;    // Set index to high byte data value
              Temp_Value = (bytes[index] * 256);
              index++;    // Set index to low byte data value
              Temp_Value += bytes[index];
              
              switch (Temp_Value) {
                case 0x3fff:    // Special value
                  decoded.TimeValue_seconds = "Unknown";
                  break;
                case 0x3ffe:    // Special value
                  decoded.TimeValue_seconds = "Overflow";
                  break;
                default:        // Temperature value
                  switch (Temp_Value>>14) // Check time unit
                  {
                    case 0:    //seconds
                      Temp_Value = (Temp_Value&0x3fff);
                      break;
                    case 1:    //minutes
                      Temp_Value = (Temp_Value&0x3fff) * 60;
                      break;
                    case 2:    //hours
                      Temp_Value = (Temp_Value&0x3fff) * 60 * 60;
                      break;
                    case 3:    //days
                      Temp_Value = (Temp_Value&0x3fff) * 60 * 60 * 24;
                      break;
                    default:
                      Temp_Value = "Time Unit Error";
                      break;
                  }
                  decoded.TimeValue_seconds = Temp_Value;
                  break;
              }
              break;
            }
            case 0x06:  // Distance
            {
              // Get the 16 bit value
              index++;    // Set index to high byte data value
              Temp_Value = (bytes[index] * 256);
              index++;    // Set index to low byte data value
              Temp_Value += bytes[index];
              
              decoded.Distance = Temp_Value;
              break;
            }
            case 0x07:  // Battery Indicator
            {
              index++;  // Set index to battery indicator data value
              switch ( bytes[index] )
              {
                case 0x01:
                {
                  decoded.Battery_Indicator = "Battery_LOW";
                }
                break;
                case 0x02:
                {
                  decoded.Battery_Indicator = "Battery_OKAY";
                }
                break;
                case 0x03:
                {
                  decoded.Battery_Indicator = "Battery_HIGH";
                }
                break;
                default:
                {
                  decoded.Battery_Indicator = "Invalid_Value!";
                }
                break;
              }
            break;
            }
            case 0x08:  // Concentration
            {
              // Get the 16 bit value
              index++;    // Set index to high byte data value
              Temp_Value = (bytes[index] * 256);
              index++;    // Set index to low byte data value
              Temp_Value += bytes[index];
              
              switch (Temp_Value) {
                case 0x7fff:    // Special value
                  decoded.Concentration = "Unknown";
                  break;
                case 0x7ffe:    // Special value
                  decoded.Concentration = "Overflow";
                  break;
                case 0x7ffd:    // Special value
                  decoded.Concentration = "SensorError";
                  break;
                case 0x7ffc:    // Special value
                  decoded.Concentration = "CalibrationError";
                  break;
                case 0x7ffb:    // reserved
                case 0x7ffa:
                case 0x7ff9:
                case 0x7ff8:
                case 0x7ff7:
                case 0x7ff6:
                case 0x7ff5:
                case 0x7ff4:
                case 0x7ff3:
                case 0x7ff2:
                case 0x7ff1:
                case 0x7ff0:
                  decoded.Concentration = "reserved";
                  break;
                default:
                  // Convert to 16 bit signed value
                  if (Temp_Value > 0x7fff) {
                      Temp_Value -= 0x10000;
                  }
                  decoded.Concentration = Temp_Value;
                  break;
              }
              break;
            }
            
            //case 0x??:    // Further Data Type
            
            //  break;
            
            default:    // There is something wrong with the data type value
              // Removing all added properties from the "decoded" object with a deep clean
              // https://stackoverflow.com/questions/19316857/removing-all-properties-from-a-object/19316873#19316873
              // Object.keys(decoded).forEach(function(key){ delete decoded[key]; });
              
              // Clear all properties from the "decoded" object
              decoded = {};
              
              // Add error code propertiy to the "decoded" object
              decoded.parser_error = "Data Type Failure";
              break;
          }
        } while ((++index < bytes.length) && ('parser_error' in decoded === false));
      }
    }
    else {
      decoded.parser_error = "Not enough data";
    }
  }
  else {
    decoded.parser_error = "Wrong Port Number";
  }

  //return decoded;
 
  return {
    data: decoded,
  };
}
