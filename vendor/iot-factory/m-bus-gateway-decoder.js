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
    var ts = new Date();
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
  else if ( typeFrame == 0x16 ) parseFramesMBUS(buf,offset,obj,reasonFrame); 
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
function parseFramesMBUS(buf,offset,obj,reason)
{
  var frame = {};
  frame.type = 'MBUS';
  if( reason == 0x00 ) frame.reason = 'regular';
  else if( reason == 0x01 ) frame.reason = 'alarm';
  else frame.reason = 'unknown';
  frame.frame_unixtime = toUInt32LE(buf,offset);
  frame.frame_isotime = new Date(frame.frame_unixtime*1000).toISOString();
  offset += 4;
  
  var rsp_ud = buf[offset];
  offset++;
  var sn = toHex(buf,offset,4);
  offset += 4;
  if( sn < 0x00000000 || sn > 0x99999999 ) sn = 'unknown';
  var medium = buf[offset];
  offset++;

  var MASK_STATUS = 0x03; //0b00000011
  var status = ( buf[offset] & MASK_STATUS ) >> 0;
  var textStatus = 'unknown';
  if( status === 0 ) textStatus = 'no_error';
  else if( status === 1 ) textStatus = 'application_buse';
  else if( status === 2 ) textStatus = 'any_application_error';
  offset++;
  frame.medium = getTextMediumMBUS(medium);
  frame.status = textStatus;
  frame.meter_serial_number = sn;
  var dif_raw = buf[offset];
  frame.dif = parseDif(dif_raw);
  if(frame.dif.type === undefined )
  {
    frame.error = 'unknown_dif_in_frame_mbus';
    frame.error_debug_info = 'type='+frame.type+'|offset='+offset;
  }
  else if( frame.dif.type ==='selection_readout' || frame.dif.type ==='veriable_length' || frame.dif.type ==='special_function'  )
  {
    frame.error = 'unsupported_dif_in_frame_mbus';
    frame.error_debug_info = 'type='+frame.type+'|offset='+offset+'|dif_type='+frame.dif.type;
  }
  else
  {
    offset++;
    if( frame.dif.extension_bit === 1 ) setDife(buf,offset,frame);
    if( frame.dife_list && frame.dife_list.length > 0 ) offset += frame.dife_list.length;
    var vif_raw = buf[offset];
    frame.vif = parseVif(vif_raw);
    offset++;
    if( frame.vif.value === 0xfd || frame.vif.value === 0xfb )
    {
      frame.vif.value = buf[offset];
      offset++;
      //if(frame.vif.value === 0xfd ) frame.vif.data=findVife( frame.vif.value+256 );
      //if(frame.vif.value === 0xfb ) frame.vif.data=findVife( frame.vif.value+512 );
    }
    else if( frame.vif.value === 0x7c )
    {
      frame.error = 'unsupported_vif_in_frame_mbus';
      frame.error_debug_info = 'type='+frame.type+'|offset='+(offset-1)+'|vif_type=plain_text';
    }
    else if( frame.vif.value === 0x7f )
    {
      frame.error = 'unsupported_vif_in_frame_mbus';
      frame.error_debug_info = 'type='+frame.type+'|offset='+(offset-1)+'|vif_type=manufacturer_specific_coding';
    }
    else
    {
      frame.vif.data = findVife( frame.vif.value );
    }
    if(frame.vif.extension_bit === 1 && frame.error === undefined)
    {
      setVife(buf,offset,frame,vif_raw);
      if( frame.countByteVife !== undefined ) offset += frame.countByteVife; 
    }


    if( frame.vife_list &&  frame.vife_list.length > 0 )
    {
      frame.units = frame.vife_list[frame.vife_list.length-1].data;
    }
    else
    {
      frame.units = frame.vif.data;
    }
    if( !isNaN(offset) && frame.error === undefined )
    {
      frame.measurement = {};
      if(frame.dif.type == 'no_data')
      {
        frame.measurement.value_raw = 'no_data';
      }
      else if ( frame.dif.countByte )
      {
        frame.measurement.raw = buf.slice(offset,offset+frame.dif.countByte);
        offset+=frame.dif.countByte;
        if(frame.dif.type === 'int')
        {
          frame.measurement.value_raw = toIntLE (frame.measurement.raw, 0, frame.dif.countByte);
        }
        else if(frame.dif.type === 'bcd')
        {
          frame.measurement.value_raw = toBcdLE(frame.measurement.raw);
        }
        else if(frame.dif.type === 'real')
        {
          frame.measurement.value_raw = to32Real(frame.measurement.raw)
        }
        else 
        {
          frame.error = 'error_parse_frame_mbus';
          frame.error_debug_info = 'type='+frame.type+'|offset='+(offset)+'|unknown_type_data';
        }

        if( frame.error === undefined && frame.units !== undefined )
        {
          // frame.units
          frame.measurement.value = frame.measurement.value_raw * frame.units[1];
          frame.measurement.desc = frame.units[3];
          frame.measurement.unit = frame.units[2];
          frame.measurement.dataType = frame.dif.function_field_desc;
        }
      }
      else 
      {
        frame.error = 'error_parse_frame_mbus';
        frame.error_debug_info = 'type='+frame.type+'|offset='+(offset)+'';
      }
    }
  }
  obj.frames.push(frame);
  if( obj.error === undefined ) parseFrames(buf,offset,obj);
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


function setDeviceFirmwareVersion(byte,obj)
{
  var MASK_MAJOR = 0x0f; //0b00001111
  var MASK_MINOR = 0xf0; //0b11110000
  var major = ( byte & MASK_MAJOR ) >> 0;
  var minor = ( byte & MASK_MINOR ) >> 4;
  obj.version = major+'.'+minor;
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

function getTextMediumMBUS(code)
{
  if( code === 0x00 ) return 'Other';
  else if( code === 0x01 ) return 'Oil';	
  else if( code === 0x02 ) return 'Electricity';	
  else if( code === 0x03 ) return 'Gas';	
  else if( code === 0x04 ) return 'Heat (volume measured at return temperature: outlet)';	
  else if( code === 0x05 ) return 'Steam';	
  else if( code === 0x06 ) return 'Hot Water';	
  else if( code === 0x07 ) return 'Water';	
  else if( code === 0x08 ) return 'Heat Cost Allocator.';	
  else if( code === 0x09 ) return 'Compressed Air';	
  else if( code === 0x0A ) return 'Cooling load meter (volume measured at return temperature: outlet)';	
  else if( code === 0x0B ) return 'Cooling load meter (volume measured at flow temperature: inlet)';	
  else if( code === 0x0C ) return 'Heat (volume measured at flow temperature: inlet)';	
  else if( code === 0x0D ) return 'Heat / Cooling load meter';	
  else if( code === 0x0E ) return 'Bus / System';	
  else if( code === 0x0F ) return 'Unknown Medium';	
  else if( code >= 0x10 && code <= 0x15 ) return 'Reserved';	
  else if( code === 0x16 ) return 'Cold Water';	
  else if( code === 0x17 ) return 'Dual Water';	
  else if( code === 0x18 ) return 'Pressure';	
  else if( code === 0x19 ) return 'A/D Converter';	
  else if( code >= 0x20 && code <= 0xFF ) return 'Reserved';	
  else return 'unknown';
}
function getTextFuncFieldDif(val)
{
  if( 0x00 === val ) return 'instantaneous_value';           //0b00
  else if( 0x02 === val ) return 'minimum_value';            //0b10
  else if( 0x01 === val ) return 'maximum_value';            //0b01
  else if( 0x03 === val ) return 'value_during_error_state'; //0b11
  return undefined;
}
function parseVif( vif )
{
  var result = {
    raw: vif
  };
  var MASK_UNIT          = 0x7f; //0b01111111
  var MASK_EXTENSION_BIT = 0x80; //0b10000000
  var unit         = ( vif & MASK_UNIT )          >> 0;
  var extensionBit = ( vif & MASK_EXTENSION_BIT ) >> 7;

  result.extension_bit = extensionBit;
  result.value = unit;

  return result;
}
function parseDif( dif )
{
  var result = {
    raw: dif
  };
  var MASK_DATA_FIELD         = 0x0f; //0b00001111
  var MASK_FUNCTION_FIELD     = 0x30; //0b00110000
  var MASK_LSB_STORAGE_NUMBER = 0x40; //0b01000000
  var MASK_EXTENSION_BIT      = 0x80; //0b10000000
  var dataField      = ( dif & MASK_DATA_FIELD )         >> 0;
  var functionField  = ( dif & MASK_FUNCTION_FIELD )     >> 4;
  var lsbStorageNumb = ( dif & MASK_LSB_STORAGE_NUMBER ) >> 6;
  var extensionBit   = ( dif & MASK_EXTENSION_BIT )      >> 7;

  result.extension_bit = extensionBit;
  result.lsb_storage_number = lsbStorageNumb;
  result.function_field = functionField;
  result.function_field_desc = getTextFuncFieldDif( result.function_field );

  if( dataField === 0x00 )      //0b0000
  {
    result.type = 'no_data';
    result.countByte = 0;
  }
  else if( dataField === 0x01 ) //0b0001
  {
    result.type = 'int';
    result.countByte = 1;
  }
  else if( dataField === 0x02 ) //0b0010
  {
    result.type = 'int';
    result.countByte = 2;
  }
  else if( dataField === 0x03 ) //0b0011
  {
    result.type = 'int';
    result.countByte = 3;
  }
  else if( dataField === 0x04 ) //0b0100 
  {
    result.type = 'int';
    result.countByte = 4;
  }
  else if( dataField === 0x05 ) //0b0101
  {
    result.type = 'real';
    result.countByte = 4;
  }
  else if( dataField === 0x06 ) //0b0110 
  {
    result.type = 'int';
    result.countByte = 6;
  }
  else if( dataField === 0x07 ) //0b0111
  {
    result.type = 'int';
    result.countByte = 8;
  }
  else if( dataField === 0x08 ) //0b1000
  {
    result.type = 'selection_readout';
    result.countByte = undefined;
  }
  else if( dataField === 0x09 ) //0b1001
  {
    result.type = 'bcd';
    result.countByte = 1;
  }
  else if( dataField === 0x0a ) //0b1010
  {
    result.type = 'bcd';
    result.countByte = 2;
  }
  else if( dataField === 0x0b ) //0b1011
  {
    result.type = 'bcd';
    result.countByte = 3;
  }
  else if( dataField === 0x0c ) //0b1100
  {
    result.type = 'bcd';
    result.countByte = 4;
  }
  else if( dataField === 0x0d ) //0b1101
  {
    result.type = 'veriable_length';
    result.countByte = undefined;
  }
  else if( dataField === 0x0e ) //0b1110
  {
    result.type = 'bcd';
    result.countByte = 12;
  }
  else if( dataField === 0x0f ) //0b1111
  {
    result.type = 'special_function';
    result.countByte = undefined;
  }
  return result;
}
function findVife(val)
{
  for(var key in mbus_variable_vif_table)
  {
    var vif = mbus_variable_vif_table[key];
    if(val === vif[0]) return vif;
  }
  return [val,1.0e0,'','unknown'];
} 
function setVife(buf,offset,frame,oldVif)
{
  if( frame.vife_list === undefined ) frame.vife_list = [];
  if( frame.countByteVife === undefined ) frame.countByteVife = 0;
  frame.countByteVife++;
  var vif = {
    raw: buf[offset]
  };
  var MASK_UNIT          = 0x7f; //0b01111111
  var MASK_EXTENSION_BIT = 0x80; //0b10000000
  vif.value         = ( buf[offset] & MASK_UNIT )          >> 0;
  vif.extension_bit = ( buf[offset] & MASK_EXTENSION_BIT ) >> 7;
  if( vif.value === 0xfd || vif.value === 0xfb )
  {
    offset++;
    frame.countByteVife++;
    vif.value = buf[offset];
    //if(vif.value === 0xfd ) vif.data=findVife( vif.value+256 );
    //if(vif.value === 0xfb ) vif.data=findVife( vif.value+512 );
  }
  else
  {
    if( oldVif ===  0xfd ) vif.data=findVife( vif.value+256 );
    else if( oldVif ===  0xfb ) vif.data=findVife( vif.value+512 );
    else vif.data = findVife( vif.value )
  }
  frame.vife_list.push(vif);
  if( frame.vif.value === 0x7c )
  {
    frame.error = 'unsupported_vif_in_frame_mbus';
    frame.error_debug_info = 'type='+frame.type+'|offset='+(offset-1)+'|vif_type=plain_text';
  }
  else if( frame.vif.value === 0x7f )
  {
    frame.error = 'unsupported_vif_in_frame_mbus';
    frame.error_debug_info = 'type='+frame.type+'|offset='+(offset-1)+'|vif_type=manufacturer_specific_coding';
  }
  if( frame.error === undefined && vif.extension_bit === 1 )
  {
    offset++;
    setVife(buf,offset,frame,vif.raw);
  }
}
function setDife(buf,offset,frame)
{
  if( frame.dife_list === undefined ) frame.dife_list = [];
  var dife = {};
  var MASK_STORAGE_NUMBER = 0x0f; //0b00001111
  var MASK_TARIF          = 0x30; //0b00110000
  var MASK_UNIT           = 0x40; //0b01000000
  var MASK_EXTENSION_BIT  = 0x80; //0b10000000
  var storageNumber = ( buf[offset] & MASK_STORAGE_NUMBER ) >> 0;
  var tarif         = ( buf[offset] & MASK_TARIF )          >> 4;
  var unit          = ( buf[offset] & MASK_UNIT )           >> 6;
  var extensionBit  = ( buf[offset] & MASK_EXTENSION_BIT )  >> 7;
  dife.storage_number = storageNumber;
  dife.tarif          = tarif;
  dife.unit           = unit;
  dife.extensionBit   = extensionBit;
  frame.dife_list.push(dife);
  if( dife.extensionBit === 1 )
  {
    offset++;
    setDife(buf,offset,frame);
  }
}

//-----------------------------------------------------
// A table of VIF values for the analysis of mbus frames
//-----------------------------------------------------
var mbus_variable_vif_table = [
  /*  Primary VIFs (main table), range 0x00 - 0xFF */
  /*  E000 0nnn    energy Wh (0.001Wh to 10000Wh) */
  [0x00, 1.0e-3, "Wh", "energy"],
  [0x01, 1.0e-2, "Wh", "energy"],
  [0x02, 1.0e-1, "Wh", "energy"],
  [0x03, 1.0e0, "Wh", "energy"],
  [0x04, 1.0e1, "Wh", "energy"],
  [0x05, 1.0e2, "Wh", "energy"],
  [0x06, 1.0e3, "Wh", "energy"],
  [0x07, 1.0e4, "Wh", "energy"],

  /* E000 1nnn    energy  J (0.001kJ to 10000kJ) */
  [0x08, 1.0e0, "J", "energy"],
  [0x09, 1.0e1, "J", "energy"],
  [0x0A, 1.0e2, "J", "energy"],
  [0x0B, 1.0e3, "J", "energy"],
  [0x0C, 1.0e4, "J", "energy"],
  [0x0D, 1.0e5, "J", "energy"],
  [0x0E, 1.0e6, "J", "energy"],
  [0x0F, 1.0e7, "J", "energy"],

  /* E001 0nnn    volume m^3 (0.001l to 10000l) */
  [0x10, 1.0e-6, "m^3", "volume"],
  [0x11, 1.0e-5, "m^3", "volume"],
  [0x12, 1.0e-4, "m^3", "volume"],
  [0x13, 1.0e-3, "m^3", "volume"],
  [0x14, 1.0e-2, "m^3", "volume"],
  [0x15, 1.0e-1, "m^3", "volume"],
  [0x16, 1.0e0, "m^3", "volume"],
  [0x17, 1.0e1, "m^3", "volume"],

  /* E001 1nnn    mass kg (0.001kg to 10000kg) */
  [0x18, 1.0e-3, "kg", "mass"],
  [0x19, 1.0e-2, "kg", "mass"],
  [0x1A, 1.0e-1, "kg", "mass"],
  [0x1B, 1.0e0, "kg", "mass"],
  [0x1C, 1.0e1, "kg", "mass"],
  [0x1D, 1.0e2, "kg", "mass"],
  [0x1E, 1.0e3, "kg", "mass"],
  [0x1F, 1.0e4, "kg", "mass"],

  /* E010 00nn    On Time s */
  [0x20, 1.0, "s", "on_time"],     /* seconds */
  [0x21, 60.0, "s", "on_time"],    /* minutes */
  [0x22, 3600.0, "s", "on_time"],  /* hours   */
  [0x23, 86400.0, "s", "on_time"], /* days    */

  /* E010 01nn    Operating Time s */
  [0x24, 1.0, "s", "operating_time"],     /* seconds */
  [0x25, 60.0, "s", "operating_time"],    /* minutes */
  [0x26, 3600.0, "s", "operating_time"],  /* hours   */
  [0x27, 86400.0, "s", "operating_time"], /* days    */

  /* E010 1nnn    power W (0.001W to 10000W) */
  [0x28, 1.0e-3, "W", "power"],
  [0x29, 1.0e-2, "W", "power"],
  [0x2A, 1.0e-1, "W", "power"],
  [0x2B, 1.0e0, "W", "power"],
  [0x2C, 1.0e1, "W", "power"],
  [0x2D, 1.0e2, "W", "power"],
  [0x2E, 1.0e3, "W", "power"],
  [0x2F, 1.0e4, "W", "power"],

  /* E011 0nnn    power J/h (0.001kJ/h to 10000kJ/h) */
  [0x30, 1.0e0, "J/h", "power"],
  [0x31, 1.0e1, "J/h", "power"],
  [0x32, 1.0e2, "J/h", "power"],
  [0x33, 1.0e3, "J/h", "power"],
  [0x34, 1.0e4, "J/h", "power"],
  [0x35, 1.0e5, "J/h", "power"],
  [0x36, 1.0e6, "J/h", "power"],
  [0x37, 1.0e7, "J/h", "power"],

  /* E011 1nnn    volume Flow m3/h (0.001l/h to 10000l/h) */
  [0x38, 1.0e-6, "m^3/h", "volume_flow"],
  [0x39, 1.0e-5, "m^3/h", "volume_flow"],
  [0x3A, 1.0e-4, "m^3/h", "volume_flow"],
  [0x3B, 1.0e-3, "m^3/h", "volume_flow"],
  [0x3C, 1.0e-2, "m^3/h", "volume_flow"],
  [0x3D, 1.0e-1, "m^3/h", "volume_flow"],
  [0x3E, 1.0e0, "m^3/h", "volume_flow"],
  [0x3F, 1.0e1, "m^3/h", "volume_flow"],

  /* E100 0nnn     volume Flow ext.  m^3/min (0.0001l/min to
     1000l/min) */
  [0x40, 1.0e-7, "m^3/min", "volume_flow"],
  [0x41, 1.0e-6, "m^3/min", "volume_flow"],
  [0x42, 1.0e-5, "m^3/min", "volume_flow"],
  [0x43, 1.0e-4, "m^3/min", "volume_flow"],
  [0x44, 1.0e-3, "m^3/min", "volume_flow"],
  [0x45, 1.0e-2, "m^3/min", "volume_flow"],
  [0x46, 1.0e-1, "m^3/min", "volume_flow"],
  [0x47, 1.0e0, "m^3/min", "volume_flow"],

  /* E100 1nnn     volume Flow ext.  m^3/s (0.001ml/s to 10000ml/s) */
  [0x48, 1.0e-9, "m^3/s", "volume_flow"],
  [0x49, 1.0e-8, "m^3/s", "volume_flow"],
  [0x4A, 1.0e-7, "m^3/s", "volume_flow"],
  [0x4B, 1.0e-6, "m^3/s", "volume_flow"],
  [0x4C, 1.0e-5, "m^3/s", "volume_flow"],
  [0x4D, 1.0e-4, "m^3/s", "volume_flow"],
  [0x4E, 1.0e-3, "m^3/s", "volume_flow"],
  [0x4F, 1.0e-2, "m^3/s", "volume_flow"],

  /* E101 0nnn     mass_flow kg/h (0.001kg/h to 10000kg/h) */
  [0x50, 1.0e-3, "kg/h", "mass_flow"],
  [0x51, 1.0e-2, "kg/h", "mass_flow"],
  [0x52, 1.0e-1, "kg/h", "mass_flow"],
  [0x53, 1.0e0, "kg/h", "mass_flow"],
  [0x54, 1.0e1, "kg/h", "mass_flow"],
  [0x55, 1.0e2, "kg/h", "mass_flow"],
  [0x56, 1.0e3, "kg/h", "mass_flow"],
  [0x57, 1.0e4, "kg/h", "mass_flow"],

  /* E101 10nn     flow_temperature В°C (0.001В°C to 1В°C) */
  [0x58, 1.0e-3, "°C", "flow_temperature"],
  [0x59, 1.0e-2, "°C", "flow_temperature"],
  [0x5A, 1.0e-1, "°C", "flow_temperature"],
  [0x5B, 1.0e0, "°C", "flow_temperature"],

  /* E101 11nn return_temperature В°C (0.001В°C to 1В°C) */
  [0x5C, 1.0e-3, "°C", "return_temperature"],
  [0x5D, 1.0e-2, "°C", "return_temperature"],
  [0x5E, 1.0e-1, "°C", "return_temperature"],
  [0x5F, 1.0e0, "°C", "return_temperature"],

  /* E110 00nn    temperature Difference  K   (mK to  K) */
  [0x60, 1.0e-3, "K", "temperature_difference"],
  [0x61, 1.0e-2, "K", "temperature_difference"],
  [0x62, 1.0e-1, "K", "temperature_difference"],
  [0x63, 1.0e0, "K", "temperature_difference"],

  /* E110 01nn     External temperature В°C (0.001В°C to 1В°C) */
  [0x64, 1.0e-3, "°C", "external_temperature"],
  [0x65, 1.0e-2, "°C", "external_temperature"],
  [0x66, 1.0e-1, "°C", "external_temperature"],
  [0x67, 1.0e0, "°C", "external_temperature"],

  /* E110 10nn     Pressure bar (1mbar to 1000mbar) */
  [0x68, 1.0e-3, "bar", "Pressure"],
  [0x69, 1.0e-2, "bar", "Pressure"],
  [0x6A, 1.0e-1, "bar", "Pressure"],
  [0x6B, 1.0e0, "bar", "Pressure"],

  /* E110 110n     Time Point */
  [0x6C, 1.0e0, "-",
   "time_point_date"], /* n = 0        date, data type G */
  [0x6D, 1.0e0, "-",
   "time_point_date_time"], /* n = 1 time & date, data type F */

  /* E110 1110     Units for H.C.A. dimensionless */
  [0x6E, 1.0e0, "Units for H.C.A.", "H_C_A"],

  /* E110 1111     Reserved */
  [0x6F, 0.0, "Reserved", "reserved"],

  /* E111 00nn     averaging_duration s */
  [0x70, 1.0, "s", "averaging_duration"],     /* seconds */
  [0x71, 60.0, "s", "averaging_duration"],    /* minutes */
  [0x72, 3600.0, "s", "averaging_duration"],  /* hours   */
  [0x73, 86400.0, "s", "averaging_duration"], /* days    */

  /* E111 01nn     Actuality Duration s */
  [0x74, 1.0, "s", "averaging_duration"],     /* seconds */
  [0x75, 60.0, "s", "averaging_duration"],    /* minutes */
  [0x76, 3600.0, "s", "averaging_duration"],  /* hours   */
  [0x77, 86400.0, "s", "averaging_duration"], /* days    */

  /* Fabrication No */
  [0x78, 1.0, "", "fabrication_no"],

  /* E111 1001 (Enhanced) Identification */
  [0x79, 1.0, "", "enhanced_identification"],

  /* E111 1010 Bus Address */
  [0x7A, 1.0, "", "bus_address"],

  /* Any VIF: 7Eh */
  [0x7E, 1.0, "", "any_vif"],

  /* manufacturer_specific: 7Fh */
  [0x7F, 1.0, "", "manufacturer_specific"],

  /* Any VIF: 7Eh */
  [0xFE, 1.0, "", "Any VIF"],

  /* manufacturer_specific: FFh */
  [0xFF, 1.0, "", "manufacturer_specific"],

  //VIF = FD START
  //
  //
  /* Main VIFE-Code Extension table (following VIF=FDh for primary
     VIF)
     See 8.4.4 a, only some of them are here. Using range 0x100 -
     0x1FF */

  /* E000 00nn   credit of 10nn-3 of the nominal local legal currency
     units */
  [0x100, 1.0e-3, "Currency units", "credit"],
  [0x101, 1.0e-2, "Currency units", "credit"],
  [0x102, 1.0e-1, "Currency units", "credit"],
  [0x103, 1.0e0, "Currency units", "credit"],

  /* E000 01nn   debit of 10nn-3 of the nominal local legal currency
     units */
  [0x104, 1.0e-3, "Currency units", "debit"],
  [0x105, 1.0e-2, "Currency units", "debit"],
  [0x106, 1.0e-1, "Currency units", "debit"],
  [0x107, 1.0e0, "Currency units", "debit"],

  /* E000 1000 Access Number (transmission count) */
  [0x108, 1.0e0, "", "access_number_transmission_count"],

  /* E000 1001 Medium (as in fixed header) */
  [0x109, 1.0e0, "", "device_type"],

  /* E000 1010 Manufacturer (as in fixed header) */
  [0x10A, 1.0e0, "", "manufacturer"],

  /* E000 1011 Parameter set identification */
  [0x10B, 1.0e0, "", "parameter_set_identification"],

  /* E000 1100 Model / Version */
  [0x10C, 1.0e0, "", "device_type"],

  /* E000 1101 Hardware version # */
  [0x10D, 1.0e0, "", "hardware_version"],

  /* E000 1110 Firmware version # */
  [0x10E, 1.0e0, "", "firmware_version"],

  /* E000 1111 Software version # */
  [0x10F, 1.0e0, "", "software_version"],

  /* E001 0000 Customer location */
  [0x110, 1.0e0, "", "customer_location"],

  /* E001 0001 Customer */
  [0x111, 1.0e0, "", "customer"],

  /* E001 0010 Access Code User */
  [0x112, 1.0e0, "", "access_code_user"],

  /* E001 0011 Access Code Operator */
  [0x113, 1.0e0, "", "access_code_operator"],

  /* E001 0100 Access Code System Operator */
  [0x114, 1.0e0, "", "access_code_system_operator"],

  /* E001 0101 Access Code Developer */
  [0x115, 1.0e0, "", "access_code_developer"],

  /* E001 0110 Password */
  [0x116, 1.0e0, "", "password"],

  /* E001 0111 Error flags (binary) */
  [0x117, 1.0e0, "", "error_flags"],

  /* E001 1000 Error mask */
  [0x118, 1.0e0, "", "error_mask"],

  /* E001 1001 Reserved */
  [0x119, 1.0e0, "Reserved", "кeserved"],

  /* E001 1010 digital_output (binary) */
  [0x11A, 1.0e0, "", "digital_output"],

  /* E001 1011 Digital Input (binary) */
  [0x11B, 1.0e0, "", "digital_input"],

  /* E001 1100 Baudrate [Baud] */
  [0x11C, 1.0e0, "Baud", "baudrate"],

  /* E001 1101 Response delay time [bittimes] */
  [0x11D, 1.0e0, "Bittimes", "response_delay_time"],

  /* E001 1110 Retry */
  [0x11E, 1.0e0, "", "retry"],

  /* E001 1111 Reserved */
  [0x11F, 1.0e0, "Reserved", "reserved"],

  /* E010 0000 First storage # for cyclic storage */
  [0x120, 1.0e0, "", "first_storage_for cyclic storage"],

  /* E010 0001 Last storage # for cyclic storage */
  [0x121, 1.0e0, "", "last_storage_for_cyclic_storage"],

  /* E010 0010 Size of storage block */
  [0x122, 1.0e0, "", "size_of_storage_block"],

  /* E010 0011 Reserved */
  [0x123, 1.0e0, "Reserved", "reserved"],

  /* E010 01nn storage_interval [sec(s)..day(s)] */
  [0x124, 1.0, "s", "storage_interval"],        /* second(s) */
  [0x125, 60.0, "s", "storage_interval"],       /* minute(s) */
  [0x126, 3600.0, "s", "storage_interval"],     /* hour(s)   */
  [0x127, 86400.0, "s", "storage_interval"],    /* day(s)    */
  [0x128, 2629743.83, "s", "storage_interval"], /* month(s)  */
  [0x129, 31556926.0, "s", "storage_interval"], /* year(s)   */

  /* E010 1010 Reserved */
  [0x12A, 1.0e0, "Reserved", "reserved"],

  /* E010 1011 Reserved */
  [0x12B, 1.0e0, "Reserved", "reserved"],

  /* E010 11nn duration_since_last_readout [sec(s)..day(s)] */
  [0x12C, 1.0, "s", "duration_since_last_readout"],     /* seconds */
  [0x12D, 60.0, "s", "duration_since_last_readout"],    /* minutes */
  [0x12E, 3600.0, "s", "duration_since_last_readout"],  /* hours   */
  [0x12F, 86400.0, "s", "duration_since_last_readout"], /* days    */

  /* E011 0000 Start (date/time) of tariff  */
  /* The information about usage of data type F (date and time) or
     data type G (date) can */
  /* be derived from the datafield (0010b: type G / 0100: type F). */
  [0x130, 1.0e0, "Reserved", "reserved"], /* ???? */

  /* E011 00nn Duration of tariff (nn=01 ..11: min to days) */
  [0x131, 60.0, "s", "storage_interval"],    /* minute(s) */
  [0x132, 3600.0, "s", "storage_interval"],  /* hour(s)   */
  [0x133, 86400.0, "s", "storage_interval"], /* day(s)    */

  /* E011 01nn period_of_tariff [sec(s) to day(s)]  */
  [0x134, 1.0, "s", "period_of_tariff"],        /* seconds  */
  [0x135, 60.0, "s", "period_of_tariff"],       /* minutes  */
  [0x136, 3600.0, "s", "period_of_tariff"],     /* hours    */
  [0x137, 86400.0, "s", "period_of_tariff"],    /* days     */
  [0x138, 2629743.83, "s", "period_of_tariff"], /* month(s) */
  [0x139, 31556926.0, "s", "period_of_tariff"], /* year(s)  */

  /* E011 1010 dimensionless / no VIF */
  [0x13A, 1.0e0, "", "dimensionless"],

  /* E011 1011 Reserved */
  [0x13B, 1.0e0, "Reserved", "reserved"],

  /* E011 11xx Reserved */
  [0x13C, 1.0e0, "Reserved", "reserved"],
  [0x13D, 1.0e0, "Reserved", "reserved"],
  [0x13E, 1.0e0, "Reserved", "reserved"],
  [0x13F, 1.0e0, "Reserved", "reserved"],

  /* E100 nnnn   Volts electrical units */
  [0x140, 1.0e-9, "V", "voltage"],
  [0x141, 1.0e-8, "V", "voltage"],
  [0x142, 1.0e-7, "V", "voltage"],
  [0x143, 1.0e-6, "V", "voltage"],
  [0x144, 1.0e-5, "V", "voltage"],
  [0x145, 1.0e-4, "V", "voltage"],
  [0x146, 1.0e-3, "V", "voltage"],
  [0x147, 1.0e-2, "V", "voltage"],
  [0x148, 1.0e-1, "V", "voltage"],
  [0x149, 1.0e0, "V", "voltage"],
  [0x14A, 1.0e1, "V", "voltage"],
  [0x14B, 1.0e2, "V", "voltage"],
  [0x14C, 1.0e3, "V", "voltage"],
  [0x14D, 1.0e4, "V", "voltage"],
  [0x14E, 1.0e5, "V", "voltage"],
  [0x14F, 1.0e6, "V", "voltage"],

  /* E101 nnnn   A */
  [0x150, 1.0e-12, "A", "current"],
  [0x151, 1.0e-11, "A", "current"],
  [0x152, 1.0e-10, "A", "current"],
  [0x153, 1.0e-9, "A", "current"],
  [0x154, 1.0e-8, "A", "current"],
  [0x155, 1.0e-7, "A", "current"],
  [0x156, 1.0e-6, "A", "current"],
  [0x157, 1.0e-5, "A", "current"],
  [0x158, 1.0e-4, "A", "current"],
  [0x159, 1.0e-3, "A", "current"],
  [0x15A, 1.0e-2, "A", "current"],
  [0x15B, 1.0e-1, "A", "current"],
  [0x15C, 1.0e0, "A", "current"],
  [0x15D, 1.0e1, "A", "current"],
  [0x15E, 1.0e2, "A", "current"],
  [0x15F, 1.0e3, "A", "current"],

  /* E110 0000 Reset counter */
  [0x160, 1.0e0, "", "reset_counter"],

  /* E110 0001 Cumulation counter */
  [0x161, 1.0e0, "", "cumulation_counter"],

  /* E110 0010 Control signal */
  [0x162, 1.0e0, "", "control_signal"],

  /* E110 0011 Day of week */
  [0x163, 1.0e0, "", "day_of_week"],

  /* E110 0100 Week number */
  [0x164, 1.0e0, "", "week_number"],

  /* E110 0101 Time point of day change */
  [0x165, 1.0e0, "", "time_point_of_day_change"],

  /* E110 0110 State of parameter activation */
  [0x166, 1.0e0, "", "state_of_parameter_activation"],

  /* E110 0111 Special supplier information */
  [0x167, 1.0e0, "", "special_supplier_information"],

  /* E110 10pp duration_since_last_cumulation [hour(s)..years(s)] */
  [0x168, 3600.0, "s", "duration_since_last_cumulation"],     /* hours */
  [0x169, 86400.0, "s", "duration_since_last_cumulation"],    /* days */
  [0x16A, 2629743.83, "s", "duration_since_last_cumulation"], /* month(s) */
  [0x16B, 31556926.0, "s", "duration_since_last_cumulation"], /* year(s)  */

  /* E110 11pp operating_time battery [hour(s)..years(s)] */
  [0x16C, 3600.0, "s", "operating_time battery"],     /* hours    */
  [0x16D, 86400.0, "s", "operating_time battery"],    /* days     */
  [0x16E, 2629743.83, "s", "operating_time battery"], /* month(s) */
  [0x16F, 31556926.0, "s", "operating_time battery"], /* year(s)  */

  /* E111 0000 Date and time of battery change */
  [0x170, 1.0e0, "", "date_and_time_of_battery_change"],

  /* E111 0001-1111 Reserved */
  [0x171, 1.0e0, "Reserved", "reserved"],
  [0x172, 1.0e0, "Reserved", "reserved"],
  [0x173, 1.0e0, "Reserved", "reserved"],
  [0x174, 1.0e0, "Reserved", "reserved"],
  [0x175, 1.0e0, "Reserved", "reserved"],
  [0x176, 1.0e0, "Reserved", "reserved"],
  [0x177, 1.0e0, "Reserved", "reserved"],
  [0x178, 1.0e0, "Reserved", "reserved"],
  [0x179, 1.0e0, "Reserved", "reserved"],
  [0x17A, 1.0e0, "Reserved", "reserved"],
  [0x17B, 1.0e0, "Reserved", "reserved"],
  [0x17C, 1.0e0, "Reserved", "reserved"],
  [0x17D, 1.0e0, "Reserved", "reserved"],
  [0x17E, 1.0e0, "Reserved", "reserved"],
  [0x17F, 1.0e0, "Reserved", "reserved"],
  //VIF = FD END
  //
  //
  //

  //
  //
  //
  //VIF = FB START
  /* Alternate VIFE-Code Extension table (following VIF=0FBh for
     primary VIF)
     See 8.4.4 b, only some of them are here. Using range 0x200 -
     0x2FF */

  /* E000 000n energy 10(n-1) MWh 0.1MWh to 1MWh */
  [0x200, 1.0e5, "Wh", "energy"],
  [0x201, 1.0e6, "Wh", "energy"],

  /* E000 001n Reserved */
  [0x202, 1.0e0, "Reserved", "reserved"],
  [0x203, 1.0e0, "Reserved", "reserved"],

  /* E000 01nn Reserved */
  [0x204, 1.0e0, "Reserved", "reserved"],
  [0x205, 1.0e0, "Reserved", "reserved"],
  [0x206, 1.0e0, "Reserved", "reserved"],
  [0x207, 1.0e0, "Reserved", "reserved"],

  /* E000 100n energy 10(n-1) GJ 0.1GJ to 1GJ */
  [0x208, 1.0e8, "Reserved", "energy"],
  [0x209, 1.0e9, "Reserved", "energy"],

  /* E000 101n Reserved */
  [0x20A, 1.0e0, "Reserved", "reserved"],
  [0x20B, 1.0e0, "Reserved", "reserved"],

  /* E000 11nn Reserved */
  [0x20C, 1.0e0, "Reserved", "reserved"],
  [0x20D, 1.0e0, "Reserved", "reserved"],
  [0x20E, 1.0e0, "Reserved", "reserved"],
  [0x20F, 1.0e0, "Reserved", "reserved"],

  /* E001 000n volume 10(n+2) m3 100m3 to 1000m3 */
  [0x210, 1.0e2, "m^3", "volume"],
  [0x211, 1.0e3, "m^3", "volume"],

  /* E001 001n Reserved */
  [0x212, 1.0e0, "Reserved", "reserved"],
  [0x213, 1.0e0, "Reserved", "reserved"],

  /* E001 01nn Reserved */
  [0x214, 1.0e0, "Reserved", "reserved"],
  [0x215, 1.0e0, "Reserved", "reserved"],
  [0x216, 1.0e0, "Reserved", "reserved"],
  [0x217, 1.0e0, "Reserved", "reserved"],

  /* E001 100n mass 10(n+2) t 100t to 1000t */
  [0x218, 1.0e5, "kg", "mass"],
  [0x219, 1.0e6, "kg", "mass"],

  /* E001 1010 to E010 0000 Reserved */
  [0x21A, 1.0e0, "Reserved", "reserved"],
  [0x21B, 1.0e0, "Reserved", "reserved"],
  [0x21C, 1.0e0, "Reserved", "reserved"],
  [0x21D, 1.0e0, "Reserved", "reserved"],
  [0x21E, 1.0e0, "Reserved", "reserved"],
  [0x21F, 1.0e0, "Reserved", "reserved"],
  [0x220, 1.0e0, "Reserved", "reserved"],

  /* E010 0001 volume 0,1 feet^3 */
  [0x221, 1.0e-1, "feet^3", "volume"],

  /* E010 001n volume 0,1-1 american gallon */
  [0x222, 1.0e-1, "American gallon", "volume"],
  [0x223, 1.0e-0, "American gallon", "volume"],

  /* E010 0100    volume_flow 0,001 american gallon/min */
  [0x224, 1.0e-3, "American gallon/min", "volume_flow"],

  /* E010 0101 volume_flow 1 american gallon/min */
  [0x225, 1.0e0, "American gallon/min", "volume_flow"],

  /* E010 0110 volume_flow 1 american gallon/h */
  [0x226, 1.0e0, "American gallon/h", "volume_flow"],

  /* E010 0111 Reserved */
  [0x227, 1.0e0, "Reserved", "reserved"],

  /* E010 100n power 10(n-1) MW 0.1MW to 1MW */
  [0x228, 1.0e5, "W", "power"],
  [0x229, 1.0e6, "W", "power"],

  /* E010 101n Reserved */
  [0x22A, 1.0e0, "Reserved", "reserved"],
  [0x22B, 1.0e0, "Reserved", "reserved"],

  /* E010 11nn Reserved */
  [0x22C, 1.0e0, "Reserved", "reserved"],
  [0x22D, 1.0e0, "Reserved", "reserved"],
  [0x22E, 1.0e0, "Reserved", "reserved"],
  [0x22F, 1.0e0, "Reserved", "reserved"],

  /* E011 000n power 10(n-1) GJ/h 0.1GJ/h to 1GJ/h */
  [0x230, 1.0e8, "J", "power"],
  [0x231, 1.0e9, "J", "power"],

  /* E011 0010 to E101 0111 Reserved */
  [0x232, 1.0e0, "Reserved", "reserved"],
  [0x233, 1.0e0, "Reserved", "reserved"],
  [0x234, 1.0e0, "Reserved", "reserved"],
  [0x235, 1.0e0, "Reserved", "reserved"],
  [0x236, 1.0e0, "Reserved", "reserved"],
  [0x237, 1.0e0, "Reserved", "reserved"],
  [0x238, 1.0e0, "Reserved", "reserved"],
  [0x239, 1.0e0, "Reserved", "reserved"],
  [0x23A, 1.0e0, "Reserved", "reserved"],
  [0x23B, 1.0e0, "Reserved", "reserved"],
  [0x23C, 1.0e0, "Reserved", "reserved"],
  [0x23D, 1.0e0, "Reserved", "reserved"],
  [0x23E, 1.0e0, "Reserved", "reserved"],
  [0x23F, 1.0e0, "Reserved", "reserved"],
  [0x240, 1.0e0, "Reserved", "reserved"],
  [0x241, 1.0e0, "Reserved", "reserved"],
  [0x242, 1.0e0, "Reserved", "reserved"],
  [0x243, 1.0e0, "Reserved", "reserved"],
  [0x244, 1.0e0, "Reserved", "reserved"],
  [0x245, 1.0e0, "Reserved", "reserved"],
  [0x246, 1.0e0, "Reserved", "reserved"],
  [0x247, 1.0e0, "Reserved", "reserved"],
  [0x248, 1.0e0, "Reserved", "reserved"],
  [0x249, 1.0e0, "Reserved", "reserved"],
  [0x24A, 1.0e0, "Reserved", "reserved"],
  [0x24B, 1.0e0, "Reserved", "reserved"],
  [0x24C, 1.0e0, "Reserved", "reserved"],
  [0x24D, 1.0e0, "Reserved", "reserved"],
  [0x24E, 1.0e0, "Reserved", "reserved"],
  [0x24F, 1.0e0, "Reserved", "reserved"],
  [0x250, 1.0e0, "Reserved", "reserved"],
  [0x251, 1.0e0, "Reserved", "reserved"],
  [0x252, 1.0e0, "Reserved", "reserved"],
  [0x253, 1.0e0, "Reserved", "reserved"],
  [0x254, 1.0e0, "Reserved", "reserved"],
  [0x255, 1.0e0, "Reserved", "reserved"],
  [0x256, 1.0e0, "Reserved", "reserved"],
  [0x257, 1.0e0, "Reserved", "reserved"],

  /* E101 10nn flow_temperature 10(nn-3) В°F 0.001В°F to 1В°F */
  [0x258, 1.0e-3, "В°F", "flow_temperature"],
  [0x259, 1.0e-2, "В°F", "flow_temperature"],
  [0x25A, 1.0e-1, "В°F", "flow_temperature"],
  [0x25B, 1.0e0, "В°F", "flow_temperature"],

  /* E101 11nn return_temperature 10(nn-3) В°F 0.001В°F to 1В°F */
  [0x25C, 1.0e-3, "В°F", "return_temperature"],
  [0x25D, 1.0e-2, "В°F", "return_temperature"],
  [0x25E, 1.0e-1, "В°F", "return_temperature"],
  [0x25F, 1.0e0, "В°F", "return_temperature"],

  /* E110 00nn temperature Difference 10(nn-3) В°F 0.001В°F to 1В°F */
  [0x260, 1.0e-3, "В°F", "temperature_difference"],
  [0x261, 1.0e-2, "В°F", "temperature_difference"],
  [0x262, 1.0e-1, "В°F", "temperature_difference"],
  [0x263, 1.0e0, "В°F", "temperature_difference"],

  /* E110 01nn External temperature 10(nn-3) В°F 0.001В°F to 1В°F */
  [0x264, 1.0e-3, "В°F", "external_temperature"],
  [0x265, 1.0e-2, "В°F", "external_temperature"],
  [0x266, 1.0e-1, "В°F", "external_temperature"],
  [0x267, 1.0e0, "В°F", "external_temperature"],

  /* E110 1nnn Reserved */
  [0x268, 1.0e0, "Reserved", "reserved"],
  [0x269, 1.0e0, "Reserved", "reserved"],
  [0x26A, 1.0e0, "Reserved", "reserved"],
  [0x26B, 1.0e0, "Reserved", "reserved"],
  [0x26C, 1.0e0, "Reserved", "reserved"],
  [0x26D, 1.0e0, "Reserved", "reserved"],
  [0x26E, 1.0e0, "Reserved", "reserved"],
  [0x26F, 1.0e0, "Reserved", "reserved"],

  /* E111 00nn cold_or_warm_temperature_limit 10(nn-3) В°F 0.001В°F to
     1В°F */
  [0x270, 1.0e-3, "В°F", "cold_or_warm_temperature_limit"],
  [0x271, 1.0e-2, "В°F", "cold_or_warm_temperature_limit"],
  [0x272, 1.0e-1, "В°F", "cold_or_warm_temperature_limit"],
  [0x273, 1.0e0, "В°F", "cold_or_warm_temperature_limit"],

  /* E111 01nn cold_or_warm_temperature_limit 10(nn-3) В°C 0.001В°C to
     1В°C */
  [0x274, 1.0e-3, "°C", "cold_or_warm_temperature_limit"],
  [0x275, 1.0e-2, "°C", "cold_or_warm_temperature_limit"],
  [0x276, 1.0e-1, "°C", "cold_or_warm_temperature_limit"],
  [0x277, 1.0e0, "°C", "cold_or_warm_temperature_limit"],

  /* E111 1nnn cumul. count max power В§ 10(nnn-3) W 0.001W to 10000W
     */
  [0x278, 1.0e-3, "W", "cumul_count_max_power"],
  [0x279, 1.0e-3, "W", "cumul_count_max_power"],
  [0x27A, 1.0e-1, "W", "cumul_count_max_power"],
  [0x27B, 1.0e0, "W", "cumul_count_max_power"],
  [0x27C, 1.0e1, "W", "cumul_count_max_power"],
  [0x27D, 1.0e2, "W", "cumul_count_max_power"],
  [0x27E, 1.0e3, "W", "cumul_count_max_power"],
  [0x27F, 1.0e4, "W", "cumul_count_max_power"],
  //VIF = FB END

  /* End of array */
  [0xFFFF, 0.0, "", ""]
];

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
}