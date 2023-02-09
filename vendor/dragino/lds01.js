function decodeUplink(input) {
  var port = input.fPort;
  var bytes = input.bytes;
  var value=(bytes[0]<<8 | bytes[1])&0x3FFF;
  var bat=value/1000;//Battery,units:V
  
  var door_open_status=bytes[0]&0x80?1:0;//1:open,0:close
  var water_leak_status=bytes[0]&0x40?1:0;
  
  var mod=bytes[2];
  var alarm=bytes[9]&0x01;
  var data = {};
  	 switch (input.fPort) {
		 case 10:
  if(mod==1){
    var open_times=bytes[3]<<16 | bytes[4]<<8 | bytes[5];
    var open_duration=bytes[6]<<16 | bytes[7]<<8 | bytes[8];//units:min
      data.BAT_V=bat,
      data.MOD=mod,
      data.DOOR_OPEN_STATUS=door_open_status,
      data.DOOR_OPEN_TIMES=open_times,
      data.LAST_DOOR_OPEN_DURATION=open_duration,
     data.ALARM=alarm
    
  }
  else if(mod==2)
  {
  var leak_times=bytes[3]<<16 | bytes[4]<<8 | bytes[5];
  var leak_duration=bytes[6]<<16 | bytes[7]<<8 | bytes[8];//units:min
      data.BAT_V=bat,
      data.MOD=mod,
      data.WATER_LEAK_STATUS=water_leak_status,
      data.WATER_LEAK_TIMES=leak_times,
      data.LAST_WATER_LEAK_DURATION=leak_duration
  }
  else if(mod==3)
  {
      data.BAT_V=bat,
      data.MOD=mod,
      data.DOOR_OPEN_STATUS=door_open_status,
      data.WATER_LEAK_STATUS=water_leak_status,
      data.ALARM=alarm

  }
  else{
      data.BAT_V=bat,
      data.MOD=mod
  }
  return {
      data: data,
    }
	default:
    return {
      errors: ["unknown FPort"]
    }
}
}
