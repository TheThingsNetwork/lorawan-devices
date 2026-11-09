---
title: "LoRaWAN Humidity Sensors"
linkTitle: "Humidity"
description: "Browse LoRaWAN humidity sensors in the Device Repository, compare relative humidity range, accuracy, battery life, and frequency plans."
lede: "LoRaWAN humidity sensors measure the moisture in the air and report relative humidity wirelessly over long-range, low-power networks."
category: "sensor"
related: ["temperature", "dew-point", "barometer", "co2", "moisture", "vapor-pressure-deficit"]
faq:
  - q: "What does a LoRaWAN humidity sensor measure?"
    a: "It measures relative humidity (%RH), the amount of water vapor in the air relative to saturation at the current temperature. Most units pair the humidity element with a temperature sensor, and many derive dew point from both readings."
  - q: "How long does a LoRaWAN humidity sensor's battery last?"
    a: "Because LoRaWAN is low-power and devices transmit only periodic readings, battery life often spans several years on a single cell. Actual longevity depends on reporting interval, spreading factor, and operating temperature."
  - q: "Which LoRaWAN frequency plans do humidity sensors support?"
    a: "Models are sold for regional plans such as EU868, US915, AS923, AU915, and others. Always confirm the device matches your network's regional plan before deploying."
---
Humidity sensors report **relative humidity (%RH)**, the proportion of water vapor in the air relative to saturation at a given temperature. LoRaWAN humidity devices sample the air with a capacitive or resistive element, then transmit compact readings over the wide-area network at scheduled intervals. The low-power radio lets a single battery run for years, while long range covers buildings, farms, and outdoor sites a gateway away.

Most units bundle humidity with temperature, and some derive **dew point** or vapor-pressure deficit from the pair. Typical uses include:

- HVAC and indoor air-quality monitoring
- Cold-chain, warehouse, and museum or archive storage
- Greenhouses, agriculture, and climate control

When comparing devices, weigh the measurement **range and accuracy** (e.g. ±2–3 %RH), **battery life** at your reporting interval, **enclosure rating** (IP grade) for damp or outdoor placement, the supported **regional frequency plan**, and whether a ready-made **payload codec** decodes the uplink for your network server. Sampling cadence and condensation resistance also matter in harsh environments.
