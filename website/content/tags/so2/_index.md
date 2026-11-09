---
title: "LoRaWAN SO₂ Sensors"
linkTitle: "SO₂"
description: "Browse LoRaWAN SO₂ sensors that measure sulfur dioxide gas and report air-quality readings wirelessly over long-range, low-power networks."
lede: "LoRaWAN SO₂ sensors monitor sulfur dioxide concentrations in air and transmit readings wirelessly over long-range, low-power networks."
category: "sensor"
related: ["no2", "o3", "h2s", "co", "particulate-matter", "iaq"]
faq:
  - q: "What does a LoRaWAN SO₂ sensor measure?"
    a: "It measures the concentration of sulfur dioxide (SO₂) gas in ambient air, typically reported in parts per million (ppm) or micrograms per cubic meter (µg/m³). SO₂ is a pollutant linked to fossil-fuel combustion and industrial emissions."
  - q: "How do LoRaWAN SO₂ sensors transmit data?"
    a: "They sample the gas concentration, encode the value in a compact uplink payload, and send it over LoRaWAN to a gateway and network server. Because LoRaWAN is low-power, many units run for long periods on batteries or solar."
  - q: "What should I compare when choosing an SO₂ sensor?"
    a: "Check the measurement range and accuracy, sensor type and drift/calibration needs, battery life, IP enclosure rating for outdoor use, supported frequency plans (such as EU868 or US915), and whether a payload decoder is provided."
---
Sulfur dioxide (SO₂) is a gaseous air pollutant produced mainly by burning fossil fuels and by industrial processes such as smelting and refining. LoRaWAN SO₂ sensors measure its concentration in ambient air, usually reporting in parts per million (ppm) or micrograms per cubic meter (µg/m³).

A typical device pairs an electrochemical or metal-oxide gas cell with a LoRaWAN radio. It samples on a set interval, packs the reading into a small uplink payload, and sends it to a gateway and onward to a network server, where a codec decodes the value. Low power draw lets many units run for long stretches on batteries or solar.

These sensors support ambient air-quality monitoring, industrial perimeter and stack-area surveillance, and compliance reporting. When comparing options, weigh:

- Measurement range and accuracy
- Sensor type, expected drift and calibration needs
- Battery life and power source
- Enclosure (IP) rating for outdoor exposure
- Supported frequency plans and available payload decoder
