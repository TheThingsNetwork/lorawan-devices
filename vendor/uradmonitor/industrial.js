function uint16(value1, value2) {
  return (value1 << 8) + value2;
}

function uint24(value1, value2, value3) {
  return (value1 << 16) + (value2 << 8) + value3;
}

function uint24float(value1, value2, value3, multiplier) {
  var value = uint24(value1, value2, value3);

  if (value & 0x800000)
    return (value & 0x7FFFFF) / -multiplier;

  return value/multiplier;
}

function uint16float(value1, value2, multiplier) {
  var value = uint16(value1, value2);

  if (value & 0x8000)
    return (value & 0x7FFF) / -multiplier;

  return value/multiplier;
}

function decodeOrganicSensor(type, value1, value2, value3) {
  var lookup = {
    0x2A: 'o3',
    0x2B: 'so2',
    0x2C: 'no2',
    0x04: 'co',
    0x03: 'h2s',
    0x02: 'nh3',
    0x31: 'cl2',
  };

  var t = lookup[type];
  if (!t)
    return null;

  return [t, uint24float(value1, value2, value3, 1000)];
}

// ID 4B - "1400008E"
// VERHW 1B - "06" (decimal 6, meaning INDUSTRIAL HW106)
// VERSW 1B - "4E" (decimal 78, meaning firmware version 78)
// TIMESTAMP 4B - "00001C20" (decimal 7200 sec)
// LATITUDE 3B - “000000” (decimal 0, only on devices with NMEA GPS on pin RX6), DI24 encoded with 4 digits *
// LONGITUDE 3B - “000000” (decimal 0, only on devices with NMEA GPS on pin RX6), DI24 encoded with 4 digits *
// ALTITUDE 2B - “0000” (decimal 0, only on devices with NMEA GPS on pin RX6), DI16 encoded no digits **
// SPEED 2B - “0000” (decimal 0, only on devices with NMEA GPS on pin RX6), multiplied by 10. Divide by 10.
// TEMPERATURE 2B - “0732" , value 18.42°C, DI16 encoded with 2 digits **
// PRESSURE 2B - "8797" offset encoded ***
// HUMIDITY 1B - "82" multiplied by 2, 0.5RH resolution, decimal 130 / 2 = 65RH
// VOC 3B - "031276" (decimal 201334ohms, or 201KO)
// NOISE 1B - "A3" like humidity, multiplied by 2, 0.5dBA resolution, decimal 163/2 = 81dBA
// SENSORGASID1 1B - "2A" (Ozone: O3=0x2A, NO2=0x2C, SO2=0x2B, CO=0x04, H2S=0x03, NH3=0x02, CL2=0x31)
// SENSORGASCONC1 3B - "00028D" DI24 encoded, 3 digits *, 0.653ppm Ozone
// SENSORGASID2 1B - "2C" (Nitrogen Dioxide: O3=0x2A,NO2=0x2C, SO2=0x2B, CO=0x04, H2S=0x03, NH3=0x02, CL2=0x31)
// SENSORGASCONC2 3B - "00000D" DI24 encoded, 3 digits *, 0.013ppm NO2
// SENSORGASID3 1B - "2B" (Sulphur Dioxide: O3=0x2A, NO2=0x2C, SO2=0x2B, CO=0x04, H2S=0x03, NH3=0x02, CL2=0x31)
// SENSORGASCONC3 3B - “00000A" DI24 encoded, 3 digits *, 0.01ppm SO2
// SENSORGASID4 1B - "04" (Carbon Monoxide: O3=0x2A,NO2=0x2C, SO2=0x2B, CO=0x04, H2S=0x03, NH3=0x02, CL2=0x31)
// SENSORGASCONC4 3B - "000000" DI24 encoded, 3 digits *, 0ppm CO
// PM1 1B - "02" (decimal 2 µg/m3, difference from PM2.5, final value PM2.5=7 - 2= 5 µg/m3 )
// PM2.5 2B - "0007" ( decimal 7 µg/m3)
// PM10 1B - "00" (decimal 0 µg/m3, difference from PM2.5, final value PM2.5=7 + 2= 7 µg/m3 ))
// CRC 1B - “45" ****
function DecodePayload(bytes) {
    if (bytes.length != 50)
        return null;

    var obj = {
        model: "Industrial",
        hardware_version: "HW" + bytes[4],
        firmware_version: bytes[5],
        // timestamp: bytes[6, 7, 8, 9]
        // latitude: bytes[10, 11, 12]
        // longitude: bytes[13, 14, 15]
        // altitude: bytes[16, 17]
        // speed: bytes[18, 19]
        temperature: uint16float(bytes[20], bytes[21], 100),
        pressure: (uint16(bytes[22], bytes[23]) + 65535),
        humidity: (bytes[24]/2),
        gas_resistance: uint24(bytes[25], bytes[26], bytes[27]),
        sound: bytes[28]/2,
    };

    var r;
    r = decodeOrganicSensor(bytes[29], bytes[30], bytes[31], bytes[32]);
    if (r)
      obj[r[0]] = r[1];
    r = decodeOrganicSensor(bytes[33], bytes[34], bytes[35], bytes[36]);
    if (r)
      obj[r[0]] = r[1];
    r = decodeOrganicSensor(bytes[37], bytes[38], bytes[39], bytes[40]);
    if (r)
      obj[r[0]] = r[1];
    r = decodeOrganicSensor(bytes[41], bytes[42], bytes[43], bytes[44]);
    if (r)
      obj[r[0]] = r[1];

    var pm1 = bytes[45];
    var pm2_5 = uint16(bytes[46], bytes[47]);
    var pm10 = bytes[48];
    pm1 = pm2_5 - pm1;
    pm10 = pm2_5 + pm10;

    obj.pm1 = pm1;
    obj.pm2_5 = pm2_5;
    obj.pm10 = pm10;

    obj.iaq = parseInt(Math.log(obj.gas_resistance) + 0.04 * obj.humidity, 10);
    return obj;
}

function decodeUplink(input) {
    return {
        "data": DecodePayload(input.bytes)
    }
}

function hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

//const payload = "1400008E064E00001C20000000000000000000000732879782031276A32A00028D2C00000D2B00000A040000000200070045";
//console.log(DecodePayload(hexToBytes(payload)));

