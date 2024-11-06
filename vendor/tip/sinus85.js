const reg2obisMapping = {
  "1": "1.8.1",
  "2": "2.8.1",
  "3": "3.8.1",
  "4": "4.8.1",
  "5": "1.8.2",
  "6": "2.8.2",
  "7": "3.8.2",
  "8": "4.8.2",
  "9": "1.7.0",
  "10": "3.7.0",
  "11": "9.7.0",
  "12": "14.7.0",
  "13": "13.7.0",
  "14": "T1 Wirk Energie Zähler Import",
  "15": "21.7.0",
  "16": "23.7.0",
  "17": "29.7.0",
  "18": "32.7.0",
  "19": "31.7.0",
  "20": "33.7.0",
  "21": "T1 Wirk Energie Zähler Export",
  "22": "T1 Blind Energie Zähler Import",
  "23": "41.7.0",
  "24": "43.7.0",
  "25": "49.7.0",
  "26": "52.7.0",
  "27": "51.7.0",
  "28": "53.7.0",
  "29": "T1 Blind Energie Zähler Export",
  "30": "T2 Wirk Energie Zähler Import",
  "31": "61.7.0",
  "32": "63.7.0",
  "33": "69.7.0",
  "34": "72.7.0",
  "35": "71.7.0",
  "36": "73.7.0",
  "37": "T2 Wirk Energie Zähler Export",
  "38": "T2 Blind Energie Zähler Import",
  "39": "T2 Blind Energie Zähler Export",
};

const reg2obis = (reg_hex) => reg2obisMapping[reg_hex.toString()] || reg_hex.toString();

function parseHeaders(bytes) {
  const result = {};
  const hex_string = bytes.map(byte => byte.toString(16).padStart(2, '0')).join('');

  // Determine Frame Control
  result.Fctrl = hex_string.substring(0, 2);

  // Determine Number of Registers
  result.Number_Registers = parseInt(hex_string.substring(2, 4), 16) - 2;

  // Determine Control Array Input
  const expectedLength = 2 + 2 + 2 * result.Number_Registers + 8 + 6;
  if (hex_string.length >= expectedLength) {
      result.Control_Array = hex_string.substring(4, 4 + 2 * result.Number_Registers);
  } else {
      return {};
  }

  return result;
}

function padLeadingZeros(num, size) {
var s = num + "";
while (s.length < size) s = "0" + s;
return s;
}

function get_registers(bytes, header) {
  var hex_string = bytes.map(byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase();

  var current_frame_ptr = 12;

  //modular size
  current_frame_ptr = 4 + 2 * parseInt(header.Number_Registers, 16); //fctl 2 + register 2 + Control_Array

  //Check for sufficient data
  if (hex_string.length >= 10 + 2 * (parseInt(header.Number_Registers, 16) - 1)) {
      serial_nr = hex_string.substring(current_frame_ptr, current_frame_ptr + 8);
      current_frame_ptr += 8;

      current_frame_ptr += 6;
  } else {
      return {};
  }

  var range = parseInt(header.Number_Registers, 16);
  var measures = {};
  var _ctl, _endpointstr, _value, _reg;

  for (let i = 1; i <= range; i++) {
      _ctl = "";
      _endpointstr = "";

      _endpointstr = reg2obis(parseInt(header.Control_Array.substring((i - 1) * 2, i * 2), 16).toString(10));

      _value = hex_string.substring(current_frame_ptr, current_frame_ptr + 8);
      _reg = parseInt(_value, 16).toString(10);

      measures[_endpointstr] = _reg;
      current_frame_ptr += 8;
  }

  return measures;
}


function decodeUplink(input) {
//Read Codec Header from Message
var header = parseHeaders(input.bytes);

if (Object.keys(header).length === 0 && header.constructor === Object) {
  return {
    errors: [
      "IIoT Box Decoder: Header decoder returned empty header, stop decoding message",
    ],
  };
}

return {
  data: get_registers(input.bytes, header),
};
}