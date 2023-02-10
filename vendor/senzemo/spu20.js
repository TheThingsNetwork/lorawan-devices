/*
  ___  ___ _ __   ___ _______ _ __ ___   ___  
 / __|/ _ \ '_ \ / _ \_  / _ \ '_ ` _ \ / _ \ 
 \__ \  __/ | | |  __// /  __/ | | | | | (_) |
 |___/\___|_| |_|\___/___\___|_| |_| |_|\___/ 

  Senstick Pure SPU20 HW 2.0 - FW 1.0                             
*/

function decodeUplink(input) {
  const bytes = input.bytes;  
  
  var Status;
  var Temperature;
  var Humidity;
  var AirPressure;
  var TVOC;
  var CO2;
  var Voltage;

  // If Data Packet
  if (bytes.length == 15)
  {
    Status = bytes[0];
    Temperature = (bytes[1] << 8) + bytes[2];
    Humidity = (bytes[3] << 8) + bytes[4];
    AirPressure = (bytes[5] << 8) + bytes[6];
    TVOC = (bytes[7] << 8) + bytes[8]; 
    CO2 = (bytes[9] << 8) + bytes[10];
    Voltage = (bytes[11] << 8) + bytes[12]; 

    return {
      data: {
        Status: Status,
        Temperature: sintToDec(Temperature),
        Humidity: Humidity / 100.0,
        AirPressure: AirPressure / 10.0,
        TVOC: TVOC / 100.0,
        CO2: CO2,
        Voltage: Voltage
      },
        warnings: [],
        errors: []
    };
  }
  
  
  // If Config packet
  else if (bytes.length == 10)
  {
        Status = bytes[0];
    var PacketConfirm = bytes[1];
    var DataRate = bytes[2];
    var Config = bytes[3];
    var LedThreshold = bytes[4];
    var LedIntensity = bytes[5];           
    var FamilyId = bytes[6];  
    var ProductId = bytes[7];
    var HardwareVersion = bytes[8];
    var FirmWareVersion = bytes[9];    
        
    return {
      data: {
        Status: Status,
        PacketConfirm: PacketConfirm,
        DataRate: DataRate,
        Config: Config,        
        LedThreshold: LedThreshold * 10.0,
        LedIntensity: LedIntensity,
        FamilyId: FamilyId,
        ProductId: ProductId,
        HardwareVersion: HardwareVersion / 10.0,
        FirmWareVersion: FirmWareVersion / 10.0
        
      },
        warnings: [],
        errors: []
    };
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
