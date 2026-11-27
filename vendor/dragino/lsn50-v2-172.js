function decodeUplink(input) {
  var bytes = input.bytes;
  var port = input.fPort;
  var decode = {};

  switch (port) {
    // Uplink (firmware 1.7.x: modes 0-5 only, no fPort 5)
    case 2: {
      if (bytes.length < 9) {
        return { errors: ['Invalid Payload Length: ' + bytes.length] };
      }

      var mode = (bytes[6] & 0x7c) >> 2;

      decode.Digital_IStatus = bytes[6] & 0x02 ? 'H' : 'L';

      if (mode != 2) {
        decode.BatV = ((bytes[0] << 8) | bytes[1]) / 1000; // V
        decode.TempC1 = parseFloat(((((bytes[2] << 24) >> 16) | bytes[3]) / 10).toFixed(2)); // °C
        decode.ADC_CH0V = ((bytes[4] << 8) | bytes[5]) / 1000; // V
      }

      if (mode != 6) {
        decode.EXTI_Trigger = bytes[6] & 0x01 ? 'TRUE' : 'FALSE';
        decode.Door_status = bytes[6] & 0x80 ? 'CLOSE' : 'OPEN';
      }

      if (mode == 0) {
        decode.Work_mode = 'IIC';
        if (((bytes[9] << 8) | bytes[10]) === 0) {
          decode.Illum = ((bytes[7] << 24) >> 16) | bytes[8]; // lux
        } else {
          decode.TempC_SHT = parseFloat(((((bytes[7] << 24) >> 16) | bytes[8]) / 10).toFixed(2)); // °C
          decode.Hum_SHT = parseFloat((((bytes[9] << 8) | bytes[10]) / 10).toFixed(1)); // %
        }
      } else if (mode == 1) {
        decode.Work_mode = 'Distance';
        decode.Distance_cm = parseFloat((((bytes[7] << 8) | bytes[8]) / 10).toFixed(1)); // cm
        if (((bytes[9] << 8) | bytes[10]) != 65535) decode.Distance_signal_strength = (bytes[9] << 8) | bytes[10];
      } else if (mode == 2) {
        if (bytes.length < 12) {
          return { errors: ['Invalid Payload Length: ' + bytes.length] };
        }

        decode.Work_mode = '3ADC';
        decode.BatV = bytes[11] / 10; // V
        decode.ADC_CH0V = ((bytes[0] << 8) | bytes[1]) / 1000; // V
        decode.ADC_CH1V = ((bytes[2] << 8) | bytes[3]) / 1000; // V
        decode.ADC_CH4V = ((bytes[4] << 8) | bytes[5]) / 1000; // V
        if (((bytes[9] << 8) | bytes[10]) === 0) {
          decode.Illum = ((bytes[7] << 24) >> 16) | bytes[8]; // lux
        } else {
          decode.TempC_SHT = parseFloat(((((bytes[7] << 24) >> 16) | bytes[8]) / 10).toFixed(2)); // °C
          decode.Hum_SHT = parseFloat((((bytes[9] << 8) | bytes[10]) / 10).toFixed(1)); // %
        }
      } else if (mode == 3) {
        decode.Work_mode = '3DS18B20';
        decode.TempC2 = parseFloat(((((bytes[7] << 24) >> 16) | bytes[8]) / 10).toFixed(2)); // °C
        decode.TempC3 = parseFloat(((((bytes[9] << 24) >> 16) | bytes[10]) / 10).toFixed(2)); // °C
      } else if (mode == 4) {
        // 1.7.x carries the weight in 16 bits, 1.8.0 widened it to 32 bits
        decode.Work_mode = 'Weight';
        decode.Weight = ((bytes[7] << 24) >> 16) | bytes[8]; // g
      } else if (mode == 5) {
        decode.Work_mode = 'Count';
        decode.Count = (bytes[7] << 24) | (bytes[8] << 16) | (bytes[9] << 8) | bytes[10];
      }

      return { data: decode };
    }

    default:
      return { errors: ['Unsupported fPort: ' + port] };
  }
}
