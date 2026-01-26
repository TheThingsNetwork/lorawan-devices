﻿function getCfgCmd(cmdtype) {
  var cfgCmdList = {"ConfigReportReq":0x01,"ConfigReportRsp":0x81,"ReadConfigReportReq":0x02,"ReadConfigReportRsp":0x82};
  return cfgCmdList[cmdtype];
}

function getDeviceName(dev) {
  var deviceName = {
      0x23:"R718KB"
  };
  return deviceName[dev];
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
  var bytes = input.bytes;
  var fport = input.fPort;
  var res = {"data":data};
  var i = 0;
  
  if(fport === 6) {
      data.Device = getDeviceName(bytes[1]);
      
      if(bytes[2] === 0x00) { // Startup version report
          data.SWver = bytes[3];
          data.HWver = bytes[4];
          data.Datecode = padLeft(bytes[5].toString(16), 2) + padLeft(bytes[6].toString(16), 2) + padLeft(bytes[7].toString(16), 2) + padLeft(bytes[8].toString(16), 2);
      } else if(bytes[2] === 0x01) { // Status report
          // Fix voltage parsing: use only one byte (bytes[3]) instead of two
          data.Volt = bytes[3] / 10;
          // Fix resistive value calculation: use bytes 6-8 instead of 4-7
          data.Resistive = bytes[6] * 65536 + bytes[7] * 256 + bytes[8];
      }
  } else if(fport === 7) {
      data.Device = getDeviceName(bytes[1]);
      
      if(bytes[0] === 0x81) { // ConfigReportRsp
          data.Cmd = 'ConfigReportRsp';
          data.Status = bytes[2] === 0x00 ? 'Success' : 'Failed';
      } else if(bytes[0] === 0x82) { // ReadConfigReportRsp
          data.Cmd = 'ReadConfigReportRsp';
          data.MinTime = (bytes[2] << 8) | bytes[3];
          data.MaxTime = (bytes[4] << 8) | bytes[5];
          // Fix BatteryChange: use only one byte (bytes[6]) instead of two
          data.BatteryChange = bytes[6] / 10;
          // Fix resistive change calculation: use only 3 bytes (bytes 8-10) instead of 4
          data.ResistiveChange = bytes[8] * 65536 + bytes[9] * 256 + bytes[10];
      }
  }
  
  return res;
}

function encodeDownlink(input) {
  var data = input.data;
  var res = {"fPort": 7, "bytes":[]};
  
  if(data.Cmd === "ConfigReportReq") {
      res.bytes = [
          0x01, 0x23, 
          data.MinTime >> 8, data.MinTime & 0xFF,
          data.MaxTime >> 8, data.MaxTime & 0xFF,
          // Fix BatteryChange encoding: use only one byte instead of two
          Math.round(data.BatteryChange * 10),
          // Add reserved byte after BatteryChange
          0x00,
          // Fix ResistiveChange encoding: use only 3 bytes instead of 4
          (data.ResistiveChange >> 16) & 0xFF, (data.ResistiveChange >> 8) & 0xFF, data.ResistiveChange & 0xFF
      ];
  } else if(data.Cmd === "ReadConfigReportReq") {
      res.bytes = [0x02, 0x23, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
  }
  
  return res;
}

function decodeDownlink(input) {
  var data = {};
  var bytes = input.bytes;
  var res = {"data":data};
  
  data.Device = getDeviceName(bytes[1]);
  
  if(bytes[0] === 0x01) {
      data.Cmd = 'ConfigReportReq';
      data.MinTime = (bytes[2] << 8) | bytes[3];
      data.MaxTime = (bytes[4] << 8) | bytes[5];
      // Fix BatteryChange decoding: use only one byte instead of two
      data.BatteryChange = bytes[6] / 10;
      // Fix ResistiveChange decoding: use only 3 bytes instead of 4
      data.ResistiveChange = bytes[8] * 65536 + bytes[9] * 256 + bytes[10];
  } else if(bytes[0] === 0x02) {
      data.Cmd = 'ReadConfigReportReq';
  }
  
  return res;
}