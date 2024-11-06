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
  32: {
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
  '0c': { 78: { measure: 'serial', unit: '', decimal: 0 } },
};

function decode_cmi4130_standard(payloadArr) {
  const decoded_dictionary = {};
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
    if (dif_int >= 2 && dif_int <= 4) {
      bcd_len = dif_int;
    } else if (dif_int == 50) {
      // 32 reversed flow
      bcd_len = 2;
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
    if (unit_info) {
      value = parseInt(reversed_values, 16) / Math.pow(10, unit_info['decimal']);
    } else {
      value = parseInt(reversed_values, 16);
    }
    if (dif == '32') {
      //reverse flow
      decoded_dictionary[unit_info['measure']] = 0;
    } else {
      decoded_dictionary[unit_info['measure']] = value;
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
  return hex.map(function (byte) {
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
      if (hex_array[0] != '0f') {
        return {
          data: {},
          errors: ['Payload type unknown, currently standard format supported'],
        };
      }
      return {
        data: decode_cmi4130_standard(hex_array),
      };
    default:
      return {
        data: {},
        errors: ['unknown FPort'],
      };
  }
}
// array= 150405b827bd3a04142cddb10d02290000023a000002598f26025d61160c784405817904fd1700000000
// bytes = [15, 4, 7, 225, 4, 2, 0, 4, 21, 17, 162, 76, 0, 2, 45, 62, 0, 2, 59, 12, 3, 2, 90, 166, 2, 2, 94, 96, 2, 12, 120, 25, 103, 144, 16, 2, 253, 23, 0, 0];
// input = { fPort: 2, bytes: bytes };
// console.log(decodeUplink(input));
