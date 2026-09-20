---
title: "LoRaWAN Moisture Sensors"
linkTitle: "Moisture"
description: "Browse LoRaWAN moisture sensors for soil, crops, and building materials. Compare wireless devices that measure moisture and report over long range."
lede: "Wireless LoRaWAN devices that measure moisture content in soil, substrates, and building materials and report it over long-range, low-power links."
category: "sensor"
related: ["humidity", "temperature", "conductivity", "leaf-wetness", "water-potential", "salinity"]
faq:
  - q: "What does a LoRaWAN moisture sensor measure?"
    a: "Most measure volumetric water content in soil or substrate, typically using capacitive or dielectric (TDR/FDR) probes. Readings are usually expressed as a percentage or in volumetric units, and many devices report soil temperature and conductivity alongside moisture."
  - q: "How long does a LoRaWAN moisture sensor's battery last?"
    a: "Battery life depends on reporting interval, frequency plan, and link conditions. Because sensors transmit small payloads infrequently and sleep between readings, many run for several years on internal batteries. Check the vendor's stated interval and battery specs."
  - q: "Can LoRaWAN moisture sensors be buried or used outdoors?"
    a: "Probe-style sensors are designed for in-ground insertion, but the transmitter enclosure must be rated for the environment. Look for a suitable IP rating and confirm the device supports your regional frequency plan, such as EU868 or US915."
---
Moisture sensing measures how much water is present in a medium such as soil, growing substrate, grain, or building materials. Many probes report volumetric water content using capacitive or dielectric measurement, and some combine moisture with soil temperature and electrical conductivity for a fuller picture of the root zone.

LoRaWAN moisture sensors sample on a schedule, encode the reading into a compact uplink payload, and transmit it to a gateway over a long-range, low-power link. The network server decodes the payload and forwards values to your application, so devices can run for long periods on battery while covering wide areas without cellular or Wi-Fi.

Common uses include precision agriculture and irrigation control, greenhouse and substrate monitoring, landscaping, and detecting damp in structures. When comparing devices, consider:

- Measurement range, accuracy, and probe depth or length
- Battery life at your chosen reporting interval
- Enclosure rating for outdoor or buried use
- Supported frequency plans (EU868, US915, AS923, and others)
- Availability of a documented payload codec
