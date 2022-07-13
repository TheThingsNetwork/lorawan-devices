/*
 * range-extender.js
 *
 * Modification History:
 * Date         Version     Modified By     Description
 * 2020-12-16   1.0         MR              Initial creation
 * 2021-02-17   1.1         MR              synchonized --> synchronized
 * 2021-02-26   1.2         MR              payload length check and right start of payload of one WMBus packet
 * 2021-08-03   1.3         MR              status extended with system voltage and firmware type for firmware 1.1ff
 *                                          support port 0x4B == 75 with RSSI values for WM-BUS data for firmware 1.1ff
 * 2021-10-26   1.4        MR               WmBus data interpretation removed - only status available
 *                                          fix for detecting flash errors bits
 */

function decodeUplink(input) {
  var port = input.fPort;
  var bytes = input.bytes;
  var decoded = Decoder(bytes, port);
  var returnObject = {};
  returnObject.data = decoded;
  return returnObject;
}

function encodeDownlink(input) {
  return {
    // Decoded data
    data: {},
    // Warnings
    warnings: 'Encoding of downlink is not supported',
  };
}

function decodeDownlink(input) {
  return {
    // Decoded data
    data: {},
    // Warnings
    warnings: 'Decoding of downlink is not supported',
  };
}

function Decoder(bytes, port) {
  return startRangeExtenderIMSTDecoder(bytes, port);
}

//ports of none segmented payload
var STATUS_PORT = 0x03;

function startRangeExtenderIMSTDecoder(bytes, port) {
  //create object to fill with indicated data fields
  var retObject = {};

  switch (port) {
    case STATUS_PORT:
      //upload port for status data
      retObject = decodeStatusPayload(bytes);
      break;
  }
  return retObject;
}

/*****
decode status start
******/
var SYSTEM_TIME_FIELD_POS = 0;
var SYSTEM_TIME_FIELD_SIZE = 4;
var FIRMWARE_VERSION_MINOR_POS = 4;
var FIRMWARE_VERSION_MAJOR_POS = 5;
var LAST_SYNC_TIME_FIELD_POS = 6;
var LAST_SYNC_TIME_FIELD_SIZE = 4;
var RESET_COUNTER_FIELD_POS = 10;
var RESET_COUNTER_FIELD_SIZE = 4;
var STATUS_BITS_FIELD_POS = 14;
var STATUS_BITS_FIELD_SIZE = 2;
var RX_COUNTER_FIELD_POS = 16;
var RX_COUNTER_FIELD_SIZE = 4;
var SD_COUNTER_FIELD_POS = 20;
var SD_COUNTER_FIELD_SIZE = 4;
var TX_COUNTER_FIELD_POS = 24;
var TX_COUNTER_FIELD_SIZE = 4;
var SYSTEM_VOLTAGE_FIELD_POS = 28;
var SYSTEM_VOLTAGE_FIELD_SIZE = 2;
var FIRMWARE_TYPE_FIELD_POS = 30;
var FIRMWARE_TYPE_FIELD_SIZE = 1;

var STATUS_SIZE_1_0 = TX_COUNTER_FIELD_POS + TX_COUNTER_FIELD_SIZE;
var STATUS_SIZE_1_1 = FIRMWARE_TYPE_FIELD_POS + FIRMWARE_TYPE_FIELD_SIZE;

//individual bits of the status bytes
var LORAWAN_ACTIVATED_STATE_STATUS_BIT_MASK = 1 << 0;
var NETWORK_TIME_SYNCHRONIZATION_STATE_STATUS_BIT_MASK = 1 << 1;
var SYSTEM_TIME_SYNCHRONIZATION_STATE_STATUS_BIT_MASK = 1 << 2;
var LORAWAN_CONFIGURATION_STATE_STATUS_BIT_MASK = 1 << 4;
var WMBUS_FILTER_LIST_CONFIGURATION_STATE_STATUS_BIT_MASK = 1 << 5;
var CALENDAR_EVENT_LIST_CONFIGURATION_STATE_STATUS_BIT_MASK = 1 << 6;
var FLASH_MEMORY_FULL_STATE_STATUS_BIT_MASK = 1 << 8;
var FLASH_MEMORY_CRC_ERROR_STATE_STATUS_BIT_MASK = 1 << 9;

//lookup table for uploaded integer value to firmware type
var FirmwareTypeMap = {
  0: 'Release',
  1: 'Field Test Beta Version',
  2: 'Internal Debug Version',
};

/****
go through the payload bytes and interpret individual bytes
@param:     uploaded payload bytes of status (without segmentation byte if preivously attached)
@return:    object of interpreted status information
****/
function decodeStatusPayload(statusData) {
  //create empty object to fill with indicated status fields
  var statusResults = {};

  //go through the payload bytes, but not beyond the end
  if (statusData.length >= STATUS_SIZE_1_0) {
    //create empty object to fill with indicated status fields
    var statusResults = {};

    //iO881A System Time ( from embedded RTC ) bytes buffer
    var systemTimeBuffer = statusData.slice(SYSTEM_TIME_FIELD_POS, SYSTEM_TIME_FIELD_POS + SYSTEM_TIME_FIELD_SIZE);
    //Firmware Version - minor version
    var firmwareVersionMinor = statusData[FIRMWARE_VERSION_MINOR_POS];
    //Firmware Version - major version
    var firmwareVersionMajor = statusData[FIRMWARE_VERSION_MAJOR_POS];
    //Time of last Synchronization bytes buffer
    var lastSyncTimeBuffer = statusData.slice(LAST_SYNC_TIME_FIELD_POS, LAST_SYNC_TIME_FIELD_POS + LAST_SYNC_TIME_FIELD_SIZE);
    //Reset Counter bytes buffer
    var resetCounterBuffer = statusData.slice(RESET_COUNTER_FIELD_POS, RESET_COUNTER_FIELD_POS + RESET_COUNTER_FIELD_SIZE);
    //Status / Error bytes buffer
    var statusBitsBuffer = statusData.slice(STATUS_BITS_FIELD_POS, STATUS_BITS_FIELD_POS + STATUS_BITS_FIELD_SIZE);
    //WMBus packages received bytes buffer
    var rxCounterBuffer = statusData.slice(RX_COUNTER_FIELD_POS, RX_COUNTER_FIELD_POS + RX_COUNTER_FIELD_SIZE);
    //WMBus packages saved bytes buffer
    var sdCounterBuffer = statusData.slice(SD_COUNTER_FIELD_POS, SD_COUNTER_FIELD_POS + SD_COUNTER_FIELD_SIZE);
    //WMBus packages sent bytes buffer
    var txCounterBuffer = statusData.slice(TX_COUNTER_FIELD_POS, TX_COUNTER_FIELD_POS + TX_COUNTER_FIELD_SIZE);

    //convert system time buffer to seconds | >>> 0 for UINT32
    var epochSeconds = (systemTimeBuffer[0] | (systemTimeBuffer[1] << 8) | (systemTimeBuffer[2] << 16) | (systemTimeBuffer[3] << 24)) >>> 0;
    //create date object of system time milliseconds
    var systemTime = new Date(epochSeconds * 1000);

    //convert last sync time buffer to seconds | >>> 0 for UINT32
    var epochSeconds = (lastSyncTimeBuffer[0] | (lastSyncTimeBuffer[1] << 8) | (lastSyncTimeBuffer[2] << 16) | (lastSyncTimeBuffer[3] << 24)) >>> 0;
    //create date object of last sync time milliseconds
    var lastSyncTime = new Date(epochSeconds * 1000);

    //convert reset Counter bytes buffer to number | >>> 0 for UINT32
    var resetCounter = (resetCounterBuffer[0] | (resetCounterBuffer[1] << 8) | (resetCounterBuffer[2] << 16) | (resetCounterBuffer[3] << 24)) >>> 0;
    //convert status / error bytes buffer to number
    var statusBits = statusBitsBuffer[0] | (statusBitsBuffer[1] << 8);
    //convert WMBus packages received bytes buffer to number | >>> 0 for UINT32
    var rxCounter = (rxCounterBuffer[0] | (rxCounterBuffer[1] << 8) | (rxCounterBuffer[2] << 16) | (rxCounterBuffer[3] << 24)) >>> 0;
    //convert WMBus packages saved bytes buffer to number | >>> 0 for UINT32
    var sdCounter = (sdCounterBuffer[0] | (sdCounterBuffer[1] << 8) | (sdCounterBuffer[2] << 16) | (sdCounterBuffer[3] << 24)) >>> 0;
    //convert WMBus packages sent bytes buffer to number | >>> 0 for UINT32
    var txCounter = (txCounterBuffer[0] | (txCounterBuffer[1] << 8) | (txCounterBuffer[2] << 16) | (txCounterBuffer[3] << 24)) >>> 0;

    //add system time to status result object as string
    statusResults['Time'] = systemTime.toUTCString();
    //add firmware version string to status result object, consisting of major and minor version
    statusResults['FirmwareVersion'] = firmwareVersionMajor + '.' + firmwareVersionMinor;
    //add last sync time to status result object as string
    statusResults['LastSyncTime'] = lastSyncTime.toUTCString();
    //add reset counter number to status result object
    statusResults['ResetCounter'] = resetCounter;

    //analyze status / error bytes and add accordingly named info to to status result object
    //Bit 0: LoRaWAN® Activation State
    statusResults = analyzeBitsToResultString(statusResults, statusBits, LORAWAN_ACTIVATED_STATE_STATUS_BIT_MASK, 'LoRaWAN', 'not activated', 'activated');
    //Bit 1: Network Time Synchronization State
    statusResults = analyzeBitsToResultString(statusResults, statusBits, NETWORK_TIME_SYNCHRONIZATION_STATE_STATUS_BIT_MASK, 'NetworkTime', 'not synchronized', 'synchronized');
    //Bit 2: System Time Synchronization State
    statusResults = analyzeBitsToResultString(statusResults, statusBits, SYSTEM_TIME_SYNCHRONIZATION_STATE_STATUS_BIT_MASK, 'SystemTimeBit', 'not synchronized', 'synchronized');
    //Bit 4: LoRaWAN Configuration State
    statusResults = analyzeBitsToResultString(statusResults, statusBits, SYSTEM_TIME_SYNCHRONIZATION_STATE_STATUS_BIT_MASK, 'LoRaWANConfiguration', 'not available', 'available');
    //Bit 5: Wireless M-Bus Address Filter List Configuration State
    statusResults = analyzeBitsToResultString(statusResults, statusBits, WMBUS_FILTER_LIST_CONFIGURATION_STATE_STATUS_BIT_MASK, 'WMBusFilterList', 'is empty', 'contains at least one item');
    //Bit 6: Calendar Event List Configuration State
    statusResults = analyzeBitsToResultString(statusResults, statusBits, CALENDAR_EVENT_LIST_CONFIGURATION_STATE_STATUS_BIT_MASK, 'CalendarEventList', 'is empty', 'contains at least one item');
    //Bit 8: Flash Memory Full State
    statusResults = analyzeBitsToResultString(
      statusResults,
      statusBits,
      FLASH_MEMORY_FULL_STATE_STATUS_BIT_MASK,
      'FlashMemoryFullState',
      'A flash memory full condition has been detected during capture phase',
      'no error'
    );
    //Bit 9: Flash Memory CRC Error State
    statusResults = analyzeBitsToResultString(
      statusResults,
      statusBits,
      FLASH_MEMORY_CRC_ERROR_STATE_STATUS_BIT_MASK,
      'FlashMemoryCRCErrorState',
      'A file CRC error has been detected during read & upload operation',
      'no error'
    );

    //add reader counters to status result object as string
    statusResults['WMBusPackagesReceived'] = rxCounter;
    statusResults['WMBusPackagesSaved'] = sdCounter;
    statusResults['WMBusPackagesSent'] = txCounter;

    //system voltage added in status from version 1.1
    if (statusData.length >= STATUS_SIZE_1_1) {
      //system voltage bytes buffer
      var systemVoltageBuffer = statusData.slice(SYSTEM_VOLTAGE_FIELD_POS, SYSTEM_VOLTAGE_FIELD_POS + SYSTEM_VOLTAGE_FIELD_SIZE);
      //convert system voltage bytes buffer to number | >>> 0 for UINT16
      var systemVoltage = (systemVoltageBuffer[0] | (systemVoltageBuffer[1] << 8)) >>> 0;
      //add system voltage to status result object as string
      statusResults['SystemVoltage'] = systemVoltage;
      //Firmware Type
      var firmwareType = statusData[FIRMWARE_TYPE_FIELD_POS];
      //add system voltage to status result object as string
      statusResults['FirmwareType'] = resolveFirmwareType(firmwareType);
    }
  }

  return statusResults;
}

/****
analyze single bit of status / error bytes
@param:     results - object with indicated status fields
            bits - status / errors bytes for analyzing
            propertyName - name, with will be the key on adding to result object
            setString - string, which will be added as value to result object, if specified bit is set
            notSetString - string, which will be added as value to result object, if specified bit is not set
@return:    object of interpreted status information
****/
function analyzeBitsToResultString(results, bits, mask, propertyName, setString, notSetString) {
  if ((bits & mask) == mask)
    //specified bit is set
    results[propertyName] = setString;
  //specified bit is not set
  else results[propertyName] = notSetString;
  //return result object with added information
  return results;
}

/****
convert number to firmware type string
@param:     byte
@return:    string representation for firmware type
****/
function resolveFirmwareType(type) {
  //check if number is contained in lookup table
  if (FirmwareTypeMap[type])
    //return string representation for unit number
    return FirmwareTypeMap[type];
  //if not contained in lookup table return number as string
  return 'unknown';
}

function modulo(a, b) {
  return a - Math.floor(a / b) * b;
}
function ToUint32(x) {
  return modulo(x, Math.pow(2, 32));
}

/*****
decode status end
******/
