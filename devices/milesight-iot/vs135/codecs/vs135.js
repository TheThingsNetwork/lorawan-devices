function decodeUplink(input) {
    var res = Decoder(input.bytes, input.fPort);
    if (res.error) {
        return {
            errors: [res.error],
        };
    }
    return {
        data: res,
    };
}
/**
 * Payload Decoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product VS133 / VS135
 */
var RAW_VALUE = 0x00;

/* eslint no-redeclare: "off" */
/* eslint-disable */

// The Things Network
function Decoder(bytes, port) {
    return milesightDeviceDecode(bytes);
}
/* eslint-enable */

var total_in_chns = [0x03, 0x06, 0x09, 0x0c];
var total_out_chns = [0x04, 0x07, 0x0a, 0x0d];
var period_chns = [0x05, 0x08, 0x0b, 0x0e];
var child_total_in_chns = [0x11, 0x14, 0x17, 0x1a];
var child_total_out_chns = [0x12, 0x15, 0x18, 0x1b];
var child_period_chns = [0x13, 0x16, 0x19, 0x1c];

function milesightDeviceDecode(bytes) {
    var decoded = {};

    for (var i = 0; i < bytes.length; ) {
        var channel_id = bytes[i++];
        var channel_type = bytes[i++];

        // IPSO VERSION
        if (channel_id === 0xff && channel_type === 0x01) {
            decoded.ipso_version = readProtocolVersion(bytes[i]);
            i += 1;
        }
        // HARDWARE VERSION
        else if (channel_id === 0xff && channel_type === 0x09) {
            decoded.hardware_version = readHardwareVersion(bytes.slice(i, i + 2));
            i += 2;
        }
        // FIRMWARE VERSION
        else if (channel_id === 0xff && channel_type === 0x1f) {
            decoded.firmware_version = readFirmwareVersion(bytes.slice(i, i + 4));
            i += 4;
        }
        // SERIAL NUMBER
        else if (channel_id === 0xff && channel_type === 0x16) {
            decoded.sn = readSerialNumber(bytes.slice(i, i + 8));
            i += 8;
        }
        // LINE TOTAL IN
        else if (includes(total_in_chns, channel_id) && channel_type === 0xd2) {
            var channel_in_name = "line_" + ((channel_id - total_in_chns[0]) / 3 + 1);
            decoded[channel_in_name + "_total_in"] = readUInt32LE(bytes.slice(i, i + 4));
            i += 4;
        }
        // LINE TOTAL IN (child)
        else if (includes(child_total_in_chns, channel_id) && channel_type === 0xd2) {
            var child_total_in_name = "line_" + ((channel_id - child_total_in_chns[0]) / 3 + 1);
            decoded[child_total_in_name + "_child_total_in"] = readUInt32LE(bytes.slice(i, i + 4));
            i += 4;
        }
        // LINE TOTAL OUT
        else if (includes(total_out_chns, channel_id) && channel_type === 0xd2) {
            var channel_out_name = "line_" + ((channel_id - total_out_chns[0]) / 3 + 1);
            decoded[channel_out_name + "_total_out"] = readUInt32LE(bytes.slice(i, i + 4));
            i += 4;
        }
        // LINE TOTAL OUT (child)
        else if (includes(child_total_out_chns, channel_id) && channel_type === 0xd2) {
            var child_total_out_name = "line_" + ((channel_id - child_total_out_chns[0]) / 3 + 1);
            decoded[child_total_out_name + "_child_total_out"] = readUInt32LE(bytes.slice(i, i + 4));
            i += 4;
        }
        // LINE PERIOD
        else if (includes(period_chns, channel_id) && channel_type === 0xcc) {
            var channel_period_name = "line_" + ((channel_id - period_chns[0]) / 3 + 1);
            decoded[channel_period_name + "_period_in"] = readUInt16LE(bytes.slice(i, i + 2));
            decoded[channel_period_name + "_period_out"] = readUInt16LE(bytes.slice(i + 2, i + 4));
            i += 4;
        }
        // LINE PERIOD (child)
        else if (includes(child_period_chns, channel_id) && channel_type === 0xcc) {
            var child_period_name = "line_" + ((channel_id - child_period_chns[0]) / 3 + 1);
            decoded[child_period_name + "_child_period_in"] = readUInt16LE(bytes.slice(i, i + 2));
            decoded[channel_period_name + "_child_period_out"] = readUInt16LE(bytes.slice(i + 2, i + 4));
            i += 4;
        }
        // REGION COUNT
        else if (channel_id === 0x0f && channel_type === 0xe3) {
            decoded.region_1_count = readUInt8(bytes[i]);
            decoded.region_2_count = readUInt8(bytes[i + 1]);
            decoded.region_3_count = readUInt8(bytes[i + 2]);
            decoded.region_4_count = readUInt8(bytes[i + 3]);
            i += 4;
        }
        // REGION COUNT (child)
        else if (channel_id === 0x1d && channel_type === 0xe3) {
            decoded.region_1_child_count = readUInt8(bytes[i]);
            decoded.region_2_child_count = readUInt8(bytes[i + 1]);
            decoded.region_3_child_count = readUInt8(bytes[i + 2]);
            decoded.region_4_child_count = readUInt8(bytes[i + 3]);
            i += 4;
        }
        // REGION DWELL TIME
        else if (channel_id === 0x10 && channel_type === 0xe4) {
            var dwell_channel_name = "region_" + bytes[i];
            decoded[dwell_channel_name + "_avg_dwell"] = readUInt16LE(bytes.slice(i + 1, i + 3));
            decoded[dwell_channel_name + "_max_dwell"] = readUInt16LE(bytes.slice(i + 3, i + 5));
            i += 5;
        }
        // REGION DWELL TIME (child)
        else if (channel_id === 0x1e && channel_type === 0xe4) {
            var child_dwell_channel_name = "region_" + bytes[i];
            decoded[child_dwell_channel_name + "_child_avg_dwell"] = readUInt16LE(bytes.slice(i + 1, i + 3));
            decoded[child_dwell_channel_name + "_child_max_dwell"] = readUInt16LE(bytes.slice(i + 3, i + 5));
            i += 5;
        }
        // ALARM
        else if (channel_id === 0x50 && channel_type === 0xfc) {
            var node_id = bytes[i + 1];
            var node_name = node_id === 0x00 ? "master" : "node_" + node_id;
            decoded[node_name + "_occlusion_alarm"] = readAlarmType(bytes[i + 2]);
            i += 3;
        }
        // HISTORY (v1.0.9)
        else if (channel_id === 0x20 && channel_type === 0xce) {
            var historyResult = readHistory(bytes, i);
            i = historyResult.offset;
            decoded.history = decoded.history || [];
            decoded.history.push(historyResult.data);
        }
        // DOWNLINK RESPONSE
        else if (channel_id === 0xfe || channel_id === 0xff) {
            var respResult = handle_downlink_response(channel_type, bytes, i);
            decoded = Object.assign(decoded, respResult.data);
            i = respResult.offset;
        }
        // DOWNLINK RESPONSE EXT
        else if (channel_id === 0xf8 || channel_id === 0xf9) {
            var resultExt = handle_downlink_response_ext(channel_id, channel_type, bytes, i);
            decoded = Object.assign(decoded, resultExt.data);
            i = resultExt.offset;
        } else {
            break;
        }
    }

    return decoded;
}

function handle_downlink_response(channel_type, bytes, offset) {
    var decoded = {};

    switch (channel_type) {
        case 0x03:
            decoded.report_interval = readUInt16LE(bytes.slice(offset, offset + 2));
            offset += 2;
            break;
        case 0x04:
            decoded.confirm_mode_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x10:
            decoded.reboot = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x11:
            decoded.timestamp = readUInt32LE(bytes.slice(offset, offset + 4));
            offset += 4;
            break;
        case 0x27:
            decoded.clear_history = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x40:
            decoded.adr_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x42:
            decoded.wifi_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x43:
            decoded.periodic_report_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x44:
            decoded.trigger_report_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x51:
            decoded.clear_total_count = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x68:
            decoded.history_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x69:
            decoded.retransmit_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x6a:
            var interval_type = readUInt8(bytes[offset]);
            if (interval_type === 0) {
                decoded.retransmit_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            } else if (interval_type === 1) {
                decoded.resend_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            }
            offset += 3;
            break;
        case 0x6d:
            decoded.stop_transmit = readYesNoStatus(1);
            offset += 1;
            break;
        default:
            throw new Error("unknown downlink response");
    }

    return { data: decoded, offset: offset };
}

function handle_downlink_response_ext(code, channel_type, bytes, offset) {
    var decoded = {};

    switch (channel_type) {
        case 0x84:
            decoded.sync_time_from_gateway_config = {};
            decoded.sync_time_from_gateway_config.enable = readEnableStatus(bytes[offset]);
            decoded.sync_time_from_gateway_config.period = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            offset += 3;
            break;
        case 0x85:
            decoded.rejoin_config = {};
            decoded.rejoin_config.enable = readEnableStatus(bytes[offset]);
            decoded.rejoin_config.max_count = readUInt8(bytes[offset + 1]);
            offset += 2;
            break;
        case 0x86:
            decoded.data_rate = readUInt8(bytes[offset]);
            offset += 1;
            break;
        case 0x87:
            decoded.tx_power_level = readUInt8(bytes[offset]);
            offset += 1;
            break;
        case 0x88:
            decoded.log_config = {};
            decoded.log_config.console_log_level = readLogLevel(bytes[offset]);
            decoded.log_config.file_log_level = readLogLevel(bytes[offset + 1]);
            offset += 2;
            break;
        default:
            throw new Error("unknown downlink response");
    }

    if (hasResultFlag(code)) {
        var result_value = readUInt8(bytes[offset]);
        offset += 1;

        if (result_value !== 0) {
            var request = decoded;
            decoded = {};
            decoded.device_response_result = {};
            decoded.device_response_result.channel_type = channel_type;
            decoded.device_response_result.result = readResultStatus(result_value);
            decoded.device_response_result.request = request;
        }
    }

    return { data: decoded, offset: offset };
}

function hasResultFlag(code) {
    return code === 0xf8;
}

function readResultStatus(status) {
    var status_map = { 0: "success", 1: "forbidden", 2: "invalid parameter" };
    return getValue(status_map, status);
}

function readProtocolVersion(bytes) {
    var major = (bytes & 0xf0) >> 4;
    var minor = bytes & 0x0f;
    return "v" + major + "." + minor;
}

function readHardwareVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = bytes[1] & 0xff;
    return "v" + major + "." + minor;
}

function readFirmwareVersion(bytes) {
    var serial = bytes[0] & 0xff;
    var major = bytes[1] & 0xff;
    var odm = bytes[2] & 0xff;
    var minor = bytes[3] & 0xff;
    return "v" + serial + "." + major + "." + odm + "." + minor;
}

function readSerialNumber(bytes) {
    var temp = [];
    for (var idx = 0; idx < bytes.length; idx++) {
        temp.push(("0" + (bytes[idx] & 0xff).toString(16)).slice(-2));
    }
    return temp.join("");
}

function readAlarmType(type) {
    var alarm_map = { 0: "alarm_released", 1: "alarm_triggered" };
    return getValue(alarm_map, type);
}

function readEnableStatus(status) {
    var status_map = { 0: "disable", 1: "enable" };
    return getValue(status_map, status);
}

function readYesNoStatus(status) {
    var yes_no_map = { 0: "no", 1: "yes" };
    return getValue(yes_no_map, status);
}

function readHistory(bytes, offset) {
    var i = offset;

    var timestamp = readUInt32LE(bytes.slice(i, i + 4));
    var data_type = readUInt8(bytes[i + 4]);

    var data = {};
    data.timestamp = timestamp;
    if (data_type === 0x03) {
        data.line_1_total_in = readUInt32LE(bytes.slice(i + 5, i + 9));
        i += 9;
    } else if (data_type === 0x04) {
        data.line_1_total_out = readUInt32LE(bytes.slice(i + 5, i + 9));
        i += 9;
    } else if (data_type === 0x05) {
        data.line_1_period_in = readUInt16LE(bytes.slice(i + 5, i + 7));
        data.line_1_period_out = readUInt16LE(bytes.slice(i + 7, i + 9));
        i += 9;
    } else if (data_type === 0x06) {
        data.line_2_total_in = readUInt32LE(bytes.slice(i + 5, i + 9));
        i += 9;
    } else if (data_type === 0x07) {
        data.line_2_total_out = readUInt32LE(bytes.slice(i + 5, i + 9));
        i += 9;
    } else if (data_type === 0x08) {
        data.line_2_period_in = readUInt16LE(bytes.slice(i + 5, i + 7));
        data.line_2_period_out = readUInt16LE(bytes.slice(i + 7, i + 9));
        i += 9;
    } else if (data_type === 0x09) {
        data.line_3_total_in = readUInt32LE(bytes.slice(i + 5, i + 9));
        i += 9;
    } else if (data_type === 0x0a) {
        data.line_3_total_out = readUInt32LE(bytes.slice(i + 5, i + 9));
        i += 9;
    } else if (data_type === 0x0b) {
        data.line_3_period_in = readUInt16LE(bytes.slice(i + 5, i + 7));
        data.line_3_period_out = readUInt16LE(bytes.slice(i + 7, i + 9));
        i += 9;
    } else if (data_type === 0x0c) {
        data.line_4_total_in = readUInt32LE(bytes.slice(i + 5, i + 9));
        i += 9;
    } else if (data_type === 0x0d) {
        data.line_4_total_out = readUInt32LE(bytes.slice(i + 5, i + 9));
        i += 9;
    } else if (data_type === 0x0e) {
        data.line_4_period_in = readUInt16LE(bytes.slice(i + 5, i + 7));
        data.line_4_period_out = readUInt16LE(bytes.slice(i + 7, i + 9));
        i += 9;
    } else if (data_type === 0x0f) {
        data.region_1_count = readUInt8(bytes[i + 5]);
        data.region_2_count = readUInt8(bytes[i + 6]);
        data.region_3_count = readUInt8(bytes[i + 7]);
        data.region_4_count = readUInt8(bytes[i + 8]);
        i += 9;
    } else if (data_type === 0x10) {
        var avg_dwell_region = readUInt8(bytes[i + 5]);
        var avg_dwell_region_name = "region_" + avg_dwell_region + "_avg_dwell";
        data[avg_dwell_region_name] = readUInt16LE(bytes.slice(i + 6, i + 8));
        i += 8;
    } else if (data_type === 0x20) {
        var max_dwell_region = readUInt8(bytes[i + 5]);
        var max_dwell_region_name = "region_" + max_dwell_region + "_max_dwell";
        data[max_dwell_region_name] = readUInt16LE(bytes.slice(i + 6, i + 8));
        i += 8;
    } else if (data_type === 0x11) {
        data.line_1_child_total_in = readUInt32LE(bytes.slice(i + 5, i + 9));
        i += 9;
    } else if (data_type === 0x12) {
        data.line_1_child_total_out = readUInt32LE(bytes.slice(i + 5, i + 9));
        i += 9;
    } else if (data_type === 0x13) {
        data.line_1_child_period_in = readUInt16LE(bytes.slice(i + 5, i + 7));
        data.line_1_child_period_out = readUInt16LE(bytes.slice(i + 7, i + 9));
        i += 9;
    } else if (data_type === 0x14) {
        data.line_2_child_total_in = readUInt32LE(bytes.slice(i + 5, i + 9));
        i += 9;
    } else if (data_type === 0x15) {
        data.line_2_child_total_out = readUInt32LE(bytes.slice(i + 5, i + 9));
        i += 9;
    } else if (data_type === 0x16) {
        data.line_2_child_period_in = readUInt16LE(bytes.slice(i + 5, i + 7));
        data.line_2_child_period_out = readUInt16LE(bytes.slice(i + 7, i + 9));
        i += 9;
    } else if (data_type === 0x17) {
        data.line_3_child_total_in = readUInt32LE(bytes.slice(i + 5, i + 9));
        i += 9;
    } else if (data_type === 0x18) {
        data.line_3_child_total_out = readUInt32LE(bytes.slice(i + 5, i + 9));
        i += 9;
    } else if (data_type === 0x19) {
        data.line_3_child_period_in = readUInt16LE(bytes.slice(i + 5, i + 7));
        data.line_3_child_period_out = readUInt16LE(bytes.slice(i + 7, i + 9));
        i += 9;
    } else if (data_type === 0x1a) {
        data.line_4_child_total_in = readUInt32LE(bytes.slice(i + 5, i + 9));
        i += 9;
    } else if (data_type === 0x1b) {
        data.line_4_child_total_out = readUInt32LE(bytes.slice(i + 5, i + 9));
        i += 9;
    } else if (data_type === 0x1c) {
        data.line_4_child_period_in = readUInt16LE(bytes.slice(i + 5, i + 7));
        data.line_4_child_period_out = readUInt16LE(bytes.slice(i + 7, i + 9));
        i += 9;
    } else if (data_type === 0x1d) {
        data.region_1_child_count = readUInt8(bytes[i + 5]);
        data.region_2_child_count = readUInt8(bytes[i + 6]);
        data.region_3_child_count = readUInt8(bytes[i + 7]);
        data.region_4_child_count = readUInt8(bytes[i + 8]);
        i += 9;
    } else if (data_type === 0x1e) {
        var child_avg_dwell_region = readUInt8(bytes[i + 5]);
        var child_avg_dwell_region_name = "region_" + child_avg_dwell_region + "_child_avg_dwell";
        data[child_avg_dwell_region_name] = readUInt16LE(bytes.slice(i + 6, i + 8));
        i += 8;
    } else if (data_type === 0x3c) {
        var child_max_dwell_region = readUInt8(bytes[i + 5]);
        var child_max_dwell_region_name = "region_" + child_max_dwell_region + "_child_max_dwell";
        data[child_max_dwell_region_name] = readUInt16LE(bytes.slice(i + 6, i + 8));
        i += 8;
    }

    return { data: data, offset: i };
}

function readLogLevel(level) {
    var log_level_map = { 1: "fatal", 2: "error", 3: "warning", 4: "debug", 5: "trace" };
    return getValue(log_level_map, level);
}

function readUInt8(bytes) {
    return bytes & 0xff;
}

function readUInt16LE(bytes) {
    var value = (bytes[1] << 8) + bytes[0];
    return value & 0xffff;
}

function readUInt32LE(bytes) {
    var value = (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
    return (value & 0xffffffff) >>> 0;
}

function includes(data, value) {
    var size = data.length;
    for (var i = 0; i < size; i++) {
        if (data[i] == value) {
            return true;
        }
    }
    return false;
}

function getValue(map, key) {
    if (RAW_VALUE) return key;

    var value = map[key];
    if (!value) value = "unknown";
    return value;
}

if (!Object.assign) {
    Object.defineProperty(Object, "assign", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (target) {
            "use strict";
            if (target == null) {
                throw new TypeError("Cannot convert first argument to object");
            }

            var to = Object(target);
            for (var i = 1; i < arguments.length; i++) {
                var nextSource = arguments[i];
                if (nextSource == null) {
                    continue;
                }
                nextSource = Object(nextSource);

                var keysArray = Object.keys(Object(nextSource));
                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                    var nextKey = keysArray[nextIndex];
                    var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== undefined && desc.enumerable) {
                        // concat array
                        if (Array.isArray(to[nextKey]) && Array.isArray(nextSource[nextKey])) {
                            to[nextKey] = to[nextKey].concat(nextSource[nextKey]);
                        } else {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        },
    });
}