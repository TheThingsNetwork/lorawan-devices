function decodeUplink(input) {
  switch (input.fPort) {
    case 1:
      {
        var output = {
          Current_Valve_Position: input.bytes[0],
          Flow_Sensor_Raw: input.bytes[1]*0.5,
          Flow_Temperature: input.bytes[2]*0.5,
          Ambient_Sensor_Raw: input.bytes[3]*0.25,
          Ambient_Temperature: input.bytes[4]*0.25,
          Energy_Storage: input.bytes[5]>>6 & 0x01,
          Harvesting_Active: input.bytes[5]>>5 & 0x01,
          Ambient_Sensor_Failure: input.bytes[5]>>4 & 0x01,
          Flow_Sensor_Failure: input.bytes[5]>>3 & 0x01,
          Radio_Communication_Error: input.bytes[5]>>2 & 0x01,
          Received_Signal_Strength: input.bytes[5]>>1 & 0x01,
          Motor_Error: input.bytes[5]>>0 & 0x01,
          Storage_Voltage: Number((input.bytes[6]*0.02).toFixed(2)),
          Average_Current_Consumed: input.bytes[7]*10,
          Average_Current_Generated: input.bytes[8]*10,
          Reference_Completed: input.bytes[9]>>4 & 0x01,
          Operating_Mode: input.bytes[9]>>7 & 0x01,
          Storage_Fully_Charged: input.bytes[9]>>6 & 0x01,
        }
        if (input.bytes.length == 11) {
          var um = input.bytes[9] & 0x03
          if (um == 0) {
            var uv = input.bytes[10]
          }
          else {
            var uv = input.bytes[10]*0.5
          }
          output.User_Mode = um
          output.User_Value = uv
        }
        return { data: output };
      }
      default:
        return {
          errors: ['unknown FPort'],
        };
      }

  }
