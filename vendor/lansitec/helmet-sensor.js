function decodeUplink(input) {
  // Parse the TTN NS platform input
  var bytes = input.bytes;
  //get uplink message type
  var uplinkType = ((bytes[0] >> 4) & 0x0F);
  switch (uplinkType) {
      case 0x01:
          var registrationMessage = registrationProcedure(bytes);
          return {
            data: {
                bytes: registrationMessage
            },
            warnings: [],
            errors: []
          };

      case 0x02:
          var heartbeatMessage = heartbeatProcedure(bytes);
          return {
            data: {
                bytes: heartbeatMessage
            },
            warnings: [],
            errors: []
          };

      case 0x03:
          var gnssPositionMessage = gnssPositionProcedure(bytes);
          return {
            data: {
                bytes: gnssPositionMessage
            },
            warnings: [],
            errors: []
          };

      case 0x07:
          var beaconMessage = beaconProcedure(bytes);
          return {
            data: {
                bytes: beaconMessage
            },
            warnings: [],
            errors: []
          };

      case 0x08:
          var alarmMessage = alarmProcedure(bytes);
          return {
            data: {
                bytes: alarmMessage
            },
            warnings: [],
            errors: []
          };

      default:
          return null;
  }
}

// 5.1 Registration, type: 0x1 注册消息
function registrationProcedure(bytes) {
  var registrationMessage = {
      type: "",
      adr: "",
      loraTXPower: "",
      dr: "",
      gnssEnable: "",
      positioningMode: "",
      bleEnable: "",
      blePosition: "",
      gpsPosition: "",
      heartbeatPeriod: "",
      firmwareVersion: "",
      cfmmsg: "",
      hbcount: "",
      fallDetectFeatureThreshold: ""
  };
  // Message type
  registrationMessage.type= "Register";
  // ADR
  registrationMessage.adr = ((bytes[0] >> 3) & 0x1);
  switch (registrationMessage.adr) {
      case 0x0:
          registrationMessage.adr = "OFF";
          break;

      case 0x1:
          registrationMessage.adr = "ON";
          break;

      default:
          break;
  }

  // LoraTxpower
  registrationMessage.loraTXPower = ((bytes[2] >> 3) & 0x1F) + "dBm";

  // DR
  registrationMessage.dr = "dr" + ((bytes[3] >> 4) & 0x0F);

  // GNSSEN
  registrationMessage.gnssEnable = ((bytes[3] >> 3) & 0x01);
  switch (registrationMessage.gnssEnable) {
      case 0x0:
          registrationMessage.gnssEnable = "Disable";
          break;

      case 0x1:
          registrationMessage.gnssEnable = "Enable";
          break;

      default:
          break;
  }

  // POSMODE
  registrationMessage.positioningMode = ((bytes[3] >> 1) & 0x03);
  switch (registrationMessage.positioningMode) {
      case 0x0:
          registrationMessage.positioningMode = "Period";
          break;

      case 0x1:
          registrationMessage.positioningMode = "Autonomous";
          break;

      case 0x2:
          registrationMessage.positioningMode = "On-Demand";
          break;

      default:
          break;
  }
  // BLEEN
  registrationMessage.bleEnable = bytes[3] & 0x01;
  switch (registrationMessage.bleEnable) {
      case 0x0:
          registrationMessage.bleEnable = "Disable";
          break;
      case 0x1:
          registrationMessage.bleEnable = "Enable";
          break;
      default:
          break;
  }
  // BLE POS
  registrationMessage.blePosition= ((((bytes[4] << 8) & 0xFF00) | (bytes[5] & 0xFF)) * 5) + "sec";
  // GPS POS
  registrationMessage.gpsPosition= ((((bytes[6] << 8) & 0xFF00) | (bytes[7] & 0xFF)) * 5) + "sec";
  // HB
  registrationMessage.heartbeatPeriod = ((bytes[8] & 0xFF) * 30) + "sec";
  // ver
  registrationMessage.firmwareVersion = "V" + ((bytes[9] & 0xFF).toString(16).toUpperCase()) + "." + ((bytes[10] & 0xFF).toString(16).toUpperCase());
  // CFMMSG
  registrationMessage.cfmmsg = "1 Confirmed every " + (bytes[11] & 0xFF) + " Heartbeat";
  // HBCOUNT
  registrationMessage.hbcount = "Disconnect Judgement " + (bytes[12] & 0xFF);
  // Fall threshold
  registrationMessage.fallDetectFeatureThreshold = ((bytes[13] & 0xFF) * 0.5) + " meter";
  return registrationMessage;
}

// 5.2 Heartbeat, type: 0x2 心跳消息
function heartbeatProcedure(bytes) {
  var heartbeatMessage = {
      type: "",
      batteryPercentage: "",
      rssi: "",
      snr: "",
      bleState: "",
      gpsState: "",
      chargeTime : "",
      wearTime : "",
      moveState:""
  };
  // type
  heartbeatMessage.type = "Heartbeat";
  // vol
  heartbeatMessage.batteryPercentage = bytes[1] + "%";
  // rssi
  heartbeatMessage.rssi = (bytes[2] * (-1)) + "dBm";
  // SNR
  heartbeatMessage.snr = ((((bytes[3] << 8) & 0xFF00) | (bytes[4] & 0xFF)) * 0.01) + "dB";
  // BLESTATE
  heartbeatMessage.bleState = bytes[5];
  // GPSSTATE
  heartbeatMessage.gpsState = bytes[6];
  // CHGTIME
  heartbeatMessage.chargeTime = bytes[7] * 30 + "s";
  // WEARTIME
  heartbeatMessage.wearTime = bytes[8] * 30 + "s";
  // VIBSTATE
  heartbeatMessage.moveState = ((bytes[9] >> 4) & 0x0F);
  if(heartbeatMessage.moveState == 0){
      heartbeatMessage.moveState = heartbeatMessage.moveState + " No Moving";
  } else if (heartbeatMessage.moveState > 0){
      heartbeatMessage.moveState = heartbeatMessage.moveState + " Move";
  }
  return heartbeatMessage;
}

// 5.3 GNSS Position, type: 0x3 经纬度消息
function gnssPositionProcedure(bytes) {
  var gnssPositionMessage = {
      type: "",
      gpsState: "",
      wearState: "",
      pressure: "",
      longitude: 0.0,
      latitude: 0.0,
      time: "",
  };
  // type
  gnssPositionMessage.type = "GNSSPosition";
  // gpsState
  gnssPositionMessage.gpsState = ((bytes[0] >> 3) & 0x01);
  switch (gnssPositionMessage.gpsState) {
      case 0x0:
          gnssPositionMessage.gpsState = "gps location success";
          break;
      case 0x1:
          gnssPositionMessage.gpsState = "gps location fail";
          break;
      default:
          break;
  }
  // wearState
  gnssPositionMessage.wearState = ((bytes[0]) & 0x01);
  switch (gnssPositionMessage.wearState) {
      case 0x0:
          gnssPositionMessage.wearState = "do not wear";
          break;
      case 0x1:
          gnssPositionMessage.wearState = "wear";
          break;
      default:
          break;
  }
  // PRESSURE
  gnssPositionMessage.pressure = ((bytes[1] << 24) & 0xFF000000);
  gnssPositionMessage.pressure |= ((bytes[2] << 16) & 0xFF0000);
  gnssPositionMessage.pressure |= ((bytes[3] << 8) & 0xFF00);
  gnssPositionMessage.pressure |= (bytes[4] & 0xFF);
  // longitude
  gnssPositionMessage.longitude = ((bytes[5] << 24) & 0xFF000000);
  gnssPositionMessage.longitude |= ((bytes[6] << 16) & 0xFF0000);
  gnssPositionMessage.longitude |= ((bytes[7] << 8) & 0xFF00);
  gnssPositionMessage.longitude |= (bytes[8] & 0xFF);
  gnssPositionMessage.longitude = hex2float(gnssPositionMessage.longitude);
  // latitude
  gnssPositionMessage.latitude = ((bytes[9] << 24) & 0xFF000000);
  gnssPositionMessage.latitude |= ((bytes[10] << 16) & 0xFF0000);
  gnssPositionMessage.latitude |= ((bytes[11] << 8) & 0xFF00);
  gnssPositionMessage.latitude |= (bytes[12] & 0xFF);
  gnssPositionMessage.latitude = hex2float(gnssPositionMessage.latitude);
  // time
  gnssPositionMessage.time = ((bytes[13] << 24) & 0xFF000000);
  gnssPositionMessage.time |= ((bytes[14] << 16) & 0xFF0000);
  gnssPositionMessage.time |= ((bytes[15] << 8) & 0xFF00);
  gnssPositionMessage.time |= (bytes[16] & 0xFF);
  gnssPositionMessage.time = JSON.stringify(new Date((gnssPositionMessage.time + 8 * 60 * 60) * 1000));
  return gnssPositionMessage;
}
// 浮点数转换
function hex2float(num) {
  var sign = (num & 0x80000000) ? -1 : 1;
  var exponent = ((num >> 23) & 0xff) - 127;
  var mantissa = 1 + ((num & 0x7fffff) / 0x7fffff);
  return sign * mantissa * Math.pow(2, exponent);
}

// 5.4 Beacon, type: 0x7 信标消息
function beaconProcedure(bytes) {
  var beaconMessage = {
      type: "",
      wearState: "",
      pressure: "",
      posLength: 0,
      assetLength: 0
  };
  beaconMessage.type = "BleCoordinate";
  // wearState
  beaconMessage.wearState = ((bytes[0]) & 0x01);
  switch (beaconMessage.wearState) {
      case 0x0:
          beaconMessage.wearState = "do not wear";
          break;
      case 0x1:
          beaconMessage.wearState = "wear";
          break;
      default:
          break;
  }
  // PRESSURE
  beaconMessage.pressure = ((bytes[1] << 24) & 0xFF000000);
  beaconMessage.pressure |= ((bytes[2] << 16) & 0xFF0000);
  beaconMessage.pressure |= ((bytes[3] << 8) & 0xFF00);
  beaconMessage.pressure |= (bytes[4] & 0xFF);
  // POS LEN
  beaconMessage.posLength = (bytes[5] & 0x0F);
  // ASSET LEN
  beaconMessage.assetLength = (bytes[6] & 0x0F);
  
  for (var i = 1; i < (beaconMessage.posLength + 1); i++) {
      var tmp = i - 1;
      beaconMessage["pos" + i + "major"] = (((bytes[7 + 5 * tmp] << 8) & 0xFF00) | (bytes[8 + 5 * tmp] & 0xFF)).toString(16).toUpperCase();
      beaconMessage["pos" + i + "minor"] = (((bytes[9 + 5 * tmp] << 8) & 0xFF00) | (bytes[10 + 5 * tmp] & 0xFF)).toString(16).toUpperCase();
      beaconMessage["pos" + i + "rssi"] = (bytes[11 + 5 * tmp] - 256) + "dBm";
      beaconMessage["pos" + i + "major"] = (Array(4).join(0) + beaconMessage["pos" + i + "major"]).slice(-4);
      beaconMessage["pos" + i + "minor"] = (Array(4).join(0) + beaconMessage["pos" + i + "minor"]).slice(-4);
  }
  var posIndex = beaconMessage.posLength * 5;
  for (var i = 1; i < (beaconMessage.assetLength + 1); i++) {
      var tmp = i - 1;
      beaconMessage["asset" + i + "major"] = (((bytes[7 + posIndex + 5 * tmp] << 8) & 0xFF00) | (bytes[8 + posIndex + 5 * tmp] & 0xFF)).toString(16).toUpperCase();
      beaconMessage["asset" + i + "minor"] = (((bytes[9 + posIndex + 5 * tmp] << 8) & 0xFF00) | (bytes[10 + posIndex + 5 * tmp] & 0xFF)).toString(16).toUpperCase();
      beaconMessage["asset" + i + "rssi"] = (bytes[11 + posIndex + 5 * tmp] - 256) + "dBm";
      beaconMessage["asset" + i + "major"] = (Array(4).join(0) + beaconMessage["asset" + i + "major"]).slice(-4);
      beaconMessage["asset" + i + "minor"] = (Array(4).join(0) + beaconMessage["asset" + i + "minor"]).slice(-4);
  }
  return beaconMessage;
}

// 5.5 Alarm, type: 0x8 告警消息
function alarmProcedure(bytes) {
  var alarmMessage = {
      type: "",
      alarm : ""
  };
  alarmMessage.type = "Alarm";
  alarmMessage.alarm = (bytes[1] & 0xFF);
  switch (alarmMessage.alarm) {
      case 0x01:
          alarmMessage.alarm = "SOS";
          break;
      case 0x02:
          alarmMessage.alarm = "Fall";
          break;
      case 0x03:
          alarmMessage.alarm = "Danger Area";
          break;
      case 0x04:
          alarmMessage.alarm = "Search";
          break;           
      default:
          break;
  }
  return alarmMessage;
}