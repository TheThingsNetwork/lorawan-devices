//LW004-PB_V3 Payload Decoder rule
//Creation time:2022-07-22 
//Creator:taojianfeng
//Suitable firmware versions:LW004-PB V3.0.4 
//Programming languages:Javascript
//Suitable platforms:TTN

var packet_type = ["event","sys_open","sys_close","heart","low_battery","work_gps_fix_success","work_gps_fix_false","work_ble_fix_success","work_ble_fix_false","helper_gps_fix_success","helper_gps_fix_false","helper_ble_fix_success","helper_ble_fix_false"];
var dev_mode = ["off","standby","timing","period","motion_idle","motion_start","motion_moving","motion_stop"];
var dev_status = ["none","downlink_fix","mandown","alert","sos"];
var event_type = ["motion_start","motion_moving","motion_stop","sos_start","sos_stop","alert_start","alert_stop","mandown_start","mandown_stop","downlink_fix"];
var restart_reason = ["ble_cmd_restart","lorawan_cmd_restart","key_restart","power_restart"];


function substringBytes(bytes, start, len)
{
	var char = [];
	for(var i = 0; i < len; i++)
	{
		char.push("0x"+ bytes[start+i].toString(16) < 0X10 ? ("0"+bytes[start+i].toString(16)) : bytes[start+i].toString(16) );
	}
	return char.join("");
}
function BytestoInt(bytes,start) {
    var value = ((bytes[start] << 24) | (bytes[start+1] << 16) | (bytes[start+2] << 8) | (bytes[start+3]));
    return value;
}
function Decoder(bytes, port)
{
	var dev_info = {};
	var datas = [];
	var parse_len;
	dev_info.pack_type = packet_type[port-1];

	if(port == 1)
	{
		dev_info.batterycharging = (bytes[0]>>7)&0x01;	//Parse  Battery charging state 
		dev_info.batterylevle =  (bytes[0]&0x7F) + '%';  //Parse  Battery Level
		dev_info.timezone = bytes[1];					//timezone
		dev_info.timestamp = BytestoInt(bytes,2);		//timestamp
		dev_info.event_type = event_type[bytes[6]];		//event
	}
	else if(port == 2)
	{
		dev_info.batterycharging = (bytes[0]>>7)&0x01;	//Parse  Battery charging state 
		dev_info.batterylevle =  (bytes[0]&0x7F) + '%';  //Parse  Battery Level
		dev_info.work_mode = dev_mode[(bytes[1]>>4)&0x0F];	//work mode
		dev_info.dev_status = dev_status[bytes[1]&0x0F];	//device status
		dev_info.firmware_ver = "V" + bytes[2] + "." + bytes[3] + "." + bytes[4];
		dev_info.hardware_ver = "V" + bytes[5] + "." + bytes[6];
		dev_info.timezone = bytes[7];		//timezone
		dev_info.alarm_error = bytes[8];	//error state
	}
	else if(port == 3)
	{
		dev_info.batterycharging = (bytes[0]>>7)&0x01;	//Parse  Battery charging state 
		dev_info.batterylevle =  (bytes[0]&0x7F) + '%';  //Parse  Battery Level
		dev_info.work_mode = dev_mode[(bytes[1]>>4)&0x0F];	//work mode
		dev_info.dev_status = dev_status[bytes[1]&0x0F];	//device status
		dev_info.timezone = bytes[2];						//timezone
		dev_info.timestamp = BytestoInt(bytes,3);		//timestamp
		dev_info.pre_restart_reason = restart_reason[bytes[7]];
	}
	else if(port == 4)
	{
		dev_info.batterycharging = (bytes[0]>>7)&0x01;	//Parse  Battery charging state 
		dev_info.batterylevle =  (bytes[0]&0x7F) + '%';  //Parse  Battery Level
		dev_info.work_mode = dev_mode[(bytes[1]>>4)&0x0F];	//work mode
		dev_info.dev_status = dev_status[bytes[1]&0x0F];	//device status
		dev_info.timezone = bytes[2];					//timezone
		dev_info.timestamp = BytestoInt(bytes,3);		//timestamp
	}
	else if(port == 5)
	{
		dev_info.batterycharging = (bytes[0]>>7)&0x01;	//Parse  Battery charging state 
		dev_info.batterylevle =  (bytes[0]&0x7F) + '%';  //Parse  Battery Level
		dev_info.work_mode = dev_mode[(bytes[1]>>4)&0x0F];	//work mode
		dev_info.dev_status = dev_status[bytes[1]&0x0F];	//device status
		dev_info.timezone = bytes[2];					//timezone
		dev_info.timestamp = BytestoInt(bytes,3);		//timestamp
		dev_info.low_power_level = bytes[7];		//low power level
	}
	else if(port == 6 || port == 10)
	{
		dev_info.batterycharging = (bytes[0]>>7)&0x01;	//Parse  Battery charging state 
		dev_info.batterylevle =  (bytes[0]&0x7F) + '%';  //Parse  Battery Level
		dev_info.work_mode = dev_mode[(bytes[1]>>5)&0x07];		//work mode
		dev_info.dev_status = dev_status[(bytes[1]>>2)&0x07];	//device status

		age = (bytes[1]&0x02) << 8 | bytes[2];
		dev_info.age = age;

		lon =BytestoInt(bytes,3);
		lat =BytestoInt(bytes,7);

		if(lat>0x80000000)
			lat = lat-0x100000000;
		if(lon>0x80000000)
			lon = lon-0x100000000;

		dev_info.lat = lat/10000000;
		dev_info.lon = lon/10000000;
	}
	else if(port == 7 || port == 11)
	{
		var gps_fix_false_reason = ["hardware_error","down_request_fix_interrupt","mandown_fix_interrupt","alarm_fix_interrupt","gps_fix_tech_timeout","gps_fix_timeout","alert_short_time","sos_short_time","pdop_limit","motion_start_interrupt","motion_stop_interrupt"];

		dev_info.batterycharging = (bytes[0]>>7)&0x01;	//Parse  Battery charging state 
		dev_info.batterylevle =  (bytes[0]&0x7F) + '%';  //Parse  Battery Level
		dev_info.work_mode = dev_mode[(bytes[1]>>4)&0x0F];
		dev_info.dev_status = dev_status[bytes[1]&0x0F];
		dev_info.fix_false_reason = gps_fix_false_reason[bytes[2]];
		dev_info.fix_cn0 = bytes[3];
		dev_info.fix_cn1 = bytes[4];
		dev_info.fix_cn2 = bytes[5];
		dev_info.fix_cn3 = bytes[6];
	}
	else if(port == 8 || port == 12)
	{
		dev_info.batterycharging = (bytes[0]>>7)&0x01;	//Parse  Battery charging state 
		dev_info.batterylevle =  (bytes[0]&0x7F) + '%';  //Parse  Battery Level
		dev_info.work_mode = dev_mode[(bytes[1]>>4)&0x0F];
		dev_info.dev_status = dev_status[bytes[1]&0x0F];
		var age = (bytes[2]) << 8 | bytes[3];
		dev_info.age = age;	//age

		parse_len = 4;
		for(var i=0 ; i<((bytes.length-4)/7) ; i++)
		{
			var data = {};
			data.mac = substringBytes(bytes, parse_len, 6);
			parse_len += 6;
			data.rssi = bytes[parse_len++]-256 +"dBm";
			datas.push(data);
		}
		dev_info.mac_data = datas;

	}
	else if(port == 9 || port == 13)
	{
		var ble_fix_false_reason = ["none","hardware_error","down_request_fix_interrupt","mandown_fix_interrupt","alarm_fix_interrupt","ble_fix_timeout","ble_adv","motion_start_interrupt","motion_stop_interrupt"];

		dev_info.batterycharging = (bytes[0]>>7)&0x01;	//Parse  Battery charging state 
		dev_info.batterylevle =  (bytes[0]&0x7F) + '%';  //Parse  Battery Level
		dev_info.work_mode = dev_mode[(bytes[1]>>4)&0x0F];
		dev_info.dev_status = dev_status[bytes[1]&0x0F];
		dev_info.fix_false_reason = ble_fix_false_reason[bytes[2]];

		parse_len = 3;
		for(var j=0 ; j<((bytes.length-3)/7) ; j++)
		{
			var ble_data = {};
			ble_data.mac = substringBytes(bytes, parse_len, 6);
			parse_len += 6;
			ble_data.rssi = bytes[parse_len++]-256 + "dBm";
			datas.push(ble_data);
		}
		dev_info.mac_data = datas;
	}

	return dev_info;
} 
