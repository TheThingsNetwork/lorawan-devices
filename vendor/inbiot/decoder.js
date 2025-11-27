// Chirpstack v4
function decodeUplink(input) {
  var decoded = InbiotDeviceDecode(input.bytes);
  return { data: decoded };
}

// Chirpstack v3 and Milesight
function Decode(fPort, bytes) {
  return InbiotDeviceDecode(bytes);
}

// The Things Network
function Decoder(bytes, port) {
  return InbiotDeviceDecode(bytes);
}

function InbiotDeviceDecode(bytes) {
  var decoded = {};
  switch (bytes[0]) {
    case 0:
      // TIME TO SEND
      decoded.timeToSend = bytes[1];
      // VENTILATION TYPE
      decoded.ventilation = bytes[2];
      // LED CONFIGURATION
      decoded.ledStatus = !!bytes[3];
      // USE WIFI INSTEAD
      decoded.useWifi = !!bytes[4];
      // LORAWAN REGION
      decoded.lorawanRegion = getLoRaWANRegion(bytes[5]);
      // LORAWAN CHANNELMASK
      decoded.lorawanChannelMask = bytes[6];
      // LED CONFIGURATION
      decoded.ledConfiguration = bytes[7];
      // TOUCH ENABLE
      decoded.touchEnable = !!bytes[8];
      break;
    case 1:
      // MICA TYPE
      decoded.type = customTextDecoder(bytes, 27, 31);
      if (decoded.type === "\u0000\u0000\u0000\u0000") {
        decoded.type = "NULL";
      }
      var typeProperties = {
        MINI: true,
        MICA: true,
        PLUS: true,
        WELL: true,
        NULL: true,
      };
      if (typeProperties[decoded.type]) {
        // TEMPERATURE
        decoded.temperature = getUint16(bytes, 1, 2) / 10.0;
        // HUMIDITY
        decoded.humidity = getUint16(bytes, 3, 4) / 10.0;
        // CO2
        decoded.co2 = getUint16(bytes, 5, 6);

        if (decoded.type !== "MINI") {
          // TVOC
          decoded.tvoc = getUint16(bytes, 9, 10);
          // PM2.5
          decoded.pm2_5 = getUint16(bytes, 13, 14);
          // PM10
          decoded.pm10 = getUint16(bytes, 17, 18);
        }
        if (["PLUS", "WELL", "NULL"].indexOf(decoded.type) > -1) {
          // CH2O
          decoded.ch2o = getUint16(bytes, 7, 8);
          // PM1.0
          decoded.pm1_0 = getUint16(bytes, 11, 12);
          // PM4
          decoded.pm4 = getUint16(bytes, 15, 16);
        }
        if (["WELL", "NULL"].indexOf(decoded.type) > -1) {
          // O3
          decoded.o3 = getUint16(bytes, 19, 20);
          if (decoded.o3 === 0xffff) {
            decoded.o3 = "Preheating";
          }
          // NO2
          decoded.no2 = getUint16(bytes, 21, 22);
          if (decoded.no2 === 0xffff) {
            decoded.no2 = "Preheating";
          }
          // CO
          decoded.co = getUint16(bytes, 23, 24);
          if (decoded.co !== 0xffff) {
            decoded.co /= 10.0;
          } else {
            decoded.co = "Preheating";
          }
        }
        // VENTILATION INDEX
        decoded.vIndex = bytes[32];
        // THERMAL INDEX
        decoded.tIndex = bytes[33];
        // VIRUS INDEX
        decoded.virusIndex = bytes[34];
        // IAQ INDEX
        decoded.iaqIndex = bytes[35];
        // MOLD PERSISTENCE INDEX
        decoded.moldIndex = bytes[36];
        if (decoded.moldIndex === 0xff) {
          decoded.moldIndex = "Calculating";
        }
        // NOISE
        if (bytes[37]) {
          decoded.dB = bytes[37] === 0xff ? "Preheating" : bytes[37];
        }
        // MESSAGE COUNTER
        decoded.counter = getUint16(bytes, 25, 26);
      }
      break;
    case 2:
      // FIRMWARE VERSION
      decoded.fwVersion = getVersion(bytes, 1);
      // MODEL
      decoded.model = customTextDecoder(bytes, 4, 21);
      // MICA TYPE
      decoded.micaType = customTextDecoder(bytes, 21, 30);
      // MAC ADDRESS
      decoded.mac = getMac(bytes, 30);
      // RESET REASON
      decoded.resetReason = getResetReason(bytes[42]);

      // ----- ONLY MODBUS CONFIGURATION -----

      // MODBUS ADDRESS
      decoded.modbusAddress = bytes[36];
      // MODBUS PARITY
      decoded.modbusParity = bytes[37];
      // MODBUS BAUD RATE
      decoded.modbusBaudRate = getUint32(bytes, 38);
      break;
    default:
  }
  return decoded;
}

function customTextDecoder(bytes, start, end) {
  var result = "";
  for (var i = start; i < end; i++) {
    if (bytes[i] === 0x00) {
      break;
    }
    result += String.fromCharCode(bytes[i]);
  }
  return result;
}

function getUint16(bytes, first, second) {
  return (bytes[first] << 8) | bytes[second];
}

function getUint32(bytes, start) {
  return (
    (bytes[start] << 24) |
    (bytes[start + 1] << 16) |
    (bytes[start + 2] << 8) |
    bytes[start + 3]
  );
}
function padStartCustom(text, targetLength, padChar) {
  text = String(text);
  while (text.length < targetLength) {
    text = padChar + text;
  }
  return text;
}

function getMac(bytes, start) {
  var macBytes = bytes.slice(start, start + 6);
  var macString = "";
  for (var i = 0; i < macBytes.length; i++) {
    var hex = padStartCustom(macBytes[i].toString(16), 2, "0");
    macString += hex;
    if (i < macBytes.length - 1) {
      macString += ":";
    }
  }
  return macString.toUpperCase();
}

function getVersion(bytes, start) {
  if (bytes[start + 1] !== 0x2e) {
    var minor = bytes[start + 2];
    return bytes[start] + "." + minor;
  } else {
    return customTextDecoder(bytes, start, 4);
  }
}

function getLoRaWANRegion(region) {
  var regions = {
    0: "AS923",
    10: "AS923-JP",
    1: "AU915",
    2: "CN470",
    3: "CN779",
    4: "EU433",
    5: "EU868",
    6: "KR920",
    7: "IN865",
    8: "US915",
    9: "RU864",
  };
  return regions[region] || "UNKNOWN";
}

function getResetReason(reason) {
  var reasons = {
    0: "0 Reset reason cannot be determined",
    1: "1 Reset due to power-on event",
    2: "2 Reset by external pin",
    3: "3 Software reset via esp_restart",
    4: "4 Software reset due to exception/panic",
    5: "5 Reset due to interrupt watchdog",
    6: "6 Reset due to task watchdog",
    7: "7 Reset due to other watchdogs",
    8: "8 Reset after exiting deep sleep mode",
    9: "9 Brownout reset",
    10: "10 Reset over SDIO",
  };
  return reasons[reason] || "UNKNOWN (" + reason + ")";
}
