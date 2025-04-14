/**
 * Payload Decoder
 *
 * Copyright 2024 Milesight IoT
 *
 * @product WT201 v1
 */

function decodeUplink(input) {
    var decoded = milesightDeviceDecode(input.bytes);
    return { data: decoded };
}


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
        else if (channel_id === 0xff && channel_type === 0x0a) {
            decoded.firmware_version = readFirmwareVersion(bytes.slice(i, i + 2));
            i += 2;
        }
        // DEVICE STATUS
        else if (channel_id === 0xff && channel_type === 0x0b) {
            decoded.device_status = "on";
            i += 1;
        }
        // LORAWAN CLASS TYPE
        else if (channel_id === 0xff && channel_type === 0x0f) {
            decoded.lorawan_class = readLoRaWANClass(bytes[i]);
            i += 1;
        }
        // PRODUCT SERIAL NUMBER
        else if (channel_id === 0xff && channel_type === 0x16) {
            decoded.sn = readSerialNumber(bytes.slice(i, i + 8));
            i += 8;
        }
        // TSL VERSION
        else if (channel_id === 0xff && channel_type === 0xff) {
            decoded.tsl_version = readFirmwareVersion(bytes.slice(i, i + 2));
            i += 2;
        }
        // TEMPERATURE
        else if (channel_id === 0x03 && channel_type === 0x67) {
            decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
            i += 2;
        }
        // TEMPERATURE TARGET
        else if (channel_id === 0x04 && channel_type === 0x67) {
            decoded.temperature_target = readInt16LE(bytes.slice(i, i + 2)) / 10;
            i += 2;
        }
        // TEMPERATURE CONTROL
        else if (channel_id === 0x05 && channel_type === 0xe7) {
            var temperature_control = bytes[i];
            decoded.temperature_control_mode = readTemperatureCtlMode(temperature_control & 0x03);
            decoded.temperature_control_status = readTemperatureCtlStatus((temperature_control >>> 4) & 0x0f);
            i += 1;
        }
        // FAN CONTROL
        else if (channel_id === 0x06 && channel_type === 0xe8) {
            var value = bytes[i];
            decoded.fan_mode = readFanMode(value & 0x03);
            decoded.fan_status = readFanStatus((value >>> 2) & 0x03);
            i += 1;
        }
        // PLAN EVENT
        else if (channel_id === 0x07 && channel_type === 0xbc) {
            var value = bytes[i];
            decoded.plan_event = readPlanEvent(value & 0x0f);
            i += 1;
        }
        // SYSTEM STATUS
        else if (channel_id === 0x08 && channel_type === 0x8e) {
            decoded.system_status = readSystemStatus(bytes[i]);
            i += 1;
        }
        // HUMIDITY
        else if (channel_id === 0x09 && channel_type === 0x68) {
            decoded.humidity = readUInt8(bytes[i]) / 2;
            i += 1;
        }
        // RELAY STATUS
        else if (channel_id === 0x0a && channel_type === 0x6e) {
            decoded.wires_relay = readWiresRelay(bytes[i]);
            i += 1;
        }
        // PLAN
        else if (channel_id === 0xff && channel_type === 0xc9) {
            var schedule = {};
            schedule.type = readPlanType(bytes[i]);
            schedule.index = bytes[i + 1] + 1;
            schedule.plan_enable = ["disable", "enable"][bytes[i + 2]];
            schedule.week_recycle = readWeekRecycleSettings(bytes[i + 3]);
            var time_mins = readUInt16LE(bytes.slice(i + 4, i + 6));
            schedule.time = Math.floor(time_mins / 60) + ":" + ("0" + (time_mins % 60)).slice(-2);
            i += 6;

            decoded.plan_schedule = decoded.plan_schedule || [];
            decoded.plan_schedule.push(schedule);
        }
        // PLAN SETTINGS
        else if (channel_id === 0xff && channel_type === 0xc8) {
            var plan_setting = {};
            plan_setting.type = readPlanType(bytes[i]);
            plan_setting.temperature_ctl_mode = readTemperatureCtlMode(bytes[i + 1]);
            plan_setting.fan_mode = readFanMode(bytes[i + 2]);
            plan_setting.temperature_target = readUInt8(bytes[i + 3] & 0x7f);
            plan_setting.temperature_unit = readTemperatureUnit(bytes[i + 3] >>> 7);
            plan_setting.temperature_error = readUInt8(bytes[i + 4]) / 10;
            i += 5;

            decoded.plan_settings = decoded.plan_settings || [];
            decoded.plan_settings.push(plan_setting);
        }
        // WIRES
        else if (channel_id === 0xff && channel_type === 0xca) {
            decoded.wires = readWires(bytes[i], bytes[i + 1], bytes[i + 2]);
            decoded.ob_mode = readObMode((bytes[i + 2] >>> 2) & 0x03);
            i += 3;
        }
        // TEMPERATURE MODE SUPPORT
        else if (channel_id === 0xff && channel_type === 0xcb) {
            decoded.temperature_control_mode_enable = readTemperatureCtlModeEnable(bytes[i]);
            decoded.temperature_control_status_enable = readTemperatureCtlStatusEnable(bytes[i + 1], bytes[i + 2]);
            i += 3;
        }
        // CONTROL PERMISSIONS
        else if (channel_id === 0xff && channel_type === 0xf6) {
            decoded.control_permissions = bytes[i] === 1 ? "remote control" : "thermostat";
            i += 1;
        }
        // TEMPERATURE ALARM
        else if (channel_id === 0x83 && channel_type === 0x67) {
            decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
            decoded.temperature_alarm = readTemperatureAlarm(bytes[i + 2]);
            i += 2;
        }
        // TEMPERATURE EXCEPTION
        else if (channel_id === 0xb3 && channel_type === 0x67) {
            decoded.temperature_exception = readException(bytes[i]);
            i += 1;
        }
        // HUMIDITY EXCEPTION
        else if (channel_id === 0xb9 && channel_type === 0x68) {
            decoded.humidity_exception = readException(bytes[i]);
            i += 1;
        }
        // HISTORICAL DATA
        else if (channel_id === 0x20 && channel_type === 0xce) {
            var timestamp = readUInt32LE(bytes.slice(i, i + 4));
            var value1 = readUInt16LE(bytes.slice(i + 4, i + 6));
            var value2 = readUInt16LE(bytes.slice(i + 6, i + 8));

            var data = { timestamp: timestamp };
            // fan_mode(0..1) + fan_status(2..3) + system_status(4) + temperature(5..15)
            data.fan_mode = readFanMode(value1 & 0x03);
            data.fan_status = readFanStatus((value1 >>> 2) & 0x03);
            data.system_status = readSystemStatus((value1 >>> 4) & 0x01);
            var temperature = ((value1 >>> 5) & 0x7ff) / 10 - 100;
            data.temperature = Number(temperature.toFixed(1));

            // temperature_ctl_mode(0..1) + temperature_ctl_status(2..4) + temperature_target(5..15)
            data.temperature_ctl_mode = readTemperatureCtlMode(value2 & 0x03);
            data.temperature_ctl_status = readTemperatureCtlStatus((value2 >>> 2) & 0x07);
            var temperature_target = ((value2 >>> 5) & 0x7ff) / 10 - 100;
            data.temperature_target = Number(temperature_target.toFixed(1));
            i += 8;

            decoded.history = decoded.history || [];
            decoded.history.push(data);
        }
        // DOWNLINK RESPONSE
        else if (channel_id === 0xfe) {
            result = handle_downlink_response(channel_type, bytes, i);
            decoded = Object.assign(decoded, result.data);
            i = result.offset;
        } else if (channel_id === 0xf8) {
            result = handle_downlink_response_ext(channel_type, bytes, i);
            decoded = Object.assign(decoded, result.data);
            i = result.offset;
        } else {
            break;
        }
    }

    return decoded;
}

function readUInt8(bytes) {
    return bytes & 0xff;
}

function readInt8(bytes) {
    var ref = readUInt8(bytes);
    return ref > 0x7f ? ref - 0x100 : ref;
}

function readUInt16LE(bytes) {
    var value = (bytes[1] << 8) + bytes[0];
    return value & 0xffff;
}

function readInt16LE(bytes) {
    var ref = readUInt16LE(bytes);
    return ref > 0x7fff ? ref - 0x10000 : ref;
}

function readUInt32LE(bytes) {
    var value = (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
    return (value & 0xffffffff) >>> 0;
}

function readInt32LE(bytes) {
    var ref = readUInt32LE(bytes);
    return ref > 0x7fffffff ? ref - 0x100000000 : ref;
}

function readProtocolVersion(bytes) {
    var major = (bytes & 0xf0) >> 4;
    var minor = bytes & 0x0f;
    return "v" + major + "." + minor;
}

function readHardwareVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = (bytes[1] & 0xff) >> 4;
    return "v" + major + "." + minor;
}

function readFirmwareVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = bytes[1] & 0xff;
    return "v" + major + "." + minor;
}

function readSerialNumber(bytes) {
    var temp = [];
    for (var idx = 0; idx < bytes.length; idx++) {
        temp.push(("0" + (bytes[idx] & 0xff).toString(16)).slice(-2));
    }
    return temp.join("");
}

function readD2DCommand(bytes) {
    return ("0" + (bytes[1] & 0xff).toString(16)).slice(-2) + ("0" + (bytes[0] & 0xff).toString(16)).slice(-2);
}

function readLoRaWANClass(type) {
    switch (type) {
        case 0x00:
            return "ClassA";
        case 0x01:
            return "ClassB";
        case 0x02:
            return "ClassC";
        case 0x03:
            return "ClassCtoB";
        default:
            return "unknown";
    }
}

function readTemperatureUnit(type) {
    switch (type) {
        case 0x00:
            return "℃";
        case 0x01:
            return "℉";
        default:
            return "unknown";
    }
}

function readTemperatureAlarm(type) {
    // 1: emergency heating timeout alarm, 2: auxiliary heating timeout alarm, 3: persistent low temperature alarm, 4: persistent low temperature alarm release,
    // 5: persistent high temperature alarm, 6: persistent high temperature alarm release, 7: freeze protection alarm, 8: freeze protection alarm release,
    // 9: threshold alarm, 10: threshold alarm release
    switch (type) {
        case 0x01:
            return "emergency heating timeout alarm";
        case 0x02:
            return "auxiliary heating timeout alarm";
        case 0x03:
            return "persistent low temperature alarm";
        case 0x04:
            return "persistent low temperature alarm release";
        case 0x05:
            return "persistent high temperature alarm";
        case 0x06:
            return "persistent high temperature alarm release";
        case 0x07:
            return "freeze protection alarm";
        case 0x08:
            return "freeze protection alarm release";
        case 0x09:
            return "threshold alarm";
        case 0x0a:
            return "threshold alarm release";
        default:
            return "unknown";
    }
}

function readException(type) {
    switch (type) {
        case 0x01:
            return "read failed";
        case 0x02:
            return "out of range";
        default:
            return "unknown";
    }
}

function readPlanEvent(type) {
    // 0: not executed, 1: wake, 2: away, 3: home, 4: sleep
    switch (type) {
        case 0x00:
            return "not executed";
        case 0x01:
            return "wake";
        case 0x02:
            return "away";
        case 0x03:
            return "home";
        case 0x04:
            return "sleep";
        default:
            return "unknown";
    }
}

function readPlanType(type) {
    // 0: wake, 1: away, 2: home, 3: sleep
    switch (type) {
        case 0x00:
            return "wake";
        case 0x01:
            return "away";
        case 0x02:
            return "home";
        case 0x03:
            return "sleep";
        default:
            return "unknown";
    }
}

function readFanMode(type) {
    // 0: auto, 1: on, 2: circulate, 3: disable
    switch (type) {
        case 0x00:
            return "auto";
        case 0x01:
            return "on";
        case 0x02:
            return "circulate";
        case 0x03:
            return "disable";
        default:
            return "unknown";
    }
}

function readFanStatus(type) {
    // 0: standby, 1: high speed, 2: low speed, 3: on
    switch (type) {
        case 0x00:
            return "standby";
        case 0x01:
            return "high speed";
        case 0x02:
            return "low speed";
        case 0x03:
            return "on";
        default:
            return "unknown";
    }
}

function readSystemStatus(type) {
    // 0: off, 1: on
    switch (type) {
        case 0x00:
            return "off";
        case 0x01:
            return "on";
        default:
            return "unknown";
    }
}

function readTemperatureCtlMode(type) {
    // 0: heat, 1: em heat, 2: cool, 3: auto
    switch (type) {
        case 0x00:
            return "heat";
        case 0x01:
            return "em heat";
        case 0x02:
            return "cool";
        case 0x03:
            return "auto";
        default:
            return "unknown";
    }
}

function readTemperatureCtlStatus(type) {
    // 0: standby, 1: stage-1 heat, 2: stage-2 heat, 3: stage-3 heat, 4: stage-4 heat, 5: em heat, 6: stage-1 cool, 7: stage-2 cool
    switch (type) {
        case 0x00:
            return "standby";
        case 0x01:
            return "stage-1 heat";
        case 0x02:
            return "stage-2 heat";
        case 0x03:
            return "stage-3 heat";
        case 0x04:
            return "stage-4 heat";
        case 0x05:
            return "em heat";
        case 0x06:
            return "stage-1 cool";
        case 0x07:
            return "stage-2 cool";
        default:
            return "unknown";
    }
}

function readWires(wire1, wire2, wire3) {
    var wire = [];
    if ((wire1 >>> 0) & 0x03) {
        wire.push("Y1");
    }
    if ((wire1 >>> 2) & 0x03) {
        wire.push("GH");
    }
    if ((wire1 >>> 4) & 0x03) {
        wire.push("OB");
    }
    if ((wire1 >>> 6) & 0x03) {
        wire.push("W1");
    }
    if ((wire2 >>> 0) & 0x03) {
        wire.push("E");
    }
    if ((wire2 >>> 2) & 0x03) {
        wire.push("DI");
    }
    if ((wire2 >>> 4) & 0x03) {
        wire.push("PEK");
    }
    var w2_aux_wire = (wire2 >>> 6) & 0x03;
    switch (w2_aux_wire) {
        case 1:
            wire.push("W2");
            break;
        case 2:
            wire.push("AUX");
            break;
    }
    var y2_gl_wire = (wire3 >>> 0) & 0x03;
    switch (y2_gl_wire) {
        case 1:
            wire.push("Y2");
            break;
        case 2:
            wire.push("GL");
            break;
    }

    return wire;
}

function readWiresRelay(status) {
    var relay = {};
    
    relay.y1 = (status >>> 0) & 0x01;
    relay.y2_gl = (status >>> 1) & 0x01;
    relay.w1 = (status >>> 2) & 0x01;
    relay.w2_aux = (status >>> 3) & 0x01;
    relay.e = (status >>> 4) & 0x01;
    relay.g = (status >>> 5) & 0x01;
    relay.ob = (status >>> 6) & 0x01;

    return relay;
}

function readObMode(type) {
    // 0: cool, 1: heat
    switch (type) {
        case 0x00:
            return "cool";
        case 0x01:
            return "heat";
        default:
            return "unknown";
    }
}

function readTemperatureCtlModeEnable(type) {
    // bit0: heat, bit1: em heat, bit2: cool, bit3: auto
    var enable = [];
    if ((type >>> 0) & 0x01) {
        enable.push("heat");
    }
    if ((type >>> 1) & 0x01) {
        enable.push("em heat");
    }
    if ((type >>> 2) & 0x01) {
        enable.push("cool");
    }
    if ((type >>> 3) & 0x01) {
        enable.push("auto");
    }
    return enable;
}

function readTemperatureCtlStatusEnable(heat_mode, cool_mode) {
    // bit0: stage-1 heat, bit1: stage-2 heat, bit2: stage-3 heat, bit3: stage-4 heat, bit4: aux heat
    var enable = [];
    if ((heat_mode >>> 0) & 0x01) {
        enable.push("stage-1 heat");
    }
    if ((heat_mode >>> 1) & 0x01) {
        enable.push("stage-2 heat");
    }
    if ((heat_mode >>> 2) & 0x01) {
        enable.push("stage-3 heat");
    }
    if ((heat_mode >>> 3) & 0x01) {
        enable.push("stage-4 heat");
    }
    if ((heat_mode >>> 4) & 0x01) {
        enable.push("aux heat");
    }

    // bit0: stage-1 cool, bit1: stage-2 cool
    if ((cool_mode >>> 0) & 0x03) {
        enable.push("stage-1 cool");
    }
    if ((cool_mode >>> 1) & 0x03) {
        enable.push("stage-2 cool");
    }
    return enable;
}

function readWeekRecycleSettings(type) {
    // bit1: "mon", bit2: "tues", bit3: "wed", bit4: "thur", bit5: "fri", bit6: "sat", bit7: "sun"
    var week_enable = [];
    if ((type >>> 1) & 0x01) {
        week_enable.push("Mon.");
    }
    if ((type >>> 2) & 0x01) {
        week_enable.push("Tues.");
    }
    if ((type >>> 3) & 0x01) {
        week_enable.push("Wed.");
    }
    if ((type >>> 4) & 0x01) {
        week_enable.push("Thur.");
    }
    if ((type >>> 5) & 0x01) {
        week_enable.push("Fri.");
    }
    if ((type >>> 6) & 0x01) {
        week_enable.push("Sat.");
    }
    if ((type >>> 7) & 0x01) {
        week_enable.push("Sun.");
    }
    return week_enable;
}

function handle_downlink_response(channel_type, bytes, offset) {
    var decoded = {};

    switch (channel_type) {
        case 0x02: // collection_interval
            decoded.collection_interval = readUInt16LE(bytes.slice(offset, offset + 2));
            offset += 2;
            break;
        case 0x03:
            decoded.outside_temperature = readInt16LE(bytes.slice(offset, offset + 2)) / 10;
            offset += 2;
            break;
        case 0x06: // temperature_threshold_config
            var ctl = readUInt8(bytes[offset]);
            var condition = ctl & 0x07;
            var alarm_type = (ctl >>> 3) & 0x07;

            var data = { condition: condition, alarm_type: alarm_type };

            if (condition === 1 || condition === 3 || condition === 4) {
                data.min = readInt16LE(bytes.slice(offset + 1, offset + 3)) / 10;
            }
            if (condition === 2 || condition === 3 || condition === 4) {
                data.max = readInt16LE(bytes.slice(offset + 3, offset + 5)) / 10;
            }
            data.lock_time = readInt16LE(bytes.slice(offset + 5, offset + 7));
            data.continue_time = readInt16LE(bytes.slice(offset + 7, offset + 9));
            offset += 9;

            decoded.temperature_threshold_config = decoded.temperature_threshold_config || [];
            decoded.temperature_threshold_config.push(data);
            break;
        case 0x25:
            var masked = readUInt8(bytes[offset]);
            var status = readUInt8(bytes[offset + 1]);

            decoded.child_lock_config = decoded.child_lock_config || {};
            if ((masked >> 0) & 0x01) {
                decoded.child_lock_config.power_button = (status >> 0) & 0x01;
            }
            if ((masked >> 1) & 0x01) {
                decoded.child_lock_config.up_button = (status >> 1) & 0x01;
            }
            if ((masked >> 2) & 0x01) {
                decoded.child_lock_config.down_button = (status >> 2) & 0x01;
            }
            if ((masked >> 3) & 0x01) {
                decoded.child_lock_config.fan_button = (status >> 3) & 0x01;
            }
            if ((masked >> 4) & 0x01) {
                decoded.child_lock_config.mode_button = (status >> 4) & 0x01;
            }
            if ((masked >> 5) & 0x01) {
                decoded.child_lock_config.reset_button = (status >> 5) & 0x01;
            }

            offset += 2;
            break;
        case 0x82:
            decoded.multicast_group_config = {};
            var value = readUInt8(bytes[offset]);
            var mask = value >>> 4;
            var enabled = value & 0x0f;
            if (((mask >> 0) & 0x01) === 1) {
                decoded.multicast_group_config.group1_enable = enabled & 0x01;
            }
            if (((mask >> 1) & 0x01) === 1) {
                decoded.multicast_group_config.group2_enable = (enabled >> 1) & 0x01;
            }
            if (((mask >> 2) & 0x01) === 1) {
                decoded.multicast_group_config.group3_enable = (enabled >> 2) & 0x01;
            }
            if (((mask >> 3) & 0x01) === 1) {
                decoded.multicast_group_config.group4_enable = (enabled >> 3) & 0x01;
            }
            offset += 1;
            break;
        case 0x83:
            var config = {};
            config.id = readUInt8(bytes[offset]) + 1;
            config.enable = readUInt8(bytes[offset + 1]);
            if (config.enable === 1) {
                config.d2d_cmd = readD2DCommand(bytes.slice(offset + 2, offset + 4));
                config.action_type = (readUInt8(bytes[offset + 4]) >>> 4) & 0x0f;
                config.action = readUInt8(bytes[offset + 4]) & 0x0f;
            }
            offset += 5;

            decoded.d2d_slave_config = decoded.d2d_slave_config || [];
            decoded.d2d_slave_config.push(config);
            break;
        case 0x96:
            var config = {};
            config.mode = readUInt8(bytes[offset]);
            config.enable = readUInt8(bytes[offset + 1]);
            if (config.enable === 1) {
                config.uplink_enable = readUInt8(bytes[offset + 2]);
                config.d2d_cmd = readD2DCommand(bytes.slice(offset + 3, offset + 5));
                config.time_enable = readUInt8(bytes[offset + 7]);
                if (config.time_enable === 1) {
                    config.time = readUInt16LE(bytes.slice(offset + 5, offset + 7));
                }
            }
            offset += 8;

            decoded.d2d_master_config = decoded.d2d_master_config || [];
            decoded.d2d_master_config.push(config);
            break;
        case 0x4a: // sync_time
            decoded.sync_time = 1;
            offset += 1;
            break;
        case 0x8e: // report_interval
            // ignore the first byte
            decoded.report_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            offset += 3;
            break;
        case 0xab:
            decoded.temperature_calibration = {};
            decoded.temperature_calibration.enable = readUInt8(bytes[offset]);
            if (decoded.temperature_calibration.enable === 1) {
                decoded.temperature_calibration.temperature = readInt16LE(bytes.slice(offset + 1, offset + 3)) / 10;
            }
            offset += 3;
            break;
        case 0xb0:
            decoded.freeze_protection_config = decoded.freeze_protection_config || {};
            decoded.freeze_protection_config.enable = readUInt8(bytes[offset]);
            if (decoded.freeze_protection_config.enable === 1) {
                decoded.freeze_protection_config.temperature = readInt16LE(bytes.slice(offset + 1, offset + 3)) / 10;
            }
            offset += 3;
            break;
        case 0xb5: // ob_mode
            decoded.ob_mode = readUInt8(bytes[offset]);
            offset += 1;
            break;
        case 0xb6:
            decoded.fan_mode = readUInt8(bytes[offset]);
            offset += 1;
            break;
        case 0xb7:
            decoded.temperature_control_mode = readUInt8(bytes[offset]);
            var t = readUInt8(bytes[offset + 1]);
            decoded.temperature_target = t & 0x7f;
            decoded.temperature_unit = (t >>> 7) & 0x01;
            offset += 2;
            break;
        case 0xb8: // temperature_tolerance
            decoded.temperature_tolerance = {};
            decoded.temperature_tolerance.temperature_error = readUInt8(bytes[offset]) / 10;
            decoded.temperature_tolerance.auto_control_temperature_error = readUInt8(bytes[offset + 1]) / 10;
            offset += 2;
            break;
        case 0xb9:
            decoded.temperature_level_up_condition = {};
            decoded.temperature_level_up_condition.type = readUInt8(bytes[offset]);
            decoded.temperature_level_up_condition.time = readUInt8(bytes[offset + 1]);
            decoded.temperature_level_up_condition.temperature_error = readInt16LE(bytes.slice(offset + 2, offset + 4)) / 10;
            offset += 4;
            break;
        case 0xba:
            decoded.dst_config = {};
            decoded.dst_config.enable = readUInt8(bytes[offset]);
            if (decoded.dst_config.enable === 1) {
                decoded.dst_config.offset = readUInt8(bytes[offset + 1]);
                decoded.dst_config.start_time = {};
                decoded.dst_config.start_time.month = readUInt8(bytes[offset + 2]);
                var start_day = readUInt8(bytes[offset + 3]);
                decoded.dst_config.start_time.week = (start_day >>> 4) & 0x0f;
                decoded.dst_config.start_time.weekday = start_day & 0x0f;
                var start_time = readUInt16LE(bytes.slice(offset + 4, offset + 6));
                decoded.dst_config.start_time.time = Math.floor(start_time / 60) + ":" + ("0" + (start_time % 60)).slice(-2);
                decoded.dst_config.end_time = {};
                decoded.dst_config.end_time.month = readUInt8(bytes[offset + 6]);
                var end_day = readUInt8(bytes[offset + 7]);
                decoded.dst_config.end_time.week = (end_day >>> 4) & 0x0f;
                decoded.dst_config.end_time.weekday = end_day & 0x0f;
                var end_time = readUInt16LE(bytes.slice(offset + 8, offset + 10));
                decoded.dst_config.end_time.time = Math.floor(end_time / 60) + ":" + ("0" + (end_time % 60)).slice(-2);
            }
            offset += 10;
            break;
        case 0xbd: // timezone
            decoded.timezone = readInt16LE(bytes.slice(offset, offset + 2)) / 60;
            offset += 2;
            break;
        case 0xc1:
            decoded.card_config = {};
            decoded.card_config.enable = readUInt8(bytes[offset]);
            if (decoded.card_config.enable === 1) {
                decoded.card_config.action_type = readUInt8(bytes[offset + 1]);
                if (decoded.card_config.action_type === 1) {
                    var action = readUInt8(bytes[offset + 2]);
                    decoded.card_config.in_plan_type = (action >>> 4) & 0x0f;
                    decoded.card_config.out_plan_type = action & 0x0f;
                }
                decoded.card_config.invert = readUInt8(bytes[offset + 3]);
            }
            offset += 4;
            break;
        case 0xc2:
            decoded.plan_mode = readUInt8(bytes[offset]);
            offset += 1;
            break;
        case 0xc4:
            decoded.outside_temperature_control_config = decoded.outside_temperature_control_config || {};
            decoded.outside_temperature_control_config.enable = readUInt8(bytes[offset]);
            if (decoded.outside_temperature_control_config.enable === 1) {
                decoded.outside_temperature_control_config.timeout = readUInt8(bytes[offset + 1]);
            }
            offset += 2;
            break;
        case 0xc5:
            decoded.temperature_control_enable = readUInt8(bytes[offset]);
            offset += 1;
            break;
        case 0xc7:
            var data = readUInt8(bytes[offset]);
            offset += 1;

            var mask = data >>> 4;
            var status = data & 0x0f;

            if ((mask >> 0) & 0x01) {
                decoded.d2d_master_enable = status & 0x01;
            }
            if ((mask >> 1) & 0x01) {
                decoded.d2d_slave_enable = (status >> 1) & 0x01;
            }
            break;
        case 0xc8:
            decoded.plan_config = decoded.plan_config || {};
            decoded.plan_config.type = readUInt8(bytes[offset]);
            decoded.plan_config.temperature_control_mode = readUInt8(bytes[offset + 1]);
            decoded.plan_config.fan_mode = readUInt8(bytes[offset + 2]);
            var t = readInt8(bytes[offset + 3]);
            decoded.plan_config.temperature_target = t & 0x7f;
            decoded.temperature_unit = (t >>> 7) & 0x01;
            decoded.plan_config.temperature_error = readInt8(bytes[offset + 4]) / 10;
            offset += 5;
            break;
        case 0xc9:
            var schedule = {};
            schedule.type = bytes[offset];
            schedule.id = bytes[offset + 1] + 1;
            schedule.enable = bytes[offset + 2];
            schedule.week_recycle = readWeekRecycleSettings(bytes[offset + 3]);
            var time_mins = readUInt16LE(bytes.slice(offset + 4, offset + 6));
            schedule.time = Math.floor(time_mins / 60) + ":" + ("0" + (time_mins % 60)).slice(-2);
            offset += 6;

            decoded.plan_schedule = decoded.plan_schedule || [];
            decoded.plan_schedule.push(schedule);
            break;
        case 0xca:
            decoded.wires = readWires(bytes[offset], bytes[offset + 1], bytes[offset + 2]);
            decoded.ob_mode = (bytes[offset + 2] >>> 2) & 0x03;
            offset += 3;
            break;
        case 0xf6:
            decoded.control_permissions = readUInt8(bytes[offset]);
            offset += 1;
            break;
        case 0xf7:
            var wire_relay_bit_offset = { y1: 0, y2_gl: 1, w1: 2, w2_aux: 3, e: 4, g: 5, ob: 6 };
            var mask = readUInt16LE(bytes.slice(offset, offset + 2));
            var status = readUInt16LE(bytes.slice(offset + 2, offset + 4));
            offset += 4;

            decoded.wires_relay_config = {};
            for (var key in wire_relay_bit_offset) {
                if ((mask >>> wire_relay_bit_offset[key]) & 0x01) {
                    decoded.wires_relay_config[key] = (status >>> wire_relay_bit_offset[key]) & 0x01;
                }
            }
            break;
        case 0xf8: // offline_control_mode
            decoded.offline_control_mode = readUInt8(bytes[offset]);
            break;
        case 0xf9: // humidity_calibration
            decoded.humidity_calibration = {};
            decoded.humidity_calibration.enable = readUInt8(bytes[offset]);
            if (decoded.humidity_calibration.enable === 1) {
                decoded.humidity_calibration.humidity = readInt16LE(bytes.slice(offset + 1, offset + 3)) / 10;
            }
            offset += 3;
            break;
        case 0xfa:
            decoded.temperature_control_mode = readUInt8(bytes[offset]);
            decoded.temperature_target = readInt16LE(bytes.slice(offset + 1, offset + 3)) / 10;
            offset += 3;
            break;
        case 0xfb:
            decoded.temperature_control_mode = readUInt8(bytes[offset]);
            offset += 1;
            break;
        default:
            throw new Error("unknown downlink response");
    }

    return { data: decoded, offset: offset };
}

function handle_downlink_response_ext(channel_type, bytes, offset) {
    var decoded = {};

    switch (channel_type) {
        case 0x05:
            var fan_delay_control_result = readUInt8(bytes[offset + 2]);
            if (fan_delay_control_result === 0) {
                decoded.fan_delay_enable = readUInt8(bytes[offset]);
                decoded.fan_delay_time = readUInt8(bytes[offset + 1]);
            } else {
                throw new Error("fan delay control failed");
            }
            offset += 3;
            break;
        case 0x06:
            var fan_execute_result = readUInt8(bytes[offset + 1]);
            if (fan_execute_result === 0) {
                decoded.fan_execute_time = readUInt8(bytes[offset]);
            } else {
                throw new Error("fan execute control failed");
            }

            offset += 2;
            break;
        case 0x07:
            var dehumidify_control_result = readUInt8(bytes[offset + 2]);
            if (dehumidify_control_result === 0) {
                decoded.fan_dehumidify = {};
                decoded.fan_dehumidify.enable = readUInt8(bytes[offset]);
                if (decoded.fan_dehumidify.enable === 1) {
                    decoded.fan_dehumidify.execute_time = readUInt8(bytes[offset + 1]);
                }
            }
            offset += 3;
            break;
        case 0x09:
            var humidity_range_result = readUInt8(bytes[offset + 2]);
            if (humidity_range_result === 0) {
                decoded.humidity_range = {};
                decoded.humidity_range.min = readUInt8(bytes[offset]);
                decoded.humidity_range.max = readUInt8(bytes[offset + 1]);
            } else {
                throw new Error("humidity range control failed");
            }
            offset += 3;
            break;
        case 0x0a:
            var dehumidify_result = readUInt8(bytes[offset + 2]);
            if (dehumidify_result === 0) {
                decoded.temperature_dehumidify = {};
                decoded.temperature_dehumidify.enable = readUInt8(bytes[offset]);
                if (decoded.temperature_dehumidify.enable === 1) {
                    var value = readUInt8(bytes[offset + 1]);
                    if (value !== 0xff) {
                        decoded.temperature_dehumidify.temperature_tolerance = readUInt8(bytes[offset + 1]) / 10;
                    }
                }
            } else {
                throw new Error("dehumidify control failed");
            }
            offset += 3;
            break;
        default:
            throw new Error("unknown downlink response");
    }

    return { data: decoded, offset: offset };
}

if (!Object.assign) {
    Object.defineProperty(Object, "assign", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (target) {
            "use strict";
            if (target == null) {
                // TypeError if undefined or null
                throw new TypeError("Cannot convert first argument to object");
            }

            var to = Object(target);
            for (var i = 1; i < arguments.length; i++) {
                var nextSource = arguments[i];
                if (nextSource == null) {
                    // Skip over if undefined or null
                    continue;
                }
                nextSource = Object(nextSource);

                var keysArray = Object.keys(Object(nextSource));
                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                    var nextKey = keysArray[nextIndex];
                    var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== undefined && desc.enumerable) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
            return to;
        },
    });
}