//-----------------------------------------------------
// Packet parser
//-----------------------------------------------------
//Port to which the packet was received for LoRaWAN servers (in other cases, you must specify 10)
//bytes -  Data buffer
function Decode (fPort, bytes, variables) 
{
  var result = {
    status_decode: false,
    raw: bytes
  };
  if( fPort === 10 )
  {
    var offset = 0;
    setpowerInformation(bytes,offset,result);
    offset++;
    setProtocolInformation(bytes,offset,result);
    offset++;
    if( result.is_sn ) 
    {
      result.sn = toUInt32LE(bytes,offset);
      offset += 4;
    }
    if( result.is_payload_size )
    {
      result.payload_size = toUInt16LE(bytes,offset);
      offset += 2;
    }
    delete result.is_sn;
    delete result.is_payload_size;
    //var ts = new Date();
    //result.server_isotime = ts.toISOString();
    //result.server_unixtime = Math.floor(ts.getTime()/1000);
    parseFrames(bytes,offset,result);
    if( !!result.error == false) result.status_decode = true;
  }
  return result;
}
//-----------------------------------------------------
// Frame type parser
//-----------------------------------------------------
function parseFrames(buf,offset,obj) 
{
  if( buf[offset] === undefined || buf[offset+1] === undefined ) return;
  var frameHeader = buf[offset] | ( buf[ offset+1 ] << 8 );
  var MASK_TYPE_FRAME   = 0x0fff; //0b0000111111111111
  var MASK_REASON_FRAME = 0xf000; //0b1111000000000000
  var typeFrame   = ( frameHeader & MASK_TYPE_FRAME )   >> 0;
  var reasonFrame = ( frameHeader & MASK_REASON_FRAME ) >> 12;
  offset +=2;
  if(obj.frames === undefined) obj.frames = [];

  if ( typeFrame == 0x00 ) parseFramesDeviceInfo(buf,offset,obj,reasonFrame);

  else if ( typeFrame == 0x03 ) parseFramesGNSS(buf,offset,obj,reasonFrame);
  else if ( typeFrame == 0x04 ) parseFramesWiFiGeo(buf,offset,obj,reasonFrame);
  else if ( typeFrame == 0x05 ) parseFramesMotionActivity(buf,offset,obj,reasonFrame);
  else if ( typeFrame == 0x06 ) parseFramesShock(buf,offset,obj,reasonFrame);

  else if ( typeFrame == 0x07 ) parseFramesWasteSensor(buf,offset,obj,reasonFrame);
  else if ( typeFrame == 0x08 ) parseFramesModbus(buf,offset,obj,reasonFrame);

  else if ( typeFrame == 0x09 ) parseFramesIBeacon(buf,offset,obj,reasonFrame);

  else if ( typeFrame == 0x0A ) parseFrames4_20mA(buf,offset,obj,reasonFrame);
  else if ( typeFrame == 0x0B ) parseFramesDigitalInput(buf,offset,obj,reasonFrame); 
  else if ( typeFrame == 0x0C ) parseFramesAnalogInput(buf,offset,obj,reasonFrame);
  else if ( typeFrame == 0x0D ) parseFramesPulseCounter(buf,offset,obj,reasonFrame);
  else if ( typeFrame == 0x0E ) parseFramesLbsGeo(buf,offset,obj,reasonFrame);

  else if ( typeFrame == 0x10 ) parseFramesRs485(buf,offset,obj,reasonFrame);

  else if ( typeFrame == 0x11 ) parseFramesSOS(buf,offset,obj,reasonFrame);
  else if ( typeFrame == 0x12 ) parseFramesTurn(buf,offset,obj,reasonFrame);
  else if ( typeFrame == 0x13 ) parseFramesMovement(buf,offset,obj,reasonFrame);

  else if ( typeFrame == 0x14 ) parseFramesIMU(buf,offset,obj,reasonFrame); 

  else if ( typeFrame == 0x15 ) parseFramesODK(buf,offset,obj,reasonFrame); 
 // else if ( typeFrame == 0x16 ) parseFramesMBUS(buf,offset,obj,reasonFrame); 
  else if ( typeFrame == 0x17 ) parseFramesModernState(buf,offset,obj,reasonFrame);
  else if ( typeFrame == 0x18 ) parseFramesHumidity(buf,offset,obj,reasonFrame);
  else if ( typeFrame == 0x19 ) parseFramesIlluminance (buf,offset,obj,reasonFrame);
  else if ( typeFrame == 0x20 ) parseFramesAcceleration (buf,offset,obj,reasonFrame);

  else if ( typeFrame == 0x21 ) parseFramesGuard (buf,offset,obj,reasonFrame);
  else if ( typeFrame == 0x22 ) parseFramesInclination  (buf,offset,obj,reasonFrame);

  else if ( typeFrame == 0x0f ) parseFramestemperature(buf,offset,obj,reasonFrame);
  else unknownFrame(obj,typeFrame,offset-2);
}
//-----------------------------------------------------
// Frame parsers
//-----------------------------------------------------
function unknownFrame(obj,type,offset)
{
  obj.error = 'unknown_frame';
  obj.error_debug_info = 'type='+type+'|offset='+offset;
}
function parseFramesIMU(buf,offset,obj,reason)
{
  var frame = {};
  frame.type = 'IMU';
  if( reason == 0x00 ) frame.reason = 'regular';
  else frame.reason = 'unknown';
  frame.frame_unixtime = toUInt32LE(buf,offset);
  frame.frame_isotime = new Date(frame.frame_unixtime*1000).toISOString();
  offset += 4;

  frame.roll = toInt16LE(buf,offset);
  offset += 2;
  frame.pith = toInt16LE(buf,offset);
  offset += 2;
  frame.yaw = toInt16LE(buf,offset);
  offset += 2;

  obj.frames.push(frame);
  parseFrames(buf,offset,obj);
}

function parseFramesDeviceInfo(buf,offset,obj,reason)
{
  var frame = {};
  frame.type = 'device_info';
  if( reason == 0x00 ) frame.reason = 'boot';
  else if( reason == 0x01 ) frame.reason = 'result_request';
  else frame.reason = 'unknown';
  frame.frame_unixtime = toUInt32LE(buf,offset);
  frame.frame_isotime = new Date(frame.frame_unixtime*1000).toISOString();
  offset += 4;
  frame.model_id = toUInt16LE(buf, offset);
  frame.model_name = getModelNameById(frame.model_id);
  offset += 2;
  setDeviceFirmwareVersion(buf[offset],frame);
  offset++;
  obj.frames.push(frame);
  parseFrames(buf,offset,obj);
}

function parseFramesODK(buf,offset,obj,reason)
{
  var frame = {};
  frame.type = 'ODK';
  if( reason == 0x00 ) frame.reason = 'regular';
  else if( reason == 0x01 ) frame.reason = 'alarm';
  else frame.reason = 'unknown';
  frame.frame_unixtime = toUInt32LE(buf,offset);
  frame.frame_isotime = new Date(frame.frame_unixtime*1000).toISOString();
  offset += 4;
  frame.channel_number = toUInt8(buf,offset);
  offset++;
  if( buf[offset] === 0x00 ) frame.state = 'NORMAL1';
  else if( buf[offset] === 0x01 ) frame.state = 'NORMAL2';
  else if( buf[offset] === 0x02 ) frame.state = 'NORMAL3';
  else if( buf[offset] === 0x03 ) frame.state = 'NORMAL4';
  else if( buf[offset] === 0x04 ) frame.state = 'NORMAL5';
  else if( buf[offset] === 0x05 ) frame.state = 'WET';
  else if( buf[offset] === 0x06 ) frame.state = 'BREAK';
  else if( buf[offset] === 0x07 ) frame.state = 'WET_BREAK';
  else if( buf[offset] === 0x08 ) frame.state = 'UNKNOWN';
  else frame.state = 'unknown';
  offset++;
  frame.current_resistance = toUInt32LE(buf,offset);
  offset += 4;
  frame.min_resistance = toUInt32LE(buf,offset);
  offset += 4;
  frame.max_resistance = toUInt32LE(buf,offset);
  offset += 4;
  frame.middle_resistance = toUInt32LE(buf,offset);
  offset += 4;
  frame.current_conduct_resistance = toUInt32LE(buf,offset);
  offset += 4;

  obj.frames.push(frame);
  parseFrames(buf,offset,obj);
}
function parseFramesModernState(buf,offset,obj,reason)
{
  var frame = {};
  frame.type = 'modern_state';
  if( reason == 0x00 ) frame.reason = 'regular';
  else frame.reason = 'unknown';
  frame.frame_unixtime = toUInt32LE(buf,offset);
  frame.frame_isotime = new Date(frame.frame_unixtime*1000).toISOString();
  offset += 4;

  frame.iccid = toASCII(buf,offset,20);
  offset += 20;
  frame.rssi = toInt16LE(buf,offset);
  offset += 2;
  frame.iccid = toASCII(buf,offset,15);
  offset += 15;

  obj.frames.push(frame);
  parseFrames(buf,offset,obj);
}
function parseFramesHumidity(buf,offset,obj,reason)
{
  var frame = {};
  frame.type = 'humidity';
  if( reason == 0x00 ) frame.reason = 'regular';
  else frame.reason = 'unknown';
  frame.frame_unixtime = toUInt32LE(buf,offset);
  frame.frame_isotime = new Date(frame.frame_unixtime*1000).toISOString();
  offset += 4;
  frame.humidity_pct = toUInt16LE(buf,offset);
  if( frame.humidity_pct > 1000 || frame.humidity_pct < 0 ) frame.humidity_pct= 'unknown';
  else frame.humidity_pct = frame.humidity_pct/10;
  offset += 2;

  obj.frames.push(frame);
  parseFrames(buf,offset,obj);
}
function parseFramesIlluminance(buf,offset,obj,reason)
{
  var frame = {};
  frame.type = 'illuminance';
  if( reason == 0x00 ) frame.reason = 'regular';
  else frame.reason = 'unknown';
  frame.frame_unixtime = toUInt32LE(buf,offset);
  frame.frame_isotime = new Date(frame.frame_unixtime*1000).toISOString();
  offset += 4;
  frame.illuminance_lex = toUInt16LE(buf,offset);
  offset += 2;

  obj.frames.push(frame);
  parseFrames(buf,offset,obj);
}
function parseFramesAcceleration(buf,offset,obj,reason)
{
  var frame = {};
  frame.type = 'acceleration';
  if( reason == 0x00 ) frame.reason = 'regular';
  else frame.reason = 'unknown';
  frame.frame_unixtime = toUInt32LE(buf,offset);
  frame.frame_isotime = new Date(frame.frame_unixtime*1000).toISOString();
  offset += 4;
  frame.x_mG = toInt16LE(buf,offset);
  offset += 2;
  frame.y_mG = toInt16LE(buf,offset);
  offset += 2;
  frame.z_mG = toInt16LE(buf,offset);
  offset += 2;
  obj.frames.push(frame);
  parseFrames(buf,offset,obj);
}

function parseFramesWasteSensor(buf,offset,obj,reason)
{
  var frame = {};
  frame.type = 'waste_sensor';
  if( reason == 0x00 ) frame.reason = 'regular';
  else if( reason == 0x01 ) frame.reason = 'waste_flush';
  else if( reason == 0x02 ) frame.reason = 'temperature_alarm';
  else if( reason == 0x03 ) frame.reason = 'open_alarm';
  else frame.reason = 'unknown';
  frame.frame_unixtime = toUInt32LE(buf,offset);
  frame.frame_isotime = new Date(frame.frame_unixtime*1000).toISOString();
  offset += 4;
  if( buf[offset] == 0x00 ) frame.position = 'horizontally';
  else if( buf[offset] == 0x01 ) frame.position = 'vertically';
  else frame.position = 'unknown';
  offset++;
  frame.distance_upper_sensor_cm = toUInt16LE(buf, offset);
  if( frame.distance_upper_sensor_cm < 0 || frame.distance_upper_sensor_cm > 300 ) frame.distance_upper_sensor_cm = 'unknown';
  offset += 2;
  frame.distance_side_sensor_cm = toUInt16LE(buf, offset);
  if( frame.distance_side_sensor_cm < 0 || frame.distance_side_sensor_cm > 300 ) frame.distance_side_sensor_cm = 'unknown';
  offset += 2;
  frame.temperature_cel = toInt8(buf, offset);
  offset++;
  frame.waste_pct = toUInt8(buf, offset);
  offset++;
  obj.frames.push(frame);
  parseFrames(buf,offset,obj);
}
function parseFramesRs485(buf,offset,obj,reason)
{
  var frame = {};
  frame.type = 'rs485';
  if( reason == 0x00 ) frame.reason = 'regular';
  else frame.reason = 'unknown';
  frame.frame_unixtime = toUInt32LE(buf,offset);
  frame.frame_isotime = new Date(frame.frame_unixtime*1000).toISOString();
  offset += 4;
  frame.measurement_row_number = toUInt8(buf,offset);
  offset++;
  frame.command_number_row = toUInt8(buf,offset);
  offset++;
  frame.size_answer = toUInt8(buf,offset);
  offset++;
  frame.answer = toHex(buf,offset,frame.size_answer);
  offset += frame.size_answer;
  obj.frames.push(frame);
  parseFrames(buf,offset,obj);
}
function parseFramesModbus(buf,offset,obj,reason)
{
  var frame = {};
  frame.type = 'modbus';

  if( reason == 0x00 ) frame.reason = 'regular';
  else if( reason == 0x01 ) frame.reason = 'alarm';
  else frame.reason = 'unknown';
  frame.frame_unixtime = toUInt32LE(buf,offset);
  frame.frame_isotime = new Date(frame.frame_unixtime*1000).toISOString();
  offset += 4;
  frame.name = toASCII(buf,offset,8);
  offset += 8;
  frame.slave_address = toUInt8(buf,offset);
  offset++;
  frame.register_address = toUInt16LE(buf,offset);
  offset += 2;
  frame.modbus_function = getNameModbusFunction(buf[offset]);
  offset++;
  frame.register_counter = toUInt8(buf,offset);
  if( frame.register_counter < 0 || frame.register_counter > 0x04 ) frame.register_counter = 'unknown'; 
  offset++;
  if( buf[offset] === 0x00 ) frame.signed_flag = 'unsigned';
  else if( buf[offset] === 0x01 ) frame.signed_flag = 'signed';
  else frame.signed_flag = 'unknown';
  offset++;
  frame.register_value = toHex(buf,offset,8);
  offset += 8;
  obj.frames.push(frame);
  parseFrames(buf,offset,obj);
}

function parseFramesTurn(buf,offset,obj,reason)
{
  var frame = {};
  frame.type = 'turn';
  if( reason == 0x01 ) frame.reason = 'turn_detect';
  else frame.reason = 'unknown';
  frame.frame_unixtime = toUInt32LE(buf,offset);
  frame.frame_isotime = new Date(frame.frame_unixtime*1000).toISOString();
  offset += 4;
  obj.frames.push(frame);
  parseFrames(buf,offset,obj);
}
function parseFramesGuard(buf,offset,obj,reason)
{
  var frame = {};
  frame.type = 'guard';
  if( reason == 0x00 ) frame.reason = 'normal';
  else if( reason == 0x01 ) frame.reason = 'alarm';
  else frame.reason = 'unknown';
  frame.frame_unixtime = toUInt32LE(buf,offset);
  frame.frame_isotime = new Date(frame.frame_unixtime*1000).toISOString();
  offset += 4;
  frame.pin_number = toUInt8(buf,offset);
  offset++;
  frame.pin_status = toUInt8(buf,offset);
  offset++;
  if(frame.pin_status===1) frame.pin_status = 'open';
  else if(frame.pin_status===0) frame.pin_status = 'close';
  else frame.pin_status = 'unknown';

  obj.frames.push(frame);
  parseFrames(buf,offset,obj);
}
function parseFramesInclination(buf,offset,obj,reason)
{
  var frame = {};
  frame.type = 'inclination';
  if( reason == 0x00 ) frame.reason = 'normal';
  else if( reason == 0x01 ) frame.reason = 'alarm';
  else frame.reason = 'unknown';
  frame.frame_unixtime = toUInt32LE(buf,offset);
  frame.frame_isotime = new Date(frame.frame_unixtime*1000).toISOString();
  offset += 4;

  frame.x_axis_angle_pct = toUInt16LE(buf, offset) / 10;
  offset += 2;
  frame.y_axis_angle_pct = toUInt16LE(buf, offset) / 10;
  offset += 2;
  frame.z_axis_angle_pct = toUInt16LE(buf, offset) / 10;
  offset += 2;

  obj.frames.push(frame);
  parseFrames(buf,offset,obj);
}
function parseFramestemperature(buf,offset,obj,reason)
{
  var frame = {};
  frame.type = 'temperature';
  if( reason == 0x00 ) frame.reason = 'regular';
  else if( reason == 0x01 ) frame.reason = 'alarm';
  else frame.reason = 'unknown';

  frame.frame_unixtime = toUInt32LE(buf,offset);
  frame.frame_isotime = new Date(frame.frame_unixtime*1000).toISOString();
  offset += 4;

  frame.number_sensor = toUInt8(buf,offset);
  offset++; 

  frame.temperature_cel = toInt16LE(buf,offset)/10;
  offset += 2;

  obj.frames.push(frame);
  parseFrames(buf,offset,obj);
}
function parseFramesMovement(buf,offset,obj,reason)
{
  var frame = {};
  frame.type = 'movement';
  if( reason == 0x00 ) frame.reason = 'regular';
  else frame.reason = 'unknown';
  frame.frame_unixtime = toUInt32LE(buf,offset);
  frame.frame_isotime = new Date(frame.frame_unixtime*1000).toISOString();
  offset += 4;
  var isMovement = toUInt8(buf,offset);

  if(isMovement === 0) frame.is_movement = false;
  else if(isMovement === 1) frame.is_movement = true;
  else  frame.is_movement = 'unknown';
  offset++;

  obj.frames.push(frame);
  parseFrames(buf,offset,obj);
}
function parseFramesSOS(buf,offset,obj,reason)
{
  var frame = {};
  frame.type = 'sos';
  if( reason == 0x01 ) frame.reason = 'sos_1_detect';
  else if( reason == 0x02 ) frame.reason = 'sos_2_detect';
  else frame.reason = 'unknown';
  frame.frame_unixtime = toUInt32LE(buf,offset);
  frame.frame_isotime = new Date(frame.frame_unixtime*1000).toISOString();
  offset += 4;
  obj.frames.push(frame);
  parseFrames(buf,offset,obj);
}
function parseFramesShock(buf,offset,obj,reason)
{
  var frame = {};
  frame.type = 'shock';
  if( reason == 0x01 ) frame.reason = 'shock_detect';
  else frame.reason = 'unknown';
  frame.frame_unixtime = toUInt32LE(buf,offset);
  frame.frame_isotime = new Date(frame.frame_unixtime*1000).toISOString();
  offset += 4;
  obj.frames.push(frame);
  parseFrames(buf,offset,obj);
}
function parseFramesMotionActivity(buf,offset,obj,reason)
{
  var frame = {};
  frame.type = 'motion_activity';
  if( reason == 0x00 ) frame.reason = 'regular';
  else if( reason == 0x01 ) frame.reason = 'shock_detect';
  else if( reason == 0x02 ) frame.reason = 'stop_movement';
  else if( reason == 0x03 ) frame.reason = 'start_movement';
  else frame.reason = 'unknown';

  frame.frame_unixtime = toUInt32LE(buf,offset);
  frame.frame_isotime = new Date(frame.frame_unixtime*1000).toISOString();
  offset += 4;
  frame.period_duration_min = toUInt8(buf,offset);
  offset++;
  frame.avg_index = toUInt8(buf,offset);
  offset++;
  obj.frames.push(frame);
  parseFrames(buf,offset,obj);
}

function parseFramesIBeacon(buf,offset,obj,reason)
{
  var frame = {};
  frame.type = 'ibeacon'; 
  if( reason == 0x00 ) frame.reason = 'regular';
  else frame.reason = 'unknown';
  frame.frame_unixtime = toUInt32LE(buf,offset);
  frame.frame_isotime = new Date(frame.frame_unixtime*1000).toISOString();
  offset += 4;
  frame.ibeacons_list = [];

  var major1 = toUInt16LE(buf, offset);
  offset += 2;
  var minor1 = toUInt16LE(buf, offset);
  offset += 2;
  var rssi1 = toInt8(buf, offset);
  offset++;
  var major2 = toUInt16LE(buf, offset);
  offset += 2;
  var minor2 = toUInt16LE(buf, offset);
  offset += 2;
  var rssi2 = toInt8(buf, offset);
  offset++;
  var major3 = toUInt16LE(buf, offset);
  offset += 2;
  var minor3 = toUInt16LE(buf, offset);
  offset += 2;
  var rssi3 = toInt8(buf, offset);
  offset++;

  if( validIBeacon(major1,minor1,rssi1) ) frame.ibeacons_list.push({
    major: major1,
    minor: minor1,
    rssi: rssi1
  });
  if( validIBeacon(major2,minor2,rssi2) ) frame.ibeacons_list.push({
    major: major2,
    minor: minor2,
    rssi: rssi2
  });
  if( validIBeacon(major3,minor3,rssi3) ) frame.ibeacons_list.push({
    major: major3,
    minor: minor3,
    rssi: rssi3
  });

  setOldIBeaconByte(buf[offset],frame);
  offset++;
  obj.frames.push(frame);
  parseFrames(buf,offset,obj);
}

function parseFrames4_20mA(buf,offset,obj,reason) 
{
  var frame = {};
  frame.type = '4_20mA'; 
  if( reason == 0x00 ) frame.reason = 'regular';
  else if( reason == 0x01 ) frame.reason = 'alarm';
  else frame.reason = 'unknown';

  frame.number_sensor = toUInt8(buf,offset);
  offset++;

  frame.frame_unixtime = toUInt32LE(buf,offset);
  frame.frame_isotime = new Date(frame.frame_unixtime*1000).toISOString();
  offset += 4;
  frame.mA = toUInt32LE(buf,offset);
  offset += 4;
  obj.frames.push(frame);
  parseFrames(buf,offset,obj);
}
function parseFramesDigitalInput(buf,offset,obj,reason) 
{
  var frame = {};
  frame.type = 'digital_input'; 
  if( reason == 0x00 ) frame.reason = 'regular';
  else if( reason == 0x01 ) frame.reason = 'alarm';
  else frame.reason = 'unknown';
  frame.frame_unixtime = toUInt32LE(buf,offset);
  frame.frame_isotime = new Date(frame.frame_unixtime*1000).toISOString();
  offset += 4;
  frame.pin_number = toUInt8(buf,offset);
  offset++;
  if( buf[offset] === 0x00 ) frame.pin_state = 'low';
  else if( buf[offset] === 0x01 ) frame.pin_state = 'high';
  else frame.pin_state = 'unknown';
  offset++;
  obj.frames.push(frame);
  parseFrames(buf,offset,obj);
}
function parseFramesAnalogInput(buf,offset,obj,reason)  
{
  var frame = {};
  frame.type = 'analog_input'; 
  if( reason == 0x00 ) frame.reason = 'regular';
  else if( reason == 0x01 ) frame.reason = 'alarm';
  else frame.reason = 'unknown';
  frame.frame_unixtime = toUInt32LE(buf,offset);
  frame.frame_isotime = new Date(frame.frame_unixtime*1000).toISOString();
  offset += 4;
  frame.pin_number = toUInt8(buf,offset);
  offset++;
  frame.mV = toUInt32LE(buf,offset);
  offset += 4;
  if( buf[offset] === 0x00 ) frame.input_status = 'ok';
  else if( buf[offset] === 0x01 ) frame.input_status = 'overvoltage';
  else if( buf[offset] === 0x02 ) frame.input_status = 'no_sensor';
  else if( buf[offset] === 0x03 ) frame.input_status = 'input_error';
  else frame.input_status = 'unknown';
  offset++;
  obj.frames.push(frame);
  parseFrames(buf,offset,obj);
}
function parseFramesPulseCounter(buf,offset,obj,reason)  
{
  var frame = {};
  frame.type = 'pulse_counter'; 
  if( reason == 0x00 ) frame.reason = 'regular';
  else frame.reason = 'unknown';
  frame.frame_unixtime = toUInt32LE(buf,offset);
  frame.frame_isotime = new Date(frame.frame_unixtime*1000).toISOString();
  offset += 4;
  frame.pin_number = toUInt8(buf,offset);
  offset++;
  frame.counter = toUInt32LE(buf,offset);
  offset += 4;
  obj.frames.push(frame);
  parseFrames(buf,offset,obj);
}
function parseFramesLbsGeo(buf,offset,obj,reason)  
{
  var frame = {};
  frame.type = 'lbs_geolocation'; 
  if( reason == 0x00 ) frame.reason = 'regular';
  else frame.reason = 'unknown';
  frame.frame_unixtime = toUInt32LE(buf,offset);
  frame.frame_isotime = new Date(frame.frame_unixtime*1000).toISOString();
  offset += 4;
  
  var mcc1 = toUInt16LE(buf,offset);
  offset += 2;
  var mnc1 = toUInt16LE(buf,offset);
  offset += 2;
  var lac1 = toUInt16LE(buf,offset);
  offset += 2;
  var cellid1 = toUInt32LE(buf,offset);
  offset += 4;
  var power1 = toInt16LE(buf,offset);
  offset += 2;

  var mcc2 = toUInt16LE(buf,offset);
  offset += 2;
  var mnc2 = toUInt16LE(buf,offset);
  offset += 2;
  var lac2 = toUInt16LE(buf,offset);
  offset += 2;
  var cellid2 = toUInt32LE(buf,offset);
  offset += 4;
  var power2 = toInt16LE(buf,offset);
  offset += 2;

  var mcc3 = toUInt16LE(buf,offset);
  offset += 2;
  var mnc3 = toUInt16LE(buf,offset);
  offset += 2;
  var lac3 = toUInt16LE(buf,offset);
  offset += 2;
  var cellid3 = toUInt32LE(buf,offset);
  offset += 4;
  var power3 = toInt16LE(buf,offset);
  offset += 2;
  if( validLbsData(mcc1,mnc1,lac1,cellid1,power1) ) frame.lbs_list.push({
    mcc: mcc1,
    mnc: mnc1,
    lac: lac1,
    cellid: cellid1,
    power_dBm: power1
  });
  if( validLbsData(mcc2,mnc2,lac2,cellid2,power2) ) frame.lbs_list.push({
    mcc: mcc2,
    mnc: mnc2,
    lac: lac2,
    cellid: cellid2,
    power_dBm: power2
  });
  if( validLbsData(mcc3,mnc3,lac3,cellid3,power3) ) frame.lbs_list.push({
    mcc: mcc3,
    mnc: mnc3,
    lac: lac3,
    cellid: cellid3,
    power_dBm: power3
  });
  obj.frames.push(frame);
  parseFrames(buf,offset,obj);
}

function parseFramesWiFiGeo(buf,offset,obj,reason)
{
  var frame = {};
  frame.type = 'wifi'; 
  if( reason == 0x00 ) frame.reason = 'regular';
  else if( reason == 0x01 ) frame.reason = 'change_mode';
  else if( reason == 0x03 ) frame.reason = 'result_request';
  else frame.reason = 'unknown';
  frame.frame_unixtime = toUInt32LE(buf,offset);
  frame.frame_isotime = new Date(frame.frame_unixtime*1000).toISOString();
  offset += 4;
  frame.wifi_ap_list = [];
  var bssid1 = buf.slice(offset,offset+6);
  var mac1 = toMac(bssid1);
  offset += 6;
  var rssi1 = toInt8(buf,offset);
  offset++;
  
  var bssid2 = buf.slice(offset,offset+6);
  var mac2 = toMac(bssid2);
  offset += 6;
  var rssi2 = toInt8(buf,offset);
  offset++;
  
  var bssid3 = buf.slice(offset,offset+6);
  var mac3 = toMac(bssid3);
  offset += 6;
  var rssi3 = toInt8(buf,offset);
  offset++;
  
  setOldWiFiGeoByte(buf[offset],frame);

  if ( validBssid(bssid1) ) frame.wifi_ap_list.push({
    mac: mac1,
    rssi: rssi1,
    is_home_network: frame.is_home_network_1
  });
  if ( validBssid(bssid2) ) frame.wifi_ap_list.push({
    mac: mac2,
    rssi: rssi2,
    is_home_network: frame.is_home_network_2
  });
  if ( validBssid(bssid3) ) frame.wifi_ap_list.push({
    mac: mac3,
    rssi: rssi3,
    is_home_network: frame.is_home_network_3
  });

  delete frame.is_home_network_1;
  delete frame.is_home_network_2;
  delete frame.is_home_network_3;

  offset++;
  obj.frames.push(frame);
  parseFrames(buf,offset,obj);
}
function parseFramesGNSS(buf,offset,obj,reason)
{
  var frame = {};
  frame.type = 'gnss'; 
  if( reason == 0x00 ) frame.reason = 'regular';
  else if( reason == 0x01 ) frame.reason = 'change_mode';
  else if( reason == 0x03 ) frame.reason = 'result_request';
  else frame.reason = 'unknown';
  frame.frame_unixtime = toUInt32LE(buf,offset);
  frame.frame_isotime = new Date(frame.frame_unixtime*1000).toISOString();
  offset += 4;

  frame.lat = toIntLE(buf,offset,4) / 100000;
  offset += 4;
  frame.lon = toIntLE(buf,offset,4) / 100000;
  offset += 4;
  frame.alt = toUInt16LE(buf,offset);
  offset += 2;
  frame.speed_kmh = toUInt16LE(buf,offset);
  offset += 2;
  frame.hdop = toUInt8(buf,offset) / 10;
  offset++;
  setOldGnssByte(buf[offset],frame);
  offset++;
  obj.frames.push(frame);
  parseFrames(buf,offset,obj); 
}
//-----------------------------------------------------
// Converters
//-----------------------------------------------------
function hexToBuffer( hex )
{
  var buffer=[];
  for ( var i = 0; i < hex.length - 1; i = i + 2 )
  {
     var item = hex.substring( i, i + 2 );
     var value = parseInt(item,16);
     if(isNaN(value)) return false;
     buffer.push( value );
  }
  return buffer;
}
function toInt8 (buf, offset) {
  offset = offset >>> 0;
  if (!(buf[offset] & 0x80)) return (buf[offset]);
  return ((0xff - buf[offset] + 1) * -1);
} 
function to32Real(bytes)
{
    var bits = (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | (bytes[3]);
    var sign = ((bits >>> 31) == 0) ? 1.0 : -1.0;
    var e = ((bits >>> 23) & 0xff);
    var m = (e == 0) ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
    var f = sign * m * Math.pow(2, e - 150);
    return f;
}
function toUInt8 (buf, offset) 
{
  offset = offset >>> 0;
  return (buf[offset]);
}
function toMac(arr)
{
  var res = '';
  for ( var i = 0; i<arr.length; i++ )
  {
    var byte = arr[i].toString(16);
    if( byte.length < 2 ) byte = '0'+byte;
    if(i==0) res += byte;
    else res += ':'+byte;
  }
  return res;
}
function toUInt16LE (buf, offset) 
{
  offset = offset >>> 0;
  return  buf[offset] | 
        ( buf[offset + 1] << 8 );
}

function toInt16LE (buf, offset) 
{
    offset = offset >>> 0;
    var val = buf[offset] | (buf[offset + 1] << 8);
    return (val & 0x8000) ? val | 0xFFFF0000 : val;
}
function toUInt32LE (buf, offset) 
{
  offset = offset >>> 0;
  return ((buf[offset]) |
          (buf[offset + 1] << 8) |
          (buf[offset + 2] << 16)) +
          (buf[offset + 3] * 0x1000000);
}
function toBcdLE (buf) 
{
  //v_2
  var MASK_1 = 0xf0; //0b11110000
  var MASK_2 = 0x0f; //0b00001111
  var z = 0;
  var res = 0;
  for( var i = 0; i < buf.length; i++ )
  {
    var t1 = ( buf[i] & MASK_1 ) >> 4;
    var t2 = ( buf[i] & MASK_2 ) >> 0;
    res += t2*Math.pow(10,z);
    z++;
    res += t1*Math.pow(10,z);
    z++;
  }
  return res;
}
function toIntLE (buf, offset, length) 
{
  offset = offset >>> 0;
  length = length >>> 0;

  var result = buf[offset];
  var i = 0;
  var mul = 1;
  
  while ( ++i < length && (mul *= 0x100) ) 
  {
    var byte = buf[offset + i];
    result += byte * mul;
  }
  
  mul *= 0x80;
  
  if (result >= mul) 
  {
    result -= Math.pow(2, 8 * length);
  }

  return result;
}
function toASCII(buf,offset,countByte)
{
  offset = offset >>> 0;
  countByte = countByte >>> 0;
  var result = '';
  for (var i = offset; i < (offset+countByte); i++ )
  {
    result+=String.fromCharCode(buf[i]);
  }
  return result;
}
function toHex(buf,offset,countByte)
{
  offset = offset >>> 0;
  countByte = countByte >>> 0;
  var result = '';
  for (var i = offset; i < (offset+countByte); i++ )
  {
    var byte = buf[i].toString(16);
    if( byte.length == 1 ) byte = '0'+byte;
    result = byte + result ;
  }
  return result;
}
//-----------------------------------------------------
// Auxiliaries Functions
//-----------------------------------------------------
function setpowerInformation(buf,offset,obj)
{
    var MASK_TYPE_POWER     = 0x01; //0b00000001
    var MASK_BATTERY_CHARGE = 0xfe; //0b11111110
    var type_power = ( buf[offset] & MASK_TYPE_POWER ) >> 0;
    if( type_power === 0 ) 
    {
        obj.type_power = 'battery';
    }
    else 
    {
        obj.type_power = 'external';
    }
    var charge = ( buf[offset] & MASK_BATTERY_CHARGE ) >> 1;
    if( charge >= 0 )
    {
        obj.battery_pct = charge;
    }
}
function setProtocolInformation(buf,offset,obj) 
{
    var MASK_SI_SN              = 0x01; //0b00000001
    var MASK_VERSION_W_PROTOCOL = 0x0e; //0b00001110
    var MASK_IS_PAYLOAD_SIZE    = 0x10; //0b00010000
    var MASK_RFU                = 0xe0; //0b11100000
    var isSN             = ( buf[offset] & MASK_SI_SN )              >> 0;
    var versionWProtocol = ( buf[offset] & MASK_VERSION_W_PROTOCOL ) >> 1;
    var isPayloadSize    = ( buf[offset] & MASK_IS_PAYLOAD_SIZE )    >> 4;
    var rfu              = ( buf[offset] & MASK_RFU )                >> 5;
    obj.is_sn = !!isSN;
    obj.version_protocol = versionWProtocol;
    obj.is_payload_size = !!isPayloadSize;
    // obj.rfu = rfu;
}
function setOldWiFiGeoByte(byte,obj)
{
  var MASK_RFU              = 0x0f; //0b00001111 
  var MASK_MOVEMENT         = 0x10; //0b00010000
  var MASK_IS_HOME_NETWORK1 = 0x20; //0b00100000
  var MASK_IS_HOME_NETWORK2 = 0x40; //0b01000000
  var MASK_IS_HOME_NETWORK3 = 0x80; //0b10000000
  
  var rfu            = ( byte & MASK_RFU )              >> 0;
  var movement       = ( byte & MASK_MOVEMENT )         >> 4;
  var isHomeNetwork1 = ( byte & MASK_IS_HOME_NETWORK1 ) >> 5;
  var isHomeNetwork2 = ( byte & MASK_IS_HOME_NETWORK2 ) >> 6;
  var isHomeNetwork3 = ( byte & MASK_IS_HOME_NETWORK3 ) >> 7;

  // obj.rfu = rfu;
  obj.in_movement = !!movement;
  obj.is_home_network_1 = !!isHomeNetwork1;
  obj.is_home_network_2 = !!isHomeNetwork2;
  obj.is_home_network_3 = !!isHomeNetwork3;
  
}
function setOldGnssByte(byte,obj)
{
  var MASK_USED_SATELLITES   = 0x1f; //0b00011111
  var MASK_INSIDE_GEOFENCE_1 = 0x20; //0b00100000
  var MASK_INSIDE_GEOFENCE_2 = 0x40; //0b01000000
  var MASK_MOVEMENT          = 0x80; //0b10000000
  var usedSattellites = ( byte & MASK_USED_SATELLITES )   >> 0;
  var insideGeofence1 = ( byte & MASK_INSIDE_GEOFENCE_1 ) >> 5;
  var insideGeofence2 = ( byte & MASK_INSIDE_GEOFENCE_2 ) >> 6;
  var movement        = ( byte & MASK_MOVEMENT )          >> 7;
  obj.used_sat = usedSattellites;
  obj.geofence1 = !!insideGeofence1?'inside':'outside';
  obj.geofence2 = !!insideGeofence2?'inside':'outside';
  obj.in_movement = !!movement;
}
function setDeviceFirmwareVersion(byte,obj)
{
  var MASK_MAJOR = 0x0f; //0b00001111
  var MASK_MINOR = 0xf0; //0b11110000
  var major = ( byte & MASK_MAJOR ) >> 0;
  var minor = ( byte & MASK_MINOR ) >> 4;
  obj.version = major+'.'+minor;
}
function setOldIBeaconByte(byte,obj)
{
  var MASK_RFU      = 0x7f; //0b01111111
  var MASK_MOVEMENT = 0x80; //0b10000000
  var rfu      = ( byte & MASK_RFU )      >> 0;
  var movement = ( byte & MASK_MOVEMENT ) >> 7;
  obj.in_movement = !!movement;
  // obj.rfu = rfu;
}
function getNameModbusFunction(id)
{
  if( id == 0x00 ) return 'read_coil_status';
  else if( id == 0x01 ) return 'read_discrete_inputs';
  else if( id == 0x02 ) return 'read_hlding_registers';
  else if( id == 0x03 ) return 'input_registers';
  else return 'unknown';
} 
function getModelNameById(id)
{
  id = parseInt(id);
  if( id === 1 ) return 'Airbit light controller';
  else if( id === 200 ) return 'IXOCAT-LW-FULL';	
  else if( id === 201 ) return 'IXOCAT-LW-LIGHT';	
  else if( id === 3 ) return 'Betar LoRaWAN water meter LC';	
  else if( id === 4 ) return 'Betar Nb-IoT water meter LC';	
  else if( id === 500 ) return 'IXOCAT-NB-FULL';	
  else if( id === 501 ) return 'IXOCAT-NB-LIGHT';	
  else if( id === 7 ) return 'ERTX-L01';	
  else if( id === 8 ) return 'Construtag';	
  else if( id === 9 ) return 'MTBO-01-Nb';	
  else if( id === 10 ) return 'TaigaBikeTracker';	
  else if( id === 11 ) return 'MTBO-01-2G';	
  else if( id === 12 ) return 'SST_GAS_radio_module';	
  else if( id === 13 ) return 'NbIoT Button';	
  else if( id === 14 ) return 'МКРС-02';	
  else if( id === 15 ) return 'BS controller';	
  else if( id === 16 ) return 'Airbit light controller NbIoT';	
  else if( id === 17 ) return 'IoT node';	
  else if( id === 18 ) return 'NIS_METER';	
  else if( id === 19 ) return 'RoadsignTracker-LW-FULL';	
  else if( id === 21 ) return 'Stels Smoke Sensor';	
  else if( id === 22 ) return 'Betar LoRaWAN water meter HALL';	
  else if( id === 23 ) return 'Betar Nb-IoT water meter HALL';	
  else if( id === 24 ) return 'NodeG';	
  else if( id === 25 ) return 'TaigaTracker LoRaWAN';	
  else if( id === 26 ) return 'TaigaTracker Nb-IoT';	
  else if( id === 27 ) return 'TaigaBeacon';	
  else if( id === 28 ) return 'ERTX-ODK-2CH';	
  else if( id === 29 ) return 'ERTX crypto kit';	
  else if( id === 30 ) return 'TaigaPersonalTracker LW';	
  else if( id === 31 ) return 'TaigaPersonalTracker NB';	
  else if( id === 32 ) return 'TaigaPersonalTracker 2G';	
  else if( id === 33 ) return 'TaigaNode Lw';	
  else if( id === 34 ) return 'TaigaNode Nb';	
  else if( id === 35 ) return 'TaigaTracker2G';	
  else if( id === 36 ) return 'AirbitSensorHub-LW';	
  else if( id === 37 ) return 'AuroraNodeODK';	
  else if( id === 38 ) return 'TaigaBigTracker';	
  else if( id === 39 ) return 'NhrsPersonalTracker';	
  else if( id === 40 ) return 'WasteSensor-UKS';	
  else if( id === 41 ) return 'TaigaBikeTrackerE';	
  else if( id === 42 ) return 'ClickButton';	
  else if( id === 43 ) return 'FannaConcentrator';	
  else if( id === 44 ) return 'MyLogger';	
  else if( id === 45 ) return 'TaigaCartTracker';	
  else if( id === 46 ) return 'NtmPulseNB';	
  else if( id === 47 ) return 'SoftControl-Pass';	
  else if( id === 48 ) return 'TempButton';	
  else if( id === 49 ) return 'Uveos';	
  else if( id === 50 ) return 'McsmPulseNB';	
  else if( id === 51 ) return 'FannaConcentrator IN PWR';	
  else if( id === 52 ) return 'AuroraNodeOdkBoard';	
  else if( id === 53 ) return 'Siltrack V1 EXT ANT';	
  else if( id === 54 ) return 'RaceAnalyse';	
  else if( id === 55 ) return 'MaximaContainerTracker';	
  else if( id === 56 ) return 'FannaEframe';	
  else if( id === 57 ) return 'MaximaWasteSensorV2';	
  else if( id === 58 ) return 'Module SGMB-USPD-NB-1';	
  else if( id === 59 ) return 'AuroraNodeLTE';	
  else if( id === 60 ) return 'AuroraNodeNB';	
  else if( id === 61 ) return 'AuroraNodeETH';	
  else if( id === 62 ) return 'TaigaPulseCounterNb';	
  else if( id === 63 ) return 'FannaAnchor';	
  else if( id === 64 ) return 'AuroraNodeExtBoards';	
  else if( id === 65 ) return 'TaigaPersonalTracker LW_without GNSS';	
  else if( id === 66 ) return 'TaigaPersonalTracker NB_without GNSS';	
  else if( id === 67 ) return 'AuroraNodeGTS';	
  else if( id === 68 ) return 'TetronTrackerLight';	
  else if( id === 69 ) return 'SGMB-NB-2G';	
  else if( id === 70 ) return 'TaigaPulseCounterLW';
  else if( id === 71 ) return 'AnalogPCBBoard';	
  else if( id === 75 ) return 'ErtxTermologgerNb';	
  else return 'unknown';
}

function validIBeacon( major, minor, rssi )
{
  if( major < 0 || major > 65535 ) return false;
  if( minor < 0 || minor > 65535 ) return false;
  if( rssi < -128 || rssi > 0 ) return false;
  return true;
}
function validLbsData(mcc,mnc,lac,cellid,power)
{
  if( mcc < 0 || mcc > 65535 ) return false;
  if( mnc < 0 || mnc > 65535 ) return false;
  if( lac < 0 || lac > 65535 ) return false;
  if( cellid < 0 || cellid > 0xFFFFFFFF ) return false;
  if( power < -32768 || power > 32768 ) return false;
  return true;
}
function validBssid(buf)
{
  var count00 = 0;
  var countFF = 0;
  for(var i = 0 ; i < buf.length; i++ )
  {
    if( buf[i] !== 0x00 && buf[i] !== 0xff ) break;
    else if( buf[i] === 0x00 ) count00++;
    else if( buf[i] === 0xff ) countFF++;
  }
  if( count00 === buf.length ) return false;
  else if( countFF === buf.length ) return false;
  else return true;
}

/*************************************************** */

function decodeUplink(input) {
    let data = {};
    let error = {};
    let errors = [];
    let buffer = input.bytes;
  
    if(buffer !== false && buffer.length>0)
    {
    data = Decode(10,buffer); 
    delete data.raw;
  
    if (data && data.error !== undefined){
        error.error_type = data.error;
        delete data.error;
        error.debug_info = data.error_debug_info;
        delete data.error_debug_info;
        errors.push(error);
    }
    
  
  }
  
  return {
  data,
  warnings: [],
  errors : errors
  };
};