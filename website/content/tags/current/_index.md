---
title: "LoRaWAN Current Sensors"
linkTitle: "Current"
description: "Browse LoRaWAN current sensors that measure electrical current (amps) and report readings wirelessly for energy and equipment monitoring."
lede: "LoRaWAN current sensors measure the electrical current flowing through a circuit and report amperage readings over long-range, low-power wireless links."
category: "sensor"
related: ["energy", "power", "voltage", "pulse-count", "analog-input", "4-20-ma"]
faq:
  - q: "How do LoRaWAN current sensors measure current?"
    a: "Most use a clamp-on current transformer (CT) or Rogowski coil placed around a conductor to measure AC current without breaking the circuit. The device samples the reading, encodes amperage in its payload, and transmits it over LoRaWAN at a configurable interval."
  - q: "Do I need to wire a current sensor inline?"
    a: "Usually no. Split-core CT clamps install around an existing cable without cutting it, which simplifies retrofits. Some sensors use shunt or inline inputs instead, so check the measurement method and the supported current range before choosing."
  - q: "What should I check when choosing a LoRaWAN current sensor?"
    a: "Compare the measurable current range and accuracy, the number of CT channels, AC versus DC support, power source and battery life, enclosure rating, supported regional frequency plans, and whether a payload decoder is provided."
---
Current sensing measures the electrical current, in amperes, flowing through a conductor. LoRaWAN current sensors most often use a split-core current transformer (CT) or Rogowski coil that clamps around a cable, letting you meter a circuit without rewiring it. The device samples the current, encodes the reading into a compact payload, and sends it over a long-range, low-power LoRaWAN link to a gateway and network server, where a codec turns the bytes into usable values.

These sensors support a wide range of monitoring tasks:

- Tracking machine and motor load to flag faults or downtime
- Sub-metering circuits, panels, and tenants for energy allocation
- Detecting equipment on/off state and abnormal draw

When comparing devices, look at the measurable current range and accuracy, number of CT channels, AC versus DC support, and reporting interval. Also weigh power source and battery life, enclosure rating for the install environment, supported regional frequency plans, and whether a ready-made payload decoder ships with the device.
