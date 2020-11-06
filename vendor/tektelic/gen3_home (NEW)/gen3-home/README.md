Sensor Version:
- 1.0

For testing the encoder and decoder:
- sh test.sh

For using on the NS:
- Copy the content of *decoder_home_sensor.js* and *encoder_home_sensor.js* files to the respective location while creating the custom data converter
- For the decoder, exclude the line -- *function Decoder(bytes, port) {* -- and the closing curly bracket (*}*) at the end
- For the encoder, exclude the line -- *function Encoder(data) {* -- and the closing curly bracket ("}") at the end