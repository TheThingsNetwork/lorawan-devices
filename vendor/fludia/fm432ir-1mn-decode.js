//return index from T1 payload
function decode_index(payload) {
  var index = null;
  var signed = parseInt(payload.substring(6, 8), 16)
  if(signed){
      index = BigInt.asIntN(64, "0x"+payload.substring(8,24))
  }
  else{
      index = BigInt.asUintN(64, "0x"+payload.substring(8,24)) 
  }    
  return index;
}

//return hexadecimal power list from T1 payload
function payload_to_hex(payload) {
    var power_list_hex = []
    if(payload.length == 84){
        for(i=0;i<30;i++){
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
    if(payload.length == 84){
        for(i=0;i<15;i++){
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