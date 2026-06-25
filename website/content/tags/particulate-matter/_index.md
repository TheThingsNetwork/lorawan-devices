---
title: "LoRaWAN Particulate Matter Sensors"
linkTitle: "Particulate Matter"
description: "Browse LoRaWAN particulate matter sensors that measure PM2.5, PM10 and airborne dust for long-range, low-power air quality monitoring."
lede: "LoRaWAN particulate matter sensors track airborne dust and aerosols like PM1, PM2.5 and PM10 over long range on minimal power."
category: "sensor"
related: ["pm2.5", "pm10", "dust", "co2", "tvoc", "iaq"]
faq:
  - q: "What does a LoRaWAN particulate matter sensor measure?"
    a: "It measures the mass concentration of airborne particles, typically reported in micrograms per cubic meter (µg/m³). Most devices break this down by size fraction, such as PM1, PM2.5 and PM10, and many also report particle counts."
  - q: "How do LoRaWAN particulate matter sensors transmit readings?"
    a: "They sample air using an optical (laser-scattering) or similar detection method, then send the values as a small uplink payload over LoRaWAN at a configurable interval. A network server decodes the payload using the device's codec into PM2.5, PM10 and related fields."
  - q: "Do particulate matter sensors run on battery?"
    a: "Some do, but optical PM sensors draw a fan and laser during each measurement, so many models are mains- or solar-powered or use longer reporting intervals to extend battery life. Check the duty cycle and power source before deploying."
---
Particulate matter (PM) sensing measures the concentration of tiny solid and liquid particles suspended in air, usually reported as mass per volume (µg/m³) and grouped by size fraction such as PM1, PM2.5 and PM10. These fractions matter because finer particles penetrate deeper into the lungs, making them a core metric for air quality.

LoRaWAN PM devices typically draw an air sample across an optical (laser-scattering) detector, then transmit the readings as a compact uplink at a set interval. The network server decodes the payload into discrete PM values, often alongside temperature and humidity that influence the measurement.

Common deployments include:

- Outdoor and roadside air quality networks
- Indoor environments, schools and offices
- Industrial dust, construction and agriculture monitoring

When comparing devices, weigh:

- Measured size fractions and accuracy range
- Power source and battery life (fans and lasers add draw)
- Enclosure rating (IP) for outdoor use
- Supported regional frequency plans
- Availability of a documented payload codec

Match the size fractions and reporting cadence to your air quality use case.
