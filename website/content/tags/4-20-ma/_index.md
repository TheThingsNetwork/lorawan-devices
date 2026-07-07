---
title: "LoRaWAN 4-20 mA Sensors and Transmitters"
linkTitle: "4–20 mA"
description: "Browse LoRaWAN 4-20 mA sensors and transmitters that read industrial current-loop signals and report them wirelessly over long range."
lede: "LoRaWAN 4-20 mA devices read industrial current-loop signals from analog transmitters and send the measured values wirelessly over long range."
category: "sensor"
related: ["analog-input", "current", "voltage", "pulse-count", "digital-input", "level"]
faq:
  - q: "What is a LoRaWAN 4-20 mA sensor used for?"
    a: "It interfaces with industrial transmitters that output a 4-20 mA current-loop signal, such as pressure, level, flow, or temperature transmitters, and converts that analog reading into a LoRaWAN uplink. This lets existing 4-20 mA instrumentation report wirelessly without wired SCADA cabling."
  - q: "How is the 4-20 mA value sent over LoRaWAN?"
    a: "The device samples the loop current, scales it against its configured range, and transmits the value in an uplink payload on a schedule or threshold. A payload codec on the network server decodes the bytes back into the engineering units you configured."
  - q: "Can these devices power the 4-20 mA loop?"
    a: "Some battery-powered units provide loop excitation to drive a passive transmitter, while others expect an externally powered loop. Check whether the device sources the loop, its compliance voltage, and how loop power affects battery life."
---
The 4-20 mA current loop is a long-standing industrial signaling standard where a transmitter represents a measurement as a current between 4 mA (low end of range) and 20 mA (full scale). Because the signal is current-based, it resists noise and voltage drop over long cable runs, making it common across process and utility instrumentation.

A LoRaWAN 4-20 mA device reads one or more analog inputs, scales the current against a configured range, and sends the value in an uplink payload. This brings legacy or remote 4-20 mA transmitters onto a wireless network without trenching cable to a control room.

Typical deployments include water and wastewater (level, pressure, flow), tank and silo monitoring, HVAC, agriculture, and remote industrial assets. When comparing devices, look at:

- Number of channels and supported current/voltage input ranges
- Measurement accuracy, resolution, and loop power capability
- Battery life under your reporting interval and loop excitation
- Enclosure rating (IP/NEMA) and supported frequency plans
- Configurable reporting, thresholds, and payload codec
