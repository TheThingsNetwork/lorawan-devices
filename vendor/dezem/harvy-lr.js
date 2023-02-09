function uint16_BE(bytes, idx) {
    bytes = bytes.slice(idx || 0);
    return (bytes[0] << 8 | bytes[1] << 0);
}
function readVersion(bytes, idx) {
    bytes = bytes.slice(idx || 0);
    return "v" + bytes[0] + "." + bytes[1] + "." + bytes[2];
}
function signed(val, bits) {
    if ((val & 1 << (bits - 1)) > 0) { // value is negative (16bit 2's complement)
        var mask = Math.pow(2, bits) - 1;
        val = (~val & mask) + 1; // invert all bits & add 1 => now positive value
        val = val * -1;
    }
    return val;
}
function int16_BE(bytes, idx) {
    bytes = bytes.slice(idx || 0);
    return signed(bytes[0] << 8 | bytes[1] << 0, 16);
}
// Decoder function for TTN
function Decoder(bytes, port) {
    // Decode an uplink message from a buffer
    // (array) of bytes to an object of fields.
    var decoded = {
        "version": readVersion(bytes, 0),
        "shuntValue_Ohm": bytes[3] / 10,
        "amplifierGain": bytes[4],
        "vsysCurrent_mV": uint16_BE(bytes, 5) / 10,
        "vsysMin_mV": uint16_BE(bytes, 7) / 10,
        "vsysMax_mV": uint16_BE(bytes, 9) / 10,
        "vampRms_mV": uint16_BE(bytes, 11) / 10,
        "isecCurrent_mA": uint16_BE(bytes, 13) / 100,
        "isecAvgLong_mA": uint16_BE(bytes, 15) / 100,
        "isecAvgShort_mA": uint16_BE(bytes, 17) / 100,
        "isecMin_mA": uint16_BE(bytes, 19) / 100,
        "isecMax_mA": uint16_BE(bytes, 21) / 100,
        "measurmentsCounter": uint16_BE(bytes, 23),
        "lastUploadSec_sec": uint16_BE(bytes, 25),
        "temperature": int16_BE(bytes, 27) / 10,
        "powerlost": bytes[29]
    };
    return decoded;
}
