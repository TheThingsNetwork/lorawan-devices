/*
 * ELV modular system Payload-Parser
 *
 * Version: V1.6.0
 *
 * */

function decodeUplink(input) {
  var data = input.bytes;
  var valid = true;

  if (typeof Decoder === "function") {
    data = Decoder(data, input.fPort);
  }

  if (typeof Converter === "function") {
    data = Converter(data, input.fPort);
  }

  if (typeof Validator === "function") {
    valid = Validator(data, input.fPort);
  }

  if (valid) {
    return {
      data: data
    };
  } else {
    return {
      data: {},
      errors: ["Invalid data received"]
    };
  }
}

var tx_reason = [
                  "Timer_Event",        // 0x00
                  "User_Button_Event",  // 0x01
                  "Input_Event",        // 0x02
                  "FUOTA_Event",        // 0x03
                  "Cyclic_Event",       // 0x04
                  "Timeout_Event"       // 0x05
                ];

/*
 * @brief   Receives the bytes transmitted from a device of the ELV modular system
 * @param   bytes:  Array with the data stream
 * @param   port:   Used TTN/TTS data port
 * @return  Decoded data from a device of the ELV modular system
 * */
function Decoder(bytes, port) {
  var decoded = {};   // Container with the decoded output
  var index = 5;      // Index variable for the application data in the bytes[] array
  var Temp_Value = 0; // Variable for temporarily calculated values

  if (port === 10) {  // The default port for app data
    if (bytes.length >= 5) {    // Minimum 5 Bytes for Header

      // Collecting header data
      if (0xff === bytes[0]) {                        //
        decoded.TX_Reason = "UNDEFINED_EVENT";        //
      } else if (tx_reason.length <= bytes[0]) {      // Verify that the TX_Reason value is within the available array elements
        decoded.TX_Reason = "UNKNOWN_EVENT --> Please update your payload parser";  // The TX_Reason value is not within the available array elements.
      } else {                                        // The TX_Reason value is within the available array elements.
        decoded.TX_Reason = tx_reason[bytes[0]];      // Read out the reason for sending
      }

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
            case 0x0B:  // Brightness in [lx]
            {
              // Get the 24 bit value
              index++;    // Set index to high byte data value
              Temp_Value = (bytes[index] * 65536);
              index++;    // Set index to mid byte data value
              Temp_Value += (bytes[index] * 256);
              index++;    // Set index to low byte data value
              Temp_Value += bytes[index];

              switch (Temp_Value) {
                case 0xffffff:    // Special value
                  decoded.Brightness = "Overflow";
                  break;
                default:        // Brightness value
                  Temp_Value *= 0.01;	// Adjust the Brightness resolution
                  decoded.Brightness = String(Temp_Value.toFixed(2));
                  break;
              }
              break;
            }
            case 0x0C:  // Acceleration Data
            {
              index++;  // Set index to reason for sending data value

              if (bytes[index] & 0x80) {
                decoded.In_Motion = "True";
              }
              else {
                decoded.In_Motion = "False";
              }

              if (bytes[index] & 0x08) {
                decoded.Tilt_Area_2 = "True";
              }
              else {
                decoded.Tilt_Area_2= "False";
              }

              if (bytes[index] & 0x04) {
                decoded.Tilt_Area_1 = "True";
              }
              else {
                decoded.Tilt_Area_1 = "False";
              }

              if (bytes[index] & 0x02) {
                decoded.Tilt_Area_0 = "True";
              }
              else {
                decoded.Tilt_Area_0 = "False";
              }

              if (bytes[index] & 0x01) {
                decoded.Acceleration = "True";
              }
              else {
                decoded.Acceleration = "False";
              }

              index++;  // Set index to tilt angle data value

              decoded.Tilt_Angle = bytes[index];

              break;
            }
            case 0x0D:  // Voltage + Current + Power
            {
              index++;
              const bitfield = bytes[index];
              for (let i = 0; i < 4; i++) {
                if (bitfield & (1 << i)) {
                  // Get the 16 bit value
                  index++; // Set index to high byte data value
                  Temp_Value = (bytes[index] * 256);
                  index++; // Set index to low byte data value
                  Temp_Value += bytes[index];
                  Temp_Value *= 0.001;	// Adjust the resolution
                  switch (i) {
                    case 0:
                      decoded.Voltage = String(Temp_Value.toFixed(3));
                      break;
                    case 1:
                      decoded.Voltage2 = String(Temp_Value.toFixed(3));
                      break;
                    case 2:
                      decoded.Voltage3 = String(Temp_Value.toFixed(3));
                      break;
                    case 3:
                      decoded.Voltage4 = String(Temp_Value.toFixed(3));
                      break;
                  }

                  // Get the 16 bit value
                  index++; // Set index to high byte data value
                  Temp_Value = (bytes[index] * 256);
                  index++; // Set index to low byte data value
                  Temp_Value += bytes[index];
                  // Convert to 16 bit signed value
                  if (Temp_Value > 0x7fff) {
                    Temp_Value -= 0x10000;
                  }
                  Temp_Value *= 0.001;	// Adjust the resolution
                  switch (i) {
                    case 0:
                      decoded.Current = String(Temp_Value.toFixed(3));
                      break;
                    case 1:
                      decoded.Current2 = String(Temp_Value.toFixed(3));
                      break;
                    case 2:
                      decoded.Current3 = String(Temp_Value.toFixed(3));
                      break;
                    case 3:
                      decoded.Current4 = String(Temp_Value.toFixed(3));
                      break;
                  }

                  // Get the 16 bit value
                  index++; // Set index to high byte data value
                  Temp_Value = (bytes[index] * 256);
                  index++; // Set index to low byte data value
                  Temp_Value += bytes[index];
                  switch (Temp_Value >> 14) {
                    default:
                    case 0:
                      Temp_Value = (Temp_Value & 0x3fff) * 0.001;	// Adjust the resolution
                      break;
                    case 1:
                      Temp_Value = (Temp_Value & 0x3fff) * 0.01;	// Adjust the resolution
                      break;
                    case 2:
                      Temp_Value = (Temp_Value & 0x3fff) * 0.1;	// Adjust the resolution
                      break;
                    case 3:
                      Temp_Value = (Temp_Value & 0x3fff) * 1;	// Adjust the resolution
                      break;
                  }
                  switch (i) {
                    case 0:
                      decoded.Power = String(Temp_Value.toFixed(3));
                      break;
                    case 1:
                      decoded.Power2 = String(Temp_Value.toFixed(3));
                      break;
                    case 2:
                      decoded.Power3 = String(Temp_Value.toFixed(3));
                      break;
                    case 3:
                      decoded.Power4 = String(Temp_Value.toFixed(3));
                      break;
                  }
                }
              }
              break;
            }
            case 0x0E: // Pressure
            {
              // Get the 24 bit value
              index++;    // Set index to high byte data value
              Temp_Value = (bytes[index] * 65536);
              index++;    // Set index to mid byte data value
              Temp_Value += (bytes[index] * 256);
              index++;    // Set index to low byte data value
              Temp_Value += bytes[index];

              Temp_Value /= 10;	// Adjust the resolution
              decoded.Pressure = Temp_Value.toFixed(1);
              break;
            }
            case 0x0F:  // Error-Bitfield
            {
              index++;    // Set index to data value
              if (bytes[index])
              {
                decoded.Error = "";
                if (bytes[index] & 0x01){  // if Input 1 enabled
                  decoded.Error += "Bit0 " ;
                  }
                if (bytes[index] & 0x02){  // if Input 1 enabled
                  decoded.Error += "Bit1 " ;
                  }
               	if (bytes[index] & 0x04){  // if Input 1 enabled
                  decoded.Error += "Bit2 " ;
                  }
                if (bytes[index] & 0x08){  // if Input 1 enabled
                  decoded.Error += "Bit3 " ;
                  }
                if (bytes[index] & 0x10){  // if Input 1 enabled
                  decoded.Error += "Bit4 " ;
                  }
                if (bytes[index] & 0x20){  // if Input 1 enabled
                  decoded.Error += "Bit5 " ;
                  }
                if (bytes[index] & 0x40){  // if Input 1 enabled
                  decoded.Error += "Bit6 " ;
                  }
                if (bytes[index] & 0x80){  // if Input 1 enabled
                  decoded.Error += "Bit7 " ;
                  }
              }
              else
              {
               decoded.Error = "None ";
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
              decoded.parser_error = "Data Type Failure --> Please update your payload parser";
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

  return decoded;
}
