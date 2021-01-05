function decodeUplink(bytes){
  let byteArray = bytes.match(/.{1,2}/g).map(byte => 
          (parseInt(byte, 16).toString(2)).padStart(8, '0')
      )

  let messageTypes = ['keepalive', 'testButtonPressed', 'floodDetected', 'controlButtonPressed', 'fraudDetected'];
  const toBool = value => value == '1';
  const shortPackage = (byteArray) => {
      return {
          reason: messageTypes[parseInt(byteArray[0].slice(0, 2))],
          valveState: toBool(byteArray[0][3]),
          boxTamper: toBool(byteArray[0][4]),
          floodDetectionWireState: toBool(byteArray[0][5]),
          flood: toBool(byteArray[0][6]),
          magnet: toBool(byteArray[0][7]),
          alarmValidated: toBool(byteArray[1][0]),
          manualOpenIndicator: toBool(byteArray[1][1]),
          manualCloseIndicator: toBool(byteArray[1][2]),
      }
  }
  const longPackage = (byteArray) => {
      return {
          reason: messageTypes[parseInt(byteArray[0].slice(0, 2))],
          valveState: toBool(byteArray[0][3]),
          boxTamper: toBool(byteArray[0][4]),
          floodDetectionWireState: toBool(byteArray[0][5]),
          flood: toBool(byteArray[0][6]),
          magnet: toBool(byteArray[0][7]),
          alarmValidated: toBool(byteArray[1][0]),
          manualOpenIndicator: toBool(byteArray[1][1]),
          manualCloseIndicator: toBool(byteArray[1][2]),
          closeTime: parseInt(byteArray[2], 2),
          openTime: parseInt(byteArray[3], 2),
          temp1: parseInt(byteArray[4], 2),
          temp2: parseInt(byteArray[5], 2),
          battery: (parseInt(byteArray[6], 2) * 4) + 3000,
      }
  }
  if(byteArray.length > 2){
      return longPackage(byteArray);
  }else{
      return shortPackage(byteArray);
  }
}