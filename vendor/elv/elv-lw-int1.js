/*
 * ELV-LW-INT1-Payload-Parser
 * 
 * Version: V1.0
 * 
 * */


var firmwaretype = ["ELV-LW-INT1", "ELV-LW-INT1+DUS1", "ELV-LW-INT1+SoMo1", "ELV-LW-INT1+DUS1+SoMo1"];

/*
 * @brief   Receives the bytes transmitted from a ELV-LW-INT1 
 * @param   bytes:  Array with the data stream
 * @param   port:   Used TTN/TTS data port 
 * @return  Decoded data from the ELV-LW-INT1
 * */
function decodeUplink(input) {

  bytes = input.bytes;
  port = input.fPort;

  var decoded = {};   // Container with the decoded output
  var index = 2;      // Index variable for the application data in the bytes[] array
  var channel = 0;    // Channel of Sensor
  var Temp_Value = 0; // Variable for temporarily calculated values
  var ID_device = 0;
  var ID_DUS1 = 1;
  var ID_SoMo1H = 2;
  var ID_SoMo1T = 3;
  
  if (port === 10) {  // The default port for app data
    if (bytes.length >= 2) {    // Minimum 2 Bytes for Header
      
      // Collecting header data
      Temp_Value = (bytes[0] + 150);
      Temp_Value *= 0.01;   // Adjust the temperature resolution
      decoded.Supply_Voltage= String(Temp_Value.toFixed(2));
      //decoded.Supply_Voltage= String(Temp_Value.toFixed(2)) + " V";
      
      if (bytes.length >= 3) 
      {    // There is not only the header data
        switch (bytes[1]) 
        {
          case 0xff:  //Device-Info
          {
            decoded.Frame_Type = "Device-Info";
            Temp_Value = ( (bytes[2]<<16) + (bytes[3]<<8) + bytes[4] );
            if (Temp_Value == 0x000215)
            {
              decoded.DeviceType = "ELV-LW-INT1";
            }
            else
            {
              decoded.DeviceType = ( String( Temp_Value ));
            }
            decoded.Application = ( String( bytes[5] ) + "." + String( bytes[6] ) + "." + String( bytes[7] ) );
            decoded.Bootloader = ( String( bytes[8] ) + "." + String( bytes[9] ) + "." + String( bytes[10] ) );
            decoded.Hardware = String.fromCharCode(bytes[11] + 0x40);//( String( bytes[11] ));
            break;
          }
          case 0xfc:  //Config-Info
          {
            decoded.Frame_Type = "Config-Info";
            while (bytes.length > (index + 2))
            {
              channel = (bytes[index++]);  //Channel ID überspringen
              switch (bytes[index++]) //Sensor ID auswerten
              {
                case ID_device:  //Device-Config
                {
                  /*decoded.Device_Cyclic = bytes[index++];
                  decoded.Device_Statusmode = bytes[index++];
                  decoded.Device_Bitfield = bytes[index++];
                  decoded.IN1_Scan_Interval = bytes[index++];
                  decoded.IN2_Scan_Interval = bytes[index++];
                  decoded.IN1_Filtertime = bytes[index++];
                  decoded.IN2_Filtertime = bytes[index++];
                  decoded.SF = bytes[index++];
                  Temp_Value = (bytes[index]*256 + bytes[index+1]);
                  decoded.Rejoin_Time = Temp_Value
                  index++;
                  index++;*/
                  
                  decoded.Device_Cyclic = '0x'+(bytes[index]).toString(16).padStart(2,'0') + ' ' + String(bytes[index++]) + ' Min';
                  decoded.Device_Statusmode = '0x'+(bytes[index++]).toString(16).padStart(2,'0');
                  decoded.Device_Bitfield = '0x'+(bytes[index++]).toString(16).padStart(2,'0');
                  if (bytes[index] & 0x80)
                  {
                    Temp_Value = (String(bytes[index] & 0x7f) + ' Min');
                  }
                  else
                  {
                    Temp_Value = (String(bytes[index] & 0x7f) + ' s');
                  }
                  decoded.IN1_Scan_Interval = '0x'+(bytes[index++]).toString(16).padStart(2,'0') + ' ' + String(Temp_Value);
                  if (bytes[index] & 0x80)
                  {
                    Temp_Value = (String(bytes[index] & 0x7f) + ' Min');
                  }
                  else
                  {
                    Temp_Value = (String(bytes[index] & 0x7f) + ' s');
                  }
                  decoded.IN2_Scan_Interval = '0x'+(bytes[index++]).toString(16).padStart(2,'0') + ' ' + String(Temp_Value);
                  if (bytes[index] == 0xff)
                  {
                    Temp_Value = "No TX Event";
                  }
                  else if (bytes[index] & 0x80)
                  {
                    Temp_Value = (String(bytes[index] & 0x7f) + ' Min');
                  }
                  else
                  {
                    Temp_Value = (String(bytes[index] & 0x7f) + ' s');
                  }
                  decoded.IN1_Filtertime = '0x'+(bytes[index++]).toString(16).padStart(2,'0') + ' ' + String(Temp_Value);
                  if (bytes[index] == 0xff)
                  {
                    Temp_Value = "No TX Event";
                  }
                  else if (bytes[index] & 0x80)
                  {
                    Temp_Value = (String(bytes[index] & 0x7f) + ' Min');
                  }
                  else
                  {
                    Temp_Value = (String(bytes[index] & 0x7f) + ' s');
                  }
                  decoded.IN2_Filtertime = '0x'+(bytes[index++]).toString(16).padStart(2,'0') + ' ' + String(Temp_Value);
                  if (bytes[index])
                  {
                    Temp_Value = String(bytes[index]);
                  }
                  else
                  {
                    Temp_Value = "ADR";
                  }
                  decoded.SF = '0x'+(bytes[index++]).toString(16).padStart(2,'0') + ' ' + String(Temp_Value);
                  Temp_Value = ((bytes[index] & 0x7f)*256 + bytes[index+1]);
                  if (bytes[index] & 0x80)
                  { //single     
                    Temp_Value = (String(Temp_Value) + ' h');
                  }
                  else
                  { //cyclic
                    if (Temp_Value)
                    {
                      Temp_Value = (String(Temp_Value) + ' h');
                    }
                    else
                    {
                      Temp_Value = "Off";
                    }
                  }
                  decoded.Rejoin_Time = '0x'+(bytes[index]*256 + bytes[index+1]).toString(16).padStart(4,'0') + ' ' + String(Temp_Value);
                  index++;
                  index++;
                  break;
                }
                case ID_DUS1:  //Channel DUS1 Config
                {
                  /*decoded.DUS1_Cyclic = bytes[index++];
                  decoded.DUS1_Statusmode = bytes[index++];
                  decoded.DUS1_Messfilter = bytes[index++];
                  decoded.DUS1_Messinterval = bytes[index++];
                  decoded.DUS1_Messtrigger = bytes[index++];
                  decoded.DUS1_Threshold_1 = ((bytes[index]*256) + bytes[index+1]);
                  index++;
                  index++;
                  decoded.DUS1_Threshold_2 = ((bytes[index]*256) + bytes[index+1]);
                  index++;
                  index++;
                  decoded.DUS1_Delta = (bytes[index]*256 + bytes[index+1]);
                  index++;
                  index++;
                  decoded.DUS1_Filtertime_Thr1 = bytes[index++];
                  decoded.DUS1_Filtertime_Thr2 = bytes[index++];
                  decoded.DUS1_Filtertime_Delta = bytes[index++];
                  decoded.DUS1_Ref_Level_0 = ((bytes[index]*256) + bytes[index+1]);
                  index++;
                  index++;
                  decoded.DUS1_Ref_Level_1 = ((bytes[index]*256) + bytes[index+1]);
                  index++;
                  index++;*/
                  
                  decoded.DUS1_Cyclic = '0x'+(bytes[index]).toString(16).padStart(2,'0') + ' ' + String(bytes[index++]) + ' Min';
                  decoded.DUS1_Statusmode = '0x'+(bytes[index++]).toString(16).padStart(2,'0');
                  decoded.DUS1_Messfilter = '0x'+(bytes[index++]).toString(16).padStart(2,'0');
                  if (bytes[index] & 0x80)
                  {
                    Temp_Value = (String(bytes[index] & 0x7f) + ' Min');
                  }
                  else
                  {
                    Temp_Value = (String(bytes[index] & 0x7f) + ' s');
                  }
                  decoded.DUS1_Messinterval = '0x'+(bytes[index++]).toString(16).padStart(2,'0') + ' ' + String(Temp_Value);
                  decoded.DUS1_Messtrigger = '0x'+(bytes[index++]).toString(16).padStart(2,'0');
                  decoded.DUS1_Threshold_1 = '0x'+((bytes[index]*256) + bytes[index+1]).toString(16).padStart(4,'0') + ' ' + String((bytes[index]*256) + bytes[index+1]) + ' mm';
                  index++;
                  index++;
                  decoded.DUS1_Threshold_2 = '0x'+((bytes[index]*256) + bytes[index+1]).toString(16).padStart(4,'0') + ' ' + String((bytes[index]*256) + bytes[index+1]) + ' mm';
                  index++;
                  index++;
                  decoded.DUS1_Delta = '0x'+(bytes[index]*256 + bytes[index+1]).toString(16).padStart(4,'0') + ' ' + String((bytes[index]*256) + bytes[index+1]) + ' mm';
                  index++;
                  index++;
                  if (bytes[index] == 0xff)
                  {
                    Temp_Value = "No TX Event";
                  }
                  else if (bytes[index] & 0x80)
                  {
                    Temp_Value = (String(bytes[index] & 0x7f) + ' Min');
                  }
                  else
                  {
                    Temp_Value = (String(bytes[index] & 0x7f) + ' s');
                  }
                  decoded.DUS1_Filtertime_Thr1 = '0x'+(bytes[index++]).toString(16).padStart(2,'0') + ' ' + String(Temp_Value);
                  if (bytes[index] == 0xff)
                  {
                    Temp_Value = "No TX Event";
                  }
                  else if (bytes[index] & 0x80)
                  {
                    Temp_Value = (String(bytes[index] & 0x7f) + ' Min');
                  }
                  else
                  {
                    Temp_Value = (String(bytes[index] & 0x7f) + ' s');
                  }
                  decoded.DUS1_Filtertime_Thr2 = '0x'+(bytes[index++]).toString(16).padStart(2,'0') + ' ' + String(Temp_Value);
                  if (bytes[index] == 0xff)
                  {
                    Temp_Value = "No TX Event";
                  }
                  else if (bytes[index] & 0x80)
                  {
                    Temp_Value = String(bytes[index] & 0x7f) + ' Min';
                  }
                  else
                  {
                    Temp_Value = String(bytes[index] & 0x7f) + ' s';
                  }
                  decoded.DUS1_Filtertime_Delta = '0x'+(bytes[index++]).toString(16).padStart(2,'0') + ' ' + String(Temp_Value);
                  decoded.DUS1_Ref_Level_0 = '0x'+((bytes[index]*256) + bytes[index+1]).toString(16).padStart(4,'0') + ' ' + String((bytes[index]*256) + bytes[index+1]);
                  index++;
                  index++;
                  decoded.DUS1_Ref_Level_1 = '0x'+((bytes[index]*256) + bytes[index+1]).toString(16).padStart(4,'0') + ' ' + String((bytes[index]*256) + bytes[index+1]);
                  index++;
                  index++;
                  break;
                }
                case ID_SoMo1H:  //Channel SoMo1H Config
                {
                  /*decoded.SoMo1H_Cyclic = bytes[index++];
                  decoded.SoMo1H_Statusmode = bytes[index++];
                  decoded.SoMo1H_Messfilter = bytes[index++];
                  decoded.SoMo1H_Messinterval = bytes[index++];
                  decoded.SoMo1H_Messtrigger = bytes[index++];
                  decoded.SoMo1H_Threshold_1 = bytes[index++];
                  decoded.SoMo1H_Threshold_2 = bytes[index++];
                  decoded.SoMo1H_Delta = bytes[index++];
                  decoded.SoMo1H_Filtertime_Thr1 = bytes[index++];
                  decoded.SoMo1H_Filtertime_Thr2 = bytes[index++];
                  decoded.SoMo1H_Filtertime_Delta = bytes[index++];
                  decoded.SoMo1H_Ref_Level_0 = ((bytes[index]*256) + bytes[index+1]);
                  index++;
                  index++;
                  decoded.SoMo1H_Ref_Level_1 = ((bytes[index]*256) + bytes[index+1]);
                  index++;
                  index++;*/
                  
                  decoded.SoMo1H_Cyclic = '0x'+(bytes[index]).toString(16).padStart(2,'0') + ' ' + String(bytes[index++]) + ' Min';
                  decoded.SoMo1H_Statusmode = '0x'+(bytes[index++]).toString(16).padStart(2,'0');
                  decoded.SoMo1H_Messfilter = '0x'+(bytes[index++]).toString(16).padStart(2,'0');
                  if (bytes[index] & 0x80)
                  {
                    Temp_Value = (String(bytes[index] & 0x7f) + ' Min');
                  }
                  else
                  {
                    Temp_Value = (String(bytes[index] & 0x7f) + ' s');
                  }
                  decoded.SoMo1H_Messinterval = '0x'+(bytes[index++]).toString(16).padStart(2,'0') + ' ' + String(Temp_Value);
                  decoded.SoMo1H_Messtrigger = '0x'+(bytes[index++]).toString(16).padStart(2,'0');
                  decoded.SoMo1H_Threshold_1 = '0x'+(bytes[index]).toString(16).padStart(2,'0') + ' ' + String(bytes[index++]) + ' %';
                  decoded.SoMo1H_Threshold_2 = '0x'+(bytes[index]).toString(16).padStart(2,'0') + ' ' + String(bytes[index++]) + ' %';
                  decoded.SoMo1H_Delta = '0x'+(bytes[index]).toString(16).padStart(2,'0') + ' ' + String(bytes[index++]) + ' %';
                  if (bytes[index] == 0xff)
                  {
                    Temp_Value = "No TX Event";
                  }
                  else if (bytes[index] & 0x80)
                  {
                    Temp_Value = (String(bytes[index] & 0x7f) + ' Min');
                  }
                  else
                  {
                    Temp_Value = (String(bytes[index] & 0x7f) + ' s');
                  }
                  decoded.SoMo1H_Filtertime_Thr1 = '0x'+(bytes[index++]).toString(16).padStart(2,'0') + ' ' + String(Temp_Value);
                  if (bytes[index] == 0xff)
                  {
                    Temp_Value = "No TX Event";
                  }
                  else if (bytes[index] & 0x80)
                  {
                    Temp_Value = (String(bytes[index] & 0x7f) + ' Min');
                  }
                  else
                  {
                    Temp_Value = (String(bytes[index] & 0x7f) + ' s');
                  }
                  decoded.SoMo1H_Filtertime_Thr2 = '0x'+(bytes[index++]).toString(16).padStart(2,'0') + ' ' + String(Temp_Value);
                  if (bytes[index] == 0xff)
                  {
                    Temp_Value = "No TX Event";
                  }
                  else if (bytes[index] & 0x80)
                  {
                    Temp_Value = String(bytes[index] & 0x7f) + ' Min';
                  }
                  else
                  {
                    Temp_Value = String(bytes[index] & 0x7f) + ' s';
                  }
                  decoded.SoMo1H_Filtertime_Delta = '0x'+(bytes[index++]).toString(16).padStart(2,'0') + ' ' + String(Temp_Value);
                  decoded.SoMo1H_Ref_Level_0 = '0x'+((bytes[index]*256) + bytes[index+1]).toString(16).padStart(4,'0') + ' ' + String((bytes[index]*256) + bytes[index+1]);
                  index++;
                  index++;
                  decoded.SoMo1H_Ref_Level_1 = '0x'+((bytes[index]*256) + bytes[index+1]).toString(16).padStart(4,'0') + ' ' + String((bytes[index]*256) + bytes[index+1]);
                  index++;
                  index++;
                  break;
                }
                case ID_SoMo1T:  //Channel SoMo1T Config
                {
                  /*decoded.SoMo1T_Cyclic = bytes[index++];
                  decoded.SoMo1T_Statusmode = bytes[index++];
                  decoded.SoMo1T_Messfilter = bytes[index++];
                  decoded.SoMo1T_Messinterval = bytes[index++];
                  decoded.SoMo1T_Messtrigger = bytes[index++];
                  decoded.SoMo1T_Threshold_1 = ((bytes[index]*256) + bytes[index+1]);
                  index++;
                  index++;
                  decoded.SoMo1T_Threshold_2 = ((bytes[index]*256) + bytes[index+1]);
                  index++;
                  index++;
                  decoded.SoMo1T_Delta = (bytes[index]*256 + bytes[index+1]);
                  index++;
                  index++;
                  decoded.SoMo1T_Filtertime_Thr1 = bytes[index++];
                  decoded.SoMo1T_Filtertime_Thr2 = bytes[index++];
                  decoded.SoMo1T_Filtertime_Delta = bytes[index++];*/
                  
                  decoded.SoMo1T_Cyclic = '0x'+(bytes[index]).toString(16).padStart(2,'0') + ' ' + String(bytes[index++]) + ' Min';
                  decoded.SoMo1T_Statusmode = '0x'+(bytes[index++]).toString(16).padStart(2,'0');
                  decoded.SoMo1T_Messfilter = '0x'+(bytes[index++]).toString(16).padStart(2,'0');
                  if (bytes[index] & 0x80)
                  {
                    Temp_Value = (String(bytes[index] & 0x7f) + ' Min');
                  }
                  else
                  {
                    Temp_Value = (String(bytes[index] & 0x7f) + ' s');
                  }
                  decoded.SoMo1T_Messinterval = '0x'+(bytes[index++]).toString(16).padStart(2,'0') + ' ' + String(Temp_Value);
                  decoded.SoMo1T_Messtrigger = '0x'+(bytes[index++]).toString(16).padStart(2,'0');
                  Temp_Value = ((bytes[index]*256) + bytes[index+1]);
                  if (Temp_Value > 0x7fff) {
                    Temp_Value -= 0x10000;
                  }
                  Temp_Value *= 0.1;	// Adjust the temperature resolution
                  Temp_Value = String(Temp_Value.toFixed(1)) + " °C";
                  decoded.SoMo1T_Threshold_1 = '0x'+((bytes[index]*256) + bytes[index+1]).toString(16).padStart(4,'0') + ' ' + String(Temp_Value);
                  index++;
                  index++;
                  Temp_Value = ((bytes[index]*256) + bytes[index+1]);
                  if (Temp_Value > 0x7fff) {
                    Temp_Value -= 0x10000;
                  }
                  Temp_Value *= 0.1;	// Adjust the temperature resolution
                  Temp_Value = String(Temp_Value.toFixed(1)) + " °C";
                  decoded.SoMo1T_Threshold_2 = '0x'+((bytes[index]*256) + bytes[index+1]).toString(16).padStart(4,'0') + ' ' + String(Temp_Value);
                  index++;
                  index++;
                  Temp_Value = ((bytes[index]*256) + bytes[index+1]);
                  Temp_Value *= 0.1;	// Adjust the temperature resolution
                  Temp_Value = String(Temp_Value.toFixed(1)) + " °C";
                  decoded.SoMo1T_Delta = '0x'+(bytes[index]*256 + bytes[index+1]).toString(16).padStart(4,'0') + ' ' + String(Temp_Value);
                  index++;
                  index++;
                  if (bytes[index] == 0xff)
                  {
                    Temp_Value = "No TX Event";
                  }
                  else if (bytes[index] & 0x80)
                  {
                    Temp_Value = (String(bytes[index] & 0x7f) + ' Min');
                  }
                  else
                  {
                    Temp_Value = (String(bytes[index] & 0x7f) + ' s');
                  }
                  decoded.SoMo1T_Filtertime_Thr1 = '0x'+(bytes[index++]).toString(16).padStart(2,'0') + ' ' + String(Temp_Value);
                  if (bytes[index] == 0xff)
                  {
                    Temp_Value = "No TX Event";
                  }
                  else if (bytes[index] & 0x80)
                  {
                    Temp_Value = (String(bytes[index] & 0x7f) + ' Min');
                  }
                  else
                  {
                    Temp_Value = (String(bytes[index] & 0x7f) + ' s');
                  }
                  decoded.SoMo1T_Filtertime_Thr2 = '0x'+(bytes[index++]).toString(16).padStart(2,'0') + ' ' + String(Temp_Value);
                  if (bytes[index] == 0xff)
                  {
                    Temp_Value = "No TX Event";
                  }
                  else if (bytes[index] & 0x80)
                  {
                    Temp_Value = String(bytes[index] & 0x7f) + ' Min';
                  }
                  else
                  {
                    Temp_Value = String(bytes[index] & 0x7f) + ' s';
                  }
                  decoded.SoMo1T_Filtertime_Delta = '0x'+(bytes[index++]).toString(16).padStart(2,'0') + ' ' + String(Temp_Value);
                  break;
                }
                default:
                {
                  // Removing all added properties from the "decoded" object with a deep clean
                  // https://stackoverflow.com/questions/19316857/removing-all-properties-from-a-object/19316873#19316873
                  // Object.keys(decoded).forEach(function(key){ delete decoded[key]; });
                  
                  // Clear all properties from the "decoded" object
                  decoded = {};
                  
                  // Add error code propertiy to the "decoded" object
                  decoded.parser_error = "Wrong Config-Info Channel or Data";
                  break;
                }
              }
            }
            break;
          }
          case 0x00:  //Status-Info
          {
            decoded.Frame_Type = "Status-Info";
            // Loop for collecting the application data 
            while (bytes.length > (index + 2))
            {
              channel = (bytes[index++]);  //Channel ID überspringen
              switch (bytes[index++]) //Sensor ID auswerten
              {
                case ID_device:  //Device-Status-Info
                {
                  if (bytes[index] & 0x01) {
                    decoded.Device_Event_Cyclic = "Y";
                  }
                  else {
                    decoded.Device_Event_Cyclic = "N";
                  }
                  if (bytes[index] & 0x02) {
                    decoded.Device_Event_Boot = "Y";
                  }
                  else {
                    decoded.Device_Event_Boot = "N";
                  }
                  if (bytes[index] & 0x04) {
                    decoded.Device_Event_Heartbeat = "Y";
                  }
                  else {
                    decoded.Device_Event_Heartbeat = "N";
                  }
                  if (bytes[index] & 0x08) {
                    decoded.Device_Event_Button = "Y";
                  }
                  else {
                    decoded.Device_Event_Button = "N";
                  }
                  if (bytes[index] & 0x10) {
                    decoded.Device_Event_IN1 = "Y";
                  }
                  else {
                    decoded.Device_Event_IN1 = "N";
                  }
                  if (bytes[index] & 0x20) {
                    decoded.Device_Event_IN2 = "Y";
                  }
                  else {
                    decoded.Device_Event_IN2 = "N";
                  }
                  decoded.Device_Eventflags = bytes[index];
                  index++;
                  if (bytes[index] & 0x01) {
                    decoded.IN1_Level = "Hi";
                  }
                  else {
                    decoded.IN1_Level = "Lo";
                  }
                  if (bytes[index] & 0x10) {
                    decoded.IN2_Level = "Hi";
                  }
                  else {
                    decoded.IN2_Level = "Lo";
                  }
                  if (bytes[index] & 0x02) {
                    decoded.IN1_Change = "Y";
                  }
                  else {
                    decoded.IN1_Change = "N";
                  }
                  if (bytes[index] & 0x20) {
                    decoded.IN2_Change = "Y";
                  }
                  else {
                    decoded.IN2_Change = "N";
                  }
                  decoded.Device_InputStates = bytes[index];
                  index++;
                  break;
                }
                case ID_DUS1:  //DUS1-Status-Info
                {
                  if (bytes[index] & 0x01) {
                    decoded.DUS1_Event_Cyclic = "Y";
                  }
                  else {
                    decoded.DUS1_Event_Cyclic = "N";
                  }
                  if (bytes[index] & 0x02) {
                    decoded.DUS1_Event_Boot = "Y";
                  }
                  else {
                    decoded.DUS1_Event_Boot = "N";
                  }
                  if (bytes[index] & 0x10) {
                    decoded.DUS1_Event_Threshold_1 = "Y";
                  }
                  else {
                    decoded.DUS1_Event_Threshold_1 = "N";
                  }
                  if (bytes[index] & 0x20) {
                    decoded.DUS1_Event_Threshold_2 = "Y";
                  }
                  else {
                    decoded.DUS1_Event_Threshold_2 = "N";
                  }
                  if (bytes[index] & 0x40) {
                    decoded.DUS1_Event_Threshold_Delta = "Y";
                  }
                  else {
                    decoded.DUS1_Event_Threshold_Delta = "N";
                  }
                  if (bytes[index] & 0x80) {
                    decoded.DUS1_Event_Error = "Y";
                  }
                  else {
                    decoded.DUS1_Event_Error = "N";
                  }
                  decoded.DUS1_Eventflags = bytes[index];
                  index++;
                  Temp_Value = (bytes[index++] * 256);
                  Temp_Value += bytes[index++];
                  if (Temp_Value == 8000)
                  {
                    decoded.DUS1_Distance = "Error"
                  }
                  else if (Temp_Value == 7999)
                  {
                    decoded.DUS1_Distance = "Unknown"
                  }
                  else if (Temp_Value == 7501)
                  {
                    decoded.DUS1_Distance = "Overflow"
                  }
                  else
                  {
                    decoded.DUS1_Distance = Temp_Value;
                    //decoded.DUS1_Distance_String = String(Temp_Value) + " mm";
                  }
                  if (bytes[index] == 255)
                  {
                    decoded.DUS1_Level = "Error"
                  }
                  else if (bytes[index] == 254)
                  {
                    decoded.DUS1_Level = "Unknown"
                  }
                  else if (bytes[index] <= 100)
                  {
                    decoded.DUS1_Level = bytes[index];
                    //decoded.DUS1_Level_String = String(bytes[index]) + " %";
                  }
                  index++;
                  break;
                }
                case ID_SoMo1H:  //SoMo1H-Status-Info
                {
                  if (bytes[index] & 0x01) {
                    decoded.SoMo1H_Event_Cyclic = "Y";
                  }
                  else {
                    decoded.SoMo1H_Event_Cyclic = "N";
                  }
                  if (bytes[index] & 0x02) {
                    decoded.SoMo1H_Event_Boot = "Y";
                  }
                  else {
                    decoded.SoMo1H_Event_Boot = "N";
                  }
                  if (bytes[index] & 0x10) {
                    decoded.SoMo1H_Event_Threshold_1 = "Y";
                  }
                  else {
                    decoded.SoMo1H_Event_Threshold_1 = "N";
                  }
                  if (bytes[index] & 0x20) {
                    decoded.SoMo1H_Event_Threshold_2 = "Y";
                  }
                  else {
                    decoded.SoMo1H_Event_Threshold_2 = "N";
                  }
                  if (bytes[index] & 0x40) {
                    decoded.SoMo1H_Event_Threshold_Delta = "Y";
                  }
                  else {
                    decoded.SoMo1H_Event_Threshold_Delta = "N";
                  }
                  if (bytes[index] & 0x80) {
                    decoded.SoMo1H_Event_Error = "Y";
                  }
                  else {
                    decoded.SoMo1H_Event_Error = "N";
                  }
                  decoded.SoMo1H_Eventflags = bytes[index];
                  index++;
                  if (bytes[index] == 255)
                  {
                    decoded.SoMo1H_Level = "Error"
                  }
                  else if (bytes[index] == 254)
                  {
                    decoded.SoMo1H_Level = "Unknown"
                  }
                  else if (bytes[index] <= 100)
                  {
                    decoded.SoMo1H_Level = bytes[index];
                    //decoded.SoMo1H_Level_String = String(bytes[index]) + " %";
                  }
                  index++;
                  Temp_Value = (bytes[index++] * 256);
                  Temp_Value += bytes[index++];
                  if (Temp_Value == 8000)
                  {
                    decoded.SoMo1H_Value = "Error"
                  }
                  else if (Temp_Value == 7999)
                  {
                    decoded.SoMo1H_Value = "Unknown"
                  }
                  else if (Temp_Value == 4100)
                  {
                    decoded.SoMo1H_Value = "Overflow"
                  }
                  else
                  {
                    decoded.SoMo1H_Value = Temp_Value;
                    //decoded.SoMo1H_Value_String = String(Temp_Value);
                  }
                  break;
                }
                case ID_SoMo1T:  //SoMo1T-Status-Info
                {
                  if (bytes[index] & 0x01) {
                    decoded.SoMo1T_Event_Cyclic = "Y";
                  }
                  else {
                    decoded.SoMo1T_Event_Cyclic = "N";
                  }
                  if (bytes[index] & 0x02) {
                    decoded.SoMo1T_Event_Boot = "Y";
                  }
                  else {
                    decoded.SoMo1T_Event_Boot = "N";
                  }
                  if (bytes[index] & 0x10) {
                    decoded.SoMo1T_Event_Threshold_1 = "Y";
                  }
                  else {
                    decoded.SoMo1T_Event_Threshold_1 = "N";
                  }
                  if (bytes[index] & 0x20) {
                    decoded.SoMo1T_Event_Threshold_2 = "Y";
                  }
                  else {
                    decoded.SoMo1T_Event_Threshold_2 = "N";
                  }
                  if (bytes[index] & 0x40) {
                    decoded.SoMo1T_Event_Threshold_Delta = "Y";
                  }
                  else {
                    decoded.SoMo1T_Event_Threshold_Delta = "N";
                  }
                  if (bytes[index] & 0x80) {
                    decoded.SoMo1T_Event_Error = "Y";
                  }
                  else {
                    decoded.SoMo1T_Event_Error = "N";
                  }
                  decoded.SoMo1T_Eventflags = bytes[index];
                  index++;
                  Temp_Value = ((bytes[index] * 256) + bytes[index + 1]);
                  if (Temp_Value == 8000)
                  {
                    decoded.SoMo1T_Value = "Error"
                  }
                  else if (Temp_Value == 7999)
                  {
                    decoded.SoMo1T_Value = "Unknown"
                  }
                  else if (Temp_Value == 1201)
                  {
                    decoded.SoMo1T_Value = "Overflow"
                  }
                  else if (Temp_Value == 65135) //-401
                  {
                    decoded.SoMo1T_Value = "Underflow"
                  }
                  else
                  {
                    // Convert to 16 bit signed value
                    if (Temp_Value > 0x7fff) {
                      Temp_Value -= 0x10000;
                    }
                    Temp_Value *= 0.1;	// Adjust the temperature resolution
                    decoded.SoMo1T_Value = String(Temp_Value.toFixed(1));
                    //decoded.SoMo1T_Value_String = String(Temp_Value.toFixed(1)) + " °C";
                  }
                  index++;
                  index++;
                  break;
                }
                default:
                {
                  // Removing all added properties from the "decoded" object with a deep clean
                  // https://stackoverflow.com/questions/19316857/removing-all-properties-from-a-object/19316873#19316873
                  // Object.keys(decoded).forEach(function(key){ delete decoded[key]; });
                  
                  // Clear all properties from the "decoded" object
                  decoded = {};
                  
                  // Add error code propertiy to the "decoded" object
                  decoded.parser_error = "Frame Type Failure";
                  break;
                }
              }
            }
            break;
          }
          case 0x03:  //Firmware-ID-Info
          {
            decoded.Frame_Type = "Firmware-ID-Info";
            decoded.Firmware_ID = firmwaretype[(bytes[2]*256 + bytes[3])];
            break;
          }
          case 0xfa:  //Rejoin-Info
          {
            decoded.Frame_Type = "Rejoin-Info"
            //decoded.Rejoin_Time = (bytes[2]*256 + bytes[3]);
            
            Temp_Value = ((bytes[index] & 0x7f)*256 + bytes[index+1]);
            if (bytes[index] & 0x80)
            { //single     
              Temp_Value = (String(Temp_Value) + ' h');
            }
            else
            { //cyclic
              if (Temp_Value)
              {
                Temp_Value = (String(Temp_Value) + ' h');
              }
              else
              {
                Temp_Value = "Off";
              }
            }
            decoded.Rejoin_Time = '0x'+(bytes[index]*256 + bytes[index+1]).toString(16).padStart(4,'0') + ' ' + String(Temp_Value);
            break;
          }
          case 0xf8:  //Spreading-Info
          {
            decoded.Frame_Type = "Spreading-Info";
            //decoded.SF = bytes[index];
            
            if (bytes[index])
            {
              Temp_Value = String(bytes[index]);
            }
            else
            {
              Temp_Value = "ADR";
            }
            decoded.SF = '0x'+(bytes[index]).toString(16).padStart(2,'0') + ' ' + String(Temp_Value);
            break;
          }
          default:
          {
            // Add error code propertiy to the "decoded" object
            decoded.parser_error = "Frame Type Failure";
            break;
          }
        }
      }
      else {
        decoded.parser_error = "Not enough data";
      }
    }
    else {
      decoded.parser_error = "Not enough data";
    }
  }
  else {
    decoded.parser_error = "Wrong Port Number";
  }

  return {
      data: decoded
  };
}
