/*
 * range-extender.js
 *
 * Modification History:
 * Date         Version     Modified By     Description
 * 2020-12-16   1.0         MR              Initial creation
 * 2021-02-17   1.1         MR              synchonized --> synchronized
 * 2021-02-26   1.2         MR              payload length check and right start of payload of one WMBus packet
 */

function decodeUplink(input) {
    var port = input.fPort;
    var bytes = input.bytes;
    var decoded = Decoder(bytes, port);
    var returnObject = {};
    returnObject.data = decoded;
    if ((port & PORT_SEGMENTATION_BIT) == PORT_SEGMENTATION_BIT)
    {
        //segmented payload
        returnObject.warnings = [];
        returnObject.warnings.push(SEGMENTED_WARNING);
    }
    return returnObject;
}

function encodeDownlink(input) {
   return {
        // Decoded data
        data: {},
        // Warnings
        warnings: "Encoding of downlink is not supported"
      };
}

function decodeDownlink(input) {
  return {
          // Decoded data
          data: {},
          // Warnings
          warnings: "Decoding of downlink is not supported"
        };
}

function Decoder(bytes, port) {
  return startRangeExtenderIMSTDecoder(bytes, port);
}

//ports of none segmented payload
var PORT_SEGMENTATION_BIT = 0x40;
var STATUS_PORT = 0x03;
var STATUS_PORT_SEGMENTED = PORT_SEGMENTATION_BIT | STATUS_PORT;
var WMBUS_VALUE_PORT = 0x04;
var WMBUS_VALUE_PORT_SEGMENTED = PORT_SEGMENTATION_BIT | WMBUS_VALUE_PORT;
var SEGMENTED_WARNING = "WARNING: decoding of segmented payload - values can be incorrect or incomplete";

function startRangeExtenderIMSTDecoder (bytes, port)
{
    //create object to fill with indicated data fields
    var retObject = {
        raw: bytes,
        port: port,
        message: "data on this port are not intended for decoding"
    };

    switch (port)
    {
        case WMBUS_VALUE_PORT_SEGMENTED:
            //remove segmentation byte
            bytes = bytes.slice(1);
            retObject = decodeWMBusPayload(bytes);
            break;
        case STATUS_PORT_SEGMENTED:
            //remove segmentation byte
            bytes = bytes.slice(1);
        case STATUS_PORT:
            //upload port for status data
            retObject = decodeStatusPayload(bytes);
            break;
    }
    return retObject;
}

function decodeWMBusPayload(payload)
{
    //indicator for further decoding
    var further = true;
    //position in bytes buffer
    var startPos = 0;
    //position in bytes buffer
    var endPos = 0;
    //create empty object to fill with wmbus data
    var WMBusObject = {
       values: []
    };

    //go through the payload bytes, but not beyond the end
    while (further)
    {
        //at least 15 bytes are needed to identify timestamp and one wmbus packet
        if (payload.length > (startPos + 15))
        {
            //object for one wmbus packet
            var WMBusResults = {};
            //4 bytes for time
            endPos = startPos + 4;
            //get bytes for time value from payload
            var timeBuffer = payload.slice(startPos, endPos);

            //start of length field
            startPos = endPos;
            //length field is only one byte
            endPos = startPos;
            //get length of wmbus data
            var length = payload[startPos];

            //at least 10 bytes are needed to identify one wmbus packet
            if (length >= 10)
            {
                //start position of wmbus data
                //skip control field
                startPos = endPos + 1;
                //end position of wmbus data
                endPos = startPos + length;
                if (payload.length >= endPos)
                {
                    //get bytes of one wmbus packet
                    var oneWMBusPacket = payload.slice(startPos, endPos);
                    //Control field of one wmbus packet
                    var ctrlField = oneWMBusPacket[0];
                    //get bytes for man ID of one wmbus packet
                    var manIDBuffer = oneWMBusPacket.slice(1, 3);
                    //get bytes for device ID of one wmbus packet
                    var deviceIDBuffer = oneWMBusPacket.slice(3, 7);
                    //version byte of one wmbus packet
                    var version = oneWMBusPacket[7];
                    //type byte of one wmbus packet
                    var type = oneWMBusPacket[8];
                    //get bytes for wmbus payload of one wmbus packet
                    var dataBuffer = oneWMBusPacket.slice(9);

                    //MSB buffer to value | >>> 0 for UINT32
                    var epochSeconds = (timeBuffer[0] | timeBuffer[1] << 8 | timeBuffer[2] << 16 | timeBuffer[3] << 24) >>> 0;
                    //date object in milliseconds
                    var time = new Date(epochSeconds * 1000);
                    //milliseconds since the Unix Epoch.
                    WMBusResults.Time = time.toUTCString();

                    //control field in hex string representation
                    WMBusResults.CTRLField = "0x" + ("0" + ctrlField.toString(16)).slice(-2);
                    //man id in hex string representation
                    var manID = buffer_to_hex_string(manIDBuffer);
                    WMBusResults.ManID = manID;
                    //device id in hex string representation
                    var deviceID = buffer_to_hex_string(deviceIDBuffer);
                    WMBusResults.DeviceID = deviceID;
                    //version in hex string representation
                    WMBusResults.Version = "0x" + ("0" + version.toString(16)).slice(-2);
                    //type in hex string representation
                    WMBusResults.Type = "0x" + ("0" + type.toString(16)).slice(-2);
                    //wmbus payload in hex string representation
                    var data = buffer_to_hex_string(dataBuffer);
                    WMBusResults.Data = data;

                    //start position of next wmbus data
                    startPos = endPos;

                    //add one wmbus packet to array
                    WMBusObject.values.push(WMBusResults);
                }
                else
                    //no more data available
                    further = false;
            }
            else
                //no more data available
                further = false;
        }
        else
            //no more data available
            further = false;
    }
    return WMBusObject;
}

/****
go through the bytes buffer starting and interpret byte to ascii value
@param:     byte buffer of numbers
@return:    convert a numbers into string, '' if a control characters was found
****/
function buffer_to_hex_string (hexBuffer)
{
	var str = '';
	for (var n = 0; n < hexBuffer.length; n++) {
		str += ("0" + hexBuffer[n].toString(16)).slice(-2);
		if (n + 1 < hexBuffer.length)
		    str += "-";
	}
	return str;
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

//individual bits of the status bytes
var LORAWAN_ACTIVATED_STATE_STATUS_BIT_MASK = 1 << 0;
var NETWORK_TIME_SYNCHRONIZATION_STATE_STATUS_BIT_MASK = 1 << 1;
var SYSTEM_TIME_SYNCHRONIZATION_STATE_STATUS_BIT_MASK = 1 << 2;
var LORAWAN_CONFIGURATION_STATE_STATUS_BIT_MASK = 1 << 4;
var WMBUS_FILTER_LIST_CONFIGURATION_STATE_STATUS_BIT_MASK = 1 << 5;
var CALENDAR_EVENT_LIST_CONFIGURATION_STATE_STATUS_BIT_MASK = 1 << 6;
var FLASH_MEMORY_FULL_STATE_STATUS_BIT_MASK = 1 << 7;
var FLASH_MEMORY_CRC_ERROR_STATE_STATUS_BIT_MASK = 1 << 8;

//Key Names
var STATUS_PRE_STRING = "Status_";
var STATUS_TIME_NAME = STATUS_PRE_STRING + "Time";
var STATUS_FIRMWARE_VERSION_NAME = STATUS_PRE_STRING + "Firmware_Version";
var STATUS_LAST_SYNC_TIME_NAME = STATUS_PRE_STRING + "Last_Sync_Time";
var STATUS_RESET_COUNTER_NAME = STATUS_PRE_STRING + "Reset_Counter";
var STATUS_LORAWAN_STATUS_NAME = STATUS_PRE_STRING + "LoRaWAN_Activation_State";
var STATUS_NETWORK_TIME_STATUS_NAME = STATUS_PRE_STRING + "Network_Time_State";
var STATUS_SYSTEM_TIME_STATUS_NAME = STATUS_PRE_STRING + "System_Time_State";
var STATUS_LORAWAN_CONFIGURATION_STATUS_NAME = STATUS_PRE_STRING + "LoRaWAN_Configuration_State";
var STATUS_CALENDAR_EVENT_STATUS_NAME = STATUS_PRE_STRING + "Calendar_Event_List_State";
var STATUS_OBIS_ID_FILTER_LIST_STATUS_NAME = STATUS_PRE_STRING + "OBIS_ID_Filter_List_State";
var STATUS_WMBUS_PACKAGES_RECEIVED_COUNTER_NAME = STATUS_PRE_STRING + "WMBusPackagesReceived";
var STATUS_WMBUS_PACKAGES_SAVED_COUNTER_NAME = STATUS_PRE_STRING + "WMBusPackagesSaved";
var STATUS_WMBUS_PACKAGES_SENT_COUNTER_NAME = STATUS_PRE_STRING + "WMBusPackagesSent";

/****
go through the payload bytes and interpret individual bytes
@param:     uploaded payload bytes of status (without segmentation byte if preivously attached)
@return:    object of interpreted status information
****/
function decodeStatusPayload (statusData)
{
    //create empty object to fill with indicated status fields
    var statusResults = {};

    //iO881A System Time ( from embedded RTC ) bytes buffer
    var systemTimeBuffer = statusData.slice(SYSTEM_TIME_FIELD_POS, SYSTEM_TIME_FIELD_POS + SYSTEM_TIME_FIELD_SIZE);
    //Firmware Version - minor version
    var firmwareVersionMinor =  statusData[FIRMWARE_VERSION_MINOR_POS];
    //Firmware Version - major version
    var firmwareVersionMajor =  statusData[FIRMWARE_VERSION_MAJOR_POS];
    //Time of last Synchronization bytes buffer
    var lastSyncTimeBuffer = statusData.slice(LAST_SYNC_TIME_FIELD_POS, LAST_SYNC_TIME_FIELD_POS + LAST_SYNC_TIME_FIELD_SIZE);
    //Reset Counter bytes buffer
    var resetCounterBuffer = statusData.slice(RESET_COUNTER_FIELD_POS, RESET_COUNTER_FIELD_POS + RESET_COUNTER_FIELD_SIZE);
    //Status / Error bytes buffer
    var statusBitsBuffer =  statusData.slice(STATUS_BITS_FIELD_POS, STATUS_BITS_FIELD_POS + STATUS_BITS_FIELD_SIZE);
    //WMBus packages received bytes buffer
    var rxCounterBuffer = statusData.slice(RX_COUNTER_FIELD_POS, RX_COUNTER_FIELD_POS + RX_COUNTER_FIELD_SIZE);
    //WMBus packages saved bytes buffer
    var sdCounterBuffer = statusData.slice(SD_COUNTER_FIELD_POS, SD_COUNTER_FIELD_POS + SD_COUNTER_FIELD_SIZE);
    //WMBus packages sent bytes buffer
    var txCounterBuffer = statusData.slice(TX_COUNTER_FIELD_POS, TX_COUNTER_FIELD_POS + TX_COUNTER_FIELD_SIZE);

    //convert system time buffer to seconds | >>> 0 for UINT32
    var epochSeconds = (systemTimeBuffer[0] | systemTimeBuffer[1] << 8 | systemTimeBuffer[2] << 16 | systemTimeBuffer[3] << 24) >>> 0;
    //create date object of system time milliseconds
    var systemTime = new Date(epochSeconds * 1000);

    //convert last sync time buffer to seconds | >>> 0 for UINT32
    var epochSeconds = (lastSyncTimeBuffer[0] | lastSyncTimeBuffer[1] << 8 | lastSyncTimeBuffer[2] << 16 | lastSyncTimeBuffer[3] << 24) >>> 0;
    //create date object of last sync time milliseconds
    var lastSyncTime = new Date(epochSeconds * 1000);

    //convert reset Counter bytes buffer to number | >>> 0 for UINT32
    var resetCounter = (resetCounterBuffer[0] | resetCounterBuffer[1] << 8 | resetCounterBuffer[2] << 16 | resetCounterBuffer[3] << 24) >>> 0;
    //convert status / error bytes buffer to number
    var statusBits = statusBitsBuffer[0] | statusBitsBuffer[1] << 8;
    //convert WMBus packages received bytes buffer to number | >>> 0 for UINT32
    var rxCounter = (rxCounterBuffer[0] | rxCounterBuffer[1] << 8 | rxCounterBuffer[2] << 16 | rxCounterBuffer[3] << 24) >>> 0;
    //convert WMBus packages saved bytes buffer to number | >>> 0 for UINT32
    var sdCounter = (sdCounterBuffer[0] | sdCounterBuffer[1] << 8 | sdCounterBuffer[2] << 16 | sdCounterBuffer[3] << 24) >>> 0;
    //convert WMBus packages sent bytes buffer to number | >>> 0 for UINT32
    var txCounter = (txCounterBuffer[0] | txCounterBuffer[1] << 8 | txCounterBuffer[2] << 16 | txCounterBuffer[3] << 24) >>> 0;

    //add system time to status result object as string
    statusResults["Time"] = systemTime.toUTCString();
    //add firmware version string to status result object, consisting of major and minor version
    statusResults["FirmwareVersion"] = firmwareVersionMajor + "." + firmwareVersionMinor;
    //add last sync time to status result object as string
    statusResults["LastSyncTime"] = lastSyncTime.toUTCString();
    //add reset counter number to status result object
    statusResults["ResetCounter"] = resetCounter;

    //analyze status / error bytes and add accordingly named info to to status result object
    //Bit 0: LoRaWAN® Activation State
    statusResults = analyzeBitsToResultString(statusResults, statusBits, LORAWAN_ACTIVATED_STATE_STATUS_BIT_MASK, "LoRaWAN", "not activated", "activated");
    //Bit 1: Network Time Synchronization State
    statusResults = analyzeBitsToResultString(statusResults, statusBits, NETWORK_TIME_SYNCHRONIZATION_STATE_STATUS_BIT_MASK, "NetworkTime", "not synchronized", "synchronized");
    //Bit 2: System Time Synchronization State
    statusResults = analyzeBitsToResultString(statusResults, statusBits, SYSTEM_TIME_SYNCHRONIZATION_STATE_STATUS_BIT_MASK, "SystemTimeBit", "not synchronized", "synchronized");
    //Bit 4: LoRaWAN Configuration State
    statusResults = analyzeBitsToResultString(statusResults, statusBits, SYSTEM_TIME_SYNCHRONIZATION_STATE_STATUS_BIT_MASK, "LoRaWANConfiguration", "not available", "available");
    //Bit 5: Wireless M-Bus Address Filter List Configuration State
    statusResults = analyzeBitsToResultString(statusResults, statusBits, WMBUS_FILTER_LIST_CONFIGURATION_STATE_STATUS_BIT_MASK, "WMBusFilterList", "is empty", "contains at least one item");
    //Bit 6: Calendar Event List Configuration State
    statusResults = analyzeBitsToResultString(statusResults, statusBits, CALENDAR_EVENT_LIST_CONFIGURATION_STATE_STATUS_BIT_MASK, "CalendarEventList", "is empty", "contains at least one item");
    //Bit 8: Flash Memory Full State
    statusResults = analyzeBitsToResultString(statusResults, statusBits, FLASH_MEMORY_FULL_STATE_STATUS_BIT_MASK, "FlashMemoryFullState",  "A flash memory full condition has been detected during capture phase", "no error");
    //Bit 9: Flash Memory CRC Error State
    statusResults = analyzeBitsToResultString(statusResults, statusBits, FLASH_MEMORY_CRC_ERROR_STATE_STATUS_BIT_MASK, "FlashMemoryCRCErrorState", "A file CRC error has been detected during read & upload operation", "no error");

    //add reader counters to status result object as string
    statusResults["WMBusPackagesReceived"] = rxCounter;
    statusResults["WMBusPackagesSaved"] = sdCounter;
    statusResults["WMBusPackagesSent"] = txCounter;

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
function analyzeBitsToResultString (results, bits, mask, propertyName, setString, notSetString)
{
    if ((bits & mask) == mask)
        //specified bit is set
        results[propertyName] = setString;
    else
        //specified bit is not set
        results[propertyName] = notSetString;
    //return result object with added information
    return results;
}

function modulo(a, b) {
        return a - Math.floor(a/b)*b;
    }
function ToUint32(x) {
    return modulo(x, Math.pow(2, 32));

}

/*****
decode status end
******/
