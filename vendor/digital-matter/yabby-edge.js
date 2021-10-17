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
      var constellation = GetU32LE(p, 4);
      var count = GetU32LE(p, 4);

      for (var i = 0; i < count; i++)
      {
          var sat = {};

          sat.id = DecodeSatId(GetU32LE(p, 7));
          sat.cno = 45 - 4 * GetU32LE(p, 2);

          var fHas8BitA = GetU32LE(p, 1);
          var fHasBitChange = GetU32LE(p, 1);
          var fBadDoppler = GetU32LE(p, 1);
          var fHasDoppler = GetU32LE(p, 1);
          var fHas19BitC = GetU32LE(p, 1);
          var fHasPsuedoRange = GetU32LE(p, 1);

          if (fHasPsuedoRange)
              sat.psuedoRangeNs = GetU32LE(p, 19) * 3;
          if (fHas19BitC)
              sat.c19 = GetU32LE(p, 19);
          if (fHasDoppler)
              sat.dopplerHz = GetS32LE(p, 15);
          if (fBadDoppler)
              sat.fBadDoppler = true;
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
  var p = input.fPort;
  var b = input.bytes;
  var d = {};

  if (p === 1)
  {
    d.type = "hello";
    d.fwMaj = b[0];
    d.fwMin = b[1];
    d.prodId = b[2];
    d.hwRev = b[3];
    d.resetPowerOn  = ((b[4] & 1) != 0);
    d.resetWatchdog = ((b[4] & 2) != 0);
    d.resetExternal = ((b[4] & 4) != 0);
    d.resetSoftware = ((b[4] & 8) != 0);
    d.watchdogReason = b[5] + b[6] * 256;
    d.initialBatV = Number((2.0 + 0.007 * b[7]).toFixed(2));
    d.lrHw = b[8];
    d.lrMaj = b[9];
    d.lrMin = b[10];
  }
  else if (p === 2)
  {
    d.type = "downlink ack";
    d.sequence = (b[0] & 0x7F);
    d.accepted = ((b[0] & 0x80) !== 0) ? true : false;
    d.fwMaj = b[1];
    d.fwMin = b[2];
    d.prodId = b[3];
    d.hwRev = b[4];
    d.port = b[5];
    d.lrHw = b[6];
    d.lrMaj = b[7];
    d.lrMin = b[8];
  }
  else if (p === 3)
  {
    var p = MakeBitParser(b, 0, b.length);
    d.type = "stats";
    
    d.initialBatV = Number((2.0 + 0.007 * GetU32LE(p, 8)).toFixed(3));
    d.BatVMax = Number((2.0 + 0.007 * GetU32LE(p, 8)).toFixed(3));
    d.wakeupsPerTrip = GetU32LE(p, 8);
    d.tripCount = 32 * GetU32LE(p, 14);
    d.uptimeWeeks = GetU32LE(p, 10);
    d.mAhUsed = 2 * GetU32LE(p, 10);
    d.percentLora = 100/64 * GetU32LE(p, 6);
    d.percentGnss = 100/64 * GetU32LE(p, 6);
    d.percentWifi = 100/64 * GetU32LE(p, 6);
    d.percentSleep = 100/64 * GetU32LE(p, 6);
    d.percentDisch = 100/64 * GetU32LE(p, 6);
    d.percentOther = 100 - d.percentLora - d.percentGnss
        - d.percentWifi - d.percentSleep - d.percentDisch;
  }
  else if (p === 5)
  {
    d.type = "location";
    wifiCount = b[0] & 0x1f;
    d.inTrip = ((b[0] & 0x20) != 0);
    d.inactive = ((b[0] & 0x40) != 0);
    d.timeSet = ((b[1] & 0x04) != 0);
    d.posSeq = b[1] >> 3;
    
    d.wifi = [];
    for (var i = 0; i < wifiCount; i++)
    {
      var rssi = b[2 + i * 7 + 0];
      if (rssi >= 128)
        rssi -= 256;
      var mac = PrintHex(b, 2 + i * 7 + 1, 6);
      d.wifi[i] = { rssi: rssi, mac: mac };
    }

    var navBytes = b.slice(2 + wifiCount * 7);
    if (navBytes.length > 0)
    {
        d.nav = PrintHex(navBytes, 0, navBytes.length);
        d.navFields = ParseNav(navBytes);
    }
  }
  else if (p == 89)
  {
      d.type = "connect";
      d.id = PrintHex(b, 0, 6);
      d.devReset = ((b[6] & 1) != 0);
      d.fcntReset = ((b[6] & 2) != 0);
      d.fwMaj = b[7];
      d.fwMin = b[8];
      d.prodId = b[9];
      d.hwRev = b[10];
  }
  else if (p == 90)
  {
      var p = MakeBitParser(b, 0, b.length);
      d.type = "mtu advice";
      d.mtu0 = GetU32LE(p, 6);
      d.mtu1 = GetU32LE(p, 7);
      d.mtu2 = GetU32LE(p, 7);
      d.mod1 = GetU32LE(p, 4);
      d.mod2 = GetU32LE(p, 4);
      d.mod3 = GetU32LE(p, 4);
      d.seq = GetU32LE(p, 16);
  }
  else if (p == 91)
  {
      d.type = "alm cookie req";
      d.baseTime = b[0] + 256 * b[1];
      d.baseCrc = PrintHex(b, 2, 2);
      d.codeMask = b[4];
      d.compMask = b[5];
      d.lrHw = b[6];
      d.lrMaj = b[7];
      d.lrMin = b[8];
  }
  else if (p == 92)
  {
      d.type = "alm chunk req";
      d.offset = b[0] + 256 * (b[1] & 0x7F);
      d.count = (b[1] >> 7) + 2 * b[2] + 512 * (b[3] & 0xF);
      d.cookie = b[3] >> 4;
  }
  else if ((p >= 101) && (p <= 116))
  {
      d.type = "fragments";
      d.frameId = p - 101 + 16 * (b[0] & 0xF);
      d.total = (b[0] >> 4) + 16 * (b[1] & 1) + 1;
      d.offset = b[1] >> 1;
      d.data = PrintHex(b, 2, b.length - 2);
      if (d.offset == 0)
      {
          d.port = b[7];
          d.size = d.total * 9 - (b[2] & 0xF);
      }
  }
  else if (p == 202)
  {
      d.type = "time req";
      if ((b.length == 6) && (b[0] == 0x01))
      {
          d.gpsTime = b[1] + 256 * b[2] + 65536 * b[3] + 16777216 * b[4];
          d.token = b[5] & 0xF;
          d.ansReq = ((b[5] & 0x10) != 0);
      }
  }
  else
  {
    return {
      warnings: ['unknown FPort'],
    };
  }

  return {
    data: d,
  };
}
