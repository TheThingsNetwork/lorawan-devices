function decodeUplink(input) {
  var data = {};
  switch (input.fPort) {
    case 1: // Counter update
      data.type = "counter_update";
      data.counter_value = input.bytes[0] << 8 | input.bytes[1]
      break;

    case 2: // Heartbeat
      data.type = "heartbeat";
      data.hw_health_status = input.bytes[0] & 0x7F;
      var batteryVoltageMv = 2500 + input.bytes[1] * 4;
      data.battery_voltage = batteryVoltageMv / 1000;

      var batteryMeanVoltageMv = 2500 + input.bytes[2] * 4;
      data.battery_voltage_mean_24h = batteryMeanVoltageMv / 1000;

      break;

    case 3: // Startup
      data.type = "startup";
      data.firmware_version = input.bytes[0] + "." + input.bytes[1] + "." + input.bytes[2];
      data.reset_cause = [
        "rejoining_lorawan_network",
        "watchdog",
        "power_on",
        "user_request",
        undefined,
        undefined,
        "brownout",
        "other",
      ][input.bytes[3]];
      break;

    case 6: // Debug
      data.type = "debug";
      data.bytes = input.bytes
      break;
  }

  return {
    data: data,
  };
}
