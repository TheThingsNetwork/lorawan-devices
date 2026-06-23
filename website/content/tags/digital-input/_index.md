---
title: "LoRaWAN Digital Input Sensors & I/O Devices"
linkTitle: "Digital Input"
description: "Explore LoRaWAN digital input devices that monitor dry contacts, switches, and on/off states wirelessly for remote status and alerting."
lede: "LoRaWAN digital input devices read the on/off state of dry contacts, switches, and sensors, then report status changes over long-range, low-power links."
category: "sensor"
related: ["analog-input", "pulse-count", "reed-switch", "switch", "button", "4-20-ma"]
faq:
  - q: "What does a LoRaWAN digital input device do?"
    a: "It senses the binary state of a connected contact or sensor, open or closed, high or low, and transmits state changes over a LoRaWAN network so you can monitor equipment and trigger alerts remotely."
  - q: "What can I connect to a digital input?"
    a: "Common sources include dry-contact relays, limit and float switches, door and window contacts, push buttons, PIR motion outputs, and the digital outputs of third-party sensors and PLCs."
  - q: "Do digital inputs report immediately on a state change?"
    a: "Many devices send an uplink the moment an input transitions, in addition to periodic heartbeat reports, so alarms and status updates arrive promptly while preserving battery life."
---
A digital input captures a simple binary signal, open or closed, high or low, rather than a measured value. LoRaWAN digital input devices wire to dry contacts, switches, relays, or the logic outputs of other equipment and report the current state wirelessly, making them a versatile bridge between legacy gear and modern IoT dashboards.

These devices typically uplink on a state change and on a fixed heartbeat interval. The decoded payload exposes each channel's state and often a transition counter or timestamp, so backends can flag alarms, log run hours, or detect tamper events.

Typical deployments include facilities and building management, machine status monitoring, door and gate supervision, pump and tank alarms, and utility cabinets in the field.

When comparing options, weigh:

- Number of input channels and isolation type (dry vs. wet)
- Battery life, report intervals, and event-driven uplinks
- Enclosure rating (IP) for indoor or outdoor use
- Supported frequency plans (EU868, US915, AS923, etc.) and the available payload codec
