function decodeUplink(input) {
  
    var data = {};
    
    data=Decoder(input.bytes,input.fPort);
    
    return {
      data: data
    };
  }

function Decoder(bytes, port) {
    // Decode an uplink message from a buffer
    // (array) of bytes to an object of fields.
    // var decoded = {};

    switch (port) {
        case 1:   // PipeSens Plus
            return decode(bytes, [unixtimeBigEndian, uintbig16, uintbig16, uintbig16, uintbig16, uintbig16, uintbig16, kontakte, bitmap, error_flag1, error_flag2, error_flag3],
                ['Messzeit', 'ISO1 [kOhm]', 'LOOP1 [Ohm]', 'ISO2 [kOhm]', 'LOOP2 [Ohm]', 'Batterie [mVolt]', 'Temperatur [°C]', 'Kontakt', 'Unused', 'ErrorFlag1', 'ErrorFlag2', 'ErrorFlag3']);

        case 2:   // PipeSens
            return decode(bytes, [unixtimeBigEndian, uintbig16, uintbig16, uintbig16, uintbig16, uintbig16, bitmap, error_flag1, error_flag2, error_flag3],
                ['Messzeit', 'ISO1 [kOhm]', 'LOOP1 [Ohm]', 'ISO2 [kOhm]', 'LOOP2 [Ohm]', 'Batterie [mVolt]', 'Unused', 'ErrorFlag1', 'ErrorFlag2', 'ErrorFlag3']);

        case 3:   // SensorBox
            return decode(bytes, [unixtimeBigEndian, uintbig16, uintbig16, uintbig16, temperature, temperature, kontakte, bitmap, error_flag1, error_flag2, error_flag3],
                ['Messzeit', 'ISO [kOhm]', 'LOOP [Ohm]', 'Batterie [mVolt]', 'Temperatur [°C]', 'Feuchte [%]', 'Kontakt', 'Unused', 'ErrorFlag1', 'ErrorFlag2', 'ErrorFlag3']);

        case 25:
            return LMG_Parser(bytes);

        case 100:   // System Ident Daten
            return decode(bytes, [uintbig32, uintbig32, firmware], ['Artikel-Nr', 'Serien-Nr', 'Firmware-Version']);
    }
    return decode(bytes, [unixtime, uint16, uint16], ['zeit', 'Temparatur', 'Feuchte']);
}

// Unterroutinen zum Auswerten

function LMG_Parser(bytes) {
    var decoded = {};
    var wert;
    var channel;
    var kanal;
    var vartype;
    var sensor_type;
    var temp = {};
    temp.elements = 0;
    var feucht = {};
    feucht.elements = 0;

    var buff = [];
    var Iso = [];
    var Loop = [];
    var Spannung = {};
    Spannung.elements = 0;

    for (var i = 0; i < bytes.length;) {            // Den ganzen Payload parsen
        wert = 0;
        channel = bytes[i] >> 4;                    // Das erste Byte enthaelt in Bit 4-7 den Messkanal des Sensors
        kanal = channel + 1;                        // Der Messkanal beginnt immer mit '1'
        vartype = bytes[i++] & 0x0F;                // in Bit 0-3 den Variablentyp des Sensor
        sensor_type = bytes[i++];                   // Das zweite Byte enthaelt den Sensortype

        switch (vartype) {                          // Messwert in Abhaengigkeit vom Variablentype laden
            case 0x00:          // SIGNED_BYTE_VAR
                wert = bytesToInt(bytes.slice(i, i + 1));
                buff[0] = bytes[i++];
                break;
            case 0x01:          // UNSIGNED_BYTE_VAR
                wert = uint8(bytes.slice(i, i + 1));
                buff[0] = bytes[i++];
                break;
            case 0x02:          // BITFIELD_BYTE_VAR
                buff[0] = bytes[i++];
                break;

            case 0x03:          // SIGNED_16BIT_INTEGER_VAR
                wert = intbig16(bytes.slice(i, i + 2));
                buff[0] = bytes[i++];
                buff[1] = bytes[i++];
                break;
            case 0x04:          // UNSIGNED_16BIT_INTEGER_VAR
                wert = uintbig16(bytes.slice(i, i + 2));
                buff[0] = bytes[i++];
                buff[1] = bytes[i++];
                break;
            case 0x05:          // SIGNED_32BIT_INTEGER_VAR
                wert = intbig32(bytes.slice(i, i + 4));
                buff[0] = bytes[i++];
                buff[1] = bytes[i++];
                buff[2] = bytes[i++];
                buff[3] = bytes[i++];
                break;
            case 0x06:          // UNSIGNED_32BIT_INTEGER_VAR
                wert = uintbig32(bytes.slice(i, i + 4));
                buff[0] = bytes[i++];
                buff[1] = bytes[i++];
                buff[2] = bytes[i++];
                buff[3] = bytes[i++];
                break;

            default:
                throw new Error('LMG Parser unknown data type');

        }

        switch (sensor_type) {
            // Widerstand ISO
            case 0x01:          // ISO 0 - 5000 kOhm
                Iso[channel] = "ISO" + kanal + " [0-5000 kOhm]=" + wert;
                break;
            case 0x02:          // ISO 0 - 10 MOhm
                Iso[channel] = "ISO" + kanal + " [0-10000 kOhm]=" + wert;
                break;
            case 0x03:          // ISO 0 - 20 MOhm
                Iso[channel] = "ISO" + kanal +" [0-20000 kOhm]=" + wert;
                break;
            case 0x04:          // ISO 0 - 50 MOhm
                Iso[channel] = "ISO" + kanal + " [0-50000 kOhm]=" + wert;
                break;
            case 0x05:          // ISO 0 - 100 MOhm
                Iso[channel] = "ISO" + kanal + " [0-100000 kOhm]=" + wert;
                break;
            case 0x06:          // ISO 0 - 200 MOhm
                Iso[channel] = "ISO" + kanal + " [0-200000 kOhm]=" + wert;
                break;
            case 0x07:          // ISO 0 - 500 MOhm
                Iso[channel] = "ISO" + kanal + " [0-500000 kOhm]=" + wert;
                break;

            // Widerstand LOOP
            case 0x08:          // LOOP 0 - 5 kOhm
                Loop[channel] = "LOOP" + kanal + " [0-5000 Ohm]=" + wert;
                break;
            case 0x09:          // LOOP 0 - 10 kOhm
                Loop[channel] = "LOOP" + kanal + " [0-10000 Ohm]=" + wert;
                break;
            case 0x0A:          // LOOP 0 - 20 kOhm
                Loop[channel] = "LOOP" + kanal + " [0-20000 Ohm]=" + wert;
                break;
            case 0x0B:          // LOOP 0 - 50 kOhm
                Loop[channel] = "LOOP" + kanal + " [0-50000 Ohm]=" + wert;
                break;
            case 0x0C:          // LOOP 0 - 100 kOhm
                Loop[channel] = "LOOP" + kanal + " [0-100000 Ohm]=" + wert;
                break;

            case 0x12:          // Spannung 0-10 Volt
                Spannung.elements++;
                if (vartype == 0x02) {              // Bitfeld ?
                    Spannung["Channel:" + kanal +" Error"] = i2c_sensor_error(buff.slice(0, 1));
                }
                else {
                    Spannung["Channel:" + kanal + " [0-10 Volt]"] = wert / 1000 ;
                }
                break;

            case 0x2B:         // Temperatur -20 bis +140 Fernwaerme
                temp.elements++;
                if (vartype == 0x02) {              // Bitfeld ?
                    temp["Channel:" + kanal + " Error"] = i2c_sensor_error(buff.slice(0, 1));  // " [-20 - 140 °C]";
                }
                else {
                    temp["Channel:" + kanal + " [-20.00 - +140.00 °C]"] = temperature(buff) ;
                }
                break;

            case 0x40:         // Relative Feuchtigkeit
                feucht.elements++;
                if (vartype == 0x02) {              // Bitfeld ?
                    feucht["Channel:" + kanal + " Error"] = i2c_sensor_error(buff.slice(0, 1));  // " [0 - 100 %]";
                }
                else {
                    feucht["Channel:" + kanal + " [0.00 - 100.00 %]"] =  wert/100;  // " [0 - 100 %]";
                }
                break;

            case 0x73:         // Batterie Spannung
                decoded.Batterie = wert/1000;
                break;

            case 0x76:         // Kontakt
                decoded.Kontakt = kontakte(buff.slice(0, 1));
                break;

            case 0xFE:          // Systemstatus Bitfeld
                decoded.SystemStatus = sensorbox_status(buff.slice(0, 1));
                break;

            default:
                throw new Error('LMG Parser unknown sensor type');
        }
    }
    if (Iso.length > 0) {
        decoded.Iso = Iso;
    }
    if (Loop.length > 0) {
        decoded.Loop = Loop;
    }
    if (feucht.elements > 0) {
        decoded.Feuchte = feucht;
    }
    if (temp.elements > 0) {
        decoded.Temp = temp;
    }
    if (Spannung.elements > 0) {
        decoded.Spannung = Spannung;
    }
    return decoded;
}

var bytesToBigEndianInt = function (bytes) {
    var i = 0;
    for (var x = 0; x < bytes.length; x++) {
        i *= 256;
        i += bytes[x];
    }
    return i;
};

var bytesToInt = function (bytes) {
    var i = 0;
    for (var x = 0; x < bytes.length; x++) {
        i |= +(bytes[x] << (x * 8));
    }
    return i;
};

var unixtimeBigEndian = function (bytes) {
    if (bytes.length !== unixtimeBigEndian.BYTES) {
        throw new Error('Unix time must have exactly 4 bytes');
    }
    var mtime;
    var meas_time;
    var time;

    mtime = bytesToBigEndianInt(bytes);
    mtime *= 1000;
    var now = new Date(mtime).toISOString();
    return (now);
};
unixtimeBigEndian.BYTES = 4;

var unixtimeLittleEndian = function (bytes) {
    if (bytes.length !== unixtime.BYTES) {
        throw new Error('Unix time Little Endian must have exactly 4 bytes');
    }
    return (bytesToInt(bytes));
};
unixtimeBigEndian.BYTES = 4;

var uint8 = function (bytes) {
    if (bytes.length !== uint8.BYTES) {
        throw new Error('int must have exactly 1 byte');
    }
    return bytesToInt(bytes);
};
uint8.BYTES = 1;

var uint16 = function (bytes) {
    if (bytes.length !== uint16.BYTES) {
        throw new Error('int16 must have exactly 2 bytes');
    }
    return bytesToInt(bytes);
};
uint16.BYTES = 2;

var firmware = function (bytes) {
    if (bytes.length !== firmware.BYTES) {
        throw new Error('firmware version must have exactly 3 bytes');
    }
    return (bytes[0] + "." + bytes[1] + "." + bytes[2]);
};
firmware.BYTES = 3;

var intbig16 = function (bytes) {
    if (bytes.length !== intbig16.BYTES) {
        throw new Error('intbig16 must have exactly 2 bytes');
    }
    var ref = bytesToBigEndianInt(bytes);
    return ref > 0x7fff ? ref - 0x10000 : ref;
};
intbig16.BYTES = 2;

var uintbig16 = function (bytes) {
    if (bytes.length !== uintbig16.BYTES) {
        throw new Error('uintbig16 must have exactly 2 bytes');
    }
    return bytesToBigEndianInt(bytes);
};
uintbig16.BYTES = 2;

var intbig32 = function (bytes) {
    if (bytes.length !== intbig32.BYTES) {
        throw new Error('intbig32 must have exactly 4 bytes');
    }
    var ref = bytesToBigEndianInt(bytes);
    return ref > 0x7fffffff ? ref - 0x100000000 : ref;
};
intbig32.BYTES = 4;

var uintbig32 = function (bytes) {
    if (bytes.length !== uintbig32.BYTES) {
        throw new Error('uintbig32 must have exactly 4 bytes');
    }
    return bytesToBigEndianInt(bytes);
};
uintbig32.BYTES = 4;


var uint32 = function (bytes) {
    if (bytes.length !== uint32.BYTES) {
        throw new Error('int32 must have exactly 4 bytes');
    }
    return bytesToInt(bytes);
};
uint32.BYTES = 4;

var latLng = function (bytes) {
    if (bytes.length !== latLng.BYTES) {
        throw new Error('Lat/Long must have exactly 8 bytes');
    }

    var lat = bytesToInt(bytes.slice(0, latLng.BYTES / 2));
    var lng = bytesToInt(bytes.slice(latLng.BYTES / 2, latLng.BYTES));

    return [lat / 1e6, lng / 1e6];
};
latLng.BYTES = 8;

var temperature = function (bytes) {
    if (bytes.length !== temperature.BYTES) {
        throw new Error('Temperature must have exactly 2 bytes');
    }
    var isNegative = bytes[0] & 0x80;
    var b = ('00000000' + Number(bytes[0]).toString(2)).slice(-8)
        + ('00000000' + Number(bytes[1]).toString(2)).slice(-8);
    if (isNegative) {
        var arr = b.split('').map(function (x) { return !Number(x); });
        for (var i = arr.length - 1; i > 0; i--) {
            arr[i] = !arr[i];
            if (arr[i]) {
                break;
            }
        }
        b = arr.map(Number).join('');
    }
    var t = parseInt(b, 2);
    if (isNegative) {
        t = -t;
    }
    return t / 1e2;
};
temperature.BYTES = 2;

var humidity = function (bytes) {
    if (bytes.length !== humidity.BYTES) {
        throw new Error('Humidity must have exactly 2 bytes');
    }

    var h = bytesToInt(bytes);
    return h / 1e2;
};
humidity.BYTES = 2;

// Based on https://stackoverflow.com/a/37471538 by Ilya Bursov
// quoted by Arjan here https://www.thethingsnetwork.org/forum/t/decode-float-sent-by-lopy-as-node/8757
function rawfloat(bytes) {
    if (bytes.length !== rawfloat.BYTES) {
        throw new Error('Float must have exactly 4 bytes');
    }
    // JavaScript bitwise operators yield a 32 bits integer, not a float.
    // Assume LSB (least significant byte first).
    var bits = bytes[3] << 24 | bytes[2] << 16 | bytes[1] << 8 | bytes[0];
    var sign = (bits >>> 31 === 0) ? 1.0 : -1.0;
    var e = bits >>> 23 & 0xff;
    var m = (e === 0) ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
    var f = sign * m * Math.pow(2, e - 150);
    return f;
}
rawfloat.BYTES = 4;

var sensorbox_status = function (byte) {
    if (byte.length !== sensorbox_status.BYTES) {
        throw new Error('Bitmap sensorbox_status must have exactly 1 byte');
    }
    var i = bytesToInt(byte);
    var bm = ('00000000' + Number(i).toString(2)).substr(-8).split('').map(Number).map(Boolean);
    return ['Bit7', 'history_write_error', 'history_read_error', 'eeprom_write_error','eeprom_read_error' , 'System Fehler', 'Erdfehler','Batteriefehler']
        .reduce(function (obj, pos, index) {
            obj[pos] = bm[index];
            return obj;
        }, {});
};
sensorbox_status.BYTES = 1;

var system_status = function (byte) {
    if (byte.length !== system_status.BYTES) {
        throw new Error('Bitmap system_status must have exactly 1 byte');
    }
    var i = bytesToInt(byte);
    var bm = ('00000000' + Number(i).toString(2)).substr(-8).split('').map(Number).map(Boolean);
    return ['Bit7', 'Bit6', 'Bit5', 'Bit4', 'Bit3', 'Batteriefehler', 'Erdfehler', 'HistoryWriteError']
        .reduce(function (obj, pos, index) {
            obj[pos] = bm[index];
            return obj;
        }, {});
};
system_status.BYTES = 1;

var error_flag1 = function (byte) {
    if (byte.length !== error_flag2.BYTES) {
        throw new Error('Bitmap ErrorFlag1 must have exactly 1 byte');
    }
    var i = bytesToInt(byte);
    var bm = ('00000000' + Number(i).toString(2)).substr(-8).split('').map(Number).map(Boolean);
    return ['Bit7', 'Bit6', 'Bit5', 'Bit4', 'Bit3', 'Erdfehler', 'Batteriefehler', 'HistoryWriteError']
        .reduce(function (obj, pos, index) {
            obj[pos] = bm[index];
            return obj;
        }, {});
};
error_flag1.BYTES = 1;

var error_flag2 = function (byte) {
    if (byte.length !== error_flag2.BYTES) {
        throw new Error('Bitmap ErrorFlag2 must have exactly 1 byte');
    }
    var i = bytesToInt(byte);
    var bm = ('00000000' + Number(i).toString(2)).substr(-8).split('').map(Number).map(Boolean);
    return ['history_read_error', 'eeprom_write_error', 'eprom_read_error', 'mess_thread_start_error', 'mess_thread_error', 'modem_invalid_key_error', 'modem_send_error', 'modem_join_error']
        .reduce(function (obj, pos, index) {
            obj[pos] = bm[index];
            return obj;
        }, {});
};
error_flag2.BYTES = 1;

var error_flag3 = function (byte) {
    if (byte.length !== error_flag3.BYTES) {
        throw new Error('Bitmap ErrorFlag3 must have exactly 1 byte');
    }
    var i = bytesToInt(byte);
    var bm = ('00000000' + Number(i).toString(2)).substr(-8).split('').map(Number).map(Boolean);
    return ['modem_busy_error', 'modem_input_error', 'modem_frame_counter_error', 'modem_no_channel_free_error', 'modem_invalid_param_error', 'modem_invalid_len_error', 'modem_set_upctr_error', 'modem_get_upctr_error']
        .reduce(function (obj, pos, index) {
            obj[pos] = bm[index];
            return obj;
        }, {});
};
error_flag3.BYTES = 1;

var i2c_sensor_error = function (byte) {
    if (byte.length !== i2c_sensor_error.BYTES) {
        throw new Error('Bitmap i2c_sensor_error must have exactly 1 byte');
    }
    var i = bytesToInt(byte);
    var bm = ('00000000' + Number(i).toString(2)).substr(-8).split('').map(Number).map(Boolean);
    return ['bit7', 'min underflow', 'max overflow', 'disabled', 'address invalid', 'meas invalid', 'defekt', 'Offline']
        .reduce(function (obj, pos, index) {
            obj[pos] = bm[index];
            return obj;
        }, {});
};
i2c_sensor_error.BYTES = 1;

var kontakt_state = function (bit) {
    if (bit) {
        return ("Open");
    }
    else {
        return ("Close");
    }
}

var kontakte = function (byte) {
    if (byte.length !== kontakte.BYTES) {
        throw new Error('Bitmap Kontakte must have exactly 1 byte');
    }
    var i = bytesToInt(byte);
    var bm = ('00000000' + Number(i).toString(2)).substr(-8).split('').map(Number).map(kontakt_state);
    return ['bit7', 'bit6', 'bit5', 'bit4', 'kontakt2 before', 'kontakt1 before', 'kontakt2 now', 'kontakt1 now']
        .reduce(function (obj, pos, index) {
            obj[pos] = bm[index];
            return obj;
        }, {});
};
kontakte.BYTES = 1;

var items = ['mum', 'dad', 'brother'];

var bitmap = function (byte) {
    if (byte.length !== bitmap.BYTES) {
        throw new Error('Bitmap must have exactly 1 byte');
    }
    var i = bytesToInt(byte);
    var bm = ('00000000' + Number(i).toString(2)).substr(-8).split('').map(Number).map(Boolean);
    return ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
        .reduce(function (obj, pos, index) {
            obj[pos] = bm[index];
            return obj;
        }, {});
};
bitmap.BYTES = 1;

var decode = function (bytes, mask, names) {

    var maskLength = mask.reduce(function (prev, cur) {
        return prev + cur.BYTES;
    }, 0);
    if (bytes.length < maskLength) {
        throw new Error('Mask length is ' + maskLength + ' whereas input is ' + bytes.length);
    }

    names = names || [];
    var offset = 0;
    return mask
        .map(function (decodeFn) {
            var current = bytes.slice(offset, offset += decodeFn.BYTES);
            return decodeFn(current);
        })
        .reduce(function (prev, cur, idx) {
            prev[names[idx] || idx] = cur;
            return prev;
        }, {});
};

if (typeof module === 'object' && typeof module.exports !== 'undefined') {
    module.exports = {
        unixtimeBigEndian: unixtimeBigEndian,
        unixtimeLittleEndian: unixtimeLittleEndian,
        uint8: uint8,
        uint16: uint16,
        uintbig16: uintbig16,
        uintbig32: uintbig32,
        temperature: temperature,
        humidity: humidity,
        latLng: latLng,
        kontakte: kontakte,
        bitmap: bitmap,
        rawfloat: rawfloat,
        LMG_Parser: LMG_Parser,
        decode: decode
    };
}