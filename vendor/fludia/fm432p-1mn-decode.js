//return index from T1 payload
function decode_index(payload) {
  var index = null;
  if (payload.length == 88) {
      index = payload.substring(2, 8);
  }
  return parseInt(index, 16);
}

//return hexadecimal power list from T1 payload
function payload_to_hex(payload) {
  var list_increment_hex = []
  if (payload.length == 88){
      for(i=0;i<40;i++){
          list_increment_hex.push(payload.substring((8+2*i),2+(8+2*i)))
      }
  }
  return list_increment_hex
}

//return power list from T1 payload
function decode_list_increment(payload) {
  var list_increment = []
  var list_increment_hex = []
  if (payload.length == 88){
      list_increment_hex = payload_to_hex(payload)
  }
  if(list_increment_hex.length == 40){
      for(i=0;i<20;i++){
          list_increment.push(parseInt(list_increment_hex[i*2]+list_increment_hex[i*2+1], 16))
      }
  }    
  return list_increment
}