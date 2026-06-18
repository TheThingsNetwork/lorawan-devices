
function DecodeOy1100Payload(bytes) {
    if(bytes.length % 3 !==0){
        return null;
    }

    var OY1100Data  = {}
    OY1100Data.Temperature = parseFloat((((bytes[0]<<4) | ((bytes[2]& 0xF0)>>4))*0.1).toFixed(1));
    OY1100Data.RelativeHumidity = parseFloat((((bytes[1]<<4) | (bytes[2]&0x0F) ) *0.1).toFixed(1));
    return OY1100Data;
}


function decodeUplink(input) {
    return {
        "data": DecodeOy1100Payload(input.bytes)
    }
}

