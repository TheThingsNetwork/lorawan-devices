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
    var Generic0x2fParser = (function () {
        function Generic0x2fParser() {
            this.deviceType = 'drycontacts|drycontacts2|temp4|comfortSerenity|modbus';
            this.frameCode = 0x2f;
        }
        Generic0x2fParser.prototype.parseFrame = function (payload, configuration) {
            var appContent = { type: '0x2f Downlink ack' };
            appContent['downlinkFramecode'] = '0x' + payload[2].toString(16);
            appContent['requestStatus'] = this.getRequestStatusText(payload[3]);
            return appContent;
        };
        Generic0x2fParser.prototype.getRequestStatusText = function (value) {
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
        return Generic0x2fParser;
    }());
    codec.Generic0x2fParser = Generic0x2fParser;
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
    var Drycontacts20x10Parser = (function () {
        function Drycontacts20x10Parser() {
            this.deviceType = 'drycontacts2';
            this.frameCode = 0x10;
        }
        Drycontacts20x10Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x10 Dry Contacts 2 configuration' };
            appContent['keepAlivePeriod'] = { unit: 's', value: payload.readUInt16BE(2) * 10 };
            appContent['transmitPeriod'] = { unit: 's', value: payload.readUInt16BE(4) * 10 };
            var debounce = this.getDebounceText(payload[6] >> 4);
            var type = this.getTypeText(payload[6] & 0x0f);
            if (type[0] === 'disabled' || type[0] === 'output') {
                appContent['channelA'] = { type: type[0] };
            }
            else {
                appContent['channelA'] = {
                    type: type[0],
                    edge: type[1],
                    debounceDuration: { unit: debounce[1], value: debounce[0] },
                };
            }
            debounce = this.getDebounceText(payload[7] >> 4);
            type = this.getTypeText(payload[7] & 0x0f);
            if (type[0] === 'disabled' || type[0] === 'output') {
                appContent['channelB'] = { type: type[0] };
            }
            else {
                appContent['channelB'] = {
                    type: type[0],
                    edge: type[1],
                    debounceDuration: { unit: debounce[1], value: debounce[0] },
                };
            }
            debounce = this.getDebounceText(payload[8] >> 4);
            type = this.getTypeText(payload[8] & 0x0f);
            if (type[0] === 'disabled' || type[0] === 'output') {
                appContent['channelC'] = { type: type[0] };
            }
            else {
                appContent['channelC'] = {
                    type: type[0],
                    edge: type[1],
                    debounceDuration: { unit: debounce[1], value: debounce[0] },
                };
            }
            debounce = this.getDebounceText(payload[9] >> 4);
            type = this.getTypeText(payload[9] & 0x0f);
            if (type[0] === 'disabled' || type[0] === 'output') {
                appContent['channelD'] = { type: type[0] };
            }
            else {
                appContent['channelD'] = {
                    type: type[0],
                    edge: type[1],
                    debounceDuration: { unit: debounce[1], value: debounce[0] },
                };
            }
            return appContent;
        };
        Drycontacts20x10Parser.prototype.getTypeText = function (value) {
            switch (value) {
                case 0:
                    return ['disabled', ''];
                case 1:
                    return ['input', 'high'];
                case 2:
                    return ['input', 'low'];
                case 3:
                    return ['input', 'both'];
                case 4:
                    return ['output', ''];
                default:
                    return ['disabled', ''];
            }
        };
        Drycontacts20x10Parser.prototype.getDebounceText = function (value) {
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
                case 15:
                    return [10, 'm'];
                default:
                    return [0, 's'];
            }
        };
        return Drycontacts20x10Parser;
    }());
    codec.Drycontacts20x10Parser = Drycontacts20x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Drycontacts20x30Parser = (function () {
        function Drycontacts20x30Parser() {
            this.deviceType = 'drycontacts2';
            this.frameCode = 0x30;
        }
        Drycontacts20x30Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x30 Dry Contacts 2 keep alive' };
            if (payload[1] & 0x04) {
                var myDate = new Date((payload.readUInt32BE(11) + 1356998400) * 1000);
                appContent['timestamp'] = myDate.toJSON().replace('Z', '');
            }
            appContent['channelA'] = { value: payload.readUInt16BE(2), state: Boolean(payload[10] & 0x01) };
            appContent['channelB'] = { value: payload.readUInt16BE(4), state: Boolean(payload[10] & 0x02) };
            appContent['channelC'] = { value: payload.readUInt16BE(6), state: Boolean(payload[10] & 0x04) };
            appContent['channelD'] = { value: payload.readUInt16BE(8), state: Boolean(payload[10] & 0x08) };
            return appContent;
        };
        return Drycontacts20x30Parser;
    }());
    codec.Drycontacts20x30Parser = Drycontacts20x30Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Drycontacts20x40Parser = (function () {
        function Drycontacts20x40Parser() {
            this.deviceType = 'drycontacts2';
            this.frameCode = 0x40;
        }
        Drycontacts20x40Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x40 Dry Contacts 2 data' };
            if (payload[1] & 0x04) {
                var myDate = new Date((payload.readUInt32BE(11) + 1356998400) * 1000);
                appContent['timestamp'] = myDate.toJSON().replace('Z', '');
            }
            appContent['decodingInfo'] = 'true: ON/CLOSED, false: OFF/OPEN';
            appContent['channelA'] = {
                value: payload.readUInt16BE(2),
                currentState: Boolean(payload[10] & 0x01),
                previousFrameState: Boolean(payload[10] & 0x02),
            };
            appContent['channelB'] = {
                value: payload.readUInt16BE(4),
                currentState: Boolean(payload[10] & 0x04),
                previousFrameState: Boolean(payload[10] & 0x08),
            };
            appContent['channelC'] = {
                value: payload.readUInt16BE(6),
                currentState: Boolean(payload[10] & 0x10),
                previousFrameState: Boolean(payload[10] & 0x20),
            };
            appContent['channelD'] = {
                value: payload.readUInt16BE(8),
                currentState: Boolean(payload[10] & 0x40),
                previousFrameState: Boolean(payload[10] & 0x80),
            };
            return appContent;
        };
        return Drycontacts20x40Parser;
    }());
    codec.Drycontacts20x40Parser = Drycontacts20x40Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Drycontacts20x41Parser = (function () {
        function Drycontacts20x41Parser() {
            this.deviceType = 'drycontacts2';
            this.frameCode = 0x41;
        }
        Drycontacts20x41Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x41 Dry Contacts 2 duration alarm' };
            if (payload[1] & 0x04) {
                var myDate = new Date((payload.readUInt32BE(5) + 1356998400) * 1000);
                appContent['timestamp'] = myDate.toJSON().replace('Z', '');
            }
            appContent['channel'] = payload.readUInt8(2);
            appContent['durationThreshold'] = { unit: 'min', value: payload.readUInt16BE(3) };
            return appContent;
        };
        return Drycontacts20x41Parser;
    }());
    codec.Drycontacts20x41Parser = Drycontacts20x41Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Drycontacts20x59Parser = (function () {
        function Drycontacts20x59Parser() {
            this.deviceType = 'drycontacts2';
            this.frameCode = 0x59;
        }
        Drycontacts20x59Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x59 Dry Contacts 2 time counting data' };
            if (payload[1] & 0x04) {
                var myDate = new Date((payload.readUInt32BE(payload.length - 4) + 1356998400) * 1000);
                appContent['timestamp'] = myDate.toJSON().replace('Z', '');
            }
            var offset = 3;
            if (payload[2] & 0x01) {
                appContent['channelATimeCounter'] = { unit: 's', value: payload.readUInt32BE(offset) };
                offset += 4;
            }
            if (payload[2] & 0x02) {
                appContent['channelBTimeCounter'] = { unit: 's', value: payload.readUInt32BE(offset) };
                offset += 4;
            }
            if (payload[2] & 0x04) {
                appContent['channelCTimeCounter'] = { unit: 's', value: payload.readUInt32BE(offset) };
                offset += 4;
            }
            if (payload[2] & 0x08) {
                appContent['channelDTimeCounter'] = { unit: 's', value: payload.readUInt32BE(offset) };
            }
            return appContent;
        };
        return Drycontacts20x59Parser;
    }());
    codec.Drycontacts20x59Parser = Drycontacts20x59Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Drycontacts2StatusByteParser = (function () {
        function Drycontacts2StatusByteParser() {
            this.deviceType = 'drycontacts2';
            this.frameCode = 0;
        }
        Drycontacts2StatusByteParser.prototype.parseFrame = function (payload, configuration, network) {
            var statusContent = {};
            var parser = new codec.GenericStatusByteParser();
            statusContent = parser.parseFrame(payload, configuration);
            statusContent['timestamp'] = Boolean(payload[1] & 0x04);
            return { status: statusContent };
        };
        return Drycontacts2StatusByteParser;
    }());
    codec.Drycontacts2StatusByteParser = Drycontacts2StatusByteParser;
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
            _this.deviceType = 'drycontacts2';
            return _this;
        }
        Decoder.prototype.getActiveParsers = function (frameCode) {
            var activeParsers = [];
            var statusByteParsers = new codec.Drycontacts2StatusByteParser();
            var dataParser;
            switch (frameCode) {
                case 0x10:
                    dataParser = new codec.Drycontacts20x10Parser();
                    break;
                case 0x30:
                    dataParser = new codec.Drycontacts20x30Parser();
                    break;
                case 0x40:
                    dataParser = new codec.Drycontacts20x40Parser();
                    break;
                case 0x41:
                    dataParser = new codec.Drycontacts20x41Parser();
                    break;
                case 0x59:
                    dataParser = new codec.Drycontacts20x59Parser();
                    break;
                case 0x20:
                    dataParser = new codec.Generic0x20Parser();
                    break;
                case 0x2f:
                    dataParser = new codec.Generic0x2fParser();
                    break;
                case 0x33:
                    dataParser = new codec.Generic0x33Parser();
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
