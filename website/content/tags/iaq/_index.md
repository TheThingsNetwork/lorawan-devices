---
title: "LoRaWAN IAQ (Indoor Air Quality) Sensors"
linkTitle: "IAQ"
description: "Browse LoRaWAN IAQ sensors that report an indoor air quality index over long-range, low-power networks for healthier buildings."
lede: "LoRaWAN IAQ sensors turn gas and environmental readings into a single indoor air quality index you can track building-wide."
category: "sensor"
related: ["co2", "tvoc", "bvoc", "humidity", "temperature", "particulate-matter"]
faq:
  - q: "What does an IAQ sensor measure?"
    a: "IAQ (Indoor Air Quality) is a composite index. Devices derive it from an onboard gas sensor that responds to volatile organic compounds, often combined with temperature and humidity, and output a single index value that summarizes overall air quality, typically on a scale where lower numbers indicate cleaner air."
  - q: "How do LoRaWAN IAQ sensors send their readings?"
    a: "They sample the air-quality index on a fixed interval and transmit a small encoded payload uplink over LoRaWAN to a gateway and network server. A payload codec on the application side decodes the bytes into a readable IAQ value, usually alongside temperature and humidity."
  - q: "Why use LoRaWAN for indoor air quality monitoring?"
    a: "LoRaWAN combines long indoor range through walls and floors with multi-year battery life on small uplinks, so you can place IAQ sensors across many rooms without wiring or frequent maintenance."
---
IAQ stands for Indoor Air Quality, a single composite index that summarizes how clean the air in a space is. Rather than reporting one gas, an IAQ sensor combines readings from a metal-oxide or VOC gas element, often together with temperature and humidity, into one easy-to-track number.

LoRaWAN IAQ sensors sample on a set interval, encode the index into a compact payload, and transmit it over long-range, low-power radio to a gateway and network server. A payload codec decodes the bytes into the IAQ value plus any companion measurements. Typical uses include:

- Office, school and healthcare ventilation control
- Smart-building wellness and ESG reporting
- Residential and hospitality comfort monitoring

When comparing devices, look at the sensing element and how the index is calculated, reporting interval and battery life, calibration and warm-up behaviour, enclosure rating for the deployment, supported regional frequency plans, and whether a ready-made payload codec is provided. Many IAQ devices also expose raw CO2, TVOC or humidity alongside the index.
