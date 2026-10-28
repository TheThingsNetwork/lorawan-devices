/*

   _____                                      _____                 __  _      __  
  / ___/___  ____  ____  ___  ____ ___  ____ / ___/___  ____  _____/ /_(_)____/ /__
  \__ \/ _ \/ __ \/_  / / _ \/ __ `__ \/ __ \\__ \/ _ \/ __ \/ ___/ __/ / ___/ //_/
 ___/ /  __/ / / / / /_/  __/ / / / / / /_/ /__/ /  __/ / / (__  ) /_/ / /__/ ,<   
/____/\___/_/ /_/ /___/\___/_/ /_/ /_/\____/____/\___/_/ /_/____/\__/_/\___/_/|_|  
                                                                                   
  Senstick SRM10 HW 1.0 - FW 1.0                             
*/


function decodeUplink(input) {
  const bytes = input.bytes; 
  const port = input.fPort; 
  
  var Status;
  var CurRainIntCnt;
  var CurRainCnt;
  var TotRainCnt;
  var BatteryLevel;

  // Alarm Packet
  if (port == 1)
  {
    if (bytes.length == 1)
    {
      Status = bytes[0];
  
      return {
        data: {
          Status: bitsToMsg(Status),
        },
        	warnings: [],
        	errors: []
      };
    }
  }

  // If Data Packet
  else if (port == 2)
  {
    if (bytes.length == 8)
    {
      CurRainIntCnt = bytes[0];
      CurRainCnt = (bytes[1] << 8) + bytes[2];
      TotRainCnt = (bytes[3] << 24) + (bytes[4] << 16) + (bytes[5] << 8) + bytes[6];
      BatteryLevel = bytes[7];  
  
      return {
        data: {
          CurrentRain: (CurRainIntCnt * 0.2).toFixed(1),
          CurrentRainTotal: (CurRainCnt * 0.2).toFixed(1),
          TotalRain: (TotRainCnt * 0.2).toFixed(1),
          BatteryLevel: map(BatteryLevel, 0, 255, 800, 1800)
        },
        	warnings: [],
        	errors: []
      };
    }
    
    else if (bytes.length == 9)
    {
      Status = bytes[0];
      CurRainIntCnt = bytes[1];
      CurRainCnt = (bytes[2] << 8) + bytes[3];
      TotRainCnt = (bytes[4] << 24) + (bytes[5] << 16) + (bytes[6] << 8) + bytes[7];
      BatteryLevel = bytes[8];  
  
      return {
        data: {
          Status: bitsToMsg(Status),
          CurrentRain: (CurRainIntCnt * 0.2).toFixed(1),
          CurrentRainTotal: (CurRainCnt * 0.2).toFixed(1),
          TotalRain: (TotRainCnt * 0.2).toFixed(1),
          BatteryLevel: map(BatteryLevel, 0, 255, 800, 1800)
        },
        	warnings: [],
        	errors: []
      };      
    }
  }
  
  // If Config packet
  else if (port == 3)
  {  
    Status = bytes[0];    
    var SendPeriod = bytes[1];
    var MovementThreshold = bytes[2];
    var PacketConfirm = bytes[3];
    var DataRatePlusADR = bytes[4]; 
    var FamilyId = bytes[5];
    var ProductId = bytes[6];         
    var HW = bytes[7];
    var FW = bytes[8];     
    
    var ADRon = Boolean(DataRatePlusADR & (1 << 7));
    var DataRate = (DataRatePlusADR & 0x7F);
    
    return {
      data: {
        Status: bitsToMsg(Status),
        SendPeriod: SendPeriod,
        MovementThreshold: MovementThreshold, 
        PacketConfirm: PacketConfirm,
        DataRate: DataRate,
        ADRon: ADRon,
        FamilyId: FamilyId,
        ProductId: ProductId,    
        HW: HW/10,
        FW: FW/10
      },
      	warnings: [],
      	errors: []
    };
  }
}

function bitsToMsg (B){
  var msg = "";
  if(B === 0) {msg = "OK  "}
  if(((B >> 0) & 1) === 1){msg += "Movement Detected Packet, "}
  if(((B >> 1) & 1) === 1){msg += "Movement Detected Confirmed, "}
  if(((B >> 2) & 1) === 1){msg += "Battery Low Power, "}
  if(((B >> 3) & 1) === 1){msg += "Accelerometer Failure, "}
  if(((B >> 4) & 1) === 1){msg += "T/RH Sensor Failure, "}
  if(((B >> 5) & 1) === 1){msg += "AP Sensor Failure, "}
  if(((B >> 6) & 1) === 1){msg += "NFC Failure, "}
  if(((B >> 7) & 1) === 1){msg += "Temperature Probe Failure, "}
  msg = msg.slice (0, -2);
  return msg;
}

function sintToDec(T){
  if (T > 32767) {
    return ((T - 65536) / 100.0);
  }
  else {
    return (T / 100.0);
  }
}

function map(x, in_min, in_max, out_min, out_max){
  var temp = ((x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min); 
      temp=temp/1000;
      temp = temp.toFixed(2);
  return (temp);
}