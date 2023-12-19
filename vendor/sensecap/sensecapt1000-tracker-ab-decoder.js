function decodeUplink (input) {
    var bytes = input['bytes']
    var bytesString = bytes2HexString(bytes).toLocaleUpperCase()
    var decoded = {
        valid: true,
        err: 0,
        payload: bytesString,
        messages: []
    }
    let measurement = messageAnalyzed(bytesString)
    decoded.messages = measurement
    return { data: decoded }
}

function messageAnalyzed (messageValue) {
    try {
        let frames = unpack(messageValue)
        let measurementResultArray = []
        for (let i = 0; i < frames.length; i++) {
            let item = frames[i]
            let dataId = item.dataId
            let dataValue = item.dataValue
            let measurementArray = deserialize(dataId, dataValue)
            measurementResultArray.push(measurementArray)
        }
        return measurementResultArray
    } catch (e) {
        return e.toString()
    }
}

function unpack (messageValue) {
    let frameArray = []

    for (let i = 0; i < messageValue.length; i++) {
        let remainMessage = messageValue
        let dataId = remainMessage.substring(0, 2).toUpperCase()
        let dataValue
        let dataObj = {}
        let packageLen
        switch (dataId) {
            case '01':
                packageLen = 94
                if (remainMessage.length < packageLen) {
                    return frameArray
                }
                dataValue = remainMessage.substring(2, packageLen)
                messageValue = remainMessage.substring(packageLen)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '02':
                packageLen = 32
                if (remainMessage.length < packageLen) {
                    return frameArray
                }
                dataValue = remainMessage.substring(2, packageLen)
                messageValue = remainMessage.substring(packageLen)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '03':
                packageLen = 64
                if (remainMessage.length < packageLen) {
                    return frameArray
                }
                break
            case '04':
                packageLen = 20
                if (remainMessage.length < packageLen) {
                    return frameArray
                }
                dataValue = remainMessage.substring(2, packageLen)
                messageValue = remainMessage.substring(packageLen)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '05':
                packageLen = 10
                if (remainMessage.length < packageLen) {
                    return frameArray
                }
                dataValue = remainMessage.substring(2, packageLen)
                messageValue = remainMessage.substring(packageLen)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '06':
                packageLen = 44
                if (remainMessage.length < packageLen) {
                    return frameArray
                }
                dataValue = remainMessage.substring(2, packageLen)
                messageValue = remainMessage.substring(packageLen)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '07':
                packageLen = 84
                if (remainMessage.length < packageLen) {
                    return frameArray
                }
                dataValue = remainMessage.substring(2, packageLen)
                messageValue = remainMessage.substring(packageLen)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '08':
                packageLen = 70
                if (remainMessage.length < packageLen) {
                    return frameArray
                }
                dataValue = remainMessage.substring(2, packageLen)
                messageValue = remainMessage.substring(packageLen)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '09':
                packageLen = 36
                if (remainMessage.length < packageLen) {
                    return frameArray
                }
                dataValue = remainMessage.substring(2, packageLen)
                messageValue = remainMessage.substring(packageLen)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '0A':
                packageLen = 76
                if (remainMessage.length < packageLen) {
                    return frameArray
                }
                dataValue = remainMessage.substring(2, packageLen)
                messageValue = remainMessage.substring(packageLen)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '0B':
                packageLen = 62
                if (remainMessage.length < packageLen) {
                    return frameArray
                }
                dataValue = remainMessage.substring(2, packageLen)
                messageValue = remainMessage.substring(packageLen)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '0C':
                packageLen = 2
                if (remainMessage.length < packageLen) {
                    return frameArray
                }
                break
            case '0D':
                packageLen = 10
                if (remainMessage.length < packageLen) {
                    return frameArray
                }
                dataValue = remainMessage.substring(2, packageLen)
                messageValue = remainMessage.substring(packageLen)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            default:
                return frameArray
        }
        if (dataValue.length < 2) {
            break
        }
        frameArray.push(dataObj)
    }
    return frameArray
}

function deserialize (dataId, dataValue) {
    let measurementArray = []
    let eventList = []
    let collectTime = 0
    switch (dataId) {
        case '01':
            measurementArray = getUpShortInfo(dataValue)
            break
        case '02':
            measurementArray = getUpShortInfo(dataValue)
            break
        case '03':
            break
        case '04':
            measurementArray = [
                {measurementId: '3940', type: 'Work Mode', measurementValue: getWorkingMode(dataValue.substring(0, 2))},
                {measurementId: '3942', type: 'Heartbeat Interval', measurementValue: getOneWeekInterval(dataValue.substring(4, 8))},
                {measurementId: '3943', type: 'Periodic Interval', measurementValue: getOneWeekInterval(dataValue.substring(8, 12))},
                {measurementId: '3944', type: 'Event Interval', measurementValue: getOneWeekInterval(dataValue.substring(12, 16))},
                {measurementId: '3941', type: 'SOS Mode', measurementValue: getSOSMode(dataValue.substring(16, 18))}
            ]
            break;
        case '05':
            measurementArray = [
                {measurementId: '3000', type: 'Battery', measurementValue: getBattery(dataValue.substring(0, 2))},
                {measurementId: '3940', type: 'Work Mode', measurementValue: getWorkingMode(dataValue.substring(2, 4))},
                {measurementId: '3941', type: 'SOS Mode', measurementValue: getSOSMode(dataValue.substring(6, 8))}
            ]
            break
        case '06':
            eventList = this.getEventStatus(dataValue.substring(0, 6))
            collectTime = this.getUTCTimestamp(dataValue.substring(8, 16))
            measurementArray = [
                {measurementId: '4200', type: 'SOS Event', measurementValue: eventList[6]},
                {measurementId: '4197', type: 'Longitude', measurementValue: getSensorValue(dataValue.substring(16, 24), 1000000)},
                {measurementId: '4198', type: 'Latitude', measurementValue: getSensorValue(dataValue.substring(24, 32), 1000000)},
                {measurementId: '4097', type: 'Air Temperature', measurementValue: getSensorValue(dataValue.substring(32, 36), 10)},
                {measurementId: '4199', type: 'Light', measurementValue: getSensorValue(dataValue.substring(36, 40))},
                {measurementId: '3000', type: 'Battery', measurementValue: getBattery(dataValue.substring(40, 42))},
                {type: 'Timestamp', measurementValue: collectTime}
            ]
            break
        case '07':
            eventList = this.getEventStatus(dataValue.substring(0, 6))
            collectTime = this.getUTCTimestamp(dataValue.substring(8, 16))
            measurementArray = [
                {measurementId: '4200', type: 'SOS Event', measurementValue: eventList[6]},
                {measurementId: '5001', type: 'Wi-Fi Scan', measurementValue: getMacAndRssiObj(dataValue.substring(16, 72))},
                {measurementId: '4097', type: 'Air Temperature', measurementValue: getSensorValue(dataValue.substring(72, 76), 10)},
                {measurementId: '4199', type: 'Light', measurementValue: getSensorValue(dataValue.substring(76, 80))},
                {measurementId: '3000', type: 'Battery', measurementValue: getBattery(dataValue.substring(80, 82))},
                {type: 'Timestamp', measurementValue: collectTime}
            ]
            break
        case '08':
            eventList = this.getEventStatus(dataValue.substring(0, 6))
            collectTime = this.getUTCTimestamp(dataValue.substring(8, 16))
            measurementArray = [
                {measurementId: '4200', type: 'SOS Event', measurementValue: eventList[6]},
                {measurementId: '5002', type: 'BLE Scan', measurementValue: getMacAndRssiObj(dataValue.substring(16, 58))},
                {measurementId: '4097', type: 'Air Temperature', measurementValue: getSensorValue(dataValue.substring(58, 62), 10)},
                {measurementId: '4199', type: 'Light', measurementValue: getSensorValue(dataValue.substring(62, 66))},
                {measurementId: '3000', type: 'Battery', measurementValue: getBattery(dataValue.substring(66, 68))},
                {type: 'Timestamp', measurementValue: collectTime}
            ]
            break
        case '09':
            eventList = this.getEventStatus(dataValue.substring(0, 6))
            collectTime = this.getUTCTimestamp(dataValue.substring(8, 16))
            measurementArray = [
                {measurementId: '4200', type: 'SOS Event', measurementValue: eventList[6]},
                {measurementId: '4197', type: 'Longitude', measurementValue: getSensorValue(dataValue.substring(16, 24), 1000000)},
                {measurementId: '4198', type: 'Latitude', measurementValue: getSensorValue(dataValue.substring(24, 32), 1000000)},
                {measurementId: '3000', type: 'Battery', measurementValue: getBattery(dataValue.substring(32, 34))},
                {type: 'Timestamp', measurementValue: collectTime}
            ]
            break
        case '0A':
            eventList = this.getEventStatus(dataValue.substring(0, 6))
            collectTime = this.getUTCTimestamp(dataValue.substring(8, 16))
            measurementArray = [
                {measurementId: '4200', type: 'SOS Event', measurementValue: eventList[6]},
                {measurementId: '5001', type: 'Wi-Fi Scan', measurementValue: getMacAndRssiObj(dataValue.substring(16, 72))},
                {measurementId: '3000', type: 'Battery', measurementValue: getBattery(dataValue.substring(72, 74))},
                {type: 'Timestamp', measurementValue: collectTime}
            ]
            break
        case '0B':
            eventList = this.getEventStatus(dataValue.substring(0, 6))
            collectTime = this.getUTCTimestamp(dataValue.substring(8, 16))
            measurementArray = [
                {measurementId: '4200', type: 'SOS Event', measurementValue: eventList[6]},
                {measurementId: '5002', type: 'BLE Scan', measurementValue: getMacAndRssiObj(dataValue.substring(16, 58))},
                {measurementId: '3000', type: 'Battery', measurementValue: getBattery(dataValue.substring(58, 60))},
                {type: 'Timestamp', measurementValue: collectTime}
            ]
            break
        case '0D':
            let errorCode = this.getInt(dataValue)
            let error = ''
            switch (errorCode) {
                case 0:
                    error = 'THE GNSS SCAN TIME OUT'
                    break
                case 1:
                    error = 'THE WI-FI SCAN TIME OUT'
                    break
                case 2:
                    error = 'THE WI-FI+GNSS SCAN TIME OUT'
                    break
                case 3:
                    error = 'THE GNSS+WI-FI SCAN TIME OUT'
                    break
                case 4:
                    error = 'THE BEACON SCAN TIME OUT'
                    break
                case 5:
                    error = 'THE BEACON+WI-FI SCAN TIME OUT'
                    break
                case 6:
                    error = 'THE BEACON+GNSS SCAN TIME OUT'
                    break
                case 7:
                    error = 'THE BEACON+WI-FI+GNSS SCAN TIME OUT'
                    break
                case 8:
                    error = 'FAILED TO OBTAIN THE UTC TIMESTAMP'
                    break
            }
            measurementArray.push({errorCode, error})
    }
    return measurementArray
}

function getUpShortInfo (messageValue) {
    return [
        {
            measurementId: '3000', type: 'Battery', measurementValue: getBattery(messageValue.substring(0, 2))
        }, {
            measurementId: '3502', type: 'Firmware Version', measurementValue: getSoftVersion(messageValue.substring(2, 6))
        }, {
            measurementId: '3001', type: 'Hardware Version', measurementValue: getHardVersion(messageValue.substring(6, 10))
        }, {
            measurementId: '3940', type: 'Work Mode', measurementValue: getWorkingMode(messageValue.substring(10, 12))
        }, {
            measurementId: '3942', type: 'Heartbeat Interval', measurementValue: getOneWeekInterval(messageValue.substring(14, 18))
        }, {
            measurementId: '3943', type: 'Periodic Interval', measurementValue: getOneWeekInterval(messageValue.substring(18, 22))
        }, {
            measurementId: '3944', type: 'Event Interval', measurementValue: getOneWeekInterval(messageValue.substring(22, 26))
        }, {
            measurementId: '3941', type: 'SOS Mode', measurementValue: getSOSMode(messageValue.substring(28, 30))
        }
    ]
}
function getBattery (batteryStr) {
    return loraWANV2DataFormat(batteryStr)
}
function getSoftVersion (softVersion) {
    return `${loraWANV2DataFormat(softVersion.substring(0, 2))}.${loraWANV2DataFormat(softVersion.substring(2, 4))}`
}
function getHardVersion (hardVersion) {
    return `${loraWANV2DataFormat(hardVersion.substring(0, 2))}.${loraWANV2DataFormat(hardVersion.substring(2, 4))}`
}

function getOneWeekInterval (str) {
    return loraWANV2DataFormat(str) * 60
}
function getSensorValue (str, dig) {
    if (str === '8000') {
        return null
    } else {
        return loraWANV2DataFormat(str, dig)
    }
}

function bytes2HexString (arrBytes) {
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
function loraWANV2DataFormat (str, divisor = 1) {
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

function bigEndianTransform (data) {
    let dataArray = []
    for (let i = 0; i < data.length; i += 2) {
        dataArray.push(data.substring(i, i + 2))
    }
    return dataArray
}

function toBinary (arr) {
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
    return binaryData.toString().replace(/,/g, '')
}

function getSOSMode (str) {
    return loraWANV2DataFormat(str)
}

function getMacAndRssiObj (pair) {
    let pairs = []
    if (pair.length % 14 === 0) {
        for (let i = 0; i < pair.length; i += 14) {
            let mac = getMacAddress(pair.substring(i, i + 12))
            if (mac) {
                let rssi = getInt8RSSI(pair.substring(i + 12, i + 14))
                pairs.push({mac: mac, rssi: rssi})
            } else {
                continue
            }
        }
    }
    return pairs
}

function getMacAddress (str) {
    if (str.toLowerCase() === 'ffffffffffff') {
        return null
    }
    let macArr = []
    for (let i = 1; i < str.length; i++) {
        if (i % 2 === 1) {
            macArr.push(str.substring(i - 1, i + 1))
        }
    }
    let mac = ''
    for (let i = 0; i < macArr.length; i++) {
        mac = mac + macArr[i]
        if (i < macArr.length - 1) {
            mac = mac + ':'
        }
    }
    return mac
}

function getInt8RSSI (str) {
    return this.loraWANV2DataFormat(str)
}

function getInt (str) {
    return parseInt(str)
}

/**
 *  1.MOVING_STARTING
 *  2.MOVING_END
 *  3.DEVICE_STATIC
 *  4.SHOCK_EVENT
 *  5.TEMP_EVENT
 *  6.LIGHTING_EVENT
 *  7.SOS_EVENT
 *  8.CUSTOMER_EVENT
 * */
function getEventStatus (str) {
    let bitStr = this.getByteArray(str)
    let event = []
    for (let i = bitStr.length; i >= 0; i--) {
        if (i === 0) {
            event[i] = bitStr.substring(0)
        } else {
            event[i] = bitStr.substring(i - 1, i)
        }
    }
    return event.reverse()
}

function getByteArray (str) {
    let bytes = []
    for (let i = 0; i < str.length; i += 2) {
        bytes.push(str.substring(i, i + 2))
    }
    return toBinary(bytes)
}

function getWorkingMode (workingMode) {
    return getInt(workingMode)
}

function getUTCTimestamp(str){
    return parseInt(this.loraWANV2PositiveDataFormat(str)) * 1000
}

function loraWANV2PositiveDataFormat (str, divisor = 1) {
    let strReverse = this.bigEndianTransform(str)
    let str2 = this.toBinary(strReverse)
    return parseInt(str2, 2) / divisor
}