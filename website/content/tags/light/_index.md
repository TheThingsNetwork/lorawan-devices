---
title: "LoRaWAN Light Sensors"
linkTitle: "Light"
description: "Browse LoRaWAN light sensors that measure ambient illuminance (lux) wirelessly for smart lighting, buildings, agriculture, and energy savings."
lede: "LoRaWAN light sensors measure ambient illuminance and report lux readings wirelessly over long ranges on low power."
category: "sensor"
related: ["uv", "solar-radiation", "occupancy", "motion", "temperature", "humidity"]
faq:
  - q: "What does a LoRaWAN light sensor measure?"
    a: "It measures ambient light intensity (illuminance), typically reported in lux. Some devices also detect daylight versus artificial light or pair light readings with other environmental data such as temperature and humidity."
  - q: "How does a LoRaWAN light sensor transmit data?"
    a: "The sensor samples illuminance at set intervals and sends compact payloads over LoRaWAN to a gateway and network server. A payload codec decodes the bytes into lux values for your application or dashboard."
  - q: "How long does the battery last on a LoRaWAN light sensor?"
    a: "Battery life depends on reporting interval, spreading factor, and hardware, but many battery-powered light sensors run for years on a single cell thanks to LoRaWAN's low-power duty cycling."
---
Light sensing measures ambient illuminance, the intensity of visible light falling on a surface, usually expressed in lux. LoRaWAN light sensors use a photodiode or photometric chip to sample illuminance, then transmit readings over long-range, low-power radio to a gateway and network server, where a payload codec decodes the bytes into usable values.

These devices suit deployments where wiring is impractical and battery life matters. Common applications include:

- Daylight harvesting and smart lighting control to dim or switch fixtures
- Building and workplace comfort monitoring
- Greenhouse, horticulture, and crop light-level tracking
- Retail, museum, and shelf-lighting verification

When comparing light sensors, check the measurement range and resolution in lux, sensor accuracy and spectral response, and how often readings are reported. Review power source and expected battery life, the enclosure rating for indoor or outdoor use, supported regional frequency plans (such as EU868 or US915), and whether a ready-made payload codec is provided. Some devices combine light with motion, occupancy, or temperature for richer context.
