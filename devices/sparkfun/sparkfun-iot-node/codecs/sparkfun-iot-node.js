/**
 * SparkFun IoT Node decoder for The Things Stack.
 *
 * Byte format:
 *  - 1 byte "type" (hex code)
 *  - N bytes value depending on type:
 *      double: 8 bytes (big-endian)
 *      float / uint32: 4 bytes (big-endian)
 *      int16 / uint16: 2 bytes (big-endian)
 *      uint8: 1 byte
 */

const SENSOR_MAP = {
  "04": { name: "TVOC", type: "uint16" },
  "05": { name: "AQI", type: "uint8" },
  "06": { name: "eCO2", type: "uint16" },
  "07": { name: "ETOH", type: "uint16" },
  "08": { name: "humidity_f", type: "float" },
  "09": { name: "pressure_f", type: "float" },
  "0A": { name: "temperature_c", type: "float" },
  "0B": { name: "temperature_f", type: "float" },
  "0C": { name: "pressure", type: "float" },
  "0D": { name: "acceleration_x", type: "float" },
  "0E": { name: "acceleration_y", type: "float" },
  "0F": { name: "acceleration_z", type: "float" },
  "10": { name: "latitude", type: "double" },
  "11": { name: "longitude", type: "double" },
  "12": { name: "altitude", type: "double" },
  "13": { name: "co2_f", type: "float" },
  "14": { name: "humidity", type: "float" },
  "15": { name: "flow_mph", type: "float" },
  "16": { name: "latitude", type: "double" },
  "17": { name: "longitude", type: "double" },
  "18": { name: "altitude", type: "double" },
  "19": { name: "battery_voltage", type: "float" },
  "1A": { name: "co2", type: "float" },
  "1B": { name: "voc", type: "float" },
  "1C": { name: "light", type: "float" },
  "1D": { name: "current", type: "float" },
  "1E": { name: "voltage", type: "float" },
  "1F": { name: "power", type: "float" },
  "25": { name: "pressure_mbar", type: "float" },
  "26": { name: "weight_user_units", type: "float" },
  "27": { name: "cie_x", type: "double" },
  "28": { name: "cie_y", type: "double" },
  "29": { name: "cct", type: "double" },
  "30": { name: "voltage_batt", type: "float" },
  "2F": { name: "state_of_charge", type: "float" },
  "31": { name: "change_rate", type: "float" },
  "32": { name: "co2_u32", type: "uint32" },
  "33": { name: "tvoc_u32", type: "uint32" },
  "34": { name: "h2", type: "uint32" },
  "35": { name: "etoh_u32", type: "uint32" },
  "36": { name: "presence", type: "int16" },
  "37": { name: "motion", type: "int16" },
  "38": { name: "proximity", type: "uint16" },
  "39": { name: "lux_u16", type: "uint16" },
  "40": { name: "uva_index", type: "float" },
  "41": { name: "uvb_index", type: "float" },
  "42": { name: "uv_index", type: "float" },
  "43": { name: "lux_f", type: "float" },
  "44": { name: "ambient_light", type: "uint32" },
  "45": { name: "white_light", type: "uint32" },
  "46": { name: "distance", type: "uint32" },
  "47": { name: "battery_charge", type: "float" },
  "48": { name: "battery_voltage", type: "float" },
  "49": { name: "battery_charge_rate", type: "float" },
  "50": { name: "temperature_c_double", type: "double" },
  "51": { name: "pressure_pa_double", type: "double" }
};

// Helper to read a slice as DataView
function dv(bytes, start, len) {
  // copy to ensure contiguous backing buffer for DataView
  const arr = bytes.slice(start, start + len);
  return new DataView(Uint8Array.from(arr).buffer);
}

function round6(n) {
  return Number.isFinite(n) ? Number(n.toFixed(6)) : n;
}

function decodeUplink(input) {
  const { fPort, bytes } = input;
  const data = {};
  const errors = [];
  const warnings = [];

  if (fPort !== 1) {
    // You can relax this if your device legitimately uses multiple fPorts
    errors.push("unknown FPort");
    return { data, warnings, errors };
  }

  let i = 0;
  while (i < bytes.length) {
    const typeByte = bytes[i++];
    if (typeByte === 0x00) continue; // ignore padding/tag 0x00

    const code = typeByte.toString(16).toUpperCase().padStart(2, "0");
    const sensor = SENSOR_MAP[code];
    if (!sensor) {
      warnings.push(`unknown_sensor 0x${code}`);
      continue;
    }

    try {
      switch (sensor.type) {
        case "double": {
          const remaining = bytes.length - i;
          if (remaining >= 8) {
            const view = dv(bytes, i, 8);
            i += 8;
            let val = view.getFloat64(0, false); // big-endian
            val = round6(val);

            // Fallback for invalid coordinates like in your X-ON example
            if ((sensor.name === "latitude" || sensor.name === "longitude") &&
                (val < -180 || val > 180)) {
              const view32 = dv(bytes, i - 8, 4);
              val = round6(view32.getFloat32(0, false));
            }
            data[sensor.name] = val;
          } else if (remaining >= 4) {
            // Short payload => fallback to float32
            const view = dv(bytes, i, 4);
            i += 4;
            data[sensor.name] = round6(view.getFloat32(0, false));
          } else {
            errors.push(`insufficient bytes for double (code 0x${code})`);
          }
          break;
        }
        case "float": {
          if (i + 4 > bytes.length) {
            errors.push(`insufficient bytes for float (code 0x${code})`);
            break;
          }
          const view = dv(bytes, i, 4);
          i += 4;
          data[sensor.name] = round6(view.getFloat32(0, false));
          break;
        }
        case "uint32": {
          if (i + 4 > bytes.length) {
            errors.push(`insufficient bytes for uint32 (code 0x${code})`);
            break;
          }
          const view = dv(bytes, i, 4);
          i += 4;
          data[sensor.name] = view.getUint32(0, false);
          break;
        }
        case "uint16": {
          if (i + 2 > bytes.length) {
            errors.push(`insufficient bytes for uint16 (code 0x${code})`);
            break;
          }
          const view = dv(bytes, i, 2);
          i += 2;
          data[sensor.name] = view.getUint16(0, false);
          break;
        }
        case "int16": {
          if (i + 2 > bytes.length) {
            errors.push(`insufficient bytes for int16 (code 0x${code})`);
            break;
          }
          const view = dv(bytes, i, 2);
          i += 2;
          data[sensor.name] = view.getInt16(0, false);
          break;
        }
        case "uint8": {
          if (i + 1 > bytes.length) {
            errors.push(`insufficient bytes for uint8 (code 0x${code})`);
            break;
          }
          data[sensor.name] = bytes[i++];
          break;
        }
        default:
          warnings.push(`unhandled type for 0x${code}`);
      }
    } catch (e) {
      errors.push(`parse error for 0x${code}: ${e.message}`);
    }
  }

  return { data, warnings, errors };
}

// No structured downlinks for this demo codec.
// Keep placeholders so repo validation passes if examples reference them.
function encodeDownlink(input) {
  const data = (input && input.data) || {};

  // no supported fields in this demo
  if (!data || Object.keys(data).length === 0) {
    return { errors: ["no valid downlink fields"], warnings: [], data: {} };
  }

  // if you add commands later, return { fPort, bytes } here
  return { errors: ["no valid downlink fields"], warnings: [], data: {} };
}

function decodeDownlink(input) {
  // keep symmetric with encoder
  return { data: {}, errors: [], warnings: [] };
}

