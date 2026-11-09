---
title: "LoRaWAN Smoke Detectors"
linkTitle: "Smoke"
description: "Browse LoRaWAN smoke detectors and sensors that detect smoke and fire, sending alarms over long range with multi-year battery life."
lede: "LoRaWAN smoke detectors sense combustion particles and broadcast fire alarms wirelessly across buildings and remote sites with years of battery life."
category: "sensor"
related: ["co", "temperature", "particulate-matter", "dust", "humidity", "tvoc"]
faq:
  - q: "How does a LoRaWAN smoke detector work?"
    a: "It uses an optical (photoelectric) or ionization sensing chamber to detect smoke particles from combustion. When an alarm triggers, the device transmits an uplink over LoRaWAN to your network server, which can route it to alerting and dashboard systems, often alongside a local audible siren."
  - q: "What is the battery life of a LoRaWAN smoke sensor?"
    a: "Because LoRaWAN uses low-power transmissions and devices stay mostly idle between heartbeat and event uplinks, many smoke detectors run for several years on internal batteries. Actual life depends on uplink frequency, spreading factor, and self-test intervals."
  - q: "Where are LoRaWAN smoke detectors used?"
    a: "They are common in commercial buildings, hotels, warehouses, multi-tenant housing, and remote or hard-to-wire sites where running cabling is costly. Long range and good indoor penetration make them suited to large or distributed estates."
---
Smoke sensing detects the airborne particles produced by combustion, providing early warning of fire. LoRaWAN smoke detectors pair a sensing chamber, typically photoelectric or ionization, with a long-range, low-power radio so alarms reach a central system even from areas without Wi-Fi or wired fire panels.

These devices send periodic heartbeat uplinks to confirm they are alive, plus immediate event uplinks when smoke, tampering, or a low battery is detected. The network server decodes the payload and forwards it to monitoring, alerting, or facility-management platforms. Many units also sound a local siren independent of network connectivity.

Typical deployments include commercial buildings, hotels, warehouses, residential blocks, and remote structures where wiring is impractical.

When comparing devices, weigh:

- Sensing method and certifications relevant to your region
- Battery life, self-test behavior, and tamper detection
- Enclosure rating and operating temperature range
- Supported frequency plans (EU868, US915, AS923, others)
- Documented payload codec for straightforward integration
