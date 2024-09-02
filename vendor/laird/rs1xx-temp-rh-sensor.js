/******************************************************************************
 * Laird Protocol TTI Payload Library
 *
 * @author Greg Leach @ Laird Connectivity
 *
 * Entry point for Temp/RH type RS1XX sensors.
 *
 * SPDX-License-Identifier: Apache-2.0
 *****************************************************************************/
/******************************************************************************
 * Types
 *****************************************************************************/
 /******************************************************************************
 * Constructor for a key value pair
 *
 * @param [in]inKey - The pair key.
 * @param [in]inValue - The pair value.
 *****************************************************************************/
function KeyValuePair(inKey, inValue){

    this.key = inKey;
    this.value = inValue;
}

 /******************************************************************************
 * Constructor for a key value pair list
 *
 * @param [in]inList - The list of key-value pairs.
 *****************************************************************************/
function KeyValuePairList(inList){

    this.list = inList;
    this.length = inList.length;
}


/******************************************************************************
 * Enums
 *****************************************************************************/

/******************************************************************************
 * Downlink Command IDs
 *****************************************************************************/
var msgTypeDLEnum = new KeyValuePairList([
    new KeyValuePair(
        "genericDataRetrieval",
        0x01),
    new KeyValuePair(
        "generateRTCDownlink",
        0x02),
    new KeyValuePair(
        "config",
        0x03),
    new KeyValuePair(
        "heaterControl",
        0x04),
    new KeyValuePair(
        "backoff",
        0x05),
    new KeyValuePair(
        "asRequestBacklogFIFO",
        0x06),
    new KeyValuePair(
        "asFormatFlash",
        0x07),
    new KeyValuePair(
        "asRequestBacklogLIFO",
        0x0A),
    new KeyValuePair(
        "asCancelBacklogRetrieval",
        0x0B),
    new KeyValuePair(
        "asSetOpenClosedConfig",
        0x0D),
    new KeyValuePair(
        "rtdConfig",
        0x0E),
    new KeyValuePair(
        "asRequestTargetedBacklogFIFO",
        0x0F),
        new KeyValuePair(
        "asRequestTargetedBacklogLIFO",
        0x10)]);

/******************************************************************************
 * Months
 *****************************************************************************/
var monthTypeEnum = new KeyValuePairList([
    new KeyValuePair(
        "January",
        1),
    new KeyValuePair(
        "February",
        2),
    new KeyValuePair(
        "March",
        3),
    new KeyValuePair(
        "April",
        4),
    new KeyValuePair(
        "May",
        5),
    new KeyValuePair(
        "June",
        6),
    new KeyValuePair(
        "July",
        7),
    new KeyValuePair(
        "August",
        8),
    new KeyValuePair(
        "September",
        9),
    new KeyValuePair(
        "October",
        10),
    new KeyValuePair(
        "November",
        11),
    new KeyValuePair(
        "December",
        12)]);

/******************************************************************************
 * Battery Type
 *****************************************************************************/
var batteryTypeEnum = new KeyValuePairList([
    new KeyValuePair(
        "Alkaline",
        1),
    new KeyValuePair(
        "Lithium",
        2)]);

/******************************************************************************
 * Open/Closed sensor Operating Mode
 *****************************************************************************/
var operatingModeEnum = new KeyValuePairList([
    new KeyValuePair(
        "Door Sensor",
        0),
    new KeyValuePair(
        "Pushbutton",
        1)]);

/******************************************************************************
 * Open/Closed sensor state
 *****************************************************************************/
var openClosedSensorStateEnum = new KeyValuePairList([
    new KeyValuePair(
        "Closed",
        0),
    new KeyValuePair(
        "Open",
        1)]);

/******************************************************************************
 * Downlink Options
 *****************************************************************************/
var downlinkOptionsEnum = new KeyValuePairList([
    new KeyValuePair(
        "None",
        0),
    new KeyValuePair(
        "Send Simple Config",
        1),
    new KeyValuePair(
        "Send Advanced Config",
        2),
    new KeyValuePair(
        "Send Firmware Version",
        3),
    new KeyValuePair(
        "Send Open Closed Config",
        4),
    new KeyValuePair(
        "Send Battery Voltage",
        5),
    new KeyValuePair(
        "Reset Sensor",
        6),
    new KeyValuePair(
        "Start Advertising",
        7),
    new KeyValuePair(
        "Send RTD Config",
        8)]);

/******************************************************************************
 * Boolean
 *****************************************************************************/
var booleanEnum = new KeyValuePairList([
    new KeyValuePair(
        "False",
        0),
    new KeyValuePair(
        "True",
        1)]);

/******************************************************************************
 * Uplink Command IDs
 *****************************************************************************/
var msgTypeULEnum = new KeyValuePairList([
    new KeyValuePair(
        "Laird_Internal_TH",
        0x01),
    new KeyValuePair(
        "Laird_Agg_TH",
        0x2),
    new KeyValuePair(
        "SendBackLogMessage",
        0x3),
    new KeyValuePair(
        "SendBackLogMessages",
        0x4),
    new KeyValuePair(
        "Laird_Simple_Config",
        0x5),
    new KeyValuePair(
        "Laird_Advanced_Config",
        0x6),
    new KeyValuePair(
        "Laird_FW_Version",
        0x7),
    new KeyValuePair(
        "Laird_Contact_Sensor_Config",
        0x8),
    new KeyValuePair(
        "Laird_Contact_Sensor",
        0x9),
    new KeyValuePair(
        "Laird_Battery_Voltage",
        0xA),
    new KeyValuePair(
        "Laird_RTD",
        0xB),
    new KeyValuePair(
        "Laird_RTD_Config",
        0xC)]);

/******************************************************************************
 * Battery Capacity
 *****************************************************************************/
var batteryCapacityEnum = new KeyValuePairList([
    new KeyValuePair(
        "0-5%",
        0),
    new KeyValuePair(
        "5-20%",
        1),
    new KeyValuePair(
        "20-40%",
        2),
    new KeyValuePair(
        "40-60%",
        3),
    new KeyValuePair(
        "60-80%",
        4),
    new KeyValuePair(
        "80-100%",
        5)]);

/******************************************************************************
 * Gets an enum value, either its encoded or decoded value depending on the
 * decode parameter
 *
 * @param enumData: The enum to access
 * @param decode: True if the decoded value is needed, false otherwise
 * @param data: The data to encode/decode
 * @return: The enum data value
 *****************************************************************************/
function getEnumValue(enumData, decode, data){

    var result;
    var index = 0;
    var itemFound = false;

    while((index < enumData.length)&&(itemFound == false)){
        if (decode){
            if (enumData.list[index].value == data){
                result = enumData.list[index].key;
                itemFound = true;
            }
        }
        else{
            if (enumData.list[index].key == data){
                result = enumData.list[index].value;
                itemFound = true;
            }
        }
        index++;
    }
    if (itemFound == false){
        if (decode){
            result = -1;
        }
        else{
            result = "Not Found";
        }
    }
    return(result);
}

/******************************************************************************
 * Bitfields
 *****************************************************************************/
/******************************************************************************
 * Open/Closed Sensor LoRa Indication Options
 *****************************************************************************/
var loraIndicationOptionsBitfield = new KeyValuePairList([
    new KeyValuePair(
        "Open",
        1),
    new KeyValuePair(
        "Closed",
        2),
    new KeyValuePair(
        "Resend",
        4),
    new KeyValuePair(
        "Cancel",
        8)]);

/******************************************************************************
 * Uplink Message Options
 *****************************************************************************/
var uplinkOptionsBitfield = new KeyValuePairList([
    new KeyValuePair(
        "Sensor request for server time",
        0x1),
    new KeyValuePair(
        "Sensor configuration error",
        0x2),
    new KeyValuePair(
        "Sensor alarm flag",
        0x4),
    new KeyValuePair(
        "Sensor reset flag",
        0x8),
    new KeyValuePair(
        "Sensor fault flag",
        0x10)]);

/******************************************************************************
 * Gets an bitfield value, either its encoded or decoded values depending on
 * the decode parameter
 *
 * @param bitfieldData: The bitfield to access
 * @param decode: True if the decoded value is needed, false otherwise
 * @param data: The data to encode/decode
 * @return: The bitfield data value
 *****************************************************************************/
function getBitfieldValue(bitfieldData, decode, data){

    var result = 0;
    var index;
    var itemFound = true;
    var itemCount = 0;
    var itemIndex = 0;

    if (decode == true){

        if (data == 0){
            result = ["None"];
        }
        else{
            result = [];
            while((data > 0)&&(itemFound == true)){
                index = 0;
                itemFound = false;
                while((itemIndex < bitfieldData.length)&&
                        (data > 0)&&
                            (itemFound == false)){
                    if ((data & bitfieldData.list[itemIndex].value) ==
                        bitfieldData.list[itemIndex].value){
                            result.push(bitfieldData.list[itemIndex].key);
                            data -= bitfieldData.list[itemIndex].value;
                            itemFound = true;
                    }
                    itemIndex++;
                }
            }
        }
    }
    else{
        while((itemCount < data.length)&&(itemFound == true)){
            index = 0;
            itemFound = false;
            while((index < bitfieldData.length) && (itemFound == false)){
                if (data[itemCount] == bitfieldData.list[index].key){
                    result += bitfieldData.list[index].value;
                    itemFound = true;
                }
                index++;
            }
            itemCount++;
        }
    }
    if (itemFound == false){
        if (decode){
            result = -1;
        }
        else{
            result = "Not Found";
        }
    }
    return(result);
}

/******************************************************************************
 * Helpers
 *****************************************************************************/

/******************************************************************************
 * Converts a INT16/UINT16 to the equivalent two byte value
 *
 * @param data: The INT16/UINT16 value.
 * @return: The resultant byte array
 *****************************************************************************/
function iUInt16ToTwoBytes(data) {

    var result = [0,0];
    var index;
    // For endianess correction
    var byteIndex = (result.length - 1);

    if (data < 0) {
        data = 65536 + data;
    }
    for (index = 0; index < result.length; index++) {
        var byte = data & 0xff;
        result [byteIndex--] = byte;
        data = (data - byte) / 256;
    }
    return (result);
}

/******************************************************************************
 * Converts an INT8 to the hexadecimal equivalent single byte value
 *
 * @param data: The INT8 value.
 * @return: The resultant hex value
 *****************************************************************************/
function int8ToByte(data) {

    var result;

    if (data < 0){
        data = 256 + data;
    }
    result = data;
    return (result);
}

/******************************************************************************
 * Converts a byte to an INT8
 *
 * @param data: The byte value.
 * @return: The resultant INT8 value
 *****************************************************************************/
function byteToInt8(data) {

    var result;

    if (data > 127){
        data = -(256 - data);
    }
    result = data;
    return (result);
}

/******************************************************************************
 * Converts downlink year item to its byte value
 *
 * @param data: The downlink year from JSON
 * @return: The resultant byte value
 *****************************************************************************/
function encodeDownlinkYear(data) {

    var result = -1;

    if ((data >= 2015)&&
        (data <= 2255)){
        result = data - 2000;
    }
    return(result);
}

/******************************************************************************
 * Converts a pair of bytes to the equivalent Int16 value
 *
 * @param stream: array of bytes.
 * @return: The resultant Int16 value
 *****************************************************************************/
function twoBytesToInt16(stream) {

    var int16Data = stream.slice(0,2);
    var int16View = new DataView(new ArrayBuffer(2));
    var int16Result;

    for (var i = 0; i < stream.length; i++) {
        if (stream[i] > 0xFF) {
            throw 'Byte value overflow!';
        }
    }

    int16Data.forEach(function (b,i) {
        int16View.setInt8(i, b);
    });
    int16Result = int16View.getInt16(0);
    return(int16Result);
}

/******************************************************************************
 * Converts a pair of bytes to the equivalent float value
 *
 * @param stream: array of bytes.
 * @return: The resultant float value
 *****************************************************************************/
function twoBytesToFloat(stream) {

    var result;
    var fractionalData = stream.slice(0,1);
    var decimalData = stream.slice(1,2);
    var fractionalView = new DataView(new ArrayBuffer(
                                1));
    var decimalView = new DataView(new ArrayBuffer(
                                1));
    var fractionalResult;
    var decimalResult;

    for (var i = 0; i < stream.length; i++) {
        if (stream[i] > 0xFF) {
            throw 'Byte value overflow!';
        }
    }

    fractionalData.forEach(function (b,i) {
        fractionalView.setUint8(i, b);
    });
    fractionalResult = fractionalView.getInt8(0);

    decimalData.forEach(function (b,i) {
        decimalView.setUint8(i, b);
    });
    decimalResult = decimalView.getInt8(0);

    result = decimalResult + (fractionalResult/100.0);
    return(result);
}

/******************************************************************************
 * Converts two pairs of bytes to the equivalent float value
 *
 * @param stream: array of bytes.
 * @return: The resultant float value
 *****************************************************************************/
function fourBytesToFloat(stream){

    var result;
    var fractionalData = stream.slice(0,
                                      2);
    var decimalData = stream.slice(2,
                                   2+
                                   2);
    var fractionalView = new DataView(new ArrayBuffer(
                                   2));
    var decimalView = new DataView(new ArrayBuffer(
                                   2));
    var fractionalResult;
    var decimalResult;

    for (var i = 0; i < stream.length; i++) {
        if (stream[i] > 0xFF) {
            throw 'Byte value overflow!';
        }
    }
    fractionalData.forEach(function (b,i) {
        fractionalView.setUint8(i, b);
    });
    fractionalResult = fractionalView.getInt16(0);

    decimalData.forEach(function (b,i) {
        decimalView.setUint8(i, b);
    });
    decimalResult = decimalView.getInt16(0);

    result = decimalResult + (fractionalResult/100.0);
    return(result);
}

/******************************************************************************
 * Converts a pair of bytes to the equivalent UInt16 value
 *
 * @param stream: array of bytes.
 * @return: The resultant UInt16 value
 *****************************************************************************/
function twoBytesToUInt16(stream) {

    var uInt16Data = stream.slice(0,2);
    var uInt16View = new DataView(new ArrayBuffer(2));
    var uInt16Result;

    for (var i = 0; i < stream.length; i++) {
        if (stream[i] > 0xFF) {
            throw 'Byte value overflow!';
        }
    }

    uInt16Data.forEach(function (b,i) {
        uInt16View.setUint8(i, b);
    });
    uInt16Result = uInt16View.getUint16(0);
    return(uInt16Result);
}

/******************************************************************************
 * Converts four bytes to the equivalent UInt32 value
 *
 * @param stream: array of bytes.
 * @return: The resultant UInt32 value
 *****************************************************************************/
function fourBytesToUInt32(stream) {

    var uInt32Data = stream.slice(0,4);
    var uInt32View = new DataView(new ArrayBuffer(4));
    var uInt32Result;

    for (var i = 0; i < stream.length; i++) {
        if (stream[i] > 0xFF) {
            throw 'Byte value overflow!';
        }
    }

    uInt32Data.forEach(function (b,i) {
        uInt32View.setUint8(i, b);
    });
    uInt32Result = uInt32View.getUint32(0);
    return(uInt32Result);
}

/******************************************************************************
 * Converts four bytes to the equivalent timestamp value
 *
 * @param stream: array of bytes.
 * @return: The resultant JSON timestamp
 *****************************************************************************/
function convertTimestampToDate(stream){

    var timeInSeconds;
    var date;
    var result;
    var month;

    // First get the time as a U32
    timeInSeconds = fourBytesToUInt32(stream);
    // Convert to milliseconds as per the JS date format
    timeInSeconds *= 1000;
    // Then add the number of milliseconds since 1970 through 2015. The RS1XX timestamp
    // starts from 01/01/2015 but the Unix timestamp from 1970.
    timeInSeconds += new Date('2015-01-01').getTime();

    // Now convert to year, hours, day, etc.
    date = new Date(timeInSeconds);
    // Get the month in textual format - an offset of 1 is needed for the
    // month due to the date using 0 based values.
    month = getEnumValue(monthTypeEnum,true,date.getUTCMonth() + 1);
    // The rest of the data can be copied across directly
    result = {
        year : date.getUTCFullYear(),
        month : month,
        day : date.getUTCDate(),
        hours : date.getUTCHours(),
        minutes : date.getUTCMinutes(),
        seconds : date.getUTCSeconds()
    };
    return(result);
}

/******************************************************************************
 * Downlink Decoder
 *****************************************************************************/

/******************************************************************************
 * Decodes a Generic Data Retrieval downlink.
 *
 * @param input: The data to decode.
 * @return: The resultant JSON message
 *****************************************************************************/
function decodeDownlinkGenericDataRetrieval(input) {

    var result = {};
    var index = 0;
    var nextResult;
    var msgType;
    var options;
    var errors = [];
    var data = {};

    // Message Type
    nextResult = getEnumValue(msgTypeDLEnum,true,
                                    input.bytes[index++]);
    if (nextResult != -1) {
        msgType = nextResult;
    }
    else{
        errors.push("Invalid message type used!");
    }
    // Options
    nextResult = getEnumValue(downlinkOptionsEnum,true,
                                    input.bytes[index++]);
    if (nextResult != -1) {
        options = nextResult;
    }
    else{
        errors.push("Invalid option type used!");
    }
    // Build message
    if (errors.length != 0){
        result = {
            errors : errors,
            errorsOccurred : "True"
        };
    }
    else{
        data = {
            msgType : msgType,
            options : options
        };
        result = {
            data : data,
            errorsOccurred : "False"
        };
    }
    return(result);
}

/******************************************************************************
 * Decodes a Generate RTC Downlink
 *
 * @param input: The data to decode.
 * @return: The resultant JSON message
 *****************************************************************************/
function decodeDownlinkGenerateRTCDownlink(input) {

    var result = {};
    var index = 0;
    var nextResult;
    var msgType;
    var options;
    var year;
    var month;
    var day;
    var hours;
    var minutes;
    var seconds;
    var errors = [];
    var data = {};

    // Message Type
    msgType = "generateRTCDownlink";
    index++;
    // Options
    nextResult = getEnumValue(downlinkOptionsEnum,true,
                                    input.bytes[index++]);
    if (nextResult != -1){
        options = nextResult;
    }
    else{
        errors.push("Invalid option type used!");
    }
    // Year
    year = input.bytes[index++] + 2000;
    // Month
    nextResult = getEnumValue(monthTypeEnum,true,
                                    input.bytes[index++]);
    if (nextResult != -1){
        month = nextResult;
    }
    else{
        errors.push("Invalid month value used!");
    }
    // Day
    day = input.bytes[index++];
    // Hours
    hours = input.bytes[index++];
    // Minutes
    minutes = input.bytes[index++];
    // Seconds
    seconds = input.bytes[index++];
    // Build message
    if (errors.length != 0){
        result = {
            errors : errors,
            errorsOccurred : "True"
        };
    }
    else{
        data = {
            msgType: msgType,
            options: options,
            year: year,
            month: month,
            day: day,
            hours: hours,
            minutes: minutes,
            seconds: seconds
        };
        result = {
            data : data,
            errorsOccurred : "False"
        };
    }
    return(result);
}

/******************************************************************************
 * Decodes a Config Downlink
 *
 * @param input: The data to decode.
 * @return: The resultant JSON message
 *****************************************************************************/
function decodeDownlinkConfig(input){

    var result = {};
    var index = 0;
    var nextResult;
    var msgType;
    var options;
    var batteryType;
    var sensorReadPeriod;
    var sensorAggregate;
    var tempAlarmsEnabled;
    var humidityAlarmsEnabled;
    var tempAlarmLimitLow;
    var tempAlarmLimitHigh;
    var humidityAlarmLimitLow;
    var humidityAlarmLimitHigh;
    var ledBle;
    var ledLora;
    var errors = [];
    var data = {};

    // Message Type
    nextResult = getEnumValue(msgTypeDLEnum,true,
                                    input.bytes[index++]);
    if (nextResult != -1){
        msgType = nextResult;
    }
    else{
        errors.push("Invalid message type used!");
    }
    // Options
    nextResult = getEnumValue(downlinkOptionsEnum,true,
                                    input.bytes[index++]);
    if (nextResult != -1){
        options = nextResult;
    }
    else {
        errors.push("Invalid option type used!");
    }
    // Battery Type
    nextResult = getEnumValue(batteryTypeEnum,true,
                                    input.bytes[index++]);
    if (nextResult != -1){
        batteryType = nextResult;
    }
    else{
        errors.push("Invalid Battery Type used!");
    }
    // Sensor Read Period
    sensorReadPeriod = twoBytesToUInt16(
                            input.bytes.slice(index,index+2));
    index += 2;
    // Sensor Aggregate
    sensorAggregate = input.bytes[index++];
    // Temperature Alarms
    nextResult = getEnumValue(booleanEnum,true,
                                    input.bytes[index++]);
    if (nextResult != -1){
        tempAlarmsEnabled = nextResult;
    }
    else{
        errors.push("Invalid Temperature Alarm Enable used!");
    }
    // Humidity Alarms
    if (input.bytes[0] ==
        0x03){

        nextResult = getEnumValue(booleanEnum,true,
                                        input.bytes[index++]);
        if (nextResult != -1){
            humidityAlarmsEnabled = nextResult;
        }
        else {
            errors.push("Invalid Humidity Alarm Enable used!");
        }
    }
    // Low Temperature Alarm Limit
    if (input.bytes[0] ==
        0x03){
        tempAlarmLimitLow = byteToInt8(input.bytes[index++]);
    }
    // High Temperature Alarm Limit
    if (input.bytes[0] ==
        0x03){
        tempAlarmLimitHigh = byteToInt8(input.bytes[index++]);
    }
    // RTD Low Temperature Alarm Limit
    if (input.bytes[0] !=
        0x03){
        tempAlarmLimitLow = twoBytesToInt16(input.bytes.slice(
            index, index + 2));
        index += 2;
    }
    // RTD High Temperature Alarm Limit
    if (input.bytes[0] !=
        0x03){
        tempAlarmLimitHigh = twoBytesToInt16(input.bytes.slice(
            index, index + 2));
        index += 2;
    }
    // Low Humidity Alarm Limit
    if (input.bytes[0] ==
        0x03){
        humidityAlarmLimitLow = input.bytes[index++];
    }
    // High Humidity Alarm Limit
    if (input.bytes[0] ==
        0x03){
        humidityAlarmLimitHigh = input.bytes[index++];
    }
    // BLE LED
    ledBle = twoBytesToUInt16(input.bytes.slice(index,
        index + 2));
    index += 2;
    // LORA LED
    ledLora = twoBytesToUInt16(input.bytes.slice(index,
        index + 2));
    index += 2;
    // Build message
    if (errors.length != 0){
        result = {
                errors : errors,
                errorsOccurred : "True"
            };
    }
    else{
        if (input.bytes[0] ==
            0x03) {
            data = {
                msgType: msgType,
                options: options,
                batteryType: batteryType,
                sensorReadPeriod: sensorReadPeriod,
                sensorAggregate: sensorAggregate,
                tempAlarmsEnabled: tempAlarmsEnabled,
                humidityAlarmsEnabled: humidityAlarmsEnabled,
                tempAlarmLimitLow: tempAlarmLimitLow,
                tempAlarmLimitHigh: tempAlarmLimitHigh,
                humidityAlarmLimitLow: humidityAlarmLimitLow,
                humidityAlarmLimitHigh: humidityAlarmLimitHigh,
                ledBle: ledBle,
                ledLora: ledLora
            };
        }
        else{
            data = {
                msgType: msgType,
                options: options,
                batteryType: batteryType,
                sensorReadPeriod: sensorReadPeriod,
                sensorAggregate: sensorAggregate,
                tempAlarmsEnabled: tempAlarmsEnabled,
                tempAlarmLimitLow: tempAlarmLimitLow,
                tempAlarmLimitHigh: tempAlarmLimitHigh,
                ledBle: ledBle,
                ledLora: ledLora
            };
        }
        result = {
                data : data,
                errorsOccurred : "False"
            };
    }
    return(result);
}

/******************************************************************************
 * Decodes a Heater Control Downlink
 *
 * @param input: The data to decode.
 * @return: The resultant JSON message
 *****************************************************************************/
function decodeDownlinkHeaterControl(input){

    var result = {};
    var index = 0;
    var nextResult;
    var msgType;
    var options;
    var heaterSetting;
    var heaterTime;
    var errors = [];
    var data = {};

    // Message type
    msgType = "heaterControl";
    index++;
    // Options
    nextResult = getEnumValue(downlinkOptionsEnum,
        true, input.bytes[index++]);
    if (nextResult != -1){
        options = nextResult;
    }
    else{
        errors.push("Invalid option type used!");
    }
    // Heater Setting
    heaterSetting = input.bytes[index++];
    // Heater Time
    heaterTime = twoBytesToUInt16(input.bytes.slice(index,
        index + 2));
    index += 2;
    // Build message
    if (errors.length != 0) {
        result = {
                errors : errors,
                errorsOccurred : "True"
            };
    }
    else{
        data = {
            msgType: msgType,
            options: options,
            heaterSetting: heaterSetting,
            heaterTime: heaterTime
        };
        result = {
                data : data,
                errorsOccurred : "False"
        };
    }
    return(result);
}

/******************************************************************************
 * Decodes a Backoff Downlink
 *
 * @param input: The data to decode.
 * @return: The resultant JSON message
 *****************************************************************************/
function decodeDownlinkBackoff(input) {

    var result = {};
    var index = 0;
    var nextResult;
    var msgType;
    var options;
    var backoffPeriod;
    var errors = [];
    var data = {};

    // Message Type
    msgType = "backoff";
    index++;
    // Options
    nextResult = getEnumValue(downlinkOptionsEnum,true,
        input.bytes[index++]);
    if (nextResult != -1){
        options = nextResult;
    }
    else{
        errors.push("Invalid option type used!");
    }
    // Backoff Period
    backoffPeriod = twoBytesToUInt16(input.bytes.slice(index,
        index + 2));
    index += 2;
    // Build message
    if (errors.length != 0) {
        result = {
                errors : errors,
                errorsOccurred : "True"
            };
    }
    else{
        data = {
                msgType: msgType,
                options: options,
                backoffPeriod: backoffPeriod
            };
        result = {
                data : data,
                errorsOccurred : "False"
        };
    }
    return(result);
}

/******************************************************************************
 * Decodes a Request Backlog Downlink
 *
 * @param input: The data to decode.
 * @return: The resultant JSON message
 *****************************************************************************/
function decodeDownlinkRequestBacklog(input) {

    var result = {};
    var index = 0;
    var nextResult;
    var msgType;
    var options;
    var backlogPullReqNum;
    var backlogPullReqPeriod;
    var errors = [];
    var data = {};

    // Message Type
    nextResult = getEnumValue(msgTypeDLEnum,true,input.bytes[index++]);
    if (nextResult != -1){
        msgType = nextResult;
    }
    else{
        errors.push("Invalid message type used!");
    }
    // Options
    nextResult = getEnumValue(downlinkOptionsEnum,
        true, input.bytes[index++]);
    if (nextResult != -1) {
        options = nextResult;
    } else {
        errors.push("Invalid option type used!");
    }
    // Backlog Pull Request Number
    backlogPullReqNum = twoBytesToUInt16(input.bytes.slice(index,
        index + 2));
    index += 2;
    // Backlog Pull Request Period
    backlogPullReqPeriod = twoBytesToUInt16(input.bytes.slice(index,
        index + 2));
    index += 2;
    // Build message
    if (errors.length != 0) {
        result = {
                errors : errors,
                errorsOccurred : "True"
            };
    }
    else{
        data = {
            msgType: msgType,
            options: options,
            backlogPullReqNum: backlogPullReqNum,
            backlogPullReqPeriod: backlogPullReqPeriod
        };
        result = {
                data : data,
                errorsOccurred : "False"
        };
    }
    return(result);
}

/******************************************************************************
 * Decodes a Set Open Closed Config Downlink
 *
 * @param input: The data to decode.
 * @return: The resultant JSON message
 *****************************************************************************/
function decodeDownlinkSetOpenClosedConfig(input) {

    var result = {};
    var index = 0;
    var nextResult;
    var msgType;
    var options;
    var operatingMode;
    var loraNotificationOptions;
    var openDwellTime;
    var closedDwellTime;
    var resendInterval;
    var debounceAdjust;
    var errors = [];
    var data = {};

    // Message Type
    msgType = "asSetOpenClosedConfig";
    index++;
    // Options
    nextResult = getEnumValue(downlinkOptionsEnum,true,input.bytes[index++]);
    if (nextResult != -1){
        options = nextResult;
    }
    else{
        errors.push("Invalid option type used!");
    }
    // Operating Mode
    nextResult = getEnumValue(operatingModeEnum,
        true, input.bytes[index++]);
    if (nextResult != -1){
        operatingMode = nextResult;
    } else {
        errors.push("Invalid Operating Mode used!");
    }
    // Lora Notification Options
    nextResult = getBitfieldValue(loraIndicationOptionsBitfield,
        true, input.bytes[index++]);
    if (nextResult != -1){
        loraNotificationOptions = nextResult;
    }
    else{
        result = errors.push("Invalid LoRa Notification Option used!");
    }
    // Open Dwell Time
    openDwellTime = twoBytesToUInt16(input.bytes.slice(index,
        index + 2));
    index += 2;
    // Closed Dwell Time
    closedDwellTime = twoBytesToUInt16(input.bytes.slice(index,
        index + 2));
    index += 2;
    // Resend Interval
    resendInterval = input.bytes[index++];
    // Debounce Adjust
    debounceAdjust = input.bytes[index++];
    // Build messge
    if (errors.length != 0) {
        result = {
                errors : errors,
                errorsOccurred : "True"
            };
    }
    else{
        data = {
            msgType: msgType,
            options: options,
            operatingMode: operatingMode,
            loraNotificationOptions: loraNotificationOptions,
            openDwellTime: openDwellTime,
            closedDwellTime: closedDwellTime,
            resendInterval: resendInterval,
            debounceAdjust: debounceAdjust
        };
        result = {
                data : data,
                errorsOccurred : "False"
        };
    }
    return(result);
}

/******************************************************************************
 * Decodes a Request Targeted Backlog Downlink
 *
 * @param input: The data to decode.
 * @return: The resultant JSON message
 *****************************************************************************/
function decodeDownlinkRequestTargetedBacklog(input) {

    var result = {};
    var index = 0;
    var nextResult;
    var msgType;
    var options;
    var startYear;
    var startMonth;
    var startDay;
    var startHours;
    var startMinutes;
    var startSeconds;
    var endYear;
    var endMonth;
    var endDay;
    var endHours;
    var endMinutes;
    var endSeconds;
    var backlogPullReqPeriod;
    var errors = [];
    var data = {};

    // Message Type
    nextResult = getEnumValue(msgTypeDLEnum,true,input.bytes[index++]);
    if (nextResult != -1){
        msgType = nextResult;
    }
    else{
        errors.push("Invalid message type used!");
    }
    // Options
    nextResult = getEnumValue(downlinkOptionsEnum,
        true, input.bytes[index++]);
    if (nextResult != -1) {
        options = nextResult;
    }
    else {
        errors.push("Invalid option type used!");
    }
    // Start Year
    startYear = input.bytes[index++] + 2000;
    // Start Month
    nextResult = getEnumValue(monthTypeEnum,
        true, input.bytes[index++]);
    if (nextResult != -1){
        startMonth = nextResult;
    }
    else{
        errors.push("Invalid month value used!");
    }
    // Start Day
    startDay = input.bytes[index++];
    // Start Hours
    startHours = input.bytes[index++];
    // Start Minutes
    startMinutes = input.bytes[index++];
    // Start Seconds
    startSeconds = input.bytes[index++];
    // End Year
    endYear = input.bytes[index++] + 2000;
    // End Month
    nextResult = getEnumValue(monthTypeEnum,
        true, input.bytes[index++]);
    if (nextResult != -1){
        endMonth = nextResult;
    }
    else{
        errors.push("Invalid month value used!");
    }
    // End Day
    endDay = input.bytes[index++];
    // End Hours
    endHours = input.bytes[index++];
    // End Minutes
    endMinutes = input.bytes[index++];
    // End Seconds
    endSeconds = input.bytes[index++];
    // Pull Request Period
    backlogPullReqPeriod = twoBytesToUInt16(input.bytes.slice(index,
        index + 2));
    index += 2;
    // Build message
    if (errors.length != 0) {
        result = {
                errors : errors,
                errorsOccurred : "True"
            };
    }
    else{
        data = {
                msgType: msgType,
                options: options,
                startYear: startYear,
                startMonth: startMonth,
                startDay: startDay,
                startHours: startHours,
                startMinutes: startMinutes,
                startSeconds: startSeconds,
                endYear: endYear,
                endMonth: endMonth,
                endDay: endDay,
                endHours: endHours,
                endMinutes: endMinutes,
                endSeconds: endSeconds,
                backlogPullReqPeriod: backlogPullReqPeriod
        };
        result = {
                data : data,
                errorsOccurred : "False"
        };
    }
    return(result);
}

/******************************************************************************
 * Downlink Encoder.
 *****************************************************************************/

/******************************************************************************
 * Encodes a Generic Data Retrieval downlink.
 *
 * @param input: The data to encode.
 * @return: The resultant byte array
 *****************************************************************************/
function encodeDownlinkGenericDataRetrieval(input) {

    var result = {};
    var index = 0;
    var nextResult;
    var errors = [];
    var data = [];

    // Message Type
    nextResult = getEnumValue(msgTypeDLEnum, false,
        input.data.msgType);
    if (nextResult != "Not Found") {
        data[index++] = nextResult;
    }
    else{
        errors.push("Invalid message type used!");
    }
    // Options
    nextResult = getEnumValue(downlinkOptionsEnum, false,
        input.data.options);
    if (nextResult != "Not Found") {
        data[index++] = nextResult;
    }
    else{
        errors.push("Invalid option type used!");
    }
    result = buildResult(errors,data);
    return(result);
}

/******************************************************************************
 * Encodes a Generate RTC Downlink
 *
 * @param input: The data to encode.
 * @return: The resultant byte array
 *****************************************************************************/
function encodeDownlinkGenerateRTCDownlink(input) {

    var result = {};
    var index = 0;
    var nextResult;
    var dayMax;
    var errors = [];
    var data = [];

    // Message Type
    data[index++] = 0x02;
    // Options
    nextResult = getEnumValue(downlinkOptionsEnum,false,input.data.options);
    if (nextResult != "Not Found"){
        data[index++] = nextResult;
    }
    else{
        errors.push("Invalid option type used!");
    }
    // Year
    nextResult = encodeDownlinkYear(input.data.year);
    if (nextResult != -1){
        data[index++] = nextResult;
    }
    else{
        errors.push("Invalid year value used!");
    }
    // Month
    nextResult = getEnumValue(monthTypeEnum, false, input.data.month);
    if (nextResult != "Not Found"){
        data[index++] = nextResult;
    }
    else{
        errors.push("Invalid month value used!");
    }
    // Day
    dayMax = new Date(input.data.year, nextResult, 0).getDate();
    if ((input.data.day >= 1)&&
        (input.data.day <= dayMax)){
                data[index++] = input.data.day;
    }
    else{
        errors.push("Invalid day value used!");
    }
    // Hours
    if ((input.data.hours >= 0)&&
        (input.data.hours <= 23)){
                data[index++] = input.data.hours;
    }
    else {
        errors.push("Invalid hour value used!");
    }
    // Minutes
    if ((input.data.minutes >= 0)&&
        (input.data.minutes <= 59)){
            data[index++] = input.data.minutes;
    }
    else{
        errors.push("Invalid minute value used!");
    }
    // Seconds
    if ((input.data.seconds >= 0)&&
        (input.data.seconds <= 59)){
            data[index++] = input.data.seconds;
    }
    else{
        errors.push("Invalid second value used!");
    }
    result = buildResult(errors,data);
    return(result);
}

/******************************************************************************
 * Encodes a Config Downlink
 *
 * @param input: The data to encode.
 * @return: The resultant byte array
 *****************************************************************************/
function encodeDownlinkConfig(input){

    var result = {};
    var index = 0;
    var nextResult;
    var errors = [];
    var data = [];

    // Message Type
    nextResult = getEnumValue(msgTypeDLEnum,false,input.data.msgType);
    if (nextResult != "Not Found"){
        data[index++] = nextResult;
    }
    else{
        errors.push("Invalid message type used!");
    }
    // Options
    nextResult = getEnumValue(downlinkOptionsEnum, false, input.data.options);
    if (nextResult != "Not Found") {
        data[index++] = nextResult;
    } else {
        errors.push("Invalid option type used!");
    }
    // Battery Type
    nextResult = getEnumValue(batteryTypeEnum,false,input.data.batteryType);
    if (nextResult != "Not Found"){
        data[index++] = nextResult;
    }
    else{
        errors.push("Invalid Battery Type used!");
    }
    // Sensor Read Period
    if ((input.data.sensorReadPeriod >= 30)&&
        (input.data.sensorReadPeriod <= 65535)){
        nextResult = iUInt16ToTwoBytes(input.data.sensorReadPeriod);
        data.push(nextResult[0]);
        data.push(nextResult[1]);
        index += 2;
    }
    else{
        errors.push("Invalid Sensor Read Period used!");
    }
    // Sensor Aggregate
    if ((input.data.sensorAggregate >= 0)&&
        (input.data.sensorAggregate <= 10)){
            data[index++] = input.data.sensorAggregate;
    }
    else{
        errors.push("Invalid Sensor Aggregate used!");
    }
    // Temperature Alarms
    nextResult = getEnumValue(booleanEnum,false,input.data.tempAlarmsEnabled);
    if (nextResult != "Not Found"){
        data[index++] = nextResult;
    }
    else{
        errors.push("Invalid Temperature Alarm Enable used!");
    }
    // Humidity Alarms
    if (input.data.msgType == "config") {
        nextResult = getEnumValue(booleanEnum, false, input.data.humidityAlarmsEnabled);
        if (nextResult != "Not Found") {
            data[index++] = nextResult;
        }
        else{
            errors.push("Invalid Humidity Alarm Enable used!");
        }
    }
    // Low Temperature Alarm Limit
    if (input.data.msgType == "config") {
        if ((input.data.tempAlarmLimitLow >= -40) &&
            (input.data.tempAlarmLimitLow <= 85)) {
                data[index++] = int8ToByte(input.data.tempAlarmLimitLow);
        } else {
            errors.push("Invalid Low Temperature Alarm Limit used!");
        }
    }
    // High Temperature Alarm Limit
    if (input.data.msgType == "config") {
        if ((input.data.tempAlarmLimitHigh >= -40) &&
            (input.data.tempAlarmLimitHigh <= 85)) {
            data[index++] = int8ToByte(input.data.tempAlarmLimitHigh);
        }
        else {
            errors.push("Invalid High Temperature Alarm Limit used");
        }
    }
    // RTD Low Temperature Alarm Limit
    if (input.data.msgType != "config") {
        if ((input.data.tempAlarmLimitLow >= -200) &&
            (input.data.tempAlarmLimitLow <= 850)) {
            nextResult = iUInt16ToTwoBytes(input.data.tempAlarmLimitLow);
            data.push(nextResult[0]);
            data.push(nextResult[1]);
            index += 2;
        }
        else {
            errors.push("Invalid Low Temperature Alarm Limit used!");
        }
    }
    // RTD High Temperature Alarm Limit
    if (input.data.msgType != "config") {
        if ((input.data.tempAlarmLimitHigh >= -250) &&
            (input.data.tempAlarmLimitHigh <= 850)) {
            nextResult = iUInt16ToTwoBytes(input.data.tempAlarmLimitHigh);
            data.push(nextResult[0]);
            data.push(nextResult[1]);
            index += 2;
        }
        else {
            errors.push("Invalid Low Temperature Alarm Limit used!");
        }
    }
    // Low Humidity Alarm Limit
    if (input.data.msgType == "config") {
        if ((input.data.humidityAlarmLimitLow >= 0) &&
            (input.data.humidityAlarmLimitLow <= 100)) {
                data[index++] = input.data.humidityAlarmLimitLow;
        }
        else {
            errors.push("Invalid Low Humidity Alarm Limit used!");
        }
    }
    // High Humidity Alarm Limit
    if (input.data.msgType == "config") {
        if ((input.data.humidityAlarmLimitHigh >= 0) &&
            (input.data.humidityAlarmLimitHigh <= 100)) {
            data[index++] = input.data.humidityAlarmLimitHigh;
        }
        else {
            errors.push("Invalid High Humidity Alarm Limit used!");
        }
    }
    // Business Rules for High and Low Temperature alarms
    if (input.data.tempAlarmLimitHigh < input.data.tempAlarmLimitLow){
        errors.push("Low Temperature Limit must be less than High Temperature Limit!");
    }
    // Business Rules for High and Low Humidity alarms
    if (input.data.msgType == "config") {
        if (input.data.humidityAlarmLimitHigh < input.data.humidityAlarmLimitLow){
            errors.push("Low Humidity Limit must be less than High Humidity Limit!");
        }
    }
    // BLE LED
    if ((input.data.ledBle >= 0)&&
        (input.data.ledBle <= 65535)){
        nextResult = iUInt16ToTwoBytes(input.data.ledBle);
        data.push(nextResult[0]);
        data.push(nextResult[1]);
        index += 2;
    }
    else{
        errors.push("Invalid BLE LED used!");
    }
    // LORA LED
    if ((input.data.ledLora >= 0)&&
        (input.data.ledLora <= 65535)){
        nextResult = iUInt16ToTwoBytes(input.data.ledLora);
        data.push(nextResult[0]);
        data.push(nextResult[1]);
        index += 2;
    }
    else{
        errors.push("Invalid LORA LED used!");
    }
    result = buildResult(errors,data);
    return(result);
}

/******************************************************************************
 * Encodes a Heater Control Downlink
 *
 * @param input: The data to encode.
 * @return: The resultant byte array
 *****************************************************************************/
function encodeDownlinkHeaterControl(input){

    var result = {};
    var index = 0;
    var nextResult;
    var errors = [];
    var data = [];

    // Message type
    data[index++] = 0x04;
    // Options
    nextResult = getEnumValue(downlinkOptionsEnum,false,input.data.options);
    if (nextResult != "Not Found"){
        data[index++] = nextResult;
    }
    else{
        errors.push("Invalid option type used!");
    }
    // Heater Setting
    if ((input.data.heaterSetting >= 0)&&
        (input.data.heaterSetting <= 15)){
        data[index++] = input.data.heaterSetting;
    }
    else{
        errors.push("Invalid Heater Setting used!");
    }
    // Heater Time
    if ((input.data.heaterTime >= 0)&&
        (input.data.heaterTime <= 65535)){
        nextResult = iUInt16ToTwoBytes(input.data.heaterTime);
        data.push(nextResult[0]);
        data.push(nextResult[1]);
        index += 2;
    }
    else{
        errors.push("Invalid Heater Time used!");
    }
    result = buildResult(errors,data);
    return(result);
}

/******************************************************************************
 * Encodes a Backoff Downlink
 *
 * @param input: The data to encode.
 * @return: The resultant byte array
 *****************************************************************************/
function encodeDownlinkBackoff(input) {

    var result = {};
    var index = 0;
    var nextResult;
    var errors = [];
    var data = [];

    // Message Type
    data[index++] = 0x05;
    // Options
    nextResult = getEnumValue(downlinkOptionsEnum,false,input.data.options);
    if (nextResult != "Not Found"){
        data[index++] = nextResult;
    }
    else{
        errors.push("Invalid option type used!");
    }
    // Backoff Period
    if ((input.data.backoffPeriod >= 0)&&
        (input.data.backoffPeriod <= 65535)){
        nextResult = iUInt16ToTwoBytes(input.data.backoffPeriod);
        data.push(nextResult[0]);
        data.push(nextResult[1]);
        index += 2;
    }
    else{
        errors.push("Invalid Backoff Period used!");
    }
    result = buildResult(errors,data);
    return(result);
}

/******************************************************************************
 * Encodes a Request Backlog Downlink
 *
 * @param input: The data to encode.
 * @return: The resultant byte array
 *****************************************************************************/
function encodeDownlinkRequestBacklog(input) {

    var result = {};
    var index = 0;
    var nextResult;
    var errors = [];
    var data = [];

    // Message Type
    nextResult = getEnumValue(msgTypeDLEnum,false,input.data.msgType);
    if (nextResult != "Not Found"){
        data[index++] = nextResult;
    }
    else{
        errors.push("Invalid message type used!");
    }
    // Options
    nextResult = getEnumValue(downlinkOptionsEnum, false, input.data.options);
    if (nextResult != "Not Found") {
        data[index++] = nextResult;
    } else {
        errors.push("Invalid option type used!");
    }
    // Backlog Pull Request Number
    if ((input.data.backlogPullReqNum >= 0)&&
        (input.data.backlogPullReqNum <= 65535)){
        nextResult = iUInt16ToTwoBytes(input.data.backlogPullReqNum);
        data.push(nextResult[0]);
        data.push(nextResult[1]);
        index += 2;
    }
    else{
        errors.push("Invalid Pull Request Number used!");
    }
    // Backlog Pull Request Period
    if ((input.data.backlogPullReqPeriod >= 0)&&
        (input.data.backlogPullReqPeriod <= 65535)){
        nextResult = iUInt16ToTwoBytes(input.data.backlogPullReqPeriod);
        data.push(nextResult[0]);
        data.push(nextResult[1]);
        index += 2;
    }
    else{
        errors.push("Invalid Pull Request Period used!");
    }
    result = buildResult(errors,data);
    return(result);
}

/******************************************************************************
 * Encodes a Set Open Closed Config Downlink
 *
 * @param input: The data to encode.
 * @return: The resultant byte array
 *****************************************************************************/
function encodeDownlinkSetOpenClosedConfig(input) {

    var result = {};
    var index = 0;
    var nextResult;
    var errors = [];
    var data = [];

    // Message Type
    data[index++] = 0x0D;
    // Options
    nextResult = getEnumValue(downlinkOptionsEnum,false,input.data.options);
    if (nextResult != "Not Found"){
        data[index++] = nextResult;
    }
    else{
        errors.push("Invalid option type used!");
    }
    // Operating Mode
    nextResult = getEnumValue(operatingModeEnum, false, input.data.operatingMode);
    if (nextResult != "Not Found") {
        data[index++] = nextResult;
    }
    else{
        errors.push("Invalid Operating Mode used!");
    }
    // Lora Notification Options
    nextResult = getBitfieldValue(loraIndicationOptionsBitfield,
                                          false, input.data.loraNotificationOptions);
    if (nextResult != "Not Found"){
        data[index++] = nextResult;
    }
    else{
        errors.push("Invalid LoRa Notification Option used!");
    }
    // Open Dwell Time
    if ((input.data.openDwellTime >= 5)&&
        (input.data.openDwellTime <= 1023)){
        nextResult = iUInt16ToTwoBytes(input.data.openDwellTime);
        data.push(nextResult[0]);
        data.push(nextResult[1]);
        index += 2;
    }
    else{
        errors.push("Invalid Open Dwell Time used!");
    }
    // Closed Dwell Time
    if ((input.data.closedDwellTime >= 5)&&
        (input.data.closedDwellTime <= 1023)){
        nextResult = iUInt16ToTwoBytes(input.data.closedDwellTime);
        data.push(nextResult[0]);
        data.push(nextResult[1]);
        index += 2;
    }
    else{
        errors.push("Invalid Closed Dwell Time used!");
    }
    // Resend Interval
    if ((input.data.resendInterval >= 1)&&
        (input.data.resendInterval <= 255)){
        data[index++] = input.data.resendInterval;
    }
    else{
        errors.push("Invalid Resend Interval used!");
    }
    // Debounce Adjust
    if ((input.data.debounceAdjust >= 0)&&
        (input.data.debounceAdjust <= 255)){
        data[index++] = input.data.debounceAdjust;
    }
    else{
        errors.push("Invalid Debounce Adjust used!");
    }
    result = buildResult(errors,data);
    return(result);
}

/******************************************************************************
 * Encodes a Request Targeted Backlog Downlink
 *
 * @param input: The data to encode.
 * @return: The resultant byte array
 *****************************************************************************/
function encodeDownlinkRequestTargetedBacklog(input) {

    var result = {};
    var index = 0;
    var nextResult;
    var dayMax;
    var errors = [];
    var data = [];

    // Message Type
    nextResult = getEnumValue(msgTypeDLEnum,false,input.data.msgType);
    if (nextResult != "Not Found"){
        data[index++] = nextResult;
    }
    else{
        errors.push("Invalid message type used!");
    }
    // Options
    nextResult = getEnumValue(downlinkOptionsEnum, false, input.data.options);
    if (nextResult != "Not Found") {
        data[index++] = nextResult;
    }
    else {
        errors.push("Invalid option type used!");
    }
    // Start Year
    nextResult = encodeDownlinkYear(input.data.startYear);
    if (nextResult != -1){
        data[index++] = nextResult;
    }
    else{
        errors.push("Invalid year value used!");
    }
    // Start Month
    nextResult = getEnumValue(monthTypeEnum,false,input.data.startMonth);
    if (nextResult != "Not Found"){
        data[index++] = nextResult;
    }
    else{
        errors.push("Invalid month value used!");
    }
    // Start Day
    dayMax = new Date(input.data.startYear, nextResult, 0).getDate();
    if ((input.data.startDay >= 1)&&
        (input.data.startDay <= dayMax)){
        data[index++] = input.data.startDay;
    }
    else{
        errors.push("Invalid day value used!");
    }
    // Start Hours
    if ((input.data.startHours >= 0)&&
        (input.data.startHours <= 23)){
        data[index++] = input.data.startHours;
    }
    else{
        errors.push("Invalid hour value used!");
    }
    // Start Minutes
    if ((input.data.startMinutes >= 0)&&
        (input.data.startMinutes <= 59)){
        data[index++] = input.data.startMinutes;
    }
    else{
        errors.push("Invalid minute value used!");
    }
    // Start Seconds
    if ((input.data.startSeconds >= 0)&&
        (input.data.startSeconds <= 59)){
        data[index++] = input.data.startSeconds;
    }
    else{
        errors.push("Invalid second value used!");
    }
    // End Year
    nextResult = encodeDownlinkYear(input.data.endYear);
    if (nextResult != -1){
        data[index++] = nextResult;
    }else{
        errors.push("Invalid year value used!");
    }
    // End Month
    nextResult = getEnumValue(monthTypeEnum,false,input.data.endMonth);
    if (nextResult != "Not Found"){
        data[index++] = nextResult;
    }
    else{
        errors.push("Invalid month value used!");
    }
    // End Day
    dayMax = new Date(input.data.endYear, nextResult, 0).getDate();
    if ((input.data.endDay >= 1)&&
        (input.data.endDay <= dayMax)){
        data[index++] = input.data.endDay;
    }
    else{
        errors.push("Invalid day value used!");
    }
    // End Hours
    if ((input.data.endHours >= 0)&&
        (input.data.endHours <= 23)){
        data[index++] = input.data.endHours;
    }
    else{
        errors.push("Invalid hour value used!");
    }
    // End Minutes
    if ((input.data.endMinutes >= 0)&&
        (input.data.endMinutes <= 59)){
        data[index++] = input.data.endMinutes;
    }
    else{
        errors.push("Invalid minute value used!");
    }
    // End Seconds
    if ((input.data.endSeconds >= 0)&&
        (input.data.endSeconds <= 59)){
        data[index++] = input.data.endSeconds;
    }
    else{
        errors.push("Invalid second value used!");
    }
    // Pull Request Period
    if ((input.data.backlogPullReqPeriod >= 0)&&
        (input.data.backlogPullReqPeriod <= 65535)){
        nextResult = iUInt16ToTwoBytes(input.data.backlogPullReqPeriod);
        data.push(nextResult[0]);
        data.push(nextResult[1]);
        index += 2;
    }
    else{
        errors.push("Invalid Pull Request Period used!");
    }
    result = buildResult(errors,data);
    return(result);
}

/******************************************************************************
 * Private method to build encoder output depending upon errors occurred.
 *
 * @param errors: The list of errors.
 * @param data: The list of bytes
 * @return: The resultant JSON message
 *****************************************************************************/
function buildResult(errors,data) {

    var result;

    if (errors.length != 0){
        result = {
                errors : errors,
                errorsOccurred : "True"
            };
    }
    else{
        result = {
                data : data,
                errorsOccurred : "False"
            };
    }
    return(result);
}

/******************************************************************************
 * Uplink Decoder
 *****************************************************************************/

/******************************************************************************
 * Decoder for messages of type LAIRD_CONNECTIVITY_MSG_TYPE_TEMP_RH
 *
 * @param payload - the message data
 * @return: JSON data
 *****************************************************************************/
function decodeUplinkLairdMsgTypeTempRH(payload){

    var result = {};
    var index = 0;
    var nextResult;
    var msgType;
    var options;
    var humidity;
    var temperature;
    var batteryCapacity;
    var alarmMsgCount;
    var backlogMsgCount;
    var errors = [];
    var data = {};

    if (payload.length == 11) {

        // Message Type
        msgType = "Laird_Internal_TH";
        index++;
        // Options
        nextResult = getBitfieldValue(uplinkOptionsBitfield,
                                              true, payload[index++]);
        if (nextResult != -1){
            options = nextResult;
        }
        else{
            errors.push("Invalid option type used!");
        }
        // Humidity
        humidity = twoBytesToFloat(payload.slice(index,
                    index + 2));
        index += 2;
        // Temperature
        temperature = twoBytesToFloat(payload.slice(index,
                    index + 2));
        index += 2;
        // Battery Capacity
        nextResult = getEnumValue(batteryCapacityEnum,true,payload[index++]);
        if (nextResult != -1){
            batteryCapacity = nextResult;
        }
        else{
            errors.push("Invalid Battery Capacity used!");
        }
        // Alarm Message Count
        alarmMsgCount = twoBytesToUInt16(payload.slice(index,
                index + 2));
        index += 2;
        // Backlog Message Count
        backlogMsgCount = twoBytesToUInt16(payload.slice(index,
                index + 2));
        index += 2;
    }
    else{
        errors.push("Invalid uplink message length!");
    }
    if (errors.length != 0) {
        result = {
                    errorsOccurred : "True",
                    errors : errors
        };
    }
    else{
        data = {
                msgType : msgType,
                options: options,
                humidity: humidity,
                temperature: temperature,
                batteryCapacity : batteryCapacity,
                alarmMsgCount: alarmMsgCount,
                backlogMsgCount: backlogMsgCount
            };
        result = {
                errorsOccurred : "False",
                data : data
            };
    }
    return(result);
}

/******************************************************************************
 * Decoder for messages of type LAIRD_CONNECTIVITY_MSG_TYPE_AGG_TEMP_RH
 *
 * @param payload - the message data
 * @return: JSON data
 *****************************************************************************/
function decodeUplinkLairdMsgTypeAggTempRH(payload){

    var readingsIndex = 0;
    var readings;
    var humidity;
    var temperature;
    var errors = [];
    var data = {};
    var msgType;
    var options;
    var nextResult;
    var index = 0;
    var alarmMsgCount;
    var timestamp;
    var lengthValid = false;
    var batteryCapacity;
    var backlogMsgCount;
    var numberOfReadings;
    var result;

    if (payload.length > 11) {
        var readingsBytesLength = payload[6] *
            4;
        if (payload.length == readingsBytesLength + 11) {
            // All length checks OK
            lengthValid = true;
            // Message type
            msgType = "Laird_Agg_TH";
            index++;
            // Options
            nextResult = getBitfieldValue(uplinkOptionsBitfield,
                true, payload[index++]);
            if (nextResult != -1){
                options = nextResult;
            }
            else{
                errors.push("Invalid option type used!");
            }
            // Alarm Messsage Count
            alarmMsgCount = payload[index++];
            // Backlog Msg Count
            backlogMsgCount = twoBytesToUInt16(payload.slice(index,
                index + 2));
            index += 2;
            // Battery Capacity
            nextResult = getEnumValue(batteryCapacityEnum,true,payload[index++]);
            if (nextResult != -1){
                batteryCapacity = nextResult;
            }
            else{
                errors.push("Invalid Battery Capacity used!");
            }
            // Number of readings
            numberOfReadings = payload[index++];
            // Timestamp
            timestamp = convertTimestampToDate(payload.slice(
                index,index + 4));
            index += 4;

            // Size the readings array as per the number of readings in the message
            readings = new Array([payload[6]]);

            for (; readingsBytesLength;
		        readingsBytesLength -= 4) {

                humidity = twoBytesToFloat(payload.slice(
                    index,
                    index +
                    2));
                index += 2;
                temperature = twoBytesToFloat(payload.slice(
                    index,
                    index +
                    2));
                index += 2;

                readings[readingsIndex++] = {
                    'humidity': humidity,
                    'temperature': temperature
                };
            }
        }
    }
    if (lengthValid == false){
        errors.push("Invalid uplink message length!");
    }
    if (errors.length != 0){
        result = {
            errorsOccurred : "True",
            errors : errors
        };
    }
    else{
        data = {
            msgType : msgType,
            options : options,
            alarmMsgCount : alarmMsgCount,
            backlogMsgCount : backlogMsgCount,
            batteryCapacity : batteryCapacity,
            numberOfReadings : numberOfReadings,
            timestamp : timestamp,
            readings : readings,
        };
        result = {
            errorsOccurred : "False",
            data : data
        };
    }
    return(result);
}

/******************************************************************************
 * Decoder for messages of type "SendBackLogMessage"
 *
 * @param payload - message data
 * @param isRtd - handles rtd type messages
 * @return: JSON data
 *****************************************************************************/
function decodeUplinkLairdMsgTypeBacklogMessage(payload,isRtd){

    var result = {};
    var index = 0;
    var nextResult;
    var msgType;
    var options;
    var humidity;
    var temperature;
    var errors = [];
    var data = {};
    var timestamp = {};

    if (payload.length == 10) {

        // Message Type
        msgType = "SendBackLogMessage";
        index++;
        // Options
        nextResult = getBitfieldValue(uplinkOptionsBitfield,
                                              true, payload[index++]);
        if (nextResult != -1){
            options = nextResult;
        }
        else{
            errors.push("Invalid option type used!");
        }
        // Timestamp
        timestamp = convertTimestampToDate(payload.slice(
            index,index + 4));
        index += 4;
        // Check for RTD type message
        if (isRtd){
            // Temperature
            temperature = fourBytesToFloat(payload.slice(index,
                index + 4));
            index += 4;
        }
        else{
            // Humidity
            humidity = twoBytesToFloat(payload.slice(index,
                        index + 2));
            index += 2;
            // Temperature
            temperature = twoBytesToFloat(payload.slice(index,
                        index + 2));
            index += 2;
        }
    }
    else{
        errors.push("Invalid uplink message length!");
    }
    if (errors.length != 0) {
        result = {
                    errorsOccurred : "True",
                    errors : errors
        };
    }
    else{
        if (isRtd){
            data = {
                    msgType : msgType,
                    options: options,
                    timestamp : timestamp,
                    temperature: temperature};
            }
            else{
                data = {
                    msgType : msgType,
                    options: options,
                    timestamp : timestamp,
                    humidity: humidity,
                    temperature: temperature};
            }
        result = {
                errorsOccurred : "False",
                data : data
            };
    }
    return(result);
}

/******************************************************************************
 * Decoder for messages of type "SendBackLogMessages"
 *
 * @param payload - message data
 * @param isRtd - handles rtd type messages
 * @return: JSON data
 *****************************************************************************/
function decodeUplinkLairdMsgTypeBacklogMessages(payload,isRtd){

    var readingsIndex = 0;
    var readings;
    var humidity;
    var temperature;
    var errors = [];
    var data = {};
    var msgType;
    var options;
    var numberOfReadings;
    var nextResult;
    var index = 0;
    var timestamp;
    var lengthValid = false;
    var result;

    // Expect at least one reading
    if (payload.length >= 3 +
            8) {

        // Check the length less the non-reading bytes are a multiple of the
        // reading size - if not we're missing some data
        if ((payload.length - 3) %
            8 == 0){

            // OK to proceed
            lengthValid = true;

            // Message type
            msgType = "SendBackLogMessages";
            index++;
            // Options
            nextResult = getBitfieldValue(uplinkOptionsBitfield,
                true, payload[index++]);
            if (nextResult != -1){
                options = nextResult;
            }
            else{
                errors.push("Invalid option type used!");
            }
            // Number of Readings
            numberOfReadings = payload[index++];
            // Size the readings according to how many reside in the payload
            readings = new Array(numberOfReadings);
            // Then create the list of readings
            for (; index < payload.length; ){
                // Timestamp
                timestamp = convertTimestampToDate(payload.slice(
                    index,index + 4));
                index += 4;
                if (isRtd){
                    // Temperature
                    temperature = fourBytesToFloat(payload.slice(
                        index,
                        index +
                        4));
                    index += 4;
                    // Add the next set of readings
                    readings[readingsIndex++] = {
                        'timestamp' : timestamp,
                        'temperature': temperature
                    };
                }
                else
                {
                    // Humidity
                    humidity = twoBytesToFloat(payload.slice(
                        index,
                        index +
                    2));
                    index += 2;
                    // Temperature
                    temperature = twoBytesToFloat(payload.slice(
                        index,
                        index +
                        2));
                    index += 2;
                    // Add the next set of readings
                    readings[readingsIndex++] = {
                        'timestamp' : timestamp,
                        'humidity' : humidity,
                        'temperature': temperature
                    };
                }
            }
        }
    }
    if (lengthValid == false){
        errors.push("Invalid uplink message length!");
    }
    if (errors.length != 0){
        result = {
            errorsOccurred : "True",
            errors : errors
        };
    }
    else{
        data = {
            msgType : msgType,
            options : options,
            numberOfReadings : numberOfReadings,
            readings : readings,
        };
        result = {
            errorsOccurred : "False",
            data : data
        };
    }
    return(result);
}

/******************************************************************************
 * Decoder for messages of type LAIRD_CONNECTIVITY_MSG_TYPE_SIMPLE_CONFIG
 *
 * @param payload - message data
 * @return: JSON data
 *****************************************************************************/
function decodeUplinkLairdMsgSimpleConfig(payload){

    var msgType;
    var options;
    var batteryType;
    var sensorReadPeriod;
    var sensorAggregate;
    var tempAlarmsEnabled;
    var humidityAlarmsEnabled;
    var nextResult;
    var errors = [];
    var data = {};
    var index = 0;
    var result;

    if (payload.length == 8){
        // Message Type
        msgType = "Laird_Simple_Config";
        index++;
        // Options
        nextResult = getBitfieldValue(uplinkOptionsBitfield,
            true, payload[index++]);
        if (nextResult != -1){
            options = nextResult;
        }
        else{
            errors.push("Invalid option type used!");
        }
        // Battery Type
        nextResult = getEnumValue(batteryTypeEnum,true,
            payload[index++]);
        if (nextResult != -1){
            batteryType = nextResult;
        }
        else{
            errors.push("Invalid Battery Type used!");
        }
        // Sensor Read Period
        sensorReadPeriod = twoBytesToUInt16(payload.slice(
                    index,
                    index + 2));
        index += 2;
        // Sensor Aggregate Count
        sensorAggregate = payload[index++];
        // Temp Alarms Enabled
        nextResult = getEnumValue(booleanEnum,true,
            payload[index++]);
        if (nextResult != -1){
            tempAlarmsEnabled = nextResult;
        }
        else{
            errors.push("Invalid Temperature Alarm Enable used!");
        }
        // Humidity Alarms Enabled
        nextResult = getEnumValue(booleanEnum,true,
            payload[index++]);
        if (nextResult != -1){
            humidityAlarmsEnabled = nextResult;
        }
        else{
            errors.push("Invalid Humidity Alarm Enable used!");
        }
    }
    else{
            errors.push("Invalid uplink message length!");
    }
    if (errors.length != 0) {
        result = {
                    errorsOccurred : "True",
                    errors : errors
        };
    }
    else{
        data = {
                msgType : msgType,
                options: options,
                batteryType: batteryType,
                sensorReadPeriod: sensorReadPeriod,
                sensorAggregate: sensorAggregate,
                tempAlarmsEnabled: tempAlarmsEnabled,
                humidityAlarmsEnabled: humidityAlarmsEnabled
            };
        result = {
                errorsOccurred : "False",
                data : data
            };
    }
    return(result);
}

/******************************************************************************
 * Decoder for messages of type "Laird_Advanced_Config"
 *
 * @param payload - message data
 * @return: JSON data
 *****************************************************************************/
function decodeUplinkLairdMsgAdvancedConfig(payload){

    var msgType;
    var options;
    var batteryType;
    var sensorReadPeriod;
    var sensorAggregate;
    var tempAlarmsEnabled;
    var humidityAlarmsEnabled;
    var tempAlarmLimitLow;
    var tempAlarmLimitHigh;
    var humidityAlarmLimitLow;
    var humidityAlarmLimitHigh;
    var ledBle;
    var ledLora;
    var nextResult;
    var errors = [];
    var data = {};
    var index = 0;
    var result;

    if (payload.length == 16){
        // Message Type
        msgType = "Laird_Advanced_Config";
        index++;
        // Options
        nextResult = getBitfieldValue(uplinkOptionsBitfield,
            true, payload[index++]);
        if (nextResult != -1){
            options = nextResult;
        }
        else{
            errors.push("Invalid option type used!");
        }
        // Battery Type
        nextResult = getEnumValue(batteryTypeEnum,true,
            payload[index++]);
        if (nextResult != -1){
            batteryType = nextResult;
        }
        else{
            errors.push("Invalid Battery Type used!");
        }
        // Sensor Read Period
        sensorReadPeriod = twoBytesToUInt16(payload.slice(
                    index,
                    index + 2));
        index += 2;
        // Sensor Aggregate Count
        sensorAggregate = payload[index++];
        // Temp Alarms Enabled
        nextResult = getEnumValue(booleanEnum,true,
            payload[index++]);
        if (nextResult != -1){
            tempAlarmsEnabled = nextResult;
        }
        else{
            errors.push("Invalid Temperature Alarm Enable used!");
        }
        // Humidity Alarms Enabled
        nextResult = getEnumValue(booleanEnum,true,
            payload[index++]);
        if (nextResult != -1){
            humidityAlarmsEnabled = nextResult;
        }
        else{
            errors.push("Invalid Humidity Alarm Enable used!");
        }
        // Temp Alarm Low Limit
        tempAlarmLimitLow = byteToInt8(payload[index++]);
        // Temp Alarm High Limit
        tempAlarmLimitHigh = byteToInt8(payload[index++]);
        // Humidty Alarm Low Limit
        humidityAlarmLimitLow = payload[index++];
        // Humidity Alarm High Limit
        humidityAlarmLimitHigh = payload[index++];
        // LED BLE
        ledBle = twoBytesToUInt16(payload.slice(index,
            index + 2));
        index += 2;
        // LED LoRa
        ledLora = twoBytesToUInt16(payload.slice(index,
            index + 2));
    }
    else{
            errors.push("Invalid uplink message length!");
    }
    if (errors.length != 0) {
        result = {
                    errorsOccurred : "True",
                    errors : errors
        };
    }
    else{
        data = {
                msgType : msgType,
                options: options,
                batteryType: batteryType,
                sensorReadPeriod: sensorReadPeriod,
                sensorAggregate: sensorAggregate,
                tempAlarmsEnabled: tempAlarmsEnabled,
                humidityAlarmsEnabled: humidityAlarmsEnabled,
                tempAlarmLimitLow : tempAlarmLimitLow,
                tempAlarmLimitHigh : tempAlarmLimitHigh,
                humidityAlarmLimitLow : humidityAlarmLimitLow,
                humidityAlarmLimitHigh : humidityAlarmLimitHigh,
                ledBle : ledBle,
                ledLora : ledLora,
            };
        result = {
                errorsOccurred : "False",
                data : data
            };
    }
    return(result);
}

/******************************************************************************
 * Decoder for messages of type LAIRD_CONNECTIVITY_MSG_TYPE_FW_VERSION
 *
 * @param payload - message data
 * @return: JSON data
 *****************************************************************************/
function decodeUplinkLairdMsgTypeFirmwareVersion(payload) {

    var msgType;
    var options;
    var releaseDate;
    var releaseNumber;
    var partNumber;
    var errors = [];
    var data = {};
    var index = 0;
    var nextResult;
    var result;

    if (payload.length == 11) {

        // Message Type
        msgType = "Laird_FW_Version";
        index++;
        // Options
        nextResult = getBitfieldValue(uplinkOptionsBitfield,
            true, payload[index++]);
        if (nextResult != -1){
            options = nextResult;
        }
        else{
            errors.push("Invalid option type used!");
        }
        // Release Date
        releaseDate = payload[index++].toString() +
                      '/' +
                      payload[index++].toString() +
                      '/' +
                      payload[index++].toString();
        // Release Number
        releaseNumber = payload[index++].toString() +
                        '.' +
                        payload[index++].toString();
        // Part Number
        partNumber = fourBytesToUInt32(payload.slice(
                        index,
                        index + 4));
        index += 4;
    }
    else{
        errors.push("Invalid uplink message length!");
    }
    if (errors.length != 0){
        result = {
            errorsOccurred : "True",
            errors : errors
        };
    }
    else{
        data = {
            msgType : msgType,
            options : options,
            releaseDate: releaseDate,
            releaseNumber: releaseNumber,
            partNumber: partNumber
        };
        result = {
            errorsOccurred : "False",
            data : data
        };
    }
    return(result);
}

/******************************************************************************
 * Decoder for messages of type "Laird_Contact_Sensor_Config"
 *
 * @param payload - message data
 * @return: JSON data
 *****************************************************************************/
function decodeUplinkLairdMsgTypeContactSensorConfig(payload){

    var msgType;
    var index = 0;
    var nextResult;
    var result = {};
    var operatingMode;
    var loraNotificationOptions;
    var openDwellTime;
    var closedDwellTime;
    var resendInterval;
    var debounceAdjust;
    var options;
    var errors = [];
    var data;

    if (payload.length == 10) {

        // Message type
        msgType = "Laird_Contact_Sensor_Config";
        index++;
        // Options
        nextResult = getBitfieldValue(uplinkOptionsBitfield,
            true, payload[index++]);
        if (nextResult != -1){
            options = nextResult;
        }
        else{
            errors.push("Invalid option type used!");
        }
        // Operating Mode
        nextResult = getEnumValue(operatingModeEnum,
            true, payload[index++]);
        if (nextResult != -1){
            operatingMode = nextResult;
        }
        else{
            errors.push("Invalid Operating Mode used!");
        }
        // LoRa Notification Options
        nextResult = getBitfieldValue(loraIndicationOptionsBitfield,
            true, payload[index++]);
        if (nextResult != -1){
            loraNotificationOptions = nextResult;
        }
        else{
            errors.push("Invalid option type used!");
        }
        // Open Dwell Time
        openDwellTime = twoBytesToUInt16(payload.slice(
            index,index + 2));
        index += 2;
        // Closed Dwell Time
        closedDwellTime = twoBytesToUInt16(payload.slice(
            index,index + 2));
        index += 2;
        // Resend Interval
        resendInterval = payload[index++];
        // Debounce Adjust
        debounceAdjust = payload[index++];
    }
    else{
        errors.push("Invalid uplink message length!");
    }
    if (errors.length != 0){
        result = {
            errorsOccurred : "True",
            errors : errors
        };
    }
    else{
        data = {
            msgType : msgType,
            options : options,
            operatingMode : operatingMode,
            loraNotificationOptions : loraNotificationOptions,
            openDwellTime : openDwellTime,
            closedDwellTime : closedDwellTime,
            resendInterval : resendInterval,
            debounceAdjust : debounceAdjust
        };
        result = {
            errorsOccurred : "False",
            data : data
        };
    }
    return(result);
}

/******************************************************************************
 * Decoder for messages of type LAIRD_CONNECTIVITY_MSG_TYPE_CONTACT_SENSOR_STATE
 *
 * @param payload - message data
 * @return: JSON data
 *****************************************************************************/
function decodeUplinkLairdMsgTypeContactSensorState(payload){

    var msgType;
    var index = 0;
    var nextResult;
    var result = {};
    var operatingMode;
    var state;
    var alertCancellation;
    var counter;
    var errors = [];
    var options;
    var data;

    if (payload.length == 6) {

        // Message type
        msgType = "Laird_Contact_Sensor";
        index++;
        // Options
        nextResult = getBitfieldValue(uplinkOptionsBitfield,
            true, payload[index++]);
        if (nextResult != -1){
            options = nextResult;
        }
        else{
            errors.push("Invalid option type used!");
        }
        // Operating Mode
        nextResult = getEnumValue(operatingModeEnum,
            true, payload[index++]);
        if (nextResult != -1){
            operatingMode = nextResult;
        }
        else{
            errors.push("Invalid Operating Mode used!");
        }
        // Sensor State
        nextResult = getEnumValue(openClosedSensorStateEnum,
            true, payload[index++]);
        if (nextResult != -1){
            state = nextResult;
        }
        else{
            errors.push("Invalid Open Closed Sensor State used!");
        }
        // Alert Cancellation
        nextResult = getEnumValue(booleanEnum,
            true, payload[index++]);
        if (nextResult != -1){
            alertCancellation = nextResult;
        }
        else{
            errors.push("Invalid Open Closed Alert Cancellation used!");
        }
        // State Counter
        counter = payload[index++];
    }
    else{
        errors.push("Invalid uplink message length!");
    }
    if (errors.length != 0){
        result = {
            errorsOccurred : "True",
            errors : errors
        };
    }
    else{
        data = {
            msgType : msgType,
            options : options,
            operatingMode : operatingMode,
            state : state,
            alertCancellation : alertCancellation,
            counter : counter,
        };
        result = {
            errorsOccurred : "False",
            data : data
        };
    }
    return(result);
}

/******************************************************************************
 * Decoder for messages of type "Laird_Battery_Voltage"
 *
 * @param payload - message data
 * @return: JSON data
 *****************************************************************************/
function decodeUplinkLairdMsgTypeBatteryVoltage(payload){

    var msgType;
    var index = 0;
    var nextResult;
    var result = {};
    var voltage;
    var errors = [];
    var options;
    var data;

    if (payload.length == 4) {

        // Message type
        msgType = "Laird_Battery_Voltage";
        index++;
        // Options
        nextResult = getBitfieldValue(uplinkOptionsBitfield,
            true, payload[index++]);
        if (nextResult != -1){
            options = nextResult;
        }
        else{
            errors.push("Invalid option type used!");
        }
        // Voltage
        voltage = twoBytesToFloat(payload.slice(
            index,index+2));
        index += 2;
    }
    else{
        errors.push("Invalid uplink message length!");
    }
    if (errors.length != 0){
        result = {
            errorsOccurred : "True",
            errors : errors
        };
    }
    else{
        data = {
            msgType : msgType,
            options : options,
            voltage : voltage,
        };
        result = {
            errorsOccurred : "False",
            data : data
        };
    }
    return(result);
}

/******************************************************************************
 * Decoder for messages of type LAIRD_CONNECTIVITY_MSG_TYPE_TEMP_EXT
 *
 * @param payload - message data
 * @return: JSON data
 *****************************************************************************/
function decodeUplinkLairdMsgTypeTempExt(payload){

    var msgType;
    var index = 0;
    var nextResult;
    var result = {};
    var temperature;
    var batteryCapacity;
    var alarmMsgCount;
    var backlogMsgCount;
    var errors = [];
    var options;
    var data;

    if (payload.length == 11) {

        // Message type
        msgType = "Laird_RTD";
        index++;
        // Options
        nextResult = getBitfieldValue(uplinkOptionsBitfield,
            true, payload[index++]);
        if (nextResult != -1){
            options = nextResult;
        }
        else{
            errors.push("Invalid option type used!");
        }
        // Temperature data
        temperature = fourBytesToFloat(payload.slice(
            index,
            index +
            4));
        index += 4;
        // Battery Capacity
        nextResult = getEnumValue(batteryCapacityEnum,
            true, payload[index++]);
        if (nextResult != -1){
            batteryCapacity = nextResult;
        }
        else{
            errors.push("Invalid Battery Capacity used!");
        }
        // Alarm Msg Count
        alarmMsgCount = twoBytesToUInt16(payload.slice(
            index,
            index +
            2));
        index += 2;
        // Backlog Msg Count
        backlogMsgCount = twoBytesToUInt16(payload.slice(
            index,
            index +
            2));
        index += 2;
    }
    else{
        errors.push("Invalid uplink message length!");
    }
    if (errors.length != 0){
        result = {
            errorsOccurred : "True",
            errors : errors
        };
    }
    else{
        data = {
            msgType : msgType,
            options : options,
            temperature : temperature,
            batteryCapacity : batteryCapacity,
            alarmMsgCount : alarmMsgCount,
            backlogMsgCount : backlogMsgCount,
        };
        result = {
            errorsOccurred : "False",
            data : data
        };
    }
    return(result);
}

/******************************************************************************
 * Decoder for messages of type LAIRD_CONNECTIVITY_MSG_TYPE_AGG_TEMP_EXT
 *
 * @param payload - message data
 * @return: JSON data
 *****************************************************************************/
function decodeUplinkLairdMsgTypeAggTempExt(payload){

    var result = {};
    var nextResult;
    var readings = [];
    var temperature;
    var msgType;
    var options = [];
    var errors = [];
    var index = 0;
    var alarmMsgCount;
    var backlogMsgCount;
    var numberOfReadings;
    var lengthValid = false;
    var readingsIndex = 0;
    var timestamp;
    var batteryCapacity;
    var data;

    // First check the message meets the minimum length requirement
    if (payload.length > 11) {

        // Then also that the count of readings in bytes equals the size of the message
        var readingsBytesLength = payload[6] *
            4;

        if (payload.length ==
		readingsBytesLength + 11) {

            // OK to proceed if both length checks are OK
            lengthValid = true;
            // Message Type
            msgType = "Laird_Agg_TH";
            index++;
            // Options
            nextResult = getBitfieldValue(uplinkOptionsBitfield,
                true, payload[index++]);
            if (nextResult != -1){
                options = nextResult;
            }
            else{
                errors.push("Invalid option type used!");
            }
            // Alarm Msg Count
            alarmMsgCount = payload[index++];
            // Backlog Msg Count
            backlogMsgCount = twoBytesToUInt16(payload.slice(
                index,
                index +
                2));
            index += 2;
            // Battery Capacity
            nextResult = getEnumValue(batteryCapacityEnum,
                true, payload[index++]);
            if (nextResult != -1){
                batteryCapacity = nextResult;
            }
            else{
                errors.push("Invalid Battery Capacity used!");
            }
            // Number of Readings
            numberOfReadings = payload[index++];
            // Timestamp
            timestamp = convertTimestampToDate(payload.slice(
                index,index + 4));
            index += 4;
            // Now extract the temperature data
            readings = new Array(numberOfReadings);
            for (; index < payload.length ; ) {

                temperature = fourBytesToFloat(payload.slice(
                    index,
                    index +
                    (4)));
                index += (4);

                readings[readingsIndex++] = {
                    'temperature': temperature
                };
            }
        }
    }
    if (lengthValid == false){
        errors.push("Invalid uplink message length!");
    }
    if (errors.length != 0){
        result = {
            errorsOccurred : "True",
            errors : errors
        };
    }
    else{
        data = {
            msgType : msgType,
            options : options,
            alarmMsgCount : alarmMsgCount,
            backlogMsgCount : backlogMsgCount,
            batteryCapacity : batteryCapacity,
            numberOfReadings : numberOfReadings,
            timestamp : timestamp,
            readings : readings,
        };
        result = {
            errorsOccurred : "False",
            data : data
        };
    }
    return(result);
}

/******************************************************************************
 * Decoder for messages of type "Laird_RTD_Config"
 *
 * @param payload - message data
 * @return: JSON data
 *****************************************************************************/
function decodeUplinkLairdMsgRTDConfig(payload){

    var msgType;
    var options;
    var batteryType;
    var sensorReadPeriod;
    var sensorAggregate;
    var tempAlarmsEnabled;
    var tempAlarmLimitLow;
    var tempAlarmLimitHigh;
    var ledBle;
    var ledLora;
    var nextResult;
    var errors = [];
    var data = {};
    var index = 0;
    var result;

    if (payload.length == 15){
        // Message Type
        msgType = "Laird_RTD_Config";
        index++;
        // Options
        nextResult = getBitfieldValue(uplinkOptionsBitfield,
            true, payload[index++]);
        if (nextResult != -1){
            options = nextResult;
        }
        else{
            errors.push("Invalid option type used!");
        }
        // Battery Type
        nextResult = getEnumValue(batteryTypeEnum,true,
            payload[index++]);
        if (nextResult != -1){
            batteryType = nextResult;
        }
        else{
            errors.push("Invalid Battery Type used!");
        }
        // Sensor Read Period
        sensorReadPeriod = twoBytesToUInt16(payload.slice(
                    index,
                    index + 2));
        index += 2;
        // Sensor Aggregate Count
        sensorAggregate = payload[index++];
        // Temp Alarms Enabled
        nextResult = getEnumValue(booleanEnum,true,
            payload[index++]);
        if (nextResult != -1){
            tempAlarmsEnabled = nextResult;
        }
        else{
            errors.push("Invalid Temperature Alarm Enable used!");
        }
        // Temp Alarm Low Limit
        tempAlarmLimitLow = twoBytesToInt16(payload.slice(index,
            index + 2));
        index += 2;
        // Temp Alarm High Limit
        tempAlarmLimitHigh = twoBytesToInt16(payload.slice(index,
            index + 2));
        index += 2;
        // LED BLE
        ledBle = twoBytesToUInt16(payload.slice(index,
            index + 2));
        index += 2;
        // LED LoRa
        ledLora = twoBytesToUInt16(payload.slice(index,
            index + 2));
    }
    else{
            errors.push("Invalid uplink message length!");
    }
    if (errors.length != 0) {
        result = {
                    errorsOccurred : "True",
                    errors : errors
        };
    }
    else{
        data = {
                msgType : msgType,
                options: options,
                batteryType: batteryType,
                sensorReadPeriod: sensorReadPeriod,
                sensorAggregate: sensorAggregate,
                tempAlarmsEnabled: tempAlarmsEnabled,
                tempAlarmLimitLow : tempAlarmLimitLow,
                tempAlarmLimitHigh : tempAlarmLimitHigh,
                ledBle : ledBle,
                ledLora : ledLora,
            };
        result = {
                errorsOccurred : "False",
                data : data
            };
    }
    return(result);
}

/******************************************************************************
 * Entry point for decoding downlinks.
 *
 * @param input: The data to decode.
 * @return: The resultant JSON message
 *****************************************************************************/
function decodeDownlink(input) {

    var output = {};
    var result = {};

    switch(input.bytes[0]){
        case(0x01):
        case(0x07):
        case(0x0B):
            output = decodeDownlinkGenericDataRetrieval(input);
            break;
        case(0x02):
            output = decodeDownlinkGenerateRTCDownlink(input);
            break;
        case(0x03):
            output = decodeDownlinkConfig(input);
            break;
        case(0x04):
            output = decodeDownlinkHeaterControl(input);
            break;
        case(0x05):
            output = decodeDownlinkBackoff(input);
            break;
        case(0x06):
        case(0x0A):
            output = decodeDownlinkRequestBacklog(input);
            break;
        case(0x0F):
        case(0x10):
            output = decodeDownlinkRequestTargetedBacklog(input);
            break;
        default:
            output.errorsOccurred = "True";
            output.errors = ["Invalid message type used!"];
            break;
    }
    if (output.errorsOccurred == "True"){
        result = {errors : output.errors};
    }
    else{
        result = {data : output.data};
    }
    return(result);
}

/******************************************************************************
 * Entry point for encoding downlinks.
 *
 * @param input: The data to encode.
 * @return: The resultant byte array
 *****************************************************************************/
function encodeDownlink(input) {

    var output = {};
    var result = {};

    switch(input.data.msgType){
        case("genericDataRetrieval"):
        case("asFormatFlash"):
        case("asCancelBacklogRetrieval"):
            output = encodeDownlinkGenericDataRetrieval(input);
            break;
        case("generateRTCDownlink"):
            output = encodeDownlinkGenerateRTCDownlink(input);
            break;
        case("config"):
            output = encodeDownlinkConfig(input);
            break;
        case("heaterControl"):
            output = encodeDownlinkHeaterControl(input);
            break;
        case("backoff"):
            output = encodeDownlinkBackoff(input);
            break;
        case("asRequestBacklogFIFO"):
        case("asRequestBacklogLIFO"):
            output = encodeDownlinkRequestBacklog(input);
            break;
        case("asRequestTargetedBacklogFIFO"):
        case("asRequestTargetedBacklogLIFO"):
            output = encodeDownlinkRequestTargetedBacklog(input);
            break;
        default:
            output.errorsOccurred = "True";
            output.errors = ["Invalid message type used!"];
            break;
    }
    if (output.errorsOccurred == "True")
    {
        result = {errors : output.errors};
    }
    else{
        result = {
            bytes : output.data,
            fPort : 1
        };
    }
    return(result);
}

/******************************************************************************
 * Laird Protocol Payload Decoder - Public interface.
 *
 * @param payload: array of bytes.
 * @return: JSON
 *****************************************************************************/
function decodeUplink(input) {

    var output = {};
    var result = {};

    switch(input.bytes[0]){
        case(0x1):
            output = decodeUplinkLairdMsgTypeTempRH(input.bytes);
        break;
        case(0x2):
            output = decodeUplinkLairdMsgTypeAggTempRH(input.bytes);
        break;
        case(0x3):
            output = decodeUplinkLairdMsgTypeBacklogMessage(input.bytes,false);
        break;
        case(0x4):
            output = decodeUplinkLairdMsgTypeBacklogMessages(input.bytes,false);
        break;
        case(0x5):
            output = decodeUplinkLairdMsgSimpleConfig(input.bytes);
        break;
        case(0x6):
            output = decodeUplinkLairdMsgAdvancedConfig(input.bytes);
        break;
        case(0x7):
            output = decodeUplinkLairdMsgTypeFirmwareVersion(input.bytes);
        break;
        case(0xA):
            output = decodeUplinkLairdMsgTypeBatteryVoltage(input.bytes);
        break;
        default:
            output.errorsOccurred = "True";
            output.errors = ["Invalid message type used!"];
            break;
    }
    if (output.errorsOccurred == "True"){
        result = {errors : output.errors};
    }
    else{
        result = {data : output.data};
    }
    return(result);
}

function normalizeUplink(input) {
    return {
      data: {
          air: {
                temperature: input.data.temperature,
                relativeHumidity: input.data.humidity,
            }
    }
  }
}
