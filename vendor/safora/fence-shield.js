/**
 * Safora Fence Shield v1.3 - LoRaWAN payload formatter
 * 
 * Full parameter table, defaults, and examples: https://wiki.safora-tech.com/docs/device-setup/fence-shield/lns-registration
 *
 * 11 July 2026
 */

function decodeUplink(input) {
    const bytes = input.bytes;
    const port = input.fPort;

    if (!bytes) {
        return {
        data: {},
        warnings: [],
        errors: ["Missing payload"]
        };
    }

    const uplinkMessageTypeMap = {
        11: "heartbeat_high",
        12: "heartbeat_low",
        13: "fence_high",
        14: "fence_low",
        15: "motion",
        16: "parameter_report"
    };

    const type = uplinkMessageTypeMap[port] || "unknown";  

    // ---------------- Parameter Report ----------------
    if (type === "parameter_report") {
        return {
        data: {
            type: "parameter_report",
            ...decodeParameterReport(bytes)
        },
        warnings: [],
        errors: []
        };
    }

    // ---------------- Motion ----------------
    // Motion packets intentionally contain no voltage measurements.
    if (type === "motion") {
        return {
            data: {
                type,
                version: "v1.3"
            },
            warnings: [],
            errors: []
        };
    }

    // ---------------- Telemetry (3 bytes) ----------------
    // fence[11:0] | battery[11:0]; fence is ADC pin mV → fence volts via divider scale
    if (bytes.length !== 3) {
        return {
        data: {},
        warnings: [],
        errors: ["Expected 3-byte telemetry payload"]
        };
    }

    const fenceRaw = (bytes[0] << 4) | (bytes[1] >> 4);
    // Fence voltage conversion factor
    let fencePositive = Math.round(fenceRaw * 4.469);

    // Already calibrated battery mV (12-bit, clipped at 4095 on device)
    const batteryRaw = ((bytes[1] & 0x0F) << 8) | bytes[2];

    return {
        data: {
        type,
        positive: fencePositive,
        fence: fencePositive,
        batterymV: batteryRaw,
        batterySoC: voltageToSoc(batteryRaw),
        version: "v1.3"
        },
        warnings: [],
        errors: []
    };
}

// LiFePO4 SoC (mV → %)
const lifepo4Curve = [
    { v: 3400, soc: 100 },
    { v: 3350, soc: 90 },
    { v: 3320, soc: 80 },
    { v: 3300, soc: 70 },
    { v: 3270, soc: 60 },
    { v: 3260, soc: 50 },
    { v: 3250, soc: 40 },
    { v: 3220, soc: 30 },
    { v: 3200, soc: 20 },
    { v: 3000, soc: 10 },
    { v: 2500, soc: 0 }
];
    
function voltageToSoc(mV) { 
    if (mV >= lifepo4Curve[0].v) 
        return 100; 
    if (mV <= lifepo4Curve[lifepo4Curve.length - 1].v) 
        return 0; 
    for (let i = 0; i < lifepo4Curve.length - 1; i++) { 
        let high = lifepo4Curve[i]; 
        let low = lifepo4Curve[i + 1]; 
        if (mV <= high.v && mV >= low.v) { 
            let ratio = (mV - low.v) / (high.v - low.v); 
            return Math.round(low.soc + ratio * (high.soc - low.soc)); 
        } 
    } 
}

// Downlink/report parameter IDs (see firmware config.h PARAMETER_INFO).
// measure_interval_ds: value × 10 s. fence_pulse_ms: on wire = ms / 100.
const PARAMETERS = {
    1:  { name: "measure_interval_ds",    len: 1 },
    2:  { name: "hb_divisor",             len: 1 },
    3:  { name: "confirmed_hb_divisor",   len: 1 },

    4:  { name: "fence_trigger",          len: 2 },
    5:  { name: "fence_untrigger",        len: 2 },

    6:  { name: "low_bat_trigger",        len: 2 },
    7:  { name: "low_bat_untrigger",      len: 2 },

    8:  { name: "motion_enabled",         len: 1 },

    9:  { name: "fence_pulse_ms",         len: 1 },

    20: { name: "imu_wom_threshold",      len: 1 },
    24: { name: "imu_wom_duration",       len: 1 },

    100:{ name: "firmware_version",       len: 3 }
};

const PARAMETER_IDS = {};
for (const [id, info] of Object.entries(PARAMETERS)) {
    PARAMETER_IDS[info.name] = Number(id);
}

function decodeParameterReport(bytes) {
    let result = {};
    let i = 0;

    while (i < bytes.length) {
        const id = bytes[i++];
        const info = PARAMETERS[id];

        if (!info) {
            result["unknown_" + id] = "unsupported";
            break;
        }

        if (i + info.len > bytes.length) {
            result.error = "Malformed parameter report";
            break;
        }

        let value = 0;
        for (let j = 0; j < info.len; j++) {
            value = (value << 8) | bytes[i++];
        }

        switch (id) {
            case PARAMETER_IDS["motion_enabled"]:
                result[info.name] = value === 1;
                break;
            case PARAMETER_IDS["fence_pulse_ms"]:
                result[info.name] = value * 100;
                break;
            case PARAMETER_IDS["firmware_version"]:
                result[info.name] = "V" +
                    ((value >> 16) & 0xFF) + "." +
                    ((value >> 8) & 0xFF) + "." +
                    (value & 0xFF);

                break;
            default:
                result[info.name] = value;
        }
    }
    return result;
}

function decodeDownlink(input) {
    const bytes = input.bytes || [];
    const port = input.fPort;

    // ---------------- Request parameter report ----------------
    if (port === 18) {
        return {
            data: { request_report: true },
            warnings: bytes.length ? ["Unexpected payload on request-report port"] : [],
            errors: []
        };
    }

    // ---------------- Hard reset ----------------
    if (port === 19) {
        if (bytes.length !== 2) {
            return {
                data: {},
                warnings: [],
                errors: ["Hard reset expects 2-byte key"]
            };
        }
        const key = (bytes[0] << 8) | bytes[1];
        return {
            data: { reset: key },
            warnings: key !== 0x1234 ? ["Unexpected reset key"] : [],
            errors: []
        };
    }

    // ---------------- Parameter update ----------------
    if (port === 17) {
        return {
            data: {
                params: decodeParameterReport(bytes)
            },
            warnings: [],
            errors: []
        };
    }

    return {
        data: {},
        warnings: [],
        errors: ["Unknown downlink FPort: " + port]
    };
}

function encodeDownlink(input) {
    const data = input.data || {};

    // ---------------- Request parameter report ----------------
    if (data.request_report === true) {
        return {
            fPort: 18,
            bytes: []
        };
    }

    // ---------------- Hard reset ----------------
    if (data.reset !== undefined) {
        if (data.reset !== 0x1234) {
            throw new Error("Invalid reset key");
        }
        return {
            fPort: 19,
            bytes: [0x12, 0x34]
        };
    }

    // ---------------- Parameter update ----------------
    const bytes = [];

    if (!data.params) {
        return {
            fPort: 17,
            bytes
        };
    }

    for (const [id, info] of Object.entries(PARAMETERS)) {
        // Firmware version is read-only
        if (Number(id) === PARAMETER_IDS["firmware_version"])
            continue;

        if (!(info.name in data.params))
            continue;

        let value = data.params[info.name];

        // Convert milliseconds back to 100 ms units
        if (info.name === "fence_pulse_ms") value = Math.round(value / 100);

        // Convert bool to byte
        if (info.name === "motion_enabled") value = value ? 1 : 0;

        bytes.push(Number(id));

        for (let i = info.len - 1; i >= 0; i--) {
            bytes.push((value >> (8 * i)) & 0xFF);
        }
    }

    return {
        fPort: 17,
        bytes
    };
}
