function getActiveAlerts(bytes, startIndex) {
  
    const UmeterAlertKinds = {
    0x01: "Empty_Pipe_Alert",
    0x02: "General_Error_Alert",
    0x04: "Low_Signal_Alert",
    0x08: "Leak_Detect_Alert",
    0x10: "No_Usage_for_30_Days_Alert",
    0x20: "Reverse_Flow_Alert",
    0x40: "Burst_Pipe_Alert",
    0x80: "Low_Batt_Alert",
    0x100: "Leak_Detect_Low_Alert",
    0x200: "Leak_Detect_High_Alert"
  };  
  
  const low  = bytes[startIndex];
  const high = bytes[startIndex + 1];

  const alertMask = (high << 8) | low;
  const activeAlerts = [];

  for (const [key, name] of Object.entries(UmeterAlertKinds)) {
    const bit = Number(key);  // keys are strings → convert to number
    if (alertMask & bit) {
      activeAlerts.push(name);
    }
  }

  return { alertMask, activeAlerts };
}

function processSensorMessage91(input, hexString, msgIndex) {
    const bytes = input.bytes;

    // Compute the reading
    const readingIndexes = [msgIndex + 7, msgIndex + 8, msgIndex + 9, msgIndex + 10];
    const readingStr = readingIndexes.map(i => bytes[i].toString(16).padStart(2, '0')).reverse().join('');
    const theReading = parseInt(readingStr, 16);
    
     // Compute the timestamp
    const timestampIndexes = [msgIndex + 1, msgIndex + 2, msgIndex + 3, msgIndex + 4];
    const secondsStr = timestampIndexes.map(i => bytes[i].toString(16).padStart(2, '0')).reverse().join('');
    const startDate = new Date('1970-01-01T00:00:00Z');
    const milliseconds = parseInt(secondsStr, 16) * 1000;
    const date = new Date(startDate.getTime() + milliseconds);

    const now = new Date();

    let sensor1Type = input.bytes[msgIndex + 5].toString(16);
    if (sensor1Type === "73")
    {
      const { alertMask, activeAlerts } = getActiveAlerts(bytes, msgIndex + 13);
      return {
          data: {
              msgIndex: msgIndex, 
              alertMask,
              activeAlerts,
              msg: hexString,
              rxTimeStamp: now.toString(),
              readTimeStamp: date.toString(),
              reading: theReading
          },
          warnings: [],
          errors: []
      };
    }

    // Default return for other sensor types
    return {
        data: {
             msgIndex: msgIndex,  
             sensor1Type:sensor1Type,
            msg: hexString,
            rxTimeStamp: now.toString(),
            readTimeStamp: date.toString(),
            reading: theReading
        },
        warnings: [],
        errors: []
    };
}

function findSubmessageIndex(hexString, typeToFind) {
  const bytes = hexString.split(' ').map(b => parseInt(b, 16));
  let index = 1;

  while (index < bytes.length) {
    const length = bytes[index];
    const type = bytes[index + 1];

    if (type === typeToFind) {
      return index + 1;
    }

    index += length; // move to the next submessage
  }

  return -1; // not found
}

function decodeUplink(input) 
{
  let msgIndex = 0;
  let hexString = input.bytes.map(byte => byte.toString(16).padStart(2, '0')).join(' ');
  var now = new Date();
  try
  {
    let msgType = input.bytes[0].toString(16).padStart(2, "0");
    if (msgType == "ff")
    {
      msgIndex = findSubmessageIndex(hexString, 0x91);
      if (msgIndex < 0)
      {
        return {
          data: {
            msg: hexString,
            rxTimeStamp: now.toString()
          },
          warnings: [],
          errors: []
        };     
      }
      return processSensorMessage91(input, hexString, msgIndex);
    }    
    else if (msgType != "91")
    {
      return {
        data: {
          msgType: input.bytes[0].toString(16).padStart(2, "0"),
          msg: hexString,
          rxTimeStamp: now.toString()
        },
        warnings: [],
        errors: []
      };
    }
    else
      return processSensorMessage91(input, hexString, msgIndex);
  }
  catch (err) 
  {
    return {
      data: {
        msg: hexString,
        error: err.toString()
      },
      warnings: ["Decoder fallback due to error"],
      errors: []
    };
  }
}
