function decodeUplink(input) {
  var decoded = {};
  var port = input.fPort;
  if (port === 12) decoded = { data: decodePort12Bytes(input.bytes) };
  else {
    decoded = {
      errors: ['Unknown port'],
    };
  }
  return decoded;
}

// 15 | 00 00 00 00 | 00 00 00 00 | FF | BF   //V8
function decodePort12Bytes(bytes) {
  var decodedPayload = decodeV8Payloads(bytes);
  return decodedPayload;
}

function decodeV8Payloads(bytes) {
  var firmwareVersion = bytes[0] >> 4;
  var activatedServices = checkActiveServices(bytes[0] & 0x0f);
  var pulseCntr1 = convertByteArrayToInt(arraySplice(bytes, 1, 4));
  var pulseCntr2 = convertByteArrayToInt(arraySplice(bytes, 1, 4));
  // var batteryStatus = convertByteArrayToInt(bytes.splice(1, 1)) / 1000;
  var batteryStatus = parseFloat(_map(convertByteArrayToInt(arraySplice(bytes, 1, 1)), 0, 255, 0, 3.3).toFixed(2));
  var temperature = parseFloat(_map(convertByteArrayToInt(arraySplice(bytes, 1, 1)), 0, 255, -30, 60).toFixed(2));

  var decoded = {
    type: 'status',
    hardwareVersion: 8,
    firmwareVersion: firmwareVersion,
    pulseCounter1: pulseCntr1,
    pulseCounter2: pulseCntr2,
    batteryLevel: batteryStatus,
    temperature: temperature,
  };
  if (activatedServices) {
    decoded.activatedServices = activatedServices;
  }
  return decoded;
}

function convertByteArrayToInt(bytes) {
  function toHexString(byteArray) {
    return Array.prototype.map
      .call(byteArray, function (byte) {
        return ('0' + (byte & 0xff).toString(16)).slice(-2);
      })
      .join('');
  }
  var hex = toHexString(bytes.reverse());
  return parseInt(hex, 16);
}

function _map(x, x1, x2, y1, y2) {
  return ((x - x1) * (y2 - y1)) / (x2 - x1) + y1;
}

function checkActiveServices(hex) {
  function _checkState(value, pos) {
    return (value >> pos) & 1;
  }
  var ENABLED_SERVICES = [];
  var SERVICES = ['LORASENSE_REPORT_SERVICE_PULSE_COUNTER1', 'LORASENSE_REPORT_SERVICE_PULSE_COUNTER2', 'LORASENSE_REPORT_SERVICE_TEMPERATURE'];

  for (var i = 0; i < 3; i++) {
    if (_checkState(hex, i)) {
      ENABLED_SERVICES.push(SERVICES[i]);
    }
  }
  return ENABLED_SERVICES;
}

function arraySplice(array, start, deleteCount) {
  var result = [];
  var removed = [];
  var argsLen = arguments.length;
  var arrLen = array.length;
  var i, k;

  // Follow spec more or less
  start = parseInt(start, 10);
  deleteCount = parseInt(deleteCount, 10);

  // Deal with negative start per spec
  // Don't assume support for Math.min/max
  if (start < 0) {
    start = arrLen + start;
    start = start > 0 ? start : 0;
  } else {
    start = start < arrLen ? start : arrLen;
  }

  // Deal with deleteCount per spec
  if (deleteCount < 0) deleteCount = 0;

  if (deleteCount > arrLen - start) {
    deleteCount = arrLen - start;
  }

  // Copy members up to start
  for (i = 0; i < start; i++) {
    result[i] = array[i];
  }

  // Add new elements supplied as args
  for (i = 3; i < argsLen; i++) {
    result.push(arguments[i]);
  }

  // Copy removed items to removed array
  for (i = start; i < start + deleteCount; i++) {
    removed.push(array[i]);
  }

  // Add those after start + deleteCount
  for (i = start + (deleteCount || 0); i < arrLen; i++) {
    result.push(array[i]);
  }

  // Update original array
  array.length = 0;
  i = result.length;
  while (i--) {
    array[i] = result[i];
  }

  // Return array of removed elements
  return removed;
}
