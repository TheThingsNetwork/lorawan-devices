---
title: "LoRaWAN Water Potential Sensors"
linkTitle: "Water Potential"
description: "Browse LoRaWAN water potential sensors in the Device Repository. Compare tensiometers, accuracy, range, battery life and frequency plans."
lede: "LoRaWAN water potential sensors report soil matric tension wirelessly, helping growers and researchers track how tightly water is held in the soil."
category: "sensor"
related: ["moisture", "water", "conductivity", "salinity", "leaf-wetness", "vapor-pressure-deficit"]
faq:
  - q: "What does a LoRaWAN water potential sensor measure?"
    a: "It measures soil water potential, the matric tension a plant must overcome to draw water from the soil. Readings are usually reported in kilopascals (kPa) or centibars, where more negative values mean drier, harder-to-extract water. Unlike volumetric moisture, water potential reflects plant-available water directly."
  - q: "How do LoRaWAN water potential sensors send data?"
    a: "The probe samples tension at set intervals, and the LoRaWAN node encodes the value into a small payload transmitted over a public or private network to a gateway. Because LoRaWAN is low-power and long-range, devices can run for years on battery in remote fields, with readings decoded by a payload formatter."
  - q: "Where are water potential sensors used?"
    a: "Common uses include precision irrigation scheduling, viticulture and orchard management, greenhouse and substrate growing, and soil-water research. They help decide exactly when and how much to irrigate, reducing water use while avoiding plant stress."
---
Water potential measures the energy state of water in soil or a growing medium, expressed as the matric tension a plant root must overcome to extract water. It is typically reported in kilopascals (kPa) or centibars, where more negative readings indicate drier, less plant-available conditions. Because it reflects how hard water is to extract, it complements volumetric moisture rather than duplicating it.

A LoRaWAN water potential device pairs a tensiometer or matric-potential probe with a low-power radio. The node wakes on a schedule, reads tension, and sends a compact payload to a gateway, where a codec decodes the value. Long range and multi-year battery life make this practical across open fields and remote plots.

Typical applications include:

- Precision irrigation scheduling and water-budgeting
- Viticulture, orchards, and row crops
- Greenhouse and substrate-based growing
- Soil hydrology and research

When comparing devices, weigh measurement range and accuracy, probe depth options, battery life, enclosure (IP) rating, supported regional frequency plans, and whether a payload codec is provided.
