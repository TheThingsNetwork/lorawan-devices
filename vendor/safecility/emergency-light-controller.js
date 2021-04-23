/* 	   _____       ____          _ ___ __        ____  ___    __    ____
 *    / ___/____ _/ __/__  _____(_) (_) /___  __/ __ \/   |  / /   /  _/
 *    \__ \/ __ `/ /_/ _ \/ ___/ / / / __/ / / / / / / /| | / /    / /
 * 	 ___/ / /_/ / __/  __/ /__/ / / / /_/ /_/ / /_/ / ___ |/ /____/ /
 *	/____/\__,_/_/  \___/\___/_/_/_/\__/\__, /_____/_/  |_/_____/___/
 *                              	   /____/
 * 	Created by Tad McAllister (tad@theconvexlens.co) 20-11-2020
 * 	Copyright ©2020. The Convex Lens (theconvexlens.co)
 * 	All Rights Reserved.
 * 	UNPUBLISHED, LICENSED SOFTWARE
 * 	CONFIDENTIAL AND PROPRIETARY INFORMATION
 * 	WHICH IS THE PROPERTY OF The Convex Lens
 * */

// Decode bit pos - return as object member if set
function DecodeErrFlag(byte) {
  var errflag = {};
  
        if (byte & (1 << 0)) {
            errflag.dali_bus_err = true;
        } if (byte & (1 << 2))  {
            errflag.isr_task_fail = true;
        } if (byte & (1 << 3)) {
            errflag.rx_buf_full = true;
        } if (byte & (1 << 4)) {
            errflag.dali_task_fail = true;
        } if (byte & (1 << 5)) {
            errflag.dali_test_task_fail = true;
        } if (byte & (1 << 6)) {
            errflag.sensor_task_fail = true;
        } if (byte & (1 << 7)) {
            errflag.check_urc_task_fail = true;
        }
  
  return errflag;
}

function DecodeTamperFlag(byte) {
  var tamperflag = {};
  
        if (byte & (1 << 0)) {
            tamperflag.loc_changed = true;
        } if (byte & (1 << 1)) {
          tamperflag.ambient_light = true;
        } if (byte & (1 << 2))  {
            tamperflag.temp_sens_error_flag = true;
        } if (byte & (1 << 3)) {
            tamperflag.last_cyc_test = true;
        }
        
  return tamperflag;
}

function DecodeDaliStat(byte) {
    var dalistatus = {};
  
        if (byte & (1 << 0)) {
            dalistatus.ballast_failure =true;
        } if (byte & (1 << 1)) {
            dalistatus.lamp_failure = true;
        } if (byte & (1 << 2))  {
            dalistatus.lamp_arc_pw_on= true;
        } if (byte & (1 << 3)) {
            dalistatus.limit_error = true;
        } if (byte & (1 << 4)) {
            dalistatus.fade_running = true;
        } if (byte & (1 << 5)) {
            dalistatus.reset_state = true;
        } if (byte & (1 << 6)) {
            dalistatus.short_address_not_set = true;
        } if (byte & (1 << 7)) {
            dalistatus.power_failure= true;
        }
  
  return dalistatus;
}

function DecodeDaliEmStat(byte) {
      var dali_em_status = {};
  
        if (byte & (1 << 0)) {
            dali_em_status.inhibit_mode =true;
        } if (byte & (1 << 1)) {
            dali_em_status.fn_test_done_res_valid = true;
        } if (byte & (1 << 2))  {
            dali_em_status.dur_test_done_res_valid= true;
        } if (byte & (1 << 3)) {
            dali_em_status.battery_fully_chg = true;
        } if (byte & (1 << 4)) {
            dali_em_status.fn_test_req_pending = true;
        } if (byte & (1 << 5)) {
            dali_em_status.dur_test_req_pending = true;
        } if (byte & (1 << 6)) {
            dali_em_status.identification_active = true;
        } if (byte & (1 << 7)) {
            dali_em_status.phys_selected= true;
        }
  
  return dali_em_status;
}

function DecodeDaliTestFlag(byte) {
  var test_flag = {};
  
        if (byte & (1 << 0)) {
            test_flag.fn_test_in_progress =true;
        } if (byte & (1 << 1)) {
            test_flag.fn_test_passed = true;
        } if (byte & (1 << 2))  {
            test_flag.fn_test_failed = true;
        } if (byte & (1 << 3)) {
            test_flag.dur_test_in_progress = true;
        } if (byte & (1 << 4)) {
            test_flag.dur_test_passed = true;
        } if (byte & (1 << 5)) {
            test_flag.dur_test_failed = true;
        } if (byte & (1 << 6)) {
            test_flag.wait_while_test_pend = true;
        } if (byte & (1 << 7)) {
            test_flag.dali_status_changed = true;
        }
  
  return test_flag;
}

// Decode byte array from network server
function uplinkDecoder(bytes, port) {
  
  var SCHEMA_B = 0;
  var REPLYC_B = 1;
  
  var REPLY_NORMAL = 0;
  var REPLY_FUNCTION = 1;
  var REPLY_DURATION = 2;
  var REPLY_WWTP = 3;
  var REPLY_FUNCTION_DONE = 4;
  var REPLY_DURATION_DONE = 5;
  var REPLY_TAMPER = 6;
  var REPLY_DALI_STATUS = 7;
  
  // Data objects
  var decoded = {};
  var err_flag = {};
  var tamper_flag = {};
  var dali_status = {};
  var dali_em_status = {};
  var test_flag = {};

  // If message has expected format
  if ( (port === 1) && (bytes[SCHEMA_B] === 0) && (bytes.length === 15) ) {
    
    switch(bytes[REPLYC_B]) {
      case REPLY_NORMAL:
        decoded.reply_cause = "reply normal";
        break;
      case REPLY_FUNCTION:
        decoded.reply_cause = "reply function";
        break;
      case REPLY_DURATION:
        decoded.reply_cause = "reply duration";
        break;
      case REPLY_WWTP:
        decoded.reply_cause = "wait while test pending";
        break;
      case REPLY_FUNCTION_DONE:
        decoded.reply_cause = "function test done";
        break;
      case REPLY_DURATION_DONE:
        decoded.reply_cause = "duration test done";
        break;
      case REPLY_TAMPER:
        decoded.reply_cause = "tamper alert";
        break;
    }
    
    // Decode bitwise data
    dali_status = DecodeDaliStat(bytes[2]);
    dali_em_status = DecodeDaliEmStat(bytes[3])
    test_flag = DecodeDaliTestFlag(bytes[8]);
    err_flag = DecodeErrFlag(bytes[9]);
    tamper_flag = DecodeTamperFlag(bytes[10]);
    
    // Nest objects in decoded if not empty
    if (Object.keys(err_flag).length != 0) {
      decoded.err_flag = err_flag;
    }
    if (Object.keys(dali_status).length != 0) {
      decoded.dali_status = dali_status;
    }
    if (Object.keys(dali_em_status).length != 0) {
      decoded.dali_em_status = dali_em_status;
    }
    if (Object.keys(test_flag).length != 0)  {
      decoded.test_flag = test_flag;
    }
    if (Object.keys(tamper_flag).length != 0) {
      decoded.tamper_flag = tamper_flag;
    }

    // Only 1 type of message payload
    decoded.temp_celsius = ((bytes[11] << 8)
          + bytes[12]);
    decoded.lux = ((bytes[13] << 8)
          + bytes[14]);
          
    decoded.batt_charge = (bytes[4]);
  }
  else {
    decoded.error = "unexpected payload";
  }
  return decoded;
}
