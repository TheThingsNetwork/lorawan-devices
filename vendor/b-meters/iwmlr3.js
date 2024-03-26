function decodeUplink(input) {
  //Decode an uplink payload
  var port = input.fPort;
  var data = {};

switch (input.fPort) {
  case 1:
    data.application = input.bytes[0];
    data.valueCounter = (input.bytes[4] << 24) + (input.bytes[3] << 16) + (input.bytes[2] << 8) + input.bytes[1];
    data.flowCounter = (input.bytes[8] << 24) + (input.bytes[7] << 16) + (input.bytes[6] << 8) + input.bytes[5];
    data.indexK = input.bytes[9];
    data.medium = input.bytes[10];
    //liters
    if (input.bytes[11] === 0x0D) {
      data.vif = input.bytes[11]*1;
    }
    //decaliters
    else if (input.bytes[11] === 0x0E){
      data.vif = input.bytes[11]*10;
    }
    // hectoliters
    else if (input.bytes[11] === 0x0F) {
      data.vif = input.bytes[11] * 100; // Corrected to use 0x0F for hectoliters and directly use the byte value as a multiplier
    }

    //alarms
    //Magnetic 0x00, Removal 0x01, Sensor fraud 0x02, Leakage 0x03, Reverse flow 0x04, Low battery 0x05
    
    if(input.bytes[12] >= 0x00 && input.bytes[12] <= 0x05){
      data.alarm = input.bytes[12];
    }
    else {
      data.alarm = 'error';
    }

    
    return {
     data:data,        
    };
  default:
    return {
      errors: ['unknown FPort'],
    };
}
}