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
    var Generic0x1fParser = (function () {
        function Generic0x1fParser() {
            this.deviceType = 'motion|comfort|comfort2|comfortCo2|deltap|breath|comfortSerenity';
            this.frameCode = 0x1f;
        }
        Generic0x1fParser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x1f digital input configuration' };
            var input1 = {};
            var input2 = {};
            input1['type'] = this.getTypeText(payload[2] & 0x0f);
            input1['debouncingPeriod'] = {
                unit: 'ms',
                value: this.getDebouncingPeriodText((payload[2] & 0xf0) >> 4),
            };
            input1['threshold'] = payload.readUInt16BE(3);
            input2['type'] = this.getTypeText(payload[5] & 0x0f);
            input2['debouncingPeriod'] = {
                unit: 'ms',
                value: this.getDebouncingPeriodText((payload[5] & 0xf0) >> 4),
            };
            input2['threshold'] = payload.readUInt16BE(6);
            appContent['digitalInput1'] = input1;
            appContent['digitalInput2'] = input2;
            return appContent;
        };
        Generic0x1fParser.prototype.getDebouncingPeriodText = function (value) {
            switch (value) {
                case 0:
                    return 0;
                case 1:
                    return 10;
                case 2:
                    return 20;
                case 3:
                    return 500;
                case 4:
                    return 100;
                case 5:
                    return 200;
                case 6:
                    return 500;
                case 7:
                    return 1000;
                case 8:
                    return 2000;
                case 9:
                    return 5000;
                case 10:
                    return 10000;
                case 11:
                    return 20000;
                case 12:
                    return 40000;
                case 13:
                    return 60000;
                case 14:
                    return 300000;
                case 15:
                    return 600000;
                default:
                    return 0;
            }
        };
        Generic0x1fParser.prototype.getTypeText = function (value) {
            switch (value) {
                case 0x0:
                    return 'deactivated';
                case 0x1:
                    return 'highEdge';
                case 0x2:
                    return 'lowEdge';
                case 0x3:
                    return 'bothEdges';
                default:
                    return '';
            }
        };
        return Generic0x1fParser;
    }());
    codec.Generic0x1fParser = Generic0x1fParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Generic0x33Parser = (function () {
        function Generic0x33Parser() {
            this.deviceType = 'drycontacts|drycontacts2|pulse3|pulse4|' + 'temp3|temp4|comfort|comfort2|comfortCo2|modbus|motion|deltap|breath|comfortSerenity';
            this.frameCode = 0x33;
        }
        Generic0x33Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x33 Set register status' };
            appContent['requestStatus'] = this.getRequestStatusText(payload[2]);
            appContent['registerId'] = payload.readUInt16BE(3);
            return appContent;
        };
        Generic0x33Parser.prototype.getRequestStatusText = function (value) {
            switch (value) {
                case 1:
                    return 'success';
                case 2:
                    return 'successNoUpdate';
                case 3:
                    return 'errorCoherency';
                case 4:
                    return 'errorInvalidRegister';
                case 5:
                    return 'errorInvalidValue';
                case 6:
                    return 'errorTruncatedValue';
                case 7:
                    return 'errorAccesNotAllowed';
                default:
                    return 'errorOtherReason';
            }
        };
        return Generic0x33Parser;
    }());
    codec.Generic0x33Parser = Generic0x33Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Generic0x37Parser = (function () {
        function Generic0x37Parser() {
            this.deviceType = 'temp4|comfort2|comfortCo2|breath|comfortSerenity|modbus';
            this.frameCode = 0x37;
        }
        Generic0x37Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x37 Software version' };
            appContent['appVersion'] = payload.readUInt8(2) + '.' + payload.readUInt8(3) + '.' + payload.readUInt8(4);
            appContent['rtuVersion'] = payload.readUInt8(5) + '.' + payload.readUInt8(6) + '.' + payload.readUInt8(7);
            return appContent;
        };
        return Generic0x37Parser;
    }());
    codec.Generic0x37Parser = Generic0x37Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Generic0x51Parser = (function () {
        function Generic0x51Parser() {
            this.deviceType = 'motion|comfort|comfort2|comfortCo2|deltap|breath|comfortSerenity';
            this.frameCode = 0x51;
        }
        Generic0x51Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x51 digital input 1 alarm' };
            if (payload[1] & 0x04) {
                var myDate = new Date((payload.readUInt32BE(9) + 1356998400) * 1000);
                appContent['timestamp'] = myDate.toJSON().replace('Z', '');
            }
            appContent['state'] = {
                previousFrame: Boolean((payload.readUInt8(2) >> 1) & 1),
                current: Boolean((payload.readUInt8(2) >> 0) & 1),
            };
            appContent['counter'] = {
                global: payload.readUInt32BE(3),
                instantaneous: payload.readUInt16BE(7),
            };
            return appContent;
        };
        return Generic0x51Parser;
    }());
    codec.Generic0x51Parser = Generic0x51Parser;
})(codec || (codec = {}));
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var codec;
(function (codec) {
    var Generic0x52Parser = (function () {
        function Generic0x52Parser() {
            this.deviceType = 'motion|comfort|comfort2|comfortCo2|deltap|breath|comfortSerenity';
            this.frameCode = 0x52;
            this.parser = new codec.Generic0x51Parser();
        }
        Generic0x52Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = __assign(__assign({}, this.parser.parseFrame(payload, configuration, network)), { type: '0x52 digital input 2 alarm' });
            return appContent;
        };
        return Generic0x52Parser;
    }());
    codec.Generic0x52Parser = Generic0x52Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Breath0x10Parser = (function () {
        function Breath0x10Parser() {
            this.deviceType = 'breath';
            this.frameCode = 0x10;
        }
        Breath0x10Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x10 Breath configuration' };
            (appContent['dailyFrameActivated'] = Boolean(payload.readUInt8(2) === 0 ? false : true)),
                (appContent['numberOfHistorizationBeforeSending'] = payload.readUInt16BE(3)),
                (appContent['historyPeriod'] = { unit: 's', value: payload.readUInt16BE(5) }),
                (appContent['alarmRepeatActivated'] = Boolean(payload.readUInt8(7) === 0 ? false : true)),
                (appContent['alarmRepeatPeriod'] = { unit: 's', value: payload.readUInt16BE(8) }),
                (appContent['redundantSamples'] = payload.readUInt8(10));
            return appContent;
        };
        return Breath0x10Parser;
    }());
    codec.Breath0x10Parser = Breath0x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Breath0x30Parser = (function () {
        function Breath0x30Parser() {
            this.deviceType = 'breath';
            this.frameCode = 0x30;
        }
        Breath0x30Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x30 Daily frame' };
            if (payload.length >= 11) {
                appContent['tvoc'] = {
                    min: { unit: 'µg/m3', value: payload.readUInt16BE(2) },
                    max: { unit: 'µg/m3', value: payload.readUInt16BE(4) },
                    average: { unit: 'µg/m3', value: payload.readUInt16BE(6) },
                    duration: { unit: 'min', value: payload.readUInt16BE(8) },
                };
                appContent['pm10'] = {
                    min: { unit: 'µg/m3', value: payload.readUInt16BE(10) },
                    max: { unit: 'µg/m3', value: payload.readUInt16BE(12) },
                    average: { unit: 'µg/m3', value: payload.readUInt16BE(14) },
                    duration: { unit: 'min', value: payload.readUInt16BE(16) },
                };
                appContent['pm25'] = {
                    min: { unit: 'µg/m3', value: payload.readUInt16BE(18) },
                    max: { unit: 'µg/m3', value: payload.readUInt16BE(20) },
                    average: { unit: 'µg/m3', value: payload.readUInt16BE(22) },
                    duration: { unit: 'min', value: payload.readUInt16BE(24) },
                };
                appContent['pm1'] = {
                    min: { unit: 'µg/m3', value: payload.readUInt16BE(26) },
                    max: { unit: 'µg/m3', value: payload.readUInt16BE(28) },
                    average: { unit: 'µg/m3', value: payload.readUInt16BE(30) },
                };
            }
            else {
                appContent['tvoc'] = { max: { unit: 'µg/m3', value: payload.readUInt16BE(2) } };
                appContent['pm10'] = { max: { unit: 'µg/m3', value: payload.readUInt16BE(4) } };
                appContent['pm25'] = { max: { unit: 'µg/m3', value: payload.readUInt16BE(6) } };
                appContent['pm1'] = { max: { unit: 'µg/m3', value: payload.readUInt16BE(8) } };
            }
            return appContent;
        };
        return Breath0x30Parser;
    }());
    codec.Breath0x30Parser = Breath0x30Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Breath0x6dParser = (function () {
        function Breath0x6dParser() {
            this.deviceType = 'breath';
            this.frameCode = 0x6d;
        }
        Breath0x6dParser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x6d Breath periodic data' };
            var rawValue;
            var pm10 = [], pm25 = [], pm1 = [], tvoc = [];
            var payloadLength = payload.length;
            for (var offset = 2; offset < payloadLength; offset += 8) {
                rawValue = payload.readUInt16BE(offset);
                tvoc.push(rawValue);
                rawValue = payload.readUInt16BE(offset + 2);
                pm10.push(rawValue);
                rawValue = payload.readUInt16BE(offset + 4);
                pm25.push(rawValue);
                rawValue = payload.readUInt16BE(offset + 6);
                pm1.push(rawValue);
            }
            appContent['decodingInfo'] = 'values: [t=0, t-1, t-2, ...]';
            appContent['tvoc'] = { unit: 'µg/m3', values: tvoc };
            appContent['pm10'] = { unit: 'µg/m3', values: pm10 };
            appContent['pm25'] = { unit: 'µg/m3', values: pm25 };
            appContent['pm1'] = { unit: 'µg/m3', values: pm1 };
            return appContent;
        };
        return Breath0x6dParser;
    }());
    codec.Breath0x6dParser = Breath0x6dParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Breath0x6eParser = (function () {
        function Breath0x6eParser() {
            this.deviceType = 'breath';
            this.frameCode = 0x6e;
        }
        Breath0x6eParser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x6e Breath alarm' };
            appContent['tvoc'] = {
                alarmStatus: payload[2] & 0x01 ? 'active' : 'inactive',
                unit: 'µg/m3',
                value: payload.readUInt16BE(3),
            };
            appContent['pm10'] = {
                alarmStatus: payload[2] & 0x02 ? 'active' : 'inactive',
                unit: 'µg/m3',
                value: payload.readUInt16BE(5),
            };
            appContent['pm25'] = {
                alarmStatus: payload[2] & 0x04 ? 'active' : 'inactive',
                unit: 'µg/m3',
                value: payload.readUInt16BE(7),
            };
            appContent['pm1'] = {
                alarmStatus: payload[2] & 0x08 ? 'active' : 'inactive',
                unit: 'µg/m3',
                value: payload.readUInt16BE(9),
            };
            return appContent;
        };
        return Breath0x6eParser;
    }());
    codec.Breath0x6eParser = Breath0x6eParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var BreathStatusByteParser = (function () {
        function BreathStatusByteParser() {
            this.deviceType = 'breath';
            this.frameCode = 0;
        }
        BreathStatusByteParser.prototype.parseFrame = function (payload, configuration, network) {
            var statusContent = {};
            var parser = new codec.GenericStatusByteParser();
            statusContent = parser.parseFrame(payload, configuration);
            statusContent['configurationInconsistency'] = Boolean(payload[1] & 0x08);
            statusContent['sensorError'] = Boolean(payload[1] & 0x16);
            return { status: statusContent };
        };
        return BreathStatusByteParser;
    }());
    codec.BreathStatusByteParser = BreathStatusByteParser;
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
            _this.deviceType = 'breath';
            return _this;
        }
        Decoder.prototype.getActiveParsers = function (frameCode) {
            var activeParsers = [];
            var statusByteParsers = new codec.BreathStatusByteParser();
            var dataParser;
            switch (frameCode) {
                case 0x10:
                    dataParser = new codec.Breath0x10Parser();
                    break;
                case 0x1f:
                    dataParser = new codec.Generic0x1fParser();
                    break;
                case 0x20:
                    dataParser = new codec.Generic0x20Parser();
                    break;
                case 0x30:
                    dataParser = new codec.Breath0x30Parser();
                    break;
                case 0x33:
                    dataParser = new codec.Generic0x33Parser();
                    break;
                case 0x37:
                    dataParser = new codec.Generic0x37Parser();
                    break;
                case 0x51:
                    dataParser = new codec.Generic0x51Parser();
                    break;
                case 0x52:
                    dataParser = new codec.Generic0x52Parser();
                    break;
                case 0x6d:
                    dataParser = new codec.Breath0x6dParser();
                    break;
                case 0x6e:
                    dataParser = new codec.Breath0x6eParser();
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
