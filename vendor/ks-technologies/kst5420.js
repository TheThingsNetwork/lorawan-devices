/*
Example Payload:
00 88 0A 05 F3 71 F0 06 17 03 72 EE 03 01 09 01 3C 00 78 02 11 46 01 10 01 06
    0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25

Decoded Payload:
* Key (Data Type): 0x0088 = GPS
* Length: 0x0A = 10 bytes
* Latitude: 0x05F371 = 39.0001°
* Longitude: 0xF00617 = -104.7016°
* Altitude: 0x0372EE = 2260.30 meters
* Accuracy: 0x03 = 3 meters
* Key (Data Type): 0x0109 = Speed
* Length: 0x01 = 1 byte
* Speed: 0x3C = 60 mph
* Key (Data Type): 0x0078 = Battery
* Length: 0x02 = 2 bytes
* Battery: 0x1146 = 4,422mV/4.422V
* Key (Data Type): 0x0110 = Tx Power
* Length: 0x01 = 1 byte
* Tx Power: 0x06 = +20dBm
    * 0x00 = -10dBm
    * 0x01 = -5dBm
    * 0x02 = +0dBm
    * 0x03 = +5dBm
    * 0x04 = +10dBm
    * 0x05 = +15dBm
    * 0x06 = +20dBm
*/

function decodeUplink(input) {

  // Get the incoming bytes
  var bytes = input.bytes;

  // GPS
  var lat = bytes[3] << 16 | bytes[4] << 8 | bytes[5];
  if (lat > 0x80000) {
    lat -= 0xFFFFFF;
  }
  var latitude = lat / 10000;

  var lng = bytes[6] << 16 | bytes[7] << 8 | bytes[8];
  if (lng > 0x80000) {
    lng -= 0xFFFFFF;
  }
  var longitude = lng / 10000;

  var alt = bytes[9] << 16 | bytes[10] << 8 | bytes[11];
  var altitude = alt / 100 | 0;

  var accuracy = bytes[12];

  // Speed
  var speed = bytes[16];

  // Battery
  var batteryValue = ((bytes[20] & 0x00FF) << 8) | (bytes[21] & 0x00FF);
  var battery = batteryValue / 1000;

  // Tx Power
  var txPower = bytes[25];
  if (txPower == 0x00) {
    txPowerdBm = "-10";
  }
  if (txPower == 0x01) {
    txPowerdBm = "-5";
  }
  if (txPower == 0x02) {
    txPowerdBm = "0";
  }
  if (txPower == 0x03) {
    txPowerdBm = "+5";
  }
  if (txPower == 0x04) {
    txPowerdBm = "+10";
  }
  if (txPower == 0x05) {
    txPowerdBm = "+15";
  }
  if (txPower == 0x06) {
    txPowerdBm = "+20";
  }

  return {
    data: {
      latitude: latitude,
      longitude: longitude,
      altitude: altitude,
      accuracy: accuracy,
      speed: speed,
      battery: battery,
      txPower: txPowerdBm
    }
  };
}
