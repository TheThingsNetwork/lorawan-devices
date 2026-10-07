function decodeUplink(input) { 
var bytes = input.bytes; 
var data = {}; 
var idx = 0;  

// 1. UNIX Timestamp (4 bytes) - When the data was updated 
data.timestamp = (bytes[idx] | bytes[idx+1]<<8 | bytes[idx+2]<<16 | bytes[idx+3]<<24); 
idx += 4;  

// 2. Status / Alarms (1 byte) 
data.status_code = bytes[idx]; 
idx += 1;  

// 3. Current Integral Volume (4 bytes, in cubic meters m³) 
data.current_volume = (bytes[idx] | bytes[idx+1]<<8 | bytes[idx+2]<<16 | bytes[idx+3]<<24) / 1000; 
idx += 4;  

// 4. Log Date/Time (4 bytes) - Start time of historical deltas 
data.log_timestamp = (bytes[idx] | bytes[idx+1]<<8 | bytes[idx+2]<<16 | bytes[idx+3]<<24); 
idx += 4;  

// 5. Volume at Log Date/Time (4 bytes) 
data.log_volume = (bytes[idx] | bytes[idx+1]<<8 | bytes[idx+2]<<16 | bytes[idx+3]<<24) / 1000; 
idx += 4;  

// 6. Historical Delta Volumes (2 bytes per interval, in liters) 
// The meter sends delta volumes to reconstruct historical hourly/daily usage 
data.delta_volumes = []; 
var deltaIndex = 1; 
while (idx + 1 < bytes.length) { 
// Stop parsing if we hit the padding byte (0x2F) 
if (bytes[idx] === 0x2F && bytes[idx+1] === 0x00) { 
break; 
} 
var delta = (bytes[idx] | bytes[idx+1]<<8); 
data.delta_volumes.push({ 
"interval": deltaIndex++, 
"volume_liters": delta 
}); 
idx += 2; 
}  

return { 
data: data 
}; 
} 