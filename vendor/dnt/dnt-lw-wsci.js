/*
 * dnt-LW-WSCI-Payload-Parser
 * 
 * */

var payload_parser_version = [2,0,2];
const ERROR_CODE =
{
  0: "DEVICE_READY"
};
const SABOTAGE_CONTACT_STATE =
{
  0: "IDLE",
  1: "TRIGGERED",
  2: "DISABLED"
};
const INPUT_STATE =
{
  0: "LOW",
  1: "HIGH",
  2: "DISABLED"
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
const INPUT_CLAMP_SENSOR_TYPE = 
{
  0: "Magnetic contact",
  1: "Glass break detector",
  2: "Reserved",
};
const COMMAND_ID =
{
  0: "COMMAND_ID_GET_STATUS_INTERVAL",
  1: "COMMAND_ID_SET_STATUS_INTERVAL",
  2: "COMMAND_ID_GET_STATUS_PARAMETER_TX_ENABLE_REGISTER",
  3: "COMMAND_ID_SET_STATUS_PARAMETER_TX_ENABLE_REGISTER",
  4: "COMMAND_ID_GET_STATUS",
  5: "COMMAND_ID_GET_BATTERY_VOLTAGE",
  6: "COMMAND_ID_GET_SABOTAGE_CONTACT_STATE",
  7: "COMMAND_ID_GET_ERROR_CODE",
  8: "COMMAND_ID_GET_DEVICE_TIME",
  9: "COMMAND_ID_SET_DEVICE_TIME",
  10: "COMMAND_ID_GET_DEVICE_TIME_CONFIG",
  11: "COMMAND_ID_SET_DEVICE_TIME_CONFIG",
  12: "COMMAND_ID_SET_SABOTAGE_CONTACT_CONFIG",
  13: "COMMAND_ID_GET_SABOTAGE_CONTACT_CONFIG",
  14: "COMMAND_ID_GET_HALL_SENSOR_STATE",
  15: "COMMAND_ID_SET_HALL_SENSOR_CONFIG",
  16: "COMMAND_ID_GET_HALL_SENSOR_CONFIG",
  17: "COMMAND_ID_GET_INPUT_CLAMP_STATE",
  18: "COMMAND_ID_SET_INPUT_CLAMP_CONFIG",
  19: "COMMAND_ID_GET_INPUT_CLAMP_CONFIG",
  20: "COMMAND_ID_SET_INPUT_CLAMP_SENSOR_TYPE",
  21: "COMMAND_ID_GET_INPUT_CLAMP_SENSOR_TYPE",
  22: "COMMAND_ID_SET_INPUT_CLAMP_SENSOR_FILTER_TIME",
  23: "COMMAND_ID_GET_INPUT_CLAMP_SENSOR_FILTER_TIME",
  54: "COMMAND_ID_COMMAND_FAILED",
  57: "COMMAND_ID_GET_HARDWARE_FACTORY_RESET_LOCK",
  58: "COMMAND_ID_SET_HARDWARE_FACTORY_RESET_LOCK",
  247: "COMMAND_ID_GET_REMAINING_TIME_UNTIL_REJOIN",
  248: "COMMAND_ID_GET_DATA_RATE",
  249: "COMMAND_ID_SET_DATA_RATE",
  250: "COMMAND_ID_GET_REJOIN_BEHAVIOR",
  251: "COMMAND_ID_SET_REJOIN_BEHAVIOR",
  252: "COMMAND_ID_GET_ALL_CONFIG",
  253: "COMMAND_ID_PERFORM_FACTORY_RESET",
  254: "COMMAND_ID_PERFORM_SOFTWARE_RESET",
  255: "COMMAND_ID_GET_VERSION"
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
        data.status_report.interval.value = input.bytes[idx++] * 360 + 30;
        data.status_report.interval.unit ="s";
      break;
      case "COMMAND_ID_GET_STATUS_PARAMETER_TX_ENABLE_REGISTER":
        data.radio = data.radio || {};
        data.radio.status_report = data.radio.status_report || {};  
        data.radio.status_report.parameter_tx_enable_reg = data.radio.status_report.parameter_tx_enable_reg || {};
        
        var status_param_tx_enable_reg = input.bytes[idx++];
        
        data.radio.status_report.parameter_tx_enable_reg.battery_voltage_enabled = !!(status_param_tx_enable_reg & (1 << 7));
        data.radio.status_report.parameter_tx_enable_reg.sabotage_contact_states_enabled = !!(status_param_tx_enable_reg & (1 << 6));
        data.radio.status_report.parameter_tx_enable_reg.hall_sensore_states_enabled = !!(status_param_tx_enable_reg & (1 << 5));
        data.radio.status_report.parameter_tx_enable_reg.input_clamp_states_enabled = !!(status_param_tx_enable_reg & (1 << 4));
        data.radio.status_report.parameter_tx_enable_reg.unit = "bool";
      break;
      case "COMMAND_ID_GET_STATUS":
        var status_param_tx_enable_reg = input.bytes[idx++];

        if( !!(status_param_tx_enable_reg & (1 << 7)) )
        {
          data.battery_voltage = data.battery_voltage || {};
          data.battery_voltage.value = ( input.bytes[idx++] * 10 + 1500).toFixed(0);
          data.battery_voltage.unit = "mV";
        }

        if( !!(status_param_tx_enable_reg & (1 << 6)) )
        {
          data.sabotage_contact_state = {};
          data.sabotage_contact_state.value = SABOTAGE_CONTACT_STATE[input.bytes[idx++]& 0x03];
          data.sabotage_contact_state.unit = "string";
        }

        if( !!(status_param_tx_enable_reg & (1 << 5)) )
        {
          data.hall_sensor_state = {};
          data.hall_sensor_state.value = INPUT_STATE[input.bytes[idx++]& 0x03];
          data.hall_sensor_state.unit = "string";
        }

        if( !!(status_param_tx_enable_reg & (1 << 4)) )
        {
          data.input_clamp_state = {};
          data.input_clamp_state.value = INPUT_STATE[input.bytes[idx++]& 0x03];
          data.input_clamp_state.unit = "string";
        }
      break;
      case "COMMAND_ID_GET_BATTERY_VOLTAGE":
        data.battery_voltage = {};
        data.battery_voltage.value = ( input.bytes[idx++] * 10 + 1500).toFixed(0);
        data.battery_voltage.unit = "mV";
      break;
      case "COMMAND_ID_GET_SABOTAGE_CONTACT_STATE":
        data.sabotage_contact_state = {};
        data.sabotage_contact_state.value = SABOTAGE_CONTACT_STATE[input.bytes[idx++]& 0x03];
        data.sabotage_contact_state.unit = "string";
      break;
      case "COMMAND_ID_GET_SABOTAGE_CONTACT_CONFIG":
        data.sabotage_contact_config = {};
        data.sabotage_contact_config.value = !!(input.bytes[idx++] & 0x01);
        data.sabotage_contact_config.unit = "bool";
      break;
      case "COMMAND_ID_GET_HALL_SENSOR_STATE":
        data.hall_sensor_state = {};
        data.hall_sensor_state.value = INPUT_STATE[input.bytes[idx++]& 0x03];
        data.hall_sensor_state.unit = "string";
      break;     
      case "COMMAND_ID_GET_HALL_SENSOR_CONFIG":
        data.hall_sensor_config = {};
        data.hall_sensor_config.value = !!(input.bytes[idx++] & 0x01);
        data.hall_sensor_config.unit = "bool";
      break;
      case "COMMAND_ID_GET_INPUT_CLAMP_STATE":
        data.input_clamp_state = {};
        data.input_clamp_state.value = INPUT_STATE[input.bytes[idx++]& 0x03];
        data.input_clamp_state.unit = "string";
      break;     
      case "COMMAND_ID_GET_INPUT_CLAMP_CONFIG":
        data.input_clamp_config = {};
        data.input_clamp_config.value = !!(input.bytes[idx++] & 0x01);
        data.input_clamp_config.unit = "bool";
      break;
      case "COMMAND_ID_GET_INPUT_CLAMP_SENSOR_TYPE":
        data.input_clamp_sensor_type = {};
        data.input_clamp_sensor_type.value = INPUT_CLAMP_SENSOR_TYPE[input.bytes[idx++]& 0x03];
        data.input_clamp_sensor_type.unit = "string";
      break;
      case "COMMAND_ID_GET_INPUT_CLAMP_SENSOR_FILTER_TIME":
        data.input_clamp_filter_time = {};
        data.input_clamp_filter_time.value = input.bytes[idx++] * 30;
        data.input_clamp_filter_time.unit ="s";
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
      case "COMMAND_ID_GET_HARDWARE_FACTORY_RESET_LOCK":
        data.button_action = data.button_action || {};
        data.button_action.hw_factory_reset_locked = data.button_action.hw_factory_reset_locked || {};

        data.button_action.hw_factory_reset_locked.value = !!(input.bytes[idx++] & (0x01));
        data.button_action.hw_factory_reset_locked.unit = "bool";
      break;
      case "COMMAND_ID_GET_REMAINING_TIME_UNTIL_REJOIN":
        data.radio = data.radio || {};
        data.radio.cyclic_rejoin = data.radio.cyclic_rejoin || {};
        data.radio.cyclic_rejoin.remaining_time_until_rejoin = data.radio.cyclic_rejoin.remaining_time_until_rejoin || {};

        data.radio.cyclic_rejoin.remaining_time_until_rejoin.value = ((input.bytes[idx++] & 0x1F) << 16) + (input.bytes[idx++] << 8) + input.bytes[idx++];
        data.radio.cyclic_rejoin.remaining_time_until_rejoin.unit = "min";
      break;
      case "COMMAND_ID_GET_DATA_RATE":
        data.radio = data.radio || {};
        data.radio.data_rate = {};
        data.radio.data_rate.value = DATA_RATE[(input.bytes[idx++] & 0x0F)];
        data.radio.data_rate.unit = "string";
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
