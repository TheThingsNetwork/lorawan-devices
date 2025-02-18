function decodeUplink(input) {
  const bytes = input.bytes;
  const port = input.fPort;
  let statusByte = 0;
  let confChangeId = 0;
  let confSuccess = 0;
  let moving= 0;
  let index = 0;
  let latitude = 0;
  let longitude = 0;
  let altitude = 0;
  let unixTimestamp = 0;
  let battery = 0;
  let ttf = 0;
  let pdop = 0;
  let numSatellites = 0;
  let bufferLevel = null;
  switch (port) {
    case 3:
      if (bytes.length < 11) {
          return { errors: ["Payload too short"] };
      }
  
      let scanPointer = (bytes[0] << 8) | bytes[1];
      let totalMessages = bytes[2];
      let currentMessage = bytes[3];
  
      let beacons = [];
      index = 4;
  
      // Each beacon: 6 bytes MAC + 1 byte RSSI = 7 bytes
      while (index + 7 <= bytes.length) {
          let mac = Array.from(bytes.slice(index, index + 6))
              .map(b => b.toString(16).padStart(2, "0"))
              .join(":");
          let rssi = bytes[index + 6] - 256; // int8 signed representation
          beacons.push({ mac, rssi });
          index += 7;
      }
  
      return {
          data: {
              scanPointer,
              totalMessages,
              currentMessage,
              beacons
          }
      };
    case 4:
      if (bytes.length !== 32) {
        return { errors: ["Invalid payload length. Expected 32 bytes."] };
      }
  
      // Helper function to read uint32 (big-endian)
      const readUint32 = (idx) => (bytes[idx] << 24) | (bytes[idx + 1] << 16) | (bytes[idx + 2] << 8) | bytes[idx + 3];

      // Helper function to read uint16 (big-endian)
      const readUint16 = (idx) => (bytes[idx] << 8) | bytes[idx + 1];

      const localizationIntervalMoving = readUint32(0);
      const localizationIntervalSteady = readUint32(4);
      const configStatusInterval = readUint32(8);
      const gpsTimeout = readUint16(12);
      const accelerometerWakeupThreshold = readUint16(14);
      const accelerometerDelay = readUint16(16);
      const deviceState = bytes[18];
      const firmwareVersion = `${bytes[19]}.${bytes[20]}.${bytes[21]}`;
      const hardwareVersion = `${bytes[22]}.${bytes[23]}`;
      const batteryKeepAliveInterval = readUint32(24);
      const batchSize = readUint16(28);
      const bufferSize = readUint16(30);

      return {
          data: {
              localizationIntervalMoving: `${localizationIntervalMoving} s`,
              localizationIntervalSteady: `${localizationIntervalSteady} s`,
              configStatusInterval: `${configStatusInterval} s`,
              gpsTimeout: `${gpsTimeout} s`,
              accelerometerWakeupThreshold: `${accelerometerWakeupThreshold} mg`,
              accelerometerDelay: `${accelerometerDelay} ms`,
              deviceState: deviceState === 1 ? "moving" : deviceState === 2 ? "steady" : "unknown",
              firmwareVersion,
              hardwareVersion,
              batteryKeepAliveInterval: `${batteryKeepAliveInterval} s`,
              batchSize,
              bufferSize
          }
      };
    case 6:
      if (bytes.length !== 1) {
        return { errors: ["Invalid payload length for button press"] };
    }

    const buttonPressed = bytes[0] === 0x01;

    return {
        data: {
            buttonPressed
        }
    };
    case 5:
    case 7:
    case 105:
      if (port !== 5 && port !== 7 && port !== 105) {
        return { errors: ["Unsupported port. Only ports 5, 7 and 105 are supported."] };
    }

    // Determine if timestamp is present (port 7)
    index = 0;
    let timestamp = null;

    if (port === 7) {
        if (bytes.length < 12) {
            return { errors: ["Invalid payload length for WiFi with Timestamp"] };
        }
        timestamp = (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
        index = 4;
    } else if (port === 105) {
        if (bytes.length < 14) {
          return { errors: ["Invalid payload length for buffered WiFi message"] };
      }
      bufferLevel = (bytes[0] << 8) | bytes[1]; // Buffer level (2 bytes, uint16)
      timestamp = (bytes[2] << 24) | (bytes[3] << 16) | (bytes[4] << 8) | bytes[5];
      index = 6;  // Offset WiFi data after the buffer level and timestamp
    } else {
        if (bytes.length < 8) {
            return { errors: ["Invalid payload length for WiFi packet"] };
        }
        // If no timestamp (Port 5), use current timestamp
        timestamp = Math.floor(Date.now() / 1000); // Current Unix timestamp
    }

    // Extract status byte
    statusByte = bytes[index++];
    confChangeId = (statusByte >> 3) & 0x0F; // bits 6:3
    confSuccess = (statusByte >> 2) & 0x01;  // bit 2
    moving = statusByte & 0x01;              // bit 0

    // Parse WiFi access points
    let accessPoints = [];
    while (index + 7 <= bytes.length) {
        let mac = Array.from(bytes.slice(index, index + 6))
            .map(b => b.toString(16).padStart(2, "0"))
            .join(":");
        let rssi = bytes[index + 6] - 256; // Convert uint8 to int8
        accessPoints.push({ mac, rssi });
        index += 7;
    }

    return {
        data: {
            bufferLevel: bufferLevel,
            wifiTimestamp: timestamp,
            wifiDatetime: new Date(timestamp * 1000).toISOString(),
            conf_change_id: confChangeId,
            conf_success: confSuccess === 1,
            moving: moving === 1,
            accessPoints
        }
    };
    case 8:
      if (bytes.length < 22) {
          return { errors: ["Invalid payload length for BLE config packet. Expected at least 22 bytes."] };
      }

      // Extract Scan Interval (2 bytes, uint16)
      const scanInterval = (bytes[0] << 8) | bytes[1];

      // Extract Scan Time (1 byte, uint8)
      const scanTime = bytes[2];

      // Extract Max Beacons (1 byte, uint8)
      const maxBeacons = bytes[3];

      // Extract Minimum RSSI Value (1 byte, int8)
      const minRssi = bytes[4];

      // Extract Advertising Name/Eddystone Namespace Filter (10 bytes, ASCII or uint8)
      const filter = bytes.slice(5, 15); // 10 bytes
      const advertisingName = String.fromCharCode(...filter); // Assuming it's ASCII

      // Extract Accelerometer Trigger Hold Timer (2 bytes, uint16)
      const accelTriggerHoldTimer = (bytes[15] << 8) | bytes[16];

      // Extract Accelerometer Threshold (2 bytes, uint16)
      const accelThreshold = (bytes[17] << 8) | bytes[18];

      // Extract Scan Mode (1 byte, uint8)
      const scanMode = bytes[19];

      // Extract BLE Current Configuration Uplink Interval (2 bytes, uint16)
      const uplinkInterval = (bytes[20] << 8) | bytes[21];

      // Prepare Scan Mode string
      let scanModeStr = '';
      if (scanMode === 0) {
          scanModeStr = 'No filter';
      } else if (scanMode === 1) {
          scanModeStr = 'Advertising name filter';
      } else if (scanMode === 2) {
          scanModeStr = 'Eddystone namespace filter';
      }

      // Prepare Advertising Name or Eddystone Namespace Filter
      let advertisingOrNamespace = '';
      if (scanMode === 1) {
          advertisingOrNamespace = advertisingName.trim();  // If scan mode 1, show advertising name
      } else if (scanMode === 2) {
          advertisingOrNamespace = filter.map(byte => byte.toString(16).padStart(2, '0')).join(' ');  // If scan mode 2, show namespace filter as hex array
      }

      return {
          data: {
              scanInterval: scanInterval,                   // Scan interval in seconds
              scanTime: scanTime,                           // Scan time in seconds
              maxBeacons: maxBeacons,                       // Maximum number of beacons
              minRssi: minRssi,                             // Minimum RSSI value
              accelTriggerHoldTimer: accelTriggerHoldTimer, // Accelerometer trigger hold timer in seconds
              accelThreshold: accelThreshold,               // Accelerometer threshold in mg
              scanMode: scanMode,                           // Scan mode (0, 1, or 2)
              scanModeStr: scanModeStr,                     // Scan mode as string
              advertisingOrNamespace: advertisingOrNamespace, // Advertising name or Eddystone namespace filter (hex array)
              uplinkInterval: uplinkInterval                // BLE current configuration uplink interval in seconds
          }
      };
    case 10:
    case 110:
      if (bytes.length < 20) {
        return { errors: ["Invalid payload length for GNSS packet. Expected at least 20 bytes."] };
      }
      // If it's Buffered GNSS Uplink (Port 110), extract the buffer level (2 bytes)
      if (port === 110) {
        bufferLevel = (bytes[0] << 8) | bytes[1]; // Buffer level (2 bytes, uint16)
        index = 2;  // Offset GNSS data after the buffer level
        statusByte = bytes[2]; // Extract Status byte (1 byte)
      } else {
        index = 0;
        statusByte = bytes[0]; // Extract Status byte (1 byte)
      }

    // Extract Status Byte contents
    confChangeId = (statusByte >> 3) & 0x0F; // bits 6:3
    confSuccess = (statusByte >> 2) & 0x01;  // bit 2
    moving = statusByte & 0x01;              // bit 0

    // Extract Latitude (4 bytes, int32)
    latitude = (bytes[index + 1] << 24) | (bytes[index + 2] << 16) | (bytes[index + 3] << 8) | bytes[index + 4];
    
    // Extract Longitude (4 bytes, int32)
    longitude = (bytes[index + 5] << 24) | (bytes[index + 6] << 16) | (bytes[index + 7] << 8) | bytes[index + 8];

    // Extract Altitude (2 bytes, uint16)
    altitude = (bytes[index + 9] << 8) | bytes[index + 10];

    // Extract Unix Timestamp (4 bytes, uint32)
    unixTimestamp = (bytes[index + 11] << 24) | (bytes[index + 12] << 16) | (bytes[index + 13] << 8) | bytes[index + 14];

    // Extract Battery (2 bytes, uint16)
    battery = (bytes[index + 15] << 8) | bytes[index + 16];

    // Extract TTF (Time to Fix, 1 byte, uint8)
    ttf = bytes[index + 17];

    // Extract PDOP (Position Dilution of Precision, 1 byte, uint8)
    pdop = bytes[index + 18];

    // Extract Number of Satellites (1 byte, uint8)
    numSatellites = bytes[index + 19];

    return {
        data: {
            bufferLevel: bufferLevel,
            latitude: latitude / 1000000,   // Convert to degrees
            longitude: longitude / 1000000, // Convert to degrees
            altitude: altitude / 10,        // Convert to meters
            gnssTimestamp: unixTimestamp,
            gnssDatetime: new Date(unixTimestamp * 1000).toISOString(),
            batteryVoltage: battery,
            ttf: ttf,
            pdop: pdop / 2, 
            numSatellites: numSatellites,
            moving: moving === 1,
            conf_change_id: confChangeId,
            conf_success: confSuccess === 1
        }
    };
    case 15:
      if (bytes.length < 3) {
          return { errors: ["Invalid payload length for Battery packet. Expected at least 3 bytes."] };
      }

      // Extract Status Byte
      statusByte = bytes[0];
      const lowBatteryFlag = statusByte & 0x01; // bit 0: low battery flag
      confChangeId = (statusByte >> 3) & 0x0F; // bits 6:3
      confSuccess = (statusByte >> 2) & 0x01;  // bit 2

      // Extract Battery Voltage (2 bytes, uint16)
      const batteryVoltage = (bytes[1] << 8) | bytes[2]; // Combine high and low byte

      return {
          data: {
              batteryVoltage: batteryVoltage,    // Battery voltage in mV
              lowBattery: lowBatteryFlag === 1,  // Low battery flag (true if low)
              confChangeId: confChangeId,        // Config change ID (if applicable)
              conf_success: confSuccess === 1
          }
      };
    case 51:
    case 151:
      // Check if the port is either 51 (Combined Uplink) or 151 (Buffered Combined Uplink)
      if (port !== 51 && port !== 151) {
          return { errors: ["Unsupported port. Only port 51 and 151 are supported."] };
      }

      if (bytes.length < 27) {
          return { errors: ["Invalid payload length. Expected at least 27 bytes."] };
      }

      // Initialize buffer level and wifiData array for both cases
      bufferLevel = null;
      let wifiData = [];
      index = 0;
      // If it's Buffered Combined Uplink (Port 151), extract the buffer level (2 bytes)
      if (port === 151) {
          bufferLevel = (bytes[0] << 8) | bytes[1]; // Buffer level (2 bytes, uint16)
          index = 2;  // Start WiFi data after the buffer level
          statusByte = bytes[2]; // Extract Status byte (1 byte)
      } else {
        statusByte = bytes[0]; // Extract Status byte (1 byte)
      }
      
      confChangeId = (statusByte >> 3) & 0x0F; // bits 6:3
      confSuccess = (statusByte >> 2) & 0x01;  // bit 2
      moving = statusByte & 0x01;              // bit 0

      // Extract Latitude (4 bytes, int32)
      latitude = (bytes[index + 1] << 24) | (bytes[index + 2] << 16) | (bytes[index + 3] << 8) | bytes[index + 4];

      // Extract Longitude (4 bytes, int32)
      longitude = (bytes[index + 5] << 24) | (bytes[index + 6] << 16) | (bytes[index + 7] << 8) | bytes[index + 8];

      // Extract Altitude (2 bytes, uint16)
      altitude = (bytes[index + 9] << 8) | bytes[index + 10];

      // Extract Unix Timestamp (4 bytes, uint32)
      unixTimestamp = (bytes[index + 11] << 24) | (bytes[index + 12] << 16) | (bytes[index + 13] << 8) | bytes[index + 14];

      // Convert Unix Timestamp to Date
      gnssDatetime = new Date(unixTimestamp * 1000).toISOString();

      // Extract Battery voltage (2 bytes, uint16)
      battery = (bytes[index + 15] << 8) | bytes[index + 16];

      // Extract TTF (1 byte, uint8)
      ttf = bytes[index + 17];

      // Extract PDOP (1 byte, uint8)
      pdop = bytes[index + 18];

      // Extract number of satellites (1 byte, uint8)
      numSatellites = bytes[index + 19];

      // Extract WiFi Access Points (MAC1, RSSI1, MAC2, RSSI2, ...)
      let wifiIndex = index + 20;
      while (wifiIndex + 7 <= bytes.length) {
          const mac = bytes.slice(wifiIndex, wifiIndex + 6);
          const rssi = bytes[wifiIndex + 6] - 256; // Convert uint8 to int8
          wifiData.push({
              mac: mac.map(byte => byte.toString(16).padStart(2, '0')).join(':'),
              rssi: rssi
          });
          wifiIndex += 7;
      }

      // Calculate the WiFi scan timestamp (TSGNSS - TTF + 10 seconds)
      const wifiTimestamp = unixTimestamp - ttf + 10;
      
      // Convert WiFi scan timestamp to Date
      const wifiDatetime = new Date(wifiTimestamp * 1000).toISOString();

      // Prepare final data
      return {
          data: {
              bufferLevel: bufferLevel,
              latitude: latitude / 1000000,  // Convert to decimal degrees
              longitude: longitude / 1000000, // Convert to decimal degrees
              altitude: altitude / 10,       // Convert to meters
              gnssTimestamp: unixTimestamp,  // GNSS timestamp
              gnssDatetime: gnssDatetime,    // GNSS timestamp in ISO string format
              batteryVoltage: battery,        // Battery voltage in mV
              ttf: ttf,                       // Time To Fix (in seconds)
              pdop: pdop / 2,                 // PDOP (Position Dilution of Precision)
              numSatellites: numSatellites,   // Number of satellites
              wifiData: wifiData,             // WiFi AP data (MAC and RSSI)
              wifiTimestamp: wifiTimestamp,   // Calculated WiFi scan timestamp
              wifiDatetime: wifiDatetime,      // WiFi scan timestamp in ISO string format
              conf_change_id: confChangeId,
              conf_success: confSuccess === 1,
              moving: moving === 1,
          }
  };
    default:
      return {
        errors: ['unknown FPort'],
      };
  }
}