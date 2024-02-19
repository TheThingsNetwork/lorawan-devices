// Decode decodes an array of bytes into an object.
//  - fPort contains the LoRaWAN fPort number
//  - bytes is an array of bytes, e.g. [225, 230, 255, 0]
//  - variables contains the device variables e.g. {"calibration": "3.5"} (both the key / value are of type string)
// The function must return an object, e.g. {"temperature": 22.5}
function decodeUplink(input) {
  // Parse the TTN NS platform input
  let bytes = input.bytes
      //获取uplink消息类型
  let uplink_type = ((bytes[0] >> 4) & 0x0F);

  switch (uplink_type) {
      case 0x01:
          //proc
          let Register_Msg = Register_proc(bytes);
          return {
              data: {
                  bytes: Register_Msg
              },
              warnings: [],
              errors: []
          };

      case 0x03:
          let Heartbeat_Msg = Heartbeat_proc(bytes);
          return {
              data: {
                  bytes: Heartbeat_Msg
              },
              warnings: [],
              errors: []
          };

      case 0x0F:
          let Acknowledge_Msg = Acknowledge_proc(bytes);
          return {
              data: {
                  bytes: Acknowledge_Msg
              },
              warnings: [],
              errors: []
          };

      default:
          return null;
  }
}

//Message type: Register  0x1
function Register_proc(bytes) {
  var Register_Msg = {
      "type": 0,
      "adr": 0,
      "mode": 0,
      "smode": 0,
      "LoraTxpower": 0,
      "dr": 0,
      "repting": 0,
      "th": 0,
      "crc": 0
  };

  //type
  Register_Msg.type = "Register";
  Register_Msg.adr = ((bytes[0] >> 3) & 0x01);
  switch (Register_Msg.adr) {
      case 0:
          Register_Msg.adr = "false";
          break;

      case 1:
          Register_Msg.adr = "true";
          break;

      default:
          break;
  }
  //mode
  Register_Msg.mode = (bytes[0] & 0x07);
  switch (Register_Msg.mode) {
      case 0x1:
          Register_Msg.mode = "AU920";
          break;

      case 0x2:
          Register_Msg.mode = "CLAA";
          break;

      case 0x3:
          Register_Msg.mode = "CN470";
          break;

      case 0x4:
          Register_Msg.mode = "AS923";
          break;

      case 0x5:
          Register_Msg.mode = "EU433";
          break;

      case 0x6:
          Register_Msg.mode = "EU868";
          break;

      case 0x7:
          Register_Msg.mode = "US915";
          break;

      default:
          break;
  }
  //smode
  Register_Msg.smode = bytes[1];
  switch (Register_Msg.smode) {
      case 0x01:
          Register_Msg.smode = "AU920";
          break;

      case 0x2:
          Register_Msg.smode = "CLAA";
          break;

      case 0x04:
          Register_Msg.smode = "CN470";
          break;

      case 0x08:
          Register_Msg.smode = "AS923";
          break;

      case 0x10:
          Register_Msg.smode = "EU433";
          break;

      case 0x20:
          Register_Msg.smode = "EU868";
          break;

      case 0x40:
          Register_Msg.smode = "US915";
          break;

      default:
          break;
  }
  //LoraTxpower
  Register_Msg.LoraTxpower = ((bytes[2] >> 3) & 0x1F) + "dBm";
  //dr
  Register_Msg.dr = "DR" + ((bytes[3] >> 4) & 0x0F);
  //repting
  Register_Msg.repting = ((bytes[3] >> 3) & 0x01);
  switch (Register_Msg.repting) {
      case 0x0:
          Register_Msg.repting = "false";
          break;

      case 0x1:
          Register_Msg.repting = "true";
          break;

      default:
          break;
  }
  //TH
  Register_Msg.th = ((((bytes[4] << 8) & 0xFF00) | (bytes[5] & 0xFF)) * 10) + "sec";
  //crc
  Register_Msg.crc = (((bytes[6] << 8) & 0xFF00) | (bytes[7] & 0xFF));
  return Register_Msg;
}

//Message type: Heartbeat  0x3
function Heartbeat_proc(bytes) {
  var Heartbeat_Msg = {
      "type": 0,
      "tnum": 0,
      "vol": 0,
      "rssi": 0,
      "crc": 0,
  };
  //type
  Heartbeat_Msg.type = "Heartbeat";
  //version
  Heartbeat_Msg.tnum = (bytes[0] & 0x0F);
  //battery level
  Heartbeat_Msg.vol = bytes[1] + "%";
  //rssi
  Heartbeat_Msg.rssi = (bytes[2] * (-1)) + "dBm";

  //temp
  for (var i = 0; i < Heartbeat_Msg.tnum + 1; i++) {
      var tmp1 = i + 1;
      Heartbeat_Msg["TEMP" + tmp1] = ((((bytes[3 + 2 * i] << 8) & 0xFF00) | (bytes[4 + 2 * i] & 0xFF)) * (0.01)) + "℃";
  }
  //CRC
  Heartbeat_Msg.crc = (((bytes[3 + 2 * (Heartbeat_Msg.tnum)] << 8) & 0xFF00) | (bytes[4 + 2 * (Heartbeat_Msg.tnum)] & 0xFF));
  return Heartbeat_Msg;
}

//Message type: Acknowledge  0xF
function Acknowledge_proc(bytes) {
  var Acknowledge_Msg = {
      "type": 0,
      "result": 0,
      "msgid": 0,
  };
  Acknowledge_Msg.type = "Acknowledge";
  Acknowledge_Msg.result = (bytes[0] & 0x0F);
  Acknowledge_Msg.msgid = bytes[1];
  return Acknowledge_Msg;
}