
function decodeUtf8(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i++) {
    s += String.fromCharCode(bytes[i]);
  }
  return s;
}

function bytesToFloat16(bytes) {
  const half = (bytes[0] << 8) | bytes[1];
  const exp = (half & 0x7c00) >> 10;
  const frac = half & 0x03ff;
  let val;
  if (exp === 0) {
    val = (frac / 1024) * Math.pow(2, -14);
  } else if (exp === 31) {
    val = frac ? NaN : Infinity;
  } else {
    val = (1 + frac / 1024) * Math.pow(2, exp - 15);
  }
  return half & 0x8000 ? -val : val;
}

function bytesToFloat32(bytes) {
  const dv = new DataView(new ArrayBuffer(4));
  for (let i = 0; i < 4; i++) dv.setUint8(i, bytes[i]);
  return dv.getFloat32(0, false);
}

function bytesToFloat64(bytes) {
  const dv = new DataView(new ArrayBuffer(8));
  for (let i = 0; i < 8; i++) dv.setUint8(i, bytes[i]);
  return dv.getFloat64(0, false);
}

function decodeCBOR(buf) {
  let i = 0;
  function readByte() {
    return buf[i++];
  }
  function readN(n) {
    const s = buf.slice(i, i + n);
    i += n;
    return s;
  }

  function readLength(ai) {
    if (ai < 24) return ai;
    if (ai === 24) return readByte();
    if (ai === 25) {
      const b = readN(2);
      return (b[0] << 8) | b[1];
    }
    if (ai === 26) {
      const b = readN(4);
      return (b[0] << 24) | (b[1] << 16) | (b[2] << 8) | b[3];
    }
    if (ai === 27) {
      const b = readN(8);
      return Number(
        (BigInt(b[0]) << 56n) | (BigInt(b[1]) << 48n) | (BigInt(b[2]) << 40n) | (BigInt(b[3]) << 32n) | (BigInt(b[4]) << 24n) | (BigInt(b[5]) << 16n) | (BigInt(b[6]) << 8n) | BigInt(b[7]),
      );
    }
    if (ai === 31) return -1; // indefinite
    throw new Error('Unsupported length encoding');
  }

  function parseItem() {
    const initial = readByte();
    const major = initial >> 5;
    const ai = initial & 0x1f;

    switch (major) {
      case 0:
        return readLength(ai);
      case 1: {
        const n = readLength(ai);
        return -1 - n;
      }
      case 2: {
        const len = readLength(ai);
        return readN(len);
      }
      case 3: {
        const len = readLength(ai);
        return decodeUtf8(readN(len));
      }
      case 4: {
        const len = readLength(ai);
        const arr = [];
        if (len === -1) {
          while (buf[i] !== 0xff) arr.push(parseItem());
          i++;
        } else {
          for (let k = 0; k < len; k++) arr.push(parseItem());
        }
        return arr;
      }
      case 5: {
        const len = readLength(ai);
        const obj = {};
        if (len === -1) {
          while (buf[i] !== 0xff) {
            obj[parseItem()] = parseItem();
          }
          i++;
        } else {
          for (let k = 0; k < len; k++) obj[parseItem()] = parseItem();
        }
        return obj;
      }
      case 7:
        if (ai === 20) return false;
        if (ai === 21) return true;
        if (ai === 22) return null;
        if (ai === 23) return undefined;
        if (ai === 25) return bytesToFloat16(readN(2));
        if (ai === 26) return bytesToFloat32(readN(4));
        if (ai === 27) return bytesToFloat64(readN(8));
        if (ai === 31) return null;
        return ai;
      default:
        throw new Error('Unsupported major type: ' + major);
    }
  }

  return parseItem();
}

// --- mapping for your device ---
const SENSOR_MAP = {
  L: { name: 'Level(m)', transform: (v) => Number(v) },
  v: { name: 'Battery_Voltage(mv)', transform: (v) => Number(v) },
};

function mapCbor(obj) {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const out = {};
  for (const k in obj) {
    if (SENSOR_MAP[k]) {
      out[SENSOR_MAP[k].name] = SENSOR_MAP[k].transform(obj[k]);
    } else {
      out[k] = obj[k];
    }
  }
  return out;
}

// --- TTN entry point ---
function decodeUplink(input) {
  try {
    const parsed = decodeCBOR(input.bytes);
    return { data: mapCbor(parsed) };
  } catch (e) {
    return { data: {} };
  }
}
