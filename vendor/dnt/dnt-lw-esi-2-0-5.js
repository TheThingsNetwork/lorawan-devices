// Payoad parser dnt-LW-ESI
// v2.0.5

var CMD_GET_STATUS_INTERVAL = 0;
var CMD_GET_STATUS_PARAMETER_ENABLE_REGISTER = 2;
var CMD_GET_STATUS = 4;
var CMD_GET_BAT_VOLTAGE = 5;
var RESPONSE_CMD_FAILED = 6;
var CMD_GET_ERROR = 7;
var CMD_GET_DEVICE_TIME = 8;
var CMD_GET_DEVICE_TIME_CONFIG = 10;

var CMD_GET_OBIS_CODE = 13;
var CMD_GET_SENSORTYPE = 15;
var CMD_GET_GAS_CONSTANT = 17;
var CMD_GET_LED_CONSTANT = 19;
var CMD_GET_ENERGY_COUNTER_OFFSET = 21;



var COMMAND_ID_GET_AUTO_UPDATE_INSTALLATION = 112;
var COMMAND_ID_GET_PENDING_UPDATE_INFO = 115;

var GET_HW_LOCK = 117;
var GET_TIME_TILL_REJOIN = 119;
var GET_LORAWAN_DATARATE = 120;
var GET_REJOIN_CONFIG = 122;
var GET_ALL_CONFIG = 124;
var GET_DEVICE_INFO = 127;


var STATUS_PARAM_BAT_VOLTAGE_BIT = 0x01;
var STATUS_PARAM_ENERGY_DATA = 0x02;
var STATUS_PARAM_SENSOR_TYPE = 0x04;


var sensor_data_type = ["Power", "Flow", "Reserved", "Consumption", "Consumption T1", "Consumption T2", "Consumption T3", "Consumption calculated", "Delivery", "Delivery T1", "Delivery T2", "Delivery calculated"];
var sensor_data_unit = ["Reserved", "W", "m^3/h", "Wh", "m^3" ];


function decodeUplink(input){

  var payload = input.bytes;
  var port = input.fPort;
  
  var decoded = {};
  var index = 0;
	  
  var next_field = 0;
  var config = {};
  var device_time = {};
  
  var index_energy_data = 0;
  var num_energy_data = 0;
    
  var Energy_Data = {
	  Type:         [],
	  Channel:      [],
	  Value:        [],
	  Unit:         [],
	};
				
  var obis_codes = {
	Number:			[],
	String:			[]
  };
  
  if( port != 10 ){
    return {
      data: { bytes: payload, port: port }
    };
  }

  while( index < payload.length ){
    
    next_field = payload[index++];
    
    
    if( next_field == CMD_GET_STATUS_INTERVAL ){
      decoded.status_interval = (payload[index++] * 360) + 360;
    }
    else if( next_field == CMD_GET_STATUS_PARAMETER_ENABLE_REGISTER ){
      decoded.status_param_en_register = payload[index++];
    }
    else if( next_field == CMD_GET_STATUS ){
      
      var tx_en_reg = payload[index++];
      
      if( tx_en_reg & STATUS_PARAM_BAT_VOLTAGE_BIT ){
        decoded.voltage = (payload[index++] * 10) + 1500;
      }
   
  	  if( tx_en_reg & STATUS_PARAM_ENERGY_DATA ){
        num_energy_data = payload[index++];
  	  
		while( index_energy_data < num_energy_data ){

			Energy_Data.Type[index_energy_data] = sensor_data_type[(payload[index] - 1) & 0x0F];
			Energy_Data.Unit[index_energy_data] = sensor_data_unit[(payload[index++] >> 4)];  

			if( Energy_Data.Type[index_energy_data] === "Power" || Energy_Data.Type[index_energy_data] === "Flow" ){
				Energy_Data.Value[index_energy_data] = Number( "0x" + bytesTohexString(payload.slice(index, index + 3), 3) );
				index += 3;
				
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
			}
			else{ 
				Energy_Data.Value[index_energy_data] = Number( "0x" + bytesTohexString(payload.slice(index, index + 5), 5) );
				index += 5;
				
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
				  if( Energy_Data.Unit[index_energy_data] == "Wh" )
				  {
					Energy_Data.Value[index_energy_data] /= 10.0;
				  }
				  else if( Energy_Data.Unit[index_energy_data] == "m^3" )
				  {
					Energy_Data.Value[index_energy_data] /= 10000.0;
				  }
				}
			}
		
			index_energy_data++;
		}
   
        if( num_energy_data ){
          decoded.Energy_Data = Energy_Data;     
        }
      }
	  
      if( tx_en_reg & STATUS_PARAM_SENSOR_TYPE ){
        decoded.sensor_type = payload[index++];
      }
	  
	  
    }
    else if( next_field == CMD_GET_BAT_VOLTAGE ){
      decoded.voltage = (payload[index++] * 10) + 1500;
    }
    else if( next_field == CMD_GET_ERROR ){
      decoded.error = DEVICE_ERRORS[payload[index++]];
    }
    else if( next_field == CMD_GET_DEVICE_TIME ){
      decoded.device_time = device_time;
      
      decoded.device_time.local = decoded.device_time.local || {};
      decoded.device_time.local.second = {};
      decoded.device_time.local.minute = {};
      decoded.device_time.local.hour = {};
      decoded.device_time.local.day = {};
      decoded.device_time.local.weekday = {};
      decoded.device_time.local.month = {};
      decoded.device_time.local.year = {};
      decoded.device_time.local.is_dst = {};
      decoded.device_time.local.utc_offset = {};

      decoded.device_time.local.second = payload[index++] & 0x3F;
      decoded.device_time.local.minute = (payload[index] >> 2) & 0x3F;
      decoded.device_time.local.hour = ((payload[index++] & 0x03) << 3) + (payload[index] >> 5);
      decoded.device_time.local.day = payload[index++] & 0x1F;

      decoded.device_time.local.is_dst = !!(payload[index] & 0x80);
      decoded.device_time.local.weekday = WEEKDAY[(payload[index] >> 4) & 0x07];
      decoded.device_time.local.month = MONTH[payload[index++] & 0x0F];
      decoded.device_time.local.year = payload[index++] + 2000;
      decoded.device_time.local.utc_offset = (payload[index++] * 0.25 - 12).toFixed(2);
    }
    else if( next_field == CMD_GET_DEVICE_TIME_CONFIG ){
      decoded.device_time = decoded.device_time || {};
      decoded.device_time.config = decoded.device_time.config || {};
      decoded.device_time.config.utc_dst_begin = {};
      decoded.device_time.config.utc_dst_end = {};

      decoded.device_time.config.auto_time_sync_en = !!(payload[index] >> 7);
      decoded.device_time.config.utc_offset = ((payload[index++] & 0x7F) * 0.25 - 12).toFixed(2);
      decoded.device_time.config.utc_dst_begin.week_of_month = WEEK_OF_MONTH[ (payload[index] >> 4) & 0x0F ];
      decoded.device_time.config.utc_dst_begin.month = MONTH[payload[index++] & 0x0F];
      decoded.device_time.config.utc_dst_begin.weekday = WEEKDAY[payload[index] >> 5];
      decoded.device_time.config.utc_dst_begin.hour = (payload[index++] & 0x0F);
      decoded.device_time.config.utc_dst_offset = ((payload[index++] & 0x7F) * 0.25 - 12).toFixed(2);
      decoded.device_time.config.utc_dst_end.week_of_month = WEEK_OF_MONTH[ (payload[index] >> 4) & 0x0F ];
      decoded.device_time.config.utc_dst_end.month = MONTH[payload[index++] & 0x0F];
      decoded.device_time.config.utc_dst_end.weekday = WEEKDAY[payload[index] >> 5];
      decoded.device_time.config.utc_dst_end.hour = (payload[index++] & 0x0F);
      decoded.device_time.config.utc_dst_begin.minute = (payload[index] >> 4) * 5;
      decoded.device_time.config.utc_dst_end.minute = (payload[index++] & 0x0F) * 5;
    }
	else if( next_field == CMD_GET_OBIS_CODE ){
		var code_idx = 0;
		var num_codes = payload[index++];
		
		while( code_idx < num_codes )
		{
			obis_codes.Number[code_idx] = (payload[index] >> 4);
			var str_size = (payload[index++] & 0x0f);
			
			obis_codes.String[code_idx] = String.fromCharCode( ...payload.slice(index, index + str_size) );
			index += str_size;

			code_idx++;
		}
		
		decoded.OBIS_codes = obis_codes;
	}
	else if( next_field == CMD_GET_SENSORTYPE ){
		decoded.Meter_Type = payload[index++];
	}
	else if( next_field == CMD_GET_GAS_CONSTANT ){
		decoded.Gas_Meter_Constant = (payload[index] << 8 | payload[index + 1]);
		index += 2;
	}
	else if( next_field == CMD_GET_LED_CONSTANT ){
		decoded.Led_Meter_Constant = (payload[index] << 8 | payload[index + 1]);
		index += 2;
	}
	else if( next_field == CMD_GET_ENERGY_COUNTER_OFFSET ){
		decoded.Energy_counter_offset = (payload[index] * 4294967296) + (payload[index + 1] * 16777216) + (payload[index + 2] * 65536) + (payload[index + 3] * 256) + payload[index + 4];
		index += 5;
	}
  else if( next_field == RESPONSE_CMD_FAILED ){
      var nb_failed_cmds = payload[index++];
      var errors = [];
      
      for( var i = 0; i < nb_failed_cmds; i++ ){
        errors.push(payload[index++]);
      }
      
      decoded.failed_commands = errors;
    }
    else if( next_field == COMMAND_ID_GET_AUTO_UPDATE_INSTALLATION ){
      decoded.update_info = decoded.update_info || {};
      decoded.update_info.auto_update_installation_en = {};
      decoded.update_info.auto_update_installation_en = !!(payload[index++]);
    }
    else if( next_field == COMMAND_ID_GET_PENDING_UPDATE_INFO ){
      decoded.update_info = decoded.update_info || {};
      decoded.update_info.update_image = decoded.update_info.update_image || {};
      decoded.update_info.update_image.type = {};
      decoded.update_info.update_image.version = {};

      decoded.update_info.update_image.type = UPDATE_IMAGE_TYPE[payload[index++]];
      decoded.update_info.update_image.version = payload[index++] + ".";
      decoded.update_info.update_image.version += payload[index++] + ".";
      decoded.update_info.update_image.version += payload[index++];
    }

    else if( next_field == GET_HW_LOCK ){
      decoded.device_hw_lock = payload[index++];
    }
    else if( next_field == GET_TIME_TILL_REJOIN ){
      decoded.time_till_rejoin = int24(payload.slice(index, index + 3));
      index += 3;
    }
    else if( next_field == GET_LORAWAN_DATARATE ){
      decoded.datarate_config = payload[index++];
    }
    else if( next_field == GET_REJOIN_CONFIG ){
      decoded.rejoin_config = uint16(payload.slice(index, index + 2));
      index += 2;
    }
    else if( next_field == GET_DEVICE_INFO ){
      decoded.device_info = read_device_info(payload.slice(index, index + 13));
      index += 13;
    }

     
  }
  
 
 return {data: decoded}; 
}

  
const UPDATE_IMAGE_TYPE =
{
  0: "UPDATE_IMAGE_NOT_VALID",
  1: "UPDATE_IMAGE_APPLICATION",
  2: "UPDATE_IMAGE_BOOTLOADER",
  3: "UPDATE_IMAGE_COPROCESSOR",
};



var DEVICE_ERRORS = [
  "NO_ERROR",
  "NO_SENSOR_ERROR",
  "SENSOR_DATA_ERROR",
  ];


const MONTH = 
{
  0: "JANUARY",
  1: "FEBRUARY",
  2: "MARCH",
  3: "APRIL",
  4: "MAY",
  5: "JUNE",
  6: "JULY",
  7: "AUGUST",
  8: "SEPTEMBER",
  9: "OCTOBER",
  10: "NOVEMBER",
  11: "DECEMBER"
};
 
const WEEK_OF_MONTH =
{
  1: "1st",
  2: "2nd",
  3: "3rd",
  4: "4th",
  5: "last"
};

const WEEKDAY = 
{
  0: "SU",
  1: "MO",
  2: "TU",
  3: "WE",
  4: "TH",
  5: "FR",
  6: "SA"
};



function int16(bytes){
  return ((bytes[0] << 8) | bytes[1]);
}

function uint16(bytes){
  var signed = ((bytes[0] << 8) | bytes[1]);
  
  if( signed & 0x8000 ){
    signed -= 0x10000;
  }
  return signed;
}

function int24(bytes){
  return ((bytes[0] << 16) | (bytes[1] << 8) | bytes[2]);
}

function uint24(bytes){
  var signed = ((bytes[0] << 16) | (bytes[1] << 8) | bytes[2]);
  
  if( signed & 0x800000 ){
    signed -= 0x1000000;
  }
  return signed;
}

function int32(bytes){
  return ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]);
}

var bytesTohexString = function( bytes, len )
{
  var hex_str = "";
  
  for( var i = (len - 1); i >= 0; i-- ){
  
    var hex = Number( bytes[i] ).toString( 16 );
    if( hex.length < 2 )
    {
      hex = "0" + hex;
    }
    
    hex_str += hex;
  }
  
  return hex_str;
};

function read_device_info(bytes){
  var index = 0;
  var info = {}

  info.device_type = (bytes[index++] << 16);
  info.device_type += (bytes[index++] << 8);
  info.device_type += bytes[index++];
  
  info.fw_version = bytes[index++] + ".";
  info.fw_version += bytes[index++] + ".";
  info.fw_version += bytes[index++];
  
  info.bl_version = bytes[index++] + ".";
  info.bl_version += bytes[index++] + ".";
  info.bl_version += bytes[index++];
  
  info.hw_version = bytes[index++];
  
  info.lrwan_version = bytes[index++] + ".";
  info.lrwan_version += bytes[index++] + ".";
  info.lrwan_version += bytes[index++];
  
  return info;
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