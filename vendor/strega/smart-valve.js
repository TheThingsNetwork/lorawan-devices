//Decoder Rev4 updated on 24th Jan 2021
function decodeUplink(bytes, f_port) {
  var ports    = f_port;
  var v4       = toHexString(bytes);
  var v4_1     = v4.substr(10,2);
  var v4_2     = v4.substr(0,2);
  var v4_3     = v4.substr(0,1);
  var v4_4     = v4.substr(20,2);
  var v4_5     = v4.substr(34,2);
  var v4_6     = v4.substr(10,2);
  var v4_7     = v4.substr(24,2);
  var v4_8     = v4.substr(10,2);
  var v4_9     = v4.substr(20,2);
  var v4_10    = v4.substr(0,2);
  var v3       = v4.substr(8,1);
  var length   = v4.length;
  var battery; var Tamper; var Valve; var status; var Cable; var conf_p;var conf_s; var unit1; var time1;
  var unit2; var time2; var temperature; var hygrometry; var DI_0; var DI_1; var Leakage; var Fraud;
  var clas; var power; var radio; var ADR; var DR; var SF; var T_H; var temp; var box_temp; var hum;
  var box_hum; var analog; var counter; var msg; var C; var V; var C_A; var msg1; var st; var st1; var st2;
  var st_0; var st_1; var st_2; var counter_A; var analog_A;  
  // Battery operated V3 & V4 & Class A with full payload (Tem,Hum,Counter & Analog)
  if (v4_3 == "3"){
  msg          = String.fromCharCode.apply(null, bytes);
  st2          = hex2bin(v4_2);
  clas         = st2.substr(0,1);
  power        = st2.substr(1,1);
  var bat      = msg.substr(0,4);
  battery      = Math.round((bat-2000)/16);
  st_0         = v4.substr(8,2);
  st_1         = st_0.substr(0,1)-3; 
  st_2         = st_0.substr(1,1);
  st           = st_1+st_2;
  st1          = hex2bin(st);
  status       = pad(st1,8);
  Valve        = status.substr(7,1);
  Tamper       = status.substr(6,1);
  Cable        = status.substr(5,1);
  DI_0         = status.substr(4,1);
  DI_1         = status.substr(3,1);
  Leakage      = status.substr(2,1);
  Fraud        = status.substr(1,1);
  // condition for ACK payload
  if (v4_1 == "40"){
  msg1         = hex2a(v4.substr(10,100));
  conf_p       = parseInt(msg1.substr(1,2), 16);
  conf_s       = msg1.substr(3,2);
  unit1        = msg1.substr(3,2);
  time1        = parseInt(msg1.substr(5,2),16);
  unit2        = msg1.substr(7,2);
  time2        = parseInt(msg1.substr(9,2),16);
  radio        = pad(hex2bin(msg1.substr(3,2)),8);
  ADR          = parseInt(radio.substr(0,1),2);
  DR           = parseInt(radio.substr(1,3),2);
  SF           = parseInt(radio.substr(4,4),2);
  counter_A    = parseInt(msg1.substr(3,6), 16);
  analog_A     = parseInt(msg1.substr(3,4), 16);
}
  //condition for payload with temp, hum, counter & analog
  if (v4_1 == "23"){
  T_H          = v4.substr(12,8);
  temp         = T_H.substr(0,4);
  box_temp     = parseInt((temp), 16);
  temperature  = (((box_temp/65536)*165)-40);
  hum          = T_H.substr(4,8);
  box_hum      = parseInt((hum), 16);
  hygrometry   = ((box_hum/65536)*100);
  C_A          = v4.substr(20,50);
  msg2         = hex2a(C_A);
  C            = msg2.search("C");
  counter      = parseInt(msg2.substr(C+1,6),16);
  V            = msg2.search("V");
  analog       = parseInt(msg2.substr(V+1,4),16);
  }
  else{
  C_A          = v4.substr(10,50);
  msg1         = hex2a(C_A);
  C            = msg1.search("C");
  counter      = parseInt(msg1.substr(C+1,6),16);
  V            = msg1.search("V");
  analog       = parseInt(msg1.substr(V+1,4),16);
  }}
  // Externally power V4 & Class A with full payload (Tem,Hum,Counter & Analog)
  if (v4_3 == "7" || v4_3 == "F" || v4_3 == "f"){
  msg          = String.fromCharCode.apply(1, bytes);
  st2          = hex2bin(v4_2);
  clas         = st2.substr(0,1);
  power        = st2.substr(1,1);
  st_0         = v4.substr(8,2);
  st_1         = st_0.substr(0,1)-3; 
  st_2         = st_0.substr(1,1);
  st           = st_1+st_2;
  st1          = hex2bin(st);
  status       = pad(st1,8);
  Valve        = status.substr(7,1);
  Tamper       = status.substr(6,1);
  Cable        = status.substr(5,1);
  DI_0         = status.substr(4,1);
  DI_1         = status.substr(3,1);
  Leakage      = status.substr(2,1);
  Fraud        = status.substr(1,1);
  // condition for ACK payload
  if (v4_1 == "40"){
  msg1         = hex2a(v4.substr(10,100));
  conf_p       = parseInt(msg1.substr(1,2), 16);
  conf_s       = msg1.substr(3,2);
  unit1        = msg1.substr(3,2);
  time1        = parseInt(msg1.substr(5,2),16);
  unit2        = msg1.substr(7,2);
  time2        = parseInt(msg1.substr(9,2),16);
  radio        = pad(hex2bin(msg1.substr(3,2)),8);
  ADR          = parseInt(radio.substr(0,1),2);
  DR           = parseInt(radio.substr(1,3),2);
  SF           = parseInt(radio.substr(4,4),2);
  counter_A    = parseInt(msg1.substr(3,6), 16);
  analog_A     = parseInt(msg1.substr(3,4), 16);
  }
  //condition for payload with temp, hum, counter & analog value
  if (v4_1 == "23"){
  T_H          = v4.substr(12,8);
  temp         = T_H.substr(0,4);
  box_temp     = parseInt((temp), 16);
  temperature  = (((box_temp/65536)*165)-40);
  hum          = T_H.substr(4,8);
  box_hum      = parseInt((hum), 16);
  hygrometry   = ((box_hum/65536)*100);
  C_A          = v4.substr(20,50);
  msg1         = hex2a(C_A);
  C            = msg1.search("C");
  counter      = parseInt(msg1.substr(C+1,6),16);
  V            = msg1.search("V");
  analog       = parseInt(msg1.substr(V+1,4),16);
  }
  else{
  C_A          = v4.substr(10,50);
  msg1         = hex2a(C_A);
  C            = msg1.search("C");
  counter      = parseInt(msg1.substr(C+1,6),16);
  V            = msg1.search("V");
  analog       = parseInt(msg1.substr(V+1,4),16);
  }}
  // Battery operated V4 & Class variation with full payload (Tem,Hum,Counter & Analog)
  if (v4_3 == "B" || v4_3 == "b"){
  msg          = String.fromCharCode.apply(1, bytes);
  st2          = hex2bin(v4_2);
  clas         = st2.substr(0,1);
  power        = st2.substr(1,1);
  var b        = v4.substr(1,1);
  var b1       = msg.substr(1,3);
  var bat1     = b.concat(b1);
  battery      = Math.round((bat1-2000)/16);
  st_0         = v4.substr(8,2);
  st_1         = st_0.substr(0,1)-3; 
  st_2         = st_0.substr(1,1);
  st           = st_1+st_2;
  st1          = hex2bin(st);
  status       = pad(st1,8);
  Valve        = status.substr(7,1);
  Tamper       = status.substr(6,1);
  Cable        = status.substr(5,1);
  DI_0         = status.substr(4,1);
  DI_1         = status.substr(3,1);
  Leakage      = status.substr(2,1);
  Fraud        = status.substr(1,1);
  // condition for ACK payload
  if (v4_1 == "40"){
  msg1         = hex2a(v4.substr(10,100));
  conf_p       = parseInt(msg1.substr(1,2), 16);
  conf_s       = msg1.substr(3,2);
  unit1        = msg1.substr(3,2);
  time1        = parseInt(msg1.substr(5,2),16);
  unit2        = msg1.substr(7,2);
  time2        = parseInt(msg1.substr(9,2),16);
  radio        = pad(hex2bin(msg1.substr(3,2)),8);
  ADR          = parseInt(radio.substr(0,1),2);
  DR           = parseInt(radio.substr(1,3),2);
  SF           = parseInt(radio.substr(4,4),2);
  counter_A    = parseInt(msg1.substr(3,6), 16);
  analog_A     = parseInt(msg1.substr(3,4), 16);
  }
  //condition for payload with temp, hum, counter & analog value
  if (v4_1 == "23"){
  T_H          = v4.substr(12,8);
  temp         = T_H.substr(0,4);
  box_temp     = parseInt((temp), 16);
  temperature  = (((box_temp/65536)*165)-40);
  hum          = T_H.substr(4,8);
  box_hum      = parseInt((hum), 16);
  hygrometry   = ((box_hum/65536)*100);
  C_A          = v4.substr(20,50);
  msg1         = hex2a(C_A);
  C            = msg1.search("C");
  counter      = parseInt(msg1.substr(C+1,6),16);
  V            = msg1.search("V");
  analog       = parseInt(msg1.substr(V+1,4),16);
  }
  else{
  C_A          = v4.substr(10,50);
  msg1         = hex2a(C_A);
  C            = msg1.search("C");
  counter      = parseInt(msg1.substr(C+1,6),16);
  V            = msg1.search("V");
  analog       = parseInt(msg1.substr(V+1,4),16);
  }}
  
  // Counter and Analog Ack frame
  if (v4_10 == "40"){
  msg1         = hex2a(v4.substr(0,100));
  conf_p       = parseInt(msg1.substr(1,2), 16);
  counter_A    = parseInt(msg1.substr(3,6), 16);
  analog_A     = parseInt(msg1.substr(3,4), 16);
  }
  
  function pad(num, len) { 
    return ("00000000" + num).substr(-len);
    }
  function roundToTwo(num) {    
    return +(Math.round(num + "e+2")  + "e-2");
  }
  function dec_to_bho (n, base) {
     if (n < 0) {
      n = 0xFFFFFFFF + n + 1;
     } 
switch (base)  
{  
case 'B':  
return parseInt(n, 10).toString(2);
break;  
case 'H':  
return parseInt(n, 10).toString(16);
break;  
case 'O':  
return parseInt(n, 10).toString(8);
break;  
default:  
return("Wrong input.........");  
}}
function ascii_to_hexa(str)
  {
	var arr1 = [];
	for (var n = 0, l = str.length; n < l; n ++) 
     {
		var hex = Number(str.charCodeAt(n)).toString(16);
		arr1.push(hex);
	 }
	return arr1.join('');
   }
function toHexString(bytes) {
    return bytes.map(function(byte) {
        return ("00" + (byte & 0xFF).toString(16)).slice(-2);
      }).join('');
}
function hex2bin(hex){
    return ("00000000" + (parseInt(hex, 16)).toString(2)).substr(-8);
}
function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

if (v4_1==="40"){
 // Class type ack
  if(conf_p===9){
    return {
      Port    : ports,
      Battery : battery,
      Valve   : Valve,
      Tamper  : Tamper,
      Cable   : Cable,
      DI_0    : DI_0,
      DI_1    : DI_1,
      Leakage : Leakage,
      Fraud   : Fraud,
      Class   : clas,
      Power   : power,
      Process : "false",
      Class_Port   : conf_p || 0,
      Class_status : conf_s || 0,
  };}
 // Radio config ack
  if (conf_p===10){
  return {
      Port    : ports,
      Battery : battery,
      Valve   : Valve,
      Tamper  : Tamper,
      Cable   : Cable,
      DI_0    : DI_0,
      DI_1    : DI_1,
      Leakage : Leakage,
      Fraud   : Fraud,
      Class   : clas,
      Power   : power,
      Process : "false",
      ADR     : ADR,
      DR      : DR,
      SF      : SF,
      Radio_conf_Port : conf_p || 0,
      Radio_conf_ack  : conf_s || 0,
  };}
 //Uplink freq ack
  if (conf_p===11){
  return {
      Port    : ports,
      Battery : battery,
      Valve   : Valve,
      Tamper  : Tamper,
      Cable   : Cable,
      DI_0    : DI_0,
      DI_1    : DI_1,
      Leakage : Leakage,
      Fraud   : Fraud,
      Class   : clas,
      Power   : power,
      Process : "false",
      Unit1   : unit1 == "80"? 1:0,
      Time1   : time1,
      Unit2   : unit2 == "80"? 1:0,
      Time2   : time2,
      Uplink_conf_Port : conf_p || 0,
  };}
  // Time sync ack
  if(conf_p===12 || conf_p===13){
    return {
      Port    : ports,
      Battery : battery,
      Valve   : Valve,
      Tamper  : Tamper,
      Cable   : Cable,
      DI_0    : DI_0,
      DI_1    : DI_1,
      Leakage : Leakage,
      Fraud   : Fraud,
      Class   : clas,
      Power   : power,
      Process : "false",
      RTC_Port   : conf_p || 0,
      RTC_status : conf_s || 0,
  };}
// Schedulers ack
if (conf_p===14 || conf_p===15 || conf_p===16 || conf_p===17 || conf_p===18 || conf_p===19 || conf_p===20){
  return {
      Port    : ports,
      Battery : battery,
      Valve   : Valve,
      Tamper  : Tamper,
      Cable   : Cable,
      DI_0    : DI_0,
      DI_1    : DI_1,
      Leakage : Leakage,
      Fraud   : Fraud,
      Class   : clas,
      Power   : power,
      Process : "false",
      Schl_Port   : conf_p || 0,
      Schl_status : conf_s || 0,
  };}
  // Schedulers status ack
  if (conf_p===21){
  return {
      Port    : ports,
      Battery : battery,
      Valve   : Valve,
      Tamper  : Tamper,
      Cable   : Cable,
      DI_0    : DI_0,
      DI_1    : DI_1,
      Leakage : Leakage,
      Fraud   : Fraud,
      Class   : clas,
      Power   : power,
      Process : "false",
      Schl_status_Port : conf_p || 0,
      Schl_status_ack  : conf_s || 0,
  };}
// Magnet status ack
  if(conf_p===22){
    return {
      Port    : ports,
      Battery : battery,
      Valve   : Valve,
      Tamper  : Tamper,
      Cable   : Cable,
      DI_0    : DI_0,
      DI_1    : DI_1,
      Leakage : Leakage,
      Fraud   : Fraud,
      Class   : clas,
      Power   : power,
      Process : "false",
      magnet_Port   : conf_p || 0,
      magnet_status : conf_s || 0,
  };}
  // Counter value retrieval and counter value setting ack
  if(conf_p===23 || conf_p===24){
    return {
      Port    : ports,
      Battery : battery,
      Valve   : Valve,
      Tamper  : Tamper,
      Cable   : Cable,
      DI_0    : DI_0,
      DI_1    : DI_1,
      Leakage : Leakage,
      Fraud   : Fraud,
      Class   : clas,
      Power   : power,
      Process : "false",
      counter_Port   : conf_p || 0,
      counter_value  : counter_A|| 0,
  };}
  // Analog value retrieval
  if(conf_p===25){
    return {
      Port    : ports,
      Battery : battery,
      Valve   : Valve,
      Tamper  : Tamper,
      Cable   : Cable,
      DI_0    : DI_0,
      DI_1    : DI_1,
      Leakage : Leakage,
      Fraud   : Fraud,
      Class   : clas,
      Power   : power,
      Process : "false",
      analog_Port   : conf_p || 0,
      analog_value  : analog_A/1000 || 0,
  };}}
  
  // Ack for counter and analog
  if (v4_10 === "40"){
  // Counter value retrieval and counter value setting ack
  if(conf_p===23 || conf_p===24){
    return {
      Port    : ports,
      Process : "false",
      counter_Port   : conf_p || 0,
      counter_value  : counter_A|| 0,
  };}
  // Analog value retrieval
  if(conf_p===25){
    return {
      Port    : ports,
      Process : "false",
      analog_Port   : conf_p || 0,
      analog_value  : analog_A/1000 || 0,
  };}}
  
   // Periodic uplink with temp, hum
  if(v4_1==="23" && v4_4!="43" && v4_5!="56" && v4_6!="43" && v4_7!="56" && v4_8!="56" && v4_9!="56"){
     return {
      Port    : ports,
      Status  : status,
      Battery : battery,
      Valve   : Valve,
      Tamper  : Tamper,
      Cable   : Cable,
      DI_0    : DI_0,
      DI_1    : DI_1,
      Leakage : Leakage,
      Fraud   : Fraud,
      Class   : clas,
      Power   : power,
      Process : "true",
      Temperature  : roundToTwo(temperature),
      Hygrometry   : roundToTwo(hygrometry),
  };}
  // Periodic uplink with temp, hum, counter & analog
  if(v4_1==="23" && v4_4==="43" && v4_5==="56" && v4_6!="43" && v4_7!="56" && v4_8!="56" && v4_9!="56"){
     return {
      Port    : ports,
      Status  : status,
      Battery : battery,
      Valve   : Valve,
      Tamper  : Tamper,
      Cable   : Cable,
      DI_0    : DI_0,
      DI_1    : DI_1,
      Leakage : Leakage,
      Fraud   : Fraud,
      Class   : clas,
      Power   : power,
      Process : "true",
      Counter : counter,
      Analog_value : analog/1000,
      Temperature  : roundToTwo(temperature),
      Hygrometry   : roundToTwo(hygrometry),
  };}
  // Periodic uplink with temp, hum & counter
  if(v4_1==="23" && v4_4==="43" && v4_5!="56" && v4_6!="43" && v4_7!="56" && v4_8!="56" && v4_9!="56"){
     return {
      Port    : ports,
      Status  : status,
      Battery : battery,
      Valve   : Valve,
      Tamper  : Tamper,
      Cable   : Cable,
      DI_0    : DI_0,
      DI_1    : DI_1,
      Leakage : Leakage,
      Fraud   : Fraud,
      Class   : clas,
      Power   : power,
      Process : "true",
      Counter : counter,
      Temperature  : roundToTwo(temperature),
      Hygrometry   : roundToTwo(hygrometry),
  };}
   // Periodic uplink with temp, hum & analog
  if(v4_1==="23" && v4_9==="56" && v4_4!="43" && v4_5!="56" && v4_6!="43" && v4_7!="56" && v4_8!="56"){
     return {
      Port    : ports,
      Status  : status,
      Battery : battery,
      Valve   : Valve,
      Tamper  : Tamper,
      Cable   : Cable,
      DI_0    : DI_0,
      DI_1    : DI_1,
      Leakage : Leakage,
      Fraud   : Fraud,
      Class   : clas,
      Power   : power,
      Process : "true",
      Analog_value : analog/1000,
      Temperature  : roundToTwo(temperature),
      Hygrometry   : roundToTwo(hygrometry),
  };}
  // Periodic uplink with counter & analog
  if(v4_6==="43" && v4_7==="56" && v4_1!="23" && v4_4!="43" && v4_5!="56" && v4_8!="56" && v4_9!="56"){
     return {
      Port    : ports,
      Status  : status,
      Battery : battery,
      Valve   : Valve,
      Tamper  : Tamper,
      Cable   : Cable,
      DI_0    : DI_0,
      DI_1    : DI_1,
      Leakage : Leakage,
      Fraud   : Fraud,
      Class   : clas,
      Power   : power,
      Process : "true",
      Counter : counter,
      Analog_value : analog/1000,
  };}
  // Periodic uplink with counter
  if(v4_6==="43" && v4_7!="56" && v4_1!="23" && v4_4!="43" && v4_5!="56" && v4_8!="56" && v4_9!="56"){
     return {
      Port    : ports,
      Status  : status,
      Battery : battery,
      Valve   : Valve,
      Tamper  : Tamper,
      Cable   : Cable,
      DI_0    : DI_0,
      DI_1    : DI_1,
      Leakage : Leakage,
      Fraud   : Fraud,
      Class   : clas,
      Power   : power,
      Process : "true",
      Counter : counter,
  };}
  // Periodic uplink with analog
  if(v4_8==="56" && v4_9==="56" && v4_1!="23" && v4_4!="43" && v4_5!="56" && v4_6!="43" && v4_7!="56"){
     return {
      Port    : ports,
      Status  : status,
      Battery : battery,
      Valve   : Valve,
      Tamper  : Tamper,
      Cable   : Cable,
      DI_0    : DI_0,
      DI_1    : DI_1,
      Leakage : Leakage,
      Fraud   : Fraud,
      Class   : clas,
      Power   : power,
      Process : "true",
      Analog_value : analog/1000,
     };}
  // periodic uplink old version
  else {
     return {
      Port    : ports,
      Status  : status,
      Battery : battery,
      Valve   : Valve,
      Tamper  : Tamper,
      Cable   : Cable,
      DI_0    : DI_0,
      DI_1    : DI_1,
      Leakage : Leakage,
      Fraud   : Fraud,
      Class   : clas,
      Power   : power,
      Process : "true",
  };}}

// Encoder for TTI updated on 24th Jan 2021
function encodeDownlink(input) {
  function pad0(num, len) { 
  return ("30" + num).substr(-len);}
  function pad(num, len) {
  return ("00" + num).substr(-len);}
  function pad1(num, len) {
  return ("000" + num).substr(-len);}
  function pad2(num, len) {
  return ("0000" + num).substr(-len);}
  function pad3(num, len) {
  return ("000000000000000000000000" + num).substr(-len);}
  function dec_to_bho (n, base) {
  if (n < 0) {
  n = 0xFFFFFFFF + n + 1;}
 switch (base){
 case 'B':
 return parseInt(n, 10).toString(2);
 break;
 case 'H':
 return parseInt(n, 10).toString(16);
 break;
 case 'O':
 return parseInt(n, 10).toString(8);
 break;
 default:
 return("Wrong input.........");}}
  var bytes = [];
  var ne =[];
  var d1 = new Date();
  var targetTime = new Date(d1);
  // the following line describe the exact time at your location that maybe different from the time of the LNS. Set the number of hours (+/-) according to your time zone compared to GMT
  var timeZoneFromDB = +4.00; //time zone value from database
  //convert the offset to milliseconds, add to targetTime, and make a new Date
  var tzDifference = timeZoneFromDB * 60 + targetTime.getTimezoneOffset();
  var offsetTime = new Date(targetTime.getTime() + tzDifference * 60 * 1000);
  var d = offsetTime;
  var port = input.data.f_port;
  var Schl_on = 10;
  var Schl_off = 00;
  var Schl_m = 0;
 // open and close command
  if (port == 1) {
  bytes[0] = input.data.payload;
  bytes[1] = 48;
  ne[0]    = bytes[1]+bytes[0];
  return {
     bytes: ne,
  }}
 // Changing the class
  if (port == 9){
   bytes[0] = input.data.payload;
   return {
     bytes:bytes,
  }}
 // Radio setting
  if (port == 10){
   var ADR   = dec_to_bho(input.data.ADR,'B');
   var DR    = pad1(dec_to_bho(input.data.DR,'B'),3);
   var SF    = pad2(dec_to_bho(input.data.SF,'B'),4);
   var radio = parseInt((ADR+DR+SF),2);
   bytes[0]  = radio;
   return {
     bytes:bytes,
  }}
 // UL frequency time
  if (port == 11){
  if (input.data.unit1==1){
  bytes[0] = 128;}
  else{
  bytes[0] = 0;}
  bytes[1] = input.data.time1;
  if (input.data.unit2==1){
  bytes[2] = 128;}
  else{
  bytes[2] = 0;}
  bytes[3] = input.data.time2;
  return {
     bytes:bytes,
  }}
 //Time Synchronization 
  if (port == 12){
   var hours = d.getHours();
   var h     = pad(hours,2);
   bytes[0]  = parseInt(h.substr(0,1));
   bytes[1]  = parseInt(h.substr(1,1));
   var mins  = d.getMinutes();
   var m     = pad(mins,2);
   bytes[2]  = parseInt(m.substr(0,1));
   bytes[3]  = parseInt(m.substr(1,1));
   var sec   = d.getSeconds();
   var s     = pad(sec,2);
   bytes[4]  = parseInt(s.substr(0,1));
   bytes[5]  = parseInt(s.substr(1,1));
   var day   = d.getDay();
   var d1    = pad(day,2);
   bytes[6]  = parseInt(d1.substr(0,1));
   bytes[7]  = parseInt(d1.substr(1,1));
   var date  = d.getDate();
   var d2    = pad(date,2);
   bytes[8]  = parseInt(d2.substr(0,1));
   bytes[9]  = parseInt(d2.substr(1,1));
   var month = d.getMonth()+1;
   var m1    = pad(month,2);
   bytes[10] = parseInt(m1.substr(0,1));
   bytes[11] = parseInt(m1.substr(1,1));
   var year  = d.getFullYear().toString().substr(2, 2);
   var y     = pad(year,2);
   bytes[12] = parseInt(y.substr(0,1));
   bytes[13] = parseInt(y.substr(1,1));
   return {
     bytes:bytes,
  }}
 // Time Synchronization Request
  if (port == 13){
   bytes[0] = input.data.Sync_RTC;
  return {
     bytes:bytes,
  }}
 // Schedulers setting
  if (port==14 || port==15 || port==16 || port==17 || port==18 || port==19 || port==20) {
  bytes[0] = 255;
  if (input.data.schl1h_on=="None" || input.data.schl1h_on==255){
    bytes[1] = 255;}
    else{
  var a = parseInt(input.data.schl1h_on);
  var b = pad(a,2);
  var c = b.substr(0,1);
  var d = b.substr(1,1);
  var e = pad(dec_to_bho (c,'B'),2);
  var f = pad2(dec_to_bho (d,'B'),4);
  var g = parseInt((Schl_on+e+f),2);
  bytes[1] = g;}
  if (input.data.schl1m_on=="None" || input.data.schl1m_on==255){
    bytes[2] = 255;}
    else{
  var a1 = parseInt(input.data.schl1m_on);
  var b1 = pad(a1,2);
  var c1 = b1.substr(0,1);
  var d1 = b1.substr(1,1);
  var e1 = pad1(dec_to_bho (c1,'B'),3);
  var f1 = pad2(dec_to_bho (d1,'B'),4);
  var g1 = parseInt((Schl_m+e1+f1),2);
  bytes[2] = g1;}
  bytes[3] = 255;
  if (input.data.schl1h_off=="None" || input.data.schl1h_off==255){
    bytes[4] = 255;}
    else{
  var a2 = parseInt(input.data.schl1h_off);
  var b2 = pad(a2,2);
  var c2 = b2.substr(0,1);
  var d2 = b2.substr(1,1);
  var e2 = pad(dec_to_bho (c2,'B'),2);
  var f2 = pad2(dec_to_bho (d2,'B'),4);
  var g2 = parseInt((Schl_off+e2+f2),2);
  bytes[4] = g2;}
  if (input.data.schl1m_off=="None" || input.data.schl1m_off==255){
    bytes[5] = 255;}
    else{
  var a3 = parseInt(input.data.schl1m_off);
  var b3 = pad(a3,2);
  var c3 = b3.substr(0,1);
  var d3 = b3.substr(1,1);
  var e3 = pad1(dec_to_bho (c3,'B'),3);
  var f3 = pad2(dec_to_bho (d3,'B'),4);
  var g3 = parseInt((Schl_m+e3+f3),2);
  bytes[5] = g3;}
  bytes[6] = 255;
  if (input.data.schl2h_on=="None" || input.data.schl2h_on==255){
    bytes[7] = 255;}
    else{
  var a4 = parseInt(input.data.schl2h_on);
  var b4 = pad(a4,2);
  var c4 = b4.substr(0,1);
  var d4 = b4.substr(1,1);
  var e4 = pad(dec_to_bho (c4,'B'),2);
  var f4 = pad2(dec_to_bho (d4,'B'),4);
  var g4 = parseInt((Schl_on+e4+f4),2);
  bytes[7] = g4;}
  if (input.data.schl2m_on=="None" || input.data.schl2m_on==255){
    bytes[8] = 255;}
    else{
  var a5 = parseInt(input.data.schl2m_on);
  var b5 = pad(a5,2);
  var c5 = b5.substr(0,1);
  var d5 = b5.substr(1,1);
  var e5 = pad1(dec_to_bho (c5,'B'),3);
  var f5 = pad2(dec_to_bho (d5,'B'),4);
  var g5 = parseInt((Schl_m+e5+f5),2);
  bytes[8] = g5;}
  bytes[9] = 255;
  if (input.data.schl2h_off=="None" || input.data.schl2h_off==255){
    bytes[10] = 255;}
    else{
  var a6 = parseInt(input.data.schl2h_off);
  var b6 = pad(a6,2);
  var c6 = b6.substr(0,1);
  var d6 = b6.substr(1,1);
  var e6 = pad(dec_to_bho (c6,'B'),2);
  var f6 = pad2(dec_to_bho (d6,'B'),4);
  var g6 = parseInt((Schl_off+e6+f6),2);
  bytes[10] = g6;}
  if (input.data.schl2m_off=="None" || input.data.schl2m_off==255){
    bytes[11] = 255;}
    else{
  var a7 = parseInt(input.data.schl2m_off);
  var b7 = pad(a7,2);
  var c7 = b7.substr(0,1);
  var d7 = b7.substr(1,1);
  var e7 = pad1(dec_to_bho (c7,'B'),3);
  var f7 = pad2(dec_to_bho (d7,'B'),4);
  var g7 = parseInt((Schl_m+e7+f7),2);
  bytes[11] = g7;}
  bytes[12] = 255;
  if (input.data.schl3h_on=="None" || input.data.schl3h_on==255){
    bytes[13] = 255;}
    else{
  var a8 = parseInt(input.data.schl3h_on);
  var b8 = pad(a8,2);
  var c8 = b8.substr(0,1);
  var d8 = b8.substr(1,1);
  var e8 = pad(dec_to_bho (c8,'B'),2);
  var f8 = pad2(dec_to_bho (d8,'B'),4);
  var g8 = parseInt((Schl_on+e8+f8),2);
  bytes[13] = g8;}
  if (input.data.schl3m_on=="None" || input.data.schl3m_on==255){
    bytes[14] = 255;}
    else{
  var a9 = parseInt(input.data.schl3m_on);
  var b9 = pad(a9,2);
  var c9 = b9.substr(0,1);
  var d9 = b9.substr(1,1);
  var e9 = pad1(dec_to_bho (c9,'B'),3);
  var f9 = pad2(dec_to_bho (d9,'B'),4);
  var g9 = parseInt((Schl_m+e9+f9),2);
  bytes[14] = g9;}
  bytes[15] = 255;
  if (input.data.schl3h_off=="None" || input.data.schl3h_off==255){
    bytes[16] = 255;}
    else{
  var a10 = parseInt(input.data.schl3h_off);
  var b10 = pad(a10,2);
  var c10 = b10.substr(0,1);
  var d10 = b10.substr(1,1);
  var e10 = pad(dec_to_bho (c10,'B'),2);
  var f10 = pad2(dec_to_bho (d10,'B'),4);
  var g10 = parseInt((Schl_off+e10+f10),2);
  bytes[16] = g10;}
  if (input.data.schl3m_off=="None" || input.data.schl3m_off==255){
    bytes[17] = 255;}
    else{
  var a11 = parseInt(input.data.schl3m_off);
  var b11 = pad(a11,2);
  var c11 = b11.substr(0,1);
  var d11 = b11.substr(1,1);
  var e11 = pad1(dec_to_bho (c11,'B'),3);
  var f11 = pad2(dec_to_bho (d11,'B'),4);
  var g11 = parseInt((Schl_m+e11+f11),2);
  bytes[17] = g11;}
  bytes[18] = 255;
  if (input.data.schl4h_on=="None" || input.data.schl4h_on==255){
    bytes[19] = 255;}
    else{
  var a12 = parseInt(input.data.schl4h_on);
  var b12 = pad(a12,2);
  var c12 = b12.substr(0,1);
  var d12 = b12.substr(1,1);
  var e12 = pad(dec_to_bho (c12,'B'),2);
  var f12 = pad2(dec_to_bho (d12,'B'),4);
  var g12 = parseInt((Schl_on+e12+f12),2);
  bytes[19] = g12;}
  if (input.data.schl4m_on=="None" || input.data.schl4m_on==255){
    bytes[20] = 255;}
    else{
  var a13 = parseInt(input.data.schl4m_on);
  var b13 = pad(a13,2);
  var c13 = b13.substr(0,1);
  var d13 = b13.substr(1,1);
  var e13 = pad1(dec_to_bho (c13,'B'),3);
  var f13 = pad2(dec_to_bho (d13,'B'),4);
  var g13 = parseInt((Schl_m+e13+f13),2);
  bytes[20] = g13;}
  bytes[21] = 255;
  if (input.data.schl4h_off=="None" || input.data.schl4h_off==255){
    bytes[22] = 255;}
    else{
  var a14 = parseInt(input.data.schl4h_off);
  var b14 = pad(a14,2);
  var c14 = b14.substr(0,1);
  var d14 = b14.substr(1,1);
  var e14 = pad(dec_to_bho (c14,'B'),2);
  var f14 = pad2(dec_to_bho (d14,'B'),4);
  var g14 = parseInt((Schl_off+e14+f14),2);
  bytes[22] = g14;}
  if (input.data.schl4m_off=="None" || input.data.schl4m_off==255){
    bytes[23] = 255;}
    else{
  var a15 = parseInt(input.data.schl4m_off);
  var b15 = pad(a15,2);
  var c15 = b15.substr(0,1);
  var d15 = b15.substr(1,1);
  var e15 = pad1(dec_to_bho (c15,'B'),3);
  var f15 = pad2(dec_to_bho (d15,'B'),4);
  var g15 = parseInt((Schl_m+e15+f15),2);
  bytes[23] = g15;}
 return {
     bytes:bytes,
 }}
 // Schedulers status setting
  if (port == 21){
   bytes[0] = input.data.Schl_status;
   bytes[1] = 48;
   ne[0]    = bytes[1]+bytes[0];
  return {
     bytes:ne,
  }}
 // Magnetic control
  if (port == 22){
   bytes[0] = input.data.payload;
   bytes[1] = 48;
   ne[0]    = bytes[1]+bytes[0];
  return {
     bytes:ne,
  }}
 // Setting your Counter value
  if (port == 23){
   var counter = pad3(dec_to_bho (input.data.payload,'B'),24);
   var byte1   = counter.substr(0,8);
   var byte2   = counter.substr(8,8);
   var byte3   = counter.substr(16,8);
   bytes[0]    = parseInt(byte1,2);
   bytes[1]    = parseInt(byte2,2);
   bytes[2]    = parseInt(byte3,2);
  return {
     bytes:bytes,
  }}
 // Counter value retrieval
  if (port == 24){
   bytes[0] = input.data.payload;
   bytes[1] = 48;
   ne[0]    = bytes[1]+bytes[0];
  return {
     bytes:ne,
  }}
 // Analog value retrieval
  if (port == 25){
   bytes[0] = input.data.payload;
   bytes[1] = 48;
   ne[0]    = bytes[1]+bytes[0];
  return {
     bytes:ne,
  }}}
 
 function decodeDownlink(input) {
   return {
     data: {
       bytes: input.bytes
     },
     warnings: [],
     errors: []
   };
 }
