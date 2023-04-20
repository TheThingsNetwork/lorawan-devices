function decodeStream (stream){
    
	// Init result
    let result = {historics: [],events: [],realTimes: []};

    // Parse stream
    let jsonStream = JSON.parse(stream);
	
	// Get time and payload
	let time = new Date((jsonStream.data.timestamp) * 1000)/1000;
	let payload = jsonStream.data.payload;
	
	// Save network informations
    result.realTimes.push({tagRef: "sys_data_payload",timestamp: time,tagValue: String(payload)});
	result.realTimes.push({tagRef: "sys_data_timestamp",timestamp: time,tagValue: String(time)});
	if(jsonStream.data != undefined)
	{
    	result.realTimes.push({tagRef: "sys_data_type",timestamp: time,tagValue: String(jsonStream.data.type)});
    	result.realTimes.push({tagRef: "sys_data_raw",timestamp: time,tagValue: String(jsonStream.data.raw)});
	}
	if(jsonStream.metadata != undefined)
	{
	    result.realTimes.push({tagRef: "sys_metadata_lastStreamTimestampUtc",timestamp: time,tagValue: String(jsonStream.metadata.lastStreamTimestampUtc)});
	    if(jsonStream.metadata.device != undefined)
	    {
        	result.realTimes.push({tagRef: "sys_device_sn",timestamp: time,tagValue: String(jsonStream.metadata.device.serialNumber)});
        	result.realTimes.push({tagRef: "sys_device_name",timestamp: time,tagValue: String(jsonStream.metadata.device.name)});
	    }
	    if(jsonStream.metadata.endpoint != undefined)
	    {
        	result.realTimes.push({tagRef: "sys_endpoint_name",timestamp: time,tagValue: String(jsonStream.metadata.endpoint.name)});
        	result.realTimes.push({tagRef: "sys_endpoint_type",timestamp: time,tagValue: String(jsonStream.metadata.endpoint.type)});
	    }
	    if(jsonStream.metadata.network != undefined)
	    {
        	result.realTimes.push({tagRef: "sys_network_port",timestamp: time,tagValue: String(jsonStream.metadata.network.port)});
        	result.realTimes.push({tagRef: "sys_network_linkQuality",timestamp: time,tagValue: String(jsonStream.metadata.network.linkQuality)});
	    }
	    if(jsonStream.metadata.location != undefined)
	    {
        	result.realTimes.push({tagRef: "sys_location_source",timestamp: time,tagValue: String(jsonStream.metadata.location.source)});
        	result.realTimes.push({tagRef: "sys_location_latitude",timestamp: time,tagValue: String(jsonStream.metadata.location.latitude)});
        	result.realTimes.push({tagRef: "sys_location_longitude",timestamp: time,tagValue: String(jsonStream.metadata.location.longitude)});
        	result.realTimes.push({tagRef: "sys_location_accuracy",timestamp: time,tagValue: String(jsonStream.metadata.location.accuracy)});
	    }
    }
		
	if(jsonStream.data.type != 3)
	{
	    // if KHEIRON
    	if(jsonStream.metadata.endpoint.type == 0)
    	{
        	result.realTimes.push({tagRef: "custom_data_raw_count",timestamp: time,tagValue: String(JSON.parse(jsonStream.data.raw).fcnt)});
    	}
    	// if SIGFOX
    	if(jsonStream.metadata.endpoint.type == 5)
    	{
        	result.realTimes.push({tagRef: "custom_data_raw_count",timestamp: time,tagValue: String(JSON.parse(jsonStream.data.raw).seqNumber)});
    	}
    	// if OBJENIOUS
    	if(jsonStream.metadata.endpoint.type == 6)
    	{
        	result.realTimes.push({tagRef: "custom_data_raw_count",timestamp: time,tagValue: String(JSON.parse(jsonStream.data.raw).count)});
        	result.realTimes.push({tagRef: "custom_data_raw_devEUI",timestamp: time,tagValue: String(JSON.parse(jsonStream.data.raw).device_properties.deveui)});
    	}
    	
    	// Get message ID
    	let msgStr = parseInt(payload.substring(0, 2),16);
	
	    
    	// Switch message ids
    	switch(msgStr) {
    		case 1  :{
    			// Get meter
    			let battery = parseInt(payload.substring(2, 6), 16);
    			
    			result.realTimes.push({
    				tagRef: "p_battery",
    				timestamp: time,
    				tagValue: String(battery/1000)
    			});
    			
    			break;
    		}case 3  :{
    			// Get data
    			let battery = parseInt(payload.substring(2, 4), 16);
    			let temperature = parseInt(payload.substring(4, 8), 16);
    			let humidity = parseInt(payload.substring(8, 12), 16);
    			
    			// check if negative value
    			if((temp >> 15) == 1)
    			{
    				let reverseValue = temp^65535;
    				temp = ((reverseValue+1)*-1);	  
    			}
    			
    			result.realTimes.push({
    				tagRef: "p_battery",
    				timestamp: time,
    				tagValue: String(battery)
    			});
    			result.realTimes.push({
    				tagRef: "p_temperature",
    				timestamp: time,
    				tagValue: String(temperature/100)
    			});
    			result.realTimes.push({
    				tagRef: "p_humidity",
    				timestamp: time,
    				tagValue: String(humidity/100)
    			});
    			break;
    		}case 5  :{
    			let testCounter = parseInt(payload.substring(2, 4), 16);
    			
    			result.realTimes.push({
    				tagRef: "p_test",
    				timestamp: time,
    				tagValue: String(testCounter)
    			});
    			
    			break;
    		}case 9  :{
    			// Get input
    			let di = parseInt(payload.substring(4, 6), 16);
    			let di1 = di & 1;
    			let di2 = (di & 2)==2;
    			
    			// get ouput
    			let dout = parseInt(payload.substring(2, 4), 16);
    			let do1 = dout & 1;
    			
    			result.realTimes.push({
    				tagRef: "p_DI1",
    				timestamp: time,
    				tagValue: String(di1)
    			});
    			
    			result.realTimes.push({
    				tagRef: "p_DI2",
    				timestamp: time,
    				tagValue: String(di2)
    			});
    			
    			result.realTimes.push({
    				tagRef: "p_DO1",
    				timestamp: time,
    				tagValue: String(do1)
    			});
    			
    			break;
    		}case 10  :{
    			// Get input
    			let di = parseInt(payload.substring(2, 4), 16);
    			let di1 = (di & 4)==4;
    			let di2 = (di & 8)==8;
    			let di3 = (di & 32)==32;
    			let di4 = (di & 128)==128;
    			
    			result.realTimes.push({
    				tagRef: "p_DI1",
    				timestamp: time,
    				tagValue: String(di1)
    			});
    			
    			result.realTimes.push({
    				tagRef: "p_DI2",
    				timestamp: time,
    				tagValue: String(di2)
    			});
    			
    			result.realTimes.push({
    				tagRef: "p_DI3",
    				timestamp: time,
    				tagValue: String(di3)
    			});
    			
    			result.realTimes.push({
    				tagRef: "p_DI4",
    				timestamp: time,
    				tagValue: String(di4)
    			});
    		}case 11  :{
    		}case 12  :{
    		}case 13  :{
    		}case 14  :{
    		}case 21  :{
    			// Get temperature
    			let temp = parseInt(payload.substring(2, 6), 16);
    			
    			// Decode
    			temp = (temp-33184)/128;
    			
    			result.realTimes.push({
    				tagRef: "p_temperature",
    				timestamp: time,
    				tagValue: String(temp)
    			});
    			break;
    		}case 20  :{
    			// Get meter
    			let meter1 = parseInt(payload.substring(4, 12), 16);
    			let meter2 = parseInt(payload.substring(12, 20), 16);
    			
    			result.realTimes.push({
    				tagRef: "p_wirecut",
    				timestamp: time,
    				tagValue: String((parseInt(payload.substring(2, 4), 16)&1)==1)
    			});
    			
    			result.realTimes.push({
    				tagRef: "p_count1",
    				timestamp: time,
    				tagValue: String(meter1)
    			});
    			
    			result.realTimes.push({
    				tagRef: "p_count2",
    				timestamp: time,
    				tagValue: String(meter2)
    			});
    			break;
    		}case 48  :{
    			// get realtime meter
    			let meter = parseInt(payload.substring(42, 50), 16);
    			result.realTimes.push({
    				tagRef: "p_count1",
    				timestamp: time,
    				tagValue: String(meter)
    			});
    			
    			// get historic meter
    			let meter1 = parseInt(payload.substring(34, 42), 16);
    			let meter2 = parseInt(payload.substring(26, 34), 16);
    			let meter3 = parseInt(payload.substring(18, 26), 16);
    			let meter4 = parseInt(payload.substring(10, 18), 16);
    			let meter5 = parseInt(payload.substring(2, 10), 16);
    			result.historics.push({
    				tagRef: "p_count1",
    				timestamp: new Date(time*1000-600000*1)/1000,
    				tagValue: String(meter1)
    			});
    			result.historics.push({
    				tagRef: "p_count1",
    				timestamp: new Date(time*1000-600000*2)/1000,
    				tagValue: String(meter2)
    			});
    			result.historics.push({
    				tagRef: "p_count1",
    				timestamp: new Date(time*1000-600000*3)/1000,
    				tagValue: String(meter3)
    			});
    			result.historics.push({
    				tagRef: "p_count1",
    				timestamp: new Date(time*1000-600000*4)/1000,
    				tagValue: String(meter4)
    			});
    			result.historics.push({
    				tagRef: "p_count1",
    				timestamp: new Date(time*1000-600000*5)/1000,
    				tagValue: String(meter5)
    			});
    			
    			break;
    		}case 49  :{
    			// get realtime meter
    			let meter = parseInt(payload.substring(2, 10), 16);
    			result.realTimes.push({
    				tagRef: "p_count1",
    				timestamp: time,
    				tagValue: String(meter)
    			});
    			break;
    		}case 55  :{
    			result.realTimes.push({
    				tagRef: "p_wirecut",
    				timestamp: time,
    				tagValue: String((parseInt(payload.substring(2, 4), 16)&1)==1)
    			});
    			break;
    		}case 57  :{
    			// get realtime meter
    			let meter1 = parseInt(payload.substring(2, 7), 16);
    			result.realTimes.push({
    				tagRef: "p_count1",
    				timestamp: time,
    				tagValue: String(meter1)
    			});
    			
    			// get historic meter
    			for(let i=0;i<5;i++)
    			{
    				// remove delta from reference meter
    				meter1 -= parseInt(payload.substring(7+(i*3), 10+(i*3)), 16);
    				
    				let a = new Date(time*1000);
    				
    				// add to historics (remove 10min to the date of the reference meter)
    				result.historics.push({
    					tagRef: "p_count1",
    					timestamp: new Date(time*1000-(600000+(i*600000)))/1000,
    					tagValue: String(meter1)
    				});
    			}
    			break;
    		}case 58  :{
    			// get realtime meter
    			let meter1 = parseInt(payload.substring(2, 7), 16);
    			result.realTimes.push({
    				tagRef: "p_count1",
    				timestamp: time,
    				tagValue: String(meter1)
    			});
    			
    			// get historic meter
    			for(let i=0;i<5;i++)
    			{
    				// remove delta from reference meter
    				meter1 -= parseInt(payload.substring(7+(i*3), 10+(i*3)), 16);
    				
    				// add to historics (remove 10min to the date of the reference meter)
    				result.historics.push({
    					tagRef: "p_count1",
    					timestamp: new Date(time*1000-(1800000+(i*1800000)))/1000,
    					tagValue: String(meter1)
    				});
    			}
    			break;
    		}case 59  :{
    			// get realtime meter
    			let meter1 = parseInt(payload.substring(2, 7), 16);
    			result.realTimes.push({
    				tagRef: "p_count1",
    				timestamp: time,
    				tagValue: String(meter1)
    			});
    			
    			// get historic meter
    			for(let i=0;i<5;i++)
    			{
    				// remove delta from reference meter
    				meter1 -= parseInt(payload.substring(7+(i*3), 10+(i*3)), 16);
    				
    				// add to historics (remove 10min to the date of the reference meter)
    				result.historics.push({
    					tagRef: "p_count1",
    					timestamp: new Date(time*1000-(3600000+(i*3600000)))/1000,
    					tagValue: String(meter1)
    				});
    			}
    			break;
    		}case 22  :{// Get meter
    			// Get input
    			let di = parseInt(payload.substring(2, 4), 16);
    			let di1 = (di & 4)==4;
    			let di2 = (di & 8)==8;
    			let di3 = (di & 32)==32;
    			let di4 = (di & 128)==128;
    			
    			result.realTimes.push({
    				tagRef: "p_DI1",
    				timestamp: time,
    				tagValue: String(di1)
    			});
    			
    			result.realTimes.push({
    				tagRef: "p_DI2",
    				timestamp: time,
    				tagValue: String(di2)
    			});
    			
    			result.realTimes.push({
    				tagRef: "p_DI3",
    				timestamp: time,
    				tagValue: String(di3)
    			});
    			
    			result.realTimes.push({
    				tagRef: "p_DI4",
    				timestamp: time,
    				tagValue: String(di4)
    			});
    		
    			let meter1 = parseInt(payload.substring(4, 12), 16);
    			let meter2 = parseInt(payload.substring(12, 20), 16);
    			
    			result.realTimes.push({
    				tagRef: "p_wirecut",
    				timestamp: time,
    				tagValue: String((parseInt(payload.substring(4, 6), 16)&1)==1)
    			});
    			
    			result.realTimes.push({
    				tagRef: "p_count1",
    				timestamp: time,
    				tagValue: String(meter1)
    			});
    			
    			result.realTimes.push({
    				tagRef: "p_count2",
    				timestamp: time,
    				tagValue: String(meter2)
    			});
    			break;
    		}case 15  :{
    		}case 16  :{
    		}case 17  :{
    		}case 18  :{
    		}case 23  :{
    			// Get temperature & humidity
    			let temp = parseInt(payload.substring(2, 6), 16);
    			let humidity = parseInt(payload.substring(6, 10), 16);
    			
    			// Decode
    			temp = ((temp*175.72)/65536)-46.85
    			humidity = ((humidity*125)/65536)-6
    			
    			result.realTimes.push({
    				tagRef: "p_temperature",
    				timestamp: time,
    				tagValue: String(temp)
    			});
    			
    			result.realTimes.push({
    				tagRef: "p_humidity",
    				timestamp: time,
    				tagValue: String(humidity)
    			});
    			break;
    		}case 24  :{
    		}case 30  :{
    		}case 31  :{
    		}case 32  :{
    		}case 33  :{
    			// Get input
    			let di = parseInt(payload.substring(2, 4), 16);
    			let di1 = (di & 32)==32;
    			let di2 = (di & 16)==16;
    			
    			result.realTimes.push({
    				tagRef: "p_DI1",
    				timestamp: time,
    				tagValue: String(di1)
    			});
    			
    			result.realTimes.push({
    				tagRef: "p_DI2",
    				timestamp: time,
    				tagValue: String(di2)
    			});
    			
    			// Get ana
    			let ana = parseInt(payload.substring(4, 8), 16);
    			
    			// Decode
    			ana = (ana*(10/64240))
    			
    			result.realTimes.push({
    				tagRef: "p_voltage",
    				timestamp: time,
    				tagValue: String(ana)
    			});
    			break;
    		}case 25  :{
    		}case 34  :{
    		}case 35  :{
    		}case 36  :{
    		}case 37  :{
    			// Get input
    			let di = parseInt(payload.substring(2, 4), 16);
    			let di1 = (di & 32)==32;
    			let di2 = (di & 16)==16;
    			
    			result.realTimes.push({
    				tagRef: "p_DI1",
    				timestamp: time,
    				tagValue: String(di1)
    			});
    			
    			result.realTimes.push({
    				tagRef: "p_DI2",
    				timestamp: time,
    				tagValue: String(di2)
    			});
    			
    			// Get ana
    			let ana = parseInt(payload.substring(4, 8), 16);
    			
    			// Decode
    			ana = (ana*(16/47584))
    			result.realTimes.push({
    				tagRef: "p_current",
    				timestamp: time,
    				tagValue: String(ana)
    			});
    			break;
    		}case 27  :{
    		}case 42  :{
    		}case 43  :{
    		}case 44  :{
    		}case 45  :{
    			// Get temperature
    			let temp = parseInt(payload.substring(2, 6), 16);
    			
    			// check if error
    			if(temp != 32768)
    			{			
    				// check if negative value
    				if((temp >> 15) == 1)
    				{
    					let reverseValue = temp^65535;
    					temp = ((reverseValue+1)*-1);
    				}
    				
    				// apply coef
    				temp = temp*0.0625;
    				
    				// save
    				result.realTimes.push({
    					tagRef: "p_temperature",
    					timestamp: time,
    					tagValue: String(temp)
    				});
    			}
    			break;
    		}case 26  :{
    		}case 38  :{
    		}case 39  :{
    		}case 40  :{
    		}case 41  :{
    		}case 83  :{
    		}case 84  :{
    		}case 85  :{
    		}case 86  :{
    		}case 87  :{
    		}case 88  :{
    		}case 89  :{
    		}case 90  :{
    		}case 91  :{
    			// Get temperature
    			let temp = parseInt(payload.substring(2, 6), 16);
    			let temp2 = parseInt(payload.substring(6, 10), 16);
    			
    			// check if error
    			if(temp != 32768)
    			{			
    				// check if negative value
    				if((temp >> 15) == 1)
    				{
    					let reverseValue = temp^65535;
    					temp = ((reverseValue+1)*-1);	  
    				}
    				
    				// apply coef
    				temp = temp*0.0625;
    				
    				// save
    				result.realTimes.push({
    					tagRef: "p_temperature",
    					timestamp: time,
    					tagValue: String(temp)
    				});
    			}
    			
    			// check if error
    			if(temp2 != 32768)
    			{			
    				// check if negative value
    				if((temp2 >> 15) == 1)
    				{
    					let reverseValue = temp^65535;
    					temp2 = ((reverseValue+1)*-1);
    				}
    				
    				// apply coef
    				temp2 = temp2*0.0625;
    				
    				// save
    				result.realTimes.push({
    					tagRef: "p_temperature2",
    					timestamp: time,
    					tagValue: String(temp2)
    				});
    			}
    			
    			break;
    		}case 19  :{
    		    // Get water leak state
    			let waterleak = parseInt(payload.substring(4, 6), 16);
    			
    			// save
    			result.realTimes.push({
    				tagRef: "p_waterLeak",
    				timestamp: time,
    				tagValue: String(waterleak)
    			});
    		    break;
    		}case 47  :{
    			// get temperature
    			let temp = parseInt(payload.substring(14, 18),16);
    			let p_temperature = ((10.888 - (Math.sqrt(Math.pow(-10.888,2)+(4*0.00347*(1777.3-temp)))))/(2*-0.00347))+30;
    			
    			// save
    			result.realTimes.push({
    				tagRef: "p_temperature",
    				timestamp: time,
    				tagValue: String(p_temperature)
    			});
    			
    			if(parseInt(payload.substring(18, 34),16) != 0)
    			{
    				// get data for gps decoding
    				let a = parseInt(payload.substring(18, 20),16)>>4;
    				let b = ((parseInt(payload.substring(18, 20),16)<<4)&255)>>4;
    				let c = parseInt(payload.substring(20, 22),16)>>4;
    				let d = ((parseInt(payload.substring(20, 22),16)<<4)&255)>>4;
    				let e = parseInt(payload.substring(22, 24),16)>>4;
    				let f = ((parseInt(payload.substring(22, 24),16)<<4)&255)>>4;
    				let g = parseInt(payload.substring(24, 26),16)>>4;
    				let h = ((parseInt(payload.substring(24, 26),16)<<4)&255)>>4;
    				let i = parseInt(payload.substring(26, 28),16)>>4;
    				let j = ((parseInt(payload.substring(26, 28),16)<<4)&255)>>4;
    				let k = parseInt(payload.substring(28, 30),16)>>4;
    				let l = ((parseInt(payload.substring(28, 30),16)<<4)&255)>>4;
    				let m = parseInt(payload.substring(30, 32),16)>>4;
    				let n = ((parseInt(payload.substring(30, 32),16)<<4)&255)>>4;
    				let o = parseInt(payload.substring(32, 34),16)>>4;
    				let p = ((parseInt(payload.substring(32, 34),16)<<4)&255)>>6;
    				let q = ((parseInt(payload.substring(32, 34),16)<<6)&255)>>7;
    				let r = ((parseInt(payload.substring(32, 34),16)<<7)&255)>>7;
    				
    				// get latitude and longitude
    				let latitude = (2*q-1)*(10*a+b+c/6+d/60+e/600+f/6000+g/60000);
    				let longitude = (2*r-1)*(100*h+10*i+j+k/6+l/60+m/600+n/6000+o/60000);
    				
    				// save
    				result.realTimes.push({
    					tagRef: "p_latitude",
    					timestamp: time,
    					tagValue: String(latitude)
    				});
    				result.realTimes.push({
    					tagRef: "p_longitude",
    					timestamp: time,
    					tagValue: String(longitude)
    				});
    			}
    			
    		break;
    		}case 50  :{
    			let p_vibration = parseInt(payload.substring(4, 6),16);
    			let p_ils = parseInt(payload.substring(6, 8),16);;
    			let p_temperature = (2103-parseInt(payload.substring(8, 12),16))/10.9;
    			
    			// save
    			result.realTimes.push({
    				tagRef: "p_vibration",
    				timestamp: time,
    				tagValue: String(p_vibration)
    			});
    			result.realTimes.push({
    				tagRef: "p_ils",
    				timestamp: time,
    				tagValue: String(p_ils)
    			});
    			result.realTimes.push({
    				tagRef: "p_temperature",
    				timestamp: time,
    				tagValue: String(p_temperature)
    			});
    			break;
    		}case 51  :{
    			// get DI
    			result.realTimes.push({
    				tagRef: "p_DI1",
    				timestamp: time,
    				tagValue: String((parseInt(payload.substring(2, 4),16)&1)==1)
    			});
    			result.realTimes.push({
    				tagRef: "p_DI2",
    				timestamp: time,
    				tagValue: String((parseInt(payload.substring(2, 4),16)&2)==2)
    			});
    			break;
    		}case 52  :{
    			// get DI
    			result.realTimes.push({
    				tagRef: "p_DI1",
    				timestamp: time,
    				tagValue: String((parseInt(payload.substring(2, 4),16)&1)==1)
    			});
    			result.realTimes.push({
    				tagRef: "p_DI2",
    				timestamp: time,
    				tagValue: String((parseInt(payload.substring(2, 4),16)&2)==2)
    			});
    			
    			// get count
    			result.realTimes.push({
    				tagRef: "p_count1",
    				timestamp: time,
    				tagValue: String(parseInt(payload.substring(4, 12),16))
    			});
    			result.realTimes.push({
    				tagRef: "p_count2",
    				timestamp: time,
    				tagValue: String(parseInt(payload.substring(12, 20),16))
    			});
    			break;
    		}case 53  :{
    			// get DI
    			result.realTimes.push({
    				tagRef: "p_DI1",
    				timestamp: time,
    				tagValue: String((parseInt(payload.substring(2, 4),16)&1)==1)
    			});
    			result.realTimes.push({
    				tagRef: "p_DI2",
    				timestamp: time,
    				tagValue: String((parseInt(payload.substring(2, 4),16)&2)==2)
    			});
    			
    			// get ana
    			result.realTimes.push({
    				tagRef: "p_analogic1",
    				timestamp: time,
    				tagValue: String(parseInt(payload.substring(6, 10),16)*20/4095)
    			});
    			result.realTimes.push({
    				tagRef: "p_analogic2",
    				timestamp: time,
    				tagValue: String(parseInt(payload.substring(10, 14),16)*20/4095)
    			});
    			result.realTimes.push({
    				tagRef: "p_analogic3",
    				timestamp: time,
    				tagValue: String(parseInt(payload.substring(14, 18),16)*20/4095)
    			});
    			result.realTimes.push({
    				tagRef: "p_analogic4",
    				timestamp: time,
    				tagValue: String(parseInt(payload.substring(18, 22),16)*20/4095)
    			});
    			break;
    		}case 54  :{
    			// get DI
    			result.realTimes.push({
    				tagRef: "p_DI1",
    				timestamp: time,
    				tagValue: String((parseInt(payload.substring(2, 4),16)&1)==1)
    			});
    			result.realTimes.push({
    				tagRef: "p_DI2",
    				timestamp: time,
    				tagValue: String((parseInt(payload.substring(2, 4),16)&2)==2)
    			});
    			
    			// get ana
    			result.realTimes.push({
    				tagRef: "p_analogic1",
    				timestamp: time,
    				tagValue: String(parseInt(payload.substring(6, 10),16)*20/4095)
    			});
    			result.realTimes.push({
    				tagRef: "p_analogic2",
    				timestamp: time,
    				tagValue: String(parseInt(payload.substring(10, 14),16)*20/4095)
    			});
    			result.realTimes.push({
    				tagRef: "p_analogic3",
    				timestamp: time,
    				tagValue: String(parseInt(payload.substring(14, 18),16)*20/4095)
    			});
    			result.realTimes.push({
    				tagRef: "p_analogic4",
    				timestamp: time,
    				tagValue: String(parseInt(payload.substring(18, 22),16)*20/4095)
    			});
    			break;
    		}case 62  :{
    			// Get Absence
    			result.realTimes.push({
    				tagRef: "p_presence",
    				timestamp: time,
    				tagValue: String(0)
    			});	
    		
    			// get values
    			let valueNorV = parseInt(payload.substring(2,6),16);
    			let valueMorY = parseInt(payload.substring(6,10),16);
    			let valueWorZ = parseInt(payload.substring(10,14),16);
    			
    			// Save NorV
    			result.realTimes.push({
    				tagRef: "p_NorV",
    				timestamp: time,
    				tagValue: String(valueNorV)
    			});
    			
    			// Save MorY
    			result.realTimes.push({
    				tagRef: "p_MorY",
    				timestamp: time,
    				tagValue: String(valueMorY)
    			});	
    			
    			// Save WorZ
    			result.realTimes.push({
    				tagRef: "p_WorZ",
    				timestamp: time,
    				tagValue: String(valueWorZ)
    			});
    			break;
    		}case 63  :{
    			// Get Presence
    			result.realTimes.push({
    				tagRef: "p_presence",
    				timestamp: time,
    				tagValue: String(1)
    			});	
    			
    			// get values
    			let valueNorV = parseInt(payload.substring(2,6),16);
    			let valueMorY = parseInt(payload.substring(6,10),16);
    		
    			// Save NorV
    			result.realTimes.push({
    				tagRef: "p_NorV",
    				timestamp: time,
    				tagValue: String(valueNorV)
    			});
    			
    			// Save MorY
    			result.realTimes.push({
    				tagRef: "p_MorY",
    				timestamp: time,
    				tagValue: String(valueMorY)
    			});
    			break;
    		}case 65  :{
    			// get digital input
    			let di = parseInt(payload.substring(4, 6)+payload.substring(2, 4), 16);
    			
    			// init coef
    			let coef = 1;
    			
    			for (let i=1;i<17;i++)
    			{
    				// save
    				result.realTimes.push({
    					tagRef: "p_DI"+i,
    					timestamp: time,
    					tagValue: String((di & coef)==coef)
    				});
    				
    				coef = coef*2;
    			}
    			
    			// get temperature
    			let temp = parseInt(payload.substring(6, 10), 16);
    			
    			// check if negative value
    			if((temp >> 15) == 1)
    			{
    				let reverseValue = temp^65535;
    				temp = ((reverseValue+1)*-1);	  
    			}
    			
    			// save
    			result.realTimes.push({
    				tagRef: "p_temperature",
    				timestamp: time,
    				tagValue: String(temp/10)
    			});
    			
    			break;
    		}case 66  :{
    			// get digital input
    			let di = parseInt(payload.substring(4, 6)+payload.substring(2, 4), 16);
    			
    			// init coef
    			let coef = 1;
    			
    			for (let i=1;i<17;i++)
    			{
    				// save
    				result.realTimes.push({
    					tagRef: "p_DI"+i,
    					timestamp: time,
    					tagValue: String((di & coef)==coef)
    				});
    				
    				coef = coef*2;
    			}
    			
    			break;
    		}case 67  :{
    			// save
    			result.events.push({
    				tagRef: "p_choc_alm",
    				timestamp: time-1,
    				tagValue: String(1),
    				context:[]
    			});
    			result.events.push({
    				tagRef: "p_choc_alm",
    				timestamp: time,
    				tagValue: String(0),
    				context:[]
    			});
    			break;
    		}case 78  :{
    			// get digital input
    			let di = parseInt(payload.substring(4, 6)+payload.substring(2, 4), 16);
    			// init coef
    			let coef = 1;
    			
    			for (let i=1;i<17;i++)
    			{
    				// save
    				result.realTimes.push({
    					tagRef: "p_DI"+i,
    					timestamp: time,
    					tagValue: String((di & coef)==coef)
    				});
    				
    				// multiply coef by 2
    				coef = coef*2;
    			}
    			
    			// get temperature
    			let temp = parseInt(payload.substring(6, 10), 16);
    			
    			// check if negative value
    			if((temp >> 15) == 1)
    			{
    				let reverseValue = temp^65535;
    				temp = ((reverseValue+1)*-1);	  
    			}
    			
    			// save
    			result.realTimes.push({
    				tagRef: "p_temperature",
    				timestamp: time,
    				tagValue: String(temp/10)
    			});
    			
    			// get count 1
    			let count1 = parseInt(payload.substring(10, 18), 16);
    			// save
    			result.realTimes.push({
    				tagRef: "p_count1",
    				timestamp: time,
    				tagValue: String(count1)
    			});
    			break;
    		}case 79  :{
    			// get digital input
    			let di = parseInt(payload.substring(4, 6)+payload.substring(2, 4), 16);
    			// init coef
    			let coef = 1;
    			
    			for (let i=1;i<17;i++)
    			{
    				// save
    				result.realTimes.push({
    					tagRef: "p_DI"+i,
    					timestamp: time,
    					tagValue: String((di & coef)==coef)
    				});
    				
    				// multiply coef by 2
    				coef = coef*2;
    			}
    			
    			// get count 1
    			let count1 = parseInt(payload.substring(6, 14), 16);
    			// save
    			result.realTimes.push({
    				tagRef: "p_count1",
    				timestamp: time,
    				tagValue: String(count1)
    			});
    			
    			// get count 2
    			let count2 = parseInt(payload.substring(14, 22), 16);
    			// save
    			result.realTimes.push({
    				tagRef: "p_count2",
    				timestamp: time,
    				tagValue: String(count2)
    			});
    			break;
    		}case 80  :{			
    			// get count 1
    			let count1 = parseInt(payload.substring(2, 10), 16);
    			// save
    			result.realTimes.push({
    				tagRef: "p_count1",
    				timestamp: time,
    				tagValue: String(count1)
    			});
    			
    			// get count 2
    			let count2 = parseInt(payload.substring(10, 18), 16);
    			// save
    			result.realTimes.push({
    				tagRef: "p_count2",
    				timestamp: time,
    				tagValue: String(count2)
    			});
    			break;
    		}case 81  :{	
    			// get count 3
    			let count3 = parseInt(payload.substring(2, 10), 16);
    			// save
    			result.realTimes.push({
    				tagRef: "p_count3",
    				timestamp: time,
    				tagValue: String(count3)
    			});
    			
    			// get count 4
    			let count4 = parseInt(payload.substring(10, 18), 16);
    			// save
    			result.realTimes.push({
    				tagRef: "p_count4",
    				timestamp: time,
    				tagValue: String(count4)
    			});
    			break;
    		}case 82  :{
    			// get digital input
    			let di = parseInt(payload.substring(4, 6)+payload.substring(2, 4), 16);
    			// init coef
    			let coef = 1;
    			
    			for (let i=1;i<17;i++)
    			{
    				// save
    				result.realTimes.push({
    					tagRef: "p_DI"+i,
    					timestamp: time,
    					tagValue: String((di & coef)==coef)
    				});
    				
    				// multiply coef by 2
    				coef = coef*2;
    			}
    			
    			// get count 1
    			let count1 = parseInt(payload.substring(6, 14), 16);
    			// save
    			result.realTimes.push({
    				tagRef: "p_count1",
    				timestamp: time,
    				tagValue: String(count1)
    			});
    			break;
    		
    		}case 93  :{
    			// get digital input
    			let di = parseInt(payload.substring(4, 6)+payload.substring(2, 4), 16);
    			// init coef
    			let coef = 1;
    			
    			for (let i=1;i<17;i++)
    			{
    				// save
    				result.realTimes.push({
    					tagRef: "p_DI"+i,
    					timestamp: time,
    					tagValue: String((di & coef)==coef)
    				});
    				
    				// multiply coef by 2
    				coef = coef*2;
    			}
    			
    			// get temperature
    			let temp = parseInt(payload.substring(6, 10), 16);
    			
    			// check if negative value
    			if((temp >> 15) == 1)
    			{
    				let reverseValue = temp^65535;
    				temp = ((reverseValue+1)*-1);	  
    			}
    			
    			// save
    			result.realTimes.push({
    				tagRef: "p_temperature",
    				timestamp: time,
    				tagValue: String(temp/10)
    			});
    			
    			for (let j=1;j<9;j++)
    			{
    				// save
    				result.realTimes.push({
    					tagRef: "p_count"+j,
    					timestamp: time,
    					tagValue: String(parseInt(payload.substring(2+(8*j), 10+(8*j)), 16))
    				});
    			}
    			break;
    		}case 94  :{
    			// get digital input
    			let di = parseInt(payload.substring(4, 6)+payload.substring(2, 4), 16);
    			// init coef
    			let coef = 1;
    			
    			for (let i=1;i<17;i++)
    			{
    				// save
    				result.realTimes.push({
    					tagRef: "p_DI"+i,
    					timestamp: time,
    					tagValue: String((di & coef)==coef)
    				});
    				
    				// multiply coef by 2
    				coef = coef*2;
    			}
    			
    			for (let j=1;j<9;j++)
    			{
    				// save
    				result.realTimes.push({
    					tagRef: "p_count"+j,
    					timestamp: time,
    					tagValue: String(parseInt(payload.substring(-6+(8*j), 2+(8*j)), 16))
    				});
    			}
    			break;
    		}case 95  :{
    			// get count 5
    			let count5 = parseInt(payload.substring(2, 10), 16);
    			// save
    			result.realTimes.push({
    				tagRef: "p_count5",
    				timestamp: time,
    				tagValue: String(count5)
    			});
    			
    			// get count 6
    			let count6 = parseInt(payload.substring(10, 18), 16);
    			// save
    			result.realTimes.push({
    				tagRef: "p_count6",
    				timestamp: time,
    				tagValue: String(count6)
    			});
    			break;
    		}case 96  :{
    			// get count 7
    			let count7 = parseInt(payload.substring(2, 10), 16);
    			// save
    			result.realTimes.push({
    				tagRef: "p_count7",
    				timestamp: time,
    				tagValue: String(count7)
    			});
    			
    			// get count 8
    			let count8 = parseInt(payload.substring(10, 18), 16);
    			// save
    			result.realTimes.push({
    				tagRef: "p_count8",
    				timestamp: time,
    				tagValue: String(count8)
    			});
    			break;
    			
    		}case 2  :{
    		}case 4  :{
    		}case 6  :{
    		}case 7  :{
    		}case 8  :{
    		}case 46  :{
    		}case 56  :{
    		}case 60  :{
    		}case 61  :{
    		}case 64  :{
    		}case 68  :{
    		}case 69  :{
    		}case 70  :{
    		}case 71  :{
    		}case 72  :{
    		}case 73  :{
    		}case 74  :{
    		}case 75  :{
    		}case 76  :{
    		}case 77  :{
    		}case 92  :{
    		}case 95  :{
    		}case 96  :{
    		}case 97  :{
    		}case 98  :{
    		}case 99  :{
    		}default:
    			break;
    	}
	}
	
	// Return result
	return result;
}