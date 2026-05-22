class DataPoint {
    constructor(name, group,min, max, size, units,value) {
        this.name = name;
        this.min = min;
        this.max = max;
        this.size = size;
        this.units = units;
        this.value = value;
        this.group = group;
    }

    parse(bits) {
        if (bits.length !== this.size) {
            throw new Error(`Bit length mismatch for ${this.name}: expected ${this.size}, got ${bits.length}`);
        }
        var value = parseInt(bits, 2);
        if (value < this.min || value > this.max) {
            throw new Error(`Value of ${this.name} out of range: ${value} (min: ${this.min}, max: ${this.max})`);
        }

        if (typeof this.value === 'string' && this.value.startsWith('#')) {
            const functionName = "decode"+this.value.slice(1);
            if (typeof this[functionName] === 'function') {
                value = this[functionName](value);
            } else {
                throw new Error(`No such function: ${functionName} for ${this.name}`);
            }

        } else if (this.value.startsWith('[')) {
            const functionName = "decodeLookUpTable";
            if (typeof this[functionName] === 'function') {
                value = this[functionName](value, this.value);
            } else {
                throw new Error(`No such function: ${functionName} for ${this.name}`);
            }
        }

        return value;
    }

    decodeActualityDurationCompact(input) {
        // String in Minutes/Hours/Days: 3d4h3m
        // Testvalues: 59=0x3B=59m, 60=0x3C=1h, 155=23h 45m, 156=0x9C=1d, 197=0xC7=7wks, 197=C5=49d,207=0xCF=1wk, 252=0xFB=52wks

        var duration= "";
        if (input < 0 || input > 255) {
            duration = "unknown";
        } else if (input <= 59) {
            duration = input +" minutes";
        } else if (input > 59 && input < 152) {
            var durationMin = ((input - 60) * 15) % 60;
            var durationHour = Math.floor(((input - 60) * 15) / 60) + 1;
            duration = durationHour + "h " + durationMin + "m";
        } else if (152 <= input && input < 200) {
            var durationDays = input - 152 + 1;
            duration = durationDays + " days";
        } else if (200 <= input && input < 245) {
            var durationWeeks = input - 200 + 7;
            duration = durationWeeks + " weeks";
        } else if (245 <= input) {
            var durationYear = 1;
            duration = "more than " + durationYear + " years";
        } else {
            duration = "unknown";
        }

        return duration;
    }

    decodeManufacturer(input) {
        input = input.toString();
        var highByte = input.substring(0, 2);
        var lowByte = input.substring(2, 4);
        var valHB = parseInt(highByte);
        var valLB = parseInt(lowByte);
        var res = valHB * 256 + valLB;
        var firstLetterCC = res / 32 / 32 + 64;
        var firstLetter = String.fromCharCode(firstLetterCC);
        var secondLetterCC = ((res / 32) % 32) + 64;
        var secondLetter = String.fromCharCode(secondLetterCC);
        var thirdLetterCC = (res % 32) + 64;
        var thirdLetter = String.fromCharCode(thirdLetterCC);
        return firstLetter.concat(secondLetter, thirdLetter);
    }

    decodeDateTypeG(input) {
        var low_byte = input & 0xFF;
        var high_byte = (input >> 8) & 0xFF;
        var day = low_byte & 0x1F;
        var month = high_byte & 0x0F;
        var year = 2000 + (((high_byte >> 4) << 3) | (low_byte >> 5));
        return year + "." + String(month).padStart(2, '0') + "." + String(day).padStart(2, '0');
    }

    decodeLookUpTable(value, table) {
        // Remove the brackets and split the string into key-value pairs
        table = table.slice(1, -1).trim();
        const pairs = table.split(',').map(pair => pair.trim().split('=').map(item => item.trim()));

        // Convert pairs to a dictionary
        const lookupTable = {};
        pairs.forEach(([key, val]) => {
            lookupTable[parseInt(key, 2)] = val;
        });

        // Lookup the value
        if (value in lookupTable) {
            return lookupTable[value];
        } //else {
            // return "undefined value: " + value;
        // }
    }

}


function hexToBin(hex) {
    return hex.split('').map(c => {
        const bin = parseInt(c, 16).toString(2).padStart(4, '0');
        if (bin.length !== 4) {
            throw new Error(`Invalid hex character: ${c}`);
        }
        return bin;
    }).join('');

}

function* bitIterator(binInput) {
  const length = binInput.length;

  for (let i = 0; i < length; i++) {
    const reverseIndex = i - (i % 8) + (7 - (i % 8));
    yield binInput[reverseIndex];
  }
}

function parseDataPoints(binInput, dataPoints) {
    const bitIter = bitIterator(binInput);
    const parsedValues = [];

    for (let dp of dataPoints) {
        let bits = '';
        for (let i = 0; i < dp.size; i++) {
            const bit = bitIter.next().value;
            if (bit === undefined) {
                throw new Error("Not enough bits in input");
            }
            bits = bit+bits;
        }
        const value = dp.parse(bits);
        parsedValues.push({ name: dp.name, value, units: dp.units , group: dp.group});
    }

    return parsedValues;
}

function lora100(hexInput) {
    // Generic wMBus/OMS self-describing record parser
    const bytes = [];
    for (let i = 0; i < hexInput.length; i += 2) {
        bytes.push(parseInt(hexInput.substr(i, 2), 16));
    }

    var pos = 0;
    function toHex(v) { return "0x" + v.toString(16); }

    function getDataLength(difLower) {
        switch (difLower) {
            case 0: return 0;
            case 1: return 1;
            case 2: return 2;
            case 3: return 3;
            case 4: return 4;
            case 5: return 4; // 32-bit real
            case 6: return 6;
            case 7: return 8;
            case 9: return 1; // 2-digit BCD
            case 10: return 2; // 4-digit BCD
            case 11: return 3; // 6-digit BCD
            case 12: return 4; // 8-digit BCD
            case 13: return 0; // variable length (LVAR)
            case 14: return 6; // 12-digit BCD
            default: return 0;
        }
    }

    function readInteger(dataBytes) {
        var val = 0;
        for (var i = 0; i < dataBytes.length; i++) {
            val += dataBytes[i] * Math.pow(256, i);
        }
        // Sign extension based on data size
        var maxBit = Math.pow(256, dataBytes.length);
        if (dataBytes.length > 0 && (dataBytes[dataBytes.length - 1] & 0x80)) {
            val = val - maxBit;
        }
        return val;
    }

    function readIntegerUnsigned(dataBytes) {
        var val = 0;
        for (var i = 0; i < dataBytes.length; i++) {
            val += dataBytes[i] * Math.pow(256, i);
        }
        return val;
    }

    function decodeDateTypeG(val) {
        var low_byte = val & 0xFF;
        var high_byte = (val >> 8) & 0xFF;
        var day = low_byte & 0x1F;
        var month = high_byte & 0x0F;
        var year = 2000 + (((high_byte >> 4) << 3) | (low_byte >> 5));
        return year + "." + String(month).padStart(2, '0') + "." + String(day).padStart(2, '0');
    }

    function getRecordName(primaryVif, vifes, storageNr) {
        var pv = primaryVif & 0x7F;
        var hasReverse = vifes.some(function(v) { return (v & 0x7F) === 0x3C; });

        if (pv >= 0x10 && pv <= 0x17) {
            if (hasReverse) return "ReverseVolume";
            if (storageNr > 0) return "DueDateVolume";
            return "CumulativeVolume";
        }
        if (pv >= 0x38 && pv <= 0x3F) return "ActualFlow";
        if (pv >= 0x58 && pv <= 0x5B) return "ActualFlowTemperature";
        if (pv >= 0x64 && pv <= 0x67) return "ExternalTemperature";
        if (pv === 0x6C) return "LocalDueDate";
        if (pv === 0x6D) return "LocalDueDateTime";
        if (pv === 0x78) return "WmbusMeterUniqueID";
        if (pv === 0x7D) {
            // VIF extension table (0xFD)
            if (vifes.length > 0) {
                var ve = vifes[0] & 0x7F;
                if (ve === 0x74) return "RemainingBatteryLifetime";
                if (ve === 0x17) return "ErrorFlags";
                if (ve === 0x10) return "MeteringPointID";
                if (ve === 0x11) return "OwnershipNumber";
                if (ve === 0x19) return "WMBUSMeterUniqueID";
            }
        }
        return "Unknown_" + toHex(primaryVif);
    }

    function decodeRecord(primaryVif, vifes, dataBytes, storageNr) {
        var pv = primaryVif & 0x7F;

        // Volume (0x10-0x17)
        if (pv >= 0x10 && pv <= 0x17) {
            var scale = Math.pow(10, (pv & 0x07) - 6);
            var raw = readInteger(dataBytes);
            return { Value: parseFloat((raw * scale).toPrecision(10)), Unit: "m³" };
        }

        // Flow (0x38-0x3F)
        if (pv >= 0x38 && pv <= 0x3F) {
            var scale = Math.pow(10, (pv & 0x07) - 6);
            var raw = readInteger(dataBytes);
            return { Value: parseFloat((raw * scale).toPrecision(10)), Unit: "m³/h" };
        }

        // Water temperature (0x58-0x5B)
        if (pv >= 0x58 && pv <= 0x5B) {
            var scale = Math.pow(10, (pv & 0x03) - 3);
            var raw = readInteger(dataBytes);
            return { Value: parseFloat((raw * scale).toPrecision(10)), Unit: "°C" };
        }

        // Ambient/external temperature (0x64-0x67)
        if (pv >= 0x64 && pv <= 0x67) {
            var scale = Math.pow(10, (pv & 0x03) - 3);
            var raw = readInteger(dataBytes);
            return { Value: parseFloat((raw * scale).toPrecision(10)), Unit: "°C" };
        }

        // Date Type G (0x6C)
        if (pv === 0x6C) {
            var raw = dataBytes[0] | (dataBytes[1] << 8);
            return { Value: decodeDateTypeG(raw) };
        }

        // VIF extension (0xFD/0x7D)
        if (pv === 0x7D) {
            if (vifes.length > 0) {
                var ve = vifes[0] & 0x7F;
                // Remaining battery lifetime in days
                if (ve === 0x74) {
                    var raw = readIntegerUnsigned(dataBytes);
                    return { Value: raw, Unit: "days" };
                }
                // Error flags
                if (ve === 0x17) {
                    var flags = {
                        Tampering: !!(dataBytes[0] & 0x01),
                        Water_Leak: !!(dataBytes[0] & 0x02),
                        Water_Burst: !!(dataBytes[0] & 0x04),
                        Vacant_01: !!(dataBytes[0] & 0x08),
                        Air_in_Pipe: !!(dataBytes[0] & 0x10),
                        Empty_Pipe: !!(dataBytes[0] & 0x20),
                        Reverse_Flow: !!(dataBytes[0] & 0x40),
                        No_Usage: !!(dataBytes[0] & 0x80)
                    };
                    if (dataBytes.length > 1) {
                        flags.Vacant_02 = !!(dataBytes[1] & 0x01);
                        flags.Water_Temperature = !!(dataBytes[1] & 0x02);
                        flags.Ambient_Temperature = !!(dataBytes[1] & 0x04);
                        flags.Warning_Error = !!(dataBytes[1] & 0x08);
                        flags.Malfunction = !!(dataBytes[1] & 0x10);
                        flags.USS_attention = !!(dataBytes[1] & 0x20);
                    }
                    if (dataBytes.length > 2) {
                        flags.NFC_ERROR = !!(dataBytes[2] & 0x01);
                        flags.IPC_ERROR = !!(dataBytes[2] & 0x02);
                        flags.EXTERNAL_FLASH_ERROR = !!(dataBytes[2] & 0x04);
                        flags.INTERNAL_FLASH_ERROR = !!(dataBytes[2] & 0x08);
                        flags.RTC_ERROR = !!(dataBytes[2] & 0x10);
                        flags.UNEXPECTED_RESET = !!(dataBytes[2] & 0x20);
                        flags.LORA_DOWNLINK_ERROR = !!(dataBytes[2] & 0x40);
                        flags.LOW_BATTERY = !!(dataBytes[2] & 0x80);
                    }
                    return { Value: flags };
                }
                // LVAR text fields: Ownership number, Metering point ID, WMBUS Meter unique ID
                if (ve === 0x10 || ve === 0x11 || ve === 0x19) {
                    var hex = dataBytes.slice().reverse().map(function(b) { return ('0' + b.toString(16)).slice(-2); }).join('');
                    return { Value: '0x' + hex };
                }
            }
        }

        // Fabrication number / WmbusMeterUniqueID (VIF 0x78)
        if (pv === 0x78) {
            var hex = dataBytes.map(function(b) { return ('0' + b.toString(16)).slice(-2); }).join('');
            return { Value: '0x' + hex };
        }

        // Fallback: return raw integer
        return { Value: readIntegerUnsigned(dataBytes) };
    }

    var records = [];

    // Check CI field - only parse if CI == 0x78
    if (bytes[pos] !== 0x78) {
        return records;
    }
    pos++;

    while (pos < bytes.length) {
        // Read DIF
        var dif = bytes[pos++];
        if (dif === 0x00 || dif === 0x2F) {
            // Idle filler or no-data marker - skip
            continue;
        }
        var dataLenCode = dif & 0x0F;
        var storageNr = (dif & 0x40) >> 6;

        // Skip DIFE(s)
        var tmpDif = dif;
        while ((tmpDif & 0x80) && pos < bytes.length) {
            tmpDif = bytes[pos++];
            storageNr |= (tmpDif & 0x0F) << 1; // additional storage bits
        }

        // Read VIF
        var primaryVif = bytes[pos++];
        var allVifs = [primaryVif];
        var vifes = [];

        // Read VIFE(s) if extension bit set
        var currentVif = primaryVif;
        while ((currentVif & 0x80) && pos < bytes.length) {
            currentVif = bytes[pos++];
            allVifs.push(currentVif);
            vifes.push(currentVif);
        }

        // Read data
        var dataLen = getDataLength(dataLenCode);
        if (dataLenCode === 13 && pos < bytes.length) {
            // LVAR: first byte is length
            dataLen = bytes[pos++];
        }
        var dataBytes = bytes.slice(pos, pos + dataLen);
        pos += dataLen;

        // Decode record
        var name = getRecordName(primaryVif, vifes, storageNr);
        var decoded = decodeRecord(primaryVif, vifes, dataBytes, storageNr);
        var record = { Name: name, DIF: toHex(dif & 0x7F), VIFs: allVifs.map(toHex) };
        record.Value = decoded.Value;
        if (decoded.Unit) record.Unit = decoded.Unit;
        records.push(record);
    }

    return records;
}

function lora101(hexInput) {
    const dataPoints = [
        new DataPoint("volume_raw",0,0,999999999,30,"none","none"),
        new DataPoint("remaining_battery_life_time",0,0,31,5,"semester","none"),
        new DataPoint("unit_and_medium",0,0,3,2,"none","none"),
        new DataPoint("down_link_alarm",2,0,1,1,"none","none"),
        new DataPoint("volume_multiplier",0,0,7,3,"none","none"),
        new DataPoint("meter_serial_number_raw",0,0,99999999,27,"none","none"),
        new DataPoint("water_temperature",0,0,127,7,"°C","none"),
        new DataPoint("malfunction",0,0,1,1,"none","none"),
        new DataPoint("tampering_alarm",0,0,1,1,"none","none"),
        new DataPoint("water_leak_alarm",0,0,1,1,"none","none"),
        new DataPoint("broken_pipe_alarm",0,0,1,1,"none","none"),
        new DataPoint("air_in_pipe_alarm",0,0,1,1,"none","none"),
        new DataPoint("empty_pipe_alarm",0,0,1,1,"none","none"),
        new DataPoint("reverse_flow_alarm",0,0,1,1,"none","none"),
        new DataPoint("no_usage_alarm",0,0,1,1,"none","none"),
        new DataPoint("low_battery_alarm",0,0,1,1,"none","none"),
        new DataPoint("water_temperature_alarm",0,0,1,1,"none","none"),
        new DataPoint("ambient_temperature_alarm",0,0,1,1,"none","none"),
        new DataPoint("com_met_communication_alarm",0,0,1,1,"none","none"),
        new DataPoint("internal_critical_alarm",0,0,1,1,"none","none"),

    ];

    const binInput = hexToBin(hexInput);
    return parseDataPoints(binInput, dataPoints);
}

function lora102(hexInput) {
    const dataPoints = [
        new DataPoint("volume_raw",0,0,999999999,30,"none","none"),
        new DataPoint("remaining_battery_life_time",0,0,31,5,"semester","none"),
        new DataPoint("unit_and_medium",0,0,3,2,"none","none"),
        new DataPoint("down_link_alarm",2,0,1,1,"none","none"),
        new DataPoint("volume_multiplier",0,0,7,3,"none","none"),
        new DataPoint("meter_serial_number_raw",0,0,99999999,27,"none","none"),
        new DataPoint("water_temperature",0,0,127,7,"°C","none"),
        new DataPoint("malfunction",0,0,1,1,"none","none"),
        new DataPoint("tampering_alarm",0,0,1,1,"none","none"),
        new DataPoint("water_leak_alarm",0,0,1,1,"none","none"),
        new DataPoint("broken_pipe_alarm",0,0,1,1,"none","none"),
        new DataPoint("air_in_pipe_alarm",0,0,1,1,"none","none"),
        new DataPoint("empty_pipe_alarm",0,0,1,1,"none","none"),
        new DataPoint("reverse_flow_alarm",0,0,1,1,"none","none"),
        new DataPoint("no_usage_alarm",0,0,1,1,"none","none"),
        new DataPoint("low_battery_alarm",0,0,1,1,"none","none"),
        new DataPoint("water_temperature_alarm",0,0,1,1,"none","none"),
        new DataPoint("ambient_temperature_alarm",0,0,1,1,"none","none"),
        new DataPoint("com_met_communication_alarm",0,0,1,1,"none","none"),
        new DataPoint("internal_critical_alarm",0,0,1,1,"none","none"),
        new DataPoint("due_date_timestamp",0,0,65535,16,"none","#DateTypeG"),

    ];

    const binInput = hexToBin(hexInput);
    return parseDataPoints(binInput, dataPoints);
}

function lora104(hexInput) {
    // Compact control byte is at byte offset 28 (0-indexed):
    // VIF(1)+vol(4)+rev_vol(4)+time_diff(1)+alarms(3)+battery(1)+meter_sn(4)+water_temp(2)+ambient_temp(2)+max_flow(2)+min_flow(2)+max_flow_temp(2) = 28
    const compactControlByte = parseInt(hexInput.substring(56, 58), 16);
    const singleByteDiff = (compactControlByte & 0x80) !== 0;

    if (singleByteDiff) {
        return lora104_24vol(hexInput);
    } else {
        return lora104_12vol(hexInput);
    }
}

function lora104_12vol(hexInput) {
    const dataPoints = [
        new DataPoint("volume_vif",0,0,22,8,"m³","[0x12=10⁻⁴,0x13=10⁻³,0x14=10⁻²,0x15=10⁻¹,0x16=10⁰]"),
        new DataPoint("volume",0,0,4294967295,32,"various","none"),
        new DataPoint("reverse_volume",0,0,4294967295,32,"none","none"),
        new DataPoint("time_diff",0,0,255,8,"none","none"),
        new DataPoint("reserved0",1,0,0,1,"none","none"),
        new DataPoint("tampering_alarm",0,0,1,1,"none","none"),
        new DataPoint("leakage_alarm",0,0,1,1,"none","none"),
        new DataPoint("broken_pipe_alarm",0,0,1,1,"none","none"),
        new DataPoint("air_in_pipe_alarm",0,0,1,1,"none","none"),
        new DataPoint("empty_pipe_alarm",0,0,1,1,"none","none"),
        new DataPoint("back_flow_alarm",0,0,1,1,"none","none"),
        new DataPoint("no_usage_alarm",0,0,1,1,"none","none"),
        new DataPoint("reserved1",1,0,0,1,"none","none"),
        new DataPoint("water_temperature_alarm",0,0,1,1,"none","none"),
        new DataPoint("ambient_temperature_alarm",0,0,1,1,"none","none"),
        new DataPoint("reserved2",1,0,0,1,"none","none"),
        new DataPoint("malfunction_alarm",0,0,1,1,"none","none"),
        new DataPoint("warning_alarm",0,0,1,1,"none","none"),
        new DataPoint("reserved3",1,0,0,2,"none","none"),
        new DataPoint("nfc_warning_alarm",0,0,1,1,"none","none"),
        new DataPoint("ipc_alarm",0,0,1,1,"none","none"),
        new DataPoint("external_flash_alarm",0,0,1,1,"none","none"),
        new DataPoint("config_alarm",0,0,1,1,"none","none"),
        new DataPoint("rtc_alarm",0,0,1,1,"none","none"),
        new DataPoint("unexpected_reset_alarm",0,0,1,1,"none","none"),
        new DataPoint("radio_down_link_alarm",0,0,1,1,"none","none"),
        new DataPoint("battery_low_alarm",0,0,1,1,"none","none"),
        new DataPoint("battery_lifetime",0,0,63,6,"semester","none"),
        new DataPoint("configuration_change_alarm",0,0,1,1,"none","none"),
        new DataPoint("power_saving_scheme_alarm",0,0,1,1,"none","none"),
        new DataPoint("meter_serial_number",0,0,4294967295,32,"none","none"),
        new DataPoint("water_temperature",0,0,65535,16,"0.01°C","none"),
        new DataPoint("ambient_temperature",0,0,65535,16,"0.01°C","none"),
        new DataPoint("max_flow_previous_day",0,0,65535,16,"liter_per_hour","none"),
        new DataPoint("min_flow_previous_day",0,0,65535,16,"liter_per_hour","none"),
        new DataPoint("max_flow_temperature_previous_day",0,0,65535,16,"celsius","none"),
        new DataPoint("compact_control_scaler",0,0,3,2,"none","[0 = 10⁻³, 1 = 10⁻², 2 = 10⁻¹, 3 = 1]"),
        new DataPoint("compact_control_period",0,0,7,3,"none","[0 = 15min, 1 = hourly, 2 = daily, 3 = monthly]"),
        new DataPoint("compact_control_unused",1,0,3,2,"none","none"),
        new DataPoint("single_byte_volume_diff",0,0,0,1,"none","none"),
        new DataPoint("volume_2_difference",0,0,65535,16,"various","none"),
        new DataPoint("volume_3_difference",0,0,65535,16,"various","none"),
        new DataPoint("volume_4_difference",0,0,65535,16,"various","none"),
        new DataPoint("volume_5_difference",0,0,65535,16,"various","none"),
        new DataPoint("volume_6_difference",0,0,65535,16,"various","none"),
        new DataPoint("volume_7_difference",0,0,65535,16,"various","none"),
        new DataPoint("volume_8_difference",0,0,65535,16,"various","none"),
        new DataPoint("volume_9_difference",0,0,65535,16,"various","none"),
        new DataPoint("volume_10_difference",0,0,65535,16,"various","none"),
        new DataPoint("volume_11_difference",0,0,65535,16,"various","none"),
        new DataPoint("volume_12_difference",0,0,65535,16,"various","none"),
    ];

    const binInput = hexToBin(hexInput);
    return parseDataPoints(binInput, dataPoints);
}

function lora104_24vol(hexInput) {
    const dataPoints = [
        new DataPoint("volume_vif",0,0,22,8,"m³","[0x12=10⁻⁴,0x13=10⁻³,0x14=10⁻²,0x15=10⁻¹,0x16=10⁰]"),
        new DataPoint("volume",0,0,4294967295,32,"various","none"),
        new DataPoint("reverse_volume",0,0,4294967295,32,"none","none"),
        new DataPoint("time_diff",0,0,255,8,"none","none"),
        new DataPoint("reserved0",1,0,0,1,"none","none"),
        new DataPoint("tampering_alarm",0,0,1,1,"none","none"),
        new DataPoint("leakage_alarm",0,0,1,1,"none","none"),
        new DataPoint("broken_pipe_alarm",0,0,1,1,"none","none"),
        new DataPoint("air_in_pipe_alarm",0,0,1,1,"none","none"),
        new DataPoint("empty_pipe_alarm",0,0,1,1,"none","none"),
        new DataPoint("back_flow_alarm",0,0,1,1,"none","none"),
        new DataPoint("no_usage_alarm",0,0,1,1,"none","none"),
        new DataPoint("reserved1",1,0,0,1,"none","none"),
        new DataPoint("water_temperature_alarm",0,0,1,1,"none","none"),
        new DataPoint("ambient_temperature_alarm",0,0,1,1,"none","none"),
        new DataPoint("reserved2",1,0,0,1,"none","none"),
        new DataPoint("malfunction_alarm",0,0,1,1,"none","none"),
        new DataPoint("warning_alarm",0,0,1,1,"none","none"),
        new DataPoint("reserved3",1,0,0,2,"none","none"),
        new DataPoint("nfc_warning_alarm",0,0,1,1,"none","none"),
        new DataPoint("ipc_alarm",0,0,1,1,"none","none"),
        new DataPoint("external_flash_alarm",0,0,1,1,"none","none"),
        new DataPoint("config_alarm",0,0,1,1,"none","none"),
        new DataPoint("rtc_alarm",0,0,1,1,"none","none"),
        new DataPoint("unexpected_reset_alarm",0,0,1,1,"none","none"),
        new DataPoint("radio_down_link_alarm",0,0,1,1,"none","none"),
        new DataPoint("battery_low_alarm",0,0,1,1,"none","none"),
        new DataPoint("battery_lifetime",0,0,63,6,"semester","none"),
        new DataPoint("configuration_change_alarm",0,0,1,1,"none","none"),
        new DataPoint("power_saving_scheme_alarm",0,0,1,1,"none","none"),
        new DataPoint("meter_serial_number",0,0,4294967295,32,"none","none"),
        new DataPoint("water_temperature",0,0,65535,16,"0.01°C","none"),
        new DataPoint("volume_2_difference",0,0,255,8,"various","none"),
        new DataPoint("ambient_temperature_coarse",0,0,255,8,"°C","none"),
        new DataPoint("max_flow_previous_day",0,0,65535,16,"liter_per_hour","none"),
        new DataPoint("min_flow_previous_day",0,0,65535,16,"liter_per_hour","none"),
        new DataPoint("max_flow_temperature_previous_day",0,0,65535,16,"celsius","none"),
        new DataPoint("compact_control_scaler",0,0,3,2,"none","[0 = 10⁻³, 1 = 10⁻², 2 = 10⁻¹, 3 = 1]"),
        new DataPoint("compact_control_period",0,0,7,3,"none","[0 = 15min, 1 = hourly, 2 = daily, 3 = monthly]"),
        new DataPoint("compact_control_unused",1,0,3,2,"none","none"),
        new DataPoint("single_byte_volume_diff",0,0,1,1,"none","none"),
        new DataPoint("volume_3_difference",0,0,255,8,"various","none"),
        new DataPoint("volume_4_difference",0,0,255,8,"various","none"),
        new DataPoint("volume_5_difference",0,0,255,8,"various","none"),
        new DataPoint("volume_6_difference",0,0,255,8,"various","none"),
        new DataPoint("volume_7_difference",0,0,255,8,"various","none"),
        new DataPoint("volume_8_difference",0,0,255,8,"various","none"),
        new DataPoint("volume_9_difference",0,0,255,8,"various","none"),
        new DataPoint("volume_10_difference",0,0,255,8,"various","none"),
        new DataPoint("volume_11_difference",0,0,255,8,"various","none"),
        new DataPoint("volume_12_difference",0,0,255,8,"various","none"),
        new DataPoint("volume_13_difference",0,0,255,8,"various","none"),
        new DataPoint("volume_14_difference",0,0,255,8,"various","none"),
        new DataPoint("volume_15_difference",0,0,255,8,"various","none"),
        new DataPoint("volume_16_difference",0,0,255,8,"various","none"),
        new DataPoint("volume_17_difference",0,0,255,8,"various","none"),
        new DataPoint("volume_18_difference",0,0,255,8,"various","none"),
        new DataPoint("volume_19_difference",0,0,255,8,"various","none"),
        new DataPoint("volume_20_difference",0,0,255,8,"various","none"),
        new DataPoint("volume_21_difference",0,0,255,8,"various","none"),
        new DataPoint("volume_22_difference",0,0,255,8,"various","none"),
        new DataPoint("volume_23_difference",0,0,255,8,"various","none"),
        new DataPoint("volume_24_difference",0,0,255,8,"various","none"),
    ];

    const binInput = hexToBin(hexInput);
    return parseDataPoints(binInput, dataPoints);
}

function bytesToHex(byteArray) {
    let hexString = '';
    for (let i = 0; i < byteArray.length; i++) {
        const hex = byteArray[i].toString(16);
        hexString += (hex.length === 1 ? '0' : '') + hex;
    }
    return hexString;
}

function decodeUplink(input) {
    var actual_len  = 0;
    var hexString = "";

    if(input.bytes instanceof Uint8Array || Array.isArray(input.bytes)) {
        hexString = bytesToHex(input.bytes);
        actual_len = hexString.length*4;
    } else {
        hexString = input.bytes;
        actual_len = hexString.length*4;
    }

    var parsedValues = [];
    switch( input.fPort ){

        case 100:
            // OMS returns grouped records directly (variable length)
            return { data: lora100(hexString) };

        case 101:
            if (88 !== actual_len) {
                throw new Error(`Invalid input length for protocol 101: expected 88 bits, got ${actual_len} bits for the payload ${hexString}`);
            }
            parsedValues = lora101(hexString);
            break;

        case 102:
            if (104 !== actual_len) {
                throw new Error(`Invalid input length for protocol 102: expected 104 bits, got ${actual_len} bits for the payload ${hexString}`);
            }
            parsedValues = lora102(hexString);
            break;

        case 104:
            if (408 !== actual_len) {
                throw new Error(`Invalid input length for protocol 104: expected 408 bits, got ${actual_len} bits for the payload ${hexString}`);
            }
            parsedValues = lora104(hexString);
            break;

        default:
            throw new Error(`Unknown protocol: ${input.fPort}`);
    }

    let data ={};
    parsedValues.forEach(({ name, value, units, group}) => {
        if (value === undefined) return;
        var entry = {value};
        if (units !== "none") entry.units = units;
        if (group !== 0) entry.group = group;
        data[name] = entry;
    });

    // Post-processing for short/privacy frames: compute human-readable volume and meter SN
    if (input.fPort === 101 || input.fPort === 102) {
        // Meter serial number: reverse BCD byte order
        const snRaw = data.meter_serial_number_raw.value;
        const snStr = snRaw.toString().padStart(8, '0');
        const snReversed = snStr.match(/.{2}/g).reverse().join('');
        data.meter_serial_number = {value: snReversed};

        // Volume: apply multiplier and unit
        const volRaw = data.volume_raw.value;
        const multiplier = data.volume_multiplier.value;
        const unitMedium = data.unit_and_medium.value;
        const scale = Math.pow(10, -3 + multiplier);
        const volume = parseFloat((volRaw * scale).toPrecision(10));
        const unitStr = (unitMedium <= 1) ? "m³" : "gal";
        data.volume = {value: volume, units: unitStr};
    }

    return {data};
}
