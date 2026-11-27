
var lrs20uxx_events = ['heartbeat/button', 'rsvd', 'distance_hi', 'distance_lo', 'rsvd', 'rsvd', 'rsvd', 'rsvd'];

function decodeUplink(input) {
  switch (input.fPort) {
    case 10: // sensor data
      switch (input.bytes[0]) {
        case 12:
          var evt="";
          for (var i=0; i<8; i++) {
            if ((0x01<<i)&input.bytes[1])
              if (evt==="")
                evt=lrs20uxx_events[i];
              else
                evt=evt+","+lrs20uxx_events[i];
          }
          return {
            data: {
              event: evt,
              battery: input.bytes[2],
              distance: (input.bytes[3]<<8 | input.bytes[4])/10,
              state: input.bytes[5]
            }
          };
        default:
          return {
            errors: ['unknown sensor type']
          };
      }
      break;
    case 8: // version
      var ver = input.bytes[0]+"."+("00"+input.bytes[1]).slice(-2)+"."+("000"+(input.bytes[2]<<8|input.bytes[3])).slice(-3);
      return {
        data: {
          firmwareVersion: ver
        }
      };
    case 9: // version, battery & uplink count
      var ver = input.bytes[0]+"."+("00"+input.bytes[1]).slice(-2)+"."+("000"+(input.bytes[2]<<8|input.bytes[3])).slice(-3);
      return {
        data: {
          firmwareVersion: ver,
          batteryLevel: input.bytes[4]<<8|input.bytes[5],
          batteryPercentage: input.bytes[6],
          uplinkCount: input.bytes[7]<<24|input.bytes[8]<<16|input.bytes[9]<<8|input.bytes[10]
        }
      };
    case 12: // device settings
      switch (input.bytes[0]) {
        case 12:
          return {
            data: {
              dataUploadInterval: input.bytes[1]<<8|input.bytes[2]
            }
          };
        default:
          return {
            errors: ['unknown sensor type']
          };
      }
      break;
    case 13: // threshold settings
      switch (input.bytes[0]) {
        case 12:
          return {
            data: {
              distanceHighThreshold: (input.bytes[1]<<8 | input.bytes[2])/10,
              distanceLowThreshold: (input.bytes[3]<<8 | input.bytes[4])/10
            }
          };
        default:
          return {
            errors: ['unknown sensor type']
          };
      }
      break;
    default:
      return {
        errors: ['unknown FPort']
      };
  }
}

