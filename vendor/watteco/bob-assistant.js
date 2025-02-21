function Decoder(bytes, port) {

  // Decode an uplink message from a buffer
  // (array) of bytes to an object of fields.
  var decoded = {};

  var decodedBatch = {};

  var date = new Date();
  var lDate = date.toISOString();
    
    
  if (port === 1){
    decodedBatch = !(bytes[0] & 0x01);

    stdData = {};
    tab = [];
    header = {};

    fft = [];


    // Report Type
    if (bytes[0] === 0x72 || bytes[0] === 0x52) {

      if (bytes[6] <= 0x3b ) {  // 0x3B = 59 in decimal that corresponds to a reportperiod <= 59 min
        reportperiod = bytes[6];
      } 

      if (bytes[6] > 0x3b) {
        reportperiod = (bytes[6]-59)*60;
      }

      operatingtime = bytes[2]*reportperiod/127;     
      
      header = {type: "Report", sensor: "KX"};

      tab.push({label: "BatteryPercentage", value: bytes[17]*100/127, date: lDate});
      tab.push({label: "AnomalyLevel", value: bytes[1]*100/127, date: lDate});
      tab.push({label: "AnomalyLevelTo20Last6Mo", value: bytes[24], date: lDate});
      tab.push({label: "NbAlarmReport", value: bytes[4], date: lDate});
      tab.push({label: "OperatingTime", value: bytes[2]*2/127, date: lDate});
      tab.push({label: "TotalUnknown6080", value: (operatingtime - bytes[3]*operatingtime/127)*bytes[15]/127, date: lDate});
      tab.push({label: "TotalUnknown4060", value: (operatingtime - bytes[3]*operatingtime/127)*bytes[14]/127, date: lDate});
      tab.push({label: "TotalUnknown2040", value: (operatingtime - bytes[3]*operatingtime/127)*bytes[13]/127, date: lDate});
      tab.push({label: "AnomalyLevelTo80Last30D", value: bytes[23], date: lDate});
      tab.push({label: "VibrationLevel", value: (bytes[8]*128+bytes[9]+bytes[10]/100)/10/121.45, date: lDate});
      tab.push({label: "TotalUnknown1020", value: (operatingtime - bytes[3]*operatingtime/127), date: lDate});
      tab.push({label: "AnomalyLevelTo80Last6Mo", value: bytes[26], date: lDate});
      tab.push({label: "AnomalyLevelTo50Last24H", value: bytes[19], date: lDate});
      tab.push({label: "AnomalyLevelTo20Last24H", value: bytes[18], date: lDate});
      tab.push({label: "AnomalyLevelTo50Last30D", value: bytes[22], date: lDate}); 
      tab.push({label: "Temperature", value: bytes[5] - 30, date: lDate});
      tab.push({label: "ReportLength", value: reportperiod, date: lDate});
      tab.push({label: "AnomalyLevelTo20Last30D", value: bytes[21], date: lDate});
      tab.push({label: "PeakFrequencyIndex", value: bytes[11]+1, date: lDate});
      tab.push({label: "TotalUnknown80100", value: (operatingtime - bytes[3]*operatingtime/127)*bytes[16]/127, date: lDate});
      tab.push({label: "TotalOperatingTimeKnown", value:bytes[3]*operatingtime/127, date: lDate});
      tab.push({label: "AnomalyLevelTo50Last6Mo", value: bytes[25], date: lDate});
      tab.push({label: "AnomalyLevelTo80Last24H", value: bytes[20], date: lDate});
    }


    // Alarm Type
    if (bytes[0] === 0x61) {
      vibrationlevel = (bytes[4]*128+bytes[5]+bytes[6]/100)/10/121.45;

      header = {type: "Alarm", sensor: "KX"};


      tab.push({label: "Temperature", value: bytes[2]-30, date: lDate});
      tab.push({label: "VibrationLevel", value: (bytes[4]*128+bytes[5]+bytes[6]/100)/10/121.45, date: lDate});
      tab.push({label: "AnomalyLevel", value: bytes[1]*100/127, date:lDate });

      for(i=8; i<= 39; i++) {
        fft.push({label: "fft"+(i-7), value: bytes[i]*vibrationlevel/127, date: lDate});
      }
      decoded.fft = fft;
    }
        
    
    // Learning Type
    if (bytes[0] === 0x6c) {
      const FREQ_SAMPLING_ACC_LF = 800;
      const FREQ_SAMPLING_ACC_HF = 25600;

      vibrationlevel = (bytes[2]*128+bytes[3]+bytes[4]/100)/10/121.45;

      header = {type: "Learning", sensor: "KX"};


      tab.push({label : "Temperature", value: bytes[6]-30, date: lDate});
      tab.push({label: "LearningFromScratch", value: bytes[7], date: lDate});
      tab.push({label: "LearningPercentage", value: bytes[1], date: lDate});
      tab.push({label: "VibrationLevel", value: vibrationlevel, date: lDate});
      tab.push({label: "PeakFrequencyIndex", value: bytes[5]+1, date: lDate});
      tab.push({label: "PeakFrequency", value: (bytes[5]+1)*FREQ_SAMPLING_ACC_LF/256, date: lDate});
      
      for(i=8; i<=39; i++ ) {
        fft.push({label: "fft"+(i-7), value: bytes[i]*vibrationlevel/127, date: lDate});
      }
      decoded.fft = fft;  

    }


    // State Type
    if(bytes[0] === 0x53) {
      var state;

      header = {type: "State", sensor: "KX"};


      if (bytes[1] === 100) {
        state = "Sensor start";
      }
      if (bytes[1] === 101) {
        state = "Sensor stop";
      }
      if(bytes[1] === 125) {
        state = "Machine stop"
      }
      if(bytes[1] === 126) {
        state = "Machine start"
      }

      tab.push({label: "State", value: state, date: lDate});
      tab.push({label: "BatteryPercentage", value: bytes[2]*100/127, date: lDate});

    }
                
    decoded.data = tab;
    decoded.header = header;

    return decoded;
  }
}


function decodeUplink(input) {
 
  return {
    data : Decoder(input.bytes, input.fPort),
    warnings: [],
    errors: []
  };
}