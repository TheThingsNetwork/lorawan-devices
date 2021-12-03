function get_num(x, min, max, precision, round) {

  var range = max - min;
  var new_range = (Math.pow(2, precision) - 1) / range;
  var back_x = x / new_range;

  if (back_x === 0) {
    back_x = min;
  }
  else if (back_x === (max - min)) {
    back_x = max;
  }
  else {
    back_x += min;
  }
  return Math.round(back_x * Math.pow(10, round)) / Math.pow(10, round);
}

function decodeUplink(input) {

  var data = {};
  var bytes = input.bytes;
  var port = input.fPort;
  var cnt = 0;
  var resetCause_dict = {
    0: "POWERON",
    1: "EXTERNAL",
    2: "SOFTWARE",
    3: "WATCHDOG",
    4: "FIREWALL",
    5: "OTHER",
    6: "STANDBY"
  };


  // settings
  if (port === 3) {
    data.system_status_interval = (bytes[1] << 8) | bytes[0];
    data.system_functions = {};//bytes[2];
    data.system_functions.gps_periodic = ((bytes[2] >> 0) & 0x01) ? 1 : 0;
    data.system_functions.gps_triggered = ((bytes[2] >> 1) & 0x01) ? 1 : 0;
    data.system_functions.gps_hot_fix = ((bytes[2] >> 2) & 0x01) ? 1 : 0;
    data.system_functions.accelerometer_enabled = ((bytes[2] >> 3) & 0x01) ? 1 : 0;
    data.system_functions.light_enabled = ((bytes[2] >> 4) & 0x01) ? 1 : 0;
    data.system_functions.temperature_enabled = ((bytes[2] >> 5) & 0x01) ? 1 : 0;
    data.system_functions.humidity_enabled = ((bytes[2] >> 6) & 0x01) ? 1 : 0;
    data.system_functions.charging_enabled = ((bytes[2] >> 7) & 0x01) ? 1 : 0;

    data.lorawan_datarate_adr = {};//bytes[3];
    data.lorawan_datarate_adr.datarate = bytes[3] & 0x0f;
    data.lorawan_datarate_adr.confirmed_uplink = ((bytes[3] >> 6) & 0x01) ? 1 : 0;
    data.lorawan_datarate_adr.adr = ((bytes[3] >> 7) & 0x01) ? 1 : 0;

    data.gps_periodic_interval = (bytes[5] << 8) | bytes[4];
    data.gps_triggered_interval = (bytes[7] << 8) | bytes[6];
    data.gps_triggered_threshold = bytes[8];
    data.gps_triggered_duration = bytes[9];
    data.gps_cold_fix_timeout = (bytes[11] << 8) | bytes[10];
    data.gps_hot_fix_timeout = (bytes[13] << 8) | bytes[12];
    data.gps_min_fix_time = bytes[14];
    data.gps_min_ehpe = bytes[15];
    data.gps_hot_fix_retry = bytes[16];
    data.gps_cold_fix_retry = bytes[17];
    data.gps_fail_retry = bytes[18];
    data.gps_settings = {};//bytes[19];
    data.gps_settings.d3_fix = ((bytes[19] >> 0) & 0x01) ? 1 : 0;
    data.gps_settings.fail_backoff = ((bytes[19] >> 1) & 0x01) ? 1 : 0;
    data.gps_settings.hot_fix = ((bytes[19] >> 2) & 0x01) ? 1 : 0;
    data.gps_settings.fully_resolved = ((bytes[19] >> 3) & 0x01) ? 1 : 0;
    data.system_voltage_interval = bytes[20];
    data.gps_charge_min = bytes[21]*10+2500;
    data.system_charge_min = bytes[22]*10+2500;
    data.system_charge_max = bytes[23]*10+2500;
    data.system_input_charge_min = (bytes[25] << 8) | bytes[24];
    data.pulse_threshold = bytes[26];
    data.pulse_on_timeout = bytes[27];
    data.pulse_min_interval = (bytes[29] << 8) | bytes[28];
    data.gps_accel_z_threshold = ((bytes[31] << 8) | bytes[30])-2000;
    data.fw_version = (bytes[33] << 8) | bytes[32];
  }
  else if (port === 12) {
    data.resetCause = resetCause_dict[bytes[0]&0x07];
    data.system_state_timeout = bytes[0]>>3;
    data.battery = bytes[1]*10+2500; // result in mV
    data.temperature = get_num(bytes[2], -20, 80, 8, 1);
    data.system_functions_errors = {};//bytes[5];
    data.system_functions_errors.gps_periodic_error = ((bytes[3] >> 0) & 0x01) ? 1 : 0;
    data.system_functions_errors.gps_triggered_error = ((bytes[3] >> 1) & 0x01) ? 1 : 0;
    data.system_functions_errors.gps_fix_error = ((bytes[3] >> 2) & 0x01) ? 1 : 0;
    data.system_functions_errors.accelerometer_error = ((bytes[3] >> 3) & 0x01) ? 1 : 0;
    data.system_functions_errors.light_error = ((bytes[3] >> 4) & 0x01) ? 1 : 0;
    data.system_functions_errors.charging_status = (bytes[3] >> 5) & 0x07;
    data.lat = ((bytes[4] << 16) >>> 0) + ((bytes[5] << 8) >>> 0) + bytes[6];
    data.lon = ((bytes[7] << 16) >>> 0) + ((bytes[8] << 8) >>> 0) + bytes[9];
    if(data.lat!==0 && data.lon!==0){
      data.lat = (data.lat / 16777215.0 * 180) - 90;
      data.lon = (data.lon / 16777215.0 * 360) - 180;
      data.lat = Math.round(data.lat*100000)/100000;
      data.lon = Math.round(data.lon*100000)/100000;
    }
    data.gps_resend = bytes[10];
    data.accelx = get_num(bytes[11], -2000, 2000, 8, 1);
    data.accely = get_num(bytes[12], -2000, 2000, 8, 1);
    data.accelz = get_num(bytes[13], -2000, 2000, 8, 1);
    data.battery_low = (bytes[15] << 8) | bytes[14];; // result in mV
    data.gps_on_time_total = (bytes[17] << 8) | bytes[16];
    data.gps_time = bytes[18] | (bytes[19] << 8) | (bytes[20] << 16) | (bytes[21] << 24);
    var d= new Date(data.gps_time*1000);
    data.gps_time_data = d.toLocaleString();
    data.pulse_counter = bytes[22];
    data.pulse_energy = (bytes[23]<<4) | (bytes[24] | (bytes[25] << 8)>>12);
    data.pulse_voltage = (bytes[24] | (bytes[25] << 8)) & 0x0fff;
    data.voltage_fence_v = data.pulse_voltage * 8;
    data.downlink_counter = (bytes[26] | (bytes[27] << 8));
  }
  else if (port === 1) {
    data.lat = ((bytes[cnt++] << 16) >>> 0) + ((bytes[cnt++] << 8) >>> 0) + bytes[cnt++];
    data.lon = ((bytes[cnt++] << 16) >>> 0) + ((bytes[cnt++] << 8) >>> 0) + bytes[cnt++];
    if(data.lat!==0 && data.lon!==0){
      data.lat = (data.lat / 16777215.0 * 180) - 90;
      data.lon = (data.lon / 16777215.0 * 360) - 180;
      data.lat = Math.round(data.lat*100000)/100000;
      data.lon = Math.round(data.lon*100000)/100000;
    }
    data.alt = bytes[cnt++] | (bytes[cnt++] << 8);
    data.satellites = (bytes[cnt] >> 4);
    data.hdop = (bytes[cnt++] & 0x0f);
    data.time_to_fix = bytes[cnt++];
    data.epe = bytes[cnt++];
    data.snr = bytes[cnt++];
    data.lux = bytes[cnt++];
    data.motion = bytes[cnt++];
    data.gps_time = bytes[cnt++] | (bytes[cnt++] << 8) | (bytes[cnt++] << 16) | (bytes[cnt++] << 24);
    var d= new Date(data.gps_time*1000);
    data.gps_time_data = d.toLocaleString();
  }
  else if (port === 11) {
    var locations=[];
    for(i = 0; i < 20; i++){
      var location={}
      location.lat = ((bytes[cnt++] << 16) >>> 0) + ((bytes[cnt++] << 8) >>> 0) + bytes[cnt++];
      location.lon = ((bytes[cnt++] << 16) >>> 0) + ((bytes[cnt++] << 8) >>> 0) + bytes[cnt++];
      location.gps_time = ((bytes[cnt++] << 16) >>> 0) + ((bytes[cnt++] << 8) >>> 0) + bytes[cnt++];
      location.gps_time = location.gps_time * 60 + 1600000000;
      var d= new Date(location.gps_time*1000);
      location.gps_time_data = d.toLocaleString();
      var fix_stats= bytes[cnt++];
      location.motion = fix_stats>>7;
      location.epe = ((fix_stats>>4)&0x07)*12;
      location.ttf = (fix_stats&0x0f)*5;
      if(location.lat!==0 && location.lon!==0){
        location.lat = (location.lat / 16777215.0 * 180) - 90;
        location.lon = (location.lon / 16777215.0 * 360) - 180;
        location.lat = Math.round(location.lat*100000)/100000;
        location.lon = Math.round(location.lon*100000)/100000;
        // push only valid locations
        locations.push(location);
      }
    }
    data.locations=JSON.stringify(locations);
  }
  else if (port === 30) {
    var vswr=[];
    for(i = 0; i < bytes.length; i++){
      var value=(bytes[i]);
      vswr.push(value);
    }
    data.vswr=vswr;
  }

  return data;
}
