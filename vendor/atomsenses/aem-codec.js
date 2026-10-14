function decodeUplink(input) {
    return {
        data: Decode(input.fPort, input.bytes, input.variables),
    };
}

function Decode(fPort, bytes, variables) {
    var hexString = bytesToHex(bytes);
    // var hexString = bytes;

    // 验证输入是否为有效的十六进制字符串
    if (!/^[0-9a-fA-F]+$/.test(hexString)) {
        return {
            message: "Invalid hex string",
        };
    }

    // 确保字符串长度为偶数（因为每个字节对应2个十六进制字符）
    if (hexString.length % 2 !== 0) {
        return {
            message: "Hex string length must be an even number",
        };
    }

    // 初始化对象来存储键值对
    var data = {};

    // 遍历数据，根据不同格式进行处理
    var i = 0;
    while (i < hexString.length) {
        var type = hexString.substring(i, i + 2);
        if (type === "05") {
            // 处理05格式的数据（05xxxxyyyy，共10个字符）
            var endIndex = i + 10;
            // 检查是否有足够的字符
            if (endIndex > hexString.length) {
                // 如果不够，只解析已有的部分
                endIndex = hexString.length;
            }
            
            var group = hexString.substring(i, endIndex);
            var distanceHex = group.substring(2, 6).toLowerCase();
            var statusHex = group.substring(6, 10).toLowerCase();
            
            if (distanceHex !== "ffff") {
                data.Range = parseInt(distanceHex, 16); // 距离值，单位mm
            }
            
            // 解析垃圾桶状态
            if (statusHex === "0000") {
                data.BinStatus = "Empty";
            } else if (statusHex === "0001") {
                data.BinStatus = "Full";
            } else {
                data.BinStatus = "Unknown";
            }
            
            i = endIndex;
        } else {
            // 处理其他格式的数据（abxxxxxxxx，共10个字符）
            var endIndex = Math.min(i + 10, hexString.length);
            var group = hexString.substring(i, endIndex);
            var value = group.substring(2, 10).toLowerCase();
            var value2 = group.substring(6, 10).toLowerCase();
            if (value !== "ffffffff" && value2 !== "ffff") {
                switch (type) {
                    case "01":
                        data.LeakStatus = (parseInt(value.substring(6, 8), 16) === 1) ? "1" : "0";
                        break;
                    case "02":
                        data.Temperature = Number(hexToFloat32(value).toFixed(3));
                        break;
                    case "03":
                        data.Humidity = Number(hexToFloat32(value).toFixed(3));
                        break;
                    case "04":
                        data.Light = parseInt(value2, 16) / 100;
                        break;
                        case "10":
                        // 处理氮含量数据 (N)，单位直接附加在数值后
                        data.Nitrogen = parseInt(value.substring(4, 8), 16) + " mg/kg";
                        break;
                    case "11":
                        // 处理磷含量数据 (P)，单位直接附加在数值后
                        data.Phosphorus = parseInt(value.substring(4, 8), 16) + " mg/kg";
                        break;
                    case "12":
                        // 处理钾含量数据 (K)，单位直接附加在数值后
                        data.Potassium = parseInt(value.substring(4, 8), 16) + " mg/kg";
                        break;
                    case "06":
                        // 处理风速数据
                        var windSpeedHex = group.substring(2, 6);
                        var windLevelHex = group.substring(6, 10);
                        data.WindSpeed = parseFloat(parseInt(windSpeedHex, 16) / 10).toFixed(1) + " m/s";
                        data.WindLevel = parseInt(windLevelHex, 16);
                        break;
                    case "07":
                        // 处理风向数据
                        var windDirectionHex = group.substring(2, 6);
                        var windDirection16Hex = group.substring(6, 10);
                        data.WindDirection = parseFloat(parseInt(windDirectionHex, 16) / 10).toFixed(1) + "°";
                        data.WindDirection16 = parseInt(windDirection16Hex, 16);
                        break;
                    case "20":
                        data.Voltage = Number(hexToFloat32(value).toFixed(3));
                        break;
                    case "22":
                        data.PIR = value2 === "0001" ? "ON" : "OFF";
                        break;                        
                    default:
                        break;
                }
            }
            i = endIndex;
        }
    }
    return data;
}

function bytesToHex(bytes) {
    var hexString = "";
    for (var i = 0; i < bytes.length; i++) {
        var hex = bytes[i].toString(16);
        hex = hex.length === 1 ? "0" + hex : hex;
        hexString += hex;
    }
    return hexString;
}

function hexToFloat32(hex) {
    var int = parseInt(hex, 16);
    var byte1 = (int >> 24) & 0xff;
    var byte2 = (int >> 16) & 0xff;
    var byte3 = (int >> 8) & 0xff;
    var byte4 = int & 0xff;
    var sign = (byte1 >> 7) & 0x01;
    var exponent = ((byte1 & 0x7f) << 1) | (byte2 >> 7);
    var mantissa = ((byte2 & 0x7f) << 16) | (byte3 << 8) | byte4;
    if (exponent === 0 && mantissa === 0) return sign ? -0.0 : 0.0;
    if (exponent === 0xff) return mantissa ? NaN : (sign ? -Infinity : Infinity);
    var significand = 1 + mantissa / 0x800000;
    return (sign ? -1 : 1) * Math.pow(2, exponent - 127) * significand;
}

function hexToFloat32_IE9(hex) {
    // 将十六进制字符串转换为32位整数
    var int = parseInt(hex, 16);

    // 将32位整数拆分为8位字节
    var byte1 = (int >> 24) & 0xff;
    var byte2 = (int >> 16) & 0xff;
    var byte3 = (int >> 8) & 0xff;
    var byte4 = int & 0xff;

    // 将字节按照 IEEE 754 标准组装为浮点数
    var sign = (byte1 >> 7) & 1;
    var exponent = ((byte1 & 0x7f) << 1) | (byte2 >> 7);
    var mantissa = ((byte2 & 0x7f) << 16) | (byte3 << 8) | byte4;

    var floatValue;
    if (exponent === 0 && mantissa === 0) {
        // 零值
        floatValue = 0;
    } else {
        var bias = 127;
        var power = Math.pow(2, exponent - bias);
        floatValue = Math.pow(-1, sign) * power * (1 + mantissa / Math.pow(2, 23));
    }

    return floatValue;
}

function calculateBattery(voltage) {
    if (voltage > 3.6) {
        return 100;
    }

    return parseFloat(
        (((voltage - 2.8) / (3.6 - 2.8).toFixed(3)) * 100).toFixed(1)
    );
}