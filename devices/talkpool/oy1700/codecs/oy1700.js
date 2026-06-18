function toHexString(byteArray) {
    return Array.prototype.map.call(byteArray, function (byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
}

function DecodeOy1700Payload(bytes, port) {
    if (port===2) {
        bytes = toHexString(bytes);
        let OY1700Data = {}
        OY1700Data.Temperature =  parseFloat(((parseInt(bytes.substring(0,2)+bytes.substring(4,5),16)/10)-80).toFixed(1));
        OY1700Data.RelativeHumidity    =  parseFloat(((parseInt(bytes.substring(2,4)+bytes.substring(5,6),16)/10)-25).toFixed(1))
        OY1700Data.PM1_0       =  parseInt(bytes.substring(6,10),16)
        OY1700Data.PM2_5       =  parseInt(bytes.substring(10,14),16)
        OY1700Data.PM_10       =  parseInt(bytes.substring(14,bytes.length),16)
        return OY1700Data;
    }

    return null;
}


function decodeUplink(input) {
    return {
        "data": DecodeOy1700Payload(input.bytes, input.fPort)
    }
}

