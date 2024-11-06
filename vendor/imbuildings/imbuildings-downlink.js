const settingIdentifier = {
    DEVICE_ID:                      0x02,
    INTERVAL:                       0x1E,
    EVENT_SETTING:                  0x1F,
    PAYLOAD_DEFINITION:             0x20,
    HEARTBEAT_INTERVAL:             0x21,
    HEARTBEAT_PAYLOAD_DEFINITION:   0x22,
    DEVICE_ADDRESS:                 0x2B,
    CONFIRMED_MESSAGES:             0x2F,
    FPORT:                          0x33,
    FPORT_HEARTBEAT:                0x36,
    ERRORS:                         0xF0
}

const command = {
    GET_PAYLOAD:                    0x01,
    REJOIN:                         0x02,
    COUNTER_PRESET:                 0x03,
    SAVE:                           0x04
}

function decodeDownlink(input){
    if(input.fPort != 10){
        return { errors: ['Please use FPort 10 for downlink results']};
    }

    if(input.bytes[0] != 0xF1 || input.bytes[1] != 0x01){
        return { errors: ['Expected downlink payload']};
    }

    return {
        data: input
    }

}

function encodeDownlink(input){
    let dl = [0xF1, 0x01];

    if(input.data.interval !== undefined){
        if(input.data.interval == null){
            dl.push(0x02);
            dl.push(settingIdentifier.INTERVAL);
        }else{
            dl.push(0x03);
            dl.push(settingIdentifier.INTERVAL);
            dl.push(input.data.interval);
        }
        
    }

    if(input.data.event !== undefined && input.data.event.count !== undefined && input.data.event.timeout !== undefined){
        dl.push(0x05);
        dl.push(settingIdentifier.EVENT_SETTING);
        dl.push(0x01);
        dl.push(input.data.event.count);
        dl.push(input.data.event.timeout);
    }

    if(input.data.payload !== undefined && input.data.payload.type !== undefined&& input.data.payload.variant !== undefined && input.data.payload.header !== undefined){
        dl.push(0x05);
        dl.push(settingIdentifier.PAYLOAD_DEFINITION);
        dl.push(input.data.payload.type);
        dl.push(input.data.payload.variant);
        dl.push((input.data.payload.header === true) ? 0x01 : 0x00);
    }

    if(input.data.fport !== undefined){
        dl.push(0x03);
        dl.push(settingIdentifier.FPORT);
        dl.push(input.data.fport);
    }

    if(input.data.heartbeat){
        if(input.data.heartbeat.interval !== undefined){
            dl.push(0x03);
            dl.push(settingIdentifier.HEARTBEAT_INTERVAL);
            dl.push(input.data.heartbeat.interval);
        }

        if(input.data.heartbeat.payload !== undefined && input.data.heartbeat.payload.type !== undefined && input.data.heartbeat.payload.variant !== undefined && input.data.heartbeat.payload.header !== undefined){
            dl.push(0x05);
            dl.push(settingIdentifier.HEARTBEAT_PAYLOAD_DEFINITION);
            dl.push(input.data.heartbeat.payload.type);
            dl.push(input.data.heartbeat.payload.variant);
            dl.push((input.data.heartbeat.payload.header === true) ? 0x01 : 0x00);
        }

        if(input.data.heartbeat.fport !== undefined){
            dl.push(0x03);
            dl.push(settingIdentifier.FPORT_HEARTBEAT);
            dl.push(input.data.heartbeat.fport);
        }
    }

    if(input.data.confirmed_messages !== undefined){
        dl.push(0x03);
        dl.push(settingIdentifier.CONFIRMED_MESSAGES);
        dl.push(input.data.confirmed_messages);
    }

    if(input.data.save !== undefined && input.data.save === true){
        dl.push(0x03);
        dl.push(settingIdentifier.SAVE);
        dl.push(command.save);
    }

    return {
        fPort: 10,
        bytes: dl
    };
}