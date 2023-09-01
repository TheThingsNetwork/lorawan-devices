/*
Payload smaple: 0A00541FE027770B9517D6043F1AA702751AFF133D0F0000000001

Decode result:

{
  "alarm1": 1,
  "altitude": 1,
  "counter": 10,
  "device": 123456789,
  "dewpoint": 10.4,
  "hdop": 1.1,
  "humidity": 29.35,
  "latitude": 51.193901,
  "level1": 0,
  "level2": 0,
  "longitude": 6.796773,
  "position": {
    "context": {
      "lat": 51.193901,
      "lng": 6.796773
    },
    "value": 0
  },
  "pressure": 1020.8,
  "relay": 0,
  "tempbattery": 17.2,
  "temperature": 20.1,
  "voltage": 12.38
}

*/

function decodeUplink(input) {
  var data = {};
  var events = {
    1: "setup",
    2: "interval",
    3: "motion",
    4: "button"
  };
//  data.event = events[input.fPort];

  var voffset = 0;     // Voltage offset
  var toffset = 0;     // Temperature offset for BME280
  var poffset = 0;     // pressure offset for altitude

  data.device = 123456789;
  data.counter = ((input.bytes[1] << 8) | input.bytes[0]);
  var temperature = (((input.bytes[3] << 8) | input.bytes[2]) / 100) - 50 + toffset;
  data.temperature = Math.round(temperature * 10) / 10;
  data.pressure = ((input.bytes[5] << 8) | input.bytes[4]) / 10 + poffset;
  data.humidity = ((input.bytes[7] << 8) | input.bytes[6]) / 100;
  var dewpoint = (((input.bytes[9] << 8) | input.bytes[8]) / 100) - 50;
  data.dewpoint = Math.round(dewpoint * 10) / 10;
  var voltage = ((input.bytes[11] << 8) | input.bytes[10]) / 1000 + voffset;
  data.voltage = Math.round(voltage * 1000) / 1000;
  var tempbattery = (((input.bytes[13] << 8) | input.bytes[12]) / 100) - 50;
  data.tempbattery = Math.round(tempbattery * 10) / 10;
  var longitude = ((input.bytes[15] << 8) | input.bytes[14]) / 100 + ((input.bytes[17] << 8) | input.bytes[16]) / 1000000;
  data.longitude = longitude;
  var latitude = ((input.bytes[19] << 8) | input.bytes[18]) / 100 + ((input.bytes[21] << 8) | input.bytes[20]) / 1000000;
  data.latitude = latitude;
  data.altitude = 1;
  data.hdop = 1.1;
  data.position = {"value": 0, context:{"lat": latitude, "lng": longitude}};
  data.level1 = ((input.bytes[23] << 8) | input.bytes[22]) / 100;
  data.level2 = ((input.bytes[25] << 8) | input.bytes[24]) / 100;
  data.alarm1 = input.bytes[26] & 0x01;
  data.relay = (input.bytes[26] & 0x10) / 0x10;

  var warnings = [];
  if (data.voltage < 10) {
    warnings.push("Battery undervoltage");
  }
  if (data.voltage > 14.7) {
    warnings.push("Battery overload");
  }
  return {
    data: data,
    warnings: warnings
  };
}
