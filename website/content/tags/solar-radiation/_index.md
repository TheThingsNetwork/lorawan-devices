---
title: "LoRaWAN Solar Radiation Sensors"
linkTitle: "Solar Radiation"
description: "Browse LoRaWAN solar radiation sensors that measure irradiance in W/m² and report wirelessly for agriculture, energy, and weather monitoring."
lede: "LoRaWAN solar radiation sensors measure incoming shortwave irradiance and report it wirelessly over long ranges on low power."
category: "sensor"
related: ["light", "uv", "albedo", "temperature", "humidity", "precipitation"]
faq:
  - q: "What unit do LoRaWAN solar radiation sensors report?"
    a: "Most report shortwave irradiance in watts per square metre (W/m²), the rate of solar energy reaching a surface. Some also accumulate energy over time, such as a daily total. Always confirm the exact field and unit in the device's payload formatter or documentation."
  - q: "What is the difference between a pyranometer and a silicon solar radiation sensor?"
    a: "Pyranometers use a thermopile and broadband glass dome for high accuracy across the full solar spectrum, while silicon-photodiode sensors are lower cost with a narrower spectral response. Both can connect to a LoRaWAN node, often via analog or SDI-12/Modbus interfaces."
  - q: "Can a LoRaWAN solar radiation sensor run on battery outdoors?"
    a: "Yes. Because LoRaWAN uses infrequent low-power uplinks, many nodes run for years on batteries or add a small solar panel. Check the enclosure IP rating, operating temperature range, and reporting interval for your deployment."
---
Solar radiation sensing measures the intensity of incoming solar energy, typically reported as shortwave irradiance in watts per square metre (W/m²). The measurement is captured by a thermopile pyranometer or a lower-cost silicon-photodiode sensor mounted level and unshaded, then digitised and transmitted by a LoRaWAN end node.

LoRaWAN devices sample the sensor on a set interval, encode the reading into a compact payload, and uplink it over long distances at low power. A decoder on the network server turns the raw bytes into irradiance values your application can chart or use to trigger alerts. Typical uses include:

- Agriculture and irrigation scheduling, often alongside light, temperature, and humidity
- Solar PV site assessment and panel performance monitoring
- Weather stations, microclimate studies, and building energy management

When comparing sensors, look at spectral response and accuracy, measurement range, sampling and reporting interval, battery life or solar-powered operation, enclosure IP rating and operating temperature, the supported regional frequency plan (EU868, US915, AS923, and others), and whether a ready-made payload codec is provided.
