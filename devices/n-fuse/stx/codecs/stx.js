const trigger_type = [
  {val: 0, type: 'rtc',     str: 'Scheduled time interval'},
  {val: 1, type: 'bma400',  str: 'Motion above threshold'},
  {val: 2, type: 'sfh7776', str: 'Light intensity above threshold'},
  {val: 3, type: 'sfh7776', str: 'Light intensity below threshold'},
  {val: 4, type: 'hdc2080', str: 'Temperature above threshold'},
  {val: 5, type: 'hdc2080', str: 'Temperature below threshold'},
  {val: 6, type: 'hdc2080', str: 'Humidity above threshold'},
  {val: 7, type: 'hdc2080', str: 'Humidity below threshold'},
  {val: 8, type: 'action',  str: 'Reed switch'},
]

function decodeUplink(input) {
  // assert frame port 1
  if(input.fPort != 1) return {errors: ['unknown FPort']};
  // assert protocol version 01
  if(input.bytes[0] & 0xc0 != 0x40) return {errors: ['unknown format version']};

  return {
    data: {
      bma400: {
        x_axis:           /* m/s² */ (input.bytes[2] / 128.0) * (2 * 9.80665),
        y_axis:           /* m/s² */ (input.bytes[3] / 128.0) * (2 * 9.80665),
        z_axis:           /* m/s² */ (input.bytes[4] / 128.0) * (2 * 9.80665),
        x_axis_reference: /* m/s² */ (input.bytes[5] / 128.0) * (2 * 9.80665),
        y_axis_reference: /* m/s² */ (input.bytes[6] / 128.0) * (2 * 9.80665),
        z_axis_reference: /* m/s² */ (input.bytes[7] / 128.0) * (2 * 9.80665),
      },
      hdc2080: {
        temperature: /*  °C */ (input.bytes[9] << 1 & 0x100 | input.bytes[8]) / 512 * 165 - 40,
        humidity:    /* %rH */ (input.bytes[9] & 0x7f),
      },
      sfh7776: {
        luminance:   /* lx */ input.bytes[11] << 8 & 0x3f00 | input.bytes[10],
      },
      info: {
        version: 0x01,
        battery: /* Voltage     */ (input.bytes[1] & 0x7f) / 100 + 2,
        txpower: /* rp002 index */ input.bytes[0] >> 2 & 0x0f,
        trigger: trigger_type[input.bytes[11] >> 3 & 0x18 | input.bytes[1] >> 5 & 0x40 | input.bytes[0] & 0x03],
      }
    }
  }
}
