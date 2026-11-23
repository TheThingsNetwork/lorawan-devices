function datalog(i, bytes) {
  var aa = bytes[0 + i] & 0x02 ? 'TRUE' : 'FALSE';
  var bb = bytes[0 + i] & 0x01 ? 'OPEN' : 'CLOSE';
  var cc = ((bytes[1 + i] << 16) | (bytes[2 + i] << 8) | bytes[3 + i]).toString(10);
  var dd = ((bytes[4 + i] << 16) | (bytes[5 + i] << 8) | bytes[6 + i]).toString(10);
  var ee = getMyDate((((bytes[7 + i] << 24) | (bytes[8 + i] << 16) | (bytes[9 + i] << 8) | bytes[10 + i]) >>> 0).toString(10));
  var string = '[' + aa + ',' + bb + ',' + cc + ',' + dd + ',' + ee + ']' + ',';

  return string;
}

function getzf(c_num) {
  if (parseInt(c_num) < 10) c_num = '0' + c_num;

  return c_num;
}

function getMyDate(str) {
  var c_Date;
  if (str > 9999999999) c_Date = new Date(parseInt(str));
  else c_Date = new Date(parseInt(str) * 1000);

  var c_Year = c_Date.getFullYear(),
    c_Month = c_Date.getMonth() + 1,
    c_Day = c_Date.getDate(),
    c_Hour = c_Date.getHours(),
    c_Min = c_Date.getMinutes(),
    c_Sen = c_Date.getSeconds();
  var c_Time = c_Year + '-' + getzf(c_Month) + '-' + getzf(c_Day) + ' ' + getzf(c_Hour) + ':' + getzf(c_Min) + ':' + getzf(c_Sen);

  return c_Time;
}

function decodeUplink(input) {
  var port = input.fPort;
  var bytes = input.bytes;
  var decode = {};

  switch (port) {
    case 2: {
      if (bytes.length != 11) {
        return { errors: ['Invalid Payload Length: ' + bytes.length] };
      }

      decode.Node_type = 'LDS03A';
      decode.ALARM = bytes[0] & 0x02 ? 'TRUE' : 'FALSE';
      decode.DOOR_OPEN_STATUS = bytes[0] & 0x01 ? 'OPEN' : 'CLOSE';
      decode.DOOR_OPEN_TIMES = (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
      decode.LAST_DOOR_OPEN_DURATION = (bytes[4] << 16) | (bytes[5] << 8) | bytes[6];
      decode.TIME = getMyDate(((bytes[7] << 24) | (bytes[8] << 16) | (bytes[9] << 8) | bytes[10]).toString(10));
      return { data: decode };
    }

    case 3: {
      decode.Node_type = 'LDS03A';
      for (var i = 0; i < bytes.length; i = i + 11) {
        var da = datalog(i, bytes);
        if (i == '0') decode.DATALOG = da;
        else decode.DATALOG += da;
      }
      return { data: decode };
    }

    case 4: {
      decode.TDC = (bytes[0] << 16) | (bytes[1] << 8) | bytes[2];
      decode.DISALARM = bytes[3] & 0x01;
      decode.KEEP_STATUS = bytes[4] & 0x01;
      decode.KEEP_TIME = (bytes[5] << 8) | bytes[6];
      return { data: decode };
    }

    case 5: {
      if (bytes[0] == 0x0a) decode.SENSOR_MODEL = 'LDS03A';

      if (bytes[4] == 0xff) decode.SUB_BAND = 'NULL';
      else decode.SUB_BAND = bytes[4];

      if (bytes[3] == 0x01) decode.FREQUENCY_BAND = 'EU868';
      else if (bytes[3] == 0x02) decode.FREQUENCY_BAND = 'US915';
      else if (bytes[3] == 0x03) decode.FREQUENCY_BAND = 'IN865';
      else if (bytes[3] == 0x04) decode.FREQUENCY_BAND = 'AU915';
      else if (bytes[3] == 0x05) decode.FREQUENCY_BAND = 'KZ865';
      else if (bytes[3] == 0x06) decode.FREQUENCY_BAND = 'RU864';
      else if (bytes[3] == 0x07) decode.FREQUENCY_BAND = 'AS923';
      else if (bytes[3] == 0x08) decode.FREQUENCY_BAND = 'AS923_1';
      else if (bytes[3] == 0x09) decode.FREQUENCY_BAND = 'AS923_2';
      else if (bytes[3] == 0x0a) decode.FREQUENCY_BAND = 'AS923_3';
      else if (bytes[3] == 0x0b) decode.FREQUENCY_BAND = 'CN470';
      else if (bytes[3] == 0x0c) decode.FREQUENCY_BAND = 'EU433';
      else if (bytes[3] == 0x0d) decode.FREQUENCY_BAND = 'KR920';
      else if (bytes[3] == 0x0e) decode.FREQUENCY_BAND = 'MA869';

      decode.FIRMWARE_VERSION = (bytes[1] & 0x0f) + '.' + ((bytes[2] >> 4) & 0x0f) + '.' + (bytes[2] & 0x0f);
      decode.BAT = ((bytes[5] << 8) | bytes[6]) / 1000;
      return { data: decode };
    }

    default:
      return { errors: ['Unsupported fPort: ' + port] };
  }
}
