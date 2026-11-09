---
title: "LoRaWAN Surface Temperature Sensors"
linkTitle: "Surface Temperature"
description: "Browse LoRaWAN surface temperature sensors that measure the temperature of objects and surfaces and report wirelessly over long range."
lede: "LoRaWAN surface temperature sensors measure the temperature of a contacted surface or object and report it wirelessly over long-range, low-power links."
category: "sensor"
related: ["temperature", "infrared", "humidity", "dew-point", "moisture", "battery"]
faq:
  - q: "How do LoRaWAN surface temperature sensors measure temperature?"
    a: "They use a probe, thermocouple, or contact element pressed against a surface, or an infrared element aimed at an object to read it without touching. The reading is encoded into a small payload and transmitted over LoRaWAN at scheduled intervals or when a threshold is crossed."
  - q: "What is the difference between surface temperature and ambient temperature?"
    a: "Surface temperature is the temperature of a specific object or contact point, such as a pipe, machine, or wall. Ambient temperature is the surrounding air. A surface sensor uses a contact probe or an infrared element rather than an open-air thermistor exposed to the air."
  - q: "What should I compare when choosing a LoRaWAN surface temperature sensor?"
    a: "Compare measurement range and accuracy, probe or sensing type, reporting interval and battery life, enclosure rating, supported regional frequency plans, and whether a ready-made payload decoder is provided."
---
Surface temperature sensing measures the temperature of a specific object or contact point, a pipe, motor housing, wall, road surface, or stored product, rather than the surrounding air. LoRaWAN devices in this category use a contact probe, thermocouple, embedded element, or non-contact infrared sensor to capture the reading, then transmit it over a long-range, low-power link to a network gateway.

Most devices wake on a fixed schedule or on threshold crossings, send a compact payload, and return to sleep to conserve battery. Typical deployments include:

- Predictive maintenance on machinery and motors
- Cold-chain, HVAC, and pipe-monitoring checks
- Road, rail, and building-surface monitoring

When comparing models, weigh the points that affect data quality and deployment cost: measurement range and accuracy, probe or sensing type, reporting interval and battery life, enclosure or IP rating for harsh or wet environments, supported regional frequency plans, and whether a documented payload codec is supplied so readings decode cleanly in your network server. Matching the sensing method to the surface you need to monitor is the most important early decision.
