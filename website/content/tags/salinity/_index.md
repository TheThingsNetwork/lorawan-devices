---
title: "LoRaWAN Salinity Sensors"
linkTitle: "Salinity"
description: "Browse LoRaWAN salinity sensors for monitoring salt concentration in water and soil, reporting wirelessly over long range."
lede: "LoRaWAN salinity sensors measure dissolved salt levels in water and soil, sending readings wirelessly over long range for low-power remote monitoring."
category: "sensor"
related: ["conductivity", "dissolved-oxygen", "ph", "turbidity", "temperature", "water"]
faq:
  - q: "How does a LoRaWAN salinity sensor measure salinity?"
    a: "Most salinity sensors derive salt concentration from electrical conductivity, since dissolved salts increase a solution's conductivity. The probe measures conductivity (often temperature-compensated) and the device computes salinity, then transmits the value over LoRaWAN to a network server."
  - q: "What units do LoRaWAN salinity sensors report?"
    a: "Readings are commonly expressed in parts per thousand (ppt) or practical salinity units (PSU), and sometimes as a conductivity-derived value in mS/cm. The exact unit and scaling depend on the device and its payload codec, so always check the vendor documentation."
  - q: "Can LoRaWAN salinity sensors be used in seawater and outdoor environments?"
    a: "Many are built for submerged or harsh outdoor use with sealed, corrosion-resistant probes and rated enclosures. Confirm the IP rating, probe materials, depth limits, and measurement range match your aquaculture, coastal, or irrigation application."
---
Salinity sensing quantifies the concentration of dissolved salts in water or soil, a key indicator of water quality and suitability for crops, aquaculture, and aquatic life. Because dissolved salts conduct electricity, most sensors infer salinity from electrical conductivity, often with temperature compensation for accuracy.

A LoRaWAN salinity device pairs a probe with a low-power radio. It samples on a set interval, encodes the reading into a compact payload, and transmits it to nearby gateways, which forward it to a network server and your application. Long range and modest power draw let battery-powered units run for months in remote sites.

Typical deployments include:

- Aquaculture pond and tank monitoring
- Coastal, estuary, and groundwater intrusion studies
- Irrigation water quality and soil salinity management
- Drinking-water and industrial process oversight

When comparing devices, weigh the measurement range and accuracy, units reported (ppt, PSU, or conductivity), temperature compensation, power and battery life, enclosure and probe IP rating, supported regional frequency plans, and the availability of a documented payload codec.
