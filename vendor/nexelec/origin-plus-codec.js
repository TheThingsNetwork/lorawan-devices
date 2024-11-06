

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
            outputTypeMessage=[productStatusDataOutput(stringHex),productConfigurationDataOutput(stringHex),smokeAlarmDataOutput(stringHex),dailyAirDataOutput(stringHex),realTimeDataOutput(stringHex),temperatureDatalogDataOutput(stringHex)]
            return outputTypeMessage[octetTypeMessage]
        }

        function typeOfProduct(octetTypeProduit)
        {
            if(octetTypeProduit==0xB1){return "Origin+ LoRa"}
            if(octetTypeProduit==0xB2){return "Origin LoRa"}
            if(octetTypeProduit==0xB3){return "Guard+ LoRa"}
            if(octetTypeProduit==0xB4){return "Guard LoRa"}
        }    
        
        function typeOfMessage(octetTypeMessage)
        {
            const message_name =["Product Status","Product Configuration","Smoke Alarm","Air Quality" ,"Real Time","Temperature datalog"]
            return message_name[octetTypeMessage]
        }

        ///////////////////////////////////////////////
        // Product Status Data Message Function
        ///////////////////////////////////////////////
    

        function smokeStatus(octetSmokeStatus)
        {
            if(octetSmokeStatus===0){return "Smoke sensor ok"};
            if(octetSmokeStatus===1){return "Smoke sensor fault"};
        }

        function temperatureStatus(octetTemperatureStatus)
        {
            if(octetTemperatureStatus===0){return "T°/humidity sensor ok"};
            if(octetTemperatureStatus===1){return "T°/humidity sensor fault"};
        }

        function smokeActivation(octetSmokeActivation)
        {
            if(octetSmokeActivation===0){return "Smoke sensor desactivate"};
            if(octetSmokeActivation===1){return "Smoke sensor activate"};
        }

        function magnetBaseDetection(octetMagnetBaseDetection)
        {
            if(octetMagnetBaseDetection===0){return "Magnetic base not detected"};
            if(octetMagnetBaseDetection===1){return "Magnetic base detected"};
            if(octetMagnetBaseDetection===2){return "Product removed from its based just now"};
            if(octetMagnetBaseDetection===3){return "Product installed on its base just now"};
            if(octetMagnetBaseDetection===4){return "Magnetic base never detected"};
        }

        function batteryLevel(octetBatteryLevel)
        {
            if(octetBatteryLevel===0){return "High"};
            if(octetBatteryLevel===1){return "Medium"};
            if(octetBatteryLevel===2){return "Low"};
            if(octetBatteryLevel===3){return "Critical"};
        }
        
        function batteryVoltage(octetBatteryVoltage)
        {
            return {"value":((octetBatteryVoltage*5)+2000),"units":"mV"}
        }

        function productLifetime(octetProductLifetime)
        {
          {return {"value":octetProductLifetime, "unit":"month"}};
        }

        /////////////////////////////////////////////////////
        //Product Configuration Message Function
        ////////////////////////////////////////////////////

        function period(octetPeriod)
        {
            return {"value":octetPeriod*10, "unit":"minutes"};
        }

        function loraRegion(octetLoRaRegion)
        {
            const message_name =["EU868","Reserved","Reserved","Reserved","Reserved","Reserved","Reserved"]
            return message_name[octetLoRaRegion]
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

        function Active(octetActive)
        {
            if(octetActive===1){return "Active"}
            else if(octetActive===0){return "Deactivate"};
        }

        function reconfigurationSource(octetReconfigurationSource)
        {
            const message_name =["NFC","Downlink","Product Start up","Reserved","Reserved","Local"]
            return message_name[octetReconfigurationSource]
        }

        function reconfigurationState(octetReconfigurationState)
        {
            const message_name =["Total Success","Partial Succes","Total fail","Reserved"]
            return message_name[octetReconfigurationState]
        }

        function pendingJoin(octetPending)
        {
            if(octetPending===0){return "No join request scheduled"};
            if(octetPending===1){return "Join request scheduled"};
        }

        //////////////////////////////////////////////////////////////////////
        ////// Smoke Alarm Message Function
        /////////////////////////////////////////////////////////////////////

        function alarmStatus(octetAlarmStatus)
        {
            if(octetAlarmStatus===0){return "Smoke Alarm non-activated"};
            if(octetAlarmStatus===1){return "Local smoke Alarm activated"};
            if(octetAlarmStatus===2){return "Remote smoke Alarm activated"};
        }

        function alarmHush(octetAlarmHush)
        {
            if(octetAlarmHush===0){return "Smoke alarm stopped because no smoke anymore"};
            if(octetAlarmHush===1){return "Smoke alarm stopped following central button press"};
            if(octetAlarmHush===2){return ": Smoke alarm stopped following a remote silence"};
        }

        function smokeTest(octetSmokeTest)
        {
            if(octetSmokeTest===0){return "Smoke test off"};
            if(octetSmokeTest===1){return "Local smoke test was done"};
            if(octetSmokeTest===2){return "Remote smoke test was done"};
        }

        function maintenance(octetMaintenance)
        {
            if(octetMaintenance===0){return "Maintenance not done"};
            if(octetMaintenance===1){return "Maintenance has been done"};
        }

        function periodWeek(octetWeek)
        {
            return{"value":octetWeek,"units":"week"}
        }

        ///////////////////////////////////////////////////////////////////////
        /////// Real Time Message Function
        ///////////////////////////////////////////////////////////////////////
        
        function temperature(octetTemperature)
        {
            if(octetTemperature == 1023){return "Error"}
            if(octetTemperature == 1022){return "Deconnected Sensor"}
            else{ return{"value":((octetTemperature*0.1)-30),"unit":"°C"}}
        }

        function humidity(octetHumidity)
        {
            if(octetHumidity == 255){return "Error"}
            else{ return{"value":(octetHumidity*0.5),"unit":"°C"}}
        }

        ////////////////////////////////////////////////////////////////////
        /////// HexToBinary
        ///////////////////////////////////////////////////////////////////
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

        function productStatusDataOutput(stringHex)
        {
            var data_hw_version = (parseInt(stringHex.substring(4,6),16)) & 0xFF;
            var data_sw_version = (parseInt(stringHex.substring(6,8),16)) & 0xFF;
            var data_product_lifetime = (parseInt(stringHex.substring(8,10),16)) & 0xFF;
            var data_smoke_sensor= (parseInt(stringHex.substring(10,11),16)>>3) & 0x01;
            var data_temp_hum_sensor= (parseInt(stringHex.substring(10,11),16)>>2) & 0x01;
            var data_smoke_sensor_activation = (parseInt(stringHex.substring(10,11),16)>>1) & 0x01;
            var data_magnetic_base_detection = (parseInt(stringHex.substring(10,12),16)>>2) & 0x07;
            var data_energy_status= (parseInt(stringHex.substring(11,12),16)) & 0x03;
            var data_battery_voltage =(parseInt(stringHex.substring(12,14),16)) & 0xFF;

            data = {"typeOfProduct": typeOfProduct(octetTypeProduit),
            "typeOfMessage": typeOfMessage(octetTypeMessage),
            "hwVersion":data_hw_version,
            "swVersion":data_sw_version*0.1,
            "rmgLifetime":productLifetime(data_product_lifetime),
            "smokeSensorStatus": smokeStatus(data_smoke_sensor),
            "tempHumSensorStatus": temperatureStatus(data_temp_hum_sensor),
            "smokeSensorActivation":smokeActivation(data_smoke_sensor_activation),
            "antiTearDetectionStatus": magnetBaseDetection(data_magnetic_base_detection),
            "batteryLevel":batteryLevel(data_energy_status),
            "batteryVoltage": batteryVoltage(data_battery_voltage)
            }

            return data;
        }

        function productConfigurationDataOutput(stringHex)
        {
            var data_reconfiguration_source = (parseInt(stringHex.substring(4,5),16)>>1)&0x07;
            var data_reconfiguration_status = (parseInt(stringHex.substring(4,6),16)>>3)&0x03;
            var data_datalog_enable= (parseInt(stringHex.substring(5,6),16)>>2)&0x01;
            var data_daily_air_enable= (parseInt(stringHex.substring(5,6),16)>>1)&0x01;
            var data_magnet_removal_enable= (parseInt(stringHex.substring(5,6),16))&0x01;
            var data_pending_join = (parseInt(stringHex.substring(6,7),16)>>3)&0x01;
            var data_nfc_status = (parseInt(stringHex.substring(6,7),16)>>1)&0x03;
            var data_lora_region = (parseInt(stringHex.substring(6,8),16)>>1)&0x0F;
            var data_nb_new_data = (parseInt(stringHex.substring(7,10),16)>>3)&0x3F; 
            var data_nb_of_redudancy =(parseInt(stringHex.substring(9,11),16)>>2)&0x1F;
            var data_transmission_period = (parseInt(stringHex.substring(10,13),16)>>2)&0xFF;
            var data_interconnection_id = (parseInt(stringHex.substring(12,17),16)>>1)&0x1FFFF; //manque info sur la doc

            data = {"typeOfProduct": typeOfProduct(octetTypeProduit),
            "typeOfMessage": typeOfMessage(octetTypeMessage),
            "reconfigurationSource":reconfigurationSource(data_reconfiguration_source),
            "reconfigurationStatus":reconfigurationState(data_reconfiguration_status),
            "datalogEnable":Active(data_datalog_enable),
            "dailyAirEnable":Active(data_daily_air_enable),
            "smokeDetectionOnMagnetRemovalEnable":Active(data_magnet_removal_enable),
            "pendingJoin":pendingJoin(data_pending_join),
            "nfcStatus":nfcStatus(data_nfc_status),
            "loraRegion":loraRegion(data_lora_region),
            "datalogNewMeasure":data_nb_new_data,
            "datalogMeasureRepetition":data_nb_of_redudancy,
            "transmissionIntervalDatalog":period(data_transmission_period),
            "d2dNetworkID":data_interconnection_id,
            }
            return data;
        }

        function smokeAlarmDataOutput(stringHex)
        {
            var data_smoke_alarm = (parseInt(stringHex.substring(4,5),16) >> 2)&0x03;
            var data_smoke_hush = (parseInt(stringHex.substring(4,5),16))&0x03;
            var data_smoke_test = (parseInt(stringHex.substring(5,6),16)>>2)&0x03;
            var data_time_since_last_smoke_test = (parseInt(stringHex.substring(5,8),16)>>2)&0xFF;
            var data_maintenance = (parseInt(stringHex.substring(7,8),16)>>1)&0x01;
            var data_time_since_last_maintenance = (parseInt(stringHex.substring(7,10),16)>>1)&0xFF;
            var data_temperature = (parseInt(stringHex.substring(9,13),16)>>3)&0x3FF;
            
            data = { "typeOfProduct": typeOfProduct(octetTypeProduit),
            "typeOfMessage": typeOfMessage(octetTypeMessage),
            "smokeAlarm": alarmStatus(data_smoke_alarm),
            "smokeAlarmHush": alarmHush(data_smoke_hush),
            "smokeLocalProductTest": smokeTest(data_smoke_test),
            "timeSinceLastTest":periodWeek(data_time_since_last_smoke_test),
            "digitalMaintenanceCertificate":maintenance(data_maintenance),
            "timeSinceLastMaintenance":periodWeek(data_time_since_last_maintenance),
            "temperature":temperature(data_temperature)
            };
            return data;
        }

        function dailyAirDataOutput(stringHex)
        {
            var data_temp_mini = (parseInt(stringHex.substring(4,7),16)>>2)&0x3FF;
            var data_temp_max = (parseInt(stringHex.substring(6,9),16))&0x3FF;
            var data_temp_avg = (parseInt(stringHex.substring(9,12),16)>>2)&0x3FF;
            var data_hum_min = (parseInt(stringHex.substring(11,14),16)>>2)&0xFF;
            var data_hum_max = (parseInt(stringHex.substring(13,16),16)>>2)&0xFF;
            var data_hum_avg = (parseInt(stringHex.substring(15,18),16)>>2)&0xFF;

            data = {"typeOfProduct": typeOfProduct(octetTypeProduit),
            "typeOfMessage": typeOfMessage(octetTypeMessage),
            "temperatureMin":temperature(data_temp_mini),
            "temperatureMax":temperature(data_temp_max),
            "temperatureAvg":temperature(data_temp_avg),
            "humidityMin":humidity(data_hum_min),
            "humidityMax":humidity(data_hum_max),
            "humidityAvg":humidity(data_hum_avg),
            }
            return data;
        }

        function realTimeDataOutput(stringHex)
        {
            var data_temp = (parseInt(stringHex.substring(4,7),16)>>2)&0x3FF;
            var data_hum = (parseInt(stringHex.substring(6,9),16)>>2)&0xFF;

            data = {"typeOfProduct": typeOfProduct(octetTypeProduit),
            "typeOfMessage": typeOfMessage(octetTypeMessage),
            "temperature":temperature(data_temp),
            "humidity":humidity(data_hum),
            }

            return data;
        }

        function temperatureDatalogDataOutput(stringHex)
        {
            var mesure = [];
            var i = 0;
            var offset_octet = 0;

            var data_nombre_mesures = (parseInt(stringHex.substring(4,6),16)>>2)&0x3F;
            var data_time_between_measurement_sec = ((parseInt(stringHex.substring(5,8),16)>>2)&0xFF);
            var data_repetition = (parseInt(stringHex.substring(7,9),16))&0x3F;
            var binary=hexToBinary(stringHex)

            for(i=0;i<data_nombre_mesures;i++){

                offset_binaire = 36 + (10*i);

                mesure[i]= parseInt(binary.substring(offset_binaire,offset_binaire+10),2);  

                if(mesure[i] === 0x3FF){mesure[i] = 0;}
                else{mesure[i] = Math.round((mesure[i]/10)-30)}

            }

            data={ "typeOfProduct": typeOfProduct(octetTypeProduit),
            "typeOfMessage": typeOfMessage(octetTypeMessage),
            "datalogNewMeasure": data_nombre_mesures,
            "transmissionIntervalDatalog":{"value":data_time_between_measurement_sec,"unit":"minutes"},
            "datalogMeasureRepetition":data_repetition,
            "temperature":{"value":mesure,"unit":"°C"},
            } 

            return data;
        }

        data=dataOutput(octetTypeMessage);
        output = {data};
        return output
} // end of decoder