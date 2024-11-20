/*

   _____                                      _____                 __  _      __  
  / ___/___  ____  ____  ___  ____ ___  ____ / ___/___  ____  _____/ /_(_)____/ /__
  \__ \/ _ \/ __ \/_  / / _ \/ __ `__ \/ __ \\__ \/ _ \/ __ \/ ___/ __/ / ___/ //_/
 ___/ /  __/ / / / / /_/  __/ / / / / / /_/ /__/ /  __/ / / (__  ) /_/ / /__/ ,<   
/____/\___/_/ /_/ /___/\___/_/ /_/ /_/\____/____/\___/_/ /_/____/\__/_/\___/_/|_|  
                                                                                   
  Senstick SLW10 HW 1.0 - FW 1.0                             
*/


function decodeUplink(input)
{
  const bytes = input.bytes; 
  const port = input.fPort; 
  
  var Status;
  var BatteryVoltage;
  var SensorVoltage;

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
    if (bytes.length == 4)
    {
      BatteryVoltage = (bytes[0] << 8) +  bytes[1];
      SensorVoltage = (bytes[2] << 8) +  bytes[3];  
  
      return {
        data: {
          Status: 0,
          BatteryVoltage: BatteryVoltage,
          SensorVoltage: SensorVoltage,
        },
        	warnings: [],
        	errors: []
      };
    }
    
    else if (bytes.length == 5)
    {
      Status = bytes[0];
      BatteryVoltage = (bytes[1] << 8) +  bytes[2];
      SensorVoltage = (bytes[3] << 8) +  bytes[4];
  
      return {
        data: {
          Status: Status,
          BatteryVoltage: BatteryVoltage,
          SensorVoltage: SensorVoltage,
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
  
  // RTT FW warning
  else if (port == 4)
  {
    var warning = "RTT FIRMWARE";
    
    return {
      data: {
        warning: warning
      },
      	warnings: [],
      	errors: []
    };
  }
}

