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
    var GenericStatusByteExtParser = (function () {
        function GenericStatusByteExtParser() {
            this.deviceType = 'any';
            this.frameCode = 0;
        }
        GenericStatusByteExtParser.prototype.parseFrame = function (payload, configuration) {
            var statusContent = {};
            var parser = new codec.GenericStatusByteParser();
            statusContent = parser.parseFrame(payload, configuration);
            statusContent['configurationInconsistency'] = Boolean(payload[1] & 0x08);
            return { 'status': statusContent };
        };
        return GenericStatusByteExtParser;
    }());
    codec.GenericStatusByteExtParser = GenericStatusByteExtParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Motion0x10Parser = (function () {
        function Motion0x10Parser() {
            this.deviceType = 'motion';
            this.frameCode = 0x10;
        }
        Motion0x10Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x10 Motion configuration' };
            appContent['transmissionPeriodKeepAlive'] = { 'unit': 's', 'value': payload.readUInt16BE(2) * 10 },
                appContent['numberOfHistorizationBeforeSending'] = payload.readUInt16BE(4),
                appContent['numberOfSamplingBeforeHistorization'] = payload.readUInt16BE(6),
                appContent['samplingPeriod'] = { 'unit': 's', 'value': payload.readUInt16BE(8) * 2 },
                appContent['presenceDetectorInhibition'] = { 'unit': 's', 'value': payload.readUInt16BE(10) * 10 },
                appContent['calculatedPeriodRecording'] = { 'unit': 's',
                    'value': payload.readUInt16BE(8) * payload.readUInt16BE(6) * 2 },
                appContent['calculatedSendingPeriod'] = { 'unit': 's',
                    'value': payload.readUInt16BE(8) * payload.readUInt16BE(6) * payload.readUInt16BE(4) * 2 };
            return appContent;
        };
        return Motion0x10Parser;
    }());
    codec.Motion0x10Parser = Motion0x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Motion0x4eParser = (function () {
        function Motion0x4eParser() {
            this.deviceType = 'motion';
            this.frameCode = 0x4e;
        }
        Motion0x4eParser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x4e Motion data' };
            var counters = [], luminosities = [];
            appContent['globalCounterValue'] = payload.readUInt16BE(2);
            for (var offset = 4; offset < payload.length; offset += 3) {
                counters.push(payload.readInt16BE(offset));
                luminosities.push(payload.readUInt8(offset + 2));
            }
            appContent['decodingInfo'] = 'counterValues/values: [t=0, t-1, t-2, ...]';
            appContent['counterValues'] = counters;
            appContent['luminosity'] = { 'unit': '\u0025', 'values': luminosities };
            return appContent;
        };
        return Motion0x4eParser;
    }());
    codec.Motion0x4eParser = Motion0x4eParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Motion0x4fParser = (function () {
        function Motion0x4fParser() {
            this.deviceType = 'motion';
            this.frameCode = 0x4f;
        }
        Motion0x4fParser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x4f Motion presence alarm' };
            appContent['alarmPresence'] = {
                'globalCounterValue': payload.readUInt16BE(2),
                'counterValue': payload.readUInt16BE(4),
            };
            return appContent;
        };
        return Motion0x4fParser;
    }());
    codec.Motion0x4fParser = Motion0x4fParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Motion0x50Parser = (function () {
        function Motion0x50Parser() {
            this.deviceType = 'motion';
            this.frameCode = 0x50;
        }
        Motion0x50Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x50 Motion luminosity alarm' };
            appContent['alarmLuminosity'] = {
                'alarmStatus': payload[2] ? 'active' : 'inactive',
                'luminosity': { 'unit': '\u0025', 'value': payload[3] }
            };
            return appContent;
        };
        return Motion0x50Parser;
    }());
    codec.Motion0x50Parser = Motion0x50Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Motion0x5cParser = (function () {
        function Motion0x5cParser() {
            this.deviceType = 'motion';
            this.frameCode = 0x5c;
        }
        Motion0x5cParser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x5c Motion data' };
            var presences = [], luminosities = [];
            appContent['presenceDetectedWhenSending'] = Boolean(payload[2]);
            for (var offset = 3; offset < payload.length; offset += 2) {
                presences.push(payload[offset]);
                luminosities.push(payload[offset + 1]);
            }
            appContent['decodingInfo'] = 'values: [t=0, t-1, t-2, ...]';
            appContent['presence'] = { 'unit': '\u0025', 'values': presences };
            appContent['luminosity'] = { 'unit': '\u0025', 'values': luminosities };
            return appContent;
        };
        return Motion0x5cParser;
    }());
    codec.Motion0x5cParser = Motion0x5cParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Motion0x5dParser = (function () {
        function Motion0x5dParser() {
            this.deviceType = 'motion';
            this.frameCode = 0x5d;
        }
        Motion0x5dParser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = {
                type: '0x5d Motion presence alarm'
            };
            appContent['alarmPresence'] = {
                'alarmStatus': payload[2] ? 'active' : 'inactive',
                'luminosity': { 'unit': '\u0025', 'value': payload[3] }
            };
            return appContent;
        };
        return Motion0x5dParser;
    }());
    codec.Motion0x5dParser = Motion0x5dParser;
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
            _this.deviceType = 'motion';
            return _this;
        }
        Decoder.prototype.getActiveParsers = function (frameCode) {
            var activeParsers = [];
            var statusByteParsers = new codec.GenericStatusByteExtParser();
            var dataParser;
            switch (frameCode) {
                case 0x10:
                    dataParser = new codec.Motion0x10Parser();
                    break;
                case 0x4e:
                    dataParser = new codec.Motion0x4eParser();
                    break;
                case 0x4f:
                    dataParser = new codec.Motion0x4fParser();
                    break;
                case 0x50:
                    dataParser = new codec.Motion0x50Parser();
                    break;
                case 0x5c:
                    dataParser = new codec.Motion0x5cParser();
                    break;
                case 0x5d:
                    dataParser = new codec.Motion0x5dParser();
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
