/*
 * JavaScript implementation of brUncompress.
 */

// {{{ Constants

var ST_UNDEF = 0
var ST_BL = 1
var ST_U4 = 2
var ST_I4 = 3
var ST_U8 = 4
var ST_I8 = 5
var ST_U16 = 6
var ST_I16 = 7
var ST_U24 = 8
var ST_I24 = 9
var ST_U32 = 10
var ST_I32 = 11
var ST_FL = 12

var ST = {}
ST[ST_UNDEF] = 0
ST[ST_BL] = 1
ST[ST_U4] = 4
ST[ST_I4] = 4
ST[ST_U8] = 8
ST[ST_I8] = 8
ST[ST_U16] = 16
ST[ST_I16] = 16
ST[ST_U24] = 24
ST[ST_I24] = 24
ST[ST_U32] = 32
ST[ST_I32] = 32
ST[ST_FL] = 32

var BR_HUFF_MAX_INDEX_TABLE = 14
var NUMBER_OF_SERIES = 16

var HUFF = [
  [
    { sz: 2, lbl: 0x000 },
    { sz: 2, lbl: 0x001 },
    { sz: 2, lbl: 0x003 },
    { sz: 3, lbl: 0x005 },
    { sz: 4, lbl: 0x009 },
    { sz: 5, lbl: 0x011 },
    { sz: 6, lbl: 0x021 },
    { sz: 7, lbl: 0x041 },
    { sz: 8, lbl: 0x081 },
    { sz: 10, lbl: 0x200 },
    { sz: 11, lbl: 0x402 },
    { sz: 11, lbl: 0x403 },
    { sz: 11, lbl: 0x404 },
    { sz: 11, lbl: 0x405 },
    { sz: 11, lbl: 0x406 },
    { sz: 11, lbl: 0x407 }
  ],
  [
    { sz: 7, lbl: 0x06f },
    { sz: 5, lbl: 0x01a },
    { sz: 4, lbl: 0x00c },
    { sz: 3, lbl: 0x003 },
    { sz: 3, lbl: 0x007 },
    { sz: 2, lbl: 0x002 },
    { sz: 2, lbl: 0x000 },
    { sz: 3, lbl: 0x002 },
    { sz: 6, lbl: 0x036 },
    { sz: 9, lbl: 0x1bb },
    { sz: 9, lbl: 0x1b9 },
    { sz: 10, lbl: 0x375 },
    { sz: 10, lbl: 0x374 },
    { sz: 10, lbl: 0x370 },
    { sz: 11, lbl: 0x6e3 },
    { sz: 11, lbl: 0x6e2 }
  ],
  [
    { sz: 4, lbl: 0x009 },
    { sz: 3, lbl: 0x005 },
    { sz: 2, lbl: 0x000 },
    { sz: 2, lbl: 0x001 },
    { sz: 2, lbl: 0x003 },
    { sz: 5, lbl: 0x011 },
    { sz: 6, lbl: 0x021 },
    { sz: 7, lbl: 0x041 },
    { sz: 8, lbl: 0x081 },
    { sz: 10, lbl: 0x200 },
    { sz: 11, lbl: 0x402 },
    { sz: 11, lbl: 0x403 },
    { sz: 11, lbl: 0x404 },
    { sz: 11, lbl: 0x405 },
    { sz: 11, lbl: 0x406 },
    { sz: 11, lbl: 0x407 }
  ]
]

// }}}

// {{{ Polyfills
Math.trunc =
  Math.trunc ||
  function(x) {
    if (isNaN(x)) {
      return NaN
    }
    if (x > 0) {
      return Math.floor(x)
    }
    return Math.ceil(x)
  }
// }}}

/**
 * brUncompress main function
 */
function brUncompress(tagsz, argList, hexString, batch_absolute_timestamp) {
  var out = initResult()
  var buffer = createBuffer(parseHexString(hexString))
  var flag = generateFlag(buffer.getNextSample(ST_U8))

  out.batch_counter = buffer.getNextSample(ST_U8, 3)
  buffer.getNextSample(ST_U8, 1)

  var temp = prePopulateOutput(out, buffer, argList, flag, tagsz)
  var last_timestamp = temp.last_timestamp
  var index_of_the_first_sample = temp.index_of_the_first_sample

  if (flag.hasSample) {
    last_timestamp = uncompressSamplesData(
      out,
      buffer,
      index_of_the_first_sample,
      argList,
      last_timestamp,
      flag,
      tagsz
    )
  }

  out.batch_relative_timestamp = extractTimestampFromBuffer(
    buffer,
    last_timestamp
  )
  return adaptToExpectedFormat(out, argList, batch_absolute_timestamp)
}

/////////////// Sub functions ///////////////

/**
 * Init br_uncompress result data structure
 */
function initResult() {
  var series = [],
    i = 0
  while (i < NUMBER_OF_SERIES) {
    series.push({
      codingType: 0,
      codingTable: 0,
      resolution: null,
      uncompressSamples: []
    })
    i += 1
  }
  return {
    batch_counter: 0,
    batch_relative_timestamp: 0,
    series: series
  }
}

/**
 * Function to create a buffer from a byteArray. Allow to read sample from the
 * byteArray to extract data.
 */
function createBuffer(byteArray) {
  /**
   * Retrieve the pattern for HUFF table lookup
   */
  function bitsBuf2HuffPattern(byteArray, index, nb_bits) {
    var sourceBitStart = index
    var sz = nb_bits - 1
    if (byteArray.length * 8 < sourceBitStart + nb_bits) {
      throw "Verify that dest buf is large enough"
    }
    var bittoread = 0
    var pattern = 0
    while (nb_bits > 0) {
      if (byteArray[sourceBitStart >> 3] & (1 << (sourceBitStart & 0x07))) {
        pattern |= 1 << (sz - bittoread)
      }
      nb_bits--
      bittoread++
      sourceBitStart++
    }
    return pattern
  }

  return {
    index: 0,
    byteArray: byteArray,
    getNextSample: function(sampleType, nbBitsInput) {
      var nbBits = nbBitsInput || ST[sampleType]
      var sourceBitStart = this.index
      this.index += nbBits
      if (sampleType === ST_FL && nbBits !== 32) {
        throw "Mauvais sampletype"
      }

      var u32 = 0
      var nbytes = Math.trunc((nbBits - 1) / 8) + 1
      var nbitsfrombyte = nbBits % 8
      if (nbitsfrombyte === 0 && nbytes > 0) {
        nbitsfrombyte = 8
      }

      while (nbytes > 0) {
        var bittoread = 0
        while (nbitsfrombyte > 0) {
          var idx = sourceBitStart >> 3
          if (this.byteArray[idx] & (1 << (sourceBitStart & 0x07))) {
            u32 |= 1 << ((nbytes - 1) * 8 + bittoread)
          }
          nbitsfrombyte--
          bittoread++
          sourceBitStart += 1
        }
        nbytes--
        nbitsfrombyte = 8
      }
      // Propagate the sign bit if 1
      if (
        (sampleType == ST_I4 || sampleType == ST_I8 ||sampleType == ST_I16 || sampleType == ST_I24) &&
        u32 & (1 << (nbBits - 1))
      ) {
        for (var i = nbBits; i < 32; i++) {
          u32 |= 1 << i
          nbBits++
        }
      }
      return u32
    },

    /**
     * Extract sz and bi from Huff table
     */
    getNextBifromHi: function(huff_coding) {
      for (var i = 2; i < 12; i++) {
        var lhuff = bitsBuf2HuffPattern(this.byteArray, this.index, i)
        for (var j = 0; j < HUFF[huff_coding].length; j++) {
          if (
            HUFF[huff_coding][j].sz == i &&
            lhuff == HUFF[huff_coding][j].lbl
          ) {
            this.index += i
            return j
          }
        }
      }
      throw "Bi not found in HUFF table"
    }
  }
}

/**
 * Convert the hex string given as parameter to a ByteArray
 */
function parseHexString(str) {
  str = str
    .split("")
    .filter(function(x) {
      return !isNaN(parseInt(x, 16))
    })
    .join("")
  var result = []
  while (str.length >= 2) {
    result.push(parseInt(str.substring(0, 2), 16))
    str = str.substring(2, str.length)
  }
  return result
}

/**
 * Generate a flag object from an integer value.
 */
function generateFlag(flagAsInt) {
  var binbase = flagAsInt.toString(2)

  // leftpad
  while (binbase.length < 8) {
    binbase = "0" + binbase
  }

  return {
    isCommonTimestamp: parseInt(binbase[binbase.length - 2], 2),
    hasSample: !parseInt(binbase[binbase.length - 3], 2),
    batch_req: parseInt(binbase[binbase.length - 4], 2),
    nb_of_type_measure: parseInt(binbase.substring(0, 4), 2)
  }
}

/**
 * Prepopulate output with relative timestamp and measure of the first sample
 * for each series.
 */
function prePopulateOutput(out, buffer, argList, flag, tagsz) {
  var currentTimestamp = 0
  var index_of_the_first_sample = 0
  for (var i = 0; i < flag.nb_of_type_measure; i++) {
    var tag = {
      size: tagsz,
      lbl: buffer.getNextSample(ST_U8, tagsz)
    }
    var sampleIndex = findIndexFromArgList(argList, tag)

    if (i == 0) {
      index_of_the_first_sample = sampleIndex
    }

    currentTimestamp = extractTimestampFromBuffer(buffer, currentTimestamp)
    out.series[sampleIndex] = computeSeries(
      buffer,
      argList[sampleIndex].sampletype,
      tag.lbl,
      currentTimestamp
    )
    if (flag.hasSample) {
      out.series[sampleIndex].codingType = buffer.getNextSample(ST_U8, 2)
      out.series[sampleIndex].codingTable = buffer.getNextSample(ST_U8, 2)
    }
  }
  return {
    last_timestamp: currentTimestamp,
    index_of_the_first_sample: index_of_the_first_sample
  }
}

/**
 * Initialize next series from buffer
 */
function computeSeries(buffer, sampletype, label, currentTimestamp) {
  return {
    uncompressSamples: [
      {
        data_relative_timestamp: currentTimestamp,
        data: {
          value: getMeasure(buffer, sampletype),
          label: label
        }
      }
    ],
    codingType: 0,
    codingTable: 0,
    resolution: null
  }
}

/**
 * Return the index of tag lbl in the argument list
 */
function findIndexFromArgList(argList, tag) {
  for (var i = 0; i < argList.length; i++) {
    if (argList[i].taglbl === tag.lbl) {
      return i
    }
  }
  throw "Cannot find index in argList"
}

/**
 * Extract a new time stamp using Huff table, optionnaly from a baseTimestamp
 */
function extractTimestampFromBuffer(buffer, baseTimestamp) {
  if (baseTimestamp) {
    var bi = buffer.getNextBifromHi(1)
    return computeTimestampFromBi(buffer, baseTimestamp, bi)
  }
  return buffer.getNextSample(ST_U32)
}

/**
 * Compute a new timestamp from a previous one, regarding bi value
 */
function computeTimestampFromBi(buffer, baseTimestamp, bi) {
  if (bi > BR_HUFF_MAX_INDEX_TABLE) {
    return buffer.getNextSample(ST_U32)
  }
  if (bi > 0) {
    return computeTimestampFromPositiveBi(buffer, baseTimestamp, bi)
  }
  return baseTimestamp
}

/**
 * Compute a new timestamp from a previous one, regarding posotive bi value
 */
function computeTimestampFromPositiveBi(buffer, baseTimestamp, bi) {
  return buffer.getNextSample(ST_U32, bi) + baseTimestamp + Math.pow(2, bi) - 1
}

/**
 * Extract the measure from the buffer, handling float case
 */

function getMeasure(buffer, sampletype) {
  var v = buffer.getNextSample(sampletype)
  return sampletype === ST_FL ? bytes2Float32(v) : v
}

/**
 * Convert bytes to a float32 representation.
 */
function bytes2Float32(bytes) {
  var sign = bytes & 0x80000000 ? -1 : 1,
    exponent = ((bytes >> 23) & 0xff) - 127,
    significand = bytes & ~(-1 << 23)

  if (exponent == 128) {
    return sign * (significand ? Number.NaN : Number.POSITIVE_INFINITY)
  }

  if (exponent == -127) {
    if (significand == 0) {
      return sign * 0.0
    }
    exponent = -126
    significand /= 1 << 22
  } 
  else {
    significand = (significand | (1 << 23)) / (1 << 23)
  }

  return sign * significand * Math.pow(2, exponent)
}

/**
 * Uncompress samples data presenting common timestamp or separate timestamp
 */
function uncompressSamplesData(
  out,
  buffer,
  index_of_the_first_sample,
  argList,
  last_timestamp,
  flag,
  tagsz
) {
  if (flag.isCommonTimestamp) {
    return handleCommonTimestamp(
      out,
      buffer,
      index_of_the_first_sample,
      argList,
      flag,
      tagsz
    )
  }
  return handleSeparateTimestamp(
    out,
    buffer,
    argList,
    last_timestamp,
    flag,
    tagsz
  )
}

/**
 * Uncompress data in case of common timestamp
 */
function handleCommonTimestamp(
  out,
  buffer,
  index_of_the_first_sample,
  argList,
  flag,
  tagsz
) {
  //number of sample
  var nb_sample_to_parse = buffer.getNextSample(ST_U8, 8)
  var tag = {}

  var temp = initTimestampCommonTable(
    out,
    buffer,
    nb_sample_to_parse,
    index_of_the_first_sample
  )
  var timestampCommon = temp.timestampCommon
  var lastTimestamp = temp.lastTimestamp

  for (var j = 0; j < flag.nb_of_type_measure; j++) {
    var first_null_delta_value = 1
    tag.lbl = buffer.getNextSample(ST_U8, tagsz)
    var sampleIndex = findIndexFromArgList(argList, tag)
    for (var i = 0; i < nb_sample_to_parse; i++) {
      //Available bit
      var available = buffer.getNextSample(ST_U8, 1)
      if (available) {
        //Delta value
        var bi = buffer.getNextBifromHi(out.series[sampleIndex].codingTable)
        var currentMeasure = {
          data_relative_timestamp: 0,
          data: {}
        }
        if (bi <= BR_HUFF_MAX_INDEX_TABLE) {
          var precedingValue =
            out.series[sampleIndex].uncompressSamples[
              out.series[sampleIndex].uncompressSamples.length - 1
            ].data.value
          if (bi > 0) {
            currentMeasure.data.value = completeCurrentMeasure(
              buffer,
              precedingValue,
              out.series[sampleIndex].codingType,
              argList[sampleIndex].resol,
              bi
            )
          } 
          else {
            // (bi <= 0)
            if (first_null_delta_value) {
              // First value is yet recorded starting from the header
              first_null_delta_value = 0
              continue
            } 
            else {
              currentMeasure.data.value = precedingValue
            }
          }
        } 
        else {

          // bi > BR_HUFF_MAX_INDEX_TABLE
          currentMeasure.data.value = buffer.getNextSample(
            argList[sampleIndex].sampletype
          )
        }
        currentMeasure.data_relative_timestamp = timestampCommon[i]
        out.series[sampleIndex].uncompressSamples.push(currentMeasure)
      }
    }
  }
  return lastTimestamp
}

/**
 * Initialize common timestamp table. Returns the table and last calculated timestamp
 */
function initTimestampCommonTable(
  out,
  buffer,
  nbSampleToParse,
  firstSampleIndex
) {
  var timestampCommon = []
  var lastTimestamp = 0
  var timestampCoding = buffer.getNextSample(ST_U8, 2)
  for (var i = 0; i < nbSampleToParse; i++) {
    //delta timestamp
    var bi = buffer.getNextBifromHi(timestampCoding)
    if (bi <= BR_HUFF_MAX_INDEX_TABLE) {
      if (i == 0) {
        timestampCommon.push(
          out.series[firstSampleIndex].uncompressSamples[0]
            .data_relative_timestamp
        )

      } 
      else {
        if (bi > 0) {
          var precedingTimestamp = timestampCommon[i - 1]
          timestampCommon.push(
            buffer.getNextSample(ST_U32, bi) +
              precedingTimestamp +
              Math.pow(2, bi) -
              1
          )
        } 
        else {
          timestampCommon.push(precedingTimestamp)
        }
      }
    } 
    else {
      timestampCommon.push(buffer.getNextSample(ST_U32))
    }
    lastTimestamp = timestampCommon[i]
  }
  return {
    timestampCommon: timestampCommon,
    lastTimestamp: lastTimestamp
  }
}

/**
 * Complete current measure from the preceding one
 */
function completeCurrentMeasure(buffer, precedingValue, codingType, resol, bi) {
  var currentValue = buffer.getNextSample(ST_U16, bi)
  if (codingType === 0) {
    // ADLC
    return computeAdlcValue(currentValue, resol, precedingValue, bi)
  }
  if (codingType === 1) {
    // Positive
    return (currentValue + Math.pow(2, bi) - 1) * resol + precedingValue
  }
  // Negative
  return precedingValue - (currentValue + (Math.pow(2, bi) - 1)) * resol
}

/**
 * Return current value in ADLC case
 */
function computeAdlcValue(currentValue, resol, precedingValue, bi) {
  if (currentValue >= Math.pow(2, bi - 1)) {
    return currentValue * resol + precedingValue
  }
  return (currentValue + 1 - Math.pow(2, bi)) * resol + precedingValue
}

/**
 * Uncompress data in case of separate timestamp
 */
function handleSeparateTimestamp(
  out,
  buffer,
  argList,
  last_timestamp,
  flag,
  tagsz
) {
  var tag = {}
  for (var i = 0; i < flag.nb_of_type_measure; i++) {
    tag.lbl = buffer.getNextSample(ST_U8, tagsz)
    var sampleIndex = findIndexFromArgList(argList, tag)
    var compressSampleNb = buffer.getNextSample(ST_U8, 8)
    if (compressSampleNb) {
      var timestampCoding = buffer.getNextSample(ST_U8, 2)
      for (var j = 0; j < compressSampleNb; j++) {
        var precedingRelativeTimestamp =
          out.series[sampleIndex].uncompressSamples[
            out.series[sampleIndex].uncompressSamples.length - 1
          ].data_relative_timestamp
        var currentMeasure = {
          data_relative_timestamp: 0,
          data: {}
        }
        var bi = buffer.getNextBifromHi(timestampCoding)
        currentMeasure.data_relative_timestamp = computeTimestampFromBi(
          buffer,
          precedingRelativeTimestamp,
          bi
        )
        if (currentMeasure.data_relative_timestamp > last_timestamp) {
          last_timestamp = currentMeasure.data_relative_timestamp
        }
        bi = buffer.getNextBifromHi(out.series[sampleIndex].codingTable)
        if (bi <= BR_HUFF_MAX_INDEX_TABLE) {
          var precedingValue =
            out.series[sampleIndex].uncompressSamples[
              out.series[sampleIndex].uncompressSamples.length - 1
            ].data.value
          if (bi > 0) {
            currentMeasure.data.value = completeCurrentMeasure(
              buffer,
              precedingValue,
              out.series[sampleIndex].codingType,
              argList[sampleIndex].resol,
              bi
            )
          } else {
            // bi <= 0
            currentMeasure.data.value = precedingValue
          }
        } else {
          // bi > BR_HUFF_MAX_INDEX_TABLE
          currentMeasure.data.value = buffer.getNextSample(
            argList[sampleIndex].sampletype
          )
        }
        out.series[sampleIndex].uncompressSamples.push(currentMeasure)
      }
    }
  }
  return last_timestamp
}

/**
 * Translate brUncompress output data to expected structure
 */
function adaptToExpectedFormat(out, argList, batchAbsoluteTimestamp) {
  var returnedGlobalObject = {
    //batch_counter: out.batch_counter,
    //batch_relative_timestamp: out.batch_relative_timestamp
  }
  if (batchAbsoluteTimestamp) {
    returnedGlobalObject.b_ts = batchAbsoluteTimestamp
  }
  returnedGlobalObject.datas = out.series.reduce(function(
    acc,
    current,
    index
  ) {
    return acc.concat(
      current.uncompressSamples.map(function(item) {
        var returned = {
          //data_relative_timestamp: item.data_relative_timestamp,
          data: {
            value: argList[index].divide
              ? item.data.value / argList[index].divide
              : item.data.value,

          }
        }
        if (argList[index].lblname) {
          returned.data.label = argList[index].lblname
        }
        if (batchAbsoluteTimestamp) {
          returned.date = computeDataAbsoluteTimestamp(
            batchAbsoluteTimestamp,
            out.batch_relative_timestamp,
            item.data_relative_timestamp
          )
        }
        return returned
      })
    )
  },
  [])
  return returnedGlobalObject
}

/**
 * Compute data absolute timestamp from batch absolute timestamp (bat), batch
 * relative timestamp (brt) and data relative timestamp (drt)
 */
function computeDataAbsoluteTimestamp(bat, brt, drt) {
  return new Date(new Date(bat) - (brt - drt) * 1000).toISOString()
}

try {
  module.exports = brUncompress
} catch (e) {
  // when called from nashorn,  module.exports is unavailable…
}


function UintToInt(Uint, Size) {
  if (Size === 2) {
    if ((Uint & 0x8000) > 0) {
      Uint = Uint - 0x10000;
    }
  }
  if (Size === 3) {
    if ((Uint & 0x800000) > 0) {
      Uint = Uint - 0x1000000;
    }
  }
  if (Size === 4) {
    if ((Uint & 0x80000000) > 0) {
      Uint = Uint - 0x100000000;
    }
  }
  return Uint;
}



function decimalToHex(d, padding) {
  var hex = Number(d).toString(16).toUpperCase();
  padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

  while (hex.length < padding) {
    hex = "0" + hex;
  }
  return "0x" + hex;
}



function Bytes2Float32(bytes) {
  var sign = (bytes & 0x80000000) ? -1 : 1;
  var exponent = ((bytes >> 23) & 0xFF) - 127;
  var significand = (bytes & ~(-1 << 23));

  if (exponent == 128)
    return sign * ((significand) ? Number.NaN : Number.POSITIVE_INFINITY);

  if (exponent == -127) {
    if (significand == 0) return sign * 0.0;
      exponent = -126;
      significand /= (1 << 22);
    } 
    else significand = (significand | (1 << 23)) / (1 << 23);

    return sign * significand * Math.pow(2, exponent);
}



function Decoder(bytes, port) {

  // Decode an uplink message from a buffer
  // (array) of bytes to an object of fields.
  var decoded = {};

  var decodedBatch = {};

  var date = new Date();
  var lDate = date.toISOString();
    
    
  if (port === 1){
    decodedBatch = !(bytes[0] & 0x01);

    stdData = {};
    tab = [];
    header = [];
    fft = [];


    // Report Type
    if (bytes[0] === 0x72 || bytes[0] === 0x52) {

      if (bytes[6] <= 0x3b ) {  // 0x3B = 59 in decimal that corresponds to a reportperiod <= 59 min
        reportperiod = bytes[6];
      } 

      if (bytes[6] > 0x3b) {
        reportperiod = (bytes[6]-59)*60;
      }

      operatingtime = bytes[2]*reportperiod/127;     

      header.push({type: "Report", sensor: "KX"});

      tab.push({label: "BatteryPercentage", value: bytes[17]*100/127, date: lDate});
      tab.push({label: "AnomalyLevel", value: bytes[1]*100/127, date: lDate});
      tab.push({label: "AnomalyLevelTo20Last6Mo", value: bytes[24], date: lDate});
      tab.push({label: "NbAlarmReport", value: bytes[4], date: lDate});
      tab.push({label: "OperatingTime", value: bytes[2]*2/127, date: lDate});
      tab.push({label: "TotalUnknown6080", value: (operatingtime - bytes[3]*operatingtime/127)*bytes[15]/127, date: lDate});
      tab.push({label: "TotalUnknown4060", value: (operatingtime - bytes[3]*operatingtime/127)*bytes[14]/127, date: lDate});
      tab.push({label: "TotalUnknown2040", value: (operatingtime - bytes[3]*operatingtime/127)*bytes[13]/127, date: lDate});
      tab.push({label: "AnomalyLevelTo80Last30D", value: bytes[23], date: lDate});
      tab.push({label: "VibrationLevel", value: (bytes[8]*128+bytes[9]+bytes[10]/100)/10/121.45, date: lDate});
      tab.push({label: "TotalUnknown1020", value: (operatingtime - bytes[3]*operatingtime/127), date: lDate});
      tab.push({label: "AnomalyLevelTo80Last6Mo", value: bytes[26], date: lDate});
      tab.push({label: "AnomalyLevelTo50Last24H", value: bytes[19], date: lDate});
      tab.push({label: "AnomalyLevelTo20Last24H", value: bytes[18], date: lDate});
      tab.push({label: "AnomalyLevelTo50Last30D", value: bytes[22], date: lDate}); 
      tab.push({label: "Temperature", value: bytes[5] - 30, date: lDate});
      tab.push({label: "ReportLength", value: reportperiod, date: lDate});
      tab.push({label: "AnomalyLevelTo20Last30D", value: bytes[21], date: lDate});
      tab.push({label: "PeakFrequencyIndex", value: bytes[11]+1, date: lDate});
      tab.push({label: "TotalUnknown80100", value: (operatingtime - bytes[3]*operatingtime/127)*bytes[16]/127, date: lDate});
      tab.push({label: "TotalOperatingTimeKnown", value:bytes[3]*operatingtime/127, date: lDate});
      tab.push({label: "AnomalyLevelTo50Last6Mo", value: bytes[25], date: lDate});
      tab.push({label: "AnomalyLevelTo80Last24H", value: bytes[20], date: lDate});
    }


    // Alarm Type
    if (bytes[0] === 0x61) {
      vibrationlevel = (bytes[4]*128+bytes[5]+bytes[6]/100)/10/121.45;

      header.push({type: "Alarm", sensor: "KX"});

      tab.push({label: "Temperature", value: bytes[2]-30, date: lDate});
      tab.push({label: "VibrationLevel", value: (bytes[4]*128+bytes[5]+bytes[6]/100)/10/121.45, date: lDate});
      tab.push({label: "AnomalyLevel", value: bytes[1]*100/127, date:lDate });

      for(i=8; i<= 39; i++) {
        fft.push({label: "fft"+(i-7), value: bytes[i]*vibrationlevel/127, date: lDate});
      }
      decoded.fft = fft;
    }
        
    
    // Learning Type
    if (bytes[0] === 0x6c) {
      const FREQ_SAMPLING_ACC_LF = 800;
      const FREQ_SAMPLING_ACC_HF = 25600;

      vibrationlevel = (bytes[2]*128+bytes[3]+bytes[4]/100)/10/121.45;

      header.push({type: "Learning", sensor: "KX"});

      tab.push({label : "Temperature", value: bytes[6]-30, date: lDate});
      tab.push({label: "LearningFromScratch", value: bytes[7], date: lDate});
      tab.push({label: "LearningPercentage", value: bytes[1], date: lDate});
      tab.push({label: "VibrationLevel", value: vibrationlevel, date: lDate});
      tab.push({label: "PeakFrequencyIndex", value: bytes[5]+1, date: lDate});
      tab.push({label: "PeakFrequency", value: (bytes[5]+1)*FREQ_SAMPLING_ACC_LF/256, date: lDate});
      
      for(i=8; i<=39; i++ ) {
        fft.push({label: "fft"+(i-7), value: bytes[i]*vibrationlevel/127, date: lDate});
      }
      decoded.fft = fft;  

    }


    // State Type
    if(bytes[0] === 0x53) {
      var state;

      header.push({type: "State", sensor: "KX"});

      if (bytes[1] === 100) {
        state = "Sensor start";
      }
      if (bytes[1] === 101) {
        state = "Sensor stop";
      }
      if(bytes[1] === 125) {
        state = "Machine stop"
      }
      if(bytes[1] === 126) {
        state = "Machine start"
      }

      tab.push({label: "State", value: state, date: lDate});
      tab.push({label: "BatteryPercentage", value: bytes[2]*100/127, date: lDate});

    }
                
    decoded.data = tab;
    decoded.header = header;

    return decoded;
  }
}


function decodeUplink(input) {
 
  return {
    data : Decoder(input.bytes, input.fPort),
    warnings: [],
    errors: []
  };
}