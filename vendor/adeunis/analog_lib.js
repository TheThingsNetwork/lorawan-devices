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
    var Analog0x10Parser = (function () {
        function Analog0x10Parser() {
            this.deviceType = 'analog';
            this.frameCode = 0x10;
        }
        Analog0x10Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x10 Analog configuration' };
            var ch1 = { name: 'channel A' };
            var ch2 = { name: 'channel B' };
            if (payload[8] === 2) {
                appContent['transmissionPeriodKeepAlive'] = { unit: 's', value: payload[2] * 20 };
                appContent['transmissionPeriodData'] = { unit: 's', value: payload[3] * 20 };
            }
            else {
                appContent['transmissionPeriodKeepAlive'] = { unit: 'm', value: payload[2] * 10 };
                appContent['transmissionPeriodData'] = { unit: 'm', value: payload[3] * 10 };
            }
            var debounce = this.getDebounceText(payload[5] >> 4);
            ch1['id'] = (payload[4] & 0xf0) >> 4;
            ch1['type'] = this.getSensorTypeText(payload[4] & 0x0f);
            if (payload[4] & 0x0f) {
                ch1['threshold'] = this.getThresholdTriggeringText(payload[5] & 0x03);
                ch1['externalTrigger'] = {
                    type: this.getThresholdTriggeringText((payload[5] >> 2) & 0x03),
                    debounceDuration: { unit: debounce[1], value: debounce[0] },
                };
            }
            debounce = this.getDebounceText(payload[7] >> 4);
            ch2['id'] = (payload[6] & 0xf0) >> 4;
            ch2['type'] = this.getSensorTypeText(payload[6] & 0x0f);
            if (payload[6] & 0x0f) {
                ch2['threshold'] = this.getThresholdTriggeringText(payload[7] & 0x03);
                ch2['externalTrigger'] = {
                    type: this.getThresholdTriggeringText((payload[7] >> 2) & 0x03),
                    debounceDuration: { unit: debounce[1], value: debounce[0] },
                };
            }
            appContent['channels'] = [ch1, ch2];
            appContent['productMode'] = codec.PlateformCommonUtils.getProductModeText(payload[8]);
            return appContent;
        };
        Analog0x10Parser.prototype.getSensorTypeText = function (value) {
            switch (value) {
                case 0:
                    return 'deactivated';
                case 1:
                    return '0-10V';
                case 2:
                    return '4-20mA';
                default:
                    return '';
            }
        };
        Analog0x10Parser.prototype.getThresholdTriggeringText = function (value) {
            switch (value) {
                case 0:
                    return 'none';
                case 1:
                    return 'low';
                case 2:
                    return 'high';
                case 3:
                    return 'both';
                default:
                    return '';
            }
        };
        Analog0x10Parser.prototype.getDebounceText = function (value) {
            switch (value) {
                case 0:
                    return [0, 's'];
                case 1:
                    return [10, 'ms'];
                case 2:
                    return [20, 'ms'];
                case 3:
                    return [50, 'ms'];
                case 4:
                    return [100, 'ms'];
                case 5:
                    return [200, 'ms'];
                case 6:
                    return [500, 'ms'];
                case 7:
                    return [1, 's'];
                case 8:
                    return [2, 's'];
                case 9:
                    return [5, 's'];
                case 10:
                    return [10, 's'];
                case 11:
                    return [20, 's'];
                case 12:
                    return [40, 's'];
                case 13:
                    return [60, 's'];
                case 14:
                    return [5, 'm'];
                default:
                    return [0, 's'];
            }
        };
        return Analog0x10Parser;
    }());
    codec.Analog0x10Parser = Analog0x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Analog0x11Parser = (function () {
        function Analog0x11Parser() {
            this.deviceType = 'analog';
            this.frameCode = 0x11;
        }
        Analog0x11Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x11 Analog configuration' };
            appContent['threshold'] = {
                name: 'channel A',
                unit: '\u00B5' + 'V or 10 nA',
                high: {
                    value: payload.readUInt32BE(1) & 0x00ffffff,
                    hysteresis: payload.readUInt32BE(4) & 0x00ffffff,
                },
            };
            return appContent;
        };
        return Analog0x11Parser;
    }());
    codec.Analog0x11Parser = Analog0x11Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Analog0x12Parser = (function () {
        function Analog0x12Parser() {
            this.deviceType = 'analog';
            this.frameCode = 0x12;
        }
        Analog0x12Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x12 Analog configuration' };
            appContent['threshold'] = {
                name: 'channel A',
                unit: '\u00B5' + 'V or 10 nA',
                low: {
                    value: payload.readUInt32BE(1) & 0x00ffffff,
                    hysteresis: payload.readUInt32BE(4) & 0x00ffffff,
                },
            };
            return appContent;
        };
        return Analog0x12Parser;
    }());
    codec.Analog0x12Parser = Analog0x12Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Analog0x13Parser = (function () {
        function Analog0x13Parser() {
            this.deviceType = 'analog';
            this.frameCode = 0x13;
        }
        Analog0x13Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x13 Analog configuration' };
            appContent['threshold'] = {
                name: 'channel B',
                unit: '\u00B5' + 'V or 10 nA',
                high: {
                    value: payload.readUInt32BE(1) & 0x00ffffff,
                    hysteresis: payload.readUInt32BE(4) & 0x00ffffff,
                },
            };
            return appContent;
        };
        return Analog0x13Parser;
    }());
    codec.Analog0x13Parser = Analog0x13Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Analog0x14Parser = (function () {
        function Analog0x14Parser() {
            this.deviceType = 'analog';
            this.frameCode = 0x14;
        }
        Analog0x14Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x14 Analog configuration' };
            appContent['threshold'] = {
                name: 'channel B',
                unit: '\u00B5' + 'V or 10 nA',
                low: {
                    value: payload.readUInt32BE(1) & 0x00ffffff,
                    hysteresis: payload.readUInt32BE(4) & 0x00ffffff,
                },
            };
            return appContent;
        };
        return Analog0x14Parser;
    }());
    codec.Analog0x14Parser = Analog0x14Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Analog0x30Parser = (function () {
        function Analog0x30Parser() {
            this.deviceType = 'analog';
            this.frameCode = 0x30;
            this.parser = new codec.Analog0x42Parser();
        }
        Analog0x30Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = this.parser.parseFrame(payload, configuration, network);
            appContent['type'] = '0x30 Analog keep alive';
            return appContent;
        };
        return Analog0x30Parser;
    }());
    codec.Analog0x30Parser = Analog0x30Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Analog0x42Parser = (function () {
        function Analog0x42Parser() {
            this.deviceType = 'analog';
            this.frameCode = 0x42;
        }
        Analog0x42Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x42 Analog data' };
            var ch1 = { name: 'channel A' };
            var ch2 = { name: 'channel B' };
            var type = payload[2] & 0x0f;
            var rawValue = payload.readUInt32BE(2) & 0x00ffffff;
            if (type === 1) {
                ch1['unit'] = 'V';
                ch1['value'] = parseFloat((rawValue / (1000 * 1000)).toFixed(3));
            }
            else if (type === 2) {
                ch1['unit'] = 'mA';
                ch1['value'] = parseFloat((rawValue / (100 * 1000)).toFixed(3));
            }
            else {
                ch1['state'] = 'deactivated';
            }
            type = payload[6] & 0x0f;
            rawValue = payload.readUInt32BE(6) & 0x00ffffff;
            if (type === 1) {
                ch2['unit'] = 'V';
                ch2['value'] = parseFloat((rawValue / (1000 * 1000)).toFixed(3));
            }
            else if (type === 2) {
                ch2['unit'] = 'mA';
                ch2['value'] = parseFloat((rawValue / (100 * 1000)).toFixed(3));
            }
            else {
                ch2['state'] = 'deactivated';
            }
            appContent['channels'] = [ch1, ch2];
            return appContent;
        };
        return Analog0x42Parser;
    }());
    codec.Analog0x42Parser = Analog0x42Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var AnalogStatusByteParser = (function () {
        function AnalogStatusByteParser() {
            this.deviceType = 'analog';
            this.frameCode = 0;
        }
        AnalogStatusByteParser.prototype.parseFrame = function (payload, configuration, network) {
            var statusContent = {};
            var parser = new codec.GenericStatusByteParser();
            statusContent = parser.parseFrame(payload, configuration);
            statusContent['alarmChannelA'] = Boolean(payload[1] & 0x08);
            statusContent['alarmChannelB'] = Boolean(payload[1] & 0x10);
            return { status: statusContent };
        };
        return AnalogStatusByteParser;
    }());
    codec.AnalogStatusByteParser = AnalogStatusByteParser;
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
            _this.deviceType = 'analog';
            return _this;
        }
        Decoder.prototype.getActiveParsers = function (frameCode) {
            var activeParsers = [];
            var statusByteParsers = new codec.AnalogStatusByteParser();
            var dataParser;
            switch (frameCode) {
                case 0x10:
                    dataParser = new codec.Analog0x10Parser();
                    break;
                case 0x11:
                    dataParser = new codec.Analog0x11Parser();
                    break;
                case 0x12:
                    dataParser = new codec.Analog0x12Parser();
                    break;
                case 0x13:
                    dataParser = new codec.Analog0x13Parser();
                    break;
                case 0x14:
                    dataParser = new codec.Analog0x14Parser();
                    break;
                case 0x20:
                    dataParser = new codec.Generic0x20Parser();
                    break;
                case 0x30:
                    dataParser = new codec.Analog0x30Parser();
                    break;
                case 0x42:
                    dataParser = new codec.Analog0x42Parser();
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
