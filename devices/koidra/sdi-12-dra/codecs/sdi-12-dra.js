// Only for AT+DATAUP=0 & AT+ALLDATAMOD=0
function Decoder(bytes, port) { 
    if(port==5)
    {
        var freq_band;
        var sub_band;
      var sensor;
      
      if(bytes[0]==0x17)
        sensor= "SDI12-LB";
        
        var firm_ver= (bytes[1]&0x0f)+'.'+(bytes[2]>>4&0x0f)+'.'+(bytes[2]&0x0f);
        
      if(bytes[3]==0x01)
          freq_band="EU868";
        else if(bytes[3]==0x02)
          freq_band="US915";
        else if(bytes[3]==0x03)
          freq_band="IN865";
        else if(bytes[3]==0x04)
          freq_band="AU915";
        else if(bytes[3]==0x05)
          freq_band="KZ865";
        else if(bytes[3]==0x06)
          freq_band="RU864";
        else if(bytes[3]==0x07)
          freq_band="AS923";
        else if(bytes[3]==0x08)
          freq_band="AS923_1";
        else if(bytes[3]==0x09)
          freq_band="AS923_2";
        else if(bytes[3]==0x0A)
          freq_band="AS923_3";
        else if(bytes[3]==0x0F)
          freq_band="AS923_4";
        else if(bytes[3]==0x0B)
          freq_band="CN470";
        else if(bytes[3]==0x0C)
          freq_band="EU433";
        else if(bytes[3]==0x0D)
          freq_band="KR920";
        else if(bytes[3]==0x0E)
          freq_band="MA869";
        
      if(bytes[4]==0xff)
        sub_band="NULL";
        else
        sub_band=bytes[4];
  
      var bat= (bytes[5]<<8 | bytes[6])/1000;
      
        return {
          SENSOR_MODEL:sensor,
        FIRMWARE_VERSION:firm_ver,
        FREQUENCY_BAND:freq_band,
        SUB_BAND:sub_band,
        BAT:bat,
        }
    }
    else if(port==100)
    {
        var datas_sum={};
        for(var j=0;j<bytes.length;j++)
        {
          var datas= String.fromCharCode(bytes[j]);
          if(j=='0')
            datas_sum.datas_sum=datas;
          else
            datas_sum.datas_sum+=datas;
        }
        
        return datas_sum;
    }
    else  
    {
        var decode={};
        var garbage = 0;
        const Suppose_Len = 18;
        decode.msg_length = bytes.length;
        decode.EXTI_Trigger= (bytes[0] & 0x80)? "TRUE":"FALSE";    
        decode.BatV= ((bytes[0]<<8 | bytes[1])&0x7FFF)/1000;
        decode.Payver= bytes[2];
        
        // for(var i=3;i<bytes.length;i++)
        // {
        //   var data= String.fromCharCode(bytes[i]);
        //   if(i=='3')
        //     decode.data_sum=data;
        //   else
        //     decode.data_sum+=data;
        // }
        decode.data_sum = String.fromCharCode(...bytes.slice(3));
        data_sum_infos = decode.data_sum.split('+');
        
        if (!isNaN(parseFloat(data_sum_infos[0]))) {
          // 2626.96+21.8+38
          wc_Root = parseFloat(data_sum_infos[0]);
          decode.wc_Root = 6.771*Math.pow(10, -10) * Math.pow(wc_Root, 3) - 5.105*Math.pow(10, -6) * Math.pow(wc_Root, 2) + 1.302*Math.pow(10, -2) * wc_Root - 10.848;
      } else if (!isNaN(parseFloat(data_sum_infos[1])) && bytes.length > Suppose_Len) {
          // ñ\u00170+2574.78+22.2+637JZL\r\n
          garbage = 1;
          tempWc = parseFloat(data_sum_infos[1]);
          decode.wc_Root = 6.771*Math.pow(10, -10) * Math.pow(tempWc, 3) - 5.105*Math.pow(10, -6) * Math.pow(tempWc, 2) + 1.302*Math.pow(10, -2) * tempWc - 10.848;
      } else {
          decode.wc_Root = null;
      } 
        
      if (garbage) {
          decode.T_Root = !isNaN(parseFloat(data_sum_infos[2])) ? parseFloat(data_sum_infos[2]) : null;
          const numberRegex = /\d+/g;
          const numberMatches = data_sum_infos[3].match(numberRegex);
          tempEc = numberMatches % 100;
          decode.ec_Root = numberMatches ? (parseInt(tempEc) / 1000) : null;
      } else {
          decode.T_Root = !isNaN(parseFloat(data_sum_infos[1])) ? parseFloat(data_sum_infos[1]) : null;
          const numberRegex = /\d+/g;
          const numberMatches = data_sum_infos[2].match(numberRegex);
          decode.ec_Root = numberMatches ? (parseInt(numberMatches.join("")) / 1000) : null;
      }
        
        return decode;
    }
  }