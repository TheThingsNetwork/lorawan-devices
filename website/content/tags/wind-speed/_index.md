---
title: "LoRaWAN Wind Speed Sensors"
linkTitle: "Wind Speed"
description: "Browse LoRaWAN wind speed sensors and anemometers in the Device Repository. Compare range, accuracy, power, IP rating and frequency plans."
lede: "LoRaWAN wind speed sensors stream anemometer readings over long ranges on low power, ideal for remote and outdoor monitoring."
category: "sensor"
related: ["wind-direction", "precipitation", "rainfall", "barometer", "temperature", "humidity"]
faq:
  - q: "How does a LoRaWAN wind speed sensor work?"
    a: "An anemometer (cup, vane, or ultrasonic) measures air movement and converts it to a wind speed value. The LoRaWAN node samples that reading, encodes it into a small payload, and transmits it wirelessly to a gateway, which forwards it to a network server and your application."
  - q: "What range and battery life can I expect?"
    a: "LoRaWAN reaches several kilometres in rural areas and lower distances in dense urban settings. Battery life depends on reporting interval, spreading factor, and sensor type; ultrasonic units draw more than mechanical ones, so check the vendor datasheet for your duty cycle."
  - q: "Which frequency plan do I need?"
    a: "Choose a device certified for your region's plan, such as EU868, US915, AS923, or AU915. Confirm the supported plan in each device's profile before deployment so it operates legally on your local LoRaWAN network."
---
Wind speed sensing measures how fast air is moving, typically in metres per second or kilometres per hour. The reading comes from an anemometer: spinning-cup or propeller designs detect rotation, while ultrasonic units measure sound-pulse travel time and have no moving parts to wear out.

A LoRaWAN wind speed device pairs the anemometer with a low-power radio. It samples the wind at set intervals, packs the value (often alongside gust or average readings) into a compact payload, and sends it to a nearby gateway. A payload codec decodes the bytes into usable values in your application server.

These sensors support agriculture, smart cities, renewable energy site assessment, building safety, port and crane operations, and weather monitoring where cabling is impractical.

When comparing devices, weigh:

- Measurement range and accuracy, plus gust handling
- Power source and battery life at your reporting interval
- Enclosure rating (IP65 or higher) for outdoor exposure
- Supported regional frequency plans and the available payload codec
