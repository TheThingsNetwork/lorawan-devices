---
title: "LoRaWAN bVOC Sensors"
linkTitle: "bVOC"
description: "Browse LoRaWAN bVOC sensors that estimate volatile organic compound levels as an ethanol-equivalent and report them wirelessly over long range."
lede: "LoRaWAN bVOC sensors estimate air-quality VOC levels as an ethanol-equivalent value and transmit readings wirelessly over long-range, low-power networks."
category: "sensor"
related: ["tvoc", "iaq", "co2", "humidity", "temperature", "barometer"]
faq:
  - q: "What does a LoRaWAN bVOC sensor measure?"
    a: "It outputs a breath-VOC equivalent estimate, typically expressed as an ethanol-equivalent value, derived by an onboard metal-oxide gas sensor and its algorithm. bVOC is usually reported alongside related air-quality outputs such as TVOC, an IAQ index, CO2 equivalent, temperature, and humidity."
  - q: "How does a bVOC sensor send data over LoRaWAN?"
    a: "The device samples its gas-sensing element on a fixed interval, encodes the estimate into a compact uplink payload, and transmits it to a LoRaWAN gateway. A payload codec on the network server decodes the bytes into readable values. Reporting intervals are configurable to balance data resolution against battery life."
  - q: "Where are LoRaWAN bVOC sensors used?"
    a: "They support indoor air-quality monitoring in offices, classrooms, and homes, and feed building management and ventilation control systems where occupant comfort and air freshness matter."
---
bVOC, short for breath-VOC equivalent, is a calculated air-quality output expressed as an ethanol-equivalent concentration. It is derived by a metal-oxide (MOX) gas-sensing element together with an onboard algorithm, and it typically appears as one of several outputs from an indoor air-quality module rather than as a standalone measurement.

A LoRaWAN bVOC device samples its gas sensor at a configurable interval, packs the result into a small uplink payload, and sends it to a gateway for forwarding to a network server, where a payload codec decodes the bytes. Because LoRaWAN is low-power and long-range, sensors can run for long periods on battery while covering large indoor spaces.

Typical applications include office, classroom, and residential air-quality monitoring and ventilation control. When comparing devices, consider:

- Reporting interval and sensor warm-up behavior
- Battery life and power source
- Enclosure rating for the deployment environment
- Supported regional frequency plans
- Availability of a decoded payload codec and companion outputs like TVOC, IAQ, CO2, temperature, and humidity
