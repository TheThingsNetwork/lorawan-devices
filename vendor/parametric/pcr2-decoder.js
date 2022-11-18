
    /**
     *  PCR2 Payload Decoder
     *
     * THIS SOFTWARE IS PROVIDED BY PARAMETRIC GMBH AND ITS CONTRIBUTORS “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES, 
     * INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
     * IN NO EVENT SHALL APPLE INC. OR ITS CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, 
     * OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; 
     * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, 
     * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, 
     * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
     * 
     * */


    const DeviceTypes = ["PCR2-IN", "PCR2-OD", "?", "?", "PCR2-XIO", "PCR2-ODS", "PCR2-ODA", "PCR2-ODB", "PCR2-ODBS"];

    function decode_elsys_pl(bytes, port) {

        var obj = {};

        if (port != 14) {
            obj.error = "ERROR: Wrong port! PCR2 devices are using port 14 for application payloads.";
            return obj;
        }

        for (var i = 0; i < bytes.length; i++) {
            switch (bytes[i]) {
                case 0x01: // cpu temperature
                    var temp = (bytes[i + 1] << 8) | (bytes[i + 2]);
                    temp = bin16dec(temp);
                    obj.TEMP = Math.floor(temp / 10);
                    i += 2;
                    break;
                case 0x0A: // left-to-right counter
                    obj.LTR = (bytes[i + 1] << 8) | (bytes[i + 2]);
                    i += 2;
                    break;
                case 0x16: // right-to-left counter
                    obj.RTL = (bytes[i + 1] << 8) | (bytes[i + 2]);
                    i += 2;
                    break;
                default: // data is not correct
                    i = bytes.length;
                    break;
            }
        }
        return obj;
    }

    function decode_extended_v3(bytes, port) {
        var obj = {};

        if (port != 14) {
            obj.error = "ERROR: Wrong port! PCR2 devices are using port 14 for application payloads.";
            return obj;
        }

        if (bytes.length != 16) {
            obj.error = "ERROR: Wrong payload length";
            return obj;
        }

        if (bytes[0] == 0xbe && bytes[1] == 0x01 && bytes[2] == 0x03) {

            obj.LTR = (bytes[3] << 8) | (bytes[4]);         // left-to-right counter
            obj.RTL = (bytes[5] << 8) | (bytes[6]);         // right-to-left counter
            obj.LTR_SUM = (bytes[7] << 8) | (bytes[8]);     // sum of left-to-right counts since device power up    
            obj.RTL_SUM = (bytes[9] << 8) | (bytes[10]);    // sum of right-to-left counts since device power up   
            obj.SBX_BATT = (bytes[11]);                     // battery gauge when equiped with an SBX solar charger
            obj.SBX_PV = (bytes[12] << 8) | (bytes[13]);    // solar power when equiped with an SBX solar charger [mW]
            obj.DIFF = Math.abs(obj.LTR_SUM - obj.RTL_SUM);   // Calculated difference between LTR_SUM and RTL_SUM

            var temp = (bytes[14] << 8) | (bytes[15]);
            temp = bin16dec(temp);
            obj.TEMP = Math.floor(temp / 10);               // CPU Temperature

        }
        else {
            obj.error = "ERROR: PCR2 application payload should start with be0103..  ";
        }
        return obj;
    }

    function decode_extended_v4(bytes, port) {
        var obj = {};

        if (port != 14) {
            obj.error = "ERROR: Wrong port! PCR2 devices are using port 14 for application payloads.";
            return obj;
        }

        if (bytes.length != 17) {
            obj.error = "ERROR: Wrong payload length";
            return obj;
        }

        if (bytes[0] == 0xbe && bytes[1] == 0x01 && bytes[2] == 0x04) {

            obj.LTR = (bytes[3] << 8) | (bytes[4]);         // left-to-right counter
            obj.RTL = (bytes[5] << 8) | (bytes[6]);         // right-to-left counter
            obj.LTR_SUM = (bytes[7] << 8) | (bytes[8]);     // sum of left-to-right counts since device power up    
            obj.RTL_SUM = (bytes[9] << 8) | (bytes[10]);    // sum of right-to-left counts since device power up   
            obj.SBX_BATT = (bytes[11] << 8) | (bytes[12]);  // battery voltage when equiped with an SBX solar charger
            obj.SBX_PV = (bytes[13] << 8) | (bytes[14]);    // solar power when equiped with an SBX solar charger [mW]
            obj.DIFF = Math.abs(obj.LTR_SUM - obj.RTL_SUM);   // Calculated difference between LTR_SUM and RTL_SUM

            var temp = (bytes[15] << 8) | (bytes[16]);
            temp = bin16dec(temp);
            obj.TEMP = Math.floor(temp / 10);               // CPU Temperature

        }
        else {
            obj.error = "ERROR: PCR2 application payload should start with be0104..  ";
        }
        return obj;
    }


    function decode_appdata_payload(bytes, port) {
        var obj = {};

        if (port != 14) {
            obj.error = "ERROR: Wrong port! PCR2 devices are using port 14 for application payloads.";
            return obj;
        }

        if (bytes.length != 10) {
            obj.error = "ERROR: Wrong payload length";
            return obj;
        }

        if (bytes[0] == 0xbe && bytes[1] == 0x01 && bytes[3] == 0xa5) {

            obj.DevType = DeviceTypes[bytes[2]];            // 0 = IN, 1 = OD, 4 = XIO, 5 = ODS, 6 = ODA, 7 = ODB, 8 = ODBS
            obj.LTR = (bytes[4] << 8) | (bytes[5]);         // left-to-right counter value 
            obj.RTL = (bytes[6] << 8) | (bytes[7]);         // right-to-left counter value
            obj.SBX_BATT = bytes[8] * 100;                    // Battery voltage
            obj.DCNT = bytes[9];                             // Data Message Counter 
        }
        else {
            obj.error = "ERROR: PCR2 application payload should start with be01..a5  ";
        }
        return obj;
    }


    function decode_v2_config_payload(bytes, port) {
        var obj = {};

        if (port != 190) {
            obj.error = "ERROR: Wrong port! PCR2 devices are using port 190 for application payloads.";
            return obj;
        }

        if (bytes.length != 14) {
            obj.error = "ERROR: Wrong payload length";
            return obj;
        }

        obj.DeviceType = bytes[0];
        obj.Firmware = bytes[1] + "." + bytes[2] + "." + bytes[3];  // version string
        obj.OperationMode = bytes[4];
        obj.PayloadType = bytes[5];
        obj.UplinkType = bytes[6];
        obj.UplinkInterval = (bytes[7] << 8) | (bytes[8]);
        obj.LinkCheckInterval = (bytes[9] << 8) | (bytes[10]);
        obj.HoldoffTime = (bytes[11] << 8) | (bytes[12]);
        obj.RadarSensitivity = bytes[13];

        return obj;
    }

    function decode_v3_config_payload(bytes, port) {
        var obj = {};

        if (port != 190) {
            obj.error = "ERROR: Wrong port! PCR2 devices are using port 190 for application payloads.";
            return obj;
        }

        if (bytes.length != 20) {
            obj.error = "ERROR: Wrong payload length";
            return obj;
        }

        if (bytes[0] == 0xbe && bytes[1] == 0x01 && bytes[2] == 0x03) {
            obj.DeviceType = bytes[3];
            obj.Firmware = bytes[4] + "." + bytes[5] + "." + bytes[6];  // version string
            obj.OperationMode = bytes[7];
            obj.PayloadType = bytes[8];
            obj.DeviceClass = bytes[9];
            obj.UplinkType = bytes[10];
            obj.UplinkInterval = (bytes[11] << 8) | (bytes[12]);
            obj.LinkCheckInterval = (bytes[13] << 8) | (bytes[14]);
            obj.CapacityLimit = (bytes[15] << 8) | (bytes[16]);
            obj.HoldoffTime = (bytes[17] << 8) | (bytes[18]);
            obj.RadarSensitivity = bytes[19];

        }
        else {
            obj.error = "ERROR: PCR2 configuration payload V3 should start with be0103..  ";
        }
        return obj;
    }

    function decode_v4_config_payload(bytes, port) {
        var obj = {};

        if (port != 190) {
            obj.error = "ERROR: Wrong port! PCR2 devices are using port 190 for application payloads.";
            return obj;
        }

        if (bytes.length != 31) {
            obj.error = "ERROR: Wrong payload length";
            return obj;
        }

        if (bytes[0] == 0xbe && bytes[1] == 0x01 && bytes[2] == 0x04) {
            obj.DeviceType = bytes[3];
            obj.Firmware = bytes[4] + "." + bytes[5] + "." + bytes[6];  // version string
            obj.OperationMode = bytes[7];
            obj.PayloadType = bytes[8];
            obj.DeviceClass = bytes[9];
            obj.UplinkType = bytes[10];
            obj.UplinkInterval = (bytes[11] << 8) | (bytes[12]);
            obj.LinkCheckInterval = (bytes[13] << 8) | (bytes[14]);
            obj.CapacityLimit = (bytes[15] << 8) | (bytes[16]);
            obj.HoldoffTime = (bytes[17] << 8) | (bytes[18]);
            obj.InactivityTimeout = (bytes[19] << 8) | (bytes[20]);
            obj.MountingDirection = bytes[21];
            obj.MountingTilt = bytes[22];
            obj.DetectionAngle = bytes[23];
            obj.MinDist = (bytes[24] << 8) | (bytes[25]);
            obj.MaxDist = (bytes[26] << 8) | (bytes[27]);
            obj.MinSpeed = bytes[28];
            obj.MaxSpeed = bytes[29];
            obj.RadarSensitivity = bytes[30];
        }
        else {
            obj.error = "ERROR: PCR2 configuration payload V4 should start with be0104..  ";
        }
        return obj;
    }

    function decode_v5_config_payload(bytes, port) {
        var obj = {};

        if (port != 190) {
            obj.error = "ERROR: Wrong port! PCR2 devices are using port 190 for application payloads.";
            return obj;
        }

        if (bytes.length != 34) {
            obj.error = "ERROR: Wrong payload length";
            return obj;
        }

        if (bytes[0] == 0xbe && bytes[1] == 0x01 && bytes[2] == 0x05) {
            obj.DeviceType = bytes[3];
            obj.Firmware = bytes[4] + "." + bytes[5] + "." + bytes[6];  // Firmware Version 
            obj.OperationMode = bytes[7];
            obj.PayloadType = bytes[8];
            obj.DeviceClass = bytes[9];
            obj.UplinkType = bytes[10];
            obj.UplinkInterval = (bytes[11] << 8) | (bytes[12]);
            obj.LinkCheckInterval = (bytes[13] << 8) | (bytes[14]);
            obj.CapacityLimit = (bytes[15] << 8) | (bytes[16]);
            obj.HoldoffTime = (bytes[17] << 8) | (bytes[18]);
            obj.InactivityTimeout = (bytes[19] << 8) | (bytes[20]);
            obj.RadarEnabled = bytes[21];
            obj.BeamAngle = bytes[22];
            obj.MinDist = (bytes[23] << 8) | (bytes[24]);
            obj.MaxDist = (bytes[25] << 8) | (bytes[26]);
            obj.MinSpeed = bytes[27];
            obj.MaxSpeed = bytes[28];
            obj.RadarAutotune = bytes[29];
            obj.RadarSensitivity = bytes[30];
            obj.SBXVersion = bytes[31] + "." + bytes[32] + "." + bytes[33];  // SBX Solar Charger Firmware Version 

        }
        else {
            obj.error = "ERROR: PCR2 configuration payload V5 should start with be0105..  ";
        }
        return obj;
    }

    function decode_v6_config_payload(bytes, port) {
        var obj = {};

        if (port != 190) {
            obj.error = "ERROR: Wrong port! PCR2 devices are using port 190 for application payloads.";
            return obj;
        }

        if (bytes.length != 35) {
            obj.error = "ERROR: Wrong payload length";
            return obj;
        }

        if (bytes[0] == 0xbe && bytes[1] == 0x01 && bytes[2] == 0x06) {
            obj.DeviceType = bytes[3];
            obj.Firmware = bytes[4] + "." + bytes[5] + "." + bytes[6];  // Firmware Version
            obj.OperationMode = bytes[7];
            obj.PayloadType = bytes[8];
            obj.DeviceClass = bytes[9];
            obj.UplinkType = bytes[10];
            obj.UplinkInterval = (bytes[11] << 8) | (bytes[12]);
            obj.LinkCheckInterval = (bytes[13] << 8) | (bytes[14]);
            obj.CapacityLimit = (bytes[15] << 8) | (bytes[16]);
            obj.HoldoffTime = (bytes[17] << 8) | (bytes[18]);
            obj.InactivityTimeout = (bytes[19] << 8) | (bytes[20]);
            obj.RadarEnabled = bytes[21];
            obj.BeamAngle = bytes[22];
            obj.MinDist = (bytes[23] << 8) | (bytes[24]);
            obj.MaxDist = (bytes[25] << 8) | (bytes[26]);
            obj.MinSpeed = bytes[27];
            obj.MaxSpeed = bytes[28];
            obj.RadarAutotune = bytes[29];
            obj.RadarSensitivity = bytes[30];
            obj.SBXVersion = bytes[31] + "." + bytes[32] + "." + bytes[33];  // SBX Solar Charger Firmware Version
            obj.RadarChannel = bytes[34];
        }
        else {
            obj.error = "ERROR: PCR2 configuration payload V6 should start with be0105..  ";
        }
        return obj;
    }

    function decode_device_id_payload(bytes, port) {
        var obj = {};

        if (bytes.length != 9) {
            obj.error = "ERROR: Wrong payload length";
            return obj;
        }

        if (bytes[0] == 0xbe && bytes[1] == 0x01 && bytes[3] == 0xd5) {
            obj.DevType = DeviceTypes[bytes[2]];   
            obj.Firmware = (bytes[5] & 0xf0)/0x10 + "." + (bytes[5] & 0x0f) + "." + bytes[6];  // Firmware Major Version
            obj.SBXVersion = (bytes[7] & 0xf0)/0x10 + "." + (bytes[7] & 0x0f) + "." + bytes[8];  // SBX Solar Charger Firmware Version     
    }
        else {
            obj.error = "ERROR: PCR2 configuration payload V6 should start with be0105..  ";
        }
        return obj;

    }


    function bin16dec(bin) {
        var num = bin & 0xFFFF;
        if (0x8000 & num) num = -(0x010000 - num);
        return num;
    }

    function hexToBytes(hex) {
        for (var bytes = [], c = 0; c < hex.length; c += 2)
            bytes.push(parseInt(hex.substr(c, 2), 16));
        return bytes;
    }

    // TTN Entry Point
    function decodeUplink(input) {
        var bytes = input.bytes;
        var port = input.fPort;
        var obj = {};

        if (port == 14) // pcr2 application pl 
        {
            if (bytes[0] == 0x0a) {
                // decode default payload
                obj = decode_elsys_pl(bytes, port);
            } else if (bytes[0] == 0 && bytes[1] == 102) {
                // decode lpp payload
            } else if (bytes[0] == 0xbe && bytes[1] == 0x01 && bytes[2] == 0x03) {
                // decode extended payload V3
                obj = decode_extended_v3(bytes, port);
            } else if (bytes[0] == 0xbe && bytes[1] == 0x01 && bytes[2] == 0x04) {
                // decode extended payload V4
                obj = decode_extended_v4(bytes, port);
            } else if (bytes[0] == 0xbe && bytes[1] == 0x01 && bytes[3] == 0xa5) {
                // decode app payload V5
                obj = decode_appdata_payload(bytes, port);
            } else {
                obj = {};
                console.log("ERROR: No decoder for application payload", payload);
            }

        }

        if (port == 190) // pcr2 configuration pl 
        {
            if (bytes.length == 14)  // v2
            {
                obj = decode_v2_config_payload(bytes, port);
            }
            else if (bytes.length == 20)  // v3
            {
                obj = decode_v3_config_payload(bytes, port);
            }
            else if (bytes.length == 31)  // v4
            {
                obj = decode_v4_config_payload(bytes, port);
            }
            else if (bytes.length == 34)  // v5
            {
                obj = decode_v5_config_payload(bytes, port);
            }
            else if (bytes.length == 35)  // v6
            {
                obj = decode_v6_config_payload(bytes, port);
            }
            else if (bytes.length == 9)   // DeviceID
            {
                if (bytes[0] == 0xbe && bytes[1] == 0x01 && bytes[3] == 0xd5) {
                    obj = decode_device_id_payload(bytes, port);
                }

            }
            else {
                obj = {};
                obj.error = "ERROR: No decoder for config payload", payload;
            }

        }
        return {
            data: obj
        }
    };