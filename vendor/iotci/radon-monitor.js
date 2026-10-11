/**
 * IoT CI wireless LoRaWAN radon monitor: uplink decoder.
 *
 * Periodic uplink on fPort 2, big-endian:
 *   bytes 0-1   battery voltage (mV), 0 when not reported
 *   bytes 2-3   temperature (0.1 °C, signed), reported together with humidity
 *   bytes 4-5   relative humidity (0.1 %), 0 when not reported
 *   bytes 6-7   radon concentration (Bq/m³)
 *   bytes 8-9   CO2 (ppm), 0 when not reported
 *   byte  10    status flags (optional)
 */
function decodeUplink(input) {
  var bytes = input.bytes;
  if (input.fPort !== 2) {
    return { errors: ['unknown fPort ' + input.fPort] };
  }
  if (bytes.length < 10) {
    return { errors: ['payload too short: expected at least 10 bytes, got ' + bytes.length] };
  }

  function u16(i) {
    return (bytes[i] << 8) | bytes[i + 1];
  }
  function s16(i) {
    var v = u16(i);
    return v & 0x8000 ? v - 0x10000 : v;
  }

  var data = { radon: u16(6) };

  var batteryMillivolts = u16(0);
  if (batteryMillivolts > 0) {
    data.batteryVoltage = batteryMillivolts / 1000;
  }
  var humidity = u16(4);
  if (humidity > 0) {
    data.relativeHumidity = humidity / 10;
    data.temperature = s16(2) / 10;
  }
  var co2 = u16(8);
  if (co2 > 0) {
    data.co2 = co2;
  }
  if (bytes.length > 10) {
    data.flags = bytes[10];
  }

  return { data: data };
}
