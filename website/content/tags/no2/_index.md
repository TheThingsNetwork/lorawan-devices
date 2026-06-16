---
title: "LoRaWAN NO2 Sensors"
linkTitle: "NO₂"
description: "Browse LoRaWAN NO2 sensors for outdoor and indoor air quality. Compare accuracy, battery life, enclosure rating, and frequency plans."
lede: "LoRaWAN NO2 sensors track nitrogen dioxide concentrations and report air-quality readings wirelessly over long-range, low-power networks."
category: "sensor"
related: ["co", "o3", "so2", "co2", "particulate-matter", "iaq"]
faq:
  - q: "What does a LoRaWAN NO2 sensor measure?"
    a: "It measures the concentration of nitrogen dioxide (NO2) in the air, typically reported in parts per billion (ppb) or micrograms per cubic meter (µg/m³). NO2 is a traffic- and combustion-related pollutant, so these sensors are common in roadside, urban, and industrial air-quality monitoring."
  - q: "How often do LoRaWAN NO2 sensors send readings?"
    a: "Reporting intervals are configurable, often ranging from a few minutes to hourly. Longer intervals extend battery life, while shorter intervals give finer-grained pollution trends. Many devices also support downlink commands to adjust the interval remotely."
  - q: "Do NO2 sensors need calibration?"
    a: "Yes. Electrochemical NO2 sensing elements drift over time and are sensitive to temperature and humidity, so periodic calibration or factory recalibration is recommended to maintain measurement accuracy."
---
Nitrogen dioxide (NO2) is a gaseous pollutant produced mainly by vehicle exhaust, combustion, and industrial processes. LoRaWAN NO2 sensors detect this gas — usually with an electrochemical cell — and transmit concentration readings over long-range, low-power radio. Because LoRaWAN reaches long distances on small batteries, these sensors suit dense outdoor deployments where wired power and cellular coverage are impractical.

A typical device samples NO2 on a set schedule, encodes the value into a compact uplink payload, and sends it through a LoRaWAN gateway to a network server. Many units bundle temperature and humidity readings, since both affect electrochemical accuracy.

Common applications include:

- Roadside and urban air-quality networks
- Industrial emissions and fence-line monitoring
- Smart-city and environmental research deployments

When comparing LoRaWAN NO2 sensors, weigh measurement range and accuracy, sensor drift and calibration needs, battery life at your reporting interval, enclosure rating for outdoor exposure, supported regional frequency plans, and whether a documented payload decoder is provided for your platform.
