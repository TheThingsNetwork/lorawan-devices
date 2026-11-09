---
title: "LoRaWAN Turbidity Sensors"
linkTitle: "Turbidity"
description: "Browse LoRaWAN turbidity sensors that measure water cloudiness for remote monitoring. Compare range, accuracy, IP rating and frequency plans."
lede: "LoRaWAN turbidity sensors measure how cloudy or clear water is and report readings wirelessly over long distances for low-power remote monitoring."
category: "sensor"
related: ["water", "conductivity", "ph", "dissolved-oxygen", "salinity", "temperature"]
faq:
  - q: "What does a LoRaWAN turbidity sensor measure?"
    a: "It measures water turbidity, the cloudiness caused by suspended solids such as sediment, algae, and particulate matter. Readings are typically expressed in NTU (Nephelometric Turbidity Units) or FNU, indicating how much light is scattered or absorbed by particles in the water."
  - q: "How is turbidity data sent over LoRaWAN?"
    a: "The sensor measures optical scattering or absorption, then transmits a small encoded payload over a LoRaWAN network to a gateway and on to your application server. A codec decodes the payload into an NTU/FNU value, often with battery and temperature fields."
  - q: "Where are LoRaWAN turbidity sensors used?"
    a: "They are common in drinking-water treatment, wastewater, rivers, lakes, aquaculture, and stormwater monitoring, where long range and low power suit remote or hard-to-reach water bodies."
---
Turbidity measures the cloudiness of water caused by suspended particles such as sediment, silt, algae, and organic matter. Optical turbidity probes shine light into the water and measure how much is scattered or absorbed, reporting the result in NTU or FNU. Rising turbidity often signals runoff, sediment disturbance, biological growth, or a process upset.

LoRaWAN turbidity sensors pair an optical probe with a low-power radio. The device samples on a schedule, encodes a compact payload, and sends it to a nearby gateway. A payload codec on your application server decodes the value, frequently alongside water temperature and battery status, so you can trend readings and trigger alerts without site visits.

Typical deployments include:

- Drinking-water and wastewater treatment plants
- Rivers, lakes, and stormwater outfalls
- Aquaculture ponds and tanks

When comparing devices, check measurement range and accuracy (NTU/FNU), probe anti-fouling or wiper options, enclosure and probe IP rating, battery life, supported regional frequency plans, and whether a decoder is provided.
