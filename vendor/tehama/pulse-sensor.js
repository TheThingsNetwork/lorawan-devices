function decodeUplink(input) 
{
  let hexString = input.bytes.map(byte => byte.toString(16).padStart(2, '0')).join(' ');
  let readingStr = input.bytes[12].toString(16).padStart(2, "0")+ input.bytes[11].toString(16).padStart(2, "0")+ input.bytes[10].toString(16).padStart(2, "0")+ input.bytes[9].toString(16).padStart(2, "0");
  var theReading = parseInt(readingStr, 16);
  
  let secondsSince2000 = input.bytes[6].toString(16).padStart(2, "0") + input.bytes[5].toString(16).padStart(2, "0") + input.bytes[4].toString(16).padStart(2, "0") + input.bytes[3].toString(16).padStart(2, "0");
  let startDate = new Date('1970-01-01T00:00:00Z');  
  const milliseconds = parseInt(secondsSince2000, 16) * 1000;  
  let date = new Date(startDate.getTime() + milliseconds);  
  
  var now = new Date();
  
  return {
    data: {
     // msg: hexString,
    //  msgType: input.bytes[0].toString(16).padStart(2, "0"),
    //  subMsgLen: input.bytes[1].toString(16).padStart(2, "0"),
     // subMsgType: input.bytes[2].toString(16).padStart(2, "0"),
      rxTimeStamp: now.toString(),
      readTimeStamp: date.toString(),
      reading: theReading
    },
    warnings: [],
    errors: []
  };
}


