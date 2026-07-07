/**
 * Payload Encoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product UC100
 */
var RAW_VALUE = 0x00;

/* eslint no-redeclare: "off" */
/* eslint-disable */
// Chirpstack v4
function encodeDownlink(input) {
    var encoded = milesightDeviceEncode(input.data);
    return { bytes: encoded };
}

// Chirpstack v3
function Encode(fPort, obj) {
    return milesightDeviceEncode(obj);
}

// The Things Network
function Encoder(obj, port) {
    return milesightDeviceEncode(obj);
}
/* eslint-enable */

function milesightDeviceEncode(payload) {
    var encoded = [];

    if ("reboot" in payload) {
        encoded = encoded.concat(reboot(payload.reboot));
    }
    if ("report_interval" in payload) {
        encoded = encoded.concat(setReportInterval(payload.report_interval));
    }
    if ("modbus_channels" in payload) {
        for (var i = 0; i < payload.modbus_channels.length; i++) {
            encoded = encoded.concat(setModbusChannel(payload.modbus_channels[i]));
        }
    }
    if ("modbus_channels_name" in payload) {
        for (var i = 0; i < payload.modbus_channels_name.length; i++) {
            encoded = encoded.concat(setModbusChannelName(payload.modbus_channels_name[i]));
        }
    }
    if ("remove_modbus_channels" in payload) {
        for (var i = 0; i < payload.remove_modbus_channels.length; i++) {
            encoded = encoded.concat(removeModbusChannel(payload.remove_modbus_channels[i]));
        }
    }
    if ("history_enable" in payload) {
        encoded = encoded.concat(setHistoryEnable(payload.history_enable));
    }
    if ("retransmit_enable" in payload) {
        encoded = encoded.concat(setRetransmitEnable(payload.retransmit_enable));
    }
    if ("retransmit_interval" in payload) {
        encoded = encoded.concat(setRetransmitInterval(payload.retransmit_interval));
    }
    if ("resend_interval" in payload) {
        encoded = encoded.concat(setResendInterval(payload.resend_interval));
    }
    if ("clear_history" in payload) {
        encoded = encoded.concat(clearHistory(payload.clear_history));
    }
    if ("stop_transmit" in payload) {
        encoded = encoded.concat(stopTransmit(payload.stop_transmit));
    }
    if ("fetch_history" in payload) {
        encoded = encoded.concat(fetchHistory(payload.fetch_history));
    }

    return encoded;
}

/**
 * Reboot device
 * @param {number} reboot values: (0: no, 1: yes)
 * @example { "reboot": 1 }
 */
function reboot(reboot) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(reboot) === -1) {
        throw new Error("reboot must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, reboot) === 0) {
        return [];
    }

    return [0xff, 0x10, 0xff];
}

/**
 * set report interval
 * @param {number} report_interval unit: second
 * @example { "report_interval": 600 }
 */
function setReportInterval(report_interval) {
    if (typeof report_interval !== "number") {
        throw new Error("report_interval must be a number");
    }
    if (report_interval < 0) {
        throw new Error("report_interval must be greater than 0");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x03);
    buffer.writeUInt16LE(report_interval);
    return buffer.toBytes();
}

/**
 * Set modbus channel config
 * @param {object} modbus_channels
 * @param {number} modbus_channels._item.channel_id range: [1, 32]
 * @param {number} modbus_channels._item.slave_id range: [0, 255]
 * @param {number} modbus_channels._item.register_address range: [0, 65535]
 * @param {number} modbus_channels._item.quantity range: [1, 16]
 * @param {number} modbus_channels._item.sign values: (0: unsigned, 1: signed)
 * @param {number} modbus_channels._item.register_type values: (
 *              0: MB_REG_COIL, 1: MB_REG_DIS,
 *              2: MB_REG_INPUT_AB, 3: MB_REG_INPUT_BA,
 *              4: MB_REG_INPUT_INT32_ABCD, 5: MB_REG_INPUT_INT32_BADC, 6: MB_REG_INPUT_INT32_CDAB, 7: MB_REG_INPUT_INT32_DCBA,
 *              8: MB_REG_INPUT_INT32_AB, 9: MB_REG_INPUT_INT32_CD,
 *              10: MB_REG_INPUT_FLOAT_ABCD, 11: MB_REG_INPUT_FLOAT_BADC, 12: MB_REG_INPUT_FLOAT_CDAB, 13: MB_REG_INPUT_FLOAT_DCBA,
 *              14: MB_REG_HOLD_INT16_AB, 15: MB_REG_HOLD_INT16_BA,
 *              16: MB_REG_HOLD_INT32_ABCD, 17: MB_REG_HOLD_INT32_BADC, 18: MB_REG_HOLD_INT32_CDAB, 19: MB_REG_HOLD_INT32_DCBA,
 *              20: MB_REG_HOLD_INT32_AB, 21: MB_REG_HOLD_INT32_CD,
 *              22: MB_REG_HOLD_FLOAT_ABCD, 23: MB_REG_HOLD_FLOAT_BADC, 24: MB_REG_HOLD_FLOAT_CDAB, 25: MB_REG_HOLD_FLOAT_DCBA)
 * @example { "modbus_channels": [ { "channel_id": 1, "slave_id": 1, "address": 1, "quantity": 1, "sign": 0, "register_type": 1 } ] }
 */
function setModbusChannel(modbus_channels) {
    var channel_id = modbus_channels.channel_id;
    var slave_id = modbus_channels.slave_id;
    var register_address = modbus_channels.register_address;
    var quantity = modbus_channels.quantity;
    var sign = modbus_channels.sign;
    var register_type = modbus_channels.register_type;

    if (channel_id < 1 || channel_id > 32) {
        throw new Error("modbus_channels._item.channel_id must be between 1 and 32");
    }
    if (slave_id < 0 || slave_id > 255) {
        throw new Error("modbus_channels._item.slave_id must be between 0 and 255");
    }
    if (register_address < 0 || register_address > 65535) {
        throw new Error("modbus_channels._item.register_address must be between 0 and 65535");
    }
    if (quantity < 1 || quantity > 16) {
        throw new Error("modbus_channels._item.quantity must be between 1 and 16");
    }
    var register_type_map = {
        0: "MB_REG_COIL",
        1: "MB_REG_DIS",
        2: "MB_REG_INPUT_AB",
        3: "MB_REG_INPUT_BA",
        4: "MB_REG_INPUT_INT32_ABCD",
        5: "MB_REG_INPUT_INT32_BADC",
        6: "MB_REG_INPUT_INT32_CDAB",
        7: "MB_REG_INPUT_INT32_DCBA",
        8: "MB_REG_INPUT_INT32_AB",
        9: "MB_REG_INPUT_INT32_CD",
        10: "MB_REG_INPUT_FLOAT_ABCD",
        11: "MB_REG_INPUT_FLOAT_BADC",
        12: "MB_REG_INPUT_FLOAT_CDAB",
        13: "MB_REG_INPUT_FLOAT_DCBA",
        14: "MB_REG_HOLD_INT16_AB",
        15: "MB_REG_HOLD_INT16_BA",
        16: "MB_REG_HOLD_INT32_ABCD",
        17: "MB_REG_HOLD_INT32_BADC",
        18: "MB_REG_HOLD_INT32_CDAB",
        19: "MB_REG_HOLD_INT32_DCBA",
        20: "MB_REG_HOLD_INT32_AB",
        21: "MB_REG_HOLD_INT32_CD",
        22: "MB_REG_HOLD_FLOAT_ABCD",
        23: "MB_REG_HOLD_FLOAT_BADC",
        24: "MB_REG_HOLD_FLOAT_CDAB",
        25: "MB_REG_HOLD_FLOAT_DCBA",
    };
    var register_type_values = getValues(register_type_map);
    if (register_type_values.indexOf(register_type) === -1) {
        throw new Error("modbus_channels._item.register_type must be one of " + register_type_values.join(", "));
    }
    var sign_map = { 0: "unsigned", 1: "signed" };
    var sign_values = getValues(sign_map);
    if (sign_values.indexOf(sign) === -1) {
        throw new Error("modbus_channels._item.sign must be one of " + sign_values.join(", "));
    }

    var quantity_sign_value = 0x00;
    quantity_sign_value |= getValue(sign_map, sign) << 4;
    quantity_sign_value |= quantity & 0x0f;

    var buffer = new Buffer(9);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xef);
    buffer.writeUInt8(0x01); // config modbus channel
    buffer.writeUInt8(channel_id);
    buffer.writeUInt8(slave_id);
    buffer.writeUInt16LE(register_address);
    buffer.writeUInt8(getValue(register_type_map, register_type));
    buffer.writeUInt8(quantity_sign_value);
    return buffer.toBytes();
}

/**
 * Set modbus channel name
 * @param {object} modbus_channels_name
 * @param {number} modbus_channels_name._item.channel_id range: [1, 32]
 * @param {string} modbus_channels_name._item.name
 * @example { "modbus_channels_name": [ { "channel_id": 1, "name": "modbus_channel_1" } ] }
 */
function setModbusChannelName(modbus_channels_name) {
    var channel_id = modbus_channels_name.channel_id;
    var name = modbus_channels_name.name;

    var buffer = new Buffer(5 + name.length);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xef);
    buffer.writeUInt8(0x02); // config modbus channel name
    buffer.writeUInt8(channel_id);
    buffer.writeUInt8(name.length);
    buffer.writeASCII(name);
    return buffer.toBytes();
}

/**
 * Remove modbus channel
 * @param {object} remove_modbus_channels
 * @param {number} remove_modbus_channels._item.channel_id range: [1, 32]
 * @example { "remove_modbus_channels": [ { "channel_id": 1 } ] }
 */
function removeModbusChannel(remove_modbus_channels) {
    var channel_id = remove_modbus_channels.channel_id;

    if (channel_id < 1 || channel_id > 32) {
        throw new Error("remove_modbus_channels._item.channel_id must be between 1 and 32");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xef);
    buffer.writeUInt8(0x00); // remove modbus channel
    buffer.writeUInt8(channel_id);
    return buffer.toBytes();
}

/**
 * history enable
 * @param {number} history_enable values: (0: disable, 1: enable)
 * @example { "history_enable": 1 }
 */
function setHistoryEnable(history_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(history_enable) === -1) {
        throw new Error("history_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x68);
    buffer.writeUInt8(getValue(enable_map, history_enable));
    return buffer.toBytes();
}

/**
 * history enable
 * @param {number} history_enable values: (0: disable, 1: enable)
 * @example { "history_enable": 1 }
 */
function setHistoryEnable(history_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(history_enable) === -1) {
        throw new Error("history_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x68);
    buffer.writeUInt8(getValue(enable_map, history_enable));
    return buffer.toBytes();
}

/**
 * retransmit enable
 * @param {number} retransmit_enable values: (0: disable, 1: enable)
 * @example { "retransmit_enable": 1 }
 */
function setRetransmitEnable(retransmit_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(retransmit_enable) === -1) {
        throw new Error("retransmit_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x69);
    buffer.writeUInt8(getValue(enable_map, retransmit_enable));
    return buffer.toBytes();
}

/**
 * retransmit interval
 * @param {number} retransmit_interval unit: seconds
 * @example { "retransmit_interval": 300 }
 */
function setRetransmitInterval(retransmit_interval) {
    if (typeof retransmit_interval !== "number") {
        throw new Error("retransmit_interval must be a number");
    }
    if (retransmit_interval < 1 || retransmit_interval > 64800) {
        throw new Error("retransmit_interval must be between 1 and 64800");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x6a);
    buffer.writeUInt8(0x00);
    buffer.writeUInt16LE(retransmit_interval);
    return buffer.toBytes();
}

/**
 * retransmit interval
 * @param {number} resend_interval unit: seconds
 * @example { "resend_interval": 300 }
 */
function setResendInterval(resend_interval) {
    if (typeof resend_interval !== "number") {
        throw new Error("resend_interval must be a number");
    }
    if (resend_interval < 1 || resend_interval > 64800) {
        throw new Error("resend_interval must be between 1 and 64800");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x6a);
    buffer.writeUInt8(0x01);
    buffer.writeUInt16LE(resend_interval);
    return buffer.toBytes();
}

/**
 * fetch history
 * @param {object} fetch_history
 * @param {number} fetch_history.start_time
 * @param {number} fetch_history.end_time
 * @example { "fetch_history": { "start_time": 1609459200, "end_time": 1609545600 } }
 */
function fetchHistory(fetch_history) {
    var start_time = fetch_history.start_time;
    var end_time = fetch_history.end_time || 0;

    if (typeof start_time !== "number") {
        throw new Error("start_time must be a number");
    }
    if ("end_time" in fetch_history && typeof end_time !== "number") {
        throw new Error("end_time must be a number");
    }
    if ("end_time" in fetch_history && start_time > end_time) {
        throw new Error("start_time must be less than end_time");
    }

    var buffer;
    if (end_time === 0) {
        buffer = new Buffer(6);
        buffer.writeUInt8(0xfd);
        buffer.writeUInt8(0x6b);
        buffer.writeUInt32LE(start_time);
    } else {
        buffer = new Buffer(10);
        buffer.writeUInt8(0xfd);
        buffer.writeUInt8(0x6c);
        buffer.writeUInt32LE(start_time);
        buffer.writeUInt32LE(end_time);
    }

    return buffer.toBytes();
}

/**
 * clear history
 * @param {number} clear_history values: (0: no, 1: yes)
 * @example { "clear_history": 1 }
 */
function clearHistory(clear_history) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(clear_history) === -1) {
        throw new Error("clear_history must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, clear_history) === 0) {
        return [];
    }
    return [0xff, 0x27, 0x01];
}

/**
 * history stop transmit
 * @param {number} stop_transmit values: (0: no, 1: yes)
 * @example { "stop_transmit": 1 }
 */
function stopTransmit(stop_transmit) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(stop_transmit) === -1) {
        throw new Error("stop_transmit must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, stop_transmit) === 0) {
        return [];
    }
    return [0xfd, 0x6d, 0xff];
}

function getValues(map) {
    var values = [];
    for (var key in map) {
        values.push(RAW_VALUE ? parseInt(key) : map[key]);
    }
    return values;
}

function getValue(map, value) {
    if (RAW_VALUE) return value;

    for (var key in map) {
        if (map[key] === value) {
            return parseInt(key);
        }
    }

    throw new Error("not match in " + JSON.stringify(map));
}

function Buffer(size) {
    this.buffer = new Array(size);
    this.offset = 0;

    for (var i = 0; i < size; i++) {
        this.buffer[i] = 0;
    }
}

Buffer.prototype._write = function (value, byteLength, isLittleEndian) {
    var offset = 0;
    for (var index = 0; index < byteLength; index++) {
        offset = isLittleEndian ? index << 3 : (byteLength - 1 - index) << 3;
        this.buffer[this.offset + index] = (value >> offset) & 0xff;
    }
};

Buffer.prototype.writeUInt8 = function (value) {
    this._write(value, 1, true);
    this.offset += 1;
};

Buffer.prototype.writeInt8 = function (value) {
    this._write(value < 0 ? value + 0x100 : value, 1, true);
    this.offset += 1;
};

Buffer.prototype.writeUInt16LE = function (value) {
    this._write(value, 2, true);
    this.offset += 2;
};

Buffer.prototype.writeInt16LE = function (value) {
    this._write(value < 0 ? value + 0x10000 : value, 2, true);
    this.offset += 2;
};

Buffer.prototype.writeUInt32LE = function (value) {
    this._write(value, 4, true);
    this.offset += 4;
};

Buffer.prototype.writeInt32LE = function (value) {
    this._write(value < 0 ? value + 0x100000000 : value, 4, true);
    this.offset += 4;
};

Buffer.prototype.writeASCII = function (value) {
    for (var i = 0; i < value.length; i++) {
        this.buffer[this.offset + i] = value.charCodeAt(i);
    }
    this.offset += value.length;
};

Buffer.prototype.toBytes = function () {
    return this.buffer;
};
