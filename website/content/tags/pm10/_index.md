---
title: "LoRaWAN PM10 Sensors"
linkTitle: "PM10"
description: "Browse LoRaWAN PM10 sensors that measure coarse particulate matter for outdoor and indoor air-quality monitoring."
lede: "LoRaWAN PM10 sensors measure coarse airborne particulate matter and report air-quality readings wirelessly over long distances on low power."
category: "sensor"
related: ["pm2.5", "particulate-matter", "dust", "co2", "iaq", "tvoc"]
faq:
  - q: "What does a LoRaWAN PM10 sensor measure?"
    a: "PM10 refers to inhalable particulate matter with a diameter of 10 micrometers or less, including dust, pollen, mold, and combustion particles. The sensor reports mass concentration, typically in micrograms per cubic meter (µg/m³)."
  - q: "How do LoRaWAN PM10 sensors send their data?"
    a: "They sample air with an optical particle counter, then transmit the concentration in a compact uplink payload over LoRaWAN to a network server, where a payload codec decodes it for dashboards or alerts."
  - q: "Where are PM10 sensors used?"
    a: "Common uses include outdoor air-quality networks, smart cities, construction and industrial dust monitoring, roadside pollution tracking, and indoor environmental monitoring."
---
PM10 measures the mass concentration of inhalable particles up to 10 micrometers across — coarse dust, pollen, mold spores, and combustion by-products that affect respiratory health and visibility. A reading is usually expressed in micrograms per cubic meter (µg/m³).

LoRaWAN PM10 devices draw a sample past an optical particle counter, size and count the particles, then send the computed concentration in a small uplink. Because LoRaWAN is low-power and long-range, these sensors can run on batteries for extended periods while covering wide outdoor areas or hard-to-wire indoor spaces. Typical deployments include:

- Smart-city and roadside air-quality networks
- Construction, quarry, and industrial dust monitoring
- Indoor environmental and workplace monitoring

When comparing devices, weigh the measurement range and accuracy, sampling method, and whether other pollutants (such as PM2.5) are reported alongside PM10. Also check battery life, the enclosure rating for outdoor exposure, supported regional frequency plans, and the availability of a documented payload codec for easy integration.
