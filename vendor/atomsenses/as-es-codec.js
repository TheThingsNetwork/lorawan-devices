/**
 * Payload Decoder for Chirpstack and Milesight network server
 * 
 * Copyright 2025 AS
 * 
 * @product AS & ES Series
 */
function decodeUplink(input) {
  var fPort = input.fPort;
  var bytes = input.bytes;
  var hexString = bytesToHex(bytes);
  var data = {};

  // Validate hex format
  if (!/^[0-9a-fA-F]+$/.test(hexString)) {
    return { data: { message: "Invalid hex string" } };
  }

  // Validate length (5 bytes per group)
  if (hexString.length % 10 !== 0) {
    return { data: { message: "Hex length must be multiple of 10" } };
  }

  // Process each 5-byte group
  for (var i = 0; i < hexString.length; i += 10) {
    var group = hexString.substr(i, 10);
    var type = group.substr(0, 2);
    var value = group.substr(2, 8).toLowerCase();
    var value2 = group.substr(6, 4).toLowerCase();

    if (value === "ffffffff" || value2 === "ffff") continue;

    switch (type) {
      case "01":
        data.Temperature = Number(hexToFloat32(value).toFixed(3));
        break;
      case "02":
        data.Humidity = Number(hexToFloat32(value).toFixed(3));
        break;
      case "03":
        data.Pressure = Number(hexToFloat32(value).toFixed(3));
        break;
      case "04":
        data.PM1_0 = parseInt(value2, 16);
        break;
      case "05":
        data.PM2_5 = parseInt(value2, 16);
        break;
      case "06":
        data.PM10 = parseInt(value2, 16);
        break;
      case "07":
        data.CO2 = (parseInt(value2.substr(0, 2), 16) << 8) + parseInt(value2.substr(2, 2), 16);
        break;
      case "08":
        data.TVOC = Number(hexToFloat32(value).toFixed(3));
        break;
      case "09":
        data.Light = parseInt(value2, 16) / 100;
        break;
      case "11":
        data.H2S = ((parseInt(value2.substr(0, 2), 16) << 8) + parseInt(value2.substr(2, 2), 16)) / 10;
        break;
      case "12":
        data.NH3 = ((parseInt(value2.substr(0, 2), 16) << 8) + parseInt(value2.substr(2, 2), 16)) / 100;
        break;
      case "13":
        data.CO = (parseInt(value2.substr(0, 2), 16) << 8) + parseInt(value2.substr(2, 2), 16);
        break;
      case "14":
        data.HCHO = (parseInt(value2.substr(0, 2), 16) << 8) + parseInt(value2.substr(2, 2), 16);
        break;
      case "15":
        data.O3 = (parseInt(value2.substr(0, 2), 16) << 8) + parseInt(value2.substr(2, 2), 16);
        break;
      case "16":
        data.NO2 = ((parseInt(value2.substr(0, 2), 16) << 8) + parseInt(value2.substr(2, 2), 16)) / 1000;
        break;
      case "17":
        data.SO2 = ((parseInt(value2.substr(0, 2), 16) << 8) + parseInt(value2.substr(2, 2), 16)) / 1000;
        break;
      case "18":
        data.O2 = ((parseInt(value2.substr(0, 2), 16) << 8) + parseInt(value2.substr(2, 2), 16)) / 100;
        break;
      case "19":
        data.CH4 = ((parseInt(value2.substr(0, 2), 16) << 8) + parseInt(value2.substr(2, 2), 16));
        break;        
      case "20":
        data.Voltage = Number(hexToFloat32(value).toFixed(3));
        break;
      case "21": 
         data.Battery = Number(hexToFloat32(value).toFixed(1)); 
         break; 
      case "22":
        data.PIR = value2 === "0001" ? "ON" : "OFF";
        break;
      case "26":
        var windSpeedHex = group.substring(2, 6);
        var windLevelHex = group.substring(6, 10);
        data.WindSpeed = parseFloat(parseInt(windSpeedHex, 16) / 10).toFixed(1) + " m/s";
        data.WindLevel = parseInt(windLevelHex, 16);
        break;
      case "27":
        var windDirectionHex = group.substring(2, 6);
        var windDirection16Hex = group.substring(6, 10);
        data.WindDirection = parseFloat(parseInt(windDirectionHex, 16) / 10).toFixed(1) + "°";
        data.WindDirection16 = parseInt(windDirection16Hex, 16);
        break;
      case "30":
        data.BaseBlue = parseInt(group.substring(2, 6), 16);
        data.BaseIR   = parseInt(group.substring(6, 10), 16);
        break;
      case "31":
        data.NetBlue = parseInt(group.substring(2, 6), 16);
        data.NetIR   = parseInt(group.substring(6, 10), 16);
        break;
      case "32":
        var st = parseInt(group.substring(6, 10), 16);
        var states = [];
        if (st & 1) states.push("SMOKE");
        if (st & 2) states.push("SENSOR_FAULT");
        if (st & 4) states.push("LOW_BATTERY");
        data.Status = states.length ? states.join("+") : "NORMAL";
        break;       
      default:
        break;
    }
  }

  return { data: data };
}

/* ******************************************
 * bytes to number
 ********************************************/
function bytesToHex(bytes) {
  var hex = [];
  for (var i = 0; i < bytes.length; i++) {
    hex.push(('0' + bytes[i].toString(16)).slice(-2));
  }
  return hex.join('');
}

// 替换原 hexToFloat32，使用纯 JavaScript 实现
function hexToFloat32(hex) {
  var int = parseInt(hex, 16);
  var byte1 = (int >> 24) & 0xff;
  var byte2 = (int >> 16) & 0xff;
  var byte3 = (int >> 8) & 0xff;
  var byte4 = int & 0xff;

  var sign = (byte1 >> 7) & 0x01;
  var exponent = ((byte1 & 0x7f) << 1) | (byte2 >> 7);
  var mantissa = ((byte2 & 0x7f) << 16) | (byte3 << 8) | byte4;

  if (exponent === 0 && mantissa === 0) return sign === 1 ? -0.0 : 0.0;
  if (exponent === 0xff) return mantissa !== 0 ? NaN : (sign ? -Infinity : Infinity);

  var bias = 127;
  var adjustedExponent = exponent - bias;
  var significand = 1 + mantissa / 0x800000; // 2^23

  return (sign ? -1 : 1) * Math.pow(2, adjustedExponent) * significand;
}

function calculateBattery(voltage) {
  if (voltage > 3.6) return 100;
  return ((voltage - 2.8) / (3.6 - 2.8) * 100).toFixed(1);
}