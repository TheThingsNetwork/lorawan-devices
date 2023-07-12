function decodeUplink(input) {
  var decoded = {}
  var step = parseInt(toHexString(input.bytes).substring(4,6), 16)
  var list_increment = []    
  var list_power = []    
  var header = parseInt(toHexString(input.bytes).substring(2,4), 16)
  if(header == 46) obis = "E_SUM"
  if(header == 47) obis = "E_POS"
  if(header == 48) obis = "E_NEG"
  list_increment = decode_increment(toHexString(input.bytes))
  n = 60/step
  for(i=0;i<list_increment.length;i++){
      if(list_increment[i] != null){
          list_power.push(list_increment[i]*n)
      } 
      else{
          list_power.push(null)
      }
  }
  decoded.index = decode_index(toHexString(input.bytes))
  decoded.step = step
  decoded.obis = obis  
  decoded.list_power = list_power
  if(toHexString(input.bytes).length == 56){
    return {
      data:{
        index: decoded.index,
        powers: decoded.power_list,
        step: decoded.step,
        obis: decoded.obis
      }
    }
  }
  else{
      msg = "The payload has the wrong size !"
      return msg
  }    
}
//return index from T1 payload
function decode_index(payload) {
  var index = null;
  var signed = parseInt(payload.substring(6, 8), 16)
  if(payload.length == 56){
    if(signed){
        index = BigInt.asIntN(64, "0x"+payload.substring(8,24))
    }
    else{
        index = BigInt.asUintN(64, "0x"+payload.substring(8,24)) 
    }    
    return index;
  }
  return index  
}

//return hexadecimal power list from T1 payload
function payload_to_hex(payload) {
  var power_list_hex = []
  if(payload.length == 56){
    for(i=0;i<16;i++){
        power_list_hex.push(payload.substring((24+2*i),2+(24+2*i)))
    }
  }
  
  return power_list_hex
}

//return power list from T1 payload
function decode_increment(payload) {
  var list_increment = []
  var list_increment_hex = payload_to_hex(payload)
  var signed = parseInt(payload.substring(6, 8), 16)        
  if(payload.length == 56){
    for(i=0;i<8;i++){
      if(list_increment_hex[i*2]+list_increment_hex[i*2+1] == "FFFE" || list_increment_hex[i*2]+list_increment_hex[i*2+1] == "FFFD" || list_increment_hex[i*2]+list_increment_hex[i*2+1] == "FFFB" || list_increment_hex[i*2]+list_increment_hex[i*2+1] == "FFFC"){
          list_increment.push(null)
      }
      else{
          if(signed){
              val = parseInt(list_increment_hex[i*2]+list_increment_hex[i*2+1], 16)              
              if ((val & 0x8000) > 0) {
              val = val - 0x10000;
              }
              list_increment.push(val/10)
          }
          else{
              list_increment.push(parseInt(list_increment_hex[i*2]+list_increment_hex[i*2+1], 16)/10)
          }
      }        
    }
  }
         
  return list_increment
}

//Convert uplink payload.bytes to hexString payload
function toHexString(byteArray) {
  return Array.from(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('')
}