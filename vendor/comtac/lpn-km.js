/*
  comtac AG
  LPN KM payload decoder (TTN/TTI v3). 
  www.comtac.ch
  manuel.bruetsch@comtac.ch
*/

//DEFINES
var PAYLOAD_DECODER_VERSION = "000"; //USC2: added
var PAYLOAD_DECODER_INFO = "TTN/TTI"; //USC2: added
var DEVICE_DESIGNATION_LPN_KM = "LPN-KM"; //USC2: added
var DEVICE_MANUFACTURER = "comtac AG"; //USC2: added

var PAYLOAD_VERSION = 0x00; //PL version 0

var FIXED_DATA_PORT = 3; //FIXED_DATA port
var DI_DATA_PORT = 20; //DI_DATA port
var CNT_DATA_PORT = 21; //CNT_DATA port
var TIMESYNC_PORT = 22; //TIMESYNC port
var CONFIG_PORT = 100; //CONFIG port
var INFO_PORT = 101; //INFO port

//SETTINGS
//Device Information
var DI_LABEL = 0x00;


//Device Settings
var DS_DEFAULT_SUPPLY_MODE = 0x01;
var DS_BUFFERED_OPERATION = 0x02;
var DS_BUFFERED_OPERATION_SPAN = 0x03;
var DS_PAYLOAD_FORMAT = 0x04;
var DS_STATIC_PAYLOAD_CONFIG = 0x05;

//Timing Settings
var TS_MEAS_INT_DC = 0x06;
var TS_MEAS_INT_BAT = 0x07;
var TS_TIMESYNC_INT = 0x08;

//Input Settings
var IS_ENABLE = 0x09;
var IS_INVERT = 0x0A;
var IS_DELAY_ENABLE = 0x0B;
var IS_DELAY_RISING = 0x0C;
var IS_DELAY_FALLING = 0x0D;
var IS_WIPER_ENABLE = 0x0E;
var IS_WIPER_CONFIRMATION_TIMEOUT = 0x0F;
var IS_DEFLUTTER_ENABLE = 0x10;
var IS_DEFLUTTER_INTERVAL = 0x11;
var IS_DEFLUTTER_COUNT = 0x12;
var IS_DOUBLE_ENABLE = 0x13;
var IS_DOUBLE_INTERMEDIATE_STATE_TIMEOUT_ENABLE = 0x14;
var IS_DOUBLE_INTERMEDIATE_STATE_TIMEOUT = 0x15;
var IS_COUNTER_ENABLE = 0x16;
var IS_COUNTER_MODE = 0x17;
var IS_COUNTER_SCALING = 0x18;

var ES_RISING_ENABLE = 0x19;
var ES_FALLING_ENABLE = 0x1A;
var ES_BLOCKED_CHANGED = 0x1B;
var ES_CYCLIC_DI_ENABLE = 0x1C;
var ES_DI_CONFIRMED = 0x1D;
var ES_CYCLIC_DI_INTERVAL = 0x1E;
var ES_CYCLIC_CNT_ENABLE = 0x1F;
var ES_CNT_CONFIRMED = 0x20;
var ES_CYCLIC_CNT_TIMEDATE_WEEKDAY_SEL = 0x21;
var ES_CYCLIC_CNT_TIMEDATE_WEEKDAY = 0x22;
var ES_CYCLIC_CNT_TIME_HOUR = 0x23;
var ES_CYCLIC_CNT_TIME_MINUTE = 0x24;
var ES_CYCLIC_CNT_TIME_INTERVAL = 0x25;
var ES_PRIORITY = 0x26;
var ES_DELAY = 0x27;

var ACS_ENABLE = 0x28;
var ACS_ALARM_DELAY = 0x29;
var ACS_MOTION_DET_SEL = 0x2A;
var ACS_KEY_SWITCH_SEL = 0x2B;
var ACS_DOOR_CONTACT_SEL = 0x2C;

var OS_ENABLE = 0x2D;
var OS_INVERT = 0x2E;
var OS_MODE = 0x2F;
var OS_WIPER_TIME = 0x30;

var pointer = 0;
var deviceHeader = {};

//Chipstack DECODER CALL
function Decode(fPort, bytes, variables) {
    var retObj = decodeUplink({
        "fPort": fPort,
        "bytes": bytes,
        "variables": variables
    });

    return retObj;
}


//MAIN DECODER CALL
function decodeUplink(input) {
    var warnings = [];

    deviceHeader = decodeDeviceHeader(input.bytes);

    if (deviceHeader.info.deviceId == 0x10) {
        if (deviceHeader.info.deviceVersion == 0) {
            if (input.fPort == FIXED_DATA_PORT) {
                return decodeFixedDataPayload(input.bytes);
            } else if (input.fPort == DI_DATA_PORT) {
                return decodeDiDataPayload(input.bytes);
            } else if (input.fPort == CNT_DATA_PORT) {
                return decodeCntDataPayload(input.bytes);
            } else if (input.fPort == TIMESYNC_PORT) {
                return decodeTimesyncPayload(input.bytes);
            } else if (input.fPort == CONFIG_PORT) {
                return decodeConfigPayload(input.bytes);
            } else if (input.fPort == INFO_PORT) {
                return decodeInfoPayload(input.bytes);
            } else {
                warnings.push("not a valid port for LPN KM");
                return {
                    "data": {
                        "port": input.fPort,
                        "portFunction": "unknown",
                        "payloadLength": input.bytes.length,
                        "payload": {
                            device: deviceHeader
                        },
                        "decoder": {
                            "version": PAYLOAD_DECODER_VERSION,
                            "info": PAYLOAD_DECODER_INFO
                        }
                    },
                    "warnings": warnings
                };
            }
        } else {
            warnings.push("deviceVersion of LPN KM not supported by this decoder");
            return {
                "data": {
                    "port": input.fPort,
                    "portFunction": "unknown",
                    "payloadLength": input.bytes.length,
                    "payload": {
                        device: deviceHeader
                    },
                    "decoder": {
                        "version": PAYLOAD_DECODER_VERSION,
                        "info": PAYLOAD_DECODER_INFO
                    }
                },
                "warnings": warnings
            };
        }
    } else {
        warnings.push("deviceId not supported by this decoder");
        return {
            "data": {
                "port": input.fPort,
                "portFunction": "unknown",
                "payloadLength": input.bytes.length,
                "payload": {
                    device: deviceHeader
                },
                "decoder": {
                    "version": PAYLOAD_DECODER_VERSION,
                    "info": PAYLOAD_DECODER_INFO
                }
            },
            "warnings": warnings
        };
    }

    if (input.fPort == FIXED_DATA_PORT) {
        return decodeFixedDataPayload(input.bytes);
    } else if (input.fPort == DI_DATA_PORT) {
        return decodeDiDataPayload(input.bytes);
    } else if (input.fPort == CNT_DATA_PORT) {
        return decodeCntDataPayload(input.bytes);
    } else if (input.fPort == TIMESYNC_PORT) {
        return decodeTimesyncPayload(input.bytes);
    } else if (input.fPort == CONFIG_PORT) {
        return decodeConfigPayload(input.bytes);
    } else if (input.fPort == INFO_PORT) {
        return decodeInfoPayload(input.bytes);
    } else {
        warnings.push("not a valid port for LPN KM");
        return {
            "data": {
                "port": 3,
                "portFunction": "unknown",
                "payloadLength": input.bytes.length,
                "decoder": {
                    "version": PAYLOAD_DECODER_VERSION,
                    "info": PAYLOAD_DECODER_INFO
                }
            },
            "warnings": warnings
        };
    }
}

function decodeDeviceHeader(data) {
    var obj = {};
    var status = 0;
    var deviceId = 0; //USC2
    deviceId = data[pointer++]; //USC2
    if (deviceId & 0x80) { //USC2
        deviceId = deviceId + 256 * data[pointer++]; //USC2
    } //USC2
    obj.info = { //USC2
        "deviceId": deviceId, //USC2
        "deviceVersion": data[pointer++], //USC2
        "deviceDesignation": "", //USC2
        "deviceManufacturer": DEVICE_MANUFACTURER //USC2
    };

    status = data[pointer++];

    switch (obj.info.deviceId) {
        case 0:
            obj.info.deviceDesignation = DEVICE_DESIGNATION_LPN_KM;
            obj.deviceStatus = { //usc: use quotes to avoid confict with var-names!
                "configurationError": Boolean(status & 0x01),
                "bufferOverflow": Boolean(status & 0x02),
                "timeSynced": Boolean(status & 0x04),
                "batteryPowered": Boolean(status & 0x08),
                "txCreditsConsumed": Boolean(status & 0x10),
                "deviceRestarted": Boolean(status & 0x20), //usc  0x20 instead of 0x12
                "lowSupplyVoltage": Boolean(status & 0x40),
                "confirmationTimeout": Boolean(status & 0x80)
            };
            break;
            //case 1: obj.info.deviceDesignation = ....
        default:
            obj.info.deviceDesignation = "UNKNOWN";
            break;
    }

    if (!data[pointer]) {
        obj.batteryLevel = "external";
    } else if (data[pointer] == 255) {
        obj.batteryLevel = "error";
    } else {
        //((input - min) * 100) / (max - min)
        obj.batteryLevel = (Math.round(((data[pointer] - 1) * 100) / (254 - 1))).toString() + "%"; //usc: pointer++ not only in this case.thus do pointer++ afterwards
    }
    pointer++; //usc: pointer must be forwarded to the next byte in any case 
    return obj;
}

function decodeTimestamp(data) {
    var obj = {};

    var unixTimestamp;
    var milliseconds;
    var dateObject;
    var humanDateFormat;

    unixTimestamp = data[3] + (data[2] << 8) + (data[1] << 16) + (data[0] << 24);
    milliseconds = unixTimestamp * 1000;

    obj.unix = unixTimestamp;

    dateObject = new Date(milliseconds);
    humanDateFormat = dateObject.toLocaleString();

    obj.string = humanDateFormat;

    return obj;
}

function addTimeToTimestamp(timestamp, data) {
    var obj = {};

    var dateObject;
    var humanDateFormat;

    obj.unix = timestamp + (data[1] + (data[0] << 8));

    dateObject = new Date(obj.unix * 1000);
    humanDateFormat = (dateObject).toLocaleString();

    obj.string = humanDateFormat;

    return obj;
}

function decodeCot(data) {
    var obj = {};
    //    var string;               //usc
    //
    //    if (data & 0x20) {
    //       string = "EVENT";
    //    } else if (data & 0x40) {
    //        string = "INTERROGATION";
    //    } else if (data & 0x80) {
    //        string = "CYCLIC";
    //    }   
    //    return string;

    obj = { //usc..
        "event": Boolean(data & 0x20),
        "interrogation": Boolean(data & 0x40),
        "cyclic": Boolean(data & 0x80)
    };
    return obj;
}

function decode8BitAsBinaryString(data) {
    var string = data.toString(2);
    string = "00000000".substr(string.length) + string;

    return string;
}

function decode16BitAsBinaryString(data) {
    var string = (data[1] + (data[0] << 8)).toString(2);
    string = "0000000000000000".substr(string.length) + string;

    return string;
}

function decodeFixedDataPayload(data) {
    var obj = {};
    var timestampAbsolute = {};
    var warnings = [];

    obj.port = FIXED_DATA_PORT;
    obj.portFunction = "FIXED_DATA";
    obj.payloadLength = data.length;
    //   obj.payloadConfig = {                           //usc2: moved into data section
    //       "timestamp": Boolean(data[pointer] & 0x01),
    //       "digitalInputs": Boolean(data[pointer] & 0x02),
    //       "counterValues": Boolean(data[pointer] & 0x04)
    //   };

    obj.decoder = {
        "version": PAYLOAD_DECODER_VERSION,
        "info": PAYLOAD_DECODER_INFO
    };

    obj.payload = {
        device: deviceHeader,
        data: {
            "config": { //usc2 : palyoad configed placed here becauserelated to palyoad only 
                "timestamp": Boolean(data[pointer] & 0x01),
                "digitalInputs": Boolean(data[pointer] & 0x02),
                "counterValues": Boolean(data[pointer] & 0x04)
            },
            "timestamp": {},
            "digitalInputs": "",
            "counterValues": []
        }
    };

    pointer++;

    if (obj.payload.data.config.timestamp) {
        obj.payload.data.timestamp = decodeTimestamp(data.slice(pointer, (pointer + 4)));
        pointer += 4;
    }
    if (obj.payload.data.config.digitalInputs) {
        pointer += 1; //jump over ObjectType and ObjectNo
        obj.payload.data.digitalInputs = (data[pointer] + (data[pointer + 1] << 8)).toString(16);
        pointer += 2;
    }
    if (obj.payload.data.config.counterValues) {
        while (pointer < (data.length - 1))
            obj.payload.data.counterValues.push({
                "id": data[pointer] & 0x0F,
                "value": (data[pointer + 3] + (data[pointer + 2] << 8) + (data[pointer + 1] << 16))
            });
        pointer += 4;
    }

    return {
        "data": obj,
        "warnings": warnings
    };
}

function decodeDiDataPayload(data) {
    var obj = {};
    var timestampAbsolute = {};
    var warnings = [];

    obj.port = DI_DATA_PORT;
    obj.portFunction = "DI_DATA";
    obj.payloadLength = data.length;
    obj.payload = {
        device: deviceHeader,
        data: {
            "digitalInputs": [] //usc: quotes
        }
    };

    obj.decoder = {
        "version": PAYLOAD_DECODER_VERSION,
        "info": PAYLOAD_DECODER_INFO
    };

    timestampAbsolute = decodeTimestamp(data.slice(pointer, (pointer + 4)));
    pointer += 4;

    do {
        if (data[pointer] & 0x10) { //DI Type
            obj.payload.data.digitalInputs.push({
                "info": { //usc: put into an info element
                    "type": "singlePointInfo", //usc: name changed to "SinglePointInfo" 
                    "id": data[pointer] & 0x0F
                },
                "cot": decodeCot(data[pointer + 1] & 0xF0),
                "status": {
                    "blocked": Boolean(data[pointer + 1] & 0x04),
                    "state": data[pointer + 1] & 0x01
                },
                "timestamp": addTimeToTimestamp(timestampAbsolute.unix, data.slice((pointer + 2), (pointer + 4))) //usc: slice was too short 
            });
        } else if (data[pointer] & 0x20) { //DBL Type
            obj.payload.data.digitalInputs.push({
                "info": {
                    "type": "doublePointInfo",
                    "id": data[pointer] & 0x0F
                },
                "cot": decodeCot(data[pointer + 1] & 0xF0),
                "status": {
                    "blocked": Boolean(data[pointer + 1] & 0x04),
                    "state": data[pointer + 1] & 0x03
                },
                "timestamp": addTimeToTimestamp(timestampAbsolute.unix, data.slice((pointer + 2), (pointer + 4))) //usc: slice was too short 
            });
        }
        pointer += 4;
    } while (pointer < (data.length - 1));

    return {
        "data": obj,
        "warnings": warnings
    };
}

function decodeCntDataPayload(data) {
    var obj = {};
    var timestampCommon = {};
    var objectCount = 0;
    var warnings = [];

    obj.port = CNT_DATA_PORT;
    obj.portFunction = "CNT_DATA";
    obj.payloadLength = data.length;
    obj.payload = {
        "device": deviceHeader,
        "data": {
            "counters": []
        }
    };

    obj.decoder = {
        "version": PAYLOAD_DECODER_VERSION,
        "info": PAYLOAD_DECODER_INFO
    };

    do {
        objectCount = data[pointer++];
        timestampCommon = decodeTimestamp(data.slice(pointer, (pointer + 4)));
        pointer += 4;
        for (var i = 0; i < objectCount; i++) {
            obj.payload.data.counters.push({
                "info": //usc2:    added
                {
                    "type": "counter", //usc2:    added
                    "id": data[pointer] & 0x0F //usc2:    added
                },
                "cot": decodeCot(data[pointer + 1] & 0xF0),
                "status": {
                    "overflow": Boolean(data[pointer + 1] & 0x01),
                    "reset": Boolean(data[pointer + 1] & 0x02)
                },
                "timestamp": timestampCommon,
                "value": (data[pointer + 4] + (data[pointer + 3] << 8) + (data[pointer + 2] << 16))
            });
            pointer += 5;
        }
    } while (pointer < (data.length - 1));

    return {
        "data": obj,
        "warnings": warnings
    };
}

function decodeTimesyncPayload(data) {
    var obj = {};
    var warnings = [];

    obj.port = TIMESYNC_PORT;
    obj.portFunction = "TIMESYNC";
    obj.payloadLength = data.length;
    obj.payload = {
        "device": deviceHeader,
        "data": {
            "timestamp": decodeTimestamp(data.slice(pointer, (pointer + 4)))
        }
    };

    obj.decoder = {
        "version": PAYLOAD_DECODER_VERSION,
        "info": PAYLOAD_DECODER_INFO
    };

    return {
        "data": obj,
        "warnings": warnings
    };
}

function decodeConfigPayload(data) {
    var obj = {};
    var warnings = [];
    var length = 0;
    var value = 0;
    var string = "";
    var parameter = 0;
    var i = 0;

    obj.port = CONFIG_PORT;
    obj.portFunction = "CONFIG";
    obj.payloadLength = data.length;
    obj.payload = {
        "device": deviceHeader,
        "data": {
            "parameters": []
        }
    };

    obj.decoder = {
        "version": PAYLOAD_DECODER_VERSION,
        "info": PAYLOAD_DECODER_INFO
    };

    do {
        parameter = data[pointer++];
        length = data[pointer++];

        switch (parameter) {
            //DI
            case DI_LABEL:
                obj.payload.data.parameters.push({
                    "name": "DI_LABEL",
                    "value": String.fromCharCode.apply(null, data.slice(pointer, (pointer + length)))
                });
                pointer += length;
                break;

                //DS
            case DS_DEFAULT_SUPPLY_MODE:
                obj.payload.data.parameters.push({
                    "name": "DS_DEFAULT_SUPPLY_MODE",
                    "value": ((data[pointer++] & 0x01) ? "external" : "battery")
                });
                break;
            case DS_BUFFERED_OPERATION:
                obj.payload.data.parameters.push({
                    "name": "DS_BUFFERED_OPERATION",
                    "value": ((data[pointer++] & 0x01) ? "enabled" : "disabled")
                });
                break;
            case DS_BUFFERED_OPERATION_SPAN:
                obj.payload.data.parameters.push({
                    "name": "DS_BUFFERED_OPERATION_SPAN",
                    "value": data[pointer + 1] + (data[pointer] << 8),
                    "unit": "s"
                });
                pointer += length;
                break;
            case DS_PAYLOAD_FORMAT:
                obj.payload.data.parameters.push({
                    "name": "DS_PAYLOAD_FORMAT",
                    "value": ((data[pointer++] & 0x01) ? "dynamic" : "static")
                });
                break;
            case DS_STATIC_PAYLOAD_CONFIG:
                obj.payload.data.parameters.push({
                    name: "DS_STATIC_PAYLOAD_CONFIG",
                    "value": {
                        "timestamp": Boolean(data[pointer] & 0x01),
                        "digitalInputs": Boolean(data[pointer] & 0x02),
                        "counterValues": Boolean(data[pointer++] & 0x04)
                    }
                });
                break;

                //TS
            case TS_MEAS_INT_DC:
                obj.payload.data.parameters.push({
                    "name": "TS_MEAS_INT_DC",
                    "value": data[pointer + 1] + (data[pointer] << 8),
                    "unit": "ms"
                });
                pointer += length;
                break;
            case TS_MEAS_INT_BAT:
                obj.payload.data.parameters.push({
                    "name": "TS_MEAS_INT_BAT",
                    "value": data[pointer + 1] + (data[pointer] << 8),
                    "unit": "ms"
                });
                pointer += length;
                break;
            case TS_TIMESYNC_INT:
                obj.payload.data.parameters.push({
                    "name": "TS_TIMESYNC_INT",
                    "value": data[pointer + 1] + (data[pointer] << 8),
                    "unit": "h"
                });
                pointer += length;
                break;

                //IS
            case IS_ENABLE:
                obj.payload.data.parameters.push({
                    "name": "IS_ENABLE",
                    "value": decode16BitAsBinaryString(data.slice(pointer, (pointer + 2))),
                });
                pointer += length;
                break;
            case IS_INVERT:
                obj.payload.data.parameters.push({
                    "name": "IS_INVERT",
                    "value": decode16BitAsBinaryString(data.slice(pointer, (pointer + 2))),
                });
                pointer += length;
                break;
            case IS_DELAY_ENABLE:
                obj.payload.data.parameters.push({
                    "name": "IS_DELAY_ENABLE",
                    "value": decode16BitAsBinaryString(data.slice(pointer, (pointer + 2))),
                });
                pointer += length;
                break;
            case IS_DELAY_RISING:
                obj.payload.data.parameters.push({
                    "name": "IS_DELAY_RISING",
                    "values": [],
                    "unit": "ms"
                });
                for (i = 0; i < (length / 2); i++) {
                    obj.payload.data.parameters[obj.payload.data.parameters.length - 1].values.push(data[pointer + 1] + (data[pointer] << 8));
                    pointer += 2;
                }
                break;
            case IS_DELAY_FALLING:
                obj.payload.data.parameters.push({
                    "name": "IS_DELAY_FALLING",
                    "values": [],
                    "unit": "ms"
                });
                for (i = 0; i < (length / 2); i++) {
                    obj.payload.data.parameters[obj.payload.data.parameters.length - 1].values.push(data[pointer + 1] + (data[pointer] << 8));
                    pointer += 2;
                }
                break;
            case IS_WIPER_ENABLE:
                obj.payload.data.parameters.push({
                    "name": "IS_WIPER_ENABLE",
                    "value": decode16BitAsBinaryString(data.slice(pointer, (pointer + 2))),
                });
                pointer += length;
                break;
            case IS_WIPER_CONFIRMATION_TIMEOUT:
                obj.payload.data.parameters.push({
                    "name": "IS_WIPER_CONFIRMATION_TIMEOUT",
                    "values": [],
                    "unit": "s"
                });
                for (i = 0; i < (length / 2); i++) {
                    obj.payload.data.parameters[obj.payload.data.parameters.length - 1].values.push(data[pointer + 1] + (data[pointer] << 8));
                    pointer += 2;
                }
                break;
            case IS_DEFLUTTER_ENABLE:
                obj.payload.data.parameters.push({
                    "name": "IS_DEFLUTTER_ENABLE",
                    "value": decode16BitAsBinaryString(data.slice(pointer, (pointer + 2))),
                });
                pointer += length;
                break;
            case IS_DEFLUTTER_INTERVAL:
                obj.payload.data.parameters.push({
                    "name": "IS_DEFLUTTER_INTERVAL",
                    "values": [],
                    "unit": "ms"
                });
                for (i = 0; i < (length / 2); i++) {
                    obj.payload.data.parameters[obj.payload.data.parameters.length - 1].values.push(data[pointer + 1] + (data[pointer] << 8));
                    pointer += 2;
                }
                break;
            case IS_DEFLUTTER_COUNT:
                obj.payload.data.parameters.push({
                    "name": "IS_DEFLUTTER_COUNT",
                    "values": [],
                    "unit": "units"
                });
                for (i = 0; i < (length / 2); i++) {
                    obj.payload.data.parameters[obj.payload.data.parameters.length - 1].values.push(data[pointer + 1] + (data[pointer] << 8));
                    pointer += 2;
                }
                break;
            case IS_DOUBLE_ENABLE:
                obj.payload.data.parameters.push({
                    "name": "IS_DOUBLE_ENABLE",
                    "value": decode8BitAsBinaryString(data[pointer++]),
                });
                break;
            case IS_DOUBLE_INTERMEDIATE_STATE_TIMEOUT_ENABLE:
                obj.payload.data.parameters.push({
                    "name": "IS_DOUBLE_INTERMEDIATE_STATE_TIMEOUT_ENABLE",
                    "value": decode8BitAsBinaryString(data[pointer++]),
                });
                break;
            case IS_DOUBLE_INTERMEDIATE_STATE_TIMEOUT:
                obj.payload.data.parameters.push({
                    "name": "IS_DOUBLE_INTERMEDIATE_STATE_TIMEOUT",
                    "values": [],
                    "unit": "s"
                });
                for (i = 0; i < (length / 2); i++) {
                    obj.payload.data.parameters[obj.payload.data.parameters.length - 1].values.push(data[pointer + 1] + (data[pointer] << 8));
                    pointer += 2;
                }
                break;
            case IS_COUNTER_ENABLE:
                obj.payload.data.parameters.push({
                    "name": "IS_COUNTER_ENABLE",
                    "value": decode16BitAsBinaryString(data.slice(pointer, (pointer + 2))),
                });
                pointer += length;
                break;
            case IS_COUNTER_MODE:
                obj.payload.data.parameters.push({
                    "name": "IS_COUNTER_MODE",
                    "values": []
                });
                value = data[pointer + 1] + (data[pointer] << 8);
                pointer += 2;
                for (i = 0; i < 16; i++) {
                    obj.payload.data.parameters[obj.payload.data.parameters.length - 1].values.push((value & (0x01 << i)) ? "operatingTime" : "pulse");
                }
                break;
            case IS_COUNTER_SCALING:
                obj.payload.data.parameters.push({
                    "name": "IS_COUNTER_SCALING",
                    "values": []
                });
                for (i = 0; i < length; i++) {
                    value = data[pointer++];
                    switch (value) {
                        case 0:
                            string = "ms";
                            break;
                        case 1:
                            string = "s";
                            break;
                        case 2:
                            string = "min";
                            break;
                        case 3:
                            string = "h";
                            break;
                        default:
                            string = "notAllowed"
                            break;
                    }
                    obj.payload.data.parameters[obj.payload.data.parameters.length - 1].values.push(string);
                }
                break;

                //ES
            case ES_RISING_ENABLE:
                obj.payload.data.parameters.push({
                    "name": "ES_RISING_ENABLE",
                    "value": decode16BitAsBinaryString(data.slice(pointer, (pointer + 2))),
                });
                pointer += length;
                break;
            case ES_FALLING_ENABLE:
                obj.payload.data.parameters.push({
                    "name": "ES_FALLING_ENABLE",
                    "value": decode16BitAsBinaryString(data.slice(pointer, (pointer + 2))),
                });
                pointer += length;
                break;
            case ES_BLOCKED_CHANGED:
                obj.payload.data.parameters.push({
                    "name": "ES_BLOCKED_CHANGED",
                    "value": decode16BitAsBinaryString(data.slice(pointer, (pointer + 2))),
                });
                pointer += length;
                break;
            case ES_CYCLIC_DI_ENABLE:
                obj.payload.data.parameters.push({
                    "name": "ES_CYCLIC_DI_ENABLE",
                    "value": decode16BitAsBinaryString(data.slice(pointer, (pointer + 2))),
                });
                pointer += length;
                break;
            case ES_DI_CONFIRMED:
                obj.payload.data.parameters.push({
                    "name": "ES_DI_CONFIRMED",
                    "value": ((data[pointer++] & 0x01) ? "confirmed" : "unconfirmed")
                });
                break;
            case ES_CYCLIC_DI_INTERVAL:
                obj.payload.data.parameters.push({
                    "name": "ES_CYCLIC_DI_INTERVAL",
                    "values": [],
                    "unit": "s"
                });
                for (i = 0; i < (length / 2); i++) {
                    obj.payload.data.parameters[obj.payload.data.parameters.length - 1].values.push(data[pointer + 1] + (data[pointer] << 8));
                    pointer += 2;
                }
                break;
            case ES_CYCLIC_CNT_ENABLE:
                obj.payload.data.parameters.push({
                    "name": "ES_CYCLIC_CNT_ENABLE",
                    "value": ((data[pointer++] & 0x01) ? "enabled" : "disabled")
                });
                break;
            case ES_CNT_CONFIRMED:
                obj.payload.data.parameters.push({
                    "name": "ES_CNT_CONFIRMED",
                    "value": ((data[pointer++] & 0x01) ? "confirmed" : "unconfirmed")
                });
                break;
            case ES_CYCLIC_CNT_TIMEDATE_WEEKDAY_SEL:
                obj.payload.data.parameters.push({
                    "name": "ES_CYCLIC_CNT_TIMEDATE_WEEKDAY_SEL",
                    "value": ((data[pointer++] & 0x01) ? "weekday" : "date")
                });
                break;
            case ES_CYCLIC_CNT_TIMEDATE_WEEKDAY:
                obj.payload.data.parameters.push({
                    "name": "ES_CYCLIC_CNT_TIMEDATE_WEEKDAY",
                    "value": data[pointer++] & 0x01
                });
                break;
            case ES_CYCLIC_CNT_TIME_HOUR:
                obj.payload.data.parameters.push({
                    "name": "ES_CYCLIC_CNT_TIME_HOUR",
                    "value": data[pointer++] & 0x01
                });
                break;
            case ES_CYCLIC_CNT_TIME_MINUTE:
                obj.payload.data.parameters.push({
                    "name": "ES_CYCLIC_CNT_TIME_MINUTE",
                    "value": data[pointer++] & 0x01
                });
                break;
            case ES_CYCLIC_CNT_TIME_INTERVAL:
                obj.payload.data.parameters.push({
                    "name": "ES_CYCLIC_CNT_TIME_INTERVAL",
                    "value": data[pointer + 1] + (data[pointer] << 8),
                    "unit": "min"
                });
                pointer += length;
                break;
            case ES_PRIORITY:
                obj.payload.data.parameters.push({
                    "name": "ES_PRIORITY",
                    "value": decode16BitAsBinaryString(data.slice(pointer, (pointer + 2))),
                });
                pointer += length;
                break;
            case ES_DELAY:
                obj.payload.data.parameters.push({
                    "name": "ES_DELAY",
                    "value": data[pointer + 1] + (data[pointer] << 8),
                    "unit": "ms"
                });
                pointer += length;
                break;

                //ASC
            case ACS_ENABLE:
                obj.payload.data.parameters.push({
                    "name": "ACS_ENABLE",
                    "value": ((data[pointer++] & 0x01) ? "enabled" : "disabled")
                });
                break;
            case ACS_ALARM_DELAY:
                obj.payload.data.parameters.push({
                    "name": "ACS_ALARM_DELAY",
                    "value": decode16BitAsBinaryString(data.slice(pointer, (pointer + 2))),
                });
                pointer += length;
                break;
            case ACS_MOTION_DET_SEL:
                obj.payload.data.parameters.push({
                    "name": "ACS_MOTION_DET_SEL",
                    "value": data[pointer++] & 0x01
                });
                break;
            case ACS_KEY_SWITCH_SEL:
                obj.payload.data.parameters.push({
                    "name": "ACS_KEY_SWITCH_SEL",
                    "value": data[pointer++] & 0x01
                });
                break;
            case ACS_DOOR_CONTACT_SEL:
                obj.payload.data.parameters.push({
                    "name": "ACS_DOOR_CONTACT_SEL",
                    "value": data[pointer++] & 0x01
                });
                break;

                //OS
            case OS_ENABLE:
                obj.payload.data.parameters.push({
                    "name": "OS_ENABLE",
                    "value": decode16BitAsBinaryString(data.slice(pointer, (pointer + 2))),
                });
                pointer += length;
                break
                length = data[pointer++];
                obj.payload.data.parameters.push({
                    "name": "OS_INVERT",
                    "value": decode16BitAsBinaryString(data.slice(pointer, (pointer + 2))),
                });
                pointer += length;
                break;
            case OS_MODE:
                obj.payload.data.parameters.push({
                    "name": "OS_MODE",
                    "values": []
                });
                value = data[pointer + 1] + (data[pointer] << 8);
                pointer += 2;
                for (i = 0; i < 16; i++) {
                    obj.payload.data.parameters[obj.payload.data.parameters.length - 1].values.push((value & (0x01 << i)) ? "wiper" : "static");
                }
                break;
            case OS_WIPER_TIME:
                obj.payload.data.parameters.push({
                    "name": "OS_WIPER_TIME",
                    "values": [],
                    "unit": "ms"
                });
                for (i = 0; i < (length / 2); i++) {
                    obj.payload.data.parameters[obj.payload.data.parameters.length - 1].values.push(data[pointer + 1] + (data[pointer] << 8));
                    pointer += 2;
                }
                break;
        }
    } while (pointer < (data.length - 1));

    return {
        "data": obj,
        "warnings": warnings
    };
}

function decodeInfoPayload(data) {
    var obj = {};
    var warnings = [];

    obj.port = INFO_PORT;
    obj.portFunction = "INFO";
    obj.payloadLength = data.length;
    obj.payload = {
        "device": deviceHeader
    };

    obj.decoder = {
        "version": PAYLOAD_DECODER_VERSION,
        "info": PAYLOAD_DECODER_INFO
    };

    //warnings.push("test");

    return {
        "data": obj,
        "warnings": warnings
    };
}