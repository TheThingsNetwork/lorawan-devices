
/* https://decentlab.squarespace.com/products/laser-distance-level-sensor-for-lorawan */

var decentlab_decoder = {
  PROTOCOL_VERSION: 2,
  SENSORS: [
    {length: 11,
     values: [{name: 'distance_average',
               displayName: 'Distance: average',
               convert: function (x) { return x[0]; },
               unit: 'mm'},
              {name: 'distance_minimum',
               displayName: 'Distance: minimum',
               convert: function (x) { return x[1]; },
               unit: 'mm'},
              {name: 'distance_maximum',
               displayName: 'Distance: maximum',
               convert: function (x) { return x[2]; },
               unit: 'mm'},
              {name: 'distance_median',
               displayName: 'Distance: median',
               convert: function (x) { return x[3]; },
               unit: 'mm'},
              {name: 'distance_10th_percentile',
               displayName: 'Distance: 10th percentile',
               convert: function (x) { return x[4]; },
               unit: 'mm'},
              {name: 'distance_25th_percentile',
               displayName: 'Distance: 25th percentile',
               convert: function (x) { return x[5]; },
               unit: 'mm'},
              {name: 'distance_75th_percentile',
               displayName: 'Distance: 75th percentile',
               convert: function (x) { return x[6]; },
               unit: 'mm'},
              {name: 'distance_90th_percentile',
               displayName: 'Distance: 90th percentile',
               convert: function (x) { return x[7]; },
               unit: 'mm'},
              {name: 'distance_most_frequent_value',
               displayName: 'Distance: most frequent value',
               convert: function (x) { return x[8]; },
               unit: 'mm'},
              {name: 'number_of_samples',
               displayName: 'Number of samples',
               convert: function (x) { return x[9]; }},
              {name: 'total_acquisition_time',
               displayName: 'Total acquisition time',
               convert: function (x) { return x[10] / 1.024; },
               unit: 'ms'}]},
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
