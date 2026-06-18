---
title: "LoRaWAN Switch Sensors"
linkTitle: "Switch"
description: "Browse LoRaWAN switch sensors that report open/closed and on/off states wirelessly for doors, equipment, and remote monitoring at range."
lede: "LoRaWAN switch sensors detect open/closed or on/off states and report each transition wirelessly, so you can monitor doors, equipment, and contacts remotely."
category: "sensor"
related: ["reed-switch", "digital-input", "button", "hall-effect", "occupancy", "pulse-count"]
faq:
  - q: "What does a LoRaWAN switch sensor measure?"
    a: "A switch sensor reports a discrete binary state: open or closed, on or off. It detects the position of a mechanical or magnetic contact and signals each change, rather than a continuous analog value like temperature or humidity."
  - q: "How does a LoRaWAN switch sensor report state changes?"
    a: "Most devices send an uplink on each transition (and often a periodic heartbeat) over LoRaWAN. The payload encodes the current state; a decoder/codec on your network server translates it into a readable open/closed or on/off value."
  - q: "How long do batteries last in a LoRaWAN switch sensor?"
    a: "Because they transmit only on state changes plus occasional heartbeats, many switch sensors run for years on a coin cell or AA batteries. Actual life depends on switching frequency, heartbeat interval, and spreading factor."
---
A switch capability reports a **discrete binary state** rather than a continuous measurement: open or closed, on or off, contact made or broken. Devices typically wrap a mechanical, magnetic (reed or Hall-effect), or dry-contact input, making them ideal for tracking the position of doors, lids, valves, cabinets, machine guards, and external relays.

LoRaWAN switch sensors are event-driven. They send an uplink the moment the state changes, usually alongside a periodic heartbeat so you can confirm the device is alive. The payload encodes the current state and is translated by a codec on your network server. Because traffic is sparse, these sensors suit LoRaWAN's long range and low power profile.

Common uses include access and intrusion monitoring, asset and tamper detection, equipment runtime, and industrial status indication.

When comparing devices, weigh:

- Input type (reed, dry contact, Hall-effect) and number of channels
- Battery life versus heartbeat interval and switching frequency
- Enclosure/IP rating for outdoor or harsh sites
- Supported frequency plans and an available payload codec
