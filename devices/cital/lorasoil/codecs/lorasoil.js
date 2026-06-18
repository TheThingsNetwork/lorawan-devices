function decodeBytesMeasurement(bytes) {
    var data = {};

    data.tempOffBoard = new Int16Array([bytes[0] << 8 | bytes[1]])[0] / 100;
    data.waterPotOffBoard = ((bytes[2] << 8) | bytes[3]) / -100;
    data.batteryCharge = (bytes[4]);

    var year = Math.floor((bytes[5] << 8 | bytes[6]) / 100) + 2000;
    var month = parseInt((bytes[5] << 8 | bytes[6]).toString().substring(2, 4))-1;
    if ((bytes[5] << 8 | bytes[6]) < 12) {
        month = "1";
    }
    var day = Math.floor((bytes[7] << 8 | bytes[8]) / 100);

    var hour = (bytes[7] << 8 | bytes[8] ) - day * 100;
    var minute = Math.floor((bytes[9] << 8 | bytes[10]) / 100);
    var second = (bytes[9] << 8 | bytes[10]) - minute * 100;
    
    var ts = Math.floor(new Date(Date.UTC(year, month, day, hour, minute, second)).getTime());
    
    data.lat = ((bytes[11] << 24 | bytes[12] << 16 | bytes[13] << 8 | bytes[14]) / 100000);
    data.long = ((bytes[15] << 24 | bytes[16] << 16 | bytes[17] << 8 | bytes[18]) / 100000);
    data.firmware = parseFloat(bytes[19] + '.' + bytes[20]);

    if (bytes.length >= 26) {
        data.tempOnBoard = new Int16Array([bytes[21] << 8 | bytes[22]])[0] / 100;
        data.airPressOnBoard = (bytes[23] << 8 | bytes[24])
        data.humidityOnBoard = bytes[25];
    } else {
        data.tempOnBoard = 0.0;
        data.airPressOnBoard = 0.0;
        data.humidityOnBoard = 0.0;
    }
    if (bytes.length >= 30) {
      data.resistance = (bytes[26] << 24 | bytes[27] << 16 | bytes[28] << 8 | bytes[29]);
    } else {
      data.resistance = 0.0;
    }

    return {
        "ts": ts, 
        "values": data
    };
}

function decodeUplink(input) {
  switch (input.fPort) {
    case 152:
      var decoded = decodeBytesMeasurement(input.bytes);
      return {
        // Decoded data
        data: {
          time_stamp: decoded.ts,
          soil_temperature: decoded.values.tempOffBoard,
          soil_moisture: decoded.values.waterPotOffBoard,
          soil_resistance: decoded.values.resistance,
          ambient_temperature: decoded.values.tempOnBoard,
          ambient_humidity: decoded.values.humidityOnBoard,
          ambient_pressure: decoded.values.airPressOnBoard,
          latitude: decoded.values.lat,
          longitude: decoded.values.long,
          battery: decoded.values.batteryCharge
        },
      };
    default:
      return {
        errors: ['unknown FPort'],
      };
  }
}
