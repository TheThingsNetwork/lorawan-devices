/**
 * PMX TCR Payload    
 * 
 * THIS SOFTWARE IS PROVIDED BY PMX SYSTEMS AG AND ITS CONTRIBUTORS “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES, 
 * INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
 * IN NO EVENT SHALL APPLE INC. OR ITS CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, 
 * OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; 
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, 
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, 
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. 
 *   
*/
const DeviceTypes = [
  "TCR-LS",         /* 0 Low  Speed       (2 Speed Groups) */
  "TCR-LSS",        /* 1 Low  Speed Solar (2 Speed Groups) */
  "TCR-HS",         /* 2 High Speed       (4 Speed Groups) */
  "TCR-HSS",        /* 3 High Speed Solar (4 Speed Groups) */
  "TCR-LSA",        /* 4 Low  Speed AC Powered (2 Speed Groups) */
  "TCR-LSB",        /* 5 Low  Speed AC External Battery Powered (4 Speed Groups) */
  "TCR-HSA",        /* 6 High Speed AC Powered (4 Speed Groups) */
  "TCR-HSB",        /* 7 High Speed External Battery Powered (4 Speed Groups) */
  "TCR-LSBS",       /* 8 Low Speed External Battery (External) + Solar (2 Speed Groups) */
  "TCR-HSBS",        /* 9 High Speed External Battery (External) + Solar (4 Speed Groups) */
  "TCR-DLI",        /* 10 DC powered, LoRaWAN, Internal Antenna */
  "TCR-DLE",        /* 11 DC powered, LoRaWAN, External Antenna */
  "TCR-SLI",        /* 12 Solar powered, LoRaWAN, Internal Antenna */
  "TCR-SLE",        /* 13 Solar powered, LoRaWAN, External Antenna */
];

// Function levels 
const FeatureLevel = [
  "BASIC",          /* 0 BASIC Features enabled (no licence installed) */
  "ADVANCED",       /* 1 ADVANCED Features enabled   */
  "PRO"             /* 2 PRO Features enabled  */
];

// Speed classes  
const SpeedClassTypes = [
  "P",           /* 0 Speed class for people counting (very low speed) */
  "LS",          /* 1 Low speed traffic counting */
  "HS"           /* 2 High speed traffic counting */
];

// Array of all available config keys (since JavaScript has no enum)
// Use this array to have a key instead of just an index number
const ConfigKeys = {

  // 0 Totals
  LR_CF_CMD_CAT0_ENABLED: 0x01,    /** Enable category */
  LR_CF_CMD_CAT0_MIN_SIZE: 0x02,   /** Change min object size of category */
  LR_CF_CMD_CAT0_MAX_SIZE: 0x03,   /** Overwrite max object size of category */
  LR_CF_CMD_CAT0_MIN_SPEED: 0x04,  /** Overwrite min object speed of category */
  LR_CF_CMD_CAT0_MAX_SPEED: 0x05,  /** Overwrite max object speed of category */

  // 1
  LR_CF_CMD_CAT1_ENABLED: 0x11,    /** Enable category */
  LR_CF_CMD_CAT1_MIN_SIZE: 0x12,   /** Overwrite min object size of category */
  LR_CF_CMD_CAT1_MAX_SIZE: 0x13,   /** Overwrite max object size of category */
  LR_CF_CMD_CAT1_MIN_SPEED: 0x14,  /** Overwrite min object speed of category */
  LR_CF_CMD_CAT1_MAX_SPEED: 0x15,  /** Overwrite max object speed of category */

  // 2
  LR_CF_CMD_CAT2_ENABLED: 0x21,    /** Enable category */
  LR_CF_CMD_CAT2_MIN_SIZE: 0x22,   /** Overwrite min object size of category */
  LR_CF_CMD_CAT2_MAX_SIZE: 0x23,   /** Overwrite max object size of category */
  LR_CF_CMD_CAT2_MIN_SPEED: 0x24,  /** Overwrite min object speed of category */
  LR_CF_CMD_CAT2_MAX_SPEED: 0x25,  /** Overwrite max object speed of category */

  // 3
  LR_CF_CMD_CAT3_ENABLED: 0x31,    /** Enable category */
  LR_CF_CMD_CAT3_MIN_SIZE: 0x32,   /** Overwrite min object size of category */
  LR_CF_CMD_CAT3_MAX_SIZE: 0x33,   /** Overwrite max object size of category */
  LR_CF_CMD_CAT3_MIN_SPEED: 0x34,  /** Overwrite min object speed of category */
  LR_CF_CMD_CAT3_MAX_SPEED: 0x35,  /** Overwrite max object speed of category */

  // 4
  LR_CF_CMD_CAT4_ENABLED: 0x41,    /** Enable category */
  LR_CF_CMD_CAT4_MIN_SIZE: 0x42,   /** Overwrite min object size of category */
  LR_CF_CMD_CAT4_MAX_SIZE: 0x43,   /** Overwrite max object size of category */
  LR_CF_CMD_CAT4_MIN_SPEED: 0x44,  /** Overwrite min object speed of category */
  LR_CF_CMD_CAT4_MAX_SPEED: 0x45,  /** Overwrite max object speed of category */

  /* Device Settings */
  LR_CF_CMD_LIC_KEY: 0x51,        /**  Licence Key RW */
  LR_CF_CMD_FU_LEVEL: 0x52,       /**  Feauture Level RO*/
  LR_CF_CMD_SPEED_CLASS: 0x53,    /**  Feauture Level RO*/
  LR_CF_CMD_MEAS_INTERVAL: 0x54,  /**  Meas Interval RW */

  /* Radar Settings */
  LR_CF_CMD_RADAR_ENABLED: 0x61,  /** Switch radar module on / off */
  LR_CF_CMD_RADAR_CHANNEL: 0x62,  /** Choose Radar Channel: 1, 2 */
  LR_CF_CMD_RADAR_SENS: 0x63,     /** Radar Sensitivity Level [%]*/
  LR_CF_CMD_RADAR_AUTOSENS: 0x64, /** Enable Autosens, 0 = off , 1 = on */

  /* LoRaWAN Settings */
  LR_CF_CMD_LORA_UL_CONFIRMED: 0x71,  /** Set confirmed uplinks mode*/


  LR_CF_CMD_CLEAR: 0xcc,       /** cf starts the configuration uplink sequence */
  LR_CF_CMD_CONFIG_SEQ: 0xcf,       /** cf starts the configuration uplink sequence */
  LR_CF_CMD_DEFAULTS: 0xdf,         /** df set factory defaults (use ee for saving to ROM) */
  LR_CF_CMD_RESTART: 0xee            /** ee Restart device with new settings */
};

function d2_decoder(bytes, port) {
  var obj = {};
  obj.typestr = DeviceTypes[bytes[1]];                                                // 00: TCR-LS, 01: TCR-LSS , ...
  obj.fu_level = FeatureLevel[bytes[2]];                                            // 00: BASIC, 01: ADVANCED , ...
  obj.speedclass = SpeedClassTypes[bytes[3]];                                      // 00: Speedclass, 01: LS , 02: HS
  obj.fw_version = (bytes[4] & 0xf0) / 0x10 + "." + (bytes[4] & 0x0f) + "." + bytes[5];  // Firmware Major Version
  obj.sbx_version = (bytes[6] & 0xf0) / 0x10 + "." + (bytes[6] & 0x0f) + "." + bytes[7];  // SBX Solar Charger Firmware Version     
  return obj;
}

function a2_decoder(bytes, port) {
  var obj = {};

  if (port == 13) // Unfiltered Detections
  {
    obj.ud_time = bytes[1] * 100 + bytes[2];          // Measure Interval End Timestamp (Military Time format)
    obj.ud_ltr_cnt = (bytes[3] << 8) | (bytes[4]);    // Left-to-Right (LTR) Counter Value (0-65535)
    obj.ud_ltr_spd = bytes[5];                        // Left-to-Right (LTR) average speed of all objects counted in this interval [km/h]
    obj.ud_rtl_cnt = (bytes[6] << 8) | (bytes[7]);    // Right-to-Left (RTL) Counter Value (0-65535)
    obj.ud_rtl_spd = bytes[8];                        // Right-to-Left (RTL) average speed of all objects counted in this interval  [km/h]     
  }

  if (port == 14) // Filter Category 1 
  {
    obj.cat1_time = bytes[1] * 100 + bytes[2];          // Measure Interval End Timestamp (Military Time format)
    obj.cat1_ltr_cnt = (bytes[3] << 8) | (bytes[4]);    // Left-to-Right (LTR) Counter Value (0-65535)
    obj.cat1_ltr_spd = bytes[5];                        // Left-to-Right (LTR) average speed of all objects counted in this interval [km/h]
    obj.cat1_rtl_cnt = (bytes[6] << 8) | (bytes[7]);    // Right-to-Left (RTL) Counter Value (0-65535)
    obj.cat1_rtl_spd = bytes[8];                        // Right-to-Left (RTL) average speed of all objects counted in this interval  [km/h]     
  }

  if (port == 15) // Filter Category 2 
  {
    obj.cat2_time = bytes[1] * 100 + bytes[2];          // Measure Interval End Timestamp (Military Time format)
    obj.cat2_ltr_cnt = (bytes[3] << 8) | (bytes[4]);    // Left-to-Right (LTR) Counter Value (0-65535)
    obj.cat2_ltr_spd = bytes[5];                        // Left-to-Right (LTR) average speed of all objects counted in this interval [km/h]
    obj.cat2_rtl_cnt = (bytes[6] << 8) | (bytes[7]);    // Right-to-Left (RTL) Counter Value (0-65535)
    obj.cat2_rtl_spd = bytes[8];                        // Right-to-Left (RTL) average speed of all objects counted in this interval  [km/h]     
  }

  if (port == 16) // Filter Category 3 
  {
    obj.cat3_time = bytes[1] * 100 + bytes[2];          // Measure Interval End Timestamp (Military Time format)
    obj.cat3_ltr_cnt = (bytes[3] << 8) | (bytes[4]);    // Left-to-Right (LTR) Counter Value (0-65535)
    obj.cat3_ltr_spd = bytes[5];                        // Left-to-Right (LTR) average speed of all objects counted in this interval [km/h]
    obj.cat3_rtl_cnt = (bytes[6] << 8) | (bytes[7]);    // Right-to-Left (RTL) Counter Value (0-65535)
    obj.cat3_rtl_spd = bytes[8];                        // Right-to-Left (RTL) average speed of all objects counted in this interval  [km/h]     
  }

  if (port == 17) // Filter Category 4 
  {
    obj.cat4_time = bytes[1] * 100 + bytes[2];          // Measure Interval End Timestamp (Military Time format)
    obj.cat4_ltr_cnt = (bytes[3] << 8) | (bytes[4]);    // Left-to-Right (LTR) Counter Value (0-65535)
    obj.cat4_ltr_spd = bytes[5];                        // Left-to-Right (LTR) average speed of all objects counted in this interval [km/h]
    obj.cat4_rtl_cnt = (bytes[6] << 8) | (bytes[7]);    // Right-to-Left (RTL) Counter Value (0-65535)
    obj.cat4_rtl_spd = bytes[8];                        // Right-to-Left (RTL) average speed of all objects counted in this interval  [km/h]     
  }

  obj.volts = bytes[9] / 10;                              // Power supply voltage. Divide by 10 to get volts.                             
  return obj;
}

function c2_decoder(bytes, port) {
  var obj = {};

  // 8 Bit values
  if (bytes.length == 3) {
    obj[ConfigKeys[bytes[1]]] = bytes[2];
  }

  // 16 Bit values
  if (bytes.length >= 4) {
    obj[ConfigKeys[bytes[1]]] = (bytes[2] << 8) | (bytes[3]);
  }
  return obj;
}

function bin16dec(bin) {
  var num = bin & 0xFFFF;
  if (0x8000 & num) num = -(0x010000 - num);
  return num;
}

function hexToBytes(hex) {
  hex = hex.replace(/\s/g, "");
  for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
}


function decodeUplink(input) {
  let result = {
    data: {},
    errors: [],
    warnings: []
  };
  var bytes = input.bytes;
  var port = input.fPort;

  // it's a Device ID Payload V2 (PMX Firmware for TCR)
  if (port == 190 && bytes[0] == 0xd2) {

    result.data = d2_decoder(bytes, port);
  }

  // it's a Counter Payload V2 (PMX Firmware for TCR)
  if (port >= 13 && port <= 17 && bytes[0] == 0xa2) {

    result.data = a2_decoder(bytes, port);
  }

  // it's a Config Payload Response (PMX Firmware for TCR)
  if (port == 1 && bytes[0] == 0xc2) {

    result.data = c2_decoder(bytes, port);
  }

  return result;
}