---
title: "LoRaWAN Occupancy Sensors"
linkTitle: "Occupancy"
description: "Browse LoRaWAN occupancy sensors that detect whether a room, desk, or space is in use, reporting presence over long-range, low-power wireless."
lede: "LoRaWAN occupancy sensors detect whether a space is in use and report presence wirelessly over long range with multi-year battery life."
category: "sensor"
related: ["pir", "motion", "radar", "co2", "light", "temperature"]
faq:
  - q: "How do LoRaWAN occupancy sensors detect presence?"
    a: "Most use a PIR (passive infrared), radar/mmWave, or thermopile element to sense people in a defined zone. The sensor processes detections locally and transmits an occupied or vacant state, often with counts or dwell time, as a LoRaWAN uplink."
  - q: "What is the battery life of a LoRaWAN occupancy sensor?"
    a: "Because devices sleep between events and send only short uplinks on occupancy changes, many run for several years on internal batteries. Actual life depends on traffic density, reporting interval, spreading factor, and detection technology."
  - q: "What is the difference between occupancy and motion sensing?"
    a: "Motion sensors register movement, so they can report vacant when occupants are still. Occupancy sensors aim to report a space as in use even with little movement, often using radar or smarter dwell logic to hold the occupied state."
---
Occupancy sensing answers a simple question: is this space currently in use? LoRaWAN occupancy sensors detect the presence of people in a room, at a desk, in a meeting pod, or across a defined zone, then report an occupied or vacant state. Depending on the technology, they may also add people counts, dwell time, or last-seen timestamps.

These devices typically use passive infrared (PIR), radar/mmWave, or thermopile detection. The sensor evaluates presence locally and sends a compact LoRaWAN uplink on state changes plus periodic heartbeats, keeping airtime and power consumption low. A decoded payload is delivered through the network server for use in dashboards and automations.

Common applications include smart-building space utilization, desk and meeting-room booking, washroom servicing, retail footfall, and HVAC or lighting control.

When comparing devices, consider:

- Detection method, coverage angle, and range
- Power source and expected battery life
- Mounting style and enclosure (IP) rating
- Supported frequency plans and the payload codec
