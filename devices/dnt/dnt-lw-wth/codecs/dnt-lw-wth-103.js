// Payoad parser dnt-LW-WTH
// v1.0.3

var CMD_GET_STATUS_INTERVAL = 0;
var CMD_GET_STATUS_PARAMETER_ENABLE_REGISTER = 2;
var CMD_GET_STATUS = 4;
var CMD_GET_BAT_VOLTAGE = 5;
var CMD_GET_ACTIVE_MODE = 6;
var CMD_GET_ERROR = 7;
var CMD_GET_DEVICE_TIME = 8;
var CMD_GET_DEVICE_TIME_CONFIG = 10;
var CMD_GET_MODE_STATUS = 12;

var CMD_GET_HOLIDAY_MODE_CONFIG = 18;
var CMD_GET_WEEK_PROGRAMM = 22;

var CMD_GET_SET_POINT = 33;
var CMD_GET_TEMPERATURE_OFFSET = 36;
var CMD_GET_ROOM_TEMPERATURE = 38;

var CMD_GET_WINDOW_OPEN_STATUS = 46;
var CMD_GET_WINDOW_OPEN_CONFIG = 48;

var RESPONSE_CMD_FAILED = 54;
var CMD_GET_DISPLAY_MODE = 55;
var CMD_GET_MINIMUM_SET_POINT = 57;
var CMD_GET_MAXIMUM_SET_POINT = 59;
var CMD_GET_MINIMUM_HOLIDAY_SET_POINT = 61;
var CMD_GET_MAXIMUM_HOLIDAY_SET_POINT = 63;
var CMD_GET_HOLIDAY_SET_POINT = 65;
var CMD_GET_HUMIDITY = 67;

var GET_COPRO_VERSION = 244;
var GET_HW_LOCK = 245;
var GET_TIME_TILL_REJOIN = 247
var GET_LORAWAN_DATARATE = 248;
var GET_REJOIN_CONFIG = 250;
var GET_ALL_CONFIG = 252;
var GET_DEVICE_INFO = 255;


var STATUS_PARAM_BAT_VOLTAGE_BIT = 0x01;
var STATUS_PARAM_CTRL_INPUT_ROOM_TEMPERATURE = 0x02;
var STATUS_PARAM_CTRL_INPUT_ROOM_HUMIDITY = 0x04;
var STATUS_PARAM_CTRL_INPUT_SET_POINT_TEMPERATURE = 0x08;
var STATUS_PARAM_CTRL_MISC_FLAGS = 0x10;

var MISC_FLAG_WINDOW_OPEN = 0x01;
var MISC_FLAG_HOLIDAY_MODE_PENDING = 0x02;
var MISC_FLAG_CURRENT_MODE_MSK = 0x04 | 0x08 | 0x10 | 0x20;
var MISC_FLAG_TEMPERATURE_NOT_RISING = 0x10;


function decodeUplink(input){

  var bytes = input.bytes;
  var port = input.fPort;

  var payload = bytes;
  var decoded = {};
  var index = 0;
	  
  var next_field = 0;
  var config = {};
  var copro_version = {};
  var device_time = {};
  

  while( index < payload.length ){
    
    next_field = payload[index++];
    
    
    if( next_field == CMD_GET_STATUS_INTERVAL ){
      decoded.status_interval = (payload[index++] * 30) + 30;
    }
    else if( next_field == CMD_GET_STATUS_PARAMETER_ENABLE_REGISTER ){
      decoded.status_param_en_register = payload[index++];
    }
    else if( next_field == CMD_GET_STATUS ){
      
      var tx_en_reg = payload[index++];
      
      if( tx_en_reg & STATUS_PARAM_BAT_VOLTAGE_BIT ){
        decoded.voltage = (payload[index++] * 10) + 1500;
      }
      if( tx_en_reg & STATUS_PARAM_CTRL_INPUT_ROOM_TEMPERATURE ){
        decoded.room_temperature = (payload[index++] << 8);
        decoded.room_temperature += payload[index++];
      }
      if( tx_en_reg & STATUS_PARAM_CTRL_INPUT_ROOM_HUMIDITY ){
        decoded.room_humidity = payload[index++];
      }
      if( tx_en_reg & STATUS_PARAM_CTRL_INPUT_SET_POINT_TEMPERATURE ){
        decoded.set_point_temperature = (payload[index++] * 0.5).toFixed(1);
      }
      if( tx_en_reg & STATUS_PARAM_CTRL_MISC_FLAGS ){
        var flags = payload[index++];
        
        decoded.misc_flags = decoded.misc_flags  || {};
                
        decoded.misc_flags.window_open = 0;
        decoded.misc_flags.holiday_mode_pending = 0;
        decoded.misc_flags.active_mode = POSSIBLE_ACTIVE_MODES[(flags & MISC_FLAG_CURRENT_MODE_MSK) >> 2];
        
        if( flags & MISC_FLAG_WINDOW_OPEN ){
          decoded.misc_flags.window_open = 1;
        }
        if( flags & MISC_FLAG_HOLIDAY_MODE_PENDING ){
          decoded.misc_flags.holiday_mode_pending = 1;
        }
        if( flags & MISC_FLAG_TEMPERATURE_NOT_RISING ){
          decoded.misc_flags.temperature_too_low = 1;
        }      
        
      }
    }
    else if( next_field == CMD_GET_BAT_VOLTAGE ){
      decoded.voltage = (payload[index++] * 10) + 1500;
    }
    else if( next_field == CMD_GET_ACTIVE_MODE ){
      decoded.active_mode = POSSIBLE_ACTIVE_MODES[payload[index++]];
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

      decoded.device_time.local.second = payload[index++] & 0x1F;
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
    else if( next_field == CMD_GET_MODE_STATUS ){
      decoded.mode_status = decoded.mode_status || {};
      decoded.mode_status.sub_modes = decoded.mode_status.sub_modes || {};
      
      decoded.mode_status.active_main_mode = (payload[index] >> 6) & 0x03;
      decoded.mode_status.week_programm_sel = (payload[index+1] >> 6) & 0x03;
      decoded.mode_status.sub_modes.holiday_en = (payload[index] >> 5) & 0x01;
      decoded.mode_status.sub_modes.holiday_pend = (payload[index] >> 4) & 0x01;
      
      decoded.mode_status.sub_modes.frost_protection_en = (payload[index] >> 2) & 0x01;
      decoded.mode_status.sub_modes.window_open_en = (payload[index] >> 1) & 0x01;
      decoded.mode_status.sub_modes.emergency_en = payload[index] & 0x01;
      
      index += 2;
    }
    else if( next_field == CMD_GET_HOLIDAY_MODE_CONFIG){
      decoded.heating_control = decoded.heating_control || {};
      decoded.heating_control.mode = decoded.heating_control.mode || {};
      decoded.heating_control.mode.holiday = decoded.heating_control.mode.holiday || {};
      decoded.heating_control.mode.holiday = {};
      decoded.heating_control.mode.holiday.begin = decoded.heating_control.mode.holiday.begin || {};
      decoded.heating_control.mode.holiday.end = decoded.heating_control.mode.holiday.end || {};

      decoded.heating_control.mode.holiday.begin.minute = ((payload[index] >> 2) & 0x0F) * 5;
      decoded.heating_control.mode.holiday.begin.hour = ((payload[index++] & 0x03) << 3) + (payload[index] >> 5);
      decoded.heating_control.mode.holiday.begin.day = payload[index++] & 0x1F;
      decoded.heating_control.mode.holiday.end.minute = ((payload[index] >> 2) & 0x0F) * 5;
      decoded.heating_control.mode.holiday.end.hour = ((payload[index++] & 0x03) << 3) + (payload[index] >> 5);
      decoded.heating_control.mode.holiday.end.day = payload[index++] & 0x1F;
      decoded.heating_control.mode.holiday.begin.month = MONTH[payload[index] >> 4];
      decoded.heating_control.mode.holiday.end.month = MONTH[payload[index++] & 0x0F];
      decoded.heating_control.mode.holiday.begin.year = payload[index++] + 2000;
      decoded.heating_control.mode.holiday.end.year = payload[index++] + 2000;
      decoded.heating_control.mode.holiday.set_point_temperature = (payload[index++] * 0.5).toFixed(1);
    }
    else if( next_field == CMD_GET_WEEK_PROGRAMM){
      
      decoded.heating_control = decoded.heating_control || {};
      decoded.heating_control.mode = decoded.heating_control.mode || {};
      decoded.heating_control.mode.auto = decoded.heating_control.mode.auto || {};
      
      var week_program_nbr = (payload[index] >> 4) & 0x03;
      var nbr_time_switching_points = payload[index++] & 0x0F;

      const time_switching_point = {};

      switch(week_program_nbr)
      {
        case 0:
          decoded.heating_control.mode.auto.week_program_1 = {};
        break;

        case 1:
          decoded.heating_control.mode.auto.week_program_2 = {};
        break;

        case 2:
          decoded.heating_control.mode.auto.week_program_3 = {};
        break;

        default:

        break;
      }

      var weekdays_coded = 0;
      
      for(let i = 0; i < nbr_time_switching_points; i++)
      {
        time_switching_point.weekdays = "";
        time_switching_point.minute = (payload[index] >> 4) * 5;
        time_switching_point.hour = ((payload[index++] & 0x0F) << 1) + (payload[index] >> 7);
        weekdays_coded = payload[index++] & 0x7F;
        time_switching_point.set_point_temperature = ((payload[index]& 0x7F)* 0.5).toFixed(1);
        time_switching_point.is_low_power_time_slot = (payload[index++] >> 7) & 0x01
        
        if( weekdays_coded == MO_TO_FR_MSK ){
          time_switching_point.weekdays  +=  "MO - FR";
        }
        else if( weekdays_coded == WEEKEND_MSK ){
          time_switching_point.weekdays  +=  "Weekend";
        }
        else if( weekdays_coded == WEEK_MSK ){
          time_switching_point.weekdays  +=  "All week";
        }
        else{
          for( let j = 0; j < 7; j++ ){
            if( weekdays_coded & (1 << j) ) {
              if( time_switching_point.weekdays  !== "" ){
                time_switching_point.weekdays  += " | ";
              }
              
              time_switching_point.weekdays += WEEKDAY[j];
            }
          }
        }

        switch(week_program_nbr)
        {
          case 0:
            decoded.heating_control.mode.auto.week_program_1[i] = Object.assign( {}, time_switching_point);
          break;

          case 1:
            decoded.heating_control.mode.auto.week_program_2[i] = Object.assign( {}, time_switching_point);
          break;

          case 2:
            decoded.heating_control.mode.auto.week_program_3[i] = Object.assign( {}, time_switching_point);
          break;

          default:

          break;
        }
      }
    }
    else if( next_field == CMD_GET_SET_POINT ){
      decoded.set_point_temperature = (payload[index++] * 0.5).toFixed(1);
    }
    else if( next_field == CMD_GET_TEMPERATURE_OFFSET ){
      decoded.temperature_offset = ((payload[index++] * 0.1) - 6.4).toFixed(1);
    }    
    else if( next_field == CMD_GET_ROOM_TEMPERATURE ){
      decoded.room_temperature = (payload[index++] << 8);
      decoded.room_temperature += payload[index++];
    }     
    else if( next_field == CMD_GET_WINDOW_OPEN_STATUS ){
      decoded.window_open_status = payload[index++];
    }
    else if( next_field == CMD_GET_WINDOW_OPEN_CONFIG ){
      decoded.window_open_config = {};
      
      decoded.window_open_config.detection_source = (payload[index] >> 3) & 0x01;
      decoded.window_open_config.enable_mode_config = payload[index++] & 0x07;
      decoded.window_open_config.temperature_delta = payload[index] & 0x1F;
      decoded.window_open_config.window_open_duration = (payload[index++] >> 5) & 0x07;
      decoded.window_open_config.window_open_temperature = (payload[index++] * 0.5).toFixed(1);
      
    }
    else if( next_field == RESPONSE_CMD_FAILED ){
      var nb_failed_cmds = payload[index++];
      var errors = [];
      
      for( var i = 0; i < nb_failed_cmds; i++ ){
        errors.push(payload[index++]);
      }
      
      decoded.failed_commands = errors;
    }
    else if( next_field == CMD_GET_DISPLAY_MODE ){
      decoded.display_mode = payload[index++];
    }
    else if( next_field == CMD_GET_MINIMUM_SET_POINT ){
      decoded.minimum_set_point_temperature = (payload[index++] * 0.5).toFixed(1);
    }
    else if( next_field == CMD_GET_MAXIMUM_SET_POINT ){
      decoded.maximum_set_point_temperature = (payload[index++] * 0.5).toFixed(1);
    }
    else if( next_field == CMD_GET_MINIMUM_HOLIDAY_SET_POINT ){
      decoded.minimum_holiday_set_point_temperature = (payload[index++] * 0.5).toFixed(1);
    }
    else if( next_field == CMD_GET_MAXIMUM_HOLIDAY_SET_POINT ){
      decoded.maximum_holiday_set_point_temperature = (payload[index++] * 0.5).toFixed(1);
    }    
    else if( next_field == CMD_GET_HOLIDAY_SET_POINT ){
      decoded.holiday_set_point_temperature = (payload[index++] * 0.5).toFixed(1);
    }
    else if( next_field == CMD_GET_HUMIDITY ){
      decoded.humidity = payload[index++];
    }
    
    else if( next_field == GET_COPRO_VERSION )
    {
      decoded.copro_version = copro_version;
      
      copro_version.fw_version = bytes[index++] + ".";
      copro_version.fw_version += bytes[index++] + ".";
      copro_version.fw_version += bytes[index++];
      
      copro_version.bl_version = bytes[index++] + ".";
      copro_version.bl_version += bytes[index++] + ".";
      copro_version.bl_version += bytes[index++];
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
      decoded.rejoin_config = int16(payload.slice(index, index + 2));
      index += 2;
    }
    else if( next_field == GET_DEVICE_INFO ){
      decoded.device_info = read_device_info(payload.slice(index, index + 10));
      index += 10;
    }
    
  }
  
 
   return {
    data: decoded,
    warnings: [],
    errors: []
  };
}


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
  
  return info;
}


var POSSIBLE_ACTIVE_MODES = [
  "MODE_MANU",
  "MODE_AUTO_LOW_POWER",
  "MODE_AUTO",
  "MODE_HOLIDAY",
  "MODE_EMERGENCY",
  "MODE_FROST_PROTECTION",
  "INVALID",
  "MODE_WINDOW_OPEN",
  "MODE_HOLIDAY",
  ];

var DEVICE_ERRORS = [
  "NO_ERROR",
  "SHT20_ERROR",
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

const MO_TO_FR_MSK = 0x3E;
const WEEKEND_MSK = 0x41;
const WEEK_MSK = 0x7F;


function int16(bytes){
  return ((bytes[0] << 8) | bytes[1]);
}

function int24(bytes){
  return ((bytes[0] << 16) | (bytes[1] << 8) | bytes[2]);
}

function int32(bytes){
  return ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]);
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