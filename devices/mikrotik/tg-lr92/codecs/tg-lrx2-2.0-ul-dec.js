const ACTIVITY_STATE_MASK = 0x03;
const ORIENTATION_MASK = 0x07;

function bytesToString(bytes) {
    return String.fromCharCode(...bytes);
}

function activityState(value) {
    switch (value & ACTIVITY_STATE_MASK) {
        case 0:
            return "IDLE";
        case 1:
            return "LOW";
        case 2:
            return "HIGH";
        default:
        case 3:
            return "DISABLED";
    }
}

function majorOrientation(value) {
    switch (value & ORIENTATION_MASK) {
        case 0:
            return "XH";
        case 1:
            return "XL";
        case 2:
            return "YH";
        case 3:
            return "YL";
        case 4:
            return "ZH";
        case 5:
            return "ZL";
        default:
            return "DISABLED";
    }
}

function decode(bytes, format) {
    if (format == "bool") {
        return bytes[0] & 1 ? true : false;
    }
    if (format == "u8") {
        return bytes[0];
    }
    if (format == "i8") {
        return bytes[0] << 24 >> 24;
    }
    if (format == "i16") {
        return (bytes[0] | bytes[1] << 8) << 16 >> 16;
    }
    if (format == "u16") {
        return bytes[0] | bytes[1] << 8;
    }
    if (format == "u32") {
        return bytes[0] | bytes[1] << 8 | bytes[2] << 16 | bytes[3] << 24;
    }
    if (format == "f8.8") {
        return ((bytes[0] | bytes[1] << 8) << 16 >> 16) / 256;
    }
    if (format == "orient") {
        return majorOrientation(bytes[0] & ORIENTATION_MASK);
    }
    if (format == "activity") {
        return activityState(bytes[0] & ACTIVITY_STATE_MASK);
    }
    return 0;
}

const variables = {
    0: {
        name: "profile",
        fmt: "u8"
    },
    1: {
        name: "profile_etm",
        fmt: "u32"
    },
    2: {
        name: "daytime_tm",
        fmt: "u32"
    },
    3: {
        name: "unix_time",
        fmt: "u32"
    },
    4: {
        name: "net_frame_etm",
        fmt: "u32"
    },
    5: {
        name: "net_joined_flag",
        fmt: "bool"
    },
    6: {
        name: "net_class",
        fmt: "u8"
    },
    7: {
        name: "net_region",
        fmt: "u8"
    },
    8: {
        name: "temperature",
        fmt: "f8.8"
    },
    9: {
        name: "temperature_ema",
        fmt: "f8.8"
    },
    10: {
        name: "humidity",
        fmt: "u8"
    },
    11: {
        name: "humidity_ema",
        fmt: "u8"
    },
    12: {
        name: "mag_sw_cnt",
        fmt: "u32"
    },
    13: {
        name: "mag_sw_etm",
        fmt: "u32"
    },
    14: {
        name: "mag_sw_flag",
        fmt: "bool"
    },
    15: {
        name: "activity_state",
        fmt: "activity"
    },
    16: {
        name: "activity_s",
        fmt: "u32"
    },
    17: {
        name: "high_activity_s",
        fmt: "u32"
    },
    18: {
        name: "major_axis_orientation",
        fmt: "orient"
    },
    19: {
        name: "impact_cnt_x",
        fmt: "u32"
    },
    20: {
        name: "impact_cnt_y",
        fmt: "u32"
    },
    21: {
        name: "impact_cnt_z",
        fmt: "u32"
    },
    22: {
        name: "impact_cnt",
        fmt: "u32"
    },
    23: {
        name: "impact_evnt",
        fmt: "bool"
    },
    24: {
        name: "impact_etm",
        fmt: "u32"
    },
    25: {
        name: "free_fall_cnt",
        fmt: "u32"
    },
    26: {
        name: "free_fall_evnt",
        fmt: "bool"
    },
    27: {
        name: "free_fall_etm",
        fmt: "u32"
    },
    28: {
        name: "angle_1",
        fmt: "u8"
    },
    29: {
        name: "angle_2",
        fmt: "u8"
    },
    30: {
        name: "angle_3",
        fmt: "u8"
    },
    31: {
        name: "angle_ema",
        fmt: "u8"
    },
    32: {
        name: "battery_mv",
        fmt: "u16"
    },
    33: {
        name: "battery_mv_ema",
        fmt: "u16"
    },
    35: {
        name: "timer_1",
        fmt: "u32"
    },
    36: {
        name: "timer_2",
        fmt: "u32"
    },
    37: {
        name: "timer_3",
        fmt: "u32"
    },
    38: {
        name: "timer_4",
        fmt: "u32"
    },
    39: {
        name: "activity_state_etm",
        fmt: "u32"
    }
};

function decodeFragment(bytes) {
    const pl = bytes.splice(0, 3 + bytes[2]);
    const frag_data = {
        offset: (pl[0] | pl[1] << 8) & 0x7FFF,
        len: pl[2],
        frag_bytes: pl.slice(3, 3 + pl[2]),
        final_frag: pl[1] >> 7 & 0x1
    };
    return frag_data;
}

const frame_decoders = {
    1: {
        name: "current-state",
        codec: (bytes) => {
            const pl = bytes.splice(0, 5);
            const data = {
                temperature: decode(pl.slice(0), "f8.8"),
                humidity: pl[2],
                mag_sw_cnt_u8: pl[3],
                major_axis_orientation: majorOrientation(pl[4]),
                activity_state: activityState(pl[4] >> 3),
                free_fall_evnt: pl[4] >> 5 & 0x1,
                impact_evnt: pl[4] >> 6 & 0x1,
                pending_evnt: pl[4] >> 7 & 0x1
            };
            return data;
        }
    },
    2: {
        name: "device-events",
        codec: (bytes) => {
            let last_event = false;
            let data = {
                events: []
            };
            let max_events = 100;

            do {
                const event_len = bytes[0] & 0x7F;
                last_event = (bytes[0] >> 7 & 1) === 0;

                const pl = bytes.splice(0, event_len + 1);

                const time_stamp = decode(pl.slice(1), "u32");
                const code = pl[5];
                const value_len = Math.max(event_len - 5, 0);
                const data_bytes = pl.slice(6, 6 + value_len);

                let event = {
                    time: new Date(time_stamp * 1000).toJSON(),
                    time_unix: time_stamp
                };

                let field_name = "sys-event";
                let field_value = code;

                if (code in variables) {
                    field_name = variables[code].name;
                    field_value = decode(data_bytes, variables[code].fmt);
                }
                else if (code >= 100 && code <= 229) {
                    field_name = "data_rule";
                    field_value = code - 100;
                }
                else if (code == 230) {
                    field_name = "cmd_error";
                    field_value = decode(data_bytes, "i16");
                }
                else if (code == 231) {
                    field_name = "fault_address";
                    field_value = decode(data_bytes, "u32");
                }

                event[field_name] = field_value;

                data.events.push(event);
                max_events--;
            } while (!last_event && max_events);

            return data;
        }
    },
    3: {
        name: "temp-histogram",
        codec: (bytes) => {
            const pl = bytes.splice(0, 11);
            const data = {
                temp_histo_epoch: pl[0],
                temp_histo_bin1: pl[1],
                temp_histo_bin2: pl[2],
                temp_histo_bin3: pl[3],
                temp_histo_bin4: pl[4],
                temp_histo_bin5: pl[5],
                temp_histo_bin6: pl[6],
                temp_histo_bin7: pl[7],
                temp_histo_bin8: pl[8],
                temp_histo_bin9: pl[9],
                temp_histo_bin10: pl[10]
            };
            return data;
        }
    },
    4: {
        name: "humid-histogram",
        codec: (bytes) => {
            const pl = bytes.splice(0, 11);
            const data = {
                humid_histo_epoch: pl[0],
                humid_histo_bin1: pl[1],
                humid_histo_bin2: pl[2],
                humid_histo_bin3: pl[3],
                humid_histo_bin4: pl[4],
                humid_histo_bin5: pl[5],
                humid_histo_bin6: pl[6],
                humid_histo_bin7: pl[7],
                humid_histo_bin8: pl[8],
                humid_histo_bin9: pl[9],
                humid_histo_bin10: pl[10]
            };
            return data;
        }
    },
    5: {
        name: "device-orientation",
        codec: (bytes) => {
            const pl = bytes.splice(0, 3);
            const data = {
                orientation_x: decode(pl.slice(0), "i8"),
                orientation_y: decode(pl.slice(1), "i8"),
                orientation_z: decode(pl.slice(2), "i8")
            };
            return data;
        }
    },
    6: {
        name: "full-activity",
        codec: (bytes) => {
            const pl = bytes.splice(0, 9);
            const data = {
                activity_state: activityState(pl[0]),
                activity_s: decode(pl.slice(1), "u32"),
                high_activity_s: decode(pl.slice(5), "u32")
            };
            return data;
        }
    },
    7: {
        name: "motion-events",
        codec: (bytes) => {
            const pl = bytes.splice(0, 8);
            const data = {
                impact_cnt: decode(pl.slice(0), "u32"),
                free_fall_cnt: decode(pl.slice(4), "u32")
            };
            return data;
        }
    },
    8: {
        name: "mag-switch",
        codec: (bytes) => {
            const pl = bytes.splice(0, 8);
            const data = {
                mag_sw_cnt: decode(pl.slice(0), "u32"),
                mag_switch_ts: decode(pl.slice(4), "u32"),
                mag_switch_ts_gmt: new Date(decode(pl.slice(4), "u32") * 1000).toJSON()
            };
            return data;
        }
    },
    9: {
        name: "impact-count",
        codec: (bytes) => {
            const pl = bytes.splice(0, 8);
            const data = {
                impact_cnt_u16: decode(pl.slice(0), "u16"),
                impact_cnt_x_u16: decode(pl.slice(2), "u16"),
                impact_cnt_y_u16: decode(pl.slice(4), "u16"),
                impact_cnt_z_u16: decode(pl.slice(6), "u16")
            };
            return data;
        }
    },
    10: {
        name: "last-temp",
        codec: (bytes) => {
            const pl = bytes.splice(0, 2);
            const data = {
                temperature: decode(pl.slice(0), "f8.8"),
            };
            return data;
        }
    },
    11: {
        name: "ema-temp",
        codec: (bytes) => {
            const pl = bytes.splice(0, 2);
            const data = {
                temperature_ema: decode(pl.slice(0), "f8.8"),
            };
            return data;
        }
    },
    12: {
        name: "last-humid",
        codec: (bytes) => {
            const pl = bytes.splice(0, 1);
            const data = {
                humidity: pl[0]
            };
            return data;
        }
    },
    13: {
        name: "ema-humid",
        codec: (bytes) => {
            const pl = bytes.splice(0, 1);
            const data = {
                humidity_ema: pl[0]
            };
            return data;
        }
    },
    14: {
        name: "activity",
        codec: (bytes) => {
            const pl = bytes.splice(0, 5);
            const data = {
                activity_state: activityState(pl[0]),
                total_activity_s: decode(pl.slice(1), "u32")
            };
            return data;
        }
    },
    20: {
        name: "dev-time",
        codec: (bytes) => {
            const pl = bytes.splice(0, 8);
            const data = {
                uptime_s: decode(pl.slice(0), "u32"),
                unix_time: decode(pl.slice(4), "u32"),
                dev_time: new Date(decode(pl.slice(4), "u32") * 1000).toJSON()
            };
            return data;
        }
    },
    21: {
        name: "dev-health",
        codec: (bytes) => {
            const pl = bytes.splice(0, 2);
            const data = {
                battery_mv: decode(pl.slice(0), "u16")
            };
            return data;
        }
    },
    22: {
        name: "version",
        codec: (bytes) => {
            const pl = bytes.splice(0, 11);
            const data = {
                version_pid: decode(pl.slice(0), "u16"),
                version_maj: pl[2],
                version_min: pl[3],
                version_rev: pl[4],
                version_hash: bytesToString(pl.slice(5, 11))
            };
            return data;
        }
    },
    23: {
        name: "serial-number",
        codec: (bytes) => {
            const pl = bytes.splice(0, 11);
            const data = {
                serial_number: bytesToString(pl.slice(0,11))
            };
            return data;
        }
    },
    24: {
        name: "cfg-state",
        codec: (bytes) => {
            const pl = bytes.splice(0, 10);
            const data = {
                cfg_app_crc: decode(pl.slice(0), "u16"),
                cfg_net_crc: decode(pl.slice(2), "u16"),
                cfg_frames_crc: decode(pl.slice(4), "u16"),
                cfg_data_crc: decode(pl.slice(6), "u16"),
                cfg_rules_crc: decode(pl.slice(8), "u16")
            };
            return data;
        }
    },
    25: {
        name: "full-cfg",
        codec: (bytes) => {
            const data = {
                full_cfg: decodeFragment(bytes)
            };
            return data;
        }
    },
    26: {
        name: "app-cfg",
        codec: (bytes) => {
            const data = {
                app_cfg: decodeFragment(bytes)
            };
            return data;
        }
    },
    27: {
        name: "net-cfg",
        codec: (bytes) => {
            const data = {
                net_cfg: decodeFragment(bytes)
            };
            return data;
        }
    },
    28: {
        name: "frame-cfg",
        codec: (bytes) => {
            const data = {
                frame_cfg: decodeFragment(bytes)
            };
            return data;
        }
    },
    29: {
        name: "data-cfg",
        codec: (bytes) => {
            const data = {
                data_cfg: decodeFragment(bytes)
            };
            return data;
        }
    },
    30: {
        name: "rules-cfg",
        codec: (bytes) => {
            const data = {
                rules_cfg: decodeFragment(bytes)
            };
            return data;
        }
    }
};

function decodeFrameType(previous_type, bytes) {
    const BLOCK = 0x1;
    const LAST_BLOCK = 0x2;
    const FTYPE_BITS = 6;
    const FTYPE_MASK = (1 << FTYPE_BITS) - 1;

    let frame_type_delta = 0;

    while (bytes.length > 0) {
        const byte = bytes.shift();
        const type = byte >> FTYPE_BITS;
        const value = byte & FTYPE_MASK;

        if (type == BLOCK || type == LAST_BLOCK) {
            frame_type_delta |= value;

            if (type == LAST_BLOCK) {
                return previous_type + frame_type_delta;
            }

            frame_type_delta <<= FTYPE_BITS;
        }
        else {
            break;
        }
    }
    return null;
}

function decodeUplink(input) {
    const APP_PORT_MIN = 1
    const APP_PORT_MAX = 223

    let data = {};
    let warnings = [];
    let errors = [];

    if (input.fPort >= APP_PORT_MIN && input.fPort <= APP_PORT_MAX) {
        let bytes = [input.fPort].concat(input.bytes);
        let frame_type = 0;

        while (bytes.length > 0) {
            frame_type = decodeFrameType(frame_type, bytes);
            if (frame_type in frame_decoders) {
                Object.assign(data, frame_decoders[frame_type]["codec"](bytes));
            }
            else {
                errors = errors.concat("Invalid key: " + frame_type);
                break;
            }
        }
    }

    return {
        data: data,
        warnings: warnings,
        errors: errors
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = decodeUplink;
}
