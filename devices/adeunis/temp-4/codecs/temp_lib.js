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
    var Generic0x36Parser = (function () {
        function Generic0x36Parser() {
            this.deviceType = 'temp4';
            this.frameCode = 0x36;
        }
        Generic0x36Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x36 Alert message' };
            switch (payload[2]) {
                case 0x00:
                    appContent['alertCode'] = 'normalState';
                    break;
                case 0x01:
                    appContent['alertCode'] = 'uplinkDownlinkForbidden';
                    break;
                default:
                    break;
            }
            return appContent;
        };
        return Generic0x36Parser;
    }());
    codec.Generic0x36Parser = Generic0x36Parser;
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
    var TempV40x10Parser = (function () {
        function TempV40x10Parser() {
            this.deviceType = 'temp4';
            this.frameCode = 0x10;
        }
        TempV40x10Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x10 Temp 4 configuration' };
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
        return TempV40x10Parser;
    }());
    codec.TempV40x10Parser = TempV40x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var TempV40x30Parser = (function () {
        function TempV40x30Parser() {
            this.deviceType = 'temp4';
            this.frameCode = 0x30;
        }
        TempV40x30Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x30 Temp 4 keep alive' };
            var nbSensors = payload[1] & 0x10 ? 2 : 1;
            if (payload[1] & 0x04) {
                var offsetType = nbSensors === 2 ? 6 : 4;
                var myDate = new Date((payload.readUInt32BE(offsetType) + 1356998400) * 1000);
                appContent['timestamp'] = myDate.toJSON().replace('Z', '');
            }
            var temperatures = [];
            temperatures['push']({ name: 'temperature 1', unit: '\u00B0' + 'C', value: payload.readInt16BE(2) / 10 });
            if (nbSensors === 2) {
                temperatures['push']({ name: 'temperature 2', unit: '\u00B0' + 'C', value: payload.readInt16BE(4) / 10 });
            }
            appContent['temperatures'] = temperatures;
            return appContent;
        };
        return TempV40x30Parser;
    }());
    codec.TempV40x30Parser = TempV40x30Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var TempV40x57Parser = (function () {
        function TempV40x57Parser() {
            this.deviceType = 'temp4';
            this.frameCode = 0x57;
        }
        TempV40x57Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x57 Temp 4 periodic data' };
            var nbSensors = payload[1] & 0x10 ? 2 : 1;
            var rawValue;
            var temperatures = [];
            var ch1Temp = [], ch2Temp = [];
            var payloadLength = payload[1] & 0x04 ? payload.length - 4 : payload.length;
            for (var offset = 2; offset < payloadLength; offset += 2 * nbSensors) {
                rawValue = payload.readInt16BE(offset);
                ch1Temp.push(rawValue / 10);
                if (nbSensors === 2) {
                    rawValue = payload.readInt16BE(offset + 2);
                    ch2Temp.push(rawValue / 10);
                }
            }
            if (payload[1] & 0x04) {
                var myDate = new Date((payload.readUInt32BE(payload.length - 4) + 1356998400) * 1000);
                appContent['timestamp'] = myDate.toJSON().replace('Z', '');
            }
            appContent['decodingInfo'] = 'values: [t=0, t-1, t-2, ...]';
            temperatures['push']({ name: 'temperature 1', unit: '\u00B0' + 'C', values: ch1Temp });
            if (nbSensors === 2) {
                temperatures['push']({ name: 'temperature 2', unit: '\u00B0' + 'C', values: ch2Temp });
            }
            appContent['temperatures'] = temperatures;
            return appContent;
        };
        return TempV40x57Parser;
    }());
    codec.TempV40x57Parser = TempV40x57Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var TempV40x58Parser = (function () {
        function TempV40x58Parser() {
            this.deviceType = 'temp4';
            this.frameCode = 0x58;
        }
        TempV40x58Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x58 Temp 4 alarm' };
            var alarms = [];
            var nbSensors = payload[1] & 0x10 ? 2 : 1;
            var offsetType = nbSensors === 2 ? 8 : 5;
            alarms['push']({
                name: 'temperature 1',
                alarmStatus: this.getAlarmStatusText(payload.readUInt8(2)),
                temperature: { unit: '\u00B0' + 'C', value: payload.readInt16BE(3) / 10 },
            });
            if (nbSensors === 2) {
                alarms['push']({
                    name: 'temperature 2',
                    alarmStatus: this.getAlarmStatusText(payload.readUInt8(5)),
                    temperature: { unit: '\u00B0' + 'C', value: payload.readInt16BE(6) / 10 },
                });
            }
            if (payload[1] & 0x04) {
                var myDate = new Date((payload.readUInt32BE(offsetType) + 1356998400) * 1000);
                appContent['timestamp'] = myDate.toJSON().replace('Z', '');
            }
            appContent['alarms'] = alarms;
            return appContent;
        };
        TempV40x58Parser.prototype.getAlarmStatusText = function (value) {
            switch (value) {
                case 1:
                    return 'highThreshold';
                case 2:
                    return 'lowThreshold';
                default:
                    return 'none';
            }
        };
        return TempV40x58Parser;
    }());
    codec.TempV40x58Parser = TempV40x58Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var TempV4StatusByteParser = (function () {
        function TempV4StatusByteParser() {
            this.deviceType = 'temp4';
            this.frameCode = 0;
        }
        TempV4StatusByteParser.prototype.parseFrame = function (payload, configuration, network) {
            var statusContent = {};
            var parser = new codec.GenericStatusByteParser();
            statusContent = parser.parseFrame(payload, configuration);
            statusContent['configurationInconsistency'] = Boolean(payload[1] & 0x08);
            statusContent['configuration2ChannelsActivated'] = Boolean(payload[1] & 0x10);
            statusContent['timestamp'] = Boolean(payload[1] & 0x04);
            return { status: statusContent };
        };
        return TempV4StatusByteParser;
    }());
    codec.TempV4StatusByteParser = TempV4StatusByteParser;
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
            _this.deviceType = 'temp4';
            return _this;
        }
        Decoder.prototype.getActiveParsers = function (frameCode) {
            var activeParsers = [];
            var statusByteParsers = new codec.TempV4StatusByteParser();
            var dataParser;
            switch (frameCode) {
                case 0x10:
                    dataParser = new codec.TempV40x10Parser();
                    break;
                case 0x30:
                    dataParser = new codec.TempV40x30Parser();
                    break;
                case 0x57:
                    dataParser = new codec.TempV40x57Parser();
                    break;
                case 0x58:
                    dataParser = new codec.TempV40x58Parser();
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
                case 0x36:
                    dataParser = new codec.Generic0x36Parser();
                    break;
                case 0x37:
                    dataParser = new codec.Generic0x37Parser();
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
