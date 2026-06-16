---
title: "LoRaWAN Proximity Sensors"
linkTitle: "Proximity"
description: "Browse LoRaWAN proximity sensors that detect nearby objects and report presence or near/far state wirelessly over long-range, low-power networks."
lede: "LoRaWAN proximity sensors detect whether an object is within a set range and report presence or near/far state over long-range, low-power wireless."
category: "sensor"
related: ["distance", "motion", "occupancy", "radar", "infrared", "pir"]
faq:
  - q: "What is the difference between a proximity sensor and a distance sensor?"
    a: "A proximity sensor reports whether an object is present within a threshold range, typically as a near/far or detected/clear state. A distance sensor reports the measured separation as an actual value such as centimeters or meters. Some LoRaWAN devices expose both."
  - q: "How do LoRaWAN proximity sensors send data?"
    a: "They detect a nearby object using technologies such as infrared, ultrasonic, inductive, capacitive, or radar sensing, then transmit a small encoded payload over LoRaWAN. A payload codec on the network server decodes it into presence state or range values."
  - q: "How long do battery-powered LoRaWAN proximity sensors last?"
    a: "Battery life depends on reporting interval, detection events, and sensing technology. Many run for years on the device's batteries by sending compact uplinks and sleeping between detections."
---
Proximity sensing detects whether an object is present within a defined range without physical contact. Unlike a continuous distance reading, a proximity sensor typically reports a discrete state, such as detected or clear, or a coarse near/far indication, making it useful wherever you need to know if something is there rather than exactly how far away.

LoRaWAN proximity sensors detect objects using technologies like infrared, ultrasonic, capacitive, inductive, or radar, then send a compact uplink over long-range, low-power wireless. A payload codec on the network server decodes each message into a presence state, and many devices also send periodic heartbeats and battery status.

These sensors are common in:

- Asset and bin presence monitoring, parking-bay occupancy, and access points
- Industrial automation, machinery guarding, and smart-building controls

When comparing devices, look at detection range and accuracy, sensing technology and target materials, battery life and reporting interval, enclosure rating for the deployment site, supported regional frequency plans, and whether the payload codec is documented.
