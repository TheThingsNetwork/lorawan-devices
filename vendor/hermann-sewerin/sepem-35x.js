function decodeUplink(e) {
  if (e) {
    if (e.bytes) {
      if (e.bytes.length < 52) {
        if ("number" == typeof e.fPort) {
          for (var t = {}, a = [], n = {
            255: {
              name: "EvalABC",
              length: 7,
              data: function (e) {
                if (e && e.length == this.length) {
                  var t = 255 == e[1] && 255 == e[2] ? "Measurement not available." : (e[1] << 8) + e[2], a = 255 == e[3] && 255 == e[4] ? "Measurement not available." : (e[3] << 8) + e[4], n = 255 == e[5] && 255 == e[6] ? "Measurement not available." : (e[5] << 8) + e[6];
                  this.data = {
                    EvalABC_Noise: t,
                    EvalABC_Frequency: a,
                    EvalABC_Amplitude: n
                  }, this.warnings = {
                    EvalABC_Noise: h(t, 3e3) ? "EvalABC_Noise limit max: 3000 exceeded." : null,
                    EvalABC_Frequency: h(a, 1e3) ? "EvalABC_Frequency limit max: 1000 exceeded." : null,
                    EvalABC_Amplitude: h(n, 3e3) ? "EvalABC_Amplitude limit max: 3000 exceeded." : null
                  };
                } else this.warnings = {
                  EvalABC: "Incorrect EvalABC length."
                };
              },
              warnings: {}
            },
            254: {
              name: "EvalA7Days",
              length: 15,
              data: function (e) {
                if (e && e.length == this.length) {
                  var t = 255 == e[1] && 255 == e[2] ? "Measurement not available." : (e[1] << 8) + e[2], a = 255 == e[3] && 255 == e[4] ? "Measurement not available." : (e[3] << 8) + e[4], n = 255 == e[5] && 255 == e[6] ? "Measurement not available." : (e[5] << 8) + e[6], i = 255 == e[7] && 255 == e[8] ? "Measurement not available." : (e[7] << 8) + e[8], l = 255 == e[9] && 255 == e[10] ? "Measurement not available." : (e[9] << 8) + e[10], r = 255 == e[11] && 255 == e[12] ? "Measurement not available." : (e[11] << 8) + e[12], s = 255 == e[13] && 255 == e[14] ? "Measurement not available." : (e[13] << 8) + e[14];
                  this.data = {
                    EvalA7Days_Noise_Today: t,
                    EvalA7Days_Noise_Day_1: a,
                    EvalA7Days_Noise_Day_2: n,
                    EvalA7Days_Noise_Day_3: i,
                    EvalA7Days_Noise_Day_4: l,
                    EvalA7Days_Noise_Day_5: r,
                    EvalA7Days_Noise_Day_6: s
                  }, this.warnings = {
                    EvalA7Days_Noise_Today: h(t, 3e3) ? "EvalA7Days_Noise_Today limit max: 3000 exceeded." : null,
                    EvalA7Days_Noise_Day_1: h(a, 3e3) ? "EvalA7Days_Noise_Day_1 limit max: 3000 exceeded." : null,
                    EvalA7Days_Noise_Day_2: h(n, 3e3) ? "EvalA7Days_Noise_Day_2 limit max: 3000 exceeded." : null,
                    EvalA7Days_Noise_Day_3: h(i, 3e3) ? "EvalA7Days_Noise_Day_3 limit max: 3000 exceeded." : null,
                    EvalA7Days_Noise_Day_4: h(l, 3e3) ? "EvalA7Days_Noise_Day_4 limit max: 3000 exceeded." : null,
                    EvalA7Days_Noise_Day_5: h(r, 3e3) ? "EvalA7Days_Noise_Day_5 limit max: 3000 exceeded." : null,
                    EvalA7Days_Noise_Day_6: h(s, 3e3) ? "EvalA7Days_Noise_Day_6 limit max: 3000 exceeded." : null
                  };
                } else this.warnings = {
                  EvalA7Days: "Incorrect EvalA7Days length."
                };
              },
              warnings: {}
            },
            253: {
              name: "EvalABCMonth",
              length: 7,
              data: function (e) {
                if (e && e.length == this.length) {
                  var t = 255 == e[1] && 255 == e[2] ? "Measurement not available." : (e[1] << 8) + e[2], a = 255 == e[3] && 255 == e[4] ? "Measurement not available." : (e[3] << 8) + e[4], n = 255 == e[5] && 255 == e[6] ? "Measurement not available." : (e[5] << 8) + e[6];
                  this.data = {
                    EvalABCMonth_Noise: t,
                    EvalABCMonth_Frequency: a,
                    EvalABCMonth_Amplitude: n
                  }, this.warnings = {
                    EvalABCMonth_Noise: h(t, 3e3) ? "EvalABCMonth_Noise limit max: 3000 exceeded." : null,
                    EvalABCMonth_Frequency: h(a, 1e3) ? "EvalABCMonth_Frequency limit max: 1000 exceeded." : null,
                    EvalABCMonth_Amplitude: h(n, 3e3) ? "EvalABCMonth_Amplitude limit max: 3000 exceeded." : null
                  };
                } else this.warnings = {
                  EvalABCMonth: "Incorrect EvalABCMonth length."
                };
              },
              warnings: {}
            },
            252: {
              name: "EvalNoise",
              length: 3,
              data: function (e) {
                if (e && e.length == this.length) {
                  var t = 255 == e[1] && 255 == e[2] ? "Measurement not available." : (e[1] << 8) + e[2];
                  this.data = {
                    EvalNoise: t
                  }, this.warnings = {
                    EvalNoise: h(t, 3e3) ? "EvalNoise limit max: 3000 exceeded." : null
                  };
                } else this.warnings = {
                  EvalNoise: "Incorrect EvalNoise length."
                };
              },
              warnings: {}
            },
            251: {
              name: "EvalFrequency",
              length: 3,
              data: function (e) {
                if (e && e.length == this.length) {
                  var t = 255 == e[1] && 255 == e[2] ? "Measurement not available." : (e[1] << 8) + e[2];
                  this.data = {
                    EvalFrequency: t
                  }, this.warnings = {
                    EvalFrequency: h(t, 1e3) ? "EvalFrequency limit max: 1000 exceeded." : null
                  };
                } else this.warnings = {
                  EvalFrequency: "Incorrect EvalFrequency length."
                };
              },
              warnings: {}
            },
            250: {
              name: "EvalAmplitude",
              length: 3,
              data: function (e) {
                if (e && e.length == this.length) {
                  var t = 255 == e[1] && 255 == e[2] ? "Measurement not available." : (e[1] << 8) + e[2];
                  this.data = {
                    EvalAmplitude: t
                  }, this.warnings = {
                    EvalAmplitude: h(t, 3e3) ? "EvalAmplitude limit max: 3000 exceeded." : null
                  };
                } else this.warnings = {
                  EvalAmplitude: "Incorrect EvalAmplitude length."
                };
              },
              warnings: {}
            },
            249: {
              name: "ActEvalNoise",
              length: 3,
              data: function (e) {
                if (e && e.length == this.length) {
                  var t = 255 == e[1] && 255 == e[2] ? "Measurement not available." : (e[1] << 8) + e[2];
                  this.data = {
                    ActEvalNoise: t
                  }, this.warnings = {
                    ActEvalNoise: h(t, 3e3) ? "ActEvalNoise limit max: 3000 exceeded." : null
                  };
                } else this.warnings = {
                  ActEvalNoise: "Incorrect ActEvalNoise length."
                };
              },
              warnings: {}
            },
            248: {
              name: "FAB",
              length: 5,
              data: function (e) {
                if (e && e.length == this.length) {
                  var t = String(e[1]).padStart(3, "0"), a = String(e[2]).padStart(2, "0"), n = String((e[3] << 8) + e[4]).padStart(6, "0");
                  this.data = {
                    FAB: t + " " + a + " " + n
                  }, this.warnings = {
                    FAB: g(n, 1) ? "Incorrect FAB number." : null
                  };
                } else this.warnings = {
                  FAB: "Incorrect FAB length."
                };
              },
              warnings: {}
            },
            247: {
              name: "DeviceNr",
              length: 3,
              data: function (e) {
                e && e.length == this.length ? this.data = {
                  DeviceNr: (e[1] << 8) + e[2]
                } : this.warnings = {
                  DeviceNr: "Incorrect DeviceNr length."
                };
              },
              warnings: {}
            },
            246: {
              name: "DevState",
              length: 5,
              data: function (e) {
                if (e && e.length == this.length) {
                  var t = ((e[1] << 24) + (e[2] << 16) + (e[3] << 8) + e[4]).toString(16).padStart(8, "0");
                  this.data = {
                    DevState: t
                  };
                } else this.warnings = {
                  DevState: "Incorrect DevState length."
                };
              },
              warnings: {}
            },
            245: {
              name: "MeasTime",
              length: 8,
              data: function (e) {
                if (e && e.length == this.length) {
                  var t = (((e[1] << 8) + e[2] & 65520) >> 4).toString(), a = ((e[1] << 8) + e[2] & 15).toString().padStart(2, "0"), n = e[3].toString().padStart(2, "0"), i = (((e[4] << 16) + (e[5] << 8) + e[6] & 16515072) >> 18).toString().padStart(2, "0"), l = (((e[4] << 16) + (e[5] << 8) + e[6] & 258048) >> 12).toString().padStart(2, "0"), r = new Date(t, a - 1, n, i, l), s = ((e[4] << 16) + (e[5] << 8) + e[6] & 4095).toString(), o = e[7].toString();
                  this.data = {
                    MeasTime: n + "/" + a + "/" + t + " - " + i + ":" + l + "; Duration: " + s + " min.; Counter = " + o
                  }, this.warnings = {
                    MeasTime_Date: m(t, a - 1, n, i, l) ? r >= new Date(2e3, 0, 1, 0, 0) ? r <= new Date ? null : "MeasTime date max exceeded." : "MeasTime date min exceeded." : "MeasTime date format inncorect.",
                    MeasTime_Duration: g(s, 1) ? "MeasTime duration limit min: 1 exceeded." : h(s, 1439) ? "MeasTime duration limit max: 1439 exceeded." : null
                  };
                } else this.warnings = {
                  MeasTime: "Incorrect MeasTime length."
                };
              },
              warnings: {}
            },
            244: {
              name: "MeasTimeExt",
              length: 11,
              data: function (e) {
                if (e && e.length == this.length) {
                  var t = ((e[1] << 8) + e[2]).toString(), a = e[3].toString().padStart(2, "0"), n = e[4].toString().padStart(2, "0"), i = e[5].toString().padStart(2, "0"), l = e[6].toString().padStart(2, "0"), r = new Date(t, a - 1, n, i, l), s = ((e[7] << 8) + e[8]).toString(), o = ((e[9] << 8) + e[10]).toString();
                  this.data = {
                    MeasTimeExt: n + "/" + a + "/" + t + " - " + i + ":" + l + "; Duration: " + s + " min.; Counter = " + o
                  }, this.warnings = {
                    MeasTimeExt_Date: m(t, a - 1, n, i, l) ? r >= new Date(2e3, 0, 1, 0, 0) ? r <= new Date ? null : "MeasTimeExt date max exceeded." : "MeasTimeExt date min exceeded." : "MeasTimeExt date format inncorect.",
                    MeasTimeExt_Duration: g(s, 1) ? "MeasTimeExt duration limit min: 1 exceeded." : h(s, 1439) ? "MeasTimeExt duration limit max: 1439 exceeded." : null
                  };
                } else this.warnings = {
                  MeasTimeExt: "Incorrect MeasTimeExt length."
                };
              },
              warnings: {}
            },
            243: {
              name: "BattCap",
              length: 2,
              data: function (e) {
                if (e && e.length == this.length) {
                  var t = e[1].toString();
                  this.data = {
                    BattCap: t + " %"
                  }, this.warnings = {
                    BattCap: h(t, 100) ? "BattCap limit max: 100 % exceeded." : null
                  };
                } else this.warnings = {
                  BattCap: "Incorrect BattCap length."
                };
              },
              warnings: {}
            },
            242: {
              name: "TimeStamp",
              length: 7,
              data: function (e) {
                if (e && e.length == this.length) {
                  var t = ((e[1] << 8) + e[2]).toString(), a = e[3].toString().padStart(2, "0"), n = e[4].toString().padStart(2, "0"), i = e[5].toString().padStart(2, "0"), l = e[6].toString().padStart(2, "0"), r = new Date(t, a - 1, n, i, l);
                  this.data = {
                    TimeStamp: n + "/" + a + "/" + t + " - " + i + ":" + l + ";"
                  }, this.warnings = {
                    TimeStamp: m(t, a - 1, n, i, l) ? r >= new Date(2e3, 0, 1, 0, 0) ? r <= new Date ? null : "TimeStamp date max exceeded." : "TimeStamp date min exceeded." : "TimeStamp date format inncorect."
                  };
                } else this.warnings = {
                  TimeStamp: "Incorrect TimeStamp length."
                };
              },
              warnings: {}
            },
            241: {
              name: "Error",
              length: 3,
              data: function (e) {
                if (e && e.length == this.length) {
                  var t = (e[1] << 8) + e[2];
                  this.data = {
                    Error: t
                  };
                } else this.warnings = {
                  Error: "Incorrect Error length."
                };
              },
              warnings: {}
            },
            240: {
              name: "Temp",
              length: 2,
              data: function (e) {
                if (e && e.length == this.length) {
                  var t = e[1] > 128 ? e[1] - 256 : e[1];
                  this.data = {
                    Temp: t.toString() + " ℃"
                  }, this.warnings = {
                    Temp: g(t, -40) ? "Temp limit min: -40 ℃ exceeded." : h(t, 85) ? "Temp limit max: 85 ℃ exceeded." : null
                  };
                } else this.warnings = {
                  Temp: "Incorrect Temp length."
                };
              },
              warnings: {}
            },
            239: {
              name: "Sensity",
              length: 2,
              data: function (e) {
                if (e && e.length == this.length) {
                  var t = 2 * (e[1] > 128 ? e[1] - 256 : e[1]);
                  this.data = {
                    Sensity: t.toString() + " dBm"
                  }, this.warnings = {
                    Sensity: g(t, -127) ? "Sensity limit min: -127 dBm exceeded." : h(t, 0) ? "Sensity limit max: 0 dBm exceeded." : null
                  };
                } else this.warnings = {
                  Sensity: "Incorrect Sensity length."
                };
              },
              warnings: {}
            },
            238: {
              name: "Sensor",
              length: 2,
              data: function (e) {
                if (e && e.length == this.length) {
                  var t = 81 == e[1] ? "Noise" : 82 == e[1] ? "Pressure" : 84 == e[1] ? "Temperature" : "Unknown";
                  this.data = {
                    Sensor: t
                  }, this.warnings = {
                    Sensor: 81 == e[1] || 82 == e[1] || 84 == e[1] ? null : "Sensor unknown."
                  };
                } else this.warnings = {
                  Sensor: "Incorrect Sensor length."
                };
              },
              warnings: {}
            },
            237: {
              name: "Interval",
              length: 3,
              data: function (e) {
                if (e && e.length == this.length) {
                  var t = (e[1] << 8) + e[2];
                  this.data = {
                    Interval: t
                  }, this.warnings = {
                    Interval: g(t, 1) ? "Interval limit min: 1 exceeded." : h(t, 3600) ? "Interval limit max: 3600 exceeded." : null
                  };
                } else this.warnings = {
                  Interval: "Incorrect Interval length."
                };
              },
              warnings: {}
            },
            236: {
              name: "DevEUI",
              length: 9,
              data: function (e) {
                if (e && e.length == this.length) {
                  var t = e[1].toString(16).padStart(2, "0") + ":" + (e[2].toString(16).padStart(2, "0") + ":") + (e[3].toString(16).padStart(2, "0") + ":") + (e[4].toString(16).padStart(2, "0") + ":") + (e[5].toString(16).padStart(2, "0") + ":") + (e[6].toString(16).padStart(2, "0") + ":") + (e[7].toString(16).padStart(2, "0") + ":") + e[8].toString(16).padStart(2, "0");
                  this.data = {
                    DevEUI: t
                  };
                } else this.warnings = {
                  DevEUI: "Incorrect DevEUI length."
                };
              },
              warnings: {}
            },
            235: {
              name: "TelIdentExt",
              length: 6,
              data: function (e) {
                if (e && e.length == this.length) {
                  var t = e[1].toString(16).padStart(2, "0") + ":" + (e[2].toString(16).padStart(2, "0") + ":") + (e[3].toString(16).padStart(2, "0") + ":") + (e[4].toString(16).padStart(2, "0") + ":") + e[5].toString(16).padStart(2, "0");
                  this.data = {
                    TelIdentExt: t
                  };
                } else this.warnings = {
                  TelIdentExt: "Incorrect TelIdentExt length."
                };
              },
              warnings: {}
            },
            234: {
              name: "BattVoltage",
              length: 2,
              data: function (e) {
                if (e && e.length == this.length) {
                  var t = e[1] / 20;
                  this.data = {
                    BattVoltage: t.toString() + " V"
                  }, this.warnings = {
                    BattVoltage: h(t, 4) ? "BattVoltage limit max: 4 V exceeded." : null
                  };
                } else this.warnings = {
                  BattVoltage: "Incorrect BattVoltage length."
                };
              },
              warnings: {}
            },
            233: {
              name: "BattVoltage1",
              length: 2,
              data: function (e) {
                if (e && e.length == this.length) {
                  var t = e[1] / 20;
                  this.data = {
                    BattVoltage1: t.toString() + " V"
                  }, this.warnings = {
                    BattVoltage1: h(t, 4) ? "BattVoltage1 limit max: 4 V exceeded." : null
                  };
                } else this.warnings = {
                  BattVoltage1: "Incorrect BattVoltage1 length."
                };
              },
              warnings: {}
            },
            232: {
              name: "BattVoltage2",
              length: 2,
              data: function (e) {
                if (e && e.length == this.length) {
                  var t = e[1] / 20;
                  this.data = {
                    BattVoltage2: t.toString() + " V"
                  }, this.warnings = {
                    BattVoltage2: h(t, 4) ? "BattVoltage2 limit max: 4 V exceeded." : null
                  };
                } else this.warnings = {
                  BattVoltage2: "Incorrect BattVoltage2 length."
                };
              },
              warnings: {}
            },
            231: {
              name: "Histo",
              length: 14,
              data: function (e) {
                if (e && e.length == this.length) {
                  for (var t = "", a = 0; a < 13; a++) t += e[a + 1] / 2, a < 12 && (t += ":");
                  this.data = {
                    Histo: t
                  }, t = null;
                  for (var n = 0; n < 13; n++) if (h(e[n + 1] / 2, 100)) {
                    t = "Histo limit max: 100 % exceeded.";
                    break;
                  }
                  this.warnings = {
                    Histo: t
                  };
                } else this.warnings = {
                  Histo: "Incorrect Histo length."
                };
              },
              warnings: {}
            },
            230: {
              name: "MsgLimitCounter",
              length: 3,
              data: function (e) {
                if (e && e.length == this.length) {
                  var t = (e[1] << 8) + e[2];
                  this.data = {
                    MsgLimitCounter: t
                  };
                } else this.warnings = {
                  MsgLimitCounter: "Incorrect MsgLimitCounter length."
                };
              },
              warnings: {}
            },
            229: {
              name: "EvalABC3Days",
              length: 13,
              data: function (e) {
                if (e && e.length == this.length) {
                  var t = (e[1] << 24) + (e[2] << 16) + (e[3] << 8) + e[4], a = (e[5] << 24) + (e[6] << 16) + (e[7] << 8) + e[8], n = (e[9] << 24) + (e[10] << 16) + (e[11] << 8) + e[12], i = -1 == t ? "Measurement not available." : (4293918720 & t) >> 20 & 4095, l = -1 == t ? "Measurement not available." : 4 * ((1044480 & t) >> 12) & 1023, r = -1 == t ? "Measurement not available." : 4095 & t, s = -1 == a ? "Measurement not available." : (4293918720 & a) >> 20 & 4095, o = -1 == a ? "Measurement not available." : 4 * ((1044480 & a) >> 12) & 1023, g = -1 == a ? "Measurement not available." : 4095 & a, m = -1 == n ? "Measurement not available." : (4293918720 & n) >> 20 & 4095, d = -1 == n ? "Measurement not available." : 4 * ((1044480 & n) >> 12) & 1023, u = -1 == n ? "Measurement not available." : 4095 & n;
                  this.data = {
                    EvalABC3Days_Noise: i,
                    EvalABC3Days_Frequency: 48 == l || 52 == l ? 50 : l,
                    EvalABC3Days_Amplitude: r,
                    EvalABC3Days_Noise_1: s,
                    EvalABC3Days_Frequency_1: 48 == o || 52 == o ? 50 : o,
                    EvalABC3Days_Amplitude_1: g,
                    EvalABC3Days_Noise_2: m,
                    EvalABC3Days_Frequency_2: 48 == d || 52 == d ? 50 : d,
                    EvalABC3Days_Amplitude_2: u
                  }, this.warnings = {
                    EvalABC3Days_Noise: h(i, 3e3) ? "EvalABC3Days_Noise limit max: 3000 exceeded." : null,
                    EvalABC3Days_Frequency: h(l, 1e3) ? "EvalABC3Days_Frequency limit max: 1000 exceeded." : null,
                    EvalABC3Days_Amplitude: h(r, 3e3) ? "EvalABC3Days_Amplitude limit max: 3000 exceeded." : null,
                    EvalABC3Days_Noise_1: h(s, 3e3) ? "EvalABC3Days_Noise_1 limit max: 3000 exceeded." : null,
                    EvalABC3Days_Frequency_1: h(o, 1e3) ? "EvalABC3Days_Frequency_1 limit max: 1000 exceeded." : null,
                    EvalABC3Days_Amplitude_1: h(g, 3e3) ? "EvalABC3Days_Amplitude_1 limit max: 3000 exceeded." : null,
                    EvalABC3Days_Noise_2: h(m, 3e3) ? "EvalABC3Days_Noise_2 limit max: 3000 exceeded." : null,
                    EvalABC3Days_Frequency_2: h(d, 1e3) ? "EvalABC3Days_Frequency_2 limit max: 1000 exceeded." : null,
                    EvalABC3Days_Amplitude_2: h(u, 3e3) ? "EvalABC3Days_Amplitude_2 limit max: 3000 exceeded." : null
                  };
                } else this.warnings = {
                  EvalABC3Days: "Incorrect EvalABC3Days length."
                };
              },
              warnings: {}
            },
            225: {
              name: "ErrorMsg",
              length: 1,
              data: function (e) {
                this.data = {
                  MessageTypeText: "Error"
                };
              },
              warnings: {}
            },
            224: {
              name: "TestMsg",
              length: 1,
              data: function (e) {
                this.data = {
                  MessageTypeText: "Test"
                };
              },
              warnings: {}
            },
            208: {
              name: "Checksum",
              length: 3,
              payload: [],
              data: function (e) {
                e && e.length == this.length ? this.data = (e[1] << 8) + e[2] : this.warnings = {
                  Checksum: "Incorrect Checksum length."
                };
              },
              correct: function (e, t) {
                return (e = [].concat(e)).splice([t], this.length), this.data == function (e, t) {
                  var a, n, i = 0, l = 67601;
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
                  for (var r = 0; r < e.length; r++) {
                    for (a = e[r] ^ i; (n = u(a)) < 8;) a ^= l << n;
                    i = a >> 8;
                  }
                  return i;
                }(e, "ascii");
              },
              warnings: {}
            },
            192: {
              name: "Summary",
              length: 9,
              data: function (e) {
                if (e && e.length == this.length) {
                  var t = 255 == e[1] && 255 == e[2] ? "Measurement not available." : (e[1] << 8) + e[2], a = 255 == e[3] && 255 == e[4] ? "Measurement not available." : (e[3] << 8) + e[4], n = 255 == e[5] && 255 == e[6] ? "Measurement not available." : (e[5] << 8) + e[6], i = e[7].toString(16), l = e[8].toString();
                  this.data = {
                    Summary: t.toString() + "; " + a.toString() + "; " + n.toString() + "; 0x" + i + "; " + l + "%"
                  }, this.warnings = {
                    Summary_evalNoise: h(t, 3e3) ? "Summary evalNoise limit max: 3000 exceeded." : null,
                    Summary_evalFrequency: h(a, 1e3) ? "Summary evalFrequency limit max: 1000 exceeded." : null,
                    Summary_evalAmplitude: h(n, 3e3) ? "Summary evalAmplitude limit max: 3000 exceeded." : null,
                    Summary_battCap: h(l, 100) ? "Summary battCap limit max: 100 % exceeded." : null
                  };
                } else this.warnings = {
                  Summary: "Incorrect Summary length."
                };
              },
              warnings: {}
            },
            74: {
              name: "JoinedString",
              length: 6,
              data: function (e) {
                if (e && e.length == this.length) {
                  var t = String.fromCharCode(parseInt(e[0], 10)) + String.fromCharCode(parseInt(e[1], 10)) + String.fromCharCode(parseInt(e[2], 10)) + String.fromCharCode(parseInt(e[3], 10)) + String.fromCharCode(parseInt(e[4], 10)) + String.fromCharCode(parseInt(e[5], 10));
                  this.data = {
                    MessageTypeText: t
                  }, this.warnings = {
                    MessageTypeText: "JOINED" == t ? null : "JoinedString different than JOINED."
                  };
                } else this.warnings = {
                  MessageTypeText: "Incorrect MessageTypeText length."
                };
              },
              warnings: {}
            }
          }, i = 0; i < e.bytes.length; i++) if (e.bytes[i] in n) {
            var l = Object.create(n[e.bytes[i]]), r = d(e.bytes, i, i + (l.length - 1));
            if (r) {
              if (l.data(r), "Checksum" === l.name) {
                if (!l.correct(e.bytes, i)) return {
                  errors: ["Incorrect Checksum."]
                };
              } else {
                t = Object.assign(t, l.data);
                for (var s = Object.keys(l.warnings), o = 0; o < s.length; o++) s[o] in l.warnings && null != l.warnings[s[o]] && void 0 !== l.warnings[s[o]] && a.push(l.warnings[s[o]]);
              }
              i += l.length - 1;
            } else a.push("Incorrect payload length."), i += l.length - 1;
          } else a.push("Unknown identifier at position " + i + ".");
          return a && a.length > 0 ? {
            data: t,
            warnings: a
          } : {
            data: t
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
  function g(e, t) {
    return "Measurement not available." != e && e < t;
  }
  function h(e, t) {
    return "Measurement not available." != e && e > t;
  }
  function m(e, t, a, n, i) {
    var l = new Date(e, t, a, n, i);
    return l.getFullYear() == e && l.getMonth() == t && l.getDate() == a && l.getHours() == n && l.getMinutes() == i;
  }
  function d(e, t, a) {
    for (var n = []; t <= a;) {
      if (-1 === e.indexOf(e[t])) return !1;
      n.push(e[t]), t++;
    }
    return n;
  }
  function u(e) {
    for (var t = 0; 0 == (e >> t & 1) && t < 8;) t++;
    return t;
  }
}