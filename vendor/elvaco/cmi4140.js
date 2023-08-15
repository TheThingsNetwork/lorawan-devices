//Based on user's Manual V1.3
const DIF_VIF_MAPPING = {
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
    58: { measure: 'forward_temperature', unit: '°C', decimal: 3 },
    59: { measure: 'forward_temperature', unit: '°C', decimal: 2 },
    '5a': { measure: 'forward_temperature', unit: '°C', decimal: 1 },
    '5b': { measure: 'forward_temperature', unit: '°C', decimal: 0 },
    '5c': { measure: 'return_temperature', unit: '°C', decimal: 3 },
    '5d': { measure: 'return_temperature', unit: '°C', decimal: 2 },
    '5e': { measure: 'return_temperature', unit: '°C', decimal: 1 },
    '5f': { measure: 'return_temperature', unit: '°C', decimal: 0 },
    fd17: { measure: 'error_flag', unit: '', decimal: 0 },
  },
  '0c': {
    78: { measure: 'serial_from_message', unit: '', decimal: 0 },
  },
};

function get_vif(payload_arr, index) {
  const dif = payload_arr[index].toLowerCase();
  const dif_int = parseInt(dif, 16);

  if (dif_int === 132) {
    const vif = payload_arr
      .slice(index + 1, index + 3)
      .join('')
      .toLowerCase();
    return [vif, index + 3];
  } else {
    const vif = payload_arr[index + 1].toLowerCase();
    return [vif, index + 2];
  }
}


//javascript
function decode_cmi4140_standard(payload_arr) {
  let decoded_dictionary = {};
  let i = 1;
  while (i < payload_arr.length) {
    let dif = payload_arr[i].toLowerCase();
    let dif_int = parseInt(dif, 16);
    let [vif, newIndex] = get_vif(payload_arr, i);
    i = newIndex;
    let bcd_len = dif_int >= 2 && dif_int <= 4 ? dif_int : 4;
    if (payload_arr.slice(i).length <= 5 && vif == 'fd') {
      vif = vif + payload_arr[i];
      i += 1;
    }
    if (!(dif in DIF_VIF_MAPPING) || !(vif in DIF_VIF_MAPPING[dif])) {
      throw new Error('Unknown dif ' + dif + ' and vif ' + vif);
    }
    let reversed_values = payload_arr
      .slice(i, i + bcd_len)
      .reverse()
      .join(''); // Little-endian (LSB)
    i += bcd_len;
    let unit_info = DIF_VIF_MAPPING[dif][vif];
    let value;

    value = unit_info['unit'] ? parseInt(reversed_values, 16) / Math.pow(10, unit_info['decimal']) : parseInt(reversed_values);

    decoded_dictionary[unit_info['measure']] = value;
  }
  return decoded_dictionary;
}

function bytes_to_hex_array(bytes) {
  return bytes.map(function (byte) {
    return ('0' + (byte & 0xff).toString(16)).slice(-2);
  });
}

function hex_to_bytes(hex) {
  return hex.match(/.{1,2}/g).map(function (byte) {
    return parseInt(byte, 16);
  });
}

function decodeUplink(input) {
  switch (input.fPort) {
    case 2:
      const hex_array = bytes_to_hex_array(input.bytes);
      if (hex_array.length < 40) {
          return {
              data: {},
              errors: ['payload length < 40 '],
          };
      }   
      return {
        data: decode_cmi4140_standard(hex_array),
      };
    default:
      return {
          data: {},
        errors: ['unknown FPort'],
      };
  }
}



// array= 000c06526761020c14978999000b2d0000000b3b0000000a5a33060a5e41050c782911036602fd170000
