function decodeUplink(input) {
  var data = {};
  switch (input.fPort) {
    case 1: // Parking status
      data.type = "parking_status";
      data.occupied = (input.bytes[0] & 0x1) === 0x1;
      break;

    case 2: // Heartbeat
      data.type = "heartbeat";
      data.occupied = (input.bytes[0] & 0x1) === 0x1;
      break;

    case 3: // Startup
      data.type = "startup";
      data.firmware_version = input.bytes[0] + "." + input.bytes[1] + "." + input.bytes[2];
      data.reset_cause = [
        undefined,
        "watchdog",
        "power_on",
        "user_request",
        "brownout",
        "other",
      ][input.bytes[3]];
      data.occupied = (input.bytes[4] & 0x1) === 0x1;
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
