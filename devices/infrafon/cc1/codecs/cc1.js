let downlinkId = 0; // Global downlink id that increments with each new packet

/**
 * 
 * @param {string} hexString 
 * @description Parse the hexString payload
 * @returns Decoded representation of the payload as an array of TLV objects
 */
function parsePayload (hexString) {
  var decodedPayload = [];

  var b0 = parseInt('0x' + hexString[0] + hexString[1]);

  //DlId, last downlink id received
  decodedPayload.push({ "t": 'dlId', "l": 0, "v": b0 & 15 });

  //PayloadVersion -> 01
  decodedPayload.push({ "t": 'payloadVersion', "l": 0, "v": (b0 & 48) >> 4 });

  //Will listen always 1 + parity bit
  decodedPayload.push({ "t": 'willListen', "l": 0, "v": ((b0 & 64)) });

  // the number of TLV elements present in the subsequent data block (0-255)
  var payloadLength = parseInt('0x' + hexString[2] + hexString[3]);

  if (payloadLength !== (hexString.length / 2) - 2) {
    decodedPayload.push({ "t": 'payloadLength', "l": -1, "v": 'payload length incoherence detected' });
  }

  var i = 4;
  while (i < hexString.length) {
    var tVal, lVal = 0;
    var valVal = "";
    // extracting tag value
    tVal = hexString[i] + hexString[i + 1] + "";
    // extracting length value
    lVal = parseInt("0x" + hexString[i + 2] + hexString[i + 3]);
    // extracting data
    for (var j = i + 4; j < i + 4 + (lVal * 2); j = j + 2) {
      valVal += "" + hexString[j] + hexString[j + 1];
    }
    decodedPayload.push({ "t": tVal, "l": lVal, "v": parseHexString(valVal) });
    i = i + 4 + (lVal * 2);
  }
  return decodedPayload;
}

/**
 * Interprets an array of TLV objects using a given mapping.
 * 
 * @param {object} tlvmap - A mapping of descriptions to TLV tags.
 * @param {Array} tlvs - Array of TLV objects with properties `t` (tag) and `v` (value).
 * @returns {object} - An object mapping descriptions to their corresponding values.
 */
function interpretTlv(tlvmap, tlvs) {
  // Reverse the tlvmap to map numbers to descriptions
  const numToDescription = {};
  for (const key in tlvmap) {
      if (tlvmap.hasOwnProperty(key)) {
          numToDescription[tlvmap[key]] = key;
      }
  }
  
  // Initialize the result object
  const result = {};
  
  // Iterate over the decodedPayload
  tlvs.forEach(entry => {
      if (entry.l > 0) {
          const tagNum = entry.t;
          const value = entry.v;
          
          // Get the description from the tlvmap
          const description = numToDescription[parseHexString(tagNum)];
          
          if (description) {
              result[description] = value;
          }
      }
  });
  
  return result;
}

/**
 * Converts a hex string to a byte array.
 * 
 * @param {string} hex - The hex string to convert.
 * @returns {Uint8Array} - The byte array representation of the hex string.
 */
function hexToBytes(hexString) {
  // Convert a hex string to a byte array
  let bytes = [];
  for (let i = 0; i < hexString.length; i += 2) {
      bytes.push(parseInt(hexString.substr(i, 2), 16));
  }
  return new Uint8Array(bytes);
}
/**
 * Decodes a byte array based on specific encoding rules.
 * 
 * @param {Uint8Array} data - The byte array to decode.
 * @returns {number | string | object} - The decoded value:
 *   - A number for single-byte or 16-bit little-endian integers.
 *   - A boolean as 0 or 1.
 *   - A string or object for UTF-8 encoded JSON.
 * @throws {Error} - If JSON decoding fails.
 */
function decodeValue(data) {
  // Decode the value based on the given length rules
  if (data.length < 3) {
      // Handle 16-bit integers (little-endian format) or 1-byte integers
      if (data.length === 1) {
          // Single byte integer
          return data[0];
      } else if (data.length === 2) {
          // Two bytes integer (16-bit)
          return data[0] | (data[1] << 8);
      }
  } else {
      // Handle UTF-8 encoded JSON string
      try {
          const text = new TextDecoder('utf-8').decode(data);
          return JSON.parse(text);
      } catch (e) {
          throw new Error("Failed to decode JSON string");
      }
  }
}

/**
 * Encode a value to its hex representation.
 * 
 * @param {any} value - The value to encode.
 * @returns {string} - The encoded value as a hex string.
 */
function encodeValueToHex(value) {
    if (typeof value === 'number') {
        if (Number.isInteger(value) && value >= 0 && value <= 65535) {
            if (value < 256) {
                // Single byte integer
                return value.toString(16).padStart(2, '0').toUpperCase();
            } else {
                // Two bytes integer (16-bit, little-endian)
                let byte1 = (value & 0xFF).toString(16).padStart(2, '0').toUpperCase();          // Least significant byte
                let byte2 = ((value >> 8) & 0xFF).toString(16).padStart(2, '0').toUpperCase();  // Most significant byte
                return byte1 + byte2;
            }
        }
    }
    
    if (typeof value === 'boolean') {
        // Boolean as single byte (00 or 01)
        return value ? '01' : '00';
    }
    
    // Encode as UTF-8 JSON string for other data types
    let jsonString = JSON.stringify(value);
    let encoder = new TextEncoder();  // Use TextEncoder to convert string to UTF-8 bytes
    let utf8Array = encoder.encode(jsonString);
    
    // Convert each byte to a two-character hex string
    let hexString = Array.from(utf8Array, byte => byte.toString(16).padStart(2, '0').toUpperCase()).join('');
    return hexString;
}

/**
 * Parses a hex string according to the specified rules.
 * 
 * This function takes a hex string and processes it to decode the value according to specific encoding rules:
 * - Integers (0 to 65535) are encoded directly in little-endian format.
 * - Booleans are treated as 1-byte integers with values 0 or 1.
 * - Strings and other complex types are encoded as UTF-8 JSON strings.
 * 
 * @param {string} hexString - The hex string to be parsed. Each pair of characters in the string represents a byte.
 * @returns {number | string | object} - The decoded value, which can be:
 *   - A number (integer or boolean) if the input represents an integer or boolean.
 *   - A string or an object if the input represents a UTF-8 encoded JSON string.
 */
function parseHexString(hexString) {
  // Parse a hex string according to the specified rules
  const byteData = hexToBytes(hexString);
  return decodeValue(byteData);
}

/**
 * Recursively flattens a nested JSON object.
 * 
 * @param {object} obj - The object to flatten.
 * @param {string} parentKey - The base key string to prepend to each key.
 * @param {object} res - The result object to accumulate flattened values.
 * @returns {object} - The flattened object.
 */
function flattenObject(obj, parentKey = '', res = {}) {
  for (const [key, value] of Object.entries(obj)) {
      const newKey = parentKey ? `${parentKey}-${key}` : key;
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          flattenObject(value, newKey, res);
      } else {
          // Special case for 'msg' key to provide specific value
          if (newKey === 'pager-data-msg') {
              res[newKey] = 'Help is on the way!';
          } else {
              res[newKey] = value;
          }
      }
  }
  return res;
}

/**
 * Transforms the input object based on the TLV map to produce an output object.
 * 
 * @param {object} inputObject - The object with keys in the format "prefix-key" and values to be transformed.
 * @param {object} tlvMap - The TLV map containing the mapping from key to TLV value.
 * @returns {object} - The resulting output object with TLV values as keys and corresponding input values.
 */
function transformBasedOnTLV(inputObject, tlvMap) {
  const output = {};

  for (const [inputKey, value] of Object.entries(inputObject)) {
      // Extract the key part from the input key (e.g., "app-dev-power-gauge" => "dev-power-gauge")
      const keyPart = inputKey.split('-').slice(1).join('-');

      // Look up the TLV value for the key part
      const tlvKey = tlvMap[keyPart];

      if (tlvKey !== undefined) {
          // Map the TLV key to the corresponding value from the input object
          output[tlvKey] = value;
      } else {
          console.warn(`Key "${keyPart}" not found in TLV map.`);
      }
  }

  return output;
}

/**
 * Calculates the parity bit for a given byte to ensure even parity.
 *
 * @param {number} byte - The byte for which to calculate the parity bit.
 * @returns {number} - The parity bit (0 or 1).
 */
function calculateParity(byte) {
    let parity = 0;
    while (byte) {
        parity ^= (byte & 1);
        byte >>= 1;
    }
    return parity;
}

/**
 * Creates the first byte (Byte 0) for the packet with the specified downlink ID.
 *
 * @param {number} downlinkId - The current downlink ID (0-15).
 * @returns {number} - The constructed Byte 0.
 */
function createByte0(downlinkId) {
    let byte0 = (downlinkId & 0x0F) | (1 << 4); // bits 0-3 for downlinkId, bits 4-5 for protocolVersion (1)
    byte0 &= ~(1 << 6); // bit 6 is RFU and set to 0
    let parityBit = calculateParity(byte0) % 2 === 0 ? 0 : 1; // Ensure even parity
    byte0 |= (parityBit << 7); // bit 7 for parity bit
    return byte0;
}

/**
 * Converts an input array into a hex byte string suitable for sending to a device.
 *
 * @param {Object} data - The input array containing key-value pairs where keys are tags and values are the data.
 * @returns {string} - The resulting hex byte string.
 */
function arrayToHexBytes(data) {
    let byte0 = createByte0(downlinkId);
    let byte1 = Object.keys(data).length; // Number of TLV elements

    let tlvData = [];
    for (const [key, value] of Object.entries(data)) {
        let tag = parseInt(key);
        let valueBytes;
        if (typeof value === 'string') {
            valueBytes = Array.from(value).map(c => c.charCodeAt(0));
        } else if (typeof value === 'number') {
            valueBytes = [value];
        } else {
            throw new Error('Unsupported value type');
        }
        let length = valueBytes.length;
        tlvData.push(tag, length, ...valueBytes);
    }

    // Increment downlinkId for next packet
    downlinkId = (downlinkId + 1) & 0x0F; // Keep downlinkId within 4 bits

    // Combine all parts into a single byte array
    let resultBytes = [byte0, byte1, ...tlvData];

    // Convert byte array to hex string
    let hexString = resultBytes.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hexString;
}

/**
 * Takes a JSON object, flattens it, transforms it based on a TLV map, and converts it to a hex byte string.
 *
 * @param {Object} jsonObj - The JSON object to be processed.
 * @param {Object} tlvMap - The map defining how to transform the flattened object.
 * @returns {string} - The resulting hex byte string.
 */
function downlink(jsonObj, tlvMap) {
    return arrayToHexBytes(transformBasedOnTLV(flattenObject(jsonObj), tlvMap));;
}

/**
 * Takes a hex byte string, parses it using `parsePayload`, and interprets the TLV data using `interpretTlv` to return a JSON object.
 *
 * @param {string} hexString - The input hex byte string to be processed.
 * @returns {Object} - The resulting JSON object after parsing and interpreting the TLV data.
 */
function uplink(hexString) {
    return interpretTlv(tlvMap, parsePayload(hexString));
}



/**
 * Encoding of the value part of the TLV (Type-Length-Value) structure.
 * 
 * - If the value is `null`, it is encoded with a length of 0, and no value bits are present.
 * - For integers between 0 and 65535:
 *   - Values less than 256 are encoded as a single byte.
 *   - Values 256 or greater are encoded as two bytes in little-endian format (least significant byte first).
 * - For booleans:
 *   - Encoded as a single byte with values `0` (false) or `1` (true).
 * - For all other value types:
 *   - Encoded as a UTF-8 JSON string. The entire JSON string is included within the TLV.
 *   - Note: The TLV cannot be split across multiple packets due to message size limits.
 *

 Example JSON message

const jsonTestMessage = {
  "app": {
      "dev": {
          "power": {
              "tempC": 33.29999,
              "ext": true,
              "charging": false,
              "voltage": 3.814,
              "gauge": 40
          }
      },
      "pager": {
          "data": {
              "msg": "Help is on the way!"
          },
          "actions": {
              "gotoPage": 2
          }
      }
  }
};

 Example TLV map
const tlvMap = {
  "dev-power-gauge": 1,
  "pager-data-msg": 2,
  "pager-actions-gotoPage": 3
}; */