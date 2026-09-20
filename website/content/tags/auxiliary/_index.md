---
title: "LoRaWAN Auxiliary Sensors and Inputs"
linkTitle: "Auxiliary"
description: "Browse LoRaWAN devices with auxiliary sensing inputs that extend a node with extra measurement and signal channels over long-range networks."
lede: "LoRaWAN devices with auxiliary inputs add supplementary measurement and signal channels so a single node can report more than its primary sensor."
category: "sensor"
related: ["analog-input", "digital-input", "temperature", "pulse-count", "4-20-ma", "battery"]
faq:
  - q: "What does an auxiliary input on a LoRaWAN device do?"
    a: "An auxiliary input is a supplementary channel that lets a node read an extra signal or sensor beyond its main function, such as an attached probe, contact, or analog line. The reading is bundled into the same uplink payload and decoded alongside the device's primary measurements."
  - q: "How do auxiliary readings get reported over LoRaWAN?"
    a: "The device samples each auxiliary channel on a schedule or on an event, encodes the values into a compact LoRaWAN payload, and transmits an uplink. A payload codec on the network or application server maps the raw bytes back to named fields and units."
  - q: "What should I check when choosing a device with auxiliary inputs?"
    a: "Confirm which auxiliary channel types and ranges are supported, the sampling and reporting interval, battery life under your duty cycle, enclosure rating for the environment, supported regional frequency plans, and that a payload decoder is published."
---
An auxiliary input is a supplementary measurement or signal channel on a LoRaWAN node, used to read something beyond the device's primary sensor. Depending on the hardware, that can mean an extra probe, a contact or state line, or a configurable analog or counter channel wired into the same enclosure.

These devices sample each auxiliary channel on a fixed interval or on an event, pack the values into a compact LoRaWAN uplink, and transmit them over a gateway to your network server. A payload codec then decodes the raw bytes into named fields and engineering units, so auxiliary readings arrive alongside the node's main data.

Auxiliary channels are common in industrial monitoring, building and facility automation, and environmental and utility deployments where one node must carry more than a single reading.

When comparing devices, look at:

- Supported auxiliary channel types and measurement ranges
- Sampling and reporting interval, plus battery life at that duty cycle
- Enclosure (IP) rating and supported regional frequency plans
- Whether a documented payload decoder is provided
