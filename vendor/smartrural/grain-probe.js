
function bytes2float(byte0, byte1, byte2, byte3) {
    var bits = (byte0 << 24) | (byte1 << 16) | (byte2 << 8) | (byte3);
    var sign = ((bits >>> 31) === 0) ? 1.0 : -1.0;
    var e = ((bits >>> 23) & 0xff);
    var m = (e === 0) ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
    var f = sign * m * Math.pow(2, e - 150);
    return f;
}
function decodeUplink(input) {
  var port = input.fPort;
  var bytes = input.bytes;
  var poll_message_status=(bytes[2]&0x40)>>6;
  var data = {};
  switch (input.fPort) {
    case 2:

  if(poll_message_status===0)
  {
  data.Ext= bytes[2]&0x0F;
  data.BatV= ((bytes[0]<<8 | bytes[1]) & 0x3FFF)/1000;

  if(data.Ext==0x01)
  {
    data.Temp_Channel1=parseFloat(((bytes[3]<<24>>16 | bytes[4])/100).toFixed(2));
    data.Temp_Channel2=parseFloat(((bytes[5]<<24>>16 | bytes[6])/100).toFixed(2));
  }
  else if(data.Ext==0x02)
  {
    data.Temp_Channel1=parseFloat(((bytes[3]<<24>>16 | bytes[4])/10).toFixed(1));
    data.Temp_Channel2=parseFloat(((bytes[5]<<24>>16 | bytes[6])/10).toFixed(1));
  }
  else if(data.Ext==0x03)
  {
    data.Res_Channel1=parseFloat(((bytes[3]<<8 | bytes[4])/100).toFixed(2));
    data.Res_Channel2=parseFloat(((bytes[5]<<8 | bytes[6])/100).toFixed(2));
  }

  data.Systimestamp=(bytes[7]<<24 | bytes[8]<<16 | bytes[9]<<8 | bytes[10] );
  }

    return {
		data:{
			"temperatures": [data.Temp_Channel1,data.Temp_Channel2],
			"Systimestamp": data.Systimestamp,
			"Ext": data.Ext,
			"battery": data.BatV,
			"debug": {
						bytes: input.bytes,
						warnings: [],
						errors: []
					}
		}
	};
      default:
   return {
     errors: ["unknown FPort"]
   }
  }
  }
