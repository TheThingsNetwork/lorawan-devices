/*

   _____                                      _____                 __  _      __  
  / ___/___  ____  ____  ___  ____ ___  ____ / ___/___  ____  _____/ /_(_)____/ /__
  \__ \/ _ \/ __ \/_  / / _ \/ __ `__ \/ __ \\__ \/ _ \/ __ \/ ___/ __/ / ___/ //_/
 ___/ /  __/ / / / / /_/  __/ / / / / / /_/ /__/ /  __/ / / (__  ) /_/ / /__/ ,<   
/____/\___/_/ /_/ /___/\___/_/ /_/ /_/\____/____/\___/_/ /_/____/\__/_/\___/_/|_|  
                                                                                   
  Senstick SMC40 HW 4.0 - FW 1.0                             
*/


function decodeUplink(input)
{
  const bytes = input.bytes; 
  const port = input.fPort; 
  
  var Status;
  var Temperature;
  var Humidity;
  var AirPressure;
  var BatteryLevel; 

  // Alarm Packet
  if (port == 1)
  {
    if (bytes.length == 1)
    {
      Status = bytes[0];
  
      return {
        data: {
          Status: Status
        },
        	warnings: [],
        	errors: []
      };
    }
  }

  // If Data Packet
  if (port == 2)
  {
    if (bytes.length == 7) {
      Temperature = (bytes[0] << 8) + bytes[1];
      Humidity = (bytes[2] << 8) + bytes[3];
      AirPressure = (bytes[4] << 8) + bytes[5];
      BatteryLevel = bytes[6];  

      return {
        data: {
          Status: 0,
          Temperature: sintToDec(Temperature),
          Humidity: Humidity / 100.0,
          AirPressure: AirPressure / 10.0,
          BatteryLevel: map(BatteryLevel, 0, 255, 800, 1800)
        },
        	warnings: [],
        	errors: []
      };
    }
    
    else if (bytes.length == 8)
    {
      Status = bytes[0];
      Temperature = (bytes[1] << 8) + bytes[2];
      Humidity = (bytes[3] << 8) + bytes[4];
      AirPressure = (bytes[5] << 8) + bytes[6];
      BatteryLevel = bytes[7];  

      return {
        data: {
          Status: Status,
          Temperature: sintToDec(Temperature),
          Humidity: Humidity / 100.0,
          AirPressure: AirPressure / 10.0,
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
    if (bytes.length == 9)
    {
          Status = bytes[0];    
      var SendPeriod = bytes[1];
      var MoveThr = bytes[2];
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
          Status: Status,
          SendPeriod: SendPeriod,
          MoveThr:MoveThr,
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
      temp = temp.toFixed();
  return (temp);
}