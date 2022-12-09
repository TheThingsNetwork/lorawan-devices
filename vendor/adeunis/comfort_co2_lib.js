"use strict";
Object.prototype.readInt8 = function (offset) {
    var buffer = this;
    var a = buffer[offset];
    if ((a & 0x80) > 0) {
        return a - 0x100;
    }
    return a;
};
Object.prototype.readUInt8 = function (offset) {
    var buffer = this;
    return buffer[offset];
};
Object.prototype.readInt16BE = function (offset) {
    var buffer = this;
    var a = buffer[offset] << 8 | buffer[offset + 1];
    if ((a & 0x8000) > 0) {
        return a - 0x10000;
    }
    return a;
};
Object.prototype.readUInt16BE = function (offset) {
    var buffer = this;
    return buffer[offset] << 8 | buffer[offset + 1];
};
Object.prototype.readInt32BE = function (offset) {
    var buffer = this;
    var a = (buffer[offset] << 24 | buffer[offset + 1] << 16 | buffer[offset + 2] << 8 | buffer[offset + 3]) >>> 0;
    if ((a & 0x80000000) > 0) {
        return a - 0x10000000;
    }
    return a;
};
Object.prototype.readUInt32BE = function (offset) {
    var buffer = this;
    return (buffer[offset] << 24 | buffer[offset + 1] << 16 | buffer[offset + 2] << 8 | buffer[offset + 3]) >>> 0;
};
if (typeof module !== 'undefined') {
    module.exports = codec;
}
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    global.codec = codec;
}
var codec;
(function (codec) {
    var PartialDecodingReason;
    (function (PartialDecodingReason) {
        PartialDecodingReason[PartialDecodingReason["NONE"] = 0] = "NONE";
        PartialDecodingReason[PartialDecodingReason["MISSING_NETWORK"] = 1] = "MISSING_NETWORK";
        PartialDecodingReason[PartialDecodingReason["MISSING_CONFIGURATION"] = 2] = "MISSING_CONFIGURATION";
    })(PartialDecodingReason = codec.PartialDecodingReason || (codec.PartialDecodingReason = {}));
})(codec || (codec = {}));
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var codec;
(function (codec) {
    var ContentImpl = (function () {
        function ContentImpl(type) {
            if (type === void 0) { type = 'Unknown'; }
            this.type = type;
            this.partialDecoding = codec.PartialDecodingReason.NONE;
        }
        ContentImpl.merge = function () {
            var contents = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                contents[_i] = arguments[_i];
            }
            if (!contents || contents.length === 0) {
                return null;
            }
            return Object.assign.apply(Object, __spreadArray([new ContentImpl(contents[0].type)], contents, false));
        };
        ContentImpl.prototype.merge = function () {
            var contents = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                contents[_i] = arguments[_i];
            }
            return ContentImpl.merge.apply(ContentImpl, __spreadArray([this], contents, false));
        };
        return ContentImpl;
    }());
    codec.ContentImpl = ContentImpl;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var PlateformCommonUtils = (function () {
        function PlateformCommonUtils() {
        }
        PlateformCommonUtils.getProductModeText = function (value) {
            switch (value) {
                case 0:
                    return 'PARK';
                case 1:
                    return 'PRODUCTION';
                case 2:
                    return 'TEST';
                case 3:
                    return 'DEAD';
                default:
                    return '';
            }
        };
        return PlateformCommonUtils;
    }());
    codec.PlateformCommonUtils = PlateformCommonUtils;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var GenericStatusByteParser = (function () {
        function GenericStatusByteParser() {
            this.deviceType = 'any';
            this.frameCode = 0;
        }
        GenericStatusByteParser.prototype.parseFrame = function (payload, configuration) {
            var statusContent = {};
            statusContent['frameCounter'] = (payload[1] & 0xe0) >> 5;
            statusContent['hardwareError'] = false;
            statusContent['lowBattery'] = Boolean(payload[1] & 0x02);
            statusContent['configurationDone'] = Boolean(payload[1] & 0x01);
            return statusContent;
        };
        return GenericStatusByteParser;
    }());
    codec.GenericStatusByteParser = GenericStatusByteParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var ComfortCo20x10Parser = (function () {
        function ComfortCo20x10Parser() {
            this.deviceType = 'comfortCo2';
            this.frameCode = 0x10;
        }
        ComfortCo20x10Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x10 Comfort CO2 configuration' };
            appContent['dailyFrameActivated'] = (Boolean)((payload.readUInt16BE(2) === 0) ? false : true),
                appContent['numberOfHistorizationBeforeSending'] = payload.readUInt16BE(4),
                appContent['numberOfSamplingBeforeHistorization'] = payload.readUInt16BE(6),
                appContent['samplingPeriod'] = { 'unit': 's', 'value': payload.readUInt16BE(8) * 2 },
                appContent['redundantSamples'] = payload.readUInt8(10),
                appContent['calculatedPeriodRecording'] = { 'unit': 's',
                    'value': payload.readUInt16BE(8) * payload.readUInt16BE(6) * 2 },
                appContent['calculatedSendingPeriod'] = { 'unit': 's',
                    'value': payload.readUInt16BE(8) * payload.readUInt16BE(6) * payload.readUInt16BE(4) * 2 };
            if (payload.length >= 12) {
                appContent['blackOutDuration'] = { 'unit': 'h', 'value': payload.readUInt8(11) };
                appContent['blackOutStartTime'] = { 'unit': 'h', 'value': payload.readUInt8(12) };
            }
            return appContent;
        };
        return ComfortCo20x10Parser;
    }());
    codec.ComfortCo20x10Parser = ComfortCo20x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var ComfortCo20x30Parser = (function () {
        function ComfortCo20x30Parser() {
            this.deviceType = 'comfortCo2';
            this.frameCode = 0x30;
        }
        ComfortCo20x30Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x30 Comfort CO2 Daily frame' };
            if (payload[1] & 0x04) {
                var myDate = new Date((payload.readUInt32BE(19) + 1356998400) * 1000);
                appContent['timestamp'] = myDate.toJSON().replace('Z', '');
            }
            appContent['icone'] = payload.readUInt8(2);
            appContent['qaiRedDuration'] = { 'unit': 'min', 'value': (payload.readUInt8(3) * 10) };
            appContent['temperatureMax'] = { 'unit': '\u00B0' + 'C', 'value': payload.readInt16BE(4) / 10 };
            appContent['co2Max'] = { 'unit': 'ppm', 'value': payload.readUInt16BE(6) };
            appContent['humidityMax'] = { 'unit': '%', 'value': payload.readUInt8(8) };
            appContent['temperatureMin'] = { 'unit': '\u00B0' + 'C', 'value': payload.readInt16BE(9) / 10 };
            switch (payload.length) {
                case 11:
                    break;
                case 19:
                case 23:
                    appContent['co2Min'] = { 'unit': 'ppm', 'value': payload.readUInt16BE(11) };
                    appContent['humidityMin'] = { 'unit': '%', 'value': payload.readUInt8(13) };
                    appContent['temperatureAverage'] = { 'unit': '\u00B0' + 'C', 'value': payload.readInt16BE(14) / 10 };
                    appContent['co2Average'] = { 'unit': 'ppm', 'value': payload.readUInt16BE(16) };
                    appContent['humidityAverage'] = { 'unit': '%', 'value': payload.readUInt8(18) };
                    break;
                default:
                    appContent.partialDecoding = codec.PartialDecodingReason.MISSING_NETWORK;
                    break;
            }
            return appContent;
        };
        return ComfortCo20x30Parser;
    }());
    codec.ComfortCo20x30Parser = ComfortCo20x30Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var ComfortCo20x6aParser = (function () {
        function ComfortCo20x6aParser() {
            this.deviceType = 'comfortCo2';
            this.frameCode = 0x6a;
        }
        ComfortCo20x6aParser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x6a Comfort CO2 data' };
            var payloadLength = (payload[1] & 0x04) ? payload.length - 4 : payload.length;
            if (payload[1] & 0x04) {
                var myDate = new Date((payload.readUInt32BE(payloadLength) + 1356998400) * 1000);
                appContent['timestamp'] = myDate.toJSON().replace('Z', '');
            }
            var rawValue;
            var temp = [], humidity = [], CO2 = [];
            for (var offset = 2; offset < payloadLength; offset += 5) {
                rawValue = payload.readInt16BE(offset);
                temp.push(rawValue / 10);
                rawValue = payload.readUInt8(offset + 2);
                humidity.push(rawValue);
                rawValue = payload.readUInt16BE(offset + 3);
                CO2.push(rawValue);
            }
            appContent['decodingInfo'] = 'values: [t=0, t-1, t-2, ...]';
            appContent['temperature'] = { 'unit': '\u00B0' + 'C', 'values': temp };
            appContent['humidity'] = { 'unit': '%', 'values': humidity };
            appContent['co2'] = { 'unit': 'ppm', 'values': CO2 };
            return appContent;
        };
        return ComfortCo20x6aParser;
    }());
    codec.ComfortCo20x6aParser = ComfortCo20x6aParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var ComfortCo20x6bParser = (function () {
        function ComfortCo20x6bParser() {
            this.deviceType = 'comfortCo2';
            this.frameCode = 0x6b;
        }
        ComfortCo20x6bParser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x6b Comfort CO2 alarm' };
            var payloadLength = (payload[1] & 0x04) ? payload.length - 4 : payload.length;
            if (payload[1] & 0x04) {
                var myDate = new Date((payload.readUInt32BE(payloadLength) + 1356998400) * 1000);
                appContent['timestamp'] = myDate.toJSON().replace('Z', '');
            }
            appContent['alarmTemperature'] = {
                'alarmStatus': (Boolean(payload[2] & 0x10)) ? 'active' : 'inactive',
                'temperature': { 'unit': '\u00B0' + 'C', 'value': payload.readInt16BE(3) / 10 }
            };
            appContent['alarmHumidity'] = {
                'alarmStatus': (Boolean(payload[2] & 0x01)) ? 'active' : 'inactive',
                'humidity': { 'unit': '%', 'value': payload.readUInt8(5) }
            };
            appContent['alarmCo2'] = {
                'alarmStatus': (Boolean(payload[2] & 0x20)) ? 'active' : 'inactive',
                'co2': { 'unit': 'ppm', 'value': payload.readInt16BE(6) }
            };
            return appContent;
        };
        return ComfortCo20x6bParser;
    }());
    codec.ComfortCo20x6bParser = ComfortCo20x6bParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var ComfortCo2StatusByteParser = (function () {
        function ComfortCo2StatusByteParser() {
            this.deviceType = 'comfortCo2';
            this.frameCode = 0;
        }
        ComfortCo2StatusByteParser.prototype.parseFrame = function (payload, configuration, network) {
            var statusContent = {};
            var parser = new codec.GenericStatusByteParser();
            statusContent = parser.parseFrame(payload, configuration);
            statusContent['configurationInconsistency'] = Boolean(payload[1] & 0x08);
            statusContent['timestamp'] = Boolean(payload[1] & 0x04);
            return { 'status': statusContent };
        };
        return ComfortCo2StatusByteParser;
    }());
    codec.ComfortCo2StatusByteParser = ComfortCo2StatusByteParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var CommonDecoder = (function () {
        function CommonDecoder() {
        }
        CommonDecoder.prototype.decode = function (payload) {
            var _this = this;
            var frameCode = payload[0];
            var configuration;
            if (frameCode === 0x10) {
                configuration = payload;
            }
            var activeParsers = this.getActiveParsers(frameCode);
            var partialContents = activeParsers.map(function (p) {
                var partialContent;
                try {
                    partialContent = p.parseFrame(payload, configuration, 'unknown', _this.deviceType);
                }
                catch (error) {
                    partialContent = { 'error': error.toString() };
                }
                return partialContent;
            });
            if (activeParsers.every(function (p) { return p.frameCode < 0; })) {
                partialContents.push({ type: 'Unsupported' });
            }
            var content = Object.assign.apply(Object, __spreadArray([{}], partialContents, false));
            var typestr = content['type'];
            delete content['type'];
            content = Object.assign({ type: typestr }, content);
            return content;
        };
        CommonDecoder.prototype.getActiveParsers = function (frameCode) {
            var activeParsers = [];
            return activeParsers;
        };
        return CommonDecoder;
    }());
    codec.CommonDecoder = CommonDecoder;
})(codec || (codec = {}));
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var codec;
(function (codec) {
    var Decoder = (function (_super) {
        __extends(Decoder, _super);
        function Decoder() {
            var _this = _super.call(this) || this;
            _this.deviceType = 'comfortCo2';
            return _this;
        }
        Decoder.prototype.getActiveParsers = function (frameCode) {
            var activeParsers = [];
            var statusByteParsers = new codec.ComfortCo2StatusByteParser();
            var dataParser;
            switch (frameCode) {
                case 0x10:
                    dataParser = new codec.ComfortCo20x10Parser();
                    break;
                case 0x30:
                    dataParser = new codec.ComfortCo20x30Parser();
                    break;
                case 0x6a:
                    dataParser = new codec.ComfortCo20x6aParser();
                    break;
                case 0x6b:
                    dataParser = new codec.ComfortCo20x6bParser();
                    break;
                default:
                    return activeParsers;
            }
            activeParsers = activeParsers.concat(statusByteParsers);
            activeParsers = activeParsers.concat(dataParser);
            return activeParsers;
        };
        return Decoder;
    }(codec.CommonDecoder));
    codec.Decoder = Decoder;
})(codec || (codec = {}));
function decodeUplink(input) {
    var decoder = new codec.Decoder();
    return {
        data: {
            bytes: decoder.decode(input.bytes)
        },
        warnings: [],
        errors: []
    };
}
