var notConnectedStr = "Not connected";

    var messageTypes = {
        0x01: "Boot message",
        0x02: "Sensor data message",
        0x03: "Occupancy data message",
    }

    var vocUnits = {
        0: "TVOC μg/m3",
        1: "TVOC ppb",
        2: "VOC Index",
        3: "Reserved",
    }

    var tvocEquivalent = {
        0: "Isobutylene",
        1: "Mølhave",
        2: "Ethanol",
        3: "Reserved",
    }

    var resetState = {
        1: "Power On",
        2: "Hard Reset",
        3: "Soft Reset",
        4: "Watchdog",
        5: "Brown out",
        6: "Other",
    }

    var hardwareRegion = {
        0: "EU868",
        1: "US915",
        2: "AS923",
        3: "AU915",
    }

// Decode uplink function.
//
// Input is an object with the following fields:
// - bytes = Byte array containing the uplink payload, e.g. [255, 230, 255, 0]
// - fPort = Uplink fPort.
// - variables = Object containing the configured device variables.
//
// Output must be an object with the following fields:
// - data = Object representing the decoded payload.
/////////////////////////////////////////////////////////////////////////////////
// Decode Uplink
/////////////////////////////////////////////////////////////////////////////////
function decodeUplink(input) {
    var data = {};
    var byte = 0;
    
    //uncomment if the bytes want to be seen
    //data.bytes = input.bytes;
  	
	var productIdRaw = input.bytes[byte++];
    data.productId = "0x"+ productIdRaw.toString(16).toUpperCase();

    // Message type bit7-bit4, message rev bit3-bit0 
    var messageTypeRev = input.bytes[byte++];
    var messageTypeValue = (messageTypeRev >>4) & 0x0f;

    data.message = {}
    data.message.type = messageTypes[messageTypeValue];
    data.message.rev = (messageTypeRev & 0x0f);
  
    // Battery status
    var batteryInfo = input.bytes[byte++];
    // If 0 means lined powered 
    if(batteryInfo == 0){
        data.batteryVoltage = "External powered";
    }
    else if (batteryInfo == 0xff){
        data.batteryVoltage = "Not measured";
    }
    else{
        // convert the voltage in 0.2V steps
        data.batteryVoltage = convertRange(batteryInfo, 1, 241, 0, 48);
    }

    // Depending on the message type it is decoded differently
    // Boot Message
    if(messageTypeValue == 1){
        // Get the firmware version
        var firmwareVersionValue = input.bytes[byte++];
        firmwareVersionValue  = (firmwareVersionValue << 8) | input.bytes[byte++];

        data.firmwareVersion = (((firmwareVersionValue >> 12) & 0x0f) + '.' + ((firmwareVersionValue >> 8) & 0x0f) + '.' + ((firmwareVersionValue >> 4) & 0x0f) + '.' + (firmwareVersionValue & 0x0f));

        // Reset reason 
        data.resetReason = resetState[input.bytes[byte++]];

        // Hardware region
        data.hardwareRegionSelection = hardwareRegion[input.bytes[byte++]];

        // Sensors present
      	var sensorAvailableValue = input.bytes[byte++];
      	data.isSensorsAvailable = {};
      	data.isSensorsAvailable.temphumid = (sensorAvailableValue & (1 << 0)) !== 0 ? true: false;
        data.isSensorsAvailable.tvoc = (sensorAvailableValue & (1 << 1)) !== 0 ? true: false;
        data.isSensorsAvailable.co2 = (sensorAvailableValue & (1 << 2)) !== 0 ? true: false;
        data.isSensorsAvailable.pm = (sensorAvailableValue & (1 << 3)) !== 0 ? true: false;
        data.isSensorsAvailable.lux = (sensorAvailableValue & (1 << 4)) !== 0 ? true: false;
      	data.isSensorsAvailable.soundLevel = (sensorAvailableValue & (1 << 5)) !== 0 ? true: false;
		data.isSensorsAvailable.pir = (sensorAvailableValue & (1 << 6)) !== 0 ? true: false;

        // Reading Interval 
        var readIntervalValue = input.bytes[byte++];
        data.readInterval ={};
        data.readInterval.configuration = (readIntervalValue & (1 << 0)) !== 0 ? 'Network' : 'Dip Switch';
        data.readInterval.unit = "Minutes";
        data.readInterval.value = ((readIntervalValue >> 1) & 0xFF);

        // PM Sensor
        if(data.isSensorsAvailable.pm == true){
            var pmMaskValue = input.bytes[byte++];
            data.particuleMatter = {};
            data.particuleMatter.isAutoCleanIntervalSet = (pmMaskValue & (1 << 0)) !== 0 ? true: false;
            // Clean is not disabled, so show the interval period
            if(data.particuleMatter.isAutoCleanIntervalSet == true){
                // Clean Interval
                data.particuleMatter.autoCleanInterval = {};
                data.particuleMatter.autoCleanInterval.value = ((pmMaskValue >> 2) & 0x07);
                data.particuleMatter.autoCleanInterval.units = "Days";
            }
        }

        // CO2 sensor
		if(data.isSensorsAvailable.co2 == true){
          	data.co2 = {};

          	// Fresh Air
          	var co2FreshMaskValue = input.bytes[byte++];
			co2FreshMaskValue  = (co2FreshMaskValue << 8) | input.bytes[byte++];
            data.co2.hasManualCalibrationPerformed = (co2FreshMaskValue & (1 << 15)) !== 0 ? true : false;
            data.co2.freshAirBackgroundLevel =  {};
          	data.co2.freshAirBackgroundLevel.value =  (co2FreshMaskValue & 0x7FFF);
            data.co2.freshAirBackgroundLevel.units = "PPM";

          	// Indoor Air
          	var co2IndoorMaskValue = input.bytes[byte++];
			co2IndoorMaskValue  = (co2IndoorMaskValue << 8) | input.bytes[byte++];
            data.co2.isAutoCalibrationEnabled = (co2IndoorMaskValue & (1 << 15)) !== 0 ? true : false;
            data.co2.indoorAirBackgroundLevel = {};
            data.co2.indoorAirBackgroundLevel.value = (co2IndoorMaskValue & 0x7FFF);
            data.co2.indoorAirBackgroundLevel.units = "PPM";
        }

        // PIR
        if(data.isSensorsAvailable.pir == true){
            data.pir = {};
            data.pir.AbsenceTimeOut = {};
            data.pir.AbsenceTimeOut.value = input.bytes[byte++];
            data.pir.AbsenceTimeOut.units = "Minutes";
            data.pir.RepeatedTimeOut = {};
            data.pir.RepeatedTimeOut.value = input.bytes[byte++];
            data.pir.RepeatedTimeOut.units = "Minutes";
        }

        // Temperature and humidity
        if(data.isSensorsAvailable.temphumid == true){
            data.temperatureOffset = {};
            // Temperature Offset
            var temperatureOffsetRaw = input.bytes[byte++];
            data.temperatureOffset.value = temperatureOffsetRaw;
            data.temperatureOffset.scaled = ((0.25*temperatureOffsetRaw) - 5); //0..40 is -5..+5
            data.temperatureOffset.units = "°C";
            // Humidity Offset
            data.humidityOffset = {};
            var humidityOffsetRaw = input.bytes[byte++];
            data.humidityOffset.value = humidityOffsetRaw;
            data.humidityOffset.units = "%";
            data.humidityOffset.scaled = ((0.5*humidityOffsetRaw) - 5); //0..20 is -5..+5
        }

        // VOC
        if(data.isSensorsAvailable.tvoc == true){
            var vocMaskValue = input.bytes[byte++];
            data.voc = {};
            data.voc.Unit = vocUnits[(vocMaskValue) >> 4];
            data.voc.Equivalent = tvocEquivalent[(vocMaskValue & 0x0F)];
        }
    }

    // Environmental data
    else if(messageTypeValue == 2){
        data.dataAge = input.bytes[byte++];

        // Sensors present
      	var sensorAvailableValue = input.bytes[byte++];
      	data.isSensorsAvailable = {};
      	data.isSensorsAvailable.temphumid = (sensorAvailableValue & (1 << 0)) !== 0 ? true : false;
        data.isSensorsAvailable.tvoc = (sensorAvailableValue & (1 << 1)) !== 0 ? true : false;
        data.isSensorsAvailable.co2 = (sensorAvailableValue & (1 << 2)) !== 0 ? true : false;
        data.isSensorsAvailable.pm = (sensorAvailableValue & (1 << 3)) !== 0 ? true : false;
        data.isSensorsAvailable.lux = (sensorAvailableValue & (1 << 4)) !== 0 ? true : false;
      	data.isSensorsAvailable.soundLevel = (sensorAvailableValue & (1 << 5)) !== 0 ? true : false;
		data.isSensorsAvailable.pir = (sensorAvailableValue & (1 << 6)) !== 0 ? true : false;
		
        // Sensor data, Only if available
        if(data.isSensorsAvailable.temphumid  == true){
            data.temperature = {};
            data.temperature.value = convertTemp(input.bytes[byte++]);
            data.temperature.units = "°C";
            data.humidity = {};
            data.humidity.value = convertHum(input.bytes[byte++]);
            data.humidity.units = "%"; 

        }

        if(data.isSensorsAvailable.pm == true){
            // Convert PM10
            var pmRaw = input.bytes[byte++] <<  8 | input.bytes[byte];
            data.particulateMatter = {};
            data.particulateMatter.pm10 = convertPm((pmRaw & 0xFF80) >> 7);
            // Convert PM4
            pmRaw = input.bytes[byte++] << 8 | input.bytes[byte];
            data.particulateMatter.pm4 = convertPm((pmRaw & 0x7FC0) >> 6);
            // Convert PM2.5
            pmRaw = input.bytes[byte++] << 8 | input.bytes[byte];
            data.particulateMatter.pm2_5 = convertPm((pmRaw & 0x3FE0) >> 5);
            // Convert PM1.0
            pmRaw = input.bytes[byte++] << 8 | input.bytes[byte++];
            data.particulateMatter.pm1_0 = convertPm((pmRaw & 0x1FF0) >> 4); 
            // Units
            data.particulateMatter.units = "µg/m³";
        }

        if(data.isSensorsAvailable.soundLevel == true){
            data.soundLevel = {};
            data.soundLevel.value = convertSound(input.bytes[byte++]);
            data.soundLevel.units = "dBA";
        }

        if(data.isSensorsAvailable.lux == true){
            data.illumination = {};
            data.illumination.value = convertLux(input.bytes[byte++] << 8 | input.bytes[byte++]);
            data.illumination.units = "lx";
        }

        if(data.isSensorsAvailable.co2 == true){
            data.co2 = {};
            data.co2.value = convertco2(input.bytes[byte++] << 8 | input.bytes[byte++]);
            data.co2.units = "PPM";
        }

        if(data.isSensorsAvailable.tvoc == true){
            var vocRaw = input.bytes[byte++] << 8 | input.bytes[byte++];
            data.voc = {}
            data.voc.value = convertVoc(vocRaw & 0x3FFF);

            if (data.voc === notConnectedStr) {
                data.voc.units = notConnectedStr;
            } else {
                data.voc.units = vocUnits[(vocRaw & 0xC000) >> 14];
            }
        } 
    }

    // occupancy data
    else{
        data.dataAge = input.bytes[byte++];
        var occupancyValue = input.bytes[byte++];

        data.occupancyDetected = ((occupancyValue &0x01) == 0) ? 'Vacant' : 'Occupied';
    }

    // Return the data structure
    return {
        data: data,
    };
}
  
// Encode downlink function.
//
// Input is an object with the following fields:
// - data = Object representing the payload that must be encoded.
// - variables = Object containing the configured device variables.
//
// Output must be an object with the following fields:
// - bytes = Byte array containing the downlink payload.
/////////////////////////////////////////////////////////////////////////////////
// Decode Downlink
/////////////////////////////////////////////////////////////////////////////////
function encodeDownlink(input) {
    // Initialize the output object
    var data = {};

    if (input.fport == 60){
        data.message = {};

        // Config message
        if(input.bytes[0] == 0x01){
            data.message.type = "Configuration Message";
            data.message.version = input.bytes[1];

            // Reading Interval 
            var readIntervalValue = input.bytes[2];
            data.readInterval ={};
            data.readInterval.configuration = (readIntervalValue & (1 << 0)) !== 0 ? 'Network' : 'Dip Switch';
            data.readInterval.unit = intervalUnit[(readIntervalValue & 0x06)];
            data.readInterval.value = ((readIntervalValue & 0xf8) >> 3);

            // Particule Matter
            var pmMaskValue = input.bytes[3];
            data.particuleMatter = {};
            // Enabled Pm size
            data.particuleMatter.isEnabled = {};
            data.particuleMatter.isEnabled._1um = (pmMaskValue & (1 << 4)) !== 0 ? true :false;
            data.particuleMatter.isEnabled._2_5um = (pmMaskValue & (1 << 5)) !== 0 ? true :false;
            data.particuleMatter.isEnabled._4um = (pmMaskValue & (1 << 6)) !== 0 ? true :false;
            data.particuleMatter.isEnabled._10um = (pmMaskValue & (1 << 7)) !== 0 ? true :false;
            // Clean Interval
            data.particuleMatter.cleanInterval ={};
            data.particuleMatter.cleanInterval.value = ((pmMaskValue & 0x0e) >> 1);
            data.particuleMatter.cleanInterval.units = "Days";
            // Clean Performed
            data.particuleMatter.hasCleaned = (pmMaskValue & (1 << 0)) !== 0 ? true :false;

            // Co2
            data.co2 = {};
            // Fresh Air
            var co2FreshMaskValue = input.bytes[4];
            co2FreshMaskValue  = (co2FreshMaskValue << 8) | input.bytes[5];
            data.co2.hasManualCalibrationPerformed = (co2FreshMaskValue & (1 << 15)) !== 0 ? true :false;
            data.co2.freshAirBackgroundLevel =  {};
            data.co2.freshAirBackgroundLevel.value =  (co2FreshMaskValue & 0x7FFF);
            data.co2.freshAirBackgroundLevel.units = "PPM";
            // Indoor Air
            var co2IndoorMaskValue = input.bytes[6];
            co2IndoorMaskValue  = (co2IndoorMaskValue << 8) | input.bytes[7];
            data.co2.isAutoCalibrationEnabled = (co2IndoorMaskValue & (1 << 15)) !== 0 ? true :false;
            data.co2.indoorAirBackgroundLevel = {};
            data.co2.indoorAirBackgroundLevel.value = (co2IndoorMaskValue & 0x7FFF);
            data.co2.indoorAirBackgroundLevel.units = "PPM";

            // PIR
            data.pirAbsenceTimeOut = {};
            data.pirAbsenceTimeOut.value = input.bytes[8];
            data.pirAbsenceTimeOut.units = "Minutes";
        }

        // PM Clean Sensor
        else if (input.bytes[0] == 0x02){
            data.message.type = "PM Sensor Clean";
            data.message.version = input.bytes[1];
            data.pmTriggerValue  = input.bytes[2];
        }

        // Unknown message type
        else{
            data.message.type = "Unknown message type"; // Handle unexpected types 
        }

        // Return the decoded data
        return {
            data: data,
        };

    }
    // Must be a server downlink message
    else{
        return {
            bytes: [225, 230, 255, 0]
        }; 
    }

}


/////////////////////////////////////////////////////////////////////////////////
// Value Conversion functions
/////////////////////////////////////////////////////////////////////////////////
function convertRange(num, inMin, inMax, outMin, outMax) {
    out = outMin + ((num - inMin) / (inMax - inMin) * (outMax - outMin));
    return parseFloat(out.toFixed(2));
}

function convertTemp(num) {
    if (num === 0xFF) {
        return notConnectedStr;
    } else {
        return convertRange(num, 0, 240, -10, 50);
    }
}

function  convertHum(num) {
    if (num === 0xFF) {
        return notConnectedStr;
    } else {
        return convertRange(num, 0, 200, 0, 100);
    }
}

function convertPm(num) {
    if (num === 0x1FF) {
        return notConnectedStr;
    } else {
        return num;
    }
}

function convertSound(num) {
    if (num === 0xFF) {
        return notConnectedStr;
    } else {
        return convertRange(num, 0, 250, 0, 125);
    }
}

function convertLux(num) {
    if (num === 0xFFFF) {
        return notConnectedStr;
    } else {
        return convertRange(num, 0, 20000, 0, 20000);
    }
}

function convertco2(num){
    if (num === 0xFFFF) {
        return notConnectedStr;
    } else {
        return convertRange(num, 0, 5000, 0, 5000);
    }
}

function convertVoc(num) {
    if (num === 0x3FFF) {
        return notConnectedStr;
    } else {
        return convertRange(num, 0, 5000, 0, 5000);
    }
}