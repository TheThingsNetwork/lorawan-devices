'use strict';

/*
  TTN decoder for KLAX LoRaWAN electricity meter sensors
  © Tobias Schramm 2020 (tobias.schramm@t-sys.eu) (licensed under CC BY-NC-SA 4.0)
*/

// Dump raw regsiter contents without decoding
var REGISTER_RAW = false;
// Enable debug console.log
// var DEBUG = false;
// Use legacy output format, enables old output format for more modern Klax
var LEGACY_FORMAT = false;

// function debug(msg) {
//   if(DEBUG) {
//     console.log('[DEBUG] ' + msg);
//   }
// }

// function warning(msg) {
//   console.log('[WARNING] ' + msg);
// }

// function error(msg) {
//   console.log('[ERROR] ' + msg);
// }

var SML_KLAX = 'SML Klax';
var MODBUS_KLAX = 'MODBUS Klax';

var KLAX_TYPES = [SML_KLAX, MODBUS_KLAX];

var METER_TYPES = ['SML', 'IEC 62056-21 Mode B', 'IEC 62056-21 Mode C', 'Logarex', 'eBZ', 'Tritschler VC3'];

var MODBUS_MODES = ['MODBUS RTU', 'MODBUS ASCII', 'MODBUS RTU INTERDELAY'];

function parseHeader(data) {
  var version = (data[0] & 0xfc) >> 2;
  var deviceType = KLAX_TYPES[data[0] & 0x3];
  if (version > 0) {
    var batteryPerc = (data[1] & 0x7) * 20;
    var readMode = (data[1] & 0x38) >> 3;
  } else {
    var batteryPerc = (data[1] & 0xf) * 10;
    var readMode = (data[1] & 0x30) >> 4;
  }
  if (deviceType == SML_KLAX) {
    var meterType = METER_TYPES[readMode];
  } else {
    var meterType = MODBUS_MODES[readMode];
  }
  var configured = (data[1] & 0x40) > 0;
  var connTest = (data[1] & 0x80) > 0;
  return { version: version, deviceType: deviceType, batteryPerc: batteryPerc, meterType: meterType, configured: configured, connTest: connTest };
}

var REGISTER_UNITS = ['NDEF', 'Wh', 'W', 'V', 'A', 'Hz', 'varh', 'var', 'VAh', 'VA'];

function pow2(power) {
  return Math.pow(2, power);
}

function decodeUintN(data, bits, be) {
  var val = 0;
  var bytes = bits / 8;
  for (var i = 0; i < bytes; i++) {
    val += data[be ? bytes - 1 - i : i] * pow2(i * 8);
  }
  return val;
}

function decodeUint16BE(data) {
  return decodeUintN(data, 16, true);
}

function decodeUint32BE(data) {
  return decodeUintN(data, 32, true);
}

function decodeIntN(data, bits, be) {
  var val = 0;
  var bytes = bits / 8;
  for (var i = 0; i < bytes; i++) {
    val += data[i] << ((be ? bytes - 1 - i : i) * 8);
  }
  return val;
}

function decodeInt16BE(data) {
  return decodeIntN(data, 16, true);
}

function decodeInt32BE(data) {
  return decodeIntN(data, 32, true);
}

var IEE754_FLOAT_MANTISSA_BITS = 23;
var IEE754_FLOAT_EXPONENT_BITS = 8;

function decodeIEE754FloatBE(data) {
  var mantissa = data[3] | (data[2] << 8) | ((data[1] & 0x7f) << 16);
  var exponent = ((data[1] & 0x80) >> 7) | ((data[0] & 0x7f) << 1);
  var sign = Math.pow(-1, (data[0] & 0x80) >> 7);
  var exception = exponent == pow2(IEE754_FLOAT_EXPONENT_BITS) - 1;
  if (exception) {
    if (mantissa > 0) {
      return NaN;
    } else {
      return sign * Infinity;
    }
  }

  var normalized = exponent > 0;
  if (normalized) {
    // Remove exponent bias
    exponent -= pow2(IEE754_FLOAT_EXPONENT_BITS - 1) - 1;
    return sign * (pow2(exponent) + mantissa * pow2(exponent - IEE754_FLOAT_MANTISSA_BITS));
  } else {
    exponent = -(pow2(IEE754_FLOAT_EXPONENT_BITS - 1) - 2);
    return sign * (mantissa * pow2(exponent - IEE754_FLOAT_MANTISSA_BITS));
  }
}

var IEE754_DOUBLE_MANTISSA_BITS = 52;
var IEE754_DOUBLE_EXPONENT_BITS = 11;

function decodeIEE754DoubleBE(data) {
  var mantissa = data[7] | (data[6] << 8) | (data[5] << 16) | (data[4] << 24);
  // Bitops are 32 bit in js, use arithmetics for more than 32 bits
  mantissa += (data[3] | (data[2] << 8) | ((data[1] & 0xf) << 16)) * pow2(32);
  var exponent = ((data[1] & 0xf0) >> 4) | ((data[0] & 0x7f) << 4);
  var sign = Math.pow(-1, (data[0] & 0x80) >> 7);
  var exception = exponent == pow2(IEE754_DOUBLE_EXPONENT_BITS) - 1;
  if (exception) {
    if (mantissa > 0) {
      return NaN;
    } else {
      return sign * Infinity;
    }
  }

  var normalized = exponent > 0;
  if (normalized) {
    // Remove exponent bias
    exponent -= pow2(IEE754_DOUBLE_EXPONENT_BITS - 1) - 1;
    return sign * (pow2(exponent) + mantissa * pow2(exponent - IEE754_DOUBLE_MANTISSA_BITS));
  } else {
    exponent = -(pow2(IEE754_DOUBLE_EXPONENT_BITS - 1) - 2);
    return sign * (mantissa * pow2(exponent - IEE754_DOUBLE_MANTISSA_BITS));
  }
}

function mkRegister(data, lastValid, unitId, valueDecoder) {
  var unit = unitId < REGISTER_UNITS.length ? REGISTER_UNITS[unitId] : null;
  var dataValid = false;
  var values = [];
  while (data.length >= 4) {
    if (REGISTER_RAW) {
      var raw = data.slice(0, 4);
      var bytes = [];
      for (var i = 0; i < raw.length; i++) {
        var val = raw[i];
        if (val != 0) {
          dataValid = true;
        }
        bytes.push(parseInt(val));
      }
      values.push(bytes);
    } else {
      var val = valueDecoder(data);
      if (val != 0) {
        dataValid = true;
      }
      values.push(val);
    }
    data = data.slice(4);
  }
  dataValid = dataValid || lastValid;
  return { data_valid: dataValid, dataValid: dataValid, unit: unit, values: values };
}

function decodeHistoric(data) {
  var regmask = data[0];
  var reg1Active = (regmask & 0x01) > 0;
  var reg1Filter = (regmask & 0x06) >> 1;
  var reg1Valid = (regmask & 0x08) > 0;
  var reg2Active = (regmask & 0x10) > 0;
  var reg2Filter = (regmask & 0x60) >> 5;
  var reg2Valid = (regmask & 0x80) > 0;
  var units = data[1];
  var reg1Unit = units & 0x0f;
  var reg2Unit = (units & 0xf0) >> 4;
  data = data.slice(2);
  var registers = [];
  if (reg1Active) {
    var reg = mkRegister(data.slice(0, 16), reg1Valid, reg1Unit, decodeInt32BE);
    reg.filterId = reg1Filter;
    registers.push(reg);
  }
  data = data.slice(16);
  if (reg2Active) {
    var reg = mkRegister(data.slice(0, 16), reg2Valid, reg2Unit, decodeInt32BE);
    reg.filterId = reg2Filter;
    registers.push(reg);
  }
  return { type: 'historic', registers: registers };
}

function decodeFilter(data) {
  var filterActive = (data[0] & 0x1) > 0;
  var filterId = (data[0] & 0x6) >> 1;
  var unitId = (data[0] & 0xf0) >> 4;
  var dataValid = data[1] & 0xf;
  data = data.slice(2);
  var values = [];
  if (LEGACY_FORMAT) {
    var registers = [mkRegister(data, dataValid > 0, unitId, decodeIEE754FloatBE)];
    return { type: 'historic', registers: registers };
  } else {
    var filterUnit = REGISTER_UNITS[unitId];
    for (var i = 0; i < 4; i++) {
      var value = decodeIEE754FloatBE(data);
      var valid = (dataValid & (1 << i)) > 0;
      values.push({ value: value, valid: valid });
      data = data.slice(4);
    }
    return { type: 'filter', register: { filterActive: filterActive, filterId: filterId, unit: filterUnit, values: values } };
  }
}

function decodeNow(data, valueDecoder) {
  var registers = [];
  for (var i = 0; i < 4; i++) {
    var filterSet = (data[0] & (1 << i)) > 0;
    var filterValid = (data[0] & (1 << (i + 4))) > 0;
    var unitReg = data[i >= 2 ? 2 : 1];
    var unitId = (unitReg & (i % 2 == 0 ? 0x0f : 0xf0)) >> ((i % 2) * 4);
    var reg = mkRegister(data.slice(3 + 4 * i, 3 + 4 * (i + 1)), filterValid, unitId, valueDecoder);
    reg.filterSet = filterSet;
    reg.filterValid = filterValid;
    registers.push(reg);
  }
  return { type: 'now', registers: registers };
}

function decodeNowInt32(data) {
  return decodeNow(data, decodeInt32BE);
}

function decodeNowFloat(data) {
  return decodeNow(data, decodeIEE754FloatBE);
}

function uint8ToHex(val) {
  var hex = val.toString(16);
  if (hex.length < 2) {
    hex = '0' + hex;
  }
  return hex;
}

function decodeServerID(data) {
  var id = '';
  for (var i = 0; i < data.length; i++) {
    id = id + uint8ToHex(data[i]);
  }
  return { type: 'serverID', id: id };
}

var MODBUS_FILTER_TYPES = [
  { name: 'DOUBLE', decode: decodeIEE754DoubleBE },
  { name: 'INT16', decode: decodeInt16BE },
  { name: 'UINT16', decode: decodeUint16BE },
  { name: 'INT32', decode: decodeInt32BE },
  { name: 'UINT32', decode: decodeUint32BE },
  { name: 'FLOAT', decode: decodeIEE754FloatBE },
];

function decodeModbusFilter(data, len) {
  var filterActive = (data[0] & 0x1) > 0;
  var filterId = (data[0] & 0x6) >> 1;
  var filterType = MODBUS_FILTER_TYPES[(data[0] & 0xf0) >> 4];
  var registerValid = data[1] & 0xf;
  data = data.slice(2);
  values = [];
  var i = 0;
  while (data.length >= len) {
    values.push({ valid: (registerValid & (1 << i)) > 0, value: filterType.decode(data) });
    data = data.slice(len);
    i++;
  }

  return { type: 'registerFilter', register: { filterId: filterId, filterActive: filterActive, filterType: filterType.name, values: values } };
}

function decodeModbusFilter2Byte(data) {
  return decodeModbusFilter(data, 2);
}

function decodeModbusFilter4Byte(data) {
  return decodeModbusFilter(data, 4);
}

function decodeModbusFilter8Byte(data) {
  return decodeModbusFilter(data, 8);
}

function decodeDeviceID(data) {
  var id = decodeUint32BE(data);
  return { type: 'deviceID', id: id };
}

function decodeModbusRegisterStatus(data) {
  var status = data[0];
  var filters = [];
  for (var i = 0; i < 4; i++) {
    filters.push({ set: (status & (1 << i)) > 0, valid: (status & (1 << (4 + i))) > 0 });
  }
  return { type: 'modbusRegisterStatus', filters: filters };
}

var PAYLOAD_HANDLERS = [
  { id: 1, len: 34, decode: decodeHistoric, version: 0 },
  { id: 1, len: 18, decode: decodeFilter },
  { id: 2, len: 19, decode: decodeNowInt32, version: 0 },
  { id: 2, len: 19, decode: decodeNowFloat },
  { id: 3, len: 10, decode: decodeServerID },
  { id: 4, len: 10, decode: decodeModbusFilter2Byte },
  { id: 5, len: 18, decode: decodeModbusFilter4Byte },
  { id: 6, len: 34, decode: decodeModbusFilter8Byte },
  { id: 7, len: 1, decode: decodeModbusRegisterStatus },
  { id: 8, len: 4, decode: decodeDeviceID },
];

function getHandler(data, version) {
  var id = data[0];
  for (var i = 0; i < PAYLOAD_HANDLERS.length; i++) {
    var handler = PAYLOAD_HANDLERS[i];
    if (handler.id == id && (handler['version'] == undefined || handler.version == version)) {
      return handler;
    }
  }
  return null;
}

function parsePayload(handler, data) {
  return handler.decode(data.slice(0, handler.len));
}

function parseMsgInfo(data) {
  var msgIdx = data[0];
  var msgCnt = data[1] & 0x0f;
  var msgNum = (data[1] & 0xf0) >> 4;
  return { msgIdx: msgIdx, msgCnt: msgCnt, msgNum: msgNum };
}

function parseApp(data) {
  var header = parseHeader(data);
  data = data.slice(2);
  var msgInfo = parseMsgInfo(data);
  data = data.slice(2);
  // debug('Got ' + data.length + ' bytes of payload');
  var payloads = [];
  while (data.length > 0) {
    var handler = getHandler(data, header.version);
    if (!handler) {
      // debug('Encountered unknown payload type ' + data[0])
      break;
    }
    data = data.slice(1);
    // debug('Found payload type ' + handler.id + ' with length of ' + handler.len + ' bytes');
    payloads.push(parsePayload(handler, data));
    data = data.slice(handler.len);
  }
  var appData = { type: 'app', header: header, msgInfo: msgInfo, payloads: payloads };
  return appData;
}

function parseConfig(data) {
  var header = parseHeader(data);
  data = data.slice(2);
  var measureInterval = decodeUint16BE(data);
  return { type: 'config', header: header, measureIntervalMin: measureInterval };
}

function parseInfo(data) {
  var header = parseHeader(data);
  data = data.slice(2);
  var appMajorVersion = data[0];
  var appMinorVersion = data[1];
  return { type: 'info', header: header, appMajorVersion: appMajorVersion, appMinorVersion: appMinorVersion };
}

function parseRegisterDefs(data) {
  var registers = [];
  while (data.length >= 3) {
    var main = data[0];
    var major = data[1];
    var minor = data[2];
    registers.push({ main: main, major: major, minor: minor });
    data = data.slice(3);
  }
  return registers;
}

var MODBUS_READ_FUNCTION_CODES = ['Read Coils', 'Read Discrete Inputs', 'Read Holding Registers', 'Read Input Registers'];

function parseRegisterDefsModbus(data) {
  var registers = [];
  while (data.length >= 3) {
    var registerAddress = decodeUint16BE(data);
    var functionCode = MODBUS_READ_FUNCTION_CODES[data[2] & 0x3];
    var filterType = MODBUS_FILTER_TYPES[(data[2] & 0xf0) >> 4];
    registers.push({ registerAddress: registerAddress, functionCode: functionCode, variableType: filterType.name });
    data = data.slice(3);
  }
  return registers;
}

function parseRegisterSearch(data) {
  var header = parseHeader(data);
  data = data.slice(2);
  var msgInfo = parseMsgInfo(data);
  data = data.slice(2);
  return { type: 'registerSearch', header: header, msgInfo: msgInfo, registerDefs: parseRegisterDefs(data) };
}

function parseRegisterSet(data) {
  var header = parseHeader(data);
  data = data.slice(2);
  var activeFilters = data[0] & 0x0f;
  data = data.slice(1);
  var filters = parseRegisterDefs(data.slice(0, 12));
  for (var i = 0; i < filters.length; i++) {
    filters[i].active = (activeFilters & (1 << i)) >> i > 0;
  }
  return { type: 'registerSet', header: header, filters: filters };
}

var MODBUS_PARITIES = ['NONE', 'ODD', 'EVEN', 'NONE SPECIAL'];

function parseModbusSet(data) {
  var header = parseHeader(data);
  if (header.deviceType != MODBUS_KLAX) {
    // error("Invalid payload, modbusSet can only be used with MODBUS Klax");
    return null;
  }
  data = data.slice(2);
  var modbusAddr = data[0];
  data = data.slice(1);
  var modbusBaud = decodeUint16BE(data);
  data = data.slice(2);
  var modbusMode = MODBUS_MODES[data[0] & 0x3];
  var modbusParity = MODBUS_PARITIES[(data[0] & 0x30) >> 4];
  data = data.slice(1);
  var modbusReadRetries = data[0] & 0xf;
  var modbusReadTimeoutMilliseconds = ((data[0] & 0xf0) >> 4) * 100;
  data = data.slice(1);
  var modbusWriteBeforeRead = (data[0] & 0x1) > 0;
  var modbusWaitBeforeReadMilliseconds = ((data[0] & 0xf0) >> 4) * 100;
  data = data.slice(1);
  var modbusWriteAddr = decodeUint16BE(data);
  data = data.slice(2);
  var modbusWriteData = decodeUint16BE(data);
  data = data.slice(2);
  var activeFilters = data[0] & 0x0f;
  data = data.slice(1);
  var filters = parseRegisterDefsModbus(data.slice(0, 12));
  for (var i = 0; i < filters.length; i++) {
    filters[i].active = (activeFilters & (1 << i)) >> i > 0;
  }
  return {
    type: 'modbusSet',
    header: header,
    modbus: {
      address: modbusAddr,
      baud: modbusBaud,
      mode: modbusMode,
      parity: modbusParity,
      readRetries: modbusReadRetries,
      readTimeoutMilliseconds: modbusReadTimeoutMilliseconds,
      writeBeforeRead: modbusWriteBeforeRead,
      waitBeforeReadMilliseconds: modbusWaitBeforeReadMilliseconds,
      writeAddress: modbusWriteAddr,
      writeData: modbusWriteData,
    },
    filters: filters,
  };
}

var DECODERS = [
  { port: 3, minLen: 4, name: 'app', decode: parseApp },
  { port: 100, minLen: 4, name: 'config', decode: parseConfig },
  { port: 101, minLen: 4, name: 'info', decode: parseInfo },
  { port: 103, minLen: 4, name: 'registerSearch', decode: parseRegisterSearch },
  { port: 104, minLen: 15, name: 'registerSet', decode: parseRegisterSet },
  { port: 105, minLen: 25, name: 'modbusSet', decode: parseModbusSet },
];

function getDecoder(port) {
  for (var i = 0; i < DECODERS.length; i++) {
    var decoder = DECODERS[i];
    if (decoder.port == port) {
      return decoder;
    }
  }
  return null;
}

function decodeUplink(input) {
  var port = input.fPort;
  var bytes = input.bytes;
  var decoder = getDecoder(port);

  if (!decoder) {
    return {
      warnings: ['No decoder for port ' + port + ' found'],
    };
  }
  if (bytes.len < decoder.minLen) {
    return {
      warnings: ['Message too short for decoder "' + decoder.name + '", got ' + bytes.len + ' bytes need at least ' + decoder.minLen + ' bytes'],
    };
  }
  return {
    data: decoder.decode(bytes),
  };
}
