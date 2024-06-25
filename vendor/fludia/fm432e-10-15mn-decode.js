const PAYLOAD_TYPE = {
  T1_10MN            :  {header: 0x20, size: 20/*in bytes*/, name: "T1_10MN"},
  T1_15MN            :  {header: 0x21, size: 20/*in bytes*/, name: "T1_15MN"},
  T1_1H              :  {header: 0x22, size: 20/*in bytes*/, name: "T1_1H"},
  T1_ADJUSTABLE_STEP :  {header: 0x69, size_min: 8/*in bytes*/, size_max: 46/*in bytes*/, name: "T1_ADJUSTABLE_STEP"},
  TT1_MECA           :  {header: 0x12, size: 37/*in bytes*/, name: "TT1_MECA"},
  TT2_MECA           :  {header: 0x13, size: 30/*in bytes*/, name: "TT2_MECA"},
  TT1_ELEC           :  {header: 0x12, size: 19/*in bytes*/, name: "TT1_ELEC"},
  TT2_ELEC           :  {header: 0x13, size: 11/*in bytes*/, name: "TT2_ELEC"},
  T2                 :  {header: 0x0e, size: 12/*in bytes*/, name: "T2"},
  T2_ADJUSTABLE_STEP :  {header: 0x6a, size: 16/*in bytes*/, name: "T2_ADJUSTABLE_STEP"},
  START              :  {header: 0x01, size: 3/*in bytes*/,  name: "START"}
}

//Main function Decoder
function decodeUplink(input){
  var decoded = {
    data: {
      index : null,
      message_type : null,
      increments : [],
      powers: [],
      time_step: null,
      meter_type : null,
      low_battery : null,
      firmware_version: null,
      number_of_starts : null,
      param_id: null,
      redundancy: null,
      nb_values: null,
      sensibility: null
    },
    index: null,
    step: null,
    list_increment: null,
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
    decoded.data.powers = data.powers;
  }else if(decoded.data.message_type == PAYLOAD_TYPE.T1_ADJUSTABLE_STEP.name){
    var data = decode_T1_adjustable_step(input.bytes);
    decoded.data.time_step = data.time_step;
    decoded.data.index = data.index;
    decoded.data.increments = data.increments;
    decoded.data.powers = data.powers;
  }else if(decoded.data.message_type == PAYLOAD_TYPE.TT1_MECA.name || decoded.data.message_type == PAYLOAD_TYPE.TT2_MECA.name){
    decoded.data.meter_type = "Electromechanical (Position A)"
  }else if(decoded.data.message_type == PAYLOAD_TYPE.TT1_ELEC.name || decoded.data.message_type == PAYLOAD_TYPE.TT2_ELEC.name){
    decoded.data.meter_type = "Electronic (Position B)"
  }else if(decoded.data.message_type == PAYLOAD_TYPE.T2.name){
    var data = decode_T2(input.bytes);
    decoded.data.index = data.index;
    decoded.data.meter_type = data.meter_type;
    decoded.data.low_battery = data.low_battery;
    decoded.data.firmware_version = data.firmware_version;
    decoded.data.number_of_starts = data.number_of_starts;
    decoded.data.param_id = data.param_id;
    decoded.data.time_step = data.time_step;
  }else if(decoded.data.message_type == PAYLOAD_TYPE.T2_ADJUSTABLE_STEP.name){
    var data = decode_T2_adjustable_step(input.bytes);
    decoded.data.index = data.index;
    decoded.data.meter_type = data.meter_type;
    decoded.data.low_battery = data.low_battery;
    decoded.data.firmware_version = data.firmware_version;
    decoded.data.number_of_starts = data.number_of_starts;
    decoded.data.param_id = data.param_id;
    decoded.data.time_step = data.time_step;
    decoded.data.redundancy = data.redundancy;
    decoded.data.nb_values = data.nb_values;
    decoded.data.sensibility = data.sensibility;
  }
  //Retrocompatibility
  decoded.step = decoded.data.time_step;
  decoded.list_increment = decoded.data.increments;
  decoded.index = decoded.data.index;
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
    case PAYLOAD_TYPE.TT1_MECA.header:
      if(payload.length == PAYLOAD_TYPE.TT1_MECA.size) return PAYLOAD_TYPE.TT1_MECA.name
      if(payload.length == PAYLOAD_TYPE.TT1_ELEC.size) return PAYLOAD_TYPE.TT1_ELEC.name
      break;
    case PAYLOAD_TYPE.TT2_MECA.header:
      if(payload.length == PAYLOAD_TYPE.TT2_MECA.size) return PAYLOAD_TYPE.TT2_MECA.name
      if(payload.length == PAYLOAD_TYPE.TT2_ELEC.size) return PAYLOAD_TYPE.TT2_ELEC.name
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
  data.index  = (payload[1] & 0xFF) << 16 | (payload[2] & 0xFF) << 8 | (payload[3] & 0xFF);
  data.increments = []
  data.powers = []
  for(i=0;i<8;i++){
    data.increments.push((payload[4+2*i] & 0xFF) << 8 | (payload[5+2*i] & 0xFF))
  }
  for(i=0;i<8;i++){
    data.powers.push(data.increments[i] * 60 / time_step)
  }
  return data
}

function decode_T1_adjustable_step(payload){
  var data = {};
  data.time_step = payload[1];
  data.index  = (payload[2] & 0xFF) << 24 | (payload[3] & 0xFF) << 16 | (payload[4] & 0xFF) << 8 | (payload[5] & 0xFF);
  data.increments = []
  data.powers = []
  var nb_values_in_payload = (payload.length-6)/2
  for(i=0;i<nb_values_in_payload;i++){
    data.increments.push((payload[6+2*i] & 0xFF) << 8 | (payload[7+2*i] & 0xFF))
  }
  for(i=0;i<nb_values_in_payload;i++){
    data.powers.push(data.increments[i] * 60 / data.time_step)
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
  data.meter_type = payload[6];
  if(data.meter_type == 0) data.meter_type = "Electromechanical (Position A)"
  if(data.meter_type == 1) data.meter_type = "Electronic (Position B)"
  data.low_battery = payload[7];
  data.index = (payload[8] & 0xFF) << 24 | (payload[9] & 0xFF) << 16 | (payload[10] & 0xFF) << 8 | (payload[11] & 0xFF);
  data.time_step = payload[12];
  data.nb_values = payload[13];
  data.redundancy = payload[14];
  data.sensibility = payload[15];
  return data;
}
