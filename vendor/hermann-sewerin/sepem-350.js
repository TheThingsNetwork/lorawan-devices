function decodeUplink(e) {
  function t(e, t) {
    return !(e < t);
  }
  function a(e, t) {
    return !(e > t);
  }
  function r(e, t, a, r, i) {
    var n = new Date(e, t, a, r, i);
    return n.getFullYear() == e && n.getMonth() == t && n.getDate() == a && n.getHours() == r && n.getMinutes() == i;
  }
  function i(e, t, a) {
    for (var r = []; t <= a;) {
      if (-1 === e.indexOf(e[t])) return !1;
      r.push(e[t]), t++;
    }
    return r;
  }
  function n(e) {
    for (var t = 0; 0 == (e >> t & 1) && t < 8;) t++;
    return t;
  }
  function l(e, t) {
    var a = {}, r = {};
    if (e && (a = Object(e), t)) {
      r = Object.keys(t);
      for (var i = 0; i < r.length; i++) Object.prototype.hasOwnProperty.call(t, r[i]) && (a[r[i]] = t[r[i]]);
    }
    return a;
  }
  if (e) {
    if (e.bytes) {
      if (e.bytes.length < 52) {
        if ("number" == typeof e.fPort) {
          var m = {}, d = [], o = {
            id: 208,
            name: "Checksum",
            length: 3,
            payload: [],
            data: function (e) {
              this.data = (e[1] << 8) + e[2];
            },
            indexOf: function () {
              return e.bytes.indexOf(this.id);
            },
            correct: !1
          }, s = {
            255: {
              name: "EvalABC",
              length: 7,
              payload: [],
              data: function (e) {
                var r = (e[1] << 8) + e[2], i = (e[3] << 8) + e[4], n = (e[5] << 8) + e[6];
                this.data = {
                  EvalABC_A: r,
                  EvalABC_B: i,
                  EvalABC_C: n
                }, this.limits = {
                  EvalABC_A: t(r, 0) ? a(r, 3e3) ? null : new Error("EvalABC_A limit max: 3000 exceeded.") : new Error("EvalABC_A limit min: 0 exceeded."),
                  EvalABC_B: t(i, 0) ? a(i, 1e3) ? null : new Error("EvalABC_B limit max: 1000 exceeded.") : new Error("EvalABC_B limit min: 0 exceeded."),
                  EvalABC_C: t(n, 0) ? a(n, 3e3) ? null : new Error("EvalABC_C limit max: 3000 exceeded.") : new Error("EvalABC_C limit min: 0 exceeded.")
                };
              },
              limits: {}
            },
            254: {
              name: "EvalA7Days",
              length: 15,
              payload: [],
              data: function (e) {
                var r = (e[1] << 8) + e[2], i = (e[3] << 8) + e[4], n = (e[5] << 8) + e[6], l = (e[7] << 8) + e[8], m = (e[9] << 8) + e[10], d = (e[11] << 8) + e[12], o = (e[13] << 8) + e[14];
                this.data = {
                  EvalA7Days_1: r,
                  EvalA7Days_2: i,
                  EvalA7Days_3: n,
                  EvalA7Days_4: l,
                  EvalA7Days_5: m,
                  EvalA7Days_6: d,
                  EvalA7Days_7: o
                }, this.limits = {
                  EvalA7Days_1: t(r, 0) ? a(r, 3e3) ? null : new Error("EvalA7Days_1 limit max: 3000 exceeded.") : new Error("EvalA7Days_1 limit min: 0 exceeded."),
                  EvalA7Days_2: t(i, 0) ? a(i, 3e3) ? null : new Error("EvalA7Days_2 limit max: 3000 exceeded.") : new Error("EvalA7Days_2 limit min: 0 exceeded."),
                  EvalA7Days_3: t(n, 0) ? a(n, 3e3) ? null : new Error("EvalA7Days_3 limit max: 3000 exceeded.") : new Error("EvalA7Days_3 limit min: 0 exceeded."),
                  EvalA7Days_4: t(l, 0) ? a(l, 3e3) ? null : new Error("EvalA7Days_4 limit max: 3000 exceeded.") : new Error("EvalA7Days_4 limit min: 0 exceeded."),
                  EvalA7Days_5: t(m, 0) ? a(m, 3e3) ? null : new Error("EvalA7Days_5 limit max: 3000 exceeded.") : new Error("EvalA7Days_5 limit min: 0 exceeded."),
                  EvalA7Days_6: t(d, 0) ? a(d, 3e3) ? null : new Error("EvalA7Days_6 limit max: 3000 exceeded.") : new Error("EvalA7Days_6 limit min: 0 exceeded."),
                  EvalA7Days_7: t(o, 0) ? a(o, 3e3) ? null : new Error("EvalA7Days_7 limit max: 3000 exceeded.") : new Error("EvalA7Days_7 limit min: 0 exceeded.")
                };
              },
              limits: {}
            },
            253: {
              name: "EvalABCMonth",
              length: 7,
              payload: [],
              data: function (e) {
                var r = (e[1] << 8) + e[2], i = (e[3] << 8) + e[4], n = (e[5] << 8) + e[6];
                this.data = {
                  EvalABCMonth_A: r,
                  EvalABCMonth_B: i,
                  EvalABCMonth_C: n
                }, this.limits = {
                  EvalABCMonth_A: t(r, 0) ? a(r, 3e3) ? null : new Error("EvalABCMonth_A limit max: 3000 exceeded.") : new Error("EvalABCMonth_A limit min: 0 exceeded."),
                  EvalABCMonth_B: t(i, 0) ? a(i, 1e3) ? null : new Error("EvalABCMonth_B limit max: 1000 exceeded.") : new Error("EvalABCMonth_B limit min: 0 exceeded."),
                  EvalABCMonth_C: t(n, 0) ? a(n, 3e3) ? null : new Error("EvalABCMonth_C limit max: 3000 exceeded.") : new Error("EvalABCMonth_C limit min: 0 exceeded.")
                };
              },
              limits: {}
            },
            252: {
              name: "EvalA",
              length: 3,
              payload: [],
              data: function (e) {
                var r = (e[1] << 8) + e[2];
                this.data = {
                  EvalA: r
                }, this.limits = {
                  EvalA: t(r, 0) ? a(r, 3e3) ? null : new Error("EvalA limit max: 3000 exceeded.") : new Error("EvalA limit min: 0 exceeded.")
                };
              },
              limits: {}
            },
            251: {
              name: "EvalB",
              length: 3,
              payload: [],
              data: function (e) {
                var r = (e[1] << 8) + e[2];
                this.data = {
                  EvalB: r
                }, this.limits = {
                  EvalB: t(r, 0) ? a(r, 1e3) ? null : new Error("EvalB limit max: 1000 exceeded.") : new Error("EvalB limit min: 0 exceeded.")
                };
              },
              limits: {}
            },
            250: {
              name: "EvalC",
              length: 3,
              payload: [],
              data: function (e) {
                var r = (e[1] << 8) + e[2];
                this.data = {
                  EvalC: r
                }, this.limits = {
                  EvalC: t(r, 0) ? a(r, 3e3) ? null : new Error("EvalC limit max: 3000 exceeded.") : new Error("EvalC limit min: 0 exceeded.")
                };
              },
              limits: {}
            },
            249: {
              name: "ActEvalA",
              length: 3,
              payload: [],
              data: function (e) {
                var r = (e[1] << 8) + e[2];
                this.data = {
                  ActEvalA: r
                }, this.limits = {
                  ActEvalA: t(r, 0) ? a(r, 3e3) ? null : new Error("ActEvalA limit max: 3000 exceeded.") : new Error("ActEvalA limit min: 0 exceeded.")
                };
              },
              limits: {}
            },
            248: {
              name: "FAB",
              length: 5,
              payload: [],
              data: function (e) {
                var r = String(e[1]).padStart(3, "0"), i = String(e[2]).padStart(2, "0"), n = String((e[3] << 8) + e[4]).padStart(6, "0");
                this.data = {
                  FAB: r + " " + i + " " + n
                }, r = t(r, 100) ? a(r, 100) ? null : new Error("FAB type number limit max: 100 exceeded.") : new Error("FAB type number limit min: 100 exceeded."),
                  i = t(i, 40) ? a(i, 45) ? null : new Error("FAB model number limit max: 45 exceeded.") : new Error("FAB model number limit min: 40 exceeded."),
                  n = t(n, 1) ? a(n, 65535) ? null : new Error("FAB serial number limit max: 65535 exceeded.") : new Error("FAB serial number limit min: 1 exceeded."),
                  this.limits = {
                    FAB: null != r ? r : null != i ? i : null != n ? n : null
                  };
              },
              limits: {}
            },
            247: {
              name: "DeviceNr",
              length: 3,
              payload: [],
              data: function (e) {
                this.data = {
                  DeviceNr: (e[1] << 8) + e[2]
                };
              },
              limits: {}
            },
            246: {
              name: "DevState",
              length: 5,
              payload: [],
              data: function (e) {
                var t = ((e[1] << 24) + (e[2] << 16) + (e[3] << 8) + e[4]).toString(16).padStart(8, "0");
                this.data = {
                  DevState: t
                };
              },
              limits: {}
            },
            245: {
              name: "MeasTime",
              length: 8,
              payload: [],
              data: function (e) {
                var i = (((e[1] << 8) + e[2] & 65520) >> 4).toString(), n = ((e[1] << 8) + e[2] & 15).toString().padStart(2, "0"), l = e[3].toString().padStart(2, "0"), m = (((e[4] << 16) + (e[5] << 8) + e[6] & 16515072) >> 18).toString().padStart(2, "0"), d = (((e[4] << 16) + (e[5] << 8) + e[6] & 258048) >> 12).toString().padStart(2, "0"), o = new Date(i, n - 1, l, m, d), s = ((e[4] << 16) + (e[5] << 8) + e[6] & 4095).toString(), E = e[6].toString();
                this.data = {
                  MeasTime: l + "/" + n + "/" + i + " - " + m + ":" + d + "; Duration: " + s + " min.; Counter = " + E
                }, o = r(i, n - 1, l, m, d) ? o >= new Date(2e3, 0, 1, 0, 0) ? o <= new Date ? null : new Error("MeasTime date limit max exceeded.") : new Error("MeasTime date limit min exceeded.") : new Error("MeasTime date format inncorect."),
                  s = t(s, 0) ? a(s, 4096) ? null : new Error("MeasTime duration limit max: 4096 exceeded.") : new Error("MeasTime duration limit min: 0 exceeded."),
                  E = t(E, 0) ? a(E, 255) ? null : new Error("MeasTime counter limit max: 255 exceeded.") : new Error("MeasTime counter limit min: 0 exceeded."),
                  this.limits = {
                    MeasTime: null != o ? o : null != s ? s : null != E ? E : null
                  };
              },
              limits: {}
            },
            244: {
              name: "MeasTimeExt",
              length: 11,
              payload: [],
              data: function (e) {
                var i = ((e[1] << 8) + e[2]).toString(), n = e[3].toString().padStart(2, "0"), l = e[4].toString().padStart(2, "0"), m = e[5].toString().padStart(2, "0"), d = e[6].toString().padStart(2, "0"), o = new Date(i, n - 1, l, m, d), s = ((e[7] << 8) + e[8]).toString(), E = ((e[9] << 8) + e[10]).toString();
                this.data = {
                  MeasTimeExt: l + "/" + n + "/" + i + " - " + m + ":" + d + "; Duration: " + s + " min.; Counter = " + E
                }, o = r(i, n - 1, l, m, d) ? o >= new Date(2e3, 0, 1, 0, 0) ? o <= new Date ? null : new Error("MeasTimeExt date limit max exceeded.") : new Error("MeasTimeExt date limit min exceeded.") : new Error("MeasTimeExt date format inncorect."),
                  s = t(s, 0) ? a(s, 65535) ? null : new Error("MeasTimeExt duration limit max: 65535 exceeded.") : new Error("MeasTimeExt duration limit min: 0 exceeded."),
                  E = t(E, 0) ? a(E, 65535) ? null : new Error("MeasTimeExt counter limit max: 65535 exceeded.") : new Error("MeasTimeExt counter limit min: 0 exceeded."),
                  this.limits = {
                    MeasTimeExt: null != o ? o : null != s ? s : null != E ? E : null
                  };
              },
              limits: {}
            },
            243: {
              name: "BattCap",
              length: 2,
              payload: [],
              data: function (e) {
                var r = e[1].toString();
                this.data = {
                  BattCap: r + " %"
                }, this.limits = {
                  BattCap: t(r, 0) ? a(r, 100) ? null : new Error("BattCap limit max: 100 % exceeded.") : new Error("BattCap limit min: 0 % exceeded.")
                };
              }
            },
            242: {
              name: "TimeStamp",
              length: 7,
              payload: [],
              data: function (e) {
                var t = ((e[1] << 8) + e[2]).toString(), a = e[3].toString().padStart(2, "0"), i = e[4].toString().padStart(2, "0"), n = e[5].toString().padStart(2, "0"), l = e[6].toString().padStart(2, "0"), m = new Date(t, a - 1, i, n, l);
                this.data = {
                  TimeStamp: i + "/" + a + "/" + t + " - " + n + ":" + l + ";"
                }, this.limits = {
                  TimeStamp: r(t, a - 1, i, n, l) ? m >= new Date(2e3, 0, 1, 0, 0) ? m <= new Date ? null : new Error("TimeStamp date limit max exceeded.") : new Error("TimeStamp date limit min exceeded.") : new Error("TimeStamp date format inncorect.")
                };
              },
              limits: {}
            },
            241: {
              name: "Error",
              length: 3,
              payload: [],
              data: function (e) {
                var r = (e[1] << 8) + e[2];
                this.data = {
                  Error: r
                }, this.limits = {
                  Error: t(r, 1) ? a(r, 32) ? null : new Error("Error limit max: 32 exceeded.") : new Error("Error limit min: 1 exceeded.")
                };
              },
              limits: {}
            },
            240: {
              name: "Temp",
              length: 2,
              payload: [],
              data: function (e) {
                var r = e[1] > 128 ? e[1] - 256 : e[1];
                this.data = {
                  Temp: r.toString() + " ℃"
                }, this.limits = {
                  Temp: t(r, -40) ? a(r, 85) ? null : new Error("Temp limit max: 85 ℃ exceeded.") : new Error("Temp limit min: -40 ℃ exceeded.")
                };
              },
              limits: {}
            },
            239: {
              name: "Sensity",
              length: 2,
              payload: [],
              data: function (e) {
                var r = 2 * (e[1] > 128 ? e[1] - 256 : e[1]);
                this.data = {
                  Sensity: r.toString() + " dBm"
                }, this.limits = {
                  Sensity: t(r, -127) ? a(r, 0) ? null : new Error("Sensity limit max: 0 dBm exceeded.") : new Error("Sensity limit min: -127 dBm exceeded.")
                };
              },
              limits: {}
            },
            238: {
              name: "Sensor",
              length: 2,
              payload: [],
              data: function (e) {
                this.data = {
                  Sensor: 81 == e[1] ? "Noise" : 82 == e[1] ? "Pressure" : 84 == e[1] ? "Temperature" : "Unknown"
                }, this.limits = {
                  Sensor: 81 == e[1] || 82 == e[1] || 84 == e[1] ? null : new Error("Sensor unknown.")
                };
              },
              limits: {}
            },
            237: {
              name: "Interval",
              length: 3,
              payload: [],
              data: function (e) {
                var r = (e[1] << 8) + e[2];
                this.data = {
                  Interval: r
                }, this.limits = {
                  Interval: t(r, 1) ? a(r, 3600) ? null : new Error("Interval limit max: 3600 exceeded.") : new Error("Interval limit min: 1 exceeded.")
                };
              },
              limits: {}
            },
            236: {
              name: "DevEUI",
              length: 9,
              payload: [],
              data: function (e) {
                var t = e[1].toString(16).padStart(2, "0") + ":" + (e[2].toString(16).padStart(2, "0") + ":") + (e[3].toString(16).padStart(2, "0") + ":") + (e[4].toString(16).padStart(2, "0") + ":") + (e[5].toString(16).padStart(2, "0") + ":") + (e[6].toString(16).padStart(2, "0") + ":") + (e[7].toString(16).padStart(2, "0") + ":") + e[8].toString(16).padStart(2, "0");
                this.data = {
                  DevEUI: t
                };
              },
              limits: {}
            },
            235: {
              name: "TelIdentExt",
              length: 6,
              payload: [],
              data: function (e) {
                var t = e[1].toString(16).padStart(2, "0") + ":" + (e[2].toString(16).padStart(2, "0") + ":") + (e[3].toString(16).padStart(2, "0") + ":") + (e[4].toString(16).padStart(2, "0") + ":") + e[5].toString(16).padStart(2, "0");
                this.data = {
                  TelIdentExt: t
                };
              },
              limits: {}
            },
            234: {
              name: "BattVoltage",
              length: 2,
              payload: [],
              data: function (e) {
                var r = e[1] / 20;
                this.data = {
                  BattVoltage: r.toString() + " V"
                }, this.limits = {
                  BattVoltage: t(r, 0) ? a(r, 4) ? null : new Error("BattVoltage limit max: 4 V exceeded.") : new Error("BattVoltage limit min: 0 V exceeded.")
                };
              },
              limits: {}
            },
            233: {
              name: "BattVoltage1",
              length: 2,
              payload: [],
              data: function (e) {
                var r = e[1] / 20;
                this.data = {
                  BattVoltage1: r.toString() + " V"
                }, this.limits = {
                  BattVoltage1: t(r, 0) ? a(r, 4) ? null : new Error("BattVoltage1 limit max: 4 V exceeded.") : new Error("BattVoltage1 limit min: 0 V exceeded.")
                };
              },
              limits: {}
            },
            232: {
              name: "BattVoltage2",
              length: 2,
              payload: [],
              data: function (e) {
                var r = e[1] / 20;
                this.data = {
                  BattVoltage2: r.toString() + " V"
                }, this.limits = {
                  BattVoltage2: t(r, 0) ? a(r, 4) ? null : new Error("BattVoltage2 limit max: 4 V exceeded.") : new Error("BattVoltage2 limit min: 0 V exceeded.")
                };
              },
              limits: {}
            },
            231: {
              name: "Histo",
              length: 14,
              payload: [],
              data: function (e) {
                for (var r = "", i = 0; i < 13; i++) r += e[i + 1].toString(16).padStart(2, "0"),
                  i < 12 && (r += ":");
                this.data = {
                  Histo: r
                }, r = null;
                for (var n = 0; n < 13; n++) {
                  if (!t(e[n + 1], 0)) {
                    r = new Error("Histo limit min: 0 exceeded.");
                    break;
                  }
                  if (!a(e[n + 1], 200)) {
                    r = new Error("Histo limit max: 200 exceeded.");
                    break;
                  }
                }
                this.limits = {
                  Histo: r
                };
              },
              limits: {}
            },
            230: {
              name: "MsgLimitCounter",
              length: 3,
              payload: [],
              data: function (e) {
                this.data = {
                  MsgLimitCounter: (e[1] << 8) + e[2]
                };
              },
              limits: {}
            },
            229: {
              name: "EvalABC3Days",
              length: 13,
              payload: [],
              data: function (e) {
                var r = (e[1] << 24) + (e[2] << 16) + (e[3] << 8) + e[4], i = (e[5] << 24) + (e[6] << 16) + (e[7] << 8) + e[8], n = (e[9] << 24) + (e[10] << 16) + (e[11] << 8) + e[12], l = (4293918720 & r) >> 20 & 4095, m = 4 * ((1044480 & r) >> 12) & 1023, d = 4095 & r, o = (4293918720 & i) >> 20 & 4095, s = 4 * ((1044480 & i) >> 12) & 1023, E = 4095 & i, c = (4293918720 & n) >> 20 & 4095, u = 4 * ((1044480 & n) >> 12) & 1023, v = 4095 & n;
                this.data = {
                  EvalABC3Days_1: l,
                  EvalABC3Days_2: m,
                  EvalABC3Days_3: d,
                  EvalABC3Days_4: o,
                  EvalABC3Days_5: s,
                  EvalABC3Days_6: E,
                  EvalABC3Days_7: c,
                  EvalABC3Days_8: u,
                  EvalABC3Days_9: v
                }, this.limits = {
                  EvalABC3Days_1: t(l, 0) ? a(l, 3e3) ? null : new Error("EvalABC3Days_1 limit max: 3000 exceeded.") : new Error("EvalABC3Days_1 limit min: 0 exceeded."),
                  EvalABC3Days_2: t(m, 0) ? a(m, 1e3) ? null : new Error("EvalABC3Days_2 limit max: 1000 exceeded.") : new Error("EvalABC3Days_2 limit min: 0 exceeded."),
                  EvalABC3Days_3: t(d, 0) ? a(d, 3e3) ? null : new Error("EvalABC3Days_3 limit max: 3000 exceeded.") : new Error("EvalABC3Days_3 limit min: 0 exceeded."),
                  EvalABC3Days_4: t(o, 0) ? a(o, 3e3) ? null : new Error("EvalABC3Days_4 limit max: 3000 exceeded.") : new Error("EvalABC3Days_4 limit min: 0 exceeded."),
                  EvalABC3Days_5: t(s, 0) ? a(s, 1e3) ? null : new Error("EvalABC3Days_5 limit max: 1000 exceeded.") : new Error("EvalABC3Days_5 limit min: 0 exceeded."),
                  EvalABC3Days_6: t(E, 0) ? a(E, 3e3) ? null : new Error("EvalABC3Days_6 limit max: 3000 exceeded.") : new Error("EvalABC3Days_6 limit min: 0 exceeded."),
                  EvalABC3Days_7: t(c, 0) ? a(c, 3e3) ? null : new Error("EvalABC3Days_7 limit max: 3000 exceeded.") : new Error("EvalABC3Days_7 limit min: 0 exceeded."),
                  EvalABC3Days_8: t(u, 0) ? a(u, 1e3) ? null : new Error("EvalABC3Days_8 limit max: 1000 exceeded.") : new Error("EvalABC3Days_8 limit min: 0 exceeded."),
                  EvalABC3Days_9: t(v, 0) ? a(v, 3e3) ? null : new Error("EvalABC3Days_9 limit max: 3000 exceeded.") : new Error("EvalABC3Days_9 limit min: 0 exceeded.")
                };
              },
              limits: {}
            },
            192: {
              name: "Summary",
              length: 9,
              payload: [],
              data: function (e) {
                var r = (e[1] << 8) + e[2], i = (e[3] << 8) + e[4], n = (e[5] << 8) + e[6], l = e[7].toString(16), m = e[8].toString();
                this.data = {
                  Summary: r.toString() + "; " + i.toString() + "; " + n.toString() + "; 0x" + l + "; " + m + "%"
                }, r = t(r, 0) ? a(r, 3e3) ? null : new Error("Summary evalA limit max: 3000 exceeded.") : new Error("Summary evalA limit min: 0 exceeded."),
                  i = t(i, 0) ? a(i, 1e3) ? null : new Error("Summary evalB limit max: 1000 exceeded.") : new Error("Summary evalB limit min: 0 exceeded."),
                  n = t(n, 0) ? a(n, 3e3) ? null : new Error("Summary evalC limit max: 3000 exceeded.") : new Error("Summary evalC limit min: 0 exceeded."),
                  m = t(m, 0) ? a(m, 100) ? null : new Error("Summary battCap limit max: 100 % exceeded.") : new Error("Summary battCap limit min: 0 % exceeded."),
                  this.limits = {
                    Summary: null != r ? r : null != i ? i : null != n ? n : null != m ? m : null
                  };
              },
              limits: {}
            },
            225: {
              name: "ErrorMsg",
              length: 1,
              payload: [],
              data: function () {
                this.data = {
                  MessageTypeText: "Error"
                };
              },
              limits: {}
            },
            224: {
              name: "TestMsg",
              length: 1,
              payload: [],
              data: function () {
                this.data = {
                  MessageTypeText: "Test"
                };
              },
              limits: {}
            },
            74: {
              name: "JoinedString",
              length: 6,
              payload: [],
              data: function (e) {
                var t = String.fromCharCode(parseInt(e[0], 10)) + String.fromCharCode(parseInt(e[1], 10)) + String.fromCharCode(parseInt(e[2], 10)) + String.fromCharCode(parseInt(e[3], 10)) + String.fromCharCode(parseInt(e[4], 10)) + String.fromCharCode(parseInt(e[5], 10));
                this.data = {
                  MessageTypeText: t
                }, this.limits = {
                  MessageTypeText: "JOINED" == t ? null : new Error("JoinedString different than JOINED.")
                };
              },
              limits: {}
            }
          };
          if (o.indexOf() > -1) {
            if (o.indexOf() + o.length != e.bytes.length) return {
              errors: ["Incorrect Checksum."]
            };
            if (o.payload = i(e.bytes, o.indexOf(), o.indexOf() + (o.length - 1)), o.data(o.payload),
              e.bytes.length -= o.length, o.data != function (e, t) {
                var a, r, i = 0;
                e = "ascii" === t ? function (e) {
                  var t = [];
                  e = e.toUpperCase();
                  for (var a = 0; a < e.length; a++) t.push(e.charCodeAt(a));
                  return t;
                }(function (e) {
                  e = Array.prototype.slice.call(e);
                  for (var t = 0; t < e.length; t++) e[t] = ("0" + (255 & e[t]).toString(16)).slice(-2);
                  return e.join("");
                }(e)) : e;
                for (var l = 0; l < e.length; l++) {
                  for (a = e[l] ^ i; (r = n(a)) < 8;) a ^= 67601 << r;
                  i = a >> 8;
                }
                return i;
              }(e.bytes, "ascii")) return {
                errors: ["Incorrect Checksum."]
              };
            o.correct = !0;
          }
          for (var E = 0; E < e.bytes.length; E++) if (e.bytes[E] in s) {
            var c = s[e.bytes[E]], u = i(e.bytes, E, E + (c.length - 1));
            if (u) {
              if (c.payload.length > 0) {
                if (u.toString() !== c.payload.toString()) {
                  if (!o.correct) return {
                    errors: ["Different " + c.name + "."]
                  };
                  d.push("Different " + c.name + ".");
                }
              } else {
                c.payload = u, c.data(u);
                for (var v = Object.keys(c.limits), x = 0; x < v.length; x++) if (v[x] in c.limits && null != c.limits[v[x]] && void 0 !== c.limits[v[x]].message) {
                  if (!o.correct) return {
                    errors: [c.limits[v[x]].message]
                  };
                  d.push(c.limits[v[x]].message);
                }
              }
              E += c.length - 1;
            } else {
              if (!o.correct) return {
                errors: [c.name + " length incorrect."]
              };
              d.push(c.name + " length incorrect."), E += c.length - 1;
            }
          } else {
            if (!o.correct) return {
              errors: ["Unknown identifier at position " + E + "."]
            };
            d.push("Unknown identifier at position " + E + ".");
          }
          for (var y = Object.keys(s), g = 0; g < y.length; g++) y[g] in s && "object" == typeof s[y[g]].data && (m = l(m, s[y[g]].data));
          return {
            data: m,
            warnings: d
          };
        }
        return {
          errors: ["Unknown Input.fPort."]
        };
      }
      return {
        errors: ["Oversized Input.bytes."]
      };
    }
    return {
      errors: ["Unknown Input.bytes."]
    };
  }
  return {
    errors: ["Unknown Input."]
  };
}
