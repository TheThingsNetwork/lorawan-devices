// Chirpstack v4
function encodeDownlink(input) {
  var encoded = inbiotDeviceDecode(input.data);
  return { bytes: encoded, fPort: 1 };
}
// Chirpstack v3 and Milesight
function Encode(fPort, input) {
  return inbiotDeviceDecode(input);
}

// The Things Network
function Encoder(input, fPort) {
  return inbiotDeviceDecode(input.bytes);
}

// The Tings Network decoder downlink
function decodeDownlink(input) {
  var encoded = inbiotDeviceDecode(input.bytes);
  return {
    data: {
      bytes: encoded,
    },
  };
}

// Main encoder function
function inbiotDeviceDecode(payload) {
  var encoded = [];

  if ("ledStatus" in payload) {
    encoded = encoded.concat(setLedEnable(payload.ledStatus));
  }
  if ("timeToSend" in payload) {
    encoded = encoded.concat(setSendPeriodicity(payload.timeToSend));
  }
  if ("ventilation" in payload) {
    encoded = encoded.concat(setCo2Calibration(payload.ventilation));
  }
  if ("ledConfiguration" in payload) {
    encoded = encoded.concat(setLedConfiguration(payload.ledConfiguration));
  }
  if ("touchEnable" in payload) {
    encoded = encoded.concat(setTouchEnable(payload.touchEnable));
  }
  if ("ADREnable" in payload) {
    encoded = encoded.concat(setADREnable(payload.ADREnable));
  }
  if ("DR" in payload) {
    encoded = encoded.concat(setDR(payload.DR));
  }
  if ("sendRetransmissions" in payload) {
    encoded = encoded.concat(
      setSendRetransmissions(payload.sendRetransmissions)
    );
  }
  if ("TXPower" in payload) {
    encoded = encoded.concat(setTXPower(payload.TXPower));
  }
  if ("confirmationEnable" in payload) {
    encoded = encoded.concat(setConfirmationEnable(payload.confirmationEnable));
  }
  if ("resetDevice" in payload) {
    encoded = encoded.concat(setResetDevice(payload.resetDevice));
  }
  return encoded;
}

/**
 *
 * @param {number} ledStatus value: (true/false)
 * @description This function encodes the ledStatus value into a byte array.
 * * Possible values:
 * * * true: LED enabled
 * * * false: LED disabled
 * @example { "ledStatus": true }
 */
function setLedEnable(ledStatus) {
  if (typeof ledStatus !== "boolean") {
    throw new Error("ledStatus must be a boolean value.");
  }
  return [0x01, 0x01, ledStatus ? 0x01 : 0x00];
}

/**
 *
 * @param {number} timeToSend value: (0-60)
 * @description This function encodes the timeToSend value into a byte array.
 * * Possible values:
 * * * 0: Default periodicity (every 15 minutes)
 * * * 1 - 60: Custom periodicity in minutes
 * @example { "timeToSend": 0 }
 */
function setSendPeriodicity(timeToSend) {
  if (typeof timeToSend !== "number" || timeToSend < 0 || timeToSend > 60) {
    throw new Error("timeToSend must be a number between 0 and 60.");
  }
  if (timeToSend === 0) {
    return [0x02, 0x01, 0xf];
  } else {
    return [0x02, 0x01, timeToSend];
  }
}

/**
 * Function to encode co2Calibration
 * @param {number} ventilation value: (1-5)
 * @description This function encodes the co2Calibration value into a byte array.
 * * Possible values:
 * * 1: Calibration every 48 hours
 * * 2: Calibration every 24 hours
 * * 3: Calibration every 7 days
 * * 4: Calibration every 15 days
 * * 5: No calibration
 * @example { "ventilation": 1 }
 */
function setCo2Calibration(ventilation) {
  if (typeof ventilation !== "number" || ventilation < 1 || ventilation > 5) {
    throw new Error("ventilation must be a number between 1 and 5.");
  }
  return [0x03, 0x01, ventilation];
}

/**
 *
 * @param {number} ledConfiguration value: (0-15)
 * @description This function encodes the ledConfiguration value into a byte array.
 * * Possible values:
 * * * 0: Ventilation indicator (default configuration)
 * * * 1: Confort indicator
 * * * 2: Temperature indicator
 * * * 3: Humidity indicator
 * * * 4: CO2 indicator
 * * * 5: VOCS indicator
 * * * 6: PM2.5 indicator
 * * * 7: PM10 indicator
 * * * 8: Virus indicator
 * * * 9: IAQ indicator
 * * * 10: PM1.0 indicator
 * * * 11: PM4 indicator
 * * * 12: CH2O indicator
 * * * 13: O3 indicator
 * * * 14: NO2 indicator
 * * * 15: CO indicator
 * * * 16: Mold Persistence Indicator
 * @example { "ledConfiguration": 0 }
 */
function setLedConfiguration(ledConfiguration) {
  if (
    typeof ledConfiguration !== "number" ||
    ledConfiguration < 0 ||
    ledConfiguration > 16
  ) {
    throw new Error("ledConfiguration must be a number between 0 and 16.");
  }
  return [0x04, 0x01, ledConfiguration];
}

/**
 *
 * @param {number} touchEnable value: (true/false)
 * @description This function encodes the touchEnable value into a byte array.
 * * * Possible values:
 * * * true: Touch enabled
 * * * false: Touch disabled
 * @example { "touchEnable": true }
 */
function setTouchEnable(touchEnable) {
  if (typeof touchEnable !== "boolean") {
    throw new Error("touchEnable must be a boolean value.");
  }
  return [0x05, 0x01, touchEnable ? 0x01 : 0x00];
}

/**
 *
 * @param {number} ADREnable value: (true/false)
 * @description This function encodes the ADREnable value into a byte array.
 * * Possible values:
 * * true: ADR enabled
 * * false: ADR disabled
 * @example { "ADREnable": true }
 */
function setADREnable(ADREnable) {
  if (typeof ADREnable !== "boolean") {
    throw new Error("ADREnable must be a boolean value.");
  }
  return [0x09, 0x01, ADREnable ? 0x01 : 0x00];
}

/**
 *
 * @param {number} DR value: (0-7)
 * @description This function encodes the DR value into a byte array.
 * * Possible values:
 * * 0: DR0 = SF12
 * * 1: DR1 = SF11
 * * 2: DR2 = SF10
 * * 3: DR3 = SF9
 * * 4: DR4 = SF8
 * * 5: DR5 = SF7 (default)
 * * 6: DR6 = SF7 (250 kHz)
 * * 7: DR7 = FSK
 * @example { "DR": 0 }
 */
function setDR(DR) {
  if (typeof DR !== "number" || DR < 0 || DR > 5) {
    throw new Error("DR must be a number between 0 and 5.");
  }
  return [0x0a, 0x01, DR];
}

/**
 *
 * @param {number} sendRetransmissions value: (0-15)
 * @description This function encodes the sendRetransmissions value into a byte array.
 * * Possible values:
 * * 0 - 15: Number of retransmissions (0 = no retransmissions, 1-15 = number of retransmissions)
 * * 5: Default value
 * @example { "sendRetransmissions": 5 }
 */
function setSendRetransmissions(sendRetransmissions) {
  if (
    typeof sendRetransmissions !== "number" ||
    sendRetransmissions < 0 ||
    sendRetransmissions > 15
  ) {
    throw new Error("sendRetransmissions must be a number between 0 and 15.");
  }
  return [0x0b, 0x01, sendRetransmissions];
}

/**
 *
 * @param {number} TXPower value: (0-15)
 * @description This function encodes the TXPower value into a byte array.
 * * Possible values:
 * * 0: Max EIRP (default)
 * * 1: Max EIRP - 2 dB
 * * 2: Max EIRP - 4 dB
 * * 3: Max EIRP - 6 dB
 * * 4: Max EIRP - 8 dB
 * * 5: Max EIRP - 10 dB
 * * 6: Max EIRP - 12 dB
 * * 7: Max EIRP - 14 dB
 * * 8 - 14 : Reserved for future use
 * * 15 : Defined in [TS001] Error! Invalid value.
 * @example { "TXPower": 5 }
 */
function setTXPower(TXPower) {
  if (typeof TXPower !== "number" || TXPower < 0 || TXPower > 15) {
    throw new Error("TXPower must be a number between 0 and 15.");
  }
  return [0x0c, 0x01, TXPower];
}

/**
 *
 * @param {number} confirmationEnable value: (true/false)
 * @description This function encodes the confirmationEnable value into a byte array.
 * * Possible values:
 * * true: Confirmation enabled
 * * false: Confirmation disabled
 * @example { "confirmationEnable": true }
 */
function setConfirmationEnable(confirmationEnable) {
  if (typeof confirmationEnable !== "boolean") {
    throw new Error("confirmationEnable must be a boolean value.");
  }
  return [0x0d, 0x01, confirmationEnable ? 0x01 : 0x00];
}

/**
 *
 * @param {number} resetDevice value: (true/false)
 * @description This function encodes the resetDevice value into a byte array.
 * * Possible values:
 * * true: Reset device
 * * false: Do not reset device
 * @example { "resetDevice": true }
 */
function setResetDevice(resetDevice) {
  if (typeof resetDevice !== "boolean") {
    throw new Error("resetDevice must be a boolean value.");
  }
  return [0x0f, 0x01, resetDevice ? 0x01 : 0x00];
}
