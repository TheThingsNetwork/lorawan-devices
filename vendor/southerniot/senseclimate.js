// var directions = ['N', 'E', 'S', 'W'];
// var colors = ['red', 'green'];
// var degrees = {
//   N: 0,
//   E: 90,
//   S: 180,
//   W: 270,
// };

function decodeUplink(input) {
  switch (input.fPort) {
    case 1:
      return {
        // Decoded data
        data: {
          temperature : input.bytes[0],
          humidity : input.bytes[1]
        },
      };
    default:
      return {
        errors: ['unknown FPort'],
      };
  }
}

// function normalizeUplink(input) {
//   return {
//     // Normalized data
//     data: {
//       wind: {
//         direction: degrees[input.data.direction], // letter to degrees
//         speed: input.data.speed * 0.5144, // knots to m/s
//       },
//     },
//   };
// }

// function encodeDownlink(input) {
//   var i = colors.indexOf(input.data.led);
//   if (i === -1) {
//     return {
//       errors: ['invalid LED color'],
//     };
//   }
//   return {
//     // LoRaWAN FPort used for the downlink message
//     fPort: 2,
//     // Encoded bytes
//     bytes: [i],
//   };
// }

// function decodeDownlink(input) {
//   switch (input.fPort) {
//     case 2:
//       return {
//         // Decoded downlink (must be symmetric with encodeDownlink)
//         data: {
//           led: colors[input.bytes[0]],
//         },
//       };
//     default:
//       return {
//         errors: ['invalid FPort'],
//       };
//   }
// }
