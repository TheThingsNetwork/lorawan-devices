const PAYLOAD_TYPE = {
  T1_E_SUM                          :  {header: 0x2e, size: 28/*in bytes*/, name: "T1_E_SUM"},
  T1_E_POS                          :  {header: 0x2f, size: 28/*in bytes*/, name: "T1_E_POS"},
  T1_E_NEG                          :  {header: 0x30, size: 28/*in bytes*/, name: "T1_E_NEG"},
  T1_E_SUM_ADJUSTABLE_STEP          :  {header: 0x71, size_min: 13/*in bytes*/, size_max: 51/*in bytes*/, name: "T1_E_SUM_ADJUSTABLE_STEP"},
  T1_E_POS_ADJUSTABLE_STEP          :  {header: 0x72, size_min: 13/*in bytes*/, size_max: 51/*in bytes*/, name: "T1_E_POS_ADJUSTABLE_STEP"},
  T1_E_NEG_ADJUSTABLE_STEP          :  {header: 0x73, size_min: 13/*in bytes*/, size_max: 51/*in bytes*/, name: "T1_E_NEG_ADJUSTABLE_STEP"},
  T1_IR_DOUBLE_MODE_ADJUSTABLE_STEP :  {header: 0x74, size_min: 23/*in bytes*/, size_max: 51/*in bytes*/, name: "T1_IR_DOUBLE_MODE_ADJUSTABLE_STEP"},
  T2_MME                            :  {header: 0x2a, size: 18/*in bytes*/, name: "T2_MME"},
  T2_MME_ADJUSTABLE_STEP            :  {header: 0x3a, size: 21/*in bytes*/, name: "T2_MME_ADJUSTABLE_STEP"},
  T1_MECA_10MN                      :  {header: 0x48, size: 21/*in bytes*/, name: "T1_MECA_10MN"},
  T1_MECA_15MN                      :  {header: 0x49, size: 21/*in bytes*/, name: "T1_MECA_15MN"},
  T1_MECA_1H                        :  {header: 0x4a, size: 21/*in bytes*/, name: "T1_MECA_1H"},
  T1_MECA_ADJUSTABLE_STEP           :  {header: 0x6F, size_min: 8/*in bytes*/, size_max: 46/*in bytes*/, name: "T1_MECA_ADJUSTABLE_STEP"},
  T2_MECA                           :  {header: 0x4b, size: 12/*in bytes*/, name: "T2_MECA"},
  T2_MECA_ADJUSTABLE_STEP           :  {header: 0x70, size: 16/*in bytes*/, name: "T2_MECA_ADJUSTABLE_STEP"},
  TT1_MECA                          :  {header: 0x12, size: 37/*in bytes*/, name: "TT1_MECA"},
  TT2_MECA                          :  {header: 0x13, size: 30/*in bytes*/, name: "TT2_MECA"},
  START                             :  {header: 0x01, size: 3/*in bytes*/,  name: "START"}
}

//Main function Decoder
function decodeUplink(input){
  var decoded = {
    data: {
      index : null,
      index_solar: null,
      message_type : null,
      increments : [],
      powers : [],
      time_step: null,
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
  if(decoded.data.message_type == PAYLOAD_TYPE.T1_MECA_10MN.name) decoded.data.time_step = 10;
  if(decoded.data.message_type == PAYLOAD_TYPE.T1_MECA_15MN.name) decoded.data.time_step = 15;
  if(decoded.data.message_type == PAYLOAD_TYPE.T1_MECA_1H.name) decoded.data.time_step = 60;
  //Decode message
  if(decoded.data.message_type == PAYLOAD_TYPE.T1_E_SUM.name || decoded.data.message_type == PAYLOAD_TYPE.T1_E_POS.name
    || decoded.data.message_type == PAYLOAD_TYPE.T1_E_NEG.name){
    var data = decode_T1_mme(input.bytes,decoded.data.message_type);
    decoded.data.meter_type = "mME (Position B)";
    decoded.data.index = data.index;
    decoded.data.powers = data.powers;
    decoded.data.time_step = data.time_step;
    decoded.data.type_of_measure = data.type_of_measure;
  }else if(decoded.data.message_type == PAYLOAD_TYPE.T1_E_SUM_ADJUSTABLE_STEP.name
    || decoded.data.message_type == PAYLOAD_TYPE.T1_E_POS_ADJUSTABLE_STEP.name
    || decoded.data.message_type == PAYLOAD_TYPE.T1_E_NEG_ADJUSTABLE_STEP.name){
    var data = decode_T1_mme_adjustable_step(input.bytes,decoded.data.message_type);
    for(var i = 0;i<data.warnings.length;i++){
      decoded.warnings.push(data.warnings[i]);
    }
    decoded.data.meter_type = "mME (Position B)";
    decoded.data.index = data.index;
    decoded.data.powers = data.powers;
    decoded.data.time_step = data.time_step;
    decoded.data.type_of_measure = data.type_of_measure;
  }else if(decoded.data.message_type == PAYLOAD_TYPE.T1_IR_DOUBLE_MODE_ADJUSTABLE_STEP.name){
    var data = decode_T1_mme_double_mode_adjustable_step(input.bytes,decoded.data.message_type);
    for(var i = 0;i<data.warnings.length;i++){
      decoded.warnings.push(data.warnings[i]);
    }
    decoded.data.meter_type = "mME (Position B)";
    decoded.data.index_solar = data.index_solar;
    decoded.data.powers = data.powers;
    decoded.data.time_step = data.time_step;
    decoded.data.type_of_measure = data.type_of_measure;
  } else if(decoded.data.message_type == PAYLOAD_TYPE.T2_MME.name){
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
  }else if(decoded.data.message_type == PAYLOAD_TYPE.T2_MME_ADJUSTABLE_STEP.name){
    var data = decode_T2_mme_adjustable_step(input.bytes);
    for(var i = 0;i<data.warnings.length;i++){
      decoded.warnings.push(data.warnings[i]);
    }
    decoded.data.low_battery = data.low_battery;
    decoded.data.index = data.index;
    decoded.data.meter_type = "mME (Position B)";
    decoded.data.firmware_version = data.firmware_version;
    decoded.data.time_step = data.time_step;
    decoded.data.type_of_measure = data.type_of_measure;
    decoded.data.scaler_e_pos = data.scaler_e_pos;
    decoded.data.scaler_e_sum = data.scaler_e_sum;
    decoded.data.scaler_e_neg = data.scaler_e_neg;
    decoded.data.sensor_sensitivity = data.sensor_sensitivity;
    decoded.data.redundancy = data.redundancy;
    decoded.data.nb_values = data.nb_values;
  }
  if(decoded.data.message_type == PAYLOAD_TYPE.T1_MECA_10MN.name || decoded.data.message_type == PAYLOAD_TYPE.T1_MECA_15MN.name
    || decoded.data.message_type == PAYLOAD_TYPE.T1_MECA_1H.name){
    var data = decode_T1_meca(input.bytes, decoded.data.time_step);
    decoded.data.index = data.index;
    decoded.data.increments = data.increments;
    decoded.data.powers = data.powers;
  }else if(decoded.data.message_type == PAYLOAD_TYPE.T1_MECA_ADJUSTABLE_STEP.name){
    var data = decode_T1_meca_adjustable_step(input.bytes, decoded.data.time_step);
    decoded.data.time_step = data.time_step;
    decoded.data.index = data.index;
    decoded.data.increments = data.increments;
    decoded.data.powers = data.powers;
  }else if(decoded.data.message_type == PAYLOAD_TYPE.T2_MECA.name){
    var data = decode_T2_meca(input.bytes);
    decoded.data.index = data.index;
    decoded.data.meter_type = "Electromechanical (Position A)";
    decoded.data.low_battery = data.low_battery;
    decoded.data.firmware_version = data.firmware_version;
    decoded.data.number_of_starts = data.number_of_starts;
    decoded.data.time_step = data.time_step;
  }else if(decoded.data.message_type == PAYLOAD_TYPE.T2_MECA_ADJUSTABLE_STEP.name){
    var data = decode_T2_meca_adjustable_step(input.bytes);
    decoded.data.param_id = data.param_id;
    decoded.data.index = data.index;
    decoded.data.meter_type = "Electromechanical (Position A)";
    decoded.data.low_battery = data.low_battery;
    decoded.data.firmware_version = data.firmware_version;
    decoded.data.number_of_starts = data.number_of_starts;
    decoded.data.time_step = data.time_step;
    decoded.data.redundancy = data.redundancy;
    decoded.data.nb_values = data.nb_values;
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
      case PAYLOAD_TYPE.T2_MME_ADJUSTABLE_STEP.header:
        if(payload.length == PAYLOAD_TYPE.T2_MME_ADJUSTABLE_STEP.size) return PAYLOAD_TYPE.T2_MME_ADJUSTABLE_STEP.name
        break;
    }
  }else{
    switch(payload[0]){
      case PAYLOAD_TYPE.T1_E_SUM_ADJUSTABLE_STEP.header:
        if(payload.length >= PAYLOAD_TYPE.T1_E_SUM_ADJUSTABLE_STEP.size_min && payload.length <= PAYLOAD_TYPE.T1_E_SUM_ADJUSTABLE_STEP.size_max)
          return PAYLOAD_TYPE.T1_E_SUM_ADJUSTABLE_STEP.name
        break;
      case PAYLOAD_TYPE.T1_E_POS_ADJUSTABLE_STEP.header:
        if(payload.length >= PAYLOAD_TYPE.T1_E_POS_ADJUSTABLE_STEP.size_min && payload.length <= PAYLOAD_TYPE.T1_E_POS_ADJUSTABLE_STEP.size_max)
          return PAYLOAD_TYPE.T1_E_POS_ADJUSTABLE_STEP.name
        break;
      case PAYLOAD_TYPE.T1_E_NEG_ADJUSTABLE_STEP.header:
        if(payload.length >= PAYLOAD_TYPE.T1_E_NEG_ADJUSTABLE_STEP.size_min && payload.length <= PAYLOAD_TYPE.T1_E_NEG_ADJUSTABLE_STEP.size_max)
          return PAYLOAD_TYPE.T1_E_NEG_ADJUSTABLE_STEP.name
        break;
      case PAYLOAD_TYPE.T1_IR_DOUBLE_MODE_ADJUSTABLE_STEP.header:
        if(payload.length >= PAYLOAD_TYPE.T1_IR_DOUBLE_MODE_ADJUSTABLE_STEP.size_min && payload.length <= PAYLOAD_TYPE.T1_IR_DOUBLE_MODE_ADJUSTABLE_STEP.size_max)
          return PAYLOAD_TYPE.T1_IR_DOUBLE_MODE_ADJUSTABLE_STEP.name
        break;
      case PAYLOAD_TYPE.T1_MECA_10MN.header:
        if(payload.length == PAYLOAD_TYPE.T1_MECA_10MN.size) return PAYLOAD_TYPE.T1_MECA_10MN.name
        break;
      case PAYLOAD_TYPE.T1_MECA_15MN.header:
        if(payload.length == PAYLOAD_TYPE.T1_MECA_15MN.size) return PAYLOAD_TYPE.T1_MECA_15MN.name
        break;
      case PAYLOAD_TYPE.T1_MECA_1H.header:
        if(payload.length == PAYLOAD_TYPE.T1_MECA_1H.size) return PAYLOAD_TYPE.T1_MECA_1H.name
        break;
      case PAYLOAD_TYPE.T1_MECA_ADJUSTABLE_STEP.header:
        if(payload.length >= PAYLOAD_TYPE.T1_MECA_ADJUSTABLE_STEP.size_min && payload.length <= PAYLOAD_TYPE.T1_MECA_ADJUSTABLE_STEP.size_max) return PAYLOAD_TYPE.T1_MECA_ADJUSTABLE_STEP.name
        break;
      case PAYLOAD_TYPE.T2_MECA.header:
        if(payload.length == PAYLOAD_TYPE.T2_MECA.size) return PAYLOAD_TYPE.T2_MECA.name
        break;
      case PAYLOAD_TYPE.T2_MECA_ADJUSTABLE_STEP.header:
        if(payload.length == PAYLOAD_TYPE.T2_MECA_ADJUSTABLE_STEP.size) return PAYLOAD_TYPE.T2_MECA_ADJUSTABLE_STEP.name
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

function decode_T1_mme(payload, type){
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
        var bytes = [];
        for(var i = 0;i<8;i++) bytes.push(payload[i+4])
        data.index = toSignedInt64(bytes)/10
      }
    }else{//Positive no issue
        data.index = parseInt(toHexString(payload).substring(8, 24),16)/10
    }
  }
  /*if(type == PAYLOAD_TYPE.T1_E_NEG.name && data.index > 0){
    data.index = -data.index;
  }*/
  for(var i = 0;i<8;i++){
    if(payload[12+i*2] == 0xFF
      && (payload[13+i*2] == 0xFF || payload[13+i*2] == 0xFE || payload[13+i*2] == 0xFD || payload[13+i*2] == 0xFC || payload[13+i*2] == 0xFB)){
        data.powers.push(null);
    }else{
      var value = 0;
      if(!signed) value = toUnsignedInt16(payload[12+i*2],payload[13+i*2])/10;
      else value = toSignedInt16(payload[12+i*2],payload[13+i*2])/10;
      /*if(type == PAYLOAD_TYPE.T1_E_NEG.name && value > 0){
        value = -value;
      }*/
      data.powers.push(value*60/data.time_step)
    }
  }
  return data
}

function decode_T1_mme_adjustable_step(payload, type){
  var data = {};
  data.time_step = payload[1];
  data.powers = [];
  data.warnings = [];
  var signed = payload[2];
  if(!signed){
    data.index = parseInt(toHexString(payload).substring(6, 22),16)/10
  }else{
    if(payload[3] & 0x80){
      //We have a negative number
      //For signed values we will have an issue with javascript handling only 52 bits and not 64
      if(payload[3] == 0xFF && (payload[4] >> 4) == 0xFF && (payload[5] >> 4) == 0xFF && (payload[6] >> 4) == 0xFF){
        data.index = (parseInt(toHexString(payload).substring(14, 22),16) >> 0)/10
      }else{
        var bytes = [];
        for(var i = 0;i<8;i++) bytes.push(payload[i+3])
        data.index = toSignedInt64(bytes)/10
      }
    }else{//Positive no issue
        data.index = parseInt(toHexString(payload).substring(6, 22),16)/10
    }
  }
  /*if(type == PAYLOAD_TYPE.T1_E_NEG_ADJUSTABLE_STEP.name && data.index > 0){
    data.index = -data.index;
  }*/
  var nb_values_in_payload = (payload.length-11)/2
  for(var i = 0;i<nb_values_in_payload;i++){
    if(payload[11+i*2] == 0xFF
      && (payload[12+i*2] == 0xFF || payload[12+i*2] == 0xFE || payload[12+i*2] == 0xFD || payload[12+i*2] == 0xFC || payload[12+i*2] == 0xFB)){
        data.powers.push(null);
    }else{
      var value = 0;
      if(!signed) value = toUnsignedInt16(payload[11+i*2],payload[12+i*2])/10;
      else value = toSignedInt16(payload[11+i*2],payload[12+i*2])/10;
      /*if(type == PAYLOAD_TYPE.T1_E_NEG.name && value > 0){
        value = -value;
      }*/
      data.powers.push(value*60/data.time_step)
    }
  }
  return data
}

function decode_T1_mme_double_mode_adjustable_step(payload, type){
  var data = {};
  data.time_step = payload[1];
  data.powers = [[],[]];
  data.warnings = [];
  data.index_solar = {
    e_pos: null,
    e_neg: null
  }
  var nb_values_in_payload = (payload.length-19)/4
  var signedPos = false;
  var signedNeg = false;
  if(payload[2] == 1) signedPos = true;
  else if(payload[2] == 2) signedNeg = true;
  else if(payload[2] == 3){
    signedNeg = true;
    signedPos = true;
  }
  if(!signedPos){
    data.index_solar.e_pos = parseInt(toHexString(payload).substring(6, 22),16)/10
  }else{
    if(payload[3] & 0x80){
      //We have a negative number
      //For signed values we will have an issue with javascript handling only 52 bits and not 64
      if(payload[3] == 0xFF && (payload[4] >> 4) == 0xFF && (payload[5] >> 4) == 0xFF && (payload[6] >> 4) == 0xFF){
        data.index_solar.e_pos = (parseInt(toHexString(payload).substring(14, 22),16) >> 0)/10
      }else{
        var bytes = [];
        for(var i = 0;i<8;i++) bytes.push(payload[i+3])
        data.index_solar.e_pos = toSignedInt64(bytes)/10
      }
    }else{//Positive no issue
        data.index_solar.e_pos = parseInt(toHexString(payload).substring(6, 22),16)/10
    }
  }
  if(!signedNeg){
    data.index_solar.e_neg = parseInt(toHexString(payload).substring(22+(4*nb_values_in_payload), 22+(4*nb_values_in_payload)+16),16)/10
    //data.index_solar.e_neg = - data.index_solar.e_neg
  }else{
    if(payload[3+8+2*nb_values_in_payload] & 0x80){
      //We have a negative number
      //For signed values we will have an issue with javascript handling only 52 bits and not 64
      if(payload[3+8+2*nb_values_in_payload] == 0xFF && (payload[4+8+2*nb_values_in_payload] >> 4) == 0xFF
         && (payload[5+8+2*nb_values_in_payload] >> 4) == 0xFF && (payload[6+8+2*nb_values_in_payload] >> 4) == 0xFF){
        data.index_solar.e_neg = (parseInt(toHexString(payload).substring((15+2*nb_values_in_payload)*2, (15+2*nb_values_in_payload)*2+8),16) >> 0)/10
      }else{
        var bytes = [];
        for(var i = 0;i<8;i++) bytes.push(payload[i+(11+2*nb_values_in_payload)])
        data.index_solar.e_neg = toSignedInt64(bytes)/10
      }
    }else{//Positive no issue
        data.index_solar.e_neg = parseInt(toHexString(payload).substring(22+(4*nb_values_in_payload), 22+(4*nb_values_in_payload)+16),16)/10
    }
  }
  for(var i = 0;i<nb_values_in_payload;i++){
    if(payload[11+i*2] == 0xFF
      && (payload[12+i*2] == 0xFF || payload[12+i*2] == 0xFE || payload[12+i*2] == 0xFD || payload[12+i*2] == 0xFC || payload[12+i*2] == 0xFB)){
        data.powers[0].push(null);
    }else{
      var value = 0;
      if(!signedPos) value = toUnsignedInt16(payload[11+i*2],payload[12+i*2])/10;
      else value = toSignedInt16(payload[11+i*2],payload[12+i*2])/10;
      data.powers[0].push(value*60/data.time_step)
    }
  }

  for(var i = 0;i<nb_values_in_payload;i++){
    if(payload[19+nb_values_in_payload*2+i*2] == 0xFF
      && (payload[20+nb_values_in_payload*2+i*2] == 0xFF || payload[20+nb_values_in_payload*2+i*2+i*2] == 0xFE
        || payload[20+nb_values_in_payload*2+i*2] == 0xFD || payload[20+nb_values_in_payload*2+i*2] == 0xFC
        || payload[20+nb_values_in_payload*2+i*2] == 0xFB)){
        data.powers[1].push(null);
    }else{
      var value = 0;
      if(!signedNeg){
        value = toUnsignedInt16(payload[19+nb_values_in_payload*2+i*2],payload[20+nb_values_in_payload*2+i*2])/10;
        //value = -value;
      }
      else value = toSignedInt16(payload[19+nb_values_in_payload*2+i*2],payload[20+nb_values_in_payload*2+i*2])/10;
      data.powers[1].push(value*60/data.time_step)
    }
  }




  /*
  if(type == PAYLOAD_TYPE.T1_E_NEG_ADJUSTABLE_STEP.name && data.index > 0){
    data.index = -data.index;
  }
  var nb_values_in_payload = (payload.length-11)/2
  for(var i = 0;i<nb_values_in_payload;i++){
    if(payload[11+i*2] == 0xFF
      && (payload[12+i*2] == 0xFF || payload[12+i*2] == 0xFE || payload[12+i*2] == 0xFD || payload[12+i*2] == 0xFC || payload[12+i*2] == 0xFB)){
        data.powers.push(null);
    }else{
      var value = 0;
      if(!signed) value = toUnsignedInt16(payload[11+i*2],payload[12+i*2])/10;
      else value = toSignedInt16(payload[11+i*2],payload[12+i*2])/10;
      if(type == PAYLOAD_TYPE.T1_E_NEG.name && value > 0){
        value = -value;
      }
      data.powers.push(value)
    }
  }*/
  return data
}

function decode_T1_meca(payload, time_step){
  var data = {};
  data.index  = (payload[1] & 0xFF) << 24 | (payload[2] & 0xFF) << 16 | (payload[3] & 0xFF) << 8 | (payload[4] & 0xFF);
  data.increments = []
  data.powers = []
  for(var i=0;i<8;i++){
    data.increments.push((payload[5+2*i] & 0xFF) << 8 | (payload[6+2*i] & 0xFF))
  }
  for(var i=0;i<8;i++){
    data.powers.push(data.increments[i] * 60 / time_step)
  }
  return data
}

function decode_T1_meca_adjustable_step(payload, time_step){
  var data = {};
  data.time_step = payload[1];
  data.index  = (payload[2] & 0xFF) << 24 | (payload[3] & 0xFF) << 16 | (payload[4] & 0xFF) << 8 | (payload[5] & 0xFF);
  data.increments = []
  data.powers = []
  var nb_values_in_payload = (payload.length-6)/2
  for(var i=0;i<nb_values_in_payload;i++){
    data.increments.push((payload[6+2*i] & 0xFF) << 8 | (payload[7+2*i] & 0xFF))
  }
  for(var i=0;i<nb_values_in_payload;i++){
    data.powers.push(data.increments[i] * 60 / data.time_step)
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

function decode_T2_meca_adjustable_step(payload){
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
        var bytes = [];
        for(var i = 0;i<8;i++) bytes.push(payload[i+10])
        data.index = toSignedInt64(bytes)/10
      }
    }else{//Positive no issue
        data.index = parseInt(toHexString(payload).substring(20, 36),16)/10
    }
  }
  if(data.measure == 2) data.index = parseInt(toHexString(payload).substring(20, 36),16)/10;
  return data;
}

function decode_T2_mme_adjustable_step(payload){
  var data = {};
  data.time_step = payload[2];
  data.nb_values = payload[3];
  data.redundancy = payload[4];
  data.measure = payload[5];
  data.warnings = [];
  if(data.measure == 0) data.type_of_measure = "E-POS values (OBIS code 1.8.0)";
  if(data.measure == 1) data.type_of_measure = "E-SUM values (OBIS code 16.8.0)";
  if(data.measure == 2) data.type_of_measure = "E-NEG values (OBIS code 2.8.0)";
  if(data.measure == 3) data.type_of_measure = "E-POS values (OBIS code 1.8.0) & E-NEG values (OBIS code 2.8.0)";
  data.firmware_version = payload[7];
  data.sensor_sensitivity = payload[8];
  data.low_battery = payload[9] & 0x1;
  data.scaler_e_pos = toSignedInt8(payload[10]);
  if(payload[10] == 0x7F) data.scaler_e_pos = null;
  else data.scaler_e_pos = Math.pow(10, data.scaler_e_pos)
  data.scaler_e_sum = toSignedInt8(payload[11]);
  if(payload[11] == 0x7F) data.scaler_e_sum = null;
  else data.scaler_e_sum = Math.pow(10, data.scaler_e_sum)
  data.scaler_e_neg = toSignedInt8(payload[12]);
  if(payload[12] == 0x7F) data.scaler_e_neg = null;
  else data.scaler_e_neg = Math.pow(10, data.scaler_e_neg)
  if(data.measure == 0) data.index = parseInt(toHexString(payload).substring(26, 42),16)/10;
  if(data.measure == 1){
    if(payload[13] & 0x80){
      //We have a negative number
      //For signed values we will have an issue with javascript handling only 32 bits
      if(payload[13] == 0xFF && (payload[14]) == 0xFF && (payload[15]) == 0xFF && (payload[16]) == 0xFF){
        data.index = (parseInt(toHexString(payload).substring(34, 42),16) >> 0)/10
      }else{
        for(var i = 0;i<8;i++) bytes.push(payload[i+12])
        data.index = toSignedInt64(bytes)/10
      }
    }else{//Positive no issue
        data.index = parseInt(toHexString(payload).substring(26, 42),16)/10
    }
  }
  if(data.measure == 2) data.index = parseInt(toHexString(payload).substring(26, 42),16)/10;
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

function toSignedInt64(bytes){
  var size = 8
  var first = true;
  var pos = 0
  var value = 0;
  while (size--) {
    if (first) {
      let byte = bytes[pos++];
      value += byte & 0x7f;
      if (byte & 0x80) {
        value -= 0x80;
        // Treat most-significant bit as -2^i instead of 2^i
      }
      first = false;
    }
    else {
      value *= 256;
      value += bytes[pos++];
    }
  }
  return value;
}
