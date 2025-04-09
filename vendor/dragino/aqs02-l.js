function decodeUplink(input) {
  var port = input.fPort;
  var bytes = input.bytes;
  var mode = (bytes[6] & 0x7c) >> 2;
  var data = {};
  function datalog(i, bytes) {
    var aa = parseFloat(((((bytes[4 + i] << 24) >> 16) | bytes[5 + i]) / 10).toFixed(1));
    var bb = parseFloat((((bytes[2 + i] << 8) | bytes[3 + i]) / 10).toFixed(1));
    var cc = parseFloat((bytes[0 + i] << 8) | bytes[1 + i]);
    var dd = getMyDate(((bytes[7 + i] << 24) | (bytes[8 + i] << 16) | (bytes[9 + i] << 8) | bytes[10 + i]).toString(10));
    var string = '[' + aa + ',' + bb + ',' + cc + ',' + dd + ']' + ',';

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
  switch (input.fPort) {
    case 2:
      data.BatV = ((bytes[0] << 8) | bytes[1]) / 1000;
      data.temperature = parseFloat(((((bytes[2] << 24) >> 16) | bytes[3]) / 10).toFixed(1));
      data.humidity = parseFloat((((bytes[4] << 8) | bytes[5]) / 10).toFixed(1));
      data.air_pressure = parseFloat((((bytes[6] << 8) | bytes[7]) / 10).toFixed(1));
      data.co2 = (bytes[8] << 8) | bytes[9];
      data.TEMPL_flag = bytes[10] & 0x08 ? 'True' : 'False';
      data.TEMPH_flag = bytes[10] & 0x04 ? 'True' : 'False';
      data.CO2L_flag = bytes[10] & 0x02 ? 'True' : 'False';
      data.CO2H_flag = bytes[10] & 0x01 ? 'True' : 'False';

      if (bytes.length == 11)
        return {
          data: data,
        };
      break;
    case 3:
      var pnack = (bytes[6] >> 7) & 0x01 ? 'True' : 'False';
      for (var i = 0; i < bytes.length; i = i + 11) {
        var data1 = datalog(i, bytes);
        if (i == '0') data_sum = data1;
        else data_sum += data1;
      }

      data.DATALOG = data_sum;
      data.PNACKMD = pnack;
      return {
        data: data,
      };

      break;

    case 5:
      {
        if (bytes[0] == 0x37) data.SENSOR_MODEL = 'AQS01-L';

        if (bytes[4] == 0xff) data.SUB_BAND = 'NULL';
        else data.SUB_BAND = bytes[4];

        if (bytes[3] == 0x01) data.FREQUENCY_BAND = 'EU868';
        else if (bytes[3] == 0x02) data.FREQUENCY_BAND = 'US915';
        else if (bytes[3] == 0x03) data.FREQUENCY_BAND = 'IN865';
        else if (bytes[3] == 0x04) data.FREQUENCY_BAND = 'AU915';
        else if (bytes[3] == 0x05) data.FREQUENCY_BAND = 'KZ865';
        else if (bytes[3] == 0x06) data.FREQUENCY_BAND = 'RU864';
        else if (bytes[3] == 0x07) data.FREQUENCY_BAND = 'AS923';
        else if (bytes[3] == 0x08) data.FREQUENCY_BAND = 'AS923_1';
        else if (bytes[3] == 0x09) data.FREQUENCY_BAND = 'AS923_2';
        else if (bytes[3] == 0x0a) data.FREQUENCY_BAND = 'AS923_3';
        else if (bytes[3] == 0x0b) data.FREQUENCY_BAND = 'CN470';
        else if (bytes[3] == 0x0c) data.FREQUENCY_BAND = 'EU433';
        else if (bytes[3] == 0x0d) data.FREQUENCY_BAND = 'KR920';
        else if (bytes[3] == 0x0e) data.FREQUENCY_BAND = 'MA869';

        data.FIRMWARE_VERSION = (bytes[1] & 0x0f) + '.' + ((bytes[2] >> 4) & 0x0f) + '.' + (bytes[2] & 0x0f);
        data.BAT = ((bytes[5] << 8) | bytes[6]) / 1000;
      }
      return {
        data: data,
      };
      break;

    default:
      return {
        errors: ['unknown FPort'],
      };
  }
}
