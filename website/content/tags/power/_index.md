---
title: "LoRaWAN Power Sensors"
linkTitle: "Power"
description: "Browse LoRaWAN power sensors and meters that measure active, reactive, and apparent power (W, kW) and report consumption wirelessly."
lede: "LoRaWAN power sensors measure real-time electrical power draw and report it wirelessly for energy monitoring, sub-metering, and load management."
category: "sensor"
related: ["energy", "current", "voltage", "pulse-count", "analog-input", "4-20-ma"]
faq:
  - q: "What does a LoRaWAN power sensor measure?"
    a: "A power sensor reports instantaneous electrical power, typically active power in watts or kilowatts, and many also derive reactive power (VAR), apparent power (VA), and power factor from measured current and voltage."
  - q: "How is a power sensor different from an energy meter?"
    a: "A power sensor reports the instantaneous rate of consumption (W/kW) at each interval, while an energy meter accumulates total usage over time (kWh). Many LoRaWAN devices report both."
  - q: "How are LoRaWAN power sensors installed?"
    a: "Most use clamp-on current transformers (CTs) around conductors plus a voltage reference, avoiding the need to break the circuit. CT-based designs suit retrofits in panels and distribution boards."
---
Power sensing measures the instantaneous rate at which electrical energy is consumed or supplied, usually as active power in watts (W) or kilowatts (kW). Many devices also derive reactive power (VAR), apparent power (VA), and power factor by combining measured current and voltage.

A LoRaWAN power sensor samples current, often through clamp-on current transformers (CTs), alongside a voltage reference, computes power values on-device, and transmits compact readings over long-range, low-power radio at scheduled intervals. This makes panel-level and circuit-level monitoring practical without continuous wiring back to a gateway.

Typical uses include building sub-metering, machine load monitoring, solar and renewable feed measurement, demand management, and spotting abnormal draw before faults occur.

When comparing devices, check:

- CT rating and measurement accuracy class
- Single- versus three-phase support
- Reporting interval and battery or mains power
- Enclosure rating (IP) for panel mounting
- Supported regional frequency plans and payload codec

Match the CT range and phase configuration to your installation for reliable readings.
