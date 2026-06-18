
function decodeUplink(input) {
  const bytes = input.bytes;
  const result = {};

  switch (input.fPort) {
    case 151:
      if(bytes[0] == 0x4c) {
        let n_commands = bytes[2];
        let index = 3;
        for(let i=0;i<n_commands;i++) {
          let tag = bytes[index];
          let size = bytes[index+1];
          let data = bytes.slice(index+2,index+2+size);
          index = index + size + 2;
          if(tag == 0x40 && size == 1) {
            result.ble_fwu_enabled = data & 0x01 == 1 ? true : false;
            result.gnss_enabled = (data & 0x02) >> 1 == 1 ? true : false;
            result.wifi_enabled = (data & 0x04) >> 2 == 1 ? true : false;
            result.acceleration_enabled = (data & 0x08) >> 3 == 1 ? true : false;
          }
          else if(tag == 0x41 && size == 4) {
            result.tracking_interval_moving = data[0] << 8 | data[1];
            result.tracking_interval_steady = data[2] << 8 | data[3];
          }
          else if(tag == 0x42 && size == 4) {
            result.acceleration_sensitivity = data[0] << 8 | data[1];
            result.acceleration_delay = data[2] << 8 | data[3];
          }
          else if(tag == 0x43 && size == 1) {
            result.heartbeat_interval = data[0];
          }
          else if(tag == 0x44 && size == 1) {
            result.advertisment_interval = data[0];
          }
          else if(tag == 0x45 && size == 2) {
            let batteryVoltage = data[0] << 8 | data[1];
            result.battery = batteryVoltage / 1000;
          }
          else if(tag == 0x46 && size == 4) {
            result.hash = toHexString(data);
          }
          else if(tag == 0x49 && size == 2) {
            result.reset_count = data[0] << 8 | data[1];
          }
          else if(tag == 0x4A && size == 4) {
            result.reset_cause = data[0] << 24 | data[1] << 16 | data[2] << 8 | data[3];
          }
          else if(tag == 0x4B && size == 4) {
            result.gnss_scan_count = data[0] << 8 | data[1];
            result.wifi_scan_count = data[2] << 8 | data[3];
          }
          else if(tag == 0x80 && size == 2) {
            result.alarm_duration = data[0];
            result.alarm_period = data[1];
          }
        }
      }
      return {
        // Decoded data
        data: result
      };
    case 192:
    case 197:
      return {
        data: {} //In case of GNSS and WiFi uplink the payload has to be decoded by LoRaCloud.
      };
    default:
      return {
        errors: ['unknown FPort'],
      };
  }
}

function toHexString(byteArray) {
  var s = '';
  byteArray.forEach(function(byte) {
    s += ('0' + (byte & 0xFF).toString(16)).slice(-2);
  });
  return s;
}

function decodeInputHexString(byteArray) {
  var length = byteArray.length;
  var hexArray = [];
  for (var i = 0, j = 0; i < length; i += 2, j++) {
    hexArray[j] = byteArray[i] + byteArray[i + 1];
    hexArray[j] = parseInt(hexArray[j], 16)
  }
  return hexArray;
}