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
    var a = (buffer[offset] << 8) | buffer[offset + 1];
    if ((a & 0x8000) > 0) {
        return a - 0x10000;
    }
    return a;
};
Object.prototype.readUInt16BE = function (offset) {
    var buffer = this;
    return (buffer[offset] << 8) | buffer[offset + 1];
};
Object.prototype.readInt32BE = function (offset) {
    var buffer = this;
    return (buffer[offset] << 24) | (buffer[offset + 1] << 16) | (buffer[offset + 2] << 8) | buffer[offset + 3];
};
Object.prototype.readUInt32BE = function (offset) {
    var buffer = this;
    return ((buffer[offset] << 24) | (buffer[offset + 1] << 16) | (buffer[offset + 2] << 8) | buffer[offset + 3]) >>> 0;
};
Object.prototype.readFloatBE = function (offset) {
    var buffer = this;
    var value = ((buffer[offset] << 24) | (buffer[offset + 1] << 16) | (buffer[offset + 2] << 8) | buffer[offset + 3]) >>> 0;
    return new Float32Array(new Uint32Array([value]).buffer)[0];
};
if (typeof module !== 'undefined') {
    module.exports = codec;
}
if (typeof process !== 'undefined' && process.env['NODE_ENV'] === 'test') {
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
    var Generic0x20Parser = (function () {
        function Generic0x20Parser() {
            this.deviceType = 'any';
            this.frameCode = 0x20;
        }
        Generic0x20Parser.prototype.parseFrame = function (payload, configuration, network, deviceType) {
            var appContent = { type: '0x20 Configuration' };
            switch (payload.length) {
                case 4:
                    appContent['loraAdr'] = Boolean(payload[2] & 0x01);
                    appContent['loraProvisioningMode'] = payload[3] === 0 ? 'ABP' : 'OTAA';
                    if (deviceType !== 'analog' && deviceType !== 'drycontacts' && deviceType !== 'pulse' && deviceType !== 'temp') {
                        appContent['loraDutycyle'] = payload[2] & 0x04 ? 'activated' : 'deactivated';
                        appContent['loraClassMode'] = payload[2] & 0x20 ? 'CLASS C' : 'CLASS A';
                    }
                    break;
                case 3:
                case 5:
                    appContent['sigfoxRetry'] = payload[2] & 0x03;
                    if (payload.length === 5) {
                        appContent['sigfoxDownlinkPeriod'] = { unit: 'm', value: payload.readInt16BE(3) };
                    }
                    break;
                default:
                    appContent.partialDecoding = codec.PartialDecodingReason.MISSING_NETWORK;
                    break;
            }
            return appContent;
        };
        return Generic0x20Parser;
    }());
    codec.Generic0x20Parser = Generic0x20Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Generic0x30Parser = (function () {
        function Generic0x30Parser() {
            this.deviceType = 'any';
            this.frameCode = 0x30;
        }
        Generic0x30Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x30 Keep alive' };
            return appContent;
        };
        return Generic0x30Parser;
    }());
    codec.Generic0x30Parser = Generic0x30Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Tic0x10Parser = (function () {
        function Tic0x10Parser() {
            this.deviceType = 'ticPmePmi|ticCbeLinkyMono|ticCbeLinkyTri';
            this.frameCode = 0x10;
        }
        Tic0x10Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x10 TIC configuration' };
            if (payload[5] === 2) {
                appContent['transmissionPeriodKeepAlive'] = { unit: 's', value: payload[2] * 20 };
                appContent['samplingPeriod'] = { unit: 's', value: payload.readUInt16BE(6) * 20 };
            }
            else {
                appContent['transmissionPeriodKeepAlive'] = { unit: 'm', value: payload[2] * 10 };
                appContent['samplingPeriod'] = { unit: 'm', value: payload.readUInt16BE(6) };
            }
            appContent['transmissionPeriodData'] = payload.readUInt16BE(3);
            appContent['productMode'] = codec.PlateformCommonUtils.getProductModeText(payload[5]);
            return appContent;
        };
        return Tic0x10Parser;
    }());
    codec.Tic0x10Parser = Tic0x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Tic0x49Parser = (function () {
        function Tic0x49Parser() {
            this.deviceType = 'ticPmePmi|ticCbeLinkyMono|ticCbeLinkyTri';
            this.frameCode = 0x49;
        }
        Tic0x49Parser.prototype.parseFrame = function (payload, configuration, network, deviceType) {
            var appContent = { type: '0x49 TIC data' };
            if (deviceType === 'ticCbeLinkyMono') {
                appContent = this.payloadToString(payload, 2, 2 + 12, appContent, 'ADCO');
                appContent = this.payloadToString(payload, 14, 14 + 4, appContent, 'OPTARIF');
                appContent = this.payloadToValue(payload, 18, 'Wh', appContent, 'BASE');
                appContent = this.payloadToValue(payload, 22, 'A', appContent, 'ISOUSC');
                appContent = this.payloadToValue(payload, 26, 'A', appContent, 'IINST');
                appContent = this.payloadToValue(payload, 30, 'A', appContent, 'IMAX');
                appContent = this.payloadToValue(payload, 34, 'VA', appContent, 'PAPP');
                appContent = this.payloadToValue(payload, 38, 'Wh', appContent, 'HCHC');
                appContent = this.payloadToValue(payload, 42, 'Wh', appContent, 'HCHP');
                appContent = this.payloadToString(payload, 46, 46 + 4, appContent, 'PTEC');
            }
            else if (deviceType === 'ticCbeLinkyTri') {
                appContent = this.payloadToString(payload, 2, 2 + 12, appContent, 'ADCO');
                appContent = this.payloadToValue(payload, 14, 'Wh', appContent, 'BASE');
                appContent = this.payloadToValue(payload, 18, 'A', appContent, 'IINST1');
                appContent = this.payloadToValue(payload, 22, 'A', appContent, 'IINST2');
                appContent = this.payloadToValue(payload, 26, 'A', appContent, 'IINST3');
                appContent = this.payloadToValue(payload, 30, 'A', appContent, 'IMAX1');
                appContent = this.payloadToValue(payload, 34, 'A', appContent, 'IMAX2');
                appContent = this.payloadToValue(payload, 38, 'A', appContent, 'IMAX3');
                appContent = this.payloadToValue(payload, 42, 'W', appContent, 'PMAX');
                appContent = this.payloadToValue(payload, 46, 'VA', appContent, 'PAPP');
            }
            else if (deviceType === 'ticPmePmi') {
                appContent = this.payloadToDate(payload, 2, deviceType, appContent, 'DATE');
                appContent = this.payloadToValue(payload, 8, 'Wh', appContent, 'EA_s');
                appContent = this.payloadToValue(payload, 12, 'varh', appContent, 'ER+_s');
                appContent = this.payloadToValue(payload, 16, 'varh', appContent, 'ER-_s');
                appContent = this.payloadToValue(payload, 20, 'VAh', appContent, 'EAPP_s');
                appContent = this.payloadToString(payload, 24, 24 + 3, appContent, 'PTCOUR1');
                appContent = this.payloadToValue(payload, 27, 'kWh', appContent, 'EAP_s');
                appContent = this.payloadToValue(payload, 31, 'kvarh', appContent, 'ER+P_s');
                appContent = this.payloadToValue(payload, 35, 'kvarh', appContent, 'ER-P_s');
                appContent = this.payloadToValue(payload, 39, 'kWh', appContent, 'EaP-1_s');
                appContent = this.payloadToValue(payload, 43, 'kvarh', appContent, 'ER+P-1_s');
                appContent = this.payloadToValue(payload, 47, 'kvarh', appContent, 'ER-P-1_s');
            }
            return appContent;
        };
        Tic0x49Parser.prototype.payloadToString = function (payload, start, end, appContent, label) {
            var charCode = [];
            for (var i = start; i < end; i++) {
                if (payload[i] !== 0x00) {
                    charCode.push(payload[i]);
                }
            }
            var str = String.fromCharCode.apply(String, charCode);
            if (str.length > 0) {
                appContent["".concat(label)] = str;
            }
            else {
                appContent["".concat(label, "status")] = 'notFound';
            }
            return appContent;
        };
        Tic0x49Parser.prototype.payloadToValue = function (payload, start, unit, appContent, label) {
            var val = payload.readUInt32BE(start);
            if (val !== 0x80000000) {
                appContent["".concat(label)] = { unit: unit, value: val };
            }
            else {
                appContent["".concat(label, "status")] = 'notFound';
            }
            return appContent;
        };
        Tic0x49Parser.prototype.p2d = function (val) {
            return ('0' + val).slice(-2);
        };
        Tic0x49Parser.prototype.payloadToDate = function (payload, start, deviceType, appContent, label) {
            var str = '2000-01-01T00:00:00';
            if (deviceType === 'ticPmePmi') {
                str =
                    2000 +
                        payload[start + 2] +
                        '-' +
                        this.p2d(payload[start + 1]) +
                        '-' +
                        this.p2d(payload[start + 0]) +
                        'T' +
                        this.p2d(payload[start + 3]) +
                        ':' +
                        this.p2d(payload[start + 4]) +
                        ':' +
                        this.p2d(payload[start + 5]);
            }
            if (str !== '2000-01-01T00:00:00') {
                appContent["".concat(label)] = str;
            }
            else {
                appContent["".concat(label, "status")] = 'notFound';
            }
            return appContent;
        };
        return Tic0x49Parser;
    }());
    codec.Tic0x49Parser = Tic0x49Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Tic0x4aParser = (function () {
        function Tic0x4aParser() {
            this.deviceType = 'ticPmePmi|ticCbeLinkyMono|ticCbeLinkyTri';
            this.frameCode = 0x4a;
        }
        Tic0x4aParser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x4a TIC alarm' };
            appContent['label'] = this.payloadToString(payload, 2, 12);
            appContent['alarmType'] = this.getAlarmTypeText(payload[12]);
            appContent['value'] = this.payloadToString(payload, 13, payload.length);
            return appContent;
        };
        Tic0x4aParser.prototype.getAlarmTypeText = function (value) {
            switch (value) {
                case 0:
                    return 'manualTrigger';
                case 1:
                    return 'labelAppearance';
                case 2:
                    return 'labelDisappearance';
                case 3:
                    return 'highTreshold';
                case 4:
                    return 'lowTreshold';
                case 5:
                    return 'endThresholdAlarm';
                case 6:
                    return 'deltaPositive';
                case 7:
                    return 'deltaNegative';
                default:
                    return '';
            }
        };
        Tic0x4aParser.prototype.payloadToString = function (payload, start, end) {
            var charCode = [];
            for (var i = start; i < end; i++) {
                if (payload[i] !== 0x00) {
                    charCode.push(payload[i]);
                }
            }
            var str = String.fromCharCode.apply(String, charCode);
            return str.length > 0 ? str : 'notFound';
        };
        return Tic0x4aParser;
    }());
    codec.Tic0x4aParser = Tic0x4aParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var TicStatusByteParser = (function () {
        function TicStatusByteParser() {
            this.deviceType = 'ticPmePmi|ticCbeLinkyMono|ticCbeLinkyTri';
            this.frameCode = 0;
        }
        TicStatusByteParser.prototype.parseFrame = function (payload, configuration, network) {
            var parser = new codec.GenericStatusByteParser();
            var statusContent = parser.parseFrame(payload, configuration);
            statusContent['configurationInconsistency'] = Boolean(payload[1] & 0x08);
            statusContent['readError'] = Boolean(payload[1] & 0x10);
            return { status: statusContent };
        };
        return TicStatusByteParser;
    }());
    codec.TicStatusByteParser = TicStatusByteParser;
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
                    partialContent = { error: error.toString() };
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
            _this.deviceType = 'ticPmePmi';
            return _this;
        }
        Decoder.prototype.getActiveParsers = function (frameCode) {
            var activeParsers = [];
            var statusByteParsers = new codec.TicStatusByteParser();
            var dataParser;
            switch (frameCode) {
                case 0x10:
                    dataParser = new codec.Tic0x10Parser();
                    break;
                case 0x49:
                    dataParser = new codec.Tic0x49Parser();
                    break;
                case 0x4a:
                    dataParser = new codec.Tic0x4aParser();
                    break;
                case 0x20:
                    dataParser = new codec.Generic0x20Parser();
                    break;
                case 0x30:
                    dataParser = new codec.Generic0x20Parser();
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
            bytes: decoder.decode(input.bytes),
        },
        warnings: [],
        errors: [],
    };
}
