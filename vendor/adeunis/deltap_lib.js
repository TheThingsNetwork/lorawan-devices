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
    var Deltap0x10Parser = (function () {
        function Deltap0x10Parser() {
            this.deviceType = 'deltap';
            this.frameCode = 0x10;
        }
        Deltap0x10Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x10 Delta P configuration' };
            appContent['transmissionPeriodKeepAlive'] = { 'unit': 's', 'value': payload.readUInt16BE(2) * 10 },
                appContent['numberOfHistorizationBeforeSending'] = payload.readUInt16BE(4),
                appContent['numberOfSamplingBeforeHistorization'] = payload.readUInt16BE(6),
                appContent['samplingPeriod'] = { 'unit': 's', 'value': payload.readUInt16BE(8) * 2 },
                appContent['calculatedPeriodRecording'] = { 'unit': 's',
                    'value': payload.readUInt16BE(8) * payload.readUInt16BE(6) * 2 },
                appContent['calculatedSendingPeriod'] = { 'unit': 's',
                    'value': payload.readUInt16BE(8) * payload.readUInt16BE(6) * payload.readUInt16BE(4) * 2 };
            return appContent;
        };
        return Deltap0x10Parser;
    }());
    codec.Deltap0x10Parser = Deltap0x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Deltap0x11Parser = (function () {
        function Deltap0x11Parser() {
            this.deviceType = 'deltap';
            this.frameCode = 0x11;
        }
        Deltap0x11Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x11 Delta P 0-10V configuration' };
            appContent['numberOfHistorizationBeforeSending'] = payload.readUInt16BE(6);
            appContent['numberOfSamplingBeforeHistorization'] = payload.readUInt16BE(2);
            appContent['samplingPeriod'] = { 'unit': 's', 'value': payload.readUInt16BE(4) * 2 };
            appContent['calculatedPeriodRecording'] = { 'unit': 's',
                'value': payload.readUInt16BE(2) * payload.readUInt16BE(4) * 2 };
            appContent['calculatedSendingPeriod'] = { 'unit': 's',
                'value': payload.readUInt16BE(2) * payload.readUInt16BE(4) * payload.readUInt16BE(6) * 2 };
            return appContent;
        };
        return Deltap0x11Parser;
    }());
    codec.Deltap0x11Parser = Deltap0x11Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Deltap0x2fParser = (function () {
        function Deltap0x2fParser() {
            this.deviceType = 'deltap';
            this.frameCode = 0x2f;
        }
        Deltap0x2fParser.prototype.parseFrame = function (payload, configuration) {
            var appContent = { type: '0x2f Delta P Downlink ack' };
            appContent['requestStatus'] = this.getRequestStatusText(payload[2]);
            return appContent;
        };
        Deltap0x2fParser.prototype.getRequestStatusText = function (value) {
            switch (value) {
                case 1:
                    return 'success';
                case 2:
                    return 'errorGeneric';
                case 3:
                    return 'errorWrongState';
                case 4:
                    return 'errorInvalidRequest';
                default:
                    return 'errorOtherReason';
            }
        };
        return Deltap0x2fParser;
    }());
    codec.Deltap0x2fParser = Deltap0x2fParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Deltap0x53Parser = (function () {
        function Deltap0x53Parser() {
            this.deviceType = 'deltap';
            this.frameCode = 0x53;
        }
        Deltap0x53Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x53 Delta P periodic data' };
            var pressures = [];
            for (var offset = 2; offset < payload.length; offset += 2) {
                pressures.push(payload.readInt16BE(offset));
            }
            appContent['decodingInfo'] = 'values: [t=0, t-1, t-2, ...]';
            appContent['deltaPressure'] = { 'unit': 'pa', 'values': pressures };
            return appContent;
        };
        return Deltap0x53Parser;
    }());
    codec.Deltap0x53Parser = Deltap0x53Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Deltap0x54Parser = (function () {
        function Deltap0x54Parser() {
            this.deviceType = 'deltap';
            this.frameCode = 0x54;
        }
        Deltap0x54Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x54 Delta P alarm' };
            appContent['alarmStatus'] = payload.readUInt8(2) ? 'active' : 'inactive';
            appContent['deltaPressure'] = { 'unit': 'pa', 'value': payload.readInt16BE(3) };
            return appContent;
        };
        return Deltap0x54Parser;
    }());
    codec.Deltap0x54Parser = Deltap0x54Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Deltap0x55Parser = (function () {
        function Deltap0x55Parser() {
            this.deviceType = 'deltap';
            this.frameCode = 0x55;
        }
        Deltap0x55Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x55 Delta P - periodic 0-10 V' };
            var voltages = [];
            for (var offset = 2; offset < payload.length; offset += 2) {
                voltages.push(payload.readInt16BE(offset));
            }
            appContent['decodingInfo'] = 'values: [t=0, t-1, t-2, ...]';
            appContent['voltage'] = { 'unit': 'mV', 'values': voltages };
            return appContent;
        };
        return Deltap0x55Parser;
    }());
    codec.Deltap0x55Parser = Deltap0x55Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Deltap0x56Parser = (function () {
        function Deltap0x56Parser() {
            this.deviceType = 'deltap';
            this.frameCode = 0x56;
        }
        Deltap0x56Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x56 Delta P - alarm 0-10 V' };
            appContent['alarmStatus'] = payload.readUInt8(2) ? 'active' : 'inactive';
            appContent['voltage'] = { 'unit': 'mV', 'value': payload.readInt16BE(3) };
            return appContent;
        };
        return Deltap0x56Parser;
    }());
    codec.Deltap0x56Parser = Deltap0x56Parser;
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
            _this.deviceType = 'deltap';
            return _this;
        }
        Decoder.prototype.getActiveParsers = function (frameCode) {
            var activeParsers = [];
            var statusByteParsers = new codec.GenericStatusByteExtParser();
            var dataParser;
            switch (frameCode) {
                case 0x10:
                    dataParser = new codec.Deltap0x10Parser();
                    break;
                case 0x11:
                    dataParser = new codec.Deltap0x11Parser();
                    break;
                case 0x2f:
                    dataParser = new codec.Deltap0x2fParser();
                    break;
                case 0x53:
                    dataParser = new codec.Deltap0x53Parser();
                    break;
                case 0x54:
                    dataParser = new codec.Deltap0x54Parser();
                    break;
                case 0x55:
                    dataParser = new codec.Deltap0x55Parser();
                    break;
                case 0x56:
                    dataParser = new codec.Deltap0x56Parser();
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
