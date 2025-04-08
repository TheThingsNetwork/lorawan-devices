//Based on user's Manual V1.3
const difVifMapping = {
  '04': {
    '00': { measure: 'energy', unit: 'kWh', decimal: 6 },
    '01': { measure: 'energy', unit: 'kWh', decimal: 5 },
    '02': { measure: 'energy', unit: 'kWh', decimal: 4 },
    '03': { measure: 'energy', unit: 'kWh', decimal: 3 },
    '04': { measure: 'energy', unit: 'kWh', decimal: 2 },
    '05': { measure: 'energy', unit: 'kWh', decimal: 1 },
    '06': { measure: 'energy', unit: 'kWh', decimal: 0 },
    '07': { measure: 'energy', unit: 'kWh', decimal: -1 },
    10: { measure: 'volume', unit: 'm3', decimal: 6 },
    11: { measure: 'volume', unit: 'm3', decimal: 5 },
    12: { measure: 'volume', unit: 'm3', decimal: 4 },
    13: { measure: 'volume', unit: 'm3', decimal: 3 },
    14: { measure: 'volume', unit: 'm3', decimal: 2 },
    15: { measure: 'volume', unit: 'm3', decimal: 1 },
    16: { measure: 'volume', unit: 'm3', decimal: 0 },
    17: { measure: 'volume', unit: 'm3', decimal: -1 },
    fd17: { measure: 'error_flag', unit: '', decimal: 0 },
    '6d': { measure: 'datetime_heat_meter', unit: '', decimal: 0 },
  },
  '02': {
    29: { measure: 'power', unit: 'kW', decimal: 5 }, // to verify
    '2a': { measure: 'power', unit: 'kW', decimal: 4 },
    '2b': { measure: 'power', unit: 'kW', decimal: 3 },
    '2c': { measure: 'power', unit: 'kW', decimal: 2 },
    '2d': { measure: 'power', unit: 'kW', decimal: 1 },
    '2e': { measure: 'power', unit: 'kW', decimal: 0 },
    '2f': { measure: 'power', unit: 'kW', decimal: -1 },
    39: { measure: 'flow', unit: 'm3/h', decimal: 5 }, // assumption
    '3a': { measure: 'flow', unit: 'm3/h', decimal: 4 },
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
  '0c': {
    78: { measure: 'serial', unit: '', decimal: 0 },
  },
};

function getVif(payloadArr, index) {
  const dif = payloadArr[index].toLowerCase();
  const dif_int = parseInt(dif, 16);

  if (dif_int === 132) {
    const vif = payloadArr
      .slice(index + 1, index + 3)
      .join('')
      .toLowerCase();
    return [vif, index + 3];
  } else {
    const vif = payloadArr[index + 1].toLowerCase();
    return [vif, index + 2];
  }
}

function decode_cmi4140_standard(payloadArr) {
  let decoded_dictionary = {};
  let i = 1;
  while (i < payloadArr.length) {
    let dif = payloadArr[i].toLowerCase();
    let dif_int = parseInt(dif, 16);
    let [vif, newIndex] = getVif(payloadArr, i);
    i = newIndex;
    let bcd_len = dif_int >= 2 && dif_int <= 4 ? dif_int : 4;
    if (payloadArr.slice(i).length <= 5 && vif == 'fd') {
      vif += payloadArr[i];
      i += 1;
    }
    if (!(dif in difVifMapping) || !(vif in difVifMapping[dif])) {
      throw new Error('Unknown dif ' + dif + ' and vif ' + vif);
    }
    let reversed_values = payloadArr
      .slice(i, i + bcd_len)
      .reverse()
      .join(''); // Little-endian (LSB)
    i += bcd_len;
    let unit_info = difVifMapping[dif][vif];
    let value;

    value = unit_info['unit'] ? parseInt(reversed_values, 16) / Math.pow(10, unit_info['decimal']) : parseInt(reversed_values);

    decoded_dictionary[unit_info['measure']] = value;
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
      switch (hex_array[0]) {
        case '15':
          return {
            data: decode_cmi4140_standard(hex_array),
          };
        default:
          return {
            data: {},
            errors: ['Payload type unknown, currently standard format supported'],
          };
      }

    default:
      return {
        data: {},
        errors: ['unknown FPort'],
      };
  }
}

// bytes = [21, 4, 5, 252, 67, 127, 14, 4, 19, 64, 145, 152, 34, 2, 46, 144, 21, 2, 60, 72, 43, 2, 89, 216, 37, 2, 93, 232, 20, 12, 120, 39, 148, 129, 121, 4, 253, 23, 0, 0, 1, 0];
// input = { fPort: 2, bytes: bytes };
// console.log(decodeUplink(input));
