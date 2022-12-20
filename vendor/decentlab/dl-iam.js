
/* https://www.decentlab.com/products/indoor-ambiance-monitor-including-co2-tvoc-and-motion-sensor-for-lorawan */

var decentlab_decoder = {
  PROTOCOL_VERSION: 2,
  SENSORS: [
    {length: 1,
     values: [{name: 'battery_voltage',
               displayName: 'Battery voltage',
               convert: function (x) { return x[0] / 1000; },
               unit: 'V'}]},
    {length: 2,
     values: [{name: 'air_temperature',
               displayName: 'Air temperature',
               convert: function (x) { return 175 * x[0] / 65535 - 45; },
               unit: '°C'},
              {name: 'air_humidity',
               displayName: 'Air humidity',
               convert: function (x) { return 100 * x[1] / 65535; },
               unit: '%'}]},
    {length: 1,
     values: [{name: 'barometric_pressure',
               displayName: 'Barometric pressure',
               convert: function (x) { return x[0] * 2; },
               unit: 'Pa'}]},
    {length: 2,
     values: [{name: 'ambient_light_visible_infrared',
               displayName: 'Ambient light (visible + infrared)',
               convert: function (x) { return x[0]; }},
              {name: 'ambient_light_infrared',
               displayName: 'Ambient light (infrared)',
               convert: function (x) { return x[1]; }},
              {name: 'illuminance',
               displayName: 'Illuminance',
               convert: function (x) { return Math.max(Math.max(1.0 * x[0] - 1.64 * x[1], 0.59 * x[0] - 0.86 * x[1]), 0) * 1.5504; },
               unit: 'lx'}]},
    {length: 3,
     values: [{name: 'co2_concentration',
               displayName: 'CO2 concentration',
               convert: function (x) { return x[0] - 32768; },
               unit: 'ppm'},
              {name: 'co2_sensor_status',
               displayName: 'CO2 sensor status',
               convert: function (x) { return x[1]; }},
              {name: 'raw_ir_reading',
               displayName: 'Raw IR reading',
               convert: function (x) { return x[2]; }}]},
    {length: 1,
     values: [{name: 'activity_counter',
               displayName: 'Activity counter',
               convert: function (x) { return x[0]; }}]},
    {length: 1,
     values: [{name: 'total_voc',
               displayName: 'Total VOC',
               convert: function (x) { return x[0]; },
               unit: 'ppb'}]}
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
