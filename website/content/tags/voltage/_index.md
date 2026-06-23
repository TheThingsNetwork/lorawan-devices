---
title: "LoRaWAN Voltage Sensors"
linkTitle: "Voltage"
description: "Browse LoRaWAN voltage sensors and analog monitors that measure DC or AC voltage and report readings wirelessly over long range."
lede: "LoRaWAN voltage sensors measure electrical potential and transmit readings wirelessly, enabling remote monitoring of batteries, panels, and equipment."
category: "sensor"
related: ["current", "power", "energy", "analog-input", "battery", "4-20-ma"]
faq:
  - q: "What does a LoRaWAN voltage sensor measure?"
    a: "It measures electrical potential difference, typically in volts, across a DC or AC input. The device converts the reading and transmits it over LoRaWAN so you can track voltage remotely without running long data cables back to a controller."
  - q: "What is the difference between a voltage sensor and a current sensor?"
    a: "A voltage sensor measures electrical potential (volts) at a point, while a current sensor measures the flow (amps). Many devices report both, plus power and energy, for a fuller picture of an electrical circuit."
  - q: "How long do battery-powered LoRaWAN voltage sensors last?"
    a: "Battery life depends on reporting interval, payload size, and frequency plan. Less frequent transmissions and adaptive data rate extend it, with some devices running for years on a single battery."
---
Voltage sensing measures the electrical potential difference, expressed in volts, across a DC or AC input. A LoRaWAN voltage sensor digitizes that reading and transmits it wirelessly over long range to a gateway, which forwards it to your network server and application. Because LoRaWAN is low-power and long-range, these devices monitor voltage where running data cables or mains power is impractical.

Typical uses include tracking battery banks and backup supplies, watching solar-panel and DC bus output, verifying generator or transformer health, and flagging brownouts or overvoltage on remote equipment. Voltage data is often paired with current readings to derive power and energy.

When comparing devices, check:

- Input range and measurement accuracy for your DC or AC application
- Power source and battery life versus reporting interval
- Enclosure rating (IP) for the install environment
- Supported regional frequency plans (EU868, US915, AS923 and others)
- Available payload codec or decoder for your platform

Match the input range to your expected voltage and confirm the codec decodes cleanly on your network server.
