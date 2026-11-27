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

// Day codes used by the FPort 12 weekly schedule (3-bit field, 0 = RESERVED)
const SCHEDULE_DAY_NAMES = ["RESERVED", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const WEEKLY_SCHEDULE_MAX_SETPOINTS = 35; // 5 per day * 7 days


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

function get_spreading_factor(code) {
  switch (code) {
    case 0: return "SF7";
    case 1: return "SF8";
    case 2: return "SF9";
    case 3: return "SF10";
    case 4: return "SF11";
    case 5: return "SF12";
    default: return INVALID_SPREADING_FACTOR;
  }
}

function decode_port_4(bytes) {
  const output = {};
  output.SpreadingFactor = get_spreading_factor(bytes[0]);
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

function get_day_index(day) {
  var index = SCHEDULE_DAY_NAMES.indexOf(day);
  if (index <= 0) {
    throw new Error("Invalid Day: " + day);
  }
  return index;
}

// FPort 14 (EEPROM report) User_Mode/Safety_Mode: a 2-bit "SetValue" mode
// code shared by both fields, per the device's eeprom.rs decode_set_value().
function get_set_value_mode(code) {
  switch (code) {
    case 0: return "Ambient_Temperature";
    case 1: return "Flow_Temperature";
    case 2: return "Valve_Position";
    default: return "RESERVED";
  }
}

function get_set_value(mode, rawValue) {
  switch (mode) {
    case "Ambient_Temperature":
    case "Flow_Temperature":
      return rawValue * 0.5;
    default:
      return rawValue;
  }
}

function get_motor_range(code) {
  switch (code) {
    case 0: return 2.56048;
    case 3: return 0.624;
    case 4: return 0.832;
    case 5: return 1.040;
    case 6: return 1.248;
    case 7: return 1.456;
    case 8: return 1.664;
    case 9: return 1.872;
    case 10: return 2.080;
    case 11: return 2.288;
    case 12: return 2.496;
    default: return 0;
  }
}

function toSignedByte(value) {
  return value >= 128 ? value - 256 : value;
}

function decode_port_12(bytes) {
  const output = {};

  // Need at least 5 bytes for the header + Triggered_Set_Point fields
  if (bytes.length < 5) {
    throw new Error("FPort12 uplink too short: " + bytes.length + " bytes");
  }

  // Byte 0: SON/SOFF (bit7), R/A (bit6), TSS - Total Stored Setpoints (bits5-0)
  output.Scheduler_Status = getBit(bytes[0], 7) ? "ON" : "OFF";
  output.Scheduler_Mode = getBit(bytes[0], 6) ? "Replace" : "Append";
  output.Total_Stored_Setpoints = bytes[0] & 0x3F;

  if (output.Total_Stored_Setpoints > WEEKLY_SCHEDULE_MAX_SETPOINTS) {
    throw new Error("FPort12 uplink reports too many set points: " + output.Total_Stored_Setpoints);
  }

  const expectedLength = 5 + output.Total_Stored_Setpoints * 3;
  if (bytes.length < expectedLength) {
    throw new Error("FPort12 uplink too short: expected " + expectedLength + " bytes, got " + bytes.length);
  }

  // Byte 1: DWFS - Days With Five Setpoints (bit1=Monday ... bit7=Sunday, bit0 RESERVED)
  const daysWithFiveSetpoints = [];
  for (let bit = 1; bit <= 7; bit++) {
    if (getBit(bytes[1], bit)) {
      daysWithFiveSetpoints.push(SCHEDULE_DAY_NAMES[bit]);
    }
  }
  output.Days_With_Five_Setpoints = daysWithFiveSetpoints;

  // Bytes 2-4: Triggered Set Point - DAY (bits7-5 of byte2) | HR (bits4-0 of byte2) | MIN (byte3) | TEMP (byte4, 0.5 resolution)
  const triggeredDay = (bytes[2] >> 5) & 0x07;
  output.Triggered_Set_Point = {
    Day: SCHEDULE_DAY_NAMES[triggeredDay],
    Hour: bytes[2] & 0x1F,
    Minute: bytes[3],
    Temperature: bytes[4] * 0.5,
  };

  // Bytes 5.. : exactly Total_Stored_Setpoints entries, 3 bytes each - DAY (bits7-5) | HR (bits4-0) | MIN | TEMP (0.5 resolution)
  const SETPOINTS_START = 5;
  output.Setpoints = [];
  for (let i = 0; i < output.Total_Stored_Setpoints; i++) {
    const base = SETPOINTS_START + i * 3;

    const day = (bytes[base] >> 5) & 0x07;
    output.Setpoints.push({
      Day: SCHEDULE_DAY_NAMES[day],
      Hour: bytes[base] & 0x1F,
      Minute: bytes[base + 1],
      Temperature: bytes[base + 2] * 0.5,
    });
  }

  return output;
}

function decode_port_13(bytes) {
  const output = {};
  output.Hour = bytes[0];
  output.Minute = bytes[1];
  output.Second = bytes[2];
  output.Day = SCHEDULE_DAY_NAMES[bytes[3]];
  return output;
}

function decode_port_14(bytes) {
  const output = {};

  // Byte 0: SON/SOFF (bit7) | R/A (bit6) | OSS (bit5) | RESERVED (bit4) | UM (bits3-2) | SM (bits1-0)
  output.Scheduler_Status = getBit(bytes[0], 7) ? "ON" : "OFF";
  output.Scheduler_Mode = getBit(bytes[0], 6) ? "Replace" : "Append";
  output.OPD_Schedule_Status = getBit(bytes[0], 5) ? "ON" : "OFF";

  const userModeCode = (bytes[0] >> 2) & 0x03;
  output.User_Mode = get_set_value_mode(userModeCode);

  const safetyModeCode = bytes[0] & 0x03;
  output.Safety_Mode = get_set_value_mode(safetyModeCode);

  // Byte 1: UV - User Value (0.5 resolution for Ambient/Flow_Temperature, raw for Valve_Position)
  output.User_Value = get_set_value(output.User_Mode, bytes[1]);

  // Byte 2: SV - Safety Value (same resolution rule as UV, based on Safety_Mode)
  output.Safety_Value = get_set_value(output.Safety_Mode, bytes[2]);

  // Byte 3: RCI - Radio Communication Interval (minutes)
  switch (bytes[3]) {
    case 0: output.Radio_Communication_Interval = 10; break;
    case 1: output.Radio_Communication_Interval = 5; break;
    case 2: output.Radio_Communication_Interval = 60; break;
    case 3: output.Radio_Communication_Interval = 120; break;
    case 4: output.Radio_Communication_Interval = 480; break;
    default: output.Radio_Communication_Interval = INVALID_VALUE; break;
  }

  // Byte 4: MOR - Motor Operating Range (mm)
  output.Motor_Operating_Range = get_motor_range(bytes[4]);

  // Byte 5: SF - Spreading Factor (EEPROM report encodes this reversed: 5 - byte -> SF7..SF12)
  output.SpreadingFactor = get_spreading_factor(5 - bytes[5]);

  // Byte 6: TDA - Temperature Drop detection Action
  switch (bytes[6]) {
    case 0: output.Temperature_Drop_Detection_Action = NO_ACTION; break;
    case 1: output.Temperature_Drop_Detection_Action = CLOSE_30_MIN; break;
    case 3: output.Temperature_Drop_Detection_Action = CLOSE_60_MIN; break;
    default: output.Temperature_Drop_Detection_Action = INVALID_ACTION; break;
  }

  // Byte 7: TDB - Beep
  output.Beep = bytes[7] ? WILL_BEEP : WILL_NOT_BEEP;

  // Byte 8: TDP - Temperature Drop Period (raw 1/2, NOT zero-indexed - confirmed
  // against real hardware; the eeprom.rs reference's 0/1 mapping for this
  // particular field does not match this firmware build)
  switch (bytes[8]) {
    case 1: output.Temperature_Drop_Period = ONE_TEMP_DROP; break;
    case 2: output.Temperature_Drop_Period = TWO_TEMP_DROPS; break;
    default: output.Temperature_Drop_Period = INVALID_VALUE; break;
  }

  // Bytes 9-12: PID coefficients
  output.P_Coefficient = bytes[9];
  output.I_Coefficient = Number((bytes[10] * 0.02).toFixed(2));
  output.D_Coefficient = Number((bytes[11] * 0.2).toFixed(2));
  output.D_Coefficient_When_Closed = Number((bytes[12] * 0.2).toFixed(2));

  // Bytes 13-15: Percent limits
  output.Closed_Percent = bytes[13];
  output.Offset_Percent = bytes[14];
  output.Open_Percent = bytes[15];

  // Byte 16: FRV - Flow Raw Value Offset (signed, 0.25 resolution)
  output.Flow_Raw_Value_Offset = toSignedByte(bytes[16]) * 0.25;

  // Byte 17: ETS - External Temperature Sensor expiry (always byte*5 minutes, no zero special-case)
  output.External_Temperature_Sensor_Expiry_In_Minutes = bytes[17] * 5;

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
    case 12:
      output = decode_port_12(bytes);
      break;
    case 13:
      output = decode_port_13(bytes);
      break;
    case 14:
      output = decode_port_14(bytes);
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
function encode_port_1(input) {
  let mode = input.data.userMode; // "Ambient_Temperature" or "Valve_Position"
  let safetyMode = input.data.safetyMode; // "Ambient_Temperature" or "Valve_Position"
  let setValue = input.data.setValue; // 0-40 for Ambient_Temperature, 0-100 for Valve_Position
  let roomTemperature = input.data.roomTemperature; // 0-40
  let safetyValue = input.data.safetyValue; // 0-40 for Ambient_Temperature, 0-100 for Valve_Position
  let radioInterval = input.data.radioInterval; // 5, 10, 60, 120, 480
  let doReferenceRunNow = input.data.doReferenceRunNow; // 0 or 1

  let bytes = [0, 0, 0, 0, 0, 0];

  // Byte 1: Set value
  if (mode === "Ambient_Temperature") {
    if (setValue < 0 || setValue > 40) {
      throw new Error("Set value out of range for ambient mode");
    }
    else {
      bytes[0] = setValue * 2;
    }
  } else if (mode === "Valve_Position") {
    if (setValue < 0 || setValue > 100) {
      throw new Error("Set value out of range for valve mode");
    }
    else {
      bytes[0] = setValue;
    }
  } else {
    throw new Error("Invalid user mode");
  }

  // Byte 2: Room temperature (0-40)
  if (roomTemperature < 0 || roomTemperature > 40) {
    throw new Error("Room temperature out of range");
  }
  else {
    bytes[1] = roomTemperature * 4;
  }

  // Byte 3: Safety value
  if (safetyMode === "Ambient_Temperature") {
    if (safetyValue < 0 || safetyValue > 40) {
      throw new Error("Safety value out of range for ambient mode");
    }
    else {
      bytes[2] = safetyValue * 2;
    }
  } else if (safetyMode === "Valve_Position") {
    if (safetyValue < 0 || safetyValue > 100) {
      throw new Error("Safety value out of range for valve mode");
    }
    else {
      bytes[2] = safetyValue;
    }
  } else {
    throw new Error("Invalid safety mode");
  }

  // Byte 4: Radio interval, user mode, safety mode
  let radioBits;
  switch (radioInterval) {
    case 5:
      radioBits = 1 << 4; // Radio interval 5 minutes
      break;
    case 10:
      radioBits = 0 << 4; // Radio interval 10 minutes
      break;
    case 60:
      radioBits = 2 << 4; // Radio interval 60 minutes
      break;
    case 120:
      radioBits = 3 << 4; // Radio interval 120 minutes
      break;
    case 480:
      radioBits = 4 << 4; // Radio interval 480 minutes
      break;
    default:
      throw new Error("Invalid radio interval");
  }

  let userModeBits;
  if (mode === "Ambient_Temperature") {
    userModeBits = 2 << 2; // User mode "Ambient_Temperature" in bits 3 and 4
  } else {
    userModeBits = 0 << 2; // User mode "Valve_Position" in bits 3 and 4
  }

  let safetyModeBits;
  if (safetyMode === "Ambient_Temperature") {
    safetyModeBits = 0 << 0; // Safety mode "Ambient_Temperature" in bits 1 and 2
  } else {
    safetyModeBits = 2 << 0; // Safety mode "Valve_Position" in bits 1 and 2
  }

  bytes[3] = radioBits | userModeBits | safetyModeBits;

  // Byte 5: Reserved (set to 0)
  bytes[4] = 0;

  // Byte 6: doReferenceRunNow bit (bit 8)
  if (doReferenceRunNow < 0 || doReferenceRunNow > 1) {
    throw new Error("Invalid doReferenceRunNow value");
  }
  else {
    bytes[5] = doReferenceRunNow << 7;
  }

  return bytes;
}

function encode_port_2() {
  return [];
}

function encode_port_3(input) {
  let bytes = [0];

  let range = input.data.motor_operating_range;

  switch (range) {
    case "2.56048":
      bytes[0] = 0;
      break;
    case "0.624":
      bytes[0] = 3;
      break;
    case "0.832":
      bytes[0] = 4;
      break;
    case "1.040":
      bytes[0] = 5;
      break;
    case "1.248":
      bytes[0] = 6;
      break;
    case "1.456":
      bytes[0] = 7;
      break;
    case "1.664":
      bytes[0] = 8;
      break;
    case "1.872":
      bytes[0] = 9;
      break;
    case "2.080":
      bytes[0] = 10;
      break;
    case "2.288":
      bytes[0] = 11;
      break;
    case "2.496":
      bytes[0] = 12;
      break;
    default:
      throw new Error("Invalid Motor Operating Range");
  }
  return bytes;
}

function encode_port_4(input) {
  let bytes = [0];

  let sf = input.data.spreading_factor;

  switch (sf) {
    case "SF7":
      bytes[0] = 0;
      break;
    case "SF8":
      bytes[0] = 1;
      break;
    case "SF9":
      bytes[0] = 2;
      break;
    case "SF10":
      bytes[0] = 3;
      break;
    case "SF11":
      bytes[0] = 4;
      break;
    case "SF12":
      bytes[0] = 5;
      break;
    default:
      throw new Error("Invalid Spreading Factor");
  }
  return bytes;
}

function encode_port_5(input) {
  let bytes = [0, 0];

  let opening_point_reset = input.data.opening_point_reset;
  let hot_water_availability = input.data.hot_water_availability;
  let slow_harvesting = input.data.slow_harvesting;
  let max_flow_sensor_raw = input.data.max_flow_sensor_raw;

  let opening_point_reset_bit;
  if (opening_point_reset === true) {
    opening_point_reset_bit = 1 << 4;
  }
  else {
    opening_point_reset_bit = 0 << 4;
  }

  let hot_water_availability_bit;
  switch (hot_water_availability) {
    case "Use_time_of_year":
      hot_water_availability_bit = 0 << 2;
      break;
    case "OFF":
      hot_water_availability_bit = 1 << 2;
      break;
    case "ON":
      hot_water_availability_bit = 2 << 2;
      break;
    default:
      throw new Error("Invalid Hot Water availabiliy");
  }

  let slow_harvesting_bit;
  switch (slow_harvesting) {
    case "DEFAULT":
      slow_harvesting_bit = 0 << 0;
      break;
    case "DO_OPD_AND_SH":
      slow_harvesting_bit = 1 << 0;
      break;
    case "DO_OPD_ONLY":
      slow_harvesting_bit = 2 << 0;
      break;
    case "DISABLE_OPD_AND_SH":
      slow_harvesting_bit = 3 << 0;
      break;
    default:
      throw new Error("Invalid Slow Harvesting Mode");
  }

  bytes[0] = opening_point_reset_bit | hot_water_availability_bit | slow_harvesting_bit;

  if (max_flow_sensor_raw < 0 || max_flow_sensor_raw > 33) {
    throw new Error("Maximum Flow Sensor Raw value out of range");
  }
  else {
    bytes[1] = (max_flow_sensor_raw * 2);
  }

  return bytes;
}

function encode_port_6(input) {
  let bytes = [0];

  let tdd_action = input.data.tdd_action;
  let tdd_beep = input.data.tdd_beep;
  let tdd_period = input.data.tdd_period;

  let tdd_action_bit;
  switch (tdd_action) {
    case "No_Action":
      tdd_action_bit = 0 << 6;
      break;
    case "Close_to_0%_for_30_minutes":
      tdd_action_bit = 2 << 6;
      break;
    case "Close_to_0%_for_60_minutes":
      tdd_action_bit = 3 << 6;
      break;
    default:
      throw new Error("Invalid Action");
  }

  let tdd_beep_bit;
  if (tdd_beep === true) {
    tdd_beep_bit = 1 << 5;
  }
  else {
    tdd_beep_bit = 0 << 5;
  }

  let tdd_period_bit;
  switch (tdd_period) {
    case 1:
      tdd_period_bit = 0 << 4;
      break;
    case 2:
      tdd_period_bit = 1 << 4;
      break;
    default:
      throw new Error("Invalid Period")
  }

  bytes[0] = tdd_action_bit | tdd_beep_bit | tdd_period_bit;

  return bytes;
}

function encode_port_7(input) {
  let bytes = [0, 0, 0, 0, 0, 0, 0];

  let kP = input.data.kP;
  let kI = input.data.kI;
  let kD = input.data.kD;
  let cp = input.data.Closed_Percent;
  let kD_zero = input.data.kD_when_closed;
  let ofp = input.data.Offset_Percent;

  if (kP >= 0 && kP <= 255) {
    bytes[0] = kP;
  }
  else {
    throw new Error("Invalid kP value");
  }

  if (kI >= 0 && kI <= 5.10) {
    bytes[1] = Math.round(kI / 0.02);
  }
  else {
    throw new Error("Invalid kI value");
  }

  if (kD >= 0 && kD <= 51) {
    bytes[2] = Math.round(kD / 0.2);
  }
  else {
    throw new Error("Invalid kD value");
  }

  bytes[3] = 1 << 7;

  if (cp >= 0 && cp <= 100) {
    bytes[4] = cp;
  }
  else {
    throw new Error("Invalid Closed_Percent value");
  }

  if (kD_zero >= 0 && kD_zero <= 51) {
    bytes[5] = Math.round(kD_zero / 0.2);
  }
  else {
    throw new Error("Invalid kD_when_closed value");
  }

  if (ofp >= 0 && ofp <= 100) {
    bytes[6] = ofp;
  }
  else {
    throw new Error("Invalid Offset_Percent value");
  }

  return bytes;
}

function encode_port_8(input) {
  let bytes = [0];

  let frv_offset = input.data.Flow_Raw_Value_Offset;

  if (frv_offset >= 0 && frv_offset <= 31.75) {
    bytes[0] = Math.round(frv_offset * 4)
  }
  else if (frv_offset >= -32 && frv_offset < 0) {
    bytes[0] = (Math.round((frv_offset + 32) * 4) + 0x80);
  }
  else {
    throw new Error('Flow_Raw_Value_Offset out of range. Must be between -32.00 and 31.75');
  }

  return bytes;
}

function encode_port_9(input) {
  let bytes = [0];

  let external_sensor_expiry = input.data.External_temperature_sensor_expiry_minutes;

  if (external_sensor_expiry >= 0 && external_sensor_expiry <= 1275) {
    bytes[0] = Math.round(external_sensor_expiry / 5);
  }
  else {
    throw new Error("Invalid Temperature Sensor expiry time");
  }

  return bytes;
}

function encode_port_10(input) {
  let bytes = [0];

  let room_temperature = input.data.Room_Temperature;

  if (room_temperature >= 0 && room_temperature <= 40) {
    bytes[0] = (room_temperature * 4);
  }
  else {
    throw new Error('Room_Temperature out of range. Must be between 0 and 40');
  }
  return bytes;
}

function encode_port_11(input) {
  let bytes = [0];

  let beeps = input.data.Beep;

  if (beeps >= 0 && beeps <= 255) {
    bytes[0] = beeps;
  }
  else {
    throw new Error('Beep count out of range');
  }
  return bytes;
}

function encode_port_15(input) {
  let bytes = [0];

  let on = input.data.device_will_operate_if_6_week_reference_run_fails;
  let rec = input.data.do_recalibation_now;
  let off = input.data.turn_off_device;

  let on_bit;
  if (on === true) {
    on_bit = 1 << 7;
  }
  else {
    on_bit = 0 << 7;
  }

  let rec_bit;
  if (rec === true) {
    rec_bit = 1 << 6;
  }
  else {
    rec_bit = 0 << 6;
  }

  let off_bit;
  if (off === true) {
    off_bit = 1 << 0;
  }
  else {
    off_bit = 0 << 0;
  }

  bytes[0] = on_bit | rec_bit | off_bit;

  return bytes;
}

// Encodes one weekly-schedule setpoint into 3 bytes: DAY (bits7-5) | HR (bits4-0), MIN, TEMP
// TEMP is transmitted as temperature*2 (0.5 resolution); firmware accepts raw 2-80 (1.0-40.0 C).
function encode_weekly_schedule_setpoint(entry) {
  let dayIndex = get_day_index(entry.Day);

  let hour = entry.Hour;
  if (hour < 0 || hour > 23) {
    throw new Error("Invalid Hour value (0-23)");
  }

  let minute = entry.Minute;
  if (minute < 0 || minute > 59) {
    throw new Error("Invalid Minute value (0-59)");
  }

  let temperature = entry.Temperature;
  if (temperature < 1 || temperature > 40) {
    throw new Error("Invalid Temperature value (1-40)");
  }

  return [(dayIndex << 5) | hour, minute, Math.round(temperature * 2)];
}

function encode_port_12(input) {
  let schedulerStatus = input.data.Scheduler_Status; // "ON" | "OFF"
  let schedulerMode = input.data.Scheduler_Mode;     // "Replace" | "Append"
  let setpoints = input.data.Setpoints || [];

  if (setpoints.length > WEEKLY_SCHEDULE_MAX_SETPOINTS) {
    throw new Error("Too many setpoints (max 35 per week)");
  }

  // The device itself enforces the 5-per-day cap: entries beyond the 5th for
  // a given day are dropped and reported via Days_With_Five_Setpoints on the
  // next uplink, so we don't pre-emptively block that here.
  let statusBit;
  switch (schedulerStatus) {
    case "ON": statusBit = 1 << 7; break;
    case "OFF": statusBit = 0 << 7; break;
    default: throw new Error("Invalid Scheduler_Status");
  }

  let modeBit;
  switch (schedulerMode) {
    case "Replace": modeBit = 1 << 6; break;
    case "Append": modeBit = 0 << 6; break;
    default: throw new Error("Invalid Scheduler_Mode");
  }

  let bytes = [statusBit | modeBit];

  setpoints.forEach(function (entry) {
    bytes = bytes.concat(encode_weekly_schedule_setpoint(entry));
  });

  return bytes;
}

// FPort 13 has no downlink payload of its own (uplink-only, reports the
// device's current date/time) - a downlink on this port is just a bare
// "get" trigger, same as FPort 2.
function encode_port_13() {
  return [];
}

function encode_port_14(input) {
  let bytes = [0];

  // Byte 0: RESERVED (bits7-1) | EEP (bit0) - 0: Get current stored EEPROM data, 1: Restore factory defaults
  let restoreFactoryDefaults = input.data.restore_factory_defaults;
  if (restoreFactoryDefaults === true) {
    bytes[0] = 1;
  } else if (restoreFactoryDefaults === false) {
    bytes[0] = 0;
  } else {
    throw new Error("Invalid restore_factory_defaults value");
  }

  return bytes;
}

// Encode downlink function.
//
// Input is an object with the following fields:
// - output = Object representing the payload that must be encoded.
// - variables = Object containing the configured device variables.
//
// Output must be an object with the following fields:
// - bytes = Byte array containing the downlink payload.
function encodeDownlink(input) {
  let port = Number(input.fPort);

  switch (port) {
    case 1:
      downlink = encode_port_1(input);
      break;
    case 2:
      downlink = encode_port_2();
      break;
    case 3:
      downlink = encode_port_3(input);
      break;
    case 4:
      downlink = encode_port_4(input);
      break;
    case 5:
      downlink = encode_port_5(input);
      break;
    case 6:
      downlink = encode_port_6(input);
      break;
    case 7:
      downlink = encode_port_7(input);
      break;
    case 8:
      downlink = encode_port_8(input);
      break;
    case 9:
      downlink = encode_port_9(input);
      break;
    case 10:
      downlink = encode_port_10(input);
      break;
    case 11:
      downlink = encode_port_11(input);
      break;
    case 12:
      downlink = encode_port_12(input);
      break;
    case 13:
      downlink = encode_port_13();
      break;
    case 14:
      downlink = encode_port_14(input);
      break;
    case 15:
      downlink = encode_port_15(input);
      break;
    default:
      return {
        errors: ['unknown FPort'],
      };
  }



  return {
    bytes: downlink,
    fPort: input.fPort
  };
}