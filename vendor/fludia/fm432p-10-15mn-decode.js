const PAYLOAD_TYPE = {
  T1_10MN  :  {header: 0x2b, size: 20/*in bytes*/, name: "T1_10MN"},
  T1_15MN  :  {header: 0x2c, size: 20/*in bytes*/, name: "T1_15MN"},
  T1_1H    :  {header: 0x2d, size: 20/*in bytes*/, name: "T1_1H"},
  T2       :  {header: 0x29, size: 10/*in bytes*/, name: "T2"},
  START    :  {header: 0x01, size: 3/*in bytes*/,  name: "START"}
}

//Main function Decoder
function decodeUplink(input){
  var decoded = {
    data: {
      index : null,
      message_type : null,
      increments : [],
      time_step: null,
      meter_type : "Pulse",
      firmware_version: null,
      values: null,
      step: null
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
  }else if(decoded.data.message_type == PAYLOAD_TYPE.T2.name){
    var data = decode_T2(input.bytes);
    decoded.data.index = data.index;
    decoded.data.firmware_version = data.firmware_version;
    decoded.data.time_step = data.time_step;
  }
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
    case PAYLOAD_TYPE.T2.header:
      if(payload.length == PAYLOAD_TYPE.T2.size) return PAYLOAD_TYPE.T2.name
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
  for(i=0;i<8;i++){
    data.increments.push((payload[4+2*i] & 0xFF) << 8 | (payload[5+2*i] & 0xFF))
  }
  return data
}

function decode_T2(payload){
  var data = {};
  data.index = (payload[4] & 0xFF) << 24 | (payload[5] & 0xFF) << 16 | (payload[6] & 0xFF) << 8 | (payload[7] & 0xFF);
  data.firmware_version = String.fromCharCode(payload[1])+"."+String.fromCharCode(payload[2])+"."+String.fromCharCode(payload[3]);
  data.time_step = payload[9];
  return data;
}
