---
title: "LoRaWAN Reed Switch Sensors"
linkTitle: "Reed Switch"
description: "Browse LoRaWAN reed switch sensors that detect open/closed state on doors, windows, gates and enclosures, reporting events wirelessly over long range."
lede: "LoRaWAN reed switch sensors detect open and closed states using a magnet, reporting door, window and access events wirelessly over long distances."
category: "sensor"
related: ["hall-effect", "magnetometer", "switch", "proximity", "motion", "tilt"]
faq:
  - q: "What does a LoRaWAN reed switch sensor detect?"
    a: "A reed switch is a magnetically actuated contact. When a paired magnet moves near or away, the contacts open or close, letting the device detect binary states such as door open/closed, window ajar, gate position or enclosure tampering."
  - q: "How does a reed switch sensor report data over LoRaWAN?"
    a: "Most devices send an uplink on each state change and a periodic heartbeat to confirm they are alive. Payloads typically carry the contact state, event counts and battery level, decoded by the device's payload codec."
  - q: "How long do battery-powered reed switch sensors last?"
    a: "Because they sleep until a magnetic event occurs, many run for years on a coin cell or AA batteries. Actual life depends on event frequency, heartbeat interval and the chosen frequency plan."
---
A reed switch is a simple magnetic contact: two ferromagnetic reeds inside a sealed glass tube that open or close when a paired magnet moves near. LoRaWAN devices use this to sense binary open/closed states without contact wear or external power, making them ideal for long-life, event-driven monitoring.

These sensors typically stay in deep sleep and wake on a magnetic transition, sending an uplink the moment a door, window, gate or lid changes state. A scheduled heartbeat confirms the device is healthy. Payloads usually report the current contact state, an event counter and battery voltage, decoded by the manufacturer's codec.

Common uses include access monitoring, intrusion and tamper detection, smart buildings, asset enclosures, cabinets and waste-bin lids. When comparing devices, weigh:

- Battery life, heartbeat interval and event-trigger behaviour
- Enclosure rating (IP) for indoor versus outdoor mounting
- Supported frequency plans (EU868, US915 and others)
- Magnet gap distance and any extra inputs such as tamper

Check the payload codec to confirm clean integration with your application server.
