function command_format_check(bytes, port)
{
    switch(port) 
    {
        case 5:
            if (bytes.length === 7) 
                return true;
            break;

        case 6:
            if (bytes.length === 11) 
                return true;
            break;
        
        case 7:
            if (bytes.length === 10) 
                return true;
            break;

        case 8:
            if (bytes.length === 11) 
                return true;
            break;

        case 9:
            if (bytes.length === 10) 
                return true;
            break;

        case 10:
            if (bytes.length === 10) 
                return true;
            break;

        case 11:
            if (bytes.length === 10) 
                return true;
            break;

        case 12:
            if (bytes.length === 11) 
                return true;
            break;

        case 13:
            if (bytes.length === 6) 
                return true;
            break;

        case 14:
            if (bytes.length === 10) 
                return true;
            break;

        default:
           break;
    }

    return false;   
}

function timezone_decode(tz)
{
    var tz_str = "UTC";

    if (tz < 0)
    {
        tz_str +="-";
        tz = -tz;
    }
    else
    {
        tz_str +="+";
    }
    
    if (tz < 20)
    {
        tz_str += "0";
    }

    tz_str += String(parseInt(tz/2));
    tz_str += ":"

    if (tz % 2) 
    {
        tz_str += "30"
    }
    else
    {
        tz_str += "00"
    }
    
    return tz_str;
}

function parse_int16(num)
{
    if (num & 0x8000) 
        return (num-0x10000);
    else
        return num;
}

function parse_int24(num)
{
    if (num & 0x800000) 
        return (num-0x1000000);
    else
        return num;
}

function Decoder(bytes, port)
{
    var res_data = {};

    res_data.port = port;

    if(command_format_check(bytes, port) == false)
    {
        res_data.result = 'Format wrong';
        return res_data;
    }  
    res_data.timestamp = bytes[0]<<24 | bytes[1]<<16 | bytes[2]<<8 | bytes[3];
    res_data.timezone = timezone_decode(bytes[4])

    switch(port) 
    {
        case 5:
            res_data.switch_state = bytes[5];
            res_data.load_state = bytes[6];
            break;

        case 6:
            res_data.voltage = (bytes[5]<<8 | bytes[6])/10;
            res_data.current  = parse_int16(bytes[7]<<8 | bytes[8])/1000;
            res_data.freq  = (bytes[9]<<8 | bytes[10])/1000;
            break;
        
        case 7:
            res_data.power = (bytes[5]<<24 | bytes[6]<<16 | bytes[7]<<8 | bytes[8]) / 10;
            res_data.factor = bytes[9];
            break;
           
        case 8:
            res_data.all_energy = bytes[5]<<24 | bytes[6]<<16 | bytes[7]<<8 | bytes[8];
            res_data.last_hour_energy = bytes[9]<<8 | bytes[10];
            break;

        case 9:
            res_data.overvoltage_state = bytes[5];
            res_data.current_voltage = (bytes[6]<<8 | bytes[7])/10;
            res_data.protect_voltage = (bytes[8]<<8 | bytes[9])/10;
            break;
           
        case 10:
            res_data.undervoltage_state = bytes[5];
            res_data.current_voltage = (bytes[6]<<8 | bytes[7])/10;
            res_data.protect_voltage = (bytes[8]<<8 | bytes[9])/10;
            break;

        case 11:
            res_data.overcurrent_state = bytes[5];
            res_data.current_current = parse_int16(bytes[6]<<8 | bytes[7])/1000;
            res_data.protect_current = (bytes[8]<<8 | bytes[9])/1000;
            break;

        case 12:
            res_data.overpower_state = bytes[5];
            res_data.current_power = parse_int24(bytes[6]<<16 | bytes[7]<<8 | bytes[8])/10;
            res_data.protect_power = (bytes[9]<<8 | bytes[10])/10;
            break;

        case 13:
            res_data.load_change_state  = bytes[5];
            break;

        case 14:
            res_data.countdown_state  = bytes[5];
            res_data.countdown_time = bytes[6]<<24 | bytes[7]<<16 | bytes[8]<<8 | bytes[9];
            break;

        default:
           break;
    } 

    return res_data;
}

//res_data = Decoder([0x61, 0xA8, 0xED, 0x71, 0x10, 0x00, 0x00], 5);
//res_data = Decoder([0x61, 0xAD, 0x6C, 0x62, 0x10, 0x09, 0x2D, 0xF2, 0x0F, 0xC3, 0x65], 6);
//res_data = Decoder([0x61, 0xAD, 0x6C, 0x62, 0x10, 0x00, 0x00, 0x78, 0xF9, 0x26], 7);
//res_data = Decoder([0x61, 0xAD, 0x6C, 0x44, 0x10, 0x00, 0xB4, 0x1F, 0x3F, 0x01, 0x67], 8);
//console.log(res_data);
