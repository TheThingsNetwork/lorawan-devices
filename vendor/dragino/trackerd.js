function decodeUplink(input) {
  var bytes = input.bytes;
  var port = input.fPort;

  var decode = {};
  var i;
  var alarm = 'FALSE';
  var batV = 0;
  var mod = 0;
  var led_updown = 'OFF';
  var hum = 0;
  var tem = 0;
  var latitude = 0;
  var longitude = 0;
  var location = '';
  var intwk = 'STILL';
  var sensor_mode;
  var sub_band;
  var freq_band;
  var sensor;
  var sensor_mod;
  var gps_mod;
  var ble_mod;
  var pnackmd;
  var lon;
  var uuid = '';
  var major = 0;
  var minor = 0;
  var power = 0;
  var rssi = 0;
  var wifissid = '';

  switch (port) {
    // GPS position, sys.mod == 0: position + battery + humidity + temperature
    // GPS position, sys.mod == 1: position + battery only
    case 2:
    case 3: {
      latitude = ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) / 1000000;
      longitude = ((bytes[4] << 24) | (bytes[5] << 16) | (bytes[6] << 8) | bytes[7]) / 1000000;

      if (latitude > -190 && latitude < 190 && longitude > -190 && longitude < 190) {
        if (latitude !== 0 || longitude !== 0) {
          location = latitude + ',' + longitude;
        }
        else {
          location = 'No GPS fix';
        }
      } else {
        location = 'invalid value';
      }

      alarm = bytes[8] & 0x40 ? 'TRUE' : 'FALSE';
      batV = (((bytes[8] & 0x3f) << 8) | bytes[9]) / 1000;
      mod = (bytes[10] & 0xc0) >> 6;
      led_updown = bytes[10] & 0x20 ? 'ON' : 'OFF';
      intwk = bytes[10] & 0x10 ? 'MOVE' : 'STILL';

      decode.Location = location;
      decode.Latitude = latitude;
      decode.Longitude = longitude;

      if (port === 2) {
        // Only the mod == 0 frame carries the GXHT3x humidity and temperature.
        if (mod === 0) {
          hum = ((bytes[11] << 8) | bytes[12]) / 10;
          tem = ((((bytes[13] << 8) | bytes[14]) << 16) >> 16) / 10;
        }
        decode.Hum = hum;
        decode.Tem = tem;
      }

      decode.BatV = batV;
      decode.ALARM_status = alarm;
      decode.MD = mod;
      decode.LON = led_updown;
      decode.Transport = intwk;
      return { data: decode };
    }

    // GPS data log replay: position and the UTC fix time read back from flash
    case 4: {
      latitude = ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) / 1000000;
      longitude = ((bytes[4] << 24) | (bytes[5] << 16) | (bytes[6] << 8) | bytes[7]) / 1000000;

      if (latitude > -190 && latitude < 190 && longitude > -190 && longitude < 190) {
        if (latitude !== 0 || longitude !== 0) {
          location = latitude + ',' + longitude;
        }
        else {
          location = 'No GPS fix';
        }
      } else {
        location = 'invalid value';
      }

      decode.Location = location;
      decode.Latitude = latitude;
      decode.Longitude = longitude;
      decode.Date = ((bytes[8] << 8) | bytes[9]) + ':' + bytes[10] + ':' + bytes[11];
      decode.Time = bytes[12] + ':' + bytes[13] + ':' + bytes[14];
      return { data: decode };
    }

    // Device information
    case 5: {
      if (bytes[0] === 0x13) {
        sensor_mode = 'TrackerD';
      } else {
        sensor_mode = 'NULL';
      }

      if (bytes[4] === 0xff) {
        sub_band = 'NULL';
      } else {
        sub_band = bytes[4];
      }

      if (bytes[3] === 0x01) {
        freq_band = 'EU868';
      } else if (bytes[3] === 0x02) {
        freq_band = 'US915';
      } else if (bytes[3] === 0x03) {
        freq_band = 'IN865';
      } else if (bytes[3] === 0x04) {
        freq_band = 'AU915';
      } else if (bytes[3] === 0x05) {
        freq_band = 'KZ865';
      } else if (bytes[3] === 0x06) {
        freq_band = 'RU864';
      } else if (bytes[3] === 0x07) {
        freq_band = 'AS923';
      } else if (bytes[3] === 0x08) {
        freq_band = 'AS923_1';
      } else if (bytes[3] === 0x09) {
        freq_band = 'AS923_2';
      } else if (bytes[3] === 0x0a) {
        freq_band = 'AS923_3';
      } else if (bytes[3] === 0x0b) {
        freq_band = 'CN470';
      } else if (bytes[3] === 0x0c) {
        freq_band = 'EU433';
      } else if (bytes[3] === 0x0d) {
        freq_band = 'KR920';
      } else if (bytes[3] === 0x0e) {
        freq_band = 'MA869';
      } else {
        freq_band = 'NULL';
      }

      // devicet.firm_ver: (major << 8) | (minor << 4) | patch
      // devicet.SMODE:    (sensor_mode << 6) | (mod << 4) | ble_mod
      // devicet.FLAG:     (PNACKmd << 2) | (lon << 1) | Intwk
      firm_ver = (bytes[1] & 0x0f) + '.' + ((bytes[2] >> 4) & 0x0f) + '.' + (bytes[2] & 0x0f);
      batV = ((bytes[5] << 8) | bytes[6]) / 1000;
      sensor_mod = (bytes[7] >> 6) & 0x03;
      gps_mod = (bytes[7] >> 4) & 0x03;
      ble_mod = bytes[7] & 0x0f;
      pnackmd = (bytes[8] >> 2) & 0x01;
      lon = (bytes[8] >> 1) & 0x01 ? 'ON' : 'OFF';
      intwk = bytes[8] & 0x01;

      if (sensor_mod === 1) {
        sensor = 'GPS';
      } else if (sensor_mod === 2) {
        sensor = 'BLE';
      } else if (bytes[8] & 0x01) {
        sensor = 'Spots';
      } else if (sensor_mod === 3) {
        sensor = 'BLE+GPS Hybrid';
      } else {
        sensor = 'NULL';
      }

      decode.BatV = batV;
      decode.SENSOR_MODEL = sensor_mode;
      decode.FIRMWARE_VERSION = firm_ver;
      decode.FREQUENCY_BAND = freq_band;
      decode.SUB_BAND = sub_band;
      decode.SMODE = sensor;
      decode.GPS_M0D = gps_mod;
      decode.BLE_MD = ble_mod;
      decode.PNACKMD = pnackmd;
      decode.LON = lon;
      decode.Intwk = intwk;
      return { data: decode };
    }

    // BLE beacon report: UUID, major, minor, tx power and RSSI of the strongest beacon
    case 6: {
      for (i = 0; i < 16; i++) {
        uuid += (bytes[i] < 0x10 ? '0' : '') + bytes[i].toString(16);
      }

      major = (bytes[16] << 8) | bytes[17];
      minor = (bytes[18] << 8) | bytes[19];
      // bytes[20] is always zero, the tx power is the low byte of the pair
      power = (bytes[21] << 24) >> 24;
      rssi = (bytes[23] << 24) >> 24;

      alarm = bytes[24] & 0x40 ? 'TRUE' : 'FALSE';
      batV = (((bytes[24] & 0x3f) << 8) | bytes[25]) / 1000;
      mod = (bytes[26] & 0xc0) >> 6;
      led_updown = bytes[26] & 0x20 ? 'ON' : 'OFF';
      intwk = bytes[26] & 0x10 ? 'MOVE' : 'STILL';

      decode.BatV = batV;
      decode.ALARM_status = alarm;
      decode.MD = mod;
      decode.LON = led_updown;
      decode.Transport = intwk;
      decode.UUID = uuid;
      decode.MAJOR = major;
      decode.MINOR = minor;
      decode.RSSI = rssi;
      decode.POWER = power;
      return { data: decode };
    }

    // Alarm frame
    case 7: {
      alarm = bytes[0] & 0x40 ? 'TRUE' : 'FALSE';
      batV = (((bytes[0] & 0x3f) << 8) | bytes[1]) / 1000;
      mod = (bytes[2] & 0xc0) >> 6;
      led_updown = bytes[2] & 0x20 ? 'ON' : 'OFF';

      decode.BatV = batV;
      decode.ALARM_status = alarm;
      decode.MD = mod;
      decode.LON = led_updown;
      return { data: decode };
    }

    // WiFi report: the last 6 characters of the SSID and its RSSI
    case 8: {
      for (i = 0; i < 6; i++) {
        wifissid += String.fromCharCode(bytes[i]);
      }
      rssi = (bytes[6] << 24) >> 24;

      alarm = bytes[7] & 0x40 ? 'TRUE' : 'FALSE';
      batV = (((bytes[7] & 0x3f) << 8) | bytes[8]) / 1000;
      mod = (bytes[9] & 0xc0) >> 6;
      led_updown = bytes[9] & 0x20 ? 'ON' : 'OFF';
      intwk = bytes[9] & 0x10 ? 'MOVE' : 'STILL';

      decode.WIFISSID = wifissid;
      decode.RSSI = rssi;
      decode.BatV = batV;
      decode.ALARM_status = alarm;
      decode.MD = mod;
      decode.LON = led_updown;
      decode.Transport = intwk;
      return { data: decode };
    }

    default: {
      return { errors: ['Unsupported fPort: ' + port] };
    }
  }
}
