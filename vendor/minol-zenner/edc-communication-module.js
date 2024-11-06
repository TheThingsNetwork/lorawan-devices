function decodeUplink(input) {
  var bytes = input.bytes;
  var status = bytes[0]; // Assuming the first byte contains the status summary bits
  var data = {
    removal_detection: (status & 0x01) >> 0,
    battery_low: (status & 0x02) >> 1,
    battery_end_of_life: (status & 0x04) >> 2,
    hw_error: (status & 0x08) >> 3,
    coil_manipulation: (status & 0x20) >> 5,
    // ... other status bits
  };

  // Assuming the next bytes contain meter values in SP12 format
  var meterValues = [];
  for (var i = 1; i < bytes.length; i += 4) {
    // Combining four bytes to form a meter value
    var meterValue = (bytes[i] << 24) | (bytes[i + 1] << 16) | (bytes[i + 2] << 8) | bytes[i + 3];
    meterValues.push(meterValue);
  }

  data.meter_values = meterValues;

  return {
    data: data,
  };
}