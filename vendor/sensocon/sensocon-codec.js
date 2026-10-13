// Sensocon Series WS / WM payload codec
// Format from public SD-0178 (Sensocon LoRaWAN Wireless Sensors)
// Uplink: version (1 byte) + repeated (sensor type 1 byte + IEEE754 float32 LE 4 bytes)
// Downlink: command byte + length + big-endian data (offsets in thousandths of base unit)

const SENSOR_TYPES = {
  0x01: { name: 'differentialPressure', unit: 'inWC' },
  0x02: { name: 'humidity', unit: '%' },
  0x03: { name: 'temperature', unit: 'F' },
  0x04: { name: 'batteryVoltage', unit: 'V' },
  0x05: { name: 'contact', unit: '' },
  0x06: { name: 'gaugePressure', unit: 'PSI' },
  0x07: { name: 'analogCurrent', unit: 'mA' },
  0x08: { name: 'analogVoltage', unit: 'V' },
};

function decodeUplink(input) {
  const bytes = input.bytes;
  if (!bytes || bytes.length < 1) {
    return { errors: ['payload too short'] };
  }
  const version = bytes[0];
  const data = {};
  let i = 1;
  while (i + 5 <= bytes.length) {
    const type = bytes[i];
    const buf = new ArrayBuffer(4);
    const view = new DataView(buf);
    view.setUint8(0, bytes[i + 1]);
    view.setUint8(1, bytes[i + 2]);
    view.setUint8(2, bytes[i + 3]);
    view.setUint8(3, bytes[i + 4]);
    const value = view.getFloat32(0, true); // little-endian
    const meta = SENSOR_TYPES[type] || { name: 'unknown_' + type.toString(16), unit: '' };
    data[meta.name] = Math.round(value * 100) / 100; // round to avoid float noise
    i += 5;
  }
  return { data: data };
}

function encodeDownlink(input) {
  // Simple example: command 0x01, length 2, value as big-endian uint16 (thousandths)
  const cmd = input.data && input.data.command ? input.data.command : 0x01;
  const value = input.data && input.data.value ? input.data.value : 0;
  const bytes = [cmd, 2, (value >> 8) & 0xff, value & 0xff];
  return { bytes: bytes };
}

function decodeDownlink(input) {
  return { data: { raw: input.bytes } };
}

module.exports = { decodeUplink, encodeDownlink, decodeDownlink };
