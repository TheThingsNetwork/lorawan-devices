function decodeUplink(input)
{
  var port = input.fPort;
  var bytes = input.bytes;
  var decoded = {};
  var location = {};
  var warnings = [];

  if (port === 1)
  {
    decoded.type = "position";

    decoded.inTrip    = ((bytes[8] & 0x1) !== 0);
    decoded.fixFailed = ((bytes[8] & 0x2) !== 0);
    decoded.batV = Number((bytes[10] * 0.025).toFixed(2));

    decoded.manDown = null;

    location.latitudeDeg = bytes[0] +
                           bytes[1] * 256 +
                           bytes[2] * 65536 +
                           bytes[3] * 16777216;
    if (location.latitudeDeg >= 0x80000000) { // 2^31
      location.latitudeDeg -= 0x100000000;  // 2^32
    }
    location.latitudeDeg /= 1e7;

    location.longitudeDeg = bytes[4] +
                            bytes[5] * 256 +
                            bytes[6] * 65536 +
                            bytes[7] * 16777216;
    if (location.longitudeDeg >= 0x80000000) { // 2^31
      location.longitudeDeg -= 0x100000000;  // 2^32
    }
    location.longitudeDeg /= 1e7;
    
    location.headingDeg = (bytes[8] >> 2) * 5.625;
    location.speedKmph = bytes[9];

    if (decoded.fixFailed) {
      decoded.cached = location;
      warnings.push("fix failed");
    } else {
      decoded = Object.assign(decoded, location);
    }
  }
  else if (port === 4)
  {
    decoded.type = "position";

    decoded.batV = Number((bytes[7] * 0.025).toFixed(2));

    decoded.inTrip    = ((bytes[8] & 0x1) !== 0);
    decoded.fixFailed = ((bytes[8] & 0x2) !== 0);
    decoded.manDown   = ((bytes[8] & 0x4) !== 0);

    location.latitudeDeg = bytes[0] + 
                           bytes[1] * 256 + 
                           bytes[2] * 65536;
    if (location.latitudeDeg >= 0x800000) { // 2^23
      location.latitudeDeg -= 0x1000000;  // 2^24
    }
    location.latitudeDeg *= 256e-7;

    location.longitudeDeg = bytes[3] +
                            bytes[4] * 256 +
                            bytes[5] * 65536;
    if (location.longitudeDeg >= 0x800000) { // 2^23
      location.longitudeDeg -= 0x1000000;  // 2^24
    }
    location.longitudeDeg *= 256e-7;

    location.headingDeg = (bytes[6] & 0x7) * 45;
    location.speedKmph = (bytes[6] >> 3) * 5;

    if (decoded.fixFailed) {
      decoded.cached = location;
      warnings.push("fix failed");
    } else {
      decoded = Object.assign(decoded, location);
    }
  }
  else if (port === 2)
  {
    decoded.type = "downlink ack";

    decoded.sequence = (bytes[0] & 0x7F);
    decoded.accepted = ((bytes[0] & 0x80) !== 0);
    decoded.fwMaj = bytes[1];
    decoded.fwMin = bytes[2];
  }
  else if (port === 3)
  {
    decoded.type = "stats";

    decoded.initialBatV    =  Number((4.0 + 0.100 * (bytes[0] & 0xF)).toFixed(1));
    decoded.txCount        =  32 * ((bytes[0] >> 4) + (bytes[1]  & 0x7F) *  16);
    decoded.tripCount      =  32 * ((bytes[1] >> 7) + (bytes[2]  & 0xFF) *   2
                                                    + (bytes[3]  & 0x0F) * 512);
    decoded.gpsSuccesses   =  32 * ((bytes[3] >> 4) + (bytes[4]  & 0x3F) *  16);
    decoded.gpsFails       =  32 * ((bytes[4] >> 6) + (bytes[5]  & 0x3F) *   4);
    decoded.aveGpsFixS     =   1 * ((bytes[5] >> 6) + (bytes[6]  & 0x7F) *   4);
    decoded.aveGpsFailS    =   1 * ((bytes[6] >> 7) + (bytes[7]  & 0xFF) *   2);
    decoded.aveGpsFreshenS =   1 * ((bytes[7] >> 8) + (bytes[8]  & 0xFF) *   1);
    decoded.wakeupsPerTrip =   1 * ((bytes[8] >> 8) + (bytes[9]  & 0x7F) *   1);
    decoded.uptimeWeeks    =   1 * ((bytes[9] >> 7) + (bytes[10] & 0xFF) *   2);
  }
  else
  {
    return {
      errors: ['unknown FPort'],
    };
  }

  return {
    data: decoded,
    warnings: warnings,
  };
}
