// Payloadparser for dnt-LW-ATX products
// tested with firmware at least at version v1.0.2
// Parser version: 1.0.4

// messages
var POWER_ON = 0;
var HEARTBEAT = 1;
var GNSS_DATA_DECIMAL_DEGREE = 2;
var GNSS_TIMEOUT = 3;
var CONFIG = 4;
var QOS_INFO = 5;
var EXTENDED_GNSS_DATA = 6;

// reason for transmission of coordinates
var BUTTON = 1;
var CYCLE = 2;
var START_MOVING = 3;
var FURTHER_MOVING = 4;
var END_MOVING = 5;
var REQUESTED = 6;
var POR = 7;


function reason_as_str(byte)
{
  switch( (byte >> 4) )
  {
    case BUTTON:
      return "Button";
    case CYCLE:
      return "Cycle";
    case START_MOVING:
      return "Start trip";
    case FURTHER_MOVING:
      return "Trip";
    case END_MOVING:
      return "End trip";
    case REQUESTED:
      return "Requested by User";
    case POR:
      return "POR";
    default:
      return "unknown";
  }
}


function decodeUplink(input){

  var payload = input.bytes;
  var decoded = {};
  var index = 0;
  
  decoded.voltage = decode_voltage(payload[index++], 1);
	  
  var next_field = 0;
  var coord = {};
  var config = {};

  while( index < payload.length ){
    
    next_field = payload[index++];
    
    if( (next_field & 0x0f) == POWER_ON )
    {
      decoded.reason = "Start-up";
      
      decoded.hw_rev = String.fromCharCode(payload[index++]);
      decoded.fw_version = payload[index++] + ".";
      decoded.fw_version += payload[index++] + ".";
      decoded.fw_version += payload[index++];
      decoded.bl_version = payload[index++] + ".";
      decoded.bl_version += payload[index++] + ".";
      decoded.bl_version += payload[index++];
    }
    else if( (next_field & 0x0f) == HEARTBEAT )
    {
      decoded.reason = "Heartbeat";
      decoded.gps_activations = payload[index++] << 16;
      decoded.gps_activations += payload[index++]<< 8;
      decoded.gps_activations += payload[index++];
      
      decoded.gps_timeouts = payload[index++] << 16;
      decoded.gps_timeouts += payload[index++] << 8;
      decoded.gps_timeouts += payload[index++];
      
      decoded.false_activations = payload[index++] << 16;
      decoded.false_activations += payload[index++] << 8;
      decoded.false_activations += payload[index++];
      
      decoded.average_ttf = payload[index++] * 2; // resolution 2 sec
    }
    else if( (next_field & 0x0f) == GNSS_DATA_DECIMAL_DEGREE )
    {
      decoded.reason = reason_as_str(next_field);
      decoded.gnss_info = "Data_DD";
	
      coord.latitude = parseFloat(uint32(payload.slice(index, index + 4))) / 1000000;
      index = index + 4;
      coord.longitude = parseFloat(uint32(payload.slice(index, index + 4))) / 1000000;
      index = index + 4;
      coord.altitude = (payload[index] << 8) + payload[index + 1];
      index += 2;
      coord.hdop = decompress_dop(payload.slice(index, index + 2));
      index = index + 2;
      coord.ttf = (payload.slice(index, index + 1)) * 2;   // resolution 2 sec
  	  index = index + 1;
  	  
  	  if ((coord.altitude & 0x8000) > 0) {
        coord.altitude = coord.altitude - 0x10000;
      }
  	  
  	  decoded.gnss = coord;
    }
    else if( (next_field & 0x0f) == GNSS_TIMEOUT )
    {
      decoded.reason = reason_as_str(next_field);
      decoded.gnss_info = "Timeout";
     
  	  coord.sat_in_view = payload[index++];
  	  coord.gnss_active_time = payload[index++];
  	  
  	  decoded.gnss = coord;
    }
    else if( (next_field & 0x0f) == CONFIG )
    {
      decoded.reason = reason_as_str(next_field);
      
      config.application = {mode: payload[index], app_cycle_s: (payload[index + 1] << 8 | payload[index + 2]) * 60};
      index += 3;
      config.algorithm = {slot_cnt: payload[index], slot_dur: payload[index + 1] << 8 | payload[index + 2]};
      index += 3;
      config.inactivity = {threshold: payload[index], duration: payload[index + 1] << 8 | payload[index + 2]};
      index += 3;
      config.activity = {threshold: payload[index], samples: payload[index + 1]};
      index += 2;
      config.qos = {mode: payload[index], utc_offset: payload[index + 1],
                  sunrise: {hour: payload[index + 2], minute: payload[index + 3]},
                  sunset: {hour: payload[index + 4], minute: payload[index + 5]}};
      index += 6;
      config.gnss_backup_mode = (payload[index++]) ? "enabled" : "disabled";
      config.application.nightly_app_cycle_s = (payload[index] << 8 | payload[index + 1]) * 60;
      index += 2;
      config.gnss_led = (payload[index++]) ? "enabled" : "disabled";
      
      decoded.config = config;
      
    }
    else if( (next_field & 0x0f) == QOS_INFO )
    {
    	switch( payload[index++] ){
    	  case 0:
    			decoded.qos_state = "Not active";
    			break;
    		case 1:
    			decoded.qos_state = "Almost empty";
    			break;
    		case 2:
    			decoded.qos_state = "Medium";
    			break;
    		case 4:
    			decoded.qos_state = "Almost full";
    			break;
    		case 8:
    			decoded.qos_state = "Night mode";
    			break;
  	  }
  	  
  	  break;
    }
    else
    {
      break;
    }
    
  }
  
  return {
	data: decoded
	};
}

function decode_voltage(value, offset){
  var volt = offset + (value >> 6);
  var millivolt = (value & 0x3f) * 20 / 1000;

  return Number((volt + millivolt).toFixed(2));
}


function decompress_dop(bytes){
  var integer = bytes[0];
  var fraction = bytes[1] * 4 / 100;

  return Number((integer + fraction).toFixed(2));
}

function uint32(bytes){
  return ((bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0]);
}
