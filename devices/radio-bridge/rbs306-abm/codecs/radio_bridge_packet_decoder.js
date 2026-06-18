// RADIO BRIDGE PACKET DECODER v1.4
// Copyright 2025 MultiTech Systems, Inc.
////////////////////////////////////////////
// NOTE: This decoder is not officially supported and is provided "as-is" as a developer template.
// Multitech / Radio Bridge make no guarantees about use of this decoder in a production environment.
////////////////////////////////////////////

// SUPPORTED SENSORS:
//   RBS301 Series
//   RBS304 Series
//   RBS305 Series
//   RBS306 Series (except RBS306-VSHB & RBS306-CMPS)

// VERSION 1.2 NOTES:
//   Changed output to JSON
//   Various bug fixes for decodes
//   Compatible with TTNv3
//   Bug fix for thermocouple temperature to 2 decimal places

// VERSION 1.3 NOTES:
//  Removed obsolete code and comments
//  Added RBS301-TEMP-INT Sensor

// VERSION 1.4 NOTES:
//  Fixed Reset Event function
// Added comments to clarify the various temperature probe types
// Cleaned up RESET event
// Removed TTN and ChirpStack capability for this version
// Added decode for device info packets

// General defines used in decode

//  Common Events
var RESET_EVENT               = "00";
var SUPERVISORY_EVENT         = "01";
var TAMPER_EVENT              = "02";
var DEVICE_INFO_EVENT         = "FA";
var LINK_QUALITY_EVENT        = "FB";
var DOWNLINK_ACK_EVENT        = "FF";

//  Device-Specific Events
var DOOR_WINDOW_EVENT         = "03";
var PUSH_BUTTON_EVENT         = "06";
var CONTACT_EVENT             = "07";
var WATER_EVENT               = "08";
var RBS301_EXT_TEMP_EVENT     = "09";
//the above event is also known as a thermistor temp event
var TILT_EVENT                = "0A";
var ATH_EVENT                 = "0D";
var ABM_EVENT                 = "0E";
var TILT_HP_EVENT             = "0F";
var ULTRASONIC_EVENT          = "10";
var SENSOR420MA_EVENT         = "11";
var THERMOCOUPLE_EVENT        = "13";
var VOLTMETER_EVENT           = "14";
var RBS301_INT_TEMP_EVENT     = "19";
//the above event is also known as a CMOS temp event
var VIBRATION_HB_EVENT        = "1A";

var decoded = {};

// Different network servers have different callback functions
// Each of these is mapped to the generic decoder function
// ----------------------------------------------
// function called by ChirpStack
function Decode(fPort, bytes, variables) {
    return Generic_Decoder(bytes, fPort);
}
// function called by TTN
function Decoder(bytes, port) {
    return Generic_Decoder(bytes, port);
}
// function called by TTNv3
function decodeUplink(input) {
    return Generic_Decoder(input.bytes, input.port);
}
// ----------------------------------------------

// The generic decode function called by the above network server specific callbacks
function Generic_Decoder(bytes , port) {
    // data structure which contains decoded messages
    var decode = { data: { Event: "UNDEFINED" }};

    // The first byte contains the protocol version (upper nibble) and packet counter (lower nibble)
    var ProtocolVersion = (bytes[0] >> 4) & 0x0f;
    var PacketCounter = bytes[0] & 0x0f;

    // the event type is defined in the second byte
    var PayloadType = Hex(bytes[1]);

    // the rest of the message decode is dependent on the type of event
    switch (PayloadType) {

        // ==================    RESET EVENT    ====================
        case RESET_EVENT:

           // This will decode the hardware and firmware versions for most sensors.
           // third byte is device type, convert to hex format for case statement
            var EventType = Hex(bytes[2]);
            // device types are enumerated below
            switch (EventType) {
                case "01": DeviceType = "Door/Window Sensor"; break;
                case "02": DeviceType = "Door/Window High Security"; break;
                case "03": DeviceType = "Contact Sensor"; break;
                case "04": DeviceType = "No-Probe Temperature Sensor"; break;
                case "05": DeviceType = "External-Probe Temperature Sensor"; break;
                case "06": DeviceType = "Single Push Button"; break;
                case "07": DeviceType = "Dual Push Button"; break;
                case "08": DeviceType = "Acceleration-Based Movement Sensor"; break;
                case "09": DeviceType = "Tilt Sensor"; break;
                case "0A": DeviceType = "Water Sensor"; break;
                case "0B": DeviceType = "Tank Level Float Sensor"; break;
                case "0C": DeviceType = "Glass Break Sensor"; break;
                case "0D": DeviceType = "Ambient Light Sensor"; break;
                case "0E": DeviceType = "Air Temperature and Humidity Sensor"; break;
                case "0F": DeviceType = "High-Precision Tilt Sensor"; break;
                case "10": DeviceType = "Ultrasonic Level Sensor"; break;
                case "11": DeviceType = "4-20mA Current Loop Sensor"; break;
                case "12": DeviceType = "Ext-Probe Air Temp and Humidity Sensor"; break;
                case "13": DeviceType = "Thermocouple Temperature Sensor"; break;
                case "14": DeviceType = "Voltage Sensor"; break;
                case "19": DeviceType = "Internal-Probe Temperature Sensor"; break;
                case "1A": DeviceType = "Vibration Sensor - High Frequency"; break;
                default:   DeviceType = "Device Undefined"; break;
            }

            // the hardware version has the major version in the upper nibble, and the minor version in the lower nibble
            var HardwareVersionStr = ((bytes[3] >> 4) & 0x0f) + "." + (bytes[3] & 0x0f);

            // the firmware version has two different formats depending on the most significant bit
            var FirmwareFormat = (bytes[4] >> 7) & 0x01;
            // FirmwareFormat of 0 is old format, 1 is new format
            // old format is has two sections x.y
            // new format has three sections x.y.z
            var FirmwareVersionStr = ""
            if (FirmwareFormat === 0)
                FirmwareVersionStr = bytes[4] + "." + bytes[5];
            else
                FirmwareVersionStr = ((bytes[4] >> 2) & 0x1F) + "." + ((bytes[4] & 0x03) + ((bytes[5] >> 5) & 0x07)) + "." + (bytes[5] & 0x1F);

            decode = {data: {
                Protocol: ProtocolVersion,
                Counter: PacketCounter,
                Type: "RESET",
                Reset: {
                    Device: DeviceType,
                    Firmware: FirmwareVersionStr,
                    Hardware: HardwareVersionStr
              }}};
            break;

        // ================   SUPERVISORY EVENT   ==================
        case SUPERVISORY_EVENT:
            // note that the sensor state in the supervisory message is being depreciated, so those are not decoded here
            // battery voltage is in the format x.y volts where x is upper nibble and y is lower nibble
            var BatteryLevel = ((bytes[4] >> 4) & 0x0f) + "." + (bytes[4] & 0x0f);
            BatteryLevel = parseFloat(BatteryLevel);
            // the accumulation count is a 16-bit value
            var AccumulationCount = (bytes[9] * 256) + bytes[10];
            // decode bits for error code byte
            var TamperSinceLastReset = (bytes[2] >> 4) & 0x01;
            var CurrentTamperState = (bytes[2] >> 3) & 0x01;
            var ErrorWithLastDownlink = (bytes[2] >> 2) & 0x01;
            var BatteryLow = (bytes[2] >> 1) & 0x01;
            var RadioCommError = bytes[2] & 0x01;

            decode = {data: {
                Protocol: ProtocolVersion,
                Counter: PacketCounter,
                Type: "SUPERVISORY",
                Supervisory: {
                    Accumulation: AccumulationCount,
                    TamperSinceLastReset: TamperSinceLastReset,
                    TamperState: CurrentTamperState,
                    ErrorWithLastDownlink: ErrorWithLastDownlink,
                    BatteryLow: BatteryLow,
                    RadioCommError: RadioCommError,
                    Battery: BatteryLevel + "V"
            }}};
            break;

        // ==================   TAMPER EVENT    ====================
        case TAMPER_EVENT:
            EventType = bytes[2];
            // tamper state is 0 for open, 1 for closed
            if (EventType == 0)
                TamperEvent = "Open";
            else
                TamperEvent = "Closed";

            decode = {data: {
                Protocol: ProtocolVersion,
                Counter: PacketCounter,
                Type: "TAMPER",
                Tamper: {
                    Event: TamperEvent
            }}};
            break;

        // ==================   DEVICE INFO EVENT    ====================
        case DEVICE_INFO_EVENT:
            var CurrentPacket = (bytes[2] >> 4) & 0x0f;
            var TotalPackets = bytes[2] & 0x0f;
            var SubDownlink = bytes.slice(3, bytes.length);

            decode = {data: {
                Protocol: ProtocolVersion,
                Counter: PacketCounter,
                Type: "DEVICE INFO",
                DeviceInfo: {
                    currentPacket: CurrentPacket,
                    packetAmount: TotalPackets,
                    storedDownlink: SubDownlink
            }}};

            break;

        // ==================   LINK QUALITY EVENT    ====================
        case LINK_QUALITY_EVENT:
            var CurrentSubBand = bytes[2];
            var RSSILastDownlink = (-256 + bytes[3]); // RSSI is always negative
            var SNRLastDownlink = bytes[4];

            decode = {data: {
                Protocol: ProtocolVersion,
                Counter: PacketCounter,
                Type: "LINK QUALITY",
                Link_Quality: {
                    RSSI: RSSILastDownlink,
                    SNR: SNRLastDownlink,
                    Subband: CurrentSubBand
            }}};
            break;

        // ================  DOOR/WINDOW EVENT  ====================
        case DOOR_WINDOW_EVENT:
            var EventType = bytes[2];
            // 0 is closed, 1 is open
            if (EventType == 0)
                DoorEvent = "Closed";
            else
                DoorEvent = "Open";
            decode = {data: {
                Protocol: ProtocolVersion,
                Counter: PacketCounter,
                Type: "DOOR/WINDOW",
                DoorWindow: {
                    Event: DoorEvent
            }}};
            break;

        // ===============  PUSH BUTTON EVENT   ===================
        case PUSH_BUTTON_EVENT:
            EventType = Hex(bytes[2]);
            switch (EventType) {
                // 01 and 02 used on two button
                case "01": ButtonEvent = "Button 1"; break;
                case "02": ButtonEvent = "Button 2"; break;
                // 03 is single button
                case "03": ButtonEvent = "Button"; break;
                // 12 when both buttons pressed on two button
                case "12": ButtonEvent = "Both Buttons"; break;
                default:   ButtonEvent = "Undefined"; break;
            }
            SensorState = bytes[3];
            switch (SensorState) {
                case 0:  ButtonState = "Pressed"; break;
                case 1:  ButtonState = "Released"; break;
                case 2:  ButtonState = "Held"; break;
                default: ButtonState = "Undefined"; break;
            }

            decode = {data: {
                Protocol: ProtocolVersion,
                Counter: PacketCounter,
                Type: "BUTTON",
                Button: {
                    Event: ButtonEvent,
                    State: ButtonState
            }}};
            break;

        // =================   CONTACT EVENT   =====================
        case CONTACT_EVENT:
            EventType = bytes[2];
            // if state byte is 0 then shorted, if 1 then opened
            if (EventType == 0)
                ContactEvent = "Contacts Shorted";
            else
                ContactEvent = "Contacts Opened";

            decode = {data: {
                Protocol: ProtocolVersion,
                Counter: PacketCounter,
                Type: "CONTACT",
                Contact: {
                    Event: ContactEvent
            }}};
            break;

        // ===================  WATER EVENT  =======================
        case WATER_EVENT:
            EventType = bytes[2];
            if (EventType == 0)
                WaterEvent = "Water Present";
            else
                WaterEvent = "Water Not Present";

            WaterRelative = bytes[3];
            decode = {data: {
                Protocol: ProtocolVersion,
                Counter: PacketCounter,
                Type: "WATER",
                Water: {
                    Event: WaterEvent,
                    Relative: WaterRelative
            }}};
            break;

        // ================== RBS301 EXTERNAL PROBE TEMPERATURE EVENT ====================
        case RBS301_EXT_TEMP_EVENT:
            var EventType = bytes[2];
            // current temperature reading
            var Temperature = Convert(bytes[3], 0);
            // relative temp measurement for use with an alternative calibration table
            var TempRaw = Convert(bytes[4], 0);

            decode = {data: {
                Protocol: ProtocolVersion,
                Counter: PacketCounter,
                Type: "TEMP_EXT",
                TempExt: {
                    temperatureEvent: EventType,
                    currentTemperature: Temperature,
                    rawMeasurement: TempRaw
            }}};
            break;

        // ====================  TILT EVENT  =======================
        case TILT_EVENT:
            var EventType = bytes[2];
            var TiltAngle = bytes[3];

            switch (EventType) {
                case 0:  TiltEvent = "Transitioned to Vertical"; break;
                case 1:  TiltEvent = "Transitioned to Horizontal"; break;
                case 2:  TiltEvent = "Report-on-Change Toward Vertical"; break;
                case 3:  TiltEvent = "Report-on-Change Toward Horizontal"; break;
                default: TiltEvent = "Undefined"; break;
            }

            decode = {data: {
                Protocol: ProtocolVersion,
                Counter: PacketCounter,
                Type: "TILT",
                Tilt: {
                    Event: TiltEvent,
                    Angle: TiltAngle
            }}};
            break;

        //==================== RBS301_INT_TEMP_EVENT ============================
        case RBS301_INT_TEMP_EVENT:
            var EventType = bytes[2];
            var Temperature = Convert((bytes[3]) + ((bytes[4] >> 4) / 10), 1);

            decode = {data: {
                Protocol: ProtocolVersion,
                Counter: PacketCounter,
                Type: "TEMP_INT",
                TempInt: {
                    temperatureEvent: EventType,
                    currentTemperature: Temperature
            }}};
        break;

        // =============  AIR TEMP & HUMIDITY EVENT  ===============
        case ATH_EVENT:
            var EventType = bytes[2];
            // integer and fractional values between two bytes
            var Temperature = Convert((bytes[3]) + ((bytes[4] >> 4) / 10), 1);
            // integer and fractional values between two bytes
            var Humidity = parseFloat(+(bytes[5] + ((bytes[6]>>4) / 10)).toFixed(1));

            switch (EventType) {
                case 0:  ATHEvent = "Periodic Report"; break;
                case 1:  ATHEvent = "Temperature has Risen Above Upper Threshold"; break;
                case 2:  ATHEvent = "Temperature has Fallen Below Lower Threshold"; break;
                case 3:  ATHEvent = "Temperature Report-on-Change Increase"; break;
                case 4:  ATHEvent = "Temperature Report-on-Change Decrease"; break;
                case 5:  ATHEvent = "Humidity has Risen Above Upper Threshold"; break;
                case 6:  ATHEvent = "Humidity has Fallen Below Lower Threshold"; break;
                case 7:  ATHEvent = "Humidity Report-on-Change Increase"; break;
                case 8:  ATHEvent = "Humidity Report-on-Change Decrease"; break;
                default: ATHEvent = "Undefined"; break;
            }

            decode = {data: {
                Protocol: ProtocolVersion,
                Counter: PacketCounter,
                Type: "ATH",
                ATH: {
                    Event: ATHEvent,
                    Temperature: Temperature,
                    Humidity: Humidity
            }}};
            break;

        // ============  ACCELERATION MOVEMENT EVENT  ==============
        case ABM_EVENT:
            var EventType = bytes[2];

            if (EventType == 0)
                ABMEvent = "Movement Started";
            else
                ABMEvent = "Movement Stopped";

            decode = {data: {
                Protocol: ProtocolVersion,
                Counter: PacketCounter,
                Type: "ABM",
                ABM: {
                    Event: ABMEvent
            }}};
            break;

        // =============  HIGH-PRECISION TILT EVENT  ===============
        case TILT_HP_EVENT:
            var EventType = bytes[2];

            // integer and fractional values between two bytes
            var TiltHPAngle = parseFloat(+(bytes[3] + ((bytes[4]>>4) / 10)).toFixed(1));
            var Temperature = Convert(bytes[5], 1);

            switch (EventType) {
                case 0:  TiltHPEvent = "Periodic Report"; break;
                case 1:  TiltHPEvent = "Transitioned Toward 0-Degree Vertical Orientation"; break;
                case 2:  TiltHPEvent = "Transitioned Away From 0-Degree Vertical Orientation"; break;
                case 3:  TiltHPEvent = "Report-on-Change Toward 0-Degree Vertical Orientation"; break;
                case 4:  TiltHPEvent = "Report-on-Change Away From 0-Degree Vertical Orientation"; break;
                default: TiltHPEvent = "Undefined"; break;
            }

            decode = {data: {
                Protocol: ProtocolVersion,
                Counter: PacketCounter,
                Type: "TILT-HP",
                TiltHP: {
                    Event: TiltHPEvent,
                    Angle: TiltHPAngle,
                    Temperature: Temperature
            }}};
            break;

        // ===============  ULTRASONIC LEVEL EVENT  ================
        case ULTRASONIC_EVENT:
            var EventType = bytes[2];
            // distance is calculated across 16-bits
            var Distance = ((bytes[3] * 256) + bytes[4]);

            switch (EventType) {
                case 0:  UltrasonicEvent = "Periodic Report"; break;
                case 1:  UltrasonicEvent = "Distance has Risen Above Upper Threshold"; break;
                case 2:  UltrasonicEvent = "Distance has Fallen Below Lower Threshold"; break;
                case 3:  UltrasonicEvent = "Report-on-Change Increase"; break;
                case 4:  UltrasonicEvent = "Report-on-Change Decrease"; break;
                default: UltrasonicEvent = "Undefined"; break;
            }

            decode = {data: {
                Protocol: ProtocolVersion,
                Counter: PacketCounter,
                Type: "ULTRASONIC",
                Ultrasonic: {
                    Event: UltrasonicEvent,
                    Distance: Distance
            }}};
            break;

        // ================  4-20mA ANALOG EVENT  ==================
        case SENSOR420MA_EVENT:
            var EventType = bytes[2];
            // calculatec across 16-bits, convert from units of 10uA to mA
            var Analog420mA = ((bytes[3] * 256) + bytes[4]) / 100;

            switch (EventType) {
                case 0:  A420mAEvent = "Periodic Report"; break;
                case 1:  A420mAEvent = "Analog Value has Risen Above Upper Threshold"; break;
                case 2:  A420mAEvent = "Analog Value has Fallen Below Lower Threshold"; break;
                case 3:  A420mAEvent = "Report on Change Increase"; break;
                case 4:  A420mAEvent = "Report on Change Decrease"; break;
                default: A420mAEvent = "Undefined"; break;
            }

            decode = {data: {
                Protocol: ProtocolVersion,
                Counter: PacketCounter,
                Type: "4-20mA",
                A420mA: {
                    Event: A420mAEvent,
                    Current: Analog420mA,
            }}};
            break;

        // =================  THERMOCOUPLE EVENT  ==================
        case THERMOCOUPLE_EVENT:
            EventType = bytes[2];
            switch (EventType) {
                case 0:  ThermocoupleEvent = "Periodic Report"; break;
                case 1:  ThermocoupleEvent = "Analog Value has Risen Above Upper Threshold"; break;
                case 2:  ThermocoupleEvent = "Analog Value has Fallen Below Lower Threshold"; break;
                case 3:  ThermocoupleEvent = "Report on Change Increase"; break;
                case 4:  ThermocoupleEvent = "Report on Change Decrease"; break;
                default: ThermocoupleEvent = "Undefined"; break;
            }
            // decode is across 16-bits
            negativeNumber = 0xFFFF0000;
            Temp16bits = ((bytes[3] << 8) | bytes[4]);

            if(Temp16bits & 0x8000)
            {
              Temperature = (negativeNumber | Temp16bits)/16;
            }
            else
            {
              Temperature = Temp16bits/16;
            }

            Faults = bytes[5];
            // decode each bit in the fault byte
            FaultColdOutsideRange = (Faults >> 7) & 0x01;
            FaultHotOutsideRange = (Faults >> 6) & 0x01;
            FaultColdAboveThresh = (Faults >> 5) & 0x01;
            FaultColdBelowThresh = (Faults >> 4) & 0x01;
            FaultTCTooHigh = (Faults >> 3) & 0x01;
            FaultTCTooLow = (Faults >> 2) & 0x01;
            FaultVoltageOutsideRange = (Faults >> 1) & 0x01;
            FaultOpenCircuit = Faults & 0x01;
            // Decode faults
            if (FaultColdOutsideRange)    FaultCOR = "True"; else FaultCOR = "False";
            if (FaultHotOutsideRange)     FaultHOR = "True"; else FaultHOR = "False";
            if (FaultColdAboveThresh)     FaultCAT = "True"; else FaultCAT = "False";
            if (FaultColdBelowThresh)     FaultCBT = "True"; else FaultCBT = "False";
            if (FaultTCTooHigh)           FaultTCH = "True"; else FaultTCH = "False";
            if (FaultTCTooLow)            FaultTCL = "True"; else FaultTCL = "False";
            if (FaultVoltageOutsideRange) FaultVOR = "True"; else FaultVOR = "False";
            if (FaultOpenCircuit)         FaultOPC = "True"; else FaultOPC = "False";

            decode = {data: {
                Protocol: ProtocolVersion,
                Counter: PacketCounter,
                Type: "Thermocouple",
                Thermocouple: {
                    Event: ThermocoupleEvent,
                    Temperature: Temperature,
                    Fault: {
                        ColdOutsideRange: FaultCOR,
                        HotOutsideRange: FaultHOR,
                        ColdAboveThresh: FaultCAT,
                        ColdBelowThresh: FaultCBT,
                        TCTooHigh: FaultTCH,
                        TCTooLow: FaultTCL,
                        VoltageOutsideRange: FaultVOR,
                        OpenCircuit: FaultOPC
            }}}};
            break;

        // ================  VOLTMETER EVENT  ==================
        case VOLTMETER_EVENT:
            var EventType = bytes[2];

            // voltage is measured across 16-bits, convert from units of 10mV to V
            var Voltage = ((bytes[3] * 256) + bytes[4]) / 100;

            switch (EventType) {
                case 0:  VoltmeterEvent = "Periodic Report"; break;
                case 1:  VoltmeterEvent = "Voltage has Risen Above Upper Threshold"; break;
                case 2:  VoltmeterEvent = "Voltage has Fallen Below Lower Threshold"; break;
                case 3:  VoltmeterEvent = "Report on Change Increase"; break;
                case 4:  VoltmeterEvent = "Report on Change Decrease"; break;
                default: VoltmeterEvent = "Undefined";
            }

            decode = {data: {
                Protocol: ProtocolVersion,
                Counter: PacketCounter,
                Type: "VOLTMETER",
                Voltmeter: {
                    Event: VoltmeterEvent,
                    Voltage: Voltage
            }}};
            break;

        // ==================   DOWNLINK EVENT  ====================
        case DOWNLINK_ACK_EVENT:
            var EventType = bytes[2];

            if (EventType == 1)
                DownlinkEvent = "Message Invalid";
            else
                DownlinkEvent = "Message Valid";

            decode = {data: {
                Protocol: ProtocolVersion,
                Counter: PacketCounter,
                Type: "DOWNLINKACK",
                DownlinkACK: {
                    Event: DownlinkEvent
            }}};
            break;

        // end of EventType Case
    }

// return decoded object
  return decode;
}

function Hex(decimal) {
    var decimal = ('0' + decimal.toString(16).toUpperCase()).slice(-2);
    return decimal;
}

function Convert(number, mode) {
    var result = 0;
    switch (mode) {
        // for EXT-TEMP and INT_TEMP
        case 0: if (number > 127) { result = number - 256 } else { result = number }; break;
        //for ATH temp
        case 1: if (number > 127) { result = -+(number - 128).toFixed(1) } else { result = +number.toFixed(1) }; break;
    }
    return result;
}
