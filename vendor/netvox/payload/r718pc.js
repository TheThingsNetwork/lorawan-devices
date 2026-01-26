function getDeviceName(dev) {
  var deviceName = {
      0x72:"R718PC"
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
  
  if(fport === 6) {
      data.Device = getDeviceName(bytes[1]);
      
      if(bytes[2] === 0x00) { // Startup version report
          data.SWver = bytes[3];
          data.HWver = bytes[4];
          data.Datecode = padLeft(bytes[5].toString(16), 2) + padLeft(bytes[6].toString(16), 2) + padLeft(bytes[7].toString(16), 2) + padLeft(bytes[8].toString(16), 2);
      }
  }
  
  return res;
}