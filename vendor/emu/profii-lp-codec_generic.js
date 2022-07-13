/**
 * Copyright (c) 2021 EMU Electronic AG (https://www.emuag.ch/). All rights reserved.
 * This file is subject to proprietary software.
 *
 *
 */
/**
 * decodeUplink is called by TheThingsNetwork
 * we use our parsePayload() for decoding
 *
 * @param {*} input
 * @returns object containing decoded payload
 * {
 *      "Active Energy Export T1": {
 *        "unit": "Wh",
 *        "value": 0
 *      },
 *      "Active Energy Export T2": {
 *        "unit": "Wh",
 *        "value": 0
 *      },
 *      "Active Energy Import T1": {
 *        "unit": "Wh",
 *        "value": 4000
 *      },
 *      "Active Energy Import T2": {
 *        "unit": "Wh",
 *        "value": 0
 *      },
 *      "Reactive Energy Export T1": {
 *        "unit": "varh",
 *        "value": 0
 *      },
 *      "Reactive Energy Export T2": {
 *        "unit": "varh",
 *        "value": 0
 *      },
 *      "Reactive Energy Import T1": {
 *        "unit": "varh",
 *        "value": 0
 *      },
 *      "Reactive Energy Import T2": {
 *        "unit": "varh",
 *        "value": 0
 *      },
 *      "medium": {
 *        "desc": "Electricity",
 *        "type": 1
 *      },
 *      "readoutInterval": 900,
 *      "timeStamp": 1635499020,
 *      "timestamp": {
 *        "unit": "seconds",
 *        "value": 1635499020
 *      }
 */
function decodeUplink(input) {
  data = input.bytes;
  //uplink with only 2 bytes is only status update, ignore it
  if (data.length <= 2) {
    return {};
  }

  var obj = {};

  //check CRC-8 which resides at the end
  crc8Received = data[data.length - 1];
  dataToCheck = [];
  for (var i = 0; i < data.length - 1; i++) {
    dataToCheck.push(data[i]);
  }

  if (crc8_encode(dataToCheck).toString(16) === crc8Received.toString(16)) {
    //crc-8 seems ok,
  } else {
    obj.warnings = ['crc-8 wrong'];
    //perhaps decide to stop further processing if crc-8 is wrong
  }

  //first 4 bytes are allways the timestamp, this is the timestamp from the datalogger
  var timeStamp = getUint32(data);

  obj.data = parsePayload(data);

  //for TTN we strip unused information
  for (var property in obj.data) {
    delete obj.data[property].cfgdescription;
    delete obj.data[property].cfgtariff;
    delete obj.data[property].cfgunit;
    delete obj.data[property].cfgorder;
    delete obj.data[property].order;
  }

  obj.data.timeStamp = timeStamp;
  obj.data.medium = {
    type: 1,
    desc: 'Electricity',
  };

  return obj;
}

/**
 * Decode is called by Chirpstack
 * @param {*} fPort
 * @param {*} data
 * @param {*} variables
 * @returns object containing decoded payload
 *
 * {
 *  "Active Energy Import T1": {
 *     "unit": "Wh",
 *     "cfgdescription": 3,
 *     "cfgunit": 1,
 *     "cfgtariff": 1,
 *     "order": 3,
 *     "value": 1809
 *  },
 *  "Active Energy Import T2": {
 *     "unit": "Wh",
 *     "cfgdescription": 3,
 *     "cfgunit": 1,
 *     "cfgtariff": 2,
 *     "order": 4,
 *     "value": 128
 *  },
 *  "Active Energy Export T1": {
 *     "unit": "Wh",
 *     "cfgdescription": 5,
 *     "cfgunit": 1,
 *     "cfgtariff": 1,
 *     "order": 5,
 *     "value": 1149
 *  },
 *  "Active Energy Export T2": {
 *     "unit": "Wh",
 *     "cfgdescription": 5,
 *     "cfgunit": 1,
 *     "cfgtariff": 2,
 *     "order": 6,
 *     "value": 17794
 *  },
 *  "Reactive Energy Import T1": {
 *     "unit": "varh",
 *     "cfgdescription": 10,
 *     "cfgunit": 5,
 *     "cfgtariff": 1,
 *     "order": 7,
 *     "value": 1864
 *  },
 *  "Reactive Energy Import T2": {
 *     "unit": "varh",
 *     "cfgdescription": 10,
 *     "cfgunit": 5,
 *     "cfgtariff": 2,
 *     "order": 8,
 *     "value": 2600
 *  },
 *  "Reactive Energy Export T1": {
 *     "unit": "varh",
 *     "cfgdescription": 13,
 *     "cfgunit": 5,
 *     "cfgtariff": 1,
 *     "order": 9,
 *     "value": 338
 *  },
 *  "Reactive Energy Export T2": {
 *     "unit": "varh",
 *     "cfgdescription": 13,
 *     "cfgunit": 5,
 *     "cfgtariff": 2,
 *     "order": 10,
 *     "value": 9661
 *  },
 *  "timeStamp": 1635499800,
 *  "medium": {
 *     "type": 1,
 *     "desc": "Electricity"
 *  },
 *  "readoutInterval": 900
 * }
 */
function Decode(fPort, data, variables) {
  //uplink with only 2 bytes is only status update, ignore it
  if (data.length <= 2) {
    return {};
  }

  var obj = {};

  //check CRC-8 which resides at the end
  crc8Received = data[data.length - 1];
  dataToCheck = [];
  for (var i = 0; i < data.length - 1; i++) {
    dataToCheck.push(data[i]);
  }

  if (crc8_encode(dataToCheck).toString(16) === crc8Received.toString(16)) {
    //crc-8 seems ok,
  } else {
    obj.warnings = ['crc-8 wrong'];
    //perhaps decide to stop further processing if crc-8 is wrong
  }

  //first 4 bytes are allways the timestamp, this is the timestamp from the datalogger
  var timeStamp = getUint32(data);
  obj = parsePayload(data);
  obj.timeStamp = timeStamp;

  obj.medium = {
    type: 1,
    desc: 'Electricity',
  };

  //Default readout-interval is allways 15 minutes
  obj.readoutInterval = 15 * 60; //15 Min * 60 Sec
  //you can overwrite the readout-interval when defining variables for this meter
  if (variables !== null && variables.readoutInterval !== null) {
    obj.readoutInterval = variables.readoutInterval;
  }

  return obj;
}

/**
 * encodeDownlink is called by TheThingsNetwork
 * @param {*} data Object containing configuration
 * @returns binary data
 */
function encodeDownlink(data) {
  /**
   * Example JSON-Object for Timestamp, Energy 0x03-0x0A
   * {
   *   "fPort": 1,
   *   "timeInterval": 15,
   *   "sndAck": true,
   *   "startReJoin": false,
   *   "portIsActive": true,
   *   "values": [
   *       1,
   *       3,
   *       4,
   *       5,
   *       6,
   *       7,
   *       8,
   *       9,
   *       10
   *   ]
   * }
   *
   */
  //fPort must be defined else define it
  if (data.data.fPort === null || data.data.fPort === undefined) {
    data.data.fPort = 1;
  }
  fPort = data.data.fPort;
  bytes = [];

  //just call the Encode function
  bytes = Encode(fPort, data.data, {});

  return { fPort: fPort, bytes: bytes };
}

/**
 * decodeDownlink is used by TheThingsNetwork
 * @param {*} input  binary data containing configuration
 * @returns data object containing decoded configuration
 */
function decodeDownlink(input) {
  //TODO
  var data = {};
  return data;
}
/**
 * Encode is called by Chirpstack
 * @param {*} fPort
 * @param {*} data Object containing configuration
 * @param {*} variables
 * @returns binary data
 */
function Encode(fPort, data, variables) {
  /**
   * Example JSON-Object for Timestamp, Energy 0x03-0x0A
   * {
   *   "fPort": 1,
   *   "timeInterval": 15,
   *   "sndAck": true,
   *   "startReJoin": false,
   *   "portIsActive": true,
   *   "values": [
   *       1,
   *       3,
   *       4,
   *       5,
   *       6,
   *       7,
   *       8,
   *       9,
   *       10
   *   ]
   * }
   *
   */
  bytes = [];

  //make sure the time is valid and between 1 and 65535!
  data.timeInterval = Math.min(data.timeInterval, 0xffff);
  data.timeInterval = Math.max(data.timeInterval, 1);

  //push second byte to first position
  bytes.push(data.timeInterval & 0x00ff);
  //push first byte to second pposition
  bytes.push(data.timeInterval >> 8);

  var configFlags = 0x00;
  //Send Acknowledge for each Uplink back
  if (data.sndAck) {
    configFlags |= 0x02;
  }
  //Start Re-Join
  if (data.startReJoin) {
    configFlags |= 0x04;
  }
  //Enable this port so it sends data
  if (data.portIsActive) {
    configFlags |= 0x08;
  }

  //Push the config flag on the stack
  bytes.push(configFlags);
  for (var i = 0; i < data.values.length; i++) {
    bytes.push(data.values[i]);
  }
  //apply crc-8
  crc8 = crc8_encode(bytes);
  bytes.push(crc8);

  return bytes;
}

/**
 * read 1 byte of data an convert it to an Uint8
 * @param {*} data
 * @returns
 */
function getUint8(data) {
  var value = data >>> 0;
  return value;
}

function flip(n) {
  var x = [];
  n = Number(n);
  //will work only for positive numbers
  var single = n.toString(2).split('');
  for (var i = 0; i < single.length; i++) {
    x.push(single[i] == 1 ? 0 : 1);
  }

  var tmp = x.join('');
  var y = (parseInt(tmp, 2) + 1) * -1;
  return y;
}

/**
 * read 1 byte of data an convert it to an Int8
 * @param {*} data
 * @returns
 */
function getInt8(data) {
  if (data === 0) {
    return 0;
  }
  if (data >> 7 == 1) {
    return flip(data);
  }
  var value = data >>> 0;
  return value;
}
/**
 * read 2 bytes of data an convert it to an Int16
 * @param {*} data
 * @returns
 */
function getInt16(data) {
  value = (data[1] << 8) | data[0];
  return value;
}
/**
 * read 2 bytes of data an convert it to an Uint16
 * @param {*} data
 * @returns
 */
function getUint16(data) {
  value = ((data[1] << 8) | data[0]) >>> 0;
  return value;
}
/**
 * read 4 bytes of data an convert it to an Int32
 * @param {*} data
 * @returns
 */
function getInt32(data) {
  value = (data[3] << 24) | (data[2] << 16) | (data[1] << 8) | data[0];
  return value;
}
/**
 * * read 4 bytes of data an convert it to an Uint32
 * @param {*} data
 * @returns
 */
function getUint32(data) {
  value = ((data[3] << 24) | (data[2] << 16) | (data[1] << 8) | data[0]) >>> 0;
  return value;
}

/**
 * read 8 bytes of data an convert it to an Int64
 * @param {*} data
 * @returns
 */
function getInt64(data) {
  //JS can't handle bitwise operation with more than 32bit !
  //so this won't work
  //if Chirpstack will use another javascript engine we could use typearray's
  var value = Number((data[7] << 56) | (data[6] << 48) | (data[5] << 40) | (data[4] << 32) | (data[3] << 24) | (data[2] << 16) | (data[1] << 8) | data[0]);
  return value;
}
/**
 * * read 8 bytes of data an convert it to an Uint32
 * @param {*} data
 * @returns
 */
function getUint64(data) {
  //JS can't handle bitwise operation with more than 32bit !
  //so this won't work
  //if Chirpstack will use another javascript engine we could use typearray's

  value = Number(((data[7] << 56) | (data[6] << 48) | (data[5] << 40) | (data[4] << 32) | (data[3] << 24) | (data[2] << 16) | (data[1] << 8) | data[0]) >>> 0);
  return value;
}

function getBCD(data) {
  var bcd = '';
  for (var i = 0; i < data.length; i++) {
    bcd = bcd + '' + data[i];
  }

  return bcd;
}

function getASCII(data) {
  var ascii = '';

  for (var i = 0; i < data.length; i++) {
    entry = getUint8(data[i]);
    if (entry != 0x00) {
      ascii = ascii + String.fromCharCode(entry.toString());
    }
  }
  return ascii;
}
/**
 * parses the variable data and returns an object
 *
 * a value is identified by its id
 *
 * @param {*} obj
 * @param {*} data
 */
function parsePayload(data) {
  var dataTypes = [];

  //be sure to fill the complete array
  //if we receive an invalid datatype we skip the rest of the data
  for (i = 0; i < 256; i++) {
    dataTypes[i] = { len: 255, description: 'invalid data-type' };
  }

  //the "order" is assigned according to the entry
  dataTypes[0x00] = { len: 4, description: 'data-logger-index', dataType: 'Uint32' };
  dataTypes[0x01] = { len: 4, description: 'timestamp', dataType: 'Uint32', unit: 'seconds' };
  dataTypes[0x02] = { len: 4, description: 'timestamp-previous', dataType: 'Uint32', unit: 'seconds' };
  dataTypes[0x03] = { len: 4, description: 'Active Energy Import T1', dataType: 'Uint32', unit: 'Wh', cfgdescription: 3, cfgunit: 1, cfgtariff: 1 };
  dataTypes[0x04] = { len: 4, description: 'Active Energy Import T2', dataType: 'Uint32', unit: 'Wh', cfgdescription: 3, cfgunit: 1, cfgtariff: 2 };
  dataTypes[0x05] = { len: 4, description: 'Active Energy Export T1', dataType: 'Uint32', unit: 'Wh', cfgdescription: 5, cfgunit: 1, cfgtariff: 1 };
  dataTypes[0x06] = { len: 4, description: 'Active Energy Export T2', dataType: 'Uint32', unit: 'Wh', cfgdescription: 5, cfgunit: 1, cfgtariff: 2 };
  dataTypes[0x07] = { len: 4, description: 'Reactive Energy Import T1', dataType: 'Uint32', unit: 'varh', cfgdescription: 10, cfgunit: 5, cfgtariff: 1 };
  dataTypes[0x08] = { len: 4, description: 'Reactive Energy Import T2', dataType: 'Uint32', unit: 'varh', cfgdescription: 10, cfgunit: 5, cfgtariff: 2 };
  dataTypes[0x09] = { len: 4, description: 'Reactive Energy Export T1', dataType: 'Uint32', unit: 'varh', cfgdescription: 13, cfgunit: 5, cfgtariff: 1 };
  dataTypes[0x0a] = { len: 4, description: 'Reactive Energy Export T2', dataType: 'Uint32', unit: 'varh', cfgdescription: 13, cfgunit: 5, cfgtariff: 2 };
  dataTypes[0x0b] = { len: 4, description: 'Active Power L123', dataType: 'Int32', unit: 'W', cfgdescription: 25, cfgunit: 13 };
  dataTypes[0x0c] = { len: 4, description: 'Active Power L1', dataType: 'Int32', unit: 'W', cfgdescription: 25, cfgunit: 13, cfgphase: 1 };
  dataTypes[0x0d] = { len: 4, description: 'Active Power L2', dataType: 'Int32', unit: 'W', cfgdescription: 25, cfgunit: 13, cfgphase: 2 };
  dataTypes[0x0e] = { len: 4, description: 'Active Power L3', dataType: 'Int32', unit: 'W', cfgdescription: 25, cfgunit: 13, cfgphase: 3 };
  dataTypes[0x0f] = { len: 4, description: 'Current L123', dataType: 'Int32', unit: 'mA', cfgdescription: 31, cfgunit: 28 };
  dataTypes[0x10] = { len: 4, description: 'Current L1', dataType: 'Int32', unit: 'mA', cfgdescription: 31, cfgunit: 28, cfgphase: 1 };
  dataTypes[0x11] = { len: 4, description: 'Current L2', dataType: 'Int32', unit: 'mA', cfgdescription: 31, cfgunit: 28, cfgphase: 2 };
  dataTypes[0x12] = { len: 4, description: 'Current L3', dataType: 'Int32', unit: 'mA', cfgdescription: 31, cfgunit: 28, cfgphase: 3 };
  dataTypes[0x13] = { len: 4, description: 'Current N', dataType: 'Int32', unit: 'mA', cfgdescription: 31, cfgunit: 28, cfgphase: 4 };
  dataTypes[0x14] = { len: 4, description: 'Voltage L1-N', dataType: 'Int32', unit: 'V/10', unit_calculated: 'V', factor: 0.1, fixed: 1, cfgdescription: 30, cfgunit: 26, cfgphase: 1 };
  dataTypes[0x15] = { len: 4, description: 'Voltage L2-N', dataType: 'Int32', unit: 'V/10', unit_calculated: 'V', factor: 0.1, fixed: 1, cfgdescription: 30, cfgunit: 26, cfgphase: 2 };
  dataTypes[0x16] = { len: 4, description: 'Voltage L3-N', dataType: 'Int32', unit: 'V/10', unit_calculated: 'V', factor: 0.1, fixed: 1, cfgdescription: 30, cfgunit: 26, cfgphase: 3 };
  dataTypes[0x17] = { len: 1, description: 'Powerfactor L1', dataType: 'Int8', unit: 'Cos', factor: 0.01, fixed: 2, cfgdescription: 32, cfgunit: 31, cfgphase: 1 };
  dataTypes[0x18] = { len: 1, description: 'Powerfactor L2', dataType: 'Int8', unit: 'Cos', factor: 0.01, fixed: 2, cfgdescription: 32, cfgunit: 31, cfgphase: 2 };
  dataTypes[0x19] = { len: 1, description: 'Powerfactor L3', dataType: 'Int8', unit: 'Cos', factor: 0.01, fixed: 2, cfgdescription: 32, cfgunit: 31, cfgphase: 3 };
  dataTypes[0x1a] = { len: 2, description: 'Frequency', dataType: 'Int16', unit: 'Hz', factor: 0.1, fixed: 1, cfgdescription: 33, cfgunit: 32 };
  dataTypes[0x1b] = { len: 4, description: 'Active Power average', dataType: 'Int32', unit: 'W', cfgunit: 13 };
  dataTypes[0x1c] = { len: 4, description: 'Active Energy Import T1 kWh', dataType: 'Uint32', unit: 'kWh', cfgdescription: 3, cfgunit: 2, cfgtariff: 1 };
  dataTypes[0x1d] = { len: 4, description: 'Active Energy Import T2 kWh', dataType: 'Uint32', unit: 'kWh', cfgdescription: 3, cfgunit: 2, cfgtariff: 2 };
  dataTypes[0x1e] = { len: 4, description: 'Active Energy Export T1 kWh', dataType: 'Uint32', unit: 'kWh', cfgdescription: 5, cfgunit: 2, cfgtariff: 1 };
  dataTypes[0x1f] = { len: 4, description: 'Active Energy Export T2 kWh', dataType: 'Uint32', unit: 'kWh', cfgdescription: 5, cfgunit: 2, cfgtariff: 2 };
  dataTypes[0x20] = { len: 4, description: 'Reactive Energy Import T1 kvarh', dataType: 'Uint32', unit: 'kvarh', cfgdescription: 10, cfgunit: 6, cfgtariff: 1 };
  dataTypes[0x21] = { len: 4, description: 'Reactive Energy Import T2 kvarh', dataType: 'Uint32', unit: 'kvarh', cfgdescription: 10, cfgunit: 6, cfgtariff: 2 };
  dataTypes[0x22] = { len: 4, description: 'Reactive Energy Export T1 kvarh', dataType: 'Uint32', unit: 'kvarh', cfgdescription: 13, cfgunit: 6, cfgtariff: 1 };
  dataTypes[0x23] = { len: 4, description: 'Reactive Energy Export T2 kvarh', dataType: 'Uint32', unit: 'kvarh', cfgdescription: 13, cfgunit: 6, cfgtariff: 2 };
  dataTypes[0x24] = { len: 8, description: 'Active Energy Import T1 64bit', dataType: 'uInt64', unit: 'Wh', cfgdescription: 3, cfgunit: 1, cfgtariff: 1 };
  dataTypes[0x25] = { len: 8, description: 'Active Energy Import T2 64bit', dataType: 'uInt64', unit: 'Wh', cfgdescription: 3, cfgunit: 1, cfgtariff: 2 };
  dataTypes[0x26] = { len: 8, description: 'Active Energy Export T1 64bit', dataType: 'uInt64', unit: 'Wh', cfgdescription: 5, cfgunit: 1, cfgtariff: 1 };
  dataTypes[0x27] = { len: 8, description: 'Active Energy Export T2 64bit', dataType: 'uInt64', unit: 'Wh', cfgdescription: 5, cfgunit: 1, cfgtariff: 2 };
  dataTypes[0x28] = { len: 8, description: 'Reactive Energy Import T1 64bit', dataType: 'uInt64', unit: 'varh', cfgdescription: 10, cfgunit: 5, cfgtariff: 1 };
  dataTypes[0x29] = { len: 8, description: 'Reactive Energy Import T2 64bit', dataType: 'uInt64', unit: 'varh', cfgdescription: 10, cfgunit: 5, cfgtariff: 2 };
  dataTypes[0x2a] = { len: 8, description: 'Reactive Energy Export T1 64bit', dataType: 'uInt64', unit: 'varh', cfgdescription: 13, cfgunit: 5, cfgtariff: 1 };
  dataTypes[0x2b] = { len: 8, description: 'Reactive Energy Export T2 64bit', dataType: 'uInt64', unit: 'varh', cfgdescription: 13, cfgunit: 5, cfgtariff: 2 };
  dataTypes[0xf0] = { len: 1, description: 'errorcode', dataType: 'ErrorCode' };
  dataTypes[0xf1] = { len: 4, description: 'serial-number', dataType: 'MeterSerial' };
  dataTypes[0xf2] = { len: 4, description: 'factor-number', dataType: 'MeterSerial' };
  dataTypes[0xf3] = { len: 2, description: 'current-transformer primary', dataType: 'Uint16', cfgunit: 72 };
  dataTypes[0xf4] = { len: 2, description: 'current-transformer secondary', dataType: 'Uint16', cfgunit: 72 };
  dataTypes[0xf5] = { len: 2, description: 'voltage-transformer primary', dataType: 'Uint16', cfgunit: 72 };
  dataTypes[0xf6] = { len: 2, description: 'voltage-transformer secondary', dataType: 'Uint16', cfgunit: 72 };
  dataTypes[0xf7] = { len: 1, description: 'meter-typ', dataType: 'Uint8' };
  dataTypes[0xf8] = { len: 4, description: 'MID year', dataType: 'BCD' };
  dataTypes[0xf9] = { len: 4, description: 'factory year', dataType: 'BCD' };
  dataTypes[0xfa] = { len: 4, description: 'firmware version', dataType: 'ASCII' };
  dataTypes[0xfb] = { len: 4, description: 'mid-Version', dataType: 'ASCII' };
  dataTypes[0xfc] = { len: 4, description: 'manufacturer', dataType: 'ASCII' };
  dataTypes[0xfd] = { len: 4, description: 'hw-index', dataType: 'ASCII' };
  dataTypes[0xfe] = { len: 4, description: 'systemtime', dataType: 'Uint32' };

  var obj = {};

  var i = 4; //the first 4 bytes is allways the timestamp
  //the last byte is the crc-code so ignore this one
  while (i < data.length - 1) {
    //extract signature byte
    indexOfDataType = data[i];
    dataType = dataTypes[indexOfDataType];
    i++;
    //also save the sort-order value
    dataType.order = indexOfDataType;

    switch (dataType.dataType) {
      case 'Int8':
        dataType.value = Number(getInt8([data[i++]]));
        break;
      case 'Uint8':
        dataType.value = Number(getUint8([data[i++]]));
        break;
      case 'Int16':
        dataType.value = Number(getInt16([data[i++], data[i++]]));
        break;
      case 'Uint16':
        dataType.value = Number(getUint16([data[i++], data[i++]]));
        break;
      case 'Uint32':
        dataType.value = Number(getUint32([data[i++], data[i++], data[i++], data[i++]]));
        break;
      case 'Int32':
        dataType.value = Number(getInt32([data[i++], data[i++], data[i++], data[i++]]));
        break;
      case 'uInt64':
        dataType.value = Number(getUint64([data[i++], data[i++], data[i++], data[i++], data[i++], data[i++], data[i++], data[i++]]));
        break;
      case 'Int64':
        dataType.value = Number(getInt64([data[i++], data[i++], data[i++], data[i++], data[i++], data[i++], data[i++], data[i++]]));
        break;
      case 'MeterSerial':
        dataType.value = Number(getUint8([data[i++]]))
          .toString(16)
          .padStart(2, '0');
        dataType.value =
          Number(getUint8([data[i++]]))
            .toString(16)
            .padStart(2, '0') + dataType.value;
        dataType.value =
          Number(getUint8([data[i++]]))
            .toString(16)
            .padStart(2, '0') + dataType.value;
        dataType.value =
          Number(getUint8([data[i++]]))
            .toString(16)
            .padStart(2, '0') + dataType.value;

        break;
      case 'BCD':
        dataType.value = getBCD([data[i++], data[i++], data[i++], data[i++]]);
        break;
      case 'ASCII':
        dataType.value = getASCII([data[i++], data[i++], data[i++], data[i++]]);
        break;
      case 'ErrorCode':
        dataType.value = Number(getUint8([data[i++]]));
        //also encode the error
        dataType.TimeChanged = dataType.value & 0x01 ? true : false;
        dataType.CTRatioChange = dataType.value & 0x02 ? true : false;
        dataType.VTRatioChange = dataType.value & 0x04 ? true : false;
        dataType.ImpulseWidthChange = dataType.value & 0x08 ? true : false;
        dataType.ImpulseRatioChange = dataType.value & 0x10 ? true : false;
        dataType.PowerFail = dataType.value & 0x20 ? true : false;
        dataType.LogbookFull = dataType.value & 0x80 ? true : false;

        break;
      default:
        break;
    }
    //if we have a factor apply it but keep the old value
    if (dataType.factor && !isNaN(dataType.factor)) {
      var fixed = 0;
      if (dataType.fixed && !isNaN(dataType.fixed)) {
        fixed = dataType.fixed;
      }
      //save the value which was sent by the meter (perhaps needed later)
      dataType.value_raw = dataType.value;
      //calculate the new value using the factor
      dataType.value = Number((dataType.value * dataType.factor).toFixed(fixed));
    }

    obj[dataType.description] = dataType;
    //remove all unused infos like dataType, description, len
    delete dataType.len;
    delete dataType.description;
    delete dataType.dataType;
    delete dataType.factor;
    delete dataType.fixed;
  }

  return obj;
}
function crc8_encode(data) {
  var xorOut = 0x0000;
  var table = [
    0x00, 0x07, 0x0e, 0x09, 0x1c, 0x1b, 0x12, 0x15, 0x38, 0x3f, 0x36, 0x31, 0x24, 0x23, 0x2a, 0x2d, 0x70, 0x77, 0x7e, 0x79, 0x6c, 0x6b, 0x62, 0x65, 0x48, 0x4f, 0x46, 0x41, 0x54, 0x53, 0x5a, 0x5d,
    0xe0, 0xe7, 0xee, 0xe9, 0xfc, 0xfb, 0xf2, 0xf5, 0xd8, 0xdf, 0xd6, 0xd1, 0xc4, 0xc3, 0xca, 0xcd, 0x90, 0x97, 0x9e, 0x99, 0x8c, 0x8b, 0x82, 0x85, 0xa8, 0xaf, 0xa6, 0xa1, 0xb4, 0xb3, 0xba, 0xbd,
    0xc7, 0xc0, 0xc9, 0xce, 0xdb, 0xdc, 0xd5, 0xd2, 0xff, 0xf8, 0xf1, 0xf6, 0xe3, 0xe4, 0xed, 0xea, 0xb7, 0xb0, 0xb9, 0xbe, 0xab, 0xac, 0xa5, 0xa2, 0x8f, 0x88, 0x81, 0x86, 0x93, 0x94, 0x9d, 0x9a,
    0x27, 0x20, 0x29, 0x2e, 0x3b, 0x3c, 0x35, 0x32, 0x1f, 0x18, 0x11, 0x16, 0x03, 0x04, 0x0d, 0x0a, 0x57, 0x50, 0x59, 0x5e, 0x4b, 0x4c, 0x45, 0x42, 0x6f, 0x68, 0x61, 0x66, 0x73, 0x74, 0x7d, 0x7a,
    0x89, 0x8e, 0x87, 0x80, 0x95, 0x92, 0x9b, 0x9c, 0xb1, 0xb6, 0xbf, 0xb8, 0xad, 0xaa, 0xa3, 0xa4, 0xf9, 0xfe, 0xf7, 0xf0, 0xe5, 0xe2, 0xeb, 0xec, 0xc1, 0xc6, 0xcf, 0xc8, 0xdd, 0xda, 0xd3, 0xd4,
    0x69, 0x6e, 0x67, 0x60, 0x75, 0x72, 0x7b, 0x7c, 0x51, 0x56, 0x5f, 0x58, 0x4d, 0x4a, 0x43, 0x44, 0x19, 0x1e, 0x17, 0x10, 0x05, 0x02, 0x0b, 0x0c, 0x21, 0x26, 0x2f, 0x28, 0x3d, 0x3a, 0x33, 0x34,
    0x4e, 0x49, 0x40, 0x47, 0x52, 0x55, 0x5c, 0x5b, 0x76, 0x71, 0x78, 0x7f, 0x6a, 0x6d, 0x64, 0x63, 0x3e, 0x39, 0x30, 0x37, 0x22, 0x25, 0x2c, 0x2b, 0x06, 0x01, 0x08, 0x0f, 0x1a, 0x1d, 0x14, 0x13,
    0xae, 0xa9, 0xa0, 0xa7, 0xb2, 0xb5, 0xbc, 0xbb, 0x96, 0x91, 0x98, 0x9f, 0x8a, 0x8d, 0x84, 0x83, 0xde, 0xd9, 0xd0, 0xd7, 0xc2, 0xc5, 0xcc, 0xcb, 0xe6, 0xe1, 0xe8, 0xef, 0xfa, 0xfd, 0xf4, 0xf3,
  ];
  var crc = 0x0000;
  for (var j = 0; j < data.length; j++) {
    crc = table[crc ^ data[j]];
  }
  return (crc ^ xorOut) & 0xffff;
}
