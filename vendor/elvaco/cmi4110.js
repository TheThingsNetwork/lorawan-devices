const difVifMapping = {
  '0c': {
    '06': { measure: 'energy', unit: 'kWh', decimal: 0 },
    '07': { measure: 'energy', unit: 'kWh', decimal: -1 },
    // "FB00": {"measure": "energy", "unit": "kWh", "decimal": -3},
    // "FB01": {"measure": "energy", "unit": "kWh", "decimal": -3},
    14: { measure: 'volume', unit: 'm3', decimal: 2 },
    15: { measure: 'volume', unit: 'm3', decimal: 1 },
    16: { measure: 'volume', unit: 'm3', decimal: 0 },
    78: { measure: 'serial', unit: '', decimal: 0 },
  },
  '0b': {
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
  },
  '0a': {
    '5a': { measure: 'flow_temperature', unit: '°C', decimal: 1 },
    '5b': { measure: 'flow_temperature', unit: '°C', decimal: 0 },
    '5e': { measure: 'return_temperature', unit: '°C', decimal: 1 },
    '5f': { measure: 'return_temperature', unit: '°C', decimal: 0 },
  },
  '02': { fd17: { measure: 'error_flag', unit: '', decimal: 0 } },
  '04': { fd17: { measure: 'error_flag', unit: '', decimal: 0 } },
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

function checkNegativeValue(reversed_values) {
  if (reversed_values.includes('f0')) {
    return -parseInt(reversed_values.replace('f0', ''), 16);
  } else {
    return parseInt(reversed_values, 16);
  }
}

function decodeCMI4110Standard(payloadArr) {
  const decoded_dictionary = {};
  let i = 1;
  energy_count = 0;
  while (i < payloadArr.length) {
    const dif = payloadArr[i].toLowerCase();
    const dif_int = parseInt(dif, 16);
    let [vif, newIndex] = getVif(payloadArr, i);
    i = newIndex;
    let bcd_len = dif_int;
    if (!(dif_int >= 2 && dif_int <= 4)) {
      bcd_len = dif_int - 8;
    }
    if (payloadArr.length - i <= 3) {
      vif += payloadArr[i];
      i += 1;
    }

    if (dif in difVifMapping && vif in difVifMapping[dif]) {
      const reversed_values = payloadArr
        .slice(i, i + bcd_len)
        .reverse()
        .join('');
      const value_int = checkNegativeValue(reversed_values);
      i += bcd_len;

      const unit_info = difVifMapping[dif][vif];
      let register = unit_info['measure'];
      switch (register) {
        case 'energy':
          if (energy_count == 0) {
          } else if (energy_count < 4) {
            register = 'energy_tariff_' + energy_count.toString();
          } else {
            throw 'more than 4 energy registers';
          }
          energy_count += 1;
          value = parseInt(reversed_values) / Math.pow(10, unit_info['decimal']);
          break;
        case 'flow' || 'power':
          value = value_int / Math.pow(10, unit_info['decimal']);
          break;
        default:
          value = parseInt(reversed_values) / Math.pow(10, unit_info['decimal']);
          if (!unit_info['unit']) {
            value = parseInt(reversed_values);
          }
      }
      decoded_dictionary[register] = value;
    } else {
      throw 'Unknown dif ' + dif + ' and vif ' + vif;
    }
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
      if (hex_array[0] != '00') {
        return {
          data: {},
          errors: ['Payload type unknown, currently standard format supported'],
        };
      }
      return {
        data: decodeCMI4110Standard(hex_array),
      };
    default:
      return {
        data: {},
        errors: ['unknown FPort'],
      };
  }
}

// array= 000c06526761020c14978999000b2d0000000b3b0000000a5a33060a5e41050c782911036602fd170000
// hex = ["00","0c","06","52","67","61","02","0c","14","97","89","99","00","0b","2d","00","00","00","0b","3b","00","00","00","0a","5a","33","06","0a","5e","41","05","0c","78","29","11","03","66","02","fd","17","00","00"]
// bytes = [0, 12, 6, 82, 103, 97, 2, 12, 20, 151, 137, 153, 0, 11, 45, 0, 0, 0, 11, 59, 0, 0, 0, 10, 90, 51, 6, 10, 94, 65, 5, 12, 120, 41, 17, 3, 102, 2, 253, 23, 0, 0];
// input = { fPort: 2, bytes: bytes };
// console.log(decodeUplink(input));
