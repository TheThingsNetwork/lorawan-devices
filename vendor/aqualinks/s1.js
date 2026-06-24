function decodeUplink(input) {
  const bytes = input.bytes;

  if (!bytes || bytes.length < 9) {
    return { errors: ["Invalid payload"] };
  }

  const header = bytes[0];

  // 0x45 = version v003 or lower
  // 0x50 = version v004 or higher
  if (header !== 0x45 && header !== 0x50) {
    return { errors: ["Unknown payload header"] };
  }

  // ====================================
  // DATALOGGER
  // 46 bytes without temperature
  // 48 bytes with temperature
  // ====================================
  if (bytes.length >= 46) {
    const cumulativeFlow =
      (bytes[1]) |
      (bytes[2] << 8) |
      (bytes[3] << 16) |
      (bytes[4] << 24);

    const cumulativeFlowM3 = cumulativeFlow / 1000;

    // Datalogger alarms byte
    const alarms = bytes[45] || 0;

    const alarm_leakage            = !!(alarms & (1 << 0));
    const alarm_wrong_installation = !!(alarms & (1 << 1));
    const alarm_overflow           = !!(alarms & (1 << 2));
    const alarm_burst              = !!(alarms & (1 << 3));
    const alarm_reverse_flow       = !!(alarms & (1 << 4));
    const alarm_low_battery        = !!(alarms & (1 << 5));

    const alarm_active =
      alarm_leakage ||
      alarm_wrong_installation ||
      alarm_overflow ||
      alarm_burst ||
      alarm_reverse_flow ||
      alarm_low_battery;

    const data = {
      type: "datalogger",
      datalogger: true,
      alarm_active,
      alarm_burst,
      alarm_leakage,
      alarm_low_battery,
      alarm_overflow,
      alarm_reverse_flow,
      alarm_wrong_installation,
      battery_status: alarm_low_battery ? "LOW" : "OK",
      cumulativeFlow,
      cumulativeFlowM3,
      water: cumulativeFlowM3
    };

    // Optional temperature
    if (bytes.length >= 48) {
      let rawTemp = (bytes[46] << 8) | bytes[47];
      if (rawTemp & 0x8000) rawTemp -= 0x10000;
      data.temperatureC = rawTemp / 10;
    }

    return { data };
  }

  // ====================================
  // STANDARD UPLINK
  // valid for 0x45 and 0x50
  // ====================================
  const cumulativeFlow =
    (bytes[1]) |
    (bytes[2] << 8) |
    (bytes[3] << 16) |
    ((bytes[4] & 0xF0) << 20);

  const cumulativeFlowM3 = cumulativeFlow / 1000;

  const alarms = bytes[8] || 0;

  const alarm_leakage            = !!(alarms & (1 << 0));
  const alarm_wrong_installation = !!(alarms & (1 << 1));
  const alarm_overflow           = !!(alarms & (1 << 2));
  const alarm_burst              = !!(alarms & (1 << 3));
  const alarm_reverse_flow       = !!(alarms & (1 << 4));
  const alarm_low_battery        = !!(alarms & (1 << 5));

  const alarm_active =
    alarm_leakage ||
    alarm_wrong_installation ||
    alarm_overflow ||
    alarm_burst ||
    alarm_reverse_flow ||
    alarm_low_battery;

  const data = {
    type: "standard",
    datalogger: false,
    alarm_active,
    alarm_burst,
    alarm_leakage,
    alarm_low_battery,
    alarm_overflow,
    alarm_reverse_flow,
    alarm_wrong_installation,
    battery_status: alarm_low_battery ? "LOW" : "OK",
    cumulativeFlow,
    cumulativeFlowM3,
    water: cumulativeFlowM3
  };

  // Optional temperature in standard uplink
  if (bytes.length >= 11) {
    let rawTemp = (bytes[9] << 8) | bytes[10];
    if (rawTemp & 0x8000) rawTemp -= 0x10000;
    data.temperatureC = rawTemp / 10;
  }

  return { data };
}
