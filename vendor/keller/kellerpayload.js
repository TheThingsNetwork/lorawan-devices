/* This is just a decoder for the TTN live viewer. The complete payload format protocol can be found here: https://docs.kolibricloud.ch/sending-technology/lora-technology/keller-lora-payload/*/
/* This code is from https://github.com/KELLERAGfuerDruckmesstechnik/KellerAgTheThingsNetworkPayloadDecoder */

function decodeUplink(input) {
  var port = input.fPort;
  var bytes = input.bytes;
  var functionCode = bytes[0];
  var decoded = {
    func: functionCode,
    port: port,
    payload: bytes.map(function (byte) { return pad(byte.toString(16).toUpperCase(), 2); }).join('')
  };

  if (functionCode === 12) {
    fillUpDecodedDeviceInformation(bytes, decoded); // Device sends information package, has to be decoded differently
  }
  else if (functionCode === 1) {
    fillUpDecodedMeasurements(bytes, decoded); // Device sends measurement package
  } else {
    return {
      data: decoded,
      warnings: ["This function code is not supported in this decoder."],
      errors: []
    }
  }

  return {
    data: decoded,
    warnings: [],
    errors: []
  };
}

function encodeDownlink(input) {
  return {
    data: {
      bytes: input.bytes
    },
    warnings: ["Encoding of downlink is not supported by the JS decoder. Yet, it is possible to use downlink telegrams using the correct payload (https://docs.kolibricloud.ch/sending-technology/ADT1%20LoRa%20data%20communication%20protocol%2002_2020.pdf)"],
    errors: []
  }
}

function decodeDownlink(input) {
  return {
    data: {
      bytes: input.bytes
    },
    warnings: ["Decoding of downlink is not supported by the JS decoder. Yet, it is possible to use downlink telegrams using the correct payload (https://docs.kolibricloud.ch/sending-technology/ADT1%20LoRa%20data%20communication%20protocol%2002_2020.pdf)"],
    errors: []
  }
}

// Decode the device information package and append it to the result object
function fillUpDecodedDeviceInformation(bytes, result) {
  result.battery_voltage = bytesToFloat(bytes.slice(14, 18));
  result.battery_capacity_percentage = bytes[18];
  result.humidity_percentage = bytes[19];
  result.class_group_text = pad(bytes[2], 2) + '.' + pad(bytes[3], 2);
  result.sw_version_text = pad(bytes[4], 2) + '.' + pad(bytes[5], 2);
  result.serial_number = bytesToInt(bytes.slice(6, 10));
  result.device_local_datetime = bytesToDate(bytes.slice(10, 14));
}

// Decode the device measurement package and append it to the result object
function fillUpDecodedMeasurements(bytes, result) {
  // ct = connection type
  result.ct = bytes[1];
  result.channel = bytesToBinaryString(bytes.slice(2, 4), 2);
  result.channelCount = result.channel.match(/1/g).length;
  var channelsReverted = result.channel.split("").reverse().join("");
  var firstIndex = channelsReverted.indexOf('1');

  // Loop through all additional package content. Every group of 4 Bytes
  // contains information for another channel (Channel 1, Channel 2, ...)
  for (var i = 1; i <= result.channelCount; i++) {
    var msbIndex = i * 4;
    var byteValue = bytes.slice(msbIndex, msbIndex + 4);

    result[deviceTypesToChannelNames[result.ct][firstIndex]] = bytesToFloat(byteValue);
    firstIndex = channelsReverted.indexOf('1', firstIndex + 1);
  }
}

// Convert an array of bytes into a float: bytesToFloat([ 0x3B, 0x2F, 0x7A, 0x1A ]) => 0.0026775659061968327
// Based on https://stackoverflow.com/a/37471538 by Ilya Bursov
function bytesToFloat(bytes) {
  // JavaScript bitwise operators yield a 32 bits integer, not a float.
  // Assume MSB (most significant byte first).
  var bits = bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3];
  var sign = (bits >>> 31 === 0) ? 1.0 : -1.0;
  var e = bits >>> 23 & 0xff;
  var m = (e === 0) ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
  var f = sign * m * Math.pow(2, e - 150);
  return f;
}

// Convert an array of bytes into a binary string: bytesToBinaryString([ 0x25, 0x4D, 0x4F, 0xCA ]) => '00100101010011010100111111001010'
function bytesToBinaryString(bytes) {
  var binary = '';

  for (var i = 0, l = bytes.length; i < l; i++) {
    var bits = bytes[i].toString(2);

    while (bits.length < 8) {
      bits = '0' + bits;
    }

    binary = binary + bits;
  }

  return binary;
}

// Convert an array of bytes into an integer: bytesToInt([ 0x25, 0x4D, 0x4F, 0xCA ]) => 625823690
function bytesToInt(bytes) {
  var binaryString = bytesToBinaryString(bytes);
  if (binaryString.length == 0) {
    return 0;
  }
  return parseInt(binaryString, 2);
}

// Convert an array of bytes into a UTC date. The bytes array must represent
// the number of seconds since "2000-01-01T00:00:00.000": bytesToDate([ 0x25, 0x4D, 0x4F, 0xCA ]) => 2019-10-31 07:54:50
function bytesToDate(bytes) {
  var zero = new Date('2000-01-01T00:00:00.000Z').getTime();
  var time = bytesToInt(bytes) * 1000;
  var date = new Date(zero + time);

  var year = date.getUTCFullYear();
  var month = pad(date.getUTCMonth() + 1, 2);
  var day = pad(date.getUTCDate(), 2);
  var hours = pad(date.getUTCHours(), 2);
  var minutes = pad(date.getUTCMinutes(), 2);
  var seconds = pad(date.getUTCSeconds(), 2);

  return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
}

// Prepends a number of "0" to a parameter. pad(7, 2) => '07'
function pad(num, size) {
  var s = num.toString();
  while (s.length < size) s = '0' + s;
  return s;
}

var map = {
  1: 'Pd (P1-P2)',
  2: 'P1',
  3: 'P2',
  4: 'T',
  5: 'TOB1',
  6: 'TOB2',
  7: 'PBaro',
  8: 'TBaro',
  9: 'Volt Inp. 1',
  10: 'Volt Inp. 2',
  11: 'Pd (P1-PBaro)',
  12: 'Conductivity Tc',
  13: 'Conductivity raw',
  14: 'T (Conductivity)',
  15: 'P1 (2)',
  16: 'P1 (3)',
  17: 'P1 (4)',
  18: 'P1 (5)',
  19: 'Counter input',
  20: 'SDI12 CH1',
  21: 'SDI12 CH2',
  22: 'SDI12 CH3',
  23: 'SDI12 CH4',
  24: 'SDI12 CH5',
  25: 'SDI12 CH6',
  26: 'SDI12 CH7',
  27: 'SDI12 CH8',
  28: 'SDI12 CH9',
  29: 'SDI12 CH10',
  30: 'TOB1 (2)',
  31: 'TOB1 (3)',
  32: 'TOB1 (4)',
  33: 'TOB1 (5)',
  34: 'E',
  35: 'F',
  36: 'G',
  37: 'mH20 (PBaro)',
  38: 'mH20 (P1-P2)',
  39: 'mH20 (P1-P3)',
  40: 'mH20 (P1-P4)',
  41: 'mH20 (P1-P5)',
  42: 'Conductivity Tc (2)',
  43: 'Conductivity Tc (3)',
  44: 'T (Conductivity) (2)',
  45: 'T (Conductivity) (3)',
  46: 'P2 (2)',
  47: 'TOB2 (2)',
  48: 'AquaMaster Flow Rate',
  49: 'AquaMaster Pressure',
  50: 'AquaMaster Custom Flow Units',
  51: 'AquaMaster External Supply Voltage',
  52: 'Tank Content 1',
  53: 'Tank Content 2',
  54: 'Tank Content 3',
};

var deviceTypesToChannelNames = {
  0: [map[1], map[2], map[3], map[4], map[5], map[6]],
  1: [map[1], map[2], map[3], map[4], map[5], map[6]],
  2: [map[11], map[2], map[3], map[4], map[5], map[6], map[7], map[8]],
  3: [map[11], map[2], map[3], map[4], map[5], map[6], map[7], map[8]],
  4: [map[1], map[2], map[3], map[4], map[5], map[6], map[7], map[8], map[9], map[10]],
  5: [map[11], map[2], map[3], map[4], map[5], map[6], map[7], map[8], map[9], map[10], map[11]],
  6: [map[1], map[2], map[3], map[4], map[5], map[6], map[7], map[8], map[9], map[10], map[15], map[16], map[17], map[18], map[19]],
  7: [map[7], map[8], map[9], map[10], map[20], map[21], map[22], map[23], map[24], map[25], map[26], map[27], map[28], map[29]],
  8: [map[2], map[5], map[15], map[30], map[16], map[31], map[17], map[32], map[18], map[33], map[9], map[10], map[7], map[8], map[19]],
  9: [map[1], map[2], map[3], map[14], map[5], map[6], map[7], map[8], map[9], map[10], map[12], map[13]],
  10: [map[11], map[2], map[3], map[14], map[5], map[6], map[7], map[8], map[9], map[10], map[12], map[13]],
  11: [map[2], map[5], map[12], map[14], map[15], map[30], map[42], map[44], map[16], map[31], map[43], map[45], map[7], map[8], map[19]],
  13: [map[2], map[3], map[5], map[6], map[15], map[46], map[30], map[47], map[7], map[8], map[9], map[10], map[19]],
};
