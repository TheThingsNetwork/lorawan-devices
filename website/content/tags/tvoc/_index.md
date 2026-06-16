---
title: "LoRaWAN TVOC Sensors"
linkTitle: "TVOC"
description: "Browse LoRaWAN TVOC sensors that wirelessly monitor total volatile organic compounds in air for indoor air quality and ventilation control."
lede: "LoRaWAN TVOC sensors measure total volatile organic compounds in the air and report air-quality readings wirelessly over long ranges."
category: "sensor"
related: ["iaq", "co2", "bvoc", "particulate-matter", "humidity", "temperature"]
faq:
  - q: "What does a LoRaWAN TVOC sensor measure?"
    a: "It measures Total Volatile Organic Compounds (TVOC), the combined concentration of gaseous organic chemicals emitted by paints, adhesives, cleaning products, furnishings, and human activity. Readings are typically reported in parts per billion (ppb) or as an index, and used to gauge indoor air quality."
  - q: "How does a LoRaWAN TVOC sensor send its data?"
    a: "The device samples a gas-sensing element, most commonly a metal-oxide (MOX) cell, on a set interval, then transmits the value as a compact uplink payload over a LoRaWAN network to a gateway and on to your application server, where a codec decodes it."
  - q: "How long do battery-powered LoRaWAN TVOC sensors last?"
    a: "It depends on the gas-sensing technology and reporting interval. MOX elements draw more power when actively heated, so battery life ranges from months to several years; longer intervals and duty-cycling extend it."
---
TVOC (Total Volatile Organic Compounds) sensing reports the combined concentration of airborne organic gases released by building materials, furnishings, solvents, cleaning agents, cooking, and occupants. Elevated TVOC levels are a common indicator of poor indoor air quality and inadequate ventilation.\n\nLoRaWAN TVOC sensors most commonly rely on a metal-oxide (MOX) sensing element, sampling the air on a configurable schedule and transmitting a small payload, often in ppb or as an air-quality index, to a gateway over long range and low power. This makes them well suited to offices, schools, hospitals, warehouses, hotels, and smart-building deployments where running cabling is impractical.\n\nWhen comparing devices, consider:\n\n- Measurement range, resolution, and sensing technology\n- Reporting interval and resulting battery life\n- Enclosure rating and operating environment\n- Supported regional frequency plans (EU868, US915, AS923, etc.)\n- Availability of a payload codec for decoding uplinks\n\nMany TVOC modules also bundle CO₂, humidity, and temperature for a fuller air-quality picture.
