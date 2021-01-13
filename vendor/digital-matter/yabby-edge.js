function PrintHex(bytes, offset, length)
{
  var output = "";
  for (var i = offset; i < offset + length; i++)
  {
    var s = bytes[i].toString(16);
    while (s.length < 2)
      s = "0" + s;
    if (output.length == 0)
        output = output + s;
    else
        output = output + s;
  }
  return output;
}

function MakeBitParser(bytes, offset, length)
{
    return { bits: bytes.slice(offset, offset + length), offset: 0, bitLength: length * 8 };
}

function GetU32LE(parser, bits)
{
    if ((bits > 32) || (parser.offset + bits > parser.bitLength))
    {
        parser.offset = parser.bitLength;
        return 0;
    }

    var out = 0;
    var total = 0;

    while (bits > 0)
    {
        var byteNum = Math.floor(parser.offset / 8);
        var discardLSbs = parser.offset & 7;
        var avail = Math.min(8 - discardLSbs, bits);
        var extracted = (parser.bits[byteNum] >>> discardLSbs);
        var masked = (extracted << (32 - avail)) >>> (32 - avail);

        out |= ((masked << total) >>> 0);
        total += avail;
        bits -= avail;
        parser.offset += avail;
    }

    return out;
}

function GetS32LE(parser, bits)
{
    var i = GetU32LE(parser, bits);
    if (bits > 32)
        return 0;
    return (i << (32 - bits)) >> (32 - bits);
}

function DecodeSatId(id)
{
    if (id < 32)
        return "G" + (id + 1);
    else if ((id >= 32) && (id <= 50))
        return "S" + (id + 88);
    else if ((id >= 64) && (id <= 100))
        return "B" + (id - 63);
    else
        return "?" + id;
}

function ParseNav(navBytes)
{
  var out = {};
  var p = MakeBitParser(navBytes, 0, navBytes.length);

  var type = GetU32LE(p, 4);
  if (type == 1)
    out.type = "autonomous";
  else if (type == 2)
    out.type = "aided";
  else
    out.type = type.toString();

  GetU32LE(p, 4);

  out.gpsTime = GetU32LE(p, 16);
  if (GetU32LE(p, 1) == 1)
  {
    out.assistLat = GetS32LE(p, 12) *  90 / 2048;
    out.assistLon = GetS32LE(p, 12) * 180 / 2048;
  }

  out.sats = [];
  while (p.bitLength - p.offset >= 8)
  {
      var constellation = GetU32LE(p, 4);       // 1: GPS, 2: Beidou
      var count = GetU32LE(p, 4);

      for (var i = 0; i < count; i++)
      {
          var sat = {};

          sat.id = DecodeSatId(GetU32LE(p, 7));
          sat.cno = 45 - 4 * GetU32LE(p, 2);

          var fHas8BitA = GetU32LE(p, 1);
          var fHasBitChange = GetU32LE(p, 1);
          var fFlagB = GetU32LE(p, 1);
          var fHasDoppler = GetU32LE(p, 1);
          var fHas19BitC = GetU32LE(p, 1);
          var fHasPsuedoRange = GetU32LE(p, 1);

          if (fHasPsuedoRange)
              sat.psuedoRangeNs = GetU32LE(p, 19) * 3;
          if (fHas19BitC)
              sat.c19 = GetU32LE(p, 19);
          if (fHasDoppler)
              sat.dopplerHz = GetS32LE(p, 15);
          if (fFlagB)
              sat.flagB = true;
          if (fHasBitChange)
              sat.bitChange = GetU32LE(p, 8);
          if (fHas8BitA)
              sat.a8 = GetU32LE(p, 8);

          out.sats[out.sats.length] = sat;
      }
  }

  return out;
}

function decodeUplink(input)
{
  var port = input.fPort;
  var bytes = input.bytes;
  var decoded = {};

  if (port === 1)
  {
    decoded.type = "reset";
    decoded.fwMaj = bytes[0];
    decoded.fwMin = bytes[1];
    decoded.prodId = bytes[2];
    decoded.hwRev = bytes[3];
    decoded.resetPowerOn  = ((bytes[4] & 1) != 0);
    decoded.resetWatchdog = ((bytes[4] & 2) != 0);
    decoded.resetExternal = ((bytes[4] & 4) != 0);
    decoded.resetSoftware = ((bytes[4] & 8) != 0);
    decoded.watchdogReason = bytes[5] + bytes[6] * 256;
    decoded.initialBatV = (2.0 + 0.007 * bytes[7]).toFixed(2);
  }
  else if (port === 2)
  {
    decoded.type = "downlink ack";
    decoded.sequence = (bytes[0] & 0x7F);
    decoded.accepted = ((bytes[0] & 0x80) !== 0) ? true : false;
    decoded.fwMaj = bytes[1];
    decoded.fwMin = bytes[2];
    decoded.prodId = bytes[3];
    decoded.hwRev = bytes[4];
  }
  else if (port === 4)
  {
    decoded.type = "position";
    decoded.inTrip = ((bytes[0] & 0x20) != 0);
    decoded.wifi = [];
    for (var i = 0; i < (bytes[0] & 0x1f); i++)
    {
      var rssi = bytes[1 + i * 7 + 0];
      if (rssi >= 128)
        rssi -= 256;
      var mac = PrintHex(bytes, 1 + i * 7 + 1, 6);
      decoded.wifi[i] = { rssi: rssi, mac: mac };
    }

    var navBytes = bytes.slice(1 + (bytes[0] & 0x1f) * 7);
    if (navBytes.length > 0)
    {
        decoded.nav = PrintHex(navBytes, 0, navBytes.length);
        decoded.navFields = ParseNav(navBytes);
    }
  }
  else if (port == 80)
  {
      decoded.type = "fragment start";
      decoded.dstPort = bytes[0];
  }
  else if (port == 81)
  {
      decoded.type = "fragment";
  }
  else if (port == 82)
  {
      decoded.type = "fragment end";
  }
  else
  {
    return {
      errors: ['unknown FPort'],
    };
  }

  return {
    data: decoded,
  };
}
