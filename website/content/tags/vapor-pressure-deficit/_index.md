---
title: "LoRaWAN Vapor Pressure Deficit (VPD) Sensors"
linkTitle: "VPD"
description: "Browse LoRaWAN vapor pressure deficit (VPD) sensors for greenhouses, agriculture, and indoor climate monitoring."
lede: "Find LoRaWAN devices that measure or derive vapor pressure deficit (VPD) for greenhouse, crop, and indoor climate control."
category: "sensor"
related: ["humidity", "temperature", "dew-point", "vapor-pressure", "leaf-wetness", "barometer"]
faq:
  - q: "What does a LoRaWAN vapor pressure deficit sensor measure?"
    a: "VPD is the difference between the amount of moisture air can hold when saturated and the amount it currently holds. Devices typically measure air temperature and relative humidity, then derive VPD (usually in kPa) on-device or in the application layer, indicating how strongly the air pulls moisture from plants."
  - q: "How do LoRaWAN VPD sensors transmit data?"
    a: "They sample temperature and humidity at set intervals and send a compact uplink over LoRaWAN at intervals from minutes to hours. A payload codec decodes the bytes into readings, and VPD is either reported directly or calculated from temperature and humidity downstream."
  - q: "Where are VPD sensors used?"
    a: "They are common in greenhouses, vertical farms, cannabis cultivation, mushroom growing, and crop monitoring, where keeping VPD in an optimal range improves transpiration, reduces disease pressure, and supports healthy growth."
---
Vapor pressure deficit (VPD) describes how "thirsty" the air is, the gap between the moisture air could hold at saturation and what it currently holds. Most LoRaWAN devices do not sense VPD directly. Instead, they measure air temperature and relative humidity, then compute VPD (typically in kilopascals) either on the device or in the application layer.

These sensors sample on a fixed schedule and send a small uplink over LoRaWAN, where a payload codec decodes temperature, humidity, and often the derived VPD value. Long range and low power let them run for years on batteries while covering greenhouse rows or open fields.

Common uses include greenhouses, vertical farms, cannabis and mushroom cultivation, and field crop monitoring, where holding VPD in an optimal band promotes healthy transpiration and limits disease.

When comparing devices, check:

- Temperature and humidity range and accuracy (VPD inherits both errors)
- Battery life, reporting interval, and enclosure (IP) rating
- Supported frequency plans and whether VPD is computed on-device or downstream
