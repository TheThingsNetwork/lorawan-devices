---
title: "LoRaWAN Pressure Sensors"
linkTitle: "Pressure"
description: "Browse LoRaWAN pressure sensors for pipes, tanks and HVAC. Compare range, accuracy, battery life and frequency plans in the Device Repository."
lede: "LoRaWAN pressure sensors measure gas or liquid pressure and report readings wirelessly over long ranges with multi-year battery life."
category: "sensor"
related: ["barometer", "level", "water", "vapor-pressure", "temperature", "analog-input"]
faq:
  - q: "What does a LoRaWAN pressure sensor measure?"
    a: "It measures the force a gas or liquid exerts on a surface, typically reported in bar, psi, kPa or Pa. Sensors may report gauge, absolute or differential pressure depending on the model, and many also include temperature."
  - q: "What range and accuracy should I look for?"
    a: "Match the measuring range to your application, for example a few bar for water mains versus higher ranges for industrial process lines. Check the full-scale accuracy, overpressure rating and whether output is gauge, absolute or differential."
  - q: "How long do the batteries last?"
    a: "Most LoRaWAN pressure sensors run for years on internal batteries because readings are sent infrequently. Battery life depends on reporting interval, spreading factor and operating temperature, so review the vendor's stated figures."
---
Pressure sensing measures the force exerted by a gas or liquid on a surface, reported in units such as bar, psi, kPa or Pa. Sensors can be gauge (relative to atmosphere), absolute, or differential between two points, and many devices pair pressure with temperature for fuller process context.

LoRaWAN pressure sensors take readings at a set interval, encode them into a compact payload, and transmit over long range to a gateway and your network server. Because uplinks are short and infrequent, devices run for years on internal batteries while reaching remote pipes, tanks and chambers.

Typical uses include water and gas distribution monitoring, leak and burst detection, tank and reservoir level inference, pump and filter performance, and HVAC or compressed-air systems.

When comparing devices, weigh:

- Measuring range, accuracy and overpressure rating
- Gauge, absolute or differential output
- Battery life and reporting interval
- Enclosure rating and process connection
- Supported frequency plans and the payload codec for decoding readings
