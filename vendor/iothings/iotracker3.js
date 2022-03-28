"use strict";

/* eslint no-bitwise: ["error", { "allow": ["&", "<<", ">>", "|"] }] */
/* eslint no-plusplus: "off" */

function Decoder(bytes) {

  var decoded = {};

  var index = 0;

  function toSignedChar(byte) {
    return (byte & 127) - (byte & 128);
  }

  function toSignedShort(byte1, byte2) {
    var sign = byte1 & 1 << 7;
    var x = (byte1 & 0xFF) << 8 | byte2 & 0xFF;

    if (sign) {
      return 0xFFFF0000 | x;
    }

    return x;
  }

  function toUnsignedShort(byte1, byte2) {
    return (byte1 << 8) + byte2;
  }

  function toSignedInteger(byte1, byte2, byte3, byte4) {
    return (byte1 & 0x80 ? -1 : 1) * ((byte1 & 0x7F) << 24) + (byte2 << 16) + (byte3 << 8) + byte4;
  }

  function substring(source, offset, length) {

    var buffer = Buffer.alloc(length);
    source.copy(buffer, 0, offset, offset + length);
    return buffer.toString('hex');
  }
  function parseBluetoothBeacons00() {
    var beaconStatus = bytes[index++];
    var beaconType = beaconStatus & 0x03;
    var rssiRaw = beaconStatus >> 2;
    var rssi = 27 - rssiRaw * 2;
    var beacon = void 0;

    switch (beaconType) {
      case 0x00:
        beacon = {
          type: 'ibeacon',
          rssi: rssi,
          uuid: substring(bytes, index, 2),
          major: substring(bytes, index + 2, 2),
          minor: substring(bytes, index + 4, 2)
        };
        index += 6;
        return beacon;

      case 0x01:
        beacon = {
          type: 'eddystone',
          rssi: rssi,
          instance: substring(bytes, index, 6)
        };
        index += 6;
        return beacon;

      case 0x02:
        beacon = {
          type: 'altbeacon',
          rssi: rssi,
          id1: substring(bytes, index, 2),
          id2: substring(bytes, index + 2, 2),
          id3: substring(bytes, index + 4, 2)
        };
        index += 6;
        return beacon;

      case 0x03:
        beacon = {
          type: 'fullbeacon',
          rssi: rssi,
          id1: substring(bytes, index, 2),
          id2: substring(bytes, index + 2, 2),
          id3: substring(bytes, index + 4, 2)
        };
        index += 6;
        return beacon;

      default:
        return null;
    }
  }
  function parseBluetoothBeacons01() {
    var beaconStatus = bytes[index++];
    var beaconType = beaconStatus & 0x03;
    var rssiRaw = beaconStatus >> 2;
    var rssi = 27 - rssiRaw * 2;
    var beacon = void 0;

    switch (beaconType) {
      case 0x00:
        beacon = {
          type: 'ibeacon',
          rssi: rssi,
          uuid: substring(bytes, index, 16),
          major: substring(bytes, index + 16, 2),
          minor: substring(bytes, index + 18, 2)
        };
        index += 20;
        return beacon;

      case 0x01:
        beacon = {
          type: 'eddystone',
          rssi: rssi,
          namespace: substring(bytes, index, 10),
          instance: substring(bytes, index + 10, 6)
        };
        index += 16;
        return beacon;

      case 0x02:
        beacon = {
          type: 'altbeacon',
          rssi: rssi,
          id1: substring(bytes, index, 16),
          id2: substring(bytes, index + 16, 2),
          id3: substring(bytes, index + 18, 2)
        };
        index += 20;
        return beacon;

      case 0x03:
        beacon = {
          type: 'fullbeacon',
          rssi: rssi,
          id1: substring(bytes, index, 16),
          id2: substring(bytes, index + 16, 2),
          id3: substring(bytes, index + 18, 2)
        };
        index += 20;
        return beacon;

      default:
        return null;
    }
  }
  function parseBluetoothBeacons02() {
    var beaconStatus = bytes[index++];
    var beaconType = beaconStatus & 0x03;
    var slotMatch = beaconStatus >> 2 & 0x07;
    var rssiRaw = bytes[index++] & 63;
    var rssi = 27 - rssiRaw * 2;
    var beacon = void 0;

    switch (beaconType) {
      case 0x00:
        beacon = {
          type: 'ibeacon',
          rssi: rssi,
          slot: slotMatch,
          major: substring(bytes, index, 2),
          minor: substring(bytes, index + 2, 2)
        };
        index += 4;
        return beacon;

      case 0x01:
        beacon = {
          type: 'eddystone',
          rssi: rssi,
          slot: slotMatch,
          instance: substring(bytes, index, 6)
        };
        index += 6;
        return beacon;

      case 0x02:
        beacon = {
          type: 'altbeacon',
          rssi: rssi,
          slot: slotMatch,
          id2: substring(bytes, index, 2),
          id3: substring(bytes, index + 2, 2)
        };
        index += 4;
        return beacon;

      case 0x03:
        beacon = {
          type: 'fullbeacon',
          rssi: rssi,
          slot: slotMatch,
          id2: substring(bytes, index, 2),
          id3: substring(bytes, index + 2, 2)
        };
        index += 6;
        return beacon;

      default:
        return null;
    }
  }

  var headerByte = bytes[index++];
  decoded.uplinkReasonButton = !!(headerByte & 1);
  decoded.uplinkReasonMovement = !!(headerByte & 2);
  decoded.uplinkReasonGpio = !!(headerByte & 4);
  decoded.containsGps = !!(headerByte & 8);
  decoded.containsOnboardSensors = !!(headerByte & 16);
  decoded.containsSpecial = !!(headerByte & 32);
  decoded.crc = bytes[index++];
  decoded.batteryLevel = bytes[index++];

  if (decoded.containsOnboardSensors) {
    var sensorContent = bytes[index++];
    decoded.sensorContent = {
      containsTemperature: !!(sensorContent & 1),
      containsLight: !!(sensorContent & 2),
      containsAccelerometerCurrent: !!(sensorContent & 4),
      containsAccelerometerMax: !!(sensorContent & 8),
      containsWifiPositioningData: !!(sensorContent & 16),
      buttonEventInfo: !!(sensorContent & 32),
      containsExternalSensors: !!(sensorContent & 64),
      containsBluetoothData: false
    };
    var hasSecondSensorContent = !!(sensorContent & 128);

    if (hasSecondSensorContent) {
      var sensorContent2 = bytes[index++];
      decoded.sensorContent.containsBluetoothData = !!(sensorContent2 & 1);
      decoded.sensorContent.containsRelativeHumidity = !!(sensorContent2 & 2);
      decoded.sensorContent.containsAirPressure = !!(sensorContent2 & 4);
      decoded.sensorContent.containsManDown = !!(sensorContent2 & 8);
    }

    if (decoded.sensorContent.containsTemperature) {
      decoded.temperature = toSignedShort(bytes[index++], bytes[index++]) / 100;
    }

    if (decoded.sensorContent.containsLight) {
      var value = (bytes[index++] << 8) + bytes[index++];
      var exponent = value >> 12 & 0xFF;
      decoded.lightIntensity = ((value & 0x0FFF) << exponent) / 100;
    }

    if (decoded.sensorContent.containsAccelerometerCurrent) {
      decoded.accelerometer = {
        x: toSignedShort(bytes[index++], bytes[index++]) / 1000,
        y: toSignedShort(bytes[index++], bytes[index++]) / 1000,
        z: toSignedShort(bytes[index++], bytes[index++]) / 1000
      };
    }

    if (decoded.sensorContent.containsAccelerometerMax) {
      decoded.maxAccelerationNew = toSignedShort(bytes[index++], bytes[index++]) / 1000;
      decoded.maxAccelerationHistory = toSignedShort(bytes[index++], bytes[index++]) / 1000;
    }

    if (decoded.sensorContent.containsWifiPositioningData) {
      var wifiInfo = bytes[index++];
      var numAccessPoints = wifiInfo & 7;

      var wifiStatus = ((wifiInfo & 8) >> 2) + ((wifiInfo & 16) >> 3);
      var containsSignalStrength = wifiInfo & 32;
      var wifiStatusDescription = void 0;

      switch (wifiStatus) {
        case 0:
          wifiStatusDescription = 'success';
          break;

        case 1:
          wifiStatusDescription = 'failed';
          break;

        case 2:
          wifiStatusDescription = 'no_access_points';
          break;

        default:
          wifiStatusDescription = "unknown (" + wifiStatus + ")";
      }

      decoded.wifiInfo = {
        status: wifiStatusDescription,
        statusCode: wifiStatus,
        accessPoints: []
      };

      for (var i = 0; i < numAccessPoints; i++) {
        var macAddress = [bytes[index++].toString(16), bytes[index++].toString(16), bytes[index++].toString(16), bytes[index++].toString(16), bytes[index++].toString(16), bytes[index++].toString(16)];
        var signalStrength = void 0;

        if (containsSignalStrength) {
          signalStrength = toSignedChar(bytes[index++]);
        } else {
          signalStrength = null;
        }

        decoded.wifiInfo.accessPoints.push({
          macAddress: macAddress.join(':'),
          signalStrength: signalStrength
        });
      }
    }

    if (decoded.sensorContent.containsExternalSensors) {
      var type = bytes[index++];

      switch (type) {
        case 0x0A:
          decoded.externalSensor = {
            type: 'battery',
            batteryA: toUnsignedShort(bytes[index++], bytes[index++]),
            batteryB: toUnsignedShort(bytes[index++], bytes[index++])
          };
          break;

        case 0x65:
          decoded.externalSensor = {
            type: 'detectSwitch',
            value: bytes[index++]
          };
          break;
      }
    }

    if (decoded.sensorContent.containsBluetoothData) {
      var bluetoothInfo = bytes[index++];
      var numBeacons = bluetoothInfo & 7;
      var bluetoothStatus = bluetoothInfo >> 3 & 0x03;
      var addSlotInfo = bluetoothInfo >> 5 & 0x03;
      var bluetoothStatusDescription = void 0;

      switch (bluetoothStatus) {
        case 0:
          bluetoothStatusDescription = 'success';
          break;

        case 1:
          bluetoothStatusDescription = 'failed';
          break;

        case 2:
          bluetoothStatusDescription = 'no_access_points';
          break;

        default:
          bluetoothStatusDescription = "unknown (" + bluetoothStatus + ")";
      }

      decoded.bluetoothInfo = {
        status: bluetoothStatusDescription,
        statusCode: bluetoothStatus,
        addSlotInfo: addSlotInfo,
        beacons: []
      };


      for (var _i = 0; _i < numBeacons; _i++) {
        var beacon;
        switch (addSlotInfo) {
          case 0x00:
            beacon = parseBluetoothBeacons00();
            break;

          case 0x01:
            beacon = parseBluetoothBeacons01();
            break;

          case 0x02:
            beacon = parseBluetoothBeacons02();
            break;

          default:
            return {errors: ['Invalid addSlotInfo type']};

        }
        if (beacon === null) {
          return {errors: ['Invalid beacon type']};
        }

        decoded.bluetoothInfo.beacons.push(beacon);
      }
    }

    if (decoded.sensorContent.containsRelativeHumidity) {
      decoded.relativeHumidity = toUnsignedShort(bytes[index++], bytes[index++]) / 100;
    }

    if (decoded.sensorContent.containsAirPressure) {

      decoded.airPressure = (bytes[index++] << 16) + (bytes[index++] << 8) + bytes[index++];
    }
  }

  if (decoded.containsGps) {
    decoded.gps = {};
    decoded.gps.navStat = bytes[index++];
    decoded.gps.latitude = toSignedInteger(bytes[index++], bytes[index++], bytes[index++], bytes[index++]) / 10000000;
    decoded.gps.longitude = toSignedInteger(bytes[index++], bytes[index++], bytes[index++], bytes[index++]) / 10000000;
    decoded.gps.altRef = toUnsignedShort(bytes[index++], bytes[index++]) / 10;
    decoded.gps.hAcc = bytes[index++];
    decoded.gps.vAcc = bytes[index++];
    decoded.gps.sog = toUnsignedShort(bytes[index++], bytes[index++]) / 10;
    decoded.gps.cog = toUnsignedShort(bytes[index++], bytes[index++]) / 10;
    decoded.gps.hdop = bytes[index++] / 10;
    decoded.gps.numSvs = bytes[index++];
  }

  if (decoded.sensorContent.containsManDown) {
    var manDownData = (bytes[index++]);
    var manDownState = (manDownData & 0x0f)
    var manDownStateLabel;
    switch(manDownState) {
      case 0x00:
        manDownStateLabel = 'ok';
        break;
      case 0x01:
        manDownStateLabel = 'sleeping';
        break;
      case 0x02:
        manDownStateLabel = 'preAlarm';
        break;
      case 0x03:
        manDownStateLabel = 'alarm';
        break;
      default:
        manDownStateLabel = manDownState+'';
        break;
    }
    decoded.manDown = {
      state: manDownStateLabel,
      positionAlarm: !!(manDownData & 0x10),
      movementAlarm: !!(manDownData & 0x20)
    }
  }

  return decoded;
};