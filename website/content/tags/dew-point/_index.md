---
title: "LoRaWAN Dew Point Sensors"
linkTitle: "Dew Point"
description: "Browse LoRaWAN dew point sensors that report condensation-risk readings wirelessly for HVAC, agriculture, storage, and building monitoring."
lede: "LoRaWAN dew point sensors track the temperature at which moisture condenses, flagging condensation risk across long-range, low-power deployments."
category: "sensor"
related: ["humidity", "temperature", "barometer", "vapor-pressure", "vapor-pressure-deficit", "pressure"]
faq:
  - q: "How do LoRaWAN sensors measure dew point?"
    a: "Most devices do not have a dedicated dew point probe. They measure air temperature and relative humidity, then compute dew point on-board (or in the decoder) using a psychrometric formula and transmit the result over LoRaWAN."
  - q: "What dew point accuracy can I expect?"
    a: "Dew point accuracy depends on the underlying temperature and humidity sensor specs. Compare the rated temperature accuracy, humidity accuracy, and measurement range, since errors in both inputs propagate into the calculated dew point value."
  - q: "Where are LoRaWAN dew point sensors used?"
    a: "They are common in HVAC and building monitoring, cold storage and refrigeration, greenhouses, museums and archives, and industrial process areas where condensation can cause corrosion, mold, or equipment damage."
---
Dew point is the temperature at which air becomes saturated and water vapor begins to condense. It is a more reliable indicator of condensation and "muggy" conditions than relative humidity alone, because it accounts for both moisture content and temperature together.

LoRaWAN dew point devices typically derive the value from a combined temperature and humidity sensor, computing the result on-device or in the payload decoder. Readings are sent at scheduled intervals over long-range, low-power radio, letting battery-powered nodes run for years and reach areas without Wi-Fi or cellular coverage. Common applications include HVAC and building control, cold storage, greenhouses, archives, and industrial corrosion prevention.

When comparing devices, evaluate:

- Temperature and humidity accuracy and range (these drive dew point accuracy)
- Battery life and reporting interval
- Enclosure rating (IP class) for damp or outdoor sites
- Supported regional frequency plans (EU868, US915, AS923, and others)
- Availability of a payload codec for your network server
