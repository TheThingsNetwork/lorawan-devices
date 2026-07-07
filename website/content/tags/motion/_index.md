---
title: "LoRaWAN Motion Sensors"
linkTitle: "Motion"
description: "Browse LoRaWAN motion sensors in the Device Repository. Compare detection range, battery life, IP rating, and frequency plans for occupancy and security."
lede: "LoRaWAN motion sensors detect movement in a space and report events wirelessly over long-range, low-power networks."
category: "sensor"
related: ["pir", "occupancy", "radar", "proximity", "accelerometer", "light"]
faq:
  - q: "How do LoRaWAN motion sensors detect movement?"
    a: "Most use a passive infrared (PIR) element that senses heat changes from moving people; some use microwave or radar detection. When motion is detected, the device sends an uplink over LoRaWAN reporting the event, often with a count or occupancy state."
  - q: "How long do the batteries last in a LoRaWAN motion sensor?"
    a: "Because LoRaWAN is low-power and devices typically transmit only on motion events or periodic heartbeats, many battery-powered units last several years. Actual life depends on trigger frequency, reporting interval, and frequency plan."
  - q: "Can LoRaWAN motion sensors be used outdoors?"
    a: "Some can, provided they have a weatherproof enclosure (check the IP rating). Detection range, mounting height, and field of view vary by model, so match the sensor's coverage pattern to your space."
---
Motion sensing detects when something moves within a monitored area. LoRaWAN motion sensors most often use a passive infrared (PIR) element to register the heat signature of moving people or animals, while some rely on microwave or radar techniques. Instead of streaming raw data, the device fires an uplink when motion is detected and frequently includes extras like an occupancy flag, trigger count, or a periodic heartbeat to confirm it is alive.

These devices are popular for smart-building and facilities use cases:

- Occupancy and presence detection for lighting, HVAC, and meeting-room control
- Security, intrusion, and after-hours monitoring
- Footfall and space-utilization analytics

LoRaWAN's long range and low power let a single gateway cover many sensors, and battery life often stretches to years.

When comparing options, weigh detection range and field of view, mounting height, battery life, enclosure rating (IP), supported regional frequency plans, and whether a ready-made payload codec is provided for your network server.
