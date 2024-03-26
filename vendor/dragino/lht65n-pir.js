function Str1(str2){
  var str3 ="";
  for (var i=0;i<str2.length;i++){
    if (str2[i]<=0x0f){
     str2[i]="0"+str2[i].toString(16)+"";
    }
  str3+= str2[i].toString(16)+"";}
  return str3;
}
function str_pad(byte){
    var zero = '00';
    var hex= byte.toString(16);    
    var tmp  = 2-hex.length;
    return zero.substr(0,tmp) + hex + " ";
}

function datalog(i,bytes){
  var Ext= bytes[6]&0x0F;
  var bb;
  	if((Ext=='1')||(Ext=='9'))
{
	bb=parseFloat(((bytes[0+i]<<24>>16 | bytes[1+i])/100).toFixed(2));
}
  	else if(Ext=='2')
{
	bb=parseFloat(((bytes[0+i]<<24>>16 | bytes[1+i])/100).toFixed(2));
}
	else if(Ext=='4')
{
	var Exti_pin_level=bytes[0+i] ? "High":"Low";  
    var Exti_status=bytes[1+i] ? "True":"False";
    bb=Exti_pin_level+Exti_status;
}
	else if(Ext=='5')
{
	bb=bytes[0+i]<<8 | bytes[1+i];
}
	else if(Ext=='6')
{
	bb=(bytes[0+i]<<8 | bytes[1+i])/1000;
}
	else if(Ext=='7')
{
	bb=bytes[0+i]<<8 | bytes[1+i];
}
	else if(Ext=='8')
{
	bb=bytes[0+i]<<8 | bytes[1+i];
}
  var cc= parseFloat(((bytes[2+i]<<24>>16 | bytes[3+i])/100).toFixed(2));
  var dd= parseFloat((((bytes[4+i]<<8 | bytes[5+i])&0xFFF)/10).toFixed(1));
  var ee= getMyDate((bytes[7+i]<<24 | bytes[8+i]<<16 | bytes[9+i]<<8 | bytes[10+i]).toString(10));
  var string='['+bb+','+cc+','+dd+','+ee+']'+',';  
  
  return string;
}

function getzf(c_num){ 
  if(parseInt(c_num) < 10)
    c_num = '0' + c_num; 

  return c_num; 
}

function getMyDate(str){ 
  var c_Date;
  if(str > 9999999999)
     c_Date = new Date(parseInt(str));
  else 
     c_Date = new Date(parseInt(str) * 1000);
  
  var c_Year = c_Date.getFullYear(), 
  c_Month = c_Date.getMonth()+1, 
  c_Day = c_Date.getDate(),
  c_Hour = c_Date.getHours(), 
  c_Min = c_Date.getMinutes(), 
  c_Sen = c_Date.getSeconds();
  var c_Time = c_Year +'-'+ getzf(c_Month) +'-'+ getzf(c_Day) +' '+ getzf(c_Hour) +':'+ getzf(c_Min) +':'+getzf(c_Sen); 
  
  return c_Time;
}

function Decoder(bytes, port) {
var Ext= bytes[6]&0x0F;
var poll_message_status=((bytes[6]>>7)&0x01);
var Connect=(bytes[6]&0x80)>>7;
var decode = {};
if((port==3)&(bytes[2]==(0x01))|(bytes[2]==(0x02))){
	var array1=[]
	var bytes1="0x"
	var str1=Str1(bytes)
	var str2=str1.substring(0,6)
	var str3=str1.substring(6,)
  var reg=/.{4}/g;
	var rs=str3.match(reg);
	rs.push(str3.substring(rs.join('').length));
	rs.pop()
	var new_set = new Set(rs)
	var new_arr = [...new_set]
	var data1=new_arr
	decode.bat=parseInt(bytes1+str2.substring(0,4)& 0x3FFF)
	if (parseInt(bytes1+str2.substring(4,))==1){
		decode.sensor="ds18b20"
	}
	else{
		decode.sensor="tmp117"
	}
	for (var i=0;i<data1.length;i++){
    var temp=(parseInt(bytes1+data1[i].substring(0,4)))/100
    array1[i]=temp
 }
	decode.Temp=array1
	{
    return decode;
  }
 }	
 switch (poll_message_status) {		
case 0:	
{ 
if(Ext==0x09)
{
  decode.TempC_DS=parseFloat(((bytes[0]<<24>>16 | bytes[1])/100).toFixed(2));
  decode.Bat_status=bytes[4]>>6;
}
else
{
  decode.BatV= ((bytes[0]<<8 | bytes[1]) & 0x3FFF)/1000;
  decode.Bat_status=bytes[0]>>6;
}

if(Ext!=0x0f)
{
  decode.TempC_SHT=parseFloat(((bytes[2]<<24>>16 | bytes[3])/100).toFixed(2));
  decode.Hum_SHT=parseFloat((((bytes[4]<<8 | bytes[5])&0xFFF)/10).toFixed(1));
}
if(Connect=='1')
{
  decode.No_connect="Sensor no connection";
}

if(Ext=='0')
{
  decode.Ext_sensor ="No external sensor";
}
else if(Ext=='1')
{
  decode.Ext_sensor ="Temperature Sensor";
  decode.TempC_DS=parseFloat(((bytes[7]<<24>>16 | bytes[8])/100).toFixed(2));
}
else if(Ext=='2')
{
  decode.Ext_sensor ="Temperature Sensor";
  decode.TempC_TMP117=parseFloat(((bytes[7]<<24>>16 | bytes[8])/100).toFixed(2));
}
else if(Ext=='4')
{
  decode.Work_mode="Interrupt Sensor send";
  decode.Exti_pin_level=bytes[7] ? "High":"Low";  
  decode.Exti_status=bytes[8] ? "True":"False";
}
else if(Ext=='5')
{
  decode.Work_mode="Illumination Sensor";
  decode.ILL_lx=bytes[7]<<8 | bytes[8];
}
else if(Ext=='6')
{
  decode.Work_mode="ADC Sensor";
  decode.ADC_V=(bytes[7]<<8 | bytes[8])/1000;
}
else if(Ext=='7')
{
  decode.Work_mode="Interrupt Sensor count";
  decode.Exit_count=bytes[7]<<8 | bytes[8];
}
else if(Ext=='8')
{
  decode.Work_mode="Interrupt Sensor count";
  decode.Exit_count=bytes[7]<<24 | bytes[8]<<16 | bytes[9]<<8 | bytes[10];
}
else if(Ext=='9')
{
  decode.Work_mode="DS18B20 & timestamp";
  decode.Systimestamp=(bytes[7]<<24 | bytes[8]<<16 | bytes[9]<<8 | bytes[10] );
}
else if(Ext=='15')
{
  decode.Work_mode="DS18B20ID";
  decode.ID=str_pad(bytes[2])+str_pad(bytes[3])+str_pad(bytes[4])+str_pad(bytes[5])+str_pad(bytes[7])+str_pad(bytes[8])+str_pad(bytes[9])+str_pad(bytes[10]);
}
}
  if(bytes.length==11)
  {
    return decode;
  }
break;

case 1:
  {
    for(var i=0;i<bytes.length;i=i+11)
    {
      var da= datalog(i,bytes);
      if(i=='0')
        decode.DATALOG=da;
      else
        decode.DATALOG+=da;
    }
}
{
return decode;
}
 break;
default:
    return {
      errors: ["unknown"]
    }
}
}