      function decodeUplink(input)
      {
        var port =input.fport;
        var bytes = input.bytes;
        var decoded = {};
               
        if (bytes == null)
          return null;
        
        if (port === 1)
        {
          if ((bytes.length != 2) && (bytes.length != 4))
            return null;
        
          decoded.type = "status";

          decoded.inTrip = ((bytes[0] & 0x1) !== 0) ? true : false;
          decoded.batV = 2.0 + 0.014 * (bytes[0] >> 1);
          decoded.temp = -40.0 + 0.5 * bytes[1];
          if (bytes.length >= 4)
          {
            decoded.manDown = ((bytes[2] & 0x1) !== 0) ? true : false;
            decoded.inclinationDeg = (bytes[2] >> 1) * 1.5;
            decoded.azimuthDeg = bytes[3] * 1.5;
            
            // Extra derived angles
            decoded.xyz = {};
            {
              // The direction of 'down' in rectangular coordinates, unit vector.
              d = decoded.xyz.downUnit =
              [
                Math.sin(decoded.inclinationDeg * Math.PI / 180) * Math.sin(decoded.azimuthDeg * Math.PI / 180),
                Math.cos(decoded.inclinationDeg * Math.PI / 180), 
                Math.sin(decoded.inclinationDeg * Math.PI / 180) * Math.cos(decoded.azimuthDeg * Math.PI / 180),
              ];
              
              // The azimuthal angles about each axis, right-handed, in degrees.
              // You can set up triggers on these angles. These trigger angles
              // are not well defined if the inclination is within 7 degrees of
              // vertical, and will not trigger within that range.
              hypX = Math.sqrt(d[1]*d[1] + d[2]*d[2]);
              hypY = Math.sqrt(d[2]*d[2] + d[0]*d[0]);
              hypZ = Math.sqrt(d[0]*d[0] + d[1]*d[1]);
              decoded.xyz.azimuthDeg =
              [
                (hypX < 0.125) ? null : (Math.atan2(d[2], d[1]) * 180 / Math.PI),
                (hypY < 0.125) ? null : decoded.azimuthDeg,
                (hypZ < 0.125) ? null : (Math.atan2(d[1], d[0]) * 180 / Math.PI),
              ];
              if (decoded.xyz.azimuthDeg[0] < 0)
                  decoded.xyz.azimuthDeg[0] += 360;
              if (decoded.xyz.azimuthDeg[2] < 0)
                  decoded.xyz.azimuthDeg[2] += 360;
              
              // The angle between each axis and 'down', in degrees.
              // You can set up triggers on these angles.
              // They are always well defined.
              iX = 1 - ((d[0]-1)*(d[0]-1) + d[1]*d[1] + d[2]*d[2]) / 2; 
              iZ = 1 - (d[0]*d[0] + d[1]*d[1] + (d[2]-1)*(d[2]-1)) / 2;
              iX = Math.max(iX, -1);
              iX = Math.min(iX, +1);
              iZ = Math.max(iZ, -1);
              iZ = Math.min(iZ, +1);
              decoded.xyz.inclinationDeg =
              [
                Math.acos(iX) * 180 / Math.PI,
                decoded.inclinationDeg,
                Math.acos(iZ) * 180 / Math.PI,
              ];
            }
            
            // Clean up the floats for display
            decoded.batV = parseFloat(decoded.batV.toPrecision(3));
            decoded.xyz.downUnit[0] = parseFloat(decoded.xyz.downUnit[0].toPrecision(4));
            decoded.xyz.downUnit[1] = parseFloat(decoded.xyz.downUnit[1].toPrecision(4));
            decoded.xyz.downUnit[2] = parseFloat(decoded.xyz.downUnit[2].toPrecision(4));
            if (decoded.xyz.azimuthDeg[0] !== null)
              decoded.xyz.azimuthDeg[0] = parseFloat(decoded.xyz.azimuthDeg[0].toPrecision(4));
            if (decoded.xyz.azimuthDeg[2] !== null)
              decoded.xyz.azimuthDeg[2] = parseFloat(decoded.xyz.azimuthDeg[2].toPrecision(4));
            decoded.xyz.inclinationDeg[0] = parseFloat(decoded.xyz.inclinationDeg[0].toPrecision(4));
            decoded.xyz.inclinationDeg[2] = parseFloat(decoded.xyz.inclinationDeg[2].toPrecision(4));
          }
          else
          {
            decoded.manDown = null;
            decoded.inclinationDeg = null;
            decoded.azimuthDeg = null;
            decoded.xyz = null;
          }
        }
        else if (port === 2)
        {
          if (bytes.length != 3)
            return null;
            
          decoded.type = "downlink ack";
          
          decoded.sequence = (bytes[0] & 0x7F);
          decoded.accepted = ((bytes[0] & 0x80) !== 0) ? true : false;
          decoded.fwMaj = bytes[1];
          decoded.fwMin = bytes[2];
        }
        else if (port === 3)
        {
          if (bytes.length != 7)
            return null;
            
          decoded.type = "stats";

          decoded.initialBatV = 2.0 + 0.014 * (bytes[0] & 0x7F);
          decoded.uptimeWeeks = (bytes[0] >> 7) + bytes[1] * 2;
          decoded.txCount = 32 * (bytes[2] + bytes[3] * 256);
          decoded.tripCount = 32 * (bytes[4] + bytes[5] * 256);
          decoded.wakeupsPerTrip = bytes[6];
          
          // Clean up the floats for display
          decoded.initialBatV = parseFloat(decoded.initialBatV.toPrecision(3));
        }
        else if (port === 4)
        {
          if (bytes.length != 8)
            return null;
            
          decoded.type = "rtc request";

          decoded.wasSet = ((bytes[0] & 0x01) !== 0) ? true : false;
          decoded.cookie = (bytes[0] + bytes[1] * 256 + bytes[2] * 65536 + bytes[3] * 16777216) >>> 1;

          // seconds since 2013-01-01
          decoded.timestamp = bytes[4] + bytes[5] * 256 + bytes[6] * 65536 + bytes[7] * 16777216;

          // Date() takes milliseconds since 1970-01-01
          decoded.time = (new Date((decoded.timestamp + 1356998400) * 1000)).toUTCString();
        }
        
        return{
          data: decoded,
        }
      }
    