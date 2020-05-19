
/* https://www.decentlab.com/products/co2-temperature-humidity-and-barometric-pressure-sensor-for-lorawan */

var decentlab_decoder = {
  PROTOCOL_VERSION: 2,
  SENSORS: [
    {length: 2,
     values: [{name: 'Air temperature',
               convert: function (x) { return 175.72 * x[0] / 65536 - 46.85; },
               unit: '°C'},
              {name: 'Air humidity',
               convert: function (x) { return 125 * x[1] / 65536 - 6; },
               unit: '%'}]},
    {length: 2,
     values: [{name: 'Barometer temperature',
               convert: function (x) { return (x[0] - 5000) / 100; },
               unit: '°C'},
              {name: 'Barometric pressure',
               convert: function (x) { return x[1] * 2; },
               unit: 'Pa'}]},
    {length: 8,
     values: [{name: 'CO2 concentration',
               convert: function (x) { return x[0] - 32768; },
               unit: 'ppm'},
              {name: 'CO2 concentration LPF',
               convert: function (x) { return x[1] - 32768; },
               unit: 'ppm'},
              {name: 'CO2 sensor temperature',
               convert: function (x) { return (x[2] - 32768) / 100; },
               unit: '°C'},
              {name: 'Capacitor voltage 1',
               convert: function (x) { return x[3] / 1000; },
               unit: 'V'},
              {name: 'Capacitor voltage 2',
               convert: function (x) { return x[4] / 1000; },
               unit: 'V'},
              {name: 'CO2 sensor status',
               convert: function (x) { return x[5]; }},
              {name: 'Raw IR reading',
               convert: function (x) { return x[6]; }},
              {name: 'Raw IR reading LPF',
               convert: function (x) { return x[7]; }}]},
    {length: 1,
     values: [{name: 'Battery voltage',
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
    var result = {'Protocol version': version, 'Device ID': deviceId};
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
          result[value.name] = {value: value.convert(x),
                                unit: value.unit};
        }
      }
    }
    return result;
  }
};

function main() {
  console.log(decentlab_decoder.decode("020578000f67bd618d1cedbd1081d981f4895b0bd80bb50000959895390c25"));
  console.log(decentlab_decoder.decode("020578000b67bd618d1cedbd100c25"));
  console.log(decentlab_decoder.decode("02057800080c25"));
}

main();
