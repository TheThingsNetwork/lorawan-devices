
/* https://www.decentlab.com/products/air-quality-station-no2-no-co-ox-for-lorawan */

var decentlab_decoder = {
  PROTOCOL_VERSION: 2,
  /* device-specific parameters */
  PARAMETERS: {
    NO2_WE_0: 256,
    NO2_S: 0.256,
    NO2_AUX_0: 227,
    NO_WE_0: 320,
    NO_S: 0.512,
    NO_AUX_0: 288,
    Ox_WE_0: 235,
    Ox_S: 0.345,
    Ox_AUX_0: 200,
    CO_WE_0: 544,
    CO_S: 0.424,
    CO_AUX_0: 301
  },
  SENSORS: [
    {length: 2,
     values: [{name: 'Air temperature',
               convert: function (x) { return 175.72 * x[0] / 65536 - 46.85; },
               unit: '°C'},
              {name: 'Air humidity',
               convert: function (x) { return 125 * x[1] / 65536 - 6; },
               unit: '%'}]},
    {length: 2,
     values: [{name: 'CH4: NO2 (we)',
               convert: function (x) { return 3 * (x[0] / 32768 - 1) * 1000; },
               unit: 'mV'},
              {name: 'CH4: NO2 (we-aux)',
               convert: function (x) { return 3 * (x[1] / 32768 - 1) * 1000; },
               unit: 'mV'},
              {name: 'CH4: NO2 concentration (we)',
               convert: function (x) { return (3 * (x[0] / 32768 - 1) * 1000 - decentlab_decoder.PARAMETERS.NO2_WE_0) / decentlab_decoder.PARAMETERS.NO2_S; },
               unit: 'ppb'},
              {name: 'CH4: NO2 concentration (we-aux)',
               convert: function (x) { return (3 * (x[1] / 32768 - 1) * 1000 - decentlab_decoder.PARAMETERS.NO2_WE_0 + decentlab_decoder.PARAMETERS.NO2_AUX_0) / decentlab_decoder.PARAMETERS.NO2_S; },
               unit: 'ppb'}]},
    {length: 2,
     values: [{name: 'CH5: NO (we)',
               convert: function (x) { return 3 * (x[0] / 32768 - 1) * 1000; },
               unit: 'mV'},
              {name: 'CH5: NO (we-aux)',
               convert: function (x) { return 3 * (x[1] / 32768 - 1) * 1000; },
               unit: 'mV'},
              {name: 'CH5: NO concentration (we)',
               convert: function (x) { return (3 * (x[0] / 32768 - 1) * 1000 - decentlab_decoder.PARAMETERS.NO_WE_0) / decentlab_decoder.PARAMETERS.NO_S; },
               unit: 'ppb'},
              {name: 'CH5: NO concentration (we-aux)',
               convert: function (x) { return (3 * (x[1] / 32768 - 1) * 1000 - decentlab_decoder.PARAMETERS.NO_WE_0 + decentlab_decoder.PARAMETERS.NO_AUX_0) / decentlab_decoder.PARAMETERS.NO_S; },
               unit: 'ppb'}]},
    {length: 2,
     values: [{name: 'CH6: Ox (we)',
               convert: function (x) { return 3 * (x[0] / 32768 - 1) * 1000; },
               unit: 'mV'},
              {name: 'CH6: Ox (we-aux)',
               convert: function (x) { return 3 * (x[1] / 32768 - 1) * 1000; },
               unit: 'mV'},
              {name: 'CH6: Ox concentration (we)',
               convert: function (x) { return (3 * (x[0] / 32768 - 1) * 1000 - decentlab_decoder.PARAMETERS.Ox_WE_0) / decentlab_decoder.PARAMETERS.Ox_S; },
               unit: 'ppb'},
              {name: 'CH6: Ox concentration (we-aux)',
               convert: function (x) { return (3 * (x[1] / 32768 - 1) * 1000 - decentlab_decoder.PARAMETERS.Ox_WE_0 + decentlab_decoder.PARAMETERS.Ox_AUX_0) / decentlab_decoder.PARAMETERS.Ox_S; },
               unit: 'ppb'}]},
    {length: 2,
     values: [{name: 'CH7: CO (we)',
               convert: function (x) { return 3 * (x[0] / 32768 - 1) * 1000; },
               unit: 'mV'},
              {name: 'CH7: CO (we-aux)',
               convert: function (x) { return 3 * (x[1] / 32768 - 1) * 1000; },
               unit: 'mV'},
              {name: 'CH7: CO concentration (we)',
               convert: function (x) { return (3 * (x[0] / 32768 - 1) * 1000 - decentlab_decoder.PARAMETERS.CO_WE_0) / decentlab_decoder.PARAMETERS.CO_S; },
               unit: 'ppb'},
              {name: 'CH7: CO concentration (we-aux)',
               convert: function (x) { return (3 * (x[1] / 32768 - 1) * 1000 - decentlab_decoder.PARAMETERS.CO_WE_0 + decentlab_decoder.PARAMETERS.CO_AUX_0) / decentlab_decoder.PARAMETERS.CO_S; },
               unit: 'ppb'}]},
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
  console.log(decentlab_decoder.decode("020fa0003f66b49b8c8966803c8cf580238a68804c903783f4158a"));
  console.log(decentlab_decoder.decode("020fa00020158a"));
}

main();
