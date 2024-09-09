/**
 * tmbus JavaScript Library v1.0.0
 * https://github.com/dev-lab/tmbus
 *
 * Copyright (c) 2023 Taras Greben
 * Released under the Apache License
 * https://dev-lab.github.com/tmbus/LICENSE
 */

function ln(t) {
	return t ? t.length || 0 : 0;
}

function sNc(c, i) {
	return i > 0 ? Array(i + 1).join(c) : "";
}

function sIn(s, i, n) {
	return i ? s.slice(0, i) + n + s.slice(i) : n + s;
}

function p10(n, e) {
	if (!e) return n;
	var s = ln(n);
	if (!s) {
		var i = parseInt(n);
		if (n !== i) return isNaN(i) ? n : n * Math.pow(10, e);
	}
	var t = "" + n, b = (s ? t[0] == "-" : n < 0) ? 1 : 0, l = ln(t);
	if (e > 0) t += sNc("0", e);
	else {
		e += l - b;
		if (e < 0) t = sIn(t, b, sNc("0", -e));
		t = sIn(t, e <= 0 ? b : e + b, ".");
	}
	return s ? t : Number(t);
}

function ha2si(a) {
	var l = ln(a = a.slice()), d = [], r = a[l - 1], m = r & 128, i, f;
	if (m) for (i = f = 0; i < l; ++i) if (a[i] || f) {
		a[i] = 256 - a[i] - f;
		f = 1;
	}
	for (i = l, f = 0; i;) if (a[--i]) f = 1;
	if (!f) return 0;
	do {
		r = f = 0, i = l;
		while (i) {
			var n = r * 256 + a[--i];
			r = n % 10;
			if (a[i] = (n - r) / 10) f = 1;
		}
		d.push(r);
	} while (f);
	for (i = ln(d); !d[--i];);
	return (m ? "-" : "") + d.slice(0, ++i).reverse().join("");
}

function i2s(v, n) {
	var r = v ? v.toString() : "0", l = ln(r);
	return n ? (l < n ? sNc("0", n - l) : "") + r : r;
}

function sum(a, b, e) {
	var r = 0, i = b || 0;
	while (i < (e || ln(a))) r += a[i++];
	return r & 0xFF;
}

function parseHs(s) {
	var p = s ? s.split(/[\s,]/) : [], r = [], t, i = 0;
	while (i < ln(p)) if (ln(t = p[i++])) r = r.concat(t.match(/.{1,2}/g));
	return r;
}

function hs2i(s) {
	return Number("0x" + s.replace(/^#/, ''));
}

function hs2a(s) {
	var a = parseHs(s), r = [], v, i = 0;
	while (i < ln(a)) {
		v = hs2i(a[i++]);
		if (isNaN(v) || v < 0 || v > 255) throw '"' + a[i] + '" is not a hex byte, pos ' + i;
		r.push(v);
	}
	return r;
}

function b2hs(i) {
	i = Number(i);
	return (i < 16 ? "0" : "") + i.toString(16);
}

function ba2hs(a, s) {
	var r = [], i = 0;
	while (i < ln(a)) r.push(b2hs(a[i++]));
	return r.join(s || "");
}

function ba2i(a) {
	var i = ln(a);
	if (!i || i > 4) return i ? a : 0;
	var r = a[--i], m = i == 3 ? 0 : r & 128 ? (r &= 127, -(1 << i * 8 + 7)) : 0;
	while (i) r = (r << 8) + a[--i];
	return r + m;
}

function ba2b(a) {
	var i = ln(a), r = 0;
	while (i) r = (r << 8) + a[--i];
	return r;
}

function ba2bcd(a, x) {
	var r = 0, i = ln(a), v, h, l, s = "", e = 0, m = 0;
	function p(c) {
		if (m) c = -c;
		if (c < 10) s += c;
		else e = 1, s += "A-C EF".charAt(c - 10);
	}
	while (i) {
		v = a[--i], h = (v & 0xF0) >> 4, l = v & 0xF;
		if (m) h = -h, l = -l;
		r = r * 100 + h * 10 + l;
		p(h);
		if (1 == ln(s)) {
			e = 0;
			if (h == 13) e = 1;
			else if (h > 13) {
				m = 1, l = -l, r = l;
				if (h == 14) r -= 10;
			}
		}
		p(l);
	}
	if (!x && e) throw s;
	return e ? s : r;
}

function i2c(i) {
	return String.fromCharCode(i);
}

function ba2s(a) {
	var r = [], i = ln(a);
	while (i) r.push(i2c(a[--i]));
	return r.join("");
}

function date(y, m, d) {
	return {
		rawY: y, y: 1900 + y + (y < 100 ? 100 : 0), m: m, d: d,
		toString: function () {
			var t = this, r = i2s(d, 2) + "." + i2s(m, 2) + "." + t.y;
			if (t.hr !== undefined) r += " " + i2s(t.hr, 2) + ":" + i2s(t.mi, 2)
				+ (t.se !== undefined ? (":" + i2s(t.se, 2)) : "");
			if (t.s) r += " (summer)";
			if (t.i) r += " (invalid)";
			return r;
		}
	};
}

function i2d(i) {
	return i ? date(i >> 5 & 7 | i >> 9 & 0x78, i >> 8 & 0xF, i & 0x1F) : null;
}

function i2t(i) {
	var l = ln(i) || 0, b = l > 5 ? 1 : 0, s = b ? i[--l] : 0, i = l ? ba2b(i.slice(b, l)) : i;
	if (!i) return null;
	var r = i2d(i >> 16);
	r.hr = i >> 8 & 0x1F;
	r.mi = i & 0x3F;
	if (b) r.se = s & 0x3F;
	if (i & 0x8000) r.s = true;
	if (i & 0x80) r.i = true;
	return r;
}

function ba2f(a) {
	var l = ln(a) - 1, s = 7;
	if (l == 7) s = 4;
	else if (l != 3) return NaN;
	var b = l - 1, m = (1 << s) - 1, f = (a[b] & m) << b * 8, h = 1 << b * 8 + s, y = 1 << 14 - s,
		e = (a[b] >> s) + ((a[l] & 0x7F) << 8 - s) + 1 - y, g = a[l] >> 7 ? -1 : 1, i;
	for (i = 0; i < b; ++i) f += a[i] << i * 8;
	if (e == y) return g * (f ? NaN : Number.POSITIVE_INFINITY);
	if (f) f = e == 1 - y ? f / (h >> 1) : (f | h) / h;
	return g * f * Math.pow(2, e);
}

function hexSum(h, c, s) {
	var a = hs2a(h), l = ln(a);
	if (l > 1 && l < 256 && c) {
		a.push(sum(a));
		a.push(0x16);
		if (l < 3) a.splice(0, 0, 0x10);
		else a.splice(0, 0, 0x68, l, l, 0x68);
	}
	return ba2hs(a, s);
}

function tmbus(h) {

	var a = hs2a(h), isA = Array.isArray, O = [0], MS = "Manufacturer specific", R = "Reserved", UH = "Units for H.C.A.";
	while (ln(a)) if (a[0] != 255) break; else a.splice(0, 1);
	var l = ln(a), e = l - 2, r = { len: l }, id = 0, n = 0, c, w;
	if (!l) return r;

	function er(s) {
		throw (s || "Wrong frame length") + ", pos " + n;
	}

	function i() {
		if (n == l) er();
		return c = a[n++];
	}

	function sl(t, s) {
		var p = n, r = s + n;
		if (r > e) er("Premature end of data when reading " + t + " (need " + s + ", available " + (e - n) + ")");
		n = r;
		return a.slice(p, n);
	}

	function ii(t, b, s) {
		var r = sl(t, s || 4);
		return b ? ba2i(b == 2 ? r.reverse() : r) : ba2bcd(r, 1);
	}

	function aSum(b) {
		if (sum(a, b, e) != a[e]) er("Check sum failed");
	}

	i();
	if (l == 1) {
		c == 0xe5 ? r.type = "OK" : er("Invalid char");
		return r;
	}
	if (l < 5) er();
	if (a[l - 1] != 0x16) er("No Stop");
	if (c == 0x10) {
		r.type = "Short";
		aSum(1);
		r.c = i();
		r.a = i();
		return r;
	}
	if (c != 0x68) er("No Start");
	r.type = "Data";
	r.l = i();
	if (a[2] != c) er("Invalid length");
	if (a[0] != a[3]) er("Invalid format");
	if (c != l - 6) er("Wrong length");
	aSum(n = 4);
	r.c = i();
	r.a = i();
	r.ci = i();
	w = r.errors = [];
	if ((c & 0xFA) == 0x72) r.fixed = (c & 1) == 1;
	else {
		r.type = "Error";
		var s = ["Unspecified error", "Unimplemented CI-Field", "Buffer too long, truncated", "Too many records",
			"Premature end of record", "More than 10 DIFE's", "More than 10 VIFE's",
			R, "Application too busy for handling readout request", "Too many readouts"];
		if (c == 0x70) {
			w.push(s[n == e ? 0 : i() < 10 ? c : 7]);
			return r;
		}
		er(s[1]);
	}
	r.id = ii("ID");

	var M = " meter", S = ["Heat" + M, "Cooling" + M, " (Volume measured at ", "return temperature: outlet)", "flow temperature: inlet)", "Customer unit", "Radio converter ", "Access Code "],
		D = ["Other", "Oil" + M, "Electricity" + M, "Gas" + M, S[0], "Steam" + M, "Hot water" + M, "Water" + M, "Heat Cost Allocator", R,
			S[0] + S[2] + S[3], "Compressed air", S[1] + S[2] + S[3], S[1] + S[2] + S[4], S[0] + S[2] + S[4], "Combined Heat / " + S[1], "Bus / System component", "Unknown device type", "Cold water" + M, "Dual water" + M,
			"Pressure" + M + " / pressure device", "A/D Converter", "Warm water" + M, "Calorific value", "Smoke detector / smoke alarm device", "Room sensor", "Gas detector", "Consumption" + M, "Sensor", "Breaker (electricity)",
			"Valve (gas or water)", "Switching device", S[5] + " (display device)", S[5], "Waste water" + M, "Garbage", "Carbon dioxide", "Environmental" + M, "System device", "Communication controller",
			"Unidirectional repeater", "Bidirectional repeater", S[6] + "(system side)", S[6] + "(meter side)", "Wired Adapter"],
		fD = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 3, 4, 5, 6, 7, 8, 9],
		vD = [0, 1, 2, 3, 10, 5, 22, 7, 8, 11, 12, 13, 14, 15, 16, 17,
			27, 27, 27, 27, 23, 6, 18, 19, 20, 21, 24, 25, 26, 28, 28, 28,
			29, 30, 31, 31, 31, 32, 33, 33, 34, 35, 36, 37, 37, 37, 37, 37,
			38, 39, 40, 41, 38, 38, 42, 43, 44],
		vFunc = ["Instantaneous", "Maximum", "Minimum", "During error state"];

	function i2fu(i) {
		var U = ["Wh", "kWh", "MWh", "kJ", "MJ", "GJ", "W", "kW", "MW", "kJ/h", "MJ/h", "GJ/h", "ml", "l", "m\xB3", "ml/h", "l/h", "m\xB3/h"];
		return i < 2 ? [["h,m,s", "D,M,Y"][i], 0]
			: i < 0x38 ? [U[Math.floor((i - 2) / 3)], (i - 2) % 3]
				: i < 0x39 ? ["\xB0C", -3]
					: i < 0x3A ? [UH, 0]
						: [R, 0];
	}

	function m2c(i) {
		return i2c((i & 0x1F) + 64);
	}

	function deManIdi(n) {
		return m2c(n >> 10) + m2c(n >> 5) + m2c(n);
	}

	function deManId(a, n) {
		return deManIdi(ii("ManID", 1, 2));
	}

	function deD(i) {
		return D[i > 0x3F ? 9 : i > 0x38 ? 38 : vD[i]];
	}

	function deS(r) {
		var s = r.status;
		if (r.fixed) r.cStored = s & 2 ? "At fixed date" : "Actual";
		else {
			if ((s & 3) != 3) {
				if (s & 1) w.push("Application Busy");
				if (s & 2) w.push("Application Error");
			}
		}
		if (s & 4) w.push("Power Low");
		if (s & 8) w.push("Permanent Error");
		if (s & 16) w.push("Temporary Error");
		return s & 1;
	}

	function nv() {
		if (!r.data) r.data = [];
		var v = { id: id++ };
		r.data.push(v);
		return v;
	}

	function sD(d, m) {
		r.deviceCode = d;
		r.deviceType = m;
	}

	function pF() {
		r.accessN = i();
		r.status = i();
		var s = deS(r), u1 = i(), u2 = i(), m = (u1 >> 6) | (u2 >> 4 & 0xC);
		sD(m, D[fD[m]]);
		if (m > 9 && m < 15 && s) s = 2;
		var x = nv(), y = nv(), ux = i2fu(u1 & 0x3f), vy = u2 & 0x3f, uy, v = 1;
		x.storage = 0;
		x.func = vFunc[0];
		x.value = p10(ii("Counter 1", s), ux[1]);
		x.unit = ux[0];
		if (vy == 0x3e) uy = ux;
		else {
			v = 0;
			if (vy != 0x3f) uy = i2fu(vy);
		}
		y.storage = v;
		y.func = vFunc[0];
		v = ii("Counter 2", s);
		y.value = uy ? p10(v, uy[1]) : v;
		y.unit = uy ? uy[0] : "";
	}

	function rif(i) {
		var v = ln(i);
		v = v ? i[v - 1] : 128;
		while (n < e && v >> 7) {
			v = a[n++];
			i.push(v);
		}
		return i;
	}

	var T = ["Reserved", "Energy", "Volume", "Mass", "On Time", "Operating Time", "Power", "Volume Flow", "Volume Flow ext.", "Mass flow",
		"Flow Temperature", "Return Temperature", "Temperature Difference", "External Temperature", "Pressure", "Time Point", UH, "Averaging Duration", "Actuality Duration", "Credit",
		"Debit", "Access Number", "Medium", "Manufacturer", "Parameter set id", "Model/Version", "Hardware version #", "Firmware version #", "Software version #", "Customer location",
		"Customer", S[7] + "User", S[7] + "Operator", S[7] + "System Operator", S[7] + "Developer", "Password", "Error flags", "Error mask", "Digital Output", "Digital Input",
		"Baudrate", "Response delay time", "Retry", "First cyclic storage #", "Last cyclic storate #", "Storage block size", "Storage interval", "Duration since last readout", "Start of tariff", "Duration of tariff",
		"Period of tariff", "Voltage", "Current", "Dimensionless", "Reset counter", "Cumulation counter", "Control signal", "Day of week", "Week number", "Time point of day change",
		"State of parameter activation", "Special supplier information", "Duration since last cumulation", "Operating time battery", "Battery change", "Cold/Warm Temperature Limit", "Cumul. count max power"
	], U = ["seconds", "minutes", "hours", "days", "months", "years", "Wh", "J", "m\xB3", "kg",
		"W", "J/h", "m\xB3/h", "m\xB3/min", "m\xB3/s", "kg/h", "\xB0C", "K", "bar", "currency unit",
		"binary", "baud", "bittimes", "V", "A", "MWh", "GJ", "t", "feet\xB3", "american gallon",
		"american gallon/min", "american gallon/h", "MW", "GJ/h", "\xB0F", "revolution / measurement", "liter", "kWh", "kW", "K*l"
	];

	function deV(v, b, n) {
		v.type = T[b[0]];
		var e = b[1];
		if (ln(b) > 1) {
			if (e == 5) {
				e = 9;
				n += 2;
			}
			if (e == 9) v.unit = U[n];
			else if (e == 8) {
				v.type += " (" + (n ? "time & " : "") + "date)";
				v.f = n == 1 ? i2t : i2d;
			} else if (e > 5) v.f = e == 7 ? deD : deManIdi;
			else {
				v.unit = U[b[2]];
				v.e = n + b[1];
			}
		}
	}

	function deVif(v, d) {
		var t = d >> 3 & 0xF, n = d & 7, m = [
			[1, -3, 6],
			[1, 1, 7],
			[2, -6, 8],
			[3, -3, 9],
			[[4, 9], [5, 9]],
			[6, -3, 10],
			[6, 1, 11],
			[7, -6, 12],
			[8, -7, 13],
			[8, -9, 14],
			[9, -3, 15],
			[[10, -3, 16], [11, -3, 16]],
			[[12, -3, 17], [13, -3, 16]],
			[[14, -3, 18], [[15, 8], [[16], O]]],
			[[17, 9], [18, 9]]];
		if (t == 0xF) {
			if (n < 3) v.type = ["Fabrication No", "(Enhanced)", "Bus Address"][n];
		} else {
			var b = m[t], i = 2;
			for (; isA(b[0]); n &= 0xF ^ 1 << i, b = b[d >> i-- & 1]);
			deV(v, b, n);
		}
	}

	function deVifD(v, d) {
		var t = d >> 2 & 0xF, n = d & 3, m = [
			[19, -3, 19],
			[20, -3, 19],
			[[21], [22, 7], [23, 6], [24]],
			[[25], [26], [27], [28]],
			[[29], [30], [31], [32]],
			[[33], [34], [35], [36, 0, 20]],
			[[37], O, [38, 0, 20], [39, 0, 20]],
			[[40, 0, 21], [41, 0, 22], [42], O],
			[[43], [44], [45], O],
			[46, 9],
			[[46, 0, 4], [46, 0, 5], O, O],
			[47, 9],
			[[48, 8], [49, 0, 1], [49, 0, 2], [49, 0, 3]],
			[50, 9],
			[[50, 0, 4], [50, 0, 5], [53], O],
			O,
			[[54], [55], [56], [57]],
			[[58], [59], [60], [61]],
			[62, 5],
			[63, 5],
			[[64, 8]]
		];
		if (d & 0x40) t = (t & 7) + 16;
		var b = d > 0x70 ? O : m[t];
		if ((d & 0x60) == 0x40) {
			t = d & 16;
			n = d & 0xF;
			b = t ? [52, -12, 24] : [51, -9, 23];
		} else {
			if (isA(b[0])) {
				b = b[n];
				n = 0;
			}
		}
		deV(v, b, n);
	}

	function deVifB(v, d) {
		var t = d >> 3 & 0xF, n = d & 7, m = [
			[[[1, -1, 25]]],
			[[[1, -1, 26]]],
			[[[2, 2, 8]]],
			[[[3, 2, 27]]],
			[[[O, [2, -1, 28]], [[2, -1, 29], [2, 0, 29]]], [[[7, -3, 30], [7, 0, 30]], [[7, 0, 31], O]]],
			[[[6, -1, 32]]],
			[[[6, -1, 33]]],
			O,
			O,
			O,
			O,
			[[10, -3, 34], [11, -3, 34]],
			[[12, -3, 34], [13, -3, 34]],
			O,
			[[65, -3, 34], [65, -3, 16]],
			[66, -3, 10]];
		var b = m[t], i = 2;
		for (; isA(b[0]); n &= 0xF ^ 1 << i, b = d >> i-- & 1 ? (ln(b) < 2 ? O : b[1]) : b[0]);
		deV(v, b, n);
	}

	function deVife(v, d) {
		var e, t = d & 7, p = "per ", m = "multiplied by sek", o = t & 2 ? "out" : "in",
			w = d & 8 ? "upper" : "lower", f = d & 4 ? "last" : "first", b = d & 1 ? "end" : "begin",
			D = "Duration of ", L = " limit exceed";
		e = d < 2 ? (d ? "Too many DIFE's" : e)
			: d < 8 ? ["Storage number", "Unit number", "Tariff number", "Function", "Data class", "Data size"][t - 2] + " not implemented"
				: d < 0xb ? e
					: d < 0x10 ? ["Too many VIFE's", "Illegal VIF-Group", "Illegal VIF-Exponent", "VIF/DIF mismatch", "Unimplemented action"][t - 3]
						: d < 0x15 ? e
							: d < 0x19 ? ["No data available (undefined value)", "Data overflow", "Data underflow", "Data error"][t - 5]
								: d < 0x1C ? "Premature end of record"
									: d < 0x20 ? e
										: d < 0x27 ? p + U[t].slice(0, -1)
											: d < 0x28 ? p + U[35]
												: d < 0x2C ? "increment per " + o + "put pulse on " + o + "put channel #" + (d & 1)
													: d < 0x36 ? p + U[[36, 8, 9, 17, 37, 26, 38, 39, 23, 24][d - 0x2C]]
														: d < 0x37 ? m
															: d < 0x39 ? m + " / " + U[24 - (d & 1)]
																: d < 0x3D ? ["start date(/time) of", "VIF contains uncorrected unit instead of corrected unit", "Accumulation only if positive contributions",
																	"Accumulation of abs value only if negative contributions"][t - 1]
																	: d < 0x40 ? T[0]
																		: d < 0x4A ? (t ? "# of exceeds of " + w + " limit" : w + " limit value")
																			: d < 0x50 ? "Date (/time) of: " + b + " of " + f + " " + w + L
																				: d < 0x60 ? D + f + " " + w + L + ", " + U[t & 3]
																					: d < 0x68 ? D + f + ", " + U[t & 3]
																						: d < 0x70 ? (t & 2 ? "Date (/time) of " + f + " " + b : e)
																							: d < 0x78 ? (v.e = (v.e || 0) + t - 6, e)
																								: d < 0x7C ? "Additive correction constant: 10E" + (t - 3) + "*" + v.type + " (offset)"
																									: d < 0x7D ? e
																										: d < 0x7E ? (v.e = (v.e || 0) + 3, e)
																											: ["future value", MS + " data next"][t & 1];
		if (e) v.typeE.push(e);
	}

	function deVifs(v) {
		var y = v.vif, l = ln(y), i = 0, t = y[i], m = 0x7F, d = t & m, b;
		if (t == 0xFD || t == 0xFB) {
			d = y[++i] & m;
			(t == 0xFD ? deVifD : deVifB)(v, d);
		} else if (d < 0x7C) deVif(v, d);
		else if (d == 0x7C) {
			b = a[(n -= l - 2) - 1];
			v.type = ba2s(sl("VIF type", b));
			y = v.vif = rif([t]);
			l = ln(y);
		}
		if (d == m) v.type = MS;
		if (!(y[i] >> 7)) return;
		if (d != m) ++i;
		v.typeE = [];
		b = 0;
		while (i < l && i < 11) {
			t = y[i++], d = t & m;
			b ? v.typeE.push(d) : (b = d == m, deVife(v, d));
			if (!(t & 0x80)) break;
		}
		if (!ln(v.typeE)) delete v.typeE;
	}

	function rv(v) {
		deVifs(v);
		var y = v.dif, l = ln(y) - 1, p, i, d = y[0], f = d >> 4 & 3, t = d & 0xF, m, b = d & 7, u, s;
		if (t == 0xD) {
			p = b = a[n++];
			if (b < 0xC0) m = ba2s;
			else {
				b &= 0xF;
				if (p > 0xEF) {
					if (p < 0xFB) m = ba2f;
				} else {
					m = p > 0xDF ? ba2i : ba2bcd;
					s = (p & 0xF0) == 0xD0;
				}
			}
		} else {
			if (b == 5) {
				--b;
				m = ba2f;
			} else {
				if (b == 7) ++b;
				m = t & 8 ? ba2bcd : ba2i;
			}
		}
		i = t = sl("Record #" + v.id, b);
		if (m) {
			try {
				t = m(t);
			} catch (e) {
				v.error = true;
				t = e;
			}
		}
		if (!v.error) {
			if (v.f) t = v.f(t);
			m = Array.isArray(t);
			if (m) t = ha2si(t);
			if (s) t = m ? (t[0] == "-" ? t.slice(1) : ("-" + t)) : -t;
			if (v.e) t = p10(t, v.e);
		}
		v.value = t;
		v.rawValue = i;
		v.func = vFunc[f];
		d >>= 6; f = d & 1; i = t = u = 0;
		if (d & 2) {
			for (; i < l; ++i) {
				d = y[i + 1];
				u += (d >> 6 & 1) << i;
				t += (d >> 4 & 3) << i * 2;
				f += (d & 0xF) << i * 4 + 1;
			}
			v.device = u;
			v.tariff = t;
		}
		v.storage = f;
		delete v.f;
		delete v.e;
	}

	function pV() {
		r.manId = deManId(a, n);
		r.version = i(), i();
		sD(c, deD(c));
		r.accessN = i();
		r.status = i();
		deS(r);
		n += 2;
		while (n < e - 1) {
			var t = a[n], v = t == 0x2F ? v : nv();
			if ((t & 0xF) == 0xF) {
				t = t >> 4 & 7; ++n;
				if (t < 2) {
					if (t) v.request = "Readout again";
					v.type = MS;
					v.value = sl(v.type, e - n);
				} else if (t > 6) v.request = "Global readout";
			} else {
				v.dif = rif([]);
				v.vif = rif([]);
				rv(v);
			}
		}
	}

	r.fixed ? pF() : pV();
	return r;
}

function unitConv(cfg, f) {

	var U = ["J", "Wh", "W", "J/h"], P = ["", "k", "M", "G"], k, g;

	function x(d) {
		var u = d.unit, v = d.value, m;
		if (u && v) {
			if (m = k[u]) try {
				d.value = p10(v, m[0]);
				d.unit = m[1];
			} catch (e) { }
		}
		if (g) try {
			g(d);
		} catch (e) { }
	}

	function p(d) {
		var a, i;
		if (d && (a = d.data)) for (i in a) x(a[i]);
		return d;
	}

	function c(d, f) {
		k = {}, g = f;
		var u, c, o, n, v;
		if (d) for (o in d) {
			c = d[o], u = U.indexOf(o), v = P.indexOf(c);
			if (u >= 0 && v >= 0) for (n in P) k[P[n] + o] = [(n - v) * 3, c + o];
		}
	}

	c(cfg, f);

	return {
		getUnits: function () { return U.slice(); },
		getPrefixes: function () { return P.slice(); },
		config: c,
		process: p
	};

}


function decodeUplink(input) {
	var ashex = input.bytes.reduce(function (acc, num) {
		return acc + ('0' + num.toString(16)).slice(-2).toUpperCase();
	}, '');

	var FrameIndex = parseInt(ashex.substr(0, 2), 16);
	var BatchFrames = parseInt(ashex.substr(2, 2), 16);
	var parsed = {};
	var errors = [];

	if (FrameIndex === 1 && BatchFrames === 1) {
		parsed = tmbus(ashex.substr(4));
	} else {
		errors.push("Fragmentation not supported -> use Akenza.io to decode fragmented frames");
	}
	return {
		data: parsed,
		warnings: [],
		errors: errors
	};
}
