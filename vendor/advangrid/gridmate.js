/**
 * TTN v3 Payload Formatter for GridMate Device
 */
function decodeUplink(input) {
  var bytes = input.bytes;
  var data = {};
  var errors = [];
  var warnings = [];

  // Check Application Port
  if (input.fPort !== 2) {
    warnings.push("Expected fPort 2, but received " + input.fPort);
  }

  // Validate packet length
  if (bytes.length !== 128) {
    errors.push("Invalid payload length: expected 128 bytes, got " + bytes.length);
    return { data: data, errors: errors, warnings: warnings };
  }

  // Validate format version
  var version = bytes[0];
  if (version !== 1) {
    errors.push("Unsupported packet format version: " + version);
    return { data: data, errors: errors, warnings: warnings };
  }

  // --- Big-Endian Helper Functions ---
  
  function readInt16BE(bytes, offset) {
    var val = (bytes[offset] << 8) | bytes[offset + 1];
    // Convert to signed 16-bit
    return val & 0x8000 ? val - 0x10000 : val;
  }

  function readUInt16BE(bytes, offset) {
    return (bytes[offset] << 8) | bytes[offset + 1];
  }

  function readInt24BE(bytes, offset) {
    var val = (bytes[offset] << 16) | (bytes[offset + 1] << 8) | bytes[offset + 2];
    // Convert to signed 24-bit
    return val & 0x800000 ? val - 0x1000000 : val;
  }

  function readUInt24BE(bytes, offset) {
    return (bytes[offset] << 16) | (bytes[offset + 1] << 8) | bytes[offset + 2];
  }

  function readUInt32BE(bytes, offset) {
    // Zero-fill right shift enforces unsigned 32-bit evaluation in JS
    return ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0;
  }

  // --- Decoding Logic ---

  // Global Device Info
  data.hum = bytes[1] * 0.5;                   // Relative air humidity (0.5%)
  data.temp = readInt16BE(bytes, 2) * 0.1;     // Air temperature (0.1 °C)
  
  // Phase Data (4 sections of 31 bytes each)
  data.l = [];
  for (var n = 0; n < 4; n++) {
    var offset = 4 + (n * 31);
    
    data.l.push({
      vrms: readUInt16BE(bytes, offset + 0) / 100,      // Average RMS voltage (10mV -> V)
      irms: readUInt24BE(bytes, offset + 2) / 100,      // Average RMS current (10mA -> A)
      ipeak: readUInt16BE(bytes, offset + 5),           // Peak current (1A)
      pf: readInt16BE(bytes, offset + 7) / 1000,        // Average power factor (0.001)
      p: readInt24BE(bytes, offset + 9),                // Average active power (1W)
      q: readInt24BE(bytes, offset + 12),               // Average reactive power (1VAr)
      wh_pos: readUInt32BE(bytes, offset + 15),         // Total positive active energy (1Wh)
      wh_neg: readUInt32BE(bytes, offset + 19),         // Total negative active energy (-1Wh)
      varh_pos: readUInt32BE(bytes, offset + 23),       // Total positive reactive energy (1VArh)
      varh_neg: readUInt32BE(bytes, offset + 27)        // Total negative reactive energy (-1VArh)
    });
  }

  return {
    data: data,
    warnings: warnings,
    errors: errors
  };
}
