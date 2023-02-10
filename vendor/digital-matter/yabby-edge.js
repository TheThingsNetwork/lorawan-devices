function PrintHex(bytes, offset, length) {
  var output = "";
  for (var i = offset; i < offset + length; i++) {
    var s = bytes[i].toString(16);
    while (s.length < 2)
      s = "0" + s;
    if (output.length === 0)
      output = output + s;
    else
      output = output + s;
  }
  return output;
}

function MakeBitParser(bytes, offset, length) {
  return {
    bits: bytes.slice(offset, offset + length),
    offset: 0,
    bitLength: length * 8,
    U32LE: function U32LE(bits) {
      if (bits > 32)
        throw ("Invalid argument!");
      if (this.offset + bits > this.bitLength)
        throw ("Read past end of data!");

      var out = 0;
      var total = 0;
      while (bits > 0) {
        var byteNum = Math.floor(this.offset / 8);
        var discardLSbs = this.offset & 7;
        var avail = Math.min(8 - discardLSbs, bits);
        var extracted = (this.bits[byteNum] >>> discardLSbs);
        var masked = (extracted << (32 - avail)) >>> (32 - avail);

        out |= ((masked << total) >>> 0);
        total += avail;
        bits -= avail;
        this.offset += avail;
      }

      return out;
    },
    S32LE: function S32LE(bits) {
      return (this.U32LE(bits) << (32 - bits)) >> (32 - bits);
    }
  };
}

function decodeUplink(input) {
  var p = input.fPort;
  var b = MakeBitParser(input.bytes, 0, input.bytes.length);
  var d = {};

  if (p === 1) {
    d._type = "hello";
    d.fwMaj = b.U32LE(8);
    d.fwMin = b.U32LE(8);
    d.prodId = b.U32LE(8);
    d.hwRev = b.U32LE(8);
    d.resetPowerOn = (b.U32LE(1) !== 0);
    d.resetWatchdog = (b.U32LE(1) !== 0);
    d.resetExternal = (b.U32LE(1) !== 0);
    d.resetSoftware = (b.U32LE(1) !== 0);
    b.U32LE(4);
    d.watchdogReason = b.U32LE(16);
    d.initialBatV = Number((2.0 + 0.007 * b.U32LE(8)).toFixed(2));
    d.lrHw = b.U32LE(8);
    d.lrMaj = b.U32LE(8);
    d.lrMin = b.U32LE(8);
  } else if (p === 2) {
    d._type = "downlink ack";
    d.sequence = b.U32LE(7);
    d.accepted = (b.U32LE(1) !== 0);
    d.fwMaj = b.U32LE(8);
    d.fwMin = b.U32LE(8);
    d.prodId = b.U32LE(8);
    d.hwRev = b.U32LE(8);
    d.port = b.U32LE(8);
    d.lrHw = b.U32LE(8);
    d.lrMaj = b.U32LE(8);
    d.lrMin = b.U32LE(8);
  } else if (p === 3) {
    d._type = "stats";
    d.initialBatV = Number((2.0 + 0.007 * b.U32LE(8)).toFixed(3));
    d.BatVMax = Number((2.0 + 0.007 * b.U32LE(8)).toFixed(3));
    d.wakeupsPerTrip = b.U32LE(8);
    d.tripCount = 32 * b.U32LE(14);
    d.uptimeWeeks = b.U32LE(10);
    d.mAhUsed = 2 * b.U32LE(10);
    d.percentLora = 100 / 64 * b.U32LE(6);
    d.percentGnss = 100 / 64 * b.U32LE(6);
    d.percentWifi = 100 / 64 * b.U32LE(6);
    d.percentSleep = 100 / 64 * b.U32LE(6);
    d.percentDisch = 100 / 64 * b.U32LE(6);
    d.percentOther = 100 - d.percentLora - d.percentGnss
       - d.percentWifi - d.percentSleep - d.percentDisch;
  } else if (p === 5) {
    d._type = "location";
    wifiCount = b.U32LE(5);
    d.inTrip = (b.U32LE(1) !== 0);
    d.inactive = (b.U32LE(1) !== 0);
    b.U32LE(3);
    d.timeSet = (b.U32LE(1) !== 0);
    d.posSeq = b.U32LE(5);

    d.wifi = [];
    for (var i = 0; i < wifiCount; i++) {
      var rssi = b.bits[2 + i * 7 + 0];
      if (rssi >= 128)
        rssi -= 256;
      var mac = PrintHex(b.bits, 2 + i * 7 + 1, 6);
      d.wifi[i] = {
        rssi: rssi,
        mac: mac
      };
    }

    var navBytes = b.bits.slice(2 + wifiCount * 7);
    if (navBytes.length > 0) {
      d.nav = PrintHex(navBytes, 0, navBytes.length);
    }
  } else if (p == 89) {
    d._type = "connect";
    d.id = PrintHex(b.bits, 0, 6);
    d.devReset = ((b.bits[6] & 1) !== 0);
    d.fcntReset = ((b.bits[6] & 2) !== 0);
    d.fwMaj = b.bits[7];
    d.fwMin = b.bits[8];
    d.prodId = b.bits[9];
    d.hwRev = b.bits[10];
  } else if (p == 90) {
    d._type = "mtu advice";
    d.mtu0 = b.U32LE(6);
    d.mtu1 = b.U32LE(7);
    d.mtu2 = b.U32LE(7);
    d.mod1 = b.U32LE(4);
    d.mod2 = b.U32LE(4);
    d.mod3 = b.U32LE(4);
    d.seq = b.U32LE(16);
  } else if (p == 91) {
    d._type = "alm cookie req";
    d.baseTime = b.U32LE(16);
    d.baseCrc = "0x" + b.U32LE(16).toString(16);
    d.codeMask = b.U32LE(8);
    d.compMask = b.U32LE(8);
    d.lrHw = b.U32LE(8);
    d.lrMaj = b.U32LE(8);
    d.lrMin = b.U32LE(8);
  } else if (p == 92) {
    d._type = "alm chunk req";
    d.offset = b.U32LE(15);
    d.count = b.U32LE(13);
    d.cookie = b.U32LE(4);
  } else if ((p >= 101) && (p <= 116)) {
    d._type = "fragments";
    d.frameId = p - 101 + 16 * b.U32LE(4);
    d.total = b.U32LE(5) + 1;
    d.offset = b.U32LE(7);
    d.data = PrintHex(b.bits, 2, b.bits.length - 2);
    if (d.offset == 0) {
      d.port = b.bits[7];
      d.size = d.total * 9 - b.U32LE(4);
    }
  } else if (p == 202) {
    d._type = "time req";
    if ((b.bits.length == 6) && (b.U32LE(8) == 0x01)) {
      d.gpsTime = b.U32LE(32);
      d.token = b.U32LE(4);
      d.ansReq = (b.U32LE(1) !== 0);
    }
  } else {
    return {
      warnings: ['unknown FPort'],
    };
  }

  return {
    data: d,
  };
}
