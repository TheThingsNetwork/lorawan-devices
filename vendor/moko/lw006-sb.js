var turnOffMode = ["Bluetooth", "LoRa", "Button", "Low Battery"];
var deviceMode = ["Standby Mode", "Timing Mode", "Periodic Mode", "Motion Mode On Stationary", "Motion Mode On Start", "Motion Mode In Trip", "Motion Mode On End"];
var deviceStatus = ["No", "Man Down", "Downlink", "Alert", "SOS"];
var lowPower = ["10%", "20%", "30%", "40%", "50%", "60%"];
var eventType = ["Motion On Start", "Motion In Trip", "Motion On End", "Man Down Start", "Man Down End", "SOS Start", "SOS End", "Alert Start", "Alert End", "Ephemeris Start", "Ephemeris End", "Downlink Report"];
var posType = ["Working Mode", "Man Down", "Downlink", "Alert", "SOS"];
var posDataSign = ["WIFI Pos Success", "BLE Pos Success", "LR1110 GPS Pos Success", "L76 Pos Success", "WIFI Pos Success(No Data)", "LR1110 GPS Pos Success(No Data)"];
var fixFailedReason = ["WIFI Pos Timeout", "WIFI Pos Tech Timeout", "WIFI Pos Failed By BLE Adv", "BLE Pos Timeout", "BLE Pos Tech Timeout", "BLE Pos Failed By BLE Adv", "GPS Pos Timeout", "GPS Pos Tech Timeout", "LR1110 GPS Pos Timeout", "LR1110 GPS Pos Ephemeris Old"
    , "L76 GPS Pos Not Enough DPOP Limit", "Interrupted by the end of the Motion", "Interrupted by the start of the Motion", "Interrupted by ManDown Pos", "Interrupted by Downlink Pos", "Interrupted by Alarm"];


function Decoder(bytes, port) {
    var dev_info = {};
    dev_info.port = port;
    if (port == 1 || port == 2 || port == 3 || port == 4
        || port == 5 || port == 8 || port == 9) {
        dev_info.charging_status = bytes[0] & 0x80 ? "charging" : "no charging";
        dev_info.batt_level = (bytes[0] & 0x7F) + "%";
    }
    if (port == 1) {
        // Device info
        var temperature = bytes[1];
        if (temperature > 0x80)
            dev_info.temperature = "-" + (0x100 - temperature) + "°C";
        else
            dev_info.temperature = temperature + "°C";
        var firmware_ver_major = (bytes[2] >> 6) & 0x03;
        var firmware_ver_minor = (bytes[2] >> 4) & 0x03;
        var firmware_ver_patch = bytes[2] & 0x0f;
        dev_info.firmware_version = "V" + firmware_ver_major + "." + firmware_ver_minor + "." + firmware_ver_patch;
        var hardware_ver_major = (bytes[3] >> 4) & 0x0f;
        var hardware_ver_patch = bytes[3] & 0x0f;
        dev_info.hardware_version = "V" + hardware_ver_major + "." + hardware_ver_patch;
        dev_info.device_mode = deviceMode[bytes[4]];
        dev_info.device_status = deviceStatus[bytes[5]];
        dev_info.vibration_status = bytes[6] > 0 ? "Abnormal" : "Normal";

    } else if (port == 2 || port == 3 || port == 4) {
        // 2:Turn off info;3:Heartbeat;4:LowPower;
        var temperature = bytes[1];
        if (temperature > 0x80)
            dev_info.temperature = "-" + (0x100 - temperature) + "°C";
        else
            dev_info.temperature = temperature + "°C";
        dev_info.current_time = parse_time(bytesToInt(bytes, 2, 4), bytes[6] * 0.5);
        dev_info.timestamp = get_timestamp(bytesToInt(bytes, 2, 4));
        dev_info.timezone = timezone_decode(bytes[6]);
        dev_info.device_mode = deviceMode[bytes[7]];
        dev_info.device_status = deviceStatus[bytes[8]];
        if (port == 2)
            dev_info.turn_off_mode = turnOffMode[bytes[9]];
        if (port == 4)
            dev_info.low_power_prompt = lowPower[bytes[9]];
        // dev_info.batt_v = bytesToInt(bytes, 1, 2) + "mV";
    } else if (port == 5) {
        // Event info
        dev_info.current_time = parse_time(bytesToInt(bytes, 1, 4), bytes[5] * 0.5);
        dev_info.timestamp = get_timestamp(bytesToInt(bytes, 1, 4));
        dev_info.timezone = timezone_decode(bytes[5]);
        dev_info.event_type = eventType[bytes[6]];
    } else if (port == 6) {
        // L76_GPS data
        dev_info.pos_type = posType[bytesToInt(bytes, 0, 2) >> 12];
        dev_info.age = bytesToInt(bytes, 0, 2) + "s";
        var latitude = Number(signedHexToInt(bytesToHexString(bytes, 2, 4)) * 0.0000001).toFixed(7) + '°';
        var longitude = Number(signedHexToInt(bytesToHexString(bytes, 6, 4)) * 0.0000001).toFixed(7) + '°';
        var podp = (bytes[10] & 0xFF) * 0.1;
        dev_info.latitude = latitude;
        dev_info.longitude = longitude;
    } else if (port == 7) {
        // Saved data
        dev_info.length = bytes[0] & 0xFF;
        var length = dev_info.length;
        if (length == 2) {
            dev_info.packet_sum = bytesToInt(bytes, 1, 2);
        } else {
            dev_info.current_time = parse_time(bytesToInt(bytes, 1, 4), bytes[5] * 0.5);
            dev_info.timestamp = get_timestamp(bytesToInt(bytes, 1, 4));
            dev_info.timezone = timezone_decode(bytes[5]);
            dev_info.data_port = bytes[6] & 0xFF;
            var data_len = length - 6;
            dev_info.data = bytesToHexString(bytes, 7, data_len).toUpperCase();
        }
    } else if (port == 8) {
        // Pos Success
        dev_info.age = bytesToInt(bytes, 1, 2) + "s";
        dev_info.pos_type = posType[bytes[3] >> 4];
        var pos_data_sign = bytes[3] & 0x0F;
        dev_info.pos_data_sign = posDataSign[pos_data_sign];
        dev_info.pos_data_sign_code = pos_data_sign;
        dev_info.device_mode = deviceMode[bytes[4] >> 4];
        dev_info.device_status = deviceStatus[bytes[4] & 0x0F];
        var pos_data_length = bytes[5] & 0xFF;
        dev_info.pos_data_length = pos_data_length;
        if ((pos_data_sign == 0 || pos_data_sign == 1) && pos_data_length > 0) {
            // WIFI BLE
            var datas = [];
            var count = pos_data_length / 7;
            var index = 6;
            for (var i = 0; i < count; i++) {
                var data = {};
                data.rssi = bytes[index++] - 256 + "dBm";
                data.mac = bytesToHexString(bytes, index, 6).toLowerCase();
                index += 6;
                datas.push(data);
            }
            dev_info.pos_data = datas;
        }
        if (pos_data_sign == 3 && pos_data_length > 0) {
            // L76 GPS
            var datas = [];
            var count = pos_data_length / 9;
            var index = 6;
            for (var i = 0; i < count; i++) {
                var data = {};
                var latitude = Number(signedHexToInt(bytesToHexString(bytes, index, 4)) * 0.0000001).toFixed(7) + '°';
                index += 4;
                var longitude = Number(signedHexToInt(bytesToHexString(bytes, index, 4)) * 0.0000001).toFixed(7) + '°';
                index += 4;
                var pdop =  Number(bytes[index++] & 0xFF * 0.1).toFixed(1);
                data.latitude = latitude;
                data.longitude = longitude;
                data.podp = podp;
                datas.push(data);
            }
            dev_info.pos_data = datas;
        }
    } else if (port == 9) {
        // Pos Failed
        dev_info.pos_type = posType[bytes[1]];
        dev_info.device_mode = deviceMode[bytes[2]];
        dev_info.device_status = deviceStatus[bytes[3]];
        var pos_data_sign = bytes[4] & 0x0F;
        dev_info.pos_data_sign = pos_data_sign;
        dev_info.failed_reason = fixFailedReason[pos_data_sign];
        if (pos_data_sign < 3) {
            var pos_data_length = bytes[5] & 0xFF;
            dev_info.pos_data_length = pos_data_length;
            // WIFI Failed
            var datas = [];
            var count = pos_data_length / 7;
            var index = 6;
            for (var i = 0; i < count; i++) {
                var data = {};
                data.rssi = bytes[index++] - 256 + "dBm";
                data.mac = bytesToHexString(bytes, index, 6).toLowerCase();
                index += 6;
                datas.push(data);
            }
            dev_info.pos_data = datas;
        } else if (pos_data_sign < 6) {
            var pos_data_length = bytes[5] & 0xFF;
            dev_info.pos_data_length = pos_data_length;
            // WIFI Failed
            var datas = [];
            var count = pos_data_length / 7;
            var index = 6;
            for (var i = 0; i < count; i++) {
                var data = {};
                data.rssi = bytes[index++] - 256 + "dBm";
                data.mac = bytesToHexString(bytes, index, 6).toLowerCase();
                index += 6;
                datas.push(data);
            }
            dev_info.pos_data = datas;
        } else if (pos_data_sign < 8) {
            // L76 GPS Failed
            var pdop = bytes[5] & 0xFF * 0.1;
            dev_info.pdop = pdop;
            if (pdop == 0xFF) {
                dev_info.pdop == "unknow";
            }
            var datas = [];
            var index = 6;
            for (var i = 0; i < 4; i++) {
                var data = bytesToHexString(bytes, index++, 1).toLowerCase();
                datas.push(data);
            }
            dev_info.pos_data = datas;
        } else if (pos_data_sign < 12) {
            // LR1110 GPS Failed
            var datas = [];
            var index = 6;
            for (var i = 0; i < 4; i++) {
                var data = bytesToHexString(bytes, index++, 1).toLowerCase();
                datas.push(data);
            }
            dev_info.pos_data = datas;
        }
    }
    return dev_info;
}


function bytesToHexString(bytes, start, len) {
    var char = [];
    for (var i = 0; i < len; i++) {
        var data = bytes[start + i].toString(16);
        var dataHexStr = ("0x" + data) < 0x10 ? ("0" + data) : data;
        char.push(dataHexStr);
    }
    return char.join("");
}

function bytesToString(bytes, start, len) {
    var char = [];
    for (var i = 0; i < len; i++) {
        char.push(String.fromCharCode(bytes[start + i]));
    }
    return char.join("");
}

function bytesToInt(bytes, start, len) {
    var value = 0;
    for (var i = 0; i < len; i++) {
        var m = ((len - 1) - i) * 8;
        value = value | bytes[start + i] << m;
    }
    // var value = ((bytes[start] << 24) | (bytes[start + 1] << 16) | (bytes[start + 2] << 8) | (bytes[start + 3]));
    return value;
}

function timezone_decode(tz) {
    var tz_str = "UTC";
    tz = tz > 128 ? tz - 256 : tz;
    if (tz < 0) {
        tz_str += "-";
        tz = -tz;
    } else {
        tz_str += "+";
    }

    if (tz < 20) {
        tz_str += "0";
    }

    tz_str += String(parseInt(tz / 2));
    tz_str += ":"

    if (tz % 2) {
        tz_str += "30"
    } else {
        tz_str += "00"
    }

    return tz_str;
}

function parse_time(timestamp, timezone) {
    timezone = timezone > 64 ? timezone - 128 : timezone;
    timestamp = timestamp + timezone * 3600;
    if (timestamp < 0) {
        timestamp = 0;
    }

    var d = new Date(timestamp * 1000);
    //d.setUTCSeconds(1660202724);

    var time_str = "";
    time_str += d.getUTCFullYear();
    time_str += "/";
    time_str += formatNumber(d.getUTCMonth() + 1);
    time_str += "/";
    time_str += formatNumber(d.getUTCDate());
    time_str += " ";

    time_str += formatNumber(d.getUTCHours());
    time_str += ":";
    time_str += formatNumber(d.getUTCMinutes());
    time_str += ":";
    time_str += formatNumber(d.getUTCSeconds());

    return time_str;
}

function get_timestamp(timestamp) {
    if (timestamp < 0) {
        timestamp = 0;
    }
    return timestamp * 1000;
}

function formatNumber(number) {
    return number < 10 ? "0" + number : number;
}

String.prototype.format = function () {
    if (arguments.length == 0)
        return this;
    for (var s = this, i = 0; i < arguments.length; i++)
        s = s.replace(new RegExp("\\{" + i + "\\}", "g"), arguments[i]);
    return s;
};

function signedHexToInt(hexStr) {
    var twoStr = parseInt(hexStr, 16).toString(2); // 将十六转十进制，再转2进制
    var bitNum = hexStr.length * 4; // 1个字节 = 8bit ，0xff 一个 "f"就是4位
    if (twoStr.length < bitNum) {
        while (twoStr.length < bitNum) {
            twoStr = "0" + twoStr;
        }
    }
    if (twoStr.substring(0, 1) == "0") {
        // 正数
        twoStr = parseInt(twoStr, 2); // 二进制转十进制
        return twoStr;
    }
    // 负数
    var twoStr_unsign = "";
    twoStr = parseInt(twoStr, 2) - 1; // 补码：(负数)反码+1，符号位不变；相对十进制来说也是 +1，但这里是负数，+1就是绝对值数据-1
    twoStr = twoStr.toString(2);
    twoStr_unsign = twoStr.substring(1, bitNum); // 舍弃首位(符号位)
    // 去除首字符，将0转为1，将1转为0   反码
    twoStr_unsign = twoStr_unsign.replace(/0/g, "z");
    twoStr_unsign = twoStr_unsign.replace(/1/g, "0");
    twoStr_unsign = twoStr_unsign.replace(/z/g, "1");
    twoStr = -parseInt(twoStr_unsign, 2);
    return twoStr;
}


function getData(hex) {
    var length = hex.length;
    var datas = [];
    for (var i = 0; i < length; i += 3) {
        var start = i;
        var end = i + 2;
        var data = parseInt("0x" + hex.substring(start, end));
        datas.push(data);
    }
    return datas;
}