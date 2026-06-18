/**
 * THIS SOFTWARE IS PROVIDED BY GREENME SAS  AND ITS CONTRIBUTORS “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES,
 * INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL APPLE INC. OR ITS CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
 * OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * */

///////////////////////////////////
// Helper class and definitions
///////////////////////////////////
var cp437ToUnicode = [0x0000,0x0001,0x0002,0x0003,0x0004,0x0005,0x0006,0x0007,0x0008,0x0009,0x000a,0x000b,0x000c,0x000d,0x000e,0x000f,0x0010,0x0011,0x0012,0x0013,0x0014,0x0015,0x0016,0x0017,0x0018,0x0019,0x001a,0x001b,0x001c,0x001d,0x001e,0x001f,0x0020,0x0021,0x0022,0x0023,0x0024,0x0025,0x0026,0x0027,0x0028,0x0029,0x002a,0x002b,0x002c,0x002d,0x002e,0x002f,0x0030,0x0031,0x0032,0x0033,0x0034,0x0035,0x0036,0x0037,0x0038,0x0039,0x003a,0x003b,0x003c,0x003d,0x003e,0x003f,0x0040,0x0041,0x0042,0x0043,0x0044,0x0045,0x0046,0x0047,0x0048,0x0049,0x004a,0x004b,0x004c,0x004d,0x004e,0x004f,0x0050,0x0051,0x0052,0x0053,0x0054,0x0055,0x0056,0x0057,0x0058,0x0059,0x005a,0x005b,0x005c,0x005d,0x005e,0x005f,0x0060,0x0061,0x0062,0x0063,0x0064,0x0065,0x0066,0x0067,0x0068,0x0069,0x006a,0x006b,0x006c,0x006d,0x006e,0x006f,0x0070,0x0071,0x0072,0x0073,0x0074,0x0075,0x0076,0x0077,0x0078,0x0079,0x007a,0x007b,0x007c,0x007d,0x007e,0x007f,0x00c7,0x00fc,0x00e9,0x00e2,0x00e4,0x00e0,0x00e5,0x00e7,0x00ea,0x00eb,0x00e8,0x00ef,0x00ee,0x00ec,0x00c4,0x00c5,0x00c9,0x00e6,0x00c6,0x00f4,0x00f6,0x00f2,0x00fb,0x00f9,0x00ff,0x00d6,0x00dc,0x00a2,0x00a3,0x00a5,0x20a7,0x0192,0x00e1,0x00ed,0x00f3,0x00fa,0x00f1,0x00d1,0x00aa,0x00ba,0x00bf,0x2310,0x00ac,0x00bd,0x00bc,0x00a1,0x00ab,0x00bb,0x2591,0x2592,0x2593,0x2502,0x2524,0x2561,0x2562,0x2556,0x2555,0x2563,0x2551,0x2557,0x255d,0x255c,0x255b,0x2510,0x2514,0x2534,0x252c,0x251c,0x2500,0x253c,0x255e,0x255f,0x255a,0x2554,0x2569,0x2566,0x2560,0x2550,0x256c,0x2567,0x2568,0x2564,0x2565,0x2559,0x2558,0x2552,0x2553,0x256b,0x256a,0x2518,0x250c,0x2588,0x2584,0x258c,0x2590,0x2580,0x03b1,0x00df,0x0393,0x03c0,0x03a3,0x03c3,0x00b5,0x03c4,0x03a6,0x0398,0x03a9,0x03b4,0x221e,0x03c6,0x03b5,0x2229,0x2261,0x00b1,0x2265,0x2264,0x2320,0x2321,0x00f7,0x2248,0x00b0,0x2219,0x00b7,0x221a,0x207f,0x00b2,0x25a0];

/**
 * Main class for encoding message.
 */
class Encoder
{
    MSG_LEN_SET_CALIB    = 21;
    MSG_LEN_SET_CFG      = 45;
    MSG_LEN_SET_DISPLAY  = 38;
    MSG_LEN_RESET         = 6;
    MSG_LEN_SET_VALUE    = 10;
    MSG_LEN_SET_ALERT    = 8;
     

    RADIOMSG_HEADER1 = 		0x65;
    RADIOMSG_HEADER2 = 		0xef;       //0xee on devices with fw < 2.5

    RADIOCMD_SET_CALIB  =  	0x04;
    RADIOCMD_SET_CFG =		0x05;
    RADIOCMD_REQUEST_CFG = 	0x06;
    RADIOCMD_SET_DISPLAY = 	0x07;
    RADIOCMD_RESET       = 	0x08;
    RADIOCMD_SET_VALUE   = 	0x09;
    RADIOCMD_SET_ALERT   = 	0x0A;

    TOGGLE_ACTION_IMG	=	0x00;
    TOGGLE_ACTION_TEXT	=	0x01;   

    POLL_RESPONSE_HAPPY =	0x00;
    POLL_RESPONSE_YESNO =	0x01;
    POLL_ACK_OK =		0x00;
    POLL_ACK_SENT =	0x01;

    LANG_FR_FR = 0x00;
    LANG_EN_US = 0x01;
    LANG_EN_GB = 0x02;
    LANG_DE_DE = 0x03;
    LANG_NL_NL = 0x04;
    LANG_PT_PT = 0x05;
    LANG_ES_ES = 0x06;

    MAX_TEXT_LENGTH = 30;
    MAX_TOGGLE_TEXT_LENGTH = 10;

    VALUETYPE_TEMP	= 1;
    VALUETYPE_HYGR	= 2;
    VALUETYPE_DBA	= 3;
    VALUETYPE_LUX = 4;
    VALUETYPE_COLORR = 5;
    VALUETYPE_COLORG = 6;
    VALUETYPE_COLORB = 7;
    VALUETYPE_COLORW = 8;

    constructor()
    {        
    }

	/***
	 * Calibrate device with deltas or gain to raw electronic measurement.
	 * @param deltaTemp_deg
	 * @param deltaHygr
	 * @param gainLux
	 * @param deltaDBA
	 * @param deltaOctave1
	 * @param deltaOctave2
	 * @param deltaOctave3
	 * @param deltaOctave4
	 * @param deltaOctave5
	 * @param deltaOctave6
	 * @param deltaOctave7
	 * @param deltaOctave8
	 * @return
	 */
	MakeMsgCalib(
        deltaTemp_deg,
        deltaHygr,
        gainLux,
        deltaDBA,
        gainColorR,
        gainColorG,
        gainColorB,
        gainColorW
        )
    {
        let i= 0;
        let buffer = new Array(this.MSG_LEN_SET_CALIB).fill(0);
        i=0;
        buffer[i] = this.RADIOMSG_HEADER1;
        i++;
        buffer[i] = this.RADIOMSG_HEADER2;
        i++;
        //cmd
        buffer[i] = this.RADIOCMD_SET_CALIB; 
        i++;
        this.WriteInt16ToBuffer((deltaTemp_deg*100), buffer, i);
        i=i+2;
        this.WriteInt16ToBuffer((deltaHygr*100), buffer, i);
        i=i+2;
        this.WriteU16ToBuffer((gainLux*100), buffer, i);
        i=i+2;
        this.WriteInt16ToBuffer((deltaDBA*100), buffer, i);
        i=i+2;
        this.WriteU16ToBuffer((gainColorR*100), buffer, i);
        i=i+2;
        this.WriteU16ToBuffer((gainColorG*100), buffer, i);
        i=i+2;
        this.WriteU16ToBuffer((gainColorB*100), buffer, i);
        i=i+2;
        this.WriteInt16ToBuffer((gainColorW*100), buffer, i);
        i=i+2;
        
        //crc
        let crc = this.Crc16_ccit_false(buffer, i);
        this.WriteCrc16ToBuffer(crc, buffer, i); 
        i=i+2;

        let result = {b64:null, hex:null};
        let str = '';
        for (let i=0; i<buffer.length; i++)
        {
            if (buffer[i] < 16)
                str += '0'; 
            str += buffer[i].toString(16);
        }
        result.hex = str;
        str = String.fromCharCode.apply(String, buffer);
        result.b64 = btoa(str);
        return result;
    }

    /**
     * Calibrate a sensor. Output value will take given value.
     * @param {*} sensorType 
     * @param {*} measure 
     * @returns 
     */
    MakeMsgSetValue(sensorType,  measure)
    {
        if ((sensorType < 1) || (sensorType > 8))
            return;

        let i= 0;
        let buffer = new Array(this.MSG_LEN_SET_VALUE).fill(0);
        i=0;
        buffer[i] = this.RADIOMSG_HEADER1;
        i++;
        buffer[i] = this.RADIOMSG_HEADER2;
        i++;
        //cmd
        buffer[i] = this.RADIOCMD_SET_VALUE; 
        i++;
        
        buffer[i] = sensorType;
        i++;
        this.WriteFloatToBuffer(measure, buffer, i);
        i=i+4;
        
        //crc
        let crc = this.Crc16_ccit_false(buffer, i);
        this.WriteCrc16ToBuffer(crc, buffer, i); 
        i=i+2;

        let result = {b64:null, hex:null};
        let str = '';
        for (let i=0; i<buffer.length; i++)
        {
            if (buffer[i] < 16)
                str += '0'; 
            str += buffer[i].toString(16);
        }
        result.hex = str;
        str = String.fromCharCode.apply(String, buffer);
        result.b64 = btoa(str);
        return result;
    }

    /**
     * Reset device.
     * @param {} factoryReset true to perform full reset
     * @returns 
     */
    MakeMsgReset(factoryReset = false)
    {
        let i= 0;
        let buffer = new Array(this.MSG_LEN_RESET).fill(0);

       
        buffer[i] = this.RADIOMSG_HEADER1;
        i++;
        buffer[i] = this.RADIOMSG_HEADER2;
        i++;
        //cmd
        buffer[i] = this.RADIOCMD_RESET; 
        i++;
        
        if (factoryReset)
            buffer[i] = 0x11;
        else
            buffer[i] = 0x01;
        i++;
        
        //crc
        let crc = this.Crc16_ccit_false(buffer, i);
        this.WriteCrc16ToBuffer(crc, buffer, i); 
        i=i+2;

        let result = {b64:null, hex:null};
        let str = '';
        for (let i=0; i<buffer.length; i++)
        {
            if (buffer[i] < 16)
                str += '0'; 
            str += buffer[i].toString(16);
        }
        result.hex = str;
        str = String.fromCharCode.apply(String, buffer);
        result.b64 = btoa(str);
        return result;
    }

    /**
     * Configure the device
     * @param {*} shortMsgInterval_min  interval between short messages, in minutes 
     * @param {*} longMsgInterval_min   interval between long messages, in minutes
     * @param {*} showTemp true if temperature screen must be displayed
     * @param {*} showHygr true if hygrometry screen must be displayed
     * @param {*} showLux true if light screen must be displayed
     * @param {*} showNoise true if noise screen must be displayed
     * @param {*} showAir true if air quality screen must be displayed
     * @param {*} showToggle true if the device should react on toggle left/right
     * @param {*} BleBeaconEnabled //unused
     * @param {*} disableSound disable sound measurment (will send zeros)
     * @param {*} disableVOC  disable voc measurement
     * @param {*} toggleModeText show text rather than smileys
     * @param {*} imgToggleLeft  unused
     * @param {*} imgToggleRight unused
     * @param {*} imgToggleBack unused
     * @param {*} extSensorType none, co2 or pm
     * @param {*} textToggleLeft text to display on toggle left
     * @param {*} textToggleRight text to display on toggle right 
     * @param {*} textAcknowledgment text to display after toggle end
     * @param {*} lang language
     * @param {*} eventMode unused
     * @param {*} eventFrom unused
     * @param {*} eventThreshold unused
     * @param {*} eventWindow_s unused
     * @returns 
     */
    MakeMsgConfig(shortMsgInterval_min, longMsgInterval_min, showTemp, showHygr, showLux, showNoise, showAir, showToggle, BleBeaconEnabled, disableSound, disableVOC,
        toggleModeText, imgToggleLeft, imgToggleRight, imgToggleBack, extSensorType, textToggleLeft, textToggleRight, textAcknowledgment, 
        lang, eventMode, eventFrom, eventThreshold, eventWindow_s)
    {
        let i= 0;
        let val;
        let buffer = new Array(this.MSG_LEN_SET_CFG).fill(0);

       
        buffer[i] = this.RADIOMSG_HEADER1;
        i++;
        buffer[i] = this.RADIOMSG_HEADER2;
        i++;
        //cmd
        buffer[i] = this.RADIOCMD_SET_CFG; 
        i++;
        
        buffer[i] = (shortMsgInterval_min > 255)?255:shortMsgInterval_min;
        i++;
        buffer[i] = (longMsgInterval_min > 255)?255:longMsgInterval_min;
        i++;

        buffer [i] = 0;
        buffer[i] |= showTemp?0x80:0;
        buffer[i] |= showHygr?0x40:0;
        buffer[i] |= showLux?0x20:0;
        buffer[i] |= showNoise?0x10:0;
        buffer[i] |= showAir?0x08:0;
        buffer[i] |= showToggle?0x04:0;
        buffer[i] |= BleBeaconEnabled?0x02:0;
        buffer[i] |= disableSound?0x01:0;
        i++;
        
        buffer [i] = 0;
        buffer[i] |= disableVOC?0x80:0;
        buffer[i] |= toggleModeText?0x40:0;
        val = (imgToggleLeft>7)?7:imgToggleLeft;
        buffer[i] |= val << 3;
        val = (imgToggleRight>7)?7:imgToggleRight;
        buffer[i] |= val;
        i++;

        buffer[i] = 0;
        val = (imgToggleBack>7)?7:imgToggleBack;
        buffer[i] |= val << 5;
        buffer[i] |= extSensorType & 0x1f;
        i++;
        
        let cp437str = this.Utf8TextToCp437(textToggleLeft);
        for (let j=0; j < cp437str.length; j++)
        {
            buffer[i+j] = cp437str[j];
            if (j >= this.MAX_TOGGLE_TEXT_LENGTH - 1) 
                break;
        }
        i+= this.MAX_TOGGLE_TEXT_LENGTH;

        cp437str = this.Utf8TextToCp437(textToggleRight);
        for (let j=0; j < cp437str.length; j++)
        {
            buffer[i+j] = cp437str[j];
            if (j >= this.MAX_TOGGLE_TEXT_LENGTH - 1) 
                break;
        }
        i+= this.MAX_TOGGLE_TEXT_LENGTH;

        cp437str = this.Utf8TextToCp437(textAcknowledgment);
        for (let j=0; j < cp437str.length; j++)
        {
            buffer[i+j] = cp437str[j];
            if (j >= this.MAX_TOGGLE_TEXT_LENGTH - 1) 
                break;
        }
        i+= this.MAX_TOGGLE_TEXT_LENGTH;


        switch (lang)
        {
            case "FR_FR":
                buffer[i] = this.LANG_FR_FR;
                break;
            case "EN_US":
                buffer[i] = this.LANG_EN_US;
                break;
            case "EN_GB":
                buffer[i] = this.LANG_EN_GB;
                    break;
            case "DE_DE":
                buffer[i] = this.LANG_DE_DE;
                break;
            case "NL_NL":
                    buffer[i] = this.LANG_NL_NL;
                    break;
                case "PT_PT":
                buffer[i] = this.LANG_PT_PT;
                break;
            case "ES_ES":
                buffer[i] = this.LANG_ES_ES;
                break;
            default:
                buffer[i] = this.LANG_EN_GB;
                break;
        }
        i++;

        buffer[i] = eventMode & 0xff;
        i++;

        buffer[i] = eventFrom & 0xff;
        i++;
        
        buffer[i] = eventThreshold & 0xff;
        i++;
        
        buffer[i] = eventWindow_s & 0xff;
        i++;

        //crc
        let crc = this.Crc16_ccit_false(buffer, i);
        this.WriteCrc16ToBuffer(crc, buffer, i); 
        i=i+2;

        let result = {b64:null, hex:null};
        let str = '';
        for (let i=0; i<buffer.length; i++)
        {
            if (buffer[i] < 16)
                str += '0'; 
            str += buffer[i].toString(16);
        }
        result.hex = str;
        str = String.fromCharCode.apply(String, buffer);
        result.b64 = btoa(str);
        return result;
    }

    /**
     * Configure the cube's display (beta)
     * 
     * @param {*} endOnToggle set to true if display should return to normal after toggle
     * @param {*} endOnReboot set to true if display should return to normal after reboot
     * @param {*} expiresAfter_h how many hours should this message to show
     * @param {*} repeat_every_h how often this message should repeat
     * @param {*} responseChoices smileys (0x00) or yes/no (0x01)
     * @param {*} acknowledgement ok (0x00) or sent (0x01)
     * @param {*} text text to display, 30 characters max
     * @returns 
     */
    MakeMsgDisplay(endOnToggle, endOnReboot, expiresAfter_h, repeat_every_h, responseChoices, acknowledgement, text)
    {
        let i= 0;
        let buffer = new Array(this.MSG_LEN_SET_DISPLAY).fill(0);
        let totalMsgLength = this.MAX_TEXT_LENGTH + 7;

        for (i=0 ; i<totalMsgLength; i++)
        {
            buffer[i] = 0;
        }
        i=0;
        buffer[i] = this.RADIOMSG_HEADER1;
        i++;
        buffer[i] = this.RADIOMSG_HEADER2;
        i++;
        buffer[i] = this.RADIOCMD_SET_DISPLAY; 
        i++;

        let cfg = 0;
        if (endOnToggle)
            cfg |= 0x80;
        if (endOnReboot)
            cfg |= 0x40;
        
        
        cfg |= (responseChoices & 0x7) << 3;
        cfg |= (acknowledgement & 0x7) ;
        cfg &= 0xff;    //cleanup
        buffer[i] = cfg;
        i++;
        
        buffer[i] = expiresAfter_h & 0xff;
        i++;

        buffer[i] =  repeat_every_h & 0xff;
        i++;

        let cp437str = this.Utf8TextToCp437(text);
        for (let j=0; j < cp437str.length; j++)
        {
            buffer[i+j] = cp437str[j];
            if (j >= this.MAX_TEXT_LENGTH - 1) 
                break;
        }
        i+= this.MAX_TEXT_LENGTH;
        

        //crc
        let crc = this.Crc16_ccit_false(buffer, i);
        this.WriteCrc16ToBuffer(crc, buffer, i); 
        i=i+2;

        let result = {b64:null, hex:null};
        let str = '';
        for (let i=0; i<buffer.length; i++)
        {
            if (buffer[i] < 16)
                str += '0'; 
            str += buffer[i].toString(16);
        }
        result.hex = str;
        str = String.fromCharCode.apply(String, buffer);
        result.b64 = btoa(str);
        return result;
    
    }


    /**
     * Convert UTF8 string to CP437 char array
     * @param {*} utf8str 
     * @returns 
     */
    Utf8TextToCp437(utf8str)
    {
        let cp437 = new Array();
        let len = utf8str.length;
        for (let i=0; i<len; i++)
        {
            let code = utf8str.charCodeAt(i);
            for (let j=0; j<cp437ToUnicode.length; j++)
            {
                //find char
                if (cp437ToUnicode[j] == code)
                {
                    if ((j >= 0x20) && (j <= 0xA9))
                        cp437.push(j);
                    break;
                }
            }

        }
        return cp437;
    }

    Base64ToHexString(b64Str)
    {
        var str = atob(b64Str);
    }

    /**
     * Calculate CRC16
     * @param {*} buffer 
     * @param {*} Size 
     * @returns 
     */
    Crc16_ccit_false(buffer, Size)
    {
        var crcTable = [
            0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50A5, 0x60C6, 0x70E7,
            0x8108, 0x9129, 0xA14A, 0xB16B, 0xC18C, 0xD1AD, 0xE1CE, 0xF1EF,
            0x1231, 0x0210, 0x3273, 0x2252, 0x52B5, 0x4294, 0x72F7, 0x62D6,
            0x9339, 0x8318, 0xB37B, 0xA35A, 0xD3BD, 0xC39C, 0xF3FF, 0xE3DE,
            0x2462, 0x3443, 0x0420, 0x1401, 0x64E6, 0x74C7, 0x44A4, 0x5485,
            0xA56A, 0xB54B, 0x8528, 0x9509, 0xE5EE, 0xF5CF, 0xC5AC, 0xD58D,
            0x3653, 0x2672, 0x1611, 0x0630, 0x76D7, 0x66F6, 0x5695, 0x46B4,
            0xB75B, 0xA77A, 0x9719, 0x8738, 0xF7DF, 0xE7FE, 0xD79D, 0xC7BC,
            0x48C4, 0x58E5, 0x6886, 0x78A7, 0x0840, 0x1861, 0x2802, 0x3823,
            0xC9CC, 0xD9ED, 0xE98E, 0xF9AF, 0x8948, 0x9969, 0xA90A, 0xB92B,
            0x5AF5, 0x4AD4, 0x7AB7, 0x6A96, 0x1A71, 0x0A50, 0x3A33, 0x2A12,
            0xDBFD, 0xCBDC, 0xFBBF, 0xEB9E, 0x9B79, 0x8B58, 0xBB3B, 0xAB1A,
            0x6CA6, 0x7C87, 0x4CE4, 0x5CC5, 0x2C22, 0x3C03, 0x0C60, 0x1C41,
            0xEDAE, 0xFD8F, 0xCDEC, 0xDDCD, 0xAD2A, 0xBD0B, 0x8D68, 0x9D49,
            0x7E97, 0x6EB6, 0x5ED5, 0x4EF4, 0x3E13, 0x2E32, 0x1E51, 0x0E70,
            0xFF9F, 0xEFBE, 0xDFDD, 0xCFFC, 0xBF1B, 0xAF3A, 0x9F59, 0x8F78,
            0x9188, 0x81A9, 0xB1CA, 0xA1EB, 0xD10C, 0xC12D, 0xF14E, 0xE16F,
            0x1080, 0x00A1, 0x30C2, 0x20E3, 0x5004, 0x4025, 0x7046, 0x6067,
            0x83B9, 0x9398, 0xA3FB, 0xB3DA, 0xC33D, 0xD31C, 0xE37F, 0xF35E,
            0x02B1, 0x1290, 0x22F3, 0x32D2, 0x4235, 0x5214, 0x6277, 0x7256,
            0xB5EA, 0xA5CB, 0x95A8, 0x8589, 0xF56E, 0xE54F, 0xD52C, 0xC50D,
            0x34E2, 0x24C3, 0x14A0, 0x0481, 0x7466, 0x6447, 0x5424, 0x4405,
            0xA7DB, 0xB7FA, 0x8799, 0x97B8, 0xE75F, 0xF77E, 0xC71D, 0xD73C,
            0x26D3, 0x36F2, 0x0691, 0x16B0, 0x6657, 0x7676, 0x4615, 0x5634,
            0xD94C, 0xC96D, 0xF90E, 0xE92F, 0x99C8, 0x89E9, 0xB98A, 0xA9AB,
            0x5844, 0x4865, 0x7806, 0x6827, 0x18C0, 0x08E1, 0x3882, 0x28A3,
            0xCB7D, 0xDB5C, 0xEB3F, 0xFB1E, 0x8BF9, 0x9BD8, 0xABBB, 0xBB9A,
            0x4A75, 0x5A54, 0x6A37, 0x7A16, 0x0AF1, 0x1AD0, 0x2AB3, 0x3A92,
            0xFD2E, 0xED0F, 0xDD6C, 0xCD4D, 0xBDAA, 0xAD8B, 0x9DE8, 0x8DC9,
            0x7C26, 0x6C07, 0x5C64, 0x4C45, 0x3CA2, 0x2C83, 0x1CE0, 0x0CC1,
            0xEF1F, 0xFF3E, 0xCF5D, 0xDF7C, 0xAF9B, 0xBFBA, 0x8FD9, 0x9FF8,
            0x6E17, 0x7E36, 0x4E55, 0x5E74, 0x2E93, 0x3EB2, 0x0ED1, 0x1EF0,
        ];
        var crc = 0xFFFF;
        var j, i,c;
    
        for (i = 0; i < Size; i++) {
    
            c = buffer[i];
            j = (c ^ (crc >> 8)) & 0xFF;
            crc = crcTable[j] ^ (crc << 8);
        }
    
        return crc & 0xffff;
    }


    /**
     * Write CRC value to the end of the byte array.
     * @param {*} value 
     * @param {*} buffer 
     * @param {*} pos 
     */
    WriteCrc16ToBuffer(value, buffer, pos)
    {
        let u16 = new Uint16Array([value])[0]; 
        buffer[pos+1]   = u16 >> 8;
        buffer[pos] = u16 & 0x00ff;
    }

    /**
     * Add UINT16 to byte array
     * @param {*} value 
     * @param {*} buffer 
     * @param {*} pos 
     */
    WriteU16ToBuffer(value, buffer, pos)
    {
        let u16Array = new Int16Array(1);
        u16Array[0] = value;
        let byteArray = new Uint8Array(u16Array.buffer);
        for (let i=0; i<2; i++)
            buffer[pos+(1-i)] = byteArray[i]; 
    }

    /**
     * Add 16 bit int to byte array
     * @param {*} value 
     * @param {*} buffer 
     * @param {*} pos 
     */
    WriteInt16ToBuffer(value, buffer, pos)
    {
        let shortArray = new Int16Array(1);
        shortArray[0] = value;
        let byteArray = new Uint8Array(shortArray.buffer);
        for (let i=0; i<2; i++)
            buffer[pos+(1-i)] = byteArray[i]; 
    }

    /**
     * Add float to byte array.
     * @param {*} value 
     * @param {*} buffer 
     * @param {*} pos 
     */
    WriteFloatToBuffer(value, buffer, pos)
    {
        let floatArray = new Float32Array(1);
        floatArray[0] = value;
        let byteArray = new Uint8Array(floatArray.buffer);
        for (let i=0; i<4; i++)
            buffer[pos+i] = byteArray[i];
    }
}

/////////////////////////////////
// TTN Encode Decode
/////////////////////////////////

function decodeUplink(input) {
  var data = {};
  var errors = [];
  var warnings = [];

  //constants
  var MESSAGEV2_SHORT = 5;
  var MESSAGEV2_FULL  = 6;
  var MESSAGEV2_FEEL  = 7;
  var MESSAGEEXT_NONE = 0;
  var MESSAGEEXT_CO2ONLY = 1;
  var MESSAGEEXT_COVONLY = 2;
  var MESSAGEEXT_COV_CO2 = 3;
  var MESSAGEEXT_PMONLY  = 4;
  var MESSAGEEXT_COV_PM  = 5;
  var MESSAGEEXT_COV_CO2_PM  = 6;
          
  var FEEL_UNHAPPY  = 1;
  var FEEL_HAPPY   = -1;
  var FEEL_UNKNOWN = 0;
  
  var ValidateMessageSize = function (bytes)
  {
      var msgSizes = new Map();
      msgSizes[MESSAGEV2_SHORT] = 11;
      msgSizes[MESSAGEV2_FULL] = 26;
      msgSizes[MESSAGEV2_FEEL] = 26;
      
      var msgExtSizes = new Map();
      msgExtSizes[MESSAGEEXT_NONE] = 0;
      msgExtSizes[MESSAGEEXT_CO2ONLY] = 2;
      msgExtSizes[MESSAGEEXT_COVONLY] = 2;
      msgExtSizes[MESSAGEEXT_COV_CO2] = 4;
  
      var msgType = bytes[0] & 0x0f;
      var msgSize = bytes.length;
      var bodySize = msgSizes[msgType];

      if (bodySize === undefined)
      {
          return false;
      }
      
      if (msgSize < bodySize)
          return false;
      else 
      {
          var msgExtType = bytes[bodySize - 1];
          var extSize = msgExtSizes[msgExtType];
          if (extSize === undefined)
          {
              return false;
          }
          else 
          {
              if (msgSize == bodySize + extSize)
                  return true;
              else 
                  return false;
          }
      }
  };
  
  var bytes = input.bytes;
  if (!ValidateMessageSize(bytes))
  {
      errors.push("invalid message size");
  }
  else 
  {
      var i = 0;
  
      //decode header
      var header = bytes[0];
      i++;

      var val = header & 0xc0;
      if (val == 0x40)
          data.lastFeel = FEEL_UNHAPPY;
      else if (val == 0x80)
          data.lastFeel = FEEL_HAPPY;
      else 
          data.lastFeel = FEEL_UNKNOWN;
      
      var status = (header & 0x30) >> 4;
      var messageType = header & 0x0f;

      //decode code data
      if ((messageType == MESSAGEV2_SHORT) || (messageType == MESSAGEV2_FULL) || (messageType == MESSAGEV2_FEEL))
      {
          data.temperature = (bytes[i+1]*256 + bytes[i])/100.0;
          i+=2;
          data.hygrometry = (bytes[i+1]*256 + bytes[i])/100.0;
          i+=2;
          data.noiseMax = bytes[i]/2;
          i++;
          data.noiseAvg = bytes[i]/2;
          i++;
          data.lux = (bytes[i+1]*256 + bytes[i]);
          i+=2;
      }

      //decode full et feel messages
      if ((messageType == MESSAGEV2_FULL) || (messageType == MESSAGEV2_FEEL))
      {
          data.lightColorR = bytes[i] & 0xff;
          i++;
          data.lightColorG = bytes[i] & 0xff;
          i++;
          data.lightColorB = bytes[i] & 0xff;
          i++;
          data.lightColorW =  (bytes[i+1]*256 + bytes[i]);
          i=i+2;
          data.flicker = bytes[i];
          i++;
          data.octave1 = bytes[i];
          i++;
          data.octave2 = bytes[i];
          i++;
          data.octave3 = bytes[i];
          i++;
          data.octave4 = bytes[i];
          i++;
          data.octave5 = bytes[i];
          i++;
          data.octave6 = bytes[i];
          i++;
          data.octave7 = bytes[i];
          i++;
          data.octave8 = bytes[i];
          i++;
          data.octave9 = bytes[i];
          i++;
      }
      
      if ((messageType == MESSAGEV2_SHORT) || (messageType == MESSAGEV2_FULL) ||
          (messageType == MESSAGEV2_FEEL))
      {
          //battery level and status: unused
          i++;
          
          //extended messages
          var extMsgType = bytes[i];
          i++;
          
          //var extMessageType = extMsgType;
          if (extMsgType == MESSAGEEXT_CO2ONLY)
          {
              data.co2 = bytes[i+1]*256 + bytes[i];
              i+=2;
          }
          else if (extMsgType == MESSAGEEXT_COVONLY)
          {
              data.tvoc = bytes[i+1]*256 + bytes[i];
              i+=2;
          }
          else if (extMsgType == MESSAGEEXT_COV_CO2)
          {
              data.tvoc = bytes[i+1]*256 + bytes[i];
              i+=2;
              data.co2 = bytes[i+1]*256 + bytes[i];
              i+=2;
          }
      }
  }
  
  return {
    data: data,
    warnings: warnings,
    errors: errors
  };
}

function encodeDownlink(input) {
  let encoder = new Encoder();
  let bytes = null;

  if (input.msgType == 'MakeMsgCalib')
  {
    bytes = encoder.MakeMsgCalib(
      input.deltaTemp_deg,
      input.deltaHygr,
      input.gainLux,
      input.deltaDBA,
      input.gainColorR,
      input.gainColorG,
      input.gainColorB,
      input.gainColorW);
  }
  else if (input.msgType == 'MakeMsgSetValue')
  {
    bytes = encoder.MakeMsgSetValue(
      input.sensorType, 
      input.measure);
  }
  else if (input.msgType == 'MakeMsgConfig')
  {
    bytes = encoder.MakeMsgConfig(
      input.shortMsgInterval_min, 
      input.longMsgInterval_min, 
      input.showTemp, 
      input.showHygr, 
      input.showLux, 
      input.showNoise, 
      input.showAir, 
      input.showToggle, 
      0, 
      input.disableSound, 
      input.disableVOC,
      input.toggleModeText, 
      input.imgToggleLeft, 
      input.imgToggleRight, 
      input.imgToggleBack, 
      input.extSensorType, 
      input.textToggleLeft, 
      input.textToggleRight, 
      input.textAcknowledgment, 
      input.lang, 
      0, 
      0, 
      0, 
      0);
  
  }
  else if (input.msgType == 'MakeMsgDisplay')
  {
    bytes = encoder.MakeMsgDisplay(
      input.endOnToggle,
      input.endOnReboot, 
      input.expiresAfter_h, 
      input.repeat_every_h, 
      input.responseChoices, 
      input.acknowledgement, 
      input.text);
  }
  else
  {
    return {errors:['bad message type.']};
  }

  if (bytes == null)
  {
    return {errors:['could not encode message.']};
  } 
  else {
    return {
      // LoRaWAN FPort used for the downlink message
      fPort: 1,
      // Encoded bytes
      bytes: bytes,
    };
  }
}

function decodeDownlink(input) {
  return null;
}
