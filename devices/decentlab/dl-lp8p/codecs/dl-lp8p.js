
/* https://www.decentlab.com/products/co2-temperature-humidity-and-barometric-pressure-sensor-for-lorawan */

var decentlab_decoder = {
  PROTOCOL_VERSION: 2,
  SENSORS: [
    {length: 2,
     values: [{name: 'air_temperature',
               displayName: 'Air temperature',
               convert: function (x) { return 175.72 * x[0] / 65536 - 46.85; },
               unit: '°C'},
              {name: 'air_humidity',
               displayName: 'Air humidity',
               convert: function (x) { return 125 * x[1] / 65536 - 6; },
               unit: '%'}]},
    {length: 2,
     values: [{name: 'barometer_temperature',
               displayName: 'Barometer temperature',
               convert: function (x) { return (x[0] - 5000) / 100; },
               unit: '°C'},
              {name: 'barometric_pressure',
               displayName: 'Barometric pressure',
               convert: function (x) { return x[1] * 2; },
               unit: 'Pa'}]},
    {length: 8,
     values: [{name: 'co2_concentration',
               displayName: 'CO2 concentration',
               convert: function (x) { return x[0] - 32768; },
               unit: 'ppm'},
              {name: 'co2_concentration_lpf',
               displayName: 'CO2 concentration LPF',
               convert: function (x) { return x[1] - 32768; },
               unit: 'ppm'},
              {name: 'co2_sensor_temperature',
               displayName: 'CO2 sensor temperature',
               convert: function (x) { return (x[2] - 32768) / 100; },
               unit: '°C'},
              {name: 'capacitor_voltage_1',
               displayName: 'Capacitor voltage 1',
               convert: function (x) { return x[3] / 1000; },
               unit: 'V'},
              {name: 'capacitor_voltage_2',
               displayName: 'Capacitor voltage 2',
               convert: function (x) { return x[4] / 1000; },
               unit: 'V'},
              {name: 'co2_sensor_status',
               displayName: 'CO2 sensor status',
               convert: function (x) { return x[5]; }},
              {name: 'raw_ir_reading',
               displayName: 'Raw IR reading',
               convert: function (x) { return x[6]; }},
              {name: 'raw_ir_reading_lpf',
               displayName: 'Raw IR reading LPF',
               convert: function (x) { return x[7]; }}]},
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
