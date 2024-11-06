var events = {
  1: 'setup',
  2: 'interval',
  3: 'motion',
  4: 'button',
};
var colors = ['red', 'green', 'blue'];

function decodeUplink(input) {
  var data = {};
  data.event = events[input.fPort];
  data.battery = (input.bytes[0] << 8) + input.bytes[1];
  data.light = (input.bytes[2] << 8) + input.bytes[3];
  data.temperature =
    (((input.bytes[4] & 0x80 ? input.bytes[4] - 0x100 : input.bytes[4]) << 8) +
      input.bytes[5]) /
    100;
  return {
    data: data,
  };
}
