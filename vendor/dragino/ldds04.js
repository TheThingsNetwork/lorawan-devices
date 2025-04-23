function decodeUplink(input) {
  var port = input.fPort;
  var bytes = input.bytes;
  var value = ((bytes[0] << 8) | bytes[1]) & 0x3fff;
  var data = {};
  switch (input.fPort) {
    case 2:
      if (!(bytes[0] == 0x03 && bytes[10] == 0x02)) {
        data.BatV = value / 1000;
        data.EXTI_Trigger = bytes[0] & 0x80 ? 'TRUE' : 'FALSE';
        data.distance1_cm = ((bytes[2] << 8) | bytes[3]) / 10;
        data.distance2_cm = ((bytes[4] << 8) | bytes[5]) / 10;
        data.distance3_cm = ((bytes[6] << 8) | bytes[7]) / 10;
        data.distance4_cm = ((bytes[8] << 8) | bytes[9]) / 10;
        data.mes_type = bytes[10];
      }
      return {
        data: data,
      };
    default:
      return {
        errors: ['unknown FPort'],
      };
  }
}
