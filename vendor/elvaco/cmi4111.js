const difVifMapping = {
  34: {
    // value during error state
    '03': { measure: '', unit: '', decimal: 0 },
    13: { measure: '', unit: '', decimal: 0 },
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
    29: { measure: 'power', unit: 'kW', decimal: 5 },
    '2a': { measure: 'power', unit: 'kW', decimal: 4 },
    '2b': { measure: 'power', unit: 'kW', decimal: 3 },
    '2c': { measure: 'power', unit: 'kW', decimal: 2 },
    '2d': { measure: 'power', unit: 'kW', decimal: 1 },
    '2e': { measure: 'power', unit: 'kW', decimal: 0 },
    '2f': { measure: 'power', unit: 'kW', decimal: -1 },
    39: { measure: 'flow', unit: 'm3/h', decimal: 5 },
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
  '0c': { 78: { measure: 'serial_from_message', unit: '', decimal: 0 } },
  84: {
    '0201': { measure: 'energy_tariff_2', unit: 'kWh', decimal: 5 },
    '0202': { measure: 'energy_tariff_2', unit: 'kWh', decimal: 4 },
    '0203': { measure: 'energy_tariff_2', unit: 'kWh', decimal: 3 },
    '0204': { measure: 'energy_tariff_2', unit: 'kWh', decimal: 2 },
    '0205': { measure: 'energy_tariff_2', unit: 'kWh', decimal: 1 },
    '0206': { measure: 'energy_tariff_2', unit: 'kWh', decimal: 0 },
    '0207': { measure: 'energy_tariff_2', unit: 'kWh', decimal: -1 },
    2001: { measure: 'energy_tariff_2', unit: 'kWh', decimal: 5 },
    2002: { measure: 'energy_tariff_2', unit: 'kWh', decimal: 4 },
    2003: { measure: 'energy_tariff_2', unit: 'kWh', decimal: 3 },
    2004: { measure: 'energy_tariff_2', unit: 'kWh', decimal: 2 },
    2005: { measure: 'energy_tariff_2', unit: 'kWh', decimal: 1 },
    2006: { measure: 'energy_tariff_2', unit: 'kWh', decimal: 0 },
    2007: { measure: 'energy_tariff_2', unit: 'kWh', decimal: -1 },
    '0301': { measure: 'energy_tariff_3', unit: 'kWh', decimal: 5 },
    '0302': { measure: 'energy_tariff_3', unit: 'kWh', decimal: 4 },
    '0303': { measure: 'energy_tariff_3', unit: 'kWh', decimal: 3 },
    '0304': { measure: 'energy_tariff_3', unit: 'kWh', decimal: 2 },
    '0305': { measure: 'energy_tariff_3', unit: 'kWh', decimal: 1 },
    '0306': { measure: 'energy_tariff_3', unit: 'kWh', decimal: 0 },
    '0307': { measure: 'energy_tariff_3', unit: 'kWh', decimal: -1 },
    3001: { measure: 'energy_tariff_3', unit: 'kWh', decimal: 5 },
    3002: { measure: 'energy_tariff_3', unit: 'kWh', decimal: 4 },
    3003: { measure: 'energy_tariff_3', unit: 'kWh', decimal: 3 },
    3004: { measure: 'energy_tariff_3', unit: 'kWh', decimal: 2 },
    3005: { measure: 'energy_tariff_3', unit: 'kWh', decimal: 1 },
    3006: { measure: 'energy_tariff_3', unit: 'kWh', decimal: 0 },
    3007: { measure: 'energy_tariff_3', unit: 'kWh', decimal: -1 },
    fd17: { measure: 'error_flag', unit: '', decimal: 0 },
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

function checkNegativeValue(reversed_values) {
  if (reversed_values.includes('f0')) {
    return -parseInt(reversed_values.replace('f0', ''), 16);
  } else {
    return parseInt(reversed_values, 16);
  }
}
function decodeCMI4111Standard(payloadArr) {
  const decodedDictionary = {};
  let i = 1;

  while (i < payloadArr.length) {
    const dif = payloadArr[i];
    let vif = payloadArr[i + 1];
    const difInt = parseInt(dif, 16);
    i += 2;
    if (payloadArr.slice(i).length <= 5 && vif === 'fd') {
      //end of payload: error flag
      vif += payloadArr[i];
      i += 1;
    }
    const bcdLen = difInt >= 2 && difInt <= 4 ? difInt : 4;

    if (!(dif in difVifMapping) || !(vif in difVifMapping[dif])) {
      throw new Error(`Unknown dif ${dif} and vif ${vif}`);
    }

    if (dif === '34') {
      if (payloadArr.filter((val) => val === '00').length > 20) {
        throw new Error('Empty payload, value during error state');
      } else {
        throw new Error(`Unknown dif ${dif} and vif ${vif}`);
      }
    }

    const reversedValues = payloadArr
      .slice(i, i + bcdLen)
      .reverse()
      .join(''); // Little-endian (LSB)
    const unitInfo = difVifMapping[dif][vif];

    let valueInt;
    if (reversedValues.startsWith('fff') && ['power', 'flow'].includes(unitInfo.measure)) {
      valueInt = parseInt(reversedValues.replace('fff', '-'), 16);
    } else {
      valueInt = parseInt(reversedValues, 16);
    }

    i += bcdLen;
    let value;

    if (unitInfo.measure === 'date_heat_meter') {
      throw new Error('date_heat_meter is not supported yet');
    } else if (unitInfo.measure === 'serial_from_message') {
      value = parseInt(reversedValues);
    } else if (unitInfo.unit) {
      value = valueInt / Math.pow(10, unitInfo.decimal);
    } else {
      value = parseInt(reversedValues, 16);
    }

    decodedDictionary[unitInfo.measure] = value;
  }

  return decodedDictionary;
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
      //print the hex array
      console.log('hex_array', hex_array);
      if (hex_array.length < 40) {
        return {
          data: {},
          errors: ['payload length < 40 '],
        };
      }
      if (hex_array[0] != '05') {
        return {
          data: {},
          errors: ['Payload type unknown, currently standard format supported'],
        };
      }
      return {
        data: decodeCMI4111Standard(hex_array),
      };
    default:
      return {
        data: {},
        errors: ['unknown FPort'],
      };
  }
}

// array = '0504065a2600000414f0140a00022d0b00023b2600025a7b02025e7c010c787135496904fd1700000800';
// bytes = [5, 4, 6, 90, 38, 0, 0, 4, 20, 240, 20, 10, 0, 2, 45, 11, 0, 2, 59, 38, 0, 2, 90, 123, 2, 2, 94, 124, 1, 12, 120, 113, 53, 73, 105, 4, 253, 23, 0, 0, 8, 0];
// input = { fPort: 2, bytes: bytes };
// console.log(decodeUplink(input));
