const payloadTypes = {
  COMFORT_SENSOR: 0x01,
  PEOPLE_COUNTER: 0x02,
  BUTTONS: 0x03,
  PULSE_COUNTER: 0x04,
  TRACKER: 0x05,
  DOWNLINK: 0xf1,
};

const errorCode = {
  UNKNOWN_PAYLOAD: 1,
  EXPECTED_DOWNLINK_RESPONSE: 2,
  UNKNOWN_PAYLOAD_TYPE: 3,
  UNKNOWN_PAYLOAD_VARIANT: 4,
};

const settingIdentifier = {
  DEVICE_ID: 0x02,
  INTERVAL: 0x1e,
  EVENT_SETTING: 0x1f,
  PAYLOAD_DEFINITION: 0x20,
  HEARTBEAT_INTERVAL: 0x21,
  HEARTBEAT_PAYLOAD_DEFINITION: 0x22,
  DEVICE_ADDRESS: 0x2b,
  CONFIRMED_MESSAGES: 0x2f,
  FPORT: 0x33,
  FPORT_HEARTBEAT: 0x36,
  ERRORS: 0xf0,
};

function decodeUplink(input) {
  let parsedData = {};

  if (!containsIMBHeader(input.bytes)) {
    //When payload doesn't contain IMBuildings header
    //Assumes that payload is transmitted on specific fport
    //e.g. payload type 2 variant 6 on FPort 26, type 2 variant 7 on FPort 27 and so on...
    switch (input.fPort) {
      case 10:
        //Assumes data is response from downlink
        if (input.bytes[0] != payloadTypes.DOWNLINK || input.bytes[1] != 0x01) return getError(errorCode.EXPECTED_DOWNLINK_RESPONSE);
        parsedData.payload_type = payloadTypes.DOWNLINK;
        parsedData.payload_variant = 0x01;
        break;
      case 13:
        if (input.bytes.length != 7) return getError(errorCode.UNKNOWN_PAYLOAD);

        parsedData.payload_type = payloadTypes.COMFORT_SENSOR;
        parsedData.payload_variant = 3;
        break;
      case 26:
        if (input.bytes.length != 13) return getError(errorCode.UNKNOWN_PAYLOAD);

        parsedData.payload_type = payloadTypes.PEOPLE_COUNTER;
        parsedData.payload_variant = 6;
        break;
      case 27:
        if (input.bytes.length != 5) return getError(errorCode.UNKNOWN_PAYLOAD);

        parsedData.payload_type = payloadTypes.PEOPLE_COUNTER;
        parsedData.payload_variant = 7;
        break;
      case 28:
        if (input.bytes.length != 4) return getError(errorCode.UNKNOWN_PAYLOAD);

        parsedData.payload_type = payloadTypes.PEOPLE_COUNTER;
        parsedData.payload_variant = 8;

        break;
      default:
        return { errors: [] };
    }
  } else {
    parsedData.payload_type = input.bytes[0];
    parsedData.payload_variant = input.bytes[1];
    parsedData.device_id = toHEXString(input.bytes, 2, 8);
  }

  switch (parsedData.payload_type) {
    case payloadTypes.COMFORT_SENSOR:
      parseComfortSensor(input, parsedData);
      break;
    case payloadTypes.PEOPLE_COUNTER:
      parsePeopleCounter(input, parsedData);
      break;
    case payloadTypes.DOWNLINK:
      parsedData = parseDownlinkResponse(input.bytes);
      break;
    default:
      return getError(errorCode.UNKNOWN_PAYLOAD_TYPE);
  }

  return { data: parsedData };
}

function containsIMBHeader(payload) {
  if (payload[0] == payloadTypes.COMFORT_SENSOR && payload[1] == 0x03 && payload.length == 20) return true;
  if (payload[0] == payloadTypes.PEOPLE_COUNTER && payload[1] == 0x06 && payload.length == 23) return true;
  if (payload[0] == payloadTypes.PEOPLE_COUNTER && payload[1] == 0x07 && payload.length == 15) return true;
  if (payload[0] == payloadTypes.PEOPLE_COUNTER && payload[1] == 0x08 && payload.length == 14) return true;

  return false;
}

function parseComfortSensor(input, parsedData) {
  switch (parsedData.payload_variant) {
    case 0x03:
      parsedData.device_status = input.bytes[input.bytes.length - 10];
      parsedData.battery_voltage = readUInt16BE(input.bytes, input.bytes.length - 9) / 100;
      parsedData.temperature = readUInt16BE(input.bytes, input.bytes.length - 7) / 100;
      parsedData.humidity = readUInt16BE(input.bytes, input.bytes.length - 5) / 100;
      parsedData.CO2 = readUInt16BE(input.bytes, input.bytes.length - 3);
      parsedData.presence = input.bytes[input.bytes.length - 1] == 1 ? true : false;
      break;
  }
}

function parsePeopleCounter(input, parsedData) {
  switch (parsedData.payload_variant) {
    case 0x06:
      parsedData.device_status = input.bytes[input.bytes.length - 13];
      parsedData.battery_voltage = readUInt16BE(input.bytes, input.bytes.length - 12) / 100;
      parsedData.counter_a = readUInt16BE(input.bytes, input.bytes.length - 10);
      parsedData.counter_b = readUInt16BE(input.bytes, input.bytes.length - 8);
      parsedData.sensor_status = input.bytes[input.bytes.length - 6];
      parsedData.total_counter_a = readUInt16BE(input.bytes, input.bytes.length - 5);
      parsedData.total_counter_b = readUInt16BE(input.bytes, input.bytes.length - 3);
      parsedData.payload_counter = input.bytes[input.bytes.length - 1];
      break;
    case 0x07:
      parsedData.sensor_status = input.bytes[input.bytes.length - 5];
      parsedData.total_counter_a = readUInt16BE(input.bytes, input.bytes.length - 4);
      parsedData.total_counter_b = readUInt16BE(input.bytes, input.bytes.length - 2);
      break;
    case 0x08:
      parsedData.device_status = input.bytes[input.bytes.length - 4];
      parsedData.battery_voltage = readUInt16BE(input.bytes, input.bytes.length - 3) / 100;
      parsedData.sensor_status = input.bytes[input.bytes.length - 1];
      break;
  }
}

function parseDownlinkResponse(payload) {
  let parsedResponse = {};

  let i = 2;
  while (i < payload.length) {
    switch (payload[i + 1]) {
      case settingIdentifier.DEVICE_ID:
        parsedResponse.device_id = toHEXString(payload, i + 2, 8);
        break;
      case settingIdentifier.INTERVAL:
        parsedResponse.interval = payload[i + 2];
        break;
      case settingIdentifier.EVENT_SETTING:
        parsedResponse.event = {
          type: payload[i + 2],
          count: payload[i + 3],
          timeout: payload[i + 4],
        };
        break;
      case settingIdentifier.PAYLOAD_DEFINITION:
        parsedResponse.payload = {
          type: payload[i + 2],
          variant: payload[i + 3],
          header: payload[i + 4] == 0x01 ? true : false,
        };
        break;
      case settingIdentifier.HEARTBEAT_INTERVAL:
        if (parsedResponse.heartbeat === undefined) {
          parsedResponse.heartbeat = {};
        }

        parsedResponse.heartbeat.interval = payload[i + 2];
        break;
      case settingIdentifier.HEARTBEAT_PAYLOAD_DEFINITION:
        if (parsedResponse.heartbeat === undefined) {
          parsedResponse.heartbeat = {};
        }

        parsedResponse.heartbeat.payload = {
          type: payload[i + 2],
          variant: payload[i + 3],
          header: payload[i + 4] == 0x01 ? true : false,
        };
        break;
      case settingIdentifier.DEVICE_ADDRESS:
        parsedResponse.device_address = toHEXString(payload, i + 2, 4);
        break;
      case settingIdentifier.CONFIRMED_MESSAGES:
        parsedResponse.confirmed_messages = payload[i + 2];
        break;
      case settingIdentifier.FPORT:
        parsedResponse.fport = payload[i + 2];
        break;
      case settingIdentifier.FPORT_HEARTBEAT:
        if (parsedResponse.heartbeat === undefined) {
          parsedResponse.heartbeat = {};
        }

        parsedResponse.heartbeat.fport = payload[i + 2];
        break;
    }

    i += payload[i];
  }

  return parsedResponse;
}

//Helper functions
function getError(code) {
  switch (code) {
    case errorCode.UNKNOWN_PAYLOAD:
      return { errors: ['Unable to detect correct payload. Please check your device configuration'] };
    case errorCode.EXPECTED_DOWNLINK_RESPONSE:
      return { errors: ['Expected downlink reponse data on FPort 10. Please transmit downlinks on FPort 10'] };
    case errorCode.UNKNOWN_PAYLOAD_TYPE:
      return { errors: ['Unknown payload type'] };
    case errorCode.UNKNOWN_PAYLOAD_VARIANT:
      return { errors: ['Unknown payload variant'] };
  }
}

function bcd(dec) {
  return ((dec / 10) << 4) + (dec % 10);
}

function unbcd(bcd) {
  return (bcd >> 4) * 10 + (bcd % 16);
}

function toHEXString(payload, index, length) {
  var HEXString = '';

  for (var i = 0; i < length; i++) {
    if (payload[index + i] < 16) {
      HEXString = HEXString + '0';
    }
    HEXString = HEXString + payload[index + i].toString(16);
  }

  return HEXString;
}

function readInt16BE(payload, index) {
  var int16 = (payload[index] << 8) + payload[++index];

  if (int16 & 0x8000) {
    int16 = -(0x10000 - int16);
  }

  return int16;
}

function readUInt16BE(payload, index) {
  return (payload[index] << 8) + payload[++index];
}

function readInt8(payload, index) {
  var int8 = payload[index];

  if (int8 & 0x80) {
    int8 = -(0x100 - int8);
  }

  return int8;
}
