function decodeUplink(bytes){
    let byteArray = bytes.match(/.{1,2}/g).map(byte => 
            (parseInt(byte, 16).toString(2)).padStart(8, '0')
        )
    let messageTypes = ['keepalive', 'testButtonPressed', 'floodDetected', 'fraudDetected'];
    const toBool = value => value == '1';
    const shortPackage = (byteArray) => {
        return {
            reason: messageTypes[parseInt(byteArray[0].slice(0, 2))],
            boxTamper: toBool(byteArray[0][4]),
            flood: toBool(byteArray[0][6]),
            battery: (parseInt(byteArray[1], 2) * 16),
        }
    }
    const longPackage = (byteArray) => {
        return {
            reason: messageTypes[parseInt(byteArray[0].slice(0, 2))],
            boxTamper: toBool(byteArray[0][4]),
            flood: toBool(byteArray[0][6]),
            battery: (parseInt(byteArray[1], 2) * 16),
            temp1: parseInt(byteArray[2], 2),
        }
    }
    if(byteArray.length > 2){
        return longPackage(byteArray);
    }else{
        return shortPackage(byteArray);
    }
}