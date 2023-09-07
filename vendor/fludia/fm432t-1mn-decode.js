const PAYLOAD_TYPE = {
  T1       :  {header: 0x57, size: 42/*in bytes*/, name: "T1"},
  T2       :  {header: 0x58, size: 12/*in bytes*/, name: "T2"},
  START    :  {header: 0x01, size: 3/*in bytes*/,  name: "START"}
}

//Main function Decoder
function decodeUplink(input){
  var decoded = {
    data: {
      index : null,
      message_type : null,
      temperatures : [],
      time_step: null,
      meter_type : "Temperature",
      firmware_version: null,
      max_temp: null,
      min_temp: null,
      max_temp_variation: null,
      sampling : null,
      temperature: null
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
    decoded.data.temperatures = data.temperatures;
    decoded.data.time_step = data.time_step;
  }else if(decoded.data.message_type == PAYLOAD_TYPE.T2.name){
    var data = decode_T2(input.bytes);
    decoded.data.firmware_version = data.firmware_version;
    decoded.data.time_step = data.time_step;
    decoded.data.max_temp = data.max_temp;
    decoded.data.max_temp_variation = data.max_temp_variation;
    decoded.data.min_temp = data.min_temp;
    decoded.data.sampling = data.sampling;
  }
  //Retrocompatibility
  decoded.data.temperature = decoded.data.temperatures;
  return decoded
}

//Find message type - return null if nothing found
function find_message_type(payload){
  switch(payload[0]){
    case PAYLOAD_TYPE.T1.header:
      if(payload.length == PAYLOAD_TYPE.T1.size) return PAYLOAD_TYPE.T1.name
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
  data.time_step = payload[1];
  data.temperatures = []
  for(i=0;i<20;i++){
    data.temperatures.push(toSignedInt16(payload[2+2*i], payload[3+2*i])/100)
  }
  return data
}

function decode_T2(payload){
  var data = {};
  data.firmware_version = String.fromCharCode(payload[1])+"."+String.fromCharCode(payload[2])+"."+String.fromCharCode(payload[3]);
  data.time_step = payload[4];
  data.max_temp = toSignedInt16(payload[5], payload[6])/100;
  data.min_temp = toSignedInt16(payload[7], payload[8])/100;
  data.max_temp_variation = toSignedInt16(payload[9], payload[10])/100;
  data.sampling = payload[11];
  if(data.sampling == 0) data.sampling = "average";
  if(data.sampling == 1) data.sampling = "instantaneous"
  return data;
}

function toSignedInt16(byte1, byte2){
  if(byte1 & 0x80) return ((byte1 & 0x7F) - 0x80) << 8 | byte2;
  else return (byte1 & 0x7F) << 8 | byte2;
}
