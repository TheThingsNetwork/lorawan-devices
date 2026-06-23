---
title: "LoRaWAN Dust Sensors"
linkTitle: "Dust"
description: "Browse LoRaWAN dust sensors that measure airborne particulate concentration and report air quality data wirelessly over long-range networks."
lede: "LoRaWAN dust sensors measure airborne particulate concentration and report air-quality readings wirelessly over long range on years of battery life."
category: "sensor"
related: ["particulate-matter", "pm2.5", "pm10", "iaq", "tvoc", "co2"]
faq:
  - q: "What does a LoRaWAN dust sensor measure?"
    a: "A dust sensor measures the concentration of airborne particles suspended in the air, typically reported as a mass concentration in micrograms per cubic meter (µg/m³). Many devices break results down into particulate-matter size fractions such as PM2.5 and PM10, giving a picture of overall air quality and pollution levels."
  - q: "How do LoRaWAN dust sensors transmit their data?"
    a: "The sensor samples the air at set intervals, then encodes the reading into a compact payload and transmits it over a LoRaWAN network to a gateway and on to your application server. Because LoRaWAN is low-power and long-range, sensors can run for months or years on batteries while covering large or hard-to-wire sites."
  - q: "Where are LoRaWAN dust sensors used?"
    a: "Common uses include outdoor and urban air-quality monitoring, construction and demolition site dust control, industrial and mining environments, warehouses, and indoor workplace health and safety monitoring where particulate exposure must be tracked over time."
---
Dust sensors measure the concentration of fine particles suspended in the air, usually expressed as a mass concentration in micrograms per cubic meter (µg/m³). Many devices use an optical sensing chamber to detect particles and report results across size fractions such as PM2.5 and PM10, making them a practical way to gauge air quality and pollution exposure.

Over LoRaWAN, a dust sensor samples the surrounding air on a schedule, encodes the result into a small uplink payload, and sends it to a gateway and your application server. The low-power, long-range nature of LoRaWAN lets these devices operate for extended periods on batteries while covering large outdoor areas or hard-to-wire indoor spaces.

Typical deployments include urban and outdoor air-quality networks, construction and demolition dust control, mining and industrial sites, and indoor workplace safety monitoring. When comparing devices, weigh:

- Measurement range, resolution, and which particle sizes are reported
- Power source and expected battery life
- Enclosure rating for outdoor or dusty environments
- Supported regional frequency plans and the payload codec
