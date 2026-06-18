

function decodeUplink(input) 
{
    var tab_bin=[];
    var output = 0;
    var data;
    
    stringHex = bytesString(input.bytes);
    
    var octetTypeProduit = parseInt(stringHex.substring(0,2),16);
    var octetTypeMessage = parseInt(stringHex.substring(2,4),16);
    

        function bytesString(input)
        {
            var bufferString='';
            var decToString='';

            for(var i=0; i<input.length;i++)
            {
                decToString = input[i].toString(16).padStart(2,'0')
                        
                bufferString=bufferString.concat(decToString)
                        
            }       
            return bufferString;
        }
        
        function dataOutput(octetTypeMessage)
        {
            outputTypeMessage=["Reserved",periodicDataOutput(stringHex),historicalCO2DataOutput(stringHex),historicalTemperatureDataOutput(stringHex),historicalHumidityDataOutput(stringHex),productStatusDataOutput(stringHex),
                                productConfigurationDataOutput(stringHex)]
            return outputTypeMessage[octetTypeMessage]
        }

        function typeOfProduct(octetTypeProduit)
        {
            if(octetTypeProduit==0xA9){return "Feel LoRa"}
            if(octetTypeProduit==0xAA){return "Rise LoRa"}
            if(octetTypeProduit==0xAB){return "Move LoRa"}
            if(octetTypeProduit==0xAC){return "Wave LoRa"}
            if(octetTypeProduit==0xAD){return "Sign LoRa"}
        }    
        
        function typeOfMessage(octetTypeMessage)
        {
            const message_name =["Reserved","Periodic data","CO2 Historical Data","Temperature Historical Data" ,"Humidity Historical Data","Product Status","Product Configuration"]
            return message_name[octetTypeMessage]
        }

        ///////////////////////////////////////////////
        // Periodical Data Message Function
        ///////////////////////////////////////////////
        function temperature(octetTemperatureValue)
        {
            if(octetTemperatureValue>=1023){return "Error"}
            if(octetTemperatureValue>=1022){return "Deconnected sensor"}
            if(octetTemperatureValue>=1021){return "Desactivated sensor"}
            else{return {"value":((octetTemperatureValue/10)-30), "unit":"°C" }}
            
        }

        function humidity(octetHumidityValue)
        {
            if(octetHumidityValue>=1023){return "Error"}
            if(octetHumidityValue>=1022){return "Deconnected sensor"}
            if(octetHumidityValue>=1021){return "Desactivated sensor"}
            else{return {"value":(octetHumidityValue/10), "unit" :"%RH"}}

        }

        function co2(octetCO2Value)
        {
            if(octetCO2Value>=16383){return "Error"}
            if(octetCO2Value>=16382){return "Deconnected sensor"}
            if(octetCO2Value>=16381){return "Desactivated sensor"}
            else{return {"value":octetCO2Value, "unit":"ppm"}};
        }

        function covt(octetCOVTValue)
        {
            if(octetCOVTValue>=16383){return "Error"}
            if(octetCOVTValue>=16382){return "Deconnected sensor"}
            if(octetCOVTValue>=16381){return "Desactivated sensor"}
            else{return {"value":octetCOVTValue,"unit":"ug/m3"}};
        }

        function luminosity(octetLuminosityValue)
        {
            if(octetLuminosityValue>=1023){return "Error"}
            if(octetLuminosityValue>=1022){return "Deconnected sensor"}
            if(octetLuminosityValue>=1021){return "Desactivated sensor"}
            else{return {"value":(octetLuminosityValue*5),"unit":"lux"}};
        }

        function buttonPress(octetButtonValue)
        {
            if(octetButtonValue===0){return "Button not pressed"}
            else if(octetButtonValue===1){return "Button pressed"};
        }

        function averageNoise(octetAverageNoise)
        {
            if(octetAverageNoise===127){return "Error"}
            if(octetAverageNoise>=126){return "Deconnected sensor"}
            if(octetAverageNoise>=125){return "Desactivated sensor"}
            else{return {"value":octetAverageNoise,"unit":"dB"}};
        }

        function peakNoise(octetPeakNoise)
        {
            if(octetPeakNoise===127){return "Error"}
            if(octetPeakNoise>=126){return "Deconnected sensor"}
            if(octetPeakNoise>=125){return "Desactivated sensor"}
            else{return {"value":octetPeakNoise,"unit":"dB"}};
        }
        
        function occupancyRate(octetOccupancyRate)
        {
            if(octetOccupancyRate===127){return "Error"}
            if(octetOccupancyRate>=126){return "Deconnected sensor"}
            if(octetOccupancyRate>=125){return "Desactivated sensor"}
            else{return {"value":octetOccupancyRate,"unit":"%"}};
        }

        function iaqGlobalArgument(octetiaqGlobal)
        {
            const message_name =["Excellent","Reserved","Fair","Reserved","Bad","Reserved","Reserved","Error"]
            return message_name[octetiaqGlobal]
        }

        function iaqSourceArgument(octetiaqSource)
        {
            const message_name =["None","Reserved","Reserved","Reserved","Reserved","CO2","VOC","Reserved","Reserved","Reserved","Reserved","Reserved","Reserved","Reserved","Reserved","Error"]
            return message_name[octetiaqSource]
        }

        ///////////////////////////////////////////////
        // Product Status Message Function
        ///////////////////////////////////////////////

        function hwRevision(octetHWRevision)
        {
            switch(octetHWRevision){
                case 0: 
                    return 0
                break;

                case 1:
                    return 1
                break;
            }
        }

        function swRevision(octetSWRevision)
        {
            switch(octetSWRevision){
                case 0: 
                    return 0
                break;

                case 1:
                    return 1
                break;
            }
        }

        function powerSource(octetPowerSource)
        {
            const message_name =["Battery","External 5V","Reserved","Reserved"]
            return message_name[octetPowerSource]
        }

        function batteryVoltage(octetbatteryVoltage)
        {
            if(octetbatteryVoltage===1023){return "Error"}
            else if(octetbatteryVoltage === 1022){return "External power supply"}
            else{return {"value":(octetbatteryVoltage*5), "unit":"mV" }}
        }

        function batterieLevelArgument(octetBatteryLevel)
        {
            const message_name =["High","Medium","Low","Critical","External power supply"]
            return message_name[octetBatteryLevel]
        }

        function productHwStatusArgument(octetProductHwStatus)
        {
            const message_name =["Hardware working correctly","Hardware fault detected"]
            return message_name[octetProductHwStatus]
        }

        function sensorStatusArgument(octetSensorStatus)
        {
            const message_name =["Sensor Ok","Sensor default","Sensor not present","Sensor disabled","End-of-life sensor"]
            return message_name[octetSensorStatus]
        }

        function sdStatusArgument(octetSDStatus)
        {
            const message_name =["SD card OK","Fault: Cannot mount drive","Card missing","Functionality disabled","SD card at end of life"]
            return message_name[octetSDStatus]
        }

        function productActivationTimeCounter(octetTimeCounter)
        {
            if(octetTimeCounter===1023 ){return "Error"}
            else{return {"value":octetTimeCounter,"unit":"month"}};
        }

        function lowBatterieThreshold(octetLowBatterie)
        {
           {return {"value":(octetLowBatterie*5)+2000,"unit":"mV"}};
        }

        function antiTearArgument(octetSDStatus)
        {
            const message_name =["Product undetected","Product detected","Product just undetected","Product just detected"]
            return message_name[octetSDStatus]
        }

        /////////////////////////////////////////////////////
        //Product Configuration Message Function
        ////////////////////////////////////////////////////

        function reconfigurationSource(octetReconfigurationSource)
        {
            const message_name =["NFC","Downlink","Product Start up","Network","GPS","Local"]
            return message_name[octetReconfigurationSource]
        }

        function reconfigurationState(octetReconfigurationState)
        {
            const message_name =["Total Succes","Partial Succes","Total fail","Reserved"]
            return message_name[octetReconfigurationState]
        }

        function period(octetPeriod)
        {
            return {"value":octetPeriod, "unit":"minutes"};
        }

        function sensorActivation(octetSensorActivate)
        {
            if(octetSensorActivate===0){return "Sensor desactivated"}
            else if(octetSensorActivate===1){return "Sensor activated" };
        }

        function sdActivation(octetSDActivate)
        {
            if(octetSDActivate===0){return "SD desactivated"}
            else if(octetSDActivate===1){return "SD activated"};
        }

        function calibrationActivation(octetCalibrationActivate)
        {
            if(octetCalibrationActivate===0){return "Automatic calibration desactivated"}
            else if(octetCalibrationActivate===1){return "Automatic calibration activated"};
        }

        function active(octetActive)
        {
            if(octetActive===0){return "Non-active"}
            else if(octetActive===1){return "Active "};
        }

        function notificationByLEDandBuzzer(octetNotification)
        {
            if(octetNotification===0){return "CO2"}
            else if(octetNotification===1){return "IziAir"};
        }

        function loraRegion(octetLoRaRegion)
        {
            const message_name =["Reserved","EU868","US915","Reserved","Reserved","Reserved","Reserved","Reserved","SF-RC1"]
            return message_name[octetLoRaRegion]
        }

        function deltaCO2(octetDeltaCO2)
        {
            if(octetDeltaCO2===255){return "Desactivated"}
            else{return {"value":(octetDeltaCO2*4),"unit":"ppm"}}
        }

        function deltaTemp(octetDeltaTemp)
        {
            if(octetDeltaTemp===127){return "Desactivated"}
            else{return {"value":(octetDeltaTemp*0.1),"unit":"°C"}}
        }

        function co2Threshold(octetCO2Threshold)
        {
            return {"value":octetCO2Threshold*5, "unit":"ppm"};
        }

        function transmissionPeriodHistorical(octetPeriodHistorical)
        {
            if(octetPeriodHistorical===255){return "Erreur"}
            else{return {"value":(octetPeriodHistorical*10),"unit":"minute"}}
        }

        function pendingJoin(octetPending)
        {
            if(octetPending===0){return "No join request"}
            else if(octetPending===1){return "Programmed join request"};
        }

        function nfcStatus(octetNfcStatus)
        {
            if(octetNfcStatus===0){return "Discoverable"}
            else if(octetNfcStatus===1){return " No Discoverable"};
        }

        //////////////////////////////////////////////////////////////////////
        ////// Hex to binary
        ////////////////////////////////////////////////////////////////////

        function hexToBinary(encoded) {
            var string_bin = "";
            var string_bin_elements = "";
            var i;
            var j;
    
            for (i = 0; i < encoded.length; i++) {
                string_bin_elements = encoded.charAt(i);
                string_bin_elements = parseInt(string_bin_elements, 16).toString(2);
                if (string_bin_elements.length < 4) {
                    var nb_zeros = 4 - string_bin_elements.length;
                    for (j = 0; j < nb_zeros; j++) {
                        string_bin_elements = "0" + string_bin_elements;
                    }
                }
                string_bin = string_bin + string_bin_elements;
            }
            return string_bin;
        }

        //////////////////////////////////////////////////////////////////////
        ////// Product message decoding
        ////////////////////////////////////////////////////////////////////

        
        function periodicDataOutput(stringHex)
        {
            var data_temperature = (parseInt(stringHex.substring(4,8),16) >> 6) & 0x3FF;
            var data_humidity = (parseInt(stringHex.substring(6,9),16)) & 0x3FF;
            var data_co2 = (parseInt(stringHex.substring(9,13),16)>>2) & 0x3FFF;
            var data_covt = (parseInt(stringHex.substring(12,16),16)) & 0x3FFF;
            var data_luminosity = (parseInt(stringHex.substring(16,19),16) >> 2) & 0x3FF;
            var data_button_press = (parseInt(stringHex.substring(18,19),16)>>1) & 0x01;
            var data_avg_noise = (parseInt(stringHex.substring(18,21),16)>>2) & 0x7F;
            var data_peak_noise = (parseInt(stringHex.substring(20,23),16) >> 3) & 0x7F;
            var data_occupancy_rate = (parseInt(stringHex.substring(22,24),16)) & 0x7F;
            var data_izi_air_global = (parseInt(stringHex.substring(24,26),16) >> 5) & 0x07;
            var data_izi_air_src = (parseInt(stringHex.substring(24,26),16) >> 1) & 0x0F;
            var data_izi_air_co2 = (parseInt(stringHex.substring(25,27),16) >> 2) & 0x07;
            var data_izi_air_cov = (parseInt(stringHex.substring(26,28),16) >> 3) & 0x07;

            data = { "typeOfProduct": typeOfProduct(octetTypeProduit),
            "typeOfMessage": typeOfMessage(octetTypeMessage),
            "temperature": temperature(data_temperature),
            "humidity": humidity(data_humidity) ,
            "co2": co2(data_co2),
            "covt": covt(data_covt),
            "luminosity": luminosity(data_luminosity),
            "buttonPress": buttonPress(data_button_press) ,
            "averageNoise": averageNoise(data_avg_noise) ,
            "peakNoise": peakNoise(data_peak_noise),
            "occupancyRate": occupancyRate(data_occupancy_rate),
            "iziairGlobal": iaqGlobalArgument(data_izi_air_global) ,
            "iziairSrc": iaqSourceArgument(data_izi_air_src),
            "iziairCo2": iaqGlobalArgument(data_izi_air_co2),
            "iziairCov": iaqGlobalArgument(data_izi_air_cov),
            };
        
            
            return data;
        }

        function historicalCO2DataOutput(stringHex)
        {
            var mesure = [];
            var debugmesure = [];
            var i = 0;
            var offset_octet = 0;

            var data_nombre_mesures = (parseInt(stringHex.substring(4,6),16)>>2)&0x3F;
            var data_time_between_measurement_min = ((parseInt(stringHex.substring(4,8),16)>>2)&0xFF);
            var data_repetition = (parseInt(stringHex.substring(7,9),16))&0x3F;
            var binary=hexToBinary(stringHex)
    
            for(i=0;i<data_nombre_mesures;i++){

                offset_binaire = 36 + (10*i);
                mesure[i]= parseInt(binary.substring(offset_binaire,offset_binaire+10),2);

                if(mesure[i] === 0x3FF){mesure[i] = 0;}
                else{mesure[i] = parseFloat((mesure[i] * 5).toFixed(2))}
            }

            data={ "typeOfProduct": typeOfProduct(octetTypeProduit),
            "typeOfMessage": typeOfMessage(octetTypeMessage),
            "numberOfRecord": data_nombre_mesures,
            "periodBetweenRecord":{"value":data_time_between_measurement_min*10,"unit":"minutes"},
            "redundancyOfRecord":data_repetition,
            "co2":{"value":mesure,"unit":"ppm"},
            }
            
            return data
        }

        function historicalTemperatureDataOutput(stringHex)
        {
            var mesure = [];
            var i = 0;

            var data_nombre_mesures = (parseInt(stringHex.substring(4,6),16)>>2)&0x3F;
            var data_time_between_measurement_min = ((parseInt(stringHex.substring(4,8),16)>>2)&0xFF);
            var data_repetition = (parseInt(stringHex.substring(7,9),16))&0x3F;
            var binary=hexToBinary(stringHex)
        
            for(i=0;i<data_nombre_mesures;i++){

                offset_binaire = 36 + (10*i);

                mesure[i]= parseInt(binary.substring(offset_binaire,offset_binaire+10),2);  

                if(mesure[i] === 0x3FF){mesure[i] = 0;}
                else{mesure[i] = parseFloat(((mesure[i] / 10) - 30).toFixed(2))}

            }

            data={ "typeOfProduct": typeOfProduct(octetTypeProduit),
            "typeOfMessage": typeOfMessage(octetTypeMessage),
            "numberOfRecord": data_nombre_mesures,
            "periodBetweenRecord":{"value":data_time_between_measurement_min*10,"unit":"minutes"},
            "redundancyOfRecord":data_repetition,
            "temperature":{"value":mesure,"unit":"°C"},
            }
            return data;
        }

        function historicalHumidityDataOutput(stringHex)
        {
            var mesure = [];
            var i = 0;

            var data_nombre_mesures = (parseInt(stringHex.substring(4,6),16)>>2)&0x3F;
            var data_time_between_measurement_min = ((parseInt(stringHex.substring(4,8),16)>>2)&0xFF);
            var data_repetition = (parseInt(stringHex.substring(7,9),16))&0x3F;
            var binary=hexToBinary(stringHex)
        
            for(i=0;i<data_nombre_mesures;i++){

                offset_binaire = 36 + (10*i);

                mesure[i]= parseInt(binary.substring(offset_binaire,offset_binaire+10),2);  

                if(mesure[i] === 0x3FF){mesure[i] = 0;}
                else{mesure[i] = parseFloat((mesure[i]*0.1).toFixed(2))}

            }

            data={ "typeOfProduct": typeOfProduct(octetTypeProduit),
            "typeOfMessage": typeOfMessage(octetTypeMessage),
            "numberOfRecord": data_nombre_mesures,
            "periodBetweenRecord":{"value":data_time_between_measurement_min*10,"unit":"minutes"},
            "redundancyOfRecord":data_repetition,
            "humidity":{"value":mesure,"unit":"%RH"},
            }
            return data;
        }

        function productStatusDataOutput(stringHex)
        {
            var data_hw_version = (parseInt(stringHex.substring(4,6),16)) & 0xFF;
            var data_sw_version = (parseInt(stringHex.substring(6,8),16)) & 0xFF;
            var data_power_source = (parseInt(stringHex.substring(8,10),16)>>6) & 0x07;
            var data_battery_voltage = (parseInt(stringHex.substring(8,11),16)) & 0x3FF;
            var data_battery_level = (parseInt(stringHex.substring(10,12),16) >> 1 ) & 0x07;
            var data_hw_status = (parseInt(stringHex.substring(10,12),16)) & 0x01;
            var data_hw_status_temperature = (parseInt(stringHex.substring(11,13),16)>>1) & 0x07;
            var data_hw_status_co2 = (parseInt(stringHex.substring(12,14),16)>>2) & 0x07;
            var data_hw_status_covt = (parseInt(stringHex.substring(13,15),16)>>3) & 0x07;
            var data_hw_status_pir = (parseInt(stringHex.substring(13,15),16)) & 0x07;
            var data_hw_status_microphone = (parseInt(stringHex.substring(15,16),16)>>1) & 0x07;
            var data_hw_status_luminosity = (parseInt(stringHex.substring(15,17),16)>>2) & 0x07;
            var data_hw_status_SD= (parseInt(stringHex.substring(16,18),16)>>3) & 0x07;
            var data_activation_time = (parseInt(stringHex.substring(16,20),16)>>1) & 0x3FF;
            var data_co2_last_manual_calibration_time = (parseInt(stringHex.substring(19,21),16)>>1);
            var data_low_threshold_batterie = (parseInt(stringHex.substring(22,24),16)) & 0xFF;
            var data_hw_status_anti_tear = (parseInt(stringHex.substring(24,25),16)>>2) & 0x3;

            data = { "typeOfProduct": typeOfProduct(octetTypeProduit),
            "typeOfMessage": typeOfMessage(octetTypeMessage),
            "hardwareVersion":data_hw_version,
            "softwareVersion":data_sw_version,
            "powerSource":powerSource(data_power_source),
            "batteryVoltage":batteryVoltage(data_battery_voltage),
            "batteryLevel":batterieLevelArgument(data_battery_level),
            "hardwareStatus":productHwStatusArgument(data_hw_status),
            "temperatureSensorStatus":sensorStatusArgument(data_hw_status_temperature),
            "co2SensorStatus":sensorStatusArgument(data_hw_status_co2),
            "covtSensorStatus":sensorStatusArgument(data_hw_status_covt),
            "pirSensorStatus":sensorStatusArgument(data_hw_status_pir),
            "microphoneStatus":sensorStatusArgument(data_hw_status_microphone),
            "luminositySensorStatus":sensorStatusArgument(data_hw_status_luminosity),
            "sdStatus":sdStatusArgument(data_hw_status_SD),
            "cumulativeProductActivationTime":productActivationTimeCounter(data_activation_time),
            "timeSinceLastManualCalibration": {"value":data_co2_last_manual_calibration_time,"unit":"days"},
            "lowBatterieThreshold": lowBatterieThreshold(data_low_threshold_batterie),
            "antiTearSensorStatus": antiTearArgument(data_hw_status_anti_tear)
            };
            return data;
        }

        function productConfigurationDataOutput(stringHex)
        {
            var data_config_source = (parseInt(stringHex.substring(4,5),16)>>1) & 0x07;
            var data_config_status = (parseInt(stringHex.substring(4,6),16)>>3) & 0x03;
            var data_periode_mesure = (parseInt(stringHex.substring(5,7),16)>>2) & 0x1F;
            var data_sensor_on_off_co2 = (parseInt(stringHex.substring(6,7),16)>>1) & 0x01;
            var data_sensor_on_off_cov = (parseInt(stringHex.substring(6,7),16))& 0x01;
            var data_sensor_on_off_pir = (parseInt(stringHex.substring(7,8),16)>>3)& 0x01;
            var data_sensor_on_off_microphone = (parseInt(stringHex.substring(7,8),16)>>2) & 0x01;
            var data_sd_storage_on_off = (parseInt(stringHex.substring(7,8),16)>>1) & 0x01;
            var data_co2_auto_calibration = (parseInt(stringHex.substring(7,8),16)) & 0x01;
            var data_co2_medium_level = (parseInt(stringHex.substring(8,11),16)>>2) & 0x3FF;
            var data_co2_high_level = (parseInt(stringHex.substring(10,13),16)) & 0x3FF;
            var data_led_on_off = (parseInt(stringHex.substring(13,14),16) >> 3) & 0x01;
            var data_led_orange_on_off = (parseInt(stringHex.substring(13,14),16)>>2) & 0x01;
            var data_buzzer_on_off = (parseInt(stringHex.substring(13,14),16)>>1) & 0x01;
            var data_buzzer_confirm_on_off = (parseInt(stringHex.substring(13,14),16)) & 0x01;
            var data_led_source = (parseInt(stringHex.substring(14,15),16)>>2) & 0x03;
            var data_button_on_off = (parseInt(stringHex.substring(14,15),16) >> 1) & 0x01;
            var data_lora_region = (parseInt(stringHex.substring(14,16), 16)>>1) & 0x0F;
            var data_periodic_tx_on_off = (parseInt(stringHex.substring(15,16),16)) & 0x01;
            var data_periodic_tx_period = (parseInt(stringHex.substring(16,18),16)>>2) & 0x3F;
            var data_periodic_delta_co2 = (parseInt(stringHex.substring(17,20),16)>>2) & 0xFF;
            var data_periodic_delta_temp = (parseInt(stringHex.substring(19,22),16)>>3)& 0x7F;
            var data_datalog_co2_on_off = (parseInt(stringHex.substring(21,22),16)>>2) & 0x01;
            var data_datalog_temperature_on_off = (parseInt(stringHex.substring(21,22),16)>>1) & 0x01;
            var data_datalog_new_measure = (parseInt(stringHex.substring(21,24),16)>>3) & 0x3F;
            var data_datalog_repetition = (parseInt(stringHex.substring(23,25),16)>>2) & 0x1F;
            var data_datalog_tx_period = (parseInt(stringHex.substring(24,27),16)>>2) & 0xFF;
            var data_pending_join = (parseInt(stringHex.substring(26,27),16)>>1) & 0x01;
            var data_nfc_status = (parseInt(stringHex.substring(26,28),16)>>3) & 0x03;
            var data_date_produit_annee = (parseInt(stringHex.substring(27,29),16)>>1) & 0x3F;
            var data_date_produit_mois = (parseInt(stringHex.substring(28,30),16)>>1) & 0x0F;
            var data_date_produit_jour = (parseInt(stringHex.substring(29,31),16)) & 0x1F;
            var data_date_produit_heure = (parseInt(stringHex.substring(31,33),16)>>3) & 0x1F;
            var data_date_produit_minute = (parseInt(stringHex.substring(32,34),16)>>1) & 0x3F;
            var data_datalog_humidity_on_off = (parseInt(stringHex.substring(33,34),16)) & 0x01;


            data = {"typeOfProduct": typeOfProduct(octetTypeProduit),
            "typeOfMessage": typeOfMessage(octetTypeMessage),
            "configurationSource": reconfigurationSource(data_config_source),
            "configurationStatus": reconfigurationState(data_config_status),
            "periodBetween2measures": period(data_periode_mesure),
            "co2SensorActivation":sensorActivation(data_sensor_on_off_co2),
            "covSensorActivation":sensorActivation(data_sensor_on_off_cov),
            "pirSensorActivation":sensorActivation(data_sensor_on_off_pir),
            "microphoneSensorActivation":sensorActivation(data_sensor_on_off_microphone),
            "localStorageActivation":sdActivation(data_sd_storage_on_off),
            "automaticCalibrationActivation": calibrationActivation(data_co2_auto_calibration),
            "mediumCO2Threshold":co2Threshold(data_co2_medium_level),
            "highCO2Threshold":co2Threshold(data_co2_high_level),
            "ledActivation":active(data_led_on_off),
            "orangeLEDActivation":active(data_led_orange_on_off),
            "buzzerActivation":active(data_buzzer_on_off),
            "buzzerConfirmationActivation":active(data_buzzer_confirm_on_off),
            "ledSourceActivation":notificationByLEDandBuzzer(data_led_source),
            "buttonNotification":active(data_button_on_off),
            "loraRegion":loraRegion(data_lora_region),
            "periodicalDataActivation":active(data_periodic_tx_on_off),
            "dataTransmissionPeriod":period(data_periodic_tx_period),
            "deltaCO2":deltaCO2(data_periodic_delta_co2),
            "deltaTemperature": deltaTemp(data_periodic_delta_temp),
            "historicalCO2DataActivation":active(data_datalog_co2_on_off),
            "historicalTemperatureDataActivation":active(data_datalog_temperature_on_off),
            "historicalHumidityDataActivation":active(data_datalog_humidity_on_off),
            "numberOfRecordsInADatalogMessage":data_datalog_new_measure,
            "numberOfMessagesFor1Record":data_datalog_repetition,
            "transmissionPeriodOfHistoricalMessage":transmissionPeriodHistorical(data_datalog_tx_period),
            "networkJoinStatus": pendingJoin(data_pending_join),
            "nfcStatus": nfcStatus(data_nfc_status),
            "productDateYear": {"value":data_date_produit_annee,"unit":"year"},
            "productDateMonth": {"value":data_date_produit_mois,"unit":"month"},
            "productDateDay": {"value":data_date_produit_jour,"unit":"day"},
            "productDateHours": {"value":data_date_produit_heure,"unit":"hours"},
            "productDateMinutes": {"value":data_date_produit_minute,"unit":"minutes"}
            };

            return data;
        }
        
        data=dataOutput(octetTypeMessage);
        return {data};
} // end of decoder