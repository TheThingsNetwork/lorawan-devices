/*

   _____                                      _____                 __  _      __  
  / ___/___  ____  ____  ___  ____ ___  ____ / ___/___  ____  _____/ /_(_)____/ /__
  \__ \/ _ \/ __ \/_  / / _ \/ __ `__ \/ __ \\__ \/ _ \/ __ \/ ___/ __/ / ___/ //_/
 ___/ /  __/ / / / / /_/  __/ / / / / / /_/ /__/ /  __/ / / (__  ) /_/ / /__/ ,<   
/____/\___/_/ /_/ /___/\___/_/ /_/ /_/\____/____/\___/_/ /_/____/\__/_/\___/_/|_|  
                                                                                   
  Senstick STB10 HW 1.0 - FW 1.0                             
*/


function decodeUplink(input)
{
  const bytes = input.bytes; 
  const port = input.fPort; 
  
  var Status;
  var Temp_buf;
  var Temp_inn;
  var Bat; 
  var Temp_buf_ret;
  var Temp_inn_ret;
  var Bat_ret;

  // Data Packet
  if (port == 2)
  {
    if (bytes.length == 5)
    {
      Temp_buf = (bytes[0]<<24>>16) + bytes[1];
      Temp_inn = (bytes[2]<<24>>16) + bytes[3];
      Bat = bytes[4];  

      return {
        data: {
          Status: 0,
          Temp_buf: Temp_buf / 100,
          Temp_inn: Temp_inn / 100,
          Bat: map(Bat, 0, 255, 800, 1800)
        },
        	warnings: [],
        	errors: []
      };
    }
    
    else if (bytes.length == 6)
    {
      Status = bytes[0];
      Temp_buf = (bytes[1]<<24>>16) + bytes[2];
      Temp_inn = (bytes[3]<<24>>16) + bytes[4];
      Bat = bytes[5];   

      return {
        data: {
          Status: Status,
          Temp_buf: Temp_buf / 100,
          Temp_inn: Temp_inn / 100,
          Bat: map(Bat, 0, 255, 800, 1800)
        },
        	warnings: [],
        	errors: []
      };      
    }
    
    else if (bytes.length == 13)
    {
      Status = 0;
      Temp_buf = (bytes[0]<<24>>16) + bytes[1];
      Temp_inn = (bytes[2]<<24>>16) + bytes[3];
      Bat = bytes[4];   
      Fcnt_ret = (bytes[5]<< 16) + (bytes[6]<< 8) + bytes[7];
      Temp_buf_ret = (bytes[8]<<24>>16) + bytes[9];
      Temp_inn_ret = (bytes[10]<<24>>16) + bytes[11];
      Bat_ret = bytes[12];   

      return {
        data: {
          Status: Status,
          Temp_buf: Temp_buf / 100,
          Temp_inn: Temp_inn / 100,
          Bat: map(Bat, 0, 255, 800, 1800),
          Fcnt_ret: Fcnt_ret,
          Temp_buf_ret: Temp_buf_ret / 100,
          Temp_inn_ret: Temp_inn_ret / 100,
          Bat_ret: map(Bat_ret, 0, 255, 800, 1800)
        },
        	warnings: [],
        	errors: []
      };      
    }
    
    else if (bytes.length == 14)
    {
      Status = bytes[0];
      Temp_buf = (bytes[1]<<24>>16) + bytes[2];
      Temp_inn = (bytes[3]<<24>>16) + bytes[4];
      Bat = bytes[5];   
      Fcnt_ret = (bytes[6]<< 16) + (bytes[7]<< 8) + bytes[8];
      Temp_buf_ret = (bytes[9]<<24>>16) + bytes[10];
      Temp_inn_ret = (bytes[11]<<24>>16) + bytes[12];
      Bat_ret = bytes[13];   

      return {
        data: {
          Status: Status,
          Temp_buf: Temp_buf / 100,
          Temp_inn: Temp_inn / 100,
          Bat: map(Bat, 0, 255, 800, 1800),
          Fcnt_ret: Fcnt_ret,
          Temp_buf_ret: Temp_buf_ret / 100,
          Temp_inn_ret: Temp_inn_ret / 100,
          Bat_ret: map(Bat_ret, 0, 255, 800, 1800)
        },
        	warnings: [],
        	errors: []
      };      
    }
  }
  
  // Config packet
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
        
      var ADRon = Boolean(DataRatePlusADR & (1 << 4));
      var DataRate = (DataRatePlusADR & 0x0F);
             
      
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

function map(x, in_min, in_max, out_min, out_max){
  var temp = ((x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min); 
      temp = temp.toFixed();
  return (temp);
}