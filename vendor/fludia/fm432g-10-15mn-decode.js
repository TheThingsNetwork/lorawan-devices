const PAYLOAD_TYPE = {
  T1_10MN  :             {header: 0x1d, size: 20/*in bytes*/, name: "T1_10MN"},
  T1_15MN  :             {header: 0x1e, size: 20/*in bytes*/, name: "T1_15MN"},
  T1_1H    :             {header: 0x1f, size: 20/*in bytes*/, name: "T1_1H"},
  T1_ADJUSTABLE_STEP  :  {header: 0x6d, size_min: 8/*in bytes*/, size_max: 46/*in bytes*/, name: "T1_ADJUSTABLE_STEP"},
  TT1      :             {header: 0x2e, size: 22/*in bytes*/, name: "TT1"},
  T2       :             {header: 0x10, size: 12/*in bytes*/, name: "T2"},
  T2_ADJUSTABLE_STEP  :  {header: 0x6e, size: 15/*in bytes*/, name: "T2_ADJUSTABLE_STEP"},
  START    :             {header: 0x01, size: 3/*in bytes*/,  name: "START"}
}

//Main function Decoder
function decodeUplink(input){
  var decoded = {
    data: {
      index : null,
      message_type : null,
      increments : [],
      time_step: null,
      meter_type : "Gas",
      firmware_version: null,
      number_of_starts : null,
      param_id: null,
      values: null,
      step: null,
      redundancy: null,
      nb_values: null
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
  if(decoded.data.message_type == PAYLOAD_TYPE.T1_10MN.name) decoded.data.time_step = 10;
  if(decoded.data.message_type == PAYLOAD_TYPE.T1_15MN.name) decoded.data.time_step = 15;
  if(decoded.data.message_type == PAYLOAD_TYPE.T1_1H.name) decoded.data.time_step = 60;
  //Decode message
  if(decoded.data.message_type == PAYLOAD_TYPE.T1_10MN.name || decoded.data.message_type == PAYLOAD_TYPE.T1_15MN.name
    || decoded.data.message_type == PAYLOAD_TYPE.T1_1H.name){
    var data = decode_T1(input.bytes, decoded.data.time_step);
    decoded.data.index = data.index;
    decoded.data.increments = data.increments;
  }else if(decoded.data.message_type == PAYLOAD_TYPE.T1_ADJUSTABLE_STEP.name){
    var data = decode_T1_adjustable_step(input.bytes);
    decoded.data.time_step = data.time_step;
    decoded.data.index = data.index;
    decoded.data.increments = data.increments;
  }else if(decoded.data.message_type == PAYLOAD_TYPE.T2.name){
    var data = decode_T2(input.bytes);
    decoded.data.index = data.index;
    decoded.data.firmware_version = data.firmware_version;
    decoded.data.number_of_starts = data.number_of_starts;
    decoded.data.param_id = data.param_id;
    decoded.data.time_step = data.time_step;
  }else if(decoded.data.message_type == PAYLOAD_TYPE.T2_ADJUSTABLE_STEP.name){
    var data = decode_T2_adjustable_step(input.bytes);
    decoded.data.index = data.index;
    decoded.data.firmware_version = data.firmware_version;
    decoded.data.number_of_starts = data.number_of_starts;
    decoded.data.param_id = data.param_id;
    decoded.data.time_step = data.time_step;
    decoded.data.redundancy = data.redundancy;
    decoded.data.nb_values = data.nb_values;
  }
  //Retrocompatibility
  decoded.data.step = decoded.data.time_step;
  decoded.data.values = decoded.data.increments;
  return decoded
}

//Find message type - return null if nothing found
function find_message_type(payload){
  switch(payload[0]){
    case PAYLOAD_TYPE.T1_10MN.header:
      if(payload.length == PAYLOAD_TYPE.T1_10MN.size) return PAYLOAD_TYPE.T1_10MN.name
      break;
    case PAYLOAD_TYPE.T1_15MN.header:
      if(payload.length == PAYLOAD_TYPE.T1_15MN.size) return PAYLOAD_TYPE.T1_15MN.name
      break;
    case PAYLOAD_TYPE.T1_1H.header:
      if(payload.length == PAYLOAD_TYPE.T1_1H.size) return PAYLOAD_TYPE.T1_1H.name
      break;
    case PAYLOAD_TYPE.T1_ADJUSTABLE_STEP.header:
      if(payload.length >= PAYLOAD_TYPE.T1_ADJUSTABLE_STEP.size_min && payload.length <= PAYLOAD_TYPE.T1_ADJUSTABLE_STEP.size_max) return PAYLOAD_TYPE.T1_ADJUSTABLE_STEP.name
      break;
    case PAYLOAD_TYPE.TT1.header:
      if(payload.length == PAYLOAD_TYPE.TT1.size) return PAYLOAD_TYPE.TT1.name
      break;
    case PAYLOAD_TYPE.T2.header:
      if(payload.length == PAYLOAD_TYPE.T2.size) return PAYLOAD_TYPE.T2.name
      break;
    case PAYLOAD_TYPE.T2_ADJUSTABLE_STEP.header:
      if(payload.length == PAYLOAD_TYPE.T2_ADJUSTABLE_STEP.size) return PAYLOAD_TYPE.T2_ADJUSTABLE_STEP.name
      break;
    case PAYLOAD_TYPE.START.header:
      if(payload.length == PAYLOAD_TYPE.START.size) return PAYLOAD_TYPE.START.name
      break;
  }
  return null
}

function decode_T1(payload,time_step){
  var data = {};
  data.index  = ((payload[1] & 0xFF) << 16 | (payload[2] & 0xFF) << 8 | (payload[3] & 0xFF))/10;
  data.increments = []
  for(i=0;i<8;i++){
    data.increments.push(((payload[4+2*i] & 0xFF) << 8 | (payload[5+2*i] & 0xFF))/10)
  }
  return data
}
function decode_T1_adjustable_step(payload){
  var data = {};
  data.time_step = payload[1];
  data.index  = ((payload[2] & 0xFF) << 24 | (payload[3] & 0xFF) << 16 | (payload[4] & 0xFF) << 8 | (payload[5] & 0xFF))/10;
  data.increments = []
  var nb_values_in_payload = (payload.length-6)/2
  for(i=0;i<nb_values_in_payload;i++){
    data.increments.push(((payload[6+2*i] & 0xFF) << 8 | (payload[7+2*i] & 0xFF))/10)
  }
  return data
}

function decode_T2(payload){
  var data = {};
  data.number_of_starts = payload[1];
  data.index = ((payload[5] & 0xFF) << 24 | (payload[6] & 0xFF) << 16 | (payload[7] & 0xFF) << 8 | (payload[8] & 0xFF))/10;
  data.firmware_version = payload[4] >> 2;
  data.param_id = payload[3];
  data.time_step = payload[11];
  if(data.time_step == 0) data.time_step = 10;
  if(data.time_step == 3) data.time_step = 15;
  if(data.time_step == 1) data.time_step = 60;
  return data;
}

function decode_T2_adjustable_step(payload){
  var data = {};
  data.number_of_starts = payload[1];
  data.param_id = payload[4];
  data.firmware_version = payload[5];
  data.index = ((payload[8] & 0xFF) << 24 | (payload[9] & 0xFF) << 16 | (payload[10] & 0xFF) << 8 | (payload[11] & 0xFF))/10;
  data.time_step = payload[12];
  data.nb_values = payload[13];
  data.redundancy = payload[14];
  return data;
}
