function decodeUplink(input) {
  var port = input.fPort;
  var bytes = input.bytes;
  var mode = (bytes[6] & 0x7c) >> 2;
  var data = {};
  function datalog(i, bytes) {
    var aa = parseFloat(((((bytes[3 + i] << 24) >> 16) | bytes[4 + i]) / 10).toFixed(1));
    var bb = parseFloat((((bytes[5 + i] << 8) | bytes[6 + i]) / 10).toFixed(1));
    var cc = getMyDate(((bytes[7 + i] << 24) | (bytes[8 + i] << 16) | (bytes[9 + i] << 8) | bytes[10 + i]).toString(10));
    var string = '[' + aa + ',' + bb + ',' + cc + ']' + ',';

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
      data.batV = ((bytes[0] << 8) | bytes[1]) / 1000;
      data.Data_time = getMyDate(((bytes[2] << 24) | (bytes[3] << 16) | (bytes[4] << 8) | bytes[5]).toString(10));
      data.integer = (bytes[6] << 24) | (bytes[7] << 16) | (bytes[8] << 8) | bytes[9];
      data.decimal = (bytes[10] << 24) | (bytes[11] << 16) | (bytes[12] << 8) | bytes[13];
      if (decimal < 100000) {
        reading = integer + decimal / 100000;
      } else if (decimal > 99999 && decimal < 1000000) {
        reading = integer + decimal / 1000000;
      } else if (decimal > 999999 && decimal < 10000000) {
        reading = integer + decimal / 10000000;
      }
      return {
        data: data,
      };
      break;
    case 3:
      data.batV = ((bytes[4] << 8) | bytes[5]) / 1000;
      data.Data_time = getMyDate(((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]).toString(10));
      data.total_packages = bytes[6];
      data.subcontracting_count = bytes[7];
      if (decimal < 10000) {
        reading = integer + decimal / 10000;
      } else if (decimal > 99999 && decimal < 1000000) {
        reading = integer + decimal / 1000000;
      } else if (decimal > 999999 && decimal < 10000000) {
        reading = integer + decimal / 10000000;
      }
      return {
        data: data,
      };

      break;
    case 4:
      data.batV = ((bytes[0] << 8) | bytes[1]) / 1000;
      var dataTimes = [];
      var integers = [];
      var decimals = [];
      var readings = [];

      // Process Data_time and initialize integers & decimals
      for (let i = 0; i < 32; i++) {
        let startIndex = 2 + i * 12; // Calculate starting index for each set
        dataTimes.push(getMyDate(((bytes[startIndex] << 24) | (bytes[startIndex + 1] << 16) | (bytes[startIndex + 2] << 8) | bytes[startIndex + 3]).toString(10)));
        integers.push((bytes[startIndex + 7] << 24) | (bytes[startIndex + 6] << 16) | (bytes[startIndex + 5] << 8) | bytes[startIndex + 4]);
        decimals.push((bytes[startIndex + 11] << 24) | (bytes[startIndex + 10] << 16) | (bytes[startIndex + 9] << 8) | bytes[startIndex + 8]);
      }

      // Process readings based on conditions
      for (let i = 0; i < 32; i++) {
        if (decimals[i] < 100000) {
          readings.push(integers[i] + decimals[i] / 1000);
        } else if (decimals[i] > 99999 && decimals[i] < 1000000) {
          readings.push(integers[i] + decimals[i] / 1000000);
        } else if (decimals[i] > 9999999 && decimals[i] < 10000000) {
          readings.push(integers[i] + decimals[i] / 10000000);
        }
      }
      // Prepare the result object
      var result = {};
      if (dataTimes.some((time) => time !== null)) {
        // Assuming getMyDate returns null or a valid date object/time
        result.Data_Times = dataTimes.filter((time) => time !== '1970-01-01 00:00:00');
      }
      if (readings.some((reading) => reading !== 0)) {
        result.Readings = readings.filter((reading) => reading !== 0);
      }
      return {
        data: result,
      };
      break;
    case 5:
      {
        if (bytes[0] == 0x38) data.SENSOR_MODEL = 'AIS01_LB';

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
    case 6:
      var dataTimes = [];
      var integers = [];
      var decimals = [];
      var readings = [];

      // Process Data_time and initialize integers & decimals
      for (let i = 0; i < 3324; i++) {
        let startIndex = i * 12; // Calculate starting index for each set
        dataTimes.push(getMyDate(((bytes[startIndex] << 24) | (bytes[startIndex + 1] << 16) | (bytes[startIndex + 2] << 8) | bytes[startIndex + 3]).toString(10)));
        integers.push((bytes[startIndex + 4] << 24) | (bytes[startIndex + 5] << 16) | (bytes[startIndex + 6] << 8) | bytes[startIndex + 7]);
        decimals.push((bytes[startIndex + 8] << 24) | (bytes[startIndex + 9] << 16) | (bytes[startIndex + 10] << 8) | bytes[startIndex + 11]);
      }

      // Process readings based on conditions
      for (let i = 0; i < 3324; i++) {
        if (decimals[i] < 100000) {
          readings.push(integers[i] + decimals[i] / 1000);
        } else if (decimals[i] > 99999 && decimals[i] < 1000000) {
          readings.push(integers[i] + decimals[i] / 1000000);
        } else if (decimals[i] > 9999999 && decimals[i] < 10000000) {
          readings.push(integers[i] + decimals[i] / 10000000);
        }
      }

      // Prepare the result object
      var result = {};
      if (dataTimes.some((time) => time !== null)) {
        // Assuming getMyDate returns null or a valid date object/time
        result.Data_Times = dataTimes.filter((time) => time !== '1970-01-01 00:00:00');
      }
      if (readings.some((reading) => reading !== 0)) {
        result.Readings = readings.filter((reading) => reading !== 0);
      }
      return {
        data: result,
      };
      break;

    default:
      return {
        errors: ['unknown FPort'],
      };
  }
}
