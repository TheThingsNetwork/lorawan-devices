var directions = ['N', 'E', 'S', 'W'];
var colors = ['red', 'green'];

function decodeUplink(input) {
  var data = {};
  var beacons = [];

  switch (input.fPort) {
    case 1:  
      var index = 0;    
      data.occupied = (input.bytes[0] & 0x80) >> 7;
      data.keepAlive = input.bytes[0] & 0x01;
      data.reset = (input.bytes[0] & 0x02) >> 1;
      data.No_Beacon = (input.bytes[0] & 0x04) >> 2;
      data.Radar = (input.bytes[0] & 0x08) >> 3;
      data.Obstruction = (input.bytes[0] & 0x10) >> 4;
      data.Good_Battery = (input.bytes[0] & 0x20) >> 5;
      data.Temperature = (input.bytes[1] > 0x7F) ? input.bytes[1] - 0x100 : input.bytes[1];
      data.Parking_ID = input.bytes[2];
      if (input.bytes.length > 3) {
        data.Beacon_RSSI = (input.bytes[3] > 0x7F) ? input.bytes[3] - 0x100 : input.bytes[3];
        beaconcount = (input.bytes.length - 4) / 2;        
        for (index = 4; index < input.bytes.length; index++) {
          beacons = beacons.concat((input.bytes[index] << 8) | input.bytes[index + 1]);
          index++;
        }
        data.Beacons = beacons;
      }
      break;
    case 2:
      data.occupied = (input.bytes[0] & 0x80) >> 7;
      data.keepAlive = input.bytes[0] & 0x01;
      data.reset = (input.bytes[0] & 0x02) >> 1;
      data.No_Beacon = (input.bytes[0] & 0x04) >> 2;
      data.Radar = (input.bytes[0] & 0x08) >> 3;
      data.Obstruction = (input.bytes[0] & 0x10) >> 4;
      data.Good_Battery = (input.bytes[0] & 0x20) >> 5;
      data.Temperature = (input.bytes[1] > 0x7F) ? input.bytes[1] - 0x100 : input.bytes[1];
      data.Parking_ID = input.bytes[2];
      data.Deflection_X = (input.bytes[3] > 0x7F) ? input.bytes[3] - 0x100 : input.bytes[3];
      data.Deflection_Y = (input.bytes[4] > 0x7F) ? input.bytes[4] - 0x100 : input.bytes[4];
      data.Deflection_Z = (input.bytes[5] > 0x7F) ? input.bytes[5] - 0x100 : input.bytes[5];
      data.Baseline_X = (input.bytes[6] > 0x7F) ? input.bytes[6] - 0x100 : input.bytes[6];
      data.Baseline_Y = (input.bytes[7] > 0x7F) ? input.bytes[7] - 0x100 : input.bytes[7];
      data.Baseline_Z = (input.bytes[8] > 0x7F) ? input.bytes[8] - 0x100 : input.bytes[8];
      data.Fault_Code = input.bytes[9];
      data.Obstruction = input.bytes[10];
      data.D_Reflection = input.bytes[11];
      break;
    default:
      return {
        errors: ['unknown FPort'],
      };
  }

  return {
    data: data
  };
}

function encodeDownlink(input) {
  var ret = [];

  var byte0 = (input.data.suppress_baseline_offset << 7) | (input.data.radar_start_range << 4) | input.data.fluctuations_count;
  var byte1 = (input.data.downlink_frequency << 7) | (input.data.axis_deflection << 5) | (input.data.debug_mode << 4) | input.data.deflection_threshold_mag;
  var byte2 = (input.data.zero_neg_drop << 7) | (input.data.oversampling << 5) | (input.data.hw_acc_samples_no << 3) | input.data.fluctuation_threshold_XY;
  var byte3 = (input.data.sleep_time << 5) | (input.data.reset_control << 4) | (input.data.mag_reboot << 3) | input.data.fluctuation_delay_time;
  var byte4 = (input.data.axis_fluctuations << 6) | (input.data.fluctuation_threshold_Z << 3) | (input.data.self_heal << 2) | input.data.keepalive_period;
  var byte5 = (input.data.radar_scan_count << 4) | (input.data.obstruction_check << 3) | input.data.reflection_threshold_radar;
  var byte6 = (input.data.OI << 7) | (input.data.send_rssi << 6) | (input.data.beacons_scan_no << 3) | input.data.ble_scan_window;
  var byte7 = input.data.ble_scan_rssi;

  ret = ret.concat(byte0, byte1, byte2, byte3, byte4, byte5, byte6, byte7);
  return {
    // LoRaWAN FPort used for the downlink message
    fPort: 3,
    // Encoded bytes
    bytes: ret
  };
}

function decodeDownlink(input) {
  var downlinkdata = {};
  switch (input.fPort) {
    case 3:
      
      downlinkdata.fluctuations_count = input.bytes[0] & 0x0F;
      downlinkdata.radar_start_range = (input.bytes[0] & 0x70) >> 4;
      downlinkdata.suppress_baseline_offset = (input.bytes[0] & 0x80) >> 7;

      downlinkdata.deflection_threshold_mag = input.bytes[1] & 0x0F;
      downlinkdata.debug_mode = (input.bytes[1] & 0x10) >> 4;
      downlinkdata.axis_deflection = (input.bytes[1] & 0x60) >> 5;
      downlinkdata.downlink_frequency = (input.bytes[1] & 0x80) >> 7;

      downlinkdata.fluctuation_threshold_XY = input.bytes[2] & 0x07;
      downlinkdata.hw_acc_samples_no = (input.bytes[2] & 0x18) >> 3;
      downlinkdata.oversampling = (input.bytes[2] & 0x60) >> 5;
      downlinkdata.zero_neg_drop = (input.bytes[2] & 0x80) >> 7;

      downlinkdata.fluctuation_delay_time = input.bytes[3] & 0x07;
      downlinkdata.mag_reboot = (input.bytes[3] & 0x08) >> 3;
      downlinkdata.reset_control = (input.bytes[3] & 0x10) >> 4;
      downlinkdata.sleep_time = (input.bytes[3] & 0xE0) >> 5;

      downlinkdata.keepalive_period = input.bytes[4] & 0x03;
      downlinkdata.self_heal = (input.bytes[4] & 0x04) >> 2;
      downlinkdata.fluctuation_threshold_Z = (input.bytes[4] & 0x38) >> 3;
      downlinkdata.axis_fluctuations = (input.bytes[4] & 0xC0) >> 6;

      downlinkdata.reflection_threshold_radar = input.bytes[5] & 0x07;
      downlinkdata.obstruction_check = (input.bytes[5] & 0x08) >> 3;
      downlinkdata.radar_scan_count = (input.bytes[5] & 0xF0) >> 4;

      downlinkdata.ble_scan_window = input.bytes[6] & 0x07;
      downlinkdata.beacons_scan_no = (input.bytes[6] & 0x38) >> 3;
      downlinkdata.send_rssi = (input.bytes[6] & 0x40) >> 6;
      downlinkdata.OI = (input.bytes[6] & 0x80) >> 7;

      downlinkdata.ble_scan_rssi = input.bytes[7] & 0xFF;
      
      return {
        // Decoded downlink (must be symmetric with encodeDownlink)
        data: downlinkdata,
      };
    default:
      return {
        errors: ['invalid FPort'],
      };
  }
}
