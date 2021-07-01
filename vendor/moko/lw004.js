function decodeUplink(input)
{
  var port = input.fPort;
  var bytes = input.bytes;
  var decoded = {};
  var fourStr = bytes.join("");
  if (port === 1)
  {
    if (bytes[0] == 0)
    {
      decoded.type = "non-distance alarm packet";
      decoded.batterylevel = bytes[1]/100;
      decoded.timeyear = bytes[2] * 256 + bytes[3];
      decoded.timemonth = bytes[4];
      decoded.timeday = bytes[5]; 
      decoded.timehour = bytes[6];
      decoded.timeminute = bytes[7];
      decoded.timesecond = bytes[8];  
      decoded.hostmac = fourStr.substring(18,30);
      decoded.trackermac  = fourStr.substring(30,42);
      decoded.trackerrssi =  bytes[21] - 256;
      decoded.lcoation1stmac = fourStr.substring(44,56);
      decoded.lcoation1strssi = bytes[28] - 256;
      decoded.lcoation2ndmac = fourStr.substring(58,70);
      decoded.lcoation2ndrssi = bytes[35] - 256;
      decoded.location3rdmac = fourStr.substring(72,84);
      decoded.location3rdrssi = bytes[42] - 256;
      decoded.location4thmac = fourStr.substring(86,98);
      decoded.location4thrssi = bytes[49] - 256;
      decoded.trackerrawdata = fourStr.substring(100,162);
    }
    else if (bytes[0] == 1)
    {
      decoded.type = "distance alarm packet";
      decoded.batterylevel = bytes[1]/100;
      decoded.timeyear = bytes[2] * 256 + bytes[3];
      decoded.timemonth = bytes[4];
      decoded.timeday = bytes[5]; 
      decoded.timehour = bytes[6];
      decoded.timeminute = bytes[7];
      decoded.timesecond = bytes[8];  
      decoded.hostmac = fourStr.substring(18,30);
      decoded.trackermac  = fourStr.substring(30,42);
      decoded.trackerrssi =  bytes[21] - 256;
      decoded.lcoation1stmac = fourStr.substring(44,56);
      decoded.lcoation1strssi = bytes[28] - 256;
      decoded.lcoation2ndmac = fourStr.substring(58,70);
      decoded.lcoation2ndrssi = bytes[35] - 256;
      decoded.location3rdmac = fourStr.substring(72,84);
      decoded.location3rdrssi = bytes[42] - 256;
      decoded.location4thmac = fourStr.substring(86,98);
      decoded.location4thrssi = bytes[49] - 256;
      decoded.trackerrawdata = fourStr.substring(100,162)
    }
    else if (bytes[0] == 2)
    {
      decoded.type = "device information packet";
      decoded.batterylevel = bytes[1]/100;
      decoded.sosswitch = bytes[2];
      decoded.hostmac = fourStr.substring(6,18);
      decoded.firmwareversion = ((( bytes[9] - (bytes[9] % 16) ) / 16 ) *1000) +( (bytes[9] % 16) *100)+ bytes[10] ;// if equal to 2109, the version is 2.1.09
    }
    else if (bytes[0] == 3)
    {
      decoded.tyep = "3-axis packet";
      decoded.timeyear = bytes[1] * 256 + bytes[2];
      decoded.timemonth = bytes[3];
      decoded.timeday = bytes[4]; 
      decoded.timehour = bytes[5];
      decoded.timeminute = bytes[6];
      decoded.timesecond = bytes[7];
      decoded.hostmac = fourStr.substring(16,28);
      decoded.Xaxis = ( bytes[14] * 256 + bytes[15] ) / 100;           //the unit  is  °
      decoded.Yaxis = ( bytes[16] * 256 + bytes[17] ) / 100;           //the unit  is  °
      decoded.Zaxis = ( bytes[18] * 256 + bytes[19] ) / 100;           //the unit  is  °
    }
    else if (bytes[0] == 4)
    {
      decoded.type = "GPS data packet";
      decoded.timeyear = bytes[1] * 256 + bytes[2];
      decoded.timemonth = bytes[3];
      decoded.timeday = bytes[4]; 
      decoded.timehour = bytes[5];
      decoded.timeminute = bytes[6];
      decoded.timesecond = bytes[7];
      fourStr = fourStr.substring(16,24);
      decoded.longitude = HexToSingle(fourStr);
      fourStr = fourStr.substring(24,32);
      decoded.latitude = HexToSingle(fourStr);
      if ( ( byte[18] % 16 ) == 0 )
      {
        decoded.altitude = ( (bytes[16] * 256 + bytes[17])*10+( bytes[18] - ( byte[18] % 16 ) ) / 16) / 10; // the unit is meter
      }
      else 
      {
        decoded.altitude = 0 - ( (bytes[16] * 256 + bytes[17])*10+( bytes[18] - ( byte[18] % 16 ) ) / 16) / 10; // the unit is meter
      }
      decoded.pdop = bytes[19];
      decoded.fixmode = ( bytes[20] - ( byte[20] % 16 ) ) / 16; //if decoded.gps-fix-mode = 2 ,means the fix-mode is 2D,if decoded.gps-fix-mode = 3,means the fix-mode is 3D
      decoded.satellitesnumber =  byte[20] % 16;
    }
    else if (bytes[0] == 5)
    {
      decoded.type = "SOS data packet";
      decoded.batterylevel = bytes[1];
      decoded.timeyear = bytes[2] * 256 + bytes[3];
      decoded.timemonth = bytes[4];
      decoded.timeday = bytes[5]; 
      decoded.timehour = bytes[6];
      decoded.timeminute = bytes[7];
      decoded.timesecond = bytes[8];
      decoded.hostmac = fourStr.substring(18,30);
      fourStr = fourStr.substring(30,38);
      decoded.longitude = HexToSingle(fourStr);
      fourStr = fourStr.substring(38,46);
      decoded.latitude = HexToSingle(fourStr);
      decoded.trackermac = fourStr.substring(46,58);
      decoded.trackerrssi = bytes[29] - 256 ;
      decoded.beaconmac1st  = fourStr.substring(60,72);
      decoded.beaconrssi1st = bytes[36] - 256;
      decoded.beaconmac2nd  = fourStr.substring(74,86);
      decoded.beaconrssi2nd = bytes[43] - 256;
      decoded.beaconmac3rd  = fourStr.substring(88,100);
      decoded.beaconrssi3rd = bytes[50] - 256;4
      decoded.beaconmac4th  = fourStr.substring(102,114);
      decoded.beaconrssi4th = bytes[57] - 256;
    }
      
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