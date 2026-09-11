function decodeUplink(input) {
    let bytes = input.bytes || [];

    let data = {};
    data.rawHex = bytes.map(b => b.toString(16).padStart(2, "0")).join("");
    data.header = getHead(bytes);

    bytes = bytes.slice(1);

    for (let i = 0; i < 10; i++) {
        if (bytes.length < 5) break;

        let measurementChunk = bytes.slice(0, 5);
        bytes = bytes.slice(5);

        let measurement = getMeasurement(measurementChunk);
        if (measurement.key !== "EMPTY") {
            data[measurement.key] = measurement.parsed;
        }
    }

    return { data };
}

function getHead(d) {
    return d.length > 0 ? d[0] : null;
}

function getType(typeByte) {
    const typeMap = {
        0: "pressure",
        1: "humidity_temp",
        2: "humidity",
        3: "batt_voltage",
        4: "contact",
        5: "velocity",
        6: "voltage",
        7: "current",
        8: "temperature",
        9: "altitude",
        10: "latitude",
        11: "light",
        12: "longitude",
        13: "resistance",
        14: "vibration",
        15: "x_position",
        16: "y_position",
        17: "z_position",
        18: "reserved",
        19: "gauge_diff_pressure"
    };

    return typeMap[typeByte] || "EMPTY";
}

function getFloat32(bytes) {
    let buffer = new ArrayBuffer(4);
    let view = new Uint8Array(buffer);

    for (let i = 0; i < 4; i++) {
        view[i] = bytes[i];
    }

    return new DataView(buffer).getFloat32(0, true);
}

function getMeasurement(d) {
    if (d.length !== 5) {
        return { key: "EMPTY", parsed: null };
    }

    let typeKey = getType(d[0]);
    let valueBytes = d.slice(1, 5);
    let parsedValue = getFloat32(valueBytes);

    return {
        key: typeKey,
        parsed: parsedValue
    };
}

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = { decodeUplink };
}

if (typeof Decoder === "undefined") {
    Decoder = decodeUplink;
}
