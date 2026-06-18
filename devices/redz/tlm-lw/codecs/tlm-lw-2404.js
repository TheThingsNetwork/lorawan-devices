function decodeUplink(input) {
  switch (input.fPort) {
    case 1:
      return {
        // Decoded data
        data: {
          
          deviceID: ((input.bytes[0] << 24) + (input.bytes[1] << 16) + (input.bytes[2] << 8) + (input.bytes[3])),
          frameType: getFrameType(input.bytes[4] & 0x0F),
          frameCounter: ((input.bytes[4] >> 4) & 0x0F),
          modbusQueryQty: input.bytes[5],
          
          targetPort: input.bytes[6],
          deviceTime: get_status_time((input.bytes[7] << 24) + (input.bytes[8] << 16) + (input.bytes[9] << 8) + (input.bytes[10])),
          firmwareVersion: `${input.bytes[11]}` +'.' + `${input.bytes[12]}` +'.' + `${input.bytes[13]}`,
          deviceName: getStringData(input.bytes, 14)
        },
      };
    
    case 3://Modbus
      return {
        // Decoded data
        data: {
          
          deviceID: ((input.bytes[0] << 24) + (input.bytes[1] << 16) + (input.bytes[2] << 8) + (input.bytes[3])),
          frameType: getFrameType(input.bytes[4] & 0x0F),
          frameCounter: ((input.bytes[4] >> 4) & 0x0F),
          modbusID: input.bytes[5],
          functionCode: input.bytes[6],
          registerStartAdd: ((input.bytes[7] << 8) + (input.bytes[8])),
          registerQty: ((input.bytes[9] << 8) + (input.bytes[10])),
          totalNumberOfBytes: input.bytes[11],
          
          dataList: getDataList(input.bytes)
        },
      };
    case 4://Transparent
      return {
        // Decoded data
        data: {
          
          deviceID: ((input.bytes[0] << 24) + (input.bytes[1] << 16) + (input.bytes[2] << 8) + (input.bytes[3])),
          frameType: getFrameType(input.bytes[4] & 0x0F),
          frameCounter: ((input.bytes[4] >> 4) & 0x0F),

          dataList: getStringData(input.bytes, 5)
        },
      };
    default:
      return {
        errors: ['unknown FPort'],
      };
  }
}

function getFrameType(byte) {

  var frameTypes = ['Status Message - Device', 'Modbus RTU Payload', 'Modbus TCP Payload', 'Transparent Payload - Serial', 'Transparent Payload - TCP'];
  var frameTypeQty = frameTypeQty;
  
  if(byte >=0 && byte <=4)
    return frameTypes[byte];
  else
    return 'Unknown Frame';
}



function getStringData(bytes, startIndex) {

  var deviceNameS="";

  for(var i=startIndex;i<bytes.length;i++)
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
  var byteQuantity = 2;
  
  var byteCounter=0;

  for(var i=12;i<bytes.length;i++)
  {
    byteCounter++;
    data = data + (bytes[i] << (8 * (byteQuantity-byteCounter)));

    if(byteCounter === byteQuantity)
    {
      dataLst.push([data]);
      
      byteCounter = 0;
      data=0;
    }
    
    
  }
    

  return dataLst;
}
