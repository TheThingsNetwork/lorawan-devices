/**
 * Entry, decoder.js
 */
function decodeUplink(input, port) {
  // data split

  var bytes = input['bytes']
  // init
  bytes = bytes2HexString(bytes)
    .toLocaleUpperCase()

  let result = {
    'err': 0, 'payload': bytes, 'valid': true, messages: []
  }
  let splitArray = dataSplit(bytes)
  // data decoder
  let decoderArray = []
  for (let i = 0; i < splitArray.length; i++) {
    let item = splitArray[i]
    let dataId = item.dataId
    let dataValue = item.dataValue
    let messages = dataIdAndDataValueJudge(dataId, dataValue)
    decoderArray.push(messages)
  }
  result.messages = decoderArray
  return { data: result }
}

/**
 * data splits
 * @param bytes
 * @returns {*[]}
 */
function dataSplit(bytes) {
  let frameArray = []

  for (let i = 0; i < bytes.length; i++) {
    let remainingValue = bytes
    let dataId = remainingValue.substring(0, 2)
    let dataValue
    let dataObj = {}
    switch (dataId) {
      case '01':
      case '20':
      case '21':
      case '30':
      case '31':
      case '33':
      case '40':
      case '41':
      case '42':
      case '43':
      case '44':
      case '45':
        dataValue = remainingValue.substring(2, 22)
        bytes = remainingValue.substring(22)
        dataObj = {
          'dataId': dataId, 'dataValue': dataValue
        }
        break
      case '02':
        dataValue = remainingValue.substring(2, 18)
        bytes = remainingValue.substring(18)
        dataObj = {
          'dataId': '02', 'dataValue': dataValue
        }
        break
      case '03':
      case '06':
        dataValue = remainingValue.substring(2, 4)
        bytes = remainingValue.substring(4)
        dataObj = {
          'dataId': dataId, 'dataValue': dataValue
        }
        break
      case '05':
      case '34':
        dataValue = bytes.substring(2, 10)
        bytes = remainingValue.substring(10)
        dataObj = {
          'dataId': dataId, 'dataValue': dataValue
        }
        break
      case '04':
      case '10':
      case '32':
      case '35':
      case '36':
      case '37':
      case '38':
      case '39':
        dataValue = bytes.substring(2, 20)
        bytes = remainingValue.substring(20)
        dataObj = {
          'dataId': dataId, 'dataValue': dataValue
        }
        break
      default:
        dataValue = '9'
        break
    }
    if (dataValue.length < 2) {
      break
    }
    frameArray.push(dataObj)
  }
  return frameArray
}

function dataIdAndDataValueJudge(dataId, dataValue) {
  let messages = []
  switch (dataId) {
    case '01':
      let temperature = dataValue.substring(0, 4)
      let humidity = dataValue.substring(4, 6)
      let illumination = dataValue.substring(6, 14)
      let uv = dataValue.substring(14, 16)
      let windSpeed = dataValue.substring(16, 20)
      messages = [{
        measurementValue: loraWANV2DataFormat(temperature, 10), measurementId: '4097', type: 'Air Temperature'
      }, {
        measurementValue: loraWANV2DataFormat(humidity), measurementId: '4098', type: 'Air Humidity'
      }, {
        measurementValue: loraWANV2DataFormat(illumination), measurementId: '4099', type: 'Light Intensity'
      }, {
        measurementValue: loraWANV2DataFormat(uv, 10), measurementId: '4190', type: 'UV Index'
      }, {
        measurementValue: loraWANV2DataFormat(windSpeed, 10), measurementId: '4105', type: 'Wind Speed'
      }]
      break
    case '02':
      let windDirection = dataValue.substring(0, 4)
      let rainfall = dataValue.substring(4, 12)
      let airPressure = dataValue.substring(12, 16)
      messages = [{
        measurementValue: loraWANV2DataFormat(windDirection), measurementId: '4104', type: 'Wind Direction Sensor'
      }, {
        measurementValue: loraWANV2DataFormat(rainfall, 1000), measurementId: '4113', type: 'Rain Gauge'
      }, {

        measurementValue: loraWANV2DataFormat(airPressure, 0.1), measurementId: '4101', type: 'Barometric Pressure'
      }]
      break
    case '03':
      let Electricity = dataValue
      messages = [{
        'Battery(%)': loraWANV2DataFormat(Electricity)
      }]
      break
    case '04':
      let electricityWhether = dataValue.substring(0, 2)
      let hwv = dataValue.substring(2, 6)
      let bdv = dataValue.substring(6, 10)
      let sensorAcquisitionInterval = dataValue.substring(10, 14)
      let gpsAcquisitionInterval = dataValue.substring(14, 18)
      messages = [{
        'Battery(%)': loraWANV2DataFormat(electricityWhether),
        'Hardware Version': `${loraWANV2DataFormat(hwv.substring(0, 2))}.${loraWANV2DataFormat(hwv.substring(2, 4))}`,
        'Firmware Version': `${loraWANV2DataFormat(bdv.substring(0, 2))}.${loraWANV2DataFormat(bdv.substring(2, 4))}`,
        'measureInterval': parseInt(loraWANV2DataFormat(sensorAcquisitionInterval)) * 60,
        'gpsInterval': parseInt(loraWANV2DataFormat(gpsAcquisitionInterval)) * 60
      }]
      break
    case '05':
      let sensorAcquisitionIntervalFive = dataValue.substring(0, 4)
      let gpsAcquisitionIntervalFive = dataValue.substring(4, 8)
      messages = [{
        'measureInterval': parseInt(loraWANV2DataFormat(sensorAcquisitionIntervalFive)) * 60,
        'gpsInterval': parseInt(loraWANV2DataFormat(gpsAcquisitionIntervalFive)) * 60
      }]
      break
    case '06':
      let errorCode = dataValue
      let descZh
      switch (errorCode) {
        case '00':
          descZh = 'CCL_SENSOR_ERROR_NONE'
          break
        case '01':
          descZh = 'CCL_SENSOR_NOT_FOUND'
          break
        case '02':
          descZh = 'CCL_SENSOR_WAKEUP_ERROR'
          break
        case '03':
          descZh = 'CCL_SENSOR_NOT_RESPONSE'
          break
        case '04':
          descZh = 'CCL_SENSOR_DATA_EMPTY'
          break
        case '05':
          descZh = 'CCL_SENSOR_DATA_HEAD_ERROR'
          break
        case '06':
          descZh = 'CCL_SENSOR_DATA_CRC_ERROR'
          break
        case '07':
          descZh = 'CCL_SENSOR_DATA_B1_NO_VALID'
          break
        case '08':
          descZh = 'CCL_SENSOR_DATA_B2_NO_VALID'
          break
        case '09':
          descZh = 'CCL_SENSOR_RANDOM_NOT_MATCH'
          break
        case '0A':
          descZh = 'CCL_SENSOR_PUBKEY_SIGN_VERIFY_FAILED'
          break
        case '0B':
          descZh = 'CCL_SENSOR_DATA_SIGN_VERIFY_FAILED'
          break
        case '0C':
          descZh = 'CCL_SENSOR_DATA_VALUE_HI'
          break
        case '0D':
          descZh = 'CCL_SENSOR_DATA_VALUE_LOW'
          break
        case '0E':
          descZh = 'CCL_SENSOR_DATA_VALUE_MISSED'
          break
        case '0F':
          descZh = 'CCL_SENSOR_ARG_INVAILD'
          break
        case '10':
          descZh = 'CCL_SENSOR_RS485_MASTER_BUSY'
          break
        case '11':
          descZh = 'CCL_SENSOR_RS485_REV_DATA_ERROR'
          break
        case '12':
          descZh = 'CCL_SENSOR_RS485_REG_MISSED'
          break
        case '13':
          descZh = 'CCL_SENSOR_RS485_FUN_EXE_ERROR'
          break
        case '14':
          descZh = 'CCL_SENSOR_RS485_WRITE_STRATEGY_ERROR'
          break
        case '15':
          descZh = 'CCL_SENSOR_CONFIG_ERROR'
          break
        case 'FF':
          descZh = 'CCL_SENSOR_DATA_ERROR_UNKONW'
          break
        default:
          descZh = 'CC_OTHER_FAILED'
          break
      }
      messages = [{
        measurementId: '4101', type: 'sensor_error_event', errCode: errorCode, descZh
      }]
      break
    case '10':
      let statusValue = dataValue.substring(0, 2)
      let { status, type } = loraWANV2BitDataFormat(statusValue)
      let sensecapId = dataValue.substring(2)
      messages = [{
        status: status, channelType: type, sensorEui: sensecapId
      }]
      break
    case '20':
      let initmeasurementId = 4175
      let sensor = []
      for (let i = 0; i < dataValue.length; i += 4) {
        let modelId = loraWANV2DataFormat(dataValue.substring(i, i + 2))
        let detectionType = loraWANV2DataFormat(dataValue.substring(i + 2, i + 4))
        let aiHeadValues = `${modelId}.${detectionType}`
        sensor.push({
          measurementValue: aiHeadValues, measurementId: initmeasurementId
        })
        initmeasurementId++
      }
      messages = sensor
      break
    case '21':
      // Vision AI:
      // AI 识别输出帧
      let tailValueArray = []
      let initTailmeasurementId = 4180
      for (let i = 0; i < dataValue.length; i += 4) {
        let modelId = loraWANV2DataFormat(dataValue.substring(i, i + 2))
        let detectionType = loraWANV2DataFormat(dataValue.substring(i + 2, i + 4))
        let aiTailValues = `${modelId}.${detectionType}`
        tailValueArray.push({
          measurementValue: aiTailValues, measurementId: initTailmeasurementId, type: `AI Detection ${i}`
        })
        initTailmeasurementId++
      }
      messages = tailValueArray
      break
    case '30':
    case '31':
      // 首帧或者首帧输出帧
      let channelInfoOne = loraWANV2ChannelBitFormat(dataValue.substring(0, 2))
      let dataOne = {
        measurementValue: loraWANV2DataFormat(dataValue.substring(4, 12), 1000),
        measurementId: parseInt(channelInfoOne.one),
        type: 'Measurement'
      }
      let dataTwo = {
        measurementValue: loraWANV2DataFormat(dataValue.substring(12, 20), 1000),
        measurementId: parseInt(channelInfoOne.two),
        type: 'Measurement'
      }
      let cacheArrayInfo = []
      if (parseInt(channelInfoOne.one)) {
        cacheArrayInfo.push(dataOne)
      }
      if (parseInt(channelInfoOne.two)) {
        cacheArrayInfo.push(dataTwo)
      }
      cacheArrayInfo.forEach(item => {
        messages.push(item)
      })
      break
    case '32':
      let channelInfoTwo = loraWANV2ChannelBitFormat(dataValue.substring(0, 2))
      let dataThree = {
        measurementValue: loraWANV2DataFormat(dataValue.substring(2, 10), 1000),
        measurementId: parseInt(channelInfoTwo.one),
        type: 'Measurement'
      }
      let dataFour = {
        measurementValue: loraWANV2DataFormat(dataValue.substring(10, 18), 1000),
        measurementId: parseInt(channelInfoTwo.two),
        type: 'Measurement'
      }
      if (parseInt(channelInfoTwo.one)) {
        messages.push(dataThree)
      }
      if (parseInt(channelInfoTwo.two)) {
        messages.push(dataFour)
      }
      break
    case '33':
      let channelInfoThree = loraWANV2ChannelBitFormat(dataValue.substring(0, 2))
      let dataFive = {
        measurementValue: loraWANV2DataFormat(dataValue.substring(4, 12), 1000),
        measurementId: parseInt(channelInfoThree.one),
        type: 'Measurement'
      }
      let dataSix = {
        measurementValue: loraWANV2DataFormat(dataValue.substring(12, 20), 1000),
        measurementId: parseInt(channelInfoThree.two),
        type: 'Measurement'
      }
      if (parseInt(channelInfoThree.one)) {
        messages.push(dataFive)
      }
      if (parseInt(channelInfoThree.two)) {
        messages.push(dataSix)
      }

      break
    case '34':
      let model = loraWANV2DataFormat(dataValue.substring(0, 2))
      let GPIOInput = loraWANV2DataFormat(dataValue.substring(2, 4))
      let simulationModel = loraWANV2DataFormat(dataValue.substring(4, 6))
      let simulationInterface = loraWANV2DataFormat(dataValue.substring(6, 8))
      messages = [{
        'dataloggerProtocol': model,
        'dataloggerGPIOInput': GPIOInput,
        'dataloggerAnalogType': simulationModel,
        'dataloggerAnalogInterface': simulationInterface
      }]
      break
    case '35':
    case '36':
      let channelTDOne = loraWANV2ChannelBitFormat(dataValue.substring(0, 2))
      let channelSortTDOne = 3920 + (parseInt(channelTDOne.one) - 1) * 2
      let channelSortTDTWO = 3921 + (parseInt(channelTDOne.one) - 1) * 2
      messages = [{
        [channelSortTDOne]: loraWANV2DataFormat(dataValue.substring(2, 10), 1000),
        [channelSortTDTWO]: loraWANV2DataFormat(dataValue.substring(10, 18), 1000)
      }]
      break
    case '37':
      let channelTDInfoTwo = loraWANV2ChannelBitFormat(dataValue.substring(0, 2))
      let channelSortOne = 3920 + (parseInt(channelTDInfoTwo.one) - 1) * 2
      let channelSortTWO = 3921 + (parseInt(channelTDInfoTwo.one) - 1) * 2
      messages = [{
        [channelSortOne]: loraWANV2DataFormat(dataValue.substring(2, 10), 1000),
        [channelSortTWO]: loraWANV2DataFormat(dataValue.substring(10, 18), 1000)
      }]
      break
    case '38':
      let channelTDInfoThree = loraWANV2ChannelBitFormat(dataValue.substring(0, 2))
      let channelSortThreeOne = 3920 + (parseInt(channelTDInfoThree.one) - 1) * 2
      let channelSortThreeTWO = 3921 + (parseInt(channelTDInfoThree.one) - 1) * 2
      messages = [{
        [channelSortThreeOne]: loraWANV2DataFormat(dataValue.substring(2, 10), 1000),
        [channelSortThreeTWO]: loraWANV2DataFormat(dataValue.substring(10, 18), 1000)
      }]
      break
    case '39':
      let electricityWhetherTD = dataValue.substring(0, 2)
      let hwvTD = dataValue.substring(2, 6)
      let bdvTD = dataValue.substring(6, 10)
      let sensorAcquisitionIntervalTD = dataValue.substring(10, 14)
      let gpsAcquisitionIntervalTD = dataValue.substring(14, 18)
      messages = [{
        'Battery(%)': loraWANV2DataFormat(electricityWhetherTD),
        'Hardware Version': `${loraWANV2DataFormat(hwvTD.substring(0, 2))}.${loraWANV2DataFormat(hwvTD.substring(2, 4))}`,
        'Firmware Version': `${loraWANV2DataFormat(bdvTD.substring(0, 2))}.${loraWANV2DataFormat(bdvTD.substring(2, 4))}`,
        'measureInterval': parseInt(loraWANV2DataFormat(sensorAcquisitionIntervalTD)) * 60,
        'thresholdMeasureInterval': parseInt(loraWANV2DataFormat(gpsAcquisitionIntervalTD))
      }]
      break
    case '40':
    case '41':
      let lightIntensity = dataValue.substring(0, 4)
      let loudness = dataValue.substring(4, 8)
      // X
      let accelerateX = dataValue.substring(8, 12)
      // Y
      let accelerateY = dataValue.substring(12, 16)
      // Z
      let accelerateZ = dataValue.substring(16, 20)
      messages = [{
        measurementValue: loraWANV2DataFormat(lightIntensity), measurementId: '4193', type: 'Light Intensity'
      }, {
        measurementValue: loraWANV2DataFormat(loudness), measurementId: '4192', type: 'Sound Intensity'
      }, {

        measurementValue: loraWANV2DataFormat(accelerateX, 100), measurementId: '4150', type: 'AccelerometerX'
      }, {

        measurementValue: loraWANV2DataFormat(accelerateY, 100), measurementId: '4151', type: 'AccelerometerY'
      }, {

        measurementValue: loraWANV2DataFormat(accelerateZ, 100), measurementId: '4152', type: 'AccelerometerZ'
      }]
      break
    case '42':
      let airTemperature = dataValue.substring(0, 4)
      let AirHumidity = dataValue.substring(4, 8)
      let tVOC = dataValue.substring(8, 12)
      let CO2eq = dataValue.substring(12, 16)
      let soilMoisture = dataValue.substring(16, 20)
      messages = [{
        measurementValue: loraWANV2DataFormat(airTemperature, 100), measurementId: '4097', type: 'Air Temperature'
      }, {
        measurementValue: loraWANV2DataFormat(AirHumidity, 100), measurementId: '4098', type: 'Air Humidity'
      }, {
        measurementValue: loraWANV2DataFormat(tVOC), measurementId: '4195', type: 'Total Volatile Organic Compounds'
      }, {
        measurementValue: loraWANV2DataFormat(CO2eq), measurementId: '4100', type: 'CO2'
      }, {
        measurementValue: loraWANV2DataFormat(soilMoisture), measurementId: '4196', type: 'Soil moisture intensity'
      }]
      break
    case '43':
    case '44':
      let headerDevKitValueArray = []
      let initDevkitmeasurementId = 4175
      for (let i = 0; i < dataValue.length; i += 4) {
        let modelId = loraWANV2DataFormat(dataValue.substring(i, i + 2))
        let detectionType = loraWANV2DataFormat(dataValue.substring(i + 2, i + 4))
        let aiHeadValues = `${modelId}.${detectionType}`
        headerDevKitValueArray.push({
          measurementValue: aiHeadValues, measurementId: initDevkitmeasurementId, type: `AI Detection ${i}`
        })
        initDevkitmeasurementId++
      }
      messages = headerDevKitValueArray
      break
    case '45':
      let initTailDevKitmeasurementId = 4180
      for (let i = 0; i < dataValue.length; i += 4) {
        let modelId = loraWANV2DataFormat(dataValue.substring(i, i + 2))
        let detectionType = loraWANV2DataFormat(dataValue.substring(i + 2, i + 4))
        let aiTailValues = `${modelId}.${detectionType}`
        messages.push({
          measurementValue: aiTailValues, measurementId: initTailDevKitmeasurementId, type: `AI Detection ${i}`
        })
        initTailDevKitmeasurementId++
      }
      break
    default:
      break
  }
  return messages
}

/**
 *
 * data formatting
 * @param str
 * @param divisor
 * @returns {string|number}
 */
function loraWANV2DataFormat(str, divisor = 1) {
  let strReverse = bigEndianTransform(str)
  let str2 = toBinary(strReverse)
  if (str2.substring(0, 1) === '1') {
    let arr = str2.split('')
    let reverseArr = arr.map((item) => {
      if (parseInt(item) === 1) {
        return 0
      } else {
        return 1
      }
    })
    str2 = parseInt(reverseArr.join(''), 2) + 1
    return '-' + str2 / divisor
  }
  return parseInt(str2, 2) / divisor
}

/**
 * Handling big-endian data formats
 * @param data
 * @returns {*[]}
 */
function bigEndianTransform(data) {
  let dataArray = []
  for (let i = 0; i < data.length; i += 2) {
    dataArray.push(data.substring(i, i + 2))
  }
  // array of hex
  return dataArray
}

/**
 * Convert to an 8-digit binary number with 0s in front of the number
 * @param arr
 * @returns {string}
 */
function toBinary(arr) {
  let binaryData = arr.map((item) => {
    let data = parseInt(item, 16)
      .toString(2)
    let dataLength = data.length
    if (data.length !== 8) {
      for (let i = 0; i < 8 - dataLength; i++) {
        data = `0` + data
      }
    }
    return data
  })
  let ret = binaryData.toString()
    .replace(/,/g, '')
  return ret
}

/**
 * sensor
 * @param str
 * @returns {{channel: number, type: number, status: number}}
 */
function loraWANV2BitDataFormat(str) {
  let strReverse = bigEndianTransform(str)
  let str2 = toBinary(strReverse)
  let channel = parseInt(str2.substring(0, 4), 2)
  let status = parseInt(str2.substring(4, 5), 2)
  let type = parseInt(str2.substring(5), 2)
  return { channel, status, type }
}

/**
 * channel info
 * @param str
 * @returns {{channelTwo: number, channelOne: number}}
 */
function loraWANV2ChannelBitFormat(str) {
  let strReverse = bigEndianTransform(str)
  let str2 = toBinary(strReverse)
  let one = parseInt(str2.substring(0, 4), 2)
  let two = parseInt(str2.substring(4, 8), 2)
  let resultInfo = {
    one: one, two: two
  }
  return resultInfo
}

/**
 * data log status bit
 * @param str
 * @returns {{total: number, level: number, isTH: number}}
 */
function loraWANV2DataLogBitFormat(str) {
  let strReverse = bigEndianTransform(str)
  let str2 = toBinary(strReverse)
  let isTH = parseInt(str2.substring(0, 1), 2)
  let total = parseInt(str2.substring(1, 5), 2)
  let left = parseInt(str2.substring(5), 2)
  let resultInfo = {
    isTH: isTH, total: total, left: left
  }
  return resultInfo
}

function bytes2HexString(arrBytes) {
  var str = ''
  for (var i = 0; i < arrBytes.length; i++) {
    var tmp
    var num = arrBytes[i]
    if (num < 0) {
      tmp = (255 + num + 1).toString(16)
    } else {
      tmp = num.toString(16)
    }
    if (tmp.length === 1) {
      tmp = '0' + tmp
    }
    str += tmp
  }
  return str
}