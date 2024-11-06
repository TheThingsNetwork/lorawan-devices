function uint16(value1, value2) {
  return (value1 << 8) + value2;
}

function uint24(value1, value2, value3) {
  return (value1 << 16) + (value2 << 8) + value3;
}

function uint16float(value1, value2, multiplier) {
  var value = uint16(value1, value2);

  if (value & 0x8000)
    return (value & 0x7FFF) / -multiplier;

  return value/multiplier;
}

// ID 4B - "82000284"
// VERHW 1B - "6C" (decimal 108, meaning A3 HW108)
// VERSW 1B - "4E" (decimal 78, meaning firmware version 78)
// TIMESTAMP 4B - "00012E1C" (decimal 77340 sec)
// TEMPERATURE 2B - “0A1B" , value 25.87°C, DI16 encoded with 2 digits **
// PRESSURE 2B - "88BC" offset encoded (decimal value 35004 + 65535 = 100539 Pa) ***
// HUMIDITY 1B - "66" multiplied by 2, 0.5RH resolution, decimal 102 / 2 = 51RH
// VOC 3B - "013129" (decimal 78121ohm, or 78KO)
// NOISE 1B - "8D" like humidity, multiplied by 2, 0.5dBA resolution, decimal 141/2 = 70.5dBA
// CO2 2B - "026A" (decimal 618ppm CO2)
// FORMALDEHYDE 2B - "0053" (decimal 83ppb CH2O)
// OZONE 2B - "0014" (decimal 20ppb O3)
// PM1 2B - "0055" (decimal 85 µg/m3)
// PM2.5 2B - "006F" ( decimal 111 µg/m3)
// PM10 2B - "009C" (decimal 156 µg/m3 ))
// CRC 1B - “E2" ****
function DecodePayload(bytes) {
    if (bytes.length != 32)
        return null;

    var obj = {
        model: "A3",
        hardware_version: "HW" + bytes[4],
        firmware_version: bytes[5],
        // timestamp: bytes[6, 7, 8, 9]
        temperature: uint16float(bytes[10], bytes[11], 100),
        pressure: (uint16(bytes[12], bytes[13]) + 65535),
        humidity: (bytes[14]/2),
        gas_resistance: uint24(bytes[15], bytes[16], bytes[17]),
        sound: bytes[18]/2,
        co2: uint16(bytes[19], bytes[20]),
        ch20: uint16(bytes[21], bytes[22]),
        o3: uint16(bytes[23], bytes[24]),
        pm1: uint16(bytes[25], bytes[26]),
        pm2_5: uint16(bytes[27], bytes[28]),
        pm10: uint16(bytes[29], bytes[30]),
        // crc: bytes[31]
    };

    obj.iaq = parseInt(Math.log(obj.gas_resistance) + 0.04 * obj.humidity, 10);
    return obj;
}

function decodeUplink(input) {
    return {
        "data": DecodePayload(input.bytes)
    }
}

