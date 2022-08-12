var PTYPE_STATUS = 0x20;
var PTYPE_TEST_START = 0x21;
var PTYPE_TEST_FINISHED = 0x22;
var PTYPE_MAIN_FAILURE = 0x23;
var PTYPE_MAIN_RESTORED = 0x24;
var PTYPE_BATTERY_FAILURE = 0x25;
var PTYPE_HARDWARE_FAILURE = 0x26;
var PTYPE_SHUTDOWN = 0x27;
var TTYPE_NONE = 0x00;
var TTYPE_SHORT = 0x01;
var TTYPE_COMMISSIONING = 0x02;
var TTYPE_FUNCTION = 0x03;
var TTYPE_DURATION = 0x04;
var CHARGER_OFF = 0x00;
var CHARGER_TRICKLE = 0x01;
var CHARGER_FULL = 0x02;
var CHARGER_EMERGENCY = 0x03;
var STATUSLED_OFF = 0x00;
var STATUSLED_GREEN_CONT = 0x01;
var STATUSLED_GREEN_SLOW = 0x02;
var STATUSLED_GREEN_FAST = 0x03;
var STATUSLED_RED_CONT = 0x04;
var STATUSLED_RED_SLOW = 0x05;
var STATUSLED_RED_FAST = 0x06;
var FLAG_CONFIG_CORRUPTED = 0x00000002; //!< Configuration flash-memory corrupted
var FLAG_RAM_LOSS = 0x00000004; //!< RAM memory contents destroyed
var TIME_RTC_LOSS = 0x00000008; //!< RTC register contents destroyed
var TIME_RTC_FAILURE = 0x00000010; //!< RTC failure detected
var HAL_ULV_TOO_HIGH = 0x00000020; //!< Supply voltage too high
var HAL_UBAT_TOO_LOW = 0x00000040; //!< Battery voltage below absolute minimum
var HAL_UBAT_TOO_HIGH = 0x00000080; //!< Battery voltage above absolute maximum
var HAL_IBAT_LIMITS = 0x00000100; //!< Battery current exceeds allowable limits
var HAL_IBAT_CONTROL = 0x00000200; //!< Battery current control error
var BAT_CHARGING = 0x00000400; //!< Battery voltage too low after charging
var ATS_BAT_EXHAUSTED = 0x00000800; //!< Battery exhausted during any test
var ATS_BAT_DURATION = 0x00001000; //!< Battery exhausted during duration test
var LED_FAILURE = 0x00002000; //!< Led current control error
var LORA_CMD_ERROR = 0x00004000; //!< LoRa module did not respond
var LORA_TIMEOUT = 0x00008000; //!< LoRa module command timeout
function bin16dec(bin) {
  var num = bin & 0xffff;
  if (0x8000 & num) num = -(0x010000 - num);
  return num;
}
function bin8dec(bin) {
  var num = bin & 0xff;
  if (0x80 & num) num = -(0x0100 - num);
  return num;
}
function hexToBytes(hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2) bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
}
function DecodeStatusPart(data, obj) {
  obj.ch = data[0] & 3; // charger status
  obj.st = (data[0] & 240) >>> 4; // device status
  obj.swRa = data[1] & 1; // radar switch
  obj.swDl = (data[1] & 2) >>> 1; // daylight switch
  obj.swEm = (data[1] & 4) >>> 2; // emergency switch
  obj.swIn = (data[1] & 8) >>> 3; // intensity switch
  obj.l1 = (data[1] & 128) >>> 7;
  obj.l2 = (data[1] & 64) >>> 6;
  obj.led = data[2]; // led intensity
  obj.dcc = (data[3] << 8) | data[4]; // battery voltage
  obj.temp = data[5]; // board temperature
  obj.lft = data[6]; // days since last function test
  obj.ldt = (data[7] << 8) | data[8]; // days since last duration test
  obj.ltd = data[9]; // latest duration test duration
  return obj;
}
function DecodeHbiEmergencyLight(data) {
  var obj = {};
  var size;
  if (data.length < 5) {
    return obj;
  }
  obj.v = data[0] + '.' + data[1] + '.' + data[2];
  // if (obj.v !== "0.1.6") {
  //   return {};
  // }
  for (i = 4; i < data.length; i++) {
    // console.log(data[i]);
    switch (data[i]) {
      case PTYPE_STATUS:
        obj.type = 'status';
        size = data[i + 1];
        obj = DecodeStatusPart(data.slice(i + 2, i + 2 + size), obj);
        i += size;
        break;
      case PTYPE_TEST_START:
        obj.type = 'test-start';
        size = data[i + 1];
        obj = DecodeStatusPart(data.slice(i + 2, i + 2 + size), obj);
        obj.tt = bin8dec(data[i + 12]); // test type
        i += size;
        break;
      case PTYPE_TEST_FINISHED:
        obj.type = 'test-finished';
        size = data[i + 1];
        obj = DecodeStatusPart(data.slice(i + 2, i + 2 + size), obj);
        obj.tt = data[i + 12]; // test type
        obj.td = (data[i + 13] << 8) | data[i + 14]; // test duration
        i += size;
        break;
      case PTYPE_MAIN_FAILURE:
        obj.type = 'mains-failure';
        size = data[i + 1];
        obj = DecodeStatusPart(data.slice(i + 2, i + 2 + size), obj);
        i += size;
        break;
      case PTYPE_MAIN_RESTORED:
        obj.type = 'mains-restored';
        size = data[i + 1];
        obj = DecodeStatusPart(data.slice(i + 2, i + 2 + size), obj);
        obj.d = (data[i + 12] << 8) | data[i + 13]; // duration
        i += size;
        break;
      case PTYPE_BATTERY_FAILURE:
        obj.type = 'battery-failure';
        size = bin8dec(data[i + 1]);
        obj = DecodeStatusPart(data.slice(i + 2, i + 2 + size), obj);
        obj.flag = (data[i + 12] << 24) | (data[i + 13] << 16) | (data[i + 14] << 8) | data[i + 15]; // duration
        i += size;
        break;
      case PTYPE_HARDWARE_FAILURE:
        obj.type = 'hardware-failure';
        size = bin8dec(data[i + 1]);
        obj = DecodeStatusPart(data.slice(i + 2, i + 2 + size), obj);
        obj.flag = (data[i + 12] << 24) | (data[i + 13] << 16) | (data[i + 14] << 8) | data[i + 15]; // duration
        i += size;
        break;
      case PTYPE_SHUTDOWN:
        obj.type = 'shutdown';
        size = bin8dec(data[i + 1]);
        i += size;
        break;
      default:
        size = bin8dec(data[i + 1]);
        i += size;
        break;
    }
    i++;
  }
  return obj;
}
function Decoder(bytes, port) {
  return DecodeHbiEmergencyLight(bytes);
}
// // For Testing Only
// const messages = [
//   "00 01 02 0C 20 0A 22 87 0E 10 C6 0D 00 00 00 00", // status
//   "00 01 02 0D 21 0B 32 87 0E 10 A0 0F 00 00 00 00 01", // test start
//   "00 01 02 0F 22 0D 30 87 10 0F 0A 10 00 00 00 00 01 00 03", // test finished
//   "00 01 02 0C 23 0A 03 07 0E 10 c7 11 00 00 00 00", // mains failure
//   "00 01 02 0E 24 0C 00 C4 2E 0E 84 13 00 00 00 00 01 00", // mains restored
//   "00 01 02 10 25 0E 51 87 0E 17 8A 12 00 00 00 00 00 00 00 80", // battery failure
//   "00 01 02 10 26 0E 61 87 00 0F 9E 12 00 00 00 00 00 00 20 00", // hardware failure
//   "00 01 02 02 27 00" // shutdown
// ];
// messages.forEach(m => {
//   const r = m.split(" ");
//   const b = r.map(b => hexToBytes(b)[0]);
//   const msg = Decoder(b, 1);
//   console.log(JSON.stringify(msg));
// });

function decodeUplink(input) {
  return {
    data: Decoder(input.bytes, input.port),
    warnings: [],
    errors: [],
  };
}
