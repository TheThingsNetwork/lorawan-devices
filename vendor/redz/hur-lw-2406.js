function decodeUplink(input) {
  switch (input.fPort) {
    case 1:
      return {
        // Decoded data
        data: {
          
          deviceID: ((input.bytes[0] << 24) + (input.bytes[1] << 16) + (input.bytes[2] << 8) + (input.bytes[3])),
          frameType: getFrameType(input.bytes[4] & 0x0F),
          frameCounter: ((input.bytes[4] >> 4) & 0x0F),
          slotQty: input.bytes[5],
          slotTypes: getslotTypes(input.bytes),
          
          targetPort: input.bytes[10],
          deviceTime: get_status_time((input.bytes[11] << 24) + (input.bytes[12] << 16) + (input.bytes[13] << 8) + (input.bytes[14])),
          firmwareVersion: `${input.bytes[15]}` +'.' + `${input.bytes[16]}` +'.' + `${input.bytes[17]}`,
          deviceName: getDeviceName(input.bytes)
        },
      };
    
    case 3:
      return {
        // Decoded data
        data: {
          
          deviceID: ((input.bytes[0] << 24) + (input.bytes[1] << 16) + (input.bytes[2] << 8) + (input.bytes[3])),
          frameType: getFrameType(input.bytes[4] & 0x0F),
          frameCounter: ((input.bytes[4] >> 4) & 0x0F),
          deviceTime: get_status_time((input.bytes[5] << 24) + (input.bytes[6] << 16) + (input.bytes[7] << 8) + (input.bytes[8])),
          slotNumber: input.bytes[9],
          slotType: getslotType(input.bytes[10]),
          dataLength: input.bytes[11],
          
          dataList: getDataList(input.bytes)
        },
      };
    default:
      return {
        errors: ['unknown FPort'],
      };
  }
}

function getFrameType(byte) {

  var frameTypes = ['Status Message - Device', 'Unknown Frame', 'IO Slot Response Message'];

  if(byte >=0 && byte <=2)
    return frameTypes[byte];
  else
    return 'Unknown Frame';
}

var slotTypes = ['NA', 'HUR_8_DIGITAL_IN', 'HUR_8_DIGITAL_OUT', 'HUR_8_ANALOG_IN', 'HUR_5_ANALOG_OUT'];
var slotTValues = [0, 0x18, 0x28, 0x38, 0x45];

function getslotTypes(bytes) {
  
  var sqty = bytes[5];
  var maxSQty=4;
  var slotLst = [];
  
  for(var i=0;i<maxSQty;i++)
  {
    if(i < sqty)
    {
      slotLst.push([(i+1), getslotType(bytes[(6+i)] )]);
        
    }
    else
    {
      slotLst.push([(i+1), slotTypes[0]]);
    }
    
  }
  
  return slotLst;
}

function getslotType(byte) {
  
  var slotType;
  

  if(byte == slotTValues[1])
    slotType = slotTypes[1];
  else if(byte == slotTValues[2])
    slotType = slotTypes[2];
  else if(byte == slotTValues[3])
    slotType = slotTypes[3];
  else if(byte == slotTValues[4])
    slotType = slotTypes[4];
  else
    slotType = slotTypes[0];

  return slotType;
}



function getDeviceName(bytes) {

  var deviceNameS="";
  
  var dnStartb=18;

  for(var i=dnStartb;i<bytes.length;i++)
    deviceNameS = deviceNameS + String.fromCharCode(bytes[i]);

  return deviceNameS;
}

function get_status_time(hex){

  var hour= (((hex) >> 16) & 0x1F);
	var min=  (((hex) >> 6) & 0x3F);
  var sec = ((hex) & 0x3F);

	
  var year= ((((hex) >> 26) & 0x3F) + 2000);
	var mon= (((hex) >> 12) & 0x0F);
	var day= (((hex) >> 21) & 0x1F);
	
	var time =  year +'-'+ mon +'-'+ day +' '+ hour +':'+ min +':'+ sec;
	return time;
}


function getDataList(bytes) {

  var dataLst = [];
  var data=0;
  var i;
  
  var byteCounter=0;
  
  if(bytes[10]== slotTValues[3] || bytes[10]== slotTValues[4])//'HUR_8_ANALOG_IN' or 'HUR_5_ANALOG_OUT'
  {
    for(i=12;i<bytes.length;i++)
    {
      byteCounter++;
      data = data + (bytes[i] << (8 * (2-byteCounter)));
  
      if(byteCounter === 2)
      {
        dataLst.push([data]);
        
        byteCounter = 0;
        data=0;
      }
      
      
    }
  }
  else if(bytes[10]== slotTValues[1] || bytes[10]== slotTValues[2]) //'HUR_8_DIGITAL_IN' or 'HUR_8_DIGITAL_OUT'
  {
    for(i=0;i<8;i++)//8 input
    {
      dataLst.push([(bytes[12]>>(1 * i))& 0x01]);
      
      
    }
  }

  
    

  return dataLst;
}
