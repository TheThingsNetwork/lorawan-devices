
/* https://www.decentlab.com/products/strain-/-weight-sensor-for-lorawan */

var decentlab_decoder = {
  PROTOCOL_VERSION: 2,
  /* device-specific parameters */
  PARAMETERS: {
    f0: 15383.72,
    k: 46.4859
  },
  SENSORS: [
    {length: 3,
     values: [{name: 'Counter reading',
               convert: function (x) { return x[0]; }},
              {name: 'Measurement interval',
               convert: function (x) { return x[1] / 32768; }},
              {name: 'Frequency',
               convert: function (x) { return x[0] / x[1] * 32768; },
               unit: 'Hz'},
              {name: 'Weight',
               convert: function (x) { return (Math.pow(x[0] / x[1] * 32768, 2) - Math.pow(decentlab_decoder.PARAMETERS.f0, 2)) * decentlab_decoder.PARAMETERS.k / 1000000; },
               unit: 'g'},
              {name: 'Elongation',
               convert: function (x) { return (Math.pow(x[0] / x[1] * 32768, 2) - Math.pow(decentlab_decoder.PARAMETERS.f0, 2)) * decentlab_decoder.PARAMETERS.k / 1000000 * (-1.5) / 1000 * 9.8067; },
               unit: 'µm'},
              {name: 'Strain',
               convert: function (x) { return (Math.pow(x[0] / x[1] * 32768, 2) - Math.pow(decentlab_decoder.PARAMETERS.f0, 2)) * decentlab_decoder.PARAMETERS.k / 1000000 * (-1.5) / 1000 * 9.8067 / 0.066; },
               unit: 'µm⋅m⁻¹'}]},
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
  console.log(decentlab_decoder.decode("0203d400033bf67fff3bf60c60"));
  console.log(decentlab_decoder.decode("0203d400020c60"));
}

main();
