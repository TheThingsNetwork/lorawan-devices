//*****************************************************************************
// LicenseID: LicenseRef-Ezurio-Clause
// ExtractedText: <text>
// Copyright (c) 2025 Ezurio LLC.
//
// All rights reserved.
//
// Section 1. Definitions
//
// “Authorized Product” means an Ezurio LLC or Laird Connectivity LLC hardware
// or software product.
//
// Section 2. Software License Agreement
//
// Permission to use, copy, modify, and/or distribute the Software in source or
// binary form is granted, provided the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice,
// this permission notice, and the disclaimer below.
//
// 2. Neither the name of Ezurio LLC nor the names of its contributors may be
// used to endorse or promote products derived from this software without
// specific prior written permission.
//
// 3. The Software, with or without modification, may only be used with an
// Authorized Product.
// 
// 4. If and to the extent that the Software is designed to be compliant with
// any published or de facto standard, regulatory standard, or industry
// specification, the Software may not be modified such that the Software or
// Authorized Product would be incompatible with such standard or specification.
// 
// 5. Any Software provided in binary form under this license may not be reverse
// engineered, decompiled, modified or disassembled.
//
// Section 3. Disclaimer
//
// THIS SOFTWARE IS PROVIDED BY EZURIO LLC "AS IS" AND ANY EXPRESS
// OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
// OF MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED. TO THE MAXIMUM EXTENT ALLOWED BY LAW, IN NO EVENT SHALL
// EZURIO LLC OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
// OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
// WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
// OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
// </text>
//*****************************************************************************

const UPLINK_API_VERSION_MAJOR = 0;
const UPLINK_API_VERSION_MINOR = 1;

const UPLINK_MSG_TYPE_SENSOR_DATA = 0;
const UPLINK_MSG_TYPE_SENSOR_CONFIG = 1;

const UPLINK_MSG_TYPE_ELEMENT_SIZE_UINT8 = 1;
const UPLINK_MSG_TYPE_ELEMENT_SIZE_INT8 = 1;
const UPLINK_MSG_TYPE_ELEMENT_SIZE_UINT16 = 2;
const UPLINK_MSG_TYPE_ELEMENT_SIZE_INT16 = 2;
const UPLINK_MSG_TYPE_ELEMENT_SIZE_UINT32 = 4;
const UPLINK_MSG_TYPE_ELEMENT_SIZE_INT32 = 4;
const UPLINK_MSG_TYPE_ELEMENT_SIZE_FLOAT = 4;

const UPLINK_MSG_TYPE_ELEMENT_SIZE_COMMAND_API = UPLINK_MSG_TYPE_ELEMENT_SIZE_UINT8;
const UPLINK_MSG_TYPE_ELEMENT_SIZE_HEADER = UPLINK_MSG_TYPE_ELEMENT_SIZE_UINT8 * 2;
const UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG = UPLINK_MSG_TYPE_ELEMENT_SIZE_UINT8;
const UPLINK_MSG_TYPE_ELEMENT_SIZE_NULL = UPLINK_MSG_TYPE_ELEMENT_SIZE_UINT8;
const UPLINK_MSG_TYPE_ELEMENT_SIZE_ENUM = UPLINK_MSG_TYPE_ELEMENT_SIZE_UINT8;
const UPLINK_MSG_TYPE_ELEMENT_SIZE_TEMP_STD = UPLINK_MSG_TYPE_ELEMENT_SIZE_UINT8 * 2;
const UPLINK_MSG_TYPE_ELEMENT_SIZE_TEMP_WIDE = UPLINK_MSG_TYPE_ELEMENT_SIZE_UINT8 * 4;
const UPLINK_MSG_TYPE_ELEMENT_SIZE_UTC_SECONDS = UPLINK_MSG_TYPE_ELEMENT_SIZE_UINT32;
const UPLINK_MSG_TYPE_ELEMENT_SIZE_AGGREGATE_COUNT = UPLINK_MSG_TYPE_ELEMENT_SIZE_UINT8;

const UPLINK_MSG_TYPE_ELEMENT_HEX_STRING_PREFIX_SIZE = 2;

var enumDecodeSensorType = {
  0 : "None",
  1 : "Internal Temperature Sensor",
  2 : "External Thermistor",
  3 : "External One-Wire",
  4 : "External Contact Sensor",
  5 : "External Leak Detector",
  6 : "External I2C",
  7 : "External SPI"
};

var enumDecodeAuRegion = {
  0 : "AU915",
  1 : "AU923"
};

var enumDecodeDeviceType = {
  0 : "RM1261",
  1 : "RM1262"
};

var enumDecodeNetworkTime = {
  0 : "Automatic",
  1 : "Manual"
};

var enumDecodeAggregationMode = {
  0 : "None",
  1 : "Aggregation",
  2 : "Averaging"
};

var enumDecodeLorawanState = {
  0 : "Idle",
  1 : "Joining",
  2 : "Joined",
  3 : "TX",
  4 : "RX",
  5 : "Disconnected"
};

var enumDecodeChannelMask = {
  1 : "Sub-band 1",
  2 : "Sub-band 2",
  3 : "Sub-band 3",
  4 : "Sub-band 4",
  5 : "Sub-band 5",
  6 : "Sub-band 6",
  7 : "Sub-band 7",
  8 : "Sub-band 8"
};

var enumDecodeRegion = {
  0 : "Unconfigured",
  1 : "EU868",
  3 : "US915",
  4 : "AU915",
  5 : "AU923",
  6 : "NZ923"
};

var enumDecodeOperatingMode = {
  0 : "Ezurio-rs26x"
};

var enumDecodeBool = {
  0 : "False",	
  1 : "True"
};

var enumDecodeLoRaWANDataRate = {
  0 : "DR0",
  1 : "DR1",
  2 : "DR2",
  3 : "DR3",
  4 : "DR4",
  5 : "DR5",
  6 : "DR6",
  7 : "DR7"
};

var enumDecodeBatteryStatus = {
  0 : "Critical",
  1 : "Replace",
  2 : "OK",
  3 : "Good"
};

var parameterTableDecodeNS0 = {
  0 : {"name" : "Temperature",           "decoder" : decodeTemperature},
  1 : {"name" : "Temperature Backlog",   "decoder" : decodeTemperatureBacklog},
  2 : {"name" : "Temperature Aggregate", "decoder" : decodeTemperatureAggregate},
  3 : {"name" : "Temperature",           "decoder" : decodeWideTemperature},
  4 : {"name" : "Temperature Backlog",   "decoder" : decodeWideTemperatureBacklog},
  5 : {"name" : "Temperature Aggregate", "decoder" : decodeWideTemperatureAggregate}
};

var parameterTableDecodeNS1 = {
  0 :  { "name" : "Friendly Name",                        "decoder" : decodeCharString },
  1 :  { "name" : "Sensor Type",                          "decoder" : decodeEnum,      "enumName" : enumDecodeSensorType },
  2 :  { "name" : "Read Period",                          "decoder" : decodeUInt16 },
  3 :  { "name" : "BLE Address",                          "decoder" : decodeHexString, "length" : 14 },
  5 :  { "name" : "AU Region",                            "decoder" : decodeEnum,      "enumName" : enumDecodeAuRegion },
  6 :  { "name" : "Confirmed Packets",                    "decoder" : decodeEnum,      "enumName" : enumDecodeBool },
  7 :  { "name" : "Confirmed Packets Retries",            "decoder" : decodeUInt8 },
  8 :  { "name" : "LoRa RF Power",                        "decoder" : decodeUInt8 },
  11 : { "name" : "LoRaWAN Connection State",             "decoder" : decodeEnum,      "enumName" : enumDecodeBool },
  12 : { "name" : "Downlink Packet Count",                "decoder" : decodeUInt32 },
  13 : { "name" : "LoRa SNR",                             "decoder" : decodeInt8 },
  14 : { "name" : "LoRaWAN State",                        "decoder" : decodeEnum,      "enumName" : enumDecodeLorawanState },
  15 : { "name" : "Uplink Packet Count",                  "decoder" : decodeUInt32 },
  16 : { "name" : "Max TX Power",                         "decoder" : decodeUInt8 },
  17 : { "name" : "Region",                               "decoder" : decodeEnum,      "enumName" : enumDecodeRegion },
  18 : { "name" : "Channel Mask",                         "decoder" : decodeEnum,      "enumName" : enumDecodeChannelMask },
  19 : { "name" : "Reading Aggregate Count",              "decoder" : decodeUInt8 },
  20 : { "name" : "Aggregation Mode",                     "decoder" : decodeEnum,      "enumName" : enumDecodeAggregationMode },
  22 : { "name" : "Clear Backlog",                        "decoder" : decodeAction },
  23 : { "name" : "Device Type",                          "decoder" : decodeEnum,      "enumName" : enumDecodeDeviceType },
  25 : { "name" : "Factory Reset",                        "decoder" : decodeAction },
  26 : { "name" : "Firmware Version",                     "decoder" : decodeCharString },
  27 : { "name" : "App Version",                          "decoder" : decodeCharString },
  30 : { "name" : "LoRa Module Firmware Version",         "decoder" : decodeCharString },
  31 : { "name" : "RTC Time",                             "decoder" : decodeUTCSeconds },
  32 : { "name" : "Software Device Reset",                "decoder" : decodeAction },
  33 : { "name" : "Thermistor 560 Cal Actual",            "decoder" : decodeDualFloat },
  34 : { "name" : "Thermistor 330k Cal Actual",           "decoder" : decodeDualFloat },
  35 : { "name" : "Heartbeat LED Flash Period",           "decoder" : decodeUInt8 },
  36 : { "name" : "BLE RSSI",                             "decoder" : decodeInt8 },
  37 : { "name" : "BLE TX Power",                         "decoder" : decodeInt8 },
  38 : { "name" : "Device Model",                         "decoder" : decodeCharString },
  39 : { "name" : "Operating Mode",                       "decoder" : decodeEnum,      "enumName" : enumDecodeOperatingMode },
  40 : { "name" : "Network Time",                         "decoder" : decodeEnum,      "enumName" : enumDecodeNetworkTime },
  41 : { "name" : "LoRaWAN RSSI",                         "decoder" : decodeInt8 },
  42 : { "name" : "LoRaWAN Data Rate",                    "decoder" : decodeEnum,      "enumName" : enumDecodeLoRaWANDataRate },
  48 : { "name" : "Thermistor S-H Coefficient A",         "decoder" : decodeFloat },
  49 : { "name" : "Thermistor S-H Coefficient B",         "decoder" : decodeFloat },
  50 : { "name" : "Thermistor S-H Coefficient C",         "decoder" : decodeFloat },
  51 : { "name" : "Battery Voltage Threshold - Good",     "decoder" : decodeUInt16 },
  52 : { "name" : "Battery Voltage Threshold - Bad",      "decoder" : decodeUInt16 },
  53 : { "name" : "Battery Voltage Threshold - Critical", "decoder" : decodeUInt16 },
  54 : { "name" : "Battery Voltage",                      "decoder" : decodeUInt16 }
};

function Decode(fPort, bytes, variables) {

  var input = {};
  var output = {};
  
  input = Object.assign({"fPort" : fPort}, input);
  input = Object.assign({"bytes" : bytes}, input);
  input = Object.assign({"variables" : variables}, input);

  output = decodeUplink(input);

  return(output);
}

function decodeUplink(input) {

  var output = {};

  if (input.fPort === 0){
    output = {"data": {}};
  }
  else {
    if (input.bytes.length > 0) {
      if (input.bytes[0] == UPLINK_MSG_TYPE_SENSOR_DATA) {
        output = decodeSensorUplink(input.bytes, false);
      }
      else if (input.bytes[0] == UPLINK_MSG_TYPE_SENSOR_CONFIG) {
        output = decodeSensorUplink(input.bytes, true);
      }
    }
  }
  return(output);
}

function decodeSensorUplink(input, isConfig) {

  var output = {};
  var finalisedOutput = {};
  var elementOutput = {};
  var index = 0;

  while (index < input.length)
  {
    elementOutput = decodeSensorUplinkElement(input,
                                              output,
                                              index,
                                              isConfig);
    output = elementOutput.updatedInput;
    index += elementOutput.bytesProcessed;
  }
  finalisedOutput = Object.assign({"data" : output}, finalisedOutput);
  return(finalisedOutput);
}

function decodeSensorUplinkElement(input, output, index, isConfig) {

  var updatedInput = {};
  var decodeTable;

  if (index === 0) {
    updatedInput = decodeUplinkMessageHeader(input);
  }
  else {
    if (!isConfig) {
      decodeTable = parameterTableDecodeNS0;
    }
    else {
      decodeTable =  parameterTableDecodeNS1;
    }
    for (var row in decodeTable) {
      if (row == input[index]) {
        updatedInput = decodeTable[row].decoder(input,
                                                output,
                                                index, 
                                                decodeTable[row]
                                               );
        break;
      }
    }
  }
  return(updatedInput);
}

function decodeUplinkMessageHeader(input) {

  var batteryStatus;
  var deviceStatus;
  var batteryStatusValue;
  var deviceStatusValue;
  var output = {};
  var status = decodeUInt8Value(input,
                                UPLINK_MSG_TYPE_ELEMENT_SIZE_COMMAND_API);

  batteryStatus = status >> 6;
  deviceStatus = status & 0x3F;

  batteryStatusValue = decodeEnumValue(batteryStatus, enumDecodeBatteryStatus);
  output = {"Battery Status" : batteryStatusValue};

  deviceStatusValue = decodeDeviceStatusValue(deviceStatus);
  output = Object.assign({"Device Status" : deviceStatusValue}, output);

  return({updatedInput : output,
          bytesProcessed : UPLINK_MSG_TYPE_ELEMENT_SIZE_HEADER});
}

function decodeUInt8(input, output, index, _elementDetails) {

  var decoded;

  decoded = decodeUInt8Value(input, index + UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG);

  output = Object.assign({[_elementDetails.name] : decoded}, output);

  return({updatedInput : output, bytesProcessed :
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_UINT8});
}

function decodeUInt16(input, output, index, _elementDetails) {

  var decoded;

  decoded = decodeUInt16Value(input, index + UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG);

  output = Object.assign({[_elementDetails.name] : decoded}, output);

  return({updatedInput : output, bytesProcessed :
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_UINT16});
}

function decodeCharString(input, output, index, _elementDetails) {

  var decoded;

  decoded = decodeCharStringValue(input, index +
                                         UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG);

  output = Object.assign({[_elementDetails.name] : decoded}, output);

  return({updatedInput : output, bytesProcessed :
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_NULL +
                                 decoded.length});
}

function decodeEnum(input, output, index, _elementDetails) {

  var decoded;
  
  decoded = decodeEnumValue(input[index + UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG],
                            _elementDetails.enumName);

  output = Object.assign({[_elementDetails.name] : decoded}, output);

  return({updatedInput : output, bytesProcessed :
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_ENUM});
}

function decodeUTCSeconds(input, output, index, _elementDetails) {

  var decoded;

  decoded = decodeUTCSecondsValue(input, index +
                                         UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG);
  output = Object.assign({[_elementDetails.name] : decoded}, output);
  return({updatedInput : output, bytesProcessed :
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_UTC_SECONDS});
}

function decodeFloat(input, output, index, _elementDetails) {

  var decoded;

  decoded = decodeFloatValue(input, index + UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG);

  output = Object.assign({[_elementDetails.name] : decoded}, output);
  return({updatedInput : output, bytesProcessed :
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_FLOAT});
}

function decodeAction(input, output, index, _elementDetails) {

  output = Object.assign({[_elementDetails.name] : 0}, output);
  return({updatedInput : output, bytesProcessed :
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG});
}

function decodeInt8(input, output, index, _elementDetails) {

  var decoded;

  decoded = decodeInt8Value(input, index + UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG);

  output = Object.assign({[_elementDetails.name] : decoded}, output);
  return({updatedInput : output, bytesProcessed :
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_INT8});
}

function decodeUInt32(input, output, index, _elementDetails) {

  var decoded;

  decoded = decodeUInt32Value(input, index + UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG);

  output = Object.assign({[_elementDetails.name] : decoded}, output);

  return({updatedInput : output, bytesProcessed :
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_UINT32});
}

function decodeHexString(input, output, index, _elementDetails) {

  var decoded;

  decoded = decodeHexStringValue(input,
                                 index +
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG,
                                 _elementDetails.length);

  output = Object.assign({[_elementDetails.name] : decoded}, output);

  return({updatedInput : output, bytesProcessed :
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                                 (decoded.length - UPLINK_MSG_TYPE_ELEMENT_HEX_STRING_PREFIX_SIZE)});
}

function decodeTemperature(input, output, index, _elementDetails)
{
  var temperature = decodeTemperatureValue(input,
                                           index +
                                           UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG);

  output = Object.assign({"Temperature" : temperature}, output);

  return({updatedInput : output,
          bytesProcessed : UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                           UPLINK_MSG_TYPE_ELEMENT_SIZE_TEMP_STD});
}

function decodeWideTemperature(input, output, index, _elementDetails)
{
  var temperature = decodeWideTemperatureValue(input,
                                               index +
                                               UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG);

  output = Object.assign({"Temperature" : temperature}, output);

  return({updatedInput : output,
          bytesProcessed : UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                           UPLINK_MSG_TYPE_ELEMENT_SIZE_TEMP_WIDE});
}

function decodeTemperatureBacklog(input, output, index, _elementDetails)
{
  var innerObject = {};
  var temperature;
  var backlogKey;

  innerObject = Object.assign({"Timestamp" :
                               decodeUTCSecondsValue(input,
                                                     index +
                                                     UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG)},
                              innerObject);

  temperature = decodeTemperatureValue(input, index +
                                              UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                                              UPLINK_MSG_TYPE_ELEMENT_SIZE_UTC_SECONDS);
  innerObject = Object.assign({"Temperature" : temperature}, innerObject);

  backlogKey = GetAscendingKey(output, "Temperature Backlog");
  output = Object.assign({[backlogKey] : innerObject}, output);

  return({updatedInput : output,
          bytesProcessed :
          UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
          UPLINK_MSG_TYPE_ELEMENT_SIZE_UTC_SECONDS +
          UPLINK_MSG_TYPE_ELEMENT_SIZE_TEMP_STD});
}

function decodeWideTemperatureBacklog(input, output, index, _elementDetails)
{
  var innerObject = {};
  var temperature;
  var backlogKey;

  innerObject = Object.assign({"Timestamp" :
                               decodeUTCSecondsValue(input,
                                                     index +
                                                     UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG)},
                              innerObject);

  temperature = decodeWideTemperatureValue(input,
                                           index +
                                           UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                                           UPLINK_MSG_TYPE_ELEMENT_SIZE_UTC_SECONDS);
  innerObject = Object.assign({"Temperature" : temperature}, innerObject);

  backlogKey = GetAscendingKey(output, "Temperature Backlog");
  output = Object.assign({[backlogKey] : innerObject}, output);

  return({updatedInput : output,
          bytesProcessed :
          UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
          UPLINK_MSG_TYPE_ELEMENT_SIZE_UTC_SECONDS +
          UPLINK_MSG_TYPE_ELEMENT_SIZE_TEMP_WIDE});
}

function decodeTemperatureAggregate(input, output, index, _elementDetails)
{
  var aggregateCount = decodeUInt8Value(input,
                                        index +
                                        UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG);

  var bytesProcessed = UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                       UPLINK_MSG_TYPE_ELEMENT_SIZE_AGGREGATE_COUNT +
                       UPLINK_MSG_TYPE_ELEMENT_SIZE_UTC_SECONDS +
                       (UPLINK_MSG_TYPE_ELEMENT_SIZE_TEMP_STD * aggregateCount);

  var innerObject = {};
  var aggregateObject = {};
  var aggregateIndex;
  var temperature;

  innerObject = Object.assign({"Aggregate Count" : aggregateCount},
                              innerObject);

  innerObject = Object.assign({"Timestamp" :
                               decodeUTCSecondsValue(
                                 input,
                                 index +
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_AGGREGATE_COUNT)},
                              innerObject);

  aggregateIndex = UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                   UPLINK_MSG_TYPE_ELEMENT_SIZE_AGGREGATE_COUNT +
                   UPLINK_MSG_TYPE_ELEMENT_SIZE_UTC_SECONDS;
  
  aggregateCount = 1;
  while (aggregateIndex < bytesProcessed) {
    temperature = decodeTemperatureValue(input, index + aggregateIndex);
    aggregateObject = Object.assign({["Temperature " + aggregateCount] :
                                      temperature}, aggregateObject);
    aggregateIndex += UPLINK_MSG_TYPE_ELEMENT_SIZE_TEMP_STD;
    aggregateCount++;
  }
  innerObject = Object.assign({"Aggregate Temperatures" :
                               aggregateObject}, innerObject);

  output = Object.assign({"Aggregate Temperature" : innerObject}, output);

  return({updatedInput : output, bytesProcessed : bytesProcessed});
}

function decodeWideTemperatureAggregate(input, output, index, _elementDetails)
{
  var aggregateCount = decodeUInt8Value(input,
                                        index +
                                        UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG);

  var bytesProcessed = UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                       UPLINK_MSG_TYPE_ELEMENT_SIZE_AGGREGATE_COUNT +
                       UPLINK_MSG_TYPE_ELEMENT_SIZE_UTC_SECONDS +
                       (UPLINK_MSG_TYPE_ELEMENT_SIZE_TEMP_WIDE * aggregateCount);

  var innerObject = {};
  var aggregateObject = {};
  var aggregateIndex;
  var temperature;

  innerObject = Object.assign({"Aggregate Count" : aggregateCount},
                              innerObject);

  innerObject = Object.assign({"Timestamp" :
                               decodeUTCSecondsValue(
                                 input,
                                 index +
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_AGGREGATE_COUNT)},
                              innerObject);

  aggregateIndex = UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                   UPLINK_MSG_TYPE_ELEMENT_SIZE_AGGREGATE_COUNT +
                   UPLINK_MSG_TYPE_ELEMENT_SIZE_UTC_SECONDS;
  
  aggregateCount = 1;
  while (aggregateIndex < bytesProcessed) {
    temperature = decodeWideTemperatureValue(input, index + aggregateIndex);
    aggregateObject = Object.assign({["Temperature " + aggregateCount] :
                                      temperature}, aggregateObject);
    aggregateIndex += UPLINK_MSG_TYPE_ELEMENT_SIZE_TEMP_WIDE;
    aggregateCount++;
  }
  innerObject = Object.assign({"Aggregate Temperatures" :
                               aggregateObject}, innerObject);

  output = Object.assign({"Aggregate Temperature" : innerObject}, output);

  return({updatedInput : output, bytesProcessed : bytesProcessed});
}

function decodeDualFloat(input, output, index, _elementDetails) {

  var decodedFloat1;
  var decodedFloat2;
  var innerObject;

  decodedFloat1 = decodeFloatValue(input,
                                   index + UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG);
  decodedFloat2 = decodeFloatValue(input,
                                   index + UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                                   UPLINK_MSG_TYPE_ELEMENT_SIZE_FLOAT);
  innerObject = {"Value 1" : decodedFloat1, "Value 2" : decodedFloat2};
  output = Object.assign({[_elementDetails.name] : innerObject}, output);
  return({updatedInput : output, bytesProcessed :
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_FLOAT +
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_FLOAT});
}


function decodeUInt8Value(input, index) {

  var decoded;

  decoded = input[index] & 0xFF;
  return(decoded);
}

function decodeUInt16Value(input, index) {

  var arrayBuffer = new ArrayBuffer(UPLINK_MSG_TYPE_ELEMENT_SIZE_INT16);
  var uInt8Array = new Uint8Array(arrayBuffer);
  var decoded;

  for (var i = 0; i < UPLINK_MSG_TYPE_ELEMENT_SIZE_UINT16; i++) {
    uInt8Array[i] = input[index + i] & 0xFF;
  }

  var dataView = new DataView(arrayBuffer);
  decoded = dataView.getUint16(0, false);
  return(decoded);
}

function decodeUInt32Value(input, index) {

  var arrayBuffer = new ArrayBuffer(UPLINK_MSG_TYPE_ELEMENT_SIZE_UINT32);
  var uInt8Array = new Uint8Array(arrayBuffer);
  var decoded;

  for (var i = 0; i < UPLINK_MSG_TYPE_ELEMENT_SIZE_UINT32; i++) {
    uInt8Array[i] = input[index + i] & 0xFF;
  }

  var dataView = new DataView(arrayBuffer);
  decoded = dataView.getUint32(0, false);
  return(decoded);
}

function decodeCharStringValue(input, index) {

  var decoded;
  var bytes;
  var stringFromBytes;
  var nullPosition;

  bytes = input.slice(index);
  stringFromBytes = String.fromCharCode.apply(null, bytes);
  nullPosition = stringFromBytes.indexOf('\0');
  decoded = stringFromBytes.slice(0, nullPosition);
  return(decoded);
}

function decodeEnumValue(input, decodeEnum) {

  var decoded = "Unknown";

  for (var elementEnumMember in decodeEnum) {
    if (elementEnumMember == input) {
      var elementEnumValue = decodeEnum[elementEnumMember];
      decoded = elementEnumValue;
      break;
    }
  }
  return(decoded);
}

function decodeUTCSecondsValue(input, index) {

  var utcSeconds = decodeUInt32Value(input, index);
  var date = new Date(utcSeconds * 1000);
  return(date.toUTCString());
}

function decodeFloatValue(input, index) {

  var arrayBuffer = new ArrayBuffer(UPLINK_MSG_TYPE_ELEMENT_SIZE_FLOAT);
  var uint8Array = new Uint8Array(arrayBuffer);
  var decoded;

  for (var i = 0 ; i < UPLINK_MSG_TYPE_ELEMENT_SIZE_FLOAT ; i++) {
    uint8Array[i] = input[index + i] & 0xFF;
  }

  var dataView = new DataView(arrayBuffer);
  decoded = dataView.getFloat32(0, false);
  return(decoded);
}

function decodeInt8Value(input, index) {

  var arrayBuffer = new ArrayBuffer(UPLINK_MSG_TYPE_ELEMENT_SIZE_INT8);
  var dataView = new DataView(arrayBuffer);
  var decoded;

  dataView.setInt8(0, input[index] & 0xFF);
  decoded = dataView.getInt8(0, false);
  return(decoded);
}

function decodeInt16Value(input, index) {

  var arrayBuffer = new ArrayBuffer(UPLINK_MSG_TYPE_ELEMENT_SIZE_INT16);
  var int8Array = new Int8Array(arrayBuffer);
  var decoded;

  for (var i = 0; i < UPLINK_MSG_TYPE_ELEMENT_SIZE_INT16; i++) {
    int8Array[i] = input[index + i] & 0xFF;
  }

  var dataView = new DataView(arrayBuffer);
  decoded = dataView.getInt16(0, false);
  return(decoded);
}

function decodeInt32Value(input, index) {

  var arrayBuffer = new ArrayBuffer(UPLINK_MSG_TYPE_ELEMENT_SIZE_INT32);
  var int8Array = new Int8Array(arrayBuffer);
  var decoded;

  for (var i = 0; i < UPLINK_MSG_TYPE_ELEMENT_SIZE_INT32; i++) {
    int8Array[i] = input[index + i] & 0xFF;
  }

  var dataView = new DataView(arrayBuffer);
  decoded = dataView.getInt32(0, false);
  return(decoded);
}

function decodeHexStringValue(input, index, length) {

  var decoded = "0x0";

  decoded = String.fromCharCode.apply(null, input.slice(index));
  decoded = decoded.slice(0, length);
  decoded = '0x' + decoded;
  return(decoded);
}

function decodeTemperatureValue(input, index) {

  var signedValue = 0;
  var signedValueFloat;

  signedValue = decodeInt16Value(input, index);
  signedValueFloat = parseInt(signedValue);
  signedValueFloat /= 256.0;
  signedValueFloat = parseFloat(signedValueFloat.toFixed(2));
  return(signedValueFloat);
}

function decodeWideTemperatureValue(input, index) {

  var signedValue = 0;
  var signedValueFloat;

  signedValue = decodeInt32Value(input, index);
  signedValueFloat = parseInt(signedValue)
  signedValueFloat /= 65536.0;
  signedValueFloat = parseFloat(signedValueFloat.toFixed(2));
  return(signedValueFloat);
}

function decodeDeviceStatusValue(input) {

  var deviceStatus = {};
  var bitIndex = 0;
  var statusLabels = ["Sensor Fault",
                      "Bandwidth Limitation",
                      "Backlogs Available",
                      "Backlog Wraparound",
                      "Unsupported API Version"];
  var bitStatus;

  while (bitIndex < statusLabels.length) {
    bitStatus = "No";
    if (input & (1 << bitIndex)) {
      bitStatus = "Yes";
    }
    deviceStatus = Object.assign({[statusLabels[bitIndex]] :
                                   bitStatus}, deviceStatus);
    bitIndex++;
  }
  return(deviceStatus);
}

function GetAscendingKey(input, keyName) {

  var ascendingKey;
  var keyCount = Object.keys(input).filter(key => key.startsWith(keyName)).length;
  keyCount = keyCount + 1;
  ascendingKey = keyName + " " + keyCount;
  return(ascendingKey);
}

const DOWNLINK_API_VERSION_MAJOR = 0;
const DOWNLINK_API_VERSION_MINOR = 1;

const DOWNLINK_MSG_TYPE_GET_SENSOR_CONFIG = 0;
const DOWNLINK_MSG_TYPE_SET_SENSOR_CONFIG = 1;

const DOWNLINK_MSG_TYPE_ELEMENT_SIZE_UINT8 = 1;
const DOWNLINK_MSG_TYPE_ELEMENT_SIZE_UINT16 = 2;
const DOWNLINK_MSG_TYPE_ELEMENT_SIZE_UINT32 = 4;
const DOWNLINK_MSG_TYPE_ELEMENT_SIZE_FLOAT = 4;

const DOWNLINK_MSG_TYPE_ELEMENT_SIZE_ENUM = DOWNLINK_MSG_TYPE_ELEMENT_SIZE_UINT8;
const DOWNLINK_MSG_TYPE_ELEMENT_SIZE_UTC_SECONDS = DOWNLINK_MSG_TYPE_ELEMENT_SIZE_UINT32;

var enumEncodeAuRegion = {
  "AU915" : 0,
  "AU923" : 1
};

var enumEncodeNetworkTime = {
  "Automatic" : 0,
  "Manual" : 1
};

var enumEncodeChannelMask = {
  "Sub-band 1" : 1,
  "Sub-band 2" : 2,
  "Sub-band 3" : 3,
  "Sub-band 4" : 4,
  "Sub-band 5" : 5,
  "Sub-band 6" : 6,
  "Sub-band 7" : 7,
  "Sub-band 8" : 8
};

var enumEncodeAggregationMode = {
  "None" : 0,
  "Aggregation" : 1,
  "Averaging" : 2
};

var enumEncodeOperatingMode = {
  "Ezurio-rs26x" : 0
};

var enumEncodeBool = {
  "False" : 0,
  "True" : 1
};

var parameterTableEncodeNS1 = {
  "Friendly Name" :                        { "tag" : 0,  "access" : "rw", "encoder" : encodeCharString, "min" : 0, "max" : 20 },
  "Sensor Type" :                          { "tag" : 1,  "access" : "r" },
  "Read Period" :                          { "tag" : 2,  "access" : "rw", "encoder" : encodeUInt16, "min" : 5, "max" : 3600 },
  "BLE Address" :                          { "tag" : 3,  "access" : "r" },
  "AU Region" :                            { "tag" : 5,  "access" : "rw", "encoder" : encodeEnum, "enumName" : enumEncodeAuRegion },
  "Confirmed Packets" :                    { "tag" : 6,  "access" : "rw", "encoder" : encodeEnum, "enumName" : enumEncodeBool },
  "Confirmed Packets Retries" :            { "tag" : 7,  "access" : "rw", "encoder" : encodeUInt8, "min" : 0, "max" : 10 },
  "LoRa RF Power" :                        { "tag" : 8,  "access" : "r" },
  "LoRaWAN Connection State" :             { "tag" : 11, "access" : "r" },
  "Downlink Packet Count" :                { "tag" : 12, "access" : "r" },
  "LoRa SNR" :                             { "tag" : 13, "access" : "r" },
  "LoRaWAN State" :                        { "tag" : 14, "access" : "r" },
  "Uplink Packet Count" :                  { "tag" : 15, "access" : "r" },
  "Max TX Power" :                         { "tag" : 16, "access" : "rw", "encoder" : encodeUInt8, "min" : 0, "max" : 22 },
  "Region" :                               { "tag" : 17, "access" : "r" },
  "Channel Mask" :                         { "tag" : 18, "access" : "rw", "encoder" : encodeEnum, "enumName" : enumEncodeChannelMask },
  "Reading Aggregate Count" :              { "tag" : 19, "access" : "rw", "encoder" : encodeUInt8, "min" : 2, "max" : 10 },
  "Aggregation Mode" :                     { "tag" : 20, "access" : "rw", "encoder" : encodeEnum, "enumName" : enumEncodeAggregationMode },
  "Clear Backlog" :                        { "tag" : 22, "access" : "w",  "encoder" : encodeAction },
  "Device Type" :                          { "tag" : 23, "access" : "r" },
  "Factory Reset" :                        { "tag" : 25, "access" : "w",  "encoder" : encodeAction },
  "Firmware Version" :                     { "tag" : 26, "access" : "r" },
  "App Version" :                          { "tag" : 27, "access" : "r" },
  "LoRa Module Firmware Version" :         { "tag" : 30, "access" : "r" },
  "RTC Time" :                             { "tag" : 31, "access" : "rw", "encoder" : encodeUTCSeconds, "min" : 0, "max" : 0xFFFFFFFF },
  "Software Device Reset" :                { "tag" : 32, "access" : "w",  "encoder" : encodeAction },
  "Thermistor 560 Cal Actual" :            { "tag" : 33, "access" : "r" },
  "Thermistor 330k Cal Actual" :           { "tag" : 34, "access" : "r" },
  "Heartbeat LED Flash Period" :           { "tag" : 35, "access" : "rw", "encoder" : encodeUInt8, "min" : 0, "max" : 60 },
  "BLE RSSI" :                             { "tag" : 36, "access" : "r" },
  "BLE TX Power" :                         { "tag" : 37, "access" : "r" },
  "Device Model" :                         { "tag" : 38, "access" : "r" },
  "Operating Mode" :                       { "tag" : 39, "access" : "rw", "encoder" : encodeEnum, "enumName" : enumEncodeOperatingMode },
  "Network Time" :                         { "tag" : 40, "access" : "rw", "encoder" : encodeEnum, "enumName" : enumEncodeNetworkTime },
  "LoRa RSSI" :                            { "tag" : 41, "access" : "r" },
  "LoRaWAN Data Rate" :                    { "tag" : 42, "access" : "r" },
  "Thermistor S-H Coefficient A" :         { "tag" : 48, "access" : "rw", "encoder" : encodeFloat },
  "Thermistor S-H Coefficient B" :         { "tag" : 49, "access" : "rw", "encoder" : encodeFloat },
  "Thermistor S-H Coefficient C" :         { "tag" : 50, "access" : "rw", "encoder" : encodeFloat },
  "Battery Voltage Threshold - Good"     : { "tag" : 51, "access" : "rw", "encoder" : encodeUInt16, "min" : 0x0, "max" : 0xFFFF },
  "Battery Voltage Threshold - Bad"      : { "tag" : 52, "access" : "rw", "encoder" : encodeUInt16, "min" : 0x0, "max" : 0xFFFF },
  "Battery Voltage Threshold - Critical" : { "tag" : 53, "access" : "rw", "encoder" : encodeUInt16, "min" : 0x0, "max" : 0xFFFF },
  "Battery Voltage" :                      { "tag" : 54, "access" : "r" }
};


function Encode(fPort, obj, variables) {

  var input = {};
  var output = {};
  
  input.Object.assign({"fPort" : fPort}, input);
  input.Object.assign({"data" : obj}, input);
  input.Object.assign({"variables" : variables}, input);
	
  output = encodeDownlink(input);
}

function encodeDownlink(input) {

  var finalOutput = {"bytes" : [],
                     "fPort" : 1,
                     "warnings" : [],
                     "errors" : []};
  var element = {};
  var index = 0;
  var updatedOutput = {};
  var sorted_input = {};

  if ("fPort" in input) {
    finalOutput.fPort = input.fPort;
  }

  for (var row in input.data) {

    if (row == "Message Type") {
      if (input.data[row] == "Configuration Get") {
        finalOutput.bytes.push(DOWNLINK_MSG_TYPE_GET_SENSOR_CONFIG);
        index++;
        for (row in input.data) {
          if (row == "Parameters") {
            for (var parameter in input.data[row]) {
              finalOutput = encodeGetDownlinkElement(finalOutput,
                                                     input.data[row][parameter]);
              index++;
            }
            break;
          }
        }
      }
      else if (input.data[row] == "Configuration Set") {
        finalOutput.bytes.push(DOWNLINK_MSG_TYPE_SET_SENSOR_CONFIG);
        index++;
        sorted_input = sortAscending(input);
        for (row in sorted_input.data) {
          if (row != "Message Type") {
            element = {name: row, value : sorted_input.data[row]};
            updatedOutput = encodeSetDownlinkElement(finalOutput,
                                                     index,
                                                     element);
            index = updatedOutput.updatedIndex;
            finalOutput = updatedOutput.updatedInput;
          }
        }
        break;
      }
      else
      {
        finalOutput.errors.push(
          "Unknown command type requested for encoding.");
        break;
      }
    }
  }
  if (finalOutput.errors.length) {
    finalOutput.bytes = []
  }
  return(finalOutput);
}

function encodeSetDownlinkElement(input, index, element) {

  var output = {updatedIndex : index, updatedOutput : {}};
  var elementFound = false;

  for (var row in parameterTableEncodeNS1) {

    if (element.name === row) {
      elementFound = true;
      if (parameterTableEncodeNS1[row].access.indexOf("w") !== -1) {
      
        input.bytes.push(parameterTableEncodeNS1[row].tag & (0xFF));
        index++;
        output = parameterTableEncodeNS1[row].encoder(element,
                                                      parameterTableEncodeNS1[row],
                                                      index);
        if (output.errors !== "") {
          input.errors.push(output.errors);
        }
        else {
          input.bytes = input.bytes.concat(output.encodedValue);
        }
        break;
      }
      else {
        input.errors.push("Can't write read-only parameter " +
                           element.name + ".");
        break;
      }
    }
  }
  if (elementFound === false) {
    input.errors.push("Parameter " + element.name + " cannot be found.");
  }
  output.updatedInput = input;
  return(output);
}

function encodeGetDownlinkElement(input, elementName) {

  var elementFound = false;

  for (var row in parameterTableEncodeNS1) {

    if (elementName === row) {
      if (parameterTableEncodeNS1[row].access.indexOf("r") !== -1) {
        input.bytes.push(parameterTableEncodeNS1[row].tag & (0xFF));
      }
      else
      {
        input.errors.push("Can't read write-only parameter " +
                          elementName + ".");
      }
      elementFound = true;
      break;
    }
  }
  if (elementFound === false) {
    input.errors.push("Unknown parameter " + elementName + ".");
  }
  return(input);
}

function encodeUInt8(element, _elementDetails, index) {

  var output = {"encodedValue" : [], "updatedIndex" : index, "errors" : ""};

  if ((element.value >= _elementDetails.min) &&
      (element.value <= _elementDetails.max)) {
    output.encodedValue.push(element.value & 0xFF);
    output.updatedIndex = index + DOWNLINK_MSG_TYPE_ELEMENT_SIZE_UINT8;
  }
  else {
    output.errors = ("Value out of range for " + element.name + ".");
  }
  return(output);
}

function encodeUInt16(element, _elementDetails, index) {

  var output = {"encodedValue" : [], "updatedIndex" : index, "errors" : ""};

  if ((element.value >= _elementDetails.min) &&
      (element.value <= _elementDetails.max)) {
    output.encodedValue.push((element.value >> 8) & 0xFF);
    output.encodedValue.push(element.value & 0xFF);
    output.updatedIndex = index + DOWNLINK_MSG_TYPE_ELEMENT_SIZE_UINT16 ;
  }
  else {
    output.errors = ("Value out of range for " + element.name + ".");
  }
  return(output);
}

function encodeEnum(element, _elementDetails, index) {

  var output = {"encodedValue" : [], "updatedIndex" : index, "errors" : ""};
  var enumEncoded = false;

  for (var elementEnumMember in _elementDetails.enumName) {
    if (element.value == elementEnumMember) {
      output.encodedValue.push(_elementDetails.
        enumName[elementEnumMember] & 0xFF);
      output.updatedIndex = index + DOWNLINK_MSG_TYPE_ELEMENT_SIZE_ENUM;
      enumEncoded = true;
      break;
    }
  }
  if (enumEncoded === false) {
    output.errors = ("Can't encode enum value " + element.value + ".");
  }
  return(output);
}

function encodeUTCSeconds(element, _elementDetails, index) {

  var output = {"encodedValue" : [], "updatedIndex" : index, "errors" : ""};
  var date = new Date(element.value);
  var utcSeconds = Math.floor(date.getTime() / 1000);

  output.encodedValue.push((utcSeconds >> 24) & 0xFF);
  output.encodedValue.push((utcSeconds >> 16) & 0xFF);
  output.encodedValue.push((utcSeconds >> 8) & 0xFF);
  output.encodedValue.push(utcSeconds & 0xFF);
  output.updatedIndex = index + DOWNLINK_MSG_TYPE_ELEMENT_SIZE_UTC_SECONDS;
  return(output);
}

function encodeCharString(element, _elementDetails, index) {

  var output = {"encodedValue" : [], "updatedIndex" : index, "errors" : ""};

  if ((element.value.length >= _elementDetails.min) &&
      (element.value.length <= _elementDetails.max)) {

    for (var i = 0; i < element.value.length; i++) {
      output.encodedValue.push(element.value.charCodeAt(i));
    }
    output.encodedValue.push(0x0);
    output.updatedIndex = index + output.encodedValue.length;
  }
  else {
    output.errors = ("Too many or too few characters for " + element.name + ".");
  }
  return(output);
}

function encodeAction(element, _elementDetails, index) {

  var output = {"encodedValue" : [], "updatedIndex" : index, "errors" : ""};
  return(output);
}

function encodeFloat(element, _elementDetails, index) {

  var output = {"encodedValue" : [], "updatedIndex" : index, "errors" : ""};
  var floatBuffer = new ArrayBuffer(DOWNLINK_MSG_TYPE_ELEMENT_SIZE_FLOAT);
  var floatView = new DataView(floatBuffer);
  var floatIndex;

  floatView.setFloat32(0, element.value, false);
  for (floatIndex = 0;
       floatIndex < DOWNLINK_MSG_TYPE_ELEMENT_SIZE_FLOAT; floatIndex++) {
    output.encodedValue.push(floatView.getUint8(floatIndex));
  }
  output.updatedIndex = index + DOWNLINK_MSG_TYPE_ELEMENT_SIZE_FLOAT;
  return(output);
}

function sortAscending(input) {

  var output = {};

  const sortedEntries = Object.entries(input.data).sort(([a], [b]) =>
    a.toLowerCase().localeCompare(b.toLowerCase()));
  const sortedData = {};
  for (const [key, value] of sortedEntries) {
    sortedData[key] = value;
  }
  output.data = sortedData;

  return(output);
}

const DOWNLINK_DECODE_API_VERSION_MAJOR = 0;
const DOWNLINK_DECODE_API_VERSION_MINOR = 1;

function decodeDownlink(input) {

  var output = {};
  var finalOutput = {};

  if (input.bytes[0] == DOWNLINK_MSG_TYPE_GET_SENSOR_CONFIG) {
    output = decodeGetSensorDownlink(input.bytes);
  }
  else if (input.bytes[0] == DOWNLINK_MSG_TYPE_SET_SENSOR_CONFIG) {
    output = decodeSetSensorDownlink(input.bytes);
  }
  finalOutput = Object.assign({"data" : output}, finalOutput);
  finalOutput = Object.assign({"warnings" : []}, finalOutput);
  finalOutput = Object.assign({"errors" : []}, finalOutput);
  return(finalOutput);
}

function decodeGetSensorDownlink(input) {

  var output = { "Message Type" : "Configuration Get", "Parameters" : [] };
  var index = 1;
  
  while (index < input.length) {
    for (var row in parameterTableDecodeNS1) {
      if (row == input[index]) {
        output.Parameters.push(parameterTableDecodeNS1[row].name);
        index++;
        break;
      }
    }
  }
  return(output);
}

function decodeSetSensorDownlink(input) {

  var output = { "Message Type" : "Configuration Set" };
  var index = 1;
  var elementOutput;

  while (index < input.length)
  {
    for (var row in parameterTableDecodeNS1) {
      if (row == input[index]) {
        elementOutput = parameterTableDecodeNS1[row].decoder(
                                                input,
                                                output,
                                                index,
                                                parameterTableDecodeNS1[row]
                                               );
        break;
      }
    }
    output = elementOutput.updatedInput;
    index += elementOutput.bytesProcessed;
  }
  return(output);
}
