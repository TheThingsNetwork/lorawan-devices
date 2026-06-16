---
title: "LoRaWAN Pulse Count Sensors"
linkTitle: "Pulse Count"
description: "Browse LoRaWAN pulse count sensors that tally dry-contact and S0 pulses from utility meters and flow meters for remote, battery-powered reads."
lede: "LoRaWAN pulse count sensors tally electrical pulses from meters and switches, turning legacy equipment into wirelessly readable, long-range data sources."
category: "sensor"
related: ["pulse-frequency", "digital-input", "reed-switch", "hall-effect", "energy", "water"]
faq:
  - q: "What does a LoRaWAN pulse count sensor measure?"
    a: "It counts discrete electrical pulses on a digital input — typically dry-contact, open-collector, or S0 outputs from meters. Each pulse represents a fixed unit of consumption, so the accumulated count maps to volume, energy, or events over time."
  - q: "Can I read existing water, gas, or electricity meters with a pulse counter?"
    a: "Yes, if the meter exposes a pulse output (reed switch, S0, or open-collector). The sensor totals pulses and reports the count over LoRaWAN, letting you retrofit legacy meters for remote reading without replacing them."
  - q: "How is pulse count reported and how often?"
    a: "Devices uplink the accumulated count on an interval or threshold, encoded in the payload per the device codec. Counts are cumulative, so a downstream platform derives consumption rate from the difference between successive uplinks."
---
Pulse count sensing tallies discrete electrical pulses on a digital input, where each pulse represents a fixed quantity such as a liter of water, a watt-hour of energy, or a single event. LoRaWAN pulse counters connect to dry-contact, reed-switch, open-collector, or S0 meter outputs and maintain a running total in the device.

Devices report the accumulated count in their uplink payload, on a scheduled interval or when a threshold is crossed. Because counts are cumulative, consumption rate is calculated downstream from the difference between successive readings. This makes pulse counters ideal for retrofitting legacy water, gas, and electricity meters, plus production and flow counters in utilities, facilities, and industry.

When comparing pulse count devices, look at:

- Input type and maximum pulse frequency, plus debounce handling
- Counter resolution and whether the total survives power cycles
- Battery life, enclosure rating (IP), and number of inputs
- Supported frequency plans and an available payload codec

Match the input electrical characteristics to your meter before deploying.
