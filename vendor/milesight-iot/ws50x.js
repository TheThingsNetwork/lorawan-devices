function decodeUplink(input) {
  var res = Decoder(input.bytes, input.fPort);
  if (res.error) {
    return {
      errors: [res.error],
    };
  }
  return {
    data: res,
  };
}
/**
 * Payload Decoder for The Things Network
 *
 * Copyright 2021 Milesight IoT
 *
 * @product WS50x
 */
function Decoder(bytes, port) {
  var decoded = {};

  for (var i = 0; i < bytes.length;) {
    var channel_id = bytes[i++];
    var channel_type = bytes[i++];

    // SWITCH STATE
    if (channel_id === 0xff && channel_type === 0x29) {
      // TTN unsupport binary (0b00000001 --> 1)
      // payload (0 0 0 0 0 0 0 0)
      //  Switch    3 2 1   3 2 1
      //          ------- -------
      // bit mask  change   state
      decoded.switch_1 = (bytes[i] & 1) == 1 ? "open" : "close";
      decoded.switch_1_change = ((bytes[i] >> 4) & 1) == 1 ? "yes" : "no";

      decoded.switch_2 = ((bytes[i] >> 1) & 1) == 1 ? "open" : "close";
      decoded.switch_2_change = ((bytes[i] >> 5) & 1) == 1 ? "yes" : "no";

      decoded.switch_3 = ((bytes[i] >> 2) & 1) == 1 ? "open" : "close";
      decoded.switch_3_change = ((bytes[i] >> 6) & 1) == 1 ? "yes" : "no";
      i += 1;
    } else {
      break;
    }
  }

  return decoded;
}

/*
{
    "switch_1": "open|close",
    "switch_2": "open|close",
    "switch_3": "open|close",
    "switch_1_change": "yes|no",
    "switch_2_change": "yes|no",
    "switch_3_change": "yes|no"
}
*/
