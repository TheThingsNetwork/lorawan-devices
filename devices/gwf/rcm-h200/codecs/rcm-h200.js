function decodeMedium(code) {
  if(code<5 && code >2){
    code=code-3;
  }else if(code<7 && code >4){
    code=code-5;
  }
  
  if(code===0){
    return "water";
  }
  
  if(code===1){
    return "warm water";  
  }
  
  if(code===2){
    return "gas";
  }
  
  return "unkown";
  
}

function decodeUnits(code) {
  if(code < 3 ){
    return "m^3";
  }else if(code < 5 ){
    return "galons";
  }else if(code < 7 ){
    return "feet^3";    
  }else{
    return "unkown";
  }
}
function decodeMultiplier(code){
  if(code === 0){
    return "10^-3";
  }
  if(code === 1){
    return "10^-2";
  }
  if(code === 2){
    return "10^-1";
  }
  if(code === 3){
    return "1";
  }
  if(code === 4){
    return "10";
  }
  
  return "unkown";
}

function getActualityDuration(input) {
  
  var durationString = "";
  if(input < 0 || input > 255){
    duration = "unknown";
  }
  else if(input <= 59) {
    duration = input; + " minutes";
  }
  else if(input > 59 && input < 152) {
    var durationMin = (((input-60)*15)%60);
    var durationHour = Math.floor((((input - 60) * 15))/60)+1;
    duration = durationHour + "h " + durationMin +"m";
    duration = duration;
  }
  else if(152 <= input && input < 200){
    var durationDays = input - 152+1;
    duration = durationDays + " days";
  }
  else if(200 <= input && input < 245){
    var durationWeeks = input - 200 + 7;
    duration = durationWeeks + " weeks";
  }
  else if(245<= input){
    var durationYear = 1;
    duration = "more than " + durationYear + " years";
  }
  else {
    duration = "unknown";
  }
  
  return duration;
}

function decodeUplink(input){
  var bytes = input.bytes;
  var decoded = {};
  var data = {};
  
  data.meterVolume = ((bytes[3]&0b111)<<24|bytes[2]<<16|bytes[1]<<8|bytes[0]);
  data.lifetimeSemester = bytes[3] >> 3;
  data.lifeTime = bytes[3]&((1<<5) - 1);
  data.meterMediumAndUnitsCode = bytes[4] & 0xF;
  
  data.medium = decodeMedium(data.meterMediumAndUnitsCode);
  data.units = decodeUnits(data.meterMediumAndUnitsCode);
  
  data.meterMultiplier = decodeMultiplier(bytes[4] >> 4);
  data.meterSerialNumber = ((bytes[8]&0b111)<<24|bytes[7]<<16|bytes[6]<<8|bytes[5]);
  data.actualityDuration = getActualityDuration(bytes[10]);
  data.meterNoResponse =  ((bytes[8]>>3)& 0x01) == 1;
  data.meterEcoFrameError = ((bytes[8]>>4)& 0x01) == 1;
  data.meterRollError = ((bytes[8]>>5)& 0x01) == 1;
  data.brokenPipe = ((bytes[8]>>6)& 0x01) == 1;
  data.lowBattery = ((bytes[8]>>7)& 0x01) == 1;
  data.backflow = ((bytes[9])& 0x01) == 1;
  data.continuousFlow = ((bytes[9]>>1)& 0x01) == 1;
  data.noUsage = ((bytes[9]>>2)& 0x01) == 1;
  data.linkError= ((bytes[9]>>3)& 0x01) == 1;
  data.emvPass = (!data.linkError & !data.meterRollError &  !data.meterNoResponse &!  data.meterEcoFrameError) == 1;
  
  return {data};
}