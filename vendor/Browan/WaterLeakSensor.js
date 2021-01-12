//Browan version:1.0
function decodeUplink(input) {
  switch (input.fPort) {
    case 106:
      var status_low = (input.bytes[0] - ((input.bytes[0] >> 4) * 16));
      var status_hight = ((input.bytes[0] >> 4) % 4) >> 1;
      var status_hight2 = (input.bytes[0] >> 6);
      var int_battery = (25 + (input.bytes[1] - ((input.bytes[1] >> 4) * 16))) / 10;
      var int_TempPCB = input.bytes[2] - 32;
      var int_rh = input.bytes[3];
      var int_TempENV = input.bytes[4] - 32;

      return {
        // Decoded data
        data: {
          WaterLeakageDetected: status_low,
          TemperatureStatus: status_hight,
          RHStatus: status_hight2,
          Battery: int_battery,
          Temp_PCB: int_TempPCB,
          Humidity: int_rh,
          Temp_Sensor: int_TempENV,
        },
      };
    default:
      return {
        errors: ['unknown FPort'],
      };
  }
}