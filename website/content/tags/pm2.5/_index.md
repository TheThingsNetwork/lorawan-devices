---
title: "LoRaWAN PM2.5 Air Quality Sensors"
linkTitle: "PM2.5"
description: "Browse LoRaWAN PM2.5 sensors that measure fine particulate matter for indoor and outdoor air quality monitoring."
lede: "LoRaWAN sensors that measure PM2.5 fine particulate matter to track air quality indoors and outdoors over long-range, low-power networks."
category: "sensor"
related: ["pm10", "particulate-matter", "dust", "co2", "iaq", "humidity"]
faq:
  - q: "What does a LoRaWAN PM2.5 sensor measure?"
    a: "It measures the concentration of fine airborne particles 2.5 micrometers or smaller, typically reported in micrograms per cubic meter (µg/m³). These particles come from combustion, traffic, dust, and smoke, and are a key indicator of air quality."
  - q: "How do LoRaWAN PM2.5 sensors send their data?"
    a: "Most use an optical laser-scattering particle counter, then transmit periodic readings over LoRaWAN to a gateway and network server. Payloads are decoded with a device-specific codec, and the reporting interval can be tuned to conserve battery."
  - q: "Can PM2.5 sensors be used outdoors?"
    a: "Yes, many are built for outdoor deployment, but check the enclosure IP rating and whether the unit manages humidity or condensation, since high moisture can affect optical particle readings."
---
PM2.5 refers to fine particulate matter with a diameter of 2.5 micrometers or less — fine enough to penetrate deep into the lungs. LoRaWAN PM2.5 sensors quantify the concentration of these particles, usually in micrograms per cubic meter (µg/m³), giving a direct read on air quality from sources like combustion, traffic exhaust, wildfire smoke, and industrial dust.

These devices typically use an optical laser-scattering particle counter to size and count airborne particles, then report readings over LoRaWAN at scheduled intervals. The long range and low power draw of LoRaWAN suit distributed monitoring where wiring and cellular coverage are impractical. Common deployments include smart-city air-quality networks, indoor and workplace monitoring, schools, and construction sites.

When comparing models, weigh:

- Measurement range and accuracy, plus humidity compensation
- Battery life and reporting interval, or external power
- Enclosure IP rating for outdoor exposure
- Supported regional frequency plans and the available payload codec

Many PM2.5 units also report PM10 and supporting environmental data.
