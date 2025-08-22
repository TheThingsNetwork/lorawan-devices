 // Please read here on how to implement the proper codec: https://www.thethingsindustries.com/docs/integrations/payload-formatters/javascript/
function decodeUplink(input) 
{
    var tab_bin=[];
    var output = 0;
    
    var stringHex = bytesString(input.bytes);
    
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
            if(octetTypeMessage==0x01){return periodicDataOutput(stringHex)}
            if(octetTypeMessage==0x02){return productStatusDataOutput(stringHex)}
            if(octetTypeMessage==0x03){return positionningDataOutput(stringHex)}
            if(octetTypeMessage==0x04){return productConfigurationDataOutput(stringHex)}
        }

        function typeOfProduct(octetTypeProduit)
        {
            if(octetTypeProduit==0xB5){return "TRACK+ LoRa"}
        }    
        
        function typeOfMessage(octetTypeMessage)
        {
            if(octetTypeMessage==0x01){return "Periodic Data"}
            if(octetTypeMessage==0x02){return "Product Status"}
            if(octetTypeMessage==0x03){return "Positionning Frame"}
            if(octetTypeMessage==0x04){return "Product Configuration"}
        }

        ///////////////////////////////////////////////
        // Periodical Data Message Function
        ///////////////////////////////////////////////
        function temperature(octetTemperatureValue)
        {
            if(octetTemperatureValue>=65535){return "Error"}
            if(octetTemperatureValue>=65534){return "Deconnected sensor"}
            else{return {"value":parseFloat(((octetTemperatureValue / 10) - 30).toFixed(2)), "unit":"°C" }}
        }

        function humidity(octetHumidityValue)
        {
            if(octetHumidityValue>=65535){return "Error"}
            if(octetHumidityValue>=65534){return "Deconnected sensor"}
            else{return {"value":(octetHumidityValue/10), "unit" :"%RH"}}
        }

        function co2(octetCO2Value)
        {
            if(octetCO2Value>=65535){return "Error"}
            else{return {"value":octetCO2Value, "unit":"ppm"}};
        }

        function pm_ug_m3(octetPmValue)
        {
            if(octetPmValue>=65535){return "Error"}
            if(octetPmValue>=65534){return "Deconnected sensor"}
            else{return {"value":octetPmValue, "unit":"ug/m3" }}
        }

        function pm_pcs_cm3(octetPmValue)
        {
            if(octetPmValue>=65535){return "Error"}
            if(octetPmValue>=65534){return "Deconnected sensor"}
            else{return {"value":octetPmValue, "unit":"pcs/cm3" }}
        }

        function pressure(octetPressureValue)
        {
            if(octetPressureValue>=65535){return "Error"}
            if(octetPressureValue>=65534){return "Deconnected sensor"}
            else{return {"value":octetPressureValue, "unit":"hPa" }}
        }

        function ozone(octetOzoneValue)
        {
            if(octetOzoneValue>=65535){return "Error"}
            if(octetOzoneValue>=65534){return "Deconnected sensor"}
            else{return {"value":octetOzoneValue, "unit":"ppb" }}
        }

        function no2(octetNO2Value)
        {
            if(octetNO2Value>=65535){return "Error"}
            if(octetNO2Value>=65534){return "Deconnected sensor"}
            else{return {"value":octetNO2Value, "unit":"ppb" }}
        }


        ///////////////////////////////////////////////
        // Product Status Message Function
        ///////////////////////////////////////////////

        

        function swRevision(octetSWRevision)
        {
           return parseFloat(((octetSWRevision*0.1).toFixed(1)))
        }

        function batteryVoltage(octetbatteryVoltage)
        {
            if(octetbatteryVoltage===65535){return "Error"}
            else{return {"value":octetbatteryVoltage, "unit":"mV" }}
        }

        function powerIn(octetPower)
        {
           return {"value":octetPower,"unit":"Wh"}
        }

        function batteryBalance(octetBattery)
        {
           return {"value":octetBattery-124,"unit":"Wh"}
        }

        function productOrientation(octetOrientation)
        {
            const message_name =["Correct orientation","Incorrect orientation","Information not available"]
            return message_name[octetOrientation]
        }

        function workingMode(octetWorking)
        {
            const message_name =["Normal","Low battery","Preservation mode"]
            return message_name[octetWorking]
        }

        function powerSource(octetPowerSource)
        {
            const message_name =["External(AC,DC or PV)","Internal battery"]
            return message_name[octetPowerSource]
        }


        ///////////////////////////////////////////////
        // Positionning Message Function
        ///////////////////////////////////////////////

        function degrees(octetDegrees)
        {
            return {"value":octetDegrees, "units":"°" }
        }

        function minutes(octetMinutes)
        {
            return {"value":octetMinutes, "units":"min" }
        }

        function seconds(octetSeconds)
        {
            return {"value":octetSeconds, "units":"s" }
        }

        function milliseconds(octetmilliseconds)
        {
            return {"value":octetmilliseconds*10, "units":"ms" }
        }

        function northSouth(octetNorth)
        {
            if(octetNorth==0){return "North"}
            if(octetNorth==1){return "South"}
        }

        function eastWest(octetEast)
        {
            if(octetEast==0){return "East"}
            if(octetEast==1){return "West"}
        }

        function hdop(octetHDOP)
        {
            if(octetHDOP<1){return "Very good"}
            if(octetHDOP<2){return "Medium"}
            else{return "Bad"}
        }

        function fixType(octetFix)
        {
            if(octetFix==0){return "No fix"}
            if(octetFix==1){return "GNSS fix"}
            if(octetFix==1){return "DGPS fix"}
        }
        
        ///////////////////////////////////////////////
        // Configuration Message Function
        ///////////////////////////////////////////////

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
    
        function calibrationActivation(octetCalibrationActivate)
        {
            if(octetCalibrationActivate===0){return "Automatic calibration desactivated"}
            else if(octetCalibrationActivate===1){return "Automatic calibration activated"};
        }

        
        function loraRegion(octetLoRaRegion)
        {
            const message_name =["Reserved","EU868","Reserved","Reserved","Reserved","Reserved","Reserved","Reserved","Reserved"]
            return message_name[octetLoRaRegion]
        }

        function period(octetPeriod)
        {
            return {"value":octetPeriod, "unit":"minutes"};
        }

        function measureMode(octetMeasure)
        {
            const message_name =["Periodic","Continuous"]
            return message_name[octetMeasure]
        }

        function timeZone(octetTime)
        {
            const message_name = [
                "UTC -12", "UTC -11", "UTC -10", "UTC -9", "UTC -8", "UTC -7", "UTC -6",
                "UTC -5", "UTC -4", "UTC -3", "UTC -2", "UTC -1", "UTC", "UTC +1",
                "UTC +2", "UTC +3", "UTC +4", "UTC +5", "UTC +6", "UTC +7", "UTC +8",
                "UTC +9", "UTC +10", "UTC +11", "UTC +12", "UTC +13", "UTC +14"
              ]
            return message_name[octetTime]
        }

        //////////////////////////////////////////////////////////////////////
        ////// Product message decoding
        ////////////////////////////////////////////////////////////////////

        function periodicDataOutput(stringHex)
        {
            let data = {}

            data.productType = typeOfProduct(parseInt(stringHex.substring(0,2),16));
            data.messageType = typeOfMessage(parseInt(stringHex.substring(2,4),16));

            let CHANNEL_PM_1_MASS = 0x01;
            let CHANNEL_PM_2_5_MASS = 0x02;
            let CHANNEL_PM_10_MASS = 0x03;
            let CHANNEL_PM_CHANNEL_2 = 0x04;
            let CHANNEL_PM_CHANNEL_3 = 0x05;
            let CHANNEL_PM_CHANNEL_5 = 0x06;
            let CHANNEL_TEMPERATURE = 0x07;
            let CHANNEL_HUMIDITY = 0x08;
            let CHANNEL_PRESSURE = 0x09;
            let CHANNEL_CO2 = 0x0A;
            let CHANNEL_PM_CHANNEL_1 = 0x13;
            let CHANNEL_PM_CHANNEL_4 = 0x14;
            let CHANNEL_PM_CHANNEL_4_centi = 0x15;
            let CHANNEL_PM_CHANNEL_5_centi = 0x16;
            let CHANNEL_OZONE = 0x17;
            let CHANNEL_NO2 = 0x18;

            let i = 0;
            let channel = 0;

            //looking for channel
            i = 4;
            while(i < stringHex.length){
           
                channel = (parseInt(stringHex.substring(i,i+2),16)) & 0xFF;

                switch (channel){
                    case CHANNEL_PM_1_MASS:
                        let data_pm1 = (parseInt(stringHex.substring(i+2,i+6),16)) & 0xFFFF;
                        data.pm1=pm_ug_m3(data_pm1)
                        break;
                    case CHANNEL_PM_2_5_MASS:
                        let data_pm2_5 = (parseInt(stringHex.substring(i+2,i+6),16)) & 0xFFFF;
                        data.pm2_5=pm_ug_m3(data_pm2_5)  
                        break;
                    case CHANNEL_PM_10_MASS:
                        let data_pm10 = (parseInt(stringHex.substring(i+2,i+6),16)) & 0xFFFF;
                        data.pm10=pm_ug_m3(data_pm10)   
                        break;
                    case CHANNEL_PM_CHANNEL_1:
                        let data_pm1_c = (parseInt(stringHex.substring(i+2,i+6),16)) & 0xFFFF;
                        data.pm1_c=pm_pcs_cm3(data_pm1_c)  
                        break;
                    case CHANNEL_PM_CHANNEL_2:
                        let data_pm2_5_c = (parseInt(stringHex.substring(i+2,i+6),16)) & 0xFFFF;
                        data.pm2_5_c=pm_pcs_cm3(data_pm2_5_c)   
                        break;
                    case CHANNEL_PM_CHANNEL_3:
                        let data_pm10_c = (parseInt(stringHex.substring(i+2,i+6),16)) & 0xFFFF;
                        data.pm10_c=pm_pcs_cm3(data_pm10_c)     
                        break;
                        
                    case CHANNEL_PM_CHANNEL_4:
                        let data_pm0_5_c = (parseInt(stringHex.substring(i+2,i+6),16)) & 0xFFFF;
                        data.pm0_5_c=pm_pcs_cm3(data_pm0_5_c)      
                        break;
                        
                    case CHANNEL_PM_CHANNEL_5:
                        let data_pm5_c = (parseInt(stringHex.substring(i+2,i+6),16)) & 0xFFFF;
                        data.pm5_c=pm_pcs_cm3(data_pm5_c)
                        break;
                        
                    case CHANNEL_TEMPERATURE:
                        let data_temperature = (parseInt(stringHex.substring(i+2,i+6),16)) & 0xFFFF;
                        data.temperature = temperature(data_temperature)
                        break;
                    
                    case CHANNEL_HUMIDITY:
                        let data_humidity = (parseInt(stringHex.substring(i+2,i+6),16)) & 0xFFFF;
                        data.humidity = humidity(data_humidity) 
                        break;    
                    
                    case CHANNEL_PRESSURE :
                        let data_pressure = (parseInt(stringHex.substring(i+2,i+6),16)) & 0xFFFF;
                        data.pressure=pressure(data_pressure)
                        break;   
                        
                    case CHANNEL_CO2 :
                        let data_co2 = (parseInt(stringHex.substring(i+2,i+6),16)) & 0xFFFF;
                        data.co2=co2(data_co2)
                        break;


                    case CHANNEL_PM_CHANNEL_4_centi :
                        let data_pm0_5_c_div_by_100 = (parseInt(stringHex.substring(i+2,i+6),16)) & 0xFFFF;
                        data.pm0_5_c_div_100=pm_pcs_cm3(data_pm0_5_c_div_100)/100
                        break;
                    
                    case CHANNEL_PM_CHANNEL_5:
                        let data_pm5_c_div_by_100 = (parseInt(stringHex.substring(i+2,i+6),16)) & 0xFFFF;
                        data.pm5_c_div_100=pm_pcs_cm3(data_pm5_c_div_100)/100
                        break;

                    case CHANNEL_ozone:
                        let data_ozone = (parseInt(stringHex.substring(i+2,i+6),16)) & 0xFFFF;
                        data.ozone=ozone(data_ozone)
                        break;

                    
                    case CHANNEL_NO2:
                        let data_no2 = (parseInt(stringHex.substring(i+2,i+6),16)) & 0xFFFF;
                        data.no2=ozone(data_no2)
                        break;
        
                }
                i = i+6; //1 byte command, 2 byte data
            }
            
            return data;
        }

        function productStatusDataOutput(stringHex)
        {
            let data = {}

            data_productType = parseInt(stringHex.substring(0,2),16);
            data_messageType = parseInt(stringHex.substring(2,4),16);
            data_hw_version = (parseInt(stringHex.substring(4,6),16)) & 0xFF;
            data_sw_version = (parseInt(stringHex.substring(6,8),16)) & 0xFF;
            data_battery_voltage = (parseInt(stringHex.substring(8,12),16)) & 0xFFFF;
            data_power_in = (parseInt(stringHex.substring(12,14),16)) & 0xFF;
            data_battery_balance = (((parseInt(stringHex.substring(14,16),16)) & 0xFF)-124);
            data_product_orientation = (parseInt(stringHex.substring(16,18),16)>>6) & 0x03;
            data_working_mode = (parseInt(stringHex.substring(16,18),16)>>4) & 0x03;
            data_power_source = (parseInt(stringHex.substring(16,18),16)>>3) & 0x01;

            data = {
                "productType":typeOfProduct(data_productType),
                "messageType":typeOfMessage(data_messageType),
                "hwVersion":data_hw_version,
                "swVersion":swRevision(data_sw_version),
                "batteryVoltage":batteryVoltage(data_battery_voltage),
                "powerIn":powerIn(data_power_in),
                "batteryBalance":batteryBalance(data_battery_balance),
                "productOrientation":productOrientation(data_product_orientation),
                "powerSource":powerSource(data_power_source)
            }
            return data;
        }

        function positionningDataOutput(stringHex)
        {
            let data ={}
            data_productType = parseInt(stringHex.substring(0,2),16);
            data_messageType = parseInt(stringHex.substring(2,4),16);
            data_lat_deg = (parseInt(stringHex.substring(4,6),16) >> 1) & 0x7F; 
            data_lat_min = (parseInt(stringHex.substring(4,8),16) >> 3) & 0x3F;
            data_lat_s = (parseInt(stringHex.substring(7,9),16) >> 1) & 0x3F;
            data_lat_ms = (parseInt(stringHex.substring(8,11),16) >> 2) & 0x7F;
            data_lat_north_south = (parseInt(stringHex.substring(10,11),16) >> 1) & 0x01;

            data_lon_deg = (parseInt(stringHex.substring(10,13),16) >> 1) & 0xFF;
            data_lon_min = (parseInt(stringHex.substring(12,15),16) >> 3) & 0x3F;
            data_lon_s = (parseInt(stringHex.substring(14,16),16) >> 1) & 0x3F;
            data_lon_ms = (parseInt(stringHex.substring(15,18),16) >> 2) & 0x7F;
            data_lon_east_west = (parseInt(stringHex.substring(16,18),16) >> 1) & 0x01;

            data_hdop = (parseInt(stringHex.substring(17,20),16) >> 2) & 0x7F;
            data_sat_number = (parseInt(stringHex.substring(19,21),16) >> 1) & 0x1F;
            data_fix_type = (parseInt(stringHex.substring(20,22),16) >> 3) & 0x03;
            
            data = {
                "productType":typeOfProduct(data_productType),
                "messageType":typeOfMessage(data_messageType),
                "latitudeDegrees":degrees(data_lat_deg),
                "latitudeMinutes":minutes(data_lat_min),
                "latitudeSeconds":seconds(data_lat_s),
                "latitudeMilliseconds":milliseconds(data_lat_ms),
                "latitudeNorthSouth":northSouth(data_lat_north_south),
                "longitudeDegrees":degrees(data_lon_deg),
                "longitudeMinutes":minutes(data_lon_min),
                "longitudeSeconds":seconds(data_lon_s),
                "longitudeMilliseconds":milliseconds(data_lon_ms),
                "longitudeEastWest":eastWest(data_lon_east_west),
                "HDOP":hdop(data_hdop),
                "satellitesNumber":data_sat_number,
                "fixType":fixType(data_fix_type), 
            }

            return data;
        }

        function productConfigurationDataOutput(stringHex)
        {
            data_productType = parseInt(stringHex.substring(0,2),16);
            data_messageType = parseInt(stringHex.substring(2,4),16);
            data_reconfiguration_source = (parseInt(stringHex.substring(4,5),16) >> 1) & 0x7; 
            data_reconfiguration_state = (parseInt(stringHex.substring(4,6),16) >> 3) & 0x3;
            data_CO2_autocalibration= (parseInt(stringHex.substring(5,6),16) >> 2) & 0x1;
            data_region= (parseInt(stringHex.substring(5,7),16) >> 2) & 0xF;
            data_measure_period = (parseInt(stringHex.substring(6,8),16)) & 0x3F;
            data_measure_mode = (parseInt(stringHex.substring(8,9),16) >> 3) & 0x1;
            data_time_zone = (parseInt(stringHex.substring(8,10),16)) & 0x1F;

            data={
                "productType":typeOfProduct(data_productType),
                "messageType":typeOfMessage(data_messageType),
                "reconfigurationSource":reconfigurationSource(data_reconfiguration_source),
                "reconfigurationState":reconfigurationState(data_reconfiguration_state),
                "co2Autocalibration":calibrationActivation(data_CO2_autocalibration),
                "region":loraRegion(data_region),
                "measurePeriod":period(data_measure_period),
                "measureMode":measureMode(data_measure_mode),
                "timeZone":timeZone(data_time_zone),
            }
            return data;
        }

        data=dataOutput(octetTypeMessage);
        return {data};
} // end of decoder