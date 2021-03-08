function decodeUplink(input)
{
  var port = input.fPort;
  var bytes = input.bytes;
  var decoded = {};
  var fourStr = bytes.join("");
  if (port === 1)
  {
    decoded.type = "Device Information Packet";
    decoded.macversion = ( bytes[0] - ( bytes[0] % 16 ) ) / 16;  //if equal to 3, the mac version is 1.0.3 ; if equal to 4, the mac version is 1.0.4 ;
    decoded.firmwareversion = ( bytes[0] % 16 ) * 100 + ( ( ( bytes[1] - ( bytes[1] % 16 ) ) / 16 ) *10 ) + bytes[1] % 16 ; 
    // if equal to 101 ,the firmware version is 1.0.1 ; if equal to 231, the firmware version is 2.3.1 .
    decoded.devicestatus = bytes[2] ; 
    //Convert to binary ,0 is unmormal ,1 is normal, from the right to left ,the 1st bit is GPS hardware status ,the 2nd bit is Temperature sensor hardware status
    //the 3rd bit is barometer hardware status, the 4th bit is accelerometer hardware status,the 5th bit is buzzer hardware status, the 6h bit is GPS enable switch ; 
    //If the 7th bit is 0 ,the device is on moving mode,if the 7th is 1 ,the device is on timing reporting mode.

    decoded.batterylevel = bytes[3]/100 ; //  IF equal to 0.55, means the battery level is 55%.
    decoded.temperature = ( ( bytes[4] * 256 + bytes[5] ) -4500 ) / 100; // the unit is ℃
    decoded.humidity = ( bytes[6] * 256 + bytes[7] ) / 100;  
    decoded.barometer =  ( ( bytes[8] * 65536 ) + ( bytes[9] * 256 ) + bytes[10] ) / 10; // the unit is pa
  }
  else if (port === 2)
  {
    decoded.tyep = "Device Status packet";
    decoded.timeyear = bytes[0] * 256 + bytes[1];
    decoded.timemonth = bytes[2];
    decoded.timeday = bytes[3]; 
    decoded.timehour = bytes[4];
    decoded.timeminute = bytes[5];
    decoded.timesecond = bytes[6]; 
    decoded.batterylevel = bytes[7]/100; // IF equal to 0.55, means the battery level is 55%.
    decoded.ldlestatus = bytes[8]; // If equal to 1 , the device is ldle; if equal to 2, the device is not ldle
    decoded.motionstate = bytes[9]; 
    // If equal to 1, this payload is the 1st paylaod when the device start noving; If equal to 2 , the device is moving, If equal to 3, the device is static.
  }
  else if (port === 3)
  {
    decoded.type = "Gps Position Packet";
    decoded.gpsfixmode = bytes[0];  //if decoded.gps-fix-mode = 2 ,means the fix-mode is 2D,if decoded.gps-fix-mode = 3,means the fix-mode is 3D
    // var a = "BE991597";
    //var b = parseInt(a,16);
    //var s = b&0x80000000/0x80000000;
    //var e = (b&0x7f800000)/0x800000-127;
    //var c = (b&0x7fffff)/0x800000;
    //var re = Math.pow(-1,s)*(1+c)*Math.pow(2,e);
    // document.write(re.toString(10));
    fourStr = fourStr.substring(2,10);
    decoded.longitude = HexToSingle(fourStr);
    fourStr = fourStr.substring(10,18);
    decoded.latitude = HexToSingle(fourStr);
    if ( ( byte[11] % 16 ) == 0 )
    {
      decoded.altitude = ( (bytes[9] * 256 + bytes[10])*10+( bytes[11] - ( byte[11] % 16 ) ) / 16) / 10; // the unit is meter
    }
    else 
    {
      decoded.altitude = 0 - ( (bytes[9] * 256 + bytes[10])*10+( bytes[11] - ( byte[11] % 16 ) ) / 16) / 10; // the unit is meter
    }
    decoded.altitude = (bytes[9] * 65536 + bytes[10] * 256 + bytes[11]) / 10; // the unit is meter
    decoded.pdop = bytes[12] % 16; //PDOP
    decoded.satellitesnumber = ( bytes[12] - (bytes[12] % 16) )/16; // the current numbers of satellites 
    decoded.temperature = ( ( bytes[13] * 256 + bytes[14] ) -4500 ) / 100; // the unit is ℃
  }
  else if (port === 4)
  {
    decoded.tyep = "Beacons Packet";
    decoded.timeyear1st = bytes[0] * 256 + bytes[1];
    decoded.timemonth1st = bytes[2];
    decoded.timeday1st = bytes[3]; 
    decoded.timehour1st = bytes[4];
    decoded.timeminute1st = bytes[5];
    decoded.timesecond1st = bytes[6]; 
    decoded.beaconmac1st  = fourStr.substring(14,26);
    decoded.beaconrssi1st = bytes[13] - 256;
    decoded.timeyear2nd = bytes[14] * 256 + bytes[15];
    decoded.timemonth2nd = bytes[16];
    decoded.timeday2nd = bytes[17]; 
    decoded.timehour2nd = bytes[18];
    decoded.timeminute2nd = bytes[19];
    decoded.timesecond2nd = bytes[20]; 
    decoded.beaconmac2nd  = fourStr.substring(42,54);
    decoded.beaconrssi2nd = bytes[27] - 256;
    decoded.timeyear3rd = bytes[28] * 256 + bytes[29];
    decoded.timemonth3rd = bytes[30];
    decoded.timeday3rd = bytes[31]; 
    decoded.timehour3rd = bytes[32];
    decoded.timeminute3rd = bytes[33];
    decoded.timesecond3rd = bytes[34]; 
    decoded.beaconmac3rd  = fourStr.substring(70,82);
    decoded.beaconrssi3rd = bytes[41] - 256;
    decoded.timeyear4th = bytes[42] * 256 + bytes[43];
    decoded.timemonth4th = bytes[44];
    decoded.timeday4th = bytes[45]; 
    decoded.timehour4th = bytes[46];
    decoded.timeminute4th = bytes[47];
    decoded.timesecond4th = bytes[48]; 
    decoded.beaconmac4th  = fourStr.substring(98,110);
    decoded.beaconrssi4th = bytes[55] - 256;
  }
  else if (port === 5)
  {
    decoded.type = "SOS Packet";
    decoded.timeyear = bytes[0] * 256 + bytes[1];
    decoded.timemonth = bytes[2];
    decoded.timeday = bytes[3]; 
    decoded.timehour = bytes[4];
    decoded.timeminute = bytes[5];
    decoded.timesecond = bytes[6]; 
    decoded.speedkmph = bytes[7] * 256 + bytes[8] ;
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

//
//GPS data conversion
function HexToSingle(t) {
  t = t.replace(/\s+/g, "");
  if (t == "") {
      return "";
  }
  if (t == "00000000") {
      return "0";
  }
  if ((t.length > 8) || (isNaN(parseInt(t, 16)))) {
      return "Error";
  }
  if (t.length < 8) {
      t = FillString(t, "0", 8, true);
  }
  t = parseInt(t, 16).toString(2);
  t = FillString(t, "0", 32, true);
  var s = t.substring(0, 1);
  var e = t.substring(1, 9);
  var m = t.substring(9);
  e = parseInt(e, 2) - 127;
  m = "1" + m;
  if (e >= 0) {
      m = m.substr(0, e + 1) + "." + m.substring(e + 1)
  } else {
      m = "0." + FillString(m, "0", m.length - e - 1, true)
  }
  if (m.indexOf(".") == -1) {
      m = m + ".0";
  }
  var a = m.split(".");
  var mi = parseInt(a[0], 2);
  var mf = 0;
  for (var i = 0; i < a[1].length; i++) {
      mf += parseFloat(a[1].charAt(i)) * Math.pow(2, -(i + 1));
  }
  m = parseInt(mi) + parseFloat(mf);
  if (s == 1) {
      m = 0 - m;
  }
  return Math.round(m *10000)/10000;
}

function FillString(t, c, n, b) {
  if ((t == "") || (c.length != 1) || (n <= t.length)) {
      return t;
  }
  var l = t.length;
  for (var i = 0; i < n - l; i++) {
      if (b == true) {
          t = c + t;
      }
      else {
          t += c;
      }
  }
  return t;
}          //GPS data conversion
//