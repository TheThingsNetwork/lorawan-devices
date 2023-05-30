/* *************************************** */
/*              FRAME HEADER               */
/* *************************************** */
const ACW_FRAME_HEADER_MEAS_MASK = 0x20;
const ACW_FRAME_HEADER_TYPE_MASK = 0x0F;
const ACW_FRAME_HEADER_TIMESTAMP_MASK  = 0x40;

/****           Frame type              ****/
const ACW_FRAME_HEADER_TYPE_KEEP_ALIVE   = 0x01;
const ACW_FRAME_HEADER_TYPE_NETWORK_TEST = 0x02;
const ACW_FRAME_HEADER_TYPE_TEST_FRAME   = 0x05;
const ACW_FRAME_HEADER_TYPE_THOLD_ALERT  = 0x0D;
const ACW_FRAME_HEADER_TYPE_ERROR        = 0x0E;
const ACW_FRAME_HEADER_TYPE_SPECIFIC     = 0x0F;


/* *************************************** */
/*              MEASURE FRAME              */
/* *************************************** */
const ACW_FRAME_HEADER_MEAS_HISTORIC_POS = 3;
const ACW_FRAME_HEADER_MEAS_HISTORIC_MASK = 0x18;
const ACW_FRAME_HEADER_MEAS_SAMPLES_MASK = 0x07;

const ACW_FRAME_MEAS_MEAS_TYPE_MASK = 0x0F;
const ACW_FRAME_MEAS_CHANNEL_NUM_POS = 4;
const ACW_FRAME_MEAS_CHANNEL_NUM_MASK = 0x30;


/* *************************************** */
/*              ALERT HEADER               */
/* *************************************** */
const ACW_FRAME_ALERT_MEAS_TYPE_POS   = 0;
const ACW_FRAME_ALERT_MEAS_TYPE_MASK  = 0x0F;
const ACW_FRAME_ALERT_CHANNEL_NUM_POS = 4;
const ACW_FRAME_ALERT_ALERT_TYPE_POS  = 6;


/* *************************************** */
/*              ERROR HEADER               */
/* *************************************** */
const ACW_FRAME_ERR_ID_MSG_POS      = 4;
const ACW_FRAME_ERR_MSG_LENGTH_MASK = 0x0F;


/* *************************************** */
/*              Measure Type               */
/* *************************************** */
const UP_FRAME_WAY_TYPE_UINT8_INPUT       = 0x01;
const UP_FRAME_WAY_TYPE_UINT16_INPUT      = 0x02;
const UP_FRAME_WAY_TYPE_UINT16_COUNTER    = 0x03;
const UP_FRAME_WAY_TYPE_UINT32_COUNTER    = 0x04;
const UP_FRAME_WAY_TYPE_UINTx_BRIGHTNESS  = 0x05;
const UP_FRAME_WAY_TYPE_INTx_PRESSURE     = 0x06;
const UP_FRAME_WAY_TYPE_INT16_DISTANCE    = 0x07;
const UP_FRAME_WAY_TYPE_INT16_TEMPERATURE = 0x08;
const UP_FRAME_WAY_TYPE_UINT16_HUMIDITY   = 0x09;
const UP_FRAME_WAY_TYPE_INT16_VOLTAGE     = 0x0a;
const UP_FRAME_WAY_TYPE_INT16_CURRENT     = 0x0b;
const UP_FRAME_WAY_TYPE_UINT16_VOC_INDEX  = 0x0c;
const UP_FRAME_WAY_TYPE_UINT16_CO2        = 0x0d;


const ACW_FRAME_HEADER_SIZE_ASCII    = 2; /* size of the header in ASCII character */
const ACW_FRAME_TIMESTAMP_SIZE_ASCII = 8; /* size of the timestamp in ASCII character */
const ACW_FRAME_TX_PERIOD_SIZE_ASCII = 4; /* size of the tx period of periodic frame (when historic or nb samples > 1) in ASCII character */


/* *************************************** */
/*               Error code                */
/* *************************************** */

/* real error codes which cause the product to enter fault mode */
const ACW_ERR_UNKNOWN                       = 0x81;
const ACW_ERR_BUF_SMALLER                   = 0x82;
const ACW_ERR_DEPTH_HISTORIC_OUT_OF_RANGE   = 0x83;
const ACW_ERR_NB_SAMPLE_OUT_OF_RANGE        = 0x84;
const ACW_ERR_NWAY_OUT_OF_RANGE             = 0x85;
const ACW_ERR_TYPEWAY_OUT_OF_RANGE          = 0x86;
const ACW_ERR_SAMPLING_PERIOD               = 0x87;
const ACW_ERR_SUBTASK_END                   = 0x88;
const ACW_ERR_NULL_POINTER                  = 0x89;
const ACW_ERR_BATTERY_LEVEL_DEAD            = 0x8A;
const ACW_ERR_EEPROM                        = 0x8B;
const ACW_ERR_ROM                           = 0x8C;
const ACW_ERR_RAM                           = 0x8D;
const ACW_ERR_ARM_INIT_FAIL                 = 0x8E;
const ACW_ERR_ARM_BUSY                      = 0x8F;
const ACW_ERR_ARM_BRIDGE_ENABLE             = 0x90;
const ACW_ERR_ARM_RADIO_QUEUE_FULL          = 0x91;
const ACW_ERR_CFG_BOX_INIT_FAIL             = 0x92;

/*
 * From here error code are considered as alert
 * the product do not enter fault mode
 * if one of the following code occurs
 */
const ACW_ERR_KEEP_ALIVE_PERIOD             = 0x93;
const ACW_ERR_ENTER_DEEP_SLEEP              = 0x94;
const ACW_ERR_BATTERY_LEVEL_LOW             = 0x95;
const ACW_ERR_ARM_TRANSMISSION              = 0x96;
const ACW_ERR_ARM_PAYLOAD_BIGGER            = 0x97;
const ACW_ERR_RADIO_PAIRING_TIMEOUT         = 0x98;
const ACW_ERR_SENSORS_TIMEOUT               = 0x99;
const ACW_ERR_SENSORS_STOP                  = 0x9A;
const ACW_ERR_SENSORS_FAIL                  = 0x9B;
const ACW_ERR_BOX_OPENED                    = 0x9C;
const ACW_ERR_BOX_CLOSED                    = 0x9D;
const ACW_ERR_SENSORS_MOVE                  = 0x9E;

/* *************************************** */
/*           MR4 specific code             */
/* *************************************** */
const ACW_MR4_WIRECUT                       = 0x1C;

/* *************************************** */


function decodeUplink(input) {
  let result = {historics: [],events: [],realTimes: []};

  var date = Date.now();
  date = new Date(date);
  var time = convertTimestamp(date);
  
  var payload_tab = input.bytes;
  var payload = "";
  for (let i = 0; i < payload_tab.length; i++) {
    if(payload_tab[i] > 15){
        payload = payload + payload_tab[i].toString(16);
    }else{
        payload = payload + '0' + payload_tab[i].toString(16);
    }
  } 
  var header = parseInt(payload.substring(0, 2),16);
  
      /* is it a measurement or generic frame ? */
    if((header & ACW_FRAME_HEADER_MEAS_MASK) == ACW_FRAME_HEADER_MEAS_MASK){
        /** In case of measurement frame **/
        result.realTimes = result.realTimes.concat(DecodeMesureFrame(payload, time).realTimes);
        result.historics = result.historics.concat(DecodeMesureFrame(payload, time).historics);
        result.events = result.events.concat(DecodeMesureFrame(payload, time).events);
    }else{
        /** In case of generic frame **/
        result.realTimes = result.realTimes.concat(DecodeCommonFrame(payload, time).realTimes);
        result.historics = result.historics.concat(DecodeCommonFrame(payload, time).historics);
        result.events = result.events.concat(DecodeCommonFrame(payload, time).events);
    }

    if (((header & ACW_FRAME_HEADER_TYPE_MASK) == ACW_FRAME_HEADER_TYPE_KEEP_ALIVE) &&
        ((header & ACW_FRAME_HEADER_MEAS_MASK) != ACW_FRAME_HEADER_MEAS_MASK))
    {
        var data_offset = ACW_FRAME_HEADER_SIZE_ASCII;
        if((header & ACW_FRAME_HEADER_TIMESTAMP_MASK) == ACW_FRAME_HEADER_TIMESTAMP_MASK)
        {
            data_offset += ACW_FRAME_TIMESTAMP_SIZE_ASCII;
        }
        result.realTimes.push({tagRef: "p_batteryVoltage_empty",timestamp: time,tagValue: String(parseInt(payload.substr(data_offset,4),16)/1000)});
        result.realTimes.push({tagRef: "p_batteryVoltage_inCharge",timestamp: time,tagValue: String(parseInt(payload.substr(data_offset+4,4),16)/1000)});
    }
  var warnings = [];
  if(result.realTimes.length === 0){
    warnings = ["La trame n'est pas décoder"];
  }
  return {
    data: result,
    warnings: warnings,
    errors: []
  };
}

function convertTimestamp(frameTimestamp) {

	var date 	  = new Date(frameTimestamp);
	var year 	  = date.getFullYear();
 	var month   = date.getMonth() + 1;
	if(month<10){
		month = "0" + month;
	}
	var day 	  = date.getDate();
	if(day<10){
		day = "0" + day;
	}
	var hours   = date.getHours()+2;
	var minutes = "0" + date.getMinutes();
	var seconds = "0" + date.getSeconds();

	date = day + "/" + month + "/" + year + " " + hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2);
  return date;
}

function DecodeCommonFrame(payload, time)
{
	// Init result
	let result = {
		historics: [],
		events: [],
		realTimes: []
	};

	// get timestamp bit value
	let timestamp = parseInt(payload.substring(0, 2),16);
	timestamp &= ACW_FRAME_HEADER_TIMESTAMP_MASK;

	/* By default, data starts after header */
	let startingIndex = ACW_FRAME_HEADER_SIZE_ASCII;

	if(timestamp)
	    /* if timestamp included, data starts after header + timstamp */
	    startingIndex += ACW_FRAME_TIMESTAMP_SIZE_ASCII;

	// get frame type
	let frameType = parseInt(payload.substring(0, 2),16);
	frameType &= ACW_FRAME_HEADER_TYPE_MASK;

	// keep alive frame
	if(frameType == ACW_FRAME_HEADER_TYPE_KEEP_ALIVE)
	{
		result.realTimes.push({
			tagRef: "p_keepAlive",
			timestamp: time,
			tagValue: String(1)
		});
	}

    // test frame
	if (frameType == ACW_FRAME_HEADER_TYPE_TEST_FRAME)
	{
		while(startingIndex<payload.length)
		{
			// get header informations of each voie
			let header_voie = parseInt(payload.substring(startingIndex, startingIndex+2),16);

			/* get channel number */
			let number_voie = header_voie >> ACW_FRAME_MEAS_CHANNEL_NUM_POS;

            /* get measure type */
			let mesureType_voie = header_voie & ACW_FRAME_MEAS_MEAS_TYPE_MASK;

            /* get measure size */
			let mesureSize_voie = getMesureSize(mesureType_voie);

			// increase starting index
			startingIndex += 2;

			// check if the size is different than 0
			if(mesureSize_voie != 0)
			{
				// get mesure
				let mesure = parseInt(payload.substring(startingIndex, startingIndex+mesureSize_voie),16);

				// get calculated table of log
				let calculatedMesureTab = getCalculatedMesure(mesure, mesureType_voie, number_voie, timestamp ? convertTimestamp(new Date(parseInt(payload.substring(2, 10),16)*1000)) : time);

				// add table log into realtimes
				result.realTimes = result.realTimes.concat(calculatedMesureTab);

				// increase index
				startingIndex += mesureSize_voie;

			}else{
				return result;
			}
		}
	}

	// threshold alarm
	if (frameType == ACW_FRAME_HEADER_TYPE_THOLD_ALERT)
	{
		while(startingIndex<payload.length)
		{
			// get header informations of each voie
			let header_voie = parseInt(payload.substring(startingIndex, startingIndex+2),16);
			/* get alert type */
			let alertType_voie = header_voie >> ACW_FRAME_ALERT_ALERT_TYPE_POS;
			/* get channel number */
			let number_voie = header_voie >> ACW_FRAME_ALERT_CHANNEL_NUM_POS;
			/* get measure type */
			let mesureType_voie = header_voie & ACW_FRAME_ALERT_MEAS_TYPE_MASK;
			/* get measure size */
			let mesureSize_voie = getMesureSize(mesureType_voie);

			// increase starting index
			startingIndex += 2;

			// check if the size is different than 0
			if(mesureSize_voie != 0)
			{
				// get mesure
				let mesure = parseInt(payload.substring(startingIndex, startingIndex+mesureSize_voie),16);

				// get calculated table of log
				let calculatedMesureTab = getCalculatedMesure(mesure, mesureType_voie, number_voie, timestamp ? convertTimestamp(new Date(parseInt(payload.substring(2, 10),16)*1000)) : time);

				// add table log into realtimes
				result.realTimes = result.realTimes.concat(calculatedMesureTab);

				// get calculated table of events
				let eventTab = getThresholdEvents(mesureType_voie, alertType_voie, number_voie, timestamp ? convertTimestamp(new Date(parseInt(payload.substring(2, 10),16)*1000)) : time);

				// add table event into events
				result.events = result.events.concat(eventTab);

				// increase index
				startingIndex += mesureSize_voie;

			}else{
				return result;
			}
		}
	}

	// general alarm
	if(frameType == ACW_FRAME_HEADER_TYPE_ERROR)
	{
		// get header informations of each voie
		let header_error = parseInt(payload.substring(startingIndex, startingIndex+2),16);
		let length_error = header_error & ACW_FRAME_ERR_MSG_LENGTH_MASK;

		// increase starting index
		startingIndex += 2;

		for (let e=0; e<length_error; e++)
		{
			// get error and add log into events table
			result.events.push(getError(parseInt(payload.substring(startingIndex, startingIndex+2),16),timestamp ? convertTimestamp(new Date(parseInt(payload.substring(2, 10),16)*1000)) : time));
			
		    // ack error and add log into events table
			result.events.push(ackError(parseInt(payload.substring(startingIndex, startingIndex+2),16),timestamp ? convertTimestamp(new Date(parseInt(payload.substring(2, 10),16)*1000)) : time));

			// increase starting index
			startingIndex += 2;
		}
	}

	if(frameType == ACW_FRAME_HEADER_TYPE_SPECIFIC)
	{
	    /* Specific to the MR4 */
		if(parseInt(payload.substring(startingIndex, startingIndex+2),16)==28)
        {
            // add wirecut into realtimes table
            result.realTimes.push({tagRef: "p_wirecut",timestamp: time,tagValue: String(parseInt(payload.substring(startingIndex+2, startingIndex+4),16)==1 ? 0 : 1)});
        }

	}
	return result;
}

function DecodeMesureFrame(payload, time)
{
	// Init result
	let result = {
		historics: [],
		events: [],
		realTimes: []
	};

	// get timestamp bit value
	let timestamp = parseInt(payload.substring(0, 2),16);
	timestamp &= ACW_FRAME_HEADER_TIMESTAMP_MASK;

	let historic = parseInt(payload.substring(0, 2),16);
	historic = (historic & ACW_FRAME_HEADER_MEAS_HISTORIC_MASK) >> ACW_FRAME_HEADER_MEAS_HISTORIC_POS;
	historic++;

	let nb_samples = parseInt(payload.substring(0, 2),16);
	nb_samples &= ACW_FRAME_HEADER_MEAS_SAMPLES_MASK;
	nb_samples++;

	/* By default, data starts after header */
	let startingIndex = ACW_FRAME_HEADER_SIZE_ASCII;

	if(timestamp)
	    /* if timestamp included, data starts after header + timstamp */
	    startingIndex += ACW_FRAME_TIMESTAMP_SIZE_ASCII;

	let period = 0;

	if(historic > 1 || nb_samples > 1)
	{
	    period = parseInt(payload.substring(startingIndex, startingIndex + ACW_FRAME_TX_PERIOD_SIZE_ASCII),16);

	    startingIndex += ACW_FRAME_TX_PERIOD_SIZE_ASCII;
	}

	while(startingIndex<payload.length)
	{
		// get header informations of each voie
		let header_voie = parseInt(payload.substring(startingIndex, startingIndex+2),16);
		/* get channel number */
		let number_voie = (header_voie & ACW_FRAME_MEAS_CHANNEL_NUM_MASK) >> ACW_FRAME_ALERT_CHANNEL_NUM_POS;
		/* get measure type */
		let mesureType_voie = header_voie & ACW_FRAME_MEAS_MEAS_TYPE_MASK;
		/* get measure size */
		let mesureSize_voie = getMesureSize(mesureType_voie);

		// increase starting index
		startingIndex += 2;

		// check if the size is different than 0
		if(mesureSize_voie != 0)
		{
			// iterate on each mesure
			for(let i=0; i<historic*nb_samples;i++)
			{
				// get mesure
				let mesure = parseInt(payload.substring(startingIndex, startingIndex+mesureSize_voie),16);

				if(i==0){
					// get calculated table of log
					let calculatedMesureTab = getCalculatedMesure(mesure,mesureType_voie,number_voie,timestamp ? convertTimestamp(new Date(parseInt(payload.substring(2, 10),16)*1000)) : time);

					// add table log into realtimes
					result.realTimes = result.realTimes.concat(calculatedMesureTab);
				}else{
					// get calculated table of log
					let calculatedMesureTab = getCalculatedMesure(mesure,mesureType_voie,number_voie,timestamp ? convertTimestamp(new Date((parseInt(payload.substring(2, 10),16)-(period/nb_samples*60*i))*1000)) : convertTimestamp(new Date((time-(period/nb_samples*60*i))*1000)));

					// add table log into historics
					result.historics = result.historics.concat(calculatedMesureTab);
				}

				// increase index
				startingIndex += mesureSize_voie;
			}
		}else{
			return result;
		}
	}

	return result;
}

function getMesureSize(mesureType)
{
	switch (mesureType)
	{
		case UP_FRAME_WAY_TYPE_UINT8_INPUT:
			return 2;
		break;

		case UP_FRAME_WAY_TYPE_UINT16_INPUT:
		    return 4;
		break;

		case UP_FRAME_WAY_TYPE_UINT16_COUNTER:
		    return 4;
		break;

		case UP_FRAME_WAY_TYPE_UINT32_COUNTER:
			return 8;
		break;

		case UP_FRAME_WAY_TYPE_UINTx_BRIGHTNESS:
		    return 0;
		break;

		case UP_FRAME_WAY_TYPE_INTx_PRESSURE:
		    return 0;
		break;

		case UP_FRAME_WAY_TYPE_INT16_DISTANCE:
		    return 4;
		break;

		case UP_FRAME_WAY_TYPE_INT16_TEMPERATURE:
		    return 4;
		break;

		case UP_FRAME_WAY_TYPE_UINT16_HUMIDITY:
		    return 4;
		break;

		case UP_FRAME_WAY_TYPE_INT16_VOLTAGE:
		    return 4;
		break;

		case UP_FRAME_WAY_TYPE_INT16_CURRENT:
			return 4;
		break;

		case UP_FRAME_WAY_TYPE_UINT16_VOC_INDEX:
		    return 4;
		break;

        case UP_FRAME_WAY_TYPE_UINT16_CO2:
            return 4;
        break;

		default:
			return 0;
	}
}

function getCalculatedMesure(mesure,mesureType,number_voie,date)
{
	switch (mesureType)
	{
		case UP_FRAME_WAY_TYPE_UINT8_INPUT:
		case UP_FRAME_WAY_TYPE_UINT16_INPUT:
			var tab = [];
			var mesureString = ('0000000' + mesure.toString(2)).slice(-8);
			for (let i=1; i<mesureString.length+1;i++)
			{
				tab.push({
					tagRef: "p_DI"+ i + '_' +number_voie,
					timestamp: date,
					tagValue: String(mesureString[mesureString.length-i])
				});
			}
			return tab;
		break;

		case UP_FRAME_WAY_TYPE_UINT16_COUNTER:
		case UP_FRAME_WAY_TYPE_UINT32_COUNTER:
			return [{
				tagRef: "p_count" + '_' +number_voie,
				timestamp: date,
				tagValue: String(mesure)
			}]
		break;

		case UP_FRAME_WAY_TYPE_INT16_DISTANCE:
			if((mesure>>15)==1){
				return [{
						tagRef: "p_mm" + '_' +number_voie,
						timestamp: date,
						tagValue: String(((mesure^65535)+1)*-1)
				}];
			}else{
				return [{
						tagRef: "p_mm" + '_' +number_voie,
						timestamp: date,
						tagValue: String(mesure)
				}];
			}
		break;

		case UP_FRAME_WAY_TYPE_INT16_TEMPERATURE:
			if((mesure>>15)==1){
				return [{
						tagRef: "p_temperature" + '_' +number_voie,
						timestamp: date,
						tagValue: String(((mesure^65535)+1)/100*-1)
				}];
			}else{
				return [{
						tagRef: "p_temperature" + '_' +number_voie,
						timestamp: date,
						tagValue: String(mesure/100)
				}];
			}
		break;

		case UP_FRAME_WAY_TYPE_UINT16_HUMIDITY:
			if((mesure>>15)==1){
				return [{
						tagRef: "p_humidity" + '_' +number_voie,
						timestamp: date,
						tagValue: String(((mesure^65535)+1)/100*-1)
				}];
			}else{
				return [{
						tagRef: "p_humidity" + '_' +number_voie,
						timestamp: date,
						tagValue: String(mesure/100)
				}];
			}
		break;

		case UP_FRAME_WAY_TYPE_INT16_VOLTAGE:
			if((mesure>>15)==1){
				return [{
						tagRef: "p_mV" + '_' +number_voie,
						timestamp: date,
						tagValue: String(((mesure^65535)+1)*-1)
				}];
			}else{
				return [{
						tagRef: "p_mV" + '_' +number_voie,
						timestamp: date,
						tagValue: String(mesure)
				}];
			}
		break;

		case UP_FRAME_WAY_TYPE_INT16_CURRENT:
			if((mesure>>15)==1){
				return [{
						tagRef: "p_uA" + '_' +number_voie,
						timestamp: date,
						tagValue: String(((mesure^65535)+1)*-1)
				}];
			}else{
				return [{
						tagRef: "p_uA" + '_' +number_voie,
						timestamp: date,
						tagValue: String(mesure)
				}];
			}
		break;

		case UP_FRAME_WAY_TYPE_UINT16_VOC_INDEX:
		    return[{
		        tagRef: "p_VOC_index" + '_' + number_voie,
		        timestamp: date,
		        tagValue: String(mesure)
		    }];
		break;

        case UP_FRAME_WAY_TYPE_UINT16_CO2:
            return[{
                tagRef: "p_CO2" + '_' + number_voie,
                timestamp: date,
                tagValue: String(mesure)
            }];
        break;

		default:
			return [];
	}
}

function getThresholdEvents(mesureType,alertType,number_voie,date)
{

	switch (mesureType)
	{
		case UP_FRAME_WAY_TYPE_UINT16_COUNTER:
		case UP_FRAME_WAY_TYPE_UINT32_COUNTER:
			return [{
				tagRef: "p_count" + '_' +number_voie + '_high_alm',
				timestamp: (date),
				tagValue: String(alertType==0 ? 0 : alertType==1 ? 1 : 0),
				context:[]
			},{
				tagRef: "p_count" + '_' +number_voie + '_low_alm',
				timestamp: (date),
				tagValue: String(alertType==0 ? 0 : alertType==2 ? 1 : 0),
				context:[]
			}]
		break;

		case UP_FRAME_WAY_TYPE_INT16_DISTANCE:
			return [{
				tagRef: "p_mm" + '_' +number_voie + '_high_alm',
				timestamp: (date),
				tagValue: String(alertType==0 ? 0 : alertType==1 ? 1 : 0),
				context:[]
			},{
				tagRef: "p_mm" + '_' +number_voie + '_low_alm',
				timestamp: (date),
				tagValue: String(alertType==0 ? 0 : alertType==2 ? 1 : 0),
				context:[]
			}];
		break;

		case UP_FRAME_WAY_TYPE_INT16_TEMPERATURE:
			return [{
				tagRef: "p_temperature" + '_' +number_voie + '_high_alm',
				timestamp: (date),
				tagValue: String(alertType==0 ? 0 : alertType==1 ? 1 : 0),
				context:[]
			},{
				tagRef: "p_temperature" + '_' +number_voie + '_low_alm',
				timestamp: (date),
				tagValue: String(alertType==0 ? 0 : alertType==2 ? 1 : 0),
				context:[]
			}];
		break;

		case UP_FRAME_WAY_TYPE_UINT16_HUMIDITY:
			return [{
				tagRef: "p_humidity" + '_' +number_voie + '_high_alm',
				timestamp: (date),
				tagValue: String(alertType==0 ? 0 : alertType==1 ? 1 : 0),
				context:[]
			},{
				tagRef: "p_humidity" + '_' +number_voie + '_low_alm',
				timestamp: (date),
				tagValue: String(alertType==0 ? 0 : alertType==2 ? 1 : 0),
				context:[]
			}];
		break;

		case UP_FRAME_WAY_TYPE_INT16_VOLTAGE:
			return [{
				tagRef: "p_mV" + '_' +number_voie + '_high_alm',
				timestamp: (date),
				tagValue: String(alertType==0 ? 0 : alertType==1 ? 1 : 0),
				context:[]
			},{
				tagRef: "p_mV" + '_' +number_voie + '_low_alm',
				timestamp: date,
				tagValue: String(alertType==0 ? 0 : alertType==2 ? 1 : 0),
				context:[]
			}];
		break;

		case UP_FRAME_WAY_TYPE_INT16_CURRENT:
			return [{
				tagRef: "p_uA" + '_' +number_voie + '_high_alm',
				timestamp: (date),
				tagValue: String(alertType==0 ? 0 : alertType==1 ? 1 : 0),
				context:[]
			},{
				tagRef: "p_uA" + '_' +number_voie + '_low_alm',
				timestamp: (date),
				tagValue: String(alertType==0 ? 0 : alertType==2 ? 1 : 0),
				context:[]
			}];
		break;

		case UP_FRAME_WAY_TYPE_UINT16_VOC_INDEX:
			return [{
				tagRef: "p_VOC_index" + '_' +number_voie + '_high_alm',
				timestamp: (date),
				tagValue: String(alertType==0 ? 0 : alertType==1 ? 1 : 0),
				context:[]
			},{
				tagRef: "p_VOC_index" + '_' +number_voie + '_low_alm',
				timestamp: (date),
				tagValue: String(alertType==0 ? 0 : alertType==2 ? 1 : 0),
				context:[]
			}];
		break;

        case UP_FRAME_WAY_TYPE_UINT16_CO2:
            return [{
                tagRef: "p_CO2" + '_' +number_voie + '_high_alm',
                timestamp: (date),
                tagValue: String(alertType==0 ? 0 : alertType==1 ? 1 : 0),
                context:[]
            },{
                tagRef: "p_CO2" + '_' +number_voie + '_low_alm',
                timestamp: (date),
                tagValue: String(alertType==0 ? 0 : alertType==2 ? 1 : 0),
                context:[]
            }];
        break;

		default:
			return [];
	}
}

function getError(error_code, date)
{
	let ref;
	let value;
	
	switch (error_code)
	{
		case ACW_ERR_BUF_SMALLER :
			ref = 'p_ERR_BUF_SMALLER';
		break;
		
		case ACW_ERR_DEPTH_HISTORIC_OUT_OF_RANGE :
			ref = 'p_ERR_DEPTH_HISTORIC_OUT_OF_RANGE';
		break;
		
		case ACW_ERR_NB_SAMPLE_OUT_OF_RANGE :
			ref = 'p_ERR_NB_SAMPLE_OUT_OF_RANGE';
		break;
		
		case ACW_ERR_NWAY_OUT_OF_RANGE :
			ref = 'p_ERR_NWAY_OUT_OF_RANGE';
		break;
		
		case ACW_ERR_TYPEWAY_OUT_OF_RANGE :
			ref = 'p_ERR_TYPEWAY_OUT_OF_RANGE';
		break;
		
		case ACW_ERR_SAMPLING_PERIOD :
			ref = 'p_ERR_SAMPLING_PERIOD';
		break;
		
	    case ACW_ERR_SUBTASK_END :
			ref = 'p_ERR_SUBTASK_END';
		break;
		
		case ACW_ERR_NULL_POINTER :
			ref = 'p_ERR_NULL_POINTER';
		break;

		case ACW_ERR_BATTERY_LEVEL_DEAD :
			ref = 'p_ERR_BATTERY_LEVEL_DEAD';
		break;

		case ACW_ERR_EEPROM :
			ref = 'p_ERR_EEPROM';
		break;

		case ACW_ERR_ROM:
			ref = 'p_ERR_ROM';
		break;
		
		case ACW_ERR_RAM :
			ref = 'p_ERR_RAM';
		break;
		
		case ACW_ERR_ARM_INIT_FAIL :
			ref = 'p_ERR_ARM_INIT_FAIL';
		break;
		
		case ACW_ERR_ARM_BUSY :
			ref = 'p_ERR_ARM_BUSY';
		break;
		
		case ACW_ERR_ARM_BRIDGE_ENABLE :
			ref = 'p_ERR_ARM_BRIDGE_ENABLE';
		break;
		
	    case ACW_ERR_ARM_RADIO_QUEUE_FULL :
			ref = 'p_ERR_RADIO_QUEUE_FULL';
		break;
		
		case ACW_ERR_CFG_BOX_INIT_FAIL :
			ref = 'p_ERR_CFG_BOX_INIT_FAIL';
		break;
		
/* ******************************************* */
/*                    ALERT                    */
/* ******************************************* */
		
		case ACW_ERR_KEEP_ALIVE_PERIOD :
			ref = 'p_ERR_KEEP_ALIVE_PERIOD';
		break;

		case ACW_ERR_BATTERY_LEVEL_LOW :
			ref = 'p_ERR_BATTERY_LEVEL_LOW';
		break;

        case ACW_ERR_ENTER_DEEP_SLEEP :
            ref = 'p_ERR_ENTER_DEEP_SLEEP';
        break;
		
		case ACW_ERR_ARM_TRANSMISSION :
			ref = 'p_ERR_ARM_TRANSMISSION';
		break;
		
		case ACW_ERR_ARM_PAYLOAD_BIGGER :
			ref = 'p_ERR_ARM_PAYLOAD_BIGGER';
		break;
		
		case ACW_ERR_RADIO_PAIRING_TIMEOUT :
			ref = 'p_ERR_RADIO_PAIRING_TIMEOUT';
		break;
		
		case ACW_ERR_SENSORS_TIMEOUT :
			ref = 'p_ERR_SENSORS_TIMEOUT';
		break;
		
		case ACW_ERR_SENSORS_STOP :
			ref = 'p_ERR_SENSOR_STOP';
		break;
		
		case ACW_ERR_SENSORS_FAIL :
			ref = 'p_ERR_SENSORS_FAIL';
		break;
		
		case ACW_ERR_BOX_OPENED :
			ref = 'p_ERR_BOX_OPENED';
		break;
		
		case ACW_ERR_BOX_CLOSED :
		    ref = 'p_ERR_BOX_CLOSED';
		break;
		
		case ACW_ERR_SENSORS_MOVE :
		    ref = 'p_ERR_SENSORS_MOVE';
		break;
		
		default : 
			return undefined;
	}
	return {
		tagRef: ref,
		timestamp: (date),
		tagValue: String(1),
		context:[]
	}
}
function ackError(error_code, date)
{
	let ref;
	let value;
	
	switch (error_code)
	{
		case ACW_ERR_BUF_SMALLER :
			ref = 'p_ERR_BUF_SMALLER';
		break;
		
		case ACW_ERR_DEPTH_HISTORIC_OUT_OF_RANGE :
			ref = 'p_ERR_DEPTH_HISTORIC_OUT_OF_RANGE';
		break;
		
		case ACW_ERR_NB_SAMPLE_OUT_OF_RANGE :
			ref = 'p_ERR_NB_SAMPLE_OUT_OF_RANGE';
		break;
		
		case ACW_ERR_NWAY_OUT_OF_RANGE :
			ref = 'p_ERR_NWAY_OUT_OF_RANGE';
		break;
		
		case ACW_ERR_TYPEWAY_OUT_OF_RANGE :
			ref = 'p_ERR_TYPEWAY_OUT_OF_RANGE';
		break;
		
		case ACW_ERR_SAMPLING_PERIOD :
			ref = 'p_ERR_SAMPLING_PERIOD';
		break;
		
	    case ACW_ERR_SUBTASK_END :
			ref = 'p_ERR_SUBTASK_END';
		break;
		
		case ACW_ERR_NULL_POINTER :
			ref = 'p_ERR_NULL_POINTER';
		break;

		case ACW_ERR_BATTERY_LEVEL_DEAD :
			ref = 'p_ERR_BATTERY_LEVEL_DEAD';
		break;

		case ACW_ERR_EEPROM :
			ref = 'p_ERR_EEPROM';
		break;

		case ACW_ERR_ROM:
			ref = 'p_ERR_ROM';
		break;
		
		case ACW_ERR_RAM :
			ref = 'p_ERR_RAM';
		break;
		
		case ACW_ERR_ARM_INIT_FAIL :
			ref = 'p_ERR_ARM_INIT_FAIL';
		break;
		
		case ACW_ERR_ARM_BUSY :
			ref = 'p_ERR_ARM_BUSY';
		break;
		
		case ACW_ERR_ARM_BRIDGE_ENABLE :
			ref = 'p_ERR_ARM_BRIDGE_ENABLE';
		break;
		
	    case ACW_ERR_ARM_RADIO_QUEUE_FULL :
			ref = 'p_ERR_RADIO_QUEUE_FULL';
		break;
		
		case ACW_ERR_CFG_BOX_INIT_FAIL :
			ref = 'p_ERR_CFG_BOX_INIT_FAIL';
		break;
		
/* ******************************************* */
/*                    ALERT                    */
/* ******************************************* */
		
		case ACW_ERR_KEEP_ALIVE_PERIOD :
			ref = 'p_ERR_KEEP_ALIVE_PERIOD';
		break;

		case ACW_ERR_BATTERY_LEVEL_LOW :
			ref = 'p_ERR_BATTERY_LEVEL_LOW';
		break;

        case ACW_ERR_ENTER_DEEP_SLEEP :
            ref = 'p_ERR_ENTER_DEEP_SLEEP';
        break;
		
		case ACW_ERR_ARM_TRANSMISSION :
			ref = 'p_ERR_ARM_TRANSMISSION';
		break;
		
		case ACW_ERR_ARM_PAYLOAD_BIGGER :
			ref = 'p_ERR_ARM_PAYLOAD_BIGGER';
		break;
		
		case ACW_ERR_RADIO_PAIRING_TIMEOUT :
			ref = 'p_ERR_RADIO_PAIRING_TIMEOUT';
		break;
		
		case ACW_ERR_SENSORS_TIMEOUT :
			ref = 'p_ERR_SENSORS_TIMEOUT';
		break;
		
		case ACW_ERR_SENSORS_STOP :
			ref = 'p_ERR_SENSOR_STOP';
		break;
		
		case ACW_ERR_SENSORS_FAIL :
			ref = 'p_ERR_SENSORS_FAIL';
		break;
		
		case ACW_ERR_BOX_OPENED :
			ref = 'p_ERR_BOX_OPENED';
		break;
		
		case ACW_ERR_BOX_CLOSED :
		    ref = 'p_ERR_BOX_CLOSED';
		break;
		
		case ACW_ERR_SENSORS_MOVE :
		    ref = 'p_ERR_SENSORS_MOVE';
		break;
		
		default : 
			return undefined;
	}
	return {
		tagRef: ref,
		timestamp: date+1,
		tagValue: String(0),
		context:[]
	}
}

function encodeDownlink(input) {
	const payloadHex = input.data.payload;
	const payloadBytes = payloadHex.match(/.{1,2}/g).map(byteHex => parseInt(byteHex, 16));  
	var errors = [];  
	
	if(input.data === 'Null'){
	  errors = ["error data"]
	}
	return {
	  bytes: payloadBytes,
	  fPort: 2,
	  warnings: [],
	  errors: errors
	};
  }
  