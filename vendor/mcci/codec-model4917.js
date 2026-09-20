/*
Name:   model4917-decoder-ttn.js

Function:
    This function decodes the record (port 1, format 0x35) sent by the
    MCCI Model 4917 multigas and environment sensor application.

Copyright and License:
    See accompanying LICENSE file

Author:
    Dhinesh Kumar Pitchai, MCCI Corporation   November 2022
*/

// calculate dewpoint (degrees C) given temperature (C) and relative humidity (0..100)
// from http://andrew.rsmas.miami.edu/bmcnoldy/Humidity.html
// rearranged for efficiency and to deal sanely with very low (< 1%) RH
function dewpoint(t, rh) {
  var c1 = 243.04;
  var c2 = 17.625;
  var h = rh / 100;
  if (h <= 0.01) h = 0.01;
  else if (h > 1.0) h = 1.0;

  var lnh = Math.log(h);
  var tpc1 = t + c1;
  var txc2 = t * c2;
  var txc2_tpc1 = txc2 / tpc1;

  var tdew = (c1 * (lnh + txc2_tpc1)) / (c2 - lnh - txc2_tpc1);
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
  if (tRounded < 76 || tRounded > 126) return null;
  if (rh < 0 || rh > 100) return null;

  // according to the NWS, we try this first, and use it if we can
  var tHeatEasy = 0.5 * (t + 61.0 + (t - 68.0) * 1.2 + rh * 0.094);

  // The NWS says we use tHeatEasy if (tHeatHeasy + t)/2 < 80.0
  // This is the same computation:
  if (tHeatEasy + t < 160.0) return tHeatEasy;

  // need to use the hard form, and possibly adjust.
  var t2 = t * t; // t squared
  var rh2 = rh * rh; // rh squared
  var tResult = -42.379 + 2.04901523 * t + 10.14333127 * rh + -0.22475541 * t * rh + -0.00683783 * t2 + -0.05481717 * rh2 + 0.00122874 * t2 * rh + 0.00085282 * t * rh2 + -0.00000199 * t2 * rh2;

  // these adjustments come from the NWA page, and are needed to
  // match the reference table.
  var tAdjust;
  if (rh < 13.0 && 80.0 <= t && t <= 112.0) tAdjust = -((13.0 - rh) / 4.0) * Math.sqrt((17.0 - Math.abs(t - 95.0)) / 17.0);
  else if (rh > 85.0 && 80.0 <= t && t <= 87.0) tAdjust = ((rh - 85.0) / 10.0) * ((87.0 - t) / 5.0);
  else tAdjust = 0;

  // apply the adjustment
  tResult += tAdjust;

  // finally, the reference tables have no data above 183 (rounded),
  // so filter out answers that we have no way to vouch for.
  if (tResult >= 183.5) return null;
  else return tResult;
}

function CalculateHeatIndexCelsius(t, rh) {
  var result = CalculateHeatIndex(t, rh);
  if (result !== null) {
    // convert to celsius.
    result = ((result - 32) * 5) / 9;
  }
  return result;
}

function DecodeU16(Parse) {
  var i = Parse.i;
  var bytes = Parse.bytes;
  var raw = (bytes[i] << 8) + bytes[i + 1];
  Parse.i = i + 2;
  return raw;
}

function DecodeI16(Parse) {
  var Vraw = DecodeU16(Parse);

  // interpret uint16 as an int16 instead.
  if (Vraw & 0x8000) Vraw += -0x10000;

  return Vraw;
}

function DecodeU32(Parse) {
  var i = Parse.i;
  var bytes = Parse.bytes;

  var result = (bytes[i + 0] << 24) + (bytes[i + 1] << 16) + (bytes[i + 2] << 8) + bytes[i + 3];
  Parse.i = i + 4;

  return result;
}

function DecodeV(Parse) {
  return DecodeI16(Parse) / 4096.0;
}

function DecodeDownlinkResponse(bytes) {
  // Decode an uplink message from a buffer
  // (array) of bytes to an object of fields.
  var decoded = {};

  // an object to help us parse.
  var Parse = {};
  Parse.bytes = bytes;
  // i is used as the index into the message. Start with the flag byte.
  Parse.i = 0;

  // fetch the bitmap.
  var command = bytes[Parse.i++];

  if (command === 0x01) {
    // Reset device operating mode.
    decoded.ResponseType = 'Device Mode';

    var responseError = bytes[Parse.i++];
    if (responseError === 0) decoded.Response = 'Success';
    else if (responseError === 1) decoded.Response = 'Invalid Length';
    else if (responseError === 2) decoded.Response = 'Failure';

    var deviceMode = bytes[Parse.i++];
    if (deviceMode === 0) decoded.DeviceMode = 'Test';
    else if (deviceMode === 1) decoded.DeviceMode = 'Normal';
  } else if (command === 0x02) {
    // Reset do not send a reply back.
  } else if (command === 0x03) {
    // SW version and HW details.
    decoded.ResponseType = 'Device Version';

    var responseError = bytes[Parse.i++];
    if (responseError === 0) decoded.Response = 'Success';
    else if (responseError === 1) decoded.Response = 'Invalid Length';
    else if (responseError === 2) decoded.Response = 'Failure';

    var vMajor = bytes[Parse.i++];
    var vMinor = bytes[Parse.i++];
    var vPatch = bytes[Parse.i++];
    var vLocal = bytes[Parse.i++];
    decoded.AppVersion = 'V' + vMajor + '.' + vMinor + '.' + vPatch + '.' + vLocal;

    var Model = DecodeU16(Parse);
    var Rev = bytes[Parse.i++];
    if (!(Model === 0)) {
      decoded.Model = Model;
      if (Rev === 0) decoded.Rev = 'A';
      else if (Rev === 1) decoded.Rev = 'B';
      else if (Rev === 2) decoded.Rev = 'C';
    } else if (Model === 0) {
      decoded.Model = 4917;
      decoded.Rev = 'Not Found';
    }
  } else if (command === 0x04) {
    // Reset/Set AppEUI.
    decoded.ResponseType = 'AppEUI Set';

    var responseError = bytes[Parse.i++];
    if (responseError === 0) decoded.Response = 'Success';
    else if (responseError === 1) decoded.Response = 'Invalid Length';
    else if (responseError === 2) decoded.Response = 'Failure';
  } else if (command === 0x05) {
    // Reset/Set AppKey.
    decoded.ResponseType = 'AppKey set';

    var responseError = bytes[Parse.i++];
    if (responseError === 0) decoded.Response = 'Success';
    else if (responseError === 1) decoded.Response = 'Invalid Length';
    else if (responseError === 2) decoded.Response = 'Failure';
  } else if (command === 0x06) {
    // Rejoin the network.
    decoded.ResponseType = 'Rejoin';

    var responseError = bytes[Parse.i++];
    if (responseError === 0) decoded.Response = 'Success';
    else if (responseError === 1) decoded.Response = 'Invalid Length';
    else if (responseError === 2) decoded.Response = 'Failure';
  } else if (command === 0x07) {
    // Uplink Interval for sensor data.
    decoded.ResponseType = 'Uplink Interval';

    var responseError = bytes[Parse.i++];
    if (responseError === 0) decoded.Response = 'Success';
    else if (responseError === 1) decoded.Response = 'Invalid Length';
    else if (responseError === 2) decoded.Response = 'Failure';

    decoded.UplinkInterval = DecodeU32(Parse);
  } else if (command === 0x08) {
    // Recoverable messages stored in FRAM.
    decoded.ResponseType = 'Recoverable Uplink';

    var responseError = bytes[Parse.i++];
    if (responseError === 0) decoded.Response = 'Success';
    else if (responseError === 1) decoded.Response = 'Invalid Length';
    else if (responseError === 2) {
      decoded.Response = 'Failure';
      decoded.sequenceNumber = DecodeU16(Parse);
      return decoded;
    }

    decoded.sequenceNumber = DecodeU16(Parse);
    var timestamp = DecodeU32(Parse);
    if (timestamp & 1) decoded.timeType = 'network time';
    else decoded.timeType = 'boot time';

    timestamp = (timestamp >> 1) * 2;
    decoded.timestamp = new Date((timestamp + /* gps epoch to posix */ 315964800 - /* leap seconds */ 17) * 1000).toISOString();
    var iBoot = bytes[Parse.i++];
    decoded.boot = iBoot;
    decoded.tProbeBottom = DecodeI16(Parse) / 256;
    decoded.tProbeMiddle = DecodeI16(Parse) / 256;
    decoded.rhFlex = DecodeU16(Parse);
  }

  return decoded;
}

function Decoder(bytes, port) {
  // Decode an uplink message from a buffer
  // (array) of bytes to an object of fields.
  var decoded = {};

  if (port === 3) {
    decoded = DecodeDownlinkResponse(bytes);
    return decoded;
  }

  if (!(port === 1) && !(port === 2) && !(port === 3)) return null;

  var uFormat = bytes[0];
  if (!(uFormat === 0x35)) return null;

  // an object to help us parse.
  var Parse = {};
  Parse.bytes = bytes;
  // i is used as the index into the message. Start with the flag byte.
  Parse.i = 1;

  // fetch the bitmap.
  var flags = bytes[Parse.i++];

  if (flags & 0x1) {
    // sequence number
    decoded.sequenceNumber = DecodeU16(Parse);
  }

  if (flags & 0x2) {
    // network timestamp
    var timestamp = DecodeU32(Parse);
    if (timestamp & 1) decoded.timeType = 'network time';
    else decoded.timeType = 'boot time';

    timestamp = (timestamp >> 1) * 2;
    decoded.timestamp = new Date((timestamp + /* gps epoch to posix */ 315964800 - /* leap seconds */ 17) * 1000).toISOString();
  }

  if (flags & 0x4) {
    // scale and save in decoded.
    decoded.vBat = DecodeV(Parse);
  }

  if (flags & 0x8) {
    var iBoot = bytes[Parse.i++];
    decoded.boot = iBoot;
  }

  if (flags & 0x10) {
    // onewire temperature
    decoded.tProbeBottom = DecodeI16(Parse) / 256;
  }

  if (flags & 0x20) {
    // onewire temperature
    decoded.tProbeMiddle = DecodeI16(Parse) / 256;
  }

  if (flags & 0x40) {
    // we have temp, RH
    decoded.tFlex = DecodeI16(Parse) / 256;
    decoded.rhFlex = (DecodeU16(Parse) * 100) / 65535.0;
  }

  if (port === 1) decoded.OpMode = 'Normal';
  if (port === 2) decoded.OpMode = 'Test';

  return decoded;
}

// TTN V3 decoder
function decodeUplink(tInput) {
  var decoded = Decoder(tInput.bytes, tInput.fPort);
  var result = {};
  result.data = decoded;
  return result;
}
