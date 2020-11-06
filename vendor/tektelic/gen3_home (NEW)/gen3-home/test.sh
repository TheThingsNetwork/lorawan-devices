#!/bin/sh

echo "Testing encoder"
cat encoder_home_sensor.js encoder_home_sensor-test.js >encoder_home_sensor-full-test.js
jjs encoder_home_sensor-full-test.js
rm encoder_home_sensor-full-test.js

echo "\n"

echo "Testing decoder"
cat ../polyfill/*.js decoder*.js > decoder.js
jjs decoder.js
rm decoder.js
