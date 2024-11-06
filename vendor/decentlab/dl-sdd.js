
/* https://www.decentlab.com/products/soil-moisture-temperature-and-salinity-profile */

var decentlab_decoder = {
  PROTOCOL_VERSION: 2,
  SENSORS: [
    {length: 18,
     values: [{name: 'moisture_at_level_0',
               displayName: 'Moisture at level 0',
               convert: function (x) { return (x[0] - 32768) / 100; },
               unit: '%'},
              {name: 'moisture_at_level_1',
               displayName: 'Moisture at level 1',
               convert: function (x) { return (x[1] - 32768) / 100; },
               unit: '%'},
              {name: 'moisture_at_level_2',
               displayName: 'Moisture at level 2',
               convert: function (x) { return (x[2] - 32768) / 100; },
               unit: '%'},
              {name: 'moisture_at_level_3',
               displayName: 'Moisture at level 3',
               convert: function (x) { return (x[3] - 32768) / 100; },
               unit: '%'},
              {name: 'moisture_at_level_4',
               displayName: 'Moisture at level 4',
               convert: function (x) { return (x[4] - 32768) / 100; },
               unit: '%'},
              {name: 'moisture_at_level_5',
               displayName: 'Moisture at level 5',
               convert: function (x) { return (x[5] - 32768) / 100; },
               unit: '%'},
              {name: 'temperature_at_level_0',
               displayName: 'Temperature at level 0',
               convert: function (x) { return (x[6] - 32768) / 100; },
               unit: '°C'},
              {name: 'temperature_at_level_1',
               displayName: 'Temperature at level 1',
               convert: function (x) { return (x[7] - 32768) / 100; },
               unit: '°C'},
              {name: 'temperature_at_level_2',
               displayName: 'Temperature at level 2',
               convert: function (x) { return (x[8] - 32768) / 100; },
               unit: '°C'},
              {name: 'temperature_at_level_3',
               displayName: 'Temperature at level 3',
               convert: function (x) { return (x[9] - 32768) / 100; },
               unit: '°C'},
              {name: 'temperature_at_level_4',
               displayName: 'Temperature at level 4',
               convert: function (x) { return (x[10] - 32768) / 100; },
               unit: '°C'},
              {name: 'temperature_at_level_5',
               displayName: 'Temperature at level 5',
               convert: function (x) { return (x[11] - 32768) / 100; },
               unit: '°C'},
              {name: 'salinity_at_level_0',
               displayName: 'Salinity at level 0',
               convert: function (x) { return x[12] - 100; }},
              {name: 'salinity_at_level_1',
               displayName: 'Salinity at level 1',
               convert: function (x) { return x[13] - 100; }},
              {name: 'salinity_at_level_2',
               displayName: 'Salinity at level 2',
               convert: function (x) { return x[14] - 100; }},
              {name: 'salinity_at_level_3',
               displayName: 'Salinity at level 3',
               convert: function (x) { return x[15] - 100; }},
              {name: 'salinity_at_level_4',
               displayName: 'Salinity at level 4',
               convert: function (x) { return x[16] - 100; }},
              {name: 'salinity_at_level_5',
               displayName: 'Salinity at level 5',
               convert: function (x) { return x[17] - 100; }}]},
    {length: 18,
     values: [{name: 'moisture_at_level_6',
               displayName: 'Moisture at level 6',
               convert: function (x) { return (x[0] - 32768) / 100; },
               unit: '%'},
              {name: 'moisture_at_level_7',
               displayName: 'Moisture at level 7',
               convert: function (x) { return (x[1] - 32768) / 100; },
               unit: '%'},
              {name: 'moisture_at_level_8',
               displayName: 'Moisture at level 8',
               convert: function (x) { return (x[2] - 32768) / 100; },
               unit: '%'},
              {name: 'moisture_at_level_9',
               displayName: 'Moisture at level 9',
               convert: function (x) { return (x[3] - 32768) / 100; },
               unit: '%'},
              {name: 'moisture_at_level_10',
               displayName: 'Moisture at level 10',
               convert: function (x) { return (x[4] - 32768) / 100; },
               unit: '%'},
              {name: 'moisture_at_level_11',
               displayName: 'Moisture at level 11',
               convert: function (x) { return (x[5] - 32768) / 100; },
               unit: '%'},
              {name: 'temperature_at_level_6',
               displayName: 'Temperature at level 6',
               convert: function (x) { return (x[6] - 32768) / 100; },
               unit: '°C'},
              {name: 'temperature_at_level_7',
               displayName: 'Temperature at level 7',
               convert: function (x) { return (x[7] - 32768) / 100; },
               unit: '°C'},
              {name: 'temperature_at_level_8',
               displayName: 'Temperature at level 8',
               convert: function (x) { return (x[8] - 32768) / 100; },
               unit: '°C'},
              {name: 'temperature_at_level_9',
               displayName: 'Temperature at level 9',
               convert: function (x) { return (x[9] - 32768) / 100; },
               unit: '°C'},
              {name: 'temperature_at_level_10',
               displayName: 'Temperature at level 10',
               convert: function (x) { return (x[10] - 32768) / 100; },
               unit: '°C'},
              {name: 'temperature_at_level_11',
               displayName: 'Temperature at level 11',
               convert: function (x) { return (x[11] - 32768) / 100; },
               unit: '°C'},
              {name: 'salinity_at_level_6',
               displayName: 'Salinity at level 6',
               convert: function (x) { return x[12] - 100; }},
              {name: 'salinity_at_level_7',
               displayName: 'Salinity at level 7',
               convert: function (x) { return x[13] - 100; }},
              {name: 'salinity_at_level_8',
               displayName: 'Salinity at level 8',
               convert: function (x) { return x[14] - 100; }},
              {name: 'salinity_at_level_9',
               displayName: 'Salinity at level 9',
               convert: function (x) { return x[15] - 100; }},
              {name: 'salinity_at_level_10',
               displayName: 'Salinity at level 10',
               convert: function (x) { return x[16] - 100; }},
              {name: 'salinity_at_level_11',
               displayName: 'Salinity at level 11',
               convert: function (x) { return x[17] - 100; }}]},
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
