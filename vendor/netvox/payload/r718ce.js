function getCfgCmd(cfgcmd){
  var cfgcmdlist = {
    1:   "ConfigReportReq",
    129: "ConfigReportRsp",
    2:   "ReadConfigReportReq",
    130: "ReadConfigReportRsp",
    3:   "SetThermocoupleTypeReq",
    131: "SetThermocoupleTypeRsp",
    4:   "GetThermocoupleTypeReq",
    132: "GetThermocoupleTypeRsp"
  };
  return cfgcmdlist[cfgcmd];
}

function getDeviceName(dev){
  var deviceName = {
    148: "R718CE"
  };
  return deviceName[dev];
}

function getCmdToID(cmdtype){
  if (cmdtype == "ConfigReportReq")
    return 1;
  else if (cmdtype == "ConfigReportRsp")
    return 129;
  else if (cmdtype == "ReadConfigReportReq")
    return 2;
  else if (cmdtype == "ReadConfigReportRsp")
    return 130;
  else if (cmdtype == "SetThermocoupleTypeReq")
    return 3;
  else if (cmdtype == "SetThermocoupleTypeRsp")
    return 131;
  else if (cmdtype == "GetThermocoupleTypeReq")
    return 4;
  else if (cmdtype == "GetThermocoupleTypeRsp")
    return 132;
}

function getDeviceType(devName){
  if (devName == "R718CE")
    return 148;
}

function padLeft(str, len) {
  str = '' + str;
  if (str.length >= len) {
    return str;
  } else {
    return padLeft("0" + str, len);
  }
}

function decodeUplink(input) {
  var data = {};
  switch (input.fPort) {
    case 6:
      if (input.bytes[2] === 0x00) {
        data.Device = getDeviceName(input.bytes[1]);
        data.SWver = input.bytes[3] / 10;
        data.HWver = input.bytes[4];
        data.Datecode = padLeft(input.bytes[5].toString(16), 2) + padLeft(input.bytes[6].toString(16), 2) + padLeft(input.bytes[7].toString(16), 2) + padLeft(input.bytes[8].toString(16), 2);
        
        return {
          data: data,
        };
      }

      if (input.bytes[3] & 0x80) {
        var tmp_v = input.bytes[3] & 0x7F;
        // 解析电压：高4位为整数部分，低4位为小数部分
        var intPart = (tmp_v >> 4) & 0x0F;
        var decPart = tmp_v & 0x0F;
        data.Volt = (intPart + decPart / 10).toString() + '(low battery)';
      } else {
        // 解析电压：高4位为整数部分，低4位为小数部分
        var intPart = (input.bytes[3] >> 4) & 0x0F;
        var decPart = input.bytes[3] & 0x0F;
        data.Volt = intPart + decPart / 10;
      }

      data.Device = getDeviceName(input.bytes[1]);
      
      // Temperature handling (2 bytes, signed)
      var tempVal = (input.bytes[4] << 8) | input.bytes[5];
      if (input.bytes[4] & 0x80) {
        data.Temp = (0x10000 - tempVal) * -1;
      } else {
        data.Temp = tempVal;
      }
      
      break;
      
    case 7:
      data.Device = getDeviceName(input.bytes[1]);
      data.Cmd = getCfgCmd(input.bytes[0]);
      
      if (input.bytes[0] === 0x81) {
        data.Status = (input.bytes[2] === 0x00) ? 'Success' : 'Failure';
      } else if (input.bytes[0] === 0x82) {
        data.MinTime = (input.bytes[2] << 8) | input.bytes[3];
        data.MaxTime = (input.bytes[4] << 8) | input.bytes[5];
        // 解析BatteryChange：高4位为整数部分，低4位为小数部分
        var intPart = (input.bytes[6] >> 4) & 0x0F;
        var decPart = input.bytes[6] & 0x0F;
        data.BatteryChange = intPart + decPart / 10;
        
        // TemperatureChange handling (2 bytes, signed)
        var tempChgVal = (input.bytes[7] << 8) | input.bytes[8];
        if (input.bytes[7] & 0x80) {
          data.TempChange = (0x10000 - tempChgVal) / 10 * -1;
        } else {
          data.TempChange = tempChgVal / 10;
        }
      } else if (input.bytes[0] === 0x83) {
        data.Status = (input.bytes[2] === 0x00) ? 'Success' : 'Failure';
      } else if (input.bytes[0] === 0x84) {
        data.ThermocoupleType = input.bytes[2];
      }
      break;

    default:
      return {
        errors: ['unknown FPort'],
      };
  }
          
  return {
    data: data,
  };
}
  
function encodeDownlink(input) {
  var ret = [];
  var devid;
  var port;
  var getCmdID;
      
  getCmdID = getCmdToID(input.data.Cmd);
  devid = getDeviceType(input.data.Device);

  if (input.data.Cmd == "ConfigReportReq") {
    var mint = input.data.MinTime;
    var maxt = input.data.MaxTime;
    // 将BatteryChange转换为高4位为整数部分，低4位为小数部分
    var batteryChgInt = Math.floor(input.data.BatteryChange);
    var batteryChgDec = Math.round((input.data.BatteryChange - batteryChgInt) * 10);
    var batteryChg = (batteryChgInt << 4) | batteryChgDec;
    var tempChg = input.data.TempChange * 10;
    
    port = 7;
    ret = ret.concat(getCmdID, devid, (mint >> 8), (mint & 0xFF), (maxt >> 8), (maxt & 0xFF), batteryChg, (tempChg >> 8), (tempChg & 0xFF), 0x00, 0x00);
  } else if (input.data.Cmd == "ReadConfigReportReq") {
    port = 7;
    ret = ret.concat(getCmdID, devid, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
  } else if (input.data.Cmd == "SetThermocoupleTypeReq") {
    var thermoType = input.data.ThermocoupleType;
    port = 7;
    ret = ret.concat(getCmdID, devid, thermoType, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
  } else if (input.data.Cmd == "GetThermocoupleTypeReq") {
    port = 7;
    ret = ret.concat(getCmdID, devid, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
  }
  
  return {
    fPort: port,
    bytes: ret
  };
}
  
function decodeDownlink(input) {
  var data = {};
  switch (input.fPort) {
    case 7:
      data.Device = getDeviceName(input.bytes[1]);
      data.Cmd = getCfgCmd(input.bytes[0]);
      
      if (input.bytes[0] === getCmdToID("ConfigReportReq")) {
        data.MinTime = (input.bytes[2] << 8) | input.bytes[3];
        data.MaxTime = (input.bytes[4] << 8) | input.bytes[5];
        // 解析BatteryChange：高4位为整数部分，低4位为小数部分
        var intPart = (input.bytes[6] >> 4) & 0x0F;
        var decPart = input.bytes[6] & 0x0F;
        data.BatteryChange = intPart + decPart / 10;
        
        // TemperatureChange handling (2 bytes, signed)
        var tempChgVal = (input.bytes[7] << 8) | input.bytes[8];
        if (input.bytes[7] & 0x80) {
          data.TempChange = (0x10000 - tempChgVal) / 10 * -1;
        } else {
          data.TempChange = tempChgVal / 10;
        }
      } else if (input.bytes[0] === getCmdToID("SetThermocoupleTypeReq")) {
        data.ThermocoupleType = input.bytes[2];
      }
      break;
      
    default:
      return {
        errors: ['invalid FPort'],
      };
  }
  
  return {
    data: data,
  };
}