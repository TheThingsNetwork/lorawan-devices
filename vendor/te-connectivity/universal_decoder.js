function decodeUplink(input) {
    // input has the following structure:
    // {
    //   "bytes": [1, 2, 3], // FRMPayload (byte array)
    //   "fPort": 1
    // }


    // Should RETURN :
    //
    // data: {
    //     bytes: input.bytes,
    //   },
    //   warnings: ["warning 1", "warning 2"], // optional
    //   errors: ["error 1", "error 2"], // optional (if set, the decoding failed)
    // };
    
    return te_decoder(input.bytes, input.fPort)
  }


function te_decoder(bytes, port) {
    var ttn_output = {data:{}}
    var decode = ttn_output.data

    if (DecodeFwRevision(decode, port, bytes) === false)
        if (Decode8911EX(decode, port, bytes) === false)
            if (Decode8931EX(decode, port, bytes) === false)
                if (DecodeU8900(decode, port, bytes) === false)
                        if (DecodeU8900Pof(decode, port, bytes) === false)
                            if (DecodeSinglePoint(decode, port, bytes) === false)
                                if (DecodeTiltSensor(decode, port, bytes) === false)
                                    if (DecodeOperationResponses(decode, port, bytes) === false)
                                        if (DecodeKeepAlive(decode, port, bytes) === false) {
                                            decode.val = 'Unknown frame';
                                            decode.port = port;
                                            decode.bytes = arrayToString(bytes);
                                        }
                                  
    return ttn_output;

}

function Decode8931EX(decode, port, bytes) {
    if (port == 5) {
        decode.bat = (bytes[1] & 0x0F) == 0xF ? 'err' : (((bytes[1] & 0x0F) * 10) + '%');

        decode.devstat = {};
        decode.devstat.rotEn = (bitfield(bytes[1], 7) == 1) ? 'enabled' : 'disabled';
        decode.devstat.temp = (bitfield(bytes[1], 6) === 0) ? 'ok' : 'err';
        decode.devstat.acc = (bitfield(bytes[1], 5) === 0) ? 'ok' : 'err';
        

        decode.presetId = bytes[0];
        decode.temp = bytes[2] * 0.5 - 40 + '°C';
        decode.fftInfo = {};
        decode.fftInfo.BwMode = bytes[3] & 0x0F;
        decode.axisInfo = {};
        decode.axisInfo.Axis = String.fromCharCode(88 + (bytes[4] >> 6));
        decode.axisInfo.PeakNb = bytes[4] & 0x3F;
        decode.axisInfo.SigRms = dBDecompression(bytes[5]);

        decode.peaksList = [];



        var peakVal = 0;
        var bitCount = 0;
        for (var i = 0; i < decode.axisInfo.PeakNb * 19; i++) {
            peakVal |= ((bytes[6 + Math.trunc((i / 8))] >> (8 - 1 - (i % 8))) & 0x01) << (19 - bitCount - 1);
            bitCount++;
            if (bitCount == 19) {

                var peak = {};
                peak.Freq = peakVal >> 8;
                peak.Mag = dBDecompression(peakVal & 0xFF);
                decode.peaksList.push(peak);
                bitCount = 0;
                peakVal = 0;
            }



        }
        return true;

    }


    else if (port == 133 || port == 197){
        // 133 start fragment, 197 end fragment
        decode.val = '8931 : Fragmented frame NOT SUPPORTED by TTN Live Decoder';
        decode.port = port;
        decode.bytes = arrayToString(bytes);  
        return true;
    }
    else {
        return false;
    }
}

function Decode8911EX(decode, port, bytes) {
    if (port == 1) {
        if (bytes.length >=1) {
            decode.bat = bytes[0] + '%';
        }
        if (bytes.length >= 2) {
            decode.peak_nb = bytes[1];
        }
        if (bytes.length >= 4) {
            decode.temp = arrayConverter(bytes, 2, 2);
            decode.temp = decode.temp == 0x7FFF ? 'err' : round(((decode.temp / 10.0) - 100), 1);
        }
        if (bytes.length >= 6) {
            decode.sig_rms = round(arrayConverter(bytes, 4, 2) / 1000.0, 3);
        }
        if (bytes.length >= 7) {
            decode.preset = bytes[6];
        }
        if (bytes.length >= 8) {
            decode.devstat = {};
            decode.devstat.acc = (bitfield(bytes[7], 5) === 0) ? 'ok' : 'err';
            decode.devstat.temp = (bitfield(bytes[7], 6) === 0) ? 'ok' : 'err';
            decode.devstat.rotEn = (bitfield(bytes[7], 7) == 1) ? 'enabled' : 'disabled';
            decode.devstat.com = (bitfield(bytes[7], 3) == 0) ? 'ok' : 'err';
            decode.devstat.battery = (bitfield(bytes[7], 0) == 0) ? 'ok' : 'err';
        }
        decode.peaks = [];
        for (var i = 0; i < decode.peak_nb && ((i*5+5) < (bytes.length-8)); i++) {
            var peak = {};
            peak.freq = arrayConverter(bytes, 5 * i + 8, 2);
            peak.mag = round(arrayConverter(bytes, ((i * 5) + 10), 2) / 1000.0, 3);
            peak.ratio = bytes[i * 5 + 12];
            decode.peaks.push(peak);

        } return true;
    }
    else if(port == 129 || port == 193) {
        // 129 start fragment, 193 end fragment
        decode.val = '8911 : Fragmented frame NOT SUPPORTED by TTN Live Decoder';
        decode.port = port;
        decode.bytes = arrayToString(bytes);
        return true;
    }
    return false;
}

function DecodeFwRevision(decode, port, bytes) {
    if (port == 2) {      
        decode.firmware_version = arrayToAscii(bytes);
        return true;
    }
    return false;
}

function DecodeU8900(decode, port, bytes) {
    if (port == 4) {
        decode.bat = (bytes[1] & 0x0F) == 0xF ? 'err' : (((bytes[1] & 0x0F) * 10) + '%');

        if (bytes[0] === 0x00) {
            decode.devstat = 'normal';
        }
        else {
            decode.devstat = {};
            decode.devstat.Meas = (bitfield(bytes[0], 7) === 0) ? 'ok' : 'err';
            decode.devstat.Cal = (bitfield(bytes[0], 6) === 0) ? 'ok' : 'err';
            decode.devstat.Unk = (bitfield(bytes[0], 5) === 0) ? 'ok' : 'err';
            decode.devstat.Unsup = (bitfield(bytes[0], 4) === 0) ? 'ok' : 'err';

        }
        decode.temp = isNaN(arrayToFloat(bytes, 2)) ? 'err' : round(arrayToFloat(bytes, 2), 1) + '°C';
        decode.pres = isNaN(arrayToFloat(bytes, 6)) ? 'err' : round(arrayToFloat(bytes, 6), 3) + 'Bar';
        return true;
    }
    return false;
}

function DecodeU8900Pof(decode, port, bytes) {
    if (port == 104) {
        // MCU Flags
        decode.pream = bytes[0] == 0x3C ? 'OK' : 'KO !!!';
        decode.rst_cnt = arrayConverter(bytes, 1, 2, true);
        decode.pof_tx = bytes[3] & 0x01 == 0x01 ? 'MCU POF !!!' : 'OK';
        decode.pof_idle = (bitfield(bytes[4], 0) === 0) ? 'OK' : 'MCU POF !!!';
        decode.pof_snsmeas = (bitfield(bytes[4], 1) === 0) ? 'OK' : 'MCU POF !!!';
        decode.pof_batmeas = (bitfield(bytes[4], 2) === 0) ? 'OK' : 'MCU POF !!!';


        decode.batt = arrayConverter(bytes, 5, 2, true) + 'mV';

        if (bytes[7] === 0x00) {
            decode.devstat = 'ok';
        }
        else {
            decode.devstat = {};
            decode.devstat.Meas = (bitfield(bytes[7], 7) === 0) ? 'OK' : 'err';
            decode.devstat.Cal = (bitfield(bytes[7], 6) === 0) ? 'OK' : 'err';
            decode.devstat.Unk = (bitfield(bytes[7], 5) === 0) ? 'OK' : 'err';
            decode.devstat.Unsup = (bitfield(bytes[7], 4) === 0) ? 'OK' : 'err';
        }

        decode.batt_lvl = (bytes[8] & 0x0F) == 0xF ? 'ERROR' : (((bytes[8] & 0x0F) * 10) + '%');
        decode.patbatt = bytes[9] == 0xA5 ? 'OK' : 'Corrupted';
        decode.pattemp = bytes[9] == 0xA5 ? 'OK' : 'Corrupted';

        decode.mcu_temp = arrayConverter(bytes, 10, 2, true, true) / 100.0 + '°C';
        decode.pres = isNaN(arrayToFloat(bytes, 13)) ? 'ERROR' : round(arrayToFloat(bytes, 13), 3) + ' Bar';
        decode.patend = bytes[17] == 0x5A ? 'OK' : 'KO !!! ';
        var i = 0;
        decode.zdata = [];
        for (i = 0; i < bytes.length; i++) {
            decode.zdata.push(bytes[i].toString(16));
        }
        return true;
    }
    return false;
     }
     //port 10  EyEALQhjCgw/gHNj  1321002d08630a0c3f807363    data
     //port 20  AComZGU4ZWFiMTdhZDVm  00 2a 26 64 65 38 65 61 62 31 37 61 64 35 66 fw rev
    //port 30  /EyEARwhj keep alive 132100470863
function DecodeOperationResponses(decode, port, bytes) {
         var res = false;
         if (port == 20) {
             res = true;
             var OperationRepsType = {
                 0: "Read",
                 1: "Write",
                 2: "Write+Read"
             }
             var OperationFlag = {
                 7: "UuidUnk",
                 6: "OpErr",
                 5: "ReadOnly",
                 4: "NetwErr",

             }
             decode.op = OperationRepsType[bytes[0]&0x3];
             decode.opFlag = [];
             for (var i = 7; i > 4; i--) {
                 if (bitfield(bytes[0], i) === 1) {
                     decode.opFlag.push(OperationFlag[i]);
                 }
             }
                 var uuid = arrayToUint16(bytes, 1, false)
                 decode.uuid = uuid.toString(16);
                 var payload = bytes.slice(3)
                 switch (uuid) {
                     case 0x2A24:
                         decode.model = arrayToAscii(payload);
                         break;
                     case 0x2A25:
                         decode.sn = arrayToAscii(payload);
                         break;
                     case 0x2A26:
                         decode.fwrev = arrayToAscii(payload);
                         break;
                     case 0x2A27:
                         decode.hwrev = arrayToAscii(payload);
                         break;
                     case 0x2A29:
                         decode.manuf = arrayToAscii(payload);
                         break;
                     case 0xB302:
                         decode.measInt = payload[0].toString() + 'h '+payload[1].toString() + ' min'+payload[2].toString() + ' sec';
                         break;
                     case 0x2A19:
                         decode.batt = payload[0];
                         break;
                     case 0xCE01:
                         var KeepAliveInterval = {
                             0: "24h",
                             1: "12h",
                             2: "8h",
                             3: "4h",
                             4: "2h"
                         }
                         var KeepAliveMode = {
                             0: "AnyTime",
                             1: "IfSilent",
                             2: "Disable"
                         }
                         decode.kaCfg = {};
                         decode.kaCfg.mode = KeepAliveMode[(payload[0]>>3) & 0x3];
                         decode.kaCfg.interval = KeepAliveInterval[payload[0] & 0x7];
                         break;
                     case 0xB201:
                         var ThsSrc = {
                             0: "MainRaw",
                             1: "MainDelta",
                             2: "SecondaryRaw",
                             3: "SecondaryDelta",
                             0xFF:"Error"
                         }
                         var ThsSel = {
                             0: "Config",
                             1: "Level",
                             2: "MeasInterval",
                             3: "ComMode",
                             0xFF: "Error"
                         }
                         decode.ThsCfg = {};
                         decode.ThsCfg.Src = ThsSrc[payload[0]];
                         decode.ThsCfg.Sel = ThsSel[payload[1]];
                         switch (decode.ThsCfg.Sel) {
                             case "Config":
                                 decode.ThsCfg.cfg = {};
                                 decode.ThsCfg.cfg.eventFlag = bitfield(payload[2], 7);
                                 decode.ThsCfg.cfg.enable = bitfield(payload[2], 6);
                                 decode.ThsCfg.cfg.condition =( bitfield(payload[2], 5) == 1 )? '<' : '>';
                                 decode.ThsCfg.cfg.autoclr = bitfield(payload[2], 4);
                                 decode.ThsCfg.cfg.actionMeasIntEn = bitfield(payload[2], 3) 
                                 decode.ThsCfg.cfg.actionAdvModeEn = bitfield(payload[2], 2) 
                                 decode.ThsCfg.cfg.actionUplModeEn = bitfield(payload[2], 1) 
                                 break;
                             case "Level":
                                 decode.ThsCfg.lvl = {};
                                 if (payload.length - 2 >= 4) {
                                     decode.ThsCfg.lvl.valf32 = arrayToFloat(payload, 2, false);
                                     decode.ThsCfg.lvl.vali32 = arrayToInt32(payload, 2, false) / 100.0;

                                     decode.ThsCfg.lvl.vali16 = arrayToInt16(payload, 4, false) / 100.0;
                                 }
                                 else {
                                     decode.ThsCfg.lvl.err = "wrong size";
                                 }
                                 break;
                             case "MeasInterval":
                                 decode.ThsCfg.measInt = payload[2].toString() + 'h ' + payload[3].toString() + ' min' + payload[4].toString() + ' sec';
                                 break;
                             case "ComMode":
                                 var ThsComBleMode = {
                                     0: "Periodic",
                                     1: "On Measure",
                                     2: "ADV Silent"
                                 }
                                 var ThsComLoraMode = {
                                     0: "On Measurement",
                                     1: "Silent",
                                     2: "Merge"
                                 }
                                 decode.ThsCfg.ComMode = {};
                                 decode.ThsCfg.ComMode.ble = ThsComBleMode[payload[2]&0x03];
                                 decode.ThsCfg.ComMode.lora = ThsComLoraMode[payload[3]&0x03];
                                 break;
                         }
                         break;
                     case 0xDB01:
                         var DataLogDataType = {
                             0: "Temperature",
                             1: "MainData",
                             2: "Temperature+MainData"
                         }
                         var DataLogDataSize = {
                             0: 2,
                             1: 4,
                             2: 6,
                         }
                         decode.Datalog = {};
                         decode.Datalog.type = DataLogDataType[payload[0]];
                         decode.Datalog.index = arrayToUint16(payload, 1, false);
                         decode.Datalog.length = payload[3];
                         var dataSize = DataLogDataSize[payload[0]];
                         decode.Datalog.data = [];
                         for (var i = 0; i < decode.Datalog.length && payload.length > (dataSize*(i+1)+4) ; i++) {
                             var dataN = {};
                             dataN.index = decode.Datalog.index + i;
                             switch (decode.Datalog.type) {
                                 case "Temperature":
                                     dataN.temp = arrayToUint16(payload, dataSize * (i) + 4, false)/100.0;
                                     break;
                                 case "MainData":
                                     dataN.maini32 = arrayToInt32(payload, dataSize * (i) + 4, false)/100.0;
                                     dataN.mainf32 = arrayToFloat(payload, dataSize * (i) + 4, false);
                                     break;
                                 case "Temperature+MainData":
                                     dataN.temp = arrayToUint16(payload, dataSize * (i) + 4, false) / 100.0;
                                     dataN.maini32 = arrayToInt32(payload, dataSize * (i) + 4 + 2, false) / 100.0;
                                     dataN.mainf32 = arrayToFloat(payload, dataSize * (i) + 4+2, false);
                                     break;
                                 default: break;
                             }
                             decode.Datalog.data.push(dataN);
                         }
                         break;
                     case 0xF801:
                         decode.DevEui = arrayToString(payload);
                         break;
                     case 0xF802:
                         decode.AppEui = arrayToString(payload);
                         break;
                     case 0xF803:
                         var RegionType = {
                             0: "AS923",
                             1: "AU915",
                             2: "CN470",
                             3: "CN779",
                             4: "EU433",
                             5: "EU868",
                             6: "KR920",
                             7: "IN865",
                             8: "US915"
                         }
                         decode.Region = RegionType[payload[0]&0x0F];
                         break;
                     case 0xF804:
                         decode.netId = arrayToString(payload);
                         break;
                     default:
                         decode.payload = []
                         decode.payload = arrayToString(payload);
                         
                         break;
                 }

             
         }
         else {
             res = false;
         }
         return res;
     }
function DecodeKeepAlive(decode, port, bytes) {
         if (port == 30) {
             decode.msgType = "Keep Alive";
             decode.devtype = {}
             decode.devtype = getDevtype(arrayToUint16(bytes, 0, false));
             decode.cnt = arrayToUint16(bytes, 2, false, false);
             decode.devstat = []
             decode.devstat = getDevstat(bytes[4])
             decode.bat = bytes[5];
            
             return true;
         }
         else {
             return false;
         }
}
function DecodeTiltSensor(decode, port, bytes) {
    decode.size = bytes.length;
    if (port == 10)
        if (0x2411==arrayToUint16(bytes, 0, false) && bytes.length == 24) {
        decode.cnt = arrayToUint16(bytes, 2, false, false);
        var devstat;
        devstat = [];
        var DevstatDict = {
            7: "Com_Err",
            6: "Crc_Err",
            5: "Timeout_Err",
            4: "Sys_Err",
            3: "Conf_Err"
        }

        if (bytes[4] === 0x00) {
            devstat = 'ok';
        }
        else {

            for (var i = 7; i >= 3; i--) {
                if (bitfield(bytes[4], i) === 1) {
                    devstat.push(DevstatDict[i]);
                }
            }
        }
        decode.devstat = devstat
        decode.bat = bytes[5];
        decode.temp = (arrayConverter(bytes, 6, 2, false, true) / 100.0).toString() + "°C";
        decode.angleX = (arrayConverter(bytes, 8, 2, false, true) / 100.0).toString() + "°";
        decode.angleY = (arrayConverter(bytes, 10, 2, false, true) / 100.0).toString() + "°";
        decode.dispX = (arrayToFloat(bytes, 12, false)).toString() + "mm";
        decode.dispY = (arrayToFloat(bytes, 16, false)).toString() + "mm";
        decode.dispZ = (arrayToFloat(bytes, 20, false)).toString() + "mm";
        return true;
    }
    

    return false;
}
function DecodeSinglePoint(decode, port, bytes) {
    if (port == 10 ) {
               

        // 0x1321, 0x1222, 0x1422 map to devtype for pressure and temperature and humidity sensors...
        // Should not be mandatory if fport10 is always used for singlepoint
        if ([0x1321, 0x1222, 0x1422].includes(arrayToUint16(bytes, 0, false))) {
            decode.devtype = {}
            decode.devtype = getDevtype(arrayToUint16(bytes, 0, false));
            decode.cnt = arrayToUint16(bytes, 2, false, false);
            decode.devstat = []
            decode.devstat = getDevstat(bytes[4])
            decode.bat = bytes[5];

            decode.temp = (arrayConverter(bytes, 6, 2, false, true) / 100.0).toString();
            if (decode.devtype.Output == "Float") {
                decode.data = (arrayToFloat(bytes, 8, false)).toString();
            }
            else {
                decode.data = (arrayToInt32(bytes, 8, false) / 100.0).toString();
            }
            return true;
        }
        
    }
    return false;
}
function getDevstat(u8devstat) {
    var devstat;
    devstat = [];
    var DevstatDict = {
        7: "SnsErr",
        6: "CfgErr",
        5: "MiscErr",
        4: "Condition",
        3: "PrelPhase"
    }

    if (u8devstat === 0x00) {
        devstat.ok = 'ok';
    }
    else {
       
        for (var i = 7; i >= 3; i--) {
            if (bitfield(u8devstat, i) === 1) {
                devstat.push(DevstatDict[i]);
            }
        }
    }
    return devstat;
         }
function getDevtype(u16devtype) {
    var devtype = {};

    var SwPlatformDict = {
        0: "Error",
        1: "Platform_21"
    }
    var SensorDict = {
        0: "Error",
        1: "Vibration",
        2: "Temperature",
        3: "Pressure",
        4: "Humidity"
    }
    var SensorUnitDict = {
        0: "Error",
        1: "g",
        2: "°C",
        3: "Bar",
        4: "%"
    }
    var WirelessDict = {
        0: "Error",
        1: "BLE",
        2: "BLE/LoRaWAN",
    }
    var OutputDict = {
        0: "Error",
        1: "Float",
        2: "Integer"
    }
    devtype.Platform = SwPlatformDict[((u16devtype >> 12) & 0x0F)];
    devtype.Sensor = SensorDict[((u16devtype >> 8) & 0x0F)];
    devtype.Wireless = WirelessDict[((u16devtype >> 4) & 0x0F)];
    devtype.Output = OutputDict[(u16devtype & 0x0F)];
    devtype.Unit = SensorUnitDict[((u16devtype >> 8) & 0x0F)];
    return devtype;
}
function arrayToString(arr, offset = 0, size = arr.length - offset) {
    var text = ''
    text = arr.slice(offset, offset+size).map(byte => byte.toString(16)).join(',');

    return text
}
function arrayToAscii(arr, offset=0, size = arr.length - offset) {
    var text = ''
    for (var i = 0; i < size; i++) {
        text += String.fromCharCode(arr[i + offset]);
    }
    return text
}
function round(value, decimal) {
    return Math.round(value * Math.pow(10, decimal)) / Math.pow(10, decimal);

}
function hexToFloat(hex) {
    var s = hex >> 31 ? -1 : 1;
    var e = (hex >> 23) & 0xFF;
    return s * (hex & 0x7fffff | 0x800000) * 1.0 / Math.pow(2, 23) * Math.pow(2, (e - 127))
}
function arrayToUint32(arr, offset, littleEndian = true) {
    return (arrayConverter(arr, offset, 4, littleEndian, false));
}
function arrayToUint16(arr, offset, littleEndian = true) {
    return (arrayConverter(arr, offset, 2, littleEndian,false));
}
function arrayToInt32(arr, offset, littleEndian = true) {
    return (arrayConverter(arr, offset, 4, littleEndian, true));
}
function arrayToInt16(arr, offset, littleEndian = true) {
    return (arrayConverter(arr, offset, 2, littleEndian, true));
}
function arrayToFloatOld(arr, offset, littleEndian = true) {
    return hexToFloat(arrayConverter(arr, offset, 4, littleEndian,false));
}

function arrayToFloat(arr, offset, littleEndian = true) {
    let view = new DataView(new ArrayBuffer(4));
    for (let i = 0; i < 4; i++) {
        view.setUint8(i, arr[i + offset]);
    }
    return view.getFloat32(0, littleEndian);
}


function arrayConverter(arr, offset, size, littleEndian = true, isSigned = false) {
    // Concatenate bytes from arr[offset] to arr[offset+size] and return the value as decimal. 
    // The reading sense depends on endianess, by default littleEndian (from right to left)
    var outputval = 0;
    for (var i = 0; i < size; i++) {
        if (littleEndian == false) {
            outputval |= arr[offset + size - i - 1] << (i * 8);
        }
        else {
            outputval |= arr[i + offset] << (i * 8);
        }
    }
    if (isSigned && (Math.pow(2, (size) * 8 - 1) < outputval))
        outputval = outputval - Math.pow(2, size * 8);

    return outputval;
}

function bitfield(val, offset) {
    return (val >> offset) & 0x01;
}

function dBDecompression(val) {
    return Math.pow(10, ((val * 0.3149606) - 49.0298) / 20);
}
