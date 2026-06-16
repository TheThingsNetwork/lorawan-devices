---
title: "LoRaWAN Albedo Sensors"
linkTitle: "Albedo"
description: "Browse LoRaWAN albedo sensors that measure surface reflectivity with paired up- and down-facing pyranometers and report data wirelessly."
lede: "LoRaWAN albedo sensors measure the fraction of incoming solar radiation reflected by a surface and send readings over long-range, low-power networks."
category: "sensor"
related: ["solar-radiation", "light", "uv", "infrared", "temperature", "humidity"]
faq:
  - q: "What does a LoRaWAN albedo sensor measure?"
    a: "It measures albedo, the ratio of reflected to incoming shortwave solar radiation on a surface. The instrument uses paired pyranometers — one facing up to capture incoming sunlight and one facing down to capture reflected sunlight — and reports the dimensionless ratio plus the individual irradiance values."
  - q: "Where are LoRaWAN albedo sensors used?"
    a: "They are common in bifacial solar farms to quantify ground-reflected irradiance on rear-facing panels, and in agriculture, snow and ice monitoring, and climate research where surface reflectivity affects energy balance."
  - q: "How do albedo sensors send data over LoRaWAN?"
    a: "They sample the up- and down-facing irradiance, compute or transmit the values, and send a compact uplink on a schedule. A payload codec on the network server decodes the bytes into irradiance and albedo readings."
---
Albedo is the fraction of incoming shortwave solar radiation that a surface reflects, expressed as a dimensionless ratio between 0 and 1. A LoRaWAN albedo sensor, sometimes called an albedometer, pairs two pyranometers — one facing the sky to measure incoming irradiance and one facing the ground to measure reflected irradiance — and derives albedo from the two readings.

These devices sample at set intervals and send compact uplinks over long-range, low-power LoRaWAN. A payload codec on the network server decodes the bytes into incoming irradiance, reflected irradiance (both typically in W/m²), and the dimensionless albedo ratio. Battery or solar-powered operation suits remote, unattended sites.

Albedo data is widely used in bifacial photovoltaic plants to model rear-side gain, and in agriculture, snow and ice studies, and climate monitoring.

When comparing devices, weigh:

- Pyranometer spectral range and measurement accuracy
- Reporting interval, power source, and battery life
- IP enclosure rating and mounting hardware
- Supported regional frequency plans and codec availability
