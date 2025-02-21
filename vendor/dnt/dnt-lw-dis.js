// Payloadparser dnt-LW-DIS1
// v1.0.1

// messages
var POWER_ON = 0;
var CYCLE = 1;
var TEMPERATURE_NOTIFICATION = 2;
var SABOTAGE = 3;
var BUTTON = 4;
var DOWNLINK_ERROR = 5;
var TEMPERATURE = 6;

var FEATURE_TEMPERATURE_ALARM = 1;
var FEATURE_SABOTAGE_ALARM = 2;

var GET_FEATURES = 21;
var GET_CYCLE = 22;
var GET_TOF_MODE = 23;
var GET_TOF_ROI = 24;
var GET_TEMPERATURE_THRES = 25;
var GET_TEMPERATURE_RISE = 26;
var GET_SABOTAGE_ANGLE = 27;

var GET_MANUAL_BUTTON_RESET = 245;
var GET_TIME_TILL_REJOIN = 247
var GET_LORAWAN_DATARATE = 248;
var GET_REJOIN_CONFIG = 250;
var GET_ALL_CONFIG = 252;
var GET_DEVICE_INFO = 255;


function decodeUplink(input){

  bytes = input.bytes;
  port = input.fPort;

  var power_on = 0;
  var payload = bytes;
  var decoded = {};
  var index = 0;
  
  decoded.voltage = (payload[index++] * 10) + 1500;
	  
  var next_field = 0;
  var ToF = {};
  var config = {};

  while( index < payload.length ){
    
    next_field = payload[index++];
    
    if( next_field == POWER_ON )
    {
      power_on = 1;
      decoded.reason = "Start-up";
      
      if( payload[index++] == GET_DEVICE_INFO )
      {
        decoded.device_info = read_device_info(payload.slice(index, index + 10));
        index += 10;
      }
    }
    else if( next_field == CYCLE || next_field == BUTTON )
    {
      if( !power_on ){
        decoded.reason = (next_field == CYCLE) ? "cycle": "button";
      }
      
      ToF.status = payload[index++];
      ToF.distance = int16(payload.slice(index, index + 2));
      decoded.distance =int16 (payload.slice(index, index + 2));
      index += 2;
      
      decoded.ToF = ToF;
    }
    else if( next_field == TEMPERATURE_NOTIFICATION )
    {
      decoded.temperature_notification = payload[index++];
      decoded.temperature = int16(payload.slice(index, index + 2));
      index += 2;
      
      if( decoded.temperature & 0x8000 ){
        decoded.temperature -= 0x10000;
      }
      
      decoded.temperature /= 10;
    }
    else if( next_field == SABOTAGE )
    {
      if( payload[index] & 0x40 ){
        decoded.sabotage_notification = 1;
      }
      else if( payload[index] & 0x80 ){
        decoded.sabotage_notification = 2;
      }
      else{
        decoded.sabotage_notification = 0;
      }
      
      var orientation = payload[index++] & ~0x40;
      
      if( orientation & 0x01 ){
        decoded.device_orientation = "Up";
      }
      else if( orientation & 0x02 ){
        decoded.device_orientation = "Down";
      }
      else if( orientation & 0x04 ){
        decoded.device_orientation = "Sideways";
      }
      
      if( orientation & 0x08 ){
        decoded.device_orientation += "|Tilted";
      }
    }
    else if( next_field == DOWNLINK_ERROR )
    {
      var error_field = int16(payload.slice(index, index + 2));
      index += 2;
      
      decoded.downlink_error = "";
      
      for( var i = 0; i < 16; i++ )
      {
        if( error_field & (1 << i) )
        {
          decoded.downlink_error += ("field_" + i.toString(10));
        }
      }
    }
    else if( next_field == TEMPERATURE )
    {
      decoded.temperature = int16(payload.slice(index, index + 2));
      index += 2;
      
      if( decoded.temperature & 0x8000 ){
        decoded.temperature -= 0x10000;
      }
      
      decoded.temperature /= 10;
    }
    else if( next_field == GET_FEATURES )
    {
      decoded.application_features = read_device_features(bytes[index++]);
    }
    else if( next_field == GET_CYCLE )
    {
      decoded.measurement_cycle = int16(bytes.slice(index, index + 2));
      index += 2;
    }
    else if( next_field == GET_TOF_MODE )
    {
      decoded.TOF_mode = payload[index++];
    }
    else if( next_field == GET_TOF_ROI )
    {
      decoded.TOF_roi = payload[index++];
    }
    else if( next_field == GET_TEMPERATURE_THRES )
    {
      decoded.temperature_notification_threshold = payload[index++];
    }
    else if( next_field == GET_TEMPERATURE_RISE )
    {
      decoded.temperature_notification_rise = payload[index++];
    }
    else if( next_field == GET_SABOTAGE_ANGLE )
    {
      decoded.sabotage_angle = payload[index++];
    }
    else if( next_field == GET_MANUAL_BUTTON_RESET )
    {
      decoded.manual_button_reset_enabled = payload[index++];
    }
    else if( next_field == GET_TIME_TILL_REJOIN )
    {
      decoded.time_till_rejoin = int24(payload.slice(index, index + 3));
      index += 3;
    }
    else if( next_field == GET_LORAWAN_DATARATE )
    {
      decoded.datarate_config = payload[index++];
    }
    else if( next_field == GET_REJOIN_CONFIG )
    {
      decoded.rejoin_config = int16(payload.slice(index, index + 2));
      index += 2;
    }
    else if( next_field == GET_ALL_CONFIG )
    {
      decoded.config = read_device_config(payload.slice(index, index + 15));
      index += 15;
    }
    else if( next_field == GET_DEVICE_INFO )
    {
      decoded.device_info = read_device_info(payload.slice(index, index + 10));
      index += 10;
    }
    else
    {
      break;
    }
    
  }
  
  return {
    data:decoded
  };
}


function int16(bytes){
  return ((bytes[0] << 8) | bytes[1]);
}

function int24(bytes){
  return ((bytes[0] << 16) | (bytes[1] << 8) | bytes[2]);
}

function int32(bytes){
  return ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]);
}

function read_device_info(bytes){
  var index = 0;
  var info = {}

  info.device_type = (bytes[index++] << 16);
  info.device_type += (bytes[index++] << 8);
  info.device_type += bytes[index++];
  
  info.fw_version = bytes[index++] + ".";
  info.fw_version += bytes[index++] + ".";
  info.fw_version += bytes[index++];
  
  info.bl_version = bytes[index++] + ".";
  info.bl_version += bytes[index++] + ".";
  info.bl_version += bytes[index++];
  
  info.hw_version = bytes[index++];
  
  return info;
}

function read_device_features(byte){
  var app_features = {};

  app_features.distance_measurement = 1;
  app_features.temperature_notification = 0;
  app_features.sabotage_notification = 0;
  
  if( byte & FEATURE_TEMPERATURE_ALARM ){
    app_features.temperature_notification = 1;
  }
  if( byte & FEATURE_SABOTAGE_ALARM ){
    app_features.sabotage_notification = 1;
  }
  
  return app_features
}

function read_device_config(bytes){
  var index = 0;
  var config_tmp = {};
  
  var lorawan = {};
  var rejoin_config = {};
  var ToF = {};
  var notifications = {};
  
  config_tmp.application_features = read_device_features(bytes[index++]);
  
  config_tmp.measurement_cycle = int16(bytes.slice(index, index + 2));
  index += 2;
  
  ToF.mode = bytes[index++];
  ToF.roi = bytes[index++];
  
  notifications.sabotage_angle = bytes[index++];
  
  config_tmp.manual_button_reset_enabled = bytes[index++];
  
  lorawan.time_till_rejoin = int24(bytes.slice(index, index + 3));
  index += 3;
  
  lorawan.datarate_config = bytes[index++];
  
  rejoin_config.one_time = int16(bytes.slice(index, index + 2))& 0x8000 ? 1 : 0;
  rejoin_config.cycle = int16(bytes.slice(index, index + 2)) & ~0x8000;
  index += 2;
  
  notifications.temperature_notification_threshold = bytes[index++];
  notifications.temperature_notification_rise = bytes[index++];
  
  lorawan.rejoin_config = rejoin_config;
  config_tmp.notifications = notifications;
  config_tmp.tof_config = ToF; 
  config_tmp.lorawan = lorawan;
  
  return config_tmp;
}
