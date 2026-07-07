---
title: "LoRaWAN Infrared Sensors"
linkTitle: "Infrared"
description: "Browse LoRaWAN infrared sensors that measure heat and motion via IR. Compare range, accuracy, battery life, and frequency plans."
lede: "LoRaWAN infrared sensors detect heat signatures, surface temperature, and movement using IR light, then report wirelessly over long-range, low-power networks."
category: "sensor"
related: ["surface-temperature", "temperature", "motion", "pir", "occupancy", "light"]
faq:
  - q: "What does a LoRaWAN infrared sensor measure?"
    a: "It depends on the IR sensing method. Thermopile and pyroelectric (PIR) elements detect emitted heat to gauge non-contact surface temperature or human/animal movement, while active IR sensors emit and read reflected light to detect presence, distance, or proximity. The device transmits these readings over LoRaWAN."
  - q: "How do infrared LoRaWAN sensors send data?"
    a: "They sample the IR element on a schedule or on event triggers, then transmit a compact binary payload through a LoRaWAN gateway to your network server. A payload codec decodes raw bytes into values such as temperature in degrees Celsius or an occupancy/motion flag."
  - q: "What should I check when choosing an infrared sensor?"
    a: "Compare the measurement type and range, accuracy and field of view, battery life and reporting interval, enclosure IP rating for the deployment environment, and supported regional frequency plans like EU868 or US915."
---
Infrared (IR) sensing uses heat radiation or reflected IR light to measure conditions without physical contact. In LoRaWAN devices, this typically takes one of a few forms: thermopile sensors read emitted heat to estimate non-contact surface temperature, pyroelectric (PIR) elements detect the moving heat of people or vehicles, and active IR emitters measure reflected light for presence, proximity, or distance.

A LoRaWAN IR device samples its sensor element on a fixed interval or when an event occurs, packs the result into a small binary payload, and sends it through a gateway to a network server. A payload codec then decodes the bytes into usable values such as temperature or a motion event. Common uses include people counting and occupancy in smart buildings, equipment and machinery temperature monitoring, security and intrusion alerts, and livestock or process heat tracking.

When comparing devices, weigh:

- Measurement type, range, accuracy, and field of view
- Battery life versus reporting frequency
- Enclosure IP rating and supported frequency plans
