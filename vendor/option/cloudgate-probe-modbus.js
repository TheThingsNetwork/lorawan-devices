// All multi-byte fields in the device protocol are little endian.
// Uplinks always use fPort 1. Downlinks always use fPort 2.
//
// Works for all three CloudGate Probe variants (Modbus / M-bus / P1):
// the M-bus specific uplink/downlink types simply never appear in the
// Modbus or P1 payloads, and vice versa, so one codec safely covers all.

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

function readUint16LE(b, o) {
  return b[o] | (b[o + 1] << 8);
}

function readInt8(b, o) {
  var v = b[o];
  return v > 127 ? v - 256 : v;
}

function readUint24LE(b, o) {
  return b[o] | (b[o + 1] << 8) | (b[o + 2] << 16);
}

function readUint32LE(b, o) {
  return (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;
}

function writeUint16LE(v) {
  return [v & 0xff, (v >> 8) & 0xff];
}

function writeUint24LE(v) {
  return [v & 0xff, (v >> 8) & 0xff, (v >> 16) & 0xff];
}

function writeUint32LE(v) {
  return [v & 0xff, (v >> 8) & 0xff, (v >> 16) & 0xff, (v >> 24) & 0xff];
}

function bytesToAscii(bytes) {
  var s = "";
  for (var i = 0; i < bytes.length; i++) {
    s += String.fromCharCode(bytes[i]);
  }
  return s;
}

function asciiToBytes(str) {
  var out = [];
  for (var i = 0; i < str.length; i++) {
    out.push(str.charCodeAt(i) & 0xff);
  }
  return out;
}

function tlv(type, valueBytes) {
  return [type, valueBytes.length].concat(valueBytes);
}

// ---------------------------------------------------------------------
// Uplink decoder (fPort 1)
// ---------------------------------------------------------------------

function decodeUplink(input) {
  var warnings = [];

  if (input.fPort !== 1) {
    warnings.push("Unexpected fPort " + input.fPort + " (uplinks are expected on fPort 1)");
    return { data: { raw: input.bytes }, warnings: warnings };
  }

  var bytes = input.bytes;
  var measurements = [];
  var i = 0;

  while (i < bytes.length) {
    if (i + 2 > bytes.length) {
      warnings.push("Truncated TLV header at offset " + i);
      break;
    }

    var type = bytes[i];
    var length = bytes[i + 1];
    var start = i + 2;
    var end = start + length;

    if (end > bytes.length) {
      warnings.push("Truncated TLV value at offset " + i + " (type " + type + ")");
      break;
    }

    var value = bytes.slice(start, end);

    switch (type) {
      case 0: // Analog input
        measurements.push({
          type: "analogInput",
          voltage_mV: readUint16LE(value, 0)
        });
        break;

      case 1: // Digital in counter
        measurements.push({
          type: "digitalInCounter",
          counter: readUint32LE(value, 0)
        });
        break;

      case 2: // Modbus value
        measurements.push({
          type: "modbusValue",
          slaveId: value[0],
          registerNumber: readUint24LE(value, 1),
          rawData: Array.from(value.slice(4))
        });
        break;

      case 3: // Power state
        measurements.push({
          type: "powerState",
          powered: value[0] === 1
        });
        break;

      case 5: // M-bus record
        measurements.push({
          type: "mbusRecord",
          reportId: value[0],
          recordNumber: value[1],
          data: Array.from(value.slice(2))
        });
        break;

      case 6: // M-bus scan end
        measurements.push({
          type: "mbusScanEnd",
          baudRate: readUint16LE(value, 0),
          metersFound: value[2]
        });
        break;

      case 7: // M-bus scan meter found
        measurements.push({
          type: "mbusScanMeterFound",
          address: Array.from(value) // 8-byte encoded M-bus address
        });
        break;

      case 8: { // Fragment raw M-bus frame
        var frameByte = value[1];
        var fragByte = value[2];
        measurements.push({
          type: "mbusFragmentRaw",
          counter: value[0],
          lastFrame: (frameByte & 0x80) !== 0,
          frameNumber: frameByte & 0x7f,
          lastFragment: (fragByte & 0x80) !== 0,
          fragmentNumber: fragByte & 0x7f,
          data: Array.from(value.slice(3))
        });
        break;
      }

      case 9: // Ping response
        measurements.push({
          type: "pingResponse",
          pingId: readUint16LE(value, 0)
        });
        break;

      case 10: // Firmware version
        measurements.push({
          type: "firmwareVersion",
          firmwareVersion: value[0] + "." + value[1] + "." + value[2],
          hardwareVersion: value[3],
          serial: bytesToAscii(value.slice(4, 14))
        });
        break;

      case 12: // Digital input logic state
        measurements.push({
          type: "digitalInputLogicState",
          state: value[0] === 1 ? "high" : "low"
        });
        break;

      case 13: // Analog input pin logic state
        measurements.push({
          type: "analogInputLogicState",
          state: value[0] === 1 ? "high" : "low"
        });
        break;

      case 16: // Digital output shadow state
        measurements.push({
          type: "digitalOutputShadowState",
          index: value[0], // 1 = digital output 1, 2 = digital output 2
          state: value[1] === 1 ? "high" : "low"
        });
        break;

      case 19: { // DSMR P1 data
        var obisLen = value[1];
        measurements.push({
          type: "dsmrP1Data",
          id: value[0],
          rawData: Array.from(value.slice(2, 2 + obisLen))
        });
        break;
      }

      default:
        warnings.push("Unknown uplink TLV type " + type + " at offset " + i);
        break;
    }

    i = end;
  }

  var result = { data: { measurements: measurements } };
  if (warnings.length > 0) {
    result.warnings = warnings;
  }
  return result;
}

// ---------------------------------------------------------------------
// Downlink encoder (fPort 2)
// input.data = { command: "<name>", ...params }
// See codec.yaml for worked examples of every command.
// ---------------------------------------------------------------------

function encodeDownlink(input) {
  var data = input.data || {};
  var warnings = [];
  var bytes = [];

  switch (data.command) {
    case "reboot":
      bytes = tlv(1, []);
      break;

    case "collectMeasurements":
      bytes = tlv(2, []);
      break;

    case "blinky":
      bytes = tlv(3, []);
      break;

    case "setDigitalOut1":
      bytes = tlv(4, [data.value ? 1 : 0]);
      break;

    case "writeModbusRegister":
      bytes = tlv(
        5,
        [data.deviceId]
          .concat(writeUint24LE(data.registerNumber))
          .concat([data.numRegisters])
          .concat(data.data || [])
      );
      break;

    case "setBasicConfiguration":
      bytes = tlv(
        7,
        writeUint16LE(data.mainInterval)
          .concat(writeUint16LE(data.debounceTime))
          .concat([
            data.analogInMode,
            data.digitalInMode,
            data.digitalOut1Mode,
            data.digitalOut2Mode,
            data.reportOutputPinsState ? 1 : 0
          ])
      );
      break;

    case "modbusInterfaceConfiguration":
      bytes = tlv(
        8,
        writeUint32LE(data.baudRate)
          .concat(writeUint16LE(data.timeout))
          .concat([data.mode, data.parity, data.stopBits])
      );
      break;

    case "modbusMeasurementConfiguration":
      bytes = tlv(
        9,
        [data.index, data.slaveId]
          .concat(writeUint24LE(data.registerStart))
          .concat([data.numRegisters])
      );
      break;

    case "saveConfiguration":
      bytes = tlv(10, []);
      break;

    case "requestMbusScan":
      bytes = tlv(11, writeUint16LE(data.baudRate));
      break;

    case "requestRawMbusFrames":
      bytes = tlv(12, writeUint16LE(data.baudRate).concat(data.address));
      break;

    case "mbusMeasurementConfiguration": {
      var filterBytes = [];
      (data.filters || []).forEach(function (f) {
        filterBytes = filterBytes.concat(writeUint16LE(f));
      });
      bytes = tlv(
        13,
        [data.index, data.shortReportId, data.reportMode]
          .concat(writeUint16LE(data.baudRate))
          .concat(data.address)
          .concat(filterBytes)
      );
      break;
    }

    case "clearMbusConfigurations":
      bytes = tlv(14, []);
      break;

    case "clearModbusConfigurations":
      bytes = tlv(15, []);
      break;

    case "requestPing":
      bytes = tlv(16, writeUint16LE(data.pingId));
      break;

    case "requestFirmwareVersion":
      bytes = tlv(18, []);
      break;

    case "setModbusHardwareFlags":
      bytes = tlv(20, writeUint16LE(data.flags));
      break;

    case "setDigitalOut2":
      bytes = tlv(21, [data.value ? 1 : 0]);
      break;

    case "configureRebootTimer":
      bytes = tlv(22, [data.runtime].concat(writeUint16LE(data.value)));
      break;

    case "configureObisFilter":
      if (data.operation === "clear") {
        bytes = tlv(25, [2]);
      } else {
        var obisBytes = asciiToBytes(data.obis);
        bytes = tlv(
          25,
          [1, data.id, data.size, data.scale & 0xff, obisBytes.length].concat(obisBytes)
        );
      }
      break;

    case "pulseGpioOutput":
      bytes = tlv(26, [data.gpio, data.duration]);
      break;

    default:
      warnings.push("Unknown downlink command: " + data.command);
      return { bytes: [], fPort: input.fPort || 2, warnings: warnings };
  }

  var result = { bytes: bytes, fPort: input.fPort || 2 };
  if (warnings.length > 0) {
    result.warnings = warnings;
  }
  return result;
}

// ---------------------------------------------------------------------
// Downlink decoder (fPort 2)
// ---------------------------------------------------------------------

function decodeDownlink(input) {
  var bytes = input.bytes;
  var warnings = [];

  if (bytes.length < 2) {
    return { data: {}, warnings: ["Downlink too short"] };
  }

  var type = bytes[0];
  var length = bytes[1];
  var value = bytes.slice(2, 2 + length);
  var data = {};

  switch (type) {
    case 1:
      data = { command: "reboot" };
      break;
    case 2:
      data = { command: "collectMeasurements" };
      break;
    case 3:
      data = { command: "blinky" };
      break;
    case 4:
      data = { command: "setDigitalOut1", value: value[0] };
      break;
    case 5:
      data = {
        command: "writeModbusRegister",
        deviceId: value[0],
        registerNumber: readUint24LE(value, 1),
        numRegisters: value[4],
        data: Array.from(value.slice(5))
      };
      break;
    case 7:
      data = {
        command: "setBasicConfiguration",
        mainInterval: readUint16LE(value, 0),
        debounceTime: readUint16LE(value, 2),
        analogInMode: value[4],
        digitalInMode: value[5],
        digitalOut1Mode: value[6],
        digitalOut2Mode: value[7],
        reportOutputPinsState: value[8] === 1
      };
      break;
    case 8:
      data = {
        command: "modbusInterfaceConfiguration",
        baudRate: readUint32LE(value, 0),
        timeout: readUint16LE(value, 4),
        mode: value[6],
        parity: value[7],
        stopBits: value[8]
      };
      break;
    case 9:
      data = {
        command: "modbusMeasurementConfiguration",
        index: value[0],
        slaveId: value[1],
        registerStart: readUint24LE(value, 2),
        numRegisters: value[5]
      };
      break;
    case 10:
      data = { command: "saveConfiguration" };
      break;
    case 11:
      data = { command: "requestMbusScan", baudRate: readUint16LE(value, 0) };
      break;
    case 12:
      data = {
        command: "requestRawMbusFrames",
        baudRate: readUint16LE(value, 0),
        address: Array.from(value.slice(2, 10))
      };
      break;
    case 13: {
      var filters = [];
      for (var o = 13; o + 1 < value.length; o += 2) {
        filters.push(readUint16LE(value, o));
      }
      data = {
        command: "mbusMeasurementConfiguration",
        index: value[0],
        shortReportId: value[1],
        reportMode: value[2],
        baudRate: readUint16LE(value, 3),
        address: Array.from(value.slice(5, 13)),
        filters: filters
      };
      break;
    }
    case 14:
      data = { command: "clearMbusConfigurations" };
      break;
    case 15:
      data = { command: "clearModbusConfigurations" };
      break;
    case 16:
      data = { command: "requestPing", pingId: readUint16LE(value, 0) };
      break;
    case 18:
      data = { command: "requestFirmwareVersion" };
      break;
    case 20:
      data = { command: "setModbusHardwareFlags", flags: readUint16LE(value, 0) };
      break;
    case 21:
      data = { command: "setDigitalOut2", value: value[0] };
      break;
    case 22:
      data = {
        command: "configureRebootTimer",
        runtime: value[0],
        value: readUint16LE(value, 1)
      };
      break;
    case 25:
      if (value[0] === 2) {
        data = { command: "configureObisFilter", operation: "clear" };
      } else {
        var obisLen = value[4];
        data = {
          command: "configureObisFilter",
          operation: "add",
          id: value[1],
          size: value[2],
          scale: readInt8(value, 3),
          obis: bytesToAscii(value.slice(5, 5 + obisLen))
        };
      }
      break;
    case 26:
      data = { command: "pulseGpioOutput", gpio: value[0], duration: value[1] };
      break;
    default:
      warnings.push("Unknown downlink TLV type " + type);
      break;
  }

  var result = { data: data };
  if (warnings.length > 0) {
    result.warnings = warnings;
  }
  return result;
}
