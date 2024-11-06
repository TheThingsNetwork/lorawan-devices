function encodeDownlink(input) {
  let result;
  switch (input.command) {
    /* Command 1: Change sampling rate */
    case 1:
      result = changeSamplingRate(input.data);
      break;
    /* Command 2: Enable/Disable confirmation */
    case 2:
      result = confirmation(input.data);
      break;
    /* Command 3: Reset device */
    case 3:
      result = resetDevice(input.data);
      break;
    /* Command 4: Change periodic auto-reset settings */
    case 4:
      result = autoResetDevice(input.data);
      break;
    default:
      return {
        errors: ['Unknown command: please use command 1-4, used' + input.command],
      };
  }

  if (Array.isArray(result)) {
    return {
      fPort: 5,
      bytes: result,
    };
  } else {
    // return error if there is any
    return result;
  }
}

/*
 * Command 1
 * The changeSamplingRate function encodes the JSON data
 * to a 4 bytes array downlink messsage that changes device
 * sampling rate.
 */
function changeSamplingRate(data) {
  if (typeof data.unit !== 'string') {
    return {
      errors: ["Missing required field or invalid input: unit"],
    };
  }
  if (typeof data.time !== 'number') {
    return {
      errors: ["Missing required field or invalid input: time"],
    };
  }

  let bytes = [0x10];
  let unit = data.unit, time = data.time;
  // Add time unit
  if (unit == "second") {
    bytes.push(0x00);
  } else if (unit == "minute") {
    bytes.push(0x01);
  } else {
    return {
      errors: ["Invalid time unit: must be either \"minute\" or \"second\""],
    };
  }

  // Add length of time with a minimum sleep period is 60 seconds
  if ((unit == "second" && time < 60) || (unit == "minute" && time < 1)) {
    return {
      errors: ["Invalid sampling interval: minimum is 60 seconds (i.e. 1 minute)"],
    };
  } 
  return bytes.concat(decimalToHexBytes(time));
}

/*
 * Command 2
 * The confirmation function encodes the JSON data
 * to a 2 bytes array downlink messsage that enable/disable
 * confirmation.
 */
function confirmation(data) {
  if (typeof data.confirmation !== 'boolean') {
    return {
      errors: ["Missing required field or invalid input: confirmation"],
    };
  }

  if (data.confirmation) {
    return [0x07, 0x01];
  } else {
    return [0x07, 0x00];
  }
}

/*
 * Command 3
 * The resetDevice function encodes the JSON data
 * to a 2 bytes array downlink messsage that resets
 * the device.
 */
function resetDevice(data) {
  if (typeof data.reset !== 'boolean' || !data.reset) {
    return {
      errors: ["Missing required field or invalid input: reset"],
    };
  }

  if (data.reset) {
    return [0xFF, 0x00];
  }
}

/*
 * Command 4
 * The resetDevice function encodes the JSON data
 * to a 3 bytes array downlink messsage that changes
 * periodic auto-reset settings of device.
 */
function autoResetDevice(data) {
  if (typeof data.count !== 'number') {
    return {
      errors: ["Missing required field or invalid input: count"],
    };
  }
  // 
  return [0x16].concat(decimalToHexBytes(data.count));
}

/*
 * The decimalToHexBytes converts a decimal number
 * to 2 bytes hex array
 */
function decimalToHexBytes(n) {
  return [n >> 8, n & 0xFF];
}
