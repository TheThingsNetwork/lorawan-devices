
/* https://www.decentlab.com/products/soil-moisture-and-temperature-profile-for-lorawan */

var decentlab_decoder = {
  PROTOCOL_VERSION: 2,
  SENSORS: [
    {length: 16,
     values: [{name: 'soil_moisture_at_depth_0',
               displayName: 'Soil moisture at depth 0',
               convert: function (x) { return (x[0] - 2500) / 500; }},
              {name: 'soil_temperature_at_depth_0',
               displayName: 'Soil temperature at depth 0',
               convert: function (x) { return (x[1] - 32768) / 100; },
               unit: '°C'},
              {name: 'soil_moisture_at_depth_1',
               displayName: 'Soil moisture at depth 1',
               convert: function (x) { return (x[2] - 2500) / 500; }},
              {name: 'soil_temperature_at_depth_1',
               displayName: 'Soil temperature at depth 1',
               convert: function (x) { return (x[3] - 32768) / 100; },
               unit: '°C'},
              {name: 'soil_moisture_at_depth_2',
               displayName: 'Soil moisture at depth 2',
               convert: function (x) { return (x[4] - 2500) / 500; }},
              {name: 'soil_temperature_at_depth_2',
               displayName: 'Soil temperature at depth 2',
               convert: function (x) { return (x[5] - 32768) / 100; },
               unit: '°C'},
              {name: 'soil_moisture_at_depth_3',
               displayName: 'Soil moisture at depth 3',
               convert: function (x) { return (x[6] - 2500) / 500; }},
              {name: 'soil_temperature_at_depth_3',
               displayName: 'Soil temperature at depth 3',
               convert: function (x) { return (x[7] - 32768) / 100; },
               unit: '°C'},
              {name: 'soil_moisture_at_depth_4',
               displayName: 'Soil moisture at depth 4',
               convert: function (x) { return (x[8] - 2500) / 500; }},
              {name: 'soil_temperature_at_depth_4',
               displayName: 'Soil temperature at depth 4',
               convert: function (x) { return (x[9] - 32768) / 100; },
               unit: '°C'},
              {name: 'soil_moisture_at_depth_5',
               displayName: 'Soil moisture at depth 5',
               convert: function (x) { return (x[10] - 2500) / 500; }},
              {name: 'soil_temperature_at_depth_5',
               displayName: 'Soil temperature at depth 5',
               convert: function (x) { return (x[11] - 32768) / 100; },
               unit: '°C'},
              {name: 'soil_moisture_at_depth_6',
               displayName: 'Soil moisture at depth 6',
               convert: function (x) { return (x[12] - 2500) / 500; }},
              {name: 'soil_temperature_at_depth_6',
               displayName: 'Soil temperature at depth 6',
               convert: function (x) { return (x[13] - 32768) / 100; },
               unit: '°C'},
              {name: 'soil_moisture_at_depth_7',
               displayName: 'Soil moisture at depth 7',
               convert: function (x) { return (x[14] - 2500) / 500; }},
              {name: 'soil_temperature_at_depth_7',
               displayName: 'Soil temperature at depth 7',
               convert: function (x) { return (x[15] - 32768) / 100; },
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
