/**
 * Axioma QALCOSONIC W1 LoRaWAN decoder
 *
 * Supported:
 * - FPort 100
 * - 51-byte Enhanced payload
 * - Frame version 0x01
 * - 23 packed 14-bit hourly delta values
 *
 * Output:
 * - timestamp_utc
 * - status
 * - log_volume_m3
 * - delta_1_m3 ... delta_23_m3
 * - history_total_m3
 * - current_volume_m3
 * - alarm/status flags
 *
 * Tested with real QALCOSONIC W1 meters manufactured in 2024.
 */

function decodeUplink(input) {
    const bytes = input.bytes;
    const port = input.fPort;

    function readUInt32LE(offset) {
        return (
            bytes[offset] |
            (bytes[offset + 1] << 8) |
            (bytes[offset + 2] << 16) |
            (bytes[offset + 3] << 24)
        ) >>> 0;
    }

    function readBitsLE(startByte, startBit, length) {
        let value = 0;

        for (let i = 0; i < length; i++) {
            const bitPosition = startBit + i;
            const byteIndex = startByte + Math.floor(bitPosition / 8);
            const bitIndex = bitPosition % 8;

            if (byteIndex >= bytes.length) {
                break;
            }

            if ((bytes[byteIndex] & (1 << bitIndex)) !== 0) {
                value += Math.pow(2, i);
            }
        }

        return value;
    }

    function timestampToISO(timestamp) {
        try {
            return new Date(timestamp * 1000).toISOString();
        } catch (e) {
            return null;
        }
    }

    function decodeStatus(status, data) {
        data.low_battery =
            (status & 0x04) !== 0;

        data.permanent_error =
            (status & 0x08) !== 0;

        data.temporary_error =
            (status & 0x10) !== 0;

        data.pipe_empty =
            status === 0x10;

        data.backflow =
            (status & 0x60) === 0x60;

        data.burst =
            (status & 0xA0) === 0xA0;

        data.leakage =
            (status & 0x20) !== 0 &&
            !data.backflow &&
            !data.burst;

        data.low_temperature =
            (status & 0x80) !== 0 &&
            !data.burst;
    }

    if (port !== 100) {
        return {
            errors: [
                "Unsupported FPort: " + port
            ]
        };
    }

    if (bytes.length !== 51) {
        return {
            errors: [
                "Unsupported payload length: " + bytes.length
            ]
        };
    }

    if (bytes[0] !== 0x01) {
        return {
            errors: [
                "Unsupported frame version: 0x" +
                bytes[0].toString(16)
            ]
        };
    }

    const data = {};

    const frameVersion = bytes[0];
    const timestamp = readUInt32LE(1);
    const status = bytes[5];
    const logVolumeLitres = readUInt32LE(6);

    data.payload_format =
        "AXIOMA_W1_ENHANCED_24H";

    data.frame_version =
        frameVersion;

    data.payload_bytes =
        bytes.length;

    data.timestamp_unix =
        timestamp;

    data.timestamp_utc =
        timestampToISO(timestamp);

    data.status =
        status;

    decodeStatus(status, data);

    data.log_volume_m3 =
        logVolumeLitres / 1000.0;

    let totalDeltaLitres = 0;

    for (let i = 0; i < 23; i++) {
        const deltaLitres =
            readBitsLE(
                10,
                i * 14,
                14
            );

        const index = i + 1;

        data["delta_" + index + "_m3"] =
            deltaLitres / 1000.0;

        totalDeltaLitres +=
            deltaLitres;
    }

    data.history_count =
        23;

    data.history_total_m3 =
        totalDeltaLitres / 1000.0;

    data.current_volume_m3 =
        (
            logVolumeLitres +
            totalDeltaLitres
        ) / 1000.0;

    data.history_multiplier =
        readBitsLE(
            10,
            23 * 14,
            6
        );

    if (data.history_multiplier !== 0) {
        return {
            data: data,
            warnings: [
                "Non-zero history multiplier detected. Additional scaling may be required."
            ]
        };
    }

    return {
        data: data
    };
}
