//Main function Decoder
function decodeUplink(input){
  var decoded = {}
  decoded.index = decode_index(toHexString(input.bytes))
  decoded.power_list = decode_power_list(toHexString(input.bytes))
  if(decoded.index && decoded.power_list.length==20){
    return {
      data:{
        index: decoded.index,
        powers: decoded.power_list
     
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
  if (payload.length == 90) {
      index = payload.substring(2, 8);
  }
  return parseInt(index, 16);
}

//return hexadecimal power list from T1 payload
function payload_to_hex(payload) {
  var power_list_hex = []
  if (payload.length == 90){
      for(i=0;i<40;i++){
          power_list_hex.push(payload.substring((10+2*i),2+(10+2*i)))
      }
  }
  return power_list_hex
}

//return power list from T1 payload
function decode_power_list(payload) {
  var power_list = []
  var power_list_hex = []
  if (payload.length == 90){
      power_list_hex = payload_to_hex(payload)
  }
  if(power_list_hex.length == 40){
      for(i=0;i<20;i++){
          power_list.push(parseInt(power_list_hex[i*2]+power_list_hex[i*2+1], 16))
      }
  }    
  return power_list
}

//Convert uplink payload.bytes to hexString payload
function toHexString(byteArray) {
  return Array.from(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('')
}