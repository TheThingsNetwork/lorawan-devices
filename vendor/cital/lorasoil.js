
function decodeBytes(bytes) {
    var data = {};

    // temperatures can be negative, Int16Array properly decodes a signed integer
    data.tempOffBoard = new Int16Array([bytes[0] << 8 | bytes[1]])[0] / 100;
    data.waterPotOffBoard = ((bytes[2] << 8) | bytes[3]) / -100;
    data.batteryCharge = (bytes[4]);

    // only the last two numbers of the year are stored, together with the month (don't ask me why)
    // the same with day/hour and minute/second, seems like people have never heard of epoche
    var year = Math.floor((bytes[5] << 8 | bytes[6]) / 100) + 2000;
    var month = parseInt((bytes[5] << 8 | bytes[6]).toString().substring(2, 4))-1;
    // Note: AS: I added this from the TTS integration - still needed?
    if ((bytes[5] << 8 | bytes[6]) < 12) {
        month = "1";
    }
    var day = Math.floor((bytes[7] << 8 | bytes[8]) / 100);
    // following would be the same
    var hour = (bytes[7] << 8 | bytes[8] ) - day * 100;
    var minute = Math.floor((bytes[9] << 8 | bytes[10]) / 100);
    var second = (bytes[9] << 8 | bytes[10]) - minute * 100;
    
    var ts = Math.floor(new Date(year, month, day, hour, minute, second).getTime());
    
    data.lat = ((bytes[11] << 24 | bytes[12] << 16 | bytes[13] << 8 | bytes[14]) / 100000);
    data.long = ((bytes[15] << 24 | bytes[16] << 16 | bytes[17] << 8 | bytes[18]) / 100000);
    data.firmware = parseFloat(bytes[19] + '.' + bytes[20]);

    if (bytes.length >= 22) {
        data.tempOnBoard = new Int16Array([bytes[21] << 8 | bytes[22]])[0] / 100;
        data.airPressOnBoard = (bytes[23] << 8 | bytes[24])
        data.humidityOnBoard = bytes[25];
    }
    // Add current TS as tbProcessTs for Debugging
    data.tbProcessTs = Math.round((new Date()).getTime());
    return {
        "ts": ts, 
        "values": data
    };
}

function decodeUplink(input) {
  switch (input.fPort) {
    case 1:
      return {
        // Decoded data
        var decoded = decodeBytes(input.bytes);
        data: {
          temperature: decoded.tempOffBoard,
          moisture: decoded.waterPotOffBoard,
        },
      };
    default:
      return {
        errors: ['unknown FPort'],
      };
  }
}

function encodeDownlink(input) {
  var i = colors.indexOf(input.data.led);
  if (i === -1) {
    return {
      errors: ['invalid LED color'],
    };
  }
  return {
    // LoRaWAN FPort used for the downlink message
    fPort: 2,
    // Encoded bytes
    bytes: [i],
  };
}

function decodeDownlink(input) {
  switch (input.fPort) {
    case 2:
      return {
        // Decoded downlink (must be symmetric with encodeDownlink)
        data: {
          led: colors[input.bytes[0]],
        },
      };
    default:
      return {
        errors: ['invalid FPort'],
      };
  }
}
