---
title: "LoRaWAN PIR Motion Sensors"
linkTitle: "PIR Motion"
description: "Browse LoRaWAN PIR motion sensors that detect human presence and movement via infrared, with long battery life and wireless reporting."
lede: "PIR motion sensors use passive infrared to detect people and movement, reporting occupancy events over long-range, low-power LoRaWAN."
category: "sensor"
related: ["motion", "occupancy", "infrared", "proximity", "radar", "light"]
faq:
  - q: "How does a LoRaWAN PIR sensor detect motion?"
    a: "A passive infrared (PIR) element senses changes in infrared heat radiated by people or animals moving across its field of view. When motion is detected, the device sends an uplink over LoRaWAN reporting the event, and many also count or timestamp triggers."
  - q: "What is the battery life of a LoRaWAN PIR sensor?"
    a: "Because PIR detection is passive and uplinks are short and infrequent, battery life is typically measured in years. Actual longevity depends on trigger frequency, reporting interval, hold-off timers, and the LoRaWAN frequency plan and spreading factor used."
  - q: "Where are LoRaWAN PIR motion sensors used?"
    a: "They are common in occupancy monitoring, smart lighting control, security and intrusion alerts, restroom and meeting-room usage, and footfall sensing in offices, retail, and public buildings."
---
Passive infrared (PIR) sensing detects motion by registering changes in the infrared heat naturally emitted by people and animals as they cross the sensor's field of view. Unlike active sensors, a PIR element emits nothing itself, which keeps power draw very low and makes it well suited to battery devices.

A LoRaWAN PIR sensor wakes on a detected event, then transmits a short uplink reporting the trigger. Many add event counters, occupancy state, hold-off windows to suppress repeat firings, and periodic heartbeat messages. Typical applications include smart lighting, room and desk occupancy, security and intrusion alerts, and footfall analytics across offices, retail, and public facilities.

When comparing devices, weigh:

- Detection range, field of view, and sensitivity or pet-immunity tuning
- Battery life versus reporting and hold-off configuration
- Enclosure rating (IP) for indoor or outdoor mounting
- Supported regional frequency plans (EU868, US915, AS923, and others)
- An available payload codec for straightforward integration

Check each device page for detailed specifications and supported regions.
