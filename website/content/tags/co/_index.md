---
title: "LoRaWAN Carbon Monoxide (CO) Sensors"
linkTitle: "Carbon Monoxide"
description: "Browse LoRaWAN carbon monoxide (CO) sensors for safety and air-quality monitoring, with frequency plans, payload codecs and battery details."
lede: "LoRaWAN carbon monoxide sensors detect CO gas wirelessly for safety alarms, parking garages and indoor air-quality monitoring over long ranges."
category: "sensor"
related: ["co2", "smoke", "no2", "iaq", "h2s", "so2"]
faq:
  - q: "What does a LoRaWAN CO sensor measure?"
    a: "It measures the concentration of carbon monoxide (CO) gas in the air, typically reported in parts per million (ppm). CO is a colourless, odourless gas produced by incomplete combustion, so these sensors are used for occupant safety and air-quality monitoring."
  - q: "How is CO sensor data transmitted over LoRaWAN?"
    a: "The device samples its CO cell, then transmits readings as a compact uplink payload over a LoRaWAN network. Many sensors send periodic readings plus event-driven alerts when CO crosses a configured threshold, and a payload decoder converts the bytes into ppm values."
  - q: "How long do LoRaWAN CO sensors run on battery?"
    a: "Battery life depends on uplink frequency, sensing technology and frequency plan. Low-power electrochemical designs with infrequent reporting can run for years, while devices polling continuously or sending frequent alerts draw more power."
---
Carbon monoxide (CO) sensing detects the concentration of CO gas in the air, usually expressed in parts per million (ppm). Because CO is colourless and odourless and is produced by incomplete combustion, monitoring it is essential for occupant safety and indoor air quality.

LoRaWAN CO sensors sample a gas-sensing cell (commonly electrochemical) at set intervals, then transmit readings as small uplink payloads over long-range, low-power radio. Many devices combine scheduled reports with event-driven alerts that fire when CO crosses a configured threshold, so alarms reach the network quickly without constant transmission.

Typical deployments include:

- Parking garages, tunnels and loading bays
- Boiler rooms, kitchens and workshops
- Residential and commercial indoor air-quality monitoring

When comparing devices, review measurement range and accuracy, sensor lifespan and calibration needs, and battery life against reporting interval. Also confirm the enclosure rating for the install environment, the supported regional frequency plans, and that a payload codec is available to decode ppm values on your network.
