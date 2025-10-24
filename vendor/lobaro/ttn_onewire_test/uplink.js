function decodeUplink(input) {
  if (!input.bytes || input.bytes.length < 2) {
    return { errors: ["payload too short"] };
  }
  var raw = (input.bytes[0] << 8) | input.bytes[1];
  if (raw & 0x8000) raw = raw - 0x10000;
  var temperature = raw / 100.0;
  return { data: { temperature_c: temperature } };
}
