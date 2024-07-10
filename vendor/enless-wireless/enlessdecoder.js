var EN302 = 0x04; /*Ambient Temperature & Humidity (EN302) TX T&H AMB  600-021*/
var EN303 = 0x05; /*Ambient T&H and VOC (EN303) TX VOC/T&H AMB 600-022*/
var EN304 = 0x06; /*Ambient T&H/ VOC / CO2 (EN304) TX  CO2/VOC/T&H AMB 600-023*/
var EN305 = 0x07; /* Tx Temp with Internal Temp Sensor (EN305) TX TEMP INS 600-031*/
var EN306 = 0x0C; /*Tx Temp PT1000 2-Ch (EN306) TX TEMP CONT2 600-232 */
var EN307 = 0x0D; /*Tx Analog 4-20mA (EN307) TX 4/20 mA 600-035 */
var EN308 = 0x08; /*Tx Pulse (EN308) TX PULSE 600-036*/
var EN309 = 0x09; /*Tx Pulse Atex (EN309) TX PULSE ATEX 600-037*/
var EN310 = 0x0A; /* Tx Pulse LED (EN310) TX PULSE LED 600-038*/
var EN311 = 0x0E; /*Tx T&H with External Probe (EN311) TX T&H 600-034 */
var EN312 = 0x0F; /*Tx Temp PT1000 1-Ch (EN312) TX TEMP CONT1 600-032 */
var EN313 = 0x10; /* Tx Temp PT1000 1-Ch Ext Power (EN313) TX TEMP CONT1 MP 600-033*/
var EN314 = 0x11; /*Tx Temp PT1000 2-Ch Ext Power (EN314) TX TEMP CONT2 MP 600-233 */
var EN319 = 0x0B; /*Tx Contact (EN319) TX CONTACT 600-039 */

function toHexString(byteArray) {
    return Array.from(byteArray, function (byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
}
function decodeUplink(input) {
    try {

        var payload = toHexString(input.bytes)
        var deviceType = hexToUInt(payload.substring(6, 8),1);

        return bin_decode(deviceType, payload);
    } catch (e) {
        return "{\"error\":\"decoding failed\"}";
    }
}
function bin_decode(deviceType, payload) {
    try {

        //var parsers = require("./parsers");

        let template = {
            id: hexToUInt(payload.substring(0, 6)),
            type: hexToUInt(payload.substring(6, 8)),
            seq_counter: hexToUInt(payload.substring(8, 10)),
            fw_version: hexToFwVerison(payload.substring(10, 12)),
            //values: {},
            //alarm_status: {},
            //states: {},
        };

        switch (deviceType) {
            case EN302: /* TX T&H AMB  600-021*/
                addValueField(template, {
                    temperature: {
                        unit: "°C",
                        value: hexToInt(payload.substring(12, 16), 10),
                    },
                    humidity: {
                        unit: "%",
                        value: hexToUInt(payload.substring(16, 20), 10),
                    },
                });



                this.addAlarmStateField(template,
                    this.alarmParser(payload.substring(28, 32), deviceType));

                addStateField(template, {
                    battery: hexToBatteryLvl(payload.substring(32, 36)),
                    msg_type: hexToMsgType(payload.substring(32, 36))
                });

                return {
                    data: template
                };
                break;
            case EN303: /* TX T&H AMB  600-022*/
                addValueField(template, {
                    temperature: {
                        unit: "°C",
                        value: hexToInt(payload.substring(12, 16), 10),
                    },
                    humidity: {
                        unit: "%",
                        value: hexToUInt(payload.substring(16, 20), 10),
                    },
                    voc: {
                        unit: "ppb",
                        value: hexToUInt(payload.substring(20, 24), 10),
                    },
                });


                this.addAlarmStateField(template,
                    this.alarmParser(payload.substring(28, 32), deviceType));

                addStateField(template, {
                    battery: hexToBatteryLvl(payload.substring(32, 36)),
                    msg_type: hexToMsgType(payload.substring(32, 36))
                });

                return {
                    data: template
                };
                break;
            case EN304: /* TX T&H AMB  600-023*/
                addValueField(template, {
                    temperature: {
                        unit: "°C",
                        value: hexToInt(payload.substring(12, 16), 10),
                    },
                    Humidity: {
                        unit: "%",
                        value: hexToUInt(payload.substring(16, 20), 10),
                    },
                    voc: {
                        unit: "ppb",
                        value: hexToUInt(payload.substring(20, 24), 10),
                    },
                    co2: {
                        unit: "ppm",
                        value: hexToUInt(payload.substring(24, 28), 10),
                    },
                });
                /*addValueField(template, {
                    Humidity: {
                        unit: "%",
                        value: hexToUInt(payload.substring(16, 20), 10),
                    },
                });
                addValueField(template, {
                    voc: {
                        unit: "ppb",
                        value: hexToUInt(payload.substring(20, 24), 10),
                    },
                });

                addValueField(template, {
                    co2: {
                        unit: "ppm",
                        value: hexToUInt(payload.substring(20, 24), 10),
                    },
                });*/

                this.addAlarmStateField(template,
                    this.alarmParser(payload.substring(28, 32), deviceType));

                addStateField(template, {
                    battery: hexToBatteryLvl(payload.substring(32, 36)),
                    msg_type: hexToMsgType(payload.substring(32, 36))
                });

                return {
                    data: template
                };
                break;

            case EN306: /*TX TEMP CONT2 600-232 */
            case EN314: /* TX TEMP CONT2 MP 600-233 */
                addValueField(template, {
                    temperature_1: {
                        unit: "°C",
                        value: hexToInt(payload.substring(12, 16), 10),
                    },
                    temperature_2: {
                        unit: "°C",
                        value: hexToUInt(payload.substring(16, 20), 10),
                    },
                });

                /* addValueField(template, {
                     temperature_2: {
                         unit: "oC",
                         value: hexToUInt(payload.substring(16, 20), 10),
                     },
                 });*/

                this.addAlarmStateField(template,
                    this.alarmParser(payload.substring(20, 24), deviceType));

                addStateField(template, {
                    battery: hexToBatteryLvl(payload.substring(24, 28)),
                    msg_type: hexToMsgType(payload.substring(24, 28))
                });


                return {
                    data: template
                };
                break;

            case EN307: /*TX 4/20 mA 600-035 */
                addValueField(template, {
                    current: {
                        unit: "mA",
                        value: hexToInt(payload.substring(12, 16), 1000),
                    },
                });


                this.addAlarmStateField(template,
                    this.alarmParser(payload.substring(16, 20), deviceType));

                addStateField(template, {
                    battery: hexToBatteryLvl(payload.substring(20, 24)),
                    msg_type: hexToMsgType(payload.substring(20, 24))
                });


                return {
                    data: template
                };

            case EN305: /*TX TEMP INS 600-031 ch1*/
            case EN313: /* TX TEMP CONT1 MP 600-033 ch1*/
            case EN312: /*TX TEMP CONT1 600-032 ch1*/

                addValueField(template, {
                    temperature_1: {
                        unit: "°C",
                        value: hexToInt(payload.substring(12, 16), 10),
                    },
                });

                /*    addValueField(template, {
                        temperature_2: {
                            unit: "oC",
                            value: hexToUInt(payload.substring(16, 20), 10),
                        },
                    });*/

                this.addAlarmStateField(template,
                    this.alarmParser(payload.substring(20, 24), deviceType));

                addStateField(template, {
                    battery: hexToBatteryLvl(payload.substring(24, 28)),
                    msg_type: hexToMsgType(payload.substring(24, 28))
                });


                return {
                    data: template
                };
                break;

         
            case EN308: /*TX PULSE 600-036*/
            case EN309: /*TX PULSE ATEX 600-037*/
            case EN310: /*TX PULSE LED 600-038*/
            case EN319:/* TX CONTACT 600-039*/


                addValueField(template, {
                    pulse_ch1: {
                        unit: "",
                        value: hexToUInt(payload.substring(12, 20), 1),
                    },
                    pulse_ch2: {
                        unit: "",
                        value: hexToUInt(payload.substring(20, 28), 1),
                    },
                    pulse_oc: {
                        unit: "",
                        value: hexToUInt(payload.substring(28, 36), 1),
                    },
                });

                /* addValueField(template, {
                     pulse_ch2: {
                         unit: "",
                         value: hexToUInt(payload.substring(20, 28), 1),
                     },
                 });
 
                 addValueField(template, {
                     pulse_oc: {
                         unit: "",
                         value: hexToUInt(payload.substring(28, 36), 1),
                     },
                 });*/

                this.addAlarmStateField(template,
                    this.alarmParser(payload.substring(36, 40), deviceType));


                addStateField(template, {
                    battery: hexToBatteryLvl(payload.substring(40, 44))
                });
                addStateField(template, {
                    status: stateParser(payload.substring(40, 44))
                });

                return {
                    data: template
                };

                break;

            case EN311: /*TX T&H 600-034 */
                addValueField(template, {
                    temperature: {
                        unit: "°C",
                        value: hexToInt(payload.substring(12, 16), 10),
                    },
                    humidity: {
                        unit: "%",
                        value: hexToUInt(payload.substring(16, 20), 10),
                    },
                });

                /* addValueField(template, {
                     Humidity: {
                         unit: "%",
                         value: hexToUInt(payload.substring(16, 20), 10),
                     },
                 });
 */
                this.addAlarmStateField(template,
                    this.alarmParser(payload.substring(20, 24), deviceType));

                addStateField(template, {
                    battery: hexToBatteryLvl(payload.substring(24, 28)),
                    msg_type: hexToMsgType(payload.substring(24, 28))
                });


                return {
                    data: template
                };
                break;

            default: /*Error message*/
                return {
                    data: null,
                    error: "Invalid Type1-",
                    payload: payload,
                };
                break;
        }


    } catch (error) {
        return {
            data: null,
            error: "Invalid Type2",
        };
    }
}

function addValueField(template, valueDefinition) {
    //template.values.push(valueDefinition);
    template.values = (valueDefinition);
}

function addAlarmStateField(template, stateDefinition) {
    template.alarm_status = stateDefinition;
}

function addStateField(template, stateDefinition) {
    //template.states.push(stateDefinition);
    template.states = (stateDefinition);
}

function alarmParser(hexValue, type) {

    switch (type) {
        case EN308: /*TX PULSE 600-036*/
        case EN309: /*TX PULSE ATEX 600-037*/
        case EN310: /*TX PULSE LED 600-038*/
        case EN319:/* TX CONTACT 600-039*/

            const defs_308 = [
                { name: "pulse_ch1_flow", values: [{ high: false }, { high: true }], bit: 1 },
                { name: "pulse_ch2_flow", values: [{ high: false }, { high: true }], bit: 2 },
                { name: "pulse_oc_flow", values: [{ high: false }, { high: true }], bit: 3 },
                { name: "pulse_ch1_flow", values: [{ low: false }, { low: true }], bit: 5 },
                { name: "pulse_ch2_flow", values: [{ low: false }, { low: true }], bit: 6 },
                { name: "pulse_oc_flow", values: [{ low: false }, { low: true }], bit: 7 },
                { name: "pulse_ch1_leak", values: [false, true], bit: 9 },
                { name: "pulse_ch2_leak", values: [false, true], bit: 10 },
                { name: "pulse_oc_leak", values: [false, true], bit: 11 },
            ];

            return hexToStatus(hexValue, defs_308);
            break;
        case EN302:
        case EN311:
            const defs302 = [
                { name: "temperature", values: [{ high: false }, { high: true }], bit: 1 },
                { name: "temperature", values: [{ low: false }, { low: true }], bit: 2 },
                { name: "humidity", values: [{ high: false }, { high: true }], bit: 3 },
                { name: "humidity", values: [{ low: false }, { low: true }], bit: 4 },
            ];
            return hexToStatus(hexValue, defs302);

            break;

        case EN303:
            const defs303 = [
                { name: "temperature", values: [{ high: false }, { high: true }], bit: 1 },
                { name: "temperature", values: [{ low: false }, { low: true }], bit: 2 },
                { name: "humidity", values: [{ high: false }, { high: true }], bit: 3 },
                { name: "humidity", values: [{ low: false }, { low: true }], bit: 4 },
                { name: "voc", values: [{ high: false }, { high: true }], bit: 5 },
                { name: "voc", values: [{ low: false }, { low: true }], bit: 6 },
            ];
            return hexToStatus(hexValue, defs303);
            break;
        case EN304:
            const defs304 = [
                { name: "temperature", values: [{ high: false }, { high: true }], bit: 1 },
                { name: "temperature", values: [{ low: false }, { low: true }], bit: 2 },
                { name: "humidity", values: [{ high: false }, { high: true }], bit: 3 },
                { name: "humidity", values: [{ low: false }, { low: true }], bit: 4 },
                { name: "voc", values: [{ high: false }, { high: true }], bit: 5 },
                { name: "voc", values: [{ low: false }, { low: true }], bit: 6 },
                { name: "co2", values: [{ high: false }, { high: true }], bit: 7 },
                { name: "co2", values: [{ low: false }, { low: true }], bit: 8 },
            ];

            return hexToStatus(hexValue, defs304);
            break;


        case EN306:

        case EN314: /* TX TEMP CONT2 MP 600-233 */
            const defs306 = [
                { name: "temperature_1", values: [{ high: false }, { high: true }], bit: 1 },
                { name: "temperature_1", values: [{ low: false }, { low: true }], bit: 2 },
                { name: "temperature_2", values: [{ high: false }, { high: true }], bit: 3 },
                { name: "temperature_2", values: [{ low: false }, { low: true }], bit: 4 },
            ];
            return hexToStatus(hexValue, defs306);
            break;
        case EN305:

        case EN313:
        case EN312: /*TX TEMP CONT1 600-032 */

            const defs305 = [
                { name: "temperature_1", values: [{ high: false }, { high: true }], bit: 1 },
                { name: "temperature_1", values: [{ low: false }, { low: true }], bit: 2 },

            ];

            return hexToStatus(hexValue, defs305);
            break;
        case EN307:
            const defs307 = [
                { name: "current", values: [{ high: false }, { high: true }], bit: 1 },
                { name: "current", values: [{ low: false }, { low: true }], bit: 2 },
            ];

            return hexToStatus(hexValue, defs307);
            break;




        default:
            break;
    }


}

const INT_MIN = -parseInt("0xFFFF");
const INT_MAX = parseInt("0xFFFF");
function hexToUInt(hex, divider=1) {
    return parseInt(hex, 16) / divider;
}

// function hexToInt(hex, divider) {
//     const upperHex = hex.toUpperCase();

//     if (parseInt(upperHex, 16) >= "8000" && parseInt(upperHex, 16) <= "FFFF") {
//         return (parseInt(hex, 16) - INT_MAX - 1) / divider;
//     } else {
//         return parseInt(hex, 16) / divider;
//     }
// }
function hexToInt(hex,divider) {
    if (hex.length % 2 != 0) {
        hex = "0" + hex;
    }
    var num = parseInt(hex, 16);
    var maxVal = Math.pow(2, hex.length / 2 * 8);
    if (num > maxVal / 2 - 1) {
        num = num - maxVal
    }
    return num /divider;
}

function hexToBin(hex, numOfBytes = 2) {
    return parseInt(hex, 16)
        .toString(2)
        .padStart(numOfBytes * 4, "0");
}

function binToUInt(bin) {
    return parseInt(bin, 2);
}

function hexToFwVerison(hex) {
    const binNum = hexToBin(hex);
    return binToUInt(binNum.substring(binNum.length - 6, binNum.length))
}

function hexToStatus(hex, defs) {
    const status = {};
    const binNum = hexToBin(hex, 4)

    defs.forEach((def) => {
        const bitValue = +binNum[binNum.length - def.bit];
        const textValue = def.values[bitValue];
        if (status.hasOwnProperty(def.name)) {
            status[def.name] = { ...status[def.name], ...textValue };
        } else {
            status[def.name] = textValue;
        }
    });
    return status;
}



function hexToBatteryLvl(hex, startBit, endBit) {
    const binNum = hexToBin(hex, 4);
    const batteryCode = binNum.substring(binNum.length - 4, binNum.length - 2);

    switch (batteryCode) {
        case "00":
            return "100%";
        case "01":
            return "75%";
        case "10":
            return "50%";
        case "11":
            return "25%";
        default:
            return "unknown";
    }
}

function hexToMsgType(hex, bit = 1) {
    const binNum = hexToBin(hex, 4);
    const bitValue = +binNum[binNum.length - bit];
    if (bitValue) return "alarm";
    else return "normal"
}
function stateParser(hexValue) {
    const defs = [
        { name: "msg_type", values: ["normal", "alarm"], bit: 1 },
        { name: "pulse_ch1", values: ["open", "closed"], bit: 5 },
        { name: "pulse_ch2", values: ["open", "closed"], bit: 6 },
        { name: "pulse_oc", values: ["open", "closed"], bit: 7 },
        { name: "debounce_ch1", values: ["disabled", "enabled"], bit: 9 },
        { name: "debounce_ch2", values: ["disabled", "enabled"], bit: 10 },
        { name: "debounce_ch3", values: ["disabled", "enabled"], bit: 11 },
    ];

    return hexToStatus(hexValue, defs);
}

