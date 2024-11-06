// Only for AT+DATAUP=0 & AT+ALLDATAMOD=0
// Tekbox format only
function Decoder(bytes, port) {
    const Report_Len = 41; 
    const Bat_Len = 25; 
    const Measure_Len = 38;
  
    if(port==5)
    {
        var freq_band;
        var sub_band;
      var sensor;
      
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
        // achievable
        return datas_sum;
    }
    else  
    {
      const payload = String.fromCharCode(...new Uint8Array(bytes));
      var decode={};
      typeStr = bytes[0];
      typeMeasure = bytes[1];
      decode.msg_length = bytes.length;
      
      if ((bytes.length == Report_Len) || (payload[0] == "C")) {
          // 00:01:07:04:19:00544253420100011201R -69
          decode.msg = String.fromCharCode(typeStr);
          decode.msg_type = "FW Report";
          decode.data_sum = String.fromCharCode(...bytes.slice(1));
          data_sum_infos = decode.data_sum.split(' ');
          decode.NodeRssi = data_sum_infos[1] ? parseFloat(data_sum_infos[1]) : null;
          decode.TimeReporting = data_sum_infos[0] ? (data_sum_infos[0]) : null;
          reportStr = data_sum_infos[0] ? (data_sum_infos[0]) : null;
          //   decoded.timestamp = reportStr.substring(0, 17);
          //   decoded.deviceID = reportStr.substring(17, 26);
          //   decoded.firmwareVersion = reportStr.substring(26, 35);
          //   decoded.numOfSensor = reportStr.substring(35, 36);
          //   decoded.nodeStatus = payload[36];
          //   decoded.reportLen = reportStr.length;
          
          return decode;
      } else if (bytes.length == Bat_Len || (typeStr == "P" && typeMeasure == "B")) {
          // 00:01:07:04:16:00 4.115
          decode.msg = String.fromCharCode(typeStr) + String.fromCharCode(typeMeasure);
          decode.msg_type = "Bat Report";
          decode.data_sum = String.fromCharCode(...bytes.slice(2));
        data_sum_infos = decode.data_sum.split(' ');
        decode.BatV = data_sum_infos[1] ? parseFloat(data_sum_infos[1]) : null;
        decode.TimeMesuring = data_sum_infos[0] ? (data_sum_infos[0]) : null;
        
        return decode;
      } else if (bytes.length == Measure_Len || (typeStr == "P" && typeMeasure == "S")) {
          // 00:01:07:04:15:000002 +63.99 +26.973"
          decode.msg = String.fromCharCode(typeStr) + String.fromCharCode(typeMeasure);
          decode.msg_type = "Sensor";
          decode.data_sum=String.fromCharCode(...bytes.slice(2));
          data_sum_infos = decode.data_sum.split(' ');
          decode.TimeMesuring = data_sum_infos[0] ? (data_sum_infos[0]) : null;
          decode.rh_Root = !isNaN(parseFloat(data_sum_infos[1])) ? parseFloat(data_sum_infos[1]) : null;
          decode.T_Root = data_sum_infos[2] ? parseFloat(data_sum_infos[2]) : null;
          return decode;
      } else {
          decode.msg_type = "Unknown";
          return decode;
    }
  }
  }