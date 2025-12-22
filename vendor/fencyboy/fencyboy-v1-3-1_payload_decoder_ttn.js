/**
 * Fencyboy v1.3.1 Payload Decoder TTN
 *
 */

function decodeNormalPayload(bytes) {
  
  // decode status byte
  var statusByte = bytes[0];
  var isInActiveMode = Boolean(statusByte & 0x01);
  var hasBatterySensorData = Boolean(statusByte & 0x04);
  var adcLastReadOkay = Boolean(statusByte & 0x08);
  var adcVerify = Boolean(statusByte & 0x10);
  
  // baseline size is 5
  // optionally 8 bytes for fence voltages
  // optionally 8 bytes for battery sensor data with temperature
  var validByteLenghts = [
    5, // baseline size
    13, // baseline + battery sensor with temperature
    13, // baseline + fence voltages
    21, // baseline + fence voltages + battery sensor with temperature
  ];
  if (!isElementInArray(bytes.length, validByteLenghts)) {
    return {
      data: { },
      warnings: [
        "Unexpected length of bytes: " + bytes.length + ". Expected lenght to be one of " + validByteLenghts + "."
      ],
      errors: []
    }
  }
  
  var idx = 1;
  var batteryVoltage = readUInt16BG(bytes.slice(idx, idx+2)) / 1000;
  idx += 2;
  var impulsecounter = readUInt16BG(bytes.slice(idx, idx + 2));
  idx += 2;
  
  var data = {
    ACTIVE_MODE: isInActiveMode,
    BATTERYVOLTAGE: batteryVoltage,
    IMPULSES: impulsecounter,
    DEBUG: {
      ADC_LAST_READ_OKAY: adcLastReadOkay,
      ADC_VERIFY: adcVerify
    },
  };
  
 
  data.FENCEVOLTAGE = 0.0;
  data.FENCE_VOLTAGE_STD = 0.0;
  data.FENCEVOLTAGEMIN = 0.0;
  data.FENCEVOLTAGEMAX = 0.0;
  if (impulsecounter > 0) {
    data.FENCEVOLTAGE = readInt16BG(bytes.slice(idx, idx + 2));
    idx += 2;
    data.FENCE_VOLTAGE_STD = readInt16BG(bytes.slice(idx, idx + 2)) / 10;
    idx += 2;
    data.FENCEVOLTAGEMIN = readInt16BG(bytes.slice(idx, idx + 2));
    idx += 2;
    data.FENCEVOLTAGEMAX = readInt16BG(bytes.slice(idx, idx + 2));
    idx += 2;
  }

  if (hasBatterySensorData) {
    data.BATTERYVOLTAGE = readInt16BG(bytes.slice(idx, idx + 2)) / 1000;
    idx += 2;

    data.REMAINING_CAPACITY = bytesToFloat(bytes.slice(idx, idx + 4));
    idx += 4;
    
    data.TEMPERATURE = readInt16BG(bytes.slice(idx, idx + 2)) / 100;
    idx += 2;
  }

  return {
    data: data,
    warnings: [],
    errors: []
  };
}

function decodeSettingsPayload(bytes) {
  
  // Unexpected length of bytes: " + bytes.length + ". Expected lenght 12.
  if (bytes.length != 12) {
    
    return {
      data: { },
      warnings: ["Invalid length of Settings payload: " + bytes.length],
      errors: []
    }
  }
  
  return {
    data: {
      CONFIGURATION_VERSION: bytes[0],
      CONFIGURATION_SENDINTERVAL: bytes[1],
      CONFIGURATION_STATUSLED_ON: Boolean(bytes[2]),
      CONFIGURATION_SMARTSLEEP_ON: Boolean(bytes[3]),
      CONFIGURATION_EXPECTED_MS_BETWEEN_IMPULSES: readUInt16BG(bytes.slice(4, 6)),
      CONFIGURATION_PERIODIC_RESTART_TIME_MINUTES: readUInt16BG(bytes.slice(6, 8)),
      CONFIGURATION_VOLTAGE_DIVIDER_MULTIPLIER: bytesToFloat(bytes.slice(8, 12)),
    },
    warnings: [],
    errors: []
  };
}

function decodeMinutesTillRestartPayload(bytes) {

    // Unexpected length of bytes: " + bytes.length + ". Expected lenght 2.
    if (bytes.length != 2) {
      
      return {
        data: { },
        warnings: ["Invalid length of MinutesTillRestart payload: " + bytes.length],
        errors: []
      }
    }
    
    return {
      data: {
        MINUTES_TILL_RESTART: readUInt16BG(bytes.slice(0, 2)),
      },
      warnings: [],
      errors: []
    };
}

function decodeUplink(input, x) {
  
  //var metadata = getMetadata(input);

  if (input.fPort === 1) {
    return decodeNormalPayload(input.bytes);  
  } else if (input.fPort === 2) {
    return decodeSettingsPayload(input.bytes);  
  } else if (input.fPort === 3) {
    return decodeMinutesTillRestartPayload(input.bytes);
  }
  
  return {
    data: { },
    warnings: [],
    errors: ["invalid fPort: "+ input.fPort]
  };
}

function isElementInArray(element, array) {
    for (var index = 0; index < array.length; index++) {
        if (element === array[index]) {
            return true;
        }
    }
    return false;
}


/* ******************************************
 * bytes to number
 ********************************************/
function readUInt16BG(bytes) {
    var value = (bytes[0] << 8) + bytes[1];
    return value & 0xffff;
}

function readUInt32BG(bytes) {
    var value = (bytes[0] << 24) + (bytes[1] << 16) + (bytes[2] << 8) + bytes[3];
    return value & 0xffffffff;
}

function readInt16BG(bytes) {
    var ref = readUInt16BG(bytes);
    return ref > 0x7fff ? ref - 0x10000 : ref;
}

function readInt32BG(bytes) {
    var ref = readUInt32BG(bytes);
    return ref > 0x7fffffff ? ref - 0x100000000 : ref;
}

function bytesToFloat(bytes) {
    //MSB Format (least significant byte first).
    var bits = bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3];
    var sign = (bits >>> 31 === 0) ? 1.0 : -1.0;
    var e = bits >>> 23 & 0xff;
    var m = (e === 0) ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
    var f = sign * m * Math.pow(2, e - 150);
    return f;
}
