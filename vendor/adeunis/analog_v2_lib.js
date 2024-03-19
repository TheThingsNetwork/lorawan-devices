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
    var Analog20x10Parser = (function () {
        function Analog20x10Parser() {
            this.deviceType = 'analog2';
            this.frameCode = 0x10;
        }
        Analog20x10Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x10 Analog V2 configuration' };
            (appContent['transmissionPeriodKeepAlive'] = { unit: 's', value: payload.readUInt16BE(2) * 10 }),
                (appContent['numberOfHistorizationBeforeSending'] = payload.readUInt16BE(4)),
                (appContent['numberOfSamplingBeforeHistorization'] = payload.readUInt16BE(6)),
                (appContent['samplingPeriod'] = { unit: 's', value: payload.readUInt16BE(8) * 2 }),
                (appContent['redundantSamples'] = payload.readUInt8(10)),
                (appContent['calculatedPeriodRecording'] = {
                    unit: 's',
                    value: payload.readUInt16BE(8) * payload.readUInt16BE(6) * 2,
                }),
                (appContent['calculatedSendingPeriod'] = {
                    unit: 's',
                    value: payload.readUInt16BE(8) * payload.readUInt16BE(6) * payload.readUInt16BE(4) * 2,
                });
            return appContent;
        };
        return Analog20x10Parser;
    }());
    codec.Analog20x10Parser = Analog20x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Analog20x30Parser = (function () {
        function Analog20x30Parser() {
            this.deviceType = 'analog2';
            this.frameCode = 0x30;
            this.parser = new codec.Analog20x42Parser();
        }
        Analog20x30Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = this.parser.parseFrame(payload, configuration, network);
            appContent['type'] = '0x30 Analog V2 keep alive';
            return appContent;
        };
        return Analog20x30Parser;
    }());
    codec.Analog20x30Parser = Analog20x30Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Analog20x38Parser = (function () {
        function Analog20x38Parser() {
            this.deviceType = 'analog2';
            this.frameCode = 0x38;
            this.parser = new codec.Analog20x71Parser();
        }
        Analog20x38Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = this.parser.parseFrame(payload, configuration, network);
            appContent['type'] = '0x38 Analog V2 keep alive';
            return appContent;
        };
        return Analog20x38Parser;
    }());
    codec.Analog20x38Parser = Analog20x38Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Analog20x42Parser = (function () {
        function Analog20x42Parser() {
            this.deviceType = 'analog2';
            this.frameCode = 0x42;
        }
        Analog20x42Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x42 Analog V2 data' };
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
        return Analog20x42Parser;
    }());
    codec.Analog20x42Parser = Analog20x42Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Analog20x71Parser = (function () {
        function Analog20x71Parser() {
            this.deviceType = 'analog2';
            this.frameCode = 0x71;
        }
        Analog20x71Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x71 Analog V2 periodic data' };
            var rawValue;
            var channels = [];
            var ch1 = [], ch2 = [];
            var nbSensors = (payload[2] & 0x01 ? 1 : 0) + (payload[2] & 0x04 ? 1 : 0);
            var payloadLength = payload[1] & 0x04 ? payload.length - 4 : payload.length;
            for (var offset = 3; offset < payloadLength; offset += 2 * nbSensors) {
                rawValue = payload.readUInt16BE(offset);
                ch1.push(rawValue / 1000);
                if (nbSensors === 2) {
                    rawValue = payload.readUInt16BE(offset + 2);
                    ch2.push(rawValue / 1000);
                }
            }
            if (payload[1] & 0x04) {
                var myDate = new Date((payload.readUInt32BE(payload.length - 4) + 1356998400) * 1000);
                appContent['timestamp'] = myDate.toJSON().replace('Z', '');
            }
            appContent['decodingInfo'] = 'values: [t=0, t-1, t-2, ...]';
            if (nbSensors == 1 && payload[2] & 0x04) {
                channels['push']({ name: 'channel B', unit: payload[2] & 0x08 ? 'mA' : 'V', values: ch1 });
            }
            else {
                channels['push']({ name: 'channel A', unit: payload[2] & 0x02 ? 'mA' : 'V', values: ch1 });
            }
            if (nbSensors === 2) {
                channels['push']({ name: 'channel B', unit: payload[2] & 0x08 ? 'mA' : 'V', values: ch2 });
            }
            appContent['channels'] = channels;
            return appContent;
        };
        return Analog20x71Parser;
    }());
    codec.Analog20x71Parser = Analog20x71Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Analog20x72Parser = (function () {
        function Analog20x72Parser() {
            this.deviceType = 'analog2';
            this.frameCode = 0x72;
        }
        Analog20x72Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x72 Analog V2 alarm' };
            var alarms = [];
            var nbSensors = (payload[2] & 0x01 ? 1 : 0) + (payload[2] & 0x04 ? 1 : 0);
            if (nbSensors == 1 && payload[2] & 0x04) {
                alarms['push']({
                    name: 'channel B',
                    alarmStatus: this.getAlarmStatusText(payload.readUInt8(3)),
                    unit: payload[2] & 0x08 ? 'mA' : 'V',
                    value: payload.readUInt16BE(4) / 1000,
                });
            }
            else {
                alarms['push']({
                    name: 'channel A',
                    alarmStatus: this.getAlarmStatusText(payload.readUInt8(3)),
                    unit: payload[2] & 0x02 ? 'mA' : 'V',
                    value: payload.readUInt16BE(4) / 1000,
                });
            }
            if (nbSensors === 2) {
                alarms['push']({
                    name: 'channel B',
                    alarmStatus: this.getAlarmStatusText(payload.readUInt8(6)),
                    unit: payload[2] & 0x08 ? 'mA' : 'V',
                    value: payload.readUInt16BE(7) / 1000,
                });
            }
            appContent['alarms'] = alarms;
            if (payload[1] & 0x04) {
                var myDate = new Date((payload.readUInt32BE(payload.length - 4) + 1356998400) * 1000);
                appContent['timestamp'] = myDate.toJSON().replace('Z', '');
            }
            appContent['alarms'] = alarms;
            return appContent;
        };
        Analog20x72Parser.prototype.getAlarmStatusText = function (value) {
            switch (value) {
                case 1:
                    return 'highThreshold';
                case 2:
                    return 'lowThreshold';
                case 3:
                    return 'inputEvent';
                default:
                    return 'none';
            }
        };
        return Analog20x72Parser;
    }());
    codec.Analog20x72Parser = Analog20x72Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Analog2StatusByteParser = (function () {
        function Analog2StatusByteParser() {
            this.deviceType = 'analog2';
            this.frameCode = 0;
        }
        Analog2StatusByteParser.prototype.parseFrame = function (payload, configuration, network) {
            var statusContent = {};
            var parser = new codec.GenericStatusByteParser();
            statusContent = parser.parseFrame(payload, configuration);
            if (payload[0] == 0x30 || payload[0] == 0x42) {
                statusContent['alarmChannelA'] = Boolean(payload[1] & 0x08);
                statusContent['alarmChannelB'] = Boolean(payload[1] & 0x10);
            }
            else {
                statusContent['configurationInconsistency'] = Boolean(payload[1] & 0x08);
                statusContent['timestamp'] = Boolean(payload[1] & 0x04);
            }
            return { status: statusContent };
        };
        return Analog2StatusByteParser;
    }());
    codec.Analog2StatusByteParser = Analog2StatusByteParser;
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
            _this.deviceType = 'analog2';
            return _this;
        }
        Decoder.prototype.getActiveParsers = function (frameCode) {
            var activeParsers = [];
            var statusByteParsers = new codec.Analog2StatusByteParser();
            var dataParser;
            switch (frameCode) {
                case 0x10:
                    dataParser = new codec.Analog20x10Parser();
                    break;
                case 0x20:
                    dataParser = new codec.Generic0x20Parser();
                    break;
                case 0x30:
                    dataParser = new codec.Analog20x30Parser();
                    break;
                case 0x38:
                    dataParser = new codec.Analog20x38Parser();
                    break;
                case 0x42:
                    dataParser = new codec.Analog20x42Parser();
                    break;
                case 0x71:
                    dataParser = new codec.Analog20x71Parser();
                    break;
                case 0x72:
                    dataParser = new codec.Analog20x72Parser();
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
