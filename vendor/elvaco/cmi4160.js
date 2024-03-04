const difVifMapping = {
  '00': {
    '2f': { measure: '', unit: '', decimal: 0 },
  },
  '01': {
    fd17: { measure: 'error_flag', unit: '', decimal: 0 },
  },
  '04': {
    '00': { measure: 'energy', unit: 'kWh', decimal: 6 },
    '01': { measure: 'energy', unit: 'kWh', decimal: 5 },
    '02': { measure: 'energy', unit: 'kWh', decimal: 4 },
    '03': { measure: 'energy', unit: 'kWh', decimal: 3 },
    '04': { measure: 'energy', unit: 'kWh', decimal: 2 },
    '05': { measure: 'energy', unit: 'kWh', decimal: 1 },
    '06': { measure: 'energy', unit: 'kWh', decimal: 0 },
    '07': { measure: 'energy', unit: 'kWh', decimal: -1 },
    11: { measure: 'volume', unit: 'm3', decimal: 5 },
    12: { measure: 'volume', unit: 'm3', decimal: 4 },
    13: { measure: 'volume', unit: 'm3', decimal: 3 },
    14: { measure: 'volume', unit: 'm3', decimal: 2 },
    15: { measure: 'volume', unit: 'm3', decimal: 1 },
    16: { measure: 'volume', unit: 'm3', decimal: 0 },
    17: { measure: 'volume', unit: 'm3', decimal: -1 },
    '6d': { measure: 'datetime_heat_meter', unit: '', decimal: 0 },
  },
  '02': {
    '2a': { measure: 'power', unit: 'kW', decimal: 4 },
    '2b': { measure: 'power', unit: 'kW', decimal: 3 },
    '2c': { measure: 'power', unit: 'kW', decimal: 2 },
    '2d': { measure: 'power', unit: 'kW', decimal: 1 },
    '2e': { measure: 'power', unit: 'kW', decimal: 0 },
    '2f': { measure: 'power', unit: 'kW', decimal: -1 },
    '3b': { measure: 'flow', unit: 'm3/h', decimal: 3 },
    '3c': { measure: 'flow', unit: 'm3/h', decimal: 2 },
    '3d': { measure: 'flow', unit: 'm3/h', decimal: 1 },
    '3e': { measure: 'flow', unit: 'm3/h', decimal: 0 },
    '3f': { measure: 'flow', unit: 'm3/h', decimal: -1 },
    58: { measure: 'flow_temperature', unit: '°C', decimal: 3 },
    59: { measure: 'flow_temperature', unit: '°C', decimal: 2 },
    '5a': { measure: 'flow_temperature', unit: '°C', decimal: 1 },
    '5b': { measure: 'flow_temperature', unit: '°C', decimal: 0 },
    '5c': { measure: 'return_temperature', unit: '°C', decimal: 3 },
    '5d': { measure: 'return_temperature', unit: '°C', decimal: 2 },
    '5e': { measure: 'return_temperature', unit: '°C', decimal: 1 },
    '5f': { measure: 'return_temperature', unit: '°C', decimal: 0 },
    fd17: { measure: 'error_flag', unit: '', decimal: 0 },
  },
  '07': { 79: { measure: 'serial', unit: '', decimal: 0 } },
};

function decode_cmi4160_standard(payloadArr) {
  const decoded_dictionary = {};
  let error_state = false;
  let i = 1;
  while (i < payloadArr.length) {
    const dif = payloadArr[i].toLowerCase();
    const dif_int = parseInt(dif, 16);
    let vif = payloadArr[i + 1].toLowerCase();
    i += 2;

    if (payloadArr.length - i <= 3 && vif == 'fd') {
      // end of payload: error flag
      vif += payloadArr[i];
      i += 1;
    }
    let bcd_len = 4;
    if ((dif_int >= 2 && dif_int <= 4) || dif_int == 7) {
      bcd_len = dif_int;
    }

    if (!(dif in difVifMapping && vif in difVifMapping[dif])) {
      throw 'Unknown dif ' + dif + ' and vif dif in difVifMapping' + vif;
    }
    const reversed_values = payloadArr
      .slice(i, i + bcd_len)
      .reverse()
      .join(''); //Little-endian (LSB)
    i += bcd_len;
    unit_info = difVifMapping[dif][vif];
    if (unit_info['unit']) {
      value = parseInt(reversed_values, 16) / Math.pow(10, unit_info['decimal']);
    } else if (unit_info['measure'] == 'serial') {
      value = parseInt(reversed_values.slice(-8)); // byte 2-5 is serial number
      i += 1;
    } else {
      value = parseInt(reversed_values, 16);
    }
    if (dif == '32') {
      decoded_dictionary[unit_info['measure']] = 0;
      error_state = true;
    } else {
      decoded_dictionary[unit_info['measure']] = value;
    }
  }
  if (error_state) {
    decoded_dictionary['error_flag'] = 32;
  }
  return decoded_dictionary;
}

function bytesToHexArray(bytes) {
  return bytes.map(function (byte) {
    return ('0' + (byte & 0xff).toString(16)).slice(-2);
  });
}

function hexToBytes(hex) {
  const hexArray = hex.match(/.{1,2}/g);
  return hexArray.map(function (byte) {
    return parseInt(byte, 16);
  });
}

function decodeUplink(input) {
  switch (input.fPort) {
    case 2:
      const hex_array = bytesToHexArray(input.bytes);
      if (hex_array.length < 40) {
        return {
          data: {},
          errors: ['payload length < 40 '],
        };
      }
      if (hex_array[0] != '1e') {
        return {
          data: {},
          errors: ['Payload type unknown, currently standard format supported'],
        };
      }
      return {
        data: decode_cmi4160_standard(hex_array),
      };
    default:
      return {
        data: {},
        errors: ['unknown FPort'],
      };
  }
}

// bytes = [30, 4, 7, 233, 28, 5, 0, 4, 21, 141, 103, 15, 0, 50, 47, 75, 51, 50, 61, 55, 51, 50, 90, 89, 4, 50, 94, 89, 4, 7, 121, 34, 152, 132, 97, 165, 17, 64, 4, 1, 253, 23, 4];
// bytes = [30, 4, 6, 143, 161, 1, 0, 4, 19, 132, 183, 30, 0, 2, 43, 207, 15, 2, 59, 93, 0, 2, 90, 16, 3, 2, 94, 152, 1, 7, 121, 130, 37, 50, 105, 165, 17, 64, 4, 1, 253, 23, 0];
// input = { fPort: 2, bytes: bytes };

// console.log(decodeUplink(input));
