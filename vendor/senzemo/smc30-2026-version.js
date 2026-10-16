/*

   _____                                      _____                 __  _      __  
  / ___/___  ____  ____  ___  ____ ___  ____ / ___/___  ____  _____/ /_(_)____/ /__
  \__ \/ _ \/ __ \/_  / / _ \/ __ `__ \/ __ \\__ \/ _ \/ __ \/ ___/ __/ / ___/ //_/
 ___/ /  __/ / / / / /_/  __/ / / / / / /_/ /__/ /  __/ / / (__  ) /_/ / /__/ ,<   
/____/\___/_/ /_/ /___/\___/_/ /_/ /_/\____/____/\___/_/ /_/____/\__/_/\___/_/|_|  
                                                                                   
  Senstick SMC33 HW 3.3 - FW 2.1                             
*/

function decodeUplink(input) {
  const bytes = input.bytes; 
  const port = input.fPort;  
  
  const sendPeriodStrings	= [ "OFF", "1 MIN", "2 MIN", "5 MIN", "10 MIN", "15 MIN", "30 MIN", "60 MIN" ];
  
  // config
  var Status;
  var SP;
  var SendPeriod;
  var MoveThr;
  var PacketConfirm;
  var DataRatePlusADR; 
  var FamilyId;
  var ProductId;         
  var HW;
  var FW;
  var Period = [];
  
  // data
  var Temperature;
  var Humidity;
  var AirPressure;
  var Vbat;
  var Unixtime;
 
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
  
  // Data Packet
  else if (port == 2)
  {
    if (bytes.length == 8)
    {
      Temperature = bytes[0]<<24>>16 | bytes[1];
      Humidity = (bytes[2] << 8) +  bytes[3];  
      AirPressure = (bytes[4] << 8) +  bytes[5];  
      Vbat = (bytes[6] << 8) +  bytes[7]; 
  
      return {
        data: {
          Temperature: Temperature/100.0,
          Humidity: Humidity/100.0,
          AirPressure: AirPressure/10.0,
          Vbat: Vbat
        },
        	warnings: [],
        	errors: []
      };
    }
    
    else if (bytes.length == 9)
    {
      Status = bytes[0];
      Temperature = bytes[1]<<24>>16 | bytes[2];
      Humidity = (bytes[3] << 8) +  bytes[4];  
      AirPressure = (bytes[5] << 8) +  bytes[6];  
      Vbat = (bytes[7] << 8) +  bytes[8]; 
  
      return {
        data: {
          Status: Status,
          Temperature: Temperature/100.0,
          Humidity: Humidity/100.0,
          AirPressure: AirPressure/10.0,
          Vbat: Vbat
        },
        	warnings: [],
        	errors: []
      };
    }
    
    else if (bytes.length == 12)
    {
      Temperature = bytes[0]<<24>>16 | bytes[1];
      Humidity = (bytes[2] << 8) +  bytes[3];  
      AirPressure = (bytes[4] << 8) +  bytes[5];  
      Vbat = (bytes[6] << 8) +  bytes[7]; 
      Unixtime = (bytes[8] << 24) +  (bytes[9] << 16) +  (bytes[10] << 8) +  bytes[11]; 
  
      return {
        data: {
          Temperature: Temperature/100.0,
          Humidity: Humidity/100.0,
          AirPressure: AirPressure/10.0,
          Vbat: Vbat,
          Unixtime: Unixtime
        },
        	warnings: [],
        	errors: []
      };
    }
    
    else if (bytes.length == 13)
    {
      Status = bytes[0];
      Temperature = bytes[1]<<24>>16 | bytes[2];
      Humidity = (bytes[3] << 8) +  bytes[4];  
      AirPressure = (bytes[5] << 8) +  bytes[6];  
      Vbat = (bytes[7] << 8) +  bytes[8]; 
      Unixtime = (bytes[9] << 24) +  (bytes[10] << 16) +  (bytes[11] << 8) +  bytes[12]; 
  
      return {
        data: {
          Status: Status,
          Temperature: Temperature/100.0,
          Humidity: Humidity/100.0,
          AirPressure: AirPressure/10.0,
          Vbat: Vbat,
          Unixtime: Unixtime
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
      SP = bytes[1];
      MoveThr = bytes[2];
      PacketConfirm = bytes[3];
      DataRatePlusADR = bytes[4]; 
      FamilyId = bytes[5];
      ProductId = bytes[6];         
      HW = bytes[7];
      FW = bytes[8];       
      
      ADRon = Boolean(DataRatePlusADR & (1 << 7));
      DataRate = (DataRatePlusADR & 0x0F);
      
      return {
        data: {
          Status: Status,
          SendPeriod: sendPeriodStrings[SP],
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
    //}
  }
  
  return {
    data: {
      bytes: input.bytes
    },
    warnings: [],
    errors: []
  };
}