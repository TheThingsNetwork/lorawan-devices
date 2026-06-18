
/* https://www.decentlab.com/products/eleven-parameter-weather-station-for-lorawan */

var decentlab_decoder = {
  PROTOCOL_VERSION: 2,
  SENSORS: [
    {length: 17,
     values: [{name: 'solar_radiation',
               displayName: 'Solar radiation',
               convert: function (x) { return x[0] - 32768; },
               unit: 'W⋅m⁻²'},
              {name: 'precipitation',
               displayName: 'Precipitation',
               convert: function (x) { return (x[1] - 32768) / 1000; },
               unit: 'mm'},
              {name: 'lightning_strike_count',
               displayName: 'Lightning strike count',
               convert: function (x) { return x[2] - 32768; }},
              {name: 'lightning_average_distance',
               displayName: 'Lightning average distance',
               convert: function (x) { return x[3] - 32768; },
               unit: 'km'},
              {name: 'wind_speed',
               displayName: 'Wind speed',
               convert: function (x) { return (x[4] - 32768) / 100; },
               unit: 'm⋅s⁻¹'},
              {name: 'wind_direction',
               displayName: 'Wind direction',
               convert: function (x) { return (x[5] - 32768) / 10; },
               unit: '°'},
              {name: 'maximum_wind_speed',
               displayName: 'Maximum wind speed',
               convert: function (x) { return (x[6] - 32768) / 100; },
               unit: 'm⋅s⁻¹'},
              {name: 'air_temperature',
               displayName: 'Air temperature',
               convert: function (x) { return (x[7] - 32768) / 10; },
               unit: '°C'},
              {name: 'vapor_pressure',
               displayName: 'Vapor pressure',
               convert: function (x) { return (x[8] - 32768) / 100; },
               unit: 'kPa'},
              {name: 'atmospheric_pressure',
               displayName: 'Atmospheric pressure',
               convert: function (x) { return (x[9] - 32768) / 100; },
               unit: 'kPa'},
              {name: 'relative_humidity',
               displayName: 'Relative humidity',
               convert: function (x) { return (x[10] - 32768) / 10; },
               unit: '%'},
              {name: 'sensor_temperature_internal',
               displayName: 'Sensor temperature (internal)',
               convert: function (x) { return (x[11] - 32768) / 10; },
               unit: '°C'},
              {name: 'x_orientation_angle',
               displayName: 'X orientation angle',
               convert: function (x) { return (x[12] - 32768) / 10; },
               unit: '°'},
              {name: 'y_orientation_angle',
               displayName: 'Y orientation angle',
               convert: function (x) { return (x[13] - 32768) / 10; },
               unit: '°'},
              {name: 'compass_heading',
               displayName: 'Compass heading',
               convert: function (x) { return x[14] - 32768; },
               unit: '°'},
              {name: 'north_wind_speed',
               displayName: 'North wind speed',
               convert: function (x) { return (x[15] - 32768) / 100; },
               unit: 'm⋅s⁻¹'},
              {name: 'east_wind_speed',
               displayName: 'East wind speed',
               convert: function (x) { return (x[16] - 32768) / 100; },
               unit: 'm⋅s⁻¹'}]},
    {length: 1,
     values: [{name: 'battery_voltage',
               displayName: 'Battery voltage',
               convert: function (x) { return x[0] / 1000; },
               unit: 'V'}]}
  ],

  read_int: function (bytes, pos) {
    return (bytes[pos] << 8) + bytes[pos + 1];
  },

  decode: function (msg) {
    var bytes = msg;
    var i, j;
    if (typeof msg === 'string') {
      bytes = [];
      for (i = 0; i < msg.length; i += 2) {
        bytes.push(parseInt(msg.substring(i, i + 2), 16));
      }
    }

    var version = bytes[0];
    if (version != this.PROTOCOL_VERSION) {
      return {error: "protocol version " + version + " doesn't match v2"};
    }

    var deviceId = this.read_int(bytes, 1);
    var flags = this.read_int(bytes, 3);
    var result = {'protocol_version': version, 'device_id': deviceId};
    // decode payload
    var pos = 5;
    for (i = 0; i < this.SENSORS.length; i++, flags >>= 1) {
      if ((flags & 1) !== 1)
        continue;

      var sensor = this.SENSORS[i];
      var x = [];
      // convert data to 16-bit integer array
      for (j = 0; j < sensor.length; j++) {
        x.push(this.read_int(bytes, pos));
        pos += 2;
      }

      // decode sensor values
      for (j = 0; j < sensor.values.length; j++) {
        var value = sensor.values[j];
        if ('convert' in value) {
          result[value.name] = {displayName: value.displayName,
                                value: value.convert.bind(this)(x)};
          if ('unit' in value)
            result[value.name]['unit'] = value.unit;
        }
      }
    }
    return result;
  }
};

function decodeUplink(input) {
  var res = decentlab_decoder.decode(input.bytes);
  if (res.error) {
    return {
      errors: [res.error],
    };
  }
  return {
    data: res,
  };
}
