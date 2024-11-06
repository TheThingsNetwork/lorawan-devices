function decodeUplink(input) {
  var data = {};
  switch (input.fPort) {
    case 2:
      data.battery_voltage = {
        displayName: 'Battery voltage',
        unit: 'V',
        value: (((input.bytes[6] * 1200) / 254) + 1800) / 1000
      };
      data.humidity = {
        displayName: 'Relative humidity',
        unit: '%',
        value: ((input.bytes[4] << 8) + input.bytes[5]) / 10
      };
      data.light = {
        displayName: 'Red led status',
        value: (input.bytes[0] & 0x01) ? 'ON':'OFF'
      };
      data.pressure = {
        displayName: 'Barometric pressure',
        unit: 'Pa',
        value: ((input.bytes[1] << 8) + input.bytes[2]) / 10
      };
      data.temperature = {
        displayName: 'Internal temperature',
        unit: '°C',
        value: input.bytes[3] & 0x80 ? input.bytes[3] - 0x100 : input.bytes[3]
      };
      return {
        data: data
      }
    default:
      return {
        errors: ['unknown FPort'],
      };
  }
}

function encodeDownlink(input) {
  return {
    bytes: [input.data.led],
    fPort: 2,
  };
}

function decodeDownlink(input) {
  switch (input.fPort) {
    case 2:
      return {
        data: {
          led: input.bytes[0],
        },
      };
    default:
      return {
        errors: ['invalid FPort'],
      };
  }
}
