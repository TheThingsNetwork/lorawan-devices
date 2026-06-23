---
title: "LoRaWAN UV Sensors"
linkTitle: "UV"
description: "Browse LoRaWAN UV sensors that measure ultraviolet radiation and UV index, reporting solar exposure wirelessly over long range with low power."
lede: "LoRaWAN UV sensors measure ultraviolet radiation and report the UV index wirelessly, helping monitor sun exposure and outdoor conditions over long range."
category: "sensor"
related: ["light", "solar-radiation", "temperature", "humidity", "albedo", "infrared"]
faq:
  - q: "What does a LoRaWAN UV sensor measure?"
    a: "It measures ultraviolet radiation, typically UVA and UVB irradiance in W/m², and often derives a UV index value. Many devices combine UV with light, temperature, or other environmental readings in a single weather-style node."
  - q: "How does a LoRaWAN UV sensor send data?"
    a: "The device samples its UV photodiode at a set interval, encodes the reading into a small uplink payload, and transmits it over LoRaWAN to a gateway and network server, where a payload codec decodes it into usable values."
  - q: "Where are LoRaWAN UV sensors used?"
    a: "Common uses include smart agriculture, weather and environmental monitoring stations, smart cities, public health and sun-safety alerting, and research where long-term outdoor UV exposure data is needed."
---
UV sensing measures **ultraviolet radiation** from the sun, usually reported as UVA/UVB irradiance (W/m²) or a derived **UV index**. LoRaWAN UV sensors use a photodiode tuned to ultraviolet wavelengths, sample at a configurable interval, and transmit a compact encoded payload to a nearby gateway. The network server decodes it with a payload codec so platforms can chart exposure, trigger alerts, or feed environmental models.

These devices are typically deployed outdoors in agriculture, weather stations, smart-city dashboards, sun-safety alerting, and research. Because radio uplinks use little energy, a sensor can run for years on batteries or pair with a solar panel.

When comparing UV devices, look at:

- Measurement range, resolution, and accuracy across the UV spectrum
- Battery life, reporting interval, and solar-powered options
- Enclosure rating (IP65/IP67) for sustained outdoor exposure
- Supported frequency plans (EU868, US915, AS923, and others)
- Whether a payload decoder is provided for your network server

Many UV nodes bundle additional environmental measurements, so check what else each device reports before integrating it.
