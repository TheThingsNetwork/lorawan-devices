//return hexadecimal temperature list from T1 payload
function payload_to_hex(payload) {
  var temp_list_hex = []
  if (payload.length == 36){
      for(i=0;i<16;i++){
          temp_list_hex.push(payload.substring((4+2*i),2+(4+2*i)))
      }
  }
  return temp_list_hex
}
//return temperature list from T1 payload
function decode_temp_list(payload) {
  var temp_list = []
  var temp_list_hex = []
  if (payload.length == 36){
      temp_list_hex = payload_to_hex(payload)
  }
  if(temp_list_hex.length == 16){
      for(i=0;i<8;i++){
          temp_list.push(parseInt(temp_list_hex[i*2]+temp_list_hex[i*2+1], 16)/100)
      }
  }    
  return temp_list
}