
/* https://www.decentlab.com/products/indoor-ambiance-monitor-including-co2-tvoc-and-motion-sensor-for-lorawan */

var decentlab_decoder = {
  PROTOCOL_VERSION: 2,
  SENSORS: [
    {length: 1,
     values: [{name: 'Battery voltage',
               convert: function (x) { return x[0] / 1000; },
               unit: 'V'}]},
    {length: 2,
     values: [{name: 'Air temperature',
               convert: function (x) { return 175 * x[0] / 65535 - 45; },
               unit: '°C'},
              {name: 'Air humidity',
               convert: function (x) { return 100 * x[1] / 65535; },
               unit: '%'}]},
    {length: 1,
     values: [{name: 'Barometric pressure',
               convert: function (x) { return x[0] * 2; },
               unit: 'Pa'}]},
    {length: 2,
     values: [{name: 'Ambient light (visible + infrared)',
               convert: function (x) { return x[0]; }},
              {name: 'Ambient light (infrared)',
               convert: function (x) { return x[1]; }},
              {name: 'Illuminance',
               convert: function (x) { return Math.max(Math.max(1.0 * x[0] - 1.64 * x[1], 0.59 * x[0] - 0.86 * x[1]), 0) * 1.5504; },
               unit: 'lx'}]},
    {length: 3,
     values: [{name: 'CO2 concentration',
               convert: function (x) { return x[0] - 32768; },
               unit: 'ppm'},
              {name: 'CO2 sensor status',
               convert: function (x) { return x[1]; }},
              {name: 'Raw IR reading',
               convert: function (x) { return x[2]; }}]},
    {length: 1,
     values: [{name: 'Activity counter',
               convert: function (x) { return x[0]; }}]},
    {length: 1,
     values: [{name: 'Total VOC',
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
  console.log(decentlab_decoder.decode("020bbd007f0b926a515d48bc4e0262006981c7000093d4000b0111"));
  console.log(decentlab_decoder.decode("020bbd006f0b926a515d48bc4e02620069000b0111"));
  console.log(decentlab_decoder.decode("020bbd00010b92"));
}

main();
