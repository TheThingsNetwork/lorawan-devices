function decodeUplink(input) {
    var bytes = input.bytes;
    var payloadlens = input.bytes.length;
    switch (input.fPort) {
      case 51:
        if(payloadlens==10){
          //ADC uplink payload
          var battery_cal = (bytes[1]/63.75)*100;
          var battery_final = parseFloat(battery_cal.toFixed(2));
          var dev_type_1 = (bytes[0] >> 1) & 0x01;
          var dev_type_2 = (bytes[0] >> 2) & 0x01;
          var dev_type_3 = (bytes[0] >> 3) & 0x01;
          var dev_type_bin = dev_type_3.toString()+dev_type_2.toString()+dev_type_1.toString();
          var dev_type_final = parseInt(dev_type_bin, 2);// Device Type: ADC=>2 ; BLE=>4
          var adc_group =(bytes[0] >> 4) & 0x01; // 0: ADC Group 0
          return {
            data: {
              Reading_Type: bytes[0] & 0x01,
              Device_Type: dev_type_final,
              ADC_group: adc_group,
              battery: battery_final,
              ADC1: (bytes[3] << 8) | bytes[2],
              ADC2: (bytes[5] << 8) | bytes[4],
              ADC4: (bytes[7] << 8) | bytes[6],
              ADC6: (bytes[9] << 8) | bytes[8],
            }
          };
        }
        if(payloadlens==9){
          //WIFI uplink payload
          var wifi_mac_sum = bytes[6].toString(16).padStart(2, "0")+
                            bytes[5].toString(16).padStart(2, "0")+
                            bytes[4].toString(16).padStart(2, "0")+
                            bytes[3].toString(16).padStart(2, "0")+
                            bytes[2].toString(16).padStart(2, "0")+
                            bytes[1].toString(16).padStart(2, "0");
          var rssi_cal = 0 - bytes[7];
          var battery_cal = (bytes[8]/63.75)*100;
          var battery_final = parseFloat(battery_cal.toFixed(2));
          var wifi_macs_b1 = (bytes[0] >> 1) & 0x01;
          var wifi_macs_b2 = (bytes[0] >> 2) & 0x01;
          var wifi_macs_b3 = (bytes[0] >> 3) & 0x01;
          var wifi_macs_bin = wifi_macs_b3.toString()+wifi_macs_b2.toString()+wifi_macs_b1.toString();
          var wifi_macs_final = parseInt(wifi_macs_bin, 2);// found WiFi MAC Numbers
          var pk_seq_n1 = (bytes[0] >> 4) & 0x01;
          var pk_seq_n2 = (bytes[0] >> 5) & 0x01;
          var pk_seq_n3 = (bytes[0] >> 6) & 0x01;
          var pk_seq_bin = pk_seq_n3.toString()+pk_seq_n2.toString()+pk_seq_n1.toString();
          var pk_seq_final = parseInt(pk_seq_bin, 2);//WiFi Packet Sequence serial number
          return {
            data: {
              Reading_Type: bytes[0] & 0x01,
              WiFi_MACs_found: wifi_macs_final,
              packet_seq_number: pk_seq_final,
              wifi_mac: wifi_mac_sum,
              RSSI: rssi_cal,
              battery: battery_final,
            }
          };
        }
      case 64:
        //BLE uplink payload
        var ble_mac_sum = bytes[6].toString(16).padStart(2, "0")+
                          bytes[5].toString(16).padStart(2, "0")+
                          bytes[4].toString(16).padStart(2, "0")+
                          bytes[3].toString(16).padStart(2, "0")+
                          bytes[2].toString(16).padStart(2, "0")+
                          bytes[1].toString(16).padStart(2, "0");
        var battery_cal = (bytes[9]/63.75)*100;
        var battery_final = parseFloat(battery_cal.toFixed(2));
        var dev_type_1 = (bytes[0] >> 1) & 0x01;
        var dev_type_2 = (bytes[0] >> 2) & 0x01;
        var dev_type_3 = (bytes[0] >> 3) & 0x01;
        var dev_type_bin = dev_type_3.toString()+dev_type_2.toString()+dev_type_1.toString();
        var dev_type_final = parseInt(dev_type_bin, 2);// Device Type: ADC=>2 ; BLE=>4
        var ble_beacons_f1 = (bytes[0] >> 4) & 0x01;
        var ble_beacons_f2 = (bytes[0] >> 5) & 0x01;
        var ble_beacons_f3 = (bytes[0] >> 6) & 0x01;
        var ble_beacons_bin = ble_beacons_f3.toString()+ble_beacons_f2.toString()+ble_beacons_f1.toString();
        var ble_beacons_final = parseInt(ble_beacons_bin, 2);//The numbers of BLE Beacon found
        return {
          data: {
            Reading_Type: bytes[0] & 0x01,
            Device_Type: dev_type_final,
            found_beacons: ble_beacons_final,
            ble_mac: ble_mac_sum,
            pressure: (bytes[8] << 8) | bytes[7],
            battery_main: battery_final,
            battery_transducer: bytes[10],
          }
      };
    default:
      return {
        errors: ['unknown FPort'],
      };
    }
  }
