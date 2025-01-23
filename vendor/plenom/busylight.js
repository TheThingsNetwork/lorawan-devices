function decodeUplink(input) {
  if (input.bytes.length == 24)
  {
  return {
    data: {
      RSSI: byteArrayToLong(input.bytes, 0),
      SNR: byteArrayToLong(input.bytes, 4),
      messages_received: byteArrayToLong(input.bytes, 8),
      messages_send: byteArrayToLong(input.bytes, 12),
      lastcolor_red: input.bytes[16],
      lastcolor_blue: input.bytes[17],
      lastcolor_green: input.bytes[18],
      lastcolor_ontime: input.bytes[19],
      lastcolor_offtime: input.bytes[20],
      sw_rev: input.bytes[21],
      hw_rev: input.bytes[22],
      adr_state: input.bytes[23]
    },
    warnings: [],
    errors: []
  };
  }
  else if (input.bytes.length == 25)
  {
  return {
    data: {
      RSSI: byteArrayToLong(input.bytes, 0),
      SNR: byteArrayToLong(input.bytes, 4),
      messages_received: byteArrayToLong(input.bytes, 8),
      messages_send: byteArrayToLong(input.bytes, 12),
      lastcolor_red: input.bytes[16],
      lastcolor_blue: input.bytes[17],
      lastcolor_green: input.bytes[18],
      lastcolor_ontime: input.bytes[19],
      lastcolor_offtime: input.bytes[20],
      sw_rev: input.bytes[21],
      hw_rev: input.bytes[22],
      adr_state: input.bytes[23],
      high_brightness_mode: input.bytes[24]
    },
    warnings: [],
    errors: []
  };
  }
  else if (input.bytes.length == 10)
  {
return {
    data: {
      messages_send: byteArrayToLong(input.bytes, 0),
      lastcolor_red: input.bytes[4],
      lastcolor_blue: input.bytes[5],
      lastcolor_green: input.bytes[6],
      lastcolor_ontime: input.bytes[7],
      lastcolor_offtime: input.bytes[8],
      high_brightness_mode: input.bytes[9]
    },
    warnings: [],
    errors: []
  };    
  }
  else
  {
    return {data: {
      bytes: input.bytes,
      },
    warnings: [],
    errors: []
    }
  }
}


byteArrayToLong = function(/*byte[]*/byteArray, /*int*/from) {
    return byteArray[from] | (byteArray[from+1] << 8) | (byteArray[from+2] << 16) | (byteArray[from+3] << 24);
};

function encodeDownlink(input) {
  
  return {
    bytes:[(input.data.red & 0x00FF), (input.data.blue & 0x00FF), (input.data.green & 0x00FF), (input.data.ontime & 0x00FF), 
    (input.data.offtime & 0x00FF)],
    fPort: 15,
    warnings: [],
    errors: []
  };
}

function decodeDownlink(input) {
if (input.bytes.length == 5)
  {  
  return {
    
    data: {
      red: input.bytes[0],
      green: input.bytes[2],
      blue: input.bytes[1],
      ontime: input.bytes[3],
      offtime: input.bytes[4]
    },
    warnings: [],
    errors: []
  }
  }
else if (input.bytes.length == 6)
  {  
  return {
    
    data: {
      red: input.bytes[0],
      green: input.bytes[2],
      blue: input.bytes[1],
      ontime: input.bytes[3],
      offtime: input.bytes[4],
      immediate_uplink: input.byte[5]
    },
    warnings: [],
    errors: []
      }  
  }
}

