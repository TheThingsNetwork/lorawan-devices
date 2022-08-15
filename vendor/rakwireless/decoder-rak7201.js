function Decoder(bytes, port) 
{
  var decoded = {};
  
  // Subtract 64 to show actual button number pressed
  // Default firmware sends A,B,C and D
  decoded.button_pressed = bytes - 64; 
  
  return decoded;

}
