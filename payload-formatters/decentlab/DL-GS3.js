
/* https://www.decentlab.com/support */

var decentlab_decoder = {
  PROTOCOL_VERSION: 2,
  SENSORS: [
    {length: 3,
     values: [{name: 'Dielectric permittivity',
               convert: function (x) { return x[0] / 100; }},
              {name: 'Volumetric water content',
               convert: function (x) { return 0.00000589 * Math.pow(x[0]/100, 3) - 0.000762 * Math.pow(x[0]/100, 2) + 0.0367 * (x[0]/100) - 0.0753; },
               unit: 'm³⋅m⁻³'},
              {name: 'Soil temperature',
               convert: function (x) { return (x[1] - 32768) / 10; },
               unit: '°C'},
              {name: 'Electrical conductivity',
               convert: function (x) { return x[2]; },
               unit: 'µS⋅cm⁻¹'}]},
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
  console.log(decentlab_decoder.decode("0203630003009980e100010c60"));
  console.log(decentlab_decoder.decode("02036300020c60"));
}

main();
