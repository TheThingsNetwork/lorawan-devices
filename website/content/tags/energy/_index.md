---
title: "LoRaWAN Energy Sensors & Meters"
linkTitle: "Energy"
description: "Browse LoRaWAN energy sensors and meters that report kWh consumption wirelessly for sub-metering, billing, and efficiency monitoring."
lede: "LoRaWAN energy sensors and meters measure electrical consumption in kWh and report it wirelessly for sub-metering, billing, and efficiency tracking."
category: "sensor"
related: ["power", "current", "voltage", "pulse-count", "optical-meter", "battery"]
faq:
  - q: "What does a LoRaWAN energy sensor measure?"
    a: "It measures cumulative electrical energy consumption, typically in kilowatt-hours (kWh). Many devices also report instantaneous power, current, and voltage, allowing you to track both total usage over time and the real-time load on a circuit."
  - q: "How does a LoRaWAN energy meter report data?"
    a: "The meter measures energy via direct connection, current transformers (CTs), or by reading pulse or optical outputs from an existing utility meter. It transmits the readings as a small uplink payload at a configurable interval over a LoRaWAN network, where a decoder converts the bytes into kWh values."
  - q: "What should I compare when choosing a LoRaWAN energy meter?"
    a: "Check the supported current and voltage range, single- versus three-phase capability, measurement accuracy class, the sensing method (CT, direct, or pulse), enclosure rating for the install location, supported regional frequency plans, and whether a payload decoder is provided."
---
Energy sensing measures how much electrical energy a circuit, appliance, or building consumes, reported as cumulative kilowatt-hours (kWh). Many devices also surface related metrics such as active power, current, and voltage, giving a fuller picture of both total consumption and live load.

LoRaWAN energy meters typically sense energy in one of three ways: direct in-line measurement, clamp-on or split-core current transformers (CTs) for non-invasive installs, or by counting pulse or optical outputs from an existing utility meter. Readings are packed into a compact uplink and sent at a configurable interval over the LoRaWAN network, then decoded into kWh on the application side. Low power draw lets battery or mains-assisted units run for years.

Common uses include:
- Sub-metering tenants, machines, or production lines
- Building energy management and ISO 50001 reporting
- Solar and EV-charging monitoring

When comparing devices, weigh current/voltage range, single- or three-phase support, accuracy class, sensing method, enclosure rating, supported frequency plans, and whether a payload decoder ships with the device.
