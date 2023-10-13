
function decodeUplink(input) {
  var res = Decoder(input.bytes, input.fPort);
  if (res.error) {
    return {
      errors: [res.error],
    };
  }
  return {
    data: res,
  };
}

/**
 * Payload Decoder for The Things Network
 * 
 * Copyright 2021 Milesight IoT
 * 
 * @product AM104 / AM107
 */
function Decoder(bytes, port) {
  var decoded = {};

  for (var i = 0; i < bytes.length;) {
      var channel_id = bytes[i++];
      var channel_type = bytes[i++];
      // BATTERY
      if (channel_id === 0x01 && channel_type === 0x75) {
          decoded.battery = bytes[i];
          i += 1;
      }
      // TEMPERATURE
      else if (channel_id === 0x03 && channel_type === 0x67) {
          // ℃
          decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
          i += 2;

          // ℉
          // decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10 * 1.8 + 32;
          // i +=2;
      }
      // HUMIDITY
      else if (channel_id === 0x04 && channel_type === 0x68) {
          decoded.humidity = bytes[i] / 2;
          i += 1;
      }
      // PIR
      else if (channel_id === 0x05 && channel_type === 0x6A) {
          decoded.activity = readUInt16LE(bytes.slice(i, i + 2));
          i += 2;
      }
      // LIGHT
      else if (channel_id === 0x06 && channel_type === 0x65) {
          decoded.illumination = readUInt16LE(bytes.slice(i, i + 2));
          decoded.infrared_and_visible = readUInt16LE(bytes.slice(i + 2, i + 4));
          decoded.infrared = readUInt16LE(bytes.slice(i + 4, i + 6));
          i += 6;
      }
      // CO2
      else if (channel_id === 0x07 && channel_type === 0x7D) {
          decoded.co2 = readUInt16LE(bytes.slice(i, i + 2));
          i += 2;
      }
      // TVOC
      else if (channel_id === 0x08 && channel_type === 0x7D) {
          decoded.tvoc = readUInt16LE(bytes.slice(i, i + 2));
          i += 2;
      }
      // PRESSURE
      else if (channel_id === 0x09 && channel_type === 0x73) {
          decoded.pressure = readUInt16LE(bytes.slice(i, i + 2)) / 10;
          i += 2;
      } else {
          break;
      }
  }

  return decoded;
}

/* ******************************************
* bytes to number
********************************************/
function readUInt16LE(bytes) {
  var value = (bytes[1] << 8) + bytes[0];
  return value & 0xffff;
}

function readInt16LE(bytes) {
  var ref = readUInt16LE(bytes);
  return ref > 0x7fff ? ref - 0x10000 : ref;
}
