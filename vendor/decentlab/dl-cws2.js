
/* https://www.decentlab.com/products/high-precision-winter-road-maintenance-sensor-with-radiation-shield-for-lorawan */

var decentlab_decoder = {
  PROTOCOL_VERSION: 2,
  SENSORS: [
    {length: 2,
     values: [{name: 'air_temperature_radiation_shield',
               displayName: 'Air temperature (radiation shield)',
               convert: function (x) { return 175 * x[0] / 65535 - 45; },
               unit: '°C'},
              {name: 'air_humidity_radiation_shield',
               displayName: 'Air humidity (radiation shield)',
               convert: function (x) { return 100 * x[1] / 65535; },
               unit: '%'}]},
    {length: 6,
     values: [{name: 'surface_temperature',
               displayName: 'Surface temperature',
               convert: function (x) { return (x[0] - 32768) / 100; },
               unit: '°C'},
              {name: 'air_temperature',
               displayName: 'Air temperature',
               convert: function (x) { return (x[1] - 32768) / 100; },
               unit: '°C'},
              {name: 'air_humidity',
               displayName: 'Air humidity',
               convert: function (x) { return (x[2] - 32768) / 100; },
               unit: '%'},
              {name: 'dew_point',
               displayName: 'Dew point',
               convert: function (x) { return (x[3] - 32768) / 100; },
               unit: '°C'},
              {name: 'angle',
               displayName: 'Angle',
               convert: function (x) { return (x[4] - 32768); },
               unit: '°'},
              {name: 'sensor_temperature',
               displayName: 'Sensor temperature',
               convert: function (x) { return (x[5] - 32768) / 100; },
               unit: '°C'}]},
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
