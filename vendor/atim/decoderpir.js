function decodeUplink(input) {
    let result = {historics: [],events: [],realTimes: []};

	var payload_tab = input.bytes;
	var payload = "";
	for (let i = 0; i < payload_tab.length; i++) {
		if(payload_tab[i] > 15){
			payload = payload + payload_tab[i].toString(16);
		}else{
			payload = payload + '0' + payload_tab[i].toString(16);
		}
	}
	var date = Date.now();
	date = new Date(date);
	var time = convertTimestamp(date);
	
	var frameType = parseInt(payload.substr(0,2),16); // Get the first byte fo the frame
	
	if(frameType == 50) // 50 = 0x32 = RTU classic frame, else it's a keep alive frame
	{

	        var alertType = parseInt(payload.substr(2,2),16); // 0x01 = Tamper switch -- 0x08 = Alarm -- 0x10 = count frame
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
	             
	             result.realTimes.push({tagRef: "p_count_0",timestamp: time,tagValue: String(parseInt(payload.substr(10,4),16))});
	             
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