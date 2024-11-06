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
    var a = ((buffer[offset] << 24) | (buffer[offset + 1] << 16) | (buffer[offset + 2] << 8) | buffer[offset + 3]) >>> 0;
    if ((a & 0x80000000) > 0) {
        return a - 0x10000000;
    }
    return a;
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
    var PulseV4NbIot0x10Parser = (function () {
        function PulseV4NbIot0x10Parser() {
            this.deviceType = 'pulse4nbiot';
            this.frameCode = 0x10;
            this.hOffset = 13;
        }
        PulseV4NbIot0x10Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x10 Pulse 4 NB-IoT configuration' };
            var chA = { name: 'channel A' };
            var chB = { name: 'channel B' };
            appContent['productMode'] = codec.PlateformCommonUtils.getProductModeText(payload[this.hOffset + 2]);
            appContent['numberOfHistorizationBeforeSending'] = payload.readUInt16BE(this.hOffset + 3);
            appContent['samplingPeriod'] = { unit: 's', value: payload.readUInt16BE(this.hOffset + 6) * 2 };
            appContent['calculatedSendingPeriod'] = {
                unit: 's',
                value: payload.readUInt16BE(this.hOffset + 3) * payload.readUInt16BE(this.hOffset + 6) * 2,
            };
            if (payload[this.hOffset + 2] === 2) {
                appContent['flowCalculationPeriod'] = { unit: 's', value: payload.readUInt16BE(this.hOffset + 9) * 20 };
            }
            else {
                appContent['flowCalculationPeriod'] = { unit: 'm', value: payload.readUInt16BE(this.hOffset + 9) };
            }
            appContent['redundantSamples'] = payload.readUInt8(this.hOffset + 27);
            chA['state'] = this.getStateText(Boolean(payload[this.hOffset + 5] & 0x01));
            chA['type'] = this.getTypeText(Boolean(payload[this.hOffset + 5] & 0x02));
            chA['debouncingPeriod'] = {
                unit: 'ms',
                value: this.getDebouncingPeriodText(payload[this.hOffset + 8] & 0x0f),
            };
            chA['leakageDetection'] = {
                overflowAlarmTriggerThreshold: payload.readUInt16BE(this.hOffset + 11),
                threshold: payload.readUInt16BE(this.hOffset + 15),
                dailyPeriodsBelowWhichLeakageAlarmTriggered: payload.readUInt16BE(this.hOffset + 19),
            };
            chA['tamper'] = {
                activated: Boolean(payload[this.hOffset + 5] & 0x08),
                samplePeriodForDetection: { unit: 's', value: payload.readUInt8(this.hOffset + 23) * 10 },
                threshold: payload.readUInt8(this.hOffset + 24),
            };
            chB['state'] = this.getStateText(Boolean(payload[this.hOffset + 5] & 0x10));
            chB['type'] = this.getTypeText(Boolean(payload[this.hOffset + 5] & 0x20));
            chB['debouncingPeriod'] = {
                unit: 'ms',
                value: this.getDebouncingPeriodText((payload[this.hOffset + 8] & 0xf0) >> 4),
            };
            chB['leakageDetection'] = {
                overflowAlarmTriggerThreshold: payload.readUInt16BE(this.hOffset + 13),
                threshold: payload.readUInt16BE(this.hOffset + 17),
                dailyPeriodsBelowWhichLeakageAlarmTriggered: payload.readUInt16BE(this.hOffset + 21),
            };
            chB['tamper'] = {
                activated: Boolean(payload[this.hOffset + 5] & 0x80),
                samplePeriodForDetection: { unit: 's', value: payload.readUInt8(this.hOffset + 25) * 10 },
                threshold: payload.readUInt8(this.hOffset + 26),
            };
            appContent['channels'] = [chA, chB];
            return appContent;
        };
        PulseV4NbIot0x10Parser.prototype.getStateText = function (value) {
            return value ? 'enabled' : 'disabled';
        };
        PulseV4NbIot0x10Parser.prototype.getTypeText = function (value) {
            return value ? 'gasPullUpOn' : 'otherPullUpOff';
        };
        PulseV4NbIot0x10Parser.prototype.getDebouncingPeriodText = function (value) {
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
        return PulseV4NbIot0x10Parser;
    }());
    codec.PulseV4NbIot0x10Parser = PulseV4NbIot0x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var PulseV4NbIot0x20Parser = (function () {
        function PulseV4NbIot0x20Parser() {
            this.deviceType = 'pulse4nbiot';
            this.frameCode = 0x20;
            this.hOffset = 13;
        }
        PulseV4NbIot0x20Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x20 Pulse 4 NB-IoT Configuration' };
            appContent['remoteServerIpAddress'] = this.payloadToString(payload, this.hOffset + 2, this.hOffset + 2 + 30);
            appContent['remoteServerPort'] = payload.readUInt16BE(this.hOffset + 33);
            appContent['localPort'] = payload.readUInt16BE(this.hOffset + 35);
            appContent['apn'] = this.payloadToString(payload, this.hOffset + 37, this.hOffset + 37 + 30);
            return appContent;
        };
        PulseV4NbIot0x20Parser.prototype.payloadToString = function (payload, start, end) {
            var charCode = [];
            for (var i = start; i < end; i++) {
                if (payload[i] !== 0x00) {
                    charCode.push(payload[i]);
                }
            }
            return String.fromCharCode.apply(String, charCode);
        };
        return PulseV4NbIot0x20Parser;
    }());
    codec.PulseV4NbIot0x20Parser = PulseV4NbIot0x20Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var PulseV4NbIot0x30Parser = (function () {
        function PulseV4NbIot0x30Parser() {
            this.deviceType = 'pulse4nbiot';
            this.frameCode = 0x30;
            this.hOffset = 13;
        }
        PulseV4NbIot0x30Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x30 Pulse 4 NB-IoT keep alive' };
            if (payload[this.hOffset + 1] & 0x04) {
                var myDate = new Date((payload.readUInt32BE(this.hOffset + 11) + 1356998400) * 1000);
                appContent['timestamp'] = myDate.toJSON().replace('Z', '');
            }
            var chA = { name: 'channel A' };
            var chB = { name: 'channel B' };
            chA['flow'] = {
                alarm: Boolean(payload[this.hOffset + 2] & 0x01),
                last24hMin: payload.readUInt16BE(this.hOffset + 7),
                last24hMax: payload.readUInt16BE(this.hOffset + 3),
            };
            chA['tamperAlarm'] = Boolean(payload[this.hOffset + 2] & 0x04);
            chA['leakageAlarm'] = Boolean(payload[this.hOffset + 2] & 0x10);
            chB['flow'] = {
                alarm: Boolean(payload[this.hOffset + 2] & 0x02),
                last24hMin: payload.readUInt16BE(this.hOffset + 9),
                last24hMax: payload.readUInt16BE(this.hOffset + 5),
            };
            chB['tamperAlarm'] = Boolean(payload[this.hOffset + 2] & 0x08);
            chB['leakageAlarm'] = Boolean(payload[this.hOffset + 2] & 0x20);
            appContent['channels'] = [chA, chB];
            return appContent;
        };
        return PulseV4NbIot0x30Parser;
    }());
    codec.PulseV4NbIot0x30Parser = PulseV4NbIot0x30Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var PulseV4NbIot0x33Parser = (function () {
        function PulseV4NbIot0x33Parser() {
            this.deviceType = 'pulse4nbiot';
            this.frameCode = 0x33;
            this.hOffset = 13;
        }
        PulseV4NbIot0x33Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x33 Set register status' };
            appContent['requestStatus'] = this.getRequestStatusText(payload[this.hOffset + 2]);
            appContent['registerId'] = payload.readUInt16BE(this.hOffset + 3);
            return appContent;
        };
        PulseV4NbIot0x33Parser.prototype.getRequestStatusText = function (value) {
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
        return PulseV4NbIot0x33Parser;
    }());
    codec.PulseV4NbIot0x33Parser = PulseV4NbIot0x33Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var PulseV4NbIot0x46Parser = (function () {
        function PulseV4NbIot0x46Parser() {
            this.deviceType = 'pulse4nbiot';
            this.frameCode = 0x46;
            this.hOffset = 13;
        }
        PulseV4NbIot0x46Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x46 Pulse 4 NB-IoT data' };
            if (payload[this.hOffset + 1] & 0x04) {
                var myDate = new Date((payload.readUInt32BE(this.hOffset + 10) + 1356998400) * 1000);
                appContent['timestamp'] = myDate.toJSON().replace('Z', '');
            }
            appContent['decodingInfo'] = 'counterValues: [Channel A, Channel B]';
            appContent['counterValues'] = [payload.readUInt32BE(this.hOffset + 2), payload.readUInt32BE(this.hOffset + 6)];
            return appContent;
        };
        return PulseV4NbIot0x46Parser;
    }());
    codec.PulseV4NbIot0x46Parser = PulseV4NbIot0x46Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var PulseV4NbIot0x47Parser = (function () {
        function PulseV4NbIot0x47Parser() {
            this.deviceType = 'pulse4nbiot';
            this.frameCode = 0x47;
            this.hOffset = 13;
        }
        PulseV4NbIot0x47Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x47 Pulse 4 NB-IoT alarm' };
            if (payload[this.hOffset + 1] & 0x04) {
                var myDate = new Date((payload.readUInt32BE(this.hOffset + 6) + 1356998400) * 1000);
                appContent['timestamp'] = myDate.toJSON().replace('Z', '');
            }
            appContent['decodingInfo'] = 'flowValues: [Channel A, Channel B]';
            appContent['flowValues'] = [payload.readUInt16BE(this.hOffset + 2), payload.readUInt16BE(this.hOffset + 4)];
            return appContent;
        };
        return PulseV4NbIot0x47Parser;
    }());
    codec.PulseV4NbIot0x47Parser = PulseV4NbIot0x47Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var PulseV4NbIot0x5aParser = (function () {
        function PulseV4NbIot0x5aParser() {
            this.deviceType = 'pulse4nbiot';
            this.frameCode = 0x5a;
            this.hOffset = 13;
        }
        PulseV4NbIot0x5aParser.prototype.parseFrame = function (payload, configuration, network) {
            var absCounterValue = payload.readUInt32BE(this.hOffset + 2);
            var appContent = { type: '0x5a Pulse 4 NB-IoT data - channel A' };
            var values = [absCounterValue];
            var payloadLength = payload[this.hOffset + 1] & 0x04 ? payload.length - 4 : payload.length;
            if (payload[this.hOffset + 1] & 0x04) {
                var myDate = new Date((payload.readUInt32BE(payload.length - 4) + 1356998400) * 1000);
                appContent['timestamp'] = myDate.toJSON().replace('Z', '');
            }
            for (var offset = this.hOffset + 6; offset < payloadLength; offset += 2) {
                absCounterValue -= payload.readUInt16BE(offset);
                values.push(absCounterValue);
            }
            appContent['decodingInfo'] = 'counterValues: [t=0, t-1, t-2, ...]';
            appContent['counterValues'] = values;
            return appContent;
        };
        PulseV4NbIot0x5aParser.prototype.getReadingFrequency = function (configuration) {
            return configuration.byteLength > 0 ? configuration.readUInt16BE(8) * configuration.readUInt16BE(6) * 2 : null;
        };
        return PulseV4NbIot0x5aParser;
    }());
    codec.PulseV4NbIot0x5aParser = PulseV4NbIot0x5aParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var PulseV4NbIot0x5bParser = (function () {
        function PulseV4NbIot0x5bParser() {
            this.deviceType = 'pulse4nbiot';
            this.frameCode = 0x5b;
            this.hOffset = 13;
        }
        PulseV4NbIot0x5bParser.prototype.parseFrame = function (payload, configuration, network) {
            var absCounterValue = payload.readUInt32BE(this.hOffset + 2);
            var appContent = { type: '0x5b Pulse 4 NB-IoT data - channel B' };
            var values = [absCounterValue];
            var payloadLength = payload[this.hOffset + 1] & 0x04 ? payload.length - 4 : payload.length;
            if (payload[this.hOffset + 1] & 0x04) {
                var myDate = new Date((payload.readUInt32BE(payload.length - 4) + 1356998400) * 1000);
                appContent['timestamp'] = myDate.toJSON().replace('Z', '');
            }
            for (var offset = this.hOffset + 6; offset < payloadLength; offset += 2) {
                absCounterValue -= payload.readUInt16BE(offset);
                values.push(absCounterValue);
            }
            appContent['decodingInfo'] = 'counterValues: [t=0, t-1, t-2, ...]';
            appContent['counterValues'] = values;
            return appContent;
        };
        PulseV4NbIot0x5bParser.prototype.getReadingFrequency = function (configuration) {
            return configuration.byteLength > 0 ? configuration.readUInt16BE(8) * configuration.readUInt16BE(6) * 2 : null;
        };
        return PulseV4NbIot0x5bParser;
    }());
    codec.PulseV4NbIot0x5bParser = PulseV4NbIot0x5bParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var PulseV4NbIotStatusByteParser = (function () {
        function PulseV4NbIotStatusByteParser() {
            this.deviceType = 'pulse4nbiot';
            this.frameCode = 0;
            this.hOffset = 13;
        }
        PulseV4NbIotStatusByteParser.prototype.parseFrame = function (payload, configuration, network) {
            var headerContent = {};
            var statusContent = {};
            headerContent['imei'] = payload.readUInt32BE(0).toString(16) + payload.readUInt32BE(4).toString(16);
            headerContent['signalQuality'] = payload[8];
            headerContent['globalFrameCounter'] = payload.readUInt32BE(9);
            statusContent['frameCounter'] = (payload[this.hOffset + 1] & 0xe0) >> 5;
            statusContent['lowBattery'] = Boolean(payload[this.hOffset + 1] & 0x02);
            statusContent['configurationDone'] = Boolean(payload[this.hOffset + 1] & 0x01);
            statusContent['timestamp'] = Boolean(payload[this.hOffset + 1] & 0x04);
            return { nbIot: headerContent, status: statusContent };
        };
        return PulseV4NbIotStatusByteParser;
    }());
    codec.PulseV4NbIotStatusByteParser = PulseV4NbIotStatusByteParser;
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
            _this.deviceType = 'pulse4nbiot';
            return _this;
        }
        Decoder.prototype.decode = function (payload) {
            var _this = this;
            var frameCode = payload[13];
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
        Decoder.prototype.getActiveParsers = function (frameCode) {
            var activeParsers = [];
            var statusByteParsers = new codec.PulseV4NbIotStatusByteParser();
            var dataParser;
            switch (frameCode) {
                case 0x10:
                    dataParser = new codec.PulseV4NbIot0x10Parser();
                    break;
                case 0x20:
                    dataParser = new codec.PulseV4NbIot0x20Parser();
                    break;
                case 0x30:
                    dataParser = new codec.PulseV4NbIot0x30Parser();
                    break;
                case 0x33:
                    dataParser = new codec.PulseV4NbIot0x33Parser();
                    break;
                case 0x46:
                    dataParser = new codec.PulseV4NbIot0x46Parser();
                    break;
                case 0x47:
                    dataParser = new codec.PulseV4NbIot0x47Parser();
                    break;
                case 0x5a:
                    dataParser = new codec.PulseV4NbIot0x5aParser();
                    break;
                case 0x5b:
                    dataParser = new codec.PulseV4NbIot0x5bParser();
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
