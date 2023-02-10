// This is used with the LoRa LED/ON off basic sketch
// Please refer to https://create.arduino.cc/editor/FT-CONTENT/043f42fb-2b04-4cfb-a277-b1a3dd5366c2/preview

var LED_STATES = ['off', 'on']

function decodeUplink(input) {
  var data = {};
  data.ledState = LED_STATES[input.bytes[0]];
  return {
    data: data,
  };
}

function encodeDownlink(input) {
  var i = LED_STATES.indexOf(input.data.ledState);
  if (i === -1) {
    return {
      errors: ['unknown led state'],
    };
  }
  return {
    bytes: [i],
    fPort: 1,
  };
}

function decodeDownlink(input) {
  return {
    data: {
      ledState: LED_STATES[input.bytes[0]]
    }
  }
}
