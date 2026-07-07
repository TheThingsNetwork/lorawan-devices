---
title: "LoRaWAN Water Sensors"
linkTitle: "Water"
description: "Browse LoRaWAN water sensors for detecting presence, leaks, and levels. Compare range, battery life, IP rating, and frequency plans."
lede: "LoRaWAN water sensors detect the presence of water and report leaks, levels, or flow wirelessly over long ranges on low power."
category: "sensor"
related: ["level", "moisture", "conductivity", "turbidity", "ph", "leaf-wetness"]
faq:
  - q: "How do LoRaWAN water sensors detect leaks?"
    a: "Most use conductive probes, capacitive pads, or a sensing cable that registers a change when water bridges the contacts. When water is detected, the device transmits an uplink over LoRaWAN to your network server, often with a battery and tamper status. Many also send periodic heartbeat messages so you know the sensor is alive even when dry."
  - q: "What is the battery life of a LoRaWAN water leak sensor?"
    a: "Because devices spend most of their time idle and only transmit on an event or a slow heartbeat interval, many run for several years on a single coin cell or AA pack. Actual life depends on reporting frequency, spreading factor, link quality, and operating temperature."
  - q: "Where are LoRaWAN water sensors used?"
    a: "Common uses include leak detection in buildings, server rooms, basements, and utility cabinets, plus water presence monitoring in pipes, tanks, and pump rooms. They are widely deployed in facilities management, insurance risk reduction, and smart-building projects."
---
Water sensing covers the detection of liquid water presence, most commonly leaks, flooding, or unexpected moisture. LoRaWAN water sensors typically use conductive contacts, capacitive pads, or a flexible sensing cable that triggers when water is present, then send an uplink to your network server over a long-range, low-power radio link.

Reported data usually arrives as a simple wet/dry state plus event timestamps, with periodic heartbeat messages confirming the device is online. Some products combine water detection with temperature or humidity to give richer environmental context.

Typical deployments include:

- Buildings, basements, and server rooms for early leak detection
- Utility cabinets, pump rooms, and tanks for water presence monitoring
- Facilities management and insurance-driven risk reduction

When comparing devices, look at detection method and sensitivity, enclosure and IP rating for wet environments, battery life relative to reporting interval, the supported regional frequency plans, and whether a payload codec or decoder is provided for your platform.
