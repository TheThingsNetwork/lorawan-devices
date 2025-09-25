// Sensocon unified uplink/downlink codec for The Things Network

function decodeUplink(input) {
  let bytes = input.bytes;
  let data = {};
  data.rawHex = bytes.map(b => b.toString(16).padStart(2, '0')).join('');
  data.header = bytes.length > 0 ? bytes[0] : null;

  bytes = bytes.slice(1);

  for (let i = 0; i < 10; i++) {
    if (bytes.length < 5) break;
    let type = bytes[0];
    let value = getFloat32(bytes.slice(1, 5));
    let key = getType(type);
    if (key !== "EMPTY") data[key] = value;
    bytes = bytes.slice(5);
  }
  return { data };
}

function getType(typeByte) {
  const typeMap = {
    0: "pressure",
    1: "humidity_temp",
    2: "humidity",
    3: "batt_voltage",
    4: "contact",
    5: "velocity",
    6: "voltage",
    7: "current",
    8: "temperature",
    9: "altitude",
    10: "latitude",
    11: "light",
    12: "longitude",
    13: "resistance",
    14: "vibration",
    15: "x_position",
    16: "y_position",
    17: "z_position",
    18: "reserved",
    19: "gauge_diff_pressure"
  };
  return typeMap[typeByte] || "EMPTY";
}

function getFloat32(bytes) {
  let buffer = new ArrayBuffer(4);
  let view = new Uint8Array(buffer);
  for (let i = 0; i < 4; i++) view[i] = bytes[i];
  return new DataView(buffer).getFloat32(0, true);
}

function encodeDownlink(input) {
  let bytes = [];
  switch (input.data.cmd) {
    case "set_interval":
      bytes.push(0x00);
      bytes.push(0x02);
      bytes.push((input.data.seconds >> 8) & 0xff);
      bytes.push(input.data.seconds & 0xff);
      break;
    case "set_pressure_offset":
      bytes.push(0x02);
      bytes.push(0x02);
      bytes.push((input.data.offset >> 8) & 0xff);
      bytes.push(input.data.offset & 0xff);
      break;
    case "set_temp_offset":
      bytes.push(0x04);
      bytes.push(0x02);
      bytes.push((input.data.offset >> 8) & 0xff);
      bytes.push(input.data.offset & 0xff);
      break;
    case "set_humidity_offset":
      bytes.push(0x06);
      bytes.push(0x02);
      bytes.push((input.data.offset >> 8) & 0xff);
      bytes.push(input.data.offset & 0xff);
      break;
    case "set_voltage_offset":
      bytes.push(0x08);
      bytes.push(0x02);
      bytes.push((input.data.offset >> 8) & 0xff);
      bytes.push(input.data.offset & 0xff);
      break;
    case "set_current_offset":
      bytes.push(0x0A);
      bytes.push(0x02);
      bytes.push((input.data.offset >> 8) & 0xff);
      bytes.push(input.data.offset & 0xff);
      break;
    case "set_humidity_temp_offset":
      bytes.push(0x0C);
      bytes.push(0x02);
      bytes.push((input.data.offset >> 8) & 0xff);
      bytes.push(input.data.offset & 0xff);
      break;
    case "set_gauge_diff_pressure_offset":
      bytes.push(0x10);
      bytes.push(0x02);
      bytes.push((input.data.offset >> 8) & 0xff);
      bytes.push(input.data.offset & 0xff);
      break;
  }
  return { bytes };
}

// Example usage for integrators:
// Set reporting interval to 900 seconds: { cmd: "set_interval", seconds: 900 }
// Apply +0.1 inWC offset: { cmd: "set_pressure_offset", offset: 100 }
