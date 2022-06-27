var movement = [ "Disable", "Move", "Collide", "User" ]

function decodeUplink(input) {
    if (input.fPort != 2) {
        return {
            errors: ['unknown FPort']
        };
    }
    var bytes = input.bytes;
    var warnings = [];
    var data = {
        latitude : ( (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3] ) / 1000000,
        longitude: ( (bytes[4] << 24) | (bytes[5] << 16) | (bytes[6] << 8) | bytes[7] ) / 1000000,
        ALARM_status: !!(bytes[8] & (1 << 6)),
        BatV: ( ((bytes[8] & 0x3f) << 8) | bytes[9] ) / 1000,
        MD: movement[bytes[10] >> 6],
        LON: !!(bytes[10] & (1 << 5)),
        FW: 160 + (bytes[10] & 0x1f),  // NB: 1.5 firmware uses an offset of 150 ...
    };

    // i.e. latitude/longitude are set to 0x0fffffff which decodes to 268.xxx
    if (data.BatV <= 2.84 && data.latitude > 268 && data.longitude > 268) {
        delete data.latitude;
        delete data.longitude;
        warnings.push("GPS turned off because of low battery");
    } else if (data.latitude == 0 && data.longitude == 0) {
        delete data.latitude;
        delete data.longitude;
        warnings.push("GPS failed to obtain location");
    }

    switch (bytes.length) {
        case 18: // GW verison 1.6
            data.hdop = bytes[15] / 100;
            data.altitude = ( (bytes[16] << 24 >> 16) | bytes[17]) / 100;
            // fall-through
        case 15: // FW version 1.5
            data.Roll = ( (bytes[11] << 24 >> 16) | bytes[12]) / 100;
            data.Pitch = ( (bytes[13] << 24 >> 16) | bytes[14]) / 100;
            break;
    }

    if (warnings.length > 0)
        return { data: data, warnings: warnings };
    else
        return { data: data };
}
