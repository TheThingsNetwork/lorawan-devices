function decodeUplink(input) {
  var data = {};

  switch (input.fPort) {
    case 1:
      if (input.bytes[4] === 0x00) {
        data.trapState = 'failed';
      } else if (input.bytes[4] === 0x01) {
        data.trapState = 'normal';
      } else if (input.bytes[4] === 0x02) {
        data.trapState = 'trapped';
      } else if (input.bytes[4] === 0x03) {
        data.trapState = 'abnormal';
      } else if (input.bytes[4] === 0x04) {
        data.trapState = 'moved';
      } else if (input.bytes[4] === 0x07) {
        data.trapState = 'error';
      } else if (input.bytes[4] === 0x08) {
        data.trapState = 'wakeup';
      }
      data.msgId = input.bytes[0];
      data.battVoltage = input.bytes[1] / 10;
      data.temperature = ((input.bytes[2] << 8) | input.bytes[3]) / 100;
      data.id = (input.bytes[10] << 8) | input.bytes[5];

      return {
        data: data,
      };
  }
}
