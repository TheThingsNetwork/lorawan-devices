function toHexString(byteArray) {
    return Array.prototype.map.call(byteArray, function (byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
}

function DecodeOy1210Payload(bytes, port) {
    if (port===2) {
        if(bytes.length !== 5){
            return null
        }

        bytes = toHexString(bytes);

        var OY1210Data = {}
        OY1210Data.Temperature =  parseFloat(((parseInt(bytes.substring(0,2)+bytes.substring(4,5),16)/10)-80).toFixed(1));
        OY1210Data.Humidity    =  parseFloat(((parseInt(bytes.substring(2,4)+bytes.substring(5,6),16)/10)-25).toFixed(1))
        OY1210Data.CO2         =  parseInt(bytes.substring(6,10),16)
        return OY1210Data;
    }

    return null;
}

function decodeUplink(input) {
    return {
        "data": DecodeOy1210Payload(input.bytes, input.fPort)
    }
}

