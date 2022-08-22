function decodeUplink(input) {
	var data = Parse_Receive_MIB(input.bytes);
	return {
		data: data,
		warnings: [],
		errors: []
	};
}

var loraparameter = {
	OnGetMeterDataCallback: function(data) {
		data.notification = 'meterdata';
		return LoraTrapGet(data);
	},
	OnGetMeterTrapCallback: function(data) {
		data.notification = 'metertrap';
		return LoraTrapGet(data);
	},
	OnGetJoinIntervalCallback: function(data) {
		data.notification = 'joinIntervalTrap';
		return LoraTrapGet(data);
	},
	OnGetEEPEraseCallback: function(data) {
		data.notification = 'EepEraseTrap';
		return LoraTrapGet(data);
	},
	OnGetEnableDisableADRCallback: function(data) {
		data.notification = 'EnableDisableADR';
		return LoraTrapGet(data);
	},
	OnGetCombinedCommissioningCallback: function(data) {
		data.notification = 'CombinedCommissioning';
		return LoraTrapGet(data);
	},
	OnGetLDRCountCallback: function(data) {
		data.notification = 'LDRCount';
		return LoraTrapGet(data);
	},
	OnSetNodeRFPropertyCallback: function(data) {
		data.notification = 'noderfproperty';
		return LoraTrapGet(data);
	},
	OnGetNodeRFPropertyCallback: function(data) {
		data.notification = 'noderfproperty';
		return LoraTrapGet(data);
	},
};

var G_APP_PORTDATA = {
	LightOnOff: {
		GetRequest: '10',
		GetResponse: '11',
		SetRequest: '12',
	},
	BrightnessLevel: {
		GetRequest: '13',
		GetResponse: '14',
		SetRequest: '15',
	},
	DeviceProperty: {
		GetRequest: '0d',
		GetResponse: '0e',
	},
	MeterDataUplink: {
		GetRequest: '57',
		GetResponse: '58',
	},
	MeterDataTrap: {
		Get: '00'
	},
	LoraRFProperty: {
		GetRequest: '04',
		SetRequest: '06',
		GetResponse: '05',
		SetResponse: '07'
	},
	GetSetJoinInterval: {
		SetRequest: '40',
		GetRequest: '3e',
		GetResponse: '3f',
		SetResponse: '41'
	},
	EpromErase: {
		SetRequest: '5d',
		SetResponse: '5e'
	},
	EnableDisableADR: {
		SetRequest: '28',
		GetRequest: '26',
		GetResponse: '27',
		SetResponse: '29'
	},
	CombinedCommissioning: {
		SetRequest: '38',
		GetRequest: '36',
		GetResponse: '37',
		SetResponse: '39'
	},
	LDRCount: {
		GetRequest: '69',
		GetResponse: '6a',
	}
};

function LoraTrapGet(trap) {
	var data = {};
	if (trap.notification == "meterdata") {
		data = {};
		data.dimmer = trap.data.DimmingValue;
		data.power = trap.data.Power;
		data.energy = trap.data.Energy;
		data.powerfactor = trap.data.PowerFactor;
		data.irms = trap.data.IRMS;
		data.vrms = trap.data.VRMS;
		return data;
	} else if (trap.notification == "metertrap") {
		data = {};
		data.dimmer = trap.data.DimmingValue;
		data.power = trap.data.Power;
		data.energy = trap.data.Energy;
		data.powerfactor = trap.data.PowerFactor;
		data.irms = trap.data.IRMS;
		data.vrms = trap.data.VRMS;
		data.temperature = trap.data.Temperature;
		return data;
	} else if (trap.notification == "joinIntervalTrap") {
		data = {};
		data.joinacceptuplinkinterval = trap.data.joinacceptuplinkinterval;
		return data;
	} else if (trap.notification == "EepEraseTrap") {
		data = {};
		data.epromerase = trap.data.epromerase;
		return data;
	} else if (trap.notification == "EnableDisableADR") {
		data = {};
		data.adaptivedatarate = trap.data.adaptivedatarate;
		return data;
	} else if (trap.notification == "CombinedCommissioning") {
		data = {};
		data = trap.data;
		return data;
	} else if (trap.notification == "LDRCount") {
		data = {};
		data.adccount = trap.data.ADCCount;
		return data;
	} else if (trap.notification == "noderfproperty") {
		data = {};
		data.TransmitPower = trap.data.TransmitPower;
		data.DataRate = trap.data.DataRate;
		return data;
	}
}

var Parse_Receive_MIB = function(response) {
	var hexString = byteArraytoHexString(response);
	return iot_mib_for_nodeV2(response, hexString);
}

function iot_mib_for_nodeV2(rx_buffer, hexString) {
	var dd = parseInt(G_APP_PORTDATA.GetSetJoinInterval.GetResponse, 16);
	if (rx_buffer[0] == parseInt(G_APP_PORTDATA.MeterDataUplink.GetResponse, 16)) {
		return notify_meter_properties(rx_buffer, hexString);
	} else if (rx_buffer[0] == parseInt(G_APP_PORTDATA.MeterDataTrap.Get, 16)) {
		return notify_metertrap(rx_buffer, hexString);
	} else if ((rx_buffer[0] == parseInt(G_APP_PORTDATA.LoraRFProperty.GetResponse, 16)) || (rx_buffer[0] == parseInt(G_APP_PORTDATA.LoraRFProperty.SetResponse, 16))) {
		return notify_rf_node_properties(rx_buffer, hexString);
	} else if ((rx_buffer[0] == parseInt(G_APP_PORTDATA.GetSetJoinInterval.GetResponse, 16)) || rx_buffer[0] == parseInt(G_APP_PORTDATA.GetSetJoinInterval.SetResponse, 16)) {
		return notify_joinReqInterval_properties(rx_buffer, hexString);
	} else if (rx_buffer[0] == parseInt(G_APP_PORTDATA.EpromErase.SetResponse, 16)) {
		return notify_eepRomErase_properties(rx_buffer, hexString);
	} else if ((rx_buffer[0] == parseInt(G_APP_PORTDATA.EnableDisableADR.GetResponse, 16)) || rx_buffer[0] == parseInt(G_APP_PORTDATA.EnableDisableADR.SetResponse, 16)) {
		return notify_EnableDisableADR_properties(rx_buffer, hexString);
	} else if ((rx_buffer[0] == parseInt(G_APP_PORTDATA.CombinedCommissioning.GetResponse, 16)) || rx_buffer[0] == parseInt(G_APP_PORTDATA.CombinedCommissioning.SetResponse, 16)) {
		return notify_CombinedCommissioning_properties(rx_buffer, hexString);
	} else if (rx_buffer[0] == parseInt(G_APP_PORTDATA.LDRCount.GetResponse, 16)) {
		return notify_LDRCount_properties(rx_buffer, hexString);
	}
}

function map_to_property(data) {
	if (data.type == "get_meter_properties") {
		return loraparameter.OnGetMeterDataCallback(data.data);
	} else if (data.type == "get_metertrap") {
		return loraparameter.OnGetMeterTrapCallback(data.data);
	} else if (data.type == "get_joinReqInterval_properties") {
		return loraparameter.OnGetJoinIntervalCallback(data.data);
	} else if (data.type == "get_eepRomErase_properties") {
		return loraparameter.OnGetEEPEraseCallback(data.data);
	} else if (data.type == "get_EnableDisableADR_properties") {
		return loraparameter.OnGetEnableDisableADRCallback(data.data);
	} else if (data.type == "get_CombinedCommissioning_properties") {
		return loraparameter.OnGetCombinedCommissioningCallback(data.data);
	} else if (data.type == "get_LDRCount_properties") {
		return loraparameter.OnGetLDRCountCallback(data.data);
	} else if (data.type == "get_node_rf_properties") {
		return loraparameter.OnSetNodeRFPropertyCallback(data.data);
	}
}

function notify_metertrap(rx_buffer, hexString) {
	shifter = 1;
	var payload = {
		type: 'get_metertrap',
		data: {
			data: ""
		}
	};
	payload.data.data = [];
	var data = {
		DimmingValue: null,
		Power: null,
		Energy: null,
		PowerFactor: null,
		IRMS: null,
		VRMS: null,
		Temperature: null
	}
	var byteValues = JSON.parse(JSON.stringify(hexString));
	var data_array = Array.from(byteValues);
	var appport = takeHexvaluebyBytes(data_array, 1);
	data.DimmingValue = (parseInt(takeHexvaluebyBytes(data_array, 1)) / 2.5).toString();
	data.Power = parseInt(takeHexvaluebyBytes(data_array, 2)).toString();
	data.Energy = (parseInt(takeHexvaluebyBytes(data_array, 3)) / 1000).toString();
	data.PowerFactor = (parseInt(takeHexvaluebyBytes(data_array, 2)) / 1000).toString();
	data.IRMS = (parseInt(takeHexvaluebyBytes(data_array, 2)) / 1000).toString();
	data.VRMS = (parseInt(takeHexvaluebyBytes(data_array, 4)) / 1000).toString();
	data.Temperature = parseInt(takeHexvaluebyBytes(data_array, 1)).toString();
	payload.data.data = data;
	return map_to_property(payload);
}

function notify_meter_properties(rx_buffer, hexString) {
	shifter = 1;
	var payload = {
		type: 'get_meter_properties',
		data: {
			type: "lora_trap",
			data: ""
		}
	};
	payload.data.data = [];
	payload.type = 'get_meter_properties';
	var data = {
		DimmingValue: null,
		Power: null,
		Energy: null,
		PowerFactor: null,
		IRMS: null,
		VRMS: null
	}
	var byteValues = JSON.parse(JSON.stringify(hexString));
	var data_array = Array.from(byteValues);
	var appport = takeHexvaluebyBytes(data_array, 1);
	data.DimmingValue = (parseInt(takeHexvaluebyBytes(data_array, 1)) / 2.5).toString();
	data.Power = parseInt(takeHexvaluebyBytes(data_array, 2)).toString();
	data.Energy = (parseInt(takeHexvaluebyBytes(data_array, 3)) / 1000).toString();
	data.PowerFactor = (parseInt(takeHexvaluebyBytes(data_array, 2)) / 1000).toString();
	data.IRMS = (parseInt(takeHexvaluebyBytes(data_array, 2)) / 1000).toString();
	data.VRMS = (parseInt(takeHexvaluebyBytes(data_array, 4)) / 1000).toString();
	payload.data.data = data;
	return map_to_property(payload);
}

function notify_rf_node_properties(iot_buffer, hexString) {
	var payload = {
		type: 'get_node_rf_properties',
		data: {
			type: "lora_trap",
			data: ""
		}
	};
	payload.data.data = [];
	var data = {
		TransmitPower: '',
		DataRate: ''
	}
	var byteValues = JSON.parse(JSON.stringify(hexString));
	var data_array = Array.from(byteValues);
	var appport = takeHexvaluebyBytes(data_array, 1);
	data.TransmitPower = parseInt(takeHexvaluebyBytes(data_array, 1)).toString();
	data.DataRate = parseInt(takeHexvaluebyBytes(data_array, 1)).toString();
	payload.data.data = data;
	return map_to_property(payload);
}

function notify_joinReqInterval_properties(iot_buffer, hexString) {
	var payload = {
		type: 'get_joinReqInterval_properties',
		data: {
			type: "lora_trap",
			data: ""
		}
	};
	payload.data.data = [];
	var data = {
		joinacceptuplinkinterval: ''
	}
	var byteValues = JSON.parse(JSON.stringify(hexString));
	var data_array = Array.from(byteValues);
	var appport = takeHexvaluebyBytes(data_array, 1);
	data.joinacceptuplinkinterval = parseInt(takeHexvaluebyBytes(data_array, 2)).toString();
	payload.data.data = data;
	return map_to_property(payload);
}

function notify_eepRomErase_properties(iot_buffer, hexString) {
	var payload = {
		type: 'get_eepRomErase_properties',
		data: {
			type: "lora_trap",
			data: ""
		}
	};
	payload.data.data = [];
	var data = {
		epromerase: ''
	}
	var byteValues = JSON.parse(JSON.stringify(hexString));
	var data_array = Array.from(byteValues);
	var appport = takeHexvaluebyBytes(data_array, 1);
	data.epromerase = parseInt(takeHexvaluebyBytes(data_array, 1));
	payload.data.data = data;
	return map_to_property(payload);
}

function notify_EnableDisableADR_properties(iot_buffer, hexString) {
	var payload = {
		type: 'get_EnableDisableADR_properties',
		data: {
			type: "lora_trap",
			data: ""
		}
	};
	payload.data.data = [];
	var data = {
		adaptivedatarate: ''
	}
	var byteValues = JSON.parse(JSON.stringify(hexString));
	var data_array = Array.from(byteValues);
	var appport = takeHexvaluebyBytes(data_array, 1);
	data.adaptivedatarate = parseInt(takeHexvaluebyBytes(data_array, 1));
	payload.data.data = data;
	return map_to_property(payload);
}

function notify_CombinedCommissioning_properties(rx_buffer, hexString) {
	var payload = {
		type: 'get_CombinedCommissioning_properties',
		data: {
			type: "lora_trap",
			data: ""
		}
	};
	payload.data.data = [];
	var data = {
		lat: null,
		long: null,
		operationmode: null,
		device_mode: null,
		alarmmask: null,
		highvoltagealarmthreshold: null,
		lowvoltagealarmthreshold: null,
		highcurrentalarmthreshold: null,
		lowcurrentalarmthreshold: null,
		lowpowerfactoralarmthreshold: null,
		maxlightburnhouralarmthreshold: null,
		temperaturealarmthreshold: null,
		timezone: null,
	}
	var byteValues = JSON.parse(JSON.stringify(hexString));
	var data_array = Array.from(byteValues);
	var appport = takeHexvaluebyBytes(data_array, 1);
	data.lat = parseInt(takeHexvaluebyBytes(data_array, 4));
	data.long = parseInt(takeHexvaluebyBytes(data_array, 4));
	data.operationmode = parseInt(takeHexvaluebyBytes(data_array, 1));
	data.device_mode = parseInt(takeHexvaluebyBytes(data_array, 1));
	data.timezone = parseInt(takeHexvaluebyBytes(data_array, 4));
	data.alarmmask = parseInt(takeHexvaluebyBytes(data_array, 2));
	data.highvoltagealarmthreshold = parseInt(takeHexvaluebyBytes(data_array, 2));
	data.lowvoltagealarmthreshold = parseInt(takeHexvaluebyBytes(data_array, 2));
	data.highcurrentalarmthreshold = parseInt(takeHexvaluebyBytes(data_array, 2));
	data.lowcurrentalarmthreshold = parseInt(takeHexvaluebyBytes(data_array, 2));
	data.lowpowerfactoralarmthreshold = parseInt(takeHexvaluebyBytes(data_array, 1));
	data.maxlightburnhouralarmthreshold = parseInt(takeHexvaluebyBytes(data_array, 2));
	data.temperaturealarmthreshold = parseInt(takeHexvaluebyBytes(data_array, 1));
	payload.data.data = data;
	return map_to_property(payload);
}


function notify_LDRCount_properties(rx_buffer, hexString) {
	var payload = {
		type: 'get_LDRCount_properties',
		data: {
			type: "lora_trap",
			data: ""
		}
	};
	payload.data.data = [];
	var data = {
		ADCCount: null
	}
	var byteValues = JSON.parse(JSON.stringify(hexString));
	var data_array = Array.from(byteValues);
	var appport = takeHexvaluebyBytes(data_array, 1);
	data.ADCCount = parseInt(takeHexvaluebyBytes(data_array, 2));
	payload.data.data = data;
	return map_to_property(payload);
}

function decimalToHexString(number) {
	if (number < 0) {
		number = 0xFFFFFFFF + number + 1;
	}
	return number.toString(16).toUpperCase();
}

function byteArraytoHexString(response) {
	var result = "";
	response.forEach(element => {
		var r = decimalToHexString(element);
		if (r.length <= 1) {
			r = '0' + r;
		}
		result += r;
	});
	return result;
}

function takeHexvaluebyBytes(data, byte) {
	var result = "";
	for (let index = 0; index < byte; index++) {
		result += data.shift();
		result += data.shift();
	}
	var r = parseInt(result, 16);
	return r;
}
