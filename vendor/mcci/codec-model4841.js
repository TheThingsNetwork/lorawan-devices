/*

Name:   codec-model4841.js

Function:
    Decode port 0x01 format 0x20 and 0x21 messages for TTN console.

Copyright and License:
    See accompanying LICENSE file at https://github.com/mcci-catena/MCCI-Catena-PMS7003/

Author:
    Terry Moore, MCCI Corporation   July 2019

*/

// calculate dewpoint (degrees C) given temperature (C) and relative humidity (0..100)
// from http://andrew.rsmas.miami.edu/bmcnoldy/Humidity.html
// rearranged for efficiency and to deal sanely with very low (< 1%) RH
function dewpoint(t, rh) {
  var c1 = 243.04;
  var c2 = 17.625;
  var h = rh / 100;
  if (h <= 0.01)
    h = 0.01;
  else if (h > 1.0)
    h = 1.0;

  var lnh = Math.log(h);
  var tpc1 = t + c1;
  var txc2 = t * c2;
  var txc2_tpc1 = txc2 / tpc1;

  var tdew = c1 * (lnh + txc2_tpc1) / (c2 - lnh - txc2_tpc1);
  return tdew;
}

/*
 
Name:   CalculateHeatIndex()
 
Description:
  Calculate the NWS heat index given dry-bulb T and RH
 
Definition:
  function CalculateHeatIndex(t, rh) -> value or null
 
Description:
  T is a Farentheit temperature in [76,120]; rh is a
  relative humidity in [0,100]. The heat index is computed
  and returned; or an error is returned.
 
Returns:
  number => heat index in Farenheit.
  null => error.
 
References:
  https://github.com/mcci-catena/heat-index/
  https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml
 
  Results was checked against the full chart at iweathernet.com:
  https://www.iweathernet.com/wxnetcms/wp-content/uploads/2015/07/heat-index-chart-relative-humidity-2.png
 
  The MCCI-Catena heat-index site has a test js script to generate CSV to
  match the chart, a spreadsheet that recreates the chart, and a
  spreadsheet that compares results.
 
*/

function CalculateHeatIndex(t, rh) {
  var tRounded = Math.floor(t + 0.5);

  // return null outside the specified range of input parameters
  if (tRounded < 76 || tRounded > 126)
    return null;
  if (rh < 0 || rh > 100)
    return null;

  // according to the NWS, we try this first, and use it if we can
  var tHeatEasy = 0.5 * (t + 61.0 + ((t - 68.0) * 1.2) + (rh * 0.094));

  // The NWS says we use tHeatEasy if (tHeatHeasy + t)/2 < 80.0
  // This is the same computation:
  if ((tHeatEasy + t) < 160.0)
    return tHeatEasy;

  // need to use the hard form, and possibly adjust.
  var t2 = t * t;         // t squared
  var rh2 = rh * rh;      // rh squared
  var tResult =
    -42.379 +
    (2.04901523 * t) +
    (10.14333127 * rh) +
    (-0.22475541 * t * rh) +
    (-0.00683783 * t2) +
    (-0.05481717 * rh2) +
    (0.00122874 * t2 * rh) +
    (0.00085282 * t * rh2) +
    (-0.00000199 * t2 * rh2);

  // these adjustments come from the NWA page, and are needed to
  // match the reference table.
  var tAdjust;
  if (rh < 13.0 && 80.0 <= t && t <= 112.0)
    tAdjust = -((13.0 - rh) / 4.0) * Math.sqrt((17.0 - Math.abs(t - 95.0)) / 17.0);
  else if (rh > 85.0 && 80.0 <= t && t <= 87.0)
    tAdjust = ((rh - 85.0) / 10.0) * ((87.0 - t) / 5.0);
  else
    tAdjust = 0;

  // apply the adjustment
  tResult += tAdjust;

  // finally, the reference tables have no data above 183 (rounded),
  // so filter out answers that we have no way to vouch for.
  if (tResult >= 183.5)
    return null;
  else
    return tResult;
}

/*
 
Name:   CalculatePmAqi()
 
Description:
  Calculate the NWS AQI given PM 1, PM 2.5 and PM 10 concentrations
 
Definition:
  function CalculatePmAqi(pm2_5, pm10) -> { AQI_2_5=x, AQI_10=x, AQI=x }
 
Description:
  pm2_5 is the PM2.5 concentration, pm10 is the PM10 concentration, in ug/m3.
  If either is null, the corresponding conversion is skipped. AQI is the greater
  of the resulting two AQIs.
 
Returns:
  An object with three fields.
 
*/

function CalculatePmAqi(pm2_5, pm10) {
  var result = {};
  result.AQI_2_5 = null;
  result.AQI_10 = null;
  result.AQI = null;

  function interpolate(v, t) {
    if (v === null)
      return null;

    var i;
    for (i = t.length - 2; i > 0; --i)
      if (t[i][0] <= v)
        break;

    var entry = t[i];
    var baseX = entry[0];
    var baseY = entry[1];
    var dx = (t[i + 1][0] - baseX);
    var f = (v - baseX);
    var dy = (t[i + 1][1] - baseY);
    return Math.floor(baseY + f * dy / dx + 0.5);
  }

  var t2_5 = [[0, 0], [12.1, 51], [35.5, 101], [55.5, 151], [150.5, 201], [250.5, 301], [350.5, 401]];
  var t10 = [[0, 0], [55, 51], [155, 101], [255, 151], [355, 201], [425, 301], [505, 401]];

  result.AQI_2_5 = interpolate(pm2_5, t2_5);
  result.AQI_10 = interpolate(pm10, t10);
  if (result.AQI_2_5 === null)
    result.AQI = result.AQI_10;
  else if (result.AQI_10 === null)
    result.AQI = result.AQI_2_5;
  else if (result.AQI_2_5 > result.AQI_10)
    result.AQI = result.AQI_2_5;
  else
    result.AQI = result.AQI_10;

  return result;
}

function DecodeU16(Parse) {
  var i = Parse.i;
  var bytes = Parse.bytes;
  var Vraw = (bytes[i] << 8) + bytes[i + 1];
  Parse.i = i + 2;
  return Vraw;
}

function DecodeUflt16(Parse) {
  var rawUflt16 = DecodeU16(Parse);
  var exp1 = rawUflt16 >> 12;
  var mant1 = (rawUflt16 & 0xFFF) / 4096.0;
  var f_unscaled = mant1 * Math.pow(2, exp1 - 15);
  return f_unscaled;
}

function DecodePM(Parse) {
  return DecodeUflt16(Parse) * 65536.0;
}

function DecodeDust(Parse) {
  return DecodeUflt16(Parse) * 65536.0;
}

function DecodeI16(Parse) {
  var Vraw = DecodeU16(Parse);

  // interpret uint16 as an int16 instead.
  if (Vraw & 0x8000)
    Vraw += -0x10000;

  return Vraw;
}

function DecodeI16(Parse) {
  var i = Parse.i;
  var bytes = Parse.bytes;
  var Vraw = (bytes[i] << 8) + bytes[i + 1];
  Parse.i = i + 2;

  // interpret uint16 as an int16 instead.
  if (Vraw & 0x8000)
    Vraw += -0x10000;

  return Vraw;
}

function DecodeV(Parse) {
  return DecodeI16(Parse) / 4096.0;
}

function Decoder(bytes, port) {
  // Decode an uplink message from a buffer
  // (array) of bytes to an object of fields.
  var decoded = {};

  if (!(port === 1 || port === 5))
    return null;

  var uFormat = bytes[0];
  if (!(uFormat === 0x20 || uFormat === 0x21))
    return null;

  decoded.port = port;
  decoded.format = uFormat;

  // an object to help us parse.
  var Parse = {};
  Parse.bytes = bytes;
  // i is used as the index into the message. Start with the flag byte.
  Parse.i = 1;

  // fetch the bitmap.
  var flags = bytes[Parse.i++];

  if (flags & 0x1) {
    decoded.vbat = DecodeV(Parse);
  }

  if (flags & 0x2) {
    decoded.vsys = DecodeV(Parse);
  }

  if (flags & 0x4) {
    decoded.vbus = DecodeV(Parse);
  }

  if (flags & 0x8) {
    var iBoot = bytes[Parse.i++];
    decoded.boot = iBoot;
  }

  if (flags & 0x10) {
    // we have temp, pressure, RH
      decoded.t = DecodeI16(Parse) / 256;
      if (uFormat === 0x20)
        decoded.p = DecodeU16(Parse) * 4 / 100.0;
      decoded.rh = DecodeU16(Parse) * 100 / 65535.0;
      decoded.tDew = dewpoint(decoded.t, decoded.rh);
      var tHeat = CalculateHeatIndex(decoded.t * 1.8 + 32, decoded.rh);
      if (tHeat !== null)
        decoded.tHeatIndex = (tHeat - 32) * 5 / 9;
  }

  if (flags & 0x20) {
    if (port === 5) {
      var tvoc = DecodeU16(Parse);
      decoded.tvoc = tvoc;
    }
    decoded.pm = {};
    decoded.pm["1.0"] = DecodePM(Parse);
    decoded.pm["2.5"] = DecodePM(Parse);
    decoded.pm["10"] = DecodePM(Parse);

    decoded.aqi_partial = {};
    var aqi = CalculatePmAqi(decoded.pm["1.0"], null);
    decoded.aqi_partial["1.0"] = aqi.AQI;

    aqi = CalculatePmAqi(decoded.pm["2.5"], decoded.pm["10"]);
    decoded.aqi_partial["2.5"] = aqi.AQI_2_5;
    decoded.aqi_partial["10"] = aqi.AQI_10;
    decoded.aqi = aqi.AQI;
  }

  if (flags & 0x40) {
    decoded.dust = {};
    decoded.dust["0.3"] = DecodeDust(Parse);
    decoded.dust["0.5"] = DecodeDust(Parse);
    decoded.dust["1.0"] = DecodeDust(Parse);
    decoded.dust["2.5"] = DecodeDust(Parse);
    decoded.dust["5"] = DecodeDust(Parse);
    decoded.dust["10"] = DecodeDust(Parse);
  }

  if (flags & 0x80 && port === 1) {
    var tvoc = DecodeU16(Parse);
    decoded.tvoc = tvoc;
  }

  return decoded;
}

// TTN V3 decoder
function decodeUplink(tInput) {
  var decoded = Decoder(tInput.bytes, tInput.fPort);
  var result = {};
  result.data = decoded;
  return result;
}
