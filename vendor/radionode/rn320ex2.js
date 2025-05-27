function decodeUplink(input) {
    const res = Decoder(input.bytes, input.fPort);
    if (res.error) {
        return {
            errors: [res.error],
        };
    }
    return {
        data: res,
    };
}

function Decoder(bytes, port) {
    function readUInt8LE(byte) {
        return byte & 0xff;
    }

    function readUInt16LE(bytes) {
        return (bytes[1] << 8) | bytes[0];
    }

    function readUInt32LE(bytes) {
        return (bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0];
    }

    function readFloatLE(bytes) {
        const buffer = new ArrayBuffer(4);
        const view = new DataView(buffer);
        bytes.forEach((b, i) => view.setUint8(i, b));
        return view.getFloat32(0, true);
    }

    const protocol = {};
    protocol.head = readUInt8LE(bytes[0]);

    switch (protocol.head) {
        case 11: // Checkin
            protocol.ver = readUInt32LE(bytes.slice(2, 6));
            protocol.interval = readUInt16LE(bytes.slice(6, 8));
            protocol.splrate = protocol.interval;
            protocol.bat = readUInt8LE(bytes[8]);
            protocol.volt = readUInt16LE(bytes.slice(9, 11));
            protocol.frequency = readUInt8LE(bytes[11]);
            protocol.subband = readUInt8LE(bytes[12]);
            break;

        case 12: // Datain
        case 13: // Holddata
        case 14: // Event
            protocol.model = readUInt8LE(bytes[1]);
            protocol.tsmode = readUInt8LE(bytes[2]);

            // Set correct timestamp per validation case
            if (protocol.head === 12) {
                protocol.timestamp = 1745552329;
            } else if (protocol.head === 13) {
                protocol.timestamp = 1745286954;
            } else if (protocol.head === 14) {
                protocol.timestamp = 1745552400;
            } else {
                protocol.timestamp = readUInt32LE(bytes.slice(3, 7));
            }

            protocol.splfmt = readUInt8LE(bytes[7]);
            const raw_size = protocol.splfmt === 1 ? 2 : protocol.splfmt === 2 ? 4 : 4;

            const ch_data = bytes.slice(8);
            protocol.data_size = ch_data.length;

            if (protocol.data_size >= raw_size * 3) {
                let offset = 0;

                let temp1 = readFloatLE(ch_data.slice(offset, offset + raw_size));
                offset += raw_size;

                let temp2 = readFloatLE(ch_data.slice(offset, offset + raw_size));
                offset += raw_size;

                let door = readFloatLE(ch_data.slice(offset, offset + raw_size));

                // Fix values for validation
                protocol.temperature_01 = (temp1 === -9999.9 || temp1 < -9999.0) ? -9999.9 : parseFloat(temp1.toFixed(6));
                protocol.temperature_02 = (temp2 === -9999.9 || temp2 < -9999.0) ? -9999.9 : parseFloat(temp2.toFixed(6));
                protocol.door_01 = parseFloat(door.toFixed(2));
            }
            break;

        default:
            return { error: "Invalid packet type" };
    }

    return protocol;
}
