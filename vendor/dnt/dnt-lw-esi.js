/*
* dnt-LW-ESI Payload Parser
*
* Version: V1.0.6
*
* */
 
var tx_reason = [ "Reserved", "Join_Button_Pressed", "Cyclic_Timer", "Settings", "Joined" ];
var frame_type = [ "Reserved", "Sensor_Data", "Config_Data_Spreading_Factor", "Config_Data_Rejoin", "Config_Data_All", "Device_Info"];
var error_msg = [ "No_Error" , "No_Sensor_Connected", "Sensor_Communication_Error" ];
var energy_type = [ "Reserved", "Power", "Flow", "Energy Counter", "Reserved", "Volume" ];
var energy_channel = [ "Reserved", "Power", "Energy Counter Consumption HT", "Energy Counter Consumption NT", "Energy Counter Delivery" ];
var energy_power_unit = [ "Reserved", "W", "m^3/h" ];
var energy_counter_unit = [ "Reserved", "Wh", "m^3"];
var energy_value = [ "Reserved", "Unknown", "Overflow", "Underflow" ];
var spreading_factor = [ "ADR", "SF7", "SF8", "SF9", "SF10", "SF11", "SF12" ];
 
/*
* @brief   Receives the bytes transmitted from a device of the dnt-LW-ESI
* @param   bytes:  Array with the data stream
* @param   port:   Used TTN/TTS data port
* @return  Decoded data from a device of the dnt-LW-ESI
* */
function decodeUplink(input)
{
  var bytes = input.bytes;
  var port = input.fPort;

  var decoded = {};   // Container with the decoded output
  
  Energy_Data = {
                  Type:         [],
                  Channel:      [],
                  Value:        [],
                  Unit:         []
                };
                
  index_energy_data = 0; 
 
  if (port === 10)
  {
    // The default port for app data
    // Minimum 5 Bytes for Header
 
    // Collecting header data
    decoded.TX_Reason = tx_reason[(bytes[0])];
    decoded.Supply_Voltage = parseFloat((1 + (bytes[1] >> 6)) + (bytes[1] & 0x3F)*0.02);
    decoded.Frame_Type = frame_type[(bytes[2])]; 
    
    //Frametype encodes what Kind of Payload is being send
    switch ( bytes[2] )
    {
      case 0x00:
      case 0x01: // fallthrough
      {
        decoded.Frame_Type = frame_type[(bytes[2])]; 
      } break;
      
      case 0xF8:
      {
        decoded.Frame_Type = frame_type[2]; 
      } break;
 
      case 0xFA:
      {
        decoded.Frame_Type = frame_type[3]; 
      } break;
      
      case 0xFC:
      {
        decoded.Frame_Type = frame_type[4]; 
      } break;
      
      case 0xFF:
      {
        decoded.Frame_Type = frame_type[5]; 
      } break;
      
      default:
      {
        decoded.Frame_Type = frame_type[0];
      } break;
    }
    
    //Write every reason for sending correspondig to bit n
    switch (decoded.Frame_Type)
    {
      case "Sensor_Data":
      {              
        decoded.Error_Msg = error_msg[(bytes[3])];
        
        index_energy_data = 0; 
        
        Energy_Data.Type[index_energy_data] = energy_type[(bytes[4])];
        Energy_Data.Unit[index_energy_data] = energy_power_unit[(bytes[4])];              
        Energy_Data.Channel[index_energy_data] = energy_channel[(bytes[5])];
        
        Energy_Data.Value[index_energy_data] = ( Number( "0x" + byteToString( bytes[8] ) + byteToString( bytes[7] ) + byteToString( bytes[6] ) ) );
        
        if ( Energy_Data.Value[index_energy_data] > 0x7FFFEF )
        {
          if( Energy_Data.Value[index_energy_data] == 0x800000 )
          {
            Energy_Data.Value[index_energy_data] = "Unknown";
          }
          else if( Energy_Data.Value[index_energy_data] == 0x800001 )
          {
            Energy_Data.Value[index_energy_data] = "Overflow";
          }
          else if( Energy_Data.Value[index_energy_data] == 0x800002 )
          {
            Energy_Data.Value[index_energy_data] = "Underflow";
          }
          else
          {
            Energy_Data.Value[index_energy_data] -= 0x1000000;
            Energy_Data.Value[index_energy_data] /= 100.0;
          }
        }
        else
        {
          if( Energy_Data.Type[index_energy_data] == "Power" )
          {
            Energy_Data.Value[index_energy_data] /= 100.0;
          }
          else if( Energy_Data.Type[index_energy_data] == "Flow" )
          {
            Energy_Data.Value[index_energy_data] /= 100.0;
          }
        }
        
        index_energy_data = 1;
 
        Energy_Data.Type[index_energy_data] = energy_type[((bytes[9]) >> 3) + 1];
        Energy_Data.Unit[index_energy_data] = energy_counter_unit[(bytes[9] >> 4)]; 
        Energy_Data.Channel[index_energy_data] = energy_channel[(bytes[10])];
        Energy_Data.Value[index_energy_data] = ( Number( "0x" + byteToString( bytes[15] ) + byteToString( bytes[14] ) + byteToString( bytes[13] ) + byteToString( bytes[12] ) + byteToString( bytes[11] ) ) );   
        
        if( Energy_Data.Value[index_energy_data] == 0xFFFFFFFFFF )
        {
          Energy_Data.Value[index_energy_data] = "Unknown";
        }
        else if( Energy_Data.Value[index_energy_data] > 0xFFFFFFFFEF )
        {
          Energy_Data.Value[index_energy_data] = "Overflow";
        }
        else
        {
          if( Energy_Data.Type[index_energy_data] == "Energy Counter" )
          {
            Energy_Data.Value[index_energy_data] /= 10.0;
          }
          else if( Energy_Data.Type[index_energy_data] == "Volume" )
          {
            Energy_Data.Value[index_energy_data] /= 10000.0;
          }
        }
 
        if( bytes.length > ( 0x10 ) )
        {
          index_energy_data = 2; 
          
          Energy_Data.Type[index_energy_data] = energy_type[((bytes[16] >> 3) + 1)];
          Energy_Data.Unit[index_energy_data] = energy_counter_unit[(bytes[16] >> 4 )];
          Energy_Data.Channel[index_energy_data] = energy_channel[(bytes[17])];
          Energy_Data.Value[index_energy_data] = ( Number( "0x" + byteToString( bytes[22] ) + byteToString( bytes[21] ) + byteToString( bytes[20] ) + byteToString( bytes[19] ) + byteToString( bytes[18] ) ) );
       
          if( Energy_Data.Value[index_energy_data] == 0xFFFFFFFFFF )
          {
            Energy_Data.Value[index_energy_data] = "Unknown";
          }
          else if( Energy_Data.Value[index_energy_data] > 0xFFFFFFFFEF )
          {
            Energy_Data.Value[index_energy_data] = "Overflow";
          }
          else
          {
            Energy_Data.Value[index_energy_data] /= 10.0;
          }
        
          index_energy_data = 3;
       
          Energy_Data.Type[index_energy_data] = energy_type[((bytes[23] >> 3) + 1)];
          Energy_Data.Unit[index_energy_data] = energy_counter_unit[(bytes[23] >> 4 )];      
          Energy_Data.Channel[index_energy_data] = energy_channel[(bytes[24])];
          Energy_Data.Value[index_energy_data] = ( Number( "0x" + byteToString( bytes[29] ) + byteToString( bytes[28] ) + byteToString( bytes[27] ) + byteToString( bytes[26] ) + byteToString( bytes[25] ) ) );
        
          if( Energy_Data.Value[index_energy_data] == 0xFFFFFFFFFF )
          {
            Energy_Data.Value[index_energy_data] = "Unknown";
          }
          else if( Energy_Data.Value[index_energy_data] > 0xFFFFFFFFEF )
          {
            Energy_Data.Value[index_energy_data] = "Overflow";
          }
          else
          {
            Energy_Data.Value[index_energy_data] /= 10.0;
          }
        }
        
        decoded.Energy_Data = Energy_Data;  
        
      } break;
         
      case "Config_Data_Spreading_Factor":
      {         
        decoded.Spreading_Factor = bytes[3];
        
        switch ( bytes[3] )
        {
          case 0x00:
          {
            decoded.Spreading_Factor = spreading_factor[(bytes[3])]; 
          } break;
          
          case 0x07:
          case 0x08: // fallthrough
          case 0x09:
          case 0x0A:
          case 0x0B:
          case 0x0C:
          {
            decoded.Spreading_Factor = spreading_factor[( (bytes[3]) - 6 )];
          } break;
          
          default:
          {
          } break;
        }
      
      } break;
      
      case "Config_Data_Rejoin":
      {         
        decoded.Rejoin_Cycle_On_Time = ( bytes[3] >> 7 );
      
        decoded.Rejoin_Cycle_Interval = ( ( ( bytes[3] & 0x7F ) << 8  ) | bytes[4] ) ;
      } break;
      
      
      case "Config_Data_All":
      {         
        decoded.Config_Channel = bytes[3];
      
        switch ( decoded.Config_Channel )
        {
          case 0x0A:
          {
            decoded.Send_Cycle = bytes[4];
          }break;
          
          case 0x01:
          {
            decoded.Meter_Type = bytes[4];
            decoded.Gas_Meter_Constant = (bytes[5] << 8 | bytes[6]);
            decoded.Led_Meter_Constant = (bytes[7] << 8 | bytes[8]);
            decoded.OBIS_Power_Str = String.fromCharCode(bytes[9], bytes[10], bytes[11], bytes[12], bytes[13], bytes[14], bytes[15], bytes[16], bytes[17], bytes[18], bytes[19], bytes[20], bytes[21], bytes[22], bytes[23], bytes[24]);
          }break;
          
          case 0x02:
          {
            decoded.OBIS_Energy_Counter_Consumption_HT_Str = String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7], bytes[8], bytes[9], bytes[10], bytes[11], bytes[12], bytes[13], bytes[14], bytes[15], bytes[16], bytes[17], bytes[18], bytes[19]);
          }break;
          
          case 0x03:
          {
            decoded.OBIS_Energy_Counter_Consumption_NT_Str = String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7], bytes[8], bytes[9], bytes[10], bytes[11], bytes[12], bytes[13], bytes[14], bytes[15], bytes[16], bytes[17], bytes[18], bytes[19]);
          }break;
          
          case 0x04:
          {
            decoded.OBIS_Energy_Counter_Delivery_Str = String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7], bytes[8], bytes[9], bytes[10], bytes[11], bytes[12], bytes[13], bytes[14], bytes[15], bytes[16], bytes[17], bytes[18], bytes[19]);
          }break;
        }
      } break;
      
      case "Device_Info":
      {
        var bl_version_major = bytes[3];
        var bl_version_minor = bytes[4];
        var bl_version_patch = bytes[5];
 
        decoded.Bootloader_Version = `${bl_version_major}.${bl_version_minor}.${bl_version_patch}`; //Build version-String from 3 previous values
 
        var fw_version_major = bytes[6];
        var fw_version_minor = bytes[7];
        var fw_version_patch = bytes[8];
 
        decoded.Firmware_Version = `${fw_version_major}.${fw_version_minor}.${fw_version_patch}`;//Build version-String from 3 previous values
 
        decoded.Hw_Revision = bytes[9] << 8 | bytes[10]; //Hardware version is encoded as 16-Bit int  
      } break;
    }
  }
  else 
  {
    decoded.parser_error = "Wrong Port Number";
  }

  return {
    data: decoded,
    warnings: [],
    errors: []
  };
  
}
 
var byteToString = function( value )
{
  var hex = Number( value ).toString( 16 );
  if( hex.length < 2 )
  {
    hex = "0" + hex;
  }
  return hex;
};