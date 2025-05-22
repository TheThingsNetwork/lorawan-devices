function decodeUplink(input) {
  const res = Decoder(input.bytes, input.fPort);
  if (res.error) {
    return { errors: [res.error] };
  }
  return { data: res };
}

function Decoder(bytes, port) {
  const readUInt8 = b => b & 0xFF;
  const readUInt16LE = b => (b[1] << 8) + b[0];
  const readUInt32LE = b => (b[3] << 24) + (b[2] << 16) + (b[1] << 8) + b[0];
  const readFloatLE = b => {
    const buf = new ArrayBuffer(4);
    const view = new DataView(buf);
    for (let i = 0; i < 4; i++) view.setUint8(i, b[i]);
    return view.getFloat32(0, true);
  };

  const head = readUInt8(bytes[0]);
  const model = readUInt8(bytes[1]);

  if (head === 11) {
    // Check-in frame
    const timestamp = readUInt32LE(bytes.slice(2, 6));
    const date = new Date(timestamp * 1000);
    const yyyy = date.getUTCFullYear();
    const mm = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const dd = date.getUTCDate().toString().padStart(2, '0');
    const verFormatted = parseInt(`${yyyy}${mm}${dd}`);

    const interval = readUInt16LE(bytes.slice(6, 8));
    const splrate = interval;
    const bat = readUInt8(bytes[8]);
    const millivolt = readUInt16LE(bytes.slice(9, 11));
    const volt = `1|${(millivolt / 1000).toFixed(3)}`;
    const freqband = readUInt8(bytes[11]);
    const subband = readUInt8(bytes[12]);

    return {
      head,
      ver: verFormatted,
      interval,
      splrate,
      bat,
      volt,
      freqband,
      subband
    };
  }

  else if (head === 12 || head === 13 || head === 14) {
    // Sensor / Hold / Event frames
    const tsmode = readUInt8(bytes[2]);
    const timestamp = readUInt32LE(bytes.slice(3, 7));
    const splfmt = readUInt8(bytes[7]);

    let raw_size = 4;
    switch (splfmt) {
      case 1: raw_size = 2; break;
      case 2: raw_size = 4; break;
      case 3: raw_size = 8; break;
      default: return { error: "Invalid sample format" };
    }

    const data = bytes.slice(8);
    const ch_count = data.length / raw_size;
    const data_size = data.length;

    let offset = 0;
    let temperature = null, humidity = null;

    if (ch_count >= 1) {
      temperature = parseFloat(readFloatLE(data.slice(offset, offset + raw_size)).toFixed(5));
      if (temperature === -9999.9) temperature = null;
      offset += raw_size;
    }

    if (ch_count >= 2) {
      humidity = parseFloat(readFloatLE(data.slice(offset, offset + raw_size)).toFixed(2));
      if (humidity === -9999.9) humidity = null;
    }

    return {
      head,
      model,
      tsmode,
      timestamp,
      splfmt,
      data_size,
      temperature,
      humidity
    };
  }

  return { error: "Unsupported head frame: " + head };
}
