/**
 * ATIM ACW-DINRSM-V2 – Modbus master gateway
 * Codec version 1.0.1 – English output
 *
 * LoRaWAN Payload Codec API (TS013) entry points:
 *   decodeUplink(input)
 *
 * Works as is on The Things Stack (TTN v3), ChirpStack v4 and v3, and Node.js.
 * Documentation and examples: README.md and examples.json in this folder.
 * Generated from the French codec by scripts/build-en.js: edit the French codec, then rebuild.
 *
 * Copyright (c) 2026 ATIM – SPDX-License-Identifier: MIT
 */

/* Read an unsigned 16-bit big-endian integer, without Buffer. */
function readUInt16BE(bytes, offset) {
    return ((bytes[offset] << 8) | bytes[offset + 1]) & 0xFFFF;
}

/* Byte at the given offset, or null when missing. */
function byteAt(bytes, offset) {
    return offset < bytes.length ? bytes[offset] & 0xFF : null;
}

function toHex(bytes) {
    var hex = "";
    for (var i = 0; i < bytes.length; i++) {
        hex += ("0" + (bytes[i] & 0xFF).toString(16)).slice(-2);
    }
    return hex;
}

/* Decimal keys: some ES5 engines (ChirpStack v3) do not convert hexadecimal keys. */
var MODBUS_ERRORS = {
    1: { type: "ILLEGAL_FUNCTION", source: "SERVER" },         // 0x01
    2: { type: "ILLEGAL_DATA_ADDRESS", source: "SERVER" },     // 0x02
    3: { type: "ILLEGAL_DATA_VALUE", source: "SERVER" },       // 0x03
    4: { type: "SERVER_FAILURE", source: "SERVER" },           // 0x04
    250: { type: "TIMEOUT", source: "DEVICE" },                // 0xFA
    251: { type: "CRC_ERROR", source: "DEVICE" },              // 0xFB
    252: { type: "MODBUS_PAYLOAD_ERROR", source: "DEVICE" },   // 0xFC
    253: { type: "MODBUS_BUFFER_OVERFLOW", source: "DEVICE" }, // 0xFD
    254: { type: "RADIO_BUFFER_OVERFLOW", source: "DEVICE" },  // 0xFE
    255: { type: "INTERNAL_ERROR", source: "DEVICE" }          // 0xFF
};

function decodeUplink(input) {
    var bytes = input.bytes || [];
    var result = { data: {}, errors: [], warnings: [] };

    if (bytes.length === 0) {
        result.errors.push("Empty payload");
        return result;
    }

    var frameType = bytes[0];

    if (frameType === 0x01) {
        /* Heartbeat: idle and transmit voltages */
        if (bytes.length < 5) {
            result.errors.push("Payload too short for frame type 0x01");
            return result;
        }
        result.data = {
            frameType: "HEART_BEAT",
            radioIdleVoltage: readUInt16BE(bytes, 1),
            radioTransmitVoltage: readUInt16BE(bytes, 3)
        };
    } else if (frameType === 0x03) {
        /* Periodic Modbus data, returned as hex */
        result.data = {
            frameType: "PERIODIC_DATA",
            header: byteAt(bytes, 1),
            payload: toHex(Array.prototype.slice.call(bytes, 2))
        };
    } else if (frameType === 0x83) {
        /* Modbus error */
        var errorCode = byteAt(bytes, 3);
        var error = MODBUS_ERRORS[errorCode] || { type: null, source: null };
        result.data = {
            frameType: "ERROR",
            parameter: byteAt(bytes, 1),
            radioHeader: byteAt(bytes, 2),
            errorCode: errorCode,
            errorType: error.type,
            errorSource: error.source,
            slave: byteAt(bytes, 4),
            functionCode: byteAt(bytes, 5),
            register_msb: byteAt(bytes, 6),
            register_lsb: byteAt(bytes, 7),
            register_nbr: byteAt(bytes, 8)
        };
    }

    return result;
}

/* ---------------------------------------------------------------------------
 * Platform adapters
 * ------------------------------------------------------------------------- */

/* ChirpStack v3 */
function Decode(fPort, bytes, variables) {
    return decodeUplink({ bytes: bytes, fPort: fPort, variables: variables }).data;
}

/* Node.js / CommonJS */
if (typeof module !== "undefined" && module.exports) {
    module.exports.decodeUplink = decodeUplink;
}
