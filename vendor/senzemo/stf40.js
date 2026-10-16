/*

   _____                                      _____                 __  _      __  
  / ___/___  ____  ____  ___  ____ ___  ____ / ___/___  ____  _____/ /_(_)____/ /__
  \__ \/ _ \/ __ \/_  / / _ \/ __ `__ \/ __ \\__ \/ _ \/ __ \/ ___/ __/ / ___/ //_/
 ___/ /  __/ / / / / /_/  __/ / / / / / /_/ /__/ /  __/ / / (__  ) /_/ / /__/ ,<   
/____/\___/_/ /_/ /___/\___/_/ /_/ /_/\____/____/\___/_/ /_/____/\__/_/\___/_/|_|  
                                                                                   
  Senstick STF40 HW 4.0 - FW 1.0                             
*/


function decodeUplink(input) {
  const bytes = input.bytes; 
  const port = input.fPort; 
  
  var Status;
  var BatteryVoltage;
  var ProbeTemperature;
  var SensorVoltage;
  var NTCresistance;
  var vdda;

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
      ProbeTemperature = (bytes[2] << 8) +  bytes[3];  
  
      return {
        data: {
          BatteryVoltage: BatteryVoltage,
          ProbeTemperature: sintToDec(ProbeTemperature)
        },
        	warnings: [],
        	errors: []
      };
    }
    
    else if (bytes.length == 5)
    {
      Status = bytes[0];
      BatteryVoltage = (bytes[1] << 8) +  bytes[2];
      ProbeTemperature = (bytes[3] << 8) +  bytes[4];
  
      return {
        data: {
          Status: Status,
          BatteryVoltage: BatteryVoltage,
          ProbeTemperature: sintToDec(ProbeTemperature)
        },
        	warnings: [],
        	errors: []
      };     
    }

    else if (bytes.length == 12)
    {
      BatteryVoltage = (bytes[0] << 8) +  bytes[1];
      ProbeTemperature = (bytes[2] << 8) +  bytes[3];
      SensorVoltage = (bytes[4] << 8) +  bytes[5];
      NTCresistance = (bytes[6] << 24) + (bytes[7] << 16) + (bytes[8] << 8) +  bytes[9];
      vdda = (bytes[10] << 8) +  bytes[11];
  
      return {
        data: {
          BatteryVoltage: BatteryVoltage,
          ProbeTemperature: sintToDec(ProbeTemperature),
          SensorVoltage: SensorVoltage,
          NTCresistance: NTCresistance,
          vdda: vdda
        },
        	warnings: [],
        	errors: []
      };      
    }
    
    else if (bytes.length == 13)
    {
      Status = bytes[0];
      BatteryVoltage = (bytes[1] << 8) +  bytes[2];
      ProbeTemperature = (bytes[3] << 8) +  bytes[4];
      SensorVoltage = (bytes[5] << 8) +  bytes[6];
      NTCresistance = (bytes[7] << 24) + (bytes[8] << 16) + (bytes[9] << 8) +  bytes[10];
      vdda = (bytes[11] << 8) +  bytes[12];
  
      return {
        data: {
          Status: Status,
          BatteryVoltage: BatteryVoltage,
          ProbeTemperature: sintToDec(ProbeTemperature),
          SensorVoltage: SensorVoltage,
          NTCresistance: NTCresistance,
          vdda: vdda
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
function sintToDec(T)
{
  if (T > 32767) {
    return ((T - 65536) / 100.0);
  }
  else {
    return (T / 100.0);
  }
}