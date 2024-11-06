function decodeUplink(input) {
  // Parse the TTN NS platform input
  let bytes = input.bytes;
  //get uplink message type
  let uplink_type = (bytes[0] >> 4) & 0x0f;

  switch (uplink_type) {
    case 0x01:
      var Register_Msg = Register_proc(bytes);
      return {
        data: {
          bytes: Register_Msg,
        },
        warnings: [],
        errors: [],
      };

    case 0x02:
      var Heartbeat_Msg = Heartbeat_proc(bytes);
      return {
        data: {
          bytes: Heartbeat_Msg,
        },
        warnings: [],
        errors: [],
      };

    case 0x03:
      var Device_Report_Rule_Msg = Device_Report_Rule_proc(bytes);
      return {
        data: {
          bytes: Device_Report_Rule_Msg,
        },
        warnings: [],
        errors: [],
      };

    case 0x08:
      var Device_Type_1_Msg = Device_Type_1_proc(bytes);
      return {
        data: {
          bytes: Device_Type_1_Msg,
        },
        warnings: [],
        errors: [],
      };

    case 0x09:
      var Device_Type_2_Msg = Device_Type_2_proc(bytes);
      return {
        data: {
          bytes: Device_Type_2_Msg,
        },
        warnings: [],
        errors: [],
      };

    case 0x0a:
      var Device_Type_3_Msg = Device_Type_3_proc(bytes);
      return {
        data: {
          bytes: Device_Type_3_Msg,
        },
        warnings: [],
        errors: [],
      };

    case 0x0e:
      var Multi_Devices_Type_Msg = Multi_Devices_Type_proc(bytes);
      return {
        data: {
          bytes: Multi_Devices_Type_Msg,
        },
        warnings: [],
        errors: [],
      };

    case 0x0f:
      var Acknowledge_Msg = Acknowledge_proc(bytes);
      return {
        data: {
          bytes: Acknowledge_Msg,
        },
        warnings: [],
        errors: [],
      };

    default:
      return null;
  }
}

//Message type: Register  0x1
function Register_proc(bytes) {
  var Register_Msg = {
    type: 0,
    adr: 0,
    mode: 0,
    LoRaWANband: 0,
    LoRaTxpower: 0,
    ContinuousReceive: 0,
    dr: 0,
    pos: 0,
    hb: 0,
    BLEReceivingDuration: 0,
  };
  //type
  Register_Msg.type = 'Register';
  //adr
  Register_Msg.adr = (bytes[0] >> 3) & 0x1;
  switch (Register_Msg.adr) {
    case 0x0:
      Register_Msg.adr = 'OFF';
      break;

    case 0x1:
      Register_Msg.adr = 'ON';
      break;

    default:
      break;
  }
  //mode
  Register_Msg.mode = bytes[0] & 0x07;
  switch (Register_Msg.mode) {
    case 0x0:
      Register_Msg.mode = 'KR920';
      break;

    case 0x1:
      Register_Msg.mode = 'AU915';
      break;

    case 0x2:
      Register_Msg.mode = 'CLAA';
      break;

    case 0x3:
      Register_Msg.mode = 'CN470';
      break;

    case 0x4:
      Register_Msg.mode = 'AS923';
      break;

    case 0x5:
      Register_Msg.mode = 'EU433';
      break;

    case 0x6:
      Register_Msg.mode = 'EU868';
      break;

    case 0x7:
      Register_Msg.mode = 'US915';
      break;

    default:
      break;
  }

  //LoRaWANband
  Register_Msg.LoRaWANband = bytes[1];

  switch (Register_Msg.LoRaWANband) {
    case 0x00:
      Register_Msg.LoRaWANband = 'KR920';
      break;

    case 0x01:
      Register_Msg.LoRaWANband = 'AU915';
      break;

    case 0x02:
      Register_Msg.LoRaWANband = 'CLAA';
      break;

    case 0x04:
      Register_Msg.LoRaWANband = 'CN470';
      break;

    case 0x08:
      Register_Msg.LoRaWANband = 'AS923';
      break;

    case 0x10:
      Register_Msg.LoRaWANband = 'EU433';
      break;

    case 0x20:
      Register_Msg.LoRaWANband = 'EU868';
      break;

    case 0x40:
      Register_Msg.LoRaWANband = 'US915';
      break;

    default:
      break;
  }

  //LoRaTxpower
  Register_Msg.LoRaTxpower = ((bytes[2] >> 3) & 0x1f) + 'dBm';
  //continuousreceive
  Register_Msg.ContinuousReceive = (bytes[2] >> 1) & 0x3;
  switch (Register_Msg.ContinuousReceive) {
    case 0x0:
      Register_Msg.ContinuousReceive = 'Continuous Bluetooth receiving is disabled';
      break;

    case 0x1:
      Register_Msg.ContinuousReceive = 'Continuous Bluetooth receiving is enabled';
      break;

    default:
      break;
  }

  //DR
  Register_Msg.dr = 'DR' + ((bytes[3] >> 4) & 0x0f);

  //pos
  Register_Msg.pos = (((bytes[4] << 8) & 0xff00) | (bytes[5] & 0xff)) * 5 + 'sec';
  //HB
  Register_Msg.hb = bytes[6] * 30 + 'sec';
  //Bluetooth receiving duration
  Register_Msg.BLEReceivingDuration = bytes[7] + 'sec';

  return Register_Msg;
}

//Message type: Heartbeat  0x2
function Heartbeat_proc(bytes) {
  var Heartbeat_Msg = {
    type: 0,
    vol: 0,
    rssi: 0,
    snr: 0,
    ver: 0,
    chgstate: 0,
  };
  //type
  Heartbeat_Msg.type = 'Heartbeat';
  //vol
  if (bytes[1] <= 100) {
    Heartbeat_Msg.vol = bytes[1] + '%';
  } else {
    Heartbeat_Msg.vol = bytes[1] * 0.01 + 1.5;
    Heartbeat_Msg.vol = Heartbeat_Msg.vol + 'V';
  }
  //rssi
  Heartbeat_Msg.rssi = bytes[2] * -1 + 'dBm';
  //SNR
  Heartbeat_Msg.snr = (((bytes[3] << 8) & 0xff00) | (bytes[4] & 0xff)) * 0.01 + 'dB';
  //Ver
  Heartbeat_Msg.ver = 'VER' + (((bytes[5] << 8) & 0xff00) | (bytes[6] & 0xff)).toString(10).toUpperCase();
  //chgstate
  Heartbeat_Msg.chgstate = bytes[7] & 0x0f;
  switch (Heartbeat_Msg.chgstate) {
    case 0x0:
      Heartbeat_Msg.chgstate = 'Not charging';
      break;

    case 0x5:
      Heartbeat_Msg.chgstate = 'Charging';
      break;

    case 0x6:
      Heartbeat_Msg.chgstate = 'Charging completed';
      break;

    default:
      break;
  }

  return Heartbeat_Msg;
}

//Message type: Beacon   0x08
function Device_Report_Rule_proc(bytes) {
  var Device_Report_Rule_Msg = {
    type: 0,
    devicetypequanitity: 0,
    devicetypeid: 0,
    blockquantity: 0,
  };

  //data块长度
  var datalength = new Array();

  Device_Report_Rule_Msg.type = 'DeviceReportRule';
  //规则器数量
  Device_Report_Rule_Msg.devicetypequanitity = bytes[1] & 0xff;
  //规则器编号
  Device_Report_Rule_Msg.devicetypeid = (bytes[2] >> 4) & 0x0f;
  //规则块数量
  Device_Report_Rule_Msg.blockquantity = bytes[2] & 0x0f;

  //rule块长度
  var blocklength = 0;

  //输出规则块
  for (var i = 0; i < Device_Report_Rule_Msg.blockquantity; i++) {
    //payload filter block
    switch (bytes[3 + blocklength]) {
      case 0x01:
        Device_Report_Rule_Msg['FilterBlock' + (i + 1) + 'StartAddress'] = (Array(2).join(0) + (bytes[4 + blocklength] & 0xff).toString(16).toUpperCase()).slice(-2);
        Device_Report_Rule_Msg['FilterBlock' + (i + 1) + 'EndAddress'] = (Array(2).join(0) + (bytes[5 + blocklength] & 0xff).toString(16).toUpperCase()).slice(-2);

        //过滤字段长度
        var filterlength = bytes[5 + blocklength] - bytes[4 + blocklength] + 1;
        //过滤字段值
        var filtervalue = 0;

        for (var j = 0; j < filterlength; j++) {
          if (j == 0) filtervalue = (Array(2).join(0) + bytes[6 + blocklength + j].toString(16).toUpperCase()).slice(-2);
          else filtervalue = filtervalue + (Array(2).join(0) + bytes[6 + blocklength + j].toString(16).toUpperCase()).slice(-2);
        }

        blocklength = blocklength + 2 + filterlength + 1;
        Device_Report_Rule_Msg['FilterBlock' + (i + 1) + 'Filter Value'] = filtervalue;
        break;

      case 0x02:
        Device_Report_Rule_Msg['DataBlock' + (i + 1) + 'StartAddress'] = (Array(2).join(0) + (bytes[4 + blocklength] & 0xff).toString(16).toUpperCase()).slice(-2);
        Device_Report_Rule_Msg['DataBlock' + (i + 1) + 'EndAddress'] = (Array(2).join(0) + (bytes[5 + blocklength] & 0xff).toString(16).toUpperCase()).slice(-2);
        blocklength = blocklength + 2 + 1;
        break;
    }
  }

  return Device_Report_Rule_Msg;
}

//Message type: Lightperception 0xA
function Multi_Devices_Type_proc(bytes) {
  var Multi_Devices_Type_Msg = {
    type: 0,
    number: 0,
  };

  //type
  Multi_Devices_Type_Msg.type = 'Multi-Device Type Message';
  //number
  Multi_Devices_Type_Msg.number = bytes[0] & 0x0f;

  var le = (bytes.length - 1) / Multi_Devices_Type_Msg.number;
  for (var i = 0; i < Multi_Devices_Type_Msg.number; i++) {
    //beacon type ID
    var devicetypeID = bytes[1 + i * le] & 0x03;
    switch (devicetypeID) {
      case 0x1:
        devicetypeID = 'Device type 1 message';
        break;

      case 0x2:
        devicetypeID = 'Device type 2 message';
        break;

      case 0x3:
        devicetypeID = 'Device type 3 message';
        break;

      default:
        break;
    }
    //data数据
    var typedata = '';
    Multi_Devices_Type_Msg['Device' + (i + 1) + 'ID'] = devicetypeID;
    for (var j = 0; j < le - 2; j++) {
      if (j == 0) typedata = (Array(2).join(0) + bytes[2 + i * le + j].toString(16).toUpperCase()).slice(-2);
      else typedata = typedata + (Array(2).join(0) + bytes[2 + i * le + j].toString(16).toUpperCase()).slice(-2);
    }

    //data
    Multi_Devices_Type_Msg['Device' + (i + 1) + 'data'] = typedata;
    //rssi
    Multi_Devices_Type_Msg['Device' + (i + 1) + 'rssi'] = bytes[le * (i + 1)].toString(10).toUpperCase() - 256 + 'dBm';
  }
  return Multi_Devices_Type_Msg;
}

//Message type: Lightperception 0xA
function Device_Type_1_proc(bytes) {
  var Device_Type_1_Msg = {
    type: 0,
    number: 0,
  };

  //type
  Device_Type_1_Msg.type = 'Device Type 1 Message';
  //number
  Device_Type_1_Msg.number = bytes[0] & 0x0f;

  var le = (bytes.length - 1) / Device_Type_1_Msg.number;

  for (var i = 0; i < Device_Type_1_Msg.number; i++) {
    //data数据
    var type1data = 0;
    for (var j = 0; j < le - 1; j++) {
      if (j == 0) type1data = (Array(2).join(0) + bytes[1 + 5 * i + j].toString(16).toUpperCase()).slice(-2);
      else type1data = type1data + (Array(2).join(0) + bytes[1 + 5 * i + j].toString(16).toUpperCase()).slice(-2);
    }

    //data
    Device_Type_1_Msg['Devicetype1' + 'data' + (i + 1)] = type1data;
    //rssi
    Device_Type_1_Msg['Devicetype1' + 'rssi' + (i + 1)] = bytes[le * (i + 1)].toString(10).toUpperCase() - 256 + 'dBm';
  }

  return Device_Type_1_Msg;
}

//Message type: Lightperception 0xA
function Device_Type_2_proc(bytes) {
  var Device_Type_2_Msg = {
    type: 0,
    number: 0,
  };

  //type
  Device_Type_2_Msg.type = 'Device Type 2 Message';
  //number
  Device_Type_2_Msg.number = bytes[0] & 0x0f;

  var le = (bytes.length - 1) / Device_Type_2_Msg.number;

  for (var i = 0; i < Device_Type_2_Msg.number; i++) {
    //data数据
    var type2data = 0;
    for (var j = 0; j < le - 1; j++) {
      if (j == 0) type2data = (Array(2).join(0) + bytes[1 + 5 * i + j].toString(16).toUpperCase()).slice(-2);
      else type2data = type2data + (Array(2).join(0) + bytes[1 + 5 * i + j].toString(16).toUpperCase()).slice(-2);
    }

    //data
    Device_Type_2_Msg['Devicetype2' + 'data' + (i + 1)] = type2data;
    //number
    Device_Type_2_Msg['Devicetype2' + 'rssi' + (i + 1)] = bytes[le * (i + 1)].toString(10).toUpperCase() - 256 + 'dBm';
  }

  return Device_Type_2_Msg;
}
//Message type: Lightperception 0xA
function Device_Type_3_proc(bytes) {
  var Device_Type_3_Msg = {
    type: 0,
    number: 0,
  };

  //data
  Device_Type_3_Msg.type = 'Device Type 3 Message';
  //number
  Device_Type_3_Msg.number = bytes[0] & 0x0f;

  var le = (bytes.length - 1) / Device_Type_3_Msg.number;

  for (var i = 0; i < Device_Type_3_Msg.number; i++) {
    //data数据
    var type3data = 0;
    for (var j = 0; j < le - 1; j++) {
      if (j == 0) type3data = (Array(2).join(0) + bytes[1 + 5 * i + j].toString(16).toUpperCase()).slice(-2);
      else type3data = type3data + (Array(2).join(0) + bytes[1 + 5 * i + j].toString(16).toUpperCase()).slice(-2);
    }

    //data
    Device_Type_3_Msg['Devicetype3' + 'data' + (i + 1)] = type3data;
    //rssi
    Device_Type_3_Msg['Devicetype3' + 'rssi' + (i + 1)] = bytes[le * (i + 1)].toString(10).toUpperCase() - 256 + 'dBm';
  }

  return Device_Type_3_Msg;
}

//Message type: Acknowledge 0x0F
function Acknowledge_proc(bytes) {
  var Acknowledge_Msg = {
    type: 0,
    result: 0,
    msgid: 0,
  };

  //type
  Acknowledge_Msg.type = 'Acknowledgment';
  Acknowledge_Msg.result = bytes[0] & 0x0f;
  switch (Acknowledge_Msg.result) {
    case 0x0:
      Acknowledge_Msg.result = 'downlink success';
      break;

    case 0x1:
      Acknowledge_Msg.result = 'downlink failure';
      break;

    default:
      break;
  }
  Acknowledge_Msg.msgid = bytes[1].toString(16).toUpperCase();

  return Acknowledge_Msg;
}
