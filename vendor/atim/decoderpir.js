	var frameType = parseInt(jsonStream.data.payload.substr(0,2),16); // Get the first byte fo the frame
	
	if(frameType == 50) // 50 = 0x32 = RTU classic frame, else it's a keep alive frame
	{

	        var alertType = parseInt(jsonStream.data.payload.substr(2,2),16); // 0x01 = Tamper switch -- 0x08 = Alarm -- 0x10 = count frame
	        if(alertType == 1 ) // Tamper
	        {
	            
	            
	    
	            // set Tamper to 1
	             result.events.push({
	                 tagRef: "p_DI2_0",
	                 timestamp: time,
	                 tagValue: String(parseInt(1)),
	                 context:[]
	                 
	             });
	            result.events.push({
	                 tagRef: "p_DI2_0",
	                 timestamp: time+1,
	                 tagValue: String(parseInt(0)),
	                 context:[]
	                 
	             });
	            // result.events.push({tagRef: "p_pir_alarm",timestamp: time,tagValue: 0});
	        }
	        else if(alertType == 16) // = 0x10 Count frame
	        {
	           
	           //  result.events.push({tagRef: "p_pir_alarm",timestamp: time,tagValue: 0});
	             
	             //add count index
	             
	             result.realTimes.push({tagRef: "p_count_0",timestamp: time,tagValue: String(parseInt(jsonStream.data.payload.substr(10,4),16))});
	             
	        }
	        else if(alertType == 8)
	        {
	              // set Tamper to 0
	            
	            
	              result.events.push({
	                 tagRef: "p_pir_alarm",
	                 timestamp: time,
	                 tagValue: String(parseInt(1)),
	                 context:[]
	                 
	             });
	               result.events.push({
	                 tagRef: "p_pir_alarm",
	                 timestamp: time+1,
	                 tagValue: String(parseInt(0)),
	                 context:[]
	                 
	             });
	        }
	        else
	        {
	           
	        
	      
	            
	        }
	        
	        
	    	
	}
	if(frameType == 01)
	{
	    	let battery = parseInt(payload.substring(2, 6), 16);
        			
        			result.realTimes.push({
        				tagRef: "p_battery",
        				timestamp: time,
        				tagValue: String(battery/1000)
        	});
	}
	


	
	// return result
	return result;