function decodeUplink(input) {
  var port = input.fPort;
var bytes = input.bytes;
	var dic = {};

	var tem	  	=["tem1","tem2","tem3","tem4","tem5","tem6","tem7",

				  "tem8","tem9","tem10","tem11","tem12","tem13"];

	var hum	  	=["soil_moisture1","soil_moisture2","soil_moisture3","soil_moisture4","soil_moisture5","soil_moisture6","soil_moisture7","soil_moisture8"];				

	var tem_len =[0,0,4,6,7,9,11,12,13];

	var hum_len =[0,0,2,3,4,5,6,7,8];

	

	var value=(bytes[0]<<8 | bytes[1]) & 0x0FFF;

	dic.bat = value/1000;//Battery,units:V
var sen_type = bytes[2]-0x30;

	dic.sen = sen_type;

	var is_tem_flag = false;
    if((bytes[3+tem_len[sen_type]*2]==0x7F) && (bytes[4+tem_len[sen_type]*2]==0xFF))
	{
	 hum_len[sen_type]=1;
	}
	if((bytes.length-3-(hum_len[sen_type]*2))===(tem_len[sen_type]*2))

	{
		is_tem_flag = true;
	}

	var start_bytes=3;

	if(is_tem_flag === true)

	{
		for(i=0;i<tem_len[sen_type];i++)

		{

			if(bytes[start_bytes] & 0x80)

				dic[tem[i]]= (((bytes[start_bytes]<<8)|bytes[start_bytes+1])-0xFFFF)/(10.0);	//<0

			else

				dic[tem[i]]= ((bytes[start_bytes]<<8)|bytes[start_bytes+1])/(10.0);

			

			start_bytes+=2;

		}
	}

	
	for(i=0;i<hum_len[sen_type];i++)

	{
        if(bytes[start_bytes]==0x7F && bytes[start_bytes+1]==0xFF)
		{
		   if(is_tem_flag === true)
		     dic[hum[1]]="Invalid data";	
		   else 
		   {
			  dic[tem[0]]="Invalid data";
              dic[hum[0]]="Invalid data";			  
		   }
		}
	    else{
		dic[hum[i]]=((bytes[start_bytes]<<8)|bytes[start_bytes+1])/(10.0);

		start_bytes+=2;
		}
	}


	return {
	  data:dic
}
}