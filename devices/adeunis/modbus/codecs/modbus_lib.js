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
    var Modbus0x10Parser = (function () {
        function Modbus0x10Parser() {
            this.deviceType = 'modbus';
            this.frameCode = 0x10;
        }
        Modbus0x10Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x10 Modbus configuration' };
            appContent['transmissionPeriodKeepAlive'] = { unit: 's', value: payload.readUInt16BE(2) * 10 };
            appContent['transmissionPeriod1'] = { unit: 's', value: payload.readUInt16BE(4) * 10 };
            appContent['samplingPeriod'] = { unit: 's', value: payload.readUInt16BE(6) * 10 };
            appContent['modbusConfiguration'] = payload[8];
            appContent['supplyTime'] = { unit: 's', value: payload.readUInt16BE(9) / 10 };
            return appContent;
        };
        return Modbus0x10Parser;
    }());
    codec.Modbus0x10Parser = Modbus0x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Modbus0x44Parser = (function () {
        function Modbus0x44Parser() {
            this.deviceType = 'modbus';
            this.frameCode = 0x44;
        }
        Modbus0x44Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x44 Modbus data (int32)' };
            var registers = [];
            for (var offset = 2; offset < payload.length; offset += 4) {
                registers.push(payload.readInt32BE(offset));
            }
            appContent['registerValues'] = registers;
            return appContent;
        };
        return Modbus0x44Parser;
    }());
    codec.Modbus0x44Parser = Modbus0x44Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Modbus0x45Parser = (function () {
        function Modbus0x45Parser() {
            this.deviceType = 'modbus';
            this.frameCode = 0x45;
        }
        Modbus0x45Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x45 Modbus alarm' };
            appContent['alarmStatus'] = this.getAlarmStatusText(payload.readUInt8(2));
            appContent['slaveAdress'] = payload.readUInt8(3);
            appContent['registerAddress'] = payload.readUInt16BE(4);
            appContent['registerUint16Value1'] = payload.readUInt16BE(6);
            if (payload.length == 10) {
                appContent['registerUint16Value2'] = payload.readUInt16BE(8);
            }
            return appContent;
        };
        Modbus0x45Parser.prototype.getAlarmStatusText = function (value) {
            switch (value) {
                case 1:
                    return 'highThreshold';
                case 2:
                    return 'lowThreshold';
                default:
                    return 'none';
            }
        };
        return Modbus0x45Parser;
    }());
    codec.Modbus0x45Parser = Modbus0x45Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Modbus0x5eParser = (function () {
        function Modbus0x5eParser() {
            this.deviceType = 'modbus';
            this.frameCode = 0x5e;
        }
        Modbus0x5eParser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x5e Modbus read registers' };
            var registers = [];
            for (var offset = 2; offset < payload.length; offset += 2) {
                registers.push(payload.readUInt16BE(offset));
            }
            appContent['registerUint16Values'] = registers;
            return appContent;
        };
        return Modbus0x5eParser;
    }());
    codec.Modbus0x5eParser = Modbus0x5eParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Modbus0x5fParser = (function () {
        function Modbus0x5fParser() {
            this.deviceType = 'modbus';
            this.frameCode = 0x5f;
        }
        Modbus0x5fParser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x5f Modbus data (int32)' };
            var registers = [];
            for (var offset = 2; offset < payload.length; offset += 4) {
                registers.push(payload.readInt32BE(offset));
            }
            appContent['registerValues'] = registers;
            return appContent;
        };
        return Modbus0x5fParser;
    }());
    codec.Modbus0x5fParser = Modbus0x5fParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Modbus0x60Parser = (function () {
        function Modbus0x60Parser() {
            this.deviceType = 'modbus';
            this.frameCode = 0x60;
        }
        Modbus0x60Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x60 Modbus data (float)' };
            var registers = [];
            for (var offset = 2; offset < payload.length; offset += 4) {
                registers.push(payload.readFloatBE(offset));
            }
            appContent['registerValues'] = registers;
            return appContent;
        };
        return Modbus0x60Parser;
    }());
    codec.Modbus0x60Parser = Modbus0x60Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Modbus0x61Parser = (function () {
        function Modbus0x61Parser() {
            this.deviceType = 'modbus';
            this.frameCode = 0x61;
        }
        Modbus0x61Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x61 Modbus data (float)' };
            var registers = [];
            for (var offset = 2; offset < payload.length; offset += 4) {
                registers.push(payload.readFloatBE(offset));
            }
            appContent['registerValues'] = registers;
            return appContent;
        };
        return Modbus0x61Parser;
    }());
    codec.Modbus0x61Parser = Modbus0x61Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Modbus0x62Parser = (function () {
        function Modbus0x62Parser() {
            this.deviceType = 'modbus';
            this.frameCode = 0x62;
        }
        Modbus0x62Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x62 Modbus data (uint32)' };
            var registers = [];
            for (var offset = 2; offset < payload.length; offset += 4) {
                registers.push(payload.readUInt32BE(offset));
            }
            appContent['registerValues'] = registers;
            return appContent;
        };
        return Modbus0x62Parser;
    }());
    codec.Modbus0x62Parser = Modbus0x62Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var Modbus0x63Parser = (function () {
        function Modbus0x63Parser() {
            this.deviceType = 'modbus';
            this.frameCode = 0x63;
        }
        Modbus0x63Parser.prototype.parseFrame = function (payload, configuration, network) {
            var appContent = { type: '0x63 Modbus data (uint32)' };
            var registers = [];
            for (var offset = 2; offset < payload.length; offset += 4) {
                registers.push(payload.readUInt32BE(offset));
            }
            appContent['registerValues'] = registers;
            return appContent;
        };
        return Modbus0x63Parser;
    }());
    codec.Modbus0x63Parser = Modbus0x63Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    var ModbusStatusByteParser = (function () {
        function ModbusStatusByteParser() {
            this.deviceType = 'modbus';
            this.frameCode = 0;
        }
        ModbusStatusByteParser.prototype.parseFrame = function (payload, configuration) {
            var statusContent = {};
            statusContent['frameCounter'] = (payload[1] & 0xe0) >> 5;
            statusContent['configurationDone'] = Boolean(payload[1] & 0x01);
            statusContent['lowBattery'] = Boolean(payload[1] & 0x02);
            statusContent['hardwareError'] = Boolean(payload[1] & 0x04);
            statusContent['configurationInconsistency'] = Boolean(payload[1] & 0x08);
            statusContent['modbusReadError'] = Boolean(payload[1] & 0x10);
            return { status: statusContent };
        };
        return ModbusStatusByteParser;
    }());
    codec.ModbusStatusByteParser = ModbusStatusByteParser;
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
            _this.deviceType = 'modbus';
            return _this;
        }
        Decoder.prototype.getActiveParsers = function (frameCode) {
            var activeParsers = [];
            var statusByteParsers = new codec.ModbusStatusByteParser();
            var dataParser;
            switch (frameCode) {
                case 0x10:
                    dataParser = new codec.Modbus0x10Parser();
                    break;
                case 0x20:
                    dataParser = new codec.Generic0x20Parser();
                    break;
                case 0x2f:
                    dataParser = new codec.Generic0x2fParser();
                    break;
                case 0x30:
                    dataParser = new codec.Generic0x30Parser();
                    break;
                case 0x33:
                    dataParser = new codec.Generic0x33Parser();
                    break;
                case 0x44:
                    dataParser = new codec.Modbus0x44Parser();
                    break;
                case 0x45:
                    dataParser = new codec.Modbus0x45Parser();
                    break;
                case 0x5e:
                    dataParser = new codec.Modbus0x5eParser();
                    break;
                case 0x5f:
                    dataParser = new codec.Modbus0x5fParser();
                    break;
                case 0x60:
                    dataParser = new codec.Modbus0x60Parser();
                    break;
                case 0x61:
                    dataParser = new codec.Modbus0x61Parser();
                    break;
                case 0x62:
                    dataParser = new codec.Modbus0x62Parser();
                    break;
                case 0x63:
                    dataParser = new codec.Modbus0x63Parser();
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
