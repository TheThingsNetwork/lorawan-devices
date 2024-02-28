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
    var PulseV40x10Parser = (function () {
        function PulseV40x10Parser() {
            this.deviceType = 'pulse4';
            this.frameCode = 0x10;
        }
        PulseV40x10Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x10 Pulse 4 configuration' };
            var chA = { name: 'channel A' };
            var chB = { name: 'channel B' };
            appContent['productMode'] = codec.PlateformCommonUtils.getProductModeText(payload[2]);
            var knownNetwork = this.inferNetwork(payload.length);
            appContent['numberOfHistorizationBeforeSending'] = payload.readUInt16BE(3);
            appContent['samplingPeriod'] = { unit: 's', value: payload.readUInt16BE(6) * 2 };
            appContent['calculatedSendingPeriod'] = {
                unit: 's',
                value: payload.readUInt16BE(3) * payload.readUInt16BE(6) * 2,
            };
            if (payload[2] === 2) {
                appContent['flowCalculationPeriod'] = { unit: 's', value: payload.readUInt16BE(9) * 20 };
            }
            else {
                appContent['flowCalculationPeriod'] = { unit: 'm', value: payload.readUInt16BE(9) };
            }
            if (knownNetwork === 'lora868') {
                appContent['redundantSamples'] = payload.readUInt8(27);
            }
            chA['state'] = this.getStateText(Boolean(payload[5] & 0x01));
            chA['type'] = this.getTypeText(Boolean(payload[5] & 0x02));
            chA['debouncingPeriod'] = {
                unit: 'ms',
                value: this.getDebouncingPeriodText(payload[8] & 0x0f),
            };
            if (knownNetwork === 'lora868') {
                chA['leakageDetection'] = {
                    overflowAlarmTriggerThreshold: payload.readUInt16BE(11),
                    threshold: payload.readUInt16BE(15),
                    dailyPeriodsBelowWhichLeakageAlarmTriggered: payload.readUInt16BE(19),
                };
                chA['tamper'] = {
                    activated: Boolean(payload[5] & 0x08),
                    samplePeriodForDetection: { unit: 's', value: payload.readUInt8(23) * 10 },
                    threshold: payload.readUInt8(24),
                };
            }
            else if (knownNetwork === 'sigfox') {
                chA['tamper'] = { activated: Boolean(payload[5] & 0x08) };
            }
            chB['state'] = this.getStateText(Boolean(payload[5] & 0x10));
            chB['type'] = this.getTypeText(Boolean(payload[5] & 0x20));
            chB['debouncingPeriod'] = {
                unit: 'ms',
                value: this.getDebouncingPeriodText((payload[8] & 0xf0) >> 4),
            };
            if (knownNetwork === 'lora868') {
                chB['leakageDetection'] = {
                    overflowAlarmTriggerThreshold: payload.readUInt16BE(13),
                    threshold: payload.readUInt16BE(17),
                    dailyPeriodsBelowWhichLeakageAlarmTriggered: payload.readUInt16BE(21),
                };
                chB['tamper'] = {
                    activated: Boolean(payload[5] & 0x80),
                    samplePeriodForDetection: { unit: 's', value: payload.readUInt8(25) * 10 },
                    threshold: payload.readUInt8(26),
                };
            }
            else if (knownNetwork === 'sigfox') {
                chB['tamper'] = { activated: Boolean(payload[5] & 0x80) };
            }
            appContent['channels'] = [chA, chB];
            return appContent;
        };
        PulseV40x10Parser.prototype.inferNetwork = function (length) {
            switch (length) {
                case 28:
                    return 'lora868';
                case 11:
                    return 'sigfox';
                default:
                    return 'unknown';
            }
        };
        PulseV40x10Parser.prototype.getStateText = function (value) {
            return value ? 'enabled' : 'disabled';
        };
        PulseV40x10Parser.prototype.getTypeText = function (value) {
            return value ? 'gasPullUpOn' : 'otherPullUpOff';
        };
        PulseV40x10Parser.prototype.getDebouncingPeriodText = function (value) {
            switch (value) {
                case 0:
                    return 0;
                case 1:
                    return 1;
                case 2:
                    return 10;
                case 3:
                    return 20;
                case 4:
                    return 50;
                case 5:
                    return 100;
                case 6:
                    return 200;
                case 7:
                    return 500;
                case 8:
                    return 1000;
                case 9:
                    return 2000;
                case 10:
                    return 5000;
                case 11:
                    return 10000;
                default:
                    return 0;
            }
        };
        return PulseV40x10Parser;
    }());
    codec.PulseV40x10Parser = PulseV40x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var PulseV40x11Parser = (function () {
        function PulseV40x11Parser() {
            this.deviceType = 'pulse4';
            this.frameCode = 0x11;
        }
        PulseV40x11Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x11 Pulse 4 configuration' };
            var chA = { name: 'channel A' };
            var chB = { name: 'channel B' };
            chA['leakageDetection'] = {
                overflowAlarmTriggerThreshold: payload.readUInt16BE(2),
                threshold: payload.readUInt16BE(6),
            };
            chB['leakageDetection'] = {
                overflowAlarmTriggerThreshold: payload.readUInt16BE(4),
                threshold: payload.readUInt16BE(8),
            };
            appContent['channels'] = [chA, chB];
            return appContent;
        };
        return PulseV40x11Parser;
    }());
    codec.PulseV40x11Parser = PulseV40x11Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var PulseV40x12Parser = (function () {
        function PulseV40x12Parser() {
            this.deviceType = 'pulse4';
            this.frameCode = 0x12;
        }
        PulseV40x12Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x12 Pulse 4 configuration' };
            var chA = { name: 'channel A' };
            var chB = { name: 'channel B' };
            chA['leakageDetection'] = {
                dailyPeriodsBelowWhichLeakageAlarmTriggered: payload.readUInt16BE(2),
            };
            chA['tamper'] = {
                samplePeriodForDetection: { unit: 's', value: payload.readUInt8(6) * 10 },
                threshold: payload.readUInt8(7),
            };
            chB['leakageDetection'] = {
                dailyPeriodsBelowWhichLeakageAlarmTriggered: payload.readUInt16BE(4),
            };
            chB['tamper'] = {
                samplePeriodForDetection: { unit: 's', value: payload.readUInt8(8) * 10 },
                threshold: payload.readUInt8(9),
            };
            appContent['channels'] = [chA, chB];
            return appContent;
        };
        return PulseV40x12Parser;
    }());
    codec.PulseV40x12Parser = PulseV40x12Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var PulseV40x30Parser = (function () {
        function PulseV40x30Parser() {
            this.deviceType = 'pulse4';
            this.frameCode = 0x30;
        }
        PulseV40x30Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x30 Pulse 4 keep alive' };
            if (payload[1] & 0x04) {
                var myDate = new Date((payload.readUInt32BE(11) + 1356998400) * 1000);
                appContent['timestamp'] = myDate.toJSON().replace('Z', '');
            }
            var chA = { name: 'channel A' };
            var chB = { name: 'channel B' };
            chA['flow'] = {
                alarm: Boolean(payload[2] & 0x01),
                last24hMin: payload.readUInt16BE(7),
                last24hMax: payload.readUInt16BE(3),
            };
            chA['tamperAlarm'] = Boolean(payload[2] & 0x04);
            chA['leakageAlarm'] = Boolean(payload[2] & 0x10);
            chB['flow'] = {
                alarm: Boolean(payload[2] & 0x02),
                last24hMin: payload.readUInt16BE(9),
                last24hMax: payload.readUInt16BE(5),
            };
            chB['tamperAlarm'] = Boolean(payload[2] & 0x08);
            chB['leakageAlarm'] = Boolean(payload[2] & 0x20);
            appContent['channels'] = [chA, chB];
            return appContent;
        };
        return PulseV40x30Parser;
    }());
    codec.PulseV40x30Parser = PulseV40x30Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var PulseV40x46Parser = (function () {
        function PulseV40x46Parser() {
            this.deviceType = 'pulse4';
            this.frameCode = 0x46;
        }
        PulseV40x46Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x46 Pulse 4 data' };
            if (payload[1] & 0x04) {
                var myDate = new Date((payload.readUInt32BE(10) + 1356998400) * 1000);
                appContent['timestamp'] = myDate.toJSON().replace('Z', '');
            }
            appContent['decodingInfo'] = 'counterValues: [Channel A, Channel B]';
            appContent['counterValues'] = [payload.readUInt32BE(2), payload.readUInt32BE(6)];
            return appContent;
        };
        return PulseV40x46Parser;
    }());
    codec.PulseV40x46Parser = PulseV40x46Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var PulseV40x47Parser = (function () {
        function PulseV40x47Parser() {
            this.deviceType = 'pulse4';
            this.frameCode = 0x47;
        }
        PulseV40x47Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x47 Pulse 4 alarm' };
            if (payload[1] & 0x04) {
                var myDate = new Date((payload.readUInt32BE(6) + 1356998400) * 1000);
                appContent['timestamp'] = myDate.toJSON().replace('Z', '');
            }
            appContent['decodingInfo'] = 'flowValues: [Channel A, Channel B]';
            appContent['flowValues'] = [payload.readUInt16BE(2), payload.readUInt16BE(4)];
            return appContent;
        };
        return PulseV40x47Parser;
    }());
    codec.PulseV40x47Parser = PulseV40x47Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var PulseV40x5aParser = (function () {
        function PulseV40x5aParser() {
            this.deviceType = 'pulse4';
            this.frameCode = 0x5a;
        }
        PulseV40x5aParser.prototype.parseFrame = function (payload, configuration, network) {
            var absCounterValue = payload.readUInt32BE(2);
            var appContent = { type: '0x5a Pulse 4 data - channel A' };
            var values = [absCounterValue];
            var payloadLength = payload[1] & 0x04 ? payload.length - 4 : payload.length;
            if (payload[1] & 0x04) {
                var myDate = new Date((payload.readUInt32BE(payload.length - 4) + 1356998400) * 1000);
                appContent['timestamp'] = myDate.toJSON().replace('Z', '');
            }
            for (var offset = 6; offset < payloadLength; offset += 2) {
                absCounterValue -= payload.readUInt16BE(offset);
                values.push(absCounterValue);
            }
            appContent['decodingInfo'] = 'counterValues: [t=0, t-1, t-2, ...]';
            appContent['counterValues'] = values;
            return appContent;
        };
        PulseV40x5aParser.prototype.getReadingFrequency = function (configuration) {
            return configuration.byteLength > 0 ? configuration.readUInt16BE(8) * configuration.readUInt16BE(6) * 2 : null;
        };
        return PulseV40x5aParser;
    }());
    codec.PulseV40x5aParser = PulseV40x5aParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var PulseV40x5bParser = (function () {
        function PulseV40x5bParser() {
            this.deviceType = 'pulse4';
            this.frameCode = 0x5b;
        }
        PulseV40x5bParser.prototype.parseFrame = function (payload, configuration, network) {
            var absCounterValue = payload.readUInt32BE(2);
            var appContent = { type: '0x5b Pulse 4 data - channel B' };
            var values = [absCounterValue];
            var payloadLength = payload[1] & 0x04 ? payload.length - 4 : payload.length;
            if (payload[1] & 0x04) {
                var myDate = new Date((payload.readUInt32BE(payload.length - 4) + 1356998400) * 1000);
                appContent['timestamp'] = myDate.toJSON().replace('Z', '');
            }
            for (var offset = 6; offset < payloadLength; offset += 2) {
                absCounterValue -= payload.readUInt16BE(offset);
                values.push(absCounterValue);
            }
            appContent['decodingInfo'] = 'counterValues: [t=0, t-1, t-2, ...]';
            appContent['counterValues'] = values;
            return appContent;
        };
        PulseV40x5bParser.prototype.getReadingFrequency = function (configuration) {
            return configuration.byteLength > 0 ? configuration.readUInt16BE(8) * configuration.readUInt16BE(6) * 2 : null;
        };
        return PulseV40x5bParser;
    }());
    codec.PulseV40x5bParser = PulseV40x5bParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var PulseV4StatusByteParser = (function () {
        function PulseV4StatusByteParser() {
            this.deviceType = 'pulse4';
            this.frameCode = 0;
        }
        PulseV4StatusByteParser.prototype.parseFrame = function (payload, configuration, network) {
            var statusContent = {};
            var parser = new codec.GenericStatusByteParser();
            statusContent = parser.parseFrame(payload, configuration);
            statusContent['timestamp'] = Boolean(payload[1] & 0x04);
            return { status: statusContent };
        };
        return PulseV4StatusByteParser;
    }());
    codec.PulseV4StatusByteParser = PulseV4StatusByteParser;
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
            _this.deviceType = 'pulse4';
            return _this;
        }
        Decoder.prototype.getActiveParsers = function (frameCode) {
            var activeParsers = [];
            var statusByteParsers = new codec.PulseV4StatusByteParser();
            var dataParser;
            switch (frameCode) {
                case 0x10:
                    dataParser = new codec.PulseV40x10Parser();
                    break;
                case 0x11:
                    dataParser = new codec.PulseV40x11Parser();
                    break;
                case 0x12:
                    dataParser = new codec.PulseV40x12Parser();
                    break;
                case 0x30:
                    dataParser = new codec.PulseV40x30Parser();
                    break;
                case 0x46:
                    dataParser = new codec.PulseV40x46Parser();
                    break;
                case 0x47:
                    dataParser = new codec.PulseV40x47Parser();
                    break;
                case 0x5a:
                    dataParser = new codec.PulseV40x5aParser();
                    break;
                case 0x5b:
                    dataParser = new codec.PulseV40x5bParser();
                    break;
                case 0x20:
                    dataParser = new codec.Generic0x20Parser();
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
