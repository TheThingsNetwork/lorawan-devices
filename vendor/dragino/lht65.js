function str_pad(byte){
  var zero = '00';
  var hex= byte.toString(16);    
  var tmp  = 2-hex.length;
  return zero.substr(0,tmp) + hex + " ";
}

function decodeUplink(input) {
	 var port = input.fPort;
var bytes = input.bytes;
var Ext= bytes[6]&0x0F;
var poll_message_status=(bytes[6]&0x40)>>6;
var Connect=(bytes[6]&0x80)>>7;
var data = {};
switch (input.fPort) {
   case 2:
if(Ext==0x09)
{
data.TempC_DS=parseFloat(((bytes[0]<<24>>16 | bytes[1])/100).toFixed(2));
data.Bat_status=bytes[4]>>6;
}
else
{
data.BatV= ((bytes[0]<<8 | bytes[1]) & 0x3FFF)/1000;
data.Bat_status=bytes[0]>>6;
}

if(Ext!=0x0f)
{
data.TempC_SHT=parseFloat(((bytes[2]<<24>>16 | bytes[3])/100).toFixed(2));
data.Hum_SHT=parseFloat((((bytes[4]<<8 | bytes[5])&0xFFF)/10).toFixed(1));
}
if(Connect=='1')
{
data.No_connect="Sensor no connection";
}

if(Ext=='0')
{
data.Ext_sensor ="No external sensor";
}
else if(Ext=='1')
{
data.Ext_sensor ="Temperature Sensor";
data.TempC_DS=parseFloat(((bytes[7]<<24>>16 | bytes[8])/100).toFixed(2));
}
else if(Ext=='4')
{
data.Work_mode="Interrupt Sensor send";
data.Exti_pin_level=bytes[7] ? "High":"Low";  
data.Exti_status=bytes[8] ? "True":"False";
}
else if(Ext=='5')
{
data.Work_mode="Illumination Sensor";
data.ILL_lx=bytes[7]<<8 | bytes[8];

}
else if(Ext=='6')
{
data.Work_mode="ADC Sensor";
data.ADC_V=(bytes[7]<<8 | bytes[8])/1000;
}
else if(Ext=='7')
{
data.Work_mode="Interrupt Sensor count";
data.Exit_count=bytes[7]<<8 | bytes[8];
}
else if(Ext=='8')
{
data.Work_mode="Interrupt Sensor count";
data.Exit_count=bytes[7]<<24 | bytes[8]<<16 | bytes[9]<<8 | bytes[10];
}
else if(Ext=='9')
{
data.Work_mode="DS18B20 & timestamp";
data.Systimestamp=(bytes[7]<<24 | bytes[8]<<16 | bytes[9]<<8 | bytes[10] );
}
else if(Ext=='15')
{
data.Work_mode="DS18B20ID";
data.ID=str_pad(bytes[2])+str_pad(bytes[3])+str_pad(bytes[4])+str_pad(bytes[5])+str_pad(bytes[7])+str_pad(bytes[8])+str_pad(bytes[9])+str_pad(bytes[10]);
}

if(poll_message_status===0)
{
if(bytes.length==11)
{
  return {
  data:data,
  }
}
}
break;
default:
  return {
    errors: ["unknown FPort"]
  }

}

}

function normalizeUplink(input) {
  var data = [];

  if (input.data.TempC_SHT) {
    data.push({
      air: {
        location: "indoor",
        temperature: input.data.TempC_SHT,
        relativeHumidity: input.data.Hum_SHT,
      }
    });
  }

  if (input.data.TempC_DS) {
   var val = {
    air: {
      location: "outdoor",
      temperature: input.data.TempC_DS
    }
  }
  if (input.data.BatV) {
    val.battery = input.data.BatV
  }
  data.push(val);
  }

  return { data: data };
}
