/**
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Primary VIF table according to Table 10 in 13757-3:2018
var PriVifTable = {
    0x10: { type: "Volume", unit: "m3", resolution: 1E-6, ConversionType: "B" },
    0x11: { type: "Volume", unit: "m3", resolution: 1E-5, ConversionType: "B" },
    0x12: { type: "Volume", unit: "m3", resolution: 1E-4, ConversionType: "B" },
    0x13: { type: "Volume", unit: "m3", resolution: 1E-3, ConversionType: "B" },
    0x14: { type: "Volume", unit: "m3", resolution: 1E-2, ConversionType: "B" },
    0x15: { type: "Volume", unit: "m3", resolution: 1E-1, ConversionType: "B" },
    0x16: { type: "Volume", unit: "m3", resolution: 1E-0, ConversionType: "B" },
    0x17: { type: "Volume", unit: "m3", resolution: 1E+1, ConversionType: "B" },
    0x38: { type: "Volume flow", unit: "m3/h", resolution: 1E-6, ConversionType: "B" },
    0x39: { type: "Volume flow", unit: "m3/h", resolution: 1E-5, ConversionType: "B" },
    0x3A: { type: "Volume flow", unit: "m3/h", resolution: 1E-4, ConversionType: "B" },
    0x3B: { type: "Volume flow", unit: "m3/h", resolution: 1E-3, ConversionType: "B" },
    0x3C: { type: "Volume flow", unit: "m3/h", resolution: 1E-2, ConversionType: "B" },
    0x3D: { type: "Volume flow", unit: "m3/h", resolution: 1E-1, ConversionType: "B" },
    0x3E: { type: "Volume flow", unit: "m3/h", resolution: 1E-0, ConversionType: "B" },
    0x3F: { type: "Volume flow", unit: "m3/h", resolution: 1E+1, ConversionType: "B" },
    0x58: { type: "Flow temperature", unit: "C", resolution: 1E-3, ConversionType: "B" },
    0x59: { type: "Flow temperature", unit: "C", resolution: 1E-2, ConversionType: "B" },
    0x5A: { type: "Flow temperature", unit: "C", resolution: 1E-1, ConversionType: "B" },
    0x5B: { type: "Flow temperature", unit: "C", resolution: 1E-0, ConversionType: "B" },
    0x64: { type: "External temperature", unit: "C", resolution: 1E-3, ConversionType: "B" },
    0x65: { type: "External temperature", unit: "C", resolution: 1E-2, ConversionType: "B" },
    0x66: { type: "External temperature", unit: "C", resolution: 1E-1, ConversionType: "B" },
    0x67: { type: "External temperature", unit: "C", resolution: 1E-0, ConversionType: "B" },
    0x6C: { type: "Date/time", unit: "NA", resolution: 1, ConversionType: "G" },
    0x6D: { type: "Date/time", unit: "NA", resolution: 1, ConversionType: "F/J/I/M" },
};

// Manufacture specific VIFE
var ManuVifeTable = {
    0x25: { type: "Infocode", unit: "NA", resolution: 1, ConversionType: "D" },
    0x1C: { type: "ALD last day", unit: "NA", resolution: 1, ConversionType: "C" },
    0x16: { type: "Module type/config number", unit: "NA", resolution: 1, ConversionType: "C" },
    0x1B: { type: "ALD", unit: "NA", resolution: 1, ConversionType: "C" },
};

// Orthogonal VIFE table according to Table 15 in 13757-3:2018
var OrthoVifeTable = {
    0x13: "Inverse Compact Profile",
    0x3C: "Reverse",
};

var InfocodeTable = {
    0: "Dry",
    1: "Reverse",
    2: "Leak",
    3: "Burst",
    4: "Tamper",
    5: "Low Battery",
    6: "Low Ambient Temperature",
    7: "High Ambient Temperature",
};

/**
 * Parse Value Information Block (VIB)
 * @param VIBArray - Array containing the VIB
 * @returns - The VIB object
 */
function parseVIB(VIBArray) {
    var VIBObj = {};
    if (VIBArray[0] == 0xFF) {
        if (VIBArray[1] in ManuVifeTable) {
            var tempObj = ManuVifeTable[VIBArray[1]];
            VIBObj = { type: tempObj.type, unit: tempObj.unit,
                resolution: tempObj.resolution, ConversionType: tempObj.ConversionType }; // Copy instead of reference
            VIBObj.OrthoVife = "NA";
        } else {
            return null;
        }
    } else if ((VIBArray[0] & 0x7F) in PriVifTable) {
        var tempObj = PriVifTable[VIBArray[0] & 0x7F];
        VIBObj = { type: tempObj.type, unit: tempObj.unit,
            resolution: tempObj.resolution, ConversionType: tempObj.ConversionType }; // Copy instead of reference
        if ((VIBArray[0] & 0x80) != 0) {
            if (VIBArray[1] in OrthoVifeTable) {
                VIBObj.OrthoVife = OrthoVifeTable[VIBArray[1]];
            } else {
                return null;
            }
        } else {
            VIBObj.OrthoVife = "NA";
        }
    } else {
        // Unsupported VIF
        return null;
    }
    VIBObj.isProfileData = false;
    if (VIBObj.OrthoVife == "Inverse Compact Profile") {
        VIBObj.isProfileData = true;
    }
    return VIBObj;
}

/**
 * Reads an unsigned little endian integer from a buffer.
 * @param buffer - The input buffer.
 * @param offset - The byte index to start reading from.
 * @param byteLength - The number of bytes to read.
 * @returns - The unsigned integer value.
 */
 function readUIntLE(buffer, offset, byteLength) {
    var value = 0;
    for (var i = 0; i < byteLength; i++) {
        value |= buffer[offset + i] << (8 * i);
    }
    return value >>> 0; // Ensure it's treated as an unsigned 32-bit integer
}

/**
 * Reads a signed little-endian integer using two's complement representation.
 * @param buffer - The input buffer.
 * @param offset - The byte index to start reading from.
 * @param byteLength - The number of bytes to read.
 * @returns - The signed integer value.
 */
function readIntLE(buffer, offset, byteLength) {
    var value = readUIntLE(buffer, offset, byteLength);
    var maxVal = 1 << (8 * byteLength - 1); // Two's complement sign bit position

    return (value & maxVal) ? value - (1 << (8 * byteLength)) : value;
}

/**
 * Mbus Type A - BCD to a number as described in EN13757-2018 Annex A.
 * @param buffer - Buffer input containing the BCD in little endian.
 * @param idx - Index at which the BCD starts.
 * @param size - Size in bytes of the BCD.
 * @returns - The converted number or undefined if invalid.
 */
function TypeA(buffer, idx, size) {
    var result = 0;
    var multiplier = 1;
    for (var j = idx; j < idx + size; j++) {
        var lsb = buffer[j] & 0xF;
        var msb = (buffer[j] >> 4) & 0xF;
        if (lsb > 9 || msb > 9) {
            // Invalid value
            return undefined;
        }
        result += lsb * multiplier;
        result += msb * multiplier * 10;
        multiplier *= 100;
    }
    return result;
}

/**
 * Mbus Type B - Binary signed integer as described in EN13757-2018 Annex A.
 * @param buffer - Buffer input containing value to convert in little endian.
 * @param idx - Index at which the value starts.
 * @param size - Size in bytes.
 * @returns - The converted number or undefined if invalid.
 */
function TypeB(buffer, idx, size) {
    var invalidValues = { 1: -0x80, 2: -0x8000, 3: -0x800000, 4: -0x80000000, 6: -0x800000000000 };
    var result = readIntLE(buffer, idx, size);
    if (result == invalidValues[size]) {
        result = undefined;
    }
    return result;
}

/**
 * Mbus Type C - Binary unsigned integer as described in EN13757-2018 Annex A.
 * @param buffer - Buffer input containing value to convert in little endian.
 * @param idx - Index at which the value starts.
 * @param size - Size in bytes.
 * @returns - The converted number or undefined if invalid.
 */
function TypeC(buffer, idx, size) {
    var invalidValues = { 1: 0xFF, 2: 0xFFFF, 3: 0xFFFFFF, 4: 0xFFFFFFFF, 6: 0xFFFFFFFFFFFF };
    var result = readUIntLE(buffer, idx, size);
    if (result == invalidValues[size]) {
        result = undefined;
    }
    return result;
}

/**
 * Mbus Type D - Boolean array as described in EN13757-2018 Annex A.
 * @param buffer - Buffer input containing value to convert in little endian.
 * @param idx - Index at which the value starts.
 * @param size - Size in bytes.
 * @returns - The converted number.
 */
function TypeD(buffer, idx, size) {
    return readUIntLE(buffer, idx, size);
}

/**
 * Mbus Type F - Date and Time (CP32) as described in EN13757-2018 Annex A.
 * @param buffer - Buffer input containing value to convert in little endian.
 * @param idx - Index at which the value starts.
 * @param size - Size in bytes.
 * @returns - Timestamp.
 */
function TypeF(buffer, idx, size) {
    var data = readUIntLE(buffer, idx, size);
    if ((data & 0x00000080) != 0) {
        return undefined;
    }
    var minutes = data & 0x0000003f;
    var hours = (data >> 8) & 0x0000001f;
    var days = (data >> 16) & 0x0000001f;
    var months = (data >> 24) & 0x0000000f;
    var years = (data >> 21) & 0x00000007;
    years += ((data >> 28) & 0x0000000f) << 3;
    var hYears = (data >> 13) & 0x00000003;
    years += 1900 + (hYears * 100);
    return new Date(Date.UTC(years, months - 1, days, hours, minutes));
}

/**
 * Mbus Type G - Date as described in EN13757-2018 Annex A.
 * @param buffer - Buffer input containing value to convert in little endian.
 * @param idx - Index at which the value starts.
 * @param size - Size in bytes.
 * @returns - Timestamp.
 */
function TypeG(buffer, idx, size) {
    var data = readUIntLE(buffer, idx, size);
    if (data == 0xFFFF) {
        return undefined;
    }
    var days = (data >> 0) & 0x001f;
    var months = (data >> 8) & 0x000f;
    var years = 2000 + ((data >> 5) & 0x0007);
    years += ((data >> 12) & 0x000f) << 3;
    return new Date(Date.UTC(years, months - 1, days));
}

/**
 * Mbus Type I - Date and Time (CP48) as described in EN13757-2018 Annex A.
 * @param buffer - Buffer input containing value to convert in little endian.
 * @param idx - Index at which the value starts.
 * @param size - Size in bytes.
 * @returns - Timestamp.
 */
 function TypeI(buffer, idx, size) {
    if ((buffer[idx + 1] & 0x80) != 0) {
        return undefined;
    }
    var seconds = buffer[idx] & 0x3f;
    var minutes = buffer[idx + 1] & 0x3f;
    var hours = buffer[idx + 2] & 0x1f;
    var days = buffer[idx + 3] & 0x1f;
    var months = buffer[idx + 4] & 0xf;
    var years = (buffer[idx + 3] >> 5) & 0x7;
    years += ((buffer[idx + 4] >> 4) & 0xf) << 3;
    years += 2000;
    return new Date(Date.UTC(years, months - 1, days, hours, minutes, seconds));
}

/**
 * Inverse Compact Profile - Parsing of Inverse Compact Profile as described in EN13757-2018 Annex F.
 * @param buffer - The input buffer.
 * @param idx - The index at which Inverse Compact Profile header starts (byte after LVAR).
 * @param size - The size of the inverse compact profile (equal to LVAR).
 * @returns - An object containing the profile data.
 */
function InverseCompactProfile(buffer, idx, size) {
    var result = {};
    var spacingControl = buffer[idx];
    idx++;
    result.spacingValue = buffer[idx];
    idx++;
    var elementSize = spacingControl & 0x0F;
    result.spacingUnit = (spacingControl >> 4) & 0x03;
    result.incMode = (spacingControl >> 6) & 0x03;
    result.profileValues = [];
    if (elementSize < 1 || elementSize > 4 || result.incMode == 0) {
        return null;
    }
    for (var k = 0; k < size - 2; k += elementSize) {
        if (result.incMode == 0x3) { // Signed difference - TypeB
            result.profileValues.push(TypeB(buffer, idx, elementSize));
        } else { // Unsigned increments or decrements - TypeC
            result.profileValues.push(TypeC(buffer, idx, elementSize));
        }
        idx += elementSize;
    }
    return result;
}

/**
 * GetNextTimestamp - Calculate next timestamp for delta values based on spacing unit/value as described in EN13757-2018 Annex F.
 * @param timestamp - The timestamp to operate on.
 * @param spacingUnit - The spacing unit as described in EN13757-2018 Annex F.
 * @param spacingValue - The spacing value as described in EN13757-2018 Annex F.
 * @returns - The status of the operation.
 */
function getNextTimestamp(timestamp, spacingUnit, spacingValue) {
    if (spacingValue > 0 && spacingValue < 251) {
        if (spacingUnit == 0) { // Seconds
            timestamp.setUTCSeconds(timestamp.getUTCSeconds() - spacingValue);
        } else if (spacingUnit == 1) { // Minutes
            timestamp.setUTCMinutes(timestamp.getUTCMinutes() - spacingValue);
        } else if (spacingUnit == 2) { // Hours
            timestamp.setUTCHours(timestamp.getUTCHours() - spacingValue);
        } else if (spacingUnit == 3) { // Days/Months
            timestamp.setUTCDate(timestamp.getUTCDate() - spacingValue);
        }
    } else if (spacingValue == 254 && spacingUnit == 3) {
        timestamp.setUTCMonth(timestamp.getUTCMonth() - 1);
    } else if (spacingValue == 254 && spacingUnit == 2) {
        timestamp.setUTCMonth(timestamp.getUTCMonth() - 3);
    } else if (spacingValue == 254 && spacingUnit == 1) {
        timestamp.setUTCMonth(timestamp.getUTCMonth() - 6);
    } else {
        return false;
    }
    return true;
}

/**
 * Normalize a number based on the given resolution.
 * This function multiplies the number by the resolution and rounds it to avoid floating-point precision issues.
 * @param number - The number to normalize.
 * @param resolution - The resolution to use for normalization.
 * @returns - The normalized number.
 */
function normalize(number, resolution) {
    return Math.round(number * resolution * 1e10) / 1e10;
}

/**
 * Decode uplink
 * @param {Object} input - An object provided by the IoT Flow framework
 * @param {number[]} input.bytes - Array of bytes represented as numbers as it has been sent from the device
 * @param {number} input.fPort - The Port Field on which the uplink has been sent
 * @param {Date} input.recvTime - The uplink message time recorded by the LoRaWAN network server
 * @returns {DecodedUplink} - The decoded object
 */
function decodeUplink(input) {
    var result = {
        data: {},
        errors: [],
        warnings: []
    };
    var i = 0;
    var configfield = 0;
    var raw = input.bytes;

    ////////////////// TPL according to EN 13757-7 //////////////////
    if (raw.length < 1) {
        result.errors.push("Invalid uplink payload: Could not retrieve CI field");
        return result;
    }
    var CI = raw[i];
    i++;
    if (CI == 0x7A) { // Short data header
        if (raw.length < i + 4) {
            result.errors.push("Invalid uplink payload: Could not retrieve TPL layer");
            return result;
        }
        i += 2; // ACC, STS
        configfield = raw[i] | (raw[i + 1] << 8);
        i += 2;
    } else if (CI == 0x72) { // Long data header
        if (raw.length < i + 12) {
            result.errors.push("Invalid uplink payload: Could not retrieve TPL layer");
            return result;
        }
        i += 10; // IdentNo, Manu, Ver, DevType, ACC, STS
        configfield = raw[i] | (raw[i + 1] << 8);
        i += 2;
    } else if (CI == 0x78) { // No data header
        // Do nothing
    } else { // Unsupported header
        result.errors.push("Invalid uplink payload: Invalid CI in TPL layer");
        return result;
    }
    if ((configfield & 0x1F00) != 0x0) { // Security mode different from 0
        result.errors.push("Invalid uplink payload: MBus TPL encryption is not supported");
        return result;
    }

    ////////////////// APL according to EN 13757-3 //////////////////
    var temp;
    var mbusRecords = [];
    while (i < raw.length) { // Check for more records
        var record = {
            dib: {},
            vib: {},
            data: {},
            profileData: {},
        };

        temp = raw[i];
        i++;
        if (temp == 0x2F) {
            // Skip Filler bytes
        } else if (temp == 0x0F || temp == 0x1F || temp == 0x7F) {
            // Unsupported special DIF functions
            result.errors.push("Invalid uplink payload: Unsupported special DIF function");
            return result;
        } else { // No special function - continue
            // DIB
            record.dib.datafield = temp & 0xF;
            record.dib.functionfield = (temp & 0x30) >> 4;
            record.dib.storagenumber = (temp & 0x40) >> 6;
            var snBitShift = 1;
            while ((temp & 0x80) != 0 && i < raw.length) { // Extension
                temp = raw[i];
                i++;
                record.dib.storagenumber += ((temp & 0xF) << snBitShift);
                snBitShift += 4;
            }
            // VIB
            temp = raw[i];
            i++;
            var vibBytes = [temp];
            while ((temp & 0x80) != 0 && i < raw.length) { // Extension
                temp = raw[i];
                i++;
                vibBytes.push(temp);
            }
            // Parse VIF code
            record.vib = parseVIB(vibBytes);
            if (record.vib == null) {
                // Unsupported special VIB functions
                result.errors.push("Invalid uplink payload: Unsupported VIB");
                return result;
            }
            // Data
            var sizeByte = 0;
            var bcd = false;
            var lvar = false;
            switch (record.dib.datafield) {
                case 0:
                case 0x8:
                    // No data
                    sizeByte = 0;
                    break;
                case 0x9:
                    bcd = true;
                case 0x1:
                    sizeByte = 1;
                    break;
                case 0xA:
                    bcd = true;
                case 0x2:
                    sizeByte = 2;
                    break;
                case 0xB:
                    bcd = true;
                case 0x3:
                    sizeByte = 3;
                    break;
                case 0xC:
                    bcd = true;
                case 0x4:
                case 0x5:
                    sizeByte = 4;
                    break;
                case 0xE:
                    bcd = true;
                case 0x6:
                    sizeByte = 6;
                    break;
                case 0x7:
                    sizeByte = 8;
                    break;
                case 0xD:
                    sizeByte = 1; // Lvar # bytes
                    lvar = true;
                    break;
            }
            if (raw.length < i + sizeByte || sizeByte > 6) {
                result.errors.push("Invalid uplink payload: Not enough bytes for datafield or datafield is larger than 6 bytes");
                return result;
            }
            if (!lvar) {
                if (bcd) {
                    record.data = TypeA(raw, i, sizeByte);
                } else {
                    if (record.vib.ConversionType == "C") {
                        record.data = TypeC(raw, i, sizeByte);
                    } else if (record.vib.ConversionType == "B") {
                        record.data = TypeB(raw, i, sizeByte);
                    } else if (record.vib.ConversionType == "D") {
                        record.data = TypeD(raw, i, sizeByte);
                    } else if (record.vib.ConversionType == "G") {
                        record.data = TypeG(raw, i, sizeByte);
                    } else if (record.vib.ConversionType == "F/J/I/M") {
                        if (sizeByte == 4) {
                            record.data = TypeF(raw, i, sizeByte);
                        } else if (sizeByte == 6) {
                            record.data = TypeI(raw, i, sizeByte);
                        }
                    }
                }
                i += sizeByte;
            } else { // Lvar
                var nbBytes = raw[i];
                i++;
                if (raw.length < i + nbBytes || nbBytes < 3) {
                    result.errors.push("Invalid uplink payload: Not enough bytes for LVAR");
                    return result;
                }
                if (!record.vib.isProfileData) {
                    result.errors.push("Invalid uplink payload: LVAR that is not Inverse Compact Profile is not supported");
                    return result;
                }
                record.profileData = InverseCompactProfile(raw, i, nbBytes);
                i += nbBytes;
                if (record.profileData == null) {
                    result.errors.push("Invalid uplink payload: Could not parse Inverse Compact Profile");
                    return result;
                }
            }
            mbusRecords.push(record);
        }
    }

    // Append functionfield and orthogonal VIFE to type
    for (var l = 0; l < mbusRecords.length; l++) {
        var functionFieldText = "";
        if (mbusRecords[l].vib.OrthoVife != "NA" && mbusRecords[l].vib.OrthoVife != "Inverse Compact Profile") {
            // Append orthogonal VIFE in beginning of type, e.g., "Reverse "flow.
            mbusRecords[l].vib.type = mbusRecords[l].vib.OrthoVife + " " + mbusRecords[l].vib.type;
        }
        switch (mbusRecords[l].dib.functionfield) {
            case 0x0:
                functionFieldText = ""; // Instantaneous value is left untouched
                break;
            case 0x1:
                functionFieldText = "Max "; // Instantaneous value is left untouched
                break;
            case 0x2:
                functionFieldText = "Min "; // Instantaneous value is left untouched
                break;
            case 0x3:
                functionFieldText = "Error state "; // Instantaneous value is left untouched
                break;
        }
        // Append functionfield in beginning of type, e.g., "Max "flow.
        mbusRecords[l].vib.type = functionFieldText + mbusRecords[l].vib.type;
    }

    // Retrieve timestamps
    var timestamps = {};
    for (var k = 0; k < mbusRecords.length; k++) {
        if (mbusRecords[k].vib.type == "Date/time") {
            if (mbusRecords[k].data !== undefined) {
                timestamps[mbusRecords[k].dib.storagenumber] = mbusRecords[k].data;
            } else {
                result.warnings.push("Invalid value among timestamps");
            }
        }
    }

    // Generate the output data
    result.data.values = [];
    for (var p = 0; p < mbusRecords.length; p++) {
        var type;
        var value = null;
        var unit;
        var timestamp = null;

        var currentRecord = mbusRecords[p];
        // Add records to values array
        if (currentRecord.vib.type == "Date/time") { // Skip timestamps as they are mapped directly onto records
            // Skip
        } else if (currentRecord.vib.type.includes("Infocode") && currentRecord.data !== undefined) { // Special infocode handling
            for (var j = 0; j < Object.keys(InfocodeTable).length; j++) {
                type = InfocodeTable[j];
                value = (currentRecord.data & (1 << j)) != 0;
                unit = currentRecord.vib.unit;
                if (currentRecord.dib.storagenumber in timestamps) {
                    if (timestamps[currentRecord.dib.storagenumber] instanceof Date) {
                        timestamp = timestamps[currentRecord.dib.storagenumber].toISOString().replace("Z","");
                    }
                }
                result.data.values.push({ Type: type, Value: value, Unit: unit, Timestamp: timestamp });
            }
        } else if (!currentRecord.vib.isProfileData) { // Regular values
            type = currentRecord.vib.type;
            unit = currentRecord.vib.unit;
            // If invalid ALD
            if (type === "ALD last day" && currentRecord.data == 4095) {
                currentRecord.data = undefined;
            }
            // Normalize and add data if it is not undefined
            if (currentRecord.data !== undefined) {
                value = normalize(currentRecord.data, currentRecord.vib.resolution);
            } else {
                unit = "Invalid";
                result.warnings.push("Invalid value among data");
            }
            // Add timestamp
            if (currentRecord.dib.storagenumber in timestamps) {
                if (timestamps[currentRecord.dib.storagenumber] instanceof Date) {
                    timestamp = timestamps[currentRecord.dib.storagenumber].toISOString().replace("Z","");
                }
            }
            result.data.values.push({ Type: type, Value: value, Unit: unit, Timestamp: timestamp });
            if (type === "Volume") { // Special handling for latest volume
                result.data.latestVolume = value;
            }
        } else { // Profile values
            type = currentRecord.vib.type;
            unit = currentRecord.vib.unit;
            // Find base value where storage number and vib type, unit and resolution fits
            var baserecord = mbusRecords.find(item => item.vib.type === type && item.vib.unit === unit && item.dib.storagenumber === currentRecord.dib.storagenumber &&
                item.vib.resolution === currentRecord.vib.resolution && item.vib.isProfileData !== currentRecord.vib.isProfileData);
            if (baserecord === undefined || baserecord.data === undefined) {
                result.errors.push("Invalid uplink payload: Could not find base value for profile data");
                return result;
            }
            var tempVal = baserecord.data;
            // Find base time
            if (currentRecord.dib.storagenumber in timestamps) {
                timestamp = timestamps[currentRecord.dib.storagenumber];
            } else {
                result.errors.push("Invalid uplink payload: Could not find base time for profile data");
                return result;
            }
            var ts = new Date(timestamp.getTime()); // Clone timestamp
            // Loop through delta values
            for (var m = 0; m < currentRecord.profileData.profileValues.length; m++) {
                var deltavalue = currentRecord.profileData.profileValues[m];
                var status = getNextTimestamp(ts, currentRecord.profileData.spacingUnit, currentRecord.profileData.spacingValue);
                if (deltavalue === undefined || status == false || isNaN(ts)) {
                    result.warnings.push("Invalid value among profile values or timestamps for profile values");
                    break;
                }
                // Value
                if (currentRecord.profileData.incMode == 2) {
                    tempVal += deltavalue;
                } else {
                    tempVal -= deltavalue;
                }
                value = normalize(tempVal, currentRecord.vib.resolution);
                // Timestamp
                timestamp = ts.toISOString().replace("Z","");
                result.data.values.push({ Type: type, Value: value, Unit: unit, Timestamp: timestamp });
            }
        }
    }
    return result;
}
