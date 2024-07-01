
/**
 * Payload Decoder for Dragino CPL03
 * 
 * This decoder processes payloads for the Dragino CPL03 sensor.
 * It supports different functionalities like status, battery voltage, open counts,
 * open duration, temperature, and datalogging.
 */

function decodeUplink(input) {
    var bytes = input.bytes;
    var data = {};

    switch (input.fPort) {
        case 2:
            // Status byte
            data.battery_low = (bytes[0] & 0x80) ? true : false;
            data.external_power = (bytes[0] & 0x40) ? true : false;
            data.open_alarm = (bytes[0] & 0x20) ? true : false;
            data.contact_status = (bytes[0] & 0x10) ? "open" : "closed";

            // Battery voltage (V)
            data.battery_voltage = ((bytes[1] << 8) | bytes[2]) / 1000;

            // Open counts
            data.open_counts = (bytes[3] << 8) | bytes[4];

            // Open duration (seconds)
            data.open_duration = (bytes[5] << 8) | bytes[6];

            // Temperature (°C)
            data.temperature = (bytes[7] << 8 | bytes[8]) / 100;

            break;
        case 3:
            // Data logging case
            data.datalog = [];
            for (var i = 0; i < bytes.length; i += 11) {
                var log_entry = {
                    battery_low: (bytes[i] & 0x80) ? true : false,
                    external_power: (bytes[i] & 0x40) ? true : false,
                    open_alarm: (bytes[i] & 0x20) ? true : false,
                    contact_status: (bytes[i] & 0x10) ? "open" : "closed",
                    battery_voltage: ((bytes[i + 1] << 8) | bytes[i + 2]) / 1000,
                    open_counts: (bytes[i + 3] << 8) | bytes[i + 4],
                    open_duration: (bytes[i + 5] << 8) | bytes[i + 6],
                    temperature: (bytes[i + 7] << 8 | bytes[i + 8]) / 100
                };
                data.datalog.push(log_entry);
            }
            break;
        case 4:
            // Configuration or other data, assuming additional functionality
            data.TDC = bytes[0] << 16 | bytes[1] << 8 | bytes[2];
            data.DISALARM = bytes[3] & 0x01;
            data.KEEP_STATUS = bytes[4] & 0x01;
            data.KEEP_TIME = bytes[5] << 8 | bytes[6];
            data.TRIGGER_MODE = bytes[7] & 0x01;
            break;
        case 5:
            // Device settings or status
            if (bytes[0] == 0x0E) {
                data.SENSOR_MODEL = "CPL03";
            }
            data.SUB_BAND = bytes[4] == 0xff ? "NULL" : bytes[4];
            data.FREQUENCY_BAND = decodeFrequencyBand(bytes[3]);
            data.FIRMWARE_VERSION = (bytes[1] & 0x0f) + '.' + (bytes[2] >> 4 & 0x0f) + '.' + (bytes[2] & 0x0f);
            data.BAT = (bytes[5] << 8 | bytes[6]) / 1000;
            break;
        default:
            return {
                errors: ["unknown FPort"]
            };
    }

    return {
        data: data
    };
}

function decodeFrequencyBand(byte) {
    switch (byte) {
        case 0x01: return "EU868";
        case 0x02: return "US915";
        case 0x03: return "IN865";
        case 0x04: return "AU915";
        case 0x05: return "KZ865";
        case 0x06: return "RU864";
        case 0x07: return "AS923";
        case 0x08: return "AS923_1";
        case 0x09: return "AS923_2";
        case 0x0A: return "AS923_3";
        case 0x0B: return "CN470";
        case 0x0C: return "EU433";
        case 0x0D: return "KR920";
        case 0x0E: return "MA869";
        default: return "Unknown";
    }
}
