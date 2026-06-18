
function DecodeOy1110Payload(bytes, port) {
    if (port===2) {
        if (bytes.length % 3 !== 0) {
            return null;
        }

        var OY1110Data = {};
        OY1110Data.Temperature =  ( ( ( ((bytes[0])<<4) | ((bytes[2]&0xF0)>>4) )- 800) / 10.0)
        OY1110Data.RelativeHumidity = ( ( ( ((bytes[1])<<4) | (bytes[2]&0x0F) )- 250) / 10.0)
        return OY1110Data;
    }
    else if (port === 3) {
        if (bytes.length%3 != 1) {
            return null;
        }

        bytes = bytes.slice(1,bytes.length)

        var OY1110Data = {};
        OY1110Data.Temperature =  ( ( ( ((bytes[0])<<4) | ((bytes[2]&0xF0)>>4) )- 800) / 10.0)
        OY1110Data.RelativeHumidity = ( ( ( ((bytes[1])<<4) | (bytes[2]&0x0F) )- 250) / 10.0)
        return OY1110Data;
    }

    return null;
}


function decodeUplink(input) {
    return {
        "data": DecodeOy1110Payload(input.bytes, input.fPort)
    }
}

