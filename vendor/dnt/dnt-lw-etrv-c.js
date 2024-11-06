var payload_parser_version = [1,1,0];


const ERROR_CODE =
{
  0: "VALVE_DRIVE_READY",
  1: "VALVE_DRIVE_UNINITIALIZED",
  2: "VALVE_TO_TIGHT",
  3: "ADJUST_RANGE_OVERSIZE",
  4: "ADJUST_RANGE_UNDERSIZE",
  5: "ADAPTION_RUN_CALC_ERROR"
};

const ACTIVE_MODE =
{
  0: "Manu Temp",
  1: "Manu_Pos",
  2: "Auto",
  3: "Emergency",
  4: "Frost Protection",
  5: "Boost",
  6: "Window Open",
  7: "Holiday"
};

const WEEKDAY = 
{
  0: "SUNDAY",
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY"
};

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


const DATA_RATE = 
{
  0: "Adaptive Data Rate",
  1: "DR 0",
  2: "DR 1",
  3: "DR 2",
  4: "DR 3",
  5: "DR 4",
  6: "DR 5",
};


const REJOIN_BEHAVIOR = 
{
  true: "Cyclic Rejoin",
  false: "Single Rejoin",
};


const COMMAND_ID =
{
  0: "COMMAND_ID_GET_STATUS_INTERVAL",
  1: "COMMAND_ID_SET_STATUS_INTERVAL",
  2: "COMMAND_ID_GET_STATUS_PARAMETER_TX_ENABLE_REGISTER",
  3: "COMMAND_ID_SET_STATUS_PARAMETER_TX_ENABLE_REGISTER",
  4: "COMMANF_ID_GET_STATUS",
  5: "COMMAND_ID_GET_BATTERY_VOLTAGE",
  6: "COMMAND_ID_GET_BATTTERY_COVER_LOCK_STATUS",
  7: "COMMAND_ID_GET_ERROR_CODE",
  8: "COMMAND_ID_GET_DEVICE_TIME",
  9: "COMMAND_ID_SET_DEVICE_TIME",
  10: "COMMAND_ID_GET_DEVICE_TIME_CONFIG",
  11: "COMMAND_ID_SET_DEVICE_TIME_CONFIG",
  12: "COMMAND_ID_GET_MODE_STATUS",
  13: "COMMAND_ID_SET_MANU_TEMPERATURE_MODE",
  14: "COMMAND_ID_SET_MANU_POSITIONING_MODE",
  15: "COMMAND_ID_SET_AUTO_MODE",
  16: "COMMAND_ID_SET_HOLIDAY_MODE",
  17: "COMMAND_ID_SET_BOOST_MODE",
  18: "COMMAND_ID_GET_HOLIDAY_MODE_CONFIG",
  19: "COMMAND_ID_DISABLE_HOLIDAY_MODE",
  20: "COMMAND_ID_GET_BOOST_CONFIG",
  21: "COMMAND_ID_SET_BOOST_CONFIG",
  22: "COMMAND_ID_GET_WEEK_PROGRAM",
  23: "COMMAND_ID_SET_WEEK_PROGRAM",
  24: "COMMAND_ID_GET_VALVE_POSITION",
  25: "COMMAND_ID_GET_VALVE_SET_POINT_POSITION",
  26: "COMMAND_ID_SET_VALVE_SET_POINT_POSITION",
  27: "COMMAND_ID_GET_VALVE_OFFSET",
  28: "COMMAND_ID_SET_VALVE_OFFSET",
  29: "COMMAND_ID_GET_VALVE_MAXIMUM_POSITION",
  30: "COMMAND_ID_SET_VALVE_MAXIMUM_POSITION",
  31: "COMMAND_ID_GET_VALVE_EMERGENCY_POSITION",
  32: "COMMAND_ID_SET_VALVE_EMERGENCY_POSITION",
  33: "COMMAND_ID_GET_SET_POINT_TEMPERATURE",
  34: "COMMAND_ID_SET_SET_POINT_TEMPERATURE",
  35: "COMMAND_ID_SET_EXTERNAL_ROOM_TEMPERATURE",
  36: "COMMAND_ID_GET_TEMPERATURE_OFFSET",
  37: "COMMAND_ID_SET_TEMPERATURE_OFFSET",
  38: "COMMAND_ID_GET_HEATING_CNTRL_INPUT_ROOM_TEMPERATURE",
  39: "COMMAND_ID_GET_HEATING_CNTRL_INPUT_SET_POINT_TEMPERATURE",
  40: "COMMAND_ID_GET_HEATING_CNTRL_CONFIG",
  41: "COMMAND_ID_SET_HEATING_CNTRL_CONFIG",
  42: "COMMAND_ID_GET_HEATING_CNTRL_STATIC_GAINS",
  43: "COMMAND_ID_SET_HEATING_CNTRL_STATTC_GAINS",
  44: "COMMAND_ID_GET_HEATING_CNTRL_INPUT_GAINS",
  45: "COMMAND_ID_RESET_HEATING_CONTROLLER_ADAPTIVE_GAINS",
  46: "COMMAND_ID_GET_WINDOW_OPEN_STATUS",
  47: "COMMAND_ID_SET_WINDWO_OPEN_STATUS",
  48: "COMMAND_ID_GET_WINDOW_OPEN_DETECTION_CONFIG",
  49: "COMMAND_ID_SET_WINDOW_OPEN_DETECTION_CONFIG",
  50: "COMMAND_ID_GET_DECALCIFICATION_CONFIG",
  51: "COMMAND_ID_SET_DECALCIFICATION_CONFIG",
  52: "COMMAND_ID_PERFORM_ADAPTION_RUN",
  53: "COMMAND_ID_PERFORM_DECALCIFICATION",
  54: "COMMAND_ID_COMMAND_FAILED",
  55: "COMMAND_ID_SET_BUTTON_ACTION",
  56: "COMMAND_ID_GET_BUTTON_ACTION",
  57: "COMMAND_ID_SET_HARDWARE_FACTORY_RESET_LOCK",
  58: "COMMAND_ID_GET_HARDWARE_FACTORY_RESET_LOCK",
  119: "COMMAND_ID_GET_REMAINING_TIME_UNTIL_REJOIN",
  120: "COMMAND_ID_GET_DATA_RATE",
  121: "COMMAND_ID_SET_DATA_RATE",
  122: "COMMAND_ID_GET_REJOIN_BEHAVIOR",
  123: "COMMAND_ID_SET_REJOIN_BEHAVIOR",
  124: "COMMAND_ID_GET_ALL_CONFIG",
  125: "COMMAND_ID_PERFORM_FACTORY_RESET",
  126: "COMMAND_ID_PERFORM_SOFTWARE_RESET",
  127: "COMMAND_ID_GET_VERSION"
};

function decodeUplink(input) {
  
  var size = input.bytes.length;
  

  const data = {};
  
  var bufferSize = input.bytes.length;
  var idx = 0;
  commandId = -1;


  while(idx < bufferSize)
  {
    commandId = input.bytes[idx++];
    
    switch(COMMAND_ID[commandId])
    {
      case "COMMAND_ID_GET_STATUS_INTERVAL":
        data.status_report = data.status_report || {};
        data.status_report.interval = data.status_report.interval || {};
        data.status_report.interval.value = input.bytes[idx++] * 30 + 30;
        data.status_report.interval.unit ="s";
      break;

      case "COMMAND_ID_GET_STATUS_PARAMETER_TX_ENABLE_REGISTER":
        data.radio = data.radio || {};
        data.radio.status_report = data.radio.status_report || {};  
        data.radio.status_report.parameter_tx_enable_reg = data.radio.status_report.parameter_tx_enable_reg || {};
        
        var status_param_tx_enable_reg = input.bytes[idx++];
        
        data.radio.status_report.parameter_tx_enable_reg.battery_voltage_enabled = !!(status_param_tx_enable_reg & (1 << 7));
        data.radio.status_report.parameter_tx_enable_reg.room_temperature_enabled = !!(status_param_tx_enable_reg & (1 << 6));
        data.radio.status_report.parameter_tx_enable_reg.set_point_temperature_enabled = !!(status_param_tx_enable_reg & (1 << 5));
        data.radio.status_report.parameter_tx_enable_reg.valve_position_enabled = !!(status_param_tx_enable_reg & (1 << 4));
        data.radio.status_report.parameter_tx_enable_reg.controller_gains_enabled = !!(status_param_tx_enable_reg & (1 << 3));
        data.radio.status_report.parameter_tx_enable_reg.device_flags_enabled = !!(status_param_tx_enable_reg & (1 << 2));
        data.radio.status_report.parameter_tx_enable_reg.unit = "bool";
      break;

      case "COMMANF_ID_GET_STATUS":
        var status_param_tx_enable_reg = input.bytes[idx++];

        if( !!(status_param_tx_enable_reg & (1 << 7)) )
        {
          data.battery_voltage = data.battery_voltage || {};
          data.battery_voltage.value = ( input.bytes[idx++] * 10 + 1500).toFixed(0);
          data.battery_voltage.unit = "mV";
        }

        if( !!(status_param_tx_enable_reg & (1 << 6)) )
        {
          data.heating_control = data.heating_control || {};
          data.heating_control.room_temperature = {};

          data.heating_control.room_temperature.value = (input.bytes[idx++] * 0.5).toFixed(1);
          data.heating_control.room_temperature.unit = "°C";
        }

        if( !!(status_param_tx_enable_reg & (1 << 5)) )
        {
          data.heating_control = data.heating_control || {};
          data.heating_control.set_point_temperature = {};

          data.heating_control.set_point_temperature.value = (input.bytes[idx++] * 0.5).toFixed(1);
          data.heating_control.set_point_temperature.unit = "°C";
        }

        if( !!(status_param_tx_enable_reg & (1 << 4)) )
        {
          data.heating_control = data.heating_control || {};
          data.heating_control.valve_position = {};

          data.heating_control.valve_position.value = (input.bytes[idx++] * 0.5).toFixed(1);
          data.heating_control.valve_position.unit = "%";
        }

        if( !!(status_param_tx_enable_reg & (1 << 3)) )
        {
          data.heating_control = data.heating_control || {};
          data.heating_control.gain = data.heating_control.gain || {};
          data.heating_control.gain.p = {};
          data.heating_control.gain.i = {};

          data.heating_control.gain.p.value = (input.bytes[idx++] << 8) + input.bytes[idx++];
          data.heating_control.gain.i.value = (input.bytes[idx++] / 1000000);
          data.heating_control.gain.unit = "uint";
        }

        if( !!(status_param_tx_enable_reg & (1 << 2)) )
        {
          data.heating_control.mode = data.heating_control.mode || {};
          data.heating_control.mode.holiday = data.heating_control.mode.holiday || {};
          data.heating_control.mode.window_open_detection = data.heating_control.mode.window_open_detection || {};

          var device_flags = input.bytes[idx++];

          data.heating_control.mode.active_mode = {};
          data.heating_control.mode.active_mode.value = ACTIVE_MODE[(device_flags & 0xE0) >> 5];
          data.heating_control.mode.active_mode.unit = "string";

          data.heating_control.mode.holiday.is_pending = {};
          data.heating_control.mode.holiday.is_pending.value = !!(device_flags & (1 << 4));
          data.heating_control.mode.holiday.is_pending.unit = "bool";

          data.heating_control.mode.window_open_detection.is_open = {};
          data.heating_control.mode.window_open_detection.is_open.value = !!(device_flags & (1 << 3));
          data.heating_control.mode.window_open_detection.is_open.unit = "bool";

          data.battery_cover_locked = {};
          data.battery_cover_locked.value = !!(device_flags & (1 << 2));
          data.battery_cover_locked.unit = "bool";
        }
      break;

      case "COMMAND_ID_GET_BATTERY_VOLTAGE":
        data.battery_voltage = {};
        data.battery_voltage.value = ( input.bytes[idx++] * 10 + 1500).toFixed(0);
        data.battery_voltage.unit = "mV";
      break;

      case "COMMAND_ID_GET_BATTTERY_COVER_LOCK_STATUS":
        data.battery_cover_locked = {};
        data.battery_cover_locked.value = !!(input.bytes[idx++] & 0x01);
        data.battery_cover_locked.unit = "bool";
      break;

      case "COMMAND_ID_GET_ERROR_CODE":
        data.error_code = {};
        data.error_code.value = ERROR_CODE[input.bytes[idx++]];
        data.error_code.unit = "string";
      break;

      case "COMMAND_ID_GET_DEVICE_TIME":
        data.device_time = data.device_time || {};
        data.device_time.local = data.device_time.local || {};
        data.device_time.local.second = {};
        data.device_time.local.minute = {};
        data.device_time.local.hour = {};
        data.device_time.local.day = {};
        data.device_time.local.weekday = {};
        data.device_time.local.month = {};
        data.device_time.local.year = {};
        data.device_time.local.is_dst = {};
        data.device_time.local.utc_offset = {};

        data.device_time.local.second.value = input.bytes[idx++] & 0x1F;
        data.device_time.local.second.unit = "s";

        data.device_time.local.minute.value = (input.bytes[idx] >> 2) & 0x3F;
        data.device_time.local.minute.unit = "min";

        data.device_time.local.hour.value = ((input.bytes[idx++] & 0x03) << 3) + (input.bytes[idx] >> 5);
        data.device_time.local.hour.unit = "h";

        data.device_time.local.day.value = input.bytes[idx++] & 0x1F;
        data.device_time.local.day.unit = "d";

        data.device_time.local.is_dst.value = !!(input.bytes[idx] & 0x80);
        data.device_time.local.is_dst.unit = "bool";

        data.device_time.local.weekday.value = WEEKDAY[(input.bytes[idx] >> 4) & 0x07];
        data.device_time.local.weekday.unit = "string";

        data.device_time.local.month.value = MONTH[input.bytes[idx++] & 0x0F];
        data.device_time.local.month.unit = "string";

        data.device_time.local.year.value = input.bytes[idx++] + 2000;
        data.device_time.local.year.unit = "a";

        data.device_time.local.utc_offset.value = (input.bytes[idx++] * 0.25 - 12).toFixed(2);
        data.device_time.local.utc_offset.unit = "h";
      break;

      case "COMMAND_ID_GET_DEVICE_TIME_CONFIG":
        data.device_time = data.device_time || {};
        data.device_time.config = data.device_time.config || {};
        data.device_time.config.auto_time_sync_en = {};
        data.device_time.config.utc_offset = {};
        data.device_time.config.utc_dst_offset = {};
        data.device_time.config.utc_dst_begin = {};
        data.device_time.config.utc_dst_end = {};
        data.device_time.config.utc_dst_begin.week_of_month = {};
        data.device_time.config.utc_dst_end.week_of_month = {};
        data.device_time.config.utc_dst_begin.month = {};
        data.device_time.config.utc_dst_end.month = {};
        data.device_time.config.utc_dst_begin.weekday = {};
        data.device_time.config.utc_dst_end.weekday = {};
        data.device_time.config.utc_dst_begin.hour = {};
        data.device_time.config.utc_dst_end.hour = {};
        data.device_time.config.utc_dst_begin.minute = {};
        data.device_time.config.utc_dst_end.minute = {};

        data.device_time.config.auto_time_sync_en.value = !!(input.bytes[idx] >> 7);
        data.device_time.config.auto_time_sync_en.unit = "bool";
        
        data.device_time.config.utc_offset.value = ((input.bytes[idx++] & 0x7F) * 0.25 - 12).toFixed(2);
        data.device_time.config.utc_offset.unit = "h";

        data.device_time.config.utc_dst_begin.week_of_month.value = WEEK_OF_MONTH[ (input.bytes[idx] >> 4) & 0x0F ];
        data.device_time.config.utc_dst_begin.week_of_month.unit = "string";

        data.device_time.config.utc_dst_begin.month.value = MONTH[input.bytes[idx++] & 0x0F];
        data.device_time.config.utc_dst_begin.month.unit = "string";

        data.device_time.config.utc_dst_begin.weekday.value = WEEKDAY[input.bytes[idx] >> 5];
        data.device_time.config.utc_dst_begin.weekday.unit = "string";

        data.device_time.config.utc_dst_begin.hour.value = (input.bytes[idx++] & 0x0F);
        data.device_time.config.utc_dst_begin.hour.unit = "h";

        data.device_time.config.utc_dst_offset.value = ((input.bytes[idx++] & 0x7F) * 0.25 - 12).toFixed(2);
        data.device_time.config.utc_dst_offset.unit = "h";

        data.device_time.config.utc_dst_end.week_of_month.value = WEEK_OF_MONTH[ (input.bytes[idx] >> 4) & 0x0F ];
        data.device_time.config.utc_dst_end.week_of_month.unit = "string";

        data.device_time.config.utc_dst_end.month.value = MONTH[input.bytes[idx++] & 0x0F];
        data.device_time.config.utc_dst_end.month.unit = "string";

        data.device_time.config.utc_dst_end.weekday.value = WEEKDAY[input.bytes[idx] >> 5];
        data.device_time.config.utc_dst_end.weekday.unit = "string";

        data.device_time.config.utc_dst_end.hour.value = (input.bytes[idx++] & 0x0F);
        data.device_time.config.utc_dst_end.hour.unit = "h";

        data.device_time.config.utc_dst_begin.minute.value = (input.bytes[idx] >> 4) * 5;
        data.device_time.config.utc_dst_begin.minute.unit = "min";

        data.device_time.config.utc_dst_end.minute.value = (input.bytes[idx++] & 0x0F) * 5;
        data.device_time.config.utc_dst_end.minute.unit = "min";
      break;

      case "COMMAND_ID_GET_MODE_STATUS":
        data.heating_control = data.heating_control || {};
        data.heating_control.mode = data.heating_control.mode || {};
        data.heating_control.mode.active_main_mode = {};
        data.heating_control.mode.holiday = data.heating_control.mode.holiday || {};
        data.heating_control.mode.holiday.is_active = {};
        data.heating_control.mode.holiday.is_pending = {};
        data.heating_control.mode.boost = data.heating_control.mode.boost || {};
        data.heating_control.mode.boost.is_active = {};
        data.heating_control.mode.frost_protection = data.heating_control.mode.frost_protection || {};
        data.heating_control.mode.frost_protection.is_active = {};
        data.heating_control.mode.window_open_detection = data.heating_control.mode.window_open_detection || {};
        data.heating_control.mode.window_open_detection.is_active = {};
        data.heating_control.mode.emergency = data.heating_control.mode.emergency || {};
        data.heating_control.mode.emergency.is_active = {};
        data.heating_control.mode.auto = data.heating_control.mode.auto || {};
        data.heating_control.mode.auto.selected_week_program = {};

        data.heating_control.mode.active_main_mode.value = ACTIVE_MODE[input.bytes[idx] >> 6];
        data.heating_control.mode.active_main_mode.unit = "string";

        data.heating_control.mode.holiday.is_active.value = !!(input.bytes[idx] & (1 << 5));
        data.heating_control.mode.holiday.is_active.unit = "bool";

        data.heating_control.mode.holiday.is_pending.value = !!(input.bytes[idx] & (1 << 4));
        data.heating_control.mode.holiday.is_pending.unit = "bool";

        data.heating_control.mode.boost.is_active.value = !!(input.bytes[idx] & (1 << 3));
        data.heating_control.mode.boost.is_active.unit = "bool";

        data.heating_control.mode.frost_protection.is_active.value = !!(input.bytes[idx] & (1 << 2));
        data.heating_control.mode.frost_protection.is_active.unit = "bool";

        data.heating_control.mode.window_open_detection.is_active.value = !!(input.bytes[idx] & (1 << 1));
        data.heating_control.mode.window_open_detection.is_active.unit = "bool";

        data.heating_control.mode.emergency.is_active.value = !!(input.bytes[idx++] & (1 << 0));
        data.heating_control.mode.emergency.is_active.uint = "bool";

        data.heating_control.mode.auto.selected_week_program.value = (input.bytes[idx++] >> 6);
        data.heating_control.mode.auto.selected_week_program.unit = "uint"; 
      break;

      case "COMMAND_ID_GET_HOLIDAY_MODE_CONFIG":
        data.heating_control = data.heating_control || {};
        data.heating_control.mode = data.heating_control.mode || {};
        data.heating_control.mode.holiday = data.heating_control.mode.holiday || {};
        data.heating_control.mode.holiday = {};
        data.heating_control.mode.holiday.begin = data.heating_control.mode.holiday.begin || {};
        data.heating_control.mode.holiday.end = data.heating_control.mode.holiday.end || {};
        data.heating_control.mode.holiday.begin.minute = {};
        data.heating_control.mode.holiday.begin.hour = {};
        data.heating_control.mode.holiday.begin.day = {};
        data.heating_control.mode.holiday.begin.month = {};
        data.heating_control.mode.holiday.begin.year = {};
        data.heating_control.mode.holiday.end.minute = {};
        data.heating_control.mode.holiday.end.hour = {};
        data.heating_control.mode.holiday.end.day = {};
        data.heating_control.mode.holiday.end.month = {};
        data.heating_control.mode.holiday.end.year = {};
        data.heating_control.mode.holiday.set_point_temperature = {};

        data.heating_control.mode.holiday.begin.minute.value = ((input.bytes[idx] >> 2) & 0x0F) * 5;
        data.heating_control.mode.holiday.begin.minute.unit = "min";

        data.heating_control.mode.holiday.begin.hour.value = ((input.bytes[idx++] & 0x03) << 3) + (input.bytes[idx] >> 5);
        data.heating_control.mode.holiday.begin.hour.unit = "h";

        data.heating_control.mode.holiday.begin.day.value = input.bytes[idx++] & 0x1F;
        data.heating_control.mode.holiday.begin.day.unit = "d";

        data.heating_control.mode.holiday.end.minute.value = ((input.bytes[idx] >> 2) & 0x0F) * 5;
        data.heating_control.mode.holiday.end.minute.unit = "min";

        data.heating_control.mode.holiday.end.hour.value = ((input.bytes[idx++] & 0x03) << 3) + (input.bytes[idx] >> 5);
        data.heating_control.mode.holiday.end.hour.unit = "h";

        data.heating_control.mode.holiday.end.day.value = input.bytes[idx++] & 0x1F;
        data.heating_control.mode.holiday.end.day.unit = "d";

        data.heating_control.mode.holiday.begin.month.value = MONTH[input.bytes[idx] >> 4];
        data.heating_control.mode.holiday.begin.month.unit = "string";
        data.heating_control.mode.holiday.end.month.value = MONTH[input.bytes[idx++] &0x0F];
        data.heating_control.mode.holiday.end.month.unit = "string";

        data.heating_control.mode.holiday.begin.year.value = input.bytes[idx++] + 2000;
        data.heating_control.mode.holiday.begin.year.unit = "a";

        data.heating_control.mode.holiday.end.year.value = input.bytes[idx++] + 2000;
        data.heating_control.mode.holiday.end.year.unit = "a";

        data.heating_control.mode.holiday.set_point_temperature.value = (input.bytes[idx++] * 0.5).toFixed(1);
        data.heating_control.mode.holiday.set_point_temperature.unit = "°C";
      break;

      case "COMMAND_ID_GET_BOOST_CONFIG": 
        data.heating_control = data.heating_control || {};
        data.heating_control.mode = data.heating_control.mode || {};
        data.heating_control.mode.boost = data.heating_control.mode.boost || {};
        data.heating_control.mode.boost.config = data.heating_control.mode.boost.config || {};

        data.heating_control.mode.boost.config.duration = {};
        data.heating_control.mode.boost.config.duration.value = input.bytes[idx++] * 15;
        data.heating_control.mode.boost.config.duration.unit = "s";

        data.heating_control.mode.boost.config.valve_position = {};
        data.heating_control.mode.boost.config.valve_position.value = (input.bytes[idx++] * 0.5 ).toFixed(0);
        data.heating_control.mode.boost.config.valve_position.unit = "%";
      break;

      case "COMMAND_ID_GET_WEEK_PROGRAM":
        data.heating_control = data.heating_control || {};
        data.heating_control.mode = data.heating_control.mode || {};
        data.heating_control.mode.auto = data.heating_control.mode.auto || {};
        data.heating_control.mode.auto.week_program_1 = {};
        
        var week_program_nbr = (input.bytes[idx] >> 4) & 0x03;
        var nbr_time_switching_points = input.bytes[idx++] & 0x0F;

        const time_switching_point = {};

        switch(week_program_nbr)
        {
          case 0:
            data.heating_control.mode.auto.week_program_1 = {};
          break;

          case 1:
            data.heating_control.mode.auto.week_program_2 = {};
          break;

          case 2:
            data.heating_control.mode.auto.week_program_3 = {};
          break;

          default:

          break;
        }

        for(let i = 0; i < nbr_time_switching_points; i++)
        {

          time_switching_point.minute = (input.bytes[idx] >> 4) * 5;
          time_switching_point.hour = ((input.bytes[idx++] & 0x0F) << 1) + (input.bytes[idx] >> 7);
          time_switching_point.weekdays = input.bytes[idx++] & 0x7F;
          time_switching_point.set_point_temperature = (input.bytes[idx++] * 0.2).toFixed(1);

          switch(week_program_nbr)
          {
            case 0:
              data.heating_control.mode.auto.week_program_1[i] = Object.assign( {}, time_switching_point);
            break;
  
            case 1:
              data.heating_control.mode.auto.week_program_2[i] = Object.assign( {}, time_switching_point);
            break;
  
            case 2:
              data.heating_control.mode.auto.week_program_3[i] = Object.assign( {}, time_switching_point);
            break;
  
            default:
  
            break;
          }
        } 
      break;

      case "COMMAND_ID_GET_VALVE_POSITION":
        data.heating_control = data.heating_control || {};
        data.heating_control.valve_position = {};
        
        data.heating_control.valve_position.value = (input.bytes[idx++] * 0.5 ).toFixed(0);
        data.heating_control.valve_position.unit = "%";
      break;

      case "COMMAND_ID_GET_VALVE_SET_POINT_POSITION":
        data.heating_control = data.heating_control || {};
        data.heating_control.mode = data.heating_control.mode || {};
        data.heating_control.mode.manu_pos = data.heating_control.mode.manu_pos ||{};
        data.heating_control.mode.manu_pos.valve_set_point_position = {};

        data.heating_control.mode.manu_pos.valve_set_point_position.value = (input.bytes[idx++] * 0.5).toFixed(0);
        data.heating_control.mode.manu_pos.valve_set_point_position.unit = "%";
      break;

      case "COMMAND_ID_GET_VALVE_OFFSET":
        data.heating_control = data.heating_control || {};
        data.heating_control.config = data.heating_control.config || {};
        data.heating_control.config.valve = data.heating_control.config.valve || {};
        
        data.heating_control.config.valve.position_offset = {};
        data.heating_control.config.valve.position_offset.value = (input.bytes[idx++] * 0.5).toFixed(0);
        data.heating_control.config.valve.position_offset.unit = "%";
      break;

      case "COMMAND_ID_GET_VALVE_MAXIMUM_POSITION":
        data.heating_control = data.heating_control || {};
        data.heating_control.config = data.heating_control.config || {};
        data.heating_control.config.valve = data.heating_control.config.valve || {};

        data.heating_control.config.valve.max_position = {};
        data.heating_control.config.valve.max_position.value = (input.bytes[idx++] * 0.5).toFixed(0);
        data.heating_control.config.valve.max_position.unit = "%";
        break;
      case "COMMAND_ID_GET_VALVE_EMERGENCY_POSITION":
        data.heating_control = data.heating_control || {};
        data.heating_control.mode = data.heating_control.mode || {};
        data.heating_control.mode.emergency = data.heating_control.mode.emergency || {};
        data.heating_control.mode.emergency.config = data.heating_control.mode.emergency.config || {};
        data.heating_control.mode.emergency.config.valve_set_point_position = data.heating_control.mode.emergency.config.valve_set_point_position || {};

        data.heating_control.mode.emergency.config.valve_set_point_position.value = (input.bytes[idx++] * 0.5).toFixed(0);
        data.heating_control.mode.emergency.config.valve_set_point_position.unit = "%";
      break;

      case "COMMAND_ID_GET_SET_POINT_TEMPERATURE":
        data.heating_control = data.heating_control || {};
        data.heating_control.mode = data.heating_control.mode || {};
        data.heating_control.mode.manu_temp = data.heating_control.mode.manu_temp || {};
        
        data.heating_control.mode.manu_temp.value = (input.bytes[idx++] * 0.5).toFixed(1);
        data.heating_control.mode.manu_temp.unit = "°C";
      break;

      case "COMMAND_ID_GET_TEMPERATURE_OFFSET":
        data.heating_control = data.heating_control || {};
        data.heating_control.config = data.heating_control.config || {};
        data.heating_control.config.temperature = data.heating_control.config.temperature || {};
        data.heating_control.config.temperature.offset = data.heating_control.config.temperature.offset || {};

        data.heating_control.config.temperature.offset.value = ((input.bytes[idx++] * 0.1) - 12.8).toFixed(1);
        data.heating_control.config.temperature.offset.unit = "K";
      break;

      case "COMMAND_ID_GET_HEATING_CNTRL_INPUT_ROOM_TEMPERATURE":
        data.heating_control = data.heating_control || {};
        data.heating_control.room_temperature = {};

        data.heating_control.room_temperature.value = (input.bytes[idx++] * 0.5).toFixed(1);
        data.heating_control.room_temperature.unit = "°C";
      break;

      case "COMMAND_ID_GET_HEATING_CNTRL_INPUT_SET_POINT_TEMPERATURE":
        data.heating_control = data.heating_control || {};
        data.heating_control.set_point_temperature = {};

        data.heating_control.set_point_temperature.value = (input.bytes[idx++] * 0.5).toFixed(1);
        data.heating_control.set_point_temperature.unit = "°C";
      break;
      
      case "COMMAND_ID_GET_HEATING_CNTRL_CONFIG":
        data.heating_control = data.heating_control || {};
        data.heating_control.config = data.heating_control.config || {};

        data.heating_control.config.adaptive_gain_adjustment_enabled = {};
        data.heating_control.config.adaptive_gain_adjustment_enabled.value = !!(input.bytes[idx] & (1 << 7));
        data.heating_control.config.adaptive_gain_adjustment_enabled.unit = "bool";

        data.heating_control.config.controller_temperature_input_select = {};
        data.heating_control.config.controller_temperature_input_select.value = !!(input.bytes[idx++] & (1 << 6));
        data.heating_control.config.controller_temperature_input_select.unit = "bool";
      break;

      case "COMMAND_ID_GET_HEATING_CNTRL_STATIC_GAINS":
        data.heating_control = data.heating_control || {};
        data.heating_control.config = data.heating_control.config || {};
        data.heating_control.config.static_gain = data.heating_control.config.static_gain || {};

        data.heating_control.config.static_gain.p = {};
        data.heating_control.config.static_gain.p.value = (input.bytes[idx++] << 8) + input.bytes[idx++];
        data.heating_control.config.static_gain.i = {};
        data.heating_control.config.static_gain.i.value = (input.bytes[idx++] / 1000000);
        data.heating_control.config.static_gain.unit = "uint";
      break;
      case "COMMAND_ID_GET_HEATING_CNTRL_INPUT_GAINS":
        data.heating_control = data.heating_control || {};
        data.heating_control.input_gain = data.heating_control.input_gain || {};

        data.heating_control.input_gain.p = {};
        data.heating_control.input_gain.p.value = (input.bytes[idx++] << 8) + input.bytes[idx++];
        data.heating_control.input_gain.i = {};
        data.heating_control.input_gain.i.value = (input.bytes[idx++] / 500000);
        data.heating_control.input_gain.unit = "uint"; 
      break;
      case "COMMAND_ID_GET_WINDOW_OPEN_STATUS":
        data.heating_control = data.heating_control || {};
        data.heating_control.mode = data.heating_control.mode || {};
        data.heating_control.mode.window_open_detection = data.heating_control.mode.window_open_detection || {};

        data.heating_control.mode.window_open_detection.is_open = {};
        data.heating_control.mode.window_open_detection.is_open.value = !!(input.bytes[idx++] & 0x01);
        data.heating_control.mode.window_open_detection.is_open.unit = "bool";
      break;

      case "COMMAND_ID_GET_WINDOW_OPEN_DETECTION_CONFIG":
        data.heating_control = data.heating_control || {};
        data.heating_control.mode = data.heating_control.mode || {};
        data.heating_control.mode.window_open_detection = data.heating_control.mode.window_open_detection || {};
        data.heating_control.mode.window_open_detection.config = data.heating_control.mode.window_open_detection.config || {};

        data.heating_control.mode.window_open_detection.config.source = {};
        data.heating_control.mode.window_open_detection.config.enable_mode = {};
        data.heating_control.mode.window_open_detection.config.open_duration = {};
        data.heating_control.mode.window_open_detection.config.temperature_delta = {};
        data.heating_control.mode.window_open_detection.config.open_temperature = {};

        data.heating_control.mode.window_open_detection.config.source.value = !!(input.bytes[idx] & (1 << 3));
        data.heating_control.mode.window_open_detection.config.source.unit = "bool";

        data.heating_control.mode.window_open_detection.config.enable_mode.holiday = {};
        data.heating_control.mode.window_open_detection.config.enable_mode.auto = {};
        data.heating_control.mode.window_open_detection.config.enable_mode.manu_temp = {};
        data.heating_control.mode.window_open_detection.config.enable_mode.holiday.value = !!(input.bytes[idx] & (1 << 0));
        data.heating_control.mode.window_open_detection.config.enable_mode.auto.value = !!(input.bytes[idx] & (1 << 1));
        data.heating_control.mode.window_open_detection.config.enable_mode.manu_temp.value = !!(input.bytes[idx++] & (1 << 2));
        data.heating_control.mode.window_open_detection.config.enable_mode.unit = "bool";
        
        data.heating_control.mode.window_open_detection.config.open_duration.value = (input.bytes[idx] >> 5) * 10 + 10;
        data.heating_control.mode.window_open_detection.config.open_duration.unit = "min";

        data.heating_control.mode.window_open_detection.config.temperature_delta.value = ((input.bytes[idx++] & 0x1F) * 0.1 + 0.5).toFixed(1);
        data.heating_control.mode.window_open_detection.config.temperature_delta.unit = "K";

        data.heating_control.mode.window_open_detection.config.open_temperature.value = (input.bytes[idx++] * 0.5).toFixed(1);
        data.heating_control.mode.window_open_detection.config.open_temperature.unit = "°C";
      break;

      case "COMMAND_ID_GET_DECALCIFICATION_CONFIG":
        data.heating_control = data.heating_control || {};
        data.heating_control.config = data.heating_control.config || {};
        data.heating_control.config.decalcification_time = data.heating_control.config.decalcification_time || {};

        data.heating_control.config.decalcification_time.weekday = {};
        data.heating_control.config.decalcification_time.week_of_month = {};
        data.heating_control.config.decalcification_time.hour = {};
        data.heating_control.config.decalcification_time.minute = {};

        data.heating_control.config.decalcification_time.weekday.value = WEEKDAY[(input.bytes[idx] >> 4)];
        data.heating_control.config.decalcification_time.weekday.unit = "string";

        data.heating_control.config.decalcification_time.week_of_month.value = WEEK_OF_MONTH[((input.bytes[idx] >> 1) & 0x07)];
        data.heating_control.config.decalcification_time.week_of_month.unit = "string";

        data.heating_control.config.decalcification_time.hour.value = ((input.bytes[idx++] & 0x01) << 4) + (input.bytes[idx] >> 4);
        data.heating_control.config.decalcification_time.hour.unit = "h";
        data.heating_control.config.decalcification_time.minute.value = (input.bytes[idx++] & 0x0F) * 5;
      break;

      case "COMMAND_ID_COMMAND_FAILED":
      data.radio = data.radio || {};
      data.radio.failed_commands = {};

      var nbr_failed_commands = input.bytes[idx++];

      data.radio.failed_commands.value = {};

      for(let i = 0; i < nbr_failed_commands; i++)
      {
        data.radio.failed_commands.value[i] = COMMAND_ID[input.bytes[idx++]];
      }

      data.radio.failed_commands.unit = "COMMAND_ID";
      break;

      case "COMMAND_ID_GET_BUTTON_ACTION":
        data.button_action = data.button_action || {};
        data.button_action.single_tap = data.button_action.single_tap || {};
        data.button_action.double_tap = data.button_action.double_tap || {};

        data.button_action.single_tap.value = COMMAND_ID[input.bytes[idx++]];
        data.button_action.double_tap.value = COMMAND_ID[input.bytes[idx++]];

        data.button_action.unit = "COMMAND_ID";
      break;

      case "COMMAND_ID_GET_HARDWARE_FACTORY_RESET_LOCK":
      data.button_action = data.button_action || {};
      data.button_action.hw_factory_reset_locked = data.button_action.hw_factory_reset_locked || {};

      data.button_action.hw_factory_reset_locked.value = !!(input.bytes[idx++] & (0x01));
      data.button_action.hw_factory_reset_locked.unit = "bool";
      break;

      case "COMMAND_ID_GET_DATA_RATE":
        data.radio = data.radio || {};
        data.radio.data_rate = {};

        data.radio.data_rate.value = DATA_RATE[(input.bytes[idx++] & 0x0F)];
        data.radio.data_rate.unit = "string";
      break;

      case "COMMAND_ID_GET_REMAINING_TIME_UNTIL_REJOIN":
        data.radio = data.radio || {};
        data.radio.cyclic_rejoin = data.radio.cyclic_rejoin || {};
        data.radio.cyclic_rejoin.remaining_time_until_rejoin = data.radio.cyclic_rejoin.remaining_time_until_rejoin || {};

        data.radio.cyclic_rejoin.remaining_time_until_rejoin.value = ((input.bytes[idx++] & 0x1F) << 16) + (input.bytes[idx++] << 8) + input.bytes[idx++];
        data.radio.cyclic_rejoin.remaining_time_until_rejoin.unit = "min";
      break;

      case "COMMAND_ID_GET_REJOIN_BEHAVIOR":
        data.radio = data.radio || {};
        data.radio.cyclic_rejoin = data.radio.cyclic_rejoin || {};
        data.radio.cyclic_rejoin.conf = data.radio.cyclic_rejoin.conf || {};
        data.radio.cyclic_rejoin.interval = data.radio.cyclic_rejoin.interval || {};

        data.radio.cyclic_rejoin.conf.value = REJOIN_BEHAVIOR[!(input.bytes[idx] >> 7)];
        data.radio.cyclic_rejoin.conf.unit = "string"; 

        data.radio.cyclic_rejoin.interval.value = (((input.bytes[idx++] & 0x7F) * (255)) + input.bytes[idx++]);
        data.radio.cyclic_rejoin.interval.unit = "h";
      break;

      case "COMMAND_ID_GET_VERSION":
        data.version = data.version || {};
        data.version.hw_revision = {};
        data.version.application = {};
        data.version.bootloader = {};
        data.version.lorawan_l2 = {};
        data.version.payload_parser = {};

        data.version.hw_revision.value = input.bytes[idx++];
        data.version.hw_revision.unit = "uint";

        data.version.application.value = {};
        data.version.application.value[0] = input.bytes[idx++];
        data.version.application.value[1] = input.bytes[idx++];
        data.version.application.value[2] = input.bytes[idx++];
        data.version.application.unit = "uint";

        data.version.bootloader.value = {};
        data.version.bootloader.value[0] = input.bytes[idx++];
        data.version.bootloader.value[1] = input.bytes[idx++];
        data.version.bootloader.value[2] = input.bytes[idx++];
        data.version.bootloader.unit = "uint";

        data.version.lorawan_l2.value = {};
        data.version.lorawan_l2.value[0] = input.bytes[idx++];
        data.version.lorawan_l2.value[1] = input.bytes[idx++];
        data.version.lorawan_l2.value[2] = input.bytes[idx++];
        data.version.lorawan_l2.unit = "uint";

        data.version.payload_parser.value = {};
        data.version.payload_parser.value[0] = payload_parser_version[0];
        data.version.payload_parser.value[1] = payload_parser_version[1];
        data.version.payload_parser.value[2] = payload_parser_version[2];
        data.version.payload_parser.unit = "uint";
      break; 

      default:
      break;     
    }
  }

  return {
    data: data,
    warnings: [],
    errors: []
  };
}