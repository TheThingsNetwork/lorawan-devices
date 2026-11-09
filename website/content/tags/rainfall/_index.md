---
title: "LoRaWAN Rainfall Sensors"
linkTitle: "Rainfall"
description: "Browse LoRaWAN rainfall sensors and rain gauges that report precipitation totals and intensity wirelessly over long range with multi-year battery life."
lede: "LoRaWAN rainfall sensors measure precipitation and report rain totals and intensity wirelessly, ideal for remote weather, agriculture, and flood monitoring."
category: "sensor"
related: ["precipitation", "wind-speed", "wind-direction", "humidity", "pressure", "leaf-wetness"]
faq:
  - q: "How do LoRaWAN rainfall sensors measure rain?"
    a: "Most use a tipping-bucket mechanism: a small seesaw bucket tips and triggers a reed switch or hall-effect pulse after a fixed volume of water (often 0.2 mm) collects. The node counts pulses to derive accumulated rainfall and intensity, then transmits the totals over LoRaWAN. Some optical or radar-based gauges detect drops without moving parts."
  - q: "How far can a LoRaWAN rain gauge transmit data?"
    a: "Range depends on the device, antenna, terrain, and spreading factor rather than the rainfall measurement itself. In open rural areas LoRaWAN links can reach several kilometers to a public or private gateway, making rain gauges practical for fields, catchments, and remote sites without mains power or cellular coverage."
  - q: "What should I compare when choosing a rainfall sensor?"
    a: "Check resolution (mm per tip) and accuracy, the IP enclosure rating for outdoor exposure, battery life, the supported LoRaWAN frequency plan for your region, and whether a payload decoder is provided so accumulated rainfall and rate map cleanly into your platform."
---
Rainfall sensing measures how much precipitation falls over an area and how fast it accumulates, typically reported as millimeters of rain and a rainfall rate. The classic instrument is a tipping-bucket rain gauge, where a calibrated bucket tips once a set volume of water collects, generating a pulse the device counts.

LoRaWAN rainfall devices pair this gauge with a low-power radio. The node tallies tips locally, then transmits accumulated rainfall and intensity at scheduled intervals using small uplink payloads. Because LoRaWAN reaches long distances at low power, a single gateway can serve gauges spread across farms, catchments, or urban drainage networks running for years on batteries.

Common deployments include:

- Precision agriculture and irrigation scheduling
- Flood early-warning and stormwater management
- Hydrology, weather stations, and research networks

When comparing options, weigh measurement resolution (mm per tip) and accuracy, weatherproof enclosure rating, battery life, the regional frequency plan, and whether a documented payload codec is supplied so rainfall data decodes correctly in your application.
