function decodeUplink(input) {
  // Parse the TTN NS platform input
  let bytes = input.bytes
      //get uplink message type
  let uplink_type = ((bytes[0] >> 4) & 0x0F);

  switch (uplink_type) {
      case 0x01:
          let Register_Msg = Register_proc(bytes);
          return {
              data: {
                  bytes: Register_Msg
              },
              warnings: [],
              errors: []
          };

      case 0x02:
          let Heartbeat_Msg = Heartbeat_proc(bytes);
          return {
              data: {
                  bytes: Heartbeat_Msg
              },
              warnings: [],
              errors: []
          };

      case 0x03:
          let GNSSPosition_Msg = GNSSPosition_proc(bytes);
          return {
              data: {
                  bytes: GNSSPosition_Msg
              },
              warnings: [],
              errors: []
          };

      case 0x07:
          let Beacon_Msg = Beacon_proc(bytes);
          return {
              data: {
                  bytes: Beacon_Msg
              },
              warnings: [],
              errors: []
          };

      case 0x08:
          let Alarm_Msg = Alarm_proc(bytes);
          return {
              data: {
                  bytes: Alarm_Msg
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
      "Message type": 0,
      "ADR": 0,
      "Lora Txpower": 0,
      "DR": 0,
      "GNSSEN": 0,
      "Position mode": 0,
      "Position period": 0,
      "Heartbeat period": 0,
      "Firmware version": 0,
      "CFMMSG": 0,
      "HBCOUNT": 0,
      "Fall threshold": 0
  };
  //Message type
  Register_Msg["Message type"] = "Register";
  //adr
  Register_Msg.ADR = ((bytes[0] >> 3) & 0x1);
  switch (Register_Msg.ADR) {
      case 0x0:
          Register_Msg.ADR = "OFF";
          break;

      case 0x1:
          Register_Msg.ADR = "ON";
          break;

      default:
          break;
  }

  //LoraTxpower
  Register_Msg["Lora Txpower"] = ((bytes[2] >> 3) & 0x1F) + "dBm";

  //DR
  Register_Msg.DR = "DR" + ((bytes[3] >> 4) & 0x0F);

  //GNSSEN
  Register_Msg.GNSSEN = ((bytes[3] >> 3) & 0x01);
  switch (Register_Msg.GNSSEN) {
      case 0x0:
          Register_Msg.GNSSEN = "Disable";
          break;

      case 0x1:
          Register_Msg.GNSSEN = "Enable";
          break;

      default:
          break;
  }

  //posmode
  Register_Msg["Position mode"] = ((bytes[3] >> 1) & 0x03);
  switch (Register_Msg["Position mode"]) {
      case 0x0:
          Register_Msg["Position mode"] = "Period";
          break;

      case 0x1:
          Register_Msg["Position mode"] = "Autonomous";
          break;

      case 0x2:
          Register_Msg["Position mode"] = "On-Demand";
          break;

      default:
          break;
  }

  //pos
  Register_Msg["Position period"] = ((((bytes[4] << 8) & 0xFF00) | (bytes[5] & 0xFF)) * 5) + "sec";
  //HB
  Register_Msg["Heartbeat period"] = ((bytes[6] & 0xFF) * 30) + "sec";
  //ver
  Register_Msg["Firmware version"] = "V" + ((bytes[7] & 0xFF).toString(16).toUpperCase()) + "." + ((bytes[8] & 0xFF).toString(16).toUpperCase());
  //CFMMSG
  Register_Msg.CFMMSG = "1 Confirmed every " + (bytes[9] & 0xFF) + " Heartbeat";
  //HBCOUNT
  Register_Msg.HBCOUNT = "Disconnect Judgement " + (bytes[10] & 0xFF);
  //Fall threshold
  Register_Msg["Fall threshold"] = ((bytes[11] & 0xFF) * 0.5) + " meter";

  return Register_Msg;
}

//Message type: Heartbeat  0x2
function Heartbeat_proc(bytes) {
  var Heartbeat_Msg = {
      "Message type": 0,
      "Battery level": 0,
      "RSSI": 0,
      "SNR": 0,
      "GPS state": 0,
      "Move state": 0,
      "Charge state": 0
  };
  //type
  Heartbeat_Msg["Message type"] = "Heartbeat";
  //vol
  Heartbeat_Msg["Battery level"] = bytes[1] + "%";
  //rssi
  Heartbeat_Msg.RSSI = (bytes[2] * (-1)) + "dBm";
  //SNR
  Heartbeat_Msg.SNR = ((((bytes[3] << 8) & 0xFF00) | (bytes[4] & 0xFF)) * 0.01) + "dB";
  //GPSSTATE
  Heartbeat_Msg["GPS state"] = ((bytes[5] >> 4) & 0x0F);
  switch (Heartbeat_Msg["GPS state"]) {
      case 0x00:
          Heartbeat_Msg["GPS state"] = "GPS OFF";
          break;

      case 0x01:
          Heartbeat_Msg["GPS state"] = "GPS boot";
          break;

      case 0x02:
          Heartbeat_Msg["GPS state"] = "GPS locating";
          break;

      case 0x03:
          Heartbeat_Msg["GPS state"] = "GPS located";
          break;

      case 0x09:
          Heartbeat_Msg["GPS state"] = "GPS no signal";
          break;

      default:
          break;
  }
  //vibstate
  Heartbeat_Msg["Move state"] = (bytes[5] & 0x0F);
  switch (Heartbeat_Msg["Move state"]) {
      case 0x00:
          Heartbeat_Msg["Move state"] = "No Move";
          break;

      case 0x01:
          Heartbeat_Msg["Move state"] = "Move";
          break;

      default:
          break;
  }
  //chgstate
  Heartbeat_Msg["Charge state"] = ((bytes[6] >> 4) & 0x0F);
  switch (Heartbeat_Msg["Charge state"]) {
      case 0x0:
          Heartbeat_Msg["Charge state"] = "Power cable disconnected";
          break;

      case 0x5:
          Heartbeat_Msg["Charge state"] = "Charging";
          break;

      case 0x6:
          Heartbeat_Msg["Charge state"] = "Charge complete";
          break;

      default:
          break;
  }
  return Heartbeat_Msg;
}

function hex2float(num) {
  var sign = (num & 0x80000000) ? -1 : 1;
  var exponent = ((num >> 23) & 0xff) - 127;
  var mantissa = 1 + ((num & 0x7fffff) / 0x7fffff);
  return sign * mantissa * Math.pow(2, exponent);
}

//Message type: GNSSPosition  0x03
function GNSSPosition_proc(bytes) {
  var GNSSPposition_Msg = {
      "Message type": 0,
      "Longitude": 0.0,
      "Latitude": 0.0,
      "Time": 0,
  };
  //type
  GNSSPposition_Msg["Message type"] = "GNSSPosition";

  //longitude
  GNSSPposition_Msg.Longitude = ((bytes[1] << 24) & 0xFF000000);
  GNSSPposition_Msg.Longitude |= ((bytes[2] << 16) & 0xFF0000);
  GNSSPposition_Msg.Longitude |= ((bytes[3] << 8) & 0xFF00);
  GNSSPposition_Msg.Longitude |= (bytes[4] & 0xFF);
  GNSSPposition_Msg.Longitude = hex2float(GNSSPposition_Msg.Longitude);

  //latitude
  GNSSPposition_Msg.Latitude = ((bytes[5] << 24) & 0xFF000000);
  GNSSPposition_Msg.Latitude |= ((bytes[6] << 16) & 0xFF0000);
  GNSSPposition_Msg.Latitude |= ((bytes[7] << 8) & 0xFF00);
  GNSSPposition_Msg.Latitude |= (bytes[8] & 0xFF);
  GNSSPposition_Msg.Latitude = hex2float(GNSSPposition_Msg.Latitude);

  //time
  GNSSPposition_Msg.Time = ((bytes[9] << 24) & 0xFF000000);
  GNSSPposition_Msg.Time |= ((bytes[10] << 16) & 0xFF0000);
  GNSSPposition_Msg.Time |= ((bytes[11] << 8) & 0xFF00);
  GNSSPposition_Msg.Time |= (bytes[12] & 0xFF);
  GNSSPposition_Msg.Time = JSON.stringify(new Date((GNSSPposition_Msg.Time + 8 * 60 * 60) * 1000));
  return GNSSPposition_Msg;
}
//0x04
function OnDemandPosition_proc(bytes) {
  var OnDemandPosition_Msg = {
      "rfu1": 0,
      "msgid": 0,
      "longitude": 0,
      "latitude": 0,
      "time": 0,
  }
  OnDemandPosition_Msg.rfu1 = (bytes[0] & 0x0F);
  OnDemandPosition_Msg.msgid = bytes[1];

  OnDemandPosition_Msg.longitude = ((bytes[2] << 24) & 0xFF000000);
  OnDemandPosition_Msg.longitude |= ((bytes[3] << 16) & 0xFF0000);
  OnDemandPosition_Msg.longitude |= ((bytes[4] << 8) & 0xFF00);
  OnDemandPosition_Msg.longitude |= (bytes[5] & 0xFF);
  OnDemandPosition_Msg.longitude = hex2float(GNSSPposition_Msg.longitude);

  //latitude
  OnDemandPosition_Msg.latitude = ((bytes[6] << 24) & 0xFF000000);
  OnDemandPosition_Msg.latitude |= ((bytes[7] << 16) & 0xFF0000);
  OnDemandPosition_Msg.latitude |= ((bytes[8] << 8) & 0xFF00);
  OnDemandPosition_Msg.latitude |= (bytes[9] & 0xFF);
  OnDemandPosition_Msg.latitude = hex2float(GNSSPposition_Msg.latitude);

  //time
  OnDemandPosition_Msg.time = ((bytes[10] << 24) & 0xFF000000);
  OnDemandPosition_Msg.time |= ((bytes[11] << 16) & 0xFF0000);
  OnDemandPosition_Msg.time |= ((bytes[12] << 8) & 0xFF00);
  OnDemandPosition_Msg.time |= (bytes[13] & 0xFF);
  OnDemandPosition_Msg.time = JSON.stringify(new Date((GNSSPposition_Msg.time + 8 * 60 * 60) * 1000));

  return OnDemandPosition_Msg;
}

//Message type: Beacon   0x07
function Beacon_proc(bytes) {
  var Beacon_Msg = {
      "Message type": 0,
      "Length": 0,
      "Vibstate": 0
  };
  Beacon_Msg["Message type"] = "BleCoordinate";
  Beacon_Msg.Length = (bytes[0] & 0x0F);
  Beacon_Msg.Vibstate = bytes[1] + "level";
  for (var i = 1; i < (Beacon_Msg.Length + 1); i++) {
      var tmp = i - 1;
      Beacon_Msg["dev" + i + "major"] = (((bytes[6 + 5 * tmp] << 8) & 0xFF00) | (bytes[7 + 5 * tmp] & 0xFF)).toString(16).toUpperCase();
      Beacon_Msg["dev" + i + "minor"] = (((bytes[8 + 5 * tmp] << 8) & 0xFF00) | (bytes[9 + 5 * tmp] & 0xFF)).toString(16).toUpperCase();
      Beacon_Msg["dev" + i + "rssi"] = (bytes[10 + 5 * tmp] - 256) + "dBm";
      Beacon_Msg["dev" + i + "major"] = (Array(4).join(0) + Beacon_Msg["dev" + i + "major"]).slice(-4);
      Beacon_Msg["dev" + i + "minor"] = (Array(4).join(0) + Beacon_Msg["dev" + i + "minor"]).slice(-4);
  }
  return Beacon_Msg;
}

//0x08
function Alarm_proc(bytes) {
  var Alarm_Msg = {
      "Message type": 0,
      "Alarm type": 0
  };
  Alarm_Msg["Message type"] = "Alarm";
  Alarm_Msg["Alarm type"] = (bytes[1] & 0xFF);
  switch (Alarm_Msg["Alarm type"]) {
      case 0x01:
          Alarm_Msg["Alarm type"] = "SOS";
          break;

      case 0x02:
          Alarm_Msg["Alarm type"] = "Fall";
          break;

      default:
          break;
  }
  return Alarm_Msg;
}