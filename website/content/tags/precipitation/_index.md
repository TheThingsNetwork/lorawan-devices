---
title: "LoRaWAN Precipitation Sensors"
linkTitle: "Precipitation"
description: "Browse LoRaWAN precipitation sensors that measure rain and snowfall and report totals and intensity wirelessly over long-range, low-power networks."
lede: "LoRaWAN precipitation sensors track rainfall and snowfall remotely, sending accumulation and intensity readings over long range with years of battery life."
category: "sensor"
related: ["rainfall", "leaf-wetness", "humidity", "barometer", "wind-speed", "solar-radiation"]
faq:
  - q: "What does a LoRaWAN precipitation sensor measure?"
    a: "It measures liquid and sometimes solid precipitation, reporting accumulated depth (typically in millimeters or inches) and often a rain rate or intensity. Tipping-bucket models count bucket tips, while optical and radar-based sensors detect drop size and fall speed to estimate accumulation without moving parts."
  - q: "How does a precipitation sensor send data over LoRaWAN?"
    a: "The device samples or counts precipitation events, then transmits a compact uplink at a set interval or on each threshold. A payload codec on the network server decodes the bytes into rainfall totals and rates. Long range and low power let units run for years on batteries in remote outdoor sites."
  - q: "What should I compare when choosing one?"
    a: "Look at measurement type and accuracy, resolution per tip or count, the IP enclosure rating for outdoor exposure, battery life, the supported regional frequency plan (EU868, US915, AS923 and others), and whether a ready-made payload decoder is provided."
---
Precipitation sensing measures how much rain or snow falls and how fast it accumulates, usually expressed as depth (millimeters or inches) plus a rate or intensity. Designs range from classic tipping-bucket gauges that count discrete tips to optical and radar sensors that detect drop size and fall velocity with no moving parts to clog or freeze.

A LoRaWAN precipitation device samples or counts events locally, then sends a small encoded uplink at a scheduled interval. A payload codec on the network server turns those bytes into accumulation and rate values, and the long-range, low-power link keeps remote stations running for years on batteries.

Common deployments include:

- Smart agriculture and irrigation scheduling
- Stormwater, flood early-warning, and urban drainage monitoring
- Weather stations, hydrology research, and slope-stability alerts

When comparing models, weigh measurement type and accuracy, resolution per count, the IP enclosure rating for sustained outdoor exposure, expected battery life, supported regional frequency plans (EU868, US915, AS923 and others), and whether a tested payload decoder ships with the device.
