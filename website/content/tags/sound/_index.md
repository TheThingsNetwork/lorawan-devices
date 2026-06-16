---
title: "LoRaWAN Sound Sensors"
linkTitle: "Sound"
description: "Browse LoRaWAN sound sensors that measure noise in decibels and report wirelessly for long-range, low-power acoustic monitoring."
lede: "LoRaWAN sound sensors measure ambient noise levels and report decibel readings wirelessly over long ranges on minimal power."
category: "sensor"
related: ["light", "occupancy", "motion", "temperature", "humidity", "co2"]
faq:
  - q: "What does a LoRaWAN sound sensor measure?"
    a: "It measures ambient acoustic levels, typically reported as sound pressure level in decibels (dB). Many devices apply A-weighting (dBA) to approximate human hearing and may report minimum, maximum, and average values over a reporting interval."
  - q: "How does a LoRaWAN sound sensor send data?"
    a: "A built-in microphone samples noise locally, and the device transmits compact decibel readings over LoRaWAN to a gateway and network server. Long range and low power let battery units run for years, while uplink intervals are configurable to suit each application."
  - q: "What should I compare when choosing a LoRaWAN sound sensor?"
    a: "Compare measurement range and accuracy, weighting (dBA versus dBC), reporting interval, battery life or power source, enclosure rating for indoor or outdoor use, supported regional frequency plans, and the payload codec for decoding readings."
---
Sound sensing measures the level of ambient acoustic energy in an environment, usually expressed as sound pressure level in decibels (dB). Many LoRaWAN devices apply A-weighting (dBA) to reflect how loud noise seems to people, and some report minimum, maximum, and average values across each interval rather than a single instantaneous figure.

A LoRaWAN sound sensor captures audio with an onboard microphone, computes a level locally, and transmits only the resulting numeric readings — not raw audio — to a gateway and network server. This keeps payloads small, preserves privacy, and lets battery-powered units operate for long periods at long range.

Common uses include smart-city noise monitoring, workplace and occupational safety, construction-site compliance, hospitality, and tenant comfort in offices and apartments. When comparing devices, weigh:

- Measurement range, accuracy, and weighting (dBA vs dBC)
- Reporting interval and battery life or power source
- Enclosure rating for indoor or outdoor placement
- Supported regional frequency plans and payload codec

Many sound sensors pair acoustic readings with light, occupancy, or environmental data.
