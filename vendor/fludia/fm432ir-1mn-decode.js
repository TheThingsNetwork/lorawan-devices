const PAYLOAD_TYPE = {
  T1_E_SUM     :  {header: 0x2e, size: 42/*in bytes*/, name: "T1_E_SUM"},
  T1_E_POS     :  {header: 0x2f, size: 42/*in bytes*/, name: "T1_E_POS"},
  T1_E_NEG     :  {header: 0x30, size: 42/*in bytes*/, name: "T1_E_NEG"},
  T2_MME       :  {header: 0x2a, size: 18/*in bytes*/, name: "T2_MME"},
  T1_MECA_1MN  :  {header: 0x5b, size: 45/*in bytes*/, name: "T1_MECA_1MN"},
  T2_MECA      :  {header: 0x4b, size: 12/*in bytes*/, name: "T2_MECA"},
  TT1_MECA     :  {header: 0x12, size: 37/*in bytes*/, name: "TT1_MECA"},
  TT2_MECA     :  {header: 0x13, size: 30/*in bytes*/, name: "TT2_MECA"},
  START        :  {header: 0x5f, size: 9/*in bytes*/,  name: "START"}
}

//Main function Decoder
function decodeUplink(input){
  var decoded = {
    data: {
      index : null,
      message_type : null,
      powers : [],
      time_step: 1,
      meter_type : null,
      firmware_version: null,
      type_of_measure: null,
      sensor_sensitivity: null,
      scaler_e_pos: null,
      scaler_e_sum: null,
      scaler_e_neg: null,
      low_battery : null,
      number_of_starts : null,
      obis: null,
      step : null,
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
  if(decoded.data.message_type == PAYLOAD_TYPE.T1_E_SUM.name || decoded.data.message_type == PAYLOAD_TYPE.T1_E_POS.name
    || decoded.data.message_type == PAYLOAD_TYPE.T1_E_NEG.name){
    var data = decode_T1_mme(input.bytes,decoded.data.message_type);
    decoded.data.meter_type = "mME (Position B)";
    decoded.data.index = data.index;
    decoded.data.powers = data.powers;
    decoded.data.time_step = data.time_step;
    decoded.data.type_of_measure = data.type_of_measure;
  }else if(decoded.data.message_type == PAYLOAD_TYPE.T2_MME.name){
    var data = decode_T2_mme(input.bytes);
    for(var i = 0;i<data.warnings.length;i++){
      decoded.warnings.push(data.warnings[i]);
    }
    decoded.data.index = data.index;
    decoded.data.meter_type = "mME (Position B)";
    decoded.data.firmware_version = data.firmware_version;
    decoded.data.time_step = data.time_step;
    decoded.data.type_of_measure = data.type_of_measure;
    decoded.data.scaler_e_pos = data.scaler_e_pos;
    decoded.data.scaler_e_sum = data.scaler_e_sum;
    decoded.data.scaler_e_neg = data.scaler_e_neg;
    decoded.data.sensor_sensitivity = data.sensor_sensitivity;
  }if(decoded.data.message_type == PAYLOAD_TYPE.T1_MECA_1MN.name){
    var data = decode_T1_meca(input.bytes);
    decoded.data.index = data.index;
    decoded.data.powers = data.powers;
  }else if(decoded.data.message_type == PAYLOAD_TYPE.T2_MECA.name){
    var data = decode_T2_meca(input.bytes);
    decoded.data.index = data.index;
    decoded.data.meter_type = "Electromechanical (Position A)";
    decoded.data.low_battery = data.low_battery;
    decoded.data.firmware_version = data.firmware_version;
    decoded.data.number_of_starts = data.number_of_starts;
    decoded.data.time_step = data.time_step;
  }else if(decoded.data.message_type == PAYLOAD_TYPE.TT1_MECA.name || decoded.data.message_type == PAYLOAD_TYPE.TT2_MECA.name){
    decoded.data.meter_type = "Electromechanical (Position A)"
  }
  //Retrocompatibility
  decoded.data.step = decoded.data.time_step;
  decoded.data.obis = decoded.data.type_of_measure;
  return decoded
}

//Find message type - return null if nothing found
function find_message_type(payload){
  if(payload[0] == 0xf0){
    switch(payload[1]){
      case PAYLOAD_TYPE.T1_E_SUM.header:
        if(payload.length == PAYLOAD_TYPE.T1_E_SUM.size) return PAYLOAD_TYPE.T1_E_SUM.name
        break;
      case PAYLOAD_TYPE.T1_E_POS.header:
        if(payload.length == PAYLOAD_TYPE.T1_E_POS.size) return PAYLOAD_TYPE.T1_E_POS.name
        break;
      case PAYLOAD_TYPE.T1_E_NEG.header:
        if(payload.length == PAYLOAD_TYPE.T1_E_NEG.size) return PAYLOAD_TYPE.T1_E_NEG.name
        break;
      case PAYLOAD_TYPE.T2_MME.header:
        if(payload.length == PAYLOAD_TYPE.T2_MME.size) return PAYLOAD_TYPE.T2_MME.name
        break;
    }
  }else{
    switch(payload[0]){
      case PAYLOAD_TYPE.T1_MECA_1MN.header:
        if(payload.length == PAYLOAD_TYPE.T1_MECA_1MN.size) return PAYLOAD_TYPE.T1_MECA_1MN.name
        break;
      case PAYLOAD_TYPE.T2_MECA.header:
        if(payload.length == PAYLOAD_TYPE.T2_MECA.size) return PAYLOAD_TYPE.T2_MECA.name
        break;
      case PAYLOAD_TYPE.TT1_MECA.header:
        if(payload.length == PAYLOAD_TYPE.TT1_MECA.size) return PAYLOAD_TYPE.TT1_MECA.name
        break;
      case PAYLOAD_TYPE.TT2_MECA.header:
        if(payload.length == PAYLOAD_TYPE.TT2_MECA.size) return PAYLOAD_TYPE.TT2_MECA.name
        break;
      case PAYLOAD_TYPE.START.header:
        if(payload.length == PAYLOAD_TYPE.START.size) return PAYLOAD_TYPE.START.name
        break;
    }
  }
  return null
}

function decode_T1_mme(payload,type){
  var data = {};
  data.time_step = payload[2];
  data.powers = [];
  data.warnings = [];
  var signed = payload[3];
  if(!signed){
    data.index = parseInt(toHexString(payload).substring(8, 24),16)/10
  }else{
    if(payload[4] & 0x80){
      //We have a negative number
      //For signed values we will have an issue with javascript handling only 52 bits and not 64
      if(payload[4] == 0xFF && (payload[5] >> 4) == 0xFF && (payload[6] >> 4) == 0xFF && (payload[7] >> 4) == 0xFF){
        data.index = (parseInt(toHexString(payload).substring(16, 24),16) >> 0)/10
      }else{
        //Overflow in data
        data.warnings.push("Overflow with index value");
        data.index = (parseInt(toHexString(payload).substring(16, 24),16) >> 0)/10
      }
    }else{//Positive no issue
        data.index = parseInt(toHexString(payload).substring(8, 24),16)/10
    }
  }
  if(type == PAYLOAD_TYPE.T1_E_NEG.name && data.index > 0){
    data.index = -data.index;
  }
  for(var i = 0;i<15;i++){
    if(payload[12+i*2] == 0xFF
      && (payload[13+i*2] == 0xFF || payload[13+i*2] == 0xFE || payload[13+i*2] == 0xFD || payload[13+i*2] == 0xFC || payload[13+i*2] == 0xFB)){
        data.powers.push(null);
    }else{
      var value = 0;
      if(!signed) value = toUnsignedInt16(payload[12+i*2],payload[13+i*2])/10;
      else value = toSignedInt16(payload[12+i*2],payload[13+i*2])/10;
      if(type == PAYLOAD_TYPE.T1_E_NEG.name && value > 0){
        value = -value;
      }
      data.powers.push(value)
    }
  }
  return data
}

function decode_T1_meca(payload){
  var data = {};
  data.index  = (payload[1] & 0xFF) << 24 | (payload[2] & 0xFF) << 16 | (payload[3] & 0xFF) << 8 | (payload[4] & 0xFF);
  data.powers = []
  for(i=0;i<20;i++){
    data.powers.push((payload[5+2*i] & 0xFF) << 8 | (payload[6+2*i] & 0xFF))
  }
  return data
}

function decode_T2_meca(payload){
  var data = {};
  data.number_of_starts = payload[1];
  data.index = (payload[5] & 0xFF) << 24 | (payload[6] & 0xFF) << 16 | (payload[7] & 0xFF) << 8 | (payload[8] & 0xFF);
  data.firmware_version = payload[4] >> 2;
  data.low_battery = payload[4] & 0x1;
  data.meter_type = payload[4] >> 1 & 0x1;
  if(data.meter_type == 0) data.meter_type = "Electromechanical (Position A)"
  data.time_step = payload[11];
  if(data.time_step == 0) data.time_step = 10;
  if(data.time_step == 3) data.time_step = 15;
  if(data.time_step == 1) data.time_step = 60;
  return data;
}

function decode_T2_mme(payload){
  var data = {};
  data.time_step = payload[2];
  data.measure = payload[3];
  data.warnings = [];
  if(data.measure == 0) data.type_of_measure = "E-POS values (OBIS code 1.8.0)";
  if(data.measure == 1) data.type_of_measure = "E-SUM values (OBIS code 16.8.0)";
  if(data.measure == 2) data.type_of_measure = "E-NEG values (OBIS code 2.8.0)";
  data.firmware_version = payload[5];
  data.sensor_sensitivity = payload[6];
  data.scaler_e_pos = toSignedInt8(payload[7]);
  if(payload[7] == 0x7F) data.scaler_e_pos = null;
  else data.scaler_e_pos = Math.pow(10, data.scaler_e_pos)
  data.scaler_e_sum = toSignedInt8(payload[8]);
  if(payload[8] == 0x7F) data.scaler_e_sum = null;
  else data.scaler_e_sum = Math.pow(10, data.scaler_e_sum)
  data.scaler_e_neg = toSignedInt8(payload[9]);
  if(payload[9] == 0x7F) data.scaler_e_neg = null;
  else data.scaler_e_neg = Math.pow(10, data.scaler_e_neg)
  if(data.measure == 0) data.index = parseInt(toHexString(payload).substring(20, 36),16)/10;
  if(data.measure == 1){
    if(payload[10] & 0x80){
      //We have a negative number
      //For signed values we will have an issue with javascript handling only 32 bits
      if(payload[10] == 0xFF && (payload[11]) == 0xFF && (payload[12]) == 0xFF && (payload[13]) == 0xFF){
        data.index = (parseInt(toHexString(payload).substring(28, 36),16) >> 0)/10
      }else{
        //Overflow in data
        data.warnings.push("Overflow with index value");
        data.index = (Number("0x"+toHexString(payload).substring(28, 36)) >> 0)/10
      }
    }else{//Positive no issue
        data.index = parseInt(toHexString(payload).substring(20, 36),16)/10
    }
  }
  if(data.measure == 2) data.index = -parseInt(toHexString(payload).substring(20, 36),16)/10;
  return data;
}

function toSignedInt8(byte1){
  if(byte1 & 0x80) return ((byte1 & 0x7F) - 0x80);
  else return (byte1 & 0x7F);
}

function toSignedInt16(byte1, byte2){
  if(byte1 & 0x80) return ((byte1 & 0x7F) - 0x80) << 8 | byte2;
  else return (byte1 & 0x7F) << 8 | byte2;
}

function toUnsignedInt16(byte1, byte2){
  return (byte1 & 0xFF) << 8 | byte2;
}

//Convert uplink payload.bytes to hexString payload
function toHexString(byteArray) {
  return Array.from(byteArray, function (byte) {
    return ('0' + (byte & 0xff).toString(16)).slice(-2);
  }).join('');
}
