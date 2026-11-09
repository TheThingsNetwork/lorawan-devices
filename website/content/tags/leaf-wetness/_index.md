---
title: "LoRaWAN Leaf Wetness Sensors"
linkTitle: "Leaf Wetness"
description: "Browse LoRaWAN leaf wetness sensors that detect moisture on foliage for disease forecasting, irrigation, and precision agriculture."
lede: "LoRaWAN leaf wetness sensors detect moisture on plant foliage to support disease forecasting, irrigation scheduling, and crop protection."
category: "sensor"
related: ["humidity", "temperature", "dew-point", "moisture", "rainfall", "solar-radiation"]
faq:
  - q: "What does a LoRaWAN leaf wetness sensor measure?"
    a: "It detects the presence and duration of moisture, such as dew, rain, or irrigation water, on a leaf-shaped surface that mimics foliage. Output is typically a wetness percentage or a wet/dry state, helping estimate leaf wetness duration."
  - q: "Why is leaf wetness important in agriculture?"
    a: "Many fungal and bacterial plant diseases require prolonged surface moisture to infect crops. Tracking leaf wetness duration feeds disease-risk models, so growers can time fungicide sprays precisely and reduce unnecessary applications."
  - q: "How do LoRaWAN leaf wetness sensors transmit data?"
    a: "They send small encoded payloads over long-range, low-power LoRaWAN to a gateway and network server. Decode them with a payload codec, and confirm the device supports your regional frequency plan, such as EU868 or US915."
---
Leaf wetness sensing measures how much moisture sits on plant foliage and, crucially, how long it lingers. Sensors use a thin, leaf-shaped surface that imitates a real leaf, detecting condensation, dew, rainfall, or irrigation spray as changes in electrical or dielectric properties. Readings are reported as a wetness percentage, a relative value, or a simple wet/dry threshold used to calculate leaf wetness duration.

LoRaWAN versions sample on a schedule, encode a compact payload, and transmit it over long-range, low-power radio to a gateway. Their efficiency suits remote fields and orchards where mains power and cellular coverage are scarce, allowing battery operation across full growing seasons.

Common uses span vineyards, orchards, row crops, and greenhouses, where leaf wetness data drives plant-disease forecasting models and smarter irrigation and spray timing.

When comparing devices, weigh:

- Sensitivity, calibration, and reported output format
- Battery life and reporting interval
- Enclosure rating (IP65/IP67) for outdoor exposure
- Supported frequency plans and an available payload codec
