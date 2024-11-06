/* istanbul ignore next */
function customDecoder(bytes, fport) {
    var decoded = Decoder(bytes, fport);
    //=======================================================
    // Insert your customization here
    

    //=======================================================
    return decoded;
}

//===========================================================
// Volley Boast Decoder 
//
// Volley Boast maintains the below code, therefore 
// DO NOT EDIT BELOW THIS POINT!!
//===========================================================
const DECODER_MAJOR_VERSION = 2;
const DECODER_MINOR_VERSION = 1;
const DECODER_PATCH_VERSION = 0;

function decodeUplink(input) {
    const decoded = Decoder(input.bytes, input.fPort);
    return decoded;
}

function Decoder(bytes, fport) {
    var decoded = {};
    var decodedData = {};
    var warnings = [];
    var errors = [];

    if (fport == 1) {
        decodedData = parseStandardPayload(bytes);
    }
    else if((fport >= 2) && (fport <= 9)) {
        decodedData = parseModbusStandardPayload(bytes, fport);
    }
    else if (fport == 10) {
        decodedData = parseHeartbeat1p0Payload(bytes);
    }
    else if((fport >= 20) && (fport <= 29)) {
        decodedData = parseHeartbeat2p0Payload(bytes);
    }
    else if((fport >= 30) && (fport <= 39)) {
        decodedData = parseOneAnalogSensorPayload(bytes);
    }
    else if((fport >= 40) && (fport <= 49)) {
        decodedData = parseTwoAnalogSensorsPayload(bytes);
    }
    else if((fport >= 50) && (fport <= 59)) {
        decodedData = parseDigitalSensorsPayload(bytes);
    }
    else if((fport >= 60) && (fport <= 69)) {
        decodedData = parseEventLogPayload(bytes);
    }
    else if((fport >= 70) && (fport <= 79)) {
        decodedData = parseConfigurationPayload(bytes, fport);
    }
    else if((fport >= 100) && (fport <= 109)) {
        decodedData = parseModbusGenericPayload(bytes, fport);
    }
    else if((fport >= 110) && (fport <= 119)) {
        decodedData = parseAnalogInputVariableLengthPayload(bytes, fport);
    }
    else if((fport >= 120) && (fport <= 129)) {
        decodedData = parseModbusStandardVariableLengthPayload(bytes, fport);
    }
    else {
        errors.push('unknown FPort')
    }

    decoded = addVoboMetadata(decodedData, fport);
    decoded.warnings = warnings;
    decoded.errors = errors;
    
    return decoded;
}

function addVoboMetadata(decodedData, fport)
{
    var payload = {};
    payload.data = decodedData;

    var voboType = "";
    var payloadType = "";
    var portSecondDigit = fport % 10;

    if((portSecondDigit == 0) || ((fport >= 1) && (fport < 10))) voboType = "VoBoXX";
    else if(portSecondDigit == 1) voboType = "VoBoTC";

    if(fport == 1) payloadType = "Standard";
    else if ((fport >= 2) && (fport <= 9))
    {
        payloadType = "Modbus Standard";
    }
    else if(fport == 10) payloadType = "Heartbeat 1.0";
    else if((fport >= 20) && (fport <= 29))
    {
        payloadType = "Heartbeat 2.0";
    }
    else if((fport >= 30) && (fport <= 39))
    {
        payloadType = "One Analog Input";
        payload.data.analogSensorString0 = lookupAnalogSensorName(voboType, payload.data.sensorNum0);
        payload.data.engUnitsString0 = lookupUnits(1, payload.data.sensorUnits0);
    }
    else if((fport >= 40) && (fport <= 49))
    {
        payloadType = "Two Analog Inputs";
        payload.data.analogSensorString0 = lookupAnalogSensorName(voboType, payload.data.sensorNum0);
        payload.data.engUnitsString0 = lookupUnits(1, payload.data.sensorUnits0);
        payload.data.analogSensorString1 = lookupAnalogSensorName(voboType, payload.data.sensorNum1);
        payload.data.engUnitsString1 = lookupUnits(1, payload.data.sensorUnits1);
    }
    else if((fport >= 50) && (fport <= 59))
    {
        payloadType = "Digital Inputs";
        payload.data.digitalSensorStrings = [];
        payload.data.digitalSensorData = [];
        for (let i = 0; i < 16; i++)
        {
            let valid = (payload.data.sensorValid0 >> i) & 1;
            if(valid == 1)
            {
                payload.data.digitalSensorStrings.push(lookupDigitalSensorName(voboType, i));
                let data = (payload.data.sensorData0 >> i) & 1;
                payload.data.digitalSensorData.push(data);
            }
        }
    }
    else if((fport >= 60) && (fport <= 69)) payloadType = "Event Log";
    else if((fport >= 70) && (fport <= 79)) payloadType = "Configuration";
    else if((fport >= 100) && (fport <= 109)) payloadType = "Modbus Generic";
    else if((fport >= 110) && (fport <= 119)) payloadType = "Analog Input Variable Length";
    else if((fport >= 120) && (fport <= 129)) payloadType = "Modbus Standard Variable Length";

    payload.data.fport = fport;
    payload.data.voboType = voboType;
    payload.data.payloadType = payloadType;

    return payload;
}

function parseStandardPayload(bytes)
{
    var decoded = {};
    decoded.DIN1 = bytes[0] & 0x01;                                                                 // Discrete digital 1 (1-bit)
    decoded.DIN2 = bytes[0] >> 1 & 0x01;                                                            // Discrete digital 2 (1-bit)
    decoded.DIN3 = bytes[0] >> 2 & 0x01;                                                            // Discrete digital 3 (1-bit)
    decoded.WKUP = bytes[0] >> 3 & 0x01;                                                            // Discrete digital wakeup (1-bit)
    decoded.ADC1 = ((bytes[0] & 0xf0) >> 4) | (bytes[1] << 4);                                      // ADC 1 (12-bit)
    decoded.ADC2 = (bytes[3] & 0x0f) << 8 | bytes[2];                                               // ADC 2 (12-bit)
    decoded.ADC3 = ((bytes[3] & 0xf0) >> 4) | (bytes[4] << 4);                                      // ADC 3 (12-bit)
    decoded.Battery = ((bytes[6] & 0x0f) << 8 | bytes[5]) * 4;                                      // ADC battery (12-bit)
    if ((bytes[7] >> 7 & 0x01) == 0) {
        decoded.Temperature = (((bytes[6] & 0xf0) >> 4) | (bytes[7] << 4)) * 0.125;                 // ADC temperature (12-bit) above 0 degrees C
    } else {
        decoded.Temperature = (4096 - (((bytes[6] & 0xf0) >> 4) | (bytes[7] << 4))) * 0.125 * (-1); // ADC temperature (12-bit) below 0 degrees C
    }
    decoded.Modbus0 = bytes[9] << 8 | bytes[8];                                                     // Modbus-RS485 (16-bit)
    return decoded;
}

function parseModbusStandardPayload(bytes, fport)
{
    var startIdx = (fport - 1) * 5 - 4;
    var decoded = {};
    decoded["Modbus"+startIdx++] = (bytes[1] << 8) | bytes[0];  // Modbus-RS485 (16-bit)
    decoded["Modbus"+startIdx++] = (bytes[3] << 8) | bytes[2];  // Modbus-RS485 (16-bit)
    decoded["Modbus"+startIdx++] = (bytes[5] << 8) | bytes[4];  // Modbus-RS485 (16-bit)
    decoded["Modbus"+startIdx++] = (bytes[7] << 8) | bytes[6];  // Modbus-RS485 (16-bit)
    decoded["Modbus"+startIdx]   = (bytes[9] << 8) | bytes[8];  // Modbus-RS485 (16-bit)
    return decoded;
}

function parseHeartbeat1p0Payload(bytes)
{
    var decoded = {};
    decoded.batteryLevelMV = ((bytes[1] & 0x0f) << 8 | bytes[0]) * 4;                                                   // ADC battery (12-bit)
    decoded.fwVersionMajor = (bytes[2] & 0x0f) | (bytes[1] & 0xf0) >> 4;                                                // FW Version Major (8-bit)
    decoded.fwVersionMinor = (bytes[3] & 0x0f) | (bytes[2] & 0xf0) >> 4;                                                // FW Version Minor (8-bit)
    decoded.fwVersionPatch = (bytes[4] & 0x0f) | (bytes[3] & 0xf0) >> 4;                                                // FW Version Patch (8-bit)
    decoded.fwVersionCustom = (bytes[4] & 0xf0) >> 4;                                                                   // FW Version Custom (4-bit)
    decoded.recSignalLevels = bytes[5] * -1;                                                                            // Last RSSI (8 bits)
    decoded.analogVoltageConfig = (bytes[6] & 0x1f);                                                                    // Analog Voltage Config (5 bits)
    decoded.analogPowerTimeConfig = parseFloat((((bytes[7] & 0x1F) << 3 | (bytes[6] & 0xE0) >> 5) / 10).toFixed(1));    // Analog Power Time Config (8 bits)
    decoded.failedTransmissionBeforeRejoinConfig = (bytes[8] & 0x01) << 3 | (bytes[7] & 0xE0) >> 5;                     // Failed Transmissions Before Rejoin Config (4 bits)
    decoded.cycleThroughFSB = (bytes[8] & 0x02) >> 1;                                                                   // Cycle Through FSB (1 bit)
    decoded.ackEnable = (bytes[8] & 0x04) >> 2;                                                                         // ACK Enable (1 bit)
    decoded.ackFreq = (bytes[8] & 0x78) >> 3;                                                                           // ACK Frequency (4 bits)
    decoded.ackReq = (bytes[9] & 0x07) << 1 | (bytes[8] & 0x80) >> 7;                                                   // ACK Request (4 bits)
    decoded.batteryLevelThreshold = (((bytes[10] & 0x7F)  << 5) | (bytes[9] & 0xF8) >> 3) * 4;                          // Battery Level Threshold (12-bit)

    return decoded;
}

function parseHeartbeat2p0Payload(bytes)
{
    var decoded = {};
    decoded.batteryLevel = (bytes[1] & 0x0F) << 8 | bytes[0];       // Current Battery level in mV
    decoded.fatalErrorsTotal = (bytes[1] & 0xF0) >> 4;              // Total number of Fatal Error detected by the handler (triggering reboot) for the last HeartBeat interval
    decoded.rssiAvg = bytes[2];                                     // RSSI of received signal from LoRaWAN GW - average for the last HeartBeat interval
    decoded.failedJoinAttemptsTotal = bytes[3] & 0x7F;              // Total Number of Failed Join Attempts to LoRaWAN network for the last HeartBeat interval
    decoded.configUpdateOccurred = (bytes[3] & 0x80) >> 7;          // Indicates if one or more config updates occurred for the last HeartBeat interval
    decoded.firmwareRevision = (bytes[5] & 0x03) << 8 | bytes[4];   // Firmware revision encoding.
    decoded.rebootsTotal = (bytes[5] & 0x1C) >> 2;                  // Total number of VoBo reboots not including Fatal Error for the last HeartBeat interval
    decoded.failedTransmitsTotal = (bytes[5] & 0xE0) >> 5;          // Total Number of Failed LoRaWAN Transmits for the last HeartBeat interval
    decoded.errorEventLogsTotal = bytes[6];                         // Total number of Error Event Logs written for the last HeartBeat interval
    decoded.warningEventLogsTotal = bytes[7];                       // Total number of Warning Event Logs written for the last HeartBeat interval
    decoded.infoEventLogsTotal = bytes[8];                          // Total number of Info Event Logs written for the last HeartBeat interval
    decoded.measurementPacketsTotal = (bytes[10]) << 8 | bytes[9];  // Number of Measurements Packets successfully sent for the last HeartBeat interval

    return decoded;
}

function bytesToFloat32(bytesArray)
{
    var buffer = new ArrayBuffer(4);
    var bytesRaw = new Uint8Array(buffer);
    bytesRaw[0] = bytesArray[0];
    bytesRaw[1] = bytesArray[1];
    bytesRaw[2] = bytesArray[2];
    bytesRaw[3] = bytesArray[3];    
    var float32Res = new DataView(buffer).getFloat32(0, false);

    return float32Res;
}

function parseOneAnalogSensorPayload(bytes)
{
    var decoded = {};
    decoded.sensorNum0 = bytes[0];                              // Sensor Num 0 (8-bit)
    decoded.sensorUnits0 = bytes[1];                            // Sensor Units 0 (8-bit)
    decoded.sensorData0 = bytesToFloat32(bytes.slice(2,6));     // Sensor Data 0 (32-bit)

    return decoded;
}

function parseTwoAnalogSensorsPayload(bytes)
{
    var decoded = {};
    decoded.sensorNum0 = (bytes[0] & 0xF0) >> 4;                // Sensor Num 0 (4-bit)
    decoded.sensorUnits0 = bytes[1];                            // Sensor Units 0 (8-bit)
    decoded.sensorData0 = bytesToFloat32(bytes.slice(2,6));     // Sensor Data 0 (32-bit)
    decoded.sensorNum1 = bytes[0] & 0x0F;                       // Sensor Num 1 (4-bit)
    decoded.sensorUnits1 = bytes[6];                            // Sensor Units 1 (8-bit)
    decoded.sensorData1 = bytesToFloat32(bytes.slice(7,11));    // Sensor Data 1 (32-bit)
    
    return decoded;
}

function parseDigitalSensorsPayload(bytes)
{
    var decoded = {};
    decoded.sensorValid0 = (bytes[1] << 8) | bytes[0];          // Sensor Valid 0 (16-bit)
    decoded.sensorData0 = (bytes[3] << 8) | bytes[2];           // Sensor Data 0 (16-bit)

    return decoded;
}

function parseEventLogPayload(bytes)
{
    var decoded = {};
    decoded.eventTimestamp = bytes[0] + bytes[1]*Math.pow(2, 8) + bytes[2]*Math.pow(2, 16) + bytes[3]*Math.pow(2, 24);
    decoded.eventCode = bytes[4] + bytes[5]*Math.pow(2, 8);
    decoded.metadata = Array.prototype.slice.call(bytes.slice(6, 11), 0);

    return decoded;
}

function parseVoboLibGeneralConfigurationPayload(bytes)
{
    var decoded = {};
    decoded.subgroupID = bytes[0] & 0x0F;                                           // Sub-Group ID (4-bit)
    decoded.sequenceNumber = (bytes[0] & 0xF0) >> 4;                                // Sequence Number (4-bit)

    if (decoded.sequenceNumber == 0)
    {
        decoded.transRejoin = bytes[1] & 0x0F;                                          // Transmission Rejoin (4-bit)
        decoded.ackFrequency = (bytes[1] & 0xF0) >> 4;                                  // Acknowledgement Frequency for Data (4-bit)
        decoded.lowBattery = parseFloat(((bytes[2] & 0x0F) / 10.0 + 2.5).toFixed(1));   // Low Battery Threshold (4-bit)
        decoded.reserved1 = (bytes[2] & 0x10) >> 4;                                     // Reserved 1 Field (1-bit)
        decoded.heartbeatAckEnable = Boolean((bytes[2] & 0x20) >> 5);                   // Acknowledgement Enable for Heartbeat (1-bit)
        decoded.operationMode = (bytes[2] & 0x40) >> 6;                                 // Operation Mode (1-bit)
        decoded.cycleSubBands = Boolean((bytes[2] & 0x80) >> 7);                        // Cycle Sub Bands Enable (1-bit)
        decoded.ackRetries = (bytes[3] & 0x07);                                         // Acknowledgement Retries (3-bit)
        decoded.reservedLL = (bytes[3] & 0x38) >> 3;                                    // Reserved LL (3-bit)
        decoded.ackEnable = Boolean((bytes[3] & 0x40) >> 6);                            // Acknowledgement Enable for Data (1-bit)
        decoded.heartbeatEnable = Boolean((bytes[3] & 0x80) >> 7);                      // Heartbeat Enable (1-bit)
        decoded.cycleTime = ((bytes[6] & 0x03) << 16) | (bytes[5] << 8) | bytes[4];     // Cycle Time (18-bit)
        decoded.backOffReset = (bytes[6] & 0xFC) >> 2;                                  // BackOff Reset (6-bit)
        decoded.reservedRD = bytes[7] & 0x3F;                                           // Reserved RD (6-bit)
        decoded.reserved2 = (bytes[7] & 0xC0) >> 6;                                     // Reserved 2 Field (2-bit)
        decoded.resendAttempts = bytes[8] & 0x0F;                                       // Resend Attempts (4-bit)
        decoded.freqSubBand = (bytes[8] & 0xF0) >> 4;                                   // Frequency Sub Band (4-bit)
    }
    if (decoded.sequenceNumber == 1)
    {
        decoded.timeSyncInterval = bytes[1];                                // Time Sync Interval in 30 minutes quantities (8-bit)
        decoded.joinEUI = "";                                               // LoRaWAN Join EUI (64-bit)
        for(let i = 9; i >= 2; i--)
        {
            decoded.joinEUI += bytes[i].toString(16).toUpperCase().padStart(2,0);
            if(i != 2) decoded.joinEUI += "-";
        }
        decoded.joinNonceResetEnable = Boolean(bytes[10] & 0x01);            // Join Nonce Reset Enable (1-bit)
        decoded.timeSyncWakeupEnable = Boolean((bytes[10] & 0x02) >> 1);    // Time Sync Wakeup Enable (1-bit)
        decoded.reserved1 = (bytes[10] & 0xFC) >> 2;                         // Reserved 1 Field (1-bit)
    }

    return decoded;
}

function parseVoboLibVoboSyncConfigurationPayload(bytes)
{
    var decoded = {};
    decoded.subgroupID = bytes[0] & 0x0F;                                                               // Sub-Group ID (4-bit)
    decoded.sequenceNumber = (bytes[0] & 0xF0) >> 4;                                                    // Sequence Number (4-bit)
    
    if (decoded.sequenceNumber == 0)
    {
        decoded.vbsNodeNumber = (bytes[2] << 8) | bytes[1];                                             // VoboSync Node Number (16-bit)
        decoded.vbsTimeReference = bytes.slice(3, 7).readUInt32LE();                                    // VoboSync Time Reference (32-bit)
        decoded.reservedVCPDS = bytes[7] & 0x0F;                                                        // Reserved VCPDS (4-bit)
        decoded.reservedVMPDS = (bytes[7] & 0xF0) >> 4;                                                 // Reserved VMPDS (4-bit)
        decoded.reservedVUDS = bytes[8] & 0x0F;                                                         // Reserved VUDS (4-bit)
        decoded.reserved1 = (bytes[8] & 0x70) >> 4;                                                     // Reserved 1 Field (3-bit)
        decoded.vbsEnable = Boolean((bytes[8] & 0x80) >> 7);                                            // VoboSync Enable (1-bit)
        decoded.reserved3 = bytes[9] & 0x3F;                                                            // Reserved 3 (6-bit)
        decoded.reserved2 = (bytes[9] & 0xC0) >> 6;                                                     // Reserved 2 Field (2-bit)
    }
    if (decoded.sequenceNumber == 1)
    {
        decoded.vbsMeasurementDelaySec = bytes[1] & 0x7F;                                               // VoboSync Measurement Delay (7-bit)
        decoded.reserved1 = (bytes[1] & 0x80) >> 7;                                                     // Reserved 1 Field (1-bit)
        decoded.vbsUplinkDelaySec = bytes[2] & 0x7F;                                                    // VoboSync Uplink Delay (7-bit)
        decoded.reserved2 = (bytes[2] & 0x80) >> 7;                                                     // Reserved 2 Field (1-bit)
    }

    return decoded;
}

function parseVoboXXGeneralConfigurationPayload(bytes)
{
    var decoded = {};
    decoded.subgroupID = bytes[0] & 0x0F;                                   // Sub-Group ID (4-bit)
    decoded.sequenceNumber = (bytes[0] & 0xF0) >> 4;                        // Sequence Number (4-bit)
    decoded.analogVoltage = parseFloat((bytes[1] / 10).toFixed(1));         // Analog Voltage (8-bit)
    decoded.powerTime = parseFloat((bytes[2] / 10).toFixed(1));             // Analog Power Time (8-bit)
    decoded.mbEnable = Boolean(bytes[3] & 0x01);                            // Modbus Enable (1-bit)
    decoded.engUnitsEnable = Boolean((bytes[3] >> 1) & 0x01);               // Engineering Units Enable (1-bit)
    decoded.din1TransmitEnable = Boolean((bytes[3] >> 2) & 0x01);           // DIN1 Transmit Enable (1-bit)
    decoded.din2TransmitEnable = Boolean((bytes[3] >> 3) & 0x01);           // DIN2 Transmit Enable (1-bit)
    decoded.din3TransmitEnable = Boolean((bytes[3] >> 4) & 0x01);           // DIN3 Transmit Enable (1-bit)
    decoded.wkupTransmitEnable = Boolean((bytes[3] >> 5) & 0x01);           // WKUP Transmit Enable (1-bit)
    decoded.ain1TransmitEnable = Boolean((bytes[3] >> 6) & 0x01);           // AIN1 Transmit Enable (1-bit)
    decoded.ain2TransmitEnable = Boolean((bytes[3] >> 7) & 0x01);           // AIN2 Transmit Enable (1-bit)
    decoded.ain3TransmitEnable = Boolean(bytes[4] & 0x01);                  // AIN3 Transmit Enable (1-bit)
    decoded.batteryLevelTransmitEnable = Boolean((bytes[4] >> 1) & 0x01);   // Battery Level Transmit Enable (1-bit)
    decoded.adcTemperatureTransmitEnable = Boolean((bytes[4] >> 2) & 0x01); // ADC Temperature Transmit Enable (1-bit)
    decoded.mbTransmitEnable = Boolean((bytes[4] >> 3) & 0x01);             // Modbus Transmit Enable (1-bit)
    decoded.ainPayloadType = (bytes[4] >> 4) & 0x01;                        // Ain Payload Type (1-bit)
    decoded.reserved1 = (bytes[4] >> 4) & 0x07;                             // Reserved 1 Field (2-bit)
    decoded.reservedMAME = Boolean((bytes[4] >> 7) & 0x01);                 // Reserved MAME Field (1-bit) 

    return decoded;
}

function parseVoboXXModbusGeneralConfigurationPayload(bytes)
{
    var decoded = {};
    decoded.subgroupID = bytes[0] & 0x0F;                               // Sub-Group ID (4-bit)
    decoded.sequenceNumber = (bytes[0] & 0xF0) >> 4;                    // Sequence Number (4-bit)
    decoded.mbTimeout = (bytes[2] << 8) | bytes[1];                     // Modbus Timeout in milliseconds (16-bit)
    decoded.mbBaud = bytes[3] & 0x0F;                                   // Modbus Baud Rate - encoded (4-bit)
    decoded.mbStopBits = (bytes[3] >> 4) & 0x03;                        // Modbus Stop Bits (2-bit)
    decoded.mbParity = (bytes[3] >> 6) & 0x03;                          // Modbus Parity (2-bit)
    decoded.mbPayloadType = bytes[4] & 0x03;                            // Modbus Payload Type (2-bit)
    decoded.reserved1 = (bytes[4] >> 2) & 0x3F;                         // Reserved 1 Field (6-bit) 

    return decoded;
}

function parseVoboXXModbusGroupsEnableConfigurationPayload(bytes)
{
    var decoded = {};
    decoded.subgroupID = bytes[0] & 0x0F;                               // Sub-Group ID (4-bit)
    decoded.sequenceNumber = (bytes[0] & 0xF0) >> 4;                    // Sequence Number (4-bit)

    if (decoded.subgroupID == 6)
    {
        decoded.mbFirstCycleG1 = Boolean(bytes[1] & 0x01);              // Group 1 First Cycle Enable
        decoded.mbFirstCycleG2 = Boolean((bytes[1] >> 1) & 0x01);       // Group 2 First Cycle Enable
        decoded.mbFirstCycleG3 = Boolean((bytes[1] >> 2) & 0x01);       // Group 3 First Cycle Enable
        decoded.mbFirstCycleG4 = Boolean((bytes[1] >> 3) & 0x01);       // Group 4 First Cycle Enable
        decoded.mbFirstCycleG5 = Boolean((bytes[1] >> 4) & 0x01);       // Group 5 First Cycle Enable
        decoded.mbFirstCycleG6 = Boolean((bytes[1] >> 5) & 0x01);       // Group 6 First Cycle Enable
        decoded.mbFirstCycleG7 = Boolean((bytes[1] >> 6) & 0x01);       // Group 7 First Cycle Enable
        decoded.mbFirstCycleG8 = Boolean((bytes[1] >> 7) & 0x01);       // Group 8 First Cycle Enable
        decoded.mbFirstCycleG9 = Boolean(bytes[2] & 0x01);              // Group 9 First Cycle Enable
        decoded.mbFirstCycleG10 = Boolean((bytes[2] >> 1) & 0x01);      // Group 10 First Cycle Enable
        decoded.mbFirstCycleG11 = Boolean((bytes[2] >> 2) & 0x01);      // Group 11 First Cycle Enable
        decoded.mbFirstCycleG12 = Boolean((bytes[2] >> 3) & 0x01);      // Group 12 First Cycle Enable
        decoded.mbFirstCycleG13 = Boolean((bytes[2] >> 4) & 0x01);      // Group 13 First Cycle Enable
        decoded.mbFirstCycleG14 = Boolean((bytes[2] >> 5) & 0x01);      // Group 14 First Cycle Enable
        decoded.mbFirstCycleG15 = Boolean((bytes[2] >> 6) & 0x01);      // Group 15 First Cycle Enable
        decoded.mbFirstCycleG16 = Boolean((bytes[2] >> 7) & 0x01);      // Group 16 First Cycle Enable
        decoded.mbFirstCycleG17 = Boolean(bytes[3] & 0x01);             // Group 17 First Cycle Enable
        decoded.mbFirstCycleG18 = Boolean((bytes[3] >> 1) & 0x01);      // Group 18 First Cycle Enable
        decoded.mbFirstCycleG19 = Boolean((bytes[3] >> 2) & 0x01);      // Group 19 First Cycle Enable
        decoded.mbFirstCycleG20 = Boolean((bytes[3] >> 3) & 0x01);      // Group 20 First Cycle Enable
        decoded.mbFirstCycleG21 = Boolean((bytes[3] >> 4) & 0x01);      // Group 21 First Cycle Enable
        decoded.mbFirstCycleG22 = Boolean((bytes[3] >> 5) & 0x01);      // Group 22 First Cycle Enable
        decoded.mbFirstCycleG23 = Boolean((bytes[3] >> 6) & 0x01);      // Group 23 First Cycle Enable
        decoded.mbFirstCycleG24 = Boolean((bytes[3] >> 7) & 0x01);      // Group 24 First Cycle Enable
        decoded.mbFirstCycleG25 = Boolean(bytes[4] & 0x01);             // Group 25 First Cycle Enable
        decoded.mbFirstCycleG26 = Boolean((bytes[4] >> 1) & 0x01);      // Group 26 First Cycle Enable
        decoded.mbFirstCycleG27 = Boolean((bytes[4] >> 2) & 0x01);      // Group 27 First Cycle Enable
        decoded.mbFirstCycleG28 = Boolean((bytes[4] >> 3) & 0x01);      // Group 28 First Cycle Enable
        decoded.mbFirstCycleG29 = Boolean((bytes[4] >> 4) & 0x01);      // Group 29 First Cycle Enable
        decoded.mbFirstCycleG30 = Boolean((bytes[4] >> 5) & 0x01);      // Group 30 First Cycle Enable
        decoded.mbFirstCycleG31 = Boolean((bytes[4] >> 6) & 0x01);      // Group 31 First Cycle Enable
        decoded.mbFirstCycleG32 = Boolean((bytes[4] >> 7) & 0x01);      // Group 32 First Cycle Enable
        decoded.mbFirstCycleG33 = Boolean(bytes[5] & 0x01);             // Group 33 First Cycle Enable
        decoded.mbFirstCycleG34 = Boolean((bytes[5] >> 1) & 0x01);      // Group 34 First Cycle Enable
        decoded.mbFirstCycleG35 = Boolean((bytes[5] >> 2) & 0x01);      // Group 35 First Cycle Enable
        decoded.mbFirstCycleG36 = Boolean((bytes[5] >> 3) & 0x01);      // Group 36 First Cycle Enable
        decoded.mbFirstCycleG37 = Boolean((bytes[5] >> 4) & 0x01);      // Group 37 First Cycle Enable
        decoded.mbFirstCycleG38 = Boolean((bytes[5] >> 5) & 0x01);      // Group 38 First Cycle Enable
        decoded.mbFirstCycleG39 = Boolean((bytes[5] >> 6) & 0x01);      // Group 39 First Cycle Enable
        decoded.mbFirstCycleG40 = Boolean((bytes[5] >> 7) & 0x01);      // Group 40 First Cycle Enable
        decoded.mbFirstCycleG41 = Boolean(bytes[6] & 0x01);             // Group 41 First Cycle Enable
        decoded.reserved1 = (bytes[6] >> 1) & 0x7F;                     // Reserved 1 Field (7-bit) 
    }
    if (decoded.subgroupID == 7)
    {
        decoded.mbSubseqCyclesG1 = Boolean(bytes[1] & 0x01);             // Group 1 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG2 = Boolean((bytes[1] >> 1) & 0x01);      // Group 2 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG3 = Boolean((bytes[1] >> 2) & 0x01);      // Group 3 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG4 = Boolean((bytes[1] >> 3) & 0x01);      // Group 4 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG5 = Boolean((bytes[1] >> 4) & 0x01);      // Group 5 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG6 = Boolean((bytes[1] >> 5) & 0x01);      // Group 6 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG7 = Boolean((bytes[1] >> 6) & 0x01);      // Group 7 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG8 = Boolean((bytes[1] >> 7) & 0x01);      // Group 8 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG9 = Boolean(bytes[2] & 0x01);             // Group 9 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG10 = Boolean((bytes[2] >> 1) & 0x01);     // Group 10 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG11 = Boolean((bytes[2] >> 2) & 0x01);     // Group 11 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG12 = Boolean((bytes[2] >> 3) & 0x01);     // Group 12 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG13 = Boolean((bytes[2] >> 4) & 0x01);     // Group 13 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG14 = Boolean((bytes[2] >> 5) & 0x01);     // Group 14 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG15 = Boolean((bytes[2] >> 6) & 0x01);     // Group 15 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG16 = Boolean((bytes[2] >> 7) & 0x01);     // Group 16 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG17 = Boolean(bytes[3] & 0x01);            // Group 17 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG18 = Boolean((bytes[3] >> 1) & 0x01);     // Group 18 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG19 = Boolean((bytes[3] >> 2) & 0x01);     // Group 19 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG20 = Boolean((bytes[3] >> 3) & 0x01);     // Group 20 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG21 = Boolean((bytes[3] >> 4) & 0x01);     // Group 21 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG22 = Boolean((bytes[3] >> 5) & 0x01);     // Group 22 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG23 = Boolean((bytes[3] >> 6) & 0x01);     // Group 23 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG24 = Boolean((bytes[3] >> 7) & 0x01);     // Group 24 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG25 = Boolean(bytes[4] & 0x01);            // Group 25 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG26 = Boolean((bytes[4] >> 1) & 0x01);     // Group 26 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG27 = Boolean((bytes[4] >> 2) & 0x01);     // Group 27 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG28 = Boolean((bytes[4] >> 3) & 0x01);     // Group 28 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG29 = Boolean((bytes[4] >> 4) & 0x01);     // Group 29 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG30 = Boolean((bytes[4] >> 5) & 0x01);     // Group 30 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG31 = Boolean((bytes[4] >> 6) & 0x01);     // Group 31 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG32 = Boolean((bytes[4] >> 7) & 0x01);     // Group 32 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG33 = Boolean(bytes[5] & 0x01);            // Group 33 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG34 = Boolean((bytes[5] >> 1) & 0x01);     // Group 34 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG35 = Boolean((bytes[5] >> 2) & 0x01);     // Group 35 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG36 = Boolean((bytes[5] >> 3) & 0x01);     // Group 36 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG37 = Boolean((bytes[5] >> 4) & 0x01);     // Group 37 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG38 = Boolean((bytes[5] >> 5) & 0x01);     // Group 38 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG39 = Boolean((bytes[5] >> 6) & 0x01);     // Group 39 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG40 = Boolean((bytes[5] >> 7) & 0x01);     // Group 40 Subsequent Cycle Enable
        decoded.mbSubseqCyclesG41 = Boolean(bytes[6] & 0x01);            // Group 41 Subsequent Cycle Enable
        decoded.reserved1 = (bytes[6] >> 1) & 0x7F;                     // Reserved 1 Field (7-bit) 
    }

    return decoded;
}

function parseVoboXXModbusGroupsConfigurationPayload(bytes)
{
    var decoded = {};
    decoded.subgroupID = bytes[0] & 0x0F;                                           // Sub-Group ID (4-bit)
    decoded.sequenceNumber = (bytes[0] & 0xF0) >> 4;                                // Sequence Number (4-bit)

    var groupIdx = ((decoded.subgroupID - 8) * 16) + decoded.sequenceNumber + 1;    // Sub-Groups 8, 9 and 10 carry the groups configurations. Group index is determined by Sub-Group ID and Sequence Number.
    var groupIdxStr = (groupIdx).toString();
    decoded["mbFirstCycleG" + groupIdxStr] = Boolean(bytes[1] & 0x01);              // Modbus Group First Cycle Enable (1-bit)
    decoded["mbSubseqCyclesG" + groupIdxStr] = Boolean((bytes[1] >> 1) & 0x01);     // Modbus Group Subsequent Cycle Enable (1-bit)
    decoded["mbByteSwapG" + groupIdxStr] = Boolean((bytes[1] >> 2) & 0x01);         // Modbus Group Byte Swap Enable (1-bit)
    decoded["mbWordSwapG" + groupIdxStr] = Boolean((bytes[1] >> 3) & 0x01);         // Modbus Group Word Swap Enable (1-bit)
    decoded["mbNumTypeG" + groupIdxStr] = (bytes[1] >> 4) & 0x03;                   // Modbus Group Numerical Type (2-bit)
    decoded["reserved1"] = (bytes[1] >> 6) & 0x03;                                  // Reserved 1 Field (2-bit)
    decoded["mbSlaveAddrG" + groupIdxStr] = bytes[2];                               // Modbus Group Slave Address (8-bit)
    decoded["mbStartAddrG" + groupIdxStr] = (bytes[4] << 8) | bytes[3];             // Modbus Group Start Address (16-bit)
    decoded["mbNumRegsG" + groupIdxStr] = bytes[5];                                 // Modbus Group Number of Registers (8-bit)
    decoded["mbWdataG" + groupIdxStr] = (bytes[7] << 8) | bytes[6];                 // Modbus Group Write Data (16-bit)
    decoded["mbGrpDelayG" + groupIdxStr] = (bytes[9] << 8) | bytes[8];              // Modbus Group Delay in milliseconds (16-bit)
    decoded["mbFuncCodeG" + groupIdxStr] = bytes[10] & 0x3F;                        // Modbus Group Function Code (6-bit)
    decoded["reserved2"] = (bytes[10] >> 6) & 0x03;                                 // Reserved 2 Field (2-bit)

    return decoded;
}

function parseVoboXXModbusPayloadsSlotsConfigurationPayload(bytes)
{
    var decoded = {};
    decoded.subgroupID = bytes[0] & 0x0F;               // Sub-Group ID (4-bit)
    decoded.sequenceNumber = (bytes[0] & 0xF0) >> 4;    // Sequence Number (4-bit)

    if (decoded.sequenceNumber == 0)
    {
        decoded.mbGroupPaySlot0 = bytes[1];             // Modbus Payload Slot 0 Group Idx (8-bit)
        decoded.mbRegPaySlot0 = bytes[2];               // Modbus Payload Slot 0 Register Idx (8-bit)
        decoded.mbGroupPaySlot1 = bytes[3];             // Modbus Payload Slot 1 Group Idx (8-bit)
        decoded.mbRegPaySlot1 = bytes[4];               // Modbus Payload Slot 1 Register Idx (8-bit)
        decoded.mbGroupPaySlot2 = bytes[5];             // Modbus Payload Slot 2 Group Idx (8-bit)
        decoded.mbRegPaySlot2 = bytes[6];               // Modbus Payload Slot 2 Register Idx (8-bit)
        decoded.mbGroupPaySlot3 = bytes[7];             // Modbus Payload Slot 3 Group Idx (8-bit)
        decoded.mbRegPaySlot3 = bytes[8];               // Modbus Payload Slot 3 Register Idx (8-bit)
        decoded.mbGroupPaySlot4 = bytes[9];             // Modbus Payload Slot 4 Group Idx (8-bit)
        decoded.mbRegPaySlot4 = bytes[10];              // Modbus Payload Slot 4 Register Idx (8-bit)
    }
    if (decoded.sequenceNumber == 1)
    {
        decoded.mbGroupPaySlot5 = bytes[1];             // Modbus Payload Slot 5 Group Idx (8-bit)
        decoded.mbRegPaySlot5 = bytes[2];               // Modbus Payload Slot 5 Register Idx (8-bit)
        decoded.mbGroupPaySlot6 = bytes[3];             // Modbus Payload Slot 6 Group Idx (8-bit)
        decoded.mbRegPaySlot6 = bytes[4];               // Modbus Payload Slot 6 Register Idx (8-bit)
        decoded.mbGroupPaySlot7 = bytes[5];             // Modbus Payload Slot 7 Group Idx (8-bit)
        decoded.mbRegPaySlot7 = bytes[6];               // Modbus Payload Slot 7 Register Idx (8-bit)
        decoded.mbGroupPaySlot8 = bytes[7];             // Modbus Payload Slot 8 Group Idx (8-bit)
        decoded.mbRegPaySlot8 = bytes[8];               // Modbus Payload Slot 8 Register Idx (8-bit)
        decoded.mbGroupPaySlot9 = bytes[9];             // Modbus Payload Slot 9 Group Idx (8-bit)
        decoded.mbRegPaySlot9 = bytes[10];              // Modbus Payload Slot 9 Register Idx (8-bit)
    }
    if (decoded.sequenceNumber == 2)
    {
        decoded.mbGroupPaySlot10 = bytes[1];            // Modbus Payload Slot 10 Group Idx (8-bit)
        decoded.mbRegPaySlot10 = bytes[2];              // Modbus Payload Slot 10 Register Idx (8-bit)
        decoded.mbGroupPaySlot11 = bytes[3];            // Modbus Payload Slot 11 Group Idx (8-bit)
        decoded.mbRegPaySlot11 = bytes[4];              // Modbus Payload Slot 11 Register Idx (8-bit)
        decoded.mbGroupPaySlot12 = bytes[5];            // Modbus Payload Slot 12 Group Idx (8-bit)
        decoded.mbRegPaySlot12 = bytes[6];              // Modbus Payload Slot 12 Register Idx (8-bit)
        decoded.mbGroupPaySlot13 = bytes[7];            // Modbus Payload Slot 13 Group Idx (8-bit)
        decoded.mbRegPaySlot13 = bytes[8];              // Modbus Payload Slot 13 Register Idx (8-bit)
        decoded.mbGroupPaySlot14 = bytes[9];            // Modbus Payload Slot 14 Group Idx (8-bit)
        decoded.mbRegPaySlot14 = bytes[10];             // Modbus Payload Slot 14 Register Idx (8-bit)
    }
    if (decoded.sequenceNumber == 3)
    {
        decoded.mbGroupPaySlot15 = bytes[1];            // Modbus Payload Slot 15 Group Idx (8-bit)
        decoded.mbRegPaySlot15 = bytes[2];              // Modbus Payload Slot 15 Register Idx (8-bit)
        decoded.mbGroupPaySlot16 = bytes[3];            // Modbus Payload Slot 16 Group Idx (8-bit)
        decoded.mbRegPaySlot16 = bytes[4];              // Modbus Payload Slot 16 Register Idx (8-bit)
        decoded.mbGroupPaySlot17 = bytes[5];            // Modbus Payload Slot 17 Group Idx (8-bit)
        decoded.mbRegPaySlot17 = bytes[6];              // Modbus Payload Slot 17 Register Idx (8-bit)
        decoded.mbGroupPaySlot18 = bytes[7];            // Modbus Payload Slot 18 Group Idx (8-bit)
        decoded.mbRegPaySlot18 = bytes[8];              // Modbus Payload Slot 18 Register Idx (8-bit)
        decoded.mbGroupPaySlot19 = bytes[9];            // Modbus Payload Slot 19 Group Idx (8-bit)
        decoded.mbRegPaySlot19 = bytes[10];             // Modbus Payload Slot 19 Register Idx (8-bit)
    }
    if (decoded.sequenceNumber == 4)
    {
        decoded.mbGroupPaySlot20 = bytes[1];            // Modbus Payload Slot 20 Group Idx (8-bit)
        decoded.mbRegPaySlot20 = bytes[2];              // Modbus Payload Slot 20 Register Idx (8-bit)
        decoded.mbGroupPaySlot21 = bytes[3];            // Modbus Payload Slot 21 Group Idx (8-bit)
        decoded.mbRegPaySlot21 = bytes[4];              // Modbus Payload Slot 21 Register Idx (8-bit)
        decoded.mbGroupPaySlot22 = bytes[5];            // Modbus Payload Slot 22 Group Idx (8-bit)
        decoded.mbRegPaySlot22 = bytes[6];              // Modbus Payload Slot 22 Register Idx (8-bit)
        decoded.mbGroupPaySlot23 = bytes[7];            // Modbus Payload Slot 23 Group Idx (8-bit)
        decoded.mbRegPaySlot23 = bytes[8];              // Modbus Payload Slot 23 Register Idx (8-bit)
        decoded.mbGroupPaySlot24 = bytes[9];            // Modbus Payload Slot 24 Group Idx (8-bit)
        decoded.mbRegPaySlot24 = bytes[10];             // Modbus Payload Slot 24 Register Idx (8-bit)
    }
    if (decoded.sequenceNumber == 5)
    {
        decoded.mbGroupPaySlot25 = bytes[1];            // Modbus Payload Slot 25 Group Idx (8-bit)
        decoded.mbRegPaySlot25 = bytes[2];              // Modbus Payload Slot 25 Register Idx (8-bit)
        decoded.mbGroupPaySlot26 = bytes[3];            // Modbus Payload Slot 26 Group Idx (8-bit)
        decoded.mbRegPaySlot26 = bytes[4];              // Modbus Payload Slot 26 Register Idx (8-bit)
        decoded.mbGroupPaySlot27 = bytes[5];            // Modbus Payload Slot 27 Group Idx (8-bit)
        decoded.mbRegPaySlot27 = bytes[6];              // Modbus Payload Slot 27 Register Idx (8-bit)
        decoded.mbGroupPaySlot28 = bytes[7];            // Modbus Payload Slot 28 Group Idx (8-bit)
        decoded.mbRegPaySlot28 = bytes[8];              // Modbus Payload Slot 28 Register Idx (8-bit)
        decoded.mbGroupPaySlot29 = bytes[9];            // Modbus Payload Slot 29 Group Idx (8-bit)
        decoded.mbRegPaySlot29 = bytes[10];             // Modbus Payload Slot 29 Register Idx (8-bit)
    }
    if (decoded.sequenceNumber == 6)
    {
        decoded.mbGroupPaySlot30 = bytes[1];            // Modbus Payload Slot 30 Group Idx (8-bit)
        decoded.mbRegPaySlot30 = bytes[2];              // Modbus Payload Slot 30 Register Idx (8-bit)
        decoded.mbGroupPaySlot31 = bytes[3];            // Modbus Payload Slot 31 Group Idx (8-bit)
        decoded.mbRegPaySlot31 = bytes[4];              // Modbus Payload Slot 31 Register Idx (8-bit)
        decoded.mbGroupPaySlot32 = bytes[5];            // Modbus Payload Slot 32 Group Idx (8-bit)
        decoded.mbRegPaySlot32 = bytes[6];              // Modbus Payload Slot 32 Register Idx (8-bit)
        decoded.mbGroupPaySlot33 = bytes[7];            // Modbus Payload Slot 33 Group Idx (8-bit)
        decoded.mbRegPaySlot33 = bytes[8];              // Modbus Payload Slot 33 Register Idx (8-bit)
        decoded.mbGroupPaySlot34 = bytes[9];            // Modbus Payload Slot 34 Group Idx (8-bit)
        decoded.mbRegPaySlot34 = bytes[10];             // Modbus Payload Slot 34 Register Idx (8-bit)
    }
    if (decoded.sequenceNumber == 7)
    {
        decoded.mbGroupPaySlot35 = bytes[1];            // Modbus Payload Slot 35 Group Idx (8-bit)
        decoded.mbRegPaySlot35 = bytes[2];              // Modbus Payload Slot 35 Register Idx (8-bit)
        decoded.mbGroupPaySlot36 = bytes[3];            // Modbus Payload Slot 36 Group Idx (8-bit)
        decoded.mbRegPaySlot36 = bytes[4];              // Modbus Payload Slot 36 Register Idx (8-bit)
        decoded.mbGroupPaySlot37 = bytes[5];            // Modbus Payload Slot 37 Group Idx (8-bit)
        decoded.mbRegPaySlot37 = bytes[6];              // Modbus Payload Slot 37 Register Idx (8-bit)
        decoded.mbGroupPaySlot38 = bytes[7];            // Modbus Payload Slot 38 Group Idx (8-bit)
        decoded.mbRegPaySlot38 = bytes[8];              // Modbus Payload Slot 38 Register Idx (8-bit)
        decoded.mbGroupPaySlot39 = bytes[9];            // Modbus Payload Slot 39 Group Idx (8-bit)
        decoded.mbRegPaySlot39 = bytes[10];             // Modbus Payload Slot 39 Register Idx (8-bit)
    }
    if (decoded.sequenceNumber == 8)
    {
        decoded.mbGroupPaySlot40 = bytes[1];            // Modbus Payload Slot 40 Group Idx (8-bit)
        decoded.mbRegPaySlot40 = bytes[2];              // Modbus Payload Slot 40 Register Idx (8-bit)
    }

    return decoded;
}

function parseVoboXXEngineeringUnitsConfigurationPayload(bytes)
{
    var decoded = {};
    decoded.subgroupID = bytes[0] & 0x0F;                                           // Sub-Group ID (4-bit)
    decoded.sequenceNumber = (bytes[0] & 0xF0) >> 4;                                // Sequence Number (4-bit)

    // AIN1 General
    if (decoded.sequenceNumber == 0)
    {
        decoded.ain1UnitsCode = bytes[1];                                           // AIN1 Units Code (8-bit)
        decoded.ain1MinValue = bytesToFloat32(bytes.slice(2,6));                    // AIN1 Minimum Value (32-bit)
        decoded.ain1MaxValue = bytesToFloat32(bytes.slice(6,10));                   // AIN1 Maximum Value (32-bit)
        decoded.ain1Type = bytes[10] & 0x03;                                        // AIN1 Type (2-bit)
        decoded.reserved1 = (bytes[10] >> 2) & 0x3F                                 // Reserved 1 Field (6-bit)
    }
    // AIN1 Series Resistance
    if (decoded.sequenceNumber == 1)
    {
        decoded.ain1SeriesResistance = bytesToFloat32(bytes.slice(1,5));            // AIN1 Series Resistance (32-bit)
    }
    // AIN1 Calibration
    if (decoded.sequenceNumber == 2)
    {
        decoded.ain1Gain = bytesToFloat32(bytes.slice(1,5));                        // AIN1 Calibration Gain (32-bit)
        decoded.ain1Offset = bytesToFloat32(bytes.slice(5,9));                      // AIN1 Calibration Offset (32-bit)
    }

    // AIN2 General
    if (decoded.sequenceNumber == 3)
    {
        decoded.ain2UnitsCode = bytes[1];                                           // AIN2 Units Code (8-bit)
        decoded.ain2MinValue = bytesToFloat32(bytes.slice(2,6));                    // AIN2 Minimum Value (32-bit)
        decoded.ain2MaxValue = bytesToFloat32(bytes.slice(6,10));                   // AIN2 Maximum Value (32-bit)
        decoded.ain2Type = bytes[10] & 0x03;                                        // AIN2 Type (2-bit)
        decoded.reserved1 = (bytes[10] >> 2) & 0x3F                                 // Reserved 1 Field (6-bit)
    }
    // AIN2 Series Resistance
    if (decoded.sequenceNumber == 4)
    {
        decoded.ain2SeriesResistance = bytesToFloat32(bytes.slice(1,5));            // AIN2 Series Resistance (32-bit)
    }
    // AIN2 Calibration
    if (decoded.sequenceNumber == 5)
    {
        decoded.ain2Gain = bytesToFloat32(bytes.slice(1,5));                        // AIN2 Calibration Gain (32-bit)
        decoded.ain2Offset = bytesToFloat32(bytes.slice(5,9));                       // AIN2 Calibration Offset (32-bit)
    }

    // AIN3 General
    if (decoded.sequenceNumber == 6)
    {
        decoded.ain3UnitsCode = bytes[1];                                           // AIN3 Units Code (8-bit)
        decoded.ain3MinValue = bytesToFloat32(bytes.slice(2,6));                    // AIN3 Minimum Value (32-bit)
        decoded.ain3MaxValue = bytesToFloat32(bytes.slice(6,10));                   // AIN3 Maximum Value (32-bit)
        decoded.ain3Type = bytes[10] & 0x03;                                        // AIN3 Type (2-bit)
        decoded.reserved1 = (bytes[10] >> 2) & 0x3F                                 // Reserved 1 Field (6-bit)
    }
    // AIN3 Series Resistance
    if (decoded.sequenceNumber == 7)
    {
        decoded.ain3SeriesResistance = bytesToFloat32(bytes.slice(1,5));            // AIN3 Series Resistance (32-bit)
    }
    // AIN3 Calibration
    if (decoded.sequenceNumber == 8)
    {
        decoded.ain3Gain = bytesToFloat32(bytes.slice(1,5));                        // AIN3 Calibration Gain (32-bit)
        decoded.ain3Offset = bytesToFloat32(bytes.slice(5,9));                      // AIN3 Calibration Offset (32-bit)
    }

    return decoded;
}

function parseVoboTCGeneralConfigurationPayload(bytes)
{
    var decoded = {};
    decoded.subgroupID = bytes[0] & 0x0F;                                       // Sub-Group ID (4-bit)
    decoded.sequenceNumber = (bytes[0] & 0xF0) >> 4;                            // Sequence Number (4-bit)

    if (decoded.sequenceNumber == 0)
    {
        decoded.deviceType1 = bytes[1] & 0x07;                                      // Device Type 1 (3-bit)
        decoded.enable1 = Boolean((bytes[1] & 0x08) >> 3);                          // Enable 1 (1-bit)
        decoded.deviceType2 = (bytes[1] & 0x70) >> 4;                               // Device Type 2 (3-bit)
        decoded.enable2 = Boolean((bytes[1] & 0x80) >> 7);                          // Enable 2 (1-bit)
        decoded.deviceType3 = bytes[2] & 0x07;                                      // Device Type 3 (3-bit)
        decoded.enable3 = Boolean((bytes[2] & 0x08) >> 3);                          // Enable 3 (1-bit)
        decoded.deviceType4 = (bytes[2] & 0x70) >> 4;                               // Device Type 4 (3-bit)
        decoded.enable4 = Boolean((bytes[2] & 0x80) >> 7);                          // Enable 4 (1-bit)
        decoded.deviceType5 = bytes[3] & 0x07;                                      // Device Type 5 (3-bit)
        decoded.enable5 = Boolean((bytes[3] & 0x08) >> 3);                          // Enable 5 (1-bit)
        decoded.deviceType6 = (bytes[3] & 0x70) >> 4;                               // Device Type 6 (3-bit)
        decoded.enable6 = Boolean((bytes[3] & 0x80) >> 7);                          // Enable 6 (1-bit)
        decoded.deviceType7 = bytes[4] & 0x07;                                      // Device Type 7 (3-bit)
        decoded.enable7 = Boolean((bytes[4] & 0x08) >> 3);                          // Enable 7 (1-bit)
        decoded.deviceType8 = (bytes[4] & 0x70) >> 4;                               // Device Type 8 (3-bit)
        decoded.enable8 = Boolean((bytes[4] & 0x80) >> 7);                          // Enable 8 (1-bit)
        decoded.deviceType9 = bytes[5] & 0x07;                                      // Device Type 9 (3-bit)
        decoded.enable9 = Boolean((bytes[5] & 0x08) >> 3);                          // Enable 9 (1-bit)
        decoded.deviceType10 = (bytes[5] & 0x70) >> 4;                              // Device Type 10 (3-bit)
        decoded.enable10 = Boolean((bytes[5] & 0x80) >> 7);                         // Enable 10 (1-bit)
        decoded.deviceType11 = bytes[6] & 0x07;                                     // Device Type 11 (3-bit)
        decoded.enable11 = Boolean((bytes[6] & 0x08) >> 3);                         // Enable 11 (1-bit)
        decoded.deviceType12 = (bytes[6] & 0x70) >> 4;                              // Device Type 12 (3-bit)
        decoded.enable12 = Boolean((bytes[6] & 0x80) >> 7);                         // Enable 12 (1-bit)
        decoded.deviceUnits1 = bytes[7] & 0x01;                                     // Device Units 1 (1-bit)
        decoded.deviceUnits2 = (bytes[7] & 0x02) >> 1;                              // Device Units 2 (1-bit)
        decoded.deviceUnits3 = (bytes[7] & 0x04) >> 2;                              // Device Units 3 (1-bit)
        decoded.deviceUnits4 = (bytes[7] & 0x08) >> 3;                              // Device Units 4 (1-bit)
        decoded.deviceUnits5 = (bytes[7] & 0x10) >> 4;                              // Device Units 5 (1-bit)
        decoded.deviceUnits6 = (bytes[7] & 0x20) >> 5;                              // Device Units 6 (1-bit)
        decoded.deviceUnits7 = (bytes[7] & 0x40) >> 6;                              // Device Units 7 (1-bit)
        decoded.deviceUnits8 = (bytes[7] & 0x80) >> 7;                              // Device Units 8 (1-bit)
        decoded.deviceUnits9 = bytes[8] & 0x01;                                     // Device Units 9 (1-bit)
        decoded.deviceUnits10 = (bytes[8] & 0x02) >> 1;                             // Device Units 10 (1-bit)
        decoded.deviceUnits11 = (bytes[8] & 0x04) >> 2;                             // Device Units 11 (1-bit)
        decoded.deviceUnits12 = (bytes[8] & 0x08) >> 3;                             // Device Units 12 (1-bit)
        decoded.wkupSensorTransmitEnable = Boolean((bytes[8] & 0x10) >> 4);         // WKUP Sensor Transmit Enable (1-bit)
        decoded.batterySensorTransmitEnable = Boolean((bytes[8] & 0x20) >> 5);      // Battery Sensor Transmit Enable (1-bit)
        decoded.coldJointSensorTransmitEnable = Boolean((bytes[8] & 0x40) >> 6);    // Cold Joint Sensor Transmit Enable (1-bit)
        decoded.reserved1 = (bytes[8] & 0x80) >> 7;                                 // Reserved 1 Field (1-bit)
    }
    else if (decoded.sequenceNumber == 1)
    {
        decoded.deviceType1 = bytes[1] & 0x07;                                      // Device Type 1 (3-bit)
        decoded.enable1 = Boolean((bytes[1] & 0x08) >> 3);                          // Enable 1 (1-bit)
        decoded.deviceType2 = (bytes[1] & 0x70) >> 4;                               // Device Type 2 (3-bit)
        decoded.enable2 = Boolean((bytes[1] & 0x80) >> 7);                          // Enable 2 (1-bit)
        decoded.deviceType3 = bytes[2] & 0x07;                                      // Device Type 3 (3-bit)
        decoded.enable3 = Boolean((bytes[2] & 0x08) >> 3);                          // Enable 3 (1-bit)
        decoded.deviceType4 = (bytes[2] & 0x70) >> 4;                               // Device Type 4 (3-bit)
        decoded.enable4 = Boolean((bytes[2] & 0x80) >> 7);                          // Enable 4 (1-bit)
        decoded.deviceType5 = bytes[3] & 0x07;                                      // Device Type 5 (3-bit)
        decoded.enable5 = Boolean((bytes[3] & 0x08) >> 3);                          // Enable 5 (1-bit)
        decoded.deviceType6 = (bytes[3] & 0x70) >> 4;                               // Device Type 6 (3-bit)
        decoded.enable6 = Boolean((bytes[3] & 0x80) >> 7);                          // Enable 6 (1-bit)
        decoded.deviceType7 = bytes[4] & 0x07;                                      // Device Type 7 (3-bit)
        decoded.enable7 = Boolean((bytes[4] & 0x08) >> 3);                          // Enable 7 (1-bit)
        decoded.deviceType8 = (bytes[4] & 0x70) >> 4;                               // Device Type 8 (3-bit)
        decoded.enable8 = Boolean((bytes[4] & 0x80) >> 7);                          // Enable 8 (1-bit)
        decoded.deviceType9 = bytes[5] & 0x07;                                      // Device Type 9 (3-bit)
        decoded.enable9 = Boolean((bytes[5] & 0x08) >> 3);                          // Enable 9 (1-bit)
        decoded.deviceType10 = (bytes[5] & 0x70) >> 4;                              // Device Type 10 (3-bit)
        decoded.enable10 = Boolean((bytes[5] & 0x80) >> 7);                         // Enable 10 (1-bit)
        decoded.deviceType11 = bytes[6] & 0x07;                                     // Device Type 11 (3-bit)
        decoded.enable11 = Boolean((bytes[6] & 0x08) >> 3);                         // Enable 11 (1-bit)
        decoded.deviceType12 = (bytes[6] & 0x70) >> 4;                              // Device Type 12 (3-bit)
        decoded.enable12 = Boolean((bytes[6] & 0x80) >> 7);                         // Enable 12 (1-bit)
        decoded.deviceUnits1 = bytes[7] & 0x03;                                     // Device Units 1 (2-bit)
        decoded.deviceUnits2 = (bytes[7] & 0x0C) >> 2;                              // Device Units 2 (2-bit)
        decoded.deviceUnits3 = (bytes[7] & 0x30) >> 4;                              // Device Units 3 (2-bit)
        decoded.deviceUnits4 = (bytes[7] & 0xC0) >> 6;                              // Device Units 4 (2-bit)
        decoded.deviceUnits5 = bytes[8] & 0x03;                                     // Device Units 5 (2-bit)
        decoded.deviceUnits6 = (bytes[8] & 0x0C) >> 2;                              // Device Units 6 (2-bit)
        decoded.deviceUnits7 = (bytes[8] & 0x30) >> 4;                              // Device Units 7 (2-bit)
        decoded.deviceUnits8 = (bytes[8] & 0xC0) >> 6;                              // Device Units 8 (2-bit)
        decoded.deviceUnits9 = bytes[9] & 0x03;                                     // Device Units 9 (2-bit)
        decoded.deviceUnits10 = (bytes[9] & 0x0C) >> 2;                             // Device Units 10 (2-bit)
        decoded.deviceUnits11 = (bytes[9] & 0x30) >> 4;                             // Device Units 11 (2-bit)
        decoded.deviceUnits12 = (bytes[9] & 0xC0) >> 6;                             // Device Units 12 (2-bit)
        decoded.coldJointSensorUnits = bytes[10] & 0x03;                            // Cold Joint Sensor Units (2-bit)
        decoded.wkupSensorTransmitEnable = Boolean((bytes[10] & 0x04) >> 2);        // WKUP Sensor Transmit Enable (1-bit)
        decoded.batterySensorTransmitEnable = Boolean((bytes[10] & 0x08) >> 3);     // Battery Sensor Transmit Enable (1-bit)
        decoded.coldJointSensorTransmitEnable = Boolean((bytes[10] & 0x10) >> 4);   // Cold Joint Sensor Transmit Enable (1-bit)
        decoded.tcSensorsTransmitEnable = Boolean((bytes[10] & 0x20) >> 5);;        // TC Sensors Transmit Enable (1-bit)
        decoded.ainPayloadType = (bytes[10] & 0x40) >> 6;                           // Ain Payload Type (1-bit)
        decoded.reserved1 = (bytes[10] & 0x80) >> 7;                                // Reserved 1 Field (1-bit)
    }

    return decoded;
}

function parseVoboTCCalibrationConfigurationPayload(bytes)
{
    var decoded = {};
    decoded.subgroupID = bytes[0] & 0x0F;                                                                   // Sub-Group ID (4-bit)
    decoded.sequenceNumber = (bytes[0] & 0xF0) >> 4;                                                        // Sequence Number (4-bit)

    if (decoded.sequenceNumber == 0)
    {
        decoded.gain1 = parseFloat(((((bytes[2] & 0x07) << 8) | bytes[1]) / 1000.0).toFixed(3));            // Gain 1 (11-bit)
        decoded.reserved1 = (bytes[2] & 0xF8) >> 3;                                                         // Reserved 1 Field (5-bit)
        decoded.offset1 = parseFloat(((((bytes[4] & 0x7F) << 8) | bytes[3]) / 1000.0 - 10.000).toFixed(3)); // Offset 1 (15-bit)
        decoded.reserved2 = (bytes[4] & 0x80) >> 7;                                                         // Reserved 2 Field (1-bit)
        decoded.gain2 = parseFloat(((((bytes[6] & 0x07) << 8) | bytes[5]) / 1000.0).toFixed(3));            // Gain 2 (11-bit)
        decoded.reserved3 = (bytes[6] & 0xF8) >> 3;                                                         // Reserved 3 Field (5-bit)
        decoded.offset2 = parseFloat(((((bytes[8] & 0x7F) << 8) | bytes[7]) / 1000.0 - 10.000).toFixed(3)); // Offset 2 (15-bit)
        decoded.reserved4 = (bytes[8] & 0x80) >> 7;                                                         // Reserved 4 Field (1-bit)
    }
    if (decoded.sequenceNumber == 1)
    {
        decoded.gain3 = parseFloat(((((bytes[2] & 0x07) << 8) | bytes[1]) / 1000.0).toFixed(3));            // Gain 3 (11-bit)
        decoded.reserved1 = (bytes[2] & 0xF8) >> 3;                                                         // Reserved 1 Field (5-bit)
        decoded.offset3 = parseFloat(((((bytes[4] & 0x7F) << 8) | bytes[3]) / 1000.0 - 10.000).toFixed(3)); // Offset 3 (15-bit)
        decoded.reserved2 = (bytes[4] & 0x80) >> 7;                                                         // Reserved 2 Field (1-bit)
        decoded.gain4 = parseFloat(((((bytes[6] & 0x07) << 8) | bytes[5]) / 1000.0).toFixed(3));            // Gain 4 (11-bit)
        decoded.reserved3 = (bytes[6] & 0xF8) >> 3;                                                         // Reserved 3 Field (5-bit)
        decoded.offset4 = parseFloat(((((bytes[8] & 0x7F) << 8) | bytes[7]) / 1000.0 - 10.000).toFixed(3)); // Offset 4 (15-bit)
        decoded.reserved4 = (bytes[8] & 0x80) >> 7;                                                         // Reserved 4 Field (1-bit)
    }
    if (decoded.sequenceNumber == 2)
    {
        decoded.gain5 = parseFloat(((((bytes[2] & 0x07) << 8) | bytes[1]) / 1000.0).toFixed(3));            // Gain 5 (11-bit)
        decoded.reserved1 = (bytes[2] & 0xF8) >> 3;                                                         // Reserved 1 Field (5-bit)
        decoded.offset5 = parseFloat(((((bytes[4] & 0x7F) << 8) | bytes[3]) / 1000.0 - 10.000).toFixed(3)); // Offset 5 (15-bit)
        decoded.reserved2 = (bytes[4] & 0x80) >> 7;                                                         // Reserved 2 Field (1-bit)
        decoded.gain6 = parseFloat(((((bytes[6] & 0x07) << 8) | bytes[5]) / 1000.0).toFixed(3));            // Gain 6 (11-bit)
        decoded.reserved3 = (bytes[6] & 0xF8) >> 3;                                                         // Reserved 3 Field (5-bit)
        decoded.offset6 = parseFloat(((((bytes[8] & 0x7F) << 8) | bytes[7]) / 1000.0 - 10.000).toFixed(3)); // Offset 6 (15-bit)
        decoded.reserved4 = (bytes[8] & 0x80) >> 7;                                                         // Reserved 4 Field (1-bit)
    }
    if (decoded.sequenceNumber == 3)
    {
        decoded.gain7 = parseFloat(((((bytes[2] & 0x07) << 8) | bytes[1]) / 1000.0).toFixed(3));            // Gain 7 (11-bit)
        decoded.reserved1 = (bytes[2] & 0xF8) >> 3;                                                         // Reserved 1 Field (5-bit)
        decoded.offset7 = parseFloat(((((bytes[4] & 0x7F) << 8) | bytes[3]) / 1000.0 - 10.000).toFixed(3)); // Offset 7 (15-bit)
        decoded.reserved2 = (bytes[4] & 0x80) >> 7;                                                         // Reserved 2 Field (1-bit)
        decoded.gain8 = parseFloat(((((bytes[6] & 0x07) << 8) | bytes[5]) / 1000.0).toFixed(3));            // Gain 8 (11-bit)
        decoded.reserved3 = (bytes[6] & 0xF8) >> 3;                                                         // Reserved 3 Field (5-bit)
        decoded.offset8 = parseFloat(((((bytes[8] & 0x7F) << 8) | bytes[7]) / 1000.0 - 10.000).toFixed(3)); // Offset 8 (15-bit)
        decoded.reserved4 = (bytes[8] & 0x80) >> 7;                                                         // Reserved 4 Field (1-bit)
    }
    if (decoded.sequenceNumber == 4)
    {
        decoded.gain9 = parseFloat(((((bytes[2] & 0x07) << 8) | bytes[1]) / 1000.0).toFixed(3));            // Gain 9 (11-bit)
        decoded.reserved1 = (bytes[2] & 0xF8) >> 3;                                                         // Reserved 1 Field (5-bit)
        decoded.offset9 = parseFloat(((((bytes[4] & 0x7F) << 8) | bytes[3]) / 1000.0 - 10.000).toFixed(3)); // Offset 9 (15-bit)
        decoded.reserved2 = (bytes[4] & 0x80) >> 7;                                                         // Reserved 2 Field (1-bit)
        decoded.gain10 = parseFloat(((((bytes[6] & 0x07) << 8) | bytes[5]) / 1000.0).toFixed(3));           // Gain 10 (11-bit)
        decoded.reserved3 = (bytes[6] & 0xF8) >> 3;                                                         // Reserved 3 Field (5-bit)
        decoded.offset10 = parseFloat(((((bytes[8] & 0x7F) << 8) | bytes[7]) / 1000.0 - 10.000).toFixed(3));// Offset 10 (15-bit)
        decoded.reserved4 = (bytes[8] & 0x80) >> 7;                                                         // Reserved 4 Field (1-bit)
    }
    if (decoded.sequenceNumber == 5)
    {
        decoded.gain11 = parseFloat(((((bytes[2] & 0x07) << 8) | bytes[1]) / 1000.0).toFixed(3));           // Gain 11 (11-bit)
        decoded.reserved1 = (bytes[2] & 0xF8) >> 3;                                                         // Reserved 1 Field (5-bit)
        decoded.offset11 = parseFloat(((((bytes[4] & 0x7F) << 8) | bytes[3]) / 1000.0 - 10.000).toFixed(3));// Offset 11 (15-bit)
        decoded.reserved2 = (bytes[4] & 0x80) >> 7;                                                         // Reserved 2 Field (1-bit)
        decoded.gain12 = parseFloat(((((bytes[6] & 0x07) << 8) | bytes[5]) / 1000.0).toFixed(3));           // Gain 12 (11-bit)
        decoded.reserved3 = (bytes[6] & 0xF8) >> 3;                                                         // Reserved 3 Field (5-bit)
        decoded.offset12 = parseFloat(((((bytes[8] & 0x7F) << 8) | bytes[7]) / 1000.0 - 10.000).toFixed(3));// Offset 12 (15-bit)
        decoded.reserved4 = (bytes[8] & 0x80) >> 7;                                                         // Reserved 4 Field (1-bit)
    }

    return decoded;
}

function parseConfigurationPayload(bytes, fport)
{
    var decoded = {};
    var subgroupID = bytes[0] & 0x0F;

    // VoBo Lib Configuration Payloads
    if(subgroupID == 0) decoded = parseVoboLibGeneralConfigurationPayload(bytes);
    else if(subgroupID == 1) decoded = parseVoboLibVoboSyncConfigurationPayload(bytes);
    // VoBo XX Configuration Payloads
    else if(fport == 70 && subgroupID == 4) decoded = parseVoboXXGeneralConfigurationPayload(bytes);
    else if(fport == 70 && subgroupID == 5) decoded = parseVoboXXModbusGeneralConfigurationPayload(bytes);
    else if(fport == 70 && (subgroupID == 6 || subgroupID == 7)) decoded = parseVoboXXModbusGroupsEnableConfigurationPayload(bytes);
    else if(fport == 70 && (subgroupID == 8 || subgroupID == 9 || subgroupID == 10)) decoded = parseVoboXXModbusGroupsConfigurationPayload(bytes);
    else if(fport == 70 && subgroupID == 11) decoded = parseVoboXXModbusPayloadsSlotsConfigurationPayload(bytes);
    else if(fport == 70 && subgroupID == 12) decoded = parseVoboXXEngineeringUnitsConfigurationPayload(bytes);
    // VoBo TC Configuration Payloads
    else if(fport == 71 && subgroupID == 4) decoded = parseVoboTCGeneralConfigurationPayload(bytes);
    else if(fport == 71 && subgroupID == 5) decoded = parseVoboTCCalibrationConfigurationPayload(bytes);

    return decoded;
}

function parseModbusGenericPayload(bytes, fport)
{
    var decoded = {};
    var payloadSize = bytes.length;
    var byteIdx = 0;
    while(byteIdx < (payloadSize - 1))
    {
        var groupIdx = bytes[byteIdx] & 0x3F;
        if(groupIdx > 0)
        {
            var blockType = (bytes[byteIdx] >> 6) & 0x03;
            byteIdx++;

            if(blockType == 0x00) // One register block
            {
                var registerValue = (bytes[byteIdx + 1] << 8) | (bytes[byteIdx]);
                decoded["group" + groupIdx + "register1"] = registerValue;
                byteIdx += 2;
            }
            else if(blockType == 0x01) // Two registers block
            {
                var register1Value = (bytes[byteIdx + 1] << 8) | (bytes[byteIdx]);
                decoded["group" + groupIdx + "register1"] = register1Value;
                var register2Value = (bytes[byteIdx + 3] << 8) | (bytes[byteIdx + 2]);
                decoded["group" + groupIdx + "register2"] = register2Value;
                byteIdx += (2 * 2);
            }
            else if(blockType == 0x02) // Non fragmented block
            {
                var registersValues = [];
                var numOfRegisters = bytes[byteIdx] & 0x7F;
                byteIdx++;
                for (let regIdx = 0; regIdx < numOfRegisters; regIdx++)
                {
                    var registerValue = (bytes[byteIdx + 1] << 8) | (bytes[byteIdx]);
                    decoded["group" + groupIdx + "register" + (regIdx + 1)] = registerValue;
                    registersValues.push(registerValue);
                    byteIdx += 2;
                }
            }
            else if(blockType == 0x03) // Fragmented block
            {
                var registersValues = [];
                var numOfRegisters = bytes[byteIdx] & 0x7F;
                byteIdx++;
                var registerOffset = bytes[byteIdx] & 0x3F;
                byteIdx++;

                var numOfRegToRead = numOfRegisters - registerOffset;
                var freeRegToRead = Math.floor((payloadSize - byteIdx) / 2);
                if(numOfRegToRead > freeRegToRead) numOfRegToRead = freeRegToRead;
                for (let regIdx = 0; regIdx < numOfRegToRead; regIdx++)
                {
                    var registerValue = (bytes[byteIdx + 1] << 8) | (bytes[byteIdx]);
                    decoded["group" + groupIdx + "register" + (registerOffset + regIdx + 1)] = registerValue;
                    registersValues.push(registerValue);
                    byteIdx += 2;
                }
            }
        }
        else break;
    }
    return decoded;
}

function parseAnalogInputVariableLengthPayload(bytes, fport)
{
    var decoded = {};
    var decodedAinPayloads = [];
    const AIN_PAYLOAD_SIZE = 6;

    var payloadLength = bytes.length
    var byteIdx = 0;
    while(byteIdx < payloadLength)
    {
        var ainPayload = bytes.slice(byteIdx, byteIdx + AIN_PAYLOAD_SIZE)
        var decodedAinPayload = parseOneAnalogSensorPayload(ainPayload)
        decodedAinPayloads.push(decodedAinPayload)
        byteIdx += AIN_PAYLOAD_SIZE;
    }

    decoded.ainPayloads = decodedAinPayloads;
    decoded.numOfAinPayloads = decodedAinPayloads.length

    return decoded;
}

function parseModbusStandardVariableLengthPayload(bytes, fport)
{
    var decoded = {};
    var decodedModbusSlots = {};

    var payloadLength = bytes.length
    var firstSlotNum = bytes[payloadLength - 1]
    const REGISTER_SIZE = 2
    var byteIdx = 0;
    while(byteIdx < payloadLength - 1)
    {
        var registerIdx = byteIdx / 2;
        var slotIdx = firstSlotNum + registerIdx;
        decodedModbusSlots["Modbus"+ slotIdx] = (bytes[byteIdx + 1] << 8) | bytes[byteIdx];
        byteIdx += REGISTER_SIZE;
    }

    decoded.modbusSlots = decodedModbusSlots;
    decoded.firstSlotNum = firstSlotNum;
    decoded.numModbusSlots = (payloadLength - 1) / 2;

    return decoded;
}

function lookupAnalogSensorName(voboType, sensorNum) {
    const analogSensorsTableXX = 
    [
        {"Analog Sensor Number":"0","Analog Sensor Name":"Battery Voltage"},
        {"Analog Sensor Number":"1","Analog Sensor Name":"AIN1"},
        {"Analog Sensor Number":"2","Analog Sensor Name":"AIN2"},
        {"Analog Sensor Number":"3","Analog Sensor Name":"AIN3"},
        {"Analog Sensor Number":"15","Analog Sensor Name":"ADC Temperature"}
    ];
    
    const analogSensorsTableTC =
    [
        {"Analog Sensor Number":"0","Analog Sensor Name":"Battery Voltage"},
        {"Analog Sensor Number":"1","Analog Sensor Name":"TC1"},
        {"Analog Sensor Number":"2","Analog Sensor Name":"TC2"},
        {"Analog Sensor Number":"3","Analog Sensor Name":"TC3"},
        {"Analog Sensor Number":"4","Analog Sensor Name":"TC4"},
        {"Analog Sensor Number":"5","Analog Sensor Name":"TC5"},
        {"Analog Sensor Number":"6","Analog Sensor Name":"TC6"},
        {"Analog Sensor Number":"7","Analog Sensor Name":"TC7"},
        {"Analog Sensor Number":"8","Analog Sensor Name":"TC8"},
        {"Analog Sensor Number":"9","Analog Sensor Name":"TC9"},
        {"Analog Sensor Number":"10","Analog Sensor Name":"TC10"},
        {"Analog Sensor Number":"11","Analog Sensor Name":"TC11"},
        {"Analog Sensor Number":"12","Analog Sensor Name":"TC12"},
        {"Analog Sensor Number":"13","Analog Sensor Name":"Cold Joint Temperature"}
    ];
    
    var analogSensorsTable = []; 
    if(voboType == "VoBoXX") {
        analogSensorsTable = analogSensorsTableXX;
    }
    else if(voboType == "VoBoTC") {
        analogSensorsTable = analogSensorsTableTC;
    }
    else {
        errorMsg = voboType + " -- " + "Invalid VoBo Type. Use \"VoBoXX\" or \"VoBoTC\"";
        throw new Error(errorMsg);
    }

    var analogSensorRow = analogSensorsTable.find(element => element["Analog Sensor Number"] == sensorNum.toString());
    if(typeof analogSensorRow == 'undefined') {
        var genericAnalogSensorName = "AnalogSensor" + sensorNum.toString();
        return genericAnalogSensorName;
    }

    var analogSensorName = analogSensorRow["Analog Sensor Name"];
    return analogSensorName;
}

function lookupDigitalSensorName(voboType, sensorNum) {
    const digitalSensorsTableXX =
    [
        {"Digital Sensor Number":"0","Digital Sensor Name":"WKUP"},
        {"Digital Sensor Number":"1","Digital Sensor Name":"DIN1"},
        {"Digital Sensor Number":"2","Digital Sensor Name":"DIN2"},
        {"Digital Sensor Number":"3","Digital Sensor Name":"DIN3"}
    ];
    
    const digitalSensorsTableTC =
    [
        {"Digital Sensor Number":"0","Digital Sensor Name":"WKUP"}
    ];

    var digitalSensorsTable = []; 
    if(voboType == "VoBoXX") {
        digitalSensorsTable = digitalSensorsTableXX;
    }
    else if(voboType == "VoBoTC") {
        digitalSensorsTable = digitalSensorsTableTC;
    }
    else {
        errorMsg = voboType + " -- " + "Invalid VoBo Type. Use \"VoBoXX\" or \"VoBoTC\"";
        throw new Error(errorMsg);
    }

    var digitalSensorRow = digitalSensorsTable.find(element => element["Digital Sensor Number"] == sensorNum.toString());
    if(typeof digitalSensorRow == 'undefined') {
        var genericDigitalSensorName = "DigitalSensor" + sensorNum.toString();
        return genericDigitalSensorName;
    }

    var digitalSensorName = digitalSensorRow["Digital Sensor Name"];
    return digitalSensorName;
}

function lookupUnits(outputType, unitCode) {
    const engUnitsTable =
    [
        {"Units Code":"1","Description":"inches of water at 20 degC (68 degF)","Abbreviated Units":"inH2O (20 degC or 68 degF)"},
        {"Units Code":"2","Description":"inches of mercury at 0 degC (32 degF)","Abbreviated Units":"inHg (20 degC or 68 degF)"},
        {"Units Code":"3","Description":"feet of water at 20 degC (68 degF)","Abbreviated Units":"ftH2O (20 degC or 68 degF)"},
        {"Units Code":"4","Description":"millimeters of water at 20 degC (68 degF)","Abbreviated Units":"mmH2O (20 degC or 68 degF)"},
        {"Units Code":"5","Description":"millimeters of mercury at 0 degC (32 degF)","Abbreviated Units":"mmHg (0 degC or 32 degF)"},
        {"Units Code":"6","Description":"pounds per square inch","Abbreviated Units":"psi"},
        {"Units Code":"7","Description":"bars","Abbreviated Units":"bar"},
        {"Units Code":"8","Description":"millibars","Abbreviated Units":"mbar"},
        {"Units Code":"9","Description":"grams per square centimeter","Abbreviated Units":"g/cm^2"},
        {"Units Code":"10","Description":"kilograms per square centimeter","Abbreviated Units":"kg/cm^2"},
        {"Units Code":"11","Description":"pascals","Abbreviated Units":"Pa"},
        {"Units Code":"12","Description":"kilopascals","Abbreviated Units":"kPa"},
        {"Units Code":"13","Description":"torr","Abbreviated Units":"torr"},
        {"Units Code":"14","Description":"atmospheres","Abbreviated Units":"atm"},
        {"Units Code":"15","Description":"cubic feet per minute","Abbreviated Units":"ft^3/min"},
        {"Units Code":"16","Description":"gallons per minute","Abbreviated Units":"usg/min"},
        {"Units Code":"17","Description":"liters per minute","Abbreviated Units":"L/min"},
        {"Units Code":"18","Description":"imperial gallons per minute","Abbreviated Units":"impgal/min"},
        {"Units Code":"19","Description":"cubic meter per hour","Abbreviated Units":"m^3/h"},
        {"Units Code":"20","Description":"feet per second","Abbreviated Units":"ft/s"},
        {"Units Code":"21","Description":"meters per seond","Abbreviated Units":"m/s"},
        {"Units Code":"22","Description":"gallons per second","Abbreviated Units":"usg/s"},
        {"Units Code":"23","Description":"million gallons per day","Abbreviated Units":"Musg/d"},
        {"Units Code":"24","Description":"liters per second","Abbreviated Units":"L/s"},
        {"Units Code":"25","Description":"million liters per day","Abbreviated Units":"ML/d"},
        {"Units Code":"26","Description":"cubic feet per second","Abbreviated Units":"ft^3/s"},
        {"Units Code":"27","Description":"cubic feet per day","Abbreviated Units":"ft^3/d"},
        {"Units Code":"28","Description":"cubic meters per second","Abbreviated Units":"m^3/s"},
        {"Units Code":"29","Description":"cubic meters per day","Abbreviated Units":"m^3/d"},
        {"Units Code":"30","Description":"imperial gallons per hour","Abbreviated Units":"impgal/h"},
        {"Units Code":"31","Description":"imperial gallons per day","Abbreviated Units":"impgal/d"},
        {"Units Code":"32","Description":"Degrees Celsius","Abbreviated Units":"C"},
        {"Units Code":"33","Description":"Degrees Fahrenheit","Abbreviated Units":"F"},
        {"Units Code":"34","Description":"Degrees Rankine","Abbreviated Units":"R"},
        {"Units Code":"35","Description":"Kelvin","Abbreviated Units":"K"},
        {"Units Code":"36","Description":"millivolts","Abbreviated Units":"mV"},
        {"Units Code":"37","Description":"ohms","Abbreviated Units":"ohm"},
        {"Units Code":"38","Description":"hertz","Abbreviated Units":"hz"},
        {"Units Code":"39","Description":"milliamperes","Abbreviated Units":"mA"},
        {"Units Code":"40","Description":"gallons","Abbreviated Units":"usg"},
        {"Units Code":"41","Description":"liters","Abbreviated Units":"L"},
        {"Units Code":"42","Description":"imperial gallons","Abbreviated Units":"impgal"},
        {"Units Code":"43","Description":"cubic meters","Abbreviated Units":"m^3"},
        {"Units Code":"44","Description":"feet","Abbreviated Units":"ft"},
        {"Units Code":"45","Description":"meters","Abbreviated Units":"m"},
        {"Units Code":"46","Description":"barrels","Abbreviated Units":"bbl"},
        {"Units Code":"47","Description":"inches","Abbreviated Units":"in"},
        {"Units Code":"48","Description":"centimeters","Abbreviated Units":"cm"},
        {"Units Code":"49","Description":"millimeters","Abbreviated Units":"mm"},
        {"Units Code":"50","Description":"minutes","Abbreviated Units":"min"},
        {"Units Code":"51","Description":"seconds","Abbreviated Units":"s"},
        {"Units Code":"52","Description":"hours","Abbreviated Units":"h"},
        {"Units Code":"53","Description":"days","Abbreviated Units":"d"},
        {"Units Code":"54","Description":"centistokes","Abbreviated Units":"centistokes"},
        {"Units Code":"55","Description":"centipoise","Abbreviated Units":"cP"},
        {"Units Code":"56","Description":"microsiemens","Abbreviated Units":"microsiemens"},
        {"Units Code":"57","Description":"percent","Abbreviated Units":"%"},
        {"Units Code":"58","Description":"volts","Abbreviated Units":"V"},
        {"Units Code":"59","Description":"pH","Abbreviated Units":"pH"},
        {"Units Code":"60","Description":"grams","Abbreviated Units":"g"},
        {"Units Code":"61","Description":"kilograms","Abbreviated Units":"kg"},
        {"Units Code":"62","Description":"metric tons","Abbreviated Units":"t"},
        {"Units Code":"63","Description":"pounds","Abbreviated Units":"lb"},
        {"Units Code":"64","Description":"short tons","Abbreviated Units":"short ton"},
        {"Units Code":"65","Description":"long tons","Abbreviated Units":"long ton"},
        {"Units Code":"66","Description":"millisiemens per centimeter","Abbreviated Units":"millisiemens/cm"},
        {"Units Code":"67","Description":"microsiemens per centimeter","Abbreviated Units":"microsiemens/cm"},
        {"Units Code":"68","Description":"newton","Abbreviated Units":"N"},
        {"Units Code":"69","Description":"newton meter","Abbreviated Units":"N m"},
        {"Units Code":"70","Description":"grams per second","Abbreviated Units":"g/s"},
        {"Units Code":"71","Description":"grams per minute","Abbreviated Units":"g/min"},
        {"Units Code":"72","Description":"grams per hour","Abbreviated Units":"g/h"},
        {"Units Code":"73","Description":"kilograms per second","Abbreviated Units":"kg/s"},
        {"Units Code":"74","Description":"kilograms per minute","Abbreviated Units":"kg/min"},
        {"Units Code":"75","Description":"kilograms per hour","Abbreviated Units":"kg/h"},
        {"Units Code":"76","Description":"kilograms per day","Abbreviated Units":"kg/d"},
        {"Units Code":"77","Description":"metric tons per minute","Abbreviated Units":"t/min"},
        {"Units Code":"78","Description":"metric tons per hour","Abbreviated Units":"t/h"},
        {"Units Code":"79","Description":"metric tons per day","Abbreviated Units":"t/d"},
        {"Units Code":"80","Description":"pounds per second","Abbreviated Units":"lb/s"},
        {"Units Code":"81","Description":"pounds per minute","Abbreviated Units":"lb/min"},
        {"Units Code":"82","Description":"pounds per hour","Abbreviated Units":"lb/h"},
        {"Units Code":"83","Description":"pounds per day","Abbreviated Units":"lb/d"},
        {"Units Code":"84","Description":"short tons per minute","Abbreviated Units":"short ton/min"},
        {"Units Code":"85","Description":"short tons per hour","Abbreviated Units":"short ton/h"},
        {"Units Code":"86","Description":"short tons per day","Abbreviated Units":"short ton/d"},
        {"Units Code":"87","Description":"long tons per hour","Abbreviated Units":"long ton/h"},
        {"Units Code":"88","Description":"long tons per day","Abbreviated Units":"long ton/d"},
        {"Units Code":"89","Description":"deka therm","Abbreviated Units":"Dth"},
        {"Units Code":"90","Description":"specific gravity units","Abbreviated Units":"specific gravity units"},
        {"Units Code":"91","Description":"grams per cubic centimeter","Abbreviated Units":"g/cm^3"},
        {"Units Code":"92","Description":"kilograms per cubic meter","Abbreviated Units":"kg/m^3"},
        {"Units Code":"93","Description":"pounds per gallon","Abbreviated Units":"lb/usg"},
        {"Units Code":"94","Description":"pounds per cubic feet","Abbreviated Units":"lb/ft^3"},
        {"Units Code":"95","Description":"grams per milliliter","Abbreviated Units":"g/mL"},
        {"Units Code":"96","Description":"kilograms per liter","Abbreviated Units":"kg/L"},
        {"Units Code":"97","Description":"grams per liter","Abbreviated Units":"g/L"},
        {"Units Code":"98","Description":"pounds per cubic inch","Abbreviated Units":"lb/in^3"},
        {"Units Code":"99","Description":"short tons per cubic yard","Abbreviated Units":"short ton/yd^3"},
        {"Units Code":"100","Description":"degrees twaddell","Abbreviated Units":"degTw"},
        {"Units Code":"101","Description":"degrees brix","Abbreviated Units":"degBx"},
        {"Units Code":"102","Description":"degrees baume heavy","Abbreviated Units":"BH"},
        {"Units Code":"103","Description":"degrees baume light","Abbreviated Units":"BL"},
        {"Units Code":"104","Description":"degrees API","Abbreviated Units":"degAPI"},
        {"Units Code":"105","Description":"percent solids per weight","Abbreviated Units":"% solid/weight"},
        {"Units Code":"106","Description":"percent solids per volume","Abbreviated Units":"% solid/volume"},
        {"Units Code":"107","Description":"degrees balling","Abbreviated Units":"degrees balling"},
        {"Units Code":"108","Description":"proof per volume","Abbreviated Units":"proof/volume"},
        {"Units Code":"109","Description":"proof per mass","Abbreviated Units":"proof/mass"},
        {"Units Code":"110","Description":"bushels","Abbreviated Units":"bushel"},
        {"Units Code":"111","Description":"cubic yards","Abbreviated Units":"yd^3"},
        {"Units Code":"112","Description":"cubic feet","Abbreviated Units":"ft^3"},
        {"Units Code":"113","Description":"cubic inches","Abbreviated Units":"in^3"},
        {"Units Code":"114","Description":"inches per second","Abbreviated Units":"in/s"},
        {"Units Code":"115","Description":"inches per minute","Abbreviated Units":"in/min"},
        {"Units Code":"116","Description":"feet per minute","Abbreviated Units":"ft/min"},
        {"Units Code":"117","Description":"degrees per second","Abbreviated Units":"deg/s"},
        {"Units Code":"118","Description":"revolutions per second","Abbreviated Units":"rev/s"},
        {"Units Code":"119","Description":"revolutions per minute","Abbreviated Units":"rpm"},
        {"Units Code":"120","Description":"meters per hour","Abbreviated Units":"m/hr"},
        {"Units Code":"121","Description":"normal cubic meters per hour","Abbreviated Units":"normal m^3/h"},
        {"Units Code":"122","Description":"normal liter per hour","Abbreviated Units":"normal L/h"},
        {"Units Code":"123","Description":"standard cubic feet per minute","Abbreviated Units":"standard ft^3/min"},
        {"Units Code":"124","Description":"bbl liq","Abbreviated Units":"bbl liq"},
        {"Units Code":"125","Description":"ounce","Abbreviated Units":"oz"},
        {"Units Code":"126","Description":"foot pound force","Abbreviated Units":"ft lb force"},
        {"Units Code":"127","Description":"kilowatt","Abbreviated Units":"kW"},
        {"Units Code":"128","Description":"kilowatt hour","Abbreviated Units":"KWh"},
        {"Units Code":"120","Description":"horsepower","Abbreviated Units":"hp"},
        {"Units Code":"130","Description":"cubic feet per hour","Abbreviated Units":"ft^3/h"},
        {"Units Code":"131","Description":"cubic meters per minute","Abbreviated Units":"m^3/min"},
        {"Units Code":"132","Description":"barrels per second","Abbreviated Units":"bbl/s"},
        {"Units Code":"133","Description":"barrels per minute","Abbreviated Units":"bbl/min"},
        {"Units Code":"134","Description":"barrels per hour","Abbreviated Units":"bbl/h"},
        {"Units Code":"135","Description":"barrels per day","Abbreviated Units":"bbl/d"},
        {"Units Code":"136","Description":"gallons per hour","Abbreviated Units":"usg/h"},
        {"Units Code":"137","Description":"imperial gallons per second","Abbreviated Units":"impgal/s"},
        {"Units Code":"138","Description":"liters per hour","Abbreviated Units":"L/h"},
        {"Units Code":"139","Description":"parts per million","Abbreviated Units":"ppm"},
        {"Units Code":"140","Description":"megacalorie per hour","Abbreviated Units":"Mcal/h"},
        {"Units Code":"141","Description":"megajoule per hour","Abbreviated Units":"MJ/h"},
        {"Units Code":"142","Description":"British thermal unit per hour","Abbreviated Units":"BTU/h"},
        {"Units Code":"143","Description":"degrees","Abbreviated Units":"degrees"},
        {"Units Code":"144","Description":"radian","Abbreviated Units":"rad"},
        {"Units Code":"145","Description":"inches of water at 15.6 degC (60 degF)","Abbreviated Units":"inH20 (15.6 degC or 60 degF)"},
        {"Units Code":"146","Description":"micrograms per liter","Abbreviated Units":"micrograms/L"},
        {"Units Code":"147","Description":"micrograms per cubic meter","Abbreviated Units":"micrograms/m^3"},
        {"Units Code":"148","Description":"percent consitency","Abbreviated Units":"% consistency"},
        {"Units Code":"149","Description":"volume percent","Abbreviated Units":"volume %"},
        {"Units Code":"150","Description":"percent steam quality","Abbreviated Units":"% steam quality"},
        {"Units Code":"151","Description":"feet in sixteenths","Abbreviated Units":"ft in sixteenths"},
        {"Units Code":"152","Description":"cubic feet per pound","Abbreviated Units":"ft^3/lb"},
        {"Units Code":"153","Description":"picofarads","Abbreviated Units":"pF"},
        {"Units Code":"154","Description":"milliliters per liter","Abbreviated Units":"mL/L"},
        {"Units Code":"155","Description":"microliters per liter","Abbreviated Units":"microliters/L"},
        {"Units Code":"156","Description":"percent plato","Abbreviated Units":"% plato"},
        {"Units Code":"157","Description":"percent lower explosion level","Abbreviated Units":"% lower explosion level"},
        {"Units Code":"158","Description":"mega calorie","Abbreviated Units":"Mcal"},
        {"Units Code":"159","Description":"kiloohms","Abbreviated Units":"kohm"},
        {"Units Code":"160","Description":"megajoule","Abbreviated Units":"MJ"},
        {"Units Code":"161","Description":"British thermal unit","Abbreviated Units":"BTU"},
        {"Units Code":"162","Description":"normal cubic meter","Abbreviated Units":"normal m^3"},
        {"Units Code":"163","Description":"normal liter","Abbreviated Units":"normal L"},
        {"Units Code":"164","Description":"standard cubic feet","Abbreviated Units":"normal ft^3"},
        {"Units Code":"165","Description":"parts per billion","Abbreviated Units":"parts/billion"},
        {"Units Code":"235","Description":"gallons per day","Abbreviated Units":"usg/d"},
        {"Units Code":"236","Description":"hectoliters","Abbreviated Units":"hL"},
        {"Units Code":"237","Description":"megapascals","Abbreviated Units":"MPa"},
        {"Units Code":"238","Description":"inches of water at 4 degC (39.2 degF)","Abbreviated Units":"inH2O (4 degC or 39.2 degF)"},
        {"Units Code":"239","Description":"millimeters of water at 4 degC (39.2 degF)","Abbreviated Units":"mmH2O (4 degC or 39.2 degF)"},
        {"Units Code":"253","Description":"edge count or pulse count","Abbreviated Units":"counts"},
        {"Units Code":"254","Description":"raw ADC code","Abbreviated Units":"ADC code"},
        {"Units Code":"255","Description":"data not valid","Abbreviated Units":"data not valid"}
    ];

    var outputString = "";
    var engUnitsRow = engUnitsTable.find(element => element["Units Code"] == unitCode.toString());
    
    if(typeof engUnitsRow == 'undefined') {
        return "Unknown Units";
    }
    
    if(outputType == 0) {
        outputString = engUnitsRow["Description"];
    }
    else if(outputType == 1) {
        outputString = engUnitsRow["Abbreviated Units"];
    }
    else {
        errorMsg = outputType + " -- " + "Invalid Output Type. Use 0 for Description or 1 for Abbreviated Units.";
        throw new Error(errorMsg);
    }

    return outputString;
}

//===========================================================
// Utility functions  
// Decoder doesn't call these functions
// Functions provided for customer usage
//
// List of functions:
// hexToFloat - Conversion from Hex to Float Number
// modbusToFloat_AB_CD_to_ABCD - Takes two Modbus registers, does no swapping, and converts them to 32 bit floating point number
// modbusToFloat_AB_CD_to_DCBA - Takes two Modbus registers, does byte and word swapping, and converts them to 32 bit floating point number
// modbusToFloat_AB_CD_to_BADC - Takes two Modbus registers, does byte swapping, and converts them to 32bit floating point number
// modbusToFloat_AB_CD_to_CDAB - Takes two Modbus registers, does word swapping, and converts them to 32bit floating point number
// printPayload - Prints Decoded payloads in formatted fashion
//===========================================================

/* istanbul ignore next */
function hexToFloat(hex) 
{
    var s = hex >> 31 ? -1 : 1;
    var e = (hex >> 23) & 0xFF;
    return s * (hex & 0x7fffff | 0x800000) * 1.0 / Math.pow(2, 23) * Math.pow(2, (e - 127))
}
/* istanbul ignore next */
function modbusToFloat_AB_CD_to_ABCD(modbusReg0, modbusReg1)
{
    var floatVal = 0;
    var bytes = Buffer.alloc(4);

    bytes[0] = (modbusReg1 & 0xFF00) >> 8;
    bytes[1] = modbusReg1 & 0xFF;
    bytes[2] = (modbusReg0 & 0xFF00) >> 8;
    bytes[3] = modbusReg0 & 0xFF;

    floatVal = bytes.readFloatBE(0);
    return floatVal;
}
/* istanbul ignore next */
function modbusToFloat_AB_CD_to_DCBA(modbusReg0, modbusReg1)
{
    var floatVal = 0;
    var bytes = Buffer.alloc(4);

    bytes[0] = modbusReg0 & 0xFF;
    bytes[1] = (modbusReg0 & 0xFF00) >> 8;
    bytes[2] = modbusReg1 & 0xFF;
    bytes[3] = (modbusReg1 & 0xFF00) >> 8;

    floatVal = bytes.readFloatBE(0);
    return floatVal;
}
/* istanbul ignore next */
function modbusToFloat_AB_CD_to_BADC(modbusReg0, modbusReg1)
{
    var floatVal = 0;
    var bytes = Buffer.alloc(4);

    bytes[0] = modbusReg1 & 0xFF;
    bytes[1] = (modbusReg1 & 0xFF00) >> 8;
    bytes[2] = modbusReg0 & 0xFF;
    bytes[3] = (modbusReg0 & 0xFF00) >> 8;

    floatVal = bytes.readFloatBE(0);
    return floatVal;
}
/* istanbul ignore next */
function modbusToFloat_AB_CD_to_CDAB(modbusReg0, modbusReg1)
{
    var floatVal = 0;
    var bytes = Buffer.alloc(4);

    bytes[0] = (modbusReg0 & 0xFF00) >> 8;
    bytes[1] = modbusReg0 & 0xFF;
    bytes[2] = (modbusReg1 & 0xFF00) >> 8;
    bytes[3] = modbusReg1 & 0xFF;

    floatVal = bytes.readFloatBE(0);
    return floatVal;
}
/* istanbul ignore next */
function printPayload(payload)
{
    if(payload.data.payloadType == "Standard")
    {   
        let modbusSlot0HexString = payload.data.Modbus0.toString(16).toUpperCase().padStart(4,0);
        console.log("%s | %s | %s | %s | " + 
                                "DIN1 = %d | DIN2 = %d | DIN3 = %d | WKUP = %d | ADC1 = %d | ADC2 = %d | ADC3 = %d | " +
                                "Battery = %d | Temperature = %f | Modbus0 = 0x%s  |\n", 
                    payload.timestamp, payload.deveui, payload.data.voboType, payload.data.payloadType,
                                payload.data.DIN1, payload.data.DIN2, payload.data.DIN3, payload.data.WKUP, payload.data.ADC1, payload.data.ADC2, payload.data.ADC3,
                                payload.data.Battery, payload.data.Temperature, modbusSlot0HexString);
        return;
    }

    if(payload.data.payloadType == "Modbus Standard")
    {   
        dataKeys = Object.keys(payload.data);
        let stringToPrint = payload.timestamp + " | " + payload.deveui + " | " + payload.data.voboType + " | " + payload.data.payloadType + " | ";
        for (let idx = 0; idx < dataKeys.length; idx++)
        {
            if((dataKeys[idx] != "fport") && (dataKeys[idx] != "voboType") && (dataKeys[idx] != "payloadType"))
            {
                let fieldName = dataKeys[idx];
                let valueHex = "0x" + payload.data[fieldName].toString(16).toUpperCase().padStart(4,0);
                stringToPrint += fieldName + " = " + valueHex + " | ";
            }
        }
        console.log("%s\n", stringToPrint);
        return;
    }

    if(payload.data.payloadType == "Heartbeat 1.0")
    {   
        let firmwareRevisionHexString = payload.data.fwVersionMajor.toString(10) + "." + payload.data.fwVersionMinor.toString(10) + "." + payload.data.fwVersionPatch.toString(10) + "." + payload.data.fwVersionCustom.toString(10);
        console.log("%s | %s | %s | %s | " + 
                                "Battery Level MV = %d | FW Version = %s | Last RSSI = %d | Analog Voltage Config = %d | Analog Power Time Config = %d | Failed Transmissions Before Rejoin Config = %d | " +
                                "Cycle Through FSB Config = %d | ACK Enable Config = %d | ACK Frequency Config = %d | ACK Request Config = %d | Battery Level Threshold Config = %d |\n", 
                    payload.timestamp, payload.deveui, payload.data.voboType, payload.data.payloadType,
                                payload.data.batteryLevelMV, firmwareRevisionHexString, payload.data.recSignalLevels, payload.data.analogVoltageConfig, payload.data.analogPowerTimeConfig, payload.data.failedTransmissionBeforeRejoinConfig, 
                                payload.data.cycleThroughFSB, payload.data.ackEnable, payload.data.ackFreq, payload.data.ackReq, payload.data.batteryLevelThreshold);
        return;
    }

    if(payload.data.payloadType == "Heartbeat 2.0")
    {   
        let firmwareRevisionHexString = payload.data.firmwareRevision.toString(16).toUpperCase().padStart(3,0);
        console.log("%s | %s | %s | %s | " + 
                                "Battery Level = %d | Fatal Errors Total = %d | RSSI Avg = %d | Failed Join Attempts Total = %d | Config Update Occurred = %d | Firmware Revision = 0x%s | " +
                                "Reboots Total = %d | Failed Transmits Total = %d | Error Event Logs Total = %d | Warning Event Logs Total = %d | Info Event Logs Total = %d | Measurement Packets Total = %d |\n", 
                    payload.timestamp, payload.deveui, payload.data.voboType, payload.data.payloadType,
                                payload.data.batteryLevel, payload.data.fatalErrorsTotal, payload.data.rssiAvg, payload.data.failedJoinAttemptsTotal, payload.data.configUpdateOccurred, firmwareRevisionHexString, 
                                payload.data.rebootsTotal, payload.data.failedTransmitsTotal, payload.data.errorEventLogsTotal, payload.data.warningEventLogsTotal, payload.data.infoEventLogsTotal, payload.data.measurementPacketsTotal);
        return;
    }

    if(payload.data.payloadType == "One Analog Input") 
    {
        let fractionDigitsData0 = 1;
        if(payload.data.engUnitsString0 == "mV" || payload.data.engUnitsString0 == "V") fractionDigitsData0 = 3;
        if(payload.data.engUnitsString0 == "ADC code") fractionDigitsData0 = 0;
        console.log("%s | %s | %s | %s | %s = %f %s |\n", payload.timestamp, payload.deveui, payload.data.voboType, payload.data.payloadType, payload.data.analogSensorString0, parseFloat(payload.data.sensorData0).toFixed(fractionDigitsData0), payload.data.engUnitsString0);
        return;
    }

    if(payload.data.payloadType == "Two Analog Inputs") 
    {
        let fractionDigitsData0 = 1;
        if(payload.data.engUnitsString0 == "mV" || payload.data.engUnitsString0 == "V" || payload.data.engUnitsString0 == "mA" || payload.data.engUnitsString0 == "A") fractionDigitsData0 = 3;
        if(payload.data.engUnitsString0 == "ADC code") fractionDigitsData0 = 0;
        let fractionDigitsData1 = 1;
        if(payload.data.engUnitsString1 == "mV" || payload.data.engUnitsString1 == "V" || payload.data.engUnitsString1 == "mA" || payload.data.engUnitsString1 == "A") fractionDigitsData1 = 3;
        if(payload.data.engUnitsString1 == "ADC code") fractionDigitsData1 = 0;
        console.log("%s | %s | %s | %s | %s = %f %s | %s = %f %s |\n", payload.timestamp, payload.deveui, payload.data.voboType, payload.data.payloadType, payload.data.analogSensorString0, parseFloat(payload.data.sensorData0).toFixed(fractionDigitsData0), payload.data.engUnitsString0, payload.data.analogSensorString1, parseFloat(payload.data.sensorData1).toFixed(fractionDigitsData1), payload.data.engUnitsString1);
        return;
    }

    if (payload.data.payloadType == "Analog Input Variable Length")
    {
        var stringToPrint = "";
        for (let i = 0; i < payload.data.numOfAinPayloads; i++)
        {
            analogSensorString0 = lookupAnalogSensorName(payload.data.voboType, payload.data.ainPayloads[i].sensorNum0);
            engUnitsString0 = lookupUnits(1, payload.data.ainPayloads[i].sensorUnits0);
            sensorData0 = payload.data.ainPayloads[i].sensorData0;

            let fractionDigitsData0 = 1;
            if(engUnitsString0 == "mV" || engUnitsString0 == "V" || engUnitsString0 == "mA" || engUnitsString0 == "A") fractionDigitsData0 = 3;
            if (engUnitsString0 == "ADC code") fractionDigitsData0 = 0;
            stringToPrint = stringToPrint + analogSensorString0 + " = " + parseFloat(sensorData0).toFixed(fractionDigitsData0) + " " + engUnitsString0 + " | ";
        }
        console.log("%s | %s | %s | %s | %s\n", payload.timestamp, payload.deveui, payload.data.voboType, payload.data.payloadType, stringToPrint);
        return;
    }

    if(payload.data.payloadType == "Modbus Standard Variable Length")
    {
        dataKeys = Object.keys(payload.data.modbusSlots);
        let stringToPrint = payload.timestamp + " | " + payload.deveui + " | " + payload.data.voboType + " | " + payload.data.payloadType + " | ";
        for (let idx = 0; idx < dataKeys.length; idx++)
        {
            let fieldName = dataKeys[idx];
            let valueHex = "0x" + payload.data.modbusSlots[fieldName].toString(16).toUpperCase().padStart(4,0);
            stringToPrint += fieldName + " = " + valueHex + " | ";
        }
        console.log("%s\n", stringToPrint);
        return;
    }
    
    if(payload.data.payloadType == "Digital Inputs") 
    {
        var stringToPrint = ""
        for (let i = 0; i < payload.data.digitalSensorData.length; i++) 
        {
            stringToPrint = stringToPrint + payload.data.digitalSensorStrings[i] + " = " + payload.data.digitalSensorData[i].toString() + " | ";
        }
        console.log("%s | %s | %s | %s | %s\n", payload.timestamp, payload.deveui, payload.data.voboType, payload.data.payloadType, stringToPrint);
        return;
    }

    if(payload.data.payloadType == "Event Log")
    {   
        let eventTimestampDateTime = new Date(payload.data.eventTimestamp * 1000).toISOString();
        let eventCodeHexString = payload.data.eventCode.toString(16).toUpperCase().padStart(4,0);
        let metadataHexString = Buffer.from(payload.data.metadata).toString("hex").toUpperCase();
        console.log("%s | %s | %s | %s | Timestamp = %s | Code = 0x%s | Metadata = 0x%s |\n", payload.timestamp, payload.deveui, payload.data.voboType, payload.data.payloadType, eventTimestampDateTime, eventCodeHexString, metadataHexString);
        return;
    }

    if(payload.data.payloadType == "Modbus Generic")
    {
        let dataKeys = Object.keys(payload.data);
        let stringToPrint = payload.timestamp + " | " + payload.deveui + " | " + payload.data.voboType + " | " + payload.data.payloadType + " | ";
        for (let idx = 0; idx < dataKeys.length; idx++)
        {
            if((dataKeys[idx] != "fport") && (dataKeys[idx] != "voboType") && (dataKeys[idx] != "payloadType"))
            {
                let fieldName = dataKeys[idx];
                let regValueHexStr = "0x" + payload.data[fieldName].toString(16).toUpperCase().padStart(4,0);
                stringToPrint += fieldName + " = " + regValueHexStr + " | ";
            }
        }
        console.log("%s\n", stringToPrint);
        return;
    }

    console.log(JSON.stringify(payload, null, 4));
    console.log("");
}

// module.exports = {customDecoder, decodeUplink, Decoder, addVoboMetadata, lookupAnalogSensorName, lookupDigitalSensorName, lookupUnits,
//                     hexToFloat, modbusToFloat_AB_CD_to_ABCD, modbusToFloat_AB_CD_to_DCBA, modbusToFloat_AB_CD_to_BADC, modbusToFloat_AB_CD_to_CDAB, printPayload}