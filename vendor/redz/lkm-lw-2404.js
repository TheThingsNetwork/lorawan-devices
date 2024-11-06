function decodeUplink(input) {
  switch (input.fPort) {
    case 1:
      return {
        // Decoded data
        data: {
          
          deviceID: ((input.bytes[0] << 24) + (input.bytes[1] << 16) + (input.bytes[2] << 8) + (input.bytes[3])),
          frameType: getFrameType(input.bytes[4] & 0x0F),
          frameCounter: ((input.bytes[4] >> 4) & 0x0F),
          meterQty: input.bytes[5],
          obisQty: input.bytes[6],
          
          targetPort: input.bytes[7],
          deviceTime: get_status_time((input.bytes[8] << 24) + (input.bytes[9] << 16) + (input.bytes[10] << 8) + (input.bytes[11])),
          firmwareVersion: `${input.bytes[12]}` +'.' + `${input.bytes[13]}` +'.' + `${input.bytes[14]}`,
          deviceName: getDeviceName(input.bytes)
        },
      };
    case 2:
      return {
        // Decoded data
        data: {
          
          deviceID: ((input.bytes[0] << 24) + (input.bytes[1] << 16) + (input.bytes[2] << 8) + (input.bytes[3])),
          frameType: getFrameType(input.bytes[4] & 0x0F),
          frameCounter: ((input.bytes[4] >> 4) & 0x0F),
          
          obisList: getObisList(input.bytes)
        },
      };
    case 3:
      return {
        // Decoded data
        data: {
          
          deviceID: ((input.bytes[0] << 24) + (input.bytes[1] << 16) + (input.bytes[2] << 8) + (input.bytes[3])),
          frameType: getFrameType(input.bytes[4] & 0x0F),
          frameCounter: ((input.bytes[4] >> 4) & 0x0F),
          meterNumber: input.bytes[5],
          obisStartNumber: input.bytes[6],
          dataLength: input.bytes[7],
          
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

  var frameTypes = ['Status Message - Device', 'Status Message - OBIS', "Meter Response Message"];

  if(byte >=0 && byte <=2)
    return frameTypes[byte];
  else
    return 'Unknown Frame';
}



function getDeviceName(bytes) {

  var deviceNameS="";

  for(var i=15;i<bytes.length;i++)
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

function getObisList(bytes) {

  var obisLst = [];
  var ObisName='';
  var obisNumber=0;
  
  var sCounter=0;

  for(var i=5;i<bytes.length;i++)
  {
    if(bytes[i]=== 0x1F)
    {
      sCounter++;
    }
    
    if(sCounter === 0)
      obisNumber = bytes[i];
    else if(sCounter === 1 && bytes[i] != 0x1F)
      ObisName = ObisName + String.fromCharCode(bytes[i]);
    else if(sCounter === 2)
    {
      sCounter = 0;
      obisLst.push([obisNumber, ObisName]);
      
      ObisName = '';
      obisNumber = bytes[i];
    }
    
  }
    

  return obisLst;
}


function getDataList(bytes) {

  var dataLst = [];
  var data=0;
  
  var byteCounter=0;

  for(var i=8;i<bytes.length;i++)
  {
    byteCounter++;
    data = data + (bytes[i] << (8 * (4-byteCounter)));

    if(byteCounter === 4)
    {
      dataLst.push([data]);
      
      byteCounter = 0;
      data=0;
    }
    
    
  }
    

  return dataLst;
}
