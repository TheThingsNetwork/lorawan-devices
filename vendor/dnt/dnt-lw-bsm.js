var payload_parser_version = [1, 0, 2];


const DEVICE_ERROR_CODE =
{
    0: "DEVICE_OKAY",
    1: "DEVICE_OVER_CURRENT_SHUTOFF",
    2: "DEVICE_OVER_TEMPERATURE_SHUTOFF",
    3: "DEVICE_RESERVED"
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

const SWITCH_STATE =
{
    0: "SWITCH_DISABLED",
    1: "SWITCH_ENABLED",
};

const SWITCH_FAULT =
{
    0: "NO_FAULT",
    1: "NO_CONSUMER",
    2: "TWO_CONSUMER",
    3: "RESERVED",
};

const SWITCH_ROCKER_PRESSED =
{
    0: "NO_ROCKER_PRESSED",
    1: "ROCKER_A_PRESSED",
    2: "ROCKER_B_PRESSED",
    3: "BOTH_ROCKER_PRESSED",
};

const SWITCH_ROCKER_ACTION =
{
    0: "ROCKER_DISABLE",
    1: "ROCKER_ENABLE",
    2: "ROCKER_TOGGLE",
    3: "NONE",
};

const WEEK_PROGRAM_STATE =
{
    0: "WEEK_PROGRAM_DISABLED",
    1: "WEEK_PROGRAM_ENABLED",
};

const SELECTED_WEEK_PROGRAM =
{
    0: "WEEK_PROGRAM_1",
    1: "WEEK_PROGRAM_2",
    3: "WEEK_PROGRAM_3",
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
    4: "COMMAND_ID_GET_DEVICE_STATUS",
    5: "COMMAND_ID_GET_DEVICE_ERROR",
    6: "COMMAND_ID_GET_SWITCH_STATE",
    7: "COMMAND_ID_GET_SWITCH_FAULT",
    8: "COMMAND_ID_ENABLE_SWITCH",
    9: "COMMAND_ID_DISABLE_SWITCH",
    10: "COMMAND_ID_TOGGLE_SWITCH",
    11: "COMMAND_ID_GET_ACTIVE_POWER",
    12: "COMMAND_ID_GET_VOLTAGE",
    13: "COMMAND_ID_GET_CURRENT",
    14: "COMMAND_ID_GET_FREQUENCY",
    15: "COMMAND_ID_GET_SWITCH_ROCKER_A_ACTION",
    16: "COMMAND_ID_SET_SWITCH_ROCKER_A_ACTION",
    17: "COMMAND_ID_GET_SWITCH_ROCKER_B_ACTION",
    18: "COMMAND_ID_SET_SWITCH_ROCKER_B_ACTION",
    19: "COMMAND_ID_GET_SWITCH_ON_DURATION",
    20: "COMMAND_ID_SET_SWITCH_ON_DURATION",
    21: "COMMAND_ID_GET_SWITCH_OFF_DELAY",
    22: "COMMAND_ID_SET_SWITCH_OFF_DELAY",
    23: "COMMAND_ID_GET_DEVICE_TIME",
    24: "COMMAND_ID_SET_DEVICE_TIME",
    25: "COMMAND_ID_GET_DEVICE_TIME_CONFIG",
    26: "COMMAND_ID_SET_DEVICE_TIME_CONFIG",
    27: "COMMAND_ID_GET_WEEK_PROGRAM_STATE",
    28: "COMMAND_ID_SET_WEEK_PROGRAM_STATE",
    29: "COMMAND_ID_GET_SELECTED_WEEK_PROGRAM",
    30: "COMMAND_ID_SET_SELECTED_WEEK_PROGRAM",
    31: "COMMAND_ID_GET_WEEK_PROGRAM",
    32: "COMMAND_ID_SET_WEEK_PROGRAM",
    33: "COMMAND_ID_COMMAND_FAILED",
    117: "COMMAND_ID_GET_HARDWARE_FACTORY_RESET_LOCK",
    118: "COMMAND_ID_SET_HARDWARE_FACTORY_RESET_LOCK",
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


    while (idx < bufferSize) {
        commandId = input.bytes[idx++];

        switch (COMMAND_ID[commandId]) {
            case "COMMAND_ID_GET_STATUS_INTERVAL":
                data.status_report = data.status_report || {};
                data.status_report.interval = data.status_report.interval || {};
                data.status_report.interval.value = ((input.bytes[idx++] << 8) + input.bytes[idx++]) * 30 + 30;
                data.status_report.interval.unit = "s";
                break;

            case "COMMAND_ID_GET_STATUS_PARAMETER_TX_ENABLE_REGISTER":
                data.radio = data.radio || {};
                data.radio.status_report = data.radio.status_report || {};
                data.radio.status_report.parameter_tx_enable_reg = data.radio.status_report.parameter_tx_enable_reg || {};

                var status_param_tx_enable_reg = input.bytes[idx++];

                data.radio.status_report.parameter_tx_enable_reg.state_fault_rocker_enabled = !!(status_param_tx_enable_reg & (1 << 7));
                data.radio.status_report.parameter_tx_enable_reg.active_power_enabled = !!(status_param_tx_enable_reg & (1 << 6));
                data.radio.status_report.parameter_tx_enable_reg.voltage_enabled = !!(status_param_tx_enable_reg & (1 << 5));
                data.radio.status_report.parameter_tx_enable_reg.current_enabled = !!(status_param_tx_enable_reg & (1 << 4));
                data.radio.status_report.parameter_tx_enable_reg.frequency_enabled = !!(status_param_tx_enable_reg & (1 << 3));
                data.radio.status_report.parameter_tx_enable_reg.unit = "bool";
                break;

            case "COMMAND_ID_GET_DEVICE_STATUS":
                var status_param_tx_enable_reg = input.bytes[idx++];

                if (!!(status_param_tx_enable_reg & (1 << 7))) {
                    var switch_flags = input.bytes[idx++];
                    data.switch_state = {};
                    data.switch_state.value = SWITCH_STATE[(switch_flags & 0x80) >> 7];
                    data.switch_state.unit = "string";
                    data.switch_fault = {};
                    data.switch_fault.value = SWITCH_FAULT[(switch_flags & 0x60) >> 5];
                    data.switch_fault.unit = "string";
                    data.switch_rocker_pressed = {};
                    data.switch_rocker_pressed.value = SWITCH_ROCKER_PRESSED[(switch_flags & 0x18) >> 3];
                    data.switch_rocker_pressed.unit = "string";

                }

                if (!!(status_param_tx_enable_reg & (1 << 6))) {
                    data.active_power = {};
                    data.active_power.value = (((input.bytes[idx++] << 8) + input.bytes[idx++]) * 0.1).toFixed(2);
                    data.active_power.unit = "W";
                }

                if (!!(status_param_tx_enable_reg & (1 << 5))) {
                    data.voltage = {};
                    data.voltage.value = (((input.bytes[idx++] << 8) + input.bytes[idx++]) * 0.1).toFixed(2);
                    data.voltage.unit = "V";
                }

                if (!!(status_param_tx_enable_reg & (1 << 4))) {
                    data.current = {};
                    data.current.value = (((input.bytes[idx++] << 8) + input.bytes[idx++]) * 0.001).toFixed(2);
                    data.current.unit = "A";
                }

                if (!!(status_param_tx_enable_reg & (1 << 3))) {
                    data.frequency = {};
                    data.frequency.value = (((input.bytes[idx++] << 8) + input.bytes[idx++]) * 0.01).toFixed(2);
                    data.frequency.unit = "Hz";
                }
                break;

            case "COMMAND_ID_GET_DEVICE_ERROR":
                data.device_error = {};
                data.device_error.value = DEVICE_ERROR_CODE[input.bytes[idx++]];
                data.device_error.unit = "string";
                break;

            case "COMMAND_ID_GET_SWITCH_STATE":
                data.switch_state = {};
                data.switch_state.value = SWITCH_STATE[input.bytes[idx++]];
                data.switch_state.unit = "bool";
                break;

            case "COMMAND_ID_GET_SWITCH_FAULT":
                data.error_code = {};
                data.error_code.value = SWITCH_FAULT[input.bytes[idx++]];
                data.error_code.unit = "string";
                break;

            case "COMMAND_ID_GET_ACTIVE_POWER":
                data.active_power = {};
                data.active_power.value = (((input.bytes[idx++] << 8) + input.bytes[idx++]) * 0.1).toFixed(2);
                data.active_power.unit = "W";
                break;

            case "COMMAND_ID_GET_VOLTAGE":
                data.voltage = {};
                data.voltage.value = (((input.bytes[idx++] << 8) + input.bytes[idx++]) * 0.1).toFixed(2);
                data.voltage.unit = "V";
                break;

            case "COMMAND_ID_GET_CURRENT":
                data.current = {};
                data.current.value = (((input.bytes[idx++] << 8) + input.bytes[idx++]) * 0.001).toFixed(2);
                data.current.unit = "A";
                break;

            case "COMMAND_ID_GET_FREQUENCY":
                data.frequency = {};
                data.frequency.value = (((input.bytes[idx++] << 8) + input.bytes[idx++]) * 0.01).toFixed(2);
                data.frequency.unit = "Hz";
                break;

            case "COMMAND_ID_GET_SWITCH_ROCKER_A_ACTION":
                data.switch_rocker_a_action = {};
                data.switch_rocker_a_action.value = SWITCH_ROCKER_ACTION[input.bytes[idx++]];
                data.switch_rocker_a_action.unit = "string";
                break;

            case "COMMAND_ID_GET_SWITCH_ROCKER_B_ACTION":
                data.switch_rocker_b_action = {};
                data.switch_rocker_b_action.value = SWITCH_ROCKER_ACTION[input.bytes[idx++]];
                data.switch_rocker_b_action.unit = "string";
                break;

            case "COMMAND_ID_GET_SWITCH_ON_DURATION":
                data.switch_on_duration = {};
                data.switch_on_duration.value = ((input.bytes[idx++] << 8) + input.bytes[idx++]) * 5;
                data.switch_on_duration.unit = "s";
                break;

            case "COMMAND_ID_GET_SWITCH_OFF_DELAY":
                data.switch_off_delay = {};
                data.switch_off_delay.value = ((input.bytes[idx++] << 8) + input.bytes[idx++]) * 5;
                data.switch_off_delay.unit = "s";
                break;

            case "COMMAND_ID_GET_WEEK_PROGRAM_STATE":
                data.switch_off_delay = {};
                data.switch_off_delay.value = WEEK_PROGRAM_STATE[input.bytes[idx++]];
                data.switch_off_delay.unit = "string";
                break;

            case "COMMAND_ID_GET_SELECTED_WEEK_PROGRAM":
                data.switch_off_delay = {};
                data.switch_off_delay.value = SELECTED_WEEK_PROGRAM[input.bytes[idx++]];
                data.switch_off_delay.unit = "string";
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

                data.device_time.config.utc_dst_begin.week_of_month.value = WEEK_OF_MONTH[(input.bytes[idx] >> 4) & 0x0F];
                data.device_time.config.utc_dst_begin.week_of_month.unit = "string";

                data.device_time.config.utc_dst_begin.month.value = MONTH[input.bytes[idx++] & 0x0F];
                data.device_time.config.utc_dst_begin.month.unit = "string";

                data.device_time.config.utc_dst_begin.weekday.value = WEEKDAY[input.bytes[idx] >> 5];
                data.device_time.config.utc_dst_begin.weekday.unit = "string";

                data.device_time.config.utc_dst_begin.hour.value = (input.bytes[idx++] & 0x0F);
                data.device_time.config.utc_dst_begin.hour.unit = "h";

                data.device_time.config.utc_dst_offset.value = ((input.bytes[idx++] & 0x7F) * 0.25 - 12).toFixed(2);
                data.device_time.config.utc_dst_offset.unit = "h";

                data.device_time.config.utc_dst_end.week_of_month.value = WEEK_OF_MONTH[(input.bytes[idx] >> 4) & 0x0F];
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

            case "COMMAND_ID_GET_WEEK_PROGRAM":
                data.week_programm = data.week_programm || {};


                var week_program_nbr = (input.bytes[idx] >> 4) & 0x03;
                var nbr_time_switching_points = input.bytes[idx++] & 0x0F;

                const time_switching_point = {};

                switch (week_program_nbr) {
                    case 0:
                        data.week_programm.week_program_1 = {};
                        break;

                    case 1:
                        data.week_programm.week_program_2 = {};
                        break;

                    case 2:
                        data.week_programm.week_program_3 = {};
                        break;

                    default:

                        break;
                }

                for (let i = 0; i < nbr_time_switching_points; i++) {

                    time_switching_point.minute = (input.bytes[idx] >> 4) * 5;
                    time_switching_point.hour = ((input.bytes[idx++] & 0x0F) << 1) + (input.bytes[idx] >> 7);
                    time_switching_point.weekdays = input.bytes[idx++] & 0x7F;
                    time_switching_point.switch_state = SWITCH_STATE[input.bytes[idx++]];

                    switch (week_program_nbr) {
                        case 0:
                            data.week_programm.week_program_1[i] = Object.assign({}, time_switching_point);
                            break;

                        case 1:
                            data.week_programm.week_program_2[i] = Object.assign({}, time_switching_point);
                            break;

                        case 2:
                            data.week_programm.week_program_3[i] = Object.assign({}, time_switching_point);
                            break;

                        default:

                            break;
                    }
                }
                break;

            case "COMMAND_ID_COMMAND_FAILED":
                data.radio = data.radio || {};
                data.radio.failed_commands = {};

                var nbr_failed_commands = input.bytes[idx++];

                data.radio.failed_commands.value = {};

                for (let i = 0; i < nbr_failed_commands; i++) {
                    data.radio.failed_commands.value[i] = COMMAND_ID[input.bytes[idx++]];
                }

                data.radio.failed_commands.unit = "COMMAND_ID";
                break;

            case "COMMAND_ID_GET_HARDWARE_FACTORY_RESET_LOCK":
                data.hw_factory_reset_locked = {};
                data.hw_factory_reset_locked.value = !!(input.bytes[idx++] & (0x01));
                data.hw_factory_reset_locked.unit = "bool";
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

function decodeDownlink(input) {
  return {
    data: {
      bytes: input.bytes
    },
    warnings: [],
    errors: []
  }
}
