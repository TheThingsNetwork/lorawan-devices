const PAYLOAD_TYPE = {
  T1       :  {header: 0x5b, size: 45/*in bytes*/, name: "T1"},
  TT1_MECA :  {header: 0x12, size: 37/*in bytes*/, name: "TT1_MECA"},
  TT2_MECA :  {header: 0x13, size: 30/*in bytes*/, name: "TT2_MECA"},
  T2       :  {header: 0x51, size: 12/*in bytes*/, name: "T2"},
  START    :  {header: 0x5f, size: 9/*in bytes*/,  name: "START"}
}

//Main function Decoder
function decodeUplink(input){
  var decoded = {
    data: {
      index : null,
      message_type : null,
      powers : [],
      meter_type : null,
      low_battery : null,
      firmware_version: null,
      number_of_starts : null
    },
    warnings: [],
    errors: []
  }
  //Find message type
  decoded.data.message_type = find_message_type(input.bytes);
  if(decoded.data.message_type == null){
    decoded.errors.push("Invalid payload")
    return decoded
  }
  //Decode message
  if(decoded.data.message_type == PAYLOAD_TYPE.T1.name){
    var data = decode_T1(input.bytes);
    decoded.data.index = data.index;
    decoded.data.powers = data.power_list;
  }else if(decoded.data.message_type == PAYLOAD_TYPE.TT1_MECA.name || decoded.data.message_type == PAYLOAD_TYPE.TT2_MECA.name){
    decoded.data.meter_type = "Electromechanical (Position A)"
  }else if(decoded.data.message_type == PAYLOAD_TYPE.T2.name){
    var data = decode_T2(input.bytes);
    decoded.data.index = data.index;
    decoded.data.meter_type = data.meter_type;
    decoded.data.low_battery = data.low_battery;
    decoded.data.firmware_version = data.firmware_version;
    decoded.data.number_of_starts = data.number_of_starts;
  }

  return decoded
}

//Find message type - return null if nothing found
function find_message_type(payload){
  switch(payload[0]){
    case PAYLOAD_TYPE.T1.header:
      if(payload.length == PAYLOAD_TYPE.T1.size) return PAYLOAD_TYPE.T1.name
      break;
    case PAYLOAD_TYPE.TT1_MECA.header:
      if(payload.length == PAYLOAD_TYPE.TT1_MECA.size) return PAYLOAD_TYPE.TT1_MECA.name
      break;
    case PAYLOAD_TYPE.TT2_MECA.header:
      if(payload.length == PAYLOAD_TYPE.TT2_MECA.size) return PAYLOAD_TYPE.TT2_MECA.name
      break;
    case PAYLOAD_TYPE.T2.header:
      if(payload.length == PAYLOAD_TYPE.T2.size) return PAYLOAD_TYPE.T2.name
      break;
    case PAYLOAD_TYPE.START.header:
      if(payload.length == PAYLOAD_TYPE.START.size) return PAYLOAD_TYPE.START.name
      break;
  }
  return null
}

function decode_T1(payload){
  var data = {};
  data.index  = (payload[1] & 0xFF) << 24 | (payload[2] & 0xFF) << 16 | (payload[3] & 0xFF) << 8 | (payload[4] & 0xFF);
  data.power_list = []
  for(i=0;i<20;i++){
    data.power_list.push((payload[5+2*i] & 0xFF) << 8 | (payload[6+2*i] & 0xFF))
  }
  return data
}

function decode_T2(payload){
  var data = {};
  data.number_of_starts = payload[1];
  data.index = (payload[5] & 0xFF) << 24 | (payload[6] & 0xFF) << 16 | (payload[7] & 0xFF) << 8 | (payload[8] & 0xFF);
  data.firmware_version = payload[4] >> 2;
  data.low_battery = payload[4] & 0x1;
  data.meter_type = payload[4] >> 1 & 0x1;
  if(data.meter_type == 0) data.meter_type = "Electromechanical (Position A)"
  if(data.meter_type == 1) data.meter_type = "Electronic (Position B)"
  return data;
}
