function str_pad(n) {
  return n.toString(16).padStart(2, '0');
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

function datalog(i, bytes) {
  var aa = parseFloat(((((bytes[i] << 24) >> 16) | bytes[1 + i]) / 100).toFixed(2));
  var bb = parseFloat(((((bytes[2 + i] << 24) >> 16) | bytes[3 + i]) / 10).toFixed(1));
  var cc = parseFloat(((((bytes[4 + i] << 24) >> 16) | bytes[5 + i]) / 100).toFixed(2));
  var dd = bytes[6 + i] & 0x01; // keep only the meaningful bit; other bits are masked out for strict decoding
  var ee = getMyDate((((bytes[7 + i] << 24) | (bytes[8 + i] << 16) | (bytes[9 + i] << 8) | bytes[10 + i]) >>> 0).toString(10));
  var string = '[' + aa + ',' + bb + ',' + cc + ',' + dd + ',' + ee + ']' + ',';

  return string;
}

function decodeUplink(input) {
  var port = input.fPort;
  var bytes = input.bytes;
  var data = {};
  switch (input.fPort) {
    case 2:
      {
        if (bytes.length == 11) {
          data.TempC_SHT = parseFloat(((((bytes[0] << 24) >> 16) | bytes[1]) / 100).toFixed(2));
          data.Hum_SHT = parseFloat(((((bytes[2] << 24) >> 16) | bytes[3]) / 10).toFixed(1));
          data.TempC_DS = parseFloat(((((bytes[4] << 24) >> 16) | bytes[5]) / 100).toFixed(2));

          data.Ext = bytes[6];
          data.Systimestamp = ((bytes[7] << 24) | (bytes[8] << 16) | (bytes[9] << 8) | bytes[10]) >>> 0;
        } else {
          data.Status = 'RPL data or sensor reset';
        }
        data.Node_type = 'LHT52';
      }
      return {
        data: data,
      };
      break;

    case 3:
      {
        var sum = '';
        for (var i = 0; i < bytes.length; i += 11) sum += datalog(i, bytes);
        data.Node_type = 'LHT52';
        data.DATALOG = sum;
      }
      return {
        data: data,
      };
      break;

    case 4:
      {
        data.DS18B20_ID = str_pad(bytes[0]) + str_pad(bytes[1]) + str_pad(bytes[2]) + str_pad(bytes[3]) + str_pad(bytes[4]) + str_pad(bytes[5]) + str_pad(bytes[6]) + str_pad(bytes[7]);
        data.Node_type = 'LHT52';
      }
      return {
        data: data,
      };
      break;

    case 5:
      {
        data.Sensor_Model = bytes[0];
        data.Firmware_Version = str_pad((bytes[1] << 8) | bytes[2]);
        data.Freq_Band = bytes[3];
        data.Sub_Band = bytes[4];
        data.Bat_mV = (bytes[5] << 8) | bytes[6];
        data.Node_type = 'LHT52';
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

function normalizeUplink(input) {
  var data = [];

  if (input.data.TempC_SHT) {
    data.push({
      air: {
        location: 'indoor',
        temperature: input.data.TempC_SHT,
        relativeHumidity: input.data.Hum_SHT,
      },
    });
  }

  if (input.data.TempC_DS) {
    data.push({
      air: {
        location: 'outdoor',
        temperature: input.data.TempC_DS,
      },
    });
  }

  if (input.data.Bat_mV) {
    data.push({
      battery: input.data.Bat_mV,
    });
  }

  return { data: data };
}
