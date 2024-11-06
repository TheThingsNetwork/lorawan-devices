const trigger_type = [
  {val: 0, type: 'rtc',     str: 'Scheduled time interval'},
  {val: 1, type: 'action',  str: 'Single Press'},
  {val: 2, type: 'action',  str: 'Double Press'},
  {val: 3, type: 'action',  str: 'Long Press'},
]

function decodeUplink(input) {
  // assert frame port 1
  if(input.fPort != 1) return {errors: ['unknown FPort']};
  // assert protocol version 01
  if(input.bytes[0] & 0xc0 != 0x40) return {errors: ['unknown format version']};

  // Simplify trigger
  const trigger = (input.bytes[0] & 0x01) && ((input.bytes[1] >> 6 & 0x02 | input.bytes[0] >> 1 & 0x01) + 1);

  return {
    data: {
      mcu: {
        temperature: /* °C */ input.bytes[2] / 255 * 165 - 40,
      },
      info: {
        version: 0x01,
        battery: /* Voltage     */ (input.bytes[1] & 0x7f) / 100 + 2,
        txpower: /* rp002 index */ input.bytes[0] >> 2 & 0x0f,
        trigger: trigger_type[trigger],
        ...(trigger && {gesture_count: input.bytes[3]}),
      }
    }
  }
}
