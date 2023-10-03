'use strict';

function decodeUplink(payload) {
  payload = TTNfrom(payload);
  var uplinkId = payload.substring(0, 2);
  var content;

  switch (uplinkId.toUpperCase()) {
    case '01':
      content = parseTimeSync(payload.trim());
      break;

    case '04':
      content = parseTER(payload.trim());
      break;

    case '09':
      content = parseMetering(payload.trim());
      break;

    case '10':
      content = parseDigitalData(payload.trim());
      break;

    case '12':
      content = parseVOC(payload.trim(), true); //true is for new sensor

      break;

    case '13':
      content = parseCo2(payload.trim(), true); //true is for new sensor

      break;

    case '0A':
      content = parseIO(payload.trim());
      break;

    case '0B':
      content = parseReportData(payload.trim());
      break;

    case '0C':
      content = parseVOC(payload.trim(), false); //false is for new sensor

      break;

    case '0D':
      content = parseAnalog(payload.trim());
      break;

    case '0E':
      content = parseCo2(payload.trim(), false); //false is for new sensor

      break;

    default:
      content = null;
      break;
  }
  return TTNto(content);
}

function TTNfrom(TTNpayload) {
  var obj;

  if (typeof TTNpayload === 'string') {
    obj = JSON.parse(TTNpayload);
  } else {
    obj = JSON.parse(JSON.stringify(TTNpayload));
  }

  var fPort = obj.fPort;
  var payload = '';

  for (var i = 0; i < obj.bytes.length; i++) {
    payload += parseInt(obj.bytes[i], 10).toString(16).padStart(2, '0');
  }

  return payload;
}

function TTNto(content) {
  var TTNcontent = {};

  if (content !== null) {
    for (var i = 0; i < content.length; i++) {
      TTNcontent[content[i].variable] = content[i].value;
    }

    return {
      data: TTNcontent,
    };
  } else {
    return {
      data: content,
      warnings: [],
      errors: ['Error on decoding payload'],
    };
  }
}

function parseTimeSync(payload) {
  const uplinkId = payload.substring(0, 2);
  if (uplinkId.toUpperCase() === '01') {
    const syncID = {
      variable: 'syncID',
      value: payload.substring(2, 10)
    };
    const syncVersion = {
      variable: 'syncVersion',
      value: payload.substring(10, 12) + "." + payload.substring(12, 14) + "." + payload.substring(14, 16)
    };
    const applicationType = {
      variable: 'applicationType',
      value: payload.substring(16, 20)
    };
    const rfu = {
      variable: 'rfu',
      value: payload.substring(20)
    };

    return [
      syncID,
      syncVersion,
      applicationType,
      rfu
    ];
  } else {
    return null;
  }
}

function parseDigitalData(payload) {
  var uplinkId = payload.substring(0, 2);

  if (uplinkId.toUpperCase() === '10') {
    var m = [];
    var payloadToByteArray = hexStringToByteArray(payload);
    var type = payloadToByteArray[1];
    var numberOfBytes = 2;

    switch (type) {
      case 0x00:
        numberOfBytes = 2;
        break;

      case 0x01:
        numberOfBytes = 6;
        break;

      case 0x02:
        numberOfBytes = 6;
        break;
    }

    var count = 0;

    for (var i = 2; count <= 16 && i + numberOfBytes - 1 < payloadToByteArray.length; i += numberOfBytes) {
      switch (type) {
        case 0x00:
          count++;
          var measure1 = {
            variable: 'measure',
            value: parseFloat(Number(count).toFixed()),
          };
          var counter1 = {
            variable: 'counter',
            value: parseFloat(Number(((payloadToByteArray[i + 1] & 0xff) << 8) + payloadToByteArray[i]).toFixed()),
          };
          m.push(measure1, counter1);
          break;

        case 0x01:
          count++;
          var detection1 = payloadToByteArray.slice(i, i + numberOfBytes);
          var measure2 = {
            variable: 'measure',
            value: parseFloat(Number(count).toFixed()),
          };
          var date1 = {
            variable: 'date',
            value: parseDateByte(detection1.slice(0, 4)),
          };
          var frequency = {
            variable: 'frequency',
            value: parseFloat(Number(((detection1[4] & 0x000000ff) + ((detection1[5] << 8) & 0x0000ff00)) / 10.0).toFixed(2)),
            unit: 'Hz',
          };
          m.push(measure2, date1, frequency);
          break;

        case 0x02:
          count++;
          var detection2 = payloadToByteArray.slice(i, i + numberOfBytes);
          var measure3 = {
            variable: 'measure',
            value: parseFloat(Number(count).toFixed()),
          };
          var date2 = {
            variable: 'date',
            value: parseDateByte(detection2.slice(0, 4)),
          };
          var counter2 = {
            variable: 'counter',
            value: parseFloat(Number(detection2[4] & (0x000000ff + ((detection2[5] << 8) & 0x0000ff00))).toFixed()),
          };
          m.push(measure3, date2, counter2);
          break;
      }
    }

    return m;
  } else {
    return null;
  }
}

function parseMetering(payload) {
  var uplinkId = payload.substring(0, 2);

  if (uplinkId.toUpperCase() === '09') {
    var date = {
      variable: 'date',
      value: parseDate(payload.substring(2, 10)),
    };
    var activeEnergy = {
      variable: 'activeEnergy',
      value: parseFloat(Number(parseSignedInt(payload.substring(10, 18))).toFixed()),
      unit: 'Wh',
    };
    var reactiveEnergy = {
      variable: 'reactiveEnergy',
      value: parseFloat(Number(parseSignedInt(payload.substring(18, 26))).toFixed()),
      unit: 'VARh',
    };
    var apparentEnergy = {
      variable: 'apparentEnergy',
      value: parseFloat(Number(parseSignedInt(payload.substring(26, 34))).toFixed()),
      unit: 'VAh',
    };

    if (payload.length <= 42) {
      var activation = {
        variable: 'activation',
        value: parseFloat(Number(parseUnsignedInt(payload.substring(34, 42))).toFixed()),
        unit: 's',
      };
      return [date, activeEnergy, reactiveEnergy, apparentEnergy, activation];
    } else {
      var activePower = {
        variable: 'activePower',
        value: parseFloat(Number(parseSignedShort(payload.substring(34, 38))).toFixed()),
        unit: 'W',
      };
      var reactivePower = {
        variable: 'reactivePower',
        value: parseFloat(Number(parseSignedShort(payload.substring(38, 42))).toFixed()),
        unit: 'VAR',
      };
      var apparentPower = {
        variable: 'apparentPower',
        value: parseFloat(Number(parseSignedShort(payload.substring(42, 46))).toFixed()),
        unit: 'VA',
      };
      var voltage = {
        variable: 'voltage',
        value: parseFloat(Number(parseUnsignedShort(payload.substring(46, 50))).toFixed()),
        unit: 'dV RMS',
      };
      var current = {
        variable: 'current',
        value: parseFloat(Number(parseUnsignedShort(payload.substring(50, 54))).toFixed()),
        unit: 'mA RMS',
      };
      var period = {
        variable: 'period',
        value: parseFloat(Number(parseUnsignedShort(payload.substring(54, 58))).toFixed()),
        unit: 'micro s',
      };
      var frequency = {
        variable: 'frequency',
        value: parseFloat(Number(1 / (parseUnsignedShort(payload.substring(54, 58)) / 1000000)).toFixed(2)),
        unit: 'Hz',
      };
      var activation = {
        variable: 'activation',
        value: parseFloat(Number(parseUnsignedInt(payload.substring(58, 66))).toFixed()),
        unit: 's',
      };
      return [date, activeEnergy, reactiveEnergy, apparentEnergy, activePower, reactivePower, apparentPower, voltage, current, period, frequency, activation];
    }
  } else {
    return null;
  }
}

function parseIO(payload) {
  var uplinkId = payload.substring(0, 2);

  if (uplinkId.toUpperCase() === '0A') {
    var date = {
      variable: 'date',
      value: parseDate(payload.substring(2, 10)),
    };
    var firstByte = [];
    var secondByte = [];
    var thirdByte = [];
    var fourthByte = [];
    var k = 0;

    for (var i = 0; i < 3; i++) {
      firstByte[i] = parseInt(payload.substring(k + 10, k + 10 + 2), 16);
      secondByte[i] = parseInt(payload.substring(k + 10 + 2, k + 10 + 4), 16);
      thirdByte[i] = parseInt(payload.substring(k + 10 + 4, k + 10 + 6), 16);
      fourthByte[i] = parseInt(payload.substring(k + 10 + 6, k + 10 + 8), 16);
      k = k + 8;
    }

    var inputStatus8_1 = {
      variable: 'inputStatus8_1',
      value: parseFloat(firstByte[0].toString(2)),
    };
    var inputStatus9_16 = {
      variable: 'inputStatus9_16',
      value: parseFloat(secondByte[0].toString(2)),
    };
    var inputStatus17_24 = {
      variable: 'inputStatus17_24',
      value: parseFloat(thirdByte[0].toString(2)),
    };
    var inputStatus25_32 = {
      variable: 'inputStatus25_32',
      value: parseFloat(fourthByte[0].toString(2)),
    };
    var outputStatus8_1 = {
      variable: 'outputStatus8_1',
      value: parseFloat(firstByte[1].toString(2)),
    };
    var outputStatus9_16 = {
      variable: 'outputStatus9_16',
      value: parseFloat(secondByte[1].toString(2)),
    };
    var outputStatus17_24 = {
      variable: 'outputStatus17_24',
      value: parseFloat(thirdByte[1].toString(2)),
    };
    var outputStatus25_32 = {
      variable: 'outputStatus25_32',
      value: parseFloat(fourthByte[1].toString(2)),
    };
    var inputTrigger8_1 = {
      variable: 'inputTrigger8_1',
      value: parseFloat(firstByte[2].toString(2)),
    };
    var inputTrigger9_16 = {
      variable: 'inputTrigger9_16',
      value: parseFloat(secondByte[2].toString(2)),
    };
    var inputTrigger17_24 = {
      variable: 'inputTrigger17_24',
      value: parseFloat(thirdByte[2].toString(2)),
    };
    var inputTrigger25_32 = {
      variable: 'inputTrigger25_32',
      value: parseFloat(fourthByte[2].toString(2)),
    };
    return [
      date,
      inputStatus8_1,
      inputStatus9_16,
      inputStatus17_24,
      inputStatus25_32,
      outputStatus8_1,
      outputStatus9_16,
      outputStatus17_24,
      outputStatus25_32,
      inputTrigger8_1,
      inputTrigger9_16,
      inputTrigger17_24,
      inputTrigger25_32,
    ];
  } else {
    return null;
  }
}

function parseDate(payload) {
  var date = new Date();
  var binary = Number(parseInt(reverseBytes(payload), 16))
    .toString(2)
    .padStart(32, '0');
  var year = parseInt(binary.substring(0, 7), 2) + 2000;
  var month = parseInt(binary.substring(7, 11), 2);
  var day = parseInt(binary.substring(11, 16), 2);
  var hour = parseInt(binary.substring(16, 21), 2);
  var minute = parseInt(binary.substring(21, 27), 2);
  var second = parseInt(binary.substring(27, 32), 2) * 2;
  date = new Date(year, month - 1, day, hour, minute, second, 0).toLocaleString();
  return date;
}

function parseSignedInt(bytes) {
  bytes = reverseBytes(bytes);
  var rno = hexStringToByteArray(bytes);
  var n = 0;

  if (rno.length === 4) {
    n = ((rno[0] << 24) & 0xff000000) | ((rno[1] << 16) & 0x00ff0000) | ((rno[2] << 8) & 0x0000ff00) | ((rno[3] << 0) & 0x000000ff);
  }

  return n;
}

function parseUnsignedInt(bytes) {
  bytes = reverseBytes(bytes);
  var n = parseInt(bytes, 16);
  return n;
}

function parseSignedShort(bytes) {
  bytes = reverseBytes(bytes);
  var rno = hexStringToByteArray(bytes);
  var n = 0;

  if (rno.length === 2) {
    var n = (((rno[0] << 8) | rno[1]) << 16) >> 16;
  }

  return n;
}

function parseUnsignedShort(bytes) {
  bytes = reverseBytes(bytes);
  var rno = hexStringToByteArray(bytes);
  var n = 0;

  if (rno.length === 2) {
    n = ((rno[0] << 8) & 0x0000ff00) | ((rno[1] << 0) & 0x000000ff);
  }

  return n;
}

function reverseBytes(bytes) {
  var reversed = bytes;

  if (bytes.length % 2 === 0) {
    reversed = '';

    for (var starting = 0; starting + 2 <= bytes.length; starting += 2) {
      reversed = bytes.substring(starting, starting + 2) + reversed;
    }
  }

  return reversed;
}

function hexStringToByteArray(s) {
  for (var bytes = [], c = 0; c < s.length; c += 2) {
    bytes.push(parseInt(s.substr(c, 2), 16));
  }

  return bytes;
}

function parseDateByte(payload) {
  var date = new Date();
  var binary = (payload[0] & 0xff) + ((payload[1] << 8) & 0xff00) + ((payload[2] << 16) & 0xff0000) + ((payload[3] << 24) & 0xff000000);
  var second = binary & 0x1f;
  second *= 2;
  binary = binary >> 5;
  var minute = binary & 0x3f;
  binary = binary >> 6;
  var hour = binary & 0x1f;
  binary = binary >> 5;
  var day = binary & 0x1f;
  binary = binary >> 5;
  var month = binary & 0x0f;
  binary = binary >> 4;
  var year = binary & 0x7f;
  year += 2000;
  date = new Date(year, month - 1, day, hour, minute, second, 0).toLocaleString();
  return date;
}
