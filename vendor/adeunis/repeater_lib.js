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
    var Repeater0x01Parser = (function () {
        function Repeater0x01Parser() {
            this.deviceType = 'repeater';
            this.frameCode = 0x01;
        }
        Repeater0x01Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = __assign({ type: '0x01 Repeater WL add' }, this.getDataFromPayload(payload));
            return appContent;
        };
        Repeater0x01Parser.prototype.getDataFromPayload = function (payload) {
            var appContent = {};
            codec.RepeaterHelper.getUPStatusFromPayload(payload, appContent);
            return appContent;
        };
        return Repeater0x01Parser;
    }());
    codec.Repeater0x01Parser = Repeater0x01Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Repeater0x02Parser = (function () {
        function Repeater0x02Parser() {
            this.deviceType = 'repeater';
            this.frameCode = 0x02;
        }
        Repeater0x02Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = __assign({ type: '0x02 Repeater WL modification' }, this.getDataFromPayload(payload));
            return appContent;
        };
        Repeater0x02Parser.prototype.getDataFromPayload = function (payload) {
            var appContent = {};
            codec.RepeaterHelper.getUPStatusFromPayload(payload, appContent);
            appContent['numberOfIdInWl'] = payload.readUInt8(2);
            return appContent;
        };
        return Repeater0x02Parser;
    }());
    codec.Repeater0x02Parser = Repeater0x02Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Repeater0x03Parser = (function () {
        function Repeater0x03Parser() {
            this.deviceType = 'repeater';
            this.frameCode = 0x03;
        }
        Repeater0x03Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = __assign({ type: '0x03 Repeater DL confirmation' }, this.getDataFromPayload(payload));
            return appContent;
        };
        Repeater0x03Parser.prototype.getDataFromPayload = function (payload) {
            var appContent = {};
            codec.RepeaterHelper.getUPStatusFromPayload(payload, appContent);
            appContent['downlinkCode'] = codec.RepeaterHelper.getDownlinkDescriptionForCode(payload.readUInt8(2));
            appContent['downlinkErrorCode'] = codec.RepeaterHelper.getErrorDescriptionForCode(payload.readUInt8(3));
            return appContent;
        };
        return Repeater0x03Parser;
    }());
    codec.Repeater0x03Parser = Repeater0x03Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Repeater0x04Parser = (function () {
        function Repeater0x04Parser() {
            this.deviceType = 'repeater';
            this.frameCode = 0x04;
        }
        Repeater0x04Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = __assign({ type: '0x04 White List confirmation' }, this.getDataFromPayload(payload));
            return appContent;
        };
        Repeater0x04Parser.prototype.getDataFromPayload = function (payload) {
            var appContent = {};
            codec.RepeaterHelper.getUPStatusFromPayload(payload, appContent);
            appContent['numberOfIdInWl'] = payload.readUInt8(2);
            return appContent;
        };
        return Repeater0x04Parser;
    }());
    codec.Repeater0x04Parser = Repeater0x04Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var RepeaterStatusByteParser = (function () {
        function RepeaterStatusByteParser() {
            this.deviceType = 'repeater';
            this.frameCode = 0;
        }
        RepeaterStatusByteParser.prototype.parseFrame = function (payload, configuration) {
            return {};
        };
        return RepeaterStatusByteParser;
    }());
    codec.RepeaterStatusByteParser = RepeaterStatusByteParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var errorCode = {
        0x00: '0x00 The action has been correctly realized',
        0x0a: '0x0A Uplink code is invalid',
        0x0b: '0x0B Harware error, please contact adeunis support',
        0x0c: '0x0C Callback error',
        0x0d: '0x0D Generic error',
        0x01: '0x01 White List already empty',
        0x02: '0x02 White List not erased',
        0x03: '0x03 White List is empty, repeater switch into OPERATION with “auto-record” mode',
        0x04: '0x04 ID not found in the White List',
        0x05: '0x05 White List is full, “add an ID” not possible',
        0x06: '0x06 ID already existing in the White List',
        0x07: '0x07 No ID repeated, repeater stay into OPERATION with “auto-record” mode',
        0x08: '0x08 A White List is already existing, use “Suppress all IDs from White List” frame before',
        0x11: '0x11 Error with S300 configuration',
        0x12: '0x12 Error with S303 configuration',
        0x13: '0x13 Error with S300, S303 configuration',
        0x14: '0x14 Error with S304 configuration',
        0x15: '0x15 Error with S300, S304 configuration',
        0x16: '0x16 Error with S303, S304 configuration',
        0x17: '0x17 Error with S300, S303, S304 configuration',
        0x18: '0x18 Error with S306 configuration',
        0x19: '0x19 Error with S300, S306 configuration',
        0x1a: '0x1A Error with S303, S306 configuration',
        0x1b: '0x1B Error with S300, S303, S306 configuration',
        0x1c: '0x1C Error with S304, S306 configuration',
        0x1d: '0x1D Error with S300, S304, S306 configuration',
        0x1e: '0x1E Error with S303, S304, S306 configuration',
        0x1f: '0x1F Error with S300, S303, S304, S306 configuration',
    };
    var dlCode = {
        0x01: '0x01 Suppress all IDs from White List',
        0x02: '0x02 Delete an ID from White List',
        0x03: '0x03 Add an ID into White List',
        0x05: '0x05 Freeze the list of devices repeated in auto-record mode into the White List',
        0x04: '0x04 Modify Repeater configuration',
    };
    var RepeaterHelper = (function () {
        function RepeaterHelper() {
        }
        RepeaterHelper.hex2bin = function (hex) {
            return parseInt(hex, 16).toString(2).padStart(8, '0');
        };
        RepeaterHelper.getUPStatusFromPayload = function (payload, appContent) {
            var byte = payload[1];
            var charLb = 1;
            if (/^\d$/.test('' + byte)) {
                appContent['frameCounter'] = 0;
                charLb = 0;
            }
            else {
                appContent['frameCounter'] = parseInt(payload.readUInt8(1).toString(16).charAt(0), 16);
            }
            var hexLb = payload.readUInt8(1).toString(16);
            var binLb = RepeaterHelper.hex2bin(hexLb);
            var bitLb = binLb[binLb.length - 1];
            appContent['lowBattery'] = bitLb === '1' ? true : false;
            return appContent;
        };
        RepeaterHelper.getDownlinkDescriptionForCode = function (code) {
            return dlCode[code] || code;
        };
        RepeaterHelper.getErrorDescriptionForCode = function (code) {
            return errorCode[code] || code;
        };
        return RepeaterHelper;
    }());
    codec.RepeaterHelper = RepeaterHelper;
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
            _this.deviceType = 'repeater';
            return _this;
        }
        Decoder.prototype.getActiveParsers = function (frameCode) {
            var activeParsers = [];
            var statusByteParsers = new codec.RepeaterStatusByteParser();
            var dataParser;
            switch (frameCode) {
                case 0x01:
                    dataParser = new codec.Repeater0x01Parser();
                    break;
                case 0x02:
                    dataParser = new codec.Repeater0x02Parser();
                    break;
                case 0x03:
                    dataParser = new codec.Repeater0x03Parser();
                    break;
                case 0x04:
                    dataParser = new codec.Repeater0x04Parser();
                    break;
                case 0x20:
                    dataParser = new codec.Generic0x20Parser();
                    break;
                case 0x30:
                    dataParser = new codec.Generic0x30Parser();
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
