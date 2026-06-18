function getData(bytes) {
    var switchValue = (bytes[0] << 8) | bytes[1];
    var batteryValue = (bytes[2] << 8) | bytes[3];
    var uplinkInterval = bytes.length > 4 ? (bytes[4] << 8) | bytes[5] : 0;
  
    var payload = {
      switchValue: switchValue,
      batteryValue: batteryValue
    };
  
    if (uplinkInterval > 0) {
      payload.uplinkInterval = uplinkInterval;
    }
  
    return payload;
  }
  
  function decodeUplink(input) {
    switch (input.fPort) {
      case 1:
        return {
          data: getData(input.bytes)
        };
      default:
        return {
          errors: ['unknown FPort'],
        };
    }
  }
  
  function downlinkAction(data) {
    if (data.switchValue === undefined && data.stepValue === undefined) {
      return {
        errors: ['Invalid data for downlink action'],
      }
    }
  
    return {
      bytes: [parseInt(data.switchValue || data.stepValue, 10)],
      fPort: 1
    };
  }
  
  function downlinkStepTiming(data) {
    if (data.stepTiming === undefined) {
      return {
        errors: ['Invalid data for downlink step timing'],
      }
    }
  
    return {
      bytes: [data.stepTiming],
      fPort: 4
    }
  }
  
  var downlinkByPort = {
    1: downlinkAction,
    4: downlinkStepTiming
  }
  
  function decodeDownlink(input) {
    return {
      data: {
        bytes: input.bytes,
        fPort: input.fPort
      }
    };
  }