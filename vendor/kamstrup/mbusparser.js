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
    0x00: { type: "Energy", unit: "Wh", resolution: 1E-3, ConversionType: "B" },
    0x01: { type: "Energy", unit: "Wh", resolution: 1E-2, ConversionType: "B" },
    0x02: { type: "Energy", unit: "Wh", resolution: 1E-1, ConversionType: "B" },
    0x03: { type: "Energy", unit: "Wh", resolution: 1E-0, ConversionType: "B" },
    0x04: { type: "Energy", unit: "Wh", resolution: 1E+1, ConversionType: "B" },
    0x05: { type: "Energy", unit: "Wh", resolution: 1E+2, ConversionType: "B" },
    0x06: { type: "Energy", unit: "Wh", resolution: 1E+3, ConversionType: "B" },
    0x07: { type: "Energy", unit: "Wh", resolution: 1E+4, ConversionType: "B" },
    0x08: { type: "Energy", unit: "J", resolution: 1E-0, ConversionType: "B" },
    0x09: { type: "Energy", unit: "J", resolution: 1E+1, ConversionType: "B" },
    0x0A: { type: "Energy", unit: "J", resolution: 1E+2, ConversionType: "B" },
    0x0B: { type: "Energy", unit: "J", resolution: 1E+3, ConversionType: "B" },
    0x0C: { type: "Energy", unit: "J", resolution: 1E+4, ConversionType: "B" },
    0x0D: { type: "Energy", unit: "J", resolution: 1E+5, ConversionType: "B" },
    0x0E: { type: "Energy", unit: "J", resolution: 1E+6, ConversionType: "B" },
    0x0F: { type: "Energy", unit: "J", resolution: 1E+7, ConversionType: "B" },
    0x10: { type: "Volume", unit: "m3", resolution: 1E-6, ConversionType: "B" },
    0x11: { type: "Volume", unit: "m3", resolution: 1E-5, ConversionType: "B" },
    0x12: { type: "Volume", unit: "m3", resolution: 1E-4, ConversionType: "B" },
    0x13: { type: "Volume", unit: "m3", resolution: 1E-3, ConversionType: "B" },
    0x14: { type: "Volume", unit: "m3", resolution: 1E-2, ConversionType: "B" },
    0x15: { type: "Volume", unit: "m3", resolution: 1E-1, ConversionType: "B" },
    0x16: { type: "Volume", unit: "m3", resolution: 1E-0, ConversionType: "B" },
    0x17: { type: "Volume", unit: "m3", resolution: 1E+1, ConversionType: "B" },
    0x18: { type: "Mass", unit: "kg", resolution: 1E-3, ConversionType: "B" },
    0x19: { type: "Mass", unit: "kg", resolution: 1E-2, ConversionType: "B" },
    0x1A: { type: "Mass", unit: "kg", resolution: 1E-1, ConversionType: "B" },
    0x1B: { type: "Mass", unit: "kg", resolution: 1E-0, ConversionType: "B" },
    0x1C: { type: "Mass", unit: "kg", resolution: 1E+1, ConversionType: "B" },
    0x1D: { type: "Mass", unit: "kg", resolution: 1E+2, ConversionType: "B" },
    0x1E: { type: "Mass", unit: "kg", resolution: 1E+3, ConversionType: "B" },
    0x1F: { type: "Mass", unit: "kg", resolution: 1E+4, ConversionType: "B" },
    0x20: { type: "On time", unit: "NA", resolution: 1, ConversionType: "B" },
    0x21: { type: "On time", unit: "NA", resolution: 1, ConversionType: "B" },
    0x22: { type: "On time", unit: "NA", resolution: 1, ConversionType: "B" },
    0x23: { type: "On time", unit: "NA", resolution: 1, ConversionType: "B" },
    0x24: { type: "Operating time", unit: "NA", resolution: 1, ConversionType: "B" },
    0x25: { type: "Operating time", unit: "NA", resolution: 1, ConversionType: "B" },
    0x26: { type: "Operating time", unit: "NA", resolution: 1, ConversionType: "B" },
    0x27: { type: "Operating time", unit: "NA", resolution: 1, ConversionType: "B" },
    0x28: { type: "Power", unit: "W", resolution: 1E-3, ConversionType: "B" },
    0x29: { type: "Power", unit: "W", resolution: 1E-2, ConversionType: "B" },
    0x2A: { type: "Power", unit: "W", resolution: 1E-1, ConversionType: "B" },
    0x2B: { type: "Power", unit: "W", resolution: 1E-0, ConversionType: "B" },
    0x2C: { type: "Power", unit: "W", resolution: 1E+1, ConversionType: "B" },
    0x2D: { type: "Power", unit: "W", resolution: 1E+2, ConversionType: "B" },
    0x2E: { type: "Power", unit: "W", resolution: 1E+3, ConversionType: "B" },
    0x2F: { type: "Power", unit: "W", resolution: 1E+4, ConversionType: "B" },
    0x30: { type: "Power", unit: "J/h", resolution: 1E-0, ConversionType: "B" },
    0x31: { type: "Power", unit: "J/h", resolution: 1E+1, ConversionType: "B" },
    0x32: { type: "Power", unit: "J/h", resolution: 1E+2, ConversionType: "B" },
    0x33: { type: "Power", unit: "J/h", resolution: 1E+3, ConversionType: "B" },
    0x34: { type: "Power", unit: "J/h", resolution: 1E+4, ConversionType: "B" },
    0x35: { type: "Power", unit: "J/h", resolution: 1E+5, ConversionType: "B" },
    0x36: { type: "Power", unit: "J/h", resolution: 1E+6, ConversionType: "B" },
    0x37: { type: "Power", unit: "J/h", resolution: 1E+7, ConversionType: "B" },
    0x38: { type: "Volume flow", unit: "m3/h", resolution: 1E-6, ConversionType: "B" },
    0x39: { type: "Volume flow", unit: "m3/h", resolution: 1E-5, ConversionType: "B" },
    0x3A: { type: "Volume flow", unit: "m3/h", resolution: 1E-4, ConversionType: "B" },
    0x3B: { type: "Volume flow", unit: "m3/h", resolution: 1E-3, ConversionType: "B" },
    0x3C: { type: "Volume flow", unit: "m3/h", resolution: 1E-2, ConversionType: "B" },
    0x3D: { type: "Volume flow", unit: "m3/h", resolution: 1E-1, ConversionType: "B" },
    0x3E: { type: "Volume flow", unit: "m3/h", resolution: 1E-0, ConversionType: "B" },
    0x3F: { type: "Volume flow", unit: "m3/h", resolution: 1E+1, ConversionType: "B" },
    0x40: { type: "Volume flow (ext.)", unit: "m3/min", resolution: 1E-7, ConversionType: "B" },
    0x41: { type: "Volume flow (ext.)", unit: "m3/min", resolution: 1E-6, ConversionType: "B" },
    0x42: { type: "Volume flow (ext.)", unit: "m3/min", resolution: 1E-5, ConversionType: "B" },
    0x43: { type: "Volume flow (ext.)", unit: "m3/min", resolution: 1E-4, ConversionType: "B" },
    0x44: { type: "Volume flow (ext.)", unit: "m3/min", resolution: 1E-3, ConversionType: "B" },
    0x45: { type: "Volume flow (ext.)", unit: "m3/min", resolution: 1E-2, ConversionType: "B" },
    0x46: { type: "Volume flow (ext.)", unit: "m3/min", resolution: 1E-1, ConversionType: "B" },
    0x47: { type: "Volume flow (ext.)", unit: "m3/min", resolution: 1E-0, ConversionType: "B" },
    0x48: { type: "Volume flow (ext.)", unit: "m3/s", resolution: 1E-9, ConversionType: "B" },
    0x49: { type: "Volume flow (ext.)", unit: "m3/s", resolution: 1E-8, ConversionType: "B" },
    0x4A: { type: "Volume flow (ext.)", unit: "m3/s", resolution: 1E-7, ConversionType: "B" },
    0x4B: { type: "Volume flow (ext.)", unit: "m3/s", resolution: 1E-6, ConversionType: "B" },
    0x4C: { type: "Volume flow (ext.)", unit: "m3/s", resolution: 1E-5, ConversionType: "B" },
    0x4D: { type: "Volume flow (ext.)", unit: "m3/s", resolution: 1E-4, ConversionType: "B" },
    0x4E: { type: "Volume flow (ext.)", unit: "m3/s", resolution: 1E-3, ConversionType: "B" },
    0x4F: { type: "Volume flow (ext.)", unit: "m3/s", resolution: 1E-2, ConversionType: "B" },
    0x50: { type: "Mass flow", unit: "kg/h", resolution: 1E-3, ConversionType: "B" },
    0x51: { type: "Mass flow", unit: "kg/h", resolution: 1E-2, ConversionType: "B" },
    0x52: { type: "Mass flow", unit: "kg/h", resolution: 1E-1, ConversionType: "B" },
    0x53: { type: "Mass flow", unit: "kg/h", resolution: 1E-0, ConversionType: "B" },
    0x54: { type: "Mass flow", unit: "kg/h", resolution: 1E+1, ConversionType: "B" },
    0x55: { type: "Mass flow", unit: "kg/h", resolution: 1E+2, ConversionType: "B" },
    0x56: { type: "Mass flow", unit: "kg/h", resolution: 1E+3, ConversionType: "B" },
    0x57: { type: "Mass flow", unit: "kg/h", resolution: 1E+4, ConversionType: "B" },
    0x58: { type: "Flow temperature", unit: "C", resolution: 1E-3, ConversionType: "B" },
    0x59: { type: "Flow temperature", unit: "C", resolution: 1E-2, ConversionType: "B" },
    0x5A: { type: "Flow temperature", unit: "C", resolution: 1E-1, ConversionType: "B" },
    0x5B: { type: "Flow temperature", unit: "C", resolution: 1E-0, ConversionType: "B" },
    0x5C: { type: "Return temperature", unit: "C", resolution: 1E-3, ConversionType: "B" },
    0x5D: { type: "Return temperature", unit: "C", resolution: 1E-2, ConversionType: "B" },
    0x5E: { type: "Return temperature", unit: "C", resolution: 1E-1, ConversionType: "B" },
    0x5F: { type: "Return temperature", unit: "C", resolution: 1E-0, ConversionType: "B" },
    0x60: { type: "Temperature difference", unit: "K", resolution: 1E-3, ConversionType: "B" },
    0x61: { type: "Temperature difference", unit: "K", resolution: 1E-2, ConversionType: "B" },
    0x62: { type: "Temperature difference", unit: "K", resolution: 1E-1, ConversionType: "B" },
    0x63: { type: "Temperature difference", unit: "K", resolution: 1E-0, ConversionType: "B" },
    0x64: { type: "External temperature", unit: "C", resolution: 1E-3, ConversionType: "B" },
    0x65: { type: "External temperature", unit: "C", resolution: 1E-2, ConversionType: "B" },
    0x66: { type: "External temperature", unit: "C", resolution: 1E-1, ConversionType: "B" },
    0x67: { type: "External temperature", unit: "C", resolution: 1E-0, ConversionType: "B" },
    0x68: { type: "Pressure", unit: "bar", resolution: 1E-3, ConversionType: "B" },
    0x69: { type: "Pressure", unit: "bar", resolution: 1E-2, ConversionType: "B" },
    0x6A: { type: "Pressure", unit: "bar", resolution: 1E-1, ConversionType: "B" },
    0x6B: { type: "Pressure", unit: "bar", resolution: 1E-0, ConversionType: "B" },
    0x6C: { type: "Date/time", unit: "NA", resolution: 1, ConversionType: "G" },
    0x6D: { type: "Date/time", unit: "NA", resolution: 1, ConversionType: "F/J/I/M" },
    0x6E: { type: "Units for HCA", unit: "H.C.A.", resolution: 1, ConversionType: "B" },
    0x70: { type: "Averaging duration", unit: "seconds", resolution: 1, ConversionType: "B" },
    0x71: { type: "Averaging duration", unit: "minutes", resolution: 1, ConversionType: "B" },
    0x72: { type: "Averaging duration", unit: "hours", resolution: 1, ConversionType: "B" },
    0x73: { type: "Averaging duration", unit: "days", resolution: 1, ConversionType: "B" },
    0x74: { type: "Actuality duration", unit: "seconds", resolution: 1, ConversionType: "B" },
    0x75: { type: "Actuality duration", unit: "minutes", resolution: 1, ConversionType: "B" },
    0x76: { type: "Actuality duration", unit: "hours", resolution: 1, ConversionType: "B" },
    0x77: { type: "Actuality duration", unit: "days", resolution: 1, ConversionType: "B" },
    0x78: { type: "Fabrication no", unit: "NA", resolution: 1, ConversionType: "B" },
    0x79: { type: "Enhanced identification", unit: "NA", resolution: 1, ConversionType: "B" },
    0x7A: { type: "Address", unit: "NA", resolution: 1, ConversionType: "B" },
    0x7B: { type: "First extension of VIF-codes", unit: "VIF", resolution: 1, ConversionType: "B" },
    0x7C: { type: "VIF in following string (length in first byte)", unit: "string", resolution: 1, ConversionType: "B" },
    0x7D: { type: "Second extension of VIF-codes", unit: "VIF", resolution: 1, ConversionType: "B" },
    0x7E: { type: "Any VIF", unit: "NA", resolution: 1, ConversionType: "B" },
    0x7F: { type: "Manufacturer specific", unit: "NA", resolution: 1, ConversionType: "B" },
};

// Second VIFE table according to Table 12 in 13757-3:2025. Not all values included.
var SecondVifeTable = {
    0x09: { type: "Device type", unit: "NA", resolution: 1, ConversionType: "C" },
    0x0A: { type: "Manufacturer", unit: "NA", resolution: 1, ConversionType: "C" },
    0x0B: { type: "Parameter set identification", unit: "NA", resolution: 1, ConversionType: "C" },
    0x0C: { type: "Model/Version", unit: "NA", resolution: 1, ConversionType: "C" },
    0x0D: { type: "Hardware version number", unit: "NA", resolution: 1, ConversionType: "C" },
    0x0E: { type: "Metrodology (firmware) version number", unit: "NA", resolution: 1, ConversionType: "C" },
    0x0F: { type: "Other software version number", unit: "NA", resolution: 1, ConversionType: "C" },
    0x10: { type: "Customer location", unit: "NA", resolution: 1, ConversionType: "C" },
    0x11: { type: "Customer", unit: "NA", resolution: 1, ConversionType: "C" },
    0x24: { type: "Storage Interval Second(s)", unit: "NA", resolution: 1, ConversionType: "B" },
    0x25: { type: "Storage Interval Minute(s)", unit: "NA", resolution: 1, ConversionType: "B" },
    0x26: { type: "Storage Interval Hour(s)", unit: "NA", resolution: 1, ConversionType: "B" },
    0x27: { type: "Storage Interval Day(s)", unit: "NA", resolution: 1, ConversionType: "B" },
    0x28: { type: "Storage Interval Month(s)", unit: "NA", resolution: 1, ConversionType: "B" },
    0x29: { type: "Storage Interval Year(s)", unit: "NA", resolution: 1, ConversionType: "B" },
    0x74: { type: "Remaining battery life time (days)", unit: "NA", resolution: 1, ConversionType: "C" },
};

// Manufacture specific VIFE
var ManuVifeTable = {
    0x04: { type: "Coefficient of power", unit: "NA", resolution: 1, ConversionType: "B" },
    0x05: { type: "E10 (V1xT3)", unit: "m^3x°C", resolution: 1, ConversionType: "B" },
    0x06: { type: "E11 (V2xT3)", unit: "m^3x°C", resolution: 1, ConversionType: "B" },
    0x07: { type: "E8 (V1xTF)", unit: "m^3x°C", resolution: 1, ConversionType: "B" },
    0x08: { type: "E9 (V1xTR)", unit: "m^3x°C", resolution: 1, ConversionType: "B" },
    0x0F: { type: "Meter No 1 (low 8 digit)+ Meter No 2 (high 8 digit)", unit: "NA", resolution: 1, ConversionType: "C" },
    0x10: { type: "Program no. ABCCCCCC / ABCCC (PROG NO)", unit: "NA", resolution: 1, ConversionType: "C" },
    0x11: { type: "Config No 1", unit: "NA", resolution: 1, ConversionType: "C" },
    0x12: { type: "Config No 2", unit: "NA", resolution: 1, ConversionType: "C" },
    0x15: { type: "Module type", unit: "NA", resolution: 1, ConversionType: "C" },
    0x16: { type: "Module type/config number", unit: "NA", resolution: 1, ConversionType: "C" },
    0x17: { type: "Module firmware number and version", unit: "NA", resolution: 1, ConversionType: "C" },
    0x1A: { type: "Meter type", unit: "NA", resolution: 1, ConversionType: "C" },
    0x1B: { type: "ALD", unit: "NA", resolution: 1, ConversionType: "C" },
    0x1C: { type: "ALD last day", unit: "NA", resolution: 1, ConversionType: "C" },
    0x22: { type: "Infocode MC Type 4", unit: "NA", resolution: 1, ConversionType: "D" },
    0x25: { type: "Infocode", unit: "NA", resolution: 1, ConversionType: "D" },
};

// Orthogonal VIFE table according to Table 16 in 13757-3:2018
var OrthoVifeTable = {
    0x12: "Averaged value",
    0x13: "Inverse Compact Profile",
    0x14: "Relative deviation",
    0x15: "Record error codes",
    0x16: "Record error codes",
    0x17: "Record error codes",
    0x18: "Record error codes",
    0x19: "Record error codes",
    0x1A: "Record error codes",
    0x1B: "Record error codes",
    0x1C: "Record error codes",
    0x1D: "Standard conform data content",
    0x1E: "Compact profile with registers",
    0x1F: "Compact profile without registers",
    0x20: "Per second",
    0x21: "Per minute",
    0x22: "Per hour",
    0x23: "Per day",
    0x24: "Per week",
    0x25: "Per month",
    0x26: "Per year",
    0x27: "Per revolution/measurement",
    0x28: "Increment per input pulse on input channel number 0",
    0x29: "Increment per input pulse on input channel number 1",
    0x2A: "Increment per output pulse on output channel number 0",
    0x2B: "Increment per output pulse on output channel number 1",
    0x2C: "Per litre",
    0x2D: "Per m3",
    0x2E: "Per kg",
    0x2F: "Per Kelvin",
    0x30: "Per kWh",
    0x31: "Per GJ",
    0x32: "Per kW",
    0x33: "Per K*l (Kelvin*litre)",
    0x34: "Per Volts",
    0x35: "Per Ampere",
    0x36: "Multiplied by s",
    0x37: "Multiplied by s/V",
    0x38: "Multiplied by s/A",
    0x39: "Start date(/time) of",
    0x3A: "VIF contains uncorrected unit or value at metering conditions instead of converted unit",
    0x3B: "accumulation only if positive contributions (forward flow contribution)",
    0x3C: "Reverse",
    0x3D: "reserved for alternate non-metric unit system (see Annex C)",
    0x3E: "Value at base conditions",
    0x3F: "OBIS-declaration (data type C follows in case of binary coding)",
    0x40: "Lower limit value",
    0x41: "Number of exceeds of lower limit",
    0x42: "Date (/time) of: begin of first lower limit exceed",
    0x43: "Date (/time) of: begin of first upper limit exceed",
    0x44: "Multiplied by flow temperature divided by 100",
    0x45: "Multiplied by return temperature divided by 100",
    0x46: "Date (/time) of: begin of last lower limit exceed",
    0x47: "Date (/time) of: begin of last upper limit exceed",
    0x48: "Upper limit value",
    0x49: "Number of exceeds of upper limit",
    0x4A: "Date (/time) of: end of first lower limit exceed",
    0x4B: "Date (/time) of: end of first upper limit exceed",
    0x4E: "Date (/time) of: end of last lower limit exceed",
    0x4F: "Date (/time) of: end of last upper limit exceed",
    0x50: "Duration of first lower limit exceed 0",
    0x51: "Duration of first lower limit exceed 1",
    0x52: "Duration of first lower limit exceed 2",
    0x53: "Duration of first lower limit exceed 3",
    0x54: "Duration of last lower limit exceed 0",
    0x55: "Duration of last lower limit exceed 1",
    0x56: "Duration of last lower limit exceed 2",
    0x57: "Duration of last lower limit exceed 3",
    0x58: "Duration of first upper limit exceed 0",
    0x59: "Duration of first upper limit exceed 1",
    0x5A: "Duration of first upper limit exceed 2",
    0x5B: "Duration of first upper limit exceed 3",
    0x5C: "Duration of last upper limit exceed 0",
    0x5D: "Duration of last upper limit exceed 1",
    0x5E: "Duration of last upper limit exceed 2",
    0x5F: "Duration of last upper limit exceed 3",
    0x60: "Duration of first 0",
    0x61: "Duration of first 1",
    0x62: "Duration of first 2",
    0x63: "Duration of first 3",
    0x64: "Duration of last 0",
    0x65: "Duration of last 1",
    0x66: "Duration of last 2",
    0x67: "Duration of last 3",
    0x68: "Value during lower limit exceed",
    0x69: "Leakage values",
    0x6A: "Date (/time) of first begin",
    0x6B: "Date (/time) of first end of",
    0x6C: "Value during upper limit exceed",
    0x6D: "Overflow values",
    0x6E: "Date (/time) of last begin",
    0x6F: "Date (/time) of last end of",
    0x70: "Multiplicative correction factor for value (not unit): 10E-6",
    0x71: "Multiplicative correction factor for value (not unit): 10E-5",
    0x72: "Multiplicative correction factor for value (not unit): 10E-4",
    0x73: "Multiplicative correction factor for value (not unit): 10E-3",
    0x74: "Multiplicative correction factor for value (not unit): 10E-2",
    0x75: "Multiplicative correction factor for value (not unit): 10E-1",
    0x76: "Multiplicative correction factor for value (not unit): 10E-0",
    0x77: "Multiplicative correction factor for value (not unit): 10E+1",
    0x78: "Additive correction constant: 10E-3 * unit of VIF (offset)",
    0x79: "Additive correction constant: 10E-2 * unit of VIF (offset)",
    0x7A: "Additive correction constant: 10E-1 * unit of VIF (offset)",
    0x7B: "Additive correction constant: 10E-0 * unit of VIF (offset)",
    0x7C: "Extension of combinable (orthogonal) VIFE-Code (refer to Table 17)",
    0x7D: "Multiplicative correction factor for value (not unit): 10E3",
    0x7E: "Future value",
    0x7F: "Next VIFEs and data of this block are manufacturer specific",
};

// Orthogonal Manufacture specific VIFE table
var ManuOrthoVifeTable = {
    0x01: "Control (E2)",
    0x02: "Cooling Energy (E3)",
    0x03: "Inlet Energy (E4)",
    0x04: "Outlet Energy (E5)",
    0x05: "Tapped Energy (E6)",
    0x06: "Heat Energy 2 (E7)",
    0x09: "Volume 2 (V2)",
    0x0A: "Mass 2 (M2)",
    0x0B: "Temperature 3 (T3)",
    0x0C: "Temperature 4 (T4)",
    0x0D: "Flow 2",
    0x0F: "Average",
    0x11: "Volume flow timepoint",
    0x12: "Power timepoint",
    0x1E: "Analogue module input 1",
    0x1F: "Analogue module input 2",
    0x24: "Energy E12",
    0x25: "Energy E13",
    0x26: "Energy E14",
    0x27: "Energy E15",
    0x28: "Energy E16",
    0x29: "Mass M3",
    0x2A: "Mass M4",
    0x2B: "Flow temperature timepoint",
    0x2C: "Return temperature timepoint",
    0x2D: "Power 2",
    0x2E: "Extra digit",
    0x2F: "High res",
};

var InfocodeTableWater = {
    0: "Dry",
    1: "Reverse",
    2: "Leak",
    3: "Burst",
    4: "Tamper",
    5: "Low Battery",
    6: "Low Ambient Temperature",
    7: "High Ambient Temperature",
};

var InfocodeTableMCType4 = {
    0: "Power off",
    1: "Low battery",
    2: "External alarm",
    3: "t1 above range or disconnected",
    4: "t2 above range or disconnected",
    5: "t1 below range or short circuited",
    6: "t2 below range or short circuited",
    7: "Wrong dt (t1-t2)",
    8: "V1 air",
    9: "V1 reverse",
    10: "V1 low signal",
    11: "V1 > qs for more than 1 hour",
    12: "InA1 water system leak",
    13: "InB1 water system leak",
    14: "InA external alarm",
    15: "InB external alarm",
    16: "V1 com. error",
    17: "V1 pulse error",
    18: "InA2 water system leak",
    19: "InB2 water system leak",
    20: "t3 above range or disconnected",
    21: "t3 below range or short circuit",
    22: "V2 com. error",
    23: "V2 pulse error",
    24: "V2 air",
    25: "V2 reverse",
    26: "V2 low signal",
    27: "V2 > qs for more than 1 hour",
    28: "V1V2 Burst Out",
    29: "V1V2 Burst In",
    30: "V1V2 Leak Out",
    31: "V1V2 Leak In",
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
    } else if (VIBArray[0] == 0xFB) {
        // First extension of VIF codes is not supported
        return null;
    } else if (VIBArray[0] == 0x7C || VIBArray[0] == 0xFC) {
        // VIF in string is not supported
        return null;
    } else if (VIBArray[0] == 0xFD) {
        // Second extension of VIF codes
        if (VIBArray[1] in SecondVifeTable) {
            var tempObj = SecondVifeTable[VIBArray[1]];
            VIBObj = { type: tempObj.type, unit: tempObj.unit,
                resolution: tempObj.resolution, ConversionType: tempObj.ConversionType }; // Copy instead of reference
            VIBObj.OrthoVife = "NA";
        } else {
            return null;
        }
    } else if (VIBArray[0] == 0xEF) {
        // Third extension of VIF codes is not supported
        return null;
    } else if (VIBArray[0] == 0x7E || VIBArray[0] == 0xFE) {
        // "Any VIF" is not supported
        return null;
    } else if ((VIBArray[0] & 0x7F) in PriVifTable) {
        var tempObj = PriVifTable[VIBArray[0] & 0x7F];
        VIBObj = { type: tempObj.type, unit: tempObj.unit,
            resolution: tempObj.resolution, ConversionType: tempObj.ConversionType }; // Copy instead of reference
        if ((VIBArray[0] & 0x80) != 0) {
            if (VIBArray[1] == 0xFF) {
                // Manufacturer specific orthogonal VIFE
                if (VIBArray[2] in ManuOrthoVifeTable) {
                    VIBObj.OrthoVife = ManuOrthoVifeTable[VIBArray[2]];
                }
                else {
                    return null;
                }
            } else if (VIBArray[1] in OrthoVifeTable) {
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
    if (days < 1 || days > 31 || months < 1 || months > 12 || hours > 23 || minutes > 59 ) {
        return undefined;
    }
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
    if (days < 1 || days > 31 || months < 1 || months > 12 ) {
        return undefined;
    }
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
    if (days < 1 || days > 31 || months < 1 || months > 12 || hours > 23 || minutes > 59 || seconds > 59 ) {
        return undefined;
    }
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
            record.dib.subunit = 0;
            var snBitShift = 1;
            var suBitShift = 0;
            while ((temp & 0x80) != 0 && i < raw.length) { // Extension
                temp = raw[i];
                i++;
                record.dib.storagenumber += ((temp & 0xF) << snBitShift);
                snBitShift += 4;
                record.dib.subunit += (((temp & 0x40) >> 6 ) << suBitShift);
                suBitShift += 1;
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

    // Append functionfield, subunit and orthogonal VIFE to type
    for (var l = 0; l < mbusRecords.length; l++) {
        var functionFieldText = "";
        var subunitFieldText = "";
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
        switch (mbusRecords[l].dib.subunit) {
            case 0x0:
                subunitFieldText = ""; // No subunit
                break;
            case 0x1:
                subunitFieldText = "Pulse Input A1 ";
                break;
            case 0x2:
                subunitFieldText = "Pulse Input B1 ";
                break;
            case 0x3:
                subunitFieldText = "Pulse Input A2 ";
                break;
            case 0x4:
                subunitFieldText = "Pulse Input B2 ";
                break;
        }
        // Append functionfield in beginning of type, e.g., "Max "flow.
        mbusRecords[l].vib.type = subunitFieldText + functionFieldText + mbusRecords[l].vib.type;
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
        var infocodeTable = {};

        var currentRecord = mbusRecords[p];
        // Add records to values array
        if (currentRecord.vib.type == "Date/time") { // Skip timestamps as they are mapped directly onto records
            // Skip
        } else if (currentRecord.vib.type.includes("Infocode") && currentRecord.data !== undefined) { // Special infocode handling
            infocodeTable = InfocodeTableWater;
            if (currentRecord.vib.type.includes("MC Type 4")) {
                infocodeTable = InfocodeTableMCType4;    
            }
            for (var j = 0; j < Object.keys(infocodeTable).length; j++) {
                type = infocodeTable[j];
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
                // If timepoint, handle special
                if (currentRecord.vib.type.includes("timepoint")) {
                    value = currentRecord.data.toISOString().replace("Z","");
                } else {
                value = normalize(currentRecord.data, currentRecord.vib.resolution);
                }
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
