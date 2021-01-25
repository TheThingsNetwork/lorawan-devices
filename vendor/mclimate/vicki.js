function decodeUplink(bytes) {
  toBool = function (value) { return value == '1'};
 if (bytes[0] == 1) {
      tmp = ("0" + bytes[6].toString(16)).substr(-2);
      motorRange1 = tmp[1];
      motorRange2 = ("0" + bytes[5].toString(16)).substr(-2);
      motorRange = parseInt("0x"+ motorRange1 + motorRange2, 16);

      motorPos2 = ("0" + bytes[4].toString(16)).substr(-2);
      motorPos1 = tmp[0];
      motorPosition = parseInt("0x"+ motorPos1 + motorPos2, 16);

      batteryTmp = ("0" + bytes[7].toString(16)).substr(-2)[0];
      batteryVoltageCalculated = 2 + parseInt("0x"+ batteryTmp , 16) * 0.1;
       decbin = function (number) {
         if (number < 0) {
             number = 0xFFFFFFFF + number + 1;
         }
         return parseInt(number, 10).toString(2);
      };

      byteBin = decbin(bytes[7]);
      openWindow = byteBin.substr(4, 1);
      childLockBin = decbin(bytes[8]);
      childLock = childLockBin.charAt(0);
      highMotorConsumption = byteBin.substr(-2, 1);
      lowMotorConsumption = byteBin.substr(-3, 1);
      brokenSensor = byteBin.substr(-4, 1);

     return {
         reason: bytes[0],
         targetTemperature: bytes[1],
         sensorTemperature: (bytes[2] * 165) / 256 - 40,
         relativeHumidity: bytes[3]/ 256 ,
         motorRange: motorRange,
         motorPosition: motorPosition,
         batteryVoltage: batteryVoltageCalculated,
         openWindow: toBool(openWindow),
         childLock: toBool(childLock),
         highMotorConsumption: toBool(highMotorConsumption),
         lowMotorConsumption: toBool(lowMotorConsumption),
         brokenSensor: toBool(brokenSensor)
     };
 }
}


const decToHex = (integer, shouldAddZero = true) => {
  let number = (+integer).toString(16).toUpperCase()
  if( (number.length % 2) > 0 && shouldAddZero ) { number= "0" + number }
  return number
}
const dec2hexWithZero = (i) => {
  return (i+0x10000).toString(16).substr(-4).toUpperCase();
}
const toHex = (cmdName, cmdId, ...params) => {
  if(cmdName == "SetOpenWindow") return cmdId.toString(16).padStart(2, '0') + params.reduce((paramString, param) => {
      return paramString += param
  }, "")
  else return cmdId.toString(16).padStart(2, '0') + params.reduce((paramString, param) => {
      return paramString += param.padStart(2, '0')
  }, "")
}
const forceClose = () => {
  return toHex('ForceClose', 0x0B);
}
const getAllParams = () => {
  return toHex('GetAllParams',
          '14',
          '16',
          '17',
          '12',
          '13',
          '18',
          '19',
          '15',
          '1B'
      );
}
const getChildLock = () => {
  return toHex('GetChildLock', 0x14);
}

const getInternalAlgoParams = () => {
  return toHex('GetInternalAlgoParams', 0x16);
}

const getInternalAlgoTdiffParams = () => {
  return toHex('GetInternalAlgoTdiffParams', 0x17);
}

const getJoinRetryPeriod = () => {
  return toHex('GetJoinRetryPeriod', 0x19);
}

const getKeepAliveTime = () => {
  return toHex('GetKeepAliveTime', 0x12);
}

const getOpenWindowParams = () => {
  return toHex('GetOpenWindowParams', 0x13);
}

const getOperationalMode = () => {
  return toHex('GetOperationalMode', 0x18);
}

const getTemperatureRange = () => {
  return toHex('GetTemperatureRange', 0x15);
}

const getUplinkType = () => {
  return toHex('GetUplinkType', 0x1B);
}

const recalibrateMotor = () => {
  return toHex('RecalibrateMotor', 0x03);
}

const receivedKeepaliveCommand = () => {
  return toHex('ReceivedKeepalive', 0x55);
}

const sendCustomHexCommand = (command) => {
  return toHex('SendCustomHexCommand', command);
}

const setChildLock = (enabled) => {
  let enabledValue = enabled ? 1 : 0;
  return toHex('SetChildLock', 0x07, decToHex(enabledValue));
}

const setInternalAlgoParams = (period, pFirstLast, pNext) => {
  return toHex('SetInternalAlgoParams', 0x0C, decToHex(period), decToHex(pFirstLast), decToHex(pNext));
}

const setInternalAlgoTdiffParams = (cold, warm) => {
  return toHex('SetInternalAlgoTdiffParams', 0x1A, decToHex(cold), decToHex(warm));
}

const setJoinRetryPeriod = (period) => {
  // period should be passed in minutes
  let periodToPass = (period * 60) / 5;
  return toHex('SetJoinRetryPeriod', 0x10, parseInt(periodToPass).toString(16));
}

const setKeepAlive = (time) => {
  return toHex( 'SetKeepAlive', 0x02, parseInt(time).toString(16));
}

const setOpenWindow = (enabled, delta, closeTime, motorPosition) => {
      let enabledValue = enabled ? 1 : 0;
      let closeTimeValue = parseInt(closeTime) / 5;
      let motorPositionBin = `000000000000${parseInt(motorPosition, 10).toString(2)}`;
      motorPositionBin = motorPositionBin.substr(-12);
      let motorPositionFirstPart = parseInt(motorPositionBin.substr(4), 2, 16);
      let motorPositionSecondPart = parseInt(motorPositionBin.substr(0, 4), 2, 16);
  
return toHex(
      'SetOpenWindow',
      0x06,
      decToHex(enabledValue),
      decToHex(closeTimeValue),
      decToHex(motorPositionFirstPart, false),
      decToHex(motorPositionSecondPart, false),
      decToHex(delta, false)
  );
}

const setOperationalMode = (mode) => {
  return toHex( 'SetOperationalMode', 0x0D, mode);
}

const setTargetTemperature = (targetTemperature) => {
  return toHex( 'SetTargetTemperature', 0x0E, decToHex(targetTemperature));
}

const setTargetTemperatureAndMotorPosition = (motorPosition, targetTemperature) => {
  return toHex('SetTargetTemperatureAndMotorPosition', 0x31, dec2hexWithZero(motorPosition), decToHex(targetTemperature))
}

const setTemperatureRange = (min, max) => {
  return toHex( 'SetTemperatureRange', 0x08, decToHex(min), decToHex(max));
}

const setUplinkType = (type) => {
  return toHex( 'SetUplinkType', 0x11, type);
}