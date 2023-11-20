function decodeUplink(input) {
  switch (input.fPort) {
    case 1:
      {
        var output = {
          Ambient_Temperature: input.bytes[0] * 0.25,
          PIR_Status: input.bytes[1]>>5 & 0x01,
          Energy_Storage_Low: input.bytes[1]>>4 & 0x01,
          Radio_Communication_Error: input.bytes[1]>>3 & 0x01,
          Radio_Signal_Strength: input.bytes[1]>>2 & 0x01,
          PIR_Sensor_Failure: input.bytes[1]>>1 & 0x01,
          Ambient_Temperature_Failure: input.bytes[1] & 0x01,
          Storage_Voltage: Number((input.bytes[2]*0.02).toFixed(2)),
          Set_Point_Temperature_Value: get_spt_value(input.bytes[3])
        };
        return { data: output };
      }
      default:
        return {
          errors: ['unknown FPort'],
        };
      }

  }
  
  function get_spt_value(spt_byte) {
    switch (spt_byte) {
      case 0:
        return "0";
      case 1:
        return "+1";
      case 2:
        return "+2";
      case 3:
        return "+3";
      case 4:
        return "+4";
      case 5:
        return "+5";
      case 12:
        return "-4";
      case 13:
        return "-3";
      case 14:
        return "-2";
      case 15:
        return "-1";
      case 255:
        return "Freeze Protection 6°";
      default:
        return "0";
    }
  }
  