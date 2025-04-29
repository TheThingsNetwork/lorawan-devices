// Constants for bit masks and repeated values
const MASK_BIT_1 = 0x01;
const MASK_BIT_2 = 0x02;
const MASK_BIT_3 = 0x04;
const MASK_BIT_4 = 0x08;
const MASK_BIT_5 = 0x10;
const MASK_BIT_6 = 0x20;
const MASK_BIT_7 = 0x40;
const MASK_BIT_8 = 0x80;

// Constants for specific values
const INVALID_VALUE = "Invalid";
const INVALID_MOTOR_RANGE = "Invalid Motor Range";
const INVALID_SPREADING_FACTOR = "Invalid SF";
const INVALID_STATUS = "Invalid Status";
const INVALID_ACTION = "Invalid action";

// Constants for specific output strings
const SLOW_HARVESTING_OFF = "Slow Harvesting switched OFF in Downlink";
const NO_SLOW_HARVESTING_RECENT_TARGET = "No Slow Harvesting.Recent Target % not equal to 0";
const HOT_WATER_OFF = "Hot Water expected to be OFF";
const CANNOT_DETECT_OPENING_POINT = "Cannot detect opening Point";
const NO_SLOW_HARVESTING_BATTERY_HIGH = "No Slow Harvesting. Battery High";
const NO_SLOW_HARVESTING_INSUFFICIENT_CURRENT = "No Slow Harvesting. Insufficient harvesting current";
const DETECTING_OPENING_POINT = "Detecting Opening Point";
const SLOW_HARVESTING = "Slow Harvesting";
const NO_ACTION = "No Action";
const CLOSE_30_MIN = "Close to 0% for 30 minutes and resume normal operation";
const CLOSE_60_MIN = "Close to 0% for 60 minutes and resume normal operation";
const WILL_BEEP = "Device will beep upon resuming normal operation";
const WILL_NOT_BEEP = "Device will not beep upon resuming normal operation";
const ONE_TEMP_DROP = "One temperature drop";
const TWO_TEMP_DROPS = "Two consecutive temperature drops";
const NO_DETECTION = "No Detection";
const DETECTED = "Detected. Ambient Raw dropped by >=1.5°C during last 10 minutes";
const NO_EXPIRY = "No Expiry";
const DEVICE_WILL_SWITCH_OFF = "If a 6-week Reference Run fails, device will switch off";
const DEVICE_WILL_STAY_ON = "Device will stay on regardless of 6-week Reference Run results";
const RECALIBRATION_DONE = "A Recalibration was done, based on the recent FPORT 15 Downlink";
const RECALIBRATION_NOT_DONE = "Device is not performing a recalibration";
const DEVICE_WILL_TURN_OFF = "Device will move to mounting position and switch OFF";
const DEVICE_WILL_OPERATE = "Device is under normal operation";


// Helper function for bit extraction
function getBit(byte, position) {
  return (byte >> position) & MASK_BIT_1;
}

// Decode uplink function.
//
// Input is an object with the following fields:
// - bytes = Byte array containing the uplink payload, e.g. [255, 230, 255, 0]
// - fPort = Uplink fPort.
// - variables = Object containing the configured device variables.
//
// Output must be an object with the following fields:
// - output = Object representing the decoded payload.
function decodeUplink(input) {
  return {
    data: Decode(input.fPort, input.bytes, input.variables)
  };
}

function get_user_mode(input) {
  var user_mode = input[9] & 0x7;
  switch (user_mode) {
    case 0:
      return "Valve_Position";
    case 1:
      return "RESERVED";
    case 2:
      return "SP_Ambient_Temperature";
    case 3:
      return "Detecting_Opening_Point";
    case 4:
      return "Slow_Harvesting";
    case 5:
      return "Temperature_Drop";
    case 6:
      return "Freeze_Protect";
    case 7:
      return "Forced_Heating";
    default:
      return "Unknown Operating Mode";
  }
}

function get_user_value(input) {
  var user_mode = get_user_mode(input);
  switch (user_mode) {
    case "Valve_Position":
    case "Freeze_Protect":
    case "Forced_Heating":
      return input[10];
    case "SP_Ambient_Temperature":
      return input[10] * 0.5;
    case "Detecting_Opening_Point":
    case "Slow_Harvesting":
      return input[10] * 0.25;
    default:
      return "Invalid User Mode";
  }
}

function decode_port_1(input) {
  var output = {
    Current_Valve_Position: input[0],
    Flow_Sensor_Raw: input[1] * 0.5,
    Flow_Temperature: input[2] * 0.5,
    Ambient_Sensor_Raw: input[3] * 0.25,
    Ambient_Temperature: input[4] * 0.25,
    Temperature_Drop_Detection: input[5] >> 7 & 0x01,
    Energy_Storage: input[5] >> 6 & 0x01,
    Harvesting_Active: input[5] >> 5 & 0x01,
    Ambient_Sensor_Failure: input[5] >> 4 & 0x01,
    Flow_Sensor_Failure: input[5] >> 3 & 0x01,
    Radio_Communication_Error: input[5] >> 2 & 0x01,
    Received_Signal_Strength: input[5] >> 1 & 0x01,
    Motor_Error: input[5] >> 0 & 0x01,
    Storage_Voltage: Number((input[6] * 0.02).toFixed(2)),
    Average_Current_Consumed: input[7] * 10,
    Average_Current_Generated: input[8] * 10,
    Operating_Condition: input[9] >> 7 & 0x01,
    Storage_Fully_Charged: input[9] >> 6 & 0x01,
    Zero_Error: input[9] >> 5 & 0x01,
    Calibration_OK: input[9] >> 4 & 0x01,
  }
  output.User_Mode = get_user_mode(input);
  output.User_Value = get_user_value(input);

  if (input.length == 12) {
    utmp = input[11] * 0.25;
    output.Used_Temperature = utmp;
  }
  return output;
}


function decode_port_2(input) {
  var output = {};
  {
    var REV_Major = (input[0] & 0xF).toString();
    var REV_Minor = ((input[0] >> 4) & 0xF).toString(16);
    output.REV = REV_Major + "." + REV_Minor;
  }
  {
    var HW_Major = (input[1] & 0xF).toString();
    var HW_Minor = ((input[1] >> 4) & 0xF).toString();
    output.HW = HW_Major + "." + HW_Minor;
  }
  {
    var FW_Year = input[2].toString();
    var FW_Month = input[3].toString();
    var FW_Day = input[4].toString();
    var FW_Minor = input[5].toString();
    output.FW = "20" + FW_Year + "." + FW_Month + "." + FW_Day + "." + FW_Minor;
  }
  return output;
}

function decode_port_3(input) {
  var output = {};
  switch (input[0]) {
    case 0:
      output.motor_range = 2.56048;
      break;
    case 3:
      output.motor_range = 0.624;
      break;
    case 4:
      output.motor_range = 0.832;
      break;
    case 5:
      output.motor_range = 1.040;
      break;
    case 6:
      output.motor_range = 1.248;
      break;
    case 7:
      output.motor_range = 1.456;
      break;
    case 8:
      output.motor_range = 1.664;
      break;
    case 9:
      output.motor_range = 1.872;
      break;
    case 10:
      output.motor_range = 2.080;
      break;
    case 11:
      output.motor_range = 2.288;
      break;
    case 12:
      output.motor_range = 2.496;
      break;
    default:
      output.motor_range = 0;
      break;
  }
  return output;
}

function decode_port_4(bytes) {
  const output = {};
  switch (bytes[0]) {
    case 0: output.SpreadingFactor = "SF7"; break;
    case 1: output.SpreadingFactor = "SF8"; break;
    default: output.SpreadingFactor = INVALID_SPREADING_FACTOR; break;
  }
  return output;
}

function decode_port_5(bytes) {
  const output = {};
  output.Opening_Percent_Found = getBit(bytes[0], 7);
  output.Opening_Percent_Value = bytes[0] & 0x7F;
  const status = bytes[1] & 0x07;
  switch (status) {
    case 0: output.status = SLOW_HARVESTING_OFF; break;
    case 1: output.status = NO_SLOW_HARVESTING_RECENT_TARGET; break;
    case 2: output.status = HOT_WATER_OFF; break;
    case 3: output.status = CANNOT_DETECT_OPENING_POINT; break;
    case 4: output.status = NO_SLOW_HARVESTING_BATTERY_HIGH; break;
    case 5: output.status = NO_SLOW_HARVESTING_INSUFFICIENT_CURRENT; break;
    case 6: output.status = DETECTING_OPENING_POINT; break;
    case 7: output.status = SLOW_HARVESTING; break;
    default: output.status = INVALID_STATUS; break;
  }
  return output;
}

function decode_port_6(bytes) {
  const output = {};
  const action = (bytes[0] >> 6) & 0x03;
  switch (action) {
    case 0: output.action = NO_ACTION; break;
    case 2: output.action = CLOSE_30_MIN; break;
    case 3: output.action = CLOSE_60_MIN; break;
    default: output.action = INVALID_ACTION; break;
  }

  const beep_bit = getBit(bytes[0], 5);
  output.beep = beep_bit ? WILL_BEEP : WILL_NOT_BEEP;

  const drop_period_bit = getBit(bytes[0], 4);
  output.drop_period = drop_period_bit ? TWO_TEMP_DROPS : ONE_TEMP_DROP;

  const temperature_drop_detected_bit = getBit(bytes[0], 0);
  output.temperature_drop_detected = temperature_drop_detected_bit ? DETECTED : NO_DETECTION;

  return output;
}

function decode_port_7(bytes) {
  const output = {};
  output.P_Coefficient = bytes[0];
  output.I_Coefficient = (bytes[1] * 0.02);
  output.D_Coefficient = (bytes[2] * 0.2);
  output.Closed_Percent = bytes[4];
  output.D_Coefficient_when_closed = (bytes[5] * 0.2);
  output.Offset_Percent = bytes[6];
  return output;
}

function decode_port_8(bytes) {
  const output = {};
  let index = bytes[0];
  if (index >= 128) index -= 256;
  output.flow_offset = index * 0.25;
  return output;
}

function decode_port_9(bytes) {
  const output = {};
  const expiry = bytes[0];
  output.external_temperature_sensor_expiry_in_minutes = expiry === 0 ? NO_EXPIRY : expiry * 5;
  let temperature_use_bit = bytes[1];
  if (temperature_use_bit === 0) {
    output.source_of_room_temperature_for_control = "Internal Temperature Estimate";
  }
  else if (temperature_use_bit === 1) {
    output.source_of_room_temperature_for_control = "External Temperature Sensor";
  }
  return output;
}

function decode_port_15(bytes) {
  const output = {};
  const device_on_bit = getBit(bytes[0], 7);
  output.device_on = device_on_bit ? DEVICE_WILL_STAY_ON : DEVICE_WILL_SWITCH_OFF;
  const recalibration_bit = getBit(bytes[0], 6);
  output.recailbration_status = recalibration_bit ? RECALIBRATION_DONE : RECALIBRATION_NOT_DONE;
  const operating_status_bit = getBit(bytes[0], 0);
  output.operating_status = operating_status_bit ? DEVICE_WILL_TURN_OFF : DEVICE_WILL_OPERATE;
  return output;
}

function Decode(fPort, bytes) {
  var output = {};
  switch (fPort) {
    case 1:
      output = decode_port_1(bytes);
      break;
    case 2:
      output = decode_port_2(bytes);
      break;
    case 3:
      output = decode_port_3(bytes);
      break;
    case 4:
      output = decode_port_4(bytes);
      break;
    case 5:
      output = decode_port_5(bytes);
      break;
    case 6:
      output = decode_port_6(bytes);
      break;
    case 7:
      output = decode_port_7(bytes);
      break;
    case 8:
      output = decode_port_8(bytes);
      break;
    case 9:
      output = decode_port_9(bytes);
      break;
    case 15:
      output = decode_port_15(bytes);
      break;
    default:
      return {
        errors: ['unknown FPort'],
      };
  }
  return output;
}