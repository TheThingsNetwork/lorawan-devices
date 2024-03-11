
function decodeUplink(input) {
  switch (input.fPort) {
    case 1:
      return {
        // Decoded data
        data: {
          frameType: getFrameType([input.bytes[0] & 0x0F]),
          deviceID: '0x'+((input.bytes[1] << 24) + (input.bytes[2] << 16) + (input.bytes[3] << 8) + (input.bytes[4])).toString(16),
          targetPort: input.bytes[5],
          deviceTime: get_status_time((input.bytes[6] << 24) + (input.bytes[7] << 16) + (input.bytes[8] << 8) + (input.bytes[9])),
          firmwareVersion: `${input.bytes[10]}` +'.' + `${input.bytes[11]}` +'.' + `${input.bytes[12]}`,
          deviceName: getDeviceName(input.bytes),
        },
      };
    default:
      return {
        errors: ['unknown FPort'],
      };
  }
}

function getFrameType(byte) {

  var frameTypes = ['ModbusRTU', 'ModbusTCP', 'Trasnparent'];

  if(byte >=0 && byte <=2)
    return frameTypes[byte];
  else
    return 'Unknown Frame';
}

function getDeviceName(bytes) {

  var deviceNameS="";

  for(var i=13;i<bytes.length;i++)
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


