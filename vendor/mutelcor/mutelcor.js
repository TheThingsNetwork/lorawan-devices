// Decoder for Mutelcor LoRaButton payload

// For machine parsing set keywords to true, this will give keywords instead of text descriptions
var keywords = false;

// TTN v3
function decodeUplink(input) {
  // Decode an uplink message from a buffer (array) of bytes to an object of fields.
  var decoded = MutelcorLoRaButtonDecode(input.bytes, input.fPort);

  var errors = [];
  if (decoded.error !== undefined) {
    errors.push(decoded.error);

    // Also add error description
    errors.push(translation.error_val[decoded.error]);
  }
  if (!keywords) decoded = Descriptions(decoded);
  return {
    data: decoded,
    warnings: [],
    errors: errors,
  };
}

var translation = {
  port: '[01] Port',
  version: '[02] Payload Version',
  voltage: '[03] Voltage Battery/Input [V]',
  opcode: '[04] OpCode',
  opcode_val: {
    0: 'Heartbeat',
    1: 'Alarm',
    2: 'Votes',
    3: 'Measurements',
    4: 'Location',
    5: 'Thresholds',
    6: 'Switch',
    7: 'Reminder',
    112: 'Info',
    113: 'Show',
    114: 'Update',
    128: 'SCD30',
  },
  opcode_noval: 'Unknown OpCode ($)',
  buttons: '[05] Buttons',
  totals: '[06] Button Totals',
  counts: '[07] Button Counts',
  qcrc: '[08] Questions CRC',
  meas: '[09] Measurements',
  temp: '[01] Temperature [°C]',
  rh: '[02] Relative Humidity [%]',
  press: '[03] Pressure [hPa]',
  light: '[04] Light [lx]',
  co2: '[05] CO₂ [ppm]',
  tvoc: '[06] Total Volatile Organic Compound [ppb]',
  dist: '[07] Distance [mm]',
  trigger: '[10] Thresholds Triggered',
  stop: '[11] Thresholds Stopped',
  state: '[12] Switch State',
  state_val: {
    0: 'Off',
    1: 'On',
  },
  state_noval: 'Unknown switch state ($)',
  lat: '[13] Latitude',
  lon: '[14] Longitude',
  info: '[15] Firmware Info',
  ccrc: '[16] Config CRC',
  config: '[17] Configuration',
  confver: '[01] Config layout version',
  conflen: '[02] Config in use length',
  deveui: '[03] LoRaWAN DevEUI',
  appeui: '[04] LoRaWAN AppEUI',
  region: '[05] LoRaWAN Region',
  region_val: {
    0: 'EU868',
    1: 'US915',
    2: 'AU921',
    3: 'AS923-1',
    4: 'IN866',
    5: 'AS923jp',
    6: 'KR920',
    7: 'AS923-2',
    8: 'AS923-3',
    9: 'AS923-4',
  },
  region_noval: 'Unknown region ($)',
  adr: '[06] LoRaWAN ADR',
  adr_val: {
    0: 'Off',
    1: 'On',
  },
  adr_noval: 'Unknown ADR value ($)',
  uport: '[07] LoRaWAN Upload Port',
  hbport: '[08] LoRaWAN Upload Port for heartbeat/reminder',
  confrm: '[09] LoRaWAN Confirm',
  confrm_val: {
    0: 'Off',
    1: 'On',
  },
  confrm_noval: 'Unknown confirm value ($)',
  hbconfrm: '[10] LoRaWAN Confirm heartbeat/reminder',
  hbconfrm_val: {
    0: 'Off',
    1: 'On',
  },
  hbconfrm_noval: 'Unknown confirm value ($)',
  dutycycl: '[11] LoRaWAN Duty cycle',
  dutycycl_val: {
    0: 'Always',
    1: 'Not for new alarm/switch',
    2: 'Not for alarm/switch and retries',
  },
  dutycycl_noval: 'Unknown duty cycle value ($)',
  unittype: '[12] LoRaButton Unit type',
  unittype_val: {
    0: 'Alarm Unit',
    1: 'Vote Unit',
    2: 'Switch Unit',
  },
  unittype_noval: 'Unknown unit type value ($)',
  numbut: '[13] LoRaButton Number of buttons',
  butitv: '[14] LoRaButton Button press and switch interval [sec]',
  buztog: '[15] LoRaButton Button / switch on buzzer feedback toggle interval [sec]',
  buzdur: '[16] LoRaButton Button / switch on buzzer feedback duration [sec]',
  ledtog: '[17] LoRaButton Button / switch on LED feedback toggle interval [sec]',
  leddur: '[18] LoRaButton Button / switch on LED feedback duration [sec]',
  alretr: '[19] LoRaButton Alarm / switch on retries',
  alretitv: '[20] LoRaButton Alarm / switch retry interval [sec]',
  butpin: '[21] LoRaButton Button $ pin',
  butpin_val: {
    255: 'No pin',
  },
  ledpin: '[22] LoRaButton Button $ LED pin',
  ledpin_val: {
    255: 'No pin',
  },
  voteaitv: '[23] LoRaButton Vote accumulation interval [sec]',
  voteathr: '[24] LoRaButton Vote accumulation threshold per button',
  mtitv: '[25] LoRaButton heartbeat/measurement/reminder interval base [sec]',
  stdel: '[26] LoRaButton Start heartbeat/measurement/reminder delay [sec]',
  amtitv: '[27] LoRaButton heartbeat/measurement/reminder interval extra [sec]',
  senspow: '[28] LoRaButton Sensors power pin',
  senspow_val: {
    255: 'No pin',
  },
  tcitv: '[29] LoRaButton Sensor Threshold check interval [sec]',
  tmeas: '[30] LoRaButton Sensor Threshold $ measurement',
  tmeas_val: {
    4: 'CO₂ [ppm]',
    6: 'Distance [mm]',
    255: 'None/disabled',
  },
  tmeas_noval: 'Unknown Thresholds Measurement value ($)',
  ttval: '[31] LoRaButton Sensor Threshold $ trigger value',
  tsval: '[32] LoRaButton Sensor Threshold $ stop value',
  tbuztog: '[33] LoRaButton Sensor Threshold $ buzzer toggle interval [sec]',
  tbuzdur: '[34] LoRaButton Sensor Threshold $ buzzer duration [sec]',
  tbuzrem: '[35] LoRaButton Sensor Threshold $ buzzer reminder interval [sec]',
  tledpin: '[36] LoRaButton Sensor Threshold $ LED pin',
  tledpin_val: {
    255: 'No pin',
  },
  tledtog: '[37] LoRaButton Sensor Threshold $ LED toggle interval [sec]',
  tleddur: '[38] LoRaButton Sensor Threshold $ LED duration [sec]',
  tledrem: '[39] LoRaButton Sensor Threshold $ LED reminder interval [sec]',
  subband: '[40] LoRaWAN Sub Band for US like regions (1-8)',
  subband_val: {
    0: 'No subband direction',
  },
  scd30tmp: '[41] LoRaButton Sensor SCD30 Temperature Offset [°C]',
  scd30alt: '[42] LoRaButton Sensor SCD30 Altitude [m]',
  power: '[43] LoRaButton Power',
  power_val: {
    0: 'External Power',
    1: '2 x AA Alkaline',
    2: '2 x AA Lithium 1.5 Volt',
  },
  ofbuztog: '[44] LoRaButton Switch off buzzer feedback toggle interval [sec]',
  ofbuzdur: '[45] LoRaButton Switch off buzzer feedback duration [sec]',
  onledpin: '[46] LoRaButton Switch on LED pin',
  onledpin_val: {
    255: 'No pin',
  },
  ofledpin: '[47] LoRaButton Switch off LED pin',
  ofledpin_val: {
    255: 'No pin',
  },
  ofledtog: '[48] LoRaButton Switch off LED feedback toggle interval [sec]',
  ofleddur: '[49] LoRaButton Switch off LED feedback duration [sec]',
  ofretr: '[50] LoRaButton Switch off retries',
  ncbuztog: '[51] LoRaButton Alarm No Confirmation buzzer feedback toggle interval [sec]',
  ncbuzdur: '[52] LoRaButton Alarm No Confirmation buzzer feedback duration [sec]',
  ncledpin: '[53] LoRaButton Alarm No Confirmation LED pin',
  ncledpin_val: {
    255: 'No pin',
  },
  ncledtog: '[54] LoRaButton Alarm No Confirmation LED feedback toggle interval [sec]',
  ncleddur: '[55] LoRaButton Alarm No Confirmation LED feedback duration [sec]',
  cbuztog: '[56] LoRaButton Alarm Confirmation buzzer feedback toggle interval [sec]',
  cbuzdur: '[57] LoRaButton Alarm Confirmation buzzer feedback duration [sec]',
  cledpin: '[58] LoRaButton Alarm Confirmation LED pin',
  cledpin_val: {
    255: 'No pin',
  },
  cledtog: '[59] LoRaButton Alarm Confirmation LED feedback toggle interval [sec]',
  cleddur: '[60] LoRaButton Alarm Confirmation LED feedback duration [sec]',
  choldoff: '[61] LoRaButton Alarm Confirmation feedback holdoff [sec]',
  result: '[18] Update Result',
  result_val: {
    0: 'Success',
    1: 'Incomplete (update length exceeds payload)',
    2: 'Failed (not writable or position error)',
    3: 'No length field',
    4: 'Failed (max heartbeat/measurement/reminder interval increase more than double)',
  },
  result_noval: 'Unknown update result ($)',
  succcnt: '[19] Update Success count',
  scd30result: '[20] SCD30 Result',
  scd30result_val: {
    0: 'Success',
    1: 'Start Timeout',
    2: 'Address Timeout',
    3: 'Data Timeout',
    7: 'Stop Timeout',
    32: 'Address NACK',
    48: 'Data NACK',
    56: 'Arbitration lost',
  },
  alarmid: '[21] Alarm ID',
  left: '[88] Undecoded Payload Left [hex]',
  error: '[89] Decode error',
  error_val: {
    0: 'Empty',
    10: 'Unexpected end, no (complete) voltage',
    20: 'Unexpected end, no OpCode',
    30: 'Unknown OpCode',
    40: 'Unexpected end, OpCode Votes requires #Buttons',
    50: 'Too many buttons, maximum is 12',
    60: 'Unexpected end, incomplete Button Totals',
    70: 'Unexpected end, incomplete Button Counts',
    80: 'Unexpected end, OpCode Measurements/Thresholds requires Measurements',
    90: 'Unexpected end, measurements without (complete) Temperature value',
    100: 'Unexpected end, measurements without Relative Humidity value',
    110: 'Unexpected end, measurements without (complete) Pressure value',
    120: 'Unexpected end, measurements without (complete) Light value',
    130: 'Unexpected end, measurements without (complete) CO₂ value',
    140: 'Unexpected end, measurements without (complete) TVOC value',
    143: 'Unexpected end, measurements without (complete) Distance value',
    150: 'Unexpected end, OpCode Thresholds requires Threshold info',
    160: 'Unexpected end, OpCode Location requires (complete) Latitude',
    170: 'Unexpected end, OpCode Location requires (complete) Longitude',
    175: 'Unexpected end, OpCode Switch/Reminder requires Switch State',
    180: 'Unexpected end, OpCode Show/Update require (complete) CRC',
    190: 'Unexpected end, OpCode Show requires Config Start',
    200: 'Unexpected end, OpCode Show requires Config Length',
    210: 'Unexpected end, OpCode Show without (complete) Config Content',
    220: 'Unexpected end, OpCode Update requires Update Result',
    230: 'Unknown Update Result',
    240: 'Unexpected end, OpCode SCD30 requires SCD30 Result',
  },
  hex: '[99] Complete payload [hex]',
};

function Descriptions(decode) {
  if (decode === null || typeof decode !== 'object' || Array.isArray(decode)) return decode;
  var descriptions = {};
  for (var key in decode) {
    var value = Descriptions(decode[key]);
    var labels = key.split('_');
    var description = translation[labels[0]];
    if (description !== undefined && description !== null) {
      for (var label = 1; label < labels.length; label += 1) {
        description = description.replace('$', labels[label]);
      }
      key = description;
    }
    var value_descriptions = translation[labels[0] + '_val'];
    if (value_descriptions !== undefined && value_descriptions !== null) {
      var value_description = value_descriptions[value];
      if (value_description === undefined) {
        var value_nodescription = translation[labels[0] + '_noval'];
        if (value_nodescription !== undefined && value_nodescription !== null) value = value_nodescription.replace('$', value);
      } else {
        value = value_description;
      }
    }
    descriptions[key] = value;
  }
  return descriptions;
}

function MutelcorLoRaButtonDecode(bytes, port) {
  var decoded = {};
  var pos = 0;
  decoded.hex = toHexMSBF(bytes);
  decoded.port = port;
  if (bytes.length === 0) {
    decoded.error = 0;
    return addPayloadLeft(decoded, bytes, pos);
  }
  decoded.version = bytes[pos++];
  if (bytes.length < pos + 2) {
    decoded.error = 10;
    return addPayloadLeft(decoded, bytes, pos);
  }
  decoded.voltage = (bytes[pos++] * 256 + bytes[pos++]) / 100;
  if (bytes.length < pos + 1) {
    decoded.error = 20;
    return addPayloadLeft(decoded, bytes, pos);
  }
  var opcode = bytes[pos++];
  decoded.opcode = opcode;
  if (!(opcode in translation.opcode_val)) decoded.error = 30;
  if (decoded.opcode === 1 && pos + 1 == bytes.length) {
    decoded.buttons = ['1', '2', '3', '4', '5', '6', '7', '8'].filter(bitmaskFilter, bytes[pos++]);
  }
  if (decoded.opcode === 1 && pos + 2 == bytes.length) {
    decoded.alarmid = bytes[pos++] * 256 + bytes[pos++];
  }
  if (decoded.opcode === 2 && bytes.length < pos + 1) {
    decoded.error = 40;
    return addPayloadLeft(decoded, bytes, pos);
  }
  if (decoded.opcode === 2 || (decoded.opcode === 0 && pos + 1 <= bytes.length)) {
    var buttons = bytes[pos++];
    decoded.buttons = buttons;
    if (12 < buttons) {
      decoded.error = 50;
      return addPayloadLeft(decoded, bytes, pos);
    }
    decoded.totals = {};
    for (var button = 1; button <= buttons; button += 1) {
      if (bytes.length < pos + 2) {
        decoded.error = 60;
        return addPayloadLeft(decoded, bytes, pos);
      }
      if (pos + 2 <= bytes.length) {
        decoded.totals[button] = bytes[pos++] * 256 + bytes[pos++];
      }
    }
    if (decoded.opcode === 2) {
      decoded.counts = {};
      for (button = 1; button <= buttons; button += 1) {
        if (bytes.length < pos + 1) {
          decoded.error = 70;
          return addPayloadLeft(decoded, bytes, pos);
        }
        decoded.counts[button] = bytes[pos++];
      }
      if (pos + 4 <= bytes.length) {
        decoded.qcrc = ((bytes[pos++] * 256 + bytes[pos++]) * 256 + bytes[pos++]) * 256 + bytes[pos++];
      }
    }
  }
  if (decoded.opcode === 3 || decoded.opcode === 5) {
    if (bytes.length < pos + 1) {
      decoded.error = 80;
      return addPayloadLeft(decoded, bytes, pos);
    }
    decoded.meas = {};
    var measurements = bytes[pos++];
    if (measurements & 1) {
      if (bytes.length < pos + 2) {
        decoded.error = 90;
        return addPayloadLeft(decoded, bytes, pos);
      }
      decoded.meas.temp = (bytes[pos++] * 256 + bytes[pos++]) / 10;
    }
    if (measurements & 2) {
      if (bytes.length < pos + 1) {
        decoded.error = 100;
        return addPayloadLeft(decoded, bytes, pos);
      }
      decoded.meas.rh = bytes[pos++];
    }
    if (measurements & 4) {
      if (bytes.length < pos + 2) {
        decoded.error = 110;
        return addPayloadLeft(decoded, bytes, pos);
      }
      decoded.meas.press = (bytes[pos++] * 256 + bytes[pos++]) / 10;
    }
    if (measurements & 8) {
      if (bytes.length < pos + 2) {
        decoded.error = 120;
        return addPayloadLeft(decoded, bytes, pos);
      }
      decoded.meas.light = bytes[pos++] * 256 + bytes[pos++];
    }
    if (measurements & 16) {
      if (bytes.length < pos + 2) {
        decoded.error = 130;
        return addPayloadLeft(decoded, bytes, pos);
      }
      decoded.meas.co2 = bytes[pos++] * 256 + bytes[pos++];
    }
    if (measurements & 32) {
      if (bytes.length < pos + 2) {
        decoded.error = 140;
        return addPayloadLeft(decoded, bytes, pos);
      }
      decoded.meas.tvoc = bytes[pos++] * 256 + bytes[pos++];
    }
    if (measurements & 64) {
      if (bytes.length < pos + 2) {
        decoded.error = 143;
        return addPayloadLeft(decoded, bytes, pos);
      }
      decoded.meas.dist = bytes[pos++] * 256 + bytes[pos++];
    }
    if (decoded.opcode === 5) {
      if (bytes.length < pos + 1) {
        decoded.error = 150;
        return addPayloadLeft(decoded, bytes, pos);
      }
      var threshold_info = bytes[pos++];
      var triggered = ['1', '2', '3', '4'].filter(bitmaskFilter, threshold_info & 0x0f);
      if (triggered && 0 < triggered.length) decoded.trigger = triggered;
      var stopped = ['1', '2', '3', '4'].filter(bitmaskFilter, threshold_info >> 4);
      if (stopped && 0 < stopped.length) decoded.stop = stopped;
    }
    if (pos + 1 <= bytes.length) {
      decoded.state = bytes[pos++];
    }
  }
  if (decoded.opcode === 4) {
    if (bytes.length < pos + 4) {
      decoded.error = 160;
      return addPayloadLeft(decoded, bytes, pos);
    }
    decoded.lat = ((bytes[pos++] * 256 + bytes[pos++]) * 256 + bytes[pos++]) * 256 + bytes[pos++];
    if (decoded.lat > 2147483647) decoded.lat -= 4294967296;
    decoded.lat /= 10000000;
    if (bytes.length < pos + 4) {
      decoded.error = 170;
      return addPayloadLeft(decoded, bytes, pos);
    }
    decoded.lon = ((bytes[pos++] * 256 + bytes[pos++]) * 256 + bytes[pos++]) * 256 + bytes[pos++];
    if (decoded.lon > 2147483647) decoded.lon -= 4294967296;
    decoded.lon /= 10000000;
  }
  if (decoded.opcode === 6 || decoded.opcode === 7) {
    if (bytes.length < pos + 1) {
      decoded.error = 175;
      return addPayloadLeft(decoded, bytes, pos);
    }
    decoded.state = bytes[pos++];
  }
  if (decoded.opcode === 112) {
    var info = '';
    while (pos < bytes.length) {
      info += String.fromCharCode(bytes[pos++]);
    }
    decoded.info = info;
  }
  if (decoded.opcode === 113 || decoded.opcode === 114) {
    if (bytes.length < pos + 2) {
      decoded.error = 180;
      return addPayloadLeft(decoded, bytes, pos);
    }
    decoded.ccrc = bytes[pos++] * 256 + bytes[pos++];
    if (decoded.opcode === 113) {
      if (bytes.length < pos + 1) {
        decoded.error = 190;
        return addPayloadLeft(decoded, bytes, pos);
      }
      var config_start = bytes[pos++];
      if (bytes.length < pos + 1) {
        decoded.error = 200;
        return addPayloadLeft(decoded, bytes, pos);
      }
      var config_length = bytes[pos++];
      decoded.config = {};
      var config_index = config_start;
      var config_end = config_start + config_length;
      if (bytes.length < pos + config_length) config_end = config_start + bytes.length - pos;
      while (config_index < config_end) {
        var field = null;
        var value = bytes[pos];
        var shift = 1;
        var config_pos = config_index;
        if (51 <= config_index && config_index <= 62) config_pos = 51;
        if (63 <= config_index && config_index <= 74) config_pos = 63;
        if (82 <= config_index && config_index <= 85) config_pos = 82;
        if (86 <= config_index && config_index <= 93) config_pos = 86;
        if (94 <= config_index && config_index <= 101) config_pos = 94;
        if (102 <= config_index && config_index <= 105) config_pos = 102;
        if (106 <= config_index && config_index <= 109) config_pos = 106;
        if (110 <= config_index && config_index <= 113) config_pos = 110;
        if (114 <= config_index && config_index <= 117) config_pos = 114;
        if (118 <= config_index && config_index <= 121) config_pos = 118;
        if (122 <= config_index && config_index <= 125) config_pos = 122;
        if (126 <= config_index && config_index <= 129) config_pos = 126;
        var index = config_index - config_pos;
        switch (config_pos) {
          case 0:
            field = 'confver';
            break;
          case 1:
            if (config_index + 2 <= config_end) {
              field = 'conflen';
              value += bytes[pos + 1] * 256;
              shift = 2;
            }
            break;
          case 3:
            if (config_index + 8 <= config_end) {
              field = 'deveui';
              value = toHexLSBF(bytes.slice(pos), 8);
              shift = 8;
            }
            break;
          case 11:
            if (config_index + 8 <= config_end) {
              field = 'appeui';
              value = toHexLSBF(bytes.slice(pos), 8);
              shift = 8;
            }
            break;
          case 35:
            field = 'region';
            break;
          case 36:
            field = 'adr';
            break;
          case 37:
            field = 'uport';
            break;
          case 38:
            field = 'hbport';
            break;
          case 39:
            field = 'confrm';
            break;
          case 40:
            field = 'hbconfrm';
            break;
          case 41:
            field = 'dutycycl';
            break;
          case 42:
            field = 'unittype';
            break;
          case 43:
            field = 'numbut';
            break;
          case 44:
            field = 'butitv';
            value /= 4;
            break;
          case 45:
            field = 'buztog';
            value /= 4;
            break;
          case 46:
            field = 'buzdur';
            value /= 4;
            break;
          case 47:
            field = 'ledtog';
            value /= 4;
            break;
          case 48:
            field = 'leddur';
            value /= 4;
            break;
          case 49:
            field = 'alretr';
            break;
          case 50:
            field = 'alretitv';
            break;
          case 51:
            field = 'butpin_' + ('0' + (index + 1)).slice(-2);
            break;
          case 63:
            field = 'ledpin_' + ('0' + (index + 1)).slice(-2);
            break;
          case 75:
            field = 'voteaitv';
            value *= 15;
            break;
          case 76:
            field = 'voteathr';
            break;
          case 77:
            field = 'mtitv';
            value *= 360;
            break;
          case 78:
            field = 'stdel';
            value *= 15;
            break;
          case 79:
            field = 'amtitv';
            value *= 2;
            break;
          case 80:
            field = 'senspow';
            break;
          case 81:
            field = 'tcitv';
            value /= 4;
            break;
          case 82:
            field = 'tmeas_' + (index + 1);
            break;
          case 86:
            if (config_index + 2 <= config_end) {
              field = 'ttval_' + ((index >> 1) + 1);
              value += bytes[pos + 1] * 256;
              shift = 2;
            }
            break;
          case 94:
            if (config_index + 2 <= config_end) {
              field = 'tsval_' + ((index >> 1) + 1);
              value += bytes[pos + 1] * 256;
              shift = 2;
            }
            break;
          case 102:
            field = 'tbuztog_' + (index + 1);
            value /= 4;
            break;
          case 106:
            field = 'tbuzdur_' + (index + 1);
            value /= 4;
            break;
          case 110:
            field = 'tbuzrem_' + (index + 1);
            value *= 60;
            break;
          case 114:
            field = 'tledpin_' + (index + 1);
            break;
          case 118:
            field = 'tledtog_' + (index + 1);
            value /= 4;
            break;
          case 122:
            field = 'tleddur_' + (index + 1);
            value /= 4;
            break;
          case 126:
            field = 'tledrem_' + (index + 1);
            value *= 60;
            break;
          case 130:
            field = 'subband';
            break;
          case 131:
            field = 'scd30tmp';
            value /= 10;
            break;
          case 132:
            field = 'scd30alt';
            value *= 10;
            break;
          case 133:
            field = 'power';
            break;
          case 134:
            field = 'ofbuztog';
            value /= 4;
            break;
          case 135:
            field = 'ofbuzdur';
            value /= 4;
            break;
          case 136:
            field = 'onledpin';
            break;
          case 137:
            field = 'ofledpin';
            break;
          case 138:
            field = 'ofledtog';
            value /= 4;
            break;
          case 139:
            field = 'ofleddur';
            value /= 4;
            break;
          case 140:
            field = 'ofretr';
            break;
          case 141:
            field = 'ncbuztog';
            value /= 16;
            break;
          case 142:
            field = 'ncbuzdur';
            value /= 4;
            break;
          case 143:
            field = 'ncledpin';
            break;
          case 144:
            field = 'ncledtog';
            value /= 16;
            break;
          case 145:
            field = 'ncleddur';
            value /= 4;
            break;
          case 146:
            field = 'cbuztog';
            value /= 16;
            break;
          case 147:
            field = 'cbuzdur';
            value /= 4;
            break;
          case 148:
            field = 'cledpin';
            break;
          case 149:
            field = 'cledtog';
            value /= 16;
            break;
          case 150:
            field = 'cleddur';
            value /= 4;
            break;
          case 151:
            field = 'choldoff';
            value /= 4;
            break;
        }
        if (field !== null) decoded.config[field] = value;
        pos += shift;
        config_index += shift;
      }
      if (config_index < config_start + config_length) {
        decoded.error = 210;
        return addPayloadLeft(decoded, bytes, pos);
      }
    }
    if (decoded.opcode === 114) {
      if (bytes.length < pos + 1) {
        decoded.error = 220;
        return addPayloadLeft(decoded, bytes, pos);
      }
      var result = bytes[pos++];
      decoded.result = result;
      if (!(result in translation.result_val)) decoded.error = 230;
      // Success count was added in version 1.4.1, to be backwards compatible we don't give an error when omitted
      if (pos < bytes.length) {
        decoded.succcnt = bytes[pos++];
      }
    }
  }
  if (decoded.opcode === 128) {
    if (bytes.length < pos + 1) {
      decoded.error = 240;
      return addPayloadLeft(decoded, bytes, pos);
    }
    decoded.scd30result = bytes[pos++];
  }
  return addPayloadLeft(decoded, bytes, pos);
}

function addPayloadLeft(decoded, bytes, pos) {
  if (pos < bytes.length) decoded.left = toHexMSBF(bytes.slice(pos));
  return decoded;
}

function bitmaskFilter(value, pos) {
  return this & (1 << pos);
}

function toHexMSBF(buf, len) {
  if (len === undefined) len = buf.length;
  var output = '';
  for (var i = 0; i < len; i += 1) {
    output += ('0' + buf[i].toString(16).toUpperCase()).slice(-2);
  }
  return output;
}

function toHexLSBF(buf, len) {
  if (len === undefined) len = buf.length;
  var output = '';
  for (var i = len - 1; 0 <= i; i -= 1) {
    output += ('0' + buf[i].toString(16).toUpperCase()).slice(-2);
  }
  return output;
}
