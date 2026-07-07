---
title: "LoRaWAN Dissolved Oxygen Sensors"
linkTitle: "Dissolved Oxygen"
description: "Browse LoRaWAN dissolved oxygen (DO) sensors for water quality monitoring. Compare accuracy, battery life, and frequency plans."
lede: "LoRaWAN dissolved oxygen sensors report DO concentration in water over long-range, low-power links for remote water quality monitoring."
category: "sensor"
related: ["ph", "conductivity", "turbidity", "salinity", "temperature", "water"]
faq:
  - q: "What does a LoRaWAN dissolved oxygen sensor measure?"
    a: "It measures the concentration of oxygen dissolved in water, typically reported in mg/L (or ppm) and often as percent saturation. Many probes also report water temperature, which is used to compensate the DO reading."
  - q: "What probe technologies are used for dissolved oxygen?"
    a: "Two common methods are optical (luminescent/fluorescence) and electrochemical (galvanic or polarographic). Optical probes generally need less maintenance and no membrane or electrolyte replacement, while electrochemical probes are a long-established, lower-cost option."
  - q: "How often can a battery-powered LoRaWAN DO sensor report?"
    a: "Reporting intervals are usually configurable, from minutes to hours. Longer intervals and duty-cycle limits on your frequency plan extend battery life, so match the interval to how quickly oxygen levels change at your site."
---
Dissolved oxygen (DO) sensing measures how much oxygen is present in water, a core indicator of water quality and aquatic health. Readings are typically expressed in milligrams per litre (mg/L) or as percent saturation, and because solubility depends on temperature, salinity, and pressure, most probes pair the DO element with a temperature sensor for compensation.

A LoRaWAN dissolved oxygen device samples the probe on a set schedule, applies compensation, and transmits a compact payload to a nearby gateway. The long range and low power of LoRaWAN suit unattended deployments at lakes, rivers, reservoirs, wastewater plants, and aquaculture ponds where wired power and cellular coverage are scarce.

When comparing devices, look at:

- Measurement range and accuracy, plus probe type (optical vs. electrochemical) and calibration needs
- Battery life against your reporting interval and duty cycle
- Enclosure and probe IP rating for submersion
- Supported frequency plans (EU868, US915, AS923, and others) and the payload codec for decoding
