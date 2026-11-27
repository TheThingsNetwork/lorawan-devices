function decodeUplink(input) {
  var bytes = input.bytes;
  var port = input.fPort;
  var decode = {};

  switch (port) {
    // Uplink
    case 2: {
      if (bytes.length < 9) {
        return { errors: ['Invalid Payload Length: ' + bytes.length] };
      }

      var mode = (bytes[6] & 0x7c) >> 2;

      decode.Digital_IStatus = bytes[6] & 0x02 ? 'H' : 'L';

      if (mode != 2) {
        decode.BatV = ((bytes[0] << 8) | bytes[1]) / 1000; // V
        if (bytes[2] == 0x7f && bytes[3] == 0xff) decode.TempC1 = 'NULL';
        else decode.TempC1 = parseFloat(((((bytes[2] << 24) >> 16) | bytes[3]) / 10).toFixed(1)); // °C
        if (mode != 8) decode.ADC_CH0V = ((bytes[4] << 8) | bytes[5]) / 1000; // V
      }

      if (mode != 5 && mode != 6) {
        decode.EXTI_Trigger = bytes[6] & 0x01 ? 'TRUE' : 'FALSE';
        decode.Door_status = bytes[6] & 0x80 ? 'CLOSE' : 'OPEN';
      }

      if (mode == 0) {
        decode.Work_mode = 'IIC';
        if (((bytes[9] << 8) | bytes[10]) === 0) {
          decode.Illum = (bytes[7] << 8) | bytes[8]; // lux
        } else {
          if ((bytes[7] == 0x7f && bytes[8] == 0xff) || (bytes[7] == 0xff && bytes[8] == 0xff)) decode.TempC_SHT = 'NULL';
          else decode.TempC_SHT = parseFloat(((((bytes[7] << 24) >> 16) | bytes[8]) / 10).toFixed(1)); // °C

          if (bytes[9] == 0xff && bytes[10] == 0xff) decode.Hum_SHT = 'NULL';
          else decode.Hum_SHT = parseFloat((((bytes[9] << 8) | bytes[10]) / 10).toFixed(1)); // %
        }
      } else if (mode == 1) {
        decode.Work_mode = 'Distance';

        if (bytes[7] === 0x00 && bytes[8] === 0x00) decode.Distance_cm = 'NULL';
        else decode.Distance_cm = parseFloat((((bytes[7] << 8) | bytes[8]) / 10).toFixed(1)); // cm

        if (!(bytes[9] == 0xff && bytes[10] == 0xff)) decode.Distance_signal_strength = (bytes[9] << 8) | bytes[10];
      } else if (mode == 2) {
        if (bytes.length < 12) {
          return { errors: ['Invalid Payload Length: ' + bytes.length] };
        }

        decode.Work_mode = '3ADC+IIC';
        decode.BatV = bytes[11] / 10; // V
        decode.ADC_CH0V = ((bytes[0] << 8) | bytes[1]) / 1000; // V
        decode.ADC_CH1V = ((bytes[2] << 8) | bytes[3]) / 1000; // V
        decode.ADC_CH4V = ((bytes[4] << 8) | bytes[5]) / 1000; // V
        if (((bytes[9] << 8) | bytes[10]) === 0) {
          decode.Illum = (bytes[7] << 8) | bytes[8]; // lux
        } else {
          if ((bytes[7] == 0x7f && bytes[8] == 0xff) || (bytes[7] == 0xff && bytes[8] == 0xff)) decode.TempC_SHT = 'NULL';
          else decode.TempC_SHT = parseFloat(((((bytes[7] << 24) >> 16) | bytes[8]) / 10).toFixed(1)); // °C

          if (bytes[9] == 0xff && bytes[10] == 0xff) decode.Hum_SHT = 'NULL';
          else decode.Hum_SHT = parseFloat((((bytes[9] << 8) | bytes[10]) / 10).toFixed(1)); // %
        }
      } else if (mode == 3) {
        decode.Work_mode = '3DS18B20';
        if (bytes[7] == 0x7f && bytes[8] == 0xff) decode.TempC2 = 'NULL';
        else decode.TempC2 = parseFloat(((((bytes[7] << 24) >> 16) | bytes[8]) / 10).toFixed(1)); // °C

        if (bytes[9] == 0x7f && bytes[10] == 0xff) decode.TempC3 = 'NULL';
        else decode.TempC3 = parseFloat(((((bytes[9] << 24) >> 16) | bytes[10]) / 10).toFixed(1)); // °C
      } else if (mode == 4) {
        decode.Work_mode = 'Weight';
        decode.Weight = (bytes[9] << 24) | (bytes[10] << 16) | (bytes[7] << 8) | bytes[8]; // g
      } else if (mode == 5) {
        decode.Work_mode = '1Count';
        decode.Count = ((bytes[7] << 24) | (bytes[8] << 16) | (bytes[9] << 8) | bytes[10]) >>> 0;
      } else if (mode == 6) {
        decode.Work_mode = '3Interrupt';
        decode.EXTI1_Trigger = bytes[6] & 0x01 ? 'TRUE' : 'FALSE';
        decode.EXTI1_Status = bytes[6] & 0x80 ? 'CLOSE' : 'OPEN';
        decode.EXTI2_Trigger = bytes[7] & 0x10 ? 'TRUE' : 'FALSE';
        decode.EXTI2_Status = bytes[7] & 0x01 ? 'CLOSE' : 'OPEN';
        decode.EXTI3_Trigger = bytes[8] & 0x10 ? 'TRUE' : 'FALSE';
        decode.EXTI3_Status = bytes[8] & 0x01 ? 'CLOSE' : 'OPEN';
      } else if (mode == 7) {
        decode.Work_mode = '3ADC+1DS18B20';
        decode.ADC_CH1V = ((bytes[7] << 8) | bytes[8]) / 1000; // V
        decode.ADC_CH4V = ((bytes[9] << 8) | bytes[10]) / 1000; // V
      } else if (mode == 8) {
        if (bytes.length < 17) {
          return { errors: ['Invalid Payload Length: ' + bytes.length] };
        }

        decode.Work_mode = '3DS18B20+2Count';
        if (bytes[4] == 0x7f && bytes[5] == 0xff) decode.TempC2 = 'NULL';
        else decode.TempC2 = parseFloat(((((bytes[4] << 24) >> 16) | bytes[5]) / 10).toFixed(1)); // °C

        if (bytes[7] == 0x7f && bytes[8] == 0xff) decode.TempC3 = 'NULL';
        else decode.TempC3 = parseFloat(((((bytes[7] << 24) >> 16) | bytes[8]) / 10).toFixed(1)); // °C

        decode.Count1 = ((bytes[9] << 24) | (bytes[10] << 16) | (bytes[11] << 8) | bytes[12]) >>> 0;
        decode.Count2 = ((bytes[13] << 24) | (bytes[14] << 16) | (bytes[15] << 8) | bytes[16]) >>> 0;
      }

      decode.Node_type = 'LSN50';
      return { data: decode };
    }

    // Device information
    case 5: {
      if (bytes.length != 7) {
        return { errors: ['Invalid Payload Length: ' + bytes.length] };
      }

      if (bytes[0] == 0x01) decode.FREQUENCY_BAND = 'EU868';
      else if (bytes[0] == 0x02) decode.FREQUENCY_BAND = 'US915';
      else if (bytes[0] == 0x03) decode.FREQUENCY_BAND = 'IN865';
      else if (bytes[0] == 0x04) decode.FREQUENCY_BAND = 'AU915';
      else if (bytes[0] == 0x05) decode.FREQUENCY_BAND = 'KZ865';
      else if (bytes[0] == 0x06) decode.FREQUENCY_BAND = 'RU864';
      else if (bytes[0] == 0x07) decode.FREQUENCY_BAND = 'AS923';
      else if (bytes[0] == 0x08) decode.FREQUENCY_BAND = 'AS923_1';
      else if (bytes[0] == 0x09) decode.FREQUENCY_BAND = 'AS923_2';
      else if (bytes[0] == 0x0a) decode.FREQUENCY_BAND = 'AS923_3';
      else if (bytes[0] == 0x0b) decode.FREQUENCY_BAND = 'CN470';
      else if (bytes[0] == 0x0c) decode.FREQUENCY_BAND = 'EU433';
      else if (bytes[0] == 0x0d) decode.FREQUENCY_BAND = 'KR920';
      else if (bytes[0] == 0x0e) decode.FREQUENCY_BAND = 'MA869';
      else if (bytes[0] == 0x0f) decode.FREQUENCY_BAND = 'AS923_4';

      if (bytes[1] == 0xff) decode.SUB_BAND = 'NULL';
      else decode.SUB_BAND = bytes[1];

      decode.FIRMWARE_VERSION = (bytes[2] & 0x0f) + '.' + ((bytes[3] >> 4) & 0x0f) + '.' + (bytes[3] & 0x0f);

      decode.TDC_sec = (bytes[4] << 16) | (bytes[5] << 8) | bytes[6]; // s
      return { data: decode };
    }

    default:
      return { errors: ['Unsupported fPort: ' + port] };
  }
}

function normalizeUplink(input) {
  var data = {};
  var air = {};
  var action = {};

  if (input.data.TempC_SHT) {
    air.temperature = input.data.TempC_SHT;
  }

  if (input.data.Hum_SHT) {
    air.relativeHumidity = input.data.Hum_SHT;
  }

  if (input.data.Door_status === 'CLOSE' || input.data.Door_status === 'OPEN') {
    action.contactState = input.data.Door_status === 'CLOSE' ? 'closed' : 'open';
  }

  if (Object.keys(air).length > 0) {
    data.air = air;
  }

  if (Object.keys(action).length > 0) {
    data.action = action;
  }

  if (input.data.BatV) {
    data.battery = input.data.BatV;
  }

  return { data: data };
}
